"""Start the MailMind API + dashboard on 127.0.0.1 only."""
from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

import uvicorn

from backend.api.app import create_app
from backend.config import get_settings


def main() -> None:
    s = get_settings()
    if s.host not in {"127.0.0.1", "localhost", "::1"}:  # also enforced by config validation
        sys.exit("Refusing to bind to a non-loopback address")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        if probe.connect_ex(("127.0.0.1", s.port)) == 0:
            sys.exit(f"Port {s.port} is already in use - is MailMind already running?")
    pid = Path(s.data_dir / "mailmind.pid")
    pid.write_text(str(os.getpid()))
    (s.data_dir / "mailmind.port").write_text(str(s.port))  # lets scripts\sync.ps1 find this account's server
    try:
        uvicorn.run(create_app(auto_sync=True), host="127.0.0.1", port=s.port, log_level="info", access_log=False, proxy_headers=False,
                    server_header=False)
    finally:
        if pid.exists() and pid.read_text().strip() == str(os.getpid()):
            pid.unlink()


if __name__ == "__main__":
    main()
