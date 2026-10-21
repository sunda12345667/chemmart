import { createClient } from '@supabase/supabase-js';

const REQUIRED_SUPABASE_URL = 'https://cxgxwfsssrbuvwfrrsne.supabase.co';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl !== REQUIRED_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL must point to the configured AMTECH Supabase project.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required to connect to Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
