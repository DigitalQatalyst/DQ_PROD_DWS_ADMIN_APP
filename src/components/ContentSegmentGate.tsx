/**
 * Content Segment Gate
 * 
 * Blocks customer and advisor segments from accessing content management routes
 * Only internal and partner segments are allowed
 * 
 * Usage:
 * ```tsx
 * <Route path="/content-management" element={
 *   <ProtectedRoute requiredRoles={['admin', 'approver', 'editor']}>
 *     <ContentSegmentGate>
 *       <ContentManagementRoute />
 *     </ContentSegmentGate>
 *   </ProtectedRoute>
 * } />
 * ```
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ContentSegmentGateProps {
  children: React.ReactNode;
}

export const ContentSegmentGate: React.FC<ContentSegmentGateProps> = ({ children }) => {
  const { userSegment } = useAuth();

  // Block customer and advisor segments from content management
  if (userSegment === 'customer' || userSegment === 'advisor') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-2 text-sm text-gray-500">
              Content management is restricted to internal staff and partner organizations only.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Your account segment: {userSegment}
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Allow access for internal and partner segments
  return <>{children}</>;
};

