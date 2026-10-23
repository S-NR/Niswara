/* ============================================================
   VOCAL CONTROL TOOLS (Class 9 "Basic Vocal Control" first).

     LoudnessAnalysis     loudness of a recording (RMS) — an honest,
                          relative estimate from the learner's own mic
     VolumeEnvelope       soft → medium → soft guide line with a moving
                          cursor; can overlay the learner's loudness curve
     LoudnessCompare      "Take 2 was a little softer than Take 1"
     RecordingComparison  pick two takes from this class, play each,
                          "What changed?" (never claims one is better)
     ControlCheck         ✓ Comfortable / △ Developing / ○ Needs more
                          practice, per area

   The exercises themselves are configurations of existing engines:
     SteadyNoteExercise, OnsetReleaseExercise, VolumeControlExercise,
     DynamicExercise, PitchTransitionExercise  -> PitchMatchExercise (Class 4)
     ControlledDurationExercise, VocalControlExercise -> BeatGuide (Class 6)
   (see VOCAL_CONTROL_EXERCISES in js/lessons/basicVocalControl.js).
   ============================================================ */

const LoudnessAnalysis = {
  /** -> { curve: [0–1] (relative to the take's own peak), db: average loudness of the voiced part (dBFS) } */
  async analyze(blob, points = 60) {
    const { samples, sampleRate } = await PitchAnalysis.decode(blob);
    const win = Math.max(1, Math.floor(samples.length / points));
    const rms = [];
    for (let p = 0; p < points; p++) {
      let s = 0;
      const end = Math.min(samples.length, (p + 1) * win);
      for (let i = p * win; i < end; i++) s += samples[i] * samples[i];
      rms.push(Math.sqrt(s / Math.max(1, end - p * win)));
    }
    const max = Math.max(...rms, 1e-9);
    const voiced = rms.filter((v) => v > max * 0.2); // ignore the silent start/end of the take
    const mean = voiced.length ? voiced.reduce((a, b) => a + b, 0) / voiced.length : 1e-9;
    return { curve: rms.map((v) => v / max), db: Math.round(20 * Math.log10(mean) * 10) / 10, seconds: samples.length / sampleRate };
  },

  /** Beginner wording for B relative to A. */
  compareText(aDb, bDb, aLabel = "the first take", bLabel = "This take") {
    const d = bDb - aDb;
    if (Math.abs(d) < 1.5) return `${bLabel} was about the same loudness as ${aLabel}.`;
    const how = Math.abs(d) < 5 ? "a little" : "clearly";
    return `${bLabel} was ${how} ${d < 0 ? "softer" : "louder"} than ${aLabel}.`;
  },
};

