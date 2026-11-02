/* ============================================================
   LEVEL 2, CLASS 21 — VOCAL ENDURANCE FOUNDATIONS (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "vocal-endurance-foundations".

   Curriculum identity: Level 2, Class 21 (`number: 21`, `levelId: 2`
   in data.js, id `L2C21`). Same mechanism Classes 1-20 already
   proved twenty times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Articulation and Style" during Class 20's turn), so nothing
   needed renaming or adding to bring Class 21 itself onto the page.

   This spec's own "Next class preview" names the real Class 22 as
   "Personal Vocal Style" — `levelClassDefs[2]` is renamed in place
   again, the same precedent every class since 5 has followed.

   Core idea: vocal endurance is not singing loudly, reaching higher
   notes, or singing continuously for as long as possible — it's
   using comfortable coordination and managing effort over slightly
   longer phrases. Breaks are explicitly framed as part of good
   practice, not a sign of failure; this lesson never asks the
   learner to push through tiredness or maximise duration.

   Honesty boundaries, matching every earlier class: the app does not
   claim to automatically measure vocal fatigue, endurance, breath
   support, or audio quality (the spec explicitly forbids claiming
   this — none of these exist in this codebase); completion never
   depends on singing for a particular duration, a perfect recording,
   or completing every repetition (the spec says this explicitly).

   This spec gives its self-review as six literal first-person
   QUESTIONS, same shape as Class 20's Section 5 — these become six
   `SelfAssessment` chip questions, kept separate from the completion
   checklist. "Completion must not depend on..." is a negative-
   constraints paragraph again, so this file self-authors its own
   5-item plain-checkbox checklist, the same style Class 10's
   original `PRE_CHECK_ITEMS` established.

   Section 5 (Rest and Recovery) is a plain comparison prompt
   ("notice how your voice feels before and after a short rest"), not
   a timed feature — handled as a short instructive pause with a
   before/after reflection pair rather than a new timer widget, which
   would be building UI this simple instruction doesn't need.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth's
   relative-degree pattern playback (Level 1 Class 24 / Classes
   15-20) for the short and longer phrases and the combined exercise,
   RecordingCard (Class 5) for the one combined-exercise recording,
   SelfAssessment (Class 4), PersonalNotes, ClassProgress.
   ============================================================ */

const VocalEnduranceFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "shortPhrase", label: "Short Phrase" },
    { id: "consistency", label: "Consistency" },
    { id: "rest", label: "Rest" },
    { id: "practical", label: "Practical" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 3;

  const PHRASES = {
    short: [0, 1, 2, 1, 0],
    longer: [0, 1, 2, 3, 2, 1, 0],
    bridge: [2, 3, 2],
    closing: [0, 1, 0],
  };
  const COMBINED = [...PHRASES.short, ...PHRASES.bridge, ...PHRASES.closing];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal endurance means here." },
    { key: "triedShortPhrase", label: "I tried the short phrase, repeating it a few times, or chose to skip it." },
    { key: "triedLongerPhrase", label: "I tried the slightly longer phrase, or chose to skip it." },
    { key: "restedWhenNeeded", label: "I rested between attempts whenever I needed to." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    comfortableTone: { question: "Did I maintain a comfortable tone?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    withoutRushing: { question: "Did I complete the phrases without rushing?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    breathedNaturally: { question: "Did I breathe naturally?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    feltRelaxed: { question: "Did I feel relaxed while singing?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    noticedTiredness: { question: "Did I notice any tiredness or discomfort?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    restHelped: { question: "Did taking a short rest help?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Didn't rest")] },
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
    for (const id of ["L2C20", "L2C19", "L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
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
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 21 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Endurance is comfortable coordination, not maximum duration.</p>
        <p class="text-sm text-ink-300">Rest is part of good vocal practice, not a failure to push through — gradually building duration beats suddenly attempting a long song.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 22 — Personal Vocal Style</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson introduces the idea of gradually discovering your own natural musical expression, rather than trying to imitate another singer.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A gentle first look at singing comfortably over longer phrases.</h3>
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

        ${chapter("understand", 1, "Section 1 — Understanding vocal endurance", `
          ${narrow(`
            ${p("Vocal endurance isn't about singing loudly, reaching higher notes, or singing for as long as possible — it's about using comfortable coordination and managing your effort over a phrase. There's a real difference between healthy vocal effort and strain, and gradually building up duration is far better than suddenly attempting a long song.")}
            ${p("Breaks are part of good vocal practice, not a sign that something went wrong.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Section 2 — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Settle into a relaxed, comfortable posture.", "Breathe comfortably, without forcing extra air.", "Make a gentle hum.", "Keep everything within your comfortable range."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("No demanding high or low notes today.")}
          `)}
        `)}

        ${chapter("shortPhrase", 3, "Section 3 — Short phrase practice", `
          ${narrow(p("Choose a comfortable reference note below. Start with this short, comfortable phrase, and repeat it a few times with relaxed breathing between repetitions, keeping your tone consistent and comfortable throughout."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c21-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your reference note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${flowStrip(["1", "2", "3", "2", "1"])}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-pattern="short" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen — short phrase</button>
          </div>
          ${narrow(p("Once that feels easy, here's a slightly longer version — only continue if it still feels comfortable, and pause whenever you need to."))}
          ${flowStrip(["1", "2", "3", "4", "3", "2", "1"])}
          <button type="button" data-play-pattern="longer" class="vr-btn">${icon("play", "w-4 h-4")} Listen — slightly longer</button>
        `, { wide: true })}

        ${chapter("consistency", 4, "Section 4 — Maintaining vocal consistency", `
          ${narrow(`
            ${p("Sing the short phrase more than once, and focus on keeping your voice relaxed from beginning to end. Notice whether the final notes become weak, breathy, pushed, or unstable — if they do, that's useful information, not a failure.")}
            ${p("Breathe comfortably between attempts rather than forcing in extra air before you start.")}
          `)}
          <button type="button" data-play-pattern="short" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen again</button>
        `)}

        ${chapter("rest", 5, "Section 5 — Rest and recovery", `
          ${narrow(`
            ${p("Resting between practice attempts genuinely matters — it's how your voice recovers and how practice stays sustainable. Take a short, comfortable rest now, then notice how your voice feels afterward compared to before.")}
            ${p("If your voice feels tired, that's a sign to stop for today, not to sing through it.")}
            <div class="grid sm:grid-cols-2 gap-3 mt-2">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c21-before">How did my voice feel before resting?</label><textarea id="l2c21-before" data-growth="beforeRest" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.beforeRest || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c21-after">How did it feel after a short rest?</label><textarea id="l2c21-after" data-growth="afterRest" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.afterRest || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("practical", 6, "Section 6 — Practical application", `
          ${narrow(p("A simple exercise connecting two or three short phrases. Practise one phrase at a time first, then try them combined — this stays well within a comfortable range, and recording it is entirely optional."))}
          ${flowStrip(["Phrase", "Bridge", "Closing"])}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pattern="short" class="vr-btn">${icon("play", "w-4 h-4")} Phrase alone</button>
            <button type="button" data-play-pattern="bridge" class="vr-btn">${icon("play", "w-4 h-4")} Bridge alone</button>
            <button type="button" data-play-pattern="closing" class="vr-btn">${icon("play", "w-4 h-4")} Closing alone</button>
            <button type="button" data-play-pattern="combined" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} All combined</button>
          </div>
          ${RecordingCard.render("rc-combinedTake", { title: "The combined exercise", hint: "Entirely optional — practise the phrases separately first if that helps.", maxSeconds: 25, section: false })}
          <div data-review-host class="mt-3"></div>
        `)}

        ${chapter("reflect", 7, "Self-review", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("comfortableTone-q", { ...Q.comfortableTone, selected: sel("comfortableTone") })}
              ${SelfAssessment.render("withoutRushing-q", { ...Q.withoutRushing, selected: sel("withoutRushing") })}
              ${SelfAssessment.render("breathedNaturally-q", { ...Q.breathedNaturally, selected: sel("breathedNaturally") })}
              ${SelfAssessment.render("feltRelaxed-q", { ...Q.feltRelaxed, selected: sel("feltRelaxed") })}
              ${SelfAssessment.render("noticedTiredness-q", { ...Q.noticedTiredness, selected: sel("noticedTiredness") })}
              ${SelfAssessment.render("restHelped-q", { ...Q.restHelped, selected: sel("restHelped") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c21", { placeholder: "e.g. Where my tone changed near the end... How rest helped... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on singing for a particular duration, a perfect recording, or completing every repetition.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: never sing through fatigue, and don't try to maximise how long you can sing. Don't force high notes, low notes, loud singing, or long sustained notes, and avoid breath-holding or excessive inhalation. Stay hydrated and rested, and stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort — seek appropriate professional advice if symptoms persist.")}
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

    /* ---- Section 3: piano ---- */
    own(VirtualPiano.wire(container, "l2c21-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note at or below ${N(RANGE.to - MAX_UP * STEP)} so the longer phrase and combined exercise stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

    /* ---- Sections 3/4/6: phrase playback ---- */
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const key = btn.dataset.playPattern;
      const degrees = key === "combined" ? COMBINED : PHRASES[key];
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.6, gap: 0.25 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- Section 6: recording ---- */
    function reviewHtml(rec) {
      const t = take(rec, "combinedTake");
      if (!t) return "";
      return `<button type="button" data-play-review="combinedTake" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Listen back</button>`;
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    own(RecordingCard.wire(container, "rc-combinedTake", {
      classId, take: take(rec0(), "combinedTake"), maxSeconds: 25,
      meta: { name: "Level 2, Class 21 — Combined exercise", exercise: "vocal-endurance-foundations-combinedTake" },
      onSaved: (t) => { set("recs", "combinedTake", t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
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
      "comfortableTone-q": "comfortableTone", "withoutRushing-q": "withoutRushing", "breathedNaturally-q": "breathedNaturally",
      "feltRelaxed-q": "feltRelaxed", "noticedTiredness-q": "noticedTiredness", "restHelped-q": "restHelped",
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
    own(PersonalNotes.wire(container, "notes-l2c21", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vocal endurance is comfortable coordination and effort management, not singing louder, higher, or for as long as possible — and rest is part of good practice, not a failure.",
        struggled: q(rec, "noticedTiredness") && q(rec, "noticedTiredness") !== "no" ? "Noticed some tiredness during the longer phrase or combined exercise." : "",
        toPractice: A(rec, "growth").afterRest || "",
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
