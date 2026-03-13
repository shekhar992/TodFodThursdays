import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/** True only when real credentials are present in .env.local */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && !supabaseUrl?.includes('xxxxxxxxxxxx');

if (!isSupabaseConfigured) {
  console.info(
    '[Supabase] Running in mock-data mode. Copy .env.example → .env.local and fill in your credentials to go live.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);
