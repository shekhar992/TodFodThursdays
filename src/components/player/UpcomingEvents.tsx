import { useArena } from "@/context/ArenaContext";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function UpcomingEvents() {
  const { events } = useArena();
  const upcoming = events.filter(e => !e.isPast);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Upcoming Events</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((event, i) => {
          const d = new Date(event.date);
          const day = d.getDate();
          const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span className="font-display text-2xl font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold leading-tight">{event.title}</h3>
                  <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {event.category}
                  </span>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Soon
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
