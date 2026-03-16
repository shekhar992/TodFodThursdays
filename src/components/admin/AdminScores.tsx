import { useRef, useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MEDALS = ["🥇", "🥈", "🥉"];
const QUICK = [50, 100, 200];

export function AdminScores() {
  const { teams, updateScore } = useArena();
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(teamId: string, currentScore: number) {
    setEditingId(teamId);
    setDraft(String(currentScore));
    setTimeout(() => { inputRef.current?.select(); }, 30);
  }

  function commitEdit(team: { id: string; score: number }) {
    const newScore = parseInt(draft);
    if (!isNaN(newScore) && newScore !== team.score) {
      updateScore(team.id, newScore - team.score);
    }
    setEditingId(null);
  }

  function cancelEdit() { setEditingId(null); }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-carnival text-2xl tracking-wide text-gold">Scores</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Click a score to edit directly, or use the quick buttons for fast adjustments.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((team, i) => {
          const isEditing = editingId === team.id;
          const draftNum = parseInt(draft);
          const delta = isEditing && !isNaN(draftNum) ? draftNum - team.score : 0;
          const color = team.color ?? "hsl(43 93% 60%)";

          return (
            <motion.div
              key={team.id}
              layout
              className="relative rounded-xl border border-border/50 bg-card/40 overflow-hidden"
              style={{ borderColor: isEditing ? `${color}60` : undefined }}
            >
              {/* Left colour accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: color }} />

              <div className="pl-4 pr-3 py-3 flex items-center gap-3">
                {/* Rank */}
                <span className="text-base w-7 shrink-0 text-center">
                  {MEDALS[i] ?? <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>}
                </span>

                {/* Logo + Name */}
                <span className="text-xl shrink-0">{team.logo}</span>
                <span className="flex-1 text-sm font-semibold text-foreground truncate">{team.name}</span>

                {/* Quick –/+ buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {QUICK.slice().reverse().map(q => (
                    <button
                      key={`-${q}`}
                      onClick={() => updateScore(team.id, -q)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors tabular-nums"
                    >
                      -{q}
                    </button>
                  ))}
                </div>

                {/* Score — click to edit */}
                <AnimatePresence mode="wait" initial={false}>
                  {isEditing ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        ref={inputRef}
                        type="number"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); return; }
                          if (e.key === "Enter") commitEdit(team);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        onBlur={() => commitEdit(team)}
                        onWheel={e => e.currentTarget.blur()}
                        className="w-20 rounded-lg border border-gold/50 bg-gold/5 px-2 py-1 text-center font-carnival text-sm font-bold text-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
                      />
                      {delta !== 0 && (
                        <span className={`text-[10px] font-bold tabular-nums ${delta > 0 ? "text-emerald-400" : "text-destructive"}`}>
                          {delta > 0 ? "+" : ""}{delta}
                        </span>
                      )}
                      <button onMouseDown={e => { e.preventDefault(); commitEdit(team); }} className="rounded p-0.5 text-emerald-400 hover:bg-emerald-400/10 transition-colors">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onMouseDown={e => { e.preventDefault(); cancelEdit(); }} className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="score"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => startEdit(team.id, team.score)}
                      title="Click to edit score"
                      className="font-carnival text-base font-bold tabular-nums rounded-lg px-2 py-1 hover:bg-gold/10 hover:text-gold transition-colors cursor-text"
                      style={{ color: i === 0 ? "hsl(43 93% 60%)" : undefined }}
                    >
                      {team.score}
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Quick + buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {QUICK.map(q => (
                    <button
                      key={`+${q}`}
                      onClick={() => updateScore(team.id, q)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors tabular-nums"
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Quick buttons apply instantly · Click score to set an exact value
      </p>
    </div>
  );
}

