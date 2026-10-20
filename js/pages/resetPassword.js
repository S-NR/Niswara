/* ============================================================
   RESET PASSWORD PAGE
   Landed on via the link from a password-recovery email. Supabase
   exchanges the "?code=" in the URL for a session automatically
   during Auth.init() (see auth.js) — by the time this page mounts,
   Auth.isLoggedIn() should already reflect that recovery session.
   ============================================================ */

const ResetPasswordPage = {
  render() {
    const notConfigured = !Auth.isConfigured
      ? Components.FormNotice("info", "Niswara's backend isn't connected yet. See SETUP.md to connect a Supabase project.")
      : "";
    const noSession = Auth.isConfigured && !Auth.isLoggedIn()
      ? Components.FormNotice("error", "This reset link looks invalid or expired. Request a new one from the Forgot Password page.")
      : "";
    const canSubmit = Auth.isConfigured && Auth.isLoggedIn();

    return Components.AuthCard("Password reset", "Choose a new password", "", `
      ${notConfigured}${noSession}
      <div id="reset-notice"></div>
      <form id="reset-form" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">New password</label>
          <input type="password" name="password" required minlength="8" class="field" placeholder="At least 8 characters" ${canSubmit ? "" : "disabled"}>
        </div>
        <button type="submit" ${canSubmit ? "" : "disabled"} class="w-full px-5 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update Password</button>
      </form>
    `);
  },

  mount(container) {
    const form = container.querySelector("#reset-form");
    const notice = container.querySelector("#reset-notice");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Auth.isLoggedIn()) return;
      const { password } = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating…";
      const { error } = await Auth.updatePassword(password);
      if (error) {
        notice.innerHTML = Components.FormNotice("error", Utils.escapeHtml(error.message));
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Password";
        return;
      }
      notice.innerHTML = Components.FormNotice("success", "Password updated. Taking you to your dashboard…");
      setTimeout(() => (location.hash = "#/dashboard"), 1200);
    });
  },
};
