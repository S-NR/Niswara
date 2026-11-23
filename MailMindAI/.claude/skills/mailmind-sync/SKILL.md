---
name: mailmind-sync
description: Sync the user's MailMind Gmail accounts and report what happened, including Delete-list cleanup. Use for "sync my mail", "sync my work account", "sync all accounts", "fetch emails from January to June", "run mailmind cleanup", or "what did MailMind clean up?".
allowed-tools: Bash(powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync.ps1:*), Bash(powershell -NoProfile -ExecutionPolicy Bypass -File scripts\sync.ps1:*)
---

# MailMind sync

MailMind runs locally (one server per Gmail account). This skill only **triggers a sync on a
running MailMind server and reports the result**, through `scripts/sync.ps1` in the project root.
A completed sync also applies the Delete-list rules the user has already approved in the
dashboard (when cleanup mode is enabled for that account).

## How to run

Run from the MailMind project root (`D:\Projects\MailMindAI`):

| User asks for | Command |
|---|---|
| sync (default account) | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync.ps1` |
| a specific account, e.g. "work" | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync.ps1 -DataDir data_work` |
| all accounts | `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync.ps1 -All` |
| a date range | add `-From yyyy-mm-dd -To yyyy-mm-dd` (inclusive) |

Account folders are `data` (default) and `data_<name>`. A long sync (big date range) can take
many minutes because of Gmail's rate limits. Use a generous timeout, or `-NoWait` and tell the
user to watch the dashboard.

## Rules

1. Only run `scripts/sync.ps1`. Do not start, stop or sign in servers, edit settings, read the
   database, or call Gmail any other way. If a server isn't running, relay the script's
   instruction (`scripts\start.ps1 ...`) to the user.
2. **Never approve, create or change Delete-list rules.** Approval is the user's decision in the
   dashboard (Cleanup Center). If the script reports "Needs approval", tell the user which sender and
   how many emails, and point them to `http://127.0.0.1:<port>/cleanup`.
3. Report briefly per account: sync status (new / updated / errors), what the Delete list moved to
   Trash, and anything that needs the user's attention. Mention that trashed mail can be restored
   from the dashboard (Undo) or Gmail's Trash for 30 days.
4. The script output contains no email content. Don't try to fetch any. For analysing emails, use
   the `mailmind` skill instead.
