/* ============================================================
   RHYTHM TOOLS (Class 6 first; reusable for warm-ups, songs, any
   "in time" practice).

     RhythmSounds         click (accented on beat 1) and clap, synthesized
     MetronomeEngine      Web Audio scheduler: sounds are scheduled on the
                          AUDIO clock a little ahead of time (no drifting
                          timers); visuals follow via onBeat
     BeatIndicator        1 2 3 4 dots, beat 1 distinct
     Metronome            the full UI: start/stop, BPM 60–120, presets,
                          tap tempo, volume, accent, beat lights
     TapPad               a big tap target (pointer / Space / Enter)
     TimingAnalysis       compares taps with beats -> a BASIC estimate
     TimingTimeline       beat ticks vs. your taps (simple SVG)
     TapExercise          listen N beats, tap M beats, see the estimate
     RhythmPatternExercise  hear a ● ○ pattern, tap it back
     BeatGuide            per-beat words/counts/notes that light up in time
                          (counting, speaking and singing in time)

   Honesty: tap timing is measured on this device's audio clock and is an
   approximate "basic timing estimate", never a professional verdict.
   Everything shares PianoSynth's AudioContext.
   ============================================================ */

const RhythmSounds = (() => {
  let noise = null;
  function noiseBuffer(ctx) {
    if (!noise || noise.sampleRate !== ctx.sampleRate) {
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noise;
  }
  /** A short woodblock-like click. accent = beat 1 (higher, louder); soft = quiet sub-beat. */
  function click(ctx, out, time, { accent = false, soft = false } = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = accent ? 1760 : soft ? 660 : 1100;
    const peak = accent ? 0.9 : soft ? 0.25 : 0.55;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(g); g.connect(out);
    osc.start(time); osc.stop(time + 0.07);
  }
  /** A soft hand-clap (filtered noise burst). */
  function clap(ctx, out, time) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass"; band.frequency.value = 1300; band.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(1.0, time + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    src.connect(band); band.connect(g); g.connect(out);
    src.start(time); src.stop(time + 0.16);
  }
  return { click, clap };
})();

class MetronomeEngine {
  /**
   * opts: bpm, beatsPerBar (4), subdivision (1 = beats, 2 = "1 & 2 &"), accent, volume,
   *       clicks (sound the beat), onBeat(tick) at the audible moment, onSchedule(tick, engine) ahead of time.
   * tick: { i, time, beatIndex, beatInBar, bar, sub, isBeat }
   */
  constructor(opts = {}) {
    this.bpm = opts.bpm || 80;
    this.beatsPerBar = opts.beatsPerBar || 4;
    this.subdivision = opts.subdivision || 1;
    this.accent = opts.accent !== false;
    this.volume = opts.volume ?? 0.7;
    this.clicks = opts.clicks !== false;
    this.onBeat = opts.onBeat;
    this.onSchedule = opts.onSchedule;
    this.onStop = opts.onStop;
    this.running = false;
    this.ticks = [];
    this.id = "metronome:" + Math.random().toString(36).slice(2, 8);
    this._other = (e) => {
      const s = (e.detail && e.detail.source) || "";
      if (s !== this.id && (s.startsWith("metronome") || s.startsWith("wf:"))) this.stop();
    };
  }
  get ctx() { return PianoSynth.ensure(); }
  /** Time from "scheduled" to "you hear it" on this device (speakers/drivers). */
  latency() { const c = this.ctx; return c ? (c.outputLatency || 0) + (c.baseLatency || 0) : 0; }
  now() { return this.ctx ? this.ctx.currentTime : 0; }
  interval() { return 60 / this.bpm; }
  start() {
    const ctx = this.ctx;
    if (!ctx) return false;
    this.stop();
    VoiceRecorder.announce(this.id); // other metronomes / players stop; the recorder keeps going
    window.addEventListener("niswara:audio-start", this._other);
    this.out = ctx.createGain();
    this.out.gain.value = this.volume;
    this.out.connect(ctx.destination);
    this.running = true;
    this.tickIndex = 0;
    this.ticks = [];
    this.nextTime = ctx.currentTime + 0.15;
    this.startTime = this.nextTime;
    this.timer = setInterval(() => this._schedule(), 25);
    this._schedule();
    return true;
  }
  _schedule() {
    const ctx = this.ctx;
    while (this.running && this.nextTime < ctx.currentTime + 0.15) {
      const i = this.tickIndex;
      const sub = i % this.subdivision;
      const beatIndex = Math.floor(i / this.subdivision);
      const tick = { i, time: this.nextTime, beatIndex, beatInBar: beatIndex % this.beatsPerBar, bar: Math.floor(beatIndex / this.beatsPerBar), sub, isBeat: sub === 0 };
      this.ticks.push(tick);
      if (tick.isBeat && this.clicks) RhythmSounds.click(ctx, this.out, tick.time, { accent: this.accent && tick.beatInBar === 0 });
      if (this.onSchedule) this.onSchedule(tick, this);
      tick.timeout = setTimeout(() => { if (this.running && this.onBeat) this.onBeat(tick, this); }, Math.max(0, (tick.time + this.latency() - ctx.currentTime) * 1000));
      this.nextTime += 60 / this.bpm / this.subdivision;
      this.tickIndex++;
    }
  }
  stop() {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.timer);
    this.ticks.forEach((t) => clearTimeout(t.timeout));
    window.removeEventListener("niswara:audio-start", this._other);
    try {
      const out = this.out;
      out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01); // silence anything already scheduled
      setTimeout(() => out.disconnect(), 400);
    } catch (e) { /* already gone */ }
    if (this.onStop) this.onStop(this);
  }
  setBpm(b) { this.bpm = Math.max(40, Math.min(200, Math.round(b))); }
  setVolume(v) { this.volume = v; if (this.out) this.out.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02); }
  beats() { return this.ticks.filter((t) => t.isBeat); }
}

