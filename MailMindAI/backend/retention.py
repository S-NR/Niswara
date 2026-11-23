"""Local cache retention.

These functions only ever touch the LOCAL SQLite cache. They never call
Gmail, and original Gmail messages are never deleted or modified.
"""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from backend.db import models as m
from backend.db.models import utcnow
from backend.security.audit import audit


def _strip_preview_excerpts(session: Session, before=None) -> int:  # noqa: ANN001
    """Remove the 400-char body excerpts kept in AI request previews."""
    q = select(m.AIAnalysis)
    if before is not None:
        q = q.where(m.AIAnalysis.created_at < before)
    n = 0
    for a in session.scalars(q):
        prev = dict(a.context_preview or {})
        msgs = prev.get("messages") or []
        if any(x.get("body_preview") for x in msgs):
            prev["messages"] = [{**x, "body_preview": ""} for x in msgs]
            a.context_preview = prev
            n += 1
    return n


def purge_old_bodies(session: Session, older_than_days: int) -> int:
    """Drop cached body text for emails older than N days (metadata kept)."""
    cutoff = utcnow() - timedelta(days=older_than_days)
    ids = session.scalars(
        select(m.Email.id).where(m.Email.internal_date < cutoff, m.Email.body_text.is_not(None))
    ).all()
    if ids:
        session.execute(update(m.Email).where(m.Email.id.in_(ids)).values(body_text=None, body_purged=True))
    _strip_preview_excerpts(session, before=cutoff)
    audit(session, "system", "retention.purge_bodies", older_than_days=older_than_days, count=len(ids))
    return len(ids)


def wipe_local_cache(session: Session, scope: str) -> dict[str, int]:
    """Delete locally cached content.

    scope='bodies'   - remove all cached body text, keep metadata & intelligence
    scope='all_mail' - remove all locally cached mail and derived data (rules/settings/audit kept)
    """
    if scope == "bodies":
        n = session.execute(
            update(m.Email).where(m.Email.body_text.is_not(None)).values(body_text=None, body_purged=True)
        ).rowcount
        _strip_preview_excerpts(session)
        audit(session, "user", "cache.wipe_bodies", count=n)
        return {"bodies_removed": n or 0}
    if scope == "all_mail":
        counts: dict[str, int] = {}
        for model in (
            m.AIAnalysisSource, m.Action, m.Followup, m.CleanupRecommendation, m.AIAnalysis,
            m.Classification, m.Email, m.Thread, m.Sender, m.SyncState,
        ):
            counts[model.__tablename__] = session.execute(delete(model)).rowcount or 0
        audit(session, "user", "cache.wipe_all_mail", **counts)
        return counts
    raise ValueError("scope must be 'bodies' or 'all_mail'")
