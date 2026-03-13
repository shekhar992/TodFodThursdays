import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useTeams } from "../hooks/useTeams";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { useEvents } from "../hooks/useEvents";
import { useActivePuzzle } from "../hooks/useActivePuzzle";

// ── Types (matches Lovable interface exactly) ────────────────────────────
export interface Team {
  id: string;
  name: string;
  logo: string;
  score: number;
  wins: number;
}

export interface ArenaEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  isPast: boolean;
  image?: string;
}

export interface Announcement {
  id: string;
  text: string;
  timestamp: string;
}

export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
}

interface ArenaState {
  teams: Team[];
  events: ArenaEvent[];
  announcements: Announcement[];
  activePuzzle: Puzzle | null;
  puzzleSolved: boolean;
}

interface ArenaActions {
  addEvent: (event: Omit<ArenaEvent, "id" | "isPast">) => void;
  addAnnouncement: (text: string) => void;
  launchPuzzle: (puzzle: Omit<Puzzle, "id">) => void;
  updateScore: (teamId: string, delta: number) => void;
  solvePuzzle: () => void;
}

const ArenaContext = createContext<(ArenaState & ArenaActions) | null>(null);

export function ArenaProvider({ children }: { children: ReactNode }) {
  // ── Supabase live hooks ──────────────────────────────────────────────
  const { teams: rawTeams } = useTeams();
  const { announcements: rawAnnouncements } = useAnnouncements();
  const { highlightEvents, upcomingEvents } = useEvents();
  const { puzzle: rawPuzzle } = useActivePuzzle();

  // ── Local state (Lovable-compatible shape) ───────────────────────────
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<ArenaEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // ── Sync from Supabase hooks ─────────────────────────────────────────
  useEffect(() => {
    if (rawTeams.length) {
      setTeams(rawTeams.map(t => ({
        id: t.id,
        name: t.name,
        logo: (t as any).logo ?? "⚡",
        score: t.score,
        wins: t.wins,
      })));
    }
  }, [rawTeams]);

  useEffect(() => {
    if (rawAnnouncements.length) {
      setAnnouncements(rawAnnouncements.map(a => ({
        id: a.id,
        text: (a as any).emoji ? `${(a as any).emoji} ${a.text}` : a.text,
        timestamp: (a as any).created_at ?? new Date().toISOString(),
      })));
    }
  }, [rawAnnouncements]);

  useEffect(() => {
    const past: ArenaEvent[] = highlightEvents.map(e => ({
      id: e.id, title: e.title, category: e.category, date: e.date,
      description: e.description, isPast: true, image: e.image || undefined,
    }));
    const upcoming: ArenaEvent[] = upcomingEvents.map(e => ({
      id: e.id, title: e.title, category: e.category, date: e.date,
      description: e.description, isPast: false, image: e.image || undefined,
    }));
    if (past.length || upcoming.length) setEvents([...upcoming, ...past]);
  }, [highlightEvents, upcomingEvents]);

  useEffect(() => {
    if (rawPuzzle && rawPuzzle.isActive) {
      setActivePuzzle({
        id: rawPuzzle.id,
        question: rawPuzzle.question,
        answer: rawPuzzle.answer,
        points: rawPuzzle.points,
        hint: rawPuzzle.hint || undefined,
      });
      setPuzzleSolved(false);
    } else if (rawPuzzle === null && isSupabaseConfigured) {
      setActivePuzzle(null);
    }
  }, [rawPuzzle]);

  // ── Actions ──────────────────────────────────────────────────────────
  const addEvent = useCallback((event: Omit<ArenaEvent, "id" | "isPast">) => {
    const id = `e-${Date.now()}`;
    setEvents(prev => [{ ...event, id, isPast: false }, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("events").insert({
        id, title: event.title, description: event.description || "",
        category: event.category || "General", date: event.date,
        status: "upcoming", image_url: null,
        cloudinary_public_id: null, participants: null,
      }).then(({ error }) => { if (error) console.error("[Supabase] event:", error.message); });
    }
  }, []);

  const addAnnouncement = useCallback((text: string) => {
    const id = `a-${Date.now()}`;
    setAnnouncements(prev => [{ id, text, timestamp: new Date().toISOString() }, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("announcements").insert({ id, text, emoji: "📢" })
        .then(({ error }) => { if (error) console.error("[Supabase] announcement:", error.message); });
    }
  }, []);

  const launchPuzzle = useCallback((puzzle: Omit<Puzzle, "id">) => {
    const id = `pz-${Date.now()}`;
    setActivePuzzle({ ...puzzle, id });
    setPuzzleSolved(false);
    if (isSupabaseConfigured) {
      supabase.from("puzzles").update({ is_active: false }).eq("is_active", true)
        .then(() => {
          supabase.from("puzzles").upsert({
            id, question: puzzle.question, hint: puzzle.hint || "",
            answer: puzzle.answer, points: puzzle.points, is_active: true,
          }).then(({ error }) => { if (error) console.error("[Supabase] puzzle:", error.message); });
        });
    }
  }, []);

  const updateScore = useCallback((teamId: string, delta: number) => {
    setTeams(prev => {
      const updated = prev.map(t => t.id === teamId ? { ...t, score: t.score + delta } : t);
      if (isSupabaseConfigured) {
        const team = updated.find(t => t.id === teamId);
        if (team) {
          supabase.from("teams").update({ score: team.score }).eq("id", teamId)
            .then(({ error }) => { if (error) console.error("[Supabase] score:", error.message); });
        }
      }
      return updated;
    });
  }, []);

  const solvePuzzle = useCallback(() => {
    setPuzzleSolved(true);
  }, []);

  return (
    <ArenaContext.Provider value={{
      teams, events, announcements, activePuzzle, puzzleSolved,
      addEvent, addAnnouncement, launchPuzzle, updateScore, solvePuzzle,
    }}>
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena() {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error("useArena must be used within ArenaProvider");
  return ctx;
}
