/* ============================================================
   PITCH STABILITY — reusable parts for "find the note, then stay
   with it" (Class 12 first; later sustained notes and melodies).

     PitchStability     an educational estimate of how a held note
                        moved: where it sat (near / slightly higher /
                        slightly lower), how much it moved, and
                        whether it drifted toward the end. Words only
                        — never a percentage or a score.
     PitchVisualizer    the beginner picture: a reference line, and
                        (when the estimate is trustworthy) the
                        Class 4 PitchGuide trace labelled
                        "Estimated pitch".
     StabilityPanel     "Listen first. Look second.": stays closed
                        until the learner has judged the take by ear,
                        then reveals the estimate on request.

   Built on PitchAnalysis (YIN, Class 4). Honesty rules:
   - Silence, very soft or very short singing, background noise /
     breathiness and wildly moving takes all HIDE the trace and say
     why, instead of drawing misleading data.
   - The first moments of a note (the natural "scoop" onto it) and
     the release are left out of the steadiness estimate.
   - Small natural movement is described as normal.
   Exercise mapping (js/lessons/pitchStability.js): SustainedNote /
   VowelPitch / BreathPitch / PitchTransition exercises are
   PitchMatchExercise configs (Class 4 engine) + a StabilityPanel.
   ============================================================ */

const PitchStability = (() => {
  const ONSET = 0.2, RELEASE = 0.1;  // seconds left out at the start and end of a held note
  const MIN_FRAMES = 15, MIN_VOICED = 0.6;
  const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const quantile = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

  /** Can this analysis be shown at all? -> null (yes) or a reason. */
  function unusable(analysis) {
    if (!analysis || analysis.peak < 0.004 || (analysis.loudSeconds || 0) < 0.15) return "silent";
    if (analysis.loudSeconds > 0.5 && analysis.voicedSeconds / analysis.loudSeconds < 0.35) return "noisy"; // plenty of sound, little clear pitch
    if (analysis.frames.length < MIN_FRAMES || analysis.voicedSeconds < MIN_VOICED) return "soft";
    return null;
  }

  /**
   * One held note vs its reference.
   * -> { reliable: false, reason } | { reliable: true, octave, cents, spread, drift, position, steadiness, trend }
   */
  function assess(analysis, refMidi) {
    const bad = unusable(analysis);
    if (bad) return { reliable: false, reason: bad };
    const f = analysis.frames;
    const t0 = f[0].t + ONSET, t1 = f[f.length - 1].t - RELEASE;
    const body = f.filter((x) => x.t >= t0 && x.t <= t1);
    const use = body.length >= MIN_FRAMES ? body : f;
    const octave = Math.round((median(use.map((x) => x.midi)) - refMidi) / 12);
    const cents = use.map((x) => (x.midi - 12 * octave - refMidi) * 100);
    const spread = quantile(cents, 0.75) - quantile(cents, 0.25);
    if (spread > 250) return { reliable: false, reason: "unsteady" };
    const mid = median(cents);
    // Drift needs enough held note to compare its first and last parts honestly
    let drift = null;
    const span = use[use.length - 1].t - use[0].t;
    if (span >= 1.5) {
      const n = Math.max(4, Math.floor(use.length * 0.3));
      drift = median(cents.slice(-n)) - median(cents.slice(0, n));
    }
    return {
      reliable: true, octave, cents: Math.round(mid), spread: Math.round(spread), drift: drift === null ? null : Math.round(drift),
      position: Math.abs(mid) <= 30 ? "near" : mid > 0 ? (mid <= 100 ? "slightlyHigh" : "high") : (mid >= -100 ? "slightlyLow" : "low"),
      steadiness: spread <= 30 ? "steady" : spread <= 70 ? "mostly" : "moving",
      trend: drift === null || Math.abs(drift) < 40 ? "level" : drift < 0 ? "fell" : "rose",
    };
  }

  /** Several notes (a pattern): only whether a trace can be shown, and its octave. */
  function assessChain(analysis, refMidis) {
    const bad = unusable(analysis);
    if (bad) return { reliable: false, reason: bad };
    const mid = median(refMidis);
    return { reliable: true, octave: Math.round((median(analysis.frames.map((x) => x.midi)) - mid) / 12) };
  }

  const REASONS = {
    silent: "We didn't pick up a clear sound in this take. Check that the microphone is allowed and not muted, sing a little closer to it, then try again.",
    soft: "There wasn't enough clear singing to estimate — the take may have been very soft, very short, or far from the microphone. That's fine: your ears are the guide for this one.",
    noisy: "There was a lot of sound that wasn't a clear sung note (background noise, breathiness or other sounds), so the estimate is hidden rather than guessing.",
    unsteady: "The pitch moved around too much to summarise honestly. Trust your ears — and try a shorter note at a softer, comfortable volume.",
  };

  /** Beginner sentences for assess(). */
  function describe(res) {
    if (!res.reliable) return [REASONS[res.reason] || REASONS.soft];
    const lines = [];
    lines.push({
      near: "Your note sat close to the reference.",
      slightlyHigh: "⬆️ Your note sat slightly higher (a little sharp) than the reference.",
      slightlyLow: "⬇️ Your note sat slightly lower (a little flat) than the reference.",
      high: "⬆️ Your note sat higher than the reference — play it again and gently aim a little lower.",
      low: "⬇️ Your note sat lower than the reference — play it again and gently aim a little higher.",
    }[res.position]);
    lines.push({
      steady: "It stayed fairly steady once it settled.",
      mostly: "It was mostly steady, with small natural movement — that's normal in a human voice.",
      moving: "↕️ It moved around the note a little. A shorter note at a comfortable volume often helps.",
    }[res.steadiness]);
    if (res.trend === "fell") lines.push("Toward the end it drifted a little lower — often a sign the note was long for a comfortable breath. Try a shorter note (not a bigger breath).");
    if (res.trend === "rose") lines.push("Toward the end it drifted a little higher — check you weren't getting louder or pushing.");
    if (res.octave) lines.push(`You sang it an octave ${res.octave < 0 ? "lower" : "higher"} — the same note in a ${res.octave < 0 ? "deeper" : "lighter"} register, which is completely fine.`);
    return lines;
  }

  return { assess, assessChain, describe, REASONS };
})();

