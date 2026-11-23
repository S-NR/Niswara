"""Validate AI output before anything is stored.

* Pydantic schema validation (unknown fields rejected).
* Every item must cite >= 1 source id, and every cited id must belong to the
  context that was actually shared. Items failing this are dropped and listed
  in ``validation_warnings`` - fabricated provenance is never stored.
* Text fields are length-capped and control characters stripped.
"""
from __future__ import annotations

import json
from typing import Any

from pydantic import ValidationError

from backend.ai.schemas import ITEM_LISTS, AnalysisResult
from backend.gmail.parser import clean_text

MAX_TEXT = 2000
MAX_SUMMARY = 8000
MAX_ITEMS = 100


class AIResponseError(ValueError):
    pass


def _parse(raw: Any) -> dict[str, Any]:
    if isinstance(raw, AnalysisResult):
        return raw.model_dump()
    if isinstance(raw, (str, bytes)):
        text = raw.decode() if isinstance(raw, bytes) else raw
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`").removeprefix("json").strip()
        try:
            raw = json.loads(text)
        except json.JSONDecodeError as exc:
            raise AIResponseError(f"AI response is not valid JSON: {exc.msg}") from exc
    if not isinstance(raw, dict):
        raise AIResponseError("AI response must be a JSON object")
    return raw


def validate_response(raw: Any, allowed_ids: set[str], expected_type: str | None = None) -> tuple[AnalysisResult, list[str]]:
    data = _parse(raw)
    for name in ITEM_LISTS:  # bound sizes before Pydantic sees them
        if isinstance(data.get(name), list):
            data[name] = data[name][: MAX_ITEMS * 2]
    try:
        result = AnalysisResult.model_validate(data)
    except ValidationError as exc:
        raise AIResponseError(f"AI response failed schema validation: {exc.error_count()} error(s): "
                              + "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()[:5])) from exc
    warnings: list[str] = []
    if expected_type and result.analysis_type != expected_type:
        warnings.append(f"analysis_type '{result.analysis_type}' replaced with requested '{expected_type}'")
        result.analysis_type = expected_type
    result.summary = clean_text(result.summary, MAX_SUMMARY)
    bad_summary = [i for i in result.summary_source_message_ids if i not in allowed_ids]
    if bad_summary:
        warnings.append(f"summary cited unknown message ids {bad_summary} - removed")
    result.summary_source_message_ids = [i for i in dict.fromkeys(result.summary_source_message_ids) if i in allowed_ids]
    if not result.summary_source_message_ids and result.summary:
        warnings.append("summary has no valid source citations")
    for name in ITEM_LISTS:
        kept = []
        for idx, item in enumerate(getattr(result, name)):
            ids = list(dict.fromkeys(item.source_message_ids))
            unknown = [i for i in ids if i not in allowed_ids]
            if not ids:
                warnings.append(f"{name}[{idx}] dropped: no source message ids")
                continue
            if unknown:
                warnings.append(f"{name}[{idx}] dropped: cites message ids not in the shared context {unknown}")
                continue
            item.source_message_ids = ids
            item.text = clean_text(item.text, MAX_TEXT)
            for field_name, value in item:  # owner, due, decided_by, ... : clean + cap
                if field_name not in {"text", "status", "source_message_ids"} and isinstance(value, str):
                    setattr(item, field_name, clean_text(value, 200) or None)
            if not item.text:
                warnings.append(f"{name}[{idx}] dropped: empty text")
                continue
            kept.append(item)
        if len(kept) > MAX_ITEMS:
            warnings.append(f"{name}: truncated to {MAX_ITEMS} items")
        setattr(result, name, kept[:MAX_ITEMS])
    result.insufficient_information = [clean_text(x, MAX_TEXT) for x in result.insufficient_information][:MAX_ITEMS]
    if not result.summary_source_message_ids and not any(getattr(result, n) for n in ITEM_LISTS) \
            and not result.insufficient_information:
        raise AIResponseError("AI response contains no grounded content (nothing cites the shared emails)")
    return result, warnings
