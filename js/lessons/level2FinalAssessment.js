/* ============================================================
   LEVEL 2, CLASS 25 — LEVEL 2 FINAL ASSESSMENT & PROGRESS
   RECORDING (interactive lesson)

   Rendered by ClassDetailPage for interactive: "level2-final-assessment".

   Curriculum identity: Level 2, Class 25 (`number: 25`, `levelId: 2`
   in data.js, id `L2C25`). Same mechanism Classes 1-24 already
   proved twenty-four times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Performance Preparation" during Class 24's turn), so nothing
   needed renaming or adding to bring Class 25 itself onto the page.

   This spec's own Section 6 previews a possible "Level 3 — Song
   Mastery & Performance Development" as text only — explicitly "do
   not create Level 3 classes." `levelClassDefs[3]` already exists
   with a DIFFERENT planned title ("Music Theory Basics" and
   siblings), set up before this session and unrelated to this
   preview. Nothing in `APP_DATA.LEVELS`/`levelClassDefs[3]` is
   touched here — the preview is shown as plain motivational text on
   the completion screen only, not a claim about what Level 3 will
   actually contain. Flagged to the user rather than silently
   reconciling the two.

   Because completing a class requires the previous class in the same
   level to already be complete, reaching THIS class's own completion
   means every one of Level 2's 25 classes is done — so the
   celebratory "Level 2 complete" screen is shown unconditionally on
   completion here, not behind a separate, possibly-false check.
   (`Store.isLevelUnlocked(3)` — "would Level 3 unlock" — is still
   used to confirm this honestly rather than assumed.)

   Section 5's "Final Progress Recording" gets its own, genuinely new
   `RecordingCard` (`finalTake`) — the first new recording slot since
   Class 21, and deliberately NOT a hand-off like Classes 23-24's
   complete-song recording, since this one is its own distinct
   Level 2 milestone, not the same "sing this one song" moment.
   "Compare with an earlier recording, if available" reuses Level 1's
   own `foundationFinalAssessment.js` baseline-comparison pattern
   exactly (`WaveformPlayer`, side-by-side, no automated analysis) —
   the "earlier recording" here is Level 1's own final assessment
   take (`L1C25`), the most meaningful before/after pair across the
   whole singing journey so far, not a weaker in-level comparison.

   Section 4's practice song reuses "ಓ ನನ್ನ ಚೇತನ" (`window.SONGS[0]`)
   a fourth time (Classes 23, 24, now 25) via `SongLessonKit`'s
   exported pure functions — the same real engine, never a
   reimplementation.

   Honesty boundaries, matching every earlier class and this spec's
   own instructions: no automatic audio comparison, pitch analysis,
   vocal-quality score, or professional-certification claim — the
   12-skill self-assessment (Section 4 of the spec) uses three
   neutral-toned options ("Still practising" / "Becoming comfortable"
   / "Feels comfortable") with no colour-coding implying one is
   better, exactly because the spec says not to make this a harsh
   pass/fail examination.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth
   (Level 1 Class 24 / Classes 15-24) for every technique-review and
   song reference, `SongLessonKit`'s exported functions (Classes 23-24)
   for the practice song, `RecordingCard` + `WaveformPlayer` (Class 5 /
   Level 1 Class 25's baseline-comparison pattern) for the final
   recording and its comparison, `SelfAssessment` (Class 4),
   `PersonalNotes`, `ClassProgress`.
   ============================================================ */

