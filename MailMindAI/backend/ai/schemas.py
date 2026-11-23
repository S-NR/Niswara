"""Structured analysis schema shared by every AI provider.

Every extracted item must cite the Gmail message ids it came from. Items
citing ids that were not part of the shared context are rejected by the
response validator.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

AnalysisType = Literal[
    "thread_summary",
    "technical_decisions",
    "manager_instructions",
    "client_commitments",
    "cross_thread",
    "project_history",
    "contradictions",
    "deadline_clarification",
    "unresolved_questions",
    "weekly_summary",
    "custom",
]

ANALYSIS_TYPES: dict[str, str] = {
    "thread_summary": "Summarise a complex thread",
    "technical_decisions": "Extract technical decisions",
    "manager_instructions": "Interpret manager instructions",
    "client_commitments": "Extract client commitments",
    "cross_thread": "Reason across several conversations / compare conversations",
    "project_history": "Analyse project history",
    "contradictions": "Detect contradictions",
    "deadline_clarification": "Clarify deadlines and actions",
    "unresolved_questions": "Identify unresolved questions",
    "weekly_summary": "Weekly work email summary",
    "custom": "Custom question about the selected emails",
}


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Sourced(_Strict):
    text: str = Field(description="The finding, stated only as supported by the cited emails")
    source_message_ids: list[str] = Field(description="Gmail message ids (from the <email id=...> tags) supporting this item")


class Decision(Sourced):
    decided_by: str | None = Field(None, description="Person who made/announced the decision, if stated")
    date: str | None = Field(None, description="ISO date of the decision email, if known")


class ActionItem(Sourced):
    owner: str | None = Field(None, description="Who must do it, only if stated")
    due: str | None = Field(None, description="Deadline as written or ISO date, only if stated")
    status: Literal["open", "done", "unclear"] = "unclear"


class Commitment(Sourced):
    committed_by: str | None = None
    committed_to: str | None = None
    due: str | None = None


class OpenQuestion(Sourced):
    asked_by: str | None = None


class Contradiction(Sourced):
    pass


class Deadline(Sourced):
    date: str | None = None


class AnalysisResult(_Strict):
    analysis_type: str
    summary: str = Field(description="Concise answer/summary grounded only in the provided emails")
    summary_source_message_ids: list[str]
    decisions: list[Decision] = Field(default_factory=list)
    actions: list[ActionItem] = Field(default_factory=list)
    commitments: list[Commitment] = Field(default_factory=list)
    open_questions: list[OpenQuestion] = Field(default_factory=list)
    contradictions: list[Contradiction] = Field(default_factory=list)
    deadlines: list[Deadline] = Field(default_factory=list)
    insufficient_information: list[str] = Field(
        default_factory=list, description="Things the user asked about that the emails do not answer")
    confidence: Literal["low", "medium", "high"] = "medium"


ITEM_LISTS = ("decisions", "actions", "commitments", "open_questions", "contradictions", "deadlines")
