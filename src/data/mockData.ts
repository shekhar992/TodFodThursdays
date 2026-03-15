// Mock data for fallback when Supabase is not configured.
// Types are kept compatible with the Supabase DB schema.

export interface Team {
  id: string;
  name: string;
  score: number;
  wins: number;
  color: string;
  logo: string;
}

export interface Announcement {
  id: string;
  text: string;
  emoji: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  participants?: number;
}

export interface Puzzle {
  id: string;
  question: string;
  hint: string;
  answer: string;
  points: number;
  isActive: boolean;
  duration?: number;
  // Scheduling / timer fields (populated from DB in prod mode)
  timeLimit?: number;       // seconds
  scheduledFor?: number;    // ms timestamp
  timerRunning?: boolean;
  startedAt?: number;       // ms timestamp
  expiresAt?: number;       // ms timestamp
}

// ─── Extended event-manager types ───────────────────────────────────────────

export type ManagedEventType = 'Physical' | 'Quiz' | 'Creative' | 'Strategy' | 'WildCard';
export type ManagedEventStatus = 'draft' | 'scheduled' | 'live' | 'completed';

export interface ManagedEvent {
  id: string;
  type: ManagedEventType;
  title: string;
  date: string;
  description: string;
  image?: string;
  cloudinaryPublicId?: string;
  category?: string;
  participants?: number;
  status: ManagedEventStatus;
  createdAt?: number;
}

export interface PhysicalEvent extends ManagedEvent {
  type: 'Physical';
  venue: string;
  duration: string;
  equipment?: string;
}

