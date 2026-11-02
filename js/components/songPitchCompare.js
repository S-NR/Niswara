/* ============================================================
   SONG PITCH COMPARE — segment-by-segment pitch comparison for a
   learner's own song recording against a song's reference
   transcription (js/data/songs.js).

   Maps each reference segment's position onto the learner's own
   voiced time span proportionally (computeWindows — pure, no
   audio decoding), then reuses PitchAnalysis.compare per window
   (compareWindows — pure given frames) for the actual pitch
   judgement, including its octave-folding and reliability rules
   unchanged. compareRecording is the only browser-only piece
   (decoding the blob); the comparison math itself has no new
   pitch-detection algorithm.

   Honest by construction: a window with too little clear, steady
   voice reports "unclear" (PitchAnalysis's own reliability check),
   never a guessed verdict. Proportional mapping means this never
   depends on the learner reproducing the reference's own tiny
   internal gaps between syllables — see docs/superpowers/specs/
   2026-11-01-song-learning-level-design.md §8 and the fix-pass
   note in .superpowers/sdd/2026-11-01-song-learning-level/progress.md
   (post-review Critical #1 / Important #2).
   ============================================================ */

const SongPitchCompare = (() => {
  /**
   * Pure. Maps each MEASURED reference segment (swara !== null) onto a
   * window in [frameStart, frameEnd], proportional to its position within
   * the reference's own total measured span.
   * -> [{ refIndex, swara, hz, windowStart, windowEnd }]
   */
  function computeWindows(referenceSegments, frameStart, frameEnd) {
    const measured = referenceSegments.filter((s) => s.swara !== null);
    if (!measured.length) return [];
    const refStart = measured[0].start;
    const refEnd = measured[measured.length - 1].end;
    const refSpan = refEnd - refStart || 1;
    const learnerSpan = frameEnd - frameStart || 1;
    return measured.map((ref) => ({
      refIndex: referenceSegments.indexOf(ref),
      swara: ref.swara,
      hz: ref.hz,
      windowStart: frameStart + ((ref.start - refStart) / refSpan) * learnerSpan,
      windowEnd: frameStart + ((ref.end - refStart) / refSpan) * learnerSpan,
    }));
  }

  /**
   * Pure given frames. frames: [{t, midi}] (PitchAnalysis.analyzeBlob's shape).
   * windows: computeWindows()'s output.
   * -> [{ refIndex, swara, verdict: "close"|"off"|"unclear", cents?, direction? }]
   */
  function compareWindows(frames, windows) {
    return windows.map((w) => {
      const inWin = frames.filter((f) => f.t >= w.windowStart && f.t <= w.windowEnd);
      const voicedSeconds = inWin.length ? inWin[inWin.length - 1].t - inWin[0].t : 0;
      const refMidi = PitchAnalysis.toMidi(w.hz);
      const cmp = PitchAnalysis.compare({ frames: inWin, voicedSeconds }, refMidi, { focus: "all" });
      if (!cmp.reliable) return { refIndex: w.refIndex, swara: w.swara, verdict: "unclear" };
      const verdict = Math.abs(cmp.cents) <= 50 ? "close" : "off";
      return { refIndex: w.refIndex, swara: w.swara, verdict, cents: cmp.cents, direction: cmp.direction };
    });
  }

  /**
   * blob: a recording Blob. song: a SONGS entry. segments: which reference segments to
   * map the recording onto — defaults to the whole song, but a caller comparing a
   * single-line take (which only covers that line's segments) passes a filtered subset,
   * e.g. `song.reference.segments.filter(s => s.line === 0)`, so the proportional
   * mapping isn't stretched across segments the learner never actually sang in that take.
   * Browser-only (needs PitchAnalysis/OfflineAudioContext).
   */
  async function compareRecording(blob, song, segments = song.reference.segments) {
    const analysis = await PitchAnalysis.analyzeBlob(blob);
    if (!analysis.frames.length) {
      return {
        aligned: false, perSegment: [], learnerSpan: 0,
        note: "Couldn't get a clear pitch reading from that recording — it may be too short, quiet, or noisy. Trust your own ears for this one.",
      };
    }
    const frameStart = analysis.frames[0].t;
    const frameEnd = analysis.frames[analysis.frames.length - 1].t;
    const windows = computeWindows(segments, frameStart, frameEnd);
    const perSegment = compareWindows(analysis.frames, windows);
    return { aligned: true, perSegment, learnerSpan: frameEnd - frameStart };
  }

  return { computeWindows, compareWindows, compareRecording };
})();
