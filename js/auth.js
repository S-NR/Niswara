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

  function notify(event) {
    listeners.forEach((fn) => {
      try { fn(currentSession, event); } catch (e) { console.error(e); }
    });
  }

  /** Subscribe to session changes: fn(session, event). Returns an unsubscribe function. Fires immediately with the current session. */
  function onChange(fn) {
    listeners.add(fn);
    fn(currentSession, "INITIAL");
    return () => listeners.delete(fn);
  }

  async function init() {
    if (!isConfigured) return null;
    const { data } = await client.auth.getSession();
    currentSession = data.session;
    notify("INITIAL_SESSION");
    // event is e.g. SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
    client.auth.onAuthStateChange((event, session) => {
      currentSession = session;
      notify(event);
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

  // Mirrors the avatars bucket limits set in supabase/migrations/0002_security_fixes.sql
  const AVATAR_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
  const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

  /** Uploads a new avatar for the given user and returns its public URL (does not update the profile row itself). */
  async function uploadAvatar(userId, file) {
    if (!isConfigured) return { data: null, error: NOT_CONFIGURED_ERROR };
    const ext = AVATAR_TYPES[file.type];
    if (!ext) return { data: null, error: { message: "Avatar must be a PNG, JPEG, WebP or GIF image." } };
    if (file.size > AVATAR_MAX_BYTES) return { data: null, error: { message: "Avatar must be 2 MB or smaller." } };
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) return { data: null, error: uploadError };
    const { data } = client.storage.from("avatars").getPublicUrl(path);
    return { data: { publicUrl: `${data.publicUrl}?v=${Date.now()}` }, error: null };
  }

  /* ---- Per-user class progress & private notes (supabase/migrations/0003_class_progress.sql) ----
     RLS limits every row to its owner; user_id is always the session's own id. */

  function notLoggedIn() {
    return { data: null, error: isConfigured ? { message: "Not logged in." } : NOT_CONFIGURED_ERROR };
  }

  async function fetchClassProgress(classId) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("class_progress")
      .select("checkpoints, exercise_stats, answers, completed_at, updated_at")
      .eq("user_id", currentSession.user.id).eq("class_id", classId)
      .maybeSingle();
  }

  async function saveClassProgress(classId, { checkpoints, exerciseStats, answers, completedAt }) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("class_progress").upsert({
      user_id: currentSession.user.id,
      class_id: classId,
      checkpoints,
      exercise_stats: exerciseStats,
      answers,
      completed_at: completedAt,
    }, { onConflict: "user_id,class_id" });
  }

  async function fetchClassNote(classId) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("class_notes")
      .select("body, updated_at")
      .eq("user_id", currentSession.user.id).eq("class_id", classId)
      .maybeSingle();
  }

  async function saveClassNote(classId, body) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("class_notes")
      .upsert({ user_id: currentSession.user.id, class_id: classId, body }, { onConflict: "user_id,class_id" })
      .select("updated_at")
      .single();
  }

  /* ---- Whole-account learner state (supabase/migrations/0004_learner_state.sql) ----
     One row per user; `version` gives optimistic concurrency so a stale device
     can't overwrite newer progress (CloudSync merges and retries instead). */

  async function fetchLearnerState() {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("learner_state")
      .select("state, version, updated_at")
      .eq("user_id", currentSession.user.id)
      .maybeSingle();
  }

  /** First save for this account. Fails with code 23505 if another device created the row first. */
  async function insertLearnerState(state) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("learner_state")
      .insert({ user_id: currentSession.user.id, state, version: 1 })
      .select("version")
      .single();
  }

  /** Saves only if the row is still at expectedVersion. data is [] when someone else saved first. */
  async function updateLearnerState(state, expectedVersion) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.from("learner_state")
      .update({ state, version: expectedVersion + 1 })
      .eq("user_id", currentSession.user.id)
      .eq("version", expectedVersion)
      .select("version");
  }

  /* ---- Recordings: private bucket, path "<user_id>/<mediaId>" (owner-only policies) ---- */

  function recordingPath(mediaId) { return `${currentSession.user.id}/${mediaId}`; }

  async function uploadRecording(mediaId, blob) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    const contentType = (blob.type || "audio/webm").split(";")[0]; // bucket allows audio/* and video/*
    return client.storage.from("recordings").upload(recordingPath(mediaId), blob, { upsert: true, contentType });
  }

  async function downloadRecording(mediaId) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.storage.from("recordings").download(recordingPath(mediaId));
  }

  async function deleteRecording(mediaId) {
    if (!isConfigured || !currentSession) return notLoggedIn();
    return client.storage.from("recordings").remove([recordingPath(mediaId)]);
  }

  return {
    isConfigured, init, onChange,
    getSession, getUser, isLoggedIn,
    signUp, signIn, signOut, sendPasswordReset, updatePassword,
    getProfile, updateProfile, getPublicProfile, uploadAvatar, updateUserMetadata,
    fetchClassProgress, saveClassProgress, fetchClassNote, saveClassNote,
    fetchLearnerState, insertLearnerState, updateLearnerState,
    uploadRecording, downloadRecording, deleteRecording,
  };
})();
