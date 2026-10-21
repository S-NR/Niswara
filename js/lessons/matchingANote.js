/* ============================================================
   CLASS 4 — MATCHING A NOTE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "matching-a-note".
   Core loop: Listen → Remember → Sing → Compare → Adjust.
   Class 3 asked "can I hear the difference?"; Class 4 asks
   "can I move my voice toward the note?". Ear first: the learner
   always judges a take themselves before any pitch estimate,
   and nothing here is scored for accuracy.

   Reuses: LessonKit, VirtualPiano, PianoSynth, PitchMatchExercise
   (VoiceRecorder + PitchAnalysis), Timer, PersonalNotes,
   ClassProgress, ClassActivity (per-user, synced to Supabase).
   ============================================================ */

const MatchingANoteLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "hear", label: "Hear" },
    { id: "sing", label: "Sing" },
    { id: "adjust", label: "Adjust" },
    { id: "match", label: "Match" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration (change here to adjust difficulty later) ---- */
  const RANGES = {
    middle: { from: 60, to: 72, label: "Middle · C4–C5", hint: "Most beginners start here" },
    lower: { from: 48, to: 60, label: "Lower · C3–C4", hint: "Often easier for deeper voices" },
  };
  const DEFAULT_RANGE = "middle";
  const BLIND_ROUNDS = 3;
  const CHAIN_LEVELS = [
    { key: "steps", label: "Neighbouring notes", offsets: [0, 2, 4], available: true },
    { key: "thirds", label: "Wider steps", offsets: [0, 4, 7], available: false, lockedNote: "unlocks after more practice" },
  ];
  const CHAIN_LEVEL = "steps";

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson (steps 1–2)" },
    { key: "ex1", label: "Exercise 1 — Listen and Sing" },
    { key: "ex2", label: "Exercise 2 — Try Again and Adjust (3 attempts)" },
    { key: "ex3", label: "Exercise 3 — Slide Into the Note (both directions)" },
    { key: "ex4", label: `Exercise 4 — Blind Matching (${BLIND_ROUNDS} notes)` },
    { key: "ex5", label: "Exercise 5 — Note Chain" },
    { key: "practice", label: "Practice time recorded" },
    { key: "selfAssessment", label: "Self-assessment answered" },
    { key: "reflection", label: "Final reflection written" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const SELF_ASSESSMENT = [
    { q: "Could I hear the reference note clearly?", choices: ["Yes", "Mostly", "Not really"] },
    { q: "Could I reproduce approximately the same pitch?", choices: ["Yes", "Sometimes", "Not yet"] },
    { q: "Did my voice tend to be higher or lower?", choices: ["Higher", "Lower", "Close", "Not sure"] },
    { q: "Which notes felt easiest?", text: "e.g. C4 and D4" },
    { q: "Which notes felt difficult?", text: "e.g. the higher ones" },
    { q: "Did I feel any throat tension?", choices: ["No", "A little", "Yes"], safety: true },
    { q: "Did I feel like I was pushing my voice?", choices: ["No", "A little", "Yes"], safety: true },
    { q: "What did I learn today?", text: "One or two sentences" },
  ];

  // Assignment item index -> automatic evidence (others are ticked by the learner)
  const AUTO_ASSIGNMENT = { 0: "noteChosen", 1: "pianoPlayed", 4: "ex1Recorded", 5: "ex1Assessed", 6: "ex2", 7: "threeNotes", 9: "reflection" };

  /* ---- Exercise definitions ---- */
  const EXERCISES = {
    ex1: {
      eyebrow: "Exercise 1 · Sing",
      title: "Listen and Sing",
      intro: "Play the reference and <strong class=\"text-ink-200\">listen carefully</strong>. Hold it in your mind for a moment. <strong class=\"text-ink-200\">Now sing the same note</strong> — gently, on “ah” or “mm”, for 3–5 seconds — and record it. Then play the reference and your recording one after the other, and compare them by ear.",
      flow: ["🎹 Hear", "👂 Listen", "🎤 Sing", "🎧 Listen back"],
      slots: [{ key: "take", label: "Your voice", hint: "Sing the reference note gently for 3–5 seconds" }],
      assessment: {
        question: "Does your voice sound like it is on the same pitch?",
        options: [
          { value: "matched", label: "I think I matched it", tone: "good" },
          { value: "unsure", label: "I'm not sure", tone: "maybe" },
          { value: "missed", label: "I think I missed it", tone: "miss" },
        ],
        feedback: {
          matched: "Lovely — your ear and voice agreed. Notice what that felt like.",
          unsure: "That's honest, and normal at this stage. Play the two back-to-back once more — the next exercise helps with exactly this.",
          missed: "Noticing that you missed is the skill we're training. The next exercise shows you how to adjust.",
        },
      },
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
    ex2: {
      eyebrow: "Exercise 2 · Adjust",
      title: "Try Again and Adjust",
      intro: "Matching a note usually takes a few small adjustments — even for experienced singers. Sing three attempts at the same note. After each one, listen back and decide which way to move.",
      flow: ["🎤 Sing", "🎧 Listen back", "🔄 Adjust", "🎤 Try again"],
      tips: `
        <p class="mb-1.5">If your voice sounds <strong class="text-ink-100">higher</strong> than the piano note, gently move your pitch <strong class="text-ink-100">downward</strong>.</p>
        <p class="mb-1.5">If your voice sounds <strong class="text-ink-100">lower</strong> than the piano note, gently move your pitch <strong class="text-ink-100">upward</strong>.</p>
        <p class="text-ink-500">Adjusting means thinking the note a little higher or lower — never pushing your throat or using more breath.</p>`,
      slots: [
        { key: "a1", label: "Attempt 1 — Listen", hint: "Sing it as you remember it" },
        { key: "a2", label: "Attempt 2 — Adjust", hint: "Move gently toward the note" },
        { key: "a3", label: "Attempt 3 — Refine", hint: "A small, relaxed correction" },
      ],
      assessment: {
        question: "Compared with the piano, this attempt sounded…",
        options: [
          { value: "higher", label: "Higher", tone: "maybe" },
          { value: "close", label: "Close / the same", tone: "good" },
          { value: "lower", label: "Lower", tone: "maybe" },
          { value: "unsure", label: "Not sure", tone: "neutral" },
        ],
        feedback: {
          higher: "Next attempt: gently move your pitch downward. Think the note a little lower — no extra push.",
          lower: "Next attempt: gently move your pitch upward. Keep the same easy breath — don't push more air.",
          close: "Lovely. Keep that relaxed feeling for the next attempt.",
          unsure: "Play the reference and this attempt back-to-back once or twice, then decide.",
        },
      },
      isComplete: (s) => ["a1", "a2", "a3"].every((k) => s.takes[k] && s.takes[k].mediaId),
    },
    ex3: {
      eyebrow: "Exercise 3 · Adjust",
      title: "Slide Into the Note",
      intro: "Play the reference. Start your voice <strong class=\"text-ink-200\">slightly below</strong> the note and slide gently upward until you feel you meet it — then hold it for a moment. Then try the other way: start <strong class=\"text-ink-200\">slightly above</strong> and slide gently down. <em>This exercise helps your ear notice where the target pitch is.</em>",
      tips: "Keep the slide small and smooth — a little below or above, not a siren. Stay comfortable and quiet.",
      slots: [
        { key: "below", label: "From below ↗", hint: "Start a little lower, glide gently up, settle on the note", focus: "end" },
        { key: "above", label: "From above ↘", hint: "Start a little higher, glide gently down, settle on the note", focus: "end" },
      ],
      assessment: null,
      isComplete: (s) => !!(s.takes.below && s.takes.below.mediaId && s.takes.above && s.takes.above.mediaId),
    },
    ex4: {
      eyebrow: "Exercise 4 · Match",
      title: "Blind Note Matching",
      intro: "This time there's <strong class=\"text-ink-200\">no note name</strong> — only your ears. Listen to the reference, then match it. After you've judged your attempt, the note is revealed. This builds listening, not reading.",
      flow: ["🎹 Hear", "🧠 Remember", "🎤 Sing", "🎧 Compare"],
      hidden: true,
      rounds: BLIND_ROUNDS,
      refLabel: "Mystery note",
      slots: [{ key: "take", label: "Your voice", hint: "Listen to the reference. Now match it." }],
      assessment: {
        question: "How close do you think you were?",
        options: [
          { value: "veryClose", label: "Very close", tone: "good" },
          { value: "close", label: "Close", tone: "good" },
          { value: "unsure", label: "Not sure", tone: "neutral" },
          { value: "again", label: "Needs another attempt", tone: "maybe" },
        ],
        feedback: {
          veryClose: "Nice listening. The note name is now shown above.",
          close: "Good — close is real progress. The note name is now shown above.",
          unsure: "That's fine. Compare them once more; the note name is now shown above.",
          again: "Record again whenever you like — or move on to the next note.",
        },
      },
      isComplete: (s) => (s.blindDone || []).length + (s.takes.take && s.takes.take.assessment ? 1 : 0) >= BLIND_ROUNDS,
    },
    ex5: {
      eyebrow: "Exercise 5 · Match",
      title: "Note Chain",
      intro: "Three neighbouring notes, one after another. Listen to all three, then sing them back in the same order — one, two, three — each on a gentle “ah”.",
      flow: ["🎹 Hear 3 notes", "🧠 Remember", "🎤 Sing 3 notes", "🎧 Compare"],
      chain: true,
      slots: [{ key: "take", label: "Your chain", hint: "Sing the three notes in order, a second or so each" }],
      assessment: {
        question: "Did your voice step through the notes?",
        options: [
          { value: "yes", label: "I think so", tone: "good" },
          { value: "partly", label: "Some of them", tone: "maybe" },
          { value: "unsure", label: "Not sure", tone: "neutral" },
        ],
        feedback: {
          yes: "Lovely — that's the beginning of singing melodies.",
          partly: "Very normal. Try the chain slowly, one note at a time, then join them up.",
          unsure: "Play the reference chain and your recording one after the other — listen for three steps up.",
        },
      },
      isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
    },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow, tryIt } = LessonKit;

  /* ---------- derived state ---------- */

  function setup(rec) { return rec.answers.setup || {}; }
  function range(rec) { return RANGES[setup(rec).range] || RANGES[DEFAULT_RANGE]; }
  function refNote(rec) {
    const r = range(rec);
    const n = setup(rec).note;
    return n >= r.from && n <= r.to ? n : r.from;
  }
  function chainNotes(rec) {
    const level = CHAIN_LEVELS.find((l) => l.key === CHAIN_LEVEL);
    return level.offsets.map((o) => range(rec).from + o);
  }
  function exState(rec, key) {
    const s = (rec.answers.exercises || {})[key] || {};
    return { ...s, takes: s.takes || {} };
  }
  function exDone(rec, key) { return EXERCISES[key].isComplete(exState(rec, key)); }

  function notesSung(rec) {
    const notes = new Set();
    ["ex1", "ex2", "ex3"].forEach((k) => Object.values(exState(rec, k).takes).forEach((t) => t.notes && notes.add(t.notes[0])));
    const e4 = exState(rec, "ex4");
    (e4.blindDone || []).forEach((d) => notes.add(d.note));
    if (e4.takes.take && e4.blindNote) notes.add(e4.blindNote);
    return new Set([...notes].map((n) => (typeof n === "number" ? NoteUtils.name(n) : n)));
  }

  function selfAssessmentDone(rec) {
    const a = rec.answers.selfAssessment || {};
    return SELF_ASSESSMENT.every((_, i) => a[i] && String(a[i]).trim());
  }
  function reflectionDone(rec, cls) {
    const r = rec.answers.reflection || {};
    return cls.content.assignment.questions.every((_, i) => r[i] && r[i].trim());
  }

  function evidence(rec, cls, key) {
    const s = setup(rec);
    switch (key) {
      case "noteChosen": return !!s.noteChosen;
      case "pianoPlayed": return !!s.pianoPlayed;
      case "ex1Recorded": return !!(exState(rec, "ex1").takes.take);
      case "ex1Assessed": return exDone(rec, "ex1");
      case "ex2": return exDone(rec, "ex2");
      case "threeNotes": return notesSung(rec).size >= 3;
      case "reflection": return reflectionDone(rec, cls);
      default: return false;
    }
  }

  function assignmentItemDone(rec, cls, i) {
    const auto = AUTO_ASSIGNMENT[i];
    if (auto) return evidence(rec, cls, auto);
    return !!(rec.answers.assignment || {})[i];
  }

  /** Checkpoints that follow from the saved answers. Exercises only ever move forward. */
  function derivedCheckpoints(rec, cls) {
    const out = {};
    Object.keys(EXERCISES).forEach((k) => { if (exDone(rec, k)) out[k] = true; });
    if (Store.classPracticeMinutes(cls.id) > 0) out.practice = true;
    out.selfAssessment = selfAssessmentDone(rec);
    out.reflection = reflectionDone(rec, cls);
    out.assignment = cls.content.assignment.instructions.every((_, i) => assignmentItemDone(rec, cls, i));
    return out;
  }

  /* ---------- small visuals ---------- */

  function loopDiagram() {
    const steps = [["🎹", "Reference note"], ["👂", "Listen"], ["🧠", "Remember the sound"], ["🎤", "Sing"], ["👂", "Listen to yourself"], ["🔄", "Adjust"]];
    return `<div class="loop-diagram grid grid-cols-3 sm:grid-cols-6 gap-2 my-6">
      ${steps.map(([e, t], i) => `
        <div class="loop-step rounded-2xl border border-white/5 bg-white/[0.03] px-2 py-4 text-center">
          <div class="text-2xl mb-1.5" aria-hidden="true">${e}</div>
          <div class="text-[11px] text-ink-300 leading-tight">${t}</div>
          <div class="text-[10px] text-ink-600 mt-1">${i + 1}</div>
        </div>`).join("")}
    </div>`;
  }

  function flatSharpSvg(offset, label, cls) {
    const W = 200, H = 70, y0 = 35, yv = y0 - offset;
    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="${label}">
        <line x1="10" x2="${W - 10}" y1="${y0}" y2="${y0}" class="pg-ref"/>
        <line x1="10" x2="${W - 10}" y1="${yv}" y2="${yv}" class="pg-voice ${cls}"/>
      </svg>`;
  }

  /* ---------- live sections ---------- */

  function renderAssignment(cls, rec) {
    const r = rec.answers.reflection || {};
    const sung = notesSung(rec);
    return LessonKit.renderAssignment({
      title: "Class 4 Assignment",
      items: cls.content.assignment.instructions.map((t, i) => i === 7 ? `${t} <span class="text-ink-500">(${Math.min(3, sung.size)}/3${sung.size ? ": " + [...sung].slice(0, 6).join(", ") : ""})</span>` : t),
      isDone: (i) => assignmentItemDone(rec, cls, i),
      isAuto: (i) => !!AUTO_ASSIGNMENT[i],
      footer: `
        <div class="mt-6 pt-6 border-t border-white/5">
          <h4 class="font-display text-lg text-ink-50 mb-1">Final reflection</h4>
          <p class="text-xs text-ink-500 mb-4">Saved as you type. A sentence or two each is plenty.</p>
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="c4-reflection-${i}">${q}</label>
                <textarea id="c4-reflection-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(r[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        </div>`,
    });
  }

  function progressStats(cls) {
    return [
      { label: "Recording attempts", value: ClassActivity.count(cls.id, "recordings") },
      { label: "Self-evaluations", value: ClassActivity.count(cls.id, "selfEvaluations") },
      { label: "Pitch Training logged here", value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const exCount = Object.keys(EXERCISES).filter((k) => c[k]).length;
    return [
      ["Lesson completed", !!c.lessonViewed],
      [`Exercises completed (${exCount}/5)`, exCount === 5],
      ["Practice recorded", !!c.practice],
      ["Reflection completed", !!(c.selfAssessment && c.reflection)],
      ["Assignment completed", !!c.assignment],
    ];
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = summaryLines(rec).map(([t, ok]) => `
      <li class="flex items-center gap-2.5 text-sm ${ok ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${ok ? icon("check", "w-3 h-3") : ""}</span>${t}
      </li>`).join("");
    const bridge = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-sm text-ink-300 leading-relaxed mb-2">In Class 4, you learned to match your voice to an <strong class="text-ink-100">external reference</strong>.</p>
        <p class="text-sm text-ink-300 leading-relaxed">In Class 5, we'll turn our attention to something equally important: <strong class="text-ink-100">learning to listen to YOUR OWN voice.</strong></p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class 4 complete</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">Ear → brain → voice: connected.</h3>
          <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
          ${bridge}
          ${next ? `
          <div class="mt-6">
            <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
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
            Complete Class 4 ${icon("check", "w-4 h-4")}
          </button>
        </div>
        ${bridge}
      </div>`;
  }

  function renderSelfAssessment(rec) {
    const a = rec.answers.selfAssessment || {};
    const strain = [5, 6].some((i) => a[i] && a[i] !== "No");
    return `
      <div class="flex flex-col gap-5">
        ${SELF_ASSESSMENT.map((item, i) => `
          <div>
            <p class="text-sm text-ink-200 mb-2"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${item.q}</p>
            ${item.choices
              ? `<div class="flex flex-wrap gap-2">${item.choices.map((c) => `<button type="button" data-sa="${i}" data-sa-value="${c}" class="ex-chip ${a[i] === c ? "is-selected" : ""}">${c}</button>`).join("")}</div>`
              : `<input type="text" data-sa-text="${i}" class="field" placeholder="${item.text}" value="${Utils.escapeHtml(a[i] || "")}">`}
          </div>`).join("")}
        <div data-sa-safety ${strain ? "" : "hidden"} class="rounded-2xl border border-teal-300/20 bg-teal-500/[0.06] px-4 py-3 text-sm text-teal-300">
          Thank you for noticing that — it matters. Next time, sing more quietly, choose an easier note (try the Lower range), and rest between attempts. Singing should never hurt; if discomfort keeps coming back, take a break and consider asking a voice teacher or doctor.
        </div>
      </div>`;
  }

  /* ---------- page ---------- */

  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const r = range(rec);
    const rangeKey = setup(rec).range || DEFAULT_RANGE;

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "From hearing pitch to matching it", `
          ${p("In <strong class=\"text-ink-100\">Class 3</strong> you learned to <em>recognise</em> pitch — to hear whether a note goes up, down or stays the same. Now you'll learn to <strong class=\"text-ink-100\">reproduce</strong> it: to hear a note and make your voice meet it.")}
          ${p("Every time you match a note, the same little loop happens:")}
          ${loopDiagram()}
          <div class="grid sm:grid-cols-2 gap-4 my-6">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Matching a note is NOT about</p>
              <ul class="flex flex-col gap-1.5 text-sm text-ink-400">
                ${["Singing loudly", "Singing beautifully", "Singing high", "Singing low", "Having a large vocal range"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.05] p-5 flex flex-col justify-center">
              <p class="text-xs uppercase tracking-wider text-gold-400/80 mb-3">It is about</p>
              <p class="font-display text-xl text-ink-50 leading-snug">“Making your voice reach the same pitch as the reference.”</p>
            </div>
          </div>
          ${p("That's all. Ear → brain → voice. You'll practise the loop in five short exercises, each one a small step further than the last.")}
        `)}

        ${chapter("understand", 2, "Choose comfort over range", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-6">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-4">“Choose comfort over range.”</p>
            <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-200">
              ${["Always start with a comfortable note.", "Do not force high notes.", "Do not force low notes.", "Do not strain the throat.", "Do not push more air to reach a note.", "If your voice feels uncomfortable, stop and choose an easier note."]
                .map((t) => `<li class="flex gap-2"><span class="text-teal-300">●</span>${t}</li>`).join("")}
            </ul>
          </div>
          ${p("The goal today is <strong class=\"text-ink-100\">accuracy and relaxation</strong> — not difficulty. A comfortable note matched calmly teaches you far more than a hard note reached with effort.")}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("hear", 3, "Find your reference note", `
          ${narrow(`
            ${p("First choose a comfortable range, then tap a key to choose your <strong class=\"text-ink-100\">reference note</strong> — the note you'll match in the first exercises. Hum along quietly with a few keys and pick one that feels effortless.")}
            <div class="flex flex-wrap gap-2 mb-6" role="radiogroup" aria-label="Comfortable range">
              ${Object.entries(RANGES).map(([k, v]) => `
                <button type="button" data-range="${k}" role="radio" aria-checked="${k === rangeKey}" class="ex-chip ${k === rangeKey ? "is-selected" : ""}">
                  ${v.label} <span class="text-ink-500 text-xs">· ${v.hint}</span>
                </button>`).join("")}
            </div>`)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-7 shadow-2xl" data-match-piano-wrap>
            ${VirtualPiano.render("match-piano", { controls: true, keyboard: true })}
          </div>
          ${narrow(`
            <div class="flex flex-wrap items-center gap-4 mt-5 rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4">
              <span class="text-xs uppercase tracking-[0.2em] text-gold-400/80">Your reference note</span>
              <span class="font-display text-3xl text-ink-50" data-chosen-note>${NoteUtils.name(refNote(rec))}</span>
              <button type="button" data-chosen-replay class="vr-btn">${icon("play", "w-4 h-4")} Replay</button>
              <span class="text-xs text-ink-500">Tap any key above to change it. Range: ${r.label}</span>
            </div>`)}
        `, { wide: true })}

        ${chapter("sing", 4, "Exercise 1 — Listen and Sing", PitchMatchExercise.render("pm-ex1", EXERCISES.ex1))}

        ${chapter("adjust", 5, "Exercise 2 — Try Again and Adjust", PitchMatchExercise.render("pm-ex2", EXERCISES.ex2))}

        ${chapter("adjust", 6, "Flat and sharp", `
          ${p("Now that you've felt yourself land a little high or low, here are the two words musicians use for it:")}
          <div class="grid sm:grid-cols-3 gap-4 my-6">
            ${[
              ["Flat", "Your note is slightly <strong class=\"text-ink-100\">lower</strong> than the target.", -12, "is-below", "flat"],
              ["In tune", "Your note sits <strong class=\"text-ink-100\">on</strong> the target.", 0, "is-near", "inTune"],
              ["Sharp", "Your note is slightly <strong class=\"text-ink-100\">higher</strong> than the target.", 12, "is-above", "sharp"],
            ].map(([t, d, off, c, demo]) => `
              <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <h4 class="font-display text-lg text-ink-50 mb-1">${t}</h4>
                <div class="my-2">${flatSharpSvg(off, t, c)}</div>
                <p class="text-sm text-ink-400 mb-3">${d}</p>
                <button type="button" data-fs-demo="${demo}" class="ex-chip">${icon("play", "w-3.5 h-3.5")} Hear it</button>
              </div>`).join("")}
          </div>
          <p class="text-xs text-ink-500 mb-4">In each demo the piano plays the target, then the same note slightly flat, in tune, or sharp. <span class="inline-flex items-center gap-1.5 ml-2"><span class="pg-key-ref"></span>target</span> <span class="inline-flex items-center gap-1.5 ml-2"><span class="pg-key-voice"></span>your note</span></p>
          ${p("That's all the theory you need for now. Being a little flat or sharp is normal — noticing it is the skill.")}
        `)}

        ${chapter("adjust", 7, "Exercise 3 — Slide Into the Note", PitchMatchExercise.render("pm-ex3", EXERCISES.ex3))}

        ${chapter("match", 8, "Exercise 4 — Blind Note Matching", PitchMatchExercise.render("pm-ex4", EXERCISES.ex4))}

        ${chapter("match", 9, "Exercise 5 — Note Chain", `
          <div class="flex flex-wrap items-center gap-2 mb-4" aria-label="Chain difficulty">
            <span class="text-xs text-ink-500 mr-1">Difficulty:</span>
            ${CHAIN_LEVELS.map((l) => `
              <span class="ex-chip ${l.key === CHAIN_LEVEL ? "is-selected" : "opacity-50 cursor-not-allowed"}" title="${l.available ? "" : l.lockedNote}">
                ${l.available ? "" : icon("lock", "w-3 h-3")} ${l.label} <span class="text-ink-500 text-xs">· ${l.offsets.map((o) => NoteUtils.name(r.from + o).replace(/\d/, "")).join("–")}</span>
              </span>`).join("")}
          </div>
          ${PitchMatchExercise.render("pm-ex5", EXERCISES.ex5)}
        `)}

        ${chapter("practice", 10, "Practice timer — Pitch Training", `
          ${p("Repeat any exercise you like while the timer runs — a few relaxed minutes of matching is ideal. When you're done, log the session. It's saved to your account under <strong class=\"text-ink-100\">Pitch Training</strong>.")}
          ${Timer.render("match-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("reflect", 11, "Self-assessment", `
          ${p("Honest answers help you — there are no wrong ones. Saved privately to your Class 4 progress.")}
          <div data-self-assessment>${renderSelfAssessment(rec)}</div>
        `)}

        ${chapter("reflect", 12, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("match-notes", { placeholder: "e.g. C4 was easy to match. I usually sang slightly below the note. I found higher notes harder. I could hear when I was getting closer." })}
        `)}

        ${chapter("complete", 13, "Assignment", `<div data-lesson-assignment>${renderAssignment(cls, rec)}</div>`)}

        ${chapter("complete", 14, "Your progress", `<div data-lesson-progress>${ClassProgress.render("Class 4 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 15, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function mount(container, cls, params) {
    const cleanups = [];
    const classId = cls.id;
    const $ = (s) => container.querySelector(s);
    const rec0 = () => ClassActivity.get(classId);

    /* ---- live progress ---- */
    function refreshLive() {
      const rec = rec0();
      const assign = $("[data-lesson-assignment]");
      // Don't rebuild the reflection boxes while the learner is typing in them
      if (!assign.contains(document.activeElement)) assign.innerHTML = renderAssignment(cls, rec);
      $("[data-lesson-progress]").innerHTML = ClassProgress.render("Class 4 Progress", PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
    }

    function syncCheckpoints() {
      const rec = rec0();
      const want = derivedCheckpoints(rec, cls);
      Object.entries(want).forEach(([k, v]) => {
        const isExercise = k in EXERCISES || k === "practice";
        if (isExercise && !v) return; // exercises / practice never move backwards
        if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v);
      });
    }

    let syncing = false;
    cleanups.push(ClassActivity.onChange((id) => {
      if (id !== classId || !container.isConnected || syncing) return;
      syncing = true;
      syncCheckpoints();
      syncing = false;
      refreshLive();
    }));
    LessonKit.loadAndRefresh(container, classId, params); // brings in progress from this account's other devices

    /* ---- reference note: range + piano ---- */
    let piano = null;
    function wirePiano() {
      if (piano) piano.destroy();
      piano = VirtualPiano.wire(container, "match-piano", {
        range: { from: range(rec0()).from, to: range(rec0()).to },
        keyboard: true,
        onNote: ({ midi }) => {
          const s = { ...setup(rec0()), note: midi, noteChosen: true, pianoPlayed: true };
          ClassActivity.setAnswer(classId, "setup", "note", s.note);
          ClassActivity.setAnswer(classId, "setup", "noteChosen", true);
          ClassActivity.setAnswer(classId, "setup", "pianoPlayed", true);
          $("[data-chosen-note]").textContent = NoteUtils.name(midi);
          refreshExercises();
        },
      });
    }
    wirePiano();
    cleanups.push(() => piano && piano.destroy());

    function onSetupClick(e) {
      const rb = e.target.closest("[data-range]");
      if (rb) {
        const key = rb.dataset.range;
        ClassActivity.setAnswer(classId, "setup", "range", key);
        ClassActivity.setAnswer(classId, "setup", "note", RANGES[key].from);
        container.querySelectorAll("[data-range]").forEach((b) => {
          const on = b.dataset.range === key;
          b.classList.toggle("is-selected", on);
          b.setAttribute("aria-checked", String(on));
        });
        $("[data-match-piano-wrap]").innerHTML = VirtualPiano.render("match-piano", { controls: true, keyboard: true });
        wirePiano();
        $("[data-chosen-note]").textContent = NoteUtils.name(refNote(rec0()));
        refreshExercises();
        return;
      }
      if (e.target.closest("[data-chosen-replay]")) {
        PianoSynth.play(refNote(rec0()), { duration: 1.6 });
        ClassActivity.setAnswer(classId, "setup", "pianoPlayed", true);
        return;
      }
      const fs = e.target.closest("[data-fs-demo]");
      if (fs) {
        const ref = refNote(rec0());
        const offs = { flat: -0.35, inTune: 0, sharp: 0.35 }[fs.dataset.fsDemo];
        PianoSynth.playSequence([ref, ref + offs], { duration: 1.1, gap: 0.25 });
      }
    }
    container.addEventListener("click", onSetupClick);
    cleanups.push(() => container.removeEventListener("click", onSetupClick));

    /* ---- the five exercises ---- */
    const controllers = {};
    function pickBlindNote(prev) {
      const r = range(rec0());
      const pool = [];
      for (let m = r.from; m < r.to; m++) if (!NoteUtils.isBlack(m)) pool.push(m);
      let m;
      do { m = pool[Math.floor(Math.random() * pool.length)]; } while (m === prev && pool.length > 1);
      return m;
    }
    Object.keys(EXERCISES).forEach((key) => {
      const cfg = EXERCISES[key];
      controllers[key] = PitchMatchExercise.wire(container, `pm-${key}`, cfg, {
        classId, exerciseId: key,
        state: exState(rec0(), key),
        getNotes: () => (cfg.chain ? chainNotes(rec0()) : [refNote(rec0())]),
        pickBlindNote,
        isComplete: cfg.isComplete,
        onState: (s) => ClassActivity.setAnswer(classId, "exercises", key, s),
        onRecorded: () => ClassActivity.bump(classId, "recordings"),
        onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
      });
    });
    function refreshExercises() { Object.values(controllers).forEach((c) => c.refresh()); }
    cleanups.push(() => Object.values(controllers).forEach((c) => c.destroy()));

    /* ---- practice timer (category: Pitch Training) ---- */
    const practiceStatus = $("[data-practice-status]");
    const showPractice = (extra = "") => {
      const total = Store.classPracticeMinutes(classId);
      practiceStatus.textContent = `${extra}${total ? `Pitch Training logged in this class: ${total} min.` : ""}`;
    };
    showPractice();
    const timer = Timer.wire(container, "match-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { showPractice("Practise for at least a minute, then log the session. "); return; }
        Store.logMinutes("pitch", minutes, { classId });
        ClassActivity.markCheckpoint(classId, "practice");
        showPractice(`Logged ${minutes} min. `);
        refreshLive();
      },
    });
    cleanups.push(() => timer.destroy());

    /* ---- self-assessment ---- */
    function saveSA(i, value) {
      ClassActivity.setAnswer(classId, "selfAssessment", String(i), value);
      const a = rec0().answers.selfAssessment || {};
      $("[data-sa-safety]").hidden = ![5, 6].some((k) => a[k] && a[k] !== "No");
    }
    function onSA(e) {
      const chip = e.target.closest("[data-sa]");
      if (!chip) return;
      const i = chip.dataset.sa;
      container.querySelectorAll(`[data-sa="${i}"]`).forEach((b) => b.classList.toggle("is-selected", b === chip));
      saveSA(i, chip.dataset.saValue);
    }
    container.addEventListener("click", onSA);
    cleanups.push(() => container.removeEventListener("click", onSA));
    container.querySelectorAll("[data-sa-text]").forEach((inp) => {
      inp.addEventListener("input", Utils.debounce(() => saveSA(inp.dataset.saText, inp.value), 500));
    });

    /* ---- My Notes ---- */
    const notes = PersonalNotes.wire(container, "match-notes", {
      classId,
      onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); },
    });
    cleanups.push(() => notes.destroy());

    /* ---- final reflection (inside the assignment card, which re-renders) ---- */
    // One debounced saver per question — a shared one would drop all but the last box typed in
    const reflectionSavers = {};
    function onReflection(e) {
      const ta = e.target.closest("[data-reflection]");
      if (!ta) return;
      const i = ta.dataset.reflection;
      reflectionSavers[i] = reflectionSavers[i] || Utils.debounce((v) => ClassActivity.setAnswer(classId, "reflection", i, v), 500);
      reflectionSavers[i](ta.value);
    }
    container.addEventListener("input", onReflection);
    cleanups.push(() => container.removeEventListener("input", onReflection));

    /* ---- assignment ticks + completion ---- */
    function onCompleteArea(e) {
      const cb = e.target.closest("[data-assignment]");
      if (cb) {
        if (e.type === "change" && !cb.disabled) ClassActivity.setAnswer(classId, "assignment", cb.dataset.assignment, cb.checked);
        return;
      }
      const done = e.type === "click" && e.target.closest("[data-complete-class]");
      if (done && !done.disabled) {
        const rec = rec0();
        Store.completeClass(classId);
        ClassActivity.markCompleted(classId);
        const r = rec.answers.reflection || {};
        const qs = cls.content.assignment.questions;
        const sa = rec.answers.selfAssessment || {};
        Store.addJournalEntry({
          classId,
          classTitle: `Class ${cls.number} — ${cls.title}`,
          learned: sa[7] || cls.content.whatYoullLearn,
          struggled: sa[4] || "",
          thoughts: qs.map((q, i) => (r[i] && r[i].trim() ? `${q} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
        });
        Router.softRefresh(container, ClassDetailPage, params);
      }
    }
    container.addEventListener("change", onCompleteArea);
    container.addEventListener("click", onCompleteArea);
    cleanups.push(() => {
      container.removeEventListener("change", onCompleteArea);
      container.removeEventListener("click", onCompleteArea);
    });

    cleanups.push(LessonKit.wireViewedSentinel(container, () => ClassActivity.markCheckpoint(classId, "lessonViewed")));
    cleanups.push(LessonKit.wireStepper(container));
    syncCheckpoints();

    return () => {
      cleanups.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
      PianoSynth.stopAll();
      VoiceRecorder.stopPlayback();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS, RANGES, CHAIN_LEVELS };
})();
