/* ============================================================
   LEVEL 3, CLASS 2 — MELODY ANALYSIS AND PHRASE MAPPING
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "melody-analysis-phrase-mapping".

   Curriculum identity: Level 3, Class 2 (`number: 2`, `levelId: 3`
   in data.js, id `L3C02`). Same `id: L${levelId}C${number}`
   mechanism every class in this app already uses.

   UNLIKE EVERY SPEC SINCE LEVEL 2 CLASS 5, THIS ONE NAMES NO NEXT
   CLASS. `levelClassDefs[3]`'s old single placeholder entry ("Melody
   Analysis and Phrase Mapping," Class 2's own now-real title) is
   simply removed, not renamed to a guessed Class 3 title — "only
   rename what the current spec's own preview actually names" means
   there is nothing to rename this time. Level 3 currently shows
   exactly its two real classes and no "Coming Soon" placeholder;
   one will reappear once a future spec names what Class 3 is.

   REUSES THE EXISTING SONG, A SIXTH TIME. Section 5's "short
   original melody or an appropriately licensed existing song... do
   not use copyrighted recordings or lyrics without appropriate
   rights" points straight at "ಓ ನನ್ನ ಚೇತನ" (`window.SONGS[0]`) again
   — the same one practice song every Level 3/late-Level-2 class has
   used, which is the user's own content, not a third-party
   copyrighted recording.

   THE PHRASE-MOVEMENT TABLE (Section 4) IS COMPUTED FROM THE REAL
   SONG, NOT HAND-WRITTEN. `classifyMovement(phrase)` looks at a
   phrase's own three beat pitches and honestly derives "Ascending" /
   "Descending" / "Repeated" / "Mixed" from them — the same kind of
   honesty this project's audio-comparison features already hold to
   (no fabricated classification): for THIS song, every phrase
   happens to resolve to ascending, descending, or repeated (never
   "mixed") — a fact about the data, not a gap in the function, which
   still handles "mixed" correctly for a future song that has one.
   The Section 2 "identify whether the melody goes up, down, or stays
   the same" listening exercise reuses two of these same real,
   computed phrases rather than inventing audio for the exercise.

   Section 3's rhythm-tapping activity reuses `TapPad` (already built
   for Level 1's rhythm work) purely as a tactile "tap along" surface
   — no timing analysis or scoring is attached, since this class
   only asks the learner to notice rhythm, not be graded on it.

   Section 5 (Knowledge check) is a small, self-contained multiple-
   choice quiz with a correct answer and a short explanation per
   option — this app has no existing "plain text MCQ with feedback"
   component (`PitchExercise`/`ExerciseScore` is an audio ear-training
   engine with attempt/round scoring, a mismatch for 5 one-off
   conceptual questions), so this file defines its own small `QUIZ`
   array rather than reusing or forcing an unrelated component.

   Section 6's checklist is the spec's own six literal "I can..."
   items, used verbatim as the real completion checklist (unlike most
   Level 2 classes, whose spec gave only negative constraints and so
   needed a self-authored checklist) — no self-authoring needed this
   time, since the spec already wrote one.

   Honesty boundaries, matching every earlier class and this spec's
   own instructions: no automatic melody transcription, pitch
   detection, or audio analysis of the learner's own singing — the
   phrase-movement classification only ever describes the REFERENCE
   song's own already-known pitches, never anything heard from a
   microphone.

   Reuses: LessonKit (+ its automatic Warm-up card), `SongLessonKit`'s
   exported functions (`songPlaybackPlan`, `timelineToEvents`) and
   `window.SONGS[0]` (Level 2 Classes 23-25 / Level 3 Class 1's reuse
   pattern, continued), `TapPad` (Level 1's rhythm work), `PianoSynth`
   (Level 1 Class 24 / Level 2 Classes 15-25), `RecordingCard` (Class
   5), `PersonalNotes`, `ClassProgress`.
   ============================================================ */

