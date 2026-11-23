"""Opt-in Gmail writer: move to Trash / restore from Trash. NOTHING else.

Used only by the delete list (backend/cleanup/delete_list.py) for rules the
user approved. Requires the ``gmail.modify`` scope granted via
``login.ps1 -EnableCleanup``. Permanent deletion is impossible by design:
MailMind never requests ``https://mail.google.com/``, and this class has no
delete/send/modify-labels method. Trashed mail stays recoverable in Gmail's
Trash for 30 days, and every run can be undone from the dashboard.

Gmail API methods used: users.messages.trash, users.messages.untrash.
"""
from __future__ import annotations

import time
from collections.abc import Callable
from typing import Any, Protocol

from backend.gmail.client import QuotaPacer, with_retries
from backend.gmail.errors import GmailAuthError

TRASH_COST = 5


class GmailTrasher(Protocol):
    def trash(self, gmail_id: str) -> None: ...

    def untrash(self, gmail_id: str) -> None: ...


class GmailTrashWriter:
    def __init__(self, credentials: Any, service: Any | None = None, sleep: Callable[[float], None] = time.sleep,
                 units_per_minute: int | None = None):
        if service is None:
            from googleapiclient.discovery import build

            service = build("gmail", "v1", credentials=credentials, cache_discovery=False)
        if units_per_minute is None:
            from backend.config import get_settings

            units_per_minute = get_settings().gmail_units_per_minute
        self._messages = service.users().messages()
        self._sleep = sleep
        self.pacer = QuotaPacer(units_per_minute, sleep=sleep)

    def _call(self, factory: Callable[[], Any], context: str) -> Any:
        def attempt() -> Any:
            self.pacer.acquire(TRASH_COST)
            return factory().execute()

        return with_retries(attempt, context=context, sleep=self._sleep, on_rate_limited=self.pacer.on_rate_limited)

    def trash(self, gmail_id: str) -> None:
        self._call(lambda: self._messages.trash(userId="me", id=gmail_id), "message")

    def untrash(self, gmail_id: str) -> None:
        self._call(lambda: self._messages.untrash(userId="me", id=gmail_id), "message")


def build_default_writer() -> GmailTrashWriter:
    from backend.gmail.auth import can_trash, load_credentials, stored_scopes

    if not can_trash(stored_scopes()):
        raise GmailAuthError("Cleanup mode is not enabled. Run: scripts\\login.ps1 -EnableCleanup")
    creds = load_credentials()
    if creds is None:
        raise GmailAuthError("Not signed in to Gmail")
    return GmailTrashWriter(creds)
