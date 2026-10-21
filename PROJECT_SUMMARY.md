# Niswara — Project Summary

_Last updated: 2026-10-21 · Based on `main` @ `b27c1f7` plus the uncommitted interactive Class 3 (see [Change log](#6-change-log))_

**Niswara: From First Note → Professional** is a personal music-learning platform. It walks one learner through 8 levels: singing, theory, recording, production, mixing, mastering and release. Each level is split into classes, and the platform includes daily practice tracking, a journal, song projects, before/after recordings and achievements.

The repo contains **two separate applications**:

| App | Location | Status | Stack |
|---|---|---|---|
| **Niswara (primary)** | repo root (`index.html`, `js/`, `css/`, `supabase/`) | Active. Phases 1–2 of 10 done | Static, buildless HTML/CSS/vanilla JS. Tailwind via CDN. Supabase (Auth, Postgres, Storage). Hosted on GitHub Pages |
| **Learning Academy (prototype)** | `web/` | Early prototype, appears dormant | React 18, TypeScript, Vite, Tailwind, Zustand, PWA |

> **Login & sync status:** ✅ Live. `config.js` points at the real Supabase project, and migrations `0001`–`0004` have been run. Checked 2026-10-21: `profiles` answers, and `class_progress`, `class_notes` and `learner_state` correctly refuse logged-out visitors (`42501`). Progress follows the account to every device (`js/cloudSync.js`).

---

## 1. Primary app: Niswara (root)

### Architecture

```
index.html ─┬─ config.js            public Supabase URL + publishable key (real project)
            ├─ js/data.js           APP_DATA: levels, classes, achievements, quotes (static content)
            ├─ js/media.js          Media: recording files in IndexedDB
            ├─ js/store.js          Store: learner state in localStorage, one slot per account
            ├─ js/auth.js           Auth: the only module that touches Supabase
            ├─ js/classActivity.js  ClassActivity: per-user interactive-lesson progress + private notes (local + Supabase sync)
            ├─ js/router.js         hash router, requiresAuth guard, render/mount/unmount lifecycle
            ├─ js/components.js     pure HTML-string components
            ├─ js/timer.js          practice timer (wall-clock based)
            ├─ js/audio/pianoSynth.js        NoteUtils + PianoSynth (Web Audio piano, no audio files)
            ├─ js/components/piano.js        PianoKey, VirtualPiano (reusable)
            ├─ js/components/exercises.js    ExerciseScore, PitchExercise engine, HigherLower / SameDifferent / NoteIdentification
            ├─ js/components/vocalRecording.js  VocalRecording + PitchAnalysis (placeholder seam, isAvailable: false)
            ├─ js/components/personalNotes.js   PersonalNotes
            ├─ js/components/classProgress.js   ClassProgress
            ├─ js/audio/voiceRecorder.js     VoiceRecorder: shared mic/recording/level meter/save/playback engine
            ├─ js/audio/pitchAnalysis.js     PitchAnalysis: client-side YIN pitch ESTIMATE (honest, octave-aware)
            ├─ js/components/pitchMatch.js   ReferenceNotePlayer, SelfAssessment, PitchGuide, PitchComparison, PitchMatchExercise
            ├─ js/lessons/lessonKit.js       shared lesson header, stage tracker, chapters, assignment, loadAndRefresh
            ├─ js/lessons/understandingPitch.js interactive Class 3
            ├─ js/lessons/matchingANote.js   interactive Class 4
            ├─ js/lessons/registry.js        InteractiveLessons (class `interactive` key -> lesson)
            └─ js/pages/*.js        17 pages, each { render(params), mount(container) → cleanup }
supabase/migrations/0001_profiles.sql          profiles table, signup trigger, RLS, public_profiles view, avatars bucket
supabase/migrations/0002_security_fixes.sql    role protection, public view fix, avatar limits
supabase/migrations/0003_class_progress.sql    class_progress + class_notes (owner-only RLS)
supabase/migrations/0004_learner_state.sql     learner_state (whole progress per user, versioned) + private recordings bucket
```

**Progress on every device:**
- `Store` keeps a per-account local copy, so the site works offline.
- `js/cloudSync.js` pulls the account's `learner_state` on login and when the tab regains focus. It merges with `Store.mergeSyncStates`: unions for classes, practice sessions, journal and uploads; journal deletions are remembered; for single values the newer edit wins. It then uploads (debounced, versioned, retried on conflict) and flushes before logout.
- Recordings upload to `recordings/<uid>/<mediaId>`, and `Media.getUrl` downloads them on other devices.

Interactive lessons: a class with `interactive: "<key>"` in `data.js` is rendered by `InteractiveLessons[key]` instead of the standard class layout (see `js/pages/classDetail.js`). Only Class 3 uses this today. The components follow the same `render(id, opts)` + `wire(container, id, opts)` pattern as `Timer`, so later classes can reuse them. They're vanilla JS rather than React because the site is buildless and deploys straight to GitHub Pages.

Design seams (all intentional):
- `Store` is the only persistence layer. `CloudSync` mirrors it to the account; pages never talk to the backend for progress.
- `Media` is the only place recording files are handled: IndexedDB on the device, plus the account's private bucket.
- `Auth` is the only backend client.
- `APP_DATA` is the only content source.

### Feature status

| Area | Status |
|---|---|
| Curriculum: 8 levels, 60 classes | ✅ Structure done. **Only Level 1 (10 classes) has real content.** Levels 2–8 (50 classes) are marked "Coming Soon" and can't be completed. |
| Class page: lesson, timer, self-evaluation, upload + playback, reflection, complete | ✅ Working (local only) |
| **Class 3 — Understanding Pitch (interactive)** | ✅ Guided lesson (Understand → Listen → Play → Identify → Sing → Reflect → Complete). Includes a virtual piano (mouse, touch, keyboard), Learn With Piano, three ear-training exercises with scoring, Sing the Note (record and play back, labelled "Self Evaluation"), private notes, reflection, assignment, and an 8-item progress tracker. Completion requires all 8 items. Saves per user to Supabase once `0003` is run; until then, on the device. |
| **Class 4 — Matching a Note (interactive)** | ✅ Guided lesson (Understand → Hear → Sing → Adjust → Match → Practice → Reflect → Complete):<br>• The Listen → Remember → Sing → Compare → Adjust loop and a prominent "Choose comfort over range" rule.<br>• A reference note picked on the reused `VirtualPiano`, in a configurable range (Middle C4–C5 by default, or Lower C3–C4).<br>• Five exercises: Listen and Sing, Try Again and Adjust (3 attempts), Slide Into the Note, Blind Matching (3 hidden notes), and Note Chain (C–D–E; wider steps configurable but locked).<br>• Flat and sharp, with audio demos.<br>• An optional **pitch estimate**, offered only after you've judged a take yourself, and never a score.<br>• A practice timer logging "Pitch Training" with the class ID, an 8-question self-assessment, My Notes, a 10-item assignment with final reflection, a 10-item progress tracker with recording and self-evaluation counts, and a completion panel with the Class 5 bridge. |
| Practice: daily checklist + timer | ✅ Working (local only) |
| Journal, Projects, Progress, Achievements, Before/After | ✅ Working (local only) |
| Share-a-class post generator | ✅ Working |
| Auth: sign up / log in / log out / forgot + reset password | ✅ Built and hardened. Connected to the real project. ⚠️ Migrations not run yet |
| Profile: details, privacy toggles, avatar upload | ✅ Built (needs Supabase) |
| Protected `/dashboard` | ✅ Built. Shows Supabase profile plus that account's local progress |

### Roadmap (from `SETUP.md`)

| Phase | Scope | Status |
|---|---|---|
| 1 | Curriculum structure | ✅ Done |
| 2 | Authentication & profiles | ✅ Done. Credentials in place. **Waiting on migrations `0001`/`0002`** |
| 3 | Progress per user in Postgres, on every device | ✅ Built: all progress (classes and unlocks, practice, journal, projects, answers, milestones) via `learner_state` (`0004`). Class 3 scores and notes via `class_progress` / `class_notes` (`0003`). **Live once the migrations are run.** |
| 4 | Practice charts (weekly/monthly) | ⏳ |
| 5 | Recording uploads (Storage + `recordings` table) | 🟡 Core built: recordings upload to a private bucket and play on every device (`0004`). Privacy levels and sharing aren't built yet. |
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
| **L1** | 🔴 Blocker | Login was disabled because `config.js` had placeholder Supabase values. | 🔧 Credentials now in `config.js` (commit `b27c1f7`). **Still to do:** run migrations `0001`–`0004` and set the redirect URLs (`SETUP.md` §2, §4). |
| L8 | 🟡 Low | No Log Out button on desktop: the only one was inside the mobile menu, which is hidden on wide screens. | ✅ Log Out added to the dashboard. It saves pending progress before signing out. |
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
| B3 | 🟠 Medium | Local progress wasn't tied to an account; a shared browser showed one user's data to another. | ✅ One localStorage slot per account, and now synced to the account on every device (`learner_state`). Guest progress moves into the first account that logs in. |
| B4 | 🟡 Low | "100 Classes" achievement couldn't be earned (60 classes exist). | ✅ Replaced with "Curriculum Complete" (all classes) |
| B5 | 🟡 Low | Placeholder classes could be "completed". | ✅ Marked `comingSoon`. They can't be completed and show a "Coming Soon" badge. |
| B6 | 🟡 Low | Username silently dropped at signup. | ✅ See L6 |
| B7 | 🟡 Low | Class uploads couldn't be played back. | ✅ Each upload has a play button |
| B8 | 🟡 Low | `0001` migration wasn't re-runnable. | ✅ `drop policy if exists` before each policy. `0002` is re-runnable too. |
| B9 | 🟡 Low | Practice timer under-counted in background tabs. | ✅ Wall-clock based |

### Class 3 (interactive) — known limitations

| # | Severity | Issue | Status |
|---|---|---|---|
| C1 | 🟠 Medium | Class unlocks (`completedClassIds`) were device-only, so on a new device Class 3 stayed locked. | ✅ Fixed: unlocks sync via `learner_state`. Tested: a fresh device opens Class 3 with its notes and scores. |
| C2 | 🟡 Low | There's no automatic pitch judgement for Sing the Note. By design for now, it's labelled "Self Evaluation". `PitchAnalysis` in `vocalRecording.js` is where it plugs in. | ⏳ Future (AI/pitch analysis) |
| C3 | 🟡 Low | Tested in Chrome desktop and Chrome with phone emulation (390 px, touch). Not yet tried on a real iPhone/Safari (Web Audio unlock, MediaRecorder `audio/mp4`) or a real Android device. | ⏳ Needs a device check |
| C4 | 🟡 Low | Class 3 recordings stayed on the device (IndexedDB), like other recordings. | ✅ Fixed: uploaded to the private `recordings` bucket and downloaded on other devices |

### Class 4 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| D1 | — | By design, nothing in Class 4 is scored for accuracy. Pitch estimates appear only after self-assessment, and progress is about doing the loop, not hitting 100%. (Class 3: hear the difference → Class 4: move toward the note → Class 5: hear your own voice → later: consistent accuracy.) | Intended |
| D2 | 🟡 Low | The pitch estimate is checked against synthetic voices (11 cases including vibrato, noise, octave traps and slides) and a real recorded take. It hasn't been tried on real singing voices yet: breathy or very quiet singing may come back "couldn't estimate", which is the honest outcome. | ⏳ Try it with your own voice |
| D3 | 🟡 Low | The note-chain estimate draws the curve against the three reference lines but gives no verdict, because splitting one take into three notes reliably needs onset detection. | ⏳ Future |
| D4 | 🟡 Low | Recording on real iPhone/Safari hasn't been tested (same as **C3**). | ⏳ Device check |
| D5 | 🟢 Fixed | **Found in testing:** on a new device, a lesson drew before the account's copy arrived, so exercises (and Class 3's reflection) looked empty until a reload. | ✅ `LessonKit.loadAndRefresh` redraws once when newer data arrives (not while recording or typing) |

### Cross-device sync — known limitations

| # | Severity | Issue | Status |
|---|---|---|---|
| X1 | 🟡 Low | Another device's changes appear when you log in, return to the tab, or come back online. They don't stream in live while both screens are open side by side. | ⏳ Could add Supabase Realtime later |
| X2 | 🟡 Low | A recording only reaches the account once the device that made it is online and logged in. Until then, other devices show it but can't play it ("isn't stored on this device"). | By design |
| X3 | 🟡 Low | Journal, practice and project history live in one JSON row per user (limit 2 MB). That's plenty for years of use, but not queryable per entry. | ⏳ Split into tables if public profiles need it |

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

### Now: make login and cross-device progress live (needs you)
1. ~~Put the Supabase Project URL and key in `config.js`~~ ✅ Done (`b27c1f7`).
2. In the Supabase SQL Editor, run **`0001_profiles.sql`, `0002_security_fixes.sql`, `0003_class_progress.sql`, `0004_learner_state.sql`**, in that order (§2).
3. Set the Site URL and redirect URLs (§4).
4. Smoke-test on the live site:
   - Sign up (confirm by email; it's switched on for this project), log in, log out, forgot/reset password, profile edit, avatar upload.
   - Class 3 with two accounts: scores and notes must stay separate, and a row should appear in `class_progress` / `class_notes` in the Table Editor.
5. Try Class 3 on a real phone: audio, touch, and recording (**C3**).
6. Cross-device check:
   - Log in on your laptop, complete something and record a milestone.
   - Then log in on your phone. It should all be there, and the recording should play.
   - The dashboard should say "Progress synced to your account". In the Table Editor, your user should have one row in `learner_state`.

### Next
7. Phase 4: weekly and monthly practice charts. Practice is now stored as individual sessions, so this is mostly UI.
8. Optional live updates between open devices (**X1**).

### Content & interactive classes
9. Write Levels 2–8: 50 classes. Remove `comingSoon` from each as it's published.
10. Fill the "Demonstration" slot with audio or video examples (empty on every class).
11. Class 4 follow-ups:
    - Unlock "Wider steps (C–E–G)" in the note chain when ready (`CHAIN_LEVELS` in `matchingANote.js`).
    - Tune the pitch estimate on real voices (**D2**).
    - Build Class 5, "Listening to Your Own Voice", on `VoiceRecorder`, `PitchMatchExercise` and `LessonKit`.
12. Class 3 follow-ups:
    - Widen Find the Note beyond C4–F4 as a "harder" level.
    - Add real pitch detection behind `PitchAnalysis` (**C2**).
    - Reuse `VirtualPiano` and `PitchExercise` for Class 4 "Matching a Note" and later scales and intervals.

### Housekeeping
13. Replace the Tailwind play CDN with a compiled stylesheet (**S5**).
14. Decide the future of `web/`: merge or archive (**W4–W6**).
15. Add automated tests and CI. The checks run so far (below) were one-off scripts and aren't committed.

---

## 6. Change log

### 2026-10-21: interactive Class 4 "Matching a Note" (uncommitted)

New: `js/lessons/matchingANote.js`, `js/components/pitchMatch.js`, `js/audio/voiceRecorder.js`, `js/audio/pitchAnalysis.js`, `js/lessons/lessonKit.js`, `js/lessons/registry.js`.

Changed:
- `js/data.js`: Class 4 content and the `interactive` flag.
- `js/lessons/understandingPitch.js`: now uses `LessonKit`; output unchanged.
- `js/components/vocalRecording.js`: now uses `VoiceRecorder`; behaviour unchanged.
- `js/store.js`: practice sessions can carry `classId`; added `classPracticeMinutes`.
- `js/classActivity.js`: `bump`/`count` counters; `load` now reports whether the account brought anything new.
- `js/components/classProgress.js`: optional stats line.
- `css/styles.css` and `index.html`.

**No new migration:** Class 4 uses the existing `class_progress`, `class_notes`, `learner_state` and `recordings` tables.

Reuse instead of duplicates:
- **Same components:** Class 4 uses the Class 3 `VirtualPiano` (fixed configurable range), `PianoSynth`, `Timer`, `PersonalNotes`, `ClassProgress`, `ClassActivity`/Supabase and `Media`.
- **One shared recording engine:** `VoiceRecorder` now serves both Class 3 and Class 4.
- **Shared lesson structure:** both lessons render through `LessonKit`.

Verified:
- **Pitch estimator (Node, synthetic voices of known pitch):** 11/11 cases passed. A pure tone came out at 0 c, 255 Hz against C4 at −44 c ("slightly lower"), and +60 c at "slightly higher". A strong-2nd-harmonic tone didn't cause an octave error, and an octave-lower voice counted as a match. Vibrato, noise and slides were handled, and silence, a 0.2 s blip and a wild glide all returned "couldn't estimate". About 30 ms per take.
- **Class 4 journey, headless Chrome with a WAV fed into the fake microphone (255 Hz voice):**
  - All 15 steps render, and "lesson viewed" is set only after scrolling.
  - The piano picks the reference by mouse or touch, and Lower range switches to C3–C4.
  - All five exercises record, play back and self-assess. The estimate stays hidden until a take has been judged, and said "slightly lower than the reference" for the 255 Hz voice against C4.
  - Blind notes stay hidden until judged, then are revealed and counted 1/2/3 of 3. The chain lights each note as it plays, and its guide draws three reference lines.
  - The timer logged `{task: "pitch", minutes: 1, classId: "L1C04"}`, and the throat-tension answer shows the safety note.
  - Progress was 60% after the exercises and 100% after reflection and assignment. "CLASS 4 COMPLETE" appeared with the Class 5 bridge and Continue to Class 5, and Class 5 became current.
  - After reload everything was restored, including playback.
- **Mobile (390 px, touch):** no sideways scroll, and touch works for piano, reference, record/stop and judgement chips.
- **Two users across two devices (mock account server):**
  - Alice's Class 4 take, judgement, self-assessment, notes, practice minutes and Class 3 reflection all appeared on a fresh "phone". Her laptop recording played there.
  - Bob on the same phone saw nothing, and the server kept separate per-user rows.
- **Regression:** the Class 3 piano, journey (with the refactored recorder) and mobile tests all pass. All 19 routes render, and the merge and Store tests pass.
- **Bugs found and fixed while testing:**
  - All final-reflection boxes shared one debounced save, so only the last box typed in was saved.
  - The blind-note counter was off by one.
  - On a new device, lessons drew before the account's data arrived (**D5**).

**Not verified:** real singing voices (**D2**), real iPhone/Android hardware (**D4**), and a real two-account run against your live Supabase (the logic was tested against a mock with the same contract).

### 2026-10-21: progress on every device (uncommitted)

Changed: `js/store.js` (sync-safe data shapes and merge/export/import, same public API), `js/media.js` (download from the account on other devices), `js/auth.js` (learner_state and recordings calls), `js/classActivity.js` (`flush` returns a promise), `js/app.js` (sync on login, flush before logout, re-render when another device's progress arrives, deferred while you're typing), `js/pages/dashboard.js` (sync status line and Log Out button), `index.html`, `SETUP.md`.
New: `js/cloudSync.js`, `supabase/migrations/0004_learner_state.sql`.

Verified:
- **Merge rules, in Node** (two `vm` "devices" running the real `store.js`):
  - Same-day practice from both devices adds up (10 + 15 = 25), and repeat merges never double-count.
  - Journal deletions stick, a newer untick beats an older tick, and older saved data keeps its minutes.
  - Class 3 unlocks on the other device, and interactive-class data stays out of `learner_state`.
- **Two separate Chrome instances ("laptop" and "phone") sharing a mock account server** (same contract as the Supabase calls, including the version check):
  - The phone got the laptop's completed classes, unlocked Class 3, practice, journal, Class 3 notes and scores. The milestone recording downloaded (4096 B) and played. The dashboard showed "Progress synced to your account".
  - Practising on both at once ended with 30 min on both devices and in the account (one version conflict, merged and retried).
  - A journal delete on the phone disappeared on the laptop.
  - A change made just before Log Out still reached the account.
  - A second user (Bob) on the same phone saw none of Alice's progress. Alice back on the laptop had everything (37 min).
- **Tables missing (today's real project):** progress stays on the device, and the dashboard says "Saved on this device. Account sync isn't set up on the server yet."
- **Regression:** all 19 routes render with no errors. The Class 3 journey still passes, and the earlier Store/Utils checks still pass.

**Not verified:** against the real Supabase project (needs the migrations and a confirmed account), and Supabase-specific behaviour of the version-checked update and the `audio/*` bucket rule. The mock server follows the documented behaviour.

### 2026-10-21: interactive Class 3 "Understanding Pitch" (uncommitted)

Changed: `index.html`, `css/styles.css`, `js/auth.js` (4 class-progress/notes calls), `js/store.js` (`classActivity` and `classNotes` slots), `js/data.js` (Class 3 content plus `interactive` flag), `js/pages/classDetail.js` (hand-off to interactive lessons; other classes unchanged), `SETUP.md`.
New: `js/classActivity.js`, `js/audio/pianoSynth.js`, `js/components/{piano,exercises,vocalRecording,personalNotes,classProgress}.js`, `js/lessons/understandingPitch.js`, `supabase/migrations/0003_class_progress.sql`.

Verified in headless Chrome (real Web Audio, IndexedDB, and MediaRecorder with a fake microphone):
- **Layout:** all 16 steps render in the specified order.
- **Piano:**
  - 15 white + 10 black keys, C3–C5, with octave labels.
  - A mouse press shows "C4 · 261.63 Hz" and lights the key.
  - Sliding the pointer plays C4 → D4 → E4. Keyboard A/W/S plays C4/C#4/D4 at the exact frequencies, and Z/X shifts octave.
  - Typing in text boxes plays nothing.
  - Sustain, volume, octave and reset work. Audio output peaks at 0.15–0.33, so there's sound and no clipping.
- **Learn With Piano:** shows ↑ / ↓ / = and plots the pitch path.
- **Exercises:**
  - Answers are hidden until the learner responds. A wrong answer gives "Not quite. Listen again." and offers "Show me the answer".
  - Every right answer's feedback matched the frequencies actually played.
  - Scores came out exactly as expected: 11 attempts, 10 correct, 91%, 9/10 first try. The difficulty curve ran ≥5 → ≥3 → ≥1 semitones.
  - **Bug found and fixed:** an interrupted playback used to unlock the answer buttons before the notes had finished.
- **Sing the Note:** a webm recording is saved and played back. Self-evaluation is saved and restored.
- **Gating:** "lesson viewed" is set only after scrolling through steps 1–5, and Complete stays disabled until all 8 progress items are done. Completion unlocks Class 4 and writes a journal entry.
- **After reload:** notes, reflection, scores and recording are all restored.
- **Mobile** (390 px, touch emulation): 1 octave (C4–C5), no sideways scroll, touch press/slide/black keys work without scrolling the page, tap-to-answer works, and the keyboard help is hidden.
- **Per-user** (mocked Supabase calls, rows keyed by user ID like RLS): User A 80% and User B 45% stayed independent. Notes were never shared. A "new device" restored A's progress and notes from the server. With tables missing it falls back to "Saved on this device".
- **Regression:** all 19 routes render with no errors. Standard classes keep their old layout, the protected pages still redirect, and the piano keyboard stops when you leave Class 3. The earlier Store/Utils checks still pass.

**Not verified:** against the real Supabase project (no tables yet, no test account), real iPhone/Android hardware, and `0003` hasn't been run against Postgres.

### 2026-10-21: login & issue fixes (committed in `79224dc`)

Files changed: `js/app.js`, `js/auth.js`, `js/router.js`, `js/store.js`, `js/timer.js`, `js/utils.js`, `js/components.js`, `js/data.js`, `js/pages/{classDetail,dashboard,forgotPassword,login,profile,progress,resetPassword,share,signup}.js`, `index.html`, `SETUP.md`, `supabase/migrations/0001_profiles.sql`, `web/README.md`, `web/src/store/useProgressStore.ts`.
New files: `js/media.js`, `supabase/migrations/0002_security_fixes.sql`, `web/public/icons/icon-{192,512}.png`.

Verified:
- `node --check` on every root JS file.
- A Node script running the real `data.js`, `utils.js` and `store.js` checked local day keys, streaks, the coming-soon lock, the new achievement, per-account switching (guest adoption, isolation), legacy upload migration, the save-failure event and `?next=` sanitising. All passed.
- Headless Chrome rendered all main routes with no JS errors. `#/dashboard` redirects to `#/login?next=%23%2Fdashboard`.
- Headless Chrome with real IndexedDB, in the real app: a 2 MB class upload left only 948 bytes in localStorage and played back from a `blob:` URL. Class completion advanced to the next class. Placeholder classes refused completion and showed the "Coming Soon" UI. The save-failure banner appeared and dismissed. Milestone upload and playback worked.

**Not verified (needs a live Supabase project):** real sign-up/login/logout, account switching triggered by real auth events, the password-recovery redirect, avatar upload limits, and both SQL migrations. The SQL was written by hand and hasn't been run against Postgres.
