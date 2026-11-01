# Song Learning & Application — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, non-numbered "Song Learning & Application" section to Niswara, with its first song class (ಓ ನನ್ನ ಚೇತನ / Oo Nanna Chetana), built on a reusable song-data template so future songs need only new data.

**Architecture:** A new page pair (`#/songs`, `#/songs/:id`) and a generic `SongLessonKit` renderer, driven entirely by data objects in `js/data/songs.js` — mirroring how `LessonKit` + `APP_DATA.CLASSES` already work for ordinary classes. Progress is tracked independently via new `songActivity` state in `Store` (mirroring `classActivity` exactly, but never touching `completedClassIds`/`isLevelUnlocked`). Pitch/rhythm assessment reuses the existing `PitchAnalysis` engine per reference segment, plus a new small comparison module modeled on the existing `TimingAnalysis` shape.

**Tech Stack:** Vanilla JS (buildless), existing `PitchAnalysis`/`VirtualPiano`/`PianoSynth`/`RecordingCard`/`SelfAssessment`/`PersonalNotes` components. No new npm/CDN dependencies. Node's built-in `assert` module is used for the pure-logic unit tests (Tasks 1, 3's core, 4's core) — no test framework is added, since none exists in this project; everything DOM/`Store`-dependent is verified the same way every prior class in this project has been (headless Chrome dump + screenshot), not with a mismatched browser-test framework.

**Spec:** `docs/superpowers/specs/2026-11-01-song-learning-level-design.md`

## Global Constraints

- Never add `"song-..."` ids to `state.completedClassIds` or call `Store.completeClass()` with one — song completion is a separate, local-only flag (spec §3, §4.3).
- Never modify `APP_DATA.LEVELS`, any existing `levelId`, or any existing class's `id`.
- No reference audio file is embedded or shipped anywhere in the repo or built assets (spec §11). All in-lesson pitch/melody playback uses `PianoSynth` note approximations only.
- Tonic (Sa) = MIDI 70 (A♯4), per the user's confirmed convention (spec §5).
- The one segment with `confidence: "uncertain — likely a breath/vocal-fry tail, not a sung note"` must never be rendered as a real transcribed note (`swara`/`western` are `null` for it) — it is shown, if at all, only as an explicit "uncertain" note, never asserted.
- Pronunciation and Expression stay self-assessed (`SelfAssessment` component) — never a fabricated automated score for either (spec §8).
- `index.html` script tags for every new file get the same `?v=20261029a` cache-busting suffix already used throughout the project (check the current value in `index.html` before adding — it may have changed since this plan was written).

## Review Focus

- **A recording with far fewer/more voiced segments than the reference** (e.g. the learner sings the whole phrase as one continuous breath, or pauses mid-word) — the comparison must say it couldn't align cleanly rather than silently mismatching segments to the wrong reference note.
- **`PitchAnalysis.isAvailable === false`** (no `OfflineAudioContext` support) — the pitch/rhythm comparison UI must degrade to "comparison unavailable on this device, here are the self-reflection questions instead," not throw or show nothing.
- **A learner who never records anything** — every stage (including Assess) must still be completable via self-assessment/reflection alone, per the spec's "no part of this should block completion on recording" posture already established by every other class in this codebase.
- **Visiting `#/songs` before Foundation (Level 1) is complete** — must show a locked state consistent with the rest of the app's locked-class presentation, not a broken/empty page.
- **A second song added to `SONGS` later** — `SongLessonKit`/the list page must handle `SONGS.length > 1` correctly even though only one entry exists now (no code assumes exactly one song).

---

## Task 1: Song data — `js/data/songs.js`

**Files:**
- Create: `js/data/songs.js`
- Test: `tests/songs.data.test.js`

**Interfaces:**
- Produces: `window.SONGS` — an array of song objects. Exact shape consumed by Tasks 2–7:
  ```
  {
    id: string, title: string, titleTransliteration: string, language: string,
    lines: [{ text, transliteration, rhythm: [{ tha, ki, ta }, ...4 rows] }, ...2 lines],
    meaning: { wordByWord: [{ word, meaning }], english, kannadaPoetic, context },
    reference: {
      sourceNote: string, tonicMidi: 70,
      segments: [{ start, end, hz, midi, swara, western, confidence, covers: [string] }],
    },
    practiceAudio: null,
  }
  ```

- [ ] **Step 1: Write the failing structural test**

