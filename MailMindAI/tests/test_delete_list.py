"""Delete list (opt-in auto-trash): validation, protections, approval, runs, undo, API."""
from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from backend.cleanup import delete_list as dl
from backend.db import models as m
from backend.db.repo import set_setting
from backend.db.session import session_factory
from backend.gmail.fixture_source import FixtureGmailSource
from backend.gmail.writer import GmailTrashWriter
from backend.sample_data import load
from backend.sync.engine import SyncEngine, SyncProgress
from backend.sync.post import post_sync

H = {"X-MailMind-Request": "1"}
NEWS = "news@weeklydigest.example"


@pytest.fixture()
def env(db_url):
    """Synthetic mailbox synced through a fixture source that also acts as the Trash writer."""
    from backend.config import get_settings
    from backend.sample_data import seed_rules
    from backend.db.session import run_migrations

    run_migrations(db_url)
    src = FixtureGmailSource()
    factory = session_factory(db_url)
    with factory() as s:
        seed_rules(s, src.rules)
    SyncEngine(src, factory, get_settings(), post_process=post_sync, progress=SyncProgress()).run("full")
    s = factory()
    yield src, factory, s
    s.close()


def add(s, pattern=NEWS, days=7, approve=True):
    r = m.DeleteRule(pattern=dl.validate_delete_pattern(s, pattern), older_than_days=days)
    s.add(r)
    s.flush()
    if approve:
        dl.approve(s, r, len(dl.matching(s, r)[0]))
    s.commit()
    return r


def gids(s, addr=NEWS):
    return set(s.scalars(select(m.Email.gmail_id).where(m.Email.from_addr == addr)))


# ------------------------------------------------------------------ validation & protections
@pytest.mark.parametrize("pattern,msg", [("@gmail.com", "every"), ("alex.morgan@example.com", "own"),
                                         ("@example.com", "own"), ("not an address", "Address pattern")])
def test_dangerous_patterns_refused(env, pattern, msg):
    _, _, s = env
    with pytest.raises(ValueError, match=msg):
        dl.validate_delete_pattern(s, pattern)


def test_preview_respects_age_and_protections(env):
    _, _, s = env
    starred = s.scalar(select(m.Email).where(m.Email.gmail_id == "m008"))
    starred.label_ids = [*starred.label_ids, "STARRED"]
    s.commit()
    r = add(s, approve=False)
    p = dl.preview(s, r)
    assert p["count"] == 2  # m007, m009 (m006 is 1 day old, m008 starred)
    assert p["protected"] == {"starred/important": 1}
    mgr = add(s, "priya.shah@example.com", days=0, approve=False)
    assert dl.preview(s, mgr)["count"] == 0
    # every Priya email already in the past is protected (important label / manager rule); the
    # fixture stamps one email "today 09:00", which is still in the future before 9 am
    from backend.db.models import utcnow
    past = s.scalar(select(func.count()).select_from(m.Email).where(
        m.Email.from_addr == "priya.shah@example.com", m.Email.internal_date < utcnow()))
    assert past >= 1
    assert sum(dl.preview(s, mgr)["protected"].values()) == past


def test_approval_must_match_preview(env):
    _, _, s = env
    r = add(s, approve=False)
    with pytest.raises(dl.DeleteListError, match="changed"):
        dl.approve(s, r, 99)
    assert r.approved_at is None


# ------------------------------------------------------------------ runs
def test_run_trashes_old_matching_mail_and_updates_cache(env):
    src, factory, s = env
    add(s)
    res = dl.run_rules(factory, src, "manual")
    assert res["status"] == "completed" and res["trashed"] == 3
    assert set(src.trashed) == {"m007", "m008", "m009"}
    s.expire_all()
    assert gids(s) == {"m006"}  # recent one kept, locally and in Gmail
    assert "m006" in src.messages
    assert dl.run_rules(factory, src, "manual")["trashed"] == 0  # idempotent
    acts = {a.action for a in s.scalars(select(m.AuditLog))}
    assert {"delete_rule.approve", "delete_run.start", "delete_run.completed"} <= acts


def test_unapproved_disabled_or_paused_rules_never_run(env):
    src, factory, s = env
    r = add(s, approve=False)
    assert dl.run_rules(factory, src, "manual")["status"] == "skipped"
    dl.approve(s, r, len(dl.matching(s, r)[0]))
    r.enabled = False
    s.commit()
    assert dl.run_rules(factory, src, "manual")["status"] == "skipped"
    r.enabled = True
    set_setting(s, "auto_delete_paused", True)
    s.commit()
    assert dl.run_rules(factory, src, "manual")["reason"] == "delete list is paused"
    assert not src.trashed


def test_cap_per_run(env, monkeypatch):
    from backend.config import get_settings
    src, factory, s = env
    monkeypatch.setenv("MAILMIND_MAX_TRASH_PER_RUN", "2")
    get_settings.cache_clear()
    add(s)
    res = dl.run_rules(factory, src, "manual")
    assert res["trashed"] == 2 and res["remaining"] == 1
    assert dl.run_rules(factory, src, "manual")["trashed"] == 1


