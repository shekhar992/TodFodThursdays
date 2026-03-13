import { useState, useEffect, useCallback } from "react";
import { useArena } from "@/context/ArenaContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Send, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PuzzleModal({ open, onClose }: Props) {
  const { activePuzzle, puzzleSolved, solvePuzzle } = useArena();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setAnswer("");
      setShowHint(false);
      setError(false);
    }
  }, [open, activePuzzle?.id]);

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
      solvePuzzle();
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
  }, [answer, activePuzzle, solvePuzzle]);

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold">Puzzle Challenge</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {activePuzzle.points} PTS
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {puzzleSolved ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <span className="font-display text-lg font-bold">Correct!</span>
                <span className="text-sm text-muted-foreground">+{activePuzzle.points} points earned</span>
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
