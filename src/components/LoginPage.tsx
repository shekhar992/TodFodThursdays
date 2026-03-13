import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Zap } from "lucide-react";

interface LoginPageProps {
  onCancel?: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginPage({ onCancel, onSwitchToSignUp }: LoginPageProps) {
  const { signIn, resetPassword } = useAuth();
  const [tab, setTab] = useState<'player' | 'admin'>('player');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const isAdmin = tab === 'admin';

  const switchTab = (next: 'player' | 'admin') => {
    setTab(next);
    setError(null);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Enter your email above first."); return; }
    setError(null);
    setResetLoading(true);
    const { error } = await resetPassword(email);
    setResetLoading(false);
    if (error) { setError(error); return; }
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md">
      <div className="w-full max-w-sm mx-4 space-y-5 rounded-2xl border border-border/50 bg-card shadow-2xl p-8">

        {/* Player / Admin tab toggle */}
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => switchTab('player')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'player'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Player
          </button>
          <button
            type="button"
            onClick={() => switchTab('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'admin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">{isAdmin ? "Admin Access" : "Welcome Back"}</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Sign in to manage the arena" : "Sign in to jump back into the arena"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={isAdmin ? "admin@example.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="text-right -mt-1">
            {resetSent ? (
              <span className="text-xs text-emerald-400">✓ Reset link sent to {email}</span>
            ) : (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 disabled:opacity-50"
              >
                {resetLoading ? "Sending…" : "Forgot Password?"}
              </button>
            )}
          </div>

          {error && (
            error === 'RATE_LIMIT' || error === 'SMTP_ERROR' ? (
              <Alert className="border-amber-500/40 bg-amber-500/10">
                <AlertDescription className="text-amber-300">
                  {error === 'RATE_LIMIT'
                    ? 'Too many attempts — please wait a few minutes and try again.'
                    : 'Could not send the reset email. Please try again in a moment.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              "Sign In"
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={onCancel}>
              {isAdmin ? "Back" : "Continue as Spectator"}
            </Button>
          )}
        </form>

        {!isAdmin && onSwitchToSignUp && (
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              type="button"
              className="text-primary underline underline-offset-4 hover:opacity-80"
              onClick={onSwitchToSignUp}
            >
              Create an account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}


