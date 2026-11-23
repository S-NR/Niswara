"""Gmail OAuth (installed-app flow) - the ONE Gmail authentication path.

Scope policy
  * Default: exactly ``gmail.readonly``.
  * Opt-in "cleanup mode" (``login.ps1 -EnableCleanup``): additionally
    ``gmail.modify`` - the narrowest scope that can move mail to Trash. It is
    used ONLY by backend/gmail/writer.py for delete-list rules the user approved.
  * Never: ``https://mail.google.com/`` (permanent delete), send, compose,
    insert or settings scopes. Tokens carrying them are rejected.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from backend.config import get_settings
from backend.gmail.errors import GmailAuthError
from backend.security.token_store import delete_token, load_token, save_token

log = logging.getLogger(__name__)

GMAIL_READONLY = "https://www.googleapis.com/auth/gmail.readonly"
GMAIL_MODIFY = "https://www.googleapis.com/auth/gmail.modify"
SCOPES = [GMAIL_READONLY]
CLEANUP_SCOPES = [GMAIL_READONLY, GMAIL_MODIFY]
FORBIDDEN_SCOPES = {
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.insert",
    "https://www.googleapis.com/auth/gmail.settings.basic",
    "https://www.googleapis.com/auth/gmail.settings.sharing",
}


def assert_scopes_ok(scopes: list[str] | set[str] | None) -> None:
    granted = set(scopes or [])
    bad = granted & FORBIDDEN_SCOPES
    if bad:
        raise GmailAuthError(f"Token carries forbidden scopes {sorted(bad)}; MailMind never needs them")
    if not granted & {GMAIL_READONLY, GMAIL_MODIFY}:
        raise GmailAuthError("Token is missing the gmail.readonly scope")


def can_trash(scopes: list[str] | set[str] | None) -> bool:
    return GMAIL_MODIFY in set(scopes or [])


def stored_scopes(token_path: Path | None = None) -> list[str]:
    raw = load_token(token_path or get_settings().token_path)
    return list(json.loads(raw).get("scopes") or []) if raw else []


def load_credentials(token_path: Path | None = None):  # -> google.oauth2.credentials.Credentials | None
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    token_path = token_path or get_settings().token_path
    raw = load_token(token_path)
    if raw is None:
        return None
    info = json.loads(raw)
    if not info.get("scopes"):
        raise GmailAuthError("Stored token does not record its granted scopes; sign in again")
    assert_scopes_ok(info["scopes"])  # the scopes Google granted, recorded at sign-in
    creds = Credentials.from_authorized_user_info(info, info["scopes"])
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as exc:  # google.auth.exceptions.RefreshError
                raise GmailAuthError(f"Token refresh failed; sign in again ({exc.__class__.__name__})") from exc
            refreshed = json.loads(creds.to_json())
            refreshed["scopes"] = info["scopes"]  # keep the granted scopes recorded at sign-in
            save_token(token_path, json.dumps(refreshed))
        else:
            raise GmailAuthError("Stored token is invalid; sign in again")
    return creds


def interactive_login(client_secret_path: Path | None = None, token_path: Path | None = None,
                      enable_cleanup: bool = False):
    """Run the browser consent flow on a loopback redirect and store the token (DPAPI)."""
    from google_auth_oauthlib.flow import InstalledAppFlow

    s = get_settings()
    client_secret_path = client_secret_path or s.client_secret_path
    token_path = token_path or s.token_path
    if not client_secret_path.exists():
        raise GmailAuthError(
            f"OAuth client file not found at {client_secret_path}. See docs/INSTALL.md (Google Cloud setup)."
        )
    flow = InstalledAppFlow.from_client_secrets_file(str(client_secret_path), CLEANUP_SCOPES if enable_cleanup else SCOPES)
    creds = flow.run_local_server(host="127.0.0.1", port=0, open_browser=True)
    granted = list(creds.granted_scopes or [])
    assert_scopes_ok(granted)  # verify what Google actually granted, not what we asked for
    data = json.loads(creds.to_json())
    data["scopes"] = granted
    save_token(token_path, json.dumps(data))
    return creds


def logout(token_path: Path | None = None) -> bool:
    return delete_token(token_path or get_settings().token_path)


def auth_status() -> dict:
    s = get_settings()
    try:
        granted = stored_scopes()
    except Exception:  # noqa: BLE001 - unreadable token is reported as "not signed in"
        granted = []
    return {
        "client_secret_present": s.client_secret_path.exists(),
        "token_present": s.token_path.exists(),
        "scopes": granted or SCOPES,
        "trash_enabled": can_trash(granted),
    }
