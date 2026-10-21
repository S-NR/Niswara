/* ============================================================
   MEDIA
   Recording files (class uploads, Before/After milestones) live
   in IndexedDB, not in the localStorage blob — a single audio
   file can exceed localStorage's ~5 MB quota, which used to make
   every later Store save fail. Store only keeps { mediaId, name,
   type, date }; this module holds the actual Blob.

   When logged in, CloudSync also uploads each recording to the
   account's private Supabase Storage folder; on a device that
   doesn't have a file yet, getUrl() downloads it and caches it here.
   ============================================================ */

const Media = (() => {
  const DB_NAME = "niswara-media";
  const STORE_NAME = "files";
  let dbPromise = null;
  const urlCache = new Map(); // mediaId -> object URL, for this page session

  function open() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function run(mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const req = fn(tx.objectStore(STORE_NAME));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  /** Stores a File/Blob and resolves to its new mediaId. */
  async function save(blob) {
    const id = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await run("readwrite", (s) => s.put(blob, id));
    return id;
  }

  /** The stored Blob for a mediaId on this device, or undefined. */
  function getBlob(id) {
    return run("readonly", (s) => s.get(id));
  }

  /** Stores a Blob under an existing id (a recording downloaded from the account). */
  function put(id, blob) {
    return run("readwrite", (s) => s.put(blob, id));
  }

  /** Resolves to a playable object URL, or null if the file isn't on this device or in the account. */
  async function getUrl(id) {
    if (urlCache.has(id)) return urlCache.get(id);
    let blob = await getBlob(id);
    if (!blob && typeof Auth !== "undefined" && Auth.isLoggedIn()) {
      const { data, error } = await Auth.downloadRecording(id);
      if (!error && data) {
        blob = data;
        await put(id, blob).catch(() => {}); // cache for next time
        if (typeof CloudSync !== "undefined") CloudSync.markMediaSynced(id); // already in the account — don't re-upload
      }
    }
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    return url;
  }

  async function remove(id) {
    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id));
      urlCache.delete(id);
    }
    await run("readwrite", (s) => s.delete(id));
    if (typeof Auth !== "undefined" && Auth.isLoggedIn()) Auth.deleteRecording(id).catch(() => {});
  }

  return { save, put, getBlob, getUrl, remove };
})();
