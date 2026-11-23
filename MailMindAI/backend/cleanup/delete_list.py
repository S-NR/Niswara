"""Delete list: user-approved, automatic "move to Trash" for chosen senders.

Lifecycle of a rule
  1. add      - sender pattern + "older than N days"; INACTIVE
  2. preview  - exact local count + sample of what would be trashed
  3. approve  - the user confirms the previewed count -> active
  4. run      - after every sync (and once right after approval), matching
                mail is moved to Gmail's Trash (recoverable for 30 days)
  5. undo     - any run can be restored from Trash

Protections (applied at preview AND at execution time)
  * never: your own mail, Starred or Important messages, senders you marked
    trusted / manager / client, your own addresses
  * refuses whole-domain rules for public mail providers (e.g. @gmail.com)
  * max messages per run; global pause switch; every action audit-logged
  * only messages.trash / untrash are used - permanent deletion is impossible
"""
from __future__ import annotations

import logging
import threading
from datetime import timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from backend.config import get_settings
from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_setting
from backend.gmail.errors import GmailAuthError, GmailError, GmailNotFoundError
from backend.intelligence.pipeline import analyse_threads, my_addresses
from backend.intelligence.rules import RuleSet, _addr_match, validate_pattern
from backend.security.audit import audit

log = logging.getLogger(__name__)
PROTECTED_LABELS = {"STARRED", "IMPORTANT"}
PUBLIC_PROVIDERS = {
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "yahoo.com", "yahoo.co.in",
    "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com", "rediffmail.com", "zoho.com", "gmx.com",
    "gmx.de", "web.de", "mail.com", "yandex.com",
}
RUN_LOCK = threading.Lock()


class DeleteListError(ValueError):
    pass


def validate_delete_pattern(session: Session, pattern: str) -> str:
    p = validate_pattern("trusted_sender", pattern)  # same address / @domain syntax
    if p.startswith("@") and p[1:] in PUBLIC_PROVIDERS:
        raise DeleteListError(f"{p} would match everyone using that mail provider. Add the exact address instead.")
    if any(_addr_match(a, p) for a in my_addresses(session)):
        raise DeleteListError("That pattern matches your own address.")
    return p


def _protection_reason(e: m.Email, rules: RuleSet) -> str | None:
    if e.is_from_me:
        return "sent by you"
    labels = set(e.label_ids or [])
    if labels & PROTECTED_LABELS:
        return "starred/important"
    if rules.is_trusted(e.from_addr):
        return "trusted/manager/client sender"
    return None


def matching(session: Session, rule: m.DeleteRule) -> tuple[list[m.Email], dict[str, int]]:
    """Emails the rule would trash now, plus counts of protected matches by reason."""
    rules = RuleSet.load(session, my_addresses(session))
    cutoff = utcnow() - timedelta(days=rule.older_than_days)
    q = select(m.Email).where(m.Email.internal_date < cutoff)
    if rule.pattern.startswith("@"):
        q = q.where(m.Email.from_addr.like(f"%{rule.pattern}") | m.Email.from_addr.like(f"%.{rule.pattern[1:]}"))
    else:
        q = q.where(m.Email.from_addr == rule.pattern)
    out: list[m.Email] = []
    protected: dict[str, int] = {}
    for e in session.scalars(q.order_by(m.Email.internal_date)):
        if not _addr_match(e.from_addr or "", rule.pattern):
            continue
        reason = _protection_reason(e, rules)
        if reason:
            protected[reason] = protected.get(reason, 0) + 1
        else:
            out.append(e)
    return out, protected


def preview(session: Session, rule: m.DeleteRule) -> dict[str, Any]:
    emails, protected = matching(session, rule)
    return {
        "rule_id": rule.id, "pattern": rule.pattern, "older_than_days": rule.older_than_days,
        "count": len(emails), "protected": protected,
        "sample": [{"id": e.id, "subject": e.subject, "from_addr": e.from_addr,
                    "date": e.internal_date.isoformat() + "Z", "gmail_url": e.gmail_url} for e in emails[-10:][::-1]],
        "note": "Only mail cached by MailMind (your synced window) is checked. Trashed mail stays recoverable "
                "in Gmail's Trash for 30 days.",
    }


def approve(session: Session, rule: m.DeleteRule, seen_count: int) -> None:
    current = len(matching(session, rule)[0])
    if current != seen_count:
        raise DeleteListError(f"The preview changed ({seen_count} -> {current} emails). Review it again.")
    rule.approved_at, rule.approved_preview_count, rule.enabled = utcnow(), seen_count, True
    audit(session, "user", "delete_rule.approve", "delete_rule", rule.id, pattern=rule.pattern,
          older_than_days=rule.older_than_days, count=seen_count)


def active_rules(session: Session) -> list[m.DeleteRule]:
    return list(session.scalars(select(m.DeleteRule).where(m.DeleteRule.enabled.is_(True),
                                                          m.DeleteRule.approved_at.is_not(None))))


