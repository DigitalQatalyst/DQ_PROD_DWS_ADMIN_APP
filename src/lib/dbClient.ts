/**
 * Database Client Abstraction Layer
 * 
 * This module provides a unified interface for database operations
 * that works across different environments:
 * - Development: Supabase
 * - Staging/Production: Azure PostgreSQL (via API layer)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const ENV = import.meta.env.VITE_ENVIRONMENT || 'dev';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const fetchWithNoStore = (input: RequestInfo, init?: RequestInit) => {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'no-cache');
  }
  if (!headers.has('pragma')) {
    headers.set('pragma', 'no-cache');
  }
  return fetch(input, {
    ...init,
    headers,
    cache: 'no-store',
  });
};

interface DatabaseClient {
  from: (table: string) => QueryBuilder;
  query: (sql: string, params?: any[]) => Promise<any>;
}

interface QueryBuilder {
  select: (columns?: string) => QueryBuilder;
  insert: (data: any | any[]) => QueryBuilder;
  update: (data: any) => QueryBuilder;
  delete: () => QueryBuilder;
  eq: (column: string, value: any) => QueryBuilder;
  neq: (column: string, value: any) => QueryBuilder;
  gt: (column: string, value: any) => QueryBuilder;
  gte: (column: string, value: any) => QueryBuilder;
  lt: (column: string, value: any) => QueryBuilder;
  lte: (column: string, value: any) => QueryBuilder;
  like: (column: string, pattern: string) => QueryBuilder;
  ilike: (column: string, pattern: string) => QueryBuilder;
  in: (column: string, values: any[]) => QueryBuilder;
  contains: (column: string, value: any) => QueryBuilder;
  match: (query: Record<string, any>) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  range: (from: number, to: number) => QueryBuilder;
  single: () => Promise<{ data: any; error: any }>;
  then: (onFulfilled?: any, onRejected?: any) => Promise<{ data: any; error: any }>;
}

class SupabaseAdapter implements DatabaseClient {
  private client: SupabaseClient;
  private supabaseUrl: string;

  constructor(url: string, key: string) {
    this.supabaseUrl = url;
    this.client = createClient(url, key, {
      global: {
        fetch: fetchWithNoStore,
      },
    });
  }

  /**
   * Get current JWT token from auth context
   */
  private getCurrentJWT(): string | null {
    try {
      // Get Azure user info and claims from localStorage
      const userInfoStr = localStorage.getItem('azure_user_info');
      const customerType = localStorage.getItem('azure_customer_type') || 'staff';
      const userRole = localStorage.getItem('azure_user_role') || 'viewer';
      const organisationName = localStorage.getItem('azure_organisation_name');
      
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        
        // Create JWT payload with correct claims for RLS
        // The RLS policy expects 'organization_name' claim
        const jwtPayload = {
          sub: user.id || user.azure_id,
          email: user.email,
          role: 'authenticated',
          customerType: customerType,
          customer_type: customerType, // Alternative claim name
          userRole: userRole,
          user_role: userRole, // Alternative claim name
          organisationName: organisationName || user.organization_id || 'defaultorg',
          organization_name: organisationName || user.organization_id || 'defaultorg', // Critical for RLS!
          organisation_id: user.organization_id,
          organization_id: user.organization_id, // Alternative claim name
          iss: 'https://azure.b2clogin.com',
          aud: 'supabase-audience',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        // Unicode-safe base64 encoding helper
        // btoa() only supports Latin1, so we need to convert UTF-8 to bytes first
        const base64Encode = (str: string): string => {
          try {
            const utf8Bytes = new TextEncoder().encode(str);
            let binary = '';
            utf8Bytes.forEach(byte => {
              binary += String.fromCharCode(byte);
            });
            return btoa(binary);
          } catch (e) {
            // Fallback: use encodeURIComponent + unescape (works in all browsers)
            return btoa(unescape(encodeURIComponent(str)));
          }
        };
        
        // Encode as base64 JWT (simplified - real JWT would be signed)
        const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = base64Encode(JSON.stringify(jwtPayload));
        const signature = base64Encode('mock-signature-for-rls');
        
        const jwtToken = `${header}.${payload}.${signature}`;
        
        console.log('🔑 Created JWT token with claims:', {
          sub: jwtPayload.sub,
          customerType: jwtPayload.customerType,
          userRole: jwtPayload.userRole,
          organization_name: jwtPayload.organization_name,
          organisationName: jwtPayload.organisationName
        });
        
        return jwtToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current JWT:', error);
      return null;
    }
  }

  /**
   * Set the current session with JWT token for RLS
   */
  async setSession(): Promise<void> {
    try {
      // Debug: Log all localStorage keys to understand what's available
      const allKeys = Object.keys(localStorage);
      console.log('🔍 All localStorage keys:', allKeys);
      
      // Try multiple possible key names for Azure user info
      const userInfoStr = localStorage.getItem('azure_user_info') || 
                         localStorage.getItem('platform_admin_user') ||
                         localStorage.getItem('user_info');
      
      // Try multiple possible key names for organization name
      const organisationName = localStorage.getItem('azure_organisation_name') ||
                              localStorage.getItem('azure_organisationName') ||
                              localStorage.getItem('organization_name') ||
                              localStorage.getItem('user_organization_id') ||
                              localStorage.getItem('organisationName');
      
      // Try multiple possible key names for customer type
      const customerType = localStorage.getItem('azure_customer_type') || 
                          localStorage.getItem('customer_type') ||
                          localStorage.getItem('customerType') ||
                          localStorage.getItem('user_segment') ||
                          'staff';
      
      // Try multiple possible key names for user role
      const userRole = localStorage.getItem('azure_user_role') || 
                      localStorage.getItem('user_role') ||
                      localStorage.getItem('userRole') ||
                      'viewer';
      
      // Try to get user ID from multiple sources
      const userId = localStorage.getItem('user_id') ||
                    localStorage.getItem('azure_user_id') ||
                    localStorage.getItem('userId');
      
      console.log('🔍 Attempting to set session with:', {
        foundUserInfo: !!userInfoStr,
        foundOrgName: !!organisationName,
        organisationName,
        customerType,
        userRole,
        userId
      });
      
      if (userInfoStr && organisationName) {
        const user = JSON.parse(userInfoStr);
        
        // Use user ID from parsed object or from localStorage
        const finalUserId = user.id || user.user_id || user.azure_id || userId;
        
        // Create a JWT payload with the necessary claims for RLS
        const jwtPayload = {
          aud: this.supabaseUrl,
          role: 'authenticated',
          sub: finalUserId,
          email: user.email || user.Email,
          organization_name: organisationName, // Critical for RLS!
          customer_type: customerType,
          user_role: userRole,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          iat: Math.floor(Date.now() / 1000)
        };
        
        console.log('🔑 Creating Supabase JWT with RLS claims:', jwtPayload);
        
        // Unicode-safe base64url encoding helper
        // btoa() only supports Latin1, so we need to convert UTF-8 to bytes first
        const base64Encode = (str: string): string => {
          try {
            const utf8Bytes = new TextEncoder().encode(str);
            let binary = '';
            utf8Bytes.forEach(byte => {
              binary += String.fromCharCode(byte);
            });
            return btoa(binary);
          } catch (e) {
            // Fallback: use encodeURIComponent + unescape (works in all browsers)
            return btoa(unescape(encodeURIComponent(str)));
          }
        };
        
        // Encode the JWT using base64url (not base64)
        const base64urlEncode = (str: string) => {
          return base64Encode(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        };
        
        const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = base64urlEncode(JSON.stringify(jwtPayload));
        const signature = base64urlEncode('supabase-rls-session');
        const jwtToken = `${header}.${payload}.${signature}`;
        
        console.log('🔑 Generated JWT token, attempting to set session...');
        
        // TEMPORARY: Skip JWT session setting to avoid infinite loop
        // TODO: Implement proper JWT authentication for Supabase RLS
        console.log('⚠️ Skipping JWT session setting to prevent infinite loop');
        console.log('🔑 Would have created JWT with claims:', {
          sub: finalUserId,
          organization_name: organisationName,
          customer_type: customerType,
          user_role: userRole
        });
        
        logger.debug('Setting up Supabase RLS with Azure claims');
        logger.debug('Organization:', organisationName);
        logger.debug('Customer Type:', customerType);
        logger.debug('User Role:', userRole);
      } else {
        console.error('❌ Cannot set Supabase session - missing data:', {
          userInfoStr: !!userInfoStr,
          organisationName: !!organisationName,
          allLocalStorageKeys: allKeys
        });
        logger.warn('No Azure user info or organisation name available for Supabase RLS');
      }
    } catch (error) {
      logger.error('Error setting Supabase session:', error);
    }
  }

  /**
   * Debug function to log current auth state and fetched records
   */
  logAuthDebugInfo(tableName: string, recordCount: number, filters?: any) {
    console.log('🔍 Auth Debug Info:', {
      tableName,
      recordCount,
      authMode: USE_MOCK_AUTH ? 'mock' : 'azure',
      environment: ENV,
      user: localStorage.getItem('platform_admin_user') ? JSON.parse(localStorage.getItem('platform_admin_user')!) : null,
      customerType: localStorage.getItem('azure_customer_type'),
      userRole: localStorage.getItem('azure_user_role'),
      organisationName: localStorage.getItem('azure_organisation_name'),
      filters
    });
  }

  from(table: string): QueryBuilder {
    return this.client.from(table) as unknown as QueryBuilder;
  }

  /**
   * Get the underlying Supabase client for direct access
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  async query(_sql: string, _params?: any[]) {
    // Supabase doesn't support raw SQL directly from client
    // This would need to be routed through a backend API
    throw new Error('Raw SQL queries not supported in Supabase client mode');
  }
}

class AzureAdapter implements DatabaseClient {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  from(table: string): QueryBuilder {
    return new AzureQueryBuilder(table, this.apiBaseUrl);
  }

  async query(sql: string, params?: any[]) {
    const response = await fetch(`${this.apiBaseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  }
}

class AzureQueryBuilder implements QueryBuilder {
  private table: string;
  private apiBaseUrl: string;
  private queryParams: {
    columns?: string;
    filters?: Array<{ column: string; operator: string; value: any }>;
    orderBy?: { column: string; ascending: boolean };
    limitCount?: number;
    rangeFrom?: number;
    rangeTo?: number;
  } = {};
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private operationData?: any;

  constructor(table: string, apiBaseUrl: string) {
    this.table = table;
    this.apiBaseUrl = apiBaseUrl;
  }

  select(columns?: string): QueryBuilder {
    this.operation = 'select';
    this.queryParams.columns = columns || '*';
    return this;
  }

  insert(data: any | any[]): QueryBuilder {
    this.operation = 'insert';
    this.operationData = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.operation = 'update';
    this.operationData = data;
    return this;
  }

  delete(): QueryBuilder {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: any[]): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  contains(column: string, value: any): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    this.queryParams.filters.push({ column, operator: 'contains', value });
    return this;
  }

  match(query: Record<string, any>): QueryBuilder {
    if (!this.queryParams.filters) this.queryParams.filters = [];
    Object.entries(query).forEach(([column, value]) => {
      this.queryParams.filters!.push({ column, operator: 'eq', value });
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder {
    this.queryParams.orderBy = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.queryParams.limitCount = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder {
    this.queryParams.rangeFrom = from;
    this.queryParams.rangeTo = to;
    return this;
  }

  async single(): Promise<{ data: any; error: any }> {
    this.queryParams.limitCount = 1;
    const result = await this.execute();
    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  }

  then(onFulfilled?: any, onRejected?: any): Promise<{ data: any; error: any }> {
    return this.execute().then(onFulfilled, onRejected);
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${this.table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: this.operation,
          data: this.operationData,
          params: this.queryParams,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: new Error(errorText) };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Mock client for when database is not configured
class MockDatabaseClient implements DatabaseClient {
  from(table: string): QueryBuilder {
    console.warn(`Database not configured. Mock data will be used for table: ${table}`);
    return new MockQueryBuilder();
  }

  async query(_sql: string, _params?: any[]) {
    console.warn('Database not configured. Mock data will be used.');
    return { data: [], error: new Error('Database not configured') };
  }
}

class MockQueryBuilder implements QueryBuilder {
  select(_columns?: string): QueryBuilder { return this; }
  insert(_data: any | any[]): QueryBuilder { return this; }
  update(_data: any): QueryBuilder { return this; }
  delete(): QueryBuilder { return this; }
  eq(_column: string, _value: any): QueryBuilder { return this; }
  neq(_column: string, _value: any): QueryBuilder { return this; }
  gt(_column: string, _value: any): QueryBuilder { return this; }
  gte(_column: string, _value: any): QueryBuilder { return this; }
  lt(_column: string, _value: any): QueryBuilder { return this; }
  lte(_column: string, _value: any): QueryBuilder { return this; }
  like(_column: string, _pattern: string): QueryBuilder { return this; }
  ilike(_column: string, _pattern: string): QueryBuilder { return this; }
  in(_column: string, _values: any[]): QueryBuilder { return this; }
  contains(_column: string, _value: any): QueryBuilder { return this; }
  match(_query: Record<string, any>): QueryBuilder { return this; }
  order(_column: string, _options?: { ascending?: boolean }): QueryBuilder { return this; }
  limit(_count: number): QueryBuilder { return this; }
  range(_from: number, _to: number): QueryBuilder { return this; }
  async single(): Promise<{ data: any; error: any }> {
    return { data: null, error: new Error('Database not configured') };
  }
  async then(_onFulfilled?: any, _onRejected?: any): Promise<{ data: any; error: any }> {
    return { data: [], error: new Error('Database not configured') };
  }
}

// Initialize the appropriate database client based on environment
// Always prefer Supabase if credentials are available, regardless of environment
function initializeDbClient(): DatabaseClient {
  console.log('🔧 Initializing database client:', {
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
    ENV: ENV
  });
  
  // Always try Supabase first if credentials are available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && 
      !supabaseUrl.includes('your-project') && 
      !supabaseUrl.includes('your-actual')) {
    console.log('✅ Using SupabaseAdapter');
    return new SupabaseAdapter(supabaseUrl, supabaseKey);
  } else {
    // For production, use env var directly (same normalization as apiConfig)
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    let apiBaseUrl = envUrl || '/api';
    
    if (envUrl) {
      if (!/^https?:\/\//i.test(apiBaseUrl) && !apiBaseUrl.startsWith('/')) {
        apiBaseUrl = '/' + apiBaseUrl;
      }
      if (/^https?:\/\//i.test(apiBaseUrl) && !/\/api\/?$/i.test(apiBaseUrl)) {
        apiBaseUrl = apiBaseUrl.replace(/\/$/, '') + '/api';
      }
      if (!/^https?:\/\//i.test(apiBaseUrl) && !apiBaseUrl.startsWith('/api')) {
        apiBaseUrl = '/api';
      }
    }

    if (!apiBaseUrl || apiBaseUrl === '/api') {
      console.warn('API base URL not configured. Attempting to use default /api path.');
    }

    return new AzureAdapter(apiBaseUrl);
  }

  // Final fallback: mock data mode
  console.warn('⚠️ No database credentials configured. Using mock data mode.');
  console.warn('To connect to Supabase:');
  console.warn('1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables');
  console.warn('2. Restart the application');
  return new MockDatabaseClient();
}

// Export the database client
const dbClient: DatabaseClient = initializeDbClient();

/**
 * Set Supabase session with current JWT token for RLS
 */
export async function setSupabaseSession(): Promise<void> {
  if (dbClient instanceof SupabaseAdapter) {
    await dbClient.setSession();
  }
}

/**
 * Get Supabase client for direct access
 * 
 * This function will return a Supabase client even if the main dbClient
 * is using AzureAdapter, since Supabase is still needed for federated auth.
 * Falls back to creating a client directly if dbClient is not SupabaseAdapter.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (dbClient instanceof SupabaseAdapter) {
    return dbClient.getClient();
  }
  
  // Even if using AzureAdapter, we may still need Supabase for auth
  // Try to create a client if Supabase credentials are available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey && 
      !supabaseUrl.includes('your-project') && 
      !supabaseUrl.includes('your-actual')) {
    try {
      return createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          fetch: fetchWithNoStore,
        },
      });
    } catch (error) {
      console.error('Failed to create fallback Supabase client:', error);
      return null;
    }
  }
  
  console.warn('⚠️ Supabase client not available. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
  return null;
}

/**
 * Debug function to log auth info
 */
export function logAuthDebugInfo(tableName: string, recordCount: number, filters?: any) {
  if (dbClient instanceof SupabaseAdapter) {
    dbClient.logAuthDebugInfo(tableName, recordCount, filters);
  }
}

export default dbClient;
export { ENV };
export type { DatabaseClient, QueryBuilder };

