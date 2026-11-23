# MailMind AI security

## Threat model (summary)

| Asset | Threats considered | Main controls |
|---|---|---|
| Gmail account | Token theft; unintended modification | `gmail.readonly` only; forbidden-scope check at load time; DPAPI-encrypted token; read-only adapter API |
| Cached email (SQLite) | Other local users; backups leaking; growth over time | `data\` ACL restricted to your user; retention purge; one-click wipe; backups are documented as sensitive |
| Dashboard / API | Other websites in your browser (CSRF, DNS rebinding); LAN attackers | Loopback-only bind; Host allow-list; required custom header + Origin check on writes; no CORS; strict CSP |
| Claude analysis | Over-sharing; prompt injection from email content; fabricated output | Explicit selection, preview, hash-bound confirmation; untrusted-data envelope; Pydantic + provenance validation |
| MCP server | Claude being steered into broader access | Six fixed tools; no filesystem, shell or Gmail; size caps; audit log; citations limited to served emails |

## Gmail access

* **Scope:** exactly `https://www.googleapis.com/auth/gmail.readonly`. `backend/gmail/auth.py`
  rejects any token that carries `https://mail.google.com/`, `gmail.modify`, `gmail.send`,
  `gmail.compose`, `gmail.insert` or settings scopes, or that lacks `gmail.readonly`.
* **Why not a narrower scope?** `gmail.metadata` can't read message bodies or use search
  queries, and local analysis and search need both. `gmail.readonly` is the narrowest scope
  that supports the features.
* **Read-only code path:** `GmailApiAdapter` exposes only `getProfile`, `messages.list`,
  `messages.get` and `history.list`. Tests assert that no write verb is ever called and that the
  public surface is exactly those four methods.
* **Attachments:** never downloaded. Only filename, MIME type and size are stored.
* **Single connection:** one OAuth client, one token file, one adapter. The MCP server never
  loads Gmail credentials.

## Google restricted-scope implications

