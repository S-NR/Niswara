# Installing MailMind AI (Windows 10/11)

## 1. Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.12 recommended (3.11+ supported) | `winget install Python.Python.3.12` |
| Node.js | LTS | `winget install OpenJS.NodeJS.LTS` |
| Claude Code | current (optional, for Claude analysis) | see https://code.claude.com |

## 2. Get the code and run setup

```powershell
cd D:\Projects\MailMindAI
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

`setup.ps1` will:
- create `.venv` with the newest available Python (3.12 preferred) and install `requirements.txt`
- build the dashboard (`frontend\dist`)
- create and migrate the SQLite database in `data\`
- write `.mcp.json` with this machine's absolute paths (for Claude Code)
- restrict `data\` to your Windows user (it holds the encrypted token and cached email)

## 3. Create a Google OAuth client (one time)

MailMind talks to Gmail through **your own** Google Cloud OAuth client. Nothing goes
through a third-party server.

1. Go to https://console.cloud.google.com/ and create a project, for example "MailMind (personal)".
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform → Branding / Audience):
   - User type: **External** (personal Gmail) or **Internal** (Google Workspace, your own org only).
   - Publishing status: leave it in **Testing** and add your own Gmail address as a **test user**.
   - Data access / scopes: add only `https://www.googleapis.com/auth/gmail.readonly`.
4. **Credentials → Create credentials → OAuth client ID → Application type: Desktop app**.
5. Download the JSON and save it as `D:\Projects\MailMindAI\config\client_secret.json`.
   It is git-ignored. Don't share it.

