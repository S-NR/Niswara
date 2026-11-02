/* ============================================================
   LEVEL 2, CLASS 18 — REGISTER COORDINATION PRACTICE (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "register-coordination-practice".

   Curriculum identity: Level 2, Class 18 (`number: 18`, `levelId: 2`
   in data.js, id `L2C18`). Same mechanism Classes 1-17 already
   proved seventeen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Vocal Agility Development" during Class 17's turn), so nothing
   needed renaming or adding to bring Class 18 itself onto the page.

   This spec's own "Next class preview" names the real Class 19 as
   "Tone Consistency Across Range" — `levelClassDefs[2]` is renamed in
   place again, the same precedent every class since 5 has followed.

   Core idea: chest/head/mixed voice are TERMS for coordination
   patterns and sensations, not literal production locations — this
   is stated explicitly, reusing the exact framing Classes 3-6 already
   established, never contradicting it. A noticeable register
   transition is explicitly normal, not a failure; this lesson never
   requires smoothing out every transition or achieving a "mixed"
   sound.

   Honesty boundaries, matching every earlier class: no automatic
   chest/head/mix detection or voice-quality classification (the spec
   explicitly forbids building one); completion never depends on a
   perfect transition, achieving mixed voice, a particular pitch, a
   recording, or any optional exercise (the spec says this
   explicitly).

   Unlike Classes 3-6/10/17 (which gave separate recordings per
   exercise), this spec's own Section G describes ONE short recording
   covering the whole gentle exploration, not one per part — so this
   file has a single `practiceTake`, not four. Section I is phrased as
   negative completion constraints again, so this file self-authors a
   5-item plain-checkbox checklist, the same style Class 10's original
   `PRE_CHECK_ITEMS` established.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth's
   relative-degree pattern playback (Level 1 Class 24 / Classes
   15-17) for the higher-area and transition references, RecordingCard
   (Class 5), SelfAssessment (Class 4), PersonalNotes, ClassProgress,
   and a skip button for the one optional exercise (Classes 9-17).
   ============================================================ */

const RegisterCoordinationPracticeLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "lowerArea", label: "Lower Area" },
    { id: "higherArea", label: "Higher Area" },
    { id: "transition", label: "Transition" },
    { id: "pattern", label: "Pattern" },
    { id: "record", label: "Record" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2; // the furthest this class asks for is the pattern's "3" (two steps up)

  const PATTERNS = {
    higher: [0, 1, 0],
    transition: [0, 1, 0],
    three: [0, 1, 2, 1, 0],
  };

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal registers mean." },
    { key: "triedLowerArea", label: "I explored a comfortable, familiar-feeling lower area, or chose to skip it." },
    { key: "triedHigherArea", label: "I explored a lighter, higher area, or chose to skip it." },
    { key: "triedTransition", label: "I tried a gentle transition between the two areas, or chose to skip it." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    voiceDifferent: { question: "Did my voice feel different at different pitches?", options: [opt("yes", "Yes"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    noticeableTransition: { question: "Was there a noticeable transition?", options: [opt("yes", "Yes"), opt("alittle", "A little"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    forcedSound: { question: "Did I try to force the sound?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    mostComfortableArea: { question: "Which pitch area felt most comfortable?", options: [opt("lower", "The lower area"), opt("higher", "The higher area"), opt("both", "Both, about equally"), opt("unsure", "Not sure")] },
    moveWithoutTension: { question: "Could I move between notes without unnecessary tension?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
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
    for (const id of ["L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
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
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 18 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Noticing is the practice — not fixing everything at once.</p>
        <p class="text-sm text-ink-300">Chest and head voice are names for coordination patterns, not places sound is produced. A noticeable transition today is normal, not a mistake.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 19 — Tone Consistency Across Range</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson builds on today's listening — developing a comfortable, reasonably consistent tone as pitch changes, without forcing every note to sound identical.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A gentle first look at how registers coordinate.</h3>
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

        ${chapter("understand", 1, "Part A — Understand vocal registers", `
          ${narrow(`
            ${p("A singer's voice can behave a little differently in the lower and higher parts of its range. “Chest voice” and “head voice” are terms musicians use for these different patterns of coordination and sensation — they don't mean the sound is literally produced in your chest or your head.")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-2">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Chest voice:</strong> commonly associated with a speech-like, lower-range coordination.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Head voice:</strong> commonly associated with a lighter, higher-range coordination.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Mixed coordination:</strong> a term for developing a more balanced transition between the two.</li>
            </ul>
            ${p("Every voice is different, and register transitions may be noticeable while you're learning — that's normal, not a sign something is wrong. This lesson isn't about making every singer produce the same chest, head, or mixed quality; it's about noticing how your own voice behaves.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your jaw, shoulders, and neck.", "Breathe normally.", "Speak one comfortable sentence.", "Make a gentle hum, if comfortable.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("No forceful breathing and no loud exercises today — everything here stays gentle.")}
          `)}
        `)}

        ${chapter("lowerArea", 3, "Part C — A comfortable, familiar area", `
          ${narrow(p("Speak a short sentence naturally and notice the comfortable pitch area you used. Then choose a note near that area on the piano below, and try a gentle hum there — without deliberately making the sound deeper or heavier. This is simply an awareness exercise, not a requirement to produce a strong chest voice."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c18-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${narrow(p("This note is your reference for the rest of today's lesson."))}
        `, { wide: true })}

        ${chapter("higherArea", 4, "Part D — A lighter, higher area", `
          ${narrow(p("Listen to a comfortable reference slightly above your note, then try your own gentle “oo” or hum somewhere near it. Keep the sound light and easy — don't push upward, and stop well before anything feels like strain. There's no fixed note or universal transition point to reach here."))}
          <button type="button" data-play-pattern="higher" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
        `)}

        ${chapter("transition", 5, "Part E — A gentle transition", `
          ${narrow(`
            ${p("Start on an easy hum at your reference note, move gently upward by a small, comfortable interval, then return to where you started. Notice whether the sound or sensation changes — repeat only if it still feels comfortable.")}
            ${p("If a natural register change happens along the way, that isn't a failure, and this lesson doesn't ask you to smooth out every transition today.")}
          `)}
          <button type="button" data-play-pattern="transition" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
        `)}

        ${chapter("pattern", 6, "Part F — A simple pattern (optional)", `
          ${narrow(p("If you're comfortable, try this short, slow pattern — numbers are relative positions in your own comfortable range, not fixed notes. Focus on a relaxed sound, smooth changes where possible, no sudden pushing or extra volume, and natural breathing. This exercise is entirely optional."))}
          ${flowStrip(["1", "2", "3", "2", "1"])}
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-play-pattern="three" class="vr-btn">${icon("play", "w-4 h-4")} Listen</button>
            ${skipBtn("pattern")}
          </div>
        `)}

        ${chapter("record", 7, "Part G — Listen and reflect", `
          ${narrow(p("If you'd like, record a short, gentle pass through today's exploration — your reference note, the higher area, and the transition. If you'd rather not record, the questions below work just as well as a self-reflection."))}
          ${recCard("practiceTake", "A short, gentle exploration", "Entirely optional — your reference note, the higher area, and the transition.", 20)}
          <div data-review-host class="mt-3"></div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("voiceDifferent-q", { ...Q.voiceDifferent, selected: sel("voiceDifferent") })}
              ${SelfAssessment.render("noticeableTransition-q", { ...Q.noticeableTransition, selected: sel("noticeableTransition") })}
              ${SelfAssessment.render("forcedSound-q", { ...Q.forcedSound, selected: sel("forcedSound") })}
              ${SelfAssessment.render("mostComfortableArea-q", { ...Q.mostComfortableArea, selected: sel("mostComfortableArea") })}
              ${SelfAssessment.render("moveWithoutTension-q", { ...Q.moveWithoutTension, selected: sel("moveWithoutTension") })}
            </div>
            <div class="mt-4"><label class="block text-sm text-ink-200 mb-1.5" for="l2c18-next">What would you like to explore next time?</label><textarea id="l2c18-next" data-growth="next" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.next || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c18", { placeholder: "e.g. Where I noticed a transition... Which area felt most natural... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on a perfect transition, achieving “mixed voice,” reaching a particular pitch, a recording, or any optional exercise.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: never force chest voice into higher notes or push head voice downward, never shout or add volume to cross a transition, don't squeeze the throat or jaw, and don't chase a “mixed voice” sound. Keep attempts short, rest between them, and stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    /* ---- Part C: piano ---- */
    own(VirtualPiano.wire(container, "l2c18-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_UP * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note at or below ${N(RANGE.to - MAX_UP * STEP)} so the higher-area and pattern references stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));

    /* ---- Parts D/E/F: reference pattern playback ---- */
    function onPlayPattern(e) {
      const btn = e.target.closest("[data-play-pattern]");
      if (!btn) return;
      const degrees = PATTERNS[btn.dataset.playPattern];
      PianoSynth.playSequence(degreesToNotes(base(), degrees), { duration: 0.75, gap: 0.3 });
    }
    container.addEventListener("click", onPlayPattern);
    cleanups.push(() => container.removeEventListener("click", onPlayPattern));

    /* ---- skip button ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- Part G: recording ---- */
    function reviewHtml(rec) {
      const t = take(rec, "practiceTake");
      if (!t) return "";
      return `<button type="button" data-play-review="practiceTake" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Listen back</button>`;
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    own(RecordingCard.wire(container, "rc-practiceTake", {
      classId, take: take(rec0(), "practiceTake"), maxSeconds: 20,
      meta: { name: "Level 2, Class 18 — Gentle exploration", exercise: "register-coordination-practice-practiceTake" },
      onSaved: (t) => { set("recs", "practiceTake", t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
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
      "voiceDifferent-q": "voiceDifferent", "noticeableTransition-q": "noticeableTransition", "forcedSound-q": "forcedSound",
      "mostComfortableArea-q": "mostComfortableArea", "moveWithoutTension-q": "moveWithoutTension",
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

    /* ---- reflection textarea ---- */
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
    own(PersonalNotes.wire(container, "notes-l2c18", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Chest and head voice are terms for coordination patterns, not literal production locations — a noticeable register transition is normal, not a failure.",
        struggled: q(rec, "noticeableTransition") && q(rec, "noticeableTransition") !== "no" ? "Noticed a transition between the lower and higher areas." : "",
        toPractice: A(rec, "growth").next || "",
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
