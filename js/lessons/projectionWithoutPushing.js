/* ============================================================
   LEVEL 2, CLASS 13 — PROJECTION WITHOUT PUSHING
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "projection-without-pushing".

   Curriculum identity: Level 2, Class 13 (`number: 13`, `levelId: 2`
   in data.js, explicit id `L2C09` — unchanged since the Level 2
   Curriculum Upgrade). Rebuilt against this class's own later, more
   detailed spec (a gentle preparation section, six named guided
   exercises each with purpose/instructions/repetitions/rest/
   listening-focus/mistakes, a practical projection routine, a two-
   intensity recording activity, a musical application at three
   intensities, and a 5-question knowledge check) — supersedes the
   shorter version first written earlier in the project. Last of a
   combined rebuild alongside Classes 9, 10 and 12.

   Core idea: vocal projection means being heard clearly for the
   situation — not shouting. Clarity comes from articulation, vowel
   shape, vocal coordination and appropriate volume, not from forcing
   more air or tightening the throat. Room acoustics and microphone
   placement also affect perceived loudness — vocal effort isn't
   always the solution to an acoustic problem.

   Honesty boundaries, matching every earlier class: no fabricated
   automatic projection measurement; completion never depends on
   achieving maximum loudness, a recording, or finishing every
   optional activity.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress.
   ============================================================ */

const ProjectionWithoutPushingLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "exercises", label: "Exercises" },
    { id: "practice", label: "Practice" },
    { id: "record", label: "Record" },
    { id: "apply", label: "Apply" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";

  const EXERCISES = [
    {
      key: "speak", title: "Exercise 1 — Speak a short phrase naturally", degrees: null,
      purpose: "Establish a natural, comfortable speaking baseline.",
      instructions: `Say “${SENTENCE}” naturally, at your normal speaking volume.`,
      repetitions: "Once or twice.", rest: "Rest briefly.",
      listening: "Notice your natural volume and clarity.", mistakes: "Speaking more loudly than usual because you're being recorded.",
    },
    {
      key: "articulate", title: "Exercise 2 — Repeat with clear articulation", degrees: null,
      purpose: "Notice how articulation alone changes clarity, without changing volume.",
      instructions: "Say the same phrase again, at the same volume, but with slightly clearer articulation.",
      repetitions: "Once or twice.", rest: "Rest briefly.",
      listening: "Notice whether clarity improves even though the volume hasn't changed.", mistakes: "Increasing volume instead of articulation.",
    },
    {
      key: "singGently", title: "Exercise 3 — Sing the same phrase gently", degrees: [0],
      purpose: "Carry the same clarity into gentle singing.",
      instructions: "Sing the same phrase gently on a comfortable note.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice whether the phrase stays as clear when sung as when spoken.", mistakes: "Singing louder than needed to 'perform' the phrase.",
    },
    {
      key: "focused", title: "Exercise 4 — A slightly more focused sound", degrees: [0],
      purpose: "Explore a touch more clarity and focus, without increasing strain.",
      instructions: "Sing the phrase again, with a slightly more focused, clear sound — not louder, just clearer.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice whether this feels like more effort or just more focus.", mistakes: "Tightening the throat to feel 'more focused'.",
    },
    {
      key: "farther", title: "Exercise 5 — As if communicating with someone farther away", degrees: [0],
      purpose: "Explore natural, comfortable projection — not shouting.",
      instructions: "Sing the phrase as if speaking to someone a little farther away than usual — still comfortable, never straining.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice whether clarity and comfortable intensity increase together, naturally.", mistakes: "Treating 'farther away' as permission to shout.",
    },
    {
      key: "compare", title: "Exercise 6 — Compare comfortable projection with shouting", degrees: null,
      purpose: "Hear the difference between comfortable projection and shouting, directly.",
      instructions: "If comfortable, briefly compare a gentle shout with your comfortably projected version from Exercise 5 — notice the difference, don't repeat the shout.",
      repetitions: "Once, briefly.", rest: "Rest afterward.",
      listening: "Notice how shouting feels different in the throat compared to comfortable projection.", mistakes: "Repeating the shouted version more than once.",
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "whatIsProjection",
      question: "What does vocal projection mean?",
      options: [
        { value: "shout", label: "Shouting as loudly as possible", correct: false },
        { value: "heard", label: "Being heard clearly for the situation", correct: true },
        { value: "highnote", label: "Singing the highest note you can", correct: false },
      ],
      explain: { shout: "Not quite — projection isn't the same as shouting.", heard: "Exactly right.", highnote: "Not quite — projection is about clarity, not pitch." },
    },
    {
      key: "louder",
      question: "Does louder always mean better?",
      options: [
        { value: "yes", label: "Yes, louder is always better", correct: false },
        { value: "no", label: "No — a louder sound is not automatically a better sound", correct: true },
        { value: "sometimes", label: "Only in a large room", correct: false },
      ],
      explain: { yes: "Not quite — loudness alone doesn't improve projection.", no: "Right.", sometimes: "Not quite — this holds regardless of room size." },
    },
    {
      key: "helps",
      question: "What helps a voice carry, besides volume?",
      options: [
        { value: "articulation", label: "Clear articulation and vocal efficiency", correct: true },
        { value: "nothing", label: "Nothing — volume is the only factor", correct: false },
        { value: "shouting", label: "Shouting as much as possible", correct: false },
      ],
      explain: { articulation: "Exactly right.", nothing: "Not quite — articulation and efficiency matter a great deal.", shouting: "Not quite — shouting tends to reduce sound quality, not help it carry." },
    },
    {
      key: "acoustics",
      question: "Do room acoustics and microphone placement affect perceived loudness?",
      options: [
        { value: "yes", label: "Yes, they genuinely affect how audible a singer sounds", correct: true },
        { value: "no", label: "No, only vocal effort matters", correct: false },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Exactly right.", no: "Not quite — acoustics and microphone placement matter too.", unsure: "It does say — Section A states this explicitly." },
    },
    {
      key: "throatPressure",
      question: "Is increasing throat pressure healthy projection?",
      options: [
        { value: "yes", label: "Yes, more pressure means more projection", correct: false },
        { value: "no", label: "No — increasing throat pressure is not healthy projection", correct: true },
        { value: "sometimes", label: "Only for advanced singers", correct: false },
      ],
      explain: { yes: "Not quite — throat pressure works against healthy projection.", no: "Exactly right.", sometimes: "Not quite — this applies to every singer." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodProjection", label: "I understand what vocal projection means, and that it isn't shouting." },
    { key: "triedExercise", label: "I tried at least one guided exercise." },
    { key: "triedRoutine", label: "I practised the projection routine, or chose to skip it." },
    { key: "recordedTwoIntensities", label: "I recorded the same phrase at two intensities, or chose not to record." },
    { key: "stayedComfortable", label: "I kept the sound comfortable and avoided forcing it." },
    { key: "reflected", label: "I reflected on whether increasing intensity reduced sound quality." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    clearPronunciation: { question: "Is the pronunciation clear?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    comfortable: { question: "Is the sound comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    throatTight: { question: "Did the throat become tight?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    qualityReduced: { question: "Did increasing loudness reduce sound quality?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    stillNatural: { question: "Was the phrase still natural?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
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

  function problems() {
    const items = [
      ["Increasing throat pressure to sound louder", "Projection comes from clarity and coordination, not throat pressure."],
      ["Assuming projection means shouting", "Comfortable clarity, not raw loudness, is the goal."],
      ["Forcing more air to 'push' the sound out", "Comfortable, natural breath support is enough."],
      ["Ignoring room acoustics or microphone placement", "These genuinely affect how audible you sound — vocal effort isn't the only factor."],
      ["Repeating the shouting comparison multiple times", "Once is enough to notice the difference — don't repeat it."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["routineTake", "Projection routine"], ["intensityOneTake", "Phrase, first intensity"], ["intensityTwoTake", "Phrase, second intensity"], ["applyTake", "Musical application"]];
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 13 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Clarity, not loudness.</p>
        <p class="text-sm text-ink-300">Projection means being heard clearly for the situation — never shouting.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 14 — Register Transitions and Coordination</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores how the voice travels across its range, and how to practise that journey gently.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Vocal projection is about being heard clearly for the situation — not shouting.</h3>
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

        ${chapter("understand", 1, "Section A — Understanding projection", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Vocal projection means being heard clearly for the situation — not shouting.", "A louder sound is not automatically a better sound.", "Vocal efficiency and clear articulation help a voice carry.", "Increasing throat pressure is not healthy projection.", "Room acoustics and microphone placement also affect how audible a singer sounds."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Section B — Preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Find a comfortable standing or sitting posture.", "Relax your shoulders and jaw.", "Breathe gently, with awareness — nothing forceful.", "Hum lightly for a moment.", "Say a short, comfortable phrase."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-3">No forceful breathing exercises today.</p>
          `)}
        `)}

        ${chapter("exercises", 3, "Section C — Guided exercises", `
          ${narrow(p("Some exercises share one comfortable reference note — choose it on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("pwp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("practice", 4, "Section D — Practical projection routine", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Natural speaking volume.", "Comfortable singing volume.", "Clear and focused articulation.", "Slightly stronger but still comfortable singing."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mb-4">The goal is clarity and ease, not maximum loudness.</p>
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-routine class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("routineTake", "The practical projection routine", "Entirely optional.", 20)}
        `)}

        ${chapter("record", 5, "Section E — Recording activity", `
          ${narrow(p("Record the same phrase at two comfortable intensities."))}
          ${recCard("intensityOneTake", "The phrase, first comfortable intensity", "", 12)}
          ${recCard("intensityTwoTake", "The phrase, second comfortable intensity", "", 12)}
          <div data-review-host class="mt-2">${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("clearPronunciation-q", { ...Q.clearPronunciation, selected: sel("clearPronunciation") })}
              ${SelfAssessment.render("comfortable-q", { ...Q.comfortable, selected: sel("comfortable") })}
              ${SelfAssessment.render("throatTight-q", { ...Q.throatTight, selected: sel("throatTight") })}
              ${SelfAssessment.render("qualityReduced-q", { ...Q.qualityReduced, selected: sel("qualityReduced") })}
              ${SelfAssessment.render("stillNatural-q", { ...Q.stillNatural, selected: sel("stillNatural") })}
            </div>
          `)}
        `)}

        ${chapter("apply", 6, "Section F — Musical application", `
          ${narrow(p("Sing a simple original phrase or melody-like pattern with gentle intensity, then comfortable medium intensity, then natural expressive emphasis — never forcing loud singing."))}
          ${recCard("applyTake", "The phrase at three intensities", "Entirely optional.", 20)}
        `)}

        ${chapter("quiz", 7, "Section G — Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 8, "Reflection and completion", `
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
          ${PersonalNotes.render("notes-pwp", { placeholder: "e.g. Whether clarity changed with intensity... Any tension I noticed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Never force high or low notes, and never shout or apply excessive vocal pressure. Avoid prolonged or exhausting exercises, and rest between them.")}
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
    own(VirtualPiano.wire(container, "pwp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (ex && ex.degrees) PianoSynth.playSequence(degreesToNotes(base(), ex.degrees), { duration: 0.9, gap: 0.3 });
    }
    container.addEventListener("click", onPlayEx);
    cleanups.push(() => container.removeEventListener("click", onPlayEx));

    /* ---- Section D: routine playback ---- */
    function onPlayRoutine(e) {
      if (!e.target.closest("[data-play-routine]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
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
    const NAMES = { ...EX_NAMES, routineTake: "Projection routine", intensityOneTake: "Phrase, first intensity", intensityTwoTake: "Phrase, second intensity", applyTake: "Musical application" };
    const REVIEW_KEYS = ["intensityOneTake", "intensityTwoTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "routineTake" || k === "applyTake" ? 20 : (k.startsWith("intensity") ? 12 : 15),
        meta: { name: `Level 2, Class 13 — ${NAMES[k]}`, exercise: `projection-without-pushing-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); if (REVIEW_KEYS.includes(k)) refreshReviewHost(); },
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
    const assessMap = { "clearPronunciation-q": "clearPronunciation", "comfortable-q": "comfortable", "throatTight-q": "throatTight", "qualityReduced-q": "qualityReduced", "stillNatural-q": "stillNatural" };
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
    own(PersonalNotes.wire(container, "notes-pwp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vocal projection means being heard clearly for the situation, not shouting — clarity and comfortable coordination matter more than raw loudness.",
        struggled: q(rec, "throatTight") === "yes" || q(rec, "throatTight") === "alittle" ? "Noticed some throat tension." : "",
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
