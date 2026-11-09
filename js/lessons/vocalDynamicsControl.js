/* ============================================================
   LEVEL 2, CLASS 13 — VOCAL DYNAMICS AND CONTROL (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "vocal-dynamics-control".

   Curriculum identity: Level 2, Class 13 (`number: 13`, `levelId: 2`
   in data.js, id `L2C13`). Same mechanism Classes 1-12 already
   proved twelve times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Sustained Notes and Stability" during Class 12's turn), so
   nothing needed renaming or adding to bring Class 13 itself onto
   the page.

   **Level 2's class count grows a ninth time.** This spec's own
   "Next class preview" names the real Class 14 as "Expressive
   Singing Foundations." Since an entry already existed in
   `levelClassDefs[2]` from Class 12's turn, this is a plain rename
   in place, the same precedent every class since 5 has followed
   (apart from Class 11's one-off addition).

   Core idea: "Vocal dynamics refers to variations in loudness and
   softness while singing... Control is more important than volume.
   Strong singing does not mean shouting." Three beginner-friendly
   levels only — soft, medium, stronger — never exact decibel
   targets, and the "stronger" exercise is explicitly optional.

   Honesty boundaries, matching every earlier class: no fabricated
   loudness, pitch, or vocal-quality analysis (none exists in this
   codebase); completion never depends on a particular loudness,
   singing strongly, recording, perfectly controlling every dynamic
   change, or completing optional exercises (the spec says this
   explicitly).

   Like Classes 11-12, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" is phrased
   as negative constraints), so this file self-authors a 5-item
   plain-checkbox checklist from the lesson's own Parts A-H, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   Like Class 12, this lesson never asks the learner to move to a
   different pitch — soft/medium/stronger are explored on ONE
   comfortable reference note throughout (Parts C-E explicitly say
   "use the same comfortable note") — so `baseNote()` reuses Class
   12's simpler single-note pattern, no range-clamp needed.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the two-recording dynamic-host
   compare pattern (Class 8's `contrastHtml`), the "one exercise card
   per item" grid pattern (Classes 7-8). Part H reuses all six of
   Parts C/D/E/G's own recordings for its "listen and compare"
   section rather than asking for two new ones — the sixth Level 2
   class in a row (after 7-12) to substantially reuse its final
   optional-recording section instead of re-asking.
   ============================================================ */

const VocalDynamicsControlLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "soft", label: "Soft" },
    { id: "medium", label: "Medium" },
    { id: "stronger", label: "Stronger" },
    { id: "gradual", label: "Gradual" },
    { id: "phrase", label: "Phrase" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const PHRASE = "I am learning to sing with control.";

  const LEVELS = [
    { key: "soft", label: "Soft", desc: "Gentle, quiet singing." },
    { key: "medium", label: "Medium", desc: "Comfortable everyday singing intensity." },
    { key: "stronger", label: "Stronger", desc: "Slightly more energetic — never shouting or strained." },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal dynamics means." },
    { key: "triedSoftMedium", label: "I tried singing softly and at medium intensity." },
    { key: "exploredStrongerOrSkipped", label: "I explored a slightly stronger sound, or chose to skip it." },
    { key: "noticedControl", label: "I noticed whether my voice stayed relaxed and controlled." },
    { key: "reflectionRecorded", label: "I reflected on which intensity felt most comfortable, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    noticedDifference: { question: "Could I notice the difference between soft and medium singing?", options: [opt("yes", "Yes", "good"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    gradualChange: { question: "Did I change volume gradually?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    relaxedVoice: { question: "Did I maintain a relaxed voice?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    accidentalShout: { question: "Did I accidentally shout or push?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    mostComfortable: { question: "Which intensity felt most comfortable?", options: [opt("soft", "Soft"), opt("medium", "Medium"), opt("stronger", "Stronger"), opt("unsure", "Not sure")] },
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
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 8) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function levelsHtml() {
    return `<div class="grid sm:grid-cols-3 gap-3 my-4">
      ${LEVELS.map((l, i) => `
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <div class="flex items-center justify-center gap-1 mb-2">${[0, 1, 2].map((d) => `<span class="w-2 h-2 rounded-full ${d <= i ? "bg-gold-400" : "bg-white/10"}"></span>`).join("")}</div>
        <p class="font-display text-lg text-ink-50 mb-1">${l.label}</p>
        <p class="text-xs text-ink-400">${l.desc}</p>
      </div>`).join("")}
    </div>`;
  }

  function compareHtml(rec) {
    const s = take(rec, "softTake"), m = take(rec, "mediumTake");
    return `<div class="flex flex-wrap gap-3">
      <button type="button" data-play-review="softTake" class="vr-btn" ${s ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} My soft take</button>
      <button type="button" data-play-review="mediumTake" class="vr-btn" ${m ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} My medium take</button>
    </div>`;
  }

  function reviewHtml(rec) {
    const sources = [
      ["softTake", "Soft"], ["mediumTake", "Medium"], ["strongerTake", "Stronger"],
      ["phraseMediumTake", "Phrase — medium"], ["phraseSoftToStrongTake", "Phrase — soft to stronger"], ["phraseMediumToSoftTake", "Phrase — medium to soft"],
    ];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the soft, medium, stronger, or phrase attempts above — then come back here to listen and compare.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 17 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Control matters more than volume.</p>
        <p class="text-sm text-ink-300">Strong singing is never the same as shouting — soft and medium singing are already enough to complete this class.</p>
        <p class="text-sm text-ink-100">Dynamics help communicate emotion and musical intention, one comfortable note at a time.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 18 — Vocal Agility Development</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson moves between nearby notes with control — smooth and slow, never fast and unclear.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Soft, medium, and a little stronger — all explored on one comfortable note.</h3>
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

        ${chapter("understand", 1, "Part A — Understand vocal dynamics", `
          ${narrow(`
            ${p("Vocal dynamics refers to variations in loudness and softness while singing. Soft singing can be expressive on its own — a song doesn't need to be sung at the same volume from beginning to end. Dynamics help communicate emotion and musical intention.")}
            ${p("Stronger singing should always stay comfortable and controlled. There are no exact decibel targets here — just three beginner-friendly levels to explore.")}
          `)}
          ${levelsHtml()}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your jaw, shoulders, and neck.", "Breathe normally.", "Make a comfortable hum, if you'd like.", "Sing one easy note softly.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3 mt-5">
            ${VirtualPiano.render("vdc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
        `, { wide: true })}

        ${chapter("soft", 3, "Part C — Explore soft singing", `
          ${narrow(p("Using your comfortable note, sing it softly on a comfortable “oo” or “mmm”. Keep the throat relaxed and release the sound gently — soft singing should never become whispering or breathy pushing."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("softTake", "Soft", "", 8)}
        `)}

        ${chapter("medium", 4, "Part D — Explore medium intensity", `
          ${narrow(p("Use the same comfortable note and sing it at a natural, comfortable medium intensity. Compare it with your soft attempt below — notice the difference without forcing the sound. You shouldn't need to increase volume significantly."))}
          ${recCard("mediumTake", "Medium", "", 8)}
          <div class="mt-4" data-compare-host>${compareHtml(rec)}</div>
        `)}

        ${chapter("stronger", 5, "Part E — Explore slightly stronger singing (optional)", `
          ${narrow(p("On the same comfortable pitch, increase intensity only a little. Keep the jaw, neck, and throat relaxed, then return to medium or soft singing. Stronger singing is never shouting, squeezing, or pushing air — if this doesn't feel comfortable, skip it and still complete the lesson."))}
          ${recCard("strongerTake", "Stronger", "Entirely optional.", 8)}
          ${narrow(`<div class="mt-3">${skipBtn("stronger")}</div>`)}
        `)}

        ${chapter("gradual", 6, "Part F — Practice gradual dynamic changes", `
          ${narrow(`
            ${p("A simple sequence: Soft → Medium → Soft. Try it on one comfortable note or a short familiar phrase. Make the transition gradual, keep the pitch comfortable, don't force the volume change, and rest between attempts.")}
            <p class="text-xs text-ink-500">Optional vocabulary: musicians sometimes call soft singing <em>piano</em> and loud/strong singing <em>forte</em> — useful terms, not a requirement.</p>
            <button type="button" data-play-pitch class="vr-btn mt-4">${icon("play", "w-4 h-4")} Play my reference note again</button>
          `)}
        `)}

        ${chapter("phrase", 7, "Part G — Apply dynamics to a short phrase", `
          ${narrow(`
            ${p(`Try the phrase “${PHRASE}” three ways — these are exploration exercises, not performance tests, and nothing here needs a difficult song or a high note.`)}
          `)}
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${recCard("phraseMediumTake", "1. Comfortable medium intensity", "", 10)}
            ${recCard("phraseSoftToStrongTake", "2. Begin softly, become slightly stronger", "", 10)}
            ${recCard("phraseMediumToSoftTake", "3. Begin at medium, finish softly", "", 10)}
          </div>
        `, { wide: true })}

        ${chapter("reflect", 8, "Part H — Listen and reflect", `
          ${narrow(p("Listen back to any of your attempts and compare them. If you'd rather not record, the questions below work just as well as a self-reflection — simply answer from memory."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("noticedDifference-q", { ...Q.noticedDifference, selected: sel("noticedDifference") })}
              ${SelfAssessment.render("gradualChange-q", { ...Q.gradualChange, selected: sel("gradualChange") })}
              ${SelfAssessment.render("relaxedVoice-q", { ...Q.relaxedVoice, selected: sel("relaxedVoice") })}
              ${SelfAssessment.render("accidentalShout-q", { ...Q.accidentalShout, selected: sel("accidentalShout") })}
              ${SelfAssessment.render("mostComfortable-q", { ...Q.mostComfortable, selected: sel("mostComfortable") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vdc", { placeholder: "e.g. Which intensity felt most natural... Whether the stronger exercise felt comfortable... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on a particular loudness, singing strongly, a recording, perfectly controlling every dynamic change, or completing optional exercises.")}
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

    /* ---- Part B: piano + playback ---- */
    own(VirtualPiano.wire(container, "vdc-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); },
    }));
    function onPlayPitch() { PianoSynth.play(base(), { duration: 1.5, velocity: 0.5 }); }
    container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.addEventListener("click", onPlayPitch));
    cleanups.push(() => container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.removeEventListener("click", onPlayPitch)));

    /* ---- skip button (Part E) ---- */
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
    function refreshCompareHost() {
      const host = $("[data-compare-host]");
      if (host) host.innerHTML = compareHtml(rec0());
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = {
      softTake: "Soft", mediumTake: "Medium", strongerTake: "Stronger",
      phraseMediumTake: "Phrase — medium", phraseSoftToStrongTake: "Phrase — soft to stronger", phraseMediumToSoftTake: "Phrase — medium to soft",
    };
    const MAX_SECONDS = { softTake: 8, mediumTake: 8, strongerTake: 8, phraseMediumTake: 10, phraseSoftToStrongTake: 10, phraseMediumToSoftTake: 10 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 13 — ${NAMES[k]}`, exercise: `vocal-dynamics-control-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshCompareHost(); refreshReviewHost(); },
      }));
    });

    /* ---- play-to-review / compare ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn || btn.disabled) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "noticedDifference-q": "noticedDifference", "gradualChange-q": "gradualChange", "relaxedVoice-q": "relaxedVoice", "accidentalShout-q": "accidentalShout", "mostComfortable-q": "mostComfortable" };
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
    own(PersonalNotes.wire(container, "notes-vdc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Control matters more than volume — strong singing is never the same as shouting, and soft or medium singing are already enough to complete this class.",
        struggled: q(rec, "accidentalShout") && q(rec, "accidentalShout") !== "no" ? "Noticed some shouting or pushing while exploring a stronger sound." : "",
        toPractice: q(rec, "mostComfortable") ? `${q(rec, "mostComfortable")} intensity felt most comfortable.` : "",
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
