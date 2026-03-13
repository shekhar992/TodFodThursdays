import { useArena } from "@/context/ArenaContext";

export function HeroBanner() {
  const { teams } = useArena();
  const leader = [...teams].sort((a, b) => b.score - a.score)[0];

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

      {/* Eyebrow */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/8 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] uppercase text-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
        Thursday Tournaments · Season 2
      </div>

      {/* Main title */}
      <h1
        className="font-carnival relative mx-auto mb-3 leading-none tracking-[0.04em]"
        style={{
          fontSize: "clamp(48px, 10vw, 96px)",
          background: "linear-gradient(160deg, #fff8e1 0%, hsl(43 93% 60%) 45%, hsl(38 92% 50%) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 28px hsl(43 93% 60% / 0.35))",
        }}
      >
        TFT ARENA
      </h1>

      {/* Season badge + ornament */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
        <span className="text-[12px] font-bold tracking-[0.22em] uppercase" style={{ color: "hsl(288 80% 72%)" }}>
          — Season 2 —
        </span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
      </div>

      {/* Tagline */}
      <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
        5 teams · 8 weeks · one champion
      </p>

      {/* Live leader callout */}
      {leader && (
        <div className="inline-flex items-center gap-2.5 rounded-xl border border-gold/20 bg-gold/5 px-5 py-2.5 text-sm shadow-[0_0_20px_hsl(43_93%_60%/0.08)]">
          <span className="text-lg">{leader.logo}</span>
          <span className="font-semibold text-foreground">{leader.name}</span>
          <span className="text-muted-foreground">leading with</span>
          <span className="font-bold tabular-nums text-gold">{leader.score} pts</span>
          <span className="text-gold">👑</span>
        </div>
      )}
    </section>
  );
}
