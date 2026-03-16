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
  // Event lifecycle
  status?: 'scheduled' | 'live' | 'completed';
  results?: { place: string; pts: number; teamId?: string; teamName?: string; teamLogo?: string }[];
  memories?: string[];  // image URLs uploaded by admin
}

export interface Announcement { id: string; text: string; timestamp: string; }

export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
  timeLimit: number;       // seconds, default 60
  scheduledFor?: number;   // ms timestamp — auto-launch at this time
  startedAt?: number;      // ms timestamp
  expiresAt?: number;      // ms timestamp
  timerRunning: boolean;
}

export interface CompletedPuzzle {
  id: string;
  question: string;
  answer: string;
  points: number;             // base points
  awardedPoints?: number;     // actual decayed points awarded
  solvedBy?: string;          // team name
  solvedByLogo?: string;
  solvedByPlayer?: string;    // display name
  solvedByTeamId?: string;    // team id
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
  stageMode: boolean;
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
  setStageModeActive: (active: boolean) => void;
}

const ArenaContext = createContext<(ArenaState & ArenaActions) | null>(null);

const initCompleted: CompletedPuzzle[] = mockPastPuzzles.map(p => ({
  id: p.id, question: p.question, answer: p.answer, points: p.points,
  awardedPoints: p.awardedPoints,
  solvedBy: p.solvedBy, solvedByLogo: p.solvedByLogo, solvedByPlayer: undefined,
  solvedByTeamId: p.solvedByTeamId,
  completedAt: p.scheduledFor ?? new Date(p.date).getTime(), timedOut: false,
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
  const [stageMode, setStageModeActive] = useState(false);

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
        status: isPast ? 'completed' : 'scheduled',
        results: isPast ? (d?.results?.map(r => ({ place: r.place, pts: r.pts, teamName: r.teamName, teamLogo: r.teamLogo })) ?? []) : [],
        // memories: prefer Supabase image_url, fall back to mock seed images
        memories: isPast
          ? [e.image].filter(Boolean).concat(d?.memories ?? []).filter(Boolean) as string[]
          : undefined,
      };
    };
    const past = highlightEvents.map(e => mapEvent(e, true));
    const upcoming = upcomingEvents.map(e => mapEvent(e, false));
    if (past.length || upcoming.length) setEvents([...upcoming, ...past]);
  }, [highlightEvents, upcomingEvents]);

  useEffect(() => {
    if (rawPuzzle && rawPuzzle.isActive) {
      // Use DB values directly — DB is source of truth for all fields in prod.
      // This ensures player clients see timerRunning/scheduledFor/expiresAt
      // as soon as the admin updates them, via Realtime.
      setActivePuzzle({
        id: rawPuzzle.id,
        question: rawPuzzle.question,
        answer: rawPuzzle.answer,
        points: rawPuzzle.points,
        hint: rawPuzzle.hint || undefined,
        timeLimit:    rawPuzzle.timeLimit    ?? 60,
        timerRunning: rawPuzzle.timerRunning ?? false,
        startedAt:    rawPuzzle.startedAt,
        expiresAt:    rawPuzzle.expiresAt,
        scheduledFor: rawPuzzle.scheduledFor,
      });
      setPuzzleSolved(false);
    } else if (rawPuzzle === null && isSupabaseConfigured) {
      setActivePuzzle(null);
    }
  }, [rawPuzzle]);

  // Stable ref for tracking activePuzzle transitions
  const prevActivePuzzleIdRef = useRef<string | undefined>(undefined);

  // ── DB row → local type (used in multiple places) ─────────────────────
  function rowToCompleted(r: any): CompletedPuzzle {
    return {
      id: r.id,
      question: r.question,
      answer: r.answer,
      points: r.points,
      awardedPoints: r.awarded_points ?? undefined,
      solvedBy: r.solved_by ?? undefined,
      solvedByLogo: r.solved_by_logo ?? undefined,
      solvedByPlayer: r.solved_by_player ?? undefined,
      solvedByTeamId: r.solved_by_team_id ?? undefined,
      completedAt: new Date(r.completed_at).getTime(),
      timedOut: r.timed_out,
    };
  }

  function fetchCompletedPuzzles() {
    supabase
      .from('completed_puzzles')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) { console.error('[Supabase] completed_puzzles fetch:', error.message); return; }
        // Only replace local state if the DB actually has rows.
        // An empty result would wipe locally-added entries that haven't been
        // committed yet (or whose write failed), causing them to vanish from the UI.
        if (data && data.length > 0) {
          setCompletedPuzzles(prev => {
            const dbEntries = data.map(rowToCompleted);
            const dbIds = new Set(dbEntries.map(e => e.id));
            // Keep any local-only entries (not yet in DB) appended at the end
            const localOnly = prev.filter(p => !dbIds.has(p.id));
            return [...dbEntries, ...localOnly];
          });
        }
      });
  }

  // ── Load completed puzzle history + subscribe to new entries ──────────
  useEffect(() => {
    if (!isSupabaseConfigured || isMockMode) return;

    // Initial fetch
    fetchCompletedPuzzles();

    // Realtime: pick up new/updated rows written by any client
    // Listen for * (not just INSERT) because persistCompleted uses upsert which
    // can produce UPDATE events when the row already exists.
    const channel = supabase
      .channel('completed-puzzles-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'completed_puzzles' },
        (payload) => {
          console.log('[Realtime] completed_puzzles event:', payload.eventType, (payload.new as any)?.id);
          if (payload.eventType === 'DELETE') return;
          const entry = rowToCompleted(payload.new);
          setCompletedPuzzles(prev => {
            const idx = prev.findIndex(p => p.id === entry.id);
            if (idx >= 0) {
              // Already exists (local writer or upsert→UPDATE) — replace with DB truth
              const next = [...prev];
              next[idx] = entry;
              return next;
            }
            return [entry, ...prev];
          });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] completed_puzzles channel:', status);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Re-fetch completed puzzles when any puzzle ends ────────────────────
  // Fires on ALL browsers (player + admin) when activePuzzle goes null.
  // Safety net: even if the Realtime INSERT event was missed, this catches it.
  useEffect(() => {
    if (!isSupabaseConfigured || isMockMode) return;
    const prevId = prevActivePuzzleIdRef.current;
    prevActivePuzzleIdRef.current = activePuzzle?.id;
    // Had a puzzle, now null → a puzzle just ended → re-fetch after short delay
    // to ensure the INSERT has committed before we read
    if (prevId && activePuzzle === null) {
      const t = setTimeout(fetchCompletedPuzzles, 800);
      return () => clearTimeout(t);
    }
  }, [activePuzzle]);

  // ── Auto-expire puzzle when timer reaches 0 ────────────────────────────
  useEffect(() => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    if (!activePuzzle?.timerRunning || !activePuzzle.expiresAt) return;

    const expire = () => {
      const prev = activePuzzleRef.current;
      if (!prev) return;
      const expireEntry: CompletedPuzzle = {
        id: prev.id, question: prev.question, answer: prev.answer,
        points: prev.points, completedAt: Date.now(), timedOut: true,
      };
      setCompletedPuzzles(h => [expireEntry, ...h]);
      persistCompleted(expireEntry);
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({ is_active: false, timer_running: false })
          .eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] expire deactivate:", error.message); });
      }
      setActivePuzzle(null);
      setPuzzleSolved(false);
    };

    const msLeft = activePuzzle.expiresAt - Date.now();
    if (msLeft <= 0) { expire(); return; }
    expireTimerRef.current = setTimeout(expire, msLeft);
    return () => { if (expireTimerRef.current) clearTimeout(expireTimerRef.current); };
  }, [activePuzzle?.timerRunning, activePuzzle?.expiresAt]);

  // ── Persist completed puzzle to Supabase ─────────────────────────────
  function persistCompleted(cp: CompletedPuzzle) {
    if (!isSupabaseConfigured) return;
    console.log('[Arena] persistCompleted →', cp.id, cp.timedOut ? 'timed-out' : 'solved');
    // Plain INSERT — only requires INSERT RLS (with check true).
    // upsert variants (even ignoreDuplicates) trigger PostgREST UPDATE RLS
    // pre-checks which silently reject on this table's policy setup.
    // 23505 = unique_violation → same puzzle row submitted twice, safe to ignore.
    supabase.from('completed_puzzles').insert({
      id: cp.id,
      question: cp.question,
      answer: cp.answer,
      points: cp.points,
      awarded_points: cp.awardedPoints ?? null,
      solved_by: cp.solvedBy ?? null,
      solved_by_logo: cp.solvedByLogo ?? null,
      solved_by_player: cp.solvedByPlayer ?? null,
      solved_by_team_id: cp.solvedByTeamId ?? null,
      completed_at: new Date(cp.completedAt).toISOString(),
      timed_out: cp.timedOut,
    })
      .then(({ error }) => {
        if (error) {
          if (error.code === '23505') {
            console.log('[Supabase] completed_puzzles already recorded (OK) →', cp.id);
          } else {
            console.error('[Supabase] completed_puzzles insert FAILED:', error.code, error.message);
          }
        } else {
          console.log('[Supabase] completed_puzzles insert OK →', cp.id);
        }
      })
      .catch((err) => console.error('[Supabase] completed_puzzles insert threw:', err));
  }

  // ── Actions ───────────────────────────────────────────────────────────
  const addEvent = useCallback((event: Omit<ArenaEvent, "id">) => {
    const id = crypto.randomUUID();
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
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const merged = { ...e, ...updates };
      // Keep memories in sync if image changes
      if ('image' in updates && merged.isPast) {
        const imgs = [merged.image, ...(merged.memories ?? []).slice(1)].filter(Boolean) as string[];
        merged.memories = imgs;
      }
      return merged;
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (isSupabaseConfigured) {
      supabase.from("events").delete().eq("id", id)
        .then(({ error }) => { if (error) console.error("[Supabase] deleteEvent:", error.message); });
    }
  }, []);

  const addAnnouncement = useCallback((text: string) => {
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
    setActivePuzzle({ ...puzzle, id, timerRunning: false });
    setPuzzleSolved(false);
    setSolvedTeams([]);  // fresh puzzle, clear all team lock-outs
    if (isSupabaseConfigured) {
      supabase.from("puzzles").update({ is_active: false }).eq("is_active", true)
        .then(() => {
          supabase.from("puzzles").upsert({
            id, question: puzzle.question, hint: puzzle.hint || "",
            answer: puzzle.answer, points: puzzle.points, is_active: true,
            time_limit: puzzle.timeLimit,
            scheduled_for: puzzle.scheduledFor ? new Date(puzzle.scheduledFor).toISOString() : null,
            timer_running: false,
            started_at: null,
            expires_at: null,
          }).then(({ error }) => { if (error) console.error("[Supabase] launchPuzzle:", error.message); });
        });
    }
  }, []);

  const startPuzzleTimer = useCallback(() => {
    setActivePuzzle(prev => {
      if (!prev) return prev;
      const startedAt = Date.now();
      const expiresAt = startedAt + prev.timeLimit * 1000;
      const updated = { ...prev, timerRunning: true, startedAt, expiresAt };
      // Persist timer state to Supabase so all clients see it live
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({
          timer_running: true,
          started_at: new Date(startedAt).toISOString(),
          expires_at: new Date(expiresAt).toISOString(),
        }).eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] startPuzzleTimer:", error.message); });
      }
      return updated;
    });
  }, []);

  // ── Auto-schedule: start timer when scheduledFor time arrives ──────────
  useEffect(() => {
    if (!activePuzzle?.scheduledFor || activePuzzle.timerRunning) return;
    const msUntil = activePuzzle.scheduledFor - Date.now();
    if (msUntil <= 0) { startPuzzleTimer(); return; }
    const timer = setTimeout(startPuzzleTimer, msUntil);
    return () => clearTimeout(timer);
  }, [activePuzzle?.id, activePuzzle?.scheduledFor, activePuzzle?.timerRunning, startPuzzleTimer]);

  const stopPuzzleTimer = useCallback(() => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const prev = activePuzzleRef.current;
    if (prev) {
      const stopEntry: CompletedPuzzle = {
        id: prev.id, question: prev.question, answer: prev.answer,
        points: prev.points, completedAt: Date.now(), timedOut: true,
      };
      setCompletedPuzzles(h => [stopEntry, ...h]);
      persistCompleted(stopEntry);
      // Deactivate in Supabase so Realtime doesn't restore the puzzle on all clients
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({ is_active: false, timer_running: false })
          .eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] stopPuzzleTimer deactivate:", error.message); });
      }
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
          console.log('[Arena] updateScore →', team.name, 'delta:', delta, 'newScore:', team.score);
          supabase.from("teams").update({ score: team.score }).eq("id", teamId)
            .then(({ error }) => {
              if (error) {
                console.error("[Supabase] updateScore FAILED:", error.message, error);
              } else {
                console.log("[Supabase] updateScore OK →", team.name, team.score);
              }
            });
        }
      }
      return updated;
    });
  }, []);

  const solvePuzzle = useCallback((solver?: { playerName: string; teamName: string; teamLogo: string; teamId: string }) => {
    // One correct entry per team — silently ignore duplicates
    if (solver?.teamId && solvedTeams.includes(solver.teamId)) return;

    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const prev = activePuzzleRef.current;
    if (prev) {
      // Linear decay: multiplier goes 2.0→0.5 over 60s
      const elapsed = prev.startedAt ? (Date.now() - prev.startedAt) / 1000 : 0;
      const multiplier = Math.max(0.5, 2 - (1.5 * elapsed / 60));
      const awardedPoints = Math.round((prev.points * multiplier) / 10) * 10;

      const solvedEntry: CompletedPuzzle = {
        id: prev.id, question: prev.question, answer: prev.answer,
        points: prev.points, awardedPoints,
        solvedBy: solver?.teamName, solvedByLogo: solver?.teamLogo,
        solvedByPlayer: solver?.playerName, solvedByTeamId: solver?.teamId,
        completedAt: Date.now(), timedOut: false,
      };
      setCompletedPuzzles(h => [solvedEntry, ...h]);
      persistCompleted(solvedEntry);

      // Auto-add to scoreboard
      if (solver?.teamId) {
        updateScore(solver.teamId, awardedPoints);
        setSolvedTeams(prev => [...prev, solver!.teamId]);
      }

      // Option A: close puzzle immediately — PuzzleModal caches last puzzle for its success state
      setActivePuzzle(null);
      // Deactivate in Supabase so Realtime doesn't restore the puzzle on all clients
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({ is_active: false, timer_running: false })
          .eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] solvePuzzle deactivate:", error.message); });
      }
    }
    setPuzzleSolved(true);
  }, [solvedTeams, updateScore]);

  return (
    <ArenaContext.Provider value={{
      teams, events, announcements, activePuzzle, completedPuzzles, puzzleSolved, solvedTeams, stageMode,
      addEvent, updateEvent, deleteEvent, addAnnouncement, deleteAnnouncement,
      launchPuzzle, startPuzzleTimer, stopPuzzleTimer, solvePuzzle, updateScore, setStageModeActive,
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
