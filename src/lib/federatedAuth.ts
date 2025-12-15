/**
 * Federated Identity Authentication
 * 
 * Handles the federated identity pattern where:
 * 1. Azure EEI handles authentication (proof of identity)
 * 2. Local backend issues internal JWT with authorization context
 * 3. All RBAC logic uses local authorization context from database
 */

export interface FederatedLoginResponse {
  status: 'authenticated';
  user: {
    id: string;
    email: string;
    organization_id: string;
    role: string;
    customer_type: string;
  };
  token: string;
}

export interface LoginError {
  error: string;
  message: string;
  email?: string;
}

/**
 * Exchange Azure token for internal JWT
 * @param azureToken - The Azure JWT token from MSAL
 * @returns Internal JWT with authorization context
 */
export async function exchangeAzureTokenForInternalJWT(
  azureToken: string
): Promise<FederatedLoginResponse> {
  // Use apiConfig utility for consistent URL handling
  const { getApiUrl } = await import('./apiConfig');
  const API_BASE_URL = getApiUrl('/auth/login');
  
  console.log('🔄 Exchanging Azure token for internal JWT...');
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${azureToken}`
      },
      credentials: 'include' // Important for httpOnly cookies
    });

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    
    if (!responseText) {
      throw new Error(`Empty response from server: ${response.status} ${response.statusText}`);
    }
    
    console.log('📦 Server response:', responseText);
    
    const data = JSON.parse(responseText);

    if (!response.ok) {
      if (data.error === 'user_not_provisioned') {
        throw new Error('USER_NOT_PROVISIONED');
      }
      
      throw new Error(data.message || `Login failed: ${response.status}`);
    }

    // Store internal JWT token in localStorage as fallback
    if (data.token) {
      localStorage.setItem('internal_jwt_token', data.token);
    }

    console.log('✅ Internal JWT received:', {
      user_id: data.user.id,
      organization_id: data.user.organization_id,
      role: data.user.role,
      customer_type: data.user.customer_type
    });

    return data;

  } catch (error) {
    console.error('❌ Token exchange failed:', error);
    
    if (error instanceof Error && error.message === 'USER_NOT_PROVISIONED') {
      throw {
        error: 'user_not_provisioned',
        message: 'Your account has not been provisioned. Please contact your administrator or support to request access.',
        email: undefined
      } as LoginError;
    }
    
    throw {
      error: 'login_failed',
      message: error instanceof Error ? error.message : 'Failed to exchange token'
    } as LoginError;
  }
}

/**
 * Parse internal JWT to extract authorization context
 * @param token - Internal JWT token
 * @returns Parsed claims
 */
export function parseInternalJWT(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user_id: payload.sub,
      organization_id: payload.organization_id,
      role: payload.role,
      user_segment: payload.user_segment,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Failed to parse internal JWT:', error);
    return null;
  }
}

/**
 * Get stored internal JWT token
 */
export function getInternalJWT(): string | null {
  return localStorage.getItem('internal_jwt_token');
}

/**
 * Set internal JWT token
 */
export function setInternalJWT(token: string): void {
  localStorage.setItem('internal_jwt_token', token);
}

/**
 * Clear internal JWT token
 */
export function clearInternalJWT(): void {
  localStorage.removeItem('internal_jwt_token');
}

/**
 * Check if internal JWT is expired
 */
export function isInternalJWTExpired(token: string): boolean {
  try {
    const payload = parseInternalJWT(token);
    if (!payload || !payload.exp) return true;
    
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
