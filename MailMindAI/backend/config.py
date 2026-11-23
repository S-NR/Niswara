"""Application settings.

Static settings come from environment variables prefixed ``MAILMIND_`` and
an optional ``.env`` file in the project root.

Runtime-editable preferences (trusted senders, keywords, AI opt-in) live in
the database (``user_rules`` table), not here.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MAILMIND_", env_file=PROJECT_ROOT / ".env", extra="ignore")

    data_dir: Path = PROJECT_ROOT / "data"
    db_filename: str = "mailmind.db"

    # Network: the app must only ever listen on loopback.
    host: str = "127.0.0.1"
    port: int = 8765

    # Gmail OAuth
    client_secret_path: Path = PROJECT_ROOT / "config" / "client_secret.json"
    token_filename: str = "gmail_token.bin"  # DPAPI-encrypted on Windows

    # Synchronisation
    initial_sync_days: int = 30
    backfill_days: int = 0  # additional history beyond initial window; 0 = none
    sync_page_size: int = 100
    # Client-side pacing under Gmail's "units per minute per user" quota (messages.get = 5 units).
    # 400 ~= 80 messages/minute. Raise it if your Cloud project's quota allows (APIs & Services -> Gmail API -> Quotas).
    gmail_units_per_minute: int = 400
    max_trash_per_run: int = 500  # delete list: cap per run; the rest waits for the next run

    # Local content storage
    store_bodies: bool = True
    max_body_chars: int = 50_000
    body_retention_days: int = 90  # bodies older than this are purged locally (metadata kept)

    # Optional Anthropic API (Stage 2). Disabled unless BOTH this flag and the
    # in-app setting are enabled and a key is present.
    anthropic_api_allowed: bool = False
    anthropic_model: str = "claude-opus-5-5"
    ai_max_context_chars: int = 120_000
    ai_max_messages: int = 50

    @field_validator("host")
    @classmethod
    def _loopback_only(cls, v: str) -> str:
        if v not in {"127.0.0.1", "localhost", "::1"}:
            raise ValueError("MailMind must bind to loopback only (127.0.0.1)")
        return v

    @property
    def db_path(self) -> Path:
        return self.data_dir / self.db_filename

    @property
    def db_url(self) -> str:
        return f"sqlite:///{self.db_path.as_posix()}"

    @property
    def token_path(self) -> Path:
        return self.data_dir / self.token_filename


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.data_dir.mkdir(parents=True, exist_ok=True)
    return s
