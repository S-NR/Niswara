/* ============================================================
   CLASS 15 — DICTION & PRONUNCIATION (interactive lesson)

   Rendered by ClassDetailPage for interactive: "diction-pronunciation".

   Core idea: "Sing the words clearly without losing the music."
   "Clear does not mean exaggerated": no over-opened mouths, no
   punched consonants, no accent "correction". Clear, natural,
   musical — and never at the cost of breath comfort or pitch.

   Flow: speak the words → vowels → vowel + pitch → consonants →
   syllables → word endings → speak → rhythm → sing → lyric
   clarity → don't eat the words → diction + pitch / breath /
   dynamics → listening test → personal lyric → accent → common
   problems → self-evaluation → practice → assignment → milestone.

   Lyric highlighting: the Class 6 BeatGuide lights the current
   word/syllable on each beat (4 tokens per bar; short phrases are
   padded with rests). Exercise mapping to the brief's names:
   Vowel/Consonant/Syllable/SpeakRhythmSing/PitchDiction exercises
   are BeatGuide bars (+ PitchMatchExercise takes for pitch work);
   WordClarity/Lyric/BreathDiction/DynamicDiction exercises are
   RecordingCards with listen-back + the learner's own answers.

   Reuses: LessonKit, VirtualPiano, PitchMatchExercise +
   SelfAssessment (Class 4), RecordingCard + WaveformPlayer +
   ObservationChecklist (Class 5), BeatGuide + metronome engine
   (Class 6), LoudnessAnalysis/LoudnessCompare + ControlCheck
   (Class 9), StabilityPanel (Class 12), Timer, PersonalNotes,
   ClassProgress, ClassActivity (per-user, synced; owner-only).
   ============================================================ */

const DictionPronunciationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "speak", label: "Speak" },
    { id: "vowels", label: "Vowels" },
    { id: "consonants", label: "Consonants" },
    { id: "words", label: "Words" },
    { id: "combine", label: "Combine" },
    { id: "listen", label: "Listen" },
    { id: "mine", label: "My lyric" },
    { id: "evaluate", label: "Evaluate" },
    { id: "practice", label: "Practice" },
    { id: "complete", label: "Complete" },
  ];

  /* ---- Configuration ---- */
  const RANGE = { from: 48, to: 72 };
  const STEP = 2; // whole steps: 1-2-3 = C-D-E from C
  const BPM = 60;
  const PRACTICE_TASK = "song";
  const PRACTICE_CATEGORY = "Diction & Pronunciation";
  const PHRASE = ["I", "want", "to", "sing"];
  const LYRIC = ["I", "sing", "the", "words", "clearly"];
  const ENDINGS = ["Love", "Time", "Light", "Dream", "Song"];
  const VOWELS = [["AH", "father"], ["EH", "bed"], ["EE", "see"], ["OH", "go"], ["OO", "food"]];
  const BREATH_PHRASE = "Every word can be heard";
  const MAX_LYRIC = 80;

  const PROGRESS_ITEMS = [
    { key: "lessonViewed", label: "Lesson viewed" },
    { key: "speaking", label: "Speaking exercise completed" },
    { key: "vowels", label: "Vowel exercise completed" },
    { key: "vowelPitch", label: "Vowel + pitch completed" },
    { key: "consonants", label: "Consonant exercise completed" },
    { key: "syllables", label: "Syllable exercise completed" },
    { key: "endings", label: "Word-ending exercise completed" },
    { key: "speakRhythmSing", label: "Speak → rhythm → sing completed" },
    { key: "lyricClarity", label: "Lyric clarity exercise completed" },
    { key: "dictionPitch", label: "Diction + pitch completed" },
    { key: "dictionBreath", label: "Diction + breath completed" },
    { key: "dictionDynamics", label: "Diction + dynamics completed" },
    { key: "listeningTest", label: "Listening test completed" },
    { key: "personalLyric", label: "Personal lyric test completed" },
    { key: "selfEval", label: "Self-evaluation completed" },
    { key: "reflection", label: "Reflection completed" },
    { key: "assignment", label: "Assignment completed" },
  ];

  const REFLECTION = [
    "In my own words: what does “clear, natural, musical” diction mean?",
    "What helped my words stay clear without exaggerating?",
    "How did diction interact with my pitch, rhythm, breath or dynamics today?",
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const YMN = [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notyet", "Not yet", "maybe"), opt("unsure", "Not sure")];
  const Q = {
    vowelEasy: { question: "Which vowel felt easiest to sustain today? (There's no right answer.)", options: [...VOWELS.map(([v]) => opt(v.toLowerCase(), v)), opt("similar", "All similar"), opt("unsure", "Not sure")] },
    vowelPitch: { question: "Does the pitch feel equally stable on each vowel?", options: [opt("similar", "Yes, fairly similar", "good"), opt("some", "Some felt less stable", "maybe"), opt("unsure", "Not sure")] },
    consonants: { question: "Could you keep the consonants clear without forcing them?", options: YMN },
    syllables: { question: "Could you keep a clear consonant, a clear vowel and a comfortable pitch?", options: YMN },
    endings: { question: "Can you hear the final consonant?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("notalways", "Not always", "maybe"), opt("unsure", "Not sure")] },
    swallow: { question: "Do you sometimes lose words without meaning to?", options: [opt("yes", "Yes"), opt("sometimes", "Sometimes"), opt("no", "No"), opt("unsure", "Not sure")] },
    breath: { question: "Did you need a breath in the middle of a word?", options: [opt("no", "No", "good"), opt("once", "Once", "maybe"), opt("more", "More than once", "maybe"), opt("unsure", "Not sure")] },
    dynamics: { question: "Did the words remain understandable at every intensity?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("soft", "Not at the softest", "maybe"), opt("unsure", "Not sure")] },
    abTest: { question: "Which recording communicates the lyrics more clearly?", options: [opt("a", "Version A"), opt("b", "Version B"), opt("same", "About the same"), opt("unsure", "Not sure")] },
    mine: { question: "Which mode made your lyric clearest?", options: [opt("speak", "Speak"), opt("rhythm", "Rhythm"), opt("sing", "Sing"), opt("unsure", "Not sure")] },
  };
  const leastQ = () => ({ question: "Which word was least clear?", options: [...LYRIC.map((w, i) => opt(String(i + 1), `Word ${i + 1} · ${w}`)), opt("unsure", "Not sure")] });

  const lv = (...items) => items.map(([value, mark, label]) => ({ value, mark, label }));
  const YMN_LEVELS = lv(["yes", "✓", "Yes"], ["mostly", "△", "Mostly"], ["notyet", "○", "Not yet"]);
  const CHECK_ROWS = [
    { key: "vowels", area: "Vowels", question: "Could I keep my vowel sounds clear?", levels: YMN_LEVELS },
    { key: "consonants", area: "Consonants", question: "Could I pronounce consonants without exaggerating?", levels: YMN_LEVELS },
    { key: "endings", area: "Word endings", question: "Could I complete the words?", levels: YMN_LEVELS },
    { key: "pitch", area: "Pitch", question: "Could I maintain pitch while articulating?", levels: YMN_LEVELS },
    { key: "rhythm", area: "Rhythm", question: "Could I maintain timing while pronouncing clearly?", levels: YMN_LEVELS },
    { key: "natural", area: "Naturalness", question: "Did my pronunciation still sound natural?", levels: YMN_LEVELS },
  ];

  /* ---- Exercise configurations (PitchMatchExercise, Class 4 engine) ---- */
  const VOWEL_EX = {
    eyebrow: "Exercise 3 · Vowel + pitch", title: "Five vowels, one comfortable note",
    intro: "Play the reference, then sing each vowel briefly on that note. Notice — don't judge — whether the pitch feels as steady on each one. (Class 12, Pitch Stability.)",
    slots: VOWELS.map(([v, ex]) => ({ key: v.toLowerCase(), label: v, hint: `as in “${ex}”` })),
    assessment: null, noEstimate: true,
    isComplete: (s) => VOWELS.every(([v]) => s.takes[v.toLowerCase()] && s.takes[v.toLowerCase()].mediaId),
  };
  const MELODY_EX = {
    eyebrow: "Exercise 10 · Diction + pitch", title: "“Ma-ry sings to-day”",
    intro: "1 → 2 → 3 → 2 → 1, one syllable per note. Keep the pitch, the rhythm, clear vowels and clear consonants — gently.",
    chain: true, refLabel: "Reference melody", noteDuration: 0.8,
    slots: [{ key: "take", label: "Your “Ma-ry sings to-day”", hint: "Sing along with the guide above, then record" }],
    assessment: { question: "Could you keep the pitch and the words clear together?", options: YMN,
      feedback: { yes: "Lovely — words and music together.", mostly: "Good. Which syllable needed more care?", notyet: "Normal at first. Speak it, then speak it in rhythm, then sing it again.", unsure: "Listen back once for the pitch, and once just for the words." } },
    noEstimate: true,
    isComplete: (s) => !!(s.takes.take && s.takes.take.assessment),
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  /* ---------- derived state ---------- */
  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to - 2 * STEP;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const c2 = (ClassActivity.get("L1C02").answers.setup || {}).note;
    if (ok(c2)) return c2;
    return (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 62;
  }
  const melody = (b) => [0, 1, 2, 1, 0].map((i) => b + i * STEP);
  const exState = (rec, key) => { const s = (rec.answers.exercises || {})[key] || {}; return { ...s, takes: s.takes || {} }; };
  const take = (rec, k) => A(rec, "recs")[k] || null;
  const heard = (rec, k) => !!A(rec, "listened")[k];
  const ran = (rec, k) => !!A(rec, "guides")[k];
  const q = (rec, k) => A(rec, "q")[k] || null;
  const lyricWords = (rec) => (A(rec, "mine").lyric || "").trim().split(/\s+/).filter(Boolean).slice(0, 12);

  /** Bars of 4 tokens for the beat guide (words padded with rests). */
  function wordBars(words, sing) {
    const toks = words.map((w) => (sing ? { t: w, note: true } : { t: w }));
    while (toks.length % 4) toks.push({ t: "", rest: true });
    const bars = [];
    for (let i = 0; i < toks.length; i += 4) bars.push(toks.slice(i, i + 4));
    return bars.length ? bars : [[{ t: "", rest: true }, { t: "", rest: true }, { t: "", rest: true }, { t: "", rest: true }]];
  }
  const syllableBars = (groups, sing) => groups.flatMap((g) => wordBars(g, sing));
  const VOWEL_BARS = [
    [{ t: "AH", note: true, beats: 2 }, { t: "…" }, { t: "EH", note: true, beats: 2 }, { t: "…" }],
    [{ t: "EE", note: true, beats: 2 }, { t: "…" }, { t: "OH", note: true, beats: 2 }, { t: "…" }],
    [{ t: "OO", note: true, beats: 2 }, { t: "…" }, { t: "", rest: true }, { t: "", rest: true }],
  ];
  const CONSONANT_BARS = syllableBars([["MA", "ME", "MI", "MO", "MU"], ["TA", "TE", "TI", "TO", "TU"], ["KA", "KE", "KI", "KO", "KU"]], false);
  const SYLLABLE_BARS = syllableBars([["MA", "ME", "MI", "MO", "MU"], ["NA", "NE", "NI", "NO", "NU"]], true);
  const srsBars = (mode, b) => mode === "melody"
    ? [PHRASE.map((w, i) => ({ t: w, midi: b + [0, 2, 4, 0][i] }))]
    : [PHRASE.map((w) => (mode === "pitch" ? { t: w, note: true } : { t: w }))];
  const maryBars = (b) => {
    const m = melody(b);
    return [[{ t: "Ma", midi: m[0] }, { t: "ry", midi: m[1] }, { t: "sings", midi: m[2] }, { t: "to", midi: m[3] }],
      [{ t: "day", midi: m[4], beats: 2 }, { t: "…" }, { t: "", rest: true }, { t: "", rest: true }]];
  };

  const ASSIGN_KEYS = ["a1", "a2", "a3", "a4"];
  function assignmentDone(rec, cls) {
    const a = A(rec, "assignment");
    return filled(a.phrase) && ASSIGN_KEYS.every((k) => take(rec, k) && heard(rec, k))
      && cls.content.assignment.questions.every((_, i) => filled((a.answers || {})[i]));
  }

  function derivedCheckpoints(rec, cls) {
    const out = {};
    if (["sp1", "sp2", "sp3"].every((k) => take(rec, k)) && (A(rec, "speakObs").easiest || []).length) out.speaking = true;
    if (ran(rec, "vowels") && q(rec, "vowelEasy")) out.vowels = true;
    if (VOWEL_EX.isComplete(exState(rec, "vowelPitch")) && q(rec, "vowelPitch")) out.vowelPitch = true;
    if (ran(rec, "consonants") && q(rec, "consonants")) out.consonants = true;
    if (ran(rec, "syllables") && q(rec, "syllables")) out.syllables = true;
    if (take(rec, "endings") && heard(rec, "endings") && q(rec, "endings")) out.endings = true;
    if (["srsRhythm", "srsPitch", "srsMelody"].every((k) => ran(rec, k))) out.speakRhythmSing = true;
    if (take(rec, "lyric1") && heard(rec, "lyric1") && q(rec, "least") && take(rec, "lyric2")) out.lyricClarity = true;
    if (MELODY_EX.isComplete(exState(rec, "melody"))) out.dictionPitch = true;
    if (take(rec, "breath") && q(rec, "breath")) out.dictionBreath = true;
    if (["dynMedium", "dynSoft", "dynStrong"].every((k) => take(rec, k)) && q(rec, "dynamics")) out.dictionDynamics = true;
    if (take(rec, "versionA") && take(rec, "versionB") && q(rec, "abTest")) out.listeningTest = true;
    if (lyricWords(rec).length && ["mineSpeak", "mineRhythm", "mineSing"].every((k) => take(rec, k)) && q(rec, "mine")) out.personalLyric = true;
    out.selfEval = CHECK_ROWS.every((r) => A(rec, "check")[r.key]);
    out.reflection = REFLECTION.every((_, i) => filled(A(rec, "reflection")[i]));
    if (assignmentDone(rec, cls)) out.assignment = true;
    return out;
  }

  /* ---------- small views ---------- */
  const lyricLine = (words, attrs = "") => `<p class="dc-lyric font-display text-3xl sm:text-4xl text-ink-50 my-4" ${attrs}>${words.map((w) => `<span>${Utils.escapeHtml(w)}</span>`).join(" ")}</p>`;
  const listenNote = (rec, k) => `<p class="text-xs mt-2 ${heard(rec, k) ? "text-emerald-300" : "text-ink-500"}" data-heard="${k}">${heard(rec, k) ? "✓ Listened back." : "Play it back to the end and listen."}</p>`;
  const recCard = (k, title, hint, max = 15) => `${RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false })}`;
  const msg = {
    breath: (v) => (v === "once" || v === "more" ? `<p class="text-sm text-ink-300">Then the phrase is a little long for one comfortable breath. Shorten it (“Every word…” / “…can be heard”) — never hold your breath to make it fit.</p>` : v ? `<p class="text-sm text-ink-300">Good — one comfortable breath, clear words.</p>` : ""),
    abTest: (v) => (v ? `<div class="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-ink-300 leading-relaxed">Singing involves several skills at once. Pitch accuracy alone isn't the whole performance — and clear words alone aren't either. Neither is “more important”: the goal is <strong class="text-ink-100">balance</strong>.</div>` : ""),
    least: (v) => (v && v !== "unsure" ? `Now sing the phrase again and focus only on “${LYRIC[Number(v) - 1]}”. Keep it natural — clearer, not louder.` : v ? "That's okay. Sing it once more slowly and listen for the word that blurs." : ""),
  };

  function problems() {
    const items = [
      ["“My words disappear when I sing.”", "Speak the lyric first. Slow the phrase down. Then sing it again."],
      ["“I pronounce every consonant too strongly.”", "Relax. Clear diction does not mean exaggerated diction."],
      ["“My vowels change when I sing higher.”", "Notice the change. Use a comfortable pitch. Don't force the mouth into an unnatural shape."],
      ["“I lose the final word.”", "Practise the phrase slowly. Identify the final consonant. Then return to normal musical timing."],
      ["“I focus on pronunciation and lose the pitch.”", "Reduce the complexity. Return to speak → rhythm → sing, then rebuild."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([q2, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${q2}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    const parts = ["WORDS", "RHYTHM", "PITCH", "BREATH", "DYNAMICS"];
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Class 15 milestone</p>
        <p class="font-display text-3xl sm:text-4xl text-ink-50 mb-6">MAKE THE WORDS SING</p>
        <div class="flex flex-wrap justify-center items-center gap-2 mb-4">
          ${parts.map((t, i) => `<span class="flow-chip !text-sm">${t}</span>${i < parts.length - 1 ? `<span class="text-gold-300">+</span>` : ""}`).join("")}
        </div>
        <p class="text-gold-300 text-xl mb-1">=</p>
        <p class="font-display text-2xl text-teal-200 mb-5">MUSICAL COMMUNICATION</p>
        <p class="text-sm text-ink-300">You are no longer learning only how to produce sounds.</p>
        <p class="text-sm text-ink-100">You are beginning to communicate through singing.</p>
      </div>`;
  }

  function summaryLines(rec) {
    const c = rec.checkpoints;
    const ex = ["speaking", "vowels", "vowelPitch", "consonants", "syllables", "endings", "speakRhythmSing", "lyricClarity", "dictionPitch", "dictionBreath", "dictionDynamics", "listeningTest", "personalLyric"].filter((k) => c[k]).length;
    return [
      [`Diction exercises (${ex}/13)`, ex === 13],
      ["Self-evaluation", !!c.selfEval],
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
    const bridge = `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mt-6">
        <p class="text-sm text-ink-300 leading-relaxed mb-2">You can now begin combining pitch, rhythm, breath, dynamics and clear words.</p>
        <p class="text-sm text-ink-300 leading-relaxed">${next ? `Next, in <strong class="text-ink-100">Class ${next.number} — ${next.title}</strong>, we'll keep building these skills and connecting them together.` : "Next, we'll keep connecting all these skills together."}</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
          <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Level 1 — Foundation · Class ${cls.number} ✓</p>
          <h3 class="font-display text-2xl text-ink-50 mb-5">Clear. Natural. Musical.</h3>
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
            Complete Class ${cls.number} ${icon("check", "w-4 h-4")}
          </button>
        </div>
        ${bridge}
      </div>`;
  }

  function progressStats(cls) {
    return [
      { label: "Recordings", value: ClassActivity.count(cls.id, "recordings") },
      { label: `${PRACTICE_CATEGORY} logged here`, value: `${Store.classPracticeMinutes(cls.id)} min` },
    ];
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const a = A(rec, "assignment");
    const mine = A(rec, "mine");
    const refl = A(rec, "reflection");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Sing the words clearly without losing the music", `
          ${p("A singer isn't only producing notes — a singer is <strong class=\"text-ink-100\">communicating words and meaning</strong>. A technically correct note can still be hard to understand if the words are unclear.")}
          ${p("Common beginner problems:")}
          <div class="flex flex-wrap gap-2 my-4">${["Swallowed words", "Missing consonants", "Unclear vowels", "Dropped word endings", "Rushing through words", "Pronunciation changing with pitch", "Over-pronouncing every word"].map((t) => `<span class="flow-chip !text-sm">${t}</span>`).join("")}</div>
          <div class="grid grid-cols-3 gap-3 mt-6">${["CLEAR", "NATURAL", "MUSICAL"].map((t) => `<div class="rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] py-5 text-center font-display text-xl sm:text-2xl text-ink-50">${t}</div>`).join("")}</div>
        `)}

        ${chapter("understand", 2, "Clear does not mean exaggerated", `
          <div class="comfort-callout rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-500/[0.10] to-transparent p-6 sm:p-8 mb-5">
            <p class="font-display text-3xl sm:text-4xl text-teal-200 mb-3">“Clear does not mean exaggerated.”</p>
            <p class="text-sm text-ink-200">Good singing diction still sounds natural. The goal is understandable singing.</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-5">
            <p class="text-xs uppercase tracking-wider text-ink-500 mb-3">Please don't</p>
            <ul class="grid sm:grid-cols-2 gap-1.5 text-sm text-ink-400">${["Over-open the mouth", "Over-pronounce consonants", "Change your natural accent unnecessarily", "Force vowels", "Make speech sounds artificially dramatic", "Trade breath comfort or pitch for diction"].map((t) => `<li class="flex gap-2"><span class="text-ink-600">✕</span>${t}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">If you feel pain, significant dizziness, unusual breathlessness or persistent throat discomfort, <strong>stop</strong> and rest.</div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("speak", 3, "Exercise 1 — Speak the words", `
          ${p("Speaking clarity comes first — singing clarity builds on it. Speak this phrase three ways and record each:")}
          ${lyricLine(PHRASE)}
          <div class="grid lg:grid-cols-3 gap-3">
            ${recCard("sp1", "1 · Naturally", "Just say it.", 10)}
            ${recCard("sp2", "2 · Slightly slower", "A little slower — still natural.", 10)}
            ${recCard("sp3", "3 · Normal conversational speed", "Like talking to a friend.", 10)}
          </div>
          <div class="mt-4 obs-single">${ObservationChecklist.render("obs-easiest", [{ key: "easiest", title: "Which words were easiest to hear?", prompt: "Listen back, then choose any.", options: [...PHRASE.map((w) => `“${w}”`), "All about the same", "Not sure"] }], A(rec, "speakObs"))}</div>
        `)}

        ${chapter("vowels", 4, "Exercise 2 — Vowel awareness", `
          ${p("Five basic vowel sounds. Speak each one, then gently sustain each on a comfortable note with the guide (it lights the current vowel).")}
          <div class="grid grid-cols-5 gap-2 my-5">${VOWELS.map(([v, ex]) => `<div class="rounded-2xl border border-white/10 bg-white/[0.03] py-4 text-center"><p class="font-display text-2xl sm:text-3xl text-ink-50">${v}</p><p class="text-[11px] text-ink-500 mt-1">${ex}</p></div>`).join("")}</div>
          <p class="text-sm text-ink-400 mb-4">The exact sound varies with language and accent. We're learning to recognise and gently control the vowel shape — not to copy one accent.</p>
          <div class="dc-words">${BeatGuide.render("bg-vowels", { bars: VOWEL_BARS, guideToggle: true, startLabel: "Sustain with the guide" })}</div>
          <div class="mt-4">${SelfAssessment.render("vowelEasy-q", { ...Q.vowelEasy, selected: sel("vowelEasy") })}</div>
        `)}

        ${chapter("vowels", 5, "Exercise 3 — Vowel + pitch", `
          ${narrow(p("Tap a key for a comfortable note (it's carried over from earlier classes otherwise). Every pitch exercise in this class uses it."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("dc-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          ${PitchMatchExercise.render("dc-vowels", VOWEL_EX)}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">${SelfAssessment.render("vowelPitch-q", { ...Q.vowelPitch, selected: sel("vowelPitch") })}</div>
          <div class="grid sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">${VOWELS.map(([v]) => StabilityPanel.render(`sp-${v.toLowerCase()}`, { title: `${v} · estimated pitch`, compact: true })).join("")}</div>
        `, { wide: true })}

        ${chapter("consonants", 6, "Exercise 4 — Consonant awareness", `
          ${p("Simple consonants: <strong class=\"text-ink-100\">M N B D T K S F</strong>. Speak these syllables along with the guide — short and clear, not fast and not punched.")}
          <div class="dc-words">${BeatGuide.render("bg-consonants", { bars: CONSONANT_BARS, startLabel: "Speak with the guide" })}</div>
          <div class="mt-4">${SelfAssessment.render("consonants-q", { ...Q.consonants, selected: sel("consonants") })}</div>
        `)}

        ${chapter("consonants", 7, "Exercise 5 — Consonant + vowel", `
          ${p("Now sing them on your comfortable note: a <strong class=\"text-ink-100\">clear consonant</strong>, a <strong class=\"text-ink-100\">clear vowel</strong>, a <strong class=\"text-ink-100\">comfortable pitch</strong>. Pitch, breath and vocal control all at once — gently.")}
          <div class="dc-words">${BeatGuide.render("bg-syllables", { bars: SYLLABLE_BARS, guideToggle: true, startLabel: "Sing with the guide" })}</div>
          <div class="mt-4">${SelfAssessment.render("syllables-q", { ...Q.syllables, selected: sel("syllables") })}</div>
        `)}

        ${chapter("words", 8, "Exercise 6 — Word endings", `
          ${p("A common problem: dropping the final sound. “love” becomes “lu…”. Speak these words, then sing them, then listen back. Finish each word — musically, without punching the last consonant.")}
          ${lyricLine(ENDINGS)}
          ${recCard("endings", "Speak, then sing the five words", "Up to 25 seconds.", 25)}
          ${listenNote(rec, "endings")}
          <div class="mt-4">${SelfAssessment.render("endings-q", { ...Q.endings, selected: sel("endings") })}</div>
        `)}

        ${chapter("words", 9, "Exercise 7 — Speak → rhythm → sing", `
          ${p("The relationship: <strong class=\"text-ink-100\">WORDS → RHYTHM → PITCH → SINGING</strong>. Using the Class 6 beat:")}
          <ol class="flex flex-col gap-5 mt-4">
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">1</span>Speak it naturally:</p>${lyricLine(PHRASE)}</li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">2</span>Speak it in rhythm — one word per beat:</p><div class="dc-words">${BeatGuide.render("bg-srs-rhythm", { bars: srsBars("rhythm", b), startLabel: "Speak in rhythm" })}</div></li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">3</span>Sing it on one comfortable note:</p><div class="dc-words" data-srs-pitch>${BeatGuide.render("bg-srs-pitch", { bars: srsBars("pitch", b), guideToggle: true, startLabel: "Sing on one note" })}</div></li>
            <li><p class="text-sm text-ink-200 mb-2"><span class="text-gold-300 mr-2">4</span>Sing it with a simple melody:</p><div class="dc-words" data-srs-melody>${BeatGuide.render("bg-srs-melody", { bars: srsBars("melody", b), guideToggle: true, startLabel: "Sing the melody" })}</div></li>
          </ol>
        `)}

        ${chapter("words", 10, "Exercise 8 — Lyric clarity", `
          ${p("Sing this phrase naturally on any simple tune. Record it and play it back.")}
          ${lyricLine(LYRIC)}
          ${recCard("lyric1", "Attempt 1", "Sing it naturally.", 15)}
          ${listenNote(rec, "lyric1")}
          <div class="mt-4">${SelfAssessment.render("least-q", { ...leastQ(), selected: sel("least") })}</div>
          <p class="text-sm text-ink-300 mt-3 min-h-[1.25rem]" data-least-msg>${msg.least(sel("least"))}</p>
          <div class="mt-4">${recCard("lyric2", "Attempt 2 — focus on that one word", "Clearer, not louder.", 15)}</div>
        `)}

        ${chapter("words", 11, "Exercise 9 — Don't eat the words", `
          ${p("Sometimes singers focus so much on pitch and breath that the words become incomplete — <em>“word swallowing”</em>.")}
          <div class="grid sm:grid-cols-2 gap-3 my-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Intended</p><p class="font-display text-2xl text-ink-50">“I want to sing”</p></div>
            <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5"><p class="text-[11px] uppercase tracking-wider text-ink-500 mb-1">Swallowed</p><p class="font-display text-2xl text-ink-400">“I wanna si…”</p></div>
          </div>
          ${p("Natural contractions are fine when they suit the style — choosing “wanna” is a choice. The problem is <strong class=\"text-ink-100\">unintentionally</strong> losing words.")}
          ${SelfAssessment.render("swallow-q", { ...Q.swallow, selected: sel("swallow") })}
        `)}

        ${chapter("combine", 12, "Exercise 10 — Diction + pitch", `
          <div class="dc-words" data-mary-host>${BeatGuide.render("bg-mary", { bars: maryBars(b), guideToggle: true, startLabel: "Sing along with the guide" })}</div>
          <div class="mt-4">${PitchMatchExercise.render("dc-melody", MELODY_EX)}</div>
          <div class="mt-4">${StabilityPanel.render("sp-melody", { title: "Estimated pitch — after you answer" })}</div>
        `)}

        ${chapter("combine", 13, "Exercise 11 — Diction + breath", `
          ${p("Connecting Class 11: take a comfortable breath, then sing the phrase. Try not to breathe in the middle of a word. <strong class=\"text-ink-100\">Don't hold your breath</strong> — if the phrase is too long, shorten it.")}
          ${lyricLine(BREATH_PHRASE.split(" "))}
          ${recCard("breath", "One comfortable breath, then the phrase", "Short and relaxed.", 15)}
          <div class="mt-4">${SelfAssessment.render("breath-q", { ...Q.breath, selected: sel("breath") })}</div>
          <div class="mt-3" data-breath-msg>${msg.breath(sel("breath"))}</div>
        `)}

        ${chapter("combine", 14, "Exercise 12 — Diction + dynamics", `
          ${p("Connecting Class 14: sing <strong class=\"text-ink-100\">“I want to sing”</strong> three times — medium, soft, slightly stronger. Dynamics shouldn't destroy diction.")}
          <div class="grid lg:grid-cols-3 gap-3">
            ${recCard("dynMedium", "1 · Medium", "Your comfortable volume.", 10)}
            ${recCard("dynSoft", "2 · Soft", "Softer — words still clear.", 10)}
            ${recCard("dynStrong", "3 · Slightly stronger", "A little stronger, never pushed.", 10)}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4"><div data-dyn-loudness></div></div>
          <div class="mt-4">${SelfAssessment.render("dynamics-q", { ...Q.dynamics, selected: sel("dynamics") })}</div>
        `)}

        ${chapter("listen", 15, "Exercise 13 — Listening test", `
          ${p("Make two short versions of <strong class=\"text-ink-100\">“I want to sing”</strong> yourself, then listen to both:")}
          <div class="grid sm:grid-cols-2 gap-3">
            <div><p class="text-sm text-ink-200 mb-2"><strong class="text-gold-300">Version A</strong> — clear words, pitch a little imperfect.</p>${recCard("versionA", "Version A", "Focus on the words.", 10)}</div>
            <div><p class="text-sm text-ink-200 mb-2"><strong class="text-teal-300">Version B</strong> — good pitch, words a little unclear.</p>${recCard("versionB", "Version B", "Focus on the pitch.", 10)}</div>
          </div>
          <div class="mt-4">${SelfAssessment.render("abTest-q", { ...Q.abTest, selected: sel("abTest") })}</div>
          <div class="mt-3" data-ab-msg>${msg.abTest(sel("abTest"))}</div>
        `)}

        ${chapter("mine", 16, "Exercise 14 — Your own lyric", `
          ${p("Type a short line you're practising (up to " + MAX_LYRIC + " characters). It's saved privately to your account only — nothing is analysed.")}
          <input type="text" data-mine-lyric maxlength="${MAX_LYRIC}" class="field !text-lg" placeholder="e.g. a line from a song you love" value="${Utils.escapeHtml(mine.lyric || "")}">
          <div class="mt-4 dc-words" data-mine-guide></div>
          <div class="grid lg:grid-cols-3 gap-3 mt-4">
            ${recCard("mineSpeak", "SPEAK", "Say it naturally.", 15)}
            ${recCard("mineRhythm", "RHYTHM", "Speak it with the guide above.", 15)}
            ${recCard("mineSing", "SING", "Sing it comfortably.", 20)}
          </div>
          <div class="mt-4">${SelfAssessment.render("mine-q", { ...Q.mine, selected: sel("mine") })}</div>
        `)}

        ${chapter("evaluate", 17, "Your accent is not a mistake", `
          ${p("Singers have different accents. You don't need to remove yours. The objective is <strong class=\"text-ink-100\">understandability</strong>, <strong class=\"text-ink-100\">consistent pronunciation</strong> and <strong class=\"text-ink-100\">musical clarity</strong>.")}
          ${p("Learning a song in another language? Learn that language's pronunciation carefully — and remember no single accent is universally “correct”.")}
        `)}

        ${chapter("evaluate", 18, "Common beginner problems", problems())}

        ${chapter("evaluate", 19, "Self-evaluation", `
          ${p("A simple self-check — not a grade.")}
          ${ControlCheck.render("dc-check", CHECK_ROWS, A(rec, "check"))}
        `)}

        ${chapter("practice", 20, `Practice timer — ${PRACTICE_CATEGORY}`, `
          ${p("Short, focused practice is best — a few minutes is plenty; more repetitions aren't better. Saved to your account as <strong class=\"text-ink-100\">Diction &amp; Pronunciation</strong>.")}
          ${Timer.render("dc-timer", { showLogButton: true })}
          <p class="text-sm text-ink-400 mt-3" data-practice-status aria-live="polite"></p>
        `)}

        ${chapter("practice", 21, `Class ${cls.number} Assignment`, `
          ${p("Choose a short lyric phrase, then record four attempts and listen to each.")}
          <input type="text" data-assign-phrase maxlength="${MAX_LYRIC}" class="field !text-lg mb-4" placeholder="Your short lyric phrase" value="${Utils.escapeHtml(a.phrase || "")}">
          <div class="grid sm:grid-cols-2 gap-3">
            ${[["a1", "Attempt 1 — speak it naturally"], ["a2", "Attempt 2 — speak it rhythmically"], ["a3", "Attempt 3 — sing it slowly"], ["a4", "Attempt 4 — sing it at normal speed"]].map(([k, t]) => `<div>${recCard(k, t, "Then play it back to the end.", 20)}${listenNote(rec, k)}</div>`).join("")}
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mt-4">
            <h4 class="font-display text-lg text-ink-50 mb-3">Then answer</h4>
            <div class="flex flex-col gap-4">
              ${cls.content.assignment.questions.map((qq, i) => `
                <div>
                  <label class="block text-sm text-ink-200 mb-1.5" for="dc-aq-${i}">${i + 1}. ${qq}</label>
                  <textarea id="dc-aq-${i}" data-assign-q="${i}" rows="2" class="field" placeholder="A short, honest answer…">${Utils.escapeHtml((a.answers || {})[i] || "")}</textarea>
                </div>`).join("")}
            </div>
          </div>
        `)}

        ${chapter("practice", 22, "Reflection", `
          ${p("Saved privately as you type.")}
          <div class="flex flex-col gap-4">
            ${REFLECTION.map((qq, i) => `
              <div>
                <label class="block text-sm text-ink-200 mb-1.5" for="dc-refl-${i}">${qq}</label>
                <textarea id="dc-refl-${i}" data-reflection="${i}" rows="2" class="field" placeholder="Write a short, honest answer…">${Utils.escapeHtml(refl[i] || "")}</textarea>
              </div>`).join("")}
          </div>
        `)}

        ${chapter("practice", 23, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-dc", { placeholder: "e.g. I swallow final consonants. EE is difficult to sing clearly. My diction becomes unclear when I sing softly." })}
        `)}

        ${chapter("complete", 24, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 25, "Milestone", milestone())}

        ${chapter("complete", 26, "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- live progress ---- */
    const panels = {};
    function refreshLive() {
      const rec = rec0();
      $("[data-lesson-progress]").innerHTML = ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls));
      $("[data-lesson-complete]").innerHTML = renderComplete(cls, rec, Store.classStatus(cls));
      $("[data-lesson-pct]").textContent = `${ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints)}% complete`;
      container.querySelectorAll("[data-heard]").forEach((el) => {
        const ok = heard(rec, el.dataset.heard);
        el.textContent = ok ? "✓ Listened back." : "Play it back to the end and listen.";
        el.className = `text-xs mt-2 ${ok ? "text-emerald-300" : "text-ink-500"}`;
      });
      Object.values(panels).forEach((pn) => pn.refresh());
    }
    function syncCheckpoints() {
      const rec = rec0();
      Object.entries(derivedCheckpoints(rec, cls)).forEach(([k, v]) => {
        if (k === "reflection" || k === "selfEval") { if (!!rec.checkpoints[k] !== v) ClassActivity.markCheckpoint(classId, k, v); return; }
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

    /* ---- beat guides (the current word/syllable lights up) ---- */
    const guides = {};
    function guide(id, bars, key, opts = {}) {
      if (guides[id]) guides[id].destroy();
      guides[id] = BeatGuide.wire(container, id, { bpm: BPM, loops: 1, bars, getNote: base, onComplete: key ? () => set("guides", key, true) : undefined, ...opts });
    }
    cleanups.push(() => Object.values(guides).forEach((g) => g.destroy()));
    guide("bg-vowels", VOWEL_BARS, "vowels");
    guide("bg-consonants", CONSONANT_BARS, "consonants", { bpm: 66 });
    guide("bg-syllables", SYLLABLE_BARS, "syllables", { bpm: 66 });
    guide("bg-srs-rhythm", srsBars("rhythm", 0), "srsRhythm", { loops: 2 });
    function redrawPitchGuides() {
      const b = base();
      $("[data-srs-pitch]").innerHTML = BeatGuide.render("bg-srs-pitch", { bars: srsBars("pitch", b), guideToggle: true, startLabel: "Sing on one note" });
      guide("bg-srs-pitch", srsBars("pitch", b), "srsPitch", { loops: 2 });
      $("[data-srs-melody]").innerHTML = BeatGuide.render("bg-srs-melody", { bars: srsBars("melody", b), guideToggle: true, startLabel: "Sing the melody" });
      guide("bg-srs-melody", srsBars("melody", b), "srsMelody", { loops: 2 });
      $("[data-mary-host]").innerHTML = BeatGuide.render("bg-mary", { bars: maryBars(b), guideToggle: true, startLabel: "Sing along with the guide" });
      guide("bg-mary", maryBars(b), "mary", { loops: 2 });
    }
    redrawPitchGuides();

    /* ---- personal lyric: guide built from the learner's own words ---- */
    function drawMineGuide() {
      const words = lyricWords(rec0());
      const host = $("[data-mine-guide]");
      if (!words.length) { if (guides["bg-mine"]) { guides["bg-mine"].destroy(); delete guides["bg-mine"]; } host.innerHTML = `<p class="text-xs text-ink-500">Type your line above — a guide will light each word in rhythm.</p>`; return; }
      host.innerHTML = BeatGuide.render("bg-mine", { bars: wordBars(words, true), guideToggle: true, startLabel: "Rhythm guide for my line" });
      guide("bg-mine", wordBars(words, true), null, { loops: 1 });
      const tog = host.querySelector("[data-bg-guide]"); if (tog) tog.checked = false; // spoken rhythm first; tick to hear the note
    }
    drawMineGuide();
    const mineInput = $("[data-mine-lyric]");
    const saveMine = Utils.debounce((v) => { set("mine", "lyric", v.slice(0, MAX_LYRIC)); drawMineGuide(); }, 600);
    mineInput.addEventListener("input", () => saveMine(mineInput.value));

    /* ---- comfortable note (piano) ---- */
    const exVowels = own(PitchMatchExercise.wire(container, "dc-vowels", VOWEL_EX, {
      classId, exerciseId: "vowelPitch",
      state: (rec0().answers.exercises || {}).vowelPitch || {},
      getNotes: () => [base()], isComplete: VOWEL_EX.isComplete,
      onState: (s) => { set("exercises", "vowelPitch", s); VOWELS.forEach(([v]) => panels[`sp-${v.toLowerCase()}`] && panels[`sp-${v.toLowerCase()}`].refresh()); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
    }));
    const exMelody = own(PitchMatchExercise.wire(container, "dc-melody", MELODY_EX, {
      classId, exerciseId: "melody",
      state: (rec0().answers.exercises || {}).melody || {},
      getNotes: () => melody(base()), isComplete: MELODY_EX.isComplete,
      onState: (s) => { set("exercises", "melody", s); if (panels["sp-melody"]) panels["sp-melody"].refresh(); },
      onRecorded: () => ClassActivity.bump(classId, "recordings"),
      onAssessed: () => ClassActivity.bump(classId, "selfEvaluations"),
    }));
    own(VirtualPiano.wire(container, "dc-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi > RANGE.to - 2 * STEP) { $("[data-base-hint]").textContent = `(choose ${N(RANGE.to - 2 * STEP)} or lower so the melodies stay comfortable)`; return; }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
        exVowels.refresh(); exMelody.refresh(); redrawPitchGuides();
      },
    }));

    /* ---- estimated pitch (Class 12): only after the learner has answered by ear ---- */
    const viz = A(rec0(), "viz");
    const panel = (id, getTake, canReveal, extra = {}) => {
      panels[id] = own(StabilityPanel.wire(container, id, {
        getTake, canReveal, revealedFor: viz[id] && viz[id].mediaId, ...extra,
        onRevealed: (mediaId, summary) => set("viz", id, { mediaId, ...summary }),
      }));
    };
    VOWELS.forEach(([v]) => panel(`sp-${v.toLowerCase()}`, () => exState(rec0(), "vowelPitch").takes[v.toLowerCase()] || null, () => !!q(rec0(), "vowelPitch"), { waiting: "Answer the question above first." }));
    panel("sp-melody", () => exState(rec0(), "melody").takes.take || null, () => !!(exState(rec0(), "melody").takes.take || {}).assessment, { chain: true });

    /* ---- recordings (listen-back tracked where the brief asks to listen) ---- */
    const loudCache = new Map();
    async function loudnessOf(mediaId) {
      if (loudCache.has(mediaId)) return loudCache.get(mediaId);
      let blob = await Media.getBlob(mediaId).catch(() => null);
      if (!blob) { const url = await Media.getUrl(mediaId).catch(() => null); blob = url ? await fetch(url).then((r) => r.blob()).catch(() => null) : null; }
      const res = blob ? await LoudnessAnalysis.analyze(blob).catch(() => null) : null;
      loudCache.set(mediaId, res);
      return res;
    }
    async function paintLoudness() {
      const rows = [["dynMedium", "1 · Medium"], ["dynSoft", "2 · Soft"], ["dynStrong", "3 · Slightly stronger"]];
      const out = [];
      for (const [k, label] of rows) { const t = take(rec0(), k); out.push({ label, db: t ? ((await loudnessOf(t.mediaId)) || {}).db : undefined }); }
      const host = $("[data-dyn-loudness]");
      if (host) host.innerHTML = LoudnessCompare.render(out);
    }
    const LISTEN_KEYS = new Set(["endings", "lyric1", ...ASSIGN_KEYS]);
    const NAMES = {
      sp1: "Spoken naturally", sp2: "Spoken slightly slower", sp3: "Spoken at normal speed", endings: "Word endings",
      lyric1: "Lyric clarity — attempt 1", lyric2: "Lyric clarity — attempt 2", breath: "Diction + breath",
      dynMedium: "Diction + dynamics — medium", dynSoft: "Diction + dynamics — soft", dynStrong: "Diction + dynamics — slightly stronger",
      versionA: "Listening test — Version A", versionB: "Listening test — Version B",
      mineSpeak: "My lyric — speak", mineRhythm: "My lyric — rhythm", mineSing: "My lyric — sing",
      a1: "Assignment — attempt 1", a2: "Assignment — attempt 2", a3: "Assignment — attempt 3", a4: "Assignment — attempt 4",
    };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: k === "endings" ? 25 : k === "mineSing" || ASSIGN_KEYS.includes(k) ? 20 : 15,
        meta: { name: `Class 15 — ${NAMES[k]}`, exercise: `diction-${k}` },
        onSaved: (t) => {
          set("recs", k, t);
          if (LISTEN_KEYS.has(k)) set("listened", k, false); // a new take needs its own listen-back
          ClassActivity.bump(classId, "recordings");
          if (k.startsWith("dyn")) paintLoudness();
        },
        onPlayer: LISTEN_KEYS.has(k) ? (player) => player.on("ended", ({ fromStart }) => { if (fromStart) set("listened", k, true); }) : undefined,
      }));
    });
    paintLoudness();

    /* ---- multi-select + single-choice questions ---- */
    cleanups.push(ObservationChecklist.wire(container, "obs-easiest", { selected: A(rec0(), "speakObs"), onChange: (key, values) => set("speakObs", key, values) }));
    const after = {
      least: (v) => { $("[data-least-msg]").textContent = msg.least(v); },
      breath: (v) => { $("[data-breath-msg]").innerHTML = msg.breath(v); },
      abTest: (v) => { $("[data-ab-msg]").innerHTML = msg.abTest(v); },
    };
    function onClick(e) {
      const chip = e.target.closest("[data-assess-choice]");
      const group = chip && chip.closest("[data-assess]");
      if (!group || !/-q$/.test(group.dataset.assess) || group.closest("[data-pm]")) return; // exercise chips belong to PitchMatchExercise
      const key = group.dataset.assess.replace(/-q$/, "");
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", key, chip.dataset.assessChoice);
      if (after[key]) after[key](chip.dataset.assessChoice);
      if (key === "vowelPitch") VOWELS.forEach(([v]) => panels[`sp-${v.toLowerCase()}`].refresh());
    }
    container.addEventListener("click", onClick);
    cleanups.push(() => container.removeEventListener("click", onClick));

    /* ---- practice timer ---- */
    const practiceStatus = $("[data-practice-status]");
    own(Timer.wire(container, "dc-timer", {
      onLog: (minutes) => {
        if (minutes < 1) { practiceStatus.textContent = "Practise for at least a minute, then log the session."; return; }
        Store.logMinutes(PRACTICE_TASK, minutes, { classId, category: PRACTICE_CATEGORY });
        practiceStatus.textContent = `Logged ${minutes} min of ${PRACTICE_CATEGORY}. Short and focused is perfect.`;
        refreshLive();
      },
    }));

    /* ---- assignment, self-evaluation, reflection, notes ---- */
    const phrase = $("[data-assign-phrase]");
    const savePhrase = Utils.debounce((v) => set("assignment", "phrase", v.slice(0, MAX_LYRIC)), 500);
    phrase.addEventListener("input", () => savePhrase(phrase.value));
    container.querySelectorAll("[data-assign-q]").forEach((ta) => {
      const i = ta.dataset.assignQ;
      const save = Utils.debounce((v) => set("assignment", "answers", { ...(A(rec0(), "assignment").answers || {}), [i]: v }), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    cleanups.push(ControlCheck.wire(container, "dc-check", { onChange: (k, v) => set("check", k, v) }));
    container.querySelectorAll("[data-reflection]").forEach((ta) => {
      const save = Utils.debounce((v) => set("reflection", ta.dataset.reflection, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });
    own(PersonalNotes.wire(container, "notes-dc", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      const r = A(rec, "reflection");
      const ans = A(rec, "assignment").answers || {};
      Store.addJournalEntry({
        classId,
        classTitle: `Class ${cls.number} — ${cls.title}`,
        learned: filled(r[0]) ? r[0] : "Clear singing isn't about exaggerating words — it's balancing pronunciation with pitch, rhythm, breath and musicality.",
        struggled: ans[0] || "",
        toPractice: ans[7] || "",
        thoughts: REFLECTION.map((qq, i) => (filled(r[i]) ? `${qq} ${r[i].trim()}` : "")).filter(Boolean).join(" "),
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
