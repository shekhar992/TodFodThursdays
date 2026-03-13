import { useState, useEffect } from "react";
import { ArenaProvider } from "@/context/ArenaContext";
import { PlayerDashboard } from "@/components/player/PlayerDashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { SpinnerPage } from "@/components/player/SpinnerPage";
import { TeamView } from "@/components/player/TeamView";
import { LoginPage } from "@/components/LoginPage";
import { SignUpPage } from "@/components/SignUpPage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { isMockMode } from "@/lib/mockAuth";

type AuthScreen = "login" | "signup" | null;
type LoginVariant = "player" | "admin";

const Index = () => {
  const { user, profile, isAdmin, signOut, signIn, loading, profileLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>(null);
  const [loginVariant, setLoginVariant] = useState<LoginVariant>("player");

  const openPlayerLogin = () => { setLoginVariant("player"); setAuthScreen("login"); };
  const openAdminLogin  = () => { setLoginVariant("admin");  setAuthScreen("login"); };

  // Auto-close auth screen when logged in
  useEffect(() => {
    if (user) setAuthScreen(null);
  }, [user]);

  // ── Full-screen loading spinner ────────────────────────────────────────
  if (loading || (user && profileLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Auth screens (not logged in) ───────────────────────────────────────
  if (!isMockMode && authScreen === "signup") {
    return <SignUpPage onSwitchToLogin={openPlayerLogin} />;
  }

  if (!isMockMode && authScreen === "login") {
    return (
      <LoginPage
        variant={loginVariant}
        onCancel={() => setAuthScreen(null)}
        onSwitchToSignUp={() => setAuthScreen("signup")}
      />
    );
  }

  // ── Logged-in routing ──────────────────────────────────────────────────
  // user exists but no profile row (created before migration) — show error
  if (user && !profile) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4 text-center px-4">
        <p className="text-muted-foreground text-sm">
          Your account doesn't have a profile yet.<br />Ask an admin to create one, or run the setup SQL.
        </p>
        <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
      </div>
    );
  }

  if (user && profile) {    // Admin → full admin panel
    if (isAdmin) {
      return (
        <ArenaProvider>
          <AdminPanel />
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </ArenaProvider>
      );
    }

    // Player: hasn't spun yet → spinner
    if (!profile.has_spun) {
      return <SpinnerPage />;
    }

    // Player: spun but no team assigned (edge case) → spinner again
    if (!profile.team_id) {
      return <SpinnerPage />;
    }

    // Player: has team → team view + player dashboard
    return (
      <ArenaProvider>
        <TeamView />
        <PlayerDashboard />
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </ArenaProvider>
    );
  }

  // ── Not logged in → public player dashboard with auth buttons ─────────
  return (
    <ArenaProvider>
      <PlayerDashboard />

      {/* Mock mode switcher — visible only when VITE_MOCK_MODE=true */}
      {isMockMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber/90 text-black text-xs px-4 py-1.5 flex items-center justify-between">
          <span className="font-bold">🧪 Mock Mode</span>
          <div className="flex gap-2">
            <button
              className="bg-black/10 hover:bg-black/20 px-2.5 py-1 rounded font-medium"
              onClick={() => signIn('admin@demo.com', '')}
            >
              Login as Admin
            </button>
            <button
              className="bg-black/10 hover:bg-black/20 px-2.5 py-1 rounded font-medium"
              onClick={() => signIn('player-new@demo.com', '')}
            >
              New Player (spin)
            </button>
            <button
              className="bg-black/10 hover:bg-black/20 px-2.5 py-1 rounded font-medium"
              onClick={() => signIn('player-team@demo.com', '')}
            >
              Player with Team
            </button>
          </div>
        </div>
      )}

      {/* Auth buttons — hidden in mock mode (use the banner instead) */}
      {!isMockMode && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shadow-lg"
            onClick={() => setAuthScreen("signup")}
          >
            🎮 Join as Player
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 shadow-lg"
            onClick={openAdminLogin}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Button>
        </div>
      )}
    </ArenaProvider>
  );
};

export default Index;
