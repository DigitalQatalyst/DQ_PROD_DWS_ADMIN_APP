import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { AccountInfo } from '@azure/msal-browser';
import { userScopes } from '../config/msalConfig';
import { useAuth } from '../context/AuthContext';
import { DevLogin } from './DevLogin';
import { AzureLogin } from './AzureLogin';
import { normalizeClaims, getOrganizationSourceKey } from '../auth/claimNormalizer';
import { exchangeAzureTokenForAuthorization } from '../lib/federatedAuthSupabase';
import { AccessDeniedError } from './AccessDeniedError';

interface AzureAuthWrapperProps {
  children: React.ReactNode;
}

export const AzureAuthWrapper: React.FC<AzureAuthWrapperProps> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const { login, isAuthenticated } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<any>(null); // Store error state
  
  // Auth mode configuration
  const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'local';
  
  // AUTHENTICATION TEMPORARILY DISABLED - Account access issues
  // TODO: Re-enable authentication when account access is resolved
  
  // In mock mode, skip MSAL initialization entirely but still render DevLogin later
  // IMPORTANT: MSAL instance is already initialized when created in msalConfig.ts
  // We only need to handle the redirect response and check existing accounts
  useEffect(() => {
    // Skip all authentication initialization
    setIsInitialized(true);
    
    // const initializeAuth = async () => {
    //   try {
    //     if (USE_MOCK_AUTH) {
    //       // Immediately mark initialized in mock mode
    //       setIsInitialized(true);
    //       return;
    //     }

    //     // MSAL instance auto-initializes when used with MsalProvider
    //     // Handle redirect response first (this is called automatically by MSAL on page load)
    //     // Then check if user is already logged in
    //     try {
    //       // handleRedirectPromise must be called on every page load
    //       const redirectResponse = await instance.handleRedirectPromise();
    //       if (redirectResponse && redirectResponse.account) {
    //         console.log('✅ Redirect response received, logging in user...');
    //         await handleUserLogin(redirectResponse.account);
    //         setIsInitialized(true);
    //         return;
    //       }
    //     } catch (redirectError: any) {
    //       console.error('❌ Redirect handling error:', redirectError);
          
    //       // Check if it's a redirect URI mismatch error (400 Bad Request)
    //       const errorMessage = redirectError?.message || redirectError?.errorCode || '';
    //       const isRedirectUriError = 
    //         redirectError?.errorCode === 'redirect_uri_mismatch' ||
    //         errorMessage.includes('redirect_uri') ||
    //         errorMessage.includes('AADSTS50011') ||
    //         errorMessage.includes('redirect URI') ||
    //         redirectError?.status === 400;
          
    //       if (isRedirectUriError) {
    //         const currentRedirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI_CUSTOM || window.location.origin;
    //         console.error('❌ Redirect URI mismatch error detected!');
    //         console.error('❌ Current redirect URI:', currentRedirectUri);
    //         console.error('❌ Error details:', redirectError);
    //         console.error('❌ ACTION REQUIRED: Make sure the redirect URI is EXACTLY registered in Azure AD app registration.');
    //         console.error('❌ The redirect URI must match exactly, including protocol (http/https) and path.');
            
    //         setAuthError({
    //           type: 'redirect_uri_mismatch',
    //           message: `Redirect URI mismatch. Current URI: ${currentRedirectUri}. Please ensure this URI is exactly registered in your Azure AD app registration.`,
    //           email: undefined
    //         });
    //         setIsInitialized(true);
    //         return;
    //       }
    //     }

    //     // Check if user is already logged in (after redirect handling)
    //     if (accounts.length > 0) {
    //       const account = accounts[0];
    //       await handleUserLogin(account);
    //     }

    //     setIsInitialized(true);
    //   } catch (error) {
    //     console.error('MSAL initialization error:', error);

    //     // Check if Azure credentials are properly configured
    //     const hasAzureConfig = import.meta.env.VITE_AZURE_CLIENT_ID &&
    //       import.meta.env.VITE_B2C_TENANT_NAME &&
    //       !import.meta.env.VITE_AZURE_CLIENT_ID.includes('your-client-id');

    //     // If Azure auth fails, provide a fallback user for development
    //     if (!hasAzureConfig) {
    //       console.warn('Azure authentication not configured, using fallback user for development');
    //       const fallbackUser = {
    //         id: 'dev-user-1',
    //         email: 'dev@example.com',
    //         name: 'Development User',
    //         role: 'admin',
    //         organization_id: 'dev-org',
    //         avatar_url: '',
    //         is_active: true,
    //         last_login_at: new Date().toISOString(),
    //         metadata: {},
    //         created_by: '',
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //         phone: '',
    //         givenName: 'Development',
    //         familyName: 'User',
    //         picture: '',
    //       };

    //       await login(fallbackUser);
    //     }

    //     setIsInitialized(true);
    //   }
    // };

    // // Add a small delay to prevent infinite loops
    // const timer = setTimeout(initializeAuth, 100);
    // return () => clearTimeout(timer);
  }, []);

  const handleUserLogin = async (account: AccountInfo) => {
    // Clear any previous error state when attempting new login
    setAuthError(null);
    
    try {
      // Get user profile information and ID token
      const response = await instance.acquireTokenSilent({
        scopes: userScopes,
        account: account,
      });

      const idToken = response.idToken;
      
      console.log('🔐 Got Azure ID token, getting authorization from Supabase...');

      // Exchange Azure token for authorization context (direct Supabase query)
      const authContext = await exchangeAzureTokenForAuthorization(idToken);

      console.log('✅ Received authorization context:', authContext);

      // Build user info from authorization context
      const userInfo = {
        id: authContext.user_id,
        email: authContext.email,
        name: account.name || authContext.name || authContext.email.split('@')[0],
        role: authContext.role,
        organization_id: authContext.organization_id,
        avatar_url: '',
        is_active: true,
        last_login_at: new Date().toISOString(),
        metadata: {
          user_segment: authContext.user_segment,
          role: authContext.role
        },
        created_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: '',
        givenName: account.name?.split(' ')[0] || '',
        familyName: account.name?.split(' ').slice(1).join(' ') || '',
        picture: '',
      };

      // Store authorization context
      localStorage.setItem('user_organization_id', authContext.organization_id);
      localStorage.setItem('user_role', authContext.role);
      localStorage.setItem('user_segment', authContext.user_segment);
      localStorage.setItem('user_id', authContext.user_id);
      if (authContext.organization_name) {
        localStorage.setItem('azure_organisation_name', authContext.organization_name);
      }
      
      console.log('💾 Stored authorization context:', {
        'organization_id': authContext.organization_id,
        'role': authContext.role,
        'user_segment': authContext.user_segment,
        'user_id': authContext.user_id
      });

      // Update the auth context with authorization context
      await login(userInfo, authContext.user_segment, authContext.role, authContext.organization_id);
      
      console.log('🎉 Federated identity login successful:', { 
        user_id: userInfo.id,
        organization_id: userInfo.organization_id,
        role: userInfo.role,
        user_segment: authContext.user_segment
      });
      
      // Redirect to dashboard after successful login
      if (window.location.pathname === '/login') {
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('❌ Federated identity login failed:', error);
      
      // Store error state for error page display
      setAuthError({
        type: error?.error || 'generic',
        message: error?.message || 'Login failed. Please try again or contact support.',
        email: account.username
      });
    }
  };

  // Extract role from Azure External Identities claims using customerType and userRole
  const extractRoleFromClaims = (claims: any): string => {
    // Allowed customer types that can access the platform
    const ALLOWED_CUSTOMER_TYPES = ['staff', 'admin', 'internal', 'partner'];
    
    // Get customerType and userRole from claims (check multiple key variations)
    const customerType = claims?.extension_customerType || claims?.customerType || claims?.CustomerType;
    const userRole = claims?.extension_userRole || claims?.UserRole || claims?.userRole || claims["User Role"];
    
    console.log('🔍 Role extraction - Claims received:', { customerType, userRole });
    console.log('🔍 Role extraction - All available claims:', claims);
    
    // First validation: Check if customerType is allowed
    if (!customerType || !ALLOWED_CUSTOMER_TYPES.includes(customerType.toLowerCase())) {
      console.warn(`❌ Access denied: Invalid customerType "${customerType}". Must be one of: ${ALLOWED_CUSTOMER_TYPES.join(', ')}`);
      return 'unauthorized'; // This will prevent access via RBAC
    }
    
    console.log(`✅ Valid customerType: "${customerType}"`);
    
    // Second step: Map userRole to application permissions
    if (userRole) {
      const roleLower = userRole.toLowerCase();
      
      // Direct role mapping with normalization
      // Note: creator and contributor are normalized to 'editor'
      const roleMap: Record<string, string> = {
        'admin': 'admin',
        'administrator': 'admin',
        'approver': 'approver',
        'manager': 'approver',
        'creator': 'editor',      // Normalize to editor
        'contributor': 'editor',  // Normalize to editor
        'editor': 'editor',
        'member': 'editor',
        'viewer': 'viewer',
        'reader': 'viewer',
      };
      
      const mappedRole = roleMap[roleLower];
      if (mappedRole) {
        console.log(`✅ Role mapped: ${userRole} -> ${mappedRole}`);
        return mappedRole;
      }
    }
    
    // Fallback: If customerType is valid but userRole is missing/unknown
    console.warn(`⚠️ Valid customerType "${customerType}" but unknown userRole "${userRole}". Defaulting to viewer.`);
    return 'viewer';
  };

  // Extract organization from Azure External Identities claims
  const extractOrganizationFromClaims = (claims: any): string => {
    if (claims?.extension_OrganizationId) {
      return claims.extension_OrganizationId;
    }
    
    return 'default-org';
  };

  // Extract avatar URL from Azure External Identities claims
  const extractAvatarFromClaims = (claims: any): string => {
    if (claims?.picture) {
      return claims.picture;
    }
    
    return '';
  };

  // AUTHENTICATION TEMPORARILY DISABLED - Account access issues
  // TODO: Re-enable authentication when account access is resolved
  
  // Show loading state while initializing
  // Show error page if authentication failed
  // if (authError) {
  //   return (
  //     <AccessDeniedError
  //       error={authError.type}
  //       message={authError.message}
  //       email={authError.email}
  //       onRetry={() => {
  //         // Clear error and re-attempt login
  //         setAuthError(null);
  //         if (accounts.length > 0) {
  //           handleUserLogin(accounts[0]);
  //         }
  //       }}
  //     />
  //   );
  // }

  // if (!isInitialized || inProgress === 'login') {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Initializing authentication...</p>
  //         {USE_MOCK_AUTH && (
  //           <p className="mt-2 text-sm text-yellow-600">🧪 Mock RBAC mode active</p>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  // // In mock mode, show DevLogin component instead of children
  // if (USE_MOCK_AUTH) {
  //   return (
  //     <>
  //       <DevLogin />
  //       {children}
  //     </>
  //   );
  // }

  // // In live Azure mode, check if user is authenticated (already got isAuthenticated from useAuth above)
  
  // // If not authenticated in live mode, show Azure login
  // if (!isAuthenticated) {
  //   return <AzureLogin />;
  // }

  return <>{children}</>;
};
