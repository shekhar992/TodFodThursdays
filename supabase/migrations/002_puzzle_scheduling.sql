-- Migration 002: Add scheduling + timer fields to puzzles table
-- Run in: Supabase Dashboard → SQL Editor → New Query

alter table public.puzzles
  add column if not exists time_limit    integer      not null default 60,
  add column if not exists scheduled_for timestamptz  null,
  add column if not exists timer_running boolean      not null default false,
  add column if not exists started_at    timestamptz  null,
  add column if not exists expires_at    timestamptz  null;

-- Comment describing each field:
-- time_limit    : window in seconds the puzzle is open once timer starts
-- scheduled_for : UTC timestamp to auto-launch the timer (null = manual start)
-- timer_running : true once the countdown has started
-- started_at    : when the timer was started (used for decay scoring)
-- expires_at    : when the puzzle closes (started_at + time_limit seconds)
