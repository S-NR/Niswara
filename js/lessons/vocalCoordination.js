/* ============================================================
   CLASS 21 — VOCAL COORDINATION & LONGER MELODIC PATTERNS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vocal-coordination".

   Core idea: "Keep several singing skills working together as the
   melody becomes longer." NOT advanced vocal agility — coordination.
   "Longer does not mean harder." Never push, never increase volume,
   never reach for extreme notes, never rush, never practise until
   tired. "Accuracy first. Speed later."

   The optional Warm-up prompt needs no new code here either —
   every interactive lesson already renders it automatically via
   `LessonKit.header()` -> `WarmupPrompt.classCard(cls)` (Common ->
   Warm-up). Its "Warm-up completed/skipped" checkpoint simply fires
   once the class is reachable, exactly as Class 20's did.

   One main 5-note pattern (degrees 0-1-2-1-0, i.e. 1-2-3-2-1) and
   an optional, wider 7-note one (0-1-2-3-2-1-0, i.e. 1-2-3-4-3-2-1)
   carry almost the whole class — hummed, grouped, sung on three
   vowels and three syllables, given simple words, shaped, given
   gentle dynamics, reviewed for pitch consistency, compared across
   three takes, tried slow-to-normal and from memory, then turned
   into the class's main integration exercise. The lyric phrase
   ("I want to sing today," 5 words) maps one word to each of the
   5-note pattern's notes, the same shape Classes 16/19/20 already
   use for word-to-note mapping.

   Flow: understand -> five-note pattern -> reverse/wider pattern ->
   break into groups -> pitch + rhythm -> listen/sing/check cycle ->
   longer hum -> vowel transition -> simple syllables -> add words ->
   breath management -> maintaining phrase shape (Class 18) ->
   maintaining dynamics (Class 14) -> maintaining pitch while moving
   (Class 12's StabilityPanel, reused as-is) -> consistency across
   three takes -> slow to normal -> pattern memory -> pattern into a
   musical phrase (the main integration exercise) -> targeted
   practice -> common problems -> self-evaluate -> practice ->
   assignment -> milestone.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard (Class 5), ObservationChecklist (Class 5), the
   full Metronome widget (Class 6), StabilityPanel (Class 12), a
   local single-mark copy of the Class 11/16/17 breath-marker
   pattern, ControlCheck (Class 9+). No shared component needed
   changes — this class is built entirely from existing engines.
   ============================================================ */

const VocalCoordinationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "pattern", label: "Pattern" },
    { id: "cycle", label: "Cycle" },
    { id: "hum", label: "Hum" },
    { id: "vowel", label: "Vowel" },
    { id: "syllable", label: "Syllable" },
    { id: "words", label: "Words" },
    { id: "shape", label: "Shape" },
    { id: "pitch", label: "Pitch" },
    { id: "compare", label: "Compare" },
    { id: "memory", label: "Memory" },
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
  const PRACTICE_CATEGORY = "Vocal Coordination";
  const MAX_DEGREE = 3;
  const P5 = [0, 1, 2, 1, 0]; // 1 -> 2 -> 3 -> 2 -> 1, the main pattern
  const P7 = [0, 1, 2, 3, 2, 1, 0]; // 1 -> 2 -> 3 -> 4 -> 3 -> 2 -> 1, optional wider pattern
  const GROUP_A = [0, 1, 2]; // 1 -> 2 -> 3
  const GROUP_B = [3, 2, 1, 0]; // 4 -> 3 -> 2 -> 1
  const LYRIC_WORDS = ["I", "want", "to", "sing", "today"]; // one word per P5 note
  const SYLLABLE = "la";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmup", label: "Warm-up completed/skipped" },
    { key: "fiveNotePattern", label: "Five-note pattern completed" },
    { key: "patternGrouping", label: "Pattern grouping completed" },
    { key: "pitchRhythm", label: "Pitch + rhythm completed" },
    { key: "listeningCycle", label: "Listening cycle completed" },
    { key: "longerHumming", label: "Longer humming completed" },
    { key: "vowelTransition", label: "Vowel transition completed" },
    { key: "syllableExercise", label: "Syllable exercise completed" },
    { key: "lyricsAdded", label: "Lyrics added" },
    { key: "breathEx", label: "Breath exercise completed" },
    { key: "phraseShapeEx", label: "Phrase-shape exercise completed" },
    { key: "dynamicsEx", label: "Dynamics exercise completed" },
    { key: "pitchConsistencyReviewed", label: "Pitch consistency reviewed" },
    { key: "threeTakeComparison", label: "Three-take comparison completed" },
    { key: "slowToNormal", label: "Slow-to-normal exercise completed" },
    { key: "patternMemory", label: "Pattern memory completed" },
    { key: "patternToPhrase", label: "Pattern-to-phrase completed" },
    { key: "targetedPractice", label: "Targeted practice completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    easierPattern: { question: "Which pattern was easier to remember?", options: [opt("first", "First"), opt("second", "Second"), opt("same", "About the same", "neutral"), opt("unsure", "Not sure")] },
    vowelDiffer: { question: "Did the pattern feel different with each vowel?", options: YMNU },
    wordMaintain: { question: "Could you maintain pitch, rhythm and diction once the words were added?", options: YMNU },
    weakestPart: { question: "What is the weakest part?", options: ["Starting note", "Ascending movement", "Descending movement", "Middle notes", "Ending note", "Rhythm", "Breath", "Words", "Diction", "Dynamics", "Not sure"].map((o) => opt(o.toLowerCase().replace(/\s+/g, "-"), o)) },
  };
  const CHANGED_OPTIONS = ["Pitch", "Rhythm", "Starting note", "Ending note", "Movement", "Volume", "Nothing obvious", "Not sure"];
  const TAKE_OPTIONS = [opt("1", "Take 1"), opt("2", "Take 2"), opt("3", "Take 3"), opt("unsure", "Not sure")];
  const TAKE_Q = {
    mostConsistent: { question: "Which take was most consistent?", options: TAKE_OPTIONS },
    mostComfortableTake: { question: "Which felt most comfortable?", options: TAKE_OPTIONS },
    clearestMelody: { question: "Which had the clearest melody?", options: TAKE_OPTIONS },
    keepTake: { question: "Which would you keep?", options: TAKE_OPTIONS },
  };

  const CHECK_ROWS = [
    { key: "memory", area: "Pattern memory", question: "Could I remember the pattern?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Did I maintain reasonable pitch?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Did I stay in time?", levels: YMN_LEVELS },
    { key: "movement", area: "Movement", question: "Could I move between notes smoothly?", levels: YMN_LEVELS },
    { key: "breath", area: "Breath", question: "Was my breathing comfortable?", levels: YMN_LEVELS },
    { key: "diction", area: "Diction", question: "Could I keep the words clear?", levels: YMN_LEVELS },
    { key: "shape", area: "Phrase shape", question: "Did the melody feel like one musical line?", levels: YMN_LEVELS },
    { key: "consistency", area: "Consistency", question: "Could I repeat it similarly?", levels: YMN_LEVELS },
    { key: "comfort", area: "Comfort", question: "Did I remain relaxed?", levels: YMN_LEVELS },
  ];

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const VOWEL_EX = {
    eyebrow: "Exercise 7 · Vowel transition", title: "1 → 2 → 3 → 2 → 1, on three vowels",
    intro: "The same pattern on AH, then OO, then EE.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "ah", label: "AH" }, { key: "oo", label: "OO" }, { key: "ee", label: "EE" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["ah", "oo", "ee"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const SYLLABLE_EX = {
    eyebrow: "Exercise 8 · Simple syllables", title: "1 → 2 → 3 → 2 → 1, on three syllables",
    intro: "LA–LA–LA–LA–LA, then NA–NA–NA–NA–NA, then MA–MA–MA–MA–MA. Keep the volume comfortable.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "la", label: "LA" }, { key: "na", label: "NA" }, { key: "ma", label: "MA" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["la", "na", "ma"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };
  const PITCH_WHILE_MOVING_EX = {
    eyebrow: "Exercise 13 · Pitch while moving", title: "Starting, middle, ending note",
    intro: "Sing the pattern, then look at the estimated pitch — after you've judged it by ear.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "take", label: "Your pattern", hint: "1 → 2 → 3 → 2 → 1" }],
    assessment: { question: "Did the starting, middle and ending notes all feel reasonably stable?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };
  const PHRASE_EX = {
    eyebrow: "Exercise 17 · Pattern into a phrase", title: "1 → 2 → 3 → 2 → 1, with words",
    intro: `The main exercise of this class: combine the pattern with rhythm, lyrics (“${SYLLABLE}” or your own words), breath, dynamics and phrase shape — all at once.`,
    chain: true, refLabel: "Reference phrase",
    slots: [{ key: "take", label: "Your phrase", hint: `“${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}-${SYLLABLE}”` }],
    assessment: { question: "Did this feel like one connected musical line?", options: YMNU },
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 20 -> 19 -> 18 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c20 = (ClassActivity.get("L1C20").answers.setup || {}).note;
    if (ok(c20)) return c20;
    const c19 = (ClassActivity.get("L1C19").answers.setup || {}).note;
    if (ok(c19)) return c19;
    const c18 = (ClassActivity.get("L1C18").answers.setup || {}).note;
    if (ok(c18)) return c18;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  /* ---- single-mark breath phrase editor (local copy of Class 11/16/17's pattern) ---- */
  function renderBreathEditor(id, words, mark) {
    const gaps = words.map((w, i) => `
      <span class="font-display text-lg text-ink-100">${Utils.escapeHtml(w)}</span>
      ${i < words.length - 1 ? `<button type="button" data-breath-gap="${i}" class="inline-flex items-center justify-center w-7 h-7 rounded-full text-base transition-colors ${mark === i ? "bg-gold-500/20 text-gold-200" : "text-ink-600 hover:text-ink-300 hover:bg-white/5"}" aria-label="Breath mark after ${Utils.escapeHtml(w)}">${mark === i ? "💨" : "·"}</button>` : ""}
    `).join("");
    return `<div class="flex flex-wrap items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4" data-breath="${id}">${gaps}</div>`;
  }
  function wireBreathEditor(container, id, { selected = null, onChange }) {
    const root = container.querySelector(`[data-breath="${id}"]`);
    if (!root) return () => {};
    let mark = selected;
    function onClick(e) {
      const btn = e.target.closest("[data-breath-gap]");
      if (!btn) return;
      const i = Number(btn.dataset.breathGap);
      mark = mark === i ? null : i;
      root.querySelectorAll("[data-breath-gap]").forEach((b) => {
        const on = Number(b.dataset.breathGap) === mark;
        b.textContent = on ? "💨" : "·";
        b.classList.toggle("bg-gold-500/20", on);
        b.classList.toggle("text-gold-200", on);
        b.classList.toggle("text-ink-600", !on);
      });
      if (onChange) onChange(mark);
    }
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  const ASSIGN_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    out.warmup = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (take(rec, "humP5")) out.fiveNotePattern = true;
    if (["groupA", "groupB", "reconnected"].every((k) => take(rec, k))) out.patternGrouping = true;
    if (take(rec, "pitchRhythm")) out.pitchRhythm = true;
    if (take(rec, "checkCycle") && (A(rec, "cycle").changed || []).length) out.listeningCycle = true;
    if (take(rec, "longerHum")) out.longerHumming = true;
    if (VOWEL_EX.isComplete(exState(rec, "vowel")) && q(rec, "vowelDiffer")) out.vowelTransition = true;
    if (SYLLABLE_EX.isComplete(exState(rec, "syllable"))) out.syllableExercise = true;
    if (["speak", "speakRhythm", "singSlow", "singNatural"].every((k) => take(rec, k))) out.lyricsAdded = true;
    if (typeof A(rec, "breath").mark === "number") out.breathEx = true;
    if (take(rec, "phraseShape")) out.phraseShapeEx = true;
    if (take(rec, "dynNatural") && take(rec, "dynShaped")) out.dynamicsEx = true;
    if (PITCH_WHILE_MOVING_EX.isComplete(exState(rec, "pitchMoving")) && A(rec, "viz").pitchMoving) out.pitchConsistencyReviewed = true;
    if (["take1", "take2", "take3"].every((k) => take(rec, k))) out.threeTakeComparison = true;
    if (take(rec, "slowTake") && take(rec, "normalTake")) out.slowToNormal = true;
    if (take(rec, "fromMemory") && A(rec, "memory").revealed) out.patternMemory = true;
    if (PHRASE_EX.isComplete(exState(rec, "phrase"))) out.patternToPhrase = true;
    if (q(rec, "weakestPart") && take(rec, "targetedTake")) out.targetedPractice = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const lyricLine = (words) => `<p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;

  function problems() {
    const items = [
      ["“I lose the melody halfway through.”", "Break it into smaller groups."],
      ["“My ending note becomes unstable.”", "Practise only the last 2–3 notes."],
      ["“I run out of breath.”", "Shorten the phrase. Use a comfortable breath."],
      ["“My pitch changes when I add words.”", "Return to humming. Then add syllables. Then words."],
      ["“My voice becomes louder as the pattern goes higher.”", "Don't push. Reduce volume. Return to a comfortable range."],
      ["“I can do it slowly but not at normal speed.”", "Stay slow. Speed is not the goal."],
      ["“I become tense after several repetitions.”", "Stop. Rest. Resume only if comfortable."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const parts = ["PITCH", "RHYTHM", "BREATH", "MOVEMENT", "WORDS", "EXPRESSION"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 21 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">COORDINATION</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-4">
          ${parts.map((t, i) => `<span class="flow-chip !text-sm">${t}</span>${i < parts.length - 1 ? `<span class="text-gold-300">+</span>` : ""}`).join("")}
        </div>
        <p class="text-gold-300 text-xl mb-1">↓</p>
        <p class="font-display text-2xl text-teal-200 mb-5">ONE CONNECTED MUSICAL LINE</p>
        <p class="text-sm text-ink-300">Good singing is not one skill.</p>
        <p class="text-sm text-ink-100">It is many small skills working together without fighting each other.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["fiveNotePattern", "patternGrouping", "pitchRhythm", "listeningCycle", "longerHumming", "vowelTransition", "syllableExercise", "lyricsAdded", "breathEx", "phraseShapeEx", "dynamicsEx", "pitchConsistencyReviewed", "threeTakeComparison", "slowToNormal", "patternMemory", "patternToPhrase", "targetedPractice"].filter((k) => c[k]).length;
    return [
      [`Coordination exercises (${ex}/17)`, ex === 17],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can break a difficult melody into smaller pieces, and coordinate pitch, rhythm, breath and words. You don't need to sing quickly to improve — you can listen to yourself, identify one problem, and work on that problem separately.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">${next.levelId > cls.levelId ? `Level ${next.levelId} — ` : `Class ${next.number} — `}${next.title}</strong>, we'll begin working on vocal articulation and agility in a very gentle way.` : "More is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Keep everything connected as the melody gets longer.</h3>
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
    const breath = A(rec, "breath");
    const cycleChanged = A(rec, "cycle").changed || [];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Keep everything connected as the melody gets longer", `
          ${p("In earlier classes you practised one note, two notes, three-note patterns, short phrases and simple melodic movement. Now the patterns get slightly longer.")}
          ${p("The challenge is <strong class=\"text-ink-100\">not</strong> speed. The challenge is <strong class=\"text-ink-100\">coordination</strong>.")}
          ${flowStrip(["PITCH", "RHYTHM", "BREATH", "MOVEMENT", "DICTION", "RELAXATION", "PHRASE SHAPE"])}
        `)}

        ${chapter("understand", 2, "Longer does not mean harder", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Longer does not mean harder.”</p>
            <p class="text-sm text-ink-200">The number of notes increases gradually. We will not push the voice, increase volume, use extreme notes, sing quickly, or practise until the voice is tired. If a pattern becomes difficult: slow it down, shorten it, or return to a comfortable range.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("pattern", 3, "Exercise 1 — Five-note pattern", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every pattern in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="p5" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play 1 → 2 → 3 → 2 → 1</button>
          </div>
          ${recCard("humP5", "Hum the pattern", "“mmm” — 1 → 2 → 3 → 2 → 1", 10)}
        `, { wide: true })}

        ${chapter("pattern", 4, "Exercise 2 — Reverse / wider pattern", `
          ${narrow(p("The same pattern, then an optional wider one: 1 → 2 → 3 → 4 → 3 → 2 → 1. Keep it within a comfortable range."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="p5" class="vr-btn">${icon("play", "w-4 h-4")} Play the first pattern</button>
            <button type="button" data-play-pattern="p7" class="vr-btn">${icon("play", "w-4 h-4")} Play the wider pattern</button>
          </div>
          ${SelfAssessment.render("easierPattern-q", { ...Q.easierPattern, selected: sel("easierPattern") })}
        `)}

        ${chapter("pattern", 5, "Exercise 3 — Break the pattern into groups", `
          ${narrow(p("When a longer pattern feels difficult, divide it into smaller musical pieces. Instead of 1→2→3→4→3→2→1 as one long pattern: practise 1→2→3, then 4→3→2→1, separately — then reconnect them."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="groupA" class="vr-btn">${icon("play", "w-4 h-4")} Play group A (1→2→3)</button>
            <button type="button" data-play-pattern="groupB" class="vr-btn">${icon("play", "w-4 h-4")} Play group B (4→3→2→1)</button>
          </div>
          <div class="grid sm:grid-cols-3 gap-3">
            ${recCard("groupA", "Group A", "1 → 2 → 3", 8)}
            ${recCard("groupB", "Group B", "4 → 3 → 2 → 1", 8)}
            ${recCard("reconnected", "Reconnected", "Both groups, together.", 10)}
          </div>
        `)}

        ${chapter("pattern", 6, "Exercise 4 — Pitch + rhythm", `
          ${narrow(p("One note per beat, then the same pattern with a simple rhythmic variation. Don't increase speed unnecessarily."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("vc-metro", { bpm: BPM })}
          </div>
          ${recCard("pitchRhythm", "1 — 2 — 3 — 2 — 1, one note per beat", "", 10)}
        `, { wide: true })}

        ${chapter("cycle", 7, "Exercise 5 — Listen → Sing → Check", `
          ${flowStrip(["HEAR", "SING", "LISTEN", "CHECK", "REPEAT"])}
          ${recCard("checkCycle", "Sing the pattern, then listen back", "", 10)}
          <div class="mt-4">${ObservationChecklist.render("vc-changed", [{ key: "changed", title: "What changed between the reference and your recording?", prompt: "Choose any that fit.", options: CHANGED_OPTIONS }], { changed: cycleChanged })}</div>
        `)}

        ${chapter("hum", 8, "Exercise 6 — Longer hum", `
          ${narrow(p("Hum the five-note pattern, then six or seven notes if comfortable. The objective is smooth connection — watch for sudden tension, uneven volume, pitch drops or jumps, and breath interruption. Don't force a single breath for a pattern that's too long."))}
          ${recCard("longerHum", "Hum the longer pattern", "1 → 2 → 3 → 4 → 3 → 2 → 1, if comfortable.", 12)}
        `)}

        ${chapter("vowel", 9, "Exercise 7 — Vowel transition", `
          ${PitchMatchExercise.render("vc-vowel", VOWEL_EX)}
          <div class="mt-4">${SelfAssessment.render("vowelDiffer-q", { ...Q.vowelDiffer, selected: sel("vowelDiffer") })}</div>
        `)}

        ${chapter("syllable", 10, "Exercise 8 — Simple syllables", `
          ${PitchMatchExercise.render("vc-syllable", SYLLABLE_EX)}
        `)}

        ${chapter("words", 11, "Exercise 9 — Add simple words", `
          ${narrow(p("WORDS → RHYTHM → MELODY → SINGING, connecting Classes 15–16."))}
          ${lyricLine(LYRIC_WORDS)}
          <ol class="flex flex-col gap-4 mt-4">
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">1</span>Speak:</p>${recCard("speak", "Speak", "", 8)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">2</span>Speak in rhythm:</p>${recCard("speakRhythm", "Rhythm", "", 8)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">3</span>Sing slowly:</p>${recCard("singSlow", "Sing slowly", "", 10)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">4</span>Sing naturally:</p>${recCard("singNatural", "Sing naturally", "", 10)}</li>
          </ol>
          <div class="mt-4">${SelfAssessment.render("wordMaintain-q", { ...Q.wordMaintain, selected: sel("wordMaintain") })}</div>
        `)}

        ${chapter("words", 12, "Exercise 10 — Breath management", `
          ${narrow(p("Where does the phrase begin? Where does it naturally end? Where could a comfortable breath happen? Tap between two words to choose a breath point. Breath management means comfortable breaths at sensible musical points — not holding breath, not taking enormous breaths, and not trying to sing as long as possible."))}
          ${renderBreathEditor("vc-breath", LYRIC_WORDS, typeof breath.mark === "number" ? breath.mark : null)}
        `)}

        ${chapter("shape", 13, "Exercise 11 — Maintaining phrase shape", `
          ${narrow(p("Connecting Class 18."))}
          ${flowStrip(["BEGINNING", "BUILD", "PEAK", "RELEASE"])}
          ${narrow(p("The pattern should not become note, note, note, note, note. It should be one musical line."))}
          ${recCard("phraseShape", "Sing the pattern with this shape", "", 10)}
        `)}

        ${chapter("shape", 14, "Exercise 12 — Maintaining dynamics", `
          ${narrow(p("Connecting Class 14. Never louder, never shouted."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("dynNatural", "Sing naturally", "", 10)}
            ${recCard("dynShaped", "Slightly softer beginning → gentle build → comfortable peak → natural release", "", 10)}
          </div>
        `)}

        ${chapter("pitch", 15, "Exercise 13 — Maintaining pitch while moving", `
          ${PitchMatchExercise.render("vc-pitchmoving", PITCH_WHILE_MOVING_EX)}
          <div class="mt-4">${StabilityPanel.render("sp-moving", { title: "Estimated pitch — after you answer" })}</div>
        `)}

        ${chapter("compare", 16, "Exercise 14 — Consistency across takes", `
          ${p("Record three takes, then compare them.")}
          <div class="grid sm:grid-cols-3 gap-3 mb-4">
            ${recCard("take1", "Take 1 — natural", "", 10)}
            ${recCard("take2", "Take 2 — focus on pitch", "", 10)}
            ${recCard("take3", "Take 3 — focus on smoothness", "", 10)}
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            ${Object.entries(TAKE_Q).map(([k, cfg]) => `<div>${SelfAssessment.render(`${k}-q`, { ...cfg, selected: sel(k) })}</div>`).join("")}
          </div>
        `)}

        ${chapter("compare", 17, "Exercise 15 — Slow → normal", `
          ${flowStrip(["VERY SLOW", "COMFORTABLE PRACTICE SPEED", "NATURAL SPEED"])}
          ${narrow(p("“Accuracy first. Speed later.” Don't increase speed if accuracy decreases."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("slowTake", "Very slow", "", 12)}
            ${recCard("normalTake", "Natural speed", "", 10)}
          </div>
        `)}

        ${chapter("memory", 18, "Exercise 16 — Pattern memory", `
          ${narrow(p("A five-note pattern plays once — the notes aren't shown yet. Listen, then try to reproduce it. This is a listening exercise, not a memory test."))}
          <button type="button" data-play-memory class="vr-btn vr-btn-gold mb-4">${icon("play", "w-4 h-4")} Play the pattern (hidden)</button>
          ${recCard("fromMemory", "Sing it back from memory", "", 10)}
          <div class="mt-4">
            ${A(rec, "memory").revealed ? `<p class="text-sm text-ink-200">The pattern was: <strong class="text-ink-50">1 → 2 → 3 → 2 → 1</strong>.</p>` : `<button type="button" data-reveal-memory class="text-sm text-gold-300 underline">Reveal the pattern</button>`}
          </div>
        `)}

        ${chapter("integrate", 19, "Exercise 17 — Pattern into a musical phrase", `
          ${p("PATTERN → MELODY → PHRASE → MUSIC. This is the main integration point of this class.")}
          ${PitchMatchExercise.render("vc-phrase", PHRASE_EX)}
        `)}

        ${chapter("review", 20, "Exercise 18 — Targeted practice", `
          ${SelfAssessment.render("weakestPart-q", { ...Q.weakestPart, selected: sel("weakestPart") })}
          <p class="text-sm text-ink-300 mt-3 mb-4">Practice only that section — you don't need to repeat the entire pattern every time.</p>
          ${recCard("targetedTake", "Practice just that section", "", 10)}
        `)}

        ${chapter("review", 21, "Common beginner problems", problems())}

        ${chapter("evaluate", 22, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("vc-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 23, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused sessions — repetition doesn't need to be excessive.")}
          ${Timer.render("vc-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 24, `Class ${cls.number} Assignment`, `
          ${p("Using a comfortable 5–7 note pattern, complete seven takes. You don't need to do all seven in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("t1", "Take 1 — Hum the pattern", "", 10)}
            ${recCard("t2", "Take 2 — Sing it on “AH”", "", 10)}
            ${recCard("t3", "Take 3 — Simple syllables", "", 10)}
            ${recCard("t4", "Take 4 — Add lyrics", "", 10)}
            ${recCard("t5", "Take 5 — Focus on pitch consistency", "", 10)}
            ${recCard("t6", "Take 6 — Focus on smooth movement", "", 10)}
            ${recCard("t7", "Take 7 — Final natural performance", "", 12)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="vc-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="vc-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 25, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vc", { placeholder: "e.g. I lose the melody in the middle. My ending is unstable. I need to break longer patterns into sections." })}
        `)}

        ${chapter("complete", 26, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 27, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Exercises 1–3: pattern playback ---- */
    const PATTERNS = { p5: P5, p7: P7, groupA: GROUP_A, groupB: GROUP_B };
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      PianoSynth.playSequence(degreesToNotes(base(), PATTERNS[btn.dataset.playPattern]), { duration: 0.55, gap: 0.18 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- reference piano ---- */
    own(VirtualPiano.wire(container, "vc-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so every pattern stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exVowel.refresh(); exSyllable.refresh(); exPitchMoving.refresh(); exPhrase.refresh();
      },
    }));

    /* ---- Exercise 5: listening cycle checklist ---- */
    cleanups.push(ObservationChecklist.wire(container, "vc-changed", {
      selected: { changed: A(rec0(), "cycle").changed || [] },
      onChange: (_, values) => { set("cycle", "changed", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 7: vowel transition ---- */
    const exVowel = own(PitchMatchExercise.wire(container, "vc-vowel", VOWEL_EX, {
      classId, exerciseId: "vowel", state: (rec0().answers.exercises || {}).vowel || {},
      getNotes: () => degreesToNotes(base(), P5), isComplete: VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "vowel", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 8: syllables ---- */
    const exSyllable = own(PitchMatchExercise.wire(container, "vc-syllable", SYLLABLE_EX, {
      classId, exerciseId: "syllable", state: (rec0().answers.exercises || {}).syllable || {},
      getNotes: () => degreesToNotes(base(), P5), isComplete: SYLLABLE_EX.isComplete,
      onState: (s) => { set("exercises", "syllable", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 10: breath management ---- */
    cleanups.push(wireBreathEditor(container, "vc-breath", {
      selected: typeof A(rec0(), "breath").mark === "number" ? A(rec0(), "breath").mark : null,
      onChange: (mark) => { set("breath", "mark", mark); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 13: pitch while moving ---- */
    const exPitchMoving = own(PitchMatchExercise.wire(container, "vc-pitchmoving", PITCH_WHILE_MOVING_EX, {
      classId, exerciseId: "pitchMoving", state: (rec0().answers.exercises || {}).pitchMoving || {},
      getNotes: () => degreesToNotes(base(), P5), isComplete: PITCH_WHILE_MOVING_EX.isComplete,
      onState: (s) => { set("exercises", "pitchMoving", s); syncCheckpoints(); refreshLive(); panelMoving.refresh(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    const panelMoving = own(StabilityPanel.wire(container, "sp-moving", {
      getTake: () => exState(rec0(), "pitchMoving").takes.take || null,
      chain: true,
      canReveal: () => !!(exState(rec0(), "pitchMoving").takes.take || {}).assessment,
      onRevealed: () => { set("viz", "pitchMoving", true); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 16: pattern memory ---- */
    function onPlayMemory(e) {
      if (!e.target.closest("[data-play-memory]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), P5), { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayMemory);
    cleanups.push(() => container.removeEventListener("click", onPlayMemory));
    function onRevealMemory(e) {
      if (!e.target.closest("[data-reveal-memory]")) return;
      set("memory", "revealed", true);
      syncCheckpoints(); refreshLive();
      const host = e.target.closest("div");
      if (host) host.innerHTML = `<p class="text-sm text-ink-200">The pattern was: <strong class="text-ink-50">1 → 2 → 3 → 2 → 1</strong>.</p>`;
    }
    container.addEventListener("click", onRevealMemory);
    cleanups.push(() => container.removeEventListener("click", onRevealMemory));

    /* ---- Exercise 17: pattern into a phrase ---- */
    const exPhrase = own(PitchMatchExercise.wire(container, "vc-phrase", PHRASE_EX, {
      classId, exerciseId: "phrase", state: (rec0().answers.exercises || {}).phrase || {},
      getNotes: () => degreesToNotes(base(), P5), isComplete: PHRASE_EX.isComplete,
      onState: (s) => { set("exercises", "phrase", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 6: metronome ---- */
    own(Metronome.wire(container, "vc-metro", { bpm: BPM }));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "easierPattern-q": "easierPattern", "vowelDiffer-q": "vowelDiffer", "wordMaintain-q": "wordMaintain",
      "weakestPart-q": "weakestPart",
      "mostConsistent-q": "mostConsistent", "mostComfortableTake-q": "mostComfortableTake",
      "clearestMelody-q": "clearestMelody", "keepTake-q": "keepTake",
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
      humP5: "Five-note pattern hum", groupA: "Group A", groupB: "Group B", reconnected: "Reconnected pattern",
      pitchRhythm: "Pitch + rhythm", checkCycle: "Listen-sing-check cycle", longerHum: "Longer hum",
      speak: "Words — speak", speakRhythm: "Words — rhythm", singSlow: "Words — sing slowly", singNatural: "Words — sing naturally",
      phraseShape: "Phrase shape", dynNatural: "Dynamics — natural", dynShaped: "Dynamics — shaped",
      take1: "Three takes — natural", take2: "Three takes — focus pitch", take3: "Three takes — focus smoothness",
      slowTake: "Slow practice", normalTake: "Natural speed", fromMemory: "Pattern memory", targetedTake: "Targeted practice",
      t1: "Assignment — hum", t2: "Assignment — AH", t3: "Assignment — syllables", t4: "Assignment — lyrics",
      t5: "Assignment — pitch consistency", t6: "Assignment — smooth movement", t7: "Assignment — final performance",
    };
    const MAX_SECONDS = {
      humP5: 10, groupA: 8, groupB: 8, reconnected: 10, pitchRhythm: 10, checkCycle: 10, longerHum: 12,
      speak: 8, speakRhythm: 8, singSlow: 10, singNatural: 10, phraseShape: 10, dynNatural: 10, dynShaped: 10,
      take1: 10, take2: 10, take3: 10, slowTake: 12, normalTake: 10, fromMemory: 10, targetedTake: 10,
      t1: 10, t2: 10, t3: 10, t4: 10, t5: 10, t6: 10, t7: 12,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 10,
        meta: { name: `Class 21 — ${NAMES[k]}`, exercise: `coordination-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "vc-timer", {
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
    cleanups.push(ControlCheck.wire(container, "vc-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-vc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Good singing is many small skills — pitch, rhythm, breath, movement, words — working together without fighting each other.",
        struggled: ans[1] || "",
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
