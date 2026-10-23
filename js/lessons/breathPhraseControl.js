/* ============================================================
   CLASS 11 (L1C11; first built as L2C01 — see APP_DATA.LEGACY_CLASS_IDS) — BREATH & PHRASE CONTROL (interactive lesson)

   Rendered by ClassDetailPage for interactive: "breath-phrase-control".

   Core idea: "Good singing breath is not about taking the biggest
   breath. It is about using a comfortable breath efficiently
   through a musical phrase." Nothing here rewards breath
   duration — no timers, no "hold as long as you can", no
   leaderboards. Every exercise ends in rest, not a challenge.

   Flow: breath awareness -> gentle exhale -> speaking phrases ->
   breath before a phrase -> phrase length -> breath marking ->
   breath+rhythm -> breath+pitch -> same phrase/different breath ->
   phrase-ending awareness -> compare with the Class 10 baseline ->
   self-evaluate -> practice -> plan-and-record assignment -> reflect.

   Reuses: LessonKit, the Class 7 breathing circle (CSS class
   already in styles.css, reused as-is), SelfAssessment + the
   Class 4 PitchMatchExercise engine (breath+pitch pattern), the
   Class 5 RecordingCard, the full Class 6 Metronome, the
   generalized Class 8 ControlCheck (custom levels) for the
   6-category self-evaluation, VoiceRecorder.play for the
   baseline-vs-current comparison with Class 10's song recording.
   The one new piece — a tap-to-mark breath-point phrase editor —
   is local to this file (used 3x within the lesson itself), the
   same way Class 7/8 kept small single-purpose helpers local
   rather than spinning up a new shared component for one class.
   ============================================================ */

