"""Append-only audit logging.

Never put email bodies or credentials in ``details`` - only identifiers,
counts and decisions.
"""
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from backend.db.models import AuditLog

_FORBIDDEN_KEYS = {"body", "body_text", "token", "api_key", "access_token", "refresh_token", "password", "content"}


def audit(
    session: Session,
    actor: str,
    action: str,
    target_type: str | None = None,
    target_id: str | int | None = None,
    **details: Any,
) -> AuditLog:
    clean = {k: v for k, v in details.items() if k.lower() not in _FORBIDDEN_KEYS}
    entry = AuditLog(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=None if target_id is None else str(target_id),
        details=clean,
    )
    session.add(entry)
    return entry
