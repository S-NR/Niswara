/* ============================================================
   LOGIN PAGE
   ============================================================ */

const LoginPage = {
  render() {
    const notConfigured = !Auth.isConfigured
      ? Components.FormNotice("info", "Niswara's backend isn't connected yet — accounts aren't available in this preview. See SETUP.md to connect a Supabase project.")
      : "";

    return Components.AuthCard("Welcome back", "Log in to Niswara", "Continue your journey from first note to professional.", `
      ${notConfigured}
      <div id="login-notice"></div>
      <form id="login-form" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Email</label>
          <input type="email" name="email" required class="field" placeholder="you@example.com" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Password</label>
          <input type="password" name="password" required class="field" placeholder="••••••••" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <button type="submit" ${Auth.isConfigured ? "" : "disabled"} class="w-full px-5 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Log In</button>
      </form>
      <div class="flex items-center justify-between mt-5 text-sm">
        <a href="#/forgot-password" class="text-gold-300">Forgot password?</a>
        <a href="#/signup" class="text-ink-400">Create account</a>
      </div>
    `);
  },

  mount(container) {
    const form = container.querySelector("#login-form");
    const notice = container.querySelector("#login-notice");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Auth.isConfigured) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Logging in…";
      const { error } = await Auth.signIn(data);
      if (error) {
        notice.innerHTML = Components.FormNotice("error", Utils.escapeHtml(error.message));
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
        return;
      }
      // Success: the centralized Auth.onChange handler in app.js redirects
      // once the session updates, honoring the ?next= param if present.
    });
  },
};
