import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AnnouncementTicker } from "./AnnouncementTicker";
import { isMockMode } from "@/lib/mockAuth";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RegistrationPlayer {
  id: string;
  name: string;
  teamId: string;
  isCaptain: boolean;
}

interface TeamDef {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// ── Mock data — 30 Deloitte USI employees joining live ────────────────────────
const MOCK_TEAMS: TeamDef[] = [
  { id: "1", name: "Team Titans",    logo: "⚡", color: "#00E5FF" },
  { id: "2", name: "Team Phoenix",   logo: "🔥", color: "#FF2E88" },
  { id: "3", name: "Team Mavericks", logo: "🦅", color: "#7A5CFF" },
  { id: "4", name: "Team Warriors",  logo: "⚔️",  color: "#00FFC6" },
  { id: "5", name: "Team Vortex",    logo: "🌀", color: "#FFE600" },
  { id: "6", name: "Team Nexus",     logo: "🔗", color: "#FF6B35" },
];

// Staggered join order — realistic: players trickle in mixed across teams
const MOCK_JOIN_SEQUENCE: Omit<RegistrationPlayer, "isCaptain">[] = [
  { id: "p1",  name: "Priya Sharma",      teamId: "1" },
  { id: "p2",  name: "Arjun Kumar",       teamId: "2" },
  { id: "p3",  name: "Vikram Rao",        teamId: "3" },
  { id: "p4",  name: "Neha Verma",        teamId: "4" },
  { id: "p5",  name: "Rohit Gupta",       teamId: "5" },
  { id: "p6",  name: "Sakshi Jain",       teamId: "6" },
  { id: "p7",  name: "Rahul Mehta",       teamId: "1" },
  { id: "p8",  name: "Sneha Gupta",       teamId: "2" },
  { id: "p9",  name: "Divya Pillai",      teamId: "3" },
  { id: "p10", name: "Aditya Reddy",      teamId: "4" },
  { id: "p11", name: "Anjali Sharma",     teamId: "5" },
  { id: "p12", name: "Vivek Tiwari",      teamId: "6" },
  { id: "p13", name: "Anika Singh",       teamId: "1" },
  { id: "p14", name: "Rohan Das",         teamId: "2" },
  { id: "p15", name: "Suresh Nair",       teamId: "3" },
  { id: "p16", name: "Priyanka Desai",    teamId: "4" },
  { id: "p17", name: "Akash Nair",        teamId: "5" },
  { id: "p18", name: "Nandita Roy",       teamId: "6" },
  { id: "p19", name: "Dev Patel",         teamId: "1" },
  { id: "p20", name: "Pooja Iyer",        teamId: "2" },
  { id: "p21", name: "Ananya Mukherjee",  teamId: "3" },
  { id: "p22", name: "Manish Singh",      teamId: "4" },
  { id: "p23", name: "Meera Krishnan",    teamId: "5" },
  { id: "p24", name: "Kartik Malik",      teamId: "6" },
  { id: "p25", name: "Kavya Nair",        teamId: "1" },
  { id: "p26", name: "Amit Joshi",        teamId: "2" },
  { id: "p27", name: "Karan Sharma",      teamId: "3" },
  { id: "p28", name: "Sonal Patel",       teamId: "4" },
  { id: "p29", name: "Deep Pandey",       teamId: "5" },
  { id: "p30", name: "Bhavna Shah",       teamId: "6" },
];

// Captains revealed after all players join (mock: each team's first listed member)
const MOCK_CAPTAINS: Record<string, string> = {
  "1": "p7",  // Rahul Mehta  — Titans
  "2": "p2",  // Arjun Kumar  — Phoenix
  "3": "p9",  // Divya Pillai — Mavericks
  "4": "p10", // Aditya Reddy — Warriors
  "5": "p11", // Anjali Sharma — Vortex
  "6": "p12", // Vivek Tiwari — Nexus
};

const GOLD = "hsl(43 93% 60%)";

// ── Shared visual atoms (mirrors StageView aesthetic) ─────────────────────────
function Particles() {
  const particles = useMemo(
    () =>
      [...Array(22)].map((_, i) => ({
        id: i,
        left: `${4 + Math.random() * 92}%`,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.45,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
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
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

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
          transition={{ duration: 2.5 + i * 0.4, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        background:
          "radial-gradient(ellipse 90% 90% at 50% 42%, transparent 25%, hsl(248 32% 2% / 0.8) 100%)",
      }}
    />
  );
}

function CornerOrnaments() {
  const pos = [
    "top-4 left-4 border-t border-l",
    "top-4 right-4 border-t border-r",
    "bottom-4 left-4 border-b border-l",
    "bottom-4 right-4 border-b border-r",
  ] as const;
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {pos.map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 border-gold/20 ${cls}`} />
      ))}
    </div>
  );
}

// ── Shimmer sweep title (mirrors StageView) ──────────────────────────────────
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

function PulsingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ── Player card ───────────────────────────────────────────────────────────────
function PlayerCard({ player, teamColor }: { player: RegistrationPlayer; teamColor: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="relative flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: `${teamColor}12`,
        border: `1px solid ${teamColor}30`,
      }}
    >
      {/* Avatar circle */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: teamColor, color: "hsl(248 32% 7%)" }}
      >
        {player.name.charAt(0)}
      </div>

      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {player.name}
      </span>

      {/* Captain crown — animates in separately */}
      <AnimatePresence>
        {player.isCaptain && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}55` }}
          >
            <Crown className="h-3 w-3" style={{ color: GOLD }} />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: GOLD }}
            >
              Captain
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Team column ───────────────────────────────────────────────────────────────
function TeamColumn({ team, players }: { team: TeamDef; players: RegistrationPlayer[] }) {
  const isEmpty = players.length === 0;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {/* Column header */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: `${team.color}18`, border: `1px solid ${team.color}40` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{team.logo}</span>
          <span className="text-sm font-bold text-foreground leading-tight">{team.name}</span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: `${team.color}25`, border: `1px solid ${team.color}50` }}
          key={players.length}
          animate={players.length > 0 ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 0.28 }}
        >
          <Users className="h-3 w-3" style={{ color: team.color }} />
          <span className="text-xs font-bold tabular-nums" style={{ color: team.color }}>
            {players.length}
          </span>
        </motion.div>
      </div>

