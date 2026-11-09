/* ============================================================
   LEVEL 2, CLASS 5 — AROHANA AND AVAROHANA (interactive lesson)

   Rendered by ClassDetailPage for interactive: "arohana-and-avarohana".

   Curriculum identity: Level 2, Class 5 (`number: 5`, `levelId: 2`
   in data.js, explicit id `L2C28`). Rebuilt against this class's own
   later, more detailed "Claude Prompt" spec (a recap section, a
   side-by-side Arohana/Avarohana comparison, 3 named guided-practice
   exercises, a dedicated raga-structures section, a 6-question
   knowledge check, and a 6-item checklist) — supersedes the shorter
   version first written during the Level 2 Curriculum Upgrade.
   Builds on Class 4's seven swaras (`L2C27`) and Class 3's chosen Sa
   (`L2C26`).

   Core idea: "Learn how musical notes travel upward and downward."
   Arohana and avarohana are introduced as directional names for the
   same swara sequence, with two honesty boundaries the spec asks for
   explicitly: (1) the swaras are NOT equally spaced in frequency —
   this class's own sequence already uses uneven semitone steps, never
   presented as a simple equal-step staircase; (2) a raga has its own
   characteristic ascending/descending structure that this basic
   seven-swara sequence does not represent — not every raga uses all
   seven swaras in both directions, some ragas differ between the two
   directions, and this exercise is never implied to BE a raga. No
   detailed raga, gamaka or tala theory is taught here.

   Honesty boundaries carried over from Classes 3-4: no fabricated
   pitch-detection; every note played is the same equal-tempered
   `PianoSynth` tone used throughout this app, relative to the
   learner's own chosen Sa. Highlighting during playback is genuinely
   synchronized (via `PianoSynth.playSequence`'s own `onNote`
   callback, which fires exactly when each note starts) — not faked.

   Reuses: LessonKit, VirtualPiano (visual aid only), PianoSynth
   .playSequence, RecordingCard, PersonalNotes, ClassProgress.
   ============================================================ */

