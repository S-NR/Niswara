"""Local intelligence pipeline - runs after every sync (and when rules change).

Purely local and deterministic. It never calls Gmail or any AI service.
"""
from __future__ import annotations

from collections.abc import Iterable
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_setting, get_sync_state
from backend.intelligence.actions import extract_actions
from backend.intelligence.classifier import classify_email
from backend.intelligence.conversation import HUMAN, thread_state
from backend.intelligence.rules import RuleSet

DUPLICATE_WINDOW = timedelta(days=7)


def my_addresses(session: Session) -> set[str]:
    st = get_sync_state(session)
    extra = {a.lower() for a in (get_setting(session, "my_addresses") or [])}
    return extra | ({st.account_email.lower()} if st.account_email else set())


def my_names(session: Session, addrs: set[str]) -> list[str]:
    names: set[str] = set()
    for a in addrs:
        local = a.split("@", 1)[0]
        first = local.replace("_", ".").split(".")[0]
        if len(first) >= 2:
            names.add(first)
    for n in session.scalars(select(m.Email.from_name).where(m.Email.is_from_me.is_(True), m.Email.from_name.is_not(None)).distinct().limit(20)):
        if n and n.split():
            names.add(n.split()[0].lower())
    return sorted(names)


def _find_duplicate(session: Session, e: m.Email) -> m.Email | None:
    if not e.content_hash or not e.from_addr:
        return None
    return session.scalar(
        select(m.Email)
        .where(m.Email.content_hash == e.content_hash, m.Email.from_addr == e.from_addr, m.Email.id != e.id,
               m.Email.internal_date >= e.internal_date - DUPLICATE_WINDOW,
               (m.Email.internal_date < e.internal_date) | ((m.Email.internal_date == e.internal_date) & (m.Email.id < e.id)))
        .order_by(m.Email.internal_date, m.Email.id)
    )


def _upsert_classification(session: Session, e: m.Email, r, dup: m.Email | None) -> m.Classification:  # noqa: ANN001
    c = e.classification or m.Classification(email_id=e.id)
    c.categories = r.categories
    c.primary_category = r.primary_category
    c.domain = r.domain
    c.importance = r.importance if dup is None else min(r.importance, 20)
    c.importance_level = r.importance_level if dup is None else "low"
    c.confidence = r.confidence
    c.projects = r.projects
    c.reasons = r.reasons + ([f"duplicate of message {dup.gmail_id}"] if dup else [])
    c.is_duplicate = dup is not None
    c.duplicate_of_id = dup.id if dup else None
    c.engine = "local-rules-v1"
    if e.classification is None:
        session.add(c)
        e.classification = c
    return c


def _sync_actions(session: Session, e: m.Email, extracted, replied_after: bool, close_all: bool) -> None:  # noqa: ANN001
    existing = {a.description: a for a in session.scalars(
        select(m.Action).where(m.Action.email_id == e.id, m.Action.source == "local"))}
    wanted = set()
    for x in extracted:
        wanted.add(x.description)
        a = existing.get(x.description)
        if a is None:
            a = m.Action(email_id=e.id, thread_id=e.thread_id, description=x.description, source="local",
                         owner="me", status="open")
            session.add(a)
        a.action_type, a.due_date, a.confidence, a.evidence = x.action_type, x.due_date, x.confidence, x.evidence
        if a.status == "open" and (close_all or (replied_after and a.action_type == "reply")):
            a.status = "done"
    for desc, a in existing.items():  # rule changes may invalidate earlier local extractions
        if desc not in wanted and a.status == "open":
            session.delete(a)


def _sync_followup(session: Session, thread: m.Thread, status: str, last: m.Email, followup_days: int) -> None:
    open_fus = session.scalars(select(m.Followup).where(m.Followup.thread_id == thread.id)).all()
    for fu in open_fus:
        if fu.kind != status and fu.status == "open":
            fu.status = "resolved"
    if status in {"needs_reply", "awaiting_reply"}:
        fu = next((f for f in open_fus if f.kind == status), None)
        if fu is None:
            fu = m.Followup(thread_id=thread.id, kind=status)
            session.add(fu)
        if fu.email_id != last.id:  # a new message re-opens the follow-up
            fu.status = "open"
        fu.email_id, fu.since = last.id, last.internal_date
        fu.due_at = last.internal_date + timedelta(days=followup_days)


def analyse_threads(session: Session, thread_ids: Iterable[int | None]) -> int:
    addrs = my_addresses(session)
    rules = RuleSet.load(session, addrs)
    names = my_names(session, addrs)
    followup_days = int(get_setting(session, "followup_days") or 3)
    count = 0
    for tid in sorted({t for t in thread_ids if t is not None}):
        thread = session.get(m.Thread, tid)
        if thread is None:
            continue
        emails = session.scalars(select(m.Email).where(m.Email.thread_id == tid).order_by(m.Email.internal_date, m.Email.id)).all()
        if not emails:
            continue
        rels: dict[int, str] = {}
        suspicious: set[int] = set()
        results = {}
        for e in emails:
            e.is_from_me = e.is_from_me or rules.is_me(e.from_addr)
            r = classify_email(e, rules)
            dup = _find_duplicate(session, e)
            results[e.id] = (r, dup)
            rels[e.id] = r.relationship
            if "suspicious" in r.categories:
                suspicious.add(e.id)
            _upsert_classification(session, e, r, dup)
            if e.sender is not None and r.relationship == "me":
                e.sender.relationship_type = "me"
            elif e.sender is not None:
                e.sender.relationship_type = r.relationship
                e.sender.is_trusted = rules.is_trusted(e.from_addr)
                e.sender.is_newsletter = r.relationship == "newsletter" or "promotion" in r.categories
        session.flush()
        last_mine_idx = max((i for i, e in enumerate(emails) if e.is_from_me), default=-1)
        for i, e in enumerate(emails):
            r, dup = results[e.id]
            qualifies = (not e.is_from_me and r.relationship in HUMAN and e.id not in suspicious and dup is None
                         and not rules.any_match(e.from_addr, rules.ignore))
            extracted = extract_actions(e.body_text or e.snippet or "", e.internal_date, names) if qualifies else []
            _sync_actions(session, e, extracted, replied_after=i < last_mine_idx, close_all=False)
        session.flush()
        open_mine = session.scalar(select(m.Action.id).where(
            m.Action.thread_id == tid, m.Action.status == "open", m.Action.owner == "me").limit(1))
        st = thread_state(emails, rels, 1 if open_mine else 0, suspicious)
        if st.status == "completed":  # close local open actions of a resolved conversation
            for a in session.scalars(select(m.Action).where(m.Action.thread_id == tid, m.Action.status == "open",
                                                            m.Action.source == "local")):
                a.status = "done"
        thread.status, thread.status_reason = st.status, st.reason
        for i, e in enumerate(emails):
            c = e.classification
            if i == len(emails) - 1:
                c.response_state = st.status
            elif not e.is_from_me and i < last_mine_idx:
                c.response_state = "completed"
            else:
                c.response_state = "informational"
        _sync_followup(session, thread, st.status, emails[-1], followup_days)
        count += 1
    session.flush()
    return count


def analyse_all(session: Session) -> int:
    return analyse_threads(session, session.scalars(select(m.Thread.id)).all())


def overdue_followups(session: Session) -> list[m.Followup]:
    return list(session.scalars(select(m.Followup).where(m.Followup.status == "open", m.Followup.due_at < utcnow())))
