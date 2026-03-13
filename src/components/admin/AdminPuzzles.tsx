import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { usePuzzleTimer, formatCountdown } from "@/hooks/usePuzzleTimer";
import {
  Zap, Play, Square, Trophy, Clock, AlertCircle, Plus,
  Trash2, BookOpen, ChevronDown, ChevronUp, Library, Pencil, Lock,
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
  createdAt: number;
}

const TIME_OPTIONS = [
  { label: "1 min",  secs: 60  },
  { label: "2 min",  secs: 120 },
  { label: "3 min",  secs: 180 },
  { label: "5 min",  secs: 300 },
  { label: "10 min", secs: 600 },
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
  return TIME_OPTIONS.find(t => t.secs === secs)?.label ?? `${secs}s`;
}

// ── LibraryCard ────────────────────────────────────────────────────────────
function LibraryCard({ pz, onLaunch, onEdit, onDelete, isLocked }: {
  pz: LibraryPuzzle; onLaunch: () => void; onEdit: () => void; onDelete: () => void; isLocked: boolean;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col gap-3">
      <p className="text-sm text-foreground leading-relaxed line-clamp-2 italic">
        "{pz.question}"
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded bg-gold/10 px-1.5 py-0.5 font-bold text-gold">+{pz.points} pts</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{timeLabelFor(pz.timeLimit)}</span>
        {pz.hint && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary/70">💡 hint</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={!isLocked ? onLaunch : undefined}
          disabled={isLocked}
          title={isLocked ? "End the running puzzle first" : "Launch this puzzle"}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            isLocked
              ? "cursor-not-allowed bg-muted/60 text-muted-foreground"
              : "bg-[hsl(288_80%_62%)] text-white hover:bg-[hsl(288_80%_55%)] shadow-[0_0_12px_hsl(288_80%_62%/0.3)]"
          }`}
        >
          {isLocked ? <Lock className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isLocked ? "Locked" : "Launch"}
        </button>
        <button
          onClick={onEdit}
          title="Edit puzzle"
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            if (confirmDel) { onDelete(); } else {
              setConfirmDel(true);
              setTimeout(() => setConfirmDel(false), 3000);
            }
          }}
          title={confirmDel ? "Click to confirm delete" : "Delete"}
          className={`rounded-lg p-1.5 transition-colors ${
            confirmDel ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
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

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState("50");
  const [hint, setHint] = useState("");
  const [timeLimit, setTimeLimit] = useState(300);

  const [library, setLibrary] = useState<LibraryPuzzle[]>(SEED_LIBRARY);
  const [showCreator, setShowCreator] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingActive, setIsEditingActive] = useState(false);

  const secondsLeft = usePuzzleTimer(activePuzzle?.expiresAt, activePuzzle?.timerRunning ?? false);
  const isRunning = activePuzzle?.timerRunning ?? false;

  const timerColor =
    secondsLeft !== null
      ? secondsLeft <= 30 ? "text-destructive"
      : secondsLeft <= 60 ? "text-amber-400"
      : "text-gold"
      : "text-muted-foreground";

  function buildItem(): LibraryPuzzle {
    return {
      id: `lib-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      points: parseInt(points) || 50,
      hint: hint.trim() || undefined,
      timeLimit,
      createdAt: Date.now(),
    };
  }

  function clearForm() {
    setQuestion(""); setAnswer(""); setPoints("50"); setHint(""); setTimeLimit(300);
    setEditingId(null);
    setIsEditingActive(false);
  }

  function handleSaveToLibrary(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    if (editingId) {
      setLibrary(prev => prev.map(p =>
        p.id === editingId ? { ...buildItem(), id: editingId, createdAt: p.createdAt } : p
      ));
    } else {
      setLibrary(prev => [buildItem(), ...prev]);
    }
    clearForm();
    setShowCreator(false);
  }

  function handleLaunchNow(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    const item = buildItem();
    if (editingId) {
      setLibrary(prev => prev.map(p =>
        p.id === editingId ? { ...item, id: editingId, createdAt: p.createdAt } : p
      ));
    } else if (!isEditingActive) {
      setLibrary(prev => [item, ...prev]);
    }
    launchPuzzle({ question: item.question, answer: item.answer, points: item.points, hint: item.hint, timeLimit: item.timeLimit });
    clearForm();
    setShowCreator(false);
  }

  function launchFromLibrary(pz: LibraryPuzzle) {
    launchPuzzle({ question: pz.question, answer: pz.answer, points: pz.points, hint: pz.hint, timeLimit: pz.timeLimit });
  }

  function handleEditLibrary(pz: LibraryPuzzle) {
    setQuestion(pz.question);
    setAnswer(pz.answer);
    setPoints(String(pz.points));
    setHint(pz.hint ?? "");
    setTimeLimit(pz.timeLimit);
    setEditingId(pz.id);
    setIsEditingActive(false);
    setShowCreator(true);
  }

  function handleEditActive() {
    if (!activePuzzle) return;
    setQuestion(activePuzzle.question);
    setAnswer(activePuzzle.answer);
    setPoints(String(activePuzzle.points));
    setHint(activePuzzle.hint ?? "");
    setTimeLimit(activePuzzle.timeLimit);
    setEditingId(null);
    setIsEditingActive(true);
    setShowCreator(true);
  }

  const isLocked = !!activePuzzle && isRunning && !puzzleSolved;
  const canSubmit = question.trim() && answer.trim();

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
            <div>
              <p className={labelCls}>Current Puzzle</p>
              <blockquote className="mt-1 border-l-2 border-gold/30 pl-3 text-sm leading-relaxed text-foreground/90 italic">
                "{activePuzzle.question}"
              </blockquote>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-gold/10 px-2 py-0.5 font-bold text-gold">+{activePuzzle.points} pts</span>
                {activePuzzle.hint && <span>Hint: {activePuzzle.hint}</span>}
                <span>Window: {timeLabelFor(activePuzzle.timeLimit)}</span>
              </div>
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
                    <button onClick={handleEditActive}
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
          <button onClick={() => { clearForm(); setShowCreator(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(288_80%_62%)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[hsl(288_80%_55%)] transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Puzzle
          </button>
        </div>

        {library.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 py-8 text-center text-sm text-muted-foreground">
            Library is empty — create a puzzle below to get started.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {library.map(pz => (
              <motion.div key={pz.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LibraryCard pz={pz} onLaunch={() => launchFromLibrary(pz)} onEdit={() => handleEditLibrary(pz)} onDelete={() => setLibrary(prev => prev.filter(p => p.id !== pz.id))} isLocked={isLocked} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Create Puzzle (collapsible) */}
      <section>
        <button onClick={() => { if (showCreator) clearForm(); setShowCreator(v => !v); }}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-2">
          {showCreator ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showCreator ? ((editingId || isEditingActive) ? "Cancel Edit" : "Hide Creator") : "Create New Puzzle"}
        </button>

        <AnimatePresence>
          {showCreator && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                {(editingId !== null || isEditingActive) && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    <Pencil className="h-3 w-3 shrink-0 text-primary/60" />
                    {isEditingActive ? "Editing active puzzle — saving will re-launch it" : "Editing library puzzle"}
                  </div>
                )}
                <form className="space-y-4">
                  <div>
                    <label className={labelCls}>Question *</label>
                    <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                      className={`${inputCls} resize-none`} placeholder="Enter the riddle or puzzle question…" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Answer *</label>
                      <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder="Correct answer" />
                    </div>
                    <div>
                      <label className={labelCls}>Points</label>
                      <input type="number" value={points} onChange={e => setPoints(e.target.value)} className={inputCls} min={5} max={500} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Hint (optional)</label>
                      <input value={hint} onChange={e => setHint(e.target.value)} className={inputCls} placeholder="Optional nudge for players" />
                    </div>
                    <div>
                      <label className={labelCls}>Time Window</label>
                      <select value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className={inputCls}>
                        {TIME_OPTIONS.map(t => <option key={t.secs} value={t.secs}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    {!isEditingActive && (
                      <button type="button" onClick={handleSaveToLibrary} disabled={!canSubmit}
                        className="flex items-center gap-2 rounded-lg border border-gold/50 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10 disabled:opacity-40 transition-colors">
                        <BookOpen className="h-4 w-4" /> {editingId ? "Update Library" : "Save to Library"}
                      </button>
                    )}
                    <button type="button" onClick={handleLaunchNow}
                      disabled={!canSubmit || (!isEditingActive && isLocked)}
                      title={(!isEditingActive && isLocked) ? "End the running puzzle first" : undefined}
                      className="flex items-center gap-2 rounded-lg bg-[hsl(288_80%_62%)] px-5 py-2 text-sm font-bold text-white hover:bg-[hsl(288_80%_55%)] disabled:opacity-40 transition-all shadow-[0_0_16px_hsl(288_80%_62%/0.3)]">
                      <Zap className="h-4 w-4" />
                      {isEditingActive ? "Update & Re-Launch" : editingId ? "Re-Launch" : activePuzzle ? "Replace & Launch" : "Launch Now"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                            <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">{pz.points} pts</span>
                            <span>{formatTs(pz.completedAt)}</span>
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
