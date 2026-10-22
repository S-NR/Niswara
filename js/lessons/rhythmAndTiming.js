/* ============================================================
   CLASS 6 — RHYTHM & TIMING (interactive lesson)

   Rendered by ClassDetailPage for interactive: "rhythm-and-timing".
   Flow: HEAR THE BEAT → FEEL THE PULSE → COUNT → TAP → SPEAK IN TIME
   → SING IN TIME. Class 5 asked "can I hear what my voice is doing?";
   Class 6 adds "is it in the right place in time?".

   Timing results are a "basic timing estimate" from this device's
   audio clock — encouraging, approximate, never pass/fail. This class
   is about timing, not vocal power: comfortable note, comfortable volume.

   Reuses: LessonKit, rhythm tools (MetronomeEngine, Metronome,
   TapExercise, RhythmPatternExercise, BeatGuide, TapPad), PianoSynth,
   VirtualPiano (Class 3), RecordingCard (Class 5) for optional
   recordings, SelfAssessment (Class 4), Timer, PersonalNotes,
   ClassProgress, ClassActivity (per-user, synced to Supabase).
   ============================================================ */

const RhythmAndTimingLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "hear", label: "Hear" },
    { id: "feel", label: "Feel" },
    { id: "count", label: "Count" },
    { id: "tap", label: "Tap" },
    { id: "sing", label: "Sing" },
    { id: "speak", label: "Speak" },
    { id: "tempo", label: "Tempo" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const TEMPO = { ex1: 60, ex2: 70, count: 70, clap: 60, patterns: 70, sing: 65, speak: 70, song: 80, slow: 60, medium: 80 };
  const PRACTICE_TASK = "rhythm";
  const PRACTICE_CATEGORY = "Rhythm & Timing";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson (steps 1–2)" },
    { key: "metronomeUsed", label: "Used the metronome" },
    { key: "ex1", label: "Feel the beat" },
    { key: "ex2", label: "Tap the pulse" },
    { key: "ex3", label: "Counting" },
    { key: "ex4", label: "Clap the beat" },
    { key: "ex5", label: "Rhythm patterns" },
    { key: "ex6", label: "Sing with the beat" },
    { key: "ex7", label: "Speaking rhythm" },
    { key: "tempo", label: "Tempo change (60 → 80)" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const CLAP_PATTERNS = [
    { key: "quarter", label: "1 2 3 4", hits: [1, 1, 1, 1], sub: 1 },
    { key: "eighths", label: "1 & 2 & 3 & 4 &", hits: [1, 1, 1, 1, 1, 1, 1, 1], sub: 2 },
  ];
  const RHYTHM_PATTERNS = [
    { key: "A", label: "Pattern A", hits: [1, 0, 1, 0], sub: 1 },
    { key: "B", label: "Pattern B", hits: [1, 1, 0, 1], sub: 1 },
    { key: "C", label: "Pattern C", hits: [1, 0, 0, 1], sub: 1 },
    { key: "D", label: "8-beat D", hits: [1, 0, 1, 1, 0, 1, 0, 1], sub: 1, locked: true },
    { key: "E", label: "8-beat E", hits: [1, 1, 0, 1, 1, 0, 0, 1], sub: 1, locked: true },
  ];

  const S = (t = "Sing") => ({ t, note: true });
  const R = () => ({ t: "", rest: true });
  const COUNT_BARS = [[{ t: "1" }, { t: "2" }, { t: "3" }, { t: "4" }]];
  const SING_P1 = [[S(), R(), S(), R()]];
  const SING_P2 = [[S(), S(), R(), S()]];
  const PHRASE_BARS = [[{ t: "I" }, { t: "am" }, { t: "learn-" }, { t: "-ing" }], [{ t: "to" }, { t: "sing." }, R(), R()]];
  const PHRASE_SUNG = PHRASE_BARS.map((bar) => bar.map((tok) => (tok.rest ? tok : { ...tok, note: true })));
  // An original, copyright-free demo melody ("Step by Step")
  const SONG = {
    melody: [[{ t: "Step", midi: 60 }, { t: "by", midi: 62 }, { t: "step", midi: 64 }, R()], [{ t: "I", midi: 64 }, { t: "learn", midi: 62 }, { t: "the", midi: 62 }, { t: "beat.", midi: 60 }]],
  };
  SONG.count = SONG.melody.map((bar) => bar.map((_, i) => ({ t: String(i + 1) })));
  SONG.speak = SONG.melody.map((bar) => bar.map((tok) => (tok.rest ? tok : { t: tok.t })));

  const ASSIGNMENT_QUESTIONS = [
    "Did I stay with the beat?",
    "Did I rush?",
    "Did I fall behind?",
    "Was the slower tempo easier?",
    "What happened when the tempo increased?",
    "Which exercise was easiest?",
    "Which exercise was hardest?",
  ];
  const REFLECTION_CHOICES = [
    ["Yes", "Sometimes", "Not yet"],
    ["Yes", "Sometimes", "Not yet"],
    ["Yes", "Sometimes", "No", "Not sure"],
    ["Yes", "Sometimes", "No", "Not sure"],
    ["Yes", "Sometimes", "Not yet"],
    null, // free text
  ];
  const SING_ASSESS = [
    { value: "on", label: "On the beat", tone: "good" },
    { value: "early", label: "A bit early", tone: "maybe" },
    { value: "late", label: "A bit late", tone: "maybe" },
    { value: "unsure", label: "Not sure", tone: "neutral" },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow, tryIt } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();

  /* ---------- derived state ---------- */

  function assignmentDone(rec) {
    const a = A(rec, "assignment");
    const parts = a.parts || {};
    return [1, 2, 3, 4, 5].every((n) => parts[n]) && ASSIGNMENT_QUESTIONS.every((_, i) => filled((a.q || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    const tap = A(rec, "tap");
    if (tap.ex1) out.ex1 = true;
    if (tap.ex2) out.ex2 = true;
    if ((A(rec, "counting").bars || 0) >= 2) out.ex3 = true;
    const clap = A(rec, "clap");
    if (clap.quarter && clap.eighths) out.ex4 = true;
    const pat = A(rec, "patterns");
    if (pat.A && pat.B && pat.C) out.ex5 = true;
    const sing = A(rec, "sing");
    if (sing.p1Assess && sing.p2Assess) out.ex6 = true;
    const sp = A(rec, "speaking");
    if (sp[0] && sp[1] && sp[2]) out.ex7 = true;
    if (tap.tempo60 && tap.tempo80) out.tempo = true;
    const refl = A(rec, "reflection");
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(refl[i]));
    if (assignmentDone(rec)) out.assignment = true;
    return out;
  }

  /** Rhythm Awareness — a friendly guide from completion, timing estimates and self-assessment. Not a rating. */
  function awareness(rec) {
    const c = rec.checkpoints;
    const completion = PROGRESS_ITEMS.filter((i) => c[i.key]).length / PROGRESS_ITEMS.length;
    const score = { Good: 1, Developing: 0.6, "Needs practice": 0.3 };
    const results = Object.values(A(rec, "tap")).filter((r) => r && r.rating);
    const timing = results.length ? results.reduce((s, r) => s + score[r.rating], 0) / results.length : null;
    const refl = A(rec, "reflection");
    const yesMap = { Yes: 1, Sometimes: 0.6, "Not yet": 0.3 };
    const tendMap = { No: 1, Sometimes: 0.6, Yes: 0.45, "Not sure": 0.5 };
    const selfVals = [yesMap[refl[0]], yesMap[refl[1]], tendMap[refl[2]], tendMap[refl[3]], yesMap[refl[4]]].filter((v) => v !== undefined);
    const self = selfVals.length ? selfVals.reduce((a, b) => a + b, 0) / selfVals.length : null;
    let total;
    if (timing !== null && self !== null) total = completion * 0.5 + timing * 0.3 + self * 0.2;
    else if (timing !== null) total = completion * 0.6 + timing * 0.4;
    else if (self !== null) total = completion * 0.7 + self * 0.3;
    else total = completion;
    const level = total < 0.4 ? "Beginner" : total < 0.75 ? "Developing" : "Comfortable";
    return { level, completion, timing, self, results: results.length };
  }

  /* ---------- small views ---------- */

  function flowStrip() {
    const steps = ["👂 Listen", "💓 Feel", "🔢 Count", "👏 Tap", "🗣️ Speak", "🎵 Sing"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function conceptCard(title, def, example, demo) {
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <h4 class="font-display text-lg text-ink-50 mb-1">${title}</h4>
        <p class="text-sm text-ink-200 mb-2">${def}</p>
        <p class="text-xs text-ink-500 mb-3">${example}</p>
        <button type="button" data-demo="${demo}" class="ex-chip !text-xs">${icon("play", "w-3 h-3")} Hear it</button>
      </div>`;
  }

  function renderAwareness(rec) {
    const a = awareness(rec);
    const pct = (v) => (v === null ? "—" : `${Math.round(v * 100)}%`);
    return `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <h3 class="font-display text-xl text-ink-50 mb-4">Rhythm Awareness</h3>
        <div class="flex flex-wrap gap-2 mb-4">
          ${["Beginner", "Developing", "Comfortable"].map((l) => `<span class="ex-chip ${l === a.level ? "is-selected" : "opacity-60"}">${l}</span>`).join("")}
        </div>
        <p class="text-xs text-ink-500 leading-relaxed">A friendly guide to where you are today — <strong class="text-ink-300">not an objective or professional rating</strong>. It's based on exercises completed (${pct(a.completion)}), your basic timing estimates (${a.results ? pct(a.timing) : "none yet"}) and your own self-assessment (${a.self === null ? "not answered yet" : pct(a.self)}).</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["ex1", "ex2", "ex3", "ex4", "ex5", "ex6", "ex7"].filter((k) => c[k]).length;
    return [
      ["Heard and used the metronome", !!c.metronomeUsed],
      [`Rhythm exercises (${ex}/7)`, ex === 7],
      ["Kept time at 60 and 80 BPM", !!c.tempo],
      ["Reflected on my timing", !!c.reflection],
      ["Completed the assignment", !!c.assignment],
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can now hear a pitch, match a pitch, listen to yourself, and begin controlling your timing.</p>
        <p class="text-sm text-ink-300 leading-relaxed mb-2">Next, we're going to learn how to <strong class="text-ink-100">prepare the voice before singing.</strong></p>
        <p class="text-sm text-ink-400 leading-relaxed italic">“A warm-up isn't about singing as high or as loud as possible. It is about preparing the voice gently and efficiently.”</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class 6 complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-2">The right note, in the right place in time.</h3>
          <p class="text-sm text-ink-400 mb-5">Rhythm Awareness today: <strong class="text-ink-100">${awareness(rec).level}</strong></p>
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
            Complete Class 6 ${icon("check", "w-4 h-4")}
          </button>
        </div>
        ${bridge}
      </div>`;
  }

  function renderAssignmentStatus(rec) {
    const parts = A(rec, "assignment").parts || {};
    return `<div class="flex flex-wrap gap-2">${[1, 2, 3, 4, 5].map((n) => `<span class="ex-chip !text-xs ${parts[n] ? "is-selected" : ""}">${parts[n] ? "✓" : n} Part ${n}</span>`).join("")}</div>`;
  }

  function progressStats(cls) {
    return [
      { label: "Recordings", value: ClassActivity.count(cls.id, "recordings") },
      { label: `${PRACTICE_CATEGORY} logged here`, value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  function tempoCompare(rec) {
    const t = A(rec, "tap");
    if (!t.tempo60 || !t.tempo80) return `<p class="text-xs text-ink-500">Do both tempos, then compare here.</p>`;
    const line = (bpm, r) => `<li><strong class="text-ink-100">${bpm} BPM</strong> — ${r.rating}; ${({ ahead: "a little ahead (rushing)", behind: "a little behind", with: "mostly with the beat", none: "few taps near the beat" })[r.tendency]}</li>`;
    const rushedMore = t.tempo80.meanMs < t.tempo60.meanMs - 25;
    return `
      <ul class="text-sm text-ink-300 flex flex-col gap-1 mb-3">${line(60, t.tempo60)}${line(80, t.tempo80)}</ul>
      <p class="text-sm ${rushedMore ? "text-amber-300" : "text-ink-400"}">${rushedMore
        ? "Your taps moved earlier at the faster tempo — that's rushing. Remember: faster does not mean rushing. Let the clicks come to you."
        : "Your timing stayed fairly similar at both speeds — lovely. Faster music only means the beats are closer together, not that you should hurry."}</p>
      <p class="text-[11px] text-ink-600 mt-1">Basic timing estimate</p>`;
  }

  /* ---------- page ---------- */

  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const sing = A(rec, "sing");
    const sp = A(rec, "speaking");
    const refl = A(rec, "reflection");
    const aq = A(rec, "assignment").q || {};
    const songSteps = A(rec, "song");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Music moves through time", `
          ${p("“Good singing is not only about singing the right note. It is also about singing it at the <strong class=\"text-ink-100\">right time</strong>.” Every singer needs to know:")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 my-5">
            ${["When should I start?", "How long should I hold the sound?", "When should I stop?", "When should I breathe?", "When should the next word begin?"].map((q) => `<div class="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-sm text-ink-200">${q}</div>`).join("")}
          </div>
          <h3 class="font-display text-lg text-ink-100 mt-8 mb-3">Think of walking</h3>
          <div class="walk flex items-center gap-3 my-4" aria-hidden="true">${[1, 2, 3, 4].map((n) => `<span class="walk-step" data-walk="${n}">👣<span class="text-[10px] text-ink-500 block text-center">Step</span></span>`).join("")}</div>
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <button type="button" data-demo="walk" class="ex-chip">${icon("play", "w-3.5 h-3.5")} Walk with me</button>
            <span class="text-xs text-ink-500">Step — step — step — step. Those steps are the <strong class="text-ink-300">pulse</strong>.</span>
          </div>
          <div class="grid sm:grid-cols-2 gap-4 my-6">
            ${conceptCard("Beat", "The regular pulse — like your steps.", "Tap your foot to a song: that's the beat.", "beat")}
            ${conceptCard("Rhythm", "The pattern of sounds placed over the beats.", "Some steps are long, some short — like “walk, walk, run-run, walk”.", "rhythm")}
            ${conceptCard("Tempo", "How fast the beats happen.", "A slow stroll vs. a brisk walk — same steps, different speed.", "tempo")}
            ${conceptCard("Timing", "Putting each sound in the right place within the pulse.", "Stepping exactly on the beat, not before or after it.", "timing")}
          </div>
          ${p("Today you'll go step by step:")}
          ${flowStrip()}
        `)}

        ${chapter("understand", 2, "Don't rush. Don't chase the beat.", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-5">“Don't rush. Don't chase the beat.”</p>
            <p class="text-sm text-ink-200 mb-3">If you lose the beat:</p>
            <div class="flex flex-wrap items-center gap-2">
              ${["Stop.", "Listen.", "Find the pulse again.", "Then continue."].map((s, i) => `<span class="flow-chip !text-sm">${i + 1}. ${s}</span>`).join("")}
            </div>
          </div>
          ${p("Never speed up to catch up — that only pulls you further away. Waiting one beat and joining in again is what good musicians do.")}
          ${p("<span class=\"text-ink-400\">This class is about <strong class=\"text-ink-200\">timing, not vocal power</strong>. Whenever you sing today, use a comfortable note at a comfortable, speaking-like volume. Never push, never sing through discomfort.</span>")}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("hear", 3, "The metronome", `
          ${narrow(`
            ${p("A <strong class=\"text-ink-100\">metronome</strong> is a steady clicking clock for music. Beat 1 of every group of four has a brighter click and a brighter light, so you always know where “1” is.")}
            ${p("<strong class=\"text-ink-100\">BPM</strong> means <strong class=\"text-ink-100\">Beats Per Minute</strong>. At <strong class=\"text-ink-100\">60 BPM</strong> one beat happens about every second. At <strong class=\"text-ink-100\">120 BPM</strong>, two beats happen every second. Try the presets, or tap a speed with “Tap tempo”.")}
          `)}
          ${Metronome.render("main-metro", { bpm: 80 })}
          ${narrow(`<p class="text-xs text-ink-500 mt-3">Tip: all beats are shown as lights too, so you can follow with your eyes if sound is hard to hear.</p>`)}
        `, { wide: true })}

        ${chapter("feel", 4, "Exercise 1 — Feel the beat", `
          ${p("The metronome will play at <strong class=\"text-ink-100\">60 BPM</strong>. <strong class=\"text-ink-100\">Listen for a few seconds</strong> — four beats. Then <strong class=\"text-ink-100\">tap along with each beat</strong> on the big button (or press Space) for eight beats.")}
          ${TapExercise.render("tx-ex1")}
        `)}

        ${chapter("feel", 5, "Exercise 2 — Tap the pulse", `
          ${p("Same idea, but the beat lights are <strong class=\"text-ink-100\">hidden</strong> — only your ears guide you. Afterwards you'll see how your taps lined up with the beat.")}
          ${TapExercise.render("tx-ex2", { hideIndicator: true })}
        `)}

        ${chapter("count", 6, "Exercise 3 — Counting", `
          ${p("Musicians count beats in groups of four: <strong class=\"text-ink-100\">1 2 3 4, 1 2 3 4</strong>. Each group is called a <em>bar</em>. Press Start and <strong class=\"text-ink-100\">say the numbers out loud</strong> as they light up — gently, in your speaking voice.")}
          ${BeatGuide.render("bg-count", { bars: COUNT_BARS })}
          <div class="mt-4">${RecordingCard.render("rc-count", { title: "Optional: record your counting", hint: "Start the counting guide above, then record yourself saying “1 2 3 4” with it — and listen back. Does your voice land on the clicks?", maxSeconds: 20, section: false })}</div>
        `)}

        ${chapter("tap", 7, "Exercise 4 — Clap the beat", `
          ${p("<strong class=\"text-ink-100\">Listen → Count → Clap.</strong> First the simple beat — one clap on every count. Then the beat split in two: <strong class=\"text-ink-100\">1 & 2 & 3 & 4 &</strong> (say “and”). Clap or tap the big button.")}
          ${RhythmPatternExercise.render("rp-clap", { patterns: CLAP_PATTERNS, steps: ["👂 Listen", "🔢 Count", "👏 Clap"] })}
        `)}

        ${chapter("tap", 8, "Exercise 5 — Simple rhythm patterns", `
          ${p("Now patterns with gaps. <strong class=\"text-ink-100\">●</strong> means “sound”, <strong class=\"text-ink-100\">○</strong> means “silent beat” — keep counting through the silences. Play each one, count it, then tap it back. The 8-beat patterns unlock after A, B and C.")}
          ${RhythmPatternExercise.render("rp-patterns", { patterns: RHYTHM_PATTERNS })}
        `)}

        ${chapter("sing", 9, "Exercise 6 — Sing with the beat", `
          ${narrow(`
            ${p("Now your voice joins in. Choose <strong class=\"text-ink-100\">one comfortable note</strong> on the piano below — this is about timing, so the note never changes. Sing gently on “ah” or “mm”, only on the 🎵 beats; stay silent on ○.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl">
            ${VirtualPiano.render("rt-piano", { controls: false, keyboard: false, display: true })}
            <p class="text-xs text-ink-400 mt-3">Your note: <strong class="text-ink-100" data-sing-note>${NoteUtils.name(sing.note || 60)}</strong> — tap a key to change it.</p>
          </div>
          ${narrow(`
            <div class="grid md:grid-cols-2 gap-4 mt-5">
              <div class="flex flex-col gap-3">
                <p class="text-sm text-ink-100">Pattern 1 — 🎵 ○ 🎵 ○</p>
                ${BeatGuide.render("bg-sing1", { bars: SING_P1, guideToggle: true })}
                ${SelfAssessment.render("sing-p1", { question: "Did your notes start on the beat?", options: SING_ASSESS, selected: sing.p1Assess || null })}
              </div>
              <div class="flex flex-col gap-3">
                <p class="text-sm text-ink-100">Pattern 2 — 🎵 🎵 ○ 🎵</p>
                ${BeatGuide.render("bg-sing2", { bars: SING_P2, guideToggle: true })}
                ${SelfAssessment.render("sing-p2", { question: "Did your notes start on the beat?", options: SING_ASSESS, selected: sing.p2Assess || null })}
              </div>
            </div>
            ${tryIt("First run each pattern with the guide note on and sing along. Then untick “Play the note as a guide” and sing it on your own with just the clicks.", "Tip")}
            <div class="mt-4">${RecordingCard.render("rc-sing", { title: "Optional: record yourself", hint: "Start a pattern, then record — and listen back to hear whether your notes start with the clicks.", maxSeconds: 20, section: false })}</div>
          `)}
        `, { wide: true })}

        ${chapter("speak", 10, "Exercise 7 — Speaking rhythm", `
          ${p("Words have rhythm too. Here's a phrase placed on the beat — each word lights up when it's time to say it:")}
          <p class="font-display text-2xl text-ink-50 my-4">“I am learning to sing.”</p>
          ${[
            ["Step 1 — Tap the beat while speaking", "Tap the button on every beat while you say the words.", PHRASE_BARS, true],
            ["Step 2 — Speak the phrase in time", "Just say each word as it lights up — in your natural speaking voice.", PHRASE_BARS, false],
            ["Step 3 — Sing the phrase in time", "Now sing the words on your comfortable note, still in time.", PHRASE_SUNG, false],
          ].map(([title, hint, bars, pad], i) => `
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 mb-4" data-speak-step="${i}">
              <div class="flex items-center justify-between gap-3 mb-1">
                <p class="text-sm text-ink-100">${title}</p>
                <span class="text-[11px] text-emerald-300" data-speak-done="${i}" ${sp[i] ? "" : "hidden"}>${icon("check", "w-3 h-3 inline-flex align-[-1px]")} Done</span>
              </div>
              <p class="text-xs text-ink-500 mb-3">${hint}</p>
              ${BeatGuide.render(`bg-speak${i}`, { bars, guideToggle: i === 2 })}
              ${pad ? `<div class="flex justify-center mt-4">${TapPad.render("speak-pad", { label: "TAP" })}</div>` : ""}
              <button type="button" data-speak-confirm="${i}" class="vr-btn mt-3" ${sp[i] ? "" : "disabled"}>${sp[i] ? "✓ Done" : "I did this step"}</button>
            </div>`).join("")}
        `)}

        ${chapter("speak", 11, "Exercise 8 — Rhythm in a song (optional)", `
          ${p("A tiny original melody, “Step by Step”, at 80 BPM. Try each way of meeting it — listen, count, speak the words, then sing along. Keep it relaxed; this one's for fun.")}
          <div class="flex flex-wrap gap-1.5 mb-3" role="tablist">
            ${[["listen", "1 · Listen"], ["count", "2 · Count"], ["speak", "3 · Speak the rhythm"], ["sing", "4 · Sing along"]].map(([k, l], i) => `<button type="button" data-song-mode="${k}" class="ex-chip ${i === 0 ? "is-selected" : ""}">${l}${songSteps[k] ? " ✓" : ""}</button>`).join("")}
          </div>
          <div data-song-host></div>
        `)}

        ${chapter("tempo", 12, "Tempo change — slow to medium", `
          ${p("Now the same tapping exercise at two speeds: <strong class=\"text-ink-100\">60 BPM</strong>, then <strong class=\"text-ink-100\">80 BPM</strong>. Notice whether anything changes when the music gets faster.")}
          <div class="grid md:grid-cols-2 gap-4">
            <div><p class="text-sm text-ink-100 mb-2">Slow — 60 BPM</p>${TapExercise.render("tx-tempo60")}</div>
            <div><p class="text-sm text-ink-100 mb-2">Medium — 80 BPM</p>${TapExercise.render("tx-tempo80")}</div>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <div data-tempo-compare>${tempoCompare(rec)}</div>
            <div class="mt-4">${SelfAssessment.render("tempo-q", { question: "Does your timing change when the music becomes faster?", options: [
              { value: "yes", label: "Yes", tone: "neutral" }, { value: "little", label: "A little", tone: "neutral" }, { value: "no", label: "No", tone: "neutral" }, { value: "unsure", label: "Not sure", tone: "neutral" }], selected: A(rec, "tempoQ").change || null })}</div>
            <p class="text-sm text-ink-300 mt-4"><strong class="text-ink-100">Faster does not mean rushing.</strong> The beats just come closer together.</p>
          </div>
        `)}

        ${chapter("tempo", 13, "Rhythm vs pitch", `
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><h4 class="font-display text-lg text-ink-50 mb-1">Pitch answers</h4><p class="text-sm text-ink-300">“How high or low?”</p></div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><h4 class="font-display text-lg text-ink-50 mb-1">Rhythm answers</h4><p class="text-sm text-ink-300">“When — and for how long?”</p></div>
          </div>
          ${p("A singer can sing the correct pitch but still sound wrong if the note happens at the wrong time. Listen:")}
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.04] p-5">
              <p class="text-sm text-ink-100 mb-3">Correct pitch + wrong timing = ❌</p>
              <button type="button" data-demo="wrongTiming" class="ex-chip">${icon("play", "w-3.5 h-3.5")} Hear it</button>
            </div>
            <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-5">
              <p class="text-sm text-ink-100 mb-3">Correct pitch + correct timing = ✅</p>
              <button type="button" data-demo="rightTiming" class="ex-chip">${icon("play", "w-3.5 h-3.5")} Hear it</button>
            </div>
          </div>
          ${p("<span class=\"text-ink-400 block mt-5\">Same notes both times — only <em>when</em> one note happens changes. That's why timing matters as much as pitch.</span>")}
        `)}

        ${chapter("practice", 14, "Practice timer — Rhythm & Timing", `
          ${p("Use the metronome above or any exercise while the timer runs, then log the session. It's saved to your account as <strong class=\"text-ink-100\">Rhythm & Timing</strong>.")}
          ${Timer.render("rhythm-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 15, "Class 6 Assignment", `
          <div class="mb-5" data-assign-status>${renderAssignmentStatus(rec)}</div>
          <div class="flex flex-col gap-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <p class="text-sm text-ink-100 mb-1">Part 1 — 60 BPM: listen for 8 beats, then tap along for another 8</p>
              ${TapExercise.render("tx-a1")}
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <p class="text-sm text-ink-100 mb-3">Part 2 — Count 1 2 3 4 for 8 bars (60 BPM)</p>
              ${BeatGuide.render("bg-a2", { bars: COUNT_BARS })}
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <p class="text-sm text-ink-100 mb-3">Part 3 — Speak a short phrase in time</p>
              ${BeatGuide.render("bg-a3", { bars: PHRASE_BARS })}
              <button type="button" data-assign-confirm="3" class="vr-btn mt-3" disabled>I spoke it in time</button>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <p class="text-sm text-ink-100 mb-3">Part 4 — Sing a comfortable note in a simple rhythm</p>
              ${BeatGuide.render("bg-a4", { bars: SING_P2, guideToggle: true })}
              <button type="button" data-assign-confirm="4" class="vr-btn mt-3" disabled>I sang it in time</button>
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <p class="text-sm text-ink-100 mb-1">Part 5 — Repeat at 80 BPM: listen for 8 beats, tap for 8</p>
              ${TapExercise.render("tx-a5")}
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
              <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
              <div class="flex flex-col gap-4">
                ${ASSIGNMENT_QUESTIONS.map((q, i) => `
                  <div>
                    <label class="block text-sm text-ink-200 mb-1.5" for="rt-aq-${i}">${i + 1}. ${q}</label>
                    <textarea id="rt-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml(aq[i] || "")}</textarea>
                  </div>`).join("")}
              </div>
            </div>
          </div>
        `)}

        ${chapter("reflect", 16, "Self-reflection", `
          ${p("Saved privately to your Class 6 progress.")}
          <div class="flex flex-col gap-5">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <p class="text-sm text-ink-200 mb-2">${q}</p>
                ${REFLECTION_CHOICES[i]
                  ? `<div class="flex flex-wrap gap-2">${REFLECTION_CHOICES[i].map((c) => `<button type="button" data-refl="${i}" data-refl-value="${c}" class="ex-chip ${refl[i] === c ? "is-selected" : ""}">${c}</button>`).join("")}</div>`
                  : `<textarea data-refl-text="${i}" rows="2" class="field" placeholder="e.g. Not rushing when the tempo goes up">${Utils.escapeHtml(refl[i] || "")}</textarea>`}
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 17, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-class6", { placeholder: "e.g. I rush when the tempo increases. I can follow 60 BPM but 80 BPM is harder. I find counting easier than clapping." })}
        `)}

        ${chapter("reflect", 18, "Rhythm Awareness", `<div data-awareness>${renderAwareness(rec)}</div>`)}

        ${chapter("complete", 19, "Your progress", `<div data-lesson-progress>${ClassProgress.render("Class 6 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 20, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- live progress ---- */
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render("Class 6 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-awareness]").innerHTML = renderAwareness(rec);
      $("[data-assign-status]").innerHTML = renderAssignmentStatus(rec);
      $("[data-tempo-compare]").innerHTML = tempoCompare(rec);
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true); // everything else only moves forward
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- concept demos ---- */
    let demoEngine = null;
    function demo(kind) {
      if (demoEngine) demoEngine.stop();
      const at = (s, fn) => setTimeout(fn, s * 1000);
      if (kind === "walk") {
        let n = 0;
        demoEngine = new MetronomeEngine({ bpm: 90, onBeat: () => {
          container.querySelectorAll("[data-walk]").forEach((w) => w.classList.toggle("is-on", Number(w.dataset.walk) === (n % 4) + 1));
          if (++n >= 8) { demoEngine.stop(); container.querySelectorAll("[data-walk]").forEach((w) => w.classList.remove("is-on")); }
        } });
        demoEngine.start();
      } else if (kind === "beat" || kind === "tempo") {
        const run = (bpm, beats, then) => { let n = 0; demoEngine = new MetronomeEngine({ bpm, onBeat: () => { if (++n >= beats) { demoEngine.stop(); if (then) then(); } } }); demoEngine.start(); };
        if (kind === "beat") run(80, 8);
        else run(60, 4, () => at(0.5, () => run(110, 6)));
      } else if (kind === "rhythm") {
        [0, 0.6, 1.2, 1.5, 1.8].forEach((t) => at(t, () => PianoSynth.play(64, { duration: 0.22 })));
      } else if (kind === "rightTiming" || kind === "wrongTiming" || kind === "timing") {
        // Same four notes; "wrong" places the third one late. "timing" plays on-time, then late.
        const g = 0.6;
        const phrase = (offset, late) => [60, 62, 64, 65].forEach((m, i) => at(offset + i * g + (i === 2 ? late : 0), () => PianoSynth.play(m, { duration: 0.45 })));
        if (kind === "timing") { phrase(0, 0); phrase(3.2, 0.28); }
        else phrase(0, kind === "wrongTiming" ? 0.28 : 0);
      }
    }
    function onDemo(e) { const b = e.target.closest("[data-demo]"); if (b) demo(b.dataset.demo); }
    container.addEventListener("click", onDemo);
    cleanups.push(() => { container.removeEventListener("click", onDemo); if (demoEngine) demoEngine.stop(); });

    /* ---- main metronome ---- */
    own(Metronome.wire(container, "main-metro", {
      bpm: 80,
      onBeats: (n) => { if (n === 8) ClassActivity.markCheckpoint(classId, "metronomeUsed"); },
    }));

    /* ---- tap exercises ---- */
    const tapSaved = A(rec0(), "tap");
    const tapEx = (domId, key, bpm, listen, tapBeats, after) => own(TapExercise.wire(container, domId, {
      bpm, listenBeats: listen, tapBeats, saved: tapSaved[key] || null,
      onResult: (res) => { set("tap", key, res); if (after) after(res); },
    }));
    tapEx("tx-ex1", "ex1", TEMPO.ex1, 4, 8);
    tapEx("tx-ex2", "ex2", TEMPO.ex2, 4, 8);
    tapEx("tx-tempo60", "tempo60", TEMPO.slow, 4, 8);
    tapEx("tx-tempo80", "tempo80", TEMPO.medium, 4, 8);
    const markPart = (n) => set("assignment", "parts", { ...(A(rec0(), "assignment").parts || {}), [n]: true });
    tapEx("tx-a1", "a1", 60, 8, 8, () => markPart(1));
    tapEx("tx-a5", "a5", 80, 8, 8, () => markPart(5));

    /* ---- counting ---- */
    own(BeatGuide.wire(container, "bg-count", {
      bpm: TEMPO.count, loops: 4, bars: COUNT_BARS,
      onComplete: ({ bars }) => set("counting", "bars", (A(rec0(), "counting").bars || 0) + bars),
    }));
    const recCard = (domId, key, name) => own(RecordingCard.wire(container, domId, {
      classId, take: (A(rec0(), "recordings") || {})[key] || null, maxSeconds: 20,
      meta: { name, exercise: `rhythm-${key}` },
      onSaved: (take) => { set("recordings", key, take); ClassActivity.bump(classId, "recordings"); },
    }));
    recCard("rc-count", "count", "Class 6 counting");

    /* ---- clapping & patterns ---- */
    own(RhythmPatternExercise.wire(container, "rp-clap", {
      bpm: TEMPO.clap, patterns: CLAP_PATTERNS, saved: A(rec0(), "clap"),
      onResult: (key, res) => set("clap", key, res),
    }));
    const patSaved = A(rec0(), "patterns");
    const unlockLong = () => { patEx.unlock("D"); patEx.unlock("E"); };
    const patEx = own(RhythmPatternExercise.wire(container, "rp-patterns", {
      bpm: TEMPO.patterns, patterns: RHYTHM_PATTERNS.map((pp) => ({ ...pp })), saved: patSaved,
      onResult: (key, res) => {
        set("patterns", key, res);
        const s = A(rec0(), "patterns");
        if (s.A && s.B && s.C) unlockLong();
      },
    }));
    if (patSaved.A && patSaved.B && patSaved.C) unlockLong(); // returning learner: 8-beat patterns stay open

    /* ---- sing with the beat ---- */
    const singNote = () => A(rec0(), "sing").note || 60;
    const c4range = (ClassActivity.get("L1C04").answers.setup || {}).range === "lower" ? { from: 48, to: 60 } : { from: 60, to: 72 };
    own(VirtualPiano.wire(container, "rt-piano", {
      range: c4range,
      onNote: ({ midi, name }) => { set("sing", "note", midi); $("[data-sing-note]").textContent = name; },
    }));
    own(BeatGuide.wire(container, "bg-sing1", { bpm: TEMPO.sing, loops: 4, bars: SING_P1, getNote: singNote, onComplete: () => set("sing", "p1Run", true) }));
    own(BeatGuide.wire(container, "bg-sing2", { bpm: TEMPO.sing, loops: 4, bars: SING_P2, getNote: singNote, onComplete: () => set("sing", "p2Run", true) }));
    recCard("rc-sing", "sing", "Class 6 singing in time");
    function onAssess(e) {
      const chip = e.target.closest('[data-assess^="sing-p"] [data-assess-choice], [data-assess="tempo-q"] [data-assess-choice]');
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      group.querySelectorAll("[data-assess-choice]").forEach((b) => b.classList.toggle("is-selected", b === chip));
      const which = group.dataset.assess;
      if (which === "tempo-q") set("tempoQ", "change", chip.dataset.assessChoice);
      else set("sing", which === "sing-p1" ? "p1Assess" : "p2Assess", chip.dataset.assessChoice);
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- speaking rhythm ---- */
    [PHRASE_BARS, PHRASE_BARS, PHRASE_SUNG].forEach((bars, i) => {
      own(BeatGuide.wire(container, `bg-speak${i}`, {
        bpm: TEMPO.speak, loops: 2, bars, getNote: singNote,
        onComplete: () => { const b = $(`[data-speak-confirm="${i}"]`); if (b && !(A(rec0(), "speaking"))[i]) b.disabled = false; },
      }));
    });
    cleanups.push(TapPad.wire(container, "speak-pad", { now: () => 0, onTap: () => {} })); // feel-only tapping
    function onSpeakConfirm(e) {
      const b = e.target.closest("[data-speak-confirm]");
      if (!b || b.disabled) return;
      const i = b.dataset.speakConfirm;
      set("speaking", i, true);
      b.textContent = "✓ Done";
      $(`[data-speak-done="${i}"]`).hidden = false;
    }
    container.addEventListener("click", onSpeakConfirm);
    cleanups.push(() => container.removeEventListener("click", onSpeakConfirm));

    /* ---- rhythm in a song (optional) ---- */
    let songGuide = null;
    function mountSong(mode) {
      if (songGuide) songGuide.destroy();
      const bars = { listen: SONG.melody, count: SONG.count, speak: SONG.speak, sing: SONG.melody }[mode];
      const hints = {
        listen: "Listen to the melody and feel where the beats are.",
        count: "Count 1 2 3 4 out loud with the clicks (the melody is silent so you can hear yourself).",
        speak: "Speak the words in rhythm — each word on its beat.",
        sing: "Sing along with the melody, gently. Untick the guide to try it on your own.",
      };
      $("[data-song-host]").innerHTML = `<p class="text-xs text-ink-500 mb-3">${hints[mode]}</p>${BeatGuide.render("bg-song", { bars, guideToggle: mode === "sing" })}`;
      songGuide = BeatGuide.wire(container, "bg-song", { bpm: TEMPO.song, loops: 2, bars, onComplete: () => set("song", mode, true) });
    }
    function onSongMode(e) {
      const b = e.target.closest("[data-song-mode]");
      if (!b) return;
      container.querySelectorAll("[data-song-mode]").forEach((x) => x.classList.toggle("is-selected", x === b));
      mountSong(b.dataset.songMode);
    }
    container.addEventListener("click", onSongMode);
    cleanups.push(() => { container.removeEventListener("click", onSongMode); if (songGuide) songGuide.destroy(); });
    mountSong("listen");

    /* ---- assignment ---- */
    own(BeatGuide.wire(container, "bg-a2", { bpm: 60, loops: 8, bars: COUNT_BARS, onComplete: () => markPart(2) }));
    const confirmAfter = (n) => () => { const b = $(`[data-assign-confirm="${n}"]`); if (b) b.disabled = false; };
    own(BeatGuide.wire(container, "bg-a3", { bpm: 60, loops: 2, bars: PHRASE_BARS, onComplete: confirmAfter(3) }));
    own(BeatGuide.wire(container, "bg-a4", { bpm: 60, loops: 2, bars: SING_P2, getNote: singNote, onComplete: confirmAfter(4) }));
    const parts0 = A(rec0(), "assignment").parts || {};
    [3, 4].forEach((n) => { if (parts0[n]) { const b = $(`[data-assign-confirm="${n}"]`); b.disabled = true; b.textContent = "✓ Done"; } });
    function onAssignConfirm(e) {
      const b = e.target.closest("[data-assign-confirm]");
      if (!b || b.disabled) return;
      markPart(Number(b.dataset.assignConfirm));
      b.disabled = true; b.textContent = "✓ Done";
    }
    container.addEventListener("click", onAssignConfirm);
    cleanups.push(() => container.removeEventListener("click", onAssignConfirm));
    container.querySelectorAll("[data-assign-q]").forEach((ta) => {
      const i = ta.dataset.assignQ;
      const save = Utils.debounce((v) => set("assignment", "q", { ...(A(rec0(), "assignment").q || {}), [i]: v }), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- reflection ---- */
    function onRefl(e) {
      const chip = e.target.closest("[data-refl]");
      if (!chip) return;
      const i = chip.dataset.refl;
      container.querySelectorAll(`[data-refl="${i}"]`).forEach((b) => b.classList.toggle("is-selected", b === chip));
      set("reflection", i, chip.dataset.reflValue);
    }
    container.addEventListener("click", onRefl);
    cleanups.push(() => container.removeEventListener("click", onRefl));
    container.querySelectorAll("[data-refl-text]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflText, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- notes, practice timer ---- */
    own(PersonalNotes.wire(container, "notes-class6", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "rhythm-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const qs = cls.content.assignment.questions;
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: "I don't just need to sing the right note — I need to put it in the right place in time.",
        toPractice: r[5] || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q} ${String(r[i]).trim()}` : "")).filter(Boolean).join(" "),
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

  return { render, mount, PROGRESS_ITEMS, awareness };
})();
