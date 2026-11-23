"""A GmailSource that serves the SYNTHETIC dataset (tests/fixtures/*.json).

Used by the automated tests and by ``scripts/load_sample_data.ps1`` to let
you explore the dashboard without connecting a real mailbox. It produces
messages in real Gmail API ``format=full`` shape so the same parser runs.
It is never used when a real Gmail token is configured.
"""
from __future__ import annotations

import base64
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from backend.gmail.client import HistoryPage
from backend.gmail.errors import GmailHistoryExpiredError, GmailNotFoundError, GmailTransientError

DEFAULT_FIXTURE = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "synthetic_emails.json"


def _b64(text: str) -> str:
    return base64.urlsafe_b64encode(text.encode("utf-8")).decode("ascii").rstrip("=")


def build_gmail_message(spec: dict[str, Any], now: datetime) -> dict[str, Any]:
    dt = (now - timedelta(days=spec.get("days_ago", 0))).replace(hour=spec.get("hour", 9), minute=0, second=0, microsecond=0)
    headers = [
        {"name": "From", "value": spec["from"]},
        {"name": "To", "value": spec.get("to", "")},
        {"name": "Subject", "value": spec.get("subject", "")},
        {"name": "Message-ID", "value": f"<{spec['id']}@synthetic.example>"},
    ]
    for key, hname in (("cc", "Cc"), ("list_unsubscribe", "List-Unsubscribe"), ("list_id", "List-Id"),
                       ("auto_submitted", "Auto-Submitted"), ("in_reply_to", "In-Reply-To")):
        if spec.get(key):
            headers.append({"name": hname, "value": spec[key]})
    parts: list[dict[str, Any]] = []
    if spec.get("body") is not None:
        parts.append({"mimeType": "text/plain", "filename": "", "body": {"data": _b64(spec["body"]), "size": len(spec["body"])}})
    if spec.get("html") is not None:
        parts.append({"mimeType": "text/html", "filename": "", "body": {"data": _b64(spec["html"]), "size": len(spec["html"])}})
    for i, att in enumerate(spec.get("attachments", [])):
        parts.append({"mimeType": att["mimeType"], "filename": att["filename"],
                      "body": {"attachmentId": f"att-{spec['id']}-{i}", "size": att["size"]}})
    payload = {"mimeType": "multipart/mixed", "headers": headers, "parts": parts}
    text = spec.get("body") or spec.get("html") or ""
    return {
        "id": spec["id"], "threadId": spec.get("thread", spec["id"]), "labelIds": spec.get("labels", ["INBOX"]),
        "snippet": re.sub(r"<[^>]+>", " ", text)[:120], "historyId": str(spec.get("history_id", 1000)),
        "internalDate": str(int(dt.replace(tzinfo=timezone.utc).timestamp() * 1000)),
        "sizeEstimate": len(text) + 500, "payload": payload,
    }


class FixtureGmailSource:
    def __init__(self, fixture: Path | dict[str, Any] = DEFAULT_FIXTURE, now: datetime | None = None, page_size: int | None = None):
        data = json.loads(Path(fixture).read_text("utf-8")) if not isinstance(fixture, dict) else fixture
        self.account = data["account"]
        self.rules = data.get("rules", [])
        self.now = now or datetime.now(timezone.utc).replace(tzinfo=None)
        self.messages: dict[str, dict[str, Any]] = {}
        for spec in data["messages"]:
            self.messages[spec["id"]] = build_gmail_message(spec, self.now)
        self.history_id = 1000
        self.history: list[tuple[int, str, str]] = []  # (history_id, kind, message_id)
        self.page_size = page_size
        self.fail_get: set[str] = set()
        self.fail_list_after_pages: int | None = None
        self.history_expired = False
        self.calls: list[str] = []
        self.trashed: dict[str, dict[str, Any]] = {}
        self._pages_served = 0

    # ---- test helpers ---------------------------------------------------
    def add_message(self, spec: dict[str, Any]) -> None:
        self.history_id += 1
        spec = {**spec, "history_id": self.history_id}
        self.messages[spec["id"]] = build_gmail_message(spec, self.now)
        self.history.append((self.history_id, "added", spec["id"]))

    def delete_message(self, mid: str) -> None:
        self.history_id += 1
        self.messages.pop(mid, None)
        self.history.append((self.history_id, "deleted", mid))

    def mark_read(self, mid: str) -> None:
        self.history_id += 1
        labels = self.messages[mid]["labelIds"]
        if "UNREAD" in labels:
            labels.remove("UNREAD")
        self.history.append((self.history_id, "label", mid))

    # ---- GmailTrasher (opt-in cleanup mode) ------------------------------
    def trash(self, mid: str) -> None:
        self.calls.append(f"trash:{mid}")
        if mid in self.fail_get:
            raise GmailTransientError(f"simulated failure trashing {mid}")
        if mid not in self.messages:
            raise GmailNotFoundError(mid)
        self.trashed[mid] = self.messages.pop(mid)
        self.history_id += 1
        self.history.append((self.history_id, "label", mid))

    def untrash(self, mid: str) -> None:
        self.calls.append(f"untrash:{mid}")
        if mid not in self.trashed:
            raise GmailNotFoundError(mid)
        self.messages[mid] = self.trashed.pop(mid)
        self.history_id += 1
        self.history.append((self.history_id, "label", mid))

    # ---- GmailSource ----------------------------------------------------
    def get_profile(self) -> dict[str, Any]:
        self.calls.append("profile")
        return {"emailAddress": self.account, "historyId": str(self.history_id), "messagesTotal": len(self.messages)}

    def _matches(self, msg: dict[str, Any], query: str) -> bool:
        ts = datetime.fromtimestamp(int(msg["internalDate"]) / 1000, tz=timezone.utc).replace(tzinfo=None)
        for op, val in re.findall(r"(after|before):(\d{4}/\d{2}/\d{2})", query):
            bound = datetime.strptime(val, "%Y/%m/%d")
            if op == "after" and ts < bound:
                return False
            if op == "before" and ts >= bound:
                return False
        return True

    def list_message_ids(self, query: str, page_token: str | None = None, max_results: int = 100):
        self.calls.append(f"list:{query}:{page_token}")
        if self.fail_list_after_pages is not None and self._pages_served >= self.fail_list_after_pages:
            raise GmailTransientError("simulated network failure")
        self._pages_served += 1
        size = self.page_size or max_results
        ids = sorted((mid for mid, msg in self.messages.items() if self._matches(msg, query)),
                     key=lambda mid: -int(self.messages[mid]["internalDate"]))
        start = int(page_token or 0)
        chunk = ids[start:start + size]
        nxt = str(start + size) if start + size < len(ids) else None
        return chunk, nxt, len(ids)

    def get_message(self, message_id: str) -> dict[str, Any]:
        self.calls.append(f"get:{message_id}")
        if message_id in self.fail_get:
            raise GmailTransientError(f"simulated failure fetching {message_id}")
        if message_id not in self.messages:
            raise GmailNotFoundError(message_id)
        return json.loads(json.dumps(self.messages[message_id]))

    def list_history(self, start_history_id: str, page_token: str | None = None) -> HistoryPage:
        self.calls.append(f"history:{start_history_id}")
        if self.history_expired:
            raise GmailHistoryExpiredError("history too old")
        page = HistoryPage(history_id=str(self.history_id))
        for hid, kind, mid in self.history:
            if hid > int(start_history_id):
                {"added": page.added_ids, "deleted": page.deleted_ids, "label": page.label_changed_ids}[kind].append(mid)
        return page
