import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockMode } from '../lib/mockAuth';
import type { Database } from '../lib/database.types';
import { mockHighlightEvents, mockUpcomingEvents } from '../data/mockData';
import type { Event } from '../data/mockData';

const useLive = isSupabaseConfigured && !isMockMode;

export type EventRow = Database['public']['Tables']['events']['Row'];

// Map DB row → component-compatible Event shape
function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image_url ?? '',
    category: row.category,
    date: row.date,
    status: row.status,
    participants: row.participants ?? undefined,
  };
}

export function useEvents() {
  const [highlightEvents, setHighlightEvents] = useState<Event[]>(() =>
    useLive ? [] : mockHighlightEvents
  );
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>(() =>
    useLive ? [] : mockUpcomingEvents
  );
  const [loading, setLoading] = useState(useLive);
  const [error, setError] = useState<string | null>(null);

  function splitEvents(rows: EventRow[]) {
    const highlights = rows
      .filter((r) => r.status === 'completed')
      .map(rowToEvent);
    const upcoming = rows
      .filter((r) => r.status === 'upcoming' || r.status === 'live')
      .map(rowToEvent);
    setHighlightEvents(highlights);
    setUpcomingEvents(upcoming);
  }

  useEffect(() => {
    if (!useLive) return;

    supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          splitEvents((data ?? []) as EventRow[]);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true })
            .then(({ data }) => {
              if (data) splitEvents(data as EventRow[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { highlightEvents, upcomingEvents, loading, error };
}
