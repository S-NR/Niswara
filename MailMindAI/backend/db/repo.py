"""Small repository helpers shared across modules."""
from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db.models import AppSetting, SyncState

DEFAULT_SETTINGS: dict[str, Any] = {
    "ai_api_enabled": False,  # Stage-2 Anthropic API opt-in (also needs MAILMIND_ANTHROPIC_API_ALLOWED + key)
    "followup_days": 3,  # how long before an unanswered thread becomes a follow-up candidate
    "my_addresses": [],  # additional addresses that count as "me" (aliases)
    "body_retention_days": None,  # None -> use static config
    "auto_delete_paused": False,  # global pause switch for the delete list
    "auto_sync_minutes": 0,  # automatic sync interval while the server runs; 0 = off
}


def get_setting(session: Session, key: str) -> Any:
    row = session.get(AppSetting, key)
    return row.value if row is not None else DEFAULT_SETTINGS.get(key)


def set_setting(session: Session, key: str, value: Any) -> None:
    if key not in DEFAULT_SETTINGS:
        raise KeyError(f"Unknown setting: {key}")
    row = session.get(AppSetting, key)
    if row is None:
        session.add(AppSetting(key=key, value=value))
    else:
        row.value = value


def all_settings(session: Session) -> dict[str, Any]:
    return {k: get_setting(session, k) for k in DEFAULT_SETTINGS}


def get_sync_state(session: Session) -> SyncState:
    state = session.scalars(select(SyncState).order_by(SyncState.id)).first()
    if state is None:
        state = SyncState(status="idle")
        session.add(state)
        session.flush()
    return state
