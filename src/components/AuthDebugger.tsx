import React from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthDebugger: React.FC = () => {
  const { user, role, userSegment, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Get auth mode from environment variables
  const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'local';
  const authMode = USE_MOCK_AUTH ? 'mock' : 'azure';
  
  // Get organization name from localStorage
  const organizationName = localStorage.getItem('azure_organisation_name') || user?.organization_id || 'null';
  const organizationId = localStorage.getItem('user_organization_id');
  const storedRole = localStorage.getItem('user_role');
  const storedUserSegment = localStorage.getItem('user_segment');

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-w-xs">
      {/* Header with collapse button */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-bold text-xs">🔍 Auth Debugger</h3>
        <span className="text-xs">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      
      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-2 pb-2 text-xs space-y-1 border-t">
          <div className="flex justify-between">
            <span><strong>Auth:</strong></span>
            <span>{isAuthenticated ? '✅' : '❌'}</span>
          </div>
          <div className="truncate" title={user?.name || 'None'}>
            <strong>User:</strong> {user?.name || 'None'}
          </div>
          <div className="truncate" title={user?.email || 'None'}>
            <strong>Email:</strong> {user?.email || 'None'}
          </div>
          <div className="flex justify-between">
            <span><strong>Role:</strong></span>
            <span className="font-mono text-xs">{role || storedRole || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span><strong>Segment:</strong></span>
            <span className="font-mono text-xs">{userSegment || storedUserSegment || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span><strong>Org ID:</strong></span>
            <span className="font-mono text-xs truncate">{organizationId || 'None'}</span>
          </div>
          <div className="truncate" title={organizationName || 'None'}>
            <strong>Org Name:</strong> {organizationName || 'None'}
          </div>
          <div className="flex justify-between">
            <span><strong>Mode:</strong></span>
            <span className="font-mono text-xs">{authMode}</span>
          </div>
          <div className="flex justify-between">
            <span><strong>Env:</strong></span>
            <span className="font-mono text-xs">{ENVIRONMENT}</span>
          </div>
        </div>
      )}
    </div>
  );
};
