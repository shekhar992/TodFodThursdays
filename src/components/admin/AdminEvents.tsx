import { useState } from "react";
import { useArena, ArenaEvent, Team } from "@/context/ArenaContext";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, X, ChevronDown, ChevronUp, Trophy, Play, Square, Zap, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryColors } from "@/data/mockData";
import { EmojiPicker } from "./EmojiPicker";
import { MediaUploader } from "./MediaUploader";

const CATEGORIES = ["Adventure", "Puzzle", "Physical", "Strategy", "Tech", "Trivia", "Grand Finale"];

type FormData = Omit<ArenaEvent, "id">;
type ResultEntry = { place: string; pts: number; teamId?: string; teamName?: string; teamLogo?: string };

function emptyForm(): FormData {
  return {
    title: "", category: "Adventure", date: "", description: "",
    isPast: false, emoji: "📅", format: "", duration: "",
    rules: [""], pointsBreakdown: [{ place: "🥇 1st", pts: 100 }, { place: "🥈 2nd", pts: 70 }, { place: "🥉 3rd", pts: 50 }],
    hidden: false, image: "", status: 'scheduled', results: [],
  };
}

const inputCls = "mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function formatDate(d: string) {
  // Handle both "2026-04-15" and "2026-04-15T18:30" formats
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  const hasTime = d.includes('T') && !d.endsWith('T00:00');
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    (hasTime ? ' ' + parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true }) : '');
}