const MelodyAnalysisPhraseMappingLesson = (() => {
  const STAGES = [
    { id: "phrase", label: "Phrase" },
    { id: "movement", label: "Movement" },
    { id: "rhythm", label: "Rhythm" },
    { id: "mapping", label: "Mapping" },
    { id: "guided", label: "Guided" },
    { id: "quiz", label: "Quiz" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const SONG_HREF = "#/songs/oo-nanna-chetana";
  const SONG = window.SONGS && window.SONGS[0];

  // [label, degrees] — purely abstract illustrations, not tied to any key or to the
  // practice song; degrees are relative semitone steps for a short demo tone only.
  const ILLUSTRATIONS = [
    { key: "ascending", label: "Ascending", example: "C → D → E", degrees: [0, 2, 4] },
    { key: "descending", label: "Descending", example: "E → D → C", degrees: [4, 2, 0] },
    { key: "repeated", label: "Repeated", example: "C → C → C", degrees: [0, 0, 0] },
  ];

  const MOVEMENT_LABEL = { ascending: "Ascending", descending: "Descending", repeated: "Repeated", mixed: "Mixed" };
  const MOVEMENT_OBSERVATION = {
    ascending: "Melody rises", descending: "Melody comes down", repeated: "Similar notes repeat", mixed: "Melody changes direction",
  };

  /** Honestly derives the real reference song's own movement for one phrase — never a
   *  guess, and never applied to anything the learner sings. */
  function classifyMovement(phrase) {
    const midis = phrase.beats.map((b) => b.midi);
    const allSame = midis.every((m) => m === midis[0]);
    if (allSame) return "repeated";
    const nonDecreasing = midis.every((m, i) => i === 0 || m >= midis[i - 1]);
    const nonIncreasing = midis.every((m, i) => i === 0 || m <= midis[i - 1]);
    if (nonDecreasing && midis[midis.length - 1] > midis[0]) return "ascending";
    if (nonIncreasing && midis[midis.length - 1] < midis[0]) return "descending";
    return "mixed";
  }

  // Every phrase across both lines, flattened with a global index for addressing.
  function allPhrases() {
    if (!SONG) return [];
    const out = [];
    SONG.lines.forEach((line, li) => line.phrases.forEach((ph, pi) => out.push({ line: li, phrase: pi, label: ph.label, movement: classifyMovement(ph) })));
    return out;
  }

  const QUIZ = [
    {
      key: "whatIsPhrase", q: "What is a musical phrase?",
      options: [
        { key: "a", label: "A short musical idea, similar to a sentence in speech", correct: true, explain: "Right — a phrase is a short musical idea, the way a sentence is a short piece of speech." },
        { key: "b", label: "The entire song from start to finish", correct: false, explain: "Not quite — that's the whole song. A phrase is one small piece of it." },
        { key: "c", label: "Only the rhythm of a song", correct: false, explain: "Not quite — rhythm is a separate thing from melody; a phrase includes both." },
      ],
    },
    {
      key: "ascendingMeans", q: "What does an ascending melody mean?",
      options: [
        { key: "a", label: "The notes move higher", correct: true, explain: "Right — ascending means the notes rise." },
        { key: "b", label: "The notes move lower", correct: false, explain: "That's descending, not ascending." },
        { key: "c", label: "The same note repeats", correct: false, explain: "That's a repeated pattern, not ascending." },
      ],
    },
    {
      key: "descendingMeans", q: "What does a descending melody mean?",
      options: [
        { key: "a", label: "The notes move lower", correct: true, explain: "Right — descending means the notes fall." },
        { key: "b", label: "The notes move higher", correct: false, explain: "That's ascending, not descending." },
        { key: "c", label: "The tempo slows down", correct: false, explain: "Descending describes pitch direction, not speed." },
      ],
    },
    {
      key: "rhythmTellsUs", q: "What does rhythm tell us?",
      options: [
        { key: "a", label: "When notes happen and how long they last", correct: true, explain: "Right — rhythm is about timing and duration, separate from pitch." },
        { key: "b", label: "Which notes are higher or lower", correct: false, explain: "That's melody, not rhythm." },
        { key: "c", label: "The meaning of the lyrics", correct: false, explain: "That's a separate part of understanding a song." },
      ],
    },
    {
      key: "whyPhrases", q: "Why is it useful to divide a song into phrases?",
      options: [
        { key: "a", label: "It makes practising one small piece at a time easier", correct: true, explain: "Right — practising phrase by phrase is far more manageable than the whole song at once." },
        { key: "b", label: "It makes the song shorter", correct: false, explain: "Dividing into phrases doesn't change the song's length — it just makes practice easier." },
        { key: "c", label: "It's required before any singing can begin", correct: false, explain: "It's a helpful approach, not a strict requirement." },
      ],
    },
  ];

  const CHECKLIST_ITEMS = [
    { key: "recognisePhrase", label: "I can recognise a musical phrase." },
    { key: "identifyBoundaries", label: "I can identify where a phrase begins and ends." },
    { key: "recogniseMovement", label: "I can recognise upward and downward melody movement." },
    { key: "noticeRepeats", label: "I can notice repeated notes." },
    { key: "tapRhythm", label: "I can tap the rhythm separately from singing." },
    { key: "practisePhraseByPhrase", label: "I can practise a melody phrase by phrase." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};

  const take = (rec, k) => A(rec, "recs")[k] || null;
  const checklist = (rec) => A(rec, "checklist");
  const phraseGuess = (rec, k) => A(rec, "phraseGuess")[k] || null;
  const quizAnswer = (rec, k) => A(rec, "quiz")[k] || null;

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 3, Class 2 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Understand first, sing second.</p>
        <p class="text-sm text-ink-300">A song is organised into small, learnable phrases — hearing how each one moves, before singing it, makes the whole song far more approachable.</p>
      </div>`;
  }

  function renderComplete(cls, rec, status) {
    const next = LessonKit.nextClass(cls);
    const all = PROGRESS_ITEMS.every((i) => rec.checkpoints[i.key]);
    const lines = PROGRESS_ITEMS.map((i) => `
      <li class="flex items-center gap-2.5 text-sm ${rec.checkpoints[i.key] ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${rec.checkpoints[i.key] ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${rec.checkpoints[i.key] ? icon("check", "w-3 h-3") : ""}</span>${i.label}
      </li>`).join("");
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A listening-first way to break a song into manageable pieces.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            ${next ? `
            <div class="mt-6">
              <p class="text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-1">Next class</p>
              <p class="font-display text-lg text-ink-50 mb-4">Class ${next.number} — ${next.title}</p>
              <div class="flex flex-wrap justify-center gap-3">
                <a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Continue to Class ${next.number} ${icon("arrowRight", "w-3.5 h-3.5")}</a>
                <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</a>
              </div>
            </div>` : `<p class="text-xs text-ink-500 mt-6">The next Level 3 class hasn't been added yet.</p>`}
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
      </div>`;
  }

  function progressStats(cls) {
    return [{ label: "Reflections", value: ClassActivity.get(cls.id).checkpoints.reflected ? 1 : 0 }];
  }

  function openLink(label) {
    return `<a href="${SONG_HREF}" class="vr-btn vr-btn-gold">${icon("arrowRight", "w-4 h-4")} ${label}</a>`;
  }

  function quizHtml(rec) {
    return QUIZ.map((item) => {
      const chosen = quizAnswer(rec, item.key);
      const picked = chosen ? item.options.find((o) => o.key === chosen) : null;
      return `
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4" data-quiz="${item.key}">
          <p class="text-sm text-ink-100 font-display mb-2">${item.q}</p>
          <div class="flex flex-col gap-1.5">
            ${item.options.map((o) => `
              <button type="button" data-quiz-choice="${o.key}" ${chosen ? "disabled" : ""} class="ex-chip !justify-start !text-left ${chosen === o.key ? (o.correct ? "!border-emerald-400/50 !text-emerald-200" : "!border-red-400/40 !text-red-200") : ""}">${o.label}</button>
            `).join("")}
          </div>
          ${picked ? `<p class="text-xs mt-2 ${picked.correct ? "text-emerald-300" : "text-amber-300"}">${picked.explain}</p>` : ""}
        </div>`;
    }).join("");
  }

  function phraseMapHtml(rec) {
    return allPhrases().map((ph, i) => `
      <tr class="border-t border-white/5">
        <td class="py-2 pr-3 text-ink-100 font-display">${ph.label}</td>
        <td class="py-2 pr-3 text-ink-50">${MOVEMENT_LABEL[ph.movement]}</td>
        <td class="py-2 pr-3 text-ink-400">${MOVEMENT_OBSERVATION[ph.movement]}</td>
        <td class="py-2">
          <div class="flex flex-wrap gap-1.5" data-phrase-guess="${i}">
            ${["ascending", "descending", "repeated", "mixed"].map((k) => `<button type="button" data-guess-choice="${k}" class="ex-chip !text-[11px] !px-2 !py-1 ${phraseGuess(rec, i) === k ? "is-selected" : ""}">${MOVEMENT_LABEL[k]}</button>`).join("")}
          </div>
        </td>
      </tr>`).join("");
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const c = checklist(rec);
    const growth = A(rec, "growth");
    const phrases = allPhrases();

    if (!SONG) {
      return `
      <div class="pitch-lesson">
        ${LessonKit.header(cls, status, pct)}
        <div class="max-w-3xl mx-auto px-5 py-20 text-center">
          <p class="text-sm text-ink-400">This class studies the song in Song Learning &amp; Application, which doesn't seem to be available right now.</p>
        </div>
      </div>`;
    }

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("phrase", 1, "Section 1 — What is a melody phrase?", `
          ${narrow(`
            ${p("A melody is made up of smaller musical ideas. Each small musical idea is called a phrase — similar to a sentence in speech. A pause, or a musical ending, is often what helps you recognise where one phrase finishes and the next begins.")}
            ${p("A singer can practise each phrase separately before connecting them — that's the whole idea behind this class.")}
          `)}
          <div class="grid sm:grid-cols-3 gap-3">
            ${phrases.slice(0, 3).map((ph, i) => `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                <p class="text-[11px] uppercase tracking-wider text-ink-500 mb-2">Phrase ${i + 1}</p>
                <button type="button" data-play-phrase="${i}" class="vr-btn !text-xs">${icon("play", "w-3.5 h-3.5")} Listen</button>
              </div>`).join("")}
          </div>
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `, { wide: true })}

        ${chapter("movement", 2, "Section 2 — Understand the movement of a melody", `
          ${narrow(`
            ${p("Three basic ways a melody can move:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-2">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Ascending:</strong> notes move higher — for example, C → D → E.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Descending:</strong> notes move lower — for example, E → D → C.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Repeated:</strong> the same note repeats — for example, C → C → C.</li>
            </ul>
            ${p("These are just simple examples, not a requirement to sing in any particular key.")}
          `)}
          <div class="flex flex-wrap gap-3 mb-5">
            ${ILLUSTRATIONS.map((i) => `<button type="button" data-play-illustration="${i.key}" class="vr-btn !text-xs">${icon("play", "w-3.5 h-3.5")} ${i.label} (${i.example})</button>`).join("")}
          </div>
          ${narrow(p("A short listening exercise: play each phrase below, then guess how it moves before checking."))}
          <div class="grid sm:grid-cols-2 gap-3">
            ${phrases.slice(1, 3).map((ph, idx) => {
              const i = idx + 1;
              const guess = phraseGuess(rec, `guess${i}`);
              return `
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4" data-guess-exercise="${i}">
                <button type="button" data-play-phrase="${i}" class="vr-btn !text-xs mb-3">${icon("play", "w-3.5 h-3.5")} Listen to this phrase</button>
                <div class="flex flex-wrap gap-1.5 mb-2">
                  ${["ascending", "descending", "repeated"].map((k) => `<button type="button" data-guess-answer="${k}" ${guess ? "disabled" : ""} class="ex-chip !text-xs ${guess === k ? (k === ph.movement ? "!border-emerald-400/50 !text-emerald-200" : "!border-red-400/40 !text-red-200") : ""}">${MOVEMENT_LABEL[k]}</button>`).join("")}
                </div>
                ${guess ? `<p class="text-xs ${guess === ph.movement ? "text-emerald-300" : "text-amber-300"}">${guess === ph.movement ? "That's right" : `Actually ${MOVEMENT_LABEL[ph.movement]}`} — ${MOVEMENT_OBSERVATION[ph.movement]}.</p>` : ""}
              </div>`;
            }).join("")}
          </div>
        `, { wide: true })}

        ${chapter("rhythm", 3, "Section 3 — Listen for rhythm separately from melody", `
          ${narrow(`
            ${p("Melody tells you which notes move higher or lower. Rhythm tells you when, and for how long, those notes are sung. Notice short notes, long notes, pauses, and any rhythmic pattern that repeats.")}
          `)}
          <div class="flex justify-center mb-5">${TapPad.render("l3c02-tappad", { label: "TAP" })}</div>
          <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3 max-w-xl mx-auto">
            ${["Listen to a short phrase below.", "Tap its rhythm above, without singing.", "Listen again and follow the melody.", "Hum the phrase comfortably."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
          </ol>
          <div class="flex flex-wrap justify-center gap-3">
            <button type="button" data-play-phrase="0" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen</button>
          </div>
        `)}

        ${chapter("mapping", 4, "Section 4 — Learn to map a song", `
          ${narrow(p("Every phrase in this song, listened to and classified — a listening map, not a complete musical transcription. Listen to each one, then try your own guess before comparing it with what's shown."))}
          <table class="w-full text-sm border-collapse mb-2">
            <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500">
              <th class="text-left py-1.5 pr-3">Phrase</th><th class="text-left py-1.5 pr-3">Melody movement</th><th class="text-left py-1.5 pr-3">Observation</th><th class="text-left py-1.5">Your guess</th>
            </tr></thead>
            <tbody data-phrase-map>${phraseMapHtml(rec)}</tbody>
          </table>
          <p class="text-xs text-ink-500">Tap a phrase's row in Section 1 or 3 to hear it, then come back and guess.</p>
        `, { wide: true })}

        ${chapter("guided", 5, "Section 5 — Practical guided exercise", `
          ${narrow(p("Put it all together, one phrase at a time:"))}
          <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-4">
            ${["Listen to the complete song once, without singing.", "Listen again and notice where each phrase ends.", "Mark each phrase separately (Section 4, above).", "Notice whether each phrase moves up, down, or repeats.", "Tap the rhythm (Section 3, above).", "Hum each phrase on its own.", "Practise connecting the phrases."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
          </ol>
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the complete song</button>
            <button type="button" data-play-scope="0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line 1</button>
            <button type="button" data-play-scope="1" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line 2</button>
          </div>
          ${RecordingCard.render("rc-phraseTake", { title: "Practise connecting a couple of phrases", hint: "Entirely optional — you can complete this class without recording.", maxSeconds: 25, section: false })}
          <div data-review-host class="mt-3"></div>
          <div class="flex flex-wrap gap-3 mt-3">${openLink(`Open "${SONG.titleTransliteration}" for full practice`)}</div>
        `, { wide: true })}

        ${chapter("quiz", 6, "Knowledge check", `
          ${narrow(p("Beginner-friendly, not a test to worry about — pick an answer to see why it's right or not."))}
          <div class="flex flex-col gap-3" data-quiz-host>${quizHtml(rec)}</div>
        `)}

        ${chapter("reflect", 7, "Reflection", `
          ${narrow(`<div><label class="block text-sm text-ink-200 mb-1.5" for="l3c02-reflect">What did you notice about the melody when you listened carefully instead of immediately trying to sing it?</label><textarea id="l3c02-reflect" data-growth="reflection" rows="3" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.reflection || "")}</textarea></div>`)}
        `)}

        ${chapter("complete", 8, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l3c02", { placeholder: "e.g. Which phrase's direction surprised me... What the rhythm felt like separately from the melody..." })}
        `)}

        ${chapter("complete", 9, "Checklist and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: this class is about listening and musical understanding, not vocal range — don't force high or low notes, avoid shouting or pushing the voice, and take breaks between exercises. Stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    if (!SONG) { cleanups.push(LessonKit.wireStepper(container)); return () => cleanups.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } }); }

    const phrases = allPhrases();

    /* ---- Section 1/2/3: individual phrase + scope playback ---- */
    function onPlayPhrase(e) {
      const btn = e.target.closest("[data-play-phrase]");
      if (!btn) return;
      const ph = phrases[Number(btn.dataset.playPhrase)];
      if (!ph) return;
      const plan = SongLessonKit.songPlaybackPlan(SONG, { line: ph.line, phrase: ph.phrase });
      PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, 60 / 70), { gap: 0 });
    }
    container.addEventListener("click", onPlayPhrase);
    cleanups.push(() => container.removeEventListener("click", onPlayPhrase));

    function onPlayScope(e) {
      const btn = e.target.closest("[data-play-scope]");
      if (!btn) return;
      const raw = btn.dataset.playScope;
      const scope = raw === "both" ? "both" : Number(raw);
      const plan = SongLessonKit.songPlaybackPlan(SONG, scope);
      PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, 60 / 70), { gap: 0 });
    }
    container.addEventListener("click", onPlayScope);
    cleanups.push(() => container.removeEventListener("click", onPlayScope));

    /* ---- Section 2: abstract ascending/descending/repeated illustrations ---- */
    function onPlayIllustration(e) {
      const btn = e.target.closest("[data-play-illustration]");
      if (!btn) return;
      const item = ILLUSTRATIONS.find((i) => i.key === btn.dataset.playIllustration);
      if (!item) return;
      PianoSynth.playSequence(item.degrees.map((d) => 60 + d), { duration: 0.55, gap: 0.2 });
    }
    container.addEventListener("click", onPlayIllustration);
    cleanups.push(() => container.removeEventListener("click", onPlayIllustration));

    /* ---- Section 2: guess-the-movement listening exercise ---- */
    function onGuessAnswer(e) {
      const btn = e.target.closest("[data-guess-answer]");
      if (!btn) return;
      const host = btn.closest("[data-guess-exercise]");
      if (!host) return;
      const i = Number(host.dataset.guessExercise);
      set("phraseGuess", `guess${i}`, btn.dataset.guessAnswer);
      refreshLive();
      const section = $(".pitch-lesson") || container;
      const fresh = section.querySelector(`[data-guess-exercise="${i}"]`);
      // the whole stage re-renders via refreshLive only for progress/complete hosts, so
      // patch this one exercise's markup in place instead of a full page re-render.
      if (fresh) {
        const rec = rec0();
        const guess = phraseGuess(rec, `guess${i}`);
        const ph = phrases[i];
        fresh.querySelectorAll("[data-guess-answer]").forEach((b) => {
          b.disabled = true;
          b.classList.toggle("!border-emerald-400/50", b.dataset.guessAnswer === guess && guess === ph.movement);
          b.classList.toggle("!text-emerald-200", b.dataset.guessAnswer === guess && guess === ph.movement);
          b.classList.toggle("!border-red-400/40", b.dataset.guessAnswer === guess && guess !== ph.movement);
          b.classList.toggle("!text-red-200", b.dataset.guessAnswer === guess && guess !== ph.movement);
        });
        let feedback = fresh.querySelector("p[data-guess-feedback]");
        if (!feedback) {
          feedback = document.createElement("p");
          feedback.dataset.guessFeedback = "1";
          feedback.className = "text-xs mt-1";
          fresh.appendChild(feedback);
        }
        const right = guess === ph.movement;
        feedback.className = `text-xs mt-1 ${right ? "text-emerald-300" : "text-amber-300"}`;
        feedback.textContent = `${right ? "That's right" : `Actually ${MOVEMENT_LABEL[ph.movement]}`} — ${MOVEMENT_OBSERVATION[ph.movement]}.`;
      }
    }
    container.addEventListener("click", onGuessAnswer);
    cleanups.push(() => container.removeEventListener("click", onGuessAnswer));

    /* ---- Section 3: tap pad (tactile only, no timing analysis) ---- */
    cleanups.push(TapPad.wire(container, "l3c02-tappad", { now: () => performance.now() / 1000, onTap: () => {} }));

    /* ---- Section 4: phrase-mapping table, learner's own guesses ---- */
    function onMapGuess(e) {
      const btn = e.target.closest("[data-guess-choice]");
      if (!btn) return;
      const group = btn.closest("[data-phrase-guess]");
      if (!group) return;
      set("phraseGuess", group.dataset.phraseGuess, btn.dataset.guessChoice);
      const host = $("[data-phrase-map]");
      if (host) host.innerHTML = phraseMapHtml(rec0());
    }
    container.addEventListener("click", onMapGuess);
    cleanups.push(() => container.removeEventListener("click", onMapGuess));

    /* ---- Section 5: recording ---- */
    function reviewHtml(rec) {
      const t = take(rec, "phraseTake");
      if (!t) return "";
      return `<button type="button" data-play-review="phraseTake" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Listen back</button>`;
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    own(RecordingCard.wire(container, "rc-phraseTake", {
      classId, take: take(rec0(), "phraseTake"), maxSeconds: 25,
      meta: { name: "Level 3, Class 2 — Connecting phrases", exercise: "melody-analysis-phrase-mapping-phraseTake" },
      onSaved: (t) => { set("recs", "phraseTake", t); ClassActivity.bump(classId, "recordings"); refreshReviewHost(); },
    }));
    refreshReviewHost();
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- Section 6: quiz ---- */
    function onQuizChoice(e) {
      const btn = e.target.closest("[data-quiz-choice]");
      if (!btn) return;
      const group = btn.closest("[data-quiz]");
      if (!group || group.querySelector("[data-quiz-choice]:disabled")) return;
      set("quiz", group.dataset.quiz, btn.dataset.quizChoice);
      const host = $("[data-quiz-host]");
      if (host) host.innerHTML = quizHtml(rec0());
    }
    container.addEventListener("click", onQuizChoice);
    cleanups.push(() => container.removeEventListener("click", onQuizChoice));

    /* ---- reflection textarea ---- */
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
    own(PersonalNotes.wire(container, "notes-l3c02", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

    /* ---- completion ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-class]");
      if (!btn || btn.disabled) return;
      const rec = rec0();
      Store.completeClass(classId);
      ClassActivity.markCompleted(classId);
      Store.addJournalEntry({
        classId,
        classTitle: `Level 3, Class ${cls.number} — ${cls.title}`,
        learned: "A song is organised into small phrases, each with its own melodic movement and rhythm — understanding that structure before singing makes the whole song far more approachable.",
        struggled: "",
        toPractice: A(rec, "growth").reflection || "",
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