const BeatIndicator = {
  render(count = 4, { hidden = false, big = false } = {}) {
    return `<div class="beat-ind flex items-center justify-center gap-3 ${hidden ? "is-hidden" : ""}" data-beat-ind aria-hidden="true">
      ${Array.from({ length: count }).map((_, i) => `
        <div class="flex flex-col items-center gap-1.5">
          <span class="beat-dot ${big ? "beat-dot-big" : ""} ${i === 0 ? "is-first" : ""}" data-beat-dot="${i}"></span>
          <span class="text-[11px] tabular-nums ${i === 0 ? "text-gold-300" : "text-ink-500"}">${i + 1}</span>
        </div>`).join("")}
    </div>`;
  },
  /** Light one beat (index within the bar); -1 clears. */
  light(root, i) {
    const ind = root.querySelector("[data-beat-ind]");
    if (!ind) return;
    ind.querySelectorAll("[data-beat-dot]").forEach((d) => {
      const on = Number(d.dataset.beatDot) === i;
      d.classList.remove("is-on");
      if (on) { void d.offsetWidth; d.classList.add("is-on"); }
    });
  },
};

const Metronome = (() => {
  const PRESETS = [60, 70, 80, 90, 100, 120];
  const MIN = 60, MAX = 120;

  function render(id, { bpm = 80 } = {}) {
    return `
      <div class="metronome rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-5 sm:p-8 shadow-2xl" data-metro="${id}">
        <div class="flex flex-col items-center text-center gap-2">
          <p class="text-[11px] tracking-[0.25em] uppercase text-ink-500">BPM</p>
          <p class="font-display text-6xl sm:text-7xl text-ink-50 tabular-nums leading-none" data-metro-bpm>${bpm}</p>
          <p class="text-xs text-ink-500" data-metro-hint>${hint(bpm)}</p>
        </div>
        <div class="my-7">${BeatIndicator.render(4, { big: true })}</div>
        <div class="flex justify-center mb-6">
          <button type="button" data-metro-toggle class="metro-start" aria-pressed="false">${icon("play", "w-5 h-5")} <span>Start</span></button>
        </div>
        <div class="flex items-center gap-3 max-w-md mx-auto mb-4">
          <button type="button" data-metro-step="-1" class="piano-ctl w-9" aria-label="Slower">−</button>
          <input type="range" min="${MIN}" max="${MAX}" value="${bpm}" data-metro-slider class="piano-range flex-1" aria-label="Tempo in beats per minute">
          <button type="button" data-metro-step="1" class="piano-ctl w-9" aria-label="Faster">+</button>
        </div>
        <div class="flex flex-wrap justify-center gap-1.5 mb-5" role="group" aria-label="Tempo presets">
          ${PRESETS.map((p) => `<button type="button" data-metro-preset="${p}" class="ex-chip !py-1.5 !px-3 tabular-nums ${p === bpm ? "is-selected" : ""}">${p}</button>`).join("")}
        </div>
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-ink-400">
          <button type="button" data-metro-taptempo class="vr-btn">Tap tempo</button>
          <label class="flex items-center gap-2">Volume <input type="range" min="0" max="100" value="70" data-metro-volume class="piano-range w-24" aria-label="Metronome volume"></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" data-metro-accent checked class="accent-amber-400"> Accent beat 1</label>
        </div>
        <p class="text-[11px] text-ink-600 text-center mt-3 min-h-[1rem]" data-metro-tapinfo></p>
      </div>`;
  }

  function hint(bpm) {
    const perSec = bpm / 60;
    return bpm === 60 ? "1 beat ≈ every second" : bpm === 120 ? "2 beats every second" : `about ${perSec.toFixed(perSec % 1 ? 1 : 0)} beats per second`;
  }

  /** opts: bpm, onStart(), onBeats(totalBeats) */
  function wire(container, id, { bpm = 80, onStart, onBeats } = {}) {
    const root = container.querySelector(`[data-metro="${id}"]`);
    if (!root) return { destroy() {} };
    const $ = (s) => root.querySelector(s);
    let beats = 0;
    const engine = new MetronomeEngine({
      bpm,
      onBeat: (t) => { BeatIndicator.light(root, t.beatInBar); beats++; if (onBeats) onBeats(beats); },
      onStop: () => { setUi(false); BeatIndicator.light(root, -1); },
    });
    function setUi(on) {
      const b = $("[data-metro-toggle]");
      b.innerHTML = `${icon(on ? "pause" : "play", "w-5 h-5")} <span>${on ? "Stop" : "Start"}</span>`;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-on", on);
    }
    function setBpm(v, note = "") {
      const b = Math.max(MIN, Math.min(MAX, Math.round(v)));
      engine.setBpm(b);
      $("[data-metro-bpm]").textContent = b;
      $("[data-metro-hint]").textContent = hint(b);
      $("[data-metro-slider]").value = b;
      root.querySelectorAll("[data-metro-preset]").forEach((p) => p.classList.toggle("is-selected", Number(p.dataset.metroPreset) === b));
      $("[data-metro-tapinfo]").textContent = note;
    }
    // Tap tempo: average the gaps between your last few taps
    let tapTimes = [];
    function tapTempo() {
      const now = performance.now();
      if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2000) tapTimes = [];
      tapTimes.push(now);
      tapTimes = tapTimes.slice(-6);
      if (tapTimes.length < 2) { $("[data-metro-tapinfo]").textContent = "Keep tapping at the speed you want…"; return; }
      const gaps = tapTimes.slice(1).map((t, i) => t - tapTimes[i]);
      const raw = 60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length);
      setBpm(raw, raw < MIN || raw > MAX ? `You tapped about ${Math.round(raw)} BPM — kept within ${MIN}–${MAX} for now.` : `Tap tempo: ${Math.round(raw)} BPM (${tapTimes.length} taps)`);
    }
    function onClick(e) {
      if (e.target.closest("[data-metro-toggle]")) {
        if (engine.running) engine.stop();
        else { beats = 0; engine.start(); setUi(true); if (onStart) onStart(); }
        return;
      }
      const step = e.target.closest("[data-metro-step]");
      if (step) { setBpm(engine.bpm + Number(step.dataset.metroStep)); return; }
      const preset = e.target.closest("[data-metro-preset]");
      if (preset) { setBpm(Number(preset.dataset.metroPreset)); return; }
      if (e.target.closest("[data-metro-taptempo]")) tapTempo();
    }
    root.addEventListener("click", onClick);
    $("[data-metro-slider]").addEventListener("input", (e) => setBpm(Number(e.target.value)));
    $("[data-metro-volume]").addEventListener("input", (e) => engine.setVolume(Number(e.target.value) / 100));
    $("[data-metro-accent]").addEventListener("change", (e) => { engine.accent = e.target.checked; });
    root._api = { engine, setBpm };
    return { engine, setBpm, destroy() { engine.stop(); root.removeEventListener("click", onClick); } };
  }

  return { render, wire, PRESETS };
})();

