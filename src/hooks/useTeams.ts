import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockMode } from '../lib/mockAuth';
import type { Database } from '../lib/database.types';
import { mockTeams } from '../data/mockData';

const useLive = isSupabaseConfigured && !isMockMode;

export type TeamRow = Database['public']['Tables']['teams']['Row'];

export function useTeams() {
  const [teams, setTeams] = useState<TeamRow[]>(() =>
    useLive ? [] : (mockTeams as unknown as TeamRow[])
  );
  const [loading, setLoading] = useState(useLive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useLive) return;

    // Shared re-fetch — initial load + polling fallback
    const doFetch = () =>
      supabase
        .from('teams')
        .select('*')
        .order('score', { ascending: false })
        .then(({ data, error: err }) => {
          if (err) { setError(err.message); return; }
          if (data) setTeams(data as TeamRow[]);
          setLoading(false);
        });

    doFetch();

    // Realtime: use payload.new directly — avoids stale reads through Supavisor
    const channel = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          console.log('[Realtime] teams event:', payload.eventType, (payload.new as any)?.name, 'score:', (payload.new as any)?.score);
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any)?.id;
            if (oldId) setTeams(prev => prev.filter(t => t.id !== oldId));
          } else {
            // INSERT or UPDATE — merge the committed row directly, no re-fetch
            const row = payload.new as TeamRow;
            setTeams(prev => {
              const idx = prev.findIndex(t => t.id === row.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = row;
                return next;
              }
              return [...prev, row];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] teams channel:', status);
      });

    // Polling fallback: catches missed Realtime events
    const poll = setInterval(doFetch, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  return { teams, loading, error };
}
