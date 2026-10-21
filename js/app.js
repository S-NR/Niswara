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
    // Save anything still waiting to upload while we're still signed in
    await Promise.all([CloudSync.flush(), ClassActivity.flush()]).catch(() => {});
    await Auth.signOut();
    location.hash = "#/";
  }
});

// Keep the navbar/avatar in sync with auth state, and bounce the user
// between the login page and their dashboard as sessions start/end.
Auth.onChange((session, event) => {
  const hash = location.hash || "#/";

  // Recovery link landed somewhere other than the reset page (e.g. the
  // redirect dropped the hash): send them where they can set a password.
  if (event === "PASSWORD_RECOVERY" && !hash.startsWith("#/reset-password")) {
    location.hash = "#/reset-password";
    return;
  }

  // Each account has its own local progress; if the account changed, the
  // current page is showing the wrong person's data, so re-render it.
  // rerender() also re-applies the requiresAuth guard.
  const userChanged = Store.switchUser(session ? session.user.id : null);
  // Bring in this account's progress from other devices (re-renders via "remote-changed")
  if (userChanged) CloudSync.userChanged(session ? session.user.id : null);
  if (userChanged || (!session && Router.currentRequiresAuth())) {
    Router.rerender();
  } else {
    Router.refreshChrome();
  }

  if (session && /^#\/(login|signup)/.test(hash)) {
    location.hash = Utils.safeNextRoute();
  }
});

// Progress arrived from another device: show it. Skipped while the learner is
// typing so a background sync never wipes a half-written answer.
// Also skipped while recording — a redraw would cancel the take in progress.
let pendingRemoteRender = false;
let pendingTimer = null;
function busyLearner() {
  const el = document.activeElement;
  const typing = el && el.closest && el.closest("#app") && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  return typing || VoiceRecorder.isRecording();
}
function renderWhenFree() {
  clearTimeout(pendingTimer);
  if (busyLearner()) { pendingTimer = setTimeout(renderWhenFree, 1500); return; }
  pendingRemoteRender = false;
  Router.rerender();
}
CloudSync.on((event) => {
  if (event !== "remote-changed") return;
  if (busyLearner()) { pendingRemoteRender = true; pendingTimer = setTimeout(renderWhenFree, 1500); return; }
  Router.rerender();
});
document.addEventListener("focusout", () => {
  if (pendingRemoteRender) setTimeout(renderWhenFree, 0);
});

// Store couldn't save (usually storage quota) — tell the learner instead of failing silently
window.addEventListener("store:persist-failed", () => {
  const banner = document.getElementById("save-error");
  if (!banner) return;
  banner.innerHTML = Components.FormNotice("error",
    "Your latest progress couldn't be saved on this device — browser storage may be full. Free some space (or remove old recordings), then try again. <span class=\"underline\">Dismiss</span>");
  banner.hidden = false;
  banner.onclick = () => (banner.hidden = true);
});

(async () => {
  // Older versions kept recordings inside localStorage; move them out
  // before anything else writes, so the blob is small again.
  await Store.migrateLegacyUploads().catch((e) => console.warn("Media migration failed.", e));
  await Auth.init();
  Router.start();
})();
