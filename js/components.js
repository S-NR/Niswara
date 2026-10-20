/* ============================================================
   COMPONENTS
   Pure functions returning HTML strings. Interactive bits are
   wired up afterwards by each page's mount() using data-action /
   data-change / data-input delegation (see app.js).
   ============================================================ */

const Components = {};

/* ---------- Navbar ---------- */
Components.Navbar = (route) => {
  const links = [
    { href: "#/", label: "Home" },
    { href: "#/journey", label: "My Journey" },
    { href: "#/classes", label: "Classes" },
    { href: "#/practice", label: "Practice" },
    { href: "#/projects", label: "Projects" },
    { href: "#/progress", label: "Progress" },
    { href: "#/resources", label: "Resources" },
    { href: "#/journal", label: "Journal" },
    { href: "#/about", label: "About" },
  ];
  const isActive = (href) => href === "#/" ? route === "#/" : route.startsWith(href);

  return `
  <header class="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
      <a href="#/" class="flex items-center gap-2.5 shrink-0 group">
        <span class="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-ink-950 shadow-glow-sm group-hover:shadow-glow transition-shadow">${icon("note", "w-4 h-4")}</span>
        <span class="hidden sm:flex flex-col leading-tight">
          <span class="font-display text-[15px] text-ink-50 tracking-wide">First Note <span class="text-gold-400">→</span> Professional</span>
        </span>
      </a>
      <nav class="hidden lg:flex items-center gap-1 text-sm">
        ${links.map(l => `
          <a href="${l.href}" class="px-3 py-2 rounded-full transition-colors ${isActive(l.href) ? "text-gold-300 bg-white/5" : "text-ink-300 hover:text-ink-50 hover:bg-white/5"}">${l.label}</a>
        `).join("")}
      </nav>
      <div class="flex items-center gap-2">
        <a href="#/classes/${Store.getState().currentClassId}" id="continue-learning-btn" class="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-glow-sm">
          Continue Learning ${icon("arrowRight", "w-3.5 h-3.5")}
        </a>
        <button data-action="toggleMobileMenu" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-ink-200">${icon("menu", "w-5 h-5")}</button>
      </div>
    </div>
    <nav id="mobile-menu" class="hidden lg:hidden border-t border-white/5 px-5 py-3 flex flex-col gap-1 bg-ink-950/95">
      ${links.map(l => `<a href="${l.href}" data-action="closeMobileMenu" class="px-3 py-2.5 rounded-lg text-sm ${isActive(l.href) ? "text-gold-300 bg-white/5" : "text-ink-300"}">${l.label}</a>`).join("")}
    </nav>
  </header>`;
};

/* ---------- Mobile bottom nav ---------- */
Components.MobileNav = (route) => {
  const items = [
    { href: "#/", label: "Home", icon: "home" },
    { href: "#/classes", label: "Classes", icon: "grid" },
    { href: "#/practice", label: "Practice", icon: "timer" },
    { href: "#/progress", label: "Progress", icon: "chart" },
    { href: "#/journey", label: "Journey", icon: "map" },
  ];
  return `
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-950/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
    <div class="grid grid-cols-5">
      ${items.map(it => {
        const active = it.href === "#/" ? route === "#/" : route.startsWith(it.href);
        return `<a href="${it.href}" class="flex flex-col items-center gap-1 py-2.5 ${active ? "text-gold-300" : "text-ink-400"}">
          ${icon(it.icon, "w-5 h-5")}
          <span class="text-[10.5px] tracking-wide">${it.label}</span>
        </a>`;
      }).join("")}
    </div>
  </nav>`;
};

/* ---------- Mobile "Continue Learning" floating button ---------- */
Components.ContinueFab = () => {
  const id = Store.getState().currentClassId;
  return `
  <a href="#/classes/${id}" class="lg:hidden fixed right-4 bottom-20 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium shadow-glow">
    ${icon("arrowRight", "w-4 h-4")} Continue
  </a>`;
};

/* ---------- Section heading ---------- */
Components.SectionHeading = (eyebrow, title, sub = "") => `
  <div class="mb-8">
    ${eyebrow ? `<p class="text-xs tracking-[0.2em] uppercase text-gold-400/80 mb-2">${eyebrow}</p>` : ""}
    <h2 class="font-display text-2xl sm:text-3xl text-ink-50">${title}</h2>
    ${sub ? `<p class="text-ink-400 mt-2 max-w-2xl text-sm sm:text-base">${sub}</p>` : ""}
  </div>`;

