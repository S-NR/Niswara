"""Synchronisation engine.

Modes
  full         - latest N days (initial_sync_days), paginated
  incremental  - Gmail history API from the last stored historyId
  backfill     - an additional window older than what is already cached
  range        - a user-chosen date window (from/to, inclusive), e.g. last year
  auto         - resume an interrupted run, else incremental, else full

Guarantees
  * Read-only: only list/get/history calls are made.
  * Duplicate prevention: messages already cached are skipped during listing
    and upserts are keyed on gmail_id (unique constraint).
  * Recovery: after each committed page the next page token is persisted, so an
    interrupted full/backfill sync resumes where it stopped.
  * Attachments are never downloaded.
"""
from __future__ import annotations

import logging
import threading
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field, fields
from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from backend.config import Settings, get_settings
from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_setting, get_sync_state
from backend.gmail.client import GmailSource
from backend.gmail.errors import GmailError, GmailHistoryExpiredError, GmailNotFoundError
from backend.gmail.parser import parse_message
from backend.security.audit import audit
from backend.sync.ingest import delete_local_message, upsert_message

log = logging.getLogger(__name__)
PostProcess = Callable[[Session, set[int]], None]


@dataclass
class SyncProgress:
    running: bool = False
    mode: str | None = None
    phase: str = "idle"
    listed: int = 0
    fetched: int = 0
    estimated_total: int = 0
    error: str | None = None
    run_id: int | None = None
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def update(self, **kw: Any) -> None:
        with self._lock:
            for k, v in kw.items():
                setattr(self, k, v)

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return {f.name: getattr(self, f.name) for f in fields(self) if not f.name.startswith("_")}


PROGRESS = SyncProgress()
_RUN_LOCK = threading.Lock()


class SyncAlreadyRunning(RuntimeError):
    pass


def _gmail_date(dt) -> str:  # noqa: ANN001
    return dt.strftime("%Y/%m/%d")


