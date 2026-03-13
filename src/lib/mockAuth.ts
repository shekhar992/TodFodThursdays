// Mock auth data for VITE_MOCK_MODE=true
// Zero Supabase calls — all in memory.

import type { UserProfile } from "@/context/AuthContext";

export const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

export type MockRole = 'admin' | 'new-player' | 'player-with-team';

export const MOCK_PROFILES: Record<MockRole, UserProfile> = {
  'admin': {
    id: 'mock-admin-id',
    display_name: 'Demo Admin',
    role: 'admin',
    team_id: null,
    is_captain: false,
    has_spun: false,
  },
  'new-player': {
    id: 'mock-player-new-id',
    display_name: 'Demo Player',
    role: 'player',
    team_id: null,
    is_captain: false,
    has_spun: false,
  },
  'player-with-team': {
    id: 'mock-player-team-id',
    display_name: 'Demo Player',
    role: 'player',
    team_id: '1',
    is_captain: false,
    has_spun: true,
  },
};

// Fake User object that satisfies the Supabase User type shape
export function makeMockUser(role: MockRole) {
  const profile = MOCK_PROFILES[role];
  return {
    id: profile.id,
    email: role === 'admin' ? 'admin@demo.com' : 'player@demo.com',
    app_metadata: {},
    user_metadata: { display_name: profile.display_name },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as any;
}
