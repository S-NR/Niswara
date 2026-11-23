"""Manual smoke test: launch the MCP server exactly as .mcp.json does and talk to it over stdio.

    MAILMIND_DATA_DIR=<demo data dir> .venv/Scripts/python tests/stdio_smoke.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client

ROOT = Path(__file__).resolve().parents[1]
cfg = json.loads((ROOT / ".mcp.json").read_text())["mcpServers"]["mailmind"]


async def main() -> None:
    params = StdioServerParameters(command=sys.executable, args=[str(ROOT / "backend" / "mcp_server" / "__main__.py")],
                                   env={**os.environ})
    async with stdio_client(params) as (r, w):
        async with ClientSession(r, w) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("tools:", sorted(t.name for t in tools.tools))
            res = await session.call_tool("search_emails", {"query": "budget"})
            print("search_emails ->", [x["gmail_id"] for x in res.structured_content["result"]])


asyncio.run(main())
print("configured command:", cfg["command"], cfg["args"])
