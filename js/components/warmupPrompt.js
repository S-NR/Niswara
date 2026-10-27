/* ============================================================
   WARM-UP PROMPTS — small, optional cards that point to the
   common Warm-up (js/pages/warmup.js). Never the warm-up UI
   itself, and never a gate: every card can be skipped.

     classCard(cls)            "🎤 Prepare your voice" at the top of
                               Class 11+ (Class 10 has its own intro)
     beforeRecording(id, to)   "Would you like to warm up first?"
                               before a progress/performance recording
     entryCard()               the Warm-up entry on the Classes page
                               (locked: X / 9 · unlocked: Start)

   Pure HTML strings; [data-warmup-skip] is handled by one
   document-level listener below, so pages need no wiring.
   "Skip" hides that card for the rest of the day on this device.
   ============================================================ */

const WarmupPrompt = (() => {
  const SKIP_KEY = "niswara.warmup.skipped";

  function skippedToday(cardId) {
    try { return JSON.parse(localStorage.getItem(SKIP_KEY) || "{}")[cardId] === Store.todayKey(); } catch (e) { return false; }
  }
  function rememberSkip(cardId) {
    try {
      const today = Store.todayKey();
      const all = JSON.parse(localStorage.getItem(SKIP_KEY) || "{}");
      Object.keys(all).forEach((k) => { if (all[k] !== today) delete all[k]; }); // only today's skips matter
      all[cardId] = today;
      localStorage.setItem(SKIP_KEY, JSON.stringify(all));
    } catch (e) { /* per-device convenience only */ }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-warmup-skip]");
    if (!btn) return;
    rememberSkip(btn.dataset.warmupSkip);
    const card = btn.closest("[data-warmup-card]");
    if (card) card.hidden = true;
  });

  const doneLine = (text, extra = "") => `
    <div class="wu-prompt is-done flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-sm">
      <span class="text-emerald-300">${icon("check", "w-4 h-4 inline-flex align-[-3px] mr-1")}${text}</span>${extra}
    </div>`;

  /** Class pages from Class 11 on (and later levels). */
  function classCard(cls) {
    if ((cls.levelId === 1 && cls.number <= 10) || !Warmup.isUnlocked()) return "";
    const back = `#/classes/${cls.id}`;
    if (Warmup.doneToday()) {
      return `<div class="mt-6">${doneLine("You warmed up today.", `<a href="${Warmup.href("quick", back)}" class="text-xs text-ink-400 hover:text-gold-300 underline">Warm up again</a>`)}</div>`;
    }
    const id = `class-${cls.id}`;
    if (skippedToday(id)) return "";
    return `
      <div class="wu-prompt mt-6 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4" data-warmup-card>
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span class="wu-mic-sm" aria-hidden="true">🎤</span>
          <div>
            <p class="text-[11px] tracking-[0.2em] uppercase text-gold-300">Prepare your voice</p>
            <p class="text-sm text-ink-300">Take a moment to warm up before starting today's class.</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <a href="${Warmup.href("quick", back)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Quick Warm-up <span class="text-ink-950/60 text-xs">~5 min</span></a>
          <a href="${Warmup.href("full", back)}" class="px-3 py-2 rounded-full text-sm text-ink-300 hover:text-ink-50 hover:bg-white/5 transition-colors">Full</a>
          <button type="button" data-warmup-skip="${id}" class="px-3 py-2 rounded-full text-sm text-ink-500 hover:text-ink-200 hover:bg-white/5 transition-colors">Skip</button>
        </div>
      </div>`;
  }

  /** Before a progress or performance recording. returnTo: the route to come back to afterwards. */
  function beforeRecording(cardId, returnTo) {
    if (!Warmup.isUnlocked()) return "";
    if (Warmup.doneToday()) return `<div class="mb-5">${doneLine("You warmed up today — ready to record.")}</div>`;
    if (skippedToday(`rec-${cardId}`)) return "";
    return `
      <div class="wu-prompt rounded-2xl p-4 sm:p-5 mb-5" data-warmup-card>
        <div class="flex items-center gap-3 mb-3">
          <span class="wu-mic-sm" aria-hidden="true">🎤</span>
          <div>
            <p class="text-sm text-ink-50 font-medium">Would you like to warm up first?</p>
            <p class="text-xs text-ink-400">When it's done, you'll come straight back here.</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <a href="${Warmup.href("quick", returnTo)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Quick Warm-up</a>
          <a href="${Warmup.href("full", returnTo)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">Full Warm-up</a>
          <button type="button" data-warmup-skip="rec-${cardId}" class="px-4 py-2 rounded-full text-sm text-ink-400 hover:text-ink-100 hover:bg-white/5 transition-colors">Skip</button>
        </div>
      </div>`;
  }

  /** The "Common" entry on the Classes page — outside the numbered class list. */
  function entryCard() {
    const st = Warmup.status();
    if (!st.unlocked) {
      return `
        <a href="#/warmup" class="wu-entry is-locked group rounded-3xl p-5 sm:p-6 flex items-center gap-5">
          <span class="wu-mic-md opacity-60" aria-hidden="true">${icon("lock", "w-6 h-6")}</span>
          <div class="flex-1 min-w-0">
            <h3 class="font-display text-xl text-ink-100">Warm-up</h3>
            <p class="text-sm text-ink-400 mb-3">Complete your Foundation classes first.</p>
            <div class="max-w-xs">${Components.ProgressBar(Math.round((st.done / st.total) * 100))}</div>
            <p class="text-xs text-ink-500 mt-1.5 tabular-nums">${st.done} / ${st.total} classes completed</p>
          </div>
        </a>`;
    }
    return `
      <a href="#/warmup" class="wu-entry group rounded-3xl p-5 sm:p-6 flex items-center gap-5">
        <span class="wu-mic-md" aria-hidden="true">🎤</span>
        <div class="flex-1 min-w-0">
          <h3 class="font-display text-xl text-ink-50">Warm-up</h3>
          <p class="text-sm text-ink-300">Prepare your voice before you sing.</p>
          <p class="text-xs text-ink-500 mt-1">Quick ~5 min · Full ~10–12 min · Performance ~3–5 min</p>
        </div>
        <span class="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium group-hover:bg-gold-400 transition-colors shrink-0">Start Warm-up ${icon("arrowRight", "w-3.5 h-3.5")}</span>
      </a>`;
  }

  return { classCard, beforeRecording, entryCard };
})();
