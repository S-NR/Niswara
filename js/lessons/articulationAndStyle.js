/* ============================================================
   LEVEL 2, CLASS 20 — ARTICULATION AND STYLE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "articulation-and-style".

   Curriculum identity: Level 2, Class 20 (`number: 20`, `levelId: 2`
   in data.js, id `L2C20`). Rebuilt again against this class's own
   later, more detailed spec (seven named guided exercises with
   purpose/instructions/repetitions/rest/listening-focus/mistakes, an
   optional Kannada lyric example, a simple legato/staccato
   introduction, a practical application comparing a natural and a
   smoother delivery, a short personal-style section, and a
   5-question knowledge check) — supersedes the previous version.
   Part of a combined rebuild alongside Classes 18 and 19.

   Core idea: articulation is making sung words understandable
   without interrupting the melody — vowels carry the sustained
   sound, consonants help the listener recognise the word, and a
   consonant should never cut off or interrupt the vowel it's
   attached to. Style is introduced only as natural musical choices
   (connected vs. gently separated notes, natural word emphasis,
   smooth phrasing) — explicitly never imitation of another singer
   or accent correction.

   Honesty boundaries, matching every earlier class: no automatic
   pronunciation scoring or speech-recognition; completion never
   depends on perfect pronunciation, accent, speed, or recording
   quality; no invented audio demo — the "listening activity" plays
   the same synthesized reference tones used throughout the app, not
   a fabricated vocal recording. The optional Kannada lyric line
   ("ಓ ನನ್ನ ಚೇತನ", already used elsewhere in the app) is offered
   without assuming every learner sings in Kannada.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PianoSynth's relative-degree pattern playback,
   RecordingCard, SelfAssessment, PersonalNotes, ClassProgress.
   ============================================================ */

