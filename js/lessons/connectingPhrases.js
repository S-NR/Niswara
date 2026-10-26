/* ============================================================
   CLASS 17 — CONNECTING PHRASES (interactive lesson)

   Rendered by ClassDetailPage for interactive: "connecting-phrases".

   Core idea: "Learn to connect one musical phrase to the next."
   PHRASE 1 -> BREATH/TRANSITION -> PHRASE 2. The second major
   integration point, building directly on Class 16 (which built
   ONE phrase). "Don't rush from one phrase into the next": finish
   -> recover -> prepare -> begin. No full-song performance yet.

   Working phrases (one word per note, same shape as Class 16):
     Phrase 1 "I want to sing today"  (5 words/notes, degrees 1-2-3-4-3)
     Phrase 2 "and enjoy the sound"   (4 words/notes, degrees 3-2-1-2)
   Phrase 1 ends on degree 3; Phrase 2 starts on degree 3 — the
   SAME note — a simple, clearly-demonstrable "connecting pitch"
   relationship for Exercise 9. Phrase 3 "I feel the song" (degrees
   2-1-2-1(tonic)) continues from Phrase 2's ending toward the
   tonic for the optional three-phrase extension (Exercise 14).
   Exercise 13's expression example uses the spec's own separate
   pair ("I remember" / "something beautiful") — a free, unmetered
   recording, not sung to this melody.

   Flow: understand -> identify the phrase boundary -> speak two
   phrases -> rhythm before melody (full Metronome) -> hum two
   phrases -> breath between phrases -> phrase ending -> phrase
   beginning -> phrase 1 -> phrase 2 combined -> connecting pitch /
   rhythm / diction / dynamics / expression -> three-phrase
   extension -> listening analysis (A/B) -> recording review ->
   common problems -> self-evaluate -> practice -> assignment ->
   milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard (Class 5), the full
   Metronome widget + BeatGuide (Class 6), ObservationChecklist
   (Class 5), ControlCheck (Class 9), the Class 7/11 breathing
   circle, StabilityPanel (Class 12, pitch visualization), Timer,
   PersonalNotes, ClassProgress, ClassActivity. No new shared
   components. Exercise 15's "Version A / Version B" comparison is
   honestly synthesized with PianoSynth (gap length and starting
   note are exactly what control whether a melody sounds connected
   or not — unlike a vocal flaw, this is something the synth can
   demonstrate truthfully), and its own reveal text explains why
   afterward, exactly as the spec asks.
   ============================================================ */

const ConnectingPhrasesLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "identify", label: "Identify" },
    { id: "speak", label: "Speak" },
    { id: "rhythm", label: "Rhythm" },
    { id: "hum", label: "Hum" },
    { id: "breath", label: "Breath" },
    { id: "structure", label: "Structure" },
    { id: "combine", label: "Combine" },
    { id: "connect", label: "Connect" },
    { id: "extend", label: "Extend" },
    { id: "listen", label: "Listen" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const BPM = 70;
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Phrase Connection";
  const PHRASE1 = ["I", "want", "to", "sing", "today"];
  const PHRASE2 = ["and", "enjoy", "the", "sound"];
  const PHRASE3 = ["I", "feel", "the", "song"];
  const P1_DEGREES = [0, 1, 2, 3, 2];
  const P2_DEGREES = [2, 1, 0, 1];
  const P3_DEGREES = [1, 0, 1, 0];
  const MAX_DEGREE = 3;
  const EXPR_PHRASE1 = ["I", "remember"];
  const EXPR_PHRASE2 = ["something", "beautiful"];

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "phraseIdentification", label: "Phrase identification completed" },
    { key: "speaking", label: "Speaking exercise completed" },
    { key: "rhythmEx", label: "Rhythm exercise completed" },
    { key: "humming", label: "Humming completed" },
    { key: "breathEx", label: "Breath exercise completed" },
    { key: "phraseEnding", label: "Phrase-ending exercise completed" },
    { key: "phraseBeginning", label: "Phrase-beginning exercise completed" },
    { key: "twoPhraseRecording", label: "Two-phrase recording completed" },
    { key: "pitchConnection", label: "Pitch connection completed" },
    { key: "rhythmConnection", label: "Rhythm connection completed" },
    { key: "dictionConnection", label: "Diction connection completed" },
    { key: "dynamicsConnection", label: "Dynamics connection completed" },
    { key: "expressionEx", label: "Expression exercise completed" },
    { key: "threePhraseEx", label: "Three-phrase exercise completed" },
    { key: "listeningAnalysis", label: "Listening analysis completed" },
    { key: "recordingReview", label: "Recording review completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMNU = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    connectedSpeak: { question: "Did the second phrase feel connected to the first?", options: YMNU },
    startPitch: { question: "Did the second phrase start at the correct pitch?", options: YMNU },
    breathPoint: { question: "Did you find a comfortable breath point between the phrases?", options: YMNU },
    finished: { question: "Did I finish the phrase without rushing?", options: YMNU },
    beganComfortably: { question: "Can I start the second phrase comfortably after the breath?", options: YMNU },
    oneIdea: { question: "Did the two phrases sound like one musical idea?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")] },
    pitchRelation: { question: "How does Phrase 2's starting note relate to Phrase 1's ending note?", options: [opt("same", "Same note"), opt("higher", "Higher"), opt("lower", "Lower"), opt("unsure", "Not sure")] },
    pitchConnected: { question: "Could you hear how Phrase 2's note related to Phrase 1's ending?", options: YMNU },
    rhythmFeel: { question: "How did the timing between phrases feel?", options: [opt("steady", "Comfortable, steady timing", "good"), opt("dragged", "I dragged", "maybe"), opt("rushed", "I rushed", "maybe"), opt("unsure", "Not sure")] },
    dictionClear: { question: `Were “${PHRASE1[PHRASE1.length - 1]}” and “${PHRASE2[0]}” both clear?`, options: YMNU },
    expressionNatural: { question: "Did singing with that meaning in mind feel natural?", options: YMNU },
    threePhrase: { question: "Did all three phrases feel connected — like one journey?", options: YMNU },
  };
  const ANALYSIS_OPTIONS = ["Breathing", "Timing", "Pitch", "Dynamics", "Word flow", "Phrase ending", "Phrase beginning", "Not sure"];
  const REVIEW_FOCUS_OPTIONS = ["Phrase ending", "Breath", "Phrase beginning", "Pitch", "Rhythm", "Words", "Dynamics"];

  const CHECK_ROWS = [
    { key: "ending", area: "Phrase ending", question: "Did I finish the first phrase clearly?", levels: YMN_LEVELS },
    { key: "breath", area: "Breath", question: "Could I breathe comfortably between phrases?", levels: YMN_LEVELS },
    { key: "beginning", area: "Phrase beginning", question: "Could I begin the next phrase smoothly?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Did I maintain reasonable pitch?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Did I stay in time?", levels: YMN_LEVELS },
    { key: "diction", area: "Diction", question: "Were the words clear?", levels: YMN_LEVELS },
    { key: "connection", area: "Connection", question: "Did the phrases sound like one musical thought?", levels: YMN_LEVELS },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 16 -> Class 15 -> Class 2 -> Class 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - MAX_DEGREE * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c16 = (ClassActivity.get("L1C16").answers.setup || {}).note;
    if (ok(c16)) return c16;
    const c15 = (ClassActivity.get("L1C15").answers.setup || {}).note;
    if (ok(c15)) return c15;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);
  const phrase1Notes = (b) => degreesToNotes(b, P1_DEGREES);
  const phrase2Notes = (b) => degreesToNotes(b, P2_DEGREES);
  const phrase3Notes = (b) => degreesToNotes(b, P3_DEGREES);
  const twoPhraseNotes = (b) => [...phrase1Notes(b), ...phrase2Notes(b)];
  const threePhraseNotes = (b) => [...twoPhraseNotes(b), ...phrase3Notes(b)];

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  /* ---- chain exercises (PitchMatchExercise) ---- */
  const PITCH_CONNECT_EX = {
    eyebrow: "Exercise 9 · Connecting pitch", title: "Phrase 1 → Phrase 2",
    intro: "Now sing both phrases together — listen for how Phrase 2's first note relates to Phrase 1's last note.",
    chain: true, refLabel: "Reference melody",
    slots: [{ key: "take", label: "Phrase 1 → Phrase 2", hint: "With the reference above, then on your own" }],
    assessment: Q.pitchConnected,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };
  const THREE_PHRASE_EX = {
    eyebrow: "Exercise 14 · Three phrases", title: "Phrase 1 → Phrase 2 → Phrase 3",
    intro: "Only once two phrases feel comfortable. Structure: START → DEVELOP → FINISH. The third phrase can feel like a destination.",
    chain: true, refLabel: "Reference melody",
    slots: [{ key: "take", label: "All three phrases", hint: "Keep it short and comfortable" }],
    assessment: Q.threePhrase,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  /** Bars of 4 tokens for the BeatGuide (one word per beat; short lists padded with rests). */
  function wordBars(words, melodyNotes) {
    const toks = words.map((w, i) => (melodyNotes ? { t: w, midi: melodyNotes[i] } : { t: w }));
    while (toks.length % 4) toks.push({ t: "", rest: true });
    const bars = [];
    for (let i = 0; i < toks.length; i += 4) bars.push(toks.slice(i, i + 4));
    return bars;
  }
  const rhythmBars = () => [...wordBars(PHRASE1), ...wordBars(PHRASE2)];
  const singBars = (b) => [...wordBars(PHRASE1, phrase1Notes(b)), ...wordBars(PHRASE2, phrase2Notes(b))];

  const ASSIGN_KEYS = ["a1", "a2", "a3", "a4", "a5", "a6"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ASSIGN_KEYS.every((k) => take(rec, k) && take(rec, k).mediaId)
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (typeof A(rec, "identify").boundary === "number" && A(rec, "identify").revealed) out.phraseIdentification = true;
    if (take(rec, "speak1") && take(rec, "speak2") && take(rec, "speakBoth") && q(rec, "connectedSpeak")) out.speaking = true;
    if (take(rec, "rhythmTake")) out.rhythmEx = true;
    if (take(rec, "hum") && q(rec, "startPitch")) out.humming = true;
    if (q(rec, "breathPoint")) out.breathEx = true;
    if (take(rec, "ending") && q(rec, "finished")) out.phraseEnding = true;
    if (take(rec, "beginning") && q(rec, "beganComfortably")) out.phraseBeginning = true;
    if (take(rec, "combined") && q(rec, "oneIdea")) out.twoPhraseRecording = true;
    if (PITCH_CONNECT_EX.isComplete(exState(rec, "pitchConnect")) && q(rec, "pitchRelation")) out.pitchConnection = true;
    if (take(rec, "rhythmConnect") && q(rec, "rhythmFeel")) out.rhythmConnection = true;
    if (take(rec, "dictionConnect") && q(rec, "dictionClear")) out.dictionConnection = true;
    if (take(rec, "dynUp") && take(rec, "dynDown")) out.dynamicsConnection = true;
    if (take(rec, "expression") && q(rec, "expressionNatural")) out.expressionEx = true;
    if (THREE_PHRASE_EX.isComplete(exState(rec, "threePhrase"))) out.threePhraseEx = true;
    if ((A(rec, "analysis").changed || []).length) out.listeningAnalysis = true;
    if (take(rec, "attempt2") && A(rec, "review").focus) out.recordingReview = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const lyricLine = (words, attrs = "") => `<p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3" ${attrs}>${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function phraseBoundaryView() {
    return `
      <div class="grid sm:grid-cols-2 gap-3 mb-4">
        <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.04] p-4">
          <p class="text-[11px] uppercase tracking-wider text-gold-400/80 mb-2">Phrase 1</p>
          ${lyricLine(PHRASE1)}
          <div class="h-0.5 bg-gold-400/40 rounded-full mt-2"></div>
        </div>
        <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.04] p-4">
          <p class="text-[11px] uppercase tracking-wider text-teal-300/80 mb-2">Phrase 2</p>
          ${lyricLine(PHRASE2)}
          <div class="h-0.5 bg-teal-300/40 rounded-full mt-2"></div>
        </div>
      </div>`;
  }

  /* ---- single-mark phrase-boundary tap editor (a local copy of Class 11/16's pattern, applied to the combined word list) ---- */
  const ALL_WORDS = [...PHRASE1, ...PHRASE2];
  const CORRECT_BOUNDARY = PHRASE1.length - 1; // the gap right after "today"
  function renderBoundaryEditor(id, mark, revealed) {
    const gaps = ALL_WORDS.map((w, i) => `
      <span class="font-display text-lg text-ink-100">${Utils.escapeHtml(w)}</span>
      ${i < ALL_WORDS.length - 1 ? `<button type="button" data-boundary-gap="${i}" class="inline-flex items-center justify-center w-7 h-7 rounded-full text-base transition-colors ${mark === i ? "bg-gold-500/20 text-gold-200" : revealed && i === CORRECT_BOUNDARY ? "bg-emerald-500/15 text-emerald-300" : "text-ink-600 hover:text-ink-300 hover:bg-white/5"}" aria-label="Phrase boundary after ${Utils.escapeHtml(w)}">${mark === i ? "│" : revealed && i === CORRECT_BOUNDARY ? "✓" : "·"}</button>` : ""}
    `).join("");
    return `<div class="flex flex-wrap items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4" data-boundary="${id}">${gaps}</div>`;
  }
  function wireBoundaryEditor(container, id, { revealed = false, onChange }) {
    const root = container.querySelector(`[data-boundary="${id}"]`);
    if (!root) return () => {};
    let done = revealed;
    function paint(mark) {
      root.querySelectorAll("[data-boundary-gap]").forEach((b) => {
        const i = Number(b.dataset.boundaryGap);
        const isMark = i === mark, isCorrect = done && i === CORRECT_BOUNDARY;
        b.textContent = isMark ? "│" : isCorrect ? "✓" : "·";
        b.classList.toggle("bg-gold-500/20", isMark);
        b.classList.toggle("text-gold-200", isMark);
        b.classList.toggle("bg-emerald-500/15", !isMark && isCorrect);
        b.classList.toggle("text-emerald-300", !isMark && isCorrect);
        b.classList.toggle("text-ink-600", !isMark && !isCorrect);
      });
    }
    function onClick(e) {
      if (done) return; // one tap, then revealed — matches the StabilityPanel-style "answer once, then look" pattern
      const btn = e.target.closest("[data-boundary-gap]");
      if (!btn) return;
      const i = Number(btn.dataset.boundaryGap);
      done = true;
      paint(i);
      if (onChange) onChange(i);
    }
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  function problems() {
    const items = [
      ["“I take too long to breathe.”", "Use a smaller, comfortable breath. Practise the transition separately."],
      ["“I rush the second phrase.”", "Speak both phrases naturally first. Then sing them."],
      ["“My pitch changes after I breathe.”", "Listen to the starting note again. Practise Phrase 2 separately, then reconnect."],
      ["“I lose the rhythm between phrases.”", "Use the metronome. Keep the internal pulse going during the breath."],
      ["“The first phrase sounds good but the second becomes weak.”", "Reduce the phrase length. Use a comfortable breath — don't force more air."],
      ["“I don't know where to breathe.”", "Look at the meaning of the sentence. Choose a natural linguistic boundary where possible."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const steps = ["PHRASE 1", "BREATH", "PHRASE 2", "CONTINUITY"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 17 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">CONNECTING MUSICAL THOUGHTS</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}
        </div>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-4">
          ${["PHRASE 1", "PHRASE 2", "PHRASE 3"].map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-gold-300">+</span>` : ""}`).join("")}
        </div>
        <p class="text-gold-300 text-xl mb-1">=</p>
        <p class="font-display text-2xl text-teal-200 mb-5">MUSICAL FLOW</p>
        <p class="text-sm text-ink-300">You are beginning to move beyond individual exercises.</p>
        <p class="text-sm text-ink-100">You're learning how separate phrases become a musical performance.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["phraseIdentification", "speaking", "rhythmEx", "humming", "breathEx", "phraseEnding", "phraseBeginning", "twoPhraseRecording", "pitchConnection", "rhythmConnection", "dictionConnection", "dynamicsConnection", "expressionEx", "threePhraseEx", "listeningAnalysis", "recordingReview"].filter((k) => c[k]).length;
    return [
      [`Connection exercises (${ex}/16)`, ex === 16],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">A phrase should not exist in isolation. You can finish one musical thought, breathe comfortably, and begin the next without losing pitch, rhythm or meaning.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll learn how to shape a longer musical line so it has direction, rather than sounding like a sequence of separate notes.` : "Next, we'll learn how to shape a longer musical line so it has direction."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A phrase should not exist in isolation.</h3>
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
    const identify = A(rec, "identify");
    const a = A(rec, "assignment");
    const analysisChanged = A(rec, "analysis").changed || [];
    const reviewFocus = A(rec, "review").focus || null;

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Turn separate phrases into one musical thought", `
          ${p("A song is rarely one continuous line — it's usually made of phrase, phrase, phrase, phrase. Each phrase has its own shape, but the listener should still feel that the phrases <strong class=\"text-ink-100\">belong together</strong>.")}
          ${p("You'll practise phrase endings, breathing, phrase beginnings, and keeping pitch, rhythm, words and musical intention connected across the breath.")}
          ${phraseBoundaryView()}
        `)}

        ${chapter("understand", 2, "Don't rush from one phrase into the next", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Don't rush from one phrase into the next.”</p>
            <p class="text-sm text-ink-200 mb-3">A good phrase connection needs: <strong class="text-ink-100">finish → recover → prepare → begin.</strong></p>
            <p class="text-sm text-ink-200">Avoid holding your breath, taking a huge breath, rushing the next phrase, leaving an awkward gap, or singing through discomfort.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("identify", 3, "Exercise 1 — Identify the phrases", `
          ${narrow(p("Tap where you think the first musical thought finishes."))}
          <button type="button" data-play-identify class="vr-btn vr-btn-gold mb-4">${icon("play", "w-4 h-4")} Play the example melody</button>
          ${renderBoundaryEditor("cp-boundary", typeof identify.boundary === "number" ? identify.boundary : null, !!identify.revealed)}
          <p class="text-sm text-ink-300 mt-3 min-h-[1.25rem]" data-boundary-msg>${identify.revealed ? (identify.boundary === CORRECT_BOUNDARY ? "That's it — right after “today”." : `The natural boundary sits right after “today” — have another listen.`) : ""}</p>
        `)}

        ${chapter("speak", 4, "Exercise 2 — Speak two phrases", `
          ${p("Speak each phrase on its own, then speak both as one connected thought.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-3">
            ${recCard("speak1", "Phrase 1", `“${PHRASE1.join(" ")}”`, 10)}
            ${recCard("speak2", "Phrase 2", `“${PHRASE2.join(" ")}”, pause naturally first`, 10)}
          </div>
          ${recCard("speakBoth", "Both, as one connected thought", "Phrase 1 → natural pause → Phrase 2.", 12)}
          <div class="mt-4">${SelfAssessment.render("connectedSpeak-q", { ...Q.connectedSpeak, selected: sel("connectedSpeak") })}</div>
        `)}

        ${chapter("rhythm", 5, "Exercise 3 — Rhythm before melody", `
          ${narrow(p("Speak both phrases in rhythm with the metronome — one word per beat. Then let go of the exaggerated counting and just keep the underlying pulse."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("cp-metro", { bpm: BPM })}
          </div>
          <div class="dc-words mb-4">${BeatGuide.render("bg-cp-rhythm", { bars: rhythmBars(), startLabel: "Speak in rhythm" })}</div>
          ${recCard("rhythmTake", "Speak both phrases, keeping the pulse", "No need to count out loud.", 12)}
        `, { wide: true })}

        ${chapter("hum", 6, "Exercise 4 — Hum two phrases", `
          ${narrow(p("Remove the lyrics. Hum Phrase 1, breathe, hum Phrase 2 — focusing on pitch, rhythm, breath and the connection between them."))}
          ${recCard("hum", "Hum both phrases", "“mmm” — phrase 1, breathe, phrase 2.", 14)}
          <div class="mt-4">${SelfAssessment.render("startPitch-q", { ...Q.startPitch, selected: sel("startPitch") })}</div>
        `)}

        ${chapter("breath", 7, "Exercise 5 — Breath between phrases", `
          ${narrow(`
            ${p("PHRASE 1 → natural release → comfortable breath → PHRASE 2. Breathe where it makes musical and linguistic sense — don't force a particular pattern, and don't take a huge breath. If the phrase feels too long, shorten it.")}
            <div class="flex justify-center my-5"><div class="breathe-circle !w-20 !h-20" data-breath-circle></div></div>
          `)}
          ${SelfAssessment.render("breathPoint-q", { ...Q.breathPoint, selected: sel("breathPoint") })}
        `)}

        ${chapter("structure", 8, "Exercise 6 — Phrase ending", `
          ${narrow(p("Focus only on the last note of Phrase 1. Check: pitch, word ending, breath comfort, dynamics. You don't need a long final note."))}
          ${recCard("ending", "Phrase 1, then stop", "Stop naturally — don't extend it.", 10)}
          <div class="mt-4">${SelfAssessment.render("finished-q", { ...Q.finished, selected: sel("finished") })}</div>
        `)}

        ${chapter("structure", 9, "Exercise 7 — Phrase beginning", `
          ${narrow(p("Focus only on Phrase 2. Avoid sudden loudness, tension, pitch instability or rushing."))}
          ${recCard("beginning", "Breath, then Phrase 2", "A comfortable breath, then begin.", 10)}
          <div class="mt-4">${SelfAssessment.render("beganComfortably-q", { ...Q.beganComfortably, selected: sel("beganComfortably") })}</div>
        `)}

        ${chapter("combine", 10, "Exercise 8 — Phrase 1 → Phrase 2", `
          ${p("Now combine both: Phrase 1, a natural breath, Phrase 2. Record, then play it back.")}
          ${recCard("combined", "Phrase 1 → breath → Phrase 2", "All together, naturally.", 14)}
          <div class="mt-4">${SelfAssessment.render("oneIdea-q", { ...Q.oneIdea, selected: sel("oneIdea") })}</div>
        `)}

        ${chapter("connect", 11, "Exercise 9 — Connecting pitch", `
          ${narrow(p("Tap a key for a comfortable reference note (it's carried over from earlier classes otherwise). Every melody in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("cp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-ending class="vr-btn">${icon("play", "w-4 h-4")} Play Phrase 1's ending note</button>
            <button type="button" data-play-starting class="vr-btn">${icon("play", "w-4 h-4")} Play Phrase 2's starting note</button>
          </div>
          <div class="mb-5">${SelfAssessment.render("pitchRelation-q", { ...Q.pitchRelation, selected: sel("pitchRelation") })}</div>
          ${PitchMatchExercise.render("cp-pitch", PITCH_CONNECT_EX)}
          <div class="mt-4">${StabilityPanel.render("sp-pitch", { title: "Estimated pitch — after you answer" })}</div>
        `, { wide: true })}

        ${chapter("connect", 12, "Exercise 10 — Connecting rhythm", `
          ${narrow(p("A short rest between phrases, then reduce it naturally. Avoid dragging, rushing, starting late or starting early."))}
          ${recCard("rhythmConnect", "Phrase 1 → brief rest → Phrase 2", "Let the pulse carry through the rest.", 12)}
          <div class="mt-4">${SelfAssessment.render("rhythmFeel-q", { ...Q.rhythmFeel, selected: sel("rhythmFeel") })}</div>
        `)}

        ${chapter("connect", 13, "Exercise 11 — Connecting diction", `
          ${narrow(p(`Connecting Class 15. Make sure the final word of Phrase 1 (“${PHRASE1[PHRASE1.length - 1]}”) and the first word of Phrase 2 (“${PHRASE2[0]}”) both stay clear — breathing is part of the musical sentence, it shouldn't destroy the meaning.`))}
          ${recCard("dictionConnect", "Phrase 1 → Phrase 2, focus on those two words", "Clear, not louder.", 12)}
          <div class="mt-4">${SelfAssessment.render("dictionClear-q", { ...Q.dictionClear, selected: sel("dictionClear") })}</div>
        `)}

        ${chapter("connect", 14, "Exercise 12 — Connecting dynamics", `
          ${narrow(p("Connecting Class 14. Two subtle variations — this isn't a loudness exercise."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("dynUp", "Phrase 1 medium → Phrase 2 slightly stronger", "A gentle lift into Phrase 2.", 12)}
            ${recCard("dynDown", "Phrase 1 slightly stronger → Phrase 2 softer", "A gentle settle into Phrase 2.", 12)}
          </div>
        `)}

        ${chapter("connect", 15, "Exercise 13 — Two-phrase expression", `
          ${narrow(p("A simple emotional intention — not acting technique. Phrase 1 establishes the thought; Phrase 2 completes it."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">${lyricLine(EXPR_PHRASE1)}</div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">${lyricLine(EXPR_PHRASE2)}</div>
          </div>
          ${recCard("expression", "Sing naturally, with the meaning in mind", "Your own natural melody — no reference this time.", 12)}
          <div class="mt-4">${SelfAssessment.render("expressionNatural-q", { ...Q.expressionNatural, selected: sel("expressionNatural") })}</div>
        `)}

        ${chapter("extend", 16, "Exercise 14 — Three-phrase connection", `
          ${narrow(p("Only once two phrases are comfortable. START → DEVELOP → FINISH — notice how the third phrase can feel like a destination."))}
          ${lyricLine(PHRASE3)}
          ${PitchMatchExercise.render("cp-three", THREE_PHRASE_EX)}
        `)}

        ${chapter("listen", 17, "Exercise 15 — Listening analysis", `
          ${p("Two short versions of the same idea.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version A — disconnected</p><button type="button" data-play-analysis="a" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"><p class="text-sm text-ink-100 mb-2">Version B — naturally connected</p><button type="button" data-play-analysis="b" class="vr-btn">${icon("play", "w-4 h-4")} Play</button></div>
          </div>
          <div class="mb-3">${ObservationChecklist.render("cp-analysis", [{ key: "changed", title: "What changed?", prompt: "Choose any that fit.", options: ANALYSIS_OPTIONS }], { changed: analysisChanged })}</div>
          <p class="text-sm text-ink-300 min-h-[1.25rem]" data-analysis-msg>${analysisChanged.length ? "Version B kept a short, natural breath-length gap and started Phrase 2 on a related note. Version A had a longer gap and an unrelated starting note — that's what made it sound disconnected." : ""}</p>
        `)}

        ${chapter("listen", 18, "Exercise 16 — Recording review", `
          ${p("Record a fresh attempt, then compare it with Exercise 8's combined take. Listen for: phrase ending, breath, phrase beginning, pitch, rhythm, words, dynamics — but don't judge everything at once. Choose ONE main issue to improve.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p class="text-sm text-ink-100 mb-2">Attempt 1 — from Exercise 8</p><button type="button" data-play-review="a" class="vr-btn" ${take(rec, "combined") ? "" : "disabled"}>${icon("play", "w-4 h-4")} Play</button></div>
            <div>${recCard("attempt2", "Attempt 2", "The same two phrases, now.", 14)}</div>
          </div>
          ${SelfAssessment.render("review-focus-q", { question: "Which ONE thing would you most like to improve?", options: REVIEW_FOCUS_OPTIONS.map((o) => opt(o.toLowerCase().replace(/\s+/g, "-"), o)), selected: reviewFocus })}
        `)}

        ${chapter("listen", 19, "Common beginner problems", problems())}

        ${chapter("evaluate", 20, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("cp-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 21, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused sessions are best — not excessive practice.")}
          ${Timer.render("cp-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 22, `Class ${cls.number} Assignment`, `
          ${p("Using a short two-phrase melody, complete six attempts. You don't need to do all six in one session.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${recCard("a1", "Attempt 1 — Hum both phrases", "“mmm”, with the breath between them.", 14)}
            ${recCard("a2", "Attempt 2 — One vowel", "Sing the melody on “AH”.", 14)}
            ${recCard("a3", "Attempt 3 — Add lyrics", "The words, any natural tempo.", 14)}
            ${recCard("a4", "Attempt 4 — Comfortable breathing", "Focus on the breath between phrases.", 14)}
            ${recCard("a5", "Attempt 5 — Smooth connection", "Focus on phrase 1 flowing into phrase 2.", 14)}
            ${recCard("a6", "Attempt 6 — Final performance", "Natural, complete, your best take today.", 15)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="cp-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="cp-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 23, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-cp", { placeholder: "e.g. I rush the second phrase. I take too long to breathe. My second phrase loses energy." })}
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
      const playReviewA = $("[data-play-review=\"a\"]"); if (playReviewA) playReviewA.disabled = !take(rec, "combined");
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

    /* ---- Exercise 1: phrase-boundary identification ---- */
    function onPlayIdentify(e) {
      if (!e.target.closest("[data-play-identify]")) return;
      PianoSynth.playSequence(twoPhraseNotes(base()), { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayIdentify);
    cleanups.push(() => container.removeEventListener("click", onPlayIdentify));
    cleanups.push(wireBoundaryEditor(container, "cp-boundary", {
      revealed: !!A(rec0(), "identify").revealed,
      onChange: (i) => {
        set("identify", "boundary", i);
        set("identify", "revealed", true);
        syncCheckpoints(); refreshLive();
        const msg = $("[data-boundary-msg]");
        if (msg) msg.textContent = i === CORRECT_BOUNDARY ? "That's it — right after “today”." : `The natural boundary sits right after “today” — have another listen.`;
      },
    }));

    /* ---- Exercise 3: metronome + rhythm guide ---- */
    own(Metronome.wire(container, "cp-metro", { bpm: BPM }));
    let rhythmGuide = null;
    cleanups.push(() => { if (rhythmGuide) rhythmGuide.destroy(); });
    rhythmGuide = BeatGuide.wire(container, "bg-cp-rhythm", { bpm: BPM, loops: 2, bars: rhythmBars() });

    /* ---- Exercise 7: breath circle (visual only) ---- */
    const bc = $("[data-breath-circle]");
    if (bc) bc.classList.add("is-running");

    /* ---- Exercise 9: reference note + pitch connection ---- */
    own(VirtualPiano.wire(container, "cp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - MAX_DEGREE * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - MAX_DEGREE * STEP)} or lower so the melody stays comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exPitch.refresh(); exThree.refresh();
      },
    }));
    function onPlayEnds(e) {
      const btn = e.target.closest("[data-play-ending],[data-play-starting]");
      if (!btn) return;
      const b = base();
      const midi = btn.hasAttribute("data-play-ending") ? phrase1Notes(b)[phrase1Notes(b).length - 1] : phrase2Notes(b)[0];
      PianoSynth.play(midi, { duration: 1 });
    }
    container.addEventListener("click", onPlayEnds);
    cleanups.push(() => container.removeEventListener("click", onPlayEnds));
    const exPitch = own(PitchMatchExercise.wire(container, "cp-pitch", PITCH_CONNECT_EX, {
      classId, exerciseId: "pitchConnect", state: (rec0().answers.exercises || {}).pitchConnect || {},
      getNotes: () => twoPhraseNotes(base()), isComplete: PITCH_CONNECT_EX.isComplete,
      onState: (s) => { set("exercises", "pitchConnect", s); syncCheckpoints(); refreshLive(); panelPitch.refresh(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    const panelPitch = own(StabilityPanel.wire(container, "sp-pitch", {
      getTake: () => exState(rec0(), "pitchConnect").takes.take || null,
      chain: true,
      canReveal: () => !!(exState(rec0(), "pitchConnect").takes.take || {}).assessment,
      onRevealed: () => { set("viz", "pitch", true); refreshLive(); },
    }));

    /* ---- Exercise 14: three-phrase chain ---- */
    const exThree = own(PitchMatchExercise.wire(container, "cp-three", THREE_PHRASE_EX, {
      classId, exerciseId: "threePhrase", state: (rec0().answers.exercises || {}).threePhrase || {},
      getNotes: () => threePhraseNotes(base()), isComplete: THREE_PHRASE_EX.isComplete,
      onState: (s) => { set("exercises", "threePhrase", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 15: listening analysis (synthesized A/B) ---- */
    function onPlayAnalysis(e) {
      const btn = e.target.closest("[data-play-analysis]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playAnalysis === "b") {
        PianoSynth.playSequence(twoPhraseNotes(b), { duration: 0.55, gap: 0.22 }); // short, natural breath-length gap, related note
      } else {
        const p1 = phrase1Notes(b);
        const p2detached = phrase2Notes(b).map((m) => m + 7); // unrelated distant note
        PianoSynth.playSequence([...p1.map((m) => ({ midi: m, velocity: 0.75 })), ...p2detached.map((m) => ({ midi: m, velocity: 0.75 }))], { duration: 0.55, gap: 1.1 }); // long, disconnected gap
      }
    }
    container.addEventListener("click", onPlayAnalysis);
    cleanups.push(() => container.removeEventListener("click", onPlayAnalysis));
    cleanups.push(ObservationChecklist.wire(container, "cp-analysis", {
      selected: { changed: A(rec0(), "analysis").changed || [] },
      onChange: (_, values) => {
        set("analysis", "changed", values);
        syncCheckpoints(); refreshLive();
        const msg = $("[data-analysis-msg]");
        if (msg) msg.textContent = values.length ? "Version B kept a short, natural breath-length gap and started Phrase 2 on a related note. Version A had a longer gap and an unrelated starting note — that's what made it sound disconnected." : "";
      },
    }));

    /* ---- Exercise 16: recording review ---- */
    function onPlayReview(e) {
      if (!e.target.closest("[data-play-review=\"a\"]")) return;
      const t = take(rec0(), "combined");
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "connectedSpeak-q": "connectedSpeak", "startPitch-q": "startPitch", "breathPoint-q": "breathPoint",
      "finished-q": "finished", "beganComfortably-q": "beganComfortably", "oneIdea-q": "oneIdea",
      "pitchRelation-q": "pitchRelation", "rhythmFeel-q": "rhythmFeel", "dictionClear-q": "dictionClear",
      "expressionNatural-q": "expressionNatural",
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || group.closest("[data-pm]")) return; // PitchMatchExercise handles its own chips
      if (name === "review-focus-q") {
        group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
        set("review", "focus", chip.dataset.assessChoice);
        syncCheckpoints(); refreshLive();
        return;
      }
      if (!assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- all recordings ---- */
    const NAMES = {
      speak1: "Speak — phrase 1", speak2: "Speak — phrase 2", speakBoth: "Speak — both connected", rhythmTake: "Rhythm — both phrases",
      hum: "Hum both phrases", ending: "Phrase ending", beginning: "Phrase beginning", combined: "Phrase 1 → Phrase 2",
      rhythmConnect: "Connecting rhythm", dictionConnect: "Connecting diction",
      dynUp: "Dynamics — medium to stronger", dynDown: "Dynamics — stronger to softer",
      expression: "Two-phrase expression", attempt2: "Recording review — attempt 2",
      a1: "Assignment — hum both", a2: "Assignment — one vowel", a3: "Assignment — lyrics", a4: "Assignment — breathing focus", a5: "Assignment — smooth connection", a6: "Assignment — final performance",
    };
    const MAX_SECONDS = {
      speak1: 10, speak2: 10, speakBoth: 12, rhythmTake: 12, hum: 14, ending: 10, beginning: 10, combined: 14,
      rhythmConnect: 12, dictionConnect: 12, dynUp: 12, dynDown: 12, expression: 12, attempt2: 14,
      a1: 14, a2: 14, a3: 14, a4: 14, a5: 14, a6: 15,
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 15,
        meta: { name: `Class 17 — ${NAMES[k]}`, exercise: `connect-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "cp-timer", {
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
    cleanups.push(ControlCheck.wire(container, "cp-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    own(PersonalNotes.wire(container, "notes-cp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(ans[5]) ? ans[5] : "A phrase doesn't exist in isolation — finishing one thought, breathing comfortably, and beginning the next keeps the music connected.",
        struggled: ans[0] || "",
        toPractice: ans[7] || "",
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
