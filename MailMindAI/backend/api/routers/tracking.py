"""Action tracker and follow-ups (local state only - nothing is sent to Gmail)."""
from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.api.deps import action_dict, get_db, iso, thread_summary
from backend.db import models as m
from backend.security.audit import audit

router = APIRouter()


@router.get("/actions")
def list_actions(status: str | None = "open", owner: str | None = None, source: str | None = None,
                 db: Session = Depends(get_db)):
    q = select(m.Action)
    if status and status != "all":
        q = q.where(m.Action.status == status)
    if owner:
        q = q.where(m.Action.owner == owner)
    if source:
        q = q.where(m.Action.source == source)
    rows = db.scalars(q.order_by(m.Action.due_date.is_(None), m.Action.due_date, m.Action.id.desc()).limit(500)).all()
    return [action_dict(a, db.get(m.Email, a.email_id) if a.email_id else None) for a in rows]


class StatusUpdate(BaseModel):
    status: Literal["open", "done", "dismissed"]


@router.patch("/actions/{action_id}")
def update_action(action_id: int, body: StatusUpdate, db: Session = Depends(get_db)):
    a = db.get(m.Action, action_id)
    if a is None:
        raise HTTPException(404, "action not found")
    old, a.status = a.status, body.status
    audit(db, "user", "action.status", "action", a.id, old=old, new=body.status)
    return action_dict(a, db.get(m.Email, a.email_id) if a.email_id else None)


@router.get("/followups")
def list_followups(status: str | None = "open", db: Session = Depends(get_db)):
    q = select(m.Followup)
    if status and status != "all":
        q = q.where(m.Followup.status == status)
    out = []
    for f in db.scalars(q.order_by(m.Followup.due_at)).all():
        t = db.get(m.Thread, f.thread_id)
        e = db.get(m.Email, f.email_id) if f.email_id else None
        out.append({"id": f.id, "kind": f.kind, "since": iso(f.since), "due_at": iso(f.due_at), "status": f.status,
                    "thread": thread_summary(t) if t else None,
                    "last_email": None if e is None else {"id": e.id, "subject": e.subject, "from_addr": e.from_addr,
                                                          "snippet": e.snippet, "gmail_url": e.gmail_url}})
    return out


class FollowupUpdate(BaseModel):
    status: Literal["open", "resolved", "dismissed"]


@router.patch("/followups/{fid}")
def update_followup(fid: int, body: FollowupUpdate, db: Session = Depends(get_db)):
    f = db.get(m.Followup, fid)
    if f is None:
        raise HTTPException(404, "follow-up not found")
    old, f.status = f.status, body.status
    audit(db, "user", "followup.status", "followup", f.id, old=old, new=body.status)
    return {"id": f.id, "status": f.status}
