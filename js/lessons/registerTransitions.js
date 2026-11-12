/* ============================================================
   LEVEL 2, CLASS 14 — REGISTER TRANSITIONS AND COORDINATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "register-transitions".

   Curriculum identity: Level 2, Class 14 (`number: 14`, `levelId: 2`
   in data.js, explicit id `L2C10` — unchanged since the Level 2
   Curriculum Upgrade merged the old "Register Coordination Practice"
   class into this one). Rebuilt against this class's own later, more
   detailed spec (a named recap section, an introduction to the
   passaggio, six named guided exercises each with purpose/
   instructions/repetitions/rest/listening-focus/mistakes, a
   progressive transition routine, and a 5-question knowledge check)
   — supersedes the merged version written during the Curriculum
   Upgrade, following the same rebuild Classes 7, 8 and 11 received.

   Core idea: the passaggio is a transition area, not a single fixed
   note — register transitions are a normal, gradual part of how
   voices work. Vocal registers and coordination are complex, and
   sensations differ among singers; this class avoids rigid universal
   register boundaries and never prescribes a fixed pitch.

   Honesty boundaries, matching every earlier class: no fabricated
   register-detection, automatic pitch analysis, or vocal-quality
   scoring; completion never depends on perfect pitch, smooth
   transitions, a recording, or finishing every optional activity.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PianoSynth.playSequence (relative-degree patterns,
   shared across all six Section C exercises and the Section D
   routine — one reference note, not six), RecordingCard,
   SelfAssessment, PersonalNotes, ClassProgress.
   ============================================================ */

const RegisterTransitionsLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "understand", label: "Understand" },
    { id: "exercises", label: "Exercises" },
    { id: "practice", label: "Practice" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 3; // the three-note pattern and progressive routine need headroom for 3 steps up

  // Section C — every exercise carries purpose/instructions/repetitions/rest/listening-focus/
  // common-mistakes, per the spec's own explicit per-exercise structure (same shape as Class 11's
  // rebuild). All six share one piano-picked reference note.
  const EXERCISES = [
    {
      key: "hum", title: "Exercise 1 — Gentle humming glide", degrees: [0, 1, 0],
      purpose: "Notice how your voice feels as you glide gently between two nearby pitches.",
      instructions: "Hum gently, gliding from a comfortable note to a nearby higher note and back.",
      repetitions: "Two or three gentle glides.", rest: "Rest between glides.",
      listening: "Notice where the sound feels smooth, and where it feels less stable.",
      mistakes: "Pushing the glide too far, or moving too quickly.",
    },
    {
      key: "ooGlide", title: "Exercise 2 — Small-range “oo” glide", degrees: [0, 1, 0],
      purpose: "Explore the same gentle glide using an “oo” vowel.",
      instructions: "Glide gently on “oo” across a small, comfortable pitch range.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice any change in tone or stability as the pitch moves.",
      mistakes: "Widening the range too much, or increasing volume to help the glide.",
    },
    {
      key: "lipTrill", title: "Exercise 3 — Lip trill glide, if comfortable", degrees: [0, 1, 0],
      purpose: "Use a relaxed lip trill to explore pitch movement with minimal tension.",
      instructions: "If comfortable, try a gentle lip trill while gliding across a small pitch range. Skip entirely if lip trills are difficult for you.",
      repetitions: "One or two attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the trill stays even as the pitch changes.",
      mistakes: "Forcing a trill that doesn't come naturally.",
    },
    {
      key: "twoNote", title: "Exercise 4 — Two-note patterns", degrees: [0, 1, 0],
      purpose: "Practise a small, comfortable two-note movement.",
      instructions: "Move gently between two nearby notes, back and forth.",
      repetitions: "A few comfortable repetitions.", rest: "Rest between repetitions.",
      listening: "Notice whether the transition between the two notes feels smooth or noticeable.",
      mistakes: "Rushing between the two notes.",
    },
    {
      key: "threeNote", title: "Exercise 5 — Three-note patterns", degrees: [0, 1, 2, 1, 0],
      purpose: "Extend the two-note movement into a slightly longer, gentle pattern.",
      instructions: "Move gently through three nearby notes and back.",
      repetitions: "A few comfortable repetitions.", rest: "Rest between repetitions.",
      listening: "Notice how the pattern feels across the slightly wider range.",
      mistakes: "Trying to move too quickly through all three notes.",
    },
    {
      key: "speechToSong", title: "Exercise 6 — Gentle speech-to-song transitions", degrees: [0],
      purpose: "Connect natural speech with gentle singing.",
      instructions: "Speak a short phrase naturally, then sing the same phrase gently on a comfortable note.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice how speaking and singing the same phrase feel different.",
      mistakes: "Exaggerating the change from speech to song.",
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIsTransition",
      question: "What is a register transition?",
      options: [
        { value: "rule", label: "A rule for singing as loudly as possible", correct: false },
        { value: "shift", label: "An area where the voice's coordination shifts as pitch changes", correct: true },
        { value: "fixed", label: "A fixed note every singer shares", correct: false },
      ],
      explain: { rule: "Not quite — transitions have nothing to do with loudness.", shift: "Exactly right.", fixed: "Not quite — it varies between singers." },
    },
    {
      key: "whyUneven",
      question: "Why can transitions feel uneven?",
      options: [
        { value: "wrong", label: "Because the singer is doing something wrong", correct: false },
        { value: "develops", label: "Because coordination and sensation differ between singers, and smooth coordination develops gradually", correct: true },
        { value: "never", label: "They never feel uneven", correct: false },
      ],
      explain: { wrong: "Not quite — unevenness isn't a sign of doing something wrong.", develops: "Right.", never: "Not quite — unevenness is a normal part of this process." },
    },
    {
      key: "passaggio",
      question: "What is the passaggio?",
      options: [
        { value: "exact", label: "An exact pitch every singer shares", correct: false },
        { value: "area", label: "A transition area, not a single fixed note", correct: true },
        { value: "rhythm", label: "A rhythm pattern", correct: false },
      ],
      explain: { exact: "Not quite — it's an area, and it varies between singers.", area: "Exactly right.", rhythm: "Not quite — the passaggio is about pitch, not rhythm." },
    },
    {
      key: "forceAway",
      question: "Should a singer force a transition to disappear immediately?",
      options: [
        { value: "yes", label: "Yes, with enough effort", correct: false },
        { value: "no", label: "No — smooth coordination develops gradually through practice", correct: true },
        { value: "sometimes", label: "Only on higher notes", correct: false },
      ],
      explain: { yes: "Not quite — forcing works against comfortable coordination.", no: "Right.", sometimes: "Not quite — gradual practice matters at every pitch." },
    },
    {
      key: "identical",
      question: "Do all singers experience register transitions identically?",
      options: [
        { value: "yes", label: "Yes, always", correct: false },
        { value: "no", label: "No — sensations and experiences differ among singers", correct: true },
        { value: "unsure", label: "This hasn't been mentioned in this course", correct: false },
      ],
      explain: { yes: "Not quite — experiences genuinely vary.", no: "Exactly right.", unsure: "It has — Section B says this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what register transitions are, and what the passaggio means." },
    { key: "triedGlide", label: "I tried at least one gentle glide exercise (humming, “oo”, or lip trill), or chose to skip them." },
    { key: "triedPattern", label: "I tried at least one pattern exercise (two-note, three-note, or speech-to-song), or chose to skip them." },
    { key: "triedRoutine", label: "I practised the progressive transition routine, or chose to skip it." },
    { key: "tensionChecked", label: "I checked for tension and avoided forcing a transition." },
    { key: "reflected", label: "I reflected on which exercise felt easiest." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    stayedComfortable: { question: "Did the sound remain comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    abruptChange: { question: "Did I notice an abrupt change?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Was there tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    easiestExercise: {
      question: "Which exercise felt easiest?",
      options: [opt("hum", "Humming glide"), opt("oo", "“Oo” glide"), opt("trill", "Lip trill"), opt("two", "Two-note pattern"), opt("three", "Three-note pattern"), opt("speech", "Speech-to-song"), opt("notsure", "Not sure")],
    },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_UP * STEP, fallback));
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  const FIELD = (label, value) => `<p class="text-xs text-ink-300 leading-relaxed"><span class="text-ink-500 uppercase tracking-wide text-[10px]">${label}:</span> ${value}</p>`;
  function exerciseCardHtml(ex) {
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4" data-exercise-card="${ex.key}">
      <p class="font-display text-lg text-ink-50 mb-3">${ex.title}</p>
      <div class="flex flex-col gap-1.5 mb-4">
        ${FIELD("Purpose", ex.purpose)}
        ${FIELD("Instructions", ex.instructions)}
        ${FIELD("Repetitions", ex.repetitions)}
        ${FIELD("Rest", ex.rest)}
        ${FIELD("Listening focus", ex.listening)}
        ${FIELD("Common mistakes", ex.mistakes)}
      </div>
      <div class="flex flex-wrap gap-3 mb-3">
        <button type="button" data-play-ex="${ex.key}" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
      </div>
      ${recCard(`${ex.key}Take`, `Recording for ${ex.title.replace(/^Exercise \d+ — /, "")}`, "Entirely optional.", 15)}
      <div class="mt-2">${skipBtn(ex.key)}</div>
    </div>`;
  }

  function problems() {
    const items = [
      ["Trying to remove every voice break", "Explore small pitch changes without forcing the result."],
      ["Increasing volume during a difficult transition", "Return to a comfortable volume and reduce the pitch movement."],
      ["Pushing chest-dominant coordination upward, or forcing a high head-dominant sound", "Stay within a range that feels light and comfortable."],
      ["Repeating a difficult glide many times", "Rest, shorten the exercise, or skip it."],
      ["Deliberately creating a break or pushing through a difficult note", "Notice the transition gently — never force through it."],
      ["Assuming every singer's transitions feel identical", "Vocal experiences vary — there are no rigid universal register boundaries."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["routineTake", "Progressive transition routine"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the exercises above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function knowledgeCheckHtml(rec) {
    return `<div class="flex flex-col gap-5" data-kc>
      ${KNOWLEDGE_CHECK.map((item) => {
        const selected = q(rec, `kc_${item.key}`);
        return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-kc-item="${item.key}">
          <p class="text-sm text-ink-200 mb-2.5">${item.question}</p>
          <div class="flex flex-wrap gap-2">
            ${item.options.map((o) => `<button type="button" data-kc-choice="${o.value}" class="ex-chip ${selected === o.value ? "is-selected" : ""}">${o.label}</button>`).join("")}
          </div>
          ${selected ? `<p class="text-xs mt-2.5 ${item.options.find((o) => o.value === selected).correct ? "text-emerald-300" : "text-amber-300"}">${item.explain[selected]}</p>` : ""}
        </div>`;
      }).join("")}
      <p class="text-xs text-ink-500">This is a quick concept check, not a vocal-performance score.</p>
    </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 14 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">The passaggio is an area, not a wall.</p>
        <p class="text-sm text-ink-300">A noticeable transition or voice break is not automatically a failure.</p>
        <p class="text-sm text-ink-100">Smooth coordination develops gradually, through practice — not in one lesson.</p>
      </div>`;
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = PROGRESS_ITEMS.map((i) => `
      <li class="flex items-center gap-2.5 text-sm ${rec.checkpoints[i.key] ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${rec.checkpoints[i.key] ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${rec.checkpoints[i.key] ? icon("check", "w-3 h-3") : ""}</span>${i.label}
      </li>`).join("");
    const preview = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 15 — Controlled Range Development</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore comfortable pitch range gradually — no forced high or low notes, and no demanding range extensions yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">How the voice travels across its range, and how to practise that journey gently.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            ${preview}
            ${next ? `
            <div class="mt-6">
              <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
              <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
                <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
              </div>
            </div>` : ""}
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
        ${preview}
      </div>`;
  }

  function progressStats(cls) {
    return [{ label: "Recordings", value: ClassActivity.count(cls.id, "recordings") }];
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("recap", 1, "Section A — Recap", `
          ${narrow(`
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Chest Voice Foundations explored comfortable, speech-like sounds.", "Head Voice Foundations explored lighter sounds.", "Connecting Chest &amp; Head Voice introduced small transitions.", "Introduction to Mixed Coordination introduced the idea of balancing vocal qualities."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            ${p("This class focuses on noticing changes, not eliminating every difference between vocal qualities.")}
          `)}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-recap class="vr-btn">${icon("play", "w-4 h-4")} Quick listen</button>
          </div>
          ${flowStrip(["LISTEN", "EXPLORE", "NOTICE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Understanding transitions", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["A register transition is an area where the voice's coordination shifts as pitch changes.", "The voice may change in tone or feel across pitch — this varies between singers and exercises.", "Some notes may feel less stable, especially near a transition area.", "Smooth coordination develops gradually through practice, not forced in one lesson."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-sm text-ink-300 leading-relaxed"><strong class="text-ink-100">The passaggio</strong> is the term often used for this transition area — a zone, not a single fixed note, and its exact location varies from singer to singer.</p>
          `)}
        `)}

        ${chapter("exercises", 3, "Section C — Guided exercises", `
          ${narrow(p("All six exercises share one comfortable reference note — choose it on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("rt-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("practice", 4, "Section D — Transition practice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Start in a comfortable range.", "Move gradually through a small range.", "Maintain an easy, unforced sound.", "Rest between repetitions.", "Repeat only when comfortable."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mb-4">This isn't about deliberately creating a break or pushing through a difficult note — just a gentle, progressive routine.</p>
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-routine class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the routine</button>
          </div>
          ${recCard("routineTake", "The progressive transition routine", "Entirely optional.", 20)}
        `)}

        ${chapter("record", 5, "Section E — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("stayedComfortable-q", { ...Q.stayedComfortable, selected: sel("stayedComfortable") })}
              ${SelfAssessment.render("abruptChange-q", { ...Q.abruptChange, selected: sel("abruptChange") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("easiestExercise-q", { ...Q.easiestExercise, selected: sel("easiestExercise") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rt-again">What would I like to explore again?</label><textarea id="rt-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("quiz", 6, "Section F — Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 7, "Section G — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, smooth transitions, recording, or completing optional activities.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "Common beginner mistakes", problems())}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-rt", { placeholder: "e.g. Which exercise felt easiest... Whether I noticed an abrupt change anywhere... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Vocal safety", `
          ${narrow(`
            ${p("Never force a transition. Don't push chest-dominant coordination upward, and don't force a high head-dominant sound.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort. Rest when needed.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 11, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 12, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
      Object.entries(derivedCheckpoints(rec)).forEach(([k, v]) => {
        if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v);
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- knowledge check ---- */
    function onKcChoice(e) {
      const btn = e.target.closest("[data-kc-choice]");
      if (!btn) return;
      const itemEl = btn.closest("[data-kc-item]");
      const key = itemEl.dataset.kcItem;
      set("q", `kc_${key}`, btn.dataset.kcChoice);
      $("[data-kc]").outerHTML = knowledgeCheckHtml(rec0());
    }
    container.addEventListener("click", onKcChoice);
    cleanups.push(() => container.removeEventListener("click", onKcChoice));

    /* ---- Section A: recap playback ---- */
    function onPlayRecap(e) {
      if (!e.target.closest("[data-play-recap]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), [0, 1, 0, -1, 0]), { duration: 0.5, gap: 0.12 });
    }
    container.addEventListener("click", onPlayRecap);
    cleanups.push(() => container.removeEventListener("click", onPlayRecap));

    /* ---- Section C: piano + exercise playback ---- */
    own(VirtualPiano.wire(container, "rt-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + MAX_UP * STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (ex) PianoSynth.playSequence(degreesToNotes(base(), ex.degrees), { duration: 0.7, gap: 0.3 });
    }
    container.addEventListener("click", onPlayEx);
    cleanups.push(() => container.removeEventListener("click", onPlayEx));

    /* ---- Section D: progressive routine playback ---- */
    function onPlayRoutine(e) {
      if (!e.target.closest("[data-play-routine]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), [0, 1, 2, 3, 2, 1, 0]), { duration: 0.6, gap: 0.25 });
    }
    container.addEventListener("click", onPlayRoutine);
    cleanups.push(() => container.removeEventListener("click", onPlayRoutine));

    /* ---- skip buttons ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const EX_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...EX_NAMES, routineTake: "Progressive transition routine" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "routineTake" ? 20 : 15,
        meta: { name: `Level 2, Class 14 — ${NAMES[k]}`, exercise: `register-transitions-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Section E: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "stayedComfortable-q": "stayedComfortable", "abruptChange-q": "abruptChange", "tensionNoticed-q": "tensionNoticed", "easiestExercise-q": "easiestExercise" };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- growth textarea ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => set("growth", key, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- Section G: completion checklist ---- */
    function onChecklist(e) {
      const cb = e.target.closest("[data-checklist]");
      if (!cb) return;
      set("checklist", cb.dataset.checklist, cb.checked);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("change", onChecklist);
    cleanups.push(() => container.removeEventListener("change", onChecklist));

    /* ---- Common Warm-up note (only if already unlocked) ---- */
    const warmupHost = $("[data-warmup-note]");
    if (warmupHost && Warmup.isUnlocked()) {
      warmupHost.innerHTML = `<p class="text-sm text-ink-400 mt-2">You can also use the <a href="#/warmup" class="text-gold-300 hover:text-gold-200 underline">Common Warm-up</a> before practising, if that feels useful.</p>`;
    }

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-rt", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "The passaggio is a transition area, not a single fixed note — smooth register coordination develops gradually, through practice.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Noticed some tension." : "",
        toPractice: A(rec, "growth").exploreAgain || "",
        thoughts: "",
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
