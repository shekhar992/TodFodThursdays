import type { Announcement } from '../data/mockData';

interface AnnouncementTickerProps {
  announcements: Announcement[];
}

export function AnnouncementTicker({ announcements }: AnnouncementTickerProps) {
  if (announcements.length === 0) {
    return (
      <div
        className="overflow-hidden"
        style={{ background: '#0D1117', borderBottom: '1px solid rgba(56,189,248,0.12)' }}
      >
        <div className="flex items-center justify-center py-2 gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] opacity-30" />
          <span className="text-xs text-[#4D5A70] tracking-wider">
            No announcements — stay tuned
          </span>
        </div>
      </div>
    );
  }

  const items = [...announcements, ...announcements];

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#0D1117', borderBottom: '1px solid rgba(56,189,248,0.12)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0D1117, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0D1117, transparent)' }} />

      <div className="flex py-2.5">
        <div className="ticker-scroll flex items-center whitespace-nowrap gap-0">
          {items.map((item, idx) => (
            <span key={`${item.id}-${idx}`} className="flex items-center gap-2 px-6">
              <span className="text-sm leading-none">{item.emoji}</span>
              <span className="text-xs font-medium text-[#8896A7] tracking-wide">{item.text}</span>
              <span className="mx-3 text-[#38BDF8] opacity-20">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