const ArohanaAndAvarohanaLesson = (() => {
  const STAGES = [
    { id: "recap", label: "Recap" },
    { id: "arohana", label: "Arohana" },
    { id: "avarohana", label: "Avarohana" },
    { id: "compare", label: "Compare" },
    { id: "practice", label: "Practice" },
    { id: "raga", label: "Ragas" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SA_MAX = RANGE.to - 12;

  const SWARAS = [
    { key: "sa", label: "Sa", semitone: 0 },
    { key: "ri", label: "Ri", semitone: 2 },
    { key: "ga", label: "Ga", semitone: 4 },
    { key: "ma", label: "Ma", semitone: 5 },
    { key: "pa", label: "Pa", semitone: 7 },
    { key: "dha", label: "Dha", semitone: 9 },
    { key: "ni", label: "Ni", semitone: 11 },
    { key: "sa2", label: "Sa˙", semitone: 12 },
  ];
  const AROHANA = SWARAS;
  const AVAROHANA = [...SWARAS].reverse();
  const AROHANA_FIRST_HALF = SWARAS.slice(0, 4); // Sa Ri Ga Ma
  const AROHANA_SECOND_HALF = SWARAS.slice(3); // Ma Pa Dha Ni Sa˙ (Ma repeated as the join point)
  const AVAROHANA_FIRST_HALF = AVAROHANA.slice(0, 4); // Sa˙ Ni Dha Pa
  const AVAROHANA_SECOND_HALF = AVAROHANA.slice(3); // Pa Ma Ga Ri Sa

  const KNOWLEDGE_CHECK = [
    {
      key: "arohanaMeaning",
      question: "What does Arohana mean?",
      options: [
        { value: "down", label: "Descending movement of swaras", correct: false },
        { value: "up", label: "Ascending movement of swaras", correct: true },
        { value: "rhythm", label: "A rhythm cycle", correct: false },
      ],
      explain: { down: "Not quite — that's Avarohana.", up: "Exactly right.", rhythm: "Not quite — Arohana is about pitch direction, not rhythm." },
    },
    {
      key: "avarohanaMeaning",
      question: "What does Avarohana mean?",
      options: [
        { value: "up", label: "Ascending movement of swaras", correct: false },
        { value: "down", label: "Descending movement of swaras", correct: true },
        { value: "sa", label: "A type of Sa", correct: false },
      ],
      explain: { up: "Not quite — that's Arohana.", down: "Exactly right.", sa: "Not quite — it's a direction, not a kind of Sa." },
    },
    {
      key: "afterGa",
      question: "Which swara follows Ga in the basic ascending sequence?",
      options: [
        { value: "ri", label: "Ri", correct: false },
        { value: "ma", label: "Ma", correct: true },
        { value: "pa", label: "Pa", correct: false },
      ],
      explain: { ri: "Not quite — Ri comes before Ga.", ma: "Right — Sa Ri Ga Ma Pa Dha Ni Sa˙.", pa: "Not quite — Ma comes between Ga and Pa." },
    },
    {
      key: "afterNiDown",
      question: "Which swara follows Ni when moving downward from the higher Sa?",
      options: [
        { value: "pa", label: "Pa", correct: false },
        { value: "dha", label: "Dha", correct: true },
        { value: "sa", label: "Sa", correct: false },
      ],
      explain: { pa: "Not quite — Dha comes between Ni and Pa going down.", dha: "Right — Sa˙ Ni Dha Pa Ma Ga Ri Sa.", sa: "Not quite — several swaras come before Sa on the way down." },
    },
    {
      key: "allRagasAllSwaras",
      question: "Do all ragas necessarily use all seven swaras in both directions?",
      options: [
        { value: "yes", label: "Yes, always", correct: false },
        { value: "no", label: "No — some ragas use fewer swaras, or different ones ascending versus descending", correct: true },
        { value: "unsure", label: "Ragas haven't been mentioned in this course yet", correct: false },
      ],
      explain: { yes: "Not quite — plenty of ragas differ from the simple seven-swara pattern used here.", no: "Right.", unsure: "Ragas were introduced conceptually in Section 6, just not in full theoretical depth." },
    },
    {
      key: "sufficientForRaga",
      question: "Are Arohana and Avarohana sufficient by themselves to explain every aspect of a raga?",
      options: [
        { value: "yes", label: "Yes, that's all there is to a raga", correct: false },
        { value: "no", label: "No — a raga has further characteristic rules and identity beyond just its ascending/descending sequence", correct: true },
        { value: "notsure", label: "This class doesn't say", correct: false },
      ],
      explain: { yes: "Not quite — a raga is more than just its ascending and descending swara sequence.", no: "Exactly right.", notsure: "This class does say — explicitly not sufficient by themselves." },
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understandArohana", label: "I understand Arohana." },
    { key: "understandAvarohana", label: "I understand Avarohana." },
    { key: "followAscending", label: "I can follow the ascending sequence." },
    { key: "followDescending", label: "I can follow the descending sequence." },
    { key: "singBothSlowly", label: "I can sing both sequences slowly." },
    { key: "understandRagaVariation", label: "I understand that different ragas can have different swara sequences." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= SA_MAX;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c27 = (ClassActivity.get("L2C27").answers.setup || {}).note;
    if (ok(c27)) return c27;
    const sa = (ClassActivity.get("L2C26").answers.setup || {}).note;
    if (ok(sa)) return sa;
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
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 20) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function ladderHtml(sequence, activeIndex = -1) {
    return `<div class="flex flex-wrap items-end justify-center gap-2 my-5">
      ${sequence.map((s, i) => `
        <div class="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-colors ${activeIndex === i ? "border-gold-400/50 bg-gold-500/15" : "border-white/10 bg-white/[0.02]"}">
          <span class="font-display text-lg ${activeIndex === i ? "text-gold-300" : "text-ink-100"}">${s.label}</span>
        </div>`).join("")}
    </div>`;
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

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 5 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Up and back down.</p>
        <p class="text-sm text-ink-300">Arohana rises from Sa to Sa˙; avarohana returns from Sa˙ back to Sa.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 6 — Basic Swara Patterns</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson combines a few swaras at a time into short practice patterns, instead of always singing the full scale.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Arohana and avarohana are simply names for ascending and descending through the swaras.</h3>
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

        ${chapter("recap", 1, "Section 1 — Recap Sapta Swaras", `
          ${narrow(p("Class 4 introduced the seven swaras, in order: Sa — Ri — Ga — Ma — Pa — Dha — Ni — Sa. A quick listen to recall their names and order, before learning what moving through them upward or downward is called."))}
          ${ladderHtml(AROHANA)}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-dir="up" class="vr-btn">${icon("play", "w-4 h-4")} Quick listen</button>
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("arohana", 2, "Section 2 — What is Arohana?", `
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Arohana = Ascending movement of swaras.</p>
            <p class="font-display text-base text-ink-200 mb-3">Sa → Ri → Ga → Ma → Pa → Dha → Ni → Sa˙</p>
            ${p("The sequence moves from a lower Sa towards the higher Sa.")}
          `)}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("aa-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-1">Your Sa (a visual aid only, chosen in Class 3): <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div data-arohana-ladder-host>${ladderHtml(AROHANA)}</div>
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-dir="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play arohana (up)</button>
          </div>
          ${narrow(`
            <ol class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed">
              ${["Listen to the complete sequence.", "Follow each swara visually as it plays.", "Repeat the names.", "Hum the sequence slowly.", "Repeat at a comfortable pace."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${recCard("aroTake", "Singing arohana (ascending)", "Entirely optional.", 20)}
        `, { wide: true })}

        ${chapter("avarohana", 3, "Section 3 — What is Avarohana?", `
          ${narrow(`
            <p class="font-display text-lg text-ink-50 mb-2">Avarohana = Descending movement of swaras.</p>
            <p class="font-display text-base text-ink-200 mb-3">Sa˙ → Ni → Dha → Pa → Ma → Ga → Ri → Sa</p>
            ${p("The sequence starts at the higher Sa and moves down to the lower Sa.")}
          `)}
          <div data-avarohana-ladder-host>${ladderHtml(AVAROHANA)}</div>
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-dir="down" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play avarohana (down)</button>
          </div>
          ${narrow(`
            <ol class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed">
              ${["Listen to the complete sequence.", "Follow each swara visually as it plays.", "Repeat the names.", "Hum the sequence slowly.", "Repeat at a comfortable pace."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
          `)}
          ${recCard("avaTake", "Singing avarohana (descending)", "Entirely optional.", 20)}
        `)}

        ${chapter("compare", 4, "Section 4 — Understand the movement", `
          ${narrow(`
            <table class="w-full text-sm text-ink-300 mb-4"><tbody>
              <tr class="border-b border-white/5"><td class="py-2"></td><td class="py-2 font-display text-ink-50">Arohana</td><td class="py-2 font-display text-ink-50">Avarohana</td></tr>
              <tr class="border-b border-white/5"><td class="py-2 text-ink-500">Direction</td><td class="py-2">Ascending</td><td class="py-2">Descending</td></tr>
              <tr class="border-b border-white/5"><td class="py-2 text-ink-500">Movement</td><td class="py-2">Moves upward</td><td class="py-2">Moves downward</td></tr>
              <tr><td class="py-2 text-ink-500">Sequence</td><td class="py-2">Sa Ri Ga Ma Pa Dha Ni Sa˙</td><td class="py-2">Sa˙ Ni Dha Pa Ma Ga Ri Sa</td></tr>
            </tbody></table>
            <div class="flex items-center justify-center gap-6 text-ink-300 text-sm mb-4">
              <span class="flex items-center gap-1">${icon("arrowRight", "w-4 h-4 -rotate-90")} Arohana</span>
              <span class="flex items-center gap-1">${icon("arrowRight", "w-4 h-4 rotate-90")} Avarohana</span>
            </div>
            ${p("Important: the swaras are not equally spaced in frequency — this isn't a simple equal-step staircase. Look back at the ladders in Sections 2 and 3: the gaps between swaras already vary.")}
          `)}
        `)}

        ${chapter("practice", 5, "Section 5 — Guided practice", `
          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise A — Arohana practice</p>`)}
          ${narrow(`
            <ol class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mb-2">
              <li class="flex gap-2"><span class="text-gold-400">1.</span>Listen to the reference.</li>
              <li class="flex gap-2"><span class="text-gold-400">2.</span>Sing Sa Ri Ga Ma slowly.</li>
              <li class="flex gap-2"><span class="text-gold-400">3.</span>Continue Pa Dha Ni Sa˙.</li>
              <li class="flex gap-2"><span class="text-gold-400">4.</span>Repeat the complete sequence.</li>
            </ol>
          `)}
          <div class="flex flex-wrap gap-3 mb-6">
            <button type="button" data-play-part="aroFirst" class="vr-btn">${icon("play", "w-4 h-4")} Sa Ri Ga Ma</button>
            <button type="button" data-play-part="aroSecond" class="vr-btn">${icon("play", "w-4 h-4")} Ma Pa Dha Ni Sa˙</button>
            <button type="button" data-play-dir="up" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Complete sequence</button>
          </div>

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise B — Avarohana practice</p>`)}
          ${narrow(`
            <ol class="flex flex-col gap-1.5 text-sm text-ink-300 leading-relaxed mb-2">
              <li class="flex gap-2"><span class="text-gold-400">1.</span>Listen to the descending sequence.</li>
              <li class="flex gap-2"><span class="text-gold-400">2.</span>Sing Sa˙ Ni Dha Pa slowly.</li>
              <li class="flex gap-2"><span class="text-gold-400">3.</span>Continue Ma Ga Ri Sa.</li>
              <li class="flex gap-2"><span class="text-gold-400">4.</span>Repeat the complete sequence.</li>
            </ol>
          `)}
          <div class="flex flex-wrap gap-3 mb-6">
            <button type="button" data-play-part="avaFirst" class="vr-btn">${icon("play", "w-4 h-4")} Sa˙ Ni Dha Pa</button>
            <button type="button" data-play-part="avaSecond" class="vr-btn">${icon("play", "w-4 h-4")} Pa Ma Ga Ri Sa</button>
            <button type="button" data-play-dir="down" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Complete sequence</button>
          </div>

          ${narrow(`<p class="font-display text-lg text-ink-50 mb-2">Exercise C — Connect both directions</p>${p("Practise arohana immediately followed by avarohana. Take a short break between repetitions.")}`)}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-both class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Arohana then avarohana</button>
          </div>
          ${recCard("combinedTake", "Arohana followed by avarohana, if comfortable", "Entirely optional.", 25)}
        `)}

        ${chapter("raga", 6, "Section 6 — Introduction to raga structures", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
              ${["A raga has characteristic musical rules and identity.", "Arohana and avarohana describe its ascending and descending swara movements.", "Not every raga uses all seven swaras in both directions.", "Some ragas have different ascending and descending note sequences.", "The order and treatment of swaras matter."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
            <p class="text-xs text-ink-500">This class doesn't teach detailed raga theory, and the basic seven-note sequence you practised above is not itself a specific raga.</p>
          `)}
        `)}

        ${chapter("quiz", 7, "Knowledge check", `
          ${narrow(p("A quick concept check — not a vocal-performance score."))}
          ${knowledgeCheckHtml(rec)}
        `)}

        ${chapter("reflect", 8, "Self-assessment and reflection", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-6">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="aa-reflection">Which direction was easier for you to sing — ascending or descending? What did you find difficult?</label><textarea id="aa-reflection" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-aa", { placeholder: "e.g. Whether ascending or descending felt easier... How the combined attempt went... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Vocal safety", `
          ${narrow(`
            ${p("Use a comfortable Sa. Don't force the higher Sa, and don't push the voice while descending. Relaxed humming and short sessions are enough.")}
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

    /* ---- Section 2/3: piano (visual aid) + directional playback with synchronized highlighting ---- */
    own(VirtualPiano.wire(container, "aa-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi <= SA_MAX) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayDir(e) {
      const btn = e.target.closest("[data-play-dir]");
      if (!btn) return;
      const b = base();
      const dir = btn.dataset.playDir;
      const seq = dir === "up" ? AROHANA : AVAROHANA;
      const host = dir === "up" ? $("[data-arohana-ladder-host]") : $("[data-avarohana-ladder-host]");
      PianoSynth.playSequence(seq.map((s) => b + s.semitone), {
        duration: 0.6, gap: 0.12,
        onNote: (i) => { if (host) host.innerHTML = ladderHtml(seq, i); },
      });
    }
    container.addEventListener("click", onPlayDir);
    cleanups.push(() => container.removeEventListener("click", onPlayDir));

    /* ---- Section 5: half-sequence playback + connected both-directions ---- */
    const PARTS = { aroFirst: AROHANA_FIRST_HALF, aroSecond: AROHANA_SECOND_HALF, avaFirst: AVAROHANA_FIRST_HALF, avaSecond: AVAROHANA_SECOND_HALF };
    function onPlayPart(e) {
      const btn = e.target.closest("[data-play-part]");
      if (!btn) return;
      const seq = PARTS[btn.dataset.playPart];
      PianoSynth.playSequence(seq.map((s) => base() + s.semitone), { duration: 0.6, gap: 0.12 });
    }
    function onPlayBoth(e) {
      if (!e.target.closest("[data-play-both]")) return;
      const b = base();
      PianoSynth.playSequence([...AROHANA, ...AVAROHANA].map((s) => b + s.semitone), { duration: 0.55, gap: 0.1 });
    }
    container.addEventListener("click", onPlayPart);
    container.addEventListener("click", onPlayBoth);
    cleanups.push(() => container.removeEventListener("click", onPlayPart));
    cleanups.push(() => container.removeEventListener("click", onPlayBoth));

    /* ---- recordings ---- */
    const NAMES = { aroTake: "Singing arohana", avaTake: "Singing avarohana", combinedTake: "Arohana then avarohana" };
    const MAX_SECONDS = { aroTake: 20, avaTake: 20, combinedTake: 25 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 5 — ${NAMES[k]}`, exercise: `arohana-and-avarohana-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); },
      }));
    });

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
    own(PersonalNotes.wire(container, "notes-aa", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 2, Class ${cls.number} — ${cls.title}`,
        learned: "Arohana is the ascending swara sequence and avarohana is the descending one — a raga has its own characteristic structure that this basic seven-swara sequence doesn't represent.",
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