def run_rules(factory: sessionmaker[Session], writer: Any, trigger: str,
              rule_ids: list[int] | None = None) -> dict[str, Any]:
    """Move matching mail of active rules to Trash. Returns a summary (never raises on Gmail errors)."""
    if not RUN_LOCK.acquire(blocking=False):
        return {"status": "skipped", "reason": "another delete run is in progress"}
    try:
        with factory() as s:
            if get_setting(s, "auto_delete_paused"):
                return {"status": "skipped", "reason": "delete list is paused"}
            rules = [r for r in active_rules(s) if rule_ids is None or r.id in rule_ids]
            if not rules:
                return {"status": "skipped", "reason": "no active rules"}
            run = m.DeleteRun(trigger=trigger, status="running")
            s.add(run)
            audit(s, "system" if trigger == "after_sync" else "user", "delete_run.start", trigger=trigger,
                  rules=[r.id for r in rules])
            s.commit()
            run_id = run.id
            limit = get_settings().max_trash_per_run
            plan: list[tuple[int, int]] = []  # (rule_id, email_id)
            for r in rules:
                plan += [(r.id, e.id) for e in matching(s, r)[0]]
            truncated = max(0, len(plan) - limit)
            plan = plan[:limit]
        from backend.sync.ingest import delete_local_message

        status, error = "completed", None
        for i, (rule_id, email_id) in enumerate(plan):
            with factory() as s:
                e = s.get(m.Email, email_id)
                if e is None:
                    continue
                item = m.DeleteRunItem(run_id=run_id, rule_id=rule_id, gmail_id=e.gmail_id,
                                       gmail_thread_id=e.gmail_thread_id, from_addr=e.from_addr, subject=e.subject,
                                       email_date=e.internal_date, status="trashed")
                try:
                    writer.trash(e.gmail_id)
                except GmailNotFoundError:
                    item.status, item.error = "failed", "no longer in Gmail"
                except GmailAuthError as exc:
                    status, error = "failed", f"Gmail refused: {exc}"
                    break
                except GmailError as exc:
                    item.status, item.error = "failed", str(exc)[:500]
                    status, error = "partial", str(exc)[:500]
                s.add(item)
                run = s.get(m.DeleteRun, run_id)
                if item.status == "trashed":
                    run.trashed += 1
                    rule = s.get(m.DeleteRule, rule_id)
                    if rule:
                        rule.total_trashed += 1
                    delete_local_message(s, item.gmail_id)  # keep the local cache in step with Gmail
                else:
                    run.failed += 1
                s.commit()
                if status == "partial" and run.failed >= 5:
                    break  # repeated failures: stop and let the user look
        with factory() as s:
            run = s.get(m.DeleteRun, run_id)
            run.status, run.finished_at = status, utcnow()
            run.error = error or (f"{truncated} more matching emails left for the next run (limit {limit})" if truncated else None)
            for r in s.scalars(select(m.DeleteRule).where(m.DeleteRule.id.in_([x.id for x in rules]))):
                r.last_run_at = utcnow()
            audit(s, "system" if trigger == "after_sync" else "user", f"delete_run.{status}", "delete_run", run_id,
                  trashed=run.trashed, failed=run.failed, remaining=truncated)
            s.commit()
            return {"status": status, "run_id": run_id, "trashed": run.trashed, "failed": run.failed,
                    "remaining": truncated, "error": run.error}
    finally:
        RUN_LOCK.release()


def undo_run(factory: sessionmaker[Session], writer: Any, reader: Any, run_id: int) -> dict[str, Any]:
    """Restore a run's messages from Trash and re-cache them locally."""
    from backend.gmail.parser import parse_message
    from backend.sync.ingest import upsert_message

    with RUN_LOCK:
        with factory() as s:
            run = s.get(m.DeleteRun, run_id)
            if run is None:
                raise DeleteListError("run not found")
            items = [(i.id, i.gmail_id) for i in run.items if i.status == "trashed"]
            audit(s, "user", "delete_run.undo_start", "delete_run", run_id, items=len(items))
            s.commit()
        restored = failed = 0
        touched: set[int] = set()
        for item_id, gid in items:
            with factory() as s:
                item = s.get(m.DeleteRunItem, item_id)
                try:
                    writer.untrash(gid)
                    item.status = "restored"
                    restored += 1
                    try:
                        email, _ = upsert_message(s, parse_message(reader.get_message(gid), get_settings().max_body_chars),
                                                  my_addresses(s), get_settings().store_bodies)
                        touched.add(email.thread_id)
                    except GmailError:
                        pass  # restored in Gmail; the next sync will re-cache it
                except GmailError as exc:
                    item.status, item.error = "restore_failed", str(exc)[:500]
                    failed += 1
                s.commit()
        with factory() as s:
            if touched:
                analyse_threads(s, touched)
            run = s.get(m.DeleteRun, run_id)
            run.restored += restored
            run.undone_at = utcnow()
            run.status = "undone" if not failed else "partially_undone"
            audit(s, "user", "delete_run.undone", "delete_run", run_id, restored=restored, failed=failed)
            s.commit()
        return {"run_id": run_id, "restored": restored, "failed": failed}
