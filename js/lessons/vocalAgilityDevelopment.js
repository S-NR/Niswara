/* ============================================================
   LEVEL 2, CLASS 18 — VOCAL AGILITY DEVELOPMENT
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vocal-agility-development".

   Curriculum identity: Level 2, Class 18 (`number: 18`, `levelId: 2`
   in data.js, explicit id `L2C17` — unchanged since the Level 2
   Curriculum Upgrade). Rebuilt against this class's own later, more
   detailed spec (a named recap, seven progressive exercises each
   with purpose/instructions/repetitions/rest/listening-focus/
   mistakes, beginner swara patterns built from the learner's own
   chosen Sa, a real tempo-selectable practice stage, and a 5-
   question knowledge check) — supersedes the shorter version first
   written earlier in the project. Part of a combined rebuild
   alongside Classes 19 and 20.

   Core idea: "Vocal agility is not simply singing fast — it's
   moving between notes with control." Accuracy and comfort come
   first; speed is introduced only afterward, via a genuine (not
   faked) tempo control over the same synthesized patterns. The
   swara patterns used (Sa Ri Sa; Sa Ri Ga Ri Sa; Sa Ri Ga Ma Ga Ri
   Sa; Sa Ga Ri Ma Ga Ri Sa) are beginner practice patterns, never
   presented as named ragas or formal compositions, and Sa is never
   assumed to be any fixed Western note.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection; the tempo control genuinely changes playback
   speed (not a cosmetic label) — it's exactly what `PianoSynth
   .playSequence`'s own `duration`/`gap` parameters already do.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PianoSynth.playSequence, RecordingCard, SelfAssessment,
   PersonalNotes, ClassProgress.
   ============================================================ */

const VocalAgilityDevelopmentLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "understand", label: "Understand" },
    { id: "exercises", label: "Exercises" },
    { id: "tempo", label: "Tempo" },
    { id: "apply", label: "Apply" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 3;
  const SWARA_SEMITONE = { sa: 0, ri: 2, ga: 4, ma: 5 };
  const SWARA_LABEL = { sa: "Sa", ri: "Ri", ga: "Ga", ma: "Ma" };
  const swaraNotes = (b, keys) => keys.map((k) => b + SWARA_SEMITONE[k]);

  const EXERCISES = [
    {
      key: "twoNote", title: "Exercise 1 — Two-note movement", swaras: ["sa", "ri", "sa"],
      purpose: "Build the simplest possible movement between two nearby notes.",
      instructions: "Listen to Sa–Ri–Sa, then sing it slowly and gently.",
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice whether the move between Sa and Ri feels smooth.", mistakes: "Rushing the movement before it feels comfortable.",
    },
    {
      key: "threeNote", title: "Exercise 2 — Three-note patterns", swaras: ["sa", "ri", "ga", "ri", "sa"],
      purpose: "Extend to a small three-note pattern.",
      instructions: "Listen to Sa–Ri–Ga–Ri–Sa, then sing it slowly.",
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice whether each note stays clear, especially Ga.", mistakes: "Sliding between notes instead of singing each one clearly.",
    },
    {
      key: "fourNote", title: "Exercise 3 — Four-note patterns", swaras: ["sa", "ri", "ga", "ma", "ga", "ri", "sa"],
      purpose: "Extend further to a four-note pattern.",
      instructions: "Listen to Sa–Ri–Ga–Ma–Ga–Ri–Sa, then sing it slowly.",
      repetitions: "One or two times.", rest: "Rest between attempts.",
      listening: "Notice whether Ma stays clear and in tune with the rest.", mistakes: "Losing accuracy on the highest note of the pattern.",
    },
    {
      key: "updown", title: "Exercise 4 — Gentle ascending and descending patterns", swaras: ["sa", "ri", "ga", "ma"],
      purpose: "Clearly distinguish ascending movement from descending movement.",
      instructions: "Listen to the ascending Sa–Ri–Ga–Ma, then the descending Ma–Ga–Ri–Sa, separately.",
      repetitions: "Once each.", rest: "Rest between the two.",
      listening: "Notice whether ascending or descending feels easier.", mistakes: "Treating both directions as identical.",
    },
    {
      key: "repeated", title: "Exercise 5 — Repeated-note patterns", swaras: ["sa", "sa", "ri", "ri", "sa", "sa"],
      purpose: "Practise repeating a single note clearly before moving, building coordination without pitch change.",
      instructions: "Listen to Sa-Sa–Ri-Ri–Sa-Sa, then sing it, keeping each repeated note clear and even.",
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice whether the repeated notes stay even in tone and timing.", mistakes: "Letting repeated notes blur together.",
    },
    {
      key: "variation", title: "Exercise 6 — Simple melodic variations", swaras: ["sa", "ga", "ri", "ma", "ga", "ri", "sa"],
      purpose: "Explore a varied ordering of the same four notes.",
      instructions: "Listen to Sa–Ga–Ri–Ma–Ga–Ri–Sa — the same notes as Exercise 3, in a different order.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice how reordering the same notes changes the shape of the pattern.", mistakes: "Confusing this variation with Exercise 3's pattern.",
    },
  ];

  const TEMPO_PATTERN = ["sa", "ri", "ga", "ri", "sa"];
  const TEMPOS = [
    { key: "slow", label: "Slow", duration: 0.9, gap: 0.4 },
    { key: "medium", label: "Comfortable medium", duration: 0.6, gap: 0.25 },
    { key: "fast", label: "Slightly faster", duration: 0.4, gap: 0.12 },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIsAgility",
      question: "What does vocal agility mean?",
      options: [
        { value: "fast", label: "Singing as fast as possible", correct: false },
        { value: "control", label: "Moving between notes smoothly and accurately", correct: true },
        { value: "loud", label: "Singing loudly across a wide range", correct: false },
      ],
      explain: { fast: "Not quite — agility isn't about raw speed.", control: "Exactly right.", loud: "Not quite — agility has nothing to do with volume." },
    },
    {
      key: "stepwise",
      question: "What is stepwise movement?",
      options: [
        { value: "neighbour", label: "Moving to a neighbouring, nearby note", correct: true },
        { value: "jump", label: "A large jump between distant notes", correct: false },
        { value: "repeat", label: "Singing the same note twice", correct: false },
      ],
      explain: { neighbour: "Exactly right.", jump: "Not quite — that describes a larger interval, not a step.", repeat: "Not quite — that's a repeated note, not a step." },
    },
    {
      key: "priority",
      question: "Should speed be prioritised over accuracy?",
      options: [
        { value: "yes", label: "Yes, speed matters most", correct: false },
        { value: "no", label: "No — accuracy and comfort come first; speed develops later", correct: true },
        { value: "equal", label: "They're equally important from the start", correct: false },
      ],
      explain: { yes: "Not quite — this class explicitly reverses that priority.", no: "Right.", equal: "Not quite — accuracy comes first here." },
    },
    {
      key: "tempoProgress",
      question: "Does increasing tempo always mean better progress?",
      options: [
        { value: "yes", label: "Yes, faster is always better", correct: false },
        { value: "no", label: "No — only once accuracy is comfortably maintained", correct: true },
        { value: "sometimes", label: "Only for advanced singers", correct: false },
      ],
      explain: { yes: "Not quite — speed without accuracy isn't real progress.", no: "Exactly right.", sometimes: "Not quite — this applies to every learner at this stage." },
    },
    {
      key: "ragaClaim",
      question: "Are the Sa-Ri-Ga-style patterns in this class full ragas or formal compositions?",
      options: [
        { value: "yes", label: "Yes, each is a named raga", correct: false },
        { value: "no", label: "No — they're beginner practice patterns", correct: true },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — none of these patterns are presented as ragas.", no: "Exactly right.", unsure: "It does say — the theory section states this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodAgility", label: "I understand what vocal agility means." },
    { key: "triedSimple", label: "I tried at least one simple pattern (two-note, three-note, or four-note)." },
    { key: "triedAdvanced", label: "I tried at least one of ascending/descending, repeated-note, or variation." },
    { key: "triedTempo", label: "I tried the gradual tempo increase, or chose to stay slow." },
    { key: "stayedRelaxed", label: "I kept my voice relaxed throughout." },
    { key: "reflected", label: "I reflected on which pattern felt most difficult." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    notesClear: { question: "Were the notes clear?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    movedComfortably: { question: "Could I move between notes comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    lostAccuracy: { question: "Did I lose accuracy when increasing speed?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Didn't increase speed")] },
    hardestPattern: {
      question: "Which pattern was most difficult?",
      options: [opt("two", "Two-note"), opt("three", "Three-note"), opt("four", "Four-note"), opt("updown", "Ascending/descending"), opt("repeated", "Repeated-note"), opt("variation", "Melodic variation"), opt("notsure", "Not sure")],
    },
    relaxed: { question: "Did I maintain a relaxed voice?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_UP * STEP, fallback));
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

  function ladderHtml(swaras, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-3">
      ${swaras.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-base ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${SWARA_LABEL[s]}</span>
        </div>`).join("")}
    </div>`;
  }

  const FIELD = (label, value) => `<p class="text-xs text-ink-300 leading-relaxed"><span class="text-ink-500 uppercase tracking-wide text-[10px]">${label}:</span> ${value}</p>`;
  function exerciseCardHtml(ex) {
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4" data-exercise-card="${ex.key}">
      <p class="font-display text-lg text-ink-50 mb-2">${ex.title}</p>
      <div data-pattern-ladder="${ex.key}">${ladderHtml(ex.swaras)}</div>
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
      ["Trying to sing fast before the pattern feels comfortable slowly", "Stay slow until the pattern feels easy, then increase tempo gradually."],
      ["Sliding between notes instead of singing each one clearly", "Aim for clear, distinct notes, even at a slow tempo."],
      ["Pushing volume to reach the higher notes in a pattern", "Keep the volume comfortable throughout — agility isn't about power."],
      ["Treating these patterns as named ragas or finished compositions", "These are simple beginner practice patterns only."],
      ["Practising through tension or fatigue to 'get it right'", "Rest and return later — a relaxed voice matters more than finishing today."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["tempoTake", "Gradual tempo increase"], ["applyTake", "Melodic agility application"]];
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 18 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Smooth first, fast later.</p>
        <p class="text-sm text-ink-300">A slow, accurate pattern is worth more than a fast, unclear one.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 19 — Tone Consistency and Vocal Endurance</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores comfortable, consistent tone across your range and over slightly longer phrases.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Vocal agility is moving between notes with control — not simply singing fast.</h3>
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
    const tempoKey = A(rec, "tempo").selected || "slow";

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("recap", 1, "Section A — Recap", `
          ${narrow(p("Class 15 explored controlled range development, Class 16 explored sustained notes, and Class 17 explored vocal dynamics. A gentle warm-up before today's agility work:"))}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-recap class="vr-btn">${icon("play", "w-4 h-4")} Gentle warm-up</button>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Understanding vocal agility", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Melodic movement means moving from one note to another.", "Stepwise movement is to a nearby note; a larger jump skips several notes.", "Accuracy is more important than speed.", "Repetition develops coordination over time.", "Start slowly — speed comes later, once the pattern feels easy."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
        `)}

        ${chapter("exercises", 3, "Section C — Guided exercises", `
          ${narrow(p("All six patterns are built from your own chosen Sa — choose a comfortable Sa on the piano below. These are beginner practice patterns, not named ragas or formal compositions."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vad-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("tempo", 4, "Section D — Interactive practice: gradual tempo increase", `
          ${narrow(p("Using Exercise 2's three-note pattern (Sa–Ri–Ga–Ri–Sa), choose a tempo. Only move to a faster tempo once the slower one feels comfortable and accurate."))}
          <div class="flex flex-wrap gap-2 mb-4" data-tempo-buttons>
            ${TEMPOS.map((t) => `<button type="button" data-tempo-select="${t.key}" class="ex-chip ${tempoKey === t.key ? "is-selected" : ""}">${t.label}</button>`).join("")}
          </div>
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-tempo class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen at this tempo</button>
          </div>
          ${recCard("tempoTake", "Singing the pattern at your chosen tempo", "Entirely optional.", 15)}
        `)}

        ${chapter("apply", 5, "Section E — Practical application", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Listen.", "Sing slowly.", "Repeat accurately.", "Increase speed slightly.", "Compare the result."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-apply class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
          </div>
          ${recCard("applyTake", "The melodic agility application", "Entirely optional.", 15)}
        `)}

        ${chapter("record", 6, "Section F — Recording and self-assessment", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("notesClear-q", { ...Q.notesClear, selected: sel("notesClear") })}
              ${SelfAssessment.render("movedComfortably-q", { ...Q.movedComfortably, selected: sel("movedComfortably") })}
              ${SelfAssessment.render("lostAccuracy-q", { ...Q.lostAccuracy, selected: sel("lostAccuracy") })}
              ${SelfAssessment.render("hardestPattern-q", { ...Q.hardestPattern, selected: sel("hardestPattern") })}
              ${SelfAssessment.render("relaxed-q", { ...Q.relaxed, selected: sel("relaxed") })}
            </div>
          `)}
        `)}

        ${chapter("quiz", 7, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 8, "Section G — Reflection and completion", `
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

        ${chapter("complete", 9, "Common beginner mistakes", problems())}

        ${chapter("complete", 10, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vad", { placeholder: "e.g. Which pattern felt most difficult... Whether I increased tempo comfortably... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Don't force high or low notes or sing through fatigue. Rest between exercises, and never increase tempo past what feels comfortable and accurate.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort. If discomfort repeatedly occurs, seek guidance from a qualified voice professional.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 12, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 13, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
      PianoSynth.playSequence(swaraNotes(base(), ["sa", "ri", "sa"]), { duration: 0.6, gap: 0.2 });
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

    /* ---- Section C: piano + exercise playback with ladder highlighting ---- */
    own(VirtualPiano.wire(container, "vad-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + MAX_UP * STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (!ex) return;
      const host = $(`[data-pattern-ladder="${ex.key}"]`);
      PianoSynth.playSequence(swaraNotes(base(), ex.swaras), {
        duration: 0.6, gap: 0.2,
        onNote: (i) => { if (host) host.innerHTML = ladderHtml(ex.swaras, i); },
      });
    }
    container.addEventListener("click", onPlayEx);
    cleanups.push(() => container.removeEventListener("click", onPlayEx));

    /* ---- Section D: tempo selector + playback ---- */
    function onTempoSelect(e) {
      const btn = e.target.closest("[data-tempo-select]");
      if (!btn) return;
      set("tempo", "selected", btn.dataset.tempoSelect);
      container.querySelectorAll("[data-tempo-select]").forEach((b) => b.classList.toggle("is-selected", b === btn));
    }
    function onPlayTempo(e) {
      if (!e.target.closest("[data-play-tempo]")) return;
      const key = A(rec0(), "tempo").selected || "slow";
      const t = TEMPOS.find((x) => x.key === key) || TEMPOS[0];
      PianoSynth.playSequence(swaraNotes(base(), TEMPO_PATTERN), { duration: t.duration, gap: t.gap });
    }
    container.addEventListener("click", onTempoSelect);
    container.addEventListener("click", onPlayTempo);
    cleanups.push(() => container.removeEventListener("click", onTempoSelect));
    cleanups.push(() => container.removeEventListener("click", onPlayTempo));

    /* ---- Section E: application playback ---- */
    function onPlayApply(e) {
      if (!e.target.closest("[data-play-apply]")) return;
      PianoSynth.playSequence(swaraNotes(base(), ["sa", "ri", "ga", "ri", "sa"]), { duration: 0.5, gap: 0.15 });
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

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const EX_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...EX_NAMES, tempoTake: "Gradual tempo increase", applyTake: "Melodic agility application" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: 15,
        meta: { name: `Level 2, Class 18 — ${NAMES[k]}`, exercise: `vocal-agility-development-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Section F: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "notesClear-q": "notesClear", "movedComfortably-q": "movedComfortably", "lostAccuracy-q": "lostAccuracy", "hardestPattern-q": "hardestPattern", "relaxed-q": "relaxed" };
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
    own(PersonalNotes.wire(container, "notes-vad", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Vocal agility is moving between notes with control — accuracy and comfort come first, speed develops later.",
        struggled: "",
        toPractice: "",
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
