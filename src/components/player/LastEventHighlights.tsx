import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import type { ShoutoutRow } from "@/hooks/useShoutouts";

interface Props {
  shoutouts: ShoutoutRow[];
}

export function LastEventHighlights({ shoutouts }: Props) {
  if (shoutouts.length === 0) return null;

  const eventTitle = shoutouts[0]?.eventTitle;
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check overflow whenever shoutouts change or on resize
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const check = () => setCanScrollRight(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener('scroll', check);
    return () => { ro.disconnect(); el.removeEventListener('scroll', check); };
  }, [shoutouts]);

  function scrollRight() {
    railRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-5 pb-1">
      <div
        className="relative rounded-2xl p-px"
        style={{ background: "linear-gradient(135deg, hsl(43 93% 60% / 0.5), hsl(43 93% 60% / 0.15), hsl(43 93% 60% / 0.4))" }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[hsl(248_32%_9%)] px-6 py-5">
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(43 93% 60% / 0.06), transparent 70%)" }}
          />

          {/* Header */}
          <div className="relative mb-4 flex items-center gap-2">
            <span className="text-base leading-none">⭐</span>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold/80">
              Last Event Highlights
            </h2>
            {eventTitle && (
              <span className="text-[10px] text-muted-foreground truncate">· {eventTitle}</span>
            )}
          </div>

          {/* Badge rail */}
          <div className="relative">
            <div
              ref={railRef}
              className="grid gap-3 overflow-x-auto pb-1"
              style={{
                // Fill width evenly when few cards; scroll when many
                gridTemplateColumns: `repeat(${shoutouts.length}, minmax(160px, 1fr))`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {shoutouts.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.28, ease: 'easeOut' }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-2.5 hover:bg-white/[0.055] transition-colors"
                >
                  <span className="text-3xl leading-none">{s.badgeEmoji}</span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground leading-tight">{s.badgeName}</p>
                    <p className="text-xs text-muted-foreground leading-tight truncate">{s.recipientName}</p>
                    {s.teamName && s.recipientType === 'player' && (
                      <p className="text-[11px] text-muted-foreground/60 truncate">{s.teamName}</p>
                    )}
                  </div>
                  {s.points > 0 && (
                    <span className="text-xs font-bold text-gold">+{s.points} pts</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right-side fade + scroll button */}
            {canScrollRight && (
              <>
                <div
                  className="pointer-events-none absolute right-0 top-0 h-full w-20 rounded-r-xl"
                  style={{ background: "linear-gradient(to right, transparent, hsl(248 32% 9% / 0.95))" }}
                />
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
