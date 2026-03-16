import { useState, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { useAuth } from "@/context/AuthContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onOpenPuzzle: () => void;
}

function fmtScheduled(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// Returns ms until event start (0 if no time specified or already started)
function msUntilEventStart(dateStr: string): number {
  if (!dateStr.includes('T')) return 0;
  const start = new Date(dateStr).getTime();
  return Math.max(0, start - Date.now());
}

// Format seconds as HH:MM — for day-of countdown (not MM:SS)
function formatHHMM(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// True if event date (local time) is today or in the future — guards against
// events whose date was edited to the past but DB status not yet set to completed
function isNotBeforeToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return eventDay >= todayDay;
}

export function DynamicCallout({ onOpenPuzzle }: Props) {
  const { activePuzzle, events, completedPuzzles } = useArena();
  const { profile } = useAuth();
  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);

  // ── Scheduled-but-pending countdown ──
  // Only show the banner within 30 minutes of the scheduled time (not days in advance)
  const SCHEDULE_REVEAL_MS = 30 * 60 * 1000;
  const isScheduledPending = !!(
    activePuzzle?.scheduledFor &&
    !activePuzzle.timerRunning &&
    activePuzzle.scheduledFor - Date.now() <= SCHEDULE_REVEAL_MS
  );
  const [schedSecsLeft, setSchedSecsLeft] = useState<number>(0);
  const [dayOfExpanded, setDayOfExpanded] = useState(false);
  useEffect(() => {
    if (!isScheduledPending || !activePuzzle?.scheduledFor) return;
    const tick = () => setSchedSecsLeft(Math.max(0, Math.ceil((activePuzzle.scheduledFor! - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isScheduledPending, activePuzzle?.scheduledFor]);

  // ── Live challenge banner ──
  const showChallenge = !!(activePuzzle?.timerRunning);

  // ── Solved card (5 min after a correct solve) ──
  const recentSolve = completedPuzzles[0] && !completedPuzzles[0].timedOut ? completedPuzzles[0] : null;
  // Derived synchronously — true in the SAME render that activePuzzle becomes null,
  // so AnimatePresence transitions directly challenge → solved with no jitter.
  const showSolvedCard = !!(recentSolve && (Date.now() - recentSolve.completedAt) < 5 * 60 * 1000);
  // Schedule a single re-render when the 5-min window closes so the card fades out
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (!recentSolve) return;
    const remaining = 5 * 60 * 1000 - (Date.now() - recentSolve.completedAt);
    if (remaining <= 0) return;
    const t = setTimeout(() => forceRender(n => n + 1), remaining);
    return () => clearTimeout(t);
  }, [recentSolve?.id]);

  const myTeamWon = !!(recentSolve?.solvedByTeamId && recentSolve.solvedByTeamId === profile?.team_id);

  // ── Next event (fallback) ──
  const showingPuzzleState = showChallenge || isScheduledPending || showSolvedCard;
  const nextEvent = !showingPuzzleState
    ? [...events]
        .filter(e => !e.isPast && !e.hidden && isNotBeforeToday(e.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  // ── Live event (admin marked event 'live') ──
  const liveEvent = !showingPuzzleState
    ? events.find(e => e.status === 'live' && !e.hidden) ?? null
    : null;

  // ── Today countdown to event start ──
  const [startSecsLeft, setStartSecsLeft] = useState<number>(0);
  const todayEventWithTime = nextEvent && isToday(nextEvent.date) && nextEvent.date.includes('T') ? nextEvent : null;
  useEffect(() => {
    if (!todayEventWithTime) return;
    const tick = () => setStartSecsLeft(Math.max(0, Math.ceil(msUntilEventStart(todayEventWithTime.date) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [todayEventWithTime?.id, todayEventWithTime?.date]);

  // Reset expand state whenever the active next-event changes
  useEffect(() => { setDayOfExpanded(false); }, [nextEvent?.id]);

  if (!showingPuzzleState && !liveEvent && !nextEvent) return null;

  const timerUrgent  = secondsLeft !== null && secondsLeft <= 15;
  const timerWarning = secondsLeft !== null && secondsLeft > 15 && secondsLeft <= 30;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-1">
      <AnimatePresence mode="wait">
        {isScheduledPending && activePuzzle ? (
          /* ── Scheduled: countdown to puzzle start ── */
          <motion.div
            key="scheduled"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(43 93% 60% / 0.8), hsl(288 80% 62% / 0.4), hsl(43 93% 60% / 0.4))" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(43 93% 60% / 0.08), transparent 70%)" }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: "hsl(43 93% 60% / 0.12)", border: "1px solid hsl(43 93% 60% / 0.3)", boxShadow: "0 0 18px hsl(43 93% 60% / 0.22)" }}
                    >
                      🧩
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold/80">
                          ⏳ Puzzle Incoming
                        </span>
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" />
                      </div>
                      <p className="font-carnival text-xl text-foreground tracking-wide">
                        Get ready — challenge drops in
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Scheduled for {fmtScheduled(activePuzzle.scheduledFor!)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2"
                    >
                      <Clock className="h-4 w-4 text-gold" />
                      <span className="font-carnival text-3xl tabular-nums tracking-widest text-gold">
                        {formatCountdown(schedSecsLeft)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : showChallenge ? (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(288 80% 62%), hsl(38 92% 50%), hsl(288 80% 62%))" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(288 80% 62% / 0.12) 0%, transparent 70%)",
                    animation: "callout-pulse 2.4s ease-in-out infinite",
                  }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "hsl(288 80% 62% / 0.15)",
                        boxShadow: "0 0 20px hsl(288 80% 62% / 0.4)",
                        animation: "callout-pulse 2.4s ease-in-out infinite",
                      }}
                    >
                      <Zap className="h-6 w-6" style={{ color: "hsl(288 80% 72%)" }} />
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold tracking-[0.18em] uppercase"
                          style={{ color: "hsl(288 80% 72%)" }}
                        >
                          ⚡ Challenge Live Now
                        </span>
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(288_80%_72%)] animate-pulse" />
                      </div>
                      <p className="font-carnival text-xl text-foreground tracking-wide">
                        {activePuzzle.question.length > 60
                          ? activePuzzle.question.slice(0, 60) + "…"
                          : activePuzzle.question}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Answer correctly to earn{" "}
                        <span className="font-bold text-gold">{activePuzzle.points} pts</span>{" "}
                        for your team
                      </p>
                      {activePuzzle.hint && (
                        <p className="mt-1 text-xs text-muted-foreground/70 italic">
                          💡 {activePuzzle.hint}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: timer + CTA */}
                  <div className="flex items-center gap-3 shrink-0">
                    {secondsLeft !== null && (
                      <div
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                          timerUrgent
                            ? "border-destructive/40 bg-destructive/10"
                            : timerWarning
                            ? "border-amber-400/40 bg-amber-400/10"
                            : "border-gold/25 bg-gold/10"
                        }`}
                      >
                        <Clock
                          className={`h-3.5 w-3.5 ${
                            timerUrgent
                              ? "text-destructive animate-pulse"
                              : timerWarning
                              ? "text-amber-400"
                              : "text-gold"
                          }`}
                        />
                        <span
                          className={`font-carnival text-xl tabular-nums tracking-widest ${
                            timerUrgent
                              ? "text-destructive"
                              : timerWarning
                              ? "text-amber-400"
                              : "text-gold"
                          }`}
                        >
                          {formatCountdown(secondsLeft)}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={onOpenPuzzle}
                      className="self-start rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 sm:self-center"
                      style={{
                        background: "linear-gradient(135deg, hsl(288 80% 58%), hsl(270 70% 48%))",
                        boxShadow: "0 4px 20px hsl(288 80% 62% / 0.45)",
                      }}
                    >
                      Enter Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : showSolvedCard && recentSolve ? (
          /* ── Solved card: show winner for 5 min ── */
          <motion.div
            key="solved"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="relative rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(288 80% 62%), hsl(43 93% 60% / 0.5), hsl(288 80% 62%))" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(288 80% 62% / 0.10), transparent 70%)" }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{
                        background: "hsl(288 80% 62% / 0.15)",
                        border: "1px solid hsl(288 80% 62% / 0.35)",
                        boxShadow: "0 0 20px hsl(288 80% 62% / 0.3)",
                      }}
                    >
                      {recentSolve.solvedByLogo ?? "🏆"}
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold tracking-[0.18em] uppercase"
                          style={{ color: "hsl(288 80% 72%)" }}
                        >
                          🧩 Puzzle Solved!
                        </span>
                      </div>
                      <p className="font-carnival text-xl text-foreground tracking-wide">
                        {myTeamWon
                          ? "Your team nailed it! 🎉"
                          : `${recentSolve.solvedBy} got there first!`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {recentSolve.solvedByPlayer && `${recentSolve.solvedByPlayer} · `}
                        {recentSolve.solvedBy}
                      </p>
                    </div>
                  </div>
                  {/* Right: pts earned */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className="flex flex-col items-center rounded-xl px-5 py-3"
                      style={{ background: "hsl(288 80% 62% / 0.10)", border: "1px solid hsl(288 80% 62% / 0.25)" }}
                    >
                      <span
                        className="font-carnival text-2xl font-bold tabular-nums leading-none"
                        style={{ color: "hsl(288 80% 72%)" }}
                      >
                        +{recentSolve.awardedPoints ?? recentSolve.points}
                      </span>
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wider mt-0.5"
                        style={{ color: "hsl(288 80% 62% / 0.6)" }}
                      >
                        pts earned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : liveEvent ? (
          /* ── Event is LIVE ── */
          <motion.div
            key="live-event"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(0 80% 55%), hsl(0 70% 45%), hsl(0 80% 55%))" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(0 80% 55% / 0.10) 0%, transparent 70%)" }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: "hsl(0 80% 55% / 0.15)", border: "1px solid hsl(0 80% 55% / 0.4)", boxShadow: "0 0 20px hsl(0 80% 55% / 0.35)" }}
                    >
                      {liveEvent.emoji || "🎉"}
                    </div>
                    <div>
                      <div className="mb-0.5 flex items-center gap-2">
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-red-400"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Event is Live Now
                        </motion.span>
                      </div>
                      <p className="font-carnival text-xl text-foreground tracking-wide">{liveEvent.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {liveEvent.category}{liveEvent.format ? ` · ${liveEvent.format}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shrink-0"
                    style={{ background: "hsl(0 80% 55% / 0.10)", border: "1px solid hsl(0 80% 55% / 0.3)", color: "hsl(0 80% 70%)" }}
                  >
                    Check the scoreboard ↓
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : nextEvent && isToday(nextEvent.date) ? (
          /* ── Day-of: compact card with collapsible details ── */
          <motion.div
            key="next-event-today"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(43 93% 60% / 0.8), hsl(288 80% 62% / 0.5) 50%, hsl(43 93% 60% / 0.4))" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
                <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 0% 50%, hsl(43 93% 60% / 0.07) 0%, transparent 70%)" }} />
                <div className="relative">
                  {/* Compact header row */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: "hsl(43 93% 60% / 0.12)", border: "1px solid hsl(43 93% 60% / 0.3)", boxShadow: "0 0 20px hsl(43 93% 60% / 0.2)" }}>
                        {nextEvent!.emoji || "📅"}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold">🎉 Today</span>
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={{ background: "hsl(43 93% 60% / 0.12)", color: "hsl(43 93% 70%)", border: "1px solid hsl(43 93% 60% / 0.25)" }}>
                            {nextEvent!.category}
                          </span>
                        </div>
                        <p className="font-carnival text-xl text-foreground tracking-wide leading-tight">{nextEvent!.title}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <Calendar className="h-3 w-3 text-gold/60" />
                          <span className="text-foreground/60">
                            {new Date(nextEvent!.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          {nextEvent!.duration && (
                            <><span className="text-border/60">·</span><span>{nextEvent!.duration}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {nextEvent!.pointsBreakdown?.[0]?.pts && (
                        <div className="flex flex-col items-center rounded-xl px-4 py-2.5"
                          style={{ background: "hsl(43 93% 60% / 0.08)", border: "1px solid hsl(43 93% 60% / 0.2)" }}>
                          <span className="font-carnival text-lg font-bold text-gold tabular-nums leading-none">{nextEvent!.pointsBreakdown[0].pts}</span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-gold/60 mt-0.5">pts to win</span>
                        </div>
                      )}
                      {/* Countdown to start time (only when event has a specific time set) */}
                      {todayEventWithTime && startSecsLeft > 0 && (
                        <div className="flex flex-col items-center rounded-xl px-4 py-2.5"
                          style={{ background: "hsl(43 93% 60% / 0.08)", border: "1px solid hsl(43 93% 60% / 0.2)" }}>
                          <span className="font-carnival text-lg font-bold text-gold tabular-nums leading-none tracking-widest">
                            {formatHHMM(startSecsLeft)}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-gold/60 mt-0.5">starts in</span>
                        </div>
                      )}
                      {todayEventWithTime && startSecsLeft === 0 && (
                        <span className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 border border-red-400/20">
                          Starting now!
                        </span>
                      )}
                      <button
                        onClick={() => setDayOfExpanded(v => !v)}
                        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors"
                        style={{ background: "hsl(43 93% 60% / 0.10)", border: "1px solid hsl(43 93% 60% / 0.25)", color: "hsl(43 93% 70%)" }}
                      >
                        {dayOfExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {dayOfExpanded ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </div>
                  {/* Collapsible details */}
                  <AnimatePresence initial={false}>
                    {dayOfExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 grid gap-6 border-t pt-5 sm:grid-cols-2" style={{ borderColor: "hsl(43 93% 60% / 0.15)" }}>
                          <div>
                            {nextEvent!.format && (
                              <span className="mb-2 inline-block rounded-full bg-accent/50 px-2.5 py-0.5 text-xs text-muted-foreground">{nextEvent!.format}</span>
                            )}
                            {nextEvent!.description && (
                              <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">{nextEvent!.description}</p>
                            )}
                            {nextEvent!.rules?.length > 0 && (
                              <>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Rules</p>
                                <ul className="space-y-1.5">
                                  {nextEvent!.rules.map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                                      <span className="mt-0.5 shrink-0 text-[10px] font-bold text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                                      {rule}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                          {nextEvent!.pointsBreakdown?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Points</p>
                              <div className="flex flex-wrap gap-2">
                                {nextEvent!.pointsBreakdown.map((row, i) => (
                                  <div key={i} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                                    style={{ borderColor: "hsl(43 93% 60% / 0.25)", background: "hsl(43 93% 60% / 0.08)" }}>
                                    <span>{row.place}</span>
                                    <span className="font-bold text-gold">+{row.pts} pts</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ) : nextEvent ? (
          <motion.div
            key="next-event"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, hsl(288 80% 62% / 0.7), hsl(43 93% 60% / 0.5) 50%, hsl(288 80% 62% / 0.3))" }}
            >
              <div
                className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5"
              >
                {/* Ambient glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 70% 80% at 0% 50%, hsl(288 80% 62% / 0.09) 0%, transparent 70%)" }}
                />
                {/* Moving shimmer */}
                <div
                  className="pointer-events-none absolute -inset-y-4 left-[-20%] w-1/4 -skew-x-12 opacity-[0.05]"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(43 93% 60%), transparent)", animation: "callout-pulse 4s ease-in-out infinite" }}
                />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    {/* Emoji badge */}
                    <div
                      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                      style={{
                        background: "hsl(288 80% 62% / 0.12)",
                        border: "1px solid hsl(288 80% 62% / 0.25)",
                        boxShadow: "0 0 20px hsl(288 80% 62% / 0.2)",
                      }}
                    >
                      {nextEvent!.emoji || "📅"}
                    </div>

                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "hsl(288 80% 72%)" }}>
                          ✦ Next Up
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: "hsl(288 80% 62% / 0.12)", color: "hsl(288 80% 78%)", border: "1px solid hsl(288 80% 62% / 0.25)" }}
                        >
                          {nextEvent!.category}
                        </span>
                      </div>
                      <p className="font-carnival text-xl text-foreground tracking-wide leading-tight">
                        {nextEvent!.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" style={{ color: "hsl(288 80% 62% / 0.6)" }} />
                        <span className="text-foreground/60">
                          {new Date(nextEvent!.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {nextEvent!.duration && (
                          <>
                            <span className="text-border/60">·</span>
                            <span>{nextEvent!.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 shrink-0">
                    {nextEvent!.pointsBreakdown?.[0]?.pts && (
                      <div
                        className="flex flex-col items-center rounded-xl px-4 py-2.5"
                        style={{ background: "hsl(43 93% 60% / 0.08)", border: "1px solid hsl(43 93% 60% / 0.2)" }}
                      >
                        <span className="font-carnival text-lg font-bold text-gold tabular-nums leading-none">
                          {nextEvent!.pointsBreakdown[0].pts}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-gold/60 mt-0.5">pts to win</span>
                      </div>
                    )}
                    <div
                      className="hidden sm:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
                      style={{ background: "hsl(288 80% 62% / 0.10)", border: "1px solid hsl(288 80% 62% / 0.25)", color: "hsl(288 80% 78%)" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "hsl(288 80% 72%)" }} />
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
