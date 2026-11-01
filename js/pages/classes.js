/* ============================================================
   CLASSES PAGE — full class library grouped by level
   ============================================================ */

const ClassesPage = {
  render() {
    return `
    <section class="max-w-7xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Curriculum", "Classes", "Work through the library level by level. Each class is a self-contained lesson with theory, guided practice, an assignment and a reflection.")}
      <div class="mb-14">
        <div class="flex items-baseline gap-3 mb-5">
          <h3 class="font-display text-xl text-ink-50">Common</h3>
          <span class="text-xs text-ink-500 uppercase tracking-wide">Use any time · not a class</span>
        </div>
        ${WarmupPrompt.entryCard()}
      </div>
      <div class="flex flex-col gap-14">
        ${(() => {
          const blocks = APP_DATA.LEVELS.map(level => {
            const classes = APP_DATA.CLASSES.filter(c => c.levelId === level.id).sort((a, b) => a.number - b.number);
            return `
            <div>
              <div class="flex items-baseline gap-3 mb-5">
                <h3 class="font-display text-xl text-ink-50">Level ${level.id} — ${level.title}</h3>
                <span class="text-xs text-ink-500 uppercase tracking-wide">${level.role}</span>
              </div>
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${classes.map(c => Components.ClassCard(c, Store.classStatus(c))).join("")}
              </div>
            </div>`;
          });
          // Song Learning & Application: optional, non-numbered — shown between Foundation and
          // Singer, but never added to APP_DATA.LEVELS (see docs/superpowers/specs/
          // 2026-11-01-song-learning-level-design.md §3). Inserted by Singer's array position
          // (level.id === 2), not a hardcoded index, so this stays correct if LEVELS ever reorders.
          const singerIdx = APP_DATA.LEVELS.findIndex(l => l.id === 2);
          const unlocked = Store.isLevelUnlocked(2); // same "all of Level 1 done" check Singer itself uses
          blocks.splice(singerIdx, 0, `
            <div>
              <div class="flex items-baseline gap-3 mb-5">
                <h3 class="font-display text-xl text-ink-50">Song Learning &amp; Application</h3>
                <span class="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 tracking-wide uppercase">Optional</span>
              </div>
              <a href="#/songs" class="group block rounded-2xl border border-white/5 bg-white/[0.02] p-5 max-w-sm transition-all hover:border-gold-500/20 hover:bg-white/[0.04] ${unlocked ? "" : "opacity-60"}">
                <h4 class="font-display text-lg text-ink-50 leading-snug mb-1">${unlocked ? "Bring Level 2 into a real song" : "Locked"}</h4>
                <p class="text-sm text-ink-400 leading-relaxed">${unlocked ? "An optional space to apply what you've learned — one song, one small section at a time." : "Complete Level 1 — Foundation to unlock this optional section."}</p>
              </a>
            </div>`);
          return blocks.join("");
        })()}
      </div>
    </section>`;
  },
  mount() {},
};
