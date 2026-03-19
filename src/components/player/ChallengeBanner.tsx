import { useState, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";

interface Props {
  onOpen: () => void;
}

function fmtScheduled(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export function ChallengeBanner({ onOpen }: Props) {
  const { activePuzzle, puzzleSolved } = useArena();
  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);

  // Show scheduled countdown within 30 min of scheduledFor
  const SCHEDULE_REVEAL_MS = 30 * 60 * 1000;
  const isScheduledPending = !!(
    activePuzzle?.scheduledFor &&
    !activePuzzle.timerRunning &&
    activePuzzle.scheduledFor - Date.now() <= SCHEDULE_REVEAL_MS
  );
  const [schedSecsLeft, setSchedSecsLeft] = useState<number>(0);
  useEffect(() => {
    if (!isScheduledPending || !activePuzzle?.scheduledFor) return;
    const tick = () => setSchedSecsLeft(Math.max(0, Math.ceil((activePuzzle.scheduledFor! - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isScheduledPending, activePuzzle?.scheduledFor]);

  const isRunning = activePuzzle?.timerRunning ?? false;
  const show = !!activePuzzle && !puzzleSolved;

  const timerUrgent  = secondsLeft !== null && secondsLeft <= 15;
  const timerWarning = secondsLeft !== null && secondsLeft > 15 && secondsLeft <= 30;

  return (
    <AnimatePresence mode="wait">
      {show && isScheduledPending ? (
        /* ── Scheduled: live countdown to auto-start ── */
        <motion.div key="scheduled" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 pt-5 pb-1">
          <div className="relative rounded-2xl p-px"
            style={{ background: "linear-gradient(135deg, hsl(43 93% 60% / 0.8), hsl(288 80% 62% / 0.4), hsl(43 93% 60% / 0.4))" }}>
            <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
              <div className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(43 93% 60% / 0.08), transparent 70%)" }} />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: "hsl(43 93% 60% / 0.12)", border: "1px solid hsl(43 93% 60% / 0.3)", boxShadow: "0 0 18px hsl(43 93% 60% / 0.22)" }}>
                    🧩
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold/80">⏳ Puzzle Incoming</span>
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" />
                    </div>
                    <p className="font-carnival text-xl text-foreground tracking-wide">Get ready — challenge drops in</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Scheduled for {fmtScheduled(activePuzzle!.scheduledFor!)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 shrink-0">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="font-carnival text-3xl tabular-nums tracking-widest text-gold">
                    {formatCountdown(schedSecsLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : show && isRunning ? (
        /* ── Timer running: live challenge ── */
        <motion.div key="running" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 pt-5 pb-1">
          <div className="relative rounded-2xl p-px"
            style={{ background: "linear-gradient(135deg, hsl(288 80% 62%), hsl(38 92% 50%), hsl(288 80% 62%))" }}>
            <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
              <div className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(288 80% 62% / 0.12) 0%, transparent 70%)", animation: "callout-pulse 2.4s ease-in-out infinite" }} />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "hsl(288 80% 62% / 0.15)", boxShadow: "0 0 20px hsl(288 80% 62% / 0.4)", animation: "callout-pulse 2.4s ease-in-out infinite" }}>
                    <Zap className="h-6 w-6" style={{ color: "hsl(288 80% 72%)" }} />
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "hsl(288 80% 72%)" }}>⚡ Challenge Live Now</span>
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(288_80%_72%)] animate-pulse" />
                    </div>
                    <p className="font-carnival text-xl text-foreground tracking-wide">
                      {activePuzzle!.question.length > 60 ? activePuzzle!.question.slice(0, 60) + "…" : activePuzzle!.question}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Answer correctly to earn <span className="font-bold text-gold">{activePuzzle!.points} pts</span> for your team
                    </p>
                    {activePuzzle!.hint && (
                      <p className="mt-1 text-xs text-muted-foreground/70 italic">💡 {activePuzzle!.hint}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {secondsLeft !== null && (
                    <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 ${timerUrgent ? "border-destructive/40 bg-destructive/10" : timerWarning ? "border-amber-400/40 bg-amber-400/10" : "border-gold/25 bg-gold/10"}`}>
                      <Clock className={`h-3.5 w-3.5 ${timerUrgent ? "text-destructive animate-pulse" : timerWarning ? "text-amber-400" : "text-gold"}`} />
                      <span className={`font-carnival text-xl tabular-nums tracking-widest ${timerUrgent ? "text-destructive" : timerWarning ? "text-amber-400" : "text-gold"}`}>
                        {formatCountdown(secondsLeft)}
                      </span>
                    </div>
                  )}
                  <button onClick={onOpen}
                    className="self-start rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 sm:self-center"
                    style={{ background: "linear-gradient(135deg, hsl(288 80% 58%), hsl(270 70% 48%))", boxShadow: "0 4px 20px hsl(288 80% 62% / 0.45)" }}>
                    Enter Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : show ? (
        /* ── Manually launched, waiting for admin to start timer ── */
        <motion.div key="ready" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 pt-5 pb-1">
          <div className="relative rounded-2xl p-px"
            style={{ background: "linear-gradient(135deg, hsl(43 93% 60% / 0.7), hsl(43 93% 60% / 0.3), hsl(43 93% 60% / 0.7))" }}>
            <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
              <div className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(43 93% 60% / 0.07), transparent 70%)" }} />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: "hsl(43 93% 60% / 0.12)", border: "1px solid hsl(43 93% 60% / 0.3)", boxShadow: "0 0 14px hsl(43 93% 60% / 0.2)" }}>
                    🧩
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold/80">⏳ Get Ready</span>
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse" />
                    </div>
                    <p className="font-carnival text-xl text-foreground tracking-wide">A puzzle challenge is about to begin!</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Worth <span className="font-bold text-gold">{activePuzzle!.points} pts</span> — admin starts the timer when everyone is ready
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 shrink-0">
                  <Clock className="h-4 w-4 text-gold" />
                  <span className="font-carnival text-xl tabular-nums tracking-widest text-gold">
                    {formatCountdown(activePuzzle!.timeLimit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
