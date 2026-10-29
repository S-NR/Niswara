/* ============================================================
   LEVEL 2, CLASS 7 — VOWEL MODIFICATION FOUNDATIONS
   (interactive lesson)

   Rendered by ClassDetailPage for interactive: "vowel-modification".

   Curriculum identity: Level 2, Class 7 (`number: 7`, `levelId: 2`
   in data.js, id `L2C07`). Same mechanism Classes 1-6 already
   proved six times over. This class's own title matched the
   placeholder list's already-renamed entry exactly (renamed from
   "Vocal Range" during Class 6's turn), so nothing needed renaming
   to add Class 7 itself.

   **Level 2's class count grows a third time.** This spec's own
   Section K previews the real Class 8 as "Resonance and Tone
   Colour" — not the placeholder list's "Dynamics". Following the
   same precedent Classes 5 and 6 both set (and Level 1's five times
   before that), `levelClassDefs[2].titles`' next entry was renamed
   in place, not removed.

   Core idea: "Vowel modification is gradual and depends on pitch,
   voice, language, musical context, and the individual singer... a
   small adjustment, not a completely different word... There is no
   single universal vowel shape that works for every singer." A
   genuinely different topic from Classes 3-6 (register coordination)
   — this is the first Level 2 class about diction/vowels rather than
   chest/head/mix.

   Honesty boundaries, matching every earlier class: no fabricated
   vowel recognition, pronunciation scoring, or audio analysis;
   completion never depends on perfect pronunciation, a successful
   recording, or finishing every optional activity (the spec says
   this explicitly).

   Section I is five plain first-person self-attestations again, so
   this file reuses Classes 3-6's plain-checkbox completion pattern
   (Class 10's original `PRE_CHECK_ITEMS` style).

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   ObservationChecklist (Class 5), PersonalNotes, ClassProgress. The
   "skip this exercise" button pattern and the "reuse an earlier
   recording instead of asking again" pattern (Sections C and G both
   reuse Section B's five individual vowel recordings) are both
   reused exactly as Classes 1-6 established them.
   ============================================================ */

const VowelModificationLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "vowels", label: "Vowels" },
    { id: "compare", label: "Compare" },
    { id: "transition", label: "Transition" },
    { id: "pitch", label: "Pitch" },
    { id: "pronunciation", label: "Pronunciation" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const VOWELS = [
    { key: "ah", label: "“Ah”" },
    { key: "ee", label: "“Ee”" },
    { key: "oo", label: "“Oo”" },
    { key: "eh", label: "“Eh”" },
    { key: "oh", label: "“Oh”" },
  ];
  const PAIRS = [
    { a: "ah", b: "oh", label: "“Ah” and “Oh”" },
    { a: "ee", b: "eh", label: "“Ee” and “Eh”" },
    { a: "oo", b: "oh", label: "“Oo” and “Oh”" },
  ];

  const CHECKLIST_ITEMS = [
    { key: "recognised", label: "I can recognise the five basic vowel sounds." },
    { key: "pairsExplored", label: "I explored differences between vowel pairs." },
    { key: "transitionExplored", label: "I tried a gentle vowel transition or chose to skip it." },
    { key: "comfortable", label: "I kept my jaw and tongue comfortable." },
    { key: "reflected", label: "I reflected on which vowels felt easiest." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const VOWEL_OPTS = [...VOWELS.map((v) => opt(v.key, v.label)), opt("notsure", "Not sure")];
  const Q = {
    easiestVowel: { question: "Which vowel felt easiest?", options: VOWEL_OPTS },
    unfamiliarVowel: { question: "Which vowel felt unfamiliar?", options: VOWEL_OPTS },
    mouthShapeChanged: { question: "Did I change my mouth shape naturally?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    exaggerated: { question: "Did I exaggerate any vowel?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
  };

  const chapter = (...args) => LessonKit.chapter(STAGES, ...args);
  const { p, narrow } = LessonKit;
  const A = (rec, g) => rec.answers[g] || {};
  const filled = (v) => v && String(v).trim();
  const N = (m) => NoteUtils.name(m);

  function baseNote(rec) {
    const ok = (n) => typeof n === "number" && n >= RANGE.from && n + STEP <= RANGE.to;
    const own = A(rec, "setup").note;
    if (ok(own)) return own;
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
  const skipped = (rec, k) => !!A(rec, "skip")[k];
  const checklist = (rec) => A(rec, "checklist");

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 10) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function vowelCardsHtml() {
    return `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${VOWELS.map((v) => recCard(`${v.key}Take`, v.label, "", 8)).join("")}
    </div>`;
  }

  function compareHtml(rec) {
    return `<div class="flex flex-col gap-3">
      ${PAIRS.map((pr) => {
        const aTake = take(rec, `${pr.a}Take`), bTake = take(rec, `${pr.b}Take`);
        return `
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-ink-200">${pr.label}</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-play-compare="${pr.a}" class="vr-btn" ${aTake ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} ${VOWELS.find((v) => v.key === pr.a).label}</button>
            <button type="button" data-play-compare="${pr.b}" class="vr-btn" ${bTake ? "" : "disabled"}>${icon("play", "w-3.5 h-3.5")} ${VOWELS.find((v) => v.key === pr.b).label}</button>
          </div>
        </div>`;
      }).join("")}
    </div>
    <p class="text-xs text-ink-500 mt-3">${VOWELS.some((v) => take(rec, `${v.key}Take`)) ? "Playing back your own recordings from Section B — or just say the pairs aloud yourself." : "Record the vowels in Section B above to compare them here, or just say the pairs aloud yourself."}</p>`;
  }

  function problems() {
    const items = [
      ["Opening the mouth as wide as possible", "Use a natural, comfortable mouth opening."],
      ["Moving the tongue forcefully", "Let vowel changes happen gently."],
      ["Making every vowel sound the same", "Preserve each vowel's identity while exploring small adjustments."],
      ["Changing pronunciation until the word is unclear", "Keep the original word understandable."],
      ["Forcing a vowel to make a difficult note easier", "Return to a comfortable pitch and stop if tension appears."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function reviewHtml(rec) {
    const present = VOWELS.filter((v) => take(rec, `${v.key}Take`));
    if (!present.length) return `<p class="text-sm text-ink-500">Record your five vowels in Section B above, then come back here to listen and reflect.</p>`;
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map((v) => `<button type="button" data-play-review="${v.key}Take" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${v.label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 7 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">Five vowels, noticed gently.</p>
        <p class="text-sm text-ink-300">A small adjustment, not a different word — clear pronunciation and comfort both matter.</p>
        <p class="text-sm text-ink-100">There's no single universal vowel shape for every singer.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 8 — Resonance and Tone Colour</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore how vocal-tract shape can influence the tone colour of the voice — not a promise of instant improvements in vocal power or quality.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">How small changes in vowel shape can affect the sound and comfort of singing.</h3>
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
    const growth = A(rec, "growth");
    const c = checklist(rec);

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Section A — Welcome: What is a vowel?", `
          ${narrow(`
            ${p("Vowels are sounds such as “ah,” “ee,” “oo,” “eh” and “oh.” Consonants are sounds such as “m,” “b” and “t” that help form words.")}
            ${p("The shape of the mouth, the position of the tongue, and the rounding of the lips all affect a vowel sound. Singing may sometimes call for a small adjustment to a vowel to make a note more comfortable — but that doesn't mean distorting the word.")}
          `)}
          ${flowStrip(["NOTICE", "COMPARE", "EXPLORE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("vowels", 2, "Section B — Explore five vowel sounds", `
          ${narrow(`
            ${p("Say each vowel naturally and briefly, at a comfortable speaking pitch. Keep the jaw relaxed, avoid exaggerated mouth shapes, and rest briefly between sounds. Notice which vowels feel easiest to say.")}
          `)}
          ${vowelCardsHtml()}
        `, { wide: true })}

        ${chapter("compare", 3, "Section C — Listen to the differences", `
          ${narrow(p("Each vowel has its own sound quality because the vocal tract shape changes — not because one is objectively better or more resonant than another."))}
          <div data-compare-host>${compareHtml(rec)}</div>
        `)}

        ${chapter("transition", 4, "Section D — Gentle vowel transitions", `
          ${narrow(`
            ${p("Say the first vowel comfortably, then move gently into the second — jaw and tongue relaxed. Repeat only once or twice if comfortable, resting between attempts. The aim is to notice the difference, not to make both vowels sound identical.")}
            <p class="font-display text-lg text-ink-50 mb-2">“Ah–Oh” · “Ee–Eh” · “Oo–Oh”</p>
          `)}
          ${recCard("transitionsTake", "Gentle transitions", "All three, one after another.", 20)}
          ${narrow(`<div class="mt-3">${skipBtn("transition")}</div>`)}
        `)}

        ${chapter("pitch", 5, "Section E — Vowel shape during a comfortable note", `
          ${narrow(p("Listen to a comfortable reference note, sing a short “ah” on it, then — if comfortable — repeat the same note with “oh” or “oo.” Compare how the sound changes. Vowels may need small adjustments as pitch rises, but this is only an introduction — not advanced high-note vowel modification."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("vm-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
          </div>
          ${recCard("pitchVowelTake", "“ah” on your note, then “oh” or “oo” if comfortable", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("pitchvowel")}</div>`)}
        `, { wide: true })}

        ${chapter("pronunciation", 6, "Section F — Pronunciation versus modification", `
          ${narrow(`
            ${p("Vowel modification is a small adjustment, not a completely different word. Clear pronunciation remains important, and different musical phrases and languages may call for different choices. There is no single universal vowel shape that works for every singer.")}
            ${p("For example: a singer may subtly adjust an “ah” vowel while singing a comfortable phrase, but shouldn't change it so much that the word becomes unrecognisable.")}
          `)}
        `)}

        ${chapter("record", 7, "Section G — Optional recording and reflection", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed, and no recording is sent anywhere outside your own account."))}
          <div data-review-host>${reviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("easiestVowel-q", { ...Q.easiestVowel, selected: sel("easiestVowel") })}
              ${SelfAssessment.render("unfamiliarVowel-q", { ...Q.unfamiliarVowel, selected: sel("unfamiliarVowel") })}
              ${SelfAssessment.render("mouthShapeChanged-q", { ...Q.mouthShapeChanged, selected: sel("mouthShapeChanged") })}
              ${SelfAssessment.render("exaggerated-q", { ...Q.exaggerated, selected: sel("exaggerated") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="vm-again">Which sound would I like to practise again?</label><textarea id="vm-again" data-growth="practiceAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.practiceAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pronunciation, a successful recording, or finishing every optional activity.")}
            <div class="flex flex-col gap-1 mb-5">
              ${CHECKLIST_ITEMS.map((item, i) => `
                <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <input type="checkbox" data-checklist="${i}" ${c[i] ? "checked" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                  <span class="text-sm text-ink-200">${item.label}</span>
                </label>`).join("")}
            </div>
          `)}
        `)}

        ${chapter("complete", 10, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-vm", { placeholder: "e.g. Which vowel felt easiest... Whether any vowel felt unfamiliar... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say “ah,” “ee” and “oo” naturally, compare “ah–oh” once or twice, keep the mouth and tongue relaxed, then write down one observation. No need for excessive repetition.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 12, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 13, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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

    /* ---- Section E: piano + playback ---- */
    own(VirtualPiano.wire(container, "vm-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      if (!e.target.closest("[data-play-pitch]")) return;
      PianoSynth.play(base(), { duration: 1.2, velocity: 0.5 });
    }
    container.addEventListener("click", onPlayPitch);
    cleanups.push(() => container.removeEventListener("click", onPlayPitch));

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
    function refreshCompareHost() {
      const host = $("[data-compare-host]");
      if (host) host.innerHTML = compareHtml(rec0());
    }
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = reviewHtml(rec0());
    }
    const VOWEL_NAMES = Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, v.label]));
    const NAMES = { ...VOWEL_NAMES, transitionsTake: "Vowel transitions", pitchVowelTake: "Vowel on a comfortable note" };
    const MAX_SECONDS = { ...Object.fromEntries(VOWELS.map((v) => [`${v.key}Take`, 8])), transitionsTake: 20, pitchVowelTake: 15 };
    const VOWEL_KEYS = VOWELS.map((v) => `${v.key}Take`);
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 7 — ${NAMES[k]}`, exercise: `vowel-modification-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (VOWEL_KEYS.includes(k)) { refreshCompareHost(); refreshReviewHost(); }
        },
      }));
    });

    /* ---- Section C: play-to-compare, Section G: play-to-review ---- */
    function onPlayCompare(e) {
      const btn = e.target.closest("[data-play-compare]");
      if (!btn) return;
      const t = take(rec0(), `${btn.dataset.playCompare}Take`);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayCompare);
    cleanups.push(() => container.removeEventListener("click", onPlayCompare));
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "easiestVowel-q": "easiestVowel", "unfamiliarVowel-q": "unfamiliarVowel", "mouthShapeChanged-q": "mouthShapeChanged", "exaggerated-q": "exaggerated" };
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

    /* ---- growth textarea ---- */
    container.querySelectorAll("[data-growth]").forEach((ta) => {
      const key = ta.dataset.growth;
      const save = Utils.debounce((v) => set("growth", key, v), 500);
      ta.addEventListener("input", () => save(ta.value));
    });

    /* ---- Section I: completion checklist ---- */
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
    own(PersonalNotes.wire(container, "notes-vm", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Vowel modification is a small adjustment, not a different word — there's no single universal vowel shape for every singer.",
        struggled: q(rec, "unfamiliarVowel") && q(rec, "unfamiliarVowel") !== "notsure" ? `The “${q(rec, "unfamiliarVowel")}” vowel felt unfamiliar.` : "",
        toPractice: A(rec, "growth").practiceAgain || "",
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
