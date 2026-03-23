import { useState, useEffect } from "react";
import { Check, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useArena } from "@/context/ArenaContext";
import { useShoutouts } from "@/hooks/useShoutouts";
import { EmojiPicker } from "./EmojiPicker";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isMockMode } from "@/lib/mockAuth";
import { mockPlayers } from "@/data/mockData";

interface PlayerOption {
  id: string;
  display_name: string;
  team_id: string | null;
}

const inputCls = "mt-1 w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold/40 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const BADGE_PRESETS = [
  { emoji: '🎭', name: 'Best Dressed' },
  { emoji: '📣', name: 'Loudest Crowd' },
  { emoji: '🌟', name: 'Spirit Award' },
  { emoji: '💝', name: 'Sportsmanship' },
  { emoji: '🎯', name: 'Sharp Shot' },
  { emoji: '🧠', name: 'Big Brain' },
  { emoji: '😂', name: 'Comic Relief' },
  { emoji: '🛡️', name: 'Most Resilient' },
];

export function AdminShoutouts() {
  const { teams, publishShoutout, dismissShoutout, addManualShoutout } = useArena();
  const { pendingShoutouts, publishedShoutouts } = useShoutouts();

  const [editPts, setEditPts] = useState<Record<string, string>>({});
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [manualForm, setManualForm] = useState({
    badgeName: '',
    badgeEmoji: '⭐',
    recipientType: 'team' as 'player' | 'team',
    recipientName: '',
    teamId: '',
    playerId: '',
    points: '0',
  });

  useEffect(() => {
    if (isMockMode) {
      setPlayers(mockPlayers);
      return;
    }
    if (!isSupabaseConfigured) return;
    supabase
      .from('profiles')
      .select('id,display_name,team_id')
      .eq('role', 'player')
      .order('display_name')
      .then(({ data }) => { if (data) setPlayers(data as PlayerOption[]); });
  }, []);

  function getEditPts(id: string, defaultPts: number) {
    return editPts[id] ?? String(defaultPts);
  }

  function handlePublish(shoutout: { id: string; points: number; teamId: string | null }) {
    const pts = parseInt(getEditPts(shoutout.id, shoutout.points)) || 0;
    publishShoutout(shoutout.id, pts, shoutout.teamId || undefined);
  }

  function handleManualPost() {
    if (!manualForm.badgeName.trim() || !manualForm.recipientName.trim()) return;
    const selectedTeam = teams.find(t => t.id === manualForm.teamId);
    addManualShoutout({
      badgeName: manualForm.badgeName,
      badgeEmoji: manualForm.badgeEmoji,
      recipientType: manualForm.recipientType,
      recipientName: manualForm.recipientName,
      teamId: manualForm.teamId || undefined,
      teamName: selectedTeam?.name,
      points: parseInt(manualForm.points) || 0,
    });
    setManualForm({ badgeName: '', badgeEmoji: '⭐', recipientType: 'team', recipientName: '', teamId: '', playerId: '', points: '0' });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-carnival text-2xl tracking-wide text-gold">Shoutouts</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Recognize players and teams. Published shoutouts appear on the player dashboard as "Last Event Highlights".
        </p>
      </div>

      {/* ── Manual shoutout form ──────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manual Shoutout</p>

        {/* Badge presets */}
        <div className="flex flex-wrap gap-1.5">
          {BADGE_PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => setManualForm(f => ({ ...f, badgeEmoji: p.emoji, badgeName: p.name }))}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                manualForm.badgeName === p.name
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground'
              }`}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div>
            <label className={labelCls}>Emoji</label>
            <EmojiPicker
              value={manualForm.badgeEmoji}
              onChange={emoji => setManualForm(f => ({ ...f, badgeEmoji: emoji }))}
            />
          </div>
          <div>
            <label className={labelCls}>Badge Name</label>
            <input
              value={manualForm.badgeName}
              onChange={e => setManualForm(f => ({ ...f, badgeName: e.target.value }))}
              className={inputCls}
              placeholder="e.g. Best Team Energy"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Recipient Type</label>
            <select
              value={manualForm.recipientType}
              onChange={e => setManualForm(f => ({ ...f, recipientType: e.target.value as 'player' | 'team', recipientName: '', teamId: '' }))}
              className={inputCls}
            >
              <option value="team">Team</option>
              <option value="player">Player</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Points (rolls up to team)</label>
            <input
              type="text"
              inputMode="numeric"
              value={manualForm.points}
              onChange={e => setManualForm(f => ({ ...f, points: e.target.value.replace(/[^0-9]/g, '') }))}
              className={inputCls}
              placeholder="0 = recognition only"
            />
          </div>
        </div>

        {manualForm.recipientType === 'team' ? (
          <div>
            <label className={labelCls}>Team</label>
            <select
              value={manualForm.teamId}
              onChange={e => {
                const team = teams.find(t => t.id === e.target.value);
                setManualForm(f => ({ ...f, teamId: e.target.value, recipientName: team?.name || '' }));
              }}
              className={inputCls}
            >
              <option value="">Select team…</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Team</label>
              <select
                value={manualForm.teamId}
                onChange={e => setManualForm(f => ({ ...f, teamId: e.target.value, playerId: '', recipientName: '' }))}
                className={inputCls}
              >
                <option value="">Select team first…</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                ))}
              </select>
            </div>
            {manualForm.teamId && (
              <div>
                <label className={labelCls}>Player</label>
                <select
                  value={manualForm.playerId}
                  onChange={e => {
                    const player = players.find(p => p.id === e.target.value);
                    setManualForm(f => ({ ...f, playerId: e.target.value, recipientName: player?.display_name || '' }));
                  }}
                  className={inputCls}
                >
                  <option value="">Select player…</option>
                  {players
                    .filter(p => p.team_id === manualForm.teamId)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.display_name}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleManualPost}
          disabled={!manualForm.badgeName.trim() || !manualForm.recipientName.trim() || (manualForm.recipientType === 'player' && !manualForm.playerId)}
          className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-background hover:bg-gold/90 disabled:opacity-40 transition-colors"
        >
          <Star className="h-3.5 w-3.5" /> Post Shoutout
        </button>
      </div>

      {/* ── Pending auto-calculated badges ───────────────────── */}
      <AnimatePresence>
        {pendingShoutouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Pending Auto-Badges
              </p>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                {pendingShoutouts.length} awaiting review
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-1">
              System detected these after the last event. Edit points if needed, then publish or dismiss.
            </p>

            <div className="space-y-2">
              {pendingShoutouts.map(s => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3"
                >
                  <span className="text-xl shrink-0">{s.badgeEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.badgeName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.recipientName}
                      {s.teamName && s.recipientType === 'player' && ` · ${s.teamName}`}
                      {s.eventTitle && <span className="text-muted-foreground/60"> · {s.eventTitle}</span>}
                    </p>
                  </div>

                  {/* Editable points */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">pts:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={getEditPts(s.id, s.points)}
                      onChange={e => setEditPts(p => ({ ...p, [s.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                      className="w-14 rounded-lg border border-border/70 bg-background/60 px-2 py-1 text-center text-xs font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-gold/40 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => handlePublish(s)}
                    className="flex items-center gap-1 rounded-lg bg-gold/10 border border-gold/30 px-2.5 py-1 text-xs font-bold text-gold hover:bg-gold/20 transition-colors shrink-0"
                  >
                    <Check className="h-3 w-3" /> Publish
                  </button>
                  <button
                    onClick={() => dismissShoutout(s.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Published history ─────────────────────────────────── */}
      {publishedShoutouts.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Published ({publishedShoutouts.length})
          </p>
          <div className="space-y-1.5">
            {publishedShoutouts.slice(0, 30).map(s => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-card/30 border border-border/30"
              >
                <span className="text-base shrink-0">{s.badgeEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{s.badgeName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {s.recipientName}
                    {s.teamName && s.recipientType === 'player' ? ` · ${s.teamName}` : ''}
                    {s.eventTitle ? ` · ${s.eventTitle}` : ''}
                  </p>
                </div>
                {s.points > 0 && (
                  <span className="text-xs font-bold text-gold shrink-0">+{s.points} pts</span>
                )}
                <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                  {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingShoutouts.length === 0 && publishedShoutouts.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/50 py-10 text-center text-sm text-muted-foreground">
          No shoutouts yet.<br />
          <span className="text-xs">Complete an event to see auto-badges, or post a manual shoutout above.</span>
        </div>
      )}
    </div>
  );
}
