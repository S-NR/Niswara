# Niswara — Setup & Architecture

This covers **Phase 1 (curriculum)** and **Phase 2 (authentication)** of the
roadmap below. Phases 3–10 (per-user database progress, recordings, social
features, admin dashboard, analytics, AI coach) are not built yet — see
[Roadmap](#roadmap) for what each one will touch.

## Architecture

Niswara is a **static, buildless site** — plain HTML/CSS/JS, no npm install,
no bundler. It runs by opening `index.html` directly, and deploys by pushing
to `main` (GitHub Pages serves the repo root as-is).

```
Frontend   →  static HTML/CSS/JS, hosted on GitHub Pages
Auth       →  Supabase Auth (email + password)
Database   →  Supabase Postgres, with Row Level Security
Storage    →  Supabase Storage (avatars today; recordings in Phase 5)
```

The Supabase JS SDK is loaded from a CDN (`<script src="...supabase-js...">`
in `index.html`) instead of via npm, so there's nothing to install locally.
Everything the browser needs to reach Supabase lives in `config.js`.

### Why `config.js` is safe to commit

Supabase's security model lives entirely in **Row Level Security (RLS)
policies** in Postgres, not in keeping the anon key secret — it's designed
to sit in public frontend code (same as a Firebase web config). The **only**
key that must never appear in this repo or in the browser is the
`service_role` key, which bypasses RLS entirely. See `.env.example` for
where that one belongs (server-side / local admin scripts only — none exist
yet).

## Local development

No install required. Two options:

```bash
# Option A — just open it
# double-click index.html, or open it directly in a browser

# Option B — serve it (avoids occasional file:// quirks with Storage/CORS)
python -m http.server 8080
# then visit http://localhost:8080
```

If you connect a real Supabase project (below) and want to test locally,
add `http://localhost:8080` to that project's Auth → URL Configuration →
Redirect URLs, or email/password-reset links sent during local testing
will redirect to the wrong place.

## Connecting a Supabase project

The site works today with **no backend connected** — curriculum browsing
and local practice tracking are unaffected, and the auth pages show a
"backend not configured" notice instead of erroring. To turn on real
accounts:

### 1. Create a project

1. [supabase.com](https://supabase.com) → New Project (free tier is fine).
2. Pick a name, a database password (save it somewhere — you probably
   won't need it again, but it's your Postgres superuser password), and a
   region close to your users.
3. Wait ~2 minutes for provisioning.

### 2. Run the migrations

Dashboard → **SQL Editor** → New query → paste the contents of each file
below, **in order**, → **Run**:

1. [`supabase/migrations/0001_profiles.sql`](supabase/migrations/0001_profiles.sql)
   — the `profiles` table, the trigger that creates a profile row on
   signup, Row Level Security policies, the `public_profiles` view, and an
   `avatars` storage bucket with its own policies.
2. [`supabase/migrations/0002_security_fixes.sql`](supabase/migrations/0002_security_fixes.sql)
   — stops users from changing their own `role`, makes `public_profiles`
   readable by visitors (opted-in profiles only), and limits avatars to
   2 MB images. **Required** — without it any user can make themselves
   an admin.

Both are safe to re-run. (If you're using the Supabase CLI instead:
`supabase db push`.) Supabase's database linter will flag
`public_profiles` as a "security definer view" — that's intentional; the
view itself only exposes opted-in rows and safe columns.

### 3. Fill in `config.js`

Dashboard → **Project Settings → API**:

| Value | Goes in |
|---|---|
| Project URL | `SUPABASE_URL` |
| `anon` `public` key | `SUPABASE_ANON_KEY` |

Edit `config.js` at the repo root with these two values, then commit it —
see [Why `config.js` is safe to commit](#why-configjs-is-safe-to-commit).
**Never** put the `service_role` key here.

### 4. Set your Auth redirect URLs

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://s-nr.github.io/Niswara/` (or your custom domain)
- **Redirect URLs**, add:
  - `https://s-nr.github.io/Niswara/index.html`
  - `http://localhost:8080/index.html` (if you test locally)

This is what makes the "forgot password" email link land back on the right
page instead of erroring or redirecting to Supabase's default.

### 5. (Optional) Faster manual testing

Dashboard → **Authentication → Providers → Email** → turn **Confirm email**
off if you want `signUp()` to return a session immediately instead of
requiring an email click, while you're testing. Turn it back on before
real users sign up.

### 6. Push and verify

Commit `config.js`, push to `main`. GitHub Pages redeploys automatically.
Visit the live site → Sign Up → check that a row appears in the
`profiles` table in the Supabase dashboard (Table Editor).

## Deployment

| Layer | Where |
|---|---|
| Frontend | GitHub Pages, auto-deployed from `main` on push |
| Auth / Database / Storage | Supabase (already deployed the moment you create the project) |

There is no build step and nothing to deploy for the backend beyond running
the SQL migrations once. Future migrations (`0003_...sql`, etc., as Phase 3+
lands) are run the same way, in order.

## Security notes

- `config.js` holds only public, non-secret values (see above).
- The `service_role` key is never referenced anywhere in this repo's
  frontend code, and should only ever live in a gitignored `.env` used by
  a local/server-side script (template in `.env.example`) — none exist yet.
- All user data access is gated by Postgres Row Level Security, not by
  frontend checks — the frontend checks (e.g. `requiresAuth` routes) are a
  UX convenience, not the security boundary.
- Profile privacy defaults to fully private (`is_public`, `show_progress`,
  `show_completed_classes`, `show_recordings` all default `false`).

## Roadmap

**Done:**
- **Phase 1 — Curriculum**: the 8-level, class-by-class structure in
  `js/data.js` matches the canonical curriculum list.
- **Phase 2 — Authentication**: sign up, log in, log out, forgot/reset
  password, profile (with privacy settings and avatar upload), a protected
  `/dashboard`. Backed by Supabase Auth + the `profiles` table + RLS.

**Not yet** (each becomes its own migration + feature pass):
- **Phase 3 — Database progress**: classes/lessons/practice/journal move
  from this browser's `localStorage` into real per-user Postgres rows
  (`lesson_progress`, `practice_sessions`, `journal_entries`, etc., per the
  entity list in the original spec). `js/store.js` is already the single
  seam everything else reads through, so this phase mostly rewrites that
  one file's internals — page code shouldn't need to change.
- **Phase 4 — Practice tracking** (weekly/monthly charts, once sessions are
  in the database).
- **Phase 5 — Recording uploads** (Supabase Storage, `recordings` table,
  privacy levels).
- **Phase 6 — Projects & journal** move to the database.
- **Phase 7 — Public profiles & following** (`public_profiles` view already
  exists and is ready for this).
- **Phase 8 — Admin dashboard** (the `role` column and `is_admin()` helper
  already exist in the schema, unused until this phase).
- **Phase 9 — Analytics.**
- **Phase 10 — AI coach integration** (placeholder API layer only).

Until Phase 3 ships, logging in gives you a real account and profile, but
the dashboard's class/practice numbers still read from this browser's local
`Store` — the same data source the public pages already used. That's
intentional, matches the phase order above, and means nothing here needs to
be redone once Phase 3 lands.

In the meantime, `Store` keeps a separate local slot per account
(`ffntp.v1:<user id>`), so two people sharing a browser never see each
other's progress. The first time an account logs in on a browser, any
progress made there while logged out moves into that account. Progress
does **not** follow an account to another device until Phase 3.

Recordings are stored in the browser's IndexedDB (`js/media.js`), not in
localStorage, and also stay on the device until Phase 5.
