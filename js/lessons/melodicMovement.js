/* ============================================================
   CLASS 20 — MELODIC MOVEMENT & CONTROLLED RANGE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "melodic-movement".

   Core idea: "Learn to move between notes while keeping the voice
   comfortable, stable and controlled." This is NOT a vocal-range
   competition — never encourage finding a highest or lowest note.
   "Comfort first. Range comes later." CONTROLLED MOVEMENT, not
   MAXIMUM RANGE.

   The optional Warm-up prompt at the top of this page is NOT new
   code here — every interactive lesson already renders it via
   `LessonKit.header()` -> `WarmupPrompt.classCard(cls)` (Common ->
   Warm-up, unlocked once Classes 1-9 are done, built in a separate
   session). Class 20 simply inherits it automatically, exactly as
   Classes 11-19 already do; "Exercise 25 item 2 — Warm-up
   offered/completed" is satisfied by that same card being present,
   so no new warm-up UI is built in this file.

   Degrees (whole steps, the Class 9+ convention): comfortable
   small movements only, max 3 steps (a fourth) from the reference
   note — never an extreme interval.

   Flow: understand -> listen to upward movement -> hum upward ->
   downward movement -> up and down -> small intervals -> match the
   destination -> connect two notes -> step vs skip -> melodic
   pattern (Class 19) -> range awareness -> range map -> dynamics
   during movement (Class 14) -> rhythm + movement (Class 6) ->
   movement into a phrase (Classes 16-18, the main integration
   exercise) -> three-take recording -> identify the difficult
   movement -> slow practice -> common problems -> self-evaluate ->
   practice -> assignment -> milestone.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard (Class 5), the full Metronome widget (Class 6),
   ControlCheck (Class 9+). No shared component needed changes —
   this class is built entirely from existing engines.

   `LessonKit.nextClass()` resolves to whatever is next in the data
   at the time this class is completed — Class 21 "Vocal
   Coordination & Longer Melodic Patterns" once it exists, or
   Level 2's first real class before that. No hard-coded link here.
   ============================================================ */

const MelodicMovementLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "ascend", label: "Ascend" },
    { id: "descend", label: "Descend" },
    { id: "updown", label: "Up & Down" },
    { id: "interval", label: "Intervals" },
    { id: "destination", label: "Destination" },
    { id: "stepskip", label: "Step/Skip" },
    { id: "pattern", label: "Pattern" },
    { id: "range", label: "Range" },
    { id: "connect", label: "Connect" },
    { id: "integrate", label: "Integrate" },
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
  const PRACTICE_CATEGORY = "Melodic Movement";
  const MAX_DEGREE = 3;
  const UP_SMALL = [0, 1], UP_MED = [0, 2], UP_LARGE = [0, 3];
  const DOWN_MED = [2, 1, 0], DOWN_LARGE = [3, 2, 1, 0];
  const UP_DOWN_MAIN = [0, 1, 2, 1, 0];
  const UP_DOWN_EXT = [0, 2, 1, 3, 2, 1, 0];
  const STEP_PAIR = [0, 1], SKIP_PAIR = [0, 2];
  const PATTERN_MAIN = [0, 1, 2, 1, 0], PATTERN_ALT = [0, 2, 3, 2, 0];
  const DEST_PAIR = [0, 3];
  const CONNECT_PAIR = [0, 1];
  const SYLLABLE = "la";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmupOffered", label: "Warm-up offered/completed" },
    { key: "ascendingMovement", label: "Ascending movement completed" },
    { key: "descendingMovement", label: "Descending movement completed" },
    { key: "upDownMovement", label: "Up/down movement completed" },
    { key: "intervalAwareness", label: "Interval awareness completed" },
    { key: "destinationMatching", label: "Destination matching completed" },
    { key: "connectedNoteEx", label: "Connected-note exercise completed" },
    { key: "stepVsSkip", label: "Step vs skip completed" },
    { key: "melodicPatternEx", label: "Melodic pattern completed" },
    { key: "comfortableAreaEx", label: "Comfortable-area exploration completed" },
    { key: "rangeMapEx", label: "Range map completed" },
    { key: "dynamicsEx", label: "Dynamics exercise completed" },
    { key: "rhythmEx", label: "Rhythm exercise completed" },
    { key: "phraseIntegrationEx", label: "Phrase integration completed" },
    { key: "threeTakeRecording", label: "Three-take recording completed" },
    { key: "difficultMovementId", label: "Difficult movement identified" },
    { key: "slowPracticeEx", label: "Slow practice completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const YMN = YMNU.slice(0, 3);
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    largerMovement: { question: "Which movement was larger?", options: [opt("12", "1 → 2"), opt("13", "1 → 3"), opt("14", "1 → 4"), opt("unsure", "Not sure")] },
    descendFeel: { question: "Does descending feel easier or harder than ascending?", options: [opt("easier", "Easier", "good"), opt("harder", "Harder", "maybe"), opt("same", "About the same", "neutral"), opt("unsure", "Not sure")] },
    heardIntervals: { question: "Could you hear the difference between these intervals?", options: YMNU },
    connected: { question: "Did the movement feel connected?", options: YMN },
    stepOrSkipA: { question: "Example A — step or skip?", options: [opt("step", "Step"), opt("skip", "Skip"), opt("unsure", "Not sure")] },
    stepOrSkipB: { question: "Example B — step or skip?", options: [opt("step", "Step"), opt("skip", "Skip"), opt("unsure", "Not sure")] },
    comfortHigher: { question: "Comfortable?", options: [opt("yes", "Yes", "good"), opt("borderline", "Borderline", "maybe"), opt("no", "No", "maybe")] },
    comfortLower: { question: "Comfortable?", options: [opt("yes", "Yes", "good"), opt("borderline", "Borderline", "maybe"), opt("no", "No", "maybe")] },
    difficultMovement: { question: "Which movement was most difficult today?", options: ["Ascending", "Descending", "Small interval", "Larger interval", "Starting note", "Ending note", "Rhythm", "Words", "Breath", "Not sure"].map((o) => opt(o.toLowerCase().replace(/\s+/g, "-"), o)) },
  };
  const TAKE3_OPTIONS = [opt("1", "Take 1"), opt("2", "Take 2"), opt("3", "Take 3"), opt("unsure", "Not sure")];
  const TAKE3_Q = {
    bestOverall: { question: "Which take felt best?", options: TAKE3_OPTIONS },
    mostStable: { question: "Which take sounded most stable?", options: TAKE3_OPTIONS },
    smoothest: { question: "Which take had the smoothest movement?", options: TAKE3_OPTIONS },
    mostComfortable: { question: "Which take felt most comfortable?", options: TAKE3_OPTIONS },
  };

  const CHECK_ROWS = [
    { key: "upward", area: "Upward movement", question: "Could I move upward comfortably?", levels: YMN_LEVELS },
    { key: "downward", area: "Downward movement", question: "Could I move downward comfortably?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Could I reach the destination note?", levels: YMN_LEVELS },
    { key: "transitions", area: "Transitions", question: "Could I connect the notes?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Could I maintain timing?", levels: YMN_LEVELS },
    { key: "comfort", area: "Comfort", question: "Did my throat and body remain relaxed?", levels: YMN_LEVELS },
    { key: "control", area: "Control", question: "Could I repeat the pattern?", levels: YMN_LEVELS },
    { key: "rangeAwareness", area: "Range awareness", question: "Did I recognize my comfortable area?", levels: YMN_LEVELS },
  ];

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const DEST_EX = {
    eyebrow: "Exercise 6 · Destination", title: "Start → destination",
    intro: "Listen to the starting note, then the destination note. Then hum from the start toward the destination.",
    chain: true, refLabel: "Reference notes",
    slots: [{ key: "take", label: "Your movement", hint: "Start, then arrive at the destination" }],
    assessment: { question: "Did you arrive at the destination note?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };
  const CONNECT_EX = {
    eyebrow: "Exercise 7 · Connect", title: "Note 1 → Note 2, on “oo” or “ah”",
    intro: "Avoid breaking the sound unnecessarily, pushing the second note, changing volume dramatically, or tightening the throat.",
    chain: true, refLabel: "Reference notes",
    slots: [{ key: "take", label: "Your connected movement", hint: "One smooth gesture" }],
    assessment: Q.connected,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };
  const PHRASE_EX = {
    eyebrow: "Exercise 14 · Movement into a phrase", title: "1 → 2 → 3 → 2 → 1, with words",
    intro: `Connecting Classes 16–18. Simple syllables (“${SYLLABLE}”) — combine pitch, movement, rhythm, breath, diction, phrase shape and dynamics, all at once.`,
    chain: true, refLabel: "Reference phrase",
    slots: [{ key: "take", label: "Your phrase", hint: `“${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}”` }],
    assessment: { question: "Did the movement, rhythm and words feel comfortably combined?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 19 -> 18 -> 17 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c19 = (ClassActivity.get("L1C19").answers.setup || {}).note;
    if (ok(c19)) return c19;
    const c18 = (ClassActivity.get("L1C18").answers.setup || {}).note;
    if (ok(c18)) return c18;
    const c17 = (ClassActivity.get("L1C17").answers.setup || {}).note;
    if (ok(c17)) return c17;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  const ASSIGN_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    out.warmupOffered = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (q(rec, "largerMovement") && take(rec, "humUp")) out.ascendingMovement = true;
    if (take(rec, "humDown") && q(rec, "descendFeel")) out.descendingMovement = true;
    if (take(rec, "upDown")) out.upDownMovement = true;
    if (q(rec, "heardIntervals")) out.intervalAwareness = true;
    if (DEST_EX.isComplete(exState(rec, "dest"))) out.destinationMatching = true;
    if (CONNECT_EX.isComplete(exState(rec, "connect"))) out.connectedNoteEx = true;
    if (q(rec, "stepOrSkipA") && q(rec, "stepOrSkipB") && take(rec, "stepSkipSing")) out.stepVsSkip = true;
    if (take(rec, "melodicPattern")) out.melodicPatternEx = true;
    if (q(rec, "comfortHigher") && q(rec, "comfortLower")) out.comfortableAreaEx = true;
    const rangeMap = A(rec, "rangeMap");
    if (filled(rangeMap.low) && filled(rangeMap.mid) && filled(rangeMap.high)) out.rangeMapEx = true;
    if (take(rec, "dynMovement")) out.dynamicsEx = true;
    if (take(rec, "rhythmMovement")) out.rhythmEx = true;
    if (PHRASE_EX.isComplete(exState(rec, "phrase"))) out.phraseIntegrationEx = true;
    if (["take1", "take2", "take3"].every((k) => take(rec, k))) out.threeTakeRecording = true;
    if (q(rec, "difficultMovement")) out.difficultMovementId = true;
    if (take(rec, "slowPractice")) out.slowPracticeEx = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function problems() {
    const items = [
      ["“Higher notes become louder.”", "Don't push. Reduce volume. Return to a lower comfortable starting note."],
      ["“My throat feels tight.”", "Stop the exercise. Relax. Return to comfortable humming. If discomfort persists, stop the session."],
      ["“I miss the destination note.”", "Use the Virtual Piano. Play the destination. Listen. Then try again."],
      ["“I slide between notes unintentionally.”", "Practise the starting note, a pause, then the destination note. Gradually reconnect them."],
      ["“Descending feels unstable.”", "Practise the descending pattern separately. Slow down."],
      ["“I can do it slowly but not at normal speed.”", "Keep practising slowly. Speed is not the objective yet."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["START", "MOVE", "DESTINATION", "RETURN"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 20 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">MOVE — DON'T FORCE</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">Your range is not a number you need to chase.</p>
        <p class="text-sm text-ink-100">Your control is more important than your highest note.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["ascendingMovement", "descendingMovement", "upDownMovement", "intervalAwareness", "destinationMatching", "connectedNoteEx", "stepVsSkip", "melodicPatternEx", "comfortableAreaEx", "rangeMapEx", "dynamicsEx", "rhythmEx", "phraseIntegrationEx", "threeTakeRecording", "difficultMovementId", "slowPracticeEx"].filter((k) => c[k]).length;
    return [
      [`Movement exercises (${ex}/16)`, ex === 16],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You don't need a huge range to become a good singer — you need to control the notes you can comfortably sing. You can move upward and downward without forcing, and identify a difficult movement to practise separately.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">${next.levelId > cls.levelId ? `Level ${next.levelId} — ` : `Class ${next.number} — `}${next.title}</strong>, we'll keep building on the coordination, pitch movement and comfort you've developed so far.` : "More is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Move between notes without forcing your voice.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            ${bridge}
            ${next ? `
            <div class="mt-6">
              <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next</p>
              <p class="font-display text-lg text-ink-50 mb-4">${next.levelId > cls.levelId ? `Level ${next.levelId} — ${APP_DATA.LEVELS.find((l) => l.id === next.levelId).title}` : `Class ${next.number}`} · ${next.title}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue ${icon("arrowRight", "w-3.5 h-3.5")}</a>
                <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
              </div>
            </div>` : `<p class="text-sm text-ink-500 mt-6">More is on its way.</p>`}
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
    const rangeMap = A(rec, "rangeMap");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Move between notes without forcing your voice", `
          ${p("Singing is movement — up, down, across, between notes. Today's goal is to make those movements comfortably. You do <strong class=\"text-ink-100\">not</strong> need a large vocal range — a smaller range with good control is more valuable at this stage.")}
          ${p("This is <strong class=\"text-ink-100\">not</strong> a vocal-range competition. We are not looking for your highest or lowest note.")}
        `)}

        ${chapter("understand", 2, "Comfort first. Range comes later.", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Comfort first. Range comes later.”</p>
            <p class="text-sm text-ink-200">Never push to reach a note. If a note feels uncomfortable, stop, and move the exercise into a comfortable range. Don't force the throat, don't increase volume to reach a higher note, and don't try to imitate advanced vocal techniques.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("ascend", 3, "Exercise 1 — Listen to upward movement", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every exercise in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("mm-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="up12" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2</button>
            <button type="button" data-play-move="up13" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3</button>
            <button type="button" data-play-move="up14" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 4</button>
          </div>
          ${SelfAssessment.render("largerMovement-q", { ...Q.largerMovement, selected: sel("largerMovement") })}
        `, { wide: true })}

        ${chapter("ascend", 4, "Exercise 2 — Hum upward", `
          ${narrow(p("Hum “mmm” upward: 1 → 2, then 1 → 2 → 3, then 1 → 2 → 3 → 2 → 1. Keep the range small — focus on smooth movement, stable pitch, relaxation, and no pushing."))}
          ${recCard("humUp", "Hum the ascending pattern", "1 → 2 → 3 → 2 → 1", 10)}
        `)}

        ${chapter("descend", 5, "Exercise 3 — Downward movement", `
          ${narrow(p("Now reverse: 3 → 2 → 1, then 4 → 3 → 2 → 1."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="down321" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 3 → 2 → 1</button>
            <button type="button" data-play-move="down4321" class="vr-btn">${icon("play", "w-4 h-4")} 4 → 3 → 2 → 1</button>
          </div>
          ${recCard("humDown", "Hum the descending pattern", "3 → 2 → 1", 10)}
          <div class="mt-4">${SelfAssessment.render("descendFeel-q", { ...Q.descendFeel, selected: sel("descendFeel") })}</div>
          <p class="text-xs text-ink-500 mt-2">This is awareness only — not a diagnosis.</p>
        `)}

        ${chapter("updown", 6, "Exercise 4 — Up and down", `
          ${flowStrip(["UP", "DOWN", "RETURN"])}
          ${narrow(p("The main pattern: 1 → 2 → 3 → 2 → 1. An optional, slightly wider version: 1 → 3 → 2 → 4 → 3 → 2 → 1 — try it only if the main pattern feels easy."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="updown-main" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the main pattern</button>
            <button type="button" data-play-move="updown-ext" class="vr-btn">${icon("play", "w-4 h-4")} Play the wider pattern</button>
          </div>
          ${recCard("upDown", "Sing the main pattern", "1 → 2 → 3 → 2 → 1", 10)}
          <div class="mt-3">${recCard("upDownExt", "Optional — the wider pattern", "1 → 3 → 2 → 4 → 3 → 2 → 1", 12)}</div>
        `)}

        ${chapter("interval", 7, "Exercise 5 — Small intervals", `
          ${narrow(p("An interval is simply the distance between two notes. 1 → 2 is a small interval; 1 → 4 is larger. Listen to the difference, then sing whichever feels comfortable."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="up12" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 2</button>
            <button type="button" data-play-move="up13" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3</button>
            <button type="button" data-play-move="up14" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 4</button>
          </div>
          ${SelfAssessment.render("heardIntervals-q", { ...Q.heardIntervals, selected: sel("heardIntervals") })}
          <div class="mt-4">${recCard("intervalSing", "Sing a comfortable interval of your choice", "Any of the three above.", 8)}</div>
        `)}

        ${chapter("destination", 8, "Exercise 6 — Match the destination", `
          ${narrow(p("Listen to the starting note, then the destination note. START → MOVEMENT → DESTINATION. Connecting Class 4 and Class 13."))}
          ${PitchMatchExercise.render("mm-dest", DEST_EX)}
        `)}

        ${chapter("destination", 9, "Exercise 7 — Connect two notes", `
          ${PitchMatchExercise.render("mm-connect", CONNECT_EX)}
        `)}

        ${chapter("stepskip", 10, "Exercise 8 — Step vs skip", `
          ${narrow(p("A STEP is a small movement (1 → 2). A SKIP is a larger one (1 → 3). Listen to each example and identify which is which."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Example A</p><button type="button" data-play-stepskip="a" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Example B</p><button type="button" data-play-stepskip="b" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 mb-4">
            <div>${SelfAssessment.render("stepOrSkipA-q", { ...Q.stepOrSkipA, selected: sel("stepOrSkipA") })}</div>
            <div>${SelfAssessment.render("stepOrSkipB-q", { ...Q.stepOrSkipB, selected: sel("stepOrSkipB") })}</div>
          </div>
          ${recCard("stepSkipSing", "Sing both — step, then skip", "", 8)}
        `)}

        ${chapter("pattern", 11, "Exercise 9 — Melodic pattern", `
          ${narrow(p("Connecting Class 19."))}
          ${flowStrip(["HEAR", "SING", "LISTEN", "REPEAT"])}
          ${recCard("melodicPattern", "1 → 2 → 3 → 2 → 1, repeated", "Only use a comfortable range.", 12)}
          <div class="mt-3">${recCard("melodicPatternAlt", "Optional — 1 → 3 → 4 → 3 → 1", "", 12)}</div>
        `)}

        ${chapter("range", 12, "Exercise 10 — Range awareness", `
          ${narrow(p(`“My comfortable singing range today.” Not your permanent vocal range — just today's comfortable area. Explore with the piano above: move slightly higher, then return; slightly lower, then return. If anything feels uncomfortable, stop and return to the previous comfortable note.`))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-explore="higher" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Explore slightly higher</button>
            <button type="button" data-explore="lower" class="vr-btn">${icon("play", "w-4 h-4")} Explore slightly lower</button>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>${SelfAssessment.render("comfortHigher-q", { ...Q.comfortHigher, selected: sel("comfortHigher") })}</div>
            <div>${SelfAssessment.render("comfortLower-q", { ...Q.comfortLower, selected: sel("comfortLower") })}</div>
          </div>
        `)}

        ${chapter("range", 13, "Exercise 11 — Range map (optional)", `
          ${narrow(p("Using the piano above, play a note, then mark it. This is today's comfortable area — not your “lowest note,” “highest note” or permanent vocal range. This may change from day to day."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-mark-range="low" class="vr-btn">Mark comfortable low</button>
            <button type="button" data-mark-range="mid" class="vr-btn">Mark comfortable middle</button>
            <button type="button" data-mark-range="high" class="vr-btn">Mark comfortable high</button>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 grid grid-cols-3 gap-3 text-center">
            <div><p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Low</p><p class="font-display text-xl text-ink-50" data-range-low>${rangeMap.low ? N(rangeMap.low) : "—"}</p></div>
            <div><p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Middle</p><p class="font-display text-xl text-ink-50" data-range-mid>${rangeMap.mid ? N(rangeMap.mid) : "—"}</p></div>
            <div><p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">High</p><p class="font-display text-xl text-ink-50" data-range-high>${rangeMap.high ? N(rangeMap.high) : "—"}</p></div>
          </div>
        `)}

        ${chapter("connect", 14, "Exercise 12 — Dynamics during movement", `
          ${narrow(p("Connecting Class 14. Sing 1 → 2 → 3 → 2 → 1 naturally, then try: slightly softer on the way up, comfortable at the peak, slightly softer on the way down. No loud peak required — the objective is controlled movement."))}
          ${recCard("dynMovement", "Sing the pattern with this gentle shape", "Subtle, never forced.", 10)}
        `)}

        ${chapter("connect", 15, "Exercise 13 — Rhythm + movement", `
          ${narrow(p("Connecting Class 6. One note per beat, then the same pattern with a simple rhythmic variation. Don't increase speed significantly."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("mm-metro", { bpm: BPM })}
          </div>
          ${recCard("rhythmMovement", "1 — 2 — 3 — 2 — 1, one note per beat", "", 10)}
        `, { wide: true })}

        ${chapter("integrate", 16, "Exercise 14 — Movement into a phrase", `
          ${p("This is the main integration exercise — combining everything so far.")}
          ${PitchMatchExercise.render("mm-phrase", PHRASE_EX)}
        `)}

        ${chapter("review", 17, "Exercise 15 — Record three takes", `
          ${p("Compare honestly — don't automatically pick the technically “best” one. Comfort matters.")}
          <div class="grid sm:grid-cols-3 gap-3 mb-4">
            ${recCard("take1", "Take 1 — natural", "", 10)}
            ${recCard("take2", "Take 2 — focus on smooth movement", "", 10)}
            ${recCard("take3", "Take 3 — focus on comfort and control", "", 10)}
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${Object.entries(TAKE3_Q).map(([k, cfg]) => `<div>${SelfAssessment.render(`${k}-q`, { ...cfg, selected: sel(k) })}</div>`).join("")}
          </div>
        `)}

        ${chapter("review", 18, "Exercise 16 — Identify the difficult movement", `
          ${SelfAssessment.render("difficultMovement-q", { ...Q.difficultMovement, selected: sel("difficultMovement") })}
          <p class="text-sm text-ink-300 mt-3">Return to that movement and practice it separately.</p>
        `)}

        ${chapter("review", 19, "Exercise 17 — Slow practice", `
          ${flowStrip(["SLOW", "ACCURATE", "COMFORTABLE", "NORMAL SPEED"])}
          ${narrow(p("Practise the difficult movement you identified, slowly. Don't rush toward fast repetition — speed isn't the objective yet."))}
          ${recCard("slowPractice", "Practice that movement, slowly", "", 10)}
        `)}

        ${chapter("review", 20, "Common beginner problems", problems())}

        ${chapter("evaluate", 21, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("mm-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 22, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused practice — repetition doesn't need to be excessive.")}
          ${Timer.render("mm-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 23, `Class ${cls.number} Assignment`, `
          ${p("Using a comfortable 5-note pattern (e.g. 1 → 2 → 3 → 2 → 1), complete six takes. You don't need to do all six in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Hum the pattern", "", 10)}
            ${recCard("t2", "Take 2 — Sing it on “AH”", "", 10)}
            ${recCard("t3", "Take 3 — Sing it on “OO”", "", 10)}
            ${recCard("t4", "Take 4 — With simple lyrics", "", 10)}
            ${recCard("t5", "Take 5 — Focus on smooth movement", "", 10)}
            ${recCard("t6", "Take 6 — Focus on comfort and relaxation", "", 10)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="mm-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="mm-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 24, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-mm", { placeholder: "e.g. Ascending is easier than descending. I lose pitch on larger movements. I feel comfortable in a small range." })}
        `)}

        ${chapter("complete", 25, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 26, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Exercises 1/3/5/7: movement playback ---- */
    const MOVES = { up12: UP_SMALL, up13: UP_MED, up14: UP_LARGE, down321: DOWN_MED, down4321: DOWN_LARGE, "updown-main": UP_DOWN_MAIN, "updown-ext": UP_DOWN_EXT };
    function onPlayMove(e) {
      const btn = e.target.closest("[data-play-move]");
      if (!btn) return;
      PianoSynth.playSequence(degreesToNotes(base(), MOVES[btn.dataset.playMove]), { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayMove);
    cleanups.push(() => container.removeEventListener("click", onPlayMove));

    /* ---- Exercise 8: step vs skip demo ---- */
    function onPlayStepSkip(e) {
      const btn = e.target.closest("[data-play-stepskip]");
      if (!btn) return;
      const degrees = btn.dataset.playStepskip === "a" ? STEP_PAIR : SKIP_PAIR;
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayStepSkip);
    cleanups.push(() => container.removeEventListener("click", onPlayStepSkip));

    /* ---- reference piano (shared by Exercises 1–9) ---- */
    let lastPianoNote = base();
    own(VirtualPiano.wire(container, "mm-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        lastPianoNote = midi;
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so every movement stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exDest.refresh(); exConnect.refresh(); exPhrase.refresh();
      },
    }));

    /* ---- Exercise 6: destination ---- */
    const exDest = own(PitchMatchExercise.wire(container, "mm-dest", DEST_EX, {
      classId, exerciseId: "dest", state: (rec0().answers.exercises || {}).dest || {},
      getNotes: () => degreesToNotes(base(), DEST_PAIR), isComplete: DEST_EX.isComplete,
      onState: (s) => { set("exercises", "dest", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 7: connect two notes ---- */
    const exConnect = own(PitchMatchExercise.wire(container, "mm-connect", CONNECT_EX, {
      classId, exerciseId: "connect", state: (rec0().answers.exercises || {}).connect || {},
      getNotes: () => degreesToNotes(base(), CONNECT_PAIR), isComplete: CONNECT_EX.isComplete,
      onState: (s) => { set("exercises", "connect", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 10: range-awareness exploration ---- */
    function onExplore(e) {
      const btn = e.target.closest("[data-explore]");
      if (!btn) return;
      const b = base();
      const dir = btn.dataset.explore === "higher" ? 1 : -1;
      PianoSynth.playSequence([b, b + dir * STEP, b], { duration: 0.55, gap: 0.15 });
    }
    container.addEventListener("click", onExplore);
    cleanups.push(() => container.removeEventListener("click", onExplore));

    /* ---- Exercise 11: range map ---- */
    function onMarkRange(e) {
      const btn = e.target.closest("[data-mark-range]");
      if (!btn) return;
      const key = btn.dataset.markRange;
      set("rangeMap", key, lastPianoNote);
      const out = $(`[data-range-${key}]`);
      if (out) out.textContent = N(lastPianoNote);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onMarkRange);
    cleanups.push(() => container.removeEventListener("click", onMarkRange));

    /* ---- Exercise 14: phrase integration ---- */
    const exPhrase = own(PitchMatchExercise.wire(container, "mm-phrase", PHRASE_EX, {
      classId, exerciseId: "phrase", state: (rec0().answers.exercises || {}).phrase || {},
      getNotes: () => degreesToNotes(base(), PATTERN_MAIN), isComplete: PHRASE_EX.isComplete,
      onState: (s) => { set("exercises", "phrase", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 13: metronome ---- */
    own(Metronome.wire(container, "mm-metro", { bpm: BPM }));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "largerMovement-q": "largerMovement", "descendFeel-q": "descendFeel", "heardIntervals-q": "heardIntervals",
      "stepOrSkipA-q": "stepOrSkipA", "stepOrSkipB-q": "stepOrSkipB", "comfortHigher-q": "comfortHigher",
      "comfortLower-q": "comfortLower", "difficultMovement-q": "difficultMovement",
      "bestOverall-q": "bestOverall", "mostStable-q": "mostStable", "smoothest-q": "smoothest", "mostComfortable-q": "mostComfortable",
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
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- all recordings ---- */
    const NAMES = {
      humUp: "Hum ascending", humDown: "Hum descending", upDown: "Up and down", upDownExt: "Up and down — wider",
      intervalSing: "Interval — comfortable choice", stepSkipSing: "Step then skip", melodicPattern: "Melodic pattern",
      melodicPatternAlt: "Melodic pattern — alternate", dynMovement: "Dynamics during movement", rhythmMovement: "Rhythm + movement",
      take1: "Three takes — natural", take2: "Three takes — smooth movement", take3: "Three takes — comfort and control",
      slowPractice: "Slow practice",
      t1: "Assignment — hum", t2: "Assignment — AH", t3: "Assignment — OO", t4: "Assignment — lyrics", t5: "Assignment — smooth movement", t6: "Assignment — comfort",
    };
    const MAX_SECONDS = {
      humUp: 10, humDown: 10, upDown: 10, upDownExt: 12, intervalSing: 8, stepSkipSing: 8, melodicPattern: 12, melodicPatternAlt: 12,
      dynMovement: 10, rhythmMovement: 10, take1: 10, take2: 10, take3: 10, slowPractice: 10,
      t1: 10, t2: 10, t3: 10, t4: 10, t5: 10, t6: 10,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 10,
        meta: { name: `Class 20 — ${NAMES[k]}`, exercise: `movement-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "mm-timer", {
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
    cleanups.push(ControlCheck.wire(container, "mm-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-mm", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "I don't need a huge range to become a good singer — I need to control the notes I can comfortably sing.",
        struggled: ans[2] || "",
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
