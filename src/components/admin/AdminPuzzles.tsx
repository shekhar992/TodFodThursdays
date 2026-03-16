import { useState, useEffect } from "react";
import { useArena } from "@/context/ArenaContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Zap, Play, Square, Trophy, Clock, AlertCircle, Plus,
  Trash2, BookOpen, ChevronDown, ChevronUp, Library, Pencil, Lock, X, Eye, EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────
interface LibraryPuzzle {
  id: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
  timeLimit: number;
  scheduledFor?: number;  // ms timestamp — launch at this time
  createdAt: number;
}

const TIME_OPTIONS = [
  { label: "30 sec", secs: 30  },
  { label: "1 min",  secs: 60  },
  { label: "2 min",  secs: 120 },
];

const SEED_LIBRARY: LibraryPuzzle[] = [
  {
    id: "lib-1",
    question: "I have cities but no houses live there. I have mountains but no trees grow there. I have water but no fish swim there. What am I?",
    answer: "A map",
    points: 75,
    hint: "Think flat and paper.",
    timeLimit: 180,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "lib-2",
    question: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
    points: 50,
    timeLimit: 120,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "lib-3",
    question: "What has hands but can't clap?",
    answer: "A clock",
    points: 40,
    hint: "It's on the wall.",
    timeLimit: 60,
    createdAt: Date.now() - 86400000,
  },
];

const inputCls = "mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function formatTs(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function timeLabelFor(secs: number) {
  const match = TIME_OPTIONS.find(t => t.secs === secs);
  if (match) return match.label;
  if (secs % 60 === 0) return `${secs / 60} min`;
  return secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
}

