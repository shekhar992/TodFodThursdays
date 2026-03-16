import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockMode } from '../lib/mockAuth';
import type { Database } from '../lib/database.types';
import { mockActivePuzzle } from '../data/mockData';
import type { Puzzle } from '../data/mockData';

const useLive = isSupabaseConfigured && !isMockMode;

export type PuzzleRow = Database['public']['Tables']['puzzles']['Row'];

function rowToPuzzle(row: PuzzleRow): Puzzle {
  return {
    id: row.id,
    question: row.question,
    hint: row.hint,
    answer: row.answer,
    points: row.points,
    isActive: row.is_active,
    timeLimit: (row as any).time_limit ?? 60,
    scheduledFor: (row as any).scheduled_for ? new Date((row as any).scheduled_for).getTime() : undefined,
    timerRunning: (row as any).timer_running ?? false,
    startedAt: (row as any).started_at ? new Date((row as any).started_at).getTime() : undefined,
    expiresAt: (row as any).expires_at ? new Date((row as any).expires_at).getTime() : undefined,
  };
}

export function useActivePuzzle() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(() =>
    useLive ? null : mockActivePuzzle
  );
  const [loading, setLoading] = useState(useLive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useLive) return;

    // Shared re-fetch — used for initial load, DELETE events, and the polling fallback.
    const doFetch = () =>
      supabase
        .from('puzzles')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()
        .then(({ data, error: err }) => {
          if (err) { setError(err.message); return; }
          setPuzzle(data ? rowToPuzzle(data as PuzzleRow) : null);
          setLoading(false);
        });

    doFetch();

    // Realtime: use payload.new directly — avoids the PROD race condition where
    // an immediate re-fetch through Supabase's connection pooler (Supavisor) can
    // return stale data for a moment and leave the admin stuck with an active puzzle.
    const channel = supabase
      .channel('puzzles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puzzles' },
        (payload) => {
          console.log('[Realtime] puzzles event:', payload.eventType);
          if (payload.eventType === 'DELETE') {
            doFetch();
          } else {
            // INSERT or UPDATE — payload.new is the committed row, no re-fetch needed
            const row = payload.new as any;
            if (row.is_active) {
              setPuzzle(rowToPuzzle(row as PuzzleRow));
            } else {
              // Puzzle deactivated — clear immediately, no stale-read risk
              setPuzzle(null);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] puzzles channel:', status);
      });

    // Polling fallback: catches any Realtime event missed due to WebSocket drops.
    const poll = setInterval(doFetch, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  return { puzzle, loading, error };
}

