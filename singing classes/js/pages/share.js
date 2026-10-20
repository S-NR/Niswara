/* ============================================================
   SHARE PAGE — "Share My Journey" public-post generator
   ============================================================ */

const SharePage = {
  render(params) {
    const cls = Store.getClassById(params.id);
    if (!cls || !Store.getState().completedClassIds.includes(cls.id)) {
      return `<section class="max-w-2xl mx-auto px-5 lg:px-8 py-20">
        ${Components.EmptyState("share", "Nothing to share yet", "Complete a class first — a clean, postable summary will appear here automatically.")}
        <div class="text-center mt-6"><a href="#/classes" class="text-sm text-gold-300">Browse Classes</a></div>
      </section>`;
    }
    const progress = Store.getClassProgress(cls.id);
    const upload = progress.uploads[progress.uploads.length - 1];
    const level = APP_DATA.LEVELS.find(l => l.id === cls.levelId);
    const all = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number));
    const next = all[all.findIndex(x => x.id === cls.id) + 1];

    const postText = buildPostText(cls, level, progress, next);

    return `
    <section class="max-w-2xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Share My Journey", "Class " + String(cls.number).padStart(2, "0") + " recap", "A clean summary, ready to post to Instagram, YouTube, Facebook or LinkedIn — no social accounts connected, just content and copy/share tools.")}

      <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-7 sm:p-9 mb-6">
        <p class="text-xs tracking-widest text-gold-400/80 uppercase mb-2">From First Note → Professional</p>
        <h3 class="font-display text-2xl text-ink-50 mb-1">Class ${String(cls.number).padStart(2, "0")} — ${cls.title}</h3>
        <p class="text-sm text-ink-500 mb-6">Level ${level.id} · ${level.title}</p>

        <div class="flex flex-col gap-4 text-sm">
          <div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What I learned</p><p class="text-ink-200">${cls.content.whatYoullLearn}</p></div>
          <div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What I practiced</p><p class="text-ink-200">${(cls.content.guidedPractice[0] || cls.description)}</p></div>
          <div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">My result</p><p class="text-ink-200">${progress.reflection ? Utils.escapeHtml(progress.reflection) : "Completed the assignment and self-evaluation for this class."}</p></div>
          ${next ? `<div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What comes next</p><p class="text-ink-200">Class ${String(next.number).padStart(2, "0")} — ${next.title}</p></div>` : ""}
        </div>
      </div>

      <div class="mb-6">${Components.AudioPlayer("share-audio", upload ? upload.dataUrl : null, upload ? upload.name : "Not recorded yet")}</div>

      <div class="flex flex-wrap gap-3">
        <button id="copy-post-btn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">${icon("copy", "w-4 h-4")} Copy Post</button>
        <button id="share-btn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share</button>
        <span id="share-feedback" class="text-xs text-emerald-300 self-center"></span>
      </div>

      <textarea readonly class="w-full mt-6 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-xs text-ink-400 resize-none" rows="7">${Utils.escapeHtml(postText)}</textarea>
    </section>`;
  },

  mount(container, params) {
    wireAudioPlayers(container);
    const copyBtn = container.querySelector("#copy-post-btn");
    const shareBtn = container.querySelector("#share-btn");
    const feedback = container.querySelector("#share-feedback");
    const textarea = container.querySelector("textarea[readonly]");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        feedback.textContent = "Copied to clipboard";
      } catch {
        textarea.select();
        feedback.textContent = "Select-all ready — press Ctrl/Cmd+C";
      }
      setTimeout(() => (feedback.textContent = ""), 2500);
    });

    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try { await navigator.share({ title: "From First Note to Professional", text: textarea.value }); }
        catch { /* user cancelled */ }
      } else {
        await navigator.clipboard.writeText(textarea.value).catch(() => {});
        feedback.textContent = "Sharing isn't supported here — copied instead";
        setTimeout(() => (feedback.textContent = ""), 2500);
      }
    });
  },
};

function buildPostText(cls, level, progress, next) {
  return [
    `🎵 Class ${String(cls.number).padStart(2, "0")} — ${cls.title}`,
    `Level ${level.id}: ${level.title}`,
    "",
    `What I learned: ${cls.content.whatYoullLearn}`,
    `My result: ${progress.reflection || "Completed the assignment and self-evaluation."}`,
    next ? `Next up: Class ${String(next.number).padStart(2, "0")} — ${next.title}` : "",
    "",
    "#FromFirstNoteToProfessional #SingingJourney #LearnToSing",
  ].filter(Boolean).join("\n");
}
