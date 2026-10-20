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
Router.add("#/login", LoginPage);
Router.add("#/signup", SignupPage);
Router.add("#/forgot-password", ForgotPasswordPage);
Router.add("#/reset-password", ResetPasswordPage);
Router.add("#/profile", ProfilePage, { requiresAuth: true });
Router.add("#/dashboard", DashboardPage, { requiresAuth: true });

document.getElementById("footer").innerHTML = `
  <footer class="border-t border-white/5 mt-10">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
      <p>Niswara — From First Note <span class="text-gold-400">→</span> Professional.</p>
      <div class="flex items-center gap-5">
        <a href="#/about" class="hover:text-ink-200">About</a>
        <a href="#/journal" class="hover:text-ink-200">Journal</a>
        <a href="#/classes" class="hover:text-ink-200">Classes</a>
      </div>
    </div>
  </footer>`;

// Global: mobile nav menu + logout (delegated once, lives outside page re-renders)
document.addEventListener("click", async (e) => {
  const toggleBtn = e.target.closest('[data-action="toggleMobileMenu"]');
  const closeLink = e.target.closest('[data-action="closeMobileMenu"]');
  const logoutBtn = e.target.closest('[data-action="navLogout"]');
  const menu = document.getElementById("mobile-menu");

  if (toggleBtn && menu) menu.classList.toggle("hidden");
  if (closeLink && menu) menu.classList.add("hidden");
  if (logoutBtn) {
    if (menu) menu.classList.add("hidden");
    await Auth.signOut();
    location.hash = "#/";
  }
});

// Keep the navbar/avatar in sync with auth state, and bounce the user
// between the login page and their dashboard as sessions start/end.
Auth.onChange((session) => {
  Router.refreshChrome();
  const hash = location.hash || "#/";
  const onAuthPage = /^#\/(login|signup)/.test(hash);
  if (session && onAuthPage) {
    location.hash = Utils.getHashQuery("next") || "#/dashboard";
  }
});

(async () => {
  await Auth.init();
  Router.start();
})();
