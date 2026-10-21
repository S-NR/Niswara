/* ============================================================
   PITCH ANALYSIS — client-side pitch ESTIMATE of a recording.

   Method: decode the take, downsample to 16 kHz, run the YIN
   pitch detector on overlapping frames, keep only clear, loud-
   enough frames, smooth, then compare the typical pitch with the
   reference note.

   Honesty rules (the learner is a beginner):
   - Always presented as an "estimate", never a verdict or score.
   - If there isn't enough clear, steady voice, it says so instead
     of guessing (reliable: false).
   - Singing the same note an octave lower/higher (common for
     deeper or lighter voices) counts as matching that note.
   ============================================================ */

const PitchAnalysis = (() => {
  const TARGET_SR = 16000;
  const FRAME = 1024;        // 64 ms at 16 kHz
  const HOP = 256;           // 16 ms
  const MIN_F = 70, MAX_F = 1000;
  const YIN_THRESHOLD = 0.15;
  const MIN_VOICED_SECONDS = 0.4;

  const isAvailable = !!(window.OfflineAudioContext || window.webkitOfflineAudioContext);

  const toMidi = (f) => 69 + 12 * Math.log2(f / 440);

  function median(arr) {
    if (!arr.length) return NaN;
    const s = arr.slice().sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function quantile(arr, q) {
    const s = arr.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))];
  }

  function downsample(data, sr) {
    const factor = Math.max(1, Math.round(sr / TARGET_SR));
    if (factor === 1) return { data, sr };
    const out = new Float32Array(Math.floor(data.length / factor));
    for (let i = 0; i < out.length; i++) {
      let sum = 0;
      for (let k = 0; k < factor; k++) sum += data[i * factor + k];
      out[i] = sum / factor;
    }
    return { data: out, sr: sr / factor };
  }

  /** YIN on one frame. Returns { freq, clarity } or null if no clear pitch. */
  function yin(x, offset, sr, diff, cmnd) {
    const W = FRAME >> 1;
    const tauMin = Math.max(2, Math.floor(sr / MAX_F));
    const tauMax = Math.min(W - 1, Math.ceil(sr / MIN_F));
    for (let tau = 1; tau <= tauMax; tau++) {
      let sum = 0;
      for (let i = 0; i < W; i++) {
        const d = x[offset + i] - x[offset + i + tau];
        sum += d * d;
      }
      diff[tau] = sum;
    }
    cmnd[0] = 1;
    let running = 0;
    for (let tau = 1; tau <= tauMax; tau++) {
      running += diff[tau];
      cmnd[tau] = running ? (diff[tau] * tau) / running : 1;
    }
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (cmnd[t] < YIN_THRESHOLD) {
        while (t + 1 <= tauMax && cmnd[t + 1] < cmnd[t]) t++;
        tau = t;
        break;
      }
    }
    if (tau === -1) return null;
    // Parabolic interpolation for sub-sample accuracy
    const a = cmnd[tau - 1], b = cmnd[tau], c = tau + 1 <= tauMax ? cmnd[tau + 1] : b;
    const denom = a - 2 * b + c;
    const better = denom ? tau + (a - c) / (2 * denom) : tau;
    return { freq: sr / better, clarity: 1 - b };
  }

  /** Raw samples -> { frames: [{ t, midi }], duration, voicedSeconds }. */
  function analyzeSamples(samples, sampleRate) {
    const { data, sr } = downsample(samples, sampleRate);
    const W = FRAME >> 1;
    const diff = new Float32Array(W), cmnd = new Float32Array(W);
    const rmsList = [];
    for (let start = 0; start + FRAME <= data.length; start += HOP) {
      let s = 0;
      for (let i = 0; i < FRAME; i++) s += data[start + i] * data[start + i];
      rmsList.push(Math.sqrt(s / FRAME));
    }
    const maxRms = Math.max(0, ...rmsList);
    const gate = Math.max(0.008, maxRms * 0.15);
    const raw = [];
    rmsList.forEach((rms, idx) => {
      if (rms < gate) return;
      const start = idx * HOP;
      const r = yin(data, start, sr, diff, cmnd);
      if (r && r.clarity > 0.8) raw.push({ t: (start + FRAME / 2) / sr, midi: toMidi(r.freq) });
    });
    // 5-point median smoothing removes single-frame octave glitches
    const frames = raw.map((f, i) => ({
      t: f.t,
      midi: median(raw.slice(Math.max(0, i - 2), i + 3).map((x) => x.midi)),
    }));
    return { frames, duration: data.length / sr, voicedSeconds: frames.length * HOP / sr };
  }

  async function decode(blob) {
    const buf = await blob.arrayBuffer();
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new OAC(1, 1, 44100);
    const audio = await ctx.decodeAudioData(buf);
    const ch = audio.numberOfChannels;
    if (ch === 1) return { samples: audio.getChannelData(0), sampleRate: audio.sampleRate };
    const mix = new Float32Array(audio.length);
    for (let c = 0; c < ch; c++) {
      const d = audio.getChannelData(c);
      for (let i = 0; i < d.length; i++) mix[i] += d[i] / ch;
    }
    return { samples: mix, sampleRate: audio.sampleRate };
  }

  /** Recording (Blob) -> analysis. */
  async function analyzeBlob(blob) {
    const { samples, sampleRate } = await decode(blob);
    return analyzeSamples(samples, sampleRate);
  }

  /**
   * Compare an analysis with a reference note.
   * focus: "all" (a held note) or "end" (a slide — where the voice settled).
   * -> { reliable, reason?, cents, octave, direction: "near"|"above"|"below" }
   */
  function compare(analysis, refMidi, { focus = "all" } = {}) {
    const frames = analysis.frames;
    if (frames.length < 12 || analysis.voicedSeconds < MIN_VOICED_SECONDS) {
      return { reliable: false, reason: "short" };
    }
    const sel = focus === "end" ? frames.slice(Math.floor(frames.length * 0.6)) : frames;
    const med = median(sel.map((f) => f.midi));
    const octave = Math.round((med - refMidi) / 12);
    const folded = sel.map((f) => f.midi - 12 * octave - refMidi);
    // A held note that wanders more than ~2.5 semitones can't be summarised honestly
    if (focus === "all" && quantile(folded, 0.75) - quantile(folded, 0.25) > 2.5) {
      return { reliable: false, reason: "unsteady" };
    }
    const cents = Math.round(median(folded) * 100);
    const direction = Math.abs(cents) <= 30 ? "near" : cents < 0 ? "below" : "above";
    return { reliable: true, cents, octave, direction, medianMidi: med };
  }

  /** Beginner-friendly sentence for a comparison. */
  function describe(cmp) {
    if (!cmp.reliable) {
      return cmp.reason === "unsteady"
        ? "Your voice moved around a lot in this take, so there's no single pitch to estimate. Trust your ears for this one."
        : "Couldn't get a clear pitch estimate from this recording (it may be too short, quiet or noisy). Trust your ears for this one.";
    }
    const c = Math.abs(cmp.cents);
    const dir = cmp.cents < 0 ? "lower" : "higher";
    let text;
    if (c <= 30) text = "Your note was very close to the reference.";
    else if (c <= 100) text = `Your note was slightly ${dir} than the reference.`;
    else if (c <= 300) text = `Your note was ${dir} than the reference — try gently moving ${cmp.cents < 0 ? "up" : "down"}.`;
    else text = `Your note was quite a bit ${dir} than the reference.`;
    if (cmp.octave < 0) text += " You sang it an octave lower — the same note in a deeper register, which is completely fine.";
    if (cmp.octave > 0) text += " You sang it an octave higher — the same note in a lighter register, which is completely fine.";
    return text;
  }

  return { isAvailable, analyzeBlob, analyzeSamples, compare, describe, toMidi };
})();
