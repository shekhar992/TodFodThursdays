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

              return (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border-b border-border/50 last:border-0 transition-colors ${rowBg}`}
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
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-display text-lg font-bold tabular-nums ${
                      isGold ? "text-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-foreground"
                    }`}>
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
