/* ============================================================
   LEVEL 2, CLASS 3 — SHRUTI AND FINDING YOUR SA (interactive lesson)

   Rendered by ClassDetailPage for interactive: "shruti-and-finding-your-sa".

   Curriculum identity: Level 2, Class 3 (`number: 3`, `levelId: 2`
   in data.js, explicit id `L2C26`). Rebuilt against this class's own
   later, more detailed "Claude Prompt" spec (5 teaching sections, a
   5-question knowledge check, 3 named stability exercises A/B/C, and
   a 6-item self-assessment checklist + single reflection question) —
   supersedes the shorter version first written during the Level 2
   Curriculum Upgrade. Still the first of four new "Musical
   Foundations" classes inserted between Resonance (Class 2) and
   Chest Voice Foundations (now Class 7); Classes 4-6 (`L2C27`-`29`)
   are unaffected by this rebuild.

   Core idea: shruti is the pitch reference a singer tunes against —
   distinct from tala, which is about rhythm, not pitch — and Sa is
   simply the name for whichever pitch a singer chooses as that
   reference. Sa is never assumed to be any particular Western note
   (never "C") — it is deliberately chosen here, on the learner's own
   piano, and carried forward by every later class's baseNote() chain.

   Honesty boundaries this spec asks for explicitly, kept throughout:
   the "drone" is a synthesized sustained tone (`PianoSynth.noteOn`),
   not a recorded tanpura — labelled as such in Section 4, with a
   plain note about what a real tanpura/drone audio asset would add
   if one is ever recorded or licensed for the project. Exercise C
   ("Recognise Sa") is a genuine, honestly-gradable listening exercise
   — it plays a known, deterministic sequence of synthesized notes and
   asks which one was Sa; it is NOT a claim that the app can detect or
   analyse the learner's own sung pitch. No fabricated pitch-detection
   anywhere. Completion never depends on a particular pitch, a
   recording, or getting Exercise C right.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano,
   PianoSynth.noteOn (drone) / .playSequence (Exercise C), RecordingCard,
   SelfAssessment is not needed here (plain checklist + chip quiz
   instead, matching the spec's own "knowledge check" / "self-
   assessment checklist" split), PersonalNotes, ClassProgress.
   ============================================================ */

const ShrutiAndFindingYourSaLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Shruti" },
    { id: "sa", label: "Sa" },
    { id: "finding", label: "Finding Sa" },
    { id: "drone", label: "Drone" },
    { id: "stability", label: "Stability" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12; // leave room above Sa for later classes' upper octave

  const KNOWLEDGE_CHECK = [
    {
      key: "shruti",
      question: "What does Shruti refer to?",
      options: [
        { value: "volume", label: "How loudly a singer performs", correct: false },
        { value: "ref", label: "The pitch reference or tonal foundation a singer tunes against", correct: true },
        { value: "tala", label: "A rhythmic cycle", correct: false },
      ],
      explain: { volume: "Not quite — shruti isn't about loudness.", ref: "Exactly. Shruti is the pitch reference everything else is heard in relation to.", tala: "Not quite — that's tala, a separate, rhythm-related idea." },
    },
    {
      key: "saUse",
      question: "What is Sa used for?",
      options: [
        { value: "fixed", label: "As a fixed note every singer must use", correct: false },
        { value: "ref", label: "As the singer's own reference note, with every other swara described relative to it", correct: true },
        { value: "volume", label: "As a volume marker", correct: false },
      ],
      explain: { fixed: "Not quite — Sa isn't the same note for every singer.", ref: "Right — Sa is your personal reference point for everything else you'll learn.", volume: "Not quite — Sa has nothing to do with loudness." },
    },
    {
      key: "saFixed",
      question: "Is Sa always the Western note C?",
      options: [
        { value: "yes", label: "Yes, Sa is always C", correct: false },
        { value: "no", label: "No — Sa is whichever pitch the singer personally chooses", correct: true },
        { value: "beginners", label: "Only for beginners", correct: false },
      ],
      explain: { yes: "Not quite — Sa is never fixed to one Western note like C.", no: "Exactly right.", beginners: "Not quite — this is true for every singer, not just beginners." },
    },
    {
      key: "whyComfortable",
      question: "Why should a singer choose a comfortable Sa?",
      options: [
        { value: "comfort", label: "Because every voice is comfortable in a different pitch range", correct: true },
        { value: "loud", label: "So the singer can sing as loudly as possible", correct: false },
        { value: "none", label: "It doesn't matter which Sa is chosen", correct: false },
      ],
      explain: { comfort: "Right — a comfortable Sa keeps every later swara within an easy range for your own voice.", loud: "Not quite — Sa has nothing to do with volume.", none: "Not quite — a strained Sa makes everything built on top of it harder than it needs to be." },
    },
    {
      key: "droneUse",
      question: "What is the purpose of a tanpura-style drone?",
      options: [
        { value: "ref", label: "To provide a continuous reference pitch to listen and tune against", correct: true },
        { value: "louder", label: "To make the singer sing louder", correct: false },
        { value: "rhythm", label: "To test the singer's rhythm", correct: false },
      ],
      explain: { ref: "Exactly — a drone gives you something steady to check your own pitch against.", louder: "Not quite — the drone isn't about volume.", rhythm: "Not quite — a drone is a pitch reference, not a rhythm tool." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understoodShruti", label: "I understand what Shruti means." },
    { key: "understoodSaReference", label: "I understand why Sa is a reference note." },
    { key: "listenedToSa", label: "I can listen to a Sa reference." },
    { key: "hummedSa", label: "I can hum Sa comfortably." },
    { key: "repeatedGently", label: "I can repeat Sa without forcing my voice." },
    { key: "understoodVariation", label: "I understand why my Sa may differ from another singer's Sa." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  // Exercise C — Recognise Sa: a short, deterministic 3-note sequence (Sa plus two
  // clearly different swaras) in random order. Genuinely gradable because every
  // note played is already known — this never claims to analyse the learner's
  // own singing.
  const RECOGNISE_DISTRACTORS = [4, 7]; // Ga, Pa — clearly different from Sa (0)

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
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  function shuffle3(values) {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function newRecogniseRound() {
    const entries = [{ semitone: 0, isSa: true }, ...RECOGNISE_DISTRACTORS.map((s) => ({ semitone: s, isSa: false }))];
    return shuffle3(entries);
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

  function recogniseHtml(rec) {
    const r = A(rec, "recognise");
    const order = r.order || newRecogniseRound();
    const answered = typeof r.answered === "number" ? r.answered : null;
    const correctIndex = order.findIndex((e) => e.isSa);
    return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5" data-recognise>
      <p class="text-sm text-ink-300 mb-3">Press play, then choose which position you think was Sa.</p>
      <div class="flex flex-wrap gap-2 mb-4" data-recognise-chips>
        ${order.map((_, i) => `<span data-recognise-chip="${i}" class="flow-chip !text-sm">${i + 1}</span>`).join("")}
      </div>
      <div class="flex flex-wrap gap-3 mb-4">
        <button type="button" data-recognise-play class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the sequence</button>
        <button type="button" data-recognise-new class="vr-btn">New sequence</button>
      </div>
      <div class="flex flex-wrap gap-2 mb-2">
        ${order.map((_, i) => `<button type="button" data-recognise-choice="${i}" class="ex-chip ${answered === i ? "is-selected" : ""}">Position ${i + 1}</button>`).join("")}
      </div>
      ${answered !== null ? `<p class="text-xs mt-2 ${answered === correctIndex ? "text-emerald-300" : "text-amber-300"}">${answered === correctIndex ? "Correct — that was Sa." : `Not quite — Sa was actually position ${correctIndex + 1}.`} This is a listening exercise, not a score on your singing.</p>` : ""}
    </div>`;
  }

  function problems() {
    const items = [
      ["Assuming Sa must be C, or any specific Western note", "Sa is whichever pitch you choose — there is no universally 'correct' Sa."],
      ["Choosing a Sa that feels strained just because it 'sounds right'", "Choose the pitch that feels easiest in your own voice, today."],
      ["Trying to match the drone perfectly on the first attempt", "Humming near the drone, with small drifting, is completely normal while learning."],
      ["Singing loudly to 'lock onto' the drone", "Volume doesn't help pitch-matching — a relaxed, comfortable hum works better."],
      ["Feeling like you must get Exercise C right every time", "It's a listening exercise, not a performance test — you can always try a new sequence."],
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
            <h3 class="font-display text-2xl text-ink-50 mb-5">Shruti is the pitch reference; Sa is the name for the one you chose.</h3>
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

        ${chapter("understand", 1, "Section 1 — What is Shruti?", `
          ${narrow(`
            ${p("Before learning to sing different notes, learn to recognise and maintain your own Sa.")}
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Shruti is the pitch reference, or tonal foundation, a singer tunes against.", "A singer uses a chosen Sa as that reference.", "A drone (traditionally a tanpura) provides a continuous pitch reference to check against.", "Singing in tune means keeping your notes aligned with that intended pitch."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-sm text-ink-300 leading-relaxed"><strong class="text-ink-100">Shruti vs. Tala:</strong> Shruti is about pitch. Tala is a separate idea, about rhythmic cycles — not covered in this class.</p>
          `)}
          ${flowStrip(["LISTEN", "CHOOSE", "SING", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("sa", 2, "Section 2 — Understanding Sa", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
              ${["Sa is the first reference swara.", "Sa is not always the Western note C.", "Different singers may select different pitches for Sa.", "Your Sa should be comfortable for your own voice — not copied from someone else's.", "Every other swara you'll learn is understood relative to this Sa."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            ${p("There's no particular pitch you're expected to sing at here — only whichever one feels comfortable to you.")}
          `)}
        `)}

        ${chapter("finding", 3, "Section 3 — Finding your comfortable Sa", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["Relax the body and shoulders.", "Listen to a reference pitch.", "Hum gently without forcing the voice.", "Try a few nearby reference pitches if needed.", "Choose one that feels comfortable and natural.", "Repeat the note gently.", "Check whether the note feels stable and easy to reproduce."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("sa-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your Sa: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-sa class="vr-btn">${icon("play", "w-4 h-4")} Play my Sa</button>
          </div>
        `, { wide: true })}

        ${chapter("drone", 4, "Section 4 — Listen to the Shruti reference", `
          ${narrow(`
            ${p("Press play below to hear a steady reference tone standing in for a tanpura drone.")}
            <p class="text-xs text-ink-500 mb-4">Honesty note: this is a synthesized tone (Web Audio), not a recorded tanpura — no tanpura audio asset exists in this project yet. If one is ever added, it could replace this tone without changing anything else about this lesson.</p>
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Listen to the drone without singing.", "Identify the Sa in the reference.", "Hum along gently.", "Stop humming and listen again.", "Repeat the exercise."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-3">The goal is becoming familiar with the pitch, not singing loudly.</p>
          `)}
          <div class="flex flex-wrap gap-3 mb-4 mt-2">
            <button type="button" data-drone-toggle class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} <span data-drone-label>Play reference tone</span></button>
          </div>
        `)}

        ${chapter("stability", 5, "Section 5 — Sa stability practice", `
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise A — Listen and hum</p>${p("Listen to Sa, then hum Sa comfortably. Repeat up to five times, with a short rest between each.")}`)}
          ${recCard("exerciseA", "Sa, hummed a few times", "Entirely optional.", 20)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("exerciseA")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise B — Maintain Sa</p>${p("Play the reference tone from Section 4, hum along for a few seconds, then pause. Repeat a couple of times.")}`)}
          ${recCard("exerciseB", "Humming along with the reference tone", "Entirely optional.", 20)}
          ${narrow(`<div class="mt-2 mb-8">${skipBtn("exerciseB")}</div>`)}

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise C — Recognise Sa</p>${p("A short sequence of three notes will play, in a random order — one of them is Sa. Listen, then choose which position it was.")}`)}
          <div data-recognise-host>${recogniseHtml(rec)}</div>
        `)}

        ${chapter("quiz", 6, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 7, "Self-assessment and reflection", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-6">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="sa-reflection">Did you find a pitch that felt comfortable and natural to hum? Describe your experience.</label><textarea id="sa-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 8, "Section — Common beginner mistakes", problems())}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-sa", { placeholder: "e.g. Which note I chose as Sa and why... How singing along with the drone felt... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Vocal safety", `
          ${narrow(`
            ${p("Don't force a high or low pitch, and don't strain to match the reference. Gentle humming, with breaks, is enough.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
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

    /* ---- Exercise C: ensure a stable random order exists before any interaction,
       so the "which position was Sa" check never changes between renders ---- */
    if (!A(rec0(), "recognise").order) set("recognise", "order", newRecogniseRound());

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
    own(VirtualPiano.wire(container, "sa-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlaySa(e) {
      if (!e.target.closest("[data-play-sa]")) return;
      PianoSynth.play(base(), { duration: 1.4, velocity: 0.5 });
    }
    container.addEventListener("click", onPlaySa);
    cleanups.push(() => container.removeEventListener("click", onPlaySa));

    /* ---- Section 4: drone toggle (held tone, released on second click) ---- */
    let droneHandle = null;
    function onDroneToggle(e) {
      if (!e.target.closest("[data-drone-toggle]")) return;
      const label = $("[data-drone-label]");
      if (droneHandle) {
        droneHandle.release(true);
        droneHandle = null;
        label.textContent = "Play reference tone";
      } else {
        droneHandle = PianoSynth.noteOn(base(), { velocity: 0.4 });
        label.textContent = "Stop reference tone";
      }
    }
    container.addEventListener("click", onDroneToggle);
    cleanups.push(() => container.removeEventListener("click", onDroneToggle));
    cleanups.push(() => { if (droneHandle) droneHandle.release(true); });

    /* ---- skip buttons (Exercises A/B) ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings (Exercises A/B) ---- */
    const NAMES = { exerciseA: "Exercise A — Listen and hum", exerciseB: "Exercise B — Maintain Sa" };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: 20,
        meta: { name: `Level 2, Class 3 — ${NAMES[k]}`, exercise: `shruti-and-finding-your-sa-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); },
      }));
    });

    /* ---- Exercise C: recognise Sa ---- */
    function refreshRecogniseHost() {
      const host = $("[data-recognise-host]");
      if (host) host.innerHTML = recogniseHtml(rec0());
    }
    function onRecognisePlay(e) {
      if (!e.target.closest("[data-recognise-play]")) return;
      const rec = rec0();
      const r = A(rec, "recognise");
      const order = r.order || newRecogniseRound();
      if (!r.order) set("recognise", "order", order);
      const b = base();
      PianoSynth.playSequence(order.map((entry) => b + entry.semitone), {
        duration: 0.8, gap: 0.3,
        onNote: (i) => {
          container.querySelectorAll("[data-recognise-chip]").forEach((chip) => chip.classList.toggle("is-selected", Number(chip.dataset.recogniseChip) === i));
        },
      });
    }
    function onRecogniseNew(e) {
      if (!e.target.closest("[data-recognise-new]")) return;
      set("recognise", "order", newRecogniseRound());
      set("recognise", "answered", null);
      refreshRecogniseHost();
    }
    function onRecogniseChoice(e) {
      const btn = e.target.closest("[data-recognise-choice]");
      if (!btn) return;
      const i = Number(btn.dataset.recogniseChoice);
      set("recognise", "answered", i);
      refreshRecogniseHost();
    }
    container.addEventListener("click", onRecognisePlay);
    container.addEventListener("click", onRecogniseNew);
    container.addEventListener("click", onRecogniseChoice);
    cleanups.push(() => container.removeEventListener("click", onRecognisePlay));
    cleanups.push(() => container.removeEventListener("click", onRecogniseNew));
    cleanups.push(() => container.removeEventListener("click", onRecogniseChoice));

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
        learned: "Shruti is a continuous pitch reference; Sa is the name for whichever note I chose as my own personal reference.",
        struggled: "",
        toPractice: A(rec, "growth").reflection || "",
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
