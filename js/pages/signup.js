/* ============================================================
   SIGN UP PAGE
   ============================================================ */

const SignupPage = {
  render() {
    const notConfigured = !Auth.isConfigured
      ? Components.FormNotice("info", "Niswara's backend isn't connected yet — accounts aren't available in this preview. See SETUP.md to connect a Supabase project.")
      : "";

    return Components.AuthCard("Begin your journey", "Create your account", "From first note to professional — one class at a time.", `
      ${notConfigured}
      <div id="signup-notice"></div>
      <form id="signup-form" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Name</label>
          <input type="text" name="name" autocomplete="name" required class="field" placeholder="Your name" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Username</label>
          <input type="text" name="username" autocomplete="username" required pattern="[a-zA-Z0-9_]{3,20}" title="3-20 letters, numbers or underscores" class="field" placeholder="yourname" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Email</label>
          <input type="email" name="email" autocomplete="email" required class="field" placeholder="you@example.com" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Password</label>
          <input type="password" name="password" autocomplete="new-password" required minlength="8" class="field" placeholder="At least 8 characters" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <button type="submit" ${Auth.isConfigured ? "" : "disabled"} class="w-full px-5 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create Account</button>
      </form>
      <p class="text-center mt-5 text-sm text-ink-400">Already have an account? <a href="#/login" class="text-gold-300">Log in</a></p>
    `);
  },

  mount(container) {
    const form = container.querySelector("#signup-form");
    const notice = container.querySelector("#signup-notice");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Auth.isConfigured) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account…";
      const { data: result, error } = await Auth.signUp(data);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
      if (error) {
        notice.innerHTML = Components.FormNotice("error", Utils.escapeHtml(error.message));
        return;
      }
      if (result && result.session) {
        // Email confirmation is off for this project: a session comes
        // back immediately. The centralized Auth.onChange handler in
        // app.js will redirect once it picks up the new session.
        return;
      }
      form.classList.add("hidden");
      notice.innerHTML = Components.FormNotice("success", "Check your inbox — we've sent a confirmation link to finish setting up your account.");
    });
  },
};