const BreathPhraseControlLesson = (() => {
  const STAGES = [
    { id: "intro", label: "Intro" },
    { id: "breathe", label: "Breathe" },
    { id: "speaking", label: "Speaking" },
    { id: "phrase", label: "Phrase" },
    { id: "marking", label: "Marking" },
    { id: "rhythm", label: "Rhythm" },
    { id: "pitch", label: "Pitch" },
    { id: "compare", label: "Compare" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2;
  const BPM = 66;
  const PRACTICE_TASK = "breath";
  const PRACTICE_CATEGORY = "Breath & Phrase Control";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson" },
    { key: "breathAwareness", label: "Natural breathing awareness completed" },
    { key: "gentleExhale", label: "Gentle exhale completed" },
    { key: "speakingPhrase", label: "Speaking phrase completed" },
    { key: "breathBeforePhrase", label: "Breath-before-phrase completed" },
    { key: "phraseLength", label: "Phrase-length exercise completed" },
    { key: "breathMarking", label: "Breath-marking exercise completed" },
    { key: "breathRhythm", label: "Breath + rhythm completed" },
    { key: "breathPitch", label: "Breath + pitch completed" },
    { key: "comparison", label: "Comparison completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const PHRASES = {
    beforePhrase: "I am learning to sing.",
    short: "I am singing.",
    medium: "I am learning to sing today.",
    long: "I am learning to sing with comfortable breath control.",
    speaking: "I am learning to sing with better control.",
    marking: "I am learning to sing with confidence.",
  };

  const AWARE_ASSESS = {
    question: "Did you breathe naturally?",
    options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" },
      { value: "controlling", label: "I was consciously controlling it", tone: "maybe" }, { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
  };
  const EXHALE_ASSESS = {
    question: "Did you feel comfortable?",
    options: [{ value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" }, { value: "no", label: "No", tone: "maybe" }],
  };
  const ENOUGH_BREATH_ASSESS = {
    question: "Did you feel you had enough breath?",
    options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "almost", label: "Almost", tone: "good" },
      { value: "no", label: "No", tone: "maybe" }, { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
  };
  const NATURAL_POINT_ASSESS = {
    question: "Does this feel like a natural place to breathe?",
    options: [
      { value: "natural", label: "Natural", tone: "good" }, { value: "possible", label: "Possible", tone: "good" },
      { value: "awkward", label: "Awkward", tone: "maybe" }, { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
  };
  const BIGGER_BREATH_ASSESS = {
    question: "Did the larger breath actually make the phrase easier?",
    options: [
      { value: "yes", label: "Yes", tone: "neutral" }, { value: "no", label: "No", tone: "neutral" },
      { value: "same", label: "About the same", tone: "neutral" }, { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
  };
  const COMPARE_ASSESS = {
    question: "Can you hear any difference in how you manage the phrase?",
    options: [
      { value: "yes", label: "Yes", tone: "neutral" }, { value: "no", label: "No", tone: "neutral" },
      { value: "same", label: "About the same", tone: "neutral" }, { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
  };

  const EVAL_LEVELS = [
    { value: "comfortable", mark: "✓", label: "Comfortable" },
    { value: "developing", mark: "△", label: "Developing" },
    { value: "attention", mark: "○", label: "Needs attention" },
    { value: "unsure", mark: "?", label: "Not sure" },
  ];
  const EVAL_ROWS = [
    { key: "breath", area: "Breath", question: "Did I breathe comfortably?" },
    { key: "timing", area: "Timing", question: "Did I breathe at an appropriate point?" },
    { key: "phrase", area: "Phrase", question: "Could I complete the phrase comfortably?" },
    { key: "ending", area: "Ending", question: "Did I avoid rushing the end?" },
    { key: "control", area: "Control", question: "Did I avoid pushing?" },
    { key: "recovery", area: "Recovery", question: "Could I return to normal breathing comfortably?" },
  ];

  const EX_PITCH = {
    eyebrow: "Exercise 8 · Breath + Pitch", title: "A short 1–2–3–2–1 pattern",
    intro: "Breathe comfortably, sing the pattern, stop, and return to normal breathing. Coordination, not endurance.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "take", label: "Your pattern", hint: "Sing along on a comfortable syllable" }],
    assessment: null,
    isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const patternNotes = (b) => [0, 1, 2, 1, 0].map((i) => b + i * STEP);

  /* ---------- phrase editor: tap a gap between words to place/remove 💨 ---------- */
  function phraseWords(text) { return text.trim().split(/\s+/).filter(Boolean); }
  function renderPhraseEditor(id, lyric, marks = []) {
    const words = phraseWords(lyric);
    const gaps = words.map((w, i) => `
      <span class="font-display text-lg text-ink-100">${Utils.escapeHtml(w)}</span>
      ${i < words.length - 1 ? `<button type="button" data-phrase-gap="${i}" class="inline-flex items-center justify-center w-7 h-7 rounded-full text-base transition-colors ${marks.includes(i) ? "bg-gold-500/20 text-gold-200" : "text-ink-600 hover:text-ink-300 hover:bg-white/5"}" aria-label="Breath mark after ${Utils.escapeHtml(w)}">${marks.includes(i) ? "💨" : "·"}</button>` : ""}
    `).join("");
    return `<div class="flex flex-wrap items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4" data-phrase="${id}">${gaps}</div>`;
  }
  function wirePhraseEditor(container, id, { multi = false, selected = [], onChange }) {
    const root = container.querySelector(`[data-phrase="${id}"]`);
    if (!root) return () => {};
    let marks = selected.slice();
    function paint() {
      root.querySelectorAll("[data-phrase-gap]").forEach((b) => {
        const i = Number(b.dataset.phraseGap);
        const m = marks.includes(i);
        b.textContent = m ? "💨" : "·";
        b.classList.toggle("bg-gold-500/20", m);
        b.classList.toggle("text-gold-200", m);
        b.classList.toggle("text-ink-600", !m);
      });
    }
    function onClick(e) {
      const btn = e.target.closest("[data-phrase-gap]");
      if (!btn) return;
      const i = Number(btn.dataset.phraseGap);
      if (multi) { const idx = marks.indexOf(i); if (idx >= 0) marks.splice(idx, 1); else marks.push(i); }
      else { marks = marks[0] === i ? [] : [i]; }
      paint();
      if (onChange) onChange(marks.slice());
    }
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }

  /* ---------- derived state (base note inherited, same chain Classes 7/9/10 use) ---------- */
  function range(rec) {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range(rec);
    const n = (ClassActivity.get("L1C10").answers.setup || {}).note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));

  function baselineSongTake() {
    const c10 = ClassActivity.get("L1C10");
    return (c10.answers.song || {}).take || null;
  }

  function phraseLengthDone(rec) {
    const l = A(rec, "length");
    return ["short", "medium", "long"].every((k) => l[k] && l[k].mediaId);
  }
  function sameDifferentDone(rec) {
    const d = A(rec, "different");
    return !!(d.natural && d.natural.mediaId) && !!(d.bigger && d.bigger.mediaId) && !!d.assess;
  }
  function comparisonDone(rec) {
    const cmp = A(rec, "compare");
    return sameDifferentDone(rec) && !!(cmp.current && cmp.current.mediaId) && !!cmp.assess;
  }
  function selfEvalDone(rec) { const ev = A(rec, "evaluate"); return EVAL_ROWS.every((r) => !!ev[r.key]); }
  function reflectionDone(rec, cls) { const r = A(rec, "reflection"); return cls.content.assignment.questions.every((_, i) => filled(r[i])); }
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return !!(a.attempt1 && a.attempt1.mediaId) && !!(a.attempt2 && a.attempt2.mediaId) && reflectionDone(rec, cls);
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (A(rec, "breathe").assess) out.breathAwareness = true;
    if (A(rec, "exhale").assess) out.gentleExhale = true;
    if ((A(rec, "speaking").take || {}).mediaId) out.speakingPhrase = true;
    const bb = A(rec, "beforephrase");
    if (bb.take && bb.take.mediaId && bb.assess) out.breathBeforePhrase = true;
    if (phraseLengthDone(rec)) out.phraseLength = true;
    const mk = A(rec, "marking");
    if (mk.marks && mk.marks.length && mk.assess) out.breathMarking = true;
    if ((A(rec, "rhythm").take || {}).mediaId) out.breathRhythm = true;
    if (exDone(rec, "pitch", EX_PITCH)) out.breathPitch = true;
    if (comparisonDone(rec)) out.comparison = true;
    out.reflection = reflectionDone(rec, cls);
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function phraseFlow() {
    const steps = ["BREATH", "PHRASE", "NATURAL END", "BREATH", "NEXT PHRASE"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    return [
      ["Natural breath awareness", !!c.breathAwareness], ["Gentle exhale", !!c.gentleExhale], ["Speaking phrase", !!c.speakingPhrase],
      ["Breath before a phrase", !!c.breathBeforePhrase], ["Phrase length", !!c.phraseLength], ["Breath marking", !!c.breathMarking],
      ["Breath + rhythm", !!c.breathRhythm], ["Breath + pitch", !!c.breathPitch], ["Comparison", !!c.comparison], ["Reflected", !!c.reflection],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You're beginning to connect breathing with music.</p>
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You don't need to control every breath consciously — with practice, good breathing choices become more natural.</p>
        ${next ? `<p class="text-sm text-ink-400 leading-relaxed mt-2">Now that you understand how breath supports a phrase, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong> we'll work more deliberately on the connection between notes: “Hitting a note is one skill. Keeping the note stable is another.”</p>` : ""}
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">A comfortable breath, used efficiently.</h3>
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
          </div>` : `<p class="text-sm text-ink-500 mt-6">More classes are on their way.</p>`}
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
    const breathe = A(rec, "breathe");
    const exhale = A(rec, "exhale");
    const beforephrase = A(rec, "beforephrase");
    const marking = A(rec, "marking");
    const different = A(rec, "different");
    const compare = A(rec, "compare");
    const evaluate = A(rec, "evaluate");
    const refl = A(rec, "reflection");
    const assignment = A(rec, "assignment");
    const planPhrase = assignment.phrase || "";
    const baseline = baselineSongTake();

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("intro", 1, "Breathe for the phrase, not just the note", `
          ${p("When singing, breathing isn't an isolated exercise. A singer decides: when should I breathe? How much breath do I comfortably need? Can I complete the phrase without rushing? Can I release the breath without forcing?")}
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">The goal is NOT</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Maximum inhalation", "Maximum breath-holding", "Maximum note duration"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">The goal is</p>
              <p class="text-sm text-ink-200">Comfortable breath → controlled phrase → natural release.</p>
            </div>
          </div>
        `)}

        ${chapter("intro", 2, "Never train breath by forcing or holding it", `
          <div class="comfort-callout rounded-3xl border border-red-400/20 bg-red-500/[0.05] p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-red-200 mb-4">“Never train breath by forcing or holding it.”</p>
            <p class="text-sm text-ink-200 mb-3">You do NOT need to:</p>
            <div class="flex flex-wrap gap-2">${["Take the biggest possible breath", "Hold your breath for a long time", "Exhale for as long as possible", "Compete against a timer", "Push until you run out of air", "Continue if you feel dizzy"].map((t) => `<span class="flow-chip !text-xs">${t}</span>`).join("")}</div>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
            If you feel dizzy, light-headed, unusually breathless, uncomfortable or strained: <strong>stop</strong>, return to normal breathing, and rest.
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("intro", 3, "What is a phrase?", `
          ${narrow(p("A musical phrase is a group of words or notes that belong together."))}
          ${phraseFlow()}
          ${narrow(p("Good phrase breathing helps you avoid running out of breath in the middle of an important word or musical idea."))}
        `)}

        ${chapter("breathe", 4, "Exercise 1 — Natural breath awareness", `
          ${narrow(`
            ${p("Sit or stand comfortably and observe a few normal breaths — no timer, no scoring.")}
            <div class="flex flex-col items-center gap-5 my-6">
              <div class="breathe-circle" data-breathe-circle></div>
              <p class="text-sm text-ink-400">Let the next breath happen naturally.</p>
            </div>
          `)}
          ${SelfAssessment.render("bp-breathe-assess", { question: AWARE_ASSESS.question, options: AWARE_ASSESS.options, selected: breathe.assess || null })}
        `)}

        ${chapter("breathe", 5, "Exercise 2 — Gentle exhale", `
          ${narrow(`
            ${p("Inhale comfortably. Exhale softly on a gentle “sss”, only for a short, comfortable duration — not maximized, not compared with anyone else. Then return to normal breathing and rest.")}
          `)}
          ${SelfAssessment.render("bp-exhale-assess", { question: EXHALE_ASSESS.question, options: EXHALE_ASSESS.options, selected: exhale.assess || null })}
          <div data-exhale-warning class="mt-3">${exhale.assess === "no" ? exhaleWarning() : ""}</div>
        `)}

        ${chapter("speaking", 6, "Exercise 3 — Speaking phrases", `
          ${narrow(p(`Speak naturally: <em class="text-ink-200">“${PHRASES.speaking}”</em> Then notice where you naturally wanted to breathe, and tap between the words to mark it.`))}
          ${RecordingCard.render("bp-speaking", { title: "Speak the phrase", hint: "Just talk naturally.", maxSeconds: 15, section: false })}
          <div class="mt-4">${renderPhraseEditor("bp-speaking-mark", PHRASES.speaking, typeof A(rec, "speaking").mark === "number" ? [A(rec, "speaking").mark] : [])}</div>
          <p class="text-xs text-ink-500 mt-2">Singing often follows similar phrase boundaries, though musical phrasing can differ from normal speech.</p>
        `)}

        ${chapter("phrase", 7, "Exercise 4 — Breath before a phrase", `
          ${narrow(p(`Breathe comfortably, start the phrase, sing naturally, and stop when it ends: <em class="text-ink-200">“${PHRASES.beforePhrase}”</em> Don't use every last bit of air — the phrase should finish comfortably.`))}
          ${RecordingCard.render("bp-beforephrase", { title: "Sing the phrase", hint: "One comfortable breath, sung naturally.", maxSeconds: 15, section: false })}
          <div class="mt-4">${SelfAssessment.render("bp-bb-assess", { question: ENOUGH_BREATH_ASSESS.question, options: ENOUGH_BREATH_ASSESS.options, selected: beforephrase.assess || null })}</div>
        `)}

        ${chapter("phrase", 8, "Exercise 5 — Phrase length", `
          ${narrow(p("Short, medium, then a longer phrase — not a breath-holding challenge. If a phrase feels too long, that's useful information, not a failure. More words doesn't mean you need a bigger breath."))}
          <div class="grid sm:grid-cols-3 gap-3">
            ${RecordingCard.render("bp-length-short", { title: "Short", hint: `“${PHRASES.short}”`, maxSeconds: 10, section: false })}
            ${RecordingCard.render("bp-length-medium", { title: "Medium", hint: `“${PHRASES.medium}”`, maxSeconds: 12, section: false })}
            ${RecordingCard.render("bp-length-long", { title: "Longer", hint: `“${PHRASES.long}”`, maxSeconds: 15, section: false })}
          </div>
        `)}

        ${chapter("marking", 9, "Exercise 6 — Breath marking", `
          ${narrow(p(`Tap between words to place 💨 where you'd breathe: <em class="text-ink-200">“${PHRASES.marking}”</em> You can move it any time.`))}
          ${renderPhraseEditor("bp-marking", PHRASES.marking, marking.marks || [])}
          <div class="mt-4">${SelfAssessment.render("bp-marking-assess", { question: NATURAL_POINT_ASSESS.question, options: NATURAL_POINT_ASSESS.options, selected: marking.assess || null })}</div>
        `)}

        ${chapter("rhythm", 10, "Exercise 7 — Breath + rhythm", `
          ${narrow(p("Start the metronome: breathe for a few beats, then sing a comfortable phrase or syllable in time. Don't continue if it feels uncomfortable."))}
          ${Metronome.render("bp-metro", { bpm: BPM })}
          <div class="mt-5">${RecordingCard.render("bp-rhythm", { title: "Breathe, then sing in time", hint: "With the metronome running.", maxSeconds: 20, section: false })}</div>
        `)}

        ${chapter("pitch", 11, "Exercise 8 — Breath + pitch", `
          ${PitchMatchExercise.render("bp-pitch", EX_PITCH)}
        `)}

        ${chapter("compare", 12, "Exercise 9 — Same phrase, different breath", `
          ${narrow(p(`Record the same short phrase twice: <em class="text-ink-200">“${PHRASES.short}”</em> Attempt A with a natural comfortable breath; Attempt B with an intentionally much larger breath. This is an awareness experiment — bigger breath isn't automatically better.`))}
          <div class="grid sm:grid-cols-2 gap-4">
            ${RecordingCard.render("bp-diff-natural", { title: "Attempt A — natural breath", hint: "Your usual, comfortable breath.", maxSeconds: 10, section: false })}
            ${RecordingCard.render("bp-diff-bigger", { title: "Attempt B — a much larger breath", hint: "Intentionally take in more air than usual.", maxSeconds: 10, section: false })}
          </div>
          <div class="mt-4">${SelfAssessment.render("bp-diff-assess", { question: BIGGER_BREATH_ASSESS.question, options: BIGGER_BREATH_ASSESS.options, selected: different.assess || null })}</div>
        `)}

        ${chapter("compare", 13, "Phrase ending control", `
          ${p("Avoid suddenly dropping the voice because the breath is running out. As you finish a phrase, notice which of these it felt like:")}
          <div class="flex flex-wrap gap-2 mb-2">${["Sudden cutoff", "Rushed ending", "Comfortable ending", "Forced ending"].map((t) => `<span class="flow-chip !text-xs">${t}</span>`).join("")}</div>
          <p class="text-xs text-ink-500">You'll rate this as “Ending” in the self-evaluation below — no automatic analysis, just your own ear.</p>
        `)}

        ${chapter("compare", 14, "Compare with your baseline", `
          ${p("Using your Class 10 baseline song recording where available. Don't expect dramatic improvement — just listen for any difference in how you manage the phrase.")}
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            ${baseline ? `
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <button type="button" data-play-baseline data-mediaid="${baseline.mediaId}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("play", "w-4 h-4")} Play Baseline (Class 10)</button>
              </div>
              <p class="text-xs text-ink-500 mb-3">Now record a short comparison phrase.</p>
              ${RecordingCard.render("bp-compare-current", { title: "Current — same phrase", hint: `“${PHRASES.short}”`, maxSeconds: 10, section: false })}
              <div class="mt-4">${SelfAssessment.render("bp-compare-assess", { question: COMPARE_ASSESS.question, options: COMPARE_ASSESS.options, selected: compare.assess || null })}</div>
            ` : `${Components.EmptyState("mic", "No baseline yet", "Complete Class 10's song excerpt to compare against your baseline here.")}`}
          </div>
        `)}

        ${chapter("evaluate", 15, "Self-evaluation", `
          ${p("Your own honest read — not a medical or professional assessment.")}
          ${ControlCheck.render("bp-eval", EVAL_ROWS, evaluate, EVAL_LEVELS)}
        `)}

        ${chapter("practice", 16, "Practice timer — Breath & Phrase Control", `
          ${p("Repeat any part of this routine while the timer runs — this logs the category, not a target to beat.")}
          ${Timer.render("bp-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 17, `Class ${cls.number} Assignment`, `
          ${p("Choose a short, comfortable song phrase and record it. Listen back. Then plan: where will you breathe? Can you breathe naturally before the phrase, complete it without forcing, finish without rushing, and breathe normally afterward? Record it again.")}
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Your phrase</label>
          <input type="text" data-assign-phrase value="${Utils.escapeHtml(planPhrase)}" placeholder="Type a short phrase from a song you're comfortable singing" class="field mb-4">
          ${planPhrase ? `<div class="mb-5" data-assign-phrase-host>${renderPhraseEditor("bp-assign-mark", planPhrase, assignment.marks || [])}</div>` : `<div class="mb-5" data-assign-phrase-host></div>`}
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            ${RecordingCard.render("bp-assign-1", { title: "Attempt 1", hint: "Sing the phrase.", maxSeconds: 15, section: false })}
            ${RecordingCard.render("bp-assign-2", { title: "Attempt 2 — after planning your breath", hint: "Same phrase, breath planned.", maxSeconds: 15, section: false })}
          </div>
          <ol class="flex flex-col gap-1">
            ${cls.content.assignment.instructions.map((t, i) => `<li class="flex gap-3 text-sm text-ink-300 leading-relaxed"><span class="w-6 h-6 rounded-full bg-white/5 text-ink-400 text-xs flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span><span>${t}</span></li>`).join("")}
          </ol>
        `)}

        ${chapter("reflect", 18, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="bp-refl-${i}">${i + 1}. ${q}</label>
                <textarea id="bp-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 19, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-bp", { placeholder: "e.g. I breathe too early. I tend to rush the end of a phrase. I found a comfortable breathing point." })}
        `)}

        ${chapter("complete", 20, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 21, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function exhaleWarning() {
    return `<div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">Don't force the exercise. Return to normal breathing.</div>`;
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

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "bp-breathe-assess": (v) => { set("breathe", "assess", v); },
      "bp-exhale-assess": (v) => {
        set("exhale", "assess", v);
        const w = $("[data-exhale-warning]"); if (w) w.innerHTML = v === "no" ? exhaleWarning() : "";
      },
      "bp-bb-assess": (v) => set("beforephrase", "assess", v),
      "bp-marking-assess": (v) => set("marking", "assess", v),
      "bp-diff-assess": (v) => set("different", "assess", v),
      "bp-compare-assess": (v) => set("compare", "assess", v),
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
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- Exercise 3: speaking + mark ---- */
    own(RecordingCard.wire(container, "bp-speaking", {
      classId, take: A(rec0(), "speaking").take || null, maxSeconds: 15,
      meta: { name: "Breath — speaking phrase", exercise: "breath-speaking" },
      onSaved: (take) => { set("speaking", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    cleanups.push(wirePhraseEditor(container, "bp-speaking-mark", {
      multi: false, selected: A(rec0(), "speaking").mark !== undefined ? [A(rec0(), "speaking").mark] : [],
      onChange: (marks) => set("speaking", "mark", marks[0] ?? null),
    }));

    /* ---- Exercise 4: breath before phrase ---- */
    own(RecordingCard.wire(container, "bp-beforephrase", {
      classId, take: A(rec0(), "beforephrase").take || null, maxSeconds: 15,
      meta: { name: "Breath — before a phrase", exercise: "breath-before-phrase" },
      onSaved: (take) => { set("beforephrase", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 5: phrase length ---- */
    ["short", "medium", "long"].forEach((k) => {
      own(RecordingCard.wire(container, `bp-length-${k}`, {
        classId, take: A(rec0(), "length")[k] || null, maxSeconds: 15,
        meta: { name: `Breath — ${k} phrase`, exercise: `breath-length-${k}` },
        onSaved: (take) => { set("length", k, take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- Exercise 6: breath marking ---- */
    cleanups.push(wirePhraseEditor(container, "bp-marking", {
      multi: false, selected: A(rec0(), "marking").marks || [],
      onChange: (marks) => { set("marking", "marks", marks); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 7: breath + rhythm ---- */
    own(Metronome.wire(container, "bp-metro", { bpm: BPM }));
    own(RecordingCard.wire(container, "bp-rhythm", {
      classId, take: A(rec0(), "rhythm").take || null, maxSeconds: 20,
      meta: { name: "Breath — rhythm exercise", exercise: "breath-rhythm" },
      onSaved: (take) => { set("rhythm", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 8: breath + pitch ---- */
    own(PitchMatchExercise.wire(container, "bp-pitch", EX_PITCH, {
      classId, exerciseId: "pitch",
      state: (rec0().answers.exercises || {}).pitch || {},
      getNotes: () => patternNotes(base()),
      isComplete: EX_PITCH.isComplete,
      onState: (s) => { set("exercises", "pitch", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 9: same phrase, different breath ---- */
    own(RecordingCard.wire(container, "bp-diff-natural", {
      classId, take: A(rec0(), "different").natural || null, maxSeconds: 10,
      meta: { name: "Breath — natural attempt", exercise: "breath-diff-natural" },
      onSaved: (take) => { set("different", "natural", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bp-diff-bigger", {
      classId, take: A(rec0(), "different").bigger || null, maxSeconds: 10,
      meta: { name: "Breath — bigger-breath attempt", exercise: "breath-diff-bigger" },
      onSaved: (take) => { set("different", "bigger", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- compare with baseline ---- */
    const baselineBtn = $("[data-play-baseline]");
    if (baselineBtn) baselineBtn.addEventListener("click", () => VoiceRecorder.play(baselineBtn.dataset.mediaid));
    own(RecordingCard.wire(container, "bp-compare-current", {
      classId, take: A(rec0(), "compare").current || null, maxSeconds: 10,
      meta: { name: "Breath — comparison with baseline", exercise: "breath-compare-current" },
      onSaved: (take) => { set("compare", "current", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- self-evaluation ---- */
    cleanups.push(ControlCheck.wire(container, "bp-eval", {
      onChange: (k, v) => { set("evaluate", k, v); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "bp-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment: phrase input, plan editor, two recordings ---- */
    const phraseInput = $("[data-assign-phrase]");
    let assignEditorCleanup = null;
    function mountAssignEditor() {
      const host = $("[data-assign-phrase-host]");
      if (!host) return;
      if (assignEditorCleanup) { assignEditorCleanup(); assignEditorCleanup = null; }
      const phrase = A(rec0(), "assignment").phrase || "";
      if (!phrase) { host.innerHTML = ""; return; }
      host.innerHTML = renderPhraseEditor("bp-assign-mark", phrase, A(rec0(), "assignment").marks || []);
      assignEditorCleanup = wirePhraseEditor(container, "bp-assign-mark", {
        multi: true, selected: A(rec0(), "assignment").marks || [],
        onChange: (marks) => set("assignment", "marks", marks),
      });
    }
    if (phraseInput) {
      phraseInput.addEventListener("input", Utils.debounce(() => {
        set("assignment", "phrase", phraseInput.value);
        mountAssignEditor();
      }, 400));
    }
    mountAssignEditor();
    cleanups.push(() => { if (assignEditorCleanup) assignEditorCleanup(); });
    own(RecordingCard.wire(container, "bp-assign-1", {
      classId, take: A(rec0(), "assignment").attempt1 || null, maxSeconds: 15,
      meta: { name: "Breath — assignment attempt 1", exercise: "breath-assignment-1" },
      onSaved: (take) => { set("assignment", "attempt1", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bp-assign-2", {
      classId, take: A(rec0(), "assignment").attempt2 || null, maxSeconds: 15,
      meta: { name: "Breath — assignment attempt 2 (planned)", exercise: "breath-assignment-2" },
      onSaved: (take) => { set("assignment", "attempt2", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- reflection, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => { set("reflection", ta.dataset.reflection, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-bp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(r[0]) ? r[0] : "Good singing breath isn't about taking the biggest breath — it's a comfortable breath, used naturally through the phrase.",
        struggled: r[2] || "",
        toPractice: r[5] || "",
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
