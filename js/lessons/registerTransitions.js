/* ============================================================
   LEVEL 2, CLASS 14 — REGISTER TRANSITIONS AND COORDINATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "register-transitions".

   Curriculum identity: Level 2, Class 14 (`number: 14`, `levelId: 2`
   in data.js, explicit id `L2C10` — the original id from before the
   Level 2 Curriculum Upgrade, kept stable so existing progress isn't
   orphaned by the renumbering). Originally "Register Transitions and
   Vocal Continuity"; the Curriculum Upgrade merged the old, separate
   "Register Coordination Practice" class (formerly `L2C18`) into this
   one rather than dropping it, per the user's explicit decision —
   its lower/higher-area and transition exploration now lives in this
   file's Section F, and its own file has been deleted.

   Core idea: "A noticeable transition or voice break is not
   automatically a failure... Vocal continuity develops gradually
   through practice," now explicitly extended to register coordination
   — chest voice, head voice and mixed coordination are terms for
   coordination patterns, not literal production locations. Neither
   topic promises seamless transitions, a "mixed voice" sound, or
   perfect register blending from one lesson.

   Honesty boundaries, matching every earlier class: no fabricated
   register-detection or vocal-quality analysis; completion never
   depends on perfect pitch, smooth transitions, a recording, or
   finishing every optional activity.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. Section F reuses Section C's own
   reference note (via PianoSynth.playSequence over relative
   semitone degrees, the same primitive the old Register Coordination
   Practice file used) rather than wiring a second piano.
   ============================================================ */

const RegisterTransitionsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "baseline", label: "Baseline" },
    { id: "pitch", label: "Pitch" },
    { id: "glide", label: "Glide" },
    { id: "continuity", label: "Continuity" },
    { id: "coordination", label: "Coordination" },
    { id: "breaks", label: "Breaks" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2; // the coordination pattern below needs headroom for two steps up, not just one glide step
  const SENTENCE = "I am exploring my voice today.";
  const COORD_PATTERNS = {
    higher: [0, 1, 0],
    transition: [0, 1, 0],
    three: [0, 1, 2, 1, 0],
  };
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  const CHECKLIST_ITEMS = [
    { key: "pitchExplored", label: "I explored a comfortable reference pitch." },
    { key: "glideExplored", label: "I tried a small glide or chose to skip it." },
    { key: "noticedWithoutForcing", label: "I noticed changes without forcing them." },
    { key: "triedCoordination", label: "I explored the lower/higher area and transition, or chose to skip it." },
    { key: "tensionChecked", label: "I checked for tension and comfort." },
    { key: "reflectionRecorded", label: "I recorded a reflection or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    glideFelt: {
      question: "How did the glide feel compared with the separate sounds?",
      options: [opt("easier", "Easier than expected", "good"), opt("similar", "Similar to the separate sounds", "good"), opt("uneven", "Uneven or difficult", "maybe"), opt("unclear", "Unclear")],
    },
    noticedChange: { question: "Did I notice a change in sound?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    glideComfortable: { question: "Was the glide comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    triedToForce: { question: "Did I try to force the transition?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did I feel tension in my jaw, neck, or throat?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    mostComfortableArea: { question: "Which pitch area felt most comfortable overall?", options: [opt("lower", "The lower area"), opt("higher", "The higher area"), opt("both", "Both, about equally"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
  const recCard = (k, title, hint, max = 12) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function continuityHtml(rec) {
    const glide = take(rec, "glideTake");
    if (!glide) return `<p class="text-sm text-ink-500">Record your small glide in Section D above, then come back here to compare it with two separate sounds.</p>`;
    return `<button type="button" data-play-glide-again class="vr-btn mb-4">${icon("play", "w-3.5 h-3.5")} Play my glide from Section D</button>`;
  }

  function problems() {
    const items = [
      ["Trying to remove every voice break", "Explore small pitch changes without forcing the result."],
      ["Increasing volume during a difficult transition", "Return to a comfortable volume and reduce the pitch movement."],
      ["Repeating a difficult glide many times", "Rest, shorten the exercise, or skip it."],
      ["Assuming every singer's transitions feel identical", "Vocal experiences vary."],
      ["Judging the session by perfection", "Learning to observe your voice is meaningful progress."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [["spokenSentence", "Spoken sentence"], ["separateTake", "Two separate “oo” sounds"], ["glideTake", "Small glide"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the sounds above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 14 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Noticing, not eliminating.</p>
        <p class="text-sm text-ink-300">A noticeable transition or voice break is not automatically a failure.</p>
        <p class="text-sm text-ink-100">Vocal continuity and register coordination both develop gradually, through practice — not in one lesson.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 15 — Controlled Range Development</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore comfortable pitch range gradually — no forced high or low notes, and no demanding range extensions yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Noticing changes in vocal quality and exploring how lower and higher coordination connect.</h3>
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

        ${chapter("understand", 1, "Section A — Welcome and review", `
          ${narrow(`
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Chest Voice Foundations explored comfortable, speech-like sounds.", "Head Voice Foundations explored lighter sounds.", "Connecting Chest &amp; Head Voice introduced small transitions.", "Mixed Coordination introduced the idea of balancing vocal qualities.", "Projection Without Pushing focused on clarity without forced loudness."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            ${p("This class focuses on noticing changes, not eliminating every difference between vocal qualities.")}
          `)}
          ${flowStrip(["LISTEN", "EXPLORE", "NOTICE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("baseline", 2, "Section B — Relaxed baseline", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Sit or stand comfortably.", "Relax the shoulders and jaw.", "Say a short sentence naturally — e.g. “" + SENTENCE + "”", "Make one gentle “mmm” sound if comfortable.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-4">Natural breathing throughout — no breath-holding or strenuous breathing exercises.</p>
          `)}
        `)}

        ${chapter("pitch", 3, "Section C — Gentle pitch exploration", `
          ${narrow(p("Listen to a comfortable reference note and imitate it gently. If comfortable, explore one nearby note slightly higher, then return to the original note. Rest. Never aim for your highest or lowest note."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("rt-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} Slightly higher, then return</button>
          </div>
          ${recCard("pitchTake", "Imitate the note, if comfortable", "Entirely optional.", 12)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
        `, { wide: true })}

        ${chapter("glide", 4, "Section D — Small vocal glide", `
          ${narrow(`
            ${p("A short “oo” glide: begin at a comfortable pitch, move a little higher, then return gently. Keep the sound easy and the volume comfortable. Rest between attempts, repeating no more than two or three times if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">If the voice changes suddenly, cracks, or feels uneven — just notice it, without forcing the sound through. You can also simply speak “oo” naturally and skip the glide.</p>
          `)}
          ${recCard("glideTake", "Small “oo” glide", "", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("glide")}</div>`)}
        `)}

        ${chapter("continuity", 5, "Section E — Explore continuity gently", `
          ${narrow(p("Only if comfortable: compare two short, separate “oo” sounds at nearby pitches with one gentle glide between those same pitches."))}
          ${recCard("separateTake", "Two separate “oo” sounds, at nearby pitches", "", 10)}
          <div data-continuity-host>${continuityHtml(rec)}</div>
          ${narrow(`
            <div class="mt-5">${SelfAssessment.render("glideFelt-q", { ...Q.glideFelt, selected: sel("glideFelt") })}</div>
            <p class="text-xs text-ink-500 mt-2">None of these answers is wrong — the purpose is to notice what happens, not to achieve a particular result.</p>
          `)}
        `)}

        ${chapter("coordination", 6, "Section F — Lower and higher area coordination", `
          ${narrow(`
            ${p("“Chest voice” and “head voice” are terms musicians use for different patterns of coordination and sensation across your range — they don't mean the sound is literally produced in your chest or your head. “Mixed coordination” describes a more balanced transition between the two.")}
            ${p("Using the same reference note from Section C, listen to a lighter area above it and a gentle transition between the two. Then, if comfortable, try a short optional pattern that moves a little further.")}
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-coord="higher" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen: higher area</button>
            <button type="button" data-play-coord="transition" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen: transition</button>
          </div>
          ${narrow(p("This optional short pattern moves a little further — try it only if the above felt comfortable."))}
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <button type="button" data-play-coord="three" class="vr-btn">${icon("play", "w-4 h-4")} Listen: short pattern</button>
          </div>
          ${recCard("coordinationTake", "A gentle exploration: reference note, higher area, and transition", "Entirely optional.", 20)}
          ${narrow(`<div class="mt-3">${skipBtn("coordination")}</div>`)}
          ${narrow(`<div class="mt-4">${SelfAssessment.render("mostComfortableArea-q", { ...Q.mostComfortableArea, selected: sel("mostComfortableArea") })}</div>`)}
        `)}

        ${chapter("breaks", 7, "Section G — Understand voice breaks and transitions", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["The voice may change in quality as pitch changes.", "A transition may feel smooth, noticeable, or uneven.", "The amount of change varies between singers and exercises.", "A voice break does not automatically indicate damage or incorrect technique.", "Persistent discomfort or pain should never be ignored.", "Mixed coordination and smoother transitions develop gradually."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
        `)}

        ${chapter("record", 8, "Section H — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          ${recCard("spokenSentence", "A short spoken sentence", "", 10)}
          <div data-review-host class="mt-2">${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("noticedChange-q", { ...Q.noticedChange, selected: sel("noticedChange") })}
              ${SelfAssessment.render("glideComfortable-q", { ...Q.glideComfortable, selected: sel("glideComfortable") })}
              ${SelfAssessment.render("triedToForce-q", { ...Q.triedToForce, selected: sel("triedToForce") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rt-again">What would I like to explore again?</label><textarea id="rt-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 9, "Section I — Common beginner mistakes", problems())}

        ${chapter("reflect", 10, "Section J — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, smooth transitions, recording, or completing optional activities.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 11, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-rt", { placeholder: "e.g. Whether the glide felt uneven anywhere... How it compared to the separate sounds... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Section K — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say a short sentence naturally, make one comfortable “oo,” try one small glide if comfortable, then rest and write down one observation. No need for excessive repetitions or practice through discomfort.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Section C: piano + playback ---- */
    own(VirtualPiano.wire(container, "rt-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + MAX_UP * STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

    /* ---- Section F: lower/higher area coordination playback ---- */
    function onPlayCoord(e) {
      const btn = e.target.closest("[data-play-coord]");
      if (!btn) return;
      const degrees = COORD_PATTERNS[btn.dataset.playCoord];
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.75, gap: 0.3 });
    }
    container.addEventListener("click", onPlayCoord);
    cleanups.push(() => container.removeEventListener("click", onPlayCoord));

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
    function refreshContinuityHost() {
      const host = $("[data-continuity-host]");
      if (host) host.innerHTML = continuityHtml(rec0());
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = { pitchTake: "Pitch exploration", glideTake: "Small glide", separateTake: "Two separate “oo” sounds", coordinationTake: "Lower/higher area and transition", spokenSentence: "Spoken sentence" };
    const MAX_SECONDS = { pitchTake: 12, glideTake: 10, separateTake: 10, coordinationTake: 20, spokenSentence: 10 };
    const REVIEW_KEYS = ["spokenSentence", "separateTake", "glideTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 14 — ${NAMES[k]}`, exercise: `register-transitions-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (k === "glideTake") refreshContinuityHost();
          if (REVIEW_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section E: play glide again, Section G: play-to-review ---- */
    function onPlayGlideAgain(e) {
      if (!e.target.closest("[data-play-glide-again]")) return;
      const t = take(rec0(), "glideTake");
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayGlideAgain);
    cleanups.push(() => container.removeEventListener("click", onPlayGlideAgain));
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "glideFelt-q": "glideFelt", "noticedChange-q": "noticedChange", "glideComfortable-q": "glideComfortable", "triedToForce-q": "triedToForce", "tensionNoticed-q": "tensionNoticed", "mostComfortableArea-q": "mostComfortableArea" };
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
    own(PersonalNotes.wire(container, "notes-rt", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "A noticeable transition or voice break is not automatically a failure — vocal continuity develops gradually, through practice.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Noticed some jaw/neck/throat tension." : "",
        toPractice: A(rec, "growth").exploreAgain || "",
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