const PitchVisualizer = {
  /** The idea in one picture (an illustration, not a measurement). */
  illustration() {
    return `
      <div class="rounded-2xl border border-white/10 bg-ink-950/60 p-5" aria-label="Illustration: a straight reference line, and a voice line that wobbles a little around it">
        <svg viewBox="0 0 520 132" class="w-full h-auto" role="img">
          <text x="0" y="22" class="pg-axis">REFERENCE</text>
          <line x1="110" x2="510" y1="18" y2="18" class="pg-ref"/>
          <text x="0" y="96" class="pg-axis">YOUR VOICE</text>
          <line x1="110" x2="510" y1="92" y2="92" class="pg-ref" opacity="0.35"/>
          <path d="M110 104 Q 140 92 170 92 L 250 92 Q 270 92 285 104 Q 300 114 315 100 Q 330 86 350 92 L 510 92" class="pg-voice"/>
        </svg>
        <p class="font-display text-lg text-ink-100 mt-2">Listen first. Look second.</p>
        <p class="text-[11px] text-ink-500 mt-1">An illustration. Small movement like this is normal.</p>
      </div>`;
  },

  /** A clean reference line only (Exercise 1). */
  reference(name) {
    return `
      <div class="rounded-2xl border border-white/10 bg-ink-950/60 p-5" data-ref-line>
        <p class="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-2">Reference · ${name}</p>
        <svg viewBox="0 0 520 40" class="w-full h-auto" role="img" aria-label="A steady reference note: one straight line">
          <line x1="10" x2="510" y1="20" y2="20" class="pg-ref ps-ref-line"/>
          <circle cx="10" cy="20" r="5" class="ps-ref-dot" data-ref-dot/>
        </svg>
      </div>`;
  },

  /** Estimated-pitch trace for a reliable result (the StabilityPanel title names it "estimated pitch"). */
  trace(analysis, refMidis, octave = 0) {
    return `
      ${PitchGuide.render(analysis.frames, refMidis, { octave })}
      <p class="text-[11px] text-ink-600 mt-2">The line shows an estimate of how your pitch moved. It is not a professional vocal score.</p>`;
  },
};

