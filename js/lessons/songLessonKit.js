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

  /**
   * Segments belonging to this line, by the data's own explicit `line` index — not by
   * matching syllable text, which breaks when the same syllable (e.g. "na") appears in
   * more than one line (post-review fix, Important #3).
   */
  function segmentsForLine(song, lineIndex) {
    return measured(song).filter((seg) => seg.line === lineIndex);
  }

/**
   * Every sounding beat in this line, in reading order (tha, ki, ta per row, top to
   * bottom) — one entry per beat, not per syllable, so a syllable held across more
   * than one Tha-Ki-Ta slot (`sustain: true`, no new lyric at that beat) still gets
   * its own playable note, exactly as the learner asked ("each and every beat").
   *
   * Prefers each row's own `notes` field when the song has it — a finer, by-ear
   * transcription (see `BY_EAR_NOTE`/`byEarRow` in songs.js) that can tell a held
   * beat's pitch apart from the next syllable's, unlike the broadly measured
   * `reference.segments`. Falls back to the older segment-covers positional mapping
   * for a future song that doesn't have by-ear per-beat data yet — never by matching
   * syllable TEXT, which breaks the moment the same syllable (e.g. "na") appears more
   * than once, exactly the bug the per-line segment lookup was already fixed for.
   */
  function syllablesForLine(song, lineIndex) {
    const rows = song.lines[lineIndex].rhythm;
    if (rows.some((row) => row.notes)) {
      const out = [];
      rows.forEach((row, r) => {
        ["tha", "ki", "ta"].forEach((col) => {
          const note = row.notes && row.notes[col];
          if (!note) return; // true rest — no sound at this beat
          const text = row[col];
          const sustain = !text || text === "–";
          out.push({
            text: sustain ? null : text, sustain, line: lineIndex, row: r, col,
            swara: note.swara, western: note.western, midi: note.midi, confidence: note.confidence,
          });
        });
      });
      return out;
    }
    const cells = [];
    rows.forEach((row, r) => {
      ["tha", "ki", "ta"].forEach((col) => {
        const text = row[col];
        if (text && text !== "–") cells.push({ text, line: lineIndex, row: r, col });
      });
    });
    const segs = segmentsForLine(song, lineIndex);
    const out = [];
    let i = 0;
    segs.forEach((seg) => {
      const n = seg.covers.length || 0;
      for (let k = 0; k < n && i < cells.length; k++, i++) {
        out.push({ ...cells[i], swara: seg.swara, western: seg.western, midi: seg.midi, confidence: seg.confidence });
      }
    });
    while (i < cells.length) { out.push({ ...cells[i], swara: null, western: null, midi: null, confidence: "not covered by any measured segment" }); i++; }
    return out;
  }

  const allSyllables = (song) => song.lines.flatMap((_, i) => syllablesForLine(song, i));

  /**
   * Turns a flat beat list into PianoSynth.playSequence notes, so playback traces the
   * rhythm rather than ticking through every beat at one flat, equal duration: a `sustain`
   * beat that continues the SAME pitch extends the previous note's duration instead of
   * re-triggering it; anything else (a new syllable, or a beat at a different pitch, even
   * if flagged `sustain`) becomes its own discrete note — "each beat, played as it is."
   */
  function beatsToNotes(beats, unit) {
    const notes = [];
    beats.forEach((b) => {
      if (b.midi == null) return;
      const prev = notes[notes.length - 1];
      if (b.sustain && prev && prev.midi === b.midi) prev.duration += unit;
      else notes.push({ midi: b.midi, duration: unit });
    });
    return notes;
  }

  /**
   * Every Tha-Ki-Ta cell in this line, in order — INCLUDING true rests (`midi: null`) —
   * so playback can let a blank beat actually take up its own time in the rhythm instead
   * of being silently skipped. Only available for a song with by-ear per-beat `notes`
   * (see songs.js); returns null otherwise, so the caller can fall back to the older,
   * rest-less sequence for a song that doesn't have this data yet.
   */
  function lineBeatTimeline(song, lineIndex) {
    const rows = song.lines[lineIndex].rhythm;
    if (!rows.some((row) => row.notes)) return null;
    const out = [];
    rows.forEach((row) => {
      ["tha", "ki", "ta"].forEach((col) => {
        const note = row.notes && row.notes[col];
        if (!note) { out.push({ midi: null, sustain: false }); return; }
        const text = row[col];
        out.push({ midi: note.midi, sustain: !text || text === "–" });
      });
    });
    return out;
  }

  /**
   * Turns a lineBeatTimeline() cell list into PianoSynth.playSequence events, each `unit`
   * long: consecutive rest cells merge into one longer rest (a real pause, not silence
   * ticking by one beat at a time), exactly like beatsToNotes merges held notes.
   */
  function timelineToEvents(cells, unit) {
    const events = [];
    cells.forEach((c) => {
      const prev = events[events.length - 1];
      if (c.midi == null) {
        if (prev && prev.rest) prev.duration += unit;
        else events.push({ rest: true, duration: unit });
      } else if (c.sustain && prev && !prev.rest && prev.midi === c.midi) {
        prev.duration += unit;
      } else {
        events.push({ midi: c.midi, duration: unit });
      }
    });
    return events;
  }

  // Index of this line's first beat within allSyllables(song)'s flat list — lets
  // rhythmTableHtml wire the same data-play-syllable index pitchTableHtml/Swara
  // Practice use, without re-flattening every line on every cell.
  function lineBeatOffset(song, lineIndex) {
    let n = 0;
    for (let i = 0; i < lineIndex; i++) n += syllablesForLine(song, i).length;
    return n;
  }

  function rhythmTableHtml(song, lineIndex) {
    const beats = syllablesForLine(song, lineIndex);
    const offset = lineBeatOffset(song, lineIndex);
    return `
      <table class="w-full text-sm border-collapse mb-4">
        <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500">
          <th class="text-left py-1.5 pr-3">Tha</th><th class="text-left py-1.5 pr-3">Ki</th><th class="text-left py-1.5">Ta</th>
        </tr></thead>
        <tbody>
          ${song.lines[lineIndex].rhythm.map((row, r) => `
          <tr class="border-t border-white/5">
            ${["tha", "ki", "ta"].map((col) => {
              const bi = beats.findIndex((b) => b.row === r && b.col === col);
              if (bi === -1) return `<td class="py-2 pr-3 text-ink-600">–</td>`;
              const beat = beats[bi];
              const label = beat.sustain
                ? `<span class="text-ink-500 italic">(held)</span>`
                : `<span class="text-ink-100">${beat.text}</span>`;
              return `<td class="py-2 pr-3">
                <button type="button" data-play-syllable="${offset + bi}" class="text-left group">
                  ${label}
                  ${beat.swara || beat.western ? `<span class="block text-[11px] text-gold-300/80 font-display group-hover:text-gold-200">${beat.swara || beat.western}</span>` : ""}
                </button>
              </td>`;
            }).join("")}
          </tr>`).join("")}
        </tbody>
      </table>`;
  }

  function pitchTableHtml(song, western) {
    return `
      <table class="w-full text-sm border-collapse mb-3">
        <thead><tr class="text-[11px] uppercase tracking-wider text-ink-500">
          <th class="text-left py-1.5 pr-2"></th>
          <th class="text-left py-1.5 pr-3">Lyrics</th><th class="text-left py-1.5 pr-3">${western ? "Western note" : "Swara"}</th>
          <th class="text-left py-1.5">Confidence</th>
        </tr></thead>
        <tbody>
          ${allSyllables(song).map((syl, i) => `
          <tr class="border-t border-white/5">
            <td class="py-2 pr-2">${syl.midi != null ? `<button type="button" data-play-syllable="${i}" class="vr-btn !text-[11px] !px-2 !py-1">${icon("play", "w-3 h-3")}</button>` : ""}</td>
            <td class="py-2 pr-3 text-ink-100 font-display">${syl.sustain ? `<span class="text-ink-500 italic">(held)</span>` : syl.text}</td>
            <td class="py-2 pr-3 text-ink-50">${(western ? syl.western : syl.swara) || "—"}</td>
            <td class="py-2 text-xs ${syl.confidence === "measured" ? "text-emerald-300" : syl.confidence === "by ear" ? "text-teal-300" : "text-amber-300"}">${syl.confidence}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;
  }

  // One chip per sounding beat (from syllablesForLine — the by-ear per-beat data when
  // the song has it, see songs.js), not per broad measured segment, so the contour
  // actually traces the real melody shape rather than 4 averaged regions. A held beat
  // (no new syllable) renders dimmed with "(held)" instead of lyric text.
  function melodyContourHtml(song) {
    const tonic = song.reference.tonicMidi;
    const chip = (b) => {
      const offset = b.midi == null ? 0 : Math.max(0, Math.min(60, 30 - (b.midi - tonic) * 3));
      return `<div class="flex flex-col items-center" style="margin-bottom:${offset}px">
        <span class="flow-chip !text-xs${b.sustain ? " opacity-60" : ""}">${b.swara || b.western || "?"}</span>
        <span class="text-[10px] text-ink-500 mt-1">${b.sustain ? "(held)" : b.text || "(uncertain)"}</span>
      </div>`;
    };
    return song.lines
      .map((_, i) => `<div class="flex flex-wrap items-end gap-2 my-3" style="min-height:80px">${syllablesForLine(song, i).map(chip).join("")}</div>`)
      .join(`<div class="border-t border-white/5 my-1"></div>`);
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
            ${p("Each line is grouped into three-beat positions — Tha, Ki, Ta. A “–” is a silent position; a syllable spanning two positions is held, not repeated. The note under each syllable is the pitch it's actually sung on — several syllables in a row often share one note, exactly as the reference recording does.")}
            ${song.lines.map((l, i) => `<p class="text-sm text-ink-200 mb-2">Line ${i + 1}: “${l.text}”</p>${rhythmTableHtml(song, i)}`).join("")}
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
            ${p("Every syllable below has its own note and its own play button — tap any one to hear it on its own, in any order.")}
            <button type="button" data-pitch-toggle class="vr-btn mb-3">${icon("play", "w-3.5 h-3.5")} Show Western notes</button>
            <div data-pitch-host>${pitchTableHtml(song, false)}</div>
          `)}
        `)}

        ${chapter("melody", 5, "Melody", `
          ${narrow(`
            ${p("Each beat, placed roughly by pitch — higher chips are higher notes, and dimmed chips are held beats rather than new syllables.")}
            ${melodyContourHtml(song)}
            ${p(song.reference.melodyNote)}
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
              <p class="text-xs text-ink-500 mb-3">Every syllable, individually — tap any one.</p>
              <div class="flex flex-wrap gap-2">
                ${allSyllables(song).map((syl, i) => syl.midi != null ? `<button type="button" data-play-syllable="${i}" class="vr-btn !text-xs">${icon("play", "w-3 h-3")} ${syl.sustain ? "(held)" : syl.text}</button>` : "").join("")}
              </div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p class="text-sm text-ink-100 font-display mb-2">Melody Practice</p>
              <div class="flex flex-col gap-2">
                ${song.lines.map((line, i) => `<button type="button" data-play-melody="${i}:slow" class="vr-btn !text-xs">Line ${i + 1}, slow</button>`).join("")}
                <button type="button" data-play-melody="both:normal" class="vr-btn !text-xs vr-btn-gold">${song.lines.length > 1 ? "Both lines, normal tempo" : "Full phrase, normal tempo"}</button>
              </div>
            </div>
          </div>
        `, { wide: true })}

        ${chapter("perform", 8, "Perform", `
          ${narrow(p("A guided sequence — skip any of these, record only what feels comfortable. Play the reference for any of them before or while you sing."))}
          <div class="flex flex-col gap-5">
            ${[
              ...song.lines.map((line, i) => [`line${i}Take`, `Line ${i + 1}, on its own`, `“${line.text}”`, `${i}:normal`]),
              ["combinedTake", "All lines, combined — this is the one compared in the next stage", `“${song.lines.map((l) => l.text).join(" ")}”`, "both:normal"],
              ["slowTake", "All lines, slow tempo", "", "both:slow"],
              ["fullTempoTake", "All lines, full tempo", "", "both:normal"],
            ].map(([key, title, hint, playKey]) => `
              <div>
                ${RecordingCard.render(`rc-${key}`, {
                  title, hint, maxSeconds: 20, section: false,
                  extraTop: `<div class="mb-4"><button type="button" data-play-melody="${playKey}" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Play Reference</button><p class="text-xs text-ink-500 mt-2">Play it before or while you sing.</p></div>`,
                })}
              </div>`).join("")}
          </div>
        `, { wide: true })}

        ${chapter("assess", 9, "Compare my attempt", `
          ${narrow(`
            ${p("Compares a recording above against the reference transcription — segment by segment, honestly. If recording isn't supported on this device, the self-reflection questions below work just as well.")}
            ${PitchAnalysis.isAvailable
              ? [
                  ...song.lines.map((line, i) => [`line${i}`, `Line ${i + 1}`, `line${i}Take`]),
                  ["combined", "All lines, combined", "combinedTake"],
                ].map(([key, title, takeKey]) => `
                  <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 mb-4">
                    <p class="text-sm text-ink-100 font-display mb-2">${title}</p>
                    <button type="button" data-compare-attempt="${key}" class="vr-btn vr-btn-gold" ${take(takeKey) ? "" : "disabled"}>${icon("play", "w-4 h-4")} Compare my attempt</button>
                    ${!take(takeKey) ? `<p class="text-xs text-ink-500 mt-2">Record this take above first.</p>` : ""}
                    <div data-compare-result="${key}" class="mt-4"></div>
                  </div>`).join("")
              : `<p class="text-sm text-ink-400">Comparison isn't available on this device.</p>`}
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
                  <input type="checkbox" data-checklist="${i}" ${rec.checkpoints[item.key] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
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

    /* ---- Pitch stage + Swara Practice: per-syllable playback (every beat, individually) ---- */
    function onPlaySyllable(e) {
      const btn = e.target.closest("[data-play-syllable]");
      if (!btn) return;
      const syl = allSyllables(song)[Number(btn.dataset.playSyllable)];
      if (syl && syl.midi != null) PianoSynth.play(syl.midi, { duration: 1, velocity: 0.5 });
    }
    container.addEventListener("click", onPlaySyllable);
    cleanups.push(() => container.removeEventListener("click", onPlaySyllable));

    /* ---- Practice: melody playback ---- */
    function onPlayMelody(e) {
      const btn = e.target.closest("[data-play-melody]");
      if (!btn) return;
      const [which, speed] = btn.dataset.playMelody.split(":");
      const lineIndexes = which === "both" ? song.lines.map((_, i) => i) : [Number(which)];
      const unit = speed === "slow" ? 0.75 : 0.5;
      const gap = speed === "slow" ? 0.3 : 0.18;
      // Prefer the full per-beat timeline (every Tha-Ki-Ta cell, rests included) when the
      // song has by-ear data, so a blank beat (e.g. the 2 rest beats after the final "na")
      // actually takes up its own time at the chosen tempo instead of being skipped —
      // the song flows as written, not as a flat list of only its sounding notes.
      const timelines = lineIndexes.map((i) => lineBeatTimeline(song, i));
      if (timelines.every(Boolean)) {
        PianoSynth.playSequence(timelines.flatMap((cells) => timelineToEvents(cells, unit)), { gap });
      } else {
        const beats = which === "both" ? allSyllables(song) : syllablesForLine(song, Number(which));
        PianoSynth.playSequence(beatsToNotes(beats, unit), { gap });
      }
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
      container.querySelectorAll("[data-compare-attempt]").forEach((btn) => {
        const target = COMPARE_TARGETS[btn.dataset.compareAttempt];
        if (target) btn.disabled = !A(rec, "recs")[target.takeKey];
      });
    }

    /* ---- Assess: which take + which reference segments each compare button uses ---- */
    const COMPARE_TARGETS = {
      combined: { takeKey: "combinedTake", segments: song.reference.segments },
      ...Object.fromEntries(song.lines.map((_, i) => [`line${i}`, {
        takeKey: `line${i}Take`, segments: song.reference.segments.filter((s) => s.line === i),
      }])),
    };

    /* ---- Perform: one recording per line, plus combined/slow/full ---- */
    const RECORDING_NAMES = {};
    song.lines.forEach((line, i) => { RECORDING_NAMES[`line${i}Take`] = `Line ${i + 1}`; });
    Object.assign(RECORDING_NAMES, {
      combinedTake: "All lines, combined",
      slowTake: "All lines, slow tempo", fullTempoTake: "All lines, full tempo",
    });
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
      const key = btn.dataset.compareAttempt;
      const target = COMPARE_TARGETS[key];
      const rtake = target && A(rec0(), "recs")[target.takeKey];
      if (!rtake) return;
      btn.disabled = true;
      btn.innerHTML = "Comparing…";
      const resultHost = $(`[data-compare-result="${key}"]`);
      try {
        const blob = await Media.getBlob(rtake.mediaId);
        const pitchResult = await SongPitchCompare.compareRecording(blob, song, target.segments);
        let timingHtml = "";
        if (pitchResult.aligned) {
          const refSegs = target.segments.filter((s) => s.swara !== null);
          const referenceSpanSeconds = refSegs[refSegs.length - 1].end - refSegs[0].start;
          const timing = SongTimingCompare.compare(pitchResult.learnerSpan, referenceSpanSeconds);
          timingHtml = `<p class="text-sm text-ink-200 mt-4"><strong class="text-ink-100">Pace:</strong> ${timing.rating}</p>`;
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
      btn.innerHTML = `${icon("play", "w-4 h-4")} Compare my attempt`;
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
    measured, segmentsForLine, syllablesForLine, allSyllables, beatsToNotes, lineBeatTimeline, timelineToEvents, rhythmTableHtml, pitchTableHtml, melodyContourHtml,
    milestone, renderComplete, progressStats, A, q, checklist,
    wireViewedSentinel, wireStepper,
    render, mount,
  };
})();
