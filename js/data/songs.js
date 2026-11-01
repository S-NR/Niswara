/* ============================================================
   SONGS — content for the optional "Song Learning & Application"
   section. Not part of APP_DATA / the Level 1-8 curriculum; see
   docs/superpowers/specs/2026-11-01-song-learning-level-design.md.

   Each entry is a reusable song-lesson template's data: lyrics,
   meaning, rhythm (Tha-Ki-Ta) breakdown, and a reference pitch
   transcription. Adding a future song means appending another
   entry here — no new UI code required.
   ============================================================ */

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
      segments: [
        { start: 0.65, end: 3.16, hz: 454.2, midi: 70, swara: "Sa", western: "A♯4", confidence: "measured", covers: ["Oo", "Na", "n", "na"] },
        { start: 3.20, end: 5.36, hz: 437.5, midi: 69, swara: "Ni (lower)", western: "A4", confidence: "measured", covers: ["Che", "tha", "na"] },
        { start: 5.87, end: 9.24, hz: 378.6, midi: 66, swara: "Pa (lower)", western: "F♯4", confidence: "measured", covers: ["Aa", "gu", "Nee", "a-ni", "ke"] },
        { start: 9.26, end: 10.82, hz: 238.5, midi: 58, swara: "Sa (lower octave)", western: "A♯3", confidence: "measured", covers: ["ta", "na"] },
        { start: 11.05, end: 11.35, hz: 102.9, midi: 43, swara: null, western: null, confidence: "uncertain — likely a breath/vocal-fry tail, not a sung note", covers: [] },
      ],
    },
    practiceAudio: null,
  },
];
