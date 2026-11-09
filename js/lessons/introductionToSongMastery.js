/* ============================================================
   LEVEL 3, CLASS 1 — INTRODUCTION TO SONG MASTERY (interactive
   lesson)

   Rendered by ClassDetailPage for interactive: "introduction-to-song-mastery".

   Curriculum identity: Level 3, Class 1 (`number: 1`, `levelId: 3`
   in data.js, id `L3C01`) — the first class of a new level, same
   `id: L${levelId}C${number}` mechanism every class in this app
   already uses, never a global number ("Class 51").

   LEVEL 3 WAS RE-POINTED, NOT INVENTED HERE. Before this class,
   `APP_DATA.LEVELS[2]` (id 3) was titled "Musician" / "Theory & Keys"
   with music-theory skills, and `levelClassDefs[3]`'s placeholder
   titles were all music-theory topics ("Music Theory Basics",
   "Keyboard Fundamentals", "Scales"...) — set up before this session,
   unrelated to singing. Level 2's own Class 25 (built earlier this
   session) already previewed a DIFFERENT real Level 3 — "Song
   Mastery & Performance Development," with its own 8 suggested
   topics — as the user's own stated plan. This class's spec confirms
   that's genuinely what Level 3 is now, so `LEVELS[2]` and
   `levelClassDefs[3]` were both updated to match it, replacing the
   old theory-themed placeholder plan rather than leaving two
   contradictory plans for the same level number. Flagged clearly to
   the user rather than silently decided.

   This spec's own Section 9 ("Preview the next lesson") names the
   real Class 2 as "Melody Analysis and Phrase Mapping" —
   `levelClassDefs[3]` is renamed in place to that single title, the
   same one-step-at-a-time precedent every Level 2 class since 5 set.

   REUSES THE EXISTING SONG, A FIFTH TIME. Section 2's "use a suitable
   existing song" and Section 7's "select an available song or use
   the original practice melody" point straight at "ಓ ನನ್ನ ಚೇತನ"
   (`window.SONGS[0]`) — the same song Classes 23, 24, and 25 already
   reused via `SongLessonKit`'s exported functions. There is
   currently only one song in Song Learning & Application, so this
   class says so honestly (no fake "choose a song" picker with one
   real option dressed up as a menu).

   Section 3 ("if the selected song has known section markers,
   display them visually") is answered honestly for THIS song: "ಓ
   ನನ್ನ ಚೇತನ" is two short lines with no separate verse/chorus — it
   has no opening/verse/chorus/ending in the conventional sense. So
   this section explains the general vocabulary, says plainly that
   this particular song doesn't have those sections, and then shows
   the song's REAL structure instead — reusing Class 23's own
   phrase/gap visualisation (`flowStrip` per line) rather than
   fabricating a verse/chorus labelling that doesn't apply here.

   Section 4 ("notice whether notes move higher, lower, or repeat")
   reuses `SongLessonKit.melodyContourHtml(song)` directly — the real
   pitch-contour chart already built for the Melody stage of Song
   Learning & Application, not a redrawn one. Section 5 ("understand
   the meaning of each phrase") reuses the song's own real,
   previously-authored `meaning` data (word-by-word gloss, English
   translation, context) rather than inventing a new interpretation.

   Honesty boundaries, matching every earlier class: no automatic
   song-structure detection, lyric-sentiment analysis, or melody
   analysis — none of this exists in the codebase, and the spec
   explicitly forbids claiming it.

   Reuses: LessonKit (+ its automatic Warm-up card), `SongLessonKit`'s
   exported functions (`songPlaybackPlan`, `timelineToEvents`,
   `melodyContourHtml`) and `window.SONGS[0]`'s own `meaning` data
   (Classes 23-25's reuse pattern, continued into Level 3), `PianoSynth`
   (Level 1 Class 24 / Level 2 Classes 15-25), `RecordingCard` (Class
   5), `SelfAssessment` (Class 4), `PersonalNotes`, `ClassProgress`.
   ============================================================ */

