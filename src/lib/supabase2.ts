import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_2;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY_2;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL 2 or Anon Key 2 is missing in environment variables');
}

export const supabase2 = createClient(
    supabaseUrl || '',
    supabaseKey || ''
);
