"""Rules, settings, sync control, Gmail auth status, audit log and local cache management."""
from __future__ import annotations

import logging
import threading
from datetime import date, timedelta
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.api.deps import get_db, iso
from backend.config import get_settings
from backend.db import models as m
from backend.db.repo import all_settings, get_sync_state, set_setting
from backend.intelligence.pipeline import analyse_all
from backend.sync.post import post_sync
from backend.intelligence.rules import RULE_TYPES, validate_pattern
from backend.retention import purge_old_bodies, wipe_local_cache
from backend.security.audit import audit
from backend.sync.engine import PROGRESS, SyncAlreadyRunning, SyncEngine

log = logging.getLogger(__name__)
router = APIRouter()


# ----------------------------------------------------------------- rules
class RuleIn(BaseModel):
    rule_type: str
    pattern: str = Field(min_length=1, max_length=320)
    label: str | None = Field(None, max_length=128)
    weight: int = Field(10, ge=0, le=100)
    enabled: bool = True
    notes: str | None = Field(None, max_length=1000)


def _rule(r: m.UserRule) -> dict[str, Any]:
    return {"id": r.id, "rule_type": r.rule_type, "pattern": r.pattern, "label": r.label, "weight": r.weight,
            "enabled": r.enabled, "notes": r.notes, "updated_at": iso(r.updated_at)}


@router.get("/rules/types")
def rule_types():
    return RULE_TYPES


@router.get("/rules")
def list_rules(db: Session = Depends(get_db)):
    return [_rule(r) for r in db.scalars(select(m.UserRule).order_by(m.UserRule.rule_type, m.UserRule.pattern))]


@router.post("/rules", status_code=201)
def create_rule(body: RuleIn, db: Session = Depends(get_db)):
    try:
        pattern = validate_pattern(body.rule_type, body.pattern)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    if db.scalar(select(m.UserRule).where(m.UserRule.rule_type == body.rule_type, m.UserRule.pattern == pattern)):
        raise HTTPException(409, "rule already exists")
    r = m.UserRule(rule_type=body.rule_type, pattern=pattern, label=body.label, weight=body.weight,
                   enabled=body.enabled, notes=body.notes)
    db.add(r)
    db.flush()
    audit(db, "user", "rule.create", "user_rule", r.id, rule_type=r.rule_type, pattern=r.pattern)
    return _rule(r)


