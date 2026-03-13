import { useState } from 'react';
import { PlayerHeader, PlayerView } from '../components/player/PlayerHeader';
import { ChallengeBanner } from '../components/player/ChallengeBanner';
import { LiveStandings } from '../components/player/LiveStandings';
import { SeasonTimeline } from '../components/player/SeasonTimeline';
import { PuzzleModal } from '../components/player/PuzzleModal';

export function Home() {
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [activeView, setActiveView] = useState<PlayerView>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <PlayerHeader activeView={activeView} onViewChange={setActiveView} />
      <ChallengeBanner onOpen={() => setPuzzleOpen(true)} />
      <LiveStandings />
      <SeasonTimeline onViewEvents={() => setActiveView('events')} />
      <PuzzleModal open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />
    </div>
  );
}
