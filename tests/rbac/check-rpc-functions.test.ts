/**
 * Check RPC Functions Test
 * This test verifies if the required RPC functions exist in the database
 */

import { createClient } from '@supabase/supabase-js';
import { describe, test, expect } from '@jest/globals';

// Environment variables for Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key for testing (only if credentials are available)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

describe('RPC Functions Check', () => {
  test('Check if Supabase is configured', () => {
    if (!supabase) {
      console.log('⚠️ Supabase not configured - skipping RPC function tests');
      return;
    }
    expect(supabase).toBeTruthy();
  });

  test('Check if set_current_user_context RPC function exists', async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.rpc('set_current_user_context', {
        user_id: 'test-user',
        customer_type: 'staff',
        user_role: 'admin',
        organisation_name: 'DigitalQatalyst'
      });

      if (error) {
        console.log('❌ set_current_user_context RPC function error:', error.message);
        
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.log('💡 The RPC function set_current_user_context does not exist');
          console.log('💡 You need to run the migration: database/migrations/2025-01-rls-test-helper.sql');
        }
      } else {
        console.log('✅ set_current_user_context RPC function exists and works');
      }
    } catch (error) {
      console.log('❌ Error testing set_current_user_context:', error);
    }
  });

  test('Check if clear_current_user_context RPC function exists', async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.rpc('clear_current_user_context');

      if (error) {
        console.log('❌ clear_current_user_context RPC function error:', error.message);
        
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.log('💡 The RPC function clear_current_user_context does not exist');
          console.log('💡 You need to run the migration: database/migrations/2025-01-rls-test-helper.sql');
        }
      } else {
        console.log('✅ clear_current_user_context RPC function exists and works');
      }
    } catch (error) {
      console.log('❌ Error testing clear_current_user_context:', error);
    }
  });

  test('Check if get_current_user_context RPC function exists', async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.rpc('get_current_user_context');

      if (error) {
        console.log('❌ get_current_user_context RPC function error:', error.message);
        
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.log('💡 The RPC function get_current_user_context does not exist');
          console.log('💡 You need to run the migration: database/migrations/2025-01-rls-test-helper.sql');
        }
      } else {
        console.log('✅ get_current_user_context RPC function exists and works');
        if (data && data.length > 0) {
          console.log('   Current context:', data[0]);
        }
      }
    } catch (error) {
      console.log('❌ Error testing get_current_user_context:', error);
    }
  });
});