@router.put("/rules/{rule_id}")
def update_rule(rule_id: int, body: RuleIn, db: Session = Depends(get_db)):
    r = db.get(m.UserRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    try:
        r.pattern = validate_pattern(body.rule_type, body.pattern)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    r.rule_type, r.label, r.weight, r.enabled, r.notes = body.rule_type, body.label, body.weight, body.enabled, body.notes
    audit(db, "user", "rule.update", "user_rule", r.id, rule_type=r.rule_type, pattern=r.pattern)
    return _rule(r)


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    r = db.get(m.UserRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    audit(db, "user", "rule.delete", "user_rule", r.id, rule_type=r.rule_type, pattern=r.pattern)
    db.delete(r)


@router.post("/rules/reanalyse")
def reanalyse(db: Session = Depends(get_db)):
    n = analyse_all(db)
    audit(db, "user", "intelligence.reanalyse", threads=n)
    return {"threads_analysed": n}


# ----------------------------------------------------------------- settings
class SettingsIn(BaseModel):
    ai_api_enabled: bool | None = None
    followup_days: int | None = Field(None, ge=1, le=60)
    my_addresses: list[str] | None = None
    body_retention_days: int | None = Field(None, ge=1, le=3650)
    auto_delete_paused: bool | None = None
    auto_sync_minutes: int | None = Field(None, ge=0, le=10080)  # 0 = off; otherwise at least 15


@router.get("/settings")
def get_app_settings(db: Session = Depends(get_db)):
    s = get_settings()
    from backend.ai.anthropic_api import api_key_present

    return {
        **all_settings(db),
        "static": {
            "host": s.host, "port": s.port, "initial_sync_days": s.initial_sync_days, "backfill_days": s.backfill_days,
            "store_bodies": s.store_bodies, "max_body_chars": s.max_body_chars,
            "default_body_retention_days": s.body_retention_days,
            "anthropic_api_allowed": s.anthropic_api_allowed, "anthropic_model": s.anthropic_model,
            "anthropic_api_key_present": api_key_present(), "data_dir": str(s.data_dir),
        },
    }


@router.put("/settings")
def put_app_settings(body: SettingsIn, db: Session = Depends(get_db)):
    changes = body.model_dump(exclude_none=True)
    if changes.get("auto_sync_minutes") and changes["auto_sync_minutes"] < 15:
        raise HTTPException(422, "automatic sync can run at most every 15 minutes")
    if "my_addresses" in changes:
        changes["my_addresses"] = [validate_pattern("manager", a) for a in changes["my_addresses"] if a.strip()]
    for k, v in changes.items():
        set_setting(db, k, v)
    audit(db, "user", "settings.update", keys=sorted(changes))
    return get_app_settings(db)


# ----------------------------------------------------------------- sync
class SyncIn(BaseModel):
    mode: Literal["auto", "full", "incremental", "backfill", "range"] = "auto"
    backfill_days: int | None = Field(None, ge=1, le=3650)
    date_from: date | None = None
    date_to: date | None = None

    @model_validator(mode="after")
    def _check_range(self) -> "SyncIn":
        if self.mode == "range":
            if self.date_from is None or self.date_to is None:
                raise ValueError("choose both a 'from' and a 'to' date")
            if self.date_from > self.date_to:
                raise ValueError("'from' must be on or before 'to'")
            if self.date_to > date.today() + timedelta(days=1):
                raise ValueError("'to' can't be in the future")
            if self.date_from < date(2004, 1, 1):
                raise ValueError("'from' is before Gmail existed")
        return self


@router.post("/sync", status_code=202)
def start_sync(body: SyncIn, request: Request):
    return launch_sync(request.app.state, body.mode, body.backfill_days, body.date_from, body.date_to, actor="user")


def launch_sync(state, mode: str = "auto", backfill_days: int | None = None,  # noqa: ANN001
                date_from: date | None = None, date_to: date | None = None, actor: str = "user") -> dict[str, Any]:
    """Start a background sync (used by the dashboard button and the auto-sync scheduler).

    After a completed sync, approved Delete-list rules run (when cleanup mode is enabled).
    """
    if PROGRESS.running:
        raise HTTPException(409, "a sync is already running")
    factory = state.session_factory
    try:
        source = state.source_factory()
    except Exception as exc:  # noqa: BLE001 - surfaced to UI
        raise HTTPException(400, f"Gmail not connected: {exc}") from exc
    engine = SyncEngine(source, factory, get_settings(), post_process=post_sync)
    writer_factory = state.writer_factory
    if actor != "user":
        with factory() as s:
            audit(s, actor, "sync.scheduled", mode=mode)
            s.commit()

    def _run() -> None:
        try:
            result = engine.run(mode, backfill_days, date_from, date_to)
        except SyncAlreadyRunning:
            return
        except Exception:  # noqa: BLE001 - already recorded by the engine
            log.exception("background sync crashed")
            return
        if result.get("status") == "completed":
            run_delete_list_after_sync(factory, writer_factory)

    PROGRESS.update(running=True, phase="starting", mode=mode, error=None)
    t = threading.Thread(target=_run, name="mailmind-sync", daemon=True)
    t.start()
    state.sync_thread = t
    return {"started": True, "mode": mode}


def run_delete_list_after_sync(factory, writer_factory) -> None:  # noqa: ANN001
    """After a successful sync, apply approved delete-list rules (if cleanup mode is enabled)."""
    from backend.cleanup.delete_list import active_rules, run_rules

    with factory() as s:
        if not active_rules(s):
            return
    try:
        writer = writer_factory()
    except Exception as exc:  # noqa: BLE001 - cleanup mode not enabled: skip quietly, the UI shows why
        log.info("delete list not run: %s", exc)
        return
    PROGRESS.update(running=True, phase="cleaning up (delete list)")
    try:
        run_rules(factory, writer, "after_sync")
    except Exception:  # noqa: BLE001
        log.exception("delete list run crashed")
    finally:
        PROGRESS.update(running=False, phase="completed")


@router.get("/sync/status")
def sync_status(db: Session = Depends(get_db)):
    st = get_sync_state(db)
    runs = db.scalars(select(m.SyncRun).order_by(m.SyncRun.id.desc()).limit(20)).all()
    return {
        "progress": PROGRESS.snapshot(),
        "state": {"account": st.account_email, "status": st.status, "last_history_id": st.last_history_id,
                  "last_full_sync_at": iso(st.last_full_sync_at), "last_incremental_at": iso(st.last_incremental_at),
                  "resumable": bool(st.resume_query), "oldest_synced": iso(st.oldest_synced)},
        "history": [{"id": r.id, "kind": r.kind, "status": r.status, "started_at": iso(r.started_at),
                     "finished_at": iso(r.finished_at), "listed": r.listed, "fetched": r.fetched, "inserted": r.inserted,
                     "updated": r.updated, "skipped": r.skipped, "errors": r.errors, "error": r.error_message} for r in runs],
    }


# ----------------------------------------------------------------- Gmail auth
@router.get("/auth/status")
def gmail_auth_status():
    from backend.gmail.auth import auth_status

    return auth_status()


@router.post("/auth/logout")
def gmail_logout(db: Session = Depends(get_db)):
    from backend.gmail.auth import logout

    removed = logout()
    audit(db, "user", "gmail.logout", removed=removed)
    return {"token_removed": removed}


# ----------------------------------------------------------------- audit & cache
@router.get("/audit")
def audit_log(limit: int = Query(200, ge=1, le=1000), db: Session = Depends(get_db)):
    rows = db.scalars(select(m.AuditLog).order_by(m.AuditLog.id.desc()).limit(limit)).all()
    return [{"id": a.id, "ts": iso(a.ts), "actor": a.actor, "action": a.action, "target_type": a.target_type,
             "target_id": a.target_id, "details": a.details} for a in rows]


class WipeIn(BaseModel):
    scope: Literal["bodies", "all_mail"]
    confirm: Literal["DELETE LOCAL CACHE"]


@router.post("/cache/wipe")
def wipe_cache(body: WipeIn, db: Session = Depends(get_db)):
    if PROGRESS.running:
        raise HTTPException(409, "wait for the running sync to finish")
    removed = wipe_local_cache(db, body.scope)
    db.commit()
    from backend.db.session import compact

    compact(str(db.get_bind().url))  # make sure deleted text does not linger in the WAL / free pages
    return {"scope": body.scope, "removed": removed, "gmail_untouched": True}


class PurgeIn(BaseModel):
    older_than_days: int = Field(ge=1, le=3650)


@router.post("/cache/purge-bodies")
def purge_bodies(body: PurgeIn, db: Session = Depends(get_db)):
    return {"bodies_purged": purge_old_bodies(db, body.older_than_days), "gmail_untouched": True}
