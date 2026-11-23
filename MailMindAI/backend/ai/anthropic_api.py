"""Stage 2 (optional): direct Anthropic API provider.

Disabled by default. It is only usable when ALL of these hold:
  1. MAILMIND_ANTHROPIC_API_ALLOWED=true (static config / .env)
  2. the in-app setting "ai_api_enabled" is switched on by the user
  3. an API key is present (MAILMIND_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY)
and it is only ever invoked for an analysis the user has previewed and confirmed.

Uses the official ``anthropic`` SDK with structured outputs (``messages.parse``
+ Pydantic schema), adaptive thinking, and server-side refusal fallbacks.
"""
from __future__ import annotations

import os
from typing import Any

from backend.ai.prompts import SYSTEM_PROMPT
from backend.ai.schemas import AnalysisResult
from backend.config import get_settings

FALLBACK_BETA = "server-side-fallback-2026-07-01"


class AIProviderError(RuntimeError):
    """Provider failure safe to show to the user (never contains the API key)."""


def _api_key() -> str | None:
    return os.environ.get("MAILMIND_ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_API_KEY") or _dotenv_key()


def _dotenv_key() -> str | None:
    from backend.config import PROJECT_ROOT

    env = PROJECT_ROOT / ".env"
    if not env.exists():
        return None
    for line in env.read_text("utf-8").splitlines():
        k, _, v = line.partition("=")
        if k.strip() in {"MAILMIND_ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY"} and v.strip():
            return v.strip().strip('"').strip("'")
    return None


def api_key_present() -> bool:
    return bool(_api_key())


class AnthropicApiProvider:
    name = "anthropic_api"

    def __init__(self, client: Any | None = None, model: str | None = None):
        self.model = model or get_settings().anthropic_model
        if client is None:
            import anthropic

            key = _api_key()
            if not key:
                raise AIProviderError("No Anthropic API key configured")
            client = anthropic.Anthropic(api_key=key, max_retries=2, timeout=300.0)
        self.client = client

    def analyze(self, user_content: str) -> dict[str, Any]:
        import anthropic

        try:
            response = self.client.beta.messages.parse(
                model=self.model,
                max_tokens=16000,
                betas=[FALLBACK_BETA],
                fallbacks="default",
                thinking={"type": "adaptive"},
                output_config={"effort": "high"},
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_content}],
                output_format=AnalysisResult,
            )
        except anthropic.AuthenticationError as exc:
            raise AIProviderError("Anthropic API key was rejected") from exc
        except anthropic.PermissionDeniedError as exc:
            raise AIProviderError("API key lacks permission for this model") from exc
        except anthropic.RateLimitError as exc:
            raise AIProviderError("Anthropic rate limit reached - try again later") from exc
        except anthropic.BadRequestError as exc:
            raise AIProviderError(f"Request rejected by the API: {exc.message}") from exc
        except anthropic.APIStatusError as exc:
            raise AIProviderError(f"Anthropic API error (HTTP {exc.status_code})") from exc
        except anthropic.APIConnectionError as exc:
            raise AIProviderError("Could not reach the Anthropic API") from exc
        if response.stop_reason == "refusal":
            cat = getattr(getattr(response, "stop_details", None), "category", None)
            raise AIProviderError(f"The model declined this request (category: {cat})")
        if response.stop_reason == "max_tokens":
            raise AIProviderError("The response was cut off (max_tokens); select fewer emails")
        parsed = response.parsed_output
        if parsed is None:
            raise AIProviderError("The model returned no structured output")
        out = parsed.model_dump()
        out["_meta"] = {"model": getattr(response, "model", self.model), "request_id": getattr(response, "_request_id", None)}
        return out
