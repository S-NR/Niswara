/* ============================================================
   CLASS DETAIL PAGE — the full lesson experience
   ============================================================ */

const ClassDetailPage = {
  render(params) {
    const cls = Store.getClassById(params.id);
    if (!cls) return Components.EmptyState("grid", "Class not found", "This class doesn't exist yet.");

    const status = Store.classStatus(cls);
    const level = APP_DATA.LEVELS.find(l => l.id === cls.levelId);

    if (status === "locked") {
      return `
      <section class="max-w-3xl mx-auto px-5 lg:px-8 py-20 text-center">
        ${Components.EmptyState("lock", `Class ${cls.number} is locked`, `Finish everything earlier in Level ${level.id} — ${level.title} to unlock "${cls.title}".`)}
        <a href="#/classes" class="inline-flex items-center gap-2 mt-6 text-sm text-gold-300">${icon("arrowRight", "w-3.5 h-3.5 rotate-180")} Back to Classes</a>
      </section>`;
    }

    // Interactive lessons (e.g. Class 3) own their whole layout
    const lesson = cls.interactive && InteractiveLessons[cls.interactive];
    if (lesson) return lesson.render(cls, status);

    const progress = Store.getClassProgress(cls.id);
    const c = cls.content;
    const all = APP_DATA.CLASSES.slice().sort((a, b) => (a.levelId - b.levelId) || (a.number - b.number));
    const idx = all.findIndex(x => x.id === cls.id);
    const next = all[idx + 1];

    return `
    <section class="max-w-3xl mx-auto px-5 lg:px-8 py-10 sm:py-14">
      <a href="#/classes" class="text-xs text-ink-500 hover:text-ink-300 inline-flex items-center gap-1.5 mb-6">${icon("arrowRight", "w-3 h-3 rotate-180")} All Classes</a>

      <div class="flex items-center gap-3 mb-3">
        <span class="text-xs text-ink-500 tracking-widest">LEVEL ${level.id} · CLASS ${String(cls.number).padStart(2, "0")}</span>
        ${statusBadge(status)}
      </div>
      <h1 class="font-display text-3xl sm:text-4xl text-ink-50 mb-3">${cls.title}</h1>
      <div class="flex items-center gap-3 text-xs text-ink-500 mb-10">
        <span>${cls.category}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
        <span>${cls.difficulty}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
        <span>${cls.estMinutes} min</span>
      </div>

      <div class="flex flex-col gap-10">

        ${lessonBlock("1", "What You'll Learn", `<p class="text-ink-300 leading-relaxed">${c.whatYoullLearn}</p>`)}
        ${lessonBlock("2", "Why It Matters", `<p class="text-ink-300 leading-relaxed">${c.whyItMatters}</p>`)}
        ${lessonBlock("3", "Theory", `<p class="text-ink-300 leading-relaxed">${c.theory}</p>`)}

        ${lessonBlock("4", "Demonstration", `
          <div class="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 flex items-center gap-4">
            <div class="w-11 h-11 rounded-full bg-white/5 text-ink-400 flex items-center justify-center shrink-0">${icon("play", "w-5 h-5")}</div>
            <p class="text-sm text-ink-500">Space reserved for an audio, video or reference demonstration of this skill. Add your own example recording here as your library grows.</p>
          </div>`)}

        ${c.guidedPractice.length ? lessonBlock("5", "Guided Practice", `
          <ol class="flex flex-col gap-3">
            ${c.guidedPractice.map((step, i) => `
              <li class="flex gap-3 text-ink-300 text-sm leading-relaxed">
                <span class="w-6 h-6 rounded-full bg-gold-500/10 text-gold-300 text-xs flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span>
                <span>${step}</span>
              </li>`).join("")}
          </ol>`) : ""}

        ${lessonBlock("6", "Practice Timer", `<p class="text-sm text-ink-500 mb-4">Run the exercises above while the timer counts your focused practice time.</p>${Timer.render("class-timer", { showLogButton: true })}`)}

        ${c.assignment.instructions.length ? lessonBlock("7", "Assignment", `
          <ul class="flex flex-col gap-2 mb-5">
            ${c.assignment.instructions.map(i => `<li class="flex gap-2.5 text-sm text-ink-300"><span class="text-gold-400 mt-0.5">${icon("mic", "w-4 h-4")}</span><span>${i}</span></li>`).join("")}
          </ul>`) : ""}

        ${c.assignment.questions.length ? lessonBlock("8", "Self Evaluation", `
          <div class="flex flex-col gap-4">
            ${c.assignment.questions.map((q, i) => `
              <div>
                <label class="block text-sm text-ink-300 mb-1.5">${q}</label>
                <textarea data-answer-index="${i}" rows="2" placeholder="Write a short, honest answer…"
                  class="w-full rounded-xl bg-white/[0.03] border border-white/10 focus:border-gold-400/40 outline-none px-4 py-3 text-sm text-ink-100 placeholder:text-ink-600 resize-none transition-colors"
                >${Utils.escapeHtml(progress.answers[i] || "")}</textarea>
              </div>`).join("")}
          </div>`) : ""}

        ${lessonBlock("9", "Upload Practice", Components.UploadArea("class-upload", "audio/*,video/*", "Upload your recording for this class", progress.uploads))}

        ${lessonBlock("10", "Reflection", `
          <textarea id="reflection-field" rows="4" placeholder="Personal notes — what stood out, what you want to remember…"
            class="w-full rounded-xl bg-white/[0.03] border border-white/10 focus:border-gold-400/40 outline-none px-4 py-3 text-sm text-ink-100 placeholder:text-ink-600 resize-none transition-colors"
          >${Utils.escapeHtml(progress.reflection || "")}</textarea>`)}

        ${cls.comingSoon ? lessonBlock("11", "Class Completion", `
          <p class="text-sm text-ink-500">This lesson is still being written, so it can't be completed yet. It'll unlock for completion as soon as its content is published.</p>
        `) : lessonBlock("11", "Class Completion", `
          <label class="flex items-start gap-3 mb-5 cursor-pointer">
            <input type="checkbox" id="assignment-done-checkbox" ${progress.assignmentDone ? "checked" : ""} ${status === "completed" ? "disabled" : ""}
              class="mt-0.5 w-4 h-4 rounded border-white/20 bg-transparent accent-amber-400">
            <span class="text-sm text-ink-300">I've completed the assignment and self-evaluation above.</span>
          </label>
          ${status === "completed" ? `
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center gap-2 text-emerald-300 text-sm">${icon("check", "w-4 h-4")} Class completed</span>
              <a href="#/share/${cls.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-ink-100 text-sm hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")} Share this class</a>
              ${next ? `<a href="#/classes/${next.id}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Next Class ${icon("arrowRight", "w-3.5 h-3.5")}</a>` : ""}
            </div>
          ` : `
            <button id="mark-complete-btn" ${progress.assignmentDone ? "" : "disabled"}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors ${progress.assignmentDone ? "bg-gold-500 text-ink-950 hover:bg-gold-400" : "bg-white/5 text-ink-500 cursor-not-allowed"}">
              Mark Class Complete ${icon("check", "w-4 h-4")}
            </button>
            <p id="mark-complete-hint" class="text-xs text-ink-600 mt-2">${progress.assignmentDone ? "" : "Check the box above once your assignment is done."}</p>
          `}
        `)}
      </div>
    </section>`;
  },

  mount(container, params) {
    const cls = Store.getClassById(params.id);
    if (!cls || Store.classStatus(cls) === "locked") return () => {};

    const lesson = cls.interactive && InteractiveLessons[cls.interactive];
    if (lesson) return lesson.mount(container, cls, params);

    const timerCtrl = Timer.wire(container, "class-timer", {
      onLog: (minutes) => Store.logMinutes(taskKeyForSkill(cls.skillTag), minutes),
    });

    // Self-evaluation answers — persist on input, no rerender (keeps focus)
    container.querySelectorAll("[data-answer-index]").forEach(ta => {
      ta.addEventListener("input", Utils.debounce(() => {
        const progress = Store.getClassProgress(cls.id);
        const answers = { ...progress.answers, [ta.dataset.answerIndex]: ta.value };
        Store.updateClassProgress(cls.id, { answers });
      }, 350));
    });

    // Reflection
    const reflectionField = container.querySelector("#reflection-field");
    if (reflectionField) {
      reflectionField.addEventListener("input", Utils.debounce(() => {
        Store.updateClassProgress(cls.id, { reflection: reflectionField.value });
      }, 350));
    }

    // Upload
    const uploadInput = container.querySelector("#class-upload");
    if (uploadInput) {
      uploadInput.addEventListener("change", async () => {
        const file = uploadInput.files[0];
        if (!file) return;
        const mediaId = await Media.save(file).catch(() => null);
        if (!mediaId) {
          window.dispatchEvent(new CustomEvent("store:persist-failed"));
          return;
        }
        const upload = { name: file.name, type: file.type, date: new Date().toISOString(), mediaId };
        Store.addUpload(cls.id, upload);
        const list = container.querySelector("#class-upload-list");
        if (list) list.insertAdjacentHTML("beforeend", Components.UploadItem(upload));
        uploadInput.value = ""; // allow re-selecting the same file
      });
    }

    const unwireAudio = wireAudioPlayers(container);

    // Assignment checkbox gates the complete button
    const assignmentCheckbox = container.querySelector("#assignment-done-checkbox");
    const completeBtn = container.querySelector("#mark-complete-btn");
    const hint = container.querySelector("#mark-complete-hint");
    if (assignmentCheckbox) {
      assignmentCheckbox.addEventListener("change", () => {
        Store.updateClassProgress(cls.id, { assignmentDone: assignmentCheckbox.checked });
        if (completeBtn) {
          completeBtn.disabled = !assignmentCheckbox.checked;
          completeBtn.className = `inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors ${assignmentCheckbox.checked ? "bg-gold-500 text-ink-950 hover:bg-gold-400" : "bg-white/5 text-ink-500 cursor-not-allowed"}`;
        }
        if (hint) hint.textContent = assignmentCheckbox.checked ? "" : "Check the box above once your assignment is done.";
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        if (completeBtn.disabled) return;
        Store.completeClass(cls.id);
        Store.addJournalEntry({
          classId: cls.id,
          classTitle: `Class ${cls.number} — ${cls.title}`,
          learned: cls.content.whatYoullLearn,
          thoughts: Store.getClassProgress(cls.id).reflection || "",
        });
        Router.softRefresh(container, ClassDetailPage, params);
      });
    }

    return () => {
      timerCtrl.destroy();
      unwireAudio();
    };
  },
};

function lessonBlock(number, title, bodyHtml) {
  return `
  <div>
    <div class="flex items-center gap-3 mb-3">
      <span class="w-7 h-7 rounded-full bg-white/5 text-ink-400 text-xs flex items-center justify-center shrink-0">${number}</span>
      <h2 class="font-display text-lg text-ink-50">${title}</h2>
    </div>
    <div class="pl-10">${bodyHtml}</div>
  </div>`;
}

function taskKeyForSkill(skillTag) {
  const t = APP_DATA.PRACTICE_TASKS.find(t => t.skillTag === skillTag);
  return t ? t.key : "song";
}
