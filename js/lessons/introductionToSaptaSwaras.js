/* ============================================================
   LEVEL 2, CLASS 4 — INTRODUCTION TO SAPTA SWARAS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "introduction-to-sapta-swaras".

   Curriculum identity: Level 2, Class 4 (`number: 4`, `levelId: 2`
   in data.js, explicit id `L2C27`). Second of four new "Musical
   Foundations" classes. Builds directly on Class 3's chosen Sa
   (`L2C26`'s `setup.note`) — every swara here is just an interval
   above that one personal reference pitch, never a fixed note.

   Core idea: the seven swaras (Sa Ri Ga Ma Pa Dha Ni) plus the
   upper Sa are introduced as named positions relative to the
   learner's own Sa, using the single most common beginner variety
   (the "Shankarabharanam" interval set, which matches a Western
   major scale) — explicitly noted as one of several varieties that
   exist, without teaching those other varieties in any detail, per
   this class's own scope. No raga or gamaka theory is introduced.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection; the knowledge check is a concept check, not a
   performance score; completion never depends on singing every
   swara in tune.

   Reuses: LessonKit, VirtualPiano, PianoSynth.playSequence (with
   onNote for highlighting — new use of an existing primitive),
   RecordingCard, SelfAssessment, PersonalNotes, ClassProgress.
   ============================================================ */

const IntroductionToSaptaSwarasLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "swaras", label: "Swaras" },
    { id: "listen", label: "Listen" },
    { id: "sing", label: "Sing" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;

  const SWARAS = [
    { key: "sa", label: "Sa", full: "Shadja", semitone: 0 },
    { key: "ri", label: "Ri", full: "Rishabha", semitone: 2 },
    { key: "ga", label: "Ga", full: "Gandhara", semitone: 4 },
    { key: "ma", label: "Ma", full: "Madhyama", semitone: 5 },
    { key: "pa", label: "Pa", full: "Panchama", semitone: 7 },
    { key: "dha", label: "Dha", full: "Dhaivata", semitone: 9 },
    { key: "ni", label: "Ni", full: "Nishada", semitone: 11 },
    { key: "sa2", label: "Sa˙", full: "Shadja (upper)", semitone: 12 },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "swara",
      question: "What is a swara?",
      options: [
        { value: "volume", label: "A specific volume level", correct: false },
        { value: "note", label: "A named note position, described relative to your own Sa", correct: true },
        { value: "rhythm", label: "A rhythm pattern", correct: false },
      ],
      explain: { volume: "Not quite — a swara isn't about loudness.", note: "Exactly. Each swara is a position relative to your personal Sa, not a fixed pitch.", rhythm: "Not quite — rhythm is a separate idea from swara." },
    },
    {
      key: "count",
      question: "How many swaras make up the basic sapta swara set, not counting the upper Sa?",
      options: [
        { value: "five", label: "Five", correct: false },
        { value: "seven", label: "Seven — Sa Ri Ga Ma Pa Dha Ni", correct: true },
        { value: "twelve", label: "Twelve", correct: false },
      ],
      explain: { five: "Not quite — there are seven.", seven: "Exactly right — \"sapta\" means seven.", twelve: "Not quite — twelve would include every variety of every swara, which this class doesn't teach yet." },
    },
    {
      key: "varieties",
      question: "Does this class teach every variety of every swara (for example, every version of Ri)?",
      options: [
        { value: "yes", label: "Yes, all varieties are taught now", correct: false },
        { value: "no", label: "No — only one common beginner variety is used here; other varieties exist but come later", correct: true },
        { value: "none", label: "No varieties exist at all", correct: false },
      ],
      explain: { yes: "Not quite — this class deliberately uses just one variety for now.", no: "Right. Varieties are mentioned conceptually, not taught in depth yet.", none: "Not quite — several varieties genuinely exist; they're just not this class's focus." },
    },
  ];

  const PROGRESS_ITEMS = [
    { key: "understood", label: "I understand what a swara is and that Sa is my own reference." },
    { key: "heardScale", label: "I listened to the ascending swara sequence." },
    { key: "triedOrSkipped", label: "I tried singing along with the swaras, or chose to skip for comfort." },
    { key: "reflected", label: "I reflected on which swaras felt easiest and hardest." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    easiest: { question: "Which swara felt easiest to sing?", options: SWARAS.map((s) => opt(s.key, s.label)) },
    hardest: { question: "Which swara felt hardest to sing?", options: SWARAS.map((s) => opt(s.key, s.label)) },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= SA_MAX;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
    if (rec.checkpoints.heardScaleFlag) out.heardScale = true;
    if (take(rec, "scaleTake") || skipped(rec, "sing")) out.triedOrSkipped = true;
    if (q(rec, "easiest") && q(rec, "hardest")) out.reflected = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 20) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function swaraLadderHtml(activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-5" data-swara-ladder>
      ${SWARAS.map((s, i) => `
        <div data-swara-chip="${i}" class="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-lg ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${s.label}</span>
          <span class="text-[10px] uppercase tracking-wide text-ink-500">${s.full}</span>
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
      ["Assuming Sa must match a Western 'do' or the note C", "Sa is your own chosen reference from Class 3 — every swara here is relative to it."],
      ["Trying to learn every variety of Ri, Ga, Ma, Dha and Ni right away", "This class deliberately teaches just one common variety. Others come later, gradually."],
      ["Singing the swaras loudly to 'get them right'", "Accuracy of the interval matters far more than volume."],
      ["Rushing through all eight swaras quickly", "A slow, comfortable pace makes the intervals easier to hear and internalise."],
      ["Feeling discouraged if some swaras feel less natural than others", "That's completely normal at this stage — it's awareness, not a test."],
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 4 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Sa Ri Ga Ma Pa Dha Ni Sa˙.</p>
        <p class="text-sm text-ink-300">Seven named positions, all relative to the Sa you chose.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 5 — Arohana and Avarohana</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores the same seven swaras moving upward (arohana) and back downward (avarohana).</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">The seven swaras are named positions relative to your own Sa — not fixed pitches.</h3>
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

        ${chapter("understand", 1, "Section A — From Sa to seven swaras", `
          ${narrow(`
            ${p("Class 3 introduced Sa — your own chosen reference pitch. This class introduces the other six named positions that, together with Sa, make up the sapta swara (\"seven swaras\") set: Sa Ri Ga Ma Pa Dha Ni, plus an upper Sa an octave above.")}
            ${p("Every one of these is described only as a distance from your Sa — never as a fixed note like C or D.")}
          `)}
          ${flowStrip(["LEARN", "LISTEN", "SING", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("swaras", 2, "Section B — The seven swaras", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["A swara is a named note position, described relative to your own Sa.", "The basic set is Sa, Ri, Ga, Ma, Pa, Dha, Ni — seven swaras — followed by an upper Sa, one octave above.", "Sa and Pa always sit in the same position relative to Sa; they have no varieties.", "Ri, Ga, Ma, Dha and Ni each have more than one possible variety in Carnatic music — mentioned here only as a concept, not taught in detail yet.", "This class uses one common beginner variety for all seven swaras, matching a familiar major-scale pattern."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          ${swaraLadderHtml()}
          <p class="font-display text-lg text-ink-50 mb-3">A quick check</p>
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("listen", 3, "Section C — Listening to the ascending swaras", `
          ${narrow(p("Press play to hear Sa through the upper Sa, one swara at a time, built from your own reference pitch. Watch the names highlight as each one plays."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("sw-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div data-swara-ladder-host>${swaraLadderHtml()}</div>
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scale class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Sa to Sa˙</button>
          </div>
        `, { wide: true })}

        ${chapter("sing", 4, "Section D — Singing along", `
          ${narrow(p("Listen to the ascending swaras again, this time humming or singing along softly. Then try singing the full sequence once from memory, without the audio playing."))}
          ${recCard("scaleTake", "Singing Sa Ri Ga Ma Pa Dha Ni Sa˙, from memory", "", 20)}
          ${narrow(`<div class="mt-3">${skipBtn("sing")}</div>`)}
        `)}

        ${chapter("mistakes", 5, "Section E — Common beginner mistakes", problems())}

        ${chapter("reflect", 6, "Section F — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("easiest-q", { ...Q.easiest, selected: sel("easiest") })}
              ${SelfAssessment.render("hardest-q", { ...Q.hardest, selected: sel("hardest") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 7, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-sw", { placeholder: "e.g. Which swaras felt easiest... Whether the upper Sa felt comfortable... What I want to try next time..." })}
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

    /* ---- Section C: piano + ascending playback ---- */
    own(VirtualPiano.wire(container, "sw-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); refreshLive(); } },
    }));
    function onPlayScale(e) {
      if (!e.target.closest("[data-play-scale]")) return;
      const b = base();
      const host = $("[data-swara-ladder-host]");
      PianoSynth.playSequence(SWARAS.map((s) => b + s.semitone), {
        duration: 0.7, gap: 0.15,
        onNote: (i) => { if (host) host.innerHTML = swaraLadderHtml(i); },
      }).then(() => { ClassActivity.markCheckpoint(classId, "heardScaleFlag", true); syncCheckpoints(); refreshLive(); });
    }
    container.addEventListener("click", onPlayScale);
    cleanups.push(() => container.removeEventListener("click", onPlayScale));

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
    own(RecordingCard.wire(container, "rc-scaleTake", {
      classId, take: take(rec0(), "scaleTake"), maxSeconds: 20,
      meta: { name: "Level 2, Class 4 — Singing the swaras", exercise: "introduction-to-sapta-swaras-scaleTake" },
      onSaved: (t) => { set("recs", "scaleTake", t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "easiest-q": "easiest", "hardest-q": "hardest" };
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
    own(PersonalNotes.wire(container, "notes-sw", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "The seven swaras — Sa Ri Ga Ma Pa Dha Ni — are named positions relative to my own chosen Sa, not fixed pitches.",
        struggled: q(rec0(), "hardest") || "",
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
