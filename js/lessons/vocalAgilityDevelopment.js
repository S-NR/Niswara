/* ============================================================
   LEVEL 2, CLASS 17 — VOCAL AGILITY DEVELOPMENT (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "vocal-agility-development".

   Curriculum identity: Level 2, Class 17 (`number: 17`, `levelId: 2`
   in data.js, id `L2C17`). Same mechanism Classes 1-16 already
   proved sixteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Phrase Shaping and Musical Interpretation" during Class 16's
   turn), so nothing needed renaming or adding to bring Class 17
   itself onto the page.

   **Level 2's class count grows a thirteenth time.** This spec's own
   "Next class preview" names the real Class 18 as "Register
   Coordination Practice." Since an entry already existed in
   `levelClassDefs[2]` from Class 16's turn, this is a plain rename
   in place, the same precedent every class since 5 has followed
   (apart from Class 11's one-off addition).

   Note: Level 1 already has its own, differently-titled "Vocal
   Agility Foundations" at Class 22 (`js/lessons/vocalAgility.js`,
   const `vocalAgilityClass`). This Level 2 class covers similar
   ground at a gentler pace and is a deliberately distinct const,
   `vocalAgilityDevelopmentClass` — no name collision, no shared
   state, same as every other Level-1/Level-2 title that happens to
   rhyme (e.g. both levels have a "Class 10").

   Core idea: "Vocal agility is not about singing fast. It is about
   moving between notes comfortably and accurately... A smooth and
   accurate slow pattern is more useful than a fast, unclear one."
   Explicitly progressive: two notes, then three, then an optional
   five — never pushing toward speed.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection or vocal-agility scoring (none exists in this
   codebase); completion never depends on the five-note pattern, a
   particular speed, perfect pitch accuracy, recording, or completing
   optional repetitions (the spec says this explicitly).

   Like Classes 11-16, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" is phrased
   as negative constraints), so this file self-authors a 5-item
   plain-checkbox checklist from the lesson's own Parts A-H, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   First class since Class 11/23 to need a genuinely BIDIRECTIONAL
   range clamp again — Part C explicitly asks for both an ascending
   AND a descending two-note movement from the same starting note,
   so `baseNote()` and the piano's `onNote` handler both verify room
   below (for the two-note descent) and room above (for the optional
   five-note pattern's furthest degree), reusing Class 11's corrected
   hint-element pattern exactly (not its original broken draft).

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the `degreesToNotes` melody pattern
   (Level 1 Class 24 / Classes 15-16), the per-item recording layout
   (Classes 7, 8, 13, 15), and skip buttons for optional exercises
   (Classes 9-16). Part G reuses Parts C/D's own recordings for its
   "listen and compare" section rather than asking for a new one —
   the tenth Level 2 class in a row (after 7-16) to substantially
   reuse its final optional-recording section.
   ============================================================ */

const VocalAgilityDevelopmentLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "twoNote", label: "Two Notes" },
    { id: "threeNote", label: "Three Notes" },
    { id: "fiveNote", label: "Five Notes" },
    { id: "smoothness", label: "Smoothness" },
    { id: "record", label: "Record" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 4;

  const PATTERNS = {
    twoUp: [0, 1, 0],
    twoDown: [0, -1, 0],
    three: [0, 1, 2, 1, 0],
    five: [0, 1, 2, 3, 4, 3, 2, 1, 0],
  };

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal agility means." },
    { key: "triedTwoNote", label: "I tried the two-note movement, ascending and/or descending." },
    { key: "triedThreeNote", label: "I tried the three-note pattern, or chose to skip it." },
    { key: "keptItSlow", label: "I kept the pattern slow and comfortable rather than rushing." },
    { key: "reflectionRecorded", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    heardEachNote: { question: "Could I hear each note clearly?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    movedSmoothly: { question: "Did I move between notes smoothly?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    rushed: { question: "Did I rush?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    throatRelaxed: { question: "Did my throat remain relaxed?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    easierSecondTime: { question: "Was the pattern easier the second time?", options: [opt("yes", "Yes", "good"), opt("similar", "About the same"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    easiestPattern: { question: "Which pattern felt easiest?", options: [opt("two", "Two notes"), opt("three", "Three notes"), opt("five", "Five notes"), opt("unsure", "Not sure")] },
    direction: { question: "Was ascending or descending easier?", options: [opt("ascending", "Ascending"), opt("descending", "Descending"), opt("similar", "About the same"), opt("unsure", "Not sure")] },
    temptedFaster: { question: "Did I feel tempted to sing faster?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    remainedComfortable: { question: "Did I remain comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n - STEP >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const l2c16 = (ClassActivity.get("L2C16").answers.setup || {}).note;
    if (ok(l2c16)) return l2c16;
    const l2c15 = (ClassActivity.get("L2C15").answers.setup || {}).note;
    if (ok(l2c15)) return l2c15;
    const l2c14 = (ClassActivity.get("L2C14").answers.setup || {}).note;
    if (ok(l2c14)) return l2c14;
    const l2c13 = (ClassActivity.get("L2C13").answers.setup || {}).note;
    if (ok(l2c13)) return l2c13;
    const l2c12 = (ClassActivity.get("L2C12").answers.setup || {}).note;
    if (ok(l2c12)) return l2c12;
    const l2c11 = (ClassActivity.get("L2C11").answers.setup || {}).note;
    if (ok(l2c11)) return l2c11;
    const l2c10 = (ClassActivity.get("L2C10").answers.setup || {}).note;
    if (ok(l2c10)) return l2c10;
    const l2c9 = (ClassActivity.get("L2C09").answers.setup || {}).note;
    if (ok(l2c9)) return l2c9;
    const l2c8 = (ClassActivity.get("L2C08").answers.setup || {}).note;
    if (ok(l2c8)) return l2c8;
    const l2c7 = (ClassActivity.get("L2C07").answers.setup || {}).note;
    if (ok(l2c7)) return l2c7;
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
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function reviewHtml(rec) {
    const sources = [["twoUpTake", "Two notes, ascending"], ["twoDownTake", "Two notes, descending"], ["threeTake", "Three-note pattern"], ["fiveTake", "Five-note pattern"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the two-note, three-note, or five-note attempts above — then come back here to listen and compare.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 17 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Smooth and slow beats fast and unclear.</p>
        <p class="text-sm text-ink-300">Agility is about moving between notes comfortably and accurately — speed comes later, once coordination feels easy.</p>
        <p class="text-sm text-ink-100">A two-note movement, practised comfortably, is already real progress.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 18 — Register Coordination Practice</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will build on today's note-to-note movement, coordinating smoother transitions between registers.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Simple, slow movements between nearby notes — the start of vocal agility.</h3>
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
    const c = checklist(rec);
    const growth = A(rec, "growth");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Part A — Understand vocal agility", `
          ${narrow(`
            ${p("Vocal agility is the ability to move between notes with flexibility and control — it helps with melodic patterns, runs, and quick note changes. Agility begins with simple, slow movements; speed comes later, once coordination improves.")}
            ${p("A smooth and accurate slow pattern is far more useful than a fast, unclear one.")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-2">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Ascending:</strong> moving from lower notes to higher notes.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Descending:</strong> moving from higher notes to lower notes.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Melodic pattern:</strong> a small group of notes arranged in a sequence.</li>
            </ul>
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your jaw, shoulders, and neck.", "Breathe normally.", "Make a gentle hum, if comfortable.", "Sing one comfortable note.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
        `)}

        ${chapter("twoNote", 3, "Part C — Two-note movement", `
          ${narrow(p("Choose a comfortable starting note below. Sing it, move to the nearby higher note, then return — repeat slowly if comfortable. Then try the same movement going down to a nearby lower note. Focus on hearing the difference between the notes, moving without pushing, and keeping both notes comfortable and relaxed."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vad-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-ink-200 mb-2">Ascending</p>
              <button type="button" data-play-pattern="twoUp" class="vr-btn vr-btn-gold mb-3">${icon("play", "w-4 h-4")} Listen</button>
              ${recCard("twoUpTake", "Two notes, ascending", "", 10)}
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-2">Descending</p>
              <button type="button" data-play-pattern="twoDown" class="vr-btn vr-btn-gold mb-3">${icon("play", "w-4 h-4")} Listen</button>
              ${recCard("twoDownTake", "Two notes, descending", "", 10)}
            </div>
          </div>
        `, { wide: true })}

        ${chapter("threeNote", 4, "Part D — Three-note patterns", `
          ${narrow(p("A simple three-note pattern — 1 → 2 → 3 → 2 → 1, where the numbers are relative positions in your own comfortable range, not fixed notes. Listen first, sing it slowly, pause, and repeat only if comfortable. Listen again afterward and notice whether the movement feels smoother."))}
          ${flowStrip(["1", "2", "3", "2", "1"])}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="three" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
          </div>
          ${recCard("threeTake", "Three-note pattern", "", 12)}
        `)}

        ${chapter("fiveNote", 5, "Part E — A gentle five-note pattern (optional)", `
          ${narrow(p("Only once the three-note pattern feels familiar: 1 → 2 → 3 → 4 → 5 → 4 → 3 → 2 → 1, kept slow and within a comfortable range. Listen first, sing one note at a time, pause between attempts, and return to the starting note comfortably. You can complete this lesson without this exercise at all."))}
          ${flowStrip(["1", "2", "3", "4", "5", "4", "3", "2", "1"])}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="five" class="vr-btn">${icon("play", "w-4 h-4")} Listen</button>
          </div>
          ${recCard("fiveTake", "Five-note pattern", "Entirely optional.", 16)}
          ${narrow(`<div class="mt-3">${skipBtn("five")}</div>`)}
        `)}

        ${chapter("smoothness", 6, "Part F — Smoothness before speed", `
          ${narrow(`
            ${p("Agility develops in stages:")}
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Learn the note sequence.", "Sing slowly and accurately.", "Make the transitions smoother.", "Repeat comfortably.", "Increase speed only when the pattern is already easy."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("There's no automatic speed increase and no target tempo here — slow, comfortable practice is successful practice.")}
            <button type="button" data-play-pattern="three" class="vr-btn mt-2">${icon("play", "w-4 h-4")} Play the three-note pattern again, slowly</button>
          `)}
        `)}

        ${chapter("record", 7, "Part G — Listen and compare", `
          ${narrow(p("Listen back to any of your recordings above and compare them. If you'd rather not record, the questions below work just as well as a self-reflection — simply answer from memory."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("heardEachNote-q", { ...Q.heardEachNote, selected: sel("heardEachNote") })}
              ${SelfAssessment.render("movedSmoothly-q", { ...Q.movedSmoothly, selected: sel("movedSmoothly") })}
              ${SelfAssessment.render("rushed-q", { ...Q.rushed, selected: sel("rushed") })}
              ${SelfAssessment.render("throatRelaxed-q", { ...Q.throatRelaxed, selected: sel("throatRelaxed") })}
              ${SelfAssessment.render("easierSecondTime-q", { ...Q.easierSecondTime, selected: sel("easierSecondTime") })}
            </div>
          `)}
        `)}

        ${chapter("reflect", 8, "Part H — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("easiestPattern-q", { ...Q.easiestPattern, selected: sel("easiestPattern") })}
              ${SelfAssessment.render("direction-q", { ...Q.direction, selected: sel("direction") })}
              ${SelfAssessment.render("temptedFaster-q", { ...Q.temptedFaster, selected: sel("temptedFaster") })}
              ${SelfAssessment.render("remainedComfortable-q", { ...Q.remainedComfortable, selected: sel("remainedComfortable") })}
            </div>
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="vad-transition">Which transition needs more practice?</label><textarea id="vad-transition" data-growth="transition" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.transition || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vad", { placeholder: "e.g. Which pattern felt most natural... Whether ascending or descending was easier... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on the five-note pattern, a particular speed, perfect pitch accuracy, a recording, or completing optional repetitions.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 11, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 12, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Part C: piano + pattern playback ---- */
    own(VirtualPiano.wire(container, "vad-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi - STEP < RANGE.from || midi + MAX_UP * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - MAX_UP * STEP)} so every pattern stays comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const degrees = PATTERNS[btn.dataset.playPattern];
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.65, gap: 0.25 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

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

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = { twoUpTake: "Two notes, ascending", twoDownTake: "Two notes, descending", threeTake: "Three-note pattern", fiveTake: "Five-note pattern" };
    const MAX_SECONDS = { twoUpTake: 10, twoDownTake: 10, threeTake: 12, fiveTake: 16 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 17 — ${NAMES[k]}`, exercise: `vocal-agility-development-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Part G: play-to-review ---- */
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
      "heardEachNote-q": "heardEachNote", "movedSmoothly-q": "movedSmoothly", "rushed-q": "rushed", "throatRelaxed-q": "throatRelaxed", "easierSecondTime-q": "easierSecondTime",
      "easiestPattern-q": "easiestPattern", "direction-q": "direction", "temptedFaster-q": "temptedFaster", "remainedComfortable-q": "remainedComfortable",
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
    own(PersonalNotes.wire(container, "notes-vad", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vocal agility is about moving between notes comfortably and accurately, not about singing fast — a smooth, slow pattern is more useful than a fast, unclear one.",
        struggled: q(rec, "rushed") && q(rec, "rushed") !== "no" ? "Noticed some rushing while moving between notes." : "",
        toPractice: A(rec, "growth").transition || "",
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
