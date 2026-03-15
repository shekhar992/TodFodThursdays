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

    supabase
      .from('puzzles')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setPuzzle(data ? rowToPuzzle(data as PuzzleRow) : null);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel('puzzles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puzzles' },
        () => {
          supabase
            .from('puzzles')
            .select('*')
            .eq('is_active', true)
            .maybeSingle()
            .then(({ data }) => {
              setPuzzle(data ? rowToPuzzle(data as PuzzleRow) : null);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { puzzle, loading, error };
}

