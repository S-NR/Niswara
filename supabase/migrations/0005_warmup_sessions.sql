-- ============================================================
-- NISWARA — 0005: warm-up history
--
-- Run after 0001–0004 (Dashboard → SQL Editor → paste → Run).
-- Safe to re-run.
--
-- warmup_sessions: one row per FINISHED warm-up (the common
--   "🎤 Warm-up" section, unlocked after Level 1 Classes 1–9).
--   Written by js/warmup.js through js/auth.js. The id is made on
--   the device, so saving the same session twice (retry, second
--   device) is an upsert, never a duplicate.
--
-- Deliberately minimal: type, times, duration and which steps were
-- done or skipped. No recordings, no self-check answers, no
-- free text — nothing personal beyond "I warmed up".
--
-- Every row is visible ONLY to its owner (no admin read policy).
-- ============================================================

create table if not exists public.warmup_sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  warmup_type text not null check (warmup_type in ('quick', 'full', 'performance')),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration integer not null check (duration >= 0 and duration < 86400), -- seconds
  -- ["relax", "breath", "sound", ...] step keys, in the order they were done
  completed_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(completed_steps) = 'array'),
  skipped_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(skipped_steps) = 'array'),
  -- the emphasis the learner chose for that session (pitch / rhythm / transitions / breath), if any
  emphasis text check (emphasis is null or emphasis in ('pitch', 'rhythm', 'transitions', 'breath')),
  created_at timestamptz not null default now()
);

comment on table public.warmup_sessions is 'A learner''s finished warm-ups (type, duration, steps). Owner-only.';

create index if not exists warmup_sessions_user_completed_idx
  on public.warmup_sessions (user_id, completed_at desc);

alter table public.warmup_sessions enable row level security;

drop policy if exists "warmup_sessions_select_own" on public.warmup_sessions;
create policy "warmup_sessions_select_own" on public.warmup_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "warmup_sessions_insert_own" on public.warmup_sessions;
create policy "warmup_sessions_insert_own" on public.warmup_sessions
  for insert with check (auth.uid() = user_id);

-- Upsert of an already-saved session (same id) — still only your own rows
drop policy if exists "warmup_sessions_update_own" on public.warmup_sessions;
create policy "warmup_sessions_update_own" on public.warmup_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "warmup_sessions_delete_own" on public.warmup_sessions;
create policy "warmup_sessions_delete_own" on public.warmup_sessions
  for delete using (auth.uid() = user_id);

-- Logged-out visitors never touch this table.
revoke all on public.warmup_sessions from anon;
grant select, insert, update, delete on public.warmup_sessions to authenticated;
