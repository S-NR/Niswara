/* ============================================================
   PERSONAL NOTES — a learner's private notes for one class.
   Auto-saves (debounced) through ClassActivity.saveNote: to the
   account's class_notes row when logged in, otherwise to this
   browser only — and says which, so nobody is surprised.
   ============================================================ */

const PersonalNotes = (() => {
  const SAVE_DELAY = 800;

  /** title: heading (default "My Notes"). The notes key passed to wire() decides what they belong to (a class, or one recording). */
  function render(id, { placeholder = "", title = "My Notes", rows = 6 } = {}) {
    return `
    <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7" data-notes="${id}">
      <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h3 class="font-display text-xl text-ink-50">${title}</h3>
        <span class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500">${icon("lock", "w-3.5 h-3.5")} Private — only you can see these</span>
      </div>
      <textarea data-notes-field rows="${rows}" disabled class="field leading-relaxed" placeholder="${Utils.escapeHtml(placeholder)}">Loading…</textarea>
      <p class="text-xs text-ink-500 mt-2 min-h-[1rem]" data-notes-status aria-live="polite"></p>
    </div>`;
  }

  /** opts: classId, onSaved(body) */
  function wire(container, id, { classId, onSaved } = {}) {
    const root = container.querySelector(`[data-notes="${id}"]`);
    if (!root) return { destroy() {} };
    const field = root.querySelector("[data-notes-field]");
    const statusEl = root.querySelector("[data-notes-status]");
    let timer = null, destroyed = false, lastSavedBody = null;

    function describe(result) {
      if (!result.updatedAt) return Auth.isLoggedIn() ? "" : "Notes are kept on this device. Log in to save them to your account.";
      const t = new Date(result.updatedAt);
      const when = t.toDateString() === new Date().toDateString()
        ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : t.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      return result.savedTo === "account"
        ? `Saved to your account · ${when}`
        : `Saved on this device · ${when}${Auth.isLoggedIn() ? " (will sync to your account when possible)" : " — log in to keep notes with your account"}`;
    }

    async function save() {
      timer = null;
      const body = field.value;
      if (body === lastSavedBody) return;
      statusEl.textContent = "Saving…";
      const result = await ClassActivity.saveNote(classId, body);
      lastSavedBody = body;
      if (destroyed) return;
      statusEl.textContent = describe(result);
      if (onSaved) onSaved(body);
    }

    field.addEventListener("input", () => {
      statusEl.textContent = "Typing…";
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY);
    });
    field.addEventListener("blur", () => { if (timer) { clearTimeout(timer); save(); } });

    ClassActivity.loadNote(classId).then((result) => {
      if (destroyed) return;
      field.value = result.body || "";
      lastSavedBody = field.value;
      field.disabled = false;
      statusEl.textContent = describe(result);
    });

    return {
      destroy() {
        destroyed = true;
        if (timer) { clearTimeout(timer); save(); } // don't lose the last few keystrokes
      },
    };
  }

  return { render, wire };
})();
