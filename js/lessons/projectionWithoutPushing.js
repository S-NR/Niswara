/* ============================================================
   LEVEL 2, CLASS 9 — PROJECTION WITHOUT PUSHING (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "projection-without-pushing".

   Curriculum identity: Level 2, Class 9 (`number: 9`, `levelId: 2`
   in data.js, id `L2C09`). Same mechanism Classes 1-8 already
   proved eight times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Expression" during Class 8's turn), so nothing needed renaming
   to add Class 9 itself.

   **Level 2's class count grows a fifth time.** This spec's own
   Section K previews the real Class 10 as "Register Transitions and
   Vocal Continuity" — not the placeholder list's "Phrasing".
   Following the same precedent Classes 5-8 all set (and Level 1's
   five times before that), `levelClassDefs[2].titles`' next entry
   was renamed in place, not removed.

   Core idea: "Projection means allowing the voice to be heard
   clearly for the situation. Shouting is not the same as healthy
   vocal projection... A louder sound is not automatically a better
   sound... Vocal effort is not always the solution to an acoustic
   problem." Explicitly never promises a short lesson will make the
   voice powerful or loud.

   Honesty boundaries, matching every earlier class: no fabricated
   loudness/clarity/vocal-health analysis; completion never depends
   on recording, loudness, perfect articulation, or finishing every
   optional exercise (the spec says this explicitly).

   Section I is five plain first-person self-attestations again, so
   this file reuses Classes 3-8's plain-checkbox completion pattern
   (Class 10's original `PRE_CHECK_ITEMS` style).

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the green/amber "comfortable vs.
   avoid" comparison card (Class 3's Section F pattern). Section G
   reuses Section E's own two phrase recordings rather than asking
   again — the spec's literal "once naturally... once with clearer
   articulation" is exactly what Section E's Version A/B already are.
   ============================================================ */

const ProjectionWithoutPushingLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "baseline", label: "Baseline" },
    { id: "clarity", label: "Clarity" },
    { id: "phrase", label: "Phrase" },
    { id: "compare", label: "Compare" },
    { id: "effort", label: "Effort" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const GREETING = "Hello, how are you?";
  const PHRASE = "Today, I am learning to sing with ease.";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the difference between projection and shouting." },
    { key: "articulationPractised", label: "I practised clear articulation." },
    { key: "volumeComfortable", label: "I kept my volume comfortable." },
    { key: "tensionChecked", label: "I checked for jaw and throat tension." },
    { key: "reflected", label: "I reflected on my effort." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    effortRating: { question: "How would you rate the effort?", options: [opt("veryeasy", "Very easy", "good"), opt("mostlyeasy", "Mostly easy", "good"), opt("effortful", "A little effortful", "maybe"), opt("unsure", "Unsure")] },
    easierToUnderstand: { question: "Which version was easier to understand?", options: [opt("a", "Version A"), opt("b", "Version B"), opt("similar", "They seemed similar"), opt("unsure", "Not sure")] },
    increasedVolume: { question: "Did I increase my volume unintentionally?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did my jaw or throat become tense?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    secondVersionFelt: { question: "Did the second version feel easier, similar, or harder?", options: [opt("easier", "Easier", "good"), opt("similar", "Similar", "good"), opt("harder", "Harder", "maybe"), opt("unsure", "Not sure")] },
    wordsUnderstandable: { question: "Were the words understandable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    maintainedComfortVolume: { question: "Did I maintain a comfortable volume?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    throatJawTension: { question: "Did I feel any throat or jaw tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
  const recCard = (k, title, hint, max = 12) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function effortHtml() {
    return `<div class="grid sm:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-3">Comfortable approach</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Clear words", "Relaxed jaw and neck", "Natural breathing", "Comfortable volume", "Easy repetition"].map((t) => `<li class="flex gap-2"><span class="text-emerald-300">✓</span>${t}</li>`).join("")}</ul>
      </div>
      <div class="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-3">Avoid</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Shouting", "Pushing excessive air", "Tightening the throat", "Raising the chin to force sound", "Singing louder when a phrase feels difficult", "Continuing when the voice feels tired or uncomfortable"].map((t) => `<li class="flex gap-2"><span class="text-amber-300">✕</span>${t}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="text-xs text-ink-500 mt-3">Microphone use, room acoustics and distance also affect how audible a singer sounds — vocal effort isn't always the solution to an acoustic problem.</p>`;
  }

  function problems() {
    const items = [
      ["Shouting to make the voice louder", "Return to comfortable volume and focus on clear words."],
      ["Pushing extra air through every phrase", "Use natural breathing and pause when needed."],
      ["Tightening the jaw to pronounce words", "Keep the jaw relaxed and movements natural."],
      ["Trying to sing a phrase on one breath at any cost", "Breathe normally and shorten the phrase if needed."],
      ["Assuming projection means sounding powerful", "Start with clarity, comfort, and consistency."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [["versionA", "Version A — natural"], ["versionB", "Version B — clearer articulation"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record Version A and B in Section E above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 9 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Clarity, not volume.</p>
        <p class="text-sm text-ink-300">Projection means being heard clearly for the situation — it isn't the same as shouting.</p>
        <p class="text-sm text-ink-100">A louder sound is not automatically a better sound.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 10 — Register Transitions and Vocal Continuity</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will continue exploring comfortable changes in vocal quality — no promise of a perfectly seamless transition, and no demanding range exercises yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Comfortable vocal clarity — the difference between easy, audible singing and forced loudness.</h3>
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

        ${chapter("understand", 1, "Section A — Welcome and concept", `
          ${narrow(`
            ${p("Projection means allowing the voice to be heard clearly for the situation. Shouting is not the same as healthy vocal projection.")}
            ${p("Clarity can be influenced by articulation, vowel shape, vocal coordination, and appropriate volume. A louder sound is not automatically a better sound — you don't need to force more air or tighten the throat to project.")}
            ${p("Think of speaking to a nearby person versus speaking to someone farther away — not shouting across a room.")}
          `)}
          ${flowStrip(["LISTEN", "ARTICULATE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("baseline", 2, "Section B — Comfortable speaking baseline", `
          ${narrow(`
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${GREETING}”</p>
            ${p("Say it naturally, then repeat it at the same comfortable volume. Notice whether the words are clear. Relax the jaw and shoulders. Rest.")}
          `)}
          ${recCard("greetingTake", "Say the greeting", "", 10)}
          ${narrow(`<div class="mt-5">${SelfAssessment.render("effortRating-q", { ...Q.effortRating, selected: sel("effortRating") })}</div>`)}
        `)}

        ${chapter("clarity", 3, "Section C — Clear words without extra volume", `
          ${narrow(`
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${PHRASE}”</p>
            ${p("Speak it naturally, then repeat it slowly with clear articulation — same comfortable volume throughout. Notice whether the words become easier to understand without speaking louder. No exaggerated consonants or jaw movements.")}
          `)}
          ${recCard("clarityTake", "Natural, then slow and clear", "", 15)}
        `)}

        ${chapter("phrase", 4, "Section D — Gentle voiced phrase", `
          ${narrow(p("Speak the phrase again, then — only if comfortable — use a gentle, comfortable pitch on a short portion of it. Don't stretch beyond a comfortable breath; allow normal breathing between attempts, and stop if the throat begins to feel tight."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("pwp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("phraseTake", "The phrase, with a short gentle pitch if comfortable", "Entirely optional.", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("phrase")}</div>`)}
        `, { wide: true })}

        ${chapter("compare", 5, "Section E — Compare comfort and clarity", `
          ${narrow(p("Two versions of the phrase: Version A — natural speaking or gentle singing at a comfortable volume. Version B — repeat with clearer word articulation, keeping approximately the same volume and effort. This is about awareness, not a perfect result."))}
          ${recCard("versionA", "Version A — natural", "", 12)}
          ${recCard("versionB", "Version B — clearer articulation, similar volume", "", 12)}
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easierToUnderstand-q", { ...Q.easierToUnderstand, selected: sel("easierToUnderstand") })}
              ${SelfAssessment.render("increasedVolume-q", { ...Q.increasedVolume, selected: sel("increasedVolume") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("secondVersionFelt-q", { ...Q.secondVersionFelt, selected: sel("secondVersionFelt") })}
            </div>
          `)}
        `)}

        ${chapter("effort", 6, "Section F — Understanding vocal effort", effortHtml())}

        ${chapter("record", 7, "Section G — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("wordsUnderstandable-q", { ...Q.wordsUnderstandable, selected: sel("wordsUnderstandable") })}
              ${SelfAssessment.render("maintainedComfortVolume-q", { ...Q.maintainedComfortVolume, selected: sel("maintainedComfortVolume") })}
              ${SelfAssessment.render("throatJawTension-q", { ...Q.throatJawTension, selected: sel("throatJawTension") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="pwp-improve">What would I like to improve gently?</label><textarea id="pwp-improve" data-growth="improveAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.improveAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on recording, loudness, perfect articulation, or completing every optional exercise.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 10, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-pwp", { placeholder: "e.g. Which version was clearer... Whether I noticed any tension... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: speak one short sentence naturally, repeat it with clear words, optionally say a small portion on a comfortable pitch, rest, then write down one observation. No need for excessive practice.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 12, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 13, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Section D: piano + playback ---- */
    own(VirtualPiano.wire(container, "pwp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      if (!e.target.closest("[data-play-pitch]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

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
    const NAMES = { greetingTake: "Greeting", clarityTake: "Clear articulation", phraseTake: "Phrase with pitch", versionA: "Version A — natural", versionB: "Version B — clearer articulation" };
    const MAX_SECONDS = { greetingTake: 10, clarityTake: 15, phraseTake: 15, versionA: 12, versionB: 12 };
    const REVIEW_KEYS = ["versionA", "versionB"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 9 — ${NAMES[k]}`, exercise: `projection-without-pushing-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section G: play-to-review ---- */
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
      "effortRating-q": "effortRating", "easierToUnderstand-q": "easierToUnderstand", "increasedVolume-q": "increasedVolume",
      "tensionNoticed-q": "tensionNoticed", "secondVersionFelt-q": "secondVersionFelt",
      "wordsUnderstandable-q": "wordsUnderstandable", "maintainedComfortVolume-q": "maintainedComfortVolume", "throatJawTension-q": "throatJawTension",
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

    /* ---- growth textarea ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => set("growth", key, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- Section I: completion checklist ---- */
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
    own(PersonalNotes.wire(container, "notes-pwp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Projection means being heard clearly for the situation — it isn't the same as shouting, and a louder sound isn't automatically a better one.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Noticed some jaw/throat tension." : "",
        toPractice: A(rec, "growth").improveAgain || "",
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
