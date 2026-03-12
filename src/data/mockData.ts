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
}

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Team Titans',
    score: 520,
    wins: 7,
    color: '#00E5FF',
    logo: '⚡',
  },
  {
    id: '2',
    name: 'Team Phoenix',
    score: 480,
    wins: 6,
    color: '#FF2E88',
    logo: '🔥',
  },
  {
    id: '3',
    name: 'Team Mavericks',
    score: 460,
    wins: 5,
    color: '#7A5CFF',
    logo: '🌪️',
  },
  {
    id: '4',
    name: 'Team Warriors',
    score: 430,
    wins: 4,
    color: '#00FFC6',
    logo: '🛡️',
  },
  {
    id: '5',
    name: 'Team Vortex',
    score: 390,
    wins: 3,
    color: '#FFE600',
    logo: '🌀',
  },
  {
    id: '6',
    name: 'Team Nexus',
    score: 350,
    wins: 2,
    color: '#FF7B00',
    logo: '🔮',
  },
];

export const mockAnnouncements: Announcement[] = [
  { id: '1', emoji: '🔥', text: 'TITANS WIN Quiz Battle — Leaderboard updated!' },
  { id: '2', emoji: '⚡', text: 'New Puzzle dropping TONIGHT at 6PM — stay sharp!' },
  { id: '3', emoji: '📸', text: 'Event highlights from Outdoor Sprint now uploaded' },
  { id: '4', emoji: '🏆', text: 'Team Phoenix surges 2 spots after Escape Room challenge' },
  { id: '5', emoji: '🎯', text: 'Treasure Hunt registration closes in 2 HOURS' },
  { id: '6', emoji: '🚀', text: 'Mid-Season bonus challenge unlocked — 50 pts up for grabs' },
  { id: '7', emoji: '📢', text: 'Admin has posted a new announcement — check Event Board' },
];

export const mockHighlightEvents: Event[] = [
  {
    id: '1',
    title: 'Quiz Battle Royale',
    description: 'Teams clashed in an intense trivia showdown across 5 categories.',
    image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=225&fit=crop',
    category: 'Quiz',
    date: 'Mar 8, 2026',
    status: 'completed',
    participants: 48,
  },
  {
    id: '2',
    title: 'Escape Room Challenge',
    description: 'Teams raced against the clock to crack codes and escape first.',
    image: 'https://images.unsplash.com/photo-1555661530-68c8e98a4b76?w=400&h=225&fit=crop',
    category: 'Puzzle',
    date: 'Mar 5, 2026',
    status: 'completed',
    participants: 32,
  },
  {
    id: '3',
    title: 'Outdoor Sprint',
    description: 'A fast-paced relay race with creative physical challenges between legs.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop',
    category: 'Physical',
    date: 'Mar 1, 2026',
    status: 'completed',
    participants: 60,
  },
  {
    id: '4',
    title: 'Strategy Blitz',
    description: 'A boardgame-style strategy tournament with real-time decisions.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=225&fit=crop',
    category: 'Strategy',
    date: 'Feb 25, 2026',
    status: 'completed',
    participants: 24,
  },
  {
    id: '5',
    title: 'Hackathon Sprint',
    description: 'Two-hour rapid build challenge — teams pitched working MVPs.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=225&fit=crop',
    category: 'Tech',
    date: 'Feb 18, 2026',
    status: 'completed',
    participants: 40,
  },
];

export const mockUpcomingEvents: Event[] = [
  {
    id: '6',
    title: 'Treasure Hunt',
    description: 'Discover hidden clues scattered across the office.',
    image: 'https://images.unsplash.com/photo-1509019549429-f304a54ab8b4?w=400&h=225&fit=crop',
    category: 'Adventure',
    date: 'Mar 15, 2026',
    status: 'upcoming',
  },
  {
    id: '7',
    title: 'Escape Puzzle',
    description: 'New room, harder locks, 30 minutes on the clock.',
    image: 'https://images.unsplash.com/photo-1526898943132-a0d4286c2c4f?w=400&h=225&fit=crop',
    category: 'Puzzle',
    date: 'Mar 19, 2026',
    status: 'upcoming',
  },
  {
    id: '8',
    title: 'Outdoor Olympics',
    description: 'Classic field games reimagined as team scoring events.',
    image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&h=225&fit=crop',
    category: 'Physical',
    date: 'Mar 22, 2026',
    status: 'upcoming',
  },
  {
    id: '9',
    title: 'Debate Duel',
    description: 'Rapid-fire debate rounds with surprise topics announced live.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=225&fit=crop',
    category: 'Debate',
    date: 'Mar 26, 2026',
    status: 'upcoming',
  },
  {
    id: '10',
    title: 'Code Golf',
    description: 'Solve the same problem in the fewest lines — elegance wins.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
    category: 'Tech',
    date: 'Mar 29, 2026',
    status: 'upcoming',
  },
  {
    id: '11',
    title: 'Final Showdown',
    description: 'Season 2 grand finale — all challenges combined into one epic event.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop',
    category: 'Finals',
    date: 'Apr 5, 2026',
    status: 'upcoming',
  },
];

