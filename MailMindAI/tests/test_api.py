"""Phase 5: dashboard API (FastAPI) - real database, synthetic data."""
from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from backend.db import models as m
from backend.db.session import session_factory
from backend.gmail.fixture_source import FixtureGmailSource
from backend.sample_data import load

H = {"X-MailMind-Request": "1"}


@pytest.fixture()
def client(db_url):
    assert load(db_url)["status"] == "completed"
    from backend.api.app import create_app

    app = create_app(db_url, source_factory=lambda: FixtureGmailSource(), static_dir=None)
    with TestClient(app, base_url="http://127.0.0.1:8765") as c:
        yield c


def _id(db_url, gid):
    with session_factory(db_url)() as s:
        return s.scalar(select(m.Email.id).where(m.Email.gmail_id == gid))


def test_health_and_security_headers(client):
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"
    assert "default-src 'self'" in r.headers["content-security-policy"]
    assert r.headers["x-frame-options"] == "DENY"


def test_overview_matches_database(client, db_url):
    o = client.get("/api/stats/overview").json()
    with session_factory(db_url)() as s:
        assert o["emails_total"] == s.scalar(select(func.count(m.Email.id))) == 17
        assert o["needs_reply"] == s.scalar(select(func.count(m.Thread.id)).where(m.Thread.status == "needs_reply"))
        assert o["unread"] == s.scalar(select(func.count(m.Email.id)).where(m.Email.is_unread.is_(True)))
    assert o["sync"]["account"] == "alex.morgan@example.com"
    assert sum(d["count"] for d in o["per_day"]) == 17
    assert o["pending_cleanup"] >= 1


@pytest.mark.parametrize("params,expected", [
    ({"category": "newsletter"}, {"m006", "m007", "m008", "m009"}),
    ({"status": "awaiting_reply"}, {"m002"}),
    ({"sender": "priya"}, {"m001", "m017"}),
    ({"domain": "personal", "category": "personal"}, {"m012"}),
    ({"project": "Turbine Retrofit"}, {"m002", "m017"}),
])
def test_email_filters(client, params, expected):
    items = client.get("/api/emails", params=params | {"page_size": 200}).json()["items"]
    assert {i["gmail_id"] for i in items} == expected


def test_importance_and_date_filters(client):
    high = client.get("/api/emails", params={"importance": "high"}).json()["items"]
    assert high and all(i["classification"]["importance_level"] == "high" for i in high)
    r = client.get("/api/emails", params={"date_from": "2000-01-01", "date_to": "2000-01-02"}).json()
    assert r["total"] == 0
    assert client.get("/api/emails", params={"date_from": "not-a-date"}).status_code == 422
    assert client.get("/api/emails", params={"importance": "bogus"}).status_code == 422


def test_pagination(client):
    p1 = client.get("/api/emails", params={"page_size": 5, "page": 1}).json()
    p2 = client.get("/api/emails", params={"page_size": 5, "page": 2}).json()
    assert p1["total"] == 17 and len(p1["items"]) == 5
    assert not {i["id"] for i in p1["items"]} & {i["id"] for i in p2["items"]}


def test_like_wildcards_are_escaped(client):
    assert client.get("/api/emails", params={"sender": "%"}).json()["total"] == 0


def test_email_detail_has_gmail_link_and_safe_body(client, db_url):
    d = client.get(f"/api/emails/{_id(db_url, 'm006')}").json()
    assert d["gmail_url"] == "https://mail.google.com/mail/u/0/#all/m006"
    assert "<script" not in (d["body_text"] or "") and "alert" not in d["body_text"]
    d1 = client.get(f"/api/emails/{_id(db_url, 'm001')}").json()
    assert d1["attachments"][0]["filename"] == "vendor_quote.pdf"
    assert d1["actions"] and d1["reasons"]
    assert client.get("/api/emails/999999").status_code == 404


def test_thread_detail(client, db_url):
    e = client.get(f"/api/emails/{_id(db_url, 'm003')}").json()
    t = client.get(f"/api/threads/{e['thread_id']}").json()
    assert t["status"] == "completed" and [x["gmail_id"] for x in t["emails"]] == ["m003", "m004", "m005"]


def test_intelligence_views(client):
    w = client.get("/api/intelligence/work").json()
    assert {t["gmail_thread_id"] for t in w["needs_reply"]} >= {"t001", "t015"}
    assert any(p["name"] == "Project Atlas" for p in w["projects"])
    p = client.get("/api/intelligence/personal").json()
    assert {t["gmail_thread_id"] for t in p["needs_reply"]} == {"t010"}


