/* ============================================================
   LEVEL 2, CLASS 5 — CONNECTING CHEST & HEAD VOICE (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "connecting-chest-head".

   Curriculum identity: Level 2, Class 5 (`number: 5`, `levelId: 2`
   in data.js, id `L2C05`). Same mechanism Classes 1-4 already
   proved four times over.

   **Level 2's class count grows past its originally-assumed 10 —
   the same pattern Level 1 went through five separate times
   (Classes 21-25).** The original `levelClassDefs[2]` placeholder
   list put "Mixed Voice" directly after Head Voice Foundations
   (position 5). This spec inserts "Connecting Chest & Head Voice"
   there instead, and its own Section K explicitly names the real
   next class as "Class 6 — Introduction to Mixed Coordination" —
   not plain "Mixed Voice". So `levelClassDefs[2].titles` had its
   first entry renamed (not removed — Level 2 now has at least 11
   classes, not 10) and `startNumber` moved from 5 to 6. Treat this
   count as provisional, exactly as every Level 1 change log entry
   from Class 20 onward already treated that level's count.

   Core idea: "Chest voice and head voice are useful descriptions of
   vocal coordination, not separate sound sources located in the
   chest and head... Transitions may feel uneven or produce a voice
   break while learning... ease, comfort, and gradual exploration
   matter more than producing a perfect transition." Explicitly does
   NOT promise a seamless register transition from one short lesson,
   and explicitly defers "mix voice" to a later skill.

   Honesty boundaries, matching every earlier class: no fabricated
   register/transition analysis; completion never depends on perfect
   pitch, a smooth glide, a successful recording, or finishing every
   optional exercise (the spec says this explicitly).

   Like Classes 3-4, Section I is five plain first-person
   self-attestations, so this file reuses their plain-checkbox
   completion pattern (Class 10's original `PRE_CHECK_ITEMS` style)
   rather than exercise-derived checkpoints.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. The "skip this exercise" button and
   the "reuse an earlier recording instead of asking again" pattern
   (Section G reuses Section C's "ah" and Section D's glide) are both
   reused exactly as Classes 1-4 established them.
   ============================================================ */

const ConnectingChestHeadLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "compare", label: "Compare" },
    { id: "glide", label: "Glide" },
    { id: "explore", label: "Explore" },
    { id: "transition", label: "Transition" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";

  const CHECKLIST_ITEMS = [
    { key: "reviewed", label: "I reviewed the difference between speech-like and lighter sounds." },
    { key: "glideExplored", label: "I tried a small pitch glide or chose to skip it." },
    { key: "avoidedForcing", label: "I avoided forcing a transition." },
    { key: "checkedComfort", label: "I checked for tension and comfort." },
    { key: "reflectionRecorded", label: "I recorded a reflection or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    compareSounds: {
      question: "Did the two sounds feel different, or similar?",
      options: [opt("different", "They felt different"), opt("similar", "They felt similar"), opt("harder", "One was harder to produce", "maybe"), opt("unsure", "I'm not sure")],
    },
    exploreChoice: { question: "Which would you like to try?", options: [opt("oo", "Gentle “oo” glide"), opt("trill", "Gentle lip trill")] },
    easiestSound: { question: "Which sound felt easiest?", options: [opt("ah", "“ah”"), opt("oo", "“oo”"), opt("sentence", "The spoken sentence"), opt("notsure", "Not sure")] },
    qualityChangeNoticed: { question: "Did I notice a change in vocal quality?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    unevenAnywhere: { question: "Did my voice feel uneven anywhere?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    remainedRelaxed: { question: "Did I remain relaxed?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
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

  function transitionCompareHtml() {
    return `<div class="grid sm:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-3">Helpful approach</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Small pitch movements", "Comfortable volume", "Relaxed jaw and neck", "Rest between attempts"].map((t) => `<li class="flex gap-2"><span class="text-emerald-300">✓</span>${t}</li>`).join("")}</ul>
      </div>
      <div class="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-3">Avoid</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Pushing higher or lower", "Shouting through a voice break", "Squeezing the throat", "Repeating a difficult glide until tired"].map((t) => `<li class="flex gap-2"><span class="text-amber-300">✕</span>${t}</li>`).join("")}</ul>
      </div>
    </div>`;
  }

  function problems() {
    const items = [
      ["Trying to eliminate every voice break", "Notice what happens without forcing the voice to change."],
      ["Increasing volume to get through a transition", "Return to comfortable volume and reduce the pitch movement."],
      ["Trying to sound like a professional singer", "Focus on learning what feels easy and repeatable."],
      ["Continuing after the voice feels tired", "Stop and rest. Short, comfortable practice is enough."],
      ["Assuming the exercise failed because the sounds were similar", "Noticing similarities is also useful information."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function recordReviewHtml(rec) {
    const sources = [["ahTake", "“ah”"], ["glideTake", "Pitch glide"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return "";
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 5 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Noticing movement is enough for today.</p>
        <p class="text-sm text-ink-300">A perfectly smooth transition isn't the goal of one short lesson — gentle exploration is.</p>
        <p class="text-sm text-ink-100">Uneven, noticeable, or unchanged — all of it is useful information.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 6 — Introduction to Mixed Coordination</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will introduce the concept of mixed coordination in simple terms — no advanced belting, high-volume singing, or forceful mix exercises yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Gentle transitions between comfortable, speech-like and lighter vocal sounds.</h3>
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
    const exploreChoice = sel("exploreChoice") || "oo";

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section A — Welcome and review", `
          ${narrow(`
            ${p("Class 3 explored comfortable, speech-like vocal sounds. Class 4 introduced gentle, lighter vocal sounds. This class begins exploring how the voice may move between those different qualities.")}
            ${p("Every voice is different. You don't need to identify your registers perfectly, or feel vibration in a specific part of the body.")}
          `)}
          ${flowStrip(["REVIEW", "COMPARE", "GLIDE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — Relaxed starting point", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Sit or stand comfortably.", "Relax the shoulders and jaw.", "Say a short sentence in a natural speaking voice — e.g. “" + SENTENCE + "”", "Make one gentle “mmm” sound if comfortable.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-4">No demanding breathing exercises — breathe normally, and never hold your breath.</p>
          `)}
        `)}

        ${chapter("compare", 3, "Section C — Compare two comfortable sounds", `
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Sound A — Comfortable speech-like sound</p>
            ${p("Say “hello” naturally. Optionally sustain a gentle “ah” for around two seconds — without deliberately making it louder or lower.")}
          `)}
          ${recCard("ahTake", "“hello” → gentle “ah”", "", 10)}
          ${narrow(`<div class="mt-3 mb-6">${skipBtn("ah")}</div>`)}
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Sound B — Gentle, lighter sound</p>
            ${p("Say “oo” comfortably — soft but easy and clear. Don't force a high pitch.")}
          `)}
          ${recCard("ooTake", "Gentle “oo”", "", 10)}
          ${narrow(`
            <div class="mt-3">${skipBtn("oo")}</div>
            <div class="mt-5">${SelfAssessment.render("compareSounds-q", { ...Q.compareSounds, selected: sel("compareSounds") })}</div>
            <p class="text-xs text-ink-500 mt-2">Every answer is accepted — this isn't a test of whether you've correctly identified chest or head voice.</p>
          `)}
        `)}

        ${chapter("glide", 4, "Section D — Small pitch glide", `
          ${narrow(p("Begin with a comfortable “oo.” Move gently through a small pitch change — as if making a tiny upward-and-downward glide — then return to the starting pitch naturally. Rest. Repeat up to three times only if comfortable."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("cch-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-3">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-glide class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Hear a small glide demo</button>
          </div>
          ${narrow(`<p class="text-xs text-ink-500 mb-4">No fixed notes or universal range — never glide as high or low as possible. If the voice changes suddenly, cracks, or feels uneven, that can happen while learning — don't force the sound through it.</p>`)}
          ${recCard("glideTake", "Your small glide", "", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("glide")}</div>`)}
        `, { wide: true })}

        ${chapter("explore", 5, "Section E — Optional “oo” or lip-trill exploration", `
          ${narrow(`
            ${p("Only if comfortable, choose one to explore a little further:")}
            ${SelfAssessment.render("exploreChoice-q", { ...Q.exploreChoice, selected: exploreChoice })}
            <p class="text-xs text-ink-500 mt-2 mb-4">Lip trills aren't mandatory — if difficult, return to “oo” or skip this exercise. Never force airflow or continue if the lips or face feel tense.</p>
          `)}
          <div data-explore-rec-host>${recCard("exploreTake", exploreChoice === "trill" ? "Gentle lip trill" : "Gentle “oo” glide", "", 10)}</div>
          ${narrow(`<div class="mt-3">${skipBtn("explore")}</div>`)}
        `)}

        ${chapter("transition", 6, "Section F — Understand what a transition is", `
          ${narrow(`
            ${p("A transition is a change in how the voice coordinates as pitch or vocal quality changes. It may be smooth, uneven, or noticeable — the voice doesn't have to sound perfectly blended at this stage.")}
            ${p("“Mix voice” is a later skill and shouldn't be forced during this lesson. Louder singing is not the solution to an uneven transition.")}
          `)}
          ${transitionCompareHtml()}
        `)}

        ${chapter("record", 7, "Section G — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          ${recCard("spokenSentence", "A short spoken sentence", "", 10)}
          <div data-review-host class="mt-2">${recordReviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easiestSound-q", { ...Q.easiestSound, selected: sel("easiestSound") })}
              ${SelfAssessment.render("qualityChangeNoticed-q", { ...Q.qualityChangeNoticed, selected: sel("qualityChangeNoticed") })}
              ${SelfAssessment.render("unevenAnywhere-q", { ...Q.unevenAnywhere, selected: sel("unevenAnywhere") })}
              ${SelfAssessment.render("remainedRelaxed-q", { ...Q.remainedRelaxed, selected: sel("remainedRelaxed") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="cch-again">What would I like to try again?</label><textarea id="cch-again" data-growth="tryAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.tryAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Class reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, a smooth glide, a successful recording, or finishing every optional exercise.")}
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
          ${PersonalNotes.render("notes-cch", { placeholder: "e.g. How the “ah” compared to the “oo”... Whether the glide felt uneven anywhere... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say a short sentence naturally, make one comfortable “ah,” make one comfortable “oo,” try one small glide if it feels easy, then rest and write down one observation. No need for excessive repetitions or singing through discomfort.")}
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

    /* ---- Section D: piano + glide demo ---- */
    own(VirtualPiano.wire(container, "cch-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayGlide(e) {
      if (!e.target.closest("[data-play-glide]")) return;
      const b = base();
      PianoSynth.playSequence([b, b + STEP, b], { duration: 0.6, gap: 0.2 });
    }
    container.addEventListener("click", onPlayGlide);
    cleanups.push(() => container.removeEventListener("click", onPlayGlide));

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
    const NAMES = { ahTake: "“ah”", ooTake: "“oo”", glideTake: "Pitch glide", exploreTake: "Optional exploration", spokenSentence: "Spoken sentence" };
    const MAX_SECONDS = { ahTake: 10, ooTake: 10, glideTake: 10, exploreTake: 10, spokenSentence: 10 };
    const REVIEW_SOURCE_KEYS = ["ahTake", "glideTake"];
    function wireRecordingCard(k) {
      return RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 5 — ${NAMES[k]}`, exercise: `connecting-chest-head-${k}` },
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
      host.innerHTML = recCard("exploreTake", value === "trill" ? "Gentle lip trill" : "Gentle “oo” glide", "", 10);
      exploreApi = wireRecordingCard("exploreTake");
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
    const assessMap = { "compareSounds-q": "compareSounds", "easiestSound-q": "easiestSound", "qualityChangeNoticed-q": "qualityChangeNoticed", "unevenAnywhere-q": "unevenAnywhere", "remainedRelaxed-q": "remainedRelaxed" };
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
    own(PersonalNotes.wire(container, "notes-cch", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Transitions may feel uneven while learning, and that's normal — the goal is gentle exploration, not a perfectly blended sound.",
        struggled: q(rec, "unevenAnywhere") === "yes" || q(rec, "unevenAnywhere") === "alittle" ? "Noticed some unevenness in the transition." : "",
        toPractice: A(rec, "growth").tryAgain || "",
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
