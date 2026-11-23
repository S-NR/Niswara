"""Build the exact, bounded email context that may be shared with Claude.

Principles
  * Only emails the user explicitly selected (threads / messages / a bounded
    weekly window) are included - never the whole inbox.
  * Hard caps on message count and characters; truncation is reported.
  * The preview shown to the user is generated from the SAME package that is
    sent, and a hash of it is stored so the data cannot change between the
    user's confirmation and transmission.
"""
from __future__ import annotations

import hashlib
import html
import json
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.config import get_settings
from backend.db import models as m
from backend.db.models import utcnow

SHARED_FIELDS = ["gmail message id", "date", "from", "to", "cc", "subject", "body text (plain, possibly truncated)"]
NOT_SHARED = ["attachments (names, sizes or content)", "other emails in your mailbox", "labels",
              "your rules and settings", "OAuth tokens"]


class ContextError(ValueError):
    pass


@dataclass
class ContextMessage:
    gmail_id: str
    email_id: int
    thread_subject: str | None
    date: str
    from_: str
    to: list[str]
    cc: list[str]
    subject: str
    body: str
    truncated: bool


@dataclass
class ContextPackage:
    messages: list[ContextMessage]
    total_chars: int
    truncated_messages: int
    omitted_messages: int
    selection: dict[str, Any]
    warnings: list[str] = field(default_factory=list)

    @property
    def gmail_ids(self) -> set[str]:
        return {msg.gmail_id for msg in self.messages}

    def render(self) -> str:
        """Render for the model: each email in an <email> envelope; envelope-breaking text neutralised."""
        def esc(v: str) -> str:  # neutralise ANY markup in untrusted fields, incl. </EMAIL> / </ email> variants
            return html.escape(v.replace("\r", " "), quote=False)

        def one_line(v: str) -> str:
            return esc(v).replace("\n", " ")

        parts = []
        for msg in self.messages:
            parts.append(
                f'<email id="{esc(msg.gmail_id)}">\nDate: {msg.date}\nFrom: {one_line(msg.from_)}\n'
                f"To: {one_line(', '.join(msg.to))}\n"
                + (f"Cc: {one_line(', '.join(msg.cc))}\n" if msg.cc else "")
                + f"Subject: {one_line(msg.subject)}\n\n{esc(msg.body)}{' [truncated]' if msg.truncated else ''}\n</email>"
            )
        return "\n\n".join(parts)

    def content_hash(self) -> str:
        return hashlib.sha256(self.render().encode("utf-8")).hexdigest()

    def preview(self, destination: str) -> dict[str, Any]:
        return {
            "destination": destination,
            "message_count": len(self.messages),
            "total_chars": self.total_chars,
            "truncated_messages": self.truncated_messages,
            "omitted_messages": self.omitted_messages,
            "fields_shared": SHARED_FIELDS,
            "not_shared": NOT_SHARED,
            "warnings": self.warnings,
            "messages": [
                {"gmail_id": x.gmail_id, "email_id": x.email_id, "date": x.date, "from": x.from_, "subject": x.subject,
                 "chars": len(x.body), "truncated": x.truncated, "body_preview": x.body[:400]}
                for x in self.messages
            ],
        }


def _select_emails(session: Session, selection: dict[str, Any]) -> list[m.Email]:
    thread_ids = [int(t) for t in selection.get("thread_ids") or []]
    email_ids = [int(e) for e in selection.get("email_ids") or []]
    gmail_ids = [str(g) for g in selection.get("gmail_ids") or []]
    weekly = selection.get("weekly")
    if not (thread_ids or email_ids or gmail_ids or weekly):
        raise ContextError("Select at least one thread or email. MailMind never sends the whole inbox.")
    q = select(m.Email).outerjoin(m.Classification, m.Classification.email_id == m.Email.id)
    conds = []
    if thread_ids:
        conds.append(m.Email.thread_id.in_(thread_ids))
    if email_ids:
        conds.append(m.Email.id.in_(email_ids))
    if gmail_ids:
        conds.append(m.Email.gmail_id.in_(gmail_ids))
    if weekly:
        days = min(int(weekly.get("days", 7)), 31)
        domain = weekly.get("domain", "work")
        conds.append(
            (m.Email.internal_date >= utcnow() - timedelta(days=days))
            & (m.Classification.domain == domain)
            & (m.Classification.importance_level.in_(["high", "medium"]))
            & (m.Classification.primary_category.not_in(["newsletter", "promotion", "notification", "suspicious"]))
        )
    from sqlalchemy import or_

    emails = session.scalars(q.where(or_(*conds)).order_by(m.Email.internal_date)).all()
    return [e for e in emails if not (e.classification and e.classification.is_duplicate)]


def build_context(session: Session, selection: dict[str, Any], max_messages: int | None = None,
                  max_chars: int | None = None) -> ContextPackage:
    s = get_settings()
    max_messages = max_messages or s.ai_max_messages
    max_chars = max_chars or s.ai_max_context_chars
    emails = _select_emails(session, selection)
    if not emails:
        raise ContextError("The selection does not contain any locally cached emails.")
    omitted = max(0, len(emails) - max_messages)
    emails = emails[-max_messages:]  # keep the most recent
    per_msg = max(500, max_chars // max(1, len(emails)))
    msgs: list[ContextMessage] = []
    total = truncated = 0
    warnings: list[str] = []
    for e in emails:
        body = e.body_text or ""
        if not body:
            body = e.snippet or ""
            warnings.append(f"{e.gmail_id}: body not cached locally (purged or not stored) - only the snippet is shared")
        cut = len(body) > per_msg
        body = body[:per_msg]
        truncated += cut
        total += len(body)
        msgs.append(ContextMessage(
            gmail_id=e.gmail_id, email_id=e.id, thread_subject=e.thread.subject if e.thread else None,
            date=e.internal_date.isoformat() + "Z", from_=f"{e.from_name or ''} <{e.from_addr or ''}>".strip(),
            to=list(e.to_addrs or []), cc=list(e.cc_addrs or []), subject=e.subject or "", body=body, truncated=cut,
        ))
    if omitted:
        warnings.append(f"{omitted} older message(s) omitted to respect the {max_messages}-message limit")
    return ContextPackage(msgs, total, truncated, omitted, selection, warnings)


def canonical_selection(selection: dict[str, Any]) -> dict[str, Any]:
    allowed = {"thread_ids", "email_ids", "gmail_ids", "weekly"}
    return json.loads(json.dumps({k: v for k, v in selection.items() if k in allowed}, sort_keys=True))
