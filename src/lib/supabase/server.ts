import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server client using service role key for API routes and cron jobs
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createSupabaseClient(url, key);
};
