import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please check your .env file.');
}

// Standard client for public/authenticated operations
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * WARNING: The Admin Client uses the Service Role Key.
 * In a production environment, this should NEVER be used in the frontend 
 * as it bypasses all Row Level Security and exposes administrative power.
 * 
 * For this Admin Portal, we use it to manage users directly.
 */
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl || '', supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : supabase;

export const auth = supabase.auth;
