"""Engine / session management and migration runner."""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from backend.config import PROJECT_ROOT, get_settings

_engines: dict[str, Engine] = {}
_factories: dict[str, sessionmaker[Session]] = {}


def _configure_sqlite(dbapi_conn, _record) -> None:  # noqa: ANN001
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys=ON")
    cur.execute("PRAGMA secure_delete=ON")  # overwrite deleted content (purged/wiped email text)
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.execute("PRAGMA busy_timeout=5000")
    cur.close()


def get_engine(url: str | None = None) -> Engine:
    url = url or get_settings().db_url
    if url not in _engines:
        engine = create_engine(url, connect_args={"check_same_thread": False}, future=True)
        event.listen(engine, "connect", _configure_sqlite)
        _engines[url] = engine
        _factories[url] = sessionmaker(bind=engine, expire_on_commit=False, future=True)
    return _engines[url]


def session_factory(url: str | None = None) -> sessionmaker[Session]:
    get_engine(url)
    return _factories[url or get_settings().db_url]


@contextmanager
def session_scope(url: str | None = None) -> Iterator[Session]:
    """Transactional scope: commit on success, roll back on any error."""
    session = session_factory(url)()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def run_migrations(url: str | None = None) -> None:
    """Upgrade the database schema to the latest Alembic revision."""
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(PROJECT_ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(PROJECT_ROOT / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url or get_settings().db_url)
    cfg.attributes["configure_logger"] = False
    command.upgrade(cfg, "head")


def compact(url: str | None = None) -> None:
    """Checkpoint the WAL and VACUUM so deleted email text does not linger in free pages."""
    engine = get_engine(url)
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.exec_driver_sql("PRAGMA wal_checkpoint(TRUNCATE)")
        conn.exec_driver_sql("VACUUM")
        conn.exec_driver_sql("PRAGMA wal_checkpoint(TRUNCATE)")


def dispose_all() -> None:
    for e in _engines.values():
        e.dispose()
    _engines.clear()
    _factories.clear()


def db_file(url: str) -> Path | None:
    return Path(url.removeprefix("sqlite:///")) if url.startswith("sqlite:///") else None
