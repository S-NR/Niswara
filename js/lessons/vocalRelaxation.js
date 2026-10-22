/* ============================================================
   CLASS 8 — VOCAL RELAXATION (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vocal-relaxation".

   Core idea: "Release unnecessary tension so the voice can work
   naturally." Relaxation here means awareness, not force — the
   pattern throughout is Notice → Release → Sing → Notice again.
   Nothing is scored, nothing is diagnosed, and "Not sure" is
   always a valid answer. Relaxed does not mean collapsed: the
   posture chapter is explicit about that.

   Flow: body check → shoulders/jaw/tongue awareness → hum →
   relaxed vowels → sing before/after release → a short pattern
   sung while noticing, not stopping → a tension map → posture →
   a spoken/sung phrase → compare recordings → practice → reflect.

   Reuses: LessonKit, VirtualPiano/PianoSynth (Class 3),
   PitchMatchExercise + SelfAssessment (Class 4), RecordingCard +
   ObservationChecklist (Class 5), the base-note inheritance chain
   (Class 7), RecordingComparison + ControlCheck (Class 9) —
   ControlCheck now takes an optional custom `levels` param (was
   hardcoded to Class 9's Comfortable/Developing/Needs practice)
   so Class 8 can reuse the exact same chip-row component with its
   own tension wording instead of building a near-duplicate. No
   other new shared systems; the "notice and acknowledge" button
   used for shoulders/jaw/tongue is local to this file, the same
   way Class 7's breathing circle was.
   ============================================================ */

