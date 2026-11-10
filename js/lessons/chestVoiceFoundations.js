/* ============================================================
   LEVEL 2, CLASS 7 — CHEST VOICE FOUNDATIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "chest-voice-foundations".

   Curriculum identity: Level 2, Class 7 (`number: 7`, `levelId: 2`
   in data.js, explicit id `L2C03` — unchanged since the Level 2
   Curriculum Upgrade, which moved this class from old number 3 to
   new number 7 without touching its id). Rebuilt against this
   class's own later, more detailed "Claude Prompt" spec (a dedicated
   speaking-voice recognition section, three named gentle exercises
   A/B/C, a 4-row chest-voice-vs-shouting table, a separate listen-
   and-observe section, a 6-step self-practice routine, a 5-question
   knowledge check, and a 6-item checklist) — supersedes the shorter
   version first written earlier in the project.

   Core idea: "Chest voice should feel natural and comfortable, not
   pushed or shouted." Chest voice is a name for a vocal coordination
   commonly associated with comfortable speaking and lower-to-middle
   pitches — not a sensation to search for, not the same as shouting,
   and not something every singer feels identically.

   Honesty boundaries this spec asks for explicitly: no fabricated
   vocal analysis or automatic register identification; Section 5
   ("Listen and observe") never asks the learner to diagnose their
   own register solely by listening — it only asks them to notice
   tone, comfort, loudness and pressed-ness, framed as awareness, not
   diagnosis. No professionally-recorded comparison audio exists in
   this project, so Section 5 reuses the learner's OWN Section 3
   recordings rather than fabricating or implying a studio reference
   demonstration.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), PersonalNotes, ClassProgress.
   ============================================================ */

const ChestVoiceFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "recognise", label: "Recognise" },
    { id: "exercises", label: "Exercises" },
    { id: "compare", label: "Compare" },
    { id: "listen", label: "Listen" },
    { id: "practice", label: "Practice" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const GREETING = "Hello, how are you?";

  const KNOWLEDGE_CHECK = [
    {
      key: "associated",
      question: "What is chest voice commonly associated with?",
      options: [
        { value: "shout", label: "Shouting as loudly as possible", correct: false },
        { value: "speaking", label: "Comfortable speaking and lower-to-middle singing pitches", correct: true },
        { value: "highest", label: "The highest notes in your range", correct: false },
      ],
      explain: { shout: "Not quite — chest voice has nothing to do with shouting.", speaking: "Exactly right.", highest: "Not quite — that's a different part of the range." },
    },
    {
      key: "literalChest",
      question: "Does chest voice mean the sound physically originates in the chest?",
      options: [
        { value: "yes", label: "Yes, exactly in the chest", correct: false },
        { value: "no", label: "No — it's a name for a coordination, not a literal location", correct: true },
        { value: "some", label: "Only for some singers", correct: false },
      ],
      explain: { yes: "Not quite — the name doesn't describe a literal sound source.", no: "Right.", some: "Not quite — this is true for every singer, not just some." },
    },
    {
      key: "shoutingSame",
      question: "Is shouting the same as chest voice?",
      options: [
        { value: "yes", label: "Yes, they're identical", correct: false },
        { value: "no", label: "No — shouting is forceful and strained; chest voice is relaxed and controlled", correct: true },
        { value: "louder", label: "Shouting is just a louder version of it", correct: false },
      ],
      explain: { yes: "Not quite — they're quite different.", no: "Exactly right.", louder: "Not quite — the difference is comfort and control, not just volume." },
    },
    {
      key: "forced",
      question: "Should chest voice exercises feel forced?",
      options: [
        { value: "yes", label: "Yes, a little forcing helps develop it", correct: false },
        { value: "no", label: "No — they should feel natural and comfortable", correct: true },
        { value: "sometimes", label: "Only on lower notes", correct: false },
      ],
      explain: { yes: "Not quite — forcing works against comfortable coordination.", no: "Right.", sometimes: "Not quite — comfort matters at every pitch." },
    },
    {
      key: "vibrationReliable",
      question: "Can vibration sensations alone reliably identify a vocal register?",
      options: [
        { value: "yes", label: "Yes, vibration always confirms the register", correct: false },
        { value: "no", label: "No — sensations vary between people and aren't a reliable test", correct: true },
        { value: "unsure", label: "This hasn't been mentioned in this course", correct: false },
      ],
      explain: { yes: "Not quite — sensations genuinely differ between singers.", no: "Exactly right.", unsure: "It has — Section 1 says this explicitly." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what chest voice means." },
    { key: "recogniseSpeaking", label: "I can recognise my comfortable speaking voice." },
    { key: "humGently", label: "I can hum gently." },
    { key: "speechLikeWithoutPushing", label: "I can explore speech-like singing without pushing." },
    { key: "understandShoutingDiff", label: "I understand the difference between chest-dominant singing and shouting." },
    { key: "recogniseRestNeeded", label: "I can recognise when my voice needs rest." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
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
    const rows = [
      ["Relaxed and controlled", "Often forceful"],
      ["Comfortable volume", "Excessive loudness"],
      ["Clear sound", "Can sound strained"],
      ["Easy to repeat", "May cause fatigue"],
    ];
    return `
      <table class="w-full text-sm text-ink-300 mb-3"><tbody>
        <tr class="border-b border-white/5"><td class="py-2"></td><td class="py-2 font-display text-emerald-300">Comfortable chest-dominant singing</td><td class="py-2 font-display text-amber-300">Shouting</td></tr>
        ${rows.map(([a, b]) => `<tr class="border-b border-white/5"><td class="py-2 text-ink-500"></td><td class="py-2">${a}</td><td class="py-2">${b}</td></tr>`).join("")}
      </tbody></table>
      <p class="text-xs text-ink-500">Loudness alone does not identify chest voice. These are beginner observations, not a diagnosis of your vocal technique.</p>`;
  }

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

  function reviewHtml(rec) {
    const sources = [["speakGreeting", "Speaking the greeting"], ["humTake", "Comfortable humming"], ["speechToSongTake", "Speech-to-song"], ["gentleNotesTake", "Gentle short notes"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the Section 3 exercises above, then come back here to listen and notice.</p>`;
    return `<div class="flex flex-wrap gap-2">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 7 milestone</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 8 — Head Voice Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore a different vocal coordination through gentle, comfortable sounds — no advanced head-voice exercises yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Chest voice should feel natural and comfortable, not pushed or shouted.</h3>
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
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section 1 — What is chest voice?", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Chest voice is commonly used in speaking and in many lower-to-middle singing notes.", "It often produces a fuller, speech-like sound.", "The term describes a vocal register or coordination — not sound physically originating in the chest.", "Some singers feel vibration around the chest, but this sensation is not a reliable test of register."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            ${p("There's a real difference between comfortable chest-dominant singing, shouting, and pressing or forcing the voice — this class explores the first, and avoids the other two.")}
          `)}
          ${flowStrip(["RECOGNISE", "EXPLORE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("recognise", 2, "Section 2 — Recognising your comfortable speaking voice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Relax the shoulders and jaw.", "Speak a short, comfortable sentence.", "Notice the natural pitch and tone.", "Repeat the sentence gently.", "Transition into a soft, comfortable hum."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${GREETING}”</p>
            <p class="text-xs text-ink-500 mb-4">This is an awareness exercise, not a test of vocal range.</p>
          `)}
          ${recCard("speakGreeting", "Say the greeting, then a soft hum", "", 15)}
        `)}

        ${chapter("exercises", 3, "Section 3 — Gentle chest-dominant exercises", `
          ${narrow(p("Exercises B and C use the same comfortable mid-range pitch — choose one on the piano below."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("cv-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-6">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise A — Comfortable humming</p>${p("Hum gently at a comfortable pitch. Keep the jaw and throat relaxed. Stop before any feeling of pressure develops.")}`)}
          ${recCard("humTake", "Gentle humming", "", 15)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("hum")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise B — Speech-to-song</p>${p("Speak the greeting naturally, then repeat it on your comfortable single pitch. Avoid making the sound louder or heavier.")}`)}
          ${recCard("speechToSongTake", "The greeting, spoken then sung on one pitch", "", 15)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("speechToSong")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise C — Gentle short notes</p>${p("On your comfortable mid-range pitch, sing a short “ma” or “mum” sound gently. Repeat only a few times.")}`)}
          ${recCard("gentleNotesTake", "A gentle “ma” or “mum”", "", 12)}
          ${narrow(`<div class="mt-2">${skipBtn("gentleNotes")}</div>`)}
        `, { wide: true })}

        ${chapter("compare", 4, "Section 4 — Chest voice versus shouting", compareHtml())}

        ${chapter("listen", 5, "Section 5 — Listen and observe", `
          ${narrow(p("No studio comparison recording exists in this app — instead, listen back to your own Section 3 exercises above and simply notice:"))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mt-4 mb-3">
              ${["Tone quality.", "Comfort.", "Loudness.", "Whether the sound feels pressed."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-xs text-ink-500">This is awareness, not diagnosis — this class never asks you to determine your own vocal register just by listening.</p>
          `)}
        `)}

        ${chapter("practice", 6, "Section 6 — Practical self-practice", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Relax the body.", "Speak naturally.", "Hum gently.", "Try a comfortable speech-like sung phrase.", "Rest.", "Reflect on whether the sound remained easy and comfortable."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${recCard("practiceRoutineTake", "The self-practice routine", "Entirely optional.", 20)}
        `)}

        ${chapter("quiz", 7, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 8, "Self-assessment and reflection", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, a successful recording, or finishing every optional exercise.")}
            <div class="flex flex-col gap-1 mb-6">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="cv-reflection">Did your comfortable speech-like singing feel different from your usual speaking voice? Did you notice any tension or pressure?</label><textarea id="cv-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 9, "Common beginner mistakes", problems())}

        ${chapter("complete", 10, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-cv", { placeholder: "e.g. How the greeting felt compared to humming... Any tension I noticed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Vocal safety", `
          ${narrow(`
            ${p("Never shout. Don't force low notes, and don't increase volume to imitate anything. Encourage gentle practice and breaks.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort. If discomfort continues, seek advice from a qualified voice professional or healthcare professional.")}
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

    /* ---- knowledge check ---- */
    function onKcChoice(e) {
      const btn = e.target.closest("[data-kc-choice]");
      if (!btn) return;
      const itemEl = btn.closest("[data-kc-item]");
      const key = itemEl.dataset.kcItem;
      set("q", `kc_${key}`, btn.dataset.kcChoice);
      $("[data-kc]").outerHTML = knowledgeCheckHtml(rec0());
    }
    container.addEventListener("click", onKcChoice);
    cleanups.push(() => container.removeEventListener("click", onKcChoice));

    /* ---- Section 3: piano + playback ---- */
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
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = { speakGreeting: "Greeting and hum", humTake: "Comfortable humming", speechToSongTake: "Speech-to-song", gentleNotesTake: "Gentle short notes", practiceRoutineTake: "Self-practice routine" };
    const MAX_SECONDS = { speakGreeting: 15, humTake: 15, speechToSongTake: 15, gentleNotesTake: 12, practiceRoutineTake: 20 };
    const REVIEW_SOURCE_KEYS = ["speakGreeting", "humTake", "speechToSongTake", "gentleNotesTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 7 — ${NAMES[k]}`, exercise: `chest-voice-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_SOURCE_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section 5: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- growth textarea (reflection) ---- */
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
    own(PersonalNotes.wire(container, "notes-cv", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Chest voice is just a comfortable, speech-like coordination — not a sensation to chase or a reason to force volume or low pitches.",
        struggled: "",
        toPractice: A(rec0(), "growth").reflection || "",
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
