import { useState, useRef, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { ChevronDown, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type PlayerView = 'dashboard' | 'events' | 'puzzles';

interface Props {
  activeView: PlayerView;
  onViewChange: (v: PlayerView) => void;
}

const TABS: { id: PlayerView; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'events',    label: 'Events'    },
  { id: 'puzzles',   label: 'Puzzles'   },
];

export function PlayerHeader({ activeView, onViewChange }: Props) {
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
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: logo */}
        <button
          onClick={() => onViewChange('dashboard')}
          className="font-carnival text-xl tracking-[0.06em] bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent drop-shadow-[0_0_10px_hsl(43_93%_60%/0.3)] shrink-0"
        >
          TFT ARENA
        </button>

        {/* Center: tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {activeView === tab.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-1 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-gold to-amber"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: announcements bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Updates</span>
            {announcements.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-background">
                {announcements.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card p-1 shadow-2xl"
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Latest Updates
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {announcements.slice(0, 10).map(a => (
                    <div key={a.id} className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                      <span className="mt-0.5 text-base shrink-0">📣</span>
                      <span className="text-foreground/90 text-xs leading-relaxed">{a.text}</span>
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
