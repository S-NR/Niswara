/* ============================================================
   LEVEL 2, CLASS 2 — RESONANCE (interactive lesson)

   Rendered by ClassDetailPage for interactive: "resonance".

   Curriculum identity: Level 2, Class 2 (`number: 2`, `levelId: 2`
   in data.js, id `L2C02`). Same mechanism Class 1 (Voice Placement,
   L2C01) already proved — `LessonKit.header()` renders "LEVEL
   {levelId} · CLASS {number}" directly from those fields, so this
   needed no special-casing. Its 8 remaining "Vocal Technique"
   siblings (Chest Voice through First Performance Assessment)
   remain untouched `comingSoon` placeholders, renumbered 3-10.

   Core idea: "When your vocal folds produce sound, the throat,
   mouth, and other parts of your vocal tract shape that sound. You
   do not need to push your voice into your nose, throat, chest, or
   forehead. You also do not need to feel a particular vibration to
   perform an exercise correctly." Direct continuation of Class 1's
   tone and pacing (10-15 minutes, gentle, no forced sensation, no
   chest/head/mixed classification — that's explicitly deferred to
   later classes).

   Honesty boundaries, matching Class 1 and every Level 1 class: no
   fabricated resonance/tone analysis (none exists in this
   codebase); the 1-5 confidence rating is explicitly labelled
   self-reported understanding, not vocal skill; recordings stay
   private per account.

   Unlike Class 1, this spec gives no literal "knowledge check" or
   fixed completion-checklist text — Section 6's reflection list and
   general "don't force every exercise" tone are followed instead,
   with PROGRESS_ITEMS built around this lesson's own 6 lettered
   sections (A-F) plus its reflection step, kept deliberately short
   (7 items) to match Class 1's precedent for this 10-15 minute
   scope, without copying Class 1's exact checklist text (which was
   specific to that class's own spec).

   Reuses: LessonKit (+ its automatic Warm-up card, already proven
   for Level 2 by Class 1 — no new gating needed), VirtualPiano
   (Class 3), RecordingCard (Class 5), SelfAssessment (Class 4),
   PersonalNotes, ClassProgress. The "skip this exercise" button
   pattern and the written-reflection-when-unsupported fallback are
   both reused exactly as Class 1 (L2C01) established them, extended
   here from Class 1's humming-only skip to every recordable section
   (C, D, E), consistent with this class's own repeated "two or
   three times at most," "do not require" framing even where a given
   section doesn't restate the word "skip."
   ============================================================ */

