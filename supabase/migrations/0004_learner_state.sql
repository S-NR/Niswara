-- ============================================================
-- NISWARA — 0004: progress on every device
--
-- Run after 0001–0003 (Dashboard → SQL Editor → paste → Run).
-- Safe to re-run.
--
-- learner_state: one row per user holding their whole progress
--   (completed/unlocked classes, current class, practice log,
--   journal, projects, class answers, milestone recordings list).
--   Written by js/cloudSync.js. `version` is bumped on every save;
--   the client only updates when the version it last saw still
--   matches, so a stale device merges and retries instead of
--   overwriting newer progress.
--
-- recordings: private Storage bucket for the learner's audio/video,
--   path "<user_id>/<mediaId>". Only the owner can read or write.
-- ============================================================

-- ---------- learner_state ----------
create table if not exists public.learner_state (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (octet_length(state::text) < 2000000),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.learner_state is 'A learner''s whole progress (one row per user), synced across devices. Owner-only.';

drop trigger if exists learner_state_set_updated_at on public.learner_state;
create trigger learner_state_set_updated_at
  before update on public.learner_state
  for each row execute function public.set_updated_at();

alter table public.learner_state enable row level security;

drop policy if exists "learner_state_select_own" on public.learner_state;
create policy "learner_state_select_own" on public.learner_state
  for select using (auth.uid() = user_id);

drop policy if exists "learner_state_insert_own" on public.learner_state;
create policy "learner_state_insert_own" on public.learner_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "learner_state_update_own" on public.learner_state;
create policy "learner_state_update_own" on public.learner_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "learner_state_delete_own" on public.learner_state;
create policy "learner_state_delete_own" on public.learner_state
  for delete using (auth.uid() = user_id);

revoke all on public.learner_state from anon;
grant select, insert, update, delete on public.learner_state to authenticated;

-- ---------- recordings bucket (private) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 26214400, array['audio/*', 'video/*']) -- 25 MB per file
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recordings_owner_read" on storage.objects;
create policy "recordings_owner_read" on storage.objects
  for select using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "recordings_owner_insert" on storage.objects;
create policy "recordings_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "recordings_owner_update" on storage.objects;
create policy "recordings_owner_update" on storage.objects
  for update using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "recordings_owner_delete" on storage.objects;
create policy "recordings_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );
