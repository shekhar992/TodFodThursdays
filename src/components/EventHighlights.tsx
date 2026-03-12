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
        <h2 className="text-2xl font-bold text-white font-[Orbitron]">Event Highlights</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FF2E8844] to-transparent" />
        {events.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-[#00E5FF44] transition-all duration-200 cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-[#00E5FF44] transition-all duration-200 cursor-pointer"
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
            style={{ background: 'rgba(15, 15, 26, 0.5)', minHeight: '200px' }}
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
              className="flex-shrink-0 w-48 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all duration-300 hover:border-[#7A5CFF44]"
              style={{ minHeight: '240px' }}
            >
              <span className="text-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-300">+</span>
              <span className="text-xs text-white/30 group-hover:text-[#7A5CFF] transition-colors duration-300 font-medium">
                View All Events
              </span>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
