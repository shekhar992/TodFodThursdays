import { useState, useRef, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { ChevronDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PlayerHeader() {
  const { announcements } = useArena();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-lg font-bold tracking-tight">
            TFT2 Arena
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Season 2 · Live
          </span>
          <nav className="hidden md:flex items-center gap-4">
            {["Dashboard", "Events", "Puzzles"].map(link => (
              <button key={link} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </button>
            ))}
          </nav>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Latest
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {announcements.length}
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card p-1 shadow-xl"
              >
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Announcements
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {announcements.slice(0, 10).map(a => (
                    <div key={a.id} className="flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                      <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground/90">{a.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
