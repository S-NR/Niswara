/* ============================================================
   CLASS 13 — SMOOTH NOTE TRANSITIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "smooth-note-transitions".

   Core idea: "Learn to move from one note to another without
   losing control." Builds directly on Class 12 (MATCH -> STABILIZE)
   by adding MOVE -> ARRIVE -> STABILIZE. "Smooth does not mean
   slow" — small, nearby intervals only; no vocal registers, mixed
   voice, belting, runs, riffs, vibrato or large jumps here.

   Flow: understand -> choose a reference note -> hear two notes ->
   match each separately -> two-note transition (+ a deliberately
   slow version) -> a clean, visualised movement -> ascending ->
   descending -> three-note movement + a wider skip -> transition
   with rhythm -> transition with breath -> listen back and
   classify your own takes + common problems -> self-evaluate ->
   practice -> assignment (3 attempts) -> reflect -> milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4, chain mode throughout — the Class 9
   "transitionEx" shape), the Class 6 Metronome/BeatGuide, the
   Class 7 breathing circle, the Class 12 PitchVisualizer /
   StabilityPanel (reused as-is, not rebuilt), ControlCheck (Class
   9/12, per-row levels), Timer, PersonalNotes, ClassProgress,
   ClassActivity. No new shared components — "listen and identify
   the problem" (spec's Exercise 12) uses the learner's OWN takes
   from this lesson rather than fabricated example recordings,
   since PianoSynth can't honestly simulate a real overshoot or
   sudden jump — inventing misleading "example" audio would break
   this app's honesty rules.
   ============================================================ */

const SmoothNoteTransitionsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "setup", label: "Setup" },
    { id: "hear", label: "Hear" },
    { id: "transition", label: "Transition" },
    { id: "clean", label: "Clean Move" },
    { id: "ascend", label: "Ascend" },
    { id: "descend", label: "Descend" },
    { id: "patterns", label: "Patterns" },
    { id: "rhythm", label: "Rhythm" },
    { id: "breath", label: "Breath" },
    { id: "listen", label: "Listen" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2; // whole step — the Class 9/10/11/12 convention
  const BPM = 60;
  const PRACTICE_TASK = "pitch";
  const PRACTICE_CATEGORY = "Note Transitions";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "twoNoteListening", label: "Two-note listening completed" },
    { key: "individualMatching", label: "Individual note matching completed" },
    { key: "twoNoteTransition", label: "Two-note transition completed" },
    { key: "slowTransition", label: "Slow transition completed" },
    { key: "ascending", label: "Ascending transitions completed" },
    { key: "descending", label: "Descending transitions completed" },
    { key: "threeNoteMovement", label: "Three-note movement completed" },
    { key: "skippedNote", label: "Skipped-note transition completed" },
    { key: "rhythmTransition", label: "Rhythm transition completed" },
    { key: "breathTransition", label: "Breath transition completed" },
    { key: "listeningId", label: "Listening identification completed" },
    { key: "beforeAfter", label: "Before/after recording completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const DIRECTION_ASSESS = (dir) => ({
    question: `Can you hear that the second note is ${dir}?`,
    options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("unsure", "Not sure"), opt("notyet", "Not yet", "maybe")],
  });
  const MOVE_ASSESS = {
    question: "Did the transition feel smooth?",
    options: [opt("smooth", "Smooth", "good"), opt("mostly", "Mostly smooth", "good"), opt("sudden", "Sudden", "maybe"), opt("unstable", "Unstable", "maybe"), opt("unsure", "Not sure")],
    feedback: {
      smooth: "Lovely — a clean, connected move.", mostly: "Good. A little roughness is completely normal at this stage.",
      sudden: "Useful to notice. Try it a touch slower, or choose a smaller interval.", unstable: "That's fine — try approaching the second note more gently, without pushing.",
      unsure: "Play both notes again, then your take, and compare.",
    },
  };
  const BEFOREAFTER_ASSESS = {
    question: "Did your second attempt feel different?",
    options: [opt("much", "Much smoother", "good"), opt("slightly", "Slightly smoother", "good"), opt("same", "About the same", "neutral"), opt("less", "Less smooth", "maybe"), opt("unsure", "Not sure")],
  };
  const CLASSIFY_OPTIONS = [opt("high", "Arrived too high"), opt("low", "Arrived too low"), opt("sudden", "Sudden jump"), opt("smooth", "Smooth transition"), opt("unsure", "Not sure")];

  const CHECK_ROWS = [
    { key: "hearing", area: "Hearing", question: "Could I hear which note was higher?", levels: YMN },
    { key: "matching", area: "Matching", question: "Could I match both notes individually?", levels: YMN },
    { key: "transition", area: "Transition", question: "Could I move between them?", levels: YMN },
    { key: "arrival", area: "Arrival", question: "Could I settle on the second note?", levels: YMN },
    { key: "smoothness", area: "Smoothness", question: "Did the transition feel controlled?", levels: YMN },
    { key: "comfort", area: "Comfort", question: "Did I remain relaxed?", levels: lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["no", "○", "No"]) },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 12 -> Class 10 -> Class 4) ---------- */
  function range() {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range();
    const n = A(rec, "setup").note
      ?? (ClassActivity.get("L1C12").answers.setup || {}).note
      ?? (ClassActivity.get("L1C10").answers.setup || {}).note
      ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 4 * STEP ? n : r.from;
  }

  /* ---- transition exercise configs (PitchMatchExercise, chain mode — the Class 9 "transitionEx" shape) ---- */
  const transitionEx = (eyebrow, title, intro, label, flow) => ({
    eyebrow, title, intro, chain: true, refLabel: "Reference notes", flow,
    slots: [{ key: "take", label, hint: "Listen, then sing it back gently and connected" }],
    assessment: MOVE_ASSESS,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  });
  const EX = {
    up: () => transitionEx("Exercise 3 · Transition", "Up: two notes", "Play both notes, then sing the move up.", "Your move up", ["🎹 Hear", "🎤 Move up", "🎧 Listen back"]),
    down: () => transitionEx("Exercise 3 · Transition", "Down: two notes", "The same two notes, the other way.", "Your move down", ["🎹 Hear", "🎤 Move down", "🎧 Listen back"]),
    slow: () => ({ ...transitionEx("Exercise 4 · Slow", "A slow transition", "The same two notes — this time, deliberately slow, just to hear the distance between them. Not an exaggerated slide.", "Your slow move", null), noEstimate: true }),
    clean: () => ({ ...transitionEx("Exercise 5 · Clean Move", "Start, move, arrive, stabilise", "Start the first note, move toward the second, arrive, and hold briefly before stopping.", "Your movement", null) }),
    ascend: (b) => transitionEx("Exercise 6 · Ascend", "Ascending run", "A short upward run — stop any time it stops feeling comfortable.", "Your ascending run", null),
    descend: (b) => transitionEx("Exercise 7 · Descend", "Descending run", "The same notes, coming back down.", "Your descending run", null),
    three: { up: () => transitionEx("Exercise 8 · Patterns", "Three notes up", "1 → 2 → 3, then stop.", "Three notes up", null), down: () => transitionEx("Exercise 8 · Patterns", "Three notes down", "3 → 2 → 1.", "Three notes down", null) },
    skip: { up: () => transitionEx("Exercise 9 · Patterns", "Skip a note — up", "A slightly larger distance: 1 → 3. Don't force it.", "Skip up", null), down: () => transitionEx("Exercise 9 · Patterns", "Skip a note — down", "3 → 1.", "Skip down", null) },
    breath: () => transitionEx("Exercise 11 · Breath", "A phrase on one comfortable breath", "Breathe comfortably, then sing the three notes as one phrase, finishing naturally.", "Your phrase", null),
  };

  const matchEx = (which, midi) => ({ eyebrow: `Note ${which}`, title: NoteUtils.name(midi), intro: "Play it, then sing it back.", slots: [{ key: "take", label: `Note ${which}`, hint: "A comfortable, brief note" }], assessment: null });

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key) => !!(exState(rec, key).takes.take && exState(rec, key).takes.take.assessment);
  const recorded = (rec, key) => !!(exState(rec, key).takes.take && exState(rec, key).takes.take.mediaId);

  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return !!(a.attempt1 && a.attempt1.mediaId) && !!(a.attempt2 && a.attempt2.mediaId) && !!(a.attempt3 && a.attempt3.mediaId)
      && cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    const hear = A(rec, "hear");
    if (hear.up && hear.down) out.twoNoteListening = true;
    if (recorded(rec, "matchA") && recorded(rec, "matchB")) out.individualMatching = true; // no self-assessment question on these two
    if (exDone(rec, "up") && exDone(rec, "down")) out.twoNoteTransition = true;
    if (exDone(rec, "slow")) out.slowTransition = true;
    if (exDone(rec, "ascend")) out.ascending = true;
    if (exDone(rec, "descend")) out.descending = true;
    if (exDone(rec, "threeUp") && exDone(rec, "threeDown")) out.threeNoteMovement = true;
    if (exDone(rec, "skipUp") && exDone(rec, "skipDown")) out.skippedNote = true;
    if ((A(rec, "rhythm").take || {}).mediaId) out.rhythmTransition = true;
    if (exDone(rec, "breath")) out.breathTransition = true;
    if (A(rec, "listen").classification) out.listeningId = true;
    const ba = A(rec, "beforeafter");
    if ((ba.attempt2 || {}).mediaId && ba.assess) out.beforeAfter = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function progressionStrip(current) {
    const steps = ["MATCH", "STABILIZE", "MOVE", "ARRIVE", "STABILIZE"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em] ${current && current.includes(s) ? "!bg-gold-500/15 !text-gold-300" : ""}">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function problems() {
    const items = [
      ["“I jump instead of moving smoothly.”", `<p class="mb-2">Try two closer notes, sing more softly, or slow down — or return to the individual-note exercise above.</p>`],
      ["“I can't reach the second note.”", `<p>Choose a smaller interval, check the reference note again, and don't push the voice.</p>`],
      ["“I overshoot the second note.”", `<p>Listen to the second reference note again and approach it gently — don't increase volume.</p>`],
      ["“My throat becomes tense.”", `<p>Return to <a href="#/classes/L1C08" class="text-gold-300 underline">Class 8 — Vocal Relaxation</a>, then try again with a smaller interval.</p>`],
      ["“Descending feels harder.”", `<p>This is common. Practise 3 → 2, then 2 → 1, before attempting larger movements.</p>`],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([q, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${q}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <div class="text-sm text-ink-300 leading-relaxed mt-3">${a}</div>
      </details>`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["twoNoteListening", "individualMatching", "twoNoteTransition", "slowTransition", "ascending", "descending", "threeNoteMovement", "skippedNote", "rhythmTransition", "breathTransition", "listeningId"].filter((k) => c[k]).length;
    return [
      [`Transition exercises (${ex}/11)`, ex === 11],
      ["Before/after recording", !!c.beforeAfter],
      ["Self-evaluation", !!c.selfEval],
      ["Reflected", !!c.reflection],
      ["Completed the assignment", !!c.assignment],
    ];
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 13 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 leading-tight">FROM NOTE <span class="text-gold-300">→</span> TO NOTE</p>
        <p class="text-sm text-ink-300 mt-4">You've learned to match a note. You've learned to stabilize a note.</p>
        <p class="text-sm text-ink-100">Now you're learning to connect notes.</p>
        ${progressionStrip()}
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can now begin connecting notes.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll learn how changing volume affects your singing.` : "Next, we'll learn how changing volume affects your singing."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Move between notes without losing control.</h3>
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
    const hear = A(rec, "hear");
    const rhythm = A(rec, "rhythm");
    const listen = A(rec, "listen");
    const beforeafter = A(rec, "beforeafter");
    const refl = A(rec, "reflection");
    const uploads = Store.getClassProgress(cls.id).uploads || [];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Move from one note to another without losing control", `
          ${p("Singing isn't only about producing individual notes — melodies require moving note → note → note. A beginner may experience a sudden jump, too large a slide, loss of pitch, tension, a breath interruption, or an unstable arrival.")}
          ${p("The goal isn't to eliminate every natural movement in the voice. The goal is <strong class=\"text-ink-100\">controlled movement between nearby notes</strong>.")}
          ${PitchVisualizer.illustration()}
        `)}

        ${chapter("understand", 2, "Smooth does not mean slow", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Smooth does not mean slow.”</p>
            <p class="text-sm text-ink-200">A transition can be quick and clean, or slow and controlled — you'll eventually do both. For now, begin with small, comfortable intervals. Don't attempt large jumps.</p>
          </div>
          ${progressionStrip(["MOVE", "ARRIVE"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("setup", 3, "Choose your reference note", `
          ${narrow(p("Pick a comfortable starting note — nearby notes will build from it. You can change this any time."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${VirtualPiano.render("st-piano", { controls: false, keyboard: true, display: true })}
          </div>
          <div class="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
            <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Starting note</span>
            <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
            <span class="text-xs text-ink-400" data-base-pair>Working pair: ${N(b)} → ${N(b + STEP)}</span>
          </div>
        `, { wide: true })}

        ${chapter("hear", 4, "Exercise 1 — Hear the two notes", `
          ${narrow(`
            ${p("Listen to the pair, then judge the direction.")}
            <div class="flex flex-wrap gap-3 mb-5">
              <button type="button" data-play-pair="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play ${N(b)} → ${N(b + STEP)}</button>
              <button type="button" data-play-pair="down" class="vr-btn">${icon("play", "w-4 h-4")} Play ${N(b + STEP)} → ${N(b)}</button>
            </div>
          `)}
          <div class="grid sm:grid-cols-2 gap-4">
            <div>${SelfAssessment.render("st-hear-up", { ...DIRECTION_ASSESS("higher"), selected: hear.up || null })}</div>
            <div>${SelfAssessment.render("st-hear-down", { ...DIRECTION_ASSESS("lower"), selected: hear.down || null })}</div>
          </div>
        `)}

        ${chapter("hear", 5, "Exercise 2 — Match each note separately", `
          ${narrow(p("Before transitioning, make sure you can match both notes on their own: Note A, then Note B."))}
          <div class="grid sm:grid-cols-2 gap-4">
            ${PitchMatchExercise.render("st-matchA", matchEx("A", b))}
            ${PitchMatchExercise.render("st-matchB", matchEx("B", b + STEP))}
          </div>
          ${p("Note A ↓ Note B — before Note A → Note B.")}
        `)}

        ${chapter("transition", 6, "Exercise 3 — Two-note transition", `
          <div class="grid lg:grid-cols-2 gap-4">${PitchMatchExercise.render("st-up", EX.up())}${PitchMatchExercise.render("st-down", EX.down())}</div>
        `)}

        ${chapter("transition", 7, "Exercise 4 — Slow transition", `
          ${narrow(p("Deliberately slow this time — just to hear the distance between the notes. Not an exaggerated slide. Then return to a normal transition whenever you like."))}
          ${PitchMatchExercise.render("st-slow", EX.slow())}
        `)}

        ${chapter("clean", 8, "Exercise 5 — Clean note-to-note movement", `
          ${narrow(p("Start the first note, move toward the second, arrive, stabilise briefly, then stop. A controlled transition, not a random pitch movement."))}
          ${PitchMatchExercise.render("st-clean", EX.clean())}
          <div class="mt-4" data-st-clean-viz></div>
        `)}

        ${chapter("ascend", 9, "Exercise 6 — Ascending transitions", `
          ${narrow(p("Nearby notes, moving upward. You don't need all of them if it's uncomfortable — stop any time."))}
          ${PitchMatchExercise.render("st-ascend", EX.ascend())}
        `)}

        ${chapter("descend", 10, "Exercise 7 — Descending transitions", `
          ${narrow(p("Reverse the direction. Descending can feel different from ascending — notice what happens, without forcing the voice."))}
          ${PitchMatchExercise.render("st-descend", EX.descend())}
        `)}

        ${chapter("patterns", 11, "Exercise 8 — Three-note movement", `
          ${narrow(p("Move, arrive, stabilise, move again — keeping the range small."))}
          <div class="grid lg:grid-cols-2 gap-4">${PitchMatchExercise.render("st-threeUp", EX.three.up())}${PitchMatchExercise.render("st-threeDown", EX.three.down())}</div>
        `)}

        ${chapter("patterns", 12, "Exercise 9 — Skip a note", `
          ${narrow(p("A slightly larger distance. Don't force it — if it's uncomfortable, return to the nearby-note exercises above."))}
          <div class="grid lg:grid-cols-2 gap-4">${PitchMatchExercise.render("st-skipUp", EX.skip.up())}${PitchMatchExercise.render("st-skipDown", EX.skip.down())}</div>
        `)}

        ${chapter("rhythm", 13, "Exercise 10 — Transition with rhythm", `
          ${narrow(p("Connecting Class 6: three notes, one per beat, then a rest. Coordinate pitch, transition and timing together."))}
          <div data-rhythm-guide-host></div>
          <div class="mt-4">${RecordingCard.render("st-rhythm", { title: "Sing the pattern in time", hint: "With the guide running.", maxSeconds: 15, section: false })}</div>
        `)}

        ${chapter("breath", 14, "Exercise 11 — Transition with breath", `
          ${narrow(`
            ${p("Connecting Class 11: take a comfortable breath, sing the phrase, move between notes, and finish naturally. Not a bigger breath — a comfortable one.")}
            <div class="flex justify-center my-5"><div class="breathe-circle !w-20 !h-20" data-breath-circle></div></div>
          `)}
          ${PitchMatchExercise.render("st-breath", EX.breath())}
        `)}

        ${chapter("listen", 15, "Exercise 12 — Listen and identify", `
          ${p("Pick one of your own takes from today and classify what you hear — this builds listening ability, not just visual feedback.")}
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            ${uploads.length ? `
              <select data-listen-pick class="field mb-3">
                ${uploads.map((u) => `<option value="${u.mediaId}" ${listen.mediaId === u.mediaId ? "selected" : ""}>${Utils.escapeHtml(u.name)} · ${new Date(u.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</option>`).join("")}
              </select>
              <button type="button" data-listen-play class="vr-btn mb-4">${icon("play", "w-4 h-4")} Play</button>
              ${SelfAssessment.render("st-classify", { question: "What do you hear?", options: CLASSIFY_OPTIONS, selected: listen.classification || null })}
            ` : Components.EmptyState("mic", "Nothing to review yet", "Record a few of the exercises above, then come back to classify one here.")}
          </div>
        `)}

        ${chapter("listen", 16, "Before / after", `
          ${p("Record the same transition again, now that you've practised. There's no assumption the second attempt is better — just listen.")}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Attempt 1 — from Exercise 3</p>
            <button type="button" data-play-attempt1 class="vr-btn" ${exState(rec, "up").takes.take ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play</button>
            ${exState(rec, "up").takes.take ? "" : `<p class="text-xs text-ink-500 mt-2">Record the “up” transition in Exercise 3 first.</p>`}
          </div>
          ${RecordingCard.render("st-attempt2", { title: "Attempt 2 — same transition, now", hint: `${N(b)} → ${N(b + STEP)}`, maxSeconds: 10, section: false })}
          <div class="mt-4">${SelfAssessment.render("st-ba-assess", { question: BEFOREAFTER_ASSESS.question, options: BEFOREAFTER_ASSESS.options, selected: beforeafter.assess || null })}</div>
        `)}

        ${chapter("listen", 17, "Common beginner problems", problems())}

        ${chapter("evaluate", 18, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("st-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 19, "Practice timer — Note Transitions", `
          ${p("Short, focused repetitions — not long sessions. Logging a minute or two is plenty.")}
          ${Timer.render("st-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 20, `Class ${cls.number} Assignment`, `
          ${p("Choose three comfortable nearby notes (e.g. 1 → 2 → 3 → 2 → 1, from your reference note above).")}
          <div class="grid sm:grid-cols-3 gap-3 mb-5">
            ${RecordingCard.render("st-assign-1", { title: "Attempt 1", hint: "Listen to the reference, record naturally.", maxSeconds: 15, section: false })}
            ${RecordingCard.render("st-assign-2", { title: "Attempt 2", hint: "Smooth movement, relaxation, accurate arrival.", maxSeconds: 15, section: false })}
            ${RecordingCard.render("st-assign-3", { title: "Attempt 3 — with metronome", hint: "Same pattern, in time.", maxSeconds: 15, section: false })}
          </div>
          <div data-assign-guide-host></div>
          <p class="text-xs text-ink-500 mt-4">Answer the nine questions in Reflection, just below.</p>
        `)}

        ${chapter("reflect", 21, "Reflection", `
          ${p("These are the same nine questions as the assignment above, saved as you type — this is where \"Reflected\" is tracked.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="st-refl-${i}">${i + 1}. ${q}</label>
                <textarea id="st-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 22, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-st", { placeholder: "e.g. Ascending feels easier. I overshoot higher notes. Small intervals feel comfortable." })}
        `)}

        ${chapter("complete", 23, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 24, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
        if (k === "reflection") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- reference note piano ---- */
    const controllers = {};
    const r0 = range();
    own(VirtualPiano.wire(container, "st-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > r0.to - 4 * STEP) { $("[data-base-pair]").textContent = `Choose a lower note so the patterns stay comfortable.`; return; }
        set("setup", "note", midi);
        const b = midi;
        $("[data-base-note]").textContent = N(b);
        $("[data-base-pair]").textContent = `Working pair: ${N(b)} → ${N(b + STEP)}`;
        Object.values(controllers).forEach((c) => c.refresh());
      },
    }));

    /* ---- Exercise 1: hear the two notes ---- */
    function onPlayPair(e) {
      const btn = e.target.closest("[data-play-pair]");
      if (!btn) return;
      const b = base();
      const notes = btn.dataset.playPair === "up" ? [b, b + STEP] : [b + STEP, b];
      PianoSynth.playSequence(notes, { duration: 0.9, gap: 0.25 });
    }
    container.addEventListener("click", onPlayPair);
    cleanups.push(() => container.removeEventListener("click", onPlayPair));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "st-hear-up": (v) => { set("hear", "up", v); syncCheckpoints(); refreshLive(); },
      "st-hear-down": (v) => { set("hear", "down", v); syncCheckpoints(); refreshLive(); },
      "st-classify": (v) => { set("listen", "classification", v); syncCheckpoints(); refreshLive(); },
      "st-ba-assess": (v) => { set("beforeafter", "assess", v); syncCheckpoints(); refreshLive(); },
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      assessMap[name](chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- Exercise 2: match A / B separately ---- */
    controllers.matchA = own(PitchMatchExercise.wire(container, "st-matchA", matchEx("A", base()), {
      classId, exerciseId: "matchA", state: (rec0().answers.exercises || {}).matchA || {},
      getNotes: () => [base()], isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
      onState: (s) => { set("exercises", "matchA", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    controllers.matchB = own(PitchMatchExercise.wire(container, "st-matchB", matchEx("B", base() + STEP), {
      classId, exerciseId: "matchB", state: (rec0().answers.exercises || {}).matchB || {},
      getNotes: () => [base() + STEP], isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
      onState: (s) => { set("exercises", "matchB", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercises 3-9: transitions (shared wiring helper) ---- */
    function wireTransition(key, cfg, getNotes) {
      controllers[key] = own(PitchMatchExercise.wire(container, `st-${key}`, cfg, {
        classId, exerciseId: key, state: (rec0().answers.exercises || {})[key] || {},
        getNotes, isComplete: cfg.isComplete,
        onState: (s) => { set("exercises", key, s); syncCheckpoints(); refreshLive(); },
        onRecorded: () => ClassActivity.bump(classId, "recordings"),
        onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
      }));
    }
    wireTransition("up", EX.up(), () => [base(), base() + STEP]);
    wireTransition("down", EX.down(), () => [base() + STEP, base()]);
    wireTransition("slow", EX.slow(), () => [base(), base() + STEP]);
    wireTransition("clean", EX.clean(), () => [base(), base() + STEP]);
    wireTransition("ascend", EX.ascend(), () => [0, 1, 2, 3, 4].map((i) => base() + i * STEP));
    wireTransition("descend", EX.descend(), () => [4, 3, 2, 1, 0].map((i) => base() + i * STEP));
    wireTransition("threeUp", EX.three.up(), () => [0, 1, 2].map((i) => base() + i * STEP));
    wireTransition("threeDown", EX.three.down(), () => [2, 1, 0].map((i) => base() + i * STEP));
    wireTransition("skipUp", EX.skip.up(), () => [base(), base() + 2 * STEP]);
    wireTransition("skipDown", EX.skip.down(), () => [base() + 2 * STEP, base()]);
    wireTransition("breath", EX.breath(), () => [0, 1, 2].map((i) => base() + i * STEP));

    /* ---- Exercise 5 visualization (StabilityPanel, reused as-is) ---- */
    const cleanPanel = $("[data-st-clean-viz]");
    if (cleanPanel) {
      cleanPanel.innerHTML = StabilityPanel.render("sp-clean", { title: "Estimated pitch (optional)" });
      own(StabilityPanel.wire(container, "sp-clean", {
        getTake: () => exState(rec0(), "clean").takes.take || null,
        chain: true,
        canReveal: () => !!exState(rec0(), "clean").takes.take,
        onRevealed: () => { set("viz", "clean", true); refreshLive(); },
      }));
    }

    /* ---- Exercise 10: rhythm ---- */
    let rhythmGuide = null;
    function rhythmBars() {
      const b = base();
      return [[{ t: N(b), midi: b }, { t: N(b + STEP), midi: b + STEP }, { t: N(b + 2 * STEP), midi: b + 2 * STEP }, { t: "", rest: true }]];
    }
    function mountRhythmGuide() {
      const host = $("[data-rhythm-guide-host]");
      if (!host) return;
      if (rhythmGuide) rhythmGuide.destroy();
      const bars = rhythmBars();
      host.innerHTML = BeatGuide.render("st-bg-rhythm", { bars, guideToggle: true });
      rhythmGuide = BeatGuide.wire(container, "st-bg-rhythm", { bpm: BPM, loops: 2, bars, getNote: base });
    }
    mountRhythmGuide();
    cleanups.push(() => { if (rhythmGuide) rhythmGuide.destroy(); });
    own(RecordingCard.wire(container, "st-rhythm", {
      classId, take: A(rec0(), "rhythm").take || null, maxSeconds: 15,
      meta: { name: "Transition — rhythm exercise", exercise: "transition-rhythm" },
      onSaved: (take) => { set("rhythm", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 11: breath circle (visual only, matches Class 12/7's pattern) ---- */
    const bc = $("[data-breath-circle]");
    if (bc) bc.classList.add("is-running");

    /* ---- Exercise 12: listen and identify (own takes) ---- */
    const listenPick = $("[data-listen-pick]");
    if (listenPick) listenPick.addEventListener("change", () => set("listen", "mediaId", listenPick.value));
    const listenPlay = $("[data-listen-play]");
    if (listenPlay) listenPlay.addEventListener("click", () => {
      const id = listenPick ? listenPick.value : (A(rec0(), "listen").mediaId);
      if (id) VoiceRecorder.play(id);
    });

    /* ---- Before/after ---- */
    const playAttempt1 = $("[data-play-attempt1]");
    if (playAttempt1) playAttempt1.addEventListener("click", () => {
      const take = exState(rec0(), "up").takes.take;
      if (take) VoiceRecorder.play(take.mediaId);
    });
    own(RecordingCard.wire(container, "st-attempt2", {
      classId, take: A(rec0(), "beforeafter").attempt2 || null, maxSeconds: 10,
      meta: { name: "Transition — attempt 2", exercise: "transition-before-after" },
      onSaved: (take) => { set("beforeafter", "attempt2", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- self-evaluation ---- */
    cleanups.push(ControlCheck.wire(container, "st-eval", {
      onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "st-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment: 3 attempts + metronome guide + 9 answers ---- */
    let assignGuide = null;
    function assignBars() {
      const b = base();
      return [[{ t: N(b), midi: b }, { t: N(b + STEP), midi: b + STEP }, { t: N(b + 2 * STEP), midi: b + 2 * STEP }, { t: N(b + STEP), midi: b + STEP }]];
    }
    function mountAssignGuide() {
      const host = $("[data-assign-guide-host]");
      if (!host) return;
      if (assignGuide) assignGuide.destroy();
      const bars = assignBars();
      host.innerHTML = BeatGuide.render("st-bg-assign", { bars, guideToggle: true });
      assignGuide = BeatGuide.wire(container, "st-bg-assign", { bpm: BPM, loops: 1, bars, getNote: base });
    }
    mountAssignGuide();
    cleanups.push(() => { if (assignGuide) assignGuide.destroy(); });
    own(RecordingCard.wire(container, "st-assign-1", {
      classId, take: A(rec0(), "assignment").attempt1 || null, maxSeconds: 15,
      meta: { name: "Transition assignment — attempt 1", exercise: "transition-assign-1" },
      onSaved: (take) => { set("assignment", "attempt1", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "st-assign-2", {
      classId, take: A(rec0(), "assignment").attempt2 || null, maxSeconds: 15,
      meta: { name: "Transition assignment — attempt 2", exercise: "transition-assign-2" },
      onSaved: (take) => { set("assignment", "attempt2", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "st-assign-3", {
      classId, take: A(rec0(), "assignment").attempt3 || null, maxSeconds: 15,
      meta: { name: "Transition assignment — attempt 3 (metronome)", exercise: "transition-assign-3" },
      onSaved: (take) => { set("assignment", "attempt3", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- reflection, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => { set("reflection", ta.dataset.reflection, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-st", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(r[0]) ? r[0] : "A melody is made of individual notes, but good singing also needs controlled movement between them.",
        struggled: r[1] || "",
        toPractice: r[8] || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q}: ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
