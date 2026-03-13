import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Loader2, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  display_name: string;
  team_id: string | null;
  is_captain: boolean;
  has_spun: boolean;
}

interface Team {
  id: string;
  name: string;
  color: string;
  logo: string;
}

export function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [{ data: profileData }, { data: teamData }] = await Promise.all([
      supabase.from('profiles').select('id,display_name,team_id,is_captain,has_spun').eq('role', 'player').order('display_name'),
      supabase.from('teams').select('id,name,color,logo').order('name'),
    ]);
    setPlayers(profileData ?? []);
    setTeams(teamData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  const assignTeam = async (playerId: string, teamId: string | null) => {
    setSaving(playerId);
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: teamId, is_captain: false })
      .eq('id', playerId);
    if (error) { toast.error("Failed to assign team"); }
    else {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, team_id: teamId, is_captain: false } : p));
      toast.success("Team assigned");
    }
    setSaving(null);
  };

  const toggleCaptain = async (playerId: string, teamId: string | null, currentlyCaptain: boolean) => {
    if (!teamId) { toast.error("Assign a team first"); return; }
    setSaving(playerId);

    // Remove captain from current captain in same team (one captain per team)
    if (!currentlyCaptain) {
      await supabase
        .from('profiles')
        .update({ is_captain: false })
        .eq('team_id', teamId)
        .eq('is_captain', true);
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_captain: !currentlyCaptain })
      .eq('id', playerId);

    if (error) { toast.error("Failed to update captain"); }
    else {
      setPlayers(prev => prev.map(p => {
        if (p.team_id === teamId && p.is_captain && !currentlyCaptain) return { ...p, is_captain: false };
        if (p.id === playerId) return { ...p, is_captain: !currentlyCaptain };
        return p;
      }));
      toast.success(currentlyCaptain ? "Captain removed" : "Captain assigned");
    }
    setSaving(null);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg">Players</h2>
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>Supabase is not configured. Players management requires a live Supabase connection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Group players by team
  const grouped: Record<string, Player[]> = { unassigned: [] };
  teams.forEach(t => { grouped[t.id] = []; });
  players.forEach(p => {
    if (p.team_id && grouped[p.team_id]) grouped[p.team_id].push(p);
    else grouped['unassigned'].push(p);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">Players</h2>
          <p className="text-sm text-muted-foreground">
            {players.length} player{players.length !== 1 ? 's' : ''} · assign teams & captains
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && players.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading players…
        </div>
      ) : players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <Users className="h-8 w-8 opacity-30" />
          <p className="text-sm">No players have signed up yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unassigned */}
          {grouped['unassigned'].length > 0 && (
            <TeamSection
              label="Unassigned"
              color="#94a3b8"
              logo="👤"
              players={grouped['unassigned']}
              teams={teams}
              teamMap={teamMap}
              saving={saving}
              onAssignTeam={assignTeam}
              onToggleCaptain={toggleCaptain}
            />
          )}
          {/* Per team */}
          {teams.map(team => (
            grouped[team.id]?.length > 0 && (
              <TeamSection
                key={team.id}
                label={team.name}
                color={team.color}
                logo={team.logo}
                players={grouped[team.id]}
                teams={teams}
                teamMap={teamMap}
                saving={saving}
                onAssignTeam={assignTeam}
                onToggleCaptain={toggleCaptain}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function TeamSection({
  label, color, logo, players, teams, teamMap, saving, onAssignTeam, onToggleCaptain,
}: {
  label: string;
  color: string;
  logo: string;
  players: Player[];
  teams: Team[];
  teamMap: Record<string, Team>;
  saving: string | null;
  onAssignTeam: (playerId: string, teamId: string | null) => void;
  onToggleCaptain: (playerId: string, teamId: string | null, isCaptain: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{logo}</span>
        <h3 className="text-sm font-semibold" style={{ color }}>{label}</h3>
        <span className="text-xs text-muted-foreground">({players.length})</span>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {players.map(player => (
          <div key={player.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-accent/10 transition-colors flex-wrap">
            {/* Avatar */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: (player.team_id ? teamMap[player.team_id]?.color ?? color : '#94a3b8') + '22', color: player.team_id ? teamMap[player.team_id]?.color ?? color : '#94a3b8' }}
            >
              {player.display_name.charAt(0).toUpperCase()}
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium truncate">{player.display_name}</span>
                {player.is_captain && (
                  <Badge variant="outline" className="gap-1 border-yellow-500/40 text-yellow-500 text-[10px] py-0">
                    <Crown className="h-3 w-3" /> Captain
                  </Badge>
                )}
                {!player.has_spun && (
                  <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                    hasn't spun
                  </Badge>
                )}
              </div>
            </div>

            {/* Team picker */}
            <Select
              value={player.team_id ?? 'none'}
              onValueChange={val => onAssignTeam(player.id, val === 'none' ? null : val)}
              disabled={saving === player.id}
            >
              <SelectTrigger className="w-36 h-7 text-xs">
                <SelectValue placeholder="No team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.logo} {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Captain toggle */}
            <Button
              variant={player.is_captain ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              disabled={saving === player.id || !player.team_id}
              onClick={() => onToggleCaptain(player.id, player.team_id, player.is_captain)}
              title={player.team_id ? (player.is_captain ? "Remove as captain" : "Make captain") : "Assign a team first"}
            >
              {saving === player.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crown className="h-3 w-3" />}
              {player.is_captain ? "Captain" : "Set"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
