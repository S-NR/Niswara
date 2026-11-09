/* ============================================================
   LEVEL 2, CLASS 24 — PERFORMANCE PREPARATION (interactive lesson)

   Rendered by ClassDetailPage for interactive: "performance-preparation".

   Curriculum identity: Level 2, Class 24 (`number: 24`, `levelId: 2`
   in data.js, id `L2C24`). Same mechanism Classes 1-23 already
   proved twenty-three times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Song Practice Workshop" during Class 23's turn), so nothing
   needed renaming or adding to bring Class 24 itself onto the page.

   This spec's own "Next class preview" names the real Class 25 as
   "Level 2 Final Assessment & Progress Recording" — `levelClassDefs[2]`
   is renamed in place again, the same precedent every class since 5
   has followed. This is the LAST placeholder rename Level 2 needs —
   Class 25 is explicitly previewed as Level 2's final class, though
   that's for Class 25's own spec to confirm, not guessed here.

   Section 1 says to "choose a simple song or reuse the song from
   Class 23" — reuses it, the same "ಓ ನನ್ನ ಚೇತನ" practice song
   (`window.SONGS[0]`) Class 23 already adopted from Song Learning &
   Application, rather than asking the learner to pick a second song
   this app has no content for.

   Section 4 ("comfortable starting pitch... or transpose option, if
   genuinely supported") is answered honestly: this app has no song
   transposition — `SongLessonKit`'s phrase data is fixed pitches,
   not relative degrees like a personal-range exercise. So this
   section is a personal comfortable-note warm-up (the same
   `VirtualPiano`/`baseNote()` convention Classes 10-22 already use),
   explicitly distinguished from the song's own fixed pitches, not a
   transpose feature that doesn't exist.

   Section 6 ("record the performance optionally... listen back")
   deliberately does NOT get its own `RecordingCard` — Class 23
   already established that this song's complete-song recording
   belongs to the Song Learning page's own `combinedTake` slot, not a
   new one per class. A third, disconnected recording bucket for the
   same "sing the complete song" moment would contradict that
   decision rather than extend it, so this section also hands off to
   the real recording there and reflects on it afterward instead.

   Section 3's "simple preparation checklist" and Section 7's "Pre-
   Performance Checklist" are the same eight items, used once now and
   shown again as a takeaway — not two different lists. Kept as its
   own saved state (`prepChecklist`), separate from the self-authored
   5-item COMPLETION checklist (Class 10's `PRE_CHECK_ITEMS` style),
   since "Completion must not depend on performing in front of
   another person or uploading a recording" is a negative constraint
   again.

   Honesty boundaries, matching every earlier class and this spec's
   own Section 4 instructions: no fake pitch detection, automatic
   nervousness measurement, emotion detection, or performance scoring
   — none of this exists in the codebase, and none of it is claimed.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3) for the one personal comfortable-note warm-up,
   `SongLessonKit`'s exported pure functions (first reused by Class
   23, reused again here) for the real song reference playback,
   `PianoSynth` (Level 1 Class 24 / Classes 15-23), `SelfAssessment`
   (Class 4), `PersonalNotes`, `ClassProgress`.
   ============================================================ */

const PerformancePreparationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepareBody", label: "Prepare" },
    { id: "prepareSong", label: "The Song" },
    { id: "startingPitch", label: "Starting Pitch" },
    { id: "nerves", label: "Nerves" },
    { id: "practice", label: "Practice" },
    { id: "checklist", label: "Checklist" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SONG_HREF = "#/songs/oo-nanna-chetana";
  const SONG = window.SONGS && window.SONGS[0];

  const PREP_CHECKLIST_ITEMS = [
    { key: "physicallyComfortable", label: "Am I physically comfortable?" },
    { key: "warmedUp", label: "Have I warmed up gently?" },
    { key: "knowOpeningNote", label: "Do I know the opening note?" },
    { key: "rememberLyrics", label: "Do I remember the lyrics?" },
    { key: "understandRhythm", label: "Do I understand the rhythm?" },
    { key: "knowBreathing", label: "Do I know where to breathe?" },
    { key: "practisedDifficult", label: "Have I practised the difficult phrases?" },
    { key: "readyOwnPace", label: "Am I ready to sing at my own pace?" },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand that confidence comes from practice and familiarity, not perfection." },
    { key: "triedWarmup", label: "I tried the gentle warm-up routine, or chose to skip it." },
    { key: "triedStartingPitch", label: "I explored a comfortable starting pitch, or chose to skip it." },
    { key: "usedChecklist", label: "I looked at the pre-performance checklist, or chose not to." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    wasPrepared: { question: "Was I prepared before starting?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    feltComfortable: { question: "Did I feel comfortable while singing?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    rememberedStructure: { question: "Could I remember the song structure?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    maintainedRhythm: { question: "Did I maintain the rhythm?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    recoveredCalmly: { question: "Did I recover calmly after a mistake?", options: [opt("yes", "Yes", "good"), opt("noMistakes", "No mistakes to recover from"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    for (const id of ["L2C23", "L2C22", "L2C21", "L2C20", "L2C19", "L2C18", "L2C17", "L2C16", "L2C15", "L2C14", "L2C13", "L2C12", "L2C11", "L2C10", "L2C09", "L2C08", "L2C07", "L2C06", "L2C05", "L2C04", "L2C03", "L2C02", "L2C01", "L1C25", "L1C02"]) {
      const n = (ClassActivity.get(id).answers.setup || {}).note;
      if (ok(n)) return n;
    }
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to, fallback));
  }

  const q = (rec, k) => A(rec, "q")[k] || null;
  const checklist = (rec) => A(rec, "checklist");
  const prepChecklist = (rec) => A(rec, "prepChecklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  function prepChecklistHtml(rec, idSuffix) {
    const pc = prepChecklist(rec);
    return `<div class="flex flex-col gap-1 mb-2">
      ${PREP_CHECKLIST_ITEMS.map((item, i) => `
        <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
          <input type="checkbox" data-prep-checklist="${i}" ${pc[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
          <span class="text-sm text-ink-200">${item.label}</span>
        </label>`).join("")}
    </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 24 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Confidence comes from familiarity, not perfection.</p>
        <p class="text-sm text-ink-300">A short, gentle preparation routine — your body, the song, a comfortable pitch, and a calmer mind — is what makes a performance feel ready, not flawless execution.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 25 — Level 2 Final Assessment &amp; Progress Recording</p>
        <p class="text-sm text-ink-300 leading-relaxed">The final opportunity in Level 2 to bring everything learned together and compare progress against earlier recordings.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A gentle, practical way to get ready before singing for others.</h3>
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
    return [{ label: "Reflections", value: ClassActivity.get(cls.id).checkpoints.reflected ? 1 : 0 }];
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

        ${chapter("understand", 1, "Section 1 — What does performance preparation mean?", `
          ${narrow(`
            ${p("Casual practice and performing a complete song feel different — practice lets you stop and restart freely, while a performance asks you to carry a whole song through from beginning to end. Preparing beforehand reduces uncertainty, so there's less to think about in the moment.")}
            ${p("Confidence doesn't come from perfection — it comes from familiarity: knowing the song, your voice, and your plan well enough that singing it feels natural rather than effortful.")}
            ${SONG ? p(`This class reuses the same song from the Song Practice Workshop: “${SONG.titleTransliteration}.”`) : ""}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepareBody", 2, "Section 2 — Prepare your body and voice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Stand or sit comfortably.", "Relax your shoulders, neck, jaw, and face.", "Take a few comfortable, natural breaths.", "Practise a gentle hum.", "Sing a few comfortable notes.", "Practise one short phrase from the song."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            ${p("Keep this gentle — nothing demanding.")}
          `)}
          ${SONG ? `<button type="button" data-play-scope="0:0" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the first phrase</button>` : ""}
        `)}

        ${chapter("prepareSong", 3, "Section 3 — Prepare the song", `
          ${narrow(`
            ${p("A short preparation routine for the song itself: listen to it complete, review the lyrics, notice the starting note, get a feel for the rhythm and tempo, notice where each phrase ends, notice where you'd breathe, and practise any phrase that still feels unfamiliar on its own.")}
          `)}
          ${SONG ? `<div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the complete song</button>
            ${SONG.lines.map((_, i) => `<button type="button" data-play-scope="${i}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line ${i + 1}</button>`).join("")}
          </div>` : ""}
          ${narrow(p("Here's a simple preparation checklist — you'll see it again at the end of this class as a takeaway for future performances."))}
          ${prepChecklistHtml(rec, "a")}
        `, { wide: true })}

        ${chapter("startingPitch", 4, "Section 4 — Find your comfortable starting pitch", `
          ${narrow(`
            ${p("Starting on a comfortable pitch matters — if the very first note already feels like a stretch, everything after it feels harder too. This app doesn't change the song's own pitches, so use the piano below as a general warm-up: find a note that feels easy to start from, hum it, and let that comfort carry into the song.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("l2c24-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300">Your comfortable note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
        `, { wide: true })}

        ${chapter("nerves", 5, "Section 5 — Managing nervousness", `
          ${narrow(`
            ${p("Feeling nervous before singing is completely normal. Take a moment to settle before you start, rather than rushing into the first line. Focus on the song itself rather than imagining how others might judge you, and let small mistakes pass without stopping immediately — a performance is a chance to express the music, not to prove perfection.")}
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 my-3">
              <p class="text-sm text-ink-200 italic leading-relaxed">“Take a comfortable breath, remember the opening melody, and imagine yourself singing the first phrase calmly.”</p>
            </div>
            ${p("This won't eliminate nervousness entirely — that's a normal part of performing, not something to erase.")}
          `)}
        `)}

        ${chapter("practice", 6, "Section 6 — Performance practice", `
          ${narrow(`
            ${p("A practical run-through: finish the gentle warm-up above, listen to the reference song, review the first phrase, then practise the complete song once alongside the reference. Take a short rest, then — only if comfortable — attempt it on your own.")}
          `)}
          ${SONG ? `<div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the reference again</button>
            <button type="button" data-play-scope="0:0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Review the first phrase</button>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="${SONG_HREF}" class="vr-btn vr-btn-gold">${icon("arrowRight", "w-4 h-4")} Attempt the complete song, with recording</a>
          </div>
          ${narrow(p("Recording there is entirely optional, and it's the same recording from the Song Practice Workshop — there's no separate recording here. If you do record, don't restart it over every small mistake; listening back afterward and noticing one strength and one thing to improve is more useful than a flawless take."))}` : ""}
          <div class="grid sm:grid-cols-2 gap-3 mt-4">
            <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c24-strength">One thing I did well</label><textarea id="l2c24-strength" data-growth="strength" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.strength || "")}</textarea></div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c24-improve">One thing to improve next time</label><textarea id="l2c24-improve" data-growth="improve" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.improve || "")}</textarea></div>
          </div>
        `)}

        ${chapter("checklist", 7, "Section 7 — Your pre-performance checklist", `
          ${narrow(p("The same checklist from earlier — worth returning to before any future performance, not just this one."))}
          ${prepChecklistHtml(rec, "b")}
        `)}

        ${chapter("reflect", 8, "Self-review", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("wasPrepared-q", { ...Q.wasPrepared, selected: sel("wasPrepared") })}
              ${SelfAssessment.render("feltComfortable-q", { ...Q.feltComfortable, selected: sel("feltComfortable") })}
              ${SelfAssessment.render("rememberedStructure-q", { ...Q.rememberedStructure, selected: sel("rememberedStructure") })}
              ${SelfAssessment.render("maintainedRhythm-q", { ...Q.maintainedRhythm, selected: sel("maintainedRhythm") })}
              ${SelfAssessment.render("recoveredCalmly-q", { ...Q.recoveredCalmly, selected: sel("recoveredCalmly") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c24", { placeholder: "e.g. What helped me feel ready... How the nervousness felt... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on performing in front of another person or uploading a recording.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: never sing through pain or fatigue, avoid loud or forceful warm-ups, don't force high or low notes, and rest and hydrate well. It's fine to practise privately if performing for others feels uncomfortable right now. Stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    /* ---- Section 4: piano ---- */
    own(VirtualPiano.wire(container, "l2c24-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); },
    }));

    /* ---- Sections 2/3/6: real song reference playback, reused from Class 23's pattern ---- */
    if (SONG) {
      function onPlayScope(e) {
        const btn = e.target.closest("[data-play-scope]");
        if (!btn) return;
        const raw = btn.dataset.playScope;
        let scope = raw;
        if (raw !== "both" && raw.includes(":")) {
          const [line, phrase] = raw.split(":").map(Number);
          scope = { line, phrase };
        } else if (raw !== "both") {
          scope = Number(raw);
        }
        const plan = SongLessonKit.songPlaybackPlan(SONG, scope);
        PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, 60 / 75), { gap: 0 });
      }
      container.addEventListener("click", onPlayScope);
      cleanups.push(() => container.removeEventListener("click", onPlayScope));
    }

    /* ---- Sections 3/7: the shared pre-performance checklist ---- */
    function onPrepChecklist(e) {
      const cb = e.target.closest("[data-prep-checklist]");
      if (!cb) return;
      const i = cb.dataset.prepChecklist;
      set("prepChecklist", i, cb.checked);
      container.querySelectorAll(`[data-prep-checklist="${i}"]`).forEach((other) => { other.checked = cb.checked; });
    }
    container.addEventListener("change", onPrepChecklist);
    cleanups.push(() => container.removeEventListener("change", onPrepChecklist));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "wasPrepared-q": "wasPrepared", "feltComfortable-q": "feltComfortable", "rememberedStructure-q": "rememberedStructure",
      "maintainedRhythm-q": "maintainedRhythm", "recoveredCalmly-q": "recoveredCalmly",
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
    own(PersonalNotes.wire(container, "notes-l2c24", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Confidence before performing comes from familiarity and practice, not perfection — a short, gentle preparation routine is what makes a song feel ready.",
        struggled: q(rec, "recoveredCalmly") === "no" ? "Found it hard to stay calm after a small mistake." : "",
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
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
