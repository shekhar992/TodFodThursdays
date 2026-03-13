import { useArena } from "@/context/ArenaContext";
import { Archive } from "lucide-react";

export function PastEvents() {
  const { events } = useArena();
  const past = events.filter(e => e.isPast);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <Archive className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Past Events
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {past.map(event => (
          <div
            key={event.id}
            className="shrink-0 w-48 rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <div className="mb-2 h-20 rounded-md bg-secondary/50 flex items-center justify-center text-2xl opacity-40">
              📷
            </div>
            <h3 className="font-display text-xs font-semibold truncate">{event.title}</h3>
            <span className="text-[10px] text-muted-foreground">{event.category}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
