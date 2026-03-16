import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useArena } from "@/context/ArenaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, Plus, RefreshCw, Trash2, Users, Check, X, Trophy } from "lucide-react";
import { toast } from "sonner";
import { mockTeams } from "@/data/mockData";

interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
  logo: string;
  memberCount?: number;
}

const PRESET_COLORS = [
  '#00E5FF', '#FF2E88', '#7A5CFF', '#00FFC6',
  '#FFE600', '#FF6B35', '#F59E0B', '#10B981',
];

const PRESET_EMOJIS = ['⚡', '🔥', '🦅', '⚔️', '🌀', '🔗', '🏆', '💎', '🚀', '🐉', '🦁', '🌊'];

export function AdminTeams() {
  const { events } = useArena();
  const [teams, setTeams] = useState<Team[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── New team form ────────────────────────────────────────────────────────
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newLogo, setNewLogo] = useState(PRESET_EMOJIS[0]);

  // ── Inline edit state ────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editLogo, setEditLogo] = useState("");

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setTeams(mockTeams.map(t => ({ ...t, score: t.score })));
      return;
    }
    setLoading(true);
    const [{ data: teamData }, { data: profileData }] = await Promise.all([
      supabase.from('teams').select('id,name,score,color,logo').order('score', { ascending: false }),
      supabase.from('profiles').select('team_id').not('team_id', 'is', null),
    ]);
    const counts: Record<string, number> = {};
    profileData?.forEach(p => { if (p.team_id) counts[p.team_id] = (counts[p.team_id] ?? 0) + 1; });
    setMemberCounts(counts);
    setTeams(teamData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Create ───────────────────────────────────────────────────────────────
  const createTeam = async () => {
    if (!newName.trim()) { toast.error("Team name is required"); return; }
    setSaving('new');
    const { data, error } = await supabase
      .from('teams')
      .insert({ name: newName.trim(), color: newColor, logo: newLogo, score: 0 })
      .select()
      .single();
    if (error) { toast.error("Failed to create team"); }
    else {
      setTeams(prev => [...prev, data]);
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setNewLogo(PRESET_EMOJIS[0]);
      setShowNew(false);
      toast.success(`${data.logo} ${data.name} created`);
    }
    setSaving(null);
  };

  // ── Start edit ───────────────────────────────────────────────────────────
  const startEdit = (team: Team) => {
    setEditId(team.id);
    setEditName(team.name);
    setEditColor(team.color);
    setEditLogo(team.logo);
  };

  // ── Save edit ────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editId) return;
    if (!editName.trim()) { toast.error("Team name is required"); return; }
    setSaving(editId);
    const { error } = await supabase
      .from('teams')
      .update({ name: editName.trim(), color: editColor, logo: editLogo })
      .eq('id', editId);
    if (error) { toast.error("Failed to update team"); }
    else {
      setTeams(prev => prev.map(t => t.id === editId
        ? { ...t, name: editName.trim(), color: editColor, logo: editLogo }
        : t
      ));
      setEditId(null);
      toast.success("Team updated");
    }
    setSaving(null);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteTeam = async (team: Team) => {
    if (deletingId !== team.id) {
      setDeletingId(team.id);
      return;
    }
    setSaving(team.id);
    const { error } = await supabase.from('teams').delete().eq('id', team.id);
    if (error) { toast.error("Failed to delete team"); }
    else {
      setTeams(prev => prev.filter(t => t.id !== team.id));
      toast.success(`${team.name} deleted`);
    }
    setDeletingId(null);
    setSaving(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">Teams</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage teams, colors, and identity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchAll} disabled={loading} className="h-8 w-8">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            onClick={() => { setShowNew(v => !v); setEditId(null); }}
            className="h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Team
          </Button>
        </div>
      </div>

      {/* New team form */}
      {showNew && (
        <div className="border border-border rounded-lg p-4 bg-card/60 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Team</p>

          <Input
            placeholder="Team name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTeam()}
            className="h-8 text-sm"
          />

          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground">Color</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? 'white' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewLogo(e)}
                  className={`w-8 h-8 rounded text-lg flex items-center justify-center transition-colors ${newLogo === e ? 'bg-amber/20 ring-1 ring-amber' : 'hover:bg-accent/30'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={createTeam} disabled={saving === 'new'} className="h-7 text-xs">
              {saving === 'new' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNew(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Teams list */}
      {!isSupabaseConfigured && (
        <Alert>
          <AlertDescription className="text-xs">
            Supabase not configured — showing mock data. Changes won't persist.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {teams.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-8">No teams yet. Create one above.</p>
        )}

        {teams.map((team, i) => {
          const isEditing = editId === team.id;
          const members = memberCounts[team.id] ?? 0;

          return (
            <div
              key={team.id}
              className="border border-border rounded-lg bg-card/40 overflow-hidden"
            >
              {/* Color accent bar */}
              <div className="h-0.5" style={{ backgroundColor: isEditing ? editColor : team.color }} />

              <div className="p-3">
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{editLogo}</span>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Color</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ backgroundColor: c, borderColor: editColor === c ? 'white' : 'transparent' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Emoji</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_EMOJIS.map(e => (
                          <button
                            key={e}
                            onClick={() => setEditLogo(e)}
                            className={`w-7 h-7 rounded text-base flex items-center justify-center transition-colors ${editLogo === e ? 'bg-amber/20 ring-1 ring-amber' : 'hover:bg-accent/30'}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving === team.id} className="h-7 text-xs">
                        {saving === team.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="h-7 text-xs">
                        <X className="h-3 w-3 mr-1" />Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank */}
                        <span className="text-[10px] text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                        {/* Logo + name */}
                        <span className="text-xl shrink-0">{team.logo}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{team.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Users className="h-2.5 w-2.5" />{members} member{members !== 1 ? 's' : ''}
                            </span>
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums" style={{ color: team.color }}>
                            {team.score.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">pts</p>
                        </div>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => { startEdit(team); setShowNew(false); }}
                          disabled={saving === team.id}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${deletingId === team.id ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'}`}
                          onClick={() => deleteTeam(team)}
                          disabled={saving === team.id}
                          title={deletingId === team.id ? "Click again to confirm delete" : "Delete team"}
                        >
                          {saving === team.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* Event wins timeline */}
                    {(() => {
                      const wonEvents = events.filter(e => e.winnerTeamId === team.id);
                      if (wonEvents.length === 0) return null;
                      return (
                        <div className="border-t border-border/30 pt-2 space-y-1.5 ml-7">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Trophy className="h-2.5 w-2.5 text-gold" /> Event Wins
                          </p>
                          {wonEvents.map(ev => (
                            <div key={ev.id} className="flex items-center justify-between gap-3 text-xs">
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span className="shrink-0">{ev.emoji || "📅"}</span>
                                <span className="text-foreground/80 truncate">{ev.title}</span>
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">+{ev.winnerPoints} pts</span>
                                {ev.date && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dismiss delete confirm on outside context */}
      {deletingId && (
        <p className="text-[11px] text-destructive text-center animate-pulse">
          Click the trash icon again to confirm deletion. Players assigned to this team will be unassigned.
        </p>
      )}
    </div>
  );
}
