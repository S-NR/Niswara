/* ============================================================
   PRACTICE PAGE — daily practice dashboard
   ============================================================ */

const PracticePage = {
  render() {
    const log = Store.getTodayLog();
    const current = Store.getClassById(Store.getState().currentClassId);
    const totalMinutesToday = log.totalMinutes || 0;

    return `
    <section class="max-w-4xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Daily Practice", "Today's Practice", "Consistency beats intensity. A little, every day, compounds into a career.")}

      <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 mb-6">
        <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-1">Today's Focus</p>
        <h3 class="font-display text-xl text-ink-50 mb-1">${current.title}</h3>
        <p class="text-sm text-ink-500">${current.category} · Level ${current.levelId}</p>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 mb-6">
        ${APP_DATA.PRACTICE_TASKS.map(t => `
          <label class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-colors">
            <input type="checkbox" data-task="${t.key}" ${log.tasks[t.key] ? "checked" : ""} class="w-4 h-4 rounded border-white/20 bg-transparent accent-amber-400">
            <span class="text-sm ${log.tasks[t.key] ? "text-ink-500 line-through" : "text-ink-200"}">${t.label}</span>
          </label>`).join("")}
      </div>

      <div class="mb-6">
        <p class="text-xs text-ink-500 uppercase tracking-wide mb-2">Practice duration today</p>
        <p id="today-minutes" class="font-display text-3xl text-ink-50">${Utils.formatSeconds(totalMinutesToday * 60)}</p>
      </div>

      <div class="mb-3">
        <label class="text-xs text-ink-500 uppercase tracking-wide">Logging time for</label>
        <select id="task-select" class="mt-1.5 w-full sm:w-64 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-gold-400/40">
          ${APP_DATA.PRACTICE_TASKS.map(t => `<option value="${t.key}">${t.label}</option>`).join("")}
        </select>
      </div>
      ${Timer.render("practice-timer", { showLogButton: true })}
    </section>`;
  },

  mount(container) {
    container.querySelectorAll("[data-task]").forEach(cb => {
      cb.addEventListener("change", () => {
        Store.toggleTask(cb.dataset.task);
        Router.softRefresh(container, PracticePage);
      });
    });

    const select = container.querySelector("#task-select");
    const timerCtrl = Timer.wire(container, "practice-timer", {
      onLog: (minutes) => {
        Store.logMinutes(select.value, minutes);
        Router.softRefresh(container, PracticePage);
      },
    });

    return () => timerCtrl.destroy();
  },
};
