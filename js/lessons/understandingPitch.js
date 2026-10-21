/* ============================================================
   CLASS 3 — UNDERSTANDING PITCH (interactive lesson)

   Rendered by ClassDetailPage when a class has
   interactive: "understanding-pitch" (see js/data.js). Other
   classes keep the standard layout.

   Flow: UNDERSTAND → LISTEN → PLAY → IDENTIFY → SING → REFLECT → COMPLETE
   Built from reusable parts: VirtualPiano, PitchExercise
   (Higher/Lower, Same/Different, Find the Note), VocalRecording,
   PersonalNotes, ClassProgress. Per-user progress lives in
   ClassActivity (local + Supabase class_progress / class_notes).
   ============================================================ */

const UnderstandingPitchLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "play", label: "Play" },
    { id: "identify", label: "Identify" },
    { id: "sing", label: "Sing" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Read the lesson (sections 1–5)" },
    { key: "pianoUsed", label: "Played three notes on the piano" },
    { key: "highLow", label: "Higher or Lower — one round" },
    { key: "sameDifferent", label: "Same or Different — one round" },
    { key: "noteId", label: "Find the Note — one round" },
    { key: "recording", label: "Sang and recorded a note" },
    { key: "notesAdded", label: "Wrote in My Notes" },
    { key: "assignment", label: "Completed the assignment" },
  ];

  // Assignment item index -> evidence that ticks it automatically (others are ticked by the learner)
  const AUTO_ASSIGNMENT = { 0: "pianoUsed", 2: "highLow", 3: "sameDifferent", 4: "noteId", 8: "recording", 9: "reflectionWritten" };

  const SING_NOTES = [48, 50, 52, 53, 55, 57, 60, 62, 64, 65, 67, 69]; // C3–A4, white keys
  const LEARN_RANGE = { from: 60, to: 72 };                             // C4–C5

  // Demo sequences for sections 2–5 (velocity used by the loudness demo; 60.35 = C4 slightly sharp)
  const DEMOS = {
    low: { notes: [48], duration: 1.4 },
    high: { notes: [72], duration: 1.4 },
    up: { notes: [60, 62, 64, 65, 67], duration: 0.55, gap: 0.08, stairs: true },
    down: { notes: [67, 65, 64, 62, 60], duration: 0.55, gap: 0.08, stairs: true },
    jump: { notes: [48, 72], duration: 1.0, gap: 0.2 },
    loudness: { notes: [{ midi: 64, velocity: 0.12 }, { midi: 64, velocity: 1 }], duration: 1.1, gap: 0.3 },
    pitch: { notes: [{ midi: 55, velocity: 0.6 }, { midi: 67, velocity: 0.6 }], duration: 1.1, gap: 0.3 },
    inTune: { notes: [60, 60], duration: 1.2, gap: 0.2 },
    offPitch: { notes: [60, 60.4], duration: 1.2, gap: 0.2 },
  };

  /* ---------- small view helpers ---------- */

  /** A lesson step. Text stays in a readable 3xl column; wide steps (the pianos) let their interactive part use the full width. */
  function chapter(stage, step, title, body, { id = "", wide = false } = {}) {
    return `
    <section ${id ? `id="${id}"` : ""} data-stage="${stage}" class="lesson-chapter w-full ${wide ? "" : "max-w-3xl"} mx-auto scroll-mt-32">
      <div class="max-w-3xl mx-auto">
        <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-2">${STAGES.find((s) => s.id === stage).label} · Step ${step}</p>
        <h2 class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">${title}</h2>
      </div>
      ${body}
    </section>`;
  }

  const p = (html) => `<p class="text-ink-300 leading-relaxed mb-4">${html}</p>`;
  const narrow = (html) => `<div class="max-w-3xl mx-auto">${html}</div>`;
  const demoBtn = (key, label) => `<button type="button" data-demo="${key}" class="ex-chip">${icon("play", "w-3.5 h-3.5")} ${label}</button>`;
  const tryIt = (html) => `
    <div class="rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4 my-5 text-sm text-ink-300 leading-relaxed">
      <span class="text-gold-300 font-medium">Try it · </span>${html}
    </div>`;

  function waveSvg(cycles, label, cls) {
    const w = 260, h = 70, pts = [];
    for (let x = 0; x <= w; x += 2) pts.push(`${x},${(h / 2 - Math.sin((x / w) * cycles * Math.PI * 2) * 24).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-16 ${cls}" aria-label="${label}" role="img"><polyline points="${pts.join(" ")}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="wave-line"/></svg>`;
  }

  function stairs() {
    return `<div class="flex items-end gap-2 h-28 my-5" data-stairs aria-hidden="true">
      ${[60, 62, 64, 65, 67].map((m, i) => `<div class="stair flex-1 rounded-t-lg flex items-end justify-center pb-1.5 text-[11px] text-ink-500" data-stair="${m}" style="height:${30 + i * 17}%">${NoteUtils.name(m)}</div>`).join("")}
    </div>`;
  }

  function noteStrip() {
    const letters = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E"];
    return `<div class="overflow-x-auto my-5"><div class="flex gap-1.5 min-w-max">
      ${letters.map((l, i) => {
        const octave = i < 7 ? 4 : 5;
        return `<div class="w-11 rounded-lg border ${l === "C" ? "border-gold-400/40 bg-gold-500/10 text-gold-300" : "border-white/10 bg-white/[0.03] text-ink-200"} text-center py-2">
          <div class="font-display text-lg">${l}</div><div class="text-[10px] text-ink-500">${l}${octave}</div></div>`;
      }).join("")}
    </div></div>`;
  }

  /** Pitch-over-time view for Learn With Piano: y = pitch (C4 bottom … C5 top), x = order played. */
  function pitchViewSvg(history) {
    const W = 600, H = 330, L = 46, R = 18, T = 18, B = 18;
    const y = (m) => T + ((LEARN_RANGE.to - m) / (LEARN_RANGE.to - LEARN_RANGE.from)) * (H - T - B);
    const grid = [60, 62, 64, 65, 67, 69, 71, 72].map((m) => `
      <line x1="${L}" x2="${W - R}" y1="${y(m)}" y2="${y(m)}" class="pv-grid"/>
      <text x="${L - 10}" y="${y(m) + 4}" text-anchor="end" class="pv-label">${NoteUtils.name(m)}</text>`).join("");
    const pts = history.slice(-12);
    const step = (W - L - R - 20) / 11;
    const xy = pts.map((m, i) => [L + 10 + i * step, y(m)]);
    const path = xy.length > 1 ? `<polyline points="${xy.map(([a, b]) => `${a},${b}`).join(" ")}" class="pv-path"/>` : "";
    const dots = xy.map(([a, b], i) => i === xy.length - 1
      ? `<circle cx="${a}" cy="${b}" r="9" class="pv-dot-glow"/><circle cx="${a}" cy="${b}" r="5.5" class="pv-dot"/>`
      : `<circle cx="${a}" cy="${b}" r="3.5" class="pv-dot-old"/>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Pitch over time">
      <text x="${W - R}" y="${T - 4}" text-anchor="end" class="pv-axis">↑ higher</text>
      <text x="${W - R}" y="${H - 2}" text-anchor="end" class="pv-axis">↓ lower</text>
      ${grid}${path}${dots}</svg>`;
  }

  function movementText(prev, cur) {
    const name = NoteUtils.name(cur);
    if (prev === null) return { arrow: "♪", cls: "text-gold-300", text: `Your first note: ${name}. Now play another — will it be higher or lower?` };
    const pn = NoteUtils.name(prev);
    if (cur > prev) return { arrow: "↑", cls: "text-emerald-300", text: `Higher than ${pn} — the pitch went up.` };
    if (cur < prev) return { arrow: "↓", cls: "text-sky-300", text: `Lower than ${pn} — the pitch went down.` };
    return { arrow: "=", cls: "text-ink-200", text: `Same note as before — the pitch stayed still.` };
  }

  /* ---------- derived state ---------- */

  function reflectionWritten(rec) {
    return Object.values(rec.answers.reflection || {}).some((v) => v && v.trim());
  }

  function assignmentItemDone(rec, i) {
    const auto = AUTO_ASSIGNMENT[i];
    if (auto === "reflectionWritten") return reflectionWritten(rec);
    if (auto) return !!rec.checkpoints[auto];
    return !!(rec.answers.assignment || {})[i];
  }

  /* ---------- live sections (re-rendered when progress changes) ---------- */

  function renderAssignment(cls, rec) {
    const items = cls.content.assignment.instructions;
    const done = items.filter((_, i) => assignmentItemDone(rec, i)).length;
    return `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="font-display text-xl text-ink-50">Class 3 Assignment</h3>
          <span class="text-xs text-ink-500 tabular-nums">${done}/${items.length} done</span>
        </div>
        <ol class="flex flex-col gap-1">
          ${items.map((text, i) => {
            const auto = AUTO_ASSIGNMENT[i];
            const ok = assignmentItemDone(rec, i);
            return `<li>
              <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 ${auto ? "" : "cursor-pointer hover:bg-white/[0.03]"}">
                <input type="checkbox" data-assignment="${i}" ${ok ? "checked" : ""} ${auto ? "disabled" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                <span class="text-sm ${ok ? "text-ink-400 line-through decoration-ink-600" : "text-ink-200"}"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${text}</span>
                ${auto ? `<span class="ml-auto text-[10px] uppercase tracking-wider text-ink-600 shrink-0 mt-0.5">${ok ? "done" : "auto"}</span>` : ""}
              </label></li>`;
          }).join("")}
        </ol>
        <p class="text-xs text-ink-500 mt-4">Items marked “auto” tick themselves when you finish that part of the lesson.</p>
      </div>`;
  }

  function renderComplete(cls, rec, status) {
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const next = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number))
      .find((c, i, arr) => arr[i - 1] && arr[i - 1].id === cls.id);
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <div class="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center mx-auto mb-3">${icon("check", "w-6 h-6")}</div>
          <h3 class="font-display text-2xl text-ink-50 mb-1">Class 3 complete</h3>
          <p class="text-sm text-ink-400 mb-5">You can come back any time to replay the exercises — your scores keep growing.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share this class</a>
            ${next ? `<a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Next: ${next.title} ${icon("arrowRight", "w-3.5 h-3.5")}</a>` : ""}
          </div>
        </div>`;
    }
    const missing = PROGRESS_ITEMS.filter((i) => !rec.checkpoints[i.key]);
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 text-center">
        <h3 class="font-display text-2xl text-ink-50 mb-2">${all ? "You're ready." : "Almost there"}</h3>
        <p class="text-sm text-ink-400 mb-5 max-w-md mx-auto">${all
          ? "You've listened, played, identified, sung and reflected. Mark Class 3 complete to unlock the next class."
          : `Still to do: ${missing.map((m) => m.label.toLowerCase()).join(" · ")}.`}</p>
        <button type="button" data-complete-class ${all ? "" : "disabled"}
          class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors ${all ? "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-glow" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
          Complete Class 3 ${icon("check", "w-4 h-4")}
        </button>
      </div>`;
  }

  /* ---------- page ---------- */

  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const reflection = rec.answers.reflection || {};

    return `
    <div class="pitch-lesson">
      <!-- header -->
      <section class="max-w-3xl box-content mx-auto px-5 lg:px-8 pt-10 sm:pt-14">
        <a href="#/classes" class="text-xs text-ink-500 hover:text-ink-300 inline-flex items-center gap-1.5 mb-6">${icon("arrowRight", "w-3 h-3 rotate-180")} All Classes</a>
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs text-ink-500 tracking-widest">LEVEL 1 · CLASS 03</span>
          ${statusBadge(status)}
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 tracking-wide uppercase">Interactive</span>
        </div>
        <h1 class="font-display text-4xl sm:text-5xl text-ink-50 mb-3">${cls.title}</h1>
        <p class="font-display italic text-lg sm:text-xl text-ink-300 max-w-2xl">“${cls.subtitle}”</p>
        <div class="flex items-center gap-3 text-xs text-ink-500 mt-4">
          <span>${cls.category}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span>${cls.difficulty}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span>~${cls.estMinutes} min</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span data-lesson-pct>${pct}% complete</span>
        </div>
      </section>

      <!-- stage tracker -->
      <nav class="lesson-stepper sticky top-16 z-30 mt-8 border-y border-white/5 bg-ink-950/85 backdrop-blur-xl" aria-label="Lesson stages">
        <div class="max-w-5xl mx-auto px-5 lg:px-8 flex items-center gap-1 overflow-x-auto py-2.5">
          ${STAGES.map((s, i) => `
            <a href="#/classes/${cls.id}" data-stage-link="${s.id}" class="stage-pill">${i + 1} · ${s.label}</a>
            ${i < STAGES.length - 1 ? `<span class="text-ink-700 text-xs">›</span>` : ""}`).join("")}
        </div>
      </nav>

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Welcome — and what is sound?", `
          ${p("In this class you'll learn what <strong class=\"text-ink-100\">pitch</strong> is, hear the difference between high and low, play your first notes on a piano, train your ears with three small listening games, and finally sing one note yourself. No music theory needed — we start from zero.")}
          <h3 class="font-display text-lg text-ink-100 mt-8 mb-3">What is sound?</h3>
          ${p("Every sound you hear is something <strong class=\"text-ink-100\">shaking</strong> — musicians call it <em>vibrating</em>. Pluck a guitar string and it wobbles back and forth very fast. That wobble pushes the air, the air carries it to your ear, and your brain hears it as sound.")}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 my-5 text-gold-300/80">
            ${waveSvg(4, "A sound wave", "")}
            <div class="flex justify-between text-[11px] text-ink-500 mt-2"><span>something vibrates</span><span>the air carries it</span><span>your ear hears it</span></div>
          </div>
          ${p("Your voice works the same way. Inside your throat are two small, soft folds — your <strong class=\"text-ink-100\">vocal folds</strong>. When you speak or sing, air from your lungs makes them vibrate, and that vibration becomes your voice.")}
          ${tryIt("Rest your fingertips lightly on the front of your throat and hum “mmm”. Feel the gentle buzz? That's vibration — that's sound being made.")}
        `)}

        ${chapter("understand", 2, "What is pitch?", `
          ${p("<strong class=\"text-ink-100\">Pitch is how high or low a sound is.</strong> It depends on how <em>fast</em> something vibrates:")}
          <div class="grid sm:grid-cols-2 gap-4 my-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-sky-300 mb-1">Slow vibration → low pitch</p>
              <div class="text-sky-300/70">${waveSvg(2, "Slow wave: low pitch", "")}</div>
              <p class="text-sm text-ink-400 mt-2 mb-3">A big drum, thunder, a deep voice.</p>
              ${demoBtn("low", "Hear a low note")}
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <p class="text-xs uppercase tracking-wider text-emerald-300 mb-1">Fast vibration → high pitch</p>
              <div class="text-emerald-300/70">${waveSvg(8, "Fast wave: high pitch", "")}</div>
              <p class="text-sm text-ink-400 mt-2 mb-3">A bird chirping, a whistle, a small bell.</p>
              ${demoBtn("high", "Hear a high note")}
            </div>
          </div>
          ${p("How fast is “fast”? The note called middle C vibrates about 262 times every second. You never need to count — your ears do it for you, instantly.")}
        `)}

        ${chapter("listen", 3, "High vs low", `
          ${p("<strong class=\"text-ink-100\">“High” and “low” are simply the words musicians use for fast and slow vibrations.</strong> Picture a staircase: every step up is a higher note, every step down is a lower note.")}
          ${stairs()}
          <div class="flex flex-wrap gap-2 mb-4">${demoBtn("up", "Walk up the stairs")}${demoBtn("down", "Walk down the stairs")}${demoBtn("jump", "Big jump: low → high")}</div>
          ${p("Did you notice your body wanting to lift a little as the notes climbed? Many people feel high notes “up” in the head and low notes “down” in the chest. That's normal — and useful.")}
        `)}

        ${chapter("listen", 4, "Pitch is not loudness", `
          ${p("This is the most common beginner mix-up: <strong class=\"text-ink-100\">high does not mean loud, and low does not mean quiet.</strong> They are two completely different things.")}
          <div class="grid sm:grid-cols-2 gap-4 my-5">
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <h4 class="font-display text-lg text-ink-50 mb-1">Loudness</h4>
              <p class="text-sm text-ink-400 mb-4">How <em>strong</em> a sound is — like turning a volume knob. The note stays the same.</p>
              ${demoBtn("loudness", "Same note: quiet → loud")}
            </div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <h4 class="font-display text-lg text-ink-50 mb-1">Pitch</h4>
              <p class="text-sm text-ink-400 mb-4">How <em>high or low</em> a sound is — like choosing a different piano key.</p>
              ${demoBtn("pitch", "Same loudness: low → high")}
            </div>
          </div>
          ${p("A whisper can be high. A shout can be low. When we talk about pitch, we only ever mean high and low.")}
        `)}

        ${chapter("listen", 5, "Why singers need pitch awareness", `
          ${p("When you sing a song, every word sits on a note. If your voice lands right on that note, it sounds <strong class=\"text-ink-100\">in tune</strong>. If it lands a little too high or too low, it sounds <strong class=\"text-ink-100\">off</strong> — and even people who know nothing about music notice.")}
          <div class="flex flex-wrap gap-2 my-5">${demoBtn("inTune", "Hear: in tune")}${demoBtn("offPitch", "Hear: slightly off")}</div>
          ${p("Could you hear that the second version sounded a little “sour”? That tiny difference is what singers train for.")}
          <h3 class="font-display text-lg text-ink-100 mt-8 mb-3">Why train your ears?</h3>
          ${p("<strong class=\"text-ink-100\">You can only fix what you can hear.</strong> Singers who seem “naturally” in tune are mostly very good listeners. Listening is a skill, and like a muscle it grows with practice — that's what the games in this class are for.")}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("play", 6, "Meet the notes — and the piano", `
          <div class="max-w-3xl mx-auto">
            <h3 class="font-display text-lg text-ink-100 mb-3">What is a musical note?</h3>
            ${p("A <strong class=\"text-ink-100\">note</strong> is one particular pitch that has a name. Music uses only seven letter names — <strong class=\"text-ink-100\">C D E F G A B</strong> — and then they repeat, higher and higher:")}
            ${noteStrip()}
            <h3 class="font-display text-lg text-ink-100 mt-6 mb-3">What does “C4” mean?</h3>
            ${p("The <strong class=\"text-ink-100\">letter</strong> is the note's name. The <strong class=\"text-ink-100\">number</strong> says which group of keys it's in (each group of seven is called an <em>octave</em>). <strong class=\"text-gold-300\">C4</strong> sits near the middle of a piano, so it's nicknamed <em>middle C</em>. C5 is the next C up (higher); C3 is the next C down (lower). D4, E4, F4… are the notes just above C4.")}
            ${p("<span class=\"text-ink-500\">The black keys are the notes in between, named with a # (“sharp”), like C#4. You don't need them yet.</span>")}
          </div>
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-7 mt-6 shadow-2xl piano-stage">
            ${VirtualPiano.render("pitch-piano", { controls: true, keyboard: true })}
          </div>
          ${narrow(`${tryIt(`1) Find <strong class="text-ink-100">C4</strong> and play it. &nbsp;2) Play <strong class="text-ink-100">C5</strong> — the same letter, just higher. Notice how alike they sound. &nbsp;3) Play any <strong class="text-ink-100">three notes</strong> that feel comfortable to hum.`)}
          <p class="text-sm text-ink-400" data-piano-played aria-live="polite"></p>`)}
        `, { wide: true })}

        ${chapter("play", 7, "Learn With Piano", `
          ${narrow(p("Play notes one at a time and watch the dot. It <strong class=\"text-emerald-300\">climbs</strong> when the pitch goes up and <strong class=\"text-sky-300\">drops</strong> when it goes down. The line shows the path your notes took — and a path of notes moving over time is exactly what a <em>melody</em> is."))}
          <div class="grid lg:grid-cols-[1fr,1.2fr] gap-5 items-stretch mt-6">
            <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
              <p class="text-[11px] uppercase tracking-[0.2em] text-ink-500 mb-1">You played</p>
              <div class="flex items-center gap-4 mb-3">
                <span class="font-display text-5xl text-ink-50" data-learn-note>—</span>
                <span class="font-display text-4xl" data-learn-arrow></span>
              </div>
              <p class="text-sm text-ink-400 min-h-[2.5rem]" data-learn-text>Play any key below to begin.</p>
              <div class="mt-auto pt-4">${VirtualPiano.render("learn-piano", { controls: false, keyboard: false, display: false })}</div>
            </div>
            <div class="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 flex flex-col">
              <div data-learn-view class="flex-1 flex items-center">${pitchViewSvg([])}</div>
              <div class="flex justify-between items-center mt-2">
                <p class="text-xs text-ink-500">Each dot is a note you played, left to right.</p>
                <button type="button" data-learn-clear class="text-xs text-ink-400 underline hover:text-ink-200">Clear</button>
              </div>
            </div>
          </div>
        `, { wide: true })}

        ${chapter("identify", 8, "Exercise 1 — Higher or Lower", `
          ${p("You've heard notes go up and down. Now it's your turn to tell which way they moved — no names, no theory, just your ears.")}
          ${PitchExercise.render("ex-high-low", HigherLowerExercise.config())}
        `)}

        ${chapter("identify", 9, "Exercise 2 — Same or Different", `
          ${p("Before you can match a note with your voice, you need to hear whether two notes are the same. That's this game.")}
          ${PitchExercise.render("ex-same-diff", SameDifferentExercise.config())}
        `)}

        ${chapter("identify", 10, "Exercise 3 — Find the Note", `
          ${p("Last listening game: put a name to a note. We'll keep it small — just four neighbouring notes.")}
          ${PitchExercise.render("ex-find-note", NoteIdentificationExercise.config())}
        `)}

        ${chapter("sing", 11, "Sing the Note", `
          ${p("<strong class=\"text-ink-100\">The piano gives you the reference. Your job is to reproduce the same pitch with your voice.</strong> Choose a note, listen to it, then sing it back and record yourself. Afterwards, compare the two by ear.")}
          ${VocalRecording.render("sing-note", { notes: SING_NOTES })}
        `)}

        ${chapter("reflect", 12, "My Notes", `
          ${p("Your private notebook for this class — anything you noticed about your ears or voice. Only you can see it.")}
          ${PersonalNotes.render("pitch-notes", { placeholder: "e.g. C4 felt comfortable. E4 felt slightly high. I had difficulty identifying D4." })}
        `)}

        ${chapter("reflect", 13, "Reflection", `
          ${p("A few honest sentences are plenty. These are saved as you type.")}
          <div class="flex flex-col gap-4">
            ${cls.content.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="reflection-${i}">${q}</label>
                <textarea id="reflection-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(reflection[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("complete", 14, "Assignment", `<div data-lesson-assignment>${renderAssignment(cls, rec)}</div>`)}

        ${chapter("complete", 15, "Your progress", `<div data-lesson-progress>${ClassProgress.render("Class 3 Progress", PROGRESS_ITEMS, rec.checkpoints)}</div>`)}

        ${chapter("complete", 16, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
      </div>
    </div>`;
  }

  function mount(container, cls, params) {
    const cleanups = [];
    const classId = cls.id;
    const $ = (s) => container.querySelector(s);
    let demo = null;

    function refreshLive(rec = ClassActivity.get(classId)) {
      const status = Store.classStatus(cls);
      $("[data-lesson-assignment]").innerHTML = renderAssignment(cls, rec);
      $("[data-lesson-progress]").innerHTML = ClassProgress.render("Class 3 Progress", PROGRESS_ITEMS, rec.checkpoints);
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, status);
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
    }

    function syncAssignmentCheckpoint(rec) {
      const all = cls.content.assignment.instructions.every((_, i) => assignmentItemDone(rec, i));
      if (!!rec.checkpoints.assignment !== all) ClassActivity.markCheckpoint(classId, "assignment", all);
    }

    cleanups.push(ClassActivity.onChange((id, rec) => {
      if (id !== classId || !container.isConnected) return;
      syncAssignmentCheckpoint(rec);
      refreshLive(ClassActivity.get(classId));
    }));
    ClassActivity.load(classId); // pulls this account's saved progress, then onChange refreshes the view

    /* ---- Demos (sections 2–5) ---- */
    function onDemo(e) {
      const btn = e.target.closest("[data-demo]");
      if (!btn) return;
      const d = DEMOS[btn.dataset.demo];
      if (demo) demo.cancel();
      container.querySelectorAll("[data-demo].is-playing").forEach((b) => b.classList.remove("is-playing"));
      btn.classList.add("is-playing");
      const stairEls = d.stairs ? [...container.querySelectorAll("[data-stair]")] : [];
      demo = PianoSynth.playSequence(d.notes, {
        duration: d.duration, gap: d.gap || 0.25,
        onNote: (_, midi) => stairEls.forEach((s) => s.classList.toggle("is-lit", Number(s.dataset.stair) === midi)),
      });
      demo.then(() => btn.classList.remove("is-playing"));
    }
    container.addEventListener("click", onDemo);
    cleanups.push(() => { container.removeEventListener("click", onDemo); if (demo) demo.cancel(); });

    /* ---- Main piano: "played three notes" checkpoint ---- */
    const played = new Set();
    const playedEl = $("[data-piano-played]");
    const piano = VirtualPiano.wire(container, "pitch-piano", {
      startOctave: 3, octaves: 2, keyboard: true,
      onNote: ({ name }) => {
        played.add(name);
        if (playedEl) {
          const list = [...played].slice(-6).join(" · ");
          playedEl.innerHTML = played.size >= 3
            ? `<span class="text-emerald-300">${icon("check", "w-4 h-4 inline-flex align-[-3px]")} Nice — you've played ${played.size} different notes.</span> <span class="text-ink-500">${list}</span>`
            : `Notes played: <span class="text-ink-200">${list}</span> <span class="text-ink-500">(${3 - played.size} more to go)</span>`;
        }
        if (played.size >= 3) ClassActivity.markCheckpoint(classId, "pianoUsed");
      },
    });
    cleanups.push(() => piano.destroy());

    /* ---- Learn With Piano ---- */
    const history = [];
    const learnNote = $("[data-learn-note]"), learnArrow = $("[data-learn-arrow]"), learnText = $("[data-learn-text]"), learnView = $("[data-learn-view]");
    const learnPiano = VirtualPiano.wire(container, "learn-piano", {
      range: LEARN_RANGE,
      onNote: ({ midi, name }) => {
        const prev = history.length ? history[history.length - 1] : null;
        history.push(midi);
        const mv = movementText(prev, midi);
        learnNote.textContent = name;
        learnArrow.textContent = mv.arrow;
        learnArrow.className = `font-display text-4xl ${mv.cls} learn-arrow-pop`;
        learnText.textContent = mv.text;
        learnView.innerHTML = pitchViewSvg(history);
      },
    });
    const onClear = (e) => {
      if (!e.target.closest("[data-learn-clear]")) return;
      history.length = 0;
      learnNote.textContent = "—"; learnArrow.textContent = ""; learnText.textContent = "Play any key below to begin.";
      learnView.innerHTML = pitchViewSvg([]);
    };
    container.addEventListener("click", onClear);
    cleanups.push(() => { learnPiano.destroy(); container.removeEventListener("click", onClear); });

    /* ---- Exercises ---- */
    [
      ["ex-high-low", "high-low", HigherLowerExercise, "highLow"],
      ["ex-same-diff", "same-different", SameDifferentExercise, "sameDifferent"],
      ["ex-find-note", "find-the-note", NoteIdentificationExercise, "noteId"],
    ].forEach(([domId, exerciseId, Ex, checkpoint]) => {
      const cfg = Ex.config();
      const ctl = PitchExercise.wire(container, domId, {
        classId, exerciseId, roundLength: 10,
        generate: Ex.generate, examples: cfg.examples, tools: cfg.tools,
        onRoundComplete: () => ClassActivity.markCheckpoint(classId, checkpoint),
      });
      cleanups.push(() => ctl.destroy());
    });

    /* ---- Sing the Note ---- */
    const rec0 = ClassActivity.get(classId);
    const uploads = Store.getClassProgress(classId).uploads.filter((u) => u.exercise === "sing-the-note");
    const sing = rec0.answers.singTheNote || {};
    const vocal = VocalRecording.wire(container, "sing-note", {
      classId,
      lastRecording: uploads[uploads.length - 1] || null,
      lastNote: sing.note ? NoteUtils.fromName(sing.note) : null,
      lastEvaluation: sing.evaluation,
      onRecorded: (u) => {
        ClassActivity.setAnswer(classId, "singTheNote", "note", u.referenceNote);
        ClassActivity.markCheckpoint(classId, "recording");
      },
      onEvaluate: (choice) => ClassActivity.setAnswer(classId, "singTheNote", "evaluation", choice),
      onSkip: () => {
        ClassActivity.setAnswer(classId, "singTheNote", "withoutRecording", true);
        ClassActivity.markCheckpoint(classId, "recording");
      },
    });
    cleanups.push(() => vocal.destroy());

    /* ---- My Notes ---- */
    const notes = PersonalNotes.wire(container, "pitch-notes", {
      classId,
      onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); },
    });
    cleanups.push(() => notes.destroy());

    /* ---- Reflection (autosave) ---- */
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      ta.addEventListener("input", Utils.debounce(() => {
        ClassActivity.setAnswer(classId, "reflection", ta.dataset.reflection, ta.value);
      }, 500));
    });

    /* ---- Assignment ticks + Complete ---- */
    function onCompleteArea(e) {
      const cb = e.target.closest("[data-assignment]");
      if (cb) {
        if (e.type === "change" && !cb.disabled) ClassActivity.setAnswer(classId, "assignment", cb.dataset.assignment, cb.checked);
        return;
      }
      const done = e.type === "click" && e.target.closest("[data-complete-class]");
      if (done && !done.disabled) {
        const rec = ClassActivity.get(classId);
        Store.completeClass(classId);
        ClassActivity.markCompleted(classId);
        const r = rec.answers.reflection || {};
        const qs = cls.content.assignment.questions;
        Store.addJournalEntry({
          classId,
          classTitle: `Class ${cls.number} — ${cls.title}`,
          learned: cls.content.whatYoullLearn,
          struggled: r[1] || "",
          thoughts: [0, 2, 3, 4].filter((i) => r[i] && r[i].trim()).map((i) => `${qs[i]} ${r[i].trim()}`).join(" "),
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

    /* ---- Lesson viewed: only once the learner reaches the end of sections 1–5 ---- */
    const sentinel = $("[data-lesson-viewed-sentinel]");
    if (sentinel && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { ClassActivity.markCheckpoint(classId, "lessonViewed"); io.disconnect(); }
      });
      io.observe(sentinel);
      cleanups.push(() => io.disconnect());
    }

    /* ---- Stage tracker ---- */
    const links = [...container.querySelectorAll("[data-stage-link]")];
    const onStageClick = (e) => {
      const a = e.target.closest("[data-stage-link]");
      if (!a) return;
      e.preventDefault(); // keep the hash route; just scroll
      const target = container.querySelector(`[data-stage="${a.dataset.stageLink}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    container.addEventListener("click", onStageClick);
    cleanups.push(() => container.removeEventListener("click", onStageClick));
    if ("IntersectionObserver" in window) {
      const visible = new Map();
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => visible.set(en.target, en.isIntersecting));
        const first = [...container.querySelectorAll("[data-stage]")].find((el) => visible.get(el));
        if (!first) return;
        const stage = first.dataset.stage;
        links.forEach((l) => l.classList.toggle("is-active", l.dataset.stageLink === stage));
        // On narrow screens keep the active stage visible in the scrollable tracker
        const active = links.find((l) => l.dataset.stageLink === stage);
        const bar = active && active.parentElement;
        if (bar && bar.scrollWidth > bar.clientWidth) {
          bar.scrollTo({ left: active.offsetLeft - bar.clientWidth / 2 + active.offsetWidth / 2, behavior: "smooth" });
        }
      }, { rootMargin: "-120px 0px -55% 0px" });
      container.querySelectorAll("[data-stage]").forEach((el) => so.observe(el));
      cleanups.push(() => so.disconnect());
    }

    return () => {
      cleanups.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
      PianoSynth.stopAll();
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();

/** Interactive lessons by key (APP_DATA class field `interactive`). */
const InteractiveLessons = {
  "understanding-pitch": UnderstandingPitchLesson,
};
