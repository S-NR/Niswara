/* ============================================================
   LEVEL 2, CLASS 4 — HEAD VOICE FOUNDATIONS (interactive lesson)

   Rendered by ClassDetailPage for interactive: "head-voice-foundations".

   Curriculum identity: Level 2, Class 4 (`number: 4`, `levelId: 2`
   in data.js, id `L2C04`). Same mechanism Classes 1-3 already
   proved three times over. Its 6 remaining "Vocal Technique"
   siblings (Mixed Voice through First Performance Assessment)
   remain untouched `comingSoon` placeholders, renumbered 5-10.

   Core idea: "Singers commonly use 'head voice' to describe a
   lighter vocal coordination... The term does not mean the sound is
   produced inside the head... Not everyone will experience an
   obvious difference immediately. The goal today is exploration,
   not achieving a particular sound." Same gentle, 10-15 minute
   pacing as Classes 1-3 — no register classification claims, no
   high-note pushing, voice breaks treated as normal, not failure.

   Honesty boundaries, matching every earlier class: no fabricated
   pitch/register analysis; completion never depends on perfect
   pitch, a successful recording, reaching a high note, or finishing
   every optional exercise (the spec says this explicitly).

   Like Class 3 (and unlike Classes 1-2), Section I is five plain,
   literal first-person self-attestations, so this file reuses
   Class 3's plain-checkbox completion pattern (Class 10's original
   `PRE_CHECK_ITEMS` style) rather than exercise-derived checkpoints.

   Reuses: LessonKit (+ its automatic Warm-up card), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. The "skip this exercise" button and
   the "reuse an earlier recording instead of asking again" pattern
   are both reused exactly as Classes 1-3 established them. Section
   F additionally reuses Class 3's own saved "mmm-ah" recording
   directly via `ClassActivity.get("L2C03")` — the first cross-class
   recording reference within Level 2, mirroring how Level 1 classes
   referenced Class 10's baseline (Class 11) and Class 25 compared
   against it again.
   ============================================================ */

const HeadVoiceFoundationsLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "oo", label: "“oo”" },
    { id: "pitch", label: "Pitch" },
    { id: "glide", label: "Glide" },
    { id: "compare", label: "Compare" },
    { id: "record", label: "Record" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am exploring my voice today.";

  const CHECKLIST_ITEMS = [
    { key: "understood", label: "I understand the basic idea of head voice." },
    { key: "ooExplored", label: "I explored a gentle “oo” sound or chose to skip it." },
    { key: "pitchExplored", label: "I tried a small pitch movement or chose to skip it." },
    { key: "avoidedForcing", label: "I avoided forcing high notes." },
    { key: "reflected", label: "I reflected on how comfortable the exercises felt." },
  ];
  const PROGRESS_ITEMS = CHECKLIST_ITEMS;

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    compareSensation: {
      question: "Compared with Class 3's “mmm-ah,” how did this “oo” feel?",
      options: [opt("lighter", "The “oo” felt lighter"), opt("similar", "The two sounds felt similar"), opt("harder", "The “oo” felt harder to produce"), opt("unsure", "I'm not sure yet")],
    },
    feltEasy: { question: "Did the sound feel easy or effortful?", options: [opt("easy", "Easy", "good"), opt("effortful", "Somewhat effortful", "maybe"), opt("unsure", "Not sure")] },
    tensionNoticed: { question: "Did I feel any tension in my jaw, neck, or throat?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    triedHighNote: { question: "Was I trying to reach a high note?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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

  function class3MmmAh() {
    return (ClassActivity.get("L2C03").answers.recs || {}).mmmAhTake || null;
  }

  function derivedCheckpoints(rec) {
    const out = {};
    const c = checklist(rec);
    CHECKLIST_ITEMS.forEach((item, i) => { out[item.key] = !!c[i]; });
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function problems() {
    const items = [
      ["Trying to sing as high as possible", "Explore only comfortable sounds and stop before strain."],
      ["Making the sound breathy on purpose", "Aim for an easy, gentle sound; do not force breathiness."],
      ["Pushing the chin upward or tightening the neck", "Keep the head and neck comfortable."],
      ["Trying to force a sudden voice break", "Let the voice change naturally. There is no need to create a break."],
      ["Assuming that no head sensation means failure", "Physical sensations vary between people."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([t, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${t}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function compareHtml() {
    const mmmAh = class3MmmAh();
    return `
      ${mmmAh ? `<button type="button" data-play-compare="mmmah" class="vr-btn mb-4">${icon("play", "w-3.5 h-3.5")} Play my “mmm-ah” from Class 3</button>` : `<p class="text-sm text-ink-500 mb-4">You don't have a saved “mmm-ah” from Class 3 on this device — that's fine, just compare from memory.</p>`}
      <p class="text-xs text-ink-500 mb-4">None of these answers is wrong — a beginner doesn't need to identify a register accurately by sensation alone.</p>`;
  }

  function recordReviewHtml(rec) {
    const sources = [["ooTake", "Gentle “oo”"], ["glideTake", "Small glide"]];
    const present = sources.filter(([k]) => take(rec, k));
    if (!present.length) return "";
    return `<div class="flex flex-wrap gap-2 mb-4">${present.map(([k, label]) => `<button type="button" data-play-review="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${label}</button>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 4 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">A lighter sound, gently explored.</p>
        <p class="text-sm text-ink-300">Head voice isn't something to find and prove — it's a coordination you're beginning to notice.</p>
        <p class="text-sm text-ink-100">No obvious difference yet? Completely normal.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Up Next: Level 2, Class 5 — Connecting Chest & Head Voice</p>
        <p class="text-sm text-ink-300 leading-relaxed">The next lesson will explore gentle transitions between different vocal coordinations — no advanced mixing or demanding register transitions yet.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">A lighter vocal quality, explored gently — no forcing, no searching for proof.</h3>
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

        ${chapter("understand", 1, "Section A — Welcome and concept", `
          ${narrow(`
            ${p("Singers commonly use “head voice” to describe a lighter vocal coordination that can be useful in higher parts of the singing range.")}
            ${p("The term does not mean the sound is produced inside the head. Some singers notice sensations around the face or head, while others do not — not everyone will experience an obvious difference immediately.")}
            ${p("The goal today is exploration, not achieving a particular sound. Chest voice and head voice are terms for vocal coordination, not two completely separate physical sound sources.")}
          `)}
          ${flowStrip(["RELAX", "EXPLORE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("listen", 2, "Section B — Relax and listen", `
          ${narrow(`
            <ol class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Sit or stand comfortably.", "Relax the shoulders and jaw.", "Say a short sentence naturally — e.g. “" + SENTENCE + "”", "Take an ordinary, comfortable breath.", "Pause and check that the throat feels comfortable."].map((t, i) => `<li class="flex gap-2"><span class="text-gold-400">${i + 1}.</span>${t}</li>`).join("")}
            </ol>
            <p class="text-xs text-ink-500 mt-4">No intensive breathing exercises or breath-holding here — just a moment to settle.</p>
          `)}
        `)}

        ${chapter("oo", 3, "Section C — Gentle, light sound exploration", `
          ${narrow(`
            ${p("A short, comfortable “oo” — similar to the beginning of a gentle owl-like sound, without imitating an extreme pitch. Keep it soft but clear, stop after about 2 seconds, rest, and repeat up to three times only if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">No need to reach a high note — the sound may stay close to your normal speaking pitch. If this feels uncomfortable, try saying “oo” gently as if speaking a word instead, or skip the exercise.</p>
          `)}
          ${recCard("ooTake", "Gentle “oo”", "", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("oo")}</div>`)}
        `)}

        ${chapter("pitch", 4, "Section D — Small pitch movement", `
          ${narrow(p("Listen to a comfortable reference note first. If comfortable, imitate it gently, then explore one nearby note slightly higher or lower — resting between attempts. There's no specific note to reach; comfortable pitches differ between voices."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("hv-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} Slightly higher</button>
            <button type="button" data-play-pitch="lower" class="vr-btn">${icon("play", "w-4 h-4")} Slightly lower</button>
          </div>
          ${recCard("pitchTake", "Imitate the note, if comfortable", "Entirely optional.", 12)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
        `, { wide: true })}

        ${chapter("glide", 5, "Section E — Gentle sound glide (optional)", `
          ${narrow(`
            ${p("Only if you feel comfortable: a very small, smooth “oo” glide between two nearby pitches. Keep the movement small, a comfortable volume, no pushing upward, no deliberately flipping or cracking the voice, no holding the sound for a long time. Rest after one or two attempts.")}
            <p class="text-xs text-ink-500 mb-4">If the voice changes naturally, or you can't make the glide at all, that's normal exploration — not failure.</p>
          `)}
          ${recCard("glideTake", "Small “oo” glide", "", 10)}
          ${narrow(`<div class="mt-3">${skipBtn("glide")}</div>`)}
        `)}

        ${chapter("compare", 6, "Section F — Compare sensations, without judging", `
          ${narrow(`
            ${p("Compare your earlier comfortable “mmm-ah” from Class 3 with the gentle “oo” you just explored.")}
            <div data-compare-host>${compareHtml()}</div>
            ${SelfAssessment.render("compareSensation-q", { ...Q.compareSensation, selected: sel("compareSensation") })}
          `)}
        `)}

        ${chapter("record", 7, "Section G — Optional recording", `
          ${narrow(p("Recording is entirely optional — nothing here is automatically analyzed."))}
          ${recCard("spokenSentence", "A short spoken sentence", "", 10)}
          <div data-review-host class="mt-2">${recordReviewHtml(rec)}</div>
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("feltEasy-q", { ...Q.feltEasy, selected: sel("feltEasy") })}
              ${SelfAssessment.render("tensionNoticed-q", { ...Q.tensionNoticed, selected: sel("tensionNoticed") })}
              ${SelfAssessment.render("triedHighNote-q", { ...Q.triedHighNote, selected: sel("triedHighNote") })}
              <div><label class="block text-sm text-ink-200 mb-1.5" for="hv-again">What would I like to explore again?</label><textarea id="hv-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
            </div>
          `)}
        `)}

        ${chapter("mistakes", 8, "Section H — Common beginner mistakes", problems())}

        ${chapter("reflect", 9, "Section I — Class reflection and completion", `
          ${narrow(`
            ${p("A simple checklist — tick what's true for you. Completion doesn't depend on perfect pitch, a successful recording, reaching a high note, or finishing every optional exercise.")}
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
          ${PersonalNotes.render("notes-hv", { placeholder: "e.g. How the “oo” compared to “mmm-ah”... Any tension I noticed... What I want to try next time..." })}
        `)}

        ${chapter("complete", 11, "Section J — Optional home practice", `
          ${narrow(`
            ${p("About 2–3 optional minutes: say one short sentence naturally, make two comfortable “oo” sounds, rest, and — if comfortable — try one small pitch glide. Record one observation if you'd like. No need for excessive repetition or practising through discomfort.")}
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

    /* ---- Section D: piano + playback ---- */
    own(VirtualPiano.wire(container, "hv-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi >= RANGE.from && midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else if (btn.dataset.playPitch === "higher") PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
      else PianoSynth.playSequence([Math.max(RANGE.from, b - STEP), b], { duration: 0.9, gap: 0.3 });
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

    /* ---- Section F: play Class 3's "mmm-ah" ---- */
    function onPlayCompare(e) {
      if (!e.target.closest('[data-play-compare="mmmah"]')) return;
      const t = class3MmmAh();
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayCompare);
    cleanups.push(() => container.removeEventListener("click", onPlayCompare));

    /* ---- recordings ---- */
    function refreshReviewHost() {
      const host = $("[data-review-host]");
      if (host) host.innerHTML = recordReviewHtml(rec0());
    }
    const NAMES = { ooTake: "Gentle “oo”", pitchTake: "Pitch exploration", glideTake: "Small glide", spokenSentence: "Spoken sentence" };
    const MAX_SECONDS = { ooTake: 10, pitchTake: 12, glideTake: 10, spokenSentence: 10 };
    const REVIEW_SOURCE_KEYS = ["ooTake", "glideTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 4 — ${NAMES[k]}`, exercise: `head-voice-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings");
          if (REVIEW_SOURCE_KEYS.includes(k)) refreshReviewHost();
        },
      }));
    });

    /* ---- Section G: play-to-review ---- */
    function onPlayReview(e) {
      const btn = e.target.closest("[data-play-review]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playReview);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayReview);
    cleanups.push(() => container.removeEventListener("click", onPlayReview));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = { "compareSensation-q": "compareSensation", "feltEasy-q": "feltEasy", "tensionNoticed-q": "tensionNoticed", "triedHighNote-q": "triedHighNote" };
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
    own(PersonalNotes.wire(container, "notes-hv", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: "Head voice is a lighter coordination to notice gently, not a sensation to search for or prove I have.",
        struggled: q(rec, "tensionNoticed") === "yes" || q(rec, "tensionNoticed") === "alittle" ? "Some jaw/neck/throat tension noticed." : "",
        toPractice: A(rec, "growth").exploreAgain || "",
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
