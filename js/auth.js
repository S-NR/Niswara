/* ============================================================
   AUTH
   Thin wrapper around Supabase Auth + the `profiles` table.
   Every other file talks to the backend through this module only
   — nothing else touches `window.supabase` directly. That keeps
   the door open to swapping providers later without touching UI
   code, and is also where a future AI-coach API layer (§33) would
   plug in alongside signIn/signOut.

   Loads AFTER the Supabase UMD script + config.js, BEFORE any page
   script that calls Auth.*. See index.html for load order.
   ============================================================ */

const Auth = (() => {
  const cfg = window.NISWARA_CONFIG || {};
  const isConfigured =
    !!cfg.SUPABASE_URL &&
    !!cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.startsWith("YOUR_") &&
    !cfg.SUPABASE_ANON_KEY.startsWith("YOUR_");

  const client = isConfigured
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

  const NOT_CONFIGURED_ERROR = {
    message: "Niswara's backend isn't configured yet. See SETUP.md to connect a Supabase project.",
  };

  let currentSession = null;
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => {
      try { fn(currentSession); } catch (e) { console.error(e); }
    });
  }

  /** Subscribe to session changes. Returns an unsubscribe function. Fires immediately with the current session. */
  function onChange(fn) {
    listeners.add(fn);
    fn(currentSession);
    return () => listeners.delete(fn);
  }

  async function init() {
    if (!isConfigured) return null;
    const { data } = await client.auth.getSession();
    currentSession = data.session;
    notify();
    client.auth.onAuthStateChange((_event, session) => {
      currentSession = session;
      notify();
    });
    return currentSession;
  }

  function getSession() { return currentSession; }
  function getUser() { return currentSession ? currentSession.user : null; }
  function isLoggedIn() { return !!currentSession; }

  async function signUp({ email, password, name, username }) {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    return client.auth.signUp({
      email,
      password,
      options: { data: { name, username } },
    });
  }

  async function signIn({ email, password }) {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    return client.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    return client.auth.signOut();
  }

  /** Sends a password-recovery email. redirectTo must be an Auth → URL Configuration → Redirect URL in the Supabase dashboard. */
  async function sendPasswordReset(email) {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    const redirectTo = `${location.origin}${location.pathname}#/reset-password`;
    return client.auth.resetPasswordForEmail(email, { redirectTo });
  }

  /** Call from the reset-password page once the recovery link has landed the user in a session. */
  async function updatePassword(newPassword) {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    return client.auth.updateUser({ password: newPassword });
  }

  /** Updates the lightweight auth user_metadata cache (name/avatar_url) so chrome like the navbar avatar can read it without an extra profile fetch. The `profiles` row stays the source of truth. */
  async function updateUserMetadata(patch) {
    if (!isConfigured) return { error: NOT_CONFIGURED_ERROR };
    return client.auth.updateUser({ data: patch });
  }

  async function getProfile(userId) {
    if (!isConfigured) return { data: null, error: NOT_CONFIGURED_ERROR };
    return client.from("profiles").select("*").eq("id", userId).single();
  }

  async function updateProfile(userId, patch) {
    if (!isConfigured) return { data: null, error: NOT_CONFIGURED_ERROR };
    return client.from("profiles").update(patch).eq("id", userId).select().single();
  }

  async function getPublicProfile(username) {
    if (!isConfigured) return { data: null, error: NOT_CONFIGURED_ERROR };
    return client.from("public_profiles").select("*").eq("username", username).single();
  }

  /** Uploads a new avatar for the given user and returns its public URL (does not update the profile row itself). */
  async function uploadAvatar(userId, file) {
    if (!isConfigured) return { data: null, error: NOT_CONFIGURED_ERROR };
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) return { data: null, error: uploadError };
    const { data } = client.storage.from("avatars").getPublicUrl(path);
    return { data: { publicUrl: `${data.publicUrl}?v=${Date.now()}` }, error: null };
  }

  return {
    isConfigured, init, onChange,
    getSession, getUser, isLoggedIn,
    signUp, signIn, signOut, sendPasswordReset, updatePassword,
    getProfile, updateProfile, getPublicProfile, uploadAvatar, updateUserMetadata,
  };
})();
