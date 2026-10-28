/* ============================================================
   LEVEL 2, CLASS 1 — VOICE PLACEMENT (interactive lesson)

   Rendered by ClassDetailPage for interactive: "voice-placement".

   Curriculum identity: Level 2, Class 1 (`number: 1`, `levelId: 2`
   in data.js, id `L2C01`). `LessonKit.header()` already renders
   "LEVEL {levelId} · CLASS {number}" from those two fields, so this
   correctly displays as "LEVEL 2 · CLASS 01" — no special-casing
   needed anywhere. Levels 2–8 were placeholder-only before this
   class; its 9 "Vocal Technique" siblings (Resonance through First
   Performance Assessment) remain untouched `comingSoon` placeholders
   starting at number 2 (see data.js's `levelClassDefs[2]`).

   Core idea: "Voice placement is a teaching concept used to explore
   the sensations and sound associated with vocal production — not a
   literal instruction to physically move the voice into a body
   part." Deliberately short (10-15 min) and gentle — this is Level
   2's first class, immediately after Level 1's 25-class Foundation,
   so nothing here pushes range, volume, or a specific sensation.

   Honesty boundaries this file keeps, matching every Level 1 class:
   no fabricated pitch/resonance analysis (none exists in this
   codebase); the 3-question knowledge check is never scored or
   treated as a vocal-performance measure; the 1–5 confidence rating
   is explicitly labelled a rating of understanding and comfort, not
   vocal ability; recordings stay private per account exactly like
   every earlier class.

   Deliberately lighter than Level 1's lessons, per this class's own
   spec: the completion checklist is the spec's own literal 4-item
   list (not a 15-25 item tracker), and there is no dedicated
   Practice Timer step — the spec frames ongoing practice as a
   take-home suggestion, not an in-session logged activity.

   Reuses: LessonKit (+ its automatic Warm-up card — already shows
   for any Level 2 class once Warmup.isUnlocked(), which it always
   is by the time Level 1's 25 classes are done, so no new gating
   was needed), VirtualPiano (Class 3), RecordingCard (Class 5),
   ObservationChecklist (Class 5), PersonalNotes, ClassProgress. The
   3-question knowledge check and the body/voice check-in are new,
   small, file-local views — no generic "graded text quiz" component
   exists elsewhere to reuse, and this is the first class to need one.
   ============================================================ */

const VoicePlacementLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "checkin", label: "Check-in" },
    { id: "hum", label: "Hum" },
    { id: "speak", label: "Speak" },
    { id: "vowel", label: "Vowel" },
    { id: "pitch", label: "Pitch" },
    { id: "listen", label: "Listen" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;

  const KNOWLEDGE_CHECK = [
    {
      key: "concept",
      question: "What does “voice placement” mean in this course?",
      options: [
        { value: "body", label: "Physically moving your voice into your nose, chest or forehead", correct: false },
        { value: "concept", label: "A teaching concept for exploring vocal sensation and sound — not a literal body location", correct: true },
        { value: "rule", label: "A rule that everyone must feel the exact same vibration", correct: false },
      ],
      explain: { body: "Not quite — placement describes a sensation, not a real physical destination for your voice.", concept: "Exactly. It's a way of noticing sensation and sound, not a literal instruction.", rule: "Not quite — sensations genuinely differ between people." },
    },
    {
      key: "volume",
      question: "Which of these is true?",
      options: [
        { value: "comfortable", label: "A comfortable tone doesn't need to be loud", correct: true },
        { value: "louder", label: "More volume always means better placement", correct: false },
        { value: "nasal", label: "A nasal sound is always good resonance", correct: false },
      ],
      explain: { comfortable: "Right — comfort and clarity matter far more than loudness.", louder: "Not quite — volume isn't a measure of good placement.", nasal: "Not quite — a nasal sound isn't automatically \"good resonance.\"" },
    },
    {
      key: "tension",
      question: "If an exercise feels tense or forced, what should I do?",
      options: [
        { value: "push", label: "Push through it to find the sensation", correct: false },
        { value: "louder", label: "Increase volume to feel more resonance", correct: false },
        { value: "stop", label: "Stop, relax, and return to a comfortable sound", correct: true },
      ],
      explain: { push: "Not quite — pushing through tension is exactly what this class asks you not to do.", louder: "Not quite — more volume won't resolve tension.", stop: "Exactly right. Reduce, relax, and come back to something easy." },
    },
  ];

  const PROGRESS_ITEMS = [
    { key: "understood", label: "I understand the basic idea of voice placement." },
    { key: "triedOrSkipped", label: "I tried at least one comfortable exercise, or chose to skip for comfort." },
    { key: "reflected", label: "I reflected on what I heard or felt." },
    { key: "notesSaved", label: "I saved my notes, if I wanted to." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    checkin: { question: "How does your speaking voice feel right now?", options: [opt("comfortable", "Comfortable", "good"), opt("tense", "Slightly tense", "maybe"), opt("uncomfortable", "Uncomfortable; I need a break", "miss")] },
    easiestExercise: { question: "Which exercise felt easiest?", options: [opt("hum", "Easy humming"), opt("speak", "Speaking into a hum"), opt("vowel", "Vowel exploration"), opt("pitch", "Pitch exploration"), opt("notsure", "Not sure")] },
    hardestExercise: { question: "Which exercise felt most difficult?", options: [opt("hum", "Easy humming"), opt("speak", "Speaking into a hum"), opt("vowel", "Vowel exploration"), opt("pitch", "Pitch exploration"), opt("none", "None of them")] },
    tension: { question: "Did your throat, jaw, or shoulders feel tense?", options: [opt("no", "Not at all", "good"), opt("some", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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
    const c25 = (ClassActivity.get("L1C25").answers.setup || {}).note;
    if (ok(c25)) return c25;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const skipped = (rec, k) => !!A(rec, "skip")[k];

  function derivedCheckpoints(rec) {
    const out = {};
    if (KNOWLEDGE_CHECK.every((k) => q(rec, `kc_${k.key}`)) && !!rec.checkpoints.lessonViewed) out.understood = true;
    const EX_KEYS = ["hum", "speak", "vowel", "pitch"];
    const RECS = { hum: "humTake", speak: "speakHumTake", vowel: "vowelTake", pitch: "pitchTake" };
    if (EX_KEYS.some((k) => take(rec, RECS[k]) || skipped(rec, k))) out.triedOrSkipped = true;
    const g = A(rec, "growth");
    if (q(rec, "easiestExercise") && q(rec, "hardestExercise") && filled(g.learned)) out.reflected = true;
    out.notesSaved = true; // "if I wanted to" — never forced, matching the spec's own wording
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
      ["Pushing sound toward the nose", "Do not force sound into the nose. Return to a gentle, comfortable hum or speaking voice."],
      ["Making the sound louder to feel more resonance", "Reduce volume. Explore the sound comfortably rather than trying to manufacture a sensation."],
      ["Tightening the jaw or throat", "Pause, relax, and return to ordinary speech. Skip the exercise if tension persists."],
      ["Trying to copy a professional singer's tone", "Focus on a comfortable sound that belongs to you. Tone development takes time."],
      ["Believing every exercise must create vibration in the face", "Sensations vary. The absence of a particular vibration doesn't automatically mean the exercise is wrong."],
      ["Practising for too long", "Keep the first session short. Rest is part of learning."],
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 1 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Welcome to voice development.</p>
        <p class="text-sm text-ink-300">There was no perfect sensation to find today — just exploring.</p>
        <p class="text-sm text-ink-100">You now have a starting vocabulary for noticing comfort, ease and tone.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Next: Level 2, Class 2 — Resonance</p>
        <p class="text-sm text-ink-300 leading-relaxed">In this lesson, we will explore how the shape of the vocal tract affects the sound we hear. You will learn the difference between changing your tone and simply singing louder. We will continue using comfortable exercises rather than forcing a particular sensation.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Discover a comfortable, clear, and easy way to begin shaping your singing tone.</h3>
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
    const recordingAvailable = VoiceRecorder.isSupported();

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Welcome to Level 2!", `
          ${p("In Foundation, you began learning pitch, rhythm, breathing, transitions, and how to listen to your own voice. Now we begin exploring how your voice produces different qualities of sound.")}
          ${p("Voice placement is not about pushing sound into your nose, throat, chest, or forehead. It is about learning to notice your sound, your comfort, and the way small changes in vocal production affect your tone.")}
          ${p("There is no need to find a perfect sensation today. We are simply exploring. Around 10–15 minutes, with optional breaks — you don't need to complete every exercise in one sitting.")}
          ${flowStrip(["NOTICE", "EXPLORE", "LISTEN", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Understanding voice placement", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-5">
              ${["Voice placement is a way of exploring the perceived focus and quality of vocal sound.", "The sound we hear is affected by vocal-fold vibration and the shape of the vocal tract, including the throat, mouth and tongue.", "Sensations of vibration around the lips, face or chest may occur, but they are not reliable standalone proof of correct technique.", "A comfortable tone does not need to be loud.", "The goal is not to imitate a professional singer's tone immediately.", "Each person's voice is different."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          <p class="font-display text-lg text-ink-50 mb-3">A quick check</p>
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("checkin", 3, "Body and voice check-in", `
          ${narrow(`
            ${p("Sit or stand comfortably. Release unnecessary tension in your shoulders and jaw. Breathe normally — no deliberate big breath. Say a short, comfortable phrase in your ordinary speaking voice, and notice whether your throat, jaw and shoulders feel relaxed.")}
            ${SelfAssessment.render("checkin-q", { ...Q.checkin, selected: sel("checkin") })}
            <div data-checkin-notice class="mt-3"></div>
          `)}
        `)}

        ${chapter("hum", 4, "Exercise 1 — Easy humming", `
          ${narrow(`
            ${p("A comfortable, ordinary breath. A soft, easy “mmm” at a natural pitch, jaw and face relaxed, for about 2–3 seconds. Rest normally. Repeat three to five times only if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">A gentle vibration around the lips or face may be noticeable — but it isn't mandatory.</p>
          `)}
          ${recCard("humTake", "Easy humming", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("hum")}</div>`)}
        `)}

        ${chapter("speak", 5, "Exercise 2 — Speaking into a gentle hum", `
          ${narrow(`
            ${p("Say “mmm-hmm” naturally, as if acknowledging someone — notice the ordinary speaking quality. Then repeat the first part as a gentle hum, without increasing volume. Rest. Repeat up to three times if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">This is an exploration, not a test — there's no specific facial sensation or vocal colour to aim for.</p>
          `)}
          ${recCard("speakHumTake", "“mmm-hmm” → gentle hum", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("speak")}</div>`)}
        `)}

        ${chapter("vowel", 6, "Exercise 3 — Gentle vowel exploration", `
          ${narrow(`
            ${p("A comfortable, middle speaking range, soft-to-normal volume. Hum gently, then open into each vowel without pushing: “mmm–ah,” “mmm–oo,” “mmm–ee.” Keep the jaw reasonably relaxed, use one comfortable pitch, rest between repetitions. Repeat each pattern two or three times at most, if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">No vowel is "correct" placement — vowels naturally sound different because the vocal tract changes shape.</p>
          `)}
          ${recCard("vowelTake", "“mmm–ah” · “mmm–oo” · “mmm–ee”", "", 20)}
          ${narrow(`<div class="mt-3">${skipBtn("vowel")}</div>`)}
        `)}

        ${chapter("pitch", 7, "Exercise 4 — Gentle pitch exploration", `
          ${narrow(p("Choose a comfortable reference note, listen to it, then hum it gently or sing a comfortable “oo.” If easy, try one nearby note slightly higher, then return — don't extend the range to reach a high or low note. Stop if the voice becomes tight, pressed or uncomfortable."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vp-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} One note higher, then back</button>
          </div>
          ${recCard("pitchTake", "Hum or sing “oo” on your reference note", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
          <p class="text-xs text-ink-500 mt-3">This class doesn't label your voice as chest, head or mixed — that comes later.</p>
        `, { wide: true })}

        ${chapter("listen", 8, "Listening and reflection", `
          ${narrow(p("Listen for comfort, clarity, unnecessary breathiness or a pressed sound, changes between speech and humming, and changes in tone between vowels. Recording quality, background noise, microphone placement and room acoustics can all affect what you hear."))}
          ${recordingAvailable ? recCard("listeningSample", "A short sample", "One spoken phrase, a gentle hum, and one comfortable vowel.", 25) : `
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-sm text-ink-300 mb-3">Recording isn't available in this browser — that's completely fine. Write a short reflection instead.</p>
              <textarea data-written-reflection rows="3" class="field" placeholder="What did you notice about comfort, clarity, or how your voice changed?">${Utils.escapeHtml(growth.writtenReflection || "")}</textarea>
            </div>`}
          <div class="mt-4">${ObservationChecklist.render("vp-listen-obs", [{ key: "noticed", title: "What did you notice?", prompt: "Choose any that fit — this is awareness, not a diagnosis.", options: ["Comfortable", "Clear", "A little breathy", "A little pressed", "Speech and hum felt connected", "Vowels sounded different", "Not sure"] }], { noticed: A(rec, "obs").noticed || [] })}</div>
        `)}

        ${chapter("mistakes", 9, "Common mistakes and corrections", problems())}

        ${chapter("reflect", 10, "Personal notes and assessment", `
          ${narrow(`
            <div class="flex flex-col gap-4 mb-5">
              ${SelfAssessment.render("easiestExercise-q", { ...Q.easiestExercise, selected: sel("easiestExercise") })}
              ${SelfAssessment.render("hardestExercise-q", { ...Q.hardestExercise, selected: sel("hardestExercise") })}
              ${SelfAssessment.render("tension-q", { ...Q.tension, selected: sel("tension") })}
            </div>
            <div class="flex flex-col gap-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="vp-vibration">Any vibration or sound changes I noticed</label><textarea id="vp-vibration" data-growth="vibrationNotes" rows="2" class="field" placeholder="A short note, if anything stood out…">${Utils.escapeHtml(growth.vibrationNotes || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="vp-learned">One thing I learned</label><textarea id="vp-learned" data-growth="learned" rows="2" class="field" placeholder="In your own words…">${Utils.escapeHtml(growth.learned || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="vp-question">One question I want to explore next class</label><textarea id="vp-question" data-growth="nextQuestion" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.nextQuestion || "")}</textarea></div>
            </div>
            <div class="mt-5">
              <p class="text-sm text-ink-200 mb-2">How confident do I feel about the idea of voice placement? <span class="text-xs text-ink-500">(a rating of understanding and comfort, not vocal ability)</span></p>
              <div class="flex gap-2" data-confidence>
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-confidence-value="${n}" class="w-10 h-10 rounded-full border text-sm font-medium transition-colors ${q(rec, "confidence") === String(n) ? "border-gold-400/50 bg-gold-500/15 text-gold-300" : "border-white/10 text-ink-400 hover:bg-white/5"}">${n}</button>`).join("")}
              </div>
            </div>
          `)}
        `)}

        ${chapter("complete", 11, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vp", { placeholder: "e.g. What felt easiest today... What I noticed about my tone... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Practice assignment", `
          ${narrow(`
            ${p("For the next few days, spend approximately 3–5 comfortable minutes exploring a gentle hum and one or two vowels. This is optional practice, not a requirement to sing every day.")}
            ${p("Do not increase volume or range to chase a particular sensation. Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- check-in ---- */
    function onCheckin(e) {
      const chip = e.target.closest('[data-assess="checkin-q"] [data-assess-choice]');
      if (!chip) return;
      const value = chip.dataset.assessChoice;
      set("q", "checkin", value);
      const notice = $("[data-checkin-notice]");
      notice.innerHTML = value === "uncomfortable"
        ? `<p class="text-sm text-amber-300">It's okay to pause here. Come back to the exercises below when you feel ready — there's no rush.</p>`
        : "";
      refreshLive();
    }
    container.addEventListener("click", onCheckin);
    cleanups.push(() => container.removeEventListener("click", onCheckin));

    /* ---- Exercise 4: piano + playback ---- */
    own(VirtualPiano.wire(container, "vp-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
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
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    const NAMES = { humTake: "Easy humming", speakHumTake: "Speaking into a hum", vowelTake: "Vowel exploration", pitchTake: "Pitch exploration", listeningSample: "Listening sample" };
    const MAX_SECONDS = { humTake: 15, speakHumTake: 15, vowelTake: 20, pitchTake: 15, listeningSample: 25 };
    Object.keys(NAMES).forEach((k) => {
      if (!container.querySelector(`[data-rc="rc-${k}"]`)) return;
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 1 — ${NAMES[k]}`, exercise: `voice-placement-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints(); refreshLive(); },
      }));
    });

    /* ---- written reflection fallback (no recording support) ---- */
    const writtenEl = $("[data-written-reflection]");
    if (writtenEl) {
      const save = Utils.debounce((v) => { set("growth", "writtenReflection", v); syncCheckpoints(); refreshLive(); }, 500);
      writtenEl.addEventListener("input", () => save(writtenEl.value));
    }

    /* ---- listening observation checklist ---- */
    cleanups.push(ObservationChecklist.wire(container, "vp-listen-obs", {
      selected: { noticed: A(rec0(), "obs").noticed || [] },
      onChange: (_, values) => { set("obs", "noticed", values); refreshLive(); },
    }));

    /* ---- generic self-assess dispatcher (easiest/hardest/tension) ---- */
    const assessMap = { "easiestExercise-q": "easiestExercise", "hardestExercise-q": "hardestExercise", "tension-q": "tension" };
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

    /* ---- growth textareas ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => { set("growth", key, v); syncCheckpoints(); refreshLive(); }, 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- confidence rating ---- */
    function onConfidence(e) {
      const btn = e.target.closest("[data-confidence-value]");
      if (!btn) return;
      set("q", "confidence", btn.dataset.confidenceValue);
      container.querySelectorAll("[data-confidence-value]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("border-gold-400/50", on); b.classList.toggle("bg-gold-500/15", on); b.classList.toggle("text-gold-300", on);
        b.classList.toggle("border-white/10", !on); b.classList.toggle("text-ink-400", !on);
      });
    }
    container.addEventListener("click", onConfidence);
    cleanups.push(() => container.removeEventListener("click", onConfidence));

    /* ---- Common Warm-up note (only if already unlocked) ---- */
    const warmupHost = $("[data-warmup-note]");
    if (warmupHost && Warmup.isUnlocked()) {
      warmupHost.innerHTML = `<p class="text-sm text-ink-400 mt-2">You can also use the <a href="#/warmup" class="text-gold-300 hover:text-gold-200 underline">Common Warm-up</a> before practising, if that feels useful.</p>`;
    }

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-vp", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: A(rec, "growth").learned || "Voice placement is a way of exploring sensation and sound, not a literal body location.",
        struggled: q(rec, "hardestExercise") || "",
        toPractice: A(rec, "growth").nextQuestion || "",
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
