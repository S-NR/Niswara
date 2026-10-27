/* ============================================================
   CLASS 25 — FOUNDATION FINAL ASSESSMENT & PROGRESS RECORDING
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "foundation-final-assessment".

   Core idea: "This is not an audition, an exam to fear, or a test
   of whether you are naturally talented. It is an opportunity to
   listen to yourself, recognize your progress, and understand what
   deserves more practice." Not a certificate of mastery — a
   checkpoint that recommends, but never forces, Path A (more
   Foundation practice) or Path B (begin Level 2).

   Honesty boundaries this file keeps to, matching every earlier
   class: no fabricated pitch/rhythm/diction scoring (no automated
   evaluation exists in this codebase, so none is invented here);
   self-assessment is clearly labelled self-observation, never a
   professional diagnosis; completing a class never auto-marks its
   skill "comfortable" (Step 3's 21-skill review always starts
   blank, regardless of `Store.completedClassIds`); recordings are
   never shared between learners (same private per-user storage
   every class already uses).

   Deliberately NOT built (documented, not half-built): per-take
   renaming and per-take deletion. Neither capability exists
   anywhere else in Niswara today — `Media` (js/media.js) has no
   rename, and only `RecordingCard`'s own "record again" (an
   overwrite, not a delete) exists. The spec gates both on "if the
   existing system supports this" — it doesn't, so this class uses
   the same fixed, descriptive recording names every earlier class
   already uses, and re-recording a slot is the existing "discard
   and redo" affordance. Per-take notes are similarly scoped down to
   the one shared Personal Notes panel every class already has,
   rather than inventing a new per-recording note system.

   Reuses: LessonKit (+ its automatic Warm-up card and
   `WarmupPrompt.beforeRecording`, Class 10's pattern), VirtualPiano
   (Class 3), PitchMatchExercise + SelfAssessment (Class 4),
   RecordingCard + WaveformPlayer (Class 5), ControlCheck (Class 9+,
   with new custom 4-option level sets for the skills review and the
   comparison checklist), the Class 7/11 breathing-circle CSS,
   `ClassActivity.get("L1C10")` for the baseline song recording
   (the same lookup Class 11 already uses), `Store.getState()` /
   `Store.isLevelUnlocked` (unchanged) for the real completed-class
   count and the real Level 2 unlock state.
   ============================================================ */

