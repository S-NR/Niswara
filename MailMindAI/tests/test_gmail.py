"""Phase 3: read-only Gmail integration (parser, auth, adapter, sync)."""
from __future__ import annotations

import json
import sys
from types import SimpleNamespace

import pytest
from sqlalchemy import func, select

from backend.db import models as m
from backend.db.session import session_factory
from backend.gmail import auth
from backend.gmail.client import GmailApiAdapter, map_http_error, with_retries
from backend.gmail.errors import (
    GmailAuthError, GmailHistoryExpiredError, GmailNotFoundError, GmailRateLimitError, GmailTransientError,
)
from backend.gmail.fixture_source import FixtureGmailSource, build_gmail_message
from backend.gmail.parser import normalize_subject, parse_message
from backend.security.token_store import load_token, save_token
from backend.sync.engine import SyncEngine, SyncProgress

RLO = "\u202e"
ZWSP = "\u200b"


# ------------------------------------------------------------------ parser
def test_parser_html_is_sanitised_and_attachments_metadata_only():
    src = FixtureGmailSource()
    p = parse_message(src.get_message("m006"))
    assert "Top stories" in p.body_text
    assert "alert" not in p.body_text and "<" not in p.body_text
    assert p.list_unsubscribe and p.is_unread
    p1 = parse_message(src.get_message("m001"))
    assert p1.attachments == [{"filename": "vendor_quote.pdf", "mime_type": "application/pdf", "size": 48211}]
    assert p1.from_addr == "priya.shah@example.com" and p1.from_name == "Priya Shah"


def test_parser_strips_control_and_bidi_chars():
    now = FixtureGmailSource().now
    raw = build_gmail_message({"id": "x", "from": "a@b.example", "subject": f"Hi{RLO}evil", "body": f"a\x00b{ZWSP}c"}, now)
    p = parse_message(raw)
    assert p.subject == "Hievil" and p.body_text == "abc"


def test_body_length_cap():
    now = FixtureGmailSource().now
    raw = build_gmail_message({"id": "x", "from": "a@b.example", "body": "z" * 1000}, now)
    assert len(parse_message(raw, max_body_chars=100).body_text) == 100


def test_subject_normalisation():
    assert normalize_subject("RE: Fwd: re[2]: Budget") == "budget"


# ------------------------------------------------------------------ auth / tokens
def test_dpapi_token_roundtrip(tmp_path):
    p = tmp_path / "tok.bin"
    save_token(p, '{"token": "abc"}')
    assert b"abc" not in p.read_bytes()  # encrypted at rest
    assert load_token(p) == '{"token": "abc"}'


@pytest.mark.skipif(sys.platform != "win32", reason="DPAPI is Windows-only")
def test_plaintext_token_rejected_on_windows(tmp_path):
    p = tmp_path / "tok.bin"
    p.write_text('{"token": "abc"}')
    with pytest.raises(ValueError):
        load_token(p)


@pytest.mark.parametrize("scopes", [
    ["https://mail.google.com/"],
    [auth.GMAIL_READONLY, "https://www.googleapis.com/auth/gmail.send"],
    ["https://www.googleapis.com/auth/gmail.metadata"],
])
def test_scope_policy_rejects(scopes):
    with pytest.raises(GmailAuthError):
        auth.assert_scopes_ok(scopes)


def test_scope_policy_accepts_readonly():
    auth.assert_scopes_ok([auth.GMAIL_READONLY])
    assert auth.SCOPES == [auth.GMAIL_READONLY]  # default sign-in stays read-only
    assert not auth.can_trash([auth.GMAIL_READONLY])


def test_cleanup_mode_scope_is_opt_in_and_never_full_access():
    auth.assert_scopes_ok(auth.CLEANUP_SCOPES)
    assert auth.can_trash(auth.CLEANUP_SCOPES)
    assert "https://mail.google.com/" not in auth.CLEANUP_SCOPES
    assert "https://mail.google.com/" in auth.FORBIDDEN_SCOPES


# ------------------------------------------------------------------ adapter failures
class _Err(Exception):
    """Mimics googleapiclient.errors.HttpError (resp.status + JSON content)."""

    def __init__(self, status, reason=""):
        super().__init__(f"{status}")
        self.resp = SimpleNamespace(status=status)
        self.content = json.dumps({"error": {"errors": [{"reason": reason}]}}).encode()


