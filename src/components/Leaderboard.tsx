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

interface LeaderboardProps {
  teams?: Team[];
}

export function Leaderboard({ teams = mockTeams }: LeaderboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-lg font-bold text-[#EEF2F7]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Leaderboard
        </h2>
        <span className="text-xs text-[#4D5A70] uppercase tracking-widest font-medium">Season 2</span>
      </div>

      {sorted.length === 0 ? (
        <div
          className="py-10 text-center rounded-xl"
          style={{ background: '#131A27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[#4D5A70] text-sm">No teams yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07, ease: 'easeOut' }}
            >
              <div
                className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-200 cursor-default"
                style={{
                  background: '#131A27',
                  border: idx === 0
                    ? '1px solid rgba(248,192,59,0.20)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#1A2234';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#131A27';
                }}
              >
                {/* Rank */}
                <div className="w-7 text-center flex-shrink-0">
                  {idx === 0 && (
                    <span className="font-black text-sm text-[#F8C03B]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>01</span>
                  )}
                  {idx === 1 && (
                    <span className="font-black text-sm text-[#94A3B8]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>02</span>
                  )}
                  {idx === 2 && (
                    <span className="font-black text-sm text-[#CD7F32]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>03</span>
                  )}
                  {idx >= 3 && (
                    <span className="font-bold text-xs text-[#4D5A70]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Team logo */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: `${team.color}1A`,
                    border: `1px solid ${team.color}2A`,
                  }}
                >
                  {team.logo}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#EEF2F7] text-sm leading-tight truncate">{team.name}</div>
                  <div className="text-xs text-[#4D5A70] mt-0.5">{team.wins}W</div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-base font-black tabular-nums leading-none"
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      color: idx === 0 ? '#F8C03B' : '#EEF2F7',
                    }}
                  >
                    <AnimatedScore target={team.score} />
                  </div>
                  <div className="text-xs text-[#4D5A70] mt-0.5 uppercase tracking-wider">pts</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}


