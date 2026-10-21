-- ============================================================
-- NISWARA — 0003: per-user class progress + private class notes
--
-- Run after 0001 and 0002 (Dashboard → SQL Editor → paste → Run).
-- Safe to re-run.
--
-- First used by the interactive Class 3 ("Understanding Pitch"),
-- but generic: one row per (user, class) for any class.
-- Read/written by js/classActivity.js through js/auth.js.
--
-- Every row is visible ONLY to its owner. There is deliberately
-- no admin read policy on class_notes: notes are private.
-- ============================================================

-- ---------- class_progress ----------
create table if not exists public.class_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  class_id text not null,

  -- { lessonViewed: true, pianoUsed: true, highLow: true, ... }
  checkpoints jsonb not null default '{}'::jsonb,
  -- { "high-low": { attempts, correct, questions, roundsCompleted, bestRoundAccuracy, lastPlayedAt }, ... }
  exercise_stats jsonb not null default '{}'::jsonb,
  -- { reflection: { "0": "..." }, assignment: { "1": true }, selfEvaluation: { ... } }
  answers jsonb not null default '{}'::jsonb,

  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, class_id)
);

comment on table public.class_progress is 'Per-user progress for a class (interactive lesson checkpoints, exercise scores, answers). Owner-only.';

drop trigger if exists class_progress_set_updated_at on public.class_progress;
create trigger class_progress_set_updated_at
  before update on public.class_progress
  for each row execute function public.set_updated_at();

alter table public.class_progress enable row level security;

drop policy if exists "class_progress_select_own" on public.class_progress;
create policy "class_progress_select_own" on public.class_progress
  for select using (auth.uid() = user_id);

drop policy if exists "class_progress_insert_own" on public.class_progress;
create policy "class_progress_insert_own" on public.class_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "class_progress_update_own" on public.class_progress;
create policy "class_progress_update_own" on public.class_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "class_progress_delete_own" on public.class_progress;
create policy "class_progress_delete_own" on public.class_progress
  for delete using (auth.uid() = user_id);

-- ---------- class_notes ----------
create table if not exists public.class_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  class_id text not null,
  body text not null default '' check (char_length(body) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, class_id)
);

comment on table public.class_notes is 'A learner''s private notes for one class. Owner-only — never public, no admin access.';

drop trigger if exists class_notes_set_updated_at on public.class_notes;
create trigger class_notes_set_updated_at
  before update on public.class_notes
  for each row execute function public.set_updated_at();

alter table public.class_notes enable row level security;

drop policy if exists "class_notes_select_own" on public.class_notes;
create policy "class_notes_select_own" on public.class_notes
  for select using (auth.uid() = user_id);

drop policy if exists "class_notes_insert_own" on public.class_notes;
create policy "class_notes_insert_own" on public.class_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "class_notes_update_own" on public.class_notes;
create policy "class_notes_update_own" on public.class_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "class_notes_delete_own" on public.class_notes;
create policy "class_notes_delete_own" on public.class_notes
  for delete using (auth.uid() = user_id);

-- Logged-out visitors never touch these tables.
revoke all on public.class_progress from anon;
revoke all on public.class_notes from anon;
grant select, insert, update, delete on public.class_progress to authenticated;
grant select, insert, update, delete on public.class_notes to authenticated;
