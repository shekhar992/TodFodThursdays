import { useState } from 'react';
import { PlayerHeader } from '../components/player/PlayerHeader';
import { ChallengeBanner } from '../components/player/ChallengeBanner';
import { LiveStandings } from '../components/player/LiveStandings';
import { UpcomingEvents } from '../components/player/UpcomingEvents';
import { PastEvents } from '../components/player/PastEvents';
import { PuzzleModal } from '../components/player/PuzzleModal';

export function Home() {
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PlayerHeader />
      <ChallengeBanner onOpen={() => setPuzzleOpen(true)} />
      <LiveStandings />
      <UpcomingEvents />
      <PastEvents />
      <PuzzleModal open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />
    </div>
  );
}
