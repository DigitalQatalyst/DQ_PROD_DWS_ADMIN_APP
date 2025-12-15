/**
 * API Configuration Utility
 * 
 * Handles API base URL resolution for both local development and production.
 * 
 * Local Development:
 * - Uses Vite proxy: '/api' -> 'http://localhost:3001'
 * - No VITE_API_BASE_URL needed (uses relative paths)
 * 
 * Production (Vercel):
 * - Requires VITE_API_BASE_URL to be set to your Vercel API URL
 * - Example: https://your-api.vercel.app/api
 */

/**
 * Get the API base URL for the current environment
 * @returns The API base URL (with /api suffix if needed)
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isProduction = import.meta.env.PROD;
  
  // In production, VITE_API_BASE_URL must be set
  if (isProduction && (!envUrl || envUrl.trim() === '')) {
    console.error('❌ VITE_API_BASE_URL is not set in production!');
    console.error('Please set VITE_API_BASE_URL in Vercel environment variables.');
    console.error('Example: https://your-api.vercel.app');
    // Fallback to relative path (will likely fail, but better than crashing)
    return '/api';
  }

  // During local development prefer the Vite proxy (relative `/api`) to avoid
  // cross-origin requests and to ensure the frontend talks to the dev API
  // server via the same origin. This prevents mismatches between serverless
  // functions (root `/api/*.ts`) and the express backend on port 3001.
  if (!isProduction && import.meta.env.DEV) {
    return '/api';
  }
  
  // If no environment variable is set, use relative path (works with Vite proxy in dev)
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }
  
  let baseUrl = envUrl.trim();
  
  // Ensure it starts with http/https or /
  if (!/^https?:\/\//i.test(baseUrl) && !baseUrl.startsWith('/')) {
    baseUrl = '/' + baseUrl;
  }
  
  // If absolute URL and doesn't end with /api, append it
  if (/^https?:\/\//i.test(baseUrl) && !/\/api\/?$/i.test(baseUrl)) {
    baseUrl = baseUrl.replace(/\/$/, '') + '/api';
  }
  
  // If relative path and doesn't start with /api, ensure it does
  if (!/^https?:\/\//i.test(baseUrl) && !baseUrl.startsWith('/api')) {
    baseUrl = '/api';
  }
  
  return baseUrl.replace(/\/$/, '');
}

/**
 * Get the full API URL for an endpoint
 * @param endpoint - The API endpoint (e.g., '/auth/login')
 * @returns The full URL to the endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isProduction = import.meta.env.PROD;
  
  // If baseUrl is absolute, use it directly (production)
  if (/^https?:\/\//i.test(baseUrl)) {
    const fullUrl = `${baseUrl}${cleanEndpoint}`;
    if (isProduction) {
      console.log('🌐 API URL (production):', fullUrl);
    }
    return fullUrl;
  }
  
  // If baseUrl is relative, resolve against current origin (development)
  if (typeof window !== 'undefined') {
    const fullUrl = `${window.location.origin}${baseUrl}${cleanEndpoint}`;
    if (!isProduction) {
      console.log('🔧 API URL (local dev):', fullUrl);
    }
    return fullUrl;
  }
  
  // Fallback for SSR
  return `${baseUrl}${cleanEndpoint}`;
}

