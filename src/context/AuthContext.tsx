import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isMockMode, MOCK_PROFILES, makeMockUser, type MockRole } from "@/lib/mockAuth";

export interface UserProfile {
  id: string;
  display_name: string;
  role: 'admin' | 'player';
  team_id: string | null;
  is_captain: boolean;
  has_spun: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Mock mode: wire up in-memory auth ─────────────────────────────────
  const setMockRole = useCallback((role: MockRole | null) => {
    if (role === null) {
      setUser(null);
      setSession(null);
      setProfile(null);
    } else {
      setUser(makeMockUser(role));
      setProfile(MOCK_PROFILES[role]);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setProfileLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
    setProfileLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isMockMode) {
      // After spinner confirm → advance to player-with-team
      setProfile(prev =>
        prev && prev.role === 'player'
          ? { ...prev, has_spun: true, team_id: prev.team_id ?? '1' }
          : prev
      );
      return;
    }
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (isMockMode) {
      // Start as logged-out in mock mode; Index will show demo switcher
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
    if (isMockMode) {
      setMockRole('new-player');
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      // Supabase returns this message when the email is already registered
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists') ||
        error.message.toLowerCase().includes('user already')
      ) {
        return { error: 'EMAIL_ALREADY_EXISTS' };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isMockMode) {
      if (email === 'admin@demo.com') setMockRole('admin');
      else if (email === 'player-team@demo.com') setMockRole('player-with-team');
      else setMockRole('new-player');
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (isMockMode) { setMockRole(null); return; }
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, profileLoading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
