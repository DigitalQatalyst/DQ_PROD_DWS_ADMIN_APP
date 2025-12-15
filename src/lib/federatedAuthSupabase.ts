/**
 * Federated Authentication with Direct Supabase Integration
 *
 * Flow:
 * 1) Receive Azure ID token; extract oid + email
 * 2) Query Supabase (service role) for auth_users/auth_user_profiles
 * 3) Return app authorization context
 */

export interface UserAuthorizationContext {
  user_id: string;
  organization_id: string;
  organization_name?: string;
  role: string;
  user_segment: string;
  email: string;
  name?: string;
}

export function extractAzureOidFromToken(token: string): { oid: string; email: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT token format');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const oid = payload.oid || payload.sub;
    const email = payload.email || payload.preferred_username || payload.upn || '';
    if (!oid) throw new Error('Token missing required claim: oid');
    return { oid, email };
  } catch (e) {
    console.error('Failed to extract Azure OID from token:', e);
    throw new Error('Invalid Azure token');
  }
}

async function createAdminSupabaseClient() {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  let supabaseKey = (
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();

  console.log('ENV check (Supabase):', {
    url: supabaseUrl,
    service_role_present: !!supabaseKey,
    anon_present: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    service_role_preview: supabaseKey ? supabaseKey.slice(0, 8) + '…' : 'null'
  });

  if (!supabaseUrl || !supabaseKey) {
    throw {
      error: 'invalid_api_key',
      message: 'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY for the new project.'
    };
  }
  if (supabaseKey.length < 60) {
    throw {
      error: 'invalid_api_key',
      message: 'Supabase service role key looks invalid or truncated. Double-check your .env values.'
    };
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getUserAuthorizationFromSupabase(
  azureOid: string,
  email: string
): Promise<UserAuthorizationContext> {
  try {
    const supabase = await createAdminSupabaseClient();
    console.log('Looking up user by azure_oid:', azureOid);

    const { data: user, error: userError } = await supabase
      .from('auth_users')
      .select('id, email, name, azure_oid')
      .eq('azure_oid', azureOid)
      .single();

    console.log('User query result:', { user, userError });

    if (userError || !user) {
      const msg = (userError as any)?.message || '';
      if (msg.includes('Invalid API key') || (userError as any)?.code === '401') {
        throw {
          error: 'invalid_api_key',
          message: 'Invalid Supabase API key. Double-check VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY point to the new project.',
          email
        };
      }
      throw {
        error: 'user_not_provisioned',
        message: 'Your account has not been provisioned. Please contact your administrator to request access.',
        email
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('auth_user_profiles')
      .select('organization_id, role, user_segment')
      .eq('user_id', user.id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    if (!profile || !profile.organization_id || !profile.role || !profile.user_segment) {
      throw {
        error: 'incomplete_profile',
        message: 'Your user profile is incomplete. Please contact your administrator.'
      };
    }

    let organizationName: string | null = null;
    if (profile.organization_id) {
      const { data: org } = await supabase
        .from('auth_organizations')
        .select('name, display_name')
        .eq('id', profile.organization_id)
        .single();
      organizationName = (org?.display_name as string) || (org?.name as string) || null;
    }

    console.log('User authorization loaded:', {
      user_id: user.id,
      organization_id: profile.organization_id,
      organization_name: organizationName,
      role: profile.role,
      user_segment: profile.user_segment
    });

    return {
      user_id: user.id,
      organization_id: profile.organization_id,
      organization_name: organizationName || undefined,
      role: profile.role,
      user_segment: profile.user_segment,
      email: user.email || email,
      name: user.name
    };
  } catch (error) {
    console.error('Failed to get user authorization from Supabase:', error);
    throw error;
  }
}

export async function exchangeAzureTokenForAuthorization(azureToken: string): Promise<UserAuthorizationContext> {
  console.log('Processing Azure token for authorization...');
  const { oid, email } = extractAzureOidFromToken(azureToken);
  console.log('Azure identity extracted:', { oid, email });
  const authContext = await getUserAuthorizationFromSupabase(oid, email);
  console.log('Authorization context loaded:', authContext);
  return authContext;
}

