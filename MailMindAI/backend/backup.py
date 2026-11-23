"""Consistent local database backup using SQLite's online backup API.

    python -m backend.backup [--dest backups] [--keep 10]

The OAuth token is deliberately NOT included: it is DPAPI-bound to this
Windows user and should be re-created by signing in again after a restore.
"""
from __future__ import annotations

import argparse
import sqlite3
from datetime import datetime
from pathlib import Path

from backend.config import PROJECT_ROOT, get_settings


def backup(db_path: Path, dest_dir: Path, keep: int = 10) -> Path:
    if not db_path.exists():
        raise FileNotFoundError(f"database not found: {db_path}")
    dest_dir.mkdir(parents=True, exist_ok=True)
    target = dest_dir / f"mailmind-{datetime.now():%Y%m%d-%H%M%S-%f}.db"
    src = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    dst = sqlite3.connect(target)
    try:
        src.backup(dst)
        ok = dst.execute("PRAGMA integrity_check").fetchone()[0]
        if ok != "ok":
            raise RuntimeError(f"backup integrity check failed: {ok}")
    finally:
        dst.close()
        src.close()
    backups = sorted(dest_dir.glob("mailmind-*.db"))
    for old in backups[:-keep] if keep > 0 else []:
        old.unlink()
    return target


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dest", default=str(PROJECT_ROOT / "backups"))
    ap.add_argument("--keep", type=int, default=10)
    a = ap.parse_args()
    print(backup(get_settings().db_path, Path(a.dest), a.keep))


if __name__ == "__main__":
    main()