const StabilityPanel = (() => {
  const cache = new Map(); // mediaId -> analysis (per page session)

  async function analysisFor(mediaId) {
    if (cache.has(mediaId)) return cache.get(mediaId);
    let blob = await Media.getBlob(mediaId).catch(() => null);
    if (!blob) { // another device: getUrl downloads it from the account
      const url = await Media.getUrl(mediaId).catch(() => null);
      blob = url ? await fetch(url).then((r) => r.blob()).catch(() => null) : null;
    }
    if (!blob) throw new Error("missing");
    const a = await PitchAnalysis.analyzeBlob(blob);
    cache.set(mediaId, a);
    return a;
  }

  function render(id, { title = "Estimated pitch", compact = false } = {}) {
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] ${compact ? "p-3" : "p-4 sm:p-5"}" data-sp="${id}">
        <p class="text-sm text-ink-100 ${compact ? "mb-1" : "mb-2"}">${title}</p>
        <div data-sp-body aria-live="polite"></div>
      </div>`;
  }

  /**
   * opts: getTake() -> { mediaId, notes } | null, chain, canReveal() -> bool,
   *   waiting (text while closed), revealedFor (mediaId already revealed),
   *   heard() -> the learner's own answer to show beside the estimate (optional),
   *   onRevealed(mediaId, summary)
   */
  function wire(container, id, opts) {
    const root = container.querySelector(`[data-sp="${id}"]`);
    if (!root) return { refresh() {}, destroy() {} };
    const body = root.querySelector("[data-sp-body]");
    let revealedFor = opts.revealedFor || null, token = 0;

    async function show(take) {
      const my = ++token;
      body.innerHTML = `<p class="text-xs text-ink-500">Estimating…</p>`;
      if (!PitchAnalysis.isAvailable) { body.innerHTML = `<p class="text-xs text-ink-500">Pitch estimates aren't available in this browser — your ears are the guide.</p>`; return; }
      let analysis;
      try { analysis = await analysisFor(take.mediaId); } catch (e) {
        if (my === token) body.innerHTML = `<p class="text-xs text-ink-500">This recording isn't available on this device yet, so there's no estimate.</p>`;
        return;
      }
      if (my !== token) return;
      const refs = take.notes;
      const res = opts.chain ? PitchStability.assessChain(analysis, refs) : PitchStability.assess(analysis, refs[0]);
      console.info("[PitchStability]", id, { peak: analysis.peak, duration: analysis.duration, loudSeconds: analysis.loudSeconds, voicedSeconds: analysis.voicedSeconds, frames: analysis.frames.length, result: res });
      const heard = opts.heard ? opts.heard() : null;
      const lines = opts.chain
        ? (res.reliable ? ["Look for a short, fairly flat stretch on each line before the move — that's the note settling."] : PitchStability.describe(res))
        : PitchStability.describe(res);
      body.innerHTML = `
        ${heard ? `<p class="text-xs text-ink-400 mb-2">You heard: <strong class="text-ink-100">${Utils.escapeHtml(heard)}</strong>. The estimate doesn't have to agree — your ears are learning.</p>` : ""}
        <ul class="flex flex-col gap-1.5 text-sm text-ink-200 mb-2">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
        ${res.reliable ? PitchVisualizer.trace(analysis, refs, res.octave) : `<p class="text-[11px] text-ink-600">No trace is shown when the estimate isn't trustworthy.</p>`}`;
      const summary = res.reliable
        ? (opts.chain ? { trace: true } : { position: res.position, steadiness: res.steadiness, trend: res.trend })
        : { hidden: res.reason };
      if (revealedFor !== take.mediaId) { revealedFor = take.mediaId; if (opts.onRevealed) opts.onRevealed(take.mediaId, summary); }
    }

    function paint() {
      const take = opts.getTake();
      token++;
      if (!take || !take.mediaId) { body.innerHTML = `<p class="text-xs text-ink-500">Record a take first.</p>`; return; }
      if (revealedFor === take.mediaId) { show(take); return; }
      if (!opts.canReveal()) { body.innerHTML = `<p class="text-xs text-ink-500">🎧 ${opts.waiting || "Listen first: play your recording and answer the question above. Then you can look."}</p>`; return; }
      body.innerHTML = `<button type="button" data-sp-reveal class="vr-btn">👀 Look: show the estimated pitch</button>`;
    }

    function onClick(e) {
      if (!e.target.closest("[data-sp-reveal]")) return;
      const take = opts.getTake();
      if (take) show(take);
    }
    root.addEventListener("click", onClick);
    paint();
    return { refresh: paint, destroy() { token++; root.removeEventListener("click", onClick); } };
  }

  return { render, wire };
})();
