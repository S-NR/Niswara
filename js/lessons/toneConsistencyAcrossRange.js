/* ============================================================
   LEVEL 2, CLASS 19 — TONE CONSISTENCY AND VOCAL ENDURANCE
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "tone-consistency-across-range".

   Curriculum identity: Level 2, Class 19 (`number: 19`, `levelId: 2`
   in data.js, explicit id `L2C19` — unchanged since the Level 2
   Curriculum Upgrade, which originally merged the old, separate
   "Vocal Endurance Foundations" class into this one). Rebuilt again
   against this class's own later, more detailed spec (tone
   consistency and vocal endurance explained in two separate sections,
   six named guided exercises, a short 2-3 phrase melody application,
   a new vocal practice log, and a 5-question knowledge check) —
   supersedes the previously-merged version. Part of a combined
   rebuild alongside Classes 18 and 20.

   Core idea: tone consistency means comfortable coordination across
   nearby notes — not making every note sound identical. Vocal
   endurance means managing effort and coordination comfortably
   across a phrase — not singing loudly, reaching higher notes, or
   singing for as long as possible. Fatigue is a sign to rest, never a
   challenge to push through, and this app cannot measure it
   automatically — the practice log is entirely self-reported.

   Honesty boundaries, matching every earlier class: no automated
   tone-consistency or fatigue measurement of any kind; longer
   practice duration is never treated as a higher score; completion
   never depends on identical tone or singing for a particular length
   of time.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PianoSynth.playSequence, RecordingCard, SelfAssessment,
   PersonalNotes, ClassProgress.
   ============================================================ */

const ToneConsistencyAcrossRangeLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "consistency", label: "Consistency" },
    { id: "endurance", label: "Endurance" },
    { id: "exercises", label: "Exercises" },
    { id: "apply", label: "Apply" },
    { id: "log", label: "Log" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2;
  const SWARA_SEMITONE = { sa: 0, ri: 2, ga: 4 };
  const SWARA_LABEL = { sa: "Sa", ri: "Ri", ga: "Ga" };

  const EXERCISES = [
    {
      key: "hum", title: "Exercise 1 — Gentle humming", degrees: [0],
      purpose: "Settle into a relaxed, comfortable sound before practising further.",
      instructions: "Hum gently on a comfortable note for a few seconds.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the hum feels easy and even.", mistakes: "Humming too loudly or forcing the tone.",
    },
    {
      key: "sustained", title: "Exercise 2 — Short sustained vowel practice", degrees: [0],
      purpose: "Practise holding a comfortable tone briefly without pushing.",
      instructions: "Sing a comfortable “ah” and hold it gently for 2-3 seconds.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the tone stays steady, or drifts and wavers.", mistakes: "Holding past a comfortable breath.",
    },
    {
      key: "repeatedNote", title: "Exercise 3 — Repeated comfortable-note patterns", degrees: [0, 0, 0],
      purpose: "Notice whether tone stays consistent across repeated attempts on the same note.",
      instructions: "Sing the same comfortable note three times in a row, with a small gap between each.",
      repetitions: "Two or three rounds.", rest: "Rest between rounds.",
      listening: "Notice whether all three repetitions sound similar in tone.", mistakes: "Changing volume or tone quality between repetitions.",
    },
    {
      key: "phraseRepeat", title: "Exercise 4 — Short phrase repetition", degrees: null,
      purpose: "Practise keeping a short spoken phrase consistent across repetitions.",
      instructions: `Say “I am exploring my voice today” naturally, then repeat it two more times at the same comfortable volume.`,
      repetitions: "Three repetitions total.", rest: "Rest between repetitions.",
      listening: "Notice whether clarity and tone stay similar across repetitions.", mistakes: "Getting progressively quieter or less clear.",
    },
    {
      key: "twoPhrase", title: "Exercise 5 — Two-phrase singing practice", degrees: [0, 1, 0, -1, 0],
      purpose: "Extend consistency across two short connected phrases.",
      instructions: "Sing a short two-part phrase gently, keeping tone and comfort consistent across both parts.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice whether the second phrase feels as easy as the first.", mistakes: "Rushing the second phrase to 'get through it'.",
    },
    {
      key: "restRepeat", title: "Exercise 6 — Rest-and-repeat exercise", degrees: [0],
      purpose: "Practise deliberately resting as part of the exercise, not as an afterthought.",
      instructions: "Sing a comfortable phrase once, rest for a few breaths, then repeat it — noticing how the voice feels after resting.",
      repetitions: "Two rounds.", rest: "A real, unhurried rest between each round — this is the point of the exercise.",
      listening: "Notice whether resting made the second attempt feel easier.", mistakes: "Skipping the rest or making it too short to matter.",
    },
  ];

  const PHRASES = [
    { key: "p1", label: "Phrase 1", swaras: ["sa", "ri", "ga"] },
    { key: "p2", label: "Phrase 2", swaras: ["ga", "ri", "sa"] },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "consistency",
      question: "What does tone consistency mean?",
      options: [
        { value: "identical", label: "Making every single note sound identical", correct: false },
        { value: "coordination", label: "Comfortable coordination across nearby notes", correct: true },
        { value: "loud", label: "Singing at the same loud volume throughout", correct: false },
      ],
      explain: { identical: "Not quite — consistency isn't about identical notes.", coordination: "Exactly right.", loud: "Not quite — this isn't about volume." },
    },
    {
      key: "toneChange",
      question: "Why might tone change between vowels and notes?",
      options: [
        { value: "mistake", label: "It's always a mistake that needs fixing", correct: false },
        { value: "natural", label: "This is natural variation in coordination and vowel shape", correct: true },
        { value: "never", label: "Tone never actually changes", correct: false },
      ],
      explain: { mistake: "Not quite — natural variation isn't a mistake.", natural: "Exactly right.", never: "Not quite — tone genuinely does vary naturally." },
    },
    {
      key: "endurance",
      question: "What is vocal endurance?",
      options: [
        { value: "long", label: "Singing continuously for as long as possible", correct: false },
        { value: "manage", label: "Managing effort and coordination comfortably across a phrase", correct: true },
        { value: "loud", label: "Singing loudly without stopping", correct: false },
      ],
      explain: { long: "Not quite — endurance isn't about maximum duration.", manage: "Exactly right.", loud: "Not quite — volume isn't the point." },
    },
    {
      key: "fatigue",
      question: "Should fatigue be treated as a challenge to push through?",
      options: [
        { value: "yes", label: "Yes, pushing through builds endurance", correct: false },
        { value: "no", label: "No — rest is part of good vocal practice", correct: true },
        { value: "sometimes", label: "Only near the end of a session", correct: false },
      ],
      explain: { yes: "Not quite — pushing through fatigue works against healthy practice.", no: "Exactly right.", sometimes: "Not quite — this holds throughout any session." },
    },
    {
      key: "measure",
      question: "Can this app automatically measure your vocal fatigue?",
      options: [
        { value: "yes", label: "Yes, it tracks fatigue precisely", correct: false },
        { value: "no", label: "No — the practice log is entirely self-reported", correct: true },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — this app has no automatic fatigue measurement.", no: "Exactly right.", unsure: "It does say — Section F states this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodConsistency", label: "I understand what tone consistency means." },
    { key: "understoodEndurance", label: "I understand what vocal endurance means." },
    { key: "triedExercise", label: "I tried at least one of the six guided exercises." },
    { key: "triedApplication", label: "I practised the two-phrase melody application, or chose to skip it." },
    { key: "loggedPractice", label: "I filled in the vocal practice log honestly." },
    { key: "reflected", label: "I reflected on tiredness and breathing." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    toneConsistent: { question: "Was my tone reasonably consistent?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    becameTired: { question: "Did I become tired?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    pronunciationClear: { question: "Did my pronunciation remain clear?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    comfortableBreathing: { question: "Did I maintain comfortable breathing?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    neededBreaks: { question: "Did I need more breaks?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
  };

  const COMFORT_OPTIONS = ["Comfortable", "Slightly tired", "Tired"];
  const FATIGUE_OPTIONS = ["None", "Mild", "Noticeable"];
  const MINUTES_OPTIONS = ["Under 5 min", "5-10 min", "10-20 min", "20+ min"];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);
  const swaraNotes = (b, keys) => keys.map((k) => b + SWARA_SEMITONE[k]);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n - STEP >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C17", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from + STEP, Math.min(RANGE.to - MAX_UP * STEP, fallback));
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
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
      ${ex.degrees ? `<div class="flex flex-wrap gap-3 mb-3"><button type="button" data-play-ex="${ex.key}" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button></div>` : ""}
      ${recCard(`${ex.key}Take`, `Recording for ${ex.title.replace(/^Exercise \d+ — /, "")}`, "Entirely optional.", 15)}
      <div class="mt-2">${skipBtn(ex.key)}</div>
    </div>`;
  }

  function practiceLogHtml(rec) {
    const log = A(rec, "practiceLog");
    const chipRow = (group, options, selected) => `
      <div class="flex flex-wrap gap-2 mb-3" data-log-group="${group}">
        ${options.map((o) => `<button type="button" data-log-choice="${o}" class="ex-chip ${selected === o ? "is-selected" : ""}">${o}</button>`).join("")}
      </div>`;
    return `<div data-practice-log>
      <p class="text-sm text-ink-200 mb-2">About how long did you practise today?</p>
      ${chipRow("minutes", MINUTES_OPTIONS, log.minutes)}
      <p class="text-sm text-ink-200 mb-2">How comfortable did your voice feel?</p>
      ${chipRow("comfort", COMFORT_OPTIONS, log.comfort)}
      <p class="text-sm text-ink-200 mb-2">Fatigue level (self-reported — this app cannot measure fatigue automatically)</p>
      ${chipRow("fatigue", FATIGUE_OPTIONS, log.fatigue)}
      <label class="block text-sm text-ink-200 mb-1.5 mt-2" for="tcar-improve">Areas needing improvement</label>
      <textarea id="tcar-improve" data-growth="improvement" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(log.improvement || "")}</textarea>
      <p class="text-xs text-ink-500 mt-2">Longer practice duration is never treated as a higher score — this log is just for your own awareness.</p>
    </div>`;
  }

  function problems() {
    const items = [
      ["Trying to make every note sound exactly identical", "Natural variation is normal — comfortable coordination matters more."],
      ["Pushing through tiredness to finish all six exercises", "A few comfortable exercises, done well, are enough for today."],
      ["Skipping rest between repetitions to save time", "Real rest is part of the exercise, not optional filler."],
      ["Treating a longer practice log entry as a better result", "Duration isn't a score — comfort and consistency matter more."],
      ["Assuming this app can detect your fatigue", "Fatigue awareness here is entirely self-reported."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["applyTake", "Two-phrase melody"]];
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 19 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Consistent, not identical. Enduring, not exhausting.</p>
        <p class="text-sm text-ink-300">Rest is part of good practice, not a failure.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 20 — Articulation and Style</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores clear pronunciation and a first look at personal singing style.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Tone consistency is comfortable coordination; endurance is comfortable management of effort — neither one is a test of perfection or duration.</h3>
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
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("recap", 1, "Section A — Recap", `
          ${narrow(p("Class 16 explored sustained notes, Class 17 explored vocal dynamics, and Class 18 explored vocal agility. A gentle warm-up before today's work on consistency and endurance:"))}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-recap class="vr-btn">${icon("play", "w-4 h-4")} Gentle warm-up</button>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("consistency", 2, "Section B — Understanding tone consistency", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Tone consistency means comfortable coordination across nearby notes.", "Tone may naturally change between vowels and notes.", "Consistency does not mean every note must sound identical.", "Comfortable coordination, articulation and listening all contribute to a consistent sound."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
        `)}

        ${chapter("endurance", 3, "Section C — Understanding vocal endurance", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Vocal endurance means managing effort and coordination comfortably across a phrase.", "Singers need sustainable practice habits, not maximum-duration sessions.", "There's a real difference between healthy practice and vocal overuse.", "Breaks are important — not a sign of weakness.", "Fatigue should never be treated as a challenge to overcome."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
        `)}

        ${chapter("exercises", 4, "Section D — Guided exercises", `
          ${narrow(p("Some exercises share one comfortable reference note — choose it on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("tcar-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("apply", 5, "Section E — Practical application", `
          ${narrow(p("A short melody with two phrases. Sing it while focusing on consistent tone, comfortable breathing, clear pronunciation, relaxed transitions, and a natural ending. If you'd like, the same pattern is also shown with swara labels, built from your own chosen Sa."))}
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-apply="numbers" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen: numbers</button>
            <button type="button" data-play-apply="swara" class="vr-btn">${icon("play", "w-4 h-4")} Listen: Sa–Ri–Ga / Ga–Ri–Sa</button>
          </div>
          ${recCard("applyTake", "The two-phrase melody", "Entirely optional.", 20)}
        `)}

        ${chapter("log", 6, "Section F — Vocal practice log", `
          ${narrow(p("A simple, honest self-report — not a score. Niswara cannot measure vocal fatigue automatically."))}
          <div data-practice-log-host>${practiceLogHtml(rec)}</div>
        `)}

        ${chapter("record", 7, "Section G — Recording and self-assessment", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("toneConsistent-q", { ...Q.toneConsistent, selected: sel("toneConsistent") })}
              ${SelfAssessment.render("becameTired-q", { ...Q.becameTired, selected: sel("becameTired") })}
              ${SelfAssessment.render("pronunciationClear-q", { ...Q.pronunciationClear, selected: sel("pronunciationClear") })}
              ${SelfAssessment.render("comfortableBreathing-q", { ...Q.comfortableBreathing, selected: sel("comfortableBreathing") })}
              ${SelfAssessment.render("neededBreaks-q", { ...Q.neededBreaks, selected: sel("neededBreaks") })}
            </div>
          `)}
        `)}

        ${chapter("quiz", 8, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 9, "Section H — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 10, "Common beginner mistakes", problems())}

        ${chapter("complete", 11, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-tcar", { placeholder: "e.g. Whether rest helped... Where tone felt most natural... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Vocal safety", `
          ${narrow(`
            ${p("Don't sing through fatigue, and don't force high or low notes or excessive vocal pressure. Rest is part of this class's own exercises — take it seriously.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort. If discomfort repeatedly occurs, seek guidance from a qualified voice professional.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Section A: recap playback ---- */
    function onPlayRecap(e) {
      if (!e.target.closest("[data-play-recap]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlayRecap);
    cleanups.push(() => container.removeEventListener("click", onPlayRecap));

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

    /* ---- Section D: piano + exercise playback ---- */
    own(VirtualPiano.wire(container, "tcar-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi - STEP < RANGE.from || midi + MAX_UP * STEP > RANGE.to) return;
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
      },
    }));
    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (ex && ex.degrees) PianoSynth.playSequence(degreesToNotes(base(), ex.degrees), { duration: 0.7, gap: 0.3 });
    }
    container.addEventListener("click", onPlayEx);
    cleanups.push(() => container.removeEventListener("click", onPlayEx));

    /* ---- Section E: application playback (numbers vs swara labels, same melody) ---- */
    function onPlayApply(e) {
      const btn = e.target.closest("[data-play-apply]");
      if (!btn) return;
      const b = base();
      const keys = ["sa", "ri", "ga", "ga", "ri", "sa"];
      PianoSynth.playSequence(swaraNotes(b, keys), { duration: 0.55, gap: 0.2 });
    }
    container.addEventListener("click", onPlayApply);
    cleanups.push(() => container.removeEventListener("click", onPlayApply));

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

    /* ---- Section F: practice log ---- */
    function refreshLogHost() {
      const host = $("[data-practice-log-host]");
      if (host) host.innerHTML = practiceLogHtml(rec0());
    }
    function onLogChoice(e) {
      const btn = e.target.closest("[data-log-choice]");
      if (!btn) return;
      const group = btn.closest("[data-log-group]").dataset.logGroup;
      set("practiceLog", group, btn.dataset.logChoice);
      refreshLogHost();
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onLogChoice);
    cleanups.push(() => container.removeEventListener("click", onLogChoice));
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => { set("practiceLog", key, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const EX_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...EX_NAMES, applyTake: "Two-phrase melody" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "applyTake" ? 20 : 15,
        meta: { name: `Level 2, Class 19 — ${NAMES[k]}`, exercise: `tone-consistency-across-range-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Section G: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "toneConsistent-q": "toneConsistent", "becameTired-q": "becameTired", "pronunciationClear-q": "pronunciationClear", "comfortableBreathing-q": "comfortableBreathing", "neededBreaks-q": "neededBreaks" };
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

    /* ---- completion checklist ---- */
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
    own(PersonalNotes.wire(container, "notes-tcar", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Tone consistency means comfortable coordination, not identical notes — and vocal endurance means comfortable, sustainable practice, never maximum duration.",
        struggled: q(rec, "becameTired") === "yes" || q(rec, "becameTired") === "alittle" ? "Noticed some tiredness." : "",
        toPractice: A(rec, "practiceLog").improvement || "",
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
