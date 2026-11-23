"""Delete list (opt-in auto-trash): rules, runs and per-message run items.

Revision ID: 0003
Revises: 0002
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "delete_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("pattern", sa.String(320), nullable=False, unique=True),
        sa.Column("older_than_days", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("approved_preview_count", sa.Integer(), nullable=True),
        sa.Column("last_run_at", sa.DateTime(), nullable=True),
        sa.Column("total_trashed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "delete_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trigger", sa.String(16), nullable=False),  # after_sync | approval | manual | undo
        sa.Column("status", sa.String(16), nullable=False, server_default="running"),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("trashed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("restored", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("undone_at", sa.DateTime(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.create_index("ix_delete_runs_status", "delete_runs", ["status"])
    op.create_table(
        "delete_run_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("run_id", sa.Integer(), sa.ForeignKey("delete_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rule_id", sa.Integer(), sa.ForeignKey("delete_rules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("gmail_id", sa.String(64), nullable=False),
        sa.Column("gmail_thread_id", sa.String(64), nullable=True),
        sa.Column("from_addr", sa.String(320), nullable=True),
        sa.Column("subject", sa.Text(), nullable=True),
        sa.Column("email_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(16), nullable=False),  # trashed | failed | restored | restore_failed
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.create_index("ix_delete_run_items_run", "delete_run_items", ["run_id"])
    op.create_index("ix_delete_run_items_gmail", "delete_run_items", ["gmail_id"])


def downgrade() -> None:
    op.drop_table("delete_run_items")
    op.drop_table("delete_runs")
    op.drop_table("delete_rules")
