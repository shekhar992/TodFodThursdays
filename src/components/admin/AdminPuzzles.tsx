import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { Zap } from "lucide-react";

export function AdminPuzzles() {
  const { launchPuzzle, activePuzzle } = useArena();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState("50");
  const [hint, setHint] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;
    launchPuzzle({ question, answer, points: parseInt(points) || 50, hint: hint || undefined });
    setQuestion("");
    setAnswer("");
    setPoints("50");
    setHint("");
  };

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-1">Launch Puzzle</h2>
      <p className="text-xs text-muted-foreground mb-6">Replaces the active puzzle and shows the challenge banner.</p>

      {activePuzzle && (
        <div className="mb-6 rounded-md border border-border/50 bg-secondary/30 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Current puzzle</span>
          <p className="mt-1 text-xs text-foreground/80 italic">"{activePuzzle.question}"</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber resize-none"
            placeholder="Enter the riddle or question..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Answer</label>
            <input
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
              placeholder="Correct answer"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Points</label>
            <input
              type="number"
              value={points}
              onChange={e => setPoints(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Hint (optional)</label>
          <input
            value={hint}
            onChange={e => setHint(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
            placeholder="Optional hint"
          />
        </div>
        <button
          type="submit"
          disabled={!question || !answer}
          className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-amber-foreground transition-colors hover:bg-amber/90 disabled:opacity-40"
        >
          <Zap className="h-4 w-4" />
          Launch Puzzle
        </button>
      </form>
    </div>
  );
}
