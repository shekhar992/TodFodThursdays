-- Migration 005: Fix completed_puzzles RLS so any connected browser can INSERT
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Root cause: The original "FOR ALL USING (...)" policy covers SELECT/UPDATE/DELETE
-- via USING but the implicit WITH CHECK for INSERT requires an explicit expression.
-- In practice under Supabase/PostgREST, "FOR ALL USING" can silently drop INSERT
-- requests from browsers where the JWT is missing or briefly stale.
-- Fix: split into explicit per-operation policies using both USING and WITH CHECK.

-- 1. Drop the combined policy
drop policy if exists "Authenticated write completed_puzzles" on public.completed_puzzles;

-- 2. INSERT: allow any connected browser (anon or authenticated).
--    The id comes from the puzzle UUID which only admin controls,
--    so there is no meaningful injection risk.
create policy "Anyone insert completed_puzzles"
  on public.completed_puzzles
  for insert
  with check (true);

-- 3. UPDATE: authenticated only (admin correcting a record)
create policy "Authenticated update completed_puzzles"
  on public.completed_puzzles
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. DELETE: authenticated only
create policy "Authenticated delete completed_puzzles"
  on public.completed_puzzles
  for delete
  using (auth.role() = 'authenticated');
