-- Migration 006: Add completion fields to puzzles table
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Strategy: instead of a separate completed_puzzles table (insert kept failing
-- silently despite RLS being open), we piggyback completion data onto the
-- existing puzzles row via the same UPDATE call the player already uses
-- to deactivate the puzzle. That path is proven to work.
-- History = SELECT * FROM puzzles WHERE completed_at IS NOT NULL.

alter table public.puzzles
  add column if not exists solved_by         text        null,
  add column if not exists solved_by_logo    text        null,
  add column if not exists solved_by_player  text        null,
  add column if not exists solved_by_team_id text        null,
  add column if not exists awarded_points    integer     null,
  add column if not exists completed_at      timestamptz null,
  add column if not exists timed_out         boolean     not null default false;
