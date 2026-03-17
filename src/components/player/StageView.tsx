import { AnnouncementTicker } from "./AnnouncementTicker";
import { useArena } from "@/context/ArenaContext";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, X } from "lucide-react";

const MEDALS = ["🥇", "🥈", "🥉"];
const GOLD = "hsl(43 93% 60%)";
const CONFETTI = ["#FFD700", "#FF6B6B", "#4ECDC4", "#C084FC", "#FCD34D", "#34D399"];

/* ── Floating gold particles ───────────────────────────── */
function Particles() {
  const particles = useMemo(() =>
    [...Array(22)].map((_, i) => ({
      id: i,
      left: `${4 + Math.random() * 92}%`,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      opacity: 0.15 + Math.random() * 0.45,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: GOLD,
            boxShadow: `0 0 ${p.size * 2}px ${GOLD}`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-110vh", opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ── Score roll-up ─────────────────────────────────────── */
function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

/* ── Shimmer sweep title ───────────────────────────────── */
function ShimmerTitle({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className="relative inline-block overflow-hidden">
      <span className={className} style={style}>{children}</span>
      <motion.span
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ backgroundPosition: "200% center" }}
        animate={{ backgroundPosition: "-200% center" }}
        transition={{ duration: 1.4, delay: 1.0, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Pulsing LIVE badge ────────────────────────────────── */
function LiveBadge() {
  return (
    <motion.div
      className="mt-4 flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10"
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.span
        className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0"
        animate={{ boxShadow: ["0 0 6px 0px hsl(0 80% 60%)", "0 0 14px 4px hsl(0 80% 60%)", "0 0 6px 0px hsl(0 80% 60%)"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">Live Now</span>
    </motion.div>
  );
}

/* ── Animated light rays ───────────────────────────────── */
function LightRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-1/2 origin-top"
          style={{
            width: "2px",
            height: "65vh",
            background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
            transform: `translateX(-50%) rotate(${-42 + i * 12}deg)`,
          }}
          initial={{ opacity: 0.02 }}
          animate={{ opacity: [0.02, 0.055, 0.02] }}
          transition={{
            duration: 2.5 + i * 0.4,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Spotlight vignette (pure CSS, zero JS) ───────────── */
function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ background: "radial-gradient(ellipse 85% 85% at 50% 38%, transparent 30%, hsl(248 32% 2% / 0.75) 100%)" }}
    />
  );
}

/* ── Broadcast corner ornaments (pure CSS) ───────────── */
function CornerOrnaments() {
  const positions = [
    "top-4 left-4 border-t border-l",
    "top-4 right-4 border-t border-r",
    "bottom-16 left-4 border-b border-l",
    "bottom-16 right-4 border-b border-r",
  ] as const;
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {positions.map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 border-gold/20 ${cls}`} />
      ))}
    </div>
  );
}

/* ── One-shot confetti burst (fires once, no repeat) ──── */
function ConfettiBurst() {
  const pieces = useMemo(() =>
    [...Array(20)].map((_, i) => {
      const angle = (i / 20) * 360;
      const rad   = (angle * Math.PI) / 180;
      const dist  = 80 + Math.random() * 200;
      return {
        id: i,
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist - 60,
        rotate: Math.random() * 720 - 360,
        color: CONFETTI[i % CONFETTI.length],
        w: i % 3 === 2 ? 4 : 5 + Math.random() * 4,
        h: i % 3 === 2 ? 12 : 5 + Math.random() * 4,
        br: i % 3 === 1 ? "50%" : "2px",
        delay: i * 0.018,
      };
    }), []);
  return (
    <div className="pointer-events-none absolute top-[22%] left-1/2 z-20">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ width: p.w, height: p.h, background: p.color, borderRadius: p.br, top: 0, left: 0 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, rotate: p.rotate, scale: 0.2 }}
          transition={{ duration: 1.5, delay: 0.3 + p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Rules slide-up sheet ─────────────────────────────── */
function RulesSheet({ rules, title, onClose }: { rules: string[]; title: string; onClose: () => void }) {
  const filled = rules.filter(r => r.trim());
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-gold/20 bg-[hsl(248_32%_5%)] max-h-[58vh] overflow-y-auto"
      style={{ boxShadow: "0 -24px 60px hsl(248 32% 2% / 0.95)" }}
    >
      <div className="mx-auto max-w-3xl px-8 pt-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60 mb-0.5">Event Rules</p>
            <p className="font-carnival text-xl tracking-wide text-foreground">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {filled.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No rules defined for this event.</p>
          ) : filled.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-start gap-4"
            >
              <span
                className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: `${GOLD}22`, color: GOLD }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-foreground/85">{rule}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
export function StageView() {
  const { teams, events } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const liveEvent = events.find(e => e.status === 'live')
    ?? events.find(e => !e.isPast && !e.hidden)
    ?? null;
  const dividerControls = useAnimation();
  const [rulesOpen, setRulesOpen] = useState(false);
  const leader = sorted[0];
  const gap    = sorted.length > 1 ? (sorted[0]?.score ?? 0) - (sorted[1]?.score ?? 0) : 0;

  useEffect(() => {
    dividerControls.start({ scaleX: 1, opacity: 1, transition: { delay: 0.5, duration: 0.8, ease: "easeOut" } });
  }, [dividerControls]);

  return (
    <div className="min-h-screen bg-[hsl(248_32%_4%)] flex flex-col overflow-hidden relative">

      {/* Announcement ticker — pinned at top, above all layers */}
      <div className="relative z-30">
        <AnnouncementTicker />
      </div>

      {/* Scanline texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
          opacity: 0.6,
        }}
      />

      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 rounded-full"
          style={{
            width: "900px",
            height: "560px",
            background: `radial-gradient(ellipse, hsl(43 93% 60% / 0.12) 0%, transparent 70%)`,
            filter: "blur(48px)",
          }}
        />
        <LightRays />
      </div>

      {/* Particles */}
      <Particles />

      {/* Spotlight vignette */}
      <Vignette />

      {/* Broadcast corner ornaments */}
      <CornerOrnaments />

      {/* One-shot confetti on mount */}
      <ConfettiBurst />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-14 pb-8 px-8 text-center">
        {liveEvent && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.12, 1], opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, opacity: { duration: 0.3 } }}
            className="text-7xl mb-5 block"
            style={{ filter: "drop-shadow(0 0 30px hsl(43 93% 60% / 0.6))" }}
          >
            {liveEvent.emoji}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          style={{
            fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
            lineHeight: 1.1,
          }}
        >
          <ShimmerTitle
            className="font-carnival uppercase tracking-[0.08em] bg-gradient-to-b from-amber-200 via-gold to-amber-500 bg-clip-text text-transparent"
          >
            {liveEvent?.title ?? "TFT Arena — Season 2"}
          </ShimmerTitle>
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <LiveBadge />
        </motion.div>

        {/* Category / format chips */}
        {liveEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mt-3 flex items-center gap-2 flex-wrap justify-center"
          >
            <span
              className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: `${GOLD}18`, color: GOLD }}
            >
              {liveEvent.category}
            </span>
            {liveEvent.duration && <span className="text-[11px] text-muted-foreground">· {liveEvent.duration}</span>}
            {liveEvent.format   && <span className="text-[11px] text-muted-foreground">· {liveEvent.format}</span>}
          </motion.div>
        )}
      </div>

      {/* Gold divider — expands from centre */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-8">
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={dividerControls}
          style={{ transformOrigin: "center" }}
        />
      </div>

      {/* Leaderboard */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Season Standings
          </p>
          {gap > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-[10px] text-muted-foreground"
            >
              {leader?.logo} leading by <span className="font-bold" style={{ color: GOLD }}>+{gap} pts</span>
            </motion.p>
          )}
        </div>
        <div className="space-y-3">
          {sorted.map((team, i) => {
            const isFirst = i === 0;
            const isTop3  = i < 3;
            const medal   = MEDALS[i];
            const color   = team.color ?? "#00E5FF";

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -32, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: 0.15 + i * 0.07,
                  type: "spring",
                  stiffness: 220,
                  damping: 20,
                }}
                className="relative flex items-center gap-5 rounded-2xl px-6 py-4 overflow-hidden"
                style={{
                  background: isTop3
                    ? `linear-gradient(135deg, ${color}1C 0%, hsl(248 32% 8%) 100%)`
                    : "hsl(248 32% 7%)",
                  border: `1px solid ${isTop3 ? color + "38" : "hsl(248 32% 13%)"}`,
                }}
              >
                {/* Leader pulsing glow — animate via CSS custom property trick */}
                {isFirst && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ boxShadow: [`0 0 18px 0px ${color}22`, `0 0 36px 6px ${color}44`, `0 0 18px 0px ${color}22`] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Left accent bar (top 3) */}
                {isTop3 && (
                  <motion.div
                    className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                    style={{ background: color }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35, ease: "easeOut" }}
                  />
                )}

                {/* Crown floating above #1 row */}
                {isFirst && (
                  <motion.span
                    className="absolute -top-4 left-14 text-xl"
                    initial={{ y: -10, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 14 }}
                    style={{ filter: "drop-shadow(0 0 10px hsl(43 93% 60% / 0.9))" }}
                  >
                    👑
                  </motion.span>
                )}

                {/* Medal / rank */}
                <div className="w-10 shrink-0 text-center">
                  {medal ? (
                    <motion.span
                      className="text-3xl block"
                      animate={i === 0
                        ? { rotate: [-3, 3, -3] }
                        : { rotate: 0 }}
                      transition={i === 0
                        ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        : {}}
                    >
                      <span className="relative inline-block">
                        {medal}
                        <span
                          className="pointer-events-none absolute -top-2 -right-1 text-[11px] leading-none text-gold"
                          style={{ animation: `medal-sparkle ${2.3 + i * 0.6}s ease-in-out infinite` }}
                        >✦</span>
                        <span
                          className="pointer-events-none absolute -bottom-1 -left-1.5 text-[8px] leading-none text-amber-300/80"
                          style={{ animation: `medal-sparkle ${3.0 + i * 0.6}s ease-in-out infinite 0.9s` }}
                        >✦</span>
                      </span>
                    </motion.span>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  )}
                </div>

                {/* Logo */}
                <motion.span
                  className="text-3xl shrink-0"
                  animate={isFirst
                    ? { scale: [1, 1.12, 1] }
                    : { scale: 1 }}
                  transition={isFirst
                    ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    : {}}
                >
                  {team.logo}
                </motion.span>

                {/* Name */}
                <span
                  className="flex-1 font-carnival tracking-wide"
                  style={{
                    fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
                    color: isTop3 ? color : "hsl(220 15% 70%)",
                  }}
                >
                  {team.name}
                </span>

                {/* Score */}
                <span
                  className="font-carnival tabular-nums"
                  style={{
                    fontSize: "clamp(1.4rem, 3vw, 2rem)",
                    color: isFirst ? GOLD : isTop3 ? color : "hsl(220 15% 60%)",
                  }}
                >
                  <AnimatedScore value={team.score} />
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">pts</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Branding footer + ticker */}
      <div className="relative z-10 mt-auto">
        <motion.div
          className="flex items-center justify-center py-3 gap-3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/20" />
          <span className="font-carnival text-xs tracking-[0.3em] uppercase text-gold/50">
            TFT Arena · Season 2
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/20" />
        </motion.div>
        <AnnouncementTicker />
      </div>

      {/* Rules toggle — fixed bottom-right corner */}
      {liveEvent && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => setRulesOpen(v => !v)}
          className="fixed bottom-14 right-5 z-40 flex items-center gap-2 rounded-full border border-gold/25 bg-[hsl(248_32%_8%)] px-4 py-2 text-xs font-bold text-gold/70 hover:text-gold hover:border-gold/50 hover:bg-[hsl(248_32%_12%)] shadow-lg transition-all"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Rules
        </motion.button>
      )}

      {/* Rules sheet */}
      <AnimatePresence>
        {rulesOpen && liveEvent && (
          <RulesSheet
            rules={liveEvent.rules ?? []}
            title={liveEvent.title}
            onClose={() => setRulesOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
