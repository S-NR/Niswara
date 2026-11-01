/* ============================================================
   SONG DETAIL PAGE — thin wrapper delegating to SongLessonKit.
   ============================================================ */

const SongDetailPage = {
  render(params) {
    const song = SONGS.find((s) => s.id === params.id);
    if (!song) return Components.EmptyState("grid", "Song not found", "This song doesn't exist yet.");
    const rec = SongActivity.get(song.id);
    const status = rec.completedAt ? "completed" : "available";
    return SongLessonKit.render(song, status);
  },
  mount(container, params) {
    const song = SONGS.find((s) => s.id === params.id);
    if (!song) return () => {};
    return SongLessonKit.mount(container, song, params);
  },
};
