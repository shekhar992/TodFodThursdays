import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { mockActivePuzzle } from '../data/mockData';
import type { Puzzle } from '../data/mockData';

export type PuzzleRow = Database['public']['Tables']['puzzles']['Row'];

function rowToPuzzle(row: PuzzleRow): Puzzle {
  return {
    id: row.id,
    question: row.question,
    hint: row.hint,
    answer: row.answer,
    points: row.points,
    isActive: row.is_active,
  };
}

export function useActivePuzzle() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(() =>
    isSupabaseConfigured ? null : mockActivePuzzle
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

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