class SyncEngine:
    def __init__(
        self,
        source: GmailSource,
        factory: sessionmaker[Session],
        settings: Settings | None = None,
        post_process: PostProcess | None = None,
        progress: SyncProgress | None = None,
    ):
        self.source = source
        self.factory = factory
        self.settings = settings or get_settings()
        self.post_process = post_process
        self.progress = progress or PROGRESS

    # ------------------------------------------------------------------ public
    def run(self, mode: str = "auto", backfill_days: int | None = None,
            date_from: date | None = None, date_to: date | None = None) -> dict[str, Any]:
        if mode == "range":
            if date_from is None or date_to is None:
                raise ValueError("range sync needs date_from and date_to")
            if date_from > date_to:
                raise ValueError("date_from must not be after date_to")
        if not _RUN_LOCK.acquire(blocking=False):
            raise SyncAlreadyRunning("A sync is already running")
        try:
            self._range = (date_from, date_to)
            return self._run(mode, backfill_days)
        finally:
            _RUN_LOCK.release()

    # ----------------------------------------------------------------- private
    def _run(self, mode: str, backfill_days: int | None) -> dict[str, Any]:
        with self.factory() as s:
            state = get_sync_state(s)
            if mode == "auto":
                if state.status == "interrupted" and state.resume_query:
                    mode = "resume"
                elif state.last_history_id:
                    mode = "incremental"
                else:
                    mode = "full"
            run = m.SyncRun(kind=mode, status="running")
            s.add(run)
            state.status = "running"
            extra = {}
            if mode == "range":
                extra = {"date_from": self._range[0].isoformat(), "date_to": self._range[1].isoformat()}
            audit(s, "user", "sync.start", "sync_run", None, mode=mode, **extra)
            s.commit()
            run_id = run.id
        self.progress.update(running=True, mode=mode, phase="starting", listed=0, fetched=0,
                             estimated_total=0, error=None, run_id=run_id)
        stats = {"listed": 0, "fetched": 0, "inserted": 0, "updated": 0, "skipped": 0, "errors": 0}
        touched: set[int] = set()
        final_status = "completed"
        error: str | None = None
        try:
            if mode == "incremental":
                try:
                    self._incremental(stats, touched)
                except GmailHistoryExpiredError:
                    log.warning("History expired; falling back to full sync")
                    self._full(stats, touched, query=None, resume_token=None)
            elif mode == "resume":
                with self.factory() as s:
                    st = get_sync_state(s)
                    q, tok = st.resume_query, st.resume_page_token
                self._full(stats, touched, query=q, resume_token=tok)
            elif mode == "backfill":
                self._backfill(stats, touched, backfill_days or self.settings.backfill_days)
            elif mode == "range":
                self._date_range(stats, touched, *self._range)
            elif mode == "full":
                self._full(stats, touched, query=None, resume_token=None)
            else:
                raise ValueError(f"unknown sync mode {mode}")
            if self.post_process and touched:
                self.progress.update(phase="analysing")
                with self.factory() as s:
                    self.post_process(s, touched)
                    s.commit()
        except Exception as exc:  # noqa: BLE001 - recorded, then re-raised for callers that care
            error = f"{exc.__class__.__name__}: {exc}"
            log.exception("Sync failed")
            with self.factory() as s:
                st = get_sync_state(s)
                final_status = "interrupted" if st.resume_query else "failed"
        finally:
            with self.factory() as s:
                run = s.get(m.SyncRun, run_id)
                st = get_sync_state(s)
                st.status = "idle" if final_status == "completed" else final_status
                run.status = final_status
                run.finished_at = utcnow()
                run.error_message = error
                for k, v in stats.items():
                    setattr(run, k, v)
                audit(s, "system", f"sync.{final_status}", "sync_run", run_id, **stats)
                s.commit()
            self.progress.update(running=False, phase=final_status, error=error)
        return {"run_id": run_id, "mode": mode, "status": final_status, "error": error, **stats}

    def _my_addresses(self, s: Session) -> set[str]:
        st = get_sync_state(s)
        extra = {a.lower() for a in (get_setting(s, "my_addresses") or [])}
        return extra | ({st.account_email.lower()} if st.account_email else set())

    def _ingest_ids(self, ids: Iterable[str], stats: dict[str, int], touched: set[int], *, force: bool) -> None:
        with self.factory() as s:
            me = self._my_addresses(s)
            existing = set(s.scalars(select(m.Email.gmail_id).where(m.Email.gmail_id.in_(list(ids)))).all())
            for gid in ids:
                if gid in existing and not force:
                    stats["skipped"] += 1
                    continue
                try:
                    raw = self.source.get_message(gid)
                except GmailNotFoundError:
                    stats["skipped"] += 1
                    continue
                except GmailError:
                    stats["errors"] += 1
                    raise
                parsed = parse_message(raw, self.settings.max_body_chars)
                email, created = upsert_message(s, parsed, me, self.settings.store_bodies)
                stats["fetched"] += 1
                stats["inserted" if created else "updated"] += 1
                touched.add(email.thread_id)  # type: ignore[arg-type]
                self.progress.update(fetched=stats["fetched"])
            s.commit()

    def _start_window(self, s: Session) -> None:
        profile = self.source.get_profile()
        st = get_sync_state(s)
        st.account_email = profile.get("emailAddress", st.account_email)
        st.pending_history_id = str(profile.get("historyId")) if profile.get("historyId") else None

    def _paged_listing(self, query: str, resume_token: str | None, stats: dict[str, int], touched: set[int]) -> None:
        token = resume_token
        while True:
            self.progress.update(phase="listing")
            ids, next_token, estimate = self.source.list_message_ids(query, token, self.settings.sync_page_size)
            stats["listed"] += len(ids)
            self.progress.update(listed=stats["listed"], estimated_total=max(estimate, stats["listed"]), phase="fetching")
            self._ingest_ids(ids, stats, touched, force=False)
            with self.factory() as s:  # checkpoint after the page is committed
                st = get_sync_state(s)
                st.resume_query, st.resume_page_token = query, next_token
                s.commit()
            if not next_token:
                return
            token = next_token

    def _full(self, stats: dict[str, int], touched: set[int], query: str | None, resume_token: str | None) -> None:
        with self.factory() as s:
            st = get_sync_state(s)
            if query is None or st.pending_history_id is None:
                self._start_window(s)
            if query is None:
                since = utcnow() - timedelta(days=self.settings.initial_sync_days)
                query = f"after:{_gmail_date(since)}"
                st.oldest_synced = since
            st.resume_query, st.resume_page_token = query, resume_token
            s.commit()
        self._paged_listing(query, resume_token, stats, touched)
        with self.factory() as s:
            st = get_sync_state(s)
            st.last_history_id = st.pending_history_id or st.last_history_id
            st.last_full_sync_at = utcnow()
            st.resume_query = st.resume_page_token = None
            s.commit()
        if self.settings.backfill_days > 0:
            self._backfill(stats, touched, self.settings.backfill_days)

    def _backfill(self, stats: dict[str, int], touched: set[int], days: int) -> None:
        if days <= 0:
            return
        with self.factory() as s:
            st = get_sync_state(s)
            end = st.oldest_synced or utcnow()
            start = end - timedelta(days=days)
            query = f"after:{_gmail_date(start)} before:{_gmail_date(end + timedelta(days=1))}"
            st.resume_query, st.resume_page_token = query, None
            s.commit()
        self._paged_listing(query, None, stats, touched)
        with self.factory() as s:
            st = get_sync_state(s)
            st.oldest_synced = start
            st.resume_query = st.resume_page_token = None
            s.commit()

    def _date_range(self, stats: dict[str, int], touched: set[int], date_from: date, date_to: date) -> None:
        """Fetch every message dated date_from..date_to (inclusive). Already-cached ones are skipped.

        Uses the same checkpointing as a full sync, so an interrupted range sync can be resumed.
        It does not change the incremental history pointer unless none exists yet.
        """
        start = datetime.combine(date_from, datetime.min.time())
        end_excl = datetime.combine(date_to, datetime.min.time()) + timedelta(days=1)
        query = f"after:{_gmail_date(start)} before:{_gmail_date(end_excl)}"
        with self.factory() as s:
            st = get_sync_state(s)
            if not st.last_history_id or not st.account_email:
                self._start_window(s)
            st.resume_query, st.resume_page_token = query, None
            s.commit()
        self._paged_listing(query, None, stats, touched)
        with self.factory() as s:
            st = get_sync_state(s)
            if not st.last_history_id and st.pending_history_id:
                st.last_history_id = st.pending_history_id
            if st.oldest_synced is None or start < st.oldest_synced:
                st.oldest_synced = start
            st.resume_query = st.resume_page_token = None
            s.commit()

    def _incremental(self, stats: dict[str, int], touched: set[int]) -> None:
        with self.factory() as s:
            start = get_sync_state(s).last_history_id
        assert start
        token: str | None = None
        added: list[str] = []
        changed: list[str] = []
        deleted: list[str] = []
        latest = start
        self.progress.update(phase="listing")
        while True:
            page = self.source.list_history(start, token)
            added += page.added_ids
            changed += page.label_changed_ids
            deleted += page.deleted_ids
            latest = page.history_id or latest
            if not page.next_page_token:
                break
            token = page.next_page_token
        deleted_set = set(deleted)
        added = list(dict.fromkeys(a for a in added if a not in deleted_set))
        changed = list(dict.fromkeys(c for c in changed if c not in deleted_set and c not in added))
        stats["listed"] = len(added) + len(changed)
        self.progress.update(listed=stats["listed"], estimated_total=stats["listed"], phase="fetching")
        if added:
            self._ingest_ids(added, stats, touched, force=False)
        if changed:  # label changes (read/unread etc.) - refresh cached copies we have
            with self.factory() as s:
                have = list(s.scalars(select(m.Email.gmail_id).where(m.Email.gmail_id.in_(changed))).all())
            self._ingest_ids(have, stats, touched, force=True)
        if deleted_set:
            with self.factory() as s:
                for gid in deleted_set:
                    email = s.scalar(select(m.Email).where(m.Email.gmail_id == gid))
                    if email and email.thread_id:
                        touched.add(email.thread_id)
                    delete_local_message(s, gid)
                s.commit()
        with self.factory() as s:
            st = get_sync_state(s)
            st.last_history_id = latest
            st.last_incremental_at = utcnow()
            s.commit()
