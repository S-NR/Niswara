/* ============================================================
   LEVEL 2, CLASS 12 — RESONANCE AND TONE COLOUR
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "resonance-tone-colour".

   Curriculum identity: Level 2, Class 12 (`number: 12`, `levelId: 2`
   in data.js, explicit id `L2C08` — unchanged since the Level 2
   Curriculum Upgrade). Rebuilt against this class's own later, more
   detailed spec — explicitly NOT a repeat of Class 2's introductory
   resonance theory, but a practical build on it: bright/warm/light/
   dark as descriptive listening terms, six guided exercises, an
   interactive tone-exploration activity, a practical application
   comparing two tone colours on the same phrase, a 5-question
   knowledge check, and a 6-item checklist. Part of a combined
   rebuild alongside Classes 9, 10 and 13.

   Core idea: tone colour is influenced by vocal tract shape, mouth
   opening, tongue position, jaw relaxation and vowel shape — bright,
   warm, light and dark are descriptive listening terms, not rigid
   scientific categories or medical assessments. A brighter tone isn't
   automatically better than a warmer one; comfort and consistency
   matter more than imitating another singer's tone.

   Honesty boundaries, matching every earlier class: no fabricated
   tone-colour analysis; no claim that a real studio comparison
   recording exists (none does — the listening activity is learner-
   led, comparing the learner's own sounds, not a fabricated
   demonstration); completion never depends on achieving a particular
   tone colour.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress.
   ============================================================ */

const ResonanceToneColourLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "exercises", label: "Exercises" },
    { id: "explore", label: "Explore" },
    { id: "apply", label: "Apply" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;

  const TONE_LABELS = [
    { key: "bright", label: "Bright", desc: "A forward, clear quality — often associated with a smaller mouth opening and a more forward tongue position." },
    { key: "warm", label: "Warm", desc: "A rounder, fuller quality — often associated with a slightly more relaxed, open vocal tract." },
    { key: "light", label: "Light", desc: "An easy, less weighty quality — often associated with less overall vocal effort." },
    { key: "dark", label: "Dark", desc: "A deeper, more rounded quality — often associated with a lower tongue position and more space in the mouth." },
  ];

  const EXERCISES = [
    {
      key: "humObserve", title: "Exercise 1 — Gentle humming and observation", degrees: [0],
      purpose: "Notice your own natural tone without judging it.",
      instructions: "Hum gently on a comfortable note, and simply notice the quality of the sound.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the hum feels bright, warm, light or dark to you — none is more correct.",
      mistakes: "Trying to force a particular tone quality.",
    },
    {
      key: "humVowel", title: "Exercise 2 — Humming into an open vowel", degrees: [0],
      purpose: "Carry your natural tone from a hum into an open vowel.",
      instructions: "Hum gently, then open into a comfortable “ah”.",
      repetitions: "Two or three attempts.", rest: "Rest between attempts.",
      listening: "Notice whether the tone quality changes as you open into the vowel.",
      mistakes: "Opening the mouth too wide, too suddenly.",
    },
    {
      key: "ooAh", title: "Exercise 3 — Comfortable “oo” and “ah” comparison", degrees: [0],
      purpose: "Compare tone quality across two different vowels.",
      instructions: "Sing a comfortable “oo”, then a comfortable “ah”, on the same note.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice how the two vowels naturally differ in tone.",
      mistakes: "Trying to make both vowels sound identical.",
    },
    {
      key: "brightWarm", title: "Exercise 4 — Bright versus warm tone exploration", degrees: [0],
      purpose: "Explore two different tone colours on the same vowel.",
      instructions: "Sing a comfortable “ah”, first with a slightly brighter quality, then a slightly warmer one — small, natural adjustments only.",
      repetitions: "One or two attempts per quality.", rest: "Rest between attempts.",
      listening: "Notice the difference without judging one as better.",
      mistakes: "Exaggerating either quality until it feels forced.",
    },
    {
      key: "speakSing", title: "Exercise 5 — Natural speaking voice versus singing voice", degrees: [0],
      purpose: "Compare your tone quality between speaking and singing.",
      instructions: "Speak a short phrase naturally, then sing the same phrase gently on a comfortable note.",
      repetitions: "Once or twice.", rest: "Rest between attempts.",
      listening: "Notice what stays the same and what changes between speaking and singing.",
      mistakes: "Deliberately making the singing voice sound very different from the speaking voice.",
    },
    {
      key: "vowelMelody", title: "Exercise 6 — Simple vowel-based melodic pattern", degrees: [0, 1, 2, 1, 0],
      purpose: "Notice how tone colour holds up across a short melodic pattern.",
      instructions: "Sing a short, gentle melodic pattern on one comfortable vowel.",
      repetitions: "A few comfortable repetitions.", rest: "Rest between repetitions.",
      listening: "Notice whether the tone quality stays consistent across the pattern.",
      mistakes: "Pushing volume or pitch to make the pattern feel more impressive.",
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "labels",
      question: "What do bright, warm, light and dark describe in this class?",
      options: [
        { value: "scientific", label: "Rigid scientific categories", correct: false },
        { value: "descriptive", label: "Descriptive listening terms, not rigid categories or measurements", correct: true },
        { value: "medical", label: "A medical assessment of vocal health", correct: false },
      ],
      explain: { scientific: "Not quite — these are listening descriptions, not scientific categories.", descriptive: "Exactly right.", medical: "Not quite — this has nothing to do with vocal health assessment." },
    },
    {
      key: "influences",
      question: "What influences vocal tone colour?",
      options: [
        { value: "volume", label: "Only how loudly you sing", correct: false },
        { value: "shape", label: "Vocal tract shape, mouth opening, tongue position, jaw relaxation and vowel shape", correct: true },
        { value: "nothing", label: "Tone colour can't be influenced at all", correct: false },
      ],
      explain: { volume: "Not quite — tone colour isn't primarily about volume.", shape: "Exactly right.", nothing: "Not quite — tone colour genuinely changes with these factors." },
    },
    {
      key: "nasal",
      question: "Is resonance about pushing sound into the nose, chest or head?",
      options: [
        { value: "yes", label: "Yes, that's exactly what resonance means", correct: false },
        { value: "no", label: "No — that's not what this class teaches", correct: true },
        { value: "sometimes", label: "Only for a dark tone", correct: false },
      ],
      explain: { yes: "Not quite — this class explicitly avoids that framing.", no: "Right.", sometimes: "Not quite — this applies to every tone quality." },
    },
    {
      key: "better",
      question: "Is one tone colour universally better than another?",
      options: [
        { value: "yes", label: "Yes, bright is always best", correct: false },
        { value: "no", label: "No — a brighter tone isn't automatically better than a warmer one", correct: true },
        { value: "yes2", label: "Yes, warm is always best", correct: false },
      ],
      explain: { yes: "Not quite — no tone quality is universally better.", no: "Exactly right.", yes2: "Not quite — no tone quality is universally better." },
    },
    {
      key: "objective",
      question: "Are the tone-quality labels in this class objective measurements?",
      options: [
        { value: "yes", label: "Yes, they're precisely measurable", correct: false },
        { value: "no", label: "No — they're subjective listening descriptions", correct: true },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — this app doesn't measure tone colour.", no: "Exactly right.", unsure: "It does say — Section E states this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodLabels", label: "I understand what tone colour (bright/warm/light/dark) means as a listening description." },
    { key: "triedExercise", label: "I explored at least one guided exercise." },
    { key: "comparedTones", label: "I compared two tone qualities." },
    { key: "practisedTwoTones", label: "I practised a short phrase with two different tone colours." },
    { key: "stayedComfortable", label: "I maintained clear pronunciation and comfort throughout." },
    { key: "reflected", label: "I reflected on which tone felt most natural." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    mostNatural: { question: "Which tone quality felt most natural?", options: [opt("bright", "Bright"), opt("warm", "Warm"), opt("light", "Light"), opt("dark", "Dark"), opt("notsure", "Not sure")] },
    heardDifference: { question: "Could I hear a difference?", options: [opt("yes", "Yes", "good"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    clearPronunciation: { question: "Did I maintain clear pronunciation?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did I experience unnecessary tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    mostComfortable: { question: "Which version sounded most comfortable?", options: [opt("natural", "My natural tone"), opt("adjusted", "The adjusted tone"), opt("both", "Both, about equally"), opt("unsure", "Not sure")] },
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
    for (const id of ["L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
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
      <div class="flex flex-wrap gap-3 mb-3">
        <button type="button" data-play-ex="${ex.key}" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
      </div>
      ${recCard(`${ex.key}Take`, `Recording for ${ex.title.replace(/^Exercise \d+ — /, "")}`, "Entirely optional.", 15)}
      <div class="mt-2">${skipBtn(ex.key)}</div>
    </div>`;
  }

  function toneLabelsHtml(rec) {
    const selected = A(rec, "tone").selected;
    const t = TONE_LABELS.find((x) => x.key === selected);
    return `<div data-tone-labels>
      <div class="flex flex-wrap gap-2 mb-4">
        ${TONE_LABELS.map((x) => `<button type="button" data-tone-select="${x.key}" class="ex-chip ${selected === x.key ? "is-selected" : ""}">${x.label}</button>`).join("")}
      </div>
      ${t ? `<p class="text-sm text-ink-300 mb-3">${t.desc}</p>` : `<p class="text-sm text-ink-500 mb-3">Select a tone quality above to read about it and practise.</p>`}
    </div>`;
  }

  function problems() {
    const items = [
      ["Pushing sound into the nose to sound 'brighter'", "Explore brightness through vowel shape and tongue position, not nasal pushing."],
      ["Forcing the jaw down to sound 'darker'", "A relaxed, natural adjustment is enough."],
      ["Believing one tone colour is objectively correct", "These are listening descriptions, not a hierarchy."],
      ["Losing clear pronunciation while exploring a new tone", "Keep the words understandable throughout."],
      ["Comparing your tone to another singer's and judging it", "Your own natural tone is the starting point — not a flaw to fix."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [...EXERCISES.map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["exploreTake", "Tone exploration"], ["applyTake", "Two tone colours, applied"]];
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 12 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Your tone, noticed — not judged.</p>
        <p class="text-sm text-ink-300">Bright, warm, light and dark are listening words, not a ranking.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 13 — Projection Without Pushing</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores comfortable vocal clarity — being heard without shouting.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Bright, warm, light and dark are descriptive listening terms — never a ranking.</h3>
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
            ${p("Class 2 introduced resonance: the vocal tract shaping the sound your vocal folds produce. This class builds on that foundation practically — listening, exploring, and gently varying your own natural tone colour.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Understanding tone colour", `
          ${narrow(`
            <div class="flex flex-wrap gap-2 mb-4">${TONE_LABELS.map((t) => `<span class="flow-chip !text-sm">${t.label}</span>`).join("")}</div>
            ${p("These are descriptive listening terms, not rigid scientific categories. Tone colour is shaped by:")}
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
              ${["Vocal tract shape.", "Mouth opening.", "Tongue position.", "Jaw relaxation.", "Vowel shape."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-xs text-ink-500">Resonance isn't about pushing sound into the nose, chest or head.</p>
          `)}
        `)}

        ${chapter("listen", 3, "Section C — Listening activity", `
          ${narrow(p("No studio comparison recording exists in this app — this is a learner-led activity. Hum gently, then compare it with an open vowel, noticing differences in tone quality as you go."))}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
        `)}

        ${chapter("exercises", 4, "Section D — Guided exercises", `
          ${narrow(p("All six exercises share one comfortable reference note — choose it on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("rtc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("explore", 5, "Section E — Interactive tone exploration", `
          ${narrow(p("Select a tone-quality label, read about it, then practise and optionally record. These labels are subjective listening descriptions, not objective measurements."))}
          <div data-tone-labels-host>${toneLabelsHtml(rec)}</div>
          ${recCard("exploreTake", "Practising the selected tone quality", "Entirely optional.", 15)}
          ${narrow(`<div><label class="block text-sm text-ink-200 mb-1.5" for="rtc-notice">What did you notice?</label><textarea id="rtc-notice" data-growth="toneNotice" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.toneNotice || "")}</textarea></div>`)}
        `)}

        ${chapter("apply", 6, "Section F — Practical musical application", `
          ${narrow(p("Sing a short, comfortable phrase twice: first in your natural tone, then exploring a slightly different tone colour — without losing comfortable pronunciation or vocal ease. If you'd like, you can use a simple melody or swara pattern on your comfortable shruti instead of a spoken phrase."))}
          ${recCard("applyTake", "The phrase, sung with two tone colours", "Entirely optional.", 20)}
        `)}

        ${chapter("record", 7, "Section G — Recording and evaluation", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("mostNatural-q", { ...Q.mostNatural, selected: sel("mostNatural") })}
              ${SelfAssessment.render("heardDifference-q", { ...Q.heardDifference, selected: sel("heardDifference") })}
              ${SelfAssessment.render("clearPronunciation-q", { ...Q.clearPronunciation, selected: sel("clearPronunciation") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("mostComfortable-q", { ...Q.mostComfortable, selected: sel("mostComfortable") })}
            </div>
          `)}
        `)}

        ${chapter("quiz", 8, "Section H — Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 9, "Reflection and completion", `
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
          ${PersonalNotes.render("notes-rtc", { placeholder: "e.g. Which tone colour felt easiest... Whether I could hear a difference... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Vocal safety", `
          ${narrow(`
            ${p("Never force a particular tone colour, and don't push volume or pitch to sound 'brighter', 'darker', or more powerful. Rest between exercises.")}
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

    /* ---- Section C: reference note playback ---- */
    function onPlayPitch(e) {
      if (!e.target.closest("[data-play-pitch]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

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
    own(VirtualPiano.wire(container, "rtc-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (ex) PianoSynth.playSequence(degreesToNotes(base(), ex.degrees), { duration: 0.7, gap: 0.3 });
    }
    container.addEventListener("click", onPlayEx);
    cleanups.push(() => container.removeEventListener("click", onPlayEx));

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

    /* ---- Section E: tone-label selection ---- */
    function refreshToneLabelsHost() {
      const host = $("[data-tone-labels-host]");
      if (host) host.innerHTML = toneLabelsHtml(rec0());
    }
    function onToneSelect(e) {
      const btn = e.target.closest("[data-tone-select]");
      if (!btn) return;
      set("tone", "selected", btn.dataset.toneSelect);
      refreshToneLabelsHost();
    }
    container.addEventListener("click", onToneSelect);
    cleanups.push(() => container.removeEventListener("click", onToneSelect));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const EX_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...EX_NAMES, exploreTake: "Tone exploration", applyTake: "Two tone colours, applied" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "applyTake" ? 20 : 15,
        meta: { name: `Level 2, Class 12 — ${NAMES[k]}`, exercise: `resonance-tone-colour-${k}` },
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
    const assessMap = { "mostNatural-q": "mostNatural", "heardDifference-q": "heardDifference", "clearPronunciation-q": "clearPronunciation", "tensionNoticed-q": "tensionNoticed", "mostComfortable-q": "mostComfortable" };
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
    own(PersonalNotes.wire(container, "notes-rtc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Bright, warm, light and dark are descriptive listening terms, not a hierarchy — comfort and consistency matter more than imitating anyone else's tone.",
        struggled: "",
        toPractice: A(rec0(), "growth").toneNotice || "",
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
