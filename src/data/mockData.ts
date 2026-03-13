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
  { id: 'u1', title: 'Treasure Hunt',   category: 'Adventure',    date: '2026-03-15', description: 'Campus-wide treasure hunt with cryptic clues', image: '', status: 'upcoming' },
  { id: 'u2', title: 'Escape Puzzle',   category: 'Puzzle',       date: '2026-03-19', description: 'Digital escape room with layered riddles',      image: '', status: 'upcoming' },
  { id: 'u3', title: 'Outdoor Olympics',category: 'Physical',     date: '2026-03-22', description: 'Multi-sport outdoor relay event',               image: '', status: 'upcoming' },
  { id: 'u4', title: 'Debate Duel',     category: 'Strategy',     date: '2026-03-26', description: 'Head-to-head rapid-fire debates',               image: '', status: 'upcoming' },
  { id: 'u5', title: 'Code Golf',       category: 'Tech',         date: '2026-03-29', description: 'Solve problems in the fewest characters',        image: '', status: 'upcoming' },
  { id: 'u6', title: 'Final Showdown',  category: 'Grand Finale', date: '2026-04-05', description: 'The ultimate season finale challenge',           image: '', status: 'upcoming' },
];

export const mockActivePuzzle: Puzzle = {
  id: 'pz1',
  question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.',
  answer: 'echo',
  hint: 'Think about sound bouncing back.',
  points: 50,
  isActive: true,
};

export const mockManagedEvents: ManagedEvent[] = [
  { id: 'me1', type: 'Quiz',     title: 'Quiz Battle Royale',    date: '2026-03-20', description: 'Fast-paced quiz showdown', status: 'scheduled', topic: 'General Knowledge', numQuestions: '20', difficulty: 'Medium' } as QuizEvent,
  { id: 'me2', type: 'Physical', title: 'Outdoor Olympics',      date: '2026-03-22', description: 'Multi-sport relay event',  status: 'draft',     venue: 'TBD', duration: '2h' } as PhysicalEvent,
];
