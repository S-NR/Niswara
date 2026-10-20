/* ============================================================
   CLASSES PAGE — full class library grouped by level
   ============================================================ */

const ClassesPage = {
  render() {
    return `
    <section class="max-w-7xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Curriculum", "Classes", "Work through the library level by level. Each class is a self-contained lesson with theory, guided practice, an assignment and a reflection.")}
      <div class="flex flex-col gap-14">
        ${APP_DATA.LEVELS.map(level => {
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
        }).join("")}
      </div>
    </section>`;
  },
  mount() {},
};
