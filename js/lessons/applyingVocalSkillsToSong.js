/* ============================================================
   LEVEL 2, CLASS 15 — APPLYING VOCAL SKILLS TO A SONG (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "applying-vocal-skills-to-song".

   Curriculum identity: Level 2, Class 15 (`number: 15`, `levelId: 2`
   in data.js, id `L2C15`). Same mechanism Classes 1-14 already
   proved fourteen times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Expressive Singing Foundations" during Class 14's turn), so
   nothing needed renaming or adding to bring Class 15 itself onto
   the page.

   **Level 2's class count grows an eleventh time.** This spec's own
   "Next class preview" names the real Class 16 as "Phrase Shaping
   and Musical Interpretation." Since an entry already existed in
   `levelClassDefs[2]` from Class 14's turn, this is a plain rename
   in place, the same precedent every class since 5 has followed
   (apart from Class 11's one-off addition).

   Core idea: "A beginner should not try to master all these elements
   simultaneously... learning a song one small section at a time."
   The first Level 2 class to explicitly synthesize the whole level
   so far (Part E's table connects Classes 10-14 by name) and the
   first scoped at 15-20 minutes rather than the usual 10-15.

   No song library exists anywhere in this codebase (confirmed by
   search before writing this file), so Part B offers two short
   ORIGINAL two-line practice phrases with simple, uncopyrighted
   lyrics and a stepwise scale-degree melody — the same
   `degreesToNotes(base, degrees)` pattern Level 1's own Class 24
   (`singingCompleteSong.js`) established, reused here for the first
   time in Level 2. No real audio library, karaoke player, or
   downloadable track is implemented — exactly what the spec asks to
   avoid building.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch-detection, rhythm-scoring, vocal-quality analysis, or
   performance grading (none exists in this codebase); completion
   never depends on singing an entire song, perfect pitch or rhythm,
   recording, matching an original singer, or completing every
   optional repetition (the spec says this explicitly).

   Like Classes 11-14, this spec gives no literal Section-I
   completion-checklist text (its "Completion criteria" is phrased
   as negative constraints), so this file self-authors a 5-item
   plain-checkbox checklist from the lesson's own Parts A-H, the same
   style Class 10's original `PRE_CHECK_ITEMS` established. Part H's
   own spec-literal 6-item self-review list becomes a SEPARATE,
   non-gating set of `SelfAssessment` reflection questions, not the
   completion checklist itself — the two serve different purposes.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress, the click-and-rerender card-choice
   pattern (Class 14, including its `btn.parentElement` fix — reused
   correctly from the start this time), the multi-part-in-one-take
   pattern (Class 2), and `singingCompleteSong.js`'s (Level 1, Class
   24) `degreesToNotes` melody pattern. Part H reuses all seven of
   Parts C/D/F/G's own recordings for its "listen and self-review"
   section rather than asking for a new one — the eighth Level 2
   class in a row (after 7-14) to substantially reuse its final
   optional-recording section instead of re-asking.
   ============================================================ */

const ApplyingVocalSkillsToSongLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "choose", label: "Choose" },
    { id: "listen", label: "Listen" },
    { id: "breakdown", label: "Break Down" },
    { id: "apply", label: "Apply" },
    { id: "sing", label: "Sing" },
    { id: "connect", label: "Connect" },
    { id: "review", label: "Review" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const MAX_DEGREE = 3;

  const SONGS = {
    song1: { key: "song1", label: "Soft Morning", a: { text: "The morning light is soft", degrees: [0, 1, 2, 1, 0] }, b: { text: "and new.", degrees: [2, 3] } },
    song2: { key: "song2", label: "Quiet Hope", a: { text: "I carry hope within", degrees: [0, 1, 2, 1] }, b: { text: "my heart.", degrees: [3, 1] } },
  };

  const SKILLS = [
    ["Pitch", "Singing the intended notes."],
    ["Rhythm", "Following the timing."],
    ["Breathing", "Breathing comfortably between phrases."],
    ["Vocal stability", "Keeping notes reasonably consistent."],
    ["Dynamics", "Controlling softness and strength."],
    ["Expression", "Communicating the feeling of the song."],
  ];

  const APPLY_TABLE = [
    ["Class 10: Register transitions", "Keep the voice comfortable when moving between notes."],
    ["Class 11: Controlled range", "Avoid forcing high or low notes."],
    ["Class 12: Sustained notes", "Keep longer notes reasonably steady."],
    ["Class 13: Vocal dynamics", "Use gentle changes in intensity."],
    ["Class 14: Expressive singing", "Understand the emotion behind the phrase."],
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the different skills involved in singing a song." },
    { key: "choseSong", label: "I chose a short practice phrase to work with." },
    { key: "brokeIntoPhrases", label: "I practiced the phrase broken into smaller sections." },
    { key: "triedSinging", label: "I tried singing at least one attempt, or chose to skip." },
    { key: "reflectionRecorded", label: "I reflected on my practice, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    movement: { question: "Does the melody move up, down, repeat, or mix?", options: [opt("up", "Mostly up"), opt("down", "Mostly down"), opt("repeats", "Mostly repeats"), opt("mix", "A mix")] },
    followedMelody: { question: "Did I follow the basic melody?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    closeToRhythm: { question: "Was I reasonably close to the rhythm?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    breathedComfortably: { question: "Did I breathe comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    forcedNotes: { question: "Did I force any notes?", options: [opt("no", "No", "good"), opt("alittle", "A little"), opt("yes", "Yes"), opt("unsure", "Not sure")] },
    comfortableVolume: { question: "Did I maintain a comfortable volume?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    communicatedFeeling: { question: "Did I communicate the phrase's intended feeling?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);
  const degreesToNotes = (b, degrees) => degrees.map((d) => b + d * STEP);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + MAX_DEGREE * STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
    const l2c14 = (ClassActivity.get("L2C14").answers.setup || {}).note;
    if (ok(l2c14)) return l2c14;
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
    const fallback = (ClassActivity.get("L1C01").answers.setup || {}).voice === "lower" ? 50 : 60;
    return Math.max(RANGE.from, Math.min(RANGE.to - MAX_DEGREE * STEP, fallback));
  }

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const q = (rec, k) => A(rec, "q")[k] || null;
  const checklist = (rec) => A(rec, "checklist");
  const song = (rec) => SONGS[q(rec, "chosenSong")] || SONGS.song1;

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const skipBtn = (k, label = "Skip this attempt") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function songCardsHtml(rec) {
    const chosen = q(rec, "chosenSong") || "song1";
    return `<div class="grid sm:grid-cols-2 gap-3">
      ${Object.values(SONGS).map((s) => `
      <button type="button" data-song-choice="${s.key}" class="text-left rounded-2xl border p-4 transition-colors ${chosen === s.key ? "border-gold-400/50 bg-gold-500/[0.08]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}">
        <p class="font-display text-base text-ink-50 mb-1">${s.label}</p>
        <p class="text-xs text-ink-400 italic">“${s.a.text} ${s.b.text}”</p>
      </button>`).join("")}
    </div>`;
  }

  function reviewHtml(rec) {
    const sources = [
      ["humTake", "Humming the melody"], ["phraseATake", "Phrase 1 (speak, hum, sing)"], ["phraseBTake", "Phrase 2 (speak, hum, sing)"],
      ["attempt1Take", "Attempt 1 — comfortable"], ["attempt2Take", "Attempt 2 — technique"], ["attempt3Take", "Attempt 3 — expression"],
      ["connectedTake", "Both phrases connected"],
    ];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return `<p class="text-sm text-ink-500">Record any of the humming, phrase, attempt, or connected takes above — then come back here to listen and self-review.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 15 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">One small section at a time.</p>
        <p class="text-sm text-ink-300">A song is many skills working together — a beginner never needs to master all of them at once.</p>
        <p class="text-sm text-ink-100">Changing the key to suit your comfortable range is always acceptable — the original recording's key is not a requirement.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 16 — Phrase Shaping and Musical Interpretation</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will build on today's phrase-by-phrase approach, shaping a phrase's rise and fall for a more musical, interpretive sound.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A short phrase, learned one small section at a time.</h3>
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
    const s = song(rec);
    const sel = (k) => q(rec, k);
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Part A — Understand how to approach a song", `
          ${narrow(`
            ${p("Singing a song involves several skills working together:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-5">
              ${SKILLS.map(([t, d]) => `<li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">${t}:</strong> ${d}</li>`).join("")}
            </ul>
            ${p("A beginner should never try to master all of these at once. The idea here is to learn a short phrase one small section at a time.")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("choose", 2, "Part B — Choose a practice phrase", `
          ${narrow(p("These are short, original practice phrases — not a copyrighted song — chosen for a manageable melody, a comfortable tempo, and a length easy to repeat without fatigue."))}
          <div data-song-host>${songCardsHtml(rec)}</div>
        `)}

        ${chapter("listen", 3, "Part C — Listen before singing", `
          ${narrow(p("Choose a comfortable reference note below — changing the key to suit your comfortable range is always fine. Listen to the phrase once without singing, then again, noticing whether the melody moves up, down, or repeats, and where it naturally ends."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("avs-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong> <span class="text-ink-500 text-xs" data-base-hint></span></p>`)}
          <div class="flex flex-wrap gap-3 mb-5">
            <button type="button" data-play-phrase="full" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the full phrase</button>
          </div>
          ${narrow(`
            ${SelfAssessment.render("movement-q", { ...Q.movement, selected: sel("movement") })}
            <p class="text-sm text-ink-300 my-4">A natural breath fits between the two halves of the phrase: “${s.a.text}” <span class="text-gold-300">(breathe)</span> “${s.b.text}”</p>
          `)}
          ${recCard("humTake", "Hum the melody softly, if comfortable", "Entirely optional.", 10)}
        `, { wide: true })}

        ${chapter("breakdown", 4, "Part D — Break the phrase into small sections", `
          ${narrow(p("For each short section: listen, notice the starting pitch, speak the words naturally, hum the melody if comfortable, then sing it gently. One combined take per section is fine — rest before repeating."))}
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-ink-200 mb-1">Section 1: “${s.a.text}”</p>
              <p class="text-xs text-ink-500 mb-2">Starting note: ${N(degreesToNotes(b, s.a.degrees)[0])}</p>
              <button type="button" data-play-phrase="a" class="vr-btn mb-3">${icon("play", "w-3.5 h-3.5")} Listen</button>
              ${recCard("phraseATake", "Speak, hum, then sing gently", "", 15)}
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-1">Section 2: “${s.b.text}”</p>
              <p class="text-xs text-ink-500 mb-2">Starting note: ${N(degreesToNotes(b, s.b.degrees)[0])}</p>
              <button type="button" data-play-phrase="b" class="vr-btn mb-3">${icon("play", "w-3.5 h-3.5")} Listen</button>
              ${recCard("phraseBTake", "Speak, hum, then sing gently", "", 15)}
            </div>
          </div>
        `, { wide: true })}

        ${chapter("apply", 5, "Part E — Apply previously learned skills", `
          ${narrow(`
            ${p("A quick reminder of how recent classes connect to this one:")}
            <div class="flex flex-col gap-2 mb-5">
              ${APPLY_TABLE.map(([t, d]) => `
                <div class="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <p class="text-sm text-ink-100 font-medium">${t}</p>
                  <p class="text-xs text-ink-400 mt-0.5">${d}</p>
                </div>`).join("")}
            </div>
            ${p("Comfortable breathing, pitch matching, rhythm, and basic vocal control from Level 1 all apply too — but this is not a test of every technique at once. Keep it gentle.")}
          `)}
        `)}

        ${chapter("sing", 6, "Part F — Sing the phrase", `
          ${narrow(p(`Three short attempts at the full phrase “${s.a.text} ${s.b.text}” — skip any of them, or repeat only when comfortable.`))}
          <div class="flex flex-col gap-5">
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 1 — Comfortable singing</p>
              <p class="text-xs text-ink-500 mb-2">Sing naturally, focusing on the melody and rhythm, at a comfortable volume.</p>
              ${recCard("attempt1Take", "Attempt 1", "", 15)}
              <div class="mt-2">${skipBtn("attempt1")}</div>
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 2 — Technique awareness</p>
              <p class="text-xs text-ink-500 mb-2">Pay attention to comfortable breathing and relaxed, reasonably stable notes — avoid forcing any transitions.</p>
              ${recCard("attempt2Take", "Attempt 2", "", 15)}
              <div class="mt-2">${skipBtn("attempt2")}</div>
            </div>
            <div>
              <p class="text-sm text-ink-200 mb-1">Attempt 3 — Musical expression</p>
              <p class="text-xs text-ink-500 mb-2">Think about what the phrase communicates, use natural dynamics, and sing with a clear intention.</p>
              ${recCard("attempt3Take", "Attempt 3", "", 15)}
              <div class="mt-2">${skipBtn("attempt3")}</div>
            </div>
          </div>
        `)}

        ${chapter("connect", 7, "Part G — Connect the phrases", `
          ${narrow(p("Once the two sections feel familiar, try connecting them: a natural breath in between, keeping the rhythm, and never rushing the second section. Singing the complete two-line phrase in one attempt is never required."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-phrase="full" class="vr-btn">${icon("play", "w-4 h-4")} Listen to both sections together</button>
          </div>
          ${recCard("connectedTake", "Both sections, connected", "Entirely optional.", 20)}
          ${narrow(`<div class="mt-3">${skipBtn("connected", "Skip this exercise")}</div>`)}
        `)}

        ${chapter("review", 8, "Part H — Listen and self-review", `
          ${narrow(p("Listen back to any of your attempts above and compare them. If you'd rather not record, the questions below work just as well as a self-review — simply answer from memory."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("followedMelody-q", { ...Q.followedMelody, selected: sel("followedMelody") })}
              ${SelfAssessment.render("closeToRhythm-q", { ...Q.closeToRhythm, selected: sel("closeToRhythm") })}
              ${SelfAssessment.render("breathedComfortably-q", { ...Q.breathedComfortably, selected: sel("breathedComfortably") })}
              ${SelfAssessment.render("forcedNotes-q", { ...Q.forcedNotes, selected: sel("forcedNotes") })}
              ${SelfAssessment.render("comfortableVolume-q", { ...Q.comfortableVolume, selected: sel("comfortableVolume") })}
              ${SelfAssessment.render("communicatedFeeling-q", { ...Q.communicatedFeeling, selected: sel("communicatedFeeling") })}
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-avs", { placeholder: "e.g. Which section felt easiest... Whether connecting the two phrases felt natural... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on singing an entire song, perfect pitch or rhythm, a recording, matching an original singer, or completing every optional repetition.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
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
    const songNow = () => song(rec0());

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

    /* ---- Part B: song choice cards ---- */
    function onSongChoice(e) {
      const btn = e.target.closest("[data-song-choice]");
      if (!btn) return;
      set("q", "chosenSong", btn.dataset.songChoice);
      btn.parentElement.innerHTML = songCardsHtml(rec0());
    }
    container.addEventListener("click", onSongChoice);
    cleanups.push(() => container.removeEventListener("click", onSongChoice));

    /* ---- Part C: piano + phrase playback ---- */
    own(VirtualPiano.wire(container, "avs-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => {
        if (midi + MAX_DEGREE * STEP > RANGE.to) {
          $("[data-base-hint]").textContent = `(choose a note up to ${N(RANGE.to - MAX_DEGREE * STEP)} so the whole phrase stays comfortable)`;
          return;
        }
        set("setup", "note", midi);
        $("[data-base-note]").textContent = N(midi);
        $("[data-base-hint]").textContent = "";
      },
    }));
    function onPlayPhrase(e) {
      const btn = e.target.closest("[data-play-phrase]");
      if (!btn) return;
      const s = songNow();
      const b = base();
      const which = btn.dataset.playPhrase;
      const degrees = which === "a" ? s.a.degrees : which === "b" ? s.b.degrees : [...s.a.degrees, ...s.b.degrees];
      PianoSynth.playSequence(degreesToNotes(b, degrees), { duration: 0.55, gap: 0.18 });
    }
    container.addEventListener("click", onPlayPhrase);
    cleanups.push(() => container.removeEventListener("click", onPlayPhrase));

    /* ---- skip buttons ---- */
    function onSkip(e) {
      const btn = e.target.closest("[data-skip-ex]");
      if (!btn) return;
      set("skip", btn.dataset.skipEx, true);
      btn.textContent = "Skipped — that's okay";
      btn.disabled = true;
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const NAMES = {
      humTake: "Humming the melody", phraseATake: "Phrase 1 (speak, hum, sing)", phraseBTake: "Phrase 2 (speak, hum, sing)",
      attempt1Take: "Attempt 1 — comfortable", attempt2Take: "Attempt 2 — technique", attempt3Take: "Attempt 3 — expression",
      connectedTake: "Both phrases connected",
    };
    const MAX_SECONDS = { humTake: 10, phraseATake: 15, phraseBTake: 15, attempt1Take: 15, attempt2Take: 15, attempt3Take: 15, connectedTake: 20 };
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 15 — ${NAMES[k]}`, exercise: `applying-vocal-skills-to-song-${k}` },
        onSaved: (t) => { set("recs", k, t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
      }));
    });

    /* ---- Part H: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "movement-q": "movement", "followedMelody-q": "followedMelody", "closeToRhythm-q": "closeToRhythm",
      "breathedComfortably-q": "breathedComfortably", "forcedNotes-q": "forcedNotes", "comfortableVolume-q": "comfortableVolume", "communicatedFeeling-q": "communicatedFeeling",
    };
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
    own(PersonalNotes.wire(container, "notes-avs", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "A song is many skills working together, and a beginner never needs to master them all at once — learning one small section at a time is enough.",
        struggled: q(rec, "forcedNotes") && q(rec, "forcedNotes") !== "no" ? "Noticed some forcing of notes while singing the phrase." : "",
        toPractice: `Continue practising “${songNow().a.text} ${songNow().b.text}”.`,
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
