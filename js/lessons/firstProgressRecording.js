/* ============================================================
   CLASS 10 — FIRST PROGRESS RECORDING (interactive milestone)

   Rendered by ClassDetailPage for interactive: "first-progress-recording".

   Core idea: "Record where you are now. This is your starting
   point for measuring future growth." This is a MILESTONE class —
   it introduces almost no new technique, it brings together
   Classes 3-9 into one structured, honest baseline recording.
   Not an audition, not graded, never "X% accurate." No AI
   judgement. "Not sure" stays a valid answer everywhere.

   Five parts, in order: speaking → reference note → simple
   pattern → rhythm → song excerpt. Once all five exist and the
   rest of the class is done, the recordings become the account's
   BASELINE — re-recording any part after that asks for
   confirmation first (onBeforeRecord, added to RecordingCard and
   PitchMatchExercise for this).

   Reuses: LessonKit, VirtualPiano/PianoSynth (Class 3),
   PitchMatchExercise/SelfAssessment (Class 4), RecordingCard
   (Class 5), the full Metronome widget (Class 6, not just
   BeatGuide — the spec asks for the metronome itself). No new
   recording/storage system: every take still goes through
   VoiceRecorder -> Media -> the account's private "recordings"
   bucket exactly as Classes 3-9 already do, and "baseline" is
   just a flag in this class's own ClassActivity answers (synced
   via class_progress, already owner-only RLS) — no new table.

   The common Warm-up (js/warmup.js) unlocks right before this
   class: the intro offers it, and the pre-recording check asks
   "warm up first?" — both optional; recording never waits on it.
   ============================================================ */