def test_gmail_failures_recorded(env):
    src, factory, s = env
    add(s)
    src.fail_get = {"m007"}
    src.messages.pop("m009")  # already gone in Gmail
    res = dl.run_rules(factory, src, "manual")
    assert res["status"] == "partial" and res["trashed"] == 1 and res["failed"] == 2
    s.expire_all()
    assert "m007" in gids(s)  # failed trash -> local copy kept


def test_undo_restores_gmail_and_cache(env):
    src, factory, s = env
    add(s)
    run_id = dl.run_rules(factory, src, "manual")["run_id"]
    out = dl.undo_run(factory, src, src, run_id)
    assert out == {"run_id": run_id, "restored": 3, "failed": 0}
    assert not src.trashed and {"m007", "m008", "m009"} <= set(src.messages)
    s.expire_all()
    assert gids(s) == {"m006", "m007", "m008", "m009"}
    assert s.get(m.DeleteRun, run_id).status == "undone"


def test_writer_can_only_trash_and_untrash():
    public = {n for n in dir(GmailTrashWriter) if not n.startswith("_")}
    assert public == {"trash", "untrash"}


# ------------------------------------------------------------------ API
@pytest.fixture()
def api(env, db_url):
    from backend.api.app import create_app

    src, factory, s = env
    app = create_app(db_url, source_factory=lambda: src, writer_factory=lambda: src)
    app.state.trash_enabled_override = True
    with TestClient(app, base_url="http://127.0.0.1:8765") as c:
        yield c, app, src, s


def wait(app):
    t = getattr(app.state, "delete_thread", None)
    if t:
        t.join(10)


def test_api_add_preview_approve_run_undo(api):
    c, app, src, s = api
    assert c.post("/api/delete-list/rules", json={"pattern": "@gmail.com"}, headers=H).status_code == 422
    r = c.post("/api/delete-list/rules", json={"pattern": NEWS, "older_than_days": 7}, headers=H).json()
    rid, count = r["rule"]["id"], r["preview"]["count"]
    assert count == 3 and not r["rule"]["approved"] and len(r["preview"]["sample"]) == 3
    assert c.post(f"/api/delete-list/rules/{rid}/approve", json={"seen_count": 1}, headers=H).status_code == 409
    assert c.post(f"/api/delete-list/rules/{rid}/approve", json={"seen_count": count}, headers=H).json()["started"]
    wait(app)
    ov = c.get("/api/delete-list").json()
    assert ov["runs"][0]["trashed"] == 3 and ov["rules"][0]["total_trashed"] == 3
    items = c.get(f"/api/delete-list/runs/{ov['runs'][0]['id']}").json()["items"]
    assert {i["gmail_id"] for i in items} == {"m007", "m008", "m009"}
    assert c.post(f"/api/delete-list/runs/{ov['runs'][0]['id']}/undo", headers=H).status_code == 202
    wait(app)
    assert c.get("/api/delete-list").json()["runs"][0]["status"] == "undone"


def test_api_requires_cleanup_mode(api):
    c, app, src, s = api
    app.state.trash_enabled_override = False
    rid = c.post("/api/delete-list/rules", json={"pattern": NEWS}, headers=H).json()["rule"]["id"]
    r = c.post(f"/api/delete-list/rules/{rid}/approve", json={"seen_count": 3}, headers=H)
    assert r.status_code == 409 and "EnableCleanup" in r.json()["detail"]
    assert not src.trashed


def test_changing_age_requires_reapproval(api):
    c, app, src, s = api
    rid = c.post("/api/delete-list/rules", json={"pattern": NEWS}, headers=H).json()["rule"]["id"]
    c.post(f"/api/delete-list/rules/{rid}/approve", json={"seen_count": 3}, headers=H)
    wait(app)
    out = c.patch(f"/api/delete-list/rules/{rid}", json={"older_than_days": 0}, headers=H).json()
    assert out["approved"] is False


def test_runs_automatically_after_sync(api):
    c, app, src, s = api
    rid = c.post("/api/delete-list/rules", json={"pattern": NEWS}, headers=H).json()["rule"]["id"]
    c.put("/api/delete-list/pause", json={"paused": True}, headers=H)
    c.post(f"/api/delete-list/rules/{rid}/approve", json={"seen_count": 3}, headers=H)
    wait(app)
    assert not src.trashed  # paused: approval run skipped
    c.put("/api/delete-list/pause", json={"paused": False}, headers=H)
    assert c.post("/api/sync", json={"mode": "incremental"}, headers=H).status_code == 202
    for _ in range(200):
        if not c.get("/api/sync/status").json()["progress"]["running"] and src.trashed:
            break
        time.sleep(0.05)
    assert set(src.trashed) == {"m007", "m008", "m009"}
    assert c.get("/api/delete-list").json()["runs"][0]["trigger"] == "after_sync"


def test_mcp_has_no_trash_capability():
    from pathlib import Path
    import inspect
    from backend.mcp_server import server

    src = Path(inspect.getsourcefile(server)).read_text("utf-8")
    assert "delete_list" not in src and "writer" not in src and "trash" not in src.lower()