@pytest.mark.parametrize("status,reason,ctx,expected", [
    (401, "", "list", GmailAuthError),
    (403, "insufficientPermissions", "list", GmailAuthError),
    (403, "rateLimitExceeded", "list", GmailRateLimitError),
    (429, "", "list", GmailRateLimitError),
    (404, "", "message", GmailNotFoundError),
    (404, "", "history", GmailHistoryExpiredError),
    (503, "", "list", GmailTransientError),
])
def test_error_mapping(status, reason, ctx, expected):
    assert isinstance(map_http_error(_Err(status, reason), context=ctx), expected)


def test_network_error_maps_to_transient():
    assert isinstance(map_http_error(ConnectionResetError("reset"), context="list"), GmailTransientError)


def test_retries_then_succeeds():
    calls = {"n": 0}

    def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise _Err(503)
        return "ok"

    assert with_retries(flaky, context="list", sleep=lambda _: None) == "ok"
    assert calls["n"] == 3


def test_retries_exhausted_raises_typed():
    def always():
        raise _Err(429)

    with pytest.raises(GmailRateLimitError):
        with_retries(always, context="list", attempts=3, sleep=lambda _: None)


def test_auth_error_not_retried():
    calls = {"n": 0}

    def unauth():
        calls["n"] += 1
        raise _Err(401)

    with pytest.raises(GmailAuthError):
        with_retries(unauth, context="list", sleep=lambda _: None)
    assert calls["n"] == 1


class _Req:
    def __init__(self, result):
        self._result = result

    def execute(self):
        return self._result


class _RecordingResource:
    """Stands in for googleapiclient's discovery resource; records every API method invoked."""

    RESULT = {"messages": [{"id": "1"}], "emailAddress": "x@example.com", "historyId": "5", "history": []}

    def __init__(self, log):
        self._log = log

    def __getattr__(self, name):
        def method(*args, **kwargs):
            self._log.append(name)
            return _Req(self.RESULT) if kwargs else _RecordingResource(self._log)
        return method


def test_adapter_uses_only_read_methods():
    log: list[str] = []
    a = GmailApiAdapter(credentials=None, service=_RecordingResource(log), sleep=lambda _: None)
    a.get_profile()
    a.list_message_ids("after:2024/01/01")
    a.get_message("1")
    a.list_history("1")
    write_verbs = {"send", "modify", "batchModify", "trash", "untrash", "delete", "batchDelete",
                   "insert", "import_", "create", "update", "patch", "attachments"}
    assert not (set(log) & write_verbs)
    assert {"getProfile", "list", "get"} <= set(log)
    public = {n for n in dir(GmailApiAdapter) if not n.startswith("_")}
    assert public == {"get_profile", "list_message_ids", "get_message", "list_history"}


# ------------------------------------------------------------------ sync
def _engine(db_url, src, **kw):
    from backend.config import get_settings
    return SyncEngine(src, session_factory(db_url), get_settings(), progress=SyncProgress(), **kw)


def _count(db_url, model=m.Email):
    with session_factory(db_url)() as s:
        return s.scalar(select(func.count()).select_from(model))


def test_full_sync_latest_30_days(db_url):
    src = FixtureGmailSource()
    res = _engine(db_url, src).run("auto")
    assert res["status"] == "completed" and res["mode"] == "full"
    assert _count(db_url) == 17  # m018 is 45 days old -> excluded
    with session_factory(db_url)() as s:
        assert s.scalar(select(m.Email).where(m.Email.gmail_id == "m018")) is None
        st = s.scalar(select(m.SyncState))
        assert st.account_email == "alex.morgan@example.com" and st.last_history_id == "1000"
        assert s.scalar(select(m.Email).where(m.Email.gmail_id == "m002")).is_from_me
    assert not any("attach" in c for c in src.calls)


