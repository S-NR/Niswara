/* ============================================================
   CLASS 14 — BASIC VOCAL DYNAMICS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "basic-vocal-dynamics".

   Core idea: "Learn to control how softly and strongly you sing,
   without losing pitch or comfort." Dynamics is a new dimension —
   distinct from pitch (Class 4), stability (Class 12), transitions
   (Class 13), rhythm (Class 6) and breath (Class 11) — and this
   class combines it with every one of them. "Stronger does not
   mean louder at any cost": dynamics sit on a soft/medium/stronger
   spectrum, never a 0–100 score, and nothing here ever rewards
   shouting, pushing or a bigger breath.

   Flow: understand -> choose a reference note -> hear the three
   levels -> sing one note at three levels -> gradual soft<->medium
   -> a simple crescendo and decrescendo -> dynamics + pitch
   stability (Class 12) -> dynamics + transitions (Class 13) ->
   dynamics + rhythm (Class 6) -> dynamics + breath (Class 11) ->
   dynamics in a short melody (volume vs. expression) -> listen and
   identify + recording comparison + mic awareness + common
   problems -> self-evaluate -> practice -> assignment -> reflect
   -> milestone.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), VolumeEnvelope + LoudnessAnalysis +
   RecordingComparison + ControlCheck (Class 7/9, vocalControl.js —
   VolumeEnvelope gained optional "up"/"down" ramp shapes here,
   on top of its original soft->medium->soft hill, so Class 7's
   call sites are unaffected), the Class 6 BeatGuide (gained an
   optional per-token velocity, likewise backward compatible), the
   Class 11 breathing circle + exact phrase text, the Class 12
   PitchVisualizer/StabilityPanel, RecordingCard, Timer,
   PersonalNotes, ClassProgress, ClassActivity. No fabricated
   "AI judgment" of the learner's voice anywhere — the four
   "Listen and identify" examples are honestly synthesized (loudness
   is exactly what PianoSynth's velocity controls, unlike a vocal
   pitch flaw it can't simulate), and the comparison explicitly
   avoids implying the louder/varied version is "better".
   ============================================================ */

const BasicVocalDynamicsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "setup", label: "Setup" },
    { id: "hear", label: "Hear" },
    { id: "levels", label: "Levels" },
    { id: "gradual", label: "Gradual" },
    { id: "crescendo", label: "Crescendo" },
    { id: "pitch", label: "+ Pitch" },
    { id: "transitions", label: "+ Transitions" },
    { id: "rhythm", label: "+ Rhythm" },
    { id: "breath", label: "+ Breath" },
    { id: "melody", label: "+ Melody" },
    { id: "listen", label: "Listen" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGES = { middle: { from: 60, to: 72 }, lower: { from: 48, to: 60 } };
  const STEP = 2; // whole step — the Class 9/10/11/12/13 convention
  const BPM = 70;
  const PRACTICE_TASK = "control";
  const PRACTICE_CATEGORY = "Vocal Dynamics";
  const BREATH_PHRASE = "I am learning to sing."; // same phrase as Class 11's one-breath exercise
  const LEVEL_VELOCITY = { soft: 0.22, medium: 0.55, stronger: 0.88 };

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "listenDynamics", label: "Listened to the three levels" },
    { key: "threeLevels", label: "Same note, three levels completed" },
    { key: "softToMedium", label: "Soft → medium gradual completed" },
    { key: "mediumToSoft", label: "Medium → soft gradual completed" },
    { key: "crescendo", label: "Simple crescendo completed" },
    { key: "decrescendo", label: "Simple decrescendo completed" },
    { key: "pitchDynamics", label: "Dynamics + pitch stability completed" },
    { key: "transitionDynamics", label: "Dynamics + transitions completed" },
    { key: "rhythmDynamics", label: "Dynamics + rhythm completed" },
    { key: "breathDynamics", label: "Dynamics + breath completed" },
    { key: "melodyDynamics", label: "Dynamics in a melody completed" },
    { key: "listeningId", label: "Listen and identify completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);

  const dynAssess = (question, feedback) => ({
    question,
    options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")],
    feedback,
  });

  const STEADY_ASSESS = dynAssess("Did your pitch stay steady while your volume changed?", {
    yes: "Lovely — that's exactly the control we're building.", mostly: "Good. Small drift is common — compare the takes by ear.",
    notyet: "Very common at this stage. Try a gentler “stronger” take, and keep each note short.", unsure: "Play the takes back one after another and listen for the pitch.",
  });
  const GRADUAL_UP_ASSESS = dynAssess("Did your volume move smoothly from soft to medium?", {
    yes: "Lovely — a smooth, controlled rise.", mostly: "Good — small bumps are completely normal at this stage.",
    notyet: "Totally normal. Try a smaller change and take it slower.", unsure: "Listen back and compare with the guide line above.",
  });
  const GRADUAL_DOWN_ASSESS = dynAssess("Did your volume move smoothly from medium down to soft?", {
    yes: "Lovely — a smooth, controlled fall.", mostly: "Good — small bumps are completely normal at this stage.",
    notyet: "Totally normal. Try a smaller change and take it slower.", unsure: "Listen back and compare with the guide line above.",
  });
  const CRESCENDO_ASSESS = dynAssess("Did your volume increase gradually, without forcing or straining?", {
    yes: "Lovely — a gentle, controlled crescendo.", mostly: "Good. Compare your loudness line with the guide below.",
    notyet: "That's fine — a smaller change, with a little more breath support, often feels easier.", unsure: "Look at your loudness line below, and listen back once more.",
  });
  const DECRESCENDO_ASSESS = dynAssess("Did your volume decrease gradually and stay controlled?", {
    yes: "Lovely — a smooth, controlled decrescendo.", mostly: "Good. Compare your loudness line with the guide below.",
    notyet: "That's fine — try starting a touch less strong, so there's more room to taper.", unsure: "Look at your loudness line below, and listen back once more.",
  });
  const TRANS_UP_ASSESS = dynAssess("Did your volume increase as you moved upward, while staying in tune?", {
    yes: "Lovely — pitch and dynamics working together.", mostly: "Good — this is a genuinely harder combination; small slips are expected.",
    notyet: "Try the plain transition from Class 13 again, then add the volume change.", unsure: "Listen back and compare with your Class 13 recordings.",
  });
  const TRANS_DOWN_ASSESS = dynAssess("Did your volume decrease as you moved downward, while staying in tune?", {
    yes: "Lovely — pitch and dynamics working together.", mostly: "Good — this is a genuinely harder combination; small slips are expected.",
    notyet: "Try the plain transition from Class 13 again, then add the volume change.", unsure: "Listen back and compare with your Class 13 recordings.",
  });
  const RHYTHM_ASSESS = dynAssess("Could you change your volume cleanly on each beat, without losing the pitch?", {
    yes: "Lovely — clean changes, right on the beat.", mostly: "Good. Small timing slips are completely normal.",
    notyet: "Try it once without the metronome, then bring it back in.", unsure: "Listen back against the beat guide above.",
  });
  const BREATH_ASSESS = dynAssess("Did you stay comfortable while changing volume on one breath each time?", {
    yes: "Lovely — comfortable breath and dynamics, together.", mostly: "Good. A little extra tension is common when combining two new skills.",
    notyet: "Revisit Class 11 for a moment, then try a smaller volume change.", unsure: "Listen back to the three takes.",
  });
  const HEAR_ASSESS = {
    question: "Can you hear a difference between the three volumes?",
    options: [opt("yes", "Yes, clearly", "good"), opt("mostly", "A little", "good"), opt("notyet", "Not really", "maybe"), opt("unsure", "Not sure")],
  };
  const LEVELS_ASSESS = STEADY_ASSESS;
  const MELODY_COMPARE_ASSESS = {
    question: "Which version felt more expressive — or did they feel about the same?",
    options: [opt("varied", "The varied version", "good"), opt("constant", "The constant version", "neutral"), opt("same", "About the same", "neutral"), opt("unsure", "Not sure")],
  };
  const CLASSIFY_OPTIONS = [opt("rising", "Soft → stronger"), opt("falling", "Strong → soft"), opt("flat", "Constant medium"), opt("hill", "Soft → stronger → soft"), opt("unsure", "Not sure")];
  const IDENTIFY_EXAMPLES = {
    a: { key: "rising", label: "Example A", vel: [0.2, 0.42, 0.62, 0.85] },
    b: { key: "falling", label: "Example B", vel: [0.85, 0.62, 0.42, 0.2] },
    c: { key: "flat", label: "Example C", vel: [0.5, 0.5, 0.5, 0.5] },
    d: { key: "hill", label: "Example D", vel: [0.25, 0.7, 0.7, 0.25] },
  };

  const CHECK_ROWS = [
    { key: "soft", area: "Soft", question: "Could I sing softly without my voice disappearing or becoming breathy?", levels: YMN },
    { key: "medium", area: "Medium", question: "Was my medium volume comfortable and natural?", levels: YMN },
    { key: "stronger", area: "Stronger", question: "Could I sing a little stronger without shouting or straining?", levels: YMN },
    { key: "pitch", area: "Pitch", question: "Did my pitch stay steady while my volume changed?", levels: YMN },
    { key: "control", area: "Control", question: "Could I move gradually between volumes, instead of suddenly?", levels: YMN },
    { key: "comfort", area: "Comfort", question: "Did I remain relaxed and comfortable throughout?", levels: lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["no", "○", "No"]) },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state (base note inherited: own -> Class 13 -> 12 -> 10 -> 4) ---------- */
  function range() {
    const c4 = (ClassActivity.get("L1C04").answers.setup || {}).range;
    return RANGES[c4] || RANGES.middle;
  }
  function baseNote(rec) {
    const r = range();
    const n = A(rec, "setup").note
      ?? (ClassActivity.get("L1C13").answers.setup || {}).note
      ?? (ClassActivity.get("L1C12").answers.setup || {}).note
      ?? (ClassActivity.get("L1C10").answers.setup || {}).note
      ?? (ClassActivity.get("L1C04").answers.setup || {}).note;
    return typeof n === "number" && n >= r.from && n <= r.to - 2 * STEP ? n : r.from;
  }

  /* ---- single-note dynamics exercise configs (PitchMatchExercise, chain: false) ---- */
  const levelsEx = () => ({
    eyebrow: "Exercise 2 · Levels", title: "One note, three volumes",
    intro: "Sing the same note three times: comfortably soft, your natural medium volume, then a little stronger. Keep the pitch exactly the same — only the volume changes.",
    chain: false, refLabel: "Reference note",
    slots: [
      { key: "soft", label: "1 · Soft", hint: "Comfortably quiet — still a clear tone, not a whisper" },
      { key: "medium", label: "2 · Medium", hint: "Your natural, comfortable volume" },
      { key: "stronger", label: "3 · Stronger", hint: "A little more energy — never shouting" },
    ],
    assessment: LEVELS_ASSESS,
    isComplete: (s) => ["soft", "medium", "stronger"].every((k) => s.takes[k] && s.takes[k].assessment),
  });
  const stabilityEx = () => ({
    eyebrow: "Exercise 7 · Pitch + Dynamics", title: "Keep the pitch while the volume changes",
    intro: "Connecting Class 12: sing the same note at medium, then stronger, then soft — keeping the pitch steady the whole time.",
    chain: false, refLabel: "Reference note",
    slots: [
      { key: "medium", label: "1 · Medium", hint: "Your natural volume" },
      { key: "stronger", label: "2 · Stronger", hint: "A little more energy, still in tune" },
      { key: "soft", label: "3 · Soft", hint: "Comfortably quiet, pitch unchanged" },
    ],
    assessment: STEADY_ASSESS,
    isComplete: (s) => ["medium", "stronger", "soft"].every((k) => s.takes[k] && s.takes[k].assessment),
  });
  const gradualEx = (eyebrow, title, intro, assessment) => ({
    eyebrow, title, intro, chain: false, refLabel: "Reference note", noEstimate: true,
    slots: [{ key: "take", label: "Your take", hint: "Follow the guide below as you sing" }],
    assessment,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  });
  const EX = {
    levels: levelsEx,
    stability: stabilityEx,
    softToMedium: () => gradualEx("Exercise 3 · Gradual", "Soft → medium", "One note: start comfortably soft, and gradually become a little stronger — medium, not loud.", GRADUAL_UP_ASSESS),
    mediumToSoft: () => gradualEx("Exercise 4 · Gradual", "Medium → soft", "The same note, the other way: start at your medium volume, and gradually fade to comfortably soft.", GRADUAL_DOWN_ASSESS),
    crescendo: () => gradualEx("Exercise 5 · Crescendo", "A simple crescendo", "One note, one breath: soft (p) → a little stronger (mp) → stronger still (mf) → your comfortable strongest (f). Gradual, not sudden.", CRESCENDO_ASSESS),
    decrescendo: () => gradualEx("Exercise 6 · Decrescendo", "A simple decrescendo", "The reverse: your comfortable strongest (f) → (mf) → (mp) → soft (p). Gradual, not sudden.", DECRESCENDO_ASSESS),
  };
  const transEx = (eyebrow, title, intro, assessment) => ({
    eyebrow, title, intro, chain: true, refLabel: "Reference notes",
    slots: [{ key: "take", label: "Your take", hint: "Listen, then sing it back with the dynamics described above" }],
    assessment,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  });
  const TRANS = {
    up: () => transEx("Exercise 8 · Transitions + Dynamics", "Rising pitch, rising volume", "1 → 2 → 3, getting a little stronger as you go up: soft, medium, stronger. Stay in tune as the volume changes.", TRANS_UP_ASSESS),
    down: () => transEx("Exercise 8 · Transitions + Dynamics", "Falling pitch, falling volume", "3 → 2 → 1, getting softer as you come down: stronger, medium, soft.", TRANS_DOWN_ASSESS),
  };
  const melodyEx = () => ({
    eyebrow: "Exercise 11 · Dynamics in a Melody", title: "1 → 2 → 3 → 2 → 1, two ways",
    intro: "Sing the same short pattern twice: once at a constant medium volume, then again with changing dynamics — soft, soft, a little stronger, soft, soft.",
    chain: true, refLabel: "Reference notes",
    slots: [
      { key: "constant", label: "1 · Constant (all medium)", hint: "The same comfortable volume throughout" },
      { key: "varied", label: "2 · Varied (soft–soft–stronger–soft–soft)", hint: "Let the middle note stand out a little" },
    ],
    assessment: null,
    isComplete: (s) => !!(s.takes.constant && s.takes.constant.mediaId) && !!(s.takes.varied && s.takes.varied.mediaId),
  });

  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const exDone = (rec, key, cfg) => cfg.isComplete(exState(rec, key));

  function identifyDone(rec) {
    const id = A(rec, "identify");
    return ["a", "b", "c", "d"].every((k) => filled(id[k]));
  }
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return ["attempt1", "attempt2", "attempt3", "crescendo", "decrescendo", "melody"].every((k) => a[k] && a[k].mediaId)
      && cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (filled(A(rec, "hear").assess)) out.listenDynamics = true;
    if (exDone(rec, "levels", EX.levels())) out.threeLevels = true;
    if (exDone(rec, "softToMedium", EX.softToMedium())) out.softToMedium = true;
    if (exDone(rec, "mediumToSoft", EX.mediumToSoft())) out.mediumToSoft = true;
    if (exDone(rec, "crescendo", EX.crescendo())) out.crescendo = true;
    if (exDone(rec, "decrescendo", EX.decrescendo())) out.decrescendo = true;
    if (exDone(rec, "stability", EX.stability())) out.pitchDynamics = true;
    if (exDone(rec, "transUp", TRANS.up()) && exDone(rec, "transDown", TRANS.down())) out.transitionDynamics = true;
    const rhythm = A(rec, "rhythm");
    if ((rhythm.take || {}).mediaId && filled(rhythm.assess)) out.rhythmDynamics = true;
    const breath = A(rec, "breath");
    if (["medium", "soft", "stronger"].every((k) => (breath[k] || {}).mediaId) && filled(breath.assess)) out.breathDynamics = true;
    const melody = exState(rec, "melody");
    if (melodyEx().isComplete(melody) && filled(A(rec, "melody").compare)) out.melodyDynamics = true;
    if (identifyDone(rec)) out.listeningId = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function dynamicScale() {
    return `
      <div class="rounded-2xl border border-white/10 bg-ink-950/60 p-5" aria-label="A spectrum from soft to stronger — not a numeric score">
        <div class="h-3 rounded-full bg-gradient-to-r from-teal-400/40 via-gold-400/50 to-gold-500/80 mb-3"></div>
        <div class="flex justify-between text-xs text-ink-400"><span>Soft</span><span>Medium</span><span>Stronger</span></div>
        <p class="text-[11px] text-ink-600 mt-3">A spectrum, not a score. There's no “100%” here — just a comfortable range you can move within.</p>
      </div>`;
  }

  function milestoneStrip() {
    const steps = ["PITCH", "RHYTHM", "BREATH", "TRANSITIONS", "DYNAMICS"];
    return `<div class="flex flex-wrap items-center gap-1.5 my-6">${steps.map((s, i) => `<span class="flow-chip tracking-[0.1em] ${s === "DYNAMICS" ? "!bg-gold-500/15 !text-gold-300" : ""}">${s}</span>${i < steps.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  }

  function problems() {
    const items = [
      ["“My pitch rises when I sing stronger.”", `<p>This is pushing, not control. Try a gentler “stronger” — a little more breath support, not more effort — and revisit <a href="#/classes/L1C12" class="text-gold-300 underline">Class 12 — Pitch Stability</a>.</p>`],
      ["“My voice disappears when I sing softly.”", `<p>Soft does not mean whisper. Keep a clear, supported tone at a lower volume, rather than letting the air take over.</p>`],
      ["“I think stronger means shouting.”", `<p>Stronger means a little more energy and breath support, while staying comfortable and in tune — not more volume at any cost. Shouting strains the voice.</p>`],
      ["“My throat feels tight when I get louder.”", `<p>Stop, and return to <a href="#/classes/L1C08" class="text-gold-300 underline">Class 8 — Vocal Relaxation</a>. Tension is a sign to use less effort, not more.</p>`],
      ["“I can't hear the difference between the levels.”", `<p>Use headphones if you can, and listen closely rather than singing louder to compensate — this is a listening skill that develops with practice.</p>`],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([q, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${q}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <div class="text-sm text-ink-300 leading-relaxed mt-3">${a}</div>
      </details>`).join("")}</div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["listenDynamics", "threeLevels", "softToMedium", "mediumToSoft", "crescendo", "decrescendo", "pitchDynamics", "transitionDynamics", "rhythmDynamics", "breathDynamics", "melodyDynamics", "listeningId"].filter((k) => c[k]).length;
    return [
      [`Dynamics exercises (${ex}/12)`, ex === 12],
      ["Self-evaluation", !!c.selfEval],
      ["Reflected", !!c.reflection],
      ["Completed the assignment", !!c.assignment],
    ];
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 14 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 leading-tight">YOUR VOICE HAS <span class="text-gold-300">DYNAMICS</span></p>
        <p class="text-sm text-ink-300 mt-4">You've learned to match a note, stabilize it, and move between notes.</p>
        <p class="text-sm text-ink-100">Now you can change how softly or strongly you sing it — on purpose, and still stay in tune.</p>
        ${milestoneStrip()}
      </div>`;
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
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can now sing with intentional dynamics, not just one fixed volume.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll work on making the words themselves clearer.` : "More of Level 1 is on its way."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Control how softly and strongly you sing.</h3>
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
    const hear = A(rec, "hear");
    const rhythm = A(rec, "rhythm");
    const breath = A(rec, "breath");
    const melody = A(rec, "melody");
    const identify = A(rec, "identify");
    const refl = A(rec, "reflection");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Pitch, and now dynamics", `
          ${p("So far, every class has focused on pitch — which note. This class introduces a second, independent skill: <strong class=\"text-ink-100\">dynamics</strong> — how softly or strongly you sing a note.")}
          ${p("A beginner's instinct is often to sing louder to sound “stronger” or “better.” But volume and quality aren't the same thing — and pushing for volume is exactly how tension and strain begin.")}
          ${dynamicScale()}
        `)}

        ${chapter("understand", 2, "“Stronger” does not mean “louder at any cost”", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-teal-200 mb-4">“Stronger does not mean louder at any cost.”</p>
            <p class="text-sm text-ink-200">Stronger means singing with a little more energy and breath support, while staying comfortable and in tune. If your pitch rises, your throat tightens, or your breath runs out when you sing stronger, you're pushing — not developing control.</p>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("setup", 3, "Choose your reference note", `
          ${narrow(p("Pick a comfortable note — every exercise below uses it. You can change this any time."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${VirtualPiano.render("bd-piano", { controls: false, keyboard: true, display: true })}
          </div>
          <div class="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
            <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Reference note</span>
            <span class="font-display text-3xl text-ink-50" data-base-note>${N(b)}</span>
          </div>
        `, { wide: true })}

        ${chapter("hear", 4, "Exercise 1 — Hear the three levels", `
          ${narrow(`
            ${p("Listen to the same note played soft, medium and stronger. Notice that the pitch never changes — only the volume.")}
            <div class="flex flex-wrap gap-3 mb-5">
              <button type="button" data-play-level="soft" class="vr-btn">${icon("play", "w-4 h-4")} Soft</button>
              <button type="button" data-play-level="medium" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Medium</button>
              <button type="button" data-play-level="stronger" class="vr-btn">${icon("play", "w-4 h-4")} Stronger</button>
            </div>
          `)}
          ${SelfAssessment.render("bd-hear-assess", { ...HEAR_ASSESS, selected: hear.assess || null })}
        `)}

        ${chapter("levels", 5, "Exercise 2 — Same note, three levels", `
          ${PitchMatchExercise.render("bd-levels", EX.levels())}
        `)}

        ${chapter("gradual", 6, "Exercise 3 — Soft → medium", `
          ${narrow(p("One comfortable note: start soft, and gradually become a little stronger. The change itself should feel smooth, not stepped."))}
          ${VolumeEnvelope.render("ve-up", { seconds: 4, shape: "up", labels: ["soft", "medium"] })}
          <div class="mt-4">${PitchMatchExercise.render("bd-up", EX.softToMedium())}</div>
        `)}

        ${chapter("gradual", 7, "Exercise 4 — Medium → soft", `
          ${narrow(p("The same note, the other way: start at medium, and gradually fade to comfortably soft."))}
          ${VolumeEnvelope.render("ve-down", { seconds: 4, shape: "down", labels: ["medium", "soft"] })}
          <div class="mt-4">${PitchMatchExercise.render("bd-down", EX.mediumToSoft())}</div>
        `)}

        ${chapter("crescendo", 8, "Exercise 5 — A simple crescendo", `
          ${narrow(p("One note, one comfortable breath: soft (p) → a little stronger (mp) → stronger still (mf) → your comfortable strongest (f). Gradual, never sudden."))}
          ${VolumeEnvelope.render("ve-cresc", { seconds: 6, shape: "up", labels: ["p", "mp", "mf", "f"] })}
          <div class="mt-4">${PitchMatchExercise.render("bd-cresc", EX.crescendo())}</div>
        `)}

        ${chapter("crescendo", 9, "Exercise 6 — A simple decrescendo", `
          ${narrow(p("The reverse: your comfortable strongest (f) → (mf) → (mp) → soft (p)."))}
          ${VolumeEnvelope.render("ve-decresc", { seconds: 6, shape: "down", labels: ["f", "mf", "mp", "p"] })}
          <div class="mt-4">${PitchMatchExercise.render("bd-decresc", EX.decrescendo())}</div>
        `)}

        ${chapter("pitch", 10, "Exercise 7 — Dynamics + Pitch Stability", `
          ${narrow(p("Connecting Class 12: sing the same note at medium, then stronger, then soft — the pitch should stay just as steady as when the volume doesn't change."))}
          ${PitchMatchExercise.render("bd-stability", EX.stability())}
          <div class="mt-4" data-bd-stability-viz></div>
        `)}

        ${chapter("transitions", 11, "Exercise 8 — Dynamics + Note Transitions", `
          ${narrow(p("Connecting Class 13: move between notes while the volume changes too. Listen to the demonstration first, then sing your own take."))}
          <div class="grid lg:grid-cols-2 gap-4">
            <div class="flex flex-col gap-3">
              <button type="button" data-play-dyn="up" class="vr-btn self-start">${icon("play", "w-4 h-4")} Hear it with dynamics (up)</button>
              ${PitchMatchExercise.render("bd-transup", TRANS.up())}
            </div>
            <div class="flex flex-col gap-3">
              <button type="button" data-play-dyn="down" class="vr-btn self-start">${icon("play", "w-4 h-4")} Hear it with dynamics (down)</button>
              ${PitchMatchExercise.render("bd-transdown", TRANS.down())}
            </div>
          </div>
        `)}

        ${chapter("rhythm", 12, "Exercise 9 — Dynamics + Rhythm", `
          ${narrow(p("Connecting Class 6: a four-beat pattern on one note — soft, medium, stronger, soft — then the same pattern with the metronome running."))}
          <div data-rhythm-guide-host></div>
          <div class="mt-4">${RecordingCard.render("bd-rhythm", { title: "Sing the pattern in time", hint: "Soft · medium · stronger · soft, one beat each.", maxSeconds: 12, section: false })}</div>
          <div class="mt-4">${SelfAssessment.render("bd-rhythm-assess", { ...RHYTHM_ASSESS, selected: rhythm.assess || null })}</div>
        `)}

        ${chapter("breath", 13, "Exercise 10 — Dynamics + Breath", `
          ${narrow(`
            ${p(`Connecting Class 11: sing the phrase “${BREATH_PHRASE}” on one comfortable breath each time — once at medium, once soft, once a little stronger.`)}
            <div class="flex justify-center my-5"><div class="breathe-circle !w-20 !h-20" data-breath-circle></div></div>
          `)}
          <div class="grid sm:grid-cols-3 gap-3 mb-4">
            ${RecordingCard.render("bd-breath-medium", { title: "Medium", hint: `“${BREATH_PHRASE}”`, maxSeconds: 10, section: false })}
            ${RecordingCard.render("bd-breath-soft", { title: "Soft", hint: `“${BREATH_PHRASE}”`, maxSeconds: 10, section: false })}
            ${RecordingCard.render("bd-breath-stronger", { title: "Stronger", hint: `“${BREATH_PHRASE}”`, maxSeconds: 10, section: false })}
          </div>
          ${SelfAssessment.render("bd-breath-assess", { ...BREATH_ASSESS, selected: breath.assess || null })}
        `)}

        ${chapter("melody", 14, "Exercise 11 — Dynamics in a melody", `
          ${narrow(p("A short pattern (1 → 2 → 3 → 2 → 1), sung two ways: once at a constant medium volume, then again with changing dynamics. Neither version is “better” — this is about volume vs. expression, not louder vs. softer."))}
          ${PitchMatchExercise.render("bd-melody", melodyEx())}
          <div class="mt-4">${SelfAssessment.render("bd-melody-compare", { ...MELODY_COMPARE_ASSESS, selected: melody.compare || null })}</div>
        `)}

        ${chapter("listen", 15, "Exercise 12 — Listen and identify", `
          ${p("Four short examples, each on one note. Listen to how the volume moves, then classify what you heard.")}
          <div class="grid sm:grid-cols-2 gap-4">
            ${Object.entries(IDENTIFY_EXAMPLES).map(([k, ex]) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div class="flex items-center justify-between mb-3">
                  <p class="font-display text-lg text-ink-50">${ex.label}</p>
                  <button type="button" data-play-identify="${k}" class="vr-btn vr-btn-gold">${icon("play", "w-3.5 h-3.5")} Play</button>
                </div>
                ${SelfAssessment.render(`bd-identify-${k}`, { question: "What do you hear?", options: CLASSIFY_OPTIONS, selected: identify[k] || null })}
                <p class="text-xs text-ink-400 mt-2 min-h-[1rem]" data-identify-feedback="${k}">${identify[k] ? (identify[k] === "unsure" ? "That's alright — play it again and listen for whether it got louder, softer, both, or stayed the same." : identify[k] === ex.key ? "That matches what was played." : "Listen again — compare the start and the end of the example.") : ""}</p>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("listen", 16, "Recording comparison", `
          ${p("Pick any two of today's recordings and compare them — there's no automatic scoring, just your own ears.")}
          ${RecordingComparison.render("bd-compare")}
        `)}

        ${chapter("listen", 17, "A note on your microphone", `
          ${narrow(`
            ${p("Keep roughly the same distance from the microphone across all the exercises above — moving closer or further away changes how loud a recording sounds, separately from your actual singing volume.")}
            ${p("Don't shout into the microphone for the “stronger” takes — it can distort the recording, and it isn't necessary. Your microphone picks up normal singing dynamics perfectly well.")}
          `)}
        `)}

        ${chapter("listen", 18, "Common beginner problems", problems())}

        ${chapter("evaluate", 19, "Self-evaluation", `
          ${p("Your own honest read — not a professional assessment.")}
          ${ControlCheck.render("bd-eval", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 20, "Practice timer — Vocal Dynamics", `
          ${p("Short, focused repetitions — not long, loud sessions. A minute or two is plenty.")}
          ${Timer.render("bd-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 21, `Class ${cls.number} Assignment`, `
          ${p("Choose a comfortable note from the exercises above.")}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${RecordingCard.render("bd-assign-1", { title: "Attempt 1 — Medium", hint: "Your natural, comfortable volume.", maxSeconds: 12, section: false })}
            ${RecordingCard.render("bd-assign-2", { title: "Attempt 2 — Soft", hint: "Comfortably quiet, never a whisper.", maxSeconds: 12, section: false })}
            ${RecordingCard.render("bd-assign-3", { title: "Attempt 3 — Stronger", hint: "A little more energy — never shout.", maxSeconds: 12, section: false })}
            ${RecordingCard.render("bd-assign-cresc", { title: "Crescendo", hint: "Soft → medium → stronger → medium, one breath.", maxSeconds: 15, section: false })}
            ${RecordingCard.render("bd-assign-decresc", { title: "Decrescendo", hint: "Stronger → medium → soft, one breath.", maxSeconds: 15, section: false })}
            ${RecordingCard.render("bd-assign-melody", { title: "Melody (1→2→3→2→1)", hint: "Soft → medium → stronger → medium → soft.", maxSeconds: 15, section: false })}
          </div>
          <p class="text-xs text-ink-500 mt-4">Answer the seven questions in Reflection, just below.</p>
        `)}

        ${chapter("reflect", 22, "Reflection", `
          ${p("These are the same seven questions as the assignment above, saved as you type — this is where \"Reflected\" is tracked.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="bd-refl-${i}">${i + 1}. ${q}</label>
                <textarea id="bd-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 23, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-bd", { placeholder: "e.g. Stronger feels tense around the 7th note. Crescendo is easier than decrescendo. Soft disappears if I don't keep breath support." })}
        `)}

        ${chapter("complete", 24, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 25, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- reference note piano ---- */
    const controllers = {};
    const r0 = range();
    own(VirtualPiano.wire(container, "bd-piano", {
      range: { from: r0.from, to: r0.to }, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > r0.to - 2 * STEP) return;
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        Object.values(controllers).forEach((c) => c.refresh());
      },
    }));

    /* ---- Exercise 1: hear the three levels ---- */
    function onPlayLevel(e) {
      const btn = e.target.closest("[data-play-level]");
      if (!btn) return;
      PianoSynth.play(base(), { duration: 1.3, velocity: LEVEL_VELOCITY[btn.dataset.playLevel] });
    }
    container.addEventListener("click", onPlayLevel);
    cleanups.push(() => container.removeEventListener("click", onPlayLevel));

    /* ---- generic self-assess wiring (shared handler, filtered by group id) ---- */
    const assessMap = {
      "bd-hear-assess": (v) => { set("hear", "assess", v); syncCheckpoints(); refreshLive(); },
      "bd-rhythm-assess": (v) => { set("rhythm", "assess", v); syncCheckpoints(); refreshLive(); },
      "bd-breath-assess": (v) => { set("breath", "assess", v); syncCheckpoints(); refreshLive(); },
      "bd-melody-compare": (v) => { set("melody", "compare", v); syncCheckpoints(); refreshLive(); },
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      const idm = /^bd-identify-([a-d])$/.exec(name || "");
      if (idm) {
        group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
        const k = idm[1], v = chip.dataset.assessChoice;
        set("identify", k, v);
        const ex = IDENTIFY_EXAMPLES[k];
        const fb = $(`[data-identify-feedback="${k}"]`);
        if (fb) fb.textContent = v === "unsure" ? "That's alright — play it again and listen for whether it got louder, softer, both, or stayed the same." : v === ex.key ? "That matches what was played." : "Listen again — compare the start and the end of the example.";
        syncCheckpoints(); refreshLive();
        ClassActivity.bump(classId, "selfEvaluations");
        return;
      }
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      assessMap[name](chip.dataset.assessChoice);
      ClassActivity.bump(classId, "selfEvaluations");
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- Exercise 12: play the four identify examples ---- */
    function onPlayIdentify(e) {
      const btn = e.target.closest("[data-play-identify]");
      if (!btn) return;
      const ex = IDENTIFY_EXAMPLES[btn.dataset.playIdentify];
      PianoSynth.playSequence(ex.vel.map((v) => ({ midi: base(), velocity: v })), { duration: 0.55, gap: 0.12 });
    }
    container.addEventListener("click", onPlayIdentify);
    cleanups.push(() => container.removeEventListener("click", onPlayIdentify));

    /* ---- single-note dynamics exercises (shared wiring helper) ---- */
    const EX_DOM_ID = { levels: "bd-levels", stability: "bd-stability", softToMedium: "bd-up", mediumToSoft: "bd-down", crescendo: "bd-cresc", decrescendo: "bd-decresc" };
    function wireEx(key, cfg, getNotes) {
      controllers[key] = own(PitchMatchExercise.wire(container, EX_DOM_ID[key], cfg, {
        classId, exerciseId: key, state: (rec0().answers.exercises || {})[key] || {},
        getNotes, isComplete: cfg.isComplete,
        onState: (s) => { set("exercises", key, s); syncCheckpoints(); refreshLive(); },
        onRecorded: () => ClassActivity.bump(classId, "recordings"),
        onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
      }));
    }
    wireEx("levels", EX.levels(), () => [base()]);
    wireEx("stability", EX.stability(), () => [base()]);
    wireEx("softToMedium", EX.softToMedium(), () => [base()]);
    wireEx("mediumToSoft", EX.mediumToSoft(), () => [base()]);
    wireEx("crescendo", EX.crescendo(), () => [base()]);
    wireEx("decrescendo", EX.decrescendo(), () => [base()]);

    /* ---- Exercises 3-6: the moving volume guide (+ your loudness line over it) ---- */
    const GUIDES = { softToMedium: ["ve-up", 4, "up", ["soft", "medium"]], mediumToSoft: ["ve-down", 4, "down", ["medium", "soft"]], crescendo: ["ve-cresc", 6, "up", ["p", "mp", "mf", "f"]], decrescendo: ["ve-decresc", 6, "down", ["f", "mf", "mp", "p"]] };
    const guides = {};
    Object.entries(GUIDES).forEach(([key, [id, seconds, shape, labels]]) => { guides[key] = own(VolumeEnvelope.wire(container, id, { seconds, shape, labels, getNote: base })); });
    const loudCache = new Map();
    async function loudnessOf(mediaId) {
      if (loudCache.has(mediaId)) return loudCache.get(mediaId);
      let blob = await Media.getBlob(mediaId).catch(() => null);
      if (!blob) { // another device: getUrl downloads it from the account
        const url = await Media.getUrl(mediaId).catch(() => null);
        blob = url ? await fetch(url).then((r) => r.blob()).catch(() => null) : null;
      }
      if (!blob) return null;
      const res = await LoudnessAnalysis.analyze(blob).catch(() => null);
      loudCache.set(mediaId, res);
      return res;
    }
    const painted = {};
    async function paintGuides() {
      for (const key of Object.keys(guides)) {
        const t = exState(rec0(), key).takes.take;
        if (!t || !t.mediaId || painted[key] === t.mediaId) continue;
        const res = await loudnessOf(t.mediaId);
        if (res) { guides[key].setCurve(res.curve); painted[key] = t.mediaId; }
      }
    }
    paintGuides();
    cleanups.push(ClassActivity.onChange((id) => { if (id === classId && container.isConnected) paintGuides(); }));

    /* ---- Exercise 7 visualization (StabilityPanel, reused as-is) ---- */
    const stabPanel = $("[data-bd-stability-viz]");
    if (stabPanel) {
      stabPanel.innerHTML = StabilityPanel.render("sp-stability", { title: "Estimated pitch (stronger take)" });
      own(StabilityPanel.wire(container, "sp-stability", {
        getTake: () => exState(rec0(), "stability").takes.stronger || null,
        chain: false,
        canReveal: () => { const s = exState(rec0(), "stability").takes.stronger; return !!(s && s.assessment); },
        onRevealed: () => { set("viz", "stability", true); refreshLive(); },
      }));
    }

    /* ---- Exercise 8: transitions + dynamics ---- */
    function onPlayDyn(e) {
      const btn = e.target.closest("[data-play-dyn]");
      if (!btn) return;
      const b = base();
      const up = btn.dataset.playDyn === "up";
      const notes = up ? [b, b + STEP, b + 2 * STEP] : [b + 2 * STEP, b + STEP, b];
      const vels = up ? [0.25, 0.55, 0.88] : [0.88, 0.55, 0.25];
      PianoSynth.playSequence(notes.map((m, i) => ({ midi: m, velocity: vels[i] })), { duration: 0.8, gap: 0.22 });
    }
    container.addEventListener("click", onPlayDyn);
    cleanups.push(() => container.removeEventListener("click", onPlayDyn));
    controllers.transUp = own(PitchMatchExercise.wire(container, "bd-transup", TRANS.up(), {
      classId, exerciseId: "transUp", state: (rec0().answers.exercises || {}).transUp || {},
      getNotes: () => [base(), base() + STEP, base() + 2 * STEP], isComplete: TRANS.up().isComplete,
      onState: (s) => { set("exercises", "transUp", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"), onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    controllers.transDown = own(PitchMatchExercise.wire(container, "bd-transdown", TRANS.down(), {
      classId, exerciseId: "transDown", state: (rec0().answers.exercises || {}).transDown || {},
      getNotes: () => [base() + 2 * STEP, base() + STEP, base()], isComplete: TRANS.down().isComplete,
      onState: (s) => { set("exercises", "transDown", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"), onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));

    /* ---- Exercise 9: rhythm + dynamics ---- */
    let rhythmGuide = null;
    function rhythmBars() {
      const b = base();
      return [[{ t: "soft", midi: b, velocity: 0.22 }, { t: "medium", midi: b, velocity: 0.55 }, { t: "stronger", midi: b, velocity: 0.85 }, { t: "soft", midi: b, velocity: 0.22 }]];
    }
    function mountRhythmGuide() {
      const host = $("[data-rhythm-guide-host]");
      if (!host) return;
      if (rhythmGuide) rhythmGuide.destroy();
      const bars = rhythmBars();
      host.innerHTML = BeatGuide.render("bd-bg-rhythm", { bars, guideToggle: true });
      rhythmGuide = BeatGuide.wire(container, "bd-bg-rhythm", { bpm: BPM, loops: 2, bars, getNote: base });
    }
    mountRhythmGuide();
    cleanups.push(() => { if (rhythmGuide) rhythmGuide.destroy(); });
    own(RecordingCard.wire(container, "bd-rhythm", {
      classId, take: A(rec0(), "rhythm").take || null, maxSeconds: 12,
      meta: { name: "Dynamics — rhythm exercise", exercise: "dynamics-rhythm" },
      onSaved: (take) => { set("rhythm", "take", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- Exercise 10: breath + dynamics ---- */
    const bc = $("[data-breath-circle]");
    if (bc) bc.classList.add("is-running");
    ["medium", "soft", "stronger"].forEach((level) => {
      own(RecordingCard.wire(container, `bd-breath-${level}`, {
        classId, take: (A(rec0(), "breath")[level]) || null, maxSeconds: 10,
        meta: { name: `Dynamics + breath — ${level}`, exercise: `dynamics-breath-${level}` },
        onSaved: (take) => { set("breath", level, take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- Exercise 11: dynamics in a melody ---- */
    controllers.melody = own(PitchMatchExercise.wire(container, "bd-melody", melodyEx(), {
      classId, exerciseId: "melody", state: (rec0().answers.exercises || {}).melody || {},
      getNotes: () => [0, 1, 2, 1, 0].map((i) => base() + i * STEP), isComplete: melodyEx().isComplete,
      onState: (s) => { set("exercises", "melody", s); syncCheckpoints(); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));

    /* ---- self-evaluation ---- */
    cleanups.push(ControlCheck.wire(container, "bd-eval", {
      onChange: (k, v) => { set("check", k, v); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- recording comparison ---- */
    own(RecordingComparison.wire(container, "bd-compare", {
      list: () => Store.getClassProgress(classId).uploads.slice().sort((x, y) => (x.date || "").localeCompare(y.date || "")),
      saved: A(rec0(), "compare"),
      onChange: (s) => { set("compare", "a", s.a); set("compare", "b", s.b); set("compare", "changed", s.changed); },
    }));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `${PRACTICE_CATEGORY} logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    own(Timer.wire(container, "bd-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    }));

    /* ---- assignment: 6 recordings ---- */
    own(RecordingCard.wire(container, "bd-assign-1", {
      classId, take: A(rec0(), "assignment").attempt1 || null, maxSeconds: 12,
      meta: { name: "Dynamics assignment — medium", exercise: "dynamics-assign-1" },
      onSaved: (take) => { set("assignment", "attempt1", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bd-assign-2", {
      classId, take: A(rec0(), "assignment").attempt2 || null, maxSeconds: 12,
      meta: { name: "Dynamics assignment — soft", exercise: "dynamics-assign-2" },
      onSaved: (take) => { set("assignment", "attempt2", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bd-assign-3", {
      classId, take: A(rec0(), "assignment").attempt3 || null, maxSeconds: 12,
      meta: { name: "Dynamics assignment — stronger", exercise: "dynamics-assign-3" },
      onSaved: (take) => { set("assignment", "attempt3", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bd-assign-cresc", {
      classId, take: A(rec0(), "assignment").crescendo || null, maxSeconds: 15,
      meta: { name: "Dynamics assignment — crescendo", exercise: "dynamics-assign-cresc" },
      onSaved: (take) => { set("assignment", "crescendo", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bd-assign-decresc", {
      classId, take: A(rec0(), "assignment").decrescendo || null, maxSeconds: 15,
      meta: { name: "Dynamics assignment — decrescendo", exercise: "dynamics-assign-decresc" },
      onSaved: (take) => { set("assignment", "decrescendo", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));
    own(RecordingCard.wire(container, "bd-assign-melody", {
      classId, take: A(rec0(), "assignment").melody || null, maxSeconds: 15,
      meta: { name: "Dynamics assignment — melody", exercise: "dynamics-assign-melody" },
      onSaved: (take) => { set("assignment", "melody", take); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
    }));

    /* ---- reflection, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => { set("reflection", ta.dataset.reflection, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-bd", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(r[0]) ? r[0] : "Stronger does not mean louder at any cost — dynamics is a spectrum, not a score.",
        struggled: r[1] || "",
        toPractice: r[6] || "",
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
