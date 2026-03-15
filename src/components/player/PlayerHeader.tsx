import { motion } from "framer-motion";

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
  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        {/* Left: logo */}
        <button
          onClick={() => onViewChange('dashboard')}
          className="font-carnival text-xl tracking-[0.06em] bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent drop-shadow-[0_0_10px_hsl(43_93%_60%/0.3)] shrink-0"
        >
          TFT ARENA
        </button>

        {/* Center: tabs */}
        <nav className="flex flex-1 items-center justify-center gap-1">
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
      </div>
    </header>
  );
}
