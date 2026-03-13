import { useArena } from "@/context/ArenaContext";

interface Props {
  section: string;
}

export function AdminPreview({ section }: Props) {
  const { teams, events, announcements, activePuzzle } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const upcoming = events.filter(e => !e.isPast);

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Live Preview
      </h3>

      {section === "events" && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Upcoming ({upcoming.length})</span>
          {upcoming.slice(0, 4).map(e => {
            const d = new Date(e.date);
            return (
              <div key={e.id} className="rounded border border-border/50 bg-secondary/20 p-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold">{d.getDate()}</span>
                  <span className="text-[10px] text-muted-foreground">{d.toLocaleString("default", { month: "short" })}</span>
                </div>
                <p className="text-xs font-medium mt-0.5">{e.title}</p>
              </div>
            );
          })}
        </div>
      )}

      {section === "announcements" && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Latest</span>
          {announcements.slice(0, 5).map(a => (
            <div key={a.id} className="rounded border border-border/50 bg-secondary/20 p-2 text-xs text-foreground/80">
              {a.text}
            </div>
          ))}
        </div>
      )}

      {section === "puzzles" && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">Active Puzzle</span>
          {activePuzzle ? (
            <div className="mt-2 rounded border border-border/50 bg-secondary/20 p-2">
              <p className="text-xs italic text-foreground/80">"{activePuzzle.question}"</p>
              <p className="mt-1 text-[10px] text-primary">{activePuzzle.points} pts</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No active puzzle</p>
          )}
        </div>
      )}

      {section === "scores" && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Leaderboard</span>
          {sorted.map((t, i) => (
            <div key={t.id} className="flex items-center justify-between rounded border border-border/50 bg-secondary/20 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-display text-[10px] font-bold ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>
                  #{i + 1}
                </span>
                <span className="text-xs">{t.name}</span>
              </div>
              <span className={`font-display text-xs font-bold ${i === 0 ? "text-gold" : ""}`}>{t.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
