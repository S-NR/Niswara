"""Parse Gmail API ``format=full`` message resources into plain, safe records.

All content is treated as untrusted:
  * HTML is converted to text (scripts/styles/remote resources dropped) and
    raw HTML is never stored or rendered.
  * Control characters are stripped and bodies are length-capped.
  * Attachments: only filename / MIME type / size metadata is kept. Attachment
    data is never downloaded.
"""
from __future__ import annotations

import base64
import hashlib
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone
from email.utils import getaddresses, parseaddr
from typing import Any

_CTRL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u200b-\u200f\u202a-\u202e\u2066-\u2069]")
_WS = re.compile(r"[ \t\r\f\v]+")
_NL = re.compile(r"\n{3,}")
_SUBJ_PREFIX = re.compile(r"^\s*((re|fw|fwd|aw|wg)\s*(\[\d+\])?\s*:\s*)+", re.I)


@dataclass
class ParsedMessage:
    gmail_id: str
    gmail_thread_id: str
    history_id: str | None
    internal_date: datetime
    label_ids: list[str]
    snippet: str
    subject: str
    from_addr: str
    from_name: str
    to_addrs: list[str]
    cc_addrs: list[str]
    body_text: str
    size_estimate: int
    attachments: list[dict[str, Any]] = field(default_factory=list)
    list_unsubscribe: str | None = None
    list_id: str | None = None
    message_id_header: str | None = None
    in_reply_to: str | None = None
    references: str | None = None
    precedence: str | None = None
    auto_submitted: str | None = None

    @property
    def is_unread(self) -> bool:
        return "UNREAD" in self.label_ids

    @property
    def content_hash(self) -> str:
        return content_hash(self.subject, self.from_addr, self.body_text or self.snippet)


def clean_text(text: str, limit: int | None = None) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    text = _CTRL.sub("", text).replace("\r\n", "\n").replace("\r", "\n")
    text = "\n".join(_WS.sub(" ", ln).strip() for ln in text.split("\n"))
    text = _NL.sub("\n\n", text).strip()
    return text[:limit] if limit else text


def normalize_subject(subject: str | None) -> str:
    return _SUBJ_PREFIX.sub("", subject or "").strip().lower()


def content_hash(subject: str | None, from_addr: str | None, body: str | None) -> str:
    norm = "|".join([normalize_subject(subject), (from_addr or "").lower(), re.sub(r"\s+", " ", (body or "")[:5000]).strip().lower()])
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()


def html_to_text(html: str) -> str:
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "head", "title", "meta", "link", "iframe", "object", "embed", "noscript", "svg"]):
        tag.decompose()
    for br in soup.find_all(["br"]):
        br.replace_with("\n")
    for blk in soup.find_all(["p", "div", "tr", "li", "h1", "h2", "h3", "h4", "table"]):
        blk.append("\n")
    return soup.get_text()


def _b64(data: str | None) -> str:
    if not data:
        return ""
    raw = base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))
    return raw.decode("utf-8", errors="replace")


def _walk(part: dict[str, Any], plain: list[str], html: list[str], atts: list[dict[str, Any]]) -> None:
    mime = (part.get("mimeType") or "").lower()
    body = part.get("body") or {}
    filename = part.get("filename") or ""
    if filename or body.get("attachmentId"):
        atts.append({"filename": clean_text(filename, 255), "mime_type": mime, "size": int(body.get("size") or 0)})
        return  # never fetch attachment content
    if mime == "text/plain" and body.get("data"):
        plain.append(_b64(body["data"]))
    elif mime == "text/html" and body.get("data"):
        html.append(_b64(body["data"]))
    for sub in part.get("parts") or []:
        _walk(sub, plain, html, atts)


def _addr_list(value: str | None) -> list[str]:
    return [a.lower() for _, a in getaddresses([value or ""]) if a]


def parse_message(msg: dict[str, Any], max_body_chars: int = 50_000) -> ParsedMessage:
    payload = msg.get("payload") or {}
    headers = {h["name"].lower(): h.get("value", "") for h in payload.get("headers", [])}
    plain: list[str] = []
    html: list[str] = []
    atts: list[dict[str, Any]] = []
    _walk(payload, plain, html, atts)
    body = "\n".join(plain) if plain else (html_to_text("\n".join(html)) if html else "")
    name, addr = parseaddr(headers.get("from", ""))
    ts = int(msg.get("internalDate") or 0) / 1000
    return ParsedMessage(
        gmail_id=msg["id"],
        gmail_thread_id=msg.get("threadId") or msg["id"],
        history_id=str(msg["historyId"]) if msg.get("historyId") else None,
        internal_date=datetime.fromtimestamp(ts, tz=timezone.utc).replace(tzinfo=None),
        label_ids=list(msg.get("labelIds") or []),
        snippet=clean_text(msg.get("snippet") or "", 500),
        subject=clean_text(headers.get("subject", ""), 998),
        from_addr=(addr or "").lower(),
        from_name=clean_text(name, 320),
        to_addrs=_addr_list(headers.get("to")),
        cc_addrs=_addr_list(headers.get("cc")),
        body_text=clean_text(body, max_body_chars),
        size_estimate=int(msg.get("sizeEstimate") or 0),
        attachments=atts,
        list_unsubscribe=headers.get("list-unsubscribe") or None,
        list_id=clean_text(headers.get("list-id", ""), 512) or None,
        message_id_header=headers.get("message-id") or None,
        in_reply_to=headers.get("in-reply-to") or None,
        references=headers.get("references") or None,
        precedence=(headers.get("precedence") or "").lower() or None,
        auto_submitted=(headers.get("auto-submitted") or "").lower() or None,
    )
