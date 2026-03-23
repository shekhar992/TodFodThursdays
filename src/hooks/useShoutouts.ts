import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { isMockMode } from "../lib/mockAuth";
import { mockShoutoutsStore } from "../data/mockData";

export interface ShoutoutRow {
  id: string;
  eventId: string | null;
  eventTitle: string | null;
  badgeName: string;
  badgeEmoji: string;
  recipientType: 'player' | 'team';
  recipientName: string;
  teamId: string | null;
  teamName: string | null;
  points: number;
  status: 'pending' | 'published' | 'dismissed';
  publishedAt: string | null;
  createdAt: string;
}

function rowToShoutout(r: any): ShoutoutRow {
  return {
    id: r.id,
    eventId: r.event_id,
    eventTitle: r.event_title,
    badgeName: r.badge_name,
    badgeEmoji: r.badge_emoji,
    recipientType: r.recipient_type,
    recipientName: r.recipient_name,
    teamId: r.team_id,
    teamName: r.team_name,
    points: r.points,
    status: r.status,
    publishedAt: r.published_at,
    createdAt: r.created_at,
  };
}

export function useShoutouts() {
  const [shoutouts, setShoutouts] = useState<ShoutoutRow[]>(() =>
    isMockMode ? (mockShoutoutsStore.getAll() as unknown as ShoutoutRow[]) : []
  );

  const refetch = useCallback(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('shoutouts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[useShoutouts] fetch error:', error.message); return; }
        if (data) setShoutouts(data.map(rowToShoutout));
      });
  }, []);

  useEffect(() => {
    if (isMockMode) {
      return mockShoutoutsStore.subscribe(() =>
        setShoutouts([...mockShoutoutsStore.getAll()] as unknown as ShoutoutRow[])
      );
    }
    if (!isSupabaseConfigured) return;
    refetch();
    const ch = supabase
      .channel('shoutouts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shoutouts' }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  const pendingShoutouts = shoutouts.filter(s => s.status === 'pending');
  const publishedShoutouts = shoutouts.filter(s => s.status === 'published');

  // For the player dashboard "Last Event Highlights" rail:
  // Prefer event-linked shoutouts from the most recently published event.
  // If none exist, show the 8 most recent manual (no-event) published shoutouts.
  // Either way, always include any manual shoutouts posted within the last 7 days
  // alongside event-linked ones so they're never silently hidden.
  let latestEventShoutouts: ShoutoutRow[] = [];

  const publishedWithEvent = publishedShoutouts.filter(s => s.eventId);
  const recentManual = publishedShoutouts
    .filter(s => !s.eventId)
    .slice(0, 5);

  if (publishedWithEvent.length > 0) {
    const byEventId: Record<string, ShoutoutRow[]> = {};
    publishedWithEvent.forEach(s => {
      if (!byEventId[s.eventId!]) byEventId[s.eventId!] = [];
      byEventId[s.eventId!].push(s);
    });
    const latestEventId = Object.entries(byEventId).sort((a, b) => {
      const aMax = Math.max(...a[1].map(s => new Date(s.publishedAt || s.createdAt).getTime()));
      const bMax = Math.max(...b[1].map(s => new Date(s.publishedAt || s.createdAt).getTime()));
      return bMax - aMax;
    })[0][0];
    // Event shoutouts + any recent manual ones merged, deduped by id
    const merged = [...byEventId[latestEventId], ...recentManual];
    latestEventShoutouts = merged.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);
  } else {
    latestEventShoutouts = recentManual;
  }

  return { shoutouts, pendingShoutouts, publishedShoutouts, latestEventShoutouts };
}
