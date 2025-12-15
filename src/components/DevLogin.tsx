/**
 * Development Login Component
 * 
 * Provides quick login options for development and testing.
 * Includes organization information for RBAC testing.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface DevLoginProps {
  className?: string;
}

export const DevLogin: React.FC<DevLoginProps> = ({ className = '' }) => {
  const { login } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  const handleQuickLogin = async (
    userData: any,
    userSegment: string,
    role: string,
    organizationName: string
  ) => {
    try {
      const userWithOrg = {
        ...userData,
        organization_id: organizationName,
        organisationName: organizationName,
        user_segment: userSegment
      };
      
      await login(userWithOrg, userSegment, role);
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  const presetUsers = [
    // Internal users (formerly staff)
    {
      name: 'Internal Admin - DigitalQatalyst',
      user: {
        id: 'internal-admin-1',
        email: 'admin@digitalqatalyst.com',
        name: 'Internal Admin',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'internal',
      role: 'admin',
      organizationName: 'DigitalQatalyst'
    },
    // Custom user example - you can add your own here
    {
      name: 'Partner Admin - My Org',
      user: {
        id: 'partner-admin-1',
        email: 'admin@myorg.com',
        name: 'Partner Admin',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'partner',
      role: 'admin',
      organizationName: 'My Organization'
    },
    {
      name: 'Internal Approver - Front Operations',
      user: {
        id: 'internal-approver-1',
        email: 'approver@frontoperations.com',
        name: 'Internal Approver',
        role: 'approver',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'internal',
      role: 'approver',
      organizationName: 'Front Operations'
    },
    // Partner users
    {
      name: 'Partner Admin - Beta Industries',
      user: {
        id: 'partner-admin-beta-1',
        email: 'admin@betaindustries.com',
        name: 'Partner Admin Beta',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'partner',
      role: 'admin',
      organizationName: 'Beta Industries'
    },
    {
      name: 'Partner Editor - Beta Industries',
      user: {
        id: 'partner-editor-1',
        email: 'editor@betaindustries.com',
        name: 'Partner Editor',
        role: 'editor',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'partner',
      role: 'editor',
      organizationName: 'Beta Industries'
    },
    {
      name: 'Partner Viewer - Beta Industries',
      user: {
        id: 'partner-viewer-1',
        email: 'viewer@betaindustries.com',
        name: 'Partner Viewer',
        role: 'viewer',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'partner',
      role: 'viewer',
      organizationName: 'Beta Industries'
    },
    // Customer user (should be blocked from Admin App)
    {
      name: 'Customer User - Blocked',
      user: {
        id: 'customer-user-1',
        email: 'user@customer.com',
        name: 'Customer User',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'customer',
      role: 'admin',
      organizationName: 'Customer Corp'
    },
    // Partner user without organization
    {
      name: 'Partner - No Org',
      user: {
        id: 'partner-noorg-1',
        email: 'partner@noorg.com',
        name: 'Partner No Org',
        role: 'admin',
        avatar_url: null,
        is_active: true,
        last_login_at: new Date().toISOString(),
      },
      userSegment: 'partner',
      role: 'admin',
      organizationName: '' // Empty organization should be blocked
    }
  ];

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Development Login
            </h3>
            <p className="text-sm text-yellow-700">
              Quick login options for testing RBAC with organization claims
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          {isExpanded ? 'Hide' : 'Show'} Options
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presetUsers.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleQuickLogin(
                  preset.user,
                  preset.userSegment,
                  preset.role,
                  preset.organizationName
                )}
                className={`text-left p-3 rounded-md border transition-colors ${
                  preset.userSegment === 'customer' ||
                  (preset.userSegment === 'partner' && !preset.organizationName)
                    ? 'border-red-200 bg-red-50 hover:bg-red-100'
                    : 'border-green-200 bg-green-50 hover:bg-green-100'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <div>Segment: {preset.userSegment}</div>
                  <div>Role: {preset.role}</div>
                  <div>Org: {preset.organizationName || 'None'}</div>
                </div>
                {preset.userSegment === 'customer' ||
                 (preset.userSegment === 'partner' && !preset.organizationName) ? (
                  <div className="text-xs text-red-600 mt-1 font-medium">
                    Should be blocked
                  </div>
                ) : (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    Should work
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-600">
            <p><strong>Test Cases (RBAC v2):</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>Internal users:</strong> Full access to all content (no org filter)</li>
              <li><strong>Partner + Organization:</strong> Org-scoped access only</li>
              <li><strong>Partner + No Org:</strong> Should be blocked (403)</li>
              <li><strong>Customer + Any:</strong> Should be blocked from Admin App (403)</li>
              <li><strong>Viewer role:</strong> Read-only access to directories</li>
              <li><strong>Editor role:</strong> Can create/update content</li>
              <li><strong>Approver role:</strong> Can approve content</li>
              <li><strong>Admin role:</strong> Full access</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevLogin;
