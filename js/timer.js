/* ============================================================
   PRACTICE TIMER
   Self-contained interactive timer component. Returns markup +
   a wire() function that hooks up Start/Pause/Reset and reports
   elapsed minutes back to the caller to log against practice.
   ============================================================ */

const Timer = {
  render(id, { showLogButton = false } = {}) {
    return `
    <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-5 flex-wrap" data-timer="${id}">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center">${icon("timer", "w-5 h-5")}</div>
        <div class="font-display text-3xl tabular-nums text-ink-50" data-timer-display="${id}">00:00</div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" data-timer-toggle="${id}" class="px-4 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Start</button>
        <button type="button" data-timer-reset="${id}" class="px-4 py-2 rounded-full border border-white/15 text-ink-200 text-sm hover:bg-white/5 transition-colors">Reset</button>
        ${showLogButton ? `<button type="button" data-timer-log="${id}" class="px-4 py-2 rounded-full border border-gold-400/30 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors">Log this session</button>` : ""}
      </div>
    </div>`;
  },

  /** Wires up a rendered timer block. Returns { destroy, getElapsed, reset }. */
  wire(container, id, { onLog } = {}) {
    const root = container.querySelector(`[data-timer="${id}"]`);
    if (!root) return { destroy() {}, getElapsed: () => 0, reset() {} };
    const display = root.querySelector(`[data-timer-display="${id}"]`);
    const toggleBtn = root.querySelector(`[data-timer-toggle="${id}"]`);
    const resetBtn = root.querySelector(`[data-timer-reset="${id}"]`);
    const logBtn = root.querySelector(`[data-timer-log="${id}"]`);

    // Elapsed time comes from the clock, not from counting ticks: browsers
    // throttle intervals in background tabs, which made sessions under-count.
    let seconds = 0;          // whole seconds banked from previous runs
    let runStartedAt = null;  // Date.now() when the current run began
    let intervalId = null;

    function elapsed() {
      const live = runStartedAt === null ? 0 : (Date.now() - runStartedAt) / 1000;
      return Math.floor(seconds + live);
    }
    function tick() {
      display.textContent = Utils.formatSeconds(elapsed());
    }
    function start() {
      if (runStartedAt !== null) return;
      runStartedAt = Date.now();
      toggleBtn.textContent = "Pause";
      intervalId = setInterval(tick, 1000);
    }
    function pause() {
      if (runStartedAt !== null) {
        seconds += (Date.now() - runStartedAt) / 1000;
        runStartedAt = null;
      }
      toggleBtn.textContent = "Start";
      clearInterval(intervalId);
      tick();
    }
    function reset() {
      pause();
      seconds = 0;
      display.textContent = "00:00";
    }

    toggleBtn.addEventListener("click", () => (runStartedAt !== null ? pause() : start()));
    resetBtn.addEventListener("click", reset);
    if (logBtn) {
      logBtn.addEventListener("click", () => {
        const minutes = Math.round(elapsed() / 60);
        if (onLog) onLog(minutes);
        reset();
      });
    }

    return {
      destroy() { clearInterval(intervalId); },
      getElapsed: elapsed,
      reset,
    };
  },
};
