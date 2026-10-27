/* ============================================================
   PROGRESS PAGE — dashboard, skill bars, Before/After, achievements
   ============================================================ */

const ProgressPage = {
  render() {
    const stats = Store.overallStats();
    const skillKeys = Object.keys(APP_DATA.SKILL_LABELS);

    return `
    <section class="max-w-6xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Progress", "Where I am now", "A living dashboard — these numbers update automatically as classes, practice and projects progress.")}

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
        ${Components.StatCard("grid", `${stats.classesCompleted}/${stats.totalClasses}`, "Classes Completed")}
        ${Components.StatCard("timer", stats.practiceHours, "Practice Hours")}
        ${Components.StatCard("note", stats.songsCompleted, "Songs Completed")}
        ${Components.StatCard("mic", stats.recordings, "Recordings")}
        ${Components.StatCard("flame", stats.streak, "Current Streak")}
      </div>

      <div class="grid lg:grid-cols-2 gap-10 mb-16">
        <div>
          <h3 class="font-display text-xl text-ink-50 mb-5">Overall Progress</h3>
          <div class="flex flex-col gap-5">
            ${skillKeys.map(k => Components.SkillBar(APP_DATA.SKILL_LABELS[k], Store.skillProgress(k))).join("")}
          </div>
        </div>
        <div>
          <h3 class="font-display text-xl text-ink-50 mb-5">Achievements</h3>
          <div class="grid sm:grid-cols-2 gap-3">
            ${APP_DATA.ACHIEVEMENTS.map(a => Components.AchievementCard(a, Store.isAchievementUnlocked(a.id))).join("")}
          </div>
        </div>
      </div>

      <div id="before-after">
        <div class="flex items-end justify-between mb-5 flex-wrap gap-2">
          <div>
            <p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-2">The main event</p>
            <h3 class="font-display text-2xl text-ink-50">Before → After</h3>
          </div>
          <p class="text-sm text-ink-500 max-w-sm">Upload a short recording at each milestone and let the timeline tell the real story.</p>
        </div>
        ${WarmupPrompt.beforeRecording("progress", "#/progress")}
        <div class="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          ${APP_DATA.MILESTONES.map(m => Components.MilestoneCard(m, Store.getState().milestoneUploads[m.id])).join("")}
        </div>
      </div>
    </section>`;
  },

  mount(container) {
    container.querySelectorAll('[data-change="handleMilestoneUpload"]').forEach(input => {
      input.addEventListener("change", async () => {
        const file = input.files[0];
        if (!file) return;
        const mediaId = await Media.save(file).catch(() => null);
        if (!mediaId) {
          window.dispatchEvent(new CustomEvent("store:persist-failed"));
          return;
        }
        Store.setMilestoneUpload(input.dataset.milestone, { fileName: file.name, mediaId, date: new Date().toISOString() });
        Router.softRefresh(container, ProgressPage);
      });
    });

    return wireAudioPlayers(container);
  },
};

/**
 * Shared audio-player wiring: play/pause toggle + icon swap. Used on Progress, Share and Class pages.
 * Delegated on the container so players inserted later (new uploads) work too. Returns a cleanup fn
 * — the container (#app) outlives the page, so the listener must be removed on unmount.
 */
function wireAudioPlayers(container) {
  async function onClick(e) {
    const btn = e.target.closest('[data-action="toggleAudio"]');
    if (!btn || !container.contains(btn)) return;
    const id = btn.dataset.target;
    const audio = container.querySelector(`#${id}`);
    if (!audio) return;
    const iconHolder = container.querySelector(`[data-audio-icon="${id}"]`);

    if (!audio.getAttribute("src") && audio.dataset.mediaId) {
      const url = await Media.getUrl(audio.dataset.mediaId).catch(() => null);
      if (!url) {
        btn.disabled = true;
        btn.title = "This recording isn't stored on this device";
        return;
      }
      audio.src = url;
    }

    audio.onended = () => { if (iconHolder) iconHolder.innerHTML = Icons.play; };
    audio.onpause = () => { if (iconHolder) iconHolder.innerHTML = Icons.play; };
    audio.onplay = () => { if (iconHolder) iconHolder.innerHTML = Icons.pause; };
    if (audio.paused) {
      container.querySelectorAll("audio").forEach(a => a !== audio && a.pause());
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }
  container.addEventListener("click", onClick);
  return () => {
    container.removeEventListener("click", onClick);
    container.querySelectorAll("audio").forEach(a => a.pause());
  };
}
