"""FastAPI application factory.

Security posture
  * Bound to 127.0.0.1 only (enforced in config and in run.py).
  * Host header must be a loopback name (DNS-rebinding protection).
  * No CORS. State-changing requests must carry ``X-MailMind-Request: 1`` and,
    if an Origin header is present, it must be the app's own loopback origin
    (CSRF protection - a foreign web page cannot set the custom header without
    a CORS preflight, which is never granted).
  * Strict Content-Security-Policy; email content is rendered as text only.
"""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend import __version__
from backend.config import PROJECT_ROOT, get_settings
from backend.db.session import run_migrations, session_factory

log = logging.getLogger(__name__)
UNSAFE = {"POST", "PUT", "PATCH", "DELETE"}
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
       "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'")


class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, allowed_origins: set[str]):  # noqa: ANN001
        super().__init__(app)
        self.allowed_origins = allowed_origins

    async def dispatch(self, request: Request, call_next):  # noqa: ANN201
        site = request.headers.get("sec-fetch-site")
        if request.url.path.startswith("/api/") and site not in (None, "same-origin", "none"):
            return JSONResponse({"detail": "cross-site request rejected"}, status_code=403)
        if request.method in UNSAFE and request.url.path.startswith("/api/"):
            origin = request.headers.get("origin")
            if origin is not None and origin not in self.allowed_origins:
                return JSONResponse({"detail": "cross-origin request rejected"}, status_code=403)
            if request.headers.get("x-mailmind-request") != "1":
                return JSONResponse({"detail": "missing X-MailMind-Request header"}, status_code=403)
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = CSP
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store" if request.url.path.startswith("/api/") else "no-cache"
        return response


def default_source_factory() -> Any:
    from backend.gmail.client import build_default_source

    return build_default_source()


def default_writer_factory() -> Any:
    from backend.gmail.writer import build_default_writer

    return build_default_writer()


def create_app(db_url: str | None = None, source_factory: Callable[[], Any] | None = None,
               api_provider_factory: Callable[[], Any] | None = None, migrate: bool = True,
               static_dir: Path | None = None, writer_factory: Callable[[], Any] | None = None,
               auto_sync: bool = False) -> FastAPI:
    s = get_settings()
    if migrate:
        run_migrations(db_url)
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        scheduler = getattr(app.state, "auto_sync", None)
        if scheduler:
            scheduler.start()
        try:
            yield
        finally:
            if scheduler:
                scheduler.stop()

    app = FastAPI(title="MailMind AI", version=__version__, docs_url="/api/docs", openapi_url="/api/openapi.json",
                  redoc_url=None, lifespan=lifespan)
    app.state.session_factory = session_factory(db_url)
    app.state.source_factory = source_factory or default_source_factory
    app.state.api_provider_factory = api_provider_factory
    app.state.writer_factory = writer_factory or default_writer_factory
    import os

    ports = {s.port} | ({5173} if os.environ.get("MAILMIND_DEV_SERVER") == "1" else set())  # Vite dev only on opt-in
    origins = {f"http://{h}:{p}" for h in ("127.0.0.1", "localhost") for p in ports}
    app.add_middleware(SecurityMiddleware, allowed_origins=origins)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost"])

    from backend.api.routers import admin, ai_cleanup, delete_list, mail, tracking

    for r in (mail.router, tracking.router, admin.router, ai_cleanup.router, delete_list.router):
        app.include_router(r, prefix="/api")

    if auto_sync:  # only the real server (backend.run) schedules syncs; tests drive the scheduler directly
        from backend.api.routers.admin import launch_sync
        from backend.scheduler import AutoSync

        app.state.auto_sync = AutoSync(app.state, launch_sync)  # started/stopped by lifespan

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        return {"status": "ok", "version": __version__}

    dist = static_dir or (PROJECT_ROOT / "frontend" / "dist")
    if (dist / "index.html").exists():
        app.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")

        @app.get("/{path:path}", include_in_schema=False)
        def spa(path: str) -> FileResponse:
            if path.startswith("api/"):
                return JSONResponse({"detail": "Not Found"}, status_code=404)  # type: ignore[return-value]
            candidate = (dist / path).resolve()
            if path and candidate.is_file() and dist.resolve() in candidate.parents:
                return FileResponse(candidate)
            return FileResponse(dist / "index.html")

    return app
