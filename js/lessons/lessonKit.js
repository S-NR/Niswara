/* ============================================================
   LESSON KIT — shared building blocks for interactive lessons
   (Class 3 "Understanding Pitch", Class 4 "Matching a Note", …):
   header, stage tracker, chapters, text helpers, the
   "lesson viewed" sentinel and the assignment checklist.
   Each lesson keeps its own content and exercises.
   ============================================================ */

const LessonKit = {
  p: (html) => `<p class="text-ink-300 leading-relaxed mb-4">${html}</p>`,

  narrow: (html) => `<div class="max-w-3xl mx-auto">${html}</div>`,

  tryIt: (html, label = "Try it") => `
    <div class="rounded-2xl border border-gold-400/15 bg-gold-500/[0.04] px-5 py-4 my-5 text-sm text-ink-300 leading-relaxed">
      <span class="text-gold-300 font-medium">${label} · </span>${html}
    </div>`,

  /** A lesson step. Text stays in a readable 3xl column; wide steps let their interactive part use the full width. */
  chapter(stages, stage, step, title, body, { id = "", wide = false } = {}) {
    return `
    <section ${id ? `id="${id}"` : ""} data-stage="${stage}" class="lesson-chapter w-full ${wide ? "" : "max-w-3xl"} mx-auto scroll-mt-32">
      <div class="max-w-3xl mx-auto">
        <p class="text-[11px] tracking-[0.2em] uppercase text-gold-400/80 mb-2">${stages.find((s) => s.id === stage).label} · Step ${step}</p>
        <h2 class="font-display text-2xl sm:text-3xl text-ink-50 mb-5">${title}</h2>
      </div>
      ${body}
    </section>`;
  },

  header(cls, status, pct) {
    return `
      <section class="max-w-3xl box-content mx-auto px-5 lg:px-8 pt-10 sm:pt-14">
        <a href="#/classes" class="text-xs text-ink-500 hover:text-ink-300 inline-flex items-center gap-1.5 mb-6">${icon("arrowRight", "w-3 h-3 rotate-180")} All Classes</a>
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs text-ink-500 tracking-widest">LEVEL ${cls.levelId} · CLASS ${String(cls.number).padStart(2, "0")}</span>
          ${statusBadge(status)}
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 tracking-wide uppercase">Interactive</span>
        </div>
        <h1 class="font-display text-4xl sm:text-5xl text-ink-50 mb-3">${cls.title}</h1>
        <p class="font-display italic text-lg sm:text-xl text-ink-300 max-w-2xl">“${cls.subtitle}”</p>
        <div class="flex items-center gap-3 text-xs text-ink-500 mt-4">
          <span>${cls.category}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span>${cls.difficulty}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span>~${cls.estMinutes} min</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
          <span data-lesson-pct>${pct}% complete</span>
        </div>
        ${WarmupPrompt.classCard(cls)}
      </section>`;
  },

  stepper(stages, cls) {
    return `
      <nav class="lesson-stepper sticky top-16 z-30 mt-8 border-y border-white/5 bg-ink-950/85 backdrop-blur-xl" aria-label="Lesson stages">
        <div class="max-w-5xl mx-auto px-5 lg:px-8 flex items-center gap-1 overflow-x-auto py-2.5">
          ${stages.map((s, i) => `
            <a href="#/classes/${cls.id}" data-stage-link="${s.id}" class="stage-pill">${i + 1} · ${s.label}</a>
            ${i < stages.length - 1 ? `<span class="text-ink-700 text-xs">›</span>` : ""}`).join("")}
        </div>
      </nav>`;
  },

  /** Stage tracker: click to scroll, highlight the stage in view. Returns cleanup. */
  wireStepper(container) {
    const cleanups = [];
    const links = [...container.querySelectorAll("[data-stage-link]")];
    const onStageClick = (e) => {
      const a = e.target.closest("[data-stage-link]");
      if (!a) return;
      e.preventDefault(); // keep the hash route; just scroll
      const target = container.querySelector(`[data-stage="${a.dataset.stageLink}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    container.addEventListener("click", onStageClick);
    cleanups.push(() => container.removeEventListener("click", onStageClick));
    if ("IntersectionObserver" in window) {
      const visible = new Map();
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => visible.set(en.target, en.isIntersecting));
        const first = [...container.querySelectorAll("[data-stage]")].find((el) => visible.get(el));
        if (!first) return;
        const stage = first.dataset.stage;
        links.forEach((l) => l.classList.toggle("is-active", l.dataset.stageLink === stage));
        // On narrow screens keep the active stage visible in the scrollable tracker
        const active = links.find((l) => l.dataset.stageLink === stage);
        const bar = active && active.parentElement;
        if (bar && bar.scrollWidth > bar.clientWidth) {
          bar.scrollTo({ left: active.offsetLeft - bar.clientWidth / 2 + active.offsetWidth / 2, behavior: "smooth" });
        }
      }, { rootMargin: "-120px 0px -55% 0px" });
      container.querySelectorAll("[data-stage]").forEach((el) => so.observe(el));
      cleanups.push(() => so.disconnect());
    }
    return () => cleanups.forEach((fn) => fn());
  },

  /** Calls onViewed once the learner scrolls to [data-lesson-viewed-sentinel] (not merely opens the page). Returns cleanup. */
  wireViewedSentinel(container, onViewed) {
    const sentinel = container.querySelector("[data-lesson-viewed-sentinel]");
    if (!sentinel || !("IntersectionObserver" in window)) return () => {};
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { onViewed(); io.disconnect(); }
    });
    io.observe(sentinel);
    return () => io.disconnect();
  },

  /**
   * Assignment checklist. Auto items tick themselves from lesson evidence; the rest are
   * ticked by the learner (inputs carry data-assignment="<index>").
   */
  renderAssignment({ title, items, isDone, isAuto, footer = "" }) {
    const done = items.filter((_, i) => isDone(i)).length;
    return `
      <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="font-display text-xl text-ink-50">${title}</h3>
          <span class="text-xs text-ink-500 tabular-nums">${done}/${items.length} done</span>
        </div>
        <ol class="flex flex-col gap-1">
          ${items.map((text, i) => {
            const auto = isAuto(i);
            const ok = isDone(i);
            return `<li>
              <label class="flex items-start gap-3 rounded-xl px-3 py-2.5 ${auto ? "" : "cursor-pointer hover:bg-white/[0.03]"}">
                <input type="checkbox" data-assignment="${i}" ${ok ? "checked" : ""} ${auto ? "disabled" : ""} class="mt-0.5 w-4 h-4 accent-amber-400 shrink-0">
                <span class="text-sm ${ok ? "text-ink-400 line-through decoration-ink-600" : "text-ink-200"}"><span class="text-ink-500 tabular-nums mr-1.5">${i + 1}.</span>${text}</span>
                ${auto ? `<span class="ml-auto text-[10px] uppercase tracking-wider text-ink-600 shrink-0 mt-0.5">${ok ? "done" : "auto"}</span>` : ""}
              </label></li>`;
          }).join("")}
        </ol>
        <p class="text-xs text-ink-500 mt-4">Items marked “auto” tick themselves when you finish that part of the lesson.</p>
        ${footer}
      </div>`;
  },

  /**
   * Pull this account's saved progress for the class (other devices' work). If it brought
   * anything new, redraw the lesson once so every exercise shows it — unless the learner is
   * mid-recording or typing, in which case the live progress panels (already refreshed by
   * ClassActivity.onChange) are enough and nothing they're doing is interrupted.
   */
  loadAndRefresh(container, classId, params) {
    return ClassActivity.load(classId).then((changed) => {
      if (!changed || !container.isConnected) return;
      const el = document.activeElement;
      const typing = el && container.contains(el) && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      if (typing || VoiceRecorder.isRecording()) return;
      Router.softRefresh(container, ClassDetailPage, params);
    });
  },

  /** The next class in curriculum order, or undefined. */
  nextClass(cls) {
    const all = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number));
    return all[all.findIndex((c) => c.id === cls.id) + 1];
  },
};