const VocalRelaxationLesson = (() => {
  const STAGES = [
    { id: "intro", label: "Intro" },
    { id: "check", label: "Body Check" },
    { id: "release", label: "Release" },
    { id: "hum", label: "Hum" },
    { id: "vowels", label: "Vowels" },
    { id: "beforeafter", label: "Before/After" },
    { id: "tension", label: "Tension Check" },
    { id: "posture", label: "Posture" },
    { id: "compare", label: "Compare" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2;
  const PRACTICE_TASK = "relaxation";
  const PRACTICE_CATEGORY = "Vocal Relaxation";
  const ASSIGNMENT_MIN_SECONDS = 10;

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson" },
    { key: "bodyAwareness", label: "Body awareness completed" },
    { key: "shoulderRelease", label: "Shoulder release completed" },
    { key: "jawAwareness", label: "Jaw awareness completed" },
    { key: "tongueAwareness", label: "Tongue awareness completed" },
    { key: "humming", label: "Humming completed" },
    { key: "relaxedVowels", label: "Relaxed vowels completed" },
    { key: "beforeAfter", label: "Before/after recording completed" },
    { key: "tensionCheck", label: "Tension check completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const BODY_CHECK_ROWS = [
    { key: "face", area: "Face", question: "Is my face relaxed?" },
    { key: "jaw", area: "Jaw", question: "Am I clenching?" },
    { key: "tongue", area: "Tongue", question: "Is my tongue resting comfortably?" },
    { key: "shoulders", area: "Shoulders", question: "Are my shoulders unnecessarily raised?" },
    { key: "neck", area: "Neck", question: "Does my neck feel comfortable?" },
    { key: "breathing", area: "Breathing", question: "Am I holding my breath?" },
    { key: "throat", area: "Throat", question: "Does my throat feel comfortable?" },
  ];
  const BODY_CHECK_LEVELS = [
    { value: "comfortable", mark: "●", label: "Comfortable" },
    { value: "slight", mark: "△", label: "Slight tension" },
    { value: "noticeable", mark: "○", label: "Noticeable tension" },
    { value: "unsure", mark: "?", label: "Not sure" },
  ];

  const TENSION_MAP_ROWS = [
    { key: "face", area: "Face", question: "" }, { key: "jaw", area: "Jaw", question: "" },
    { key: "tongue", area: "Tongue", question: "" }, { key: "neck", area: "Neck", question: "" },
    { key: "shoulders", area: "Shoulders", question: "" }, { key: "chest", area: "Chest", question: "" },
    { key: "throat", area: "Throat", question: "" },
  ];
  const TENSION_MAP_LEVELS = [
    { value: "comfortable", mark: "🙂", label: "Comfortable" },
    { value: "some", mark: "😐", label: "Some tension" },
    { value: "alot", mark: "😣", label: "A lot of tension" },
    { value: "unsure", mark: "?", label: "Not sure" },
  ];

  const EASE_ASSESS = {
    question: "How did that feel?",
    options: [
      { value: "comfortable", label: "Comfortable", tone: "good" },
      { value: "some", label: "Some tension", tone: "maybe" },
      { value: "unsure", label: "Not sure", tone: "neutral" },
    ],
    feedback: {
      comfortable: "Lovely — easy and comfortable is exactly what we're after.",
      some: "Good to notice. No need to fix it right now — just noticing is the skill.",
      unsure: "That's fine. Awareness grows the more you check in like this.",
    },
  };

  const BEFOREAFTER_ASSESS = {
    question: "Did anything feel different the second time?",
    options: [
      { value: "comfortable", label: "More comfortable", tone: "good" },
      { value: "effort", label: "Less effort", tone: "good" },
      { value: "same", label: "Same", tone: "neutral" },
      { value: "unsure", label: "Not sure", tone: "neutral" },
      { value: "uncomfortable", label: "More uncomfortable", tone: "maybe" },
    ],
  };

  const ASSIGNMENT_OBS = [
    "Did I notice any tension?", "Where did I notice it?", "Did anything feel easier after the relaxation routine?",
    "Did my voice sound different?", "Did my pitch change?", "Did I notice any unnecessary effort?",
    "What is one thing I want to remember next time I sing?",
  ];

  const EX_VOWELS = {
    eyebrow: "Exercise 5 · Vowels", title: "Relaxed vowels — AH, EE, OO",
    intro: "One comfortable note, gentle vowels. First forward, then in reverse. Notice — don't correct — whatever you feel.",
    slots: [
      { key: "forward", label: "AH → EE → OO", hint: "Gentle, one breath, comfortable volume" },
      { key: "reverse", label: "OO → EE → AH", hint: "The same, the other way round" },
    ],
    assessment: null,
    isComplete: (s) => ["forward", "reverse"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };

  const EX_TENSION = {
    eyebrow: "Exercise 7 · Tension Check", title: "A short comfortable pattern",
    intro: "Listen, then sing the pattern gently. Don't pause mid-phrase to check anything — just sing, then notice afterward.",
    flow: ["🎹 Hear", "🎤 Sing it through", "🎧 Listen back"],
    slots: [{ key: "take", label: "Your pattern", hint: "A few comfortable seconds" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited from Class 4, same chain Class 7/9 use) ---------- */
  function range(rec) {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range(rec);
    const n = (ClassActivity.get("L1C07").answers.setup || {}).note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));

  function bodyCheckDone(rec) {
    const check = A(rec, "bodyCheck");
    return BODY_CHECK_ROWS.every((r) => !!check[r.key]);
  }
  function assignmentDone(rec) {
    const before = A(rec, "beforeafter").before, after = A(rec, "beforeafter").after;
    return !!(before && before.seconds >= ASSIGNMENT_MIN_SECONDS) && !!(after && after.seconds >= ASSIGNMENT_MIN_SECONDS)
      && ASSIGNMENT_OBS.every((_, i) => filled((A(rec, "assignment").obs || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (bodyCheckDone(rec)) out.bodyAwareness = true;
    if (A(rec, "release").shoulders) out.shoulderRelease = true;
    if (A(rec, "release").jaw) out.jawAwareness = true;
    if (A(rec, "release").tongue) out.tongueAwareness = true;
    const hum = A(rec, "hum");
    if (hum.take && hum.take.mediaId) out.humming = true;
    if (exDone(rec, "vowels", EX_VOWELS)) out.relaxedVowels = true;
    const ba = A(rec, "beforeafter");
    if (ba.before && ba.after && ba.assess) out.beforeAfter = true;
    const tension = A(rec, "tension");
    if (tension.take && tension.take.mediaId) out.tensionCheck = true;
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function progressionStrip() {
    const steps = ["NOTICE TENSION", "RELEASE", "SING", "OBSERVE", "COMPARE", "REFLECT"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    return [
      ["Body awareness", !!c.bodyAwareness],
      ["Shoulder release", !!c.shoulderRelease],
      ["Jaw awareness", !!c.jawAwareness],
      ["Tongue awareness", !!c.tongueAwareness],
      ["Humming", !!c.humming],
      ["Relaxed vowels", !!c.relaxedVowels],
      ["Before/after recording", !!c.beforeAfter],
      ["Tension check", !!c.tensionCheck],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You've learned to notice unnecessary tension.</p>
        <p class="text-sm text-ink-300 leading-relaxed">Now we're ready to combine what you've learned so far and begin developing basic vocal control.</p>
        ${next ? `<p class="text-sm text-ink-400 leading-relaxed mt-2">In <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, you'll build on pitch, rhythm, warm-up and relaxation to start controlling onset, pitch stability, volume, note duration and simple transitions.</p>` : ""}
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">I don't need to force my voice to sing.</h3>
          <p class="text-sm text-ink-400 -mt-3 mb-5">I can notice unnecessary tension and allow my voice to work more comfortably.</p>
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

  /** The small "read, do it, press done" pattern used for shoulders/jaw/tongue — local to this file, same shape as Class 7's breathing circle. */
  function awarenessStep(key, instructions, doneLabel) {
    return `
      <ol class="flex flex-col gap-1 mb-5">
        ${instructions.map((t, i) => `<li class="flex gap-3 text-sm text-ink-300 leading-relaxed"><span class="w-6 h-6 rounded-full bg-white/5 text-ink-400 text-xs flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span><span>${t}</span></li>`).join("")}
      </ol>
      <div class="text-center">
        <button type="button" data-awareness="${key}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">
          ${icon("check", "w-4 h-4")} <span data-awareness-label="${key}">${doneLabel}</span>
        </button>
      </div>`;
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const ba = A(rec, "beforeafter");
    const tension = A(rec, "tension");
    const refl = A(rec, "reflection");
    const a = A(rec, "assignment");
    const release = A(rec, "release");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("intro", 1, "Release unnecessary tension so your voice can work naturally", `
          ${p("Singing doesn't need the whole body to work hard. Many beginners unintentionally create tension in the jaw, tongue, neck, shoulders, face and throat — without meaning to.")}
          ${p("The goal here is <strong class=\"text-ink-100\">not</strong> to make every part of your body completely loose. The goal is to notice unnecessary tension and learn to release it.")}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-ink-300">
            Important: relaxation does <strong class="text-ink-100">not</strong> mean becoming weak or collapsing your posture.
          </div>
        `)}

        ${chapter("intro", 2, "Relaxation is awareness, not force", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Relaxation is awareness, not force.”</p>
            <p class="text-sm text-ink-200 mb-3">Don't try to physically force a muscle to relax. Instead:</p>
            ${progressionStrip()}
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
            If you feel pain, significant dizziness, unusual breathlessness or persistent throat discomfort, <strong>stop the exercise</strong> and rest. You should stay comfortable throughout.
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("check", 3, "Before-singing body check", `
          ${narrow(p("Before you sing, a quick honest check. Nothing here is a diagnosis — just your own observation."))}
          ${ControlCheck.render("vr-check-before", BODY_CHECK_ROWS, A(rec, "bodyCheck"), BODY_CHECK_LEVELS)}
        `)}

        ${chapter("release", 4, "Exercise 1 — Shoulder release", `
          ${narrow(`
            ${p("This is not a singing exercise — it's simply a way to notice the difference between tension and release.")}
            ${awarenessStep("shoulders", [
              "Sit or stand comfortably.",
              "Gently raise your shoulders.",
              "Hold briefly.",
              "Release them naturally.",
              "Repeat a small number of times, then let your shoulders stay comfortable.",
            ], release.shoulders ? "Noticed — nicely done" : "I noticed the difference")}
          `)}
        `)}

        ${chapter("release", 5, "Exercise 2 — Jaw awareness", `
          ${narrow(`
            ${p("Just noticing whether the jaw is doing unnecessary work — nothing to massage or force.")}
            ${awarenessStep("jaw", [
              "Place your fingertips gently near your jaw hinge.",
              "Open your mouth comfortably, then close it. Repeat slowly a few times.",
              "Say “AH” without forcing the mouth open.",
              "Notice whether your jaw is doing more work than it needs to.",
            ], release.jaw ? "Noticed — nicely done" : "I noticed how my jaw feels")}
          `)}
        `)}

        ${chapter("release", 6, "Exercise 3 — Tongue awareness", `
          ${narrow(`
            ${p("The tongue is involved in speech and singing, but it doesn't need to become rigid. This is awareness only — no pushing it forward or holding it down.")}
            ${awarenessStep("tongue", [
              "Say slowly: LA · LE · LI · LO · LU.",
              "Notice whether your tongue feels free or tense as you do.",
            ], release.tongue ? "Noticed — nicely done" : "I noticed how my tongue feels")}
          `)}
        `)}

        ${chapter("hum", 7, "Exercise 4 — Gentle hum", `
          ${narrow(p("The same gentle humming from Class 7 — a soft “mmm” at a comfortable pitch."))}
          ${RecordingCard.render("vr-hum", { title: "Hum gently", hint: "Short and easy — no need to search for an exaggerated vibration.", maxSeconds: 20, section: false })}
          <div class="mt-4">${SelfAssessment.render("vr-hum-assess", { question: EASE_ASSESS.question, options: EASE_ASSESS.options, selected: A(rec, "hum").assess || null })}</div>
          <p class="text-xs text-ink-400 mt-2" data-hum-feedback></p>
        `)}

        ${chapter("vowels", 8, "Exercise 5 — Relaxed vowels", `
          ${PitchMatchExercise.render("vr-vowels", EX_VOWELS)}
        `)}

        ${chapter("beforeafter", 9, "Exercise 6 — Sing after release", `
          ${narrow(p("A simple before/after comparison. Sing a comfortable note normally first — don't consciously try to relax anything yet."))}
          ${RecordingCard.render("vr-before", { title: "Before — sing a comfortable note normally", hint: "Just as you'd normally sing it.", maxSeconds: 15, section: false })}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-ink-300 my-5">
            Now complete the relaxation exercises above (shoulders, jaw, tongue, hum) if you haven't already — then come back and sing the same note again.
          </div>
          ${RecordingCard.render("vr-after", { title: "After — sing the same note again", hint: "Same note, after releasing tension.", maxSeconds: 15, section: false })}
          <div class="mt-5">${SelfAssessment.render("vr-ba-assess", { question: BEFOREAFTER_ASSESS.question, options: BEFOREAFTER_ASSESS.options, selected: ba.assess || null })}</div>
          <p class="text-xs text-ink-500 mt-2">There's no right answer — the second recording isn't automatically better. This is self-observation.</p>
        `)}

        ${chapter("tension", 10, "Exercise 7 — Tension check while singing", `
          ${narrow(p("A short, comfortable three-note pattern. Sing it through without stopping to check each body part — then finish and reflect."))}
          ${PitchMatchExercise.render("vr-tension", EX_TENSION)}
          ${ObservationChecklist.render("vr-tension-obs", [{ key: "noticed", title: "What did you notice?", prompt: "Sing → finish → reflect. Select anything that felt tense, or none at all.", options: ["Jaw", "Shoulders", "Neck", "Tongue", "Breath", "Nothing in particular"] }], { noticed: tension.noticed || [] })}
        `)}

        ${chapter("tension", 11, "Your tension map", `
          ${narrow(p("The same check as before, now that you've sung a little. Not a medical finding — just your own observations."))}
          ${ControlCheck.render("vr-check-after", TENSION_MAP_ROWS, A(rec, "tensionMap"), TENSION_MAP_LEVELS)}
        `)}

        ${chapter("posture", 12, "Relaxation vs. posture", `
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Relaxation does NOT mean</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Slouching", "Collapsing the chest", "Dropping the head", "Losing balance"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">Instead</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-200">
                ${["Comfortable alignment", "Easy breathing", "Unnecessary tension released"].map((t) => `<li class="flex gap-2"><span class="text-teal-300">●</span>${t}</li>`).join("")}
              </ul>
            </div>
          </div>
          ${p("Think balanced, not rigid.")}
        `)}

        ${chapter("posture", 13, "Relaxation during singing", `
          ${narrow(p("A short phrase: <strong class=\"text-ink-100\">“I am learning to sing.”</strong> Speak it normally, then sing it gently, and just notice any unnecessary tension."))}
          ${RecordingCard.render("vr-speak", { title: "Speak it normally", hint: "“I am learning to sing.”", maxSeconds: 10, section: false })}
          <div class="mt-4">${RecordingCard.render("vr-sing", { title: "Now sing it gently", hint: "Same phrase, sung comfortably.", maxSeconds: 10, section: false })}</div>
          <p class="text-xs text-ink-500 mt-3">Repeat it a few times if you like, staying comfortable throughout. Nothing to manipulate in the throat.</p>
        `)}

        ${chapter("compare", 14, "Compare your recordings", `
          ${p("Pick any two of your takes from this class and listen to each.")}
          ${RecordingComparison.render("vr-compare")}
        `)}

        ${chapter("practice", 15, "Practice timer — Vocal Relaxation", `
          ${p("Repeat any part of this routine while the timer runs. Then log the session — it's saved to your account as <strong class=\"text-ink-100\">Vocal Relaxation</strong>.")}
          ${Timer.render("vr-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 16, `Class ${cls.number} Assignment`, `
          ${p("Record two short versions of the same comfortable singing exercise — one before and one after the relaxation routine. These are the same two recordings from Exercise 6 above, so if you've already made them, they're ticked off here too.")}
          <ol class="flex flex-col gap-1 mb-4">
            ${cls.content.assignment.instructions.map((t, i) => {
              const auto = i === 0 || i === 2;
              const ok = i === 0 ? !!(ba.before && ba.before.mediaId) : i === 2 ? !!(ba.after && ba.after.mediaId) : !!(release.shoulders && release.jaw && release.tongue);
              return `<li><label class="flex items-start gap-3 rounded-xl px-3 py-2 ${auto ? "" : "cursor-pointer hover:bg-white/[0.03]"}">
                <input type="checkbox" ${auto ? "disabled" : `data-assign-tick="${i}"`} ${ok || (a.ticks || {})[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                <span class="text-sm ${ok ? "text-ink-400" : "text-ink-200"}"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${t}</span>
                ${auto ? `<span class="ml-auto text-[10px] uppercase tracking-wider text-ink-600 shrink-0 mt-0.5">${ok ? "done" : "auto"}</span>` : ""}
              </label></li>`;
            }).join("")}
          </ol>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-2">
            <h4 class="font-display text-lg text-ink-50 mb-3">Compare both recordings</h4>
            <p class="text-xs text-ink-500 mb-4">“Not sure” is a completely valid answer to any of these.</p>
            <div class="flex flex-col gap-4">
              ${ASSIGNMENT_OBS.map((q, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="vr-obs-${i}">${i + 1}. ${q}</label>
                  <textarea id="vr-obs-${i}" data-assign-obs="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.obs || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("reflect", 17, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="vr-refl-${i}">${q}</label>
                <textarea id="vr-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 18, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vr", { placeholder: "e.g. My jaw tightens when I sing. My shoulders rise when I breathe. Humming feels comfortable." })}
        `)}

        ${chapter("complete", 19, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 20, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- live progress ---- */
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

    /* ---- before-singing body check ---- */
    cleanups.push(ControlCheck.wire(container, "vr-check-before", {
      onChange: (k, v) => { set("bodyCheck", k, v); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- shoulders / jaw / tongue awareness ---- */
    function onAwarenessClick(e) {
      const btn = e.target.closest("[data-awareness]");
      if (!btn) return;
      const key = btn.dataset.awareness;
      set("release", key, true);
      ClassActivity.markCheckpoint(classId, { shoulders: "shoulderRelease", jaw: "jawAwareness", tongue: "tongueAwareness" }[key], true);
      btn.innerHTML = `${icon("check", "w-4 h-4")} Noticed — nicely done`;
      btn.className = "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/15 text-emerald-300 text-sm font-medium transition-colors";
    }
    container.addEventListener("click", onAwarenessClick);
    cleanups.push(() => container.removeEventListener("click", onAwarenessClick));

    /* ---- hum ---- */
    own(RecordingCard.wire(container, "vr-hum", {
      classId, take: A(rec0(), "hum").take || null, maxSeconds: 20,
      meta: { name: "Relaxation — gentle hum", exercise: "relaxation-hum" },
      onSaved: (take) => { set("hum", "take", take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));
    function onHumAssess(e) {
      const chip = e.target.closest('[data-assess="vr-hum-assess"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      const v = chip.dataset.assessChoice;
      set("hum", "assess", v);
      $("[data-hum-feedback]").textContent = EASE_ASSESS.feedback[v] || "";
      ClassActivity.bump(classId, "selfEvaluations");
    }
    container.addEventListener("click", onHumAssess);
    cleanups.push(() => container.removeEventListener("click", onHumAssess));

    /* ---- vowels (PitchMatchExercise, base note inherited silently) ---- */
    own(PitchMatchExercise.wire(container, "vr-vowels", EX_VOWELS, {
      classId, exerciseId: "vowels",
      state: (rec0().answers.exercises || {}).vowels || {},
      getNotes: () => [base()],
      isComplete: EX_VOWELS.isComplete,
      onState: (s) => set("exercises", "vowels", s),
      onRecorded: () => { ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));

    /* ---- before / after ---- */
    own(RecordingCard.wire(container, "vr-before", {
      classId, take: A(rec0(), "beforeafter").before || null, maxSeconds: 15,
      meta: { name: "Relaxation — before", exercise: "relaxation-before" },
      onSaved: (take) => { set("beforeafter", "before", take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));
    own(RecordingCard.wire(container, "vr-after", {
      classId, take: A(rec0(), "beforeafter").after || null, maxSeconds: 15,
      meta: { name: "Relaxation — after", exercise: "relaxation-after" },
      onSaved: (take) => { set("beforeafter", "after", take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));
    function onBaAssess(e) {
      const chip = e.target.closest('[data-assess="vr-ba-assess"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("beforeafter", "assess", chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
      syncCheckpoints();
      refreshLive();
    }
    container.addEventListener("click", onBaAssess);
    cleanups.push(() => container.removeEventListener("click", onBaAssess));

    /* ---- tension check: short pattern + observation checklist ---- */
    own(PitchMatchExercise.wire(container, "vr-tension", EX_TENSION, {
      classId, exerciseId: "tension",
      state: (rec0().answers.exercises || {}).tension || {},
      getNotes: () => [base(), base() + STEP, base()],
      isComplete: EX_TENSION.isComplete,
      onState: (s) => { set("exercises", "tension", s); set("tension", "take", s.takes.take || null); },
      onRecorded: () => { ClassActivity.bump(classId, "recordings"); compare.refresh(); syncCheckpoints(); refreshLive(); },
    }));
    cleanups.push(ObservationChecklist.wire(container, "vr-tension-obs", {
      selected: { noticed: A(rec0(), "tension").noticed || [] },
      onChange: (_, values) => { set("tension", "noticed", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- tension map (after) ---- */
    cleanups.push(ControlCheck.wire(container, "vr-check-after", {
      onChange: (k, v) => set("tensionMap", k, v),
    }));

    /* ---- posture phrase: speak + sing ---- */
    own(RecordingCard.wire(container, "vr-speak", {
      classId, take: A(rec0(), "phrase").speak || null, maxSeconds: 10,
      meta: { name: "Relaxation — spoken phrase", exercise: "relaxation-phrase-speak" },
      onSaved: (take) => { set("phrase", "speak", take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));
    own(RecordingCard.wire(container, "vr-sing", {
      classId, take: A(rec0(), "phrase").sing || null, maxSeconds: 10,
      meta: { name: "Relaxation — sung phrase", exercise: "relaxation-phrase-sing" },
      onSaved: (take) => { set("phrase", "sing", take); ClassActivity.bump(classId, "recordings"); compare.refresh(); },
    }));

    /* ---- recording comparison ---- */
    const compare = own(RecordingComparison.wire(container, "vr-compare", {
      list: () => Store.getClassProgress(classId).uploads.slice().sort((x, y) => (x.date || "").localeCompare(y.date || "")),
      saved: A(rec0(), "compare"),
      onChange: (s) => { set("compare", "a", s.a); set("compare", "b", s.b); set("compare", "changed", s.changed); },
    }));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "vr-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment ---- */
    function onTick(e) {
      const cb = e.target.closest("[data-assign-tick]");
      if (cb) { set("assignment", "ticks", { ...(A(rec0(), "assignment").ticks || {}), [cb.dataset.assignTick]: cb.checked }); syncCheckpoints(); refreshLive(); }
    }
    container.addEventListener("change", onTick);
    cleanups.push(() => container.removeEventListener("change", onTick));
    container.querySelectorAll("[data-assign-obs]").forEach((ta) => {
      const i = ta.dataset.assignObs;
      const save = Utils.debounce((v) => { set("assignment", "obs", { ...(A(rec0(), "assignment").obs || {}), [i]: v }); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- reflection, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-vr", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(r[0]) ? r[0] : "I don't need to force my voice to sing — I can notice unnecessary tension and let it work more comfortably.",
        struggled: (A(rec, "assignment").obs || {})[1] || "",
        toPractice: r[1] || "",
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
