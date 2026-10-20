-- ============================================================
-- NISWARA — Phase 2 migration: user profiles + auth plumbing
--
-- Run this once in your Supabase project: Dashboard → SQL Editor
-- → New query → paste this file → Run. (Or via the Supabase CLI:
-- `supabase db push` if you're using local migrations.)
--
-- Scope: this migration covers Phase 2 only (accounts + profile).
-- Curriculum/progress/recordings/etc. tables (§25 of the spec)
-- land in later migrations as Phase 3+ is built — see
-- SETUP.md for the full roadmap.
-- ============================================================

-- ---------- profiles ----------
-- One row per auth.users row (1:1, same primary key).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- identity
  name text,
  username text unique,
  avatar_url text,
  country text,
  preferred_language text,
  learning_goal text,
  experience_level text check (experience_level in ('beginner', 'some_experience', 'intermediate', 'advanced')),
  favorite_styles text[] default '{}',

  -- role (student by default; 'admin' unlocks the future admin dashboard)
  role text not null default 'student' check (role in ('student', 'admin', 'creator')),

  -- learning snapshot — written by the client today; from Phase 3
  -- onward this becomes a read-mostly cache kept in sync by the
  -- progress tables rather than the primary source of truth.
  current_level_id int,
  current_class_id text,
  total_practice_hours numeric not null default 0,

  -- privacy — everything OFF by default (§2: "sensitive information
  -- should remain private" by default)
  is_public boolean not null default false,
  show_progress boolean not null default false,
  show_completed_classes boolean not null default false,
  show_recordings boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per registered user. Owner-writable; publicly readable only through the public_profiles view and only when is_public = true.';

-- keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- auto-create a profile row on signup ----------
-- Runs as SECURITY DEFINER so it can insert despite RLS; this is
-- the ONLY path that creates a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'username'
  )
  on conflict (id) do nothing;
  return new;
exception
  -- Someone else already has that username: don't fail the whole signup
  -- over it, just leave username blank so they can pick another one from
  -- the profile page.
  when unique_violation then
    insert into public.profiles (id, name, username)
    values (new.id, new.raw_user_meta_data ->> 'name', null)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- role helper (reused by future admin-only policies) ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;

-- Every user can read and update their own full row.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Admins can read and update any profile (§21/§22 admin dashboard).
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- No insert/delete policy: rows are created only by the
-- handle_new_user() trigger (security definer, bypasses RLS) and
-- deleted only via the auth.users cascade.

-- ---------- public_profiles view ----------
-- Safe, read-only surface for §17 "Public User Profiles" and the
-- future follow system (§18). Deliberately excludes email and any
-- field not meant to leave the owner's own session. Row-visible
-- only when the owner opted in; the show_* flags let a future
-- public-profile page decide which SECTIONS to render — the
-- underlying progress/recordings data itself doesn't exist until
-- Phase 3+, so those flags are forward-compatible plumbing for now.
create or replace view public.public_profiles
with (security_invoker = true)
as
select
  id,
  name,
  username,
  avatar_url,
  country,
  learning_goal,
  experience_level,
  current_level_id,
  current_class_id,
  show_progress,
  show_completed_classes,
  show_recordings,
  created_at as date_joined
from public.profiles
where is_public = true;

grant select on public.public_profiles to anon, authenticated;

-- ---------- storage: avatars ----------
-- Public read (so <img> tags just work), owner-only write. Path
-- convention enforced by policy: "<user_id>/<filename>".
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
