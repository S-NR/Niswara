/* ============================================================
   LEVEL 2, CLASS 10 — INTRODUCTION TO MIXED COORDINATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "intro-mixed-coordination".

   Curriculum identity: Level 2, Class 10 (`number: 10`, `levelId: 2`
   in data.js, explicit id `L2C06` — unchanged since the Level 2
   Curriculum Upgrade). Rebuilt against this class's own later, more
   detailed spec (a named recap, seven guided exercises each with
   purpose/instructions/repetitions/rest/listening-focus/mistakes, a
   coordination-practice routine, a practical application that may
   optionally use the learner's own comfortable Sa and a simple swara
   pattern, and a 5-question knowledge check) — supersedes the
   shorter version first written earlier in the project. Part of a
   combined rebuild alongside Classes 9, 12 and 13.

   Core idea: "mix" describes coordination that balances qualities
   commonly associated with chest and head voice — not a literal
   50/50 combination, and not the same as a specific Carnatic swara or
   fixed Western pitch. Vocal registers and coordination are a
   separate idea from swara positions, which describe pitch relative
   to the learner's own chosen Sa. No single sensation proves a
   singer is using mixed voice, and it should never be forced.

   Honesty boundaries, matching every earlier class: no fabricated
   mixed-voice detection or automatic coordination analysis;
   completion never depends on achieving a recognisable "mixed" sound.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PianoSynth.playSequence (relative-degree patterns,
   shared across all seven exercises, the routine, and the optional
   swara-labelled pattern), RecordingCard, SelfAssessment,
   PersonalNotes, ClassProgress.
   ============================================================ */

const IntroMixedCoordinationLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "understand", label: "Understand" },
    { id: "exercises", label: "Exercises" },
    { id: "practice", label: "Practice" },
    { id: "apply", label: "Apply" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 3;
  const SWARA_SEMITONE = { sa: 0, ri: 2, ga: 4 };
  const SWARA_LABEL = { sa: "Sa", ri: "Ri", ga: "Ga" };

  const EXERCISES = [
    {
      key: "hum", title: "Exercise 1 — Gentle humming", degrees: [0],
      purpose: "Settle into a light, easy sound before exploring coordination.",
      instructions: "Hum gently on a comfortable note for a few seconds.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the hum feels easy and light.", mistakes: "Humming too loudly or too low.",
    },
    {
      key: "ng", title: "Exercise 2 — Comfortable “ng” sound", degrees: [0],
      purpose: "Explore a forward, light placement often used to find a connected sound.",
      instructions: "Say “ng” (as in “sing”) gently, then sustain it briefly on a comfortable note.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the sound feels forward and light rather than heavy.", mistakes: "Pushing the “ng” to sound more resonant.",
    },
    {
      key: "ooGlide", title: "Exercise 3 — Gentle “oo” glide", degrees: [0, 1, 0],
      purpose: "Carry that light coordination through a small pitch glide.",
      instructions: "Glide gently on “oo” across a small, comfortable pitch range.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the light quality stays consistent as pitch moves.", mistakes: "Widening the range too much.",
    },
    {
      key: "siren", title: "Exercise 4 — Small-range siren", degrees: [0, 1, 2, 1, 0],
      purpose: "Explore a slightly wider, still-gentle glide.",
      instructions: "On a comfortable “oo” or “ng”, glide smoothly up and back down across a small range — like a gentle siren.",
      repetitions: "One or two attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the glide stays smooth, or where it feels less stable.", mistakes: "Making the siren too wide or too fast.",
    },
    {
      key: "speechToSong", title: "Exercise 5 — Speech-like sound moving into singing", degrees: [0],
      purpose: "Connect a natural, speech-like quality with gentle singing.",
      instructions: "Speak a short phrase naturally and lightly, then sing it gently on a comfortable note.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice how the speech-like quality carries (or doesn't) into singing.", mistakes: "Exaggerating the shift from speech to song.",
    },
    {
      key: "threeNote", title: "Exercise 6 — Simple three-note patterns", degrees: [0, 1, 2, 1, 0],
      purpose: "Practise the light coordination across a short pattern.",
      instructions: "Sing a gentle three-note pattern, up and back down, on “oo” or “ng”.",
      repetitions: "A few comfortable repetitions.", rest: "Rest between repetitions.",
      listening: "Notice whether the tone stays light and consistent across the pattern.", mistakes: "Rushing through the notes.",
    },
    {
      key: "melodic", title: "Exercise 7 — Light, comfortable melodic patterns", degrees: [0, 2, 1, 0],
      purpose: "Apply the same light coordination to a slightly more melodic shape.",
      instructions: "Sing a short, simple melodic pattern gently, keeping the sound light throughout.",
      repetitions: "A few comfortable repetitions.", rest: "Rest between repetitions.",
      listening: "Notice whether the pattern feels connected, not pieced together.", mistakes: "Pushing volume to make the pattern feel more 'complete'.",
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIsMix",
      question: "What do singers commonly mean by mixed voice or mixed coordination?",
      options: [
        { value: "loud", label: "Singing as loudly as possible in chest voice", correct: false },
        { value: "balance", label: "A broad term for coordination that balances chest- and head-voice qualities", correct: true },
        { value: "split", label: "An exact 50/50 split, measurable in a recording", correct: false },
      ],
      explain: { loud: "Not quite — mixed coordination isn't about loudness.", balance: "Exactly right.", split: "Not quite — it's not a literal, measurable split." },
    },
    {
      key: "loud",
      question: "Is mixed coordination simply singing loudly?",
      options: [
        { value: "yes", label: "Yes", correct: false },
        { value: "no", label: "No — it's about balance and connection, not volume", correct: true },
        { value: "sometimes", label: "Only on higher notes", correct: false },
      ],
      explain: { yes: "Not quite — volume isn't the point here.", no: "Right.", sometimes: "Not quite — this holds at every pitch." },
    },
    {
      key: "sensation",
      question: "Does one single sensation prove you're using mixed voice?",
      options: [
        { value: "yes", label: "Yes, there's one definitive sensation", correct: false },
        { value: "no", label: "No — no single sensation proves it, and sensations vary between singers", correct: true },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — there's no single proof-sensation.", no: "Exactly right.", unsure: "It does say — Section B is explicit about this." },
    },
    {
      key: "force",
      question: "Should mixed coordination be forced or rushed in one lesson?",
      options: [
        { value: "yes", label: "Yes, with enough effort", correct: false },
        { value: "no", label: "No — it develops gradually through consistent, comfortable practice", correct: true },
        { value: "sometimes", label: "Only if the learner is advanced", correct: false },
      ],
      explain: { yes: "Not quite — forcing works against comfortable coordination.", no: "Right.", sometimes: "Not quite — this applies to every learner." },
    },
    {
      key: "swara",
      question: "Is mixed voice the same as a specific Carnatic swara or fixed Western pitch?",
      options: [
        { value: "yes", label: "Yes, it corresponds to one specific swara", correct: false },
        { value: "no", label: "No — vocal registers and coordination are a separate idea from swara positions", correct: true },
        { value: "sometimes", label: "Only when using a comfortable Sa", correct: false },
      ],
      explain: { yes: "Not quite — mixed coordination isn't tied to any particular swara.", no: "Exactly right.", sometimes: "Not quite — this is true regardless of which Sa you choose." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodMix", label: "I understand what mixed voice or mixed coordination means." },
    { key: "triedGentle", label: "I tried at least one gentle exercise (humming, “ng”, “oo” glide, or siren)." },
    { key: "triedPattern", label: "I tried at least one pattern exercise (speech-to-song, three-note, or melodic)." },
    { key: "triedRoutine", label: "I practised the coordination routine, or chose to skip it." },
    { key: "avoidedForcing", label: "I avoided forcing volume or rushing the coordination." },
    { key: "reflected", label: "I reflected on which exercise felt easiest." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    comfortable: { question: "Was the sound comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    pushedVolume: { question: "Did I push for volume?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    tensionFree: { question: "Could I move between notes without excessive tension?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    abruptChange: { question: "Did I notice an abrupt register change?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    easiestExercise: {
      question: "Which exercise felt easiest?",
      options: [opt("hum", "Humming"), opt("ng", "“Ng” sound"), opt("oo", "“Oo” glide"), opt("siren", "Siren"), opt("speech", "Speech-to-song"), opt("three", "Three-note pattern"), opt("melodic", "Melodic pattern")],
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
    for (const id of ["L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
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
      ["Chasing a specific 'mixed voice' sound", "Focus on comfort and consistency instead — the sound develops over time."],
      ["Singing loudly to feel more connected", "Keep the sound light; volume doesn't create mixed coordination."],
      ["Forcing a particular sensation because someone else described one", "Sensations vary between singers — trust your own comfort."],
      ["Rushing through all seven exercises in one sitting", "A few comfortable exercises, done well, are enough for today."],
      ["Assuming a comfortable Sa or swara pattern defines mixed voice", "Registers and swara positions are separate ideas — don't confuse them."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["routineTake", "Coordination practice routine"], ["applyTake", "Melody-like application"]];
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 10 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Exploring coordination, not chasing a sound.</p>
        <p class="text-sm text-ink-300">No single sensation proves mixed voice — comfort and repeatability matter more.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 11 — Vowel Modification Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores how vowel shape affects vocal tone and clarity.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Mixed coordination is a broad teaching term — not a 50/50 split, not proof via any single sensation.</h3>
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
          ${narrow(p("Chest voice, head voice, and connecting chest and head voice have all explored different vocal coordination patterns. This class introduces mixed coordination — a gentle warm-up first."))}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-recap class="vr-btn">${icon("play", "w-4 h-4")} Gentle warm-up</button>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Understanding mixed coordination", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["'Mix' or 'mixed coordination' describes balancing qualities commonly associated with chest and head voice.", "It's useful because it supports a more connected sound across your range.", "It relates directly to the register transitions explored in earlier classes.", "Different teachers may use slightly different terminology for this idea.", "There is no single sensation that proves a singer is using mixed voice."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-sm text-ink-300 leading-relaxed">You're exploring coordination here — not trying to produce a powerful, professional mixed voice immediately.</p>
          `)}
        `)}

        ${chapter("exercises", 3, "Section C — Guided exercises", `
          ${narrow(p("All seven exercises share one comfortable reference note — choose it on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("imc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("practice", 4, "Section D — Coordination practice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["A light, comfortable sound.", "Smooth movement across a small range.", "Consistent tone without pushing.", "Gradual repetition.", "A relaxed jaw and throat."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mb-4">No excessive breath pressure, shouting, throat constriction, or deliberate vocal strain.</p>
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-routine class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the routine</button>
          </div>
          ${recCard("routineTake", "The coordination practice routine", "Entirely optional.", 20)}
        `)}

        ${chapter("apply", 5, "Section E — Practical application", `
          ${narrow(p("A simple melody-like exercise using comfortable notes and syllables. If you'd like, you can use the same swara-style labels from Classes 3-6, built from this same reference note (or your own chosen Sa) — the swara names here are just labels, not a claim that mixed voice equals any particular swara."))}
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-apply="numbers" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen: 1–3–2–1</button>
            <button type="button" data-play-apply="swara" class="vr-btn">${icon("play", "w-4 h-4")} Listen: Sa–Ga–Ri–Sa</button>
          </div>
          ${recCard("applyTake", "Singing the melody-like application", "Entirely optional.", 15)}
        `)}

        ${chapter("record", 6, "Section F — Recording and evaluation", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account. This app cannot automatically detect a 'mixed voice' sound."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("comfortable-q", { ...Q.comfortable, selected: sel("comfortable") })}
              ${SelfAssessment.render("pushedVolume-q", { ...Q.pushedVolume, selected: sel("pushedVolume") })}
              ${SelfAssessment.render("tensionFree-q", { ...Q.tensionFree, selected: sel("tensionFree") })}
              ${SelfAssessment.render("abruptChange-q", { ...Q.abruptChange, selected: sel("abruptChange") })}
              ${SelfAssessment.render("easiestExercise-q", { ...Q.easiestExercise, selected: sel("easiestExercise") })}
            </div>
          `)}
        `)}

        ${chapter("quiz", 7, "Section G — Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 8, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on achieving a recognisable 'mixed' sound.")}
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
          ${PersonalNotes.render("notes-imc", { placeholder: "e.g. Which exercise felt easiest... Whether I noticed an abrupt change... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Never force high or low notes, and never shout. Avoid excessive breath pressure or throat constriction. Rest between exercises.")}
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
      PianoSynth.playSequence(degreesToNotes(base(), [0, 1, 0]), { duration: 0.6, gap: 0.2 });
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

    /* ---- Section C: piano + exercise playback ---- */
    own(VirtualPiano.wire(container, "imc-piano", {
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

    /* ---- Section D: routine playback ---- */
    function onPlayRoutine(e) {
      if (!e.target.closest("[data-play-routine]")) return;
      PianoSynth.playSequence(degreesToNotes(base(), [0, 1, 2, 1, 0]), { duration: 0.6, gap: 0.25 });
    }
    container.addEventListener("click", onPlayRoutine);
    cleanups.push(() => container.removeEventListener("click", onPlayRoutine));

    /* ---- Section E: application playback (numbers vs swara labels, same intervals) ---- */
    function onPlayApply(e) {
      const btn = e.target.closest("[data-play-apply]");
      if (!btn) return;
      PianoSynth.playSequence(degreesToNotes(base(), [0, 2, 1, 0]), { duration: 0.6, gap: 0.25 });
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
    const NAMES = { ...EX_NAMES, routineTake: "Coordination practice routine", applyTake: "Melody-like application" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "applyTake" ? 15 : (k === "routineTake" ? 20 : 15),
        meta: { name: `Level 2, Class 10 — ${NAMES[k]}`, exercise: `intro-mixed-coordination-${k}` },
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
    const assessMap = { "comfortable-q": "comfortable", "pushedVolume-q": "pushedVolume", "tensionFree-q": "tensionFree", "abruptChange-q": "abruptChange", "easiestExercise-q": "easiestExercise" };
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
    own(PersonalNotes.wire(container, "notes-imc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Mixed coordination is a broad teaching term for balancing chest- and head-voice qualities — no single sensation proves it, and it shouldn't be forced.",
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
