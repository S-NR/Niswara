/* ============================================================
   LEVEL 2, CLASS 19 — TONE CONSISTENCY ACROSS RANGE (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "tone-consistency-across-range".

   Curriculum identity: Level 2, Class 19 (`number: 19`, `levelId: 2`
   in data.js, id `L2C19`). Same mechanism Classes 1-18 already
   proved eighteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Register Coordination Practice" during Class 18's turn), so
   nothing needed renaming or adding to bring Class 19 itself onto
   the page.

   This spec's own "Next class preview" names the real Class 20 as
   "Articulation and Style" — `levelClassDefs[2]` is renamed in place
   again, the same precedent every class since 5 has followed.

   Core idea: tone is the quality/character of a sound, and it can
   change naturally with pitch, vowel, register, and coordination —
   consistency means comfortable coordination across nearby notes,
   NOT making every note sound identical. Explicitly never treats a
   natural tonal change as a mistake; only unnecessary pressing,
   tightness, breathiness, or weakness is framed as worth noticing.

   Honesty boundaries, matching every earlier class: no automated
   tone analysis, voice-quality classification, or consistency
   scoring (the spec explicitly forbids building one); completion
   never depends on identical tone, a particular pitch, a specific
   tone quality, a recording, or any optional exercise (the spec says
   this explicitly).

   Like Class 18, this spec's own Section G describes ONE short
   recording covering the whole exploration (reference note, one
   note above, one note below, and the optional pattern), not one per
   part. Reflection here has its own explicit Section H (unlike Class
   18), so this file gives it its own chapter rather than folding it
   into the recording chapter.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one comfortable reference note, PianoSynth's
   relative-degree pattern playback (Level 1 Class 24 / Classes
   15-18) for the higher/lower/pattern references, RecordingCard
   (Class 5), SelfAssessment (Class 4), PersonalNotes, ClassProgress,
   and a skip button for the one optional exercise (Classes 9-18).
   ============================================================ */

const ToneConsistencyAcrossRangeLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "reference", label: "Reference" },
    { id: "nearby", label: "Nearby Notes" },
    { id: "vowel", label: "Vowel" },
    { id: "pattern", label: "Pattern" },
    { id: "record", label: "Record" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_UP = 2; // the furthest this class asks for is the pattern's "3" (two steps up)

  const PATTERNS = {
    higher: [0, 1, 0],
    lower: [0, -1, 0],
    vowel: [0, 1, 0, -1, 0],
    three: [0, 1, 2, 1, 0],
  };

  const TONE_WORDS = ["Clear", "Breathier", "Brighter", "Darker", "Lighter", "Fuller"];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal tone means." },
    { key: "triedReference", label: "I found a comfortable reference sound, or chose to skip it." },
    { key: "triedNearby", label: "I explored one nearby higher and lower note, or chose to skip it." },
    { key: "triedVowel", label: "I compared the same vowel across notes, or chose to skip it." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    toneChangedNaturally: { question: "Did my tone change naturally with pitch?", options: [opt("yes", "Yes"), opt("alittle", "A little"), opt("no", "Not that I noticed"), opt("unsure", "Not sure")] },
    anyNoteTight: { question: "Did any note feel unnecessarily tight?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    soundComfortable: { question: "Was my sound comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    forcedSameSound: { question: "Did I try to force the same sound everywhere?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    mostNaturalNotes: { question: "Which notes felt most natural?", options: [opt("reference", "My reference note"), opt("higher", "The higher note"), opt("lower", "The lower note"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n - STEP >= RANGE.from && n + MAX_UP * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from + STEP, Math.min(RANGE.to - MAX_UP * STEP, fallback));
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
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 19 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Consistency is comfortable coordination, not identical sound.</p>
        <p class="text-sm text-ink-300">Every voice has natural tonal variation across its range — today was about listening to that variation, not erasing it.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 20 — Articulation and Style</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson moves from listening to tone toward how clearly words come across while singing, and the beginnings of personal style.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first listen for how your own tone moves across your range.</h3>
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

        ${chapter("understand", 1, "Part A — Understand vocal tone", `
          ${narrow(`
            ${p("Vocal tone is the quality or character of the sound your voice makes. Two people can sing the exact same note and sound completely different — and your own tone can change naturally with pitch, vowel, register, and coordination. A clear tone doesn't necessarily mean a loud one, and a consistent voice doesn't mean every note has to share exactly the same colour.")}
            ${p("Some simple words for describing what you hear, as listening descriptions — not as good or bad labels:")}
            <div class="flex flex-wrap gap-2 mb-2">${TONE_WORDS.map((w) => `<span class="flow-chip !text-sm">${w}</span>`).join("")}</div>
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Gentle preparation", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Relax your shoulders, jaw, and neck.", "Breathe normally.", "Speak one comfortable sentence.", "Make a gentle hum, if comfortable.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("No demanding warm-ups and no exaggerated breathing today.")}
          `)}
        `)}

        ${chapter("reference", 3, "Part C — A comfortable reference tone", `
          ${narrow(p("Choose one comfortable pitch on the piano below, then sing a gentle “oo” or “mmm” there. Listen to the sound and notice whether it feels relaxed and easy — this is today's reference sound. There's no fixed pitch to aim for."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c19-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your reference note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
        `, { wide: true })}

        ${chapter("nearby", 4, "Part D — Explore nearby notes", `
          ${narrow(`
            ${p("Starting from your reference pitch, listen to the pattern below — up to a nearby higher note, back to the reference, down to a nearby lower note, and back again — then try it yourself. Listen for changes in tone, and notice whether a note becomes unnecessarily pressed, breathy, tight, or weak.")}
            ${p("A natural change in tone isn't a mistake — only notice it, don't try to fix it yet.")}
          `)}
          <div class="flex flex-wrap gap-3">
            <button type="button" data-play-pattern="higher" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen — higher</button>
            <button type="button" data-play-pattern="lower" class="vr-btn">${icon("play", "w-4 h-4")} Listen — lower</button>
          </div>
        `)}

        ${chapter("vowel", 5, "Part E — Compare the same vowel across notes", `
          ${narrow(`
            ${p("Using a simple “oo”: sing your reference note, move slightly higher while keeping the vowel comfortable, return to the reference, move slightly lower, then return again. Listen for changes in sound quality — vowels may naturally need small adjustments at different pitches, so there's no need to hold your mouth in exactly the same position throughout.")}
          `)}
          <button type="button" data-play-pattern="vowel" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
        `)}

        ${chapter("pattern", 6, "Part F — A simple pattern (optional)", `
          ${narrow(p("If you're comfortable, try this short, slow pattern — numbers are relative positions in your own comfortable range, not fixed notes. Listen first, sing slowly, keep the sound relaxed, and notice changes in tone as the notes move rather than pushing for a uniform sound. This exercise is entirely optional."))}
          ${flowStrip(["1", "2", "3", "2", "1"])}
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-play-pattern="three" class="vr-btn">${icon("play", "w-4 h-4")} Listen</button>
            ${skipBtn("pattern")}
          </div>
        `)}

        ${chapter("record", 7, "Part G — Listen and compare", `
          ${narrow(p("If you'd like, record a short exercise containing your reference note, one nearby higher note, one nearby lower note, and the pattern if you tried it. If you'd rather not record, the questions below work just as well as a self-reflection."))}
          ${RecordingCard.render("rc-practiceTake", { title: "A short tone comparison", hint: "Entirely optional — your reference note, a higher note, a lower note, and the pattern if you tried it.", maxSeconds: 25, section: false })}
          <div data-review-host class="mt-3"></div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("toneChangedNaturally-q", { ...Q.toneChangedNaturally, selected: sel("toneChangedNaturally") })}
              ${SelfAssessment.render("anyNoteTight-q", { ...Q.anyNoteTight, selected: sel("anyNoteTight") })}
              ${SelfAssessment.render("soundComfortable-q", { ...Q.soundComfortable, selected: sel("soundComfortable") })}
              ${SelfAssessment.render("forcedSameSound-q", { ...Q.forcedSameSound, selected: sel("forcedSameSound") })}
              ${SelfAssessment.render("mostNaturalNotes-q", { ...Q.mostNaturalNotes, selected: sel("mostNaturalNotes") })}
            </div>
          `)}
        `)}

        ${chapter("reflect", 8, "Part H — Reflection", `
          ${narrow(`
            ${p("A few short prompts to close today's exploration:")}
            <div class="flex flex-col gap-3 mt-2">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c19-comfortable">Which pitch area felt most comfortable?</label><textarea id="l2c19-comfortable" data-growth="comfortableArea" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.comfortableArea || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c19-change">Where did I notice a change in tone?</label><textarea id="l2c19-change" data-growth="toneChange" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.toneChange || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c19-tension">Did I experience any tension?</label><textarea id="l2c19-tension" data-growth="tension" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.tension || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c19-vowel">Which vowel felt easiest?</label><textarea id="l2c19-vowel" data-growth="easiestVowel" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.easiestVowel || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c19-next">What would I like to explore next time?</label><textarea id="l2c19-next" data-growth="next" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.next || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c19", { placeholder: "e.g. Which pitch area felt most comfortable... Where my tone changed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on producing identical tone across every note, reaching a particular pitch, achieving a specific tone quality, a recording, or any optional exercise.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: don't force the same tone across every pitch, don't squeeze the throat to sound fuller, don't force a brighter or darker sound, and don't push high or low notes. Keep attempts short, rest between them, and stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort. Natural tonal differences across your range are normal.")}
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

    /* ---- Part C: piano ---- */
    own(VirtualPiano.wire(container, "l2c19-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi - STEP < RANGE.from || midi + MAX_UP * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - MAX_UP * STEP)} so the nearby-note and pattern references stay comfortable)`;
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
      classId, take: take(rec0(), "practiceTake"), maxSeconds: 25,
      meta: { name: "Level 2, Class 19 — Tone comparison", exercise: "tone-consistency-across-range-practiceTake" },
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
      "toneChangedNaturally-q": "toneChangedNaturally", "anyNoteTight-q": "anyNoteTight", "soundComfortable-q": "soundComfortable",
      "forcedSameSound-q": "forcedSameSound", "mostNaturalNotes-q": "mostNaturalNotes",
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
    own(PersonalNotes.wire(container, "notes-l2c19", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vocal tone naturally varies with pitch, vowel, register, and coordination — consistency means comfortable coordination, not making every note sound identical.",
        struggled: q(rec, "anyNoteTight") && q(rec, "anyNoteTight") !== "no" ? "Noticed some unnecessary tightness at certain notes." : "",
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
