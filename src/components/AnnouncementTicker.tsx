import { mockAnnouncements } from '../data/mockData';

export function AnnouncementTicker() {
  const items = [...mockAnnouncements, ...mockAnnouncements]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden bg-[#0F0F1A] border-y border-[#00E5FF22]">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0F0F1A] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0F0F1A] to-transparent z-10 pointer-events-none" />

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
