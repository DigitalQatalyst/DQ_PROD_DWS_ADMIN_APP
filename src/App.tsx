import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AzureAuthProvider } from './components/AzureAuthProvider';
import { AzureAuthWrapper } from './components/AzureAuthWrapper';
import { AppRouter } from './AppRouter';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthDebugger } from './components/AuthDebugger';
import { AuthModeIndicator } from './components/AuthModeIndicator';
import ClaimsDebugger from './components/ClaimsDebugger';

export function App() {
  return (
    <AzureAuthProvider>
      <AuthProvider>
        <AzureAuthWrapper>
          <AppProvider>
            <ToastProvider>
              <AuthModeIndicator />
              <AppRouter />
              <AuthDebugger />
              <ClaimsDebugger />
            </ToastProvider>
          </AppProvider>
        </AzureAuthWrapper>
      </AuthProvider>
    </AzureAuthProvider>
  );
}