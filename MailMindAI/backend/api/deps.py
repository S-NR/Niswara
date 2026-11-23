"""FastAPI dependencies and shared serialisers."""
from __future__ import annotations

from collections.abc import Iterator
from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from backend.db import models as m


def get_db(request: Request) -> Iterator[Session]:
    session = request.app.state.session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def iso(dt) -> str | None:  # noqa: ANN001
    return dt.isoformat() + "Z" if dt else None


def email_summary(e: m.Email) -> dict[str, Any]:
    c = e.classification
    return {
        "id": e.id,
        "gmail_id": e.gmail_id,
        "thread_id": e.thread_id,
        "date": iso(e.internal_date),
        "subject": e.subject,
        "from_addr": e.from_addr,
        "from_name": e.from_name,
        "snippet": e.snippet,
        "is_unread": e.is_unread,
        "is_from_me": e.is_from_me,
        "has_attachments": e.has_attachments,
        "gmail_url": e.gmail_url,
        "relationship": e.sender.relationship_type if e.sender else None,
        "classification": None if c is None else {
            "categories": c.categories,
            "primary_category": c.primary_category,
            "domain": c.domain,
            "importance": c.importance,
            "importance_level": c.importance_level,
            "confidence": c.confidence,
            "response_state": c.response_state,
            "projects": c.projects,
            "is_duplicate": c.is_duplicate,
        },
    }


def email_detail(e: m.Email) -> dict[str, Any]:
    d = email_summary(e)
    d.update({
        "to_addrs": e.to_addrs, "cc_addrs": e.cc_addrs, "label_ids": e.label_ids,
        "body_text": e.body_text, "body_purged": e.body_purged,
        "attachments": e.attachment_meta,  # metadata only
        "list_unsubscribe_present": bool(e.list_unsubscribe),
        "reasons": e.classification.reasons if e.classification else [],
        "thread": thread_summary(e.thread) if e.thread else None,
    })
    return d


def thread_summary(t: m.Thread) -> dict[str, Any]:
    return {
        "id": t.id, "gmail_thread_id": t.gmail_thread_id, "subject": t.subject,
        "first_date": iso(t.first_date), "last_date": iso(t.last_date), "message_count": t.message_count,
        "participants": t.participants, "status": t.status, "status_reason": t.status_reason,
        "last_from_me": t.last_from_me,
        "gmail_url": f"https://mail.google.com/mail/u/0/#all/{t.gmail_thread_id}",
    }


def action_dict(a: m.Action, e: m.Email | None) -> dict[str, Any]:
    return {
        "id": a.id, "description": a.description, "action_type": a.action_type, "owner": a.owner,
        "due_date": iso(a.due_date), "status": a.status, "source": a.source, "confidence": a.confidence,
        "evidence": a.evidence, "email_id": a.email_id, "thread_id": a.thread_id, "ai_analysis_id": a.ai_analysis_id,
        "email": None if e is None else {"subject": e.subject, "from_addr": e.from_addr, "date": iso(e.internal_date),
                                          "gmail_url": e.gmail_url},
    }
