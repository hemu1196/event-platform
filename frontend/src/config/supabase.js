import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Vite Env Warning: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured on Vercel!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
