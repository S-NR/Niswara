# Niswara — Project Summary

_Last updated: 2026-10-21 · Based on `main` @ `c05dbdc` plus uncommitted fixes (see [Change log](#6-change-log))_

**Niswara: From First Note → Professional** is a personal music-learning platform. It walks one learner through 8 levels: singing, theory, recording, production, mixing, mastering and release. Each level is split into classes, and the platform includes daily practice tracking, a journal, song projects, before/after recordings and achievements.

The repo contains **two separate applications**:

| App | Location | Status | Stack |
|---|---|---|---|
| **Niswara (primary)** | repo root (`index.html`, `js/`, `css/`, `supabase/`) | Active. Phases 1–2 of 10 done | Static, buildless HTML/CSS/vanilla JS. Tailwind via CDN. Supabase (Auth, Postgres, Storage). Hosted on GitHub Pages |
| **Learning Academy (prototype)** | `web/` | Early prototype, appears dormant | React 18, TypeScript, Vite, Tailwind, Zustand, PWA |

> **Login status:** all the code-side login issues are fixed. Login stays switched off until `config.js` holds a real Supabase Project URL and anon key, and migrations `0001` + `0002` have been run. See `SETUP.md` §1–6.

---

## 1. Primary app: Niswara (root)

### Architecture

```
index.html ─┬─ config.js            public Supabase URL + anon key (currently placeholders)
            ├─ js/data.js           APP_DATA: levels, classes, achievements, quotes (static content)
            ├─ js/media.js          Media: recording files in IndexedDB
            ├─ js/store.js          Store: learner state in localStorage, one slot per account
            ├─ js/auth.js           Auth: the only module that touches Supabase
            ├─ js/router.js         hash router, requiresAuth guard, render/mount/unmount lifecycle
            ├─ js/components.js     pure HTML-string components
            ├─ js/timer.js          practice timer (wall-clock based)
            └─ js/pages/*.js        17 pages, each { render(params), mount(container) → cleanup }
supabase/migrations/0001_profiles.sql          profiles table, signup trigger, RLS, public_profiles view, avatars bucket
supabase/migrations/0002_security_fixes.sql    role protection, public view fix, avatar limits
```

Design seams (all intentional):
- `Store` is the only persistence layer. Phase 3 rewrites only its internals.
- `Media` is the only place recording files are stored. Phase 5 swaps it for Supabase Storage.
- `Auth` is the only backend client.
- `APP_DATA` is the only content source.

### Feature status

| Area | Status |
|---|---|
| Curriculum: 8 levels, 60 classes | ✅ Structure done. **Only Level 1 (10 classes) has real content.** Levels 2–8 (50 classes) are marked "Coming Soon" and can't be completed. |
| Class page: lesson, timer, self-evaluation, upload + playback, reflection, complete | ✅ Working (local only) |
| Practice: daily checklist + timer | ✅ Working (local only) |
| Journal, Projects, Progress, Achievements, Before/After | ✅ Working (local only) |
| Share-a-class post generator | ✅ Working |
| Auth: sign up / log in / log out / forgot + reset password | ✅ Built and hardened. ⚠️ **Not live:** `config.js` still holds placeholder values |
| Profile: details, privacy toggles, avatar upload | ✅ Built (needs Supabase) |
| Protected `/dashboard` | ✅ Built. Shows Supabase profile plus that account's local progress |

### Roadmap (from `SETUP.md`)

| Phase | Scope | Status |
|---|---|---|
| 1 | Curriculum structure | ✅ Done |
| 2 | Authentication & profiles | ✅ Done. **Waiting on Supabase credentials to go live** |
| 3 | Move progress, practice and journal into Postgres per user | ⏳ Not started (interim per-account local storage is in place) |
| 4 | Practice charts (weekly/monthly) | ⏳ |
| 5 | Recording uploads (Storage + `recordings` table) | ⏳ (interim: IndexedDB via `js/media.js`) |
| 6 | Projects & journal in the database | ⏳ |
| 7 | Public profiles & following | ⏳ (`public_profiles` view now works, after `0002`) |
| 8 | Admin dashboard | ⏳ (`role` column, `is_admin()` and role protection exist) |
| 9 | Analytics | ⏳ |
| 10 | AI coach (placeholder API layer) | ⏳ |

---

## 2. Loop & control-flow review

### Code loops

Every iterative loop terminates and none are hot paths.

| Location | Loop | Verdict |
|---|---|---|
| `js/store.js` `currentStreak()` | `while (true)` walks back one day at a time | ✅ Terminates at the first day with no practice. Now uses local day keys. |
| `js/store.js` `firstIncompleteUnlockedClassId()` | `for…of` over sorted classes | ✅ Correct. O(n²) on 60 items, which is fine. |
| `js/store.js` `migrateLegacyUploads()` | one pass over stored uploads | ✅ Runs once at startup. No-op once migrated. |
| `js/store.js` `minutesForSkill()` | nested `forEach` over days × task keys | ✅ Fine |
| `js/router.js` `match()` | linear scan of 17 routes | ✅ Fine |
| `js/timer.js` | `setInterval(tick, 1000)` | ✅ Cleared on pause, reset and unmount. ✅ **Fixed:** elapsed time now comes from the clock, so background tabs no longer under-count. |
| `js/pages/progress.js` `wireAudioPlayers` | delegated click listener | ✅ Removed on unmount. Pauses audio when leaving a page. |

### Navigation / auth loops

| Flow | Verdict |
|---|---|
| Protected route → `#/login?next=…` → after login, `Auth.onChange` → `next` or `#/dashboard` | ✅ No redirect loop. ✅ **Fixed:** `next` is now validated (in-app routes only; never back to login or signup). |
| `updateUserMetadata()` fires `USER_UPDATED` | ✅ Same user, so it only refreshes the navbar. No render loop. |
| `Auth.init()` is awaited before `Router.start()`; re-renders before startup are ignored | ✅ No double render on load |
| Session ends in another tab, or the token expires, while on a protected page | ✅ **Fixed:** the page re-renders, and the guard sends you to login |
| Password-recovery link lands on the wrong route | ✅ **Fixed:** the `PASSWORD_RECOVERY` event routes to `#/reset-password` |
| Async `mount()` on Dashboard/Profile after navigating away | ✅ **Fixed:** skipped if the page is no longer on screen |

---

## 3. Issues

Status: ✅ fixed · 🔧 fixed, but needs your action · ⏳ open

### Security

| # | Severity | Issue | Status |
|---|---|---|---|
| **S1** | 🔴 High | Any user could make themselves admin: `profiles_update_own` allowed updating `role`. | 🔧 Fixed in `0002_security_fixes.sql`: a trigger blocks role changes by non-admins and locks `id` and `created_at`. **Run `0002` on the Supabase project.** |
| **S2** | 🟠 Medium | `public_profiles` returned no rows to other users (`security_invoker` + own-row RLS). It also exposed progress even when `show_progress` was off. | 🔧 Fixed in `0002`: the view now runs as its owner, filters to opted-in rows, and hides level/class unless `show_progress`. **Run `0002`.** |
| S3 | 🟡 Low | `avatar_url` was inserted unescaped into `<img src>`. | ✅ Escaped in `components.js` and `profile.js` |
| S4 | 🟡 Low | Avatars bucket had no type or size limit. | 🔧 `0002` sets a 2 MB limit and PNG/JPEG/WebP/GIF only. Also checked client-side in `auth.js`. **Run `0002`.** |
| S5 | 🟡 Low | Tailwind loaded from an unpinned dev-only "play CDN". | ⏳ Partly fixed: pinned to `3.4.17`. Still the play CDN; moving to a compiled stylesheet is open. |

### Login / auth

| # | Severity | Issue | Status |
|---|---|---|---|
| **L1** | 🔴 Blocker | Login is disabled because `config.js` has placeholder Supabase values. | 🔧 Needs your Supabase Project URL + anon key, then `SETUP.md` §1–6 |
| L2 | 🟠 Medium | Losing the session in another tab or by token expiry left protected pages visible. | ✅ Fixed (`app.js`, `router.js`) |
| L3 | 🟡 Low | The `?next=` redirect target wasn't validated. | ✅ `Utils.safeNextRoute()` |
| L4 | 🟡 Low | Recovery link could land on the wrong page. Expired or other-browser links gave an unclear message. | ✅ `PASSWORD_RECOVERY` routing, and a clearer message about using the same browser |
| L5 | 🟡 Low | Forgot-password showed "sent" even when sending failed (rate limit, bad redirect URL). | ✅ Real errors are shown. Still doesn't reveal whether an account exists. |
| L6 | 🟡 Low | If the requested username was taken at signup, it was silently dropped. | ✅ Dashboard and Profile now prompt you to pick one |
| L7 | 🟡 Low | Auth inputs had no `autocomplete` hints, so password managers didn't work well. | ✅ Added |

### Bugs

| # | Severity | Issue | Status |
|---|---|---|---|
| **B1** | 🔴 High | Recordings stored as base64 in localStorage went over the ~5 MB quota. Every later save then failed silently. | ✅ Files now go to IndexedDB (`js/media.js`). Old recordings are migrated automatically on load. Save failures show a banner. |
| **B2** | 🟠 Medium | The practice day rolled over at UTC midnight (05:30 IST). | ✅ `todayKey()` uses the local date |
| B3 | 🟠 Medium | Local progress wasn't tied to an account; a shared browser showed one user's data to another. | ✅ Interim fix: one localStorage slot per account. Guest progress moves into the first account that logs in. Cross-device sync still needs Phase 3. |
| B4 | 🟡 Low | "100 Classes" achievement couldn't be earned (60 classes exist). | ✅ Replaced with "Curriculum Complete" (all classes) |
| B5 | 🟡 Low | Placeholder classes could be "completed". | ✅ Marked `comingSoon`. They can't be completed and show a "Coming Soon" badge. |
| B6 | 🟡 Low | Username silently dropped at signup. | ✅ See L6 |
| B7 | 🟡 Low | Class uploads couldn't be played back. | ✅ Each upload has a play button |
| B8 | 🟡 Low | `0001` migration wasn't re-runnable. | ✅ `drop policy if exists` before each policy. `0002` is re-runnable too. |
| B9 | 🟡 Low | Practice timer under-counted in background tabs. | ✅ Wall-clock based |

---

## 4. Secondary app: `web/` (Learning Academy prototype)

A generic React/TypeScript "sequential course" engine: day lessons, quizzes, a final exam, and a PDF certificate. It ships one 10-day music-theory course with templated content and name-only local "auth". It is not connected to Niswara.

| # | Issue | Status |
|---|---|---|
| W1 | Failing a retake of a passed day un-completed it and re-locked every later day (`recordDay`). | ✅ Fixed |
| W2 | `public/icons/icon-192.png` and `icon-512.png` were missing, so favicon and PWA icons were broken. | ✅ Generated placeholder icons (indigo, music note). Replace with real branding when ready. |
| W3 | README listed `npm run dev` before `npm install`. | ✅ Fixed |
| W4 | Progress is keyed by course, not user. | ⏳ Won't fix while auth is name-only: each "login" mints a new random ID, so keying by user would lose progress on every re-login. Revisit if `web/` gets real auth. |
| W5 | `lint` and `format` scripts reference ESLint and Prettier, which aren't installed. | ⏳ Open |
| W6 | Quiz content is templated: every day has the same two generic questions. | ⏳ Open (content) |

**Decision needed:** either merge useful ideas from it into Niswara (quizzes, certificates, a typed domain layer) or archive `web/`.

---

## 5. Pending tasks (prioritised)

### Now: make login live (needs you)
1. Create a Supabase project, or use an existing one. Put its **Project URL** and **anon public key** in `config.js` (`SETUP.md` §1, §3). **Never** use the `service_role` key.
2. Run `0001_profiles.sql`, **then `0002_security_fixes.sql`**, in the Supabase SQL Editor (§2).
3. Set the Site URL and redirect URLs (§4).
4. Smoke-test on the live site: sign up, log in, log out, forgot/reset password, profile edit, avatar upload. Check that a second account on the same browser sees empty progress.

### Next: Phase 3
5. Design migration `0003` (`lesson_progress`, `practice_sessions`, `journal_entries`, `projects`) and rewrite the internals of `js/store.js` to use it.
6. Import each account's local slot (`ffntp.v1:<uid>`) into the database on first login after Phase 3.
7. Phase 5: move recordings from IndexedDB (`js/media.js`) to Supabase Storage.

### Content
8. Write Levels 2–8: 50 classes. Remove `comingSoon` from each as it's published.
9. Fill the "Demonstration" slot with audio or video examples (empty on every class).

### Housekeeping
10. Replace the Tailwind play CDN with a compiled stylesheet (**S5**).
11. Decide the future of `web/`: merge or archive (**W4–W6**).
12. Add automated tests and CI. The checks run for this round (below) were one-off scripts and aren't committed.

---

## 6. Change log

### 2026-10-21: login & issue fixes (uncommitted)

Files changed: `js/app.js`, `js/auth.js`, `js/router.js`, `js/store.js`, `js/timer.js`, `js/utils.js`, `js/components.js`, `js/data.js`, `js/pages/{classDetail,dashboard,forgotPassword,login,profile,progress,resetPassword,share,signup}.js`, `index.html`, `SETUP.md`, `supabase/migrations/0001_profiles.sql`, `web/README.md`, `web/src/store/useProgressStore.ts`.
New files: `js/media.js`, `supabase/migrations/0002_security_fixes.sql`, `web/public/icons/icon-{192,512}.png`.

Verified:
- `node --check` on every root JS file.
- A Node script running the real `data.js`, `utils.js` and `store.js` checked local day keys, streaks, the coming-soon lock, the new achievement, per-account switching (guest adoption, isolation), legacy upload migration, the save-failure event and `?next=` sanitising. All passed.
- Headless Chrome rendered all main routes with no JS errors. `#/dashboard` redirects to `#/login?next=%23%2Fdashboard`.
- Headless Chrome with real IndexedDB, in the real app: a 2 MB class upload left only 948 bytes in localStorage and played back from a `blob:` URL. Class completion advanced to the next class. Placeholder classes refused completion and showed the "Coming Soon" UI. The save-failure banner appeared and dismissed. Milestone upload and playback worked.

**Not verified (needs a live Supabase project):** real sign-up/login/logout, account switching triggered by real auth events, the password-recovery redirect, avatar upload limits, and both SQL migrations. The SQL was written by hand and hasn't been run against Postgres.
