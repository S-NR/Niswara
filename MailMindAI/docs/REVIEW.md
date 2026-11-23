# Implementation review and test results

Date: 2026-11-20. Environment: Windows 11, Python 3.11.5 (code compiles cleanly with
DeprecationWarning/SyntaxWarning as errors; `setup.ps1` prefers 3.12 when installed),
Node 24 / npm 11, SQLite 3.42 with FTS5.

## Phase 1: repository audit and decisions

| Item | Finding | Decision |
|---|---|---|
| "Gmail Agent" connector | No Gmail Agent repository, CLI or package exists on this machine (searched `D:\`, the user profile, pip and global npm). The only Gmail integration present was the claude.ai Gmail connector, which a local backend can't call and which exposes write tools. | With the owner's approval: use Google's **official Gmail API** (`google-api-python-client`) as the single connector, with `gmail.readonly`. No CLI commands were invented. |
| Python 3.12 | Only 3.11.5 is installed. | With the owner's approval: built and tested on 3.11, `requires-python >=3.11`, and `setup.ps1` prefers 3.12. |
| Claude Code CLI | `claude` is not on PATH in this environment, so its flags couldn't be verified. | The bridge doesn't spawn the CLI. It's pull-based through MCP (`analyze_request` / `save_analysis`). |
| SDK versions | `mcp` 2.3.0 (FastMCP renamed to `MCPServer`), `anthropic` 2.11.0 | Both APIs were checked against the installed packages before writing code. |

## Test results by phase (actual runs)

| Phase | Test module | Result |
|---|---|---|
| 2: database | `tests/test_database.py` | 10 passed (tables + FTS created by migrations, FK enforcement, unique Gmail IDs, cascade, transaction rollback, FTS triggers, retention purge, wipe keeps rules, audit redaction, backup + rotation) |
| 3: Gmail integration | `tests/test_gmail.py` | 31 passed (HTML sanitising, bidi/control stripping, attachment metadata only, DPAPI round-trip, plaintext token rejected, scope policy, HTTP error mapping, retries/backoff, read-only adapter surface, 30-day window, thread grouping, no duplicates on re-sync, incremental add/label/delete, history-expired fallback, interrupted-sync resume, fetch failure recorded, backfill, bodies-off mode) |
| 4: local intelligence | `tests/test_intelligence.py` | 26 passed (manager/client identification, newsletter + frequency, promotions, personal, automated, suspicious/injection mail made inert, multi-label projects, priority ordering, duplicates, deadline parsing, quoted-reply exclusion, the five conversation states independent of unread, rule changes + re-analysis, user status preserved, no AI requests from sync) |
| 5: dashboard API | `tests/test_api.py` | 19 passed (overview stats equal DB counts, all filters, pagination, LIKE escaping, detail with Gmail link and sanitised body, thread view, work/personal intelligence, FTS search + hostile queries, actions/follow-ups, CSRF/Origin/Host protection, rules CRUD, secret-free settings, manual sync + progress, cache-wipe phrase, audit) |
| 6-7: AI + MCP + API adapter | `tests/test_ai_mcp.py` | 35 passed (selection required, preview sends nothing, envelope break-out neutralised, weekly exclusions, caps, schema + provenance validation, API off by default, only confirmed context is sent, re-confirm after change, failure handling, exactly six MCP tools, no FS/shell/Gmail in the server, metadata-only search, untrusted envelope, dashboard confirmation required, out-of-context citations dropped, ad-hoc provenance, MCP audit, Anthropic request shape, stop reasons, error mapping, key never stored) |
| 8: cleanup | `tests/test_cleanup.py` | 7 passed (unsubscribe candidate, duplicates, age threshold, idempotent refresh, dismissal respected, stale removal, no execution path or endpoint) |
| 9: security regressions | `tests/test_security_regressions.py` | 9 passed (see below) |
| Total | `scripts\run_tests.ps1` | **139 passed**. Dashboard `tsc --strict` + Vite build: clean |

Additional manual verification:

* The MCP server was launched over **real stdio** exactly as `.mcp.json` configures it
  (`tests/stdio_smoke.py`): 6 tools listed, `search_emails` returned the expected result.
* `setup.ps1`, `start.ps1`, `stop.ps1`, `backup.ps1` and `load_sample_data.ps1` were run
  against the demo data. Overview, Work, Claude Analysis, Settings and Action Tracker pages
  were rendered in headless Edge and inspected.

Bugs found and fixed during testing: a corrupted regex escape that silently disabled request
detection; category precedence for bulk mail with project keywords; the thread-lock in the
progress snapshot; `.mcp.json` path escaping and a UTF-8 BOM written by PowerShell 5; the venv-launcher PID check in `stop.ps1`;
a PID-file race on double start.

## Not verified here (requires your accounts)

* Live Google OAuth consent and a sync against a real mailbox. The adapter is exercised
  through the official client's request shapes and the synthetic fixture source only.
* A live Claude Code session running the Skill end-to-end, and live Anthropic API calls.
  The MCP server and adapter were tested with in-process calls, real stdio, and a fake SDK client.

## Security review

An independent reviewer (a separate agent with no access to the implementer's reasoning)
audited the code against the stated requirements. It found **no high-severity issues**: no Gmail
write path, no XSS sink, and no SQL or FTS5 injection. Every finding below was fixed and is
covered by `tests/test_security_regressions.py`.

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | Medium | In ad-hoc Claude Code use, the Skill pre-approved `get_email` / `get_thread` and there was no per-session cap, so injected email text could steer Claude into reading (and sending to Anthropic) more mail without the user noticing | Read tools removed from `allowed-tools`, so the user approves each read. A per-session cap of 50 full emails. The Skill tells Claude never to open more because an email asks |
| 2 | Medium | `testserver` was in the production Host allow-list. A LAN attacker could use LLMNR/NetBIOS name rebinding to read API data | `testserver` removed. API reads with `Sec-Fetch-Site` other than `same-origin` or `none` are rejected. Vite dev origins are only allowed with `MAILMIND_DEV_SERVER=1` |
| 3 | Low/Med | The envelope escaping missed `</EMAIL>` and `</ email>`, and From/To/Subject weren't escaped | All fields are HTML-escaped (`<`, `>`, `&`); header fields are flattened to one line |
| 4 | Low | MCP `save_analysis(request_id)` could write to any confirmed request | It requires a Claude Code request in `processing` state that was claimed by the same MCP session |
| 5 | Low | The context-changed reset was rolled back by the caller, so the request was stuck | The gateway commits the reset and its audit row before raising |
| 6 | Low | Body text survived in AI preview excerpts and in SQLite free pages and the WAL | Preview excerpts are stripped on purge and wipe; `PRAGMA secure_delete=ON`; WAL checkpoint and VACUUM after a wipe |
| 7 | Low | The stored-token scope check fell back to the requested scopes | The scopes Google actually granted are recorded at sign-in. Tokens without recorded scopes are rejected. Refresh keeps the recorded scopes |
| 8 | Low | `audit?limit=-1` returned everything; MCP LIKE wildcards weren't escaped; AI optional fields weren't capped; the access log printed search queries | Limit validated (1-1000); wildcards escaped; optional fields cleaned and capped at 200 characters; list sizes bounded; uvicorn access log disabled |

Residual risks, accepted for single-user local use: anything you approve in Claude Code is
sent to Anthropic under your Claude account's terms. Backups contain cached email text.
Another process running as your Windows user can read `data\` (DPAPI protects the token,
not the database).

## Change: opt-in Delete list (auto-trash)

Requested by the owner after the initial delivery. Choices:
- **Trash**, not permanent delete;
- **automatic after each sync**, once a rule's preview has been approved;
- only emails **older than N days**.

The original read-only posture stays the default. Design and protections are described in
SECURITY.md under "Opt-in cleanup mode".

Tests: `tests/test_delete_list.py`, 17 passed:
- dangerous patterns refused (public domains, own address);
- age and Starred/Important/trusted protections;
- approval must match the preview;
- trash plus local cache update, and runs are idempotent;
- unapproved, disabled or paused rules never run;
- per-run cap, Gmail failure handling, undo;
- the writer exposes only trash and untrash;
- full API flow, and cleanup-mode requirement enforced;
- changing a rule requires re-approval;
- automatic run after sync;
- the MCP server has no trash capability.

The scope tests were updated: `gmail.modify` is allowed only as an opt-in, and full access stays
forbidden. Full suite: **161 passed**.

Not verified here: trashing against a live Gmail account (exercised with the synthetic fixture
source only).

## Change: sync by date range

Requested by the owner. A **Date range…** control next to Sync now fetches every email dated
between a chosen From and To date (both included), with presets for 3, 6, 12 and 24 months.
- It reuses the full-sync paging and checkpoints, so it can be resumed and cached mail is skipped.
- It doesn't move the incremental history pointer.
- It extends `oldest_synced`.

Tests:
- range query bounds and window;
- cached mail skipped and history pointer kept;
- date validation in the engine and the API.

A time-of-day flake in `test_preview_respects_age_and_protections` was also fixed: it failed
before 09:00 local time.

Full suite: **165 passed**.

## Change: automation (auto-sync, start at login, sync script and skill)

- **Auto-sync scheduler** (`backend/scheduler.py`):
  - off by default; the interval is set in Settings, with a 15-minute minimum;
  - started only by the real server, through the app lifespan;
  - shares one code path (`launch_sync`) with the Sync button, so only approved Delete-list rules run.
- **`scripts\autostart.ps1`:** a Startup-folder shortcut for each account.
- **`scripts\sync.ps1`:** one account or `-All`, with an optional date range and a summary of the sync and cleanup.
- **`.claude/skills/mailmind-sync`:** a Claude Code skill restricted to running `sync.ps1`.
- **Scripts reject unknown parameters** (`[CmdletBinding()]`).

Tests: `tests/test_autosync.py`, 6 passed:
- off by default;
- start-up delay and interval;
- back-off after a failure;
- a real scheduled sync followed by a Delete-list run;
- interval validation;
- no scheduler in test apps.

Manually verified:
- `sync.ps1` against a running demo server, which reported the expected not-signed-in error;
- every script parses.

Full suite: **171 passed**.
