/* ============================================================
   LEVEL 2, CLASS 20 — ARTICULATION AND STYLE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "articulation-and-style".

   Curriculum identity: Level 2, Class 20 (`number: 20`, `levelId: 2`
   in data.js, id `L2C20`). Same mechanism Classes 1-19 already
   proved nineteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Tone Consistency Across Range" during Class 19's turn), so
   nothing needed renaming or adding to bring Class 20 itself onto
   the page.

   This spec's own "Next class preview" names the real Class 21 as
   "Vocal Endurance Foundations" — `levelClassDefs[2]` is renamed in
   place again, the same precedent every class since 5 has followed.

   Core idea: articulation is making sung words understandable
   without interrupting the melody — vowels carry the sustained
   sound, consonants help the listener recognise the word, and a
   consonant should never cut off or interrupt the vowel it's
   attached to. Style is introduced only as natural musical choices
   (connected vs. gently separated notes, natural word emphasis,
   smooth phrasing) — explicitly never imitation of another singer
   or accent correction.

   Honesty boundaries, matching every earlier class: no automatic
   pronunciation scoring or speech-recognition (the spec explicitly
   forbids building one — none exists in this codebase); completion
   never depends on perfect pronunciation, accent, speed, or
   recording quality (the spec says this explicitly).

   This spec gives its Section 5 (self-review) as six literal
   first-person QUESTIONS, not checkbox self-attestations — these
   become six `SelfAssessment` chip questions (Class 4's pattern),
   kept separate from the completion checklist itself. "Completion
   criteria" is a negative-constraints paragraph again, so this file
   self-authors its own 5-item plain-checkbox checklist, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   The short original practice phrase ("I will sing this phrase with
   ease.") is new, plain, beginner-friendly text written for this
   lesson — not quoted from anywhere — matching the same convention
   Class 10's `SENTENCE` ("I am exploring my voice today.") already
   set.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth's
   relative-degree pattern playback (Level 1 Class 24 / Classes
   15-19) for every reference example, RecordingCard (Class 5) for
   the one phrase recording, SelfAssessment (Class 4), PersonalNotes,
   ClassProgress.
   ============================================================ */

const ArticulationAndStyleLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "syllables", label: "Syllables" },
    { id: "words", label: "Across Notes" },
    { id: "phrase", label: "Phrase" },
    { id: "style", label: "Style" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2;

  const SYLLABLES = ["Ma", "Na", "La", "Da", "Ta"];
  const SENTENCE = "I will sing this phrase with ease.";
  const PATTERNS = {
    nearby: [0, 1, 0, -1, 0],
    phrase: [0, 1, 2, 1, 0],
    connected: [0, 1, 2, 1, 0],
  };

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what articulation means while singing." },
    { key: "triedSyllables", label: "I practised the syllables on a comfortable note, or chose to skip it." },
    { key: "triedWords", label: "I tried keeping words clear across nearby notes, or chose to skip it." },
    { key: "triedPhrase", label: "I tried the simple phrase, or chose to skip it." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    wordsUnderstandable: { question: "Were my words understandable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    vowelSteady: { question: "Did I keep the vowel sound steady?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    jawRelaxed: { question: "Was my jaw relaxed?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    noInterruption: { question: "Did I avoid interrupting the melody?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    phraseNatural: { question: "Did the phrase sound natural?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    comfortableTone: { question: "Did I maintain a comfortable tone?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

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
  const syllableChips = () => `<div class="flex flex-wrap gap-2 mb-2">${SYLLABLES.map((s) => `<span class="flow-chip !text-sm">${s}</span>`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 20 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Clear words, uninterrupted melody.</p>
        <p class="text-sm text-ink-300">Articulation means your words can be understood — it isn't about forcing crisp consonants at the cost of a smooth, sustained vowel.</p>
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
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first look at clear words and natural musical choices.</h3>
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

        ${chapter("understand", 1, "Part A — Understanding articulation", `
          ${narrow(`
            ${p("Articulation means making your sung words understandable. Vowels carry most of the sustained singing sound, while consonants help a listener recognise the word — singing means balancing clear pronunciation with musical continuity, rather than treating either one as more important.")}
            ${p("Try saying “la” quickly, the way you would in speech — then sing “la” held gently for a few seconds. Notice how the vowel is what actually sustains; the consonant is just a brief, clear doorway into it.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle speech and mouth preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Let your jaw move gently and freely.", "Let your tongue move gently — no tension.", "Open and close your mouth comfortably, a few times.", "Slowly speak a few simple syllables, like “ma” or “la.”", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("No exaggerated mouth movements and no tongue exercises that create tension — everything here stays easy.")}
          `)}
        `)}

        ${chapter("syllables", 3, "Part C — Consonant and vowel practice", `
          ${narrow(`
            ${p("Choose a comfortable reference note below, then practise each syllable slowly on that note — keep the vowel sustained while the consonant stays short and clear. A consonant should never interrupt or cut off the vowel that follows it.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c20-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-3">Your reference note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${narrow(`${syllableChips()}`)}
          <button type="button" data-play-pattern="reference" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play reference note</button>
        `, { wide: true })}

        ${chapter("words", 4, "Part D — Clear words across nearby notes", `
          ${narrow(`
            ${p("Now try the same syllables while moving to a nearby note and back, then a nearby lower note and back. Keep your vowels clear, your jaw and tongue relaxed, and avoid unnecessary tension — the note should stay stable while you pronounce each syllable.")}
          `)}
          ${narrow(`${syllableChips()}`)}
          <button type="button" data-play-pattern="nearby" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
        `)}

        ${chapter("phrase", 5, "Part E — Singing a simple phrase", `
          ${narrow(`
            ${p(`A short practice phrase: “${SENTENCE}”`)}
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
              ${["Speak the phrase naturally.", "Speak it in rhythm.", "Sing it slowly with the reference melody below.", "Repeat it while keeping your pronunciation clear.", "Listen to your recording and reflect."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="phraseSlow" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen, slowly</button>
            <button type="button" data-play-pattern="phrase" class="vr-btn">${icon("play", "w-4 h-4")} Listen, normal</button>
          </div>
          ${RecordingCard.render("rc-phraseTake", { title: "Sing the phrase", hint: "Entirely optional.", maxSeconds: 20, section: false })}
          <div data-review-host class="mt-3"></div>
        `)}

        ${chapter("style", 6, "Part F — Introduction to musical style", `
          ${narrow(`
            ${p("Singing style grows out of natural musical choices, not imitation. A few simple ideas to notice, not master:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-3">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Connected singing</strong> versus gently separated notes.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Natural word emphasis</strong> — some words simply carry more weight than others.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Smooth phrasing</strong> — shaping a line as one musical thought.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Expressing the meaning</strong> of what you're singing, in your own way.</li>
            </ul>
            ${p("There's no expectation to imitate a professional singer, and nothing here is about correcting your accent — this is about noticing choices you can already make.")}
          `)}
          <div class="flex flex-wrap gap-3">
            <button type="button" data-play-style="connected" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen — connected</button>
            <button type="button" data-play-style="separated" class="vr-btn">${icon("play", "w-4 h-4")} Listen — gently separated</button>
          </div>
        `)}

        ${chapter("reflect", 7, "Self-review", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("wordsUnderstandable-q", { ...Q.wordsUnderstandable, selected: sel("wordsUnderstandable") })}
              ${SelfAssessment.render("vowelSteady-q", { ...Q.vowelSteady, selected: sel("vowelSteady") })}
              ${SelfAssessment.render("jawRelaxed-q", { ...Q.jawRelaxed, selected: sel("jawRelaxed") })}
              ${SelfAssessment.render("noInterruption-q", { ...Q.noInterruption, selected: sel("noInterruption") })}
              ${SelfAssessment.render("phraseNatural-q", { ...Q.phraseNatural, selected: sel("phraseNatural") })}
              ${SelfAssessment.render("comfortableTone-q", { ...Q.comfortableTone, selected: sel("comfortableTone") })}
            </div>
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c20-next">What would I like to explore next time?</label><textarea id="l2c20-next" data-growth="next" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.next || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c20", { placeholder: "e.g. Which syllable felt easiest... Where the melody felt interrupted... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pronunciation, accent, speed, or recording quality.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: keep every exercise within a comfortable range, avoid exaggerated mouth opening or jaw tension, don't use hard consonant attacks, and don't force long sustained notes. Stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
          `)}
        `)}

        ${chapter("complete", 10, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 11, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Part C: piano ---- */
    own(VirtualPiano.wire(container, "l2c20-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to || midi - STEP < RANGE.from) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - MAX_UP * STEP)} so the nearby-note references stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

    /* ---- Parts C/D/E: reference pattern playback ---- */
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const key = btn.dataset.playPattern;
      if (key === "reference") { PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 }); return; }
      if (key === "phraseSlow") { PianoSynth.playSequence(degreesToNotes(base(), PATTERNS.phrase), { duration: 0.75, gap: 0.3 }); return; }
      const degrees = PATTERNS[key];
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.5, gap: 0.2 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- Part F: connected vs. separated demo ---- */
    function onPlayStyle(e) {
      const btn = e.target.closest("[data-play-style]");
      if (!btn) return;
      const opts = btn.dataset.playStyle === "connected" ? { duration: 0.6, gap: 0.03 } : { duration: 0.4, gap: 0.4 };
      PianoSynth.playSequence(degreesToNotes(base(), PATTERNS.connected), opts);
    }
    container.addEventListener("click", onPlayStyle);
    cleanups.push(() => container.removeEventListener("click", onPlayStyle));

    /* ---- Part E: recording ---- */
    function reviewHtml(rec) {
      const t = take(rec, "phraseTake");
      if (!t) return "";
      return `<button type="button" data-play-review="phraseTake" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Listen back</button>`;
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    own(RecordingCard.wire(container, "rc-phraseTake", {
      classId, take: take(rec0(), "phraseTake"), maxSeconds: 20,
      meta: { name: "Level 2, Class 20 — Simple phrase", exercise: "articulation-and-style-phraseTake" },
      onSaved: (t) => { set("recs", "phraseTake", t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
    }));
    refreshReviewHost();
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
      "wordsUnderstandable-q": "wordsUnderstandable", "vowelSteady-q": "vowelSteady", "jawRelaxed-q": "jawRelaxed",
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
        learned: "Articulation means making words understandable without interrupting the melody — vowels sustain the sound, consonants stay brief and clear.",
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