> `gmail.readonly` is a Google **restricted** scope. Read
> [SECURITY.md → Google restricted-scope implications](SECURITY.md#google-restricted-scope-implications)
> before going beyond personal use. In **Testing** mode Google may expire the refresh token
> after 7 days, after which you just run `scripts\login.ps1` again.

## 4. Sign in (read-only)

```powershell
scripts\login.ps1
```

Your browser opens Google's consent page for **read-only** Gmail access. The redirect goes
to a temporary listener on `127.0.0.1`. The resulting token is encrypted with Windows DPAPI
(`data\gmail_token.bin`) and can only be decrypted by your Windows account on this machine.
To disconnect, run `scripts\login.ps1 -Logout`, and also revoke access at
https://myaccount.google.com/permissions.

## 5. Start, sync and use

```powershell
scripts\start.ps1          # starts on http://127.0.0.1:8765 and opens the browser
scripts\stop.ps1
```

Press **Sync now** in the dashboard. The first sync downloads metadata and plain text for
the last 30 days (attachments are never downloaded). Later syncs are incremental, using
Gmail history IDs. If a sync is interrupted, the next sync resumes from the last saved page.

To fetch older mail, click **Date range…** next to Sync now. Pick a preset (last 3, 6, 12 or 24
months) or choose your own **From** and **To** dates (both days are included), then click **Sync this range**.
Emails already cached are skipped, so you can widen the window step by step. A year of mail
can take a long time because MailMind stays under Gmail's per-minute quota. Cached email text
older than the retention setting (default 90 days) is removed after each sync. Metadata, classification
and the Delete list still work for those emails; raise **Settings → Remove cached email text older than** if you
want to keep the text of old mail searchable.

Next, open **Settings → Rules** and add your managers, clients, trusted senders, work and
personal domains, and project keywords, then press **Re-analyse all email**.

### Try it first with synthetic data

```powershell
scripts\load_sample_data.ps1      # fictional dataset in .\data_demo, served on port 8766
scripts\stop.ps1 -DataDir data_demo
```

## 5b. Optional: automatic cleanup (Delete list)

1. In Google Cloud, go to **Data Access → Add or remove scopes** and also add
   `https://www.googleapis.com/auth/gmail.modify` → **Save**.
2. Run `scripts\login.ps1 -EnableCleanup` and tick the new **"Read, compose and send emails…
   / manage"** permission on Google's screen. MailMind only uses it to move mail to Trash, which
   is the narrowest Gmail permission that allows it.
3. Restart MailMind. In **Cleanup Center → Delete list**:
   - add a sender (or click **Add sender to delete list…** on a suggestion);
   - choose "older than N days";
   - check the preview → **Approve**.

From then on, matching mail is moved to Trash after every sync. Use **Pause all**, **Disable**
or **Undo** at any time. To go back to read-only, run `scripts\login.ps1` without the switch.

## 5c. A second Gmail account

Each account runs as its own MailMind copy, with its own data folder, token, rules, Delete list and port.
The accounts never share data.

1. In Google Cloud → **Google Auth Platform → Audience → Test users**, add the second address.
   The same OAuth client works for both.
2. Sign in, choosing the second account in the browser:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\login.ps1 -DataDir data_work
   ```
   Add `-EnableCleanup` if you want the Delete list for this account.
3. Start it on another port, then open http://127.0.0.1:8767:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\start.ps1 -DataDir data_work -Port 8767
   ```
4. Stop it with `scripts\stop.ps1 -DataDir data_work`.

Pass `-DataDir data_work` every time you work with that account. Logs go to `logs\server-data_work.*.log`.
The Claude Code MCP server (`.mcp.json`) reads the default `data` folder only.

## 5d. Run it automatically

* **Automatic sync:** in **Settings → Automatic sync**, choose an interval (15 minutes to once a day). Off by default.
  While MailMind is running, it syncs on that schedule. Each completed sync then applies your *approved*
  Delete-list rules. New rules still need your approval in the dashboard.
* **Start at Windows login:** run `scriptsutostart.ps1` (default account) or
  `scriptsutostart.ps1 -DataDir data_work -Port 8767` (another account). This adds a shortcut to your Startup
  folder that starts MailMind hidden, without opening the browser, so no admin rights are needed. Remove it with
  `-Remove`, or list entries with `-List`.
* **From the command line:**
  * `scripts\sync.ps1` syncs the default account now, waits, and prints what was synced and cleaned up;
  * add `-DataDir data_work` for another account, or `-All` for every running account;
  * add `-From 2026-01-01 -To 2026-06-30` to sync a date range.

  You can run it from Task Scheduler if you prefer a fixed time of day.
* **Claude Code:** the `mailmind-sync` skill (`.claude/skills/mailmind-sync`) runs `scripts\sync.ps1` for you.
  Examples: "sync my mail", "sync all accounts", "fetch my work mail from March to May". The skill can only
  trigger syncs and report results. It can't approve or change Delete-list rules.

## 6. Configuration (`.env` in the project root, optional)

| Variable | Default | Meaning |
|---|---|---|
| `MAILMIND_PORT` | 8765 | Dashboard/API port (always bound to 127.0.0.1) |
| `MAILMIND_DATA_DIR` | `.\data` | Database, token, PID file |
| `MAILMIND_INITIAL_SYNC_DAYS` | 30 | Window for the first sync |
| `MAILMIND_GMAIL_UNITS_PER_MINUTE` | 400 | Pace of Gmail requests (a full message costs 5 units, so 400 is about 80 messages/min). Lowered automatically if Google still rate-limits |
| `MAILMIND_BACKFILL_DAYS` | 0 | Extra history fetched after the initial window |
| `MAILMIND_STORE_BODIES` | true | Cache plain-text bodies for search and analysis |
| `MAILMIND_MAX_BODY_CHARS` | 50000 | Per-message cap on cached text |
| `MAILMIND_BODY_RETENTION_DAYS` | 90 | Cached text older than this is purged after each sync (metadata is kept) |
| `MAILMIND_ANTHROPIC_API_ALLOWED` | false | Must be `true` before the optional API adapter can be enabled |
| `MAILMIND_ANTHROPIC_API_KEY` | none | API key for the optional adapter (or `ANTHROPIC_API_KEY`) |
| `MAILMIND_ANTHROPIC_MODEL` | `claude-opus-5-5` | Model used by the API adapter |
| `MAILMIND_MAX_TRASH_PER_RUN` | 500 | Delete list: at most this many messages moved to Trash per run |
| `MAILMIND_DEV_SERVER` | unset | Set to `1` only while developing the dashboard with `npm run dev` (allows the 5173 origin) |

## 7. Claude analysis

### Stage 1: Claude Code (recommended, no API key needed)

1. Open the project folder in Claude Code (`cd D:\Projects\MailMindAI` and run `claude`).
   Claude Code reads `.mcp.json` and asks you to approve the `mailmind` MCP server. Approve it.
2. Dashboard → **Claude Analysis**: pick an analysis type and conversations, then **Prepare
   preview**. Review exactly which emails and fields will be shared, tick the confirmation, and
   **Confirm for Claude Code**.
3. In Claude Code, run `/mailmind run pending analysis <id>`. Claude fetches only that confirmed
   context, and the validated result appears in the dashboard with source links.

You can also ask Claude Code directly, for example "What did my manager decide about the
retrofit?". The Skill searches with the MCP tools and can save the result. Saved results may
only cite emails Claude actually retrieved in that session.

### Stage 2: Anthropic API (optional, off by default)

1. Add `MAILMIND_ANTHROPIC_API_ALLOWED=true` and `MAILMIND_ANTHROPIC_API_KEY=...` to `.env`.
2. Restart MailMind. In **Settings**, enable "Allow confirmed analyses to be sent to the Anthropic API".
3. In **Claude Analysis**, choose **Anthropic API (direct)**. Each request is still previewed and
   confirmed individually.

## 8. Backups and tests

```powershell
scripts\backup.ps1 [-Dest D:\Backups\MailMind] [-Keep 10]   # consistent SQLite backup; token excluded
scripts\run_tests.ps1                                        # pytest (synthetic data) + dashboard type-check
```

To restore, stop MailMind, copy a backup over `data\mailmind.db`, start MailMind, and sign in again.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Gmail not connected" on sync | Run `scripts\login.ps1`; check `config\client_secret.json` exists |
| `invalid_grant` / token refresh failed | The Testing-mode token expired: run `scripts\login.ps1` |
| "Port 8765 is already in use" | `scripts\stop.ps1`, or start with `-Port 8770` |
| `/mailmind` can't see tools | Re-run `scripts\setup.ps1` (rewrites `.mcp.json`), restart Claude Code, approve the server |
| Server logs | `logs\server.err.log` |
