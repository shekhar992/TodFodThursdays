// @ts-nocheck
// Edge Function: manage-admin-users
// Uses raw fetch against Supabase REST + Auth Admin API.
// No supabase-js dependency = no version compatibility issues.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return json('ok', 200);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing auth token' }, 401);
  }
  const jwt = authHeader.slice(7);

  // ── 1. Verify caller is a logged-in admin ──────────────────────────────
  // Get the user from the JWT
  const meRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'apikey': serviceKey,
    },
  });
  if (!meRes.ok) return json({ error: 'Invalid token' }, 401);
  const me = await meRes.json();
  const callerId: string = me.id;

  // Check their profile role
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${callerId}&select=role`,
    {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
    }
  );
  const profiles = await profileRes.json();
  if (!Array.isArray(profiles) || profiles[0]?.role !== 'admin') {
    return json({ error: 'Forbidden' }, 403);
  }

  // ── 2. Dispatch ─────────────────────────────────────────────────────────
  let body: any = {};
  try { body = await req.json(); } catch { /* no body */ }
  const { action } = body;

  // LIST admins
  if (action === 'list') {
    const [adminProfilesRes, authUsersRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.admin&select=id,display_name`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
      }),
      fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
      }),
    ]);

    const adminProfiles: any[] = await adminProfilesRes.json();
    const authData = await authUsersRes.json();
    const authUsers: any[] = authData.users ?? [];

    const adminIds = new Set(adminProfiles.map((p: any) => p.id));
    const users = authUsers
      .filter((u: any) => adminIds.has(u.id))
      .map((u: any) => ({
        id: u.id,
        email: u.email ?? '',
        display_name: adminProfiles.find((p: any) => p.id === u.id)?.display_name ?? '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }));

    return json({ users });
  }

  // CREATE admin
  if (action === 'create') {
    const { email, password, display_name } = body;
    if (!email || !password || !display_name) {
      return json({ error: 'email, password, and display_name are required' }, 400);
    }

    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { display_name, role: 'admin' },
        email_confirm: true,
      }),
    });

    const created = await createRes.json();
    if (!createRes.ok) return json({ error: created.message ?? 'Create failed' }, 400);

    // Ensure profile has role='admin'
    await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${created.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin', display_name }),
      }
    );

    return json({ user: { id: created.id, email, display_name } });
  }

  // DELETE admin
  if (action === 'delete') {
    const { userId } = body;
    if (!userId) return json({ error: 'userId required' }, 400);
    if (userId === callerId) return json({ error: 'Cannot delete your own account' }, 400);

    const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
    });

    if (!delRes.ok) {
      const e = await delRes.json().catch(() => ({}));
      return json({ error: e.message ?? 'Delete failed' }, 400);
    }
    return json({ success: true });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

