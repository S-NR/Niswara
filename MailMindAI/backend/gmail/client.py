"""Gmail connector: a read-only adapter over the official Gmail API v1.

This is the ONLY Gmail connectivity in MailMind. The adapter deliberately
exposes read methods only - there is no code path that sends, modifies,
labels, archives, trashes or deletes mail.

Gmail API methods used (all read-only, all allowed by gmail.readonly):
  users.getProfile, users.messages.list, users.messages.get, users.history.list
"""
from __future__ import annotations

import json
import logging
import random
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any, Protocol, TypeVar

from backend.gmail.errors import (
    GmailAuthError,
    GmailError,
    GmailHistoryExpiredError,
    GmailNotFoundError,
    GmailRateLimitError,
    GmailTransientError,
)

log = logging.getLogger(__name__)
T = TypeVar("T")


@dataclass
class HistoryPage:
    added_ids: list[str] = field(default_factory=list)
    deleted_ids: list[str] = field(default_factory=list)
    label_changed_ids: list[str] = field(default_factory=list)
    next_page_token: str | None = None
    history_id: str | None = None


class GmailSource(Protocol):
    """Read-only Gmail interface used by the sync engine."""

    def get_profile(self) -> dict[str, Any]: ...

    def list_message_ids(
        self, query: str, page_token: str | None = None, max_results: int = 100
    ) -> tuple[list[str], str | None, int]: ...

    def get_message(self, message_id: str) -> dict[str, Any]: ...

    def list_history(self, start_history_id: str, page_token: str | None = None) -> HistoryPage: ...


def map_http_error(exc: Exception, *, context: str = "") -> GmailError:
    """Translate googleapiclient.errors.HttpError (or similar) into typed errors."""
    status = getattr(getattr(exc, "resp", None), "status", None)
    try:
        status = int(status) if status is not None else None
    except (TypeError, ValueError):
        status = None
    reason = ""
    content = getattr(exc, "content", b"") or b""
    try:
        body = json.loads(content.decode("utf-8") if isinstance(content, bytes) else content)
        errs = body.get("error", {}).get("errors") or []
        reason = errs[0].get("reason", "") if errs else body.get("error", {}).get("status", "")
    except Exception:  # noqa: BLE001 - body is best-effort
        pass
    msg = f"{context}: HTTP {status} {reason}".strip()
    if status == 401:
        return GmailAuthError(msg)
    if status == 429 or reason in {"rateLimitExceeded", "userRateLimitExceeded", "RESOURCE_EXHAUSTED"}:
        return GmailRateLimitError(msg)
    if status == 403:
        return GmailAuthError(msg)
    if status == 404:
        return GmailHistoryExpiredError(msg) if context == "history" else GmailNotFoundError(msg)
    if status is None or status >= 500:
        return GmailTransientError(msg or f"{context}: {exc.__class__.__name__}")
    return GmailError(msg)


# Gmail API quota cost (units) per method - https://developers.google.com/gmail/api/reference/quota
QUOTA_COST = {"profile": 1, "list": 5, "message": 5, "history": 2}
RATE_LIMIT_DELAYS = (15.0, 30.0, 60.0, 60.0, 60.0)  # per-minute quotas need us to wait out the window


