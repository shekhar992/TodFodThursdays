import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { mockTeams } from '../data/mockData';

export type TeamRow = Database['public']['Tables']['teams']['Row'];

export function useTeams() {
  const [teams, setTeams] = useState<TeamRow[]>(() =>
    isSupabaseConfigured ? [] : (mockTeams as unknown as TeamRow[])
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Initial fetch — sorted descending by score
    supabase
      .from('teams')
      .select('*')
      .order('score', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setTeams((data ?? []) as TeamRow[]);
        }
        setLoading(false);
      });

    // Realtime subscription — any row change re-fetches and re-sorts
    const channel = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          supabase
            .from('teams')
            .select('*')
            .order('score', { ascending: false })
            .then(({ data }) => {
              if (data) setTeams(data as TeamRow[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { teams, loading, error };
}
