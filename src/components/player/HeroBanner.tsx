import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";

export function HeroBanner() {
  const { teams } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const leader = sorted[0];
  const second = sorted[1];
  const gap = leader && second ? leader.score - second.score : null;

  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-12 text-center">
      {/* Spotlight cone */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% -10%, hsl(43 93% 60% / 0.14) 0%, transparent 70%)",
        }}
      />
      {/* Side accent glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-8 h-48 w-48 rounded-full blur-3xl opacity-20"
        style={{ background: "hsl(38 92% 50%)", transform: "translate(-50%, 0)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-8 h-48 w-48 rounded-full blur-3xl opacity-20"
        style={{ background: "hsl(288 80% 62%)", transform: "translate(50%, 0)" }}
      />

      {/* Main title */}
      <h1
        className="font-carnival relative mx-auto mb-3 leading-none tracking-[0.04em]"
        style={{
          fontSize: "clamp(48px, 10vw, 96px)",
          color: "hsl(43 93% 62%)",
          textShadow: "0 0 30px hsl(43 93% 55% / 0.7), 0 0 60px hsl(38 92% 45% / 0.35), 0 1px 3px hsl(248 32% 3% / 0.9)",
        }}
      >
        TFT ARENA
      </h1>

      {/* Season badge */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/50" />
        <span className="text-[15px] font-bold tracking-[0.22em] uppercase" style={{ color: "hsl(288 80% 72%)" }}>
          — Season 2 —
        </span>
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/50" />
      </div>

      {/* Tagline */}
      <div className="mx-auto mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <span className="text-sm font-semibold text-gold/90 tabular-nums">{teams.length} teams</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-sm font-bold uppercase tracking-widest text-foreground/90">One Champion</span>
        </div>
        <p className="font-carnival text-lg tracking-wide uppercase" style={{ color: "hsl(43 93% 60%)", textShadow: "0 1px 0 hsl(38 80% 30%)" }}>
          Glory is earned. Not given.
        </p>
      </div>

      {/* Leader callout */}
      {leader && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative inline-flex flex-col items-center gap-1"
        >
          {/* Pulsing glow ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 18px 0px hsl(43 93% 60% / 0.15)",
                "0 0 40px 10px hsl(43 93% 60% / 0.28)",
                "0 0 18px 0px hsl(43 93% 60% / 0.15)",
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="relative flex items-center gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/8 via-amber/5 to-gold/8 px-6 py-4"
            style={{ boxShadow: "0 0 30px hsl(43 93% 60% / 0.12), inset 0 1px 0 hsl(43 93% 60% / 0.15)" }}
          >
            {/* Floating crown */}
            <motion.span
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 10px hsl(43 93% 60% / 0.95))" }}
            >
              👑
            </motion.span>

            {/* Team logo */}
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {leader.logo}
            </motion.span>

            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/50 mb-0.5">
                Current Leader
              </p>
              <p
                className="font-carnival text-xl tracking-wide leading-tight"
                style={{ color: leader.color ?? "hsl(43 93% 60%)" }}
              >
                {leader.name}
              </p>
            </div>

            <div className="h-9 w-px bg-gold/15" />

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/50 mb-0.5">Score</p>
              <p className="font-carnival text-xl tabular-nums text-gold leading-tight">
                {leader.score} pts
              </p>
            </div>
          </div>

          {/* Gap teaser */}
          {gap !== null && gap > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2"
            >
              <span className="text-base">{second?.logo}</span>
              <span className="text-sm font-semibold text-foreground/75">{second?.name}</span>
              <span className="text-xs text-muted-foreground/60">is</span>
              <span className="text-sm font-bold text-amber-400">{gap} pts</span>
              <span className="text-xs text-muted-foreground/60">behind—</span>
              <span className="text-xs font-semibold italic text-amber-300/80">the chase is on ⚡</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}

