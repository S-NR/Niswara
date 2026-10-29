/* ============================================================
   LEVEL 2, CLASS 8 — RESONANCE AND TONE COLOUR (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "resonance-tone-colour".

   Curriculum identity: Level 2, Class 8 (`number: 8`, `levelId: 2`
   in data.js, id `L2C08`). Same mechanism Classes 1-7 already
   proved seven times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Dynamics" during Class 7's turn), so nothing needed renaming to
   add Class 8 itself.

   **Level 2's class count grows a fourth time.** This spec's own
   Section K previews the real Class 9 as "Projection Without
   Pushing" — not the placeholder list's "Expression". Following the
   same precedent Classes 5, 6 and 7 all set (and Level 1's five
   times before that), `levelClassDefs[2].titles`' next entry was
   renamed in place, not removed.

   Core idea: "Tone colour, also called timbre, is the quality that
   helps distinguish one voice or sound from another... A brighter
   tone is not automatically better than a warmer tone... words such
   as 'bright,' 'warm,' 'dark,' and 'light' are descriptive listening
   terms, not rigid categories or medical assessments." Directly
   continues Class 2 (Resonance) and Class 7 (Vowel Modification) —
   this class's own Section A explicitly connects back to both.

   Honesty boundaries, matching every earlier class: no fabricated
   tone-colour/voice-quality analysis; completion never depends on
   producing a particular tone colour, a recording, or finishing
   every optional activity (the spec says this explicitly).

   Section I is five plain first-person self-attestations again, so
   this file reuses Classes 3-7's plain-checkbox completion pattern
   (Class 10's original `PRE_CHECK_ITEMS` style).

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, Class 7's "one exercise card per
   vowel" grid pattern (Section C, 4 vowels this time). Section E
   reuses Section D's own two "ah" recordings rather than asking
   again — the spec's own instructions describe literally the same
   two takes — and Section G needs zero new recordings at all, since
   every one of its 4 requested sounds was already captured earlier
   in the same lesson (Sections B, C and D).
   ============================================================ */

const ResonanceToneColourLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "vowels", label: "Vowels" },
    { id: "explore", label: "Explore" },
    { id: "contrast", label: "Contrast" },
    { id: "singing", label: "Singing" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";
  const VOWELS = [
    { key: "ah", label: "“Ah”" },
    { key: "oh", label: "“Oh”" },
    { key: "oo", label: "“Oo”" },
    { key: "ee", label: "“Ee”" },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the basic meaning of tone colour." },
    { key: "vowelsExplored", label: "I explored different vowels." },
    { key: "comparisonExplored", label: "I compared two comfortable sounds or chose to skip the comparison." },
    { key: "avoidedForcing", label: "I avoided forcing brightness, darkness, or volume." },
    { key: "reflected", label: "I reflected on what I noticed." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    naturalVoice: {
      question: "How did your voice seem?",
      options: [opt("light", "Light"), opt("warm", "Warm"), opt("clear", "Clear"), opt("breathy", "Breathy"), opt("hard", "Difficult to describe"), opt("unsure", "Not sure")],
    },
    clearer: { question: "Which version sounds clearer?", options: [opt("first", "The first"), opt("second", "The second"), opt("similar", "They seem similar"), opt("hard", "Difficult to describe")] },
    warmer: { question: "Which version sounds warmer to you?", options: [opt("first", "The first"), opt("second", "The second"), opt("similar", "They seem similar"), opt("hard", "Difficult to describe")] },
    similar: { question: "Do the sounds seem similar overall?", options: [opt("yes", "Yes"), opt("no", "No"), opt("unsure", "Not sure")] },
    easiestSound: { question: "Which sound felt easiest?", options: [opt("sentence", "The spoken sentence"), opt("ah", "“ah”"), opt("oo", "“oo”"), opt("variation", "The “ah” variation"), opt("notsure", "Not sure")] },
    preferredSound: { question: "Which sound did I prefer listening to?", options: [opt("sentence", "The spoken sentence"), opt("ah", "“ah”"), opt("oo", "“oo”"), opt("variation", "The “ah” variation"), opt("notsure", "Not sure")] },
    mouthShapeChanged: { question: "Did I change the mouth shape naturally?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    triedToForce: { question: "Did I try to force a different sound?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function vowelCardsHtml() {
    return `<div class="grid sm:grid-cols-2 gap-3">${VOWELS.map((v) => recCard(`${v.key}Take`, v.label, "", 8)).join("")}</div>`;
  }

  function contrastHtml(rec) {
    const a = take(rec, "ahNatural"), b = take(rec, "ahVariation");
    if (!a && !b) return `<p class="text-sm text-ink-500">Record both “ah” versions in Section D above, then come back here to compare them.</p>`;
    return `
      <div class="flex flex-wrap gap-2 mb-4">
        <button type="button" data-play-contrast="ahNatural" class="vr-btn" ${a ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} First “ah”</button>
        <button type="button" data-play-contrast="ahVariation" class="vr-btn" ${b ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} Second “ah”</button>
      </div>`;
  }

  function problems() {
    const items = [
      ["Trying to make the voice brighter by shouting", "Keep the volume comfortable."],
      ["Making the voice artificially dark or deep", "Use your natural speaking range and avoid forcing the throat."],
      ["Exaggerating vowel shapes", "Make small, comfortable adjustments."],
      ["Believing one tone colour is always correct", "Tone colour depends on musical context and personal preference."],
      ["Comparing your voice harshly with a professional singer", "Listen for your own changes rather than expecting an identical sound."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const sources = [["spokenSentence", "Spoken sentence"], ["ahTake", "“ah”"], ["ooTake", "“oo”"], ["ahVariation", "“ah” variation"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the sounds above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 8 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Noticing tone colour is enough for today.</p>
        <p class="text-sm text-ink-300">“Bright,” “warm,” “dark” and “light” are listening words, not rigid categories.</p>
        <p class="text-sm text-ink-100">A comfortable, healthy sound matters more than imitating anyone else's tone.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 9 — Projection Without Pushing</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will introduce the difference between comfortable vocal clarity and simply singing louder — no forceful projection or belting yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Exploring natural differences in vocal tone colour through comfortable sounds and small vowel changes.</h3>
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
            ${p("Tone colour, also called timbre, is the quality that helps distinguish one voice or sound from another. Two people can sing the same note at the same volume and still sound different.")}
            ${p("Vocal-tract shape, vowel choice, and vocal coordination all influence tone colour. A brighter tone is not automatically better than a warmer tone — and you don't need to change your natural voice to sound like a favourite singer.")}
            ${p("This builds on Class 2, which introduced resonance, and Class 7, which explored vowel shapes.")}
          `)}
          ${flowStrip(["LISTEN", "COMPARE", "EXPLORE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — Listen to your natural voice", `
          ${narrow(`
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${SENTENCE}”</p>
            ${p("Say it naturally, then repeat it without deliberately changing your voice. Notice whether the sound seems light, warm, clear, breathy, or difficult to describe. Rest. “Not sure” is a perfectly valid answer.")}
          `)}
          ${recCard("spokenSentence", "Say the sentence", "", 10)}
          ${narrow(`<div class="mt-5">${SelfAssessment.render("naturalVoice-q", { ...Q.naturalVoice, selected: sel("naturalVoice") })}</div>`)}
        `)}

        ${chapter("vowels", 3, "Section C — Compare comfortable vowels", `
          ${narrow(p("A comfortable speaking pitch, natural mouth movements. Notice how the sound changes as the vowel changes — no forced tongue position or mouth opening."))}
          ${vowelCardsHtml()}
        `, { wide: true })}

        ${chapter("explore", 4, "Section D — Explore gentle tone-colour changes", `
          ${narrow(p("Produce a comfortable “ah” naturally, then repeat it with a slightly different, comfortable mouth shape. Compare the two. Rest. Repeat only once if comfortable. Not louder, no squeezing the throat, no exaggerated mouth shapes — this is exploration, not a test."))}
          ${recCard("ahNatural", "“ah” — natural", "", 8)}
          ${recCard("ahVariation", "“ah” — a different, comfortable shape", "", 8)}
          ${narrow(`<div class="mt-3">${skipBtn("explore")}</div>`)}
        `)}

        ${chapter("contrast", 5, "Section E — Listen for contrast", `
          ${narrow(p("Compare your two “ah” recordings from Section D. These are subjective listening observations — there's no required answer, and you shouldn't force a bright or dark sound."))}
          <div data-contrast-host>${contrastHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("clearer-q", { ...Q.clearer, selected: sel("clearer") })}
              ${SelfAssessment.render("warmer-q", { ...Q.warmer, selected: sel("warmer") })}
              ${SelfAssessment.render("similar-q", { ...Q.similar, selected: sel("similar") })}
            </div>
          `)}
        `)}

        ${chapter("singing", 6, "Section F — Tone colour in singing", `
          ${narrow(p("Choose one comfortable reference note and explore “ah” and “oo” on it, only if comfortable. Different vowels naturally produce different sound qualities, and tone colour may change as pitch and vocal coordination change. Consistency and comfort matter more than sounding artificially bright, dark, or powerful — advanced tonal shaping comes in later training."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("rtc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("pitchToneTake", "“ah,” then “oo,” on your note — if comfortable", "Entirely optional.", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("singing")}</div>`)}
        `, { wide: true })}

        ${chapter("record", 7, "Section G — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easiestSound-q", { ...Q.easiestSound, selected: sel("easiestSound") })}
              ${SelfAssessment.render("preferredSound-q", { ...Q.preferredSound, selected: sel("preferredSound") })}
              ${SelfAssessment.render("mouthShapeChanged-q", { ...Q.mouthShapeChanged, selected: sel("mouthShapeChanged") })}
              ${SelfAssessment.render("triedToForce-q", { ...Q.triedToForce, selected: sel("triedToForce") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rtc-again">What would I like to explore again?</label><textarea id="rtc-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on producing a particular tone colour, making a recording, or completing every optional activity.")}
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
          ${PersonalNotes.render("notes-rtc", { placeholder: "e.g. How my voice seemed today... Which sound felt clearer or warmer... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say a short sentence naturally, say “ah” and “oo” comfortably, notice the difference, then repeat one sound with a small, natural vowel adjustment and write down one observation. No need for excessive repetition.")}
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

    /* ---- Section F: piano + playback ---- */
    own(VirtualPiano.wire(container, "rtc-piano", {
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
    function refreshContrastHost() {
      const host = $("[data-contrast-host]");
      if (host) host.innerHTML = contrastHtml(rec0());
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const VOWEL_NAMES = Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, v.label]));
    const NAMES = { spokenSentence: "Spoken sentence", ...VOWEL_NAMES, ahNatural: "“ah” — natural", ahVariation: "“ah” — variation", pitchToneTake: "Tone colour on a note" };
    const MAX_SECONDS = { spokenSentence: 10, ...Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, 8])), ahNatural: 8, ahVariation: 8, pitchToneTake: 15 };
    const CONTRAST_KEYS = ["ahNatural", "ahVariation"];
    const REVIEW_KEYS = ["spokenSentence", "ahTake", "ooTake", "ahVariation"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 8 — ${NAMES[k]}`, exercise: `resonance-tone-colour-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (CONTRAST_KEYS.includes(k)) refreshContrastHost();
          if (REVIEW_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section E: play-to-contrast, Section G: play-to-review ---- */
    function onPlayContrast(e) {
      const btn = e.target.closest("[data-play-contrast]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playContrast);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayContrast);
    cleanups.push(() => container.removeEventListener("click", onPlayContrast));
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
      "naturalVoice-q": "naturalVoice", "clearer-q": "clearer", "warmer-q": "warmer", "similar-q": "similar",
      "easiestSound-q": "easiestSound", "preferredSound-q": "preferredSound", "mouthShapeChanged-q": "mouthShapeChanged", "triedToForce-q": "triedToForce",
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
    own(PersonalNotes.wire(container, "notes-rtc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Tone colour words like \"bright,\" \"warm\" and \"dark\" are descriptive listening terms, not rigid categories — a comfortable, healthy sound matters more than imitating anyone else's tone.",
        struggled: "",
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
