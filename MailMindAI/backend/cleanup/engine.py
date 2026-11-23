"""Cleanup recommendation engine.

Produces RECOMMENDATIONS ONLY. MailMind holds a read-only Gmail token and has
no code path to unsubscribe, archive, label, trash or delete anything. The
user acts on a recommendation themselves in Gmail (each recommendation links
to the matching Gmail search). A future write-capable feature would need a new
OAuth scope, explicit per-action approval and audit logging (see SECURITY.md).
"""
from __future__ import annotations

from datetime import timedelta
from urllib.parse import quote

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db import models as m
from backend.db.models import utcnow
from backend.security.audit import audit

UNSUB_MIN_MESSAGES = 3
UNSUB_UNREAD_RATIO = 0.75
PROMO_AGE_DAYS = 14
NOTIFICATION_AGE_DAYS = 30
LARGE_BYTES = 5 * 1024 * 1024


def gmail_search_url(query: str) -> str:
    return f"https://mail.google.com/mail/u/0/#search/{quote(query)}"


def _emails(session: Session, *conds) -> list[m.Email]:  # noqa: ANN002
    return list(session.scalars(select(m.Email).join(m.Classification, m.Classification.email_id == m.Email.id).where(*conds)))


def build_recommendations(session: Session) -> list[dict]:
    recs: list[dict] = []
    now = utcnow()
    # 1. newsletters / promotions you never read -> consider unsubscribing
    for snd in session.scalars(select(m.Sender).where(m.Sender.is_newsletter.is_(True),
                                                      m.Sender.message_count >= UNSUB_MIN_MESSAGES)):
        ratio = snd.unread_count / max(1, snd.message_count)
        if ratio >= UNSUB_UNREAD_RATIO:
            ids = [e.id for e in snd.emails]
            has_header = any(e.list_unsubscribe for e in snd.emails)
            recs.append({
                "kind": "unsubscribe_candidate", "sender_id": snd.id, "fingerprint": f"unsub:{snd.email}",
                "title": f"Consider unsubscribing from {snd.name or snd.email}",
                "rationale": (f"{snd.message_count} messages (~{snd.per_week}/week), {round(ratio * 100)}% unread. "
                              + ("The sender provides an unsubscribe link (open any message in Gmail)." if has_header
                                 else "No List-Unsubscribe header was found.")
                              + f" Review in Gmail: {gmail_search_url('from:' + snd.email)}"),
                "email_ids": ids,
            })
    # 2. old promotions
    promos = _emails(session, m.Classification.primary_category == "promotion",
                     m.Email.internal_date < now - timedelta(days=PROMO_AGE_DAYS))
    by_sender: dict[str, list[m.Email]] = {}
    for e in promos:
        by_sender.setdefault(e.from_addr or "?", []).append(e)
    for addr, es in by_sender.items():
        recs.append({
            "kind": "old_promotions", "sender_id": es[0].sender_id, "fingerprint": f"promo:{addr}",
            "title": f"{len(es)} promotional email(s) older than {PROMO_AGE_DAYS} days from {addr}",
            "rationale": f"Expired offers are rarely useful. Review in Gmail: "
                         f"{gmail_search_url(f'from:{addr} older_than:{PROMO_AGE_DAYS}d')}",
            "email_ids": [e.id for e in es],
        })
    # 3. duplicates
    dups = _emails(session, m.Classification.is_duplicate.is_(True))
    if dups:
        recs.append({
            "kind": "duplicates", "sender_id": None, "fingerprint": "dups",
            "title": f"{len(dups)} duplicate message(s)",
            "rationale": "These messages repeat an earlier message from the same sender word-for-word.",
            "email_ids": [e.id for e in dups],
        })
    # 4. old automated notifications
    notes = _emails(session, m.Classification.primary_category == "notification",
                    m.Email.internal_date < now - timedelta(days=NOTIFICATION_AGE_DAYS))
    if notes:
        recs.append({
            "kind": "old_notifications", "sender_id": None, "fingerprint": "notifications:old",
            "title": f"{len(notes)} automated notification(s) older than {NOTIFICATION_AGE_DAYS} days",
            "rationale": "Automated notifications usually lose relevance quickly.",
            "email_ids": [e.id for e in notes],
        })
    # 5. very large messages
    large = list(session.scalars(select(m.Email).where(m.Email.size_estimate >= LARGE_BYTES)))
    if large:
        recs.append({
            "kind": "large_messages", "sender_id": None, "fingerprint": "large",
            "title": f"{len(large)} message(s) larger than {LARGE_BYTES // (1024 * 1024)} MB",
            "rationale": f"Large messages use most of your storage. Review in Gmail: {gmail_search_url('larger:5M')}",
            "email_ids": [e.id for e in large],
        })
    return recs


def refresh_recommendations(session: Session) -> dict[str, int]:
    recs = build_recommendations(session)
    existing = {r.fingerprint: r for r in session.scalars(select(m.CleanupRecommendation))}
    seen: set[str] = set()
    created = updated = removed = 0
    for rec in recs:
        seen.add(rec["fingerprint"])
        row = existing.get(rec["fingerprint"])
        if row is None:
            row = m.CleanupRecommendation(fingerprint=rec["fingerprint"], status="pending")
            session.add(row)
            created += 1
        else:
            updated += 1
            if row.status == "dismissed" and len(rec["email_ids"]) > row.estimated_count:
                row.status = "pending"  # grew since dismissal -> ask again
        row.kind, row.sender_id, row.title, row.rationale = rec["kind"], rec["sender_id"], rec["title"], rec["rationale"]
        row.email_ids, row.estimated_count = rec["email_ids"], len(rec["email_ids"])
    for fp, row in existing.items():
        if fp not in seen and row.status == "pending":
            session.delete(row)
            removed += 1
    session.flush()
    audit(session, "system", "cleanup.refresh", created=created, updated=updated, removed=removed)
    return {"created": created, "updated": updated, "removed": removed}
