/* ============================================================
   CLASS ACTIVITY
   Per-user progress for interactive lessons (checkpoints,
   exercise scores, reflection/assignment answers) and private
   per-class notes.

   Always written to the local Store first (that browser's slot
   for the current account — see Store.switchUser), then synced
   to Supabase when logged in:
     class_progress  (one row per user + class)
     class_notes     (one row per user + class, private)
   Both tables are owner-only via RLS (0003_class_progress.sql),
   so one learner's scores and notes never mix with another's.

   If the backend is unreachable or the tables don't exist yet,
   everything keeps working on this device and syncs next time.
   ============================================================ */

const ClassActivity = (() => {
  const PUSH_DELAY = 1200;
  const pushTimers = {};      // classId -> timeout
  const listeners = new Set();
  let remoteDisabledReason = null; // set once if the tables are missing, to stop retrying every keystroke

  function canSync() {
    return Auth.isConfigured && Auth.isLoggedIn() && !remoteDisabledReason;
  }

  function noteRemoteError(error) {
    if (!error) return;
    // PGRST205 / 42P01: table not found — migration 0003 hasn't been run on this project
    if (error.code === "PGRST205" || error.code === "42P01") {
      remoteDisabledReason = "missing-tables";
      console.warn("ClassActivity: Supabase tables for class progress are missing — run supabase/migrations/0003_class_progress.sql. Saving on this device only.");
    } else {
      console.warn("ClassActivity: sync failed, kept on this device.", error);
    }
  }

  function clone(rec) { return JSON.parse(JSON.stringify(rec)); }

  function get(classId) { return Store.getClassActivity(classId); }

  function emit(classId) {
    const rec = get(classId);
    listeners.forEach((fn) => { try { fn(classId, rec); } catch (e) { console.error(e); } });
  }

  /** Subscribe to record changes: fn(classId, record). Returns unsubscribe. */
  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  /** Combines a local record with the account's server row. Progress only ever moves forward. */
  function merge(local, remote) {
    if (!remote) return local;
    const r = {
      checkpoints: remote.checkpoints || {},
      exerciseStats: remote.exercise_stats || {},
      answers: remote.answers || {},
      completedAt: remote.completed_at || null,
      updatedAt: remote.updated_at || null,
    };
    const out = Store.emptyClassActivity();
    out.checkpoints = { ...r.checkpoints };
    Object.entries(local.checkpoints).forEach(([k, v]) => { if (v) out.checkpoints[k] = v; });

    const exIds = new Set([...Object.keys(local.exerciseStats), ...Object.keys(r.exerciseStats)]);
    exIds.forEach((id) => {
      const a = local.exerciseStats[id], b = r.exerciseStats[id];
      out.exerciseStats[id] = !a ? b : !b ? a : ((a.attempts || 0) >= (b.attempts || 0) ? a : b);
    });

    const remoteNewer = r.updatedAt && (!local.updatedAt || r.updatedAt > local.updatedAt);
    out.answers = remoteNewer ? { ...local.answers, ...r.answers } : { ...r.answers, ...local.answers };
    out.completedAt = [local.completedAt, r.completedAt].filter(Boolean).sort()[0] || null;
    out.updatedAt = [local.updatedAt, r.updatedAt].filter(Boolean).sort().pop() || null;
    return out;
  }

  const sameContent = (a, b) => {
    const strip = (r) => JSON.stringify({ ...r, updatedAt: null });
    return strip(a) === strip(b);
  };

  /**
   * Pull the account's saved progress for a class and merge it into the local copy.
   * Resolves to true if the account brought anything this device didn't have
   * (the lesson then redraws so exercises show it).
   */
  async function load(classId) {
    if (!canSync()) return false;
    const { data, error } = await Auth.fetchClassProgress(classId);
    if (error) { noteRemoteError(error); return false; }
    const local = get(classId);
    const merged = merge(local, data);
    Store.setClassActivity(classId, merged);
    if (!data || !sameContent(merged, merge(Store.emptyClassActivity(), data))) {
      schedulePush(classId); // this device knows things the server doesn't yet
    }
    emit(classId);
    return !sameContent(merged, local);
  }

  function schedulePush(classId) {
    if (!canSync()) return;
    clearTimeout(pushTimers[classId]);
    pushTimers[classId] = setTimeout(() => push(classId), PUSH_DELAY);
  }

  async function push(classId) {
    clearTimeout(pushTimers[classId]);
    delete pushTimers[classId];
    if (!canSync()) return;
    const { error } = await Auth.saveClassProgress(classId, get(classId));
    noteRemoteError(error);
  }

  /** Send any pending changes now (on page unmount / tab hide / before logout). */
  function flush() {
    return Promise.all(Object.keys(pushTimers).map((classId) => push(classId)));
  }

  function update(classId, mutate) {
    const rec = clone(get(classId));
    mutate(rec);
    rec.updatedAt = new Date().toISOString();
    Store.setClassActivity(classId, rec);
    schedulePush(classId);
    emit(classId);
    return rec;
  }

  function markCheckpoint(classId, key, value = true) {
    if (get(classId).checkpoints[key] === value) return get(classId);
    return update(classId, (rec) => { rec.checkpoints[key] = value; });
  }

  function emptyStats() {
    return { attempts: 0, correct: 0, questions: 0, roundsCompleted: 0, bestRoundAccuracy: null, lastPlayedAt: null };
  }

  function getStats(classId, exerciseId) {
    return { ...emptyStats(), ...(get(classId).exerciseStats[exerciseId] || {}) };
  }

  /** One answer given (a question can take several attempts). */
  function recordAttempt(classId, exerciseId, correct) {
    return update(classId, (rec) => {
      const s = { ...emptyStats(), ...(rec.exerciseStats[exerciseId] || {}) };
      s.attempts += 1;
      if (correct) s.correct += 1;
      s.lastPlayedAt = new Date().toISOString();
      rec.exerciseStats[exerciseId] = s;
    });
  }

  /** A question finished (answered correctly, or the answer was revealed). */
  function recordQuestion(classId, exerciseId) {
    return update(classId, (rec) => {
      const s = { ...emptyStats(), ...(rec.exerciseStats[exerciseId] || {}) };
      s.questions += 1;
      rec.exerciseStats[exerciseId] = s;
    });
  }

  /** A full round finished; firstTryAccuracy is 0–100. */
  function recordRound(classId, exerciseId, firstTryAccuracy) {
    return update(classId, (rec) => {
      const s = { ...emptyStats(), ...(rec.exerciseStats[exerciseId] || {}) };
      s.roundsCompleted += 1;
      s.bestRoundAccuracy = Math.max(s.bestRoundAccuracy || 0, firstTryAccuracy);
      rec.exerciseStats[exerciseId] = s;
    });
  }

  /** Increments a simple per-class counter (e.g. "recordings", "selfEvaluations"). Stored like exercise stats so merging keeps the larger count. */
  function bump(classId, counter) {
    return update(classId, (rec) => {
      const s = { ...emptyStats(), ...(rec.exerciseStats[counter] || {}) };
      s.attempts += 1;
      s.lastPlayedAt = new Date().toISOString();
      rec.exerciseStats[counter] = s;
    });
  }

  function count(classId, counter) {
    return getStats(classId, counter).attempts;
  }

  function setAnswer(classId, group, key, value) {
    return update(classId, (rec) => {
      rec.answers[group] = { ...(rec.answers[group] || {}), [key]: value };
    });
  }

  function markCompleted(classId) {
    const rec = update(classId, (r) => { r.completedAt = r.completedAt || new Date().toISOString(); });
    push(classId);
    return rec;
  }

  /* ---- Private notes ---- */

  /** Resolves to { body, updatedAt, savedTo: "account" | "device" }. */
  async function loadNote(classId) {
    const local = Store.getClassNote(classId);
    if (!canSync()) return { ...local, savedTo: "device" };
    const { data, error } = await Auth.fetchClassNote(classId);
    if (error) { noteRemoteError(error); return { ...local, savedTo: "device" }; }
    if (data && (!local.updatedAt || data.updated_at >= local.updatedAt)) {
      Store.setClassNote(classId, data.body, data.updated_at);
      return { body: data.body, updatedAt: data.updated_at, savedTo: "account" };
    }
    if (local.body) return saveNote(classId, local.body); // device has newer text — push it up
    return { ...local, savedTo: "account" };
  }

  /** Saves locally, then to the account. Resolves to { body, updatedAt, savedTo }. */
  async function saveNote(classId, body) {
    const now = new Date().toISOString();
    Store.setClassNote(classId, body, now);
    if (!canSync()) return { body, updatedAt: now, savedTo: "device" };
    const { data, error } = await Auth.saveClassNote(classId, body);
    if (error) { noteRemoteError(error); return { body, updatedAt: now, savedTo: "device" }; }
    Store.setClassNote(classId, body, data.updated_at);
    return { body, updatedAt: data.updated_at, savedTo: "account" };
  }

  window.addEventListener("pagehide", flush);

  return {
    get, load, onChange, flush, merge,
    markCheckpoint, getStats, recordAttempt, recordQuestion, recordRound, setAnswer, markCompleted, bump, count,
    loadNote, saveNote,
  };
})();
