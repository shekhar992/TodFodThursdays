import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Trash2, Loader2, RefreshCw, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
}

// Helper: call the manage-admin-users edge function
async function callAdminFn(action: string, params: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [edgeFnError, setEdgeFnError] = useState<string | null>(null);

  // New admin form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setEdgeFnError(null);
    try {
      const data = await callAdminFn('list');
      setUsers(data.users ?? []);
    } catch (err: any) {
      const msg = err.message ?? 'Unknown error';
      setEdgeFnError(msg);
      console.error('[AdminUsers] list error:', msg);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword) return;
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setCreating(true);
    try {
      await callAdminFn('create', {
        email: newEmail.trim(),
        password: newPassword,
        display_name: newName.trim(),
      });
      toast.success(`Admin account created for ${newName.trim()}`);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to create user: " + err.message);
    }
    setCreating(false);
  };

  const handleDelete = async (userId: string, displayName: string) => {
    if (userId === currentUser?.id) { toast.error("You cannot remove your own account."); return; }
    try {
      await callAdminFn('delete', { userId });
      toast.success(`Removed ${displayName}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg">Admin Users</h2>
        <Alert><AlertDescription>Supabase not configured.</AlertDescription></Alert>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Edge function not deployed yet */}
      {edgeFnError && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p className="font-medium text-sm">Edge function not deployed yet</p>
            <p className="text-xs text-muted-foreground">Run this once in your terminal to deploy:</p>
            <pre className="rounded bg-muted p-2 text-xs mt-1 whitespace-pre-wrap">npx supabase functions deploy manage-admin-users --project-ref fehovdysbkpverrkzsno</pre>
            <p className="text-xs text-muted-foreground mt-1">Error: {edgeFnError}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">Admin Users</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Create accounts for people who can manage this panel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={loading} className="h-8 w-8">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Create Admin Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="new-name">Full name</Label>
                  <Input
                    id="new-name"
                    placeholder="Jane Smith"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-email">Email address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Share this password directly — no email confirmation required.</p>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {creating ? "Creating…" : "Create Admin"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* List */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No admin users yet.</p>
          )}
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/20 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{u.display_name || u.email}</span>
                  {u.id === currentUser?.id && (
                    <Badge variant="secondary" className="text-[10px] py-0">you</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {u.email} · Joined {new Date(u.created_at).toLocaleDateString()}
                  {u.last_sign_in_at && <> · Last seen {new Date(u.last_sign_in_at).toLocaleDateString()}</>}
                </p>
              </div>

              {u.id !== currentUser?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove admin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes <strong>{u.display_name || u.email}</strong>'s account. They will no longer be able to log in.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(u.id, u.display_name || u.email)}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
