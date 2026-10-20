/* ============================================================
   PROFILE PAGE (protected) — view & edit the logged-in user's profile
   ============================================================ */

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Complete beginner" },
  { value: "some_experience", label: "Some experience" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const ProfilePage = {
  render() {
    return `
    <section class="max-w-2xl mx-auto px-5 lg:px-8 py-14 sm:py-20">
      ${Components.SectionHeading("Account", "My Profile", "")}
      <div id="profile-root">${Components.EmptyState("user", "Loading your profile…", "One moment.")}</div>
    </section>`;
  },

  async mount(container) {
    const user = Auth.getUser();
    const root = container.querySelector("#profile-root");
    const { data: profile, error } = await Auth.getProfile(user.id);
    if (error || !profile) {
      root.innerHTML = Components.FormNotice("error", "Couldn't load your profile. Try refreshing the page.");
      return;
    }
    root.innerHTML = renderForm(user, profile);
    wireForm(container, user, profile);
  },
};

function renderForm(user, p) {
  const chip = (field, label) => `
    <label class="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span class="text-sm text-ink-200">${label}</span>
      <input type="checkbox" name="${field}" ${p[field] ? "checked" : ""} class="w-10 h-6 rounded-full appearance-none bg-white/10 checked:bg-gold-500 relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-[18px] before:h-[18px] before:rounded-full before:bg-white before:top-[3px] before:left-[3px] checked:before:translate-x-4 before:transition-transform">
    </label>`;

  return `
    <div id="profile-notice"></div>
    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 mb-6">
      <div class="flex items-center gap-4 mb-6">
        <label class="relative cursor-pointer group shrink-0">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
            ${p.avatar_url ? `<img id="avatar-preview" src="${p.avatar_url}" class="w-full h-full object-cover" alt="">` : `<span id="avatar-preview-icon">${icon("user", "w-6 h-6 text-ink-400")}</span>`}
          </div>
          <span class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white">Change</span>
          <input type="file" id="avatar-input" accept="image/*" class="hidden">
        </label>
        <div>
          <p class="text-sm text-ink-100">${Utils.escapeHtml(user.email)}</p>
          <p class="text-xs text-ink-500">Member since ${new Date(p.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <form id="profile-form" class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Name</label>
            <input type="text" name="name" class="field" value="${Utils.escapeHtml(p.name || "")}">
          </div>
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Username</label>
            <input type="text" name="username" pattern="[a-zA-Z0-9_]{3,20}" class="field" value="${Utils.escapeHtml(p.username || "")}">
          </div>
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Country</label>
            <input type="text" name="country" class="field" value="${Utils.escapeHtml(p.country || "")}">
          </div>
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Preferred language</label>
            <input type="text" name="preferred_language" class="field" value="${Utils.escapeHtml(p.preferred_language || "")}">
          </div>
        </div>
        <div>
          <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Learning goal</label>
          <input type="text" name="learning_goal" class="field" placeholder="e.g. Release my first original song" value="${Utils.escapeHtml(p.learning_goal || "")}">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Experience level</label>
            <select name="experience_level" class="field">
              <option value="">—</option>
              ${EXPERIENCE_LEVELS.map(l => `<option value="${l.value}" ${p.experience_level === l.value ? "selected" : ""}>${l.label}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block text-xs text-ink-500 uppercase tracking-wide mb-1.5">Favorite styles</label>
            <input type="text" name="favorite_styles" class="field" placeholder="pop, jazz, R&B" value="${Utils.escapeHtml((p.favorite_styles || []).join(", "))}">
          </div>
        </div>
        <button type="submit" class="self-start px-5 py-2.5 rounded-full bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors">Save Changes</button>
      </form>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
      <h3 class="font-display text-lg text-ink-50 mb-1">Privacy</h3>
      <p class="text-xs text-ink-500 mb-2">Off by default. Nothing here is visible to anyone else until you turn it on.</p>
      <form id="privacy-form">
        ${chip("is_public", "Public profile")}
        ${chip("show_progress", "Show my progress")}
        ${chip("show_completed_classes", "Show completed classes")}
        ${chip("show_recordings", "Show my recordings")}
      </form>
    </div>
  `;
}

function wireForm(container, user, profile) {
  const notice = container.querySelector("#profile-notice");

  container.querySelector("#profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const raw = Object.fromEntries(new FormData(form).entries());
    const patch = {
      name: raw.name || null,
      username: raw.username || null,
      country: raw.country || null,
      preferred_language: raw.preferred_language || null,
      learning_goal: raw.learning_goal || null,
      experience_level: raw.experience_level || null,
      favorite_styles: raw.favorite_styles ? raw.favorite_styles.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Saving…";
    const { error } = await Auth.updateProfile(user.id, patch);
    btn.disabled = false;
    btn.textContent = "Save Changes";
    const friendlyMessage = error && /username/.test(error.message) && /duplicate|unique/i.test(error.message)
      ? "That username is already taken — try another."
      : error && error.message;
    notice.innerHTML = error
      ? Components.FormNotice("error", Utils.escapeHtml(friendlyMessage))
      : Components.FormNotice("success", "Profile updated.");
    if (!error) await Auth.updateUserMetadata({ name: patch.name });
  });

  container.querySelectorAll('#privacy-form input[type=checkbox]').forEach(cb => {
    cb.addEventListener("change", async () => {
      const { error } = await Auth.updateProfile(user.id, { [cb.name]: cb.checked });
      if (error) {
        cb.checked = !cb.checked;
        notice.innerHTML = Components.FormNotice("error", Utils.escapeHtml(error.message));
      }
    });
  });

  const avatarInput = container.querySelector("#avatar-input");
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;
    notice.innerHTML = Components.FormNotice("info", "Uploading avatar…");
    const { data, error } = await Auth.uploadAvatar(user.id, file);
    if (error) {
      notice.innerHTML = Components.FormNotice("error", Utils.escapeHtml(error.message));
      return;
    }
    await Auth.updateProfile(user.id, { avatar_url: data.publicUrl });
    await Auth.updateUserMetadata({ avatar_url: data.publicUrl });
    notice.innerHTML = Components.FormNotice("success", "Avatar updated.");
    Router.refreshChrome();
    const img = container.querySelector("#avatar-preview");
    if (img) img.src = data.publicUrl;
  });
}