const ArticulationAndStyleLesson = (() => {
  const STAGES = [
    { id: "intro", label: "Introduction" },
    { id: "listen", label: "Listening" },
    { id: "exercises", label: "Exercises" },
    { id: "style", label: "Legato/Staccato" },
    { id: "apply", label: "Apply" },
    { id: "personal", label: "Personal Style" },
    { id: "record", label: "Record" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2;

  const NEUTRAL_PHRASE = "I will sing this phrase with ease.";
  const KANNADA_PHRASE = "ಓ ನನ್ನ ಚೇತನ";
  const KANNADA_TRANSLIT = "Oo nanna chetana";
  const SONG_HREF = "#/songs/oo-nanna-chetana";

  const PATTERNS = {
    nearby: [0, 1, 0, -1, 0],
    phrase: [0, 1, 2, 1, 0],
    connected: [0, 1, 2, 1, 0],
  };
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const EXERCISES = [
    {
      key: "consonant", title: "Exercise 1 — Gentle consonant awareness", degrees: null,
      purpose: "Notice how consonants are formed, before any singing.",
      instructions: `Say “ma,” “la,” “na,” “da,” “ta” slowly, noticing the brief consonant and the vowel that follows each one.`,
      repetitions: "Once through the list.", rest: "No rest needed — this is gentle speech.",
      listening: "Notice how short and light each consonant actually is.", mistakes: "Over-emphasising consonants with extra force.",
    },
    {
      key: "vowel", title: "Exercise 2 — Vowel clarity exercises", degrees: [0],
      purpose: "Practise sustaining a clear, steady vowel.",
      instructions: "Sing a comfortable “ah” on your reference note, holding it gently for a couple of seconds.",
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice whether the vowel stays steady, without wavering or changing shape.", mistakes: "Letting the vowel shape drift partway through.",
    },
    {
      key: "speakLyric", title: "Exercise 3 — Speaking a lyric naturally", degrees: null,
      purpose: "Hear the words at a natural, spoken pace before singing them.",
      instructions: `Speak the practice phrase naturally, the way you would in conversation. If you'd like, try the optional Kannada line too — there's no expectation that you sing in Kannada.`,
      repetitions: "Once or twice.", rest: "No rest needed.",
      listening: "Notice the natural rhythm and emphasis of the words.", mistakes: "Speaking too quickly to actually notice the words.",
    },
    {
      key: "singSlow", title: "Exercise 4 — Singing the same lyric slowly", degrees: PATTERNS.phrase, tempo: { duration: 0.75, gap: 0.3 },
      purpose: "Carry the same words into singing, slowly and clearly.",
      instructions: "Sing the practice phrase slowly, along with the reference melody.",
      repetitions: "Once or twice.", rest: "Rest after.",
      listening: "Notice whether the words stay clear even while sustaining each note.", mistakes: "Letting consonants interrupt the melody's flow.",
    },
    {
      key: "connectedSyllables", title: "Exercise 5 — Singing with connected syllables", degrees: PATTERNS.connected, tempo: { duration: 0.6, gap: 0.03 },
      purpose: "Practise connecting syllables smoothly, without gaps between them.",
      instructions: "Sing the phrase again, this time connecting each syllable smoothly into the next — this is what “legato” means.",
      repetitions: "Once or twice.", rest: "Rest after.",
      listening: "Notice how the words flow into each other without separation.", mistakes: "Leaving awkward silent gaps between syllables.",
    },
    {
      key: "shortPhrase", title: "Exercise 6 — Practising short lyric phrases", degrees: PATTERNS.nearby, tempo: { duration: 0.5, gap: 0.2 },
      purpose: "Practise a short phrase on its own, outside the full sentence.",
      instructions: "Choose any short phrase, a few words, and sing it slowly, focused only on clarity.",
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice whether this short phrase feels easier than the full sentence.", mistakes: "Rushing through without listening back.",
    },
    {
      key: "naturalExpression", title: "Exercise 7 — Repeating a phrase with natural expression", degrees: PATTERNS.phrase, tempo: { duration: 0.4, gap: 0.4 },
      purpose: "Add a touch of natural expression to a repeated phrase.",
      instructions: `Repeat the practice phrase a few times, letting your own natural expression come through rather than performing it one fixed "correct" way.`,
      repetitions: "Two or three times.", rest: "Rest between attempts.",
      listening: "Notice which repetition felt most natural to you.", mistakes: "Trying to imitate a specific singer's style instead of your own.",
    },
  ];

  const KNOWLEDGE_CHECK = [
    {
      key: "vowelsConsonants", question: "What mainly carries the sustained sound in singing?",
      options: [
        { value: "consonants", label: "Consonants", correct: false },
        { value: "vowels", label: "Vowels", correct: true },
        { value: "both", label: "Neither — pitch alone does", correct: false },
      ],
      explain: { consonants: "Not quite — consonants help recognise words, but don't sustain the sound.", vowels: "Exactly right.", both: "Not quite — vowels are what carry a sustained tone." },
    },
    {
      key: "interrupt", question: "Should a consonant interrupt or cut off the vowel that follows it?",
      options: [
        { value: "yes", label: "Yes, that keeps words clear", correct: false },
        { value: "no", label: "No — it should stay brief and clear without cutting the vowel off", correct: true },
        { value: "sometimes", label: "Only for emphasis", correct: false },
      ],
      explain: { yes: "Not quite — that would work against the melody.", no: "Exactly right.", sometimes: "Not quite — this holds throughout." },
    },
    {
      key: "legato", question: "What does “legato” mean?",
      options: [
        { value: "legato", label: "Smoothly connected notes, with no gaps", correct: true },
        { value: "staccato", label: "Short, separated notes", correct: false },
        { value: "loud", label: "Singing loudly", correct: false },
      ],
      explain: { legato: "Exactly right.", staccato: "Not quite — that describes staccato instead.", loud: "Not quite — this isn't about volume." },
    },
    {
      key: "staccato", question: "What does “staccato” mean?",
      options: [
        { value: "legato", label: "Smoothly connected notes", correct: false },
        { value: "staccato", label: "Short, separated notes", correct: true },
        { value: "fast", label: "Singing as fast as possible", correct: false },
      ],
      explain: { legato: "Not quite — that describes legato instead.", staccato: "Exactly right.", fast: "Not quite — this is about separation, not speed." },
    },
    {
      key: "personalStyle", question: "Does developing personal style mean imitating another singer's exact tone?",
      options: [
        { value: "yes", label: "Yes, copying a favourite singer exactly", correct: false },
        { value: "no", label: "No — it develops gradually, through your own natural choices", correct: true },
        { value: "unsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — this class explicitly says style isn't about imitation.", no: "Exactly right.", unsure: "It does say — Section F states this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what articulation means while singing." },
    { key: "triedExercise", label: "I tried at least one of the seven guided exercises." },
    { key: "triedLyric", label: "I tried the practical phrase, spoken then sung two ways." },
    { key: "triedLegatoStaccato", label: "I listened to the legato and staccato comparison, or chose to skip it." },
    { key: "reflectedStyle", label: "I reflected on personal style." },
    { key: "reflected", label: "I reflected on which articulation approach felt comfortable." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    wordsUnderstandable: { question: "Were my words understandable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    vowelSteady: { question: "Did I keep the vowel sound steady?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    noInterruption: { question: "Did I avoid interrupting the melody with consonants?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    phraseNatural: { question: "Did the phrase sound natural?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    comfortableTone: { question: "Did I maintain a comfortable tone throughout?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n + MAX_UP * STEP <= RANGE.to && n - STEP >= RANGE.from;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C19", "L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
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
      ${ex.degrees ? `<div class="flex flex-wrap gap-3 mb-3"><button type="button" data-play-ex="${ex.key}" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button></div>` : ""}
      ${recCard(`${ex.key}Take`, `Recording for ${ex.title.replace(/^Exercise \d+ — /, "")}`, "Entirely optional.", 15)}
      <div class="mt-2">${skipBtn(ex.key)}</div>
    </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 20 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Clear words, uninterrupted melody.</p>
        <p class="text-sm text-ink-300">Articulation means your words can be understood — it isn't about forcing crisp consonants at the cost of a smooth, sustained vowel. And your style will develop gradually, in your own way.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 21 — Expressive Singing Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson explores how tone, dynamics, timing and intention shape the feeling behind a phrase.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first look at clear words, legato and staccato, and natural musical choices.</h3>
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

  function reviewHtml(rec) {
    const sources = [...EXERCISES.filter((ex) => true).map((ex) => [`${ex.key}Take`, ex.title.replace(/^Exercise \d+ — /, "")]), ["phraseTake", "Natural vs. smoother delivery"]];
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
      <p class="text-xs text-ink-500">This is a quick concept check, not a pronunciation score.</p>
    </div>`;
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const c = checklist(rec);
    const growth = A(rec, "growth");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("intro", 1, "Section A — Introduction", `
          ${narrow(`
            ${p("Articulation means making your sung words understandable. Vowels carry most of the sustained singing sound, while consonants help a listener recognise the word — singing means balancing clear pronunciation with musical continuity, rather than treating either one as more important.")}
            ${p("A consonant should never interrupt or cut off the vowel that follows it — that's the one idea this whole class builds from.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — A short listening activity", `
          ${narrow(`
            ${p("There's no invented audio demonstration here — instead, choose a comfortable reference note below, then listen to the same simple pattern played back, so you have something real to compare your own singing against.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c20-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-3">Your reference note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <button type="button" data-play-pattern="reference" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play reference note</button>
        `, { wide: true })}

        ${chapter("exercises", 3, "Section C — Guided exercises", `
          ${narrow(p(`Practice phrase: “${NEUTRAL_PHRASE}” — and an optional Kannada line, “${KANNADA_PHRASE}” (${KANNADA_TRANSLIT}), already used elsewhere in Niswara's <a href="${SONG_HREF}" class="text-gold-300 hover:text-gold-200 underline">song library</a>. There's no expectation that you sing in Kannada — use whichever phrase feels comfortable.`))}
          ${EXERCISES.map((ex) => exerciseCardHtml(ex)).join("")}
        `, { wide: true })}

        ${chapter("style", 4, "Section D — Introduction to legato and staccato", `
          ${narrow(`
            ${p("Two simple, beginner-level ideas — not advanced technique:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-3">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Legato</strong> — notes connected smoothly, with no gaps between them.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Staccato</strong> — notes kept short and gently separated.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Natural phrasing</strong> — shaping a line as one musical thought, not a string of separate notes.</li>
            </ul>
          `)}
          <div class="flex flex-wrap gap-3">
            <button type="button" data-play-style="connected" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen — legato</button>
            <button type="button" data-play-style="separated" class="vr-btn">${icon("play", "w-4 h-4")} Listen — staccato</button>
          </div>
        `)}

        ${chapter("apply", 5, "Section E — Practical application", `
          ${narrow(`
            ${p(`Using the same phrase, “${NEUTRAL_PHRASE}”:`)}
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
              <li class="flex gap-2"><span class="text-gold-400">1.</span>Speak the phrase naturally.</li>
              <li class="flex gap-2"><span class="text-gold-400">2.</span>Sing it slowly, focusing on clear pronunciation.</li>
              <li class="flex gap-2"><span class="text-gold-400">3.</span>Sing it again with a smoother, more connected delivery.</li>
              <li class="flex gap-2"><span class="text-gold-400">4.</span>Compare the two — there's no "correct" answer, just noticing the difference.</li>
            </ol>
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="phraseSlow" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen, clearer delivery</button>
            <button type="button" data-play-pattern="phrase" class="vr-btn">${icon("play", "w-4 h-4")} Listen, smoother delivery</button>
          </div>
          ${recCard("phraseTake", "Sing the phrase, either delivery", "Entirely optional.", 20)}
        `)}

        ${chapter("personal", 6, "Section F — A short introduction to personal style", `
          ${narrow(`
            ${p("Singing style grows out of natural musical choices, not imitation. A few simple ideas to notice, not master:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-3">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Your natural tone</strong> — the voice you already have.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Your own pronunciation</strong> — not an imitation of anyone else's.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Natural phrasing</strong> — shaping a line the way it feels right to you.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Expression</strong> — conveying meaning in your own way.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Listening</strong> — to others for inspiration, without copying their exact tone.</li>
            </ul>
            ${p("There's no expectation to imitate a professional singer's exact tone, and nothing here is about correcting your accent — personal style develops gradually, through practice.")}
          `)}
        `)}

        ${chapter("record", 7, "Section G — Recording and self-assessment", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically scored for pronunciation, accent, or speed."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("wordsUnderstandable-q", { ...Q.wordsUnderstandable, selected: sel("wordsUnderstandable") })}
              ${SelfAssessment.render("vowelSteady-q", { ...Q.vowelSteady, selected: sel("vowelSteady") })}
              ${SelfAssessment.render("noInterruption-q", { ...Q.noInterruption, selected: sel("noInterruption") })}
              ${SelfAssessment.render("phraseNatural-q", { ...Q.phraseNatural, selected: sel("phraseNatural") })}
              ${SelfAssessment.render("comfortableTone-q", { ...Q.comfortableTone, selected: sel("comfortableTone") })}
            </div>
          `)}
        `)}

        ${chapter("quiz", 8, "Knowledge check", `
          ${narrow(p("A quick concept check — not a pronunciation score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 9, "Section H — Reflection and completion", `
          ${narrow(`
            <div class="mb-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c20-next">Which articulation approach felt most comfortable?</label><textarea id="l2c20-next" data-growth="next" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.next || "")}</textarea></div>
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pronunciation, accent, speed, or recording quality.")}
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
          ${PersonalNotes.render("notes-l2c20", { placeholder: "e.g. Which syllable felt easiest... Where the melody felt interrupted... What my own style might sound like..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Keep every exercise within a comfortable range, avoid exaggerated mouth opening or jaw tension, don't use hard consonant attacks, and don't force long sustained notes.")}
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

    /* ---- Section B: piano ---- */
    own(VirtualPiano.wire(container, "l2c20-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to || midi - STEP < RANGE.from) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - MAX_UP * STEP)} so the reference patterns stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

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

    /* ---- Sections B/C/E: reference + exercise pattern playback ---- */
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const key = btn.dataset.playPattern;
      if (key === "reference") { PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 }); return; }
      if (key === "phraseSlow") { PianoSynth.playSequence(degreesToNotes(base(), PATTERNS.phrase), { duration: 0.75, gap: 0.3 }); return; }
      const degrees = PATTERNS[key];
      if (degrees) PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.5, gap: 0.2 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    function onPlayEx(e) {
      const btn = e.target.closest("[data-play-ex]");
      if (!btn) return;
      const ex = EXERCISES.find((x) => x.key === btn.dataset.playEx);
      if (ex && ex.degrees) PianoSynth.playSequence(degreesToNotes(base(), ex.degrees), ex.tempo || { duration: 0.6, gap: 0.25 });
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

    /* ---- Section D: legato vs. staccato demo ---- */
    function onPlayStyle(e) {
      const btn = e.target.closest("[data-play-style]");
      if (!btn) return;
      const opts = btn.dataset.playStyle === "connected" ? { duration: 0.6, gap: 0.03 } : { duration: 0.4, gap: 0.4 };
      PianoSynth.playSequence(degreesToNotes(base(), PATTERNS.connected), opts);
    }
    container.addEventListener("click", onPlayStyle);
    cleanups.push(() => container.removeEventListener("click", onPlayStyle));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const EX_NAMES = Object.fromEntries(EXERCISES.map((ex) => [`${ex.key}Take`, ex.title]));
    const NAMES = { ...EX_NAMES, phraseTake: "Natural vs. smoother delivery" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "phraseTake" ? 20 : 15,
        meta: { name: `Level 2, Class 20 — ${NAMES[k]}`, exercise: `articulation-and-style-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "wordsUnderstandable-q": "wordsUnderstandable", "vowelSteady-q": "vowelSteady",
      "noInterruption-q": "noInterruption", "phraseNatural-q": "phraseNatural", "comfortableTone-q": "comfortableTone",
    };
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

    /* ---- reflection textarea ---- */
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
    own(PersonalNotes.wire(container, "notes-l2c20", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Articulation means making words understandable without interrupting the melody — vowels sustain the sound, consonants stay brief and clear. Personal style develops gradually, never by imitation.",
        struggled: q(rec, "noInterruption") && q(rec, "noInterruption") !== "yes" ? "Noticed the melody getting interrupted by consonants at times." : "",
        toPractice: A(rec, "growth").next || "",
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
