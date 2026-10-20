/* ============================================================
   APP ENTRY
   ============================================================ */

Router.add("#/", HomePage);
Router.add("#/journey", JourneyPage);
Router.add("#/classes", ClassesPage);
Router.add("#/classes/:id", ClassDetailPage);
Router.add("#/practice", PracticePage);
Router.add("#/projects", ProjectsPage);
Router.add("#/progress", ProgressPage);
Router.add("#/resources", ResourcesPage);
Router.add("#/journal", JournalPage);
Router.add("#/about", AboutPage);
Router.add("#/share/:id", SharePage);

document.getElementById("footer").innerHTML = `
  <footer class="border-t border-white/5 mt-10">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
      <p>From First Note <span class="text-gold-400">→</span> Professional — a personal music journey.</p>
      <div class="flex items-center gap-5">
        <a href="#/about" class="hover:text-ink-200">About</a>
        <a href="#/journal" class="hover:text-ink-200">Journal</a>
        <a href="#/classes" class="hover:text-ink-200">Classes</a>
      </div>
    </div>
  </footer>`;

// Global: mobile nav menu toggle (delegated once, lives outside page re-renders)
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest('[data-action="toggleMobileMenu"]');
  const closeLink = e.target.closest('[data-action="closeMobileMenu"]');
  const menu = document.getElementById("mobile-menu");
  if (!menu) return;
  if (toggleBtn) menu.classList.toggle("hidden");
  if (closeLink) menu.classList.add("hidden");
});

Router.start();
