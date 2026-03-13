import { useState } from "react";
import { useArena, ArenaEvent, Team } from "@/context/ArenaContext";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, X, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryColors } from "@/data/mockData";
import { EmojiPicker } from "./EmojiPicker";
import { MediaUploader } from "./MediaUploader";

const CATEGORIES = ["Adventure", "Puzzle", "Physical", "Strategy", "Tech", "Trivia", "Grand Finale"];

type FormData = Omit<ArenaEvent, "id">;

function emptyForm(): FormData {
  return {
    title: "", category: "Adventure", date: "", description: "",
    isPast: false, emoji: "📅", format: "", duration: "",
    rules: [""], pointsBreakdown: [{ place: "🥇 1st", pts: 100 }, { place: "🥈 2nd", pts: 70 }, { place: "🥉 3rd", pts: 50 }],
    hidden: false, image: "",
  };
}

const inputCls = "mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EventForm({ initial, onSave, onCancel }: { initial: FormData; onSave: (f: FormData) => void; onCancel: () => void }) {
  const [f, setF] = useState<FormData>(initial);
  const set = (k: keyof FormData, v: any) => setF(prev => ({ ...prev, [k]: v }));

  const setRule = (i: number, val: string) => setF(p => ({ ...p, rules: p.rules.map((r, j) => j === i ? val : r) }));
  const addRule = () => setF(p => ({ ...p, rules: [...p.rules, ""] }));
  const removeRule = (i: number) => setF(p => ({ ...p, rules: p.rules.filter((_, j) => j !== i) }));

  const setBP = (i: number, field: "place" | "pts", val: string | number) =>
    setF(p => ({ ...p, pointsBreakdown: p.pointsBreakdown.map((b, j) => j === i ? { ...b, [field]: field === "pts" ? Number(val) : val } : b) }));
  const addBP = () => setF(p => ({ ...p, pointsBreakdown: [...p.pointsBreakdown, { place: "", pts: 0 }] }));
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
            <label className={labelCls}>Date *</label>
            <input type="date" value={f.date} onChange={e => set("date", e.target.value)} className={inputCls} />
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
          {f.pointsBreakdown.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={row.place} onChange={e => setBP(i, "place", e.target.value)} className={`${inputCls} mt-0 flex-1`} placeholder="🥇 1st" />
              <input type="number" value={row.pts} onChange={e => setBP(i, "pts", e.target.value)} className={`${inputCls} mt-0 w-20`} placeholder="pts" />
              <button onClick={() => removeBP(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <button onClick={() => canSave && onSave(f)} disabled={!canSave}
          className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors">
          Save Event
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, teams, onEdit, onDelete, onToggleHidden, onMarkComplete }: {
  event: ArenaEvent;
  teams: Team[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
  onMarkComplete: (teamId: string, teamName: string, teamLogo: string, points: number) => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [winTeamId, setWinTeamId] = useState(event.winnerTeamId ?? "");
  const [winPoints, setWinPoints] = useState(String(event.winnerPoints ?? (event.pointsBreakdown[0]?.pts ?? 100)));
  const color = categoryColors[event.category] ?? "#888";

  function applyWinner() {
    const team = teams.find(t => t.id === winTeamId);
    if (!team) return;
    onMarkComplete(team.id, team.name, team.logo, Number(winPoints) || 0);
    setShowComplete(false);
  }
  function clearWinner() {
    onMarkComplete("", "", "", 0);
    setWinTeamId("");
    setShowComplete(false);
  }

  return (
    <div className={`relative rounded-xl border bg-card/50 transition-opacity ${event.hidden ? "opacity-50" : ""}`} style={{ borderColor: `${color}25` }}>
      <div className="h-0.5 absolute top-0 left-0 right-0 rounded-t-xl" style={{ background: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">{event.emoji || "📅"}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: `${color}18`, color }}>{event.category}</span>
                {event.date && <span>{formatDate(event.date)}</span>}
                {event.duration && <span>· {event.duration}</span>}
                {event.isPast && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Past</span>}
                {event.hidden && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">Hidden</span>}
                {event.winnerTeamName && (
                  <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                    🏆 {event.winnerTeamLogo} {event.winnerTeamName} · {event.winnerPoints}pts
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setShowComplete(v => !v)}
              title={event.winnerTeamId ? "Change winner" : "Mark winner"}
              className={`rounded-md p-1.5 transition-colors ${
                event.winnerTeamId ? "text-gold bg-gold/10" : showComplete ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-gold hover:bg-gold/10"
              }`}>
              <Trophy className="h-3.5 w-3.5" />
            </button>
            <button onClick={onToggleHidden} title={event.hidden ? "Unhide" : "Hide"}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              {event.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onEdit} className="rounded-md p-1.5 text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { if (confirmDel) { onDelete(); } else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); } }}
              className={`rounded-md p-1.5 transition-colors ${confirmDel ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
              title={confirmDel ? "Click again to confirm delete" : "Delete"}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {event.format && <p className="mt-1.5 text-xs text-muted-foreground ml-9">{event.format}</p>}
      </div>

      {/* Inline mark-winner panel */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 bg-gold/5 px-4 py-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Winning Team</p>
                <select
                  value={winTeamId}
                  onChange={e => setWinTeamId(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 transition-colors"
                >
                  <option value="">Select team…</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Points</p>
                <input
                  type="number"
                  value={winPoints}
                  onChange={e => setWinPoints(e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 transition-colors"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={applyWinner}
                  disabled={!winTeamId}
                  className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors"
                >
                  <Trophy className="h-3 w-3" /> Set Winner
                </button>
                {event.winnerTeamId && (
                  <button onClick={clearWinner} className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                    Clear
                  </button>
                )}
                <button onClick={() => setShowComplete(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminEvents() {
  const { events, teams, addEvent, updateEvent, deleteEvent } = useArena();
  const [editTarget, setEditTarget] = useState<ArenaEvent | "new" | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [showPast, setShowPast] = useState(false);

  const upcoming = events.filter(e => !e.isPast);
  const past = events.filter(e => e.isPast);

  function openCreate() { setForm(emptyForm()); setEditTarget("new"); }
  function openEdit(e: ArenaEvent) { setForm({ ...e }); setEditTarget(e); }
  function handleSave(f: FormData) {
    editTarget === "new" ? addEvent(f) : updateEvent((editTarget as ArenaEvent).id, f);
    setEditTarget(null);
  }

  function handleMarkComplete(eventId: string, teamId: string, teamName: string, teamLogo: string, points: number) {
    if (!teamId) {
      updateEvent(eventId, { winnerTeamId: undefined, winnerTeamName: undefined, winnerTeamLogo: undefined, winnerPoints: undefined, completedAt: undefined });
    } else {
      updateEvent(eventId, { winnerTeamId: teamId, winnerTeamName: teamName, winnerTeamLogo: teamLogo, winnerPoints: points, completedAt: Date.now(), isPast: true });
    }
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
                <EventCard event={e} teams={teams} onEdit={() => openEdit(e)} onDelete={() => deleteEvent(e.id)} onToggleHidden={() => updateEvent(e.id, { hidden: !e.hidden })} onMarkComplete={(tid, tn, tl, pts) => handleMarkComplete(e.id, tid, tn, tl, pts)} />
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
                    <EventCard key={e.id} event={e} teams={teams} onEdit={() => openEdit(e)} onDelete={() => deleteEvent(e.id)} onToggleHidden={() => updateEvent(e.id, { hidden: !e.hidden })} onMarkComplete={(tid, tn, tl, pts) => handleMarkComplete(e.id, tid, tn, tl, pts)} />
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

