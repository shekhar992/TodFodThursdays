import { motion } from 'framer-motion';
import type { Event } from '../data/mockData';
import { categoryColors } from '../data/mockData';

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const accentColor = categoryColors[event.category] ?? '#7A5CFF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative flex-shrink-0 w-72 rounded-xl overflow-hidden cursor-default"
      style={{
        background: '#131A27',
        border: `1px solid ${accentColor}22`,
        boxShadow: `0 0 0 0 ${accentColor}00`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 40px ${accentColor}22`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}55`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${accentColor}00`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}22`;
      }}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131A27] via-[#131A2722] to-transparent" />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: `${accentColor}22`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
          }}
        >
          {event.category}
        </div>

        {/* Status badge */}
        {event.status === 'completed' && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/50 border border-white/10">
            ✓ Done
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base mb-1.5 leading-tight">{event.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{event.description}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-white/30 flex items-center gap-1.5">
            <span>📅</span> {event.date}
          </span>
          {event.participants && (
            <span className="text-xs text-white/30 flex items-center gap-1.5">
              <span>👥</span> {event.participants}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
    </motion.div>
  );
}