```js
// tests/songs.data.test.js
const assert = require("assert");
global.window = global;
require("../js/data/songs.js");

assert.strictEqual(Array.isArray(SONGS), true, "SONGS must be an array");
assert.strictEqual(SONGS.length, 1, "exactly one song for v1");
const s = SONGS[0];
assert.strictEqual(s.id, "oo-nanna-chetana");
assert.strictEqual(s.lines.length, 2);
assert.strictEqual(s.lines[0].rhythm.length, 4);
assert.strictEqual(s.lines[1].rhythm.length, 4);
assert.strictEqual(s.reference.tonicMidi, 70);
assert.strictEqual(s.reference.segments.length, 5);
const uncertain = s.reference.segments[4];
assert.strictEqual(uncertain.swara, null);
assert.strictEqual(uncertain.western, null);
assert.ok(uncertain.confidence.includes("uncertain"));
const measured = s.reference.segments.slice(0, 4);
measured.forEach((seg) => assert.strictEqual(seg.confidence, "measured"));
assert.strictEqual(s.practiceAudio, null);
console.log("songs.data.test.js: all assertions passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/songs.data.test.js`
Expected: FAIL (`Cannot find module '../js/data/songs.js'`)

- [ ] **Step 3: Implement `js/data/songs.js`**

Export `SONGS` as `window.SONGS = [...]` (matching this project's plain-`<script>`, no-module convention — same pattern `APP_DATA` uses, but as a bare array since there's only one song template, not a nested object). Use exactly these values:

Line 1 rhythm (`lines[0].rhythm`): `[{tha:"Oo",ki:"–",ta:"–"},{tha:"Na",ki:"n",ta:"na"},{tha:"Che",ki:"–",ta:"–"},{tha:"tha",ki:"na",ta:"–"}]`

Line 2 rhythm (`lines[1].rhythm`, the corrected structure): `[{tha:"Aa",ki:"–",ta:"gu"},{tha:"Nee",ki:"–",ta:"a-ni"},{tha:"ke",ki:"–",ta:"ta"},{tha:"na",ki:"–",ta:"–"}]`

`meaning.wordByWord`: `[{word:"ಓ (Oo)",meaning:"Oh — a vocative call"},{word:"ನನ್ನ (nanna)",meaning:"my"},{word:"ಚೇತನ (chetana)",meaning:"spirit / inner consciousness / life-force"},{word:"ಆಗು (aagu)",meaning:"become"},{word:"ನೀ (nee)",meaning:"you"},{word:"ಅನಿಕೇತನ (aniketana)",meaning:"without a fixed abode — unbound, not confined to one place (an- \"without\" + niketana \"dwelling\")"}]`

`meaning.english`: `"O my inner spirit — become one without a fixed abode, unbound by any border."`

`meaning.kannadaPoetic`: the exact line from the spec: `"ನನ್ನ ಅಂತರಂಗದ ಚೈತನ್ಯವೇ, ಯಾವುದೇ ಗಡಿ ಅಥವಾ ಬಂಧನಕ್ಕೆ ಸೀಮಿತವಾಗದೆ ವಿಶ್ವವ್ಯಾಪಿಯಾಗಿ, ಸ್ವತಂತ್ರವಾಗಿ ಬೆಳೆಯು."`

`reference.sourceNote`: the exact sentence from spec §4.1.

`reference.segments` (all 5, exact values from spec §4.1/§5):
```
[
  { start: 0.65, end: 3.16, hz: 454.2, midi: 70, swara: "Sa", western: "A♯4", confidence: "measured", covers: ["Oo","Na","n","na"] },
  { start: 3.20, end: 5.36, hz: 437.5, midi: 69, swara: "Ni (lower)", western: "A4", confidence: "measured", covers: ["Che","tha","na"] },
  { start: 5.87, end: 9.24, hz: 378.6, midi: 66, swara: "Pa (lower)", western: "F♯4", confidence: "measured", covers: ["Aa","gu","Nee","a-ni","ke"] },
  { start: 9.26, end: 10.82, hz: 238.5, midi: 58, swara: "Sa (lower octave)", western: "A♯3", confidence: "measured", covers: ["ta","na"] },
  { start: 11.05, end: 11.35, hz: 102.9, midi: 43, swara: null, western: null, confidence: "uncertain — likely a breath/vocal-fry tail, not a sung note", covers: [] },
]
```

