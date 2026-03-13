import { useState } from "react";
import { Calendar, Megaphone, Puzzle, BarChart3, Users, UserCheck, Shield } from "lucide-react";
import { AdminEvents } from "./AdminEvents";
import { AdminAnnouncements } from "./AdminAnnouncements";
import { AdminPuzzles } from "./AdminPuzzles";
import { AdminScores } from "./AdminScores";
import { AdminPreview } from "./AdminPreview";
import { AdminUsers } from "./AdminUsers";
import { AdminPlayers } from "./AdminPlayers";
import { AdminTeams } from "./AdminTeams";

const sections = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "puzzles", label: "Puzzles", icon: Puzzle },
  { id: "scores", label: "Scores", icon: BarChart3 },
  { id: "teams", label: "Teams", icon: Shield },
  { id: "players", label: "Players", icon: UserCheck },
  { id: "users", label: "Admin Users", icon: Users },
] as const;

type Section = (typeof sections)[number]["id"];

export function AdminPanel() {
  const [active, setActive] = useState<Section>("events");

  return (
    <div className="min-h-screen bg-background">
      {/* Amber top border */}
      <div className="h-0.5 bg-amber" />

      <div className="flex min-h-[calc(100vh-2px)]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-card/50 p-4">
          <h1 className="font-display text-sm font-bold text-amber mb-1">TFT2 Admin</h1>
          <p className="text-[10px] text-muted-foreground mb-6">Control Panel</p>

          <nav className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active === s.id
                    ? "bg-amber/10 text-amber font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main workspace */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-xl">
            {active === "events" && <AdminEvents />}
            {active === "announcements" && <AdminAnnouncements />}
            {active === "puzzles" && <AdminPuzzles />}
            {active === "scores" && <AdminScores />}
            {active === "teams" && <AdminTeams />}
            {active === "players" && <AdminPlayers />}
            {active === "users" && <AdminUsers />}
          </div>
        </main>

        {/* Live preview */}
        <aside className="hidden xl:block w-80 shrink-0 border-l border-border bg-card/30 p-4 overflow-y-auto">
          <AdminPreview section={active} />
        </aside>
      </div>
    </div>
  );
}
