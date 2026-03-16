import { useArena } from "@/context/ArenaContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp, Calendar, Zap, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isMockMode } from "@/lib/mockAuth";

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
  const [membersCache, setMembersCache] = useState<Record<string, string[] | null>>({});

  const sorted = [...teams].sort((a, b) => b.score - a.score);

  const loadMembers = useCallback(async (teamId: string) => {
    if (teamId in membersCache) return;
    // Mark as loading
    setMembersCache(c => ({ ...c, [teamId]: null }));
    if (!isSupabaseConfigured || isMockMode) {
      setMembersCache(c => ({ ...c, [teamId]: [] }));
      return;
    }
    const { data } = await supabase.from('profiles').select('display_name').eq('team_id', teamId);
    setMembersCache(c => ({ ...c, [teamId]: (data ?? []).map((r: any) => r.display_name as string) }));
  }, [membersCache]);

  function toggle(teamId: string) {
    if (expandedId === teamId) {
      setExpandedId(null);
    } else {
      setExpandedId(teamId);
      loadMembers(teamId);
    }
  }

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
        {/* Header row */}
        <div className="flex items-center border-b border-gold/10 text-xs uppercase tracking-wider text-muted-foreground bg-gold/[0.03] px-4 py-3 gap-4">
          <span className="w-8 shrink-0">Rank</span>
          <span className="flex-1">Team</span>
          <span className="w-24 text-right">Score</span>
          <span className="w-4 shrink-0" />
        </div>

        {sorted.map((team, i) => {
          const rank     = i + 1;
          const isGold   = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;
          const isExpanded = expandedId === team.id;

          const leftGlow = isGold
            ? { boxShadow: "inset 3px 0 0 hsl(43 93% 60%)" }
            : isSilver ? { boxShadow: "inset 3px 0 0 #a8b3c8" }
            : isBronze ? { boxShadow: "inset 3px 0 0 #cd7f32" }
            : {};
          const rowBg = isGold ? "bg-gold/5" : isSilver ? "bg-secondary/50" : isBronze ? "bg-secondary/30" : "";
          const scoreColor = isGold ? "text-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-foreground";
          const nameColor  = isGold ? "text-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-foreground";
          const rankColor  = isGold ? "text-gold animate-flicker-gold" : isSilver ? "text-[#a8b3c8]" : isBronze ? "text-[#cd7f32]" : "text-muted-foreground";

          // Event placements for this team (pts > 0 only)
          const teamEventPlacements = events
            .filter(e => e.isPast && e.results?.some(r =>
              (r.teamId === team.id || r.teamName === team.name) && (r.pts ?? 0) > 0
            ))
            .map(e => ({
              event: e,
              result: e.results!.find(r => r.teamId === team.id || r.teamName === team.name)!,
            }))
            .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

          // Puzzle wins for this team
          const teamPuzzleWins = completedPuzzles.filter(p =>
            !p.timedOut && (p.solvedByTeamId === team.id || p.solvedBy === team.name)
          );

          const members = membersCache[team.id] ?? null;
          const membersLoaded = team.id in membersCache;

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`border-b border-border/50 last:border-0 ${rowBg}`}
              style={leftGlow}
            >
              {/* Clickable summary row */}
              <button
                onClick={() => toggle(team.id)}
                className="w-full flex items-center px-4 py-3 gap-4 hover:bg-accent/20 transition-colors text-left"
              >
                <span className={`font-display text-sm font-bold w-8 shrink-0 ${rankColor}`}>
                  {rank <= 3 ? (
                    <span className="relative inline-block">
                      {["🥇", "🥈", "🥉"][rank - 1]}
                      <span
                        className="pointer-events-none absolute -top-1.5 -right-1 text-[9px] leading-none text-gold"
                        style={{ animation: `medal-sparkle ${2.2 + rank * 0.55}s ease-in-out infinite` }}
                      >✦</span>
                    </span>
                  ) : String(rank).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-md text-base shrink-0 ${isGold ? "bg-gold/15 ring-1 ring-gold/30" : "bg-secondary"}`}>
                    {team.logo}
                  </span>
                  <span className={`font-display font-semibold text-sm truncate ${nameColor}`}>
                    {team.name}
                  </span>
                </div>
                <span className={`font-display text-lg font-bold tabular-nums w-24 text-right shrink-0 ${scoreColor}`}>
                  <AnimatedScore value={team.score} />
                </span>
                <span className={`shrink-0 rounded-full border px-1.5 py-0.5 transition-colors ${
                  isExpanded
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border/60 bg-secondary/60 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </span>
              </button>

              {/* Expandable drawer */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t border-border/20 px-4 py-4 grid gap-5 sm:grid-cols-3"
                      style={{ background: "hsl(248 32% 7% / 0.5)" }}
                    >
                      {/* ① Events */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" /> Events
                        </p>
                        {teamEventPlacements.length > 0 ? (
                          <div className="space-y-1.5">
                            {teamEventPlacements.map(({ event: ev, result }) => {
                              const p = result.place ?? "";
                              const badge = p.includes("1") || p.includes("🥇") ? "🥇"
                                : p.includes("2") || p.includes("🥈") ? "🥈"
                                : p.includes("3") || p.includes("🥉") ? "🥉"
                                : p || "–";
                              return (
                                <div key={ev.id} className="flex items-center gap-1.5">
                                  <span className="text-sm leading-none shrink-0">{badge}</span>
                                  <span className="text-xs text-foreground/80 flex-1 truncate">{ev.title}</span>
                                  <span className="text-[10px] text-gold font-bold tabular-nums shrink-0">+{result.pts}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/40 italic">No placements yet</p>
                        )}
                      </div>

                      {/* ② Puzzle wins */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" /> Puzzle Wins
                        </p>
                        {teamPuzzleWins.length > 0 ? (
                          <div className="space-y-1.5">
                            {teamPuzzleWins.map(pz => (
                              <div key={pz.id} className="flex items-center gap-1.5">
                                <span className="text-xs text-foreground/80 flex-1 truncate italic">
                                  "{pz.question.length > 28 ? pz.question.slice(0, 28) + "…" : pz.question}"
                                </span>
                                <span className="text-[10px] text-[hsl(288_80%_72%)] font-bold tabular-nums shrink-0">
                                  +{pz.awardedPoints ?? pz.points}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/40 italic">No puzzle wins yet</p>
                        )}
                      </div>

                      {/* ③ Members */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" /> Members
                        </p>
                        {!membersLoaded || members === null ? (
                          <p className="text-[10px] text-muted-foreground/40">Loading…</p>
                        ) : members.length > 0 ? (
                          <div className="space-y-1">
                            {members.map((name, idx) => (
                              <p key={idx} className="text-xs text-foreground/80">{name}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/40 italic">No members</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
