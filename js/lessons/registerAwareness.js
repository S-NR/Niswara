/* ============================================================
   CLASS 23 — REGISTER AWARENESS & VOICE CONNECTION (interactive lesson)

   Rendered by ClassDetailPage for interactive: "register-awareness".

   Core idea: "Understand how your voice can feel different across
   its range and learn to move between comfortable areas smoothly."
   AWARENESS BEFORE CONTROL — LISTEN -> NOTICE -> EXPLORE -> CONNECT.
   NOT a search for a permanent voice type, NOT belting, NOT chasing
   high or low notes. "Lower / middle / upper" are deliberately
   descriptive, non-permanent areas — never "chest/head/mixed,"
   never a classification like "you are a soprano."

   The optional Warm-up prompt needs no new code here either —
   every interactive lesson already renders it automatically via
   `LessonKit.header()` -> `WarmupPrompt.classCard(cls)`.

   This class explores BOTH directions from the reference note
   (unlike most earlier classes, which only moved upward), so its
   range clamp checks both bounds: base ± 3 whole steps must stay
   inside the comfortable piano range.

   One 5-note pattern (degrees 0-1-2-1-0, i.e. 1-2-3-2-1) carries
   most of the class, started from the reference note itself, or
   shifted one whole step lower/higher for the "lower -> middle"
   and "middle -> upper" exercises — small, comfortable shifts, not
   a search for range extremes.

   Flow: understand -> what does "register" mean -> comfortable
   range check -> notice the sensation -> gentle hum slide ->
   two-note connection -> three-note connection -> ng -> ah ->
   hum -> vowel -> lower -> middle -> lower -> middle -> upper ->
   middle -> listen for a break -> don't fix it by force ->
   connected glide -> note by note -> register + rhythm -> register
   + dynamics -> register + words -> record your transition -> find
   your comfort zone -> common problems -> self-evaluate -> practice
   -> assignment -> milestone.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard (Class 5), the full Metronome widget (Class 6),
   ControlCheck (Class 9+). The comfort-zone map reuses the same
   "tap a tile to cycle its label" interaction Class 18's visual
   phrase shaper introduced, applied here to three neutral areas
   (low/middle/upper) instead of phrase roles. No shared component
   needed changes — this class is built entirely from existing
   engines.
   ============================================================ */

const RegisterAwarenessLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "explore", label: "Explore" },
    { id: "glide", label: "Glide" },
    { id: "connect", label: "Connect" },
    { id: "vowel", label: "Vowel" },
    { id: "areas", label: "Areas" },
    { id: "break", label: "Break" },
    { id: "smooth", label: "Smooth" },
    { id: "rhythm", label: "Rhythm" },
    { id: "dynamics", label: "Dynamics" },
    { id: "words", label: "Words" },
    { id: "review", label: "Review" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const BPM = 68;
  const PRACTICE_TASK = "pitch";
  const PRACTICE_CATEGORY = "Register Awareness";
  const MAX_DEGREE = 3; // this class explores both above AND below the reference note
  const TWO_A = [0, 1], TWO_B = [1, 2], TWO_C = [2, 1], TWO_D = [1, 0]; // 1→2, 2→3, 3→2, 2→1
  const THREE_A = [0, 1, 2], THREE_B = [2, 1, 0], THREE_C = [0, 2, 1]; // 1→2→3, 3→2→1, 1→3→2
  const PATTERN5 = [0, 1, 2, 1, 0]; // 1→2→3→2→1
  const AREA_OFFSET = { lower: -2, middle: 0, upper: 2 }; // Exercise 1's lower/middle/upper demo, in whole steps
  const SLIGHT_SHIFT = { lower: -1, higher: 1 }; // Exercises 8/9's small shifts
  const WORD_PHRASE = ["I", "feel", "my", "voice", "move"]; // one word per PATTERN5 note
  const ZONE_STATES = ["", "Very comfortable", "Comfortable", "Needs attention", "Not comfortable"];
  const ZONE_KEYS = ["low", "middle", "upper"];
  const ZONE_LABELS = { low: "Low", middle: "Middle", upper: "Upper" };

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmup", label: "Warm-up completed/skipped" },
    { key: "comfortRangeExploration", label: "Comfort range exploration completed" },
    { key: "sensationAwareness", label: "Sensation awareness completed" },
    { key: "gentleHumSlide", label: "Gentle hum slide completed" },
    { key: "twoNoteConnection", label: "Two-note connection completed" },
    { key: "threeNoteConnection", label: "Three-note connection completed" },
    { key: "ngAh", label: "NG → AH completed" },
    { key: "humVowel", label: "Hum → vowel completed" },
    { key: "lowerMiddleEx", label: "Lower → middle exercise completed" },
    { key: "middleUpperEx", label: "Middle → upper exercise completed" },
    { key: "transitionAwareness", label: "Transition awareness completed" },
    { key: "nonForcePractice", label: "Non-force practice completed" },
    { key: "connectedGlide", label: "Connected glide completed" },
    { key: "noteByNoteEx", label: "Note-by-note exercise completed" },
    { key: "rhythmEx", label: "Rhythm exercise completed" },
    { key: "dynamicsEx", label: "Dynamics exercise completed" },
    { key: "wordIntegration", label: "Word integration completed" },
    { key: "recordingEx", label: "Recording completed" },
    { key: "comfortZoneMapping", label: "Comfort-zone mapping completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const YMN = YMNU.slice(0, 3);
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    comfortArea: { question: "Which area feels most comfortable?", options: [opt("lower", "Lower"), opt("middle", "Middle"), opt("upper", "Upper"), opt("unsure", "Not sure")] },
    sensationChanged: { question: "Did the sensation change?", options: [opt("yes", "Yes", "good"), opt("little", "A little", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    easiestTransition: { question: "Which transition felt easiest?", options: [opt("ah", "mmm → ah"), opt("oo", "mmm → oo"), opt("ee", "mmm → ee"), opt("unsure", "Not sure")] },
    staysConnected: { question: "Could you keep the sound connected?", options: YMN },
    noticedChange: { question: "Did you notice a change?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    whereChange: { question: "Where?", options: [opt("ascending", "Ascending"), opt("descending", "Descending"), opt("between", "Between two specific notes"), opt("unsure", "Not sure")] },
    wordsChanged: { question: "Did adding words change the transition?", options: [opt("yes", "Yes", "maybe"), opt("no", "No", "good"), opt("unsure", "Not sure")] },
    mostComfortableApproach: { question: "Which approach felt most comfortable?", options: [opt("natural", "Natural"), opt("slower", "Slower"), opt("softer", "Softer"), opt("hum", "Hum"), opt("unsure", "Not sure")] },
  };

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const HUM_VOWEL_EX = {
    eyebrow: "Exercise 7 · Hum → vowel", title: "“mmm,” opening into a vowel",
    intro: "mmm → ah, then mmm → oo, then mmm → ee. Stay in a comfortable range.",
    chain: false, refLabel: "Reference note",
    slots: [{ key: "toAh", label: "mmm → ah" }, { key: "toOo", label: "mmm → oo" }, { key: "toEe", label: "mmm → ee" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["toAh", "toOo", "toEe"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 22 -> 21 -> 20 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n - MAX_DEGREE * STEP >= RANGE.from && n + MAX_DEGREE * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c22 = (ClassActivity.get("L1C22").answers.setup || {}).note;
    if (ok(c22)) return c22;
    const c21 = (ClassActivity.get("L1C21").answers.setup || {}).note;
    if (ok(c21)) return c21;
    const c20 = (ClassActivity.get("L1C20").answers.setup || {}).note;
    if (ok(c20)) return c20;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
    return Math.max(RANGE.from + MAX_DEGREE * STEP, Math.min(RANGE.to - MAX_DEGREE * STEP, fallback));
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  const ASSIGN_KEYS = ["t1", "t2", "t3", "t4", "t5"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    out.warmup = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (q(rec, "comfortArea")) out.comfortRangeExploration = true;
    if (q(rec, "sensationChanged")) out.sensationAwareness = true;
    if (take(rec, "humSlide")) out.gentleHumSlide = true;
    if (take(rec, "twoNoteConnect")) out.twoNoteConnection = true;
    if (take(rec, "threeNoteConnect")) out.threeNoteConnection = true;
    if (take(rec, "ngAhTake")) out.ngAh = true;
    if (HUM_VOWEL_EX.isComplete(exState(rec, "humVowel")) && q(rec, "easiestTransition")) out.humVowel = true;
    if (take(rec, "lowerMiddleTake") && q(rec, "staysConnectedLower")) out.lowerMiddleEx = true;
    if (take(rec, "middleUpperTake")) out.middleUpperEx = true;
    if (q(rec, "noticedChange")) out.transitionAwareness = true;
    if (take(rec, "nonForceTake")) out.nonForcePractice = true;
    if (take(rec, "connectedGlideTake")) out.connectedGlide = true;
    if (take(rec, "separatedTake") && take(rec, "connectedTake")) out.noteByNoteEx = true;
    if (take(rec, "rhythmTake")) out.rhythmEx = true;
    if (take(rec, "dynamicsTake")) out.dynamicsEx = true;
    if (["wordsHum", "wordsVowel", "wordsFull"].every((k) => take(rec, k)) && q(rec, "wordsChanged")) out.wordIntegration = true;
    if (["transNatural", "transSlower", "transSofter", "transHum"].every((k) => take(rec, k)) && q(rec, "mostComfortableApproach")) out.recordingEx = true;
    const zone = A(rec, "comfortZone");
    if (ZONE_KEYS.every((k) => filled(zone[k]))) out.comfortZoneMapping = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  const CHECK_ROWS = [
    { key: "awareness", area: "Awareness", question: "Did I notice changes in my voice?", levels: YMN_LEVELS },
    { key: "comfort", area: "Comfort", question: "Could I move through the range comfortably?", levels: YMN_LEVELS },
    { key: "connection", area: "Connection", question: "Could I connect two notes smoothly?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Did I maintain reasonable pitch?", levels: YMN_LEVELS },
    { key: "relaxation", area: "Relaxation", question: "Did I avoid unnecessary tension?", levels: YMN_LEVELS },
    { key: "listening", area: "Listening", question: "Could I hear when the voice changed?", levels: YMN_LEVELS },
    { key: "control", area: "Control", question: "Could I adjust by slowing down or reducing range?", levels: YMN_LEVELS },
  ];

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const lyricLine = (words) => `<p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;

  function zoneTiles(zone) {
    return `<div class="grid grid-cols-3 gap-3" data-zone-tiles>
      ${ZONE_KEYS.map((k) => `
        <button type="button" data-zone-tile="${k}" class="rounded-2xl border border-white/10 bg-white/[0.03] py-6 text-center hover:bg-white/[0.06] transition-colors">
          <p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">${ZONE_LABELS[k]}</p>
          <p class="font-display text-sm text-ink-50" data-zone-label="${k}">${zone[k] || "Tap to mark"}</p>
        </button>`).join("")}
    </div>`;
  }

  function problems() {
    const items = [
      ["“My voice suddenly changes.”", "That's okay. Notice where it happens. Slow down."],
      ["“I try to keep the lower sound when going higher.”", "Don't force it. Allow the voice to coordinate differently."],
      ["“My upper notes become very breathy.”", "Do not push. Reduce the range. Return to a comfortable note."],
      ["“My voice flips.”", "Don't fight it. Practice the transition gently."],
      ["“I feel throat tension.”", "Stop. Relax. Return to gentle humming."],
      ["“I don't notice any register difference.”", "That's completely fine. Awareness develops gradually."],
      ["“I want to find my highest note.”", "Not in this class — range exploration will come later and will be structured carefully."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["NOTICE", "LISTEN", "MOVE", "CONNECT", "RELAX"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 23 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">CONNECT — DON'T FORCE</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm ${s === "CONNECT" ? "!bg-gold-500/15 !text-gold-300" : ""}">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">Your voice does not need to behave exactly the same at every pitch.</p>
        <p class="text-sm text-ink-100">Your goal is to learn how to coordinate those changes rather than fight them.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["comfortRangeExploration", "sensationAwareness", "gentleHumSlide", "twoNoteConnection", "threeNoteConnection", "ngAh", "humVowel", "lowerMiddleEx", "middleUpperEx", "transitionAwareness", "nonForcePractice", "connectedGlide", "noteByNoteEx", "rhythmEx", "dynamicsEx", "wordIntegration", "recordingEx", "comfortZoneMapping"].filter((k) => c[k]).length;
    return [
      [`Register exercises (${ex}/18)`, ex === 18],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">Your voice may feel different in different areas, and that's normal — you don't need to force one vocal quality throughout your range. You can notice where transitions happen, practise them slowly, and reduce range or volume when something becomes difficult.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll bring everything from your Foundation classes together by singing a complete simple song.` : "More is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Notice the changes. Connect them gently.</h3>
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
    const zone = A(rec, "comfortZone");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Notice the changes. Connect them gently.", `
          ${p("As you sing higher and lower, your voice may feel different — in vibration, resonance, volume, tone, effort, breath sensation, coordination. These changes are a normal part of learning to sing.")}
          ${p("Today we are <strong class=\"text-ink-100\">not</strong> trying to eliminate every difference. We are learning to notice them and move through them comfortably.")}
          ${flowStrip(["LISTEN", "NOTICE", "EXPLORE", "CONNECT"])}
        `)}

        ${chapter("understand", 2, "Awareness before control", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Awareness before control.”</p>
            <p class="text-sm text-ink-200">You cannot improve something you cannot notice. Do not force anything today.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 3, "What does “register” mean?", `
          ${narrow(p("For this beginner course, we use “register” as a practical way to describe areas of the voice that may feel or behave differently — <strong class=\"text-ink-100\">lower</strong>, <strong class=\"text-ink-100\">middle</strong> and <strong class=\"text-ink-100\">upper</strong>. These are descriptive, not permanent — you will not be told you are “definitely” a soprano, alto or tenor here."))}
        `)}

        ${chapter("explore", 4, "Exercise 1 — Comfortable range check", `
          ${narrow(p("Tap a key for a comfortable middle note (it's carried over from earlier classes otherwise). Every exercise in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("ra-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${narrow(p("Sing “mmm” on the middle note, move slightly lower, return, then move slightly higher, return."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-area="lower" class="vr-btn">${icon("play", "w-4 h-4")} Lower</button>
            <button type="button" data-play-area="middle" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Middle</button>
            <button type="button" data-play-area="upper" class="vr-btn">${icon("play", "w-4 h-4")} Upper</button>
          </div>
          ${SelfAssessment.render("comfortArea-q", { ...Q.comfortArea, selected: sel("comfortArea") })}
          <p class="text-xs text-ink-500 mt-2">This is an observation, not a voice classification.</p>
        `, { wide: true })}

        ${chapter("explore", 5, "Exercise 2 — Notice the sensation", `
          ${narrow(p("On “mmm” or “ng,” move gently through lower → middle → slightly higher. The sensation may change as the pitch changes — there's nothing you're supposed to feel. Everyone experiences their voice differently."))}
          ${SelfAssessment.render("sensationChanged-q", { ...Q.sensationChanged, selected: sel("sensationChanged") })}
        `)}

        ${chapter("glide", 6, "Exercise 3 — Gentle hum slide", `
          ${narrow(p("A very comfortable range. A gentle “mmm” glide upward, then downward — soft, no extreme notes. The goal is simply to notice the transition, not to find your highest note."))}
          ${flowStrip(["LOW", "MIDDLE", "UPPER"])}
          ${recCard("humSlide", "Glide up, then down", "“mmm”, soft and easy.", 12)}
        `)}

        ${chapter("connect", 7, "Exercise 4 — Two-note connection", `
          ${narrow(p("Connecting Class 20. Focus on smoothness, comfort and pitch — no pushing."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="two-a" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2</button>
            <button type="button" data-play-move="two-b" class="vr-btn">${icon("play", "w-4 h-4")} 2 → 3</button>
            <button type="button" data-play-move="two-c" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 2</button>
            <button type="button" data-play-move="two-d" class="vr-btn">${icon("play", "w-4 h-4")} 2 → 1</button>
          </div>
          ${recCard("twoNoteConnect", "Sing on “oo”", "Any of the four above.", 10)}
        `)}

        ${chapter("connect", 8, "Exercise 5 — Three-note connection", `
          ${narrow(p("Keep the range small. The learner should feel MOVE, not PUSH."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-move="three-a" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2 → 3</button>
            <button type="button" data-play-move="three-b" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 2 → 1</button>
            <button type="button" data-play-move="three-c" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3 → 2</button>
          </div>
          ${recCard("threeNoteConnect", "Sing on “oo”", "", 10)}
        `)}

        ${chapter("vowel", 9, "Exercise 6 — “ng → ah”", `
          ${narrow(p("A comfortable note: “ng” gently opening into “ah.” Then try it on 1 → 2 → 3. Don't force resonance placement — just explore the connected transition from a closed sound to an open vowel."))}
          ${recCard("ngAhTake", "ng → ah", "On one note, then on 1 → 2 → 3.", 10)}
        `)}

        ${chapter("vowel", 10, "Exercise 7 — Hum → vowel", `
          ${PitchMatchExercise.render("ra-humvowel", HUM_VOWEL_EX)}
          <div class="mt-4">${SelfAssessment.render("easiestTransition-q", { ...Q.easiestTransition, selected: sel("easiestTransition") })}</div>
          <p class="text-xs text-ink-500 mt-2">No vowel is technically superior — this is just awareness.</p>
        `)}

        ${chapter("areas", 11, "Exercise 8 — Lower → middle → lower", `
          ${narrow(p("A small, comfortable pattern, starting slightly lower than your reference note. If the voice feels disconnected: slow down, reduce the range, return to humming."))}
          ${recCard("lowerMiddleTake", "1 → 2 → 3 → 2 → 1, starting slightly lower", "", 12)}
          <div class="mt-4">${SelfAssessment.render("staysConnectedLower-q", { ...Q.staysConnected, selected: sel("staysConnectedLower") })}</div>
        `)}

        ${chapter("areas", 12, "Exercise 9 — Middle → upper → middle", `
          ${narrow(p("A slightly higher but still comfortable note. Don't chase the upper note — if it's uncomfortable, lower the entire pattern. This exercise succeeds if you stay relaxed, nothing more."))}
          ${recCard("middleUpperTake", "1 → 2 → 3 → 2 → 1, starting slightly higher", "", 12)}
        `)}

        ${chapter("break", 13, "Exercise 10 — Listen for a “break”", `
          ${narrow(p("Sometimes the voice may noticeably change between two notes — a sudden change, a flip, a gap, a change in tone, volume or stability. Not every change is a “vocal break.”"))}
          ${SelfAssessment.render("noticedChange-q", { ...Q.noticedChange, selected: sel("noticedChange") })}
          <div class="mt-4" data-where-change-host>${sel("noticedChange") === "yes" ? SelfAssessment.render("whereChange-q", { ...Q.whereChange, selected: sel("whereChange") }) : ""}</div>
        `)}

        ${chapter("break", 14, "Exercise 11 — Don't fix it by force", `
          ${p("An important lesson. If a transition feels unstable, do <strong class=\"text-ink-100\">not</strong>:")}
          <ul class="grid sm:grid-cols-2 gap-1.5 text-sm text-ink-400 my-4">${["Push harder", "Increase volume", "Tighten the throat", "Lift the chin", "Force the chest voice upward", "Force the upper voice downward"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}</ul>
          ${p("Instead: reduce the range, lower the volume, slow down, return to humming, try again.")}
          ${recCard("nonForceTake", "Practice a transition this way", "Smaller, softer, slower.", 10)}
        `)}

        ${chapter("smooth", 15, "Exercise 12 — Connected glide", `
          ${narrow(p("A gentle “woo” glide: low → middle, then middle → slightly higher, then return. Keep it easy — this is not a vocal-range exercise."))}
          ${recCard("connectedGlideTake", "“woo” glide", "", 10)}
        `)}

        ${chapter("smooth", 16, "Exercise 13 — Note by note", `
          ${narrow(p("Now remove the glide. Instead of sliding from 1 to 3, sing note 1, pause, then note 3. Then try 1 → 2 → 3. You're learning to connect notes without relying entirely on sliding — connecting Classes 4, 13, 20 and 22."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("separatedTake", "1 … pause … 3", "", 8)}
            ${recCard("connectedTake", "1 → 2 → 3", "", 8)}
          </div>
        `)}

        ${chapter("rhythm", 17, "Exercise 14 — Register awareness + rhythm", `
          ${narrow(p("Connecting Class 6."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("ra-metro", { bpm: BPM })}
          </div>
          ${recCard("rhythmTake", "1 — 2 — 3 — 2 — 1", "", 10)}
        `, { wide: true })}

        ${chapter("dynamics", 18, "Exercise 15 — Register awareness + dynamics", `
          ${narrow(p("Connecting Class 14. Don't become louder simply because the melody rises."))}
          ${recCard("dynamicsTake", "Sing naturally, then soft → natural → soft", "1 → 2 → 3 → 2 → 1", 12)}
        `)}

        ${chapter("words", 19, "Exercise 16 — Register awareness + words", `
          ${narrow(p("A very short phrase."))}
          ${lyricLine(WORD_PHRASE)}
          <div class="grid sm:grid-cols-3 gap-3">
            ${recCard("wordsHum", "Hum", "", 8)}
            ${recCard("wordsVowel", "Sing on “ah”", "", 8)}
            ${recCard("wordsFull", "With words", "", 10)}
          </div>
          <div class="mt-4">${SelfAssessment.render("wordsChanged-q", { ...Q.wordsChanged, selected: sel("wordsChanged") })}</div>
        `)}

        ${chapter("review", 20, "Exercise 17 — Record your transition", `
          ${p("Choose two comfortable notes where you notice a change, then try the same transition a few ways.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            ${recCard("transNatural", "Take 1 — Natural", "", 10)}
            ${recCard("transSlower", "Take 2 — Slower", "", 10)}
            ${recCard("transSofter", "Take 3 — Softer", "", 10)}
            ${recCard("transHum", "Take 4 — Hum", "", 10)}
          </div>
          ${SelfAssessment.render("mostComfortableApproach-q", { ...Q.mostComfortableApproach, selected: sel("mostComfortableApproach") })}
          <p class="text-xs text-ink-500 mt-2">Don't automatically choose the smoothest-sounding take if it felt forced — comfort is part of the evaluation.</p>
        `)}

        ${chapter("review", 21, "Exercise 18 — Find your comfort zone", `
          ${narrow(p("Tap each area to mark it — tap again to cycle Very comfortable → Comfortable → Needs attention → Not comfortable. This is today's comfort zone, not a permanent chest/head/mixed classification."))}
          ${zoneTiles(zone)}
        `)}

        ${chapter("review", 22, "Common beginner problems", problems())}

        ${chapter("evaluate", 23, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("ra-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 24, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, comfortable sessions — not excessive practice.")}
          ${Timer.render("ra-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 25, `Class ${cls.number} Assignment — Observe &amp; Connect`, `
          ${p("Choose a comfortable five-note pattern (e.g. 1 → 2 → 3 → 2 → 1), then complete five takes.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Hum", "", 10)}
            ${recCard("t2", "Take 2 — Sing on “OO”", "", 10)}
            ${recCard("t3", "Take 3 — Sing on “AH”", "", 10)}
            ${recCard("t4", "Take 4 — Simple words", "", 10)}
            ${recCard("t5", "Take 5 — Repeat softly", "", 10)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="ra-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="ra-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 26, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-ra", { placeholder: "e.g. I noticed a change around... My upper area feels... Humming feels easier than singing vowels." })}
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

    /* ---- Exercise 1: lower/middle/upper demo ---- */
    function onPlayArea(e) {
      const btn = e.target.closest("[data-play-area]");
      if (!btn) return;
      const b = base();
      PianoSynth.play(b + AREA_OFFSET[btn.dataset.playArea] * STEP, { duration: 1.1, velocity: 0.55 });
    }
    container.addEventListener("click", onPlayArea);
    cleanups.push(() => container.removeEventListener("click", onPlayArea));

    /* ---- Exercises 4/5: movement playback ---- */
    const MOVES = { "two-a": TWO_A, "two-b": TWO_B, "two-c": TWO_C, "two-d": TWO_D, "three-a": THREE_A, "three-b": THREE_B, "three-c": THREE_C };
    function onPlayMove(e) {
      const btn = e.target.closest("[data-play-move]");
      if (!btn) return;
      PianoSynth.playSequence(degreesToNotes(base(), MOVES[btn.dataset.playMove]), { duration: 0.55, gap: 0.18 });
    }
    container.addEventListener("click", onPlayMove);
    cleanups.push(() => container.removeEventListener("click", onPlayMove));

    /* ---- reference piano ---- */
    own(VirtualPiano.wire(container, "ra-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi - MAX_DEGREE * STEP < RANGE.from || midi + MAX_DEGREE * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + MAX_DEGREE * STEP)} and ${N(RANGE.to - MAX_DEGREE * STEP)} so lower and upper stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exHumVowel.refresh();
      },
    }));

    /* ---- Exercise 7: hum → vowel ---- */
    const exHumVowel = own(PitchMatchExercise.wire(container, "ra-humvowel", HUM_VOWEL_EX, {
      classId, exerciseId: "humVowel", state: (rec0().answers.exercises || {}).humVowel || {},
      getNotes: () => [base()], isComplete: HUM_VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "humVowel", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 14: metronome ---- */
    own(Metronome.wire(container, "ra-metro", { bpm: BPM }));

    /* ---- Exercise 21: comfort zone tiles ---- */
    function onZoneClick(e) {
      const btn = e.target.closest("[data-zone-tile]");
      if (!btn) return;
      const k = btn.dataset.zoneTile;
      const zone = { ...(A(rec0(), "comfortZone") || {}) };
      const cur = ZONE_STATES.indexOf(zone[k] || "");
      const next = ZONE_STATES[(cur + 1) % ZONE_STATES.length];
      zone[k] = next;
      set("comfortZone", k, next);
      const label = $(`[data-zone-label="${k}"]`);
      if (label) label.textContent = next || "Tap to mark";
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onZoneClick);
    cleanups.push(() => container.removeEventListener("click", onZoneClick));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "comfortArea-q": "comfortArea", "sensationChanged-q": "sensationChanged", "easiestTransition-q": "easiestTransition",
      "staysConnectedLower-q": "staysConnectedLower", "noticedChange-q": "noticedChange", "whereChange-q": "whereChange",
      "wordsChanged-q": "wordsChanged", "mostComfortableApproach-q": "mostComfortableApproach",
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
      syncCheckpoints();
      if (name === "noticedChange-q") {
        const host = $("[data-where-change-host]");
        if (host) host.innerHTML = chip.dataset.assessChoice === "yes" ? SelfAssessment.render("whereChange-q", { ...Q.whereChange, selected: q(rec0(), "whereChange") }) : "";
      }
      refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- all recordings ---- */
    const NAMES = {
      humSlide: "Gentle hum slide", twoNoteConnect: "Two-note connection", threeNoteConnect: "Three-note connection",
      ngAhTake: "NG → AH", lowerMiddleTake: "Lower → middle", middleUpperTake: "Middle → upper",
      nonForceTake: "Non-force practice", connectedGlideTake: "Connected glide",
      separatedTake: "Note by note — separated", connectedTake: "Note by note — connected",
      rhythmTake: "Register + rhythm", dynamicsTake: "Register + dynamics",
      wordsHum: "Register + words — hum", wordsVowel: "Register + words — vowel", wordsFull: "Register + words — full",
      transNatural: "Transition — natural", transSlower: "Transition — slower", transSofter: "Transition — softer", transHum: "Transition — hum",
      t1: "Assignment — hum", t2: "Assignment — OO", t3: "Assignment — AH", t4: "Assignment — words", t5: "Assignment — soft repeat",
    };
    const MAX_SECONDS = {
      humSlide: 12, twoNoteConnect: 10, threeNoteConnect: 10, ngAhTake: 10, lowerMiddleTake: 12, middleUpperTake: 12,
      nonForceTake: 10, connectedGlideTake: 10, separatedTake: 8, connectedTake: 8, rhythmTake: 10, dynamicsTake: 12,
      wordsHum: 8, wordsVowel: 8, wordsFull: 10, transNatural: 10, transSlower: 10, transSofter: 10, transHum: 10,
      t1: 10, t2: 10, t3: 10, t4: 10, t5: 10,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 10,
        meta: { name: `Class 23 — ${NAMES[k]}`, exercise: `register-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "ra-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}. Short and comfortable is perfect.`;
        refreshLive();
      },
    }));

    /* ---- assignment, self-evaluation, notes ---- */
    container.querySelectorAll("[data-assign-q]").forEach((ta) => {
      const i = ta.dataset.assignQ;
      const save = Utils.debounce((v) => { set("assignment", "answers", { ...(A(rec0(), "assignment").answers || {}), [i]: v }); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    cleanups.push(ControlCheck.wire(container, "ra-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-ra", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "My voice may feel different in different areas — I don't need to force one quality throughout my range. Connection is more important than forcing.",
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