      {/* Player cards */}
      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <AnimatePresence initial={false}>
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2 py-8 text-center"
            >
              <div style={{ color: `${team.color}55` }}>
                <PulsingDots />
              </div>
              <p className="text-xs text-muted-foreground">Waiting for players…</p>
            </motion.div>
          ) : (
            players.map((p) => (
              <PlayerCard key={p.id} player={p} teamColor={team.color} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function LiveJoinView() {
  const [players, setPlayers] = useState<RegistrationPlayer[]>([]);
  const [teams, setTeams] = useState<TeamDef[]>(MOCK_TEAMS);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const mockIndexRef = useRef(0);
  const captainTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Mock simulation: players trickle in every 1.2s ───────────────────────
  useEffect(() => {
    if (!isMockMode && isSupabaseConfigured) return;

    const interval = setInterval(() => {
      if (mockIndexRef.current >= MOCK_JOIN_SEQUENCE.length) {
        clearInterval(interval);

        // After all players join, assign captains one by one with 1.4s spacing
        let delay = 3000;
        Object.entries(MOCK_CAPTAINS).forEach(([, playerId]) => {
          const t = setTimeout(() => {
            setPlayers((prev) =>
              prev.map((p) => (p.id === playerId ? { ...p, isCaptain: true } : p)),
            );
          }, delay);
          captainTimersRef.current.push(t);
          delay += 1400;
        });
        return;
      }

      const next = MOCK_JOIN_SEQUENCE[mockIndexRef.current];
      mockIndexRef.current += 1;
      setPlayers((prev) => [...prev, { ...next, isCaptain: false }]);
      setTotalRegistered(mockIndexRef.current);
    }, 1200);

    return () => {
      clearInterval(interval);
      captainTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Prod: load existing + subscribe to realtime ───────────────────────────
  useEffect(() => {
    if (isMockMode || !isSupabaseConfigured) return;

    supabase
      .from("teams")
      .select("id,name,logo,color")
      .order("name")
      .then(({ data }) => {
        if (data) setTeams(data as TeamDef[]);
      });

    supabase
      .from("profiles")
      .select("id,display_name,team_id,is_captain")
      .not("team_id", "is", null)
      .eq("role", "player")
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((p) => ({
            id: p.id,
            name: p.display_name,
            teamId: p.team_id as string,
            isCaptain: p.is_captain ?? false,
          }));
          setPlayers(mapped);
          setTotalRegistered(mapped.length);
        }
      });

    const ch = supabase
      .channel("live-registrations")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const p = payload.new as {
            id: string;
            display_name: string;
            team_id: string | null;
            is_captain: boolean;
            role: string;
          };
          if (p.role !== "player" || !p.team_id) return;

          setPlayers((prev) => {
            const exists = prev.find((x) => x.id === p.id);
            if (exists) {
              return prev.map((x) =>
                x.id === p.id
                  ? { ...x, teamId: p.team_id!, isCaptain: p.is_captain }
                  : x,
              );
            }
            setTotalRegistered((n) => n + 1);
            return [
              ...prev,
              { id: p.id, name: p.display_name, teamId: p.team_id!, isCaptain: p.is_captain },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // Players grouped by team
  const playersByTeam = useMemo(() => {
    const map: Record<string, RegistrationPlayer[]> = {};
    teams.forEach((t) => {
      map[t.id] = [];
    });
    players.forEach((p) => {
      if (map[p.teamId]) map[p.teamId].push(p);
    });
    return map;
  }, [players, teams]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(248_32%_4%)]">
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

      <Particles />
      <Vignette />
      <CornerOrnaments />

      {/* Announcement ticker */}
      <div className="relative z-30">
        <AnnouncementTicker />
      </div>

      <div className="relative z-10 flex flex-col gap-5 px-6 pb-6 pt-4">
        {/* Hero */}
        <div className="flex flex-col items-center pt-10 pb-4 text-center">

          {/* Trophy icon — floats gently like StageView event emoji */}
          <motion.span
            className="mb-4 block text-6xl"
            style={{ filter: "drop-shadow(0 0 28px hsl(43 93% 60% / 0.6))" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            🏆
          </motion.span>

          {/* Main title */}
          <motion.h1
            className="font-carnival uppercase tracking-[0.06em] relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              lineHeight: 1.05,
              color: "hsl(43 93% 62%)",
              textShadow: "0 0 30px hsl(43 93% 55% / 0.7), 0 0 60px hsl(38 92% 45% / 0.35), 0 1px 3px hsl(248 32% 3% / 0.9)",
            }}
          >
            Team Registration
          </motion.h1>

          {/* — Season 2 — divider (mirrors HeroBanner) */}
          <motion.div
            className="my-4 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <span className="text-[13px] font-bold tracking-[0.22em] uppercase" style={{ color: "hsl(288 80% 72%)" }}>
              — Season 2 —
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="font-carnival text-base tracking-wide uppercase"
            style={{ color: "hsl(43 93% 60%)", textShadow: "0 1px 0 hsl(38 80% 30%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
          >
            Pick your team · Prove your worth
          </motion.p>

          {/* Live badge + count — matches StageView LiveBadge */}
          <motion.div
            className="mt-5 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
          >
            <motion.div
              className="flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                animate={{ boxShadow: ["0 0 6px 0px hsl(0 80% 60%)", "0 0 14px 4px hsl(0 80% 60%)", "0 0 6px 0px hsl(0 80% 60%)"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">Live Now</span>
            </motion.div>

            <motion.div
              key={totalRegistered}
              className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-xs font-bold"
              style={{ color: GOLD }}
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 0.28 }}
            >
              <Users className="h-3.5 w-3.5" />
              {totalRegistered} registered
            </motion.div>
          </motion.div>
        </div>

        {/* 6 team columns */}
        <div className="grid grid-cols-6 gap-4">
          {teams.map((team) => (
            <TeamColumn key={team.id} team={team} players={playersByTeam[team.id] ?? []} />
          ))}
        </div>

        {/* Bottom instruction strip */}
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Scan the QR code to sign up · The wheel will assign your team
          </p>
        </div>
      </div>
    </div>
  );
}
