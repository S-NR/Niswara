"""Load the SYNTHETIC sample dataset into a database (demo / tests).

    python -m backend.sample_data --data-dir data_demo

Refuses to run against a database that already holds a real Gmail account.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db import models as m
from backend.db.repo import get_sync_state
from backend.db.session import run_migrations, session_factory
from backend.gmail.fixture_source import DEFAULT_FIXTURE, FixtureGmailSource
from backend.sync.post import post_sync
from backend.intelligence.rules import validate_pattern


def seed_rules(session: Session, rules: list[dict]) -> int:
    n = 0
    for r in rules:
        pattern = validate_pattern(r["rule_type"], r["pattern"])
        exists = session.scalar(select(m.UserRule).where(m.UserRule.rule_type == r["rule_type"], m.UserRule.pattern == pattern))
        if not exists:
            session.add(m.UserRule(rule_type=r["rule_type"], pattern=pattern, label=r.get("label")))
            n += 1
    session.commit()
    return n


def load(db_url: str, fixture: Path = DEFAULT_FIXTURE) -> dict:
    from backend.config import get_settings
    from backend.sync.engine import SyncEngine, SyncProgress

    run_migrations(db_url)
    factory = session_factory(db_url)
    src = FixtureGmailSource(fixture)
    with factory() as s:
        st = get_sync_state(s)
        if st.account_email and st.account_email != src.account:
            raise SystemExit(f"Refusing: database belongs to {st.account_email}, not the synthetic account")
        seed_rules(s, src.rules)
    return SyncEngine(src, factory, get_settings(), post_process=post_sync, progress=SyncProgress()).run("full")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--data-dir", required=True, help="directory for the demo database (NOT your real data dir)")
    a = ap.parse_args()
    d = Path(a.data_dir).resolve()
    d.mkdir(parents=True, exist_ok=True)
    res = load(f"sqlite:///{(d / 'mailmind.db').as_posix()}")
    print(res)
    sys.exit(0 if res["status"] == "completed" else 1)


if __name__ == "__main__":
    main()
