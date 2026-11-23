"""Entry point: python backend/mcp_server/__main__.py (stdio transport, used by Claude Code)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.mcp_server.server import main  # noqa: E402

main()
