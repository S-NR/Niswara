/* ============================================================
   LEVEL 2, CLASS 22 — PERSONAL VOCAL STYLE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "personal-vocal-style".

   Curriculum identity: Level 2, Class 22 (`number: 22`, `levelId: 2`
   in data.js, id `L2C22`). Same mechanism Classes 1-21 already
   proved twenty-one times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Vocal Endurance Foundations" during Class 21's turn), so nothing
   needed renaming or adding to bring Class 22 itself onto the page.

   This spec's own "Next class preview" names the real Class 23 as
   "Song Practice Workshop" — `levelClassDefs[2]` is renamed in place
   again, the same precedent every class since 5 has followed.

   Core idea: personal style grows from listening, practice, and
   experimentation — not imitation. Every voice has its own natural
   characteristics; there's no single "correct" voice, and comparing
   one's own voice negatively against professional singers is
   explicitly discouraged. A preference discovered today is allowed
   to change as the voice develops.

   Honesty boundaries, matching every earlier class: no automatic
   emotion detection, voice-personality analysis, or vocal-style
   scoring (the spec explicitly forbids claiming this — none of it
   exists in this codebase); the learner's voice is never judged, and
   completion never depends on recording quality (the spec says this
   explicitly).

   Section 2's "two simple demonstrations of the same short original
   melody with different expressive approaches" and Section 4's
   "Gentle / Bright / Expressive" selector are the SAME underlying
   mechanism: three `PianoSynth.playSequence` option presets
   (duration/velocity/gap) applied to the identical note pattern, so
   the notes and rhythm genuinely stay the same across versions and
   only the expression actually differs — a real, audible
   difference, not just three identically-sounding buttons with
   different labels.

   This spec gives its self-review as six literal first-person
   QUESTIONS, the same shape as Classes 20-21 — these become
   `SelfAssessment` chip questions, kept separate from the completion
   checklist. "Do not... make completion dependent on recording
   quality" is a negative-constraints instruction again, so this file
   self-authors its own 5-item plain-checkbox checklist, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   The short original melodic phrase and the Section 6 "two or three
   connected phrases" exercise are new, plain melodic-degree patterns
   written for this lesson — no lyrics, no borrowed text.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth's
   relative-degree pattern playback (Level 1 Class 24 / Classes
   15-21) for every reference example, RecordingCard (Class 5) for
   the one Section 6 recording, SelfAssessment (Class 4),
   PersonalNotes, ClassProgress.
   ============================================================ */

const PersonalVocalStyleLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "naturalTone", label: "Natural Tone" },
    { id: "expression", label: "Expression" },
    { id: "preference", label: "Preference" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2;

  // Three expression presets applied to the SAME note pattern, so only the
  // expression actually changes — never the melody or rhythm.
  const MODES = [
    { key: "gentle", label: "Gentle", opts: { duration: 0.8, velocity: 0.32, gap: 0.3 } },
    { key: "bright", label: "Bright", opts: { duration: 0.48, velocity: 0.62, gap: 0.14 } },
    { key: "expressive", label: "Expressive", opts: { duration: 0.65, velocity: 0.48, gap: 0.22 } },
  ];
  const PHRASE = [0, 1, 2, 1, 0];
  const PHRASES = { phrase: PHRASE, bridge: [2, 1, 2], closing: [0, -1, 0] };
  const COMBINED = [...PHRASES.phrase, ...PHRASES.bridge, ...PHRASES.closing];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand that personal style develops gradually, not by imitation." },
    { key: "triedNaturalTone", label: "I explored my natural tone on a comfortable note, or chose to skip it." },
    { key: "triedExpression", label: "I tried at least one expressive version of the phrase, or chose to skip it." },
    { key: "triedPractice", label: "I tried the Personal Style Practice exercise, or chose to skip it." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    sungComfortably: { question: "Did I sing comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    experimentedWithoutForcing: { question: "Did I experiment without forcing my voice?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    noticedDifferences: { question: "Did I notice differences in expression?", options: [opt("yes", "Yes"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    mostNaturalVersion: { question: "Which version felt most natural?", options: [opt("gentle", "Gentle"), opt("bright", "Bright"), opt("expressive", "Expressive"), opt("unsure", "Not sure")] },
    enjoyedExercise: { question: "Did I enjoy the exercise?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n + MAX_UP * STEP <= RANGE.to && n >= RANGE.from;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C21", "L2C20", "L2C19", "L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_UP * STEP, fallback));
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
  const modeChips = (selected) => `<div class="flex flex-wrap gap-2" role="group" aria-label="Expression">${MODES.map((m) => `<button type="button" data-mode="${m.key}" class="ex-chip ${m.key === selected ? "is-selected" : ""}">${m.label}</button>`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 22 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Your voice already has a style — today was about noticing it.</p>
        <p class="text-sm text-ink-300">There's no single correct voice. Personal style develops gradually, through listening, practice, and gentle experimentation — not imitation.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 23 — Song Practice Workshop</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson is a chance to bring the vocal techniques learned so far together and apply them to a complete song.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first gentle look at your own natural expression.</h3>
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
    const mode = A(rec, "setup").mode || "gentle";

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section 1 — What is personal vocal style?", `
          ${narrow(`
            ${p("What makes one singer sound different from another? Usually a combination of tone, pronunciation, phrasing, and expression — the small, natural choices a voice makes while singing. There's no single “perfect” voice, and comparing your own voice negatively against professional singers isn't useful — every voice, including theirs, is simply its own.")}
            ${p("A song can be sung many different ways without changing its basic melody at all — today is about noticing some of your own natural choices, not adopting someone else's.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section 2 — Listen and observe", `
          ${narrow(p("The same short melody, played two different ways — the notes and rhythm are identical both times; only the expression changes."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-mode="gentle" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Version A — soft and gentle</button>
            <button type="button" data-play-mode="bright" class="vr-btn">${icon("play", "w-4 h-4")} Version B — brighter and more energetic</button>
          </div>
          ${narrow(`
            ${SelfAssessment.render("preferredVersion-q", { question: "Which version felt more natural?", selected: sel("preferredVersion"), options: [opt("a", "Version A"), opt("b", "Version B"), opt("equal", "Both, about equally"), opt("unsure", "Not sure")] })}
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c22-difference">What difference did you notice, and what emotion did each version seem to express?</label><textarea id="l2c22-difference" data-growth="difference" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.difference || "")}</textarea></div>
          `)}
        `)}

        ${chapter("naturalTone", 3, "Section 3 — Explore your natural tone", `
          ${narrow(p("Choose a comfortable reference note below. Hum it naturally, then sing the same note on a simple “Aa”. Repeat a few times without deliberately making your voice deeper, brighter, louder, or breathier — just listen to what's naturally there."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c22-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your reference note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
        `, { wide: true })}

        ${chapter("expression", 4, "Section 4 — Experiment with musical expression", `
          ${narrow(`
            ${p("The same short phrase as before, with three simple ways to approach it. The notes and rhythm never change — only how you sing them does.")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-3">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Gentle:</strong> sing softly and comfortably.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Bright:</strong> a slightly more lively expression, without shouting.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Expressive:</strong> sing while thinking about the feeling of the phrase.</li>
            </ul>
          `)}
          <div data-mode-chips class="mb-3">${modeChips(mode)}</div>
          <button type="button" data-play-mode="current" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to this version</button>
        `)}

        ${chapter("preference", 5, "Section 5 — Discover your natural preference", `
          ${narrow(`
            ${p("Repeat the phrase a few times, trying each version above, then choose whichever feels most comfortable and natural right now — that preference is allowed to change as your voice develops.")}
            <div class="flex flex-col gap-4 mt-2">
              ${SelfAssessment.render("mostNaturalVersion-q", { ...Q.mostNaturalVersion, selected: sel("mostNaturalVersion") })}
              ${SelfAssessment.render("enjoyedExercise-q", { ...Q.enjoyedExercise, selected: sel("enjoyedExercise") })}
            </div>
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c22-explore">What would I like to explore further?</label><textarea id="l2c22-explore" data-growth="explore" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.explore || "")}</textarea></div>
          `)}
        `)}

        ${chapter("practice", 6, "Section 6 — Personal style practice", `
          ${narrow(p("A short original melody with a few connected phrases. Listen to the reference, sing it naturally, then try it again with a gentle expression of your choosing — recording it is entirely optional, and this isn't about a polished performance."))}
          <div data-mode-chips class="mb-3">${modeChips(mode)}</div>
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-mode="combined" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the reference</button>
          </div>
          ${RecordingCard.render("rc-styleTake", { title: "Sing it your way", hint: "Entirely optional.", maxSeconds: 25, section: false })}
          <div data-review-host class="mt-3"></div>
        `)}

        ${chapter("reflect", 7, "Self-review", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("sungComfortably-q", { ...Q.sungComfortably, selected: sel("sungComfortably") })}
              ${SelfAssessment.render("experimentedWithoutForcing-q", { ...Q.experimentedWithoutForcing, selected: sel("experimentedWithoutForcing") })}
              ${SelfAssessment.render("noticedDifferences-q", { ...Q.noticedDifferences, selected: sel("noticedDifferences") })}
            </div>
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c22-improve">What would I like to improve?</label><textarea id="l2c22-improve" data-growth="improve" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.improve || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c22", { placeholder: "e.g. Which version felt most like me... What I liked about my recording... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on recording quality, and your voice is never judged here.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: avoid forced voice changes, and don't imitate extreme vocal styles or force breathiness, raspiness, loudness, or artificial depth. Keep every exercise within a comfortable range, and stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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
    const currentMode = () => A(rec0(), "setup").mode || "gentle";

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

    /* ---- Section 3: piano ---- */
    own(VirtualPiano.wire(container, "l2c22-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note at or below ${N(RANGE.to - MAX_UP * STEP)} so the phrase references stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

    /* ---- Sections 2/4/6: expression-mode selector + playback ---- */
    function onModeChip(e) {
      const chip = e.target.closest("[data-mode]");
      if (!chip) return;
      set("setup", "mode", chip.dataset.mode);
      container.querySelectorAll("[data-mode-chips]").forEach((host) => { host.innerHTML = modeChips(chip.dataset.mode); });
    }
    container.addEventListener("click", onModeChip);
    cleanups.push(() => container.removeEventListener("click", onModeChip));

    function onPlayMode(e) {
      const btn = e.target.closest("[data-play-mode]");
      if (!btn) return;
      const key = btn.dataset.playMode;
      const modeKey = key === "current" ? currentMode() : key === "combined" ? currentMode() : key;
      const preset = MODES.find((m) => m.key === modeKey) || MODES[0];
      const degrees = key === "combined" ? COMBINED : PHRASE;
      PianoSynth.playSequence(degreesToNotes(base(), degrees), preset.opts);
    }
    container.addEventListener("click", onPlayMode);
    cleanups.push(() => container.removeEventListener("click", onPlayMode));

    /* ---- Section 6: recording ---- */
    function reviewHtml(rec) {
      const t = take(rec, "styleTake");
      if (!t) return "";
      return `<button type="button" data-play-review="styleTake" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Listen back</button>`;
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    own(RecordingCard.wire(container, "rc-styleTake", {
      classId, take: take(rec0(), "styleTake"), maxSeconds: 25,
      meta: { name: "Level 2, Class 22 — Personal style practice", exercise: "personal-vocal-style-styleTake" },
      onSaved: (t) => { set("recs", "styleTake", t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
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
      "preferredVersion-q": "preferredVersion", "mostNaturalVersion-q": "mostNaturalVersion", "enjoyedExercise-q": "enjoyedExercise",
      "sungComfortably-q": "sungComfortably", "experimentedWithoutForcing-q": "experimentedWithoutForcing", "noticedDifferences-q": "noticedDifferences",
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
    own(PersonalNotes.wire(container, "notes-l2c22", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Personal style grows from listening, practice, and gentle experimentation — not imitation. There's no single correct voice.",
        struggled: q(rec, "noticedDifferences") === "no" ? "Didn't notice much difference between the expressive versions yet." : "",
        toPractice: A(rec, "growth").explore || "",
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
