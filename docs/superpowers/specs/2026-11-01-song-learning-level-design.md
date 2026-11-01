# Song Learning & Application — Design Spec

_2026-11-01 · Niswara_

## 1. Goal

Add a new, **optional, non-numbered** learning section to Niswara — "Song Learning & Application" — that teaches a learner to understand and sing an actual song, starting with **ಓ ನನ್ನ ಚೇತನ (Oo Nanna Chetana)**. It sits between Foundation and the Singer level in the learner's journey, but is explicitly a bonus area for now, not a required gate.

Built as a **reusable template**: a second song is added later purely as a new data object, with no new UI code.

## 2. Non-goals (explicitly out of scope for this spec)

- Renumbering or otherwise touching Levels 1–8, any existing class id, or any existing learner progress.
- Automated pronunciation or "emotional expression" scoring — these stay self-assessed, same as every existing class, because no real capability for either exists in this codebase and building one is a separate, much larger project.
- A full karaoke player, waveform-synced lyric highlighting beyond what the existing `Waveform`/playback components already support, or any new backend/server-side audio processing. Everything the learner-facing app does happens client-side, same as the rest of Niswara.
- A general-purpose Carnatic transcription tool. The pitch/rhythm analysis built here is specific to comparing a learner's attempt against one pre-computed reference per song — not a standalone "analyze any audio" feature.

## 3. Curriculum positioning

Modeled directly on how the existing **🎤 Warm-up** section already solves this exact problem (optional, non-numbered, sits at a specific point in the journey, has its own independent progress).