export interface QuizEvent extends ManagedEvent {
  type: 'Quiz';
  topic: string;
  numQuestions: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CreativeEvent extends ManagedEvent {
  type: 'Creative';
  medium: string;
  theme: string;
  materials?: string;
}

export interface StrategyEvent extends ManagedEvent {
  type: 'Strategy';
  format: '1v1' | 'Team' | 'FFA';
  teamSize: string;
  timeLimit: string;
}

export interface WildCardEvent extends ManagedEvent {
  type: 'WildCard';
  surprise: string;
  revealDate?: string;
}

export const EVENT_TYPE_META: Record<ManagedEventType, { label: string; emoji: string; color: string; description: string }> = {
  Physical: { label: 'Physical',  emoji: '🏃', color: '#00E5FF', description: 'Outdoor or physical activity challenge' },
  Quiz:     { label: 'Quiz',      emoji: '🧠', color: '#7A5CFF', description: 'Knowledge-based quiz competition' },
  Creative: { label: 'Creative',  emoji: '🎨', color: '#FF2E88', description: 'Art, design, or creative expression event' },
  Strategy: { label: 'Strategy',  emoji: '♟️', color: '#00FFC6', description: 'Strategic thinking and planning battle' },
  WildCard: { label: 'Wild Card', emoji: '🃏', color: '#FFE600', description: 'Surprise event revealed on the day' },
};

export const categoryColors: Record<string, string> = {
  Trivia:       '#7A5CFF',
  Puzzle:       '#00E5FF',
  Physical:     '#00FFC6',
  Strategy:     '#FF2E88',
  Tech:         '#FFE600',
  Adventure:    '#FF6B35',
  'Grand Finale': '#F59E0B',
};

export const mockTeams: Team[] = [
  { id: '1', name: 'Team Titans',    score: 520, wins: 7, color: '#00E5FF', logo: '⚡' },
  { id: '2', name: 'Team Phoenix',   score: 480, wins: 6, color: '#FF2E88', logo: '🔥' },
  { id: '3', name: 'Team Mavericks', score: 460, wins: 5, color: '#7A5CFF', logo: '🦅' },
  { id: '4', name: 'Team Warriors',  score: 430, wins: 4, color: '#00FFC6', logo: '⚔️' },
  { id: '5', name: 'Team Vortex',    score: 390, wins: 3, color: '#FFE600', logo: '🌀' },
  { id: '6', name: 'Team Nexus',     score: 350, wins: 2, color: '#FF6B35', logo: '🔗' },
];

export const mockAnnouncements: Announcement[] = [
  { id: 'a1', text: 'Season 2 is officially live! Good luck to all teams.', emoji: '🚀' },
  { id: 'a2', text: 'Team Titans take the lead after Quiz Battle Royale.',  emoji: '🏆' },
  { id: 'a3', text: 'Reminder: Treasure Hunt starts March 15th at 10am.',   emoji: '🗺️' },
  { id: 'a4', text: 'New scoring rules: bonus points for style and creativity.', emoji: '⭐' },
  { id: 'a5', text: 'Live puzzle challenges are now available mid-week!',    emoji: '🧩' },
];

export const mockHighlightEvents: Event[] = [
  { id: 'p1', title: 'Quiz Battle Royale',    category: 'Trivia',   date: '2025-02-10', description: 'Fast-paced quiz showdown',         image: '', status: 'completed' },
  { id: 'p2', title: 'Escape Room Challenge', category: 'Puzzle',   date: '2025-02-17', description: 'Team-based escape room',           image: '', status: 'completed' },
  { id: 'p3', title: 'Outdoor Sprint',        category: 'Physical', date: '2025-02-24', description: 'Relay race across campus',         image: '', status: 'completed' },
  { id: 'p4', title: 'Strategy Blitz',        category: 'Strategy', date: '2025-03-03', description: 'Real-time strategy tournament',   image: '', status: 'completed' },
  { id: 'p5', title: 'Hackathon Sprint',      category: 'Tech',     date: '2025-03-10', description: '4-hour build challenge',           image: '', status: 'completed' },
];

export const mockUpcomingEvents: Event[] = [
  { id: 'u1', title: 'Treasure Hunt',         category: 'Adventure',    date: '2026-03-15', description: 'Campus-wide hunt with cryptic location clues and photo checkpoints',   image: '', status: 'upcoming' },
  { id: 'u2', title: 'Digital Escape Room',   category: 'Puzzle',       date: '2026-03-19', description: 'Five layered digital puzzles — solve them faster than every other team', image: '', status: 'upcoming' },
  { id: 'u3', title: 'Outdoor Relay Wars',    category: 'Physical',     date: '2026-03-22', description: 'Four physical challenges, one relay format, and serious bragging rights', image: '', status: 'upcoming' },
  { id: 'u4', title: 'Debate Duel',           category: 'Strategy',     date: '2026-03-26', description: 'Topic revealed 10 min before start. No prep. Pure wits.',                image: '', status: 'upcoming' },
  { id: 'u5', title: 'Hack & Pitch',          category: 'Tech',         date: '2026-03-29', description: 'Build a no-code solution in 2 hrs, pitch it in 2 min — judges will not be gentle', image: '', status: 'upcoming' },
  { id: 'u6', title: 'Grand Finale',          category: 'Grand Finale', date: '2026-04-05', description: 'Three rounds, all disciplines, one champion. The season ends here.',      image: '', status: 'upcoming' },
];

export const mockActivePuzzle: Puzzle = {
  id: 'pz1',
  question: "I'm always hungry and must always be fed. The finger I lick will soon turn red. What am I?",
  answer: 'fire',
  hint: 'Think heat, light, and danger.',
  points: 50,
  isActive: true,
};

// ─── Rich event details (for EventsView demo) ────────────────────────────────

export interface EventDetail {
  emoji: string;
  format: string;
  duration: string;
  rules: string[];
  pointsBreakdown: { place: string; pts: number }[];
  winner?: string;      // past events only
  winnerLogo?: string;
  color: string;
  results?: { place: string; teamName: string; teamLogo?: string; pts: number }[];
  memories?: string[];   // image URLs uploaded by admin
}

export const EVENT_DETAILS: Record<string, EventDetail> = {
  // ── Upcoming ──────────────────────────────────────────────────────────────
  u1: {
    emoji: '🗺️',
    format: 'Campus-wide · All Teams',
    duration: '90 min',
    color: '#FF6B35',
    rules: [
      'Each team receives a sealed envelope with the first clue at 10:00 AM',
      'Clues are location-based — you must physically visit each spot',
      'Photograph proof required at every checkpoint',
      'No rideshares or vehicles — foot traffic only',
      'First team to return with all 8 stamps wins',
    ],
    pointsBreakdown: [
      { place: '🥇 1st', pts: 100 },
      { place: '🥈 2nd', pts: 70 },
      { place: '🥉 3rd', pts: 50 },
      { place: '4th–6th', pts: 20 },
    ],
  },
  u2: {
    emoji: '🧩',
    format: 'Digital · Team of 4',
    duration: '45 min',
    color: '#00E5FF',
    rules: [
      'Teams enter a shared digital escape room link at exactly 3:00 PM',
      'Five layered puzzles must be solved in sequence',
      'One hint available per puzzle — use wisely',
      'Submissions close the moment the timer hits zero',
      'Partial completion counts: each solved room = 10 bonus pts',
    ],
    pointsBreakdown: [
      { place: '🥇 1st', pts: 100 },
      { place: '🥈 2nd', pts: 70 },
      { place: '🥉 3rd', pts: 50 },
      { place: 'Each room solved', pts: 10 },
    ],
  },
  u3: {
    emoji: '🏃',
    format: 'Outdoor · Multi-Sport Relay',
    duration: '90 min',
    color: '#00FFC6',
    rules: [
      'Four physical challenges back-to-back: Sprint, Balance Beam, Tug of War, Obstacle Run',
      'Minimum 2 team members per challenge — rotate freely',
      'All 4 challenges must be completed for the score to count',
      'Fastest cumulative time across all 4 wins',
      'Team cheer counts — loudest support earns a 5pt bonus',
    ],
    pointsBreakdown: [
      { place: '🥇 1st', pts: 100 },
      { place: '🥈 2nd', pts: 70 },
      { place: '🥉 3rd', pts: 50 },
      { place: 'Loudest crowd', pts: 5 },
    ],
  },
  u4: {
    emoji: '♟️',
    format: 'Head-to-Head · Debate Format',
    duration: '60 min',
    color: '#7A5CFF',
    rules: [
      'Topic revealed 10 minutes before start — no prior preparation',
      '2 speakers per team, 3 minutes each for opening argument',
      '90-second rebuttals allowed',
      'Audience team members may submit one written challenge card',
      'Judged on: Logic (40%), Delivery (30%), Creativity (30%)',
    ],
    pointsBreakdown: [
      { place: '🥇 Winner', pts: 120 },
      { place: '🥈 Runner-up', pts: 80 },
      { place: 'Best argument', pts: 20 },
    ],
  },
  u5: {
    emoji: '💡',
    format: 'No-Code Build + Pitch',
    duration: '2 hrs 20 min',
    color: '#FFE600',
    rules: [
      'Tools allowed: Notion, Airtable, Glide, Webflow, Zapier, or similar',
      'Must solve a real workplace problem — no toy demos',
      '2-hour build window. Clock starts simultaneously for all teams',
      '2-minute pitch, no slides, live demo required',
      'Judged on: Usefulness (40%), Creativity (35%), Effort (25%)',
    ],
    pointsBreakdown: [
      { place: '🥇 1st', pts: 150 },
      { place: '🥈 2nd', pts: 100 },
      { place: '🥉 3rd', pts: 70 },
      { place: 'Most creative use', pts: 30 },
    ],
  },
  u6: {
    emoji: '🏆',
    format: 'Multi-Round Championship · All Teams',
    duration: '3 hours',
    color: '#F59E0B',
    rules: [
      'Three rounds: Knowledge Blitz (30 min) → Strategy Crunch (45 min) → Physical Finale (30 min)',
      'All teams compete in every round — no elimination',
      'Season performance multiplier applied (top team = 1.2×)',
      'Points from all three rounds aggregated for final ranking',
      'Season 2 Champion crowned at the ceremony post-event',
    ],
    pointsBreakdown: [
      { place: '🥇 Champion', pts: 200 },
      { place: '🥈 2nd', pts: 150 },
      { place: '🥉 3rd', pts: 100 },
      { place: '4th–6th', pts: 50 },
    ],
  },
  // ── Past ──────────────────────────────────────────────────────────────────
  p1: {
    emoji: '🧠',
    format: 'Quiz · All Teams',
    duration: '30 min',
    color: '#7A5CFF',
    rules: ['30 rapid-fire questions', '+5 correct, −2 wrong', 'No conferring'],
    pointsBreakdown: [{ place: '🥇 1st', pts: 100 }, { place: '🥈 2nd', pts: 70 }, { place: '🥉 3rd', pts: 50 }],
    winner: 'Team Titans',
    winnerLogo: '⚡',
    results: [
      { place: '🥇', teamName: 'Team Titans',    teamLogo: '⚡', pts: 100 },
      { place: '🥈', teamName: 'Team Phoenix',   teamLogo: '🔥', pts: 70  },
      { place: '🥉', teamName: 'Team Warriors',  teamLogo: '⚔️', pts: 50  },
      { place: '4th', teamName: 'Team Mavericks', teamLogo: '🦅', pts: 20 },
    ],
  },
  p2: {
    emoji: '🔐',
    format: 'Digital Escape Room',
    duration: '45 min',
    color: '#00E5FF',
    rules: ['5 rooms', 'One hint per room', 'Fastest wins'],
    pointsBreakdown: [{ place: '🥇 1st', pts: 100 }, { place: '🥈 2nd', pts: 70 }, { place: '🥉 3rd', pts: 50 }],
    winner: 'Team Phoenix',
    winnerLogo: '🔥',
    results: [
      { place: '🥇', teamName: 'Team Phoenix',   teamLogo: '🔥', pts: 100 },
      { place: '🥈', teamName: 'Team Mavericks', teamLogo: '🦅', pts: 70  },
      { place: '🥉', teamName: 'Team Titans',    teamLogo: '⚡', pts: 50  },
      { place: '4th', teamName: 'Team Warriors',  teamLogo: '⚔️', pts: 20 },
    ],
  },
  p3: {
    emoji: '🏃',
    format: 'Outdoor Relay',
    duration: '60 min',
    color: '#00FFC6',
    rules: ['4 relay legs', 'Fastest cumulative time wins'],
    pointsBreakdown: [{ place: '🥇 1st', pts: 100 }, { place: '🥈 2nd', pts: 70 }, { place: '🥉 3rd', pts: 50 }],
    winner: 'Team Warriors',
    winnerLogo: '⚔️',
    results: [
      { place: '🥇', teamName: 'Team Warriors',  teamLogo: '⚔️', pts: 100 },
      { place: '🥈', teamName: 'Team Titans',    teamLogo: '⚡', pts: 70  },
      { place: '🥉', teamName: 'Team Phoenix',   teamLogo: '🔥', pts: 50  },
      { place: '4th', teamName: 'Team Mavericks', teamLogo: '🦅', pts: 20 },
    ],
    memories: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    ],
  },
  p4: {
    emoji: '♟️',
    format: 'Strategy Board',
    duration: '45 min',
    color: '#FF2E88',
    rules: ['Real-time strategy rounds', 'Elimination bracket'],
    pointsBreakdown: [{ place: '🥇 1st', pts: 100 }, { place: '🥈 2nd', pts: 70 }, { place: '🥉 3rd', pts: 50 }],
    winner: 'Team Titans',
    winnerLogo: '⚡',
    results: [
      { place: '🥇', teamName: 'Team Titans',    teamLogo: '⚡', pts: 100 },
      { place: '🥈', teamName: 'Team Warriors',  teamLogo: '⚔️', pts: 70  },
      { place: '🥉', teamName: 'Team Mavericks', teamLogo: '🦅', pts: 50  },
      { place: '4th', teamName: 'Team Phoenix',   teamLogo: '🔥', pts: 20 },
    ],
  },
  p5: {
    emoji: '💻',
    format: '4-Hour Hackathon',
    duration: '4 hours',
    color: '#FFE600',
    rules: ['Any language/tool', '5-min demo pitch', 'Live judge panel'],
    pointsBreakdown: [{ place: '🥇 1st', pts: 150 }, { place: '🥈 2nd', pts: 100 }, { place: '🥉 3rd', pts: 70 }],
    winner: 'Team Mavericks',
    winnerLogo: '🦅',
    results: [
      { place: '🥇', teamName: 'Team Mavericks', teamLogo: '🦅', pts: 150 },
      { place: '🥈', teamName: 'Team Phoenix',   teamLogo: '🔥', pts: 100 },
      { place: '🥉', teamName: 'Team Titans',    teamLogo: '⚡', pts: 70  },
      { place: '4th', teamName: 'Team Warriors',  teamLogo: '⚔️', pts: 30 },
    ],
    memories: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    ],
  },
};

