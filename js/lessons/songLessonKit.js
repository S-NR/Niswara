/* ============================================================
   SONG LESSON KIT — generic renderer for "Song Learning &
   Application" (optional, non-numbered — see docs/superpowers/
   specs/2026-11-01-song-learning-level-design.md). Takes any
   entry from SONGS (js/data/songs.js) and walks it through 8
   stages. Adding a future song means adding a new SONGS entry,
   not new UI code.

   NOT registered in js/lessons/registry.js's InteractiveLessons —
   wired directly by js/pages/songDetail.js, since this lives
   outside the Level 1-8 class-detail routing path entirely.

   Reuses LessonKit.chapter/p/narrow/wireViewedSentinel/wireStepper
   as-is (fully generic). Does NOT reuse LessonKit.header/stepper/
   loadAndRefresh/nextClass — those are tightly coupled to
   LEVEL/CLASS numbering, ClassActivity's remote sync, and
   APP_DATA.CLASSES, none of which apply here (see ledger, Task 5
   rulings). SongActivity (local-only) replaces ClassActivity.
   ============================================================ */

const SongLessonKit = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "rhythm", label: "Rhythm" },
    { id: "pitch", label: "Pitch" },
    { id: "melody", label: "Melody" },
    { id: "sustain", label: "Sustain" },
    { id: "practice", label: "Practice" },
    { id: "perform", label: "Perform" },
    { id: "assess", label: "Assess" },
  ];

  const { p, narrow, chapter: kitChapter, wireViewedSentinel, wireStepper } = LessonKit;
  const chapter = (...args) => kitChapter(STAGES, ...args);

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the meaning." },
    { key: "triedRhythm", label: "I tried the rhythm practice, or chose to skip it." },
    { key: "exploredPitch", label: "I explored the pitch/swara information." },
    { key: "triedSinging", label: "I attempted singing at least one line, or chose to skip." },
    { key: "reflected", label: "I reflected on my practice, or chose not to." },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    pronunciation: { question: "How did your pronunciation feel?", options: [opt("good", "Comfortable", "good"), opt("okay", "A bit unsure"), opt("hard", "Difficult"), opt("unsure", "Not sure")] },
    expression: { question: "Did you feel you communicated the song's feeling?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really"), opt("unsure", "Not sure")] },
  };

  const A = (rec, g) => rec.answers[g] || {};
  const q = (rec, k) => A(rec, "q")[k] || null;
  const checklist = (rec) => A(rec, "checklist");

  /* ---------- own header/stepper (song-appropriate, not class-appropriate) ---------- */

  function header(song, status, pct) {
    return `
      <section class="max-w-3xl box-content mx-auto px-5 lg:px-8 pt-10 sm:pt-14">
        <a href="#/songs" class="text-xs text-ink-500 hover:text-ink-300 inline-flex items-center gap-1.5 mb-6">${icon("arrowRight", "w-3 h-3 rotate-180")} Song Learning</a>
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs text-ink-500 tracking-widest">SONG LEARNING &amp; APPLICATION</span>
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 tracking-wide uppercase">Optional</span>
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 tracking-wide uppercase">Interactive</span>
        </div>
        <h1 class="font-display text-4xl sm:text-5xl text-ink-50 mb-3">${song.title}</h1>
        <p class="font-display italic text-lg sm:text-xl text-ink-300 max-w-2xl">${song.titleTransliteration}</p>
        <div class="flex items-center gap-3 text-xs text-ink-500 mt-4">
          <span>${song.language}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span data-lesson-pct>${pct}% complete</span>
        </div>
      </section>`;
  }

  function stepper(song) {
    return `
      <nav class="lesson-stepper sticky top-16 z-30 mt-8 border-y border-white/5 bg-ink-950/85 backdrop-blur-xl" aria-label="Lesson stages">
        <div class="max-w-5xl mx-auto px-5 lg:px-8 flex items-center gap-1 overflow-x-auto py-2.5">
          ${STAGES.map((s, i) => `
            <a href="#/songs/${song.id}" data-stage-link="${s.id}" class="stage-pill">${i + 1} · ${s.label}</a>
            ${i < STAGES.length - 1 ? `<span class="text-ink-700 text-xs">›</span>` : ""}`).join("")}
        </div>
      </nav>`;
  }

  /* ---------- small helpers ---------- */

  const measured = (song) => song.reference.segments.filter((s) => s.swara !== null);

  /** Segments whose covered syllables overlap this line's own rhythm syllables. */
  function segmentsForLine(song, lineIndex) {
    const line = song.lines[lineIndex];
    const lineSyllables = new Set(line.rhythm.flatMap((r) => [r.tha, r.ki, r.ta]).filter((t) => t !== "–"));
    return measured(song).filter((seg) => seg.covers.some((c) => lineSyllables.has(c)));
  }

  function rhythmTableHtml(line) {
    return `
      <table class="w-full text-sm border-collapse mb-4">
        <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500">
          <th class="text-left py-1.5 pr-3">Tha</th><th class="text-left py-1.5 pr-3">Ki</th><th class="text-left py-1.5">Ta</th>
        </tr></thead>
        <tbody>
          ${line.rhythm.map((row) => `
          <tr class="border-t border-white/5">
            <td class="py-2 pr-3 text-ink-100">${row.tha}</td>
            <td class="py-2 pr-3 text-ink-400">${row.ki}</td>
            <td class="py-2 text-ink-100">${row.ta}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;
  }

  function pitchTableHtml(song, western) {
    return `
      <table class="w-full text-sm border-collapse mb-3">
        <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500">
          <th class="text-left py-1.5 pr-3">Lyrics</th><th class="text-left py-1.5 pr-3">${western ? "Western note" : "Swara"}</th>
          <th class="text-left py-1.5 pr-3">Duration</th><th class="text-left py-1.5">Confidence</th>
        </tr></thead>
        <tbody>
          ${song.reference.segments.map((seg) => `
          <tr class="border-t border-white/5">
            <td class="py-2 pr-3 text-ink-100">${seg.covers.length ? seg.covers.join(" ") : "—"}</td>
            <td class="py-2 pr-3 text-ink-50 font-display">${(western ? seg.western : seg.swara) || "—"}</td>
            <td class="py-2 pr-3 text-ink-400 tabular-nums">${(seg.end - seg.start).toFixed(2)}s</td>
            <td class="py-2 text-xs ${seg.confidence === "measured" ? "text-emerald-300" : "text-amber-300"}">${seg.confidence}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;
  }

  function melodyContourHtml(song) {
    const tonic = song.reference.tonicMidi;
    return `<div class="flex flex-wrap items-end gap-2 my-5" style="min-height:80px">
      ${song.reference.segments.map((seg) => {
        const rel = seg.midi - tonic; // semitones relative to Sa; purely visual placement
        const offset = Math.max(0, Math.min(60, 30 - rel * 3));
        return `<div class="flex flex-col items-center" style="margin-bottom:${offset}px">
          <span class="flow-chip !text-xs">${seg.swara || "?"}</span>
          <span class="text-[10px] text-ink-500 mt-1">${seg.covers.join(" ") || "(uncertain)"}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Song Learning milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">One small section at a time.</p>
        <p class="text-sm text-ink-300">Singing a song is many skills working together — a comfortable, honest pass is a real result on its own.</p>
      </div>`;
  }

  function progressStats(song) {
    return [{ label: "Recordings", value: SongActivity.count(song.id, "recordings") }];
  }

  function renderComplete(song, rec, status, checklistItems) {
    const all = checklistItems.every((i) => rec.checkpoints[i.key]);
    const lines = checklistItems.map((i) => `
      <li class="flex items-center gap-2.5 text-sm ${rec.checkpoints[i.key] ? "text-ink-100" : "text-ink-500"}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center ${rec.checkpoints[i.key] ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${rec.checkpoints[i.key] ? icon("check", "w-3 h-3") : ""}</span>${i.label}
      </li>`).join("");
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Song complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">${song.titleTransliteration} — explored one small section at a time.</h3>
            <ul class="inline-flex flex-col gap-2 text-left mx-auto">${lines}</ul>
            <div class="mt-6">
              <a href="#/songs" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">Back to Song Learning ${icon("arrowRight", "w-3.5 h-3.5")}</a>
            </div>
          </div>
        </div>`;
    }
    return `
      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 text-center">
        <h3 class="font-display text-2xl text-ink-50 mb-4">${all ? "You're ready." : "Almost there"}</h3>
        <ul class="inline-flex flex-col gap-2 text-left mx-auto mb-6">${lines}</ul>
        <div>
          <button type="button" data-complete-song ${all ? "" : "disabled"}
            class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium transition-colors ${all ? "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-glow" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
            Complete ${icon("check", "w-4 h-4")}
          </button>
        </div>
      </div>`;
  }

  /* ---------- page ---------- */

  function render(song, status) {
    const rec = SongActivity.get(song.id);
    const pct = Math.round((CHECKLIST_ITEMS.filter((i) => rec.checkpoints[i.key]).length / CHECKLIST_ITEMS.length) * 100);
    const c = checklist(rec);
    const sel = (k) => q(rec, k);
    const take = (k) => A(rec, "recs")[k] || null;

    return `
    <div class="pitch-lesson">
      ${header(song, status, pct)}
      ${stepper(song)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Welcome", `
          ${narrow(`
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
              <p class="text-sm text-ink-300">This is the first song in Song Learning &amp; Application, an optional space to bring Level 2's skills into a real song — gently, one small section at a time. More songs will join it later.</p>
            </div>
            ${p(`<strong class="text-ink-100">${song.title}</strong> — <em>${song.titleTransliteration}</em>`)}
            ${song.lines.map((l) => `<p class="text-lg font-display text-ink-50 mb-1">${l.text}</p><p class="text-sm text-ink-400 mb-4 italic">${l.transliteration}</p>`).join("")}
          `)}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Meaning", `
          ${narrow(`
            <table class="w-full text-sm border-collapse mb-5">
              <tbody>
                ${song.meaning.wordByWord.map((w) => `<tr class="border-t border-white/5"><td class="py-2 pr-4 text-ink-100 font-display w-1/3">${w.word}</td><td class="py-2 text-ink-300">${w.meaning}</td></tr>`).join("")}
              </tbody>
            </table>
            ${p(`<strong class="text-ink-100">In English:</strong> ${song.meaning.english}`)}
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 my-4">
              <p class="text-sm text-ink-200 italic">${song.meaning.kannadaPoetic}</p>
            </div>
            ${p(song.meaning.context)}
          `)}
        `)}

        ${chapter("rhythm", 3, "Rhythm — Tha · Ki · Ta", `
          ${narrow(`
            ${p("Each line is grouped into three-beat positions — Tha, Ki, Ta. A “–” is a silent position; a syllable spanning two positions is held, not repeated.")}
            ${song.lines.map((l, i) => `<p class="text-sm text-ink-200 mb-2">Line ${i + 1}: “${l.text}”</p>${rhythmTableHtml(l)}`).join("")}
            <div class="grid sm:grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-xs text-ink-500 mb-2">Slow tempo — speak the syllables along with the beat</p>
                ${Metronome.render("song-metro-slow", { bpm: 50 })}
              </div>
              <div>
                <p class="text-xs text-ink-500 mb-2">Normal tempo</p>
                ${Metronome.render("song-metro-normal", { bpm: 80 })}
              </div>
            </div>
          `, { wide: true })}
        `)}

        ${chapter("pitch", 4, "Pitch and swaras", `
          ${narrow(`
            ${p(song.reference.sourceNote)}
            <button type="button" data-pitch-toggle class="vr-btn mb-3">${icon("play", "w-3.5 h-3.5")} Show Western notes</button>
            <div data-pitch-host>${pitchTableHtml(song, false)}</div>
          `)}
        `)}

        ${chapter("melody", 5, "Melody", `
          ${narrow(`
            ${p("Each measured segment, placed roughly by pitch — higher chips are higher notes.")}
            ${melodyContourHtml(song)}
            ${p("The melody moves downward across the two lines — Line 1 begins on Sa and settles toward Ni, then Line 2 continues the same descent through Pa to a final Sa an octave down, a natural, idiomatic cadence.")}
          `)}
        `)}

        ${chapter("sustain", 6, "Sustain and voice control", `
          ${narrow(`
            ${p("A few of these syllables are held rather than spoken quickly. Keep the airflow steady, avoid pushing for volume, and let each held note settle naturally rather than cutting it off abruptly.")}
            <button type="button" data-play-sa class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Hum the Sa note</button>
            <p class="text-xs text-ink-500 mt-3">Hum along gently for a few seconds, then release — no need to hold it longer than feels comfortable.</p>
          `)}
        `)}

        ${chapter("practice", 7, "Practice", `
          ${narrow(p("Three short practice modes — explore any or all of them."))}
          <div class="grid sm:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p class="text-sm text-ink-100 font-display mb-2">Rhythm Practice</p>
              <p class="text-xs text-ink-500 mb-3">Speak the syllables along with the beat above, at either tempo.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p class="text-sm text-ink-100 font-display mb-2">Swara Practice</p>
              <div class="flex flex-wrap gap-2">
                ${measured(song).map((seg, i) => `<button type="button" data-play-swara="${i}" class="vr-btn !text-xs">${icon("play", "w-3 h-3")} ${seg.swara}</button>`).join("")}
              </div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p class="text-sm text-ink-100 font-display mb-2">Melody Practice</p>
              <div class="flex flex-col gap-2">
                <button type="button" data-play-melody="0:slow" class="vr-btn !text-xs">Line 1, slow</button>
                <button type="button" data-play-melody="1:slow" class="vr-btn !text-xs">Line 2, slow</button>
                <button type="button" data-play-melody="both:normal" class="vr-btn !text-xs vr-btn-gold">Both lines, normal tempo</button>
              </div>
            </div>
          </div>
        `, { wide: true })}

        ${chapter("perform", 8, "Perform", `
          ${narrow(p("A guided sequence — skip any of these, record only what feels comfortable."))}
          <div class="flex flex-col gap-5">
            ${[
              ["line1Take", "Line 1, on its own", `“${song.lines[0].text}”`],
              ["line2Take", "Line 2, on its own", `“${song.lines[1].text}”`],
              ["combinedTake", "Both lines, combined — this is the one compared in the next stage", `“${song.lines[0].text} ${song.lines[1].text}”`],
              ["slowTake", "Both lines, slow tempo", ""],
              ["fullTempoTake", "Both lines, full tempo", ""],
            ].map(([key, title, hint]) => `
              <div>
                ${RecordingCard.render(`rc-${key}`, { title, hint, maxSeconds: 20, section: false })}
              </div>`).join("")}
          </div>
        `, { wide: true })}

        ${chapter("assess", 9, "Compare my attempt", `
          ${narrow(`
            ${p("Compares your combined-lines recording above against the reference transcription — segment by segment, honestly. If recording isn't supported on this device, the self-reflection questions below work just as well.")}
            <div data-compare-host>
              ${PitchAnalysis.isAvailable
                ? `<button type="button" data-compare-attempt class="vr-btn vr-btn-gold" ${take("combinedTake") ? "" : "disabled"}>${icon("play", "w-4 h-4")} Compare my attempt</button>
                   ${!take("combinedTake") ? `<p class="text-xs text-ink-500 mt-2">Record the combined take above first.</p>` : ""}`
                : `<p class="text-sm text-ink-400">Comparison isn't available on this device.</p>`}
            </div>
            <div data-compare-result class="mt-5"></div>
          `)}
        `)}

        ${chapter("assess", 10, "Reflect", `
          ${narrow(`
            <div class="flex flex-col gap-4">
              ${SelfAssessment.render("pronunciation-q", { ...Q.pronunciation, selected: sel("pronunciation") })}
              ${SelfAssessment.render("expression-q", { ...Q.expression, selected: sel("expression") })}
            </div>
          `)}
        `)}

        ${chapter("assess", 11, "My Notes", `
          ${p("Your private notebook for this song. Only you can see it.")}
          ${PersonalNotes.render("notes-song", { placeholder: "e.g. Which part felt most natural... What I want to try next time..." })}
        `)}

        ${chapter("assess", 12, "Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on singing the whole song, a recording, or the comparison succeeding.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("assess", 13, "Your progress", `<div data-lesson-progress>${renderComplete(song, rec, status, CHECKLIST_ITEMS)}</div>`)}

      </div>
    </div>`;
  }

  function mount(container, song, params) {
    const cleanups = [];
    const $ = (s) => container.querySelector(s);
    const rec0 = () => SongActivity.get(song.id);
    const own = (c) => { cleanups.push(() => c.destroy()); return c; };

    cleanups.push(wireViewedSentinel(container, () => SongActivity.markCheckpoint(song.id, "lessonViewed")));
    cleanups.push(wireStepper(container));

    /* ---- Rhythm: two metronomes ---- */
    own(Metronome.wire(container, "song-metro-slow", { bpm: 50 }));
    own(Metronome.wire(container, "song-metro-normal", { bpm: 80 }));

    /* ---- Pitch: Carnatic/Western toggle ---- */
    let western = false;
    function onPitchToggle(e) {
      const btn = e.target.closest("[data-pitch-toggle]");
      if (!btn) return;
      western = !western;
      btn.innerHTML = `${icon("play", "w-3.5 h-3.5")} Show ${western ? "Carnatic swaras" : "Western notes"}`;
      const host = container.querySelector("[data-pitch-host]");
      if (host) host.innerHTML = pitchTableHtml(song, western);
    }
    container.addEventListener("click", onPitchToggle);
    cleanups.push(() => container.removeEventListener("click", onPitchToggle));

    /* ---- Sustain: play Sa ---- */
    function onPlaySa(e) {
      if (!e.target.closest("[data-play-sa]")) return;
      PianoSynth.play(song.reference.tonicMidi, { duration: 2, velocity: 0.45 });
    }
    container.addEventListener("click", onPlaySa);
    cleanups.push(() => container.removeEventListener("click", onPlaySa));

    /* ---- Practice: swara playback ---- */
    function onPlaySwara(e) {
      const btn = e.target.closest("[data-play-swara]");
      if (!btn) return;
      const seg = measured(song)[Number(btn.dataset.playSwara)];
      if (seg) PianoSynth.play(seg.midi, { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlaySwara);
    cleanups.push(() => container.removeEventListener("click", onPlaySwara));

    /* ---- Practice: melody playback ---- */
    function onPlayMelody(e) {
      const btn = e.target.closest("[data-play-melody]");
      if (!btn) return;
      const [which, speed] = btn.dataset.playMelody.split(":");
      const segs = which === "both" ? measured(song) : segmentsForLine(song, Number(which));
      const opts = speed === "slow" ? { duration: 0.75, gap: 0.3 } : { duration: 0.5, gap: 0.18 };
      PianoSynth.playSequence(segs.map((s) => s.midi), opts);
    }
    container.addEventListener("click", onPlayMelody);
    cleanups.push(() => container.removeEventListener("click", onPlayMelody));

    /* ---- refresh the complete/progress panel + compare button availability ---- */
    function refreshLive() {
      const rec = rec0();
      const progHost = $("[data-lesson-progress]");
      if (progHost) progHost.innerHTML = renderComplete(song, rec, rec.completedAt ? "completed" : "available", CHECKLIST_ITEMS);
      const pctEl = $("[data-lesson-pct]");
      if (pctEl) pctEl.textContent = `${Math.round((CHECKLIST_ITEMS.filter((i) => rec.checkpoints[i.key]).length / CHECKLIST_ITEMS.length) * 100)}% complete`;
      const compareBtn = $("[data-compare-attempt]");
      if (compareBtn) compareBtn.disabled = !A(rec, "recs").combinedTake;
    }

    /* ---- Perform: 5 recordings ---- */
    const RECORDING_NAMES = {
      line1Take: "Line 1", line2Take: "Line 2", combinedTake: "Both lines, combined",
      slowTake: "Both lines, slow tempo", fullTempoTake: "Both lines, full tempo",
    };
    Object.keys(RECORDING_NAMES).forEach((key) => {
      own(RecordingCard.wire(container, `rc-${key}`, {
        classId: song.id, take: A(rec0(), "recs")[key] || null, maxSeconds: 20,
        meta: { name: `Song — ${song.titleTransliteration} — ${RECORDING_NAMES[key]}`, exercise: `song-${song.id}-${key}` },
        onSaved: (t) => { SongActivity.setAnswer(song.id, "recs", key, t); SongActivity.bump(song.id, "recordings"); refreshLive(); },
      }));
    });

    /* ---- Assess: compare my attempt ---- */
    async function onCompareAttempt(e) {
      const btn = e.target.closest("[data-compare-attempt]");
      if (!btn || btn.disabled) return;
      const take = A(rec0(), "recs").combinedTake;
      if (!take) return;
      btn.disabled = true;
      btn.textContent = "Comparing…";
      const resultHost = $("[data-compare-result]");
      try {
        const blob = await Media.getBlob(take.mediaId);
        const pitchResult = await SongPitchCompare.compareRecording(blob, song);
        let timingHtml = "";
        if (pitchResult.aligned) {
          const referenceOnsets = measured(song).map((s) => s.start - measured(song)[0].start);
          const learnerOnsets = pitchResult.segments.map((s) => s.start - pitchResult.segments[0].start);
          const timing = SongTimingCompare.compare(learnerOnsets, referenceOnsets);
          timingHtml = timing.aligned
            ? `<p class="text-sm text-ink-200 mt-4"><strong class="text-ink-100">Rhythm:</strong> ${timing.rating}</p>`
            : `<p class="text-sm text-ink-500 mt-4">${timing.note}</p>`;
        }
        if (resultHost) {
          resultHost.innerHTML = pitchResult.aligned
            ? `<table class="w-full text-sm border-collapse">
                <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500"><th class="text-left py-1.5 pr-3">Swara</th><th class="text-left py-1.5">How it compared</th></tr></thead>
                <tbody>${pitchResult.perSegment.map((s) => `<tr class="border-t border-white/5"><td class="py-2 pr-3 text-ink-50 font-display">${s.swara}</td><td class="py-2 text-ink-300">${s.verdict === "close" ? "Close to the reference" : s.verdict === "off" ? `A little ${s.direction} the reference` : "Couldn't tell clearly"}</td></tr>`).join("")}</tbody>
              </table>${timingHtml}`
            : `<p class="text-sm text-ink-400">${pitchResult.note}</p>`;
        }
      } catch (err) {
        console.error(err);
        if (resultHost) resultHost.textContent = "Couldn't analyze that recording. You can still trust your own ears.";
      }
      btn.disabled = false;
      btn.textContent = "Compare my attempt";
    }
    container.addEventListener("click", onCompareAttempt);
    cleanups.push(() => container.removeEventListener("click", onCompareAttempt));

    /* ---- Assess: self-assessment chips ---- */
    const assessMap = { "pronunciation-q": "pronunciation", "expression-q": "expression" };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      SongActivity.setAnswer(song.id, "q", assessMap[name], chip.dataset.assessChoice);
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- notes (reuses ClassActivity.loadNote/saveNote directly — generic, opaque-keyed) ---- */
    own(PersonalNotes.wire(container, "notes-song", { classId: song.id, onSaved: () => {} }));

    /* ---- completion checklist ---- */
    function onChecklist(e) {
      const cb = e.target.closest("[data-checklist]");
      if (!cb) return;
      SongActivity.markCheckpoint(song.id, CHECKLIST_ITEMS[cb.dataset.checklist].key, cb.checked);
      refreshLive();
    }
    container.addEventListener("change", onChecklist);
    cleanups.push(() => container.removeEventListener("change", onChecklist));

    /* ---- complete ---- */
    function onComplete(e) {
      const btn = e.target.closest("[data-complete-song]");
      if (!btn || btn.disabled) return;
      SongActivity.markCompleted(song.id);
      Router.softRefresh(container, SongDetailPage, params);
    }
    container.addEventListener("click", onComplete);
    cleanups.push(() => container.removeEventListener("click", onComplete));

    return () => {
      cleanups.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
      PianoSynth.stopAll();
    };
  }

  return {
    STAGES, header, stepper, chapter, p, narrow,
    measured, segmentsForLine, rhythmTableHtml, pitchTableHtml, melodyContourHtml,
    milestone, renderComplete, progressStats, A, q, checklist,
    wireViewedSentinel, wireStepper,
    render, mount,
  };
})();
