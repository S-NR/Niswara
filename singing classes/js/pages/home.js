/* ============================================================
   HOME PAGE
   ============================================================ */

const HomePage = {
  render() {
    const s = Store.getState();
    const current = Store.getClassById(s.currentClassId);
    const level = APP_DATA.LEVELS.find(l => l.id === current.levelId);
    const levelClasses = APP_DATA.CLASSES.filter(c => c.levelId === level.id);
    const levelCompleted = levelClasses.filter(c => s.completedClassIds.includes(c.id)).length;
    const levelPct = Math.round((levelCompleted / levelClasses.length) * 100);

    const all = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number));
    const idx = all.findIndex(c => c.id === current.id);
    const next = all[idx + 1];

    const stats = Store.overallStats();
    const quote = APP_DATA.QUOTES[new Date().getDate() % APP_DATA.QUOTES.length];

    return `
    <section class="relative overflow-hidden border-b border-white/5">
      <div class="absolute inset-0 -z-10 bg-studio-glow"></div>
      <div class="absolute inset-0 -z-10 opacity-40" aria-hidden="true">${heroWaveform()}</div>
      <div class="max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 relative">
        <p class="text-xs tracking-[0.25em] uppercase text-gold-400/80 mb-5">A personal music academy</p>
        <h1 class="font-display text-4xl sm:text-6xl text-ink-50 leading-[1.08] max-w-3xl">From First Note <span class="text-gold-400">→</span> Professional</h1>
        <p class="text-ink-400 text-base sm:text-lg max-w-xl mt-6 leading-relaxed">
          I'm starting from the basics — learning to sing, understand music, record, produce, mix and master.
          One class, one practice session and one song at a time.
        </p>
        <div class="flex flex-wrap gap-3 mt-8">
          <a href="#/classes/${current.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">
            Start Class ${current.number} ${icon("arrowRight", "w-4 h-4")}
          </a>
          <a href="#/journey" class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-ink-100 hover:bg-white/5 transition-colors">
            View My Journey
          </a>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-5 lg:px-8 -mt-10 sm:-mt-14 relative z-10 pb-4">
      <div class="rounded-3xl border border-white/10 bg-ink-900/90 backdrop-blur-xl p-6 sm:p-8 grid lg:grid-cols-[1.2fr,1fr] gap-8 shadow-2xl">
        <div>
          <p class="text-xs tracking-[0.2em] uppercase text-ink-500 mb-2">Current Stage</p>
          <h2 class="font-display text-2xl text-ink-50 mb-1">Level ${level.id} — ${level.title}</h2>
          <p class="text-sm text-ink-500 mb-5">${level.role}</p>
          ${Components.ProgressBar(levelPct, "h-2.5")}
          <p class="text-xs text-ink-500 mt-2">${levelPct}% of Level ${level.id} complete</p>

          <div class="mt-7 pt-6 border-t border-white/5">
            <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-3">Currently Learning</p>
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p class="text-xs text-ink-500">CLASS ${String(current.number).padStart(2, "0")}</p>
                <h3 class="font-display text-xl text-ink-50">${current.title}</h3>
                ${next ? `<p class="text-xs text-ink-500 mt-1">Next: Class ${String(next.number).padStart(2, "0")} — ${next.title}</p>` : ""}
              </div>
              <a href="#/classes/${current.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shrink-0">Continue Class ${icon("arrowRight", "w-3.5 h-3.5")}</a>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          ${Components.QuoteBlock(quote)}
          <div class="grid grid-cols-3 gap-3">
            ${Components.StatCard("grid", stats.classesCompleted, "Classes Done")}
            ${Components.StatCard("timer", stats.practiceHours, "Practice Hrs")}
            ${Components.StatCard("flame", stats.streak, "Day Streak")}
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-5 lg:px-8 py-16 sm:py-24">
      ${Components.SectionHeading("The journey", "Eight levels, one craft", "From understanding your own voice to mastering a finished release — each level unlocks once the one before it is complete.")}
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${APP_DATA.LEVELS.map(l => {
          const locked = !Store.isLevelUnlocked(l.id);
          return `<div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 ${locked ? "opacity-50" : ""}">
            <div class="w-9 h-9 rounded-full flex items-center justify-center mb-3 font-display text-sm ${locked ? "bg-white/5 text-ink-500" : "bg-gold-500/15 text-gold-300"}">${locked ? icon("lock", "w-4 h-4") : l.id}</div>
            <h4 class="font-display text-base text-ink-50 mb-1">${l.title}</h4>
            <p class="text-xs text-ink-500">${l.role}</p>
          </div>`;
        }).join("")}
      </div>
      <div class="text-center mt-8">
        <a href="#/journey" class="text-sm text-gold-300 inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">See the full journey map ${icon("arrowRight", "w-3.5 h-3.5")}</a>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-5 lg:px-8 pb-20 sm:pb-28">
      <div class="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
        <div>
          <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-2">Before → After</p>
          <h3 class="font-display text-2xl text-ink-50 mb-2">Hear the difference, honestly.</h3>
          <p class="text-ink-400 text-sm max-w-md">Every milestone recording — Day 1 through Day 180 — lives on the Progress page so the change is never just a memory.</p>
        </div>
        <a href="#/progress" class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-ink-100 hover:bg-white/5 transition-colors shrink-0">View Before / After ${icon("arrowRight", "w-4 h-4")}</a>
      </div>
    </section>
    `;
  },
  mount() {},
};

function heroWaveform() {
  const bars = Array.from({ length: 60 }).map((_, i) => {
    const h = 20 + Math.round(Math.abs(Math.sin(i * 0.35)) * 60);
    return `<span class="w-[3px] rounded-full bg-gold-400/30" style="height:${h}px"></span>`;
  }).join("");
  return `<div class="flex items-end justify-center gap-1 h-40 pt-10">${bars}</div>`;
}
