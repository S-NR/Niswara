/* ============================================================
   CLOUD SYNC
   Keeps a logged-in learner's progress the same on every device.

   - On login (and when the tab becomes visible again) it pulls the
     account's copy (learner_state), MERGES it with this device's copy
     (Store.mergeSyncStates — nothing either side did is lost), and
     saves the merged result back.
   - Every Store change schedules an upload (debounced).
   - Uploads are versioned: if another device saved in between, the
     update matches 0 rows, so we pull, merge and retry instead of
     overwriting newer progress.
   - Recordings referenced by the progress are uploaded to the
     account's private storage folder; other devices download them
     on demand (Media.getUrl).

   Interactive-class scores/notes sync separately via ClassActivity.
   Logged out, or with no backend, everything stays on the device.
   ============================================================ */

const CloudSync = (() => {
  const PUSH_DELAY = 1500;
  const PULL_MIN_GAP = 15000;
  const MAX_RETRIES = 3;

  let version = null;        // learner_state.version this device last saw (null = no row yet)
  let pulled = false;        // never upload before seeing the account's copy
  let timer = null;
  let chain = Promise.resolve();
  let lastPushed = null;     // comparable JSON of the last state the server has
  let lastPullAt = 0;
  let unavailable = null;    // "missing-tables" once detected (stop retrying)
  let mediaSyncRunning = false;
  let status = { state: "local", at: null };
  const listeners = new Set();

  function canSync() {
    return Auth.isConfigured && Auth.isLoggedIn() && !unavailable;
  }

  /** Subscribe: fn("status") when sync status changes, fn("remote-changed") when another device's progress arrived. */
  function on(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function emit(event) {
    listeners.forEach((fn) => { try { fn(event); } catch (e) { console.error(e); } });
  }
  function setStatus(state) {
    status = { state, at: new Date().toISOString() };
    emit("status");
  }

  /** Comparison ignores the bookkeeping timestamp. */
  function comparable(s) {
    const c = { ...s };
    delete c.updatedAt;
    return JSON.stringify(c);
  }

  function fail(error) {
    if (error && (error.code === "PGRST205" || error.code === "42P01")) {
      unavailable = "missing-tables";
      console.warn("CloudSync: learner_state table is missing — run supabase/migrations/0004_learner_state.sql. Progress stays on this device.");
      setStatus("unavailable");
    } else {
      console.warn("CloudSync: sync failed; progress is safe on this device and will sync later.", error);
      setStatus(navigator.onLine === false ? "offline" : "error");
    }
    return false;
  }

  /** Run network work one step at a time so pulls and pushes never interleave. */
  function enqueue(fn) {
    chain = chain.then(fn).catch((e) => fail(e));
    return chain;
  }

  async function doPull() {
    if (!canSync()) return false;
    setStatus("syncing");
    const { data, error } = await Auth.fetchLearnerState();
    if (error) return fail(error);
    lastPullAt = Date.now();
    pulled = true;
    if (!data) {
      // First time this account syncs: upload what this device has
      version = null;
      await doPush();
      return false;
    }
    version = data.version;
    const changed = Store.importSyncState(Store.mergeSyncStates(Store.exportSyncState(), data.state));
    const mine = comparable(Store.exportSyncState());
    if (mine !== comparable(Store.normalizeForSync(data.state))) {
      await doPush(); // this device had progress the account didn't
    } else {
      lastPushed = mine;
      setStatus("synced");
    }
    if (changed) emit("remote-changed");
    syncMedia();
    return changed;
  }

  async function doPush() {
    if (!canSync()) return;
    if (!pulled) { await doPull(); return; }
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const payload = Store.exportSyncState();
      const cmp = comparable(payload);
      if (cmp === lastPushed) { setStatus("synced"); return; }
      setStatus("syncing");

      if (version === null) {
        const { data, error } = await Auth.insertLearnerState(payload);
        if (!error) { version = data.version; lastPushed = cmp; setStatus("synced"); syncMedia(); return; }
        if (error.code !== "23505") { fail(error); return; } // 23505: another device created it first
      } else {
        const { data, error } = await Auth.updateLearnerState(payload, version);
        if (error) { fail(error); return; }
        if (data && data.length) { version = data[0].version; lastPushed = cmp; setStatus("synced"); syncMedia(); return; }
      }

      // Someone else saved first: take their copy, merge ours in, then try again
      const { data: remote, error: e2 } = await Auth.fetchLearnerState();
      if (e2) { fail(e2); return; }
      version = remote ? remote.version : null;
      if (remote && Store.importSyncState(Store.mergeSyncStates(Store.exportSyncState(), remote.state))) emit("remote-changed");
    }
    setStatus("error");
    schedulePush();
  }

  function schedulePush() {
    if (!canSync()) return;
    clearTimeout(timer);
    setStatus("pending");
    timer = setTimeout(() => { timer = null; enqueue(doPush); }, PUSH_DELAY);
  }

  /** Pull the account's progress now (login, tab refocus). Resolves to true if anything changed. */
  function pull() { return enqueue(doPull); }

  /** Upload pending changes now (before logout / when leaving the page). */
  function flush() {
    if (!timer) return chain;
    clearTimeout(timer);
    timer = null;
    return enqueue(doPush);
  }

  /** Called by app.js when the logged-in account changes (uid null = logged out). */
  function userChanged(uid) {
    clearTimeout(timer);
    timer = null;
    version = null;
    pulled = false;
    lastPushed = null;
    unavailable = null;
    if (uid && Auth.isConfigured) return pull();
    setStatus("local");
    return Promise.resolve(false);
  }

  /* ---- Recordings ---- */

  function syncedMediaKey() { return `niswara.cloudMedia:${Auth.getUser().id}`; }
  function loadSynced() {
    try { return new Set(JSON.parse(localStorage.getItem(syncedMediaKey()) || "[]")); } catch (e) { return new Set(); }
  }
  function saveSynced(set) {
    try { localStorage.setItem(syncedMediaKey(), JSON.stringify([...set])); } catch (e) { /* only an optimisation */ }
  }

  /** Mark a recording as already in the account (e.g. just downloaded from it). */
  function markMediaSynced(id) {
    if (!Auth.isLoggedIn()) return;
    const s = loadSynced();
    s.add(id);
    saveSynced(s);
  }

  /** Upload any of this learner's recordings that exist on this device but not yet in the account. */
  async function syncMedia() {
    if (!canSync() || mediaSyncRunning) return;
    mediaSyncRunning = true;
    try {
      const done = loadSynced();
      for (const id of Store.referencedMediaIds()) {
        if (done.has(id)) continue;
        const blob = await Media.getBlob(id).catch(() => null);
        if (!blob) continue; // recorded on another device — that device uploads it
        const { error } = await Auth.uploadRecording(id, blob);
        if (error) {
          console.warn("CloudSync: recording upload failed (will retry later).", error);
          if (/bucket not found/i.test(error.message || "")) break;
          continue;
        }
        done.add(id);
        saveSynced(done);
      }
    } finally {
      mediaSyncRunning = false;
    }
  }

  /** Short, learner-facing description of where progress is saved. */
  function describe() {
    if (!Auth.isConfigured || !Auth.isLoggedIn()) {
      return { tone: "muted", text: "Your progress is saved on this device. Log in to keep it in your account on every device." };
    }
    const time = status.at ? new Date(status.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    switch (status.state) {
      case "synced": return { tone: "good", text: `Progress synced to your account · ${time}` };
      case "syncing":
      case "pending": return { tone: "muted", text: "Syncing your progress…" };
      case "unavailable": return { tone: "warn", text: "Saved on this device. Account sync isn't set up on the server yet." };
      case "offline": return { tone: "warn", text: "Saved on this device — it will sync when you're back online." };
      case "error": return { tone: "warn", text: "Saved on this device — couldn't reach your account just now; will retry." };
      default: return { tone: "muted", text: "Connecting to your account…" };
    }
  }

  function getStatus() { return status; }

  Store.onPersist(schedulePush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && canSync() && Date.now() - lastPullAt > PULL_MIN_GAP) pull();
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("online", () => { if (canSync()) { flush(); pull(); } });
  window.addEventListener("pagehide", flush);

  return { on, pull, flush, userChanged, describe, getStatus, markMediaSynced, syncMedia };
})();
