/* ============================================================
   SONGS — content for the optional "Song Learning & Application"
   section. Not part of APP_DATA / the Level 1-8 curriculum; see
   docs/superpowers/specs/2026-11-01-song-learning-level-design.md.

   Each entry is a reusable song-lesson template's data: lyrics,
   meaning, rhythm (Tha-Ki-Ta) breakdown, and a reference pitch
   transcription. Adding a future song means appending another
   entry here — no new UI code required.
   ============================================================ */

// By-ear pitches for the song's rhythm, finer than `reference.segments` below (which
// are pYIN-measured from the actual recording but only resolve 4 broad regions across
// all 13 sung beats). Kept separate from those segments — this is honest, by-ear data,
// not re-measured audio — and only `swara` names that were already confirmed via a
// measured segment are reused here; a pitch this transcription introduces on its own
// (G4, E4, D4, C5) gets `swara: null` rather than a guessed Carnatic name.
const BY_EAR_NOTE = {
  "A#4": { midi: 70, western: "A♯4", swara: "Sa" },
  "A4": { midi: 69, western: "A4", swara: "Ni (lower)" },
  "G4": { midi: 67, western: "G4", swara: null },
  "E4": { midi: 64, western: "E4", swara: null },
  "D4": { midi: 62, western: "D4", swara: null },
  "A#3": { midi: 58, western: "A♯3", swara: "Sa (lower octave)" },
  "C5": { midi: 72, western: "C5", swara: null },
};

/**
 * Builds one 3-beat phrase. `cells`: 3 entries of [syllable|null, noteKey|null].
 * A syllable of `null` means this beat has no new lyric at all (the phrase's label
 * carries the text); a noteKey of `null` means "sustain the previous beat's pitch"
 * (a teacher-provided "Sustain" cell) rather than a new, distinct note.
 */
function phrase(label, cells) {
  let lastKey = null;
  const beats = cells.map(([syl, key]) => {
    const resolvedKey = key || lastKey;
    lastKey = resolvedKey;
    const n = BY_EAR_NOTE[resolvedKey];
    return { syl, sustain: !key, midi: n.midi, western: n.western, swara: n.swara, confidence: "by ear" };
  });
  return { label, beats };
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
        // Teacher-provided phrase mapping — each phrase is exactly 3 beats; the 2-beat
        // gap after this line's final phrase is a real musical pause, not missing data.
        phrases: [
          phrase("ಓ", [["Oo", "A#4"], [null, null], [null, null]]),
          phrase("ನನ್ನ", [["Na", "A4"], ["n", "G4"], ["na", "E4"]]),
          phrase("ಚೇತನ", [["Che", "E4"], ["tha", "G4"], ["na", "A4"]]),
          phrase("ನಾ", [["Na", "A4"], [null, null], [null, null]]),
        ],
        gapBeats: 2,
      },
      {
        text: "ಆಗು ನೀ ಅನಿಕೇತನ",
        transliteration: "Aagu nee anikethana",
        phrases: [
          phrase("ಆಗು", [["Aa", "A4"], [null, null], ["Gu", "C5"]]),
          phrase("ನೀ ಅನಿ", [["Nee", "A4"], ["A", "G4"], ["ni", "D4"]]),
          phrase("ಕೆತನ", [["Ke", "E4"], [null, null], ["ta", "A#3"]]),
          phrase("ನಾ", [["Na", "A#3"], [null, null], [null, null]]),
        ],
        gapBeats: 2,
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
      melodyNote: "Line 1 opens steady on Sa, dips down through a short descending run during “Nanna” (Sa → Ni → a lower G → a lower E), then climbs back up through “Chetana” to settle on Ni rather than returning all the way to Sa — a dip-and-rise shape, not a straight slide down. Line 2 opens on that same Ni, lifts briefly to a higher C on “gu”, drops back to Ni on “Nee”, then descends through “anikethana” (with one small re-attack upward on “ke”) before settling on Sa a full octave below the opening note for the closing “tana”.",
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
