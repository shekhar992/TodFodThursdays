import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../data/mockData';
import { EventCard } from './EventCard';

interface EventHighlightsProps {
  events: Event[];
}

export function EventHighlights({ events }: EventHighlightsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎬</span>
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Event Highlights</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[rgba(56,189,248,0.20)] to-transparent" />
        {events.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all duration-200 cursor-pointer"
              style={{ background: '#1A2234', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all duration-200 cursor-pointer"
              style={{ background: '#1A2234', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              →
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-white/10"
            style={{ background: '#131A27', minHeight: '200px' }}
          >
            <span className="text-4xl opacity-30">🎬</span>
            <div className="text-center">
              <p className="text-white/30 font-medium text-sm">No highlights yet</p>
              <p className="text-white/20 text-xs mt-1">Past event highlights will appear here</p>
            </div>
          </div>
        ) : (
          <>
            {events.map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}

            {/* "View all" card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-48 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all duration-300 hover:border-[rgba(56,189,248,0.25)]"
              style={{ minHeight: '240px' }}
            >
              <span className="text-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-300">+</span>
                <span className="text-xs text-white/30 group-hover:text-[#38BDF8] transition-colors duration-300 font-medium">
                View All Events
              </span>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
