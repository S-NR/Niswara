/* ============================================================
   CLASS 19 — MELODIC PATTERNS & VOCAL CONSISTENCY (interactive lesson)

   Rendered by ClassDetailPage for interactive: "melodic-patterns".

   Core idea: "Being able to sing something once is useful. Being
   able to repeat it consistently is a skill." Short, comfortable
   patterns — "consistency comes before complexity," never a
   difficult scale or an extreme note just to raise difficulty.
   Perform -> listen -> identify -> adjust -> repeat.

   Patterns (all within a comfortable range, one whole step apart):
     P_UP   degrees [0,1,2]   1 -> 2 -> 3   (the main working pattern)
     P_DOWN degrees [2,1,0]   3 -> 2 -> 1
     P_SKIP degrees [0,2,1]   1 -> 3 -> 2   (used for the memory exercise)
     P_PHRASE degrees [0,1,2,1,0]  1-2-3-2-1 (Exercise 17, pattern -> phrase)
   Exercise 1 uses its own two-note pair (degrees [0,1] / [1,0]).

   Flow: understand -> listen to a two-note pattern -> hum it ->
   three-note patterns -> pattern repeat -> pitch consistency
   (honest, PitchStability-based) -> rhythm consistency (Metronome)
   -> same notes/different rhythm (A/B) -> vowel consistency ->
   word consistency -> pattern memory (hidden, then revealed) ->
   transposition -> consistency with phrase shape -> consistency
   with dynamics -> listen before correcting -> three-take
   challenge -> tone-consistency awareness -> pattern into phrase
   -> common problems -> self-evaluate -> practice -> assignment ->
   milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard (Class 5), the full
   Metronome widget (Class 6), ObservationChecklist (Class 5),
   ControlCheck (Class 9+), PitchStability/StabilityPanel (Class 12)
   — Exercise 5's "pattern consistency" label reuses
   PitchStability.assess() across three single-note takes rather
   than inventing a new scoring system; it compares each take's
   already-honest `cents` offset from the same reference note and
   buckets the spread (More consistent / Some variation /
   Significant variation / Not enough data) using the same cent
   thresholds PitchStability already uses internally. A full
   multi-note contour-similarity metric across three takes would be
   a meaningfully larger, less honest feature (per-note alignment,
   timing normalisation); a single sustained reference note repeated
   three times demonstrates the same "can you repeat it" idea with
   the existing, already-proven engine — flagged here and in the
   changelog as a deliberate scope simplification.

   PianoSynth.playSequence() gained an optional per-note `duration`
   (additive, backward compatible — existing callers never set it)
   so Exercise 7's "same notes, different rhythm" demo can honestly
   play a long-short-short version against an equal-timing one.
   ============================================================ */

const MelodicPatternsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "recognize", label: "Recognize" },
    { id: "patterns", label: "Patterns" },
    { id: "pitch", label: "Pitch" },
    { id: "rhythm", label: "Rhythm" },
    { id: "vowel", label: "Vowel" },
    { id: "words", label: "Words" },
    { id: "memory", label: "Memory" },
    { id: "transpose", label: "Transpose" },
    { id: "connect", label: "Connect" },
    { id: "habit", label: "Habit" },
    { id: "compare", label: "Compare" },
    { id: "expand", label: "Expand" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const BPM = 72;
  const PRACTICE_TASK = "pitch";
  const PRACTICE_CATEGORY = "Melodic Patterns";
  const TWO_UP = [0, 1];
  const TWO_DOWN = [1, 0];
  const P_UP = [0, 1, 2];
  const P_DOWN = [2, 1, 0];
  const P_SKIP = [0, 2, 1];
  const P_PHRASE = [0, 1, 2, 1, 0];
  const TRANSPOSE_SHIFT = 2; // extra whole steps for Exercise 11's new starting note
  const MAX_DEGREE = 4;
  const SYLLABLE = "la";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "twoNoteRecognition", label: "Two-note recognition completed" },
    { key: "twoNoteHumming", label: "Two-note humming completed" },
    { key: "threeNotePatterns", label: "Three-note patterns completed" },
    { key: "patternRepeat", label: "Pattern repeat completed" },
    { key: "pitchConsistency", label: "Pitch consistency completed" },
    { key: "rhythmConsistency", label: "Rhythm consistency completed" },
    { key: "vowelConsistency", label: "Vowel consistency completed" },
    { key: "wordConsistency", label: "Word consistency completed" },
    { key: "patternMemory", label: "Pattern memory completed" },
    { key: "transposition", label: "Transposition exercise completed" },
    { key: "phraseShapeConsistency", label: "Phrase-shape consistency completed" },
    { key: "dynamicsConsistency", label: "Dynamics consistency completed" },
    { key: "listenBeforeCorrecting", label: "Listen-before-correcting completed" },
    { key: "threeTakeChallenge", label: "Three-take challenge completed" },
    { key: "toneAwareness", label: "Tone awareness completed" },
    { key: "patternToPhrase", label: "Pattern-to-phrase completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const YMN = YMNU.slice(0, 3);
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    twoNoteUp: { question: "Did you hear the same pattern twice?", options: [opt("yes", "Yes", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    twoNoteDown: { question: "And reversed — the same pattern twice?", options: [opt("yes", "Yes", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    humMatch: { question: "Did your second attempt sound similar to your first?", options: YMN },
    threePatterns: { question: "Could you hear each three-note pattern clearly?", options: YMNU },
    repeatMatch: { question: "Did the second attempt match your first attempt?", options: YMN },
    timingSimilar: { question: "Did your timing remain similar?", options: YMN },
    vowelStable: { question: "Did the pitch feel equally stable on each vowel?", options: YMNU },
    wordMaintain: { question: "Could you maintain pitch, rhythm and diction once the words were added?", options: YMNU },
    sameShape: { question: "Same shape, different starting pitch — could you hear that the pattern stayed the same?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    shapeConsistent: { question: "Did your musical shape remain consistent?", options: YMN },
    dynamicsIntention: { question: "Did Attempt 2 feel similar in intention to Attempt 1?", options: YMNU },
    helpedListening: { question: "Did listening before repeating help?", options: YMNU },
  };
  const TAKE_OPTIONS = [opt("1", "Take 1"), opt("2", "Take 2"), opt("3", "Take 3"), opt("unsure", "Not sure")];
  const CHALLENGE_Q = {
    bestPitch: { question: "Which had the best pitch?", options: TAKE_OPTIONS },
    bestRhythm: { question: "Which had the best rhythm?", options: TAKE_OPTIONS },
    mostConsistentTone: { question: "Which had the most consistent tone?", options: TAKE_OPTIONS },
    mostComfortable: { question: "Which felt most comfortable?", options: TAKE_OPTIONS },
    keep: { question: "Which one would you keep?", options: TAKE_OPTIONS },
  };
  const TONE_OPTIONS = ["Sudden changes", "Breathy beginnings", "Pressed sounds", "Sudden volume jumps", "Uneven vowels", "Tension", "None noticed"];

  const CHECK_ROWS = [
    { key: "recognition", area: "Pattern recognition", question: "Could I recognize a repeated pattern?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Could I repeat the notes consistently?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Could I maintain the timing?", levels: YMN_LEVELS },
    { key: "memory", area: "Memory", question: "Could I reproduce a short pattern after hearing it?", levels: YMN_LEVELS },
    { key: "tone", area: "Tone", question: "Did my tone remain reasonably consistent?", levels: YMN_LEVELS },
    { key: "repeatability", area: "Repeatability", question: "Could I produce similar results more than once?", levels: YMN_LEVELS },
    { key: "listening", area: "Listening", question: "Could I identify one thing to improve?", levels: YMN_LEVELS },
  ];

  /* ---- chain / multi-slot exercises (PitchMatchExercise) ---- */
  const VOWEL_EX = {
    eyebrow: "Exercise 8 · Vowel consistency", title: "1 → 2 → 3, on three vowels",
    intro: "The same three-note pattern, sung on AH, then EE, then OO. Connecting Class 15.",
    chain: true, refLabel: "Reference pattern",
    slots: [
      { key: "ah", label: "AH" }, { key: "ee", label: "EE" }, { key: "oo", label: "OO" },
    ],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["ah", "ee", "oo"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const PHRASE_EX = {
    eyebrow: "Exercise 17 · Pattern into phrase", title: "1 → 2 → 3 → 2 → 1, with words",
    intro: `The pattern expands into a short phrase, with simple syllables (“${SYLLABLE}”). Maintain pattern accuracy, pitch, rhythm and diction.`,
    chain: true, refLabel: "Reference phrase",
    slots: [{ key: "take", label: "Your phrase", hint: `“${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}”` }],
    assessment: { question: "Did you keep the pattern accurate while adding words?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 18 -> 17 -> 16 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c18 = (ClassActivity.get("L1C18").answers.setup || {}).note;
    if (ok(c18)) return c18;
    const c17 = (ClassActivity.get("L1C17").answers.setup || {}).note;
    if (ok(c17)) return c17;
    const c16 = (ClassActivity.get("L1C16").answers.setup || {}).note;
    if (ok(c16)) return c16;
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
    if (q(rec, "twoNoteUp") && q(rec, "twoNoteDown")) out.twoNoteRecognition = true;
    if (take(rec, "hum1") && take(rec, "hum2") && q(rec, "humMatch")) out.twoNoteHumming = true;
    if (q(rec, "threePatterns")) out.threeNotePatterns = true;
    if (take(rec, "repeat1") && take(rec, "repeat2") && q(rec, "repeatMatch")) out.patternRepeat = true;
    if (["pc1", "pc2", "pc3"].every((k) => take(rec, k))) out.pitchConsistency = true;
    if (take(rec, "rhy1") && take(rec, "rhy2") && q(rec, "timingSimilar")) out.rhythmConsistency = true;
    if (VOWEL_EX.isComplete(exState(rec, "vowel")) && q(rec, "vowelStable")) out.vowelConsistency = true;
    if (take(rec, "wordPlain") && take(rec, "wordWithLyrics") && q(rec, "wordMaintain")) out.wordConsistency = true;
    if (take(rec, "fromMemory") && A(rec, "memory").revealed) out.patternMemory = true;
    if (q(rec, "sameShape")) out.transposition = true;
    if (take(rec, "shape1") && take(rec, "shape2") && q(rec, "shapeConsistent")) out.phraseShapeConsistency = true;
    if (take(rec, "dyn1") && take(rec, "dyn2") && q(rec, "dynamicsIntention")) out.dynamicsConsistency = true;
    if (take(rec, "before") && take(rec, "after") && q(rec, "helpedListening")) out.listenBeforeCorrecting = true;
    if (["ch1", "ch2", "ch3"].every((k) => take(rec, k))) out.threeTakeChallenge = true;
    if ((A(rec, "tone").observed || []).length) out.toneAwareness = true;
    if (PHRASE_EX.isComplete(exState(rec, "phrase"))) out.patternToPhrase = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 12) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function consistencyLabel(res) {
    if (!res) return "";
    const tone = { "More consistent": "text-emerald-300", "Some variation": "text-amber-300", "Significant variation": "text-amber-300", "Not enough data": "text-ink-500" }[res.label] || "text-ink-300";
    return `<div class="rounded-2xl border border-white/5 bg-ink-950/60 p-4 mt-3">
      <p class="text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-1">Pattern consistency</p>
      <p class="font-display text-xl ${tone}">${res.label}</p>
      <p class="text-xs text-ink-500 mt-2">${res.detail}</p>
    </div>`;
  }

  function problems() {
    const items = [
      ["“I can sing the pattern once but not twice.”", "Slow down. Listen again. Repeat a shorter pattern."],
      ["“I forget the pattern.”", "Hum it first, then sing. Use only 2–3 notes."],
      ["“My second attempt is higher or lower.”", "Listen to the reference again. Use the Virtual Piano to match the starting note."],
      ["“My rhythm changes every time.”", "Use the metronome. Speak the rhythm first."],
      ["“My tone changes when I go higher.”", "Don't force the higher note. Use a comfortable range."],
      ["“I get worse when I try to be consistent.”", "Relax. Consistency does not mean tension — focus on listening rather than controlling every muscle."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["HEAR", "SING", "LISTEN", "IDENTIFY", "ADJUST", "REPEAT"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 19 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">CONSISTENCY IS CONTROL</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">A professional singer doesn't rely on luck.</p>
        <p class="text-sm text-ink-100">Good results become repeatable through listening and practice.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["twoNoteRecognition", "twoNoteHumming", "threeNotePatterns", "patternRepeat", "pitchConsistency", "rhythmConsistency", "vowelConsistency", "wordConsistency", "patternMemory", "transposition", "phraseShapeConsistency", "dynamicsConsistency", "listenBeforeCorrecting", "threeTakeChallenge", "toneAwareness", "patternToPhrase"].filter((k) => c[k]).length;
    return [
      [`Pattern exercises (${ex}/16)`, ex === 16],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">Repeating a musical idea consistently is a skill. Listen to yourself rather than blindly repeating — small, accurate patterns are more useful than forcing difficult ones.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll begin working with longer melodic lines and controlled vocal movement.` : "Next, we'll work with longer melodic lines and controlled vocal movement."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Can you sing it the same way twice?</h3>
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
    const memory = A(rec, "memory");
    const toneObserved = A(rec, "tone").observed || [];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Can you sing it the same way twice?", `
          ${p("Today we'll practise short musical patterns: you'll hear a pattern, sing it, then repeat it.")}
          ${p("The goal is <strong class=\"text-ink-100\">not</strong> perfection. The goal is <strong class=\"text-ink-100\">consistency</strong>. If a phrase is correct once but changes every time, control is still developing.")}
        `)}

        ${chapter("understand", 2, "Consistency comes before complexity", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Consistency comes before complexity.”</p>
            <p class="text-sm text-ink-200">Very short, comfortable patterns throughout — no difficult scales, no extreme notes, no added difficulty for its own sake. A simple pattern sung consistently is more valuable than a difficult pattern sung inconsistently.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("recognize", 3, "Exercise 1 — Listen to a two-note pattern", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every pattern in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("mel-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="twoUp" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play 1 → 2, twice</button>
            <button type="button" data-play-pattern="twoDown" class="vr-btn">${icon("play", "w-4 h-4")} Play 2 → 1, twice</button>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>${SelfAssessment.render("twoNoteUp-q", { ...Q.twoNoteUp, selected: sel("twoNoteUp") })}</div>
            <div>${SelfAssessment.render("twoNoteDown-q", { ...Q.twoNoteDown, selected: sel("twoNoteDown") })}</div>
          </div>
        `, { wide: true })}

        ${chapter("recognize", 4, "Exercise 2 — Hum the pattern", `
          ${narrow(p("Hum “mmm → mmm” along the 1 → 2 pattern, then do it once more."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("hum1", "Attempt 1", "“mmm → mmm”", 8)}
            ${recCard("hum2", "Attempt 2", "The same pattern again.", 8)}
          </div>
          ${SelfAssessment.render("humMatch-q", { ...Q.humMatch, selected: sel("humMatch") })}
        `)}

        ${chapter("patterns", 5, "Exercise 3 — Three-note patterns", `
          ${narrow(p("Listen to each pattern before singing — the range stays comfortable throughout."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} 1 → 2 → 3</button>
            <button type="button" data-play-pattern="down" class="vr-btn">${icon("play", "w-4 h-4")} 3 → 2 → 1</button>
            <button type="button" data-play-pattern="skip" class="vr-btn">${icon("play", "w-4 h-4")} 1 → 3 → 2</button>
          </div>
          ${SelfAssessment.render("threePatterns-q", { ...Q.threePatterns, selected: sel("threePatterns") })}
        `)}

        ${chapter("patterns", 6, "Exercise 4 — Pattern repeat", `
          ${narrow(p("Listen to 1 → 2 → 3, sing it, then immediately repeat the same pattern."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("repeat1", "Attempt 1", "1 → 2 → 3", 8)}
            ${recCard("repeat2", "Attempt 2 — immediately after", "The same pattern again.", 8)}
          </div>
          ${SelfAssessment.render("repeatMatch-q", { ...Q.repeatMatch, selected: sel("repeatMatch") })}
        `)}

        ${chapter("pitch", 7, "Exercise 5 — Pitch consistency", `
          ${narrow(p("Sing your reference note three times, naturally. No fake “professional score” here — just an honest comparison of how close the three attempts landed to each other."))}
          <div class="grid sm:grid-cols-3 gap-3 mb-3">
            ${recCard("pc1", "Attempt 1", "", 6)}
            ${recCard("pc2", "Attempt 2", "", 6)}
            ${recCard("pc3", "Attempt 3", "", 6)}
          </div>
          <div data-consistency-out></div>
        `)}

        ${chapter("rhythm", 8, "Exercise 6 — Rhythmic consistency", `
          ${narrow(p("Sing or hum 1 — 2 — 3 with the metronome, then repeat."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("mel-metro", { bpm: BPM })}
          </div>
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("rhy1", "Attempt 1", "With the metronome.", 8)}
            ${recCard("rhy2", "Attempt 2 — repeat", "The same timing.", 8)}
          </div>
          ${SelfAssessment.render("timingSimilar-q", { ...Q.timingSimilar, selected: sel("timingSimilar") })}
        `, { wide: true })}

        ${chapter("rhythm", 9, "Exercise 7 — Same notes, different rhythm", `
          ${p("Same three notes (1 → 2 → 3) — only the rhythm changes.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version A — equal timing</p><button type="button" data-play-rhythmdemo="a" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version B — long → short → short</p><button type="button" data-play-rhythmdemo="b" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          <p class="text-sm text-ink-300">The melody didn't change — only the rhythm did. That's the difference between <strong class="text-ink-100">pitch</strong> and <strong class="text-ink-100">rhythm</strong>.</p>
        `)}

        ${chapter("vowel", 10, "Exercise 8 — Vowel consistency", `
          ${PitchMatchExercise.render("mel-vowel", VOWEL_EX)}
          <div class="mt-4">${SelfAssessment.render("vowelStable-q", { ...Q.vowelStable, selected: sel("vowelStable") })}</div>
        `)}

        ${chapter("words", 11, "Exercise 9 — Word consistency", `
          ${narrow(p(`Sing 1 → 2 → 3 on “${SYLLABLE}”, repeat, then add simple words — maintaining pitch, rhythm and diction.`))}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("wordPlain", `On “${SYLLABLE}”`, "1 → 2 → 3", 8)}
            ${recCard("wordWithLyrics", "With words added", `“${SYLLABLE}-${SYLLABLE}-${SYLLABLE}”`, 8)}
          </div>
          ${SelfAssessment.render("wordMaintain-q", { ...Q.wordMaintain, selected: sel("wordMaintain") })}
        `)}

        ${chapter("memory", 12, "Exercise 10 — Pattern memory", `
          ${narrow(p("A short pattern plays once — the notes aren't shown yet. Listen, then try to reproduce it from memory."))}
          <button type="button" data-play-memory class="vr-btn vr-btn-gold mb-4">${icon("play", "w-4 h-4")} Play the pattern (hidden)</button>
          ${recCard("fromMemory", "Sing it back from memory", "Just what you remember.", 8)}
          <div class="mt-4">
            ${memory.revealed ? `<p class="text-sm text-ink-200">The pattern was: <strong class="text-ink-50">1 → 3 → 2</strong>.</p>` : `<button type="button" data-reveal-memory class="text-sm text-gold-300 underline">Reveal the pattern</button>`}
          </div>
        `)}

        ${chapter("transpose", 13, "Exercise 11 — Pattern with small transpose", `
          ${narrow(p("The same pattern, moved to a different comfortable starting note. The shape stays the same — only the starting pitch changes."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-transpose="original" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Original starting note</button>
            <button type="button" data-play-transpose="shifted" class="vr-btn">${icon("play", "w-4 h-4")} New starting note</button>
          </div>
          ${SelfAssessment.render("sameShape-q", { ...Q.sameShape, selected: sel("sameShape") })}
        `)}

        ${chapter("connect", 14, "Exercise 12 — Consistency with phrase shape", `
          ${narrow(p("Connecting Class 18: beginning → build → peak → release. Sing the pattern twice, preserving the same musical shape both times."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("shape1", "Attempt 1", "Beginning → build → peak → release.", 8)}
            ${recCard("shape2", "Attempt 2", "Try to preserve the same shape.", 8)}
          </div>
          ${SelfAssessment.render("shapeConsistent-q", { ...Q.shapeConsistent, selected: sel("shapeConsistent") })}
        `)}

        ${chapter("connect", 15, "Exercise 13 — Consistency with dynamics", `
          ${narrow(p("Connecting Class 14. The objective is not identical volume — it's similar musical intention. Consistency does not mean becoming robotic."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("dyn1", "Attempt 1 — natural dynamics", "", 8)}
            ${recCard("dyn2", "Attempt 2 — repeat the same dynamics", "", 8)}
          </div>
          ${SelfAssessment.render("dynamicsIntention-q", { ...Q.dynamicsIntention, selected: sel("dynamicsIntention") })}
        `)}

        ${chapter("habit", 16, "Exercise 14 — Listen before correcting", `
          ${narrow(p("A professional practice habit: perform → listen → identify ONE problem → adjust → repeat. Don't immediately repeat without listening."))}
          <div class="flex flex-wrap items-center justify-center gap-2 my-4">
            ${["PERFORM", "LISTEN", "IDENTIFY", "ADJUST", "REPEAT"].map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
          </div>
          ${recCard("before", "Record a take", "Any comfortable pattern.", 10)}
          <div class="mt-3">${recCard("after", "Listen back, identify one thing, then record again", "Adjust only that one thing.", 10)}</div>
          <div class="mt-4">${SelfAssessment.render("helpedListening-q", { ...Q.helpedListening, selected: sel("helpedListening") })}</div>
        `)}

        ${chapter("compare", 17, "Exercise 15 — Three-take challenge", `
          ${p("Record three takes of a short, comfortable pattern, then compare them honestly. There's no automatic “best” — this is about developing your own listening judgment.")}
          <div class="grid sm:grid-cols-3 gap-3 mb-4">
            ${recCard("ch1", "Take 1", "", 8)}
            ${recCard("ch2", "Take 2", "", 8)}
            ${recCard("ch3", "Take 3", "", 8)}
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${Object.entries(CHALLENGE_Q).map(([k, cfg]) => `<div>${SelfAssessment.render(`${k}-q`, { ...cfg, selected: sel(k) })}</div>`).join("")}
          </div>
        `)}

        ${chapter("compare", 18, "Exercise 16 — Vocal tone consistency", `
          ${narrow(p("Tone can naturally change — the goal isn't an identical voice on every note. Listening back over today's takes, did any of these occur? This isn't labelling your voice good or bad, just noticing."))}
          ${ObservationChecklist.render("mel-tone", [{ key: "observed", title: "", prompt: "Choose any that fit.", options: TONE_OPTIONS }], { observed: toneObserved })}
        `)}

        ${chapter("expand", 19, "Exercise 17 — Pattern into phrase", `
          ${PitchMatchExercise.render("mel-phrase", PHRASE_EX)}
        `)}

        ${chapter("expand", 20, "Common beginner problems", problems())}

        ${chapter("evaluate", 21, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("mel-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 22, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused practice — repetition doesn't need to be excessive.")}
          ${Timer.render("mel-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 23, `Class ${cls.number} Assignment`, `
          ${p("Using a short 3–5 note pattern, complete six takes. You don't need to do all six in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Listen and sing", "", 10)}
            ${recCard("t2", "Take 2 — Repeat without changing it", "", 10)}
            ${recCard("t3", "Take 3 — Listen to both recordings", "Then record once more.", 10)}
            ${recCard("t4", "Take 4 — Identify ONE difference", "Record while focusing on noticing it.", 10)}
            ${recCard("t5", "Take 5 — Correct only that difference", "", 10)}
            ${recCard("t6", "Take 6 — Record naturally", "", 10)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="mel-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="mel-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 24, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-mel", { placeholder: "e.g. I lose the starting pitch. I can repeat two-note patterns. My rhythm changes between attempts." })}
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

    /* ---- Exercises 1/3: pattern playback ---- */
    const PATTERNS = { twoUp: TWO_UP, twoDown: TWO_DOWN, up: P_UP, down: P_DOWN, skip: P_SKIP };
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const degrees = PATTERNS[btn.dataset.playPattern];
      const notes = degreesToNotes(base(), degrees);
      const repeatTwice = btn.dataset.playPattern === "twoUp" || btn.dataset.playPattern === "twoDown";
      PianoSynth.playSequence(repeatTwice ? [...notes, ...notes] : notes, { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- reference piano ---- */
    own(VirtualPiano.wire(container, "mel-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so every pattern stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exVowel.refresh(); exPhrase.refresh();
      },
    }));

    /* ---- Exercise 5: pitch consistency (honest, PitchStability-based) ---- */
    const analysisCache = new Map();
    async function analysisFor(mediaId) {
      if (analysisCache.has(mediaId)) return analysisCache.get(mediaId);
      let blob = await Media.getBlob(mediaId).catch(() => null);
      if (!blob) { const url = await Media.getUrl(mediaId).catch(() => null); blob = url ? await fetch(url).then((r) => r.blob()).catch(() => null) : null; }
      const res = blob ? await PitchAnalysis.analyzeBlob(blob).catch(() => null) : null;
      analysisCache.set(mediaId, res);
      return res;
    }
    async function updateConsistency() {
      const host = $("[data-consistency-out]");
      if (!host) return;
      const ids = ["pc1", "pc2", "pc3"].map((k) => { const t = take(rec0(), k); return t ? t.mediaId : null; }).filter(Boolean);
      if (ids.length < 2) { host.innerHTML = consistencyLabel({ label: "Not enough data", detail: "Record at least two attempts to compare." }); return; }
      const ref = base();
      const cents = [];
      for (const id of ids) {
        const analysis = await analysisFor(id);
        if (!analysis) continue;
        const res = PitchStability.assess(analysis, ref);
        if (res.reliable) cents.push(res.cents);
      }
      if (cents.length < 2) { host.innerHTML = consistencyLabel({ label: "Not enough data", detail: "Your takes were too soft, short or unclear to compare reliably." }); return; }
      const spread = Math.max(...cents) - Math.min(...cents);
      const result = spread <= 40
        ? { label: "More consistent", detail: "Your attempts landed close to the same pitch — small natural variation is normal." }
        : spread <= 90
        ? { label: "Some variation", detail: "A noticeable but modest difference between attempts — completely normal at this stage." }
        : { label: "Significant variation", detail: "A clear difference between attempts. Useful to know, not a problem — try listening to the reference again before each take." };
      host.innerHTML = consistencyLabel(result);
    }
    updateConsistency();

    /* ---- Exercise 6: metronome ---- */
    own(Metronome.wire(container, "mel-metro", { bpm: BPM }));

    /* ---- Exercise 7: same notes, different rhythm (synthesized) ---- */
    function onPlayRhythmDemo(e) {
      const btn = e.target.closest("[data-play-rhythmdemo]");
      if (!btn) return;
      const notes = degreesToNotes(base(), P_UP);
      if (btn.dataset.playRhythmdemo === "b") {
        PianoSynth.playSequence(notes.map((m, i) => ({ midi: m, duration: i === 0 ? 0.9 : 0.35 })), { duration: 0.6, gap: 0.15 });
      } else {
        PianoSynth.playSequence(notes, { duration: 0.6, gap: 0.2 });
      }
    }
    container.addEventListener("click", onPlayRhythmDemo);
    cleanups.push(() => container.removeEventListener("click", onPlayRhythmDemo));

    /* ---- Exercise 8: vowel consistency ---- */
    const exVowel = own(PitchMatchExercise.wire(container, "mel-vowel", VOWEL_EX, {
      classId, exerciseId: "vowel", state: (rec0().answers.exercises || {}).vowel || {},
      getNotes: () => degreesToNotes(base(), P_UP), isComplete: VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "vowel", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 10: pattern memory ---- */
    function onPlayMemory(e) {
      if (!e.target.closest("[data-play-memory]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), P_SKIP), { duration: 0.65, gap: 0.2 });
    }
    container.addEventListener("click", onPlayMemory);
    cleanups.push(() => container.removeEventListener("click", onPlayMemory));
    function onRevealMemory(e) {
      if (!e.target.closest("[data-reveal-memory]")) return;
      set("memory", "revealed", true);
      syncCheckpoints(); refreshLive();
      const host = e.target.closest("div");
      if (host) host.innerHTML = `<p class="text-sm text-ink-200">The pattern was: <strong class="text-ink-50">1 → 3 → 2</strong>.</p>`;
    }
    container.addEventListener("click", onRevealMemory);
    cleanups.push(() => container.removeEventListener("click", onRevealMemory));

    /* ---- Exercise 11: transpose demo ---- */
    function onPlayTranspose(e) {
      const btn = e.target.closest("[data-play-transpose]");
      if (!btn) return;
      const shift = btn.dataset.playTranspose === "shifted" ? TRANSPOSE_SHIFT : 0;
      PianoSynth.playSequence(degreesToNotes(base() + shift * STEP, P_UP), { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayTranspose);
    cleanups.push(() => container.removeEventListener("click", onPlayTranspose));

    /* ---- Exercise 17: pattern into phrase ---- */
    const exPhrase = own(PitchMatchExercise.wire(container, "mel-phrase", PHRASE_EX, {
      classId, exerciseId: "phrase", state: (rec0().answers.exercises || {}).phrase || {},
      getNotes: () => degreesToNotes(base(), P_PHRASE), isComplete: PHRASE_EX.isComplete,
      onState: (s) => { set("exercises", "phrase", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 16: tone-awareness checklist ---- */
    cleanups.push(ObservationChecklist.wire(container, "mel-tone", {
      selected: { observed: A(rec0(), "tone").observed || [] },
      onChange: (_, values) => { set("tone", "observed", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "twoNoteUp-q": "twoNoteUp", "twoNoteDown-q": "twoNoteDown", "humMatch-q": "humMatch",
      "threePatterns-q": "threePatterns", "repeatMatch-q": "repeatMatch", "timingSimilar-q": "timingSimilar",
      "vowelStable-q": "vowelStable", "wordMaintain-q": "wordMaintain", "sameShape-q": "sameShape",
      "shapeConsistent-q": "shapeConsistent", "dynamicsIntention-q": "dynamicsIntention", "helpedListening-q": "helpedListening",
      "bestPitch-q": "bestPitch", "bestRhythm-q": "bestRhythm", "mostConsistentTone-q": "mostConsistentTone",
      "mostComfortable-q": "mostComfortable", "keep-q": "keep",
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
      hum1: "Hum — attempt 1", hum2: "Hum — attempt 2", repeat1: "Pattern repeat — attempt 1", repeat2: "Pattern repeat — attempt 2",
      pc1: "Pitch consistency — attempt 1", pc2: "Pitch consistency — attempt 2", pc3: "Pitch consistency — attempt 3",
      rhy1: "Rhythm consistency — attempt 1", rhy2: "Rhythm consistency — attempt 2",
      wordPlain: "Word consistency — on syllable", wordWithLyrics: "Word consistency — with words",
      fromMemory: "Pattern memory", shape1: "Phrase-shape consistency — attempt 1", shape2: "Phrase-shape consistency — attempt 2",
      dyn1: "Dynamics consistency — attempt 1", dyn2: "Dynamics consistency — attempt 2",
      before: "Listen before correcting — before", after: "Listen before correcting — after",
      ch1: "Three-take challenge — take 1", ch2: "Three-take challenge — take 2", ch3: "Three-take challenge — take 3",
      t1: "Assignment — listen and sing", t2: "Assignment — repeat", t3: "Assignment — listen to both", t4: "Assignment — identify difference", t5: "Assignment — correct difference", t6: "Assignment — natural",
    };
    const MAX_SECONDS = {
      hum1: 8, hum2: 8, repeat1: 8, repeat2: 8, pc1: 6, pc2: 6, pc3: 6, rhy1: 8, rhy2: 8,
      wordPlain: 8, wordWithLyrics: 8, fromMemory: 8, shape1: 8, shape2: 8, dyn1: 8, dyn2: 8,
      before: 10, after: 10, ch1: 8, ch2: 8, ch3: 8,
      t1: 10, t2: 10, t3: 10, t4: 10, t5: 10, t6: 10,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 12,
        meta: { name: `Class 19 — ${NAMES[k]}`, exercise: `pattern-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive();
          if (k === "pc1" || k === "pc2" || k === "pc3") updateConsistency();
        },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "mel-timer", {
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
    cleanups.push(ControlCheck.wire(container, "mel-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-mel", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Repeating a musical idea consistently is a skill — small, accurate patterns beat forcing difficult ones.",
        struggled: ans[7] || "",
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
