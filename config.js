/* ============================================================
   NISWARA — BACKEND CONFIG (ACTIVE)

   This file IS committed and IS deployed — see config.example.js
   for why that's safe (these are public, non-secret values).

   Currently set to placeholders, so the site runs in "backend not
   configured" mode: all curriculum browsing and local practice
   tracking work exactly as before, and the new auth/profile pages
   show a friendly setup notice instead of erroring.

   To go live: replace the two values below with your real
   Supabase Project URL and anon public key (Project Settings →
   API in the Supabase dashboard), then commit this file. See
   SETUP.md for the full walkthrough, including the SQL migration
   and the Auth redirect URLs you need to configure.
   ============================================================ */

window.NISWARA_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_PUBLIC_KEY",
};
