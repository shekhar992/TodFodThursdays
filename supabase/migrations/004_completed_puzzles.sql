-- Migration 004: Completed puzzles history table
-- Run in: Supabase Dashboard → SQL Editor → New Query

create table if not exists public.completed_puzzles (
  id                uuid        primary key,          -- same UUID as the active puzzle row
  question          text        not null,
  answer            text        not null,
  points            integer     not null,
  awarded_points    integer     null,                 -- null for timed-out entries
  solved_by         text        null,                 -- team name
  solved_by_logo    text        null,                 -- team emoji/logo
  solved_by_player  text        null,                 -- player display name
  solved_by_team_id text        null,                 -- team UUID (text to avoid FK issues)
  completed_at      timestamptz not null,
  timed_out         boolean     not null default false
);

alter table public.completed_puzzles enable row level security;

create policy "Public read completed_puzzles"
  on public.completed_puzzles for select using (true);

create policy "Authenticated write completed_puzzles"
  on public.completed_puzzles for all using (auth.role() = 'authenticated');