const TapPad = {
  render(id, { label = "TAP" } = {}) {
    return `<button type="button" class="tap-pad" data-tappad="${id}" aria-label="Tap along with the beat">
      <span class="tap-ring" aria-hidden="true"></span><span class="relative font-display text-2xl tracking-[0.2em]">${label}</span></button>`;
  },
  /** onTap(audioTime) — pointer, or Space/Enter while the pad has focus. Returns cleanup. */
  wire(container, id, { now, onTap }) {
    const pad = container.querySelector(`[data-tappad="${id}"]`);
    if (!pad) return () => {};
    const hit = (e) => {
      if (e.type === "keydown" && e.key !== " " && e.key !== "Enter") return;
      if (e.type === "keydown" && e.repeat) return;
      e.preventDefault();
      const t = now();
      pad.classList.remove("is-hit"); void pad.offsetWidth; pad.classList.add("is-hit");
      onTap(t);
    };
    pad.addEventListener("pointerdown", hit);
    pad.addEventListener("keydown", hit);
    pad.addEventListener("click", (e) => e.preventDefault());
    return () => { pad.removeEventListener("pointerdown", hit); pad.removeEventListener("keydown", hit); };
  },
};

const TimingAnalysis = {
  /**
   * taps: [seconds], beats: [seconds] (when each beat is HEARD), interval: seconds per beat.
   * -> { taps, expected, matched, missed, extra, offsetsMs, medianAbsMs, meanMs, cv, rating, tendency }
   */
  analyze(taps, beats, interval) {
    const lo = beats[0] - interval / 2, hi = beats[beats.length - 1] + interval / 2;
    const inWin = taps.filter((t) => t >= lo && t <= hi).sort((a, b) => a - b);
    const used = new Set();
    const offsets = [];
    beats.forEach((b) => {
      let best = -1, bestD = Infinity;
      inWin.forEach((t, j) => { const d = Math.abs(t - b); if (!used.has(j) && d < bestD && d <= interval / 2) { best = j; bestD = d; } });
      if (best >= 0) { used.add(best); offsets.push((inWin[best] - b) * 1000); }
    });
    const median = (a) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    const gaps = inWin.slice(1).map((t, i) => t - inWin[i]);
    const meanGap = gaps.reduce((a, b) => a + b, 0) / (gaps.length || 1);
    const cv = gaps.length >= 2 ? Math.sqrt(gaps.reduce((s, g) => s + (g - meanGap) ** 2, 0) / gaps.length) / meanGap : NaN;
    const medianAbs = median(offsets.map(Math.abs));
    const mean = offsets.length ? offsets.reduce((a, b) => a + b, 0) / offsets.length : NaN;
    const matchedShare = offsets.length / beats.length;
    let rating = "Needs practice";
    if (matchedShare >= 0.6) {
      if (medianAbs <= 60 && (isNaN(cv) || cv <= 0.08)) rating = "Good";
      else if (medianAbs <= 120 && (isNaN(cv) || cv <= 0.16)) rating = "Developing";
    }
    const tendency = !offsets.length ? "none" : mean < -35 ? "ahead" : mean > 35 ? "behind" : "with";
    return {
      taps: inWin.length, expected: beats.length, matched: offsets.length,
      missed: beats.length - offsets.length, extra: inWin.length - offsets.length,
      offsetsMs: offsets.map((o) => Math.round(o)), medianAbsMs: Math.round(medianAbs || 0), meanMs: Math.round(mean || 0),
      cv: isNaN(cv) ? null : Math.round(cv * 1000) / 1000, rating, tendency,
    };
  },

  tendencyText(r) {
    return {
      ahead: "Your taps were mostly a little <strong class=\"text-ink-100\">ahead</strong> of the beat — that's rushing. Try waiting for the click.",
      behind: "Your taps were mostly a little <strong class=\"text-ink-100\">behind</strong> the beat. Try to feel the click coming, rather than reacting to it.",
      with: "Your taps were mostly <strong class=\"text-ink-100\">with the beat</strong>.",
      none: "No taps landed near the beats this time — that's fine, try again and keep it relaxed.",
    }[r.tendency];
  },
};

