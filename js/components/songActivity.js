/* ============================================================
   SONG ACTIVITY — per-song progress for Song Learning & Application.

   Mirrors ClassActivity's record shape and update pattern exactly,
   but is local-only (no Supabase push yet — see spec §4.3) and
   markCompleted() never touches Store.completeClass()/
   completedClassIds, keeping song progress fully independent of
   the Level 1-8 curriculum's own progress tracking.
   ============================================================ */

const SongActivity = (() => {
  const listeners = new Set();

  function clone(rec) { return JSON.parse(JSON.stringify(rec)); }

  function get(songId) { return Store.getSongActivity(songId); }

  function emit(songId) {
    const rec = get(songId);
    listeners.forEach((fn) => { try { fn(songId, rec); } catch (e) { console.error(e); } });
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function update(songId, mutate) {
    const rec = clone(get(songId));
    mutate(rec);
    rec.updatedAt = new Date().toISOString();
    Store.setSongActivity(songId, rec);
    emit(songId);
    return rec;
  }

  function markCheckpoint(songId, key, value = true) {
    if (get(songId).checkpoints[key] === value) return get(songId);
    return update(songId, (rec) => { rec.checkpoints[key] = value; });
  }

  function setAnswer(songId, group, key, value) {
    return update(songId, (rec) => {
      rec.answers[group] = { ...(rec.answers[group] || {}), [key]: value };
    });
  }

  function bump(songId, counter) {
    return update(songId, (rec) => {
      rec.answers.counters = rec.answers.counters || {};
      rec.answers.counters[counter] = (rec.answers.counters[counter] || 0) + 1;
    });
  }

  function count(songId, counter) {
    return (get(songId).answers.counters || {})[counter] || 0;
  }

  function markCompleted(songId) {
    return update(songId, (rec) => { rec.completedAt = rec.completedAt || new Date().toISOString(); });
  }

  return { get, onChange, markCheckpoint, setAnswer, bump, count, markCompleted };
})();
