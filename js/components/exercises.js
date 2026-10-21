/* ============================================================
   EAR-TRAINING EXERCISES
   PitchExercise is the shared engine (listen -> answer ->
   feedback -> next, rounds, scoring). Each exercise is just a
   question generator plus wording on top of it:

     HigherLowerExercise       is the 2nd note higher or lower?
     SameDifferentExercise     are the two notes the same?
     NoteIdentificationExercise which note was it? (C4–F4)

   Scores are per user, per class, via ClassActivity
   (attempts / correct / accuracy are lifetime; rounds give a
   "first-try" accuracy). Future exercises (intervals, chords)
   plug in the same way.
   ============================================================ */

const ExerciseScore = {
  render(stats, { question, roundLength } = {}) {
    const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : null;
    const cell = (value, label) => `
      <div class="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 text-center">
        <div class="font-display text-lg text-ink-50 tabular-nums">${value}</div>
        <div class="text-[10px] uppercase tracking-wider text-ink-500">${label}</div>
      </div>`;
    return `
      <div class="grid grid-cols-3 gap-2">
        ${cell(stats.attempts, "Attempts")}
        ${cell(stats.correct, "Correct")}
        ${cell(accuracy === null ? "—" : accuracy + "%", "Accuracy")}
      </div>
      <p class="text-[11px] text-ink-500 mt-2 flex justify-between gap-2">
        <span>${question ? `Question ${question} of ${roundLength}` : ""}</span>
        <span>${stats.roundsCompleted ? `Rounds done: ${stats.roundsCompleted} · best ${stats.bestRoundAccuracy}% first try` : ""}</span>
      </p>`;
  },
};

