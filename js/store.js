/* ============================================================
   STORE
   Thin persistence + state layer over localStorage.
   Every page reads/writes through Store — swapping localStorage
   for a real API later only means rewriting this file.
   ============================================================ */

const Store = (() => {
  const GUEST_KEY = "ffntp.v1"; // From First Note To Professional
  // Logged-in users get their own namespace ("ffntp.v1:<uid>") so a shared
  // browser never shows one account's progress to another. Phase 3 moves
  // this into Postgres; until then it's per-browser, per-account.
  let storageKey = GUEST_KEY;

  /** Local calendar date "YYYY-MM-DD" — practice days roll over at the learner's midnight, not UTC's. */
  function todayKey(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function defaultState() {
    return {
      currentClassId: "L1C01",
      completedClassIds: [],
      classProgress: {},     // id -> { assignmentDone, reflection, answers:{}, uploads:[] }
      practiceLog: {},       // "YYYY-MM-DD" -> { tasks:{key:bool}, minutesByTask:{key:minutes}, totalMinutes }
      journal: [],           // {id, date, classId, learned, struggled, improved, toPractice, thoughts}
      projects: null,        // seeded on first load
      milestoneUploads: {},  // milestoneId -> { fileName, mediaId, date } (file itself lives in Media/IndexedDB)
      createdAt: new Date().toISOString(),
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return seedProjects(defaultState());
      const parsed = JSON.parse(raw);
      return seedProjects({ ...defaultState(), ...parsed });
    } catch (e) {
      console.warn("Store: failed to load, resetting.", e);
      return seedProjects(defaultState());
    }
  }

  function seedProjects(s) {
    if (!s.projects) {
      s.projects = JSON.parse(JSON.stringify(APP_DATA.PROJECTS_SEED));
      s.projects[0].startedAt = s.projects[0].startedAt || new Date().toISOString();
    }
    return s;
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn("Store: failed to persist (storage may be full).", e);
      // Surfaced to the learner by app.js — a silent failure here means lost progress on reload.
      window.dispatchEvent(new CustomEvent("store:persist-failed", { detail: e }));
    }
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
    state.classProgress[id] = { ...current, ...patch };
    persist();
  }

  function addUpload(id, upload) {
    const current = getClassProgress(id);
    const uploads = [...current.uploads, upload];
    state.classProgress[id] = { ...current, uploads };
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

  /* ---- Practice log ---- */
  function getTodayLog() {
    const key = todayKey();
    if (!state.practiceLog[key]) {
      state.practiceLog[key] = { tasks: {}, minutesByTask: {}, totalMinutes: 0 };
    }
    return state.practiceLog[key];
  }

  function toggleTask(taskKey) {
    const log = getTodayLog();
    log.tasks[taskKey] = !log.tasks[taskKey];
    persist();
  }

  function logMinutes(taskKey, minutes) {
    if (minutes <= 0) return;
    const key = todayKey();
    const log = getTodayLog();
    log.minutesByTask[taskKey] = (log.minutesByTask[taskKey] || 0) + minutes;
    log.totalMinutes = (log.totalMinutes || 0) + minutes;
    state.practiceLog[key] = log;
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
    const e = { id: "j" + Date.now(), date: new Date().toISOString(), ...entry };
    state.journal.unshift(e);
    persist();
    return e;
  }

  function deleteJournalEntry(id) {
    state.journal = state.journal.filter(e => e.id !== id);
    persist();
  }

  /* ---- Projects ---- */
  function toggleProjectItem(projectId, key) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    const item = project.checklist.find(c => c.key === key);
    if (item) item.done = !item.done;
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
    // Replaced recording: drop the old file so IndexedDB doesn't grow forever
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
    state = defaultState();
    seedProjects(state);
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
  };
})();
