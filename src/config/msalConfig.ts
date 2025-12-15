import {
  PublicClientApplication,
  Configuration,
  BrowserCacheLocation,
  LogLevel,
} from "@azure/msal-browser";

// Support both NEXT_PUBLIC_* and VITE_* envs
const env = (import.meta as any).env as Record<string, string | undefined>;

const CLIENT_ID =
  env.NEXT_PUBLIC_AAD_CLIENT_ID ||
  env.VITE_AZURE_CLIENT_ID;

// Redirect URI configuration - Primary redirect URI for this branch
// Main: VITE_AZURE_REDIRECT_URI_CUSTOM (primary), Fallback: window.location.origin
// Note: Old variables (VITE_AZURE_REDIRECT_URI, NEXT_PUBLIC_REDIRECT_URI) are not used in this branch
const REDIRECT_URI =
  env.VITE_AZURE_REDIRECT_URI_CUSTOM ||  // Primary redirect URI for this branch
  (typeof window !== 'undefined' ? window.location.origin : '');  // Fallback only if custom URI is not set

const POST_LOGOUT_REDIRECT_URI =
  env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI ||
  env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI ||
  REDIRECT_URI;
const API_SCOPES = (env.NEXT_PUBLIC_API_SCOPES || env.VITE_AZURE_SCOPES || "")
  .split(/[\s,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

// Always request standard OIDC scopes; include email to avoid UPN-only claims and offline_access for refresh tokens
const DEFAULT_OIDC_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
] as const;

// Vite exposes only VITE_* via import.meta.env (not process.env)
const TENANT_NAME =
  env.NEXT_PUBLIC_B2C_TENANT_NAME || env.VITE_B2C_TENANT_NAME;
const POLICY_SIGNUP_SIGNIN =
  env.NEXT_PUBLIC_B2C_POLICY_SIGNUP_SIGNIN ||
  env.VITE_B2C_POLICY_SIGNUP_SIGNIN;
// Optional dedicated Sign-Up policy/user flow
const POLICY_SIGNUP =
  env.NEXT_PUBLIC_B2C_POLICY_SIGNUP || env.VITE_B2C_POLICY_SIGNUP;

const SUB = env.NEXT_PUBLIC_CIAM_SUBDOMAIN || env.VITE_AZURE_SUBDOMAIN;

const LOGIN_HOST =
  env.NEXT_PUBLIC_IDENTITY_HOST ||
  env.VITE_IDENTITY_HOST;
const AUTHORITY_SIGNUP_SIGNIN = LOGIN_HOST && TENANT_NAME
  ? `https://${LOGIN_HOST}/${TENANT_NAME}.onmicrosoft.com/`
  : "";
const AUTHORITY_SIGNUP = POLICY_SIGNUP && LOGIN_HOST && TENANT_NAME
  ? `https://${LOGIN_HOST}/${TENANT_NAME}.onmicrosoft.com/${POLICY_SIGNUP}`
  : AUTHORITY_SIGNUP_SIGNIN;

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID || "",
    authority: AUTHORITY_SIGNUP_SIGNIN || "",
    knownAuthorities: LOGIN_HOST ? [LOGIN_HOST] : [],
    redirectUri: REDIRECT_URI || "",
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI || "",
    // Stay on the redirectUri after login instead of bouncing back
    // to the page where login was initiated.
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level >= LogLevel.Error) console.error(message);
      },
    },
  },
};

// Validate redirect URI configuration before creating MSAL instance
if (typeof window !== 'undefined') {
  const redirectUriSource = env.VITE_AZURE_REDIRECT_URI_CUSTOM 
    ? 'VITE_AZURE_REDIRECT_URI_CUSTOM' 
    : 'window.location.origin (fallback)';
  
  console.log('🔐 MSAL Configuration:', {
    redirectUri: REDIRECT_URI,
    source: redirectUriSource,
    clientId: CLIENT_ID ? 'Set' : 'Missing',
    authority: AUTHORITY_SIGNUP_SIGNIN || 'Missing',
    loginHost: LOGIN_HOST || 'Missing',
    tenantName: TENANT_NAME || 'Missing',
  });

  // Warn if using fallback - this is likely the cause of 400 errors
  if (!env.VITE_AZURE_REDIRECT_URI_CUSTOM) {
    console.warn('⚠️ WARNING: VITE_AZURE_REDIRECT_URI_CUSTOM is not set. Using fallback:', window.location.origin);
    console.warn('⚠️ Make sure this redirect URI is EXACTLY registered in your Azure AD app registration.');
    console.warn('⚠️ The redirect URI must match exactly, including protocol (http/https) and trailing slashes.');
  } else {
    console.log('✅ Using custom redirect URI:', REDIRECT_URI);
  }
}

export const msalInstance = new PublicClientApplication(msalConfig);

// Optionally include Graph User.Read for email resolution fallback (see AuthContext)
const ENABLE_GRAPH_USER_READ =
  (env.VITE_MSAL_ENABLE_GRAPH_FALLBACK ||
    env.NEXT_PUBLIC_MSAL_ENABLE_GRAPH_FALLBACK) === "true";
const GRAPH_SCOPES: string[] = ENABLE_GRAPH_USER_READ ? ["User.Read"] : [];

export const defaultLoginRequest = {
  scopes: Array.from(new Set([...DEFAULT_OIDC_SCOPES, ...GRAPH_SCOPES])),
  authority: AUTHORITY_SIGNUP_SIGNIN || "",
};

export const signupRequest = {
  scopes: Array.from(new Set([...DEFAULT_OIDC_SCOPES, ...GRAPH_SCOPES])),
  authority: AUTHORITY_SIGNUP || "",
};

// Legacy exports for backward compatibility
export const loginRequest = defaultLoginRequest;
export const userScopes = [...DEFAULT_OIDC_SCOPES, ...GRAPH_SCOPES];

// Azure External Identities Policy Names
export const ciamPolicies = {
  names: {
    signUpSignIn: POLICY_SIGNUP_SIGNIN,
    signUp: POLICY_SIGNUP,
  },
  authorities: {
    signUpSignIn: {
      authority: AUTHORITY_SIGNUP_SIGNIN || "",
    },
    signUp: {
      authority: AUTHORITY_SIGNUP || "",
    },
  },
  authorityDomain: LOGIN_HOST || "",
};

// Helper function to get authority URL
export const getAuthorityUrl = (policyName: string) => {
  if (!LOGIN_HOST || !TENANT_NAME) {
    return "";
  }
  return `https://${LOGIN_HOST}/${TENANT_NAME}.onmicrosoft.com/${policyName}`;
};

// Graph configuration
export const graphConfig = {
  graphMeEndpoint: env.NEXT_PUBLIC_GRAPH_ENDPOINT || env.VITE_GRAPH_ENDPOINT,
};