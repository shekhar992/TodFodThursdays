import { ArenaProvider } from "@/context/ArenaContext";
import { StageView } from "@/components/player/StageView";
import { LiveJoinView } from "@/components/player/LiveJoinView";

// Public, unauthenticated route — safe to open on a projector without logging in.
// Mode is set via query param: /stage?mode=registration | /stage?mode=season
// Admin opens the right URL on the projector once; they control content from AdminPanel.

function StageContent() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode === "registration") return <LiveJoinView />;
  if (mode === "season") return <StageView />;

  // Standby — no mode param or unknown value
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-background">
      <span className="text-6xl">🏟️</span>
      <div className="text-center">
        <h1 className="text-3xl font-black text-foreground">TodFod Season 2</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Waiting for admin to activate the board…
        </p>
      </div>
      <div className="mt-2 flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <p className="font-semibold uppercase tracking-widest">Available modes</p>
        <div className="flex gap-3">
          <code className="rounded border border-border bg-card px-3 py-1.5">
            ?mode=registration
          </code>
          <code className="rounded border border-border bg-card px-3 py-1.5">
            ?mode=season
          </code>
        </div>
      </div>
    </div>
  );
}

export default function StagePage() {
  return (
    <ArenaProvider>
      <StageContent />
    </ArenaProvider>
  );
}
