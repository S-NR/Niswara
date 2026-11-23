"""User-configurable rules (stored in ``user_rules``).

Nothing about personal relationships is hard-coded: managers, clients,
trusted senders, project keywords and work/personal domains all come from
rules the user edits in the dashboard (Settings -> Rules).

Pattern syntax: ``someone@company.com`` (exact address) or ``@company.com``
(that domain and its subdomains). Keywords are matched case-insensitively on
word boundaries.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.db.models import UserRule

RULE_TYPES = {
    "manager": "Manager - messages are high importance",
    "client": "Client - messages are high importance",
    "trusted_sender": "Trusted sender - never flagged as suspicious, raised importance",
    "work_domain": "Domain treated as work email",
    "personal_domain": "Domain treated as personal email",
    "project_keyword": "Keyword that tags an email with a project (label = project name)",
    "urgent_keyword": "Keyword that raises importance",
    "newsletter_sender": "Force sender to be treated as a newsletter",
    "ignore_sender": "Always low importance, never creates actions/follow-ups",
}

DEFAULT_URGENT = ["urgent", "asap", "immediately", "deadline", "today", "eod", "critical", "blocker"]


def _addr_match(addr: str, pattern: str) -> bool:
    addr, pattern = addr.lower().strip(), pattern.lower().strip()
    if pattern.startswith("@"):
        dom = addr.rsplit("@", 1)[-1]
        return dom == pattern[1:] or dom.endswith("." + pattern[1:])
    return addr == pattern


def validate_pattern(rule_type: str, pattern: str) -> str:
    if rule_type not in RULE_TYPES:
        raise ValueError(f"Unknown rule type {rule_type!r}")
    p = pattern.strip()
    if not p:
        raise ValueError("Pattern must not be empty")
    if rule_type in {"project_keyword", "urgent_keyword"}:
        if len(p) > 100:
            raise ValueError("Keyword too long")
        return p
    p = p.lower()
    if not re.fullmatch(r"(@[a-z0-9.-]+\.[a-z0-9-]+|[^@\s]+@[a-z0-9.-]+\.[a-z0-9-]+)", p):
        raise ValueError("Address pattern must be name@domain.tld or @domain.tld")
    return p


@dataclass
class RuleSet:
    managers: list[str] = field(default_factory=list)
    clients: list[tuple[str, str | None]] = field(default_factory=list)
    trusted: list[str] = field(default_factory=list)
    work_domains: list[str] = field(default_factory=list)
    personal_domains: list[str] = field(default_factory=list)
    projects: list[tuple[str, str]] = field(default_factory=list)  # (keyword, project label)
    urgent: list[str] = field(default_factory=lambda: list(DEFAULT_URGENT))
    newsletter_senders: list[str] = field(default_factory=list)
    ignore: list[str] = field(default_factory=list)
    my_addresses: set[str] = field(default_factory=set)

    @classmethod
    def load(cls, session: Session, my_addresses: set[str] | None = None) -> RuleSet:
        rs = cls(my_addresses={a.lower() for a in (my_addresses or set())})
        for r in session.scalars(select(UserRule).where(UserRule.enabled.is_(True))):
            match r.rule_type:
                case "manager": rs.managers.append(r.pattern)
                case "client": rs.clients.append((r.pattern, r.label))
                case "trusted_sender": rs.trusted.append(r.pattern)
                case "work_domain": rs.work_domains.append(r.pattern)
                case "personal_domain": rs.personal_domains.append(r.pattern)
                case "project_keyword": rs.projects.append((r.pattern, r.label or r.pattern))
                case "urgent_keyword": rs.urgent.append(r.pattern)
                case "newsletter_sender": rs.newsletter_senders.append(r.pattern)
                case "ignore_sender": rs.ignore.append(r.pattern)
        return rs

    def any_match(self, addr: str | None, patterns: list[str]) -> bool:
        return bool(addr) and any(_addr_match(addr, p) for p in patterns)  # type: ignore[arg-type]

    def is_manager(self, addr: str | None) -> bool:
        return self.any_match(addr, self.managers)

    def client_label(self, addr: str | None) -> str | None:
        for p, label in self.clients:
            if addr and _addr_match(addr, p):
                return label or p
        return None

    def is_trusted(self, addr: str | None) -> bool:
        return self.any_match(addr, self.trusted) or self.is_manager(addr) or self.client_label(addr) is not None

    def is_me(self, addr: str | None) -> bool:
        return bool(addr) and addr.lower() in self.my_addresses  # type: ignore[union-attr]

    def projects_in(self, text: str) -> list[str]:
        found: list[str] = []
        for kw, label in self.projects:
            if re.search(rf"(?<!\w){re.escape(kw)}(?!\w)", text, re.I) and label not in found:
                found.append(label)
        return found

    def urgent_in(self, text: str) -> list[str]:
        return [kw for kw in self.urgent if re.search(rf"(?<!\w){re.escape(kw)}(?!\w)", text, re.I)]
