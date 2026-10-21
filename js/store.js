/* ============================================================
   STORE
   Persistence + state layer. Every page reads/writes through
   Store; nothing else touches localStorage progress data.

   Each account has its own local slot ("ffntp.v1:<uid>"), and
   CloudSync mirrors the synced part of it to Supabase
   (learner_state) so progress follows the learner to any device.
   Data is shaped so two devices' changes MERGE rather than
   overwrite: practice is a list of sessions with ids, journal
   deletions are remembered, checklist ticks carry timestamps.
   ============================================================ */

const Store = (() => {
  const GUEST_KEY = "ffntp.v1"; // From First Note To Professional
  // Logged-in users get their own namespace ("ffntp.v1:<uid>") so a shared
  // browser never shows one account's progress to another.
  let storageKey = GUEST_KEY;
  const persistListeners = new Set();

  /** Local calendar date "YYYY-MM-DD" — practice days roll over at the learner's midnight, not UTC's. */
  function todayKey(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function newId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function nowIso() { return new Date().toISOString(); }

  function defaultState() {
    return {
      currentClassId: "L1C01",
      completedClassIds: [],
      classProgress: {},     // id -> { assignmentDone, reflection, answers:{}, uploads:[], updatedAt }
      practiceLog: {},       // "YYYY-MM-DD" -> day (see newDay)
      journal: [],           // {id, date, classId, learned, struggled, improved, toPractice, thoughts}
      deletedJournalIds: [], // so a deletion on one device isn't undone by another device's copy
      projects: null,        // seeded on first load; checklist items carry updatedAt
      milestoneUploads: {},  // milestoneId -> { fileName, mediaId, date } (file itself lives in Media)
      classActivity: {},     // classId -> interactive-lesson record; synced separately (class_progress)
      classNotes: {},        // classId -> { body, updatedAt }; synced separately (class_notes)
      createdAt: nowIso(),
      updatedAt: null,
    };
  }

  /* ---- Practice day shape ----
     sessions: [{ id, task, minutes, at }]  one per logged timer session (merge = union by id)
     baseMinutesByTask: minutes recorded before sessions existed (older data; merge = max)
     tasks / taskUpdatedAt: today's checklist ticks (merge = latest tick wins)
     minutesByTask / totalMinutes: derived — never edited directly */
  function newDay() {
    return { tasks: {}, taskUpdatedAt: {}, sessions: [], baseMinutesByTask: {}, minutesByTask: {}, totalMinutes: 0 };
  }

  function recomputeDay(day) {
    const m = { ...day.baseMinutesByTask };
    day.sessions.forEach((s) => { m[s.task] = (m[s.task] || 0) + s.minutes; });
    day.minutesByTask = m;
    day.totalMinutes = Object.values(m).reduce((a, b) => a + b, 0);
    return day;
  }

  function normalizeDay(day) {
    const d = { ...newDay(), ...day };
    d.tasks = { ...(day.tasks || {}) };
    d.taskUpdatedAt = { ...(day.taskUpdatedAt || {}) };
    d.sessions = (day.sessions || []).slice();
    if (!day.baseMinutesByTask) d.baseMinutesByTask = d.sessions.length ? {} : { ...(day.minutesByTask || {}) };
    return recomputeDay(d);
  }

  /** Brings any saved state (old versions, or another device's) to the current shape. */
  function normalize(s) {
    const out = { ...defaultState(), ...s };
    out.completedClassIds = [...new Set(out.completedClassIds || [])];
    out.deletedJournalIds = out.deletedJournalIds || [];
    out.practiceLog = Object.fromEntries(Object.entries(out.practiceLog || {}).map(([k, d]) => [k, normalizeDay(d)]));
    return seedProjects(out);
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      return normalize(raw ? JSON.parse(raw) : {});
    } catch (e) {
      console.warn("Store: failed to load, resetting.", e);
      return normalize({});
    }
  }

  function seedProjects(s) {
    if (!s.projects) {
      s.projects = JSON.parse(JSON.stringify(APP_DATA.PROJECTS_SEED));
      s.projects[0].startedAt = s.projects[0].startedAt || nowIso();
    }
    return s;
  }

  function writeLocal() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn("Store: failed to persist (storage may be full).", e);
      // Surfaced to the learner by app.js — a silent failure here means lost progress on reload.
      window.dispatchEvent(new CustomEvent("store:persist-failed", { detail: e }));
      return false;
    }
  }

  /** Every learner change goes through here: saves locally, then lets CloudSync know. */
  function persist() {
    state.updatedAt = nowIso();
    writeLocal();
    persistListeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  }

  /** Subscribe to learner changes (used by CloudSync to schedule an upload). */
  function onPersist(fn) {
    persistListeners.add(fn);
    return () => persistListeners.delete(fn);
  }

  /**
   * Point the Store at a user's namespace (null = guest) and reload state.
   * The first time an account logs in on this browser, the guest progress
   * moves into it, so nothing done before signing up is lost — and the
   * guest slot starts fresh for whoever uses the browser next.
   * Returns true if the active namespace changed.
   */
  function switchUser(userId) {
    const nextKey = userId ? `${GUEST_KEY}:${userId}` : GUEST_KEY;
    if (nextKey === storageKey) return false;
    try {
      const guestRaw = localStorage.getItem(GUEST_KEY);
      if (userId && guestRaw && !localStorage.getItem(nextKey)) {
        localStorage.setItem(nextKey, guestRaw);
        localStorage.removeItem(GUEST_KEY);
      }
    } catch (e) {
      console.warn("Store: couldn't adopt guest progress.", e);
    }
    storageKey = nextKey;
    state = load();
    return true;
  }

  /* ---- Cloud sync support (see CloudSync) ---- */

  // Interactive-lesson records and class notes have their own tables, so they're not part of learner_state.
  const LOCAL_ONLY_FIELDS = ["classActivity", "classNotes"];

  /** The part of the state that's stored in the account (learner_state.state). */
  function exportSyncState() {
    return normalizeForSync(state);
  }

  /** Any saved copy (e.g. the account's) in the same shape exportSyncState produces, for comparison. */
  function normalizeForSync(s) {
    const out = JSON.parse(JSON.stringify(normalize(s)));
    LOCAL_ONLY_FIELDS.forEach((f) => delete out[f]);
    return out;
  }

  const later = (a, b) => ((a || "") >= (b || "") ? a : b);

  function mergeDay(a, b) {
    if (!a) return b;
    if (!b) return a;
    const d = newDay();
    new Set([...Object.keys(a.tasks), ...Object.keys(b.tasks)]).forEach((k) => {
      const ta = a.taskUpdatedAt[k], tb = b.taskUpdatedAt[k];
      if (!ta && !tb) d.tasks[k] = !!(a.tasks[k] || b.tasks[k]);
      else if ((ta || "") >= (tb || "")) { d.tasks[k] = !!a.tasks[k]; d.taskUpdatedAt[k] = ta; }
      else { d.tasks[k] = !!b.tasks[k]; d.taskUpdatedAt[k] = tb; }
    });
    new Set([...Object.keys(a.baseMinutesByTask), ...Object.keys(b.baseMinutesByTask)]).forEach((k) => {
      d.baseMinutesByTask[k] = Math.max(a.baseMinutesByTask[k] || 0, b.baseMinutesByTask[k] || 0);
    });
    const seen = new Set();
    [...a.sessions, ...b.sessions].forEach((s) => { if (!seen.has(s.id)) { seen.add(s.id); d.sessions.push(s); } });
    return recomputeDay(d);
  }

  function uploadKey(u) { return u.mediaId || `${u.date}|${u.name}`; }

  function mergeClassProgress(a, b) {
    if (!a) return b;
    if (!b) return a;
    const base = (a.updatedAt || "") >= (b.updatedAt || "") ? a : b;
    const seen = new Set();
    const uploads = [...(a.uploads || []), ...(b.uploads || [])]
      .filter((u) => { const k = uploadKey(u); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((x, y) => (x.date || "").localeCompare(y.date || ""));
    return { ...base, answers: { ...(base === a ? b : a).answers, ...base.answers }, uploads };
  }

  function mergeProjects(a, b) {
    const byId = new Map();
    [...(b || []), ...(a || [])].forEach((p) => {
      const other = byId.get(p.id);
      if (!other) { byId.set(p.id, JSON.parse(JSON.stringify(p))); return; }
      const items = new Map(other.checklist.map((i) => [i.key, i]));
      p.checklist.forEach((i) => {
        const o = items.get(i.key);
        if (!o || (i.updatedAt || "") >= (o.updatedAt || "")) items.set(i.key, { ...i });
      });
      byId.set(p.id, { ...other, ...p, startedAt: [other.startedAt, p.startedAt].filter(Boolean).sort()[0] || null, checklist: [...items.values()] });
    });
    return [...byId.values()];
  }

  /**
   * Combines two copies of a learner's state (this device's and the account's).
   * Nothing either side did is lost: completed classes, practice sessions,
   * journal entries and uploads are unions; for single values the newer edit wins.
   */
  function mergeSyncStates(localRaw, remoteRaw) {
    if (!remoteRaw) return normalize(localRaw);
    const a = normalize(localRaw), b = normalize(remoteRaw);
    const out = { ...a };

    out.createdAt = [a.createdAt, b.createdAt].filter(Boolean).sort()[0];
    out.updatedAt = later(a.updatedAt, b.updatedAt);
    out.completedClassIds = [...new Set([...a.completedClassIds, ...b.completedClassIds])];
    out.currentClassId = (a.updatedAt || "") >= (b.updatedAt || "") ? a.currentClassId : b.currentClassId;

    out.practiceLog = {};
    new Set([...Object.keys(a.practiceLog), ...Object.keys(b.practiceLog)]).forEach((k) => {
      out.practiceLog[k] = mergeDay(a.practiceLog[k], b.practiceLog[k]);
    });

    out.deletedJournalIds = [...new Set([...a.deletedJournalIds, ...b.deletedJournalIds])];
    const deleted = new Set(out.deletedJournalIds);
    const entries = new Map();
    [...b.journal, ...a.journal].forEach((e) => entries.set(e.id, e));
    out.journal = [...entries.values()].filter((e) => !deleted.has(e.id)).sort((x, y) => (y.date || "").localeCompare(x.date || ""));

    out.projects = mergeProjects(a.projects, b.projects);

    out.classProgress = {};
    new Set([...Object.keys(a.classProgress), ...Object.keys(b.classProgress)]).forEach((k) => {
      out.classProgress[k] = mergeClassProgress(a.classProgress[k], b.classProgress[k]);
    });

    out.milestoneUploads = { ...b.milestoneUploads };
    Object.entries(a.milestoneUploads).forEach(([k, m]) => {
      const o = out.milestoneUploads[k];
      if (!o || (m.date || "") >= (o.date || "")) out.milestoneUploads[k] = m;
    });

    LOCAL_ONLY_FIELDS.forEach((f) => { out[f] = a[f]; });
    return out;
  }

  /**
   * Replace the synced part of the state with a merged copy (from CloudSync).
   * Saves locally WITHOUT notifying persist listeners (no upload loop).
   * Returns true if anything a page shows changed.
   */
  function importSyncState(merged) {
    const before = JSON.stringify(exportSyncState());
    const keep = {};
    LOCAL_ONLY_FIELDS.forEach((f) => { keep[f] = state[f]; });
    state = normalize({ ...merged, ...keep });
    // The current class must be one the learner can actually open
    const cur = getClassById(state.currentClassId);
    if (!cur || state.completedClassIds.includes(cur.id) || classStatus(cur) === "locked") {
      state.currentClassId = firstIncompleteUnlockedClassId() || state.currentClassId;
    }
    writeLocal();
    return JSON.stringify(exportSyncState()) !== before;
  }

  /** Every recording this learner has (for CloudSync to upload / other devices to download). */
  function referencedMediaIds() {
    const ids = [];
    Object.values(state.classProgress).forEach((p) => (p.uploads || []).forEach((u) => u.mediaId && ids.push(u.mediaId)));
    Object.values(state.milestoneUploads).forEach((m) => m.mediaId && ids.push(m.mediaId));
    return ids;
  }

  /** One-time move of recordings saved by older versions as base64 dataUrls (inside localStorage) into Media. */
  async function migrateLegacyUploads() {
    const toBlob = (dataUrl) => fetch(dataUrl).then((r) => r.blob());
    let changed = false;
    for (const progress of Object.values(state.classProgress)) {
      for (const u of progress.uploads || []) {
        if (!u.dataUrl) continue;
        u.mediaId = await Media.save(await toBlob(u.dataUrl));
        delete u.dataUrl;
        changed = true;
      }
    }
    for (const m of Object.values(state.milestoneUploads)) {
      if (!m.dataUrl) continue;
      m.mediaId = await Media.save(await toBlob(m.dataUrl));
      delete m.dataUrl;
      changed = true;
    }
    if (changed) persist();
  }

  function getState() { return state; }

  function getClassById(id) { return APP_DATA.CLASSES.find(c => c.id === id); }

  function isLevelUnlocked(levelId) {
    if (levelId === 1) return true;
    const prevLevelClasses = APP_DATA.CLASSES.filter(c => c.levelId === levelId - 1);
    return prevLevelClasses.every(c => state.completedClassIds.includes(c.id));
  }

  function classStatus(cls) {
    if (state.completedClassIds.includes(cls.id)) return "completed";
    if (!isLevelUnlocked(cls.levelId)) return "locked";
    if (cls.id === state.currentClassId) return "current";
    const sameLevelClasses = APP_DATA.CLASSES.filter(c => c.levelId === cls.levelId).sort((a, b) => a.number - b.number);
    const idx = sameLevelClasses.findIndex(c => c.id === cls.id);
    if (idx === 0) return "available";
    const prevInLevel = sameLevelClasses[idx - 1];
    return state.completedClassIds.includes(prevInLevel.id) ? "available" : "locked";
  }

  function getClassProgress(id) {
    return state.classProgress[id] || { assignmentDone: false, reflection: "", answers: {}, uploads: [] };
  }

  function updateClassProgress(id, patch) {
    const current = getClassProgress(id);
    state.classProgress[id] = { ...current, ...patch, updatedAt: nowIso() };
    persist();
  }

  function addUpload(id, upload) {
    const current = getClassProgress(id);
    const uploads = [...current.uploads, upload];
    state.classProgress[id] = { ...current, uploads, updatedAt: nowIso() };
    persist();
  }

  function firstIncompleteUnlockedClassId() {
    const all = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number));
    for (const c of all) {
      if (state.completedClassIds.includes(c.id)) continue;
      if (!isLevelUnlocked(c.levelId)) continue;
      const sameLevel = all.filter(x => x.levelId === c.levelId);
      const idx = sameLevel.findIndex(x => x.id === c.id);
      if (idx === 0 || state.completedClassIds.includes(sameLevel[idx - 1].id)) return c.id;
    }
    return null;
  }

  function completeClass(id) {
    const cls = getClassById(id);
    if (!cls || cls.comingSoon) return; // placeholder lessons can't be completed
    if (!state.completedClassIds.includes(id)) {
      state.completedClassIds.push(id);
    }
    const next = firstIncompleteUnlockedClassId();
    if (next) state.currentClassId = next;
    persist();
  }

  function setCurrentClass(id) {
    state.currentClassId = id;
    persist();
  }

  /* ---- Interactive lessons (synced to Supabase by ClassActivity) ---- */
  function emptyClassActivity() {
    return { checkpoints: {}, exerciseStats: {}, answers: {}, completedAt: null, updatedAt: null };
  }

  function getClassActivity(classId) {
    const rec = state.classActivity[classId];
    return rec ? { ...emptyClassActivity(), ...rec } : emptyClassActivity();
  }

  function setClassActivity(classId, record) {
    state.classActivity[classId] = record;
    writeLocal(); // ClassActivity syncs this itself (class_progress)
  }

  function getClassNote(classId) {
    return state.classNotes[classId] || { body: "", updatedAt: null };
  }

  function setClassNote(classId, body, updatedAt) {
    state.classNotes[classId] = { body, updatedAt };
    writeLocal(); // ClassActivity syncs this itself (class_notes)
  }

  /* ---- Practice log ---- */
  function getTodayLog() {
    const key = todayKey();
    if (!state.practiceLog[key]) state.practiceLog[key] = newDay();
    return state.practiceLog[key];
  }

  function toggleTask(taskKey) {
    const log = getTodayLog();
    log.tasks[taskKey] = !log.tasks[taskKey];
    log.taskUpdatedAt[taskKey] = nowIso();
    persist();
  }

  function logMinutes(taskKey, minutes) {
    if (minutes <= 0) return;
    const log = getTodayLog();
    log.sessions.push({ id: newId("s"), task: taskKey, minutes, at: nowIso() });
    recomputeDay(log);
    persist();
  }

  function totalPracticeMinutes() {
    return Object.values(state.practiceLog).reduce((sum, d) => sum + (d.totalMinutes || 0), 0);
  }

  function minutesForSkill(skillTag) {
    const taskKeys = APP_DATA.PRACTICE_TASKS.filter(t => t.skillTag === skillTag).map(t => t.key);
    let total = 0;
    Object.values(state.practiceLog).forEach(day => {
      taskKeys.forEach(k => { total += (day.minutesByTask && day.minutesByTask[k]) || 0; });
    });
    return total;
  }

  function currentStreak() {
    let streak = 0;
    let d = new Date();
    while (true) {
      const key = todayKey(d);
      const log = state.practiceLog[key];
      const didSomething = log && (log.totalMinutes > 0 || Object.values(log.tasks || {}).some(Boolean));
      if (didSomething) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (streak === 0 && key === todayKey()) {
        d.setDate(d.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  function practiceDaysCount() {
    return Object.values(state.practiceLog).filter(d => d.totalMinutes > 0 || Object.values(d.tasks || {}).some(Boolean)).length;
  }

  /* ---- Journal ---- */
  function addJournalEntry(entry) {
    const e = { id: newId("j"), date: nowIso(), ...entry };
    state.journal.unshift(e);
    persist();
    return e;
  }

  function deleteJournalEntry(id) {
    state.journal = state.journal.filter(e => e.id !== id);
    if (!state.deletedJournalIds.includes(id)) state.deletedJournalIds.push(id);
    persist();
  }

  /* ---- Projects ---- */
  function toggleProjectItem(projectId, key) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    const item = project.checklist.find(c => c.key === key);
    if (item) { item.done = !item.done; item.updatedAt = nowIso(); }
    persist();
  }

  function isProjectComplete(project) {
    return project.checklist.every(c => c.done);
  }

  /* ---- Milestone uploads (Before/After) ---- */
  function setMilestoneUpload(milestoneId, data) {
    const previous = state.milestoneUploads[milestoneId];
    state.milestoneUploads[milestoneId] = data;
    persist();
    // Replaced recording: drop the old file so storage doesn't grow forever
    if (previous && previous.mediaId && previous.mediaId !== data.mediaId) {
      Media.remove(previous.mediaId).catch(() => {});
    }
  }

  /* ---- Skill progress (0-100) for Progress page bars ---- */
  function skillProgress(skillTag) {
    const classesForSkill = APP_DATA.CLASSES.filter(c => c.skillTag === skillTag);
    if (classesForSkill.length === 0) return 0;
    const completed = classesForSkill.filter(c => state.completedClassIds.includes(c.id)).length;
    return Math.round((completed / classesForSkill.length) * 100);
  }

  /* ---- Achievements ---- */
  function isAchievementUnlocked(id) {
    const s = state;
    switch (id) {
      case "first-recording":
        return Object.values(s.classProgress).some(p => p.uploads && p.uploads.length > 0) ||
               Object.keys(s.milestoneUploads).length > 0;
      case "first-song":
        return s.projects.some(p => isProjectComplete(p));
      case "ten-hours-listening":
        return minutesForSkill("ear") >= 600;
      case "ten-vocal-sessions":
        return Object.values(s.practiceLog).filter(d => d.tasks && (d.tasks.warmup || d.tasks.song)).length >= 10;
      case "first-chord":
        return APP_DATA.CLASSES.filter(c => c.levelId === 3).some(c => s.completedClassIds.includes(c.id));
      case "first-mix":
        return APP_DATA.CLASSES.filter(c => c.levelId === 6).some(c => s.completedClassIds.includes(c.id));
      case "first-master":
        return APP_DATA.CLASSES.filter(c => c.levelId === 7).some(c => s.completedClassIds.includes(c.id));
      case "first-original":
        return s.projects.some(p => p.isOriginal && isProjectComplete(p));
      case "streak-30":
        return currentStreak() >= 30;
      case "all-classes":
        return APP_DATA.CLASSES.every(c => s.completedClassIds.includes(c.id));
      default:
        return false;
    }
  }

  function overallStats() {
    return {
      classesCompleted: state.completedClassIds.length,
      totalClasses: APP_DATA.CLASSES.length,
      practiceHours: Math.round((totalPracticeMinutes() / 60) * 10) / 10,
      songsCompleted: state.projects.filter(p => isProjectComplete(p)).length,
      recordings: Object.values(state.classProgress).reduce((n, p) => n + ((p.uploads && p.uploads.length) || 0), 0)
                  + Object.keys(state.milestoneUploads).length,
      streak: currentStreak(),
    };
  }

  function resetAll() {
    state = normalize({});
    persist();
  }

  return {
    getState, getClassById, isLevelUnlocked, classStatus,
    getClassProgress, updateClassProgress, addUpload, completeClass, setCurrentClass,
    getTodayLog, toggleTask, logMinutes, totalPracticeMinutes, minutesForSkill,
    currentStreak, practiceDaysCount,
    addJournalEntry, deleteJournalEntry,
    toggleProjectItem, isProjectComplete,
    setMilestoneUpload, skillProgress, isAchievementUnlocked, overallStats,
    resetAll, todayKey, switchUser, migrateLegacyUploads,
    emptyClassActivity, getClassActivity, setClassActivity, getClassNote, setClassNote,
    onPersist, exportSyncState, normalizeForSync, importSyncState, mergeSyncStates, referencedMediaIds,
  };
})();
