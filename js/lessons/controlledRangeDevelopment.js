/* ============================================================
   LEVEL 2, CLASS 11 — CONTROLLED RANGE DEVELOPMENT (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "controlled-range-development".

   Curriculum identity: Level 2, Class 11 (`number: 11`, `levelId: 2`
   in data.js, id `L2C11`). Same mechanism Classes 1-10 already
   proved ten times over. This class's own title matched the
   placeholder list's already-renamed, final entry exactly (renamed
   from "First Performance Assessment" during Class 10's turn), so
   nothing needed renaming to add Class 11 itself.

   **Level 2's class count grows a seventh time — but this time there
   was no existing placeholder left to rename.** This spec's own
   "Next class preview" names the real Class 12 as "Sustained Notes
   and Stability." Since Class 10's spec already consumed the very
   last original placeholder ("First Performance Assessment" →
   "Controlled Range Development"), `levelClassDefs[2]` had nothing
   left in it. Rather than leave the Classes page with no title for
   the next class, a brand-new placeholder entry was added (not
   renamed, since none remained) — the first time this file's
   placeholder-growth pattern has needed genuine addition instead of
   renaming. Whether Level 2 keeps growing further after Class 12 is,
   as always, left for that class's own spec to reveal.

   Core idea: "Everyone's range is different. There is no universal
   starting note or required highest or lowest note for this
   lesson... A wider range is not automatically better singing.
   Singing louder does not mean you can sing higher." The lesson's
   own starting note is explicitly a reference point, not a test —
   if the learner can't match it, they choose a more comfortable one
   and continue without penalty.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-accuracy, range, strain, or voice-quality detection (none
   exists in this codebase); completion never depends on reaching a
   specific note, extending range, a perfect sound, a recording, or
   completing optional repetitions (the spec says this explicitly).

   Unlike Classes 3-10, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" section is
   phrased as negative constraints — what completion must NOT depend
   on — not a positive checklist). This file still builds a 5-item
   plain-checkbox checklist (Class 10's `PRE_CHECK_ITEMS` style,
   reused a ninth time), but its wording is authored from the
   lesson's own Parts A-G rather than copied from spec text, the same
   as Resonance (Class 2) and Voice Placement (Class 1) did when
   their own specs likewise gave no literal checklist.

   This is also the first class in this stretch to genuinely explore
   BOTH directions from a reference note (Parts D and E) — the same
   bidirectional range-clamp pattern Class 23 (Register Awareness,
   Level 1) first established, reused here for the first time since.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. Section G reuses Parts C/D/E's own
   three recordings rather than asking for a combined 4-part take
   again — the fifth Level 2 class in a row to substantially reuse
   its optional-recording section instead of re-asking.
   ============================================================ */

const ControlledRangeDevelopmentLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "prepare", label: "Prepare" },
    { id: "starting", label: "Starting Note" },
    { id: "higher", label: "Higher" },
    { id: "lower", label: "Lower" },
    { id: "reflect", label: "Reflect" },
    { id: "record", label: "Record" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what vocal range means." },
    { key: "startingNoteFound", label: "I found a comfortable starting note." },
    { key: "exploredOrSkipped", label: "I explored upward and downward, or chose to skip either." },
    { key: "noticedComfort", label: "I noticed which notes felt comfortable or strained." },
    { key: "reflectionRecorded", label: "I recorded a reflection or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    easierDirection: { question: "Which direction felt easier today?", options: [opt("higher", "Higher"), opt("lower", "Lower"), opt("neither", "Neither felt easier"), opt("both", "Both felt about the same")] },
    anyTight: { question: "Did any note feel tight, pressed, breathy, or uncomfortable?", options: [opt("no", "No", "good"), opt("higher", "The higher note"), opt("lower", "The lower note"), opt("both", "Both")] },
    softerEasier: { question: "Was it easier to make a soft sound than a loud one?", options: [opt("yes", "Yes", "good"), opt("no", "No"), opt("unsure", "Not sure")] },
    returnedComfortably: { question: "Could you return to the starting note comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n - STEP >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from + STEP, Math.min(RANGE.to - STEP, fallback));
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

  function reviewHtml(rec) {
    const sources = [["startingNoteTake", "Starting note"], ["higherTake", "Higher note"], ["lowerTake", "Lower note"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record your starting note, higher note, or lower note above — then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 11 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Gentle exploration, not a goal note.</p>
        <p class="text-sm text-ink-300">If only the starting note felt comfortable today, that's a complete, successful lesson.</p>
        <p class="text-sm text-ink-100">Range develops from gradual coordination and practice — never from forcing the voice.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 12 — Sustained Notes and Stability</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will build on today's comfortable notes, exploring how to hold a note steadily — gently, without straining to hold it longer than feels easy.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A few comfortable notes above and below a familiar starting note — gently explored.</h3>
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

        ${chapter("understand", 1, "Part A — Understand your vocal range", `
          ${narrow(`
            ${p("Vocal range is the span between the lower and higher notes a person can sing. Your comfortable range may vary with fatigue, time of day, and vocal coordination.")}
            ${p("A wider range is not automatically better singing, and singing louder does not mean you can sing higher. Today's goal is gentle exploration, not achieving a particular note — everyone's range is different, and there is no universal starting note or required highest or lowest note.")}
          `)}
          ${flowStrip(["LOW", "COMFORTABLE MIDDLE", "HIGH"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("prepare", 2, "Part B — Get comfortable", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Sit or stand comfortably, with a relaxed neck and shoulders.", "Breathe normally — no exaggerated breaths or breath-holding.", "Speak a short, comfortable sentence — e.g. “" + SENTENCE + "”", "If comfortable, make a gentle hum at an easy pitch for a few seconds.", "Rest briefly."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-4">Humming isn't required if it feels uncomfortable.</p>
          `)}
        `)}

        ${chapter("starting", 3, "Part C — Find a comfortable starting note", `
          ${narrow(p("Listen to a note and gently imitate it, if you wish — or simply begin with a comfortable speaking pitch and transition into a soft sound. If you can't match the reference note, choose a more comfortable one and continue without penalty. This is a reference point, not a test."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("crd-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("startingNoteTake", "Your comfortable starting note", "", 10)}
        `, { wide: true })}

        ${chapter("higher", 4, "Part D — Explore a little higher", `
          ${narrow(p("Start from your comfortable note. If it feels easy, move to a nearby higher note on a short, gentle “oo” or hum. Return to the starting note. Rest before repeating, if you'd like — keep the movement small, never a large jump, and a high note is never mandatory."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} Slightly higher, then return</button>
          </div>
          ${recCard("higherTake", "A nearby higher note, if comfortable", "Entirely optional.", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("higher")}</div>`)}
        `)}

        ${chapter("lower", 5, "Part E — Explore a little lower", `
          ${narrow(p("The same process, downward: begin at your comfortable reference note, try a nearby lower note if it feels natural, then return to the starting note and rest. Never push into an artificially low register or produce a rough, pressed sound."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="lower" class="vr-btn">${icon("play", "w-4 h-4")} Slightly lower, then return</button>
          </div>
          ${recCard("lowerTake", "A nearby lower note, if comfortable", "Entirely optional.", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("lower")}</div>`)}
        `)}

        ${chapter("reflect", 6, "Part F — Compare and reflect", `
          ${narrow(`
            ${p("It's completely fine if only the starting note felt comfortable today — that's still a successful lesson.")}
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("easierDirection-q", { ...Q.easierDirection, selected: sel("easierDirection") })}
              ${SelfAssessment.render("anyTight-q", { ...Q.anyTight, selected: sel("anyTight") })}
              ${SelfAssessment.render("softerEasier-q", { ...Q.softerEasier, selected: sel("softerEasier") })}
              ${SelfAssessment.render("returnedComfortably-q", { ...Q.returnedComfortably, selected: sel("returnedComfortably") })}
            </div>
          `)}
        `)}

        ${chapter("record", 7, "Part G — Optional practice recording", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`<div class="mt-5"><label class="block text-sm text-ink-200 mb-1.5" for="crd-observation">One thing I noticed today</label><textarea id="crd-observation" data-growth="observation" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.observation || "")}</textarea></div>`)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-crd", { placeholder: "e.g. Which note felt most comfortable... Whether higher or lower felt easier... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on reaching a specific note, extending your range, a perfect sound, a recording, or completing optional repetitions.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
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

    /* ---- Part C: piano + playback ---- */
    own(VirtualPiano.wire(container, "crd-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi - STEP < RANGE.from || midi + STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note between ${N(RANGE.from + STEP)} and ${N(RANGE.to - STEP)} so both directions stay comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else if (btn.dataset.playPitch === "higher") PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
      else PianoSynth.playSequence([b - STEP, b], { duration: 0.9, gap: 0.3 });
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
    const NAMES = { startingNoteTake: "Starting note", higherTake: "Higher note", lowerTake: "Lower note" };
    const MAX_SECONDS = { startingNoteTake: 10, higherTake: 10, lowerTake: 10 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 11 — ${NAMES[k]}`, exercise: `controlled-range-development-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Part G: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "easierDirection-q": "easierDirection", "anyTight-q": "anyTight", "softerEasier-q": "softerEasier", "returnedComfortably-q": "returnedComfortably" };
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
    own(PersonalNotes.wire(container, "notes-crd", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Range develops from gradual coordination and practice, not from forcing the voice — it's completely fine if only the starting note feels comfortable on a given day.",
        struggled: q(rec, "anyTight") && q(rec, "anyTight") !== "no" ? `Some tension noticed on the ${q(rec, "anyTight")} note(s).` : "",
        toPractice: A(rec, "growth").observation || "",
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