const Level2FinalAssessmentLesson = (() => {
  const STAGES = [
    { id: "journey", label: "Journey" },
    { id: "prepare", label: "Prepare" },
    { id: "review", label: "Review" },
    { id: "song", label: "Song" },
    { id: "record", label: "Record" },
    { id: "compare", label: "Compare" },
    { id: "reflect", label: "Reflect" },
    { id: "skills", label: "Skills" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2;
  const SONG_HREF = "#/songs/oo-nanna-chetana";
  const SONG = window.SONGS && window.SONGS[0];

  // Section 1's own recap list — the real 24 preceding classes, not a summary of
  // them invented for this lesson.
  const JOURNEY = [
    "Voice Placement", "Resonance", "Chest Voice Foundations", "Head Voice Foundations",
    "Connecting Chest & Head Voice", "Introduction to Mixed Coordination", "Vowel Modification Foundations",
    "Resonance and Tone Colour", "Projection Without Pushing", "Register Transitions and Vocal Continuity",
    "Controlled Range Development", "Sustained Notes and Stability", "Vocal Dynamics and Control",
    "Expressive Singing Foundations", "Applying Vocal Skills to a Song", "Phrase Shaping and Musical Interpretation",
    "Vocal Agility Development", "Register Coordination Practice", "Tone Consistency Across Range",
    "Articulation and Style", "Vocal Endurance Foundations", "Personal Vocal Style",
    "Song Practice Workshop", "Performance Preparation",
  ];

  // Section 3's "small selection" of exercises — each a brief reference demo, not a
  // graded test; `build(base)` returns the exact PianoSynth.playSequence notes.
  const TECHNIQUE_REVIEW = [
    { key: "placement", label: "Voice placement & resonance", hint: "A comfortable hum, then a gentle vowel.", build: (b) => [{ midi: b, duration: 1.4, velocity: 0.4 }] },
    { key: "register", label: "Register coordination", hint: "A small, gentle movement to a nearby note and back.", build: (b) => [0, 1, 0].map((d) => ({ midi: b + d * STEP, duration: 0.55, velocity: 0.42 })) },
    { key: "pitch", label: "Pitch stability", hint: "Matching and holding one comfortable note.", build: (b) => [{ midi: b, duration: 2, velocity: 0.4 }] },
    { key: "dynamics", label: "Vocal control & dynamics", hint: "Gently changing volume without pushing.", build: (b) => [{ midi: b, duration: 0.8, velocity: 0.22 }, { midi: b, duration: 0.8, velocity: 0.6 }] },
    { key: "articulation", label: "Articulation", hint: "Clear syllables while sustaining the vowel.", build: (b) => [0, 0, 0].map((d) => ({ midi: b + d * STEP, duration: 0.35, velocity: 0.42 })) },
    { key: "agility", label: "Agility", hint: "A slow, simple melodic pattern.", build: (b) => [0, 1, 2, 1, 0].map((d) => ({ midi: b + d * STEP, duration: 0.45, velocity: 0.42 })) },
    { key: "expression", label: "Musical expression", hint: "A short phrase with natural phrasing.", build: (b) => [0, 1, 2, 1, 0].map((d, i) => ({ midi: b + d * STEP, duration: 0.6, velocity: 0.34 + i * 0.05 })) },
  ];

  const SKILLS = [
    { key: "breathing", label: "Comfortable breathing" },
    { key: "pitchMatching", label: "Pitch matching and stability" },
    { key: "resonance", label: "Resonance awareness" },
    { key: "transitions", label: "Comfortable register transitions" },
    { key: "sustainedNotes", label: "Sustained notes" },
    { key: "dynamics", label: "Vocal dynamics" },
    { key: "articulation", label: "Articulation and clarity" },
    { key: "rhythm", label: "Rhythm and timing" },
    { key: "phrasing", label: "Musical phrasing" },
    { key: "expression", label: "Expressive singing" },
    { key: "songPractice", label: "Song practice" },
    { key: "performancePrep", label: "Performance preparation" },
  ];
  const SKILL_OPTIONS = [
    opt("still", "Still practising"), opt("becoming", "Becoming comfortable"), opt("comfortable", "Feels comfortable"),
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand that progress is gradual, and not equally noticeable in every skill." },
    { key: "triedReview", label: "I tried at least part of the technique review, or chose to skip it." },
    { key: "triedSong", label: "I practised at least one phrase of the song, or chose to skip it." },
    { key: "triedSkillsCheck", label: "I looked at the final skills self-assessment, or chose not to." },
    { key: "reflected", label: "I reflected on my Level 2 journey, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  function opt(value, label, tone = "neutral") { return { value, label, tone }; }
  const Q = {
    pitchMoreStable: { question: "Is the pitch more stable?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    transitionsComfortable: { question: "Are transitions more comfortable?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    wordsClearer: { question: "Are the words clearer?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    rhythmConsistent: { question: "Is the rhythm more consistent?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    toneComfortable: { question: "Can I maintain a comfortable tone?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    expressMoreNaturally: { question: "Do I express the melody more naturally?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    moreConfident: { question: "Do I feel more confident practising a complete song?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n + MAX_UP * STEP <= RANGE.to && n - STEP >= RANGE.from;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C24", "L2C22", "L2C21", "L2C20", "L2C19", "L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from + STEP, Math.min(RANGE.to - MAX_UP * STEP, fallback));
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skillAnswer = (rec, k) => A(rec, "skills")[k] || null;
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /** The most meaningful "earlier recording" for a Level 2 final assessment: Level
   *  1's own final assessment take (L1C25) — the start of this singing journey,
   *  compared with where it stands now. Mirrors foundationFinalAssessment.js's own
   *  `latestFinalTake` exactly. */
  function baselineInfo() {
    const l1 = ClassActivity.get("L1C25");
    const recs = l1.answers.recs || {};
    const t = recs.finalTake3 || recs.finalTake2 || recs.finalTake1;
    return { available: !!(t && t.mediaId), take: t };
  }

  function level2Stats() {
    const classes = APP_DATA.CLASSES.filter((c) => c.levelId === 2);
    const done = classes.filter((c) => Store.classStatus(c) === "completed").length;
    return { done, total: classes.length, allDone: Store.isLevelUnlocked(3) };
  }

  const flowStrip = (steps) => `<div class="flex flex-wrap items-center gap-2 my-3">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Congratulations! You've completed Niswara Level 2! 🎉</p>
        <p class="text-sm text-ink-300 leading-relaxed max-w-xl mx-auto">You started by exploring your voice and gradually learned about resonance, vocal coordination, expression, song practice, and performance preparation.</p>
        <p class="text-sm text-ink-300 leading-relaxed max-w-xl mx-auto mt-2">Your journey does not end here. Every practice session is another opportunity to understand and develop your voice.</p>
        <p class="text-sm text-ink-100 mt-2">Be proud of the progress you've made!</p>
      </div>`;
  }

  function level3PreviewHtml() {
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">A possible next stage: Level 3 — Song Mastery &amp; Performance Development</p>
        <p class="text-xs text-ink-500 mb-3">Shown as a preview only — none of this exists in Niswara yet.</p>
        <ul class="flex flex-col gap-1 text-sm text-ink-300">
          ${["Advanced song interpretation", "Raga and melody exploration", "Advanced vocal coordination", "Singing different musical styles", "Detailed song analysis", "Live performance practice", "Microphone technique", "Recording and studio singing foundations"].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
        </ul>
      </div>`;
  }

  function renderComplete(cls, rec, status) {
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = PROGRESS_ITEMS.map((i) => `
      <li class="flex items-center gap-2.5 text-sm ${rec.checkpoints[i.key] ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${rec.checkpoints[i.key] ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${rec.checkpoints[i.key] ? icon("check", "w-3 h-3") : ""}</span>${i.label}
      </li>`).join("");
    if (status === "completed") {
      const stats = level2Stats();
      const finalTake = take(rec, "finalTake");
      const growth = A(rec, "growth");
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Level 2: Singer</h3>
            <div class="grid sm:grid-cols-3 gap-3 text-left mb-5">
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Level 2 status</p>
                <p class="text-sm text-ink-100">${stats.allDone ? "Complete" : "In progress"} — ${stats.done} of ${stats.total} classes</p>
              </div>
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Final progress recording</p>
                <p class="text-sm text-ink-100">${finalTake ? `Saved (${finalTake.seconds || "?"}s)` : "Not recorded — that's okay"}</p>
              </div>
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Personal reflection</p>
                <p class="text-sm text-ink-100">${growth.improvement || growth.goal ? "Saved" : "Not filled in — that's okay"}</p>
              </div>
            </div>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            <div class="flex flex-wrap justify-center gap-3 mt-6">
              <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">${icon("share", "w-4 h-4")} Share your completion card</a>
              <a href="#/classes" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Back to Classes</a>
            </div>
            ${level3PreviewHtml()}
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
            Complete Level 2 ${icon("check", "w-4 h-4")}
          </button>
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
    const sel = (k) => q(rec, k);
    const c = checklist(rec);
    const growth = A(rec, "growth");
    const baseline = baselineInfo();
    const finalTake = take(rec, "finalTake");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("journey", 1, "Section 1 — Look back at your journey", `
          ${narrow(p("Level 2 has covered a lot of ground — here's a quick recap, not 24 separate lessons to revisit:"))}
          <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-300 mb-2">
            ${JOURNEY.map((title, i) => `<p><span class="text-ink-600">Class ${i + 1}:</span> ${title}</p>`).join("")}
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `, { wide: true })}

        ${chapter("prepare", 2, "Section 2 — Gentle vocal preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your shoulders, neck, and jaw.", "Breathe naturally and comfortably.", "Hum gently.", "Sing a few comfortable notes.", "Practise a familiar short phrase."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("Skip or shorten any of this if you're feeling tired today.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3 mt-4">
            ${VirtualPiano.render("l2c25-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300">Your comfortable note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
        `, { wide: true })}

        ${chapter("review", 3, "Section 3 — Technique review", `
          ${narrow(p("A small selection of exercises, each brief — not an advanced test of any one of them."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${TECHNIQUE_REVIEW.map((t) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p class="text-sm text-ink-100 font-display mb-1">${t.label}</p>
                <p class="text-xs text-ink-500 mb-3">${t.hint}</p>
                <button type="button" data-play-technique="${t.key}" class="vr-btn !text-xs">${icon("play", "w-3.5 h-3.5")} Listen</button>
              </div>`).join("")}
          </div>
        `, { wide: true })}

        ${chapter("song", 4, "Section 4 — Practical singing assessment", `
          ${narrow(p("The same practice song from Classes 23 and 24. Listen, practise a phrase or two, then try the complete song — focusing on comfortable tone, pitch, rhythm, clarity, and expression, not a perfect take."))}
          ${SONG ? `<div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-flow-bpm="60" class="ex-chip !text-sm !py-2 !px-4 is-selected">Slow</button>
            <button type="button" data-flow-bpm="90" class="ex-chip !text-sm !py-2 !px-4">Normal</button>
          </div>
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-scope="0:0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} First phrase</button>
            <button type="button" data-play-scope="0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line 1</button>
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Complete song</button>
          </div>
          <div class="flex flex-wrap gap-3">${openLink(`Open "${SONG.titleTransliteration}" for full practice`)}</div>` : ""}
        `, { wide: true })}

        ${chapter("record", 5, "Section 5 — Final progress recording", `
          ${narrow(p("The most important part of this class. Record a complete attempt — a familiar exercise or the practice song — at a comfortable pace. This becomes your Level 2 final progress recording."))}
          ${RecordingCard.render("rc-finalTake", { title: "Level 2 final progress recording", hint: "Entirely optional, but this is the one this class is built around.", maxSeconds: 60, section: false })}
          ${baseline.available ? `
            ${narrow(p("A Level 1 final-assessment recording is available — listen to both, side by side, whenever you're ready."))}
            <div class="grid sm:grid-cols-2 gap-4 mt-2">
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="text-sm text-ink-100 mb-2">Level 1 — where you started</p><div data-baseline-player-host></div></div>
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4"><p class="text-sm text-ink-100 mb-2">Today — Level 2 final recording</p><div data-current-player-host>${!finalTake ? `<p class="text-xs text-ink-500">Record above first.</p>` : ""}</div></div>
            </div>
          ` : narrow(p("No Level 1 final-assessment recording was found — that's completely fine. Today's recording simply becomes a new milestone to look back on later."))}
        `, { wide: true })}

        ${chapter("compare", 6, "Section 6 — Compare your progress", `
          ${narrow(`
            ${p("Listening to an earlier recording next to today's, a few things worth noticing:")}
            <div class="flex flex-col gap-4 mt-2">
              ${SelfAssessment.render("pitchMoreStable-q", { ...Q.pitchMoreStable, selected: sel("pitchMoreStable") })}
              ${SelfAssessment.render("transitionsComfortable-q", { ...Q.transitionsComfortable, selected: sel("transitionsComfortable") })}
              ${SelfAssessment.render("wordsClearer-q", { ...Q.wordsClearer, selected: sel("wordsClearer") })}
              ${SelfAssessment.render("rhythmConsistent-q", { ...Q.rhythmConsistent, selected: sel("rhythmConsistent") })}
              ${SelfAssessment.render("toneComfortable-q", { ...Q.toneComfortable, selected: sel("toneComfortable") })}
              ${SelfAssessment.render("expressMoreNaturally-q", { ...Q.expressMoreNaturally, selected: sel("expressMoreNaturally") })}
              ${SelfAssessment.render("moreConfident-q", { ...Q.moreConfident, selected: sel("moreConfident") })}
            </div>
            ${p("Progress is often gradual, and may show up more clearly in some skills than others — that's completely normal.")}
          `)}
        `)}

        ${chapter("reflect", 7, "Section 7 — Personal reflection", `
          ${narrow(`
            <div class="flex flex-col gap-3">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c25-improvement">My biggest improvement:</label><textarea id="l2c25-improvement" data-growth="improvement" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.improvement || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c25-enjoy">The technique I enjoy most:</label><textarea id="l2c25-enjoy" data-growth="enjoy" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.enjoy || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c25-difficult">The technique I still find difficult:</label><textarea id="l2c25-difficult" data-growth="difficult" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.difficult || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c25-confident">What I feel more confident about:</label><textarea id="l2c25-confident" data-growth="confident" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.confident || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c25-goal">My next singing goal:</label><textarea id="l2c25-goal" data-growth="goal" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.goal || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("skills", 8, "Final assessment checklist", `
          ${narrow(p("A gentle self-assessment, not an exam — there's no pass or fail here, and no single option is “better” than another."))}
          <div class="flex flex-col gap-3">
            ${SKILLS.map((s) => `
              <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p class="text-sm text-ink-100 mb-2">${s.label}</p>
                <div class="flex flex-wrap gap-2" data-skill="${s.key}">
                  ${SKILL_OPTIONS.map((o) => `<button type="button" data-skill-choice="${o.value}" class="ex-chip !text-xs ${skillAnswer(rec, s.key) === o.value ? "is-selected" : ""}">${o.label}</button>`).join("")}
                </div>
              </div>`).join("")}
          </div>
        `, { wide: true })}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c25", { placeholder: "e.g. How Level 2 felt overall... What surprised me... What I want Level 3 to cover..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: this is a progress assessment, not a professional examination — there's no numerical score and no certification implied. Rest and hydrate well, don't push for a particular duration or a flawless recording, and stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
          `)}
        `)}

        ${chapter("complete", 11, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 12, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function openLink(label) {
    return `<a href="${SONG_HREF}" class="vr-btn vr-btn-gold">${icon("arrowRight", "w-4 h-4")} ${label}</a>`;
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

    /* ---- Section 2: piano ---- */
    own(VirtualPiano.wire(container, "l2c25-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to || midi - STEP < RANGE.from) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - MAX_UP * STEP)} so the review patterns stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

    /* ---- Section 3: technique review playback ---- */
    function onPlayTechnique(e) {
      const btn = e.target.closest("[data-play-technique]");
      if (!btn) return;
      const t = TECHNIQUE_REVIEW.find((x) => x.key === btn.dataset.playTechnique);
      if (t) PianoSynth.playSequence(t.build(base()), { gap: 0.2 });
    }
    container.addEventListener("click", onPlayTechnique);
    cleanups.push(() => container.removeEventListener("click", onPlayTechnique));

    /* ---- Section 4: song reference playback, with a simple Slow/Normal tempo pair ---- */
    if (SONG) {
      let songBpm = 60;
      function onSongControl(e) {
        const bpmBtn = e.target.closest("[data-flow-bpm]");
        if (bpmBtn) {
          songBpm = Number(bpmBtn.dataset.flowBpm);
          container.querySelectorAll("[data-flow-bpm]").forEach((b) => b.classList.toggle("is-selected", b === bpmBtn));
          return;
        }
        const btn = e.target.closest("[data-play-scope]");
        if (!btn) return;
        const raw = btn.dataset.playScope;
        let scope = raw;
        if (raw !== "both" && raw.includes(":")) {
          const [line, phrase] = raw.split(":").map(Number);
          scope = { line, phrase };
        } else if (raw !== "both") {
          scope = Number(raw);
        }
        const plan = SongLessonKit.songPlaybackPlan(SONG, scope);
        PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, 60 / songBpm), { gap: 0 });
      }
      container.addEventListener("click", onSongControl);
      cleanups.push(() => container.removeEventListener("click", onSongControl));
    }

    /* ---- Section 5: final recording + baseline comparison ---- */
    function reviewFinalTake() {
      const host = $("[data-current-player-host]");
      const rec = rec0();
      const t = take(rec, "finalTake");
      if (!host) return;
      if (!t) { host.innerHTML = `<p class="text-xs text-ink-500">Record above first.</p>`; return; }
      host.innerHTML = WaveformPlayer.render("l2c25-current-wf", { section: false });
      own(WaveformPlayer.wire(host, "l2c25-current-wf", { mediaId: t.mediaId }));
    }
    own(RecordingCard.wire(container, "rc-finalTake", {
      classId, take: take(rec0(), "finalTake"), maxSeconds: 60,
      meta: { name: "Level 2, Class 25 — Final progress recording", exercise: "level2-final-assessment-finalTake" },
      onSaved: (t) => { set("recs", "finalTake", t); ClassActivity.bump(classId, "recordings"); reviewFinalTake(); refreshLive(); },
    }));
    const baseline = baselineInfo();
    if (baseline.available) {
      const bHost = $("[data-baseline-player-host]");
      if (bHost) { bHost.innerHTML = WaveformPlayer.render("l2c25-baseline-wf", { section: false }); own(WaveformPlayer.wire(bHost, "l2c25-baseline-wf", { mediaId: baseline.take.mediaId })); }
      reviewFinalTake();
    }

    /* ---- Section 8: 12-skill self-assessment ---- */
    function onSkillChoice(e) {
      const btn = e.target.closest("[data-skill-choice]");
      if (!btn) return;
      const group = btn.closest("[data-skill]");
      if (!group) return;
      set("skills", group.dataset.skill, btn.dataset.skillChoice);
      group.querySelectorAll("[data-skill-choice]").forEach((b) => b.classList.toggle("is-selected", b === btn));
    }
    container.addEventListener("click", onSkillChoice);
    cleanups.push(() => container.removeEventListener("click", onSkillChoice));

    /* ---- generic self-assess dispatcher (Section 6) ---- */
    const assessMap = {
      "pitchMoreStable-q": "pitchMoreStable", "transitionsComfortable-q": "transitionsComfortable", "wordsClearer-q": "wordsClearer",
      "rhythmConsistent-q": "rhythmConsistent", "toneComfortable-q": "toneComfortable", "expressMoreNaturally-q": "expressMoreNaturally", "moreConfident-q": "moreConfident",
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

    /* ---- reflection textareas ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => { set("growth", key, v); refreshLive(); }, 500);
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
    own(PersonalNotes.wire(container, "notes-l2c25", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Level 2 complete — progress across resonance, coordination, expression, song practice, and performance preparation is gradual, and shows up differently across different skills.",
        struggled: A(rec, "growth").difficult || "",
        toPractice: A(rec, "growth").goal || "",
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
