"""Claude Analysis and Cleanup Center endpoints."""
from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.ai.claude_code_bridge import instructions_for, pending_requests
from backend.ai.context_builder import ContextError
from backend.ai.gateway import METHODS, AIGateway, ContextChanged, GatewayError
from backend.ai.schemas import ANALYSIS_TYPES
from backend.api.deps import get_db, iso
from backend.cleanup.engine import refresh_recommendations
from backend.db import models as m
from backend.security.audit import audit

router = APIRouter()


def _gateway(request: Request, db: Session) -> AIGateway:
    return AIGateway(db, getattr(request.app.state, "api_provider_factory", None))


def _analysis(a: m.AIAnalysis) -> dict[str, Any]:
    return {
        "id": a.id, "analysis_type": a.analysis_type, "analysis_label": ANALYSIS_TYPES.get(a.analysis_type),
        "question": a.question, "processing_method": a.processing_method,
        "processing_label": METHODS.get(a.processing_method), "status": a.status, "selection": a.selection,
        "context_preview": a.context_preview, "context_hash": a.context_hash, "confirmed_at": iso(a.confirmed_at), "completed_at": iso(a.completed_at),
        "created_at": iso(a.created_at), "model": a.model, "result": a.result, "error": a.error,
        "sources": [{"gmail_id": s.gmail_id, "email_id": s.email_id, "role": s.role, "item_index": s.item_index,
                     "gmail_url": f"https://mail.google.com/mail/u/0/#all/{s.gmail_id}"} for s in a.sources],
        "claude_code_instructions": instructions_for(a.id) if a.processing_method == "claude_code" else None,
    }


@router.get("/ai/options")
def ai_options(request: Request, db: Session = Depends(get_db)):
    return {"analysis_types": ANALYSIS_TYPES, "methods": METHODS, "api": _gateway(request, db).api_status()}


class PrepareIn(BaseModel):
    analysis_type: str
    method: Literal["claude_code", "anthropic_api"] = "claude_code"
    question: str | None = Field(None, max_length=2000)
    thread_ids: list[int] = Field(default_factory=list, max_length=50)
    email_ids: list[int] = Field(default_factory=list, max_length=200)
    weekly_days: int | None = Field(None, ge=1, le=31)
    weekly_domain: Literal["work", "personal"] = "work"


@router.post("/ai/requests", status_code=201)
def prepare(body: PrepareIn, request: Request, db: Session = Depends(get_db)):
    selection: dict[str, Any] = {"thread_ids": body.thread_ids, "email_ids": body.email_ids}
    if body.weekly_days:
        selection["weekly"] = {"days": body.weekly_days, "domain": body.weekly_domain}
    try:
        a = _gateway(request, db).prepare(body.analysis_type, selection, body.question, body.method)
    except (GatewayError, ContextError) as exc:
        raise HTTPException(422, str(exc)) from exc
    return _analysis(a)


@router.get("/ai/requests")
def list_requests(db: Session = Depends(get_db)):
    return [_analysis(a) for a in db.scalars(select(m.AIAnalysis).order_by(m.AIAnalysis.id.desc()).limit(100))]


@router.get("/ai/requests/pending-claude-code")
def pending(db: Session = Depends(get_db)):
    return pending_requests(db)


@router.get("/ai/requests/{analysis_id}")
def get_request(analysis_id: int, db: Session = Depends(get_db)):
    a = db.get(m.AIAnalysis, analysis_id)
    if a is None:
        raise HTTPException(404, "analysis not found")
    return _analysis(a)


class ConfirmIn(BaseModel):
    context_hash: str = Field(min_length=64, max_length=64)  # proves the user saw this exact preview


@router.post("/ai/requests/{analysis_id}/confirm")
def confirm(analysis_id: int, body: ConfirmIn, request: Request, db: Session = Depends(get_db)):
    a = db.get(m.AIAnalysis, analysis_id)
    if a is None:
        raise HTTPException(404, "analysis not found")
    if a.context_hash != body.context_hash:
        raise HTTPException(409, "the preview you confirmed is out of date; reload it")
    gw = _gateway(request, db)
    try:
        gw.confirm(analysis_id)
        if a.processing_method == "anthropic_api":
            db.commit()  # persist the confirmation before transmission
            try:
                gw.run(analysis_id)
            except ContextChanged as exc:
                raise HTTPException(409, str(exc)) from exc
            except Exception as exc:  # noqa: BLE001 - stored on the analysis row, shown in UI
                db.commit()
                raise HTTPException(502, f"analysis failed: {exc}") from exc
    except GatewayError as exc:
        raise HTTPException(422, str(exc)) from exc
    return _analysis(a)


@router.post("/ai/requests/{analysis_id}/cancel")
def cancel(analysis_id: int, request: Request, db: Session = Depends(get_db)):
    try:
        return _analysis(_gateway(request, db).cancel(analysis_id))
    except GatewayError as exc:
        raise HTTPException(422, str(exc)) from exc


# ------------------------------------------------------------------ cleanup
@router.get("/cleanup")
def list_cleanup(status: str = "pending", db: Session = Depends(get_db)):
    q = select(m.CleanupRecommendation).order_by(m.CleanupRecommendation.estimated_count.desc())
    if status != "all":
        q = q.where(m.CleanupRecommendation.status == status)
    out = []
    for r in db.scalars(q):
        sample = db.scalars(select(m.Email).where(m.Email.id.in_(r.email_ids[:5]))).all()
        snd = db.get(m.Sender, r.sender_id) if r.sender_id else None
        out.append({"id": r.id, "kind": r.kind, "title": r.title, "sender_email": snd.email if snd else None, "rationale": r.rationale, "status": r.status,
                    "estimated_count": r.estimated_count, "updated_at": iso(r.updated_at),
                    "sample": [{"id": e.id, "subject": e.subject, "from_addr": e.from_addr, "date": iso(e.internal_date),
                                "gmail_url": e.gmail_url} for e in sample],
                    "executable": False})
    return out


@router.post("/cleanup/refresh")
def refresh_cleanup(db: Session = Depends(get_db)):
    return refresh_recommendations(db)


class CleanupStatus(BaseModel):
    status: Literal["pending", "dismissed", "acknowledged"]


@router.patch("/cleanup/{rec_id}")
def update_cleanup(rec_id: int, body: CleanupStatus, db: Session = Depends(get_db)):
    r = db.get(m.CleanupRecommendation, rec_id)
    if r is None:
        raise HTTPException(404, "recommendation not found")
    old, r.status = r.status, body.status
    audit(db, "user", "cleanup.status", "cleanup_recommendation", r.id, old=old, new=body.status)
    return {"id": r.id, "status": r.status, "executed": False,
            "note": "MailMind never modifies Gmail. Apply the change yourself in Gmail if you agree."}