const IntroductionToSongMasteryLesson = (() => {
  const STAGES = [
    { id: "intro", label: "Intro" },
    { id: "listen", label: "Listen" },
    { id: "structure", label: "Structure" },
    { id: "melody", label: "Melody" },
    { id: "lyrics", label: "Lyrics & Feeling" },
    { id: "plan", label: "Practice Plan" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const SONG_HREF = "#/songs/oo-nanna-chetana";
  const SONG = window.SONGS && window.SONGS[0];

  const PLAN_STEPS = [
    "Listen to the entire song.",
    "Practise the opening phrase.",
    "Practise the next phrase.",
    "Connect the phrases.",
    "Identify difficult sections.",
    "Repeat those sections slowly.",
    "Attempt the complete song.",
  ];

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand why a song is worth studying before singing it." },
    { key: "triedListening", label: "I listened to the complete reference song, or chose to skip it." },
    { key: "triedMelodyStudy", label: "I looked at how the melody moves, or chose to skip it." },
    { key: "triedPracticePlan", label: "I looked at the song practice plan, or chose not to." },
    { key: "reflected", label: "I reflected on the exercise, or chose not to." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    listenedFirst: { question: "Did I listen to the complete song before singing?", options: [opt("yes", "Yes", "good"), opt("partly", "Partly"), opt("no", "Not yet"), opt("unsure", "Not sure")] },
    identifiedSections: { question: "Could I identify its main sections?", options: [opt("yes", "Yes", "good"), opt("partly", "Partly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    understoodLyrics: { question: "Did I understand the lyrics?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
    identifiedPatterns: { question: "Could I identify repeated melodic patterns?", options: [opt("yes", "Yes", "good"), opt("somewhat", "Somewhat", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center gap-2 my-3">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;

  const take = (rec, k) => A(rec, "recs")[k] || null;
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
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 3, Class 1 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Studying a song is the first step toward owning it.</p>
        <p class="text-sm text-ink-300">Listening, understanding structure and meaning, and building a simple practice plan — this is what separates learning a song from truly understanding it.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 3, Class 2 — Melody Analysis and Phrase Mapping</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson goes deeper into breaking a song's melody into smaller musical phrases and understanding how those phrases connect.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A first, structured look at studying a complete song.</h3>
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

  function openLink(label) {
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
          <p class="text-sm text-ink-400">This class studies the song in Song Learning &amp; Application, which doesn't seem to be available right now.</p>
        </div>
      </div>`;
    }

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("intro", 1, "Section 1 — From singing exercises to complete songs", `
          ${narrow(`
            ${p("Practising individual vocal exercises builds coordination. Learning a song means getting its melody, rhythm, and words into your voice and memory. Understanding a song goes further — noticing its structure, its meaning, how its parts connect. Expressing a song is singing it in a way that reflects that understanding, not just reproducing the notes.")}
            ${p("Song mastery grows through all four together: listening, analysis, practice, and expression — not through technique alone.")}
            ${p(`There's currently one practice song available in Song Learning &amp; Application, “${SONG.titleTransliteration},” and this class studies it as a working example.`)}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section 2 — Listen before you sing", `
          ${narrow(p("Listen to the complete reference below without trying to sing along yet. Notice the overall mood, how the melody moves, the rhythm, anywhere a shape repeats, any change in intensity, and where each phrase seems to end."))}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the complete song</button>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-mood">What mood, and what changes in intensity, did you notice?</label><textarea id="l3c01-mood" data-growth="mood" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.mood || "")}</textarea></div>
            <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-boundaries">Where did a phrase seem to end, or a shape repeat?</label><textarea id="l3c01-boundaries" data-growth="boundaries" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.boundaries || "")}</textarea></div>
          </div>
        `, { wide: true })}

        ${chapter("structure", 3, "Section 3 — Understand the song structure", `
          ${narrow(`
            ${p("Songs are often described using sections like an opening, a verse, a chorus or refrain, repeated phrases, and an ending — though not every song has all of these.")}
            ${p(`“${SONG.titleTransliteration}” doesn't have a separate verse or chorus — it's two short lines, each built from a few short phrases with a brief pause between them. That's its real structure, shown below, rather than forcing a verse/chorus label onto a song that doesn't have one.`)}
          `)}
          ${SONG.lines.map((line, i) => `
            <div class="mb-2">
              <p class="text-xs text-ink-500 mb-1">Line ${i + 1}</p>
              ${flowStrip([...line.phrases.map((ph) => ph.label), "(pause)"])}
            </div>`).join("")}
        `, { wide: true })}

        ${chapter("melody", 4, "Section 4 — Study the melody", `
          ${narrow(p("The chart below traces the melody's actual shape — higher chips are higher notes, lower chips are lower notes, and a dimmed chip is a held beat rather than a new note. Before singing the words, try humming the shape on its own."))}
          ${SongLessonKit.melodyContourHtml(SONG)}
          <div class="flex flex-wrap gap-3 mb-2">
            <button type="button" data-play-scope="0:0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} First phrase</button>
            <button type="button" data-play-scope="0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line 1</button>
            <button type="button" data-play-scope="1" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Line 2</button>
          </div>
          ${narrow(p("If one transition feels less familiar than the rest, play just that phrase a few times on its own before moving on."))}
        `, { wide: true })}

        ${chapter("lyrics", 5, "Section 5 — Understand lyrics and emotion", `
          ${narrow(p("Reading the meaning slowly, before singing, often changes how a line comes out:"))}
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-3">
            <p class="text-sm text-ink-100 italic leading-relaxed mb-2">“${SONG.meaning.english}”</p>
            <div class="flex flex-wrap gap-2">
              ${SONG.meaning.wordByWord.map((w) => `<span class="flow-chip !text-xs" title="${Utils.escapeHtml(w.meaning)}">${w.word}</span>`).join("")}
            </div>
          </div>
          ${narrow(p("Notice which word in each line feels most important to you, and where a natural emphasis might fall — there's no single correct interpretation here, just your own honest reading."))}
          <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-emphasis">Which word or phrase feels most important to you?</label><textarea id="l3c01-emphasis" data-growth="emphasis" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.emphasis || "")}</textarea></div>
        `)}

        ${chapter("plan", 6, "Section 6 — Create your song practice plan", `
          ${narrow(p("A simple, reusable plan for learning any song one manageable piece at a time:"))}
          <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed mb-3">
            ${PLAN_STEPS.map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
          </ol>
          <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-planNotes">My practice notes for this song</label><textarea id="l3c01-planNotes" data-growth="planNotes" rows="3" class="field" placeholder="Optional — e.g. which phrase to repeat slowly, when to attempt the complete song...">${Utils.escapeHtml(growth.planNotes || "")}</textarea></div>
        `)}

        ${chapter("practice", 7, "Section 7 — Practical activity", `
          ${narrow(p("Put the plan to use: listen to the complete reference again, pick one phrase, hum its melody, then sing it with the words."))}
          <div class="flex flex-wrap gap-3 mb-3">
            <button type="button" data-play-scope="both" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Listen to the complete song</button>
            <button type="button" data-play-scope="0:0" class="vr-btn">${icon("play", "w-3.5 h-3.5")} Hum the first phrase</button>
          </div>
          ${RecordingCard.render("rc-phraseTake", { title: "Sing one phrase, with words", hint: "Entirely optional.", maxSeconds: 20, section: false })}
          <div data-review-host class="mt-3"></div>
          <div class="flex flex-wrap gap-3 mt-3">${openLink(`Open "${SONG.titleTransliteration}" for full practice`)}</div>
        `, { wide: true })}

        ${chapter("reflect", 8, "Self-review", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("listenedFirst-q", { ...Q.listenedFirst, selected: sel("listenedFirst") })}
              ${SelfAssessment.render("identifiedSections-q", { ...Q.identifiedSections, selected: sel("identifiedSections") })}
              ${SelfAssessment.render("understoodLyrics-q", { ...Q.understoodLyrics, selected: sel("understoodLyrics") })}
              ${SelfAssessment.render("identifiedPatterns-q", { ...Q.identifiedPatterns, selected: sel("identifiedPatterns") })}
            </div>
            <div class="grid sm:grid-cols-2 gap-3 mt-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-difficult">Which phrase was most difficult?</label><textarea id="l3c01-difficult" data-growth="difficult" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.difficult || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="l3c01-next">What should I practise next?</label><textarea id="l3c01-next" data-growth="next" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.next || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("complete", 9, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-l3c01", { placeholder: "e.g. What the song's meaning changed for me... Which section felt clearest... What I want to study next time..." })}
        `)}

        ${chapter("complete", 10, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
            ${p("A reminder: keep practice within a comfortable range, don't force a difficult note, and rest between repetitions rather than singing through fatigue. Stop if there's pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
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

    /* ---- Sections 2/4/7: real song reference playback ---- */
    function onPlayScope(e) {
      const btn = e.target.closest("[data-play-scope]");
      if (!btn) return;
      const raw = btn.dataset.playScope;
      let scope = raw;
      if (raw !== "both" && raw.includes(":")) {
        const [line, phrase] = raw.split(":").map(Number);
        scope = { line, phrase };
      } else if (raw !== "both") {
        scope = Number(raw);
      }
      const plan = SongLessonKit.songPlaybackPlan(SONG, scope);
      PianoSynth.playSequence(SongLessonKit.timelineToEvents(plan.cells, 60 / 70), { gap: 0 });
    }
    container.addEventListener("click", onPlayScope);
    cleanups.push(() => container.removeEventListener("click", onPlayScope));

    /* ---- Section 7: recording ---- */
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
      classId, take: take(rec0(), "phraseTake"), maxSeconds: 20,
      meta: { name: "Level 3, Class 1 — One phrase, with words", exercise: "introduction-to-song-mastery-phraseTake" },
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

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "listenedFirst-q": "listenedFirst", "identifiedSections-q": "identifiedSections",
      "understoodLyrics-q": "understoodLyrics", "identifiedPatterns-q": "identifiedPatterns",
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
    own(PersonalNotes.wire(container, "notes-l3c01", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Song mastery grows through listening, structural understanding, meaning, and a simple practice plan — not technique alone.",
        struggled: A(rec, "growth").difficult || "",
        toPractice: A(rec, "growth").next || "",
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
