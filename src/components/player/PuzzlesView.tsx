import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";
import { Lock, Trophy, Calendar, Clock, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// How far ahead to start teasing an upcoming puzzle
const TEASER_WINDOW_MS  = 5 * 60 * 60 * 1000;  // 5 hours  → soft teaser card
const COUNTDOWN_WINDOW_MS = 30 * 60 * 1000;     // 30 min   → live M:SS countdown

interface Props {
  onOpenPuzzle: () => void;
}

const RULES = [
  {
    icon: "🔒",
    title: "One Entry Per Team",
    body: "Only the first correct answer from each team counts. If a teammate already locked it in, you'll see a 'team answered' state — no double-dipping.",
  },
  {
    icon: "⚡",
    title: "Speed Bonus",
    body: "Answer fast to earn more. At the start you get 2× base points. The multiplier decays linearly to 0.5× over 60 seconds — the faster you answer, the more you score.",
  },
  {
    icon: "📊",
    title: "Auto Scoreboard",
    body: "Nail it and points hit your scoreboard instantly. No manual admin step — the system records the winner and updates the standings in real time.",
  },
  {
    icon: "♾️",
    title: "Unlimited Retries",
    body: "Wrong answer? Try again. There are no penalties for incorrect guesses — just keep firing until the clock runs out.",
  },
  {
    icon: "⏱️",
    title: "Admin Controls the Clock",
    body: "The puzzle window is set by the admin (typically 60 seconds). Once the timer expires, no more submissions accepted.",
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCompletedAt(ms: number) {
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtScheduled(ms: number) {
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

function formatCountdownSecs(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PuzzlesView({ onOpenPuzzle }: Props) {
  const { activePuzzle, puzzleSolved, completedPuzzles } = useArena();

  // Pre-reveal countdown for scheduled puzzles
  const [scheduledSecsLeft, setScheduledSecsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!activePuzzle?.scheduledFor) { setScheduledSecsLeft(null); return; }
    const update = () => {
      const ms = activePuzzle.scheduledFor! - Date.now();
      setScheduledSecsLeft(ms > 0 ? Math.ceil(ms / 1000) : 0);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [activePuzzle?.scheduledFor]);

  const msUntil = activePuzzle?.scheduledFor ? activePuzzle.scheduledFor - Date.now() : null;

  // Full live countdown — only when < 30 min away and timer not yet running
  const isPending = !!(
    activePuzzle?.scheduledFor &&
    !activePuzzle.timerRunning &&
    msUntil !== null && msUntil > 0 &&
    msUntil <= COUNTDOWN_WINDOW_MS
  );
  // Soft teaser — between 30 min and 5 hours away
  const isTeaser = !!(
    activePuzzle?.scheduledFor &&
    !activePuzzle.timerRunning &&
    msUntil !== null && msUntil > COUNTDOWN_WINDOW_MS &&
    msUntil <= TEASER_WINDOW_MS
  );

  // Recent win card — shows for 5 min after a puzzle is solved
  // Derived synchronously so it appears in the same render cycle as activePuzzle → null
  const recentWin = completedPuzzles[0] && !completedPuzzles[0].timedOut ? completedPuzzles[0] : null;
  const showRecentWin = !!(recentWin && (Date.now() - recentWin.completedAt) < 5 * 60 * 1000);
  // Force a re-render when the 5-min window closes
  const [, forceRender] = useState(0);
  useEffect(() => {
    if (!recentWin) return;
    const remaining = 5 * 60 * 1000 - (Date.now() - recentWin.completedAt);
    if (remaining <= 0) return;
    const timer = setTimeout(() => forceRender(n => n + 1), remaining);
    return () => clearTimeout(timer);
  }, [recentWin?.id]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-12">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 mb-1">Mid-Week Challenge</p>
        <h2 className="font-carnival text-3xl tracking-wide bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">
          Puzzles
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Fast, sharp, and high-stakes. One puzzle drops mid-week. Your team gets one shot to solve it.
        </p>
      </div>

      {/* Live / Scheduled challenge CTA — or fallback states */}
      {activePuzzle ? (
        isPending ? (
          /* ── < 30 min: live countdown ── */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-gold/25 bg-card p-6"
            style={{ boxShadow: "0 0 30px hsl(43 93% 60% / 0.08)" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(43_93%_60%/0.07),transparent)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Puzzle Incoming</span>
              </div>
              <p className="font-carnival text-2xl tracking-wide text-foreground mb-1">
                Coming at {fmtScheduled(activePuzzle.scheduledFor!)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">The question drops when the countdown hits zero. Stay sharp.</p>
              <div className="flex items-center gap-3">
                <span className="font-carnival text-5xl tabular-nums tracking-widest text-gold">
                  {formatCountdownSecs(scheduledSecsLeft ?? 0)}
                </span>
                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold/70">
                  +{activePuzzle.points} pts
                </span>
              </div>
            </div>
          </motion.div>
        ) : isTeaser ? (
          /* ── 30 min–5 hrs: soft teaser, no countdown clock ── */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-gold/20 bg-card p-6"
            style={{ boxShadow: "0 0 24px hsl(43 93% 60% / 0.05)" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(43_93%_60%/0.05),transparent)]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gold/70" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold/70">Coming Up</span>
                </div>
                <p className="font-carnival text-xl tracking-wide text-foreground mb-1">
                  Mid-Week Challenge
                </p>
                <p className="text-sm text-muted-foreground">
                  Dropping <span className="font-semibold text-foreground">{fmtScheduled(activePuzzle.scheduledFor!)}</span>
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The question is locked until showtime. Come back when it's time — speed matters.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start sm:items-end gap-2">
                <span className="rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
                  +{activePuzzle.points} pts
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  <Zap className="h-3 w-3" /> Speed bonus applies
                </span>
              </div>
            </div>
          </motion.div>
        ) : activePuzzle.timerRunning ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-magenta/30 bg-card p-6"
            style={{ boxShadow: "0 0 40px hsl(288 80% 62% / 0.12)" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(288_80%_62%/0.10),transparent)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-magenta animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-magenta">Live Now</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Active Challenge</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {activePuzzle.question}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                    +{activePuzzle.points} pts
                  </span>
                  {puzzleSolved && (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                      ✓ Solved
                    </span>
                  )}
                </div>
                {!puzzleSolved && (
                  <button
                    onClick={onOpenPuzzle}
                    className="rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white shadow-[0_0_20px_hsl(288_80%_62%/0.4)] transition-all hover:shadow-[0_0_28px_hsl(288_80%_62%/0.6)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Enter Now →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : null /* puzzle exists but > 5 hrs away — fall through to placeholder */
      ) : showRecentWin ? (
        /* ── Recent win card (fades after 5 min) ── */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative overflow-hidden rounded-2xl border border-gold/25 bg-card p-6"
          style={{ boxShadow: "0 0 30px hsl(43 93% 60% / 0.10)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(43_93%_60%/0.07),transparent)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xl">
              {recentWin.solvedByLogo ?? "🏆"}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Puzzle Solved!</p>
              <p className="text-sm font-semibold text-foreground">
                {recentWin.solvedBy ?? "A team"} won · <span className="text-gold">+{recentWin.awardedPoints ?? recentWin.points} pts</span>
              </p>
              {recentWin.solvedByPlayer && (
                <p className="text-xs text-muted-foreground mt-0.5">Answered by {recentWin.solvedByPlayer}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground italic line-clamp-1">"{recentWin.question}"</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── No active puzzle placeholder ── */
        <div className="rounded-2xl border border-border/60 bg-card/50 p-8 text-center">
          <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No active puzzle right now</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Check back mid-week — a fresh challenge drops every Thursday.</p>
        </div>
      )}

      {/* How it works */}
      <section>
        <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-foreground">How It Works</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <span className="text-xl mb-2 block">{rule.icon}</span>
              <p className="text-xs font-semibold text-foreground mb-1">{rule.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{rule.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Past puzzles */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Past Puzzles</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {completedPuzzles.length}
          </span>
        </div>
        {completedPuzzles.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">No completed puzzles yet</p>
          </div>
        ) : (
        <div className="space-y-2">
          {completedPuzzles.map((pz, i) => (
            <motion.div
              key={pz.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/60 bg-card px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                    "{pz.question}"
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatCompletedAt(pz.completedAt)}
                    </span>
                    {pz.awardedPoints !== undefined ? (
                      <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        {pz.awardedPoints} pts awarded
                      </span>
                    ) : (
                      <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        {pz.points} pts
                      </span>
                    )}
                    {!pz.timedOut && (
                      <span className="text-xs text-muted-foreground">
                        Answer: <span className="font-medium text-foreground">{pz.answer}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {pz.timedOut ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                      ⏰ Timed Out
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full border border-gold/25 px-2.5 py-1.5 text-xs">
                      <Trophy className="h-3 w-3 text-gold" />
                      <span className="text-muted-foreground">
                        {pz.solvedByLogo} {pz.solvedByPlayer ? `${pz.solvedByPlayer} · ` : ""}{pz.solvedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