// ─── Past puzzles (for PuzzlesView history) ──────────────────────────────────

export interface PastPuzzle {
  id: string;
  question: string;
  answer: string;
  hint: string;
  points: number;
  awardedPoints?: number;
  solvedBy: string;
  solvedByLogo: string;
  solvedByTeamId?: string;
  date: string;
  scheduledFor?: number;  // ms timestamp
}

export const mockPastPuzzles: PastPuzzle[] = [
  {
    id: 'ppz1',
    question: 'What has keys but no locks, space but no room, and you can enter but you cannot go inside?',
    answer: 'A keyboard',
    hint: 'You use it every day at work.',
    points: 40,
    awardedPoints: 70,
    solvedBy: 'Team Phoenix',
    solvedByLogo: '🔥',
    date: '2026-03-06',
    scheduledFor: new Date('2026-03-06T18:00:00').getTime(),
  },
  {
    id: 'ppz2',
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'Footsteps',
    hint: 'Think about movement.',
    points: 35,
    awardedPoints: 35,
    solvedBy: 'Team Titans',
    solvedByLogo: '⚡',
    date: '2026-03-06',
    scheduledFor: new Date('2026-03-06T20:00:00').getTime(),
  },
  {
    id: 'ppz3',
    question: 'I have cities but no houses, mountains but no trees, and water but no fish. What am I?',
    answer: 'A map',
    hint: 'It helps you find your way.',
    points: 60,
    awardedPoints: 110,
    solvedBy: 'Team Mavericks',
    solvedByLogo: '🦅',
    date: '2026-02-27',
    scheduledFor: new Date('2026-02-27T19:00:00').getTime(),
  },
];

export const mockManagedEvents: ManagedEvent[] = [
  { id: 'me1', type: 'Quiz',     title: 'Quiz Battle Royale',    date: '2026-03-20', description: 'Fast-paced quiz showdown', status: 'scheduled', topic: 'General Knowledge', numQuestions: '20', difficulty: 'Medium' } as QuizEvent,
  { id: 'me2', type: 'Physical', title: 'Outdoor Olympics',      date: '2026-03-22', description: 'Multi-sport relay event',  status: 'draft',     venue: 'TBD', duration: '2h' } as PhysicalEvent,
];
