"""Write parsed Gmail messages into the local database (idempotent upserts)."""
from __future__ import annotations

from sqlalchemy import Integer, cast, func, select
from sqlalchemy.orm import Session

from backend.db import models as m
from backend.gmail.parser import ParsedMessage


def get_or_create_sender(session: Session, email: str, name: str | None) -> m.Sender | None:
    if not email:
        return None
    sender = session.scalar(select(m.Sender).where(m.Sender.email == email))
    if sender is None:
        sender = m.Sender(email=email, name=name or None, domain=email.rsplit("@", 1)[-1])
        session.add(sender)
        session.flush()
    elif name and not sender.name:
        sender.name = name
    return sender


def get_or_create_thread(session: Session, gmail_thread_id: str, subject: str | None) -> m.Thread:
    thread = session.scalar(select(m.Thread).where(m.Thread.gmail_thread_id == gmail_thread_id))
    if thread is None:
        thread = m.Thread(gmail_thread_id=gmail_thread_id, subject=subject, participants=[])
        session.add(thread)
        session.flush()
    return thread


def refresh_thread_aggregates(session: Session, thread: m.Thread) -> None:
    emails = session.scalars(
        select(m.Email).where(m.Email.thread_id == thread.id).order_by(m.Email.internal_date, m.Email.id)
    ).all()
    if not emails:
        return
    thread.message_count = len(emails)
    thread.first_date = emails[0].internal_date
    thread.last_date = emails[-1].internal_date
    thread.subject = next((e.subject for e in emails if e.subject), thread.subject)
    people: list[str] = []
    for e in emails:
        for a in [e.from_addr, *(e.to_addrs or []), *(e.cc_addrs or [])]:
            if a and a not in people:
                people.append(a)
    thread.participants = people
    thread.last_from_me = emails[-1].is_from_me


def refresh_sender_stats(session: Session, sender: m.Sender) -> None:
    row = session.execute(
        select(
            func.count(m.Email.id),
            func.sum(cast(m.Email.is_unread, Integer)),
            func.min(m.Email.internal_date),
            func.max(m.Email.internal_date),
        ).where(m.Email.sender_id == sender.id)
    ).one()
    count, unread, first, last = row
    sender.message_count = int(count or 0)
    sender.unread_count = int(unread or 0)
    sender.first_seen, sender.last_seen = first, last
    if first and last and count:
        weeks = max((last - first).days / 7.0, 1.0)
        sender.per_week = round(count / weeks, 2)


def upsert_message(
    session: Session, p: ParsedMessage, my_addresses: set[str], store_bodies: bool = True
) -> tuple[m.Email, bool]:
    """Insert or update one message. Returns (email, created). Duplicate-safe on gmail_id."""
    email = session.scalar(select(m.Email).where(m.Email.gmail_id == p.gmail_id))
    created = email is None
    thread = get_or_create_thread(session, p.gmail_thread_id, p.subject)
    sender = get_or_create_sender(session, p.from_addr, p.from_name)
    if created:
        email = m.Email(gmail_id=p.gmail_id, gmail_thread_id=p.gmail_thread_id, internal_date=p.internal_date)
        session.add(email)
    assert email is not None
    email.thread_id = thread.id
    email.sender_id = sender.id if sender else None
    email.history_id = p.history_id
    email.internal_date = p.internal_date
    email.subject = p.subject
    email.from_addr = p.from_addr
    email.from_name = p.from_name
    email.to_addrs = p.to_addrs
    email.cc_addrs = p.cc_addrs
    email.label_ids = p.label_ids
    email.is_unread = p.is_unread
    email.is_from_me = "SENT" in p.label_ids or p.from_addr in my_addresses
    email.snippet = p.snippet
    if store_bodies and not email.body_purged:
        email.body_text = p.body_text
    email.content_hash = p.content_hash
    email.size_estimate = p.size_estimate
    email.attachment_meta = p.attachments
    email.has_attachments = bool(p.attachments)
    email.list_unsubscribe = p.list_unsubscribe
    email.list_id = p.list_id
    email.message_id_header = p.message_id_header
    email.in_reply_to = p.in_reply_to
    email.auto_flags = {"precedence": p.precedence, "auto_submitted": p.auto_submitted}
    session.flush()
    refresh_thread_aggregates(session, thread)
    if sender:
        refresh_sender_stats(session, sender)
    return email, created


def delete_local_message(session: Session, gmail_id: str) -> bool:
    """Remove the LOCAL copy of a message that was permanently deleted in Gmail."""
    email = session.scalar(select(m.Email).where(m.Email.gmail_id == gmail_id))
    if email is None:
        return False
    thread = email.thread
    session.delete(email)
    session.flush()
    if thread is not None:
        if session.scalar(select(func.count(m.Email.id)).where(m.Email.thread_id == thread.id)):
            refresh_thread_aggregates(session, thread)
        else:
            session.delete(thread)
    return True