`gmail.readonly` is classified by Google as a **restricted scope**. This matters as follows
(check Google's current policies before you rely on any of it):

| Use | What applies |
|---|---|
| **Personal use, app in Testing status** (the intended setup) | Only listed test users (max 100) can sign in. Users see an "unverified app" notice. Refresh tokens for External apps in Testing may expire after 7 days, so you re-run `scripts\login.ps1`. No verification or security assessment is needed for your own use. |
| **Google Workspace, "Internal" user type** | Limited to accounts in your organisation. Workspace admins may need to allow the app (API controls). Restricted-scope verification generally doesn't apply to internal apps. |
| **Publishing to other users (External, In production)** | Requires **OAuth app verification** for restricted scopes, compliance with the **Google API Services User Data Policy, including the Limited Use requirements**, and an **annual independent security assessment** (CASA, via a Google-approved assessor). This applies when restricted-scope data is stored on, or transmitted through, servers. |
| **Sending restricted data to an AI provider** | Under Limited Use, transferring Gmail data to third parties is only allowed to provide or improve user-facing features, with the user's consent, and must not be used to train generalised AI/ML models. MailMind sends data to Anthropic only after per-request user confirmation. Anyone distributing MailMind must review this policy and Anthropic's data-usage terms for their account type. |

MailMind as delivered is meant for the **first row**: one person, their own OAuth client,
running locally.

## Token and secret protection

* The OAuth token is encrypted at rest with **Windows DPAPI** (user scope, with additional
  entropy) in `data\gmail_token.bin`. A plaintext token file is rejected on Windows.
* `config\client_secret.json`, `.env`, `data\`, `data_demo\`, `backups\`, `*.db` and `*.token`
  are git-ignored.
* The Anthropic API key is read from the environment or `.env`. It is never logged, stored
  in the database, or returned by the API (only "present: yes/no"); a test asserts this.
* The audit logger drops keys such as `body`, `token`, `api_key` and `password` from details.

## Network exposure

* The server binds to `127.0.0.1`. Config validation refuses any non-loopback host, and
  `backend/run.py` checks again.
* `TrustedHostMiddleware` only accepts `127.0.0.1` and `localhost` (blocks DNS and LLMNR rebinding).
* API reads are rejected when the browser reports `Sec-Fetch-Site` as `cross-site` or `same-site`.
* The Vite dev-server origin (port 5173) is accepted only when `MAILMIND_DEV_SERVER=1`.
* State-changing requests (`POST/PUT/PATCH/DELETE /api/*`) need the `X-MailMind-Request: 1`
  header, and any `Origin` must be the app's own loopback origin. No CORS headers are sent,
  so other sites can't add that header.
* Response headers: strict CSP (`default-src 'self'`, no inline scripts, `frame-ancestors 'none'`),
  `X-Frame-Options: DENY`, `nosniff`, `no-referrer`, and `no-store` on API responses.

## Untrusted email content

* HTML is converted to text server-side (scripts, styles, iframes and remote images dropped).
  Raw HTML is never stored or rendered.
* Control characters and Unicode bidi/zero-width characters are stripped, and bodies are length-capped.
* The dashboard renders all email-derived strings as React text. There is no
  `dangerouslySetInnerHTML`. Search highlighting is rebuilt from `[[ ]]` markers as React
  elements. Cleanup rationale only turns `https://mail.google.com/` URLs into links.
* Search input becomes a quoted-token FTS5 expression. LIKE wildcards in filters are escaped.
  All SQL is parameterised.
* Local rules flag phishing and prompt-injection phrasing as `suspicious`. Such emails get low
  importance and create no actions or follow-ups.

## AI safety controls

1. **Default local.** Sync and classification never contact an AI service. Low confidence
   never triggers Claude.
2. **Explicit selection.** A context must come from selected threads or emails, or a bounded
   weekly window that excludes bulk and suspicious mail. There are caps on message count
   (default 50) and characters (default 120k). The whole inbox can't be selected.
3. **Preview and confirmation.** The preview shows the analysis type, the conversation, every
   email and field shared, what is *not* shared, the destination and the processing method.
   Confirmation must send back the SHA-256 of the previewed context.
4. **Hash re-check before release.** If any selected email changed after confirmation, the
   request goes back to `awaiting_confirmation`.
5. **Prompt-injection resistance.** Emails are wrapped in `<email id="...">` envelopes, and
   every field is HTML-escaped so the envelope can't be broken (any case or spacing).
   In Claude Code, `get_email` and `get_thread` are not pre-approved, so the user approves each
   read, and a session can read at most 50 full emails. `save_analysis` can only complete a
   request this session claimed. The system prompt and the Skill tell Claude to treat
   content as data. The MCP server labels every body `untrusted_content`.
6. **Output validation.** Pydantic schema with `extra="forbid"`. Every item must cite
   `source_message_ids` from the shared context (or, for ad-hoc Claude Code analyses, from
   emails served in that MCP session). Other items are dropped and listed in
   `validation_warnings`. Responses with no grounded content are rejected.
7. **Anthropic API adapter is opt-in three times:** the config flag, the in-app toggle and a
   key, plus per-request confirmation. It uses structured outputs and handles refusals and
   `max_tokens` stops.

## Opt-in cleanup mode (Delete list)

Added at the owner's request: senders can be put on a **Delete list**, and MailMind then moves
their old mail to **Gmail's Trash** automatically after each sync.

* **Off by default.** It requires signing in with `scripts\login.ps1 -EnableCleanup`, which adds
  `gmail.modify`, the narrowest Gmail scope that can move mail to Trash. `https://mail.google.com/`
  (permanent delete), send, compose, insert and settings scopes remain forbidden, and tokens
  carrying them are rejected.
* **Separate code path.** The read-only sync adapter is unchanged. Only `backend/gmail/writer.py`
  can write, and it exposes exactly two methods: `messages.trash` and `messages.untrash`. The MCP
  server and Claude have no access to it.
* **Approval.** A rule stays inactive until you approve its preview. Approval must match the
  exact previewed count. Changing a rule's age threshold requires approving it again.
* **Protections, checked at preview and at every run:**
  - your own mail is never trashed;
  - Starred and Important messages are never trashed;
  - senders covered by trusted, manager or client rules are never trashed;
  - rules can't match your own address;
  - whole-domain rules for public mail providers (`@gmail.com` and similar) are refused;
  - at most 500 messages per run (`MAILMIND_MAX_TRASH_PER_RUN`);
  - a global **Pause all** switch.
* **Recoverable.** Trashed mail stays in Gmail's Trash for 30 days, and each run has **Undo**
  (untrash and re-cache). Every rule change, approval, run and undo is audit-logged with the
  Gmail IDs involved.
* **Unattended runs.** Automatic sync is off by default. When it's on, it uses the same code path as
  the Sync button, so only rules already approved in the dashboard run. The `mailmind-sync` Claude
  Code skill is limited to running `scripts\sync.ps1`: it can trigger a sync and read the run summary
  (counts only, no email content), and it can't approve or change rules.
* `gmail.modify` is also a Google **restricted** scope. The same Testing-mode and verification
  notes apply as for `gmail.readonly`.

## Writes and cleanup

Apart from the opt-in Delete list above, MailMind performs **no Gmail write operations**. Cleanup recommendations are records with
status `pending`, `dismissed` or `acknowledged`. There is no execute endpoint, and tests assert
this. Any future write feature must:

1. request an additional, narrowly-scoped OAuth permission through a separate, explicit
   consent flow;
2. show the exact affected messages and require per-operation approval;
3. write an audit entry before and after each operation;
4. stay off by default.

## Local data lifecycle

* Cached bodies older than `body_retention_days` (default 90) are purged after each sync.
  Metadata and analysis are kept.
* Settings has "Remove all cached email text" and "Remove all cached mail and analysis". Both
  require typing `DELETE LOCAL CACHE` and never touch Gmail.
* SQLite runs with `secure_delete=ON`, and a wipe is followed by a WAL checkpoint and `VACUUM`, so
  deleted text doesn't linger in free pages. Purges and wipes also clear the body excerpts kept
  in AI request previews.
* Backups (`scripts\backup.ps1`) contain cached email text, so store them as carefully as `data\`.
  They exclude the token.

## Audit log

Recorded in `audit_logs` and visible in Settings: sync start and finish, rule and setting
changes, action, follow-up and cleanup status changes, cache wipes, sign-in and out, every
AI lifecycle step (prepare, confirm, context released, API send, completed or failed, with the
Gmail IDs involved), and every MCP tool call.

## Security review status

An independent review found no high-severity issues. Two medium and six low findings were all
fixed, with regression tests. Details are in [REVIEW.md](REVIEW.md#security-review).

## Reporting

This is a personal tool. If you find a problem, stop the server (`scripts\stop.ps1`), revoke
the Gmail grant at https://myaccount.google.com/permissions, and fix it before reconnecting.
