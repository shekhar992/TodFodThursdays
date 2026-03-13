import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { mockAnnouncements } from '../data/mockData';

export type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>(() =>
    isSupabaseConfigured ? [] : (mockAnnouncements as unknown as AnnouncementRow[])
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setAnnouncements((data ?? []) as AnnouncementRow[]);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) setAnnouncements(data as AnnouncementRow[]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { announcements, loading, error };
}
