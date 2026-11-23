"""Work performed locally after each sync: classification, cleanup suggestions, retention."""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.cleanup.engine import refresh_recommendations
from backend.config import get_settings
from backend.db.repo import get_setting
from backend.intelligence.pipeline import analyse_threads
from backend.retention import purge_old_bodies


def post_sync(session: Session, touched: set[int]) -> None:
    analyse_threads(session, touched)
    refresh_recommendations(session)
    days = get_setting(session, "body_retention_days") or get_settings().body_retention_days
    if days:
        purge_old_bodies(session, int(days))
