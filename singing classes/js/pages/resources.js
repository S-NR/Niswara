/* ============================================================
   RESOURCES PAGE — Mixing & Mastering learning area
   ============================================================ */

const ResourcesPage = {
  render() {
    return `
    <section class="max-w-5xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Resources", "Mixing & Mastering", "A dedicated learning area for studio craft. Advanced topics stay locked until the matching level is reached — no shortcuts to professional ears.")}
      <div class="flex flex-col gap-12">
        ${APP_DATA.RESOURCE_TOPICS.map(group => {
          const locked = !Store.isLevelUnlocked(group.unlockLevel);
          return `
          <div>
            <div class="flex items-center gap-3 mb-5">
              <h3 class="font-display text-xl ${locked ? "text-ink-500" : "text-ink-50"}">${group.group}</h3>
              ${locked ? `<span class="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-ink-500 uppercase tracking-wide">Unlocks at Level ${group.unlockLevel}</span>` : statusBadge("available")}
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${group.topics.map(t => `
                <div class="rounded-xl border border-white/5 bg-white/[0.02] p-4 ${locked ? "opacity-50" : ""}">
                  <div class="flex items-center gap-2.5 mb-1.5">
                    <span class="text-gold-300">${icon("sliders", "w-4 h-4")}</span>
                    <h4 class="text-sm font-medium text-ink-100">${t.title}</h4>
                  </div>
                  <p class="text-xs text-ink-500 leading-relaxed">${t.blurb}</p>
                </div>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>
    </section>`;
  },
  mount() {},
};
