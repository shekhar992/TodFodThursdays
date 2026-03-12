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
  const recent = announcements.slice(0, 5);
  return (
    <div className="space-y-3">
      {/* Feed card with inline live indicator */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#131A27', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-[11px] uppercase tracking-[0.10em] font-semibold text-[#4D5A70]">Updates</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#38BDF8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            Live
          </span>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 flex flex-col items-center gap-2">
            <span className="text-2xl opacity-20">📡</span>
            <p className="text-xs text-[#4D5A70]">No updates yet</p>
          </div>
        ) : (
          <ul>
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
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#4D5A70] mb-2 font-semibold">Up Next</p>
          <p className="text-sm font-semibold text-[#EEF2F7] mb-1.5 leading-tight">{nextEvent.title}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📅</span>
            <span className="text-xs text-[#4D5A70]">{nextEvent.date}</span>
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
      {/* ── Slim status bar ── removes landing-page hero feel */}
      <div
        className="px-4 sm:px-6 xl:px-12 h-10 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-[#4D5A70] font-medium">
            Season 2
          </span>
          <span className="text-[#4D5A70] select-none" aria-hidden>·</span>
          <span className="text-xs text-[#4D5A70]">{teams.length} teams</span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
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

      {/* ── Main dashboard workspace ── */}
      <div className="px-4 sm:px-6 xl:px-12 mt-5">

        {/* Zone column labels — orient user instantly on desktop */}
        <div className="hidden lg:grid lg:grid-cols-[360px_1fr_260px] mb-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#4D5A70] font-semibold">Rankings</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#4D5A70] font-semibold pl-6">Active Challenge</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#4D5A70] font-semibold pl-6">Updates</p>
        </div>

        {/* Three-column workspace — border dividers instead of gap-cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_260px]">

          {/* ── Left: PRIMARY — Rankings ── leaderboard is the anchor */}
          {/* order-1 on mobile: leaderboard appears first */}
          <div
            className="order-1 pb-6 lg:pb-0 lg:pr-6 border-b lg:border-b-0 lg:border-r"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <Leaderboard teams={teams} />
          </div>

          {/* ── Center: SECONDARY — Active Challenge ── */}
          <div
            className="order-2 py-6 lg:py-0 lg:px-6 border-b lg:border-b-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <PuzzleArena key={activePuzzle.id} puzzle={activePuzzle} />
          </div>

          {/* ── Right: TERTIARY — Updates ── compact support rail */}
          <div
            className="order-3 pt-6 lg:pt-0 lg:pl-6 lg:border-l"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <LiveFeed announcements={announcements} nextEvent={upcomingEvents[0]} />
          </div>

        </div>
      </div>

      {/* ── Secondary content band ── visually demoted below full-width divider */}
      <div
        className="mt-14 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="px-4 sm:px-6 xl:px-12 pt-8">
          <EventHighlights events={highlightEvents} />
          <div className="mt-8">
            <UpcomingEvents events={upcomingEvents} />
          </div>
        </div>
      </div>

    </motion.div>
  );
}


