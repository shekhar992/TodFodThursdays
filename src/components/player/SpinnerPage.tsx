import { useState, useRef, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { isMockMode } from "@/lib/mockAuth";
import { mockTeams, mockPlayers } from "@/data/mockData";

interface Team {
  id: string;
  name: string;
  color: string;
  logo: string;
  memberCount: number;
}

export function SpinnerPage() {
  const { user, refreshProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [assignedTeam, setAssignedTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotationRef = useRef(0);

  // ── Load teams with member counts ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (isMockMode || !isSupabaseConfigured) {
        // mock fallback — use canonical mockTeams with member counts from mockPlayers
        const countMap: Record<string, number> = {};
        mockPlayers.forEach(p => { countMap[p.team_id] = (countMap[p.team_id] ?? 0) + 1; });
        setTeams(mockTeams.map(t => ({ ...t, memberCount: countMap[t.id] ?? 0 })));
        setLoadingTeams(false);
        return;
      }
      const { data: teamsData } = await supabase.from('teams').select('id, name, color, logo');
      const { data: profilesData } = await supabase.from('profiles').select('team_id').not('team_id', 'is', null);

      const countMap: Record<string, number> = {};
      profilesData?.forEach(p => { if (p.team_id) countMap[p.team_id] = (countMap[p.team_id] ?? 0) + 1; });

      setTeams((teamsData ?? []).map(t => ({
        ...t,
        memberCount: countMap[t.id] ?? 0,
      })));
      setLoadingTeams(false);
    }
    load();
  }, []);

  // ── Draw wheel on canvas ───────────────────────────────────────────────
  useEffect(() => {
    if (!teams.length || !canvasRef.current) return;
    drawWheel(currentRotationRef.current);
  }, [teams]);

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !teams.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const slice = (2 * Math.PI) / teams.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    teams.forEach((team, i) => {
      const start = rot + i * slice;
      const end = start + slice;

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = team.color + 'CC';
      ctx.fill();
      ctx.strokeStyle = '#0D1117';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(team.name, r - 12, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0D1117';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer at top (12 o'clock)
    const px = cx;
    const py = 4;
    ctx.beginPath();
    ctx.moveTo(px - 10, py);
    ctx.lineTo(px + 10, py);
    ctx.lineTo(px, py + 20);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  };

  // ── Weighted random: teams with fewer members get more weight ──────────
  const pickWeightedTeam = (): Team => {
    const maxCount = Math.max(...teams.map(t => t.memberCount));
    const weights = teams.map(t => maxCount - t.memberCount + 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < teams.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return teams[i];
    }
    return teams[teams.length - 1];
  };

  const handleSpin = () => {
    if (spinning || assignedTeam) return;

    const winner = pickWeightedTeam();
    const winnerIndex = teams.findIndex(t => t.id === winner.id);
    const slice = (2 * Math.PI) / teams.length;

    // Angle to land the pointer (top = 0) on winner's middle
    const targetAngle = -(winnerIndex * slice + slice / 2);
    // Add 5+ full rotations for drama
    const spins = 5 + Math.random() * 3;
    const finalRotation = targetAngle + spins * 2 * Math.PI;

    setSpinning(true);

    const duration = 4000;
    const start = performance.now();
    const startRot = currentRotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRot + finalRotation * eased;
      currentRotationRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setAssignedTeam(winner);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [winner.color, '#ffffff'] });
      }
    };

    requestAnimationFrame(animate);
  };

  // ── Save team assignment ───────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!assignedTeam || !user) return;
    setSaving(true);
    if (!isMockMode && isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({ team_id: assignedTeam.id, has_spun: true })
        .eq('id', user.id);
    }
    await refreshProfile();
    setSaving(false);
  };

  if (loadingTeams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Spin to Join a Team!</h1>
        <p className="text-muted-foreground text-sm">
          {assignedTeam
            ? `You landed on ${assignedTeam.logo} ${assignedTeam.name}!`
            : "Give the wheel a spin — your team awaits."}
        </p>
      </div>

      {/* Wheel */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full shadow-2xl"
          style={{ filter: spinning ? 'drop-shadow(0 0 24px rgba(255,255,255,0.15))' : undefined }}
        />
      </div>

      {/* CTA */}
      {!assignedTeam ? (
        <Button
          size="lg"
          className="px-10 text-base font-bold"
          onClick={handleSpin}
          disabled={spinning}
        >
          {spinning ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Spinning…</>
          ) : (
            "🎯 Spin the Wheel!"
          )}
        </Button>
      ) : (
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center gap-3 rounded-2xl border px-6 py-4 text-lg font-bold"
            style={{ borderColor: assignedTeam.color + '66', background: assignedTeam.color + '15', color: assignedTeam.color }}
          >
            <span className="text-2xl">{assignedTeam.logo}</span>
            {assignedTeam.name}
          </div>
          <div>
            <Button size="lg" className="px-10" onClick={handleConfirm} disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining team…</>
              ) : (
                "Join this team! 🚀"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
