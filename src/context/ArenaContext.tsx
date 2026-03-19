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
  cancelPuzzle: () => void;
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
  const [stageMode, setStageModeRaw] = useState(false);

  // ── Stage mode: cross-browser sync via arena_settings ─────────────────
  // Admin toggle writes to DB → Realtime fires on all player browsers
  const setStageModeActive = useCallback((active: boolean) => {
    setStageModeRaw(active);
    if (isSupabaseConfigured && !isMockMode) {
      supabase.from('arena_settings').update({ stage_mode: active, updated_at: new Date().toISOString() }).eq('id', 1)
        .then(({ error }) => { if (error) console.error('[Supabase] setStageModeActive:', error.message); });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || isMockMode) return;
    // Load initial value
    supabase.from('arena_settings').select('stage_mode').eq('id', 1).single()
      .then(({ data }) => { if (data) setStageModeRaw(data.stage_mode); });
    // Realtime subscription — fires on all browsers when admin toggles
    const ch = supabase.channel('arena-settings-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arena_settings' },
        (payload) => { setStageModeRaw((payload.new as any).stage_mode); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Stable refs so callbacks don't go stale
  const activePuzzleRef = useRef<Puzzle | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { activePuzzleRef.current = activePuzzle; }, [activePuzzle]);

  // ── Sync from hooks ───────────────────────────────────────────────────
  useEffect(() => {
    if (rawTeams.length) {
      setTeams(rawTeams.map(t => ({
        id: t.id, name: t.name, logo: (t as any).logo ?? "⚡",
        score: t.score,
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
      // DB status → ArenaEvent status  ('upcoming' → 'scheduled', 'live' → 'live', 'completed' → 'completed')
      const dbStatus = e.status as string;
      const status: ArenaEvent['status'] =
        dbStatus === 'live' ? 'live' :
        dbStatus === 'completed' ? 'completed' :
        'scheduled';
      const resolvedIsPast = status === 'completed' || isPast;

      // Results: prefer DB (live events), fall back to EVENT_DETAILS seed data
      const dbResults: ArenaEvent['results'] = Array.isArray(e.results) && e.results.length > 0
        ? e.results
        : (resolvedIsPast ? (d?.results?.map((r: any) => ({ place: r.place, pts: r.pts, teamName: r.teamName, teamLogo: r.teamLogo })) ?? []) : []);

      // Memories: merge DB media_urls + legacy image_url
      const dbMediaUrls: string[] = Array.isArray(e.media_urls) ? e.media_urls : [];
      const memories: string[] | undefined = resolvedIsPast
        ? [e.image || e.image_url, ...dbMediaUrls].filter(Boolean).concat(
            dbMediaUrls.length === 0 ? (d?.memories ?? []) : []
          ).filter(Boolean) as string[]
        : undefined;

      return {
        id: e.id, title: e.title, category: e.category, date: e.date,
        description: e.description, isPast: resolvedIsPast,
        image: e.image || e.image_url || undefined,
        emoji: e.data?.emoji ?? d?.emoji ?? "📅", format: e.data?.format ?? d?.format ?? "",
        duration: e.data?.duration ?? d?.duration ?? "",
        rules: e.data?.rules ?? d?.rules ?? [],
        pointsBreakdown: e.data?.pointsBreakdown ?? d?.pointsBreakdown ?? [], hidden: false,
        status,
        // Winner: prefer DB columns, fall back to EVENT_DETAILS seed data
        winnerTeamId: e.winner_team_id ?? undefined,
        winnerTeamName: e.winner_team_name ?? (resolvedIsPast ? d?.winner : undefined),
        winnerTeamLogo: e.winner_team_logo ?? (resolvedIsPast ? d?.winnerLogo : undefined),
        winnerPoints: e.winner_points ?? (resolvedIsPast ? (d?.pointsBreakdown?.[0]?.pts) : undefined),
        completedAt: resolvedIsPast ? (e.completed_at ? new Date(e.completed_at).getTime() : new Date(e.date).getTime()) : undefined,
        results: dbResults,
        memories,
      };
    };
    const past = highlightEvents.map(e => mapEvent(e, true));
    const upcoming = upcomingEvents.map(e => mapEvent(e, false));
    // Also handle live events: useEvents splits by status, live events go into upcomingEvents
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
    // Completion data lives in the puzzles table itself.
    // When a puzzle ends, is_active=false + completed_at=now() are set in one UPDATE.
    supabase
      .from('puzzles')
      .select('*')
      .eq('is_active', false)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) { console.error('[Supabase] completed puzzles fetch:', error.message); return; }
        if (data && data.length > 0) {
          setCompletedPuzzles(data.map(rowToCompleted));
        }
      });
  }

  // ── Load completed puzzle history on mount ────────────────────────────
  // Reads from puzzles WHERE completed_at IS NOT NULL (completion data is written
  // directly onto the puzzle row via the same UPDATE that deactivates it).
  // New completions are picked up by the re-fetch effect below when activePuzzle→null.
  useEffect(() => {
    if (!isSupabaseConfigured || isMockMode) return;
    fetchCompletedPuzzles();
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
      if (isSupabaseConfigured) {
        // Write completion data in the same UPDATE that deactivates the puzzle
        supabase.from("puzzles").update({
          is_active: false, timer_running: false,
          completed_at: new Date().toISOString(), timed_out: true,
        }).eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] expire:", error.message); });
      }
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
    const id = crypto.randomUUID();
    setEvents(prev => [{ ...event, id }, ...prev]);
    if (isSupabaseConfigured) {
      supabase.from("events").insert({
        id, title: event.title, description: event.description || "",
        category: event.category || "General", date: event.date,
        status: event.isPast ? "completed" : "upcoming",
        image_url: event.image || null, cloudinary_public_id: null, participants: null,
        results: [], media_urls: [],
        winner_team_id: null, winner_team_name: null, winner_team_logo: null, winner_points: null,
        data: {
          emoji: event.emoji,
          format: event.format,
          duration: event.duration,
          rules: event.rules,
          pointsBreakdown: event.pointsBreakdown,
        },
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
    // Persist to Supabase — map ArenaEvent fields → DB columns
    if (isSupabaseConfigured && !isMockMode) {
      const dbUpdate: Record<string, any> = {};
      if ('title'       in updates) dbUpdate.title = updates.title;
      if ('description' in updates) dbUpdate.description = updates.description;
      if ('category'    in updates) dbUpdate.category = updates.category;
      if ('date'        in updates) dbUpdate.date = updates.date;
      if ('image'       in updates) dbUpdate.image_url = updates.image ?? null;
      if ('status'      in updates) {
        dbUpdate.status = updates.status === 'scheduled' ? 'upcoming' : (updates.status ?? 'upcoming');
      }
      if ('isPast' in updates) {
        // isPast=true without explicit status → completed
        if (updates.isPast && !('status' in updates)) dbUpdate.status = 'completed';
        if (!updates.isPast && !('status' in updates)) dbUpdate.status = 'upcoming';
      }
      if ('winnerTeamId'   in updates) dbUpdate.winner_team_id   = updates.winnerTeamId   ?? null;
      if ('winnerTeamName' in updates) dbUpdate.winner_team_name = updates.winnerTeamName ?? null;
      if ('winnerTeamLogo' in updates) dbUpdate.winner_team_logo = updates.winnerTeamLogo ?? null;
      if ('winnerPoints'   in updates) dbUpdate.winner_points    = updates.winnerPoints   ?? null;
      if ('results'        in updates) dbUpdate.results   = updates.results   ?? [];
      // Persist rich detail fields into the data jsonb column.
      // handleSave always passes ALL fields, so use updates directly.
      // Partial-update callers (status, winner, etc.) never include these keys → skipped.
      const dataFields = ['emoji', 'format', 'duration', 'rules', 'pointsBreakdown'] as const;
      if (dataFields.some(k => k in updates)) {
        dbUpdate.data = {
          emoji:           updates.emoji,
          format:          updates.format,
          duration:        updates.duration,
          rules:           updates.rules,
          pointsBreakdown: updates.pointsBreakdown,
        };
      }
      if ('memories'       in updates) {
        // memories[0] is cover image_url; rest go into media_urls
        const mems = updates.memories ?? [];
        dbUpdate.image_url  = mems[0] ?? null;
        dbUpdate.media_urls = mems.slice(1);
      }
      if (Object.keys(dbUpdate).length > 0) {
        supabase.from('events').update(dbUpdate).eq('id', id)
          .then(({ error }) => { if (error) console.error('[Supabase] updateEvent:', error.message); });
      }
    }
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
    if (isSupabaseConfigured) {
      // Don't optimistically update — realtime INSERT fires immediately and updates state
      // via useAnnouncements → rawAnnouncements → setAnnouncements, avoiding duplicates
      supabase.from("announcements").insert({ id, text, emoji: "📢" })
        .then(({ error }) => { if (error) console.error("[Supabase] addAnnouncement:", error.message); });
    } else {
      // Mock mode only — no realtime, so optimistic update is the only path
      setAnnouncements(prev => [{ id, text, timestamp: new Date().toISOString() }, ...prev]);
    }
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (isSupabaseConfigured) {
      supabase.from("announcements").delete().eq("id", id)
        .then(({ error }) => { if (error) console.error("[Supabase] deleteAnnouncement:", error.message); });
    }
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
            solved_by: null, solved_by_logo: null, solved_by_player: null,
            solved_by_team_id: null, awarded_points: null,
            completed_at: null, timed_out: false,
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
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({
          is_active: false, timer_running: false,
          completed_at: new Date().toISOString(), timed_out: true,
        }).eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] stopPuzzleTimer:", error.message); });
      }
    }
    setActivePuzzle(null);
    setPuzzleSolved(false);
  }, []);

  const cancelPuzzle = useCallback(() => {
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
    const prev = activePuzzleRef.current;
    if (prev && isSupabaseConfigured) {
      supabase.from("puzzles").update({ is_active: false, timer_running: false })
        .eq("id", prev.id)
        .then(({ error }) => { if (error) console.error("[Supabase] cancelPuzzle:", error.message); });
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

      // Auto-add to scoreboard
      if (solver?.teamId) {
        updateScore(solver.teamId, awardedPoints);
        setSolvedTeams(prev => [...prev, solver!.teamId]);
      }

      // Deactivate + write all completion data in ONE UPDATE.
      // This reuses the same authenticated path that already works for score + puzzle deactivation.
      setActivePuzzle(null);
      if (isSupabaseConfigured) {
        supabase.from("puzzles").update({
          is_active: false, timer_running: false,
          solved_by: solver?.teamName ?? null,
          solved_by_logo: solver?.teamLogo ?? null,
          solved_by_player: solver?.playerName ?? null,
          solved_by_team_id: solver?.teamId ?? null,
          awarded_points: awardedPoints,
          completed_at: new Date().toISOString(),
          timed_out: false,
        }).eq("id", prev.id)
          .then(({ error }) => { if (error) console.error("[Supabase] solvePuzzle:", error.message); });
      }
    }
    setPuzzleSolved(true);
  }, [solvedTeams, updateScore]);

  return (
    <ArenaContext.Provider value={{
      teams, events, announcements, activePuzzle, completedPuzzles, puzzleSolved, solvedTeams, stageMode,
      addEvent, updateEvent, deleteEvent, addAnnouncement, deleteAnnouncement,
      launchPuzzle, startPuzzleTimer, stopPuzzleTimer, cancelPuzzle, solvePuzzle, updateScore, setStageModeActive,
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
