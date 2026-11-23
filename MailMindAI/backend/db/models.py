"""SQLAlchemy ORM models.

All timestamps are stored as naive UTC datetimes. Gmail identifiers
(message id, thread id, history id) are preserved verbatim.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Base(DeclarativeBase):
    type_annotation_map = {dict[str, Any]: JSON, list[Any]: JSON}


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


# --------------------------------------------------------------------------- core mail
class Sender(TimestampMixin, Base):
    __tablename__ = "senders"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String(320))
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    # manager | client | trusted | colleague | newsletter | automated | unknown | me
    relationship_type: Mapped[str] = mapped_column(String(32), default="unknown", nullable=False, index=True)
    is_trusted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_newsletter: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    message_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unread_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    first_seen: Mapped[datetime | None] = mapped_column(DateTime)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime)
    per_week: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # subscription frequency

    emails: Mapped[list[Email]] = relationship(back_populates="sender")


class Thread(TimestampMixin, Base):
    __tablename__ = "threads"
    id: Mapped[int] = mapped_column(primary_key=True)
    gmail_thread_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    subject: Mapped[str | None] = mapped_column(Text)
    first_date: Mapped[datetime | None] = mapped_column(DateTime)
    last_date: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    message_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    participants: Mapped[list[Any]] = mapped_column(JSON, default=list)
    last_from_me: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # needs_reply | awaiting_reply | action_later | informational | completed
    status: Mapped[str] = mapped_column(String(32), default="informational", nullable=False, index=True)
    status_reason: Mapped[str | None] = mapped_column(Text)

    emails: Mapped[list[Email]] = relationship(back_populates="thread", order_by="Email.internal_date")


class Email(TimestampMixin, Base):
    __tablename__ = "emails"
    id: Mapped[int] = mapped_column(primary_key=True)
    gmail_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    gmail_thread_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    thread_id: Mapped[int | None] = mapped_column(ForeignKey("threads.id", ondelete="SET NULL"), index=True)
    sender_id: Mapped[int | None] = mapped_column(ForeignKey("senders.id", ondelete="SET NULL"), index=True)
    history_id: Mapped[str | None] = mapped_column(String(32))
    internal_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    subject: Mapped[str | None] = mapped_column(Text)
    from_addr: Mapped[str | None] = mapped_column(String(320), index=True)
    from_name: Mapped[str | None] = mapped_column(String(320))
    to_addrs: Mapped[list[Any]] = mapped_column(JSON, default=list)
    cc_addrs: Mapped[list[Any]] = mapped_column(JSON, default=list)
    label_ids: Mapped[list[Any]] = mapped_column(JSON, default=list)
    is_unread: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_from_me: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    snippet: Mapped[str | None] = mapped_column(Text)
    body_text: Mapped[str | None] = mapped_column(Text)  # plain text only, sanitised; may be purged
    body_purged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    content_hash: Mapped[str | None] = mapped_column(String(64), index=True)  # for duplicate detection
    size_estimate: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    has_attachments: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    attachment_meta: Mapped[list[Any]] = mapped_column(JSON, default=list)  # names/sizes only, never content
    list_unsubscribe: Mapped[str | None] = mapped_column(Text)
    list_id: Mapped[str | None] = mapped_column(String(512))
    message_id_header: Mapped[str | None] = mapped_column(String(998), index=True)
    in_reply_to: Mapped[str | None] = mapped_column(String(998))
    auto_flags: Mapped[dict[str, Any] | None] = mapped_column(JSON)  # precedence / auto-submitted headers

    thread: Mapped[Thread | None] = relationship(back_populates="emails")
    sender: Mapped[Sender | None] = relationship(back_populates="emails")
    classification: Mapped[Classification | None] = relationship(
        back_populates="email", uselist=False, cascade="all, delete-orphan",
        foreign_keys="Classification.email_id",
    )

    @property
    def gmail_url(self) -> str:
        return f"https://mail.google.com/mail/u/0/#all/{self.gmail_id}"


class Classification(TimestampMixin, Base):
    __tablename__ = "classifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    email_id: Mapped[int] = mapped_column(ForeignKey("emails.id", ondelete="CASCADE"), unique=True, nullable=False)
    categories: Mapped[list[Any]] = mapped_column(JSON, default=list)  # multi-label
    primary_category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    domain: Mapped[str] = mapped_column(String(16), default="work", nullable=False, index=True)  # work | personal
    importance: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)  # 0..100
    importance_level: Mapped[str] = mapped_column(String(8), default="low", nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    # needs_reply | awaiting_reply | action_later | informational | completed
    response_state: Mapped[str] = mapped_column(String(32), default="informational", nullable=False, index=True)
    projects: Mapped[list[Any]] = mapped_column(JSON, default=list)
    reasons: Mapped[list[Any]] = mapped_column(JSON, default=list)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    duplicate_of_id: Mapped[int | None] = mapped_column(ForeignKey("emails.id", ondelete="SET NULL"))
    engine: Mapped[str] = mapped_column(String(32), default="local-rules-v1", nullable=False)

    email: Mapped[Email] = relationship(back_populates="classification", foreign_keys=[email_id])


# --------------------------------------------------------------------------- tracking
class Action(TimestampMixin, Base):
    __tablename__ = "actions"
    id: Mapped[int] = mapped_column(primary_key=True)
    email_id: Mapped[int | None] = mapped_column(ForeignKey("emails.id", ondelete="CASCADE"), index=True)
    thread_id: Mapped[int | None] = mapped_column(ForeignKey("threads.id", ondelete="CASCADE"), index=True)
    ai_analysis_id: Mapped[int | None] = mapped_column(ForeignKey("ai_analyses.id", ondelete="CASCADE"), index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    action_type: Mapped[str] = mapped_column(String(32), default="task", nullable=False)  # reply|task|deadline|review|meeting
    owner: Mapped[str] = mapped_column(String(16), default="me", nullable=False)  # me | other | unknown
    due_date: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    status: Mapped[str] = mapped_column(String(16), default="open", nullable=False, index=True)  # open|done|dismissed
    source: Mapped[str] = mapped_column(String(16), default="local", nullable=False)  # local | ai
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    evidence: Mapped[str | None] = mapped_column(Text)  # sentence the action was extracted from

    __table_args__ = (UniqueConstraint("email_id", "description", "source", name="uq_action_email_desc"),)


class Followup(TimestampMixin, Base):
    __tablename__ = "followups"
    id: Mapped[int] = mapped_column(primary_key=True)
    thread_id: Mapped[int] = mapped_column(ForeignKey("threads.id", ondelete="CASCADE"), nullable=False, index=True)
    email_id: Mapped[int | None] = mapped_column(ForeignKey("emails.id", ondelete="SET NULL"))
    kind: Mapped[str] = mapped_column(String(32), nullable=False)  # needs_reply | awaiting_reply
    since: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    due_at: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    status: Mapped[str] = mapped_column(String(16), default="open", nullable=False, index=True)  # open|resolved|dismissed

    __table_args__ = (UniqueConstraint("thread_id", "kind", name="uq_followup_thread_kind"),)


class CleanupRecommendation(TimestampMixin, Base):
    __tablename__ = "cleanup_recommendations"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    sender_id: Mapped[int | None] = mapped_column(ForeignKey("senders.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    email_ids: Mapped[list[Any]] = mapped_column(JSON, default=list)
    estimated_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # pending | dismissed | acknowledged.  Recommendations are NEVER executed by MailMind.
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False, index=True)
    fingerprint: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)


# --------------------------------------------------------------------------- AI
class AIAnalysis(TimestampMixin, Base):
    __tablename__ = "ai_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    analysis_type: Mapped[str] = mapped_column(String(48), nullable=False)
    question: Mapped[str | None] = mapped_column(Text)
    processing_method: Mapped[str] = mapped_column(String(32), nullable=False)  # claude_code | anthropic_api
    # awaiting_confirmation | confirmed | processing | completed | failed | cancelled
    status: Mapped[str] = mapped_column(String(32), default="awaiting_confirmation", nullable=False, index=True)
    selection: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)  # what the user selected
    context_preview: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)  # exactly what will be shared
    context_hash: Mapped[str | None] = mapped_column(String(64))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    model: Mapped[str | None] = mapped_column(String(64))
    result: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    error: Mapped[str | None] = mapped_column(Text)

    sources: Mapped[list[AIAnalysisSource]] = relationship(back_populates="analysis", cascade="all, delete-orphan")


class AIAnalysisSource(Base):
    __tablename__ = "ai_analysis_sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("ai_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    email_id: Mapped[int | None] = mapped_column(ForeignKey("emails.id", ondelete="SET NULL"), index=True)
    gmail_id: Mapped[str] = mapped_column(String(64), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)  # context | decision | action | commitment | ...
    item_index: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    analysis: Mapped[AIAnalysis] = relationship(back_populates="sources")


# --------------------------------------------------------------------------- system
class SyncState(Base):
    __tablename__ = "sync_state"
    id: Mapped[int] = mapped_column(primary_key=True)
    account_email: Mapped[str | None] = mapped_column(String(320))
    last_history_id: Mapped[str | None] = mapped_column(String(32))
    last_full_sync_at: Mapped[datetime | None] = mapped_column(DateTime)
    last_incremental_at: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(16), default="idle", nullable=False)  # idle|running|failed|interrupted
    # resume support for interrupted full syncs
    resume_query: Mapped[str | None] = mapped_column(Text)
    resume_page_token: Mapped[str | None] = mapped_column(Text)
    pending_history_id: Mapped[str | None] = mapped_column(String(32))
    oldest_synced: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class SyncRun(Base):
    __tablename__ = "sync_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)  # full | incremental | backfill | resume
    status: Mapped[str] = mapped_column(String(16), default="running", nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
    listed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fetched: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    inserted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    skipped: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    errors: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False, index=True)
    actor: Mapped[str] = mapped_column(String(32), nullable=False)  # user | system | mcp | anthropic_api
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_type: Mapped[str | None] = mapped_column(String(32))
    target_id: Mapped[str | None] = mapped_column(String(64))
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class UserRule(TimestampMixin, Base):
    __tablename__ = "user_rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    # trusted_sender | manager | client | project_keyword | work_domain | personal_domain
    # | newsletter_sender | ignore_sender | urgent_keyword
    rule_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    pattern: Mapped[str] = mapped_column(String(320), nullable=False)  # email, @domain or keyword
    label: Mapped[str | None] = mapped_column(String(128))  # e.g. project name
    weight: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (UniqueConstraint("rule_type", "pattern", name="uq_rule_type_pattern"),)


class AppSetting(Base):
    __tablename__ = "app_settings"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[Any] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


Index("ix_emails_thread_date", Email.thread_id, Email.internal_date)
Index("ix_actions_status_due", Action.status, Action.due_date)


# --------------------------------------------------------------------------- opt-in auto-trash
class DeleteRule(TimestampMixin, Base):
    """A sender on the user's delete list. Inactive until the user approves its preview."""
    __tablename__ = "delete_rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    pattern: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    older_than_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime)
    approved_preview_count: Mapped[int | None] = mapped_column(Integer)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime)
    total_trashed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)


class DeleteRun(Base):
    __tablename__ = "delete_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    trigger: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="running", nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
    trashed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    restored: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    undone_at: Mapped[datetime | None] = mapped_column(DateTime)
    error: Mapped[str | None] = mapped_column(Text)
    items: Mapped[list[DeleteRunItem]] = relationship(back_populates="run", cascade="all, delete-orphan")


class DeleteRunItem(Base):
    __tablename__ = "delete_run_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("delete_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id: Mapped[int | None] = mapped_column(ForeignKey("delete_rules.id", ondelete="SET NULL"))
    gmail_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    gmail_thread_id: Mapped[str | None] = mapped_column(String(64))
    from_addr: Mapped[str | None] = mapped_column(String(320))
    subject: Mapped[str | None] = mapped_column(Text)
    email_date: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    error: Mapped[str | None] = mapped_column(Text)
    run: Mapped[DeleteRun] = relationship(back_populates="items")
