import React, { useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../config/msalConfig';

// Component to handle authentication state
// Note: MSAL instance is already initialized when created in msalConfig.ts
// AzureAuthWrapper handles the actual authentication flow
// This component only provides the MSAL context via MsalProvider
const AzureAuthHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return <>{children}</>;
};

// Main Azure Auth Provider Component
interface AzureAuthProviderProps {
  children: React.ReactNode;
}

export const AzureAuthProvider: React.FC<AzureAuthProviderProps> = ({ children }) => {
  // Check if mock auth mode is enabled
  const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  // Clear any existing Azure authentication data when switching to mock mode
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      console.log('🧹 Clearing Azure authentication data for mock mode');
      localStorage.removeItem('azure_user_info');
      localStorage.removeItem('azure_customer_type');
      localStorage.removeItem('azure_user_role');
      localStorage.removeItem('azure_organisation_name');
      localStorage.removeItem('azure_source_claim_key');
    }
  }, [USE_MOCK_AUTH]);

  // In mock mode, skip MSAL provider entirely
  if (USE_MOCK_AUTH) {
    console.log('🧪 Mock RBAC mode enabled - skipping MSAL provider');
    return <>{children}</>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AzureAuthHandler>
        {children}
      </AzureAuthHandler>
    </MsalProvider>
  );
};
