-- Migration 003: Puzzle Library table
-- Run in: Supabase Dashboard → SQL Editor → New Query

create table if not exists public.puzzle_library (
  id            uuid        primary key default gen_random_uuid(),
  question      text        not null,
  answer        text        not null,
  hint          text        not null default '',
  points        integer     not null default 50,
  time_limit    integer     not null default 60,   -- seconds
  scheduled_for timestamptz null,                  -- optional auto-launch time
  created_at    timestamptz not null default now()
);

-- Allow public read (admin panel is authenticated but anon key is used)
alter table public.puzzle_library enable row level security;

create policy "Public read puzzle_library"
  on public.puzzle_library for select using (true);

create policy "Authenticated write puzzle_library"
  on public.puzzle_library for all using (auth.role() = 'authenticated');
