/* ============================================================
   LEVEL 2, CLASS 6 — INTRODUCTION TO MIXED COORDINATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "intro-mixed-coordination".

   Curriculum identity: Level 2, Class 6 (`number: 6`, `levelId: 2`
   in data.js, id `L2C06`). Same mechanism Classes 1-5 already
   proved five times over. This class's own title matches the
   placeholder list's already-renamed first entry exactly (it was
   renamed from "Mixed Voice" during Class 5's turn, once that
   spec named it), so nothing needed renaming here.

   **Level 2's class count grows again.** This spec's own Section K
   previews the real Class 7 as "Vowel Modification Foundations" —
   not the placeholder list's "Vocal Range". Following the exact
   precedent Class 5's entry set (and Level 1's five times before
   that), `levelClassDefs[2].titles`' next entry was renamed in
   place, not removed. Level 2 is still provisionally 11 classes;
   only the still-unbuilt title changed.

   Core idea: "'Mix' describes coordination that balances qualities
   commonly associated with chest and head voice. It is not a
   literal 50/50 combination, and there is no single sensation that
   proves the voice is mixed... The learner does not need to produce
   a recognisable mix voice today." Explicitly: mixed coordination
   is a broad teaching term singers use somewhat differently, not
   one universal, singing-school-specific definition.

   Honesty boundaries, matching every earlier class: no fabricated
   register/mix detection; completion never depends on perfect
   pitch, a successful transition, a recording, or finishing every
   optional activity (the spec says this explicitly).

   Like Classes 3-5, Section I is five plain first-person
   self-attestations, so this file reuses their plain-checkbox
   completion pattern (Class 10's original `PRE_CHECK_ITEMS` style).

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the green/amber "helpful vs. avoid"
   comparison card (Class 3's Section F pattern), and Class 5's
   "single RecordingCard slot that relabels itself based on a prior
   choice" pattern (Section E here offers 3 options instead of 2).
   ============================================================ */

const IntroMixedCoordinationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "compare", label: "Compare" },
    { id: "pitch", label: "Pitch" },
    { id: "explore", label: "Explore" },
    { id: "notmix", label: "Not Mix" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the basic concept of mixed coordination." },
    { key: "soundsExplored", label: "I explored comfortable “ah” and “oo” sounds." },
    { key: "movementExplored", label: "I tried a small movement or chose to skip it." },
    { key: "avoidedForcing", label: "I avoided forcing loudness or pitch." },
    { key: "reflected", label: "I reflected on my comfort and effort." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    compareSounds: {
      question: "Did the “ah” and “oo” feel different, or similar?",
      options: [opt("different", "They felt different"), opt("similar", "They felt similar"), opt("easier", "One felt easier", "maybe"), opt("unsure", "I'm not sure")],
    },
    exploreChoice: {
      question: "Which would you like to try?",
      options: [opt("mmoo", "Gentle “mm-oo” transition"), opt("ngoo", "Gentle “ng-oo” transition"), opt("separate", "Easier: “ah” and “oo” separately")],
    },
    easiestSound: { question: "Which sound felt easiest?", options: [opt("ah", "“ah”"), opt("oo", "“oo”"), opt("sentence", "The spoken sentence"), opt("transition", "The transition"), opt("notsure", "Not sure")] },
    triedToForce: { question: "Did I try to force a particular sound?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did I notice tension in my jaw, neck, or throat?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;
  const EXPLORE_LABELS = { mmoo: "Gentle “mm-oo” transition", ngoo: "Gentle “ng-oo” transition", separate: "“ah” and “oo”, separately" };

  function notMixHtml() {
    return `<div class="grid sm:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-3">Helpful approach</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Comfortable volume", "Relaxed jaw and neck", "Small, manageable pitch changes", "Patient exploration", "Rest when needed"].map((t) => `<li class="flex gap-2"><span class="text-emerald-300">✓</span>${t}</li>`).join("")}</ul>
      </div>
      <div class="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-3">Avoid</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Shouting to make a sound powerful", "Forcing chest voice higher", "Forcing head voice lower", "Squeezing the throat to prevent a voice break", "Repeating difficult notes until tired", "Trying to copy advanced singers before building basic coordination"].map((t) => `<li class="flex gap-2"><span class="text-amber-300">✕</span>${t}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="text-xs text-ink-500 mt-3">A voice break is not a failure, and increasing volume is not the solution to every transition.</p>`;
  }

  function problems() {
    const items = [
      ["Trying to create a powerful mix immediately", "Begin with easy, quiet sounds."],
      ["Thinking mix means exactly half chest voice and half head voice", "It describes a coordination, not a mathematical ratio."],
      ["Forcing the voice to avoid every break", "Explore small movements and allow natural changes."],
      ["Assuming a certain vibration proves correct technique", "Sensations differ, so comfort and repeatability matter more."],
      ["Practising until the voice is tired", "Stop early and rest."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function recordReviewHtml(rec) {
    const sources = [["ahTake", "“ah”"], ["ooTake", "“oo”"], ["exploreTake", "Transition"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return "";
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 6 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Coordination, not a recipe.</p>
        <p class="text-sm text-ink-300">A recognisable "mix" isn't the goal of one lesson — patient, comfortable exploration is.</p>
        <p class="text-sm text-ink-100">No single sensation proves anything. Comfort and repeatability matter more.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 7 — Vowel Modification Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will introduce how vowel shapes can affect the sound and ease of singing — no advanced vowel modification or high-note techniques yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A broad, gentle introduction to mixed coordination — no forcing, no single right sensation.</h3>
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
    const exploreChoice = sel("exploreChoice") || "mmoo";

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section A — Welcome and concept", `
          ${narrow(`
            ${p("Class 3 explored comfortable, speech-like sounds. Class 4 introduced lighter vocal sounds. Class 5 explored small transitions between different vocal qualities. Now we introduce mixed coordination.")}
            ${p("Singers often use “mix” to describe coordination that balances qualities commonly associated with chest and head voice. It is not a literal 50/50 combination, and there is no single sensation that proves the voice is mixed.")}
            ${p("A mix does not have to be loud, powerful, or high. You don't need to produce a recognisable mix voice today — this is a broad teaching term, and singers may use it somewhat differently.")}
          `)}
          ${flowStrip(["REVIEW", "COMPARE", "EXPLORE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — Comfortable baseline", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax the jaw and shoulders.", "Say a short sentence naturally — e.g. “" + SENTENCE + "”", "Make one easy “mmm” sound, if comfortable.", "Rest and check for tension."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-4">Keep breathing natural — no breath-holding or strenuous breathing exercises.</p>
          `)}
        `)}

        ${chapter("compare", 3, "Section C — Compare comfortable “ah” and “oo” sounds", `
          ${narrow(p("A gentle, short “ah” near a comfortable speaking pitch, then a gentle, short “oo” at a comfortable pitch — a brief rest between attempts, two or three repetitions at most."))}
          ${recCard("ahTake", "Gentle “ah”", "", 10)}
          ${narrow(`<div class="mt-3 mb-6">${skipBtn("ah")}</div>`)}
          ${recCard("ooTake", "Gentle “oo”", "", 10)}
          ${narrow(`
            <div class="mt-3">${skipBtn("oo")}</div>
            <div class="mt-5">${SelfAssessment.render("compareSounds-q", { ...Q.compareSounds, selected: sel("compareSounds") })}</div>
            <p class="text-xs text-ink-500 mt-2">Every answer is accepted — these aren't being labelled as definite vocal registers based only on sensation.</p>
          `)}
        `)}

        ${chapter("pitch", 4, "Section D — Small, comfortable pitch movement", `
          ${narrow(p("Listen to a comfortable reference note, then imitate it without forcing. If comfortable, move slightly upward and return. Rest after each attempt. Repeat no more than two or three times."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("imc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="up" class="vr-btn">${icon("play", "w-4 h-4")} Slightly upward, then return</button>
          </div>
          ${recCard("pitchTake", "Imitate the note, if comfortable", "Entirely optional.", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
        `, { wide: true })}

        ${chapter("explore", 5, "Section E — Explore ease rather than force", `
          ${narrow(`
            ${p("Only if comfortable and suitable: a gentle, short “mm-oo” or “ng-oo” transition, quiet and easy, with a small pitch movement if any. Avoid pressing the sound forward, squeezing the throat, or pushing volume. Rest between attempts, and stop if tension develops.")}
            ${SelfAssessment.render("exploreChoice-q", { ...Q.exploreChoice, selected: exploreChoice })}
            <p class="text-xs text-ink-500 mt-2 mb-4">The easier alternative — “ah” and “oo” separately, not connected — is just as valid. You're exploring coordination, not producing a true mixed sound today.</p>
          `)}
          <div data-explore-rec-host>${recCard("exploreTake", EXPLORE_LABELS[exploreChoice], "", 10)}</div>
          ${narrow(`<div class="mt-3">${skipBtn("explore")}</div>`)}
        `)}

        ${chapter("notmix", 6, "Section F — What mixed coordination is not", notMixHtml())}

        ${chapter("record", 7, "Section G — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          ${recCard("spokenSentence", "A short spoken sentence", "", 10)}
          <div data-review-host class="mt-2">${recordReviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easiestSound-q", { ...Q.easiestSound, selected: sel("easiestSound") })}
              ${SelfAssessment.render("triedToForce-q", { ...Q.triedToForce, selected: sel("triedToForce") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="imc-again">What would I like to practise again?</label><textarea id="imc-again" data-growth="practiceAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.practiceAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't require perfect pitch, a successful transition, a recording, or finishing every optional activity.")}
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
          ${PersonalNotes.render("notes-imc", { placeholder: "e.g. How the “ah” compared to the “oo”... Whether the transition felt forced anywhere... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say a short sentence naturally, make one comfortable “ah,” make one comfortable “oo,” try one small movement between pitches if comfortable, then rest and record one observation. No need for excessive repetitions or practice through discomfort.")}
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
    own(VirtualPiano.wire(container, "imc-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
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
      if (host) host.innerHTML = recordReviewHtml(rec0());
    }
    const NAMES = { ahTake: "“ah”", ooTake: "“oo”", pitchTake: "Pitch exploration", exploreTake: "Transition exploration", spokenSentence: "Spoken sentence" };
    const MAX_SECONDS = { ahTake: 10, ooTake: 10, pitchTake: 10, exploreTake: 10, spokenSentence: 10 };
    const REVIEW_SOURCE_KEYS = ["ahTake", "ooTake", "exploreTake"];
    function wireRecordingCard(k) {
      return RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 6 — ${NAMES[k]}`, exercise: `intro-mixed-coordination-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_SOURCE_KEYS.includes(k)) refreshReviewHost();
        },
      });
    }
    Object.keys(NAMES).filter((k) => k !== "exploreTake").forEach((k) => own(wireRecordingCard(k)));

    /* ---- Section E: explore choice (re-wires its own RecordingCard when the label changes) ---- */
    let exploreApi = own(wireRecordingCard("exploreTake"));
    function onExploreChoice(e) {
      const chip = e.target.closest('[data-assess="exploreChoice-q"] [data-assess-choice]');
      if (!chip) return;
      const value = chip.dataset.assessChoice;
      set("q", "exploreChoice", value);
      const host = $("[data-explore-rec-host]");
      if (exploreApi) exploreApi.destroy();
      host.innerHTML = recCard("exploreTake", EXPLORE_LABELS[value], "", 10);
      exploreApi = wireRecordingCard("exploreTake");
      if (REVIEW_SOURCE_KEYS.includes("exploreTake")) refreshReviewHost();
    }
    container.addEventListener("click", onExploreChoice);
    cleanups.push(() => { container.removeEventListener("click", onExploreChoice); if (exploreApi) exploreApi.destroy(); });

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
    const assessMap = { "compareSounds-q": "compareSounds", "easiestSound-q": "easiestSound", "triedToForce-q": "triedToForce", "tensionNoticed-q": "tensionNoticed" };
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
    own(PersonalNotes.wire(container, "notes-imc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Mixed coordination is a broad teaching term, not a literal 50/50 split or a single sensation to prove — comfort and repeatability matter more than one perfect sound.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Noticed some jaw/neck/throat tension." : "",
        toPractice: A(rec, "growth").practiceAgain || "",
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