`meaning.context`: implementer writes 2-3 sentences on the emotional/philosophical context (the idea of the inner spirit transcending boundaries), consistent with the Kannada poetic line and English translation above — no further exact wording is pinned.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/songs.data.test.js`
Expected: `songs.data.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add js/data/songs.js tests/songs.data.test.js
git commit -m "feat: add Oo Nanna Chetana song data"
```

---

## Task 2: Independent song progress tracking — `Store` additions + `js/components/songActivity.js`

**Files:**
- Modify: `js/store.js` (add fields/functions, mirroring the existing `classActivity`/`emptyClassActivity`/`getClassActivity`/`setClassActivity` block)
- Create: `js/components/songActivity.js`
- Test: manual verification via headless Chrome (Store is `window`/`localStorage`-coupled; no DOM shim is added for this — see plan header)

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces (for Tasks 5–6 to consume):
  - `Store.emptySongActivity()` → `{ checkpoints: {}, answers: {}, completedAt: null, updatedAt: null }`
  - `Store.getSongActivity(songId)` → merged record (same merge-with-empty pattern as `getClassActivity`)
  - `Store.setSongActivity(songId, record)` → writes + persists locally (same as `setClassActivity`, no remote push)
  - `SongActivity.get(songId)`, `SongActivity.onChange(fn)`, `SongActivity.markCheckpoint(songId, key, value=true)`, `SongActivity.setAnswer(songId, group, key, value)`, `SongActivity.bump(songId, counter)`, `SongActivity.count(songId, counter)`, `SongActivity.markCompleted(songId)` — same signatures as the matching `ClassActivity` functions, **but `markCompleted` only sets `rec.completedAt` locally and never calls `Store.completeClass()`**.
  - Song notes reuse `ClassActivity.loadNote(songId)` / `ClassActivity.saveNote(songId, body)` directly (unchanged — these are already generic/opaque-string-keyed; no new code needed for notes).

- [ ] **Step 1: Add `songActivity` state to `js/store.js`**

In `defaultState()` (near the existing `classActivity:` line), add `songActivity: {},  // per-song progress for Song Learning & Application; local-only, never touches completedClassIds`.

Add `"songActivity"` to the `LOCAL_ONLY_FIELDS` array (next to `"classActivity"`).

- [ ] **Step 2: Add Store accessor functions**

Immediately after `setClassActivity` (store.js:442-445), add:
```js
function emptySongActivity() {
  return { checkpoints: {}, answers: {}, completedAt: null, updatedAt: null };
}
function getSongActivity(songId) {
  const rec = state.songActivity[songId];
  return rec ? { ...emptySongActivity(), ...rec } : emptySongActivity();
}
function setSongActivity(songId, record) {
  state.songActivity[songId] = record;
  writeLocal();
}
```
Add `emptySongActivity, getSongActivity, setSongActivity,` to Store's returned object (near where `getClassActivity, setClassActivity` are exported).

- [ ] **Step 3: Create `js/components/songActivity.js`**

```js
const SongActivity = (() => {
  const listeners = new Set();
  function clone(rec) { return JSON.parse(JSON.stringify(rec)); }
  function get(songId) { return Store.getSongActivity(songId); }
  function emit(songId) {
    const rec = get(songId);
    listeners.forEach((fn) => { try { fn(songId, rec); } catch (e) { console.error(e); } });
  }
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function update(songId, mutate) {
    const rec = clone(get(songId));
    mutate(rec);
    rec.updatedAt = new Date().toISOString();
    Store.setSongActivity(songId, rec);
    emit(songId);
    return rec;
  }
  function markCheckpoint(songId, key, value = true) {
    if (get(songId).checkpoints[key] === value) return get(songId);
    return update(songId, (rec) => { rec.checkpoints[key] = value; });
  }
  function setAnswer(songId, group, key, value) {
    return update(songId, (rec) => { rec.answers[group] = { ...(rec.answers[group] || {}), [key]: value }; });
  }
  function bump(songId, counter) {
    return update(songId, (rec) => {
      rec.answers.counters = rec.answers.counters || {};
      rec.answers.counters[counter] = (rec.answers.counters[counter] || 0) + 1;
    });
  }
  function count(songId, counter) {
    return (get(songId).answers.counters || {})[counter] || 0;
  }
  function markCompleted(songId) {
    return update(songId, (rec) => { rec.completedAt = rec.completedAt || new Date().toISOString(); });
  }
  return { get, onChange, markCheckpoint, setAnswer, bump, count, markCompleted };
})();
```

(Note: `bump`/`count` use a simpler `answers.counters` shape than `ClassActivity`'s `exerciseStats`, since song progress doesn't need per-exercise attempt/accuracy stats — just simple counters, e.g. "recordings made.")

- [ ] **Step 4: Add script tags to `index.html`**

Add `<script src="js/components/songActivity.js?v=...">` right after the existing `js/classActivity.js` tag (same version suffix as neighboring tags). `js/data/songs.js` (Task 1) needs its own tag too — add it near `js/data.js`.

- [ ] **Step 5: Verify via headless Chrome**

Add a temporary debug script (same pattern used for every class so far) that runs:
```js
console.log("songActivity check:", JSON.stringify(SongActivity.markCheckpoint("test-song", "foo", true)));
console.log("completedClassIds unaffected:", JSON.stringify(Store.getState().completedClassIds));
```
Run: `"<chrome>" --headless=new --disable-gpu --no-sandbox --enable-logging=stderr --v=1 --virtual-time-budget=9000 --dump-dom "http://localhost:PORT/index.html#/" 2> out.log`
Expected in `out.log`: `songActivity check: {"checkpoints":{"foo":true},...}` and `completedClassIds unaffected: []` (or whatever it was before — critically, **no `"test-song"` in that array**). Remove the debug script afterward.