const ResonanceLesson = (() => {
  const STAGES = [
    { id: "understand", label: "Understand" },
    { id: "listen", label: "Listen" },
    { id: "hum", label: "Hum" },
    { id: "vowel", label: "Vowel" },
    { id: "volume", label: "Volume" },
    { id: "pitch", label: "Pitch" },
    { id: "compare", label: "Compare" },
    { id: "mistakes", label: "Mistakes" },
    { id: "reflect", label: "Reflect" },
    { id: "complete", label: "Complete" },
  ];

  const RANGE = { from: 48, to: 72 };
  const STEP = 2;
  const SENTENCE = "I am learning to understand my voice.";

  const PROGRESS_ITEMS = [
    { key: "listenReflected", label: "Listened for the difference between speech and tone" },
    { key: "humExplored", label: "Explored gentle humming" },
    { key: "vowelExplored", label: "Explored vowel shapes" },
    { key: "volumeCompared", label: "Compared soft and normal volume" },
    { key: "pitchExplored", label: "Explored a gentle pitch change" },
    { key: "recordingsCompared", label: "Compared recordings (or reflected in writing)" },
    { key: "reflectionCompleted", label: "Personal reflection completed" },
  ];

  const opt = (value, label, tone = "neutral") => ({ value, label, tone });
  const Q = {
    softChange: { question: "Does the tone change when I speak more softly?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    mouthShapeChange: { question: "Does the tone change when I alter my mouth shape?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    toneVsLouder: { question: "Am I changing the tone, or merely making it louder?", options: [opt("tone", "Changing the tone", "good"), opt("louder", "Just louder", "maybe"), opt("both", "A bit of both"), opt("unsure", "Not sure")] },
    clearestVowel: { question: "Which vowel sounded clearest to me?", options: [opt("ah", "“ah”"), opt("oo", "“oo”"), opt("ee", "“ee”"), opt("unsure", "Not sure")] },
    easiestVowel: { question: "Which vowel felt easiest?", options: [opt("ah", "“ah”"), opt("oo", "“oo”"), opt("ee", "“ee”"), opt("unsure", "Not sure")] },
    strainedVowel: { question: "Did any vowel feel strained?", options: [opt("ah", "“ah”", "maybe"), opt("oo", "“oo”", "maybe"), opt("ee", "“ee”", "maybe"), opt("none", "None of them", "good")] },
    heardWithoutVolume: { question: "Could I hear a difference without increasing volume?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    volumeToneChanged: { question: "Did the tone change between soft and normal volume?", options: [opt("yes", "Yes", "good"), opt("no", "No", "neutral"), opt("unsure", "Not sure")] },
    volumeTightened: { question: "Did I unintentionally tighten my throat?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
    volumeComfortable: { question: "Could I maintain comfort at both volumes?", options: [opt("yes", "Yes", "good"), opt("mostly", "Mostly", "good"), opt("no", "Not really", "maybe"), opt("unsure", "Not sure")] },
    easiestExercise: { question: "Which exercise felt easiest?", options: [opt("listen", "Listening before singing"), opt("hum", "Gentle humming"), opt("vowel", "Vowel shapes"), opt("volume", "Soft vs. normal volume"), opt("pitch", "Pitch change"), opt("notsure", "Not sure")] },
    comfortableVowel: { question: "Which vowel sounded most comfortable?", options: [opt("ah", "“ah”"), opt("oo", "“oo”"), opt("ee", "“ee”"), opt("notsure", "Not sure")] },
    jawTension: { question: "Did I notice any jaw or throat tension?", options: [opt("no", "No", "good"), opt("alittle", "A little", "maybe"), opt("yes", "Yes", "maybe"), opt("unsure", "Not sure")] },
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

  function derivedCheckpoints(rec) {
    const out = {};
    if (q(rec, "softChange") && q(rec, "mouthShapeChange") && q(rec, "toneVsLouder")) out.listenReflected = true;
    if (take(rec, "humTake") || skipped(rec, "hum")) out.humExplored = true;
    if (take(rec, "vowelTake") || skipped(rec, "vowel")) out.vowelExplored = true;
    if ((take(rec, "softTake") && take(rec, "normalTake")) || skipped(rec, "volume")) out.volumeCompared = true;
    if (take(rec, "pitchTake") || skipped(rec, "pitch")) out.pitchExplored = true;
    const g = A(rec, "growth");
    if (filled(g.recordingDifferences) || filled(g.writtenReflection)) out.recordingsCompared = true;
    if (q(rec, "easiestExercise") && q(rec, "comfortableVowel") && filled(g.toneChangesNoticed)) out.reflectionCompleted = true;
    return out;
  }

  /* ---------- small views ---------- */
  const recCard = (k, title, hint, max = 15) => RecordingCard.render(`rc-${k}`, { title, hint, maxSeconds: max, section: false });
  const flowStrip = (steps) => `<div class="flex flex-wrap items-center justify-center gap-2 my-4">${steps.map((s, i, arr) => `<span class="flow-chip !text-sm">${s}</span>${i < arr.length - 1 ? `<span class="text-ink-700 text-xs">→</span>` : ""}`).join("")}</div>`;
  const skipBtn = (k, label = "Skip this exercise") => `<button type="button" data-skip-ex="${k}" class="text-xs text-ink-500 hover:text-ink-300 underline">${label}</button>`;

  function problems() {
    const items = [
      ["“More resonance means louder singing.”", "Resonance and volume are different. Start with a comfortable volume."],
      ["“I must feel vibration in my face.”", "Sensations vary. Do not force a vibration."],
      ["“A nasal sound always means good resonance.”", "A nasal quality is not automatically desirable or undesirable. Learn to listen to the tone and follow comfortable, clear production."],
      ["“I need to open my mouth as widely as possible.”", "Use a natural, comfortable mouth shape. Excessive jaw opening can create tension."],
      ["“My voice should sound like a professional singer already.”", "Tone develops gradually with practice and feedback."],
    ];
    return `<div class="flex flex-col gap-2">${items.map(([qtext, a]) => `
      <details class="group rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
        <summary class="cursor-pointer list-none flex items-center justify-between gap-3 text-ink-100 font-display text-lg">${qtext}<span class="text-ink-500 text-sm transition-transform group-open:rotate-45">＋</span></summary>
        <p class="text-sm text-ink-300 leading-relaxed mt-3">${a}</p>
      </details>`).join("")}</div>`;
  }

  function milestone() {
    return `
      <div class="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-500/[0.08] via-transparent to-teal-500/[0.06] p-6 sm:p-10 text-center">
        <p class="text-[11px] tracking-[0.3em] uppercase text-gold-400/80 mb-3">Level 2, Class 2 milestone</p>
        <p class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">You're learning to listen for tone, not just volume.</p>
        <p class="text-sm text-ink-300">Resonance isn't a sensation to chase — it's something you notice by listening.</p>
        <p class="text-sm text-ink-100">Small, comfortable changes are enough for today.</p>
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
        <p class="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 mb-2">Next: Level 2, Class 3 — Chest Voice Foundations</p>
        <p class="text-sm text-ink-300 leading-relaxed">In the next lesson, we will explore comfortable, speech-like lower and middle vocal sounds. We will learn to recognize easy vocal production without pushing the voice higher or trying to make it artificially heavy.</p>
      </div>`;
    if (status === "completed") {
      return `
        <div class="flex flex-col gap-6">
          ${milestone()}
          <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.05] p-6 sm:p-8 text-center">
            <p class="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-2">Class complete</p>
            <h3 class="font-display text-2xl text-ink-50 mb-5">Today, we made small, comfortable sound changes and listened carefully.</h3>
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

  function compareHtml(rec) {
    const growth = A(rec, "growth");
    const recordingAvailable = VoiceRecorder.isSupported();
    const compareTakes = ["spokenPhrase", "humTake", "vowelTake"].map((k) => ({ k, t: take(rec, k) })).filter((x) => x.t);
    if (compareTakes.length) {
      return `
        <div class="flex flex-wrap gap-2 mb-4">
          ${compareTakes.map(({ k }) => `<button type="button" data-play-compare="${k}" class="vr-btn">${icon("play", "w-3.5 h-3.5")} ${k === "spokenPhrase" ? "Spoken phrase" : k === "humTake" ? "Hum" : "Vowels"}</button>`).join("")}
        </div>
        <div><label class="block text-sm text-ink-200 mb-1.5" for="rs-diff">What differences did I notice between my recordings?</label><textarea id="rs-diff" data-growth="recordingDifferences" rows="3" class="field" placeholder="e.g. My hum felt clearer than my spoken voice…">${Utils.escapeHtml(growth.recordingDifferences || "")}</textarea></div>`;
    }
    if (recordingAvailable) return `<p class="text-sm text-ink-500">Record the spoken phrase, hum or vowels above, then come back here to compare them.</p>`;
    return `
      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <p class="text-sm text-ink-300 mb-3">Recording isn't available in this browser — that's completely fine. Write a short reflection instead.</p>
        <textarea data-growth="writtenReflection" rows="3" class="field" placeholder="What did you notice about tone, comfort, or how the sounds compared?">${Utils.escapeHtml(growth.writtenReflection || "")}</textarea>
      </div>`;
  }

  /* ---------- page ---------- */
  function render(cls, status) {
    const rec = ClassActivity.get(cls.id);
    const pct = ClassProgress.percent(PROGRESS_ITEMS, rec.checkpoints);
    const b = baseNote(rec);
    const sel = (k) => q(rec, k);
    const growth = A(rec, "growth");

    return `
    <div class="pitch-lesson">
      ${LessonKit.header(cls, status, pct)}
      ${LessonKit.stepper(STAGES, cls)}

      <div class="max-w-5xl mx-auto px-5 lg:px-8 py-12 flex flex-col gap-20">

        ${chapter("understand", 1, "Welcome to Class 2!", `
          ${p("Last time, you explored voice placement and learned to notice how your voice feels and sounds. Today, we explore resonance.")}
          ${p("When your vocal folds produce sound, the throat, mouth, and other parts of your vocal tract shape that sound. This contributes to the tone we hear.")}
          ${p("You do not need to push your voice into your nose, throat, chest, or forehead. You also do not need to feel a particular vibration to perform an exercise correctly.")}
          ${p("Today, we will make small, comfortable sound changes and listen carefully. About 10–15 minutes, with optional breaks.")}
          ${flowStrip(["LISTEN", "EXPLORE", "COMPARE", "REFLECT"])}
          <div data-lesson-viewed-sentinel class="h-px"></div>
        `)}

        ${chapter("understand", 2, "Understanding resonance", `
          ${narrow(`
            <ul class="flex flex-col gap-2 text-sm text-ink-300 leading-relaxed">
              ${["Vocal-fold vibration produces the initial sound.", "The vocal tract shapes and filters that sound.", "Vowel shapes influence the resulting tone.", "Resonance is not the same as volume.", "Nasal resonance and oral vowel shaping are related concepts — but they're not the same as forcing air through the nose.", "Different voices naturally have different tone qualities."].map((t) => `<li class="flex gap-2"><span class="text-gold-400">•</span>${t}</li>`).join("")}
            </ul>
          `)}
        `)}

        ${chapter("listen", 3, "Section A — Listen before singing", `
          ${narrow(`
            <p class="dc-lyric font-display text-2xl sm:text-3xl text-ink-50 my-3">“${SENTENCE}”</p>
            ${p("Speak it naturally, then repeat it and listen to the differences between ordinary speech and a gentle sung sound. These are listening observations, not a test.")}
          `)}
          ${recCard("spokenPhrase", "Speak the sentence", "", 10)}
          ${narrow(`
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("softChange-q", { ...Q.softChange, selected: sel("softChange") })}
              ${SelfAssessment.render("mouthShapeChange-q", { ...Q.mouthShapeChange, selected: sel("mouthShapeChange") })}
              ${SelfAssessment.render("toneVsLouder-q", { ...Q.toneVsLouder, selected: sel("toneVsLouder") })}
            </div>
          `)}
        `)}

        ${chapter("hum", 4, "Section B — Gentle humming", `
          ${narrow(`
            ${p("Relax the jaw and shoulders. Hum a soft “mmm” at a comfortable pitch for about 2–3 seconds. Rest normally. Repeat three to five times only if comfortable.")}
            <p class="text-xs text-ink-500 mb-4">A vibration around the lips or face may be noticed, but it isn't compulsory and doesn't independently prove correct technique.</p>
          `)}
          ${recCard("humTake", "Gentle humming", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("hum")}</div>`)}
        `)}

        ${chapter("vowel", 5, "Section C — Explore vowel shapes", `
          ${narrow(`
            ${p("A single comfortable pitch, easy volume. Begin with an easy hum, then open into each vowel without pushing, jaw relaxed: “mmm–ah,” “mmm–oo,” “mmm–ee.” Rest between repetitions. Repeat each pattern two or three times at most.")}
            <p class="text-xs text-ink-500 mb-4">Changing the mouth and tongue shape changes the vocal tract and affects the sound — no vowel is universally "best."</p>
          `)}
          ${recCard("vowelTake", "“mmm–ah” · “mmm–oo” · “mmm–ee”", "", 20)}
          ${narrow(`
            <div class="mt-3">${skipBtn("vowel")}</div>
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("clearestVowel-q", { ...Q.clearestVowel, selected: sel("clearestVowel") })}
              ${SelfAssessment.render("easiestVowel-q", { ...Q.easiestVowel, selected: sel("easiestVowel") })}
              ${SelfAssessment.render("strainedVowel-q", { ...Q.strainedVowel, selected: sel("strainedVowel") })}
              ${SelfAssessment.render("heardWithoutVolume-q", { ...Q.heardWithoutVolume, selected: sel("heardWithoutVolume") })}
            </div>
          `)}
        `)}

        ${chapter("volume", 6, "Section D — Compare soft and normal volume", `
          ${narrow(p("At a comfortable pitch, sing one short vowel at a soft but audible volume, then at an ordinary comfortable volume — never a whisper, never forced. Resonance isn't simply a matter of being louder."))}
          <div class="grid sm:grid-cols-2 gap-3 mb-4">
            ${recCard("softTake", "Soft volume", "", 8)}
            ${recCard("normalTake", "Normal volume", "", 8)}
          </div>
          ${narrow(`
            <div class="mt-1">${skipBtn("volume")}</div>
            <div class="flex flex-col gap-4 mt-5">
              ${SelfAssessment.render("volumeToneChanged-q", { ...Q.volumeToneChanged, selected: sel("volumeToneChanged") })}
              ${SelfAssessment.render("volumeTightened-q", { ...Q.volumeTightened, selected: sel("volumeTightened") })}
              ${SelfAssessment.render("volumeComfortable-q", { ...Q.volumeComfortable, selected: sel("volumeComfortable") })}
            </div>
          `)}
        `)}

        ${chapter("pitch", 7, "Section E — Listen to a gentle pitch change", `
          ${narrow(p("Select a comfortable note, hum it gently. If comfortable, move to one nearby note and return — listening for changes in tone and ease, not extending the range. This doesn't classify your voice as chest, head or mixed — that's for later classes."))}
          <div class="rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950 p-4 sm:p-6 shadow-2xl mb-3">
            ${VirtualPiano.render("rs-piano", { controls: false, keyboard: true, display: true })}
          </div>
          ${narrow(`<p class="text-sm text-ink-300 mb-5">Your note: <strong class="text-ink-50 font-display text-xl" data-base-note>${N(b)}</strong></p>`)}
          <div class="flex flex-wrap gap-3 mb-4">
            <button type="button" data-play-pitch="base" class="vr-btn vr-btn-gold">${icon("play", "w-4 h-4")} Reference note</button>
            <button type="button" data-play-pitch="higher" class="vr-btn">${icon("play", "w-4 h-4")} One note higher, then back</button>
          </div>
          ${recCard("pitchTake", "Hum your reference note gently", "", 15)}
          ${narrow(`<div class="mt-3">${skipBtn("pitch")}</div>`)}
        `, { wide: true })}

        ${chapter("compare", 8, "Section F — Compare your recordings", `
          ${narrow(p("Microphones, background noise, room acoustics and playback equipment all affect perceived tone — these recordings are for your own listening, not a measurement."))}
          <div data-compare-host>${compareHtml(rec)}</div>
        `)}

        ${chapter("mistakes", 9, "Common misunderstandings", problems())}

        ${chapter("reflect", 10, "Personal reflection and progress", `
          ${narrow(`
            <div class="flex flex-col gap-4 mb-5">
              ${SelfAssessment.render("easiestExercise-q", { ...Q.easiestExercise, selected: sel("easiestExercise") })}
              ${SelfAssessment.render("comfortableVowel-q", { ...Q.comfortableVowel, selected: sel("comfortableVowel") })}
              ${SelfAssessment.render("jawTension-q", { ...Q.jawTension, selected: sel("jawTension") })}
            </div>
            <div class="flex flex-col gap-4">
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rs-tone">What changes in tone did I notice?</label><textarea id="rs-tone" data-growth="toneChangesNoticed" rows="2" class="field" placeholder="In your own words…">${Utils.escapeHtml(growth.toneChangesNoticed || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rs-again">What would I like to explore again?</label><textarea id="rs-again" data-growth="exploreAgain" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.exploreAgain || "")}</textarea></div>
              <div><label class="block text-sm text-ink-200 mb-1.5" for="rs-question">What question do I have about resonance?</label><textarea id="rs-question" data-growth="resonanceQuestion" rows="2" class="field" placeholder="Optional…">${Utils.escapeHtml(growth.resonanceQuestion || "")}</textarea></div>
            </div>
            <div class="mt-5">
              <p class="text-sm text-ink-200 mb-2">How confident do I feel about understanding resonance? <span class="text-xs text-ink-500">(self-reported understanding, not an objective vocal-skill assessment)</span></p>
              <div class="flex gap-2" data-confidence>
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-confidence-value="${n}" class="w-10 h-10 rounded-full border text-sm font-medium transition-colors ${q(rec, "confidence") === String(n) ? "border-gold-400/50 bg-gold-500/15 text-gold-300" : "border-white/10 text-ink-400 hover:bg-white/5"}">${n}</button>`).join("")}
              </div>
            </div>
          `)}
        `)}

        ${chapter("complete", 11, "My Notes", `
          ${p("Your private notebook for this class. Only you can see it.")}
          ${PersonalNotes.render("notes-rs", { placeholder: "e.g. What my hum felt like today... Which vowel felt clearest... What I want to try next time..." })}
        `)}

        ${chapter("complete", 12, "Practice assignment", `
          ${narrow(`
            ${p("3–5 optional minutes: gentle humming, exploring two comfortable vowels, listening to the differences, and writing one observation. Keep it short — no need to practise daily or increase volume.")}
            ${p("Stop if there is pain, dizziness, unusual breathlessness, or persistent throat discomfort. Don't push through discomfort.")}
            <div data-warmup-note></div>
          `)}
        `)}

        ${chapter("complete", 13, "Your progress", `<div data-lesson-progress>${ClassProgress.render(`Class ${cls.number} Progress`, PROGRESS_ITEMS, rec.checkpoints, progressStats(cls))}</div>`)}

        ${chapter("complete", 14, status === "completed" ? "Milestone" : "Complete the class", `<div data-lesson-complete>${renderComplete(cls, rec, status)}</div>`)}
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
        if (v && !rec.checkpoints[k]) ClassActivity.markCheckpoint(classId, k, true);
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
    own(VirtualPiano.wire(container, "rs-piano", {
      range: RANGE, keyboard: true,
      onNote: ({ midi }) => { if (midi + STEP <= RANGE.to) { set("setup", "note", midi); $("[data-base-note]").textContent = N(midi); } },
    }));
    function onPlayPitch(e) {
      const btn = e.target.closest("[data-play-pitch]");
      if (!btn) return;
      const b = base();
      if (btn.dataset.playPitch === "base") PianoSynth.play(b, { duration: 1.2, velocity: 0.5 });
      else PianoSynth.playSequence([b + STEP, b], { duration: 0.9, gap: 0.3 });
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
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onSkip);
    cleanups.push(() => container.removeEventListener("click", onSkip));

    /* ---- recordings ---- */
    function wireGrowthTextareas(root) {
      root.querySelectorAll("[data-growth]").forEach((ta) => {
        const key = ta.dataset.growth;
        const save = Utils.debounce((v) => { set("growth", key, v); syncCheckpoints(); refreshLive(); }, 500);
        ta.addEventListener("input", () => save(ta.value));
      });
    }
    function refreshCompareHost() {
      const host = $("[data-compare-host]");
      if (host) { host.innerHTML = compareHtml(rec0()); wireGrowthTextareas(host); }
    }
    const NAMES = { spokenPhrase: "Spoken phrase", humTake: "Gentle humming", vowelTake: "Vowel shapes", softTake: "Soft volume", normalTake: "Normal volume", pitchTake: "Pitch change" };
    const MAX_SECONDS = { spokenPhrase: 10, humTake: 15, vowelTake: 20, softTake: 8, normalTake: 8, pitchTake: 15 };
    const COMPARE_SOURCE_KEYS = ["spokenPhrase", "humTake", "vowelTake"];
    Object.keys(NAMES).forEach((k) => {
      own(RecordingCard.wire(container, `rc-${k}`, {
        classId, take: take(rec0(), k), maxSeconds: MAX_SECONDS[k],
        meta: { name: `Level 2, Class 2 — ${NAMES[k]}`, exercise: `resonance-${k}` },
        onSaved: (t) => {
          set("recs", k, t); ClassActivity.bump(classId, "recordings"); syncCheckpoints();
          if (COMPARE_SOURCE_KEYS.includes(k)) refreshCompareHost();
          refreshLive();
        },
      }));
    });

    /* ---- Section F: play-to-compare + reflection ---- */
    function onPlayCompare(e) {
      const btn = e.target.closest("[data-play-compare]");
      if (!btn) return;
      const t = take(rec0(), btn.dataset.playCompare);
      if (t) VoiceRecorder.play(t.mediaId);
    }
    container.addEventListener("click", onPlayCompare);
    cleanups.push(() => container.removeEventListener("click", onPlayCompare));

    /* ---- generic self-assess dispatcher ---- */
    const assessMap = {
      "softChange-q": "softChange", "mouthShapeChange-q": "mouthShapeChange", "toneVsLouder-q": "toneVsLouder",
      "clearestVowel-q": "clearestVowel", "easiestVowel-q": "easiestVowel", "strainedVowel-q": "strainedVowel", "heardWithoutVolume-q": "heardWithoutVolume",
      "volumeToneChanged-q": "volumeToneChanged", "volumeTightened-q": "volumeTightened", "volumeComfortable-q": "volumeComfortable",
      "easiestExercise-q": "easiestExercise", "comfortableVowel-q": "comfortableVowel", "jawTension-q": "jawTension",
    };
    function onAssess(e) {
      const chip = e.target.closest("[data-assess-choice]");
      if (!chip) return;
      const group = chip.closest("[data-assess]");
      const name = group && group.dataset.assess;
      if (!name || !assessMap[name]) return;
      group.querySelectorAll("[data-assess-choice]").forEach((x) => x.classList.toggle("is-selected", x === chip));
      set("q", assessMap[name], chip.dataset.assessChoice);
      syncCheckpoints(); refreshLive();
    }
    container.addEventListener("click", onAssess);
    cleanups.push(() => container.removeEventListener("click", onAssess));

    /* ---- growth textareas (Section F's are re-wired by refreshCompareHost when that host is replaced) ---- */
    wireGrowthTextareas(container);

    /* ---- confidence rating ---- */
    function onConfidence(e) {
      const btn = e.target.closest("[data-confidence-value]");
      if (!btn) return;
      set("q", "confidence", btn.dataset.confidenceValue);
      container.querySelectorAll("[data-confidence-value]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("border-gold-400/50", on); b.classList.toggle("bg-gold-500/15", on); b.classList.toggle("text-gold-300", on);
        b.classList.toggle("border-white/10", !on); b.classList.toggle("text-ink-400", !on);
      });
    }
    container.addEventListener("click", onConfidence);
    cleanups.push(() => container.removeEventListener("click", onConfidence));

    /* ---- Common Warm-up note (only if already unlocked) ---- */
    const warmupHost = $("[data-warmup-note]");
    if (warmupHost && Warmup.isUnlocked()) {
      warmupHost.innerHTML = `<p class="text-sm text-ink-400 mt-2">You can also use the <a href="#/warmup" class="text-gold-300 hover:text-gold-200 underline">Common Warm-up</a> before practising, if that feels useful.</p>`;
    }

    /* ---- notes ---- */
    own(PersonalNotes.wire(container, "notes-rs", { classId, onSaved: (body) => { if (body.trim()) ClassActivity.markCheckpoint(classId, "notesAdded"); } }));

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
        learned: A(rec, "growth").toneChangesNoticed || "Resonance isn't the same as volume — tone changes with vowel shape and vocal tract, not just loudness.",
        struggled: q(rec, "jawTension") === "yes" || q(rec, "jawTension") === "alittle" ? "Some jaw/throat tension noticed." : "",
        toPractice: A(rec, "growth").exploreAgain || "",
        thoughts: filled(A(rec, "growth").resonanceQuestion) ? `Question for next time: ${A(rec, "growth").resonanceQuestion.trim()}` : "",
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
