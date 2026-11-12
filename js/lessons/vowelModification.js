/* ============================================================
   LEVEL 2, CLASS 11 — VOWEL MODIFICATION FOUNDATIONS
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vowel-modification".

   Curriculum identity: Level 2, Class 11 (`number: 11`, `levelId: 2`
   in data.js, explicit id `L2C07` — unchanged since the Level 2
   Curriculum Upgrade, which moved this class from old number 7 to
   new number 11 without touching its id). Rebuilt against this
   class's own later, more detailed spec (5 named guided exercises
   each with purpose/instructions/repetitions/rest/listening-focus/
   common-mistakes, a practical word-application section, a 5-
   question knowledge check, and a 5-question self-assessment) —
   supersedes the shorter version first written earlier in the
   project.

   Core idea: "Vowel modification is a singing technique, not an
   instruction to distort words or change pronunciation
   unnecessarily." Vowel modification is gradual, depends on pitch,
   voice, language, musical context and the individual singer, and
   should always stay subtle — never forced.

   Honesty boundaries, matching every earlier class: no fabricated
   vowel recognition, pronunciation scoring, or audio analysis;
   completion never depends on perfect pronunciation, a successful
   recording, or finishing every optional activity.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. The "skip this exercise" button and
   "reuse an earlier recording instead of asking again" patterns
   (Section C's five vowel recordings feed both the comparison and
   review sections) are reused exactly as earlier classes established
   them.
   ============================================================ */

const VowelModificationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "exercises", label: "Exercises" },
    { id: "words", label: "Words" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const VOWELS = [
    { key: "ah", label: "“Ah”" },
    { key: "ee", label: "“Ee”" },
    { key: "oo", label: "“Oo”" },
    { key: "eh", label: "“Eh”" },
    { key: "oh", label: "“Oh”" },
  ];
  const PAIRS = [
    { a: "ah", b: "oh", label: "“Ah” and “Oh”" },
    { a: "ee", b: "eh", label: "“Ee” and “Eh”" },
    { a: "oo", b: "oh", label: "“Oo” and “Oh”" },
  ];
  const WORDS = [
    { key: "cat", word: "Cat", vowel: "ah" },
    { key: "see", word: "See", vowel: "ee" },
    { key: "moon", word: "Moon", vowel: "oo" },
    { key: "bed", word: "Bed", vowel: "eh" },
    { key: "go", word: "Go", vowel: "oh" },
  ];

  // Section C — every exercise carries purpose/instructions/repetitions/rest/listening-focus/
  // common-mistakes, per the spec's own explicit per-exercise structure.
  const EXERCISES = [
    {
      key: "awareness", title: "Exercise 1 — Comfortable vowel awareness",
      purpose: "Build familiarity with each vowel at an easy, natural pitch.",
      instructions: "Practise each of the five vowels gently at a comfortable speaking pitch.",
      repetitions: "Once or twice per vowel.", rest: "Rest briefly between vowels.",
      listening: "Notice how each vowel's shape and sound differ.",
      mistakes: "Exaggerating the mouth shape, or rushing between vowels.",
      maxSeconds: 15,
    },
    {
      key: "sustained", title: "Exercise 2 — Sustained vowels",
      purpose: "Notice how a vowel feels when held, without pushing or running out of breath.",
      instructions: "Hold each vowel briefly, using a comfortable, natural breath.",
      repetitions: "One or two attempts per vowel.", rest: "Rest and breathe normally between attempts.",
      listening: "Listen for whether the sound stays steady and comfortable.",
      mistakes: "Holding past a comfortable breath, or pushing for volume.",
      maxSeconds: 15,
    },
    {
      key: "transitions", title: "Exercise 3 — Vowel transitions",
      purpose: "Explore how one vowel can move gently into another.",
      instructions: "Practise “Ah→Oh,” “Ee→Eh,” and “Oo→Oh,” keeping the transitions gentle and natural.",
      repetitions: "Once or twice per pair.", rest: "Rest between pairs.",
      listening: "Notice how the mouth shape changes between the two vowels.",
      mistakes: "Forcing a sudden change, or losing the first vowel's clarity.",
      maxSeconds: 20,
    },
    {
      key: "consistency", title: "Exercise 4 — Vowel consistency",
      purpose: "Practise keeping one vowel's shape steady while singing a short pattern.",
      instructions: "Sing a simple, comfortable repeated-note pattern using one vowel at a time.",
      repetitions: "One pattern per vowel, for as many vowels as feel comfortable.", rest: "Rest between vowels.",
      listening: "Notice whether the vowel's shape stays consistent across the repeated notes.",
      mistakes: "Letting the vowel drift or change shape unintentionally partway through.",
      maxSeconds: 20, usesPiano: true,
    },
    {
      key: "glide", title: "Exercise 5 — Gentle pitch movement",
      purpose: "Notice whether a vowel needs a subtle adjustment to stay comfortable as pitch changes.",
      instructions: "Explore a small, gentle pitch glide on one vowel, noticing any need for adjustment.",
      repetitions: "A few gentle glides, if comfortable.", rest: "Rest between glides.",
      listening: "Notice whether a small adjustment makes the vowel feel easier — not whether you hit an exact pitch.",
      mistakes: "Forcing a wide pitch range, or exaggerating the adjustment.",
      maxSeconds: 15, usesPiano: true,
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "whatAreVowels",
      question: "What are vowels in singing?",
      options: [
        { value: "consonants", label: "Sounds like “m,” “b” and “t”", correct: false },
        { value: "vowels", label: "Sounds like “ah,” “ee,” “oo,” “eh” and “oh” that shape vocal tone", correct: true },
        { value: "rhythm", label: "A rhythm pattern", correct: false },
      ],
      explain: { consonants: "Not quite — those are consonants.", vowels: "Exactly right.", rhythm: "Not quite — vowels are about tone and shape, not rhythm." },
    },
    {
      key: "whyInfluence",
      question: "Why do vowels influence vocal tone and clarity?",
      options: [
        { value: "shape", label: "The shape of the mouth, tongue and lips changes the sound", correct: true },
        { value: "none", label: "They don't influence tone at all", correct: false },
        { value: "consonantsOnly", label: "Only consonants affect tone", correct: false },
      ],
      explain: { shape: "Right — vocal-tract shape is exactly what gives each vowel its character.", none: "Not quite — vowels shape tone a great deal.", consonantsOnly: "Not quite — vowels matter just as much, if not more, for sustained tone." },
    },
    {
      key: "whyAdjust",
      question: "Why might a vowel need a small adjustment as pitch changes?",
      options: [
        { value: "comfort", label: "To stay comfortable and clear at different pitches", correct: true },
        { value: "different", label: "To completely change the word", correct: false },
        { value: "never", label: "It never needs adjusting", correct: false },
      ],
      explain: { comfort: "Exactly right.", different: "Not quite — modification is subtle, never a new word.", never: "Not quite — a small adjustment can genuinely help at some pitches." },
    },
    {
      key: "distort",
      question: "Should vowel modification distort the word or change pronunciation unnecessarily?",
      options: [
        { value: "yes", label: "Yes, that's the whole point", correct: false },
        { value: "no", label: "No — it should be subtle and should never feel forced", correct: true },
        { value: "sometimes", label: "Only on high notes", correct: false },
      ],
      explain: { yes: "Not quite — modification should never distort the word.", no: "Right.", sometimes: "Not quite — subtlety matters at every pitch." },
    },
    {
      key: "universal",
      question: "Is there one universal vowel shape correct for every singer and every note?",
      options: [
        { value: "yes", label: "Yes, always", correct: false },
        { value: "no", label: "No — it depends on pitch, voice, language, musical context and the individual singer", correct: true },
        { value: "unsure", label: "This hasn't been mentioned in this course", correct: false },
      ],
      explain: { yes: "Not quite — there's no single shape that works for everyone.", no: "Exactly right.", unsure: "It has — Section A says this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "recognised", label: "I can recognise the five basic vowel sounds." },
    { key: "sustainedTried", label: "I can hold a vowel briefly without pushing, or chose to skip it." },
    { key: "transitionExplored", label: "I tried a gentle vowel transition." },
    { key: "consistencyTried", label: "I explored vowel consistency on a repeated-note pattern, or chose to skip it." },
    { key: "wordPractised", label: "I practised at least one word while keeping it understandable." },
    { key: "noticedAdjustment", label: "I noticed whether a small adjustment made singing more comfortable." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const VOWEL_OPTS = [...VOWELS.map((v) => opt(v.key, v.label)), opt("notsure", "Not sure")];
  const Q = {
    easiestVowel: { question: "Which vowel felt easiest?", options: VOWEL_OPTS },
    difficultVowel: { question: "Which vowel felt difficult?", options: VOWEL_OPTS },
    clearPronunciation: { question: "Could I maintain clear pronunciation?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did I notice tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    adjustmentHelped: { question: "Did a small adjustment make singing more comfortable?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really", "neutral"), opt("didnttry", "Didn't try")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const l2c6 = (ClassActivity.get("L2C06").answers.setup || {}).note;
    if (ok(l2c6)) return l2c6;
    const l2c5 = (ClassActivity.get("L2C05").answers.setup || {}).note;
    if (ok(l2c5)) return l2c5;
    const l2c4 = (ClassActivity.get("L2C04").answers.setup || {}).note;
    if (ok(l2c4)) return l2c4;
    const l2c3 = (ClassActivity.get("L2C03").answers.setup || {}).note;
    if (ok(l2c3)) return l2c3;
    const l2c2 = (ClassActivity.get("L2C02").answers.setup || {}).note;
    if (ok(l2c2)) return l2c2;
    const l2c1 = (ClassActivity.get("L2C01").answers.setup || {}).note;
    if (ok(l2c1)) return l2c1;
    const c25 = (ClassActivity.get("L1C25").answers.setup || {}).note;
    if (ok(c25)) return c25;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
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
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function vowelCardsHtml() {
    return `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${VOWELS.map((v) => recCard(`${v.key}Take`, v.label, "", 8)).join("")}
    </div>`;
  }

  function compareHtml(rec) {
    return `<div class="flex flex-col gap-3">
      ${PAIRS.map((pr) => {
        const aTake = take(rec, `${pr.a}Take`), bTake = take(rec, `${pr.b}Take`);
        return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-ink-200">${pr.label}</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-play-compare="${pr.a}" class="vr-btn" ${aTake ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} ${VOWELS.find((v) => v.key === pr.a).label}</button>
            <button type="button" data-play-compare="${pr.b}" class="vr-btn" ${bTake ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} ${VOWELS.find((v) => v.key === pr.b).label}</button>
          </div>
        </div>`;
      }).join("")}
    </div>
    <p class="text-xs text-ink-500 mt-3">${VOWELS.some((v) => take(rec, `${v.key}Take`)) ? "Playing back your own recordings from Section B — or just say the pairs aloud yourself." : "Record the vowels in Section B above to compare them here, or just say the pairs aloud yourself."}</p>`;
  }

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
      ${recCard(`${ex.key}Take`, `Recording for ${ex.title.replace(/^Exercise \d+ — /, "")}`, "Entirely optional.", ex.maxSeconds)}
      <div class="mt-2">${skipBtn(ex.key)}</div>
    </div>`;
  }

  function wordsHtml(rec) {
    const selected = A(rec, "words").selected || WORDS[0].key;
    const w = WORDS.find((x) => x.key === selected);
    return `<div data-words>
      <div class="flex flex-wrap gap-2 mb-4">
        ${WORDS.map((x) => `<button type="button" data-word-select="${x.key}" class="ex-chip ${selected === x.key ? "is-selected" : ""}">${x.word} (${VOWELS.find((v) => v.key === x.vowel).label})</button>`).join("")}
      </div>
      <p class="text-sm text-ink-300 mb-3">Speak “${w.word}” naturally, then sing it on a comfortable note. Repeat gently while keeping the word understandable, and notice whether a small adjustment makes it easier.</p>
    </div>`;
  }

  function problems() {
    const items = [
      ["Opening the mouth as wide as possible", "Use a natural, comfortable mouth opening."],
      ["Moving the tongue forcefully", "Let vowel changes happen gently."],
      ["Making every vowel sound the same", "Preserve each vowel's identity while exploring small adjustments."],
      ["Changing pronunciation until the word is unclear", "Keep the original word understandable."],
      ["Forcing a vowel to make a difficult note easier", "Return to a comfortable pitch and stop if tension appears."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const present = VOWELS.filter((v) => take(rec, `${v.key}Take`));
    if (!present.length) return `<p class="text-sm text-ink-500">Record your five vowels in Section B above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map((v) => `<button type="button" data-play-review="${v.key}Take" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${v.label}</button>`).join("")}</div>`;
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 11 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Five vowels, noticed gently.</p>
        <p class="text-sm text-ink-300">A small adjustment, not a different word — clear pronunciation and comfort both matter.</p>
        <p class="text-sm text-ink-100">There's no single universal vowel shape for every singer.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 12 — Resonance and Tone Colour</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore how vocal-tract shape can influence the tone colour of the voice — not a promise of instant improvements in vocal power or quality.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">How small changes in vowel shape can affect the sound and comfort of singing.</h3>
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

        ${chapter("understand", 1, "Section A — Welcome: What is a vowel?", `
          ${narrow(`
            ${p("Vowels are sounds such as “ah,” “ee,” “oo,” “eh” and “oh.” Consonants are sounds such as “m,” “b” and “t” that help form words.")}
            ${p("The shape of the mouth, the position of the tongue, and the rounding of the lips all affect a vowel sound, which is why vowels influence vocal tone and clarity. Singing may sometimes call for a small adjustment to a vowel to make a note more comfortable — but vowel modification is a singing technique, not an instruction to distort words or change pronunciation unnecessarily.")}
          `)}
          ${flowStrip(["NOTICE", "COMPARE", "EXPLORE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Explore five vowel sounds", `
          ${narrow(`
            ${p("Say each vowel naturally and briefly, at a comfortable speaking pitch. Keep the jaw relaxed, avoid exaggerated mouth shapes, and rest briefly between sounds. Notice which vowels feel easiest to say.")}
          `)}
          ${vowelCardsHtml()}
        `, { wide: true })}

        ${chapter("listen", 3, "Section C1 — Listen to the differences", `
          ${narrow(p("Each vowel has its own sound quality because the vocal tract shape changes — not because one is objectively better or more resonant than another."))}
          <div data-compare-host>${compareHtml(rec)}</div>
        `)}

        ${chapter("exercises", 4, "Section C — Guided exercises", `
          ${narrow(p("Exercises 4 and 5 use a comfortable reference note — choose one on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vm-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-6">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("words", 5, "Section D — Practical word application", `
          ${narrow(p("A few simple example words, each built around one of the five vowels. Speak the word naturally, sing it on a comfortable note, repeat gently while keeping it clear, and notice whether a small adjustment makes it easier — no exaggerated mouth shapes needed."))}
          <div data-words-host>${wordsHtml(rec)}</div>
          ${recCard("wordApplicationTake", "Speaking then singing the selected word", "Entirely optional.", 15)}
        `)}

        ${chapter("quiz", 6, "Section F — Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 7, "Section E — Self-assessment and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easiestVowel-q", { ...Q.easiestVowel, selected: sel("easiestVowel") })}
              ${SelfAssessment.render("difficultVowel-q", { ...Q.difficultVowel, selected: sel("difficultVowel") })}
              ${SelfAssessment.render("clearPronunciation-q", { ...Q.clearPronunciation, selected: sel("clearPronunciation") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("adjustmentHelped-q", { ...Q.adjustmentHelped, selected: sel("adjustmentHelped") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="vm-again">Which sound would I like to practise again?</label><textarea id="vm-again" data-growth="practiceAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.practiceAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "Common beginner mistakes", problems())}

        ${chapter("complete", 9, "Section G — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pronunciation, a successful recording, or finishing every optional activity.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 10, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vm", { placeholder: "e.g. Which vowel felt easiest... Whether any vowel felt difficult... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Don't force mouth or tongue positions, and don't push for louder or higher sounds. Take breaks and rest when necessary.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    /* ---- Section C: piano + playback ---- */
    own(VirtualPiano.wire(container, "vm-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      if (!e.target.closest("[data-play-pitch]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

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

    /* ---- Section D: word selector ---- */
    function refreshWordsHost() {
      const host = $("[data-words-host]");
      if (host) host.innerHTML = wordsHtml(rec0());
    }
    function onWordSelect(e) {
      const btn = e.target.closest("[data-word-select]");
      if (!btn) return;
      set("words", "selected", btn.dataset.wordSelect);
      refreshWordsHost();
    }
    container.addEventListener("click", onWordSelect);
    cleanups.push(() => container.removeEventListener("click", onWordSelect));

    /* ---- recordings ---- */
    function refreshCompareHost() {
      const host = $("[data-compare-host]");
      if (host) host.innerHTML = compareHtml(rec0());
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const VOWEL_NAMES = Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, v.label]));
    const EXERCISE_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...VOWEL_NAMES, ...EXERCISE_NAMES, wordApplicationTake: "Word application" };
    const MAX_SECONDS = { ...Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, 8])), ...Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.maxSeconds])), wordApplicationTake: 15 };
    const VOWEL_KEYS = VOWELS.map((v) => `${v.key}Take`);
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 11 — ${NAMES[k]}`, exercise: `vowel-modification-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (VOWEL_KEYS.includes(k)) { refreshCompareHost(); refreshReviewHost(); }
        },
      }));
    });

    /* ---- Section C1: play-to-compare, Section E: play-to-review ---- */
    function onPlayCompare(e) {
      const btn = e.target.closest("[data-play-compare]");
      if (!btn) return;
      const t = take(rec0(), `${btn.dataset.playCompare}Take`);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayCompare);
    cleanups.push(() => container.removeEventListener("click", onPlayCompare));
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "easiestVowel-q": "easiestVowel", "difficultVowel-q": "difficultVowel", "clearPronunciation-q": "clearPronunciation", "tensionNoticed-q": "tensionNoticed", "adjustmentHelped-q": "adjustmentHelped" };
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
    own(PersonalNotes.wire(container, "notes-vm", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vowel modification is a small adjustment, not a different word — there's no single universal vowel shape for every singer.",
        struggled: q(rec, "difficultVowel") && q(rec, "difficultVowel") !== "notsure" ? `The “${q(rec, "difficultVowel")}” vowel felt difficult.` : "",
        toPractice: A(rec, "growth").practiceAgain || "",
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
