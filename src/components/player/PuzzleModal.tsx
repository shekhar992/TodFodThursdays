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
  const { activePuzzle, puzzleSolved, solvePuzzle, teams, solvedTeams } = useArena();
  const { profile } = useAuth();
  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [dismissCountdown, setDismissCountdown] = useState<number | null>(null);

  // Rule 1: is this user's team already locked in?
  const myTeamId = profile?.team_id ?? "";
  const teamAlreadySolved = myTeamId !== "" && solvedTeams.includes(myTeamId);

  // Rule 3: bonus window = first 30s after timer starts
  const elapsedSeconds =
    activePuzzle?.timerRunning && secondsLeft !== null
      ? activePuzzle.timeLimit - secondsLeft
      : null;
  const inBonusWindow = elapsedSeconds !== null && elapsedSeconds <= 30;

  const timerUrgent = secondsLeft !== null && secondsLeft <= 30;
  const timerWarning = secondsLeft !== null && secondsLeft > 30 && secondsLeft <= 60;

  useEffect(() => {
    if (open) {
      setAnswer("");
      setShowHint(false);
      setError(false);
      setDismissCountdown(null);
    }
  }, [open, activePuzzle?.id]);

  // Rule 4: 5s auto-dismiss after correct answer
  useEffect(() => {
    if (!puzzleSolved || !open) return;
    setDismissCountdown(5);
    const interval = setInterval(() => {
      setDismissCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onClose();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzleSolved, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = useCallback(() => {
    if (!activePuzzle) return;
    if (answer.trim().toLowerCase() === activePuzzle.answer.toLowerCase()) {
      const team = teams.find(t => t.id === profile?.team_id);
      // Compute bonus locally for display (context computes it independently for score)
      const bonus =
        activePuzzle.timerRunning &&
        activePuzzle.startedAt !== undefined &&
        Date.now() - activePuzzle.startedAt <= 30_000;
      setEarnedPoints(bonus ? activePuzzle.points * 2 : activePuzzle.points);
      solvePuzzle({
        playerName: profile?.display_name ?? "Anonymous",
        teamName: team?.name ?? "Unknown Team",
        teamLogo: team?.logo ?? "?",
        teamId: profile?.team_id ?? "",
      });
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#38BDF8", "#F8C03B", "#ffffff"],
      });
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }, [answer, activePuzzle, solvePuzzle, profile, teams]);

  if (!activePuzzle) return null;

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
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold">Puzzle Challenge</span>
                {/* Base points */}
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {activePuzzle.points} PTS
                </span>
                {/* Rule 3: bonus window badge */}
                {inBonusWindow && (
                  <span className="rounded-full border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold animate-pulse">
                    ⚡ 2× BONUS
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
                    <Clock className={`h-3 w-3 ${
                      timerUrgent ? "text-destructive animate-pulse" :
                      timerWarning ? "text-amber-400" : "text-gold"
                    }`} />
                    <span className={`font-carnival text-base tabular-nums ${
                      timerUrgent ? "text-destructive" :
                      timerWarning ? "text-amber-400" : "text-gold"
                    }`}>
                      {formatCountdown(secondsLeft)}
                    </span>
                  </div>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Already solved by this team (Rule 1) ── */}
            {teamAlreadySolved && !puzzleSolved ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="font-display text-base font-bold">Already Answered</span>
                <span className="text-sm text-muted-foreground text-center max-w-xs">
                  Your team already locked in an answer. Only one submission per team counts — sit tight and see how others do!
                </span>
              </motion.div>
            ) : puzzleSolved ? (
              /* ── Correct! state with 5s auto-dismiss (Rule 4) ── */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <span className="font-display text-lg font-bold">Correct!</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    +{earnedPoints} points earned for your team
                  </span>
                  {earnedPoints > (activePuzzle?.points ?? 0) && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                      ⚡ 2× Bonus!
                    </span>
                  )}
                </div>
                {/* 5s countdown bar */}
                {dismissCountdown !== null && (
                  <div className="mt-2 flex flex-col items-center gap-1.5 w-full max-w-[180px]">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      Closing in {dismissCountdown}s…
                    </span>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: dismissCountdown, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <>
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
                    className={`flex-1 rounded-md border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                      error ? "border-destructive" : "border-border"
                    }`}
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
