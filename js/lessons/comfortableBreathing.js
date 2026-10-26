/* ============================================================
   CLASS 2 — COMFORTABLE BREATHING FOR SINGING (interactive lesson)

   Rendered by ClassDetailPage for interactive: "comfortable-breathing".

   Core idea: "Learn to breathe comfortably before trying to control
   the breath." NOT a lung-capacity workout: nothing here measures,
   rewards or compares breath duration — no countdown numbers, no
   "longest/best breath", no capacity meter, no leaderboard. Every
   breathing guide can be stopped at any moment and ends in normal
   breathing. Dizziness / light-headedness / chest discomfort →
   stop, breathe normally, rest (shown before every guided exercise).

   Flow: observe → natural inhale/exhale → gentle "sss" → breath+hum
   → breath+speech → short sung phrase → breath+pitch → breath and
   rest → tension → shoulders → breath before a phrase → record
   breath+voice → what breath support is NOT → self-evaluation →
   practice → assignment/reflection → complete.

   Reuses: LessonKit, VirtualPiano (Class 3), PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard + WaveformPlayer +
   ObservationChecklist (Class 5), the Class 7 breathing-circle
   styling, ControlCheck (per-row answer sets), the Class 1
   speak→hum tile style, Timer, PersonalNotes, ClassProgress,
   ClassActivity (per-user, synced to Supabase; owner-only).
   ============================================================ */

const ComfortableBreathingLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "notice", label: "Notice" },
    { id: "exhale", label: "Exhale" },
    { id: "sound", label: "Breath + sound" },
    { id: "phrase", label: "Phrase" },
    { id: "pitch", label: "Pitch" },
    { id: "aware", label: "Awareness" },
    { id: "record", label: "Record" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const PRACTICE_TASK = "breath"; // same task key as Class 11
  const PRACTICE_CATEGORY = "Breathing Awareness";
  const RANGE = { from: 48, to: 72 };
  const VOICE_NOTES = { lower: 50, higher: 62 }; // Class 1's comfortable references (D3 / D4)

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Class viewed" },
    { key: "awareness", label: "Natural breathing awareness" },
    { key: "inhaleExhale", label: "Natural inhale/exhale" },
    { key: "gentleExhale", label: "Gentle exhale" },
    { key: "breathHum", label: "Breath + hum" },
    { key: "breathSpeech", label: "Breath + speech" },
    { key: "shortPhrase", label: "Short singing phrase" },
    { key: "breathPitch", label: "Breath + pitch" },
    { key: "tension", label: "Tension awareness" },
    { key: "recording", label: "Recording" },
    { key: "reflection", label: "Reflection" },
    { key: "assignment", label: "Assignment" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    observe: { question: "Did you notice yourself trying to control the breath?", options: [opt("yes", "Yes"), opt("little", "A little"), opt("no", "No"), opt("unsure", "Not sure")] },
    exhale: { question: "Was that comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "No", "miss")] },
    hum: { question: "How did breath + hum feel?", options: [opt("easy", "Easy", "good"), opt("okay", "Okay", "good"), opt("uncomfortable", "Uncomfortable", "miss"), opt("unsure", "Not sure")] },
    speech: { question: "Did you naturally want to breathe before the phrase?", options: [opt("yes", "Yes"), opt("no", "No"), opt("unsure", "Not sure")] },
    sung: { question: "How did the short phrase feel?", options: [opt("comfortable", "Comfortable", "good"), opt("tight", "A bit tight", "maybe"), opt("unsure", "Not sure")] },
    shoulders: { question: "Did your shoulders move when you breathed?", options: [opt("little", "Yes, a little"), opt("noticeably", "Yes, noticeably"), opt("no", "No"), opt("unsure", "Not sure")] },
    enough: { question: "Did you have enough comfortable breath to complete the phrase?", options: [opt("yes", "Yes", "good"), opt("almost", "Almost", "good"), opt("no", "No", "maybe"), opt("unsure", "Not sure")] },
    recBreath: { question: "Can you hear a sudden breath sound?", options: [opt("yes", "Yes"), opt("little", "A little"), opt("no", "No"), opt("unsure", "Not sure")] },
    recComfort: { question: "Did the phrase sound comfortable?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "No", "maybe"), opt("unsure", "Not sure")] },
    recStrain: { question: "Did the voice become strained?", options: [opt("no", "No", "good"), opt("little", "A little", "maybe"), opt("yes", "Yes", "miss"), opt("unsure", "Not sure")] },
  };
  const REC_QS = ["recBreath", "recComfort", "recStrain"];
  const TENSION = [{ key: "areas", title: "Where did you notice tension?", prompt: "Choose any that fit — just noticing.", options: ["Throat", "Shoulders", "Chest", "Jaw", "Stomach/abdomen", "No obvious tension", "Not sure"] }];

  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);
  const CHECK_ROWS = [
    { key: "awareness", area: "Awareness", question: "Did I notice my natural breathing?", levels: YMN },
    { key: "comfort", area: "Comfort", question: "Could I breathe comfortably?", levels: lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["no", "○", "No"]) },
    { key: "voice", area: "Voice", question: "Could I connect breath to sound?", levels: YMN },
    { key: "phrase", area: "Phrase", question: "Could I breathe comfortably before a short phrase?", levels: YMN },
    { key: "tension", area: "Tension", question: "Did I notice unnecessary tension?", levels: lv(["yes", "✓", "Yes"], ["sometimes", "△", "Sometimes"], ["no", "○", "No"], ["unsure", "?", "Not sure"]) },
  ];

  const PITCH_EX = {
    eyebrow: "Exercise 7 · Breath → voice", title: "Breath awareness with pitch",
    intro: "Take a comfortable breath. Sing the note <strong class=\"text-ink-200\">briefly</strong>. Stop. The focus is breath → voice — not a long note.",
    flow: ["🌬️ Comfortable breath", "🎹 Hear the note", "🎤 Sing briefly", "✋ Stop", "😌 Breathe normally"],
    slots: [{ key: "take", label: "A short note after a comfortable breath", hint: "A second or two is plenty" }],
    assessment: { question: "Did the note start easily after the breath?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")],
      feedback: { yes: "Lovely — breath, then voice.", mostly: "Good. Let the breath be easy, then let the sound begin.", notyet: "That's fine. Breathe normally for a moment, then try a softer, shorter note.", unsure: "Listen back and notice the very start of the note." } },
    noEstimate: true,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  /* Guided breathing: phases drive the orb; no numbers are ever shown. */
  const GUIDES = {
    inhale: [
      ...[1, 2, 3].flatMap(() => [
        { phase: "in", ms: 4000, text: "Let the next breath come in naturally…" },
        { phase: "out", ms: 5000, text: "…and let the air out naturally." },
      ]),
      { phase: "rest", ms: 2500, text: "That's it. A comfortable breath is enough." },
    ],
    exhale: [
      { phase: "in", ms: 4000, text: "Breathe in comfortably…" },
      { phase: "sound", ms: 4000, text: "“sss” — gently. Stop earlier whenever you like." },
      { phase: "rest", ms: 4000, text: "Stop. Breathe normally." },
    ],
    hum: [
      { phase: "in", ms: 4000, text: "A comfortable breath…" },
      { phase: "sound", ms: 3000, text: "“mmm” — gently…" },
      { phase: "stop", ms: 1500, text: "Stop." },
      { phase: "rest", ms: 4000, text: "Breathe normally." },
    ],
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state ---------- */
  function refNote(rec) {
    const own = A(rec, "setup").note;
    if (typeof own === "number" && own >= RANGE.from && own <= RANGE.to) return own;
    return VOICE_NOTES[(ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? "lower" : "higher"];
  }
  const pitchTake = (rec) => (((rec.answers.exercises || {}).pitch || {}).takes || {}).take || null;
  const guided = (rec, k) => !!A(rec, "guides")[k];
  const recDone = (rec) => {
    const r = A(rec, "record");
    return !!(r.take && r.take.mediaId && r.listened) && REC_QS.every((k) => r[k]);
  };

  function assignmentParts(rec) {
    const c = rec.checkpoints;
    return [!!c.awareness, !!c.gentleExhale, !!c.breathHum, !!c.breathSpeech, !!c.shortPhrase, !!c.breathPitch, recDone(rec), !!c.reflection];
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    const q = A(rec, "q");
    if (q.observe) out.awareness = true;
    if (guided(rec, "inhale")) out.inhaleExhale = true;
    if (guided(rec, "exhale") && q.exhale) out.gentleExhale = true;
    if (guided(rec, "hum") && q.hum) out.breathHum = true;
    if (q.speech) out.breathSpeech = true;
    if (q.sung && q.enough) out.shortPhrase = true;
    const pt = pitchTake(rec);
    if (pt && pt.assessment) out.breathPitch = true;
    if ((A(rec, "tension").areas || []).length && q.shoulders) out.tension = true;
    if (recDone(rec)) out.recording = true;
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    const withThese = { ...rec, checkpoints: { ...rec.checkpoints, ...out } };
    if (assignmentParts(withThese).every(Boolean)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const STOP_NOTE = `<p class="text-xs text-ink-500 mt-3">Dizzy, light-headed, short of breath or any chest discomfort? <strong class="text-ink-300">Stop</strong>, breathe normally and rest. Don't repeat it to “build tolerance”.</p>`;

  function guideBox(id, label) {
    return `
      <div class="flex flex-col sm:flex-row items-center gap-5 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6" data-bguide="${id}">
        <div class="breathe-circle breath-orb !w-28 !h-28 !m-0 shrink-0" data-orb aria-hidden="true"></div>
        <div class="flex-1 text-center sm:text-left">
          <p class="font-display text-xl text-ink-50 min-h-[1.75rem]" data-cue aria-live="polite">${label.idle}</p>
          <div class="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            <button type="button" data-guide-start class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} ${label.start}</button>
            <button type="button" data-guide-stop class="vr-btn" hidden>Stop</button>
          </div>
        </div>
      </div>`;
  }

  function flowTiles(id, steps) {
    return `<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 my-4" data-tiles="${id}">
      ${steps.map((t, i) => `<div class="mv-tile flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-4 px-3 text-center" data-tile-i="${i}"><p class="font-display text-lg text-ink-50">${t}</p></div>${i < steps.length - 1 ? `<span class="text-ink-600 text-center sm:px-1">↓</span>` : ""}`).join("")}
    </div>`;
  }

  function exhaleMessage(v) {
    if (v === "no") return `<div class="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] px-5 py-4 text-sm text-amber-100">Let's stop this exercise. Breathe normally and rest — that's exactly the right choice. You can move on; there's nothing to push through.</div>`;
    if (v === "mostly") return `<p class="text-sm text-ink-300">Good. Next time make the “sss” a little shorter and softer.</p>`;
    if (v === "yes") return `<p class="text-sm text-ink-300">Lovely — gentle and comfortable.</p>`;
    return "";
  }
  function enoughMessage(v) {
    if (v === "no") return `<p class="text-sm text-amber-100">Make the phrase shorter — try just “Learning…”, then “…to sing” with a natural breath in between. A shorter phrase is the right fix, not a bigger breath.</p>`;
    if (v === "almost") return `<p class="text-sm text-ink-300">That's useful to notice. A slightly shorter phrase, or a natural breath partway, is fine.</p>`;
    if (v) return `<p class="text-sm text-ink-300">Good — a comfortable breath was enough.</p>`;
    return "";
  }
  function humMessage(v) {
    return v === "uncomfortable" ? `<p class="text-sm text-amber-100 mt-3">Then skip the repeat. Breathe normally, rest, and come back another time.</p>` : "";
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["awareness", "inhaleExhale", "gentleExhale", "breathHum", "breathSpeech", "shortPhrase", "breathPitch", "tension"].filter((k) => c[k]).length;
    return [
      [`Breathing awareness exercises (${ex}/8)`, ex === 8],
      ["Recorded and listened to breath + voice", !!c.recording],
      ["Reflected", !!c.reflection],
      ["Completed the assignment", !!c.assignment],
    ];
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-500/[0.08] via-transparent to-gold-500/[0.06] p-6 sm:p-10 text-center">
          <p class="font-display text-3xl sm:text-4xl text-ink-50 leading-tight mb-5">BREATH BECOMES PART OF THE MUSIC</p>
          <p class="text-base text-ink-200">“You don't need to master breathing today.”</p>
          <p class="text-base text-ink-200 mb-6">“You are learning to become aware of it.”</p>
          <div class="inline-flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 mb-6">
            <span class="text-[11px] tracking-[0.25em] uppercase text-gold-400/80">Level 1 — Foundation</span>
            <span class="font-display text-xl text-emerald-300">Class 2 ✓</span>
          </div>
          <p class="text-sm text-ink-400">Breathing for singing isn't about the biggest breath — it's comfort, and awareness of how breath and voice connect.</p>
          ${next ? `
          <div class="mt-6">
            <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next</p>
            <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
              <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
            </div>
          </div>` : ""}
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
        ${next ? `<p class="text-xs text-ink-500 mt-5">Next: Class ${next.number} — ${next.title}</p>` : ""}
      </div>`;
  }

  function progressStats(cls) {
    return [{ label: "Recordings", value: ClassActivity.count(cls.id, "recordings") }];
  }

  function assignmentHtml(cls, rec) {
    const parts = assignmentParts(rec);
    const where = [" (Exercise 1)", " (Exercise 3)", " (Exercise 4)", " (Exercise 5)", " (Exercises 6 & 11)", " (Exercise 7)", " (Exercise 12 — record, then play it to the end)", " (the six questions below)"];
    return LessonKit.renderAssignment({
      title: `Class ${cls.number} Assignment`,
      items: cls.content.assignment.instructions.map((t, i) => t + where[i]),
      isDone: (i) => parts[i], isAuto: () => true,
    });
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const q = A(rec, "q");
    const sel = (k) => q[k] || null;
    const r = A(rec, "record");
    const refl = A(rec, "reflection");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Comfortable breath → comfortable voice", `
          <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/[0.07] via-transparent to-gold-500/[0.05] p-6 sm:p-10 mb-6 flex flex-col sm:flex-row items-center gap-6">
            <div class="breathe-circle is-running !m-0 shrink-0" aria-hidden="true"></div>
            <p class="font-display text-2xl sm:text-3xl text-ink-50 leading-snug">“Learn to breathe comfortably before trying to control the breath.”</p>
          </div>
          ${p("We breathe automatically all day. Singing asks us to become a little more aware of <strong class=\"text-ink-100\">when</strong> we breathe and <strong class=\"text-ink-100\">how</strong> we use the breath while making sound.")}
          <div class="grid sm:grid-cols-2 gap-4 mt-4">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">The goal is not</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">${["Taking the biggest breath", "Holding the breath longest", "Exhaling for the longest time"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}</ul>
            </div>
            <div class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.05] p-5 flex flex-col justify-center">
              <p class="text-xs uppercase tracking-wider text-teal-300 mb-2">The goal is</p>
              <p class="font-display text-2xl text-ink-50">Comfortable breath → comfortable voice.</p>
            </div>
          </div>
        `)}

        ${chapter("understand", 2, "Never force a breathing exercise", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-4">“Never force a breathing exercise.”</p>
            <p class="text-sm text-ink-200 mb-2">You do not need to:</p>
            <ul class="grid sm:grid-cols-2 gap-1.5 text-sm text-ink-300">${["Take a huge breath", "Hold your breath", "Empty your lungs completely", "Compete against a timer", "Continue when uncomfortable"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-5 py-4 text-sm text-red-100 leading-relaxed">
            <p class="font-medium mb-1">If you feel dizziness, light-headedness, unusual breathlessness, chest discomfort, or feel faint:</p>
            <p><strong>Stop immediately.</strong> Return to normal breathing. Rest. Don't repeat the exercise to “build tolerance”.</p>
          </div>
          <p class="text-sm text-ink-400 mt-4">This class never measures or rewards how long you breathe. There are no breath timers, scores or comparisons.</p>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("notice", 3, "Exercise 1 — Observe normal breathing", `
          ${p("Sit comfortably. <strong class=\"text-ink-100\">Don't change anything.</strong> Simply notice a few breaths: the inhale, the exhale, and the small natural pause before the next one. No timer, no counting. Take as long as you like.")}
          <div class="flex flex-wrap justify-center gap-2 my-5">${["Inhale", "Exhale", "Natural pause", "Repeat"].map((t, i, a) => `<span class="flow-chip !text-sm">${t}</span>${i < a.length - 1 ? `<span class="text-ink-700 text-xs self-center">→</span>` : ""}`).join("")}</div>
          ${SelfAssessment.render("observe-q", { ...Q.observe, selected: sel("observe") })}
          <p class="text-sm text-ink-300 mt-4">“Awareness comes before control.” Noticing that you started to control it is a great observation.</p>
        `)}

        ${chapter("notice", 4, "Exercise 2 — Natural inhale", `
          ${p("Allow your next breath to come naturally. Then let the air out naturally. Just a few times — no deep, forced breathing. Follow your own pace; the circle is only a picture.")}
          ${guideBox("inhale", { idle: "Ready when you are.", start: "Guide me (a few breaths)" })}
          ${STOP_NOTE}
        `)}

        ${chapter("exhale", 5, "Exercise 3 — Gentle exhale", `
          ${p("Breathe in comfortably, then let the air out on a gentle <strong class=\"text-ink-100\">“sss”</strong> for a short, comfortable moment. Stop before any discomfort and return to normal breathing. Nothing is counted.")}
          ${guideBox("exhale", { idle: "Comfortable breath, then a gentle “sss”.", start: "Guide me" })}
          ${STOP_NOTE}
          <div class="mt-5">${SelfAssessment.render("exhale-q", { ...Q.exhale, selected: sel("exhale") })}</div>
          <div class="mt-3" data-exhale-msg>${exhaleMessage(sel("exhale"))}</div>
        `)}

        ${chapter("sound", 6, "Exercise 4 — Breath + hum", `
          ${p("Remember the gentle “mmm” from Class 1? Now: a comfortable breath, a gentle “mmm”, stop, and return to normal breathing. Repeat once if it's comfortable.")}
          ${guideBox("hum", { idle: "Breath → mmm → stop → normal breathing.", start: "Guide me" })}
          ${STOP_NOTE}
          <div class="mt-5">${SelfAssessment.render("hum-q", { ...Q.hum, selected: sel("hum") })}</div>
          <div data-hum-msg>${humMessage(sel("hum"))}</div>
          <p class="text-sm text-ink-300 mt-4">“We are beginning to connect breath with sound.”</p>
        `)}

        ${chapter("sound", 7, "Exercise 5 — Breath + speech", `
          ${p("Breathe naturally, then speak this comfortably:")}
          <p class="font-display text-2xl sm:text-3xl text-ink-50 my-5">“I am learning to sing.”</p>
          ${SelfAssessment.render("speech-q", { ...Q.speech, selected: sel("speech") })}
          <p class="text-sm text-ink-300 mt-4">Singing phrases often build on the same natural breathing patterns we use in speech.</p>
        `)}

        ${chapter("phrase", 8, "Exercise 6 — A short singing phrase", `
          ${p("A very short phrase — not a test of how long you can last:")}
          <p class="font-display text-2xl sm:text-3xl text-ink-50 my-4">“I can sing.”</p>
          ${flowTiles("sung", ["Breathe comfortably", "Sing the phrase", "Stop", "Normal breathing"])}
          <button type="button" data-tiles-start="sung" class="vr-btn">${icon("play", "w-4 h-4")} Walk me through it</button>
          <div class="mt-5">${SelfAssessment.render("sung-q", { ...Q.sung, selected: sel("sung") })}</div>
        `)}

        ${chapter("pitch", 9, "Exercise 7 — Breath awareness with pitch", `
          ${narrow(p("Tap a key for a comfortable note if you'd like a different one — it's chosen for you from Class 1 otherwise."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${VirtualPiano.render("cb-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${PitchMatchExercise.render("cb-pitch", PITCH_EX)}
        `, { wide: true })}

        ${chapter("aware", 10, "Exercise 8 — Breath and rest", `
          ${p("An important habit: after singing a phrase, let yourself breathe normally. Don't immediately take another exaggerated breath.")}
          ${flowTiles("rest", ["BREATH", "SING", "REST", "NORMAL BREATH"])}
          <button type="button" data-tiles-start="rest" class="vr-btn">${icon("play", "w-4 h-4")} Show me the cycle</button>
          <p class="font-display text-xl text-ink-100 mt-5">“Good singing isn't a continuous breath-holding exercise.”</p>
        `)}

        ${chapter("aware", 11, "Exercise 9 — Notice tension", `
          ${p("After a short singing attempt (Exercise 6 or 7 is perfect), notice your body.")}
          <div class="obs-single">${ObservationChecklist.render("obs-tension", TENSION, A(rec, "tension"))}</div>
          <p class="text-sm text-ink-300 mt-4">Don't try to force these areas to relax. Simply notice them. (Class 8, Vocal Relaxation, comes back to this.)</p>
        `)}

        ${chapter("aware", 12, "Exercise 10 — Shoulder awareness", `
          ${p("Breathe normally and observe whether your shoulders move.")}
          ${SelfAssessment.render("shoulders-q", { ...Q.shoulders, selected: sel("shoulders") })}
          <p class="text-sm text-ink-300 mt-4">“Different people breathe differently. We are simply observing rather than judging.”</p>
        `)}

        ${chapter("phrase", 13, "Exercise 11 — Breath before a phrase", `
          ${flowTiles("before", ["Comfortable breath", "Short phrase", "Natural release"])}
          <p class="font-display text-2xl sm:text-3xl text-ink-50 my-4">“Learning to sing”</p>
          ${SelfAssessment.render("enough-q", { ...Q.enough, selected: sel("enough") })}
          <div class="mt-3" data-enough-msg>${enoughMessage(sel("enough"))}</div>
        `)}

        ${chapter("record", 14, "Exercise 12 — Record your breath + voice", `
          ${p("Record one short take: a comfortable breath, a short hum, then a short sung phrase (“I can sing” is perfect). Then play it back to the end and listen.")}
          ${flowTiles("record", ["Comfortable breath", "Short hum", "Short phrase"])}
          ${RecordingCard.render("rc-breath", { title: "Breath + voice", hint: "Up to 30 seconds — short is fine.", maxSeconds: 30, section: false })}
          <p class="text-xs mt-2 ${r.listened ? "text-emerald-300" : "text-ink-500"}" data-rec-listened>${r.listened ? "✓ You listened back." : "Play it back to the end, then answer below."}</p>
          <div class="flex flex-col gap-4 mt-4">${REC_QS.map((k) => SelfAssessment.render(`${k}-q`, { ...Q[k], selected: r[k] || null })).join("")}</div>
          <p class="text-xs text-ink-500 mt-3">Just your ears — no automatic breath analysis.</p>
        `)}

        ${chapter("evaluate", 15, "What breath support is NOT", `
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            ${["Holding your breath", "Pushing your stomach", "Forcing air", "Squeezing the throat", "Taking the largest possible breath", "Singing until you're completely empty"].map((t) => `
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 flex gap-3 items-start"><span class="text-ink-600">✕</span><span class="text-sm text-ink-200">${t}</span></div>`).join("")}
          </div>
          ${p("At this stage we're only developing <strong class=\"text-ink-100\">awareness and coordination</strong>. More advanced breath-support ideas come later, once this foundation is in place — you'll meet breath again in Class 7 (warm-up), Class 9 (vocal control), Class 10 (first progress recording) and Class 11 (breath & phrase control).")}
        `)}

        ${chapter("evaluate", 16, "Self-evaluation", `
          ${p("A simple self-check — not a grade.")}
          ${ControlCheck.render("cb-check", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 17, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, comfortable practice is best — a few minutes is plenty. Only the date and how long you practised are saved; nothing about your breath is measured.")}
          ${Timer.render("cb-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 18, `Class ${cls.number} Assignment`, `
          <div data-assignment-host>${assignmentHtml(cls, rec)}</div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-1">Then answer</h4>
            <p class="text-xs text-ink-500 mb-4">Your reflection — saved privately as you type.</p>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="cb-refl-${i}">${i + 1}. ${qq}</label>
                  <textarea id="cb-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 19, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-cb", { placeholder: "e.g. I tend to take a very large breath. I feel comfortable with short phrases. I notice shoulder movement." })}
        `)}

        ${chapter("complete", 20, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 21, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    cleanups.push(() => timers.forEach(clearTimeout));

    /* ---- live progress ---- */
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
      $("[data-assignment-host]").innerHTML = assignmentHtml(cls, rec);
      const listened = !!A(rec, "record").listened;
      const l = $("[data-rec-listened]");
      l.textContent = listened ? "✓ You listened back." : "Play it back to the end, then answer below.";
      l.className = `text-xs mt-2 ${listened ? "text-emerald-300" : "text-ink-500"}`;
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true); // the rest only move forward
      });
    }
    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true; syncCheckpoints(); syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params);

    /* ---- guided breathing (orb follows phases; stoppable at any moment) ---- */
    const running = {};
    function stopGuide(id, msg = "Stopped. Breathe normally and rest.") {
      const root = $(`[data-bguide="${id}"]`);
      (running[id] || []).forEach(clearTimeout);
      delete running[id];
      const orb = root.querySelector("[data-orb]");
      orb.style.transitionDuration = "2.5s";
      orb.className = orb.className.replace(/\bis-(in|out|sound|stop|rest)\b/g, "").trim() + " is-rest";
      root.querySelector("[data-cue]").textContent = msg;
      root.querySelector("[data-guide-stop]").hidden = true;
      root.querySelector("[data-guide-start]").hidden = false;
    }
    function runGuide(id) {
      if (running[id]) return;
      PianoSynth.stopAll(); VoiceRecorder.stopPlayback();
      const root = $(`[data-bguide="${id}"]`);
      const orb = root.querySelector("[data-orb]");
      const cue = root.querySelector("[data-cue]");
      root.querySelector("[data-guide-stop]").hidden = false;
      root.querySelector("[data-guide-start]").hidden = true;
      running[id] = [];
      let at = 0;
      GUIDES[id].forEach((step) => {
        running[id].push(setTimeout(() => {
          orb.style.transitionDuration = `${step.ms}ms`;
          orb.className = orb.className.replace(/\bis-(in|out|sound|stop|rest)\b/g, "").trim() + ` is-${step.phase}`;
          cue.textContent = step.text;
        }, at));
        at += step.ms;
      });
      running[id].push(setTimeout(() => {
        delete running[id];
        set("guides", id, true);
        root.querySelector("[data-guide-stop]").hidden = true;
        const start = root.querySelector("[data-guide-start]");
        start.hidden = false;
        start.innerHTML = `${icon("play", "w-4 h-4")} ${id === "hum" ? "Once more, if comfortable" : "Again, if you like"}`;
      }, at));
    }
    cleanups.push(() => Object.keys(running).forEach((id) => (running[id] || []).forEach(clearTimeout)));

    /* ---- step-by-step tiles (no timing pressure: ~3 s per step) ---- */
    function walkTiles(id) {
      const tiles = [...container.querySelectorAll(`[data-tiles="${id}"] [data-tile-i]`)];
      tiles.forEach((t, i) => later(() => tiles.forEach((x) => x.classList.toggle("is-lit", x === t)), i * 3000));
      later(() => tiles.forEach((x) => x.classList.remove("is-lit")), tiles.length * 3000);
    }

    /* ---- Exercise 7: breath + pitch (Class 4 engine; note from the piano or Class 1) ---- */
    const pitchEx = own(PitchMatchExercise.wire(container, "cb-pitch", PITCH_EX, {
      classId, exerciseId: "pitch",
      state: (rec0().answers.exercises || {}).pitch || {},
      getNotes: () => [refNote(rec0())],
      isComplete: PITCH_EX.isComplete,
      onState: (s) => set("exercises", "pitch", s),
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    own(VirtualPiano.wire(container, "cb-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); pitchEx.refresh(); },
    }));

    /* ---- Exercise 12: record breath + voice ---- */
    own(RecordingCard.wire(container, "rc-breath", {
      classId, take: A(rec0(), "record").take || null, maxSeconds: 30,
      meta: { name: "Class 2 — Breath + voice", exercise: "comfortable-breathing-record" },
      onSaved: (t) => { set("record", "take", t); set("record", "listened", false); ClassActivity.bump(classId, "recordings"); },
      onPlayer: (player) => player.on("ended", ({ fromStart }) => { if (fromStart) set("record", "listened", true); }),
    }));

    /* ---- tension checklist ---- */
    cleanups.push(ObservationChecklist.wire(container, "obs-tension", {
      selected: A(rec0(), "tension"), onChange: (key, values) => set("tension", key, values),
    }));

    /* ---- single-choice questions ---- */
    const CHIP_GROUPS = {
      "observe-q": (v) => set("q", "observe", v),
      "exhale-q": (v) => { set("q", "exhale", v); $("[data-exhale-msg]").innerHTML = exhaleMessage(v); if (v === "no") stopGuide("exhale", "Stopped. Breathe normally and rest."); },
      "hum-q": (v) => { set("q", "hum", v); $("[data-hum-msg]").innerHTML = humMessage(v); },
      "speech-q": (v) => set("q", "speech", v),
      "sung-q": (v) => set("q", "sung", v),
      "shoulders-q": (v) => set("q", "shoulders", v),
      "enough-q": (v) => { set("q", "enough", v); $("[data-enough-msg]").innerHTML = enoughMessage(v); },
      ...Object.fromEntries(REC_QS.map((k) => [`${k}-q`, (v) => set("record", k, v)])),
    };
    function onClick(e) {
      const t = e.target;
      const g = t.closest("[data-bguide]");
      if (g && t.closest("[data-guide-start]")) { runGuide(g.dataset.bguide); return; }
      if (g && t.closest("[data-guide-stop]")) { stopGuide(g.dataset.bguide); return; }
      const tiles = t.closest("[data-tiles-start]");
      if (tiles) { walkTiles(tiles.dataset.tilesStart); return; }
      const chip = t.closest("[data-assess-choice]");
      const group = chip && chip.closest("[data-assess]");
      if (!group || !CHIP_GROUPS[group.dataset.assess]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      CHIP_GROUPS[group.dataset.assess](chip.dataset.assessChoice);
    }
    container.addEventListener("click", onClick);
    cleanups.push(() => container.removeEventListener("click", onClick));

    /* ---- practice timer: date + duration only ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "cb-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}. Short and comfortable is perfect.`;
        refreshLive();
      },
    }));

    /* ---- self-evaluation, reflection, notes ---- */
    cleanups.push(ControlCheck.wire(container, "cb-check", { onChange: (k, v) => set("check", k, v) }));
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-cb", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const qs = cls.content.assignment.questions;
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled(r[5]) ? r[5] : "Breathing for singing isn't about the biggest breath — it's comfort and awareness.",
        struggled: (A(rec, "tension").areas || []).filter((a) => !/No obvious|Not sure/.test(a)).join(", "),
        toPractice: "",
        thoughts: qs.map((qq, i) => (filled(r[i]) ? `${qq} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
