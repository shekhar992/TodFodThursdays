import { useArena } from "@/context/ArenaContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { categoryColors } from "@/data/mockData";

function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display}</span>;
}

export function LiveStandings() {
  const { teams, events, completedPuzzles } = useArena();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-carnival text-xl tracking-wide text-gold">Live Standings</h2>
        <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-gold/15 bg-card shadow-[0_0_30px_hsl(43_93%_60%/0.06)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/10 text-xs uppercase tracking-wider text-muted-foreground bg-gold/[0.03]">
              <th className="px-4 py-3 text-left w-16">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center w-20">Wins</th>
              <th className="px-4 py-3 text-right w-28">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => {
              const rank     = i + 1;
              const isGold   = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              const leftGlow = isGold
                ? { boxShadow: "inset 3px 0 0 hsl(43 93% 60%)" }
                : isSilver
                ? { boxShadow: "inset 3px 0 0 #a8b3c8" }
                : isBronze
                ? { boxShadow: "inset 3px 0 0 #cd7f32" }
                : {};
              const rowBg = isGold ? "bg-gold/5" : isSilver ? "bg-secondary/50" : isBronze ? "bg-secondary/30" : "hover:bg-accent/30";
              const isExpanded = expandedId === team.id;

              // Get won events — match by teamId (live) or teamName (mock seeded)
              const wonEvents = events.filter(e =>
                (e.winnerTeamId && e.winnerTeamId === team.id) ||
                (!e.winnerTeamId && e.winnerTeamName && e.winnerTeamName === team.name)
              );

              // Get puzzle wins for this team
              const puzzleWins = completedPuzzles.filter(p =>
                !p.timedOut && (
                  (p.solvedByTeamId && p.solvedByTeamId === team.id) ||
                  (!p.solvedByTeamId && p.solvedBy === team.name)
                )
              );

              const hasExpansion = wonEvents.length > 0 || puzzleWins.length > 0;

              return (
                <>
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`border-b border-border/50 transition-colors ${isExpanded ? "" : "last:border-0"} ${rowBg}`}
                    style={leftGlow}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-display text-sm font-bold ${
                        isGold ? "text-gold animate-flicker-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-muted-foreground"
                      }`}>
                        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : String(rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-md text-base ${
                          isGold ? "bg-gold/15 ring-1 ring-gold/30" : "bg-secondary"
                        }`}>
                          {team.logo}
                        </span>
                        <span className={`font-display font-semibold text-sm ${
                          isGold ? "text-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-foreground"
                        }`}>
                          {team.name}
                        </span>
                        {hasExpansion && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : team.id)}
                            className="ml-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-gold bg-gold/10 hover:bg-gold/20 transition-colors"
                            title={isExpanded ? "Hide details" : "Show wins"}
                          >
                            <Trophy className="h-2.5 w-2.5" />
                            {wonEvents.length + puzzleWins.length}
                            {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${
                        isGold ? "text-amber" : "text-muted-foreground"
                      }`}>{team.wins}W</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-display text-lg font-bold tabular-nums ${
                        isGold ? "text-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-foreground"
                      }`}>
                        <AnimatedScore value={team.score} />
                      </span>
                    </td>
                  </motion.tr>

                  {/* Accordion: event wins timeline */}
                  <AnimatePresence>
                    {isExpanded && hasExpansion && (
                      <tr key={`${team.id}-wins`} className="border-b border-border/50">
                        <td colSpan={4} className="px-0 py-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gold/[0.03] border-t border-gold/10 px-6 py-3 space-y-4">
                              {wonEvents.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-gold/60">
                                    Event Wins · {wonEvents.length}
                                  </p>
                                  {wonEvents.map((ev, j) => {
                                    const catColor = categoryColors[ev.category] ?? "#888";
                                    return (
                                      <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: j * 0.05 }}
                                        className="flex items-center justify-between gap-4"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-base shrink-0">{ev.emoji || "📅"}</span>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium text-foreground/90 truncate">{ev.title}</p>
                                            <span
                                              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                              style={{ background: `${catColor}18`, color: catColor }}
                                            >
                                              {ev.category}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="rounded bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">
                                            +{ev.winnerPoints} pts
                                          </span>
                                          {ev.date && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                              {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                          )}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}

                              {puzzleWins.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-[hsl(288_80%_72%/0.7)]">
                                    Puzzle Wins · {puzzleWins.length}
                                  </p>
                                  {puzzleWins.map((pz, j) => (
                                    <motion.div
                                      key={pz.id}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.05 }}
                                      className="flex items-center justify-between gap-4"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-base shrink-0">🧩</span>
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium text-foreground/90 truncate italic">"{pz.question}"</p>
                                          {pz.solvedByPlayer && (
                                            <p className="text-[9px] text-muted-foreground">by {pz.solvedByPlayer}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="rounded bg-[hsl(288_80%_62%/0.15)] px-2 py-0.5 text-[11px] font-bold text-[hsl(288_80%_72%)]">
                                          +{pz.awardedPoints ?? pz.points} pts
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                          {new Date(pz.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
