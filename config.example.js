/* ============================================================
   NISWARA — BACKEND CONFIG (TEMPLATE)

   Copy this file to "config.js" (same folder) and fill in the
   two values below from your Supabase project dashboard:

     Project Settings → API → Project URL
     Project Settings → API → Project API keys → "anon" "public"

   These two values are SAFE to ship in a static, public frontend —
   that is how Supabase is designed to work. Supabase's security
   model lives entirely in Postgres Row Level Security policies
   (see /supabase/migrations), not in keeping the anon key secret.

   NEVER put the "service_role" key in this file, in config.js,
   or anywhere under version control. It bypasses Row Level
   Security entirely and must only ever be used in a trusted
   server-side / admin context (e.g. a one-off local script that
   reads it from a real, gitignored .env file — see .env.example).
   ============================================================ */

window.NISWARA_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_PUBLIC_KEY",
};
