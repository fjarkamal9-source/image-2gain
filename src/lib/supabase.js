import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

console.log('Supabase configured:', isSupabaseConfigured);
console.log('URL:', import.meta.env.VITE_SUPABASE_URL?.slice(0, 20));

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true,
      },
    })
  : null;
