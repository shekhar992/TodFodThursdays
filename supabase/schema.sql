-- ─────────────────────────────────────────────────────────────────────────────
-- TFT2 Arena — Supabase SQL Schema
-- Paste this into: supabase.com → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (already on in Supabase by default)
create extension if not exists "pgcrypto";

-- ─── Teams ───────────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  score       integer not null default 0,
  wins        integer not null default 0,
  color       text not null default '#38BDF8',
  logo        text not null default '⚡',
  created_at  timestamptz not null default now()
);

-- ─── Announcements ───────────────────────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  emoji       text not null default '📢',
  created_at  timestamptz not null default now()
);

-- ─── Events ──────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text not null default '',
  image_url             text,
  cloudinary_public_id  text,
  category              text not null default 'General',
  date                  text not null,
  status                text not null default 'upcoming'
                          check (status in ('upcoming', 'live', 'completed')),
  participants          integer,
  created_at            timestamptz not null default now()
);

-- ─── Puzzles ─────────────────────────────────────────────────────────────────
create table if not exists public.puzzles (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  hint        text not null default '',
  answer      text not null,
  points      integer not null default 50,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Enforce only one active puzzle at a time
create unique index if not exists puzzles_single_active
  on public.puzzles (is_active)
  where is_active = true;

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- All tables: public read (players), authenticated write (admin)

alter table public.teams          enable row level security;
alter table public.announcements  enable row level security;
alter table public.events         enable row level security;
alter table public.puzzles        enable row level security;

-- SELECT: anyone (anon key is enough for player screen reads)
create policy "teams_select"          on public.teams          for select using (true);
create policy "announcements_select"  on public.announcements  for select using (true);
create policy "events_select"         on public.events         for select using (true);
create policy "puzzles_select"        on public.puzzles        for select using (true);

-- INSERT / UPDATE / DELETE: authenticated users only (admin)
create policy "teams_write"          on public.teams          for all using (auth.role() = 'authenticated');
create policy "announcements_write"  on public.announcements  for all using (auth.role() = 'authenticated');
create policy "events_write"         on public.events         for all using (auth.role() = 'authenticated');
create policy "puzzles_write"        on public.puzzles        for all using (auth.role() = 'authenticated');

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Enable realtime on all tables (run in Supabase dashboard:
-- Database → Replication → toggle each table ON)
-- Or run the statements below:

alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.puzzles;

-- ─── Seed Data ────────────────────────────────────────────────────────────────
-- Optional: paste to pre-populate with the mock data

insert into public.teams (id, name, score, wins, color, logo) values
  ('00000000-0000-0000-0000-000000000001', 'Team Titans',    520, 7, '#00E5FF', '⚡'),
  ('00000000-0000-0000-0000-000000000002', 'Team Phoenix',   480, 6, '#FF2E88', '🔥'),
  ('00000000-0000-0000-0000-000000000003', 'Team Mavericks', 460, 5, '#7A5CFF', '🌪️'),
  ('00000000-0000-0000-0000-000000000004', 'Team Warriors',  430, 4, '#00FFC6', '🛡️'),
  ('00000000-0000-0000-0000-000000000005', 'Team Vortex',    390, 3, '#FFE600', '🌀'),
  ('00000000-0000-0000-0000-000000000006', 'Team Nexus',     350, 2, '#FF7B00', '🔮')
on conflict (id) do nothing;

insert into public.announcements (text, emoji) values
  ('TITANS WIN Quiz Battle — Leaderboard updated!',              '🔥'),
  ('New Puzzle dropping TONIGHT at 6PM — stay sharp!',           '⚡'),
  ('Event highlights from Outdoor Sprint now uploaded',          '📸'),
  ('Team Phoenix surges 2 spots after Escape Room challenge',    '🏆'),
  ('Treasure Hunt registration closes in 2 HOURS',              '🎯'),
  ('Mid-Season bonus challenge unlocked — 50 pts up for grabs', '🚀'),
  ('Admin has posted a new announcement — check Event Board',    '📢')
on conflict do nothing;

insert into public.puzzles (question, hint, answer, points, is_active) values
  ('I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.',
   'Think about sound... and nature.', 'echo', 50, true)
on conflict do nothing;
