/* ============================================================
   DASHBOARD (protected) — "Welcome back" + where-am-I-now summary

   Note on data sourcing: account + profile come from Supabase
   (real, per-user). Class/practice/progress numbers still read
   from this browser's local Store, same as the public pages — that
   becomes real per-user database data in Phase 3. Keeping both
   pages on the same Store today means nothing here breaks once
   that swap happens; only Store's internals change.
   ============================================================ */

const DashboardPage = {
  render() {
    return `
    <section class="max-w-6xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      <div id="dashboard-root">${Components.EmptyState("user", "Loading your dashboard…", "One moment.")}</div>
    </section>`;
  },

  async mount(container) {
    const user = Auth.getUser();
    const root = container.querySelector("#dashboard-root");
    const { data: profile } = await Auth.getProfile(user.id);
    const name = (profile && profile.name) || (user.user_metadata && user.user_metadata.name) || user.email.split("@")[0];

    const s = Store.getState();
    const current = Store.getClassById(s.currentClassId);
    const level = APP_DATA.LEVELS.find(l => l.id === current.levelId);
    const stats = Store.overallStats();
    const overallPct = Math.round((stats.classesCompleted / stats.totalClasses) * 100);
    const unlocked = APP_DATA.ACHIEVEMENTS.filter(a => Store.isAchievementUnlocked(a.id));
    const latestAchievement = unlocked[unlocked.length - 1];

    root.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-2">Dashboard</p>
          <h1 class="font-display text-3xl text-ink-50">Welcome back, ${Utils.escapeHtml(name)}</h1>
        </div>
        <a href="#/profile" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("user", "w-4 h-4")} Edit Profile</a>
      </div>

      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8 mb-8">
        <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-3">Continue Your Journey</p>
        <div class="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p class="text-xs text-ink-500 mb-1">LEVEL ${level.id} — ${level.title.toUpperCase()} · CLASS ${String(current.number).padStart(2, "0")}</p>
            <h2 class="font-display text-2xl text-ink-50 mb-3">${current.title}</h2>
            <p class="text-sm text-ink-400 max-w-lg">${continueSentence(stats, current)}</p>
          </div>
          <a href="#/classes/${current.id}" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shrink-0">Continue Class ${icon("arrowRight", "w-3.5 h-3.5")}</a>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        ${Components.StatCard("chart", overallPct + "%", "Overall Progress")}
        ${Components.StatCard("grid", `${stats.classesCompleted}/${stats.totalClasses}`, "Classes")}
        ${Components.StatCard("timer", stats.practiceHours, "Practice Hrs")}
        ${Components.StatCard("flame", stats.streak, "Day Streak")}
        ${Components.StatCard("note", stats.songsCompleted, "Songs")}
        <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-2">
          <div class="w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center">${icon("trophy", "w-5 h-5")}</div>
          <div class="font-display text-sm text-ink-50 leading-snug">${latestAchievement ? `${latestAchievement.icon} ${latestAchievement.title}` : "None yet"}</div>
          <div class="text-xs text-ink-400 uppercase tracking-wide">Latest Achievement</div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <a href="#/practice" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-gold-500/20 hover:bg-white/[0.04] transition-colors">
          <div class="w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center mb-3">${icon("timer", "w-5 h-5")}</div>
          <h3 class="font-display text-base text-ink-50 mb-1">Practice today</h3>
          <p class="text-xs text-ink-500">Keep the streak going — even 10 focused minutes count.</p>
        </a>
        <a href="#/progress" class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-gold-500/20 hover:bg-white/[0.04] transition-colors">
          <div class="w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center mb-3">${icon("chart", "w-5 h-5")}</div>
          <h3 class="font-display text-base text-ink-50 mb-1">See your progress</h3>
          <p class="text-xs text-ink-500">Skill bars, achievements and your Before/After timeline.</p>
        </a>
      </div>
    `;
  },
};

function continueSentence(stats, current) {
  if (stats.classesCompleted === 0) {
    return `You're just getting started — your first step is "${current.title}".`;
  }
  return `You've completed ${stats.classesCompleted} class${stats.classesCompleted === 1 ? "" : "es"}. Your next step is "${current.title}".`;
}
