/* ============================================================
   LEVEL 2, CLASS 3 — SHRUTI AND FINDING YOUR SA (interactive lesson)

   Rendered by ClassDetailPage for interactive: "shruti-and-finding-your-sa".

   Curriculum identity: Level 2, Class 3 (`number: 3`, `levelId: 2`
   in data.js, explicit id `L2C26` — new classes get a permanent id
   independent of their display number, so later renumbering never
   orphans progress). First of four new "Musical Foundations"
   classes inserted between Resonance (Class 2) and Chest Voice
   Foundations (now Class 7), introducing Carnatic swara basics
   alongside the vocal-technique track rather than after it.

   Core idea: shruti is the continuous reference pitch a singer tunes
   against; Sa is simply the name for whichever pitch a singer
   chooses as their own personal reference. Sa is never assumed to
   be any particular Western note (never "C") — it is deliberately
   chosen here, on the learner's own piano, and carried forward by
   every later class's baseNote() chain exactly like Class 1-25's
   "comfortable reference note" already was, just under its proper
   Carnatic name from here on.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection or "correct Sa" scoring; completion never depends
   on a particular pitch, a recording, or a smooth drone match.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano,
   PianoSynth.noteOn (drone + release — new use of an existing synth
   primitive, no new audio code needed), RecordingCard, SelfAssessment,
   PersonalNotes, ClassProgress.
   ============================================================ */

const ShrutiAndFindingYourSaLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "drone", label: "Drone" },
    { id: "choose", label: "Choose Sa" },
    { id: "sing", label: "Sing" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12; // leave room above Sa for the upper octave later classes will use

  const KNOWLEDGE_CHECK = [
    {
      key: "shruti",
      question: "What is shruti, in the simplest beginner sense used in this course?",
      options: [
        { value: "volume", label: "How loudly a singer performs", correct: false },
        { value: "drone", label: "A continuous reference pitch that singing is tuned against", correct: true },
        { value: "speed", label: "The speed of a song", correct: false },
      ],
      explain: { volume: "Not quite — shruti isn't about loudness.", drone: "Exactly. Shruti is the steady background pitch everything else is heard in relation to.", speed: "Not quite — shruti isn't about tempo." },
    },
    {
      key: "saFixed",
      question: "Is Sa always the same pitch — for example, always the note C?",
      options: [
        { value: "yes", label: "Yes, Sa is always C", correct: false },
        { value: "no", label: "No — Sa is whichever pitch a singer personally chooses as their reference", correct: true },
        { value: "unsure", label: "Sa is assigned by a teacher and never changes", correct: false },
      ],
      explain: { yes: "Not quite — Sa is never fixed to one Western note like C.", no: "Exactly right. Your Sa is personal, chosen for comfort, not assigned.", unsure: "Not quite — you chose your own Sa today, and you can choose a different one later if it's more comfortable." },
    },
    {
      key: "why",
      question: "Why does it matter that Sa is chosen rather than fixed?",
      options: [
        { value: "comfort", label: "Because every voice is comfortable in a different pitch range", correct: true },
        { value: "rule", label: "It doesn't matter — any Sa works identically for everyone", correct: false },
        { value: "louder", label: "So the singer can sing as loudly as possible", correct: false },
      ],
      explain: { comfort: "Right — a personally chosen Sa means every later swara sits in a range that's comfortable for your own voice.", rule: "Not quite — a fixed Sa could sit uncomfortably high or low for a given voice.", louder: "Not quite — Sa has nothing to do with volume." },
    },
  ];

  const PROGRESS_ITEMS = [
    { key: "understood", label: "I understand what shruti and Sa mean in this course." },
    { key: "chosenSa", label: "I chose a comfortable Sa on the piano." },
    { key: "triedOrSkipped", label: "I hummed or sang along with the drone, or chose to skip for comfort." },
    { key: "reflected", label: "I reflected on how it felt to choose my own Sa." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    droneFeel: { question: "How did it feel to hum along with the drone?", options: [opt("easy", "Easy and steady", "good"), opt("okay", "Okay, with some drifting", "good"), opt("hard", "Difficult to stay with", "maybe"), opt("skip", "I chose to skip this")] },
    choosing: { question: "How did choosing your own Sa feel, compared to being given a fixed note?", options: [opt("natural", "More natural", "good"), opt("same", "About the same"), opt("unsure", "Not sure yet")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= SA_MAX;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c2 = (ClassActivity.get("L2C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    const c1 = (ClassActivity.get("L2C01").answers.setup || {}).note;
    if (ok(c1)) return c1;
    const f25 = (ClassActivity.get("L1C25").answers.setup || {}).note;
    if (ok(f25)) return f25;
    const f2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(f2)) return f2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];

  function derivedCheckpoints(rec) {
    const out = {};
    if (KNOWLEDGE_CHECK.every((k) => q(rec, `kc_${k.key}`)) && !!rec.checkpoints.lessonViewed) out.understood = true;
    if (typeof A(rec, "setup").note === "number") out.chosenSa = true;
    if (take(rec, "singTake") || take(rec, "droneAlongTake") || skipped(rec, "sing")) out.triedOrSkipped = true;
    const g = A(rec, "growth");
    if (q(rec, "choosing") && filled(g.learned)) out.reflected = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function knowledgeCheckHtml(rec) {
    return `<div class="flex flex-col gap-5" data-kc>
      ${KNOWLEDGE_CHECK.map((item) => {
        const selected = q(rec, `kc_${item.key}`);
        return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4" data-kc-item="${item.key}">
          <p class="text-sm text-ink-200 mb-2.5">${item.question}</p>
          <div class="flex flex-wrap gap-2">
            ${item.options.map((o) => `<button type="button" data-kc-choice="${o.value}" class="ex-chip ${selected === o.value ? "is-selected" : ""}">${o.label}</button>`).join("")}
          </div>
          ${selected ? `<p class="text-xs mt-2.5 ${item.options.find((o) => o.value === selected).correct ? "text-emerald-300" : "text-amber-300"}">${item.explain[selected]}</p>` : ""}
        </div>`;
      }).join("")}
      <p class="text-xs text-ink-500">This is a quick concept check, not a vocal-performance score.</p>
    </div>`;
  }

  function problems() {
    const items = [
      ["Assuming Sa must be C, or any specific Western note", "Sa is whichever pitch you choose — there is no universally 'correct' Sa."],
      ["Choosing a Sa that feels strained just because it 'sounds lower/higher like a teacher's'", "Choose the pitch that feels easiest in your own voice, today."],
      ["Trying to match the drone perfectly on the first attempt", "Humming near the drone, with small drifting, is completely normal while learning."],
      ["Singing loudly to 'lock onto' the drone", "Volume doesn't help pitch-matching — a relaxed, comfortable hum works better."],
      ["Feeling like you must get this right immediately", "You can revisit and change your chosen Sa in any later class."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a], i) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">Mistake ${i + 1}: ${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 3 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">You chose your Sa.</p>
        <p class="text-sm text-ink-300">Every swara from here on is described relative to this personal reference pitch.</p>
        <p class="text-sm text-ink-100">There's no universal "correct" Sa — only the one that's comfortable for your voice.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 4 — Introduction to Sapta Swaras</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson introduces the seven swaras — Sa Ri Ga Ma Pa Dha Ni — all built from the same Sa you just chose.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Shruti is the reference pitch; Sa is the name for the one you chose.</h3>
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

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section A — A new kind of class", `
          ${narrow(`
            ${p("Classes 1 and 2 explored voice placement and resonance. The next four classes pause the vocal-technique track for a gentle introduction to how Carnatic music organises its notes — starting with the most basic idea of all: shruti and Sa.")}
            ${p("This isn't music theory for its own sake. Everything here is practical, and everything builds directly on the comfortable-reference-pitch exploration you've already been doing.")}
          `)}
          ${flowStrip(["LISTEN", "CHOOSE", "SING", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Section B — Shruti and Sa", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["Shruti is a continuous reference pitch — a steady drone — that singing is tuned against.", "Sa is simply the name for whichever pitch a singer chooses as their own personal reference note.", "Sa is never one fixed Western note. It is not always \"C\" — it is not always any particular note.", "Every other note you'll learn is described only in relation to your own Sa, not in relation to a universal pitch.", "Choosing a comfortable Sa today is the same comfortable-reference-pitch idea from earlier classes, just under its proper name."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          <p class="font-display text-lg text-ink-50 mb-3">A quick check</p>
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("drone", 3, "Section C — Listening to a drone", `
          ${narrow(p("Press play below to hear a steady drone tone. Listen first without singing — just notice how it sounds continuous and unchanging. This is the kind of reference pitch shruti describes."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-drone-toggle class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} <span data-drone-label>Play drone</span></button>
          </div>
          ${narrow(`
            <div class="mt-4">${SelfAssessment.render("droneFeel-q", { ...Q.droneFeel, selected: sel("droneFeel") })}</div>
          `)}
        `)}

        ${chapter("choose", 4, "Section D — Choosing your Sa", `
          ${narrow(p("Use the piano below to explore a few comfortable, middle-range notes. Whichever one feels easiest to sing and return to — that's your Sa for this course. You can change it later if a different note ends up feeling more comfortable."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("sa-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-sa class="vr-btn">${icon("play", "w-4 h-4")} Play my Sa</button>
          </div>
        `, { wide: true })}

        ${chapter("sing", 5, "Section E — Singing with and without the drone", `
          ${narrow(p("First, play the drone (Section C) and hum or sing \"Sa\" gently along with it. Then try singing \"Sa\" on its own, from memory, without the drone playing. Neither attempt needs to be perfectly in tune — the point is noticing, not matching exactly."))}
          ${recCard("droneAlongTake", "Singing \"Sa\" along with the drone", "", 12)}
          ${recCard("singTake", "Singing \"Sa\" on your own, without the drone", "", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("sing")}</div>`)}
        `)}

        ${chapter("mistakes", 6, "Section F — Common beginner mistakes", problems())}

        ${chapter("reflect", 7, "Section G — Reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4 mb-5">
              ${SelfAssessment.render("choosing-q", { ...Q.choosing, selected: sel("choosing") })}
            </div>
            <div class="flex flex-col gap-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="sa-learned">One thing I learned about shruti or Sa</label><textarea id="sa-learned" data-growth="learned" rows="2" class="field" placeholder="In your own words…">${Utils.escapeHtml(growth.learned || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-sa", { placeholder: "e.g. Which note I chose as Sa and why... How singing along with the drone felt... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Section H — Optional practice", `
          ${narrow(`
            ${p("A couple of comfortable minutes: play your Sa, hum it a few times, and notice whether it still feels like the easiest note to return to. It's fine if your answer changes from day to day.")}
            <div data-warmup-note></div>
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
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true);
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- knowledge check ---- */
    function onKcChoice(e) {
      const btn = e.target.closest("[data-kc-choice]");
      if (!btn) return;
      const itemEl = btn.closest("[data-kc-item]");
      const key = itemEl.dataset.kcItem;
      set("q", `kc_${key}`, btn.dataset.kcChoice);
      syncCheckpoints();
      $("[data-kc]").outerHTML = knowledgeCheckHtml(rec0());
      refreshLive();
    }
    container.addEventListener("click", onKcChoice);
    cleanups.push(() => container.removeEventListener("click", onKcChoice));

    /* ---- Section C: drone toggle (held tone, released on second click) ---- */
    let droneHandle = null;
    function onDroneToggle(e) {
      if (!e.target.closest("[data-drone-toggle]")) return;
      const label = $("[data-drone-label]");
      if (droneHandle) {
        droneHandle.release(true);
        droneHandle = null;
        label.textContent = "Play drone";
      } else {
        droneHandle = PianoSynth.noteOn(base(), { velocity: 0.4 });
        label.textContent = "Stop drone";
      }
    }
    container.addEventListener("click", onDroneToggle);
    cleanups.push(() => container.removeEventListener("click", onDroneToggle));
    cleanups.push(() => { if (droneHandle) droneHandle.release(true); });

    /* ---- Section D: piano + playback ---- */
    own(VirtualPiano.wire(container, "sa-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); syncCheckpoints(); refreshLive(); } },
    }));
    function onPlaySa(e) {
      if (!e.target.closest("[data-play-sa]")) return;
      PianoSynth.play(base(), { duration: 1.4, velocity: 0.5 });
    }
    container.addEventListener("click", onPlaySa);
    cleanups.push(() => container.removeEventListener("click", onPlaySa));

    /* ---- skip buttons ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    const NAMES = { droneAlongTake: "Singing Sa with the drone", singTake: "Singing Sa without the drone" };
    const MAX_SECONDS = { droneAlongTake: 12, singTake: 10 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 3 — ${NAMES[k]}`, exercise: `shruti-and-finding-your-sa-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "droneFeel-q": "droneFeel", "choosing-q": "choosing" };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- growth textarea ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => { set("growth", key, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- Common Warm-up note (only if already unlocked) ---- */
    const warmupHost = $("[data-warmup-note]");
    if (warmupHost && Warmup.isUnlocked()) {
      warmupHost.innerHTML = `<p class="text-sm text-ink-400 mt-2">You can also use the <a href="#/warmup" class="text-gold-300 hover:text-gold-200 underline">Common Warm-up</a> before practising, if that feels useful.</p>`;
    }

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-sa", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: A(rec, "growth").learned || "Shruti is a continuous reference pitch; Sa is the name for whichever note I chose as my own personal reference.",
        struggled: "",
        toPractice: "",
        thoughts: "",
      });
      Router.softRefresh(container, ClassDetailPage, params);
    }
    container.addEventListener("click", onComplete);
    cleanups.push(() => container.removeEventListener("click", onComplete));

    cleanups.push(LessonKit.wireViewedSentinel(container, () => { ClassActivity.markCheckpoint(classId, "lessonViewed"); syncCheckpoints(); refreshLive(); }));
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
