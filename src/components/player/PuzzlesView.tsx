import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";
import { Lock, Trophy, Calendar, Lightbulb } from "lucide-react";

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
    icon: "📊",
    title: "Auto Scoreboard",
    body: "Nail it and points hit your scoreboard instantly. No manual admin step — the system records the winner and updates the standings in real time.",
  },
  {
    icon: "⚡",
    title: "30s Double Points",
    body: "The first 30 seconds after the timer starts is a BONUS WINDOW. Correct answer in that window = 2× points. Miss it and you earn base points only.",
  },
  {
    icon: "♾️",
    title: "Unlimited Retries",
    body: "Wrong answer? Try again. There are no penalties for incorrect guesses — just keep firing until the clock runs out.",
  },
  {
    icon: "⏱️",
    title: "Admin Controls the Clock",
    body: "The puzzle window is set by the admin (typically a few minutes). Once the timer expires, no more submissions accepted.",
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PuzzlesView({ onOpenPuzzle }: Props) {
  const { activePuzzle, puzzleSolved, completedPuzzles } = useArena();

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

      {/* Live challenge CTA — or "no active puzzle" state */}
      {activePuzzle ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-magenta/30 bg-card p-6"
          style={{ boxShadow: "0 0 40px hsl(288 80% 62% / 0.12)" }}
        >
          {/* Radial glow */}
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
      ) : (
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
                      {formatDate(new Date(pz.completedAt).toISOString())}
                    </span>
                    <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                      {pz.points} pts
                    </span>
                    {!pz.timedOut && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3" />
                        Answer: <span className="font-medium text-foreground ml-0.5">{pz.answer}</span>
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
