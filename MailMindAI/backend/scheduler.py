"""Automatic sync while the server is running.

Off by default. When ``auto_sync_minutes`` (Settings) is > 0, a background thread starts an
"auto" sync (resume / incremental / full) every N minutes, using the same code path as the
dashboard's Sync button. A completed sync then runs approved Delete-list rules, so a scheduled
sync is also a scheduled cleanup. Nothing here talks to Gmail directly or to any AI service.
"""
from __future__ import annotations

import logging
import threading
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Any

from backend.db.models import utcnow
from backend.db.repo import get_setting, get_sync_state

log = logging.getLogger(__name__)
CHECK_EVERY_SECONDS = 60
RETRY_AFTER = timedelta(minutes=5)  # after a skipped/failed launch (busy, not signed in)
STARTUP_DELAY = timedelta(minutes=2)  # give the user a moment after a restart


def _last_sync_time(state: Any) -> datetime | None:
    with state.session_factory() as s:
        st = get_sync_state(s)
        times = [t for t in (st.last_incremental_at, st.last_full_sync_at) if t]
        return max(times) if times else None


def interval_minutes(state: Any) -> int:
    with state.session_factory() as s:
        return int(get_setting(s, "auto_sync_minutes") or 0)


def due(state: Any, now: datetime, started_at: datetime) -> bool:
    """True when an automatic sync should start now."""
    minutes = interval_minutes(state)
    if minutes <= 0 or now - started_at < STARTUP_DELAY:
        return False
    last = _last_sync_time(state)
    return last is None or now - last >= timedelta(minutes=minutes)


class AutoSync:
    def __init__(self, state: Any, launch: Callable[..., Any], clock: Callable[[], datetime] = utcnow):
        self.state, self.launch, self.clock = state, launch, clock
        self.started_at = clock()
        self.last_attempt: datetime | None = None
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def tick(self) -> bool:
        """One scheduler step. Returns True if a sync was launched."""
        now = self.clock()
        if self.last_attempt and now - self.last_attempt < RETRY_AFTER:
            return False
        if not due(self.state, now, self.started_at):
            return False
        self.last_attempt = now
        try:
            self.launch(self.state, "auto", actor="scheduler")
            log.info("automatic sync started")
            return True
        except Exception as exc:  # noqa: BLE001 - busy / not signed in: try again later
            log.info("automatic sync skipped: %s", getattr(exc, "detail", exc))
            return False

    def _loop(self) -> None:
        while not self._stop.wait(CHECK_EVERY_SECONDS):
            try:
                self.tick()
            except Exception:  # noqa: BLE001
                log.exception("auto-sync scheduler error")

    def start(self) -> None:
        self._thread = threading.Thread(target=self._loop, name="mailmind-autosync", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
