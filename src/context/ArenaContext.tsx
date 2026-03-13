import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { isMockMode } from "../lib/mockAuth";
import { useTeams } from "../hooks/useTeams";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { useEvents } from "../hooks/useEvents";
import { useActivePuzzle } from "../hooks/useActivePuzzle";
import { EVENT_DETAILS, mockPastPuzzles } from "../data/mockData";

// ── Types ────────────────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  logo: string;
  color?: string;
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
  // Rich fields (populated from EVENT_DETAILS or set by admin)
  emoji: string;
  format: string;
  duration: string;
  rules: string[];
  pointsBreakdown: { place: string; pts: number }[];
  hidden: boolean;
  // Winner / completion
  winnerTeamId?: string;
  winnerTeamName?: string;
  winnerTeamLogo?: string;
  winnerPoints?: number;
  completedAt?: number;
}

export interface Announcement { id: string; text: string; timestamp: string; }

export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
  timeLimit: number;       // seconds, default 300
  startedAt?: number;      // ms timestamp
  expiresAt?: number;      // ms timestamp
  timerRunning: boolean;
}

export interface CompletedPuzzle {
  id: string;
  question: string;
  answer: string;
  points: number;
  solvedBy?: string;          // team name
  solvedByLogo?: string;
  solvedByPlayer?: string;    // display name
  completedAt: number;        // ms timestamp
  timedOut: boolean;
}

interface ArenaState {
  teams: Team[];
  events: ArenaEvent[];
  announcements: Announcement[];
  activePuzzle: Puzzle | null;
  completedPuzzles: CompletedPuzzle[];
  puzzleSolved: boolean;
  solvedTeams: string[];   // team IDs that locked in a correct answer for the active puzzle
}

interface ArenaActions {
  addEvent: (event: Omit<ArenaEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<Omit<ArenaEvent, "id">>) => void;
  deleteEvent: (id: string) => void;
  addAnnouncement: (text: string) => void;
  deleteAnnouncement: (id: string) => void;
  launchPuzzle: (puzzle: Omit<Puzzle, "id" | "timerRunning" | "startedAt" | "expiresAt">) => void;
  startPuzzleTimer: () => void;
  stopPuzzleTimer: () => void;
  solvePuzzle: (solver?: { playerName: string; teamName: string; teamLogo: string; teamId: string }) => void;
  updateScore: (teamId: string, delta: number) => void;
}

const ArenaContext = createContext<(ArenaState & ArenaActions) | null>(null);

const initCompleted: CompletedPuzzle[] = mockPastPuzzles.map(p => ({
  id: p.id, question: p.question, answer: p.answer, points: p.points,
  solvedBy: p.solvedBy, solvedByLogo: p.solvedByLogo, solvedByPlayer: undefined,
  completedAt: new Date(p.date).getTime(), timedOut: false,
}));

