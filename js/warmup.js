/* ============================================================
   WARM-UP — the common "🎤 Warm-up" section (not a class).

   A short, repeatable pre-singing routine built from the skills
   of Level 1 Classes 1–9. It unlocks only once all nine are
   completed (Store.completedClassIds — no bypass), and never
   renumbers or replaces a class.

   This module owns the routines (Quick / Full / Performance),
   the unlock rule, the learner-chosen emphasis and the history.
   The screens live in js/pages/warmup.js; the small reusable
   cards for class pages and recordings in
   js/components/warmupPrompt.js.

   History: each FINISHED warm-up is kept in the Store (this
   account's local slot) first, then saved to the account's
   warmup_sessions rows (0005_warmup_sessions.sql, owner-only
   RLS). Logged out, or before 0005 is run, it stays on the
   device and is uploaded the next time sync works.
   ============================================================ */

const Warmup = (() => {
  const FOUNDATION_IDS = ["L1C01", "L1C02", "L1C03", "L1C04", "L1C05", "L1C06", "L1C07", "L1C08", "L1C09"];

  /* ---- Steps: what each one practises, and which class it comes from ---- */
  const STEPS = {
    arrive:  { title: "Arrive & Listen", skill: "Listening & awareness", icon: "🌿", classes: [1], help: "" },
    relax:   { title: "Body & Vocal Relaxation", skill: "Relaxation", icon: "🫧", classes: [8], help: "Relaxation difficulty" },
    breath:  { title: "Comfortable Breath", skill: "Breathing", icon: "🌬️", classes: [2], help: "Breathing difficulty" },
    sound:   { title: "Gentle Sound Activation", skill: "Vocal activation", icon: "🎶", classes: [7], help: "Warm-up difficulty" },
    pitch:   { title: "Pitch Connection", skill: "Pitch matching", icon: "🎹", classes: [3, 4], help: "Pitch difficulty" },
    listen:  { title: "Listen to Your Own Voice", skill: "Self-listening", icon: "🎧", classes: [5], help: "Listening difficulty" },
    rhythm:  { title: "Rhythm Activation", skill: "Rhythm", icon: "🥁", classes: [6], help: "Rhythm difficulty" },
    control: { title: "Basic Vocal Control", skill: "Vocal control", icon: "🎚️", classes: [9], help: "Vocal control difficulty" },
    phrase:  { title: "Mini Musical Phrase", skill: "Putting it together", icon: "🎤", classes: [], help: "" },
    ready:   { title: "Ready to Sing?", skill: "Readiness check", icon: "✨", classes: [], help: "" },
  };

  /* ---- Routines. seconds = a gentle suggestion, never a deadline. variant tailors a step's content. ---- */
  const ROUTINES = {
    quick: {
      key: "quick", label: "Quick", title: "Quick Warm-up", time: "~5 min", use: "Before regular practice",
      steps: [
        { key: "relax", seconds: 30 }, { key: "breath", seconds: 45 }, { key: "sound", seconds: 60, variant: "hum" },
        { key: "pitch", seconds: 60 }, { key: "rhythm", seconds: 30 }, { key: "control", seconds: 45, variant: "pattern" },
        { key: "phrase", seconds: 30 },
      ],
    },
    full: {
      key: "full", label: "Full", title: "Full Warm-up", time: "~10–12 min", use: "Before serious practice",
      steps: [
        { key: "arrive", seconds: 40 }, { key: "relax", seconds: 50 }, { key: "breath", seconds: 60 },
        { key: "sound", seconds: 100 }, { key: "pitch", seconds: 100 }, { key: "listen", seconds: 50 },
        { key: "rhythm", seconds: 50 }, { key: "control", seconds: 90 }, { key: "phrase", seconds: 60 },
        { key: "ready", seconds: 40 },
      ],
    },
    performance: {
      key: "performance", label: "Performance", title: "Performance Warm-up", time: "~3–5 min", use: "Before recording or performing",
      steps: [
        { key: "relax", seconds: 30 }, { key: "breath", seconds: 40 }, { key: "sound", seconds: 45, variant: "hum" },
        { key: "pitch", seconds: 40, variant: "reference" }, { key: "control", seconds: 40, variant: "pattern" },
        { key: "phrase", seconds: 40 }, { key: "ready", seconds: 25, variant: "compact" },
      ],
    },
  };

  /* ---- Emphasis: the learner's choice, optionally suggested by their own Class 10 focus. Never a diagnosis. ---- */
  const EMPHASIS = [
    { value: "pitch", label: "Pitch matching", step: "pitch" },
    { value: "rhythm", label: "Rhythm", step: "rhythm" },
    { value: "transitions", label: "Note transitions", step: "control" },
    { value: "breath", label: "Comfortable breath", step: "breath" },
  ];
  const FOCUS_TO_EMPHASIS = { Pitch: "pitch", "Vocal stability": "pitch", Rhythm: "rhythm", Transitions: "transitions", Breathing: "breath" };
  const EMPHASIS_PREF_KEY = "niswara.warmup.emphasis";

  /* ---- Unlock (Classes 1–9 completed) ---- */
  function status() {
    const completed = Store.getState().completedClassIds;
    const done = FOUNDATION_IDS.filter((id) => completed.includes(id)).length;
    return { unlocked: done === FOUNDATION_IDS.length, done, total: FOUNDATION_IDS.length };
  }
  function isUnlocked() { return status().unlocked; }

  function classId(number) { return `L1C${String(number).padStart(2, "0")}`; }
  function fromLabel(step) {
    const c = STEPS[step].classes;
    if (!c.length) return step === "phrase" ? "Classes 1–9 together" : "";
    return c.length === 1 ? `From Class ${c[0]}` : `From Classes ${c[0]}–${c[c.length - 1]}`;
  }

  /** The learner's comfortable note: the one they chose in Class 7 or 4, inside their Class 4 range (as Class 10 does). */
  function comfortableNote() {
    const c4 = ClassActivity.get("L1C04").answers.setup || {};
    const range = c4.range === "lower" ? { from: 48, to: 60 } : { from: 60, to: 72 };
    const n = (ClassActivity.get("L1C07").answers.setup || {}).note ?? c4.note;
    return typeof n === "number" && n >= range.from && n <= range.to - 4 ? n : range.from;
  }

  function suggestedEmphasis() {
    const focus = (ClassActivity.get("L1C10").answers.focus || {}).value;
    return FOCUS_TO_EMPHASIS[focus] || null;
  }
  /** "none" = the learner turned it off; null = never chosen (use the suggestion). */
  function chosenEmphasis() {
    try { return localStorage.getItem(EMPHASIS_PREF_KEY); } catch (e) { return null; }
  }
  function setEmphasis(value) {
    try { localStorage.setItem(EMPHASIS_PREF_KEY, value || "none"); } catch (e) { /* per-device convenience */ }
  }
  function emphasis() {
    const c = chosenEmphasis();
    if (c === "none") return null;
    return EMPHASIS.some((e) => e.value === c) ? c : suggestedEmphasis();
  }

  /** The steps of a routine for today: the emphasised step gets a little more time (and its own variant). */
  function plan(mode, emph = emphasis()) {
    const routine = ROUTINES[mode];
    if (!routine) return null;
    const target = EMPHASIS.find((e) => e.value === emph);
    return routine.steps.map((s) => ({
      ...s,
      seconds: target && target.step === s.key ? s.seconds + 30 : s.seconds,
      emphasised: !!(target && target.step === s.key),
    }));
  }

  /** In-app return route after a warm-up (e.g. back to a recording). Only hash routes; never auth pages or another warm-up. */
  function safeReturn(raw) {
    if (!raw || !/^#\/[\w\-/]*$/.test(raw) || /^#\/(login|signup|warmup)/.test(raw)) return null;
    return raw;
  }
  function href(mode, returnTo) {
    const r = safeReturn(returnTo);
    return `#/warmup/${mode}${r ? `?return=${encodeURIComponent(r)}` : ""}`;
  }

  /* ---- History ---- */
  let remoteDisabled = false;
  function canSync() { return Auth.isConfigured && Auth.isLoggedIn() && !remoteDisabled; }
  function noteRemoteError(error) {
    if (!error) return;
    if (error.code === "PGRST205" || error.code === "42P01") {
      remoteDisabled = true;
      console.warn("Warmup: warmup_sessions table is missing — run supabase/migrations/0005_warmup_sessions.sql. History stays on this device.");
    } else {
      console.warn("Warmup: history sync failed, kept on this device.", error);
    }
  }
  Auth.onChange(() => { remoteDisabled = false; }); // new account / login: try the backend again

  function sessions() { return Store.getWarmupSessions(); }

  function fromRow(r) {
    return {
      id: r.id, type: r.warmup_type, startedAt: r.started_at, completedAt: r.completed_at, duration: r.duration,
      completedSteps: r.completed_steps || [], skippedSteps: r.skipped_steps || [], emphasis: r.emphasis || null,
    };
  }

  /** Pull the account's history, merge it in, and upload anything only this device has. Resolves to true if new rows arrived. */
  async function load() {
    if (!canSync()) return false;
    const { data, error } = await Auth.fetchWarmupSessions();
    if (error) { noteRemoteError(error); return false; }
    const remoteIds = new Set(data.map((r) => r.id));
    const added = Store.mergeWarmupSessions(data.map(fromRow));
    const missing = sessions().filter((s) => !remoteIds.has(s.id));
    if (missing.length) noteRemoteError((await Auth.saveWarmupSessions(missing)).error);
    return added;
  }

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /** A warm-up was finished: keep it, log it as practice, and save it to the account. */
  async function record({ type, startedAt, duration, completedSteps, skippedSteps, emphasis: emph }) {
    const session = {
      id: newId(), type, startedAt, completedAt: new Date().toISOString(),
      duration: Math.max(0, Math.round(duration)), completedSteps, skippedSteps, emphasis: emph || null,
    };
    Store.mergeWarmupSessions([session]);
    // Reuses the daily practice log: minutes under "Warm-up", and today's Warm-up tick
    Store.logMinutes("warmup", Math.max(1, Math.round(session.duration / 60)), { source: "warmup", warmupType: type });
    if (!Store.getTodayLog().tasks.warmup) Store.toggleTask("warmup");
    if (canSync()) noteRemoteError((await Auth.saveWarmupSessions([session])).error);
    return session;
  }

  function doneToday() {
    const today = Store.todayKey();
    return sessions().some((s) => s.completedAt && Store.todayKey(new Date(s.completedAt)) === today);
  }

  /** Counts for "Your Warm-up Journey" — awareness only: no streaks, no scores. */
  function stats() {
    const all = sessions();
    const byType = { quick: 0, full: 0, performance: 0 };
    const practiced = {}, skipped = {};
    all.forEach((s) => {
      if (byType[s.type] !== undefined) byType[s.type]++;
      (s.completedSteps || []).forEach((k) => { if (k !== "ready") practiced[k] = (practiced[k] || 0) + 1; });
      (s.skippedSteps || []).forEach((k) => { skipped[k] = (skipped[k] || 0) + 1; });
    });
    const top = (m) => { const e = Object.entries(m).sort((a, b) => b[1] - a[1])[0]; return e && STEPS[e[0]] ? STEPS[e[0]].skill : null; };
    return { total: all.length, byType, mostPracticed: top(practiced), mostSkipped: top(skipped) };
  }

  return {
    FOUNDATION_IDS, STEPS, ROUTINES, EMPHASIS,
    status, isUnlocked, classId, fromLabel, comfortableNote,
    suggestedEmphasis, chosenEmphasis, setEmphasis, emphasis, plan,
    safeReturn, href,
    sessions, load, record, doneToday, stats,
  };
})();
