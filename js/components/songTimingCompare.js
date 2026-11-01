/* ============================================================
   SONG TIMING COMPARE — overall-pace comparison for a learner's
   own song recording against a song's reference segment timing.

   Originally matched onset-by-onset against the reference (modeled
   on TimingAnalysis's statistics), but that requires the learner's
   recording to independently segment into the same COUNT of voiced
   regions as the reference — which SongPitchCompare's own
   time-proportional window mapping (see that file's fix-pass note)
   no longer produces or needs. Comparing overall pace instead is
   simpler, always computable, and still honest: it reports how the
   learner's total voiced duration compares to the reference's own
   measured span, never a fabricated beat-by-beat verdict.
   ============================================================ */

const SongTimingCompare = (() => {
  /** learnerSpanSeconds, referenceSpanSeconds: both > 0 expected; a zero/missing reference span is reported as "hard to tell". */
  function compare(learnerSpanSeconds, referenceSpanSeconds) {
    if (!referenceSpanSeconds || !learnerSpanSeconds) {
      return { ratio: null, rating: "hard to tell" };
    }
    const ratio = learnerSpanSeconds / referenceSpanSeconds;
    const rating = ratio < 0.8 ? "faster than the reference" : ratio > 1.25 ? "slower than the reference" : "about the same pace as the reference";
    return { ratio: Math.round(ratio * 100) / 100, rating };
  }

  return { compare };
})();
