import { useState } from "react";
import { PlayerHeader, PlayerView } from "@/components/player/PlayerHeader";
import { AnnouncementTicker } from "@/components/player/AnnouncementTicker";
import { HeroBanner } from "@/components/player/HeroBanner";
import { PlayerProfilePanel } from "@/components/player/PlayerProfilePanel";
import { DynamicCallout } from "@/components/player/DynamicCallout";
import { LiveStandings } from "@/components/player/LiveStandings";
import { SeasonTimeline } from "@/components/player/SeasonTimeline";
import { PuzzleModal } from "@/components/player/PuzzleModal";
import { EventsView } from "@/components/player/EventsView";
import { PuzzlesView } from "@/components/player/PuzzlesView";

export function PlayerDashboard() {
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [activeView, setActiveView] = useState<PlayerView>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <PlayerHeader activeView={activeView} onViewChange={setActiveView} />
      <AnnouncementTicker />

      {/* Fixed profile panel — always rendered, positioned top-right */}
      <PlayerProfilePanel />

      {activeView === 'dashboard' && (
        <>
          <HeroBanner />
          <DynamicCallout onOpenPuzzle={() => setPuzzleOpen(true)} />
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
