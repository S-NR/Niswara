/* ============================================================
   SONGS — content for the optional "Song Learning & Application"
   section. Not part of APP_DATA / the Level 1-8 curriculum; see
   docs/superpowers/specs/2026-11-01-song-learning-level-design.md.

   Each entry is a reusable song-lesson template's data: lyrics,
   meaning, rhythm (Tha-Ki-Ta) breakdown, and a reference pitch
   transcription. Adding a future song means appending another
   entry here — no new UI code required.
   ============================================================ */

// Per-beat pitches the learner transcribed by ear while reviewing the first draft
// (finer than `reference.segments` below, which are pYIN-measured but only resolve
// 4 broad regions across all 13 sung beats). Kept separate from those segments —
// this is honest, by-ear data, not re-measured audio — and only `swara` names that
// were already confirmed via a measured segment are reused here; a new pitch this
// transcription introduces (G4, E4, D4) gets `swara: null` rather than a guessed name.
const BY_EAR_NOTE = {
  "A#4": { midi: 70, western: "A♯4", swara: "Sa" },
  "A4": { midi: 69, western: "A4", swara: "Ni (lower)" },
  "G4": { midi: 67, western: "G4", swara: null },
  "E4": { midi: 64, western: "E4", swara: null },
  "D4": { midi: 62, western: "D4", swara: null },
  "A#3": { midi: 58, western: "A♯3", swara: "Sa (lower octave)" },
};
function byEarRow(tha, ki, ta) {
  return {
    tha: tha ? { ...BY_EAR_NOTE[tha], confidence: "by ear" } : null,
    ki: ki ? { ...BY_EAR_NOTE[ki], confidence: "by ear" } : null,
    ta: ta ? { ...BY_EAR_NOTE[ta], confidence: "by ear" } : null,
  };
}

window.SONGS = [
  {
    id: "oo-nanna-chetana",
    title: "ಓ ನನ್ನ ಚೇತನ",
    titleTransliteration: "Oo Nanna Chetana",
    language: "Kannada",
    lines: [
      {
        text: "ಓ ನನ್ನ ಚೇತನ",
        transliteration: "Oo nanna chetana",
        rhythm: [
          { tha: "Oo", ki: "–", ta: "–", notes: byEarRow("A#4", "A#4", "A#4") },
          { tha: "Na", ki: "n", ta: "na", notes: byEarRow("A4", "G4", "E4") },
          { tha: "Che", ki: "–", ta: "tha", notes: byEarRow("E4", "G4", "A4") },
          { tha: "na", ki: "–", ta: "–", notes: byEarRow("A4", null, null) },
        ],
      },
      {
        text: "ಆಗು ನೀ ಅನಿಕೇತನ",
        transliteration: "Aagu nee anikethana",
        rhythm: [
          { tha: "Aa", ki: "–", ta: "gu", notes: byEarRow("A4", "A4", "A4") },
          { tha: "Nee", ki: "–", ta: "a-ni", notes: byEarRow("G4", "E4", "D4") },
          { tha: "ke", ki: "–", ta: "ta", notes: byEarRow("E4", "D4", "A#3") },
          { tha: "na", ki: "–", ta: "–", notes: byEarRow("A#3", null, null) },
        ],
      },
    ],
    meaning: {
      wordByWord: [
        { word: "ಓ (Oo)", meaning: "Oh — a vocative call" },
        { word: "ನನ್ನ (nanna)", meaning: "my" },
        { word: "ಚೇತನ (chetana)", meaning: "spirit / inner consciousness / life-force" },
        { word: "ಆಗು (aagu)", meaning: "become" },
        { word: "ನೀ (nee)", meaning: "you" },
        { word: "ಅನಿಕೇತನ (aniketana)", meaning: "without a fixed abode — unbound, not confined to one place (an- \"without\" + niketana \"dwelling\")" },
      ],
      english: "O my inner spirit — become one without a fixed abode, unbound by any border.",
      kannadaPoetic: "ನನ್ನ ಅಂತರಂಗದ ಚೈತನ್ಯವೇ, ಯಾವುದೇ ಗಡಿ ಅಥವಾ ಬಂಧನಕ್ಕೆ ಸೀಮಿತವಾಗದೆ ವಿಶ್ವವ್ಯಾಪಿಯಾಗಿ, ಸ್ವತಂತ್ರವಾಗಿ ಬೆಳೆಯು.",
      context: "The line addresses one's own inner spirit directly, asking it to grow beyond any single place or attachment. It's less a statement than an invocation — an aspiration toward a free, unbounded inner life rather than a description of one already achieved.",
    },
    reference: {
      sourceNote: "Tonic (Sa) taken as the first stable sustained pitch in the uploaded reference recording (≈A♯4, 454 Hz) — a convention for an unaccompanied take, not a measured fact; confirmed with the learner rather than assumed.",
      tonicMidi: 70,
      // melodyNote: a short, honest description of how the melody actually moves, written
      // from the by-ear per-beat data below (`byEarRow`), not from the broader measured
      // segments (which only resolve 4 regions and don't show this shape). Shown on the
      // Melody stage; kept here (not hardcoded in songLessonKit.js) so it travels with the song.
      melodyNote: "Line 1 opens steady on Sa, dips down through a short descending run during “Nanna” (Sa → Ni → a lower G → a lower E), then climbs back up through “Chetana” to settle on Ni rather than returning all the way to Sa — a dip-and-rise shape, not a straight slide down. Line 2 opens on that same Ni and continues the same downward direction through “Aagu Nee anikethana”, with one brief re-attack on “ke”, before settling on Sa a full octave below the opening note for the closing “tana”.",
      segments: [
        { start: 0.65, end: 3.16, hz: 454.2, midi: 70, swara: "Sa", western: "A♯4", confidence: "measured", line: 0, covers: ["Oo", "Na", "n", "na"] },
        { start: 3.20, end: 5.36, hz: 437.5, midi: 69, swara: "Ni (lower)", western: "A4", confidence: "measured", line: 0, covers: ["Che", "tha", "na"] },
        { start: 5.87, end: 9.24, hz: 378.6, midi: 66, swara: "Pa (lower)", western: "F♯4", confidence: "measured", line: 1, covers: ["Aa", "gu", "Nee", "a-ni", "ke"] },
        { start: 9.26, end: 10.82, hz: 238.5, midi: 58, swara: "Sa (lower octave)", western: "A♯3", confidence: "measured", line: 1, covers: ["ta", "na"] },
        { start: 11.05, end: 11.35, hz: 102.9, midi: 43, swara: null, western: null, confidence: "uncertain — likely a breath/vocal-fry tail, not a sung note", line: null, covers: [] },
      ],
    },
    practiceAudio: null,
  },
];
