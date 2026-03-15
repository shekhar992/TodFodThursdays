import { useState, useEffect, useCallback } from "react";
import { useArena } from "@/context/ArenaContext";
import { useAuth } from "@/context/AuthContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Send, Check, Clock, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PuzzleModal({ open, onClose }: Props) {
  const { activePuzzle, solvePuzzle, teams, solvedTeams } = useArena();
  const { profile } = useAuth();

  const [solvedState, setSolvedState] = useState<{
    earnedPts: number;
    basePts: number;
    teamName: string;
    teamLogo: string;
    playerName: string;
  } | null>(null);

  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(false);

  const myTeamId = profile?.team_id ?? "";
  const teamAlreadySolved = myTeamId !== "" && solvedTeams.includes(myTeamId);

  const elapsedSeconds =
    activePuzzle?.timerRunning && secondsLeft !== null
      ? activePuzzle.timeLimit - secondsLeft
      : null;
  const liveMultiplier = Math.max(0.5, 2 - (1.5 * (elapsedSeconds ?? 0) / 60));
  const timerUrgent = secondsLeft !== null && secondsLeft <= 15;
  const timerWarning = secondsLeft !== null && secondsLeft > 15 && secondsLeft <= 30;

  // Reset local state when opening a fresh puzzle
  useEffect(() => {
    if (open) {
      setAnswer("");
      setShowHint(false);
      setError(false);
      setSolvedState(null);
    }
  }, [open, activePuzzle?.id]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = useCallback(() => {
    if (!activePuzzle) return;
    if (answer.trim().toLowerCase() === activePuzzle.answer.toLowerCase()) {
      const team = teams.find(t => t.id === profile?.team_id);
      const elapsedMs = activePuzzle.startedAt ? Date.now() - activePuzzle.startedAt : 0;
      const mult = Math.max(0.5, 2 - (1.5 * elapsedMs / 1000 / 60));
      const awardedPts = Math.round((activePuzzle.points * mult) / 10) * 10;
      // Capture everything BEFORE calling solvePuzzle (which clears activePuzzle)
      setSolvedState({
        earnedPts: awardedPts,
        basePts: activePuzzle.points,
        teamName: team?.name ?? "Your Team",
        teamLogo: team?.logo ?? "🏆",
        playerName: profile?.display_name ?? "Anonymous",
      });
      solvePuzzle({
        playerName: profile?.display_name ?? "Anonymous",
        teamName: team?.name ?? "Unknown Team",
        teamLogo: team?.logo ?? "?",
        teamId: profile?.team_id ?? "",
      });
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#38BDF8", "#F8C03B", "#ffffff"] });
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }, [answer, activePuzzle, solvePuzzle, profile, teams]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* ── SOLVED ──────────────────────────────────────── */}
            {solvedState ? (
              <div className="relative flex flex-col items-center gap-4 px-8 py-12 text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(288_80%_62%/0.12),transparent)]" />
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: "hsl(288 80% 62% / 0.15)", border: "1px solid hsl(288 80% 62% / 0.3)", boxShadow: "0 0 28px hsl(288 80% 62% / 0.3)" }}
                >
                  <Check className="h-8 w-8" style={{ color: "hsl(288 80% 72%)" }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(288 80% 72%)" }}>
                    Puzzle Solved! 🧩
                  </p>
                  <p className="font-carnival text-2xl text-foreground tracking-wide">
                    {solvedState.teamLogo} {solvedState.teamName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Answered by {solvedState.playerName}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="rounded-full px-4 py-1.5 text-sm font-bold"
                    style={{ background: "hsl(288 80% 62% / 0.12)", color: "hsl(288 80% 72%)", border: "1px solid hsl(288 80% 62% / 0.3)" }}
                  >
                    +{solvedState.earnedPts} pts earned
                  </span>
                  {solvedState.earnedPts > solvedState.basePts && (
                    <span className="rounded-full bg-gold/15 border border-gold/25 px-3 py-1 text-xs font-bold text-gold">
                      ⚡ Speed bonus!
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-lg px-6 py-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, hsl(288 80% 58%), hsl(270 70% 48%))", boxShadow: "0 4px 16px hsl(288 80% 62% / 0.4)" }}
                >
                  Close
                </button>
              </div>

            ) : teamAlreadySolved ? (
              /* ── ALREADY ANSWERED ───────────────────────────── */
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-sm font-bold">Puzzle Challenge</span>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="font-display text-base font-bold">Already Answered</span>
                  <span className="text-sm text-muted-foreground text-center max-w-xs">
                    Your team already locked in an answer. Sit tight and see how things shake out!
                  </span>
                </div>
              </div>

            ) : activePuzzle ? (
              /* ── LIVE PUZZLE ────────────────────────────────── */
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">Puzzle Challenge</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {activePuzzle.points} PTS
                    </span>
                    {activePuzzle.timerRunning && (
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                        liveMultiplier >= 1.5 ? "border-gold/50 bg-gold/15 text-gold animate-pulse" :
                        liveMultiplier >= 1.0 ? "border-amber-400/50 bg-amber-400/15 text-amber-400" :
                        "border-border/50 bg-muted/50 text-muted-foreground"
                      }`}>
                        ⚡ {liveMultiplier.toFixed(1)}×
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {activePuzzle.timerRunning && secondsLeft !== null && (
                      <div className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 ${
                        timerUrgent ? "border-destructive/50 bg-destructive/10" :
                        timerWarning ? "border-amber-400/50 bg-amber-400/10" :
                        "border-gold/30 bg-gold/10"
                      }`}>
                        <Clock className={`h-3 w-3 ${timerUrgent ? "text-destructive animate-pulse" : timerWarning ? "text-amber-400" : "text-gold"}`} />
                        <span className={`font-carnival text-base tabular-nums ${timerUrgent ? "text-destructive" : timerWarning ? "text-amber-400" : "text-gold"}`}>
                          {formatCountdown(secondsLeft)}
                        </span>
                      </div>
                    )}
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <blockquote className="border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/90 italic">
                  "{activePuzzle.question}"
                </blockquote>

                {activePuzzle.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showHint ? "Hide hint" : "Show hint"}
                  </button>
                )}

                <AnimatePresence>
                  {showHint && activePuzzle.hint && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-1 text-xs text-primary/70 overflow-hidden"
                    >
                      💡 {activePuzzle.hint}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex gap-2">
                  <input
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Type your answer..."
                    className={`flex-1 rounded-md border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${error ? "border-destructive" : "border-border"}`}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-destructive"
                  >
                    Incorrect — try again!
                  </motion.p>
                )}
              </div>

            ) : (
              /* ── EXPIRED while modal was open ───────────────── */
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Time's up — puzzle closed</p>
                <button onClick={onClose} className="mt-2 rounded-lg border border-border px-5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

