/* ============================================================
   LEVEL 2, CLASS 6 — BASIC SWARA PATTERNS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "basic-swara-patterns".

   Curriculum identity: Level 2, Class 6 (`number: 6`, `levelId: 2`
   in data.js, explicit id `L2C29`). Rebuilt against this class's own
   later, more detailed "Claude Prompt" spec (14 named patterns across
   3 groups, a 3-level guided-practice section with a genuine listen-
   and-recognise quiz and a complete-the-pattern exercise, a steady-
   pulse rhythm section, a 6-question knowledge check, and a 6-item
   checklist) — supersedes the shorter 3-pattern version first written
   during the Level 2 Curriculum Upgrade. Last of four new "Musical
   Foundations" classes, closing that arc before Class 7 (Chest Voice
   Foundations) returns to vocal technique.

   Core idea: "Don't just sing Sa Ri Ga Ma in order. Learn to
   recognise and sing different combinations of notes." 14 beginner
   patterns across three groups (three-note, returning, longer),
   explicitly framed as introductory practice, not traditional named
   Carnatic exercises, and explicitly NOT an introduction to tala
   theory (left for Level 3) — Section 6's "steady pulse" reuses the
   existing `Metronome` component purely as a timing aid.

   Honesty boundaries this spec asks for explicitly: no automatic
   pitch evaluation of the learner's own singing; the listen-and-
   recognise and complete-the-pattern exercises only ever grade a
   sequence this app itself generated and played, never a claim about
   analysing the learner's voice. Highlighting during playback is
   genuinely synchronized via `PianoSynth.playSequence`'s own `onNote`
   callback — not faked.

   Reuses: LessonKit, VirtualPiano (visual aid only), PianoSynth
   .play/.playSequence, Metronome (Section 6's steady pulse — already
   built for Level 1's Rhythm & Timing class), RecordingCard,
   PersonalNotes, ClassProgress.
   ============================================================ */

const BasicSwaraPatternsLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "what", label: "What's a Pattern?" },
    { id: "learn", label: "Learn" },
    { id: "practice", label: "Practice" },
    { id: "rhythm", label: "Rhythm" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;
  const SEMITONE = { sa: 0, ri: 2, ga: 4, ma: 5, pa: 7, dha: 9, ni: 11 };
  const LABEL = { sa: "Sa", ri: "Ri", ga: "Ga", ma: "Ma", pa: "Pa", dha: "Dha", ni: "Ni" };
  const ALL_SWARAS = ["sa", "ri", "ga", "ma", "pa", "dha", "ni"];

  const PATTERNS = [
    { key: "a1", group: "A", swaras: ["sa", "ri", "ga"] },
    { key: "a2", group: "A", swaras: ["ri", "ga", "ma"] },
    { key: "a3", group: "A", swaras: ["ga", "ma", "pa"] },
    { key: "a4", group: "A", swaras: ["ma", "pa", "dha"] },
    { key: "a5", group: "A", swaras: ["pa", "dha", "ni"] },
    { key: "b1", group: "B", swaras: ["sa", "ri", "sa"] },
    { key: "b2", group: "B", swaras: ["sa", "ri", "ga", "ri", "sa"] },
    { key: "b3", group: "B", swaras: ["sa", "ga", "ri", "sa"] },
    { key: "b4", group: "B", swaras: ["sa", "ri", "ga", "ma", "ga", "ri", "sa"] },
    { key: "c1", group: "C", swaras: ["sa", "ri", "ga", "ma"] },
    { key: "c2", group: "C", swaras: ["ri", "ga", "ma", "pa"] },
    { key: "c3", group: "C", swaras: ["ga", "ma", "pa", "dha"] },
    { key: "c4", group: "C", swaras: ["sa", "ri", "ga", "ma", "pa"] },
    { key: "c5", group: "C", swaras: ["sa", "ri", "ga", "ma", "ga", "ri", "sa"] },
  ];
  const GROUP_TITLE = { A: "Group A — Three-note patterns", B: "Group B — Returning patterns", C: "Group C — Longer patterns" };
  const title = (pt) => pt.swaras.map((s) => LABEL[s]).join(" ");

  // Section 5, Level C — a fixed example, matching the spec exactly: Sa — Ri — ? — Ma (missing Ga)
  const COMPLETE_EXAMPLE = { shown: ["sa", "ri", null, "ma"], answer: "ga" };

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIs",
      question: "What is a swara pattern?",
      options: [
        { value: "volume", label: "A rule about how loudly to sing", correct: false },
        { value: "combo", label: "A combination of notes arranged in a particular sequence", correct: true },
        { value: "rhythm", label: "A rhythm cycle (tala)", correct: false },
      ],
      explain: { volume: "Not quite — a pattern isn't about loudness.", combo: "Exactly right.", rhythm: "Not quite — tala is a separate idea, not covered here." },
    },
    {
      key: "afterRi",
      question: "Which swara comes after Ri?",
      options: [
        { value: "sa", label: "Sa", correct: false },
        { value: "ga", label: "Ga", correct: true },
        { value: "ma", label: "Ma", correct: false },
      ],
      explain: { sa: "Not quite — Sa comes before Ri.", ga: "Right — Sa, Ri, Ga, Ma, Pa, Dha, Ni.", ma: "Not quite — Ga comes between Ri and Ma." },
    },
    {
      key: "missing",
      question: "What is the missing swara in Sa Ri ? Ma?",
      options: [
        { value: "pa", label: "Pa", correct: false },
        { value: "ga", label: "Ga", correct: true },
        { value: "ni", label: "Ni", correct: false },
      ],
      explain: { pa: "Not quite — Pa comes after Ma, not between Ri and Ma.", ga: "Exactly right.", ni: "Not quite — Ni is much later in the sequence." },
    },
    {
      key: "whyPractise",
      question: "Why do we practise different swara combinations?",
      options: [
        { value: "awareness", label: "To develop pitch awareness, note coordination and familiarity with musical movement", correct: true },
        { value: "louder", label: "To learn to sing louder", correct: false },
        { value: "western", label: "To memorise Western note names", correct: false },
      ],
      explain: { awareness: "Right — that's exactly what patterns build.", louder: "Not quite — volume isn't the goal.", western: "Not quite — swara names aren't the same as Western note names." },
    },
    {
      key: "whyListenFirst",
      question: "Why should we listen before attempting a new pattern?",
      options: [
        { value: "familiar", label: "To become familiar with the pattern before singing it", correct: true },
        { value: "detect", label: "So the app can analyse your pitch", correct: false },
        { value: "unnecessary", label: "It isn't necessary", correct: false },
      ],
      explain: { familiar: "Right — listening first makes singing it back much easier.", detect: "Not quite — this app doesn't analyse your sung pitch.", unnecessary: "Not quite — listening first genuinely helps." },
    },
    {
      key: "steadySa",
      question: "Why is maintaining a steady Sa important?",
      options: [
        { value: "positioned", label: "Because it keeps every pattern's notes correctly positioned relative to your reference pitch", correct: true },
        { value: "louder", label: "It makes you sing louder", correct: false },
        { value: "unimportant", label: "It isn't important", correct: false },
      ],
      explain: { positioned: "Exactly right.", louder: "Not quite — Sa has nothing to do with volume.", unimportant: "Not quite — every swara you sing is described relative to Sa." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "rememberSwaras", label: "I can remember the seven basic swaras." },
    { key: "recogniseThreeNote", label: "I can recognise simple three-note patterns." },
    { key: "singReturning", label: "I can sing a returning pattern." },
    { key: "followLonger", label: "I can follow a longer swara sequence." },
    { key: "maintainSteady", label: "I can maintain a steady reference pitch." },
    { key: "practiceSlowly", label: "I can practise patterns slowly without rushing." },
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
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  function randomDistractors(correctKey, count) {
    const others = PATTERNS.filter((pt) => pt.key !== correctKey);
    const picked = [];
    while (picked.length < count && others.length) {
      const i = Math.floor(Math.random() * others.length);
      picked.push(others.splice(i, 1)[0]);
    }
    return picked;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function ladderHtml(swaras, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-4">
      ${swaras.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-base ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${s === null ? "?" : LABEL[s]}</span>
        </div>`).join("")}
    </div>`;
  }

  function patternCardHtml(pt, rec) {
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4" data-pattern-card="${pt.key}">
      <p class="font-display text-lg text-ink-50 mb-2">${title(pt)}</p>
      <div data-pattern-ladder="${pt.key}">${ladderHtml(pt.swaras)}</div>
      <div class="flex flex-wrap gap-3">
        <button type="button" data-play-pattern="${pt.key}" class="vr-btn vr-btn-gold">${icon("play", "w-3.5 h-3.5")} Listen</button>
      </div>
    </div>`;
  }

  function recogniseHtml(rec) {
    const r = A(rec, "recognise");
    const targetKey = r.targetKey;
    const choiceKeys = r.choiceKeys || [];
    const answered = r.answered || null;
    const target = PATTERNS.find((pt) => pt.key === targetKey);
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5" data-recognise>
      <p class="text-sm text-ink-300 mb-3">Press play, then choose which pattern you heard.</p>
      <div class="flex flex-wrap gap-3 mb-4">
        <button type="button" data-recognise-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play a pattern</button>
        <button type="button" data-recognise-new class="vr-btn">New pattern</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${choiceKeys.map((k) => {
          const pt = PATTERNS.find((x) => x.key === k);
          return `<button type="button" data-recognise-choice="${k}" class="ex-chip ${answered === k ? "is-selected" : ""}">${title(pt)}</button>`;
        }).join("")}
      </div>
      ${answered ? `<p class="text-xs mt-2.5 ${answered === targetKey ? "text-emerald-300" : "text-amber-300"}">${answered === targetKey ? "Correct!" : `Not quite — that was ${target ? title(target) : ""}.`} This is a listening exercise, not a score on your singing.</p>` : ""}
    </div>`;
  }

  function completeHtml(rec) {
    const answered = A(rec, "complete").answered || null;
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5" data-complete-pattern>
      ${ladderHtml(COMPLETE_EXAMPLE.shown)}
      <p class="text-sm text-ink-300 mb-3 text-center">Which swara completes the pattern?</p>
      <div class="flex flex-wrap justify-center gap-2">
        ${ALL_SWARAS.map((s) => `<button type="button" data-complete-choice="${s}" class="ex-chip ${answered === s ? "is-selected" : ""}">${LABEL[s]}</button>`).join("")}
      </div>
      ${answered ? `<p class="text-xs mt-2.5 text-center ${answered === COMPLETE_EXAMPLE.answer ? "text-emerald-300" : "text-amber-300"}">${answered === COMPLETE_EXAMPLE.answer ? "Correct — Ga." : `Not quite — the missing swara was Ga.`}</p>` : ""}
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 6 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Musical Foundations complete.</p>
        <p class="text-sm text-ink-300">Shruti, Sa, the seven swaras, arohana, avarohana, and 14 short patterns — all built from your own voice.</p>
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
            <h3 class="font-display text-2xl text-ink-50 mb-5">Swara patterns build pitch awareness and note coordination — one comfortable combination at a time.</h3>
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
    const selectedForRepeat = A(rec, "repeat").selectedKey || PATTERNS[0].key;

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("recap", 1, "Section 1 — Recap", `
          ${narrow(p("A quick revision before learning something new: the seven sapta swaras (Class 4), arohana and avarohana (Class 5), and your own selected Sa (Class 3)."))}
          ${ladderHtml(["sa", "ri", "ga", "ma", "pa", "dha", "ni"])}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-recap class="vr-btn">${icon("play", "w-4 h-4")} Quick listen</button>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("what", 2, "Section 2 — What is a swara pattern?", `
          ${narrow(`
            ${p("A swara pattern is a combination of notes arranged in a particular sequence — not necessarily in simple ascending or descending order. For example: Sa Ri Ga · Sa Ga Ri · Sa Ri Ga Ri Sa · Sa Ri Ga Ma Ga Ri Sa.")}
            ${p("Patterns help singers develop pitch awareness, note coordination, and familiarity with musical movement.")}
          `)}
        `)}

        ${chapter("learn", 3, "Section 3 — Learn beginner swara patterns", `
          ${narrow(p("Your Sa carries over from the earlier classes. For each pattern: listen, follow the names visually, listen again, hum gently, sing at a comfortable pace, and repeat until it feels familiar."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("bp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${["A", "B", "C"].map((g) => `
            <p class="font-display text-lg text-ink-50 mb-3 mt-4">${GROUP_TITLE[g]}</p>
            <div data-patterns-host="${g}">${PATTERNS.filter((pt) => pt.group === g).map((pt) => patternCardHtml(pt, rec)).join("")}</div>
          `).join("")}
        `, { wide: true })}

        ${chapter("practice", 4, "Section 5 — Guided practice", `
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Level A — Listen and recognise</p>${p("A pattern will play — choose which one you heard from the options below.")}`)}
          <div data-recognise-host>${recogniseHtml(rec)}</div>

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2 mt-8">Level B — Repeat the pattern</p>${p("Pick any pattern above, listen to it, then sing it back.")}`)}
          <div class="flex flex-wrap gap-3 mb-2">
            <select data-repeat-select class="field max-w-xs">
              ${PATTERNS.map((pt) => `<option value="${pt.key}" ${selectedForRepeat === pt.key ? "selected" : ""}>${GROUP_TITLE[pt.group].split(" — ")[0]}: ${title(pt)}</option>`).join("")}
            </select>
            <button type="button" data-repeat-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
          </div>
          ${recCard("repeatTake", "Singing the selected pattern back", "Entirely optional.", 20)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2 mt-8">Level C — Complete the pattern</p>`)}
          <div data-complete-host>${completeHtml(rec)}</div>
        `)}

        ${chapter("rhythm", 5, "Section 6 — Rhythm and swara coordination", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Keep a comfortable, steady rhythm.", "Sing one swara at a time.", "Avoid rushing through the sequence.", "Maintain clarity when moving between notes."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-xs text-ink-500 mb-4">This is a simple steady pulse to practise against — not tala theory, which is a Level 3 topic.</p>
          `)}
          ${Metronome.render("bp-metro", { bpm: 70 })}
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
            <div><label class="block text-sm text-ink-200 mb-1.5" for="bp-reflection">Which swara pattern was easiest for you? Which pattern was difficult to remember or sing?</label><textarea id="bp-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-bp", { placeholder: "e.g. Which pattern felt easiest... Whether I'd like to try a longer pattern next time..." })}
        `)}

        ${chapter("complete", 9, "Vocal safety", `
          ${narrow(`
            ${p("Use the comfortable Sa selected in Class 3. Don't force high or low notes — practise in short sessions, with breaks between repetitions.")}
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

    /* ---- Section 5, Level A: ensure a stable target + choice set exist before any interaction.
       render() already ran once (producing the initial DOM) before mount() gets a chance to seed
       this, so an empty `recognise` answer means the choice buttons rendered empty — refresh the
       host once seeded, or "New pattern"/clicking a never-rendered button silently does nothing. ---- */
    if (!A(rec0(), "recognise").targetKey) {
      const target = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      const choices = [target, ...randomDistractors(target.key, 2)].sort(() => Math.random() - 0.5);
      set("recognise", "targetKey", target.key);
      set("recognise", "choiceKeys", choices.map((pt) => pt.key));
      refreshRecogniseHost();
    }

    /* ---- Section 1: recap playback ---- */
    function onPlayRecap(e) {
      if (!e.target.closest("[data-play-recap]")) return;
      PianoSynth.playSequence(["sa", "ri", "ga", "ma", "pa", "dha", "ni"].map((s) => base() + SEMITONE[s]), { duration: 0.5, gap: 0.1 });
    }
    container.addEventListener("click", onPlayRecap);
    cleanups.push(() => container.removeEventListener("click", onPlayRecap));

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

    /* ---- Section 3: piano (visual aid) + pattern playback ---- */
    own(VirtualPiano.wire(container, "bp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function playPattern(key, onNote) {
      const pt = PATTERNS.find((x) => x.key === key);
      if (!pt) return;
      return PianoSynth.playSequence(pt.swaras.map((s) => base() + SEMITONE[s]), { duration: 0.5, gap: 0.12, onNote });
    }
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const key = btn.dataset.playPattern;
      const ladderHost = $(`[data-pattern-ladder="${key}"]`);
      const pt = PATTERNS.find((x) => x.key === key);
      playPattern(key, (i) => { if (ladderHost) ladderHost.innerHTML = ladderHtml(pt.swaras, i); });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- Section 5, Level A: listen and recognise ---- */
    function refreshRecogniseHost() {
      const host = $("[data-recognise-host]");
      if (host) host.innerHTML = recogniseHtml(rec0());
    }
    function onRecognisePlay(e) {
      if (!e.target.closest("[data-recognise-play]")) return;
      playPattern(A(rec0(), "recognise").targetKey);
    }
    function onRecogniseNew(e) {
      if (!e.target.closest("[data-recognise-new]")) return;
      const target = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      const choices = [target, ...randomDistractors(target.key, 2)].sort(() => Math.random() - 0.5);
      set("recognise", "targetKey", target.key);
      set("recognise", "choiceKeys", choices.map((pt) => pt.key));
      set("recognise", "answered", null);
      refreshRecogniseHost();
    }
    function onRecogniseChoice(e) {
      const btn = e.target.closest("[data-recognise-choice]");
      if (!btn) return;
      set("recognise", "answered", btn.dataset.recogniseChoice);
      refreshRecogniseHost();
    }
    container.addEventListener("click", onRecognisePlay);
    container.addEventListener("click", onRecogniseNew);
    container.addEventListener("click", onRecogniseChoice);
    cleanups.push(() => container.removeEventListener("click", onRecognisePlay));
    cleanups.push(() => container.removeEventListener("click", onRecogniseNew));
    cleanups.push(() => container.removeEventListener("click", onRecogniseChoice));

    /* ---- Section 5, Level B: repeat the pattern ---- */
    const repeatSelect = $("[data-repeat-select]");
    if (repeatSelect) repeatSelect.addEventListener("change", () => set("repeat", "selectedKey", repeatSelect.value));
    function onRepeatPlay(e) {
      if (!e.target.closest("[data-repeat-play]")) return;
      playPattern(repeatSelect ? repeatSelect.value : PATTERNS[0].key);
    }
    container.addEventListener("click", onRepeatPlay);
    cleanups.push(() => container.removeEventListener("click", onRepeatPlay));
    own(RecordingCard.wire(container, "rc-repeatTake", {
      classId, take: take(rec0(), "repeatTake"), maxSeconds: 20,
      meta: { name: "Level 2, Class 6 — Repeat the pattern", exercise: "basic-swara-patterns-repeatTake" },
      onSaved: (t) => { set("recs", "repeatTake", t); ClassActivity.bump(classId, "recordings"); },
    }));

    /* ---- Section 5, Level C: complete the pattern ---- */
    function refreshCompleteHost() {
      const host = $("[data-complete-host]");
      if (host) host.innerHTML = completeHtml(rec0());
    }
    function onCompleteChoice(e) {
      const btn = e.target.closest("[data-complete-choice]");
      if (!btn) return;
      set("complete", "answered", btn.dataset.completeChoice);
      refreshCompleteHost();
    }
    container.addEventListener("click", onCompleteChoice);
    cleanups.push(() => container.removeEventListener("click", onCompleteChoice));

    /* ---- Section 6: metronome (steady pulse) ---- */
    own(Metronome.wire(container, "bp-metro", { bpm: 70 }));

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
        learned: "A swara pattern is a combination of notes arranged in a particular sequence — practising a few different combinations builds pitch awareness and note coordination.",
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
