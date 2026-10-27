/* ============================================================
   CLASS 24 — SINGING A COMPLETE SIMPLE SONG (interactive lesson)

   Rendered by ClassDetailPage for interactive: "singing-complete-song".

   Core idea: "Until now, we have practiced individual skills. Today,
   we begin bringing those skills together in a complete song."
   LISTEN -> LEARN -> BREAK DOWN -> PRACTICE -> CONNECT -> PERFORM
   -> REVIEW. The goal is not perfection — it is a complete,
   manageable performance while noticing what works and what needs
   more practice.

   The song: Niswara's own short, original 2-phrase "practice song"
   (never a real copyrighted song — see the song-selection note
   below), built from the same scale-degree system every earlier
   class uses, so the whole lesson is "transposed" automatically to
   whichever comfortable note the learner picks on the piano.
     Phrase A: degrees 0-1-2-1, words "I can sing now"
     Phrase B: degrees 1-3-2-0, words "I will try again"
   Phrase B's climb to degree 3 then back to the tonic gives the
   whole SONG the same beginning -> development -> peak -> release
   shape Class 18 taught for a single phrase — now applied across
   two.

   Song selection (spec's 4 options), honestly scoped:
     - "Niswara's practice song" / "explore the piano first" both
       use the built-in song above for every pitch/rhythm exercise
       (option 2 is a framing choice, not a different code path —
       Exercise 3 already lets anyone explore the piano regardless).
     - "A song I already know" stores a title + a short personal
       practice-text field (reusing Class 15's "personal lyric"
       pattern exactly — private, never analysed), explained plainly:
       Niswara doesn't know that song's real melody, so the guided
       pitch/rhythm practice below still uses the built-in song, and
       the learner's own words can be applied to it afterward.
     - "My own melody" records it once into the private recording
       library, explicitly NOT used as a synthesized pitch reference
       anywhere else — `PianoSynth` can't honestly know an arbitrary
       recording's notes, so building pitch-matching against it would
       repeat the exact fabrication problem Class 13 first identified.
   This keeps every option real and complete rather than a half-built
   stub, at the cost of not generating personalized exercises for an
   arbitrary song — a deliberate, documented trade-off.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard + WaveformPlayer + ObservationChecklist (Class 5),
   the full Metronome + BeatGuide widgets (Class 6, BeatGuide used
   here for the first time with a DISTINCT midi note per token —
   an actual short melody, not one repeated reference pitch),
   ControlCheck (Class 9+), the Class 15 "personal lyric" pattern,
   a local single-mark breath editor (Class 11/16/17/21/24 pattern),
   and `LessonKit.renderAssignment` (Classes 1-4's auto-ticking
   checklist, reused here for the first time since Class 4 — a good
   fit since most of Class 24's assignment steps are literally
   evidence already produced by the exercises above, not new takes).
   ============================================================ */

const SingingCompleteSongLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "choose", label: "Choose" },
    { id: "listen", label: "Listen" },
    { id: "learn", label: "Learn" },
    { id: "note", label: "Note" },
    { id: "rhythm", label: "Rhythm" },
    { id: "breath", label: "Breath" },
    { id: "diction", label: "Diction" },
    { id: "transitions", label: "Transitions" },
    { id: "dynamics", label: "Dynamics" },
    { id: "perform", label: "Perform" },
    { id: "record", label: "Record" },
    { id: "review", label: "Review" },
    { id: "final", label: "Final" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const BPM = 72;
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Complete Song Practice";
  const MAX_DEGREE = 3;

  const SONG_TITLE = "My First Song";
  const PHRASE_A = [0, 1, 2, 1];
  const PHRASE_A_WORDS = ["I", "can", "sing", "now"];
  const PHRASE_B = [1, 3, 2, 0];
  const PHRASE_B_WORDS = ["I", "will", "try", "again"];
  const SONG_DEGREES = [...PHRASE_A, ...PHRASE_B];
  const SONG_WORDS = [...PHRASE_A_WORDS, ...PHRASE_B_WORDS];
  const BREATH_GAP_DEFAULT = 3; // suggested: after "now", between the two phrases

  const TARGETED_AREAS = [
    ["startingPitch", "Starting pitch"], ["unstableNotes", "Unstable notes"], ["rhythm", "Rhythm"],
    ["breathing", "Breathing"], ["unclearWords", "Unclear words"], ["transitions", "Difficult transitions"],
    ["phraseConnection", "Phrase connection"], ["dynamics", "Dynamics"], ["memory", "Memory"],
    ["nervousness", "Nervousness"], ["notsure", "Not sure"],
  ];
  const REC_MAP = {
    startingPitch: "Return to the Virtual Piano above and hum the starting note a few times before singing the opening phrase again.",
    unstableNotes: "Isolate the two or three notes that felt unstable and sing just that short movement on “oo” before adding words.",
    rhythm: "Return to the metronome and speak the words in rhythm before singing them again.",
    breathing: "Shorten the phrase, or move your breath mark to an earlier, more natural point.",
    unclearWords: "Go back to speaking the words in rhythm, without singing, until they feel clear.",
    transitions: "Isolate just the two notes around the difficult movement, and connect only those two before returning to the full phrase.",
    phraseConnection: "Practice the ending of the first phrase and the beginning of the second phrase on their own, a few times, before singing both together.",
    dynamics: "Sing the phrase at one comfortable volume first, then add gentle dynamic shape only once that feels easy.",
    memory: "Review the sections one more time with the reference playing, then try again without it.",
    nervousness: "Take a slow breath, remind yourself small imperfections are expected, and sing it once just for yourself before recording.",
    notsure: "That's alright — choose whichever section felt least comfortable and return to the matching exercise above.",
  };

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmup", label: "Warm-up completed/skipped" },
    { key: "songSelected", label: "Song selected" },
    { key: "referenceListened", label: "Reference listened to" },
    { key: "sectionsPracticed", label: "Melody sections practiced" },
    { key: "startingNotePracticed", label: "Starting note practiced" },
    { key: "rhythmCompleted", label: "Rhythm exercise completed" },
    { key: "breathingReviewed", label: "Breathing points reviewed" },
    { key: "dictionCompleted", label: "Diction exercise completed" },
    { key: "transitionCompleted", label: "Transition exercise completed" },
    { key: "phraseConnectionPracticed", label: "Phrase connection practiced" },
    { key: "dynamicsPracticed", label: "Dynamics practiced" },
    { key: "completeSongAttempt", label: "Complete-song attempt recorded" },
    { key: "recordingsReviewed", label: "Recordings reviewed" },
    { key: "targetedPracticeCompleted", label: "Targeted practice completed" },
    { key: "finalAttemptRecorded", label: "Final attempt recorded" },
    { key: "selfEvalCompleted", label: "Self-assessment completed" },
    { key: "assignmentCompleted", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMNU_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"], ["unsure", "?", "Not sure"]);
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const Q = {
    listenPhrases: { question: "How many musical phrases did you notice?", options: [opt("one", "One"), opt("two", "Two"), opt("three", "Three or more"), opt("unsure", "Not sure")] },
    listenRise: { question: "Where did the melody rise?", options: [opt("beginning", "Beginning"), opt("middle", "Middle"), opt("end", "End"), opt("unsure", "Not sure")] },
    listenFall: { question: "Where did it fall?", options: [opt("beginning", "Beginning"), opt("middle", "Middle"), opt("end", "End"), opt("unsure", "Not sure")] },
    listenEasy: { question: "Which part sounds easiest?", options: [opt("a", "First phrase"), opt("b", "Second phrase"), opt("unsure", "Not sure")] },
    listenHard: { question: "Which part sounds challenging?", options: [opt("a", "First phrase"), opt("b", "Second phrase"), opt("neither", "Neither"), opt("unsure", "Not sure")] },
    startNoteComfort: { question: "Did the starting note feel comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    dynamicsPushed: { question: "Did you avoid pushing for a loud climax?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "I pushed a little", "maybe"), opt("unsure", "Not sure")] },
    take2Issue: { question: "Which issue are you targeting in Take 2?", options: [opt("pitch", "Pitch"), opt("diction", "Diction"), opt("rhythm", "Rhythm"), opt("breathing", "Breathing")] },
    targetedProblem: { question: "Choose one difficulty to work on", options: TARGETED_AREAS.map(([v, l]) => opt(v, l)) },
    favoriteSection: { question: "Which section am I most satisfied with?", options: [opt("a", "Opening (Phrase A)"), opt("b", "Ending (Phrase B)"), opt("both", "The whole song, equally"), opt("unsure", "Not sure")] },
    reviewStrong: { question: "Which section sounded strongest?", options: [opt("a", "First phrase"), opt("b", "Second phrase"), opt("both", "Both equally"), opt("unsure", "Not sure")] },
    reviewPractice: { question: "Which section needs more practice?", options: [opt("a", "First phrase"), opt("b", "Second phrase"), opt("both", "Both"), opt("unsure", "Not sure")] },
  };

  const CHECK_ROWS = [
    { key: "completeSong", area: "Completion", question: "Could I sing the complete song, or a complete short version?", levels: YMNU_LEVELS },
    { key: "memory", area: "Memory", question: "Could I remember the melody?", levels: YMNU_LEVELS },
    { key: "startPitch", area: "Starting pitch", question: "Was my starting pitch comfortable?", levels: YMNU_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Could I maintain the rhythm?", levels: YMNU_LEVELS },
    { key: "words", area: "Words", question: "Were the words understandable?", levels: YMNU_LEVELS },
    { key: "breath", area: "Breath", question: "Were the breathing points comfortable?", levels: YMNU_LEVELS },
    { key: "connection", area: "Connection", question: "Could I connect the phrases?", levels: YMNU_LEVELS },
    { key: "transitions", area: "Transitions", question: "Did I notice any difficult transitions?", levels: YMNU_LEVELS },
    { key: "improvement", area: "Reflection", question: "Could I identify one improvement from my first take?", levels: YMNU_LEVELS },
    { key: "comfort", area: "Comfort", question: "Did I remain comfortable while singing?", levels: YMNU_LEVELS },
  ];

  const REVIEW_ROWS = [
    { key: "wordsClear", area: "Words", question: "Were the words clear?", levels: YMN_LEVELS },
    { key: "startPitchOk", area: "Starting pitch", question: "Was the starting pitch comfortable?", levels: YMN_LEVELS },
    { key: "rhythmSteady", area: "Rhythm", question: "Did the rhythm remain steady?", levels: YMN_LEVELS },
    { key: "breathOk", area: "Breath", question: "Were the breathing points comfortable?", levels: YMN_LEVELS },
    { key: "transitionsConnected", area: "Transitions", question: "Did the transitions feel connected?", levels: YMN_LEVELS },
    { key: "direction", area: "Direction", question: "Did the melody maintain its direction?", levels: YMN_LEVELS },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 23 -> 22 -> 21 -> 20 -> 2 -> 1) ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_DEGREE * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c23 = (ClassActivity.get("L1C23").answers.setup || {}).note;
    if (ok(c23)) return c23;
    const c22 = (ClassActivity.get("L1C22").answers.setup || {}).note;
    if (ok(c22)) return c22;
    const c21 = (ClassActivity.get("L1C21").answers.setup || {}).note;
    if (ok(c21)) return c21;
    const c20 = (ClassActivity.get("L1C20").answers.setup || {}).note;
    if (ok(c20)) return c20;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_DEGREE * STEP, fallback));
  }
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };

  /* ---- chain exercise (PitchMatchExercise) — Exercise 7, Phrase B's movement ---- */
  const TRANSITION_EX = {
    eyebrow: "Exercise 7 · Smooth transitions", title: "“I will try again” — a comfortable skip and return",
    intro: "Phrase B moves further than Phrase A — up to “try”, then back down to “again”. Hum it, then sing it on “oo”, then “ah”, then with the words.",
    chain: true, refLabel: "Reference notes",
    slots: [{ key: "hum", label: "Hum" }, { key: "oo", label: "“oo”" }, { key: "ah", label: "“ah”" }, { key: "words", label: "With words" }],
    assessment: null, noEstimate: true,
    isComplete: (s) => ["hum", "oo", "ah", "words"].every((k) => s.takes[k] && s.takes[k].mediaId),
  };

  function assignmentItems(rec) {
    const c = rec.checkpoints;
    return [
      { text: "Listen to the reference.", done: () => !!c.referenceListened },
      { text: "Practice the melody in small sections.", done: () => !!c.sectionsPracticed },
      { text: "Practice the rhythm.", done: () => !!c.rhythmCompleted },
      { text: "Identify comfortable breathing points.", done: () => !!c.breathingReviewed },
      { text: "Sing the sections with words.", done: () => !!c.dictionCompleted },
      { text: "Connect the sections.", done: () => !!c.phraseConnectionPracticed },
      { text: "Record a natural first attempt.", done: () => !!(take(rec, "assignNatural") && take(rec, "assignNatural").mediaId) },
      { text: "Identify one area to improve.", done: () => !!q(rec, "targetedProblem") },
      { text: "Practice that area separately.", done: () => !!(take(rec, "targetedPracticeTake") && take(rec, "targetedPracticeTake").mediaId) },
      { text: "Record a final complete attempt.", done: () => !!(take(rec, "assignFinal") && take(rec, "assignFinal").mediaId) },
    ];
  }

  function derivedCheckpoints(rec) {
    const out = {};
    out.warmup = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (A(rec, "setup").songChoice) out.songSelected = true;
    if (q(rec, "listenPhrases")) out.referenceListened = true;
    const sections = A(rec, "sections");
    if (sections.a && sections.b) out.sectionsPracticed = true;
    if (take(rec, "openingPhraseTake") && q(rec, "startNoteComfort")) out.startingNotePracticed = true;
    if (take(rec, "rhythmPracticeTake")) out.rhythmCompleted = true;
    if (typeof A(rec, "breath").mark === "number") out.breathingReviewed = true;
    if (["dictionSpeakNatural", "dictionSpeakRhythm", "dictionSingSlowly", "dictionSingNatural"].every((k) => take(rec, k))) out.dictionCompleted = true;
    if (TRANSITION_EX.isComplete(exState(rec, "transition"))) out.transitionCompleted = true;
    if (take(rec, "sectionARecord") && take(rec, "sectionBRecord") && take(rec, "combinedRecord")) out.phraseConnectionPracticed = true;
    if (take(rec, "dynamicsTake")) out.dynamicsPracticed = true;
    if (take(rec, "completeSongPractice")) out.completeSongAttempt = true;
    if (REVIEW_ROWS.every((r) => A(rec, "review")[r.key]) && q(rec, "reviewStrong") && q(rec, "reviewPractice")) out.recordingsReviewed = true;
    if (take(rec, "targetedPracticeTake")) out.targetedPracticeCompleted = true;
    if (take(rec, "finalPerformance")) out.finalAttemptRecorded = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    if (assignmentItems(rec).every((i) => i.done())) out.assignmentCompleted = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const wordSpans = (words) => words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ");
  const lyricLine = (words) => `<p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">${wordSpans(words)}</p>`;

  function songCards(choice) {
    const CARDS = [
      { key: "appSong", title: `Niswara's practice song`, body: `“${SONG_TITLE}” — a short, original two-phrase song built for this class.` },
      { key: "pianoExplore", title: "Explore on the piano first", body: `Pick a comfortable note yourself, then follow the same guided song below.` },
      { key: "ownSong", title: "A song I already know", body: `Practice this class's skills, then apply them to your own song's words.` },
      { key: "customMelody", title: "My own original melody", body: `Record a short tune of your own for your library — today's guided practice still uses the song below.` },
    ];
    return `<div class="grid sm:grid-cols-2 gap-3" data-song-cards>
      ${CARDS.map((c) => `
        <button type="button" data-song-choice="${c.key}" class="text-left rounded-2xl border p-4 transition-colors ${choice === c.key ? "border-gold-400/40 bg-gold-500/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
          <p class="font-display text-lg text-ink-50 mb-1">${c.title}</p>
          <p class="text-xs text-ink-400 leading-relaxed">${c.body}</p>
        </button>`).join("")}
    </div>`;
  }

  function songExtraHtml(choice, rec) {
    if (choice === "ownSong") {
      const own = A(rec, "own");
      return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mt-3">
          <label class="block text-sm text-ink-200 mb-1.5" for="own-title">Song title (optional)</label>
          <input type="text" id="own-title" data-own-title maxlength="80" class="field mb-3" placeholder="e.g. a song I know" value="${Utils.escapeHtml(own.title || "")}">
          <label class="block text-sm text-ink-200 mb-1.5" for="own-text">My practice words (private — only you can see this)</label>
          <textarea id="own-text" data-own-text rows="2" maxlength="160" class="field" placeholder="A few words from your song to practice diction with later.">${Utils.escapeHtml(own.text || "")}</textarea>
        </div>`;
    }
    if (choice === "customMelody") {
      return `<div class="mt-3">${recCard("customMelodyTake", "Record your own melody", "Saved to your private recording library. It isn't used as a pitch reference below — today's guided practice uses Niswara's song so every skill has a clear reference.", 20)}</div>`;
    }
    return "";
  }

  function breathEditor(mark) {
    return `<div class="flex flex-wrap items-center gap-1" data-breath-editor>
      ${SONG_WORDS.map((w, i) => `<span class="font-display text-lg text-ink-100">${Utils.escapeHtml(w)}</span>${i < SONG_WORDS.length - 1 ? `<button type="button" data-breath-gap="${i}" class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${mark === i ? "bg-gold-500/20 text-gold-300" : "text-ink-600 hover:text-ink-300"}" aria-label="Mark a breath after “${w}”">${mark === i ? "💨" : "·"}</button>` : ""}`).join("")}
    </div>`;
  }

  function recPanelHtml(problem) {
    return problem ? `<div class="rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] p-4 mt-4"><p class="text-sm text-ink-200">${REC_MAP[problem]}</p></div>` : "";
  }

  function milestone() {
    const steps = ["PITCH", "RHYTHM", "BREATH", "DICTION", "TRANSITIONS", "PHRASING", "DYNAMICS"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 24 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-6">ONE SONG. MANY SKILLS. ONE CONNECTED PERFORMANCE.</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-6">
          ${steps.map((s, i) => `<span class="flow-chip !text-sm">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">+</span>` : ""}`).join("")}
        </div>
        <p class="text-sm text-ink-300">You do not need to master every skill before singing a song.</p>
        <p class="text-sm text-ink-100">You learn to coordinate these skills by practicing music in manageable steps.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["songSelected", "referenceListened", "sectionsPracticed", "startingNotePracticed", "rhythmCompleted", "breathingReviewed", "dictionCompleted", "transitionCompleted", "phraseConnectionPracticed", "dynamicsPracticed", "completeSongAttempt", "recordingsReviewed", "targetedPracticeCompleted", "finalAttemptRecorded"].filter((k) => c[k]).length;
    return [
      [`Song exercises (${ex}/14)`, ex === 14],
      ["Self-evaluation", !!c.selfEval],
      ["Completed the assignment", !!c.assignmentCompleted],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">A song is not merely a sequence of correct notes — it has phrases, breathing points, rhythm, words, dynamics and direction. You don't need to master every skill before singing one; you learn to coordinate them by practicing music in manageable steps.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll record a structured performance and compare it with where you started.` : "Next is the Foundation Final Assessment & Progress Recording — more is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Bring everything together. One song, one connected musical experience.</h3>
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
            </div>` : `<p class="text-sm text-ink-500 mt-6">More of Level 1 is on its way.</p>`}
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
        ${bridge}
      </div>`;
  }

  function progressStats(cls) {
    return [
      { label: "Recordings", value: ClassActivity.count(cls.id, "recordings") },
      { label: `${PRACTICE_CATEGORY} logged here`, value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const choice = A(rec, "setup").songChoice || "appSong";
    const sections = A(rec, "sections");
    const review = A(rec, "review");
    const breathMark = A(rec, "breath").mark;
    const problem = sel("targetedProblem");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Bring everything together.", `
          ${p("Until now, we have practiced individual skills. Today, we begin bringing those skills together in a complete song.")}
          ${p("A song is not merely a sequence of correct notes. It has phrases, breathing points, rhythm, words, dynamics and emotional direction.")}
          ${p("Our goal is not perfection. Our goal is to sing a complete, manageable song while noticing what works and what needs more practice.")}
          ${flowStrip(["LISTEN", "LEARN", "BREAK DOWN", "PRACTICE", "CONNECT", "PERFORM", "REVIEW"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Optional warm-up", `
          ${narrow(p("If you'd like to warm up first, use the card above — Quick or Full, or skip it entirely. Return here afterward; nothing here needs a full warm-up."))}
        `)}

        ${chapter("choose", 3, "Choose a song", `
          ${narrow(p("Pick how you'd like to approach today's song. Whichever you choose, the guided exercises below use Niswara's own short practice song, so every exercise has a clear, honest reference."))}
          ${songCards(choice)}
          <div data-song-extra>${songExtraHtml(choice, rec)}</div>
        `, { wide: true })}

        ${chapter("listen", 4, `Exercise 1 — Listen before singing: “${SONG_TITLE}”`, `
          ${narrow(p("Listen without singing. Just notice."))}
          <div class="flex flex-wrap gap-3 mb-5">
            <button type="button" data-play-song="full" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Reference</button>
          </div>
          <div class="flex flex-col gap-4">
            ${SelfAssessment.render("listenPhrases-q", { ...Q.listenPhrases, selected: sel("listenPhrases") })}
            ${SelfAssessment.render("listenRise-q", { ...Q.listenRise, selected: sel("listenRise") })}
            ${SelfAssessment.render("listenFall-q", { ...Q.listenFall, selected: sel("listenFall") })}
            ${SelfAssessment.render("listenEasy-q", { ...Q.listenEasy, selected: sel("listenEasy") })}
            ${SelfAssessment.render("listenHard-q", { ...Q.listenHard, selected: sel("listenHard") })}
          </div>
        `)}

        ${chapter("learn", 5, "Exercise 2 — Learn the melody in small sections", `
          ${narrow(p("Master a small section before connecting it to the next."))}
          ${flowStrip(["SMALL SECTION", "PRACTICE", "CHECK", "CONNECT"])}
          <div class="grid sm:grid-cols-2 gap-4">
            ${["a", "b"].map((k) => `
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-section-card="${k}">
                <p class="font-display text-lg text-ink-50 mb-1">Section ${k.toUpperCase()}</p>
                <p class="text-sm text-ink-300 mb-3">“${(k === "a" ? PHRASE_A_WORDS : PHRASE_B_WORDS).join(" ")}”</p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <button type="button" data-play-sec="${k}:normal" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Play</button>
                  <button type="button" data-play-sec="${k}:normal" class="vr-btn">↺ Replay</button>
                  <button type="button" data-play-sec="${k}:slow" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Slower</button>
                </div>
                <p class="text-xs text-ink-500 mb-3">Use the piano below (Exercise 3) to find these notes by ear if you'd like.</p>
                <button type="button" data-mark-practiced="${k}" class="vr-btn ${sections[k] ? "vr-btn-gold" : ""}">${sections[k] ? "✓ Practiced" : "Mark as practiced"}</button>
              </div>`).join("")}
          </div>
        `, { wide: true })}

        ${chapter("note", 6, "Exercise 3 — Match the starting note", `
          ${narrow(p("Play the starting note. Listen carefully. Hum it. Then sing the opening phrase."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("scs-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${narrow(p("If this note doesn't feel comfortable, tap another key above — every exercise below follows it."))}
          ${recCard("openingPhraseTake", "Sing the opening phrase", "“I can sing now” — repeat if needed.", 10)}
          <div class="mt-4">${SelfAssessment.render("startNoteComfort-q", { ...Q.startNoteComfort, selected: sel("startNoteComfort") })}</div>
        `, { wide: true })}

        ${chapter("rhythm", 7, "Exercise 4 — Rhythm before lyrics", `
          ${narrow(p("Tap or count the beat. Speak the words rhythmically. Then try it in time with the metronome, and finally sing it slowly."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${Metronome.render("scs-metro", { bpm: BPM })}
          </div>
          <div data-beatguide-host></div>
          ${recCard("rhythmPracticeTake", "Speak or sing the words with the beat", "", 15)}
        `, { wide: true })}

        ${chapter("breath", 8, "Exercise 5 — Breath planning", `
          ${narrow(p("Tap between two words to mark where you'll breathe. Breathing should support the musical phrase, not become a competition to sing as long as possible."))}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">${breathEditor(breathMark)}</div>
          <p class="text-xs text-ink-500 mt-2">If a phrase feels too long, that's a sign to divide your practice into shorter sections — not to hold the breath.</p>
        `)}

        ${chapter("diction", 9, "Exercise 6 — Diction and pronunciation", `
          ${narrow(p("Practice the words separately before singing. Clear words without exaggerating mouth or jaw movement."))}
          ${flowStrip(["SPEAK NATURALLY", "SPEAK IN RHYTHM", "SING SLOWLY", "SING NATURALLY"])}
          ${lyricLine(SONG_WORDS)}
          <div class="grid sm:grid-cols-2 gap-3 mb-5">
            ${recCard("dictionSpeakNatural", "Speak naturally", "", 10)}
            ${recCard("dictionSpeakRhythm", "Speak in rhythm", "", 10)}
            ${recCard("dictionSingSlowly", "Sing slowly", "", 12)}
            ${recCard("dictionSingNatural", "Sing naturally", "", 12)}
          </div>
          ${ObservationChecklist.render("scs-words-obs", [{ key: "hardWords", title: "Which words need more care?", prompt: "Choose any that disappeared, became unclear, or interfered with pitch — this is awareness, not a grade.", options: SONG_WORDS }], { hardWords: A(rec, "obs").hardWords || [] })}
        `, { wide: true })}

        ${chapter("transitions", 10, "Exercise 7 — Smooth note transitions", PitchMatchExercise.render("scs-transition", TRANSITION_EX))}

        ${chapter("transitions", 11, "Exercise 8 — Connect the phrases", `
          ${narrow(p("Practice the two sections separately, then sing them together — keeping the melody's direction instead of treating each note as its own event. A comfortable breath at the boundary is expected."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            ${recCard("sectionARecord", "Section A alone", "“I can sing now”", 10)}
            ${recCard("sectionBRecord", "Section B alone", "“I will try again”", 10)}
          </div>
          ${recCard("combinedRecord", "Both sections together", "“I can sing now. I will try again.”", 15)}
        `)}

        ${chapter("dynamics", 12, "Exercise 9 — Add simple dynamics", `
          ${narrow(p("A gentle beginning, natural development, comfortable musical emphasis, and a relaxed ending. Musical expression does not require excessive volume — no loud climax is needed."))}
          ${recCard("dynamicsTake", "Sing the song with natural, comfortable dynamics", "", 15)}
          <div class="mt-4">${SelfAssessment.render("dynamicsPushed-q", { ...Q.dynamicsPushed, selected: sel("dynamicsPushed") })}</div>
        `)}

        ${chapter("perform", 13, "Exercise 10 — Sing the complete song", `
          ${narrow(p("Choose how you'd like to practice. Mode C (Independent) isn't required to complete this class."))}
          <div class="flex flex-wrap gap-2 mb-4">
            <button type="button" data-mode="guided" class="ex-chip">Mode A · Guided</button>
            <button type="button" data-mode="reference" class="ex-chip">Mode B · Reference support</button>
            <button type="button" data-mode="independent" class="ex-chip">Mode C · Independent</button>
          </div>
          <div data-mode-panel class="mb-4"></div>
          ${recCard("completeSongPractice", "Sing the complete song", "Any mode above — this is the same recording either way.", 18)}
        `)}

        ${chapter("record", 14, "Exercise 11 — Record three takes", `
          ${narrow(p("Allow breaks between recordings. The loudest, longest or highest-pitched take isn't automatically the best."))}
          ${recCard("take1Natural", "Take 1 — Natural attempt", "Sing without stopping to correct every mistake.", 18)}
          <div class="my-4">${SelfAssessment.render("take2Issue-q", { ...Q.take2Issue, selected: sel("take2Issue") })}</div>
          ${recCard("take2Targeted", "Take 2 — Targeted improvement", "Focus on the issue you chose above.", 18)}
          ${recCard("take3Musical", "Take 3 — Musical connection", "Sing it as one connected musical experience.", 18)}
        `)}

        ${chapter("review", 15, "Exercise 12 — Listen and compare", `
          ${narrow(p("Listen to one of your recent complete-song takes, then answer honestly."))}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mb-5" data-review-player-host></div>
          ${ControlCheck.render("scs-review", REVIEW_ROWS, review)}
          <div class="mt-4 flex flex-col gap-4">
            ${SelfAssessment.render("reviewStrong-q", { ...Q.reviewStrong, selected: sel("reviewStrong") })}
            ${SelfAssessment.render("reviewPractice-q", { ...Q.reviewPractice, selected: sel("reviewPractice") })}
          </div>
        `)}

        ${chapter("review", 16, "Exercise 13 — Targeted correction", `
          ${narrow(p("Choose one difficulty. You don't need to repeat the whole song to correct it."))}
          ${SelfAssessment.render("targetedProblem-q", { ...Q.targetedProblem, selected: problem })}
          <div data-rec-panel>${recPanelHtml(problem)}</div>
          <div class="mt-4">${recCard("targetedPracticeTake", "Practice that area, just that part", "", 12)}</div>
        `)}

        ${chapter("final", 17, "Exercise 14 — Final performance", `
          <ul class="grid sm:grid-cols-2 gap-1.5 text-sm text-ink-300 my-4">${["Relax your body.", "Choose a comfortable starting pitch.", "Take a natural breath.", "Remember the phrase direction.", "Focus on communicating the song.", "Accept small imperfections."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}</ul>
          ${recCard("finalPerformance", "Record your final performance", "Saved to your private recording library.", 20)}
        `)}

        ${chapter("evaluate", 18, "Self-assessment", `
          ${p("Your own honest read — not objective proof of vocal proficiency.")}
          ${ControlCheck.render("scs-eval", CHECK_ROWS, A(rec, "check"))}
          <div class="mt-4">${SelfAssessment.render("favoriteSection-q", { ...Q.favoriteSection, selected: sel("favoriteSection") })}</div>
          <div class="mt-4">
            <label class="block text-sm text-ink-200 mb-1.5" for="scs-next">What should I practice next?</label>
            <textarea id="scs-next" data-next-practice rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml(A(rec, "selfEvalNotes").nextPractice || "")}</textarea>
          </div>
        `)}

        ${chapter("practice", 19, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused sessions with breaks — not excessive practice time.")}
          ${Timer.render("scs-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 20, `Class ${cls.number} Assignment — My First Complete Song`, `
          ${p("Choose a simple song or original melody, then complete these steps. You may split this across multiple sessions.")}
          ${LessonKit.renderAssignment({
            title: "My First Complete Song",
            items: assignmentItems(rec).map((i) => i.text),
            isDone: (i) => assignmentItems(rec)[i].done(),
            isAuto: () => true,
            footer: `<div class="grid sm:grid-cols-2 gap-3 mt-4">${recCard("assignNatural", "Natural first attempt", "", 18)}${recCard("assignFinal", "Final complete attempt", "", 18)}</div>`,
          })}
        `)}

        ${chapter("practice", 21, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-scs", { placeholder: "e.g. The song I practiced... The section I found difficult... My next practice goal..." })}
        `)}

        ${chapter("complete", 22, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 23, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
        if (k === "selfEval") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- Exercise 3: reference piano ---- */
    own(VirtualPiano.wire(container, "scs-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi < RANGE.from || midi + MAX_DEGREE * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from)} and ${N(RANGE.to - MAX_DEGREE * STEP)} so the whole song stays comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exTransition.refresh();
      },
    }));

    /* ---- song selection ---- */
    function onSongChoice(e) {
      const btn = e.target.closest("[data-song-choice]");
      if (!btn) return;
      const choice = btn.dataset.songChoice;
      set("setup", "songChoice", choice);
      $("[data-song-cards]").querySelectorAll("[data-song-choice]").forEach((b) => {
        b.classList.toggle("border-gold-400/40", b === btn); b.classList.toggle("bg-gold-500/[0.06]", b === btn);
        b.classList.toggle("border-white/10", b !== btn); b.classList.toggle("bg-white/[0.02]", b !== btn);
      });
      const host = $("[data-song-extra]");
      host.innerHTML = songExtraHtml(choice, rec0());
      wireExtraInputs();
      wireAssignRecCards(); // the customMelodyTake recCard may have just been (re)created
      syncCheckpoints();
      refreshLive();
    }
    container.addEventListener("click", onSongChoice);
    cleanups.push(() => container.removeEventListener("click", onSongChoice));

    function wireExtraInputs() {
      const titleEl = $("[data-own-title]"), textEl = $("[data-own-text]");
      if (titleEl) { const save = Utils.debounce((v) => set("own", "title", v), 400); titleEl.addEventListener("input", () => save(titleEl.value)); }
      if (textEl) { const save = Utils.debounce((v) => set("own", "text", v), 400); textEl.addEventListener("input", () => save(textEl.value)); }
    }
    wireExtraInputs();

    /* ---- Exercise 1 / Exercise 10 Mode B: full-song reference playback ---- */
    function onPlaySong(e) {
      const btn = e.target.closest("[data-play-song]");
      if (!btn) return;
      const notes = degreesToNotes(base(), SONG_DEGREES);
      PianoSynth.playSequence(notes, btn.dataset.playSong === "full-slow" ? { duration: 0.85, gap: 0.3 } : { duration: 0.55, gap: 0.18 });
    }
    container.addEventListener("click", onPlaySong);
    cleanups.push(() => container.removeEventListener("click", onPlaySong));

    /* ---- Exercise 2: section playback + mark-as-practiced ---- */
    function onSectionControls(e) {
      const play = e.target.closest("[data-play-sec]");
      if (play) {
        const [k, speed] = play.dataset.playSec.split(":");
        const degrees = k === "a" ? PHRASE_A : PHRASE_B;
        PianoSynth.playSequence(degreesToNotes(base(), degrees), speed === "slow" ? { duration: 0.85, gap: 0.3 } : { duration: 0.55, gap: 0.18 });
        return;
      }
      const mark = e.target.closest("[data-mark-practiced]");
      if (mark) {
        const k = mark.dataset.markPracticed;
        const sections = { ...A(rec0(), "sections") };
        sections[k] = !sections[k];
        set("sections", k, sections[k]);
        mark.classList.toggle("vr-btn-gold", sections[k]);
        mark.textContent = sections[k] ? "✓ Practiced" : "Mark as practiced";
        syncCheckpoints(); refreshLive();
      }
    }
    container.addEventListener("click", onSectionControls);
    cleanups.push(() => container.removeEventListener("click", onSectionControls));

    /* ---- Exercise 4: BeatGuide (built from the current base note) ---- */
    const beatBase = base();
    const BARS = [
      PHRASE_A.map((d, i) => ({ t: PHRASE_A_WORDS[i], midi: beatBase + d * STEP })),
      PHRASE_B.map((d, i) => ({ t: PHRASE_B_WORDS[i], midi: beatBase + d * STEP })),
    ];
    $("[data-beatguide-host]").innerHTML = BeatGuide.render("scs-beatguide", { bars: BARS, guideToggle: true, startLabel: "Start" });
    own(Metronome.wire(container, "scs-metro", { bpm: BPM }));
    own(BeatGuide.wire(container, "scs-beatguide", { bpm: BPM, bars: BARS, loops: 2, countIn: 4 }));

    /* ---- Exercise 5: breath editor ---- */
    function onBreathGap(e) {
      const btn = e.target.closest("[data-breath-gap]");
      if (!btn) return;
      const i = Number(btn.dataset.breathGap);
      set("breath", "mark", i);
      $("[data-breath-editor]").outerHTML = breathEditor(i);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onBreathGap);
    cleanups.push(() => container.removeEventListener("click", onBreathGap));

    /* ---- Exercise 6: word-clarity observation ---- */
    cleanups.push(ObservationChecklist.wire(container, "scs-words-obs", {
      selected: { hardWords: A(rec0(), "obs").hardWords || [] },
      onChange: (_, values) => { set("obs", "hardWords", values); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 7: transition chain ---- */
    const exTransition = own(PitchMatchExercise.wire(container, "scs-transition", TRANSITION_EX, {
      classId, exerciseId: "transition", state: (rec0().answers.exercises || {}).transition || {},
      getNotes: () => degreesToNotes(base(), PHRASE_B), isComplete: TRANSITION_EX.isComplete,
      onState: (s) => { set("exercises", "transition", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Exercise 10: practice-mode panel ---- */
    const MODE_PANELS = {
      guided: `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-ink-300 leading-relaxed">Section A first ("I can sing now"), breathe, then Section B ("I will try again"). Take your time between sections.</div>`,
      reference: `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><button type="button" data-play-song="full" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Reference</button><p class="text-xs text-ink-500 mt-2">Play it before or while you sing.</p></div>`,
      independent: `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-ink-300 leading-relaxed">Sing the song on your own, without a continuous reference. This mode isn't required to complete the class.</div>`,
    };
    function onMode(e) {
      const btn = e.target.closest("[data-mode]");
      if (!btn) return;
      container.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-selected", b === btn));
      $("[data-mode-panel]").innerHTML = MODE_PANELS[btn.dataset.mode];
      set("setup", "practiceMode", btn.dataset.mode);
    }
    container.addEventListener("click", onMode);
    cleanups.push(() => container.removeEventListener("click", onMode));

    /* ---- Exercise 12: review player over the most recent complete-song take ---- */
    let reviewPlayer = null;
    function latestSongTake() {
      const rec = rec0();
      return take(rec, "completeSongPractice") || take(rec, "take3Musical") || take(rec, "finalPerformance") || take(rec, "take1Natural");
    }
    function mountReviewPlayer() {
      const host = $("[data-review-player-host]");
      if (reviewPlayer) { reviewPlayer.destroy(); reviewPlayer = null; }
      const t = latestSongTake();
      if (!t) { host.innerHTML = `<p class="text-sm text-ink-500">Record a complete-song take above (Exercise 10 or 11) — then listen back here.</p>`; return; }
      host.innerHTML = WaveformPlayer.render("scs-review-wf", { section: false });
      reviewPlayer = WaveformPlayer.wire(host, "scs-review-wf", { mediaId: t.mediaId });
    }
    mountReviewPlayer();

    /* ---- generic self-assess chip dispatcher ---- */
    const assessMap = {
      "listenPhrases-q": "listenPhrases", "listenRise-q": "listenRise", "listenFall-q": "listenFall",
      "listenEasy-q": "listenEasy", "listenHard-q": "listenHard", "startNoteComfort-q": "startNoteComfort",
      "dynamicsPushed-q": "dynamicsPushed", "take2Issue-q": "take2Issue", "targetedProblem-q": "targetedProblem",
      "favoriteSection-q": "favoriteSection", "reviewStrong-q": "reviewStrong", "reviewPractice-q": "reviewPractice",
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name] || group.closest("[data-pm]")) return; // PitchMatchExercise handles its own chips
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
      syncCheckpoints();
      if (name === "targetedProblem-q") {
        const panel = $("[data-rec-panel]");
        if (panel) panel.innerHTML = recPanelHtml(chip.dataset.assessChoice);
      }
      refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- Exercise 18: self-evaluation + reflection ---- */
    cleanups.push(ControlCheck.wire(container, "scs-eval", { onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); } }));
    cleanups.push(ControlCheck.wire(container, "scs-review", { onChange: (k, v) => { set("review", k, v); syncCheckpoints(); refreshLive(); } }));
    const nextPracticeEl = $("[data-next-practice]");
    if (nextPracticeEl) {
      const save = Utils.debounce((v) => set("selfEvalNotes", "nextPractice", v), 500);
      nextPracticeEl.addEventListener("input", () => save(nextPracticeEl.value));
    }

    /* ---- all plain recordings ---- */
    const NAMES = {
      customMelodyTake: "My own melody", openingPhraseTake: "Opening phrase", rhythmPracticeTake: "Rhythm practice",
      dictionSpeakNatural: "Diction — speak naturally", dictionSpeakRhythm: "Diction — speak in rhythm",
      dictionSingSlowly: "Diction — sing slowly", dictionSingNatural: "Diction — sing naturally",
      sectionARecord: "Section A", sectionBRecord: "Section B", combinedRecord: "Sections combined",
      dynamicsTake: "Dynamics", completeSongPractice: "Complete song practice",
      take1Natural: "Take 1 — natural", take2Targeted: "Take 2 — targeted", take3Musical: "Take 3 — musical connection",
      targetedPracticeTake: "Targeted practice", finalPerformance: "Final performance",
      assignNatural: "Assignment — natural first attempt", assignFinal: "Assignment — final complete attempt",
    };
    const MAX_SECONDS = {
      customMelodyTake: 20, openingPhraseTake: 10, rhythmPracticeTake: 15,
      dictionSpeakNatural: 10, dictionSpeakRhythm: 10, dictionSingSlowly: 12, dictionSingNatural: 12,
      sectionARecord: 10, sectionBRecord: 10, combinedRecord: 15, dynamicsTake: 15, completeSongPractice: 18,
      take1Natural: 18, take2Targeted: 18, take3Musical: 18, targetedPracticeTake: 12, finalPerformance: 20,
      assignNatural: 18, assignFinal: 18,
    };
    function wireAssignRecCards() {
      Object.keys(NAMES).forEach((k) => {
        if (container.querySelector(`[data-rc="rc-${k}"]`) && !container.querySelector(`[data-rc="rc-${k}"]`)._wired) {
          const api = RecordingCard.wire(container, `rc-${k}`, {
            classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k] || 15,
            meta: { name: `Class 24 — ${NAMES[k]}`, exercise: `song-${k}` },
            onSaved: (t) => {
              set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints();
              if (k === "completeSongPractice" || k === "take3Musical" || k === "finalPerformance" || k === "take1Natural") mountReviewPlayer();
              refreshLive();
            },
          });
          container.querySelector(`[data-rc="rc-${k}"]`)._wired = true;
          cleanups.push(() => api.destroy());
        }
      });
    }
    wireAssignRecCards();

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "scs-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}. Short, focused sessions are perfect.`;
        refreshLive();
      },
    }));

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-scs", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: "A song is more than correct notes — it has phrases, breath, rhythm, words, dynamics and direction. I don't need to master every skill before I can sing one.",
        struggled: REC_MAP[q(rec, "targetedProblem")] || "",
        toPractice: A(rec, "selfEvalNotes").nextPractice || "",
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
      if (reviewPlayer) reviewPlayer.destroy();
      PianoSynth.stopAll();
      VoiceRecorder.stopPlayback();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
