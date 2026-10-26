/* ============================================================
   CLASS 1 — MEET YOUR VOICE & LISTENING FOUNDATION
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "meet-your-voice".

   Core idea: "Before learning to control your voice, learn to
   listen to it." The true beginning: no pass/fail, no scores, no
   "good"/"bad" voice, no technical terms. Every exercise ends in
   the learner's own observation.

   Flow: welcome → comfort check → listen to the room → speaking
   voice → gentle hum → speak→hum → higher/lower (ears only) →
   the voice moves → first pitch-matching preview + listening back
   → speaking vs singing → my starting point → My Voice — Day 1
   (an informal sample; the official baseline is Class 10) →
   reflection → assignment → welcome to the journey.

   Reuses: LessonKit, VirtualPiano (Class 3), PianoSynth.tone,
   PitchMatchExercise + SelfAssessment (Class 4), RecordingCard +
   WaveformPlayer + ObservationChecklist (Class 5), the Class 7
   breathing circle, PersonalNotes, ClassProgress, ClassActivity
   (per-user, synced to Supabase; owner-only).
   ============================================================ */

const MeetYourVoiceLesson = (() => {
  const STAGES = [
    { id: "welcome", label: "Welcome" },
    { id: "comfort", label: "Comfort" },
    { id: "listen", label: "Listen" },
    { id: "voice", label: "Your voice" },
    { id: "pitch", label: "Higher & lower" },
    { id: "compare", label: "Speak vs sing" },
    { id: "profile", label: "Starting point" },
    { id: "record", label: "Day 1" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const LISTEN_SECONDS = 30;
  const REFERENCE = { lower: 50, higher: 62 }; // D3 / D4 — easy, middle-of-the-voice notes
  const PAIRS = [[55, 62], [62, 55], [52, 60], [60, 52]]; // G3→D4, then reversed; E3→C4, then reversed
  const DISCOVERY_Q = "What is one thing I discovered about my voice today?";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Class viewed" },
    { key: "comfort", label: "Voice comfort check" },
    { key: "environment", label: "Environment listening" },
    { key: "speaking", label: "Speaking recording" },
    { key: "humming", label: "Humming" },
    { key: "higherLower", label: "Higher/lower listening" },
    { key: "pitchPreview", label: "Pitch matching preview" },
    { key: "playback", label: "Recording playback" },
    { key: "speakSing", label: "Speaking vs singing" },
    { key: "profile", label: "Voice profile" },
    { key: "reflection", label: "Reflection" },
    { key: "assignment", label: "Assignment" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    comfort: { question: "How does your voice feel today?", options: [opt("comfortable", "Comfortable", "good"), opt("tired", "A little tired", "maybe"), opt("dry", "Dry", "maybe"), opt("strained", "Strained", "miss"), opt("notnormal", "Not normal today", "miss")] },
    hum: { question: "How did the hum feel?", options: [opt("easy", "Easy", "good"), opt("strange", "A little strange"), opt("buzzy", "A gentle buzz or tickle"), opt("unsure", "Not sure")] },
    glide: { question: "Could you feel your voice move?", options: [opt("yes", "Yes, gently", "good"), opt("little", "A little", "good"), opt("notreally", "Not really yet", "maybe"), opt("unsure", "Not sure")] },
    voiceType: { question: "Which feels easier to hum?", options: [opt("lower", "A lower sound"), opt("higher", "A higher sound"), opt("unsure", "Not sure")] },
    experience: { question: "My experience with singing", options: [opt("beginner", "Complete beginner"), opt("casual", "Some casual singing"), opt("occasional", "I sing occasionally"), opt("trained", "I have previous training")] },
    feel: { question: "How do I currently feel about my voice?", options: [opt("curious", "Curious"), opt("unsure", "Unsure"), opt("confident", "Confident"), opt("nervous", "Nervous"), opt("excited", "Excited"), opt("dontknow", "I don't know yet")] },
  };
  const OBS = {
    environment: [{ key: "heard", title: "What did you notice?", prompt: "Choose everything you heard.", options: ["Traffic", "Fans or air conditioning", "People or voices", "Birds or animals", "Electronic hum or buzz", "Room echo or ambience", "It was mostly quiet", "Something else"] }],
    speaking: [{ key: "notice", title: "What do you notice?", prompt: "Choose any that fit — there are no wrong answers.", options: ["My voice sounds different from what I expected", "My voice sounds familiar", "My voice sounds deeper than expected", "My voice sounds higher than expected", "I notice background noise", "I notice pronunciation differences", "I am not sure"] }],
    speakHum: [{ key: "notice", title: "What did you notice?", prompt: "Just observe — choose any that fit.", options: ["A gentle buzz on my lips or face", "Humming and speaking felt connected", "“me” felt different from “mmm”", "It felt easy", "Not sure"] }],
    speakSing: [{ key: "changed", title: "What changed?", prompt: "Choose any that fit.", options: ["Pitch", "Duration", "Rhythm", "Voice sensation", "Everything felt different", "Not sure"] }],
    improve: [{ key: "improve", title: "What do I want to improve?", prompt: "Choose as many as you like.", options: ["Pitch", "Breathing", "Voice control", "Range", "Rhythm", "Confidence", "Pronunciation", "Expression", "Recording", "Mixing", "Mastering", "Other"] }],
  };
  const PREVIEW = {
    eyebrow: "Exercises 7 & 8 · A first try", title: "First pitch matching preview",
    intro: "Play the reference. Can you <strong class=\"text-ink-200\">gently imitate this sound</strong> — a short “mmm” or “ah”? One short attempt. Then play your recording back and listen.",
    flow: ["🎹 Listen", "🎤 Imitate gently", "🎧 Play it back", "👂 Notice"],
    slots: [{ key: "take", label: "Your first attempt", hint: "Short and gentle — just one try" }],
    assessment: {
      question: "Did your voice sound close to the reference?",
      options: [opt("think", "I think so"), opt("maybe", "Maybe"), opt("unsure", "Not sure"), opt("probably", "Probably not"), opt("couldnt", "I couldn't tell")],
      // The same words for every answer: no verdict, just the next step
      feedback: Object.fromEntries(["think", "maybe", "unsure", "probably", "couldnt"].map((v) => [v, "This is only your first attempt. We'll train this skill later."])),
    },
    noEstimate: true,
    isComplete: (s) => !!(s.takes.take && s.takes.take.mediaId),
  };
  const SAMPLE_PARTS = [
    { key: "speak", title: "1 · Natural speaking", hint: "10–15 seconds — talk about your day, or read the phrase from Exercise 2.", minSeconds: 8, maxSeconds: 20 },
    { key: "hum", title: "2 · Comfortable humming", hint: "5–10 seconds of a gentle “mmm”. Stop whenever you like.", minSeconds: 4, maxSeconds: 15 },
    { key: "pitch", title: "3 · One short pitch-matching attempt", hint: "Play the reference above, then imitate it once.", minSeconds: 1, maxSeconds: 10 },
  ];

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  const listOk = (rec, g, k) => ((A(rec, g)[k]) || []).length > 0;

  /* ---------- derived state ---------- */
  const refNote = (rec) => REFERENCE[A(rec, "setup").voice === "lower" ? "lower" : "higher"];
  const take = (rec, g, k = "take") => A(rec, g)[k] || null;
  const previewTake = (rec) => (((rec.answers.exercises || {}).preview || {}).takes || {}).take || null;
  const sampleRecorded = (rec) => SAMPLE_PARTS.every((s) => (A(rec, "sample")[s.key] || {}).mediaId);
  const sampleListened = (rec) => SAMPLE_PARTS.every((s) => (A(rec, "sampleListened")[s.key]));
  const higherLowerDone = (rec) => PAIRS.every((_, i) => A(rec, "higherLower")[i]);

  function assignmentParts(rec) {
    return [
      !!(A(rec, "sample").speak || {}).mediaId,
      !!(A(rec, "sample").hum || {}).mediaId,
      higherLowerDone(rec),
      !!(A(rec, "sample").pitch || {}).mediaId,
      sampleListened(rec),
      !!rec.checkpoints.reflection,
    ];
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (A(rec, "comfort").feel) out.comfort = true;
    if (A(rec, "environment").listened && listOk(rec, "environment", "heard")) out.environment = true;
    if (take(rec, "speaking") && listOk(rec, "speaking", "notice")) out.speaking = true;
    if (A(rec, "hum").feel && A(rec, "speakHum").guided && listOk(rec, "speakHum", "notice")) out.humming = true;
    if (higherLowerDone(rec)) out.higherLower = true;
    const pt = previewTake(rec);
    if (pt && A(rec, "glide").feel) out.pitchPreview = true;
    if (pt && pt.assessment && A(rec, "preview").played) out.playback = true;
    if (take(rec, "speakSing", "speak") && take(rec, "speakSing", "sing") && listOk(rec, "speakSing", "changed")) out.speakSing = true;
    const prof = A(rec, "profile");
    if (prof.experience && (prof.improve || []).length && prof.feel) out.profile = true;
    out.reflection = cls.content.assignment.questions.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentParts({ ...rec, checkpoints: { ...rec.checkpoints, ...out } }).every(Boolean) && filled(A(rec, "assignment").discovery)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  function comfortMessage(feel) {
    if (feel === "strained" || feel === "notnormal") {
      return `<div class="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] px-5 py-4 text-sm text-amber-100 leading-relaxed">
        <p class="font-medium mb-1">Don't force your voice today.</p>
        <p class="text-amber-100/80">You can continue with the listening portions, or return another day. Your progress will wait for you.</p>
      </div>`;
    }
    if (feel === "tired" || feel === "dry") {
      return `<p class="text-sm text-ink-300">Keep everything gentle today. A sip of water may help, and you can skip any sound that doesn't feel easy.</p>`;
    }
    if (feel === "comfortable") return `<p class="text-sm text-ink-300">Lovely. Keep it that way — everything today is gentle and short.</p>`;
    return "";
  }
  /** A quiet reminder on the voice exercises when the learner said their voice isn't right today. */
  function restReminder(rec) {
    const f = A(rec, "comfort").feel;
    const show = f === "strained" || f === "notnormal";
    return `<p class="text-xs text-amber-200/80 mb-3" data-rest-reminder ${show ? "" : "hidden"}>You said your voice isn't feeling right today — it's fine to just read and listen here, and come back to the sounds another day.</p>`;
  }

  function listenCircle(rec) {
    const done = !!A(rec, "environment").listened;
    return `
      <div class="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8">
        <div class="relative">
          <div class="breathe-circle mv-listen-circle" data-listen-circle></div>
          <span class="absolute inset-0 flex items-center justify-center font-display text-3xl text-ink-50" data-listen-count>${done ? "✓" : LISTEN_SECONDS}</span>
        </div>
        <p class="text-sm text-ink-300 text-center max-w-md" data-listen-status>${done ? "You listened. What did you notice?" : "Stay silent for about 30 seconds. Just listen to the room around you."}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button type="button" data-listen-start class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">${icon("play", "w-4 h-4")} ${done ? "Listen again" : "Start listening"}</button>
          <button type="button" data-listen-stop hidden class="vr-btn">I'm done listening</button>
        </div>
      </div>`;
  }

  function seqTiles() {
    return `<div class="grid grid-cols-3 gap-3 my-4" data-seq>
      ${["mmm", "me", "mmm"].map((t, i) => `<div class="mv-tile rounded-2xl border border-white/10 bg-white/[0.03] py-6 text-center" data-seq-i="${i}">
        <p class="text-[10px] uppercase tracking-[0.2em] text-ink-500 mb-1">${i === 1 ? "Speak" : "Hum"}</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50">${t}</p></div>`).join("")}
    </div>`;
  }

  function glideVisual() {
    return `
      <div class="rounded-2xl border border-white/10 bg-ink-950/60 p-4" aria-hidden="true">
        <svg viewBox="0 0 520 120" class="w-full h-auto">
          <text x="8" y="112" class="pg-axis">lower</text>
          <text x="512" y="16" text-anchor="end" class="pg-axis">higher</text>
          <path d="M20 96 C 180 96, 300 26, 500 24" class="pg-voice mv-glide-path" data-glide-path/>
        </svg>
      </div>`;
  }

  function pairCard(rec) {
    const hl = A(rec, "higherLower");
    const i = PAIRS.findIndex((_, k) => !hl[k]);
    if (i < 0) {
      return `<div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-5 text-center">
        <p class="font-display text-xl text-ink-50 mb-1">You've heard all four pairs.</p>
        <p class="text-sm text-ink-300">Higher and lower is the very first pitch skill. You'll keep training it — ears grow with practice.</p>
        <button type="button" data-hl-again class="vr-btn mt-3">Listen to the pairs again</button>
      </div>`;
    }
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7 text-center">
        <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-3">Pair ${i + 1} of ${PAIRS.length}</p>
        <div class="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
          <div class="ex-note-slot" data-hl-slot="0"><span class="ex-note-dot"></span><span class="text-[10px] uppercase tracking-wider text-ink-500 mt-1.5">First</span></div>
          <span class="text-ink-600 mb-6">→</span>
          <div class="ex-note-slot" data-hl-slot="1"><span class="ex-note-dot"></span><span class="text-[10px] uppercase tracking-wider text-ink-500 mt-1.5">Second</span></div>
        </div>
        <button type="button" data-hl-play class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">${icon("play", "w-4 h-4")} Play the two notes</button>
        <p class="font-display text-lg text-ink-100 mt-5 mb-3">Which note sounds higher?</p>
        <div class="flex flex-wrap justify-center gap-3">
          ${[["first", "First"], ["second", "Second"], ["unsure", "Not sure"]].map(([v, l]) => `<button type="button" data-hl-choice="${v}" disabled class="ex-choice">${l}</button>`).join("")}
        </div>
        <p class="text-sm text-ink-400 mt-4 min-h-[1.25rem]" data-hl-feedback aria-live="polite">Listen first, then choose.</p>
        <button type="button" data-hl-next hidden class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold-400/30 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors mt-2">Next pair ${icon("arrowRight", "w-3.5 h-3.5")}</button>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["environment", "speaking", "humming", "higherLower", "pitchPreview", "playback", "speakSing"].filter((k) => c[k]).length;
    return [
      ["Checked in with my voice", !!c.comfort],
      [`Listening and voice exercises (${ex}/7)`, ex === 7],
      ["My starting point", !!c.profile],
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
        <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
          <p class="font-display text-3xl sm:text-4xl text-ink-50 leading-tight mb-5">WELCOME TO YOUR SINGING JOURNEY</p>
          <p class="text-base text-ink-200">“You don't need to be good yet.”</p>
          <p class="text-base text-ink-200 mb-6">“You only need to be willing to listen, learn and practice.”</p>
          <div class="inline-flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 mb-6">
            <span class="text-[11px] tracking-[0.25em] uppercase text-gold-400/80">Level 1 — Foundation</span>
            <span class="font-display text-xl text-emerald-300">Class 1 ✓</span>
          </div>
          <p class="text-sm text-ink-400 mb-1">Learning to sing starts with learning to listen.</p>
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
    return LessonKit.renderAssignment({
      title: `Class ${cls.number} Assignment`,
      items: cls.content.assignment.instructions.map((t, i) => t + [" (Day 1 sample, part 1)", " (Day 1 sample, part 2)", " (Exercise 5)", " (Day 1 sample, part 3)", " (play all three Day 1 recordings to the end)", " (the five questions above)"][i]),
      isDone: (i) => parts[i], isAuto: () => true,
    });
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const sel = (g, k) => A(rec, g)[k] || null;
    const refl = A(rec, "reflection");
    const ref = refNote(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("welcome", 1, "Welcome. You can start exactly where you are.", `
          <div class="mv-hero rounded-3xl border border-white/10 bg-gradient-to-br from-gold-500/[0.07] via-transparent to-teal-500/[0.05] p-6 sm:p-10 mb-6">
            <p class="font-display text-2xl sm:text-3xl text-ink-50 leading-snug">“Before learning to control your voice, learn to listen to it.”</p>
          </div>
          ${p("Everyone's voice is different. There is no requirement to sound like another singer.")}
          ${p("The first skill of a singer isn't singing loudly or reaching high notes. It's <strong class=\"text-ink-100\">listening</strong>.")}
          ${p("Today you'll gently explore:")}
          <div class="flex flex-wrap gap-2 mt-2">${["Listening", "Voice awareness", "Comfort", "Higher and lower sounds", "Speaking vs singing", "Recording yourself", "Noticing what you hear"].map((t) => `<span class="flow-chip !text-sm">${t}</span>`).join("")}</div>
        `)}

        ${chapter("welcome", 2, "The first principle", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-10 mb-6">
            <p class="font-display text-2xl sm:text-4xl text-ink-50 leading-tight mb-3">“You are not here to prove that you can sing.”</p>
            <p class="font-display text-2xl sm:text-4xl text-teal-200 leading-tight">“You are here to discover how your voice works.”</p>
          </div>
          ${p("There is no pass or fail in Class 1, and no scores. Don't try to sound professional — just notice. The goal is awareness.")}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("comfort", 3, "Voice comfort check", `
          ${p("Before any sound, check in with yourself.")}
          ${SelfAssessment.render("comfort-q", { ...Q.comfort, selected: sel("comfort", "feel") })}
          <div class="mt-4" data-comfort-msg>${comfortMessage(sel("comfort", "feel"))}</div>
        `)}

        ${chapter("listen", 4, "Exercise 1 — Listen to your environment", `
          ${p("No singing yet. Stay silent and listen — traffic, fans, people, birds, electronic hum, the sound of the room itself.")}
          ${listenCircle(rec)}
          <div class="mt-5 obs-single">${ObservationChecklist.render("obs-env", OBS.environment, A(rec, "environment"))}</div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 mt-4 text-sm text-ink-300 leading-relaxed">
            A singer listens to more than pitch. Noticing your environment will matter later for <strong class="text-ink-100">recording</strong>, <strong class="text-ink-100">mixing</strong>, <strong class="text-ink-100">monitoring</strong> (hearing yourself) and <strong class="text-ink-100">microphone technique</strong>.
          </div>
        `)}

        ${chapter("voice", 5, "Exercise 2 — Your natural speaking voice", `
          ${restReminder(rec)}
          ${p("Speak naturally — the way you'd talk to a friend. Record about 10 seconds, then play it back.")}
          <div class="rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-5 mb-4">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Suggested phrase</p>
            <p class="font-display text-xl sm:text-2xl text-ink-50">“Hello. My name is <span class="text-gold-300">______</span>. I am beginning my singing journey.”</p>
          </div>
          ${RecordingCard.render("rc-speaking", { title: "My speaking voice", hint: "About 10 seconds. Then press Play and listen.", maxSeconds: 20, section: false })}
          <div class="mt-4 obs-single">${ObservationChecklist.render("obs-speaking", OBS.speaking, A(rec, "speaking"))}</div>
          <p class="text-sm text-ink-400 mt-4">A recording often sounds different from the voice you hear inside your head — almost everyone notices this. It's normal, and it isn't good or bad.</p>
        `)}

        ${chapter("voice", 6, "Exercise 3 — A gentle hum", `
          ${restReminder(rec)}
          ${p("Close your lips and make a soft, comfortable <strong class=\"text-ink-100\">“mmm”</strong>. Not high, not low, not loud, not long — just a short, easy sound. Then stop. Repeat once if it feels comfortable.")}
          <div class="flex flex-wrap items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4">
            <div class="breathe-circle !w-20 !h-20 !m-0" data-hum-circle></div>
            <div>
              <button type="button" data-hum-start class="vr-btn vr-btn-gold">🎵 Hum with the guide</button>
              <p class="text-xs text-ink-500 mt-2" data-hum-status>Press the button, hum “mmm” while the circle glows, and stop when it settles.</p>
            </div>
          </div>
          ${SelfAssessment.render("hum-q", { ...Q.hum, selected: sel("hum", "feel") })}
        `)}

        ${chapter("voice", 7, "Exercise 4 — Speak → hum", `
          ${restReminder(rec)}
          ${p("Hum <strong class=\"text-ink-100\">“mmm”</strong>, then speak <strong class=\"text-ink-100\">“me”</strong>, then hum <strong class=\"text-ink-100\">“mmm”</strong> again. Notice how your voice feels — there's nothing to get right.")}
          ${seqTiles()}
          <button type="button" data-seq-start class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Guide me through it</button>
          <div class="mt-5 obs-single">${ObservationChecklist.render("obs-speakhum", OBS.speakHum, A(rec, "speakHum"))}</div>
        `)}

        ${chapter("pitch", 8, "Exercise 5 — Discover higher and lower", `
          ${p("No singing — this one is just for your ears. You'll hear two notes on the piano. Which one sounds <strong class=\"text-ink-100\">higher</strong>? Then we'll swap the order.")}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-5">
            ${VirtualPiano.render("mv-piano", { controls: false, keyboard: true, display: true })}
          </div>
          <div data-hl-host>${pairCard(rec)}</div>
          <p class="text-xs text-ink-500 mt-3">You can also play the piano yourself: notes to the right sound higher, notes to the left sound lower.</p>
        `, { wide: true })}

        ${chapter("pitch", 9, "Exercise 6 — Your voice moves", `
          ${restReminder(rec)}
          ${p("On a gentle “mmm”, glide from a comfortable lower sound toward a comfortable higher sound — like a soft siren. Then glide back down. Don't push for high or low notes; stay where it's easy.")}
          ${glideVisual()}
          <div class="flex flex-wrap gap-2 mt-4">
            <button type="button" data-glide="up" class="vr-btn">${icon("play", "w-4 h-4")} Hear a glide up</button>
            <button type="button" data-glide="down" class="vr-btn">${icon("play", "w-4 h-4")} Hear a glide down</button>
          </div>
          <p class="text-sm text-ink-300 mt-4 mb-4">The voice can move through different pitches.</p>
          ${SelfAssessment.render("glide-q", { ...Q.glide, selected: sel("glide", "feel") })}
        `)}

        ${chapter("pitch", 10, "Exercises 7 & 8 — A first pitch-matching preview", `
          ${restReminder(rec)}
          ${p("A small preview of a skill you'll train properly in Class 4. First, pick the kind of sound that feels easier — this just chooses a comfortable reference note.")}
          <div class="mb-4" data-voice-q>${SelfAssessment.render("voice-q", { ...Q.voiceType, selected: sel("setup", "voice") })}</div>
          ${PitchMatchExercise.render("mv-preview", PREVIEW)}
          <p class="text-xs mt-3 ${A(rec, "preview").played ? "text-emerald-300" : "text-ink-500"}" data-preview-played>${A(rec, "preview").played ? "✓ You listened back to your attempt." : "Play your recording back to the end, then answer the question."}</p>
        `)}

        ${chapter("compare", 11, "Exercise 9 — Speaking vs singing", `
          ${restReminder(rec)}
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] uppercase tracking-[0.25em] text-gold-400/80 mb-1">Speak</p>
              <p class="font-display text-xl text-ink-50 mb-3">“I am learning to sing.”</p>
              ${RecordingCard.render("rc-speak2", { title: "Spoken", hint: "Say it naturally.", maxSeconds: 10, section: false })}
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-[0.25em] text-teal-300 mb-1">Sing</p>
              <p class="font-display text-xl text-ink-50 mb-3">“I am learning to sing.”</p>
              ${RecordingCard.render("rc-sing", { title: "Sung", hint: "Any simple, comfortable tune — or make one up.", maxSeconds: 15, section: false })}
            </div>
          </div>
          <div class="mt-4 obs-single">${ObservationChecklist.render("obs-speaksing", OBS.speakSing, A(rec, "speakSing"))}</div>
          <p class="text-sm text-ink-400 mt-4">Singing uses many of the same basic systems as speaking — and adds controlled pitch, rhythm and longer, sustained sounds.</p>
        `)}

        ${chapter("profile", 12, "My Starting Point", `
          ${p("A private snapshot of where you're starting. It isn't a judgement, and you can change it any time.")}
          <div class="flex flex-col gap-5">
            ${SelfAssessment.render("exp-q", { ...Q.experience, selected: sel("profile", "experience") })}
            <div class="obs-single">${ObservationChecklist.render("obs-improve", OBS.improve, { improve: A(rec, "profile").improve || [] })}</div>
            ${SelfAssessment.render("feel-q", { ...Q.feel, selected: sel("profile", "feel") })}
          </div>
        `)}

        ${chapter("record", 13, "My Voice — Day 1", `
          ${restReminder(rec)}
          ${p("Your first informal reference recording — three short parts. It's <strong class=\"text-ink-100\">not</strong> your official baseline (that's Class 10, “First Progress Recording”). It's simply a gentle snapshot of Day 1, saved privately as <em>Class 1 — Starting Voice Sample</em>.")}
          <div class="flex flex-col gap-4">
            ${SAMPLE_PARTS.map((s) => `
              <div>
                ${s.key === "pitch" ? `<button type="button" data-sample-ref class="vr-btn vr-btn-gold mb-3">${icon("play", "w-4 h-4")} Play the reference (${N(ref)})</button>` : ""}
                ${RecordingCard.render(`rc-sample-${s.key}`, { title: s.title, hint: s.hint, minSeconds: s.minSeconds, maxSeconds: s.maxSeconds, section: false })}
              </div>`).join("")}
          </div>
          <p class="text-xs mt-3 text-ink-500" data-sample-listened>${sampleListenedText(rec)}</p>
        `)}

        ${chapter("reflect", 14, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="mv-refl-${i}">${i + 1}. ${q}</label>
                <textarea id="mv-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("reflect", 15, `Class ${cls.number} Assignment`, `
          <div data-assignment-host>${assignmentHtml(cls, rec)}</div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <label class="block font-display text-lg text-ink-50 mb-2" for="mv-discovery">${DISCOVERY_Q}</label>
            <textarea id="mv-discovery" data-discovery rows="2" class="field" placeholder="One thing — big or small.">${Utils.escapeHtml(A(rec, "assignment").discovery || "")}</textarea>
          </div>
        `)}

        ${chapter("reflect", 16, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-mv", { placeholder: "Anything you noticed about your voice today…" })}
        `)}

        ${chapter("complete", 17, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 18, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function sampleListenedText(rec) {
    const n = SAMPLE_PARTS.filter((s) => A(rec, "sampleListened")[s.key]).length;
    return n === SAMPLE_PARTS.length ? "✓ You listened back to all three." : `Listen back to each part — press Play and let it finish (${n}/3 so far).`;
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
      $("[data-sample-listened]").textContent = sampleListenedText(rec);
      const played = !!A(rec, "preview").played;
      const pp = $("[data-preview-played]");
      pp.textContent = played ? "✓ You listened back to your attempt." : "Play your recording back to the end, then answer the question.";
      pp.className = `text-xs mt-3 ${played ? "text-emerald-300" : "text-ink-500"}`;
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

    const busy = () => VoiceRecorder.isRecording && VoiceRecorder.isRecording();

    /* ---- Exercise 1: listen to the room ---- */
    let listenTimer = null, listenLeft = 0;
    function stopListening(finished) {
      clearInterval(listenTimer); listenTimer = null;
      $("[data-listen-circle]").classList.remove("is-running");
      $("[data-listen-stop]").hidden = true;
      $("[data-listen-start]").hidden = false;
      const heardEnough = finished || listenLeft <= LISTEN_SECONDS - 15; // about half is plenty
      if (heardEnough) set("environment", "listened", true);
      $("[data-listen-count]").textContent = heardEnough ? "✓" : LISTEN_SECONDS;
      $("[data-listen-status]").textContent = heardEnough ? "You listened. What did you notice?" : "Try to stay with it a little longer — about 30 seconds.";
      $("[data-listen-start]").innerHTML = `${icon("play", "w-4 h-4")} Listen again`;
    }
    function startListening() {
      if (listenTimer) return;
      PianoSynth.stopAll(); VoiceRecorder.stopPlayback();
      listenLeft = LISTEN_SECONDS;
      $("[data-listen-circle]").classList.add("is-running");
      $("[data-listen-count]").textContent = listenLeft;
      $("[data-listen-status]").textContent = "Stay silent… just listen.";
      $("[data-listen-stop]").hidden = false;
      $("[data-listen-start]").hidden = true;
      listenTimer = setInterval(() => {
        listenLeft -= 1;
        $("[data-listen-count]").textContent = Math.max(0, listenLeft);
        if (listenLeft <= 0) stopListening(true);
      }, 1000);
    }
    cleanups.push(() => clearInterval(listenTimer));

    /* ---- Exercise 3: hum guide; Exercise 4: speak→hum sequence ---- */
    function humGuide() {
      const c = $("[data-hum-circle]"), s = $("[data-hum-status]");
      c.classList.add("is-running");
      s.textContent = "mmm… gently…";
      later(() => { c.classList.remove("is-running"); s.textContent = "…and stop. Repeat once if it felt comfortable."; }, 4000);
    }
    function seqGuide() {
      const tiles = [...container.querySelectorAll("[data-seq-i]")];
      tiles.forEach((t) => t.classList.remove("is-lit"));
      tiles.forEach((t, i) => {
        later(() => { tiles.forEach((x) => x.classList.toggle("is-lit", x === t)); }, i * 2500);
      });
      later(() => { tiles.forEach((x) => x.classList.remove("is-lit")); set("speakHum", "guided", true); }, tiles.length * 2500);
    }

    /* ---- Exercise 5: higher / lower on the piano ---- */
    const piano = own(VirtualPiano.wire(container, "mv-piano", { range: { from: 48, to: 72 }, keyboard: true }));
    let heardPair = false;
    function currentPair() { const hl = A(rec0(), "higherLower"); return PAIRS.findIndex((_, k) => !hl[k]); }
    function playPair() {
      const i = currentPair();
      if (i < 0 || busy()) return;
      const [a, b] = PAIRS[i];
      const slots = container.querySelectorAll("[data-hl-slot]");
      slots.forEach((s) => s.classList.remove("is-playing"));
      slots[0].classList.add("is-playing"); piano.playNote(a, 0.9);
      later(() => { slots[0].classList.remove("is-playing"); slots[1].classList.add("is-playing"); piano.playNote(b, 0.9); }, 1150);
      later(() => { slots[1].classList.remove("is-playing"); heardPair = true; container.querySelectorAll("[data-hl-choice]").forEach((x) => { x.disabled = false; }); }, 2200);
    }
    function answerPair(v) {
      const i = currentPair();
      if (i < 0 || !heardPair) return;
      const [a, b] = PAIRS[i];
      const higher = b > a ? "second" : "first";
      const fb = $("[data-hl-feedback]");
      const which = higher === "second" ? "The second note was higher — the sound climbed up." : "The first note was higher — the sound stepped down.";
      fb.textContent = v === "unsure" ? `That's okay. ${which} Play it again and listen for that.` : v === higher ? `Yes! ${which}` : `${which} Play it again and listen once more — ears grow with practice.`;
      container.querySelectorAll("[data-hl-choice]").forEach((x) => { x.classList.toggle("is-selected", x.dataset.hlChoice === v); });
      $("[data-hl-next]").hidden = false;
      pendingAnswer = v;
    }
    let pendingAnswer = null;
    function nextPair() {
      const i = currentPair();
      if (i < 0 || !pendingAnswer) return;
      set("higherLower", i, pendingAnswer);
      pendingAnswer = null; heardPair = false;
      $("[data-hl-host]").innerHTML = pairCard(rec0());
    }

    /* ---- Exercise 6: glide demos ---- */
    function glide(dir) {
      if (busy()) return;
      PianoSynth.stopAll();
      const path = $("[data-glide-path]");
      path.classList.remove("is-up", "is-down"); void path.getBoundingClientRect();
      path.classList.add(dir === "up" ? "is-up" : "is-down");
      PianoSynth.tone(dir === "up" ? 50 : 60, dir === "up" ? 60 : 50, { duration: 2.6, glideAt: 0.15, glideTime: 2, velocity: 0.6 });
    }

    /* ---- Exercises 7 & 8: first pitch-matching preview ---- */
    const preview = own(PitchMatchExercise.wire(container, "mv-preview", PREVIEW, {
      classId, exerciseId: "preview",
      state: (rec0().answers.exercises || {}).preview || {},
      getNotes: () => [refNote(rec0())],
      isComplete: PREVIEW.isComplete,
      onState: (s) => set("exercises", "preview", s),
      onRecorded: () => { ClassActivity.bump(classId, "recordings"); set("preview", "played", false); }, // a new attempt needs its own listen
      onPlayed: () => set("preview", "played", true),
    }));

    /* ---- recordings (Exercises 2 and 9, Day 1 sample) ---- */
    const card = (domId, group, key, name, maxSeconds) => own(RecordingCard.wire(container, domId, {
      classId, take: A(rec0(), group)[key] || null, maxSeconds,
      meta: { name, exercise: `meet-your-voice-${group}-${key}` },
      onSaved: (t) => { set(group, key, t); ClassActivity.bump(classId, "recordings"); },
    }));
    card("rc-speaking", "speaking", "take", "Class 1 — My speaking voice", 20);
    card("rc-speak2", "speakSing", "speak", "Class 1 — Spoken: “I am learning to sing.”", 10);
    card("rc-sing", "speakSing", "sing", "Class 1 — Sung: “I am learning to sing.”", 15);
    SAMPLE_PARTS.forEach((s) => {
      const label = { speak: "Speaking", hum: "Humming", pitch: "Pitch-matching attempt" }[s.key];
      own(RecordingCard.wire(container, `rc-sample-${s.key}`, {
        classId, take: A(rec0(), "sample")[s.key] || null, maxSeconds: s.maxSeconds, minSeconds: s.minSeconds,
        meta: { name: `Class 1 — Starting Voice Sample · ${label}`, exercise: `starting-voice-sample-${s.key}` },
        onSaved: (t) => {
          set("sample", s.key, { ...t, note: s.key === "pitch" ? N(refNote(rec0())) : undefined });
          set("sampleListened", s.key, false); // a new take needs its own listen-back
          ClassActivity.bump(classId, "recordings");
        },
        onPlayer: (player) => player.on("ended", ({ fromStart }) => { if (fromStart) set("sampleListened", s.key, true); }),
      }));
    });

    /* ---- multi-select observations ---- */
    const obs = (id, group, saved) => cleanups.push(ObservationChecklist.wire(container, id, {
      selected: saved, onChange: (key, values) => set(group, key, values),
    }));
    obs("obs-env", "environment", A(rec0(), "environment"));
    obs("obs-speaking", "speaking", A(rec0(), "speaking"));
    obs("obs-speakhum", "speakHum", A(rec0(), "speakHum"));
    obs("obs-speaksing", "speakSing", A(rec0(), "speakSing"));
    obs("obs-improve", "profile", { improve: A(rec0(), "profile").improve || [] });

    /* ---- single-choice questions ---- */
    const CHIP_GROUPS = {
      "comfort-q": (v) => {
        set("comfort", "feel", v);
        $("[data-comfort-msg]").innerHTML = comfortMessage(v);
        container.querySelectorAll("[data-rest-reminder]").forEach((el) => { el.hidden = !(v === "strained" || v === "notnormal"); });
      },
      "hum-q": (v) => set("hum", "feel", v),
      "glide-q": (v) => set("glide", "feel", v),
      "voice-q": (v) => {
        set("setup", "voice", v);
        preview.refresh();
        const b = $("[data-sample-ref]"); if (b) b.innerHTML = `${icon("play", "w-4 h-4")} Play the reference (${N(refNote(rec0()))})`;
      },
      "exp-q": (v) => set("profile", "experience", v),
      "feel-q": (v) => set("profile", "feel", v),
    };

    function onClick(e) {
      const t = e.target;
      if (t.closest("[data-listen-start]")) { startListening(); return; }
      if (t.closest("[data-listen-stop]")) { stopListening(false); return; }
      if (t.closest("[data-hum-start]")) { humGuide(); return; }
      if (t.closest("[data-seq-start]")) { seqGuide(); return; }
      if (t.closest("[data-hl-play]")) { playPair(); return; }
      const hc = t.closest("[data-hl-choice]");
      if (hc && !hc.disabled) { answerPair(hc.dataset.hlChoice); return; }
      if (t.closest("[data-hl-next]")) { nextPair(); return; }
      if (t.closest("[data-hl-again]")) { replayPairs(); return; }
      const gl = t.closest("[data-glide]");
      if (gl) { glide(gl.dataset.glide); return; }
      if (t.closest("[data-sample-ref]")) { if (!busy()) { VoiceRecorder.stopPlayback(); PianoSynth.play(refNote(rec0()), { duration: 1.6 }); } return; }
      const chip = t.closest("[data-assess-choice]");
      const group = chip && chip.closest("[data-assess]");
      if (!group || !CHIP_GROUPS[group.dataset.assess]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      CHIP_GROUPS[group.dataset.assess](chip.dataset.assessChoice);
    }
    /** Listening again after finishing: the same four pairs, answers kept (the checkpoint stays). */
    let replay = null;
    function replayPairs() {
      replay = 0;
      const host = $("[data-hl-host]");
      const draw = () => {
        const [a, b] = PAIRS[replay];
        host.innerHTML = `
          <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-3">Practice pair ${replay + 1} of ${PAIRS.length}</p>
            <button type="button" data-hl-replay class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play the two notes</button>
            <p class="text-sm text-ink-400 mt-3" data-hl-replay-answer>Which one sounds higher? Decide, then reveal.</p>
            <div class="flex flex-wrap justify-center gap-2 mt-3">
              <button type="button" data-hl-reveal class="vr-btn">Reveal</button>
              <button type="button" data-hl-replay-next class="vr-btn">${replay < PAIRS.length - 1 ? "Next pair" : "Done"}</button>
            </div>
          </div>`;
        host.querySelector("[data-hl-replay]").onclick = () => { if (!busy()) { piano.playNote(a, 0.9); later(() => piano.playNote(b, 0.9), 1150); } };
        host.querySelector("[data-hl-reveal]").onclick = () => { host.querySelector("[data-hl-replay-answer]").textContent = b > a ? "The second note was higher." : "The first note was higher."; };
        host.querySelector("[data-hl-replay-next]").onclick = () => { replay += 1; if (replay < PAIRS.length) draw(); else host.innerHTML = pairCard(rec0()); };
      };
      draw();
    }
    container.addEventListener("click", onClick);
    cleanups.push(() => container.removeEventListener("click", onClick));

    /* ---- reflection, discovery, notes ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    const disc = $("[data-discovery]");
    const saveDisc = Utils.debounce((v) => set("assignment", "discovery", v), 500);
    disc.addEventListener("input", () => saveDisc(disc.value));
    own(PersonalNotes.wire(container, "notes-mv", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: filled(A(rec, "assignment").discovery) ? A(rec, "assignment").discovery : "Learning to sing starts with learning to listen.",
        struggled: "",
        toPractice: r[4] || "",
        thoughts: qs.map((q, i) => (filled(r[i]) ? `${q} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
