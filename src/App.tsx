import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './AppRouter';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}