const FirstProgressRecordingLesson = (() => {
  const STAGES = [
    { id: "intro", label: "Intro" },
    { id: "rules", label: "Rules" },
    { id: "check", label: "Ready" },
    { id: "speaking", label: "Speaking" },
    { id: "note", label: "Note" },
    { id: "pattern", label: "Pattern" },
    { id: "rhythm", label: "Rhythm" },
    { id: "song", label: "Song" },
    { id: "library", label: "Library" },
    { id: "evaluate", label: "Evaluate" },
    { id: "reflect", label: "Reflect" },
    { id: "focus", label: "Focus" },
    { id: "complete", label: "Milestone" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2;
  const BPM = 65;
  const MIN = { speaking: 8, song: 15 };

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson" },
    { key: "preCheck", label: "Pre-recording checklist completed" },
    { key: "speaking", label: "Speaking recording completed" },
    { key: "referenceNote", label: "Reference-note recording completed" },
    { key: "pitchPattern", label: "Pitch-pattern recording completed" },
    { key: "rhythm", label: "Rhythm recording completed" },
    { key: "song", label: "Song recording completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "focus", label: "Primary focus selected" },
    { key: "baseline", label: "Baseline finalized" },
  ];

  const PRE_CHECK_ITEMS = [
    "I am comfortable",
    "My voice feels normal",
    "I am not forcing my volume",
    "I am not trying to sing higher than comfortable",
    "I have completed my warm-up",
    "My recording environment is reasonably quiet",
  ];

  const EVAL_CATEGORIES = [
    { key: "pitch", question: "Pitch — how did your pitch feel?", options: [
      { value: "comfortable", label: "Comfortable", tone: "good" }, { value: "mostly", label: "Mostly comfortable", tone: "good" },
      { value: "uncertain", label: "Uncertain", tone: "maybe" }, { value: "difficult", label: "Difficult", tone: "maybe" } ] },
    { key: "rhythm", question: "Rhythm — did you stay with the beat?", options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" },
      { value: "sometimes", label: "Sometimes", tone: "maybe" }, { value: "notyet", label: "Not yet", tone: "maybe" } ] },
    { key: "voice", question: "Voice — did your voice feel relaxed?", options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" }, { value: "notreally", label: "Not really", tone: "maybe" } ] },
    { key: "words", question: "Words — were your words clear?", options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" }, { value: "unclear", label: "Some were unclear", tone: "maybe" } ] },
    { key: "transitions", question: "Transitions — did your voice move smoothly between notes?", options: [
      { value: "yes", label: "Yes", tone: "good" }, { value: "mostly", label: "Mostly", tone: "good" }, { value: "notalways", label: "Not always", tone: "maybe" } ] },
    { key: "overall", question: "Overall — how did you feel about this recording?", options: [
      { value: "verycomfortable", label: "Very comfortable", tone: "good" }, { value: "comfortable", label: "Comfortable", tone: "good" },
      { value: "neutral", label: "Neutral", tone: "neutral" }, { value: "uncomfortable", label: "A little uncomfortable", tone: "maybe" }, { value: "practice", label: "Need more practice", tone: "maybe" } ] },
  ];

  const FOCUS_OPTIONS = ["Pitch", "Rhythm", "Breathing", "Relaxation", "Vocal stability", "Pronunciation", "Transitions", "Confidence", "Other"];

  const MILESTONE_ACHIEVEMENTS = [
    "Pitch awareness", "Pitch matching experience", "Self-listening ability", "Rhythm awareness",
    "Basic warm-up experience", "Relaxation awareness", "Basic vocal control", "Your first progress recording",
  ];

  const EX_NOTE = {
    eyebrow: "Part 2 · Reference Note", title: "Sing your reference note",
    intro: "Play the reference, pause, then sing it back gently.",
    flow: ["🎹 Hear", "🎤 Sing", "🎧 Listen back"],
    slots: [{ key: "take", label: "Your note", hint: "A few comfortable seconds" }],
    assessment: null,
    isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
  };
  const EX_PATTERN = {
    eyebrow: "Part 3 · Simple Pattern", title: "A short 1–2–3–2–1 pattern",
    intro: "Listen to the pattern first, then sing it back on a comfortable syllable.",
    chain: true, refLabel: "Reference pattern",
    slots: [{ key: "take", label: "Your pattern", hint: "Sing along on “ma”, “mee” or “noo”" }],
    assessment: null,
    isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  const patternNotes = (b) => [0, 1, 2, 1, 0].map((i) => b + i * STEP);

  /* ---------- derived state ---------- */
  function range(rec) {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range(rec);
    const own = A(rec, "setup").note;
    if (typeof own === "number" && own >= r.from && own <= r.to - 2 * STEP) return own;
    const n = (ClassActivity.get("L1C07").answers.setup || {}).note ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));

  function preCheckDone(rec) { return PRE_CHECK_ITEMS.every((_, i) => !!A(rec, "preCheck")[i]); }
  function selfEvalDone(rec) { const ev = A(rec, "evaluate"); return EVAL_CATEGORIES.every((c) => !!ev[c.key]); }
  function reflectionDone(rec, cls) { const r = A(rec, "reflection"); return cls.content.assignment.questions.every((_, i) => filled(r[i])); }
  function recordingsDone(rec) {
    const speaking = A(rec, "speaking").take, rhythm = A(rec, "rhythm").take, song = A(rec, "song").take;
    return !!(speaking && speaking.seconds >= MIN.speaking)
      && exDone(rec, "note", EX_NOTE) && exDone(rec, "pattern", EX_PATTERN)
      && !!rhythm && !!(song && song.seconds >= MIN.song);
  }
  function baselineDone(rec, cls) {
    return preCheckDone(rec) && recordingsDone(rec) && selfEvalDone(rec) && reflectionDone(rec, cls) && !!A(rec, "focus").value;
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (preCheckDone(rec)) out.preCheck = true;
    const speaking = A(rec, "speaking").take;
    if (speaking && speaking.seconds >= MIN.speaking) out.speaking = true;
    if (exDone(rec, "note", EX_NOTE)) out.referenceNote = true;
    if (exDone(rec, "pattern", EX_PATTERN)) out.pitchPattern = true;
    if (A(rec, "rhythm").take) out.rhythm = true;
    const song = A(rec, "song").take;
    if (song && song.seconds >= MIN.song) out.song = true;
    if (selfEvalDone(rec)) out.selfEval = true;
    out.reflection = reflectionDone(rec, cls);
    if (A(rec, "focus").value) out.focus = true;
    if (baselineDone(rec, cls)) out.baseline = true;
    return out;
  }

  /* ---------- small views ---------- */
  function hierarchyStrip() {
    const steps = ["PREPARE", "RECORD", "LISTEN", "REFLECT", "SAVE BASELINE", "CONTINUE"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em]">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    return [
      ["Pre-recording checklist", !!c.preCheck], ["Speaking sample", !!c.speaking], ["Reference note", !!c.referenceNote],
      ["Pitch pattern", !!c.pitchPattern], ["Rhythm exercise", !!c.rhythm], ["Song excerpt", !!c.song],
      ["Self-evaluation", !!c.selfEval], ["Reflected", !!c.reflection], ["Primary focus chosen", !!c.focus],
    ];
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const baseline = !!rec.checkpoints.baseline;
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");

    if (status === "completed") {
      const achievements = MILESTONE_ACHIEVEMENTS.map((a) => `
        <li class="flex items-center gap-2.5 text-sm text-ink-100">
          <span class="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center">${icon("check", "w-3 h-3")}</span>${a}
        </li>`).join("");
      return `
        <div class="rounded-3xl border border-gold-400/25 bg-gradient-to-br from-gold-500/[0.08] to-transparent p-6 sm:p-10 text-center shadow-glow">
          <p class="text-[11px] tracking-[0.3em] uppercase text-gold-300 mb-3">${icon("trophy", "w-4 h-4 inline-flex align-[-3px] mr-1.5")}First Milestone Complete</p>
          <h3 class="font-display text-3xl text-ink-50 mb-2">You've completed your first 10 classes.</h3>
          <p class="text-sm text-ink-400 mb-7">You now have:</p>
          <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-8">${achievements}</ul>
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 max-w-md mx-auto mb-8">
            <p class="font-display text-xl text-ink-50 mb-1">Your next goal isn't perfection.</p>
            <p class="font-display text-xl text-gold-300">It's consistency.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left max-w-xl mx-auto mb-6">
            <p class="text-sm text-ink-300 leading-relaxed mb-2">Now that we've recorded where you are today, we'll start building the individual skills that will improve your singing.</p>
            ${next ? `<p class="text-sm text-ink-400 leading-relaxed">“Good breathing for singing isn't about taking the biggest breath possible. It's about using breath comfortably and efficiently while singing a phrase” — <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, building on breathing, warm-up, relaxation, vocal control and this baseline.</p>` : ""}
          </div>
          ${next ? `
          <div class="flex flex-wrap justify-center gap-3">
            <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
            <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
            <a href="#/progress" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("chart", "w-4 h-4")} View Progress</a>
          </div>` : ""}
        </div>`;
    }

    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 text-center">
        ${baseline ? `
          <p class="text-[11px] tracking-[0.25em] uppercase text-gold-300 mb-2">${icon("mic", "w-4 h-4 inline-flex align-[-3px] mr-1")}Baseline Recording Created</p>
          <h3 class="font-display text-2xl text-ink-50 mb-4">This is your starting point.</h3>
        ` : `<h3 class="font-display text-2xl text-ink-50 mb-4">Almost there</h3>`}
        <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-6">${lines}</ul>
        <div>
          <button type="button" data-complete-class ${baseline ? "" : "disabled"}
            class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors ${baseline ? "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-glow" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
            Complete Class ${cls.number} ${icon("check", "w-4 h-4")}
          </button>
        </div>
      </div>`;
  }

  /* ---------- library ---------- */
  function libraryEntries(rec) {
    const parts = [
      { key: "speaking", label: "Speaking Sample", take: A(rec, "speaking").take },
      { key: "note", label: "Reference Note", take: exState(rec, "note").takes.take },
      { key: "pattern", label: "Pitch Pattern", take: exState(rec, "pattern").takes.take },
      { key: "rhythm", label: "Rhythm Exercise", take: A(rec, "rhythm").take },
      { key: "song", label: "Song Excerpt", take: A(rec, "song").take, extra: A(rec, "song").title },
    ];
    return parts.filter((p) => p.take);
  }

  function renderLibrary(rec) {
    const entries = libraryEntries(rec);
    const isBaseline = !!rec.checkpoints.baseline;
    if (!entries.length) {
      return Components.EmptyState("mic", "Nothing recorded yet", "Complete Parts 1–5 above and they'll appear here as your first entry in My Singing Journey.");
    }
    return `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <div class="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <h3 class="font-display text-xl text-ink-50">${icon("mic", "w-5 h-5 inline-flex align-[-4px] mr-1.5")}First Progress Recording</h3>
          <span class="text-[11px] px-2.5 py-1 rounded-full ${isBaseline ? "bg-gold-500/15 text-gold-300" : "bg-white/5 text-ink-400"} uppercase tracking-wide">${isBaseline ? "Baseline" : "In progress"}</span>
        </div>
        <p class="text-xs text-ink-500 mb-5">Class 10 · ${new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        <div class="flex flex-col gap-2" data-library-list>
          ${entries.map((e) => libraryRow(e)).join("")}
        </div>
        <p class="text-xs text-ink-500 mt-5">Private by default — only you can see these. This recording will become your reference point: future milestone classes will let you compare a new recording against it.</p>
      </div>`;
  }
  function libraryRow(e) {
    return `
      <div class="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3" data-library-row="${e.key}">
        <button type="button" data-library-play="${e.key}" data-mediaid="${e.take.mediaId}" class="w-9 h-9 rounded-full bg-gold-500 text-ink-950 flex items-center justify-center shrink-0">${icon("play", "w-4 h-4")}</button>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-ink-100 truncate">${e.label}${e.extra ? ` — ${Utils.escapeHtml(e.extra)}` : ""}</p>
          <p class="text-xs text-ink-500">${e.take.seconds || "?"}s · ${new Date(e.take.at || Date.now()).toLocaleDateString()}</p>
        </div>
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
    const preCheck = A(rec, "preCheck");
    const speaking = A(rec, "speaking");
    const rhythm = A(rec, "rhythm");
    const song = A(rec, "song");
    const evaluate = A(rec, "evaluate");
    const refl = A(rec, "reflection");
    const focus = A(rec, "focus");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("intro", 1, "Record where you are now", `
          ${Warmup.isUnlocked() ? `
          <div class="wu-prompt rounded-3xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <span class="wu-mic-md" aria-hidden="true">🎤</span>
            <div class="flex-1">
              <p class="text-ink-100">You've completed the first nine foundation classes.</p>
              <p class="text-sm text-ink-400 mt-1">Before making your first progress recording, you can now use your Warm-up routine.</p>
            </div>
            <div class="flex flex-wrap gap-2 shrink-0">
              <a href="${Warmup.href("quick", `#/classes/${cls.id}`)}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Start Warm-up</a>
              <a href="#" data-stage-link="check" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Continue to Recording ${icon("arrowRight", "w-3.5 h-3.5")}</a>
            </div>
          </div>` : ""}
          ${p("This recording is <strong class=\"text-ink-100\">not</strong> an audition. It is <strong class=\"text-ink-100\">not</strong> an examination. It is <strong class=\"text-ink-100\">not</strong> a professional studio recording.")}
          ${p("It's a snapshot of your current ability — honest, unpolished, and exactly what it needs to be.")}
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-teal-200">“Your first recording is not supposed to be perfect.”</p>
            <p class="text-sm text-ink-200 mt-4">We need an honest starting point before we can measure improvement.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Please don't</p>
            <div class="flex flex-wrap gap-2">${["Retake endlessly", "Edit heavily", "Use Auto-Tune", "Correct pitch", "Add EQ/compression", "Add reverb", "Remove noise in a way that changes your voice", "Pick only your best parts"].map((t) => `<span class="flow-chip !text-xs">${t}</span>`).join("")}</div>
          </div>
          ${hierarchyStrip()}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("rules", 2, "Baseline recording rules", `
          <div class="grid sm:grid-cols-2 gap-4">
            ${[
              ["Environment", "Choose the quietest practical space. Avoid traffic, fans, TV, people talking, and strong background noise."],
              ["Equipment", "Use the same microphone or device whenever possible for future progress recordings."],
              ["Distance", "Keep a reasonably consistent distance from the microphone."],
              ["Processing", "Record as naturally as possible — no vocal effects."],
              ["Voice", "Use a comfortable singing volume. Don't sing louder just because you're recording."],
              ["Health", "Don't record if your voice is tired, painful or unusually uncomfortable."],
            ].map(([t, d]) => `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><p class="text-xs uppercase tracking-wider text-gold-400/80 mb-2">${t}</p><p class="text-sm text-ink-300 leading-relaxed">${d}</p></div>`).join("")}
          </div>
        `)}

        ${chapter("check", 3, "Pre-recording check", `
          ${narrow(`
            ${WarmupPrompt.beforeRecording("class10", `#/classes/${cls.id}`)}
            <div class="flex flex-col gap-1 mb-5">
              ${PRE_CHECK_ITEMS.map((t, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-precheck="${i}" ${preCheck[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${t}</span>
                </label>`).join("")}
            </div>
            <div class="text-center">
              <a href="#" data-stage-link="speaking" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Ready to Record ${icon("arrowRight", "w-4 h-4")}</a>
            </div>
          `)}
        `)}

        ${chapter("speaking", 4, "Part 1 — Speaking", `
          ${narrow(p("About 10–15 seconds of natural speech. Suggested: <em class=\"text-ink-200\">“Hello, this is my first Niswara progress recording.”</em>"))}
          ${RecordingCard.render("fpr-speaking", { title: "Speaking sample", hint: "Just talk naturally.", minSeconds: 8, maxSeconds: 20, section: false })}
        `)}

        ${chapter("note", 5, "Part 2 — Reference Note", `
          ${narrow(`
            ${p("Choose one comfortable reference note — not a particular pitch you feel you should reach.")}
            <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
              ${VirtualPiano.render("fpr-piano", { controls: false, keyboard: true, display: true })}
            </div>
            <div class="flex flex-wrap items-center gap-4 mb-5 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
              <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Reference note</span>
              <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
            </div>
          `)}
          ${PitchMatchExercise.render("fpr-note", EX_NOTE)}
        `, { wide: true })}

        ${chapter("pattern", 6, "Part 3 — Simple Pattern", `
          ${PitchMatchExercise.render("fpr-pattern", EX_PATTERN)}
        `)}

        ${chapter("rhythm", 7, "Part 4 — Rhythm", `
          ${narrow(p("Start the metronome, then sing a comfortable note or syllable in time — a simple four-beat pattern is plenty."))}
          ${Metronome.render("fpr-metro", { bpm: BPM })}
          <div class="mt-5">${RecordingCard.render("fpr-rhythm", { title: "Sing in time", hint: "With the metronome running, sing a comfortable note or syllable on the beat.", maxSeconds: 20, section: false })}</div>
        `)}

        ${chapter("song", 8, "Part 5 — Song Excerpt", `
          ${narrow(`
            ${p("Choose a song you're comfortable singing — nothing difficult, nothing outside your comfortable range. Sing naturally, about 30–60 seconds, no effects, no pitch correction.")}
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Song (optional)</label>
            <input type="text" data-song-title value="${Utils.escapeHtml(song.title || "")}" placeholder="What are you singing?" class="field mb-5">
          `)}
          ${RecordingCard.render("fpr-song", { title: "Song excerpt", hint: "About 30–60 seconds, sung naturally.", minSeconds: 20, maxSeconds: 75, section: true })}
        `)}

        ${chapter("library", 9, "My Singing Journey", `
          ${p("This recording will become your reference point — not a comparison against anything, since there's nothing to compare yet. Future milestone classes will let you listen to a new recording next to this one.")}
          <div data-library-host>${renderLibrary(rec)}</div>
        `)}

        ${chapter("evaluate", 10, "Self-evaluation", `
          ${p("Your own honest read on the recording — not a score.")}
          <div class="flex flex-col gap-5">
            ${EVAL_CATEGORIES.map((c) => SelfAssessment.render(`fpr-eval-${c.key}`, { question: c.question, options: c.options, selected: evaluate[c.key] || null })).join("")}
          </div>
        `)}

        ${chapter("reflect", 11, "What I Notice", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="fpr-refl-${i}">${i + 1}. ${q}</label>
                <textarea id="fpr-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("focus", 12, "My current focus", `
          ${narrow(`
            ${p("Pick <strong class=\"text-ink-100\">one</strong> thing to focus on next. You don't need to fix everything at once.")}
            <div class="flex flex-wrap gap-2" data-focus-group>
              ${FOCUS_OPTIONS.map((f) => `<button type="button" data-focus="${f}" class="ex-chip ${focus.value === f ? "is-selected" : ""}">${f}</button>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "First Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
    const confirmReplace = () => window.confirm("This is your progress baseline. Are you sure you want to replace it?");
    const isBaseline = () => !!rec0().checkpoints.baseline;

    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
      const lib = $("[data-library-host]");
      if (lib) lib.innerHTML = renderLibrary(rec);
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

    /* ---- pre-recording checklist ---- */
    function onPreCheck(e) {
      const cb = e.target.closest("[data-precheck]");
      if (!cb) return;
      set("preCheck", cb.dataset.precheck, cb.checked);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("change", onPreCheck);
    cleanups.push(() => container.removeEventListener("change", onPreCheck));

    /* ---- Part 1: speaking ---- */
    own(RecordingCard.wire(container, "fpr-speaking", {
      classId, take: A(rec0(), "speaking").take || null, minSeconds: MIN.speaking, maxSeconds: 20,
      meta: { name: "Baseline — speaking sample", exercise: "baseline-speaking" },
      onBeforeRecord: () => (isBaseline() ? confirmReplace() : true),
      onSaved: (take) => { set("speaking", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Part 2: reference note (piano + PitchMatchExercise) ---- */
    const r0 = range(rec0());
    own(VirtualPiano.wire(container, "fpr-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        set("setup", "note", midi);
        const el = $("[data-base-note]"); if (el) el.textContent = N(midi);
        noteCtrl.refresh(); patternCtrl.refresh();
      },
    }));
    const noteCtrl = own(PitchMatchExercise.wire(container, "fpr-note", EX_NOTE, {
      classId, exerciseId: "note",
      state: (rec0().answers.exercises || {}).note || {},
      getNotes: () => [base()],
      isComplete: EX_NOTE.isComplete,
      onBeforeRecord: () => (isBaseline() ? confirmReplace() : true),
      onState: (s) => { set("exercises", "note", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Part 3: simple pattern ---- */
    const patternCtrl = own(PitchMatchExercise.wire(container, "fpr-pattern", EX_PATTERN, {
      classId, exerciseId: "pattern",
      state: (rec0().answers.exercises || {}).pattern || {},
      getNotes: () => patternNotes(base()),
      isComplete: EX_PATTERN.isComplete,
      onBeforeRecord: () => (isBaseline() ? confirmReplace() : true),
      onState: (s) => { set("exercises", "pattern", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- Part 4: rhythm (full Metronome widget + recording) ---- */
    own(Metronome.wire(container, "fpr-metro", { bpm: BPM }));
    own(RecordingCard.wire(container, "fpr-rhythm", {
      classId, take: A(rec0(), "rhythm").take || null, maxSeconds: 20,
      meta: { name: "Baseline — rhythm exercise", exercise: "baseline-rhythm" },
      onBeforeRecord: () => (isBaseline() ? confirmReplace() : true),
      onSaved: (take) => { set("rhythm", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Part 5: song ---- */
    const songTitle = $("[data-song-title]");
    if (songTitle) songTitle.addEventListener("input", Utils.debounce(() => set("song", "title", songTitle.value), 400));
    own(RecordingCard.wire(container, "fpr-song", {
      classId, take: A(rec0(), "song").take || null, minSeconds: MIN.song, maxSeconds: 75,
      meta: { name: "Baseline — song excerpt", exercise: "baseline-song" },
      onBeforeRecord: () => (isBaseline() ? confirmReplace() : true),
      onSaved: (take) => { set("song", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- library playback ---- */
    function onLibraryClick(e) {
      const btn = e.target.closest("[data-library-play]");
      if (!btn) return;
      VoiceRecorder.play(btn.dataset.mediaid);
    }
    container.addEventListener("click", onLibraryClick);
    cleanups.push(() => container.removeEventListener("click", onLibraryClick));

    /* ---- self-evaluation ---- */
    function onEvalAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      if (!group || !group.dataset.assess.startsWith("fpr-eval-")) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      const key = group.dataset.assess.replace("fpr-eval-", "");
      set("evaluate", key, chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onEvalAssess);
    cleanups.push(() => container.removeEventListener("click", onEvalAssess));

    /* ---- reflection ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => { set("reflection", ta.dataset.reflection, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- primary focus (single-select) ---- */
    function onFocusClick(e) {
      const btn = e.target.closest("[data-focus]");
      if (!btn) return;
      set("focus", "value", btn.dataset.focus);
      container.querySelectorAll("[data-focus]").forEach((b) => b.classList.toggle("is-selected", b === btn));
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onFocusClick);
    cleanups.push(() => container.removeEventListener("click", onFocusClick));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      if (!rec.answers.baseline || !rec.answers.baseline.finalizedAt) {
        set("baseline", "finalizedAt", new Date().toISOString());
        set("baseline", "version", 1);
      }
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const qs = cls.content.assignment.questions;
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled(r[0]) ? r[0] : "This is where I am today — and now I have a recording against which I can measure my future growth.",
        struggled: r[1] || "",
        toPractice: r[4] || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q}: ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
