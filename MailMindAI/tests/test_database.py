from datetime import timedelta

import pytest
from sqlalchemy import inspect, select, text
from sqlalchemy.exc import IntegrityError

from backend.db import models as m
from backend.db.models import utcnow
from backend.db.session import get_engine, session_scope
from backend.retention import purge_old_bodies, wipe_local_cache

EXPECTED = {
    "emails", "threads", "senders", "classifications", "actions", "followups", "cleanup_recommendations",
    "ai_analyses", "ai_analysis_sources", "sync_state", "audit_logs", "user_rules", "sync_runs", "app_settings",
}


def _email(gid="m1", thread=None, days_ago=0, body="hello world"):
    return m.Email(gmail_id=gid, gmail_thread_id="t1", thread=thread, internal_date=utcnow() - timedelta(days=days_ago),
                   subject="Quarterly budget", from_addr="a@example.com", body_text=body)


def test_migrations_create_all_tables(db_url):
    names = set(inspect(get_engine(db_url)).get_table_names())
    assert EXPECTED <= names
    assert "emails_fts" in names


def test_foreign_keys_enforced(session):
    session.add(m.Classification(email_id=99999, primary_category="work"))
    with pytest.raises(IntegrityError):
        session.flush()


def test_gmail_id_unique(session):
    session.add(_email("dup"))
    session.flush()
    session.add(_email("dup"))
    with pytest.raises(IntegrityError):
        session.flush()


def test_cascade_delete_classification(session):
    e = _email()
    session.add(e)
    session.flush()
    session.add(m.Classification(email_id=e.id, primary_category="work"))
    session.commit()
    session.delete(e)
    session.commit()
    assert session.scalar(select(m.Classification)) is None


def test_session_scope_rolls_back(db_url):
    with pytest.raises(RuntimeError):
        with session_scope(db_url) as s:
            s.add(_email("rb"))
            s.flush()
            raise RuntimeError("boom")
    with session_scope(db_url) as s:
        assert s.scalar(select(m.Email).where(m.Email.gmail_id == "rb")) is None


def test_fts_triggers_index_and_update(session):
    e = _email(body="the turbine calibration report")
    session.add(e)
    session.commit()
    hits = session.execute(text("SELECT rowid FROM emails_fts WHERE emails_fts MATCH 'turbine'")).all()
    assert [h[0] for h in hits] == [e.id]
    e.body_text = None
    session.commit()
    assert session.execute(text("SELECT rowid FROM emails_fts WHERE emails_fts MATCH 'turbine'")).all() == []


def test_retention_purges_only_old_bodies(session):
    session.add_all([_email("old", days_ago=200), _email("new", days_ago=1)])
    session.commit()
    assert purge_old_bodies(session, 90) == 1
    session.commit()
    old = session.scalar(select(m.Email).where(m.Email.gmail_id == "old"))
    new = session.scalar(select(m.Email).where(m.Email.gmail_id == "new"))
    assert old.body_text is None and old.body_purged and old.subject == "Quarterly budget"
    assert new.body_text == "hello world"
    assert session.scalar(select(m.AuditLog).where(m.AuditLog.action == "retention.purge_bodies"))


def test_wipe_all_mail_keeps_rules(session):
    session.add(_email())
    session.add(m.UserRule(rule_type="manager", pattern="boss@example.com"))
    session.commit()
    wipe_local_cache(session, "all_mail")
    session.commit()
    assert session.scalar(select(m.Email)) is None
    assert session.scalar(select(m.UserRule)) is not None


def test_audit_strips_sensitive_keys(session):
    from backend.security.audit import audit

    a = audit(session, "user", "x", body_text="secret", api_key="k", count=1)
    assert a.details == {"count": 1}


def test_backup_is_consistent_and_rotates(db_url, session, tmp_path):
    import sqlite3

    from backend.backup import backup
    from backend.db.session import db_file

    session.add(_email("bk"))
    session.commit()
    dest = tmp_path / "bk"
    paths = [backup(db_file(db_url), dest, keep=2) for _ in range(3)]
    assert len(list(dest.glob("mailmind-*.db"))) == 2
    con = sqlite3.connect(paths[-1])
    assert con.execute("select gmail_id from emails").fetchone()[0] == "bk"
    con.close()
