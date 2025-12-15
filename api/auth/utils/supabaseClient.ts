/**
 * Supabase Service Role Client
 * 
 * Provides a Supabase client with service role permissions for administrative operations
 * like creating users, organizations, and user profiles.
 */

import { createClient } from '@supabase/supabase-js';

// Use mock URLs for testing
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
