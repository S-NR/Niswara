/* ============================================================
   CLASS 5 — LISTENING TO YOUR OWN VOICE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "listening-to-your-voice".
   Flow: RECORD → LISTEN → OBSERVE → MARK → REFLECT → CHOOSE ONE THING.
   Class 4 asked "can I move my voice toward the note?"; Class 5 asks
   "can I hear what my own voice is doing?". Observation before
   correction: nothing here diagnoses or scores the learner, and
   nothing claims AI analysis — the waveform is a basic loudness view
   and every observation is the learner's own.

   Reuses: LessonKit, VoiceRecorder (via RecordingCard), Media,
   WaveformPlayer / RecordingMarkers / ListeningPasses /
   ObservationChecklist, PitchMatchExercise + ReferenceNotePlayer
   (Class 4), SelfAssessment, Timer, PersonalNotes, ClassProgress,
   ClassActivity (per-user, synced to Supabase class_progress /
   class_notes; recordings via learner_state + the private bucket).
   ============================================================ */

const ListeningToYourVoiceLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "record", label: "Record" },
    { id: "listen", label: "Listen" },
    { id: "observe", label: "Observe" },
    { id: "mark", label: "Mark" },
    { id: "compare", label: "Compare" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const BASELINE = { min: 20, max: 30, counts: 18 };   // seconds (counts = shortest take accepted)
  const SONG = { min: 30, max: 60, counts: 28 };
  const SPEAK_SING = { max: 20 };
  const SONG_OBSERVATIONS = 3;
  const PRACTICE_TASK = "ear"; // daily-practice task the timer logs to (counts toward listening achievements)
  const PRACTICE_CATEGORY = "Listening / Vocal Awareness";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson (steps 1–2)" },
    { key: "baseline", label: "Baseline recording created" },
    { key: "passes", label: "Three listening passes completed" },
    { key: "obsPitch", label: "Pitch observations" },
    { key: "obsWords", label: "Word observations" },
    { key: "obsBreath", label: "Breath observations" },
    { key: "obsVolume", label: "Volume observations" },
    { key: "obsSmooth", label: "Smoothness observations" },
    { key: "markers", label: "Recording markers created" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const PASSES = [
    { title: "Just listen.", prompt: "No judging, no analysing. Simply hear your recording from start to finish." },
    { title: "Listen only for pitch.", prompt: "Ignore everything else. Did notes land where you meant them to — higher, lower, or uncertain?" },
    { title: "Words, breath & smoothness.", prompt: "Now listen for how the words came out, where you breathed, and how smoothly notes joined." },
  ];

  const OBSERVATIONS = [
    { key: "pitch", progress: "obsPitch", title: "Pitch", prompt: "Did I notice any notes that sounded…", note: true,
      options: ["Higher than I intended", "Lower than I intended", "Uncertain", "Seemed steady", "Not sure"] },
    { key: "words", progress: "obsWords", title: "Words", prompt: "Did I…", note: true,
      options: ["Pronounce the words clearly", "Lose or clip a word", "Change pronunciation while singing", "Not sure"] },
    { key: "breath", progress: "obsBreath", title: "Breath", prompt: "Did I…", note: true,
      options: ["Run out of breath", "Take an unexpected breath", "Hear a lot of breath noise", "Breath felt fine", "Not sure"] },
    { key: "volume", progress: "obsVolume", title: "Volume", prompt: "Did my voice…", note: true,
      options: ["Become unexpectedly loud", "Become unexpectedly weak", "Stay reasonably consistent", "Not sure"] },
    { key: "smooth", progress: "obsSmooth", title: "Smoothness", prompt: "Did I notice…", note: true,
      options: ["Sudden jumps", "Rough transitions", "Breaks", "Unwanted changes", "Mostly smooth", "Not sure"] },
    { key: "tone", title: "Tone", prompt: "My voice sounded… (choose any)", note: false,
      options: ["Clear", "Breathy", "Nasal", "Tight", "Weak", "Comfortable", "Not sure"] },
    { key: "tension", title: "Tension", prompt: "While singing, did anything tighten?", note: false,
      options: ["Jaw", "Shoulders", "Neck", "Face", "Nothing I noticed", "Not sure"] },
  ];

  const BODY_CHECK = [
    { key: "jaw", label: "Jaw relaxed?", tip: "Let your teeth part slightly and your tongue rest — no need to hold any position." },
    { key: "shoulders", label: "Shoulders relaxed?", tip: "Let them drop a little on an out-breath. Comfortable, not pulled back." },
    { key: "neck", label: "Neck comfortable?", tip: "Gently look left and right once. Your head can float, not reach forward or up." },
    { key: "face", label: "Face relaxed?", tip: "Soften your forehead and around the eyes. A neutral, easy face is perfect." },
  ];

  // Short listening examples, built from the site's piano and a voice-like synth tone — not a real singer.
  const WARMUP_OPTIONS = ["Pitch changed", "Volume changed", "Word was unclear", "Breath sound", "Smooth transition", "Abrupt transition", "Nothing obvious", "Not sure"];
  const WARMUP = [
    { key: "w1", contains: ["Pitch changed"], explain: "the last note sagged slightly lower than the one before." },
    { key: "w2", contains: ["Volume changed"], explain: "the same note grew louder, then suddenly softer." },
    { key: "w3", contains: ["Smooth transition"], explain: "the voice glided smoothly from one note up to another." },
    { key: "w4", contains: ["Abrupt transition"], explain: "a note jumped suddenly to a much higher one, with no join." },
    { key: "w5", contains: ["Breath sound"], explain: "there was a breath sound between the two notes." },
    { key: "w6", contains: ["Nothing obvious"], explain: "three steady, even notes — nothing particular stood out." },
  ];

  const SONG_QUESTIONS = [
    "What do I like about my voice?",
    "What is one thing I want to improve?",
    "What did I notice that I had never noticed before?",
    "Which part of the recording sounded most comfortable?",
    "Which part needs attention?",
  ];

  const SPEAK_SING_ASPECTS = ["Voice tone", "Breath", "Pronunciation", "Volume", "Mouth movement", "Relaxation"];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow, tryIt } = LessonKit;

  /* ---------- derived state ---------- */
  const A = (rec, group) => rec.answers[group] || {};
  const filled = (v) => v && String(v).trim();

  function songDone(rec) {
    const s = A(rec, "song");
    const marks = (A(rec, "markers")[s.take && s.take.mediaId] || []);
    return !!(s.take && s.take.seconds >= SONG.counts)
      && [0, 1, 2].every((i) => (s.passes || {})[i])
      && marks.length >= SONG_OBSERVATIONS
      && SONG_QUESTIONS.every((_, i) => filled((s.q || {})[i]))
      && filled(s.focus);
  }

  function songSteps(rec, cls) {
    const s = A(rec, "song");
    const marks = (A(rec, "markers")[s.take && s.take.mediaId] || []);
    const passes = s.passes || {};
    return [
      !!(s.take && s.take.seconds >= SONG.counts),
      !!passes[0], !!passes[1], !!passes[2],
      marks.length >= SONG_OBSERVATIONS,
      SONG_QUESTIONS.every((_, i) => filled((s.q || {})[i])),
      !!filled(s.focus),
    ].map((ok, i) => ({ ok, text: cls.content.assignment.instructions[i] }));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    const b = A(rec, "baseline");
    if (b.take && b.take.seconds >= BASELINE.counts) out.baseline = true;
    if ([0, 1, 2].every((i) => (b.passes || {})[i])) out.passes = true;
    const obs = A(rec, "observations");
    OBSERVATIONS.forEach((o) => { if (o.progress && (obs[o.key] || []).length) out[o.progress] = true; });
    const marks = A(rec, "markers");
    if (b.take && (marks[b.take.mediaId] || []).length) out.markers = true;
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (songDone(rec)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */

  function flowStrip() {
    const steps = ["🎤 Record", "👂 Listen", "🔎 Observe", "📍 Mark", "💭 Reflect", "🎯 Choose one thing"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function renderSongStatus(rec, cls) {
    const steps = songSteps(rec, cls);
    return `
      <ol class="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
        ${steps.map((s, i) => `
          <li class="flex items-start gap-2.5 text-sm ${s.ok ? "text-ink-300" : "text-ink-500"}">
            <span class="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-px ${s.ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${s.ok ? icon("check", "w-3 h-3") : `<span class="text-[10px]">${i + 1}</span>`}</span>
            <span>${s.text}</span>
          </li>`).join("")}
      </ol>`;
  }

  function renderFocusChoices(rec) {
    const s = A(rec, "song");
    const marks = (A(rec, "markers")[s.take && s.take.mediaId] || []);
    if (!marks.length) return `<p class="text-xs text-ink-500">Your marked moments will appear here — then you'll pick just one.</p>`;
    const fmt = (t) => Utils.formatSeconds(Math.round(t));
    return `
      <div class="flex flex-col gap-1.5" role="radiogroup" aria-label="Choose one observation">
        ${marks.map((m) => {
          const label = `${fmt(m.t)} — ${m.note}`;
          const on = s.focus === label;
          return `<button type="button" data-focus="${Utils.escapeHtml(label)}" role="radio" aria-checked="${on}" class="ex-chip justify-start text-left ${on ? "is-selected" : ""}">${on ? "◉" : "○"} ${Utils.escapeHtml(label)}</button>`;
        }).join("")}
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const obsCount = ["obsPitch", "obsWords", "obsBreath", "obsVolume", "obsSmooth"].filter((k) => c[k]).length;
    return [
      ["Recorded my baseline", !!c.baseline],
      ["Listened three ways", !!c.passes],
      [`Made observations (${obsCount}/5 areas)`, obsCount === 5],
      ["Marked moments in my recording", !!c.markers],
      ["Reflected", !!c.reflection],
      ["Completed the assignment and chose ONE thing", !!c.assignment],
    ];
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const focus = A(rec, "song").focus;
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");
    const bridge = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You've learned to listen to your own voice.</p>
        <p class="text-sm text-ink-300 leading-relaxed mb-2">Now we're going to train another essential part of singing: <strong class="text-ink-100">rhythm and timing.</strong></p>
        <p class="text-sm text-ink-400 leading-relaxed italic">“A singer can sing the correct note and still sound wrong if the timing is wrong.”</p>
      </div>`;
    const focusBox = focus ? `
      <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.05] p-4 mt-5 text-left">
        <p class="text-[11px] uppercase tracking-[0.18em] text-gold-400/80 mb-1">My ONE thing to practise next</p>
        <p class="text-sm text-ink-100">${Utils.escapeHtml(focus)}</p>
      </div>` : "";
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class 5 complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">Now you know how to listen to your voice.</h3>
          <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
          ${focusBox}${bridge}
          ${next ? `
          <div class="mt-6">
            <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
            <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
              <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
            </div>
          </div>` : ""}
        </div>`;
    }
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 text-center">
        <h3 class="font-display text-2xl text-ink-50 mb-4">${all ? "You're ready." : "Almost there"}</h3>
        <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-6">${lines}</ul>
        <div>
          <button type="button" data-complete-class ${all ? "" : "disabled"}
            class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors ${all ? "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-glow" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
            Complete Class 5 ${icon("check", "w-4 h-4")}
          </button>
        </div>
        ${focusBox}${bridge}
      </div>`;
  }

  function progressStats(cls, rec) {
    const marks = Object.values(A(rec, "markers")).reduce((n, l) => n + l.length, 0);
    return [
      { label: "Moments marked", value: marks },
      { label: "Recordings", value: ClassActivity.count(cls.id, "recordings") },
      { label: `${PRACTICE_CATEGORY} logged here`, value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  const COMPARE_EX = {
    eyebrow: "Reference vs your voice",
    title: "Which sounded closer?",
    intro: "Here is the reference note from Class 4. Sing it twice — two separate tries. Then listen to the reference, Try 1 and Try 2 <strong class=\"text-ink-200\">separately</strong>, and decide for yourself. Nothing here tells you which is better.",
    refLabel: "🎹 Reference note",
    slots: [
      { key: "t1", label: "🎤 My voice — Try 1", hint: "Sing the reference gently for a few seconds" },
      { key: "t2", label: "🎤 My voice — Try 2", hint: "Sing it again" },
    ],
    assessment: null,
    noEstimate: true,
    isComplete: (s) => !!(s.takes.t1 && s.takes.t1.mediaId && s.takes.t2 && s.takes.t2.mediaId),
  };

  /* ---------- page ---------- */

  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const body = A(rec, "body");
    const compareQ = A(rec, "compareQ");
    const ss = A(rec, "speakSing");
    const songQ = A(rec, "song").q || {};
    const reflection = A(rec, "reflection");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Don't just sing — hear what you're doing", `
          ${p("In Class 3 you learned to <strong class=\"text-ink-100\">hear</strong> pitch. In Class 4 you learned to <strong class=\"text-ink-100\">match</strong> it with your voice. Now comes the skill that makes every future class faster: <strong class=\"text-ink-100\">listening to yourself</strong>.")}
          ${p("When beginners sing, they usually concentrate only on making the sound. A developing singer also learns to listen to:")}
          <div class="flex flex-wrap gap-2 my-5">
            ${["Pitch", "Rhythm", "Words", "Breath", "Volume", "Smoothness", "Transitions", "Tone", "Unwanted sounds", "Tension"].map((t) => `<span class="flow-chip">${t}</span>`).join("")}
          </div>
          <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.05] p-5 my-6">
            <p class="text-xs uppercase tracking-wider text-gold-400/80 mb-2">The goal of this class is not to fix everything</p>
            <p class="font-display text-xl sm:text-2xl text-ink-50">“Learn to notice what your voice is doing.”</p>
          </div>
          ${p("Here's how you'll practise it today:")}
          ${flowStrip()}
        `)}

        ${chapter("understand", 2, "Observation before correction", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-3xl sm:text-4xl text-teal-200">“Observation before correction.”</p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 mb-6">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Instead of thinking</p>
              <p class="font-display text-lg text-ink-500 line-through decoration-ink-600">“My voice is bad.”</p>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-3">Learn to think</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-200">
                ${["My pitch dropped here.", "My word was unclear here.", "My voice became breathy here.", "My transition was not smooth here.", "I became louder here.", "My breath changed here."].map((t) => `<li>“${t}”</li>`).join("")}
              </ul>
            </div>
          </div>
          ${p("Specific, calm observations are how listening grows. They're not criticisms — they're information. And it's completely normal if your recorded voice sounds different from how it feels inside your head: you usually hear yourself through your bones, while a recording hears you through the air.")}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 3, "Warm up your listening", `
          ${p("Before listening to yourself, practise on a few short examples. They're made with the site's piano and a voice-like synth tone — <em>not</em> a real singer. Play one, then choose everything you noticed. There's no score.")}
          <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-warmup>
            <div class="flex flex-wrap gap-1.5 mb-5" role="tablist">
              ${WARMUP.map((w, i) => `<button type="button" role="tab" data-warm-tab="${i}" class="ex-chip ${i === 0 ? "is-selected" : ""}">Example ${i + 1}</button>`).join("")}
            </div>
            <div data-warm-body></div>
          </div>
        `)}

        ${chapter("record", 4, "Before you record: a quick body check", `
          ${p("Take ten seconds to notice how your body feels. This is about <strong class=\"text-ink-100\">awareness</strong>, not holding a perfect posture — there's no position to force.")}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            ${BODY_CHECK.map((b) => `
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p class="text-sm text-ink-100 mb-2">${b.label}</p>
                <div class="flex flex-wrap gap-1.5">
                  ${["Relaxed", "A bit tense", "Not sure"].map((v) => `<button type="button" data-body="${b.key}" data-body-value="${v}" class="ex-chip !text-xs !py-1.5 ${body[b.key] === v ? "is-selected" : ""}">${v}</button>`).join("")}
                </div>
                <p class="text-xs text-teal-300/80 mt-2" data-body-tip="${b.key}" ${body[b.key] === "A bit tense" ? "" : "hidden"}>${b.tip}</p>
              </div>`).join("")}
          </div>
          ${tryIt("While you sing, simply notice whether anything tightens unnecessarily — jaw, shoulders, neck, face. Just notice; you'll write it down afterwards.", "During singing")}
        `)}

        ${chapter("record", 5, "Record your baseline", `
          ${p("Sing something simple and natural for <strong class=\"text-ink-100\">20–30 seconds</strong> — a verse of a song you know, or the melody of “Happy Birthday”. Sing at a comfortable volume, in a comfortable range.")}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 mb-5 text-xs text-ink-400">
            <strong class="text-ink-200">Honest recording:</strong> no effects, no Auto-Tune, no EQ, no compression, no reverb — Niswara records your voice exactly as the microphone hears it. That honesty is what makes it useful.
          </div>
          ${RecordingCard.render("rc-baseline", { title: "My baseline recording", minSeconds: BASELINE.min, maxSeconds: BASELINE.max, section: false })}
        `)}

        ${chapter("listen", 6, "Listen three times", `
          ${p("Now play it back three times, each with a different focus. One thing at a time — the next listen unlocks when you finish the one before.")}
          ${ListeningPasses.render("lp-baseline", PASSES)}
          <p class="text-xs text-ink-500 mt-3" data-baseline-need hidden>Record your baseline above first.</p>
        `)}

        ${chapter("observe", 7, "What did you notice?", `
          ${p("Choose what you noticed in each area — as many or as few as fit. <strong class=\"text-ink-100\">These are simple observations, not diagnoses.</strong> “Not sure” is a perfectly good answer.")}
          ${ObservationChecklist.render("obs-baseline", OBSERVATIONS, A(rec, "observations"), A(rec, "observationNotes"))}
        `)}

        ${chapter("mark", 8, "Mark a moment — and replay a section", `
          ${p("Find the moments you noticed and mark them, like “00:07 — word became unclear”. Then pick a few seconds and replay just that section: listening to a small piece closely is how critical listening is built.")}
          <div data-mark-host class="flex flex-col gap-4"></div>
        `, { wide: false })}

        ${chapter("compare", 9, "Reference vs your voice", `
          ${p("This connects Class 4 to today: listen to a target and to yourself, and form your own opinion.")}
          ${PitchMatchExercise.render("pm-compare", COMPARE_EX)}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            ${SelfAssessment.render("compare-closer", { question: "Which sounded closer to the target?", options: [
              { value: "t1", label: "Try 1", tone: "neutral" }, { value: "t2", label: "Try 2", tone: "neutral" },
              { value: "same", label: "About the same", tone: "neutral" }, { value: "unsure", label: "Not sure", tone: "neutral" }], selected: compareQ.closer || null })}
            <label class="block text-sm text-ink-200 mt-4 mb-1.5" for="compare-why">Why do you think so?</label>
            <input type="text" id="compare-why" data-compare-why class="field" placeholder="e.g. Try 2 felt steadier and less pushed" value="${Utils.escapeHtml(compareQ.why || "")}">
          </div>
        `)}

        ${chapter("compare", 10, "Speaking vs singing", `
          ${p("Record about 20 seconds of yourself <strong class=\"text-ink-100\">talking naturally</strong> (describe your day), then about 20 seconds of <strong class=\"text-ink-100\">singing</strong>. Listen to both and compare.")}
          <div class="grid lg:grid-cols-2 gap-4">
            ${RecordingCard.render("rc-speak", { title: "🗣️ Speaking", maxSeconds: SPEAK_SING.max, section: false })}
            ${RecordingCard.render("rc-sing", { title: "🎵 Singing", maxSeconds: SPEAK_SING.max, section: false })}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <p class="text-sm text-ink-200 mb-3">Compared with speaking, my singing…</p>
            <div class="grid sm:grid-cols-2 gap-3">
              ${SPEAK_SING_ASPECTS.map((a, i) => `
                <div>
                  <p class="text-xs text-ink-400 mb-1.5">${a}</p>
                  <div class="flex flex-wrap gap-1.5">${["Similar", "Different", "Not sure"].map((v) => `<button type="button" data-ss="${i}" data-ss-value="${v}" class="ex-chip !text-xs !py-1 ${(ss.aspects || {})[i] === v ? "is-selected" : ""}">${v}</button>`).join("")}</div>
                </div>`).join("")}
            </div>
            <div class="mt-5">
              ${SelfAssessment.render("ss-feel", { question: "Does your voice feel different when you sing?", options: [
                { value: "yes", label: "Yes", tone: "neutral" }, { value: "little", label: "A little", tone: "neutral" },
                { value: "no", label: "No", tone: "neutral" }, { value: "unsure", label: "Not sure", tone: "neutral" }], selected: ss.feel || null })}
            </div>
          </div>
          <div class="mt-4">${PersonalNotes.render("notes-speak-sing", { title: "Notes: speaking vs singing", rows: 3, placeholder: "e.g. My voice sounds brighter when I sing, and I open my mouth more." })}</div>
        `)}

        ${chapter("practice", 11, "Practice timer — Listening / Vocal Awareness", `
          ${p("Listen back to your recordings, replay sections and add markers while the timer runs. When you're done, log the session — it's saved to your account as <strong class=\"text-ink-100\">Listening / Vocal Awareness</strong>.")}
          ${Timer.render("listen-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 12, "Class 5 Assignment", `
          ${p("Now do the whole loop on your own with a longer piece. <strong class=\"text-ink-100\">You don't need to fix anything you find</strong> — just notice it, and choose one thing for later.")}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-5" data-song-status>${renderSongStatus(rec, cls)}</div>
          ${RecordingCard.render("rc-song", { title: "My song recording", hint: "30–60 seconds of a song you like. No effects.", minSeconds: SONG.min, maxSeconds: SONG.max, section: true })}
          <div class="mt-4">${ListeningPasses.render("lp-song", [
            { title: "Listen normally.", prompt: "Just enjoy it as music." },
            { title: "Listen only for pitch.", prompt: "Where did notes feel high, low or uncertain?" },
            { title: "Words, breath, volume & smoothness.", prompt: "How did the words, breaths, loudness and joins sound?" },
          ])}</div>
          <div class="mt-4" data-song-markers-host></div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Questions</h4>
            <div class="flex flex-col gap-4">
              ${SONG_QUESTIONS.map((q, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="song-q-${i}">${i + 1}. ${q}</label>
                  <textarea id="song-q-${i}" data-song-q="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(songQ[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
          <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.04] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-1">Choose ONE observation for future practice</h4>
            <p class="text-xs text-ink-400 mb-3">Not all of them — just one. Correction comes later, one step at a time.</p>
            <div data-focus-host>${renderFocusChoices(rec)}</div>
          </div>
        `)}

        ${chapter("reflect", 13, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="c5-reflection-${i}">${q}</label>
                <textarea id="c5-reflection-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(reflection[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 14, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-class5", { placeholder: "e.g. My voice becomes softer at the end of phrases. I noticed some words disappearing. My voice sounds different from how I hear it while singing." })}
        `)}

        ${chapter("complete", 15, "Your progress", `<div data-lesson-progress>${ClassProgress.render("Class 5 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls, rec))}</div>`)}

        ${chapter("complete", 16, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function mount(container, cls, params) {
    const cleanups = [];
    const classId = cls.id;
    const $ = (s) => container.querySelector(s);
    const rec0 = () => ClassActivity.get(classId);
    const set = (group, key, value) => ClassActivity.setAnswer(classId, group, key, value);
    // class_notes key for one recording / one exercise, e.g. "L1C05:rec-<mediaId>" (":" is URL-safe; still owner-only by RLS)
    const noteKey = (suffix) => `${classId}:${suffix}`;

    /* ---- live progress ---- */
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render("Class 5 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls, rec));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-song-status]").innerHTML = renderSongStatus(rec, cls);
      $("[data-focus-host]").innerHTML = renderFocusChoices(rec);
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true); // the rest only move forward
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- listening warm-up ---- */
    let warmIndex = 0, warmPlaying = false;
    function renderWarm() {
      const w = WARMUP[warmIndex];
      const picked = (A(rec0(), "warmup")[w.key] || {}).picked || [];
      const checked = !!(A(rec0(), "warmup")[w.key] || {}).checked;
      container.querySelectorAll("[data-warm-tab]").forEach((t) => t.classList.toggle("is-selected", Number(t.dataset.warmTab) === warmIndex));
      $("[data-warm-body]").innerHTML = `
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <button type="button" data-warm-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play example ${warmIndex + 1}</button>
          <span class="text-xs text-ink-500">Listen as often as you like.</span>
        </div>
        <p class="font-display text-lg text-ink-100 mb-3">What did you notice?</p>
        ${ObservationChecklist.render(`warm-${w.key}`, [{ key: w.key, title: "", prompt: "Choose all that apply", options: WARMUP_OPTIONS }], { [w.key]: picked })}
        <div class="flex flex-wrap items-center gap-3 mt-4">
          <button type="button" data-warm-check class="vr-btn">Done listening</button>
          ${warmIndex < WARMUP.length - 1 ? `<button type="button" data-warm-next class="text-xs text-gold-300 underline">Next example →</button>` : ""}
        </div>
        <div class="mt-3 text-sm" data-warm-feedback aria-live="polite">${checked ? warmFeedback(w, picked) : ""}</div>`;
      ObservationChecklist.wire(container, `warm-${w.key}`, {
        selected: { [w.key]: picked },
        onChange: (k, values) => set("warmup", w.key, { ...(A(rec0(), "warmup")[w.key] || {}), picked: values }),
      });
    }
    function warmFeedback(w, picked) {
      const found = w.contains.some((c) => picked.includes(c));
      return `<p class="text-emerald-300 mb-1">Good observation.</p>
        <p class="text-ink-400">This example included: <strong class="text-ink-200">${w.contains.join(", ")}</strong> — ${w.explain}
        ${found ? " You heard it." : " If you didn't notice it, play it again and listen for just that — there's no score here."}</p>`;
    }
    async function playWarm() {
      if (warmPlaying) return;
      warmPlaying = true;
      VoiceRecorder.announce("warmup");
      const seq = (notes, o) => PianoSynth.playSequence(notes, o);
      try {
        switch (WARMUP[warmIndex].key) {
          case "w1": await seq([60, 62, 64, 64, 63.4], { duration: 0.6, gap: 0.12 }); break;
          case "w2": await seq([{ midi: 64, velocity: 0.3 }, { midi: 64, velocity: 0.55 }, { midi: 64, velocity: 1 }, { midi: 64, velocity: 0.18 }], { duration: 0.6, gap: 0.12 }); break;
          case "w3": await PianoSynth.tone(60, 67, { duration: 2.2, glideAt: 0.35, glideTime: 0.7 }); break;
          case "w4": await PianoSynth.tone(60, 60, { duration: 0.9 }); await PianoSynth.tone(69, 69, { duration: 0.9 }); break;
          case "w5": await PianoSynth.tone(64, 64, { duration: 0.9 }); await PianoSynth.breath({ duration: 0.6 }); await PianoSynth.tone(64, 64, { duration: 0.9 }); break;
          default: await seq([60, 62, 64], { duration: 0.6, gap: 0.12 });
        }
      } finally { warmPlaying = false; }
    }
    function onWarmClick(e) {
      const tab = e.target.closest("[data-warm-tab]");
      if (tab) { warmIndex = Number(tab.dataset.warmTab); renderWarm(); return; }
      if (e.target.closest("[data-warm-play]")) { playWarm(); return; }
      if (e.target.closest("[data-warm-next]")) { warmIndex = Math.min(WARMUP.length - 1, warmIndex + 1); renderWarm(); return; }
      if (e.target.closest("[data-warm-check]")) {
        const w = WARMUP[warmIndex];
        const cur = A(rec0(), "warmup")[w.key] || {};
        set("warmup", w.key, { ...cur, checked: true });
        $("[data-warm-feedback]").innerHTML = warmFeedback(w, cur.picked || []);
      }
    }
    $("[data-warmup]").addEventListener("click", onWarmClick);
    renderWarm();

    /* ---- body check ---- */
    function onBody(e) {
      const chip = e.target.closest("[data-body]");
      if (!chip) return;
      const k = chip.dataset.body;
      container.querySelectorAll(`[data-body="${k}"]`).forEach((b) => b.classList.toggle("is-selected", b === chip));
      $(`[data-body-tip="${k}"]`).hidden = chip.dataset.bodyValue !== "A bit tense";
      set("body", k, chip.dataset.bodyValue);
    }
    container.addEventListener("click", onBody);
    cleanups.push(() => container.removeEventListener("click", onBody));

    /* ---- baseline: record → three listens → mark ---- */
    let markPlayer = null, markList = null, markNotes = null;
    function mountMark(take) {
      if (markPlayer) markPlayer.destroy();
      if (markList) markList.destroy();
      if (markNotes) markNotes.destroy();
      markPlayer = markList = markNotes = null;
      const host = $("[data-mark-host]");
      if (!take) { host.innerHTML = `<p class="text-sm text-ink-500">Record your baseline in step 5 first — then your markers and section replay appear here.</p>`; return; }
      host.innerHTML = `
        <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7">
          ${WaveformPlayer.render("wf-mark", { section: true })}
          <div class="mt-4">${RecordingMarkers.render("mk-baseline")}</div>
        </div>
        ${PersonalNotes.render("notes-baseline", { title: "Notes on this recording", rows: 3, placeholder: "e.g. I think my high-to-low transition is noticeable." })}`;
      markPlayer = WaveformPlayer.wire(host, "wf-mark", { mediaId: take.mediaId });
      markList = RecordingMarkers.wire(host, "mk-baseline", {
        player: markPlayer,
        list: A(rec0(), "markers")[take.mediaId] || [],
        onChange: (list) => set("markers", take.mediaId, list),
      });
      markNotes = PersonalNotes.wire(host, "notes-baseline", { classId: noteKey(`rec-${take.mediaId}`) });
    }
    cleanups.push(() => { if (markPlayer) markPlayer.destroy(); if (markList) markList.destroy(); if (markNotes) markNotes.destroy(); });

    const baselineSaved = A(rec0(), "baseline");
    let baselineCard = null; // created below; the listening passes play through its player
    const baselinePasses = ListeningPasses.wire(container, "lp-baseline", {
      getPlayer: () => baselineCard && baselineCard.getPlayer(),
      done: baselineSaved.passes || {},
      onDone: (i) => set("baseline", "passes", { ...(A(rec0(), "baseline").passes || {}), [i]: true }),
    });
    baselineCard = RecordingCard.wire(container, "rc-baseline", {
      classId, take: baselineSaved.take || null, minSeconds: BASELINE.min, maxSeconds: BASELINE.max,
      meta: { name: "Class 5 baseline", exercise: "listen-baseline" },
      onSaved: (take) => {
        set("baseline", "take", take);
        set("baseline", "passes", {}); // a new recording gets its own three listens
        baselinePasses.reset();
        ClassActivity.bump(classId, "recordings");
      },
      onPlayer: (player, take) => { baselinePasses.refresh(); $("[data-baseline-need]").hidden = true; mountMark(take); },
    });
    baselinePasses.refresh(); // the card now exists, so the listens can use its player
    if (!baselineSaved.take) { $("[data-baseline-need]").hidden = false; mountMark(null); }
    cleanups.push(() => { baselineCard.destroy(); baselinePasses.destroy(); });

    /* ---- observations ---- */
    cleanups.push(ObservationChecklist.wire(container, "obs-baseline", {
      selected: A(rec0(), "observations"),
      onChange: (k, values) => set("observations", k, values),
      onNote: (k, text) => set("observationNotes", k, text),
    }));

    /* ---- reference vs own voice (Class 4's engine and reference note) ---- */
    const class4Note = (ClassActivity.get("L1C04").answers.setup || {}).note;
    const compare = PitchMatchExercise.wire(container, "pm-compare", COMPARE_EX, {
      classId, exerciseId: "compare",
      state: A(rec0(), "compare").state || {},
      getNotes: () => [typeof class4Note === "number" ? class4Note : 60],
      isComplete: COMPARE_EX.isComplete,
      onState: (s) => set("compare", "state", s),
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    });
    cleanups.push(() => compare.destroy());
    function onCompareChoice(e) {
      const chip = e.target.closest('[data-assess="compare-closer"] [data-assess-choice], [data-assess="ss-feel"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((b) => b.classList.toggle("is-selected", b === chip));
      if (group.dataset.assess === "compare-closer") set("compareQ", "closer", chip.dataset.assessChoice);
      else set("speakSing", "feel", chip.dataset.assessChoice);
    }
    container.addEventListener("click", onCompareChoice);
    cleanups.push(() => container.removeEventListener("click", onCompareChoice));
    $("[data-compare-why]").addEventListener("input", Utils.debounce((e) => set("compareQ", "why", e.target.value), 500));

    /* ---- speaking vs singing ---- */
    const ssSaved = A(rec0(), "speakSing");
    ["speak", "sing"].forEach((kind) => {
      const card = RecordingCard.wire(container, `rc-${kind}`, {
        classId, take: ssSaved[kind] || null, maxSeconds: SPEAK_SING.max,
        meta: { name: `Class 5 ${kind === "speak" ? "speaking" : "singing"} sample`, exercise: `listen-${kind}` },
        onSaved: (take) => { set("speakSing", kind, take); ClassActivity.bump(classId, "recordings"); },
      });
      cleanups.push(() => card.destroy());
    });
    function onAspect(e) {
      const chip = e.target.closest("[data-ss]");
      if (!chip) return;
      const i = chip.dataset.ss;
      container.querySelectorAll(`[data-ss="${i}"]`).forEach((b) => b.classList.toggle("is-selected", b === chip));
      set("speakSing", "aspects", { ...(A(rec0(), "speakSing").aspects || {}), [i]: chip.dataset.ssValue });
    }
    container.addEventListener("click", onAspect);
    cleanups.push(() => container.removeEventListener("click", onAspect));
    const ssNotes = PersonalNotes.wire(container, "notes-speak-sing", { classId: noteKey("speak-sing") });
    cleanups.push(() => ssNotes.destroy());

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    const timer = Timer.wire(container, "listen-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    });
    cleanups.push(() => timer.destroy());

    /* ---- assignment: song → three listens → ≥3 markers → questions → choose ONE ---- */
    let songMarks = null;
    function mountSongMarkers(player, take) {
      if (songMarks) songMarks.destroy();
      const host = $("[data-song-markers-host]");
      host.innerHTML = RecordingMarkers.render("mk-song", { title: `Record at least ${SONG_OBSERVATIONS} observations` });
      songMarks = RecordingMarkers.wire(host, "mk-song", {
        player, list: A(rec0(), "markers")[take.mediaId] || [],
        onChange: (list) => set("markers", take.mediaId, list),
      });
    }
    cleanups.push(() => songMarks && songMarks.destroy());
    const songSaved = A(rec0(), "song");
    let songCard = null;
    const songPasses = ListeningPasses.wire(container, "lp-song", {
      getPlayer: () => songCard && songCard.getPlayer(),
      done: songSaved.passes || {},
      onDone: (i) => set("song", "passes", { ...(A(rec0(), "song").passes || {}), [i]: true }),
    });
    songCard = RecordingCard.wire(container, "rc-song", {
      classId, take: songSaved.take || null, minSeconds: SONG.min, maxSeconds: SONG.max,
      meta: { name: "Class 5 assignment song", exercise: "listen-song" },
      onSaved: (take) => {
        set("song", "take", take);
        set("song", "passes", {});
        set("song", "focus", "");
        songPasses.reset();
        ClassActivity.bump(classId, "recordings");
      },
      onPlayer: (player, take) => { songPasses.refresh(); mountSongMarkers(player, take); },
    });
    songPasses.refresh();
    cleanups.push(() => { songCard.destroy(); songPasses.destroy(); });

    const songSavers = {};
    container.querySelectorAll("[data-song-q]").forEach((ta) => {
      const i = ta.dataset.songQ;
      songSavers[i] = Utils.debounce((v) => set("song", "q", { ...(A(rec0(), "song").q || {}), [i]: v }), 500);
      ta.addEventListener("input", () => songSavers[i](ta.value));
    });
    function onFocus(e) {
      const chip = e.target.closest("[data-focus]");
      if (chip) set("song", "focus", chip.dataset.focus);
    }
    container.addEventListener("click", onFocus);
    cleanups.push(() => container.removeEventListener("click", onFocus));

    /* ---- reflection + class notes ---- */
    const reflectionSavers = {};
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const i = ta.dataset.reflection;
      reflectionSavers[i] = Utils.debounce((v) => set("reflection", i, v), 500);
      ta.addEventListener("input", () => reflectionSavers[i](ta.value));
    });
    const classNotes = PersonalNotes.wire(container, "notes-class5", {
      classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); },
    });
    cleanups.push(() => classNotes.destroy());

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const qs = cls.content.assignment.questions;
      const s = A(rec, "song");
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled((s.q || {})[2]) ? s.q[2] : cls.content.whatYoullLearn,
        toPractice: s.focus || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
      });
      Router.softRefresh(container, ClassDetailPage, params);
    }
    container.addEventListener("click", onComplete);
    cleanups.push(() => container.removeEventListener("click", onComplete));

    cleanups.push(LessonKit.wireViewedSentinel(container, () => ClassActivity.markCheckpoint(classId, "lessonViewed")));
    cleanups.push(LessonKit.wireStepper(container));
    syncCheckpoints();

    return () => {
      cleanups.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
      $("[data-warmup]") && $("[data-warmup]").removeEventListener("click", onWarmClick);
      PianoSynth.stopAll();
      VoiceRecorder.stopPlayback();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
