-- ============================================================
-- NISWARA — 0002: security fixes for the Phase 2 schema
--
-- Run after 0001_profiles.sql (Dashboard → SQL Editor → paste →
-- Run, or `supabase db push`). Safe to re-run.
--
--  1. Users could promote themselves to admin: "profiles_update_own"
--     allowed updating every column, including `role`.
--  2. public_profiles returned no rows to anyone but the owner: it
--     was security_invoker, so the caller's RLS (own-row only)
--     applied. It also exposed progress fields regardless of the
--     owner's show_progress setting.
--  3. The avatars bucket accepted any file type and size.
-- ============================================================

-- ---------- 1. protect privileged profile columns ----------
-- RLS can't restrict individual columns, so a trigger guards them.
-- auth.uid() is null for the SQL editor / service_role, so admin
-- tooling and future admin-dashboard policies can still change roles.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change a profile''s role'
      using errcode = '42501'; -- insufficient_privilege
  end if;
  -- never user-editable
  new.id := old.id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------- 2. public_profiles: actually public, and honours show_* ----------
-- Runs with the view owner's rights (bypassing profiles RLS), which is
-- safe because the view itself is the filter: opted-in rows only, and
-- only the columns listed here.
create or replace view public.public_profiles
with (security_invoker = false)
as
select
  id,
  name,
  username,
  avatar_url,
  country,
  learning_goal,
  experience_level,
  case when show_progress then current_level_id end as current_level_id,
  case when show_progress then current_class_id end as current_class_id,
  show_progress,
  show_completed_classes,
  show_recordings,
  created_at as date_joined
from public.profiles
where is_public = true;

grant select on public.public_profiles to anon, authenticated;

-- ---------- 3. avatars bucket limits ----------
-- Mirrored client-side in js/auth.js (AVATAR_TYPES / AVATAR_MAX_BYTES).
update storage.buckets
set file_size_limit = 2097152, -- 2 MB
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'avatars';
