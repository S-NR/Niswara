/* ============================================================
   LEVEL 2, CLASS 14 — EXPRESSIVE SINGING FOUNDATIONS (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "expressive-singing-foundations".

   Curriculum identity: Level 2, Class 14 (`number: 14`, `levelId: 2`
   in data.js, id `L2C14`). Same mechanism Classes 1-13 already
   proved thirteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Vocal Dynamics and Control" during Class 13's turn), so nothing
   needed renaming or adding to bring Class 14 itself onto the page.

   **Level 2's class count grows a tenth time.** This spec's own
   "Next class preview" names the real Class 15 as "Applying Vocal
   Skills to a Song." Since an entry already existed in
   `levelClassDefs[2]` from Class 13's turn, this is a plain rename
   in place, the same precedent every class since 5 has followed
   (apart from Class 11's one-off addition).

   Core idea: "Singing is not only about producing correct notes. A
   singer also communicates a feeling, thought, or story... Good
   expression does not require shouting, excessive vibrato, or
   dramatic vocal effects." Uses the spec's own worked example
   directly — "I missed you," spoken naturally, happily, and gently —
   as this file's Part C sentence.

   Honesty boundaries, matching every earlier class: no fabricated
   emotion-detection or vocal-quality analysis (none exists in this
   codebase); completion never depends on expressing a particular
   emotion, recording, a dramatic performance, perfectly changing
   tone or dynamics, or completing optional exercises (the spec says
   this explicitly). A "Neutral / comfortable" option is always
   offered alongside every suggested emotion, per the spec's own
   safety requirement that a learner who doesn't connect with a
   suggested feeling can choose neutral instead.

   Like Classes 11-13, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" is phrased
   as negative constraints), so this file self-authors a 5-item
   plain-checkbox checklist from the lesson's own Parts A-G, the same
   style Class 10's original `PRE_CHECK_ITEMS` established.

   Like Classes 12-13, this lesson never asks the learner to move to
   a different pitch for its own sake — Parts D and F explicitly say
   to keep the melody and pitch as consistent as possible, since the
   point is expression through intention and dynamics, not range —
   so `baseNote()` reuses Class 12/13's simple single-note pattern.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4,
   reused here to also power the clickable emotion-choice cards — a
   question-with-chip-options UI, same mechanism, new content),
   PersonalNotes, ClassProgress, the multi-part-in-one-take pattern
   (Class 2) for Part C, and the "one exercise card per item" grid
   pattern (Classes 7, 8, 13) for Parts D and F. Part G reuses all
   six of Parts C/D/F's own recordings for its "listen and reflect"
   section rather than asking for two new ones — the seventh Level 2
   class in a row (after 7-13) to substantially reuse its final
   optional-recording section instead of re-asking.
   ============================================================ */

const ExpressiveSingingFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "emotion", label: "Emotion" },
    { id: "speak", label: "Speak" },
    { id: "sing", label: "Sing" },
    { id: "dynamics", label: "Dynamics" },
    { id: "emphasis", label: "Emphasis" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const SENTENCE = "I missed you.";
  const PHRASE = "Every new day begins with hope.";
  const WORD_PHRASE = "I will always remember this moment.";
  const WORD = "always";

  const EMOTIONS = [
    { key: "happy", label: "Happy", desc: "A light, open feeling — a touch more energy." },
    { key: "sad", label: "Sad", desc: "A heavier, softer feeling — often gentler." },
    { key: "peaceful", label: "Peaceful", desc: "A calm, settled feeling — steady and unhurried." },
    { key: "hopeful", label: "Hopeful", desc: "A forward-looking feeling — often lifts gently." },
    { key: "romantic", label: "Romantic / longing", desc: "A warm, tender feeling — soft and sincere." },
    { key: "neutral", label: "Neutral / comfortable", desc: "No particular emotion — a steady choice, and that's completely fine." },
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand what expressive singing means." },
    { key: "exploredEmotion", label: "I explored speaking or singing with a chosen feeling." },
    { key: "triedDynamicsOrSkipped", label: "I tried the soft-medium-soft dynamics exercise, or chose to skip it." },
    { key: "noticedNatural", label: "I noticed whether my expression felt natural rather than forced." },
    { key: "reflectionRecorded", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    chosenEmotion: { question: "Which feeling would you like to explore today? Choose Neutral if none of these fit.", options: EMOTIONS.map((e) => opt(e.key, e.label)) },
    communicatedFeeling: { question: "Did I communicate the intended feeling?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    feltNatural: { question: "Did my expression feel natural?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    overdidIt: { question: "Did I overdo the volume or emotion?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    moreGenuine: { question: "Did one version feel more genuine than another?", options: [opt("yes", "Yes", "good"), opt("similar", "They felt similar", "good"), opt("notsure", "Not sure")] },
    wordsConnected: { question: "Did the words and the musical phrase feel connected?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const l2c13 = (ClassActivity.get("L2C13").answers.setup || {}).note;
    if (ok(l2c13)) return l2c13;
    const l2c12 = (ClassActivity.get("L2C12").answers.setup || {}).note;
    if (ok(l2c12)) return l2c12;
    const l2c11 = (ClassActivity.get("L2C11").answers.setup || {}).note;
    if (ok(l2c11)) return l2c11;
    const l2c10 = (ClassActivity.get("L2C10").answers.setup || {}).note;
    if (ok(l2c10)) return l2c10;
    const l2c9 = (ClassActivity.get("L2C09").answers.setup || {}).note;
    if (ok(l2c9)) return l2c9;
    const l2c8 = (ClassActivity.get("L2C08").answers.setup || {}).note;
    if (ok(l2c8)) return l2c8;
    const l2c7 = (ClassActivity.get("L2C07").answers.setup || {}).note;
    if (ok(l2c7)) return l2c7;
    const l2c6 = (ClassActivity.get("L2C06").answers.setup || {}).note;
    if (ok(l2c6)) return l2c6;
    const l2c5 = (ClassActivity.get("L2C05").answers.setup || {}).note;
    if (ok(l2c5)) return l2c5;
    const l2c4 = (ClassActivity.get("L2C04").answers.setup || {}).note;
    if (ok(l2c4)) return l2c4;
    const l2c3 = (ClassActivity.get("L2C03").answers.setup || {}).note;
    if (ok(l2c3)) return l2c3;
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
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 8) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });

  function emotionLabel(key) {
    const e = EMOTIONS.find((x) => x.key === key);
    return e ? e.label : null;
  }

  function emotionCardsHtml(rec) {
    const chosen = q(rec, "chosenEmotion");
    return `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${EMOTIONS.map((e) => `
      <button type="button" data-emotion-choice="${e.key}" class="text-left rounded-2xl border p-4 transition-colors ${chosen === e.key ? "border-gold-400/50 bg-gold-500/[0.08]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
        <p class="font-display text-base text-ink-50 mb-1">${e.label}</p>
        <p class="text-xs text-ink-400">${e.desc}</p>
      </button>`).join("")}
    </div>`;
  }

  function reviewHtml(rec) {
    const sources = [
      ["speakTake", "Speaking: natural, happy, gentle"],
      ["naturalTake", "Sung naturally"], ["peacefulTake", "Sung — peaceful"], ["hopefulTake", "Sung — hopeful"],
      ["naturalWordTake", "Phrase — natural"], ["emphasizedWordTake", `Phrase — “${WORD}” emphasized`],
    ];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the speaking, singing, or phrase attempts above — then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 14 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Singing is also telling.</p>
        <p class="text-sm text-ink-300">The same words and the same melody can sound completely different depending on the feeling behind them.</p>
        <p class="text-sm text-ink-100">Expression develops through listening, practice, and personal interpretation — never through forcing a dramatic effect.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 15 — Applying Vocal Skills to a Song</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will bring today's expressive tools together with everything practiced so far, applied to a short song.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A feeling explored through tone, dynamics, timing, and intention — gently, without acting it out.</h3>
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
    const c = checklist(rec);
    const chosenLabel = emotionLabel(q(rec, "chosenEmotion")) || "your chosen feeling";

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Part A — Understand expressive singing", `
          ${narrow(`
            ${p("Singing is not only about producing correct notes — a singer also communicates a feeling, thought, or story. The same melody can sound completely different depending on the emotion behind it. Expression comes from a combination of tone, dynamics, timing, phrasing, and intention.")}
            ${p("Good expression never requires shouting, excessive vibrato, or dramatic vocal effects.")}
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mt-2">
              <p class="text-sm text-ink-200 italic">Imagine saying “${SENTENCE}” in a happy way, a sad way, and a gentle, comforting way. The words stay exactly the same — but the feeling changes completely.</p>
            </div>
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("emotion", 2, "Part B — Understand the emotion before singing", `
          ${narrow(`
            ${p("Before singing a line, it can help to ask yourself:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-5">
              ${["What is this line trying to communicate?", "Is the feeling happy, sad, peaceful, hopeful, romantic, or longing?", "Which word or phrase carries the main emotion?", "What should the listener feel?"].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
          ${emotionCardsHtml(rec)}
          ${narrow(`<p class="text-xs text-ink-500 mt-4">This is a learning aid, not a test — pick whatever feels right today, including Neutral.</p>`)}
        `, { wide: true })}

        ${chapter("speak", 3, "Part C — Speak before singing", `
          ${narrow(`
            ${p(`Using the sentence “${SENTENCE}”, speak it naturally, then once with a happy feeling, then once with a gentle, comforting feeling — one after another, in a single take if you'd like. Notice how your voice changes naturally. Avoid acting dramatically or forcing the emotion; this exercise simply builds awareness.`)}
          `)}
          ${recCard("speakTake", "Natural, then happy, then gentle/comforting", "One take covering all three is fine.", 15)}
        `)}

        ${chapter("sing", 4, "Part D — Sing with different intentions", `
          ${narrow(p(`Using your comfortable note below and the phrase “${PHRASE}”, sing it naturally, then again with a peaceful feeling, then once with a hopeful feeling. Keep the melody and pitch as consistent as you can — the exploration is through intention and tone, not new technique.`))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("esf-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${recCard("naturalTake", "Natural", "", 10)}
            ${recCard("peacefulTake", "Peaceful", "", 10)}
            ${recCard("hopefulTake", "Hopeful", "", 10)}
          </div>
        `, { wide: true })}

        ${chapter("dynamics", 5, "Part E — Use dynamics to support emotion", `
          ${narrow(`
            ${p("Connecting back to Class 13: a softer phrase can communicate tenderness or sadness, a slightly stronger phrase can communicate confidence or excitement, and a gradual change in intensity can help express a growing emotion.")}
            ${p("These are possibilities, not fixed rules — a sad phrase doesn't always need to be soft, and a happy phrase doesn't always need to be loud.")}
            <p class="text-sm text-ink-200 mb-3">Try a simple <strong>Soft → Medium → Soft</strong> pass on your reference note or the phrase above, entirely optional.</p>
            <button type="button" data-play-pitch class="vr-btn">${icon("play", "w-4 h-4")} Play my reference note again</button>
          `)}
        `)}

        ${chapter("emphasis", 6, "Part F — Express one important word", `
          ${narrow(`
            ${p(`In the phrase “${WORD_PHRASE}”, the word “<strong class="text-gold-300">${WORD}</strong>” carries the main feeling. Sing the phrase naturally, then sing it again giving that word slightly more attention through timing or gentle emphasis — without exaggerating. Not every word needs equal emphasis.`)}
          `)}
          <div class="grid sm:grid-cols-2 gap-3">
            ${recCard("naturalWordTake", "Natural", "", 10)}
            ${recCard("emphasizedWordTake", `With “${WORD}” gently emphasized`, "", 10)}
          </div>
        `)}

        ${chapter("reflect", 7, "Part G — Listen and reflect", `
          ${narrow(p("Listen back to any two of your attempts and compare them. If you'd rather not record, the questions below work just as well as a self-reflection — simply answer from memory."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("communicatedFeeling-q", { ...Q.communicatedFeeling, selected: sel("communicatedFeeling") })}
              ${SelfAssessment.render("feltNatural-q", { ...Q.feltNatural, selected: sel("feltNatural") })}
              ${SelfAssessment.render("overdidIt-q", { ...Q.overdidIt, selected: sel("overdidIt") })}
              ${SelfAssessment.render("moreGenuine-q", { ...Q.moreGenuine, selected: sel("moreGenuine") })}
              ${SelfAssessment.render("wordsConnected-q", { ...Q.wordsConnected, selected: sel("wordsConnected") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-esf", { placeholder: "e.g. Which feeling was easiest to communicate... Whether the emphasis exercise felt natural... What I want to try next time..." })}
        `)}

        ${chapter("complete", 9, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on expressing a particular emotion, a recording, a dramatic performance, perfectly changing tone or dynamics, or completing optional exercises.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 10, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 11, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Part B: emotion choice cards ---- */
    function onEmotionChoice(e) {
      const btn = e.target.closest("[data-emotion-choice]");
      if (!btn) return;
      set("q", "chosenEmotion", btn.dataset.emotionChoice);
      btn.parentElement.innerHTML = emotionCardsHtml(rec0());
    }
    container.addEventListener("click", onEmotionChoice);
    cleanups.push(() => container.removeEventListener("click", onEmotionChoice));

    /* ---- Part D: piano + playback ---- */
    own(VirtualPiano.wire(container, "esf-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); },
    }));
    function onPlayPitch() { PianoSynth.play(base(), { duration: 1.5, velocity: 0.5 }); }
    container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.addEventListener("click", onPlayPitch));
    cleanups.push(() => container.querySelectorAll("[data-play-pitch]").forEach((btn) => btn.removeEventListener("click", onPlayPitch)));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = {
      speakTake: "Speaking: natural, happy, gentle", naturalTake: "Sung naturally", peacefulTake: "Sung — peaceful", hopefulTake: "Sung — hopeful",
      naturalWordTake: "Phrase — natural", emphasizedWordTake: `Phrase — "${WORD}" emphasized`,
    };
    const MAX_SECONDS = { speakTake: 15, naturalTake: 10, peacefulTake: 10, hopefulTake: 10, naturalWordTake: 10, emphasizedWordTake: 10 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 14 — ${NAMES[k]}`, exercise: `expressive-singing-foundations-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Part G: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "communicatedFeeling-q": "communicatedFeeling", "feltNatural-q": "feltNatural", "overdidIt-q": "overdidIt", "moreGenuine-q": "moreGenuine", "wordsConnected-q": "wordsConnected" };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

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
    own(PersonalNotes.wire(container, "notes-esf", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Expression comes from tone, dynamics, timing, phrasing and intention together — it never requires shouting, excessive vibrato, or a dramatic performance.",
        struggled: q(rec, "overdidIt") && q(rec, "overdidIt") !== "no" ? "Noticed some over-doing of volume or emotion while exploring expression." : "",
        toPractice: emotionLabel(q(rec, "chosenEmotion")) ? `Continue exploring the "${emotionLabel(q(rec, "chosenEmotion"))}" feeling.` : "",
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
