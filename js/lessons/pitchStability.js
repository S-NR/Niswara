/* ============================================================
   CLASS 12 — PITCH STABILITY (interactive lesson)

   Rendered by ClassDetailPage for interactive: "pitch-stability".

   Core idea: "Hitting the right note is only the beginning. Learn
   to stay with it." Pitch MATCHING (Class 4) vs pitch STABILITY.
   "Stable does not mean perfectly flat": no freezing, squeezing,
   extra volume, vibrato, long holds or breath holding.

   Ear first, every time: an estimated pitch trace (StabilityPanel)
   only opens after the learner has listened and answered by ear,
   and it hides itself when the estimate isn't trustworthy.

   Flow: listen → match & stop → match & hold → listen without
   looking → listen & correct (+ before/after) → vowels → breath →
   three-note stability → 1-2-3-2-1 → self-evaluation → practice →
   assignment → reflection → milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment + PitchGuide (Class 4), the Class 7 breathing
   circle, ControlCheck (Class 9, per-row answer sets), the new
   PitchStability / StabilityPanel (js/components/pitchStability.js),
   Timer, PersonalNotes, ClassProgress, ClassActivity (per-user,
   synced to Supabase).
   ============================================================ */

const PitchStabilityLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "match", label: "Match" },
    { id: "hold", label: "Hold" },
    { id: "ear", label: "Ear first" },
    { id: "correct", label: "Correct" },
    { id: "vowels", label: "Vowels" },
    { id: "breath", label: "Breath" },
    { id: "move", label: "Move" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2; // whole steps: 1-2-3 = C-D-E from C (the Class 9/10 pattern)
  const PRACTICE_TASK = "pitch";
  const PRACTICE_CATEGORY = "Pitch Stability";
  const REF_SECONDS = 3;

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "refListen", label: "Reference listening completed" },
    { key: "matchStop", label: "Match-and-stop completed" },
    { key: "stableNote", label: "Stable-note exercise completed" },
    { key: "vizViewed", label: "Pitch visualization viewed" },
    { key: "listenFirst", label: "Listen-before-graph exercise completed" },
    { key: "correction", label: "Correction exercise completed" },
    { key: "vowels", label: "Vowel stability completed" },
    { key: "breathPitch", label: "Breath + pitch completed" },
    { key: "threeNote", label: "Three-note stability completed" },
    { key: "melodic", label: "Melodic pattern completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);
  const CHECK_ROWS = [
    { key: "reference", area: "Reference", question: "Could I hear the target note?", levels: YMN },
    { key: "matching", area: "Matching", question: "Could I reach the note?", levels: YMN },
    { key: "stability", area: "Stability", question: "Could I stay reasonably close to it?", levels: YMN },
    { key: "listening", area: "Listening", question: "Could I hear when I moved away?", levels: lv(["yes", "✓", "Yes"], ["sometimes", "△", "Sometimes"], ["notyet", "○", "Not yet"]) },
    { key: "comfort", area: "Comfort", question: "Did I stay relaxed?", levels: lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["no", "○", "No"]) },
  ];

  const REFLECTION = [
    "In my own words: how is matching a note different from staying on it?",
    "What helped my note feel steadier — without forcing?",
    "What did my ears notice today that I might have missed before?",
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    ex1: { question: "Does the note sound completely steady?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("unsure", "Not sure")] },
    ex6: { question: "Did changing the vowel change how steady the note felt?", options: [opt("same", "No real difference", "good"), opt("little", "A little", "maybe"), opt("yes", "Yes, noticeably", "maybe"), opt("unsure", "Not sure")] },
    ex6v: { question: "Which vowel felt most comfortable today? (There's no right answer.)", options: [opt("ah", "AH"), opt("ee", "EE"), opt("oo", "OO"), opt("similar", "All similar"), opt("unsure", "Not sure")] },
    diff: { question: "Did I hear a difference?", options: [opt("yes", "Yes", "good"), opt("small", "Small difference", "good"), opt("none", "No difference", "maybe"), opt("unsure", "Not sure")] },
  };

  /* ---- Exercise configurations (PitchMatchExercise, Class 4 engine) ---- */
  const takeDone = (s, k = "take") => !!(s.takes[k] && s.takes[k].mediaId);
  const assessed = (s, k = "take") => !!(s.takes[k] && s.takes[k].assessment);
  const EX = {
    ex2: { // match then stop
      eyebrow: "Exercise 2 · Match", title: "Match then stop",
      intro: "Play the reference, pause, then sing the note <strong class=\"text-ink-200\">briefly</strong> — about a second — and stop. No need to hold it.",
      flow: ["🎹 Hear", "🎤 Match", "✋ Stop", "🎧 Replay"],
      slots: [{ key: "take", label: "A short matched note", hint: "About one comfortable second" }],
      assessment: { question: "Could you reach the note and stop cleanly?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")],
        feedback: { yes: "Lovely — hear, match, stop.", mostly: "Good. Replay it next to the reference and listen to the very start.", notyet: "That's normal. Play the reference again and hum it quietly first.", unsure: "Play the reference, then your take, one after the other." } },
      noEstimate: true,
      isComplete: (s) => assessed(s),
    },
    ex3: { // SustainedNoteExercise
      eyebrow: "Exercise 3 · Hold", title: "Match then hold comfortably",
      intro: "Start the note, keep it comfortably for <strong class=\"text-ink-200\">about 3–4 seconds</strong> (less is fine), then stop naturally. The length is not a score — this is about noticing how the pitch moves.",
      flow: ["🎹 Hear", "🎤 Start", "〰️ Stay", "✋ Stop naturally"],
      slots: [{ key: "take", label: "A comfortable held note", hint: "About 3–4 seconds, or less if comfortable" }],
      assessment: { question: "Did your note stay with the reference?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("moved", "It moved", "maybe"), opt("unsure", "Not sure")],
        feedback: { yes: "Lovely. Notice how easy it felt.", mostly: "Good — small movement is natural.", moved: "Useful to notice! Try a shorter note at a comfortable volume.", unsure: "That's okay — the estimate below can help you compare what you heard." } },
      noEstimate: true,
      isComplete: (s) => assessed(s),
    },
    ex4: { // listen without looking
      eyebrow: "Exercise 4 · Ear first", title: "Listen without looking",
      intro: "Record a comfortable sustained note. Then <strong class=\"text-ink-200\">play it back and decide with your ears</strong> before you look at anything.",
      slots: [{ key: "take", label: "Your sustained note", hint: "A few comfortable seconds" }],
      assessment: { question: "How stable did the note feel to YOU?", options: [opt("very", "Very stable", "good"), opt("mostly", "Mostly stable", "good"), opt("some", "Some movement", "maybe"), opt("unstable", "Very unstable", "maybe"), opt("unsure", "Not sure")] },
      noEstimate: true,
      isComplete: (s) => assessed(s),
    },
    ex5: { // listen and correct
      eyebrow: "Exercise 5 · Correct", title: "Listen and correct",
      intro: "Record <strong class=\"text-ink-200\">Attempt 1</strong> and listen. If you heard it move, play the reference again and record <strong class=\"text-ink-200\">Attempt 2</strong>. Listen → notice → try again.",
      flow: ["🎧 Listen", "👂 Notice", "🔁 Try again"],
      slots: [
        { key: "a1", label: "Attempt 1", hint: "Sing comfortably, then play it back" },
        { key: "a2", label: "Attempt 2", hint: "Play the reference again first — stay relaxed" },
      ],
      assessment: { question: "Did you hear yourself move away from the note?", options: [opt("yes", "Yes", "maybe"), opt("no", "No", "good"), opt("unsure", "Not sure")],
        feedback: { yes: "Great listening — hearing it is the first step. Play the reference again before the next attempt.", no: "Lovely. Listen once more to be sure, then try the second attempt anyway.", unsure: "That's okay — listening develops with practice. Compare both attempts below." } },
      noEstimate: true,
      isComplete: (s) => assessed(s, "a1") && assessed(s, "a2"),
    },
    ex6: { // VowelPitchExercise
      eyebrow: "Exercise 6 · Vowels", title: "Pitch stability with vowels",
      intro: "One comfortable note, three short takes: <strong class=\"text-ink-200\">AH</strong>, then <strong class=\"text-ink-200\">EE</strong>, then <strong class=\"text-ink-200\">OO</strong>. Hold each comfortably for a short time. Notice whether the vowel changes how steady it feels — different voices feel different things.",
      slots: [
        { key: "ah", label: "AH", hint: "As in “father”" },
        { key: "ee", label: "EE", hint: "As in “see”" },
        { key: "oo", label: "OO", hint: "As in “moon”" },
      ],
      assessment: null, noEstimate: true,
      isComplete: (s) => ["ah", "ee", "oo"].every((k) => takeDone(s, k)),
    },
    ex7: { // BreathPitchExercise
      eyebrow: "Exercise 7 · Breath", title: "Pitch + breath",
      intro: "Take a <strong class=\"text-ink-200\">comfortable, natural breath</strong> (not a big one), then sing the note. If it feels long, make it shorter.",
      slots: [{ key: "take", label: "Breath, then your note", hint: "Breathe naturally, then sing comfortably" }],
      assessment: { question: "Did the pitch stay reasonably steady to the end?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("fell", "It dropped near the end", "maybe"), opt("short", "I ran short of comfortable breath", "maybe"), opt("unsure", "Not sure")],
        feedback: { yes: "Lovely — a natural breath was enough.", mostly: "Good. Small changes at the end are common.", fell: "Useful to notice. Next time make the note shorter — there's no need for a bigger breath.", short: "Then the note was a little long for today. Shorten it; never push through.", unsure: "Listen to the last second of your take — does it stay, or sink?" } },
      noEstimate: true,
      isComplete: (s) => assessed(s),
    },
    ex8: { // PitchTransitionExercise (held)
      eyebrow: "Exercise 8 · Move", title: "Three-note stability",
      intro: "Three nearby notes, there and back: <strong class=\"text-ink-200\">1 → 2 → 3 → 2 → 1</strong>. On each one: match, settle briefly, then move. No big leaps.",
      flow: ["Match", "Stabilize", "Move", "Stabilize", "Return"],
      chain: true, refLabel: "Reference notes", noteDuration: 1.5,
      slots: [{ key: "take", label: "Your five notes", hint: "Settle on each for a moment before moving" }],
      assessment: { question: "Could you settle on each note before moving on?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")],
        feedback: { yes: "Lovely — match, settle, move.", mostly: "Good. Which note took longest to settle?", notyet: "That's normal. Try it slower, with shorter notes.", unsure: "Play the reference and your take one after the other." } },
      noEstimate: true,
      isComplete: (s) => assessed(s),
    },
    ex9: { // short melodic pattern
      eyebrow: "Exercise 9 · Melody", title: "Short melodic pattern",
      intro: "The Class 9 pattern, sung like a little tune: <strong class=\"text-ink-200\">1 – 2 – 3 – 2 – 1</strong>. Listen, record, listen back.",
      chain: true, refLabel: "Reference pattern", noteDuration: 0.7,
      slots: [{ key: "take", label: "Your pattern", hint: "On “ma”, “mee” or “noo”" }],
      assessment: null, noEstimate: true,
      isComplete: (s) => takeDone(s),
    },
    assign: {
      eyebrow: "Assignment · One note", title: "Attempt 1 and Attempt 2",
      intro: "The same comfortable note, twice. Play the reference before each attempt.",
      slots: [
        { key: "a1", label: "Attempt 1", hint: "Sing comfortably, record, then listen back (play it to the end)" },
        { key: "a2", label: "Attempt 2", hint: "Play the reference again — stay relaxed and stable" },
      ],
      assessment: null, noEstimate: true,
      isComplete: (s) => takeDone(s, "a1") && takeDone(s, "a2"),
    },
    assignPattern: {
      eyebrow: "Assignment · Pattern", title: "Three-note pattern",
      intro: "1 → 2 → 3 → 2 → 1 from your comfortable starting pitch.",
      chain: true, refLabel: "Reference pattern", noteDuration: 1,
      slots: [{ key: "take", label: "Your pattern", hint: "Comfortable and relaxed" }],
      assessment: null, noEstimate: true,
      isComplete: (s) => takeDone(s),
    },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state ---------- */
  function range() {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  /** Own choice, else the note chosen in Classes 10 / 4; patterns need two steps of headroom. */
  function baseNote(rec) {
    const r = range();
    const n = A(rec, "setup").note ?? (ClassActivity.get("L1C10").answers.setup || {}).note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }
  const pattern = (b) => [0, 1, 2, 1, 0].map((i) => b + i * STEP);
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key) => EX[key].isComplete(exState(rec, key));
  const revealed = (rec, panelId) => !!A(rec, "viz")[panelId];

  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return exDone(rec, "assign") && exDone(rec, "assignPattern") && !!a.listened
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    const e1 = A(rec, "ex1");
    if (e1.played && e1.answer) out.refListen = true;
    if (exDone(rec, "ex2")) out.matchStop = true;
    if (exDone(rec, "ex3")) out.stableNote = true;
    if (Object.keys(A(rec, "viz")).length) out.vizViewed = true;
    if (exDone(rec, "ex4") && revealed(rec, "sp-ex4")) out.listenFirst = true;
    if (exDone(rec, "ex5") && A(rec, "compare").diff) out.correction = true;
    if (exDone(rec, "ex6") && A(rec, "ex6q").change) out.vowels = true;
    if (exDone(rec, "ex7")) out.breathPitch = true;
    if (exDone(rec, "ex8")) out.threeNote = true;
    if (exDone(rec, "ex9") && A(rec, "ex9q").least) out.melodic = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    out.reflection = REFLECTION.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function movementCards() {
    return `<div class="grid sm:grid-cols-3 gap-3 my-6">
      ${[["⬆️", "Slightly sharp", "A little higher than the note"], ["⬇️", "Slightly flat", "A little lower than the note"], ["↕️", "Unstable", "Moving up and down around it"]]
        .map(([i, t, d]) => `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="text-2xl mb-1">${i}</p><p class="text-sm text-ink-100">${t}</p><p class="text-xs text-ink-500 mt-0.5">${d}</p></div>`).join("")}
    </div>`;
  }

  function problems() {
    const items = [
      ["“My pitch keeps moving.”", `<p class="mb-2">Possible reasons may include: an unfamiliar note, difficulty hearing the reference, breath changes, tension, trying to sing too loudly, or trying to hold the note too long. (These are ideas to explore, not a diagnosis.)</p><p class="text-ink-100">Try a shorter note at a comfortable volume.</p>`],
      ["“My pitch falls near the end.”", `<p>Try a shorter duration, a comfortable (not bigger) breath, and less vocal force.</p>`],
      ["“I become tense when trying to stay on pitch.”", `<p>Return to <a href="#/classes/L1C08" class="text-gold-300 underline">Class 8 — Vocal Relaxation</a>, then try again at a softer, comfortable volume.</p>`],
      ["“I can't tell whether I'm stable.”", `<p>That's okay. Listening ability develops with practice. Use the reference and compare your recordings — your ears will get there.</p>`],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([q, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${q}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <div class="text-sm text-ink-300 leading-relaxed mt-3">${a}</div>
      </details>`).join("")}</div>`;
  }

  function attemptCompare(rec) {
    const t = exState(rec, "ex5").takes;
    const row = (k, label) => `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">${label}</p>
        <button type="button" data-ps-play="${k}" class="vr-btn" ${t[k] ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play</button>
        ${t[k] ? "" : `<p class="text-xs text-ink-500 mt-2">Record ${label} in Exercise 5 first.</p>`}
      </div>`;
    return `<div class="grid sm:grid-cols-2 gap-3 mb-4">${row("a1", "Attempt 1")}${row("a2", "Attempt 2")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["refListen", "matchStop", "stableNote", "listenFirst", "correction", "vowels", "breathPitch", "threeNote", "melodic"].filter((k) => c[k]).length;
    return [
      [`Pitch stability exercises (${ex}/9)`, ex === 9],
      ["Looked at my estimated pitch — after listening", !!c.vizViewed],
      ["Self-evaluation", !!c.selfEval],
      ["Reflected", !!c.reflection],
      ["Completed the assignment", !!c.assignment],
    ];
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 12 milestone</p>
        <p class="font-display text-2xl sm:text-4xl text-ink-50 leading-tight">PITCH AWARENESS <span class="text-gold-300">→</span> PITCH STABILITY</p>
        <p class="text-sm text-ink-300 mt-4">You already learned to find a note.</p>
        <p class="text-sm text-ink-100">Now you're learning to stay with it.</p>
        <p class="text-xs text-ink-500 mt-3">An important foundation skill for singing melodies accurately.</p>
      </div>`;
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can now begin working on keeping individual notes stable.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll learn how to move from one note to another without losing control.` : "Next, we'll learn how to move from one note to another without losing control."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">Find the note — then stay with it.</h3>
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
          </div>` : ""}
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
    const pat = pattern(b);
    const a = A(rec, "assignment");
    const refl = A(rec, "reflection");
    const sel = (g, k) => A(rec, g)[k] || null;

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Find the note — then stay with it", `
          ${p("In Class 4 you learned to <strong class=\"text-ink-100\">match</strong> a reference note. Now there's a new question:")}
          <p class="font-display text-2xl sm:text-3xl text-ink-50 my-6">“Once I reach the note, can I keep my voice reasonably steady?”</p>
          ${p("Once you reach it, a note may move without you meaning it to:")}
          ${movementCards()}
          ${p("The goal is <strong class=\"text-ink-100\">not</strong> a perfectly flat pitch line — natural human singing contains small variations. The goal is to become more aware of <em>unwanted</em> movement, and gradually develop better control.")}
          <div class="mt-6">${PitchVisualizer.illustration()}</div>
        `)}

        ${chapter("understand", 2, "Stable does not mean perfectly flat", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-3">“Stable does not mean perfectly flat.”</p>
            <p class="text-sm text-ink-200">Use a comfortable pitch and a comfortable volume. Small movement is normal.</p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Please don't</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Try to freeze the voice", "Squeeze the throat", "Force the pitch", "Sing louder to stabilize the note", "Make vibrato on purpose", "Hold notes as long as possible", "Hold your breath"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">Instead</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-200">
                ${["Choose a comfortable note", "Keep a comfortable volume", "Short notes are fine — shorter is often easier", "Rest between attempts", "Listen first, look second"].map((t) => `<li class="flex gap-2"><span class="text-teal-300">●</span>${t}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
            Never sing through discomfort. If you feel pain, strain, dizziness or throat discomfort, <strong>stop</strong> and rest.
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 3, "Your comfortable note", `
          ${narrow(p("Tap a key to choose a note that's <strong class=\"text-ink-100\">comfortably within your range</strong>. Every exercise uses it, and the three-note patterns start from it — so if C4 isn't comfortable, choose another."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl">
            ${VirtualPiano.render("ps-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<div class="flex flex-wrap items-center gap-4 mt-5 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
            <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Your note</span>
            <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
            <button type="button" data-ps-ref class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Reference</button>
            <span class="text-xs text-ink-400 basis-full" data-base-pattern>Pattern: ${pat.map(N).join(" → ")}</span>
          </div>`)}
        `, { wide: true })}

        ${chapter("listen", 4, "Exercise 1 — Listen to a stable note", `
          ${p("This is a reference. <strong class=\"text-ink-100\">Listen carefully before singing.</strong>")}
          <div data-ex1-line>${PitchVisualizer.reference(N(b))}</div>
          <div class="flex flex-wrap items-center gap-3 mt-4">
            <button type="button" data-ps-ex1 class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the reference (${REF_SECONDS}s)</button>
            <span class="text-xs text-ink-500" data-ex1-status>${A(rec, "ex1").played ? "Played ✓ — play it again any time." : ""}</span>
          </div>
          <div class="mt-5">${SelfAssessment.render("ex1-q", { ...Q.ex1, selected: sel("ex1", "answer") })}</div>
        `)}

        ${chapter("match", 5, "Exercise 2 — Match then stop", PitchMatchExercise.render("ps-ex2", EX.ex2))}

        ${chapter("hold", 6, "Exercise 3 — Match then hold comfortably", `
          ${PitchMatchExercise.render("ps-ex3", EX.ex3)}
          <div class="mt-4">
            ${p("<strong class=\"text-ink-100\">Your first look at the pitch.</strong> After you've answered by ear, you can open an <em>estimated pitch</em> line: the gold line is the reference, the teal line is an estimate of your voice. A gentle line near the reference is great — small movement is normal. If the estimate isn't trustworthy (silence, noise, a very soft or short take), it stays hidden.")}
            ${StabilityPanel.render("sp-ex3")}
          </div>
        `)}

        ${chapter("ear", 7, "Exercise 4 — Listen without looking", `
          ${PitchMatchExercise.render("ps-ex4", EX.ex4)}
          <div class="mt-4">${StabilityPanel.render("sp-ex4", { title: "Then look: estimated pitch" })}</div>
          <p class="text-xs text-ink-500 mt-2">Ear first trains the skill you'll use when you sing — there's no screen on stage.</p>
        `)}

        ${chapter("correct", 8, "Exercise 5 — Listen and correct", `
          ${PitchMatchExercise.render("ps-ex5", EX.ex5)}
        `)}

        ${chapter("correct", 9, "Before / after: compare your attempts", `
          ${p("Play Attempt 1, then Attempt 2. The second attempt isn't automatically better — just listen honestly.")}
          <div data-compare-host>${attemptCompare(rec)}</div>
          ${SelfAssessment.render("diff-q", { ...Q.diff, selected: sel("compare", "diff") })}
          <div class="grid sm:grid-cols-2 gap-3 mt-4">
            ${StabilityPanel.render("sp-a1", { title: "Attempt 1 · estimated pitch", compact: true })}
            ${StabilityPanel.render("sp-a2", { title: "Attempt 2 · estimated pitch", compact: true })}
          </div>
        `)}

        ${chapter("vowels", 10, "Exercise 6 — Pitch stability with vowels", `
          ${PitchMatchExercise.render("ps-ex6", EX.ex6)}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4 flex flex-col gap-4">
            ${SelfAssessment.render("ex6-q", { ...Q.ex6, selected: sel("ex6q", "change") })}
            ${SelfAssessment.render("ex6-v", { ...Q.ex6v, selected: sel("ex6q", "vowel") })}
          </div>
          <div class="grid sm:grid-cols-3 gap-3 mt-4">
            ${["ah", "ee", "oo"].map((v) => StabilityPanel.render(`sp-${v}`, { title: `${v.toUpperCase()} · estimated pitch`, compact: true })).join("")}
          </div>
        `)}

        ${chapter("breath", 11, "Exercise 7 — Pitch + breath", `
          ${p("Connecting Class 11: a comfortable, natural breath before the note — <strong class=\"text-ink-100\">not a larger one</strong>. Then notice: does the pitch stay reasonably steady, or does it fall near the end as the comfortable breath runs out? If the note is uncomfortable, make it shorter.")}
          <div class="flex flex-wrap items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4">
            <div class="breathe-circle !w-20 !h-20" data-breath-circle></div>
            <div>
              <button type="button" data-ps-breath class="vr-btn">🌬️ Breathe in comfortably</button>
              <p class="text-xs text-ink-500 mt-2" data-breath-status>A gentle, natural breath — about four seconds. Then press Start Recording and sing.</p>
            </div>
          </div>
          ${PitchMatchExercise.render("ps-ex7", EX.ex7)}
          <div class="mt-4">${StabilityPanel.render("sp-ex7")}</div>
        `)}

        ${chapter("move", 12, "Exercise 8 — Three-note stability", `
          ${PitchMatchExercise.render("ps-ex8", EX.ex8)}
          <div class="mt-4">${StabilityPanel.render("sp-ex8")}</div>
        `)}

        ${chapter("move", 13, "Exercise 9 — Short melodic pattern", `
          ${PitchMatchExercise.render("ps-ex9", EX.ex9)}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <div data-ex9-q>${SelfAssessment.render("ex9-q", { question: "Which note felt least stable?", options: leastOptions(pat), selected: sel("ex9q", "least") })}</div>
            <p class="text-xs text-ink-400 mt-3" data-ex9-tip>${ex9Tip(sel("ex9q", "least"), pat)}</p>
          </div>
          <div class="mt-4">${StabilityPanel.render("sp-ex9")}</div>
        `)}

        ${chapter("evaluate", 14, "Common beginner problems", problems())}

        ${chapter("evaluate", 15, "Self-evaluation", `
          ${p("A simple self-check — not a grade. Be kind and honest.")}
          ${ControlCheck.render("ps-check", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 16, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused practice works best — a few minutes with rests is plenty. Longer isn't better. Log the session when you're done; it's saved to your account as <strong class=\"text-ink-100\">Pitch Stability</strong>.")}
          ${Timer.render("ps-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 17, `Class ${cls.number} Assignment`, `
          ${p("Choose one comfortable note (step 3). Then complete Attempt 1, Attempt 2 and the three-note pattern, and answer the questions.")}
          ${PitchMatchExercise.render("ps-assign", EX.assign)}
          <p class="text-xs mt-2 ${a.listened ? "text-emerald-300" : "text-ink-500"}" data-assign-listened>${a.listened ? "✓ Listened back to Attempt 1" : "Listen back to Attempt 1 — press Play My Recording and let it finish."}</p>
          <div class="mt-4">${PitchMatchExercise.render("ps-assign-pattern", EX.assignPattern)}</div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((q, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="ps-aq-${i}">${i + 1}. ${q}</label>
                  <textarea id="ps-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("reflect", 18, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${REFLECTION.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="ps-refl-${i}">${q}</label>
                <textarea id="ps-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 19, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-ps", { placeholder: "e.g. I can match the note but it moves. I notice my pitch falls at the end. I struggle more with EE. The shorter notes are easier." })}
        `)}

        ${chapter("complete", 20, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 21, "Milestone", milestone())}

        ${chapter("complete", 22, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function leastOptions(pat) {
    return [...pat.map((m, i) => opt(String(i + 1), `${i + 1} · ${N(m)}`)), opt("unsure", "Not sure")];
  }
  function ex9Tip(v, pat) {
    if (!v) return "";
    if (v === "unsure") return "That's okay. Listen back once more, slowly — or try the pattern a little slower.";
    return `Good target. Practise note ${v} (${N(pat[Number(v) - 1])}) on its own: play it, match it, hold it briefly — then put it back in the pattern.`;
  }

  function mount(container, cls, params) {
    const cleanups = [];
    const classId = cls.id;
    const $ = (s) => container.querySelector(s);
    const rec0 = () => ClassActivity.get(classId);
    const set = (g, k, v) => ClassActivity.setAnswer(classId, g, k, v);
    const own = (c) => { cleanups.push(() => c.destroy()); return c; };
    const base = () => baseNote(rec0());

    /* ---- live progress ---- */
    const panels = {};
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
      const l = $("[data-assign-listened]");
      const listened = !!A(rec, "assignment").listened;
      l.textContent = listened ? "✓ Listened back to Attempt 1" : "Listen back to Attempt 1 — press Play My Recording and let it finish.";
      l.className = `text-xs mt-2 ${listened ? "text-emerald-300" : "text-ink-500"}`;
      $("[data-compare-host]").innerHTML = attemptCompare(rec);
      Object.values(panels).forEach((pn) => pn.refresh());
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection" || k === "selfEval") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true); // the rest only move forward
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- comfortable note (transposes everything) ---- */
    const controllers = {};
    function onBaseChanged() {
      const b = base();
      $("[data-base-note]").textContent = N(b);
      $("[data-base-pattern]").textContent = `Pattern: ${pattern(b).map(N).join(" → ")}`;
      $("[data-ex1-line]").innerHTML = PitchVisualizer.reference(N(b));
      $("[data-ex9-q]").innerHTML = SelfAssessment.render("ex9-q", { question: "Which note felt least stable?", options: leastOptions(pattern(b)), selected: A(rec0(), "ex9q").least || null });
      Object.values(controllers).forEach((c) => c.refresh());
    }
    const r0 = range();
    own(VirtualPiano.wire(container, "ps-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > r0.to - 2 * STEP) { // keep the pattern inside the comfortable range
          $("[data-base-pattern]").textContent = `Choose ${N(r0.to - 2 * STEP)} or lower, so the three-note pattern stays comfortable.`;
          return;
        }
        set("setup", "note", midi);
        onBaseChanged();
      },
    }));

    /* ---- reference (step 3) + Exercise 1 ---- */
    let refTimer = null;
    function playReference(markEx1) {
      if (VoiceRecorder.isRecording && VoiceRecorder.isRecording()) return; // never play into a live recording
      VoiceRecorder.stopPlayback();
      PianoSynth.stopAll();
      PianoSynth.play(base(), { duration: REF_SECONDS, velocity: 0.6 });
      const line = $("[data-ref-line]");
      if (line) { line.classList.add("is-playing"); clearTimeout(refTimer); refTimer = setTimeout(() => line.classList.remove("is-playing"), REF_SECONDS * 1000); }
      if (markEx1) {
        $("[data-ex1-status]").textContent = "Listening… is it steady?";
        setTimeout(() => { const s = $("[data-ex1-status]"); if (s) s.textContent = "Played ✓ — play it again any time."; }, REF_SECONDS * 1000);
        set("ex1", "played", true);
      }
    }
    cleanups.push(() => clearTimeout(refTimer));

    /* ---- exercises on the Class 4 engine ---- */
    const notesFor = { ex8: () => pattern(base()), ex9: () => pattern(base()), assignPattern: () => pattern(base()) };
    const panelFor = { ex3: ["sp-ex3"], ex4: ["sp-ex4"], ex5: ["sp-a1", "sp-a2"], ex6: ["sp-ah", "sp-ee", "sp-oo"], ex7: ["sp-ex7"], ex8: ["sp-ex8"], ex9: ["sp-ex9"] };
    Object.keys(EX).forEach((key) => {
      const cfg = EX[key];
      controllers[key] = own(PitchMatchExercise.wire(container, `ps-${key === "assignPattern" ? "assign-pattern" : key}`, cfg, {
        classId, exerciseId: key,
        state: (rec0().answers.exercises || {})[key] || {},
        getNotes: notesFor[key] || (() => [base()]),
        isComplete: cfg.isComplete,
        onState: (s) => { set("exercises", key, s); (panelFor[key] || []).forEach((id) => panels[id] && panels[id].refresh()); },
        onRecorded: () => ClassActivity.bump(classId, "recordings"),
        onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
        onPlayed: (slot) => { if (key === "assign" && slot === "a1") set("assignment", "listened", true); },
      }));
    });
    // A new Attempt 1 needs its own listen-back
    let lastA1 = (exState(rec0(), "assign").takes.a1 || {}).mediaId || null;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId) return;
      const now = (exState(rec0(), "assign").takes.a1 || {}).mediaId || null;
      if (now !== lastA1) { const had = lastA1; lastA1 = now; if (had && A(rec0(), "assignment").listened) set("assignment", "listened", false); }
    }));

    /* ---- estimated-pitch panels: listen first, look second ---- */
    const take = (key, slot = "take") => () => exState(rec0(), key).takes[slot] || null;
    const viz = A(rec0(), "viz");
    const panel = (id, getTake, canReveal, extra = {}) => {
      panels[id] = own(StabilityPanel.wire(container, id, {
        getTake, canReveal, revealedFor: viz[id] && viz[id].mediaId, ...extra,
        onRevealed: (mediaId, summary) => set("viz", id, { mediaId, ...summary }),
      }));
    };
    const assessedTake = (key, slot = "take") => () => !!(take(key, slot)() || {}).assessment;
    const ASSESS_LABEL = Object.fromEntries(EX.ex4.assessment.options.map((o) => [o.value, o.label]));
    panel("sp-ex3", take("ex3"), assessedTake("ex3"));
    panel("sp-ex4", take("ex4"), assessedTake("ex4"), {
      waiting: "Listen first: play your recording, then answer “How stable did the note feel to YOU?”. Then you can look.",
      heard: () => ASSESS_LABEL[(take("ex4")() || {}).assessment] || null,
    });
    panel("sp-a1", take("ex5", "a1"), () => !!A(rec0(), "compare").diff, { waiting: "Answer “Did I hear a difference?” first." });
    panel("sp-a2", take("ex5", "a2"), () => !!A(rec0(), "compare").diff, { waiting: "Answer “Did I hear a difference?” first." });
    ["ah", "ee", "oo"].forEach((v) => panel(`sp-${v}`, take("ex6", v), () => !!A(rec0(), "ex6q").change, { waiting: "Answer the vowel question first." }));
    panel("sp-ex7", take("ex7"), assessedTake("ex7"));
    panel("sp-ex8", take("ex8"), assessedTake("ex8"), { chain: true });
    panel("sp-ex9", take("ex9"), () => !!A(rec0(), "ex9q").least, { chain: true, waiting: "Answer “Which note felt least stable?” first." });

    /* ---- clicks: reference, ex1, breath cue, compare playback, chip questions ---- */
    let breathTimer = null;
    function breathCue() {
      const c = $("[data-breath-circle]"), s = $("[data-breath-status]");
      c.classList.add("is-running");
      s.textContent = "Breathe in gently… no need for a big breath.";
      clearTimeout(breathTimer);
      breathTimer = setTimeout(() => { c.classList.remove("is-running"); s.textContent = "Now sing — press Start Recording below. If it feels long, make it shorter."; }, 4000);
    }
    cleanups.push(() => clearTimeout(breathTimer));
    const CHIP_GROUPS = {
      "ex1-q": (v) => set("ex1", "answer", v),
      "diff-q": (v) => set("compare", "diff", v),
      "ex6-q": (v) => set("ex6q", "change", v),
      "ex6-v": (v) => set("ex6q", "vowel", v),
      "ex9-q": (v) => { set("ex9q", "least", v); $("[data-ex9-tip]").textContent = ex9Tip(v, pattern(base())); },
    };
    function onClick(e) {
      if (e.target.closest("[data-ps-ref]")) { playReference(false); return; }
      if (e.target.closest("[data-ps-ex1]")) { playReference(true); return; }
      if (e.target.closest("[data-ps-breath]")) { breathCue(); return; }
      const pl = e.target.closest("[data-ps-play]");
      if (pl) { const t = exState(rec0(), "ex5").takes[pl.dataset.psPlay]; if (t) { PianoSynth.stopAll(); VoiceRecorder.play(t.mediaId); } return; }
      const chip = e.target.closest("[data-assess-choice]");
      const group = chip && chip.closest("[data-assess]");
      if (!group || !CHIP_GROUPS[group.dataset.assess]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      CHIP_GROUPS[group.dataset.assess](chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
    }
    container.addEventListener("click", onClick);
    cleanups.push(() => container.removeEventListener("click", onClick));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "ps-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min — nicely focused. `);
        refreshLive();
      },
    }));

    /* ---- assignment answers, self-evaluation, reflection, notes ---- */
    container.querySelectorAll("[data-assign-q]").forEach((ta) => {
      const i = ta.dataset.assignQ;
      const save = Utils.debounce((v) => set("assignment", "answers", { ...(A(rec0(), "assignment").answers || {}), [i]: v }), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    cleanups.push(ControlCheck.wire(container, "ps-check", { onChange: (k, v) => set("check", k, v) }));
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-ps", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const ans = A(rec, "assignment").answers || {};
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled(r[0]) ? r[0] : "Matching a note and staying on the note are two different skills — and I don't need to force my voice to make it stable.",
        struggled: ans[6] || "",
        toPractice: ans[7] || "",
        thoughts: REFLECTION.map((q, i) => (filled(r[i]) ? `${q} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