const PitchExercise = (() => {
  function render(id, { eyebrow, title, intro, prompt, choices, examples = [], tools = [], noteSlots = 2 }) {
    return `
    <div class="exercise rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-7" data-exercise="${id}">
      <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-1.5">${eyebrow}</p>
      <h3 class="font-display text-xl sm:text-2xl text-ink-50 mb-2">${title}</h3>
      <p class="text-sm text-ink-400 leading-relaxed mb-5 max-w-2xl">${intro}</p>

      ${examples.length ? `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mb-5">
        <p class="text-xs text-ink-500 uppercase tracking-wide mb-3">First, listen to an example</p>
        <div class="flex flex-wrap gap-2">
          ${examples.map((ex, i) => `<button type="button" data-ex-example="${i}" class="ex-chip">${icon("play", "w-3.5 h-3.5")} ${ex.label}</button>`).join("")}
        </div>
        <p class="text-sm text-ink-300 mt-3 min-h-[1.25rem]" data-ex-example-text></p>
      </div>` : ""}

      <div class="flex flex-col items-center text-center gap-4 py-2">
        <div class="flex items-center gap-3" aria-hidden="true">
          ${Array.from({ length: noteSlots }).map((_, i) => `
            <div class="ex-note-slot" data-ex-slot="${i}">
              <span class="ex-note-dot"></span>
              <span class="text-[10px] uppercase tracking-wider text-ink-500 mt-1.5">${noteSlots === 1 ? "Mystery note" : "Note " + (i + 1)}</span>
              <span class="text-xs text-ink-200 h-4" data-ex-slot-name></span>
            </div>`).join(noteSlots > 1 ? `<span class="text-ink-600 mb-6">→</span>` : "")}
        </div>
        <button type="button" data-ex-play class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">
          ${icon("play", "w-4 h-4")} <span data-ex-play-label>Play the ${noteSlots === 1 ? "note" : "notes"}</span>
        </button>
        ${tools.length ? `<div class="flex flex-wrap justify-center gap-2">${tools.map((t, i) => `<button type="button" data-ex-tool="${i}" class="ex-chip">${t.label}</button>`).join("")}</div>` : ""}
        <p class="font-display text-lg text-ink-100 mt-1">${prompt}</p>
        <div class="flex flex-wrap justify-center gap-3" data-ex-choices>
          ${choices.map((c) => `<button type="button" data-ex-choice="${c.value}" disabled class="ex-choice">${c.label}</button>`).join("")}
        </div>
        <div class="min-h-[3rem] flex flex-col items-center gap-2" aria-live="polite">
          <p class="text-sm text-ink-500" data-ex-feedback>Listen first, then answer.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <button type="button" data-ex-reveal hidden class="text-xs text-ink-400 underline hover:text-ink-200">Show me the answer</button>
            <button type="button" data-ex-next hidden class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold-400/30 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors">Next ${icon("arrowRight", "w-3.5 h-3.5")}</button>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-5 border-t border-white/5" data-ex-score></div>
      <div class="ex-round-summary mt-4" data-ex-summary hidden></div>
    </div>`;
  }

  /**
   * opts: classId, exerciseId, roundLength, generate(ctx) -> question,
   *       examples [{ notes, text }], tools [{ run(api) }], onRoundComplete(stats)
   * question: { notes:[midi], answer, correctText, revealText, slotNames:[str] }
   */
  function wire(container, id, opts) {
    const root = container.querySelector(`[data-exercise="${id}"]`);
    if (!root) return { destroy() {} };
    const { classId, exerciseId, roundLength = 10, generate, examples = [], tools = [], onRoundComplete } = opts;
    const $ = (s) => root.querySelector(s);
    const playBtn = $("[data-ex-play]");
    const playLabel = $("[data-ex-play-label]");
    const feedback = $("[data-ex-feedback]");
    const revealBtn = $("[data-ex-reveal]");
    const nextBtn = $("[data-ex-next]");
    const scoreEl = $("[data-ex-score]");
    const summary = $("[data-ex-summary]");
    const choiceBtns = [...root.querySelectorAll("[data-ex-choice]")];
    const slots = [...root.querySelectorAll("[data-ex-slot]")];

    let q = null, heard = false, done = false, firstTry = true;
    let index = 0, roundFirstTry = 0, prev = null;
    let playing = null;

    function stats() { return ClassActivity.getStats(classId, exerciseId); }
    function renderScore() { scoreEl.innerHTML = ExerciseScore.render(stats(), { question: index, roundLength }); }

    function setFeedback(kind, text) {
      feedback.className = `text-sm ${kind === "good" ? "text-emerald-300" : kind === "bad" ? "text-red-300" : kind === "info" ? "text-ink-200" : "text-ink-500"}`;
      feedback.textContent = text;
    }

    function lightSlot(i) {
      slots.forEach((s, j) => s.classList.toggle("is-playing", j === i));
    }

    function stopPlaying() { if (playing) { playing.cancel(); playing = null; } lightSlot(-1); }

    function newQuestion() {
      stopPlaying();
      index += 1;
      const s = stats();
      q = generate({ index, roundLength, roundsCompleted: s.roundsCompleted, prev });
      prev = q;
      heard = false; done = false; firstTry = true;
      choiceBtns.forEach((b) => { b.disabled = true; b.classList.remove("is-right", "is-wrong"); });
      slots.forEach((s) => { s.classList.remove("is-revealed"); s.querySelector("[data-ex-slot-name]").textContent = ""; });
      playLabel.textContent = `Play the ${slots.length === 1 ? "note" : "notes"}`;
      revealBtn.hidden = true;
      nextBtn.hidden = true;
      summary.hidden = true;
      setFeedback("", "Listen first, then answer.");
      renderScore();
    }

    async function playQuestion() {
      stopPlaying();
      const p = PianoSynth.playSequence(q.notes, { onNote: (i) => lightSlot(i) });
      playing = p;
      await p;
      // Interrupted (replayed, or another sound started): only a playback that
      // finished all its notes counts as "heard" and unlocks the answers.
      if (playing !== p) return;
      playing = null;
      if (!heard) {
        heard = true;
        playLabel.textContent = "Play again";
        if (!done) {
          choiceBtns.forEach((b) => { b.disabled = b.classList.contains("is-wrong"); });
          setFeedback("", "Your answer?");
        }
      }
    }

    function revealNames() {
      slots.forEach((s, i) => {
        s.classList.add("is-revealed");
        s.querySelector("[data-ex-slot-name]").textContent = q.slotNames[i] || "";
      });
    }

    function finishQuestion() {
      done = true;
      ClassActivity.recordQuestion(classId, exerciseId);
      choiceBtns.forEach((b) => { b.disabled = true; });
      revealBtn.hidden = true;
      nextBtn.hidden = false;
      nextBtn.firstChild.textContent = index >= roundLength ? "See my round " : "Next ";
      revealNames();
      renderScore();
    }

    function answer(value) {
      if (!heard || done) return;
      const correct = value === q.answer;
      ClassActivity.recordAttempt(classId, exerciseId, correct);
      const btn = choiceBtns.find((b) => b.dataset.exChoice === value);
      if (correct) {
        if (firstTry) roundFirstTry += 1;
        btn.classList.add("is-right");
        setFeedback("good", q.correctText);
        finishQuestion();
      } else {
        firstTry = false;
        btn.classList.add("is-wrong");
        btn.disabled = true;
        setFeedback("bad", "Not quite. Listen again.");
        revealBtn.hidden = false;
        renderScore();
      }
    }

    function finishRound() {
      const pct = Math.round((roundFirstTry / roundLength) * 100);
      ClassActivity.recordRound(classId, exerciseId, pct);
      const s = stats();
      summary.hidden = false;
      summary.innerHTML = `
        <div class="rounded-2xl border border-gold-400/20 bg-gold-500/[0.05] p-5 text-center">
          <p class="text-xs uppercase tracking-[0.2em] text-gold-400/80 mb-1">Round complete</p>
          <p class="font-display text-2xl text-ink-50">${roundFirstTry} / ${roundLength} on the first try</p>
          <p class="text-sm text-ink-400 mt-1">${pct >= 80 ? "Lovely listening — your ears are getting sharper." : pct >= 50 ? "Good progress. Another round will make this feel easier." : "That's a real start. Ears improve with repetition — try another round."}</p>
          <button type="button" data-ex-again class="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Practice another round</button>
        </div>`;
      nextBtn.hidden = true;
      if (onRoundComplete) onRoundComplete(s);
    }

    function onClick(e) {
      const ex = e.target.closest("[data-ex-example]");
      if (ex) {
        const example = examples[Number(ex.dataset.exExample)];
        const textEl = $("[data-ex-example-text]");
        textEl.textContent = "Listening…";
        stopPlaying();
        playing = PianoSynth.playSequence(example.notes, { onNote: (i) => lightSlot(i) });
        playing.then(() => { textEl.textContent = example.text; });
        return;
      }
      const tool = e.target.closest("[data-ex-tool]");
      if (tool) {
        stopPlaying();
        playing = tools[Number(tool.dataset.exTool)].run({ choiceButtons: choiceBtns });
        return;
      }
      if (e.target.closest("[data-ex-play]")) { playQuestion(); return; }
      const choice = e.target.closest("[data-ex-choice]");
      if (choice && !choice.disabled) { answer(choice.dataset.exChoice); return; }
      if (e.target.closest("[data-ex-reveal]")) {
        btnReveal();
        return;
      }
      if (e.target.closest("[data-ex-next]")) {
        if (index >= roundLength) { finishRound(); return; }
        newQuestion();
        playQuestion();
        return;
      }
      if (e.target.closest("[data-ex-again]")) {
        index = 0; roundFirstTry = 0;
        newQuestion();
        playQuestion();
      }
    }

    function btnReveal() {
      choiceBtns.find((b) => b.dataset.exChoice === q.answer).classList.add("is-right");
      setFeedback("info", q.revealText);
      finishQuestion();
    }

    root.addEventListener("click", onClick);
    newQuestion();

    return {
      destroy() { stopPlaying(); root.removeEventListener("click", onClick); },
    };
  }

  return { render, wire };
})();

