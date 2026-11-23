"""Rule-based action and deadline extraction (local, deterministic)."""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timedelta

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september",
          "october", "november", "december"]
_MON = r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+|\n+")
# Phrases that ask the reader to DO something (used for action extraction)
_REQUEST = re.compile(
    r"\b(can you|could you|would you|will you|please|kindly|need you to|i need you|you need to|make sure|"
    r"don't forget|remember to|let me know|get back to me)\b",
    re.I,
)
# Phrases that specifically expect a REPLY (used for conversation state)
_REPLY_REQUEST = re.compile(
    r"\b(let me know|get back to me|please (confirm|advise|reply|respond|let)|can you confirm|"
    r"could you confirm|thoughts|any update|what do you think|are you (able|available|coming))\b",
    re.I,
)
_ACTION_ITEM = re.compile(r"^\s*(action( item)?s?|todo|to-do|next steps?)\s*[:\-]\s*(.+)$", re.I)
_DECISION = re.compile(r"\b(decision|we (have )?decided|agreed|we will|go ahead)\b", re.I)
_CLOSURE = re.compile(
    r"\b(all sorted|no further action|resolved|that's all|thats all|closing (this|the) (thread|ticket)|"
    r"no action needed|all good|works now|working now|issue (is )?closed|thanks,? (that's|that is) (perfect|great))\b",
    re.I,
)
_NOREPLY_HINT = re.compile(r"\b(do not reply|don't reply|automated message|no-?reply)\b", re.I)
_QUESTION = re.compile(r"\?\s*$")
_MEETING = re.compile(r"\b(meeting|call|invite|calendar|agenda|standup|sync up)\b", re.I)


@dataclass
class ExtractedAction:
    description: str
    action_type: str  # reply | task | deadline | review | meeting
    due_date: datetime | None
    confidence: float
    evidence: str


def parse_deadline(text: str, ref: datetime) -> datetime | None:
    t = text.lower()
    eod = lambda d: d.replace(hour=17, minute=0, second=0, microsecond=0)  # noqa: E731
    if re.search(r"\b(today|eod|end of (the )?day|by tonight)\b", t):
        return eod(ref)
    if re.search(r"\btomorrow\b", t):
        return eod(ref + timedelta(days=1))
    if re.search(r"\b(eow|end of (the )?week)\b", t):
        return eod(ref + timedelta(days=(4 - ref.weekday()) % 7))
    if re.search(r"\b(eom|end of (the )?month)\b", t):
        nxt = (ref.replace(day=28) + timedelta(days=4)).replace(day=1)
        return eod(nxt - timedelta(days=1))
    m = re.search(r"\b(by|before|until|on|due|no later than)\s+(next\s+)?(" + "|".join(WEEKDAYS) + r")\b", t)
    if m:
        target = WEEKDAYS.index(m.group(3))
        delta = (target - ref.weekday()) % 7 or 7
        if m.group(2) and delta < 7:
            delta += 7 if delta <= 2 else 0  # "next Monday" said on a Saturday means 9 days, not 2
        return eod(ref + timedelta(days=delta))
    m = re.search(r"\b(\d{1,2})(?:st|nd|rd|th)?\s+" + _MON + r"\b", t) or re.search(_MON + r"\s+(\d{1,2})(?:st|nd|rd|th)?\b", t)
    if m:
        g = m.groups()
        day, mon = (int(g[0]), g[1]) if g[0].isdigit() else (int(g[1]), g[0])
        month = next(i for i, name in enumerate(MONTHS, 1) if name.startswith(mon[:3]))
        try:
            d = ref.replace(month=month, day=day, hour=17, minute=0, second=0, microsecond=0)
        except ValueError:
            return None
        if d < ref - timedelta(days=1):
            d = d.replace(year=d.year + 1)
        return d
    return None


def sentences(body: str) -> list[str]:
    lines = [ln for ln in body.splitlines() if not ln.strip().startswith(">")]  # drop quoted replies
    text = "\n".join(lines)
    text = re.split(r"\n\s*On .{5,80} wrote:\s*\n", text)[0]
    return [s.strip() for s in _SENT_SPLIT.split(text) if 3 <= len(s.strip()) <= 400]


def _addresses_me(sentence: str, my_names: list[str]) -> bool:
    s = sentence.lower()
    return any(re.search(rf"\b{re.escape(n)}\b\s+(to|will|should|please|needs?)\b", s) for n in my_names if n)


def extract_actions(body: str, ref: datetime, my_names: list[str] | None = None) -> list[ExtractedAction]:
    my_names = [n.lower() for n in (my_names or [])]
    out: list[ExtractedAction] = []
    for s in sentences(body or ""):
        if _NOREPLY_HINT.search(s):
            continue
        due = parse_deadline(s, ref)
        m = _ACTION_ITEM.match(s)
        if m:
            out.append(ExtractedAction(m.group(3).strip(), "deadline" if due else "task", due, 0.85, s))
            continue
        if _addresses_me(s, my_names):
            out.append(ExtractedAction(s, "deadline" if due else "task", due, 0.75, s))
            continue
        if _REQUEST.search(s):
            kind = "meeting" if _MEETING.search(s) else ("review" if re.search(r"\breview\b", s, re.I) else
                                                         ("reply" if _QUESTION.search(s) else "task"))
            if due:
                kind = "deadline" if kind in {"task", "reply"} else kind
            out.append(ExtractedAction(s, kind, due, 0.7 if due or _QUESTION.search(s) else 0.55, s))
    # de-duplicate identical descriptions
    seen: set[str] = set()
    uniq = []
    for a in out:
        key = a.description.lower()
        if key not in seen:
            seen.add(key)
            uniq.append(a)
    return uniq


def has_question(body: str) -> bool:
    return any(_QUESTION.search(s) for s in sentences(body or ""))


def has_request(body: str) -> bool:
    """Body asks the reader to do something (task or reply)."""
    return any(_REQUEST.search(s) or _ACTION_ITEM.match(s) for s in sentences(body or ""))


def expects_reply(body: str) -> bool:
    """Body expects a written answer: a question, or an explicit request to reply/confirm/send."""
    for s in sentences(body or ""):
        if _NOREPLY_HINT.search(s):
            continue
        if _QUESTION.search(s) or _REPLY_REQUEST.search(s) or re.search(r"\b(send|share|forward) (me|us|over)\b", s, re.I):
            return True
    return False


def is_closure(body: str) -> bool:
    return bool(_CLOSURE.search(body or ""))


def decisions_in(body: str) -> list[str]:
    return [s for s in sentences(body or "") if _DECISION.search(s)]
