import React, { useState } from 'react';
import { useAzureAuth } from '../hooks/useAzureAuth';
import { Button } from './Button/Button';
import { Toast } from './ui/Toast';

interface AzureLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const AzureLogin: React.FC<AzureLoginProps> = ({ onSuccess, onError }) => {
  const { loginWithPopup, loginWithRedirect, isLoading } = useAzureAuth();
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handlePopupLogin = async () => {
    try {
      setToast({ type: 'info', message: 'Opening Azure login window...' });
      
      const result = await loginWithPopup();
      
      if (result.success) {
        setToast({ type: 'success', message: 'Successfully logged in!' });
        // Reload the page to trigger the authentication flow
        window.location.reload();
        onSuccess?.();
      } else {
        setToast({ type: 'error', message: `Login failed: ${result.error}` });
        onError?.(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setToast({ type: 'error', message: `Login failed: ${error.message || 'Unknown error'}` });
      onError?.(error);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      setToast({ type: 'info', message: 'Redirecting to Azure login...' });
      await loginWithRedirect();
    } catch (error) {
      console.error('Redirect login error:', error);
      setToast({ type: 'error', message: `Redirect login failed: ${error.message || 'Unknown error'}` });
      onError?.(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Platform Admin Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Azure account to continue
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handlePopupLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
              </span>
              {isLoading ? 'Signing in...' : 'Sign in with Azure (Popup)'}
            </Button>

            <Button
              onClick={handleRedirectLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Redirecting...' : 'Sign in with Azure (Redirect)'}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Secure authentication powered by Azure</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
