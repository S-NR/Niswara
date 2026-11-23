"""Automatic sync scheduler - synthetic data only, no real mailbox."""
from __future__ import annotations

from datetime import timedelta

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_sync_state, set_setting
from backend.gmail.fixture_source import FixtureGmailSource
from backend.scheduler import RETRY_AFTER, STARTUP_DELAY, AutoSync

H = {"X-MailMind-Request": "1"}


class Clock:
    def __init__(self):
        self.t = utcnow()

    def __call__(self):
        return self.t


@pytest.fixture()
def app(db_url):
    from backend.api.app import create_app

    src = FixtureGmailSource()
    a = create_app(db_url, source_factory=lambda: src, writer_factory=lambda: src)
    a.state.trash_enabled_override = True
    return a


def _set(app, **kw):
    with app.state.session_factory() as s:
        for k, v in kw.items():
            set_setting(s, k, v)
        s.commit()


def _scheduler(app, clock, launched):
    def launch(state, mode, actor):
        launched.append((mode, actor))
        return {"started": True}

    return AutoSync(app.state, launch, clock=clock)


def test_off_by_default(app):
    clock, launched = Clock(), []
    sch = _scheduler(app, clock, launched)
    clock.t += timedelta(days=2)
    assert not sch.tick() and launched == []


def test_waits_after_startup_then_runs_on_interval(app):
    clock, launched = Clock(), []
    _set(app, auto_sync_minutes=60)
    sch = _scheduler(app, clock, launched)
    assert not sch.tick()  # inside the start-up grace period
    clock.t += STARTUP_DELAY
    assert sch.tick() and launched == [("auto", "scheduler")]  # never synced -> due
    # pretend that sync finished just now
    with app.state.session_factory() as s:
        get_sync_state(s).last_incremental_at = clock.t
        s.commit()
    clock.t += timedelta(minutes=30)
    assert not sch.tick()  # not due yet
    clock.t += timedelta(minutes=31)
    assert sch.tick() and len(launched) == 2


def test_failed_launch_backs_off(app):
    clock = Clock()
    _set(app, auto_sync_minutes=15)
    calls = []

    def launch(state, mode, actor):
        calls.append(1)
        raise HTTPException(400, "Gmail not connected")

    sch = AutoSync(app.state, launch, clock=clock)
    clock.t += STARTUP_DELAY
    assert not sch.tick() and len(calls) == 1
    clock.t += timedelta(minutes=1)
    assert not sch.tick() and len(calls) == 1  # backing off
    clock.t += RETRY_AFTER
    sch.tick()
    assert len(calls) == 2


def test_scheduled_sync_runs_real_sync_and_delete_list(app, db_url):
    """End to end through the real launch path: sync, then approved Delete-list rules."""
    from backend.api.routers.admin import launch_sync
    from backend.cleanup import delete_list as dl

    with TestClient(app, base_url="http://127.0.0.1:8765") as c:
        _set(app, auto_sync_minutes=15)
        clock = Clock()
        sch = AutoSync(app.state, launch_sync, clock=clock)
        clock.t += STARTUP_DELAY
        assert sch.tick()
        app.state.sync_thread.join(30)
        with app.state.session_factory() as s:
            assert s.scalar(select(m.SyncRun).order_by(m.SyncRun.id.desc())).status == "completed"
            assert s.scalar(select(m.AuditLog).where(m.AuditLog.action == "sync.scheduled")).actor == "scheduler"
            # approve a rule, then the next scheduled sync trashes its mail
            rule = m.DeleteRule(pattern="news@weeklydigest.example", older_than_days=7)
            s.add(rule)
            s.commit()
            p = dl.preview(s, rule)
            assert p["count"] > 0
            dl.approve(s, rule, p["count"])
            s.commit()
        clock.t += timedelta(minutes=20)  # past the 15-minute interval since that sync
        assert sch.tick()
        app.state.sync_thread.join(30)
        runs = c.get("/api/delete-list").json()["runs"]
        assert runs and runs[0]["trigger"] == "after_sync" and runs[0]["trashed"] == p["count"]


def test_interval_setting_validation(app):
    with TestClient(app, base_url="http://127.0.0.1:8765") as c:
        assert c.put("/api/settings", json={"auto_sync_minutes": 5}, headers=H).status_code == 422
        assert c.put("/api/settings", json={"auto_sync_minutes": -1}, headers=H).status_code == 422
        r = c.put("/api/settings", json={"auto_sync_minutes": 60}, headers=H)
        assert r.status_code == 200 and r.json()["auto_sync_minutes"] == 60
        assert c.put("/api/settings", json={"auto_sync_minutes": 0}, headers=H).json()["auto_sync_minutes"] == 0


def test_scheduler_only_runs_in_real_server(app):
    assert getattr(app.state, "auto_sync", None) is None  # tests/create_app() default: no background thread
