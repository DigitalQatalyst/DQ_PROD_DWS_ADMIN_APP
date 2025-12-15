import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../context/AuthContext';

/**
 * Comprehensive Claims Debugger Component
 * Shows detailed information about Azure JWT claims and their mapping
 */
export const ClaimsDebugger: React.FC = () => {
  const { instance, accounts } = useMsal();
  const { user, userSegment, role } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [rawClaims, setRawClaims] = useState<any>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0];
      setRawClaims(account.idTokenClaims);
    }
  }, [accounts]);

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  if (!user) {
    return null;
  }

  const getLocalStorageData = () => {
    return {
      // Federated Identity Context (from Supabase)
      user_id: localStorage.getItem('user_id'),
      user_organization_id: localStorage.getItem('user_organization_id'),
      user_role: localStorage.getItem('user_role'),
      user_segment: localStorage.getItem('user_segment'),
      // Legacy Azure claims (deprecated)
      azure_organisation_name: localStorage.getItem('azure_organisation_name'),
    };
  };

  const getOrganizationClaims = (claims: any) => {
    if (!claims) return {};
    
    const orgKeys = [
      'organisationName', 'organizationName', 'OrganizationName',
      'CompanyName', 'Company Name', 'company', 'companyName',
      'extension_OrganizationId', 'extension_OrganizationName',
      'extension_organisationName', 'extension_organizationName',
      'org', 'organization', 'organisation',
      'tenant', 'tenantId', 'tenant_id'
    ];
    
    const orgClaims: any = {};
    orgKeys.forEach(key => {
      if (claims[key]) {
        orgClaims[key] = claims[key];
      }
    });
    
    return orgClaims;
  };

  const getRoleClaims = (claims: any) => {
    if (!claims) return {};
    
    const roleKeys = [
      'User Role', 'userRole', 'role', 'Role',
      'extension_Role', 'extension_role',
      'user_role', 'user_role_claim'
    ];
    
    const roleClaims: any = {};
    roleKeys.forEach(key => {
      if (claims[key]) {
        roleClaims[key] = claims[key];
      }
    });
    
    return roleClaims;
  };

  const getUserSegmentClaims = (claims: any) => {
    if (!claims) return {};
    
    const userSegmentKeys = [
      'userSegment', 'user_segment', 'UserSegment',
      'customerType', 'customer_type', 'CustomerType', // Legacy support
      'user_type', 'userType', 'UserType',
      'extension_userSegment', 'extension_UserSegment',
    ];
    
    const userSegmentClaims: any = {};
    userSegmentKeys.forEach(key => {
      if (claims[key]) {
        userSegmentClaims[key] = claims[key];
      }
    });
    
    return userSegmentClaims;
  };

  const localStorageData = getLocalStorageData();
  const orgClaims = getOrganizationClaims(rawClaims);
  const roleClaims = getRoleClaims(rawClaims);
  const userSegmentClaims = getUserSegmentClaims(rawClaims);

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-w-2xl">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-sm">🔍 Claims Debugger</h3>
        <span className="text-sm">{isExpanded ? '▼' : '▲'}</span>
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Current User Info */}
          <div className="bg-blue-50 p-2 rounded">
            <h4 className="font-semibold text-sm mb-2">👤 Current User</h4>
            <div className="text-xs space-y-1">
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> {role}</div>
              <div><strong>User Segment:</strong> {userSegment}</div>
              <div><strong>Organization ID:</strong> {user.organization_id || 'null'}</div>
              <div><strong>User ID:</strong> {user.id}</div>
            </div>
          </div>

          {/* LocalStorage Data */}
          <div className="bg-green-50 p-2 rounded">
            <h4 className="font-semibold text-sm mb-2">💾 LocalStorage</h4>
            <div className="text-xs space-y-1">
              <div><strong>Role:</strong> {localStorageData.user_role || 'null'}</div>
              <div><strong>User Segment:</strong> {localStorageData.user_segment || 'null'}</div>
              <div><strong>Organization Name:</strong> {localStorageData.azure_organisation_name || 'null'}</div>
              <div><strong>Source Claim Key:</strong> {localStorageData.azure_source_claim_key || 'null'}</div>
            </div>
          </div>

          {/* Raw JWT Claims */}
          {rawClaims && (
            <div className="bg-yellow-50 p-2 rounded">
              <h4 className="font-semibold text-sm mb-2">🔑 Raw JWT Claims</h4>
              <div className="text-xs">
                <div><strong>Available Keys:</strong> {Object.keys(rawClaims).join(', ')}</div>
                <div className="mt-2">
                  <strong>Full Claims:</strong>
                  <pre className="mt-1 bg-gray-100 p-1 rounded text-xs overflow-x-auto">
                    {JSON.stringify(rawClaims, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Organization Claims */}
          {Object.keys(orgClaims).length > 0 && (
            <div className="bg-purple-50 p-2 rounded">
              <h4 className="font-semibold text-sm mb-2">🏢 Organization Claims</h4>
              <div className="text-xs">
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto">
                  {JSON.stringify(orgClaims, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Role Claims */}
          {Object.keys(roleClaims).length > 0 && (
            <div className="bg-orange-50 p-2 rounded">
              <h4 className="font-semibold text-sm mb-2">👔 Role Claims</h4>
              <div className="text-xs">
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto">
                  {JSON.stringify(roleClaims, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* User Segment Claims */}
          {Object.keys(userSegmentClaims).length > 0 && (
            <div className="bg-pink-50 p-2 rounded">
              <h4 className="font-semibold text-sm mb-2">🏷️ User Segment Claims</h4>
              <div className="text-xs">
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto">
                  {JSON.stringify(userSegmentClaims, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Debug Actions */}
          <div className="bg-gray-50 p-2 rounded">
            <h4 className="font-semibold text-sm mb-2">🛠️ Debug Actions</h4>
            <div className="space-y-2">
              <button 
                className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                onClick={() => {
                  console.log('🔍 Full Debug Info:', {
                    user,
                    userSegment,
                    role,
                    localStorageData,
                    rawClaims,
                    orgClaims,
                    roleClaims,
                    userSegmentClaims
                  });
                }}
              >
                Log All Data to Console
              </button>
              <button 
                className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear All & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsDebugger;
