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
  /** 'player' = player-facing login; 'admin' = admin-only login. Defaults to 'player'. */
  variant?: 'player' | 'admin';
}

export function LoginPage({ onCancel, onSwitchToSignUp, variant = 'player' }: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = variant === 'admin';
  const icon = isAdmin
    ? <Shield className="h-6 w-6 text-primary" />
    : <Zap className="h-6 w-6 text-primary" />;
  const title = isAdmin ? "Admin Login" : "Welcome Back";
  const subtitle = isAdmin
    ? "Sign in to access the admin dashboard"
    : "Sign in to your player account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 space-y-6 rounded-2xl border border-border/50 bg-card shadow-2xl p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              "Sign In"
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
              {isAdmin ? "Back" : "Continue as Spectator"}
            </Button>
          )}
        </form>

        {onSwitchToSignUp && !isAdmin && (
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

