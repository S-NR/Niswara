/* ============================================================
   SONG TIMING COMPARE — onset-timing comparison for a learner's
   own song recording against a song's reference segment timing.

   Modeled on TimingAnalysis.analyze's statistics (js/components/
   rhythm.js), but matches two freeform timestamp arrays (segment
   start times) instead of taps against a fixed beat grid. Honest
   by construction: a mismatched segment count reports that rather
   than forcing a misleading comparison (same posture as
   SongPitchCompare — see docs/superpowers/specs/
   2026-11-01-song-learning-level-design.md §8).
   ============================================================ */

const SongTimingCompare = (() => {
  function median(arr) {
    if (!arr.length) return NaN;
    const s = arr.slice().sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /** learnerOnsets, referenceOnsets: arrays of seconds (segment start times, both relative to their own first onset). */
  function compare(learnerOnsets, referenceOnsets) {
    if (learnerOnsets.length !== referenceOnsets.length) {
      return {
        aligned: false,
        offsetsMs: [],
        medianAbsMs: null,
        rating: "hard to tell",
        note: "Your attempt had a different number of pauses than the reference, so a timing comparison isn't reliable this time.",
      };
    }
    const offsetsMs = learnerOnsets.map((t, i) => Math.round((t - referenceOnsets[i]) * 1000));
    const medianAbsMs = median(offsetsMs.map(Math.abs));
    const rating = medianAbsMs <= 150 ? "together" : medianAbsMs <= 400 ? "a bit off" : "hard to tell";
    return { aligned: true, offsetsMs, medianAbsMs, rating };
  }

  return { compare };
})();
