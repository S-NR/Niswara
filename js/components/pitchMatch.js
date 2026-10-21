/* ============================================================
   PITCH MATCHING — reusable parts for "hear a note, sing it"
   exercises (Class 4 first; later warm-ups, intervals, songs).

     ReferenceNotePlayer  shows/plays the reference (one note or a
                          chain; can hide the name for blind work)
     SelfAssessment       chip question ("Did you match it?")
     PitchGuide           tiny SVG: reference line vs. your voice
     PitchComparison      "Pitch estimate" panel (PitchAnalysis)
     PitchMatchExercise   the engine: reference + recording takes
                          (VoiceRecorder) + self-assessment +
                          optional estimate, per-user state saved
                          by the lesson through onState.

   Ear first: a pitch estimate is only offered AFTER the learner
   has judged the take themselves, and is never a score.
   ============================================================ */

const ReferenceNotePlayer = {
  render(id, { label = "Reference note" } = {}) {
    return `
      <div class="ref-player rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 flex flex-col gap-4" data-ref="${id}">
        <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80">${label}</p>
        <div class="flex items-center gap-4 min-h-[56px]">
          <span class="ref-key" aria-hidden="true"></span>
          <div>
            <div class="font-display text-4xl text-ink-50 leading-none" data-ref-name>—</div>
            <div class="text-xs text-ink-500 mt-1.5" data-ref-sub></div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5" data-ref-chain hidden></div>
        <button type="button" data-ref-play class="vr-btn vr-btn-gold self-start">${icon("play", "w-4 h-4")} Play Reference</button>
      </div>`;
  },
};

const SelfAssessment = {
  /** options: [{ value, label, tone: "good"|"maybe"|"miss"|"neutral" }] */
  render(name, { question, options, selected = null }) {
    return `
      <div class="self-assess" data-assess="${name}">
        <p class="text-sm text-ink-200 mb-2.5">${question}</p>
        <div class="flex flex-wrap gap-2">
          ${options.map((o) => `
            <button type="button" data-assess-choice="${o.value}" class="ex-chip ${selected === o.value ? "is-selected" : ""}">
              <span class="assess-dot assess-${o.tone || "neutral"}"></span>${o.label}
            </button>`).join("")}
        </div>
      </div>`;
  },
};

