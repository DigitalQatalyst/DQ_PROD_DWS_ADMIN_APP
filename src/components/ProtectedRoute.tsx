import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1A2E6E]/30 border-t-[#1A2E6E] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has unauthorized role
  if (isAuthenticated && user && user.role === 'unauthorized' as any) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Access Not Authorized</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your account type is not authorized to access this platform.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Only staff members can access the Platform Admin Dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but doesn't have required roles
  if (isAuthenticated && user && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      console.warn('🚫 RBAC Access Denied:', {
        user: user.email,
        currentRole: user.role,
        requiredRoles
      });
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 flex-col">
          <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your current role (<span className="font-bold text-red-600">{user.role}</span>) does not have permission to access this section.
                This area requires: <span className="block mt-2 font-semibold text-blue-600">{requiredRoles.join(', ')}</span>
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Current Identity</p>
                </div>
                <p className="text-sm text-gray-700 font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="mt-3 inline-block px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 uppercase">
                  Role: {user.role}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 px-4 py-3 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-3 bg-blue-600 text-sm font-bold rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="mt-8 text-gray-400 hover:text-gray-600 text-sm font-medium transition-all"
          >
            Sign in with a different account
          </button>
        </div>
      );
    }
  }

  // If everything is good, render the protected content
  return <>{children}</>;
};