const VolumeEnvelope = (() => {
  const W = 520, H = 150, L = 14, R = 14, T = 16, B = 22;
  // Target: soft -> medium -> soft (a gentle hill, never a big jump)
  const target = (x) => 0.2 + 0.6 * Math.sin(Math.PI * x);
  const xy = (x, v) => [L + x * (W - L - R), T + (1 - v) * (H - T - B)];

  function svg(userCurve) {
    const tpts = Array.from({ length: 41 }, (_, i) => xy(i / 40, target(i / 40)).map((n) => n.toFixed(1)).join(",")).join(" ");
    const upts = userCurve && userCurve.length ? userCurve.map((v, i) => xy(i / (userCurve.length - 1), Math.min(1, v * 0.85)).map((n) => n.toFixed(1)).join(",")).join(" ") : "";
    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Volume guide: soft, then medium, then soft">
        <text x="${L}" y="${H - 6}" class="pg-label">soft</text>
        <text x="${W / 2}" y="${T - 2}" text-anchor="middle" class="pg-label">medium</text>
        <text x="${W - R}" y="${H - 6}" text-anchor="end" class="pg-label">soft</text>
        <polyline points="${tpts}" class="ve-target"/>
        ${upts ? `<polyline points="${upts}" class="pg-voice"/>` : ""}
        <line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" class="ve-cursor" data-ve-cursor style="opacity:0"/>
      </svg>`;
  }

  function render(id, { seconds = 6 } = {}) {
    return `
      <div class="rounded-2xl border border-white/5 bg-ink-950/60 p-4" data-ve="${id}">
        <div data-ve-svg>${svg(null)}</div>
        <div class="flex flex-wrap items-center gap-3 mt-2">
          <button type="button" data-ve-start class="vr-btn">${icon("play", "w-3.5 h-3.5")} Follow the guide (${seconds}s)</button>
          <span class="text-xs text-ink-500" data-ve-status>Soft → a little louder → soft again. Small changes only.</span>
          <span class="text-[11px] text-ink-500 ml-auto" data-ve-legend hidden><span class="inline-flex items-center gap-1.5"><span class="ve-key-target"></span>guide</span> <span class="inline-flex items-center gap-1.5 ml-3"><span class="pg-key-voice"></span>your loudness</span></span>
        </div>
      </div>`;
  }

  /** opts: seconds, getNote(), onGuideDone(). Returns { setCurve(curve), destroy } */
  function wire(container, id, { seconds = 6, getNote = () => 60, onGuideDone } = {}) {
    const root = container.querySelector(`[data-ve="${id}"]`);
    if (!root) return { setCurve() {}, destroy() {} };
    let raf = null, running = false;
    function cursorAt(x) {
      const c = root.querySelector("[data-ve-cursor]");
      if (!c) return;
      const px = L + x * (W - L - R);
      c.setAttribute("x1", px); c.setAttribute("x2", px);
      c.style.opacity = x >= 0 ? 1 : 0;
    }
    function start() {
      if (running) return;
      running = true;
      PianoSynth.play(getNote(), { duration: 1.2, velocity: 0.5 });
      const status = root.querySelector("[data-ve-status]");
      status.textContent = "Listen to the note… then sing it and follow the line.";
      const t0 = performance.now() + 1600;
      const step = () => {
        const x = (performance.now() - t0) / (seconds * 1000);
        if (x < 0) { raf = requestAnimationFrame(step); return; }
        if (x >= 1) { cursorAt(-1); running = false; status.textContent = "Done — rest a moment before the next try."; if (onGuideDone) onGuideDone(); return; }
        cursorAt(x);
        status.textContent = x < 0.33 ? "Comfortably soft…" : x < 0.66 ? "A little louder — still easy" : "Back to soft…";
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    const onClick = (e) => { if (e.target.closest("[data-ve-start]")) start(); };
    root.addEventListener("click", onClick);
    return {
      setCurve(curve) { root.querySelector("[data-ve-svg]").innerHTML = svg(curve); root.querySelector("[data-ve-legend]").hidden = !curve; },
      destroy() { cancelAnimationFrame(raf); root.removeEventListener("click", onClick); },
    };
  }

  return { render, wire, svg };
})();

const LoudnessCompare = {
  /** takes: [{ label, db }] (missing db = not recorded). */
  render(takes) {
    const have = takes.filter((t) => typeof t.db === "number");
    if (have.length < 2) return `<p class="text-xs text-ink-500">Record the takes to compare their loudness.</p>`;
    const min = Math.min(...have.map((t) => t.db)) - 6, max = Math.max(...have.map((t) => t.db));
    const pct = (db) => Math.max(8, Math.round(((db - min) / Math.max(1, max - min)) * 100));
    const first = have[0];
    return `
      <p class="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-3">Loudness estimate from your microphone</p>
      <div class="flex flex-col gap-2">
        ${takes.map((t) => `
          <div class="flex items-center gap-3 text-xs">
            <span class="w-36 shrink-0 text-ink-300">${t.label}</span>
            <div class="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">${typeof t.db === "number" ? `<div class="h-full rounded-full bg-gradient-to-r from-teal-500/70 to-teal-300/80" style="width:${pct(t.db)}%"></div>` : ""}</div>
          </div>`).join("")}
      </div>
      <ul class="text-xs text-ink-400 mt-3 flex flex-col gap-1">
        ${have.slice(1).map((t) => `<li>${LoudnessAnalysis.compareText(first.db, t.db, `“${first.label}”`, `“${t.label}”`)}</li>`).join("")}
      </ul>
      <p class="text-[11px] text-ink-600 mt-2">Relative only — it depends on your microphone and how far away you were. Small differences are exactly right.</p>`;
  },
};

const RecordingComparison = (() => {
  const CHANGES = ["More stable", "Better timing", "Smoother transition", "Better volume control", "Less tension", "No obvious difference", "Not sure"];

  function render(id) {
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-rcmp="${id}">
        <div class="grid sm:grid-cols-2 gap-4" data-rcmp-pick></div>
        <div class="mt-5" data-rcmp-changes></div>
        <p class="text-xs text-ink-500 mt-3">There's no right answer — the second attempt isn't automatically better. Just describe what you hear.</p>
      </div>`;
  }

  /** opts: list() -> uploads [{ mediaId, name, date }], saved ({ a, b, changed }), onChange(state) */
  function wire(container, id, { list, saved = {}, onChange }) {
    const root = container.querySelector(`[data-rcmp="${id}"]`);
    if (!root) return { refresh() {}, destroy() {} };
    const state = { a: saved.a || null, b: saved.b || null, changed: saved.changed || [] };
    const fmt = (u) => `${u.name.replace(/\.(webm|m4a|ogg)$/, "")} · ${new Date(u.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    function paint() {
      const items = list();
      const host = root.querySelector("[data-rcmp-pick]");
      if (items.length < 2) { host.innerHTML = `<p class="text-sm text-ink-500 sm:col-span-2">Record at least two takes in the exercises above — then compare them here.</p>`; root.querySelector("[data-rcmp-changes]").innerHTML = ""; return; }
      if (!items.some((u) => u.mediaId === state.a)) state.a = items[0].mediaId;
      if (!items.some((u) => u.mediaId === state.b) || state.b === state.a) state.b = items[items.length - 1].mediaId;
      host.innerHTML = ["a", "b"].map((k, i) => `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <p class="text-sm text-ink-100 mb-2">Attempt ${i + 1}</p>
          <select data-rcmp-sel="${k}" class="field !py-2 mb-3" aria-label="Choose attempt ${i + 1}">
            ${items.map((u) => `<option value="${u.mediaId}" ${u.mediaId === state[k] ? "selected" : ""}>${Utils.escapeHtml(fmt(u))}</option>`).join("")}
          </select>
          <button type="button" data-rcmp-play="${k}" class="vr-btn">${icon("play", "w-4 h-4")} Play</button>
        </div>`).join("");
      root.querySelector("[data-rcmp-changes]").innerHTML =
        `<p class="font-display text-lg text-ink-100 mb-3">What changed?</p>` +
        ObservationChecklist.render(`${id}-obs`, [{ key: "changed", title: "", prompt: "Choose any that fit", options: CHANGES }], { changed: state.changed });
      ObservationChecklist.wire(root, `${id}-obs`, {
        selected: { changed: state.changed },
        onChange: (_, values) => { state.changed = values; if (onChange) onChange({ ...state }); },
      });
    }
    function onClick(e) {
      const play = e.target.closest("[data-rcmp-play]");
      if (play) VoiceRecorder.play(state[play.dataset.rcmpPlay]);
    }
    function onSel(e) {
      const sel = e.target.closest("[data-rcmp-sel]");
      if (!sel) return;
      state[sel.dataset.rcmpSel] = sel.value;
      if (onChange) onChange({ ...state });
    }
    root.addEventListener("click", onClick);
    root.addEventListener("change", onSel);
    paint();
    return { refresh: paint, destroy() { root.removeEventListener("click", onClick); root.removeEventListener("change", onSel); } };
  }

  return { render, wire, CHANGES };
})();

const ControlCheck = {
  LEVELS: [
    { value: "comfortable", mark: "✓", label: "Comfortable" },
    { value: "developing", mark: "△", label: "Developing" },
    { value: "practice", mark: "○", label: "Needs more practice" },
  ],
  /** rows: [{ key, area, question, levels? }] (a row's own levels override the shared ones). levels: optional custom [{ value, mark, label }] (defaults to ControlCheck.LEVELS) — e.g. Class 8's tension scale reuses this same chip-row shape with its own wording. */
  render(id, rows, selected = {}, levels = ControlCheck.LEVELS) {
    return `
      <div class="flex flex-col gap-3" data-cc="${id}">
        ${rows.map((r) => `
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1"><p class="text-[11px] uppercase tracking-wider text-gold-400/80">${r.area}</p><p class="text-sm text-ink-200">${r.question}</p></div>
            <div class="flex flex-wrap gap-1.5">
              ${(r.levels || levels).map((l) => `<button type="button" data-cc-row="${r.key}" data-cc-value="${l.value}" aria-pressed="${selected[r.key] === l.value}" class="ex-chip !text-xs !py-1.5 ${selected[r.key] === l.value ? "is-selected" : ""}"><span class="font-display">${l.mark}</span> ${l.label}</button>`).join("")}
            </div>
          </div>`).join("")}
      </div>`;
  },
  /** onChange(key, value). Returns cleanup. */
  wire(container, id, { onChange }) {
    const root = container.querySelector(`[data-cc="${id}"]`);
    if (!root) return () => {};
    const onClick = (e) => {
      const chip = e.target.closest("[data-cc-row]");
      if (!chip) return;
      root.querySelectorAll(`[data-cc-row="${chip.dataset.ccRow}"]`).forEach((b) => { b.classList.toggle("is-selected", b === chip); b.setAttribute("aria-pressed", String(b === chip)); });
      onChange(chip.dataset.ccRow, chip.dataset.ccValue);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  },
};
