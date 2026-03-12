import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { mockTeams, type Team } from '../data/mockData';

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.5,
      ease: 'easeOut',
      delay: 0.3,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [target]);

  return <span>{display}</span>;
}

const rankMedals = ['🥇', '🥈', '🥉'];

interface LeaderboardProps {
  teams?: Team[];
}

export function Leaderboard({ teams = mockTeams }: LeaderboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score ?? 1;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏆</span>
        <h2 className="text-2xl font-bold text-white font-[Orbitron]">
          Leaderboard
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD70044] to-transparent" />
        <span className="text-xs text-white/40 uppercase tracking-widest">Season 2</span>
      </div>

      <div className="space-y-3">
        {sorted.map((team, idx) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
          >
            <div
              className="relative overflow-hidden rounded-xl border transition-all duration-300 cursor-default group"
              style={{
                borderColor: `${team.color}22`,
                background: `rgba(20, 12, 70, 0.5)`,
              }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at left, ${team.color}0A 0%, transparent 70%)`,
                }}
              />

              {/* Score progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5"
                initial={{ width: 0 }}
                animate={{ width: `${(team.score / maxScore) * 100}%` }}
                transition={{ duration: 1.2, delay: idx * 0.08 + 0.3, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}44)` }}
              />

              <div className="flex items-center gap-4 px-5 py-4">
                {/* Rank */}
                <div className="w-8 text-center">
                  {idx < 3 ? (
                    <span className="text-xl">{rankMedals[idx]}</span>
                  ) : (
                    <span className="text-sm font-bold text-white/30">#{idx + 1}</span>
                  )}
                </div>

                {/* Team logo */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `${team.color}1A`,
                    border: `1px solid ${team.color}33`,
                  }}
                >
                  {team.logo}
                </div>

                {/* Team name */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{team.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{team.wins} wins</div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div
                    className="text-xl font-black font-[Orbitron] tabular-nums"
                    style={{
                      color: team.color,
                      textShadow: `0 0 20px ${team.color}88`,
                    }}
                  >
                    <AnimatedScore target={team.score} />
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-wider">pts</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
