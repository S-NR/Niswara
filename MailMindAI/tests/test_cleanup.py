"""Phase 8: cleanup recommendations are generated locally and are never executed."""
from __future__ import annotations

import inspect
from datetime import timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.cleanup import engine as cleanup
from backend.db import models as m
from backend.db.session import session_factory
from backend.gmail.fixture_source import FixtureGmailSource
from backend.sample_data import load


@pytest.fixture()
def s(db_url):
    assert load(db_url)["status"] == "completed"
    sess = session_factory(db_url)()
    yield sess
    sess.close()


def recs(s):
    return {r.fingerprint: r for r in s.scalars(select(m.CleanupRecommendation))}


def test_unsubscribe_candidate_for_unread_newsletter(s):
    r = recs(s)["unsub:news@weeklydigest.example"]
    assert r.kind == "unsubscribe_candidate" and r.estimated_count == 4
    assert "100% unread" in r.rationale and "mail.google.com" in r.rationale
    assert "unsub:deals@shopmart.example" not in recs(s)  # only 2 messages -> below threshold


def test_duplicates_recommendation(s):
    m15 = s.scalar(select(m.Email.id).where(m.Email.gmail_id == "m015"))
    assert recs(s)["dups"].email_ids == [m15]


def test_old_promotions_only_after_age_threshold(s):
    assert not [f for f in recs(s) if f.startswith("promo:")]
    for e in s.scalars(select(m.Email).where(m.Email.from_addr == "deals@shopmart.example")):
        e.internal_date -= timedelta(days=30)
    cleanup.refresh_recommendations(s)
    s.commit()
    assert recs(s)["promo:deals@shopmart.example"].estimated_count == 2


def test_refresh_is_idempotent_and_respects_dismissal(s):
    before = recs(s)
    cleanup.refresh_recommendations(s)
    s.commit()
    assert recs(s).keys() == before.keys()
    r = recs(s)["unsub:news@weeklydigest.example"]
    r.status = "dismissed"
    s.commit()
    cleanup.refresh_recommendations(s)
    s.commit()
    assert recs(s)["unsub:news@weeklydigest.example"].status == "dismissed"


def test_stale_pending_recommendations_removed(s):
    for e in s.scalars(select(m.Email).where(m.Email.from_addr == "news@weeklydigest.example")):
        e.is_unread = False
    from backend.sync.ingest import refresh_sender_stats
    refresh_sender_stats(s, s.scalar(select(m.Sender).where(m.Sender.email == "news@weeklydigest.example")))
    cleanup.refresh_recommendations(s)
    s.commit()
    assert "unsub:news@weeklydigest.example" not in recs(s)


def test_cleanup_has_no_execution_path():
    src = Path(inspect.getsourcefile(cleanup)).read_text("utf-8")
    assert "backend.gmail" not in src and "googleapiclient" not in src
    from backend.api.app import create_app  # noqa: F401  (route inspection below)


def test_api_never_executes_recommendations(db_url, s):
    from backend.api.app import create_app

    app = create_app(db_url, source_factory=lambda: FixtureGmailSource())
    paths = set(app.openapi()["paths"])
    assert "/api/cleanup/{rec_id}" in paths
    assert not any(w in p for p in paths for w in ("execute", "unsubscribe", "archive", "trash", "/send"))
    with TestClient(app, base_url="http://127.0.0.1:8765") as c:
        items = c.get("/api/cleanup").json()
        assert items and all(i["executable"] is False for i in items)
        r = c.patch(f"/api/cleanup/{items[0]['id']}", json={"status": "acknowledged"},
                    headers={"X-MailMind-Request": "1"}).json()
        assert r["executed"] is False
        assert c.patch(f"/api/cleanup/{items[0]['id']}", json={"status": "executed"},
                       headers={"X-MailMind-Request": "1"}).status_code == 422
