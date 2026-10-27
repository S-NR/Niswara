/* ============================================================
   CLASS 22 — VOCAL AGILITY FOUNDATIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vocal-agility".

   Core idea: "Learn to move between notes lightly, clearly and
   accurately." The learner's FIRST introduction to vocal agility —
   NOT advanced riffs, runs, melisma, belting, extreme range or
   fast scales. "Agility does not mean singing fast." Today's goal
   is CONTROL. "Accuracy → Coordination → Speed" — never reversed.

   The optional Warm-up prompt needs no new code here either —
   every interactive lesson already renders it automatically via
   `LessonKit.header()` -> `WarmupPrompt.classCard(cls)`.

   Short, comfortable patterns (whole steps, the Class 9+
   convention; max a 4th from the reference note) carry the class:
   two- and three-note movements, repeated-note patterns, and a
   small repeatable "melodic cell" (degrees 0-1-2-1, i.e. 1-2-3-2,
   reused across the slow-practice ladder, the metronome exercise,
   and the class's main integration exercise — cell into a phrase).
   The syllable/vowel agility exercises reuse the Class 4
   `PitchMatchExercise` chain engine with multiple slots on one
   shared reference, the same shape Classes 19/21's vowel/syllable
   exercises already use.

   Per the spec's own 18-item Class Progress list, five exercises
   have no checkpoint of their own (Exercises 10, 11, 17, 18, 19 —
   light movement, agility-without-speed, tongue/jaw awareness,
   agility+dynamics, agility+breath): they're still built, lighter
   in scope, matching their own "awareness only" framing in the
   spec, following the same literal-list policy Classes 16/17/19/
   20/21 already established.

   Flow: understand -> connection to previous classes -> two-note
   movement -> three-note movement -> repeated-note patterns ->
   syllable agility -> vowel agility -> articulation + pitch ->
   tongue & jaw awareness -> slow agility (a 3-level ladder) ->
   metronome -> clean note changes -> light movement -> agility
   without speed (an honest tempo-only A/B) -> melodic cell -> cell
   + rhythm -> cell into a phrase (the main integration exercise) ->
   agility + dynamics -> agility + breath -> record and listen (3
   takes) -> identify the problem -> common problems ->
   self-evaluate -> practice -> assignment -> milestone.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard (Class 5), ObservationChecklist (Class 5), the
   full Metronome widget (Class 6), ControlCheck (Class 9+). No
   shared component needed changes — this class is built entirely
   from existing engines.
   ============================================================ */

const VocalAgilityLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "movement", label: "Movement" },
    { id: "syllable", label: "Syllable" },
    { id: "vowel", label: "Vowel" },
    { id: "articulation", label: "Articulation" },
    { id: "slow", label: "Slow" },
    { id: "metronome", label: "Metronome" },
    { id: "clean", label: "Clean" },
    { id: "cell", label: "Cell" },
    { id: "integrate", label: "Integrate" },
    { id: "connect", label: "Connect" },
    { id: "review", label: "Review" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const BPM = 72;
  const PRACTICE_TASK = "pitch";
  const PRACTICE_CATEGORY = "Vocal Agility";
  const MAX_DEGREE = 3;
  const TWO_UP = [0, 1], TWO_DOWN = [1, 0], TWO_SKIP_UP = [0, 2], TWO_SKIP_DOWN = [2, 0];
  const THREE_UP = [0, 1, 2], THREE_DOWN = [2, 1, 0], THREE_SKIP_A = [0, 2, 1], THREE_SKIP_B = [2, 0, 1];
  const REPEAT_A = [0, 1, 0, 1], REPEAT_B = [0, 1, 2, 1], REPEAT_C = [0, 1, 2, 1, 0];
  const CELL = [0, 1, 2, 1]; // 1 -> 2 -> 3 -> 2, the "melodic cell"
  const CELL2 = [1, 2, 3, 2]; // 2 -> 3 -> 4 -> 3, the shifted cell
  const CLEAN_A = [0, 1, 2], CLEAN_B = [0, 2, 1], CLEAN_C = [2, 0, 1];
  const SYLLABLE_PHRASE = ["I", "want", "to", "sing", "now"]; // one word per CELL-into-phrase note — reused from the established word-per-note shape

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmup", label: "Warm-up completed/skipped" },
    { key: "twoNoteMovement", label: "Two-note movement completed" },
    { key: "threeNoteMovement", label: "Three-note movement completed" },
    { key: "repeatedPattern", label: "Repeated-note pattern completed" },
    { key: "syllableAgility", label: "Syllable agility completed" },
    { key: "vowelAgility", label: "Vowel agility completed" },
    { key: "articulationEx", label: "Articulation exercise completed" },
    { key: "slowAgility", label: "Slow agility completed" },
    { key: "metronomeEx", label: "Metronome exercise completed" },
    { key: "cleanNoteChanges", label: "Clean note-change exercise completed" },
    { key: "melodicCell", label: "Melodic cell completed" },
    { key: "cellRhythm", label: "Cell + rhythm completed" },
    { key: "cellPhrase", label: "Cell + phrase completed" },
    { key: "recordingEx", label: "Recording completed" },
    { key: "problemIdentified", label: "Problem identified" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    betterPractice: { question: "Which one is better practice?", options: [opt("fast", "A — fast"), opt("slow", "B — slow", "good"), opt("unsure", "Not sure")] },
    cellPhraseFeel: { question: "Did this feel like agility inside real music, not a separate drill?", options: YMNU },
    needBreath: { question: "Did you actually need a new breath there?", options: [opt("yes", "Yes", "good"), opt("no", "No, I had enough", "good"), opt("unsure", "Not sure")] },
    problem: { question: "What would you most like to work on?", options: ["Pitch", "Rhythm", "Articulation", "Speed", "Breath", "Tension", "Memory", "Not sure"].map((o) => opt(o.toLowerCase(), o)) },
  };
  const AWARENESS_OPTIONS = ["One vowel felt easier", "One vowel caused tension", "One vowel changed the pitch", "No noticeable difference", "Not sure"];
  const TAKE_OPTIONS = [opt("1", "Take 1"), opt("2", "Take 2"), opt("3", "Take 3"), opt("unsure", "Not sure")];
  const TAKE_Q = {
    mostAccurate: { question: "Which was most accurate?", options: TAKE_OPTIONS },
    mostRelaxed: { question: "Which felt most relaxed?", options: TAKE_OPTIONS },
    clearestChanges: { question: "Which had the clearest note changes?", options: TAKE_OPTIONS },
    mostMusical: { question: "Which sounded most musical?", options: TAKE_OPTIONS },
  };

  const CHECK_ROWS = [
    { key: "accuracy", area: "Accuracy", question: "Can I sing the pattern accurately?", levels: YMN_LEVELS },
    { key: "coordination", area: "Coordination", question: "Can I change notes cleanly?", levels: YMN_LEVELS },
    { key: "articulation", area: "Articulation", question: "Can I pronounce the syllables clearly?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Can I stay with the beat?", levels: YMN_LEVELS },
    { key: "relaxation", area: "Relaxation", question: "Can I remain relaxed?", levels: YMN_LEVELS },
    { key: "speed", area: "Speed", question: "Can I increase speed without losing accuracy?", levels: YMN_LEVELS },
    { key: "musicality", area: "Musicality", question: "Can I make the pattern sound musical rather than mechanical?", levels: YMN_LEVELS },
  ];

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const SYLLABLE_EX = {
    eyebrow: "Exercise 4 · Syllable agility", title: "1 → 2 → 3 → 2 → 1, on four syllables",
    intro: "LA–LA–LA–LA–LA, then NA, then MA, then DA. Coordination between mouth, tongue, pitch and rhythm — don't over-pronounce.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "la", label: "LA" }, { key: "na", label: "NA" }, { key: "ma", label: "MA" }, { key: "da", label: "DA" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["la", "na", "ma", "da"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const VOWEL_EX = {
    eyebrow: "Exercise 5 · Vowel agility", title: "The same pattern, on three vowels",
    intro: "AH, then OO, then EE. Notice — don't judge — whether one feels easier, causes tension, or shifts the pitch.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "ah", label: "AH" }, { key: "oo", label: "OO" }, { key: "ee", label: "EE" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["ah", "oo", "ee"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const ARTICULATION_EX = {
    eyebrow: "Exercise 6 · Articulation + pitch", title: "1 → 2 → 3, one syllable per note",
    intro: "MA-MA-MA, then LA-LA-LA, then DA-DA-DA. One syllable = one note. Don't rush.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "ma", label: "MA-MA-MA" }, { key: "la", label: "LA-LA-LA" }, { key: "da", label: "DA-DA-DA" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["ma", "la", "da"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const CELL_PHRASE_EX = {
    eyebrow: "Exercise 14 · Cell into a phrase", title: "Melodic cell + lyric + breath + natural ending",
    intro: "This shows how agility exists inside real music, not as an isolated drill.",
    chain: true, refLabel: "Reference cell",
    slots: [{ key: "take", label: "Your phrase", hint: "The cell, with simple words, one comfortable breath" }],
    assessment: Q.cellPhraseFeel,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 21 -> 20 -> 19 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c21 = (ClassActivity.get("L1C21").answers.setup || {}).note;
    if (ok(c21)) return c21;
    const c20 = (ClassActivity.get("L1C20").answers.setup || {}).note;
    if (ok(c20)) return c20;
    const c19 = (ClassActivity.get("L1C19").answers.setup || {}).note;
    if (ok(c19)) return c19;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  const ASSIGN_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    out.warmup = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (take(rec, "twoNote")) out.twoNoteMovement = true;
    if (take(rec, "threeNote")) out.threeNoteMovement = true;
    if (take(rec, "repeatedPattern")) out.repeatedPattern = true;
    if (SYLLABLE_EX.isComplete(exState(rec, "syllable"))) out.syllableAgility = true;
    if (VOWEL_EX.isComplete(exState(rec, "vowel")) && (A(rec, "vowelAware").noticed || []).length) out.vowelAgility = true;
    if (ARTICULATION_EX.isComplete(exState(rec, "articulation"))) out.articulationEx = true;
    if (["verySlow", "comfortableSpeed", "moderateSpeed"].every((k) => take(rec, k))) out.slowAgility = true;
    if (take(rec, "oneNotePerBeat")) out.metronomeEx = true;
    if (take(rec, "cleanChanges")) out.cleanNoteChanges = true;
    if (take(rec, "cellRepeat")) out.melodicCell = true;
    if (take(rec, "cellRhythmTake")) out.cellRhythm = true;
    if (CELL_PHRASE_EX.isComplete(exState(rec, "cellPhrase"))) out.cellPhrase = true;
    if (["take1", "take2", "take3"].every((k) => take(rec, k))) out.recordingEx = true;
    if (q(rec, "problem")) out.problemIdentified = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function problems() {
    const items = [
      ["“I can't sing the notes quickly.”", "That's okay. Stay slow."],
      ["“The notes become blurry.”", "Slow down. Separate the notes."],
      ["“My pitch becomes inaccurate when I speed up.”", "Return to the previous speed."],
      ["“My jaw moves too much.”", "Reduce unnecessary movement."],
      ["“My throat becomes tense.”", "Stop. Relax. Return to gentle humming."],
      ["“I lose the rhythm.”", "Use the metronome."],
      ["“I can sing the pattern but can't add words.”", "Return to syllables first. Then words."],
      ["“I feel tired.”", "Stop the exercise. Agility training should not become endurance training."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["SLOW", "ACCURATE", "RELAXED", "COORDINATED", "FASTER"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 22 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">ACCURACY BEFORE SPEED</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm ${s === "FASTER" ? "!bg-gold-500/15 !text-gold-300" : ""}">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">Every advanced singer learns fast movement from slow, controlled practice.</p>
        <p class="text-sm text-ink-100">The goal today is not to impress. The goal is to build coordination.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["twoNoteMovement", "threeNoteMovement", "repeatedPattern", "syllableAgility", "vowelAgility", "articulationEx", "slowAgility", "metronomeEx", "cleanNoteChanges", "melodicCell", "cellRhythm", "cellPhrase", "recordingEx", "problemIdentified"].filter((k) => c[k]).length;
    return [
      [`Agility exercises (${ex}/14)`, ex === 14],
      ["Self-evaluation", !!c.selfEval],
      ["Completed the assignment", !!c.assignment],
    ];
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");
    const bridge = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-sm text-ink-300 leading-relaxed mb-2">Vocal agility is not the same as singing fast. Accuracy comes before speed — you can practise small melodic cells, separate pitch, rhythm and articulation problems, and increase speed only once your coordination stays accurate and comfortable.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll explore how different parts of the voice can feel and behave differently, before any more advanced melodic movement.` : "More is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Move lightly. Stay accurate. Don't rush.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            ${bridge}
            ${next ? `
            <div class="mt-6">
              <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
              <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
                <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
              </div>
            </div>` : `<p class="text-sm text-ink-500 mt-6">More of Level 1 is on its way.</p>`}
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
        ${bridge}
      </div>`;
  }

  function progressStats(cls) {
    return [
      { label: "Recordings", value: ClassActivity.count(cls.id, "recordings") },
      { label: `${PRACTICE_CATEGORY} logged here`, value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const a = A(rec, "assignment");
    const vowelAware = A(rec, "vowelAware").noticed || [];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Move lightly. Stay accurate. Don't rush.", `
          ${p("Vocal agility is the ability to move between notes with coordination and control. Before fast runs, we need clean note changes, accurate pitch, light articulation, relaxed movement and stable rhythm.")}
          ${p("Today's goal is <strong class=\"text-ink-100\">not</strong> speed. Today's goal is <strong class=\"text-ink-100\">control</strong>.")}
          ${flowStrip(["ACCURACY", "COORDINATION", "SPEED"])}
          ${p("Never reversed.")}
        `)}

        ${chapter("understand", 2, "What is agility?", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Agility does not mean singing fast.”</p>
            <p class="text-sm text-ink-200">It means moving accurately, moving efficiently, changing notes cleanly, keeping the voice relaxed, and keeping rhythm stable. Slow and accurate (1 → 2 → 3) is always better practice than the same notes sung quickly with poor pitch.</p>
          </div>
          ${narrow(p("This class combines skills from Classes 4, 6, 9, 12, 13, 19, 20 and 21 — now into smaller, more precise movements."))}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("movement", 3, "Exercise 1 — Two-note movement", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every pattern in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("va-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${narrow(p("Listen, then hum, then sing: 1 → 2, 2 → 1, then 1 → 3, 3 → 1. Keep the notes comfortable — focus on clean movement."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="two-up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2</button>
            <button type="button" data-play-move="two-down" class="vr-btn">${icon("play", "w-4 h-4")} 2 → 1</button>
            <button type="button" data-play-move="two-skip-up" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3</button>
            <button type="button" data-play-move="two-skip-down" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 1</button>
          </div>
          ${recCard("twoNote", "Hum, then sing", "Any of the four above.", 10)}
        `, { wide: true })}

        ${chapter("movement", 4, "Exercise 2 — Three-note movement", `
          ${narrow(p("Don't increase speed — you should clearly hear every note."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="three-up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2 → 3</button>
            <button type="button" data-play-move="three-down" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 2 → 1</button>
            <button type="button" data-play-move="three-skip-a" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3 → 2</button>
            <button type="button" data-play-move="three-skip-b" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 1 → 2</button>
          </div>
          ${recCard("threeNote", "Sing one of the patterns above", "", 10)}
        `)}

        ${chapter("movement", 5, "Exercise 3 — Repeated-note patterns", `
          ${narrow(p("Keep pitch, rhythm, volume and relaxation consistent."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="repeat-a" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2 → 1 → 2</button>
            <button type="button" data-play-move="repeat-b" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 2 → 3 → 2</button>
            <button type="button" data-play-move="repeat-c" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 2 → 3 → 2 → 1</button>
          </div>
          ${recCard("repeatedPattern", "Sing one of the patterns above", "", 10)}
        `)}

        ${chapter("syllable", 6, "Exercise 4 — Syllable agility", `
          ${PitchMatchExercise.render("va-syllable", SYLLABLE_EX)}
        `)}

        ${chapter("vowel", 7, "Exercise 5 — Vowel agility", `
          ${PitchMatchExercise.render("va-vowel", VOWEL_EX)}
          <div class="mt-4">${ObservationChecklist.render("va-vowel-aware", [{ key: "noticed", title: "What did you notice?", prompt: "Choose any that fit — there's no right answer.", options: AWARENESS_OPTIONS }], { noticed: vowelAware })}</div>
        `)}

        ${chapter("articulation", 8, "Exercise 6 — Articulation + pitch", `
          ${PitchMatchExercise.render("va-articulation", ARTICULATION_EX)}
        `)}

        ${chapter("articulation", 9, "Exercise 17 — Tongue & jaw awareness", `
          ${narrow(p("Before articulation exercises: relax the jaw, keep the tongue comfortable, and avoid excessive jaw movement. This is awareness only — nothing to force or manipulate."))}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-articulation="la" class="vr-btn">${icon("play", "w-4 h-4")} LA LA LA, slowly</button>
            <button type="button" data-play-articulation="da" class="vr-btn">${icon("play", "w-4 h-4")} DA DA DA</button>
            <button type="button" data-play-articulation="na" class="vr-btn">${icon("play", "w-4 h-4")} NA NA NA</button>
          </div>
        `)}

        ${chapter("slow", 10, "Exercise 7 — Slow agility", `
          ${flowStrip(["LEVEL 1 · VERY SLOW", "LEVEL 2 · COMFORTABLE", "LEVEL 3 · MODERATE"])}
          ${narrow(p("Only move to the next level if the previous one is accurate, comfortable and relaxed. If accuracy decreases, return to the slower level."))}
          <div class="grid sm:grid-cols-3 gap-3">
            ${recCard("verySlow", "Level 1 — Very slow", "1 → 2 → 3 → 2", 10)}
            ${recCard("comfortableSpeed", "Level 2 — Comfortable", "", 10)}
            ${recCard("moderateSpeed", "Level 3 — Moderate", "", 10)}
          </div>
        `)}

        ${chapter("metronome", 11, "Exercise 8 — Metronome", `
          ${narrow(p("The metronome is helping you coordinate movement, not win a speed competition. Start with one note per beat; try two notes per beat only if comfortable."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("va-metro", { bpm: BPM })}
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("oneNotePerBeat", "One note per beat", "", 10)}
            ${recCard("twoNotesPerBeat", "Two notes per beat (optional)", "Only if comfortable.", 10)}
          </div>
        `, { wide: true })}

        ${chapter("clean", 12, "Exercise 9 — Clean note changes", `
          ${narrow(p("Avoid sloppy note changes, random sliding, unnecessary volume changes, or throat pushing."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="clean-a" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2 → 3</button>
            <button type="button" data-play-move="clean-b" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3 → 2</button>
            <button type="button" data-play-move="clean-c" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 1 → 2</button>
          </div>
          ${recCard("cleanChanges", "Sing each note clearly", "", 10)}
        `)}

        ${chapter("clean", 13, "Exercise 10 — Light movement", `
          ${narrow(p("Imagine the notes are connected by a light thread. Avoid making each note heavy."))}
          <div class="grid sm:grid-cols-3 gap-3">
            ${recCard("lightHum", "Hum", "1 → 2 → 3 → 2 → 1", 10)}
            ${recCard("lightOo", "“oo”", "", 10)}
            ${recCard("lightAh", "“ah”", "", 10)}
          </div>
        `)}

        ${chapter("clean", 14, "Exercise 11 — Agility without speed", `
          ${p("A key teaching point. Two examples of the same pattern.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">A — fast</p><button type="button" data-play-ab="fast" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">B — slow</p><button type="button" data-play-ab="slow" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          ${SelfAssessment.render("betterPractice-q", { ...Q.betterPractice, selected: sel("betterPractice") })}
          <p class="text-sm text-ink-300 mt-3 min-h-[1.25rem]" data-betterpractice-msg>${sel("betterPractice") ? "Slow but accurate — we'll build speed only after your coordination becomes reliable." : ""}</p>
        `)}

        ${chapter("cell", 15, "Exercise 12 — Small melodic cell", `
          ${narrow(p("A melodic cell is a small group of notes we can repeat and develop. 1 → 2 → 3 → 2, repeated — then shifted up to 2 → 3 → 4 → 3, repeated — then back to the first cell. This prepares you for future riffs and runs, without teaching them yet."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="cell" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the cell (1→2→3→2)</button>
            <button type="button" data-play-move="cell2" class="vr-btn">${icon("play", "w-4 h-4")} Play the shifted cell (2→3→4→3)</button>
          </div>
          ${recCard("cellRepeat", "Sing the cell, repeated", "", 10)}
        `)}

        ${chapter("cell", 16, "Exercise 13 — Cell + rhythm", `
          ${narrow(p("The same melodic cell, now with the metronome. Maintain pitch, timing, articulation and relaxation together."))}
          ${recCard("cellRhythmTake", "Sing the cell with the metronome", "", 10)}
        `)}

        ${chapter("integrate", 17, "Exercise 14 — Cell into a phrase", `
          ${p("This demonstrates how agility exists inside real music.")}
          ${PitchMatchExercise.render("va-cellphrase", CELL_PHRASE_EX)}
        `)}

        ${chapter("connect", 18, "Exercise 18 — Agility + dynamics", `
          ${narrow(p("Connecting Class 14. Don't increase volume to create “energy” — maintain pitch and coordination at a comfortable volume."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("agilityQuiet", "Quietly", "", 10)}
            ${recCard("agilityNatural", "Naturally", "", 10)}
          </div>
        `)}

        ${chapter("connect", 19, "Exercise 19 — Agility + breath", `
          ${narrow(p("Connecting Class 11. Use natural phrase boundaries — don't hold breath unnecessarily, and don't take a huge breath before a tiny pattern."))}
          ${recCard("agilityBreath", "Sing a short cell", "", 10)}
          <div class="mt-4">${SelfAssessment.render("needBreath-q", { ...Q.needBreath, selected: sel("needBreath") })}</div>
        `)}

        ${chapter("review", 20, "Exercise 15 — Record and listen", `
          ${p("Record three attempts at different speeds, then compare them honestly. Don't automatically prefer the fastest take.")}
          <div class="grid sm:grid-cols-3 gap-3 mb-4">
            ${recCard("take1", "Take 1 — slow", "", 10)}
            ${recCard("take2", "Take 2 — comfortable speed", "", 10)}
            ${recCard("take3", "Take 3 — natural speed", "", 10)}
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${Object.entries(TAKE_Q).map(([k, cfg]) => `<div>${SelfAssessment.render(`${k}-q`, { ...cfg, selected: sel(k) })}</div>`).join("")}
          </div>
        `)}

        ${chapter("review", 21, "Exercise 16 — Identify the problem", `
          ${SelfAssessment.render("problem-q", { ...Q.problem, selected: sel("problem") })}
          <p class="text-sm text-ink-300 mt-3">Return to the slow version — you don't need to repeat the entire lesson.</p>
        `)}

        ${chapter("review", 22, "Common beginner problems", problems())}

        ${chapter("evaluate", 23, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("va-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 24, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused, accurate practice — not excessive repetition.")}
          ${Timer.render("va-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 25, `Class ${cls.number} Assignment — Your First Agility Pattern`, `
          ${p("Using a comfortable 1 → 2 → 3 → 2 → 1 pattern, complete seven takes. You don't need to do all seven in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Hum slowly", "", 10)}
            ${recCard("t2", "Take 2 — Sing on “LA”", "", 10)}
            ${recCard("t3", "Take 3 — Sing on “DA”", "", 10)}
            ${recCard("t4", "Take 4 — Sing on “AH”", "", 10)}
            ${recCard("t5", "Take 5 — Use a metronome", "", 10)}
            ${recCard("t6", "Take 6 — Slightly faster", "Only if accurate and comfortable.", 10)}
            ${recCard("t7", "Take 7 — Sing it naturally", "", 10)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="va-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="va-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 26, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-va", { placeholder: "e.g. My pitch becomes unstable when I increase speed. LA is easier than DA. I need to slow down." })}
        `)}

        ${chapter("complete", 27, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 28, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "selfEval") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- Exercises 1/2/3/9/12: pattern playback ---- */
    const MOVES = {
      "two-up": TWO_UP, "two-down": TWO_DOWN, "two-skip-up": TWO_SKIP_UP, "two-skip-down": TWO_SKIP_DOWN,
      "three-up": THREE_UP, "three-down": THREE_DOWN, "three-skip-a": THREE_SKIP_A, "three-skip-b": THREE_SKIP_B,
      "repeat-a": REPEAT_A, "repeat-b": REPEAT_B, "repeat-c": REPEAT_C,
      "clean-a": CLEAN_A, "clean-b": CLEAN_B, "clean-c": CLEAN_C,
      cell: CELL, cell2: CELL2,
    };
    function onPlayMove(e) {
      const btn = e.target.closest("[data-play-move]");
      if (!btn) return;
      PianoSynth.playSequence(degreesToNotes(base(), MOVES[btn.dataset.playMove]), { duration: 0.5, gap: 0.16 });
    }
    container.addEventListener("click", onPlayMove);
    cleanups.push(() => container.removeEventListener("click", onPlayMove));

    /* ---- Exercise 17: tongue & jaw awareness demo ---- */
    function onPlayArticulation(e) {
      if (!e.target.closest("[data-play-articulation]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), [0, 0, 0]), { duration: 0.5, gap: 0.3 });
    }
    container.addEventListener("click", onPlayArticulation);
    cleanups.push(() => container.removeEventListener("click", onPlayArticulation));

    /* ---- Exercise 11: agility without speed (honest tempo-only A/B) ---- */
    function onPlayAB(e) {
      const btn = e.target.closest("[data-play-ab]");
      if (!btn) return;
      const notes = degreesToNotes(base(), THREE_UP);
      if (btn.dataset.playAb === "fast") PianoSynth.playSequence(notes, { duration: 0.22, gap: 0.05 });
      else PianoSynth.playSequence(notes, { duration: 0.75, gap: 0.3 });
    }
    container.addEventListener("click", onPlayAB);
    cleanups.push(() => container.removeEventListener("click", onPlayAB));

    /* ---- reference piano ---- */
    own(VirtualPiano.wire(container, "va-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so every pattern stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exSyllable.refresh(); exVowel.refresh(); exArticulation.refresh(); exCellPhrase.refresh();
      },
    }));

    /* ---- Exercise 4: syllable agility ---- */
    const exSyllable = own(PitchMatchExercise.wire(container, "va-syllable", SYLLABLE_EX, {
      classId, exerciseId: "syllable", state: (rec0().answers.exercises || {}).syllable || {},
      getNotes: () => degreesToNotes(base(), REPEAT_C), isComplete: SYLLABLE_EX.isComplete,
      onState: (s) => { set("exercises", "syllable", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 5: vowel agility ---- */
    const exVowel = own(PitchMatchExercise.wire(container, "va-vowel", VOWEL_EX, {
      classId, exerciseId: "vowel", state: (rec0().answers.exercises || {}).vowel || {},
      getNotes: () => degreesToNotes(base(), REPEAT_C), isComplete: VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "vowel", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    cleanups.push(ObservationChecklist.wire(container, "va-vowel-aware", {
      selected: { noticed: A(rec0(), "vowelAware").noticed || [] },
      onChange: (_, values) => { set("vowelAware", "noticed", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 6: articulation + pitch ---- */
    const exArticulation = own(PitchMatchExercise.wire(container, "va-articulation", ARTICULATION_EX, {
      classId, exerciseId: "articulation", state: (rec0().answers.exercises || {}).articulation || {},
      getNotes: () => degreesToNotes(base(), THREE_UP), isComplete: ARTICULATION_EX.isComplete,
      onState: (s) => { set("exercises", "articulation", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 8: metronome ---- */
    own(Metronome.wire(container, "va-metro", { bpm: BPM }));

    /* ---- Exercise 14: cell into a phrase ---- */
    const exCellPhrase = own(PitchMatchExercise.wire(container, "va-cellphrase", CELL_PHRASE_EX, {
      classId, exerciseId: "cellPhrase", state: (rec0().answers.exercises || {}).cellPhrase || {},
      getNotes: () => degreesToNotes(base(), CELL), isComplete: CELL_PHRASE_EX.isComplete,
      onState: (s) => { set("exercises", "cellPhrase", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "betterPractice-q": "betterPractice", "needBreath-q": "needBreath", "problem-q": "problem",
      "mostAccurate-q": "mostAccurate", "mostRelaxed-q": "mostRelaxed", "clearestChanges-q": "clearestChanges", "mostMusical-q": "mostMusical",
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name] || group.closest("[data-pm]")) return; // PitchMatchExercise handles its own chips
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
      syncCheckpoints(); refreshLive();
      if (name === "betterPractice-q") { const m = $("[data-betterpractice-msg]"); if (m) m.textContent = "Slow but accurate — we'll build speed only after your coordination becomes reliable."; }
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- all recordings ---- */
    const NAMES = {
      twoNote: "Two-note movement", threeNote: "Three-note movement", repeatedPattern: "Repeated-note pattern",
      verySlow: "Slow agility — very slow", comfortableSpeed: "Slow agility — comfortable", moderateSpeed: "Slow agility — moderate",
      oneNotePerBeat: "Metronome — one note per beat", twoNotesPerBeat: "Metronome — two notes per beat",
      cleanChanges: "Clean note changes", lightHum: "Light movement — hum", lightOo: "Light movement — oo", lightAh: "Light movement — ah",
      cellRepeat: "Melodic cell", cellRhythmTake: "Cell + rhythm",
      agilityQuiet: "Agility + dynamics — quiet", agilityNatural: "Agility + dynamics — natural", agilityBreath: "Agility + breath",
      take1: "Record & listen — slow", take2: "Record & listen — comfortable", take3: "Record & listen — natural",
      t1: "Assignment — hum", t2: "Assignment — LA", t3: "Assignment — DA", t4: "Assignment — AH",
      t5: "Assignment — metronome", t6: "Assignment — faster", t7: "Assignment — natural",
    };
    const MAX_SECONDS = {
      twoNote: 10, threeNote: 10, repeatedPattern: 10, verySlow: 10, comfortableSpeed: 10, moderateSpeed: 10,
      oneNotePerBeat: 10, twoNotesPerBeat: 10, cleanChanges: 10, lightHum: 10, lightOo: 10, lightAh: 10,
      cellRepeat: 10, cellRhythmTake: 10, agilityQuiet: 10, agilityNatural: 10, agilityBreath: 10,
      take1: 10, take2: 10, take3: 10, t1: 10, t2: 10, t3: 10, t4: 10, t5: 10, t6: 10, t7: 10,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 10,
        meta: { name: `Class 22 — ${NAMES[k]}`, exercise: `agility-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "va-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}. Short and focused is perfect.`;
        refreshLive();
      },
    }));

    /* ---- assignment, self-evaluation, notes ---- */
    container.querySelectorAll("[data-assign-q]").forEach((ta) => {
      const i = ta.dataset.assignQ;
      const save = Utils.debounce((v) => { set("assignment", "answers", { ...(A(rec0(), "assignment").answers || {}), [i]: v }); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    cleanups.push(ControlCheck.wire(container, "va-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-va", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const ans = A(rec, "assignment").answers || {};
      const qs = cls.content.assignment.questions;
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: "Vocal agility is not the same as singing fast — accuracy comes before speed, and speed only grows from reliable coordination.",
        struggled: ans[8] || "",
        toPractice: ans[9] || "",
        thoughts: qs.map((qq, i) => (filled(ans[i]) ? `${qq} ${ans[i].trim()}` : "")).filter(Boolean).join(" "),
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
