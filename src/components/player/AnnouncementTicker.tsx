import { useArena } from "@/context/ArenaContext";

export function AnnouncementTicker() {
  const { announcements } = useArena();

  const items = announcements.length > 0
    ? announcements.map(a => a.text)
    : ["TFT Arena Season 2 is LIVE", "Leaderboard updates every 15 min", "Next event: Thursday 7PM IST", "Top teams battle for the championship"];

  // Double the list so the seamless loop works
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-gold/30 bg-gradient-to-r from-[hsl(248_32%_5%)] via-[hsl(270_40%_8%)] to-[hsl(248_32%_5%)]">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[hsl(248_32%_5%)] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[hsl(248_32%_5%)] to-transparent" />

      <div
        className="flex gap-0 py-2 w-max"
        style={{ animation: "ticker-scroll 30s linear infinite" }}
      >
        {doubled.map((text, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gold/80 whitespace-nowrap px-6">
              {text}
            </span>
            <span className="text-gold/40 text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
