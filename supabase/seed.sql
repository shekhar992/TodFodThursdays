-- =============================================================================
-- TFT2 Arena — Seed Script
-- Run once in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run: all inserts use ON CONFLICT DO UPDATE (upsert).
-- =============================================================================

-- ─── 1. TEAMS ─────────────────────────────────────────────────────────────────
-- Fixed UUIDs so FK references from profiles.team_id stay stable.

insert into public.teams (id, name, score, wins, color, logo) values
  ('00000000-0000-0000-0001-000000000001', 'Team Titans',    520, 7, '#00E5FF', '⚡'),
  ('00000000-0000-0000-0001-000000000002', 'Team Phoenix',   480, 6, '#FF2E88', '🔥'),
  ('00000000-0000-0000-0001-000000000003', 'Team Mavericks', 460, 5, '#7A5CFF', '🦅'),
  ('00000000-0000-0000-0001-000000000004', 'Team Warriors',  430, 4, '#00FFC6', '⚔️'),
  ('00000000-0000-0000-0001-000000000005', 'Team Vortex',    390, 3, '#FFE600', '🌀'),
  ('00000000-0000-0000-0001-000000000006', 'Team Nexus',     350, 2, '#FF6B35', '🔗')
on conflict (id) do update set
  name  = excluded.name,
  score = excluded.score,
  wins  = excluded.wins,
  color = excluded.color,
  logo  = excluded.logo;

-- ─── 2. ANNOUNCEMENTS ────────────────────────────────────────────────────────
-- Wipe and re-insert so the ticker always reflects this exact list.

delete from public.announcements;

insert into public.announcements (text, emoji) values
  ('Season 2 is officially live! Good luck to all teams.',            '🚀'),
  ('Team Titans take the lead after Quiz Battle Royale.',             '🏆'),
  ('Reminder: Treasure Hunt starts March 15th at 10am.',             '🗺️'),
  ('New scoring rules: bonus points for style and creativity.',       '⭐'),
  ('Live puzzle challenges are now available mid-week!',              '🧩');

-- ─── 3. EVENTS ───────────────────────────────────────────────────────────────
-- Fixed UUIDs — makes it easy to re-run without duplicates.
-- Past events (status = 'completed') → show in EventHighlights / Past section.
-- Future events (status = 'upcoming') → show in UpcomingEvents / Timeline.

insert into public.events (id, title, description, category, date, status, participants) values
  -- Past (completed)
  ('00000000-0000-0000-0002-000000000001',
   'Quiz Battle Royale',
   'Fast-paced 30-question quiz showdown. +5 correct, −2 wrong. No conferring.',
   'Trivia', '2025-02-10', 'completed', null),

  ('00000000-0000-0000-0002-000000000002',
   'Escape Room Challenge',
   '5-room digital escape room. One hint per room. Fastest team wins.',
   'Puzzle', '2025-02-17', 'completed', null),

  ('00000000-0000-0000-0002-000000000003',
   'Outdoor Sprint',
   '4-leg relay race. Fastest cumulative time across all legs wins.',
   'Physical', '2025-02-24', 'completed', null),

  ('00000000-0000-0000-0002-000000000004',
   'Strategy Blitz',
   'Real-time strategy tournament. Elimination bracket format.',
   'Strategy', '2025-03-03', 'completed', null),

  ('00000000-0000-0000-0002-000000000005',
   'Hackathon Sprint',
   '4-hour build challenge. Any language or tool. 5-min live demo pitch.',
   'Tech', '2025-03-10', 'completed', null),

  -- Upcoming
  ('00000000-0000-0000-0002-000000000006',
   'Treasure Hunt',
   'Campus-wide hunt with cryptic location clues and photo checkpoints.',
   'Adventure', '2026-03-15', 'upcoming', null),

  ('00000000-0000-0000-0002-000000000007',
   'Digital Escape Room',
   'Five layered digital puzzles — solve them faster than every other team.',
   'Puzzle', '2026-03-19', 'upcoming', null),

  ('00000000-0000-0000-0002-000000000008',
   'Outdoor Relay Wars',
   'Four physical challenges, one relay format, and serious bragging rights.',
   'Physical', '2026-03-22', 'upcoming', null),

  ('00000000-0000-0000-0002-000000000009',
   'Debate Duel',
   'Topic revealed 10 min before start. No prep. Pure wits.',
   'Strategy', '2026-03-26', 'upcoming', null),

  ('00000000-0000-0000-0002-000000000010',
   'Hack & Pitch',
   'Build a no-code solution in 2 hrs, pitch it in 2 min — judges will not be gentle.',
   'Tech', '2026-03-29', 'upcoming', null),

  ('00000000-0000-0000-0002-000000000011',
   'Grand Finale',
   'Three rounds, all disciplines, one champion. The season ends here.',
   'Grand Finale', '2026-04-05', 'upcoming', null)

on conflict (id) do update set
  title       = excluded.title,
  description = excluded.description,
  category    = excluded.category,
  date        = excluded.date,
  status      = excluded.status;

-- ─── 4. PUZZLES ──────────────────────────────────────────────────────────────
-- Deactivate anything currently active, then insert the live puzzle.

update public.puzzles set is_active = false where is_active = true;

insert into public.puzzles (question, hint, answer, points, is_active) values
  (
    'I''m always hungry and must always be fed. The finger I lick will soon turn red. What am I?',
    'Think heat, light, and danger.',
    'fire',
    50,
    true
  );

-- =============================================================================
-- Done! Verify with:
--   select * from teams order by score desc;
--   select * from events order by date;
--   select * from announcements;
--   select * from puzzles where is_active = true;
-- =============================================================================
