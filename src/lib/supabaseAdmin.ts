import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

/**
 * True only when the service role key is present.
 * This key is required for user management (invite / list / delete users).
 * ⚠️  Keep VITE_SUPABASE_SERVICE_ROLE_KEY out of public deployments.
 *      It bypasses Row Level Security — only use in internal admin builds.
 */
export const isAdminClientConfigured =
  Boolean(supabaseUrl) &&
  Boolean(serviceRoleKey) &&
  !serviceRoleKey?.startsWith('xxxxxxxxxxxx');

/**
 * Admin Supabase client (service role).
 * persistSession and autoRefreshToken are disabled so this client never
 * interferes with the regular user session stored in localStorage.
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  serviceRoleKey ?? 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
