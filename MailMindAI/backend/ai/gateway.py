"""Provider-independent AI gateway.

Lifecycle of an analysis (ai_analyses.status)

    prepare() -> awaiting_confirmation   (context built; preview + hash stored; NOTHING sent)
    confirm() -> confirmed                (explicit user approval, audited)
      claude_code : claim() -> processing  -> save_result() -> completed
      anthropic_api: run()  -> processing  -> completed | failed
    cancel()  -> cancelled

Nothing is ever sent automatically: sync, classification and low confidence
scores never call prepare()/confirm(). Before transmission the context is
rebuilt and its hash compared with the confirmed one; if the underlying emails
changed, the analysis returns to awaiting_confirmation with a fresh preview.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any, Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.ai.claude_code_bridge import METHOD as CLAUDE_CODE
from backend.ai.context_builder import ContextPackage, build_context, canonical_selection
from backend.ai.prompts import task_text
from backend.ai.response_validator import validate_response
from backend.ai.schemas import ANALYSIS_TYPES, ITEM_LISTS
from backend.config import get_settings
from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_setting
from backend.security.audit import audit

ANTHROPIC_API = "anthropic_api"
METHODS = {CLAUDE_CODE: "Claude Code (local Skill + MCP)", ANTHROPIC_API: "Anthropic API (direct)"}


class AIProvider(Protocol):
    name: str

    def analyze(self, user_content: str) -> dict[str, Any]: ...


class GatewayError(RuntimeError):
    pass


class ContextChanged(GatewayError):
    pass


def default_api_provider() -> AIProvider:
    from backend.ai.anthropic_api import AnthropicApiProvider

    return AnthropicApiProvider()


class AIGateway:
    def __init__(self, session: Session, api_provider_factory: Callable[[], AIProvider] | None = None):
        self.s = session
        self.api_provider_factory = api_provider_factory or default_api_provider

    # ------------------------------------------------------------ availability
    def api_status(self) -> dict[str, Any]:
        from backend.ai.anthropic_api import api_key_present

        cfg = get_settings()
        checks = {
            "allowed_by_config": cfg.anthropic_api_allowed,
            "enabled_in_settings": bool(get_setting(self.s, "ai_api_enabled")),
            "api_key_present": api_key_present(),
        }
        return {"available": all(checks.values()), **checks, "model": cfg.anthropic_model}

    # ------------------------------------------------------------ lifecycle
    def _get(self, analysis_id: int) -> m.AIAnalysis:
        a = self.s.get(m.AIAnalysis, analysis_id)
        if a is None:
            raise GatewayError(f"analysis {analysis_id} not found")
        return a

    def prepare(self, analysis_type: str, selection: dict[str, Any], question: str | None, method: str,
                actor: str = "user") -> m.AIAnalysis:
        if analysis_type not in ANALYSIS_TYPES:
            raise GatewayError(f"unknown analysis type {analysis_type}")
        if method not in METHODS:
            raise GatewayError(f"unknown processing method {method}")
        if analysis_type == "custom" and not (question or "").strip():
            raise GatewayError("a custom analysis needs a question")
        selection = canonical_selection(selection)
        pkg = build_context(self.s, selection)
        destination = "Claude Code on this computer, which sends it to Anthropic" if method == CLAUDE_CODE \
            else f"Anthropic API ({get_settings().anthropic_model})"
        a = m.AIAnalysis(
            analysis_type=analysis_type, question=(question or "").strip()[:2000] or None, processing_method=method,
            status="awaiting_confirmation", selection=selection, context_preview=pkg.preview(destination),
            context_hash=pkg.content_hash(),
        )
        self.s.add(a)
        self.s.flush()
        audit(self.s, actor, "ai.prepare", "ai_analysis", a.id, method=method, analysis_type=analysis_type,
              messages=len(pkg.messages), chars=pkg.total_chars)
        return a

    def confirm(self, analysis_id: int, actor: str = "user") -> m.AIAnalysis:
        a = self._get(analysis_id)
        if a.status != "awaiting_confirmation":
            raise GatewayError(f"analysis is {a.status}, not awaiting confirmation")
        if a.processing_method == ANTHROPIC_API and not self.api_status()["available"]:
            raise GatewayError("The Anthropic API is not enabled (needs config flag, settings toggle and API key)")
        a.status, a.confirmed_at = "confirmed", utcnow()
        audit(self.s, actor, "ai.confirm", "ai_analysis", a.id, method=a.processing_method,
              context_hash=a.context_hash, messages=(a.context_preview or {}).get("message_count"))
        return a

    def cancel(self, analysis_id: int, actor: str = "user") -> m.AIAnalysis:
        a = self._get(analysis_id)
        if a.status in {"completed", "cancelled"}:
            raise GatewayError(f"analysis already {a.status}")
        a.status = "cancelled"
        audit(self.s, actor, "ai.cancel", "ai_analysis", a.id)
        return a

    def _verified_context(self, a: m.AIAnalysis) -> ContextPackage:
        pkg = build_context(self.s, a.selection)
        if pkg.content_hash() != a.context_hash:
            a.status = "awaiting_confirmation"
            a.confirmed_at = None
            a.context_preview = pkg.preview((a.context_preview or {}).get("destination", ""))
            a.context_hash = pkg.content_hash()
            audit(self.s, "system", "ai.context_changed", "ai_analysis", a.id)
            self.s.commit()  # keep the reset + new preview even though the caller's transaction rolls back
            raise ContextChanged("The selected emails changed since you confirmed; please review and confirm again")
        return pkg

    def claim(self, analysis_id: int, actor: str = "mcp") -> tuple[m.AIAnalysis, ContextPackage, str]:
        """Claude Code bridge: hand the confirmed context to Claude (status -> processing)."""
        a = self._get(analysis_id)
        if a.processing_method != CLAUDE_CODE:
            raise GatewayError("this analysis is not assigned to Claude Code")
        if a.status not in {"confirmed", "processing"}:
            raise GatewayError(f"analysis is {a.status}; it must be confirmed in the dashboard first")
        pkg = self._verified_context(a)
        a.status = "processing"
        audit(self.s, actor, "ai.context_released", "ai_analysis", a.id, messages=len(pkg.messages),
              gmail_ids=sorted(pkg.gmail_ids))
        return a, pkg, task_text(a.analysis_type, a.question)

    def run(self, analysis_id: int, actor: str = "user") -> m.AIAnalysis:
        """Anthropic API: send the confirmed context and store the validated result."""
        a = self._get(analysis_id)
        if a.processing_method != ANTHROPIC_API:
            raise GatewayError("this analysis is processed by Claude Code, not the API")
        if a.status != "confirmed":
            raise GatewayError(f"analysis is {a.status}; confirm it first")
        if not self.api_status()["available"]:
            raise GatewayError("The Anthropic API is not enabled")
        pkg = self._verified_context(a)
        a.status = "processing"
        audit(self.s, actor, "ai.api_send", "ai_analysis", a.id, messages=len(pkg.messages), chars=pkg.total_chars,
              gmail_ids=sorted(pkg.gmail_ids))
        self.s.flush()
        try:
            raw = self.api_provider_factory().analyze(task_text(a.analysis_type, a.question) + "\n\n" + pkg.render())
            meta = raw.pop("_meta", {}) if isinstance(raw, dict) else {}
            a.model = meta.get("model") or get_settings().anthropic_model
            return self.save_result(a.id, raw, actor="anthropic_api", allowed_ids=pkg.gmail_ids)
        except Exception as exc:
            a.status, a.error = "failed", str(exc)[:2000]
            audit(self.s, "system", "ai.failed", "ai_analysis", a.id, error=str(exc)[:300])
            raise

    # ------------------------------------------------------------ results
    def save_result(self, analysis_id: int, raw: Any, actor: str, allowed_ids: set[str] | None = None,
                    require_method: str | None = None) -> m.AIAnalysis:
        a = self._get(analysis_id)
        if require_method and (a.processing_method != require_method or a.status != "processing"):
            raise GatewayError("this request was not released to Claude Code (run analyze_request first)")
        if a.status not in {"processing", "confirmed"}:
            raise GatewayError(f"analysis is {a.status}; results can only be saved for confirmed requests")
        if allowed_ids is None:
            allowed_ids = {x["gmail_id"] for x in (a.context_preview or {}).get("messages", [])}
        try:
            result, warnings = validate_response(raw, allowed_ids, a.analysis_type)
        except Exception as exc:
            a.status, a.error = "failed", str(exc)[:2000]
            audit(self.s, actor, "ai.invalid_result", "ai_analysis", a.id, error=str(exc)[:300])
            raise
        self._store(a, result, warnings, allowed_ids)
        audit(self.s, actor, "ai.completed", "ai_analysis", a.id, warnings=len(warnings))
        return a

    def save_adhoc(self, analysis_type: str, question: str | None, raw: Any, served_ids: set[str]) -> m.AIAnalysis:
        """Claude Code ad-hoc analysis: citations limited to emails served via MCP in this session."""
        if analysis_type not in ANALYSIS_TYPES:
            raise GatewayError(f"unknown analysis type {analysis_type}")
        if not served_ids:
            raise GatewayError("No emails were retrieved in this session; nothing can be cited")
        result, warnings = validate_response(raw, served_ids, analysis_type)
        emails = self.s.scalars(select(m.Email).where(m.Email.gmail_id.in_(served_ids))).all()
        a = m.AIAnalysis(
            analysis_type=analysis_type, question=(question or "")[:2000] or None, processing_method=CLAUDE_CODE,
            status="processing", selection={"gmail_ids": sorted(served_ids), "via": "claude_code_session"},
            context_preview={"destination": "Claude Code session (emails retrieved via MCP tools)",
                             "message_count": len(emails),
                             "messages": [{"gmail_id": e.gmail_id, "email_id": e.id, "subject": e.subject,
                                           "from": e.from_addr, "date": e.internal_date.isoformat() + "Z"} for e in emails]},
            confirmed_at=utcnow(),
        )
        self.s.add(a)
        self.s.flush()
        self._store(a, result, warnings, served_ids)
        audit(self.s, "mcp", "ai.adhoc_saved", "ai_analysis", a.id, sources=len(served_ids))
        return a

    def _store(self, a: m.AIAnalysis, result, warnings: list[str], allowed_ids: set[str]) -> None:  # noqa: ANN001
        by_gid = {e.gmail_id: e for e in self.s.scalars(select(m.Email).where(m.Email.gmail_id.in_(allowed_ids)))}
        a.sources.clear()
        self.s.flush()
        for gid in sorted(allowed_ids):
            a.sources.append(m.AIAnalysisSource(gmail_id=gid, email_id=by_gid[gid].id if gid in by_gid else None, role="context"))
        for gid in result.summary_source_message_ids:
            a.sources.append(m.AIAnalysisSource(gmail_id=gid, email_id=by_gid[gid].id if gid in by_gid else None, role="summary"))
        for name in ITEM_LISTS:
            for idx, item in enumerate(getattr(result, name)):
                for gid in item.source_message_ids:
                    a.sources.append(m.AIAnalysisSource(gmail_id=gid, email_id=by_gid[gid].id if gid in by_gid else None,
                                                        role=name.rstrip("s") if name != "open_questions" else "open_question",
                                                        item_index=idx))
        # surface AI-extracted open actions in the Action Tracker (source="ai", provenance kept)
        for idx, item in enumerate(result.actions):
            if item.status == "done":
                continue
            e = by_gid.get(item.source_message_ids[0])
            exists = self.s.scalar(select(m.Action).where(m.Action.ai_analysis_id == a.id, m.Action.description == item.text))
            if e is not None and not exists and not self.s.scalar(select(m.Action).where(
                    m.Action.email_id == e.id, m.Action.description == item.text, m.Action.source == "ai")):
                self.s.add(m.Action(email_id=e.id, thread_id=e.thread_id, ai_analysis_id=a.id, description=item.text,
                                    action_type="deadline" if item.due else "task", owner="unknown", status="open",
                                    source="ai", confidence=0.7,
                                    evidence=f"AI analysis #{a.id}, action {idx}; owner as stated: {item.owner or 'not stated'}; "
                                             f"due as stated: {item.due or 'not stated'}"))
        a.result = {**result.model_dump(), "validation_warnings": warnings}
        a.status, a.completed_at, a.error = "completed", utcnow(), None
