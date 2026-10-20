/* ============================================================
   FORGOT PASSWORD PAGE
   ============================================================ */

const ForgotPasswordPage = {
  render() {
    const notConfigured = !Auth.isConfigured
      ? Components.FormNotice("info", "Niswara's backend isn't connected yet — accounts aren't available in this preview. See SETUP.md to connect a Supabase project.")
      : "";

    return Components.AuthCard("Password reset", "Forgot your password?", "We'll email you a link to set a new one.", `
      ${notConfigured}
      <div id="forgot-notice"></div>
      <form id="forgot-form" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Email</label>
          <input type="email" name="email" required class="field" placeholder="you@example.com" ${Auth.isConfigured ? "" : "disabled"}>
        </div>
        <button type="submit" ${Auth.isConfigured ? "" : "disabled"} class="w-full px-5 py-3 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Send Reset Link</button>
      </form>
      <p class="text-center mt-5 text-sm text-ink-400"><a href="#/login" class="text-gold-300">Back to log in</a></p>
    `);
  },

  mount(container) {
    const form = container.querySelector("#forgot-form");
    const notice = container.querySelector("#forgot-notice");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Auth.isConfigured) return;
      const { email } = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      await Auth.sendPasswordReset(email);
      // Deliberately shown regardless of whether the account exists,
      // so this form can't be used to probe which emails are registered.
      form.classList.add("hidden");
      notice.innerHTML = Components.FormNotice("success", "If an account exists for that email, a reset link is on its way.");
    });
  },
};
