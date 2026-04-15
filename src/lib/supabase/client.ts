import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your .env file.');
}

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// Create a single supabase client for interacting with your database
export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createSupabaseClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );
  return supabaseInstance;
};