def test_fulltext_search(client):
    r = client.get("/api/search", params={"q": "turbine"}).json()
    assert {i["gmail_id"] for i in r["items"]} == {"m002", "m017"}
    assert "[[" in r["items"][0]["match"]
    assert client.get("/api/search", params={"q": 'postgre'}).json()["items"]  # prefix match
    for evil in ['"unterminated', "NEAR(a b", "* OR *", "a AND -"]:
        assert client.get("/api/search", params={"q": evil}).status_code == 200


def test_actions_and_followups(client):
    acts = client.get("/api/actions").json()
    assert any("budget report" in a["description"] for a in acts)
    a = acts[0]
    r = client.patch(f"/api/actions/{a['id']}", json={"status": "done"}, headers=H)
    assert r.status_code == 200 and r.json()["status"] == "done"
    assert client.patch(f"/api/actions/{a['id']}", json={"status": "weird"}, headers=H).status_code == 422
    fus = client.get("/api/followups").json()
    assert {f["kind"] for f in fus} == {"needs_reply", "awaiting_reply"}
    assert client.patch(f"/api/followups/{fus[0]['id']}", json={"status": "dismissed"}, headers=H).json()["status"] == "dismissed"


def test_csrf_and_host_protection(client):
    a = client.get("/api/actions").json()[0]
    assert client.patch(f"/api/actions/{a['id']}", json={"status": "done"}).status_code == 403  # no custom header
    r = client.patch(f"/api/actions/{a['id']}", json={"status": "done"}, headers=H | {"Origin": "https://evil.example"})
    assert r.status_code == 403
    assert client.get("/api/health", headers={"Host": "evil.example"}).status_code == 400


def test_rules_crud_and_reanalyse(client):
    assert client.post("/api/rules", json={"rule_type": "manager", "pattern": "nope"}, headers=H).status_code == 422
    r = client.post("/api/rules", json={"rule_type": "client", "pattern": "@family.example", "label": "Fam"}, headers=H)
    assert r.status_code == 201
    rid = r.json()["id"]
    assert client.post("/api/rules", json={"rule_type": "client", "pattern": "@family.example"}, headers=H).status_code == 409
    assert client.post("/api/rules/reanalyse", headers=H).json()["threads_analysed"] > 0
    assert client.get("/api/emails", params={"category": "client", "sender": "mum"}).json()["total"] == 1
    assert client.delete(f"/api/rules/{rid}", headers=H).status_code == 204
    assert all(x["id"] != rid for x in client.get("/api/rules").json())


def test_settings_never_expose_secrets(client, monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-secret")
    s = client.get("/api/settings").json()
    assert s["static"]["anthropic_api_key_present"] is True
    assert "sk-ant-test-secret" not in client.get("/api/settings").text
    assert s["ai_api_enabled"] is False  # disabled by default
    r = client.put("/api/settings", json={"followup_days": 5}, headers=H).json()
    assert r["followup_days"] == 5


def test_manual_sync_and_progress(client):
    r = client.post("/api/sync", json={"mode": "incremental"}, headers=H)
    assert r.status_code == 202
    for _ in range(100):
        st = client.get("/api/sync/status").json()
        if not st["progress"]["running"]:
            break
        time.sleep(0.05)
    assert st["history"][0]["status"] == "completed" and st["history"][0]["kind"] == "incremental"


def test_cache_wipe_requires_confirmation_phrase(client):
    assert client.post("/api/cache/wipe", json={"scope": "bodies", "confirm": "yes"}, headers=H).status_code == 422
    r = client.post("/api/cache/wipe", json={"scope": "bodies", "confirm": "DELETE LOCAL CACHE"}, headers=H).json()
    assert r["removed"]["bodies_removed"] == 17 and r["gmail_untouched"]


def test_audit_log_records_user_actions(client):
    client.put("/api/settings", json={"followup_days": 4}, headers=H)
    assert any(a["action"] == "settings.update" for a in client.get("/api/audit").json())


def test_range_sync_api_validation(client):
    bad = [
        {"mode": "range"},
        {"mode": "range", "date_from": "2026-05-02", "date_to": "2026-05-01"},
        {"mode": "range", "date_from": "2026-01-01", "date_to": "2999-01-01"},
        {"mode": "range", "date_from": "1999-01-01", "date_to": "2000-01-01"},
    ]
    for body in bad:
        assert client.post("/api/sync", json=body, headers=H).status_code == 422, body
