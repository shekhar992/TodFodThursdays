import { useState, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { categoryColors } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Trophy, ChevronDown, ChevronUp, Images, Lock } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  emoji?: string;
  format?: string;
  duration?: string;
  rules?: string[];
  pointsBreakdown?: { place: string; pts: number }[];
  isPast?: boolean;
  status?: string;
  startedAt?: number; // ms timestamp — set when event goes live
  // Past-event extras
  winnerTeamName?: string;
  winnerTeamLogo?: string;
  winnerPoints?: number;
  results?: { place: string; pts: number; teamName?: string; teamLogo?: string }[];
  memories?: string[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function parseDurationSecs(str?: string): number | null {
  if (!str) return null;
  const m = str.match(/(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes|hr|hrs|hour|hours|sec|secs)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  if (u.startsWith('h')) return Math.round(n * 3600);
  if (u.startsWith('m')) return Math.round(n * 60);
  return Math.round(n);
}

// Smart event ticker — shows "Starts in" countdown before live, live duration countdown when live
function EventTicker({ targetDate, accentColor, status, startedAt, duration }: {
  targetDate: string; accentColor: string; status?: string; startedAt?: number; duration?: string;
}) {
  const isLive = status === 'live';
  const totalSecs = parseDurationSecs(duration);

  const [display, setDisplay] = useState<{ label: string; value: string; overtime?: boolean } | null>(null);

  useEffect(() => {
    const calc = () => {
      if (isLive && startedAt && totalSecs) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const left = totalSecs - elapsed;
        const abs = Math.abs(left);
        const h = Math.floor(abs / 3600);
        const m = Math.floor((abs % 3600) / 60);
        const s = abs % 60;
        const fmt = h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        setDisplay({ label: left <= 0 ? 'Overtime' : 'Time left', value: left <= 0 ? 'OVERTIME' : fmt, overtime: left <= 0 });
      } else if (!isLive) {
        const diff = new Date(targetDate).getTime() - Date.now();
        if (diff <= 0) { setDisplay(null); return; }
        const total = Math.floor(diff / 1000);
        const d = Math.floor(total / 86400);
        const h = Math.floor((total % 86400) / 3600);
        const mm = Math.floor((total % 3600) / 60);
        const s = total % 60;
        const val = d > 0
          ? `${d}d ${String(h).padStart(2, '0')}h ${String(mm).padStart(2, '0')}m`
          : `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        setDisplay({ label: 'Starts in', value: val });
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate, isLive, startedAt, totalSecs]);

  if (!display) return null;

  const isOvertime = display.overtime;
  const activeColor = isLive ? (isOvertime ? 'hsl(0 75% 65%)' : 'hsl(142 70% 55%)') : accentColor;

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold tabular-nums"
      style={{ background: `${activeColor}12`, border: `1px solid ${activeColor}30` }}
    >
      {isLive && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: isOvertime ? 'hsl(0 75% 65%)' : 'hsl(142 70% 55%)', boxShadow: `0 0 6px ${activeColor}` }}
        />
      )}
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${activeColor}99` }}>
        {display.label}
      </span>
      <span style={{ color: activeColor }}>{display.value}</span>
    </div>
  );
}

function UpcomingEventCard({ title, category, date, description, emoji, format, duration, rules = [], pointsBreakdown = [], status, startedAt }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = (categoryColors as Record<string, string>)[category] ?? "hsl(38 92% 50%)";

  return (
    <motion.div
      layout
      className="relative rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-lg"
      style={{ borderColor: `${accentColor}30` }}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full" style={{ background: accentColor }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji || "🎯"}</span>
            <div>
              <span
                className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: `${accentColor}18`, color: accentColor }}
              >
                {category}
              </span>
              <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(date)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3" />
              {duration || "—"}
            </div>
          </div>
        </div>

        {/* Event ticker — starts-in or live duration countdown */}
        <EventTicker targetDate={date} accentColor={accentColor} status={status} startedAt={startedAt} duration={duration} />

        {/* Expand/collapse rules — moved to top */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium transition-colors mt-3"
          style={{ color: accentColor }}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide rules" : "View rules & scoring"}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {/* Rules */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Rules
                  </p>
                  <ul className="space-y-1.5">
                    {rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                        <span className="mt-0.5 shrink-0 text-[10px] font-bold" style={{ color: accentColor }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Points breakdown */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Points
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pointsBreakdown.map((row, i) => {
                      const p = row.place ?? "";
                      const medal = p.includes("1") ? "🥇"
                        : p.includes("2") ? "🥈"
                        : p.includes("3") ? "🥉"
                        : null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                          style={{ borderColor: `${accentColor}25`, background: `${accentColor}0d` }}
                        >
                          {medal ? (
                            <span className="text-sm leading-none">{medal}</span>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded px-1 py-0.5 text-[9px] font-bold tabular-nums leading-none bg-black/20 border border-white/10 text-muted-foreground min-w-[22px]">
                              {p}
                            </span>
                          )}
                          <span className="font-bold" style={{ color: accentColor }}>
                            +{row.pts} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="rounded-full bg-accent/50 px-2.5 py-0.5 text-xs text-muted-foreground">
            {format || category}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mt-3">{description}</p>
      </div>
    </motion.div>
  );
}

function ComingSoonCard({ title, category, date, emoji }: EventCardProps) {
  const accentColor = (categoryColors as Record<string, string>)[category] ?? "hsl(38 92% 50%)";
  return (
    <div className="relative rounded-xl border bg-card/50 overflow-hidden" style={{ borderColor: `${accentColor}18` }}>
      <div className="h-1 w-full opacity-25" style={{ background: accentColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-25">{emoji || "🎯"}</span>
            <div>
              <span className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest opacity-40"
                style={{ background: `${accentColor}18`, color: accentColor }}>
                {category}
              </span>
              <h3 className="text-base font-semibold text-foreground/35 leading-tight">{title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/40 shrink-0">
            <Calendar className="h-3 w-3" />
            {formatDate(date)}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/25 bg-muted/20 px-3 py-2.5">
          <Lock className="h-3 w-3 text-muted-foreground/35 shrink-0" />
          <span className="text-xs text-muted-foreground/45">Details revealed closer to the date</span>
        </div>
      </div>
    </div>
  );
}

function PastEventRow({ title, category, date, emoji, winnerTeamName, winnerTeamLogo, winnerPoints, results = [], memories = [] }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = (categoryColors as Record<string, string>)[category] ?? "hsl(38 92% 50%)";
  const hasDetails = results.length > 0 || memories.length > 0 || true; // always expandable to show memories state

  return (
    <div
      className="rounded-xl border bg-card/40 overflow-hidden transition-colors"
      style={{ borderColor: `${accentColor}20` }}
    >
      {/* ── Collapsed header row ── */}
      <button
        onClick={() => hasDetails && setExpanded(v => !v)}
        className={`w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left ${hasDetails ? "hover:bg-accent/20 transition-colors" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">{emoji || "🎯"}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
              {winnerTeamName && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <span>·</span>
                  <Trophy className="h-2.5 w-2.5 shrink-0" style={{ color: accentColor }} />
                  <span style={{ color: accentColor }} className="font-medium">
                    {winnerTeamLogo} {winnerTeamName}
                    {winnerPoints ? ` · ${winnerPoints} pts` : ""}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {memories.length > 0 && (
            <span
              className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}25` }}
            >
              <Images className="h-2.5 w-2.5" /> Memories
            </span>
          )}
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: `${accentColor}30`, color: accentColor }}
          >
            {category}
          </span>
          {hasDetails && (
            <span className="text-muted-foreground/50">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </button>

      {/* ── Expanded details ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 py-4 space-y-5" style={{ borderColor: `${accentColor}15` }}>

              {/* Results leaderboard */}
              {results.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Results</p>
                  <div className="space-y-1.5">
                    {results.map((r, i) => {
                      const p = r.place ?? "";
                      const medal = p.includes("1") || p.includes("🥇") ? "🥇"
                        : p.includes("2") || p.includes("🥈") ? "🥈"
                        : p.includes("3") || p.includes("🥉") ? "🥉"
                        : null;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${i === 0 ? "bg-card border" : "bg-muted/30"}`}
                          style={i === 0 ? { borderColor: `${accentColor}25`, background: `${accentColor}08` } : {}}
                        >
                          <div className="flex items-center gap-2.5">
                            {medal ? (
                              <span className="text-base w-6 text-center leading-none shrink-0">{medal}</span>
                            ) : (
                              <span className="shrink-0 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none bg-secondary border border-border/60 text-muted-foreground min-w-[26px]">
                                {p || "–"}
                              </span>
                            )}
                            {r.teamLogo && <span className="text-sm leading-none shrink-0">{r.teamLogo}</span>}
                            <span className={`text-sm font-medium ${i === 0 ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                              {r.teamName ?? "—"}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold tabular-nums ${i === 0 ? "" : "text-muted-foreground"}`}
                            style={i === 0 ? { color: accentColor } : {}}
                          >
                            +{r.pts} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Memories */}
              {memories.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
                    <Images className="h-3 w-3" /> Memories
                  </p>
                  <div className={`grid gap-2 ${memories.length === 1 ? "grid-cols-1" : memories.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                    {memories.map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted/30">
                        <img
                          src={url}
                          alt={`${title} memory ${i + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-2.5">
                  <Images className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <p className="text-xs text-muted-foreground/50 italic">Memories uploading soon…</p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EventsView() {
  const { events } = useArena();

  const upcoming = [...events]
    .filter(e => !e.isPast && !e.hidden)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = upcoming[0] ?? null;
  const restEvents = upcoming.slice(1);

  const past = [...events]
    .filter(e => e.isPast)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 mb-1">Season 2 Schedule</p>
        <h2 className="font-carnival text-3xl tracking-wide bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">
          Events
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Six events, six chances to score. Win rounds, earn points, and climb the leaderboard.
        </p>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Upcoming
            </h3>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
              {upcoming.length} events
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nextEvent && (
              <motion.div
                key={nextEvent.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <UpcomingEventCard
                  id={nextEvent.id}
                  title={nextEvent.title}
                  category={nextEvent.category}
                  date={nextEvent.date}
                  description={nextEvent.description}
                  emoji={nextEvent.emoji}
                  format={nextEvent.format}
                  duration={nextEvent.duration}
                  rules={nextEvent.rules}
                  pointsBreakdown={nextEvent.pointsBreakdown}
                  status={nextEvent.status}
                  startedAt={nextEvent.startedAt}
                />
              </motion.div>
            )}
            {restEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.05 }}
              >
                <ComingSoonCard
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  date={event.date}
                  emoji={event.emoji}
                  description={event.description}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Past Events
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {past.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {past.map((event, i) => {
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <PastEventRow
                    id={event.id}
                    title={event.title}
                    category={event.category}
                    date={event.date}
                    description={event.description}
                    emoji={event.emoji}
                    winnerTeamName={event.winnerTeamName}
                    winnerTeamLogo={event.winnerTeamLogo}
                    winnerPoints={event.winnerPoints}
                    results={event.results}
                    memories={event.memories}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
