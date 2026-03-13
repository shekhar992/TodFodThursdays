import { useArena } from "@/context/ArenaContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import { categoryColors } from "@/data/mockData";

interface Props { section: string; }

const MEDALS = ["🥇", "🥈", "🥉"];

export function AdminPreview({ section }: Props) {
  const { teams, events, announcements, activePuzzle, completedPuzzles, puzzleSolved } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const upcoming = events.filter(e => !e.isPast && !e.hidden);
  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-4">Live Preview</p>

      {section === "events" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground mb-2">Upcoming ({upcoming.length})</p>
          {upcoming.slice(0, 5).map(e => {
            const color = categoryColors[e.category] ?? "#888";
            return (
              <div key={e.id} className="relative rounded-lg border bg-card/30 p-2.5 overflow-hidden" style={{ borderColor: `${color}20` }}>
                <div className="h-0.5 absolute top-0 left-0 right-0" style={{ background: color }} />
                <div className="flex items-center gap-2">
                  <span className="text-base">{e.emoji || "📅"}</span>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {e.duration ? ` · ${e.duration}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {upcoming.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>}
        </div>
      )}

      {section === "announcements" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground mb-2">Latest ({announcements.length})</p>
          {announcements.slice(0, 6).map(a => (
            <div key={a.id} className="rounded-lg border border-border/50 bg-card/30 px-2.5 py-2 text-[11px] leading-relaxed text-foreground/80">
              📣 {a.text}
            </div>
          ))}
          {announcements.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No announcements yet</p>}
        </div>
      )}

      {section === "puzzles" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground mb-2">Active Puzzle</p>
          {activePuzzle ? (
            <div className="rounded-lg border border-gold/20 bg-card/30 p-3">
              <p className="text-[11px] leading-relaxed text-foreground/90 italic">"{activePuzzle.question}"</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gold">+{activePuzzle.points} pts</span>
                {puzzleSolved && <span className="text-[10px] text-emerald-400 font-bold">✓ Solved</span>}
              </div>
              {activePuzzle.timerRunning && secondsLeft !== null && (
                <p className={`mt-1 font-carnival text-2xl tabular-nums ${secondsLeft <= 30 ? "text-destructive" : "text-gold"}`}>
                  {formatCountdown(secondsLeft)}
                </p>
              )}
              {!activePuzzle.timerRunning && !puzzleSolved && (
                <p className="mt-1 text-[10px] text-muted-foreground">⏸ Timer not started</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No active puzzle</p>
          )}

          {completedPuzzles.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground">Completed ({completedPuzzles.length})</p>
              {completedPuzzles.slice(0, 3).map(p => (
                <div key={p.id} className="rounded-lg border border-border/30 bg-card/20 px-2.5 py-2">
                  <p className="text-[10px] text-foreground/70 italic line-clamp-1">"{p.question}"</p>
                  <p className={`mt-0.5 text-[10px] font-bold ${p.timedOut ? "text-muted-foreground" : "text-emerald-400"}`}>
                    {p.timedOut ? "⏰ Timed out" : `✓ ${p.solvedByLogo ?? ""} ${p.solvedBy ?? "Unknown"}`}
                    {p.solvedByPlayer && ` · ${p.solvedByPlayer}`}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {section === "scores" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground mb-2">Leaderboard</p>
          {sorted.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/20 px-2.5 py-1.5">
              <span className="text-sm w-5 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
              <span className="text-xs flex-1">{t.logo} {t.name}</span>
              <span className={`text-xs font-bold ${i === 0 ? "text-gold" : "text-foreground/70"}`}>{t.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

