import React from 'react';

export const AzureConfigTest: React.FC = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const config = {
    clientId: env.VITE_AZURE_CLIENT_ID,
    tenantName: env.VITE_B2C_TENANT_NAME,
    policyName: env.VITE_B2C_POLICY_SIGNUP_SIGNIN,
    // Primary redirect URI for this branch - VITE_AZURE_REDIRECT_URI_CUSTOM is the main option
    redirectUri: env.VITE_AZURE_REDIRECT_URI_CUSTOM || window.location.origin,
    redirectUriSource: env.VITE_AZURE_REDIRECT_URI_CUSTOM ? 'VITE_AZURE_REDIRECT_URI_CUSTOM (Primary)' : 'window.location.origin (Fallback)',
    subdomain: env.VITE_AZURE_SUBDOMAIN,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold text-sm mb-2">Azure Config Debug</h3>
      <div className="text-xs space-y-1">
        <div><strong>Client ID:</strong> {config.clientId ? '✅ Set' : '❌ Missing'}</div>
        <div><strong>Tenant:</strong> {config.tenantName || '❌ Missing'}</div>
        <div><strong>Policy:</strong> {config.policyName || '❌ Missing'}</div>
        <div><strong>Redirect URI:</strong> {config.redirectUri || '❌ Missing'}</div>
        <div><strong>Redirect URI Source:</strong> {config.redirectUriSource}</div>
        <div><strong>Subdomain:</strong> {config.subdomain || '❌ Missing'}</div>
        <div><strong>Current Port:</strong> {window.location.port}</div>
        <div><strong>Expected Port:</strong> {config.redirectUri?.split(':')[2]?.split('/')[0] || 'N/A'}</div>
        <div><strong>Port Match:</strong> {window.location.port === config.redirectUri?.split(':')[2]?.split('/')[0] ? '✅ Yes' : '❌ No'}</div>
      </div>
    </div>
  );
};
