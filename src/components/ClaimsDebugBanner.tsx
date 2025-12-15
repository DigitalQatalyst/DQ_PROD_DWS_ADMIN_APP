/**
 * Claims Debug Banner
 * 
 * Displays current user claims for debugging purposes.
 * Shows role, customer type, organisation, and source claim key.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ClaimsDebugBannerProps {
  className?: string;
}

export const ClaimsDebugBanner: React.FC<ClaimsDebugBannerProps> = ({ 
  className = '' 
}) => {
  const { user, customerType, userRole } = useAuth();

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  if (!user) {
    return null;
  }

  const getSourceClaimKey = () => {
    return localStorage.getItem('azure_source_claim_key') || 'Company Name';
  };

  const getOrganisationName = () => {
    return localStorage.getItem('azure_organisation_name') || user.organization_id || 'N/A';
  };

  return (
    <div className={`bg-blue-50 border-l-4 border-blue-400 p-3 text-sm ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-blue-700">
            <strong>Debug Info:</strong> Role: <span className="font-mono">{userRole || 'N/A'}</span> | 
            Customer Type: <span className="font-mono">{customerType || 'N/A'}</span> | 
            Organisation: <span className="font-mono">{getOrganisationName()}</span> | 
            Source Claim: <span className="font-mono">{getSourceClaimKey()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimsDebugBanner;
