/* ============================================================
   CLASS 18 — MUSICAL PHRASING & LINE SHAPE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "musical-phrasing".

   Core idea: "Don't just sing the notes. Give the phrase a
   direction." Singing is not NOTE -> NOTE -> NOTE -> NOTE, it's
   BEGINNING -> DEVELOPMENT -> DIRECTION -> DESTINATION.
   "Musical shape does not mean singing louder all the time" —
   direction can come from pitch, rhythm, dynamics, vowel emphasis,
   timing, breath and articulation, not only volume.

   One short 5-note melody carries most of the class (degrees
   0-1-3-2-0: begin low, rise, PEAK at note 3, release, finish on
   the tonic) — a beginning/build/peak/release/finish shape with an
   objectively identifiable peak (the middle, highest note), reused
   across Exercises 4, 5/6, 9, 14 and 15. Exercise 1 uses its own
   short 4-note "destination" melody (rising to its last note) and
   Exercise 2 its own two illustrative contours (the spec's own
   "LOW -> HIGH -> HIGHER -> HIGH -> LOW" / "HIGH -> LOW -> LOW ->
   HIGH" examples) — neither is meant to be the main working phrase.
   Exercise 11's lyric ("I've been waiting for you", 5 words) maps
   one word to each of the main melody's 5 notes, so "waiting"
   naturally lands on the peak.

   Flow: understand -> listen for the destination -> trace the
   melodic shape -> hum it -> one vowel "AH" -> find the peak ->
   sing toward the peak -> flat vs. shaped (A/B) -> dynamics as
   shape -> phrase release -> breath + shape -> word emphasis ->
   phrase with meaning -> timing and phrasing (A/B) -> three-part
   phrase shape (the main sung exercise) -> a tap-based visual
   phrase shaper -> recording practice (4 takes) -> one-focus
   improvement -> common problems -> self-evaluate -> practice ->
   assignment (6 takes + 9 questions) -> milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard (Class 5), StabilityPanel
   (Class 12, pitch visualization), ControlCheck (Class 9+),
   ObservationChecklist is not needed here (single-select fits the
   spec's own "choose ONE" wording better — see below), Timer,
   PersonalNotes, ClassProgress, ClassActivity. No shared component
   needed changes.

   Exercise 15 ("Visual Phrase Shaper") asks for a draggable visual;
   this buildless, mouse/touch-light codebase instead gives each of
   the 5 notes its own tap-to-cycle role button (Start/Build/Peak/
   Release/Finish) — the same "select, don't drag" interaction
   language Classes 11/16/17 already use for their breath/boundary
   markers — rather than building a new drag-and-drop system.
   Exercises 7 and 13's A/B comparisons are honestly synthesized
   with PianoSynth (uniform vs. peak-shaped velocity; strict vs.
   gently-varied note timing) — exactly the two things being
   compared are what the synth actually controls, so nothing here
   fabricates a vocal judgement.
   ============================================================ */

const MusicalPhrasingLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "shape", label: "Shape" },
    { id: "hum", label: "Hum" },
    { id: "vowel", label: "Vowel" },
    { id: "peak", label: "Peak" },
    { id: "compare", label: "Compare" },
    { id: "dynamics", label: "Dynamics" },
    { id: "release", label: "Release" },
    { id: "breath", label: "Breath" },
    { id: "words", label: "Words" },
    { id: "timing", label: "Timing" },
    { id: "threepart", label: "Full Shape" },
    { id: "review", label: "Review" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Musical Phrasing";
  const MAIN_DEGREES = [0, 1, 3, 2, 0]; // begin low, rise, PEAK, release, finish on the tonic
  const PEAK_INDEX = 2;
  const DEST_DEGREES = [0, 1, 2, 4]; // Exercise 1 only — rises to its own last note
  const CONTOUR_A_DEGREES = [0, 2, 4, 2, 0]; // LOW -> HIGH -> HIGHER -> HIGH -> LOW (Exercise 2)
  const CONTOUR_B_DEGREES = [2, 0, 0, 2]; // HIGH -> LOW -> LOW -> HIGH (Exercise 2)
  const MAX_DEGREE = 4;
  const LYRIC_WORDS = ["I've", "been", "waiting", "for", "you"]; // one word per MAIN_DEGREES note — "waiting" lands on the peak
  const MEANING_PHRASE = ["I", "still", "remember"];
  const ROLE_CYCLE = ["", "Start", "Build", "Peak", "Release", "Finish"];

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "shapeEx", label: "Melodic shape exercise completed" },
    { key: "destinationEx", label: "Phrase destination exercise completed" },
    { key: "humming", label: "Humming completed" },
    { key: "vowelEx", label: "One-vowel exercise completed" },
    { key: "peakIdentified", label: "Phrase peak identified" },
    { key: "peakEx", label: "Peak exercise completed" },
    { key: "flatShapedEx", label: "Flat vs shaped comparison completed" },
    { key: "dynamicsEx", label: "Dynamics exercise completed" },
    { key: "releaseEx", label: "Phrase release completed" },
    { key: "breathShapeEx", label: "Breath + shape completed" },
    { key: "wordEmphasisEx", label: "Word emphasis completed" },
    { key: "expressionEx", label: "Expression exercise completed" },
    { key: "timingEx", label: "Timing exercise completed" },
    { key: "threePartEx", label: "Three-part phrase shape completed" },
    { key: "visualShaperEx", label: "Visual phrase shaper completed" },
    { key: "recordingEx", label: "Recording completed" },
    { key: "oneFocusEx", label: "One-focus improvement completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    destination: { question: "Which note feels like the destination?", options: [opt("first", "First"), opt("middle", "Middle"), opt("last", "Last"), opt("unsure", "Not sure")] },
    contourA: { question: "Does the melody feel like it is moving upward?", options: [opt("yes", "Yes", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    vowelDirection: { question: "Did you feel yourself moving toward a particular note?", options: [opt("yes", "Yes", "good"), opt("little", "A little", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    peakNote: { question: "Which note feels most important?", options: [...MAIN_DEGREES.map((_, i) => opt(String(i), `Note ${i + 1}`)), opt("unsure", "Not sure")] },
    flatShaped: { question: "Which feels more musical?", options: [opt("a", "Version A"), opt("b", "Version B"), opt("unsure", "Not sure")] },
    endingFinished: { question: "Did the ending feel finished?", options: YMNU.slice(0, 3) },
    breathSupport: { question: "Did your breathing support the phrase, rather than interrupt it?", options: YMNU },
    wordEmphasis: { question: "Which word carries the main meaning?", options: [...LYRIC_WORDS.map((w) => opt(w, `“${w}”`)), opt("unsure", "Not sure")] },
    meaning: { question: "What is the phrase trying to communicate?", options: ["Longing", "Happiness", "Sadness", "Warmth", "Excitement", "Calmness", "Other"].map((m) => opt(m.toLowerCase(), m)) },
    timingFeel: { question: "Which version felt more musical?", options: [opt("a", "Version A"), opt("b", "Version B"), opt("unsure", "Not sure")] },
    connectedTake: { question: "Which take feels most connected?", options: [opt("1", "Take 1"), opt("2", "Take 2"), opt("3", "Take 3"), opt("4", "Take 4"), opt("unsure", "Not sure")] },
    oneFocus: { question: "Choose ONE thing to focus on for your next take.", options: ["Pitch", "Rhythm", "Diction", "Breath", "Phrase peak", "Dynamics", "Ending", "Expression"].map((f) => opt(f.toLowerCase().replace(/\s+/g, "-"), f)) },
  };

  const CHECK_ROWS = [
    { key: "direction", area: "Direction", question: "Could I identify where the phrase was going?", levels: YMN_LEVELS },
    { key: "peak", area: "Peak", question: "Could I identify the phrase peak?", levels: YMN_LEVELS },
    { key: "shape", area: "Shape", question: "Could I create a beginning → peak → ending shape?", levels: YMN_LEVELS },
    { key: "dynamics", area: "Dynamics", question: "Could I create subtle movement without forcing volume?", levels: YMN_LEVELS },
    { key: "breath", area: "Breath", question: "Did my breathing support the phrase?", levels: YMN_LEVELS },
    { key: "diction", area: "Diction", question: "Did the important words remain clear?", levels: YMN_LEVELS },
    { key: "expression", area: "Expression", question: "Did the phrase communicate something?", levels: lv(["yes", "✓", "Yes"], ["little", "△", "A little"], ["notyet", "○", "Not yet"]) },
    { key: "overall", area: "Overall", question: "Did the phrase feel like one musical thought?", levels: YMN_LEVELS },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 17 -> 16 -> 15 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c17 = (ClassActivity.get("L1C17").answers.setup || {}).note;
    if (ok(c17)) return c17;
    const c16 = (ClassActivity.get("L1C16").answers.setup || {}).note;
    if (ok(c16)) return c16;
    const c15 = (ClassActivity.get("L1C15").answers.setup || {}).note;
    if (ok(c15)) return c15;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);
  const mainNotes = (b) => degreesToNotes(b, MAIN_DEGREES);
  const destNotes = (b) => degreesToNotes(b, DEST_DEGREES);
  const contourANotes = (b) => degreesToNotes(b, CONTOUR_A_DEGREES);
  const contourBNotes = (b) => degreesToNotes(b, CONTOUR_B_DEGREES);

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const VOWEL_EX = {
    eyebrow: "Exercise 4 · One vowel", title: "AH — on the phrase shape",
    intro: "The same melody, on one vowel. Notice the voice following a musical line, not isolated notes.",
    chain: true, refLabel: "Reference melody", noteDuration: 0.7,
    slots: [{ key: "take", label: "Your “AH” phrase", hint: "Sing along with the reference, then record" }],
    assessment: Q.vowelDirection,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };
  const THREE_PART_EX = {
    eyebrow: "Exercise 14 · Three-part shape", title: "Beginning → Peak → Ending",
    intro: "Beginning → build. Middle → continue. Destination → arrive. Finish → release. This is the main exercise of this class.",
    chain: true, refLabel: "Reference melody",
    slots: [{ key: "take", label: "Your shaped phrase", hint: "Build gently toward the peak, then release" }],
    assessment: { question: "Did this feel like one shaped musical thought?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const ASSIGN_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (q(rec, "contourA")) out.shapeEx = true;
    if (q(rec, "destination")) out.destinationEx = true;
    if (take(rec, "hum")) out.humming = true;
    if (VOWEL_EX.isComplete(exState(rec, "vowel"))) out.vowelEx = true;
    if (q(rec, "peakNote")) out.peakIdentified = true;
    if (take(rec, "towardPeak")) out.peakEx = true;
    if (q(rec, "flatShaped")) out.flatShapedEx = true;
    if (take(rec, "dynShape")) out.dynamicsEx = true;
    if (take(rec, "release") && q(rec, "endingFinished")) out.releaseEx = true;
    if (q(rec, "breathSupport")) out.breathShapeEx = true;
    if (take(rec, "wordEmphasis") && q(rec, "wordEmphasis")) out.wordEmphasisEx = true;
    if (take(rec, "meaningNeutral") && take(rec, "meaningVersion") && q(rec, "meaning")) out.expressionEx = true;
    if (q(rec, "timingFeel")) out.timingEx = true;
    if (THREE_PART_EX.isComplete(exState(rec, "threePart"))) out.threePartEx = true;
    const roles = A(rec, "shaper").roles || {};
    if ([0, 1, 2, 3, 4].every((i) => filled(roles[i]))) out.visualShaperEx = true;
    if (["take1", "take2", "take3", "take4"].every((k) => take(rec, k)) && q(rec, "connectedTake")) out.recordingEx = true;
    if (take(rec, "oneFocusTake") && q(rec, "oneFocus")) out.oneFocusEx = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const lyricLine = (words) => `<p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;

  function contourView(degrees, label) {
    const max = Math.max(...degrees);
    return `
      <div class="rounded-2xl border border-white/10 bg-ink-950/60 p-4">
        <p class="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-3">${label}</p>
        <div class="flex items-end gap-2 h-20">
          ${degrees.map((d) => `<div class="flex-1 rounded-t-lg bg-gradient-to-t from-gold-500/30 to-gold-400/70" style="height:${8 + (d / Math.max(1, max)) * 72}px"></div>`).join("")}
        </div>
      </div>`;
  }

  function shaperTiles(roles) {
    return `<div class="grid grid-cols-5 gap-2" data-shaper="cp-shaper">
      ${MAIN_DEGREES.map((_, i) => `
        <button type="button" data-shaper-tile="${i}" class="rounded-2xl border border-white/10 bg-white/[0.03] py-5 text-center hover:bg-white/[0.06] transition-colors">
          <p class="text-[11px] text-ink-500 mb-1">Note ${i + 1}</p>
          <p class="font-display text-sm text-ink-50" data-shaper-role="${i}">${roles[i] || "Tap to label"}</p>
        </button>`).join("")}
    </div>`;
  }

  function problems() {
    const items = [
      ["“Everything sounds flat.”", "Try adding a gentle phrase direction. Don't simply increase volume."],
      ["“I don't know where the phrase is going.”", "Hum it first. Look at the melodic contour. Identify the highest or most important moment."],
      ["“I make the peak too loud.”", "Reduce volume. Think about intention rather than force."],
      ["“I lose pitch when trying to express emotion.”", "Return to a neutral performance. Stabilize the melody first, then add a small amount of expression."],
      ["“I don't feel anything in the phrase.”", "Start by understanding the words. Don't force an emotion."],
      ["“I keep changing the rhythm.”", "Return to the metronome. Maintain the underlying pulse."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["BEGIN", "BUILD", "PEAK", "RELEASE", "FINISH"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 18 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">GIVE THE PHRASE A DIRECTION</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm ${s === "PEAK" ? "!bg-gold-500/15 !text-gold-300" : ""}">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">Music is not only about reaching the right notes.</p>
        <p class="text-sm text-ink-100">It is also about showing the listener where those notes are going.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["shapeEx", "destinationEx", "humming", "vowelEx", "peakIdentified", "peakEx", "flatShapedEx", "dynamicsEx", "releaseEx", "breathShapeEx", "wordEmphasisEx", "expressionEx", "timingEx", "threePartEx", "visualShaperEx", "recordingEx", "oneFocusEx"].filter((k) => c[k]).length;
    return [
      [`Phrasing exercises (${ex}/17)`, ex === 17],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You don't have to sing every note with the same weight. You can identify where a phrase is going, gently build toward an important moment, and then release — without forcing your voice.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll begin working with simple melodies that contain repeated patterns — developing consistency, memory and control.` : "Next, we'll work with simple repeated melodic patterns."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Give the phrase a direction.</h3>
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
    const shaperRoles = A(rec, "shaper").roles || {};

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Make the listener feel where the phrase is going", `
          ${p("Two singers can sing the same notes correctly. One may sound flat or mechanical — the other, musical. One reason is <strong class=\"text-ink-100\">phrasing</strong>: where the phrase begins, moves, grows, relaxes, reaches a destination, and finishes.")}
          ${p("You don't need advanced artistic interpretation here — just to recognise and create simple musical direction.")}
          <div class="flex flex-wrap items-center justify-center gap-2 my-5">
            ${["BEGINNING", "DEVELOPMENT", "DIRECTION", "DESTINATION"].map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
          </div>
        `)}

        ${chapter("understand", 2, "Musical shape does not mean singing louder all the time", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Musical shape does not mean singing louder all the time.”</p>
            <p class="text-sm text-ink-200">A phrase can have direction through pitch, rhythm, dynamics, vowel emphasis, timing, breath and articulation — not only volume. Never force it.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("shape", 3, "Exercise 1 — Listen for the destination", `
          ${narrow(p("A very short melody. Listen for a point the melody seems to move toward."))}
          <button type="button" data-play-dest class="vr-btn vr-btn-gold mb-4">${icon("play", "w-4 h-4")} Play the melody</button>
          ${SelfAssessment.render("destination-q", { ...Q.destination, selected: sel("destination") })}
        `)}

        ${chapter("shape", 4, "Exercise 2 — Trace the melodic shape", `
          ${p("A musical phrase often has a shape — a contour the pitch traces as it moves.")}
          <div class="grid sm:grid-cols-2 gap-4 mb-4">
            <div>${contourView(CONTOUR_A_DEGREES, "LOW → HIGH → HIGHER → HIGH → LOW")}<button type="button" data-play-contour="a" class="vr-btn mt-3">${icon("play", "w-4 h-4")} Play</button></div>
            <div>${contourView(CONTOUR_B_DEGREES, "HIGH → LOW → LOW → HIGH")}<button type="button" data-play-contour="b" class="vr-btn mt-3">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          ${SelfAssessment.render("contourA-q", { ...Q.contourA, selected: sel("contourA") })}
        `)}

        ${chapter("hum", 5, "Exercise 3 — Hum the shape", `
          ${narrow(p("Hum the main phrase for this class on “mmm”. Focus only on where it rises, where it falls, its highest point, and where it resolves — no lyrics yet."))}
          ${recCard("hum", "Hum the phrase", "“mmm” — the full shape.", 10)}
        `)}

        ${chapter("vowel", 6, "Exercise 4 — One vowel", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every melody in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("mp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${PitchMatchExercise.render("mp-vowel", VOWEL_EX)}
          <div class="mt-4">${StabilityPanel.render("sp-vowel", { title: "Estimated pitch — after you answer" })}</div>
        `, { wide: true })}

        ${chapter("peak", 7, "Exercise 5 — Find the peak", `
          ${narrow(p("A phrase may have a note or moment that feels more important than the others — sometimes called the <strong class=\"text-ink-100\">phrase peak</strong>."))}
          <button type="button" data-play-main class="vr-btn vr-btn-gold mb-4">${icon("play", "w-4 h-4")} Play the phrase</button>
          ${SelfAssessment.render("peakNote-q", { ...Q.peakNote, selected: sel("peakNote") })}
        `)}

        ${chapter("peak", 8, "Exercise 6 — Sing toward the peak", `
          ${narrow(p("Imagine the note you chose is the destination. Beginning → move toward the peak → continue → finish. The change can be subtle — don't increase volume dramatically."))}
          ${recCard("towardPeak", "Sing toward the peak", "Gentle, not dramatic.", 10)}
        `)}

        ${chapter("compare", 9, "Exercise 7 — Flat vs shaped", `
          ${p("Two versions of the same phrase.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version A — flat</p><button type="button" data-play-flatshaped="a" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version B — shaped</p><button type="button" data-play-flatshaped="b" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          ${SelfAssessment.render("flatShaped-q", { ...Q.flatShaped, selected: sel("flatShaped") })}
          <p class="text-sm text-ink-300 mt-3 min-h-[1.25rem]" data-flatshaped-msg>${sel("flatShaped") ? "Neither is “wrong” — Version A keeps every note at the same intensity; Version B gently grows toward the peak and settles afterward. This is awareness, not correction." : ""}</p>
        `)}

        ${chapter("dynamics", 10, "Exercise 8 — Dynamics as shape", `
          ${narrow(p("Connecting Class 14. This is not quiet → loud → louder. It is movement → destination → release. Keep every volume comfortable."))}
          <div class="flex flex-wrap items-center justify-center gap-2 my-4">
            ${["Slightly softer", "Medium", "Slightly stronger", "Relax"].map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
          </div>
          ${recCard("dynShape", "Sing the phrase with this shape", "Subtle — never forced.", 10)}
        `)}

        ${chapter("release", 11, "Exercise 9 — Phrase release", `
          ${narrow(p("The other side of the phrase: after the peak, it relaxes."))}
          <div class="flex flex-wrap items-center justify-center gap-2 my-4">
            ${["BUILD", "PEAK", "RELEASE"].map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">↓</span>` : ""}`).join("")}
          </div>
          ${recCard("release", "Sing the full phrase, ending with a release", "You don't need a long final note.", 10)}
          <div class="mt-4">${SelfAssessment.render("endingFinished-q", { ...Q.endingFinished, selected: sel("endingFinished") })}</div>
        `)}

        ${chapter("breath", 12, "Exercise 10 — Connecting breath with shape", `
          ${narrow(`
            ${p("Connecting Class 17. Where should the breath happen? Consider meaning, phrase length, musical structure and comfort — don't force a breath immediately before the peak, and don't hold your breath.")}
            <div class="flex justify-center my-5"><div class="breathe-circle !w-20 !h-20" data-breath-circle></div></div>
            ${p("Breathing should support the musical phrase, not interrupt it unnecessarily.")}
          `)}
          ${SelfAssessment.render("breathSupport-q", { ...Q.breathSupport, selected: sel("breathSupport") })}
        `)}

        ${chapter("words", 13, "Exercise 11 — Word emphasis", `
          ${narrow(p("Connecting Class 15."))}
          ${lyricLine(LYRIC_WORDS)}
          ${SelfAssessment.render("wordEmphasis-q", { ...Q.wordEmphasis, selected: sel("wordEmphasis") })}
          <div class="mt-4">${recCard("wordEmphasis", "Sing it, giving that word slightly more attention", "Don't shout or over-pronounce it.", 10)}</div>
        `)}

        ${chapter("words", 14, "Exercise 12 — Phrase with meaning", `
          ${lyricLine(MEANING_PHRASE)}
          ${SelfAssessment.render("meaning-q", { ...Q.meaning, selected: sel("meaning") })}
          <div class="grid sm:grid-cols-2 gap-3 mt-4">
            ${recCard("meaningNeutral", "Sing it neutrally", "No particular meaning in mind.", 8)}
            ${recCard("meaningVersion", "Sing it with that meaning in mind", "Let the meaning guide you, gently.", 8)}
          </div>
        `)}

        ${chapter("timing", 15, "Exercise 13 — Timing and phrasing", `
          ${narrow(p("Connecting Class 6. Musical phrasing does not mean randomly changing the rhythm — the underlying pulse must stay stable."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version A — strictly mechanical</p><button type="button" data-play-timing="a" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version B — natural phrase direction</p><button type="button" data-play-timing="b" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          ${SelfAssessment.render("timingFeel-q", { ...Q.timingFeel, selected: sel("timingFeel") })}
        `)}

        ${chapter("threepart", 16, "Exercise 14 — Three-part phrase shape", `
          ${p("Beginning → build. Middle → continue. Destination → arrive. Finish → release. This is the main exercise of this class.")}
          ${PitchMatchExercise.render("mp-three", THREE_PART_EX)}
        `)}

        ${chapter("threepart", 17, "Exercise 15 — Visual phrase shaper", `
          ${narrow(p("Tap each note to label its role in the shape (tap again to cycle Start → Build → Peak → Release → Finish), then play the melody."))}
          ${shaperTiles(shaperRoles)}
          <button type="button" data-play-main class="vr-btn mt-4">${icon("play", "w-4 h-4")} Play the melody</button>
        `)}

        ${chapter("review", 18, "Exercise 16 — Recording practice", `
          ${p("Four takes, each with a different focus.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            ${recCard("take1", "Take 1 — naturally", "No particular focus.", 10)}
            ${recCard("take2", "Take 2 — focus on the peak", "The most important moment.", 10)}
            ${recCard("take3", "Take 3 — focus on the ending", "A clean release.", 10)}
            ${recCard("take4", "Take 4 — the complete shape", "Beginning → peak → ending.", 10)}
          </div>
          ${SelfAssessment.render("connectedTake-q", { ...Q.connectedTake, selected: sel("connectedTake") })}
        `)}

        ${chapter("review", 19, "Exercise 17 — One-focus improvement", `
          ${narrow(p("An important practice habit: don't try to fix everything at once. Choose one thing, and record another take focusing only on it."))}
          ${SelfAssessment.render("oneFocus-q", { ...Q.oneFocus, selected: sel("oneFocus") })}
          <div class="mt-4">${recCard("oneFocusTake", "One more take, focused on that element", "Just that one thing.", 12)}</div>
        `)}

        ${chapter("review", 20, "Common beginner problems", problems())}

        ${chapter("evaluate", 21, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("mp-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 22, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused practice — not excessive.")}
          ${Timer.render("mp-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 23, `Class ${cls.number} Assignment`, `
          ${p("Using a short original 2–3 phrase melody, complete six takes. You don't need to do all six in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Sing naturally", "No particular focus.", 14)}
            ${recCard("t2", "Take 2 — Identify the peak", "Where does it feel most important?", 14)}
            ${recCard("t3", "Take 3 — Sing toward the peak", "Gentle, not forced.", 14)}
            ${recCard("t4", "Take 4 — Add gentle dynamics", "Movement → destination → release.", 14)}
            ${recCard("t5", "Take 5 — Focus on the meaning", "What are the words communicating?", 14)}
            ${recCard("t6", "Take 6 — Final natural performance", "Bring it all together.", 15)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="mp-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="mp-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 24, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-mp", { placeholder: "e.g. I don't naturally feel where the phrase should peak. I make everything the same volume. I tend to make the peak too loud." })}
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

    /* ---- Exercise 1: destination melody ---- */
    function onPlayDest(e) {
      if (!e.target.closest("[data-play-dest]")) return;
      PianoSynth.playSequence(destNotes(base()), { duration: 0.7, gap: 0.2 });
    }
    container.addEventListener("click", onPlayDest);
    cleanups.push(() => container.removeEventListener("click", onPlayDest));

    /* ---- Exercise 2: contours ---- */
    function onPlayContour(e) {
      const btn = e.target.closest("[data-play-contour]");
      if (!btn) return;
      const notes = btn.dataset.playContour === "a" ? contourANotes(base()) : contourBNotes(base());
      PianoSynth.playSequence(notes, { duration: 0.6, gap: 0.15 });
    }
    container.addEventListener("click", onPlayContour);
    cleanups.push(() => container.removeEventListener("click", onPlayContour));

    /* ---- Exercise 5/15: main phrase playback ---- */
    function onPlayMain(e) {
      if (!e.target.closest("[data-play-main]")) return;
      PianoSynth.playSequence(mainNotes(base()), { duration: 0.65, gap: 0.2 });
    }
    container.addEventListener("click", onPlayMain);
    cleanups.push(() => container.removeEventListener("click", onPlayMain));

    /* ---- Exercise 4: reference note + vowel ---- */
    own(VirtualPiano.wire(container, "mp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so the melody stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exVowel.refresh(); exThree.refresh();
      },
    }));
    const exVowel = own(PitchMatchExercise.wire(container, "mp-vowel", VOWEL_EX, {
      classId, exerciseId: "vowel", state: (rec0().answers.exercises || {}).vowel || {},
      getNotes: () => mainNotes(base()), isComplete: VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "vowel", s); syncCheckpoints(); refreshLive(); panelVowel.refresh(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    const panelVowel = own(StabilityPanel.wire(container, "sp-vowel", {
      getTake: () => exState(rec0(), "vowel").takes.take || null,
      chain: true,
      canReveal: () => !!(exState(rec0(), "vowel").takes.take || {}).assessment,
      onRevealed: () => { set("viz", "vowel", true); refreshLive(); },
    }));

    /* ---- Exercise 7: flat vs shaped (synthesized) ---- */
    function onPlayFlatShaped(e) {
      const btn = e.target.closest("[data-play-flatshaped]");
      if (!btn) return;
      const notes = mainNotes(base());
      if (btn.dataset.playFlatshaped === "b") {
        PianoSynth.playSequence(notes.map((m, i) => ({ midi: m, velocity: i === PEAK_INDEX ? 0.85 : 0.55 - Math.abs(PEAK_INDEX - i) * 0.05 })), { duration: 0.6, gap: 0.18 });
      } else {
        PianoSynth.playSequence(notes.map((m) => ({ midi: m, velocity: 0.55 })), { duration: 0.6, gap: 0.18 });
      }
    }
    container.addEventListener("click", onPlayFlatShaped);
    cleanups.push(() => container.removeEventListener("click", onPlayFlatShaped));

    /* ---- Exercise 13: timing comparison (synthesized) ---- */
    function onPlayTiming(e) {
      const btn = e.target.closest("[data-play-timing]");
      if (!btn) return;
      const notes = mainNotes(base());
      if (btn.dataset.playTiming === "b") {
        // same underlying pulse (gap unchanged) — a gentle lean into the peak via velocity only, not timing
        PianoSynth.playSequence(notes.map((m, i) => ({ midi: m, velocity: i === PEAK_INDEX ? 0.8 : 0.55 })), { duration: 0.6, gap: 0.2 });
      } else {
        PianoSynth.playSequence(notes, { duration: 0.6, gap: 0.2, velocity: 0.6 });
      }
    }
    container.addEventListener("click", onPlayTiming);
    cleanups.push(() => container.removeEventListener("click", onPlayTiming));

    /* ---- Exercise 14: three-part chain ---- */
    const exThree = own(PitchMatchExercise.wire(container, "mp-three", THREE_PART_EX, {
      classId, exerciseId: "threePart", state: (rec0().answers.exercises || {}).threePart || {},
      getNotes: () => mainNotes(base()), isComplete: THREE_PART_EX.isComplete,
      onState: (s) => { set("exercises", "threePart", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 15: shaper tiles ---- */
    function onShaperClick(e) {
      const btn = e.target.closest("[data-shaper-tile]");
      if (!btn) return;
      const i = Number(btn.dataset.shaperTile);
      const roles = { ...(A(rec0(), "shaper").roles || {}) };
      const cur = ROLE_CYCLE.indexOf(roles[i] || "");
      const next = ROLE_CYCLE[(cur + 1) % ROLE_CYCLE.length];
      roles[i] = next;
      set("shaper", "roles", roles);
      const label = btn.querySelector(`[data-shaper-role="${i}"]`);
      if (label) label.textContent = next || "Tap to label";
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onShaperClick);
    cleanups.push(() => container.removeEventListener("click", onShaperClick));

    /* ---- Exercise 10: breath circle (visual only) ---- */
    const bc = $("[data-breath-circle]");
    if (bc) bc.classList.add("is-running");

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "destination-q": "destination", "contourA-q": "contourA", "peakNote-q": "peakNote",
      "flatShaped-q": "flatShaped", "endingFinished-q": "endingFinished", "breathSupport-q": "breathSupport",
      "wordEmphasis-q": "wordEmphasis", "meaning-q": "meaning", "timingFeel-q": "timingFeel",
      "connectedTake-q": "connectedTake", "oneFocus-q": "oneFocus",
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
      if (name === "flatShaped-q") { const m = $("[data-flatshaped-msg]"); if (m) m.textContent = "Neither is “wrong” — Version A keeps every note at the same intensity; Version B gently grows toward the peak and settles afterward. This is awareness, not correction."; }
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- all recordings ---- */
    const NAMES = {
      hum: "Hum the shape", towardPeak: "Sing toward the peak", dynShape: "Dynamics as shape", release: "Phrase release",
      wordEmphasis: "Word emphasis", meaningNeutral: "Meaning — neutral", meaningVersion: "Meaning — with intention",
      take1: "Recording practice — natural", take2: "Recording practice — focus on peak", take3: "Recording practice — focus on ending", take4: "Recording practice — complete shape",
      oneFocusTake: "One-focus improvement",
      t1: "Assignment — natural", t2: "Assignment — identify peak", t3: "Assignment — toward the peak", t4: "Assignment — dynamics", t5: "Assignment — meaning", t6: "Assignment — final performance",
    };
    const MAX_SECONDS = {
      hum: 10, towardPeak: 10, dynShape: 10, release: 10, wordEmphasis: 10, meaningNeutral: 8, meaningVersion: 8,
      take1: 10, take2: 10, take3: 10, take4: 10, oneFocusTake: 12,
      t1: 14, t2: 14, t3: 14, t4: 14, t5: 14, t6: 15,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 15,
        meta: { name: `Class 18 — ${NAMES[k]}`, exercise: `phrasing-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "mp-timer", {
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
    cleanups.push(ControlCheck.wire(container, "mp-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-mp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(ans[0]) ? ans[0] : "A phrase has direction — beginning, build, peak and release — not just a sequence of equally-weighted notes.",
        struggled: ans[2] || "",
        toPractice: ans[8] || "",
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
