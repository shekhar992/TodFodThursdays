import { motion } from 'framer-motion';
import { Leaderboard } from '../components/Leaderboard';
import { PuzzleArena } from '../components/PuzzleArena';
import { EventHighlights } from '../components/EventHighlights';
import { UpcomingEvents } from '../components/UpcomingEvents';
import type { Team, Announcement, Event, Puzzle } from '../data/mockData';

interface HomeProps {
  teams: Team[];
  announcements: Announcement[];
  highlightEvents: Event[];
  upcomingEvents: Event[];
  activePuzzle: Puzzle;
}

function LiveFeed({ announcements, nextEvent }: { announcements: Announcement[]; nextEvent?: Event }) {
  const recent = announcements.slice(0, 6);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-lg font-bold text-[#EEF2F7]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Live Feed
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-[#38BDF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          Live
        </span>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#131A27', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {recent.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2">
            <span className="text-2xl opacity-20">📡</span>
            <p className="text-xs text-[#4D5A70]">No updates yet</p>
          </div>
        ) : (
          <ul style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {recent.map((a, idx) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm mt-0.5 flex-shrink-0">{a.emoji}</span>
                <span className="text-xs text-[#8896A7] leading-relaxed">{a.text}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {nextEvent && (
        <div
          className="rounded-xl p-4"
          style={{ background: '#131A27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs uppercase tracking-wider text-[#4D5A70] mb-2 font-medium">Up Next</p>
          <p className="text-sm font-semibold text-[#EEF2F7] mb-2 leading-tight">{nextEvent.title}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📅</span>
            <span className="text-xs text-[#8896A7]">{nextEvent.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Home({ teams, announcements, highlightEvents, upcomingEvents, activePuzzle }: HomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-20"
    >
      {/* Compact arena header */}
      <div
        className="px-4 sm:px-6 xl:px-12 pt-7 pb-6 flex items-end justify-between gap-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-[#4D5A70] mb-1.5 font-medium">
            Season 2 — Competition
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-[#EEF2F7] leading-none"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            TFT2 Arena
          </h1>
        </div>
        <div
          className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.20)',
            color: '#38BDF8',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          Live
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="px-4 sm:px-6 xl:px-12 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_280px] gap-6">
          {/* Left: Leaderboard */}
          <div className="order-2 lg:order-1">
            <Leaderboard teams={teams} />
          </div>

          {/* Center: Puzzle Arena */}
          <div className="order-1 lg:order-2">
            <PuzzleArena key={activePuzzle.id} puzzle={activePuzzle} />
          </div>

          {/* Right: Live Feed */}
          <div className="order-3 lg:order-3">
            <LiveFeed announcements={announcements} nextEvent={upcomingEvents[0]} />
          </div>
        </div>
      </div>

      {/* Event Highlights */}
      <div className="px-4 sm:px-6 xl:px-12 mt-10">
        <EventHighlights events={highlightEvents} />
      </div>

      {/* Upcoming Schedule */}
      <div className="px-4 sm:px-6 xl:px-12 mt-10">
        <UpcomingEvents events={upcomingEvents} />
      </div>
    </motion.div>
  );
}


