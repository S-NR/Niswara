/* ============================================================
   LEVEL 2, CLASS 5 — AROHANA AND AVAROHANA (interactive lesson)

   Rendered by ClassDetailPage for interactive: "arohana-and-avarohana".

   Curriculum identity: Level 2, Class 5 (`number: 5`, `levelId: 2`
   in data.js, explicit id `L2C28`). Third of four new "Musical
   Foundations" classes. Builds on Class 4's seven swaras (`L2C27`),
   simply naming the ascending and descending direction of the same
   swara sequence — arohana (ascending) and avarohana (descending).

   Core idea: arohana and avarohana are introduced only as directional
   names for a swara sequence, with an honest, limited note that many
   ragas use a different set of swaras ascending versus descending —
   a detail this class deliberately does not teach yet. No gamaka or
   tala theory is introduced here; this stays a beginner-friendly,
   practical listening-and-singing class, matching Classes 3 and 4.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection; the knowledge check is a concept check, not a
   performance score; completion never depends on singing in tune.

   Reuses: LessonKit, VirtualPiano, PianoSynth.playSequence,
   RecordingCard, SelfAssessment, PersonalNotes, ClassProgress.
   ============================================================ */

const ArohanaAndAvarohanaLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "sing", label: "Sing" },
    { id: "combine", label: "Combine" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;

  const SWARAS = [
    { key: "sa", label: "Sa", semitone: 0 },
    { key: "ri", label: "Ri", semitone: 2 },
    { key: "ga", label: "Ga", semitone: 4 },
    { key: "ma", label: "Ma", semitone: 5 },
    { key: "pa", label: "Pa", semitone: 7 },
    { key: "dha", label: "Dha", semitone: 9 },
    { key: "ni", label: "Ni", semitone: 11 },
    { key: "sa2", label: "Sa˙", semitone: 12 },
  ];
  const AROHANA = SWARAS;
  const AVAROHANA = [...SWARAS].reverse();

  const KNOWLEDGE_CHECK = [
    {
      key: "arohana",
      question: "What is arohana?",
      options: [
        { value: "down", label: "The descending swara sequence", correct: false },
        { value: "up", label: "The ascending swara sequence, from Sa up to the upper Sa", correct: true },
        { value: "volume", label: "A volume marking", correct: false },
      ],
      explain: { down: "Not quite — that's avarohana.", up: "Exactly — arohana moves upward through the swaras.", volume: "Not quite — arohana is about direction, not loudness." },
    },
    {
      key: "avarohana",
      question: "What is avarohana?",
      options: [
        { value: "up", label: "The ascending swara sequence", correct: false },
        { value: "down", label: "The descending swara sequence, from the upper Sa back down to Sa", correct: true },
        { value: "rhythm", label: "A rhythm pattern", correct: false },
      ],
      explain: { up: "Not quite — that's arohana.", down: "Exactly — avarohana moves back downward through the swaras.", rhythm: "Not quite — avarohana is about pitch direction, not rhythm." },
    },
    {
      key: "sameSwaras",
      question: "Do all ragas use exactly the same swaras ascending and descending?",
      options: [
        { value: "yes", label: "Yes, always", correct: false },
        { value: "no", label: "No — many ragas use a different set of swaras in each direction; this class uses a simple scale where they match", correct: true },
        { value: "unsure", label: "Ragas haven't been mentioned in this course yet", correct: false },
      ],
      explain: { yes: "Not quite — plenty of ragas differ between their arohana and avarohana. This class's scale happens to match in both directions, which keeps things simple for now.", no: "Right. That difference is a real part of raga theory, just not something this beginner class teaches in depth yet.", unsure: "Ragas exist as a concept — just not something taught in detail at this stage." },
    },
  ];

  const PROGRESS_ITEMS = [
    { key: "understood", label: "I understand what arohana and avarohana mean." },
    { key: "heardBoth", label: "I listened to both the ascending and descending sequence." },
    { key: "triedOrSkipped", label: "I tried singing arohana and avarohana, or chose to skip for comfort." },
    { key: "reflected", label: "I reflected on which direction felt more natural." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    direction: { question: "Which direction felt more natural to sing?", options: [opt("up", "Ascending (arohana)", "good"), opt("down", "Descending (avarohana)", "good"), opt("same", "About the same", "good"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= SA_MAX;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c27 = (ClassActivity.get("L2C27").answers.setup || {}).note;
    if (ok(c27)) return c27;
    const sa = (ClassActivity.get("L2C26").answers.setup || {}).note;
    if (ok(sa)) return sa;
    const c2 = (ClassActivity.get("L2C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    const c1 = (ClassActivity.get("L2C01").answers.setup || {}).note;
    if (ok(c1)) return c1;
    const f25 = (ClassActivity.get("L1C25").answers.setup || {}).note;
    if (ok(f25)) return f25;
    const f2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(f2)) return f2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];

  function derivedCheckpoints(rec) {
    const out = {};
    if (KNOWLEDGE_CHECK.every((k) => q(rec, `kc_${k.key}`)) && !!rec.checkpoints.lessonViewed) out.understood = true;
    if (rec.checkpoints.heardAro && rec.checkpoints.heardAva) out.heardBoth = true;
    if (take(rec, "aroTake") || take(rec, "avaTake") || skipped(rec, "sing")) out.triedOrSkipped = true;
    if (q(rec, "direction")) out.reflected = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function ladderHtml(sequence, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-5">
      ${sequence.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-lg ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${s.label}</span>
        </div>`).join("")}
    </div>`;
  }

  function knowledgeCheckHtml(rec) {
    return `<div class="flex flex-col gap-5" data-kc>
      ${KNOWLEDGE_CHECK.map((item) => {
        const selected = q(rec, `kc_${item.key}`);
        return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-kc-item="${item.key}">
          <p class="text-sm text-ink-200 mb-2.5">${item.question}</p>
          <div class="flex flex-wrap gap-2">
            ${item.options.map((o) => `<button type="button" data-kc-choice="${o.value}" class="ex-chip ${selected === o.value ? "is-selected" : ""}">${o.label}</button>`).join("")}
          </div>
          ${selected ? `<p class="text-xs mt-2.5 ${item.options.find((o) => o.value === selected).correct ? "text-emerald-300" : "text-amber-300"}">${item.explain[selected]}</p>` : ""}
        </div>`;
      }).join("")}
      <p class="text-xs text-ink-500">This is a quick concept check, not a vocal-performance score.</p>
    </div>`;
  }

  function problems() {
    const items = [
      ["Assuming every raga's arohana and avarohana use identical swaras", "Many ragas genuinely differ between the two directions — a detail saved for a later, more advanced class."],
      ["Rushing the descending direction because it 'feels less important'", "Avarohana deserves the same careful, comfortable practice as arohana."],
      ["Pushing for a higher upper Sa than feels comfortable", "Stay within a range that feels easy — a strained upper Sa isn't the goal here."],
      ["Treating this as advanced raga theory", "This class only names a direction — deeper raga study comes much later."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a], i) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">Mistake ${i + 1}: ${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 5 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Up and back down.</p>
        <p class="text-sm text-ink-300">Arohana rises from Sa to Sa˙; avarohana returns from Sa˙ back to Sa.</p>
      </div>`;
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = PROGRESS_ITEMS.map((i) => `
      <li class="flex items-center gap-2.5 text-sm ${rec.checkpoints[i.key] ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${rec.checkpoints[i.key] ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${rec.checkpoints[i.key] ? icon("check", "w-3 h-3") : ""}</span>${i.label}
      </li>`).join("");
    const preview = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 6 — Basic Swara Patterns</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson combines a few swaras at a time into short practice patterns, instead of always singing the full scale.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Arohana and avarohana are simply names for ascending and descending through the swaras.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            ${preview}
            ${next ? `
            <div class="mt-6">
              <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
              <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
                <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
              </div>
            </div>` : ""}
          </div>
        </div>`;
    }
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 text-center">
        <h3 class="font-display text-2xl text-ink-50 mb-4">${all ? "You're ready." : "Almost there"}</h3>
        <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-6">${lines}</ul>
        <div>
          <button type="button" data-complete-class ${all ? "" : "disabled"}
            class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors ${all ? "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-glow" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
            Complete Class ${cls.number} ${icon("check", "w-4 h-4")}
          </button>
        </div>
        ${preview}
      </div>`;
  }

  function progressStats(cls) {
    return [{ label: "Recordings", value: ClassActivity.count(cls.id, "recordings") }];
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section A — Up and down through the swaras", `
          ${narrow(`
            ${p("Class 4 introduced the seven swaras in order, going up. This class gives that direction a name — arohana — and introduces its opposite, avarohana: the same swaras, sung back down.")}
          `)}
          ${flowStrip(["LISTEN", "SING", "COMBINE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Arohana and avarohana", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["Arohana is the ascending swara sequence, from Sa up to the upper Sa.", "Avarohana is the descending swara sequence, from the upper Sa back down to Sa.", "In this class, the same seven swaras are used in both directions — just reversed.", "Many ragas actually use a different set of swaras ascending versus descending; that detail is left for later, more advanced study.", "This class stays practical: listening and singing, not raga theory."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          <p class="font-display text-lg text-ink-50 mb-3">A quick check</p>
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("listen", 3, "Section C — Listening to both directions", `
          ${narrow(p("Press each button to hear the sequence in that direction, built from your own Sa."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("aa-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div data-ladder-host>${ladderHtml(AROHANA)}</div>
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-dir="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play arohana (up)</button>
            <button type="button" data-play-dir="down" class="vr-btn">${icon("play", "w-4 h-4")} Play avarohana (down)</button>
          </div>
        `, { wide: true })}

        ${chapter("sing", 4, "Section D — Singing each direction", `
          ${narrow(p("Sing arohana, ascending from Sa. Then sing avarohana, descending from the upper Sa. Keep both comfortable and unhurried."))}
          ${recCard("aroTake", "Singing arohana (ascending)", "", 15)}
          ${recCard("avaTake", "Singing avarohana (descending)", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("sing")}</div>`)}
        `)}

        ${chapter("combine", 5, "Section E — Combining both directions", `
          ${narrow(p("If comfortable, try singing arohana immediately followed by avarohana — up to the top, then straight back down — as one connected attempt."))}
          ${recCard("combinedTake", "Arohana followed by avarohana, if comfortable", "", 20)}
        `)}

        ${chapter("mistakes", 6, "Section F — Common beginner mistakes", problems())}

        ${chapter("reflect", 7, "Section G — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("direction-q", { ...Q.direction, selected: sel("direction") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-aa", { placeholder: "e.g. Whether ascending or descending felt easier... How the combined attempt went... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 10, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function mount(container, cls, params) {
    const cleanups = [];
    const classId = cls.id;
    const $ = (s) => container.querySelector(s);
    const rec0 = () => ClassActivity.get(classId);
    const set = (g, k, v) => ClassActivity.setAnswer(classId, g, k, v);
    const own = (c) => { cleanups.push(() => c.destroy()); return c; };
    const base = () => baseNote(rec0());

    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec)).forEach(([k, v]) => {
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true);
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- knowledge check ---- */
    function onKcChoice(e) {
      const btn = e.target.closest("[data-kc-choice]");
      if (!btn) return;
      const itemEl = btn.closest("[data-kc-item]");
      const key = itemEl.dataset.kcItem;
      set("q", `kc_${key}`, btn.dataset.kcChoice);
      syncCheckpoints();
      $("[data-kc]").outerHTML = knowledgeCheckHtml(rec0());
      refreshLive();
    }
    container.addEventListener("click", onKcChoice);
    cleanups.push(() => container.removeEventListener("click", onKcChoice));

    /* ---- Section C: piano + directional playback ---- */
    own(VirtualPiano.wire(container, "aa-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); refreshLive(); } },
    }));
    function onPlayDir(e) {
      const btn = e.target.closest("[data-play-dir]");
      if (!btn) return;
      const b = base();
      const dir = btn.dataset.playDir;
      const seq = dir === "up" ? AROHANA : AVAROHANA;
      const host = $("[data-ladder-host]");
      PianoSynth.playSequence(seq.map((s) => b + s.semitone), {
        duration: 0.6, gap: 0.12,
        onNote: (i) => { if (host) host.innerHTML = ladderHtml(seq, i); },
      }).then(() => {
        ClassActivity.markCheckpoint(classId, dir === "up" ? "heardAro" : "heardAva", true);
        syncCheckpoints(); refreshLive();
      });
    }
    container.addEventListener("click", onPlayDir);
    cleanups.push(() => container.removeEventListener("click", onPlayDir));

    /* ---- skip buttons ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    const NAMES = { aroTake: "Singing arohana", avaTake: "Singing avarohana", combinedTake: "Arohana then avarohana" };
    const MAX_SECONDS = { aroTake: 15, avaTake: 15, combinedTake: 20 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 5 — ${NAMES[k]}`, exercise: `arohana-and-avarohana-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "direction-q": "direction" };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-aa", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Arohana is the ascending swara sequence and avarohana is the descending one — some ragas vary the swaras between the two, which is a detail for later.",
        struggled: "",
        toPractice: "",
        thoughts: "",
      });
      Router.softRefresh(container, ClassDetailPage, params);
    }
    container.addEventListener("click", onComplete);
    cleanups.push(() => container.removeEventListener("click", onComplete));

    cleanups.push(LessonKit.wireViewedSentinel(container, () => { ClassActivity.markCheckpoint(classId, "lessonViewed"); syncCheckpoints(); refreshLive(); }));
    cleanups.push(LessonKit.wireStepper(container));
    syncCheckpoints();

    return () => {
      cleanups.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
      PianoSynth.stopAll();
      VoiceRecorder.stopPlayback();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
