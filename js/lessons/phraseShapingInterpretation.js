/* ============================================================
   LEVEL 2, CLASS 16 — PHRASE SHAPING AND MUSICAL INTERPRETATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "phrase-shaping-interpretation".

   Curriculum identity: Level 2, Class 16 (`number: 16`, `levelId: 2`
   in data.js, id `L2C16`). Same mechanism Classes 1-15 already
   proved fifteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Applying Vocal Skills to a Song" during Class 15's turn), so
   nothing needed renaming or adding to bring Class 16 itself onto
   the page.

   **Level 2's class count grows a twelfth time.** This spec's own
   "Next class preview" names the real Class 17 as "Vocal Agility
   Development." Since an entry already existed in `levelClassDefs[2]`
   from Class 15's turn, this is a plain rename in place, the same
   precedent every class since 5 has followed (apart from Class 11's
   one-off addition).

   Core idea: "A musical phrase is a group of notes that forms a
   musical thought... Individual notes are important, but their
   connection gives the phrase meaning." Builds directly on Class 15
   (explicitly asked to review it in Section 1) rather than
   introducing a new unrelated phrase.

   Per the spec's own Part B instruction ("use a short original
   practice melody or an EXISTING SUITABLE PRACTICE PHRASE in
   Niswara... reuse it"), this file reuses Class 15's own "Soft
   Morning" phrase — "The morning light is soft and new." — as its
   single working phrase, rather than inventing a third original
   melody. Lesson modules don't share JS constants across files (the
   established pattern throughout Level 2 is file-local constants,
   cross-referencing only via `ClassActivity.get(id)` lookups), so
   the phrase's text and scale-degree melody are redefined locally
   here, matching Class 15's `song1` values exactly.

   Honesty boundaries, matching every earlier class: no fabricated
   phrase-analysis or emotion-detection (none exists in this
   codebase); completion never depends on a perfect musical
   interpretation, singing a complete song, recording, identifying
   every musical highlight correctly, or completing optional
   repetitions (the spec says this explicitly).

   Like Classes 11-15, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" is phrased
   as negative constraints), so this file self-authors a 5-item
   plain-checkbox checklist from the lesson's own Parts A-H, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the click-and-rerender card/chip
   pattern (Class 14, extended here to word and breath-point chips),
   the multi-part-in-one-take pattern (Class 2), and
   `singingCompleteSong.js`'s (Level 1, Class 24) / Class 15's
   `degreesToNotes` melody pattern. Part H reuses Part C's and Part
   F's own recordings for its "listen and compare" section (the
   spec's own "one natural version, one shaped version" maps directly
   onto Part F's Attempt 1 and Attempt 2) rather than asking for new
   ones — the ninth Level 2 class in a row (after 7-15) to
   substantially reuse its final optional-recording section.
   ============================================================ */

const PhraseShapingInterpretationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "speak", label: "Speak" },
    { id: "word", label: "Key Word" },
    { id: "shape", label: "Shape" },
    { id: "practice", label: "Practice" },
    { id: "breathing", label: "Breathing" },
    { id: "review", label: "Review" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_DEGREE = 3;

  // Same phrase as Class 15's "Soft Morning" option — reused per the spec's
  // own "use an existing suitable practice phrase in Niswara" instruction.
  const PHRASE = {
    text: "The morning light is soft and new.",
    words: ["The", "morning", "light", "is", "soft", "and", "new"],
    degrees: [0, 1, 2, 1, 0, 2, 3],
  };

  const STAGE_CARDS = [
    { key: "beginning", label: "Beginning", bullets: ["Start comfortably.", "Avoid attacking the first note harshly.", "Establish the feeling of the phrase."] },
    { key: "development", label: "Development", bullets: ["Let the phrase move naturally.", "A gentle change in intensity, if appropriate.", "Give attention to the important word or note."] },
    { key: "ending", label: "Ending", bullets: ["Allow the phrase to settle naturally.", "Avoid abruptly cutting off the final sound.", "Never force a long ending note."] },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what a musical phrase is." },
    { key: "identifiedWord", label: "I identified an important word in the phrase, or chose not to." },
    { key: "triedShaping", label: "I tried singing the phrase naturally and with shaping, or chose to skip." },
    { key: "noticedBreathing", label: "I noticed a comfortable breathing point." },
    { key: "reflectionRecorded", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    melodyMoves: { question: "How does the melody move?", options: [opt("up", "Mostly up"), opt("down", "Mostly down"), opt("both", "Up and down"), opt("repeats", "Mostly repeats")] },
    feelsComplete: { question: "Where does the phrase feel complete?", options: [opt("end", "At the very end", "good"), opt("middle", "Somewhere in the middle"), opt("unsure", "Not sure yet")] },
    moreConnected: { question: "Did the shaped version feel more connected?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    wordNoticeable: { question: "Was the important word noticeable?", options: [opt("yes", "Yes", "good"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    naturalEnding: { question: "Did the phrase have a natural ending?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    feltGenuine: { question: "Did the expression feel genuine?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    breathedComfortably: { question: "Did I breathe comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_DEGREE * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_DEGREE * STEP, fallback));
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
  const skipBtn = (k, label = "Skip this attempt") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function wordsHtml(rec) {
    const chosen = q(rec, "importantWord");
    const chosenWord = chosen != null ? PHRASE.words[chosen] : null;
    return `
    <div class="flex flex-wrap gap-2">
      ${PHRASE.words.map((w, i) => `<button type="button" data-word-choice="${i}" class="px-3 py-1.5 rounded-full border text-sm transition-colors ${String(chosen) === String(i) ? "border-gold-400/60 bg-gold-500/15 text-gold-200" : "border-white/10 bg-white/[0.02] text-ink-200 hover:bg-white/[0.05]"}">${w}</button>`).join("")}
    </div>
    <p class="text-xs text-ink-500 mt-4">${chosenWord ? `You chose "${chosenWord}."` : "Nothing chosen yet — that's fine too."}</p>`;
  }

  function breathPointHtml(rec) {
    const chosen = q(rec, "breathPoint");
    const opts = PHRASE.words.slice(0, -1).map((w, i) => ({ i, label: `After “${w}”` }));
    return `<div class="flex flex-wrap gap-2">
      ${opts.map((o) => `<button type="button" data-breath-choice="${o.i}" class="px-3 py-1.5 rounded-full border text-xs transition-colors ${String(chosen) === String(o.i) ? "border-teal-400/50 bg-teal-500/15 text-teal-200" : "border-white/10 bg-white/[0.02] text-ink-300 hover:bg-white/[0.05]"}">${o.label}</button>`).join("")}
    </div>`;
  }

  function stageCardsHtml() {
    return `<div class="grid sm:grid-cols-3 gap-3 my-4">
      ${STAGE_CARDS.map((s) => `
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p class="font-display text-base text-ink-50 mb-2">${s.label}</p>
        <ul class="flex flex-col gap-1.5 text-xs text-ink-400">${s.bullets.map((b) => `<li class="flex gap-1.5"><span class="text-gold-400">•</span>${b}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>`;
  }

  function reviewHtml(rec) {
    const sources = [
      ["speakTake", "Speaking: natural, then with feeling"],
      ["attempt1Take", "Attempt 1 — natural phrase"], ["attempt2Take", "Attempt 2 — shaped phrase"], ["attempt3Take", "Attempt 3 — personal interpretation"],
    ];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the speaking or singing attempts above — then come back here to listen and compare.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 16 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">A phrase is a thought, not a list of notes.</p>
        <p class="text-sm text-ink-300">Beginning, development, and ending — connected naturally, never forced.</p>
        <p class="text-sm text-ink-100">Musical interpretation can differ between singers while still respecting the same melody.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 17 — Vocal Agility Development</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will shift focus toward quicker, more agile vocal movement, building on the phrasing and control practiced so far.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A phrase shaped with a natural beginning, development, and ending.</h3>
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

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Part A — Understand musical phrases", `
          ${narrow(`
            ${p("A musical phrase is a group of notes that forms a musical thought — similar to a sentence in speaking. Individual notes matter, but their connection is what gives the phrase meaning.")}
            ${p("A phrase usually has a natural beginning, development, and ending, with breathing happening at sensible musical points.")}
          `)}
          ${flowStrip(["BEGINNING", "DEVELOPMENT", "ENDING"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Part B — Listen to a phrase", `
          ${narrow(p(`This class reuses the “Soft Morning” phrase from Class 15: “${PHRASE.text}”. Choose a comfortable reference note below, then listen without singing — notice where the phrase begins, how the melody moves, and where it feels complete.`))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("psi-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-5">
            <button type="button" data-play-phrase class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the phrase</button>
          </div>
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("melodyMoves-q", { ...Q.melodyMoves, selected: sel("melodyMoves") })}
              ${SelfAssessment.render("feelsComplete-q", { ...Q.feelsComplete, selected: sel("feelsComplete") })}
            </div>
            <p class="text-xs text-ink-500 mt-4">Notice, too, whether the phrase has a natural pause afterward.</p>
          `)}
        `, { wide: true })}

        ${chapter("speak", 3, "Part C — Speak the phrase naturally", `
          ${narrow(`
            ${p(`Read “${PHRASE.text}” naturally as a spoken sentence, then again with the feeling you'd like it to carry. Notice which word feels important, where your voice naturally rises or falls, and where a comfortable breath would occur. Natural speech like this can help develop musical phrasing.`)}
          `)}
          ${recCard("speakTake", "Natural, then with your intended feeling", "One take covering both is fine.", 15)}
        `)}

        ${chapter("word", 4, "Part D — Identify the important word", `
          ${narrow(`
            ${p("Which word carries the meaning? Which note feels like the emotional highlight? Where does the phrase seem to build, and where should it gently settle? Tap the word that feels most important to you — there's no single correct answer, and no music theory required.")}
          `)}
          <div data-word-host>${wordsHtml(rec)}</div>
        `)}

        ${chapter("shape", 5, "Part E — Shape the beginning, middle, and ending", `
          ${narrow(p("Three simple stages to keep in mind — not a strict formula, just a gentle shape."))}
          ${stageCardsHtml()}
        `)}

        ${chapter("practice", 6, "Part F — Practice phrase shaping", `
          ${narrow(p("Three attempts at the same phrase — skip any of them, or repeat only when comfortable. Keep the melody and basic rhythm consistent; let the interpretation vary naturally."))}
          <div class="flex flex-col gap-5">
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 1 — Natural phrase</p>
              <p class="text-xs text-ink-500 mb-2">Comfortable intensity, no deliberately added expression.</p>
              ${recCard("attempt1Take", "Attempt 1", "", 15)}
              <div class="mt-2">${skipBtn("attempt1")}</div>
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 2 — Shaped phrase</p>
              <p class="text-xs text-ink-500 mb-2">Begin gently, give the important word slightly more attention, let the phrase settle naturally.</p>
              ${recCard("attempt2Take", "Attempt 2", "", 15)}
              <div class="mt-2">${skipBtn("attempt2")}</div>
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 3 — Personal interpretation</p>
              <p class="text-xs text-ink-500 mb-2">Sing with whatever feeling you'd like to communicate — no dramatic changes required.</p>
              ${recCard("attempt3Take", "Attempt 3", "", 15)}
              <div class="mt-2">${skipBtn("attempt3")}</div>
            </div>
          </div>
        `)}

        ${chapter("breathing", 7, "Part G — Understand breathing and phrase continuity", `
          ${narrow(`
            ${p("A phrase shouldn't be broken unnecessarily — breathing should be comfortable and planned around natural musical boundaries. Never hold your breath or force the end of a phrase; it's completely acceptable to divide a longer phrase into smaller practice sections, the same approach Class 15 introduced.")}
            ${p("Tap where a comfortable breath would fit in this phrase:")}
          `)}
          <div data-breath-host>${breathPointHtml(rec)}</div>
        `)}

        ${chapter("review", 8, "Part H — Listen and compare", `
          ${narrow(p("Listen back to your natural version and your shaped version and compare them. If you'd rather not record, the questions below work just as well as a self-reflection — simply answer from memory."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("moreConnected-q", { ...Q.moreConnected, selected: sel("moreConnected") })}
              ${SelfAssessment.render("wordNoticeable-q", { ...Q.wordNoticeable, selected: sel("wordNoticeable") })}
              ${SelfAssessment.render("naturalEnding-q", { ...Q.naturalEnding, selected: sel("naturalEnding") })}
              ${SelfAssessment.render("feltGenuine-q", { ...Q.feltGenuine, selected: sel("feltGenuine") })}
              ${SelfAssessment.render("breathedComfortably-q", { ...Q.breathedComfortably, selected: sel("breathedComfortably") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-psi", { placeholder: "e.g. Which attempt felt most connected... How I chose the important word... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on a perfect musical interpretation, singing a complete song, a recording, identifying every musical highlight correctly, or completing optional repetitions.")}
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

    /* ---- Part B: piano + phrase playback ---- */
    own(VirtualPiano.wire(container, "psi-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_DEGREE * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note up to ${N(RANGE.to - MAX_DEGREE * STEP)} so the whole phrase stays comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));
    function onPlayPhrase() { PianoSynth.playSequence(degreesToNotes(base(), PHRASE.degrees), { duration: 0.5, gap: 0.15 }); }
    container.querySelectorAll("[data-play-phrase]").forEach((btn) => btn.addEventListener("click", onPlayPhrase));
    cleanups.push(() => container.querySelectorAll("[data-play-phrase]").forEach((btn) => btn.removeEventListener("click", onPlayPhrase)));

    /* ---- Part D: important-word chips ---- */
    function onWordChoice(e) {
      const btn = e.target.closest("[data-word-choice]");
      if (!btn) return;
      set("q", "importantWord", btn.dataset.wordChoice);
      const host = btn.closest("[data-word-host]");
      if (host) host.innerHTML = wordsHtml(rec0());
    }
    container.addEventListener("click", onWordChoice);
    cleanups.push(() => container.removeEventListener("click", onWordChoice));

    /* ---- Part G: breath-point chips ---- */
    function onBreathChoice(e) {
      const btn = e.target.closest("[data-breath-choice]");
      if (!btn) return;
      set("q", "breathPoint", btn.dataset.breathChoice);
      const host = btn.closest("[data-breath-host]");
      if (host) host.innerHTML = breathPointHtml(rec0());
    }
    container.addEventListener("click", onBreathChoice);
    cleanups.push(() => container.removeEventListener("click", onBreathChoice));

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
    const NAMES = {
      speakTake: "Speaking: natural, then with feeling", attempt1Take: "Attempt 1 — natural phrase", attempt2Take: "Attempt 2 — shaped phrase", attempt3Take: "Attempt 3 — personal interpretation",
    };
    const MAX_SECONDS = { speakTake: 15, attempt1Take: 15, attempt2Take: 15, attempt3Take: 15 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 16 — ${NAMES[k]}`, exercise: `phrase-shaping-interpretation-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Part H: play-to-review ---- */
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
      "melodyMoves-q": "melodyMoves", "feelsComplete-q": "feelsComplete",
      "moreConnected-q": "moreConnected", "wordNoticeable-q": "wordNoticeable", "naturalEnding-q": "naturalEnding", "feltGenuine-q": "feltGenuine", "breathedComfortably-q": "breathedComfortably",
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
    own(PersonalNotes.wire(container, "notes-psi", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const wordIdx = q(rec, "importantWord");
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "A phrase is a musical thought, not a list of separate notes and words — beginning, development, and ending connect naturally, never forced.",
        struggled: q(rec, "naturalEnding") && q(rec, "naturalEnding") !== "yes" ? "The phrase's ending didn't feel fully natural yet." : "",
        toPractice: wordIdx != null ? `Continue shaping around the word "${PHRASE.words[wordIdx]}."` : "",
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
