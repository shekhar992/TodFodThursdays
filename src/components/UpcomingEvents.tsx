import { motion } from 'framer-motion';
import type { Event } from '../data/mockData';
import { categoryColors } from '../data/mockData';

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🗓️</span>
        <h2 className="text-2xl font-bold text-white font-[Orbitron]">Upcoming Events</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#00FFC644] to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-white/10"
            style={{ background: 'rgba(20, 12, 70, 0.4)' }}
          >
            <span className="text-4xl opacity-30">🗓️</span>
            <div className="text-center">
              <p className="text-white/30 font-medium text-sm">No upcoming events</p>
              <p className="text-white/20 text-xs mt-1">Check back soon — the admin will add new ones</p>
            </div>
          </motion.div>
        ) : (
          events.map((event, idx) => {
            const accentColor = categoryColors[event.category] ?? '#7A5CFF';
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                className="group relative rounded-xl overflow-hidden cursor-default"
                style={{
                  background: 'rgba(20, 12, 70, 0.6)',
                  border: `1px solid ${accentColor}22`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}55`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${accentColor}1A`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}22`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Image strip */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d55] via-[#1a0d5555] to-transparent" />

                  {/* Upcoming badge */}
                  <div
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{
                      background: `${accentColor}22`,
                      border: `1px solid ${accentColor}44`,
                      color: accentColor,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: accentColor }}
                    />
                    Soon
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-sm leading-tight">{event.title}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: `${accentColor}11`,
                        color: `${accentColor}`,
                        border: `1px solid ${accentColor}22`,
                      }}
                    >
                      {event.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <span>📅</span>
                    <span>{event.date}</span>
                  </div>
                </div>

                {/* Bottom hover glow line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                  }}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
