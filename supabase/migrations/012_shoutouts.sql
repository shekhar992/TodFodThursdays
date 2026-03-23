-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 012: Shoutouts & Micro Awards
-- Run in Supabase SQL Editor after all previous migrations
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.shoutouts (
  id             uuid        primary key default gen_random_uuid(),
  event_id       uuid        references public.events(id) on delete set null,
  event_title    text,
  badge_name     text        not null,
  badge_emoji    text        not null default '⭐',
  recipient_type text        not null check (recipient_type in ('player', 'team')),
  recipient_name text        not null,
  team_id        uuid        references public.teams(id) on delete set null,
  team_name      text,
  points         integer     not null default 0,
  status         text        not null default 'pending'
                             check (status in ('pending', 'published', 'dismissed')),
  published_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.shoutouts enable row level security;

-- Players can read all published shoutouts; pending/dismissed visible to authenticated only
create policy "shoutouts_select_published"
  on public.shoutouts for select
  using (status = 'published' or auth.role() = 'authenticated');

create policy "shoutouts_write"
  on public.shoutouts for all
  using (auth.role() = 'authenticated');

-- ── Realtime ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.shoutouts;