export function ArenaProvider({ children }: { children: ReactNode }) {
  const { teams: rawTeams } = useTeams();
  const { announcements: rawAnnouncements } = useAnnouncements();
  const { highlightEvents, upcomingEvents } = useEvents();
  const { puzzle: rawPuzzle } = useActivePuzzle();

  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<ArenaEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState<CompletedPuzzle[]>(
    isMockMode ? initCompleted : []
  );
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [solvedTeams, setSolvedTeams] = useState<string[]>([]);

  // Stable refs so callbacks don't go stale
  const activePuzzleRef = useRef<Puzzle | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { activePuzzleRef.current = activePuzzle; }, [activePuzzle]);

  // ── Sync from hooks ───────────────────────────────────────────────────
  useEffect(() => {
    if (rawTeams.length) {
      setTeams(rawTeams.map(t => ({
        id: t.id, name: t.name, logo: (t as any).logo ?? "⚡",
        score: t.score, wins: t.wins,
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
    const mapEvent = (e: any, isPast: boolean): ArenaEvent => {
      const d = EVENT_DETAILS[e.id];
      return {
        id: e.id, title: e.title, category: e.category, date: e.date,
        description: e.description, isPast, image: e.image || undefined,
        emoji: d?.emoji ?? "📅", format: d?.format ?? "",
        duration: d?.duration ?? "", rules: d?.rules ?? [],
        pointsBreakdown: d?.pointsBreakdown ?? [], hidden: false,
        // Populate winner from EVENT_DETAILS for seeded past events
        winnerTeamName: isPast ? d?.winner : undefined,
        winnerTeamLogo: isPast ? d?.winnerLogo : undefined,
        winnerPoints: isPast ? (d?.pointsBreakdown?.[0]?.pts) : undefined,
        completedAt: isPast ? new Date(e.date).getTime() : undefined,
      };
    };
    const past = highlightEvents.map(e => mapEvent(e, true));
    const upcoming = upcomingEvents.map(e => mapEvent(e, false));
    if (past.length || upcoming.length) setEvents([...upcoming, ...past]);
  }, [highlightEvents, upcomingEvents]);

  useEffect(() => {
    if (rawPuzzle && rawPuzzle.isActive) {
      setActivePuzzle(prev => ({
        id: rawPuzzle.id, question: rawPuzzle.question, answer: rawPuzzle.answer,
        points: rawPuzzle.points, hint: rawPuzzle.hint || undefined,
        timeLimit: prev?.timeLimit ?? 300, timerRunning: prev?.timerRunning ?? false,
        startedAt: prev?.startedAt, expiresAt: prev?.expiresAt,
      }));
      setPuzzleSolved(false);
    } else if (rawPuzzle === null && isSupabaseConfigured) {
      setActivePuzzle(null);
    }
  }, [rawPuzzle]);

  // ── Auto-expire puzzle when timer reaches 0 ────────────────────────────
  useEffect(() => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    if (!activePuzzle?.timerRunning || !activePuzzle.expiresAt) return;

    const expire = () => {
      const prev = activePuzzleRef.current;
      if (!prev) return;
      setCompletedPuzzles(h => [{
        id: prev.id, question: prev.question, answer: prev.answer,
        points: prev.points, completedAt: Date.now(), timedOut: true,
      }, ...h]);
      setActivePuzzle(null);
      setPuzzleSolved(false);
    };

    const msLeft = activePuzzle.expiresAt - Date.now();
    if (msLeft <= 0) { expire(); return; }
    expireTimerRef.current = setTimeout(expire, msLeft);
    return () => { if (expireTimerRef.current) clearTimeout(expireTimerRef.current); };
  }, [activePuzzle?.timerRunning, activePuzzle?.expiresAt]);

  // ── Actions ───────────────────────────────────────────────────────────
  const addEvent = useCallback((event: Omit<ArenaEvent, "id">) => {
    const id = `e-${Date.now()}`;
    setEvents(prev => [{ ...event, id }, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("events").insert({
        id, title: event.title, description: event.description || "",
        category: event.category || "General", date: event.date,
        status: event.isPast ? "completed" : "upcoming",
        image_url: null, cloudinary_public_id: null, participants: null,
      }).then(({ error }) => { if (error) console.error("[Supabase] addEvent:", error.message); });
    }
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Omit<ArenaEvent, "id">>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (isSupabaseConfigured) {
      supabase.from("events").delete().eq("id", id)
        .then(({ error }) => { if (error) console.error("[Supabase] deleteEvent:", error.message); });
    }
  }, []);

  const addAnnouncement = useCallback((text: string) => {
    const id = `a-${Date.now()}`;
    setAnnouncements(prev => [{ id, text, timestamp: new Date().toISOString() }, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("announcements").insert({ id, text, emoji: "📢" })
        .then(({ error }) => { if (error) console.error("[Supabase] addAnnouncement:", error.message); });
    }
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const launchPuzzle = useCallback((puzzle: Omit<Puzzle, "id" | "timerRunning" | "startedAt" | "expiresAt">) => {
    const id = `pz-${Date.now()}`;
    setActivePuzzle({ ...puzzle, id, timerRunning: false });
    setPuzzleSolved(false);
    setSolvedTeams([]);  // fresh puzzle, clear all team lock-outs
    if (isSupabaseConfigured) {
      supabase.from("puzzles").update({ is_active: false }).eq("is_active", true)
        .then(() => {
          supabase.from("puzzles").upsert({
            id, question: puzzle.question, hint: puzzle.hint || "",
            answer: puzzle.answer, points: puzzle.points, is_active: true,
          }).then(({ error }) => { if (error) console.error("[Supabase] launchPuzzle:", error.message); });
        });
    }
  }, []);

  const startPuzzleTimer = useCallback(() => {
    setActivePuzzle(prev => {
      if (!prev) return prev;
      const startedAt = Date.now();
      return { ...prev, timerRunning: true, startedAt, expiresAt: startedAt + prev.timeLimit * 1000 };
    });
  }, []);

  const stopPuzzleTimer = useCallback(() => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const prev = activePuzzleRef.current;
    if (prev) {
      setCompletedPuzzles(h => [{
        id: prev.id, question: prev.question, answer: prev.answer,
        points: prev.points, completedAt: Date.now(), timedOut: true,
      }, ...h]);
    }
    setActivePuzzle(null);
    setPuzzleSolved(false);
  }, []);

  const updateScore = useCallback((teamId: string, delta: number) => {
    setTeams(prev => {
      const updated = prev.map(t => t.id === teamId ? { ...t, score: t.score + delta } : t);
      if (isSupabaseConfigured) {
        const team = updated.find(t => t.id === teamId);
        if (team) {
          supabase.from("teams").update({ score: team.score }).eq("id", teamId)
            .then(({ error }) => { if (error) console.error("[Supabase] updateScore:", error.message); });
        }
      }
      return updated;
    });
  }, []);

  const solvePuzzle = useCallback((solver?: { playerName: string; teamName: string; teamLogo: string; teamId: string }) => {
    // Rule 1: one correct entry per team — silently ignore duplicates
    if (solver?.teamId && solvedTeams.includes(solver.teamId)) return;

    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const prev = activePuzzleRef.current;
    if (prev) {
      // Rule 3: bonus points if solved within first 30s of the timer
      const inBonusWindow =
        prev.timerRunning &&
        prev.startedAt !== undefined &&
        Date.now() - prev.startedAt <= 30_000;
      const pointsAwarded = inBonusWindow ? prev.points * 2 : prev.points;

      setCompletedPuzzles(h => [{
        id: prev.id, question: prev.question, answer: prev.answer,
        points: pointsAwarded,           // record actual points awarded (incl. bonus)
        solvedBy: solver?.teamName, solvedByLogo: solver?.teamLogo,
        solvedByPlayer: solver?.playerName, completedAt: Date.now(), timedOut: false,
      }, ...h]);

      // Rule 2: auto-add to scoreboard
      if (solver?.teamId) {
        updateScore(solver.teamId, pointsAwarded);
        setSolvedTeams(prev => [...prev, solver!.teamId]);
      }

      // Stop timer but keep activePuzzle alive so "Correct!" modal state works
      setActivePuzzle({ ...prev, timerRunning: false });
    }
    setPuzzleSolved(true);
  }, [solvedTeams, updateScore]);

  return (
    <ArenaContext.Provider value={{
      teams, events, announcements, activePuzzle, completedPuzzles, puzzleSolved, solvedTeams,
      addEvent, updateEvent, deleteEvent, addAnnouncement, deleteAnnouncement,
      launchPuzzle, startPuzzleTimer, stopPuzzleTimer, solvePuzzle, updateScore,
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