function EventForm({ initial, onSave, onCancel }: { initial: FormData; onSave: (f: FormData) => void; onCancel: () => void }) {
  const [f, setF] = useState<FormData>(initial);
  const set = (k: keyof FormData, v: any) => setF(prev => ({ ...prev, [k]: v }));

  const setRule = (i: number, val: string) => setF(p => ({ ...p, rules: p.rules.map((r, j) => j === i ? val : r) }));
  const addRule = () => setF(p => ({ ...p, rules: [...p.rules, ""] }));
  const removeRule = (i: number) => setF(p => ({ ...p, rules: p.rules.filter((_, j) => j !== i) }));

  const setBP = (i: number, field: "place" | "pts", val: string | number) =>
    setF(p => ({ ...p, pointsBreakdown: p.pointsBreakdown.map((b, j) => j === i ? { ...b, [field]: field === "pts" ? Number(val) : val } : b) }));
  const addBP = () => setF(p => {
    const i = p.pointsBreakdown.length;
    const place = i === 0 ? "🥇 1st" : i === 1 ? "🥈 2nd" : i === 2 ? "🥉 3rd" : `#${i + 1}`;
    return { ...p, pointsBreakdown: [...p.pointsBreakdown, { place, pts: 0 }] };
  });
  const removeBP = (i: number) => setF(p => ({ ...p, pointsBreakdown: p.pointsBreakdown.filter((_, j) => j !== i) }));

  const canSave = f.title.trim() && f.date;

  return (
    <div className="space-y-5">
      <button onClick={onCancel} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to events
      </button>

      {/* Core fields */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div>
            <label className={labelCls}>Emoji</label>
            <EmojiPicker value={f.emoji} onChange={v => set("emoji", v)} />
          </div>
          <div>
            <label className={labelCls}>Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className={inputCls} placeholder="Event name" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select value={f.category} onChange={e => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date &amp; Time *</label>
            <input type="datetime-local" value={f.date} onChange={e => set("date", e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Format</label>
            <input value={f.format} onChange={e => set("format", e.target.value)} className={inputCls} placeholder="e.g. Team of 4 · Campus-wide" />
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <input value={f.duration} onChange={e => set("duration", e.target.value)} className={inputCls} placeholder="e.g. 90 min" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={2} value={f.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} placeholder="One-line player-facing description" />
        </div>

        {/* Media upload */}
        <div>
          <label className={labelCls}>Cover Image / Video</label>
          <MediaUploader value={f.image ?? ""} onChange={url => set("image", url)} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={f.isPast} onChange={e => set("isPast", e.target.checked)} className="rounded accent-gold" />
            <span className="text-xs text-muted-foreground">Mark as past event</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={f.hidden} onChange={e => set("hidden", e.target.checked)} className="rounded accent-gold" />
            <span className="text-xs text-muted-foreground">Hide from players</span>
          </label>
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className={labelCls}>Rules</p>
          <button onClick={addRule} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors">
            <Plus className="h-3 w-3" /> Add rule
          </button>
        </div>
        <div className="space-y-2">
          {f.rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground w-5 shrink-0 text-right">{String(i + 1).padStart(2, "0")}</span>
              <input value={rule} onChange={e => setRule(i, e.target.value)} className={`${inputCls} mt-0 flex-1`} placeholder={`Rule ${i + 1}`} />
              <button onClick={() => removeRule(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Points breakdown */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className={labelCls}>Points Breakdown</p>
          <button onClick={addBP} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors">
            <Plus className="h-3 w-3" /> Add row
          </button>
        </div>
        <div className="space-y-2">
          {f.pointsBreakdown.map((row, i) => {
            const placeLabel = i === 0 ? "🥇 1st" : i === 1 ? "🥈 2nd" : i === 2 ? "🥉 3rd" : `#${i + 1}`;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm w-16 shrink-0 text-muted-foreground font-medium">{placeLabel}</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={row.pts} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setBP(i, "pts", v); }} className={`${inputCls} mt-0 flex-1`} placeholder="pts" />
                {i >= 3
                  ? <button onClick={() => removeBP(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                  : <span className="w-[22px] shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <button onClick={() => canSave && onSave({
          ...f,
          pointsBreakdown: f.pointsBreakdown.map((row, i) => ({
            ...row,
            place: i === 0 ? "🥇 1st" : i === 1 ? "🥈 2nd" : i === 2 ? "🥉 3rd" : `#${i + 1}`,
          })),
        })} disabled={!canSave}
          className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors">
          Save Event
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, teams, onEdit, onDelete, onToggleHidden, onGoLive, onEndEvent, onMarkComplete, onUpdateMemories }: {
  event: ArenaEvent;
  teams: Team[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  onGoLive: () => void;
  onEndEvent: () => void;
  onMarkComplete: (results: ResultEntry[]) => void;
  onUpdateMemories: (memories: string[]) => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  // Per-team points map: teamId → pts string
  const [ptsMap, setPtsMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    teams.forEach(t => { m[t.id] = "0"; });
    // Pre-fill from existing results
    event.results?.forEach(r => { if (r.teamId) m[r.teamId] = String(r.pts); });
    return m;
  });

  const color = categoryColors[event.category] ?? "#888";
  const isLive      = event.status === 'live';
  const isCompleted = event.status === 'completed' || (event.isPast && event.status !== 'live');
  const isScheduled = !isLive && !isCompleted;
  const alreadyHasResults = event.results?.some(r => r.teamId);

  function handleEnd() {
    onEndEvent();
    // Reset pts map fresh from any prior results when panel opens
    const fresh: Record<string, string> = {};
    teams.forEach(t => { fresh[t.id] = "0"; });
    event.results?.forEach(r => { if (r.teamId) fresh[r.teamId] = String(r.pts); });
    setPtsMap(fresh);
    setShowResults(true);
  }

  function handleOpenResults() {
    const fresh: Record<string, string> = {};
    teams.forEach(t => { fresh[t.id] = "0"; });
    event.results?.forEach(r => { if (r.teamId) fresh[r.teamId] = String(r.pts); });
    setPtsMap(fresh);
    setShowResults(v => !v);
  }

  function quickFill() {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const fresh: Record<string, string> = {};
    teams.forEach(t => { fresh[t.id] = "0"; });
    event.pointsBreakdown.forEach((row, i) => {
      const team = sorted[i];
      if (team) fresh[team.id] = String(row.pts);
    });
    setPtsMap(fresh);
  }

  function confirmResults() {
    const results: ResultEntry[] = teams
      .map(t => ({ teamId: t.id, teamName: t.name, teamLogo: t.logo, pts: parseInt(ptsMap[t.id] ?? "0") || 0, place: "" }))
      .filter(r => r.pts > 0);
    // Sort by pts desc, assign place labels from breakdown if available
    results.sort((a, b) => b.pts - a.pts);
    results.forEach((r, i) => { r.place = event.pointsBreakdown[i]?.place ?? `#${i + 1}`; });
    onMarkComplete(results);
    setShowResults(false);
  }

  function clearResults() {
    const fresh: Record<string, string> = {};
    teams.forEach(t => { fresh[t.id] = "0"; });
    setPtsMap(fresh);
    onMarkComplete([]);
    setShowResults(false);
  }

  const totalAwarded = teams.reduce((s, t) => s + (parseInt(ptsMap[t.id] ?? "0") || 0), 0);

  return (
    <div
      className={`relative rounded-xl border bg-card/50 transition-opacity ${event.hidden ? "opacity-50" : ""}`}
      style={{ borderColor: isLive ? "hsl(0 80% 50% / 0.5)" : `${color}25` }}
    >
      {/* Top colour bar */}
      <div
        className="h-0.5 absolute top-0 left-0 right-0 rounded-t-xl"
        style={{ background: isLive ? "hsl(0 72% 55%)" : color }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: info */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">{event.emoji || "📅"}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${color}18`, color }}>{event.category}</span>
                {event.date && <span>{formatDate(event.date)}</span>}
                {event.duration && <span>· {event.duration}</span>}
                {isLive && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-400/10"
                  >
                    ● LIVE
                  </motion.span>
                )}
                {isCompleted && (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10">✓ DONE</span>
                )}
                {event.hidden && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">Hidden</span>}
                {alreadyHasResults && (
                  <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                    🏆 Results recorded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* ▶ Go Live — scheduled non-past events */}
            {isScheduled && !event.isPast && (
              <button
                onClick={onGoLive}
                title="Go Live"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-colors"
              >
                <Play className="h-3 w-3 fill-current" /> Live
              </button>
            )}
            {/* ■ End — live events */}
            {isLive && (
              <button
                onClick={handleEnd}
                title="End event & enter results"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
              >
                <Square className="h-3 w-3 fill-current" /> End
              </button>
            )}
            {/* 📷 Photos — completed/past events */}
            {isCompleted && (
              <button
                onClick={() => setShowPhotos(v => !v)}
                title="Upload event photos"
                className={`rounded-md p-1.5 transition-colors ${
                  showPhotos || (event.memories && event.memories.length > 0)
                    ? "text-sky-400 bg-sky-400/10"
                    : "text-muted-foreground hover:text-sky-400 hover:bg-sky-400/10"
                }`}
              >
                <Images className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Trophy — view/edit results */}
            <button
              onClick={handleOpenResults}
              title="View / edit results"
              className={`rounded-md p-1.5 transition-colors ${
                alreadyHasResults || showResults
                  ? "text-gold bg-gold/10"
                  : "text-muted-foreground hover:text-gold hover:bg-gold/10"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
            </button>
            <button onClick={onToggleHidden} title={event.hidden ? "Unhide" : "Hide"}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              {event.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onEdit}
              className="rounded-md p-1.5 text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { if (confirmDel) { onDelete(); } else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); } }}
              className={`rounded-md p-1.5 transition-colors ${confirmDel ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
              title={confirmDel ? "Click again to confirm" : "Delete"}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {event.format && <p className="mt-1.5 text-xs text-muted-foreground ml-9">{event.format}</p>}
      </div>

      {/* ── Photos panel ──────────────────────────────────── */}
      <AnimatePresence>
        {showPhotos && isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 bg-card/60 px-4 pt-4 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Event Photos</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Upload memories from this event. Each upload is appended.</p>
                </div>
                <button onClick={() => setShowPhotos(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Existing photos grid */}
              {(event.memories ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {(event.memories ?? []).map((url, i) => (
                    <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-muted/30">
                      <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new photo */}
              <MediaUploader
                value=""
                onChange={url => {
                  if (!url) return;
                  const existing = event.memories ?? [];
                  onUpdateMemories([...existing, url]);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 bg-card/60 px-4 pt-4 pb-5 space-y-4">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Enter event results</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Set points earned per team. Zero = didn't place.</p>
                </div>
                <div className="flex items-center gap-2">
                  {event.pointsBreakdown.length > 0 && (
                    <button
                      onClick={quickFill}
                      title="Auto-fill top teams from breakdown"
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-gold/80 hover:text-gold hover:bg-gold/10 border border-gold/20 hover:border-gold/40 transition-colors"
                    >
                      <Zap className="h-3 w-3" /> Quick fill
                    </button>
                  )}
                  <button onClick={() => setShowResults(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {alreadyHasResults && (
                <p className="text-[10px] text-amber-400/90 bg-amber-400/8 rounded-lg px-3 py-2">
                  ⚠ Results already applied. Re-confirming will add points on top of existing scores.
                </p>
              )}

              {/* Per-team input grid — sorted by current score so 1st place is at top */}
              <div className="space-y-2">
                {[...teams].sort((a, b) => b.score - a.score).map((team, idx) => {
                  const pts = ptsMap[team.id] ?? "0";
                  const ptsNum = parseInt(pts) || 0;
                  return (
                    <div key={team.id} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-background/40 border border-border/30">
                      <span className="text-[10px] text-muted-foreground shrink-0 w-4">#{idx + 1}</span>
                      <span className="text-base shrink-0">{team.logo}</span>
                      <span className="flex-1 text-sm font-medium text-foreground truncate">{team.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right tabular-nums">
                        now: {team.score}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick –/+ nudge buttons */}
                        {event.pointsBreakdown.map(row => (
                          <button
                            key={row.pts}
                            onClick={() => setPtsMap(p => ({ ...p, [team.id]: String(row.pts) }))}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                              ptsNum === row.pts
                                ? "bg-gold/20 text-gold border border-gold/30"
                                : "text-muted-foreground hover:text-gold hover:bg-gold/10 border border-transparent"
                            }`}
                          >
                            {row.pts}
                          </button>
                        ))}
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={pts}
                          onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setPtsMap(p => ({ ...p, [team.id]: v })); }}
                          className="w-16 rounded-lg border border-border/70 bg-background/60 px-2 py-1 text-center text-sm font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={confirmResults}
                  className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-1.5 text-xs font-bold text-background hover:bg-gold/90 transition-colors"
                >
                  <Trophy className="h-3.5 w-3.5" /> Confirm & Apply
                </button>
                {alreadyHasResults && (
                  <button onClick={clearResults} className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                    Clear results
                  </button>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                  {totalAwarded > 0 ? `${totalAwarded} pts total` : ""}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminEvents() {
  const { events, teams, addEvent, updateEvent, deleteEvent, updateScore } = useArena();
  const [editTarget, setEditTarget] = useState<ArenaEvent | "new" | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [showPast, setShowPast] = useState(false);

  const upcoming = events
    .filter(e => !e.isPast)
    .sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : 0));
  const past = events.filter(e => e.isPast);

  function openCreate() { setForm(emptyForm()); setEditTarget("new"); }
  function openEdit(e: ArenaEvent) { setForm({ ...e }); setEditTarget(e); }
  function handleSave(f: FormData) {
    editTarget === "new" ? addEvent(f) : updateEvent((editTarget as ArenaEvent).id, f);
    setEditTarget(null);
  }

  function handleMarkComplete(eventId: string, results: ResultEntry[]) {
    if (results.length === 0) {
      updateEvent(eventId, {
        winnerTeamId: undefined, winnerTeamName: undefined, winnerTeamLogo: undefined,
        winnerPoints: undefined, completedAt: undefined, results: [],
        status: 'scheduled', isPast: false,
      });
      return;
    }
    // Apply points — each team gets exactly the pts entered
    results.forEach(r => { if (r.teamId && r.pts > 0) updateScore(r.teamId, r.pts); });
    const first = results[0]; // already sorted by pts desc in confirmResults
    updateEvent(eventId, {
      isPast: true, status: 'completed', completedAt: Date.now(), results,
      winnerTeamId: first.teamId, winnerTeamName: first.teamName,
      winnerTeamLogo: first.teamLogo, winnerPoints: first.pts,
    });
  }

  if (editTarget !== null) {
    return <EventForm initial={form} onSave={handleSave} onCancel={() => setEditTarget(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-carnival text-2xl tracking-wide text-gold">Events</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Full control over Season 2 events — create, edit, hide, or delete.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-background hover:bg-gold/90 transition-colors">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      <section>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upcoming ({upcoming.length})</p>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-8 text-center text-sm text-muted-foreground">
            No upcoming events — click New Event to add one.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(e => (
              <motion.div key={e.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EventCard event={e} teams={teams} onEdit={() => openEdit(e)} onDelete={() => deleteEvent(e.id)} onToggleHidden={() => updateEvent(e.id, { hidden: !e.hidden })} onGoLive={() => updateEvent(e.id, { status: 'live' })} onEndEvent={() => updateEvent(e.id, { status: 'completed' })} onMarkComplete={(results) => handleMarkComplete(e.id, results)} onUpdateMemories={(mems) => updateEvent(e.id, { memories: mems })} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <button onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-2">
            {showPast ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Past Events ({past.length})
          </button>
          <AnimatePresence>
            {showPast && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-2">
                  {past.map(e => (
                    <EventCard key={e.id} event={e} teams={teams} onEdit={() => openEdit(e)} onDelete={() => deleteEvent(e.id)} onToggleHidden={() => updateEvent(e.id, { hidden: !e.hidden })} onGoLive={() => updateEvent(e.id, { status: 'live' })} onEndEvent={() => updateEvent(e.id, { status: 'completed' })} onMarkComplete={(results) => handleMarkComplete(e.id, results)} onUpdateMemories={(mems) => updateEvent(e.id, { memories: mems })} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}

