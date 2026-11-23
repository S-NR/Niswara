"""Conversation (thread) state.

States
  needs_reply     - the latest message is from someone else, is human-written
                    and asks something of you
  awaiting_reply  - the latest message is yours and asks something of others
  action_later    - there is an open action for you but no reply is expected
  completed       - the conversation was explicitly closed / resolved
  informational   - nothing pending

Unread status is deliberately NOT an input: an unread newsletter is not a
pending action, and a read request from your manager still needs a reply.
"""
from __future__ import annotations

from dataclasses import dataclass

from backend.db import models as m
from backend.intelligence import actions as act

HUMAN = {"manager", "client", "trusted", "colleague", "personal", "unknown"}


@dataclass
class ThreadState:
    status: str
    reason: str


def thread_state(emails: list[m.Email], relationships: dict[int, str], open_my_actions: int,
                 suspicious_ids: set[int] | None = None) -> ThreadState:
    if not emails:
        return ThreadState("informational", "empty thread")
    suspicious_ids = suspicious_ids or set()
    last = emails[-1]
    body = last.body_text or last.snippet or ""
    if act.is_closure(body):
        return ThreadState("completed", "latest message closes the conversation")
    if last.is_from_me:
        if act.expects_reply(body):
            return ThreadState("awaiting_reply", "you asked something in the latest message and nobody has replied")
        return ThreadState("completed" if len(emails) > 1 else "informational", "you sent the latest message")
    rel = relationships.get(last.id, "unknown")
    if rel in HUMAN and last.id not in suspicious_ids and act.expects_reply(body):
        return ThreadState("needs_reply", f"latest message from {rel} contains a question or request")
    if open_my_actions:
        return ThreadState("action_later", f"{open_my_actions} open action(s) for you")
    return ThreadState("informational", "no question, request or open action")
