/* ============================================================
   SONGS PAGE — list page for the optional "Song Learning &
   Application" section. Not part of the Level 1-8 curriculum;
   see docs/superpowers/specs/2026-11-01-song-learning-level-design.md.
   ============================================================ */

const SongsPage = {
  render() {
    if (!Store.isLevelUnlocked(2)) {
      return `
      <section class="max-w-3xl mx-auto px-5 lg:px-8 py-20 text-center">
        ${Components.EmptyState("lock", "Song Learning is locked", "Complete Level 1 — Foundation to unlock this optional section.")}
        <a href="#/classes" class="inline-flex items-center gap-2 mt-6 text-sm text-gold-300">${icon("arrowRight", "w-3.5 h-3.5 rotate-180")} Back to Classes</a>
      </section>`;
    }
    return `
    <section class="max-w-5xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-xs text-ink-500 tracking-widest">SONG LEARNING &amp; APPLICATION</span>
        <span class="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 tracking-wide uppercase">Optional</span>
      </div>
      <h1 class="font-display text-3xl sm:text-4xl text-ink-50 mb-3">Song Learning</h1>
      <p class="text-sm text-ink-400 max-w-xl mb-10">Bring what you've learned into a real song — gently, one small section at a time. More songs will join this section later.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${SONGS.map((song) => `
        <a href="#/songs/${song.id}" class="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-3 transition-all hover:border-gold-500/20 hover:bg-white/[0.04]">
          <h3 class="font-display text-lg text-ink-50 leading-snug">${song.title}</h3>
          <p class="text-sm text-ink-400 italic">${song.titleTransliteration}</p>
          <p class="text-xs text-ink-500 mt-1">${song.language}</p>
        </a>`).join("")}
      </div>
    </section>`;
  },
  mount() {},
};
