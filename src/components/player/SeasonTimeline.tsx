import { useArena } from "@/context/ArenaContext";
import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import { categoryColors } from "@/data/mockData";

interface Props {
  onViewEvents: () => void;
}

const NODE_W = 128; // px per node slot

export function SeasonTimeline({ onViewEvents }: Props) {
  const { events } = useArena();

  const sorted = [...events]
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length === 0) return null;

  // Index of the first non-past event = "Next Up"
  const nextIdx = sorted.findIndex(e => !e.isPast);
  const pastCount = nextIdx === -1 ? sorted.length : nextIdx;
  const totalCount = sorted.length;

  // Line spans between first and last circle centers (each circle is at NODE_W/2 into its slot)
  const lineLeft = NODE_W / 2;           // 64px from container left
  const lineRight = NODE_W / 2;          // 64px from container right
  // Progress fill: from lineLeft, extends by NODE_W per completed event
  const progressFill = nextIdx === -1 ? (totalCount - 1) * NODE_W : nextIdx * NODE_W;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-carnival text-xl tracking-wide text-gold">Season 2</h2>
          <div className="flex items-center gap-2">
            {/* progress bar */}
            <div className="h-1.5 w-28 rounded-full overflow-hidden bg-border/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber"
                initial={{ width: 0 }}
                animate={{ width: `${(pastCount / totalCount) * 100}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {pastCount} <span className="text-muted-foreground/50">/ {totalCount}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onViewEvents}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-gold transition-colors shrink-0 group"
        >
          All events
          <span className="flex items-center gap-0 group-hover:gap-0.5 transition-all">
            <ChevronRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* ── Timeline ── */}
      <div className="relative">
        {/* Scroll-right hint: gradient fade + bouncing chevron */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-4 z-10 flex items-center justify-end pr-1"
          style={{ width: 64, background: "linear-gradient(to right, transparent, hsl(248 32% 5%) 72%)" }}
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronRight className="h-5 w-5 text-gold/75" />
          </motion.div>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div
            className="relative flex"
            style={{ minWidth: `${totalCount * NODE_W}px`, paddingRight: 56 }}
          >
          {/* Full track line */}
          <div
            className="absolute h-px bg-border/40"
            style={{ top: 46, left: lineLeft, right: lineRight }}
          />

          {/* Progress fill */}
          {progressFill > 0 && (
            <motion.div
              className="absolute h-px"
              style={{
                top: 46,
                left: lineLeft,
                background: "linear-gradient(to right, hsl(43 80% 50%), hsl(43 93% 60%))",
              }}
              initial={{ width: 0 }}
              animate={{ width: progressFill }}
              transition={{ duration: 1.3, ease: "easeOut", delay: 0.5 }}
            />
          )}

          {/* Dashed future line overlay */}
          {nextIdx !== -1 && (
            <div
              className="absolute h-px"
              style={{
                top: 46,
                left: lineLeft + progressFill,
                right: lineRight,
                backgroundImage: "repeating-linear-gradient(to right, hsl(var(--border)/0.5) 0, hsl(var(--border)/0.5) 6px, transparent 6px, transparent 12px)",
              }}
            />
          )}

          {/* Nodes */}
          {sorted.map((ev, i) => {
            const isPast = ev.isPast;
            const isNext = i === nextIdx;
            const isFuture = !isPast && !isNext;
            const color = categoryColors[ev.category] ?? "#6B7A95";

            const d = new Date(ev.date);
            const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <motion.div
                key={ev.id}
                className="flex flex-col items-center shrink-0"
                style={{ width: NODE_W }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                {/* ── Emoji (above line) ── */}
                <div className="h-8 flex items-center justify-center">
                  <span
                    className="text-xl leading-none transition-opacity"
                    style={{ opacity: isPast ? 0.45 : isFuture ? 0.35 : 1 }}
                  >
                    {ev.emoji || "📅"}
                  </span>
                </div>

                {/* ── Node circle (on the line) ── */}
                <div className="relative z-10 flex items-center justify-center" style={{ height: 20 }}>
                  {isNext ? (
                    <>
                      {/* glow ping */}
                      <span
                        className="absolute inline-flex h-7 w-7 rounded-full animate-ping opacity-20"
                        style={{ background: "hsl(43 93% 60%)" }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-[3px] border-gold relative z-10"
                        style={{
                          background: "hsl(43 93% 60%)",
                          boxShadow: "0 0 12px hsl(43 93% 60% / 0.6)",
                        }}
                      />
                    </>
                  ) : isPast ? (
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        background: color,
                        borderColor: color,
                        opacity: 0.6,
                      }}
                    />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full border"
                      style={{
                        borderColor: `${color}50`,
                        background: "transparent",
                        opacity: 0.4,
                      }}
                    />
                  )}
                </div>

                {/* ── Label (below line) ── */}
                <div className="mt-2 flex flex-col items-center gap-0.5 px-2 text-center w-full">
                  {isNext && (
                    <span className="rounded-full bg-gold/15 border border-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold leading-tight mb-0.5">
                      Next Up
                    </span>
                  )}
                  <p
                    className="text-[11px] leading-tight line-clamp-2 font-medium"
                    style={{
                      color: isPast
                        ? "hsl(var(--muted-foreground))"
                        : isNext
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground) / 0.55)",
                    }}
                  >
                    {ev.title}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{
                      color: isPast
                        ? "hsl(var(--muted-foreground) / 0.55)"
                        : isNext
                        ? "hsl(var(--muted-foreground))"
                        : "hsl(var(--muted-foreground) / 0.35)",
                    }}
                  >
                    {dateLabel}
                  </p>

                  {/* winner badge for past events */}
                  {isPast && ev.winnerTeamName && (
                    <div
                      className="flex items-center gap-0.5 mt-0.5 text-[9px]"
                      style={{ color: "hsl(43 93% 60% / 0.65)" }}
                    >
                      <Trophy className="h-2 w-2 shrink-0" />
                      <span className="truncate max-w-[80px]">
                        {ev.winnerTeamLogo} {ev.winnerTeamName}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
