import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isMockMode } from "@/lib/mockAuth";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, User } from "lucide-react";

interface TeamMember {
  id: string;
  display_name: string;
  is_captain: boolean;
}

interface TeamInfo {
  id: string;
  name: string;
  color: string;
  logo: string;
  score: number;
}

export function TeamView() {
  const { profile } = useAuth();
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.team_id) return;
    async function load() {
      setLoading(true);
      if (!isSupabaseConfigured || isMockMode) {
        setTeam({ id: '1', name: 'Team Titans', color: '#00E5FF', logo: '⚡', score: 520 });
        setMembers([{ id: profile!.id, display_name: profile!.display_name, is_captain: false }]);
        setLoading(false);
        return;
      }
      const [{ data: teamData }, { data: memberData }] = await Promise.all([
        supabase.from('teams').select('id,name,color,logo,score').eq('id', profile!.team_id!).single(),
        supabase.from('profiles').select('id,display_name,is_captain').eq('team_id', profile!.team_id!),
      ]);
      setTeam(teamData ?? null);
      setMembers(memberData ?? []);
      setLoading(false);
    }
    load();
  }, [profile?.team_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) return null;

  const captain = members.find(m => m.is_captain);

  return (
    <div className="bg-background">
      {/* Team hero banner */}
      <div
        className="w-full py-14 flex flex-col items-center justify-center gap-3 text-center"
        style={{ background: `linear-gradient(135deg, ${team.color}22 0%, transparent 70%)`, borderBottom: `1px solid ${team.color}33` }}
      >
        <span className="text-6xl">{team.logo}</span>
        <h1 className="text-3xl font-bold" style={{ color: team.color }}>{team.name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{team.score} pts</span>
          <span>·</span>
          <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          {captain && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-yellow-500" />
                Captain: <strong className="text-foreground ml-1">{captain.display_name}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Members list */}
      <div className="max-w-lg mx-auto px-4 py-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Team Members
        </h2>
        {members.map(m => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: team.color + '22', color: team.color }}
            >
              {m.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.display_name}</p>
              {m.id === profile?.id && (
                <p className="text-xs text-muted-foreground">You</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {m.is_captain && (
                <Badge variant="outline" className="gap-1 border-yellow-500/40 text-yellow-500 text-xs">
                  <Crown className="h-3 w-3" /> Captain
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No captain notice */}
      {!captain && (
        <p className="text-center text-sm text-muted-foreground pb-8">
          No captain assigned yet — your admin will appoint one.
        </p>
      )}
    </div>
  );
}
