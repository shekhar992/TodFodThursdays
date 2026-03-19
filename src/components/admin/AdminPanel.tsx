import { useState } from "react";
import { Calendar, Megaphone, Puzzle, BarChart3, Users, UserCheck, Shield, Tv, Send } from "lucide-react";
import { AdminEvents } from "./AdminEvents";
import { AdminAnnouncements } from "./AdminAnnouncements";
import { AdminPuzzles } from "./AdminPuzzles";
import { AdminScores } from "./AdminScores";
import { AdminPreview } from "./AdminPreview";
import { AdminUsers } from "./AdminUsers";
import { AdminPlayers } from "./AdminPlayers";
import { AdminTeams } from "./AdminTeams";
import { useArena } from "@/context/ArenaContext";

const QUICK_PRESETS = ["🧩 Puzzle is live!", "⏰ Round ended!", "🏆 Check the leaderboard!", "📍 Move to next station", "🎉 Last round — give it your all!"];

function QuickAnnounce() {
  const { addAnnouncement } = useArena();
  const [text, setText] = useState("");
  const MAX = 120;
  function post(msg: string) {
    if (!msg.trim()) return;
    addAnnouncement(msg.trim());
    setText("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">Quick post:</span>
        {QUICK_PRESETS.map(p => (
          <button
            key={p}
            onClick={() => setText(p)}
            className="rounded-full border border-border/60 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-gold/40 hover:bg-gold/5 transition-colors whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX))}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) post(text); }}
            className="w-full rounded-lg border border-border/70 bg-background/60 px-3 py-1.5 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors"
            placeholder="Custom announcement… (Enter to post)"
          />
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums pointer-events-none ${
            text.length > MAX * 0.85 ? "text-amber-400" : "text-muted-foreground/50"
          }`}>
            {text.length}/{MAX}
          </span>
        </div>
        <button
          onClick={() => post(text)}
          disabled={!text.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="h-3 w-3" /> Post
        </button>
      </div>
    </div>
  );
}

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
  const { stageMode, setStageModeActive } = useArena();

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

          {/* Stage Board launcher */}
          <div className="mt-6 pt-4 border-t border-border/40 space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Stage Board
            </p>

            {/* Registration Board */}
            <button
              onClick={() => window.open("/stage?mode=registration", "_blank", "noopener,noreferrer")}
              className="flex w-full items-center gap-2.5 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Registration Board</span>
            </button>

            {/* Season Board */}
            <button
              onClick={() => {
                setStageModeActive(true);
                window.open("/stage?mode=season", "_blank", "noopener,noreferrer");
              }}
              className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                stageMode
                  ? "border-red-500/25 bg-red-500/15 text-red-400 shadow-[0_0_12px_hsl(0_80%_60%/0.15)]"
                  : "border-transparent text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              }`}
            >
              <Tv className="h-4 w-4 shrink-0" />
              <span>{stageMode ? "● Season ON" : "Season Board"}</span>
            </button>

            {stageMode && (
              <button
                onClick={() => setStageModeActive(false)}
                className="flex w-full items-center rounded-md px-3 py-1 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <span className="ml-6">Turn off stage</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main workspace */}
        <main className="flex-1 overflow-y-auto">
          {/* Sticky quick-announce bar */}
          <div className="sticky top-0 z-20 px-6 py-3 bg-background/90 backdrop-blur-md border-b border-border/40">
            <QuickAnnounce />
          </div>
          <div className="p-6">
          <div className="max-w-2xl">
            {active === "events" && <AdminEvents />}
            {active === "announcements" && <AdminAnnouncements />}
            {active === "puzzles" && <AdminPuzzles />}
            {active === "scores" && <AdminScores />}
            {active === "teams" && <AdminTeams />}
            {active === "players" && <AdminPlayers />}
            {active === "users" && <AdminUsers />}
          </div>
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
