import { useArena } from "@/context/ArenaContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, Clock } from "lucide-react";

interface Props {
  onOpenPuzzle: () => void;
}

export function DynamicCallout({ onOpenPuzzle }: Props) {
  const { activePuzzle, puzzleSolved, events } = useArena();
  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);

  const showChallenge = activePuzzle && !puzzleSolved;

  const nextEvent = !showChallenge
    ? [...events]
        .filter(e => !e.isPast && !e.hidden)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  if (!showChallenge && !nextEvent) return null;

  const timerUrgent = secondsLeft !== null && secondsLeft <= 30;
  const timerWarning = secondsLeft !== null && secondsLeft > 30 && secondsLeft <= 60;

  // First 30s after timer starts = double-points bonus window
  const elapsedSeconds =
    activePuzzle?.timerRunning && secondsLeft !== null
      ? (activePuzzle.timeLimit - secondsLeft)
      : null;
  const inBonusWindow = elapsedSeconds !== null && elapsedSeconds <= 30;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-1">
      <AnimatePresence mode="wait">
        {showChallenge ? (
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
                    </div>
                  </div>

                  {/* Right: bonus badge + timer + CTA */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* 2× bonus window badge */}
                    {inBonusWindow && (
                      <div
                        className="flex items-center gap-1 rounded-lg border border-gold/50 px-3 py-1.5 text-xs font-bold text-gold"
                        style={{
                          background: "hsl(38 92% 50% / 0.15)",
                          animation: "callout-pulse 1.2s ease-in-out infinite",
                        }}
                      >
                        ⚡ 2× BONUS
                      </div>
                    )}
                    {activePuzzle.timerRunning && secondsLeft !== null && (
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
                    {!activePuzzle.timerRunning && (
                      <span className="text-xs text-muted-foreground">
                        {activePuzzle.timeLimit / 60}min window
                      </span>
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
        ) : (
          <motion.div
            key="next-event"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                  {nextEvent!.emoji || <Calendar className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <div className="mb-0.5 text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                    Next Up
                  </div>
                  <p className="font-display text-sm font-semibold text-foreground">{nextEvent!.title}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(nextEvent!.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {nextEvent!.duration && (
                      <>
                        <span>·</span>
                        <span>{nextEvent!.duration}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                      {nextEvent!.category}
                    </span>
                  </div>
                </div>
              </div>
              <span className="hidden rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground sm:inline">
                Coming soon
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
