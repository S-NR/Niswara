"""Local rule-based classifier: sender relationship, multi-label categories,
importance score and confidence. Deterministic; no network, no AI.

Confidence reflects how strong the evidence is. Low confidence is surfaced in
the UI but NEVER triggers external AI processing automatically.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from backend.db import models as m
from backend.intelligence import actions as act
from backend.intelligence.rules import RuleSet

_PROMO = re.compile(r"\b(\d{1,2}% off|sale|discount|coupon|deal|limited time|shop now|free shipping|offer|promo)\b", re.I)
_SUSPICIOUS = re.compile(
    r"\b(ignore (all )?(previous|prior) instructions|verify your (account|password)|reply with your password|"
    r"password (expires|reset)|wire transfer|gift cards?|bitcoin|admin mode|account (suspended|locked))\b",
    re.I,
)
_AUTOMATED_LOCAL = re.compile(r"^(no-?reply|do-?not-?reply|notifications?|alerts?|mailer-daemon|postmaster|bounce)", re.I)
_MEETING = re.compile(r"\b(invitation:|meeting|calendar|agenda|webinar|call scheduled|accepted:|declined:)\b", re.I)
_FREEMAIL = {"gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "live.com"}

CATEGORY_ORDER = ["suspicious", "manager", "client", "action_request", "project", "meeting", "work", "personal",
                  "notification", "newsletter", "promotion", "other"]


@dataclass
class ClassificationResult:
    categories: list[str]
    primary_category: str
    domain: str
    importance: int
    importance_level: str
    confidence: float
    projects: list[str]
    reasons: list[str] = field(default_factory=list)
    relationship: str = "unknown"


def is_newsletter(email: m.Email, rules: RuleSet) -> bool:
    flags = email.auto_flags or {}
    return bool(
        rules.any_match(email.from_addr, rules.newsletter_senders)
        or email.list_id
        or (email.list_unsubscribe and "CATEGORY_PROMOTIONS" not in (email.label_ids or []))
        or flags.get("precedence") in {"bulk", "list"}
    )


def is_automated(email: m.Email) -> bool:
    flags = email.auto_flags or {}
    local = (email.from_addr or "").split("@", 1)[0]
    return bool(
        (flags.get("auto_submitted") and flags.get("auto_submitted") != "no")
        or _AUTOMATED_LOCAL.match(local)
        or flags.get("precedence") == "junk"
    )


def is_promotion(email: m.Email, text: str) -> bool:
    return "CATEGORY_PROMOTIONS" in (email.label_ids or []) or (bool(email.list_unsubscribe) and bool(_PROMO.search(text)))


def sender_relationship(email: m.Email, rules: RuleSet) -> tuple[str, float, str]:
    """Return (relationship, confidence, reason)."""
    a = email.from_addr
    if email.is_from_me or rules.is_me(a):
        return "me", 1.0, "sent by you"
    if rules.is_manager(a):
        return "manager", 0.98, "matches a manager rule"
    if (label := rules.client_label(a)) is not None:
        return "client", 0.95, f"matches client rule ({label})"
    if rules.any_match(a, rules.trusted):
        return "trusted", 0.95, "matches a trusted-sender rule"
    if rules.any_match(a, rules.newsletter_senders) or email.list_id or email.list_unsubscribe:
        return "newsletter", 0.85, "bulk-mail headers (List-Id / List-Unsubscribe)"
    if is_automated(email):
        return "automated", 0.85, "automated sender headers/address"
    if rules.any_match(a, rules.work_domains):
        return "colleague", 0.8, "sender is on a configured work domain"
    if rules.any_match(a, rules.personal_domains):
        return "personal", 0.8, "sender is on a configured personal domain"
    if a and a.rsplit("@", 1)[-1] in _FREEMAIL:
        return "personal", 0.5, "free-mail provider address"
    return "unknown", 0.4, "no rule matched this sender"


def classify_email(email: m.Email, rules: RuleSet) -> ClassificationResult:
    text = f"{email.subject or ''}\n{email.body_text or email.snippet or ''}"
    rel, rel_conf, rel_reason = sender_relationship(email, rules)
    reasons = [f"sender: {rel_reason}"]
    cats: list[str] = []
    conf_signals: list[float] = [rel_conf]
    projects = rules.projects_in(text)

    ignored = rules.any_match(email.from_addr, rules.ignore)
    suspicious = bool(_SUSPICIOUS.search(text)) and not rules.is_trusted(email.from_addr) and not email.is_from_me
    if suspicious:
        cats.append("suspicious")
        reasons.append("contains phishing / prompt-injection style phrases")
        conf_signals.append(0.8)
    if rel == "manager":
        cats += ["manager", "work"]
    elif rel == "client":
        cats += ["client", "work"]
    elif rel in {"colleague", "trusted"}:
        cats.append("work")
    newsletter = is_newsletter(email, rules)
    promotion = is_promotion(email, text)
    automated = is_automated(email)
    if promotion:
        cats.append("promotion")
        reasons.append("promotional labels/language")
        conf_signals.append(0.9 if "CATEGORY_PROMOTIONS" in (email.label_ids or []) else 0.7)
    elif newsletter:
        cats.append("newsletter")
        reasons.append("newsletter / mailing-list headers")
        conf_signals.append(0.9)
    if automated and not newsletter and not promotion:
        cats.append("notification")
        reasons.append("automated notification")
        conf_signals.append(0.85)
    if projects:
        cats += ["project", "work"]
        reasons.append(f"project keywords: {', '.join(projects)}")
        conf_signals.append(0.85)
    if _MEETING.search(email.subject or ""):
        cats.append("meeting")
    human = rel not in {"newsletter", "automated", "me"} and not promotion and not ignored and not suspicious
    if human and (act.has_request(email.body_text or email.snippet or "") or act.has_question(email.body_text or "")):
        cats.append("action_request")
        reasons.append("contains a request or question")
    if rel == "personal" or rules.any_match(email.from_addr, rules.personal_domains):
        cats.append("personal")
    if not cats:
        cats.append("other")
        conf_signals.append(0.35)

    cats = list(dict.fromkeys(cats))
    primary = next(c for c in CATEGORY_ORDER if c in cats)
    if rel in {"automated", "newsletter"} or promotion:  # bulk mail: a project keyword doesn't make it "project" mail
        primary = next((c for c in ("suspicious", "notification", "newsletter", "promotion") if c in cats), primary)
    domain = "personal" if ("personal" in cats and "work" not in cats) or (
        rel == "personal" and not projects) else "work"
    if primary in {"newsletter", "promotion"} and rel not in {"colleague", "manager", "client"}:
        domain = "personal" if rules.personal_domains and rules.any_match(email.from_addr, rules.personal_domains) else domain

    # ---- importance ------------------------------------------------------
    score = 30
    score += {"manager": 35, "client": 30, "trusted": 20, "colleague": 10, "personal": 10, "me": 0,
              "unknown": 0, "newsletter": -20, "automated": -15}.get(rel, 0)
    if projects:
        score += 10
    urgent = rules.urgent_in(text)
    if urgent and human:
        score += 15
        reasons.append(f"urgency words: {', '.join(urgent[:3])}")
    if "action_request" in cats:
        score += 10
    if "IMPORTANT" in (email.label_ids or []):
        score += 5
    if email.cc_addrs and rules.my_addresses & set(email.cc_addrs) and not (rules.my_addresses & set(email.to_addrs or [])):
        score -= 5
        reasons.append("you are only on CC")
    if promotion:
        score -= 30
    if ignored:
        score = min(score, 10)
        reasons.append("sender is on the ignore list")
    if suspicious:
        score = min(score, 15)
    score = max(0, min(100, score))
    level = "high" if score >= 60 else "medium" if score >= 35 else "low"

    confidence = round(min(0.99, sum(conf_signals) / len(conf_signals)), 2)
    return ClassificationResult(cats, primary, domain, score, level, confidence, projects, reasons, rel)
