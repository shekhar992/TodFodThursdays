import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ChevronDown, ChevronUp, Trophy, Users, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useArena } from "@/context/ArenaContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isMockMode } from "@/lib/mockAuth";

interface TeamMember {
  id: string;
  display_name: string;
  is_captain: boolean;
}

const RANK_LABEL = ["1st", "2nd", "3rd"];

export function PlayerProfilePanel() {
  const { profile } = useAuth();
  const { teams, events } = useArena();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersExpanded, setMembersExpanded] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const currentTeam = teams.find((t) => t.id === profile?.team_id);
  const rank = currentTeam
    ? sortedTeams.findIndex((t) => t.id === currentTeam.id) + 1
    : null;

  const teamColor = currentTeam?.color ?? "#00E5FF";

  const teamWins = events.filter(
    (e) => e.winnerTeamId === currentTeam?.id || e.winnerTeamName === currentTeam?.name
  );

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  useEffect(() => {
    if (!profile?.team_id) return;
    async function loadMembers() {
      if (!isSupabaseConfigured || isMockMode) {
        setMembers([
          { id: profile!.id, display_name: profile!.display_name, is_captain: profile!.is_captain },
        ]);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id,display_name,is_captain")
        .eq("team_id", profile!.team_id!);
      setMembers(data ?? []);
    }
    loadMembers();
  }, [profile?.team_id]);

  if (!profile || !currentTeam) return null;

  const rankLabel = rank !== null && rank <= 3 ? RANK_LABEL[rank - 1] : rank !== null ? `#${rank}` : null;

  return (
    <>
      {/* ── Mobile toggle button ── */}
      <button
        onClick={() => setPanelOpen((o) => !o)}
        className="fixed top-[72px] right-4 z-40 lg:hidden flex items-center justify-center h-9 w-9 rounded-full border border-border/50 bg-background/90 backdrop-blur shadow-lg"
        style={{ borderColor: teamColor + "40" }}
        aria-label="My Profile"
      >
        <User className="h-4 w-4" style={{ color: teamColor }} />
      </button>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <div
        className={[
          // Shared
          "fixed z-40 flex flex-col gap-3 overflow-y-auto",
          // Desktop: always visible, right rail
          "lg:block lg:top-[calc(56px+40px)] lg:right-5 lg:w-72 lg:max-h-[calc(100vh-120px)]",
          // Mobile: slide-in from right
          "top-[56px] right-0 h-[calc(100vh-56px)] w-72 transition-transform duration-300 ease-in-out lg:translate-x-0",
          panelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* ──────── Screenshot 2: Compact player identity strip ──────── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: teamColor + "35",
            background: `linear-gradient(150deg, ${teamColor}12 0%, hsl(0 0% 7%) 100%)`,
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-md opacity-60"
                style={{ background: teamColor }}
              />
              <div
                className="relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-carnival font-bold"
                style={{
                  background: `linear-gradient(135deg, ${teamColor}40, ${teamColor}18)`,
                  border: `1.5px solid ${teamColor}80`,
                  color: teamColor,
                }}
              >
                {initials}
              </div>
              {profile.is_captain && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Name + sub-info */}
            <div className="flex flex-col min-w-0">
              <span className="text-base font-carnival font-bold leading-tight truncate text-foreground">
                {profile.display_name}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: teamColor }}
                >
                  {currentTeam.logo} {currentTeam.name}
                </span>
                {rankLabel && (
                  <>
                    <span className="text-border/60 text-[10px]">·</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {rank !== null && rank <= 3 ? "🥇🥈🥉"[rank - 1] : "🏆"} {rankLabel}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold tabular-nums" style={{ color: teamColor }}>
                  {currentTeam.score} <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">pts</span>
                </span>
                <span className="text-border/60 text-[10px]">·</span>
                <span className="text-[11px] font-bold tabular-nums text-gold">
                  {currentTeam.wins} <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">wins</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ──────── Screenshot 3: Team card ──────── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: teamColor + "30",
            background: `linear-gradient(145deg, ${teamColor}0e 0%, hsl(0 0% 7%) 100%)`,
          }}
        >
          {/* Team header band */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ borderBottom: `1px solid ${teamColor}20` }}
          >
            <span className="text-2xl leading-none">{currentTeam.logo}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-carnival font-bold truncate" style={{ color: teamColor }}>
                {currentTeam.name}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Your Team
              </span>
            </div>
            {rankLabel && (
              <div
                className="ml-auto shrink-0 h-9 w-9 rounded-full border flex items-center justify-center text-xs font-carnival font-bold"
                style={{ color: teamColor, borderColor: teamColor + "50", background: teamColor + "18" }}
              >
                {rankLabel}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3"
            style={{ borderBottom: `1px solid ${teamColor}15` }}
          >
            {[
              { label: "Points", value: currentTeam.score, color: teamColor },
              { label: "Wins",   value: currentTeam.wins,  color: "hsl(43 93% 60%)" },
              { label: "Events", value: teamWins.length,   color: "hsl(288 80% 72%)" },
            ].map(({ label, value, color }, i) => (
              <div
                key={label}
                className="flex flex-col items-center py-3 gap-0.5"
                style={{ borderRight: i < 2 ? `1px solid ${teamColor}12` : undefined }}
              >
                <span className="text-lg font-carnival font-bold tabular-nums" style={{ color }}>
                  {value}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Team members */}
          <div className="px-4 py-3">
            <button
              onClick={() => setMembersExpanded((e) => !e)}
              className="w-full flex items-center justify-between py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Team Members
              </span>
              {membersExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <AnimatePresence initial={false}>
              {membersExpanded && (
                <motion.div
                  key="members"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="mt-2 flex flex-col gap-0.5 pb-1">
                    {members.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={{ x: -6, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 px-1.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: teamColor + "22", color: teamColor }}
                        >
                          {m.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium leading-tight truncate">{m.display_name}</span>
                          {m.id === profile.id && (
                            <span className="text-[10px] text-muted-foreground leading-none">You</span>
                          )}
                        </div>
                        {m.is_captain && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 shrink-0">
                            <Crown className="h-2.5 w-2.5 text-amber-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Captain</span>
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ──────── Event wins card ──────── */}
        {teamWins.length > 0 && (
          <div className="rounded-2xl border border-gold/20 bg-gold/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-gold/15 flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                Event Wins
              </span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {teamWins.slice(0, 4).map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="text-base leading-none shrink-0">{ev.emoji}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate text-foreground">{ev.title}</span>
                    {ev.winnerPoints && (
                      <span className="text-[10px] text-gold tabular-nums">+{ev.winnerPoints} pts</span>
                    )}
                  </div>
                </motion.div>
              ))}
              {teamWins.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{teamWins.length - 4} more wins</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
