"""Full-text search index (SQLite FTS5) over locally cached email text.

Revision ID: 0002
Revises: 0001
"""
from __future__ import annotations

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

_COLS = "subject, from_addr, from_name, snippet, body_text"


def upgrade() -> None:
    op.execute(
        f"CREATE VIRTUAL TABLE emails_fts USING fts5({_COLS}, content='emails', content_rowid='id', "
        "tokenize='unicode61 remove_diacritics 2')"
    )
    op.execute(
        f"CREATE TRIGGER emails_fts_ai AFTER INSERT ON emails BEGIN "
        f"INSERT INTO emails_fts(rowid, {_COLS}) VALUES (new.id, new.subject, new.from_addr, new.from_name, "
        f"new.snippet, new.body_text); END"
    )
    op.execute(
        f"CREATE TRIGGER emails_fts_ad AFTER DELETE ON emails BEGIN "
        f"INSERT INTO emails_fts(emails_fts, rowid, {_COLS}) VALUES ('delete', old.id, old.subject, old.from_addr, "
        f"old.from_name, old.snippet, old.body_text); END"
    )
    op.execute(
        f"CREATE TRIGGER emails_fts_au AFTER UPDATE OF subject, from_addr, from_name, snippet, body_text ON emails BEGIN "
        f"INSERT INTO emails_fts(emails_fts, rowid, {_COLS}) VALUES ('delete', old.id, old.subject, old.from_addr, "
        f"old.from_name, old.snippet, old.body_text); "
        f"INSERT INTO emails_fts(rowid, {_COLS}) VALUES (new.id, new.subject, new.from_addr, new.from_name, "
        f"new.snippet, new.body_text); END"
    )


def downgrade() -> None:
    for t in ("emails_fts_au", "emails_fts_ad", "emails_fts_ai"):
        op.execute(f"DROP TRIGGER IF EXISTS {t}")
    op.execute("DROP TABLE IF EXISTS emails_fts")
