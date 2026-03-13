import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { ArrowUpDown } from "lucide-react";

export function AdminScores() {
  const { teams, updateScore } = useArena();
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id || "");
  const [delta, setDelta] = useState("");

  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const selected = teams.find(t => t.id === selectedTeam);
  const deltaNum = parseInt(delta) || 0;
  const preview = selected ? selected.score + deltaNum : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !deltaNum) return;
    updateScore(selectedTeam, deltaNum);
    setDelta("");
  };

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-1">Update Score</h2>
      <p className="text-xs text-muted-foreground mb-6">Adjust a team's score. Preview before submitting.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Team</label>
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber"
          >
            {sorted.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.score} pts
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Score Delta (+/-)</label>
          <input
            type="number"
            value={delta}
            onChange={e => setDelta(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
            placeholder="e.g. +50 or -20"
          />
        </div>

        {selected && deltaNum !== 0 && (
          <div className="rounded-md border border-border/50 bg-secondary/30 p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Preview</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-sm text-muted-foreground">{selected.score}</span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className={`font-display text-sm font-bold ${deltaNum > 0 ? "text-primary" : "text-destructive"}`}>
                {preview}
              </span>
              <span className={`text-xs ${deltaNum > 0 ? "text-primary" : "text-destructive"}`}>
                ({deltaNum > 0 ? "+" : ""}{deltaNum})
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!deltaNum}
          className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-amber-foreground transition-colors hover:bg-amber/90 disabled:opacity-40"
        >
          <ArrowUpDown className="h-4 w-4" />
          Update Score
        </button>
      </form>
    </div>
  );
}
