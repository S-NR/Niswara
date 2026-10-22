/* ============================================================
   CLASS 9 — BASIC VOCAL CONTROL (interactive lesson)

   Rendered by ClassDetailPage for interactive: "basic-vocal-control".
   (The brief called this "Class 8"; in this curriculum it is Class 9,
   after Class 8 Vocal Relaxation — kept in place, no renumbering.)

   Flow: START → STABILIZE → CONTROL → CHANGE → TRANSITION → COMBINE.
   "Control does not mean force": short, comfortable exercises with
   rest between attempts; no maximum duration, range or volume.
   Every pattern is built from the learner's chosen starting note,
   so the whole class transposes to wherever is comfortable.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment + PitchAnalysis (Class 4), RecordingCard +
   ObservationChecklist (Class 5), BeatGuide + metronome (Class 6),
   vocal-control tools (vocalControl.js), Timer, PersonalNotes,
   ClassProgress, ClassActivity (per-user, synced to Supabase).
   ============================================================ */

const BasicVocalControlLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "stabilize", label: "Stabilize" },
    { id: "start", label: "Start" },
    { id: "control", label: "Control" },
    { id: "change", label: "Change" },
    { id: "transition", label: "Transition" },
    { id: "combine", label: "Combine" },
    { id: "compare", label: "Compare" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const BPM = 60;
  const STEP = 2; // whole step between pattern notes (C → D → E); small intervals only
  const PRACTICE_TASK = "control";
  const PRACTICE_CATEGORY = "Vocal Control";
  const ASSIGNMENT_MIN_SECONDS = 15;

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson (steps 1–2)" },
    { key: "ex1", label: "Steady note" },
    { key: "ex2", label: "Start and stop" },
    { key: "ex3", label: "Soft and normal" },
    { key: "ex4", label: "Crescendo and decrescendo" },
    { key: "ex5", label: "Two-note transition" },
    { key: "ex6", label: "Three-note pattern" },
    { key: "ex7", label: "Controlled note length" },
    { key: "ex8", label: "Pitch + rhythm + control" },
    { key: "selfCheck", label: "Vocal control check" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const CHECK_ROWS = [
    { key: "pitch", area: "Pitch", question: "Was my note stable?" },
    { key: "start", area: "Start", question: "Could I start the note intentionally?" },
    { key: "end", area: "End", question: "Could I stop intentionally?" },
    { key: "volume", area: "Volume", question: "Could I make the voice slightly softer/louder without forcing?" },
    { key: "transition", area: "Transition", question: "Could I move between two nearby notes smoothly?" },
    { key: "rhythm", area: "Rhythm", question: "Could I start and stop on time?" },
    { key: "comfort", area: "Comfort", question: "Did my voice feel relaxed?" },
  ];

  const ASSIGNMENT_OBS = ["What was most stable?", "What was hardest to control?", "What is one thing I want to improve?"];

  const YES_MOSTLY = [
    { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" },
    { value: "notyet", label: "Not yet", tone: "maybe" }, { value: "unsure", label: "Not sure", tone: "neutral" },
  ];
  const MOVE_ASSESS = {
    question: "How did the move sound?",
    options: [
      { value: "smooth", label: "Smooth", tone: "good" }, { value: "jump", label: "A small jump", tone: "maybe" },
      { value: "lost", label: "Lost the pitch", tone: "maybe" }, { value: "forced", label: "Felt forced", tone: "miss" },
      { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
    feedback: {
      smooth: "Lovely — an easy, connected move.",
      jump: "That's useful to notice. Try it a little slower and think of the second note before you move.",
      lost: "Normal at first. Play the reference again and move more slowly — small steps are fine.",
      forced: "Let's make it easier: sing more quietly, or choose a lower starting note. Comfort first.",
      unsure: "Play the reference and your take one after the other — listen for how the notes join.",
    },
  };

  /* ---- Exercise configurations (PitchMatchExercise, Class 4 engine) ---- */
  const EX = {
    ex1: { // SteadyNoteExercise
      eyebrow: "Exercise 1 · Stabilize", title: "Steady note",
      intro: "Play the reference, then sing the same note <strong class=\"text-ink-200\">comfortably</strong> for a few seconds — on “ah” or “mm”. The goal is <em>not</em> to hold it as long as possible; it's to make a reasonably stable note without forcing.",
      flow: ["🎹 Hear", "🎤 Sing gently", "🎧 Listen back"],
      slots: [{ key: "take", label: "Your steady note", hint: "3–5 comfortable seconds is plenty" }],
      assessment: {
        question: "My note felt…",
        options: [{ value: "stable", label: "Stable", tone: "good" }, { value: "mostly", label: "Mostly stable", tone: "good" }, { value: "wobbly", label: "Wobbly", tone: "maybe" }, { value: "hard", label: "Difficult to control", tone: "maybe" }],
        feedback: {
          stable: "Lovely. Notice how easy it felt — that ease is what control is built on.",
          mostly: "Good. Small wobbles are normal; they settle with relaxed practice.",
          wobbly: "Useful to notice. Try a little quieter and lower — stability comes from ease, not effort.",
          hard: "That's fine for now. Rest a moment, choose an easier note, and try a shorter, softer take.",
        },
      },
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
    ex2: { // OnsetReleaseExercise
      eyebrow: "Exercise 2 · Start", title: "Start and stop",
      intro: "Start the sound <strong class=\"text-ink-200\">on purpose</strong>, end it <strong class=\"text-ink-200\">on purpose</strong>. Three short notes: 🎵 — stop, 🎵 — stop, 🎵 — stop. Short and relaxed; no need to hold anything.",
      slots: [{ key: "take", label: "Three short notes", hint: "Sing with the guide above, or on your own" }],
      assessment: { question: "Could you start and stop each note on purpose?", options: YES_MOSTLY, feedback: {
        yes: "Lovely — clean starts and ends.", mostly: "Good. Listen back for which part — start or stop — felt less clear.",
        notyet: "That's normal. Try thinking “start” and “stop” just before each one, and keep them very short.", unsure: "Listen back closely to the very start and end of each note." } },
      noEstimate: true,
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
    ex3: { // VolumeControlExercise
      eyebrow: "Exercise 3 · Control", title: "Soft and normal",
      intro: "One comfortable note, three takes: comfortable volume → <strong class=\"text-ink-200\">slightly</strong> softer → back to comfortable. <em>Soft singing does not mean whispering</em> — keep a clear, easy tone.",
      slots: [
        { key: "normal1", label: "1 · Comfortable volume", hint: "Your easy, natural volume" },
        { key: "soft", label: "2 · Slightly softer", hint: "A little quieter — still singing, not whispering" },
        { key: "normal2", label: "3 · Back to comfortable", hint: "Return to your easy volume" },
      ],
      assessment: null,
      isComplete: (s) => ["normal1", "soft", "normal2"].every((k) => s.takes[k] && s.takes[k].mediaId),
    },
    ex4: { // DynamicExercise
      eyebrow: "Exercise 4 · Change", title: "Crescendo and decrescendo",
      intro: "Start comfortably soft, become <strong class=\"text-ink-200\">slightly</strong> louder, then return gradually to soft. Follow the guide line above. A small change is exactly right — this is control, not power.",
      slots: [{ key: "take", label: "Soft → medium → soft", hint: "About six relaxed seconds on one note" }],
      assessment: { question: "Did your volume move gently, soft → medium → soft?", options: YES_MOSTLY, feedback: {
        yes: "Lovely — a gentle, controlled swell.", mostly: "Good. Compare your loudness line with the guide below.",
        notyet: "Totally normal. Try a smaller change — barely louder is fine.", unsure: "Look at your loudness line below, and listen back once more." } },
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
  };
  const transitionEx = (eyebrow, title, intro, label) => ({
    eyebrow, title, intro, chain: true, refLabel: "Reference notes",
    slots: [{ key: "take", label, hint: "Listen, then sing it back gently and connected" }],
    assessment: MOVE_ASSESS,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  });
  const EX_MOVES = {
    ex5up: transitionEx("Exercise 5 · Transition", "Up: two notes", "Two nearby notes, one step apart. Listen to both, then sing the move.", "Your move up"),
    ex5down: transitionEx("Exercise 5 · Transition", "Down: two notes", "The same two notes, the other way.", "Your move down"),
    ex6up: transitionEx("Exercise 6 · Transition", "Three notes up", "Three neighbouring notes. Listen, sing, record, replay, compare.", "Your three notes up"),
    ex6down: transitionEx("Exercise 6 · Transition", "Three notes down", "And back down again.", "Your three notes down"),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow, tryIt } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state ---------- */
  function range(rec) {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[(A(rec, "setup").range) || c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range(rec);
    const n = A(rec, "setup").note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));

  function assignmentDone(rec) {
    const a = A(rec, "assignment");
    return !!(a.take && a.take.seconds >= ASSIGNMENT_MIN_SECONDS)
      && [0, 1, 2, 3, 4].every((i) => (a.ticks || {})[i])
      && !!a.listened
      && ASSIGNMENT_OBS.every((_, i) => filled((a.obs || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    ["ex1", "ex2", "ex4"].forEach((k) => { if (exDone(rec, k, EX[k])) out[k] = true; });
    if (exDone(rec, "ex3", EX.ex3) && A(rec, "ex3q").pitch) out.ex3 = true;
    if (exDone(rec, "ex5up", EX_MOVES.ex5up) && exDone(rec, "ex5down", EX_MOVES.ex5down)) out.ex5 = true;
    if (exDone(rec, "ex6up", EX_MOVES.ex6up) && exDone(rec, "ex6down", EX_MOVES.ex6down)) out.ex6 = true;
    const g = A(rec, "guides");
    if (g.ex7Run && g.ex7Assess) out.ex7 = true;
    if (g.ex8Run && g.ex8Assess) out.ex8 = true;
    out.selfCheck = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec)) out.assignment = true;
    return out;
  }

  /* ---------- guide bars (built from the starting note) ---------- */
  const S = (t = "🎵", extra = {}) => ({ t, note: true, ...extra });
  const R = () => ({ t: "", rest: true });
  const T = (t) => ({ t });
  const startStopBars = () => [[S(), T("stop"), S(), T("stop")], [S(), T("stop"), R(), R()]];
  const durationBars = () => [[S("Sing", { beats: 2 }), T("hold"), R(), R()], [S("Sing", { beats: 4 }), T("hold"), T("hold"), T("hold")], [R(), R(), R(), R()]];
  const combinedBars = (b) => [[{ t: N(b), midi: b }, { t: N(b + STEP), midi: b + STEP }, { t: N(b + 2 * STEP), midi: b + 2 * STEP }, R()]];
  const assignmentBars = (b) => [
    [S("Hold", { beats: 4 }), T("…"), T("…"), T("…")],
    ...startStopBars(),
    [S("soft", { beats: 4 }), T("→"), T("comfortable"), T("…")],
    [{ t: N(b), midi: b }, { t: N(b + STEP), midi: b + STEP }, { t: N(b + 2 * STEP), midi: b + 2 * STEP }, R()],
    [S(), S(), R(), S()],
  ];

  /* ---------- small views ---------- */
  function progressionStrip() {
    const steps = ["START", "STABILIZE", "CONTROL", "CHANGE", "TRANSITION", "COMBINE"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.12em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["ex1", "ex2", "ex3", "ex4", "ex5", "ex6", "ex7", "ex8"].filter((k) => c[k]).length;
    return [
      [`Control exercises (${ex}/8)`, ex === 8],
      ["Vocal control check", !!c.selfCheck],
      ["Reflected", !!c.reflection],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You've now started learning how to control your voice — with small, intentional changes, while staying comfortable.</p>
        <p class="text-sm text-ink-300 leading-relaxed mb-2">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, you'll capture where your voice is today, so you can hear how far you've come.` : ""}</p>
        <p class="text-sm text-ink-400 leading-relaxed">After that, Level 2 explores <strong class="text-ink-200">where your voice naturally resonates and how different parts of your voice feel</strong> — Vocal Placement & Resonance — starting with simple awareness, not technique.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">Control without force.</h3>
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
    const g = A(rec, "guides");
    const a = A(rec, "assignment");
    const refl = A(rec, "reflection");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Learn to control the voice you already have", `
          ${p("You can hear pitch, match it, listen to yourself, keep time and warm up. Now you'll learn to <strong class=\"text-ink-100\">guide your voice on purpose</strong>. Vocal control simply means being able to choose:")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 my-5">
            ${["When a note starts", "When a note ends", "Keeping pitch steady", "How loud it is", "Smoothness", "Simple moves between notes", "Letting the breath go easily", "How a note begins (the onset)"].map((t) => `<div class="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-ink-200">${t}</div>`).join("")}
          </div>
          ${p("You'll build it in six small steps:")}
          ${progressionStrip()}
          ${p("<span class=\"text-ink-500\">Advanced ideas like mixed voice, belting or resonance techniques come much later. Today is about simple, comfortable control.</span>")}
        `)}

        ${chapter("understand", 2, "Control does not mean force", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-4">“Control does not mean force.”</p>
            <p class="text-sm text-ink-200 mb-3">A controlled voice can be:</p>
            <div class="flex flex-wrap gap-2">${["Soft", "Comfortable", "Stable", "Clear", "Relaxed"].map((t) => `<span class="flow-chip !text-sm">${t}</span>`).join("")}</div>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Please don't try to</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Sing louder to “be more controlled”", "Push more air", "Tighten the throat", "Raise the chin", "Force high (or low) notes", "Hold your breath", "Hold a note beyond comfort"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">Instead</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-200">
                ${["Keep every exercise short", "Rest a few seconds between attempts", "Choose comfortable notes", "Small changes are the goal"].map((t) => `<li class="flex gap-2"><span class="text-teal-300">●</span>${t}</li>`).join("")}
              </ul>
            </div>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
            If you feel pain, significant dizziness, unusual breathlessness or throat discomfort, <strong>stop the exercise</strong> and rest. Singing should never hurt.
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 3, "Your comfortable starting note", `
          ${narrow(p("Tap a key to choose a <strong class=\"text-ink-100\">comfortable middle note</strong>. Every exercise is built from it — so if C4 isn't comfortable, choose another; the patterns move with you."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl">
            ${VirtualPiano.render("vc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<div class="flex flex-wrap items-center gap-4 mt-5 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
            <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Starting note</span>
            <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
            <span class="text-xs text-ink-400" data-base-pattern>Patterns: ${N(b)} → ${N(b + STEP)} → ${N(b + 2 * STEP)}</span>
          </div>`)}
        `, { wide: true })}

        ${chapter("stabilize", 4, "Exercise 1 — Steady note", PitchMatchExercise.render("vc-ex1", EX.ex1))}

        ${chapter("start", 5, "Exercise 2 — Start and stop", `
          ${p("Use the guide: sing on 🎵, stop cleanly on “stop”. The clicks keep it short and easy.")}
          ${BeatGuide.render("bg-ex2", { bars: startStopBars(), guideToggle: true })}
          <div class="mt-4">${PitchMatchExercise.render("vc-ex2", EX.ex2)}</div>
        `)}

        ${chapter("control", 6, "Exercise 3 — Soft and normal", `
          ${PitchMatchExercise.render("vc-ex3", EX.ex3)}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <div data-ex3-loudness></div>
            <div class="mt-4">${SelfAssessment.render("ex3-pitch", { question: "Could you change volume without changing the pitch too much?", options: YES_MOSTLY, selected: A(rec, "ex3q").pitch || null })}</div>
          </div>
        `)}

        ${chapter("change", 7, "Exercise 4 — Crescendo and decrescendo", `
          ${p("Soft → medium → soft. Press the guide, listen to your note, then sing along with the moving line. Record a take when you're ready.")}
          ${VolumeEnvelope.render("ve-ex4", { seconds: 6 })}
          <div class="mt-4">${PitchMatchExercise.render("vc-ex4", EX.ex4)}</div>
          <p class="text-[11px] text-ink-600 mt-2" data-ex4-note>After you record, your own loudness line appears on the guide above (an estimate from your microphone).</p>
        `)}

        ${chapter("transition", 8, "Exercise 5 — Two-note transition", `
          ${p("Two nearby notes. Listen for: smooth movement, a sudden jump, losing the pitch, or unnecessary force. No big leaps yet.")}
          <div class="grid lg:grid-cols-2 gap-4">${PitchMatchExercise.render("vc-ex5up", EX_MOVES.ex5up)}${PitchMatchExercise.render("vc-ex5down", EX_MOVES.ex5down)}</div>
        `)}

        ${chapter("transition", 9, "Exercise 6 — Three-note pattern", `
          ${p("Listen → sing → record → replay → compare. This is your ear, brain and voice working together.")}
          <div class="grid lg:grid-cols-2 gap-4">${PitchMatchExercise.render("vc-ex6up", EX_MOVES.ex6up)}${PitchMatchExercise.render("vc-ex6down", EX_MOVES.ex6down)}</div>
        `)}

        ${chapter("combine", 10, "Exercise 7 — Controlled note length", `
          ${p("With the Class 6 metronome at 60 BPM: sing for about <strong class=\"text-ink-100\">2 beats</strong>, rest for 2; then sing for <strong class=\"text-ink-100\">4 beats</strong>, rest for 4. Start on time, keep the note comfortable, stop on purpose. <em>This is not a breath-holding exercise</em> — if 4 beats feels long, stop early and breathe.")}
          ${BeatGuide.render("bg-ex7", { bars: durationBars(), guideToggle: true })}
          <div class="mt-4">${SelfAssessment.render("ex7-assess", { question: "Did you start on time, keep it comfortable and stop on purpose?", options: YES_MOSTLY, selected: g.ex7Assess || null })}</div>
          <div class="mt-4">${RecordingCard.render("rc-ex7", { title: "Optional: record yourself", hint: "Start the guide, then record — and listen back.", maxSeconds: 30, section: false })}</div>
        `)}

        ${chapter("combine", 11, "Exercise 8 — Pitch + rhythm + control", `
          ${p("Everything together: three notes on beats 1, 2 and 3, rest on beat 4 — pitch, rhythm, timing and control in one small phrase.")}
          <div data-ex8-host></div>
          <div class="mt-4">${SelfAssessment.render("ex8-assess", { question: "How did it come together?", options: [
            { value: "together", label: "It came together", tone: "good" }, { value: "partly", label: "Partly", tone: "maybe" }, { value: "notyet", label: "Not yet", tone: "maybe" }, { value: "unsure", label: "Not sure", tone: "neutral" }], selected: g.ex8Assess || null })}</div>
          <div class="mt-4">${RecordingCard.render("rc-ex8", { title: "Optional: record yourself", hint: "Start the guide, then record — and listen back.", maxSeconds: 30, section: false })}</div>
        `)}

        ${chapter("compare", 12, "Compare two attempts", `
          ${p("Pick any two of your takes from this class — for example your first and your latest — and listen to each.")}
          ${RecordingComparison.render("vc-compare")}
        `)}

        ${chapter("practice", 13, "Practice timer — Vocal Control", `
          ${p("Repeat any exercise you like while the timer runs — short attempts with rests. Then log the session; it's saved to your account as <strong class=\"text-ink-100\">Vocal Control</strong>.")}
          ${Timer.render("vc-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 14, `Class ${cls.number} Assignment`, `
          ${p("Record one short vocal exercise containing all five parts. The guide below walks you through them at 60 BPM — start it, then press Record. Use your comfortable starting note (change it in step 3 if you need to).")}
          <ol class="flex flex-col gap-1 mb-4">
            ${cls.content.assignment.instructions.map((t, i) => `
              <li><label class="flex items-start gap-3 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/[0.03]">
                <input type="checkbox" data-assign-tick="${i}" ${(a.ticks || {})[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                <span class="text-sm text-ink-200"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${t}${i === 3 ? ` <span class="text-ink-500" data-assign-pattern>(${N(b)} → ${N(b + STEP)} → ${N(b + 2 * STEP)})</span>` : ""}</span>
              </label></li>`).join("")}
          </ol>
          <div data-assign-guide-host></div>
          <div class="mt-4">${RecordingCard.render("rc-assign", { title: "My Class " + cls.number + " recording", hint: "Then listen back from start to finish.", maxSeconds: 60, section: false })}</div>
          <p class="text-xs mt-2 ${a.listened ? "text-emerald-300" : "text-ink-500"}" data-assign-listened>${a.listened ? "✓ Listened back" : "Listen back to the whole recording (press Play and let it finish)."}</p>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Three observations</h4>
            <div class="flex flex-col gap-4">
              ${ASSIGNMENT_OBS.map((q, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="vc-obs-${i}">${i + 1}. ${q}</label>
                  <textarea id="vc-obs-${i}" data-assign-obs="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.obs || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("reflect", 15, "Vocal control check", `
          ${p("A simple self-check — not a grade. Be kind and honest.")}
          ${ControlCheck.render("vc-check", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("reflect", 16, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="vc-refl-${i}">${q}</label>
                <textarea id="vc-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 17, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vc", { placeholder: "e.g. My note became unstable when I became louder. I can start notes easily but stopping feels less controlled. C4 → D4 was comfortable." })}
        `)}

        ${chapter("complete", 18, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 19, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- live progress ---- */
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
      const a = A(rec, "assignment");
      const l = $("[data-assign-listened]");
      l.textContent = a.listened ? "✓ Listened back" : "Listen back to the whole recording (press Play and let it finish).";
      l.className = `text-xs mt-2 ${a.listened ? "text-emerald-300" : "text-ink-500"}`;
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection" || k === "selfCheck") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- starting note (transposes everything) ---- */
    const controllers = {};
    let ex8Guide = null, assignGuide = null;
    function mountEx8() {
      if (ex8Guide) ex8Guide.destroy();
      $("[data-ex8-host]").innerHTML = BeatGuide.render("bg-ex8", { bars: combinedBars(base()), guideToggle: true });
      ex8Guide = BeatGuide.wire(container, "bg-ex8", { bpm: BPM, loops: 4, bars: combinedBars(base()), onComplete: () => set("guides", "ex8Run", true) });
    }
    function mountAssignGuide() {
      if (assignGuide) assignGuide.destroy();
      const bars = assignmentBars(base());
      $("[data-assign-guide-host]").innerHTML = BeatGuide.render("bg-assign", { bars, guideToggle: true });
      assignGuide = BeatGuide.wire(container, "bg-assign", { bpm: BPM, loops: 1, bars, getNote: base });
    }
    function onBaseChanged() {
      const b = base();
      $("[data-base-note]").textContent = N(b);
      $("[data-base-pattern]").textContent = `Patterns: ${N(b)} → ${N(b + STEP)} → ${N(b + 2 * STEP)}`;
      const ap = $("[data-assign-pattern]"); if (ap) ap.textContent = `(${N(b)} → ${N(b + STEP)} → ${N(b + 2 * STEP)})`;
      Object.values(controllers).forEach((c) => c.refresh());
      mountEx8();
      mountAssignGuide();
    }
    const r0 = range(rec0());
    own(VirtualPiano.wire(container, "vc-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > r0.to - 2 * STEP) { // keep the three-note pattern inside the comfortable range
          $("[data-base-pattern]").textContent = `Choose ${N(r0.to - 2 * STEP)} or lower, so the three-note pattern stays comfortable.`;
          return;
        }
        set("setup", "note", midi);
        onBaseChanged();
      },
    }));
    cleanups.push(() => { if (ex8Guide) ex8Guide.destroy(); if (assignGuide) assignGuide.destroy(); });

    /* ---- exercises on the Class 4 engine ---- */
    const notesFor = {
      ex1: () => [base()], ex2: () => [base()], ex3: () => [base()], ex4: () => [base()],
      ex5up: () => [base(), base() + STEP], ex5down: () => [base() + STEP, base()],
      ex6up: () => [base(), base() + STEP, base() + 2 * STEP], ex6down: () => [base() + 2 * STEP, base() + STEP, base()],
    };
    const allCfg = { ...EX, ...EX_MOVES };
    Object.keys(allCfg).forEach((key) => {
      const cfg = allCfg[key];
      controllers[key] = own(PitchMatchExercise.wire(container, `vc-${key}`, cfg, {
        classId, exerciseId: key,
        state: (rec0().answers.exercises || {})[key] || {},
        getNotes: notesFor[key],
        isComplete: cfg.isComplete,
        onState: (s) => { set("exercises", key, s); if (key === "ex3") paintLoudness(); if (key === "ex4") paintEnvelope(); compare.refresh(); },
        onRecorded: () => ClassActivity.bump(classId, "recordings"),
        onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
      }));
    });

    /* ---- Ex2 guide, Ex4 envelope, Ex3 loudness ---- */
    own(BeatGuide.wire(container, "bg-ex2", { bpm: BPM, loops: 2, bars: startStopBars(), getNote: base }));
    const envelope = own(VolumeEnvelope.wire(container, "ve-ex4", { seconds: 6, getNote: base }));
    const loudCache = new Map();
    async function loudnessOf(mediaId) {
      if (loudCache.has(mediaId)) return loudCache.get(mediaId);
      let blob = await Media.getBlob(mediaId).catch(() => null);
      if (!blob) { // another device: getUrl downloads it from the account
        const url = await Media.getUrl(mediaId).catch(() => null);
        blob = url ? await fetch(url).then((r) => r.blob()).catch(() => null) : null;
      }
      if (!blob) return null;
      const res = await LoudnessAnalysis.analyze(blob).catch(() => null);
      loudCache.set(mediaId, res);
      return res;
    }
    async function paintLoudness() {
      const takes = exState(rec0(), "ex3").takes;
      const rows = [["normal1", "1 · Comfortable"], ["soft", "2 · Slightly softer"], ["normal2", "3 · Back to comfortable"]];
      const out = [];
      for (const [k, label] of rows) out.push({ label, db: takes[k] ? ((await loudnessOf(takes[k].mediaId)) || {}).db : undefined });
      const host = $("[data-ex3-loudness]");
      if (host) host.innerHTML = LoudnessCompare.render(out);
    }
    async function paintEnvelope() {
      const t = exState(rec0(), "ex4").takes.take;
      if (!t) return;
      const res = await loudnessOf(t.mediaId);
      if (res) { envelope.setCurve(res.curve); $("[data-ex4-note]").textContent = "Your loudness line (teal) from your last take, over the guide (gold). An estimate from your microphone — a gentle hill is perfect."; }
    }
    paintLoudness();
    paintEnvelope();

    /* ---- Ex7 & Ex8 guides ---- */
    own(BeatGuide.wire(container, "bg-ex7", { bpm: BPM, loops: 2, bars: durationBars(), getNote: base, onComplete: () => set("guides", "ex7Run", true) }));
    mountEx8();
    const recCard = (domId, key, name) => own(RecordingCard.wire(container, domId, {
      classId, take: (A(rec0(), "recordings") || {})[key] || null, maxSeconds: 30,
      meta: { name, exercise: `control-${key}` },
      onSaved: (take) => { set("recordings", key, take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));
    recCard("rc-ex7", "ex7", "Controlled note length");
    recCard("rc-ex8", "ex8", "Pitch + rhythm + control");

    /* ---- self-assessment chips (ex3 pitch, ex7, ex8) ---- */
    function onAssess(e) {
      const chip = e.target.closest('[data-assess="ex3-pitch"] [data-assess-choice], [data-assess="ex7-assess"] [data-assess-choice], [data-assess="ex8-assess"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      const v = chip.dataset.assessChoice;
      ({ "ex3-pitch": () => set("ex3q", "pitch", v), "ex7-assess": () => set("guides", "ex7Assess", v), "ex8-assess": () => set("guides", "ex8Assess", v) })[group.dataset.assess]();
      ClassActivity.bump(classId, "selfEvaluations");
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- recording comparison ---- */
    const compare = own(RecordingComparison.wire(container, "vc-compare", {
      list: () => Store.getClassProgress(classId).uploads.slice().sort((x, y) => (x.date || "").localeCompare(y.date || "")),
      saved: A(rec0(), "compare"),
      onChange: (s) => { set("compare", "a", s.a); set("compare", "b", s.b); set("compare", "changed", s.changed); },
    }));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "vc-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment ---- */
    mountAssignGuide();
    const assignSaved = A(rec0(), "assignment");
    own(RecordingCard.wire(container, "rc-assign", {
      classId, take: assignSaved.take || null, maxSeconds: 60,
      meta: { name: `Class ${cls.number} assignment`, exercise: "control-assignment" },
      onSaved: (take) => {
        set("assignment", "take", take);
        set("assignment", "listened", false); // a new recording needs its own listen-back
        ClassActivity.bump(classId, "recordings");
        compare.refresh();
      },
      onPlayer: (player) => player.on("ended", ({ fromStart }) => { if (fromStart) set("assignment", "listened", true); }),
    }));
    function onTick(e) {
      const cb = e.target.closest("[data-assign-tick]");
      if (cb) set("assignment", "ticks", { ...(A(rec0(), "assignment").ticks || {}), [cb.dataset.assignTick]: cb.checked });
    }
    container.addEventListener("change", onTick);
    cleanups.push(() => container.removeEventListener("change", onTick));
    container.querySelectorAll("[data-assign-obs]").forEach((ta) => {
      const i = ta.dataset.assignObs;
      const save = Utils.debounce((v) => set("assignment", "obs", { ...(A(rec0(), "assignment").obs || {}), [i]: v }), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- control check, reflection, notes ---- */
    cleanups.push(ControlCheck.wire(container, "vc-check", { onChange: (k, v) => set("check", k, v) }));
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-vc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const qs = cls.content.assignment.questions;
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled(r[0]) ? r[0] : "I don't need to force my voice to control it — small, intentional changes while staying comfortable.",
        struggled: (A(rec, "assignment").obs || {})[1] || "",
        toPractice: r[6] || (A(rec, "assignment").obs || {})[2] || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
