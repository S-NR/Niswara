/* ============================================================
   CLASS 16 — SINGING SIMPLE PHRASES (interactive lesson)

   Rendered by ClassDetailPage for interactive: "singing-simple-phrases".

   Core idea: "Bring individual singing skills together into a
   musical phrase." The first major integration point — pitch +
   rhythm + breath + transitions + dynamics + diction + listening,
   all at once, on one short beginner phrase. "Don't try to fix
   everything at once": each attempt has ONE main focus. The
   objective is coordination, not perfection.

   Flow: understand -> speak the phrase -> find the rhythm (full
   Metronome) -> learn the melody (ear only) -> hum it -> sing it
   on "AH" -> add the words -> choose a breath point -> beginning /
   middle / ending, one at a time -> the complete phrase -> review
   it one skill at a time -> dynamics -> diction focus -> emotional
   meaning -> recording comparison -> common problems -> self-
   evaluate -> practice -> assignment (6 attempts + 10 questions) ->
   milestone.

   The phrase ("I love to sing") maps one word to one note of a
   simple 4-note melody (1-2-3-2 from a comfortable reference note)
   — deliberately 4 notes, not the spec's illustrative 5, so every
   word of this specific phrase lines up with exactly one note and
   nothing has to be stretched or split.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard (Class 5), the full
   Metronome widget + BeatGuide (Class 6, as Classes 10/11 already
   reuse the full widget for "use the metronome" moments),
   ObservationChecklist (Class 5), LoudnessAnalysis / ControlCheck
   (Class 9), the Class 11 tap-to-place breath-marker phrase editor
   (re-implemented locally, single-mark mode — the original stays
   local to breathPhraseControl.js, not a shared component, so this
   is its own small copy, not a duplicate system), StabilityPanel
   (Class 12, pitch visualization), Timer, PersonalNotes,
   ClassProgress, ClassActivity.

   Per the spec's own 20-item Class Progress list, Exercise 12's
   review only tracks three of its seven lenses individually
   (Pitch / Rhythm / Diction) and Exercise 14 ("Diction focus") has
   no tracked checkpoint of its own — both followed literally here
   rather than inventing extra items. The assignment's 10 questions
   live directly in the Assignment chapter (the spec lists no
   separate Reflection section or checkpoint for this class), so
   there is no Class 13-style duplicate-questions risk to guard
   against here.
   ============================================================ */

const SingingSimplePhrasesLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "speak", label: "Speak" },
    { id: "rhythm", label: "Rhythm" },
    { id: "melody", label: "Melody" },
    { id: "hum", label: "Hum" },
    { id: "vowel", label: "Vowel" },
    { id: "words", label: "Words" },
    { id: "breath", label: "Breath" },
    { id: "structure", label: "Structure" },
    { id: "phrase", label: "Phrase" },
    { id: "combine", label: "Combine" },
    { id: "listen", label: "Listen" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2; // whole steps — the Class 9+ convention
  const BPM = 70;
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Simple Phrases";
  const PHRASE = ["I", "love", "to", "sing"];
  const BREATH_WORDS = ["I", "love", "to", "sing", "today"];
  const MELODY_STEPS = [0, 1, 2, 1]; // 1 -> 2 -> 3 -> 2, one note per word
  const DICTION_WORD = "sing"; // the word most often lost at a phrase's end (see Common Problems)

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "speaking", label: "Phrase speaking completed" },
    { key: "rhythmEx", label: "Rhythm exercise completed" },
    { key: "melody", label: "Melody learning completed" },
    { key: "humming", label: "Humming completed" },
    { key: "vowelMelody", label: "Vowel melody completed" },
    { key: "lyricsAdded", label: "Lyrics added" },
    { key: "breathPlacement", label: "Breath placement completed" },
    { key: "beginning", label: "Beginning exercise completed" },
    { key: "middle", label: "Middle exercise completed" },
    { key: "ending", label: "Ending exercise completed" },
    { key: "completePhrase", label: "Complete phrase recording completed" },
    { key: "pitchReview", label: "Pitch review completed" },
    { key: "rhythmReview", label: "Rhythm review completed" },
    { key: "dictionReview", label: "Diction review completed" },
    { key: "dynamicsEx", label: "Dynamics exercise completed" },
    { key: "expressionEx", label: "Expression exercise completed" },
    { key: "recordingComparison", label: "Recording comparison completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    leastStable: { question: "Which note felt least stable?", options: [...PHRASE.map((w) => opt(w, `On “${w}”`)), opt("all", "All felt stable", "good"), opt("unsure", "Not sure")] },
    ahStable: { question: "Could you keep the pitch stable across all four “AH”s?", options: YMNU },
    start: { question: "Can you start the phrase comfortably?", options: YMNU },
    middle: { question: "Did you maintain pitch and rhythm after starting?", options: YMNU },
    ending: { question: "Did the final note and final word remain clear?", options: YMNU },
    connected: { question: "Did this feel like one connected musical thought?", options: YMNU },
    meaning: { question: "What is this phrase trying to communicate?", options: ["Happy", "Calm", "Sad", "Hopeful", "Energetic", "Affectionate", "Other"].map((m) => opt(m.toLowerCase(), m)) },
    compare: { question: "Which felt more connected?", options: [opt("a", "Attempt 1"), opt("b", "Attempt 2"), opt("same", "About the same", "neutral"), opt("unsure", "Not sure")] },
  };
  const CHANGED_OPTIONS = ["Pitch", "Rhythm", "Breath", "Words", "Transitions", "Dynamics", "Confidence", "Nothing obvious"];

  const REVIEW_LEVELS = lv(["good", "✓", "Good"], ["attention", "△", "Needs attention"], ["unsure", "?", "Not sure"]);
  const REVIEW_ROWS = [
    { key: "pitch", area: "Pitch", question: "Were the notes reasonably accurate?" },
    { key: "rhythm", area: "Rhythm", question: "Did the words remain in time?" },
    { key: "breath", area: "Breath", question: "Did I have enough comfortable breath?" },
    { key: "diction", area: "Diction", question: "Could I understand my own words?" },
    { key: "transitions", area: "Transitions", question: "Did I move smoothly between notes?" },
    { key: "dynamics", area: "Dynamics", question: "Did the phrase have some variation?" },
    { key: "comfort", area: "Comfort", question: "Did I remain relaxed?" },
  ];
  const CHECK_ROWS = [
    { key: "melody", area: "Melody", question: "Could I follow the melody?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Could I stay in time?", levels: YMN_LEVELS },
    { key: "breath", area: "Breath", question: "Could I complete the phrase comfortably?", levels: YMN_LEVELS },
    { key: "diction", area: "Diction", question: "Could I understand the words?", levels: YMN_LEVELS },
    { key: "transitions", area: "Transitions", question: "Could I connect the notes?", levels: YMN_LEVELS },
    { key: "dynamics", area: "Dynamics", question: "Could I change intensity naturally?", levels: YMN_LEVELS },
    { key: "expression", area: "Expression", question: "Could I communicate the meaning?", levels: lv(["yes", "✓", "Yes"], ["little", "△", "A little"], ["notyet", "○", "Not yet"]) },
    { key: "overall", area: "Overall", question: "Did the phrase feel connected?", levels: YMN_LEVELS },
  ];

  /* ---- Exercise 5: sing on "AH" (PitchMatchExercise, chain mode) ---- */
  const AH_EX = {
    eyebrow: "Exercise 5 · One vowel", title: "AH — AH — AH — AH",
    intro: "The same melody, on one vowel — this isolates the music from the words. Connecting Class 12 (Pitch Stability) and Class 13 (Smooth Note Transitions).",
    chain: true, refLabel: "Reference melody", noteDuration: 0.8,
    slots: [{ key: "take", label: "Your “AH” melody", hint: "Sing along with the reference, then record" }],
    assessment: Q.ahStable,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 15 -> Class 2 -> Class 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - 2 * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c15 = (ClassActivity.get("L1C15").answers.setup || {}).note;
    if (ok(c15)) return c15;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const melody = (b) => MELODY_STEPS.map((i) => b + i * STEP);
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  /** Bars of 4 tokens for the BeatGuide (one word per beat; short lists padded with rests). */
  function wordBars(words, sing, melodyNotes) {
    const toks = words.map((w, i) => (melodyNotes ? { t: w, midi: melodyNotes[i] } : sing ? { t: w, note: true } : { t: w }));
    while (toks.length % 4) toks.push({ t: "", rest: true });
    const bars = [];
    for (let i = 0; i < toks.length; i += 4) bars.push(toks.slice(i, i + 4));
    return bars;
  }
  const rhythmBars = () => wordBars(PHRASE, false);
  const singBars = (b) => wordBars(PHRASE, true, melody(b));

  const ASSIGN_KEYS = ["a1", "a2", "a3", "a4", "a5", "a6"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (["sp1", "sp2", "sp3"].every((k) => take(rec, k))) out.speaking = true;
    if (take(rec, "rhythmTake")) out.rhythmEx = true;
    if (A(rec, "guides").melody) out.melody = true;
    if (take(rec, "hum") && q(rec, "leastStable")) out.humming = true;
    if (AH_EX.isComplete(exState(rec, "ah"))) out.vowelMelody = true;
    if (["wordsSpeak", "wordsRhythm", "wordsSlow", "wordsTempo"].every((k) => take(rec, k))) out.lyricsAdded = true;
    if (typeof A(rec, "breath").mark === "number" || (A(rec, "breath").mark || []).length) out.breathPlacement = true;
    if (take(rec, "beginning") && q(rec, "start")) out.beginning = true;
    if (q(rec, "middle")) out.middle = true;
    if (q(rec, "ending")) out.ending = true;
    if (take(rec, "complete") && q(rec, "connected")) out.completePhrase = true;
    const review = A(rec, "review");
    if (review.pitch) out.pitchReview = true;
    if (review.rhythm) out.rhythmReview = true;
    if (review.diction) out.dictionReview = true;
    if (["dynConstant", "dynRising", "dynFalling"].every((k) => take(rec, k))) out.dynamicsEx = true;
    if (q(rec, "meaning") && take(rec, "expression")) out.expressionEx = true;
    if (q(rec, "compare") && (A(rec, "compareChanged").changed || []).length) out.recordingComparison = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const lyricLine = (words, attrs = "") => `<p class="dc-lyric font-display text-3xl sm:text-4xl text-ink-50 my-4" ${attrs}>${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  /* ---- single-mark breath phrase editor (local copy of Class 11's pattern, single-mark mode only) ---- */
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

  function problems() {
    const items = [
      ["“I know the notes individually but lose them in the phrase.”", "Break the phrase into two-note sections (1→2, 2→3, 3→2), then reconnect them."],
      ["“I forget the lyrics.”", "Speak the phrase without music. Then add rhythm. Then add the melody."],
      ["“I run out of breath.”", "Shorten the phrase. Don't force a bigger breath."],
      ["“My pitch falls near the end.”", "Practise the ending separately. Reduce the phrase's length if needed."],
      ["“My words disappear.”", `Return to <a href="#/classes/L1C15" class="text-gold-300 underline">Class 15 — Diction &amp; Pronunciation</a>: speak → rhythm → sing.`],
      ["“Everything goes wrong when I try to express emotion.”", "Return to a neutral version. Get the mechanics comfortable first, then add a small amount of expression."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const parts = ["PITCH", "RHYTHM", "BREATH", "DICTION", "TRANSITIONS", "DYNAMICS", "EXPRESSION"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 16 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">FROM EXERCISES TO MUSIC</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-4">
          ${parts.map((t, i) => `<span class="flow-chip !text-sm">${t}</span>${i < parts.length - 1 ? `<span class="text-gold-300">+</span>` : ""}`).join("")}
        </div>
        <p class="text-gold-300 text-xl mb-1">=</p>
        <p class="font-display text-2xl text-teal-200 mb-5">A MUSICAL PHRASE</p>
        <p class="text-sm text-ink-300">This is the beginning of actually singing music —</p>
        <p class="text-sm text-ink-100">rather than practising isolated skills.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["speaking", "rhythmEx", "melody", "humming", "vowelMelody", "lyricsAdded", "breathPlacement", "beginning", "middle", "ending", "completePhrase", "pitchReview", "rhythmReview", "dictionReview", "dynamicsEx", "expressionEx", "recordingComparison"].filter((k) => c[k]).length;
    return [
      [`Phrase exercises (${ex}/17)`, ex === 17],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You've learned to build a short phrase. You don't need to fix everything simultaneously — you can build a phrase step by step.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll learn how to connect multiple phrases into a small musical section.` : "Next, we'll learn how to connect multiple phrases into a small musical section."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">I can take the skills I've learned and combine them into a short musical phrase.</h3>
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
    const breath = A(rec, "breath");
    const review = A(rec, "review");
    const a = A(rec, "assignment");
    const compareChanged = A(rec, "compareChanged").changed || [];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Now let's put the pieces together", `
          ${p("Until now, many exercises focused on <strong class=\"text-ink-100\">one skill at a time</strong>. A musical phrase can contain several notes, different rhythms, words, breathing, dynamics, note transitions and expression — all at once.")}
          ${p("The objective is <strong class=\"text-ink-100\">not</strong> perfection. The objective is <strong class=\"text-ink-100\">coordination</strong>.")}
          ${lyricLine(PHRASE)}
        `)}

        ${chapter("understand", 2, "Don't try to fix everything at once", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Don't try to fix everything at once.”</p>
            <p class="text-sm text-ink-200">Choose ONE main focus per attempt. For example: Attempt 1 → pitch. Attempt 2 → rhythm. Attempt 3 → words. Attempt 4 → expression. This prevents feeling overwhelmed.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("speak", 3, "Exercise 1 — Speak the phrase", `
          ${p("A very short beginner phrase — simple enough to speak naturally. Speak it three ways and record each.")}
          ${lyricLine(PHRASE)}
          <div class="grid lg:grid-cols-3 gap-3">
            ${recCard("sp1", "1 · Naturally", "Just say it.", 10)}
            ${recCard("sp2", "2 · Rhythmically", "With a steady, even beat.", 10)}
            ${recCard("sp3", "3 · With feeling", "Say it with its intended emotional meaning.", 10)}
          </div>
        `)}

        ${chapter("rhythm", 4, "Exercise 2 — Find the rhythm", `
          ${narrow(p("The phrase as rhythmic blocks — one word, one beat."))}
          <div class="flex flex-wrap items-center justify-center gap-2 my-5">${PHRASE.map((w) => `<span class="flow-chip !text-base">${w}</span>`).join("")}</div>
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("ssp-metro", { bpm: BPM })}
          </div>
          ${narrow(p("Now speak the words in time with the metronome."))}
          ${recCard("rhythmTake", "Speak the phrase in time", "One word per click.", 10)}
        `, { wide: true })}

        ${chapter("melody", 5, "Exercise 3 — Learn the melody", `
          ${narrow(p("A simple 4-note melody — one note per word: 1 → 2 → 3 → 2. Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise)."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("ssp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-melody="together" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play reference melody</button>
            <button type="button" data-play-melody="apart" class="vr-btn">${icon("play", "w-4 h-4")} Play each note separately</button>
          </div>
          <p class="text-xs text-ink-500" data-melody-status>Listen as many times as you like — nothing is recorded here.</p>
        `, { wide: true })}

        ${chapter("hum", 6, "Exercise 4 — Hum the melody", `
          ${narrow(p("Before adding lyrics, hum the melody on “mmm”. This lets you focus on pitch, transitions and rhythm without thinking about words at the same time."))}
          ${recCard("hum", "Hum the melody", "“mmm” — along the reference above.", 12)}
          <div class="mt-4">${SelfAssessment.render("leastStable-q", { ...Q.leastStable, selected: sel("leastStable") })}</div>
        `)}

        ${chapter("vowel", 7, "Exercise 5 — Sing on one vowel", `
          ${PitchMatchExercise.render("ssp-ah", AH_EX)}
          <div class="mt-4">${StabilityPanel.render("sp-ah", { title: "Estimated pitch — after you answer" })}</div>
        `)}

        ${chapter("words", 8, "Exercise 6 — Add the words", `
          ${narrow(p("WORDS → RHYTHM → MELODY → SINGING. Four steps, building on each other."))}
          <ol class="flex flex-col gap-5 mt-4">
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">1</span>Speak the lyrics:</p>${recCard("wordsSpeak", "Speak", "Just say it.", 10)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">2</span>Speak them rhythmically:</p><div class="dc-words mb-3">${BeatGuide.render("bg-ssp-rhythm", { bars: rhythmBars(), startLabel: "Speak in rhythm" })}</div>${recCard("wordsRhythm", "Rhythm", "One word per beat.", 10)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">3</span>Sing slowly:</p>${recCard("wordsSlow", "Sing slowly", "Take your time with each note.", 12)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">4</span>Sing at the intended tempo:</p><div class="dc-words mb-3" data-ssp-sing-host>${BeatGuide.render("bg-ssp-sing", { bars: singBars(b), guideToggle: true, startLabel: "Sing with the guide" })}</div>${recCard("wordsTempo", "Normal tempo", "With the guide above, or on your own.", 12)}</li>
          </ol>
        `)}

        ${chapter("breath", 9, "Exercise 7 — Breath placement", `
          ${narrow(p("Tap between two words to choose where you'd naturally breathe. Avoid breathing in the middle of a word, at an awkward grammatical point, or immediately before the final word if it isn't necessary. If the phrase feels too long, that's useful information too — a shorter phrase is always fine."))}
          ${renderBreathEditor("ssp-breath", BREATH_WORDS, typeof breath.mark === "number" ? breath.mark : null)}
        `)}

        ${chapter("structure", 10, "Exercise 8 — Phrase beginning", `
          ${narrow(p("Focus only on the beginning. Avoid starting too loudly, starting so softly the voice disappears, taking an exaggerated breath, or starting with unnecessary tension."))}
          ${recCard("beginning", "The first part only", "Stop whenever feels natural.", 8)}
          <div class="mt-4">${SelfAssessment.render("start-q", { ...Q.start, selected: sel("start") })}</div>
        `)}

        ${chapter("structure", 11, "Exercise 9 — Phrase middle", `
          ${narrow(p("Now focus on the middle — what happens right after you start."))}
          ${SelfAssessment.render("middle-q", { ...Q.middle, selected: sel("middle") })}
        `)}

        ${chapter("structure", 12, "Exercise 10 — Phrase ending", `
          ${narrow(p(`Focus on the final word. Watch for dropping pitch, running out of comfortable breath, swallowing the final consonant, or reducing volume too quickly. You don't need to extend the final note.`))}
          ${SelfAssessment.render("ending-q", { ...Q.ending, selected: sel("ending") })}
        `)}

        ${chapter("phrase", 13, "Exercise 11 — Complete phrase", `
          ${p("Now sing the complete phrase. Record it, and listen back.")}
          ${recCard("complete", "The complete phrase", "All together, naturally.", 12)}
          ${narrow(p("Don't immediately analyze every technical element — first:"))}
          <div class="mt-4">${SelfAssessment.render("connected-q", { ...Q.connected, selected: sel("connected") })}</div>
        `)}

        ${chapter("phrase", 14, "Exercise 12 — One skill at a time review", `
          ${narrow(p("Review the complete-phrase recording above through separate lenses — one at a time. Use Good / Needs attention / Not sure. There are no percentages here."))}
          <button type="button" data-play-complete class="vr-btn mb-4" ${take(rec, "complete") ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play my complete phrase</button>
          ${ControlCheck.render("ssp-review", REVIEW_ROWS, review, REVIEW_LEVELS)}
        `)}

        ${chapter("combine", 15, "Exercise 13 — Dynamics", `
          ${narrow(p("Connecting Class 14. Use the same phrase, three ways."))}
          <div class="comfort-callout rounded-2xl border border-teal-300/20 bg-teal-500/[0.06] px-5 py-4 mb-4 text-sm text-ink-200">Don't force expression. Keep it subtle.</div>
          <div class="grid lg:grid-cols-3 gap-3">
            ${recCard("dynConstant", "1 · All medium", "A steady, constant volume throughout.", 12)}
            ${recCard("dynRising", "2 · Soft → medium → stronger", "Begin softer, middle medium, end slightly stronger.", 12)}
            ${recCard("dynFalling", "3 · Stronger → medium → soft", "The reverse — begin stronger, end softer.", 12)}
          </div>
        `)}

        ${chapter("combine", 16, "Exercise 14 — Diction focus", `
          ${narrow(p(`Connecting Class 15. The word “<strong class="text-ink-100">${DICTION_WORD}</strong>” often becomes unclear at the end of a phrase. Practise it on its own, then back in context.`))}
          <div class="grid lg:grid-cols-3 gap-3">
            ${recCard("dictionSpeak", `Speak “${DICTION_WORD}”`, "Just the word, clearly.", 6)}
            ${recCard("dictionSlow", `Sing “${DICTION_WORD}” slowly`, "One note, unhurried.", 6)}
            ${recCard("dictionPhrase", `Sing it in the phrase`, "The complete phrase, listening for this word.", 12)}
          </div>
        `)}

        ${chapter("combine", 17, "Exercise 15 — Emotional meaning", `
          ${narrow(p("A little basic musical expression — not acting technique. What is this phrase trying to communicate?"))}
          ${SelfAssessment.render("meaning-q", { ...Q.meaning, selected: sel("meaning") })}
          <div class="mt-4">${recCard("expression", "Sing it with that meaning in mind", "Let the meaning guide you, gently.", 12)}</div>
        `)}

        ${chapter("listen", 18, "Exercise 16 — Recording comparison", `
          ${narrow(p("Compare your complete phrase (Exercise 11) with your expressive version (Exercise 15)."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p class="text-sm text-ink-100 mb-2">Attempt 1 — complete phrase</p><button type="button" data-play-cmp="a" class="vr-btn" ${take(rec, "complete") ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p class="text-sm text-ink-100 mb-2">Attempt 2 — with meaning</p><button type="button" data-play-cmp="b" class="vr-btn" ${take(rec, "expression") ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          ${SelfAssessment.render("compare-q", { ...Q.compare, selected: sel("compare") })}
          <div class="mt-5">${ObservationChecklist.render("ssp-changed", [{ key: "changed", title: "What changed?", prompt: "Choose any that fit.", options: CHANGED_OPTIONS }], { changed: compareChanged })}</div>
        `)}

        ${chapter("listen", 19, "Beginner troubleshooting", problems())}

        ${chapter("evaluate", 20, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("ssp-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 21, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused repetitions are best. Encourage a few minutes, not an exhausting session.")}
          ${Timer.render("ssp-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 22, `Class ${cls.number} Assignment`, `
          ${p("Using the same phrase, complete six attempts. You don't need to do all six in one session — stop any time your voice feels tired.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("a1", "Attempt 1 — Hum the melody", "“mmm”, the full melody.", 12)}
            ${recCard("a2", "Attempt 2 — One vowel", "Sing the melody on “AH”.", 12)}
            ${recCard("a3", "Attempt 3 — With lyrics", "Sing the words, any natural tempo.", 12)}
            ${recCard("a4", "Attempt 4 — Lyrics + rhythm", "Words, steady timing.", 12)}
            ${recCard("a5", "Attempt 5 — + gentle dynamics", "Words, rhythm, and a subtle volume change.", 12)}
            ${recCard("a6", "Attempt 6 — Final performance", "Natural, complete, your best take today.", 15)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="ssp-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="ssp-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 23, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-ssp", { placeholder: "e.g. I lose pitch when adding lyrics. I can hum the melody but struggle with the words. The ending is difficult." })}
        `)}

        ${chapter("complete", 24, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 25, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
      const playCmpA = $("[data-play-cmp=\"a\"]"); if (playCmpA) playCmpA.disabled = !take(rec, "complete");
      const playCmpB = $("[data-play-cmp=\"b\"]"); if (playCmpB) playCmpB.disabled = !take(rec, "expression");
      const playComplete = $("[data-play-complete]"); if (playComplete) playComplete.disabled = !take(rec, "complete");
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

    /* ---- Exercise 2: metronome ---- */
    own(Metronome.wire(container, "ssp-metro", { bpm: BPM }));

    /* ---- Exercise 3: reference note + melody playback (ear only, not recorded) ---- */
    own(VirtualPiano.wire(container, "ssp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - 2 * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - 2 * STEP)} or lower so the melody stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        redrawSingGuide();
        exAh.refresh();
      },
    }));
    function onPlayMelody(e) {
      const btn = e.target.closest("[data-play-melody]");
      if (!btn) return;
      const notes = melody(base());
      const apart = btn.dataset.playMelody === "apart";
      PianoSynth.playSequence(notes, { duration: apart ? 0.9 : 0.75, gap: apart ? 0.5 : 0.2 });
      set("guides", "melody", true);
      $("[data-melody-status]").textContent = "Reference melody played. Listen as many times as you like.";
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onPlayMelody);
    cleanups.push(() => container.removeEventListener("click", onPlayMelody));

    /* ---- Exercise 5: AH on the melody ---- */
    const exAh = own(PitchMatchExercise.wire(container, "ssp-ah", AH_EX, {
      classId, exerciseId: "ah", state: (rec0().answers.exercises || {}).ah || {},
      getNotes: () => melody(base()), isComplete: AH_EX.isComplete,
      onState: (s) => { set("exercises", "ah", s); syncCheckpoints(); refreshLive(); panelAh.refresh(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    const panelAh = own(StabilityPanel.wire(container, "sp-ah", {
      getTake: () => exState(rec0(), "ah").takes.take || null,
      chain: true,
      canReveal: () => !!(exState(rec0(), "ah").takes.take || {}).assessment,
      onRevealed: () => { set("viz", "ah", true); refreshLive(); },
    }));

    /* ---- Exercise 6: add the words (rhythm + sing guides) ---- */
    const guides = {};
    function guide(id, bars, opts = {}) {
      if (guides[id]) guides[id].destroy();
      guides[id] = BeatGuide.wire(container, id, { bpm: BPM, loops: 1, bars, getNote: base, ...opts });
    }
    cleanups.push(() => Object.values(guides).forEach((g) => g.destroy()));
    guide("bg-ssp-rhythm", rhythmBars(), { loops: 2 });
    function redrawSingGuide() {
      const bNote = base();
      const host = $("[data-ssp-sing-host]");
      if (host) host.innerHTML = BeatGuide.render("bg-ssp-sing", { bars: singBars(bNote), guideToggle: true, startLabel: "Sing with the guide" });
      guide("bg-ssp-sing", singBars(bNote), { loops: 2 });
    }
    redrawSingGuide();

    /* ---- Exercise 7: breath placement ---- */
    cleanups.push(wireBreathEditor(container, "ssp-breath", {
      selected: typeof A(rec0(), "breath").mark === "number" ? A(rec0(), "breath").mark : null,
      onChange: (mark) => { set("breath", "mark", mark); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "leastStable-q": "leastStable", "start-q": "start", "middle-q": "middle", "ending-q": "ending",
      "connected-q": "connected", "meaning-q": "meaning", "compare-q": "compare",
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

    /* ---- Exercise 12: review grid ---- */
    cleanups.push(ControlCheck.wire(container, "ssp-review", {
      onChange: (k, v) => { set("review", k, v); syncCheckpoints(); refreshLive(); },
    }));
    function onPlayComplete(e) {
      if (!e.target.closest("[data-play-complete]")) return;
      const t = take(rec0(), "complete");
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayComplete);
    cleanups.push(() => container.removeEventListener("click", onPlayComplete));

    /* ---- Exercise 16: recording comparison ---- */
    function onPlayCmp(e) {
      const btn = e.target.closest("[data-play-cmp]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playCmp === "a" ? "complete" : "expression");
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayCmp);
    cleanups.push(() => container.removeEventListener("click", onPlayCmp));
    cleanups.push(ObservationChecklist.wire(container, "ssp-changed", {
      selected: { changed: A(rec0(), "compareChanged").changed || [] },
      onChange: (_, values) => { set("compareChanged", "changed", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- all recordings ---- */
    const NAMES = {
      sp1: "Speak naturally", sp2: "Speak rhythmically", sp3: "Speak with feeling", rhythmTake: "Rhythm — in time",
      hum: "Hum the melody", wordsSpeak: "Words — speak", wordsRhythm: "Words — rhythm", wordsSlow: "Words — sing slowly", wordsTempo: "Words — normal tempo",
      beginning: "Phrase beginning", complete: "Complete phrase",
      dynConstant: "Dynamics — constant", dynRising: "Dynamics — rising", dynFalling: "Dynamics — falling",
      dictionSpeak: `Diction — speak “${DICTION_WORD}”`, dictionSlow: `Diction — sing “${DICTION_WORD}” slowly`, dictionPhrase: "Diction — in the phrase",
      expression: "With meaning",
      a1: "Assignment — hum", a2: "Assignment — one vowel", a3: "Assignment — lyrics", a4: "Assignment — lyrics + rhythm", a5: "Assignment — + dynamics", a6: "Assignment — final performance",
    };
    // Must match each recCard(...) call's own `max` in render() — the badge text comes from there.
    const MAX_SECONDS = {
      sp1: 10, sp2: 10, sp3: 10, rhythmTake: 10, hum: 12,
      wordsSpeak: 10, wordsRhythm: 10, wordsSlow: 12, wordsTempo: 12,
      beginning: 8, complete: 12,
      dynConstant: 12, dynRising: 12, dynFalling: 12,
      dictionSpeak: 6, dictionSlow: 6, dictionPhrase: 12,
      expression: 12,
      a1: 12, a2: 12, a3: 12, a4: 12, a5: 12, a6: 15,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 15,
        meta: { name: `Class 16 — ${NAMES[k]}`, exercise: `phrase-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "ssp-timer", {
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
    cleanups.push(ControlCheck.wire(container, "ssp-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-ssp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(ans[0]) ? ans[0] : "A musical phrase combines several skills at once — coordination, not perfection, is the goal.",
        struggled: ans[4] || "",
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
