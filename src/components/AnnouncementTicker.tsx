import type { Announcement } from '../data/mockData';

interface AnnouncementTickerProps {
  announcements: Announcement[];
}

export function AnnouncementTicker({ announcements }: AnnouncementTickerProps) {
  if (announcements.length === 0) {
    return (
      <div className="relative overflow-hidden bg-[#0F0F1A] border-y border-[#00E5FF22]">
        <div className="flex items-center justify-center py-3 gap-2">
          <span className="text-sm text-white/20">📡</span>
          <span className="text-xs text-white/20 uppercase tracking-widest">
            No announcements yet — stay tuned
          </span>
        </div>
      </div>
    );
  }

  const items = [...announcements, ...announcements]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden bg-[#0F0F1A] border-y border-[#00E5FF22]">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#1a0d55] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#1a0d55] to-transparent z-10 pointer-events-none" />

      <div className="flex py-3">
        <div className="ticker-scroll flex items-center whitespace-nowrap gap-0">
          {items.map((item, idx) => (
            <span
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2 px-8"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="text-sm font-medium text-white/80 tracking-wide">
                {item.text}
              </span>
              <span className="mx-4 text-[#00E5FF44]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
