import { useArena } from "@/context/ArenaContext";

export function AnnouncementTicker() {
  const { announcements } = useArena();

  if (announcements.length === 0) return null;

  // Pinned items first, then recents
  const sorted = [
    ...announcements.filter(a => a.pinned),
    ...announcements.filter(a => !a.pinned),
  ];

  // Double the list so the seamless loop works
  const doubled = [...sorted, ...sorted];

  return (
    <div className="relative overflow-hidden border-b border-gold/30 bg-gradient-to-r from-[hsl(248_32%_5%)] via-[hsl(270_40%_8%)] to-[hsl(248_32%_5%)]">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[hsl(248_32%_5%)] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[hsl(248_32%_5%)] to-transparent" />

      <div
        className="flex gap-0 py-2 w-max"
        style={{ animation: "ticker-scroll 55s linear infinite" }}
      >
        {doubled.map((a, i) => (
          <span key={i} className="flex items-center shrink-0">
            {a.pinned && (
              <span className="ml-4 mr-1 text-[9px] text-gold/60">📌</span>
            )}
            <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap px-6 ${
              a.pinned ? "text-gold" : "text-gold/80"
            }`}>
              {a.text}
            </span>
            <span className="text-gold/40 text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
