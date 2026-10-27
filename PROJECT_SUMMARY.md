# Niswara — Project Summary

_Last updated: 2026-10-27 · Based on `main` @ `6402b1f` (Classes 1–19) plus the uncommitted common **🎤 Warm-up** section (see [Change log](#6-change-log))_

**Niswara: From First Note → Professional** is a personal music-learning platform. It walks one learner through 8 levels: singing, theory, recording, production, mixing, mastering and release. Each level is split into classes, and the platform includes daily practice tracking, a journal, song projects, before/after recordings and achievements.

The repo contains **two separate applications**:

| App | Location | Status | Stack |
|---|---|---|---|
| **Niswara (primary)** | repo root (`index.html`, `js/`, `css/`, `supabase/`) | Active. Phases 1–3 of 10 built (Phase 3 live once migrations are run — see Roadmap) | Static, buildless HTML/CSS/vanilla JS. Tailwind via CDN. Supabase (Auth, Postgres, Storage). Hosted on GitHub Pages |
| **Learning Academy (prototype)** | `web/` | Early prototype, appears dormant | React 18, TypeScript, Vite, Tailwind, Zustand, PWA |

> **Login & sync status:** ✅ Live. `config.js` points at the real Supabase project, and migrations `0001`–`0004` have been run. Checked 2026-10-21: `profiles` answers, and `class_progress`, `class_notes` and `learner_state` correctly refuse logged-out visitors (`42501`). Progress follows the account to every device (`js/cloudSync.js`). **New: run `0005_warmup_sessions.sql`** so warm-up history reaches the account. Until then it stays on each device, and nothing breaks.

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
            ├─ js/warmup.js         Warmup: the common Warm-up's routines, unlock rule (Classes 1–9), emphasis, history (local + warmup_sessions)
            ├─ js/router.js         hash router, requiresAuth guard, render/mount/unmount lifecycle
            ├─ js/components.js     pure HTML-string components
            ├─ js/timer.js          practice timer (wall-clock based)
            ├─ js/audio/pianoSynth.js        NoteUtils + PianoSynth (Web Audio piano, no audio files)
            ├─ js/components/piano.js        PianoKey, VirtualPiano (reusable)
            ├─ js/components/exercises.js    ExerciseScore, PitchExercise engine, HigherLower / SameDifferent / NoteIdentification
            ├─ js/components/vocalRecording.js  VocalRecording + PitchAnalysis (placeholder seam, isAvailable: false)
            ├─ js/components/personalNotes.js   PersonalNotes
            ├─ js/components/classProgress.js   ClassProgress
            ├─ js/components/warmupPrompt.js    WarmupPrompt: "Prepare your voice" card (Class 11+), "warm up first?" before recordings, Classes-page entry
            ├─ js/audio/voiceRecorder.js     VoiceRecorder: shared mic/recording/level meter/save/playback engine
            ├─ js/audio/pitchAnalysis.js     PitchAnalysis: client-side YIN pitch ESTIMATE (honest, octave-aware)
            ├─ js/components/pitchMatch.js   ReferenceNotePlayer, SelfAssessment, PitchGuide, PitchComparison, PitchMatchExercise
            ├─ js/lessons/lessonKit.js       shared lesson header, stage tracker, chapters, assignment, loadAndRefresh
            ├─ js/lessons/meetYourVoice.js   interactive Class 1
            ├─ js/lessons/comfortableBreathing.js interactive Class 2
            ├─ js/lessons/understandingPitch.js interactive Class 3
            ├─ js/lessons/matchingANote.js   interactive Class 4
            ├─ js/components/listening.js    Waveform, WaveformPlayer, RecordingMarkers, RecordingCard, ListeningPasses, ObservationChecklist
            ├─ js/lessons/listeningToYourVoice.js interactive Class 5
            ├─ js/components/rhythm.js       RhythmSounds, MetronomeEngine, BeatIndicator, Metronome (+ tap tempo), TapPad, TimingAnalysis, TimingTimeline, TapExercise, RhythmPatternExercise, BeatGuide
            ├─ js/lessons/rhythmAndTiming.js interactive Class 6
            ├─ js/lessons/basicVocalWarmup.js interactive Class 7
            ├─ js/lessons/vocalRelaxation.js interactive Class 8
            ├─ js/lessons/firstProgressRecording.js interactive Class 10 (Level 1 milestone)
            ├─ js/lessons/breathPhraseControl.js interactive Class 11 (L1C11; built as L2C01 and moved — see APP_DATA.LEGACY_CLASS_IDS)
            ├─ js/components/pitchStability.js PitchStability (held-note estimate in words), PitchVisualizer, StabilityPanel ("listen first, look second")
            ├─ js/lessons/pitchStability.js  interactive Class 12
            ├─ js/lessons/smoothNoteTransitions.js interactive Class 13
            ├─ js/lessons/basicVocalDynamics.js interactive Class 14
            ├─ js/lessons/dictionPronunciation.js interactive Class 15
            ├─ js/lessons/singingSimplePhrases.js interactive Class 16
            ├─ js/lessons/connectingPhrases.js interactive Class 17
            ├─ js/lessons/musicalPhrasing.js interactive Class 18
            ├─ js/lessons/melodicPatterns.js interactive Class 19
            ├─ js/lessons/basicVocalControl.js interactive Class 9
            ├─ js/lessons/registry.js        InteractiveLessons (class `interactive` key -> lesson)
            └─ js/pages/*.js        19 pages, each { render(params), mount(container) → cleanup } (incl. warmup.js: WarmupPage + WarmupSessionPage)
supabase/migrations/0001_profiles.sql          profiles table, signup trigger, RLS, public_profiles view, avatars bucket
supabase/migrations/0002_security_fixes.sql    role protection, public view fix, avatar limits
supabase/migrations/0003_class_progress.sql    class_progress + class_notes (owner-only RLS)
supabase/migrations/0004_learner_state.sql     learner_state (whole progress per user, versioned) + private recordings bucket
supabase/migrations/0005_warmup_sessions.sql   warmup_sessions (finished warm-ups; owner-only RLS)
```

**Progress on every device:**
- `Store` keeps a per-account local copy, so the site works offline.
- `js/cloudSync.js` pulls the account's `learner_state` on login and when the tab regains focus. It merges with `Store.mergeSyncStates`: unions for classes, practice sessions, journal and uploads; journal deletions are remembered; for single values the newer edit wins. It then uploads (debounced, versioned, retried on conflict) and flushes before logout.
- Recordings upload to `recordings/<uid>/<mediaId>`, and `Media.getUrl` downloads them on other devices.

Interactive lessons: a class with `interactive: "<key>"` in `data.js` is rendered by `InteractiveLessons[key]` instead of the standard class layout (see `js/pages/classDetail.js`). All of Level 1's real classes (1–19) use this (`js/lessons/registry.js`). The standard layout now only shows the `comingSoon` placeholder (Level 1's Class 20 and all of Levels 2–8). The components follow the same `render(id, opts)` + `wire(container, id, opts)` pattern as `Timer`, so later classes reuse them instead of duplicating. They're vanilla JS rather than React because the site is buildless and deploys straight to GitHub Pages.

Design seams (all intentional):
- `Store` is the only persistence layer. `CloudSync` mirrors it to the account; pages never talk to the backend for progress.
- `Media` is the only place recording files are handled: IndexedDB on the device, plus the account's private bucket.
- `Auth` is the only backend client.
- `APP_DATA` is the only content source.

### Feature status

| Area | Status |
|---|---|
| Curriculum: 8 levels, 70 classes | ✅ Structure done (`js/data.js`). **Level 1 — Foundation has 20 classes**: 1–19 have real content and all 19 are interactive; Class 20 is a `comingSoon` placeholder with its title and goal. Breath & Phrase Control moved from Level 2 into Level 1 as Class 11, and Level 2 starts with "Vocal Placement" again. Levels 2–8 (50 classes) remain `comingSoon` — viewable, but can't be completed. Level 2 unlocks only when all 20 Level 1 classes are done. |
| Class page: lesson, timer, self-evaluation, upload + playback, reflection, complete | ✅ Working (local only) |
| **Class 1 — Meet Your Voice & Listening Foundation (interactive)** | ✅ Guided lesson (Welcome → Comfort → Listen → Your voice → Higher & lower → Speak vs sing → Starting point → Day 1 → Reflect → Complete), built on "Before learning to control your voice, learn to listen to it". There are no scores, no pass/fail, no "good"/"bad" voice and no technical terms:<br>• "Welcome. You can start exactly where you are.", and the first principle: "You are not here to prove that you can sing. You are here to discover how your voice works."<br>• **Voice comfort check** (Comfortable / A little tired / Dry / Strained / Not normal today). Strained or "not normal" shows "Don't force your voice today…" and a quiet "listening only is fine" reminder on every voice exercise. There is no diagnosis.<br>• Exercises: listen to the room for ~30 s (a breathing-circle countdown; stopping before ~15 s doesn't count) then "What did you notice?" · speaking voice ("Hello. My name is ___…", recorded, with a waveform) · a gentle hum guide · speak → hum (mmm / me / mmm tiles light in turn) · **higher/lower on the real Virtual Piano** (4 pairs, then reversed; First / Second / Not sure; the answer is revealed gently and never counted) · a glide demo on the voice-like `PianoSynth.tone` · a first pitch-matching preview on `PitchMatchExercise` (reference from "lower/higher sound feels easier"). There is no estimate, and every answer gets the same reply: "This is only your first attempt. We'll train this skill later." · listening back (counts only when played to the end) · speaking vs singing (two recordings + "What changed?").<br>• **My Starting Point**: experience, what to improve (multi-select) and how I feel about my voice. Saved privately in `class_progress` (not the public profile) and editable any time.<br>• **My Voice — Day 1**: speaking (≥ 8 s), humming (≥ 4 s) and one pitch attempt, saved as "Class 1 — Starting Voice Sample · …". It is labelled an informal reference, not the official baseline (Class 10).<br>• A 5-question reflection, an auto-ticking 6-part assignment + "What is one thing I discovered about my voice today?", My Notes, a 12-item progress tracker, and the "WELCOME TO YOUR SINGING JOURNEY" completion panel ("Level 1 — Foundation · Class 1 ✓") with the next class. |
| **Class 2 — Comfortable Breathing for Singing (interactive)** | ✅ Guided lesson (Understand → Notice → Exhale → Breath + sound → Phrase → Pitch → Awareness → Record → Evaluate → Practice → Complete), built on "Learn to breathe comfortably before trying to control the breath". It is **not** a lung-capacity workout: nothing measures, rewards or compares breath. There are no countdown numbers, no "longest/best breath", no capacity meter and no leaderboard (checked in the test: no cue contains a digit):<br>• "Comfortable breath → comfortable voice", and a prominent "Never force a breathing exercise" with the "you do not need to" list. Dizziness, light-headedness, unusual breathlessness, chest discomfort or feeling faint → stop, breathe normally, rest, and don't repeat it "to build tolerance". This reminder repeats under every guided exercise.<br>• **Breathing guides:** a soft orb (the Class 7 breathing-circle style) moves through in / out / sound / rest phases with calm word cues. It can be stopped at any moment ("Stopped. Breathe normally and rest."), and a stopped guide doesn't count. Exercise 1 ("observe, don't change anything") deliberately has **no** pacing animation.<br>• Twelve exercises: observe breathing · natural inhale · gentle "sss" ("No, not comfortable" → stop message) · breath + hum ("uncomfortable" → skip the repeat) · breath + speech · "I can sing." (breath → sing → stop → normal breathing tiles) · breath + pitch on the Class 4 `PitchMatchExercise` (note from the Virtual Piano or Class 1's choice; no estimate) · breath and rest (BREATH ↓ SING ↓ REST ↓ NORMAL BREATH) · where did you notice tension? (no forcing to relax) · shoulder awareness (no "shoulders must never move") · breath before "Learning to sing" ("No" → make the phrase shorter, never a bigger breath) · record breath + hum + phrase, play it to the end, then three ear-only questions (no breath-noise analysis).<br>• "What breath support is NOT", linking forward to Classes 7, 9, 10 and 11. A 5-row self-evaluation on `ControlCheck` with per-row answer sets. A practice timer logging only date and duration as "Breathing Awareness" (the `breath` task, as Class 11).<br>• An 8-part auto-ticking assignment + 6 reflection questions, My Notes, a 12-item progress tracker, and the "BREATH BECOMES PART OF THE MUSIC" completion panel ("Level 1 — Foundation · Class 2 ✓", next Class 3). |
| **Class 3 — Understanding Pitch (interactive)** | ✅ Guided lesson (Understand → Listen → Play → Identify → Sing → Reflect → Complete). Includes a virtual piano (mouse, touch, keyboard), Learn With Piano, three ear-training exercises with scoring, Sing the Note (record and play back, labelled "Self Evaluation"), private notes, reflection, assignment, and an 8-item progress tracker. Completion requires all 8 items. Saves per user to Supabase once `0003` is run; until then, on the device. |
| **Class 4 — Matching a Note (interactive)** | ✅ Guided lesson (Understand → Hear → Sing → Adjust → Match → Practice → Reflect → Complete):<br>• The Listen → Remember → Sing → Compare → Adjust loop and a prominent "Choose comfort over range" rule.<br>• A reference note picked on the reused `VirtualPiano`, in a configurable range (Middle C4–C5 by default, or Lower C3–C4).<br>• Five exercises: Listen and Sing, Try Again and Adjust (3 attempts), Slide Into the Note, Blind Matching (3 hidden notes), and Note Chain (C–D–E; wider steps configurable but locked).<br>• Flat and sharp, with audio demos.<br>• An optional **pitch estimate**, offered only after you've judged a take yourself, and never a score.<br>• A practice timer logging "Pitch Training" with the class ID, an 8-question self-assessment, My Notes, a 10-item assignment with final reflection, a 10-item progress tracker with recording and self-evaluation counts, and a completion panel with the Class 5 bridge. |
| **Class 5 — Listening to Your Own Voice (interactive)** | ✅ Guided lesson (Understand → Record → Listen → Observe → Mark → Compare → Practice → Reflect → Complete), built on "Observation before correction":<br>• A listening warm-up on six short examples (piano and a voice-like synth tone, clearly labelled not a real singer). Multi-select "What did you notice?" with "Good observation." and no score.<br>• A body-awareness check, then a 20–30 s baseline recording: honest, no effects.<br>• Three guided listens: just listen → only pitch → words, breath and smoothness. Each unlocks after the last; Listen 1 completes when playback reaches the end.<br>• A self-listening checklist: pitch, words, breath, volume, smoothness, tone, tension. These are observations, not diagnoses.<br>• A **waveform player** (loudness, explicitly *not* pitch) with play, pause, tap/drag/keyboard seek, replay and **replay a section**.<br>• **Timestamped markers** saved per recording, with private notes per recording.<br>• Reference vs your voice, on Class 4's engine and reference note, with no estimate and the learner deciding which was closer.<br>• Speaking vs singing, with notes.<br>• A practice timer logging "Listening / Vocal Awareness" (under the Ear Training task).<br>• An assignment: a 30–60 s song, three listens, three or more marked observations, five questions and **choose ONE thing**.<br>• A 4-question reflection, My Notes, an 11-item progress tracker, and a completion panel with your ONE thing and the Class 6 bridge. |
| **Class 6 — Rhythm & Timing (interactive)** | ✅ Guided lesson (Understand → Hear → Feel → Count → Tap → Sing → Speak → Tempo → Practice → Reflect → Complete), built on "Don't rush. Don't chase the beat.":<br>• Beat, rhythm, tempo and timing explained with everyday examples and audio demos.<br>• A **metronome** as the centrepiece: Web Audio scheduled clicks, 60–120 BPM, presets, tap tempo, volume, accent on beat 1, and big beat lights so it never relies on sound alone.<br>• Exercises: Feel the beat (60 BPM) · Tap the pulse (hidden lights, timeline reveal) · Counting (with optional recording) · Clap the beat (1 2 3 4, 1 & 2 & …) · Rhythm patterns (A/B/C, then 8-beat D/E) · Sing with the beat (one comfortable note chosen on the Class 3 piano; 🎵 ○ 🎵 ○ / 🎵 🎵 ○ 🎵) · Speaking rhythm (tap → speak → sing "I am learning to sing") · an optional original song ("Step by Step").<br>• Tempo change (60 → 80) with a rushing check, and Rhythm vs pitch demos.<br>• A practice timer logging "Rhythm & Timing", a 5-part assignment with 7 questions, a 6-question self-reflection, My Notes, a **Rhythm Awareness** guide (Beginner / Developing / Comfortable, labelled not a professional rating), a 12-item progress tracker, and a completion panel with the Class 7 bridge.<br>• Every timing result is labelled a **basic timing estimate**. |
| **Class 7 — Basic Vocal Warm-Up (interactive)** | ✅ Guided lesson (Prepare → Breathe → Hum → Glide → Vowels → Pattern → Articulate → Cool-Down → Practice → Reflect → Complete), built on "A warm-up is preparation — not a workout.":<br>• The "should feel / should not feel" rule box and a pain/discomfort stop-notice, matching Class 9's tone.<br>• A non-scored breathing-awareness moment (a gentle pulsing circle, pure CSS) with an "I noticed" acknowledgement — deliberately not a recording or a score.<br>• Short-vs-standard routine choice (vowels and articulation marked optional, never locked, for the short routine).<br>• Exercises on the Class 4 `PitchMatchExercise` engine: a gentle pitch glide and a 1–2–3–4–5–4–3–2–1 five-note pattern (both Smooth/Mostly smooth/Difficult self-assessed, no pitch-accuracy scoring), and AH/EE/OO on one note.<br>• Humming/lip-trill choice and articulation (Ma-Me-Mi-Mo or La-Le-Li-Lo) on the Class 6 `BeatGuide`, plus a cool-down with a More/Same/Less-comfortable check that shows a "stop and rest" notice on "Less comfortable".<br>• Previous/Next links between exercises, reusing `LessonKit`'s existing stage-jump handling — no new navigation system.<br>• A practice timer logging "Vocal Warm-Up", a one-take guided assignment covering all five parts, a 6-question reflection, My Notes, a 10-item progress tracker, and a completion panel with the Class 8 bridge.<br>• No new shared systems besides the breathing circle — everything else reuses `VirtualPiano`, `PitchMatchExercise`, `RecordingCard`, `BeatGuide`, `PersonalNotes`, `ClassProgress`, `ClassActivity`. |
| **Class 8 — Vocal Relaxation (interactive)** | ✅ Guided lesson (Intro → Body Check → Release → Hum → Vowels → Before/After → Tension Check → Posture → Compare → Practice → Reflect → Complete), built on "Relaxation is awareness, not force":<br>• A before-singing body check and a post-exercise tension map (Face/Jaw/Tongue/Neck/Shoulders/Chest/Throat), both on `ControlCheck` — now generalized to take an optional custom `levels` param instead of only Class 9's own scale, so this reuses the exact same chip-row component with its own wording (Comfortable/Slight/Noticeable/Not sure, and a 🙂/😐/😣/Not sure variant) rather than a near-duplicate.<br>• Shoulder, jaw and tongue awareness as simple "read it, do it, notice" steps — nothing scored, nothing recorded, matching the spec's "awareness only."<br>• Gentle humming (the same framing as Class 7's) and relaxed vowels (AH→EE→OO, then reversed) on the Class 4 `PitchMatchExercise` engine, assessed or just observed per the spec.<br>• A before/after comparison: sing a note, do the release routine, sing it again, then self-assess (More comfortable / Less effort / Same / Not sure / More uncomfortable) — explicitly not framed as the second take being "better."<br>• A short 3-note pattern sung straight through without stopping mid-phrase, then an `ObservationChecklist` ("what did you notice?") — sing → finish → reflect, as specified.<br>• A posture-vs-relaxation callout, a spoken/sung "I am learning to sing" phrase pair, and Class 9's `RecordingComparison` reused as-is for free-form before/after listening (its existing "Less tension" option already fit).<br>• A practice timer logging "Vocal Relaxation", an assignment built directly on the before/after takes (no redundant third recording), a 5-question reflection, My Notes, an 11-item progress tracker, and a completion panel ending on "I don't need to force my voice to sing" and the Class 9 bridge. |
| **Class 9 — Basic Vocal Control (interactive)** | ✅ Guided lesson (Understand → Stabilize → Start → Control → Change → Transition → Combine → Compare → Practice → Reflect → Complete), built on "Control does not mean force":<br>• Eight exercises on the Class 4 `PitchMatchExercise` engine (steady note, start/stop, soft/comfortable volume, crescendo-decrescendo, two- and three-note transitions) plus the Class 6 `BeatGuide` for controlled note length and a combined pitch+rhythm+control phrase.<br>• A loudness estimate (RMS from the mic) compared across takes, and a volume-envelope guide the learner's own loudness curve overlays onto.<br>• A recording comparison tool ("what changed?") across any two takes from the class.<br>• A practice timer logging "Vocal Control", a 5-part guided assignment, a vocal-control self-check (Comfortable / Developing / Needs more practice per area), a 6-question reflection, My Notes, a 12-item progress tracker, and a completion panel with the Level 2 bridge. |
| **Class 10 — First Progress Recording (interactive, MILESTONE)** | ✅ Guided lesson (Intro → Rules → Ready → Speaking → Note → Pattern → Rhythm → Song → Library → Evaluate → Reflect → Focus → Milestone), built on "Record where you are now":<br>• Explicitly not an audition — a prominent "not supposed to be perfect" callout, and a "please don't" list (retake endlessly, heavy editing, Auto-Tune, pitch correction, EQ/compression, reverb, noise removal that changes the voice, cherry-picking takes).<br>• Baseline recording rules (environment, equipment, distance, processing, voice, health) and a 6-item pre-recording checklist before anything is recorded.<br>• Five standardized parts, each reusing an existing engine: speaking (`RecordingCard`), a reference note chosen on the Class 3 `VirtualPiano` (`PitchMatchExercise`), a 1-2-3-2-1 pattern (`PitchMatchExercise` chain mode), a rhythm exercise on the **full Class 6 `Metronome` widget** (not just `BeatGuide` — the spec asked for the metronome itself) + `RecordingCard`, and a 30-60 s song excerpt with an optional song-title field.<br>• "My Singing Journey" — a simple chronological list of this session's five recordings (play, duration, date), explicitly not comparing against a nonexistent earlier baseline.<br>• Self-evaluation across six categories (Pitch/Rhythm/Voice/Words/Transitions/Overall) on independent `SelfAssessment` instances, each with its own option set from the spec — no synthesized score.<br>• "What I Notice" (5-question private reflection) and a single-select "My current focus" (pick ONE of 9 areas).<br>• **Baseline protection:** once every part, the self-evaluation, the reflection and the focus are all complete, the five recordings become the account's baseline (`ClassActivity` answers, synced via `class_progress` — no new table, per the spec's "don't duplicate an existing table" instruction). Re-recording any of the five parts after that shows a native confirm — "This is your progress baseline. Are you sure you want to replace it?" — via a new, backward-compatible `onBeforeRecord` hook added to both `RecordingCard` and `PitchMatchExercise` (undefined for every other call site, so Classes 4-9 are unaffected; regression-checked).<br>• A distinct **"🎤 Baseline Recording Created"** moment when the gate is first met, and on class completion a special **"FIRST MILESTONE COMPLETE"** screen (not the standard per-class completion card) listing all 8 Level-1 achievements, "Your next goal isn't perfection. It's consistency.", and the Class 11 bridge. No AI judgement anywhere — no fabricated accuracy percentages, no "excellent"/"professional" language. |
| **Class 11 — Breath & Phrase Control (interactive, L1C11)** | ✅ Guided lesson (Intro → Breathe → Speaking → Phrase → Marking → Rhythm → Pitch → Compare → Evaluate → Practice → Reflect → Complete), built on "Comfortable breath → controlled phrase → natural release":<br>• A prominent "never train breath by forcing or holding it" rule, with an explicit "you do NOT need to" list and a dizziness/discomfort stop-notice — no timers, no countdowns, no breath-duration leaderboards anywhere in the lesson.<br>• Natural breath awareness (reuses Class 7's `.breathe-circle` CSS as-is) and a gentle controlled exhale, both unscored and un-recorded — awareness only, exactly as specified.<br>• A new **tap-to-place 💨 breath-marker phrase editor** (local to this file, not a new shared component — single- or multi-mark mode), reused three times: marking where you'd naturally breathe in a spoken phrase, a dedicated breath-marking exercise, and planning your own phrase in the assignment.<br>• Progressively longer phrases (short/medium/long, three `RecordingCard`s), breath + rhythm on the full Class 6 `Metronome`, and breath + pitch on a 1-2-3-2-1 pattern via the Class 4 `PitchMatchExercise` chain mode.<br>• "Same phrase, different breath" — natural vs. intentionally-larger-breath attempts, explicitly non-judgemental ("bigger breath is not automatically better"), and a baseline comparison against **Class 10's own song recording** (`ClassActivity.get("L1C10")`), with a graceful "complete Class 10 first" empty state if it's missing.<br>• Self-evaluation across six categories (Breath/Timing/Phrase/Ending/Control/Recovery) on the Class 8-generalized `ControlCheck`, with its own Comfortable/Developing/Needs attention/Not sure scale.<br>• A practice timer logging "Breath & Phrase Control", a plan-then-record assignment (type your own phrase, mark your planned breath points, record twice), a 6-question reflection, My Notes, a 12-item progress tracker, and a completion panel bridging to Class 12 "Pitch Stability".<br>• **Moved 2026-10-23:** built as Level 2 Class 1 (`L2C01`), now Level 1 Class 11 (`L1C11`). The lesson reads `cls.number`, so it now says "Class 11" everywhere. Existing learners' progress follows it automatically (see **M1–M3**). |
| **Class 12 — Pitch Stability (interactive)** | ✅ Guided lesson (Understand → Listen → Match → Hold → Ear first → Correct → Vowels → Breath → Move → Evaluate → Practice → Reflect → Complete), built on "Find the note — then stay with it" and "Stable does not mean perfectly flat":<br>• Pitch matching (Class 4) vs pitch stability. ⬆️ slightly sharp / ⬇️ slightly flat / ↕️ unstable, with an illustrated "REFERENCE ──── / YOUR VOICE ──╲╱──" picture and "Listen first. Look second."<br>• A "please don't" list: freeze the voice, squeeze, force, get louder, make vibrato, hold long, hold the breath. Plus a stop-if-it-hurts notice.<br>• A comfortable note chosen on the Class 3 `VirtualPiano`; every exercise and the 1-2-3-2-1 pattern transpose from it. Its default comes from Classes 10 and 4.<br>• Nine exercises, mostly on the Class 4 `PitchMatchExercise` engine: listen to a steady reference (a dot travels along a flat line) · match then stop · match then hold ~3–4 s (length is never a score) · listen without looking · listen and correct (Attempt 1/2) · AH / EE / OO · pitch + breath (the Class 7 breathing circle as a cue; "shorter note, not bigger breath") · three-note stability 1-2-3-2-1 with held notes · a short 1-2-3-2-1 tune with "which note felt least stable?" (1–5 / Not sure) and a practice tip for that note.<br>• **Estimated pitch, ear first:** a new `StabilityPanel` stays closed until the learner has answered by ear, then shows the Class 4 `PitchGuide` trace labelled as an estimate ("not a professional vocal score"). It describes the take in words: near / slightly higher / slightly lower, steady / mostly steady / some movement, and "drifted lower toward the end". There are no percentages. The trace is hidden, with a reason, for silence, very soft or short takes, background noise and wildly moving takes.<br>• Before/after: Attempt 1 vs Attempt 2 with Play buttons and "Did I hear a difference?" (never assumes Attempt 2 is better). Common beginner problems as expandable sections, linking back to Class 8 for tension.<br>• A 5-row self-evaluation on `ControlCheck`, now with per-row answer sets (Yes/Mostly/Not yet, Yes/Sometimes/Not yet, Yes/Mostly/No). Also: a practice timer logging "Pitch Stability" under the Pitch task, with short sessions encouraged and no reward for length.<br>• An assignment (Attempt 1 with a full listen-back, Attempt 2, a 1-2-3-2-1 recording, and 8 questions), a 3-question reflection, My Notes, a 14-item progress tracker, the "PITCH AWARENESS → PITCH STABILITY" milestone, and a completion panel bridging to Class 13 "Smooth Note Transitions". |
| **Class 13 — Smooth Note Transitions (interactive)** | ✅ Guided lesson (Understand → Setup → Hear → Transition → Clean Move → Ascend → Descend → Patterns → Rhythm → Breath → Listen → Evaluate → Practice → Reflect → Complete), built on "Smooth does not mean slow" and the MATCH → STABILIZE → MOVE → ARRIVE → STABILIZE progression from Class 12:<br>• 11 transition exercises, all on the Class 4 `PitchMatchExercise` chain engine (the Class 9 "transitionEx" shape): hear two notes and judge direction, match each note alone, a two-note transition up and down, a deliberately slow version, a visualised "start → move → arrive → stabilise" take, a 5-note ascending run, the same descending, a 3-note up/down movement, and a wider "skip a note" (1→3) up/down — small, nearby intervals throughout, no large jumps.<br>• Transition + rhythm on the Class 6 `BeatGuide` (one note per beat, then a rest) and transition + breath on the Class 7 breathing circle, reusing both exactly as earlier classes do.<br>• **"Listen and identify the problem" reuses the learner's own takes from this lesson** (a picker over this class's uploads) instead of fabricated example recordings — `PianoSynth` can't honestly simulate a real overshoot or sudden jump, and inventing misleading "example" audio would break the app's honesty rules, so classification (arrived too high/low, sudden jump, smooth, not sure) happens on real singing.<br>• The Class 12 `PitchVisualizer`/`StabilityPanel` reused as-is (not rebuilt) for the "clean movement" exercise's optional, ear-first estimated-pitch trace.<br>• A before/after pair (Exercise 3's take vs. a fresh attempt) with "did it feel different?", never assuming the second is better; five expandable common-problems sections (one linking back to Class 8 for tension).<br>• A 6-row self-evaluation on `ControlCheck`; a practice timer logging "Note Transitions"; a 3-attempt assignment (natural, focused, with metronome) on the same 1-2-3-2-1 shape Classes 10–12 use.<br>• **One deliberate simplification:** the spec's Assignment (§23) and a separate Reflection section would otherwise ask the identical 9 questions twice — Niswara keeps one textarea set, in Reflection, rather than duplicating the same questions back-to-back on the page. A 16-item progress tracker and a "FROM NOTE → TO NOTE" milestone (gold/teal card, same style as Class 12's) appear on completion. |
| **Class 14 — Basic Vocal Dynamics (interactive)** | ✅ Guided lesson (Understand → Setup → Hear → Levels → Gradual → Crescendo → +Pitch → +Transitions → +Rhythm → +Breath → +Melody → Listen → Evaluate → Practice → Reflect → Complete), built on "Stronger does not mean louder at any cost" and a soft/medium/stronger spectrum (never a 0–100 score):<br>• Twelve exercises combining dynamics with everything learned so far: the same note at three volumes and a pitch-stability version of it (Class 12), a gradual soft↔medium fade and a four-stage crescendo/decrescendo (p→mp→mf→f), dynamics + note transitions (Class 13, pitch rising/falling with volume), dynamics + rhythm (Class 6, a 4-beat soft/medium/stronger/soft pattern on the `BeatGuide`), dynamics + breath (Class 11, "I am learning to sing." at three volumes on one breath each), and a 1-2-3-2-1 melody sung constant vs. varied — explicitly framed as volume vs. expression, not "better."<br>• **`VolumeEnvelope` (Class 9's `vocalControl.js`) gained optional `"up"`/`"down"` ramp shapes** on top of its original soft→medium→soft hill, so Class 14's four gradual/crescendo/decrescendo exercises reuse the same guide-line-plus-loudness-overlay component instead of a new one; Class 9's own call site passes no shape and is unaffected (regression-checked). **`BeatGuide` (Class 6's `rhythm.js`) gained an optional per-token `velocity`**, likewise additive and backward compatible, so the rhythm+dynamics guide note can demonstrate soft/medium/stronger instead of a fixed loudness.<br>• "Listen and identify" (Exercise 12) is **honestly synthesized** — unlike Class 13's pitch-overshoot problem, loudness contour is exactly what `PianoSynth`'s `velocity` controls, so four short soft→stronger / strong→soft / constant / hill examples are generated and the learner classifies what they hear, with gentle "that matches" / "listen again" feedback (not a score of their singing).<br>• The Class 12 `StabilityPanel`/`PitchVisualizer` reused as-is for the pitch-stability exercise's optional estimate; `RecordingComparison` and `ControlCheck` (Class 9) reused as-is for a free-form recording comparison and the 6-row self-evaluation (Soft/Medium/Stronger/Pitch/Control/Comfort); a microphone-distance/don't-shout-into-the-mic note; five expandable common-problems sections (one linking back to Class 8 for tension, one to Class 12 for pitch).<br>• A practice timer logging "Vocal Dynamics"; a 6-recording assignment (medium/soft/stronger attempts, crescendo, decrescendo, a dynamic melody) with 7 reflection questions, following Class 13's precedent of one shared question set (no duplicate Assignment/Reflection text); a 16-item progress tracker; and a "YOUR VOICE HAS DYNAMICS" milestone (PITCH · RHYTHM · BREATH · TRANSITIONS · DYNAMICS) bridging to Class 15 "Diction & Pronunciation". |
| **Class 15 — Diction & Pronunciation (interactive)** | ✅ Guided lesson (Understand → Speak → Vowels → Consonants → Words → Combine → Listen → My lyric → Evaluate → Practice → Complete), built on "Sing the words clearly without losing the music" and **"Clear does not mean exaggerated"**. Its "please don't" list covers over-opening, punched consonants, accent "correction", forced vowels, dramatic speech, and trading breath or pitch for diction. Plus the stop-if-pain notice.<br>• **Lyric highlighting** reuses the Class 6 `BeatGuide`: the current word or syllable lights on each beat with metronome clicks. Phrases are padded to 4-beat bars, and long words wrap/hyphenate on phones.<br>• Fourteen exercises:<br>  – Speak "I want to sing" three ways (3 recordings + "which words were easiest to hear?").<br>  – AH/EH/EE/OH/OO with a sustain guide (accent-neutral wording).<br>  – Vowel + pitch: 5 takes on `PitchMatchExercise` + "equally stable?", then the Class 12 `StabilityPanel` traces, opened only after answering.<br>  – Consonants: MA–MU / TA–TU / KA–KU spoken. Syllables: MA–MU / NA–NU sung.<br>  – Word endings (Love/Time/Light/Dream/Song; record and play to the end).<br>  – Speak → rhythm → one note → simple melody.<br>  – Lyric clarity: record, listen, "which word was least clear?" (Word 1–5 / Not sure), then a second attempt focused on that word.<br>  – Don't eat the words (a natural contraction is a choice; losing words unintentionally is the problem).<br>  – "Ma-ry sings to-day" on 1-2-3-2-1 (guide + chain recording + trace).<br>  – Diction + breath ("breath mid-word?" → shorten the phrase, never hold it).<br>  – Diction + dynamics (medium/soft/slightly stronger + the Class 9 loudness estimate).<br>  – A listening test with the learner's **own** Version A (clear words) and Version B (good pitch), + a "balance" explanation.<br>  – A **personal lyric**: typed by the learner, ≤ 80 characters, saved only in their private `class_progress`, never analysed. The rhythm guide is built from its words, with Speak / Rhythm / Sing recordings.<br>• "Your accent is not a mistake", common beginner problems (expandable), a 6-row self-evaluation on `ControlCheck`, and a practice timer ("Diction & Pronunciation", `song` task, short practice encouraged).<br>• An assignment (own phrase + 4 attempts, each played back to the end, + 8 questions), a 3-question reflection, My Notes, a 17-item progress tracker, the "MAKE THE WORDS SING" milestone (WORDS + RHYTHM + PITCH + BREATH + DYNAMICS = MUSICAL COMMUNICATION), and a completion panel naming the next class from the data. |
| **Class 16 — Singing Simple Phrases (interactive)** | ✅ Guided lesson (Understand → Speak → Rhythm → Melody → Hum → Vowel → Words → Breath → Structure → Phrase → Combine → Listen → Evaluate → Practice → Complete), the first major integration point — pitch + rhythm + breath + transitions + dynamics + diction + listening, all at once, built on **"Don't try to fix everything at once"** (one main focus per attempt):<br>• A short beginner phrase ("I love to sing") built up in layers: spoken three ways · its rhythm found with the **full Class 6 `Metronome` widget** (not just `BeatGuide`, matching Classes 10/11's precedent) · its 4-note melody (1→2→3→2, one note per word — deliberately 4 notes rather than the spec's illustrative 5, so every word lines up with exactly one note) learned by ear only, no recording · hummed on "mmm" ("which note felt least stable?") · sung on one vowel "AH" (`PitchMatchExercise` chain, connecting Classes 12/13, + an optional `StabilityPanel` estimate) · the words added in four steps (speak → rhythm → sing slowly → sing at tempo, `BeatGuide`-guided) · a breath point chosen with a **single-mark copy of Class 11's tap-to-place 💨 phrase editor** (that original stays local to `breathPhraseControl.js`, not a shared component, so this is its own small local copy, not a duplicate system).<br>• Beginning / middle / ending practised one at a time (only the beginning is recorded separately — middle and ending are reflective questions about the same take, matching the spec's own wording, which only says "record" for the beginning), then the complete phrase, then an **"Exercise 12" one-skill-at-a-time review** — a 7-lens `ControlCheck` grid (Pitch/Rhythm/Breath/Diction/Transitions/Dynamics/Comfort) on Good/Needs attention/Not sure, never a percentage.<br>• Dynamics (Class 14: constant vs. rising vs. falling, "don't force expression — keep it subtle"), a diction focus on the phrase's most-often-lost word ("sing"), a basic emotional-meaning choice (Happy/Calm/Sad/Hopeful/Energetic/Affectionate/Other) before singing with that meaning in mind, and a recording comparison (Exercise 11's neutral take vs. Exercise 15's expressive one) with "which felt more connected?" + an 8-option "what changed?" checklist.<br>• **Followed the spec's own 20-item Class Progress list literally** rather than inventing extra items: only 3 of Exercise 12's 7 review lenses (Pitch/Rhythm/Diction) get their own tracked checkpoint, and Exercise 14 ("diction focus") has none at all — its recordings still save normally. The spec also lists no separate Reflection section for this class, so the assignment's 10 questions live directly in the Assignment chapter (no Class 13-style duplicate-questions risk).<br>• Six expandable common-problems sections (one linking back to Class 15), an 8-row self-evaluation on `ControlCheck`, a practice timer logging "Simple Phrases", a 6-attempt assignment (hum → one vowel → lyrics → lyrics+rhythm → +dynamics → final performance) with 10 questions, a 20-item progress tracker, and the "FROM EXERCISES TO MUSIC" milestone (PITCH+RHYTHM+BREATH+DICTION+TRANSITIONS+DYNAMICS+EXPRESSION = A MUSICAL PHRASE) bridging to Class 17 "Connecting Phrases". |
| **Class 17 — Connecting Phrases (interactive)** | ✅ Guided lesson (Understand → Identify → Speak → Rhythm → Hum → Breath → Structure → Combine → Connect → Extend → Listen → Evaluate → Practice → Complete), the second integration point — PHRASE 1 → BREATH/TRANSITION → PHRASE 2, built directly on Class 16 (one phrase) and on **"Don't rush from one phrase into the next"** (finish → recover → prepare → begin):<br>• Two working phrases, one word per note like Class 16: "I want to sing today" (5 notes, degrees 1-2-3-4-3) and "and enjoy the sound" (4 notes, degrees 3-2-1-2) — **deliberately designed so Phrase 2 starts on the exact same note Phrase 1 ends on**, giving Exercise 9 ("connecting pitch") an objectively correct, demonstrable answer rather than an arbitrary one.<br>• A tap-to-identify phrase-boundary exercise over the combined 9-word line; speaking, then humming, both phrases with a breath between them; the **full Class 6 `Metronome` widget** for "rhythm before melody" (matching Classes 10/11/16's precedent); phrase ending and phrase beginning practised separately before combining; then five "connecting" exercises — pitch (`PitchMatchExercise` chain across both phrases + `StabilityPanel`), rhythm, diction (Class 15, the last word of Phrase 1 and first word of Phrase 2), dynamics (Class 14, explicitly "not a loudness exercise"), and a two-phrase expression exercise using the spec's own separate example pair ("I remember" / "something beautiful", sung freely with no reference melody).<br>• An optional three-phrase extension (`PitchMatchExercise` chain across all three phrases, Phrase 3 continuing from Phrase 2's ending toward the tonic — "the third phrase can feel like a destination").<br>• A **Version A / Version B listening-analysis exercise, honestly synthesized**: Version B plays the two phrases with a short natural gap and the designed same-note relationship; Version A plays the same two phrases with a long gap and the second phrase shifted to an unrelated note — gap length and starting note are exactly what the spec asks the learner to notice, and both are something `PianoSynth` can demonstrate truthfully (unlike a vocal flaw), with an explanatory reveal afterward.<br>• A recording-review exercise that deliberately asks for **one** area to improve (a single-select over the 7 areas), not a multi-row grid — matching the spec's explicit "don't judge everything at once; choose ONE main issue."<br>• Six expandable common-problems sections, a 7-row self-evaluation on `ControlCheck`, a practice timer logging "Phrase Connection", a 6-attempt assignment (hum both → one vowel → lyrics → breathing focus → smooth connection → final performance) with 8 questions, a 19-item progress tracker, and the "CONNECTING MUSICAL THOUGHTS" milestone (PHRASE 1 → BREATH → PHRASE 2 → CONTINUITY, then PHRASE 1 + PHRASE 2 + PHRASE 3 = MUSICAL FLOW) bridging to Class 18 "Musical Phrasing & Line Shape". No shared components were changed for this class — everything reuses Classes 3/4/5/6/9/12/14/15's existing engines as-is. |
| **Class 18 — Musical Phrasing & Line Shape (interactive)** | ✅ Guided lesson (Understand → Shape → Hum → Vowel → Peak → Compare → Dynamics → Release → Breath → Words → Timing → Full Shape → Review → Evaluate → Practice → Complete), built on **"Don't just sing the notes. Give the phrase a direction"** and **"Musical shape does not mean singing louder all the time"** — singing as BEGINNING → DEVELOPMENT → DIRECTION → DESTINATION, not NOTE → NOTE → NOTE → NOTE:<br>• One 5-note working melody (degrees 0-1-3-2-0: begin low, rise, **peak** at the middle note, release, finish on the tonic) carries most of the class — deliberately shaped so the peak is objectively identifiable, reused for the one-vowel exercise, "find the peak," the main three-part shape exercise, and the visual phrase shaper. Exercise 1 gets its own short 4-note "destination" melody and Exercise 2 its own two illustrative contours (the spec's literal "LOW → HIGH → HIGHER → HIGH → LOW" / "HIGH → LOW → LOW → HIGH" examples, drawn as small bar-height contour views) — neither is the main phrase.<br>• Exercise 11's lyric ("I've been waiting for you," 5 words) maps one word to each of the main melody's 5 notes, so "waiting" naturally lands on the peak.<br>• **Two honestly-synthesized A/B comparisons** (`PianoSynth`): flat (uniform velocity) vs. shaped (velocity rising toward the peak) for "which feels more musical?", and strictly mechanical vs. a gentle velocity-only lean toward the peak (same underlying pulse — gap unchanged) for the timing exercise, consistent with how Class 17's listening-analysis A/B was built.<br>• Exercise 15 ("Visual Phrase Shaper") asks for a **draggable** visual; this buildless codebase instead gives each of the melody's 5 notes a **tap-to-cycle role button** (Start/Build/Peak/Release/Finish) — the same "select, don't drag" interaction language Classes 11/16/17 already use for their breath/boundary markers, flagged here as a deliberate interpretation rather than a new drag-and-drop system.<br>• Dynamics as shape (Class 14, "movement → destination → release," not "quiet → loud → louder"), phrase release, breath connected to shape (Class 17), word emphasis (Class 15) and a phrase-with-meaning exercise (neutral vs. intentional, like Class 17's expression exercise), a 4-take recording-practice comparison, and a **one-focus-improvement** exercise that's explicitly single-select (not a multi-row grid) — matching the spec's own "don't try to fix everything simultaneously; choose one."<br>• Six expandable common-problems sections, an 8-row self-evaluation on `ControlCheck`, a practice timer logging "Musical Phrasing," a 6-take assignment (natural → identify peak → toward the peak → dynamics → meaning → final performance) with 9 questions, a 20-item progress tracker, and the "GIVE THE PHRASE A DIRECTION" milestone (BEGIN → BUILD → PEAK → RELEASE → FINISH) bridging to Class 19 "Melodic Patterns & Vocal Consistency". No shared components were changed for this class. |
| **Class 19 — Melodic Patterns & Vocal Consistency (interactive)** | ✅ Guided lesson (Understand → Recognize → Patterns → Pitch → Rhythm → Vowel → Words → Memory → Transpose → Connect → Habit → Compare → Expand → Evaluate → Practice → Complete), built on **"Being able to sing something once is useful. Being able to repeat it consistently is a skill"** and **"Consistency comes before complexity"** — very short, comfortable patterns throughout, never a harder scale just to raise difficulty:<br>• A two-note pair, three short 3-note patterns (1→2→3, 3→2→1, 1→3→2) and a 5-note pattern-into-phrase (1→2→3→2→1) — all one whole step apart, well within a comfortable range.<br>• **Exercise 5 ("Pitch consistency") is an honest, non-fake metric**: three single-note takes are each run through the existing Class 12 `PitchStability.assess()` against the same reference note, and the *spread* between their already-honest `cents` values is bucketed into More consistent / Some variation / Significant variation / Not enough data — reusing the proven engine's own thresholds rather than inventing a new scoring system. A full multi-note contour-similarity comparison across three takes was deliberately scoped out as a meaningfully larger, less honest feature (see Change log).<br>• **`PianoSynth.playSequence` gained an optional per-note `duration`** (additive, backward compatible — no existing caller sets it) so Exercise 7's "same notes, different rhythm" demo can honestly play equal-timing vs. long→short→short versions of the identical three notes.<br>• Pattern memory (play once, hidden, then reveal), transposition ("same shape, different starting pitch" — the concept taught without naming music theory), vowel consistency (AH/EE/OO on the Class 4 `PitchMatchExercise` chain engine, 3 slots on one shared reference, connecting Class 15), consistency connected to phrase shape (Class 18) and dynamics (Class 14, "consistency does not mean becoming robotic"), a listen-before-correcting practice habit (perform → listen → identify → adjust → repeat), a three-take challenge with 5 separate honest comparison questions and an explicit "do not automatically select the best take," and a tone-awareness `ObservationChecklist` (sudden changes, breathy beginnings, pressed sounds, etc. — never labelled good or bad).<br>• Six expandable common-problems sections, a 7-row self-evaluation on `ControlCheck`, a practice timer logging "Melodic Patterns," a 6-take assignment (listen & sing → repeat → listen to both → identify one difference → correct only that → natural) with 9 questions, a **19-item progress tracker** (one fewer than the usual 20 — Exercise 7's A/B demo has no checkpoint of its own, following the spec's own literal Class Progress list), and the "CONSISTENCY IS CONTROL" milestone (HEAR → SING → LISTEN → IDENTIFY → ADJUST → REPEAT) bridging to Class 20 "Melodic Movement & Controlled Range". |
| **🎤 Warm-up (COMMON section, not a class)** | ✅ A `#/warmup` dashboard plus a guided `#/warmup/:mode` "vocal studio": a dark stage, a central microphone, a circular progress ring, a step timer, big Skip/Next controls and a pause overlay.<br>• **Not numbered and never in the class list.** It appears as a "Common" entry on the Classes page, a gold "🎤 Warm-up" link in the desktop nav, a "Common" group in the menu, and a bottom-bar tab on phones.<br>• **Locked until Classes 1–9 are all completed** (`Warmup.status()`). The dashboard and every session URL show "Warm-up Locked · X / 9 classes completed · Continue Classes / View Classes", so it can't be bypassed.<br>• **Three routines:**<br>  – **Quick**, ~5 min, 7 steps.<br>  – **Full**, ~10–12 min, 10 steps: Arrive & Listen → Relaxation → Breath → Gentle sound → Pitch connection → Self-listening → Rhythm → Vocal control → Mini phrase → Ready to Sing?<br>  – **Performance**, ~3–5 min: Relax → Breath → Hum → Reference pitch → Pattern → Phrase → Ready.<br>  Step times are suggestions. Nothing moves on by itself, and every step (and each sound exercise) can be skipped.<br>• **Every step shows its foundation** ("From Class 2", "From Classes 3–4", …) with a **Review Class** link. It opens in a new tab so the routine isn't lost.<br>• **Reused components:**<br>  – `VirtualPiano`: a 3-key range from the learner's own comfortable note (the Class 4/7 choice, as in Class 10).<br>  – `BeatGuide` on the Class 6 metronome engine: a count, then "mmm", plus the phrase guide.<br>  – `VoiceRecorder` for self-listening. The take is **played back, then discarded; it's never saved or uploaded**.<br>  – The Class 2 breathing orb (no digits, no holds, stoppable) and the Class 1 tile highlight.<br>• **Adaptive, but the learner decides.** An optional "Today's emphasis" (pitch / rhythm / note transitions / breath) gives that step 30 s more and its own version: 3 pitch notes, a third rhythm pass, a slow glide demo, or more breath cycles. It's suggested from the learner's own Class 10 focus and can be changed or turned off. There's no voice diagnosis and no score.<br>• **Readiness check:** Yes / Mostly / No on 6 questions (3 in Performance). Mostly yes → "You're ready to begin." Two or more No → "Take another moment. You don't need to force today's session."<br>• **"Your Warm-up Journey":** totals by type, the most practiced and most skipped step, and recent sessions. No streaks.<br>  – Saved locally first, then to `warmup_sessions`: type, times, duration, step keys and emphasis.<br>  – Finishing also logs the minutes under the practice log's "Warm-up" task.<br>• **Where it connects:**<br>  – **Class 10's intro** says "You've completed the first nine foundation classes", with [Start Warm-up] / [Continue to Recording].<br>  – **Class 10's pre-recording check and Progress → Before/After** ask "Would you like to warm up first?", then **return to the recording automatically**.<br>  – **Classes 11 and later** show a skippable "🎤 Prepare your voice" card. It's one component, added through `LessonKit.header`.<br>  – Recording never waits for a warm-up.<br>• **Comfort notice and class links.** A permanent comfort notice ("not medical advice") appears on both screens. "It does not replace your classes" links each difficulty to its class. |
| Practice: daily checklist + timer | ✅ Working (local only) |
| Journal, Projects, Progress, Achievements, Before/After | ✅ Working (local only) |
| Share-a-class post generator | ✅ Working |
| Auth: sign up / log in / log out / forgot + reset password | ✅ Built and hardened. Connected to the real project. ⚠️ Migrations not run yet |
| Profile: details, privacy toggles, avatar upload | ✅ Built (needs Supabase) |
| Protected `/dashboard` | ✅ Built. Shows Supabase profile plus that account's local progress |

### Full curriculum (`js/data.js` → `APP_DATA.LEVELS` / `APP_DATA.CLASSES`)

The canonical source is `js/data.js`; this table exists so the class list can be checked without opening it. Realigned to the canonical curriculum list on 2026-10-22 (Level 2's titles changed from 6 generic placeholders to the real 10; Levels 3, 4, 6, 7 picked up classes they were missing — see [Change log](#6-change-log)). 60 classes total.

| Level | Role | Classes | Status |
|---|---|---|---|
| **1 — Foundation** | Beginner | 1 Meet Your Voice 🟢 · 2 Comfortable Breathing for Singing 🟢 · 3 Understanding Pitch 🟢 · 4 Matching a Note 🟢 · 5 Listening to Your Own Voice 🟢 · 6 Rhythm & Timing 🟢 · 7 Basic Vocal Warm-Up 🟢 · 8 Vocal Relaxation 🟢 · 9 Basic Vocal Control 🟢 · 10 First Progress Recording 🟢 · 11 Breath & Phrase Control 🟢 · 12 Pitch Stability 🟢 · 13 Smooth Note Transitions 🟢 · 14 Basic Vocal Dynamics 🟢 · 15 Diction & Pronunciation 🟢 · 16 Singing Simple Phrases 🟢 · 17 Connecting Phrases 🟢 · 18 Musical Phrasing & Line Shape 🟢 · 19 Melodic Patterns & Vocal Consistency 🟢 · 20 Melodic Movement & Controlled Range | 19 of 20 real, all interactive 🟢. Class 20 `comingSoon` |
| **2 — Singer** | Vocalist | 1 Vocal Placement · 2 Resonance · 3 Chest Voice · 4 Head Voice · 5 Mixed Voice · 6 Vocal Range · 7 Dynamics · 8 Expression · 9 Phrasing · 10 First Performance Assessment | All 10 `comingSoon` (Breath & Phrase Control moved to Level 1 on 2026-10-23) |
| **3 — Musician** | Theory & Keys | Music Theory Basics · Keyboard Fundamentals · Scales · Intervals · Chords · Harmony · Rhythm for Musicians · Melody Writing | `comingSoon` (8) |
| **4 — Recording Artist** | Studio Craft | Microphone Technique · Recording Fundamentals · Editing Basics · Comping Takes · Pitch Correction · Vocal Production | `comingSoon` (6) |
| **5 — Producer** | Songcraft | Songwriting Fundamentals · Arrangement Basics · Instrumentation Choices · Sound Selection · Production Workflow | `comingSoon` (5) |
| **6 — Mixing Engineer** | Mix Craft | EQ Fundamentals · Compression Basics · De-essing · Saturation · Reverb & Space · Delay · Automation · Bus Processing · Stereo Imaging | `comingSoon` (9) |
| **7 — Mastering Engineer** | Final Polish | Dynamics · Loudness · True Peak · Limiting · Stereo Processing · Reference Tracks · Streaming Preparation | `comingSoon` (7) |
| **8 — Professional Artist** | Release & Identity | Completing Full Songs · Building a Portfolio · Release Preparation · Live Performance · Artist Identity | `comingSoon` (5) |

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
| B10 | 🟡 Low | The desktop nav didn't fit between 1024 and ~1150 px. Links ran 69 px past the screen edge at 1024, and "Continue Learning" / "Log In" wrapped. | ✅ The full link bar now starts at 1280 px, with the menu button below that. About shows inline from 1536 px (it's also in the footer). No overflow at 1024, 1100, 1280 or 1440 px. |

### Class 1 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| K1 | — | Class 1 makes no automatic judgement at all: no pitch estimate on the preview, no score on higher/lower (each answer is revealed, never counted), and no analysis of the Day 1 sample. That's per the brief ("Do not generate fake AI vocal scores"). | Intended |
| K2 | 🟢 Fixed | Class 1's completion panel named the next class "Breathing & Breath Awareness" instead of your "Class 2 — Comfortable Breathing for Singing". | ✅ Class 2 upgraded and renamed (2026-10-26); the panel reads the title from the data, so it now says "Comfortable Breathing for Singing" |
| K3 | — | Learners who already completed Class 1 under the old standard layout keep their completion and see the "Welcome to your singing journey" panel. Their old Class 1 uploads and answers are kept in the Store but aren't shown in the new lesson. | Accepted |
| K4 | — | "My Starting Point" lives in `class_progress` (owner-only RLS), not in `profiles`, because the profile table feeds the public `public_profiles` view. | By design (private) |
| K5 | — | The Progress page's "Day 1 · Starting Point" milestone upload is still a separate, manual slot. The new "My Voice — Day 1" sample doesn't fill it automatically. | ⏳ Could link them later |
| K6 | 🟡 Low | Real iPhone/Safari: recording and the piano/tone audio are untested (as **G5**). | ⏳ Device check |

### Class 15 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| L1 | — | **Class 16 naming:** the Class 15 brief calls the next class "Singing Simple Phrases", but you chose to keep your 20-class list ("Basic Scale Patterns" at 16, "Simple Melodic Phrases" at 17). The completion panel names the next class from the data and uses neutral wording ("we'll keep building these skills and connecting them together"). | By your decision (2026-10-26) |
| L2 | — | The listening test (Exercise 13) uses the learner's own two recordings (A: clear words, B: good pitch) rather than built-in demo audio. The app has no recorded singer, and a synthetic voice can't sing words convincingly. | Intended; could add real demo recordings later (as **F2**) |
| L3 | — | Nothing about diction is analysed automatically (no speech recognition). Clarity, endings and least-clear-word answers are the learner's own. The only automatic estimates are the existing Class 12 pitch trace (after answering) and the Class 9 relative loudness. | Intended |
| L4 | — | The personal lyric is whatever the learner types (≤ 80 characters). It's stored only in their own `class_progress` row (owner-only RLS) and shown only to them. Nothing is sent anywhere else or analysed. | By design (privacy) |
| L5 | — | Only one beat guide plays at a time (the shared metronome engine stops the previous one), so starting another guide stops the current one. | Existing behaviour (Class 6) |
| L6 | 🟡 Low | Real iPhone/Safari: recording, guides and the trace are untested (as **G5**). | ⏳ Device check |

### Class 2 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| B1 | — | The guides' phases have fixed, generous lengths (about 4 s in, 4–5 s out). The cues say "follow your own pace; the circle is only a picture", and every guide can be stopped at any time. No length is ever shown or saved, only that a guide was completed. | Intended |
| B2 | — | Nothing is analysed automatically: there is no breath-noise detection, no pitch estimate and no loudness meter. Every observation is the learner's own answer, per the brief. | Intended |
| B3 | — | Learners who completed Class 2 under the old standard layout keep their completion. Their old Class 2 answers stay in the Store, unused. The old content (diaphragmatic breathing, "extend the exhale by 1 count each round") is gone, because it contradicted the new brief. | Accepted |
| B4 | 🟡 Low | Real iPhone/Safari: recording and the orb animation are untested (as **G5**). | ⏳ Device check |

### Class 3 (interactive) — known limitations

| # | Severity | Issue | Status |
|---|---|---|---|
| C1 | 🟠 Medium | Class unlocks (`completedClassIds`) were device-only, so on a new device Class 3 stayed locked. | ✅ Fixed: unlocks sync via `learner_state`. Tested: a fresh device opens Class 3 with its notes and scores. |
| C2 | 🟡 Low | There's no automatic pitch judgement for Sing the Note. By design for now, it's labelled "Self Evaluation". `PitchAnalysis` in `vocalRecording.js` is where it plugs in. | ⏳ Future (AI/pitch analysis) |
| C3 | 🟡 Low | Tested in Chrome desktop and Chrome with phone emulation (390 px, touch). Not yet tried on a real iPhone/Safari (Web Audio unlock, MediaRecorder `audio/mp4`) or a real Android device. | ⏳ Needs a device check |
| C4 | 🟡 Low | Class 3 recordings stayed on the device (IndexedDB), like other recordings. | ✅ Fixed: uploaded to the private `recordings` bucket and downloaded on other devices |

### Class 6 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| G1 | — | Tap timing is measured against the **audio clock** of the device, with the scheduled click times corrected for the device's reported output latency. Tested at about ±2 ms in the browser, but **Bluetooth headphones** add delay that the browser doesn't always report, so taps can look "behind". Results are always labelled "basic timing estimate", never pass/fail. | By design; worth a note on real devices |
| G2 | — | Singing and speaking in time are **self-assessed**: there's no automatic onset detection on the voice, so the app doesn't claim to judge sung or spoken timing. | Intended (future: onset detection on `RecordingCard` takes) |
| G3 | — | Rhythm Awareness (Beginner / Developing / Comfortable) blends exercises completed (50%), the average basic timing estimate (30%) and the self-reflection answers (20%), and says plainly that it is not a professional rating. | Intended |
| G4 | 🟡 Low | Practice minutes are logged under a `rhythm` task that isn't one of the daily-practice checkboxes. They count in practice totals and streaks, but there's no rhythm checkbox on the Practice page. | Accepted (add a checkbox if wanted) |
| G5 | 🟡 Low | Real iPhone/Safari: Web Audio scheduling and touch-tap timing are untested (as **C3**/**D4**/**F5**). | ⏳ Device check |
| G6 | 🟢 Fixed | **Found while testing:** for a returning learner, the 8-beat patterns D/E re-locked after a reload even though A–C were done. | ✅ Unlocked on load when A–C are saved |

### Class 5 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| F1 | — | By design, nothing in Class 5 analyses or judges the voice. The only visual is a **basic loudness waveform**, labelled as not showing pitch, and every observation is the learner's own. No "AI" wording anywhere. Future analysis (pitch curve, volume envelope, timing, breath, spectral) should start from `PitchAnalysis.decode` and appear as its own labelled panel. | Intended |
| F2 | 🟡 Low | The warm-up can't demonstrate "Word was unclear": the examples are synthesized, with no real voice or words. The option stays available for the learner's own observations. | Accepted (could add real recorded examples later) |
| F3 | — | Recordings, markers and notes are **always private**. There's no "make this recording public" feature yet. When one is added, markers and notes on that recording should only become visible if the learner explicitly opts in. | Intended / future |
| F4 | 🟡 Low | Per-recording notes are stored as `class_notes` rows keyed `L1C05:rec-<mediaId>`, and the speaking/singing notes as `L1C05:speak-sing`. Same table and owner-only rules; no migration needed. | By design |
| F5 | 🟡 Low | Real iPhone/Safari: recording, waveform decoding of `audio/mp4`, and seeking are untested (as **C3** / **D4**). | ⏳ Device check |
| F6 | 🟢 Fixed | **Found while testing:** a background sync from another device redrew the page even while recording, which would cancel the take. | ✅ `app.js` now waits until you've stopped recording (and typing) |

### Class 4 (interactive) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| D1 | — | By design, nothing in Class 4 is scored for accuracy. Pitch estimates appear only after self-assessment, and progress is about doing the loop, not hitting 100%. (Class 3: hear the difference → Class 4: move toward the note → Class 5: hear your own voice → later: consistent accuracy.) | Intended |
| D2 | 🟡 Low | The pitch estimate is checked against synthetic voices (11 cases including vibrato, noise, octave traps and slides) and a real recorded take. It hasn't been tried on real singing voices yet: breathy or very quiet singing may come back "couldn't estimate", which is the honest outcome. | ⏳ Try it with your own voice |
| D3 | 🟡 Low | The note-chain estimate draws the curve against the three reference lines but gives no verdict, because splitting one take into three notes reliably needs onset detection. | ⏳ Future |
| D4 | 🟡 Low | Recording on real iPhone/Safari hasn't been tested (same as **C3**). | ⏳ Device check |
| D5 | 🟢 Fixed | **Found in testing:** on a new device, a lesson drew before the account's copy arrived, so exercises (and Class 3's reflection) looked empty until a reload. | ✅ `LessonKit.loadAndRefresh` redraws once when newer data arrives (not while recording or typing) |

### Class 12 (interactive) and the Level 1 move — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| P1 | — | The stability estimate uses the existing YIN detector. It leaves out the first 0.2 s (the natural "scoop" onto a note) and the release. Its thresholds (≈30 / 70 cents of spread, 40 cents of drift) are educational and never shown as numbers. Tested on synthetic steady, sharp, flat, falling, wobbling and scooping voices, but not yet tuned on real singers. | ⏳ Tune on real voices (as **D2**) |
| P2 | — | Near-inaudible input (below about −42 dBFS RMS, the Class 4 detector's level floor) is treated as "no clear sound". Quiet but normal singing is estimated. | Intended |
| P3 | — | For the patterns (Exercises 8–9), the trace is shown but there's no per-note verdict, because splitting a sung line into notes isn't reliable enough. "Which note felt least stable?" is the learner's own answer. | Intended |
| P4 | 🟡 Low | Real iPhone/Safari: recording, analysis and the reference animation are untested (as **G5**). | ⏳ Device check |
| M1 | — | **Class moved:** `APP_DATA.LEGACY_CLASS_IDS = { L2C01: "L1C11" }`. `Store.normalize` re-keys completion, current class, uploads, practice sessions, journal entries, lesson activity and notes on every load and merge, so stale devices and old cloud copies are fixed too. This only applies while `L2C01` is a `comingSoon` placeholder. When Vocal Placement is built, the alias switches itself off. | By design — remove the alias once Vocal Placement is written |
| M2 | — | On the server, the old `class_progress` / `class_notes` rows under `L2C01` are read once (when no `L1C11` row exists), copied to `L1C11`, and then left in place unused. Nothing deletes them (there's no delete policy, and none is needed). | Accepted — harmless leftovers |
| M3 | 🟡 Low | Level 2 now unlocks only after all **20** Level 1 classes are complete. Classes 13–20 are placeholders that can't be completed yet, so Level 2 stays locked until they're written. A learner who had finished Breath & Phrase Control continues at Class 12. | By design (your Level 1 list) |

### Cross-device sync — known limitations

| # | Severity | Issue | Status |
|---|---|---|---|
| X1 | 🟡 Low | Another device's changes appear when you log in, return to the tab, or come back online. They don't stream in live while both screens are open side by side. | ⏳ Could add Supabase Realtime later |
| X2 | 🟡 Low | A recording only reaches the account once the device that made it is online and logged in. Until then, other devices show it but can't play it ("isn't stored on this device"). | By design |
| X3 | 🟡 Low | Journal, practice and project history live in one JSON row per user (limit 2 MB). That's plenty for years of use, but not queryable per entry. | ⏳ Split into tables if public profiles need it |

### Warm-up (common section) — known limitations and design choices

| # | Severity | Issue | Status |
|---|---|---|---|
| WU1 | 🟡 Low | `warmup_sessions` only exists once **`0005_warmup_sessions.sql`** is run. Until then, history stays on each device and uploads the next time sync works. | 🔧 **Run `0005`** |
| WU2 | — | A "Performance Recording" screen doesn't exist yet. The "warm up first?" prompt (`WarmupPrompt.beforeRecording(id, returnTo)`) currently appears at Class 10's pre-recording check and on Progress → Before/After. Add it to future recording screens the same way. | By design |
| WU3 | — | Only **finished** warm-ups are saved. "End warm-up" records nothing and says stopping is fine, so the history can't pressure anyone to push through discomfort. | By design |
| WU4 | — | The "how does my voice feel?" and readiness answers, and the self-listening take, are **not stored** anywhere. | By design (minimal data) |
| WU5 | — | "Adaptive" means a suggestion from the learner's own Class 10 focus. The app never analyses recordings to decide what "needs attention". | By design |
| WU6 | 🟡 Low | Skipping a class card or recording prompt hides it for the rest of the day, on that device only. | By design |
| WU7 | 🟡 Low | The Rhythm step uses `BeatGuide` (Class 6's metronome engine, with clicks and beat lights). The full `Metronome` widget is too large for the studio screen. | By design |

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
2. In the Supabase SQL Editor, run **`0001_profiles.sql`, `0002_security_fixes.sql`, `0003_class_progress.sql`, `0004_learner_state.sql`**, in that order (§2). Then run **`0005_warmup_sessions.sql`** (warm-up history, **WU1**) and check with two real accounts that each one sees only its own rows.
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
9. Write Level 1 Class 20 (Melodic Movement & Controlled Range), then Levels 2–8 (50 classes). Remove `comingSoon` from each as it's published.
10. Fill the "Demonstration" slot with audio or video examples (empty on every class).
11. Class 5/6/7 follow-ups:
    - ~~Build Class 6 "Rhythm & Timing"~~ ✅ Done.
    - ~~Build Class 7 "Basic Vocal Warm-Up" on `LessonKit`, `BeatGuide` (paced warm-up steps), `RecordingCard` and `VirtualPiano`~~ ✅ Done.
    - Optional: voice onset detection, so sung or spoken timing can get an estimate too (**G2**).
    - Optionally record real sung examples for the Class 5 warm-up (**F2**).
    - Decide how public recordings should work before adding sharing (**F3**).
12. Class 4 follow-ups:
    - Unlock "Wider steps (C–E–G)" in the note chain when ready (`CHAIN_LEVELS` in `matchingANote.js`).
    - Tune the pitch estimate on real voices (**D2**).
    - Build Class 5, "Listening to Your Own Voice", on `VoiceRecorder`, `PitchMatchExercise` and `LessonKit`.
13. Class 3 follow-ups:
    - Widen Find the Note beyond C4–F4 as a "harder" level.
    - Add real pitch detection behind `PitchAnalysis` (**C2**).
    - Reuse `VirtualPiano` and `PitchExercise` for Class 4 "Matching a Note" and later scales and intervals.

### Housekeeping
14. Replace the Tailwind play CDN with a compiled stylesheet (**S5**).
15. Decide the future of `web/`: merge or archive (**W4–W6**).
16. Add automated tests and CI. The checks run so far (below) were one-off scripts and aren't committed.

---

## 6. Change log

### 2026-10-27: common "🎤 Warm-up" section (uncommitted)

A permanent, non-class preparation routine built from Classes 1–9 (see the feature row). It isn't Class 10, and no class was renumbered or renamed. Classes 1–9 weren't modified.

New:
- `js/warmup.js`
- `js/components/warmupPrompt.js`
- `js/pages/warmup.js`
- `supabase/migrations/0005_warmup_sessions.sql`: one table, owner-only RLS (`auth.uid() = user_id`), no anon access.

Changed:
- `js/auth.js`: warm-up fetch and save.
- `js/store.js`: a local-only `warmupSessions` slot, synced through its own table.
- `js/app.js`: the routes. Background sync no longer redraws during a warm-up, which would restart it.
- `js/router.js`
- `js/components.js`: navigation (**B10**).
- `js/pages/classes.js`
- `js/lessons/lessonKit.js`
- `js/pages/classDetail.js`
- `js/lessons/firstProgressRecording.js`: the intro and prompt only. The baseline logic is untouched.
- `js/pages/progress.js`
- `css/styles.css`
- `index.html`

Checks run (headless Chrome, fake microphone; one-off scripts, not committed):
- **Guest journey, 102 checks, all passed:**
  - Locked at 0, 7 and 8 of 9, including direct session and `?return=` URLs. Unlocked at 9/9.
  - Quick, Full and Performance run end to end, and every step's controls work. Breathing cues contain no digits. The self-listening take is never saved.
  - Pause freezes the timer. "End warm-up" saves nothing.
  - History, the "most skipped" stat and practice minutes survive a reload.
  - After a warm-up started from Class 10, the learner is returned there automatically. An external `?return=` is ignored.
  - The class card shows on Classes 11, 15, 19 and 20 but not on 1–9, and skipping it is remembered.
  - The emphasis suggestion, the off switch and the 3-note pitch variant all work.
  - Every route, including Classes 1–20 and `L2C01`, has no page errors.
  - At 390 px, no page overflows, and the controls sit above the bottom nav.
- **Two accounts, mock Supabase that enforces owner-only rows, 11 checks, all passed:**
  - Alice's warm-up was saved with only the minimal fields and reached her second device.
  - On the same browser, Bob saw the section locked and none of Alice's sessions.
  - Querying Alice's `user_id` from Bob's session returned nothing.
  - The real database policies still need a check once `0005` is run (**WU1**).

### 2026-10-26: interactive Class 19 "Melodic Patterns & Vocal Consistency" (uncommitted)

New: `js/lessons/melodicPatterns.js`.
Changed: `js/data.js` (new `melodicPatternsClass` authored object spliced into `CLASSES` right after `musicalPhrasingClass`, the same way Classes 12–18 were added; `js/audio/pianoSynth.js`'s `playSequence` gained an optional per-note `duration` — see below), `js/lessons/registry.js`, `index.html`. No changes to Classes 1–18, `Store`, `Auth`, or the sync code. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far.

**Bigger curriculum-list decision than previous renames (flagging clearly):** your spec names Class 20 "Melodic Movement & Controlled Range," but the existing Class 20 placeholder was "Level 1 Progress Recording" — a second structured baseline-comparison recording, referenced only in that one placeholder entry and in this document's own prose, never in any other class's code. Rather than extending Level 1 past its established 20 classes, I renamed the Class 20 placeholder (title + goal blurb only, no content written) to match your spec, and **dropped "Level 1 Progress Recording" from the curriculum** — the same "your spec's own next-class description takes precedence over an old generic guess" policy used for Classes 17/18/19 already, just a larger removal this time since that placeholder had a more specific, previously-documented purpose. If you'd rather keep a second baseline recording somewhere in Level 1 (e.g. appended as a 21st class, or swapped in later), say so and I'll adjust — nothing about this is hard to undo, since only the placeholder's title/blurb changed.

`js/audio/pianoSynth.js`: `playSequence`'s per-note objects can now carry an optional `duration` (seconds), falling back to the call's own `duration` option exactly as before when omitted — purely additive, every existing caller (Classes 6/9/10/11/13/14/16/17/18) passes plain numbers or `{midi, velocity}` and is unaffected (regression-checked).

Reuse:
- **Pitch:** the Class 4 `PitchMatchExercise` chain engine for vowel consistency (3 slots, one shared reference) and the pattern-into-phrase exercise.
- **Honest consistency metric:** Exercise 5 reuses Class 12's `PitchStability.assess()` as-is — no new pitch-analysis code — comparing the `cents` offset of three single-note takes against the same reference note and bucketing their spread. **Deliberately scoped smaller than the spec's literal "three attempts of the pattern":** a true multi-note contour-similarity comparison across three chain takes (per-note alignment, timing normalisation) would be a meaningfully larger and harder-to-validate feature; a single sustained note repeated three times demonstrates the same "can you repeat it" idea honestly with the existing engine. Flagged here rather than silently narrowed.
- **Rhythm:** the full Class 6 `Metronome` widget for rhythmic consistency.
- **Self-evaluation:** `ControlCheck` (Class 9/12/14/16/17/18) for the 7-row self-evaluation.
- **Listening:** `ObservationChecklist` (Class 5) for the tone-awareness multi-select.

**Other deliberate, spec-literal choices:**
- Exercise 7 ("same notes, different rhythm") has **no Class Progress checkpoint** — the spec's own 19-item list for this class (one shorter than the usual 20) never names one for it, so it's presented purely as an illustrative A/B demo, consistent with how Classes 16/17's un-listed exercises were handled.
- Exercise 15's five comparison questions (best pitch / best rhythm / most consistent tone / most comfortable / keep) are **not required to gate** "Three-take challenge completed" — only the three recordings are — since the spec frames them as open reflection ("the learner should develop listening judgment"), not a required checklist.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 26 steps across 16 stages render with the expected content, including the pitch-consistency widget (confirmed showing "Not enough data" with no recordings yet, exactly as the honest-metric logic intends), the metronome, the vowel-consistency chain exercise, the pattern-memory reveal button, both A/B demo button pairs, the three-take challenge's 5 question blocks, and the tone-awareness checklist.
- A full-page screenshot confirms the layout matches Classes 1–18's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–18 marked complete (a temporary local test script, reverted afterward), Class 19 renders as the current class; with nothing completed — the real default state — Class 19 correctly shows "locked". Class 18 (most recently built neighbor), Class 12 (the `PitchStability` source) and Class 9 (a `PianoSynth.playSequence` caller, after the `duration` addition) were all re-checked and render identically to before, with no console errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction — in particular, Exercise 5's pitch-consistency computation has not been exercised against real recorded audio, only confirmed to render its "not enough data" state correctly with none. No per-exercise click-through otherwise, no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-26: interactive Class 18 "Musical Phrasing & Line Shape" (uncommitted)

New: `js/lessons/musicalPhrasing.js`.
Changed: `js/data.js` (new `musicalPhrasingClass` authored object spliced into `CLASSES` right after `connectingPhrasesClass`, the same way Classes 12–17 were added; the Class 19 placeholder renamed from "Self-Evaluation" to "Melodic Patterns & Vocal Consistency" with a new goal/learn blurb, matching your spec's own description of what Class 19 will cover — same curriculum-list-takes-precedence approach as the Class 17/18 renames before it, title/blurb only, no content written), `js/lessons/registry.js`, `index.html`. No changes to Classes 1–17, `Store`, `Auth`, the sync code, or any shared component — this class needed none. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far.

**The working melody was deliberately shaped, not picked arbitrarily:** degrees 0-1-3-2-0 (begin low, rise, peak at the middle note, release, finish on the tonic) give Exercise 5's "which note feels most important?" an objectively identifiable answer (the middle, highest note) rather than a fabricated one, and a clean beginning/build/peak/release/finish arc for Exercise 14's three-part shape and Exercise 15's visual shaper. Exercise 1 (destination) and Exercise 2 (contour tracing, the spec's own two literal examples) each use their own short, separate illustrative melody rather than the main one, since neither is meant to be sung later in the class.

Reuse (no shared components touched):
- **Pitch:** the Class 4 `PitchMatchExercise` chain engine for the one-vowel exercise and the three-part shape exercise (the class's main sung exercise), plus `StabilityPanel`/`PitchVisualizer` (Class 12) for the former's optional estimate.
- **Self-evaluation:** `ControlCheck` (Class 9/12/14/16/17) for the 8-row self-evaluation.
- **Breath:** the Class 7/11 breathing circle (visual only, unscored).
- **Tap-to-select interaction:** the visual phrase shaper's per-note role buttons reuse the same "tap, don't drag" visual language as Classes 11/16/17's breath/boundary markers, rather than inventing a new interaction system.

**Deliberate, spec-literal choices (flagged rather than silently decided):**
- Exercise 15 ("Visual Phrase Shaper") asks for a **draggable** visual (`drag or select Start/Build/Peak/Release`); this buildless, largely mouse-and-touch-light codebase implements the **select** half of that instruction only — each of the 5 notes gets a tap-to-cycle role button (Start/Build/Peak/Release/Finish) rather than a new drag-and-drop system, consistent with how every earlier class's "tap to mark/choose" interactions were built.
- Exercises 7 and 13's A/B comparisons are **synthesized, not recorded** — exactly what's being compared (uniform vs. peak-shaped loudness; strict vs. gently-weighted timing, with the underlying pulse/gap held constant) is something `PianoSynth`'s velocity and duration options control honestly, matching the precedent Class 17's listening-analysis A/B set.
- Exercise 17 ("one-focus improvement") is a **single-select** over the 8 areas, not a `ControlCheck` grid — the spec explicitly frames it as "the learner should NOT try to fix everything simultaneously; choose one," so a multi-row grid would work against its own instruction (the same reasoning Class 17's recording-review exercise used).
- Exercise 12's "neutral vs. with meaning" comparison has **no reference melody or pitch grading** — sung freely, matching the spec's "sing it once neutrally, then while thinking about the chosen meaning" and Class 17's equivalent expression exercise.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 26 steps across 16 stages render with the expected content: both contour bar-charts (Exercise 2), the peak-identification and three-part-shape chain exercises, all 5 visual-shaper tiles (confirmed showing their "Tap to label" placeholder), both A/B comparison button pairs, the 4-take recording-practice grid, and all 6 assignment take cards.
- A full-page screenshot confirms the layout matches Classes 1–17's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–17 marked complete (a temporary local test script, reverted afterward), Class 18 renders as the current class; with nothing completed — the real default state — Class 18 correctly shows "locked". Class 17 (most recently built neighbor) and Class 12 (the `StabilityPanel` source) were both re-checked and render identically to before, with no console errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the piano, every record/play button, the shaper-tile taps, the A/B comparison buttons, the single-select chips), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-26: interactive Class 17 "Connecting Phrases" (uncommitted)

New: `js/lessons/connectingPhrases.js`.
Changed: `js/data.js` (new `connectingPhrasesClass` authored object spliced into `CLASSES` right after `singingPhrasesClass`, the same way Classes 12–16 were added; the Class 18 placeholder renamed from "Singing a Simple Song" to "Musical Phrasing & Line Shape" with a new goal/learn blurb, matching your spec's own description of what Class 18 will cover — same curriculum-list-takes-precedence approach as Class 16's Class 17 rename, title/blurb only, no content written), `js/lessons/registry.js`, `index.html`. No changes to Classes 1–16, `Store`, `Auth`, the sync code, or any shared component — this class needed none. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far.

**The two working phrases were deliberately designed, not picked arbitrarily:** "I want to sing today" (5 notes, degrees 1-2-3-4-3) and "and enjoy the sound" (4 notes, degrees 3-2-1-2) share a note — Phrase 1 ends on degree 3 and Phrase 2 starts on degree 3 — so Exercise 9's "same note / higher / lower" question has one objectively correct, demonstrable answer instead of needing a fabricated judgement. Phrase 3 ("I feel the song", degrees 2-1-2-1) continues from Phrase 2's ending toward the tonic for the optional three-phrase extension.

Reuse (no shared components touched):
- **Pitch:** the Class 4 `PitchMatchExercise` chain engine for "connecting pitch" (both phrases as one 9-note chain) and the three-phrase extension (13 notes), plus `StabilityPanel`/`PitchVisualizer` (Class 12) for the former's optional estimate.
- **Rhythm:** the **full Class 6 `Metronome` widget** for "rhythm before melody" — the same full-widget choice Classes 10, 11 and 16 made when a spec explicitly says "use the metronome" — plus `BeatGuide` for the word-by-word rhythm and melody guides.
- **Breath:** the Class 7/11 breathing circle (visual only, unscored).
- **Self-evaluation:** `ControlCheck` (Class 9/12/14/16) for the 7-row self-evaluation.
- **Listening:** `ObservationChecklist` (Class 5) for the listening-analysis "what changed?" multi-select; plain `VoiceRecorder.play()` buttons (the Class 13/16 pattern) for comparing the two fixed recording-review attempts.
- **Breath-boundary tap editor:** a local, single-mark copy of the same small interaction Class 16 already re-implemented from Class 11's original (which itself was always local to `breathPhraseControl.js`, never a shared component) — applied here to tapping a *phrase boundary* instead of a *breath point*, reusing the same gap-button visual language rather than inventing a new one.

**Deliberate, spec-literal choices (flagged rather than silently decided):**
- Exercise 16 ("recording review") is a **single-select** "which ONE thing would you most like to improve?" over the 7 areas, not a `ControlCheck` grid — the spec explicitly says "do not attempt to judge everything at once... choose ONE main issue," so a multi-row grid would have worked against its own instruction.
- Exercise 15's "Version A / Version B" comparison is **synthesized, not recorded** — a gap's length and a note's relationship to the previous phrase are exactly what `PianoSynth.playSequence`'s `gap` and `velocity`/pitch options control, so (unlike judging a vocal flaw) this is something the engine can demonstrate honestly, and the spec explicitly asks for an explanatory reveal afterward, which a synthesized A/B makes straightforward to write accurately.
- Exercise 13's expression phrase ("I remember" / "something beautiful") uses the spec's own separate example pair, sung freely with **no reference melody or pitch grading** — the spec frames it as "sing naturally while keeping the meaning in mind," not a pitch-matching drill.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 25 steps across 14 stages render with the expected content: the two-phrase boundary blocks, all 8 phrase-boundary tap targets across the combined 9-word line (`aria-label="Phrase boundary after …"`), the full Metronome widget, the pitch-connection piano + chain exercise, the three-phrase extension, both listening-analysis play buttons, the recording-review single-select, all 7 self-evaluation rows, and all 6 assignment attempt cards.
- A full-page screenshot confirms the layout matches Classes 1–16's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–16 marked complete (a temporary local test script, reverted afterward), Class 17 renders as the current class; with nothing completed — the real default state — Class 17 correctly shows "locked". Class 16 (most recently built neighbor) and Class 10 (the `Metronome`-widget-reuse precedent) were both re-checked and render identically to before, with no console errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the piano, the metronome, every record/play button, the boundary tap targets, the single-select review chip, the analysis checklist), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-26: interactive Class 16 "Singing Simple Phrases" (uncommitted)

New: `js/lessons/singingSimplePhrases.js`.
Changed: `js/data.js` (new `singingPhrasesClass` authored object spliced into `CLASSES` right after `dictionClass`, the same way Classes 12–15 were added), `js/lessons/registry.js`, `index.html`.

**Curriculum-list correction (your spec's own Class 16/17 titles take precedence over the old placeholder list):** the previous `level1Upcoming` placeholders for 16–17 were generic titles ("Basic Scale Patterns", "Simple Melodic Phrases") written before Classes 11–15 existed. Class 16 is now "Singing Simple Phrases" per your spec, and the first remaining placeholder (now Class 17) is renamed "Connecting Phrases" to match your spec's own description of what comes next (two phrases, phrase-to-phrase breathing, maintaining pitch/rhythm across the join) — its content isn't written, only its title and goal blurb changed, consistent with how every other placeholder is described. Classes 18–20 ("Singing a Simple Song", "Self-Evaluation", "Level 1 Progress Recording") are unchanged. No other renumbering; Level 1 is still 20 classes. No changes to Classes 1–15, `Store`, `Auth`, or the sync code. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far.

Reuse (no new shared components):
- **Pitch/melody:** the Class 4 `PitchMatchExercise` chain engine for the "AH" vowel-melody exercise, and `StabilityPanel`/`PitchVisualizer` (Class 12) for its optional estimate.
- **Rhythm:** the **full Class 6 `Metronome` widget** (not just `BeatGuide`) for "find the rhythm," matching Classes 10/11's precedent of embedding the real metronome when a spec explicitly says "use the metronome" — plus `BeatGuide` itself for the word-by-word and melody-guided singing steps.
- **Breath:** a **local, single-mark copy of Class 11's tap-to-place 💨 phrase editor.** Class 11's own editor (`renderPhraseEditor`/`wirePhraseEditor`) was already documented as "local to this file, not a new shared component," so Class 16 reimplements the same small interaction (not a duplicate system, since the original was never promoted to one) rather than reaching into another lesson's private functions.
- **Self-evaluation & review:** `ControlCheck` (Class 9/12/14), reused twice — once for the spec's 8-row self-evaluation, and once (with its own `levels` override, the Class 8-era generalization) for Exercise 12's 7-lens Good/Needs attention/Not sure review grid.
- **Listening:** `ObservationChecklist` (Class 5) for the recording-comparison "what changed?" multi-select; plain `VoiceRecorder.play()` buttons (the Class 13 "Play Attempt 1" pattern) for the two fixed recordings being compared, rather than the free-picker `RecordingComparison` component, since here the two takes are known exercise outputs, not an open choice from the upload list.

**Deliberate, spec-literal choices (flagged rather than silently decided):**
- The phrase "I love to sing" (4 words) is sung on a **4-note** melody (1→2→3→2), not the spec's illustrative "3–5 notes, e.g. 1→2→3→2→1" — chosen so every word maps to exactly one note with nothing stretched or split, avoiding an arbitrary 5th syllable.
- Exercises 9 ("phrase middle") and 10 ("phrase ending") are **self-assessment only, no separate recording** — the spec says "record the first part only" for Exercise 8 but never repeats "record" for 9 or 10, so they're read as reflective questions about the same attempt rather than two more takes.
- **Class Progress follows the spec's own 20-item list exactly:** only Pitch/Rhythm/Diction (of Exercise 12's 7 review lenses) get individual checkpoints, and Exercise 14 ("diction focus") has none — its three recordings still save to the library normally, they just don't gate a progress item, because the spec's list doesn't name one for it.
- The 10 assignment questions live **only** in the Assignment chapter (the spec lists no separate Reflection section or checkpoint for this class), so unlike Classes 13–15 there was no duplicate-questions risk to design around here.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 25 steps across 15 stages render with the expected content: the full Metronome widget, the melody reference-note piano and its two "play" buttons (ear-only, confirmed to need no recording), the 4-word breath-placement editor (`aria-label="Breath mark after …"` for all 4 gaps), all 7 review-grid questions, all 8 self-evaluation rows, and all 6 assignment attempt cards.
- A full-page screenshot confirms the layout matches Classes 1–15's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–15 marked complete (a temporary local test script, reverted afterward), Class 16 renders as the current class; with nothing completed — the real default state — Class 16 correctly shows "locked". Class 15 (most recently built neighbor) and Class 6 (the `Metronome`/`BeatGuide` source) were both re-checked after this class's additions and render identically to before, with no console errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the piano, the metronome, every record/play button, the breath-marker tap targets, the review grid chips, the comparison checklist), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-26: interactive Class 15 "Diction & Pronunciation" (committed)

New: `js/lessons/dictionPronunciation.js`.
Changed:
- `js/data.js`: a real `dictionClass` (number 15, `interactive: "diction-pronunciation"`). "Diction & Pronunciation" was removed from the placeholder list, which now starts at 16, so Classes 16–20 keep their titles and ids.
- `js/lessons/registry.js`, `index.html`.
- `css/styles.css`: lyric-line spacing, and wrapping for long words in the beat guide.

No shared component, Store, sync or database change. Classes 1–14 are untouched (Class 14's next class is now this one).

Checks run:
- **Desktop journey (headless Chrome, fake microphone, learner with Classes 1–14 done):**
  - All 26 sections rendered, at 0% to start.
  - The current word lit on the beat ("I [want] to sing"). Each of the six guides recorded its completion when run to the end.
  - A piano tap moved every pitch exercise (vowel reference and "Ma-ry sings to-day" melody → C4).
  - The vowel trace panel stayed closed until "equally stable?" was answered, then showed the estimate.
  - Word endings, lyric clarity and the four assignment attempts only counted once played to the end.
  - "Least clear word" gave a focus prompt for that word. "Breath mid-word" suggested a shorter phrase. The dynamics loudness estimate appeared.
  - The personal lyric built its own guide (7 words + rest) and lit its words on the beat.
  - Progress reached 100% (17/17), the class completed, and Class 16 (Basic Scale Patterns) became current. Everything was still there after a reload.
- **Mobile (390 px, touch):** no horizontal overflow, even with a 34-letter word in the lyric (it wraps with hyphens). Recording, chips and self-check worked by touch. The beat guide starts on the very first touch after a fresh load and lights the words. (One test step missed because it tapped while the page was still scrolling; re-tested twice on a fresh page and it works.)
- **Two users, two devices (mock account server):** Alice's endings recording (downloaded, waveform drawn), answer, own lyric line (and its guide), self-check, note and 3 practice minutes appeared on a fresh "phone". Her lyric was stored only in her own `class_progress` row. Bob saw Class 15 locked, then 0% with nothing of Alice's (empty lyric field), and couldn't download her recording.
- **Regression:** all routes, including L1C14–L1C16 and L1C20. Classes 1–3 and 14 open normally, the coming-soon Class 16 shows the standard page, and Class 14 names Class 15 as next. No page errors anywhere.

### 2026-10-26: interactive Class 2 "Comfortable Breathing for Singing" (committed)

New: `js/lessons/comfortableBreathing.js`.
Changed:
- `js/data.js`: the Class 2 block only. It's renamed from "Breathing & Breath Awareness", gets `interactive: "comfortable-breathing"`, a subtitle, beginner content with no capacity work, 8 assignment parts and 6 reflection questions.
- `js/lessons/registry.js`, `index.html`.
- `css/styles.css`: the breathing orb's phase states (switched off under reduced motion).

No shared component, Store, sync or database change. Classes 1 and 3–14 are untouched; Class 1's "next class" line now shows the new title automatically (**K2** fixed).

Checks run:
- **Desktop journey (headless Chrome, fake microphone, learner with Class 1 done):**
  - All 21 sections rendered, at 0% to start. None of "longest breath / best breath / breath capacity / leaderboard" appears anywhere.
  - The orb moved through in → sound → rest. Stopping a guide part-way showed "Stopped. Breathe normally and rest." and didn't count. All 14 cues the guides displayed contained no digits.
  - "No" on the "sss" showed the stop message. "Uncomfortable" on the hum said to skip the repeat. "Not enough breath" suggested a shorter phrase, not a bigger one.
  - The breath + pitch note followed a piano tap (D4 → C4), with no estimate.
  - The recording only counted after it was played back to the end.
  - The timer session saved as `{task: "breath", category: "Breathing Awareness", classId: "L1C02", minutes, at}` and nothing else.
  - The assignment showed 7/8 until the reflection was written. Progress reached 100%, the "BREATH BECOMES PART OF THE MUSIC" panel appeared and Class 3 became current. Everything was still there after a reload.
- **Mobile (390 px, touch):** no horizontal overflow. The guide and Stop, tiles, tension chips, recording and self-check all worked by touch.
- **Two users, two devices (mock account server):** Alice's answer, recording (downloaded, waveform drawn), tension, self-check, reflection, note and 2 practice minutes appeared on a fresh "phone". Bob saw Class 2 locked, then 0% with nothing of Alice's, and couldn't download her recording by id.
- **Regression:**
  - All routes.
  - A learner who completed Classes 1–2 the old way kept both completions, and Class 3 opens as current.
  - The coming-soon Class 15 still shows the standard page.
  - The full Class 1 journey passed, and its ending now reads "Next: Class 2 — Comfortable Breathing for Singing".
  - No page errors anywhere.

### 2026-10-26: interactive Class 1 "Meet Your Voice & Listening Foundation" (committed)

New: `js/lessons/meetYourVoice.js`.
Changed:
- `js/data.js`: the Class 1 block only (`interactive: "meet-your-voice"`, subtitle, beginner content, 6 assignment parts, 5 reflection questions).
- `js/lessons/registry.js`, `index.html`.
- `css/styles.css`: single-column observation chips, the speak→hum tiles and the glide animation (respects reduced motion).

No shared component, Store, sync or database change. Classes 2–14 are untouched.

Checks run:
- **Desktop journey (headless Chrome, fake microphone, brand-new learner):**
  - All 18 sections rendered, at 0% to start, with Class 2 locked.
  - A "Strained" comfort answer showed "Don't force your voice today" and 7 rest reminders. Switching to "Comfortable" hid them.
  - The room-listening countdown ran, and stopping early didn't count.
  - All exercises worked. Higher/lower gave a gentle reveal for every answer (including "Not sure"), and its choices stay disabled until the notes have been played.
  - The preview had no estimate and gave "This is only your first attempt…" for every answer. Playback ticked only after listening to the end.
  - The three Day 1 parts were saved as "Class 1 — Starting Voice Sample · Speaking / Humming / Pitch-matching attempt". The assignment showed 4/6 until all three were played back, then 6/6 with the reflection.
  - Progress reached 100%, and the completion panel showed "WELCOME TO YOUR SINGING JOURNEY". Class 2 became current, and a journal entry was saved with the learner's own discovery.
  - Everything was still there after a reload.
- **Mobile (390 px, touch):** no horizontal overflow. The comfort chips, listening timer, recording, tiles, pairs (the piano keys go down for each note) and glide all worked by touch.
- **Two users, two devices (mock account server):** Alice's comfort answer, speaking recording (downloaded, waveform drawn), observations, starting-point profile and note all appeared on a fresh "phone". Bob saw 0%, no selections, no recordings and no note, and couldn't download Alice's recording by id.
- **Real Supabase (read-only):** anonymous reads of `class_progress`, `class_notes` and `learner_state` are still refused (42501), and the recordings bucket lists nothing.
- **Regression:** all routes. A learner who completed Classes 1–2 the old way kept the completions, Class 2 still has its standard layout, and Class 3 opens as current. The share page and class card read the new Class 1 content. No page errors anywhere.

### 2026-10-23: interactive Class 14 "Basic Vocal Dynamics" (committed)

New: `js/lessons/basicVocalDynamics.js`.
Changed: `js/data.js` (new `basicDynamicsClass` authored object spliced into `CLASSES` right after `smoothTransitionsClass`, the same way Classes 11–13 were added; `level1Upcoming`'s map renumbered from `14 + i` to `15 + i` now that Class 14 is real, so Classes 15–20 keep their numbers), `js/lessons/registry.js`, `index.html`, plus two small **additive, backward-compatible** changes to shared components (both regression-checked — see Verified below):
- `js/components/vocalControl.js`: `VolumeEnvelope` gained optional `shape` (`"hill"` default | `"up"` | `"down"`) and `labels` params. The original hill curve, its 3-point label layout and its status-phase wording are untouched when `shape` is omitted, so Class 9's own `VolumeEnvelope.render("ve-ex4", { seconds: 6 })` call (no `shape`) behaves exactly as before.
- `js/components/rhythm.js`: `BeatGuide`'s guide-note playback now reads an optional `tok.velocity` per beat (`velocity: tok.velocity ?? 0.55`), falling back to the same fixed `0.55` every earlier class's bars already relied on when a token doesn't set one.
No changes to Classes 1–13, `Store`, `Auth`, or the sync code. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far. Level 1 is still 20 classes; nothing else renumbered.

Reuse:
- **Pitch matching:** every single-note and chain exercise (levels, pitch-stability, gradual fades, crescendo/decrescendo, transitions+dynamics, the melody) is the Class 4 `PitchMatchExercise` engine, the same `transitionEx`-style config shape Classes 9/13 established.
- **Volume guide:** `VolumeEnvelope` (Class 9) generalized in place (see above) rather than building a second guide component for the four gradual/crescendo/decrescendo exercises — including its existing `LoudnessAnalysis` curve-overlay-after-recording behavior, inherited for free.
- **Rhythm:** the Class 6 `BeatGuide`, generalized in place (see above) so its guide note can demonstrate soft/medium/stronger/soft instead of one fixed volume.
- **Breath:** the Class 7 `.breathe-circle` CSS and the exact Class 11 phrase text ("I am learning to sing."), both reused as-is.
- **Pitch visualization:** the Class 12 `PitchVisualizer`/`StabilityPanel`, reused untouched, attached to the pitch-stability exercise's "stronger" take.
- **Recording comparison & self-evaluation:** `RecordingComparison` and `ControlCheck` (Class 9), reused exactly as Classes 8/9/12/13 use them.
- **Deliberate non-reuse of Class 13's "own takes" workaround:** Exercise 12 ("listen and identify") instead synthesizes four short examples with `PianoSynth.playSequence`'s existing per-note `velocity` option — unlike Class 13's pitch-overshoot problem, a loudness contour (soft→stronger / strong→soft / constant / hill) is exactly what `velocity` honestly controls, so there's no fabricated-pitch-flaw concern here and the learner's own recordings aren't needed for this exercise.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 25 steps across 16 stages render with the expected content: the dynamic-scale spectrum graphic, all four `VolumeEnvelope` guides (confirmed via their `aria-label`s: "soft to medium", "medium to soft", "p to mp to mf to f", "f to mf to mp to p"), the rhythm `BeatGuide`'s four per-beat labels ("soft"/"medium"/"stronger"/"soft"), all four Exercise 12 examples, the recording-comparison empty state, five expandable common-problems sections, and the progress/completion panels.
- A full-page screenshot confirms the layout matches Classes 3–13's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–13 marked complete (a temporary local test script, reverted afterward), Class 14 renders as the current class; with nothing completed — the real default state — Class 14 correctly shows "locked". Class 9 ("Basic Vocal Control", `VolumeEnvelope`'s original caller) and Class 13 (`BeatGuide`'s existing caller) were specifically re-checked after the shared-component edits and render identically to before, with no console errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the piano, every record/play button, the Exercise 12 identify buttons, the metronome-guided rhythm exercise, the self-assessment and classification chips), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-23: interactive Class 13 "Smooth Note Transitions" (committed)

New: `js/lessons/smoothNoteTransitions.js`.
Changed: `js/data.js` (new `smoothTransitionsClass` authored object spliced into `CLASSES` the same way `breathPhraseClass`/`pitchStabilityClass` are; the `level1Upcoming` map's `13 + i` numbering became `14 + i` now that Class 13 is real, so Classes 14–20 keep their numbers), `js/lessons/registry.js`, `index.html`.
No changes to Classes 1–12, the shared audio engines, `Store`, `Auth`, or the sync code. **No new migration:** same `class_progress`/`learner_state`/`recordings` reuse as every interactive class so far. Level 1 is still 20 classes; nothing else renumbered.

Reuse (no new shared components):
- **Every transition exercise** (11 of them) is the Class 4 `PitchMatchExercise` in chain mode — the same shape Class 9 introduced for `ex5up`/`ex5down`-style directional pairs, extended here to 2-, 3-, and 5-note runs.
- **Rhythm:** the Class 6 `BeatGuide`, one note per beat then a rest, exactly as Classes 9–11 use it.
- **Breath:** the Class 7 `.breathe-circle` CSS, reused at the compact `!w-20 !h-20` size Class 12 already introduced.
- **Visualization:** the Class 12 `PitchVisualizer`/`StabilityPanel` reused untouched — no new estimate logic, no new trace rendering.
- **Self-evaluation:** `ControlCheck` (Class 9/12, per-row levels).
- **Deliberate non-reuse:** Exercise 12 ("listen and identify the problem") does not fabricate example recordings the way the spec sketches (Example A–E of clean/overshoot/jump/etc.) — `PianoSynth` has no portamento or pitch-bend, so it cannot honestly produce a convincing "overshoot" or "sudden jump" sample without inventing misleading audio. Instead the learner picks and classifies one of their own takes from earlier in the lesson, which serves the same "develop listening ability" goal honestly.

**Bug caught and fixed during self-review before testing:** the spec's Assignment (§23, 9 questions) and the established "Reflection" convention (`content.assignment.questions`, also these same 9 questions — Class 13 has no separate reflection set, unlike Classes 7–12) would have rendered as two identical 9-question textarea blocks back to back. Removed the duplicate from the Assignment chapter, pointed `assignmentDone()` at the Reflection answers instead, and left a one-line pointer in the Assignment chapter to where the questions actually are.

Verified (headless Chrome, structural/visual only — same scope as every interactive class's entry above):
- All 24 steps across 15 stages render with the expected content, including every exercise's chain badge ("2 notes" / "3 notes" / "5 notes"), the reference-note piano, the Exercise 12 own-takes picker (correctly showing its empty state with nothing recorded), the before/after section, all 5 expandable common-problems sections, and the progress/completion panels.
- A full-page screenshot (the longest lesson page built so far) confirms the layout matches Classes 3–12's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–12 marked complete (a temporary local test script, reverted afterward), Class 13 renders as the current class; with nothing completed — the real default state — Class 13 correctly shows "locked", and Class 14 stays locked behind it. Classes 1, 4, 9, 11 and 12 (spot-checked) all still render correctly. Home, Classes, Journey, Practice, Progress, Journal, Login and Dashboard all still render with no errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the piano, every transition's record/play, the Exercise 12 picker, the metronome-guided assignment attempt, the self-assessment and classification chips), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as every interactive class above — built and structurally sound, **not yet interaction-tested**.

### 2026-10-23: interactive Class 12 "Pitch Stability" + Level 1 grows to 20 classes (committed)

**Curriculum (your choice: "Move into Level 1", plus your 20-class Level 1 list):**
- **Moved:** Breath & Phrase Control `L2C01` → `L1C11`.
- **New:** Pitch Stability `L1C12` (interactive), and placeholders `L1C13`–`L1C20`: Smooth Note Transitions, Basic Dynamics, Diction & Pronunciation, Basic Scale Patterns, Simple Melodic Phrases, Singing a Simple Song, Self-Evaluation, Level 1 Progress Recording.
- **Level 2:** starts with Vocal Placement again (`L2C01`–`L2C10`). The total is now 70 classes.
- **Existing progress:** carried across by the `L2C01 → L1C11` alias (**M1–M3**).

New: `js/components/pitchStability.js`, `js/lessons/pitchStability.js`.

Changed:
- `js/data.js`: the restructure, Class 12 content and `LEGACY_CLASS_IDS`.
- `js/store.js`: `migrateClassIds`, `mergeActivity`, `legacyClassIds`.
- `js/classActivity.js`: reads the old row or note when the new one is missing.
- `js/audio/pitchAnalysis.js`: also returns `loudSeconds` and `peak` (additive).
- `js/components/pitchMatch.js`: optional `cfg.noteDuration` and `opts.onPlayed` (no change for existing callers).
- `js/components/vocalControl.js`: `ControlCheck` rows can carry their own `levels`.
- `js/pages/classDetail.js`: a locked class in a locked level now says "Complete Level N−1 to unlock".
- Lesson text: Class 9's bridge says "Later, Level 2…", and Class 11's fallback line and header comment were updated.
- `js/lessons/registry.js`, `index.html`, `css/styles.css` (reference-line animation).

No database migration is needed.

Checks run:
- **Node:**
  - Migration tests: old save, stale device merge, conflict merge, current class moves to L1C12, Level 2 locked.
  - 15 synthetic-voice stability cases: steady, ±60 cents sharp/flat, falling at the end, small natural movement, wobble, scoop, octave lower, short note, silence, near-inaudible, blip, pure noise, noisy room, wild glide.
  - The existing store, merge and Class 4 pitch tests.
- **Desktop journey (headless Chrome, fake microphone):**
  - All 22 sections rendered, and picking D4 moved every pattern.
  - Every estimate panel stayed closed until the take had been answered by ear.
  - The steady 255 Hz test voice was described as "slightly lower (a little flat)" against C4, which is correct: it's −44 cents.
  - The listen-back requirement resets when Attempt 1 is re-recorded.
  - Progress reached 100%, the class completed, Class 13 became current, and everything was still there after a reload.
- **Hard inputs:** silence, pure noise and near-inaudible input each hid the trace with the right reason. A blocked microphone showed "Microphone access was blocked…".
- **Mobile (390 px, touch):** no horizontal overflow. The piano, recording, assessment, look, breath cue, problem sections and self-check all worked by touch. The trace fits at 316 px.
- **Two users, two devices, old data (mock account server):**
  - Alice's account was seeded as the old app left it, with Class 11 under `L2C01`. After signing in on the new app, her completion, progress, note, journal entry and practice minutes were all under `L1C11`, on the server too.
  - Her Class 12 work appeared on a fresh "phone", and the recording downloaded and its trace was drawn.
  - Bob saw Class 12 locked, then 0% with none of Alice's data, including her old `L2C01` note.
- **Real Supabase (read-only):** anonymous reads of `class_progress`, `class_notes` and `learner_state` are still refused (42501), and the recordings bucket lists nothing.
- **Regression:** all routes, including L1C11–L1C13, L1C20, L2C01 and L2C02. Class 4 and Class 9 full journeys passed, Classes 10 and 11 open as current, and Journey shows "11/20 classes". No page errors anywhere.

### 2026-10-22: interactive Class 11 "Breath & Phrase Control" — Level 2's first real class (committed)

New: `js/lessons/breathPhraseControl.js`.
Changed: `js/data.js` (new `level2class1` authored object, `placeholderLevel()`/`levelClassDefs` gained an optional `startNumber`, `CLASSES` construction splices the authored class in), `js/lessons/registry.js`, `index.html`.
No changes to Classes 1–10, the shared audio engines, `Store`, `Auth`, or the sync code. **No new migration:** same `class_progress`/`recordings` reuse as Classes 3-10.

**A structural decision, flagged clearly rather than made silently:** your prompt calls this "Class 11" and numbers it as the 11th class overall, continuing straight from Class 10. In Niswara's data model, Level 1 already has exactly 10 classes (`L1C01`-`L1C10`), so "the next class" is `L2C01` — Level 2's first slot, which previously held a generic, never-detailed "Vocal Placement" placeholder from the original curriculum realignment. I replaced that placeholder with this fully-authored lesson rather than restructuring the level boundaries (which would have meant renumbering/relocating classes across every level — far more invasive than a single-class prompt should trigger). One consequence: Niswara labels every class **per level** ("LEVEL 2 · CLASS 01"), the same convention Classes 1-10 and the Journey map already use, so this lesson's own UI says "Class 1" throughout (progress tracker, assignment title, etc.) rather than "Class 11" — `cls.number` is `1`, matching the app's existing badge, not hardcoded to 11. See the "Numbering note" added to the Full Curriculum table. If you'd rather the app carry a global sequence number so prompts can keep counting 11, 12, 13... literally, that's a deliberate follow-up, not something I changed unilaterally this round.

To make this possible without reshuffling anything else: `placeholderLevel(levelId, category, skillTag, titles, difficulty, startNumber = 1)` now accepts an optional starting class number (defaults to 1, so every other level is untouched), and Level 2's `levelClassDefs` entry sets `startNumber: 2` with "Vocal Placement" removed from its auto-generated `titles` list (now 9 titles: Resonance → First Performance Assessment, numbered 2-10 as before). `CLASSES` is built as `[...level1, {...level2class1, levelId: 2}, ...the auto-generated placeholders]`. Total class count is unchanged (60); Level 2 is still 10 classes, Resonance is still `L2C02`.

Reuse (one new, deliberately-local piece — everything else existing):
- **Breathing visual:** Class 7's `.breathe-circle` CSS class and keyframe, reused exactly as-is (no new animation).
- **Pitch exercise:** Class 4's `PitchMatchExercise` chain mode for the breath+pitch 1-2-3-2-1 pattern (same shape as Class 10's pattern exercise).
- **Rhythm:** the full Class 6 `Metronome` widget, as the spec asked for.
- **Recording:** Class 5's `RecordingCard`, used across phrase length, breath-before-phrase, the A/B breath comparison, and the assignment's two attempts.
- **Self-evaluation:** the Class 8-generalized `ControlCheck` (custom levels param added for Class 8), reused with its own 6-row breath/timing/phrase/ending/control/recovery scale — no third near-duplicate component.
- **Cross-class reference:** reads Class 10's own stored song take (`ClassActivity.get("L1C10").answers.song.take`) directly for the baseline comparison — no new recording-library API, no new table.
- **New, local only:** a tap-to-mark breath-point phrase editor (`renderPhraseEditor`/`wirePhraseEditor`), used 3 times within this one file. Kept local rather than promoted to a shared component, the same way Class 7's breathing circle and Class 8's "notice and acknowledge" button started out — if a later class needs it too, it can be extracted then.

Verified (headless Chrome, structural/visual only — same scope as Classes 7, 8 and 10's entries):
- All 21 steps across 12 stages render with the expected content, including the phrase-editor word/breath-mark UI (confirmed with real dot/💨 toggles in a screenshot), the Metronome widget, the 5-note pitch chain, and the "No baseline yet" graceful fallback when Class 10's song take doesn't exist (confirmed in this exact state, since the regression unlock script marks classes complete via `Store` without fabricating any real `ClassActivity` recording data).
- Fixed two bugs found during self-review before testing: a leftover drafting sentence in Exercise 4's instructions, and a falsy-zero bug where marking the very first word gap (`mark: 0`) would have rendered as unmarked on re-render (the live wiring already handled it correctly via `!== undefined`; the initial render didn't).
- **Regression:** with Classes 1-10 marked complete (a temporary local test script, reverted afterward), Class 11 (`L2C01`) renders as the current class, and `L2C02` ("Resonance") correctly stays locked behind it. With nothing completed — the real default state — `L2C01` correctly shows "locked". Classes 1, 8, 9 and 10 (spot-checked, including the ones nearest the data.js structural change) all still render correctly. Home, Classes, Journey, Practice, Progress, Journal, Login and Dashboard all still render with no errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (the phrase editor's tap targets, the metronome, record/play on eight-plus takes, every self-assessment chip, the assignment's live phrase-typing-to-editor flow), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase. Same caveat as Classes 7, 8 and 10 — built and structurally sound, **not yet interaction-tested**.

### 2026-10-22: interactive Class 10 "First Progress Recording" — Level 1's milestone class (committed)

New: `js/lessons/firstProgressRecording.js`.
Changed: `js/data.js` (Class 10 content and the `interactive` flag), `js/lessons/registry.js`, `index.html`, `js/components/listening.js` and `js/components/pitchMatch.js` (`onBeforeRecord` hook — see below).
No changes to Classes 1–9, the shared audio engines, `Store`, `Auth`, or the sync code. **No new migration and no new table:** this class's five recordings are ordinary per-class uploads (`VoiceRecorder.saveToClass` → `Media` → the existing private `recordings` bucket, same as Classes 3-9), and "baseline" is just a flag inside this class's own `ClassActivity` answers, synced through the existing `class_progress` table. The spec explicitly asked not to create a duplicate table if the existing one could support it — it can.

Two shared-component changes, both backward compatible: `RecordingCard.wire()` and `PitchMatchExercise.wire()` now accept an optional `onBeforeRecord()` callback, called only when RE-recording over an existing take; returning `false` cancels the re-record. Undefined (every other call site — Classes 4, 5, 6, 7, 8, 9) behaves exactly as before. Class 10 is the only caller, and uses it to show a native confirm ("This is your progress baseline. Are you sure you want to replace it?") once the baseline is finalized. Regression-checked: Classes 5, 7, 8 and 9's recording flows still work with no behavior change.

Reuse (no new recording/storage system):
- **Piano, pitch exercises:** Class 3's `VirtualPiano`; Class 4's `PitchMatchExercise`/`SelfAssessment` for the reference note (single slot) and the 1-2-3-2-1 pattern (chain mode) — neither scored for pitch accuracy.
- **Rhythm:** the full Class 6 `Metronome` widget (not just `BeatGuide` — the spec specifically asked for "Start Metronome"), paired with `RecordingCard`.
- **Recording:** Class 5's `RecordingCard` for speaking, rhythm and the song excerpt.
- **Everything else:** `Timer` was deliberately **not** added — the spec for this class doesn't ask for one, and a milestone class that's explicitly "bring together what you already know" doesn't need a new daily-practice category. `PersonalNotes`/`ClassProgress`/`ClassActivity`/`LessonKit` otherwise as usual.
- **No AI judgement:** self-evaluation is six independent `SelfAssessment` chip questions (own option sets per the spec, e.g. Pitch: Comfortable/Mostly comfortable/Uncertain/Difficult), never converted into a score. No "X% accurate" anywhere.

Verified (headless Chrome, structural/visual only — same scope as Classes 7-8's entries, not the deeper interaction testing Classes 3-6/9 received):
- All 14 steps across 13 stages render with the expected content: the "not supposed to be perfect" framing and "please don't" list, the six baseline rules, the pre-recording checklist, all five parts (including the Metronome widget rendering its full BPM/beat-light UI and the 5-note pattern chain), the (empty-state) Singing Journey library, all six self-evaluation categories, the five "What I Notice" questions, the nine single-select focus chips, and the progress/completion panels.
- Confirmed the completion panel correctly shows "Almost there" with a **disabled** Mark Complete button when nothing has been recorded yet (the expected gated state, not a bug — an earlier test assertion that expected "Baseline Recording Created" at this point was simply wrong).
- A full-page screenshot confirms the layout matches Classes 3-9's visual language throughout.
- **Regression:** with Classes 1-9 marked complete (a temporary local test script, reverted afterward), Class 10 renders as the current class; with nothing completed — the real default state — Class 10 correctly shows "locked". Classes 1, 3, 5, 7, 8 and 9 (the ones touching the two changed shared components, directly or by proximity) all still render correctly. Home, Classes, Journey, Practice, Progress, Journal, Login and Dashboard all still render with no errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (piano note selection, the metronome's start/stop, record/play on all five parts, the pre-recording checklist, self-assessment chips, the focus chips, the baseline-replace confirm dialog itself), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase (this session has no project credentials) — so the "User A can never reach User B's recordings" requirement is unverified beyond the fact that it relies on the same private-bucket + owner-only RLS policies already in place for Classes 3-9 (migration `0004`), not anything new this class introduces. Treat Class 10 as built and structurally sound, but **not yet interaction-tested** — same caveat as Classes 7 and 8.

### 2026-10-22: interactive Class 8 "Vocal Relaxation" (committed)

New: `js/lessons/vocalRelaxation.js`.
Changed: `js/data.js` (Class 8 content and the `interactive` flag), `js/lessons/registry.js`, `index.html`, `js/components/vocalControl.js` (`ControlCheck.render`/the levels it uses — see below).
No changes to Classes 1–7, 9–10, the shared audio engines, `Store`, `Auth`, or the sync code. **No new migration:** answers and checkpoints go in `class_progress`, notes in `class_notes`, practice in `learner_state`, and optional recordings use the existing `recordings` bucket — same as Classes 3–7/9.

One shared-component change, backward compatible: `ControlCheck.render(id, rows, selected, levels)` now takes an optional 4th `levels` param (defaults to `ControlCheck.LEVELS`, so Class 9's call site — which doesn't pass one — is unaffected). Class 8 passes its own two level sets (a plain Comfortable/Slight tension/Noticeable tension/Not sure scale for the before-check, and a 🙂/😐/😣/Not sure variant for the post-exercise tension map) instead of a new near-duplicate component. Regression-checked: Class 9's tension self-check still renders its original Comfortable/Developing/Needs more practice chips.

Reuse (no new shared systems):
- **Body checks:** `ControlCheck` (Class 9), generalized as above — used twice, before and after the exercises.
- **Pitch exercises:** Class 4's `PitchMatchExercise`/`SelfAssessment` for relaxed vowels (forward and reversed) and the short tension-check pattern — both self-observed, neither scored for pitch accuracy.
- **Recording:** Class 5's `RecordingCard` for humming, the before/after pair, and the spoken/sung phrase.
- **Comparison:** Class 9's `RecordingComparison`, unchanged — its existing "Less tension" option already fit this class.
- **Noticing:** Class 5's `ObservationChecklist` for "what did you notice?" after the tension-check pattern.
- **Base note:** silently inherited from Class 7 (falling back to Class 4), the same chain Class 7/9 use — no new piano picker, since Class 8 isn't about choosing a note.
- **Everything else:** `Timer`, `PersonalNotes`, `ClassProgress`, `ClassActivity`, `LessonKit`. The only lesson-local (non-shared) piece is the "read it, do it, press done" button pattern for shoulder/jaw/tongue awareness — the same shape as Class 7's breathing circle, not a recording and not scored.

Verified (headless Chrome, structural/visual only — same scope as the Class 7 entry below, not the deeper interaction testing Classes 3–6/9 received):
- All 20 steps across 12 stages render with the expected content: the "awareness not force" principle, the before-check and tension-map chip rows (now via the generalized `ControlCheck`), all 7 numbered exercises, the posture callout, the recording-comparison tool, the practice timer, the assignment (built on the before/after takes, not a redundant third recording) with its 7 observations, the 5-question reflection, My Notes, and the progress/completion panels.
- A full-page screenshot confirms the layout matches Classes 3–7/9's visual language throughout, with no broken sections.
- **Regression:** with Classes 1–7 marked complete (a temporary local test script, reverted afterward), Class 8 renders as the current class; with nothing completed — the real default state — Class 8 correctly shows "locked". With Classes 1–8 complete, Class 9 renders correctly and its `ControlCheck` chips still show the original three Class 9 levels, confirming the shared-component change didn't regress it. Home, Classes, Journey, Practice, Progress, Journal, Login and Dashboard all still render with no errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction, no per-exercise click-through (body-check chips, awareness buttons, piano-free note playback, record/play, self-assessment chips, observation checklist, recording-comparison picker), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase (this session has no project credentials). Treat Class 8 as built and structurally sound, but **not yet interaction-tested** — same caveat as Class 7.

### 2026-10-22: interactive Class 7 "Basic Vocal Warm-Up" (committed)

New: `js/lessons/basicVocalWarmup.js`.
Changed: `js/data.js` (Class 7 content and the `interactive` flag), `js/lessons/registry.js`, `index.html`, `css/styles.css` (one new rule: `.breathe-circle` + `@keyframes breatheCycle`).
No changes to Classes 1–6, 8–10, the shared audio engines, `Store`, `Auth`, or the sync code. **No new migration:** answers and checkpoints go in `class_progress`, notes in `class_notes`, practice in `learner_state`, and optional recordings use the existing `recordings` bucket — same as Classes 3–6/9.

Reuse (no new shared systems besides the breathing circle):
- **Piano, pitch exercises:** Class 3's `VirtualPiano`; Class 4's `PitchMatchExercise`/`SelfAssessment` for the glide, vowels and five-note pattern — all self-assessed (Smooth / Mostly smooth / Difficult), none scored for pitch accuracy.
- **Rhythm:** Class 6's `BeatGuide` for articulation (Ma-Me-Mi-Mo / La-Le-Li-Lo) and the one-take guided assignment.
- **Recording:** Class 5's `RecordingCard` for humming, articulation, cool-down and the assignment take.
- **Navigation:** Previous/Next links between exercises reuse `LessonKit.wireStepper`'s existing `[data-stage-link]` click handling — no new wiring.
- **Everything else:** `Timer`, `PersonalNotes`, `ClassProgress`, `ClassActivity`, `LessonKit`.

Verified (headless Chrome, structural/visual only — see "Not verified" below):
- All 11 stages render with the expected content: the "preparation, not a workout" rule box, the pain/discomfort warning, the routine-length choice, all 7 exercises, the practice timer, the 5-item assignment with its guide and 3 observations, the 6-question reflection, My Notes, and the progress/completion panels.
- Full-page screenshots confirm the layout matches Classes 3–6/9's visual language: the breathing circle, piano, pitch-glide and vowel-exercise cards, the five-note pattern's 9-note reference chain, and the Ma/Me/Mi/Mo beat guide all render with no broken layout.
- **Regression:** with Classes 1–6 marked complete (a temporary local test script, reverted afterward), Class 7 renders as the current class; with nothing completed — the real default state — Class 7 correctly shows "locked", same as before this change. Classes 1, 3, 6 and 9, plus Home, Journey, Classes, Practice, Progress, Journal, Login and Dashboard, all still render with no errors. The git diff touched exactly the files listed above.

**Not verified:** no actual microphone/recording interaction (no fake-mic audio was fed in for this session), no per-exercise click-through (piano note selection, record/play, self-assessment chips, routine-length toggle, hum/articulation choice, breathing start/stop), no Node-level logic tests, no real two-account or cross-device run, no mobile touch, no real Supabase (this session has no project credentials). This is lighter verification than Classes 3–6/9 received above — treat Class 7 as built and structurally sound, but **not yet interaction-tested**.

### 2026-10-22: Level 2–8 curriculum realignment (committed)

Changed: `js/data.js` only (`LEVELS[].skills` and the `levelClassDefs` titles for Levels 2–8). No other file touched.

Level 2 "Singer" went from 6 generic placeholder titles (Vocal Technique Foundations, Exploring Your Range, …) to the canonical 10-class list (Vocal Placement → First Performance Assessment). Levels 3, 4, 6 and 7 each picked up classes they were missing (Rhythm for Musicians + Melody Writing; Comping Takes; Saturation + Bus Processing + Stereo Imaging; Dynamics + Reference Tracks), and Level 5/8's titles were reordered to match the canonical list. Total class count: 50 → **60** (see "Full curriculum" in §1 above). No code changes were needed beyond the data: `Store`, `ClassActivity`, achievement and progress math all read `APP_DATA.CLASSES.length` dynamically rather than a hardcoded count.

Verified: headless Chrome confirmed the new titles (e.g. "Vocal Placement", "First Performance Assessment", "Melody Writing", "Comping Takes", "Bus Processing", "Stereo Imaging", "Release Preparation") render correctly on the Classes page; Classes 1 and 3 still render with no errors.

### 2026-10-22: interactive Class 6 "Rhythm & Timing" (committed)

New: `js/components/rhythm.js` and `js/lessons/rhythmAndTiming.js`.
Changed: `js/data.js` (Class 6 content and the `interactive` flag), `js/lessons/registry.js`, `index.html`, `css/styles.css`.
No changes to Classes 3–5, the shared audio engines, `Store` or the sync code. **No new migration:** answers, checkpoints and tap results go in `class_progress`, notes in `class_notes`, practice in `learner_state`, and optional recordings use the private `recordings` bucket.

Reuse:
- **Recording:** Class 5's `RecordingCard`, so `VoiceRecorder` stays the only recording engine.
- **Note choice:** Class 3's `VirtualPiano` (respecting the Class 4 range).
- **Self-checks:** Class 4's `SelfAssessment`.
- **Sound:** `PianoSynth`'s AudioContext and synth.
- **Everything else:** `Timer`, `PersonalNotes`, `ClassProgress`, `ClassActivity`, `LessonKit`, and the page-wide "one sound at a time" signal. The metronome keeps playing while you record, so you can count along.

Verified:
- **TimingAnalysis in Node:** 11/11 cases passed — perfect, 15 ms lag, 90 ms early (rushing), 70 ms late, a gradual drag, ±200 ms jitter, too few taps, double taps, out-of-window taps, 80 BPM, and no taps.
- **Part A, desktop headless Chrome, with taps sent as real pointer events aligned to the audio clock:**
  - "Lesson viewed" is set only after scrolling.
  - Metronome: 80 BPM by default, clicks exactly 0.75 s apart with the accent on every beat 1, and it counts as used after 8 beats. Changing to 120 BPM applies from the next beat. Tap tempo read 79 BPM from 750 ms taps.
  - Exercise 1: taps landed −2 ms from the beat, rated Good and with the beat. Exercise 2 (lights hidden): 90 ms early came out as Developing, rushing.
  - Counting completed 4 bars. Claps came back 4/4 and 8/8. Patterns A and C matched, and a deliberately incomplete B read "2 of 3". D/E unlocked, labelled 1 2 3 4 1 2 3 4.
  - The tempo check flagged rushing at 80 BPM.
- **Part B:**
  - Exercise 6: choosing E4 on the piano made the guide play exactly 8 E4 notes, and none with the guide off.
  - Exercise 7: "Done" stays disabled until a full guided run.
  - The original melody played correctly.
  - The timer logged `{task: "rhythm", category: "Rhythm & Timing", classId: "L1C06"}`.
  - All 5 assignment parts completed. Rhythm Awareness read "Comfortable" from its three stated inputs.
  - Progress reached 100%, with "Class 6 complete", the Class 7 bridge and Continue to Class 7. Class 7 became current.
  - After reload everything was restored.
- **Mobile (390 px, touch):** metronome presets and start/stop work, the TAP pad is 144×144 px, eight real touch taps registered 8/8, and there's no sideways scroll anywhere.
- **Two users across two devices (mock account server):** Alice's Exercise 1 result, reflection answer, note and 3 practice minutes appeared on a fresh "phone". Bob saw Class 6 locked, then 0% with no results, answers, notes or minutes. The server kept separate per-user rows.
- **Regression:**
  - Classes 3–6 open as interactive lessons and Class 7 stays standard.
  - All 19 routes render, and the Class 3 journey passes.
  - The merge, Store, pitch and timing tests pass.
- **Bug found and fixed:** **G6** (the 8-beat patterns re-locked after a reload).

**Not verified:** real phones, Bluetooth audio latency (**G1**), and a real two-account run on the live Supabase (tested against a mock with the same contract).

### 2026-10-21: interactive Class 5 "Listening to Your Own Voice" (committed)

New: `js/components/listening.js` (Waveform, WaveformPlayer, RecordingMarkers, RecordingCard, ListeningPasses, ObservationChecklist) and `js/lessons/listeningToYourVoice.js`.

Changed (all backwards compatible):
- `js/data.js`: Class 5 content and the `interactive` flag.
- `js/lessons/registry.js`.
- `js/audio/pianoSynth.js`: `tone()` glide and `breath()`, for the listening examples.
- `js/audio/voiceRecorder.js`: a page-wide "audio started" signal, so only one thing plays at a time.
- `js/audio/pitchAnalysis.js`: `decode` exported, shared with the waveform.
- `js/components/pitchMatch.js`: a `noEstimate` option.
- `js/components/personalNotes.js`: optional title and rows.
- `js/app.js`: a sync redraw now waits until you stop recording or typing.
- `css/styles.css` and `index.html`.

**No new migration:** markers and answers go in `class_progress`, notes in `class_notes`, and recordings in `learner_state` plus the private `recordings` bucket.

Reuse: recording is still the single `VoiceRecorder` engine, and notes the single `PersonalNotes`/`class_notes` system. The comparison reuses Class 4's `PitchMatchExercise` and its reference note. Practice uses the existing `Timer` and `Store` sessions, the layout uses `LessonKit`, and progress uses `ClassProgress`/`ClassActivity`.

Verified:
- **Full journey, desktop headless Chrome with a WAV fed into the fake microphone:**
  - All 16 steps render, and "lesson viewed" is set only after scrolling.
  - Warm-up: the glide example uses the voice tone, and feedback says "Good observation." both when you heard it and when you didn't.
  - The body-check tip shows for "A bit tense".
  - Baseline: 21 s saved, drawn as a 160-bar waveform labelled "does not show pitch".
  - Listening passes: locked until there's a recording, and unlock in order. Listen 1 completed by real playback to the end.
  - All five observation areas recorded.
  - Waveform: tapping the middle jumped to 00:10, and markers at 00:10 and 00:12 were saved per recording with pins. Section replay 00:02→00:03 stopped exactly at 00:03.
  - The per-recording note was saved under `L1C05:rec-<id>`.
  - Compare had two takes with no estimate. Speaking and singing were both recorded.
  - The timer logged `{task: "ear", category: "Listening / Vocal Awareness", classId: "L1C05"}`.
  - The 31 s song got three marked observations and five answers, and ONE was chosen.
  - Progress was 91% before the reflection and 100% after. The completion panel showed "My ONE thing", the Class 6 bridge and Continue to Class 6, and Class 6 became current.
  - After reload everything was restored, and playback works.
- **Mobile (390 px, touch):** no sideways scroll anywhere. Touch works for record/stop, tap-to-seek, marker chips and adding a marker, and play/pause. A too-short take is honestly flagged. Section-controls wrapping was fixed.
- **Two users across two devices (mock account server):**
  - Alice's waveform, 00:02 marker and pin, per-recording note, class note and observation all appeared on a fresh "phone", and her laptop recording played there.
  - The recording note and class note were stored as separate rows.
  - Bob saw Class 5 locked. After unlocking it he had 0%, no recordings, markers or answers, and **could not fetch Alice's recording file**. The server kept per-user rows.
- **Regression:**
  - All 19 routes render.
  - The Class 3 journey (recording and completion) and the Class 4 journey (estimate "slightly lower", 100%, Continue to Class 5, reload) still pass.
  - The merge, Store and pitch-estimator tests pass (11/11).

**Not verified:** real singing voices, real iPhone/Android hardware (**F5**), and a real two-account run on the live Supabase (the logic was tested against a mock with the same contract).

### 2026-10-21: interactive Class 4 "Matching a Note" (committed)

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

### 2026-10-21: progress on every device (committed)

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

### 2026-10-21: interactive Class 3 "Understanding Pitch" (committed)

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