/* ---------- Quote block ---------- */
Components.QuoteBlock = (quote) => `
  <div class="relative rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5 flex items-start gap-4">
    <span class="text-gold-400/60 text-3xl font-display leading-none select-none">"</span>
    <p class="font-display text-ink-200 text-base sm:text-lg leading-relaxed italic">${quote}</p>
  </div>`;

/* ---------- Progress bar (skill) ---------- */
Components.SkillBar = (label, pct) => `
  <div>
    <div class="flex items-center justify-between mb-1.5 text-sm">
      <span class="text-ink-300">${label}</span>
      <span class="text-ink-500 tabular-nums">${pct}%</span>
    </div>
    <div class="h-2 rounded-full bg-white/5 overflow-hidden">
      <div class="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-[width] duration-700" style="width:${pct}%"></div>
    </div>
  </div>`;

/* ---------- Simple progress bar (generic) ---------- */
Components.ProgressBar = (pct, size = "h-2") => `
  <div class="${size} rounded-full bg-white/5 overflow-hidden">
    <div class="${size} rounded-full bg-gradient-to-r from-gold-500 to-gold-300" style="width:${Math.max(0, Math.min(100, pct))}%"></div>
  </div>`;

/* ---------- Stat card ---------- */
Components.StatCard = (iconName, value, label) => `
  <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-2">
    <div class="w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 flex items-center justify-center">${icon(iconName, "w-5 h-5")}</div>
    <div class="font-display text-2xl text-ink-50">${value}</div>
    <div class="text-xs text-ink-400 uppercase tracking-wide">${label}</div>
  </div>`;

/* ---------- Status badge ---------- */
function statusBadge(status) {
  const map = {
    locked: { text: "Locked", cls: "bg-white/5 text-ink-400" },
    available: { text: "Available", cls: "bg-teal-500/10 text-teal-300" },
    current: { text: "Current", cls: "bg-gold-500/15 text-gold-300" },
    completed: { text: "Completed", cls: "bg-emerald-500/10 text-emerald-300" },
  };
  const s = map[status] || map.locked;
  return `<span class="text-[11px] px-2.5 py-1 rounded-full ${s.cls} tracking-wide uppercase">${s.text}</span>`;
}