const TimingTimeline = {
  /** beats & taps in seconds; draws beat ticks and your taps (teal = close, amber = further away). */
  render(beats, taps, interval) {
    if (!beats.length) return "";
    const W = 560, H = 64, L = 12, R = 12;
    const t0 = beats[0] - interval / 2, t1 = beats[beats.length - 1] + interval / 2;
    const x = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
    const near = (t) => beats.some((b) => Math.abs(b - t) <= 0.06);
    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Beats compared with your taps">
        <text x="${L}" y="12" class="pg-label">Beat</text>
        <line x1="${L}" x2="${W - R}" y1="22" y2="22" class="tl-axis"/>
        ${beats.map((b, i) => `<line x1="${x(b)}" x2="${x(b)}" y1="16" y2="28" class="tl-beat ${i % 4 === 0 ? "is-first" : ""}"/>`).join("")}
        <text x="${L}" y="44" class="pg-label">Your taps</text>
        <line x1="${L}" x2="${W - R}" y1="54" y2="54" class="tl-axis"/>
        ${beats.map((b) => `<line x1="${x(b)}" x2="${x(b)}" y1="48" y2="60" class="tl-ghost"/>`).join("")}
        ${taps.filter((t) => t >= t0 && t <= t1).map((t) => `<circle cx="${x(t)}" cy="54" r="4.5" class="${near(t) ? "tl-tap-near" : "tl-tap-far"}"/>`).join("")}
      </svg>`;
  },
};

const TapExercise = (() => {
  function render(id, { hideIndicator = false, startLabel = "Start" } = {}) {
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7 text-center" data-tapx="${id}">
        <div class="mb-5">${BeatIndicator.render(4, { hidden: hideIndicator })}</div>
        ${hideIndicator ? `<p class="text-xs text-ink-500 -mt-3 mb-4">Beat lights are hidden — trust your ears.</p>` : ""}
        <p class="font-display text-xl text-ink-50 min-h-[1.75rem]" data-tapx-phase>Press Start, then listen.</p>
        <p class="text-xs text-ink-500 mb-5 min-h-[1rem]" data-tapx-sub></p>
        <div class="flex justify-center mb-5">${TapPad.render(`${id}-pad`)}</div>
        <button type="button" data-tapx-start class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} <span>${startLabel}</span></button>
        <div class="text-left mt-6" data-tapx-result></div>
      </div>`;
  }

  function resultHtml(res, timeline) {
    const tone = { Good: "text-emerald-300", Developing: "text-amber-300", "Needs practice": "text-ink-200" }[res.rating];
    return `
      <div class="rounded-2xl border border-white/5 bg-ink-950/60 p-4">
        <p class="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-3">Basic timing estimate</p>
        <div class="grid grid-cols-3 gap-2 mb-3 text-center">
          <div class="rounded-xl bg-white/[0.03] px-2 py-2"><div class="font-display text-xl text-ink-50">${res.taps}</div><div class="text-[10px] uppercase tracking-wider text-ink-500">Your taps</div></div>
          <div class="rounded-xl bg-white/[0.03] px-2 py-2"><div class="font-display text-xl text-ink-50">${res.expected}</div><div class="text-[10px] uppercase tracking-wider text-ink-500">Expected beats</div></div>
          <div class="rounded-xl bg-white/[0.03] px-2 py-2"><div class="font-display text-base ${tone} leading-7">${res.rating}</div><div class="text-[10px] uppercase tracking-wider text-ink-500">Consistency</div></div>
        </div>
        <p class="text-sm text-ink-300 mb-3">${TimingAnalysis.tendencyText(res)}</p>
        ${timeline || ""}
        <p class="text-[11px] text-ink-600 mt-2">An approximate estimate from your device — not professional timing analysis. ${res.rating === "Needs practice" ? "Totally normal at the start; it improves quickly with repetition." : ""}</p>
      </div>`;
  }

  /** opts: bpm, listenBeats, tapBeats, saved (result), onResult(result) */
  function wire(container, id, { bpm = 60, listenBeats = 4, tapBeats = 8, saved = null, onResult } = {}) {
    const root = container.querySelector(`[data-tapx="${id}"]`);
    if (!root) return { destroy() {} };
    const $ = (s) => root.querySelector(s);
    let taps = [], running = false;
    const total = listenBeats + tapBeats;
    const engine = new MetronomeEngine({
      bpm,
      onBeat: (t) => {
        BeatIndicator.light(root, t.beatInBar);
        const n = t.beatIndex + 1;
        if (n <= listenBeats) { $("[data-tapx-phase]").textContent = "Listen…"; $("[data-tapx-sub]").textContent = `Tapping starts in ${listenBeats - n + 1} beat${listenBeats - n + 1 === 1 ? "" : "s"}`; }
        else if (n <= total) { $("[data-tapx-phase]").textContent = "Tap with each beat"; $("[data-tapx-sub]").textContent = `${total - n + 1} beat${total - n + 1 === 1 ? "" : "s"} to go`; }
        if (n === total) setTimeout(finish, (60 / bpm) * 600);
      },
      onStop: () => { running = false; setStart(false); BeatIndicator.light(root, -1); },
    });
    function setStart(on) { $("[data-tapx-start]").innerHTML = `${icon(on ? "pause" : "play", "w-4 h-4")} <span>${on ? "Stop" : "Try again"}</span>`; }
    function finish() {
      if (!running) return;
      const lat = engine.latency();
      const beats = engine.beats().slice(listenBeats, total).map((b) => b.time + lat);
      engine.stop();
      const res = { ...TimingAnalysis.analyze(taps, beats, 60 / bpm), bpm, at: new Date().toISOString() };
      $("[data-tapx-phase]").textContent = "Done — here's what happened";
      $("[data-tapx-sub]").textContent = "";
      $("[data-tapx-result]").innerHTML = resultHtml(res, TimingTimeline.render(beats, taps, 60 / bpm));
      if (onResult) onResult(res);
    }
    const unPad = TapPad.wire(root, `${id}-pad`, { now: () => engine.now(), onTap: (t) => { if (running) taps.push(t); } });
    function onClick(e) {
      if (!e.target.closest("[data-tapx-start]")) return;
      if (running) { engine.stop(); $("[data-tapx-phase]").textContent = "Stopped. Press Try again when you're ready."; return; }
      taps = []; running = true;
      $("[data-tapx-result]").innerHTML = "";
      engine.start();
      setStart(true);
      $("[data-tapx-phase]").textContent = "Listen…";
    }
    root.addEventListener("click", onClick);
    if (saved) $("[data-tapx-result]").innerHTML = resultHtml(saved, "") + `<p class="text-[11px] text-ink-600 mt-2">Your last result. Press Start to try again.</p>`;
    root._api = { engine, get taps() { return taps; }, tap: (t) => { if (running) taps.push(t); } };
    return { destroy() { engine.stop(); unPad(); root.removeEventListener("click", onClick); } };
  }

  return { render, wire };
})();

