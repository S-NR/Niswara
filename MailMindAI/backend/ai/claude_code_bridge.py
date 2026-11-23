"""Stage 1: Claude Code integration (via the local MCP server + MailMind Skill).

This bridge is pull-based: MailMind never launches Claude or sends data
anywhere by itself. The flow is

  1. Dashboard: user selects emails, previews exactly what will be shared and
     confirms -> ai_analyses row with status "confirmed", method "claude_code".
  2. In Claude Code (opened in the project folder) the user runs the
     ``mailmind`` Skill (e.g. "/mailmind run pending analysis").
  3. Claude calls the MCP tool ``analyze_request`` -> receives ONLY the
     confirmed context, then calls ``save_analysis`` with structured JSON.
  4. MailMind validates the JSON (Pydantic + source-id provenance) and stores it.

For ad-hoc questions asked directly in Claude Code, Claude retrieves context
with ``search_emails`` / ``get_thread`` / ``get_email``; ``save_analysis`` then
only accepts citations of emails that were actually served in that session.
"""
from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db import models as m

METHOD = "claude_code"


def instructions_for(analysis_id: int) -> str:
    return (
        "Open Claude Code in the MailMind project folder and ask:\n"
        f"  /mailmind run pending analysis {analysis_id}\n"
        "Claude will fetch only this confirmed context through the MailMind MCP server "
        "and save the structured result back here."
    )


def pending_requests(session: Session) -> list[dict[str, Any]]:
    rows = session.scalars(
        select(m.AIAnalysis).where(m.AIAnalysis.processing_method == METHOD,
                                   m.AIAnalysis.status.in_(["confirmed", "processing"]))
        .order_by(m.AIAnalysis.id)
    ).all()
    return [{"request_id": a.id, "analysis_type": a.analysis_type, "question": a.question, "status": a.status,
             "message_count": (a.context_preview or {}).get("message_count")} for a in rows]
