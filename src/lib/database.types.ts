// Auto-generated types matching the Supabase schema.
// Regenerate after schema changes: npx supabase gen types typescript --linked > src/lib/database.types.ts

type TeamsRow = {
  id: string;
  name: string;
  score: number;
  color: string;
  logo: string;
  created_at: string;
};

type AnnouncementsRow = {
  id: string;
  text: string;
  emoji: string;
  created_at: string;
  pinned: boolean;
};

type EventsRow = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  cloudinary_public_id: string | null;
  category: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: number | null;
  created_at: string;
  // Lifecycle fields added in migration 007
  winner_team_id: string | null;
  winner_team_name: string | null;
  winner_team_logo: string | null;
  winner_points: number | null;
  results: Array<{ place: string; pts: number; teamId?: string; teamName?: string; teamLogo?: string }>;
  media_urls: string[];
  // Rich detail fields added in migration 008
  data: {
    emoji?: string;
    format?: string;
    duration?: string;
    rules?: string[];
    pointsBreakdown?: { place: string; pts: number }[];
  } | null;
};

type ArenaSettingsRow = {
  id: 1;
  stage_mode: boolean;
  updated_at: string;
};

type PuzzlesRow = {
  id: string;
  question: string;
  hint: string;
  answer: string;
  points: number;
  is_active: boolean;
  time_limit: number;          // seconds
  scheduled_for: string | null; // ISO timestamp
  timer_running: boolean;
  started_at: string | null;   // ISO timestamp
  expires_at: string | null;   // ISO timestamp
  // Completion fields — written in one UPDATE when puzzle ends
  solved_by: string | null;
  solved_by_logo: string | null;
  solved_by_player: string | null;
  solved_by_team_id: string | null;
  awarded_points: number | null;
  completed_at: string | null; // ISO timestamp — null means still active/not yet ended
  timed_out: boolean;
  created_at: string;
};

type CompletedPuzzlesRow = {
  id: string;
  question: string;
  answer: string;
  points: number;
  awarded_points: number | null;
  solved_by: string | null;
  solved_by_logo: string | null;
  solved_by_player: string | null;
  solved_by_team_id: string | null;
  completed_at: string;
  timed_out: boolean;
};

type PuzzleLibraryRow = {
  id: string;
  question: string;
  answer: string;
  hint: string;
  points: number;
  time_limit: number;           // seconds
  scheduled_for: string | null; // ISO timestamp — optional auto-launch
  created_at: string;
};

type ProfilesRow = {
  id: string;
  display_name: string;
  role: 'admin' | 'player';
  team_id: string | null;
  is_captain: boolean;
  has_spun: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: TeamsRow;
        Insert: Omit<TeamsRow, 'created_at' | 'id'> & { id?: string };
        Update: Partial<Omit<TeamsRow, 'created_at'>>;
        Relationships: [];
      };
      announcements: {
        Row: AnnouncementsRow;
        Insert: Omit<AnnouncementsRow, 'created_at'>;
        Update: Partial<Omit<AnnouncementsRow, 'created_at'>>;
        Relationships: [];
      };
      events: {
        Row: EventsRow;
        Insert: Omit<EventsRow, 'created_at'>;
        Update: Partial<Omit<EventsRow, 'created_at'>>;
        Relationships: [];
      };
      arena_settings: {
        Row: ArenaSettingsRow;
        Insert: Partial<ArenaSettingsRow>;
        Update: Partial<ArenaSettingsRow>;
        Relationships: [];
      };
      puzzles: {
        Row: PuzzlesRow;
        Insert: Omit<PuzzlesRow, 'created_at'>;
        Update: Partial<Omit<PuzzlesRow, 'created_at'>>;
        Relationships: [];
      };
      puzzle_library: {
        Row: PuzzleLibraryRow;
        Insert: Omit<PuzzleLibraryRow, 'created_at'>;
        Update: Partial<Omit<PuzzleLibraryRow, 'created_at'>>;
        Relationships: [];
      };
      completed_puzzles: {
        Row: CompletedPuzzlesRow;
        Insert: CompletedPuzzlesRow;
        Update: Partial<CompletedPuzzlesRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfilesRow;
        Insert: Omit<ProfilesRow, 'created_at'>;
        Update: Partial<Omit<ProfilesRow, 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      pick_team_weighted: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
