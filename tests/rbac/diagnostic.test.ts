/**
 * Diagnostic Test - Check Database Tables and Data
 * 
 * This test helps diagnose issues with seed data and table names
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

describe('Database Diagnostic Tests', () => {
  test('Check if Supabase is configured', () => {
    if (!supabase) {
      console.log('⚠️ Supabase not configured - skipping diagnostic tests');
      console.log('💡 To run these tests, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
    expect(supabase).toBeTruthy();
  });

  test('Check organisations table', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('organisations')
      .select('*');

    if (error) {
      console.log('❌ Error querying organisations:', error.message);
    } else {
      console.log(`✅ Organisations: ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(org => ({ name: org.name, id: org.id })));
      }
    }
  });

  test('Check users table', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.log('❌ Error querying users:', error.message);
    } else {
      console.log(`✅ Users: ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(user => ({ email: user.email, role: user.role })));
      }
    }
  });

  test('Check contents table (cnt_contents)', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('cnt_contents')
      .select('*');

    if (error) {
      console.log('❌ Error querying cnt_contents:', error.message);
    } else {
      console.log(`✅ Contents (cnt_contents): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(content => ({ title: content.title, status: content.status })));
      }
    }
  });

  test('Check services table (mktplc_services)', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('mktplc_services')
      .select('*');

    if (error) {
      console.log('❌ Error querying mktplc_services:', error.message);
    } else {
      console.log(`✅ Services (mktplc_services): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(service => ({ name: service.name, status: service.status })));
      }
    }
  });

  test('Check business directory table (eco_business_directory)', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('eco_business_directory')
      .select('*');

    if (error) {
      console.log('❌ Error querying eco_business_directory:', error.message);
    } else {
      console.log(`✅ Business Directory (eco_business_directory): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(business => ({ name: business.name, industry: business.industry })));
      }
    }
  });

  test('Check growth areas table (eco_growth_areas)', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('eco_growth_areas')
      .select('*');

    if (error) {
      console.log('❌ Error querying eco_growth_areas:', error.message);
    } else {
      console.log(`✅ Growth Areas (eco_growth_areas): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(area => ({ name: area.name, growth_type: area.growth_type })));
      }
    }
  });

  test('Check zones table (eco_zones)', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('eco_zones')
      .select('*');

    if (error) {
      console.log('❌ Error querying eco_zones:', error.message);
    } else {
      console.log(`✅ Zones (eco_zones): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(zone => ({ name: zone.name, zone_type: zone.zone_type })));
      }
    }
  });

  test('Check user_profiles table', async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      console.log('❌ Error querying user_profiles:', error.message);
    } else {
      console.log(`✅ User Profiles (user_profiles): ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log('   Sample records:', data.slice(0, 3).map(profile => ({ 
          customer_type: profile.customer_type, 
          user_role: profile.user_role,
          organisation_name: profile.organisation_name 
        })));
      }
    }
  });
});
