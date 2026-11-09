/* ============================================================
   LEVEL 2, CLASS 12 — SUSTAINED NOTES AND STABILITY (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "sustained-notes-stability".

   Curriculum identity: Level 2, Class 12 (`number: 12`, `levelId: 2`
   in data.js, id `L2C12`). Same mechanism Classes 1-11 already
   proved eleven times over. This class's own title matched the
   placeholder list's already-added entry exactly ("Sustained Notes
   and Stability", added fresh during Class 11's turn since Class 10
   had already consumed the last original placeholder), so nothing
   needed renaming or adding to bring Class 12 itself onto the page.

   **Level 2's class count grows an eighth time.** This spec's own
   "Next class preview" names the real Class 13 as "Vocal Dynamics
   and Control." Since an entry already existed in `levelClassDefs[2]`
   from Class 11's turn, this is a plain rename in place, the same
   precedent every class since 5 has followed.

   Core idea: "A sustained note is a note held continuously for a
   short duration... Singing a note steadily does not mean making it
   louder or pushing more air... A short, comfortable, steady note is
   a better achievement than a long note produced with tension."
   Explicitly never promises a short lesson will produce perfect pitch
   stability or long breath holds.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-stability, breath, or vocal-quality analysis (none exists in
   this codebase); completion never depends on a fixed hold duration,
   perfect stability, recording, optional repetitions, or an automated
   vocal test (the spec says this explicitly).

   Like Class 11, this spec gives no literal Section-I completion-
   checklist text (its "Completion criteria" is phrased as negative
   constraints), so this file self-authors a 5-item plain-checkbox
   checklist from the lesson's own Parts A-G, the same style Class 10's
   original `PRE_CHECK_ITEMS` established.

   Unlike Classes 10-11, this lesson never asks the learner to move to
   a different pitch — a sustained note stays on one comfortable
   reference note throughout, so there is no bidirectional range-clamp
   here; `baseNote()` returns to the simpler single-note pattern Class
   9 and earlier used before range exploration began.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. Part E's "listen and compare" doubles
   as its own self-observation alternative (the spec's fallback for
   when recording isn't supported) since the same questions apply
   whether or not the learner actually recorded.
   ============================================================ */

const SustainedNotesStabilityLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "firstNote", label: "Short Note" },
    { id: "steadiness", label: "Steadiness" },
    { id: "listen", label: "Listen" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what a sustained note is." },
    { key: "triedShortNote", label: "I tried a short, comfortable note." },
    { key: "noticedSteadiness", label: "I noticed whether the sound felt steady, shaky, or strained." },
    { key: "restedBetweenAttempts", label: "I rested between attempts." },
    { key: "reflectionRecorded", label: "I wrote a short reflection, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    steadinessNoticed: { question: "Did the sound become shaky, breathy, strained, or louder without intention?", options: [opt("no", "No, it felt steady", "good"), opt("shaky", "A little shaky"), opt("breathy", "A little breathy"), opt("strained", "Some strain, or louder than intended")] },
    consistent: { question: "Did the sound remain reasonably consistent?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    volumeChange: { question: "Did the volume suddenly increase or decrease?", options: [opt("no", "No", "good"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    throatRelaxed: { question: "Did your throat feel relaxed?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    endingGentle: { question: "Was the ending gentle?", options: [opt("yes", "Yes", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
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
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
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
  const recCard = (k, title, hint, max = 8) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function safetyHtml() {
    return `<div class="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
      <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-3">Keep it gentle</p>
      <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Never force a note to last longer.", "Don't hold your breath before singing.", "Don't squeeze the throat or increase volume to maintain a note.", "Keep attempts short and comfortable.", "Rest between attempts.", "Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort."].map((t) => `<li class="flex gap-2"><span class="text-amber-300">✕</span>${t}</li>`).join("")}</ul>
      <p class="text-xs text-ink-500 mt-3">Stopping early is completely fine — it does not mean failure.</p>
    </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 16 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">A short, steady note beats a long, tense one.</p>
        <p class="text-sm text-ink-300">Stability develops gradually — a brief, comfortable, reasonably steady note is already a real achievement.</p>
        <p class="text-sm text-ink-100">Relaxed coordination matters far more than holding a note for a long time.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 17 — Vocal Dynamics and Control</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will build on today's steady note, exploring comfortable changes in volume without losing that same relaxed coordination.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A short, comfortable note, held gently and released without force.</h3>
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
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Part A — Understand sustained notes", `
          ${narrow(`
            ${p("A sustained note is a note held continuously for a short duration. Singing a note steadily does not mean making it louder or pushing more air — the aim is just to keep the sound comfortable and reasonably consistent.")}
            ${p("Natural variation is completely normal while learning. A short, comfortable, steady note is a better achievement than a long note produced with tension.")}
          `)}
          ${flowStrip(["BEGIN gently", "HOLD steady", "END gently"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your shoulders, jaw, and neck.", "Breathe normally — no exaggerated breaths or breath-holding.", "If comfortable, make a gentle hum.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${safetyHtml()}
        `)}

        ${chapter("firstNote", 3, "Part C — Start with a short note", `
          ${narrow(p("Choose a comfortable pitch below. Begin with a soft, comfortable “mmm” or “oo”, hold it only briefly — around 2-3 seconds if comfortable — then release the sound gently and rest before repeating. A longer hold is never required."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("sns-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("firstNoteTake", "Your short, comfortable note", "2-3 seconds if comfortable — shorter is completely fine.", 8)}
        `, { wide: true })}

        ${chapter("steadiness", 4, "Part D — Develop steadiness", `
          ${narrow(`
            ${p("A simple progression, all on the same comfortable note:")}
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["Produce a comfortable short note.", "Try to keep the sound reasonably even.", "Focus on a gentle beginning and ending."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("Notice whether the sound becomes shaky, breathy, strained, or louder without intention — there's no need for perfect stability, and the duration should never increase automatically if it feels difficult.")}
            ${SelfAssessment.render("steadinessNoticed-q", { ...Q.steadinessNoticed, selected: sel("steadinessNoticed") })}
          `)}
        `)}

        ${chapter("listen", 5, "Part E — Listen and compare", `
          ${narrow(p("Record two short attempts, then listen back to each one. If you'd rather not record, the questions below work just as well as a self-observation — simply answer from memory."))}
          <div class="grid sm:grid-cols-2 gap-4 mb-5">
            ${recCard("attempt1Take", "Attempt 1", "", 8)}
            ${recCard("attempt2Take", "Attempt 2", "", 8)}
          </div>
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("consistent-q", { ...Q.consistent, selected: sel("consistent") })}
              ${SelfAssessment.render("volumeChange-q", { ...Q.volumeChange, selected: sel("volumeChange") })}
              ${SelfAssessment.render("throatRelaxed-q", { ...Q.throatRelaxed, selected: sel("throatRelaxed") })}
              ${SelfAssessment.render("endingGentle-q", { ...Q.endingGentle, selected: sel("endingGentle") })}
            </div>
          `)}
        `, { wide: true })}

        ${chapter("practice", 6, "Part F — Gentle practice", `
          ${narrow(`
            ${p("An optional short sequence — finish whenever you'd like, with no need to repeat it.")}
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Select one comfortable note.", "Sing it gently for a short duration.", "Rest.", "Repeat only if comfortable.", "Finish with a relaxed hum or silence."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <button type="button" data-play-pitch class="vr-btn">${icon("play", "w-4 h-4")} Play my reference note again</button>
          `)}
        `)}

        ${chapter("reflect", 7, "Part G — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="sns-easiest">What felt easiest?</label><textarea id="sns-easiest" data-growth="easiest" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.easiest || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="sns-steady">Did the note feel steady?</label><textarea id="sns-steady" data-growth="steady" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.steady || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="sns-tension">Did I notice any tension?</label><textarea id="sns-tension" data-growth="tension" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.tension || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="sns-improve">What would I like to improve next time?</label><textarea id="sns-improve" data-growth="improve" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.improve || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-sns", { placeholder: "e.g. How the short note felt... Whether the steadiness exercise was easy or hard... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on a fixed hold duration, perfect pitch stability, a recording, completing optional repetitions, or an automated vocal test.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
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

    /* ---- Part C: piano + playback ---- */
    own(VirtualPiano.wire(container, "sns-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); },
    }));
    function onPlayPitch() { PianoSynth.play(base(), { duration: 1.5, velocity: 0.5 }); }
    container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.addEventListener("click", onPlayPitch));
    cleanups.push(() => container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.removeEventListener("click", onPlayPitch)));

    /* ---- recordings ---- */
    const NAMES = { firstNoteTake: "Short note", attempt1Take: "Attempt 1", attempt2Take: "Attempt 2" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: 8,
        meta: { name: `Level 2, Class 12 — ${NAMES[k]}`, exercise: `sustained-notes-stability-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); },
      }));
    });

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "steadinessNoticed-q": "steadinessNoticed", "consistent-q": "consistent", "volumeChange-q": "volumeChange", "throatRelaxed-q": "throatRelaxed", "endingGentle-q": "endingGentle" };
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
    own(PersonalNotes.wire(container, "notes-sns", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Stability develops gradually — a short, comfortable, steady note is a better achievement than a long note produced with tension.",
        struggled: q(rec, "steadinessNoticed") && q(rec, "steadinessNoticed") !== "no" ? `Noticed some ${q(rec, "steadinessNoticed")} quality while holding the note.` : "",
        toPractice: A(rec, "growth").improve || "",
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
