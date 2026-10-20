/* ============================================================
   JOURNEY PAGE — timeline of all 8 levels
   ============================================================ */

const JourneyPage = {
  render() {
    const s = Store.getState();
    return `
    <section class="max-w-4xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("My Journey", "From first note to professional", "A long-term map, not a race. Every level below unlocks only once the one before it is truly finished.")}
      <div class="mt-10">
        ${APP_DATA.LEVELS.map(level => {
          const locked = !Store.isLevelUnlocked(level.id);
          const levelClasses = APP_DATA.CLASSES.filter(c => c.levelId === level.id);
          const completed = levelClasses.filter(c => s.completedClassIds.includes(c.id)).length;
          const status = locked ? "locked" : completed === levelClasses.length ? "completed" :
            levelClasses.some(c => c.id === s.currentClassId) ? "current" : "available";
          return Components.JourneyLevel(level, status, completed, levelClasses.length);
        }).join("")}
      </div>
    </section>`;
  },
  mount() {},
};
