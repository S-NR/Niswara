/* ============================================================
   CLASS 7 — BASIC VOCAL WARM-UP (interactive lesson)

   Rendered by ClassDetailPage for interactive: "basic-vocal-warmup".

   Core idea: "Prepare the voice gently before asking it to do
   more." Not range, not volume, not endurance — just a short,
   comfortable routine. Nothing here is timed for maximum duration,
   scored for pitch accuracy, or framed as a workout.

   Flow: BREATHE → RELAX/HUM → GLIDE → VOWELS → PATTERN →
   ARTICULATE → COOL DOWN.

   Reuses: LessonKit, VirtualPiano + PianoSynth (Class 3),
   PitchMatchExercise + SelfAssessment (Class 4), RecordingCard +
   PersonalNotes (Class 5), BeatGuide + metronome (Class 6),
   ControlCheck-style chip pattern (Class 9). No new shared
   systems — the breathing-awareness visual is the one genuinely
   new (and tiny) piece, local to this file.
   ============================================================ */

const BasicVocalWarmupLesson = (() => {
  const STAGES = [
    { id: "prepare", label: "Prepare" },
    { id: "breathe", label: "Breathe" },
    { id: "hum", label: "Hum" },
    { id: "glide", label: "Glide" },
    { id: "vowels", label: "Vowels" },
    { id: "pattern", label: "Pattern" },
    { id: "articulate", label: "Articulate" },
    { id: "cooldown", label: "Cool-Down" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2; // whole step, same convention as Class 6/9 — small, singable intervals
  const BPM = 66;
  const PRACTICE_TASK = "warmup";
  const PRACTICE_CATEGORY = "Vocal Warm-Up";
  const ASSIGNMENT_MIN_SECONDS = 15;

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson" },
    { key: "breathingAwareness", label: "Breathing awareness completed" },
    { key: "humOrTrill", label: "Humming/lip trill completed" },
    { key: "pitchGlide", label: "Pitch glide completed" },
    { key: "vowelExercise", label: "Vowel exercise completed" },
    { key: "fiveNotePattern", label: "Five-note pattern completed" },
    { key: "articulation", label: "Articulation completed" },
    { key: "coolDown", label: "Cool-down completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const MA_SET = ["Ma", "Me", "Mi", "Mo"];
  const LA_SET = ["La", "Le", "Li", "Lo"];

  const SMOOTH_ASSESS = {
    question: "How did that feel?",
    options: [
      { value: "smooth", label: "Smooth", tone: "good" },
      { value: "mostly", label: "Mostly smooth", tone: "good" },
      { value: "difficult", label: "Difficult", tone: "maybe" },
      { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
    feedback: {
      smooth: "Lovely — easy and connected is exactly the goal.",
      mostly: "Good. A little roughness is completely normal while your voice wakes up.",
      difficult: "That's useful to notice. Try a smaller, quieter movement, or a different starting note — comfort first.",
      unsure: "No rush. Try it once more, gently, and just notice what happens.",
    },
  };

  const COMFORT_ASSESS = {
    question: "Does your voice feel more comfortable, about the same, or less comfortable after the warm-up?",
    options: [
      { value: "more", label: "More comfortable", tone: "good" },
      { value: "same", label: "About the same", tone: "neutral" },
      { value: "less", label: "Less comfortable", tone: "miss" },
    ],
  };

  const ASSIGNMENT_OBS = ["Which exercise felt easiest?", "Which exercise felt unfamiliar?", "Did my voice feel more comfortable, the same, or less comfortable after warming up?"];

  /* ---- Exercise configurations (PitchMatchExercise, Class 4 engine) ---- */
  const EX = {
    glide: {
      eyebrow: "Exercise 3 · Glide", title: "Gentle pitch glide",
      intro: "Play the reference, then glide gently: <strong class=\"text-ink-200\">low → slightly higher → back down</strong>. A small range is exactly right — this is about smooth movement, not vocal range.",
      flow: ["🎹 Hear", "🎤 Glide gently", "🎧 Listen back"],
      slots: [{ key: "take", label: "Your glide", hint: "A few comfortable seconds, low → a little higher → back down" }],
      assessment: SMOOTH_ASSESS,
      noEstimate: true,
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
    vowels: {
      eyebrow: "Exercise 4 · Vowels", title: "Easy vowels — AH, EE, OO",
      intro: "One comfortable note, three vowels. Keep the voice easy and relaxed — just notice how your mouth changes shape while the sound stays comfortable.",
      flow: ["🎹 Hear", "🎤 AH → EE → OO", "🎧 Listen back"],
      slots: [
        { key: "ah", label: "AH", hint: "A relaxed, open sound" },
        { key: "ee", label: "EE", hint: "Keep it easy, not bright or forced" },
        { key: "oo", label: "OO", hint: "Soft, rounded lips" },
      ],
      assessment: null,
      isComplete: (s) => ["ah", "ee", "oo"].every((k) => s.takes[k] && s.takes[k].mediaId),
    },
  };
  const EX_PATTERN = {
    eyebrow: "Exercise 5 · Pattern", title: "Simple five-note pattern",
    intro: "A short 1–2–3–4–5–4–3–2–1 pattern on a comfortable syllable — “ma”, “mee” or “noo”, whichever feels easiest. Listen first, then sing it back gently.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "take", label: "Your pattern", hint: "Sing along on “ma”, “mee” or “noo”" }],
    assessment: SMOOTH_ASSESS,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  /** Next/previous exercise link — reuses LessonKit.wireStepper's existing [data-stage-link] click handling, no new wiring needed. */
  const navLink = (stageId, label, dir = "next") => `
    <a href="#" data-stage-link="${stageId}" class="inline-flex items-center gap-1.5 text-sm text-gold-300 hover:text-gold-200">
      ${dir === "prev" ? `${icon("arrowRight", "w-3.5 h-3.5 rotate-180")} ${label}` : `${label} ${icon("arrowRight", "w-3.5 h-3.5")}`}
    </a>`;
  const exerciseNav = (prev, next) => `
    <div class="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
      ${prev ? navLink(prev.id, prev.label, "prev") : "<span></span>"}
      ${next ? navLink(next.id, `Next: ${next.label}`) : "<span></span>"}
    </div>`;

  /* ---------- derived state ---------- */
  function range(rec) {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[(A(rec, "setup").range) || c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range(rec);
    const n = A(rec, "setup").note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 4 * STEP ? n : r.from;
  }
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));
  const patternNotes = (b) => [0, 1, 2, 3, 4, 3, 2, 1, 0].map((i) => b + i * STEP);

  function assignmentDone(rec) {
    const a = A(rec, "assignment");
    return !!(a.take && a.take.seconds >= ASSIGNMENT_MIN_SECONDS)
      && [0, 1, 2, 3, 4].every((i) => (a.ticks || {})[i])
      && !!a.listened
      && ASSIGNMENT_OBS.every((_, i) => filled((a.obs || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (A(rec, "breathe").noticed) out.breathingAwareness = true;
    if ((A(rec, "hum").take && A(rec, "hum").take.mediaId) || (A(rec, "hum").recordedAt)) out.humOrTrill = true;
    if (exDone(rec, "glide", EX.glide)) out.pitchGlide = true;
    if (exDone(rec, "vowels", EX.vowels)) out.vowelExercise = true;
    if (exDone(rec, "pattern", EX_PATTERN)) out.fiveNotePattern = true;
    const art = A(rec, "articulate");
    if (art.run || (art.take && art.take.mediaId)) out.articulation = true;
    if (A(rec, "cooldown").comfort) out.coolDown = true;
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function progressionStrip() {
    const steps = ["BREATHE", "HUM/TRILL", "GLIDE", "VOWELS", "PATTERN", "ARTICULATE", "COOL DOWN"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    return [
      ["Breathing awareness", !!c.breathingAwareness],
      ["Humming or lip trill", !!c.humOrTrill],
      ["Pitch glide", !!c.pitchGlide],
      ["Vowel exercise", !!c.vowelExercise],
      ["Five-note pattern", !!c.fiveNotePattern],
      ["Articulation", !!c.articulation],
      ["Cool-down", !!c.coolDown],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You've learned how to gently prepare the voice.</p>
        <p class="text-sm text-ink-300 leading-relaxed">Next, we're going to focus on something even more important: learning how to release unnecessary tension.</p>
        ${next ? `<p class="text-sm text-ink-400 leading-relaxed mt-2">In <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, you'll learn that a relaxed voice is not a weak voice — relaxation lets the voice work more efficiently.</p>` : ""}
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">A warm-up is not about pushing my voice.</h3>
          <p class="text-sm text-ink-400 -mt-3 mb-5">It is about gently preparing it.</p>
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

  function routineNote(rec, key) {
    const short = A(rec, "setup").routineLength === "short";
    return short && (key === "vowels" || key === "articulate")
      ? `<p class="text-xs text-ink-500 mb-4">Optional for today's short routine — skip ahead if you're short on time.</p>`
      : "";
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const hum = A(rec, "hum");
    const artic = A(rec, "articulate");
    const cooldown = A(rec, "cooldown");
    const refl = A(rec, "reflection");
    const a = A(rec, "assignment");
    const routineLength = A(rec, "setup").routineLength || "standard";
    const articSet = artic.set === "la" ? LA_SET : MA_SET;

    const S = STAGES;
    const stageAt = (i) => S[i];

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("prepare", 1, "Prepare your voice gently before you sing", `
          ${p("Just as we might gently prepare the body before physical activity, singers use a few simple exercises to prepare the coordination between breath, voice, pitch, resonance and articulation. You've completed Classes 3–6 — now it's time for your first structured warm-up.")}
          <div class="grid sm:grid-cols-2 gap-4 my-5">
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">A warm-up should feel</p>
              <div class="flex flex-wrap gap-2">${["Easy", "Comfortable", "Controlled", "Gradual"].map((t) => `<span class="flow-chip !text-sm">${t}</span>`).join("")}</div>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">A warm-up should NOT feel</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Painful", "Strained", "Forced", "Exhausting"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
          </div>
          ${p("The routine has seven short parts:")}
          ${progressionStrip()}
        `)}

        ${chapter("prepare", 2, "A warm-up is preparation — not a workout", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“A warm-up is preparation — not a workout.”</p>
            <ul class="flex flex-col gap-1.5 text-sm text-ink-200">
              ${["Start gently", "Use comfortable pitches", "Keep the volume moderate", "Never force a high note", "Never force a low note", "Don't squeeze the throat", "Don't hold your breath", "Stop if your voice becomes uncomfortable"].map((t) => `<li class="flex gap-2"><span class="text-teal-300">●</span>${t}</li>`).join("")}
            </ul>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
            If you feel pain, significant dizziness, unusual breathlessness or persistent discomfort, <strong>stop the exercise</strong> and rest. Singing should never hurt.
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 3, "Choose today's routine", `
          ${narrow(p("Short or standard — either is a complete warm-up. You can change your mind any time."))}
          <div class="flex flex-wrap gap-2 mb-2" data-routine-length>
            <button type="button" data-routine="short" class="ex-chip ${routineLength === "short" ? "is-selected" : ""}">Short Warm-Up <span class="text-ink-500">~3 min</span></button>
            <button type="button" data-routine="standard" class="ex-chip ${routineLength === "standard" ? "is-selected" : ""}">Standard Warm-Up <span class="text-ink-500">~5–7 min</span></button>
          </div>
          <p class="text-xs text-ink-500 mb-6">The short routine makes vowels and articulation optional for today — nothing is locked.</p>
          <a href="#" data-stage-link="breathe" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Start Full Warm-Up ${icon("arrowRight", "w-4 h-4")}</a>
        `)}

        ${chapter("breathe", 4, "Exercise 1 — Relaxed breathing awareness", `
          ${narrow(`
            ${p("Breathe naturally — nothing to force. Notice your shoulders, jaw, neck, chest and abdomen as you breathe, then let the breath go gently.")}
            <div class="flex flex-col items-center gap-5 my-6">
              <div class="breathe-circle" data-breathe-circle></div>
              <p class="text-sm text-ink-400" data-breathe-hint>Press start, breathe naturally, and just notice.</p>
              <div class="flex gap-3">
                <button type="button" data-breathe-start class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} <span data-breathe-label>Start</span></button>
              </div>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-ink-300 text-center mb-5">Nothing to force.</div>
            <div class="text-center">
              <button type="button" data-breathe-noticed class="inline-flex items-center gap-2 px-6 py-3 rounded-full ${A(rec, "breathe").noticed ? "bg-emerald-500/15 text-emerald-300" : "bg-gold-500 text-ink-950 hover:bg-gold-400"} text-sm font-medium transition-colors">
                ${icon("check", "w-4 h-4")} ${A(rec, "breathe").noticed ? "Noticed — nicely done" : "I noticed how I'm breathing"}
              </button>
            </div>
          `)}
          ${exerciseNav(stageAt(0), stageAt(2))}
        `)}

        ${chapter("hum", 5, "Exercise 2 — Gentle lip trill or hum", `
          ${narrow(`
            ${p("Choose whichever feels easier today. A lip trill is a gentle vibrating movement of the lips while releasing a small amount of air; for humming, make a soft “mmm” without squeezing the throat.")}
            <div class="flex flex-wrap gap-2 mb-5" data-hum-choice>
              <button type="button" data-hum="trill" class="ex-chip ${hum.choice === "trill" ? "is-selected" : ""}">Lip trill</button>
              <button type="button" data-hum="hum" class="ex-chip ${hum.choice === "hum" ? "is-selected" : ""}">Humming</button>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-ink-300 mb-5">
              Short repetitions, with rest between: <span class="text-ink-100">mmm — rest — mmm — rest — mmm — rest.</span> There's no prize for holding it the longest.
            </div>
          `)}
          ${RecordingCard.render("wu-hum", { title: "Optional: record a few repetitions", hint: "Keep it short and gentle — this isn't about duration.", maxSeconds: 20, section: false })}
          ${exerciseNav(stageAt(1), stageAt(3))}
        `)}

        ${chapter("glide", 6, "Exercise 3 — Gentle pitch glide", `
          ${narrow(`
            ${p("Tap a key to choose a comfortable starting note.")}
            <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
              ${VirtualPiano.render("wu-piano", { controls: false, keyboard: true, display: true })}
            </div>
            <div class="flex flex-wrap items-center gap-4 mb-5 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
              <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Starting note</span>
              <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
            </div>
          `)}
          ${PitchMatchExercise.render("wu-glide", EX.glide)}
          ${exerciseNav(stageAt(2), stageAt(4))}
        `, { wide: true })}

        ${chapter("vowels", 7, "Exercise 4 — Easy vowels", `
          ${routineNote(rec, "vowels")}
          ${PitchMatchExercise.render("wu-vowels", EX.vowels)}
          ${exerciseNav(stageAt(3), stageAt(5))}
        `)}

        ${chapter("pattern", 8, "Exercise 5 — Simple five-note pattern", `
          ${PitchMatchExercise.render("wu-pattern", EX_PATTERN)}
          ${exerciseNav(stageAt(4), stageAt(6))}
        `)}

        ${chapter("articulate", 9, "Exercise 6 — Gentle articulation", `
          ${narrow(`
            ${p(`Connecting voice, mouth and rhythm — the same beat feel from Class 6. Choose a syllable set, start the guide, and speak or sing gently along: one syllable per beat.`)}
            <div class="flex flex-wrap gap-2 mb-5" data-artic-choice>
              <button type="button" data-artic="ma" class="ex-chip ${articSet === MA_SET ? "is-selected" : ""}">Ma · Me · Mi · Mo</button>
              <button type="button" data-artic="la" class="ex-chip ${articSet === LA_SET ? "is-selected" : ""}">La · Le · Li · Lo</button>
            </div>
          `)}
          ${routineNote(rec, "articulate")}
          <div data-artic-guide-host></div>
          <div class="mt-4">${RecordingCard.render("wu-artic", { title: "Optional: record yourself", hint: "Start the guide, then record along with it.", maxSeconds: 20, section: false })}</div>
          ${exerciseNav(stageAt(5), stageAt(7))}
        `)}

        ${chapter("cooldown", 10, "Exercise 7 — Cool-down", `
          ${narrow(`
            ${p("End gently: a little soft humming, or a gentle “mmm” — then stop. You don't need to finish a warm-up feeling tired.")}
          `)}
          ${RecordingCard.render("wu-cooldown", { title: "Optional: a final gentle hum", hint: "Soft and short, then rest.", maxSeconds: 15, section: false })}
          <div class="mt-5">${SelfAssessment.render("wu-comfort", { question: COMFORT_ASSESS.question, options: COMFORT_ASSESS.options, selected: cooldown.comfort || null })}</div>
          <div data-comfort-warning>${cooldown.comfort === "less" ? comfortWarning() : ""}</div>
          ${exerciseNav(stageAt(6), stageAt(8))}
        `)}

        ${chapter("practice", 11, "Practice timer — Vocal Warm-Up", `
          ${p("Repeat any part of the routine you like while the timer runs. Then log the session — it's saved to your account as <strong class=\"text-ink-100\">Vocal Warm-Up</strong>.")}
          ${Timer.render("wu-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 12, `Class ${cls.number} Assignment`, `
          ${p("Complete the short warm-up routine, then record one short take covering all five parts. The guide below walks you through them at a gentle tempo — start it, then press Record. Use your comfortable starting note from Exercise 3.")}
          <ol class="flex flex-col gap-1 mb-4">
            ${cls.content.assignment.instructions.map((t, i) => `
              <li><label class="flex items-start gap-3 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/[0.03]">
                <input type="checkbox" data-assign-tick="${i}" ${(a.ticks || {})[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                <span class="text-sm text-ink-200"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${t}</span>
              </label></li>`).join("")}
          </ol>
          <div data-assign-guide-host></div>
          <div class="mt-4">${RecordingCard.render("rc-assign", { title: "My Class " + cls.number + " recording", hint: "Then listen back from start to finish.", maxSeconds: 60, section: false })}</div>
          <p class="text-xs mt-2 ${a.listened ? "text-emerald-300" : "text-ink-500"}" data-assign-listened>${a.listened ? "✓ Listened back" : "Listen back to the whole recording (press Play and let it finish)."}</p>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Three observations</h4>
            <p class="text-xs text-ink-500 mb-4">This is about awareness and consistency — not the highest note, loudest voice or longest duration.</p>
            <div class="flex flex-col gap-4">
              ${ASSIGNMENT_OBS.map((q, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="wu-obs-${i}">${i + 1}. ${q}</label>
                  <textarea id="wu-obs-${i}" data-assign-obs="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.obs || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("reflect", 13, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="wu-refl-${i}">${q}</label>
                <textarea id="wu-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 14, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-wu", { placeholder: "e.g. Humming felt easy. Lip trill was difficult. My jaw became tense. AH felt more comfortable than EE." })}
        `)}

        ${chapter("complete", 15, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 16, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function comfortWarning() {
    return `<div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200 mt-3">Stop here and allow your voice to rest. Do not push through discomfort.</div>`;
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
      if (l) { l.textContent = a.listened ? "✓ Listened back" : "Listen back to the whole recording (press Play and let it finish)."; l.className = `text-xs mt-2 ${a.listened ? "text-emerald-300" : "text-ink-500"}`; }
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- routine length choice ---- */
    function onRoutineClick(e) {
      const btn = e.target.closest("[data-routine]");
      if (!btn) return;
      set("setup", "routineLength", btn.dataset.routine);
      container.querySelectorAll("[data-routine]").forEach((b) => b.classList.toggle("is-selected", b === btn));
    }
    container.addEventListener("click", onRoutineClick);
    cleanups.push(() => container.removeEventListener("click", onRoutineClick));

    /* ---- breathing awareness (not scored) ---- */
    let breathing = false;
    const breatheCircle = $("[data-breathe-circle]");
    const breatheHint = $("[data-breathe-hint]");
    const breatheLabel = $("[data-breathe-label]");
    function onBreatheClick(e) {
      if (e.target.closest("[data-breathe-start]")) {
        breathing = !breathing;
        breatheCircle.classList.toggle("is-running", breathing);
        breatheLabel.textContent = breathing ? "Pause" : "Start";
        breatheHint.textContent = breathing ? "Breathe naturally, at your own pace. Nothing to force." : "Press start, breathe naturally, and just notice.";
        return;
      }
      if (e.target.closest("[data-breathe-noticed]")) {
        set("breathe", "noticed", true);
        ClassActivity.markCheckpoint(classId, "breathingAwareness", true);
        const btn = $("[data-breathe-noticed]");
        btn.innerHTML = `${icon("check", "w-4 h-4")} Noticed — nicely done`;
        btn.className = "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/15 text-emerald-300 text-sm font-medium transition-colors";
      }
    }
    container.addEventListener("click", onBreatheClick);
    cleanups.push(() => container.removeEventListener("click", onBreatheClick));

    /* ---- hum / lip trill choice + recording ---- */
    function onHumClick(e) {
      const btn = e.target.closest("[data-hum]");
      if (!btn) return;
      set("hum", "choice", btn.dataset.hum);
      container.querySelectorAll("[data-hum]").forEach((b) => b.classList.toggle("is-selected", b === btn));
    }
    container.addEventListener("click", onHumClick);
    cleanups.push(() => container.removeEventListener("click", onHumClick));
    own(RecordingCard.wire(container, "wu-hum", {
      classId, take: A(rec0(), "hum").take || null, maxSeconds: 20,
      meta: { name: "Warm-up — humming / lip trill", exercise: "warmup-hum" },
      onSaved: (take) => { set("hum", "take", take); set("hum", "recordedAt", take.at); ClassActivity.bump(classId, "recordings"); },
    }));

    /* ---- starting note (transposes glide, vowels, pattern) ---- */
    const controllers = {};
    const r0 = range(rec0());
    own(VirtualPiano.wire(container, "wu-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > r0.to - 4 * STEP) { // keep the five-note pattern inside the comfortable range
          return;
        }
        set("setup", "note", midi);
        const note = $("[data-base-note]");
        if (note) note.textContent = N(midi);
        Object.values(controllers).forEach((c) => c.refresh());
        mountArticGuide();
      },
    }));

    /* ---- glide, vowels, pattern (PitchMatchExercise engine) ---- */
    controllers.glide = own(PitchMatchExercise.wire(container, "wu-glide", EX.glide, {
      classId, exerciseId: "glide",
      state: (rec0().answers.exercises || {}).glide || {},
      getNotes: () => [base()],
      isComplete: EX.glide.isComplete,
      onState: (s) => set("exercises", "glide", s),
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    controllers.vowels = own(PitchMatchExercise.wire(container, "wu-vowels", EX.vowels, {
      classId, exerciseId: "vowels",
      state: (rec0().answers.exercises || {}).vowels || {},
      getNotes: () => [base()],
      isComplete: EX.vowels.isComplete,
      onState: (s) => set("exercises", "vowels", s),
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    controllers.pattern = own(PitchMatchExercise.wire(container, "wu-pattern", EX_PATTERN, {
      classId, exerciseId: "pattern",
      state: (rec0().answers.exercises || {}).pattern || {},
      getNotes: () => patternNotes(base()),
      isComplete: EX_PATTERN.isComplete,
      onState: (s) => set("exercises", "pattern", s),
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- articulation: syllable choice + BeatGuide + optional recording ---- */
    function onArticClick(e) {
      const btn = e.target.closest("[data-artic]");
      if (!btn) return;
      set("articulate", "set", btn.dataset.artic);
      container.querySelectorAll("[data-artic]").forEach((b) => b.classList.toggle("is-selected", b === btn));
      mountArticGuide();
    }
    container.addEventListener("click", onArticClick);
    cleanups.push(() => container.removeEventListener("click", onArticClick));
    let articGuide = null;
    function articBars() {
      const set4 = (A(rec0(), "articulate").set === "la") ? LA_SET : MA_SET;
      return [set4.map((t) => ({ t, note: true }))];
    }
    function mountArticGuide() {
      if (articGuide) articGuide.destroy();
      const host = $("[data-artic-guide-host]");
      if (!host) return;
      host.innerHTML = BeatGuide.render("bg-artic", { bars: articBars(), guideToggle: true });
      articGuide = BeatGuide.wire(container, "bg-artic", { bpm: BPM, loops: 2, bars: articBars(), getNote: base, onComplete: () => set("articulate", "run", true) });
    }
    mountArticGuide();
    cleanups.push(() => { if (articGuide) articGuide.destroy(); });
    own(RecordingCard.wire(container, "wu-artic", {
      classId, take: A(rec0(), "articulate").take || null, maxSeconds: 20,
      meta: { name: "Warm-up — articulation", exercise: "warmup-articulation" },
      onSaved: (take) => { set("articulate", "take", take); ClassActivity.bump(classId, "recordings"); },
    }));

    /* ---- cool-down: optional recording + comfort check ---- */
    own(RecordingCard.wire(container, "wu-cooldown", {
      classId, take: A(rec0(), "cooldown").take || null, maxSeconds: 15,
      meta: { name: "Warm-up — cool-down hum", exercise: "warmup-cooldown" },
      onSaved: (take) => { set("cooldown", "take", take); ClassActivity.bump(classId, "recordings"); },
    }));
    function onComfortAssess(e) {
      const chip = e.target.closest('[data-assess="wu-comfort"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      const v = chip.dataset.assessChoice;
      set("cooldown", "comfort", v);
      ClassActivity.markCheckpoint(classId, "coolDown", true);
      const warn = $("[data-comfort-warning]");
      if (warn) warn.innerHTML = v === "less" ? comfortWarning() : "";
    }
    container.addEventListener("click", onComfortAssess);
    cleanups.push(() => container.removeEventListener("click", onComfortAssess));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "wu-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment ---- */
    let assignGuide = null;
    function assignmentBars() {
      const b = base();
      const set4 = (A(rec0(), "articulate").set === "la") ? LA_SET : MA_SET;
      return [
        [{ t: "mmm", note: true, beats: 4 }, { t: "…" }, { t: "…" }, { t: "…" }],
        [{ t: "glide", note: true }, { t: "up" }, { t: "down" }, { t: "" }],
        [{ t: "AH", note: true }, { t: "EE", note: true }, { t: "OO", note: true }, { t: "" }],
        [{ t: N(b), midi: b }, { t: N(b + STEP), midi: b + STEP }, { t: N(b + 2 * STEP), midi: b + 2 * STEP }, { t: N(b + STEP), midi: b + STEP }],
        set4.map((t) => ({ t, note: true })),
      ];
    }
    function mountAssignGuide() {
      if (assignGuide) assignGuide.destroy();
      const host = $("[data-assign-guide-host]");
      if (!host) return;
      const bars = assignmentBars();
      host.innerHTML = BeatGuide.render("bg-assign", { bars, guideToggle: true });
      assignGuide = BeatGuide.wire(container, "bg-assign", { bpm: BPM, loops: 1, bars, getNote: base });
    }
    mountAssignGuide();
    cleanups.push(() => { if (assignGuide) assignGuide.destroy(); });
    own(RecordingCard.wire(container, "rc-assign", {
      classId, take: A(rec0(), "assignment").take || null, maxSeconds: 60,
      meta: { name: `Class ${cls.number} assignment`, exercise: "warmup-assignment" },
      onSaved: (take) => {
        set("assignment", "take", take);
        set("assignment", "listened", false);
        ClassActivity.bump(classId, "recordings");
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

    /* ---- reflection, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-wu", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(r[0]) ? r[0] : "A warm-up is not about pushing my voice — it's about gently preparing it.",
        struggled: (A(rec, "assignment").obs || {})[1] || "",
        toPractice: r[5] || "",
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
