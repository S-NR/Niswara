"""Shared fixtures. Every test gets an isolated, freshly migrated SQLite DB.

No real mailbox content is used anywhere in the test suite - only the
synthetic fixtures in tests/fixtures/.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


@pytest.fixture()
def db_url(tmp_path, monkeypatch):
    monkeypatch.setenv("MAILMIND_DATA_DIR", str(tmp_path))
    from backend.config import get_settings
    from backend.db.session import dispose_all, run_migrations

    get_settings.cache_clear()
    url = f"sqlite:///{(tmp_path / 'test.db').as_posix()}"
    run_migrations(url)
    yield url
    dispose_all()
    get_settings.cache_clear()


@pytest.fixture()
def session(db_url):
    from backend.db.session import session_factory

    s = session_factory(db_url)()
    yield s
    s.close()