/* ---------- helpers ---------- */
function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

/** Smallest interval (semitones) to ask about — big, obvious jumps first, finer ones as the learner warms up. */
function minIntervalFor({ index, roundsCompleted }, steps) {
  const stage = roundsCompleted > 0 ? Math.min(2, Math.floor(index / 4) + 1) : Math.min(2, Math.floor((index - 1) / 4));
  return steps[stage];
}

/* ---------- Exercise 1: Higher or Lower ---------- */
const HigherLowerExercise = {
  LOW: 60, HIGH: 72, // C4–C5

  config() {
    return {
      eyebrow: "Exercise 1 · Identify",
      title: "Higher or Lower?",
      intro: "You'll hear two notes, one after the other. Don't worry about note names — just notice whether the sound moved <strong class=\"text-ink-200\">up</strong> or <strong class=\"text-ink-200\">down</strong>. The first questions are big, easy jumps; they get gently closer as you go.",
      prompt: "Is the second note HIGHER or LOWER?",
      choices: [{ value: "higher", label: "↑ Higher" }, { value: "lower", label: "↓ Lower" }],
      examples: [
        { label: "Example: going up", notes: [60, 67], text: "C4 then G4 — the second note is HIGHER. The sound climbed." },
        { label: "Example: going down", notes: [67, 60], text: "G4 then C4 — the second note is LOWER. The sound fell." },
      ],
    };
  },

  generate(ctx) {
    const { LOW, HIGH } = HigherLowerExercise;
    const min = minIntervalFor(ctx, [5, 3, 1]);
    let a, b;
    do {
      a = randInt(LOW, HIGH);
      b = a + (Math.random() < 0.5 ? -1 : 1) * randInt(min, 12);
    } while (b < LOW || b > HIGH);
    const answer = b > a ? "higher" : "lower";
    const [na, nb] = [NoteUtils.name(a), NoteUtils.name(b)];
    return {
      notes: [a, b],
      answer,
      slotNames: [na, nb],
      correctText: `✓ Correct! ${nb} is ${answer} than ${na}.`,
      revealText: `The second note was ${answer.toUpperCase()}: ${na} → ${nb}.`,
    };
  },
};