class QuotaPacer:
    """Client-side throttle that keeps Gmail usage under a per-minute unit budget.

    Gmail enforces "units per minute per user"; new Cloud projects can have low
    limits. The pacer spreads calls over a sliding 60 s window and halves its own
    budget whenever Gmail still reports a rate limit (adaptive), never below
    ``min_units``.
    """

    WINDOW = 60.0

    def __init__(self, units_per_minute: int, min_units: int = 50,
                 clock: Callable[[], float] = time.monotonic, sleep: Callable[[float], None] = time.sleep):
        self.limit = max(min_units, int(units_per_minute))
        self.min_units = min_units
        self._clock, self._sleep = clock, sleep
        self._events: list[tuple[float, int]] = []

    def _used(self, now: float) -> int:
        self._events = [(t, c) for t, c in self._events if now - t < self.WINDOW]
        return sum(c for _, c in self._events)

    def acquire(self, cost: int) -> None:
        while True:
            now = self._clock()
            if self._used(now) + cost <= self.limit or not self._events:
                self._events.append((now, cost))
                return
            wait = self.WINDOW - (now - self._events[0][0]) + 0.05
            self._sleep(max(0.05, wait))

    def on_rate_limited(self) -> None:
        new = max(self.min_units, self.limit // 2)
        if new != self.limit:
            log.warning("Gmail rate limit hit: lowering pace from %d to %d units/min", self.limit, new)
        self.limit = new


def with_retries(
    fn: Callable[[], T], *, context: str, attempts: int = 5, base_delay: float = 1.0,
    sleep: Callable[[float], None] = time.sleep, on_rate_limited: Callable[[], None] | None = None,
    rate_limit_delays: tuple[float, ...] = RATE_LIMIT_DELAYS,
) -> T:
    """Call fn with backoff: short exponential delays for transient errors, and
    window-length waits (15-60 s) for per-minute quota errors."""
    transient_tries = rate_tries = 0
    while True:
        try:
            return fn()
        except GmailError:
            raise
        except Exception as exc:  # noqa: BLE001 - mapped below
            err = map_http_error(exc, context=context)
            if isinstance(err, GmailRateLimitError) and rate_tries < min(attempts - 1, len(rate_limit_delays)):
                delay = rate_limit_delays[rate_tries] + random.uniform(0, 2)
                rate_tries += 1
                if on_rate_limited:
                    on_rate_limited()
                log.warning("Gmail %s rate-limited; waiting %.0fs (retry %d)", context, delay, rate_tries)
                sleep(delay)
                continue
            if isinstance(err, GmailTransientError) and transient_tries < attempts - 1:
                delay = base_delay * (2 ** transient_tries) + random.uniform(0, base_delay)
                transient_tries += 1
                log.warning("Gmail %s failed (%s); retry %d/%d in %.1fs", context, err, transient_tries, attempts - 1, delay)
                sleep(delay)
                continue
            raise err from exc


class GmailApiAdapter:
    """GmailSource backed by google-api-python-client."""

    def __init__(self, credentials: Any, service: Any | None = None, sleep: Callable[[float], None] = time.sleep,
                 units_per_minute: int | None = None):
        if service is None:
            from googleapiclient.discovery import build

            service = build("gmail", "v1", credentials=credentials, cache_discovery=False)
        if units_per_minute is None:
            from backend.config import get_settings

            units_per_minute = get_settings().gmail_units_per_minute
        self._users = service.users()
        self._sleep = sleep
        self.pacer = QuotaPacer(units_per_minute, sleep=sleep)

    def _call(self, request_factory: Callable[[], Any], context: str) -> Any:
        def attempt() -> Any:
            self.pacer.acquire(QUOTA_COST.get(context, 5))
            return request_factory().execute()

        return with_retries(attempt, context=context, sleep=self._sleep, on_rate_limited=self.pacer.on_rate_limited)

    def get_profile(self) -> dict[str, Any]:
        return self._call(lambda: self._users.getProfile(userId="me"), "profile")

    def list_message_ids(self, query: str, page_token: str | None = None, max_results: int = 100):
        resp = self._call(
            lambda: self._users.messages().list(
                userId="me", q=query, pageToken=page_token, maxResults=max_results, includeSpamTrash=False
            ),
            "list",
        )
        ids = [m["id"] for m in resp.get("messages", [])]
        return ids, resp.get("nextPageToken"), int(resp.get("resultSizeEstimate", 0))

    def get_message(self, message_id: str) -> dict[str, Any]:
        return self._call(lambda: self._users.messages().get(userId="me", id=message_id, format="full"), "message")

    def list_history(self, start_history_id: str, page_token: str | None = None) -> HistoryPage:
        resp = self._call(
            lambda: self._users.history().list(
                userId="me", startHistoryId=start_history_id, pageToken=page_token,
                historyTypes=["messageAdded", "messageDeleted", "labelAdded", "labelRemoved"],
            ),
            "history",
        )
        page = HistoryPage(next_page_token=resp.get("nextPageToken"), history_id=resp.get("historyId"))
        for h in resp.get("history", []):
            page.added_ids += [x["message"]["id"] for x in h.get("messagesAdded", [])]
            page.deleted_ids += [x["message"]["id"] for x in h.get("messagesDeleted", [])]
            for key in ("labelsAdded", "labelsRemoved"):
                page.label_changed_ids += [x["message"]["id"] for x in h.get(key, [])]
        return page


def build_default_source() -> GmailApiAdapter:
    from backend.gmail.auth import load_credentials

    creds = load_credentials()
    if creds is None:
        raise GmailAuthError("Not signed in to Gmail. Run scripts/login.ps1 first.")
    return GmailApiAdapter(creds)
