import { useState } from "react";
import { useArena } from "@/context/ArenaContext";
import { useShoutouts } from "@/hooks/useShoutouts";
import { PlayerHeader, PlayerView } from "@/components/player/PlayerHeader";
import { AnnouncementTicker } from "@/components/player/AnnouncementTicker";
import { HeroBanner } from "@/components/player/HeroBanner";
import { PlayerProfilePanel } from "@/components/player/PlayerProfilePanel";
import { ChallengeBanner } from "@/components/player/ChallengeBanner";
import { LiveStandings } from "@/components/player/LiveStandings";
import { SeasonTimeline } from "@/components/player/SeasonTimeline";
import { PuzzleModal } from "@/components/player/PuzzleModal";
import { EventsView } from "@/components/player/EventsView";
import { PuzzlesView } from "@/components/player/PuzzlesView";
import { StageView } from "@/components/player/StageView";
import { LastEventHighlights } from "@/components/player/LastEventHighlights";

export function PlayerDashboard() {
  const { stageMode, activePuzzle, events } = useArena();
  const { latestEventShoutouts } = useShoutouts();
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [activeView, setActiveView] = useState<PlayerView>('dashboard');

  if (stageMode) return <StageView />;

  // Featured slot priority logic:
  // 1. active puzzle → ChallengeBanner (always rendered below, shows/hides itself)
  // 2. today is the next event's date → highlights hidden (countdown context takes over)
  // 3. published highlights exist → show Last Event Highlights
  const today = new Date().toDateString();
  const nextEvent = events
    .filter(e => !e.isPast && e.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const nextEventIsToday = nextEvent
    ? new Date(nextEvent.date).toDateString() === today
    : false;
  const showHighlights = !activePuzzle && !nextEventIsToday && latestEventShoutouts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <PlayerHeader activeView={activeView} onViewChange={setActiveView} />
      <AnnouncementTicker />

      {/* Fixed profile panel — always rendered, positioned top-right */}
      <PlayerProfilePanel />

      {activeView === 'dashboard' && (
        <>
          <HeroBanner />
          <ChallengeBanner onOpen={() => setPuzzleOpen(true)} />
          {showHighlights && <LastEventHighlights shoutouts={latestEventShoutouts} />}
          <LiveStandings />
          <SeasonTimeline onViewEvents={() => setActiveView('events')} />
        </>
      )}

      {activeView === 'events' && (
        <EventsView />
      )}

      {activeView === 'puzzles' && (
        <PuzzlesView onOpenPuzzle={() => setPuzzleOpen(true)} />
      )}

      <PuzzleModal open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />
    </div>
  );
}
