/* ============================================================
   LEVEL 2, CLASS 23 — SONG PRACTICE WORKSHOP (interactive lesson)

   Rendered by ClassDetailPage for interactive: "song-practice-workshop".

   Curriculum identity: Level 2, Class 23 (`number: 23`, `levelId: 2`
   in data.js, id `L2C23`). Same mechanism Classes 1-22 already
   proved twenty-two times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Personal Vocal Style" during Class 22's turn), so nothing needed
   renaming or adding to bring Class 23 itself onto the page.

   This spec's own "Next class preview" names the real Class 24 as
   "Performance Preparation" — `levelClassDefs[2]` is renamed in
   place again, the same precedent every class since 5 has followed.

   REUSES THE EXISTING SONG, NOT A NEW ONE. The spec's own Section 4
   says to use an existing suitable practice song before inventing
   one — "ಓ ನನ್ನ ಚೇತನ" (`window.SONGS[0]`, built earlier this session
   as the standalone, non-numbered "Song Learning & Application"
   section) already has a verified teacher-provided phrase/beat
   mapping, a central BPM playback engine, live highlighting, tempo
   control, and recording+comparison — exactly what this spec asks
   for. Building a second one here would be the "duplicate
   functionality" every spec in this session has asked NOT to build.

   DESIGN: a genuine Level 2 class, tracked through `ClassActivity`/
   `Store.completeClass` like every other Level 2 class (NOT through
   `SongActivity`, which is the Song Learning section's own, separate,
   non-numbered progress store) — but its hands-on phrase/rhythm/
   tempo/highlighting/recording work happens in the REAL, already-
   built Song Learning page (`#/songs/oo-nanna-chetana`), which this
   class deep-links to rather than re-implementing. What IS built
   directly here reuses `SongLessonKit`'s own exported PURE functions
   (`songPlaybackPlan`, `timelineToEvents`, `rhythmTableHtml`,
   `allSyllables`) to give real, honest audio demonstrations (full
   song, single phrases, connecting lines) and a real, tappable
   rhythm grid — never a second, parallel engine.

   Honesty boundaries, matching every earlier class and the spec's
   own Section 5 instructions: no fake synchronisation, no simulated
   pitch detection, no automatic singing evaluation, and no voice-
   quality score — this class only ever plays real reference audio
   through the same engine the Song Learning page already uses.
   Completion never requires a perfect recording (the spec says this
   explicitly) — and this class deliberately has no recording slot of
   its own; recording happens through the existing Song Learning page
   so there's one recording per song, not two disconnected ones.

   This spec gives its Section 6 self-review as eight literal
   first-person prompts — six yes/mostly/no-shaped become
   `SelfAssessment` chips, the two genuinely open ones ("which part
   was easiest," "which part needs more practice") become textareas.
   Kept separate from the completion checklist, which this file
   self-authors as a 5-item plain-checkbox list (Class 10's
   `PRE_CHECK_ITEMS` style), since "Completion must not require a
   perfect song recording" is a negative constraint again.

   Section 5 ("Apply Vocal Techniques") explicitly calls back to the
   real, already-built classes each skill came from (Register
   Transitions, Resonance & Tone Colour, Articulation and Style,
   Vocal Dynamics Control, Expressive Singing Foundations, Personal
   Vocal Style) — a genuine capstone callback, not invented class
   names.

   Reuses: LessonKit (+ its automatic Warm-up card), `SongLessonKit`'s
   exported pure functions (new reuse — the first Level 2 class to
   call into it), `PianoSynth.playSequence` (Level 1 Class 24 /
   Classes 15-22), `SelfAssessment` (Class 4), `PersonalNotes`,
   `ClassProgress`.
   ============================================================ */

const SongPracticeWorkshopLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "structure", label: "Structure" },
    { id: "phrases", label: "Phrases" },
    { id: "rhythm", label: "Rhythm" },
    { id: "technique", label: "Technique" },
    { id: "connect", label: "Connect" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const WORKSHOP_BPM = 75; // a comfortable, unhurried demonstration tempo for this workshop
  const SONG_HREF = "#/songs/oo-nanna-chetana";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the listen-before-singing, phrase-by-phrase approach." },
    { key: "triedPhrases", label: "I practised at least one phrase on its own, or chose to skip it." },
    { key: "triedRhythm", label: "I tried the rhythm practice, or chose to skip it." },
    { key: "triedConnecting", label: "I tried connecting two or more phrases, or chose to skip it." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    understoodMelody: { question: "Did I understand the melody?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    followedRhythm: { question: "Could I follow the rhythm?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    practisedPhraseByPhrase: { question: "Did I practise phrase by phrase?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    breathedComfortably: { question: "Did I breathe comfortably?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    wordsClear: { question: "Were the words clear?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    connectedPhrases: { question: "Could I connect the phrases?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center gap-2 my-3">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  const q = (rec, k) => A(rec, "q")[k] || null;
  const checklist = (rec) => A(rec, "checklist");
  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 25 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Everything you've learned, put together.</p>
        <p class="text-sm text-ink-300">A complete song is just many small, already-familiar pieces — breathing, pitch, rhythm, words, and feeling — practised one phrase at a time, then gently connected.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 26 — Performance Preparation</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson is about preparing mentally and technically before presenting a song to an audience.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first full run-through of the workshop process.</h3>
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
    return [{ label: "Reflections", value: ClassActivity.get(cls.id).checkpoints.reflected ? 1 : 0 }];
  }

  /* ---------- the one reference song this workshop practises on ---------- */
  const SONG = window.SONGS && window.SONGS[0];

  function openSongLink(label) {
    return `<a href="${SONG_HREF}" class="vr-btn vr-btn-gold">${icon("arrowRight", "w-4 h-4")} ${label}</a>`;
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const sel = (k) => q(rec, k);
    const c = checklist(rec);
    const growth = A(rec, "growth");

    if (!SONG) {
      return `
      <div class="pitch-lesson">
        ${LessonKit.header(cls, status, pct)}
        <div class="max-w-3xl mx-auto px-5 py-20 text-center">
          <p class="text-sm text-ink-400">This workshop practises on the song in the Song Learning &amp; Application section, which doesn't seem to be available right now.</p>
        </div>
      </div>`;
    }

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section 1 — Preparing to learn a song", `
          ${narrow(`
            ${p("Before singing a single note, it helps to just listen — to its overall mood, its melody and rhythm, where phrases naturally end, and where a comfortable breath could fit. This workshop practises on the song from Song Learning &amp; Application: “" + SONG.titleTransliteration + ".”")}
          `)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the complete song</button>
          </div>
          ${narrow(`
            <div class="grid sm:grid-cols-2 gap-3 mt-2">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c23-mood">What mood or feeling did you notice?</label><textarea id="l2c23-mood" data-growth="mood" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.mood || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c23-boundaries">Where did you notice a phrase ending or a natural breath?</label><textarea id="l2c23-boundaries" data-growth="boundaries" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.boundaries || "")}</textarea></div>
            </div>
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("structure", 2, "Section 2 — Understanding the song structure", `
          ${narrow(p("A song is built from lines, and each line is built from short phrases — some of them repeat similar melodic shapes. Each line here ends with a short pause, a comfortable place to breathe before the next line begins."))}
          ${SONG.lines.map((line, i) => `
            <div class="mb-2">
              <p class="text-xs text-ink-500 mb-1">Line ${i + 1}</p>
              ${flowStrip([...line.phrases.map((ph) => ph.label), "(pause)"])}
            </div>`).join("")}
          ${narrow(p("That's the whole shape of the song — a small number of short phrases, each one manageable on its own."))}
        `, { wide: true })}

        ${chapter("phrases", 3, "Section 3 — Learn one phrase at a time", `
          ${narrow(p("Play any phrase below on its own, as many times as you'd like — there's no need to sing the whole song yet. Each one shows its own lyric and note."))}
          <div class="flex flex-col gap-4">
            ${SONG.lines.map((line, li) => `
              <div>
                <p class="text-xs text-ink-500 mb-2">Line ${li + 1}</p>
                <div class="flex flex-wrap gap-2">
                  ${line.phrases.map((ph, pi) => `
                    <button type="button" data-play-scope="${li}:${pi}" class="vr-btn">
                      ${icon("play", "w-3.5 h-3.5")} ${ph.label}
                    </button>`).join("")}
                </div>
              </div>`).join("")}
          </div>
          ${narrow(p("Once a phrase feels familiar, try singing along quietly with it before moving to the next one."))}
        `)}

        ${chapter("rhythm", 4, "Section 4 — Rhythm and timing practice", `
          ${narrow(p("Tap out the beat below before you sing it — clap or tap along, then try speaking the lyrics in rhythm, and finally sing the phrase with the reference. Tap any beat to hear it on its own."))}
          <div data-rhythm-host></div>
        `, { wide: true })}

        ${chapter("technique", 5, "Section 5 — Apply what you've already learned", `
          ${narrow(`
            ${p("A complete song is a chance to bring together skills from across Level 2, gently — not to demand a perfect performance of all of them at once:")}
            <ul class="flex flex-col gap-1.5 text-sm text-ink-300 mb-2">
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Breathing:</strong> breathe comfortably between phrases, using the breathing habits from Foundation.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Pitch:</strong> listen carefully and follow the melody, as in Register Transitions and Controlled Range Development.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Resonance:</strong> keep a relaxed, comfortable tone, as in Resonance and Resonance &amp; Tone Colour.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Transitions:</strong> connect nearby notes smoothly, as in Register Transitions and Coordination.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Articulation:</strong> pronounce words clearly without interrupting the melody, as in Articulation and Style.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Dynamics:</strong> not every phrase needs the same intensity, as in Vocal Dynamics Control.</li>
              <li class="flex gap-2"><span class="text-gold-400">•</span><strong class="text-ink-100">Expression:</strong> think about what the words mean, as in Expressive Singing Foundations and Personal Vocal Style.</li>
            </ul>
            ${p("No single one of these needs to be perfect today — just worth keeping in mind as you practise.")}
          `)}
        `)}

        ${chapter("connect", 6, "Section 6 — Connect the phrases", `
          ${narrow(p("Once a couple of phrases feel familiar on their own, try connecting them — a whole line, then both lines together. Pause and repeat any part that still feels unfamiliar; there's no need to rush to the full song."))}
          <div class="flex flex-wrap gap-3">
            ${SONG.lines.map((_, i) => `<button type="button" data-play-scope="${i}" class="vr-btn">${icon("play", "w-4 h-4")} Line ${i + 1}</button>`).join("")}
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Both lines, connected</button>
          </div>
        `)}

        ${chapter("practice", 7, "Section 7 — Complete song practice", `
          ${narrow(`
            ${p("The full practice experience — with tempo selection, the Sing Along readout highlighting each syllable and note as it plays, and recording with playback — already lives in Song Learning &amp; Application. Open it below to attempt the complete song, with the reference first and then on your own.")}
          `)}
          <div class="flex flex-wrap gap-3">
            ${openSongLink(`Open "${SONG.titleTransliteration}" for complete practice`)}
          </div>
          ${narrow(p("Recording there is entirely optional, and it's the same recording this workshop's reflection below refers to — there's no second, separate recording here."))}
        `)}

        ${chapter("reflect", 8, "Self-review and reflection", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("understoodMelody-q", { ...Q.understoodMelody, selected: sel("understoodMelody") })}
              ${SelfAssessment.render("followedRhythm-q", { ...Q.followedRhythm, selected: sel("followedRhythm") })}
              ${SelfAssessment.render("practisedPhraseByPhrase-q", { ...Q.practisedPhraseByPhrase, selected: sel("practisedPhraseByPhrase") })}
              ${SelfAssessment.render("breathedComfortably-q", { ...Q.breathedComfortably, selected: sel("breathedComfortably") })}
              ${SelfAssessment.render("wordsClear-q", { ...Q.wordsClear, selected: sel("wordsClear") })}
              ${SelfAssessment.render("connectedPhrases-q", { ...Q.connectedPhrases, selected: sel("connectedPhrases") })}
            </div>
            <div class="grid sm:grid-cols-2 gap-3 mt-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c23-easiest">Which part was easiest?</label><textarea id="l2c23-easiest" data-growth="easiest" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.easiest || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l2c23-needsPractice">Which part needs more practice?</label><textarea id="l2c23-needsPractice" data-growth="needsPractice" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.needsPractice || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l2c23", { placeholder: "e.g. Which phrase connected most smoothly... What I want to try next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't require a perfect song recording.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: keep the song within a comfortable range, don't force high or low notes, take breaks between repetitions, and never sing through fatigue. Stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    /* ---- Section 4: the real rhythm grid, reused as-is ---- */
    const rhythmHost = $("[data-rhythm-host]");
    if (rhythmHost) rhythmHost.innerHTML = SONG.lines.map((_, i) => SongLessonKit.rhythmTableHtml(SONG, i)).join("");

    /* ---- Sections 1/3/4/6/7: real reference playback, one shared helper ---- */
    function playScope(raw) {
      let scope = raw;
      if (raw !== "both" && raw.includes(":")) {
        const [line, phrase] = raw.split(":").map(Number);
        scope = { line, phrase };
      } else if (raw !== "both") {
        scope = Number(raw);
      }
      const plan = SongLessonKit.songPlaybackPlan(SONG, scope);
      const unit = 60 / WORKSHOP_BPM;
      PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, unit), { gap: 0 });
    }
    function onPlayScope(e) {
      const btn = e.target.closest("[data-play-scope]");
      if (!btn) return;
      playScope(btn.dataset.playScope);
    }
    container.addEventListener("click", onPlayScope);
    cleanups.push(() => container.removeEventListener("click", onPlayScope));

    function onPlaySyllable(e) {
      const btn = e.target.closest("[data-play-syllable]");
      if (!btn) return;
      const syl = SongLessonKit.allSyllables(SONG)[Number(btn.dataset.playSyllable)];
      if (syl && syl.midi != null) PianoSynth.play(syl.midi, { duration: 1, velocity: 0.5 });
    }
    container.addEventListener("click", onPlaySyllable);
    cleanups.push(() => container.removeEventListener("click", onPlaySyllable));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "understoodMelody-q": "understoodMelody", "followedRhythm-q": "followedRhythm", "practisedPhraseByPhrase-q": "practisedPhraseByPhrase",
      "breathedComfortably-q": "breathedComfortably", "wordsClear-q": "wordsClear", "connectedPhrases-q": "connectedPhrases",
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

    /* ---- reflection textareas ---- */
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
    own(PersonalNotes.wire(container, "notes-l2c23", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "A complete song is many small, familiar phrases — breathing, pitch, rhythm, words, and feeling — practised one at a time and then gently connected.",
        struggled: q(rec, "connectedPhrases") && q(rec, "connectedPhrases") !== "yes" ? "Connecting the phrases together took more practice than any one phrase alone." : "",
        toPractice: A(rec, "growth").needsPractice || "",
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
      ClassActivity.flush();
    };
  }

  return { render, mount, PROGRESS_ITEMS };
})();