- [ ] **Step 6: Commit**

```bash
git add js/store.js js/components/songActivity.js index.html
git commit -m "feat: add independent song progress tracking (Store + SongActivity)"
```

---

## Task 3: Pitch comparison — `js/components/songPitchCompare.js`

**Files:**
- Create: `js/components/songPitchCompare.js`
- Test: `tests/songPitchCompare.test.js`

**Interfaces:**
- Consumes: `PitchAnalysis.analyzeBlob(blob)` → `{frames, duration, voicedSeconds, loudSeconds, peak}` (existing, `js/audio/pitchAnalysis.js`); `PitchAnalysis.compare(analysis, refMidi, opts)` → `{reliable, cents?, octave?, direction?, reason?}` (existing); a song's `reference.segments` (Task 1).
- Produces (for Task 6):
  - `SongPitchCompare.summarize(learnerSegments, referenceSegments)` — **pure, Node-testable.** `learnerSegments: [{midi, voicedSeconds}]` (one entry per detected voiced region in the learner's recording, same order as `referenceSegments`). Returns `{ aligned: boolean, perSegment: [{refIndex, swara, verdict: "close"|"off"|"unclear", cents?, direction?}], note?: string }`. If `learnerSegments.length` differs from the number of **measured** (non-null-swara) reference segments, returns `{aligned: false, perSegment: [], note: "Your attempt had a different number of pauses than the reference, so a segment-by-segment comparison isn't reliable this time."}`.
  - `SongPitchCompare.compareRecording(blob, song)` — **async, browser-only.** Decodes `blob` via `PitchAnalysis`, detects voiced segments from its `frames` (group consecutive frames into segments the same way the offline analysis did: a gap in frame timestamps larger than ~0.3s starts a new segment), computes each segment's median MIDI and start time, calls `summarize()`, and returns `{ ...summarize()'s result, segments: [{start, midi}] }` — the `segments` array (with each detected segment's start time) is exposed so Task 6 can feed it directly to `SongTimingCompare.compare()` as the rhythm-comparison input, **without decoding the same recording a second time**.

- [ ] **Step 1: Write the failing test for `summarize` (the pure core)**

```js
// tests/songPitchCompare.test.js
const assert = require("assert");
global.window = global;
require("../js/components/songPitchCompare.js");

const refSegments = [
  { midi: 70, swara: "Sa" }, { midi: 69, swara: "Ni (lower)" },
  { midi: 66, swara: "Pa (lower)" }, { midi: 58, swara: "Sa (lower octave)" },
  { midi: 43, swara: null }, // uncertain segment — excluded from "measured" count
];

// Case 1: matching segment count, all close
let r = SongPitchCompare.summarize(
  [{ midi: 70.2 }, { midi: 69.1 }, { midi: 66.3 }, { midi: 57.8 }],
  refSegments
);
assert.strictEqual(r.aligned, true);
assert.strictEqual(r.perSegment.length, 4);
r.perSegment.forEach((s) => assert.strictEqual(s.verdict, "close"));

// Case 2: mismatched segment count
r = SongPitchCompare.summarize([{ midi: 70 }, { midi: 69 }], refSegments);
assert.strictEqual(r.aligned, false);
assert.strictEqual(r.perSegment.length, 0);
assert.ok(r.note);