const FoundationFinalAssessmentLesson = (() => {
  const STAGES = [
    { id: "welcome", label: "Welcome" },
    { id: "prepare", label: "Prepare" },
    { id: "review", label: "Review" },
    { id: "record", label: "Record" },
    { id: "compare", label: "Compare" },
    { id: "assess", label: "Assess" },
    { id: "growth", label: "Growth" },
    { id: "summary", label: "Summary" },
    { id: "next", label: "Next" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Foundation Assessment";

  const PREP_ITEMS = [
    "I have a reasonably quiet environment.",
    "I have a phone or microphone ready to record.",
    "I have water nearby.",
    "I've chosen a familiar, simple song or melody I can sing comfortably.",
  ];

  const SKILLS = [
    ["listening", "Listening awareness and recognizing one's own voice", "Classes 1, 5"],
    ["breathing", "Comfortable breathing without forcing or holding the breath", "Class 2"],
    ["matchingNote", "Matching a reference note", "Class 4"],
    ["listeningBack", "Listening back to a recording", "Class 5"],
    ["rhythm", "Maintaining a steady rhythm", "Class 6"],
    ["warmupRelax", "Gentle vocal warm-up and relaxation", "Classes 7, 8"],
    ["vocalControl", "Basic vocal control", "Class 9"],
    ["phraseControl", "Breath and phrase control", "Class 11"],
    ["pitchStability", "Pitch stability", "Class 12"],
    ["transitions", "Smooth transitions between notes", "Class 13"],
    ["dynamics", "Comfortable dynamic variation", "Class 14"],
    ["diction", "Clear diction and pronunciation", "Class 15"],
    ["shortPhrases", "Singing short phrases", "Class 16"],
    ["connectingPhrases", "Connecting phrases smoothly", "Class 17"],
    ["phrasing", "Musical phrasing and line shape", "Class 18"],
    ["patterns", "Repeating melodic patterns consistently", "Class 19"],
    ["movement", "Moving between notes without forcing the range", "Class 20"],
    ["coordination", "Coordinating longer melodic patterns", "Class 21"],
    ["agility", "Practising simple vocal agility patterns gently", "Class 22"],
    ["register", "Awareness of different vocal registers without forcing them", "Class 23"],
    ["completeSong", "Singing a complete, simple song", "Class 24"],
  ];
  const SKILL_LEVELS = [
    { value: "nottried", mark: "—", label: "Not tried yet" },
    { value: "difficult", mark: "○", label: "Difficult at the moment" },
    { value: "improving", mark: "△", label: "Improving with practice" },
    { value: "comfortable", mark: "✓", label: "Comfortable most of the time" },
  ];
  const SKILL_ROWS = SKILLS.map(([key, label, ref]) => ({ key, area: ref, question: label, levels: SKILL_LEVELS }));

  const COMPARE_LEVELS = [
    { value: "improved", mark: "✓", label: "Improved" },
    { value: "same", mark: "△", label: "About the same" },
    { value: "needs", mark: "○", label: "Needs more practice" },
    { value: "unsure", mark: "?", label: "Not sure yet" },
  ];
  const COMPARE_ROWS = [
    { key: "finishPhrases", area: "Phrases", question: "Do I finish more words and phrases without cutting them short?", levels: COMPARE_LEVELS },
    { key: "breathing", area: "Breath", question: "Is my breathing more comfortable?", levels: COMPARE_LEVELS },
    { key: "pitch", area: "Pitch", question: "Can I hear any improvement in pitch stability?", levels: COMPARE_LEVELS },
    { key: "transitions", area: "Transitions", question: "Are transitions between notes becoming smoother?", levels: COMPARE_LEVELS },
    { key: "words", area: "Words", question: "Are the words easier to understand?", levels: COMPARE_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Can I maintain rhythm more consistently?", levels: COMPARE_LEVELS },
    { key: "relaxed", area: "Comfort", question: "Do I feel more relaxed while singing?", levels: COMPARE_LEVELS },
    { key: "recognize", area: "Awareness", question: "Can I recognize my own improvement more easily?", levels: COMPARE_LEVELS },
  ];

  const ASSESS_LEVELS = [
    { value: "guidance", mark: "—", label: "I need more guidance" },
    { value: "focused", mark: "○", label: "I can do this with focused practice" },
    { value: "comfortable", mark: "△", label: "I can do this comfortably in simple exercises" },
    { value: "ready", mark: "✓", label: "I'm ready to try a slightly more challenging exercise" },
  ];
  const ASSESS_ROWS = [
    { key: "breathPhrase", area: "Breath & phrase", question: "Breathing and phrase completion", levels: ASSESS_LEVELS },
    { key: "pitch", area: "Pitch", question: "Pitch matching and stability", levels: ASSESS_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Rhythm and timing", levels: ASSESS_LEVELS },
    { key: "transitions", area: "Transitions", question: "Smooth transitions", levels: ASSESS_LEVELS },
    { key: "diction", area: "Diction", question: "Diction and clarity", levels: ASSESS_LEVELS },
    { key: "relaxation", area: "Comfort", question: "Relaxation and vocal comfort", levels: ASSESS_LEVELS },
    { key: "completeSong", area: "Song", question: "Ability to complete a simple song", levels: ASSESS_LEVELS },
    { key: "confidence", area: "Confidence", question: "Confidence while listening to a recording", levels: ASSESS_LEVELS },
  ];

  const REVISIT_MAP = [
    ["Breathing and phrases", ["L1C02", "L1C11"]],
    ["Pitch", ["L1C03", "L1C04", "L1C12"]],
    ["Rhythm", ["L1C06"]],
    ["Transitions", ["L1C13"]],
    ["Diction", ["L1C15"]],
    ["Complete-song practice", ["L1C24", "L1C25"]],
  ];

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "warmup", label: "Warm-up completed/skipped" },
    { key: "prepReviewed", label: "Preparation checklist reviewed" },
    { key: "gentlePrepDone", label: "Gentle preparation completed" },
    { key: "skillsReviewed", label: "Foundation skills reviewed" },
    { key: "recordingsCompleted", label: "Final recordings completed" },
    { key: "comparisonCompleted", label: "Compared with Class 10 (or saved as a new reference)" },
    { key: "selfAssessmentCompleted", label: "Personal self-assessment completed" },
    { key: "growthReflectionCompleted", label: "Strengths & growth areas identified" },
    { key: "pathChosen", label: "Next step chosen" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    improvementTarget: { question: "Which one thing will Take 2 focus on?", options: [opt("words", "Clearer words"), opt("pitch", "Steadier pitch"), opt("transitions", "Smoother transitions"), opt("breathing", "More comfortable breathing")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c24 = (ClassActivity.get("L1C24").answers.setup || {}).note;
    if (ok(c24)) return c24;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;

  const COMFORT_CHECK_EX = {
    eyebrow: "A brief, optional check", title: "A comfortable pitch-matching check",
    intro: "Play the note, listen, then sing it back. This is just a gentle check-in, not a test.",
    chain: false, refLabel: "Reference note",
    slots: [{ key: "check", label: "Match the note" }],
    assessment: { question: "Did that feel comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    noEstimate: true,
    isComplete: (s) => !!(s.takes.check && s.takes.check.mediaId),
  };

  function baselineInfo() {
    const c10 = ClassActivity.get("L1C10");
    const songTake = (c10.answers.song || {}).take;
    return { available: !!(c10.checkpoints.baseline && songTake && songTake.mediaId), take: songTake };
  }

  function latestFinalTake(rec) {
    return take(rec, "finalTake3") || take(rec, "finalTake2") || take(rec, "finalTake1");
  }

  function derivedCheckpoints(rec) {
    const out = {};
    out.warmup = true; // the shared Warm-up card (LessonKit.header) is always offered once this class is reachable — never mandatory
    if (PREP_ITEMS.every((_, i) => !!A(rec, "prepCheck")[i])) out.prepReviewed = true;
    if (A(rec, "prepare").ready) out.gentlePrepDone = true;
    if (SKILL_ROWS.every((r) => A(rec, "skills")[r.key])) out.skillsReviewed = true;
    if (take(rec, "finalTake1") && take(rec, "finalTake2")) out.recordingsCompleted = true;
    const baseline = baselineInfo();
    if (baseline.available) { if (COMPARE_ROWS.every((r) => A(rec, "compare")[r.key])) out.comparisonCompleted = true; }
    else if (A(rec, "compare").newReferenceAck) out.comparisonCompleted = true;
    if (ASSESS_ROWS.every((r) => A(rec, "assess")[r.key])) out.selfAssessmentCompleted = true;
    const g = A(rec, "growth");
    if (filled(g.strengths) && filled(g.difficulties) && filled(g.goal) && filled(g.proud)) out.growthReflectionCompleted = true;
    if (q(rec, "recommendedPath")) out.pathChosen = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 60) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: true });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function pathCards(choice) {
    return `<div class="grid sm:grid-cols-2 gap-4" data-path-cards>
      <button type="button" data-path-choice="A" class="text-left rounded-2xl border p-5 transition-colors ${choice === "A" ? "border-gold-400/40 bg-gold-500/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
        <p class="font-display text-xl text-ink-50 mb-2">Path A — Keep strengthening the Foundation</p>
        <p class="text-sm text-ink-400 leading-relaxed mb-3">Choose this if some essential skills still feel uncomfortable, or you'd simply like more repetition. You don't need to restart all 25 classes — revisit the ones that matter most.</p>
        <div class="flex flex-col gap-1.5 text-xs" data-revisit-list>
          ${REVISIT_MAP.map(([label, ids]) => `<div><span class="text-ink-500">${label}:</span> ${ids.map((id) => {
            const c = APP_DATA.CLASSES.find((x) => x.id === id);
            return c ? `<a href="#/classes/${id}" class="text-gold-300 hover:text-gold-200 underline">Class ${c.number}</a>` : "";
          }).join(", ")}</div>`).join("")}
        </div>
      </button>
      <button type="button" data-path-choice="B" class="text-left rounded-2xl border p-5 transition-colors ${choice === "B" ? "border-gold-400/40 bg-gold-500/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
        <p class="font-display text-xl text-ink-50 mb-2">Path B — Begin Level 2</p>
        <p class="text-sm text-ink-400 leading-relaxed mb-3">An invitation to keep learning, not a certificate of mastery. Level 2 builds gradually on the Foundation, and every earlier class stays available for revision.</p>
        <div data-path-b-status></div>
      </button>
    </div>`;
  }

  function pathBStatus() {
    const unlocked = Store.isLevelUnlocked(2);
    if (unlocked) return `<a href="#/classes/L2C01" class="inline-flex items-center gap-2 text-sm text-gold-300 hover:text-gold-200 underline">Open Level 2, Class 1 ${icon("arrowRight", "w-3.5 h-3.5")}</a>`;
    return `<p class="text-xs text-ink-500">Level 2 unlocks once this class is complete.</p>`;
  }

  function summaryPanel(rec) {
    const state = Store.getState();
    const l1Classes = APP_DATA.CLASSES.filter((c) => c.levelId === 1);
    const completed = l1Classes.filter((c) => state.completedClassIds.includes(c.id)).length;
    const bySkill = (level) => SKILL_ROWS.filter((r) => A(rec, "skills")[r.key] === level).map((r) => r.question);
    const comfortable = bySkill("comfortable"), improving = bySkill("improving");
    const needsPractice = SKILL_ROWS.filter((r) => ["difficult", "nottried"].includes(A(rec, "skills")[r.key])).map((r) => r.question);
    const baseline = baselineInfo();
    const final = latestFinalTake(rec);
    const goal = A(rec, "growth").goal;
    const chipList = (items, empty) => items.length
      ? `<div class="flex flex-wrap gap-1.5">${items.map((t) => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/5 text-ink-300">${Utils.escapeHtml(t)}</span>`).join("")}</div>`
      : `<p class="text-xs text-ink-600">${empty}</p>`;
    return `
      <div class="flex flex-col gap-6">
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-3">Recorded progress (from your account)</p>
          <p class="text-sm text-ink-200 mb-1">Classes completed: <strong class="text-ink-50">${completed} of ${l1Classes.length}</strong></p>
          <p class="text-sm text-ink-200 mb-1">Class 10 baseline recording: <strong class="text-ink-50">${baseline.available ? "Available" : "Not available"}</strong></p>
          <p class="text-sm text-ink-200">Today's final recording: <strong class="text-ink-50">${final ? "Saved" : "Not recorded yet"}</strong>${final ? ` <button type="button" data-play-summary-final class="text-xs text-gold-300 hover:text-gold-200 underline ml-2">Play</button>` : ""}</p>
        </div>
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-3">Your self-reported observations (Step 3)</p>
          <div class="flex flex-col gap-4">
            <div><p class="text-xs text-ink-500 mb-2">Comfortable most of the time (${comfortable.length})</p>${chipList(comfortable, "None marked comfortable yet — and that's a perfectly normal place to be.")}</div>
            <div><p class="text-xs text-ink-500 mb-2">Improving with practice (${improving.length})</p>${chipList(improving, "None marked yet.")}</div>
            <div><p class="text-xs text-ink-500 mb-2">Needs more practice (${needsPractice.length})</p>${chipList(needsPractice, "None marked yet.")}</div>
          </div>
        </div>
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Your improvement goal (Step 7)</p>
          <p class="text-sm text-ink-200">${filled(goal) ? Utils.escapeHtml(goal) : "Not written yet — add it in Step 7 above."}</p>
        </div>
      </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Foundation milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">You have completed the Niswara Foundation journey.</p>
        <p class="text-sm text-ink-300 mb-2">Your voice does not need to be perfect for your progress to matter.</p>
        <p class="text-sm text-ink-300 mb-2">Keep your first recording, revisit the skills that need attention, and continue one step at a time.</p>
        <p class="text-sm text-ink-100">The goal is not simply to sing more difficult songs — it's to become a more aware, comfortable, consistent and expressive singer.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["prepReviewed", "gentlePrepDone", "skillsReviewed", "recordingsCompleted", "comparisonCompleted", "growthReflectionCompleted", "pathChosen"].filter((k) => c[k]).length;
    return [
      [`Assessment steps (${ex}/7)`, ex === 7],
      ["Self-evaluation", !!c.selfAssessmentCompleted],
    ];
  }

  function renderComplete(cls, rec, status) {
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");
    if (status === "completed") {
      const warmupUnlocked = Warmup.isUnlocked();
      const level2Unlocked = Store.isLevelUnlocked(2);
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class ${cls.number} complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Review your journey, listen to your progress, and plan your next step.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-6">${lines}</ul>
            <div class="flex flex-wrap justify-center gap-2.5">
              <a href="#/progress" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Review my progress</a>
              <a href="#/classes" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Practise a skill again</a>
              ${warmupUnlocked ? `<a href="#/warmup" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">🎤 Common Warm-up</a>` : ""}
              ${level2Unlocked ? `<a href="#/classes/L2C01" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Explore Level 2 ${icon("arrowRight", "w-3.5 h-3.5")}</a>` : ""}
            </div>
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
    const prepCheck = A(rec, "prepCheck");
    const baseline = baselineInfo();
    const compare = A(rec, "compare");
    const growth = A(rec, "growth");
    const pathChoice = q(rec, "recommendedPath");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("welcome", 1, "Review your journey, listen to your progress, and plan your next step.", `
          ${p("You have reached the final class of the Foundation level.")}
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="text-sm text-ink-200 leading-relaxed">This is not an audition, an exam to fear, or a test of whether you are naturally talented. It is an opportunity to listen to yourself, recognize your progress, and understand what deserves more practice. Your voice is still developing, and that is completely normal.</p>
          </div>
          ${flowStrip(["LISTEN", "RECORD", "COMPARE", "REFLECT", "PLAN"])}
          <p class="text-xs text-ink-500">Background noise, recording equipment and room acoustics can all affect perceived sound quality — try not to confuse poor recording quality with poor singing.</p>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("welcome", 2, "What to prepare", `
          ${narrow(`
            <div class="flex flex-col gap-1 mb-4">
              ${PREP_ITEMS.map((t, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-prepcheck="${i}" ${prepCheck[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${t}</span>
                </label>`).join("")}
            </div>
            <p class="text-xs text-ink-500">${baseline.available ? "Your Class 10 recording is available for comparison in Step 5." : "No Class 10 recording was found — that's completely fine. You can still complete this assessment, and today's recording can become your new reference point."}</p>
          `)}
        `)}

        ${chapter("prepare", 3, "A gentle, optional preparation routine", `
          ${narrow(`
            ${p("Nothing strenuous. No high notes, no held breath, no forced range. Stop if you feel pain, dizziness, unusual breathlessness, or throat discomfort.")}
            <ul class="grid sm:grid-cols-2 gap-1.5 text-sm text-ink-300 my-4">${["Relax your shoulders and jaw.", "Breathe comfortably — nothing forced.", "A gentle hum, within your comfortable range.", "An easy speaking-to-singing transition."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}</ul>
            <div class="breathe-circle mx-auto mb-5" data-breathe-circle></div>
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("ffa-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(baseNote(rec))}</strong></p>`)}
          ${PitchMatchExercise.render("ffa-comfort", COMFORT_CHECK_EX)}
          ${narrow(`
            <div class="mt-5">${Timer.render("ffa-timer", { showLogButton: true })}<p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p></div>
            <div class="text-center mt-6">
              <button type="button" data-ready-btn class="inline-flex items-center gap-2 px-6 py-3 rounded-full ${A(rec, "prepare").ready ? "bg-emerald-500/15 text-emerald-300" : "bg-gold-500 text-ink-950 hover:bg-gold-400"} text-sm font-medium transition-colors">${A(rec, "prepare").ready ? `${icon("check", "w-4 h-4")} Ready` : "I'm ready to begin"}</button>
            </div>
          `)}
        `, { wide: true })}

        ${chapter("review", 4, "Foundation skills review", `
          ${p("How do these feel right now? These are self-observations, not professional vocal diagnoses — and completing a class doesn't automatically mean a skill is mastered.")}
          ${ControlCheck.render("ffa-skills", SKILL_ROWS, A(rec, "skills"))}
        `)}

        ${chapter("record", 5, "Main final recording — choose your song", `
          ${narrow(p("Choose a familiar, simple song or melody that suits your current ability. It doesn't need to be difficult, and it doesn't need a wide vocal range."))}
          ${narrow(WarmupPrompt.beforeRecording("class25", `#/classes/${cls.id}`))}
          ${recCard("finalTake1", "Take 1 — Natural performance", "Sing at a comfortable pitch and volume. Focus on completing the phrase, not perfection — don't restart for every small mistake.", 90)}
        `)}

        ${chapter("record", 6, "Take 2 — Focused improvement", `
          ${narrow(p("Listen back to Take 1, then choose one thing to focus on this time."))}
          ${SelfAssessment.render("improvementTarget-q", { ...Q.improvementTarget, selected: q(rec, "improvementTarget") })}
          <div class="mt-4">${recCard("finalTake2", "Take 2 — Focused improvement", "Record again, focusing on just the one target above.", 90)}</div>
        `)}

        ${chapter("record", 7, "Take 3 — Optional final take", `
          ${narrow(p("More takes aren't necessarily better. Stop after one or two takes if you're comfortable — this one is entirely optional."))}
          ${recCard("finalTake3", "Take 3 — Optional", "", 90)}
        `)}

        ${chapter("compare", 8, "Compare with Class 10", baseline.available ? `
          ${narrow(p("Listen to your Class 10 recording, then your newest take, and answer honestly."))}
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="text-sm text-ink-100 mb-2">Class 10 — your starting point</p><div data-baseline-player-host></div></div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="text-sm text-ink-100 mb-2">Today's recording</p><div data-current-player-host></div></div>
          </div>
          ${ControlCheck.render("ffa-compare", COMPARE_ROWS, compare)}
        ` : `
          ${narrow(`
            <p class="text-sm text-ink-300 leading-relaxed mb-4">No Class 10 recording was found for comparison — that's normal, especially if you joined partway through, or chose not to save one. It doesn't affect this assessment.</p>
            <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03] bg-white/[0.02] border border-white/5">
              <input type="checkbox" data-new-reference ${compare.newReferenceAck ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
              <span class="text-sm text-ink-200">Save today's recording as my new reference point for future comparisons.</span>
            </label>
          `)}
        `)}

        ${chapter("assess", 9, "Personal assessment", `
          ${p("Your own honest read — not a ranking against anyone else, and not a verdict on natural talent.")}
          ${ControlCheck.render("ffa-assess", ASSESS_ROWS, A(rec, "assess"))}
        `)}

        ${chapter("growth", 10, "Strengths and growth areas", `
          ${narrow(`
            <p class="text-xs text-ink-500 mb-5">Examples only — not facts about you. “I can finish more phrases,” “I can match a note more consistently,” “I still struggle with smooth high-to-low transitions,” “I need to practise clear pronunciation.”</p>
            <div class="flex flex-col gap-5">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="ffa-strengths">Three things I can do better now</label><textarea id="ffa-strengths" data-growth="strengths" rows="3" class="field" placeholder="A few short examples…">${Utils.escapeHtml(growth.strengths || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="ffa-difficulties">Two things I still find difficult</label><textarea id="ffa-difficulties" data-growth="difficulties" rows="2" class="field" placeholder="A few short examples…">${Utils.escapeHtml(growth.difficulties || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="ffa-goal">My most important next improvement goal</label><textarea id="ffa-goal" data-growth="goal" rows="2" class="field" placeholder="One goal, in your own words…">${Utils.escapeHtml(growth.goal || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="ffa-proud">One thing I am proud of in my singing journey</label><textarea id="ffa-proud" data-growth="proud" rows="2" class="field" placeholder="Anything, however small…">${Utils.escapeHtml(growth.proud || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("summary", 11, "Your Foundation progress summary", summaryPanel(rec), { wide: true })}

        ${chapter("next", 12, "Recommended next step", `
          ${narrow(p("Based on what you just reviewed, choose whichever path feels right — this is your decision, not an automatic placement."))}
          ${pathCards(pathChoice)}
        `, { wide: true })}

        ${chapter("complete", 13, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-ffa", { placeholder: "e.g. How today's recording felt compared to Class 10... What I noticed listening back... My plan for next week..." })}
        `)}

        ${chapter("complete", 14, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 15, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
        const already = !!rec.checkpoints[k];
        if (v !== already) ClassActivity.markCheckpoint(classId, k, v);
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- Step 2: prep checklist ---- */
    function onPrepCheck(e) {
      const cb = e.target.closest("[data-prepcheck]");
      if (!cb) return;
      set("prepCheck", cb.dataset.prepcheck, cb.checked);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("change", onPrepCheck);
    cleanups.push(() => container.removeEventListener("change", onPrepCheck));

    /* ---- Step 3: breathing circle, piano, comfort check, timer, ready button ---- */
    const breatheCircle = $("[data-breathe-circle]");
    if (breatheCircle) breatheCircle.classList.add("is-running");

    own(VirtualPiano.wire(container, "ffa-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); exComfort.refresh(); },
    }));
    const exComfort = own(PitchMatchExercise.wire(container, "ffa-comfort", COMFORT_CHECK_EX, {
      classId, exerciseId: "comfort", state: (rec0().answers.exercises || {}).comfort || {},
      getNotes: () => [base()], isComplete: COMFORT_CHECK_EX.isComplete,
      onState: (s) => { set("exercises", "comfort", s); refreshLive(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "ffa-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}.`;
        refreshLive();
      },
    }));
    function onReady(e) {
      if (!e.target.closest("[data-ready-btn]")) return;
      set("prepare", "ready", true);
      syncCheckpoints(); refreshLive();
      const btn = $("[data-ready-btn]");
      if (btn) { btn.innerHTML = `${icon("check", "w-4 h-4")} Ready`; btn.classList.add("bg-emerald-500/15", "text-emerald-300"); btn.classList.remove("bg-gold-500", "text-ink-950", "hover:bg-gold-400"); }
    }
    container.addEventListener("click", onReady);
    cleanups.push(() => container.removeEventListener("click", onReady));

    /* ---- Step 4: skills review ---- */
    cleanups.push(ControlCheck.wire(container, "ffa-skills", { onChange: (k, v) => { set("skills", k, v); syncCheckpoints(); refreshLive(); } }));

    /* ---- Step 5-7: recordings + improvement-target chip ---- */
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (name !== "improvementTarget-q" || group.closest("[data-pm]")) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", "improvementTarget", chip.dataset.assessChoice);
      refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    const NAMES = { finalTake1: "Final assessment — Take 1 (natural)", finalTake2: "Final assessment — Take 2 (focused improvement)", finalTake3: "Final assessment — Take 3 (optional)" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: 90,
        meta: { name: `Class 25 — ${NAMES[k]}`, exercise: `assessment-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints();
          mountComparePlayers();
          refreshLive();
        },
      }));
    });

    /* ---- Step 8: baseline comparison players ---- */
    let baselinePlayer = null, currentPlayer = null;
    function mountComparePlayers() {
      const baseline = baselineInfo();
      if (!baseline.available) return;
      const bHost = $("[data-baseline-player-host]"), cHost = $("[data-current-player-host]");
      if (!bHost || !cHost) return;
      if (baselinePlayer) { baselinePlayer.destroy(); baselinePlayer = null; }
      if (currentPlayer) { currentPlayer.destroy(); currentPlayer = null; }
      bHost.innerHTML = WaveformPlayer.render("ffa-baseline-wf", { section: false });
      baselinePlayer = WaveformPlayer.wire(bHost, "ffa-baseline-wf", { mediaId: baseline.take.mediaId });
      const current = latestFinalTake(rec0());
      if (current) {
        cHost.innerHTML = WaveformPlayer.render("ffa-current-wf", { section: false });
        currentPlayer = WaveformPlayer.wire(cHost, "ffa-current-wf", { mediaId: current.mediaId });
      } else {
        cHost.innerHTML = `<p class="text-sm text-ink-500">Record Take 1 above, then come back here to compare.</p>`;
      }
    }
    mountComparePlayers();
    cleanups.push(ControlCheck.wire(container, "ffa-compare", { onChange: (k, v) => { set("compare", k, v); syncCheckpoints(); refreshLive(); } }));
    function onNewReference(e) {
      const cb = e.target.closest("[data-new-reference]");
      if (!cb) return;
      set("compare", "newReferenceAck", cb.checked);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("change", onNewReference);
    cleanups.push(() => container.removeEventListener("change", onNewReference));

    /* ---- Step 9: self-assessment ---- */
    cleanups.push(ControlCheck.wire(container, "ffa-assess", { onChange: (k, v) => { set("assess", k, v); syncCheckpoints(); refreshLive(); } }));

    /* ---- Step 10: growth reflection ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => { set("growth", key, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- Step 11: summary (play-final shortcut) ---- */
    function onPlaySummaryFinal(e) {
      if (!e.target.closest("[data-play-summary-final]")) return;
      const t = latestFinalTake(rec0());
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlaySummaryFinal);
    cleanups.push(() => container.removeEventListener("click", onPlaySummaryFinal));

    /* ---- Step 12: path choice ---- */
    function onPathChoice(e) {
      const btn = e.target.closest("[data-path-choice]");
      if (!btn) return;
      set("q", "recommendedPath", btn.dataset.pathChoice);
      container.querySelectorAll("[data-path-choice]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("border-gold-400/40", on); b.classList.toggle("bg-gold-500/[0.06]", on);
        b.classList.toggle("border-white/10", !on); b.classList.toggle("bg-white/[0.02]", !on);
      });
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onPathChoice);
    cleanups.push(() => container.removeEventListener("click", onPathChoice));
    const pathBHost = $("[data-path-b-status]");
    if (pathBHost) pathBHost.innerHTML = pathBStatus();

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-ffa", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "My voice doesn't need to be perfect for my progress to matter. I can keep revisiting skills that need attention, one step at a time.",
        struggled: A(rec, "growth").difficulties || "",
        toPractice: A(rec, "growth").goal || "",
        thoughts: filled(A(rec, "growth").proud) ? `Proud of: ${A(rec, "growth").proud.trim()}` : "",
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
      if (baselinePlayer) baselinePlayer.destroy();
      if (currentPlayer) currentPlayer.destroy();
      PianoSynth.stopAll();
      VoiceRecorder.stopPlayback();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
