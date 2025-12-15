import React from 'react';
import { AlertCircleIcon } from 'lucide-react';

interface AccessDeniedErrorProps {
  error: 'user_not_provisioned' | 'incomplete_profile' | 'invalid_api_key' | 'redirect_uri_mismatch' | 'generic';
  message?: string;
  email?: string;
  onRetry?: () => void;
}

export const AccessDeniedError: React.FC<AccessDeniedErrorProps> = ({ 
  error, 
  message, 
  email,
  onRetry 
}) => {
  const getErrorMessage = () => {
    switch (error) {
      case 'user_not_provisioned':
        return 'Your account has not been provisioned. Please contact your administrator to request access.';
      case 'incomplete_profile':
        return 'Your user profile is incomplete. Please contact your administrator to update your account.';
      case 'invalid_api_key':
        return 'Supabase API key is invalid for this environment. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY to the new project and rebuild the app.';
      case 'redirect_uri_mismatch':
        return message || 'The redirect URI configured in the application does not match the one registered in Azure AD. Please ensure the redirect URI is exactly registered in your Azure AD app registration.';
      default:
        return message || 'Access denied. Please try again or contact support.';
    }
  };

  const handleClearState = () => {
    // Clear localStorage to remove any cached error state
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    // Reload page to start fresh
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          
          {/* Title */}
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
          
          {/* Error Message */}
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage()}
          </p>
          
          {/* Email Display */}
          {email && (
            <div className="mt-3 text-sm text-left bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Email:</p>
              <p className="text-gray-700">{email}</p>
            </div>
          )}
          
          {/* Additional Info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>If you believe this is an error, please contact your administrator.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {/* Try Again Button (if onRetry provided) */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
            
            {/* Clear State and Return to Login */}
            <button
              onClick={handleClearState}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