console.log("songPitchCompare.test.js: all assertions passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/songPitchCompare.test.js`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `summarize(learnerSegments, referenceSegments)` in `js/components/songPitchCompare.js`**

Filter `referenceSegments` to those with `swara !== null` → `measured`. If `learnerSegments.length !== measured.length`, return the mismatch shape above. Otherwise, for each pair, compute `cents = Math.round((learnerSegments[i].midi - measured[i].midi) * 100)`; `verdict = Math.abs(cents) <= 50 ? "close" : "off"`; `direction = cents < 0 ? "below" : cents > 0 ? "above" : "near"`. A learner segment with no usable `midi` (undefined/NaN) gets `verdict: "unclear"` instead of computing cents.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/songPitchCompare.test.js`
Expected: `songPitchCompare.test.js: all assertions passed`

- [ ] **Step 5: Implement `compareRecording(blob, song)` (browser-only glue, no Node test)**

```js
async function compareRecording(blob, song) {
  const analysis = await PitchAnalysis.analyzeBlob(blob);
  // group analysis.frames into segments: a gap > 0.3s between consecutive frame timestamps starts a new segment
  // for each segment, record { start: firstFrame.t, midi: median of that segment's frame.midi values }
  const result = summarize(segments.map((s) => ({ midi: s.midi })), song.reference.segments);
  return { ...result, segments }; // segments (with .start) is reused by Task 6 for rhythm comparison
}
```
One line on the median: reuse the same `median()` helper approach already present in `pitchAnalysis.js` (a small local copy is fine — this file doesn't import from that one).

- [ ] **Step 6: Verify `compareRecording` via headless Chrome**

Add a temporary debug script that calls `PitchAnalysis.isAvailable` and logs it, plus confirms `SongPitchCompare.compareRecording` is defined and callable (don't attempt a real microphone recording — no mic access in headless Chrome). Confirm zero console errors on page load with the new script tag present.

- [ ] **Step 7: Add script tag and commit**

```bash
git add js/components/songPitchCompare.js tests/songPitchCompare.test.js index.html
git commit -m "feat: add segment-based pitch comparison for song recordings"
```

---

## Task 4: Rhythm comparison — `js/components/songTimingCompare.js`

**Files:**
- Create: `js/components/songTimingCompare.js`
- Test: `tests/songTimingCompare.test.js`

**Interfaces:**
- Produces: `SongTimingCompare.compare(learnerOnsets, referenceOnsets)` — **pure, Node-testable.** Both args are arrays of seconds (segment start times). Modeled on `TimingAnalysis.analyze`'s shape (`js/components/rhythm.js:289`) but matching two freeform timestamp arrays instead of taps-against-a-fixed-grid. Returns `{ aligned: boolean, offsetsMs: number[], medianAbsMs: number|null, rating: "together"|"a bit off"|"hard to tell", note?: string }`. If `learnerOnsets.length !== referenceOnsets.length`, `aligned: false` with an explanatory `note`, same honesty posture as Task 3. (No separate onset-detection glue is needed here — Task 6 gets the learner's segment start times from `SongPitchCompare.compareRecording`'s returned `.segments`, computed once from the same decoded recording, rather than decoding it a second time.)

- [ ] **Step 1: Write the failing test**

```js
// tests/songTimingCompare.test.js
const assert = require("assert");
global.window = global;
require("../js/components/songTimingCompare.js");

const ref = [0.65, 3.20, 5.87, 9.26]; // reference segment starts, normalized so first = 0 before comparing
// normalize both to start at 0 (a learner's take won't start at the same wall-clock offset)
const toRelative = (arr) => arr.map((t) => t - arr[0]);

let r = SongTimingCompare.compare(toRelative([0.70, 3.30, 5.95, 9.40]), toRelative(ref));
assert.strictEqual(r.aligned, true);
assert.strictEqual(r.offsetsMs.length, 4);
assert.ok(["together", "a bit off"].includes(r.rating));

r = SongTimingCompare.compare(toRelative([0.70, 3.30]), toRelative(ref));
assert.strictEqual(r.aligned, false);
assert.ok(r.note);

console.log("songTimingCompare.test.js: all assertions passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/songTimingCompare.test.js`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `compare(learnerOnsets, referenceOnsets)`**

If lengths differ, return the mismatch shape. Otherwise `offsetsMs = learnerOnsets.map((t, i) => Math.round((t - referenceOnsets[i]) * 1000))`; `medianAbsMs` = median of `offsetsMs.map(Math.abs)` (reuse a small local median helper, same pattern as Task 3); `rating = medianAbsMs <= 150 ? "together" : medianAbsMs <= 400 ? "a bit off" : "hard to tell"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/songTimingCompare.test.js`
Expected: `songTimingCompare.test.js: all assertions passed`

- [ ] **Step 5: Add the script tag to `index.html`** (same version suffix as neighboring tags).

- [ ] **Step 6: Verify via headless Chrome** — confirm zero console errors on page load with the new script tag present (this module has no UI yet to exercise beyond load-time).

- [ ] **Step 7: Commit**

```bash
git add js/components/songTimingCompare.js tests/songTimingCompare.test.js index.html
git commit -m "feat: add onset-timing comparison for song recordings"
```

---

## Task 5: `SongLessonKit` — teaching stages (Understand, Rhythm, Pitch, Melody, Sustain, Practice)

**Files:**
- Create: `js/lessons/songLessonKit.js`

**Interfaces:**
- Consumes: `SONGS` (Task 1), `SongActivity` (Task 2), `LessonKit` (existing, for `header`/`stepper`/`chapter`/`p`/`narrow` reuse — same helpers every class already uses), `VirtualPiano`/`PianoSynth` (existing), `RecordingCard` (existing), `MetronomeEngine`/`BeatGuide` (existing, `js/components/rhythm.js`).
- Produces (for Task 6 and Task 7): `SongLessonKit.render(song, status)` → HTML string; `SongLessonKit.mount(container, song, params)` → cleanup function. Same `render`/`mount` shape as every other lesson module in `js/lessons/registry.js`, but keyed by `song.id` instead of a class id, and **never registered in `InteractiveLessons`** (it's wired directly by `js/pages/songDetail.js`, Task 7, not through the class-detail routing path).

- [ ] **Step 1: Build the stage list and stepper**

`STAGES = [understand, rhythm, pitch, melody, sustain, practice, perform, assess]` (8 entries, matching spec §6's table). Reuse `LessonKit.stepper(STAGES, {...song, number: null})`-style call — check `LessonKit.stepper`'s actual signature first (it currently takes a `cls` with `.number`; confirm whether it needs adaptation or already tolerates a song-shaped object with `id`/`title` and no `number`/`levelId`). If it requires `number`/`levelId`, pass a minimal stand-in object rather than modifying `LessonKit` itself (Task 5 must not change shared `LessonKit` behavior for existing classes).

- [ ] **Step 2: Render Understand stage** — a short intro card first (song title in Kannada + transliteration, one line noting this is the first song in this optional section — this stands in for the original spec's Part B "choose a practice song" step, which has nothing to choose yet with only one song; the picker UI returns once `SONGS.length > 1`), then lyrics (both lines, Kannada + transliteration), `meaning.wordByWord` table, `meaning.english`, `meaning.kannadaPoetic`, `meaning.context`.

- [ ] **Step 3: Render Rhythm stage** — both lines' Tha-Ki-Ta grids as tables; reuse `MetronomeEngine`/`BeatGuide` (from `js/components/rhythm.js`) for clap/tap practice and slow/normal tempo, fed the song's own rhythm grid instead of a generic click pattern. One line on adapting it: `BeatGuide` currently expects a generic beat pattern config — pass the Tha-Ki-Ta row count as the pattern length, syllables as labels.

- [ ] **Step 4: Render Pitch stage** — the `reference.segments` transcription table (lyrics / swara / western / duration / confidence columns), with a Carnatic⟷Western toggle (two label sets on the same table, toggled via a button, not two separate tables).

- [ ] **Step 5: Render Melody stage** — a simple pitch-contour visualization (segment sequence as a row of chips sized/positioned by relative pitch, reusing the visual language of `flowStrip`-style chip rows already used in Classes 12/17), plus the Line 1→Line 2 transition note (prose, implementer-written, consistent with spec §6).

- [ ] **Step 6: Render Sustain stage** — prose guidance (airflow, release, pronunciation-without-disturbing-melody) plus 1-2 simple vocal exercises, following the same tone/format as every other class's "preparation" sections (e.g. Class 17's Part B).

- [ ] **Step 7: Render Practice stage — 3 modes** — Rhythm Practice (Step 3's components, reusable here), Swara Practice (`VirtualPiano`/`PianoSynth.play` per segment's `midi`, Carnatic/Western label toggle), Melody Practice (`PianoSynth.playSequence` of each line's segment `midi` values, then both lines combined, slow vs. normal tempo — same `duration`/`gap` pattern Classes 15-17 use).

- [ ] **Step 8: Wire `SongActivity` checkpoints for stages viewed**, same `wireViewedSentinel`-equivalent pattern every class uses (reuse `LessonKit.wireViewedSentinel` directly — it takes a generic callback, not class-specific).

- [ ] **Step 9: Verify via headless Chrome** — dump `#/songs/oo-nanna-chetana` (once Task 7 wires routing; if Task 7 isn't done yet, verify by temporarily calling `SongLessonKit.render(SONGS[0], "available")` from a debug script and checking the output string contains expected markers: both lines' Kannada text, all 4 Tha-Ki-Ta rows per line, the 4 measured segments' swara names, zero console errors).

- [ ] **Step 10: Commit**

```bash
git add js/lessons/songLessonKit.js index.html
git commit -m "feat: add SongLessonKit teaching stages (understand through practice)"
```

---

## Task 6: `SongLessonKit` — Perform and Assess stages, completion flow

**Files:**
- Modify: `js/lessons/songLessonKit.js` (adds to the module built in Task 5)

**Interfaces:**
- Consumes: `RecordingCard`/`VoiceRecorder` (existing), `SongPitchCompare.compareRecording` (Task 3), `SongTimingCompare.compare` + `detectOnsets` (Task 4), `SelfAssessment` (existing), `PersonalNotes` (existing, called with `classId: song.id` to reuse `ClassActivity.loadNote`/`saveNote` directly — per spec §4.3, no new notes code needed), `SongActivity.markCompleted` (Task 2).

- [ ] **Step 1: Render Perform stage** — guided recording flow: Line 1 → Line 2 → combined → slow tempo → full tempo, each a `RecordingCard` instance (same `RecordingCard.render`/`.wire` pattern every class uses), stored via `SongActivity.setAnswer(song.id, "recs", key, take)` + `SongActivity.bump(song.id, "recordings")`.

- [ ] **Step 2: Render Assess stage — real comparison** — a "Compare my attempt" button next to the Perform stage's combined-take recording; on click, calls `SongPitchCompare.compareRecording(blob, song)` and `SongTimingCompare.compare(SongTimingCompare.detectOnsets(frames), referenceOnsets)`, renders the per-segment verdicts as a small table (swara / your pitch / verdict), and the rhythm rating — using the exact wording patterns `PitchAnalysis.describe()` already establishes (close/off/unclear, never a numeric "score"). If `PitchAnalysis.isAvailable` is `false`, show "Comparison isn't available on this device" instead of attempting it, and hide/disable the "Compare my attempt" button entirely (Review Focus item 2).

- [ ] **Step 3: Render Assess stage — self-assessment** — `SelfAssessment` chips for Pronunciation and Expression only (2 questions, per spec §8 — not the 5-7 question sets used elsewhere; these two are the ones with no automated measurement).

- [ ] **Step 4: Completion** — a checklist (self-authored, mirroring every other class's `PRE_CHECK_ITEMS`-style pattern: "I understand the meaning," "I tried the rhythm practice, or chose to skip," "I explored the pitch/swara information," "I attempted singing at least one line, or chose to skip," "I reflected on my practice, or chose not to" — 5 items, none gated on recording or the comparison engine succeeding). On complete: `SongActivity.markCompleted(song.id)` — **never** `Store.completeClass()`.

- [ ] **Step 5: Verify via headless Chrome** — same debug-script approach as Task 5 Step 9, confirming:
  - The Perform/Assess stages render and the checklist is present.
  - **Completion without any recording** (Review Focus item 3): with no recordings made and no comparison run, confirm the 5-item checklist alone is sufficient to enable the "Complete" button (tick all 5 via a debug script, confirm the button is not disabled).
  - **The `isAvailable: false` fallback** (Review Focus item 2): temporarily monkey-patch `PitchAnalysis.isAvailable = false` before mounting the Assess stage (real browsers support `OfflineAudioContext` broadly, so this path needs to be forced rather than naturally triggered), confirm the "Comparison isn't available on this device" text renders and the "Compare my attempt" button is hidden/disabled, then restore `PitchAnalysis.isAvailable`.
  - Completing the lesson doesn't add anything to `Store.getState().completedClassIds` (same check as Task 2 Step 5).

- [ ] **Step 6: Commit**

```bash
git add js/lessons/songLessonKit.js
git commit -m "feat: add SongLessonKit perform/assess stages with real pitch+rhythm comparison"
```

---

## Task 7: Pages, routing, and the Optional nav entry

**Files:**
- Create: `js/pages/songs.js` (list page)
- Create: `js/pages/songDetail.js` (detail page — thin wrapper delegating to `SongLessonKit`)
- Modify: `js/router.js` (add `#/songs` and `#/songs/:id` routes — check the existing route-table shape first and match it exactly)
- Modify: whichever file renders the Classes-page section list / main nav (identify by reading `js/pages/classes.js` and the nav-rendering code in `js/components.js` before writing this task's actual diff — do not guess the insertion point)
- Modify: `index.html` (script tags for `songs.js`, `songDetail.js`)

**Interfaces:**
- Consumes: `SongLessonKit.render`/`.mount` (Task 6), `SONGS` (Task 1), `Store.isLevelUnlocked(1)` (existing, read-only).
- Produces: nothing new consumed by later tasks (this is the outermost integration layer).

- [ ] **Step 1: Read `js/router.js`'s route table and `js/pages/classes.js` + the nav components to find the exact insertion points** — this step is research, not a guess; note the exact line numbers/patterns found before writing Steps 2-4.

- [ ] **Step 2: Implement `js/pages/songs.js`** — list page: if `!Store.isLevelUnlocked(1)`, show a locked state matching the existing locked-class presentation (reuse `Components.EmptyState` the way `classDetail.js` already does for locked classes). Otherwise list `SONGS` (currently 1 entry) as cards linking to `#/songs/:id`.

- [ ] **Step 3: Implement `js/pages/songDetail.js`** — look up the song by `params.id` in `SONGS`; if not found, reuse the existing not-found/empty-state pattern. Otherwise call `SongLessonKit.render(song, status)` / `.mount(container, song, params)`, where `status` is derived from `SongActivity.get(song.id).completedAt` (`"completed"` or `"available"` — no `"locked"`/`"current"` distinction needed within the song itself, only the list page gates on Level 1).

- [ ] **Step 4: Add router entries** for `#/songs` → `SongsPage`, `#/songs/:id` → `SongDetailPage`, matching the existing route-table's exact syntax (found in Step 1).

- [ ] **Step 5: Add the nav/Classes-page entry** — "Song Learning & Application," **Optional** badge (not a level number), positioned between the Foundation and Singer sections, linking to `#/songs`. Exact insertion point and markup pattern per Step 1's findings — mirror the Warm-up entry's badge styling if a reusable class/pattern exists for it.

- [ ] **Step 6: Add script tags to `index.html`** (`js/pages/songs.js`, `js/pages/songDetail.js`, same version suffix as neighboring tags).

- [ ] **Step 7: Verify via headless Chrome**
  - Dump `#/songs` with Level 1 incomplete (temporary debug script clearing `completedClassIds`, or a fresh unlock state) → expect a locked state, zero console errors.
  - Dump `#/songs` with Level 1 complete (existing debug-unlock pattern, Classes 1-25 only — **do not** unlock any Level 2/Singer classes for this check, to additionally prove the new section doesn't depend on Singer) → expect the song card, zero console errors.
  - Dump `#/songs/oo-nanna-chetana` → expect all 8 stages present (grep for each stage's heading), zero console errors.
  - Dump `#/classes` → expect "Song Learning & Application" with an "Optional" marker, positioned between the Foundation and Singer level sections, and confirm Singer's own entry/classes are rendered completely unchanged (diff against a dump taken before this task, if convenient, or re-check a few known strings like "LEVEL 2 · CLASS 01" / "Voice Placement" still present and unaffected).
  - **Multiple songs** (Review Focus item 5): temporarily push a second synthetic entry onto `SONGS` via a debug script (e.g. `SONGS.push({...SONGS[0], id: "test-song-2", title: "Test Song 2"})`), dump `#/songs`, confirm **2** song cards render (not 1, not a crash), then remove the pushed entry before continuing.
  - Full-page screenshot of `#/songs/oo-nanna-chetana`.
  - Remove any temporary debug scripts afterward.

- [ ] **Step 8: Commit**

```bash
git add js/pages/songs.js js/pages/songDetail.js js/router.js index.html <nav-file-from-step-1>
git commit -m "feat: add Song Learning & Application pages, routing, and nav entry"
```

---

## Task 8: Full regression sweep, documentation, final verification

**Files:**
- Modify: `PROJECT_SUMMARY.md` (same documentation convention followed for every class in this project: architecture tree entry, a feature-status row, a Change Log entry)

- [ ] **Step 1: Regression-verify Level 1 and Singer are completely unaffected**
  - Headless-Chrome dump of a known Singer class (e.g. `#/classes/L2C01`) — confirm it renders exactly as before (same stage count, same recordings, zero console errors).
  - Confirm `isLevelUnlocked(2)` (Singer's own unlock check) still only depends on Level 1's classes — read `js/store.js`'s `isLevelUnlocked` after all edits and confirm Task 2 didn't touch it at all (it shouldn't have — this is a pure "did I accidentally touch the wrong function" check).
  - Confirm `state.completedClassIds` never contains a `"song-..."`/`"oo-nanna-chetana"`-shaped id after completing the song lesson end-to-end via a debug script (`SongActivity.markCompleted("oo-nanna-chetana")` then re-check `Store.getState().completedClassIds`).

- [ ] **Step 2: Confirm the full `node` test suite still passes**

Run: `node tests/songs.data.test.js && node tests/songPitchCompare.test.js && node tests/songTimingCompare.test.js`
Expected: all three print their "all assertions passed" line.

- [ ] **Step 3: Update `PROJECT_SUMMARY.md`**
  - Architecture tree: add entries for the new files under a new "Song Learning & Application (optional, non-numbered)" heading, separate from the Level 1/Level 2 lesson file lists.
  - A new row in the feature-status table (same style as every class's row), describing the section, its template/reuse design, and the honest pitch/rhythm comparison approach.
  - A new Change Log entry at the top, following the exact established format (New/Changed files, design rationale, reuse list, verification results, "Not verified" caveats) — explicitly note this is the first entry outside the Level 1/Level 2 numbered sequence, and link to the design spec (`docs/superpowers/specs/2026-11-01-song-learning-level-design.md`) and this plan.

- [ ] **Step 4: Final clean diff check**

Run: `git status --short`
Expected: only the files this plan's tasks touched; no stray debug scripts left in `index.html`; no `*.m4a` file staged (confirm `.gitignore`'s `*.m4a` entry, added during brainstorming, is itself committed as part of this task if not already).

- [ ] **Step 5: Commit**

```bash
git add PROJECT_SUMMARY.md .gitignore
git commit -m "docs: document Song Learning & Application section"
```
