/* ============================================================
   LEVEL 2, CLASS 4 — INTRODUCTION TO SAPTA SWARAS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "introduction-to-sapta-swaras".

   Curriculum identity: Level 2, Class 4 (`number: 4`, `levelId: 2`
   in data.js, explicit id `L2C27`). Rebuilt against this class's own
   later, more detailed "Claude Prompt" spec (individual swara cards,
   a named arohana/avarohana section each, a listen-and-identify
   exercise, a 6-question knowledge check, and a 6-item checklist) —
   supersedes the shorter version first written during the Level 2
   Curriculum Upgrade. Builds directly on Class 3's chosen Sa
   (`L2C26`'s `setup.note`) — every swara here is just an interval
   above that one personal reference pitch, never a fixed note.

   Core idea: "Music is built from notes. Let's learn to recognise
   and sing those notes one by one." The seven swaras (Sa Ri Ga Ma Pa
   Dha Ni) are introduced by name and order, using the single most
   common beginner variety (the "Shankarabharanam" interval set), with
   an explicit, honest note that this is an introduction, not a
   complete swara theory course: Ri/Ga/Ma/Dha/Ni's other varieties and
   raga formation are named as later topics, not taught here, and a
   simple sequence is not automatically a complete raga.

   Honesty boundaries this spec asks for explicitly: no generated
   frequency is presented as some other, more "accurate" Carnatic
   tuning than what this app's equal-tempered synth actually plays —
   every swara card and sequence plays the same synthesized
   `PianoSynth` tone used everywhere else in this app, relative to the
   learner's own chosen Sa, and the lesson says so rather than
   implying a specially-sourced Carnatic audio sample. The Section 5
   "listen and identify" exercise only ever grades a sequence this
   app itself generated and played — never a claim about the
   learner's own singing.

   Reuses: LessonKit, VirtualPiano (Section 1, as a visual aid only —
   the lesson text clarifies the chosen Sa, not a fixed Western note,
   sets the reference pitch), PianoSynth.playSequence/.play,
   RecordingCard, PersonalNotes, ClassProgress.
   ============================================================ */

const IntroductionToSaptaSwarasLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Swaras" },
    { id: "arohana", label: "Arohana" },
    { id: "avarohana", label: "Avarohana" },
    { id: "cards", label: "Cards" },
    { id: "practice", label: "Practice" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;

  const SWARAS = [
    { key: "sa", label: "Sa", full: "Shadja", semitone: 0, say: "sah" },
    { key: "ri", label: "Ri", full: "Rishabha", semitone: 2, say: "ree" },
    { key: "ga", label: "Ga", full: "Gandhara", semitone: 4, say: "gah" },
    { key: "ma", label: "Ma", full: "Madhyama", semitone: 5, say: "mah" },
    { key: "pa", label: "Pa", full: "Panchama", semitone: 7, say: "pah" },
    { key: "dha", label: "Dha", full: "Dhaivata", semitone: 9, say: "dhah" },
    { key: "ni", label: "Ni", full: "Nishada", semitone: 11, say: "nee" },
  ];
  const UPPER_SA = { key: "sa2", label: "Sa˙", full: "Shadja (upper)", semitone: 12, say: "sah" };
  const AROHANA = [...SWARAS, UPPER_SA];
  const AVAROHANA = [UPPER_SA, ...[...SWARAS].reverse()];

  const KNOWLEDGE_CHECK = [
    {
      key: "count",
      question: "How many basic swaras are introduced in Sapta Swaras?",
      options: [
        { value: "five", label: "Five", correct: false },
        { value: "seven", label: "Seven", correct: true },
        { value: "twelve", label: "Twelve", correct: false },
      ],
      explain: { five: "Not quite — there are seven.", seven: "Exactly right — \"sapta\" means seven.", twelve: "Not quite — twelve would include every variety of every swara, which this class doesn't teach yet." },
    },
    {
      key: "afterGa",
      question: "What comes after Ga?",
      options: [
        { value: "ri", label: "Ri", correct: false },
        { value: "ma", label: "Ma", correct: true },
        { value: "pa", label: "Pa", correct: false },
      ],
      explain: { ri: "Not quite — Ri comes before Ga.", ma: "Right — the order is Sa, Ri, Ga, Ma, Pa, Dha, Ni.", pa: "Not quite — Ma comes between Ga and Pa." },
    },
    {
      key: "maFullName",
      question: "What is the full name of Ma?",
      options: [
        { value: "madhyama", label: "Madhyama", correct: true },
        { value: "gandhara", label: "Gandhara", correct: false },
        { value: "panchama", label: "Panchama", correct: false },
      ],
      explain: { madhyama: "Exactly right.", gandhara: "Not quite — Gandhara is the full name of Ga.", panchama: "Not quite — Panchama is the full name of Pa." },
    },
    {
      key: "arohana",
      question: "What is Arohana?",
      options: [
        { value: "down", label: "The descending sequence", correct: false },
        { value: "up", label: "The ascending sequence, from Sa up to the upper Sa", correct: true },
        { value: "rhythm", label: "A rhythm cycle", correct: false },
      ],
      explain: { down: "Not quite — that's Avarohana.", up: "Exactly — Arohana moves upward through the swaras.", rhythm: "Not quite — Arohana is about pitch direction, not rhythm." },
    },
    {
      key: "avarohana",
      question: "What is Avarohana?",
      options: [
        { value: "up", label: "The ascending sequence", correct: false },
        { value: "down", label: "The descending sequence, from the upper Sa back down to Sa", correct: true },
        { value: "sa", label: "A type of Sa", correct: false },
      ],
      explain: { up: "Not quite — that's Arohana.", down: "Exactly — Avarohana moves back downward through the swaras.", sa: "Not quite — Avarohana is a direction, not a kind of Sa." },
    },
    {
      key: "saFixed",
      question: "Is Sa always the Western note C?",
      options: [
        { value: "yes", label: "Yes", correct: false },
        { value: "no", label: "No — Sa is the singer's own chosen reference, from Class 3", correct: true },
        { value: "carnatic", label: "Only in Carnatic music", correct: false },
      ],
      explain: { yes: "Not quite — Sa is never fixed to one Western note like C.", no: "Exactly right.", carnatic: "Not quite — Sa is personal in every case, not just within Carnatic music." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "canName", label: "I can name all seven basic swaras." },
    { key: "knowOrder", label: "I know their correct order." },
    { key: "recogniseAscending", label: "I can recognise the ascending sequence." },
    { key: "recogniseDescending", label: "I can recognise the descending sequence." },
    { key: "followIndividual", label: "I can listen to and follow individual swaras." },
    { key: "comfortablePace", label: "I can attempt the sequence at a comfortable pace." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
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
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  function shuffle(values) {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 20) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function sequenceLadderHtml(sequence, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-5">
      ${sequence.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-lg ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${s.label}</span>
        </div>`).join("")}
    </div>`;
  }

  function cardsHtml(rec) {
    const selected = A(rec, "cards").selected;
    return `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3" data-swara-cards>
      ${SWARAS.map((s) => `
        <button type="button" data-swara-card="${s.key}" class="text-left rounded-2xl border p-4 transition-colors ${selected === s.key ? "border-gold-400/50 bg-gold-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
          <p class="font-display text-2xl text-ink-50 mb-1">${s.label}</p>
          <p class="text-[11px] uppercase tracking-wide text-ink-500">${s.full}</p>
          <p class="text-xs text-ink-400 mt-1">say "${s.say}"</p>
        </button>`).join("")}
    </div>`;
  }

  function cardDetailHtml(rec) {
    const selected = A(rec, "cards").selected;
    const s = SWARAS.find((x) => x.key === selected);
    if (!s) return `<p class="text-sm text-ink-500">Select a card above to listen to that swara.</p>`;
    return `
      <p class="font-display text-xl text-ink-50 mb-1">${s.label} <span class="text-ink-500 text-sm">(${s.full})</span></p>
      <p class="text-sm text-ink-300 mb-3">Position ${SWARAS.indexOf(s) + 1} of 7 in the sequence, ${s.semitone} semitones above your Sa.</p>
      <div class="flex flex-wrap gap-3">
        <button type="button" data-card-listen class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
        <button type="button" data-card-repeat class="vr-btn">${icon("play", "w-4 h-4")} Repeat</button>
      </div>`;
  }

  function identifyHtml(rec) {
    const idf = A(rec, "identify");
    const targetKey = idf.targetKey || SWARAS[Math.floor(Math.random() * SWARAS.length)].key;
    const answered = idf.answered || null;
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5" data-identify>
      <p class="text-sm text-ink-300 mb-3">Press play, then choose which swara you heard.</p>
      <div class="flex flex-wrap gap-3 mb-4">
        <button type="button" data-identify-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play a swara</button>
        <button type="button" data-identify-new class="vr-btn">New swara</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${SWARAS.map((s) => `<button type="button" data-identify-choice="${s.key}" class="ex-chip ${answered === s.key ? "is-selected" : ""}">${s.label}</button>`).join("")}
      </div>
      ${answered ? `<p class="text-xs mt-2.5 ${answered === targetKey ? "text-emerald-300" : "text-amber-300"}">${answered === targetKey ? "Correct!" : `Not quite — that was ${SWARAS.find((x) => x.key === targetKey).label}.`} This is a listening exercise, not a score on your singing.</p>` : ""}
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
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson names today's ascending and descending movement properly and explores it further.</p>
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
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section 1 — Meet the Sapta Swaras", `
          ${narrow(`
            ${p("Music is built from notes. Let's learn to recognise and sing those notes one by one.")}
            <table class="w-full text-sm text-ink-300 mb-4"><tbody>
              ${SWARAS.map((s) => `<tr class="border-b border-white/5"><td class="py-1.5 font-display text-ink-50">${s.label}</td><td class="py-1.5">${s.full}</td><td class="py-1.5 text-ink-500">say "${s.say}"</td></tr>`).join("")}
            </tbody></table>
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["These are the seven basic swara names used in Carnatic music.", "Sa and Pa are generally treated as fixed positions relative to your chosen Sa.", "Ri, Ga, Ma, Dha and Ni each have different varieties — learned gradually in later lessons, not here.", "Different combinations and positions of swaras matter for raga formation, a later topic.", "A simple ascending or descending sequence is not automatically a complete raga.", "These names are not the same as fixed Western notes like C, D, E, F, G, A and B."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          ${sequenceLadderHtml(AROHANA)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("arohana", 2, "Section 2 — Understand the ascending sequence", `
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Arohana: Sa Ri Ga Ma Pa Dha Ni Sa˙</p>
            ${p("The notes move upward from the lower Sa to the higher Sa.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("sw-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your Sa (a visual aid only — this is the reference pitch you chose in Class 3, never a fixed Western note): <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div data-arohana-ladder-host>${sequenceLadderHtml(AROHANA)}</div>
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-dir="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play arohana</button>
          </div>
          ${narrow(`
            <ol class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mt-3">
              ${["Listen to the complete sequence.", "Listen again while following each swara.", "Repeat the names slowly.", "Hum the sequence using your chosen Sa as the reference.", "Repeat comfortably."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${recCard("aroTake", "Singing arohana (ascending)", "Entirely optional.", 20)}
        `, { wide: true })}

        ${chapter("avarohana", 3, "Section 3 — Understand the descending sequence", `
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Avarohana: Sa˙ Ni Dha Pa Ma Ga Ri Sa</p>
            ${p("The notes move downward from the higher Sa to the lower Sa.")}
          `)}
          <div data-avarohana-ladder-host>${sequenceLadderHtml(AVAROHANA)}</div>
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-dir="down" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play avarohana</button>
          </div>
          ${narrow(p("Listen first, then try singing it slowly — there's no need to rush the descent."))}
          ${recCard("avaTake", "Singing avarohana (descending)", "Entirely optional.", 20)}
        `)}

        ${chapter("cards", 4, "Section 4 — Listen to individual swaras", `
          ${narrow(p("Select a card to hear that swara on its own, built from your own Sa."))}
          <div data-cards-host>${cardsHtml(rec)}</div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4" data-card-detail-host>${cardDetailHtml(rec)}</div>
          ${recCard("cardPractice", "Practice singing whichever swara you selected above", "Entirely optional — one shared recording slot for this section.", 15)}
        `)}

        ${chapter("practice", 5, "Section 5 — Guided singing practice", `
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise A — Sing ascending swaras</p>${p("Sa Ri Ga Ma Pa Dha Ni Sa˙ — start slowly, listen first, sing along, repeat comfortably.")}`)}
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2 mt-6">Exercise B — Sing descending swaras</p>${p("Sa˙ Ni Dha Pa Ma Ga Ri Sa — listen first, sing along, and focus on the downward movement.")}`)}
          ${narrow(p("Both exercises reuse the arohana/avarohana playback and recordings from Sections 2 and 3 above — no need to record them twice."))}
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2 mt-6">Exercise C — Listen and identify</p>${p("A single swara will play — choose which one you heard.")}`)}
          <div data-identify-host>${identifyHtml(rec)}</div>
        `)}

        ${chapter("quiz", 6, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 7, "Self-assessment and reflection", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-6">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="sw-reflection">Which swara was easiest for you to recognise? Which one needs more practice?</label><textarea id="sw-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-sw", { placeholder: "e.g. Which swaras felt easiest... Whether the upper Sa felt comfortable... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Vocal safety", `
          ${narrow(`
            ${p("Choose a comfortable pitch — don't force reaching a higher or lower Sa. Keep sessions short, and take breaks.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 10, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 11, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Exercise C: ensure a stable target exists before any interaction ---- */
    if (!A(rec0(), "identify").targetKey) set("identify", "targetKey", SWARAS[Math.floor(Math.random() * SWARAS.length)].key);

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

    /* ---- Section 2: piano (visual aid) + arohana/avarohana playback ---- */
    own(VirtualPiano.wire(container, "sw-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayDir(e) {
      const btn = e.target.closest("[data-play-dir]");
      if (!btn) return;
      const b = base();
      const dir = btn.dataset.playDir;
      const seq = dir === "up" ? AROHANA : AVAROHANA;
      const host = dir === "up" ? $("[data-arohana-ladder-host]") : $("[data-avarohana-ladder-host]");
      PianoSynth.playSequence(seq.map((s) => b + s.semitone), {
        duration: 0.6, gap: 0.12,
        onNote: (i) => { if (host) host.innerHTML = sequenceLadderHtml(seq, i); },
      });
    }
    container.addEventListener("click", onPlayDir);
    cleanups.push(() => container.removeEventListener("click", onPlayDir));

    /* ---- recordings: arohana / avarohana / card practice ---- */
    const NAMES = { aroTake: "Singing arohana", avaTake: "Singing avarohana", cardPractice: "Individual swara practice" };
    const MAX_SECONDS = { aroTake: 20, avaTake: 20, cardPractice: 15 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 4 — ${NAMES[k]}`, exercise: `introduction-to-sapta-swaras-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); },
      }));
    });

    /* ---- Section 4: swara cards ---- */
    function refreshCardsHost() {
      const host = $("[data-cards-host]");
      if (host) host.innerHTML = cardsHtml(rec0());
      const detail = $("[data-card-detail-host]");
      if (detail) detail.innerHTML = cardDetailHtml(rec0());
    }
    function onCardSelect(e) {
      const btn = e.target.closest("[data-swara-card]");
      if (!btn) return;
      set("cards", "selected", btn.dataset.swaraCard);
      refreshCardsHost();
    }
    function onCardPlay(e) {
      if (!e.target.closest("[data-card-listen]") && !e.target.closest("[data-card-repeat]")) return;
      const selected = A(rec0(), "cards").selected;
      const s = SWARAS.find((x) => x.key === selected);
      if (s) PianoSynth.play(base() + s.semitone, { duration: 1.1, velocity: 0.5 });
    }
    container.addEventListener("click", onCardSelect);
    container.addEventListener("click", onCardPlay);
    cleanups.push(() => container.removeEventListener("click", onCardSelect));
    cleanups.push(() => container.removeEventListener("click", onCardPlay));

    /* ---- Exercise C: listen and identify ---- */
    function refreshIdentifyHost() {
      const host = $("[data-identify-host]");
      if (host) host.innerHTML = identifyHtml(rec0());
    }
    function onIdentifyPlay(e) {
      if (!e.target.closest("[data-identify-play]")) return;
      const s = SWARAS.find((x) => x.key === A(rec0(), "identify").targetKey);
      if (s) PianoSynth.play(base() + s.semitone, { duration: 1.1, velocity: 0.5 });
    }
    function onIdentifyNew(e) {
      if (!e.target.closest("[data-identify-new]")) return;
      set("identify", "targetKey", SWARAS[Math.floor(Math.random() * SWARAS.length)].key);
      set("identify", "answered", null);
      refreshIdentifyHost();
    }
    function onIdentifyChoice(e) {
      const btn = e.target.closest("[data-identify-choice]");
      if (!btn) return;
      set("identify", "answered", btn.dataset.identifyChoice);
      refreshIdentifyHost();
    }
    container.addEventListener("click", onIdentifyPlay);
    container.addEventListener("click", onIdentifyNew);
    container.addEventListener("click", onIdentifyChoice);
    cleanups.push(() => container.removeEventListener("click", onIdentifyPlay));
    cleanups.push(() => container.removeEventListener("click", onIdentifyNew));
    cleanups.push(() => container.removeEventListener("click", onIdentifyChoice));

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