def test_thread_grouping(db_url):
    _engine(db_url, FixtureGmailSource()).run("full")
    with session_factory(db_url)() as s:
        t = s.scalar(select(m.Thread).where(m.Thread.gmail_thread_id == "t003"))
        assert t.message_count == 3
        assert [e.gmail_id for e in t.emails] == ["m003", "m004", "m005"]
        assert t.first_date < t.last_date and not t.last_from_me
        assert set(t.participants) == {"jordan.lee@clientco.example", "alex.morgan@example.com"}


def test_resync_does_not_duplicate(db_url):
    src = FixtureGmailSource()
    _engine(db_url, src).run("full")
    res = _engine(db_url, src).run("full")
    assert res["inserted"] == 0 and res["skipped"] == 17
    assert _count(db_url) == 17


def test_incremental_sync_add_label_delete(db_url):
    src = FixtureGmailSource()
    _engine(db_url, src).run("full")
    src.add_message({"id": "m100", "thread": "t003", "days_ago": 0, "from": "Jordan Lee <jordan.lee@clientco.example>",
                     "subject": "Re: Atlas data export issue", "body": "One more question."})
    src.mark_read("m006")
    src.delete_message("m010")
    res = _engine(db_url, src).run("auto")
    assert res["mode"] == "incremental" and res["status"] == "completed"
    with session_factory(db_url)() as s:
        assert s.scalar(select(m.Email).where(m.Email.gmail_id == "m100"))
        assert not s.scalar(select(m.Email).where(m.Email.gmail_id == "m006")).is_unread
        assert s.scalar(select(m.Email).where(m.Email.gmail_id == "m010")) is None
        assert s.scalar(select(m.Thread).where(m.Thread.gmail_thread_id == "t008")) is None
        assert s.scalar(select(m.Thread).where(m.Thread.gmail_thread_id == "t003")).message_count == 4
        assert s.scalar(select(m.SyncState)).last_history_id == str(src.history_id)


def test_history_expired_falls_back_to_full(db_url):
    src = FixtureGmailSource()
    _engine(db_url, src).run("full")
    src.history_expired = True
    res = _engine(db_url, src).run("auto")
    assert res["status"] == "completed" and res["skipped"] == 17


def test_interrupted_sync_resumes(db_url):
    src = FixtureGmailSource(page_size=5)
    src.fail_list_after_pages = 2
    res = _engine(db_url, src).run("auto")
    assert res["status"] == "interrupted"
    assert _count(db_url) == 10
    with session_factory(db_url)() as s:
        st = s.scalar(select(m.SyncState))
        assert st.status == "interrupted" and st.resume_page_token == "10"
        run = s.scalars(select(m.SyncRun).order_by(m.SyncRun.id)).all()[-1]
        assert run.status == "interrupted" and "simulated" in run.error_message
    src.fail_list_after_pages = None
    src.calls.clear()
    res2 = _engine(db_url, src).run("auto")
    assert res2["mode"] == "resume" and res2["status"] == "completed"
    assert _count(db_url) == 17
    first_list = next(c for c in src.calls if c.startswith("list:"))
    assert first_list.endswith(":10")  # resumed from the saved page token


def test_message_fetch_failure_is_recorded(db_url):
    src = FixtureGmailSource()
    src.fail_get = {"m003"}
    res = _engine(db_url, src).run("full")
    assert res["status"] == "interrupted" and res["errors"] == 1
    src.fail_get = set()
    assert _engine(db_url, src).run("auto")["status"] == "completed"
    assert _count(db_url) == 17


def test_backfill_extends_window(db_url):
    src = FixtureGmailSource()
    _engine(db_url, src).run("full")
    res = _engine(db_url, src).run("backfill", backfill_days=30)
    assert res["status"] == "completed"
    assert _count(db_url) == 18


def test_bodies_not_stored_when_disabled(db_url, monkeypatch):
    from backend.config import get_settings
    monkeypatch.setenv("MAILMIND_STORE_BODIES", "false")
    get_settings.cache_clear()
    SyncEngine(FixtureGmailSource(), session_factory(db_url), get_settings(), progress=SyncProgress()).run("full")
    with session_factory(db_url)() as s:
        assert s.scalar(select(func.count()).select_from(m.Email).where(m.Email.body_text.is_not(None))) == 0


