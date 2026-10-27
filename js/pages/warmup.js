/* ============================================================
   WARM-UP PAGES — the common "🎤 Warm-up" section.

     #/warmup          WarmupPage: dashboard (Quick / Full /
                       Performance, history, foundation skills)
     #/warmup/:mode    WarmupSessionPage: the guided "vocal studio"
                       player. ?return=<route> comes back there
                       (e.g. a recording) once the warm-up is done.

   Both show the locked screen until Classes 1–9 are completed.
   Not a class, not a test: no scores, no streaks, every step can
   be skipped, and stopping is always fine.

   Reuses: VirtualPiano + PianoSynth (Class 3), BeatGuide on the
   Class 6 metronome engine, VoiceRecorder (Classes 3–5), the
   Class 2 breathing orb and the Class 1 tile highlight. Warm-up
   takes are listened to and discarded — never saved or uploaded.
   ============================================================ */

const { WarmupPage, WarmupSessionPage } = (() => {
  const N = (m) => NoteUtils.name(m);

  /* ---------- shared views ---------- */
  const SAFETY = `
    <div class="wu-safety rounded-2xl px-4 py-3 text-xs text-ink-400 leading-relaxed">
      <span class="text-ink-200">Warm-up should feel comfortable.</span>
      Never force your voice to reach a note. Never hold your breath unnecessarily.
      If you experience pain, significant dizziness, unusual breathlessness, or persistent throat discomfort, stop and rest.
      <span class="text-ink-600">General comfort guidance, not medical advice.</span>
    </div>`;

  const CORE_MESSAGE = `
    <div class="text-center py-2">
      <p class="font-display text-lg sm:text-xl text-ink-300 leading-relaxed">Your classes teach you the skills.<br>
      <span class="text-ink-100">Your warm-up keeps those skills connected.</span><br>
      <span class="text-gold-300">Your performance puts them into music.</span></p>
    </div>`;

  function micHero(locked = false) {
    return `<div class="wu-mic-lg ${locked ? "is-locked" : ""} mx-auto" aria-hidden="true">${locked ? icon("lock", "w-10 h-10") : "🎤"}</div>`;
  }

  function lockedView() {
    const st = Warmup.status();
    const completed = Store.getState().completedClassIds;
    const current = Store.getState().currentClassId;
    return `
    <section class="wu-studio">
      <div class="max-w-xl mx-auto px-5 lg:px-8 py-14 sm:py-20 text-center">
        ${micHero(true)}
        <p class="text-[11px] tracking-[0.3em] uppercase text-ink-500 mt-8 mb-2">Common · Warm-up</p>
        <h1 class="font-display text-3xl sm:text-4xl text-ink-50 mb-3">Warm-up Locked</h1>
        <p class="text-ink-300 mb-1">Complete Classes 1–9 to unlock your personalized singing warm-up.</p>
        <p class="text-sm text-ink-500 mb-8">Complete your Foundation classes first.</p>
        <div class="max-w-sm mx-auto mb-2">${Components.ProgressBar(Math.round((st.done / st.total) * 100), "h-2.5")}</div>
        <p class="text-sm text-ink-300 tabular-nums mb-8">${st.done} / ${st.total} classes completed</p>
        <ul class="grid gap-1.5 text-left max-w-sm mx-auto mb-9">
          ${Warmup.FOUNDATION_IDS.map((id) => {
            const c = Store.getClassById(id);
            const ok = completed.includes(id);
            return `<li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-200" : "text-ink-500"}">
              <span class="w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>
              Class ${c.number} — ${c.title}</li>`;
          }).join("")}
        </ul>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="#/classes/${current}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue Classes ${icon("arrowRight", "w-3.5 h-3.5")}</a>
          <a href="#/classes" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">View Classes</a>
        </div>
      </div>
    </section>`;
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */

  const REVISITS = [
    [1, "Listening & awareness"], [2, "Breathing"], [3, "Pitch awareness"], [4, "Pitch matching"], [5, "Listening to your own voice"],
    [6, "Rhythm & timing"], [7, "Basic vocal warm-up"], [8, "Vocal relaxation"], [9, "Basic vocal control"],
  ];
  const FOUNDATION_SKILLS = ["breath", "pitch", "listen", "rhythm", "sound", "relax", "control"];
  const STRUGGLES = [
    ["Pitch difficulty", [3, 4]], ["Breathing difficulty", [2]], ["Rhythm difficulty", [6]],
    ["Relaxation difficulty", [8]], ["Vocal control difficulty", [9]],
  ];

  function routineCard(r) {
    return `
      <div class="wu-card rounded-3xl p-5 sm:p-6 flex flex-col">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-300 mb-2">${r.label}</p>
        <p class="font-display text-3xl text-ink-50 mb-1">${r.time}</p>
        <p class="text-sm text-ink-400 mb-5">“${r.use}”</p>
        <p class="text-xs text-ink-500 mb-5">${r.steps.length} gentle steps</p>
        <a href="#/warmup/${r.key}" class="mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">${icon("play", "w-4 h-4")} Start</a>
      </div>`;
  }

  function emphasisPicker() {
    const current = Warmup.emphasis();
    const suggested = Warmup.suggestedEmphasis();
    const opt = (value, label) => `<button type="button" data-emphasis="${value}" class="ex-chip ${(current || "none") === value ? "is-selected" : ""}">${label}</button>`;
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <p class="text-sm text-ink-100 mb-1">Today's emphasis <span class="text-ink-500">(optional)</span></p>
        <p class="text-xs text-ink-500 mb-3">Gives one step a little more time. ${suggested ? `Suggested from the focus you chose in Class 10 — ` : ""}you stay in control and can change it any time.</p>
        <div class="flex flex-wrap gap-2">
          ${opt("none", "No emphasis")}
          ${Warmup.EMPHASIS.map((e) => opt(e.value, e.label + (e.value === suggested ? " · suggested" : ""))).join("")}
        </div>
      </div>`;
  }

  function historyView() {
    const st = Warmup.stats();
    if (!st.total) {
      return Components.EmptyState("mic", "No warm-ups yet", "Your finished warm-ups will appear here — just for your own awareness.");
    }
    const tile = (value, label) => `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="font-display text-2xl text-ink-50 tabular-nums">${value}</p><p class="text-xs text-ink-500 uppercase tracking-wide mt-1">${label}</p></div>`;
    const recent = Warmup.sessions().slice(0, 6).map((s) => `
      <li class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5 text-sm">
        <span class="text-ink-200">${Warmup.ROUTINES[s.type] ? Warmup.ROUTINES[s.type].label : s.type}</span>
        <span class="text-xs text-ink-500 tabular-nums">${new Date(s.completedAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${Math.max(1, Math.round(s.duration / 60))} min${s.skippedSteps && s.skippedSteps.length ? ` · ${s.skippedSteps.length} skipped` : ""}</span>
      </li>`).join("");
    return `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        ${tile(st.total, "Warm-ups completed")}${tile(st.byType.quick, "Quick")}${tile(st.byType.full, "Full")}${tile(st.byType.performance, "Performance")}
      </div>
      <div class="flex flex-wrap gap-x-8 gap-y-1 text-sm mb-5">
        ${st.mostPracticed ? `<p class="text-ink-500">Most practiced: <span class="text-ink-200">${st.mostPracticed}</span></p>` : ""}
        ${st.mostSkipped ? `<p class="text-ink-500">Most skipped: <span class="text-ink-200">${st.mostSkipped}</span></p>` : ""}
      </div>
      <ul class="flex flex-col gap-2">${recent}</ul>
      <p class="text-xs text-ink-600 mt-4">For awareness only — there's no streak to keep and nothing to compete with.</p>`;
  }

  function foundationView() {
    return `
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        ${FOUNDATION_SKILLS.map((k) => {
          const s = Warmup.STEPS[k];
          return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-3">
            <span class="text-2xl" aria-hidden="true">${s.icon}</span>
            <div class="flex-1 min-w-0"><p class="text-sm text-ink-100">${s.skill}</p><p class="text-xs text-ink-500">${Warmup.fromLabel(k)}</p></div>
            <a href="#/classes/${Warmup.classId(s.classes[0])}" class="text-xs text-gold-300 hover:text-gold-200 shrink-0">Review Class</a>
          </div>`;
        }).join("")}
      </div>
      <div class="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-500/[0.07] to-transparent p-5 sm:p-7">
        <p class="font-display text-xl text-teal-200 mb-1">Warm-up keeps your foundation active.</p>
        <p class="font-display text-xl text-ink-100 mb-4">It does not replace your classes.</p>
        <p class="text-sm text-ink-300 mb-4">If you struggle with an exercise, return to the related class and practice the underlying skill.</p>
        <ul class="grid sm:grid-cols-2 gap-2 text-sm">
          ${STRUGGLES.map(([t, classes]) => `<li class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-4 py-2.5">
            <span class="text-ink-300">${t}</span>
            <span class="flex gap-2">${classes.map((n) => `<a href="#/classes/${Warmup.classId(n)}" class="text-gold-300 hover:text-gold-200">Class ${n}</a>`).join("<span class=\"text-ink-600\">/</span>")}</span>
          </li>`).join("")}
        </ul>
      </div>`;
  }

  function workflowStrip() {
    const steps = ["LEARN · Classes 1–9", "UNLOCK · Warm-up", "PRACTICE · Warm-up + Classes", "PROGRESS · Classes 10+", "RECORD", "PERFORM"];
    return `<div class="flex flex-wrap justify-center items-center gap-1.5">${steps.map((s, i) => `<span class="flow-chip tracking-[0.08em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>
      <p class="text-center font-display italic text-ink-300 mt-4">“Before I sing, I prepare.”</p>`;
  }

  const WarmupPage = {
    render() {
      if (!Warmup.isUnlocked()) return lockedView();
      return `
      <section class="wu-studio">
        <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 sm:py-16">
          <div class="text-center mb-12">
            ${micHero()}
            <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mt-8 mb-2">Common</p>
            <h1 class="font-display text-4xl sm:text-5xl text-ink-50 tracking-[0.08em] mb-3">WARM-UP</h1>
            <p class="text-lg text-ink-300">Prepare your voice before you sing.</p>
            <p class="text-sm text-ink-500 mt-2">Your foundation is ready. Build your personal pre-singing routine.</p>
          </div>

          <div class="grid sm:grid-cols-3 gap-4 mb-6">
            ${["quick", "full", "performance"].map((k) => routineCard(Warmup.ROUTINES[k])).join("")}
          </div>
          <div class="mb-6">${emphasisPicker()}</div>
          <div class="mb-16">${SAFETY}</div>

          <div class="mb-16 max-w-3xl mx-auto">
            <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-2">About this routine</p>
            <h2 class="font-display text-3xl text-ink-50 mb-1">Your Singing Warm-up</h2>
            <p class="font-display italic text-lg text-ink-300 mb-5">“Prepare. Connect. Sing.”</p>
            <p class="text-ink-300 leading-relaxed">You've already learned the foundations.</p>
            <p class="text-ink-300 leading-relaxed mb-5">Now let's combine them into a short routine you can use before singing — practice, a class, a recording, a song or a performance.</p>
            <details class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 mb-4">
              <summary class="cursor-pointer text-sm text-ink-200 select-none">This routine revisits Classes 1–9</summary>
              <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-sm">
                ${REVISITS.map(([n, t]) => `<li class="text-ink-400"><a href="#/classes/${Warmup.classId(n)}" class="text-ink-200 hover:text-gold-300">Class ${n}</a> — ${t}</li>`).join("")}
              </ul>
            </details>
            <p class="text-sm text-ink-500">This is a preparation routine — not a replacement for the classes.</p>
          </div>

          <div class="mb-16">
            <h2 class="font-display text-2xl text-ink-50 mb-5">Your Warm-up Journey</h2>
            <div data-wu-history>${historyView()}</div>
          </div>

          <div class="mb-16">
            <h2 class="font-display text-2xl text-ink-50 mb-1">Foundation Skills</h2>
            <p class="text-sm text-ink-500 mb-5">Every warm-up step comes from a class you've completed.</p>
            ${foundationView()}
          </div>

          <div class="flex flex-col gap-8">${CORE_MESSAGE}${workflowStrip()}</div>
        </div>
      </section>`;
    },

    mount(container) {
      if (!Warmup.isUnlocked()) return () => {};
      function onClick(e) {
        const chip = e.target.closest("[data-emphasis]");
        if (!chip) return;
        Warmup.setEmphasis(chip.dataset.emphasis);
        container.querySelectorAll("[data-emphasis]").forEach((c) => c.classList.toggle("is-selected", c === chip));
      }
      container.addEventListener("click", onClick);
      // History from other devices
      Warmup.load().then((changed) => {
        const host = container.querySelector("[data-wu-history]");
        if (changed && host && host.isConnected) host.innerHTML = historyView();
      });
      return () => container.removeEventListener("click", onClick);
    },
  };

  /* ============================================================
     SESSION — step views. Each: render(step, ctx) -> html,
     wire(root, step, ctx) -> { destroy?, pause? }
     ============================================================ */

  const chips = (name, options, { multi = false } = {}) => `
    <div class="flex flex-wrap justify-center gap-2" data-chips="${name}" ${multi ? "data-multi" : ""}>
      ${options.map((o) => `<button type="button" data-chip="${o}" class="ex-chip wu-chip">${o}</button>`).join("")}
    </div>`;

  /** Single/multi-select chip rows inside root; onChange(name, selectedValues). Returns cleanup. */
  function wireChips(root, onChange) {
    function onClick(e) {
      const chip = e.target.closest("[data-chip]");
      if (!chip) return;
      const group = chip.closest("[data-chips]");
      if (group.hasAttribute("data-multi")) chip.classList.toggle("is-selected");
      else group.querySelectorAll("[data-chip]").forEach((c) => c.classList.toggle("is-selected", c === chip));
      onChange(group.dataset.chips, [...group.querySelectorAll("[data-chip].is-selected")].map((c) => c.dataset.chip));
    }
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  const flow = (items, vertical = false) => `
    <div class="flex ${vertical ? "flex-col" : "flex-wrap justify-center"} items-center gap-1.5">
      ${items.map((f, i) => `<span class="flow-chip">${f}</span>${i < items.length - 1 ? `<span class="text-ink-600 text-xs">${vertical ? "↓" : "→"}</span>` : ""}`).join("")}
    </div>`;

  const cues = (lines) => `<ul class="wu-cues flex flex-col gap-2 text-ink-200 text-base sm:text-lg text-center">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  const quiet = (html) => `<p class="text-sm text-ink-500 text-center">${html}</p>`;
  const playBtn = (attr, label) => `<button type="button" ${attr} class="vr-btn vr-btn-gold wu-big-btn">${icon("play", "w-4 h-4")} ${label}</button>`;

  const STEP_VIEWS = {
    /* Step 1 — Arrive & Listen (Class 1) */
    arrive: {
      render: () => `
        ${cues(["Sit or stand comfortably.", "Relax your shoulders.", "Notice how your voice feels right now.", "Take a moment to just listen."])}
        <div class="mt-8">
          <p class="text-center text-ink-50 font-display text-xl mb-4">How does my voice feel today?</p>
          ${chips("feel", ["Fresh", "Normal", "Tired", "Dry", "Tense", "Not sure"])}
          <p class="text-sm text-ink-300 text-center mt-4 min-h-[1.25rem]" data-arrive-reply aria-live="polite"></p>
        </div>
        <p class="font-display italic text-teal-200 text-center text-lg mt-6">Today is not a day to force your voice.</p>`,
      wire(root) {
        const replies = {
          Fresh: "Lovely. Keep it gentle anyway — this is preparation, not a workout.",
          Normal: "Good. Keep it gentle — this is preparation, not a workout.",
          Tired: "Thank you for noticing. Keep everything soft today, and skip anything that doesn't feel comfortable.",
          Dry: "Thank you for noticing. Keep everything soft today, and skip anything that doesn't feel comfortable.",
          Tense: "Thank you for noticing. The next step is all about letting go — take it slowly.",
          "Not sure": "That's fine. Noticing is the skill — there's no right answer.",
        };
        return { destroy: wireChips(root, (_, [v]) => { root.querySelector("[data-arrive-reply]").textContent = replies[v] || ""; }) };
      },
    },

    /* Step 2 — Body & Vocal Relaxation (Class 8) */
    relax: {
      render: () => `
        <div class="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
          ${[["Shoulders", "↓"], ["Jaw", "↓"], ["Face", "relaxed"]].map(([t, s], i) => `
            <div class="mv-tile rounded-2xl border border-white/10 bg-white/[0.03] py-5 text-center" data-relax-tile="${i}">
              <p class="font-display text-lg sm:text-xl text-ink-50">${t}</p><p class="text-2xl text-gold-300 leading-tight">${s}</p>
            </div>`).join("")}
        </div>
        ${cues(["Let your tongue rest gently.", "Keep your neck comfortable.", "Release any extra tension in your face."])}
        <p class="font-display text-xl text-ink-50 text-center mt-6" data-relax-tile="3">Then take one comfortable breath.</p>
        <div class="flex justify-center mt-6">${playBtn("data-relax-guide", "Guide me again")}</div>
        ${quiet("Gentle only — no aggressive stretching, and no forced breathing.")}`,
      wire(root) {
        let timer = null;
        const tiles = [...root.querySelectorAll("[data-relax-tile]")];
        function run() {
          clearInterval(timer);
          let i = 0;
          const light = () => { tiles.forEach((t) => t.classList.toggle("is-lit", Number(t.dataset.relaxTile) === i)); i++; if (i > tiles.length) clearInterval(timer); };
          light();
          timer = setInterval(light, 3500);
        }
        const onClick = (e) => { if (e.target.closest("[data-relax-guide]")) run(); };
        root.addEventListener("click", onClick);
        run();
        const stop = () => clearInterval(timer);
        return { pause: stop, destroy() { stop(); root.removeEventListener("click", onClick); } };
      },
    },

    /* Step 3 — Comfortable Breath (Class 2). No numbers, no holds, stoppable any time. */
    breath: {
      render: () => `
        <div class="breathe-circle breath-orb wu-orb is-rest" data-orb aria-hidden="true"></div>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 text-center mt-6 min-h-[2.5rem]" data-breath-cue aria-live="polite">Ready when you are</p>
        <div class="mt-5">${flow(["Comfortable inhale", "Easy controlled exhale", "Relax"], true)}</div>
        <div class="flex justify-center mt-6">
          <button type="button" data-breath-toggle class="metro-start">${icon("play", "w-5 h-5")} <span>Start breathing guide</span></button>
        </div>
        <div class="mt-5">${quiet("No big breaths. No holding. If you feel dizzy or light-headed, stop and breathe normally.")}</div>`,
      wire(root, step, ctx) {
        const PHASES = [
          { phase: "in", ms: 3500, cue: "Comfortable inhale" },
          { phase: "out", ms: 5000, cue: "Easy, controlled exhale" },
          { phase: "rest", ms: 2500, cue: "Relax" },
        ];
        const cycles = (ctx.mode === "full" ? 4 : 3) + (step.emphasised ? 2 : 0);
        const orb = root.querySelector("[data-orb]");
        const cue = root.querySelector("[data-breath-cue]");
        const btn = root.querySelector("[data-breath-toggle]");
        let timer = null, running = false;
        const setOrb = (phase, ms) => {
          orb.style.transitionDuration = `${ms}ms`;
          orb.className = orb.className.replace(/\bis-(in|out|sound|stop|rest)\b/g, "").trim() + ` is-${phase}`;
        };
        const setBtn = (on) => { btn.innerHTML = `${icon(on ? "pause" : "play", "w-5 h-5")} <span>${on ? "Stop" : "Start breathing guide"}</span>`; btn.classList.toggle("is-on", on); };
        function stop(text) {
          clearTimeout(timer); running = false; setBtn(false); setOrb("rest", 2500);
          if (text) cue.textContent = text;
        }
        function start() {
          running = true; setBtn(true);
          let n = 0;
          const next = () => {
            if (n >= cycles * PHASES.length) { stop("Done — breathe normally."); return; }
            const p = PHASES[n % PHASES.length];
            setOrb(p.phase, p.ms); cue.textContent = p.cue;
            n++;
            timer = setTimeout(next, p.ms);
          };
          next();
        }
        const onClick = (e) => { if (e.target.closest("[data-breath-toggle]")) running ? stop("Stopped. Breathe normally and rest.") : start(); };
        root.addEventListener("click", onClick);
        return { pause: () => running && stop("Paused. Breathe normally."), destroy() { clearTimeout(timer); root.removeEventListener("click", onClick); } };
      },
    },

    /* Step 4 — Gentle Sound Activation (Class 7) */
    sound: {
      render(step) {
        const all = [
          { key: "hum", big: "mmm", name: "Gentle hum", how: "Lips together, teeth apart. An easy buzz." },
          { key: "trill", big: "brrr", name: "Lip trill — if comfortable", how: "Loose lips, gentle air. Skip it if it feels awkward." },
          { key: "ng", big: "ng", name: "Soft “ng”", how: "Like the end of “sing”. Quiet and easy." },
        ];
        const subs = step.variant === "hum" ? all.slice(0, 1) : all;
        return `
          <div class="grid ${subs.length > 1 ? "sm:grid-cols-3" : "max-w-xs mx-auto"} gap-3">
            ${subs.map((s) => `
              <div class="wu-sub rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center" data-sub="${s.key}">
                <p class="font-display text-4xl text-gold-300 mb-2">${s.big}</p>
                <p class="text-sm text-ink-100">${s.name}</p>
                <p class="text-xs text-ink-500 mt-1 mb-4">${s.how}</p>
                <div class="flex justify-center gap-2">
                  <button type="button" data-sub-done class="vr-btn !py-1.5 !px-3 text-xs">${icon("check", "w-3.5 h-3.5")} Done</button>
                  <button type="button" data-sub-skip class="vr-btn !py-1.5 !px-3 text-xs">Skip</button>
                </div>
              </div>`).join("")}
          </div>
          <div class="flex justify-center mt-6">${playBtn("data-sound-note", "Play a comfortable note")}</div>
          <div class="flex flex-wrap justify-center gap-2 mt-6">${["Easy vibration", "Easy sound", "No throat pushing"].map((t) => `<span class="flow-chip">${t}</span>`).join("")}</div>
          <div class="mt-4">${quiet("Stay on a comfortable pitch — no high notes yet.")}</div>`;
      },
      wire(root, step, ctx) {
        function onClick(e) {
          if (e.target.closest("[data-sound-note]")) { PianoSynth.play(ctx.base, { duration: 2.5, velocity: 0.5 }); return; }
          const sub = e.target.closest("[data-sub]");
          if (!sub) return;
          if (e.target.closest("[data-sub-done]")) { sub.classList.add("is-done"); sub.classList.remove("is-skipped"); }
          if (e.target.closest("[data-sub-skip]")) { sub.classList.add("is-skipped"); sub.classList.remove("is-done"); }
        }
        root.addEventListener("click", onClick);
        return { destroy: () => root.removeEventListener("click", onClick) };
      },
    },

    /* Step 5 — Pitch Connection (Classes 3–4): LISTEN ↓ MATCH ↓ CHECK on the Virtual Piano */
    pitch: {
      render: () => `
        <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-5 max-w-md mx-auto mb-6">
          ${VirtualPiano.render("wu-piano", { controls: false, keyboard: false, display: false })}
        </div>
        <p class="text-center text-xs uppercase tracking-[0.2em] text-ink-500" data-pitch-count></p>
        <p class="text-center font-display text-5xl text-ink-50 mb-6" data-pitch-name>—</p>
        <div class="flex flex-col items-center gap-1.5 max-w-xs mx-auto">
          <button type="button" data-pitch-act="listen" class="wu-flow-tile">LISTEN <span>Play the note</span></button>
          <span class="text-ink-600">↓</span>
          <button type="button" data-pitch-act="match" class="wu-flow-tile">MATCH <span>Hum along gently</span></button>
          <span class="text-ink-600">↓</span>
          <button type="button" data-pitch-act="check" class="wu-flow-tile">CHECK <span>Listen again — the same?</span></button>
        </div>
        <div class="mt-5" data-pitch-check hidden>${chips("match", ["Matched", "Close", "Not sure"])}</div>
        <div class="flex justify-center mt-5"><button type="button" data-pitch-next class="vr-btn" hidden>Next note ${icon("arrowRight", "w-3.5 h-3.5")}</button></div>`,
      wire(root, step, ctx) {
        const b = ctx.base;
        const notes = step.variant === "reference" ? [b] : step.emphasised ? [b, b + 2, b + 4] : [b, b + 2];
        let i = 0;
        const from = NoteUtils.isBlack(b) ? b - 1 : b;
        const to = NoteUtils.isBlack(b + 4) ? b + 5 : b + 4;
        const piano = VirtualPiano.wire(root, "wu-piano", { range: { from, to } });
        const $ = (s) => root.querySelector(s);
        function show() {
          $("[data-pitch-count]").textContent = notes.length > 1 ? `Comfortable note ${i + 1} of ${notes.length}` : "Your reference note";
          $("[data-pitch-name]").textContent = N(notes[i]);
          root.querySelectorAll("[data-pitch-act]").forEach((t) => t.classList.remove("is-lit"));
          root.querySelectorAll("[data-chips='match'] [data-chip]").forEach((c) => c.classList.remove("is-selected"));
          $("[data-pitch-check]").hidden = true;
          $("[data-pitch-next]").hidden = true;
        }
        function act(kind) {
          root.querySelectorAll("[data-pitch-act]").forEach((t) => t.classList.toggle("is-lit", t.dataset.pitchAct === kind));
          const m = notes[i];
          if (kind === "listen") piano.playNote(m, 1.6);
          if (kind === "match") piano.playNote(m, 3.2); // a held note to hum along with
          if (kind === "check") { piano.playNote(m, 1.6); $("[data-pitch-check]").hidden = false; }
        }
        const unChips = wireChips(root, () => { $("[data-pitch-next]").hidden = i >= notes.length - 1; });
        function onClick(e) {
          const a = e.target.closest("[data-pitch-act]");
          if (a) { act(a.dataset.pitchAct); return; }
          if (e.target.closest("[data-pitch-next]") && i < notes.length - 1) { i++; show(); }
        }
        root.addEventListener("click", onClick);
        show();
        return { destroy() { unChips(); root.removeEventListener("click", onClick); piano.destroy(); } };
      },
    },

    /* Step 6 — Listen to Your Own Voice (Class 5). The take is never saved or uploaded. */
    listen: {
      render: () => `
        ${cues(["Record a short, easy “mmm” or “ah”.", "A few seconds is plenty."])}
        <div class="flex flex-wrap justify-center items-center gap-2.5 mt-6">
          <button type="button" data-ls-record class="vr-btn vr-btn-primary wu-big-btn"><span class="vr-rec-dot"></span> <span data-ls-record-label>Record</span></button>
          <button type="button" data-ls-stop class="vr-btn wu-big-btn" disabled>■ Stop</button>
          <button type="button" data-ls-play class="vr-btn vr-btn-gold wu-big-btn" disabled>${icon("play", "w-4 h-4")} Play it back</button>
        </div>
        <div class="h-1.5 w-40 mx-auto rounded-full bg-white/5 overflow-hidden mt-4" aria-hidden="true"><div class="h-full bg-gold-400/80 w-0 transition-[width] duration-75" data-ls-level></div></div>
        <p class="text-sm text-ink-400 text-center mt-2 min-h-[1.25rem]" data-ls-status aria-live="polite"></p>
        <div class="mt-6" data-ls-ask hidden>
          <p class="text-center text-ink-50 font-display text-xl mb-4">How did that sound to you?</p>
          ${chips("sound", ["Clear", "Breathy", "Tense", "Soft", "Unstable", "Comfortable", "Not sure"], { multi: true })}
          <p class="text-sm text-ink-300 text-center mt-4 min-h-[1.25rem]" data-ls-reply></p>
        </div>
        <div class="mt-5">${quiet("Warm-up takes aren't saved — they're only for listening right now.")}</div>`,
      wire(root) {
        const $ = (s) => root.querySelector(s);
        let session = null, audio = null, url = null;
        if (!VoiceRecorder.isSupported()) { $("[data-ls-record]").disabled = true; $("[data-ls-status]").textContent = "Recording isn't supported in this browser — you can skip this step."; }
        function stopAudio() { if (audio) audio.pause(); }
        const onOtherAudio = (e) => { if (e.detail.source !== "warmup") stopAudio(); };
        window.addEventListener("niswara:audio-start", onOtherAudio);
        async function record() {
          stopAudio();
          try {
            session = await VoiceRecorder.start({
              maxSeconds: 8,
              onTick: (s) => { $("[data-ls-status]").textContent = `Recording… ${Utils.formatSeconds(s)}`; },
              onLevel: (v) => { $("[data-ls-level]").style.width = `${Math.round(v * 100)}%`; },
            });
          } catch (e) {
            $("[data-ls-status]").textContent = e.reason === "unsupported" ? "Recording isn't supported in this browser — you can skip this step." : "Microphone access was blocked. Allow it in your browser's site settings, or skip this step.";
            return;
          }
          $("[data-ls-record]").disabled = true; $("[data-ls-stop]").disabled = false; $("[data-ls-play]").disabled = true;
          $("[data-ls-record]").classList.add("is-recording");
          const res = await session.ended;
          session = null;
          $("[data-ls-record]").disabled = false; $("[data-ls-stop]").disabled = true;
          $("[data-ls-record]").classList.remove("is-recording");
          if (!res || !res.blob.size) { $("[data-ls-status]").textContent = res ? "Nothing was recorded — try again." : ""; return; }
          if (url) URL.revokeObjectURL(url);
          url = URL.createObjectURL(res.blob);
          $("[data-ls-record-label]").textContent = "Record again";
          $("[data-ls-play]").disabled = false;
          $("[data-ls-status]").textContent = "Now play it back and simply listen.";
        }
        function play() {
          if (!url) return;
          stopAudio();
          VoiceRecorder.announce("warmup");
          audio = new Audio(url);
          audio.onended = () => { $("[data-ls-ask]").hidden = false; $("[data-ls-status]").textContent = ""; };
          audio.play().catch(() => {});
          $("[data-ls-status]").textContent = "Listening…";
        }
        const unChips = wireChips(root, (_, vals) => {
          $("[data-ls-reply]").textContent = vals.length ? "Good listening. There's no score here — noticing is the skill." : "";
        });
        function onClick(e) {
          if (e.target.closest("[data-ls-record]")) record();
          else if (e.target.closest("[data-ls-stop]") && session) session.stop();
          else if (e.target.closest("[data-ls-play]")) play();
        }
        root.addEventListener("click", onClick);
        return {
          pause() { if (session) session.stop(); stopAudio(); },
          destroy() {
            unChips(); root.removeEventListener("click", onClick);
            window.removeEventListener("niswara:audio-start", onOtherAudio);
            if (session) session.cancel();
            stopAudio();
            if (url) URL.revokeObjectURL(url);
          },
        };
      },
    },

    /* Step 7 — Rhythm Activation (Class 6), on the metronome engine */
    rhythm: {
      render: () => `
        <p class="text-center text-[11px] tracking-[0.25em] uppercase text-ink-500 mb-4">Metronome · 66 BPM · gentle</p>
        <div class="max-w-lg mx-auto">
          ${BeatGuide.render("wu-rhythm", { bars: [[{ t: "1" }, { t: "2" }, { t: "3" }, { t: "4" }], Array.from({ length: 4 }, () => ({ t: "mmm", note: true }))], startLabel: "Start the pulse" })}
        </div>
        <div class="mt-6">${cues(["Count along first: 1 — 2 — 3 — 4", "Then hum on each beat: mmm — mmm — mmm — mmm"])}</div>
        <div class="mt-4">${quiet("Don't rush. Just reconnect with the pulse.")}</div>`,
      wire(root, step, ctx) {
        const bars = [[{ t: "1" }, { t: "2" }, { t: "3" }, { t: "4" }], Array.from({ length: 4 }, () => ({ t: "mmm", note: true }))];
        const guide = BeatGuide.wire(root, "wu-rhythm", { bpm: 66, loops: step.emphasised ? 3 : 2, countIn: 4, bars, getNote: () => ctx.base });
        const el = root.querySelector('[data-bg="wu-rhythm"]');
        return { pause: () => el && el._api && el._api.engine.stop(), destroy: () => guide.destroy() };
      },
    },

    /* Step 8 — Basic Vocal Control (Class 9) */
    control: {
      render(step, ctx) {
        const b = ctx.base;
        const transitions = ctx.emphasis === "transitions";
        return `
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <p class="text-sm text-ink-100 mb-3">Comfortable note → slightly higher → return</p>
            <div class="flex justify-center items-center gap-1.5 mb-4" data-ctl-chain>${[b, b + 2, b].map((m, i) => `<span class="chain-dot" data-chain-i="${i}">${N(m)}</span>`).join(`<span class="text-ink-700 text-xs">→</span>`)}</div>
            <div class="flex flex-wrap justify-center gap-2">
              ${playBtn("data-ctl-pattern", "Listen")}
              ${transitions ? playBtn("data-ctl-glide", "Hear a slow glide") : ""}
            </div>
            <p class="text-sm text-ink-400 mt-3">Then sing it on a gentle “mmm”.${transitions ? " Move slowly between the two notes — no jumps." : ""}</p>
          </div>
          ${step.variant === "pattern" ? "" : `
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center mt-4">
            <p class="text-sm text-ink-100 mb-3">One note: “mmm” → “ah”</p>
            <p class="font-display text-3xl text-gold-300 mb-4">mmm <span class="text-ink-600">→</span> ah</p>
            ${playBtn("data-ctl-note", "Play the note")}
            <p class="text-sm text-ink-400 mt-3">Start on a hum, then gently open to “ah” — same note, same ease.</p>
          </div>`}
          <div class="flex flex-wrap justify-center gap-2 mt-6">${["Controlled movement", "Easy sound", "Stable pitch", "No force"].map((t) => `<span class="flow-chip">${t}</span>`).join("")}</div>`;
      },
      wire(root, step, ctx) {
        const b = ctx.base;
        let seq = null;
        function onClick(e) {
          if (e.target.closest("[data-ctl-pattern]")) {
            if (seq) seq.cancel();
            seq = PianoSynth.playSequence([b, b + 2, b], {
              duration: 0.9, gap: 0.25,
              onNote: (i) => root.querySelectorAll("[data-chain-i]").forEach((d) => d.classList.toggle("is-lit", Number(d.dataset.chainI) === i)),
            });
            seq.then(() => root.querySelectorAll("[data-chain-i]").forEach((d) => d.classList.remove("is-lit")));
          }
          if (e.target.closest("[data-ctl-glide]")) {
            PianoSynth.tone(b, b + 2, { duration: 2.4, glideAt: 0.4, glideTime: 1.2 });
            setTimeout(() => root.isConnected && PianoSynth.tone(b + 2, b, { duration: 2.4, glideAt: 0.4, glideTime: 1.2 }), 2700);
          }
          if (e.target.closest("[data-ctl-note]")) PianoSynth.play(b, { duration: 3, velocity: 0.5 });
        }
        root.addEventListener("click", onClick);
        return { destroy() { if (seq) seq.cancel(); root.removeEventListener("click", onClick); } };
      },
    },

    /* Step 9 — Mini Musical Phrase: everything together, the bridge to real singing */
    phrase: {
      render(step, ctx) {
        const b = ctx.base;
        const words = [["I", b], ["love", b + 2], ["to", b + 4], ["sing", b + 2]];
        return `
          <div class="mb-6">${flow(["Listen", "Find the first note", "Breathe", "Sing", "Finish gently"])}</div>
          <div class="flex justify-center items-center gap-1.5 mb-5">${words.map(([w], i) => `<span class="chain-dot !text-base !px-4" data-chain-i="${i}">${w}</span>`).join(`<span class="text-ink-700 text-xs">→</span>`)}</div>
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            ${playBtn("data-phrase-play", "Listen to the phrase")}
            ${playBtn("data-phrase-start", `Starting note · ${N(b)}`)}
          </div>
          <div class="max-w-lg mx-auto">
            ${BeatGuide.render("wu-phrase", { bars: [words.map(([t, midi]) => ({ t, midi })), [{ rest: true }, { rest: true }, { t: "breathe", rest: true }, { rest: true }]], guideToggle: true, startLabel: "Sing with the guide" })}
          </div>
          <div class="mt-5">${quiet("Comfortable breath, easy start, gentle finish. That's all it needs to be.")}</div>`;
      },
      wire(root, step, ctx) {
        const b = ctx.base;
        const notes = [b, b + 2, b + 4, b + 2];
        const bars = [[{ t: "I", midi: b }, { t: "love", midi: b + 2 }, { t: "to", midi: b + 4 }, { t: "sing", midi: b + 2 }], [{ rest: true }, { rest: true }, { t: "breathe", rest: true }, { rest: true }]];
        const guide = BeatGuide.wire(root, "wu-phrase", { bpm: 72, loops: 2, countIn: 4, bars });
        const el = root.querySelector('[data-bg="wu-phrase"]');
        let seq = null;
        function onClick(e) {
          if (e.target.closest("[data-phrase-play]")) {
            if (seq) seq.cancel();
            seq = PianoSynth.playSequence(notes, {
              duration: 0.75, gap: 0.12,
              onNote: (i) => root.querySelectorAll("[data-chain-i]").forEach((d) => d.classList.toggle("is-lit", Number(d.dataset.chainI) === i)),
            });
            seq.then(() => root.querySelectorAll("[data-chain-i]").forEach((d) => d.classList.remove("is-lit")));
          }
          if (e.target.closest("[data-phrase-start]")) PianoSynth.play(b, { duration: 1.8 });
        }
        root.addEventListener("click", onClick);
        return {
          pause: () => el && el._api && el._api.engine.stop(),
          destroy() { if (seq) seq.cancel(); guide.destroy(); root.removeEventListener("click", onClick); },
        };
      },
    },

    /* Step 10 — Final readiness check */
    ready: {
      QUESTIONS: [
        ["Body", "Do I feel relaxed?"], ["Breath", "Is my breathing comfortable?"], ["Voice", "Does my voice feel comfortable?"],
        ["Pitch", "Can I find a comfortable note?"], ["Listening", "Can I hear my own voice clearly?"], ["Rhythm", "Can I follow a simple pulse?"],
      ],
      questions(step) { return step.variant === "compact" ? this.QUESTIONS.slice(0, 3) : this.QUESTIONS; },
      render(step) {
        return `
          <div class="grid sm:grid-cols-2 gap-3">
            ${this.questions(step).map(([h, q]) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-1">${h}</p>
                <p class="text-sm text-ink-100 mb-3">${q}</p>
                <div data-chips="${h}" class="flex flex-wrap gap-2">${["Yes", "Mostly", "No"].map((o) => `<button type="button" data-chip="${o}" class="ex-chip">${o}</button>`).join("")}</div>
              </div>`).join("")}
          </div>
          <div class="mt-6 text-center min-h-[3rem]" data-ready-result aria-live="polite"></div>`;
      },
      wire(root, step) {
        const total = this.questions(step).length;
        const answers = {};
        return {
          destroy: wireChips(root, (name, [v]) => {
            answers[name] = v;
            const vals = Object.values(answers);
            const no = vals.filter((x) => x === "No").length;
            const yes = vals.filter((x) => x === "Yes").length;
            const out = root.querySelector("[data-ready-result]");
            if (no >= 2) out.innerHTML = `<p class="font-display text-xl text-teal-200">Take another moment.</p><p class="text-sm text-ink-400 mt-1">You don't need to force today's session.</p>`;
            else if (vals.length === total && yes > total / 2) out.innerHTML = `<p class="font-display text-2xl text-gold-300">You're ready to begin.</p>`;
            else if (vals.length === total) out.innerHTML = `<p class="font-display text-xl text-ink-100">Nearly there.</p><p class="text-sm text-ink-400 mt-1">Keep today's singing gentle and easy.</p>`;
            else out.innerHTML = "";
          }),
        };
      },
    },
  };

  /* ============================================================
     SESSION — player
     ============================================================ */

  const RING_R = 70, RING_C = 2 * Math.PI * RING_R;
  let sessionActive = false; // true while a session page is mounted (app.js holds background re-renders)

  function ringSvg() {
    return `
      <svg viewBox="0 0 160 160" class="wu-ring" aria-hidden="true">
        <circle cx="80" cy="80" r="${RING_R}" class="wu-ring-track"/>
        <circle cx="80" cy="80" r="${RING_R}" class="wu-ring-fill" data-wu-ring stroke-dasharray="${RING_C.toFixed(1)}" stroke-dashoffset="${RING_C.toFixed(1)}"/>
      </svg>`;
  }

  const WarmupSessionPage = {
    /** While true, background sync must not redraw the page (it would restart the routine). */
    inProgress: () => sessionActive,

    render(params) {
      const routine = Warmup.ROUTINES[params.mode];
      if (!routine) {
        return `<section class="max-w-3xl mx-auto px-5 py-20">${Components.EmptyState("mic", "Warm-up not found", "Choose Quick, Full or Performance from the Warm-up page.")}
          <div class="text-center mt-6"><a href="#/warmup" class="text-sm text-gold-300">Go to Warm-up</a></div></section>`;
      }
      if (!Warmup.isUnlocked()) return lockedView();
      const emph = Warmup.EMPHASIS.find((e) => e.value === Warmup.emphasis());
      return `
      <section class="wu-studio wu-session">
        <div class="max-w-3xl mx-auto px-5 lg:px-8 pt-6 pb-10">
          <div class="flex items-center justify-between gap-3 mb-6">
            <a href="#/warmup" class="text-xs text-ink-500 hover:text-ink-300 inline-flex items-center gap-1.5">${icon("arrowRight", "w-3 h-3 rotate-180")} Warm-up</a>
            <div class="text-center min-w-0">
              <p class="text-[11px] tracking-[0.25em] uppercase text-gold-300">${routine.title}</p>
              ${emph && Warmup.plan(routine.key).some((s) => s.emphasised) ? `<p class="text-[11px] text-ink-500">Emphasis: ${emph.label}</p>` : ""}
            </div>
            <button type="button" data-wu-pause class="vr-btn !py-1.5 !px-3 text-xs">${icon("pause", "w-3.5 h-3.5")} Pause</button>
          </div>

          <div data-wu-stage>
            <div class="relative w-40 h-40 mx-auto">
              ${ringSvg()}
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl leading-none" data-wu-icon aria-hidden="true">🎤</span>
                <span class="text-xs text-ink-400 tabular-nums mt-2" data-wu-pct>0%</span>
              </div>
            </div>
            <p class="text-center text-sm tabular-nums mt-3"><span class="text-ink-100" data-wu-timer>00:00</span> <span class="text-ink-600" data-wu-suggest></span></p>
            <p class="text-center text-[11px] tracking-[0.25em] uppercase text-ink-500 mt-6" data-wu-count></p>
            <h1 class="font-display text-3xl sm:text-4xl text-ink-50 text-center mt-1" data-wu-title></h1>
            <div class="flex flex-wrap justify-center items-center gap-2 mt-3 min-h-[1.75rem]" data-wu-from></div>
            <div class="mt-8" data-wu-body></div>

            <div class="wu-controls sticky bottom-20 lg:bottom-4 z-20 mt-10 rounded-full p-1.5 flex items-center gap-2">
              <button type="button" data-wu-skip class="flex-1 px-5 py-3.5 rounded-full text-sm text-ink-300 hover:text-ink-50 hover:bg-white/5 transition-colors">Skip</button>
              <button type="button" data-wu-next class="wu-next flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors"><span data-wu-next-label>Next</span> ${icon("arrowRight", "w-4 h-4")}</button>
            </div>
            <p class="text-xs text-ink-500 text-center mt-3">Skip anything that doesn't feel comfortable. Pause whenever you like.</p>
          </div>

          <div data-wu-end hidden></div>
          <div class="mt-10">${SAFETY}</div>
        </div>

        <div class="wu-overlay fixed inset-0 z-50 flex items-center justify-center p-5" data-wu-overlay hidden>
          <div class="max-w-sm w-full rounded-3xl border border-white/10 bg-ink-900 p-7 text-center shadow-2xl">
            <div class="breathe-circle is-running !w-20 !h-20 mb-5" aria-hidden="true"></div>
            <h2 class="font-display text-2xl text-ink-50 mb-2">Paused</h2>
            <p class="text-sm text-ink-400 mb-6">Rest as long as you need. Breathe normally.</p>
            <div class="flex flex-col gap-2">
              <button type="button" data-wu-resume class="px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Resume</button>
              <button type="button" data-wu-stop class="px-6 py-3 rounded-full border border-white/15 text-ink-200 text-sm hover:bg-white/5 transition-colors">End warm-up</button>
            </div>
          </div>
        </div>
      </section>`;
    },

    mount(container, params) {
      const routine = Warmup.ROUTINES[params.mode];
      if (!routine || !Warmup.isUnlocked()) return () => {};
      sessionActive = true;
      const $ = (s) => container.querySelector(s);
      const returnTo = Warmup.safeReturn(Utils.getHashQuery("return"));
      const emphasis = Warmup.emphasis();
      const steps = Warmup.plan(routine.key, emphasis);
      const ctx = { base: Warmup.comfortableNote(), mode: routine.key, emphasis };
      const startedAt = new Date().toISOString();
      const completed = [], skipped = [];
      let index = 0, current = null, paused = false, finished = false;
      let activeMs = 0, stepMs = 0, last = performance.now(), returnTimer = null;

      function setRing(pct) {
        $("[data-wu-ring]").setAttribute("stroke-dashoffset", (RING_C * (1 - pct / 100)).toFixed(1));
        $("[data-wu-pct]").textContent = `${pct}%`;
      }

      function showStep() {
        const step = steps[index];
        const meta = Warmup.STEPS[step.key];
        const view = STEP_VIEWS[step.key];
        stepMs = 0;
        $("[data-wu-icon]").textContent = meta.icon;
        $("[data-wu-count]").textContent = `Step ${index + 1} of ${steps.length}`;
        $("[data-wu-title]").textContent = step.key === "sound" && step.variant === "hum" ? "Gentle Humming" : meta.title;
        $("[data-wu-suggest]").textContent = `/ ~${Utils.formatSeconds(step.seconds)}`;
        const from = Warmup.fromLabel(step.key);
        $("[data-wu-from]").innerHTML = `
          ${from ? `<span class="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 tracking-wide">${from}</span>` : ""}
          ${meta.classes.length ? `<a href="#/classes/${Warmup.classId(meta.classes[0])}" target="_blank" rel="noopener" class="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-ink-300 hover:text-gold-300 hover:border-gold-400/30 transition-colors">Review Class ↗</a>` : ""}
          ${step.emphasised ? `<span class="text-[11px] px-2.5 py-1 rounded-full bg-gold-500/15 text-gold-300">Today's emphasis</span>` : ""}`;
        $("[data-wu-next-label]").textContent = index === steps.length - 1 ? "Finish warm-up" : "Next";
        $("[data-wu-next]").classList.remove("is-ready");
        setRing(Math.round((index / steps.length) * 100));
        const body = $("[data-wu-body]");
        body.innerHTML = view.render(step, ctx);
        current = view.wire(body, step, ctx) || {};
      }

      function leaveStep() {
        if (current && current.destroy) { try { current.destroy(); } catch (e) { console.error(e); } }
        current = null;
        PianoSynth.stopAll();
      }

      function advance(kind) {
        if (finished || paused) return;
        const key = steps[index].key;
        (kind === "skip" ? skipped : completed).push(key);
        leaveStep();
        index++;
        if (index >= steps.length) finish();
        else { showStep(); window.scrollTo({ top: 0, behavior: "smooth" }); }
      }

      async function finish() {
        finished = true;
        setRing(100);
        const session = await Warmup.record({
          type: routine.key, startedAt, duration: activeMs / 1000,
          completedSteps: completed, skippedSteps: skipped, emphasis,
        });
        if (!container.isConnected) return;
        showEnd(`
          <p class="text-[11px] tracking-[0.3em] uppercase text-gold-300 mb-3">Warm-up complete</p>
          <h2 class="font-display text-3xl sm:text-4xl text-ink-50 mb-2">Your voice is prepared.</h2>
          <p class="text-sm text-ink-400 mb-8 tabular-nums">${routine.title} · ${Math.max(1, Math.round(session.duration / 60))} min · ${completed.length} step${completed.length === 1 ? "" : "s"}${skipped.length ? ` · ${skipped.length} skipped — that's fine` : ""}</p>`, true);
      }

      function showEnd(html, done) {
        leaveStep();
        $("[data-wu-stage]").hidden = true;
        const end = $("[data-wu-end]");
        end.hidden = false;
        const next = Store.getClassById(Store.getState().currentClassId);
        end.innerHTML = `
          <div class="text-center py-6">
            <div class="wu-mic-lg ${done ? "" : "is-locked"} mx-auto mb-8" aria-hidden="true">${done ? "🎤" : "🌿"}</div>
            ${html}
            ${returnTo ? `
              <p class="text-sm text-ink-300 mb-4" data-wu-return-msg>Returning to your recording in <span data-wu-countdown>5</span>…</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="${returnTo}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Go now ${icon("arrowRight", "w-4 h-4")}</a>
                <button type="button" data-wu-stay class="px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Stay here</button>
              </div>` : `
              <div class="flex flex-wrap justify-center gap-3">
                ${next && !next.comingSoon ? `<a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue Class ${next.number} ${icon("arrowRight", "w-4 h-4")}</a>` : ""}
                <a href="#/warmup" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Back to Warm-up</a>
              </div>`}
            <div class="mt-12">${CORE_MESSAGE}</div>
          </div>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (returnTo) {
          let n = 5;
          returnTimer = setInterval(() => {
            n--;
            const c = container.querySelector("[data-wu-countdown]");
            if (c) c.textContent = n;
            if (n <= 0) { clearInterval(returnTimer); location.hash = returnTo; }
          }, 1000);
        }
      }

      function stopEarly() {
        finished = true;
        $("[data-wu-overlay]").hidden = true;
        showEnd(`
          <p class="text-[11px] tracking-[0.3em] uppercase text-ink-500 mb-3">Warm-up stopped</p>
          <h2 class="font-display text-3xl text-ink-50 mb-3">That's completely fine.</h2>
          <p class="text-sm text-ink-400 mb-8 max-w-md mx-auto">Stopping is always the right choice when something doesn't feel comfortable. Rest, drink some water, and come back another time.</p>`, false);
      }

      function setPaused(on) {
        paused = on;
        $("[data-wu-overlay]").hidden = !on;
        if (on) { if (current && current.pause) current.pause(); PianoSynth.stopAll(); }
        else last = performance.now();
      }

      const ticker = setInterval(() => {
        const now = performance.now();
        if (!paused && !finished) {
          activeMs += now - last;
          stepMs += now - last;
          const secs = Math.floor(stepMs / 1000);
          $("[data-wu-timer]").textContent = Utils.formatSeconds(secs);
          if (secs >= steps[index].seconds) $("[data-wu-next]").classList.add("is-ready");
        }
        last = now;
      }, 250);

      function onClick(e) {
        if (e.target.closest("[data-wu-next]")) advance("done");
        else if (e.target.closest("[data-wu-skip]")) advance("skip");
        else if (e.target.closest("[data-wu-pause]")) { if (!finished) setPaused(true); }
        else if (e.target.closest("[data-wu-resume]")) setPaused(false);
        else if (e.target.closest("[data-wu-stop]")) stopEarly();
        else if (e.target.closest("[data-wu-stay]")) {
          clearInterval(returnTimer);
          const msg = container.querySelector("[data-wu-return-msg]");
          if (msg) msg.textContent = "Staying here. Your recording is waiting whenever you are.";
        }
      }
      container.addEventListener("click", onClick);
      showStep();

      return () => {
        sessionActive = false;
        clearInterval(ticker);
        clearInterval(returnTimer);
        container.removeEventListener("click", onClick);
        leaveStep();
      };
    },
  };

  return { WarmupPage, WarmupSessionPage };
})();
