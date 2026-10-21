/* ============================================================
   CLASS PROGRESS — per-user checklist + progress bar for an
   interactive class. Pure render; the lesson re-renders it
   whenever ClassActivity changes.

   items: [{ key, label, optionalNote? }]   checkpoints: { key: true }
   ============================================================ */

const ClassProgress = {
  percent(items, checkpoints) {
    const done = items.filter((i) => checkpoints[i.key]).length;
    return Math.round((done / items.length) * 100);
  },

  /** Ten-segment bar: [██████░░░░] 60% */
  bar(pct) {
    const filled = Math.round(pct / 10);
    return `
      <div class="flex items-center gap-3" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="flex gap-1 flex-1">
          ${Array.from({ length: 10 }).map((_, i) => `<span class="h-2.5 flex-1 rounded-sm ${i < filled ? "bg-gradient-to-r from-gold-500 to-gold-300 shadow-glow-sm" : "bg-white/[0.06]"}"></span>`).join("")}
        </div>
        <span class="font-display text-lg text-ink-50 tabular-nums w-12 text-right">${pct}%</span>
      </div>`;
  },

  render(title, items, checkpoints) {
    const pct = ClassProgress.percent(items, checkpoints);
    return `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <h3 class="font-display text-xl text-ink-50 mb-4">${title}</h3>
        ${ClassProgress.bar(pct)}
        <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-6">
          ${items.map((i) => {
            const done = !!checkpoints[i.key];
            return `<li class="flex items-start gap-2.5 text-sm ${done ? "text-ink-200" : "text-ink-500"}">
              <span class="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-px ${done ? "bg-emerald-500/15 text-emerald-300" : "border border-white/10"}">${done ? icon("check", "w-3 h-3") : ""}</span>
              <span>${i.label}${i.optionalNote ? ` <span class="text-ink-600 text-xs">(${i.optionalNote})</span>` : ""}</span>
            </li>`;
          }).join("")}
        </ul>
      </div>`;
  },
};