const RhythmPatternExercise = (() => {
  /** patterns: [{ key, label, hits: [1,0,1,0], sub: 1|2, locked }] */
  function render(id, { patterns, steps = ["Listen", "Count", "Tap it back"] }) {
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-rpx="${id}">
        <div class="flex flex-wrap items-center gap-1.5 mb-5">${steps.map((s, i) => `<span class="flow-chip">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>
        <div class="flex flex-wrap gap-1.5 mb-5" role="tablist">
          ${patterns.map((p, i) => `<button type="button" role="tab" data-rpx-pick="${p.key}" class="ex-chip ${i === 0 ? "is-selected" : ""}" ${p.locked ? "disabled" : ""}>${p.locked ? icon("lock", "w-3 h-3") : ""} ${p.label}<span class="text-[10px] text-emerald-300 ml-1" data-rpx-done="${p.key}" hidden>✓</span></button>`).join("")}
        </div>
        <div class="rp-row" data-rpx-row></div>
        <div class="rp-row rp-row-you mt-2" data-rpx-you></div>
        <p class="font-display text-lg text-ink-50 text-center mt-5 min-h-[1.75rem]" data-rpx-phase>Play the pattern first.</p>
        <div class="flex flex-wrap justify-center gap-2 mt-3">
          <button type="button" data-rpx-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Pattern</button>
          <button type="button" data-rpx-try class="vr-btn">Tap it back</button>
        </div>
        <div class="flex justify-center mt-5">${TapPad.render(`${id}-pad`, { label: "TAP" })}</div>
        <div class="text-sm text-center mt-4 min-h-[1.25rem]" data-rpx-result aria-live="polite"></div>
      </div>`;
  }

  function slotLabels(p) {
    return p.hits.map((_, i) => (p.sub === 2 ? (i % 2 ? "&" : String((i / 2) % 4 + 1)) : String((i % 4) + 1)));
  }

  /** opts: bpm, patterns, saved ({ key: result }), onResult(key, result) */
  function wire(container, id, { bpm = 70, patterns, saved = {}, onResult }) {
    const root = container.querySelector(`[data-rpx="${id}"]`);
    if (!root) return { destroy() {} };
    const $ = (s) => root.querySelector(s);
    let current = patterns.find((p) => !p.locked) || patterns[0];
    let mode = null, taps = [], slotTimes = [];
    const results = { ...saved };

    function drawRow(litIndex = -1) {
      const labels = slotLabels(current);
      $("[data-rpx-row]").innerHTML = current.hits.map((h, i) => `
        <div class="rp-slot ${h ? "is-hit" : ""} ${i === litIndex ? "is-lit" : ""}"><span class="rp-mark">${h ? "●" : "○"}</span><span class="rp-label">${labels[i]}</span></div>`).join("");
    }
    function drawYou(perSlot) {
      $("[data-rpx-you]").innerHTML = perSlot
        ? current.hits.map((h, i) => `<div class="rp-slot ${perSlot[i] ? "is-you" : ""} ${perSlot[i] && !h ? "is-extra" : ""}"><span class="rp-mark">${perSlot[i] ? "●" : "·"}</span><span class="rp-label">you</span></div>`).join("")
        : "";
    }
    function markDone() {
      patterns.forEach((p) => { const b = $(`[data-rpx-done="${p.key}"]`); if (b) b.hidden = !results[p.key]; });
    }

    let engine = null;
    function run(kind) {
      if (engine) engine.stop();
      mode = kind; taps = []; slotTimes = [];
      const slots = current.hits.length;
      const sub = current.sub || 1;
      const barTicks = 4 * sub; // one bar of count-in, then one bar of pattern / your turn
      drawYou(null);
      $("[data-rpx-result]").innerHTML = "";
      $("[data-rpx-phase]").textContent = "Count-in: 1 2 3 4…";
      engine = new MetronomeEngine({
        bpm, subdivision: sub,
        onSchedule: (t, eng) => {
          const k = t.i - barTicks;
          if (k >= 0 && k < slots) {
            slotTimes[k] = t.time + eng.latency();
            if (kind === "play" && current.hits[k]) RhythmSounds.clap(eng.ctx, eng.out, t.time);
          }
        },
        onBeat: (t) => {
          const k = t.i - barTicks;
          if (k === 0) $("[data-rpx-phase]").textContent = kind === "play" ? "Listen to the pattern…" : "Your turn — tap the ● slots";
          if (k >= 0 && k < slots) drawRow(k);
          if (k === slots) { drawRow(-1); finish(); }
        },
        onStop: () => { mode = null; },
      });
      engine.start();
    }
    function finish() {
      const kind = mode;
      engine.stop();
      if (kind === "play") { $("[data-rpx-phase]").textContent = "Now count it in your head — then tap it back."; return; }
      const slotGap = 60 / bpm / (current.sub || 1);
      const tol = slotGap * 0.4;
      const perSlot = slotTimes.map((st) => taps.some((t) => Math.abs(t - st) <= tol));
      const hitsWanted = current.hits.filter(Boolean).length;
      const matched = current.hits.filter((h, i) => h && perSlot[i]).length;
      const extra = perSlot.filter((v, i) => v && !current.hits[i]).length;
      const res = { matched, wanted: hitsWanted, extra, taps: taps.length, at: new Date().toISOString() };
      results[current.key] = res;
      drawYou(perSlot);
      markDone();
      $("[data-rpx-phase]").textContent = "Here's how it lined up";
      $("[data-rpx-result]").innerHTML = `<span class="text-ink-200">You tapped <strong>${matched} of ${hitsWanted}</strong> pattern beats${extra ? ` (plus ${extra} extra tap${extra > 1 ? "s" : ""})` : ""}.</span>
        <span class="text-ink-500"> ${matched === hitsWanted && !extra ? "Lovely — that matched the pattern." : "Play it again, count it, and try again — it gets easier each time."}</span>
        <div class="text-[11px] text-ink-600 mt-1">Basic timing estimate</div>`;
      if (onResult) onResult(current.key, res);
    }
    const unPad = TapPad.wire(root, `${id}-pad`, { now: () => (engine ? engine.now() : 0), onTap: (t) => { if (mode === "try") taps.push(t); } });
    function onClick(e) {
      const pick = e.target.closest("[data-rpx-pick]");
      if (pick && !pick.disabled) {
        if (engine) engine.stop();
        current = patterns.find((p) => p.key === pick.dataset.rpxPick);
        root.querySelectorAll("[data-rpx-pick]").forEach((b) => b.classList.toggle("is-selected", b === pick));
        drawRow(); drawYou(null);
        $("[data-rpx-result]").innerHTML = "";
        $("[data-rpx-phase]").textContent = "Play the pattern first.";
        return;
      }
      if (e.target.closest("[data-rpx-play]")) { run("play"); return; }
      if (e.target.closest("[data-rpx-try]")) run("try");
    }
    root.addEventListener("click", onClick);
    drawRow(); markDone();
    root._api = { get engine() { return engine; }, tap: (t) => { if (mode === "try") taps.push(t); }, slotTimes: () => slotTimes.slice(), current: () => current };
    return {
      /** Make a locked pattern (e.g. an 8-beat one) available. */
      unlock(key) {
        const p = patterns.find((x) => x.key === key);
        if (!p || !p.locked) return;
        p.locked = false;
        const b = $(`[data-rpx-pick="${key}"]`);
        if (!b) return;
        b.disabled = false;
        const lockIcon = b.querySelector("span.inline-flex");
        if (lockIcon) lockIcon.remove();
      },
      destroy() { if (engine) engine.stop(); unPad(); root.removeEventListener("click", onClick); },
    };
  }

  return { render, wire };
})();

const BeatGuide = (() => {
  /** bars: [[{ t: "I", note: false }, … 4 tokens]] */
  function render(id, { bars, guideToggle = false, startLabel = "Start" }) {
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5" data-bg="${id}">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <button type="button" data-bg-start class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} <span>${startLabel}</span></button>
          ${guideToggle ? `<label class="text-xs text-ink-400 flex items-center gap-2 cursor-pointer ml-1"><input type="checkbox" data-bg-guide checked class="accent-amber-400"> Play the note as a guide</label>` : ""}
          <span class="text-xs text-ink-500 ml-auto tabular-nums" data-bg-status></span>
        </div>
        <div class="grid gap-2">
          ${bars.map((bar, bi) => `
            <div class="bg-bar grid grid-cols-4 gap-1.5" data-bg-bar="${bi}">
              ${bar.map((tok, i) => `<div class="bg-tok ${tok.note || tok.midi ? "is-sing" : ""} ${!tok.t || tok.rest ? "is-rest" : ""}" data-bg-tok="${bi}-${i}"><span class="bg-num">${i + 1}</span><span class="bg-text">${tok.t || "○"}</span></div>`).join("")}
            </div>`).join("")}
        </div>
      </div>`;
  }

  /** opts: bpm, loops (passes through the bars), countIn (beats), getNote() -> midi, onComplete({ bars }) */
  function wire(container, id, { bpm = 70, loops = 2, countIn = 4, bars, getNote = () => 60, onComplete } = {}) {
    const root = container.querySelector(`[data-bg="${id}"]`);
    if (!root) return { destroy() {} };
    const $ = (s) => root.querySelector(s);
    const totalBars = loops * bars.length;
    let barsDone = 0;
    const clear = () => root.querySelectorAll(".bg-tok.is-on").forEach((x) => x.classList.remove("is-on"));
    const engine = new MetronomeEngine({
      bpm,
      onBeat: (t) => {
        const k = t.beatIndex - countIn;
        if (k < 0) { $("[data-bg-status]").textContent = `Get ready… ${countIn - t.beatIndex}`; return; }
        const barN = Math.floor(k / 4), beat = k % 4;
        if (barN >= totalBars) { clear(); engine.stop(); $("[data-bg-status]").textContent = "Done"; if (onComplete) onComplete({ bars: totalBars }); return; }
        if (beat === 0) barsDone = barN;
        const bi = barN % bars.length;
        clear();
        const el = $(`[data-bg-tok="${bi}-${beat}"]`);
        if (el) el.classList.add("is-on");
        $("[data-bg-status]").textContent = `Bar ${barN + 1} of ${totalBars}`;
        const tok = bars[bi][beat];
        const guide = $("[data-bg-guide]");
        // tok.midi: a melody note of its own; tok.note: "sing here" on the learner's chosen note;
        // tok.beats: hold the guide note for that many beats (following tokens can be "hold" markers);
        // tok.velocity: optional per-beat loudness for the guide note (defaults to a fixed soft cue)
        const midi = tok && (tok.midi || (tok.note ? getNote() : null));
        if (midi && (!guide || guide.checked)) PianoSynth.play(midi, { duration: (60 / bpm) * ((tok.beats || 1) - 0.25), velocity: tok.velocity ?? 0.55 });
      },
      onStop: () => { setUi(false); clear(); },
    });
    function setUi(on) { $("[data-bg-start]").innerHTML = `${icon(on ? "pause" : "play", "w-4 h-4")} <span>${on ? "Stop" : "Start again"}</span>`; }
    function onClick(e) {
      if (!e.target.closest("[data-bg-start]")) return;
      if (engine.running) { engine.stop(); $("[data-bg-status]").textContent = "Stopped"; return; }
      engine.start(); setUi(true);
    }
    root.addEventListener("click", onClick);
    root._api = { engine };
    return {
      setBpm(b) { engine.setBpm(b); },
      get barsDone() { return barsDone; },
      destroy() { engine.stop(); root.removeEventListener("click", onClick); },
    };
  }

  return { render, wire };
})();
