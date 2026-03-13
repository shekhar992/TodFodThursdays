import { useState } from 'react';
import { Calendar, Megaphone, Puzzle, BarChart3, Shield } from 'lucide-react';
import { AdminEvents } from '../components/admin/AdminEvents';
import { AdminAnnouncements } from '../components/admin/AdminAnnouncements';
import { AdminPuzzles } from '../components/admin/AdminPuzzles';
import { AdminScores } from '../components/admin/AdminScores';
import { AdminPreview } from '../components/admin/AdminPreview';

const sections = [
  { id: 'events',        label: 'Events',        icon: Calendar  },
  { id: 'puzzles',       label: 'Puzzles',       icon: Puzzle    },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'scores',        label: 'Scores',        icon: BarChart3 },
] as const;

type Section = (typeof sections)[number]['id'];

export function AdminDashboard() {
  const [active, setActive] = useState<Section>('events');

  return (
    <div className="min-h-screen bg-background">
      {/* Gold hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 flex h-13 items-center gap-3 border-b border-gold/10 bg-background/95 px-5 backdrop-blur">
        <Shield className="h-4 w-4 text-gold/70" />
        <span className="font-carnival text-base tracking-widest bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">
          TFT ARENA
        </span>
        <span className="h-4 w-px bg-border/60" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Admin Panel
        </span>
      </header>

      <div className="flex min-h-[calc(100vh-53px)]">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-gold/10 bg-card/30 p-4">
          <nav className="space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active === s.id
                    ? 'bg-gold/10 text-gold font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                <s.icon className={`h-4 w-4 shrink-0 transition-colors ${active === s.id ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {s.label}
                {active === s.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main workspace — wider to support full CRUD forms */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {active === 'events'        && <AdminEvents />}
            {active === 'announcements' && <AdminAnnouncements />}
            {active === 'puzzles'       && <AdminPuzzles />}
            {active === 'scores'        && <AdminScores />}
          </div>
        </main>

        {/* Live preview */}
        <aside className="hidden xl:block w-72 shrink-0 border-l border-gold/10 bg-card/20 p-4 overflow-y-auto">
          <AdminPreview section={active} />
        </aside>
      </div>
    </div>
  );
}

