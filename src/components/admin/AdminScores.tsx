import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";

const inputCls = "mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const MEDALS = ["🥇", "🥈", "🥉"];

export function AdminScores() {
  const { teams, updateScore } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const [selectedTeam, setSelectedTeam] = useState(sorted[0]?.id || "");
  const [delta, setDelta] = useState("");

  const selected = teams.find(t => t.id === selectedTeam);
  const deltaNum = parseInt(delta) || 0;
  const preview = selected ? selected.score + deltaNum : 0;
  const isPositive = deltaNum > 0;
  const isNegative = deltaNum < 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeam || !deltaNum) return;
    updateScore(selectedTeam, deltaNum);
    setDelta("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-carnival text-2xl tracking-wide text-gold">Scores</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Adjust team scores. Changes reflect on the leaderboard instantly.</p>
      </div>

      {/* Current standings mini-board */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        <p className={`${labelCls} mb-3`}>Current Standings</p>
        <div className="space-y-1.5">
          {sorted.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-background/40">
              <span className="text-sm w-5 shrink-0 text-center">{MEDALS[i] ?? `#${i + 1}`}</span>
              <span className="text-sm flex-1 font-medium">{t.logo} {t.name}</span>
              <span className={`font-carnival text-sm font-bold ${i === 0 ? "text-gold" : "text-foreground/80"}`}>{t.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score adjustment */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <p className={`${labelCls} mb-4`}>Adjust Score</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Team</label>
            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className={inputCls}>
              {sorted.map(t => <option key={t.id} value={t.id}>{t.logo} {t.name} — {t.score} pts</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Score Delta (+/-)</label>
            <input
              type="number"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              className={inputCls}
              placeholder="e.g. +50 or -20"
            />
          </div>

          {selected && deltaNum !== 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">{selected.score}</span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className={`font-carnival text-lg font-bold ${isPositive ? "text-gold" : isNegative ? "text-destructive" : ""}`}>{preview}</span>
              <span className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-gold" : "text-destructive"}`}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                ({isPositive ? "+" : ""}{deltaNum})
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!deltaNum}
            className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" /> Update Score
          </button>
        </form>
      </div>
    </div>
  );
}

