"""Delete list endpoints (opt-in auto-trash). Every rule needs an approved preview."""
from __future__ import annotations

import threading
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.api.deps import get_db, iso
from backend.cleanup import delete_list as dl
from backend.db import models as m
from backend.db.repo import get_setting, set_setting
from backend.gmail.auth import auth_status
from backend.security.audit import audit

router = APIRouter(prefix="/delete-list")


def _rule(r: m.DeleteRule, count: int | None = None) -> dict[str, Any]:
    return {"id": r.id, "pattern": r.pattern, "older_than_days": r.older_than_days, "enabled": r.enabled,
            "approved": r.approved_at is not None, "approved_at": iso(r.approved_at),
            "approved_preview_count": r.approved_preview_count, "last_run_at": iso(r.last_run_at),
            "total_trashed": r.total_trashed, "notes": r.notes, "pending_count": count}


def _run(r: m.DeleteRun) -> dict[str, Any]:
    return {"id": r.id, "trigger": r.trigger, "status": r.status, "started_at": iso(r.started_at),
            "finished_at": iso(r.finished_at), "trashed": r.trashed, "failed": r.failed, "restored": r.restored,
            "undone_at": iso(r.undone_at), "error": r.error}


def _trash_enabled(request: Request) -> bool:
    override = getattr(request.app.state, "trash_enabled_override", None)
    return override if override is not None else auth_status()["trash_enabled"]


def _background(request: Request, fn) -> None:  # noqa: ANN001
    try:
        writer = request.app.state.writer_factory()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(409, f"Cleanup mode is not enabled: {exc}") from exc
    t = threading.Thread(target=fn, args=(writer,), name="mailmind-delete", daemon=True)
    t.start()
    request.app.state.delete_thread = t


@router.get("")
def overview(request: Request, db: Session = Depends(get_db)):
    rules = db.scalars(select(m.DeleteRule).order_by(m.DeleteRule.pattern)).all()
    runs = db.scalars(select(m.DeleteRun).order_by(m.DeleteRun.id.desc()).limit(20)).all()
    return {"trash_enabled": _trash_enabled(request), "paused": bool(get_setting(db, "auto_delete_paused")),
            "running": dl.RUN_LOCK.locked(),
            "rules": [_rule(r, len(dl.matching(db, r)[0])) for r in rules], "runs": [_run(r) for r in runs]}


class RuleIn(BaseModel):
    pattern: str = Field(min_length=3, max_length=320)
    older_than_days: int = Field(7, ge=0, le=3650)
    notes: str | None = Field(None, max_length=500)


@router.post("/rules", status_code=201)
def add_rule(body: RuleIn, db: Session = Depends(get_db)):
    try:
        pattern = dl.validate_delete_pattern(db, body.pattern)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    if db.scalar(select(m.DeleteRule).where(m.DeleteRule.pattern == pattern)):
        raise HTTPException(409, "that sender is already on the delete list")
    r = m.DeleteRule(pattern=pattern, older_than_days=body.older_than_days, notes=body.notes, enabled=True)
    db.add(r)
    db.flush()
    audit(db, "user", "delete_rule.create", "delete_rule", r.id, pattern=pattern, older_than_days=body.older_than_days)
    return {"rule": _rule(r), "preview": dl.preview(db, r)}


@router.get("/rules/{rule_id}/preview")
def rule_preview(rule_id: int, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    return dl.preview(db, r)


class ApproveIn(BaseModel):
    seen_count: int = Field(ge=0)


@router.post("/rules/{rule_id}/approve")
def approve_rule(rule_id: int, body: ApproveIn, request: Request, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    if not _trash_enabled(request):
        raise HTTPException(409, "Cleanup mode is not enabled. Run scripts\\login.ps1 -EnableCleanup first.")
    try:
        dl.approve(db, r, body.seen_count)
    except dl.DeleteListError as exc:
        raise HTTPException(409, str(exc)) from exc
    db.commit()
    factory = request.app.state.session_factory
    _background(request, lambda w: dl.run_rules(factory, w, "approval", [rule_id]))
    return {"rule": _rule(r), "started": True}


class RulePatch(BaseModel):
    enabled: bool | None = None
    older_than_days: int | None = Field(None, ge=0, le=3650)


@router.patch("/rules/{rule_id}")
def patch_rule(rule_id: int, body: RulePatch, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    if body.older_than_days is not None and body.older_than_days != r.older_than_days:
        r.older_than_days = body.older_than_days
        r.approved_at = None  # a changed rule needs a fresh approval
        r.approved_preview_count = None
    if body.enabled is not None:
        r.enabled = body.enabled
    audit(db, "user", "delete_rule.update", "delete_rule", r.id, **body.model_dump(exclude_none=True))
    return _rule(r, len(dl.matching(db, r)[0]))


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRule, rule_id)
    if r is None:
        raise HTTPException(404, "rule not found")
    audit(db, "user", "delete_rule.remove", "delete_rule", r.id, pattern=r.pattern)
    db.delete(r)


@router.post("/run", status_code=202)
def run_now(request: Request):
    factory = request.app.state.session_factory
    _background(request, lambda w: dl.run_rules(factory, w, "manual"))
    return {"started": True}


@router.get("/runs/{run_id}")
def run_detail(run_id: int, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRun, run_id)
    if r is None:
        raise HTTPException(404, "run not found")
    return {**_run(r), "items": [{"gmail_id": i.gmail_id, "from_addr": i.from_addr, "subject": i.subject,
                                  "email_date": iso(i.email_date), "status": i.status, "error": i.error,
                                  "gmail_url": f"https://mail.google.com/mail/u/0/#trash/{i.gmail_id}"}
                                 for i in r.items]}


@router.post("/runs/{run_id}/undo", status_code=202)
def undo(run_id: int, request: Request, db: Session = Depends(get_db)):
    r = db.get(m.DeleteRun, run_id)
    if r is None:
        raise HTTPException(404, "run not found")
    if r.undone_at:
        raise HTTPException(409, "this run was already undone")
    factory = request.app.state.session_factory
    try:
        reader = request.app.state.source_factory()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(409, f"Gmail not connected: {exc}") from exc
    _background(request, lambda w: dl.undo_run(factory, w, reader, run_id))
    return {"started": True}


class PauseIn(BaseModel):
    paused: bool


@router.put("/pause")
def pause(body: PauseIn, db: Session = Depends(get_db)):
    set_setting(db, "auto_delete_paused", body.paused)
    audit(db, "user", "delete_list.pause" if body.paused else "delete_list.resume")
    return {"paused": body.paused}
