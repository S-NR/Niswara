/* ============================================================
   SONG PITCH COMPARE — segment-by-segment pitch comparison for a
   learner's own song recording against a song's reference
   transcription (js/data/songs.js).

   Reuses PitchAnalysis (js/audio/pitchAnalysis.js) for decoding
   and per-note comparison; adds no new pitch-detection algorithm
   of its own. Honest by construction: if the learner's recording
   doesn't produce the same number of voiced segments as the
   reference, the comparison says so rather than forcing a
   misleading alignment (see docs/superpowers/specs/
   2026-11-01-song-learning-level-design.md §8).
   ============================================================ */

const SongPitchCompare = (() => {
  function median(arr) {
    if (!arr.length) return NaN;
    const s = arr.slice().sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /** learnerSegments: [{midi}], referenceSegments: song.reference.segments. */
  function summarize(learnerSegments, referenceSegments) {
    const measured = referenceSegments.filter((s) => s.swara !== null);
    if (learnerSegments.length !== measured.length) {
      return {
        aligned: false,
        perSegment: [],
        note: "Your attempt had a different number of pauses than the reference, so a segment-by-segment comparison isn't reliable this time.",
      };
    }
    const perSegment = measured.map((ref, i) => {
      const learnerMidi = learnerSegments[i].midi;
      if (typeof learnerMidi !== "number" || Number.isNaN(learnerMidi)) {
        return { refIndex: i, swara: ref.swara, verdict: "unclear" };
      }
      const cents = Math.round((learnerMidi - ref.midi) * 100);
      const verdict = Math.abs(cents) <= 50 ? "close" : "off";
      const direction = cents < 0 ? "below" : cents > 0 ? "above" : "near";
      return { refIndex: i, swara: ref.swara, verdict, cents, direction };
    });
    return { aligned: true, perSegment };
  }

  /** blob: a recording Blob. song: a SONGS entry. Browser-only (needs PitchAnalysis/OfflineAudioContext). */
  async function compareRecording(blob, song) {
    const analysis = await PitchAnalysis.analyzeBlob(blob);
    const GAP = 0.3;
    const segments = [];
    let current = null;
    analysis.frames.forEach((f) => {
      if (!current || f.t - current.lastT > GAP) {
        current = { start: f.t, lastT: f.t, midis: [f.midi] };
        segments.push(current);
      } else {
        current.lastT = f.t;
        current.midis.push(f.midi);
      }
    });
    const resolved = segments.map((s) => ({ start: s.start, midi: median(s.midis) }));
    const result = summarize(resolved.map((s) => ({ midi: s.midi })), song.reference.segments);
    return { ...result, segments: resolved };
  }

  return { summarize, compareRecording };
})();