const PitchGuide = {
  /**
   * Reference line(s) vs. the voice curve. Nothing more — the learner is a beginner.
   * refMidis: one note, or several for a chain. octave: shift applied to the voice (sang an octave away).
   */
  render(frames, refMidis, { octave = 0, hideNames = false } = {}) {
    const W = 520, H = 170, L = 64, R = 14, T = 14, B = 22;
    const refs = refMidis.slice();
    // ±2 semitones around a single note: small differences stay visible; bigger misses sit at the edge
    const lo = Math.min(...refs) - (refs.length > 1 ? 1.5 : 2);
    const hi = Math.max(...refs) + (refs.length > 1 ? 1.5 : 2);
    const y = (m) => T + ((hi - Math.max(lo, Math.min(hi, m))) / (hi - lo)) * (H - T - B);
    const tMax = frames.length ? frames[frames.length - 1].t : 1;
    const tMin = frames.length ? frames[0].t : 0;
    const x = (t) => L + ((t - tMin) / Math.max(0.001, tMax - tMin)) * (W - L - R);

    // Break the line where the voice stopped (gaps between frames)
    const segs = [];
    let cur = [];
    frames.forEach((f, i) => {
      if (i && f.t - frames[i - 1].t > 0.12) { if (cur.length > 1) segs.push(cur); cur = []; }
      cur.push(`${x(f.t).toFixed(1)},${y(f.midi - 12 * octave).toFixed(1)}`);
    });
    if (cur.length > 1) segs.push(cur);

    const single = refs.length === 1;
    const band = single ? `<rect x="${L}" y="${y(refs[0] + 0.3)}" width="${W - L - R}" height="${y(refs[0] - 0.3) - y(refs[0] + 0.3)}" class="pg-band"/>` : "";
    const lines = [...new Set(refs)].map((m) => `
      <line x1="${L}" x2="${W - R}" y1="${y(m)}" y2="${y(m)}" class="pg-ref"/>
      <text x="${L - 8}" y="${y(m) + 4}" text-anchor="end" class="pg-label">${hideNames ? "Reference" : NoteUtils.name(m)}</text>`).join("");
    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Your voice compared with the reference">
        <text x="${W - R}" y="${T - 2}" text-anchor="end" class="pg-axis">above ↑</text>
        <text x="${W - R}" y="${H - 6}" text-anchor="end" class="pg-axis">below ↓</text>
        ${band}${lines}
        ${segs.map((s) => `<polyline points="${s.join(" ")}" class="pg-voice"/>`).join("")}
      </svg>
      <div class="flex items-center gap-4 text-[11px] text-ink-500 mt-1">
        <span class="inline-flex items-center gap-1.5"><span class="pg-key-ref"></span>Reference</span>
        <span class="inline-flex items-center gap-1.5"><span class="pg-key-voice"></span>Your voice</span>
      </div>`;
  },
};

const PitchComparison = {
  /** cmp: PitchAnalysis.compare() result, or null for chains (curve only). */
  render(analysis, cmp, refMidis, { hideNames = false, chainPrompt = "" } = {}) {
    const words = cmp ? PitchAnalysis.describe(cmp) : chainPrompt;
    const pill = cmp && cmp.reliable
      ? `<span class="text-[11px] px-2 py-0.5 rounded-full ${cmp.direction === "near" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}">${cmp.direction === "near" ? "Near" : cmp.direction === "above" ? "Above" : "Below"}</span>`
      : "";
    return `
      <div class="rounded-xl border border-white/5 bg-ink-950/60 p-4 mt-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] uppercase tracking-[0.18em] text-ink-400">Pitch estimate</span>${pill}
        </div>
        <p class="text-sm text-ink-200 mb-2">${words}</p>
        ${analysis.frames.length >= 6 && (!cmp || cmp.reliable || cmp.reason === "unsteady") ? PitchGuide.render(analysis.frames, refMidis, { octave: cmp && cmp.reliable ? cmp.octave : 0, hideNames }) : ""}
        <p class="text-[11px] text-ink-600 mt-2">An automatic estimate, not a perfect measurement — your ears are the real judge.</p>
      </div>`;
  },
};

const PitchMatchExercise = (() => {
  const analysisCache = new Map(); // mediaId -> analysis (per page session)

  /**
   * cfg: { eyebrow, title, intro, tips, flow, slots: [{ key, label, hint, focus }],
   *        assessment: { question, options, feedback: { value: text } } | null,
   *        hidden, chain, rounds, refLabel }
   */
  function render(id, cfg) {
    return `
    <div class="pm-card rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-pm="${id}">
      <div class="flex items-start justify-between gap-3 mb-2">
        <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80">${cfg.eyebrow}</p>
        <span class="pm-done text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 uppercase tracking-wide" data-pm-done hidden>${icon("check", "w-3 h-3 inline-flex align-[-1px]")} Done</span>
      </div>
      <h3 class="font-display text-xl sm:text-2xl text-ink-50 mb-2">${cfg.title}</h3>
      <div class="text-sm text-ink-400 leading-relaxed mb-4 max-w-2xl">${cfg.intro}</div>
      ${cfg.flow ? `<div class="flex flex-wrap items-center gap-1.5 mb-5">${cfg.flow.map((f, i) => `<span class="flow-chip">${f}</span>${i < cfg.flow.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>` : ""}
      ${cfg.tips ? `<div class="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 mb-5 text-sm text-ink-300 leading-relaxed">${cfg.tips}</div>` : ""}
      <div class="grid md:grid-cols-[minmax(0,240px),1fr] gap-5 items-start">
        ${ReferenceNotePlayer.render(`${id}-ref`, { label: cfg.refLabel || (cfg.chain ? "Reference notes" : "Reference note") })}
        <div class="flex flex-col gap-3" data-pm-slots></div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-3 min-h-[1.5rem]" data-pm-round></div>
    </div>`;
  }

  function slotHtml(id, cfg, slot, take, recording) {
    const recorded = !!(take && take.mediaId);
    const assessed = !!(take && take.assessment);
    const canEstimate = recorded && PitchAnalysis.isAvailable && (!cfg.assessment || assessed);
    return `
      <div class="pm-slot rounded-2xl border ${recording ? "border-red-400/30 bg-red-500/[0.04]" : "border-white/5 bg-white/[0.02]"} p-4" data-slot="${slot.key}">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p class="text-sm text-ink-100 font-medium">${slot.label}</p>
            ${slot.hint ? `<p class="text-xs text-ink-500 mt-0.5">${slot.hint}</p>` : ""}
          </div>
          <span class="text-[11px] text-ink-500" data-slot-meta>${recorded ? `Recorded · ${take.seconds || 0}s` : ""}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 mt-3">
          ${recording
            ? `<button type="button" data-slot-stop class="vr-btn vr-btn-primary is-recording"><span class="vr-rec-dot"></span> Stop</button>`
            : `<button type="button" data-slot-record class="vr-btn vr-btn-primary" ${VoiceRecorder.isSupported() ? "" : "disabled"}><span class="vr-rec-dot"></span> ${recorded ? "Record again" : "Start Recording"}</button>`}
          <button type="button" data-slot-play class="vr-btn" ${recorded && !recording ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play My Recording</button>
          <div class="h-1.5 w-20 rounded-full bg-white/5 overflow-hidden" aria-hidden="true"><div class="h-full bg-gold-400/80 w-0 transition-[width] duration-75" data-slot-level></div></div>
        </div>
        <p class="text-xs text-ink-400 mt-2 min-h-[1rem]" data-slot-status aria-live="polite"></p>
        ${recorded && cfg.assessment ? `<div class="mt-3">${SelfAssessment.render(`${id}-${slot.key}`, { question: cfg.assessment.question, options: cfg.assessment.options, selected: take.assessment })}
          <p class="text-xs text-ink-400 mt-2" data-slot-feedback>${assessed && cfg.assessment.feedback ? cfg.assessment.feedback[take.assessment] || "" : ""}</p></div>` : ""}
        ${canEstimate ? `<div class="mt-3"><button type="button" data-slot-estimate class="text-xs text-gold-300 underline hover:text-gold-200">Show pitch estimate</button><div data-slot-estimate-out></div></div>` : ""}
      </div>`;
  }

  /**
   * opts: classId, exerciseId,
   *   getNotes() -> [midi]        the reference for the current take(s)
   *   pickBlindNote(prevMidi)     blind mode: choose the next hidden note
   *   state, onState(state)       saved per user by the lesson
   *   isComplete(state) -> bool
   *   onRecorded(upload), onAssessed(value)
   */
  function wire(container, id, cfg, opts) {
    const root = container.querySelector(`[data-pm="${id}"]`);
    if (!root) return { destroy() {} };
    const refRoot = root.querySelector(`[data-ref="${id}-ref"]`);
    const slotsEl = root.querySelector("[data-pm-slots]");
    const roundEl = root.querySelector("[data-pm-round]");
    const doneEl = root.querySelector("[data-pm-done]");
    const { classId, exerciseId } = opts;

    const state = JSON.parse(JSON.stringify(opts.state || {}));
    state.takes = state.takes || {};
    if (cfg.hidden) {
      state.blindDone = state.blindDone || [];
      if (!state.blindNote) state.blindNote = opts.pickBlindNote(null);
    }
    let recordingKey = null, session = null, seq = null;

    const notes = () => (cfg.hidden ? [state.blindNote] : opts.getNotes());
    const revealed = () => !cfg.hidden || Object.values(state.takes).some((t) => t.assessment);

    function save() { if (opts.onState) opts.onState(JSON.parse(JSON.stringify(state))); }

    /* ---- reference display ---- */
    function renderRef() {
      const ns = notes();
      const nameEl = refRoot.querySelector("[data-ref-name]");
      const subEl = refRoot.querySelector("[data-ref-sub]");
      const chainEl = refRoot.querySelector("[data-ref-chain]");
      if (cfg.hidden && !revealed()) {
        nameEl.textContent = "?";
        subEl.textContent = "Listen to the reference. Then match it.";
      } else if (cfg.hidden) {
        nameEl.textContent = NoteUtils.name(ns[0]);
        subEl.textContent = "Revealed after your answer";
      } else if (cfg.chain) {
        nameEl.textContent = `${ns.length} notes`;
        subEl.textContent = "Played one after another — the chips light up as each one sounds.";
      } else {
        nameEl.textContent = NoteUtils.name(ns[0]);
        subEl.textContent = "Listen carefully.";
      }
      chainEl.hidden = !cfg.chain;
      if (cfg.chain) chainEl.innerHTML = ns.map((m, i) => `<span class="chain-dot" data-chain-i="${i}">${NoteUtils.name(m)}</span>`).join(`<span class="text-ink-700 text-xs">→</span>`);
    }

    function playRef() {
      if (session) return; // never play into a live recording
      if (seq) seq.cancel();
      VoiceRecorder.stopPlayback();
      const ns = notes();
      const btn = refRoot.querySelector("[data-ref-play]");
      btn.classList.add("is-playing");
      seq = PianoSynth.playSequence(ns, {
        duration: cfg.chain ? 0.9 : 1.6, gap: 0.25,
        onNote: (i) => refRoot.querySelectorAll("[data-chain-i]").forEach((d) => d.classList.toggle("is-lit", Number(d.dataset.chainI) === i)),
      });
      seq.then(() => btn.classList.remove("is-playing"));
    }

    /* ---- slots ---- */
    function renderSlots() {
      slotsEl.innerHTML = cfg.slots.map((s) => slotHtml(id, cfg, s, state.takes[s.key], recordingKey === s.key)).join("");
      const done = opts.isComplete(state);
      doneEl.hidden = !done;
      renderRound();
    }

    function slotEl(key) { return slotsEl.querySelector(`[data-slot="${key}"]`); }
    function setSlotStatus(key, text) { const el = slotEl(key); if (el) el.querySelector("[data-slot-status]").textContent = text; }

    async function record(key) {
      if (seq) seq.cancel();
      recordingKey = key;
      renderSlots();
      setSlotStatus(key, "Starting microphone…");
      try {
        session = await VoiceRecorder.start({
          maxSeconds: cfg.chain ? 20 : 15,
          onTick: (s) => setSlotStatus(key, `Recording… ${Utils.formatSeconds(s)} — sing gently, then press Stop`),
          onLevel: (v) => { const el = slotEl(key); if (el) el.querySelector("[data-slot-level]").style.width = `${Math.round(v * 100)}%`; },
        });
      } catch (e) {
        recordingKey = null;
        renderSlots();
        setSlotStatus(key, e.reason === "unsupported" ? "Recording isn't supported in this browser." : "Microphone access was blocked. Allow it in your browser's site settings, then try again.");
        return;
      }
      setSlotStatus(key, "Recording… sing gently, then press Stop");
      const take = await session.ended;
      session = null;
      recordingKey = null;
      if (!take || !take.blob.size) { renderSlots(); if (take) setSlotStatus(key, "Nothing was recorded — try again."); return; }
      const ns = notes();
      const upload = await VoiceRecorder.saveToClass(classId, take, {
        name: `${cfg.title} — ${cfg.hidden ? "blind note" : ns.map((m) => NoteUtils.name(m)).join("-")}`,
        exercise: `match-${exerciseId}`, slot: key, referenceNotes: ns.map((m) => NoteUtils.name(m)),
      });
      if (!upload) { renderSlots(); setSlotStatus(key, "Couldn't save the recording on this device."); return; }
      state.takes[key] = { mediaId: upload.mediaId, seconds: take.seconds, notes: ns, at: upload.date };
      save();
      if (opts.onRecorded) opts.onRecorded(upload);
      renderSlots();
      setSlotStatus(key, cfg.assessment ? "Saved. Play the reference, then your recording — and compare." : "Saved. Play it back and listen.");
    }

    async function play(key) {
      const take = state.takes[key];
      if (!take) return;
      if (seq) seq.cancel();
      setSlotStatus(key, "Playing your recording…");
      const ok = await VoiceRecorder.play(take.mediaId, { onEnded: () => setSlotStatus(key, "") });
      if (!ok) setSlotStatus(key, "This recording isn't available on this device yet.");
    }

    function assess(key, value) {
      const take = state.takes[key];
      if (!take) return;
      take.assessment = value;
      save();
      if (opts.onAssessed) opts.onAssessed(value);
      renderRef();
      renderSlots();
    }

    async function estimate(key) {
      const take = state.takes[key];
      const el = slotEl(key);
      if (!take || !el) return;
      const out = el.querySelector("[data-slot-estimate-out]");
      out.innerHTML = `<p class="text-xs text-ink-500 mt-2">Estimating…</p>`;
      try {
        let analysis = analysisCache.get(take.mediaId);
        if (!analysis) {
          const url = await Media.getUrl(take.mediaId);
          if (!url) throw new Error("missing");
          analysis = await PitchAnalysis.analyzeBlob(await (await fetch(url)).blob());
          analysisCache.set(take.mediaId, analysis);
        }
        const refs = take.notes;
        const slot = cfg.slots.find((s) => s.key === key);
        const cmp = cfg.chain ? null : PitchAnalysis.compare(analysis, refs[0], { focus: slot.focus || "all" });
        if (cmp && cmp.reliable) { take.estimate = { cents: cmp.cents, octave: cmp.octave }; save(); }
        out.innerHTML = PitchComparison.render(analysis, cmp, refs, {
          hideNames: false,
          chainPrompt: "Did your line step up through the reference notes? Each step should sit near its own line.",
        });
        el.querySelector("[data-slot-estimate]").hidden = true;
      } catch (e) {
        out.innerHTML = `<p class="text-xs text-ink-500 mt-2">Couldn't estimate this recording — trust your ears for this one.</p>`;
      }
    }

    /* ---- blind rounds ---- */
    function renderRound() {
      if (!cfg.hidden) { roundEl.innerHTML = ""; return; }
      const take = state.takes[cfg.slots[0].key];
      const total = cfg.rounds || 3;
      const finished = !!(take && take.assessment);
      const doneCount = state.blindDone.length + (finished ? 1 : 0);
      const current = state.blindDone.length + 1;
      roundEl.innerHTML = `
        <span class="text-xs text-ink-500">${current <= total ? `Blind note ${current} of ${total}` : `Extra note ${current - total}`}${doneCount >= total ? " · all done ✓" : ""}</span>
        ${finished ? `<button type="button" data-pm-next class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-400/30 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors">${doneCount >= total ? "Try another note" : "Next note"} ${icon("arrowRight", "w-3.5 h-3.5")}</button>` : ""}`;
    }

    function nextBlind() {
      const key = cfg.slots[0].key;
      const take = state.takes[key];
      if (take && take.assessment) state.blindDone.push({ note: NoteUtils.name(state.blindNote), assessment: take.assessment, mediaId: take.mediaId, estimate: take.estimate || null });
      state.blindNote = opts.pickBlindNote(state.blindNote);
      delete state.takes[key];
      save();
      renderRef();
      renderSlots();
      playRef();
    }

    function onClick(e) {
      if (e.target.closest("[data-ref-play]")) { playRef(); return; }
      const slot = e.target.closest("[data-slot]");
      const key = slot && slot.dataset.slot;
      if (e.target.closest("[data-slot-record]")) { record(key); return; }
      if (e.target.closest("[data-slot-stop]")) { if (session) session.stop(); return; }
      if (e.target.closest("[data-slot-play]")) { play(key); return; }
      const choice = e.target.closest("[data-assess-choice]");
      if (choice && key) { assess(key, choice.dataset.assessChoice); return; }
      if (e.target.closest("[data-slot-estimate]")) { estimate(key); return; }
      if (e.target.closest("[data-pm-next]")) nextBlind();
    }

    root.addEventListener("click", onClick);
    renderRef();
    renderSlots();

    return {
      /** The lesson changed the learner's reference note (ex. a new comfortable note was chosen). */
      refresh() { if (!session) { renderRef(); renderSlots(); } },
      getState: () => state,
      destroy() {
        root.removeEventListener("click", onClick);
        if (session) session.cancel();
        if (seq) seq.cancel();
      },
    };
  }

  return { render, wire };
})();