// ── LibraryCard ────────────────────────────────────────────────────────────
function LibraryCard({ pz, onLaunch, onSave, onDelete, isLocked, isEditing, onEditToggle }: {
  pz: LibraryPuzzle; onLaunch: () => void; onSave: (updated: LibraryPuzzle) => void;
  onDelete: () => void; isLocked: boolean; isEditing: boolean; onEditToggle: () => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [q, setQ] = useState(pz.question);
  const [a, setA] = useState(pz.answer);
  const [pts, setPts] = useState(String(pz.points));
  const [h, setH] = useState(pz.hint ?? "");
  const [tl, setTl] = useState(pz.timeLimit);
  const [sf, setSf] = useState(""); // scheduledFor as datetime-local string

  useEffect(() => {
    if (isEditing) {
      setQ(pz.question); setA(pz.answer);
      setPts(String(pz.points)); setH(pz.hint ?? ""); setTl(pz.timeLimit);
      setSf(pz.scheduledFor ? new Date(pz.scheduledFor).toISOString().slice(0, 16) : "");
    }
  }, [isEditing]);

  const canSave = q.trim() && a.trim();

  if (isEditing) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Editing</span>
          <button onClick={onEditToggle} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <label className={labelCls}>Question *</label>
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={2} autoFocus
            className={`${inputCls} resize-none`} placeholder="Riddle or question…" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Answer *</label>
            <input value={a} onChange={e => setA(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Points</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={pts} onChange={e => setPts(e.target.value.replace(/[^0-9]/g, ''))} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Hint</label>
            <input value={h} onChange={e => setH(e.target.value)} className={inputCls} placeholder="Optional hint" />
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <select value={tl} onChange={e => setTl(Number(e.target.value))} className={inputCls}>
              {TIME_OPTIONS.map(t => <option key={t.secs} value={t.secs}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Schedule For (optional)</label>
          <input type="datetime-local" value={sf} onChange={e => setSf(e.target.value)} className={inputCls} />
          <p className="mt-0.5 text-[10px] text-muted-foreground">Leave blank to launch immediately. If set, puzzle auto-starts at this time.</p>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onEditToggle}
            className="flex-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button disabled={!canSave}
            onClick={() => { onSave({ ...pz, question: q.trim(), answer: a.trim(), points: parseInt(pts) || 50, hint: h.trim() || undefined, timeLimit: tl, scheduledFor: sf ? new Date(sf).getTime() : undefined }); onEditToggle(); }}
            className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-background disabled:opacity-40 hover:bg-gold/90 transition-colors">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col gap-3">
      <p className="text-sm text-foreground leading-relaxed line-clamp-3">“{pz.question}”</p>
      {pz.hint && (
        <div className="flex items-start gap-1.5">
          <span className="shrink-0 text-xs">💡</span>
          <p className="text-xs text-muted-foreground leading-relaxed">{pz.hint}</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">+{pz.points} pts</span>
        <span className="rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{timeLabelFor(pz.timeLimit)}</span>
        {pz.scheduledFor && (
          <span className="flex items-center gap-1 rounded-full border border-[hsl(288_80%_62%/0.25)] bg-[hsl(288_80%_62%/0.10)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(288_80%_72%)]">
            <Clock className="h-3 w-3" />
            {new Date(pz.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        )}
        <button
          onClick={() => setShowAnswer(v => !v)}
          className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          title={showAnswer ? "Hide answer" : "Reveal answer"}
        >
          {showAnswer ? <EyeOff className="h-3 w-3 shrink-0" /> : <Eye className="h-3 w-3 shrink-0" />}
          <span className="font-medium">{showAnswer ? pz.answer : "Answer"}</span>
        </button>
      </div>
      <div className="border-t border-border/30" />
      <div className="flex items-center gap-2">
        <button
          onClick={!isLocked ? onLaunch : undefined}
          disabled={isLocked}
          title={isLocked ? "End the running puzzle first" : "Launch this puzzle"}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
            isLocked
              ? "cursor-not-allowed bg-muted/60 text-muted-foreground"
              : "bg-[hsl(288_80%_62%)] text-white hover:bg-[hsl(288_80%_55%)] shadow-[0_0_14px_hsl(288_80%_62%/0.35)]"
          }`}
        >
          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isLocked ? "Locked" : "Launch"}
        </button>
        <button onClick={onEditToggle} title="Edit puzzle"
          className="rounded-lg border border-border/40 p-2 text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { if (confirmDel) { onDelete(); } else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); } }}
          title={confirmDel ? "Click to confirm delete" : "Delete"}
          className={`rounded-lg border p-2 transition-colors ${
            confirmDel
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border/40 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          }`}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── NewPuzzleCard ──────────────────────────────────────────────────────────
function NewPuzzleCard({ onSave, onCancel }: { onSave: (pz: LibraryPuzzle) => void; onCancel: () => void }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [pts, setPts] = useState("50");
  const [h, setH] = useState("");
  const [tl, setTl] = useState(60);
  const [sf, setSf] = useState(""); // scheduledFor as datetime-local string
  const canSave = q.trim() && a.trim();

  return (
    <div className="rounded-xl border border-[hsl(288_80%_62%/0.35)] bg-card/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(288_80%_72%)]">New Puzzle</span>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div>
        <label className={labelCls}>Question *</label>
        <textarea value={q} onChange={e => setQ(e.target.value)} rows={2} autoFocus
          className={`${inputCls} resize-none`} placeholder="Riddle or puzzle question…" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Answer *</label>
          <input value={a} onChange={e => setA(e.target.value)} className={inputCls} placeholder="Correct answer" />
        </div>
        <div>
          <label className={labelCls}>Points</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={pts} onChange={e => setPts(e.target.value.replace(/[^0-9]/g, ''))} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Hint</label>
          <input value={h} onChange={e => setH(e.target.value)} className={inputCls} placeholder="Optional hint" />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <select value={tl} onChange={e => setTl(Number(e.target.value))} className={inputCls}>
            {TIME_OPTIONS.map(t => <option key={t.secs} value={t.secs}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Schedule For (optional)</label>
        <input type="datetime-local" value={sf} onChange={e => setSf(e.target.value)} className={inputCls} />
        <p className="mt-0.5 text-[10px] text-muted-foreground">Leave blank to launch immediately. If set, puzzle auto-starts at this time.</p>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
        <button disabled={!canSave}
          onClick={() => { if (!canSave) return; onSave({ id: crypto.randomUUID(), question: q.trim(), answer: a.trim(), points: parseInt(pts) || 50, hint: h.trim() || undefined, timeLimit: tl, scheduledFor: sf ? new Date(sf).getTime() : undefined, createdAt: Date.now() }); }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[hsl(288_80%_62%)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[hsl(288_80%_55%)] transition-colors shadow-[0_0_12px_hsl(288_80%_62%/0.3)]">
          <BookOpen className="h-3.5 w-3.5" /> Save to Library
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function AdminPuzzles() {
  const {
    activePuzzle, puzzleSolved, completedPuzzles,
    launchPuzzle, startPuzzleTimer, stopPuzzleTimer,
  } = useArena();

  const [library, setLibrary] = useState<LibraryPuzzle[]>(SEED_LIBRARY);
  const [libraryLoading, setLibraryLoading] = useState(isSupabaseConfigured);

  // ── Load library from Supabase on mount ──────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('puzzle_library')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('[Supabase] puzzle_library fetch:', error.message); }
        else if (data && data.length > 0) {
          setLibrary(data.map(r => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            hint: r.hint || undefined,
            points: r.points,
            timeLimit: r.time_limit,
            scheduledFor: r.scheduled_for ? new Date(r.scheduled_for).getTime() : undefined,
            createdAt: new Date(r.created_at).getTime(),
          })));
        } else {
          // No rows yet — keep SEED_LIBRARY as starter content
        }
        setLibraryLoading(false);
      });
  }, []);

  function persistCreate(pz: LibraryPuzzle) {
    if (!isSupabaseConfigured) return;
    supabase.from('puzzle_library').insert({
      id: pz.id,
      question: pz.question,
      answer: pz.answer,
      hint: pz.hint ?? '',
      points: pz.points,
      time_limit: pz.timeLimit,
      scheduled_for: pz.scheduledFor ? new Date(pz.scheduledFor).toISOString() : null,
    }).then(({ error }) => { if (error) console.error('[Supabase] puzzle_library insert:', error.message); });
  }

  function persistUpdate(pz: LibraryPuzzle) {
    if (!isSupabaseConfigured) return;
    supabase.from('puzzle_library').update({
      question: pz.question,
      answer: pz.answer,
      hint: pz.hint ?? '',
      points: pz.points,
      time_limit: pz.timeLimit,
      scheduled_for: pz.scheduledFor ? new Date(pz.scheduledFor).toISOString() : null,
    }).eq('id', pz.id)
      .then(({ error }) => { if (error) console.error('[Supabase] puzzle_library update:', error.message); });
  }

  function persistDelete(id: string) {
    if (!isSupabaseConfigured) return;
    supabase.from('puzzle_library').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('[Supabase] puzzle_library delete:', error.message); });
  }
  const [showCreator, setShowCreator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [editingActive, setEditingActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [aeQ, setAeQ] = useState("");
  const [aeA, setAeA] = useState("");
  const [aePts, setAePts] = useState("50");
  const [aeH, setAeH] = useState("");
  const [aeTl, setAeTl] = useState(300);
  const [aeSf, setAeSf] = useState(""); // scheduledFor as datetime-local string

  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);
  const isRunning = activePuzzle?.timerRunning ?? false;

  const timerColor =
    secondsLeft !== null
      ? secondsLeft <= 30 ? "text-destructive"
      : secondsLeft <= 60 ? "text-amber-400"
      : "text-gold"
      : "text-muted-foreground";

  function launchFromLibrary(pz: LibraryPuzzle) {
    launchPuzzle({ question: pz.question, answer: pz.answer, points: pz.points, hint: pz.hint, timeLimit: pz.timeLimit, scheduledFor: pz.scheduledFor });
  }

  function handleStartEditActive() {
    if (!activePuzzle) return;
    setAeQ(activePuzzle.question);
    setAeA(activePuzzle.answer);
    setAePts(String(activePuzzle.points));
    setAeH(activePuzzle.hint ?? "");
    setAeTl(activePuzzle.timeLimit);
    setAeSf(activePuzzle.scheduledFor ? new Date(activePuzzle.scheduledFor).toISOString().slice(0, 16) : "");
    setEditingActive(true);
  }

  function handleSaveActiveEdit() {
    if (!aeQ.trim() || !aeA.trim()) return;
    launchPuzzle({ question: aeQ.trim(), answer: aeA.trim(), points: parseInt(aePts) || 50, hint: aeH.trim() || undefined, timeLimit: aeTl, scheduledFor: aeSf ? new Date(aeSf).getTime() : undefined });
    setEditingActive(false);
  }

  const isLocked = !!activePuzzle && isRunning && !puzzleSolved;
  const aeCanSave = aeQ.trim() && aeA.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-carnival text-2xl tracking-wide text-gold">Puzzles</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Build your library, launch challenges, and track completions.</p>
      </div>

      {/* Active puzzle control panel */}
      {activePuzzle && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gold/25 bg-card/50 overflow-hidden">
          <div className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${
            puzzleSolved ? "bg-emerald-500/15 text-emerald-400"
            : isRunning ? "bg-[hsl(288_80%_62%/0.15)] text-[hsl(288_80%_72%)]"
            : "bg-gold/10 text-gold"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${puzzleSolved ? "bg-emerald-400" : isRunning ? "bg-[hsl(288_80%_72%)] animate-pulse" : "bg-gold"}`} />
            {puzzleSolved ? "✓ Solved by a player" : isRunning ? "⏱ Timer Running" : "⚡ Ready to Start"}
          </div>
          <div className="p-5 space-y-4">
            {editingActive ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Editing — will re-launch on save</span>
                  <button onClick={() => setEditingActive(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <label className={labelCls}>Question *</label>
                  <textarea value={aeQ} onChange={e => setAeQ(e.target.value)} rows={2} autoFocus
                    className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Answer *</label>
                    <input value={aeA} onChange={e => setAeA(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Points</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={aePts} onChange={e => setAePts(e.target.value.replace(/[^0-9]/g, ''))} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Hint</label>
                    <input value={aeH} onChange={e => setAeH(e.target.value)} className={inputCls} placeholder="Optional hint" />
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <select value={aeTl} onChange={e => setAeTl(Number(e.target.value))} className={inputCls}>
                      {TIME_OPTIONS.map(t => <option key={t.secs} value={t.secs}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Schedule For (optional)</label>
                  <input type="datetime-local" value={aeSf} onChange={e => setAeSf(e.target.value)} className={inputCls} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditingActive(false)}
                    className="flex-1 rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveActiveEdit} disabled={!aeCanSave}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(288_80%_62%)] px-5 py-2 text-sm font-bold text-white disabled:opacity-40 hover:bg-[hsl(288_80%_55%)] transition-all shadow-[0_0_16px_hsl(288_80%_62%/0.3)]">
                    <Zap className="h-4 w-4" /> Save & Re-Launch
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className={labelCls}>Current Puzzle</p>
                  <blockquote className="mt-1 border-l-2 border-gold/30 pl-3 text-sm leading-relaxed text-foreground/90 italic">
                    "{activePuzzle.question}"
                  </blockquote>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">+{activePuzzle.points} pts</span>
                    <span className="rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{timeLabelFor(activePuzzle.timeLimit)}</span>
                    {activePuzzle.scheduledFor && !isRunning && (
                      <span className="flex items-center gap-1 rounded-full border border-[hsl(288_80%_62%/0.25)] bg-[hsl(288_80%_62%/0.10)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(288_80%_72%)]">
                        <Clock className="h-3 w-3" />
                        Auto-starts {new Date(activePuzzle.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                    <button
                      onClick={() => setShowHint(v => !v)}
                      className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      {showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span className="font-medium">{showHint ? activePuzzle.answer : "Reveal answer"}</span>
                    </button>
                  </div>
                  {activePuzzle.hint && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <span className="shrink-0 text-xs">💡</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{activePuzzle.hint}</p>
                    </div>
                  )}
                </div>

                {(isRunning || secondsLeft !== null) && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={`font-carnival text-4xl tabular-nums tracking-widest ${timerColor}`}>
                      {secondsLeft !== null ? formatCountdown(secondsLeft) : formatCountdown(activePuzzle.timeLimit)}
                    </span>
                    {secondsLeft !== null && secondsLeft <= 30 && (
                      <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
                    )}
                  </div>
                )}

                {!puzzleSolved && (
                  <div className="flex items-center gap-3">
                    {!isRunning ? (
                      <>
                        <button onClick={startPuzzleTimer}
                          className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-bold text-background hover:bg-gold/90 transition-all shadow-[0_0_16px_hsl(43_93%_60%/0.3)]">
                          <Play className="h-4 w-4" /> Start Timer
                        </button>
                        <button onClick={handleStartEditActive}
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      </>
                    ) : (
                      <button onClick={stopPuzzleTimer}
                        className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-5 py-2 text-sm font-bold text-destructive hover:bg-destructive/20 transition-colors">
                        <Square className="h-4 w-4" /> End Puzzle Early
                      </button>
                    )}
                  </div>
                )}

                {puzzleSolved && (
                  <p className="text-xs text-emerald-400">Puzzle solved! Launch a new one from the library below.</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Puzzle Library */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Library className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Puzzle Library</h3>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{library.length}</span>
          </div>
          <button onClick={() => { setShowCreator(true); setEditingId(null); }}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(288_80%_62%)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[hsl(288_80%_55%)] transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Puzzle
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {showCreator && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <NewPuzzleCard
                onSave={pz => { setLibrary(prev => [pz, ...prev]); persistCreate(pz); setShowCreator(false); }}
                onCancel={() => setShowCreator(false)}
              />
            </motion.div>
          )}
          {library.length === 0 && !showCreator && (
            <div className="col-span-2 rounded-xl border border-dashed border-border/50 py-8 text-center text-sm text-muted-foreground">
              Library is empty — click + New Puzzle to get started.
            </div>
          )}
          {library.map(pz => (
            <motion.div key={pz.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LibraryCard
                pz={pz}
                onLaunch={() => launchFromLibrary(pz)}
                onSave={updated => { setLibrary(prev => prev.map(p => p.id === pz.id ? updated : p)); persistUpdate(updated); }}
                onDelete={() => { setLibrary(prev => prev.filter(p => p.id !== pz.id)); persistDelete(pz.id); }}
                isLocked={isLocked}
                isEditing={editingId === pz.id}
                onEditToggle={() => setEditingId(editingId === pz.id ? null : pz.id)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Past Puzzles (collapsible) */}
      {completedPuzzles.length > 0 && (
        <section>
          <button onClick={() => setShowPast(v => !v)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-2">
            {showPast ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Past Puzzles ({completedPuzzles.length})
          </button>

          <AnimatePresence>
            {showPast && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-2">
                  {completedPuzzles.map((pz, i) => (
                    <motion.div key={pz.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-foreground/90 leading-relaxed line-clamp-1 italic">"{pz.question}"</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">Answer: {pz.answer}</span>
                            {pz.awardedPoints !== undefined ? (
                              <>
                                <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">{pz.awardedPoints} pts awarded</span>
                                {pz.awardedPoints !== pz.points && (
                                  <span className="text-muted-foreground/60">(base {pz.points})</span>
                                )}
                              </>
                            ) : (
                              <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">{pz.points} pts</span>
                            )}
                            <span>{new Date(pz.completedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {pz.timedOut ? (
                            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold text-muted-foreground">⏰ Timed Out</span>
                          ) : (
                            <div className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 text-xs">
                              <Trophy className="h-3 w-3 text-gold" />
                              <span className="text-muted-foreground">
                                {pz.solvedByLogo ?? ""} {pz.solvedBy ?? "Unknown"}
                                {pz.solvedByPlayer && ` · ${pz.solvedByPlayer}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
