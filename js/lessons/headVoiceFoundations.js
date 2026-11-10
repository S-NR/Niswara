/* ============================================================
   LEVEL 2, CLASS 8 — HEAD VOICE FOUNDATIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "head-voice-foundations".

   Curriculum identity: Level 2, Class 8 (`number: 8`, `levelId: 2`
   in data.js, explicit id `L2C04` — unchanged since the Level 2
   Curriculum Upgrade, which moved this class from old number 4 to
   new number 8 without touching its id). Rebuilt against this
   class's own later, more detailed "Claude Prompt" spec (a dedicated
   "feeling of lighter singing" section, three named exercises A/B/C,
   a 4-row chest-vs-head comparison, a new falsetto-introduction
   section, a listen-and-observe section, a 6-step self-practice
   routine, a 5-question knowledge check, and a 6-item checklist) —
   supersedes the shorter version first written earlier in the
   project, following the same rebuild Class 7 just received.

   Core idea: "Higher notes should become lighter and easier, not
   louder and harder." Head voice is a name for a vocal coordination
   commonly used for higher notes, often feeling lighter than chest-
   dominant singing — not a sensation to force, not simply singing
   loudly at a high pitch, and not something every singer feels the
   same way.

   Honesty boundaries this spec asks for explicitly: no fabricated
   vocal analysis or automatic register/falsetto identification;
   Section 6 ("Listen and observe") never claims the app can
   automatically identify the learner's register — and since no
   professionally-recorded, clearly-labelled falsetto/head-voice
   comparison audio exists in this project, it reuses the learner's
   OWN Section 3 recordings instead of fabricating or implying a
   studio reference demonstration. Section 5 explains falsetto only
   briefly and honestly, without encouraging a forced breathy sound.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), PersonalNotes, ClassProgress.
   ============================================================ */

const HeadVoiceFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "feeling", label: "Feeling" },
    { id: "exercises", label: "Exercises" },
    { id: "compare", label: "Compare" },
    { id: "falsetto", label: "Falsetto" },
    { id: "listen", label: "Listen" },
    { id: "practice", label: "Practice" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIs",
      question: "What is head voice?",
      options: [
        { value: "loud", label: "Singing loudly at a high pitch", correct: false },
        { value: "coordination", label: "A vocal register or coordination commonly used for higher notes, often feeling lighter", correct: true },
        { value: "location", label: "A physical location in the head where sound is produced", correct: false },
      ],
      explain: { loud: "Not quite — head voice isn't about volume.", coordination: "Exactly right.", location: "Not quite — the name doesn't describe a literal sound source." },
    },
    {
      key: "literalHead",
      question: "Does head voice mean the sound physically originates in the head?",
      options: [
        { value: "yes", label: "Yes, exactly in the head", correct: false },
        { value: "no", label: "No — the sensation is subjective and doesn't mean that", correct: true },
        { value: "some", label: "Only for singers who feel vibration there", correct: false },
      ],
      explain: { yes: "Not quite — this is a name for a coordination, not a literal location.", no: "Right.", some: "Not quite — the sensation, when felt, still isn't the literal sound source." },
    },
    {
      key: "forced",
      question: "Should higher notes be forced or shouted?",
      options: [
        { value: "yes", label: "Yes, that's how you reach them", correct: false },
        { value: "no", label: "No — higher notes should become lighter and easier, not louder and harder", correct: true },
        { value: "sometimes", label: "Only at the very top of your range", correct: false },
      ],
      explain: { yes: "Not quite — forcing works against a light, comfortable coordination.", no: "Exactly right.", sometimes: "Not quite — this is true across your whole comfortable range." },
    },
    {
      key: "hummingHelps",
      question: "How can gentle humming help explore head voice?",
      options: [
        { value: "louder", label: "It makes the voice louder", correct: false },
        { value: "explore", label: "It lets you explore a lighter coordination without forcing pitch or volume", correct: true },
        { value: "useless", label: "It isn't useful for this", correct: false },
      ],
      explain: { louder: "Not quite — humming isn't about volume.", explore: "Right — that's exactly why Exercise A starts there.", useless: "Not quite — it's a genuinely useful, gentle starting point." },
    },
    {
      key: "falsettoSame",
      question: "Is falsetto exactly the same as every form of head voice?",
      options: [
        { value: "yes", label: "Yes, they're identical", correct: false },
        { value: "no", label: "No — the distinction can vary across vocal traditions and teaching approaches", correct: true },
        { value: "never", label: "No, they're completely unrelated", correct: false },
      ],
      explain: { yes: "Not quite — they're related but not identical.", no: "Exactly right.", never: "Not quite — they are related, just not identical in every tradition." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what head voice means." },
    { key: "exploreHum", label: "I can explore gentle humming." },
    { key: "lightOo", label: "I can try a light “oo” sound." },
    { key: "smallRange", label: "I can move through a small comfortable pitch range." },
    { key: "notLouder", label: "I understand that higher notes do not need to be louder." },
    { key: "recognisePushing", label: "I can recognise when I am pushing my voice." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const l2c3 = (ClassActivity.get("L2C03").answers.setup || {}).note;
    if (ok(l2c3)) return l2c3;
    const l2c2 = (ClassActivity.get("L2C02").answers.setup || {}).note;
    if (ok(l2c2)) return l2c2;
    const l2c1 = (ClassActivity.get("L2C01").answers.setup || {}).note;
    if (ok(l2c1)) return l2c1;
    const c25 = (ClassActivity.get("L1C25").answers.setup || {}).note;
    if (ok(c25)) return c25;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function compareHtml() {
    const rows = [
      ["Often speech-like", "Often lighter"],
      ["Commonly used in lower-to-middle notes", "Commonly used in higher notes"],
      ["Can feel fuller", "Can feel less heavy"],
      ["Should remain comfortable", "Should remain comfortable"],
    ];
    return `
      <table class="w-full text-sm text-ink-300 mb-3"><tbody>
        <tr class="border-b border-white/5"><td class="py-2"></td><td class="py-2 font-display text-ink-50">Chest-dominant coordination</td><td class="py-2 font-display text-ink-50">Head-dominant coordination</td></tr>
        ${rows.map(([a, b]) => `<tr class="border-b border-white/5"><td class="py-2 text-ink-500"></td><td class="py-2">${a}</td><td class="py-2">${b}</td></tr>`).join("")}
      </tbody></table>
      <p class="text-xs text-ink-500">Vocal registers overlap, and their range varies from person to person — these aren't defined by fixed pitch ranges.</p>`;
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
      ["Pushing for a specific high note", "Stay within whatever feels light and comfortable today."],
      ["Increasing volume to reach higher pitches", "Keep the sound light instead — volume doesn't help."],
      ["Forcing a breathy sound to imitate falsetto", "Let any breathiness happen naturally, if at all."],
      ["Repeating a siren glide many times in a row", "Rest between attempts — a few gentle repetitions are enough."],
      ["Expecting an identical sensation to someone else's", "Sensations vary; comfort and ease matter more."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [["humTake", "Gentle humming"], ["ooTake", "Light “oo”"], ["sirenTake", "Gentle siren glide"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the Section 3 exercises above, then come back here to listen and notice.</p>`;
    return `<div class="flex flex-wrap gap-2">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 8 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Lighter, not louder.</p>
        <p class="text-sm text-ink-300">Higher notes should become lighter and easier — never louder and harder.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 9 — Connecting Chest & Head Voice</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson begins connecting the two coordinations you've just explored separately.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Higher notes should become lighter and easier, not louder and harder.</h3>
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
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section 1 — What is head voice?", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Head voice is a vocal register or coordination commonly used for higher singing notes.", "It often feels lighter than chest-dominant singing.", "Some singers notice vibration or resonance sensations around the face or head.", "These sensations are subjective and don't mean the sound physically originates in the head.", "Head voice is not simply singing loudly at a high pitch."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            ${p("Class 7 explored chest-dominant coordination, often speech-like and used in lower-to-middle notes. This class explores the lighter coordination often used higher up.")}
          `)}
          ${flowStrip(["FEEL", "EXPLORE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("feeling", 2, "Section 2 — Understand the feeling of lighter singing", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Relax the shoulders, jaw and neck.", "Begin with gentle humming.", "Try a comfortable, light “oo” sound.", "Explore a small upward movement in pitch.", "Return to the starting pitch.", "Notice whether the sound remains relaxed."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500">There's no particular high note to reach — only noticing whether the sound stays relaxed.</p>
          `)}
        `)}

        ${chapter("exercises", 3, "Section 3 — Gentle head voice exploration", `
          ${narrow(p("All three exercises use the same small, comfortable pitch range — choose a starting note on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("hv-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-6">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} Slightly higher, then back</button>
          </div>

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise A — Gentle humming</p>${p("Start with a comfortable hum, then slowly explore a small upward movement. Keep the sound relaxed.")}`)}
          ${recCard("humTake", "Gentle humming, with a small upward movement", "", 15)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("hum")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise B — Light “oo” exercise</p>${p("Sing a comfortable “oo”, then move gently between two nearby pitches. Avoid increasing volume to reach the higher one.")}`)}
          ${recCard("ooTake", "Light “oo” between two nearby pitches", "", 15)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("oo")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise C — Gentle siren</p>${p("With a soft “oo”, glide through a small comfortable pitch range — moving upward and downward without forcing the voice.")}`)}
          ${recCard("sirenTake", "A gentle siren glide", "", 15)}
          ${narrow(`<div class="mt-2">${skipBtn("siren")}</div>`)}
        `, { wide: true })}

        ${chapter("compare", 4, "Section 4 — Chest voice versus head voice", compareHtml())}

        ${chapter("falsetto", 5, "Section 5 — Introduction to falsetto", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
              ${["Falsetto is another vocal production pattern often discussed in relation to higher notes.", "It can sound breathier or lighter than some forms of head voice.", "The distinction between head voice and falsetto can vary across vocal traditions and teaching approaches.", "This class does not require you to master falsetto."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-xs text-ink-500">No need to force a breathy sound to explore this — the exercises above are enough for today.</p>
          `)}
        `)}

        ${chapter("listen", 6, "Section 6 — Listen and observe", `
          ${narrow(p("No studio comparison recording exists in this app — instead, listen back to your own Section 3 exercises above and simply notice differences in tone and coordination."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`<p class="text-xs text-ink-500 mt-4">This is awareness, not diagnosis — this class never claims to automatically identify your vocal register.</p>`)}
        `)}

        ${chapter("practice", 7, "Section 7 — Practical self-practice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Relax.", "Hum comfortably.", "Try a gentle “oo”.", "Explore a small upward glide.", "Return to the starting note.", "Rest and reflect."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${recCard("practiceRoutineTake", "The self-practice routine", "Entirely optional.", 20)}
        `)}

        ${chapter("quiz", 8, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 9, "Self-assessment and reflection", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, a successful recording, or finishing every optional exercise.")}
            <div class="flex flex-col gap-1 mb-6">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="hv-reflection">Did your voice feel lighter when you explored the higher notes? Did you notice any tension or difficulty?</label><textarea id="hv-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 10, "Common beginner mistakes", problems())}

        ${chapter("complete", 11, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-hv", { placeholder: "e.g. Whether the siren glide felt relaxed... Any tension I noticed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Vocal safety", `
          ${narrow(`
            ${p("Don't force high notes, and don't increase loudness to reach them. Avoid prolonged sirens or repeated high-note attempts — short, gentle practice is enough.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
        if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v);
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
      $("[data-kc]").outerHTML = knowledgeCheckHtml(rec0());
    }
    container.addEventListener("click", onKcChoice);
    cleanups.push(() => container.removeEventListener("click", onKcChoice));

    /* ---- Section 3: piano + playback ---- */
    own(VirtualPiano.wire(container, "hv-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

    /* ---- skip buttons ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = { humTake: "Gentle humming", ooTake: "Light “oo”", sirenTake: "Gentle siren glide", practiceRoutineTake: "Self-practice routine" };
    const MAX_SECONDS = { humTake: 15, ooTake: 15, sirenTake: 15, practiceRoutineTake: 20 };
    const REVIEW_SOURCE_KEYS = ["humTake", "ooTake", "sirenTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 8 — ${NAMES[k]}`, exercise: `head-voice-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_SOURCE_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section 6: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- growth textarea (reflection) ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => set("growth", key, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- completion checklist ---- */
    function onChecklist(e) {
      const cb = e.target.closest("[data-checklist]");
      if (!cb) return;
      set("checklist", cb.dataset.checklist, cb.checked);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("change", onChecklist);
    cleanups.push(() => container.removeEventListener("change", onChecklist));

    /* ---- Common Warm-up note (only if already unlocked) ---- */
    const warmupHost = $("[data-warmup-note]");
    if (warmupHost && Warmup.isUnlocked()) {
      warmupHost.innerHTML = `<p class="text-sm text-ink-400 mt-2">You can also use the <a href="#/warmup" class="text-gold-300 hover:text-gold-200 underline">Common Warm-up</a> before practising, if that feels useful.</p>`;
    }

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-hv", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Higher notes should become lighter and easier, not louder and harder — head voice is a coordination, not a sensation to force.",
        struggled: "",
        toPractice: A(rec0(), "growth").reflection || "",
        thoughts: "",
      });
      Router.softRefresh(container, ClassDetailPage, params);
    }
    container.addEventListener("click", onComplete);
    cleanups.push(() => container.removeEventListener("click", onComplete));

    cleanups.push(LessonKit.wireViewedSentinel(container, () => ClassActivity.markCheckpoint(classId, "lessonViewed")));
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