export const mockActivePuzzle: Puzzle = {
  id: 'p1',
  question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.',
  hint: 'Think about sound... and nature.',
  answer: 'echo',
  points: 50,
  isActive: true,
};

// ─── Managed Events (Admin-only) ───────────────────────────────────────────

export type ManagedEventType = 'Physical' | 'Quiz' | 'Creative' | 'Strategy' | 'WildCard';
export type ManagedEventStatus = 'draft' | 'scheduled' | 'completed';

interface ManagedEventBase {
  id: string;
  type: ManagedEventType;
  status: ManagedEventStatus;
  title: string;
  date: string;
  description: string;
  createdAt: number;
}

export interface PhysicalEvent extends ManagedEventBase {
  type: 'Physical';
  venue: string;
  duration: string;
  equipment: string;
}

export interface QuizEvent extends ManagedEventBase {
  type: 'Quiz';
  topic: string;
  numQuestions: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CreativeEvent extends ManagedEventBase {
  type: 'Creative';
  medium: string;
  theme: string;
  materials: string;
}

export interface StrategyEvent extends ManagedEventBase {
  type: 'Strategy';
  format: '1v1' | 'Team' | 'FFA';
  teamSize: string;
  timeLimit: string;
}

export interface WildCardEvent extends ManagedEventBase {
  type: 'WildCard';
  surprise: string;
  revealDate: string;
}

export type ManagedEvent =
  | PhysicalEvent
  | QuizEvent
  | CreativeEvent
  | StrategyEvent
  | WildCardEvent;

export const EVENT_TYPE_META: Record<
  ManagedEventType,
  { label: string; emoji: string; color: string; description: string }
> = {
  Physical:  { label: 'Physical',  emoji: '🏃', color: '#00FFC6', description: 'Outdoor or indoor athletic challenges' },
  Quiz:      { label: 'Quiz',      emoji: '🧠', color: '#00E5FF', description: 'Trivia, knowledge battles, rapid-fire rounds' },
  Creative:  { label: 'Creative',  emoji: '🎨', color: '#FF2E88', description: 'Art, music, writing or design challenges' },
  Strategy:  { label: 'Strategy',  emoji: '♟️', color: '#7A5CFF', description: 'Boardgame-style logic and tactics events' },
  WildCard:  { label: 'Wild Card', emoji: '🃏', color: '#FFD700', description: 'Surprise format — revealed on the day' },
};

export const mockManagedEvents: ManagedEvent[] = [
  {
    id: 'me-1',
    type: 'Physical',
    status: 'completed',
    title: 'Outdoor Sprint',
    date: 'Mar 1, 2026',
    description: 'Relay race with creative physical challenges between legs.',
    venue: 'Office Courtyard',
    duration: '90 min',
    equipment: 'Cones, batons, stopwatch',
    createdAt: 1740000000000,
  },
  {
    id: 'me-2',
    type: 'Quiz',
    status: 'completed',
    title: 'Quiz Battle Royale',
    date: 'Mar 8, 2026',
    description: 'Intense trivia showdown across 5 categories.',
    topic: 'General Knowledge + Pop Culture',
    numQuestions: '30',
    difficulty: 'Medium',
    createdAt: 1740600000000,
  },
  {
    id: 'me-3',
    type: 'Strategy',
    status: 'scheduled',
    title: 'Strategy Blitz',
    date: 'Mar 19, 2026',
    description: 'Boardgame-style strategy tournament with real-time decisions.',
    format: 'Team',
    teamSize: '3',
    timeLimit: '60 min',
    createdAt: 1741000000000,
  },
  {
    id: 'me-4',
    type: 'Creative',
    status: 'scheduled',
    title: 'Design Jam',
    date: 'Mar 26, 2026',
    description: 'Teams design a brand identity for a fictional studio in 45 minutes.',
    medium: 'Design',
    theme: 'Futuristic Studio',
    materials: 'Figma / Whiteboard',
    createdAt: 1741200000000,
  },
  {
    id: 'me-5',
    type: 'WildCard',
    status: 'draft',
    title: 'Mystery Event',
    date: 'Apr 5, 2026',
    description: 'Season finale surprise — format TBD.',
    surprise: 'Combination of all event types in one mega-challenge.',
    revealDate: 'Apr 4, 2026',
    createdAt: 1741400000000,
  },
];

// ───────────────────────────────────────────────────────────────────────────

export const categoryColors: Record<string, string> = {
  Quiz: '#00E5FF',
  Puzzle: '#7A5CFF',
  Physical: '#00FFC6',
  Strategy: '#FF2E88',
  Tech: '#FFE600',
  Adventure: '#FF7B00',
  Debate: '#FF2E88',
  Finals: '#FFD700',
};