# ------------------------------------------------------------------ quota pacing (per-minute quota)
class _Clock:
    def __init__(self):
        self.t = 0.0
        self.slept: list[float] = []

    def now(self):
        return self.t

    def sleep(self, d):
        self.slept.append(d)
        self.t += d


def test_pacer_keeps_usage_under_budget():
    from backend.gmail.client import QuotaPacer

    c = _Clock()
    p = QuotaPacer(100, min_units=10, clock=c.now, sleep=c.sleep)
    for _ in range(60):  # 60 x 5 units = 300 units -> needs ~3 windows
        p.acquire(5)
    assert c.t >= 120  # had to wait for two window rollovers
    # never more than 100 units in any 60 s window
    times = [t for t, _ in p._events]
    assert len([t for t in times if times[-1] - t < 60]) * 5 <= 100


def test_pacer_halves_on_rate_limit_with_floor():
    from backend.gmail.client import QuotaPacer

    p = QuotaPacer(400, min_units=50)
    p.on_rate_limited()
    assert p.limit == 200
    for _ in range(5):
        p.on_rate_limited()
    assert p.limit == 50


def test_rate_limit_waits_out_the_window_then_succeeds():
    calls = {"n": 0}
    slept: list[float] = []
    lowered = {"n": 0}

    def quota_then_ok():
        calls["n"] += 1
        if calls["n"] <= 3:
            raise _Err(403, "rateLimitExceeded")
        return "ok"

    out = with_retries(quota_then_ok, context="message", sleep=slept.append,
                       on_rate_limited=lambda: lowered.__setitem__("n", lowered["n"] + 1))
    assert out == "ok" and lowered["n"] == 3
    assert slept[0] >= 15 and slept[2] >= 60  # waits long enough for a per-minute window to reset


def test_adapter_paces_calls_with_quota_costs():
    log: list[str] = []
    c = _Clock()
    a = GmailApiAdapter(credentials=None, service=_RecordingResource(log), sleep=c.sleep, units_per_minute=60)
    a.pacer._clock = c.now
    for _ in range(13):  # 13 x 5 = 65 units > 60 -> must wait once
        a.get_message("1")
    assert c.slept and c.t >= 60


# ------------------------------------------------------------------ date-range sync
def test_range_sync_fetches_only_the_window(db_url):
    from datetime import date, timedelta
    src = FixtureGmailSource()
    today = date.today()
    res = _engine(db_url, src).run("range", date_from=today - timedelta(days=45), date_to=today - timedelta(days=31))
    assert res["status"] == "completed" and res["mode"] == "range"
    q = [c for c in src.calls if c.startswith("list:")][0]
    assert f"after:{(today - timedelta(days=45)):%Y/%m/%d}" in q
    assert f"before:{(today - timedelta(days=30)):%Y/%m/%d}" in q  # 'to' is inclusive
    with session_factory(db_url)() as s:
        cached = s.scalars(select(m.Email)).all()
        st = s.scalar(select(m.SyncState))
        assert st.oldest_synced.date() == today - timedelta(days=45)
        assert st.resume_query is None
    assert cached, "fixture has mail in that window"
    for e in cached:
        assert today - timedelta(days=46) <= e.internal_date.date() <= today - timedelta(days=30)


def test_range_sync_after_full_skips_cached_and_keeps_history(db_url):
    from datetime import date, timedelta
    src = FixtureGmailSource()
    _engine(db_url, src).run("full")
    with session_factory(db_url)() as s:
        hist = s.scalar(select(m.SyncState)).last_history_id
    before = _count(db_url)
    res = _engine(db_url, src).run("range", date_from=date.today() - timedelta(days=365), date_to=date.today())
    assert res["status"] == "completed"
    assert res["skipped"] == before  # nothing re-downloaded
    assert _count(db_url) == 18
    with session_factory(db_url)() as s:
        assert s.scalar(select(m.SyncState)).last_history_id == hist


def test_range_sync_validates_dates(db_url):
    from datetime import date
    with pytest.raises(ValueError):
        _engine(db_url, FixtureGmailSource()).run("range", date_from=date(2026, 5, 2), date_to=date(2026, 5, 1))
    with pytest.raises(ValueError):
        _engine(db_url, FixtureGmailSource()).run("range")