/* ---------- Exercise 2: Same or Different ---------- */
const SameDifferentExercise = {
  LOW: 60, HIGH: 72,

  config() {
    return {
      eyebrow: "Exercise 2 · Identify",
      title: "Same or Different?",
      intro: "Two notes again — this time, are they exactly the <strong class=\"text-ink-200\">same</strong> pitch, or <strong class=\"text-ink-200\">different</strong>? This is the skill you'll use to check whether your voice matches a note.",
      prompt: "Are these notes the SAME or DIFFERENT?",
      choices: [{ value: "same", label: "= Same" }, { value: "different", label: "≠ Different" }],
      examples: [
        { label: "Example: same", notes: [64, 64], text: "E4 then E4 — exactly the SAME note." },
        { label: "Example: different", notes: [64, 69], text: "E4 then A4 — DIFFERENT notes (the second is higher)." },
      ],
    };
  },

  generate(ctx) {
    const { LOW, HIGH } = SameDifferentExercise;
    const a = randInt(LOW, HIGH);
    const same = Math.random() < 0.45;
    let b = a;
    if (!same) {
      const min = minIntervalFor(ctx, [4, 2, 1]);
      do { b = a + (Math.random() < 0.5 ? -1 : 1) * randInt(min, 7); } while (b < LOW || b > HIGH);
    }
    const [na, nb] = [NoteUtils.name(a), NoteUtils.name(b)];
    return {
      notes: [a, b],
      answer: same ? "same" : "different",
      slotNames: [na, nb],
      correctText: same ? `✓ Correct! Both notes were ${na}.` : `✓ Correct! They were different: ${na} then ${nb}.`,
      revealText: same ? `They were the SAME: ${na} and ${nb}.` : `They were DIFFERENT: ${na} then ${nb}.`,
    };
  },
};

/* ---------- Exercise 3: Find the Note ---------- */
const NoteIdentificationExercise = {
  POOL: [60, 62, 64, 65], // C4 D4 E4 F4 — widen later for more difficulty

  config() {
    const pool = NoteIdentificationExercise.POOL;
    return {
      eyebrow: "Exercise 3 · Identify",
      title: "Find the Note",
      intro: "Now you'll hear a single note from a small set: C4, D4, E4 or F4 — four neighbouring white keys. Use the <em>Hear all four</em> button as often as you like to compare. Nobody expects you to know them instantly; this is how your ear starts to learn them.",
      prompt: "Which note did you hear?",
      choices: pool.map((m) => ({ value: NoteUtils.name(m), label: NoteUtils.name(m) })),
      noteSlots: 1,
      tools: [{
        label: `Hear all four: ${pool.map((m) => NoteUtils.name(m)).join(" · ")}`,
        run: ({ choiceButtons }) => PianoSynth.playSequence(pool, {
          duration: 0.6, gap: 0.15,
          onNote: (i) => choiceButtons.forEach((b, j) => b.classList.toggle("is-hint", j === i)),
        }),
      }],
    };
  },

  generate(ctx) {
    const pool = NoteIdentificationExercise.POOL;
    let m;
    do { m = pool[randInt(0, pool.length - 1)]; } while (ctx.prev && ctx.prev.notes[0] === m && Math.random() < 0.7);
    const n = NoteUtils.name(m);
    return { notes: [m], answer: n, slotNames: [n], correctText: `✓ Correct! That was ${n}.`, revealText: `That was ${n}.` };
  },
};
