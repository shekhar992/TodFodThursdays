import { useState, useEffect } from "react";
import { ArenaProvider } from "@/context/ArenaContext";
import { PlayerDashboard } from "@/components/player/PlayerDashboard";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { SpinnerPage } from "@/components/player/SpinnerPage";
import { LoginPage } from "@/components/LoginPage";
import { SignUpPage } from "@/components/SignUpPage";
import { ResetPasswordPage } from "@/components/ResetPasswordPage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { isMockMode } from "@/lib/mockAuth";

type AuthScreen = "login" | "signup" | null;

const Index = () => {
  const { user, profile, isAdmin, signOut, signIn, loading, profileLoading, isPasswordRecovery } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>(null);

  // Auto-show login overlay the first time a visitor lands (once auth resolves)
  useEffect(() => {
    if (!loading && !user && !isMockMode) {
      setAuthScreen("login");
    }
  }, [loading, user]);

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

  // ── Password recovery flow ────────────────────────────────────────────
  if (isPasswordRecovery) {
    return <ResetPasswordPage />;
  }

  // ── Auth screens (not logged in) ───────────────────────────────────────
  if (!isMockMode && authScreen === "signup") {
    return <SignUpPage onSwitchToLogin={() => setAuthScreen("login")} />;
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

    // Player: has team → player dashboard
    return (
      <ArenaProvider>
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

  // ── Not logged in → arena background + login overlay ───────────────────
  return (
    <ArenaProvider>
      {/* Mock mode switcher */}
      {isMockMode && (
        <div className="relative z-[70] bg-amber-400 text-black text-xs px-4 py-1.5 flex items-center justify-between shadow-sm">
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

      {/* Arena background — always visible, non-interactive when modal is up */}
      <div className={!isMockMode && authScreen ? "pointer-events-none select-none" : ""}>
        <PlayerDashboard />
      </div>

      {/* Login overlay — blurred window into the arena behind */}
      {!isMockMode && authScreen === "login" && (
        <LoginPage
          onCancel={() => setAuthScreen(null)}
          onSwitchToSignUp={() => setAuthScreen("signup")}
        />
      )}

      {/* Tiny re-entry link if user dismissed as spectator */}
      {!isMockMode && !authScreen && (
        <button
          onClick={() => setAuthScreen("login")}
          className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
        >
          Sign In
        </button>
      )}
    </ArenaProvider>
  );
};

export default Index;
