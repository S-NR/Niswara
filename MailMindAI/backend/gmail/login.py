"""Interactive Gmail sign-in (read-only scope). Opens your browser on a 127.0.0.1 redirect.

    python -m backend.gmail.login            # sign in
    python -m backend.gmail.login --logout   # delete the local token
    python -m backend.gmail.login --enable-cleanup   # also allow moving mail to Trash (delete list)
"""
from __future__ import annotations

import argparse

from backend.db.session import run_migrations, session_scope
from backend.gmail.auth import CLEANUP_SCOPES, SCOPES, can_trash, interactive_login, logout
from backend.security.audit import audit


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--logout", action="store_true")
    ap.add_argument("--enable-cleanup", action="store_true",
                    help="also request gmail.modify so approved delete-list rules can move mail to Trash")
    a = ap.parse_args()
    run_migrations()
    if a.logout:
        removed = logout()
        with session_scope() as s:
            audit(s, "user", "gmail.logout", removed=removed)
        print("Token removed." if removed else "No token was stored.")
        return
    scopes = CLEANUP_SCOPES if a.enable_cleanup else SCOPES
    print(f"Requesting scopes: {' '.join(scopes)}")
    creds = interactive_login(enable_cleanup=a.enable_cleanup)
    granted = list(creds.granted_scopes or [])
    with session_scope() as s:
        audit(s, "user", "gmail.login", scopes=granted)
    print("Signed in. Token stored encrypted (Windows DPAPI) in the data folder.")
    if a.enable_cleanup and not can_trash(granted):
        print("NOTE: the 'manage/delete' permission was not granted, so the delete list stays inactive. "
              "Run again and tick that permission on Google's consent screen.")
    elif can_trash(granted):
        print("Cleanup mode enabled: approved delete-list rules may move matching mail to Trash.")


if __name__ == "__main__":
    main()
