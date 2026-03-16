-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007 — Events lifecycle + arena_settings singleton
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add winner / results / media columns to events ──────────────────────
alter table public.events
  add column if not exists winner_team_id   uuid references public.teams(id) on delete set null,
  add column if not exists winner_team_name text,
  add column if not exists winner_team_logo text,
  add column if not exists winner_points    integer,
  add column if not exists results          jsonb not null default '[]'::jsonb,
  add column if not exists media_urls       jsonb not null default '[]'::jsonb;

-- ── 2. Drop unused wins column from teams ──────────────────────────────────
-- wins was never meaningfully incremented; score split replaces its purpose.
alter table public.teams drop column if exists wins;

-- ── 3. arena_settings singleton table ──────────────────────────────────────
-- One row (id = 1) stores global broadcast state (stage_mode, etc.)
create table if not exists public.arena_settings (
  id          integer primary key default 1 check (id = 1),
  stage_mode  boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Seed the one-and-only row (idempotent)
insert into public.arena_settings (id, stage_mode)
values (1, false)
on conflict (id) do nothing;

-- ── 4. RLS for arena_settings ──────────────────────────────────────────────
alter table public.arena_settings enable row level security;

-- Anyone (anon + authenticated) can read stage_mode for player screens
create policy "arena_settings_read_public"
  on public.arena_settings for select
  using (true);

-- Only authenticated users (admin) can update
create policy "arena_settings_write_authenticated"
  on public.arena_settings for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── 5. Realtime publication for arena_settings ────────────────────────────
-- So player browsers receive stage_mode changes instantly
alter publication supabase_realtime add table public.arena_settings;