/* ---------- Class card ---------- */
Components.ClassCard = (cls, status) => {
  const locked = status === "locked";
  return `
  <div class="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-3 transition-all hover:border-gold-500/20 hover:bg-white/[0.04] ${locked ? "opacity-60" : ""}">
    <div class="flex items-center justify-between">
      <span class="text-xs text-ink-500 tracking-widest">CLASS ${String(cls.number).padStart(2, "0")}</span>
      ${statusBadge(status)}
    </div>
    <h3 class="font-display text-lg text-ink-50 leading-snug">${cls.title}</h3>
    <p class="text-sm text-ink-400 leading-relaxed">${cls.description}</p>
    <div class="flex items-center gap-3 text-xs text-ink-500 mt-1">
      <span>${cls.category}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
      <span>${cls.difficulty}</span><span class="w-1 h-1 rounded-full bg-ink-600"></span>
      <span>${cls.estMinutes} min</span>
    </div>
    <div class="flex gap-2 mt-2">
      ${locked
        ? `<button disabled class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-ink-500 text-sm cursor-not-allowed">${icon("lock", "w-4 h-4")} Locked</button>`
        : `<a href="#/classes/${cls.id}" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">${status === "completed" ? "Review" : "Open Class"} ${icon("arrowRight", "w-3.5 h-3.5")}</a>`
      }
      ${status === "completed" ? `<a href="#/share/${cls.id}" title="Share this class" class="inline-flex items-center justify-center w-11 rounded-xl border border-white/10 text-ink-300 hover:bg-white/5 transition-colors">${icon("share", "w-4 h-4")}</a>` : ""}
    </div>
  </div>`;
};

/* ---------- Journey timeline node ---------- */
Components.JourneyLevel = (level, status, classesCompleted, classesTotal) => {
  const locked = status === "locked";
  const pct = classesTotal ? Math.round((classesCompleted / classesTotal) * 100) : 0;
  return `
  <div class="relative flex gap-5">
    <div class="flex flex-col items-center">
      <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 font-display
        ${status === "completed" ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" :
          status === "current" ? "border-gold-400 bg-gold-400/10 text-gold-300 shadow-glow-sm" :
          "border-white/10 bg-white/5 text-ink-500"}">
        ${locked ? icon("lock", "w-4 h-4") : level.id}
      </div>
      <div class="w-px flex-1 bg-white/10 my-1"></div>
    </div>
    <div class="pb-10 flex-1">
      <p class="text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Level ${level.id}</p>
      <h3 class="font-display text-xl ${locked ? "text-ink-500" : "text-ink-50"}">${level.title}</h3>
      <p class="text-sm text-ink-500 mb-3">${level.role}</p>
      <div class="flex flex-wrap gap-2 mb-3">
        ${level.skills.map(s => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/5 text-ink-400">${s}</span>`).join("")}
      </div>
      ${!locked ? `
        <div class="max-w-xs">
          ${Components.ProgressBar(pct)}
          <p class="text-xs text-ink-500 mt-1.5">${classesCompleted}/${classesTotal} classes · ${pct}%</p>
        </div>` : `<p class="text-xs text-ink-600">Unlocks after completing Level ${level.id - 1}</p>`}
    </div>
  </div>`;
};

/* ---------- Project card ---------- */
Components.ProjectCard = (project) => {
  const done = project.checklist.filter(c => c.done).length;
  const pct = Math.round((done / project.checklist.length) * 100);
  const complete = done === project.checklist.length;
  return `
  <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
    <div class="flex items-start justify-between gap-3 mb-1">
      <div>
        <p class="text-xs tracking-widest text-ink-500 uppercase mb-1">Project</p>
        <h3 class="font-display text-xl text-ink-50">${project.title}</h3>
      </div>
      <span class="text-[11px] px-2.5 py-1 rounded-full ${complete ? "bg-emerald-500/10 text-emerald-300" : "bg-gold-500/15 text-gold-300"} tracking-wide uppercase shrink-0">${complete ? "Complete" : "In Progress"}</span>
    </div>
    <p class="text-xs text-ink-500 mb-4">Started ${project.startedAt ? new Date(project.startedAt).toLocaleDateString() : "—"}</p>
    <div class="mb-4">${Components.ProgressBar(pct)}<p class="text-xs text-ink-500 mt-1.5">${done}/${project.checklist.length} steps · ${pct}%</p></div>
    <div class="grid sm:grid-cols-2 gap-2">
      ${project.checklist.map(item => `
        <label class="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-sm ${item.done ? "text-ink-300" : "text-ink-400"}">
          <input type="checkbox" data-action="toggleProjectItem" data-project="${project.id}" data-key="${item.key}" ${item.done ? "checked" : ""} class="w-4 h-4 rounded border-white/20 bg-transparent accent-amber-400">
          <span class="${item.done ? "line-through text-ink-500" : ""}">${item.label}</span>
        </label>
      `).join("")}
    </div>
  </div>`;
};

/* ---------- Achievement card ---------- */
Components.AchievementCard = (ach, unlocked) => `
  <div class="rounded-2xl border border-white/5 p-5 flex items-center gap-4 ${unlocked ? "bg-gold-500/[0.04]" : "bg-white/[0.02] opacity-50"}">
    <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${unlocked ? "bg-gold-500/15" : "bg-white/5"}">${ach.icon}</div>
    <div>
      <h4 class="text-sm font-medium text-ink-100">${ach.title}</h4>
      <p class="text-xs text-ink-500">${ach.desc}</p>
    </div>
  </div>`;

/* ---------- Upload area ---------- */
Components.UploadArea = (inputId, accept, label, existingUploads = []) => `
  <div>
    <label class="block border border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:border-gold-400/40 hover:bg-white/[0.02] transition-colors">
      <input type="file" id="${inputId}" accept="${accept}" class="hidden">
      <div class="flex flex-col items-center gap-2 text-ink-400">
        ${icon("upload", "w-6 h-6")}
        <span class="text-sm">${label}</span>
        <span class="text-xs text-ink-600">Audio, video or notes · kept for this session</span>
      </div>
    </label>
    <div id="${inputId}-list" class="mt-3 flex flex-col gap-2">
      ${existingUploads.map(u => Components.UploadItem(u)).join("")}
    </div>
  </div>`;

Components.UploadItem = (u) => `
  <div class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5">
    <div class="flex items-center gap-3 min-w-0">
      ${icon(u.type && u.type.startsWith("video") ? "play" : "mic", "w-4 h-4 text-gold-300")}
      <span class="text-sm text-ink-200 truncate">${Utils.escapeHtml(u.name)}</span>
    </div>
    <span class="text-xs text-ink-500 shrink-0">${new Date(u.date).toLocaleDateString()}</span>
  </div>`;

/* ---------- Audio player (works with a real object/data URL) ---------- */
Components.AudioPlayer = (id, src, label) => `
  <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-center gap-3">
    <button data-action="toggleAudio" data-target="${id}" class="w-9 h-9 rounded-full bg-gold-500 text-ink-950 flex items-center justify-center shrink-0" ${src ? "" : "disabled"}>
      <span data-audio-icon="${id}" class="w-4 h-4 inline-flex shrink-0">${Icons.play}</span>
    </button>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-ink-400 truncate mb-1">${Utils.escapeHtml(label)}</p>
      <div class="flex items-end gap-[2px] h-6">
        ${Array.from({ length: 36 }).map((_, i) => `<span class="w-[2px] rounded-full ${src ? "bg-gold-400/50" : "bg-white/10"}" style="height:${6 + Math.round(Math.abs(Math.sin(i * 0.7)) * 18)}px"></span>`).join("")}
      </div>
    </div>
    ${src ? `<audio id="${id}" src="${src}" class="hidden"></audio>` : ""}
  </div>`;

/* ---------- Empty state ---------- */
Components.EmptyState = (iconName, title, sub) => `
  <div class="rounded-2xl border border-dashed border-white/10 py-14 px-6 text-center">
    <div class="w-12 h-12 rounded-full bg-white/5 text-ink-400 flex items-center justify-center mx-auto mb-4">${icon(iconName, "w-5 h-5")}</div>
    <h3 class="font-display text-lg text-ink-100 mb-1">${title}</h3>
    <p class="text-sm text-ink-500 max-w-sm mx-auto">${sub}</p>
  </div>`;

/* ---------- Journal entry card ---------- */
Components.JournalEntry = (entry) => `
  <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-6 relative">
    <button data-action="deleteJournalEntry" data-id="${entry.id}" class="absolute top-4 right-4 text-ink-600 hover:text-ink-300" title="Delete entry">${icon("close", "w-4 h-4")}</button>
    <p class="text-xs text-ink-500 mb-1">${new Date(entry.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
    <h4 class="font-display text-lg text-ink-50 mb-3">${Utils.escapeHtml(entry.classTitle || "General entry")}</h4>
    <div class="grid sm:grid-cols-2 gap-4 text-sm">
      ${entry.learned ? `<div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What I learned</p><p class="text-ink-300">${Utils.escapeHtml(entry.learned)}</p></div>` : ""}
      ${entry.struggled ? `<div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What I struggled with</p><p class="text-ink-300">${Utils.escapeHtml(entry.struggled)}</p></div>` : ""}
      ${entry.improved ? `<div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What improved</p><p class="text-ink-300">${Utils.escapeHtml(entry.improved)}</p></div>` : ""}
      ${entry.toPractice ? `<div><p class="text-ink-500 text-xs uppercase tracking-wide mb-1">What I need to practice</p><p class="text-ink-300">${Utils.escapeHtml(entry.toPractice)}</p></div>` : ""}
    </div>
    ${entry.thoughts ? `<p class="text-sm text-ink-400 italic mt-4 border-t border-white/5 pt-4">"${Utils.escapeHtml(entry.thoughts)}"</p>` : ""}
    ${entry.classId ? `<a href="#/share/${entry.classId}" class="inline-flex items-center gap-1.5 text-xs text-gold-300 mt-4">${icon("share", "w-3.5 h-3.5")} Share this class</a>` : ""}
  </div>`;

/* ---------- Milestone card (Before/After) ---------- */
Components.MilestoneCard = (milestone, upload) => `
  <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-3 min-w-[260px]">
    <div class="flex items-center justify-between">
      <span class="text-xs tracking-widest text-gold-400/80 uppercase">Day ${milestone.day}</span>
      ${upload ? statusBadge("completed") : statusBadge("available")}
    </div>
    <h4 class="font-display text-base text-ink-50">${milestone.label}</h4>
    ${Components.AudioPlayer(`milestone-${milestone.id}`, upload ? upload.dataUrl : null, upload ? upload.fileName : "Not recorded yet")}
    <label class="text-xs text-gold-300 underline cursor-pointer">
      ${upload ? "Replace recording" : "Upload recording"}
      <input type="file" accept="audio/*,video/*" class="hidden" data-change="handleMilestoneUpload" data-milestone="${milestone.id}">
    </label>
  </div>`;
