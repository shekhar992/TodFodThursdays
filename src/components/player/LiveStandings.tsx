import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

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
  const { teams } = useArena();

  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Live Standings</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left w-16">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center w-20">Wins</th>
              <th className="px-4 py-3 text-right w-28">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => {
              const rank = i + 1;
              const isGold = rank === 1;
              return (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border-b border-border/50 last:border-0 transition-colors ${
                    isGold ? "bg-gold/5" : "hover:bg-accent/30"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`font-display text-sm font-bold ${
                        isGold ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {String(rank).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-base">
                        {team.logo}
                      </span>
                      <span className={`font-display font-semibold text-sm ${isGold ? "text-gold" : ""}`}>
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-muted-foreground">{team.wins}W</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-display text-lg font-bold tabular-nums ${
                        isGold ? "text-gold" : "text-foreground"
                      }`}
                    >
                      <AnimatedScore value={team.score} />
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
