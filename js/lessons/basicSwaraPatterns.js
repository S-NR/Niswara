/* ============================================================
   LEVEL 2, CLASS 6 — BASIC SWARA PATTERNS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "basic-swara-patterns".

   Curriculum identity: Level 2, Class 6 (`number: 6`, `levelId: 2`
   in data.js, explicit id `L2C29`). Last of four new "Musical
   Foundations" classes, closing that short arc before the curriculum
   returns to the vocal-technique track at Class 7 (Chest Voice
   Foundations). Builds on Class 5's arohana/avarohana (`L2C28`),
   combining a few swaras at a time into short, repeatable patterns
   instead of always singing the full seven-swara scale.

   Core idea: short swara patterns — moving a few steps up and back
   down — are a common, practical way to practise before attempting
   a full scale or a song. This class deliberately keeps to three
   small patterns and does not introduce tala (rhythm cycles) or
   gamaka (ornamentation); both are named here only as "for later."

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection; the knowledge check is a concept check, not a
   performance score; completion never depends on singing in tune.

   Reuses: LessonKit, VirtualPiano, PianoSynth.playSequence,
   RecordingCard, SelfAssessment, PersonalNotes, ClassProgress.
   ============================================================ */

const BasicSwaraPatternsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "patterns", label: "Patterns" },
    { id: "listen", label: "Listen" },
    { id: "sing", label: "Sing" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;

  const SEMITONE = { sa: 0, ri: 2, ga: 4, ma: 5, pa: 7, dha: 9, ni: 11, sa2: 12 };
  const LABEL = { sa: "Sa", ri: "Ri", ga: "Ga", ma: "Ma", pa: "Pa", dha: "Dha", ni: "Ni", sa2: "Sa˙" };

  const PATTERNS = [
    { key: "p1", title: "Sa Ri Ga Ri Sa", swaras: ["sa", "ri", "ga", "ri", "sa"] },
    { key: "p2", title: "Sa Ri Ga Ma Ga Ri Sa", swaras: ["sa", "ri", "ga", "ma", "ga", "ri", "sa"] },
    { key: "p3", title: "Sa Ri Ga Ma Pa Ma Ga Ri Sa", swaras: ["sa", "ri", "ga", "ma", "pa", "ma", "ga", "ri", "sa"] },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "pattern",
      question: "What is a basic swara pattern, as used in this class?",
      options: [
        { value: "rhythm", label: "A fixed rhythm cycle (tala)", correct: false },
        { value: "short", label: "A short, repeatable sequence using a few swaras, moving up and back down", correct: true },
        { value: "ornament", label: "A vocal ornament (gamaka)", correct: false },
      ],
      explain: { rhythm: "Not quite — tala is a separate idea, not covered here.", short: "Exactly — a small, manageable group of swaras to practise before a full scale or song.", ornament: "Not quite — gamaka is a separate, more advanced idea." },
    },
    {
      key: "why",
      question: "Why practise short patterns instead of always singing the full seven-swara scale?",
      options: [
        { value: "easier", label: "Shorter patterns are easier to focus on and repeat comfortably", correct: true },
        { value: "faster", label: "So you can sing as fast as possible", correct: false },
        { value: "required", label: "Because the full scale is no longer useful once you know patterns", correct: false },
      ],
      explain: { easier: "Right — smaller, focused practice builds comfort and accuracy gradually.", faster: "Not quite — speed isn't the goal here.", required: "Not quite — the full scale from Classes 4 and 5 is still useful; patterns are a complementary way to practise." },
    },
    {
      key: "scope",
      question: "Does this class teach tala (rhythm cycles) or gamaka (ornamentation)?",
      options: [
        { value: "yes", label: "Yes, both are covered in full here", correct: false },
        { value: "no", label: "No — both are only named as ideas for later, more advanced classes", correct: true },
        { value: "tala", label: "Only tala is covered", correct: false },
      ],
      explain: { yes: "Not quite — neither is taught in depth in this class.", no: "Right. This class stays focused on simple pitch patterns.", tala: "Not quite — tala isn't taught here either." },
    },
  ];

  const PROGRESS_ITEMS = [
    { key: "understood", label: "I understand what a basic swara pattern is." },
    { key: "heardPattern", label: "I listened to at least one pattern." },
    { key: "triedOrSkipped", label: "I tried singing a pattern, or chose to skip for comfort." },
    { key: "reflected", label: "I reflected on which pattern felt most comfortable." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    favorite: { question: "Which pattern felt most comfortable?", options: PATTERNS.map((pt) => opt(pt.key, pt.title)).concat([opt("none", "None of them yet")]) },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= SA_MAX;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c28 = (ClassActivity.get("L2C28").answers.setup || {}).note;
    if (ok(c28)) return c28;
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
  const heard = (rec) => A(rec, "heard");

  function derivedCheckpoints(rec) {
    const out = {};
    if (KNOWLEDGE_CHECK.every((k) => q(rec, `kc_${k.key}`)) && !!rec.checkpoints.lessonViewed) out.understood = true;
    if (Object.values(heard(rec)).some(Boolean)) out.heardPattern = true;
    if (PATTERNS.some((pt) => take(rec, `${pt.key}Take`)) || skipped(rec, "sing")) out.triedOrSkipped = true;
    if (q(rec, "favorite")) out.reflected = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function ladderHtml(swaras, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-4">
      ${swaras.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-base ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${LABEL[s]}</span>
        </div>`).join("")}
    </div>`;
  }

  function patternCardHtml(pt, rec, activeIndex = -1) {
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4" data-pattern-card="${pt.key}">
      <p class="font-display text-lg text-ink-50 mb-2">${pt.title}</p>
      <div data-pattern-ladder="${pt.key}">${ladderHtml(pt.swaras, activeIndex)}</div>
      <div class="flex flex-wrap gap-3 mb-3">
        <button type="button" data-play-pattern="${pt.key}" class="vr-btn vr-btn-gold">${icon("play", "w-3.5 h-3.5")} Play this pattern</button>
      </div>
      ${recCard(`${pt.key}Take`, `Singing: ${pt.title}`, "", 15)}
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
      ["Trying all three patterns perfectly on the first attempt", "One comfortable pattern, practised a few times, is a complete session."],
      ["Singing faster to sound more skilled", "A slow, even pace makes each swara easier to hear and place accurately."],
      ["Treating this as the start of tala or gamaka study", "Both are separate, more advanced topics saved for later levels."],
      ["Skipping straight to the longest pattern", "Starting with the shortest pattern and only adding length when it feels easy is a better beginner approach."],
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 6 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Musical Foundations complete.</p>
        <p class="text-sm text-ink-300">Shruti, Sa, the seven swaras, arohana, avarohana, and a few short patterns — all built from your own voice.</p>
        <p class="text-sm text-ink-100">The next classes return to vocal technique, carrying this listening vocabulary forward.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 7 — Chest Voice Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The curriculum now returns to vocal technique — exploring comfortable, speech-like chest-voice sounds.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Short, repeatable swara patterns are a practical way to build comfort before a full scale or song.</h3>
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

        ${chapter("understand", 1, "Section A — Practising in small pieces", `
          ${narrow(`
            ${p("Classes 4 and 5 worked with the full seven-swara scale, up and down. This class breaks that scale into a few short, repeatable patterns — a common, practical way to build comfort before attempting a full scale or a song.")}
          `)}
          ${flowStrip(["CHOOSE", "LISTEN", "SING", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("patterns", 2, "Section B — What a swara pattern is", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["A swara pattern is a short, repeatable sequence that uses a few swaras, usually moving up and then back down.", "Practising short patterns builds comfort and accuracy gradually, before attempting a full scale or song.", "This class doesn't introduce tala (rhythm cycles) or gamaka (ornamentation) — both are separate ideas for later, more advanced classes.", "There's no need to master all three patterns below — even one, practised comfortably, is a complete session."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          <p class="font-display text-lg text-ink-50 mb-3">A quick check</p>
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("listen", 3, "Section C — Three basic patterns", `
          ${narrow(p("Your Sa carries over from the earlier classes. Press play on any pattern to hear it, then try singing along or on your own below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("bp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div data-patterns-host>${PATTERNS.map((pt) => patternCardHtml(pt, rec)).join("")}</div>
        `, { wide: true })}

        ${chapter("sing", 4, "Section D — Singing a pattern", `
          ${narrow(p("The recordings above are entirely optional — pick whichever pattern felt most comfortable and try singing it, with or without the audio playing first."))}
          ${narrow(`<div class="mt-1">${skipBtn("sing")}</div>`)}
        `)}

        ${chapter("mistakes", 5, "Section E — Common beginner mistakes", problems())}

        ${chapter("reflect", 6, "Section F — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("favorite-q", { ...Q.favorite, selected: sel("favorite") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 7, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-bp", { placeholder: "e.g. Which pattern felt easiest... Whether I'd like to try a longer pattern next time..." })}
        `)}

        ${chapter("complete", 8, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 9, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Section C: piano + pattern playback ---- */
    own(VirtualPiano.wire(container, "bp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); refreshLive(); } },
    }));
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const key = btn.dataset.playPattern;
      const pt = PATTERNS.find((x) => x.key === key);
      if (!pt) return;
      const b = base();
      const ladderHost = $(`[data-pattern-ladder="${key}"]`);
      PianoSynth.playSequence(pt.swaras.map((s) => b + SEMITONE[s]), {
        duration: 0.55, gap: 0.12,
        onNote: (i) => { if (ladderHost) ladderHost.innerHTML = ladderHtml(pt.swaras, i); },
      }).then(() => {
        set("heard", key, true);
        syncCheckpoints(); refreshLive();
      });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

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
    PATTERNS.forEach((pt) => {
      own(RecordingCard.wire(container, `rc-${pt.key}Take`, {
        classId, take: take(rec0(), `${pt.key}Take`), maxSeconds: 15,
        meta: { name: `Level 2, Class 6 — Singing ${pt.title}`, exercise: `basic-swara-patterns-${pt.key}` },
        onSaved: (t) => { set("recs", `${pt.key}Take`, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "favorite-q": "favorite" };
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
    own(PersonalNotes.wire(container, "notes-bp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Short, repeatable swara patterns are a practical way to build comfort before a full scale or song.",
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
