/* ============================================================
   LEVEL 2, CLASS 3 — CHEST VOICE FOUNDATIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "chest-voice-foundations".

   Curriculum identity: Level 2, Class 3 (`number: 3`, `levelId: 2`
   in data.js, id `L2C03`). Same mechanism Classes 1 and 2 (Voice
   Placement, Resonance) already proved twice over — `LessonKit
   .header()` renders "LEVEL {levelId} · CLASS {number}" directly,
   no special-casing. Its 7 remaining "Vocal Technique" siblings
   (Head Voice through First Performance Assessment) remain
   untouched `comingSoon` placeholders, renumbered 4-10.

   Core idea: "Chest voice is a commonly used term for a vocal
   coordination often associated with comfortable speaking and
   lower-to-middle singing pitches... The name does not mean that
   sound is produced only in the chest. There is no need to search
   for a particular physical sensation or force the voice to feel a
   certain way." Same gentle, 10-15 minute pacing as Classes 1-2 —
   no chest/head/mixed classification claims, no forced low notes.

   Honesty boundaries, matching every earlier class: no fabricated
   vocal analysis; completion never depends on recording quality,
   pitch accuracy, or finishing every optional exercise (the spec
   says this explicitly, in those words).

   Unlike Classes 1 and 2, this spec's Section I is phrased as plain,
   literal first-person self-attestations ("I understand...", "I
   explored...", "I tried...", "I avoided...", "I recorded... or
   chose not to") rather than exercise-derived checkpoints. Rather
   than infer these from deep exercise-completion logic (Class 1 and
   2's approach), this file takes the spec at its word: Section I is
   five plain checkboxes the learner ticks themselves — the same
   manual self-report pattern Class 10's `PRE_CHECK_ITEMS` already
   established — which is also the most literal reading of "Keep
   recording optional... Completion must not depend on... completing
   every optional exercise." The six lettered exercise sections
   (A-F) are still fully built per the spec; they just don't gate
   completion the way Classes 1-2's exercises did.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. The "skip this exercise" button and
   the Section G "reuse earlier recordings instead of asking again"
   pattern are both reused exactly as Classes 1-2 established them.
   ============================================================ */

const ChestVoiceFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "hum", label: "Hum" },
    { id: "vowel", label: "Vowel" },
    { id: "pitch", label: "Pitch" },
    { id: "compare", label: "Compare" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const GREETING = "Hello, how are you?";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the basic idea of chest voice." },
    { key: "speakingExplored", label: "I explored a comfortable speaking voice." },
    { key: "hummed", label: "I tried a gentle voiced sound, or chose to skip it." },
    { key: "avoidedForcing", label: "I avoided forcing loudness and low pitches." },
    { key: "recorded", label: "I recorded a sample, or chose not to record." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    speakingCheck: { question: "How did that feel?", options: [opt("comfortable", "Comfortable", "good"), opt("effortful", "Slightly effortful", "maybe"), opt("unsure", "Not sure")] },
    mostComfortableSound: { question: "Which sound felt most comfortable?", options: [opt("speak", "Speaking"), opt("hum", "Gentle “mmm”"), opt("mmmah", "“mmm-ah”"), opt("notsure", "Not sure")] },
    tensionNoticed: { question: "Did I notice any throat, jaw, or neck tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    triedLouderDeeper: { question: "Did I try to make my voice louder or deeper?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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

  function compareHtml() {
    return `<div class="grid sm:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-emerald-300 mb-3">Comfortable chest-voice exploration</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Easy, speech-like sound", "Relaxed jaw and throat", "Comfortable breathing", "No need for extra loudness"].map((t) => `<li class="flex gap-2"><span class="text-emerald-300">✓</span>${t}</li>`).join("")}</ul>
      </div>
      <div class="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
        <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-3">What to avoid</p>
        <ul class="flex flex-col gap-2 text-sm text-ink-200">${["Shouting to make the voice sound stronger", "Pushing the voice down to sound deeper", "Tightening the neck or jaw", "Holding the breath", "Continuing through pain or discomfort"].map((t) => `<li class="flex gap-2"><span class="text-amber-300">✕</span>${t}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="text-xs text-ink-500 mt-3">These are beginner observations, not a diagnosis of your vocal technique.</p>`;
  }

  function problems() {
    const items = [
      ["Making the voice louder to find chest voice", "Return to comfortable speaking volume."],
      ["Forcing the lowest possible note", "Stay near a comfortable speaking pitch."],
      ["Expecting everyone to feel vibration in the same place", "Sensations vary; comfort matters more."],
      ["Trying to make every repetition sound perfect", "Explore gently and observe what happens."],
      ["Continuing when the throat feels uncomfortable", "Stop, rest, and skip the exercise if needed."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function recordReviewHtml(rec) {
    const sources = [["speakGreeting", "Greeting"], ["humTake", "Gentle “mmm”"], ["mmmAhTake", "“mmm-ah”"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record the greeting, hum or “mmm-ah” above — then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 3 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">A comfortable, speech-like sound is the whole goal.</p>
        <p class="text-sm text-ink-300">Chest voice isn't a sensation to search for — it's an easy coordination you already use when you speak.</p>
        <p class="text-sm text-ink-100">No forcing, no searching for vibration. Just comfort.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 4 — Head Voice Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore a different vocal coordination through gentle, comfortable sounds — no advanced head-voice exercises yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A comfortable, speech-like vocal quality — no forcing, no searching for a sensation.</h3>
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

        ${chapter("understand", 1, "Section A — Welcome and preparation", `
          ${narrow(`
            ${p("Chest voice is a commonly used term for a vocal coordination often associated with comfortable speaking and lower-to-middle singing pitches.")}
            ${p("Some singers notice vibration or resonance sensations around the chest, but these sensations differ between people. The name does not mean sound is produced only in the chest.")}
            ${p("There is no need to search for a particular physical sensation or force the voice to feel a certain way. Sit or stand comfortably, relax your jaw and shoulders, and use your normal speaking volume.")}
          `)}
          ${flowStrip(["LISTEN", "EXPLORE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — Listen to your speaking voice", `
          ${narrow(`
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${GREETING}”</p>
            ${p("Say it in a comfortable speaking voice, then repeat it naturally without deliberately making the voice deeper or louder. Notice whether the sound feels easy, strained, breathy or pressed. Rest briefly.")}
          `)}
          ${recCard("speakGreeting", "Say the greeting", "", 10)}
          ${narrow(`<div class="mt-4">${SelfAssessment.render("speakingCheck-q", { ...Q.speakingCheck, selected: sel("speakingCheck") })}</div>`)}
        `)}

        ${chapter("hum", 3, "Section C — Gentle voiced sound", `
          ${narrow(`
            ${p("An ordinary, comfortable breath. Say “mmm” as if naturally acknowledging something pleasant — quiet and easy for about 2–3 seconds. Rest and repeat up to three times if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">The purpose is to explore an easy voiced sound — not to make it louder, deeper or more resonant. Stop if the throat feels tight.</p>
          `)}
          ${recCard("humTake", "Gentle “mmm”", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("hum")}</div>`)}
        `)}

        ${chapter("vowel", 4, "Section D — Speaking into a simple vowel", `
          ${narrow(`
            ${p("Say “mmm,” then gently open into “ah” — “mmm-ah.” Keep the pitch near your comfortable speaking range. Repeat only two or three times, resting between attempts, and compare the transition with ordinary speech.")}
            <p class="text-xs text-ink-500 mb-4">Don't push the sound downward or hold the vowel for as long as possible. If “ah” feels uncomfortable, return to normal speech or skip this exercise.</p>
          `)}
          ${recCard("mmmAhTake", "“mmm-ah”", "", 12)}
          ${narrow(`<div class="mt-3">${skipBtn("vowel")}</div>`)}
        `)}

        ${chapter("pitch", 5, "Section E — Gentle pitch exploration", `
          ${narrow(p("One comfortable reference note at a time — listen before attempting to imitate it. Matching the note is optional, and comfortable pitches differ between voices, so explore only a small, comfortable range. Never force a low note or imitate one that feels uncomfortable."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("cv-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("pitchTake", "Hum or imitate the note, if comfortable", "Entirely optional.", 12)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
        `, { wide: true })}

        ${chapter("compare", 6, "Section F — Understand the difference", compareHtml())}

        ${chapter("record", 7, "Section G — Listen back and reflect", `
          ${narrow(p("Listen back to your greeting, hum and “mmm-ah” from above, and reflect honestly. Recording is optional throughout — nothing here is automatically analyzed."))}
          <div data-review-host>${recordReviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("mostComfortableSound-q", { ...Q.mostComfortableSound, selected: sel("mostComfortableSound") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("triedLouderDeeper-q", { ...Q.triedLouderDeeper, selected: sel("triedLouderDeeper") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="cv-again">What would I like to explore again?</label><textarea id="cv-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Personal reflection and completion", `
          ${narrow(`
            ${p("A simple end-of-class checklist — tick what's true for you. Completion doesn't depend on perfect pitch, a successful recording, or finishing every optional exercise.")}
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
          ${PersonalNotes.render("notes-cv", { placeholder: "e.g. How the greeting felt compared to “mmm”... Any tension I noticed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say one short sentence naturally, try two comfortable “mmm-ah” repetitions, rest, and write down one observation. No need to practise daily or through discomfort.")}
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

    /* ---- Section E: piano + playback ---- */
    own(VirtualPiano.wire(container, "cv-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      if (!e.target.closest('[data-play-pitch="base"]')) return;
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
      if (host) host.innerHTML = recordReviewHtml(rec0());
    }
    const NAMES = { speakGreeting: "Greeting", humTake: "Gentle “mmm”", mmmAhTake: "“mmm-ah”", pitchTake: "Pitch exploration" };
    const MAX_SECONDS = { speakGreeting: 10, humTake: 15, mmmAhTake: 12, pitchTake: 12 };
    const REVIEW_SOURCE_KEYS = ["speakGreeting", "humTake", "mmmAhTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 3 — ${NAMES[k]}`, exercise: `chest-voice-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_SOURCE_KEYS.includes(k)) refreshReviewHost();
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
    const assessMap = { "speakingCheck-q": "speakingCheck", "mostComfortableSound-q": "mostComfortableSound", "tensionNoticed-q": "tensionNoticed", "triedLouderDeeper-q": "triedLouderDeeper" };
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
      const list = { ...checklist(rec0()) };
      list[cb.dataset.checklist] = cb.checked;
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
    own(PersonalNotes.wire(container, "notes-cv", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Chest voice is just a comfortable, speech-like coordination — not a sensation to chase or a reason to force volume or low pitches.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Some throat/jaw/neck tension noticed." : "",
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