- **Not added to `APP_DATA.LEVELS`.** Zero changes to `isLevelUnlocked`, zero changes to any `levelId`, zero risk to Singer's `L2C01`–`L2C17` or any other existing id.
- New top-level route, `#/songs` (list) and `#/songs/:songId` (a song's lesson).
- Appears as its own entry on the Classes page and in navigation, positioned between the Foundation and Singer entries, labeled **"Song Learning & Application"** with an **Optional** badge (same visual treatment as Warm-up's "Common" badge, not a numbered level).
- **Unlocks once Foundation (Level 1) is complete** — `Store.isLevelUnlocked(1)`-equivalent check reused as-is (read-only check against the existing Level 1 completion state; nothing about Level 1 is modified).
- Completing it is **never** required to unlock or progress through Singer. Singer's own unlock trigger (`isLevelUnlocked(2)`, i.e. "all Level 1 classes complete") is untouched.

## 4. Data architecture

### 4.1 `js/data/songs.js` — reusable song data (new file)

One exported array, `SONGS`, of song objects. Content only — no UI logic, matching how `APP_DATA.CLASSES` already separates content from rendering.

```js
{
  id: "oo-nanna-chetana",
  title: "ಓ ನನ್ನ ಚೇತನ",
  titleTransliteration: "Oo Nanna Chetana",
  language: "Kannada",
  lines: [
    {
      text: "ಓ ನನ್ನ ಚೇತನ",
      transliteration: "Oo nanna chetana",
      rhythm: [ // Tha-Ki-Ta grid, exactly as given
        { tha: "Oo", ki: "–", ta: "–" },
        { tha: "Na", ki: "n", ta: "na" },
        { tha: "Che", ki: "–", ta: "–" },
        { tha: "tha", ki: "na", ta: "–" },
      ],
    },
    {
      text: "ಆಗು ನೀ ಅನಿಕೇತನ",
      transliteration: "Aagu nee anikethana",
      rhythm: [
        { tha: "Aa", ki: "–", ta: "gu" },
        { tha: "Nee", ki: "–", ta: "a-ni" },
        { tha: "ke", ki: "–", ta: "ta" },
        { tha: "na", ki: "–", ta: "–" },
      ],
    },
  ],
  meaning: {
    wordByWord: [ /* [{ word, meaning }, ...] */ ],
    english: "O my inner spirit, become one without boundaries.",
    kannadaPoetic: "ನನ್ನ ಅಂತರಂಗದ ಚೈತನ್ಯವೇ, ಯಾವುದೇ ಗಡಿ ಅಥವಾ ಬಂಧನಕ್ಕೆ ಸೀಮಿತವಾಗದೆ ವಿಶ್ವವ್ಯಾಪಿಯಾಗಿ, ಸ್ವತಂತ್ರವಾಗಿ ಬೆಳೆಯು.",
    context: "...",
  },
  reference: {
    sourceNote: "Tonic (Sa) taken as the first stable sustained pitch in the uploaded reference recording (≈A♯4, 454 Hz) — a convention for an unaccompanied take, not a measured fact; confirmed with the learner rather than assumed.",
    tonicMidi: 70, // A#4
    segments: [ // one per real, measured sustained plateau — see §5
      { start: 0.65, end: 3.16, hz: 454.2, midi: 70, swara: "Sa", western: "A♯4", confidence: "measured",
        covers: ["Oo", "Na", "n", "na"] },
      { start: 3.20, end: 5.36, hz: 437.5, midi: 69, swara: "Ni (lower)", western: "A4", confidence: "measured",
        covers: ["Che", "tha", "na"] },
      { start: 5.87, end: 9.24, hz: 378.6, midi: 66, swara: "Pa (lower)", western: "F♯4", confidence: "measured",
        covers: ["Aa", "gu", "Nee", "a-ni", "ke"] },
      { start: 9.26, end: 10.82, hz: 238.5, midi: 58, swara: "Sa (lower octave)", western: "A♯3", confidence: "measured",
        covers: ["ta", "na"] },
      { start: 11.05, end: 11.35, hz: 102.9, midi: 43, swara: null, western: null, confidence: "uncertain — likely a breath/vocal-fry tail, not a sung note",
        covers: [] },
    ],
  },
  practiceAudio: null, // no embedded audio file is shipped; playback uses PianoSynth note approximations, same as every other class
}
```

**On `covers` / syllable-to-segment mapping**: this is a *first-pass, segment-level* transcription, not a syllable-perfect one. The pitch tracker (pYIN, run offline against your uploaded recording) found 3 real sustained plateaus plus one likely-octave-down cadential note; several consecutive syllables genuinely share one measured pitch rather than each having its own. The resulting contour (Sa → Ni → Pa → Sa, an octave down, at the very end) is a musically idiomatic descending phrase, which is a good internal-consistency signal, but it is still a best-effort reading of a short unaccompanied clip, not a verified transcription. Every displayed note carries its `confidence` field, and the UI shows uncertain segments as uncertain rather than asserting them.

### 4.2 `SongLessonKit` (new, modeled on `LessonKit`)

A thin, generic rendering kit — not a new lesson per song. Takes a `SONGS` entry and renders the 8-part flow (§6). Future songs are added by appending to `SONGS`; no new file per song unless a song needs a genuinely different exercise shape.

### 4.3 Progress tracking

New `SongProgress` module (mirrors `Warmup`'s independent `warmup_sessions` pattern, not `ClassActivity`): tracks, per song id, which stages were viewed, the learner's own recordings (via the existing `Media`/private-bucket pattern — same storage, same per-user privacy, same `recordings` bucket), and completion state. No new Supabase table is strictly required for a first version — local-only (`Store`-style per-account localStorage) is enough to ship; a `song_progress` table following the `warmup_sessions` migration's shape can be added later the same way `0005_warmup_sessions.sql` was added after Warm-up's local-only launch.

## 5. The reference transcription, honestly

Full transparency on what was actually done, since Part D of the original request calls musical accuracy the highest priority:

1. Your recording (`1 Nov, 11.10 pm_.m4a`, 11.37s) was decoded and run through **librosa's pYIN** pitch tracker (a standard, peer-reviewed monophonic F0-estimation algorithm) — real signal analysis, not a lookup or a guess.
2. It found 5 voiced regions; 4 look like real sung notes, 1 (the final 0.3s) looks like a breath/vocal-fry artifact and is marked uncertain rather than transcribed.
3. You confirmed the tonic (Sa) convention: the first stable pitch, ≈A♯4.
4. Relative to that Sa, the other 3 real segments measure out to Ni (lower, −1 semitone), Pa (lower, ≈−3 semitones), and Sa an octave down (≈−12 semitones, i.e. the phrase's final cadence) — a Sa→Ni→Pa→Sa(lower) descent, a common and idiomatic shape, lending real plausibility to the reading.
5. **What this is not**: a syllable-by-syllable gamaka transcription. Within each plateau, there may be real pitch movement (ornaments, passing tones) a 3-segment summary can't show. If finer accuracy matters before this ships, the right next step is either a cleaner/longer reference recording, or you listening to the lesson's draft and correcting specific segments — not more automated guessing.

## 6. Lesson flow (Parts A–H → template stages)

| Stage | Spec part | Content |
|---|---|---|
| Understand | A | Lyrics, meaning (word-by-word, English, Kannada poetic line, context) |
| Rhythm | C | Tha-Ki-Ta grid per line, clap/tap practice, slow/normal tempo |
| Pitch | D | The transcription table (§5), Carnatic ⟷ Western toggle |
| Melody | E | Per-line pitch-contour diagram, rise/fall/sustain explanation, Line 1→Line 2 transition note |
| Sustain | F | Sustain/airflow/release guidance + a couple of simple vocal exercises before the song itself |
| Practice | G | The 3 practice modes (§7) |
| Perform | H | Guided full performance: Line 1 → Line 2 → combined → slow → full tempo, with recording |
| Assess | I | The comparison + self-assessment breakdown (§8) |

Part B (choosing a practice phrase) is specific to this song already being chosen — for a single-song v1, Part B becomes a short intro card rather than a picker; the picker UI returns naturally once a second song exists (Part J).

## 7. The 3 practice modes — component reuse

- **Rhythm Practice**: reuses `MetronomeEngine`/`BeatGuide`/tap-pattern components from `js/components/rhythm.js` (Level 1, Class 6), fed the song's own Tha-Ki-Ta grid as the beat pattern instead of a generic click track.
- **Swara Practice**: reuses `VirtualPiano` + `PianoSynth` to play each segment's note; Carnatic/Western labels shown together with a toggle (not two separate modes).
- **Melody Practice**: reuses `PianoSynth.playSequence` (the same helper Classes 15–17 use for melodic patterns) to play each line's segment sequence at a slow vs. normal tempo, building to both lines combined — same mechanism, new data.

## 8. Assessment (Part I) — what's real vs. self-assessed

| Parameter | How |
|---|---|
| Pitch, Swaras, Sustain, Transitions | **Real, automated.** The learner's recording is decoded with the existing `PitchAnalysis.analyzeBlob()` (already shipped, used elsewhere in the app). For each reference segment, `PitchAnalysis.compare(learnerSegment, referenceMidi)` runs — the same honest function Class 4 already uses — giving a per-segment "close / a bit off / couldn't tell" verdict, never a fabricated single score. If the learner's attempt doesn't produce a similar segment structure to the reference (different pausing), the comparison says so rather than forcing a misleading alignment. |
| Rhythm | **Real, automated.** A new small module, `SongTimingCompare`, follows `TimingAnalysis`'s exact statistical approach (nearest-match, median offset in ms) from `js/components/rhythm.js`, but compares the learner's detected segment-onset times against the reference's segment-onset times instead of taps against a fixed grid. |
| Pronunciation, Expression | **Self-assessed.** `SelfAssessment` chips, same component and same honesty posture as every other class — no fabricated detection. |

Overall feedback is a **breakdown**, not a single invented "score out of 100" — consistent with how every other interactive class in this codebase has handled anything it can't measure with certainty.

## 9. New vs. reused components

**New:**
- `js/data/songs.js` — song content.
- `js/lessons/songLessonKit.js` — generic renderer (the "LessonKit for songs").
- `js/pages/songs.js`, `js/pages/songDetail.js` — list + detail pages.
- `js/components/songProgress.js` — independent progress store.
- `js/components/songTimingCompare.js` — the new rhythm-comparison module (§8).
- Router entries for `#/songs` and `#/songs/:id`.
- One Classes-page / nav entry, Optional-badged, between Foundation and Singer.

**Reused, unchanged:**
- `RecordingCard` / `VoiceRecorder` / `Media` (recording, storage, privacy).
- `PitchAnalysis` (pitch estimation and single-note comparison).
- `VirtualPiano` / `PianoSynth` (note playback, swara/melody practice).
- `MetronomeEngine` / `BeatGuide` (rhythm practice).
- `SelfAssessment`, `PersonalNotes` (reflection).
- `Warmup`'s independent-progress-store pattern (as a model, not shared code).

## 10. Testing plan

Same headless-Chrome structural/visual verification used for every class so far (home page clean, nav entry correct, locked/unlocked states, full-page screenshot, zero console errors, clean git diff), plus:
- Confirm Foundation/Singer unlock behavior is provably unchanged (same regression check already run for every class, extended to also re-verify `isLevelUnlocked(1)` and `isLevelUnlocked(2)` logic untouched).
- Confirm the new section is reachable and shows "Optional," not a level number.
- No real microphone/recording interaction, no live pitch-comparison run against an actual learner take (same limitation as every prior class's "not verified" section) — the comparison *logic* can be unit-exercised against the known reference segments and a synthetic sample, but a real end-to-end mic test is out of scope for this pass.

## 11. Known limitations (stated up front, not discovered later)

- The reference transcription is segment-level, not syllable-perfect (§5).
- Segment-order pitch/rhythm comparison can fail to align gracefully if the learner's phrasing differs substantially from the reference — it reports that honestly rather than guessing.
- **The original reference recording is not embedded or shipped anywhere in the app.** It was used once, locally, purely as the source for the offline transcription in §5, and stays only on the developer's machine. All in-lesson pitch/melody reference playback uses `VirtualPiano`/`PianoSynth` note approximations of the transcribed notes — the same honest, non-vocal reference approach every other interactive class already uses — never the learner's or anyone else's actual voice. `practiceAudio: null` in the data schema (§4.1) reflects this deliberately, not as a gap to fill later.
