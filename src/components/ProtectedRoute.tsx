import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAzureAuth } from '../hooks/useAzureAuth';
import { AzureLogin } from './AzureLogin';
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
  // AUTHENTICATION TEMPORARILY DISABLED - Account access issues
  // TODO: Re-enable authentication when account access is resolved
  
  // const { isAuthenticated, user, userSegment, canAccess } = useAuth();
  // const { isAuthenticated: isAzureAuthenticated, account } = useAzureAuth();
  // const location = useLocation();

  // // Show loading state while checking authentication
  // if (!isAzureAuthenticated && !isAuthenticated) {
  //   // If no Azure account and no local user, show Azure login
  //   return <AzureLogin />;
  // }

  // // If user is authenticated via Azure but not in our local context
  // if (isAzureAuthenticated && !isAuthenticated) {
  //   // This will be handled by AzureAuthHandler in AzureAuthProvider
  //   return <div className="flex items-center justify-center min-h-screen">
  //     <div className="text-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
  //       <p className="mt-4 text-gray-600">Setting up your session...</p>
  //     </div>
  //   </div>;
  // }

  // // Check if user has unauthorized role (invalid customerType)
  // if (isAuthenticated && user && user.role === 'unauthorized') {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
  //         <div className="text-center">
  //           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
  //             <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  //             </svg>
  //           </div>
  //           <h3 className="mt-4 text-lg font-medium text-gray-900">Access Not Authorized</h3>
  //           <p className="mt-2 text-sm text-gray-500">
  //             Your account type is not authorized to access this platform.
  //           </p>
  //           <p className="mt-2 text-sm text-gray-600">
  //             Only staff members can access the Platform Admin Dashboard.
  //           </p>
  //           <p className="mt-4 text-xs text-gray-400">
  //             If you believe this is an error, please contact your system administrator.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // // Check if required claims (userSegment, role) are present
  // if (isAuthenticated && user) {
  //   // Debug logging
  //   logger.permission('ProtectedRoute - Checking claims:', { 
  //     userSegment, 
  //     role: user.role,
  //     isAuthenticated 
  //   });
    
  //   const missingClaims = [];
    
  //   // userSegment is REQUIRED for all users
  //   const hasUserSegment = userSegment && 
  //                          userSegment !== 'null' && 
  //                          userSegment !== null && 
  //                          typeof userSegment === 'string' && 
  //                          userSegment.trim() !== '';
    
  //   if (!hasUserSegment) {
  //     logger.warn('Missing or invalid userSegment claim:', userSegment);
  //     missingClaims.push('userSegment');
  //   }
    
  //   // role is REQUIRED for all users
  //   const hasRole = user.role && 
  //                   user.role !== 'null' && 
  //                   user.role !== null && 
  //                   typeof user.role === 'string' && 
  //                   user.role.trim() !== '';
    
  //   if (!hasRole) {
  //     logger.warn('Missing or invalid role claim:', user.role);
  //     missingClaims.push('role');
  //   }
    
  //   // Get organisation name from localStorage
  //   const organisationName = localStorage.getItem('azure_organisation_name');
    
  //   // Check organisation requirement based on userSegment
  //   // Partner and internal users MAY need organisation name (optional for now)
  //   if (hasUserSegment && ['partner', 'internal'].includes(userSegment.toLowerCase())) {
  //     if (!organisationName || organisationName === 'null' || organisationName.trim() === '') {
  //       logger.warn('Missing organisationName for partner/internal user');
  //       // Don't block access - just log warning
  //     }
  //   }
    
  //   if (missingClaims.length > 0) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //         <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
  //           <div className="text-center">
  //             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
  //               <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
  //               </svg>
  //             </div>
  //             <h3 className="mt-4 text-lg font-medium text-gray-900">Incomplete Authentication Claims</h3>
  //             <p className="mt-2 text-sm text-gray-500">
  //               Your authentication is missing required claims.
  //             </p>
  //             <div className="mt-3 text-sm text-left bg-gray-50 p-3 rounded">
  //               <p className="font-semibold mb-2">Missing claims:</p>
  //               <ul className="list-disc list-inside space-y-1 text-red-600">
  //                 {missingClaims.map((claim) => (
  //                   <li key={claim}>{claim}</li>
  //                 ))}
  //               </ul>
  //             </div>
  //             <p className="mt-4 text-xs text-gray-400">
  //               Please contact your administrator to update your Azure configuration.
  //             </p>
  //             <div className="mt-6">
  //               <button
  //                 onClick={() => window.location.reload()}
  //                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
  //               >
  //                 Refresh
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  // // If user is authenticated but doesn't have required roles
  // if (isAuthenticated && user && requiredRoles.length > 0) {
  //   const userRoles = [user.role];
  //   const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role as any));
    
  //   if (!hasRequiredRole) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //         <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
  //           <div className="text-center">
  //             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
  //               <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
  //               </svg>
  //             </div>
  //             <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
  //             <p className="mt-2 text-sm text-gray-500">
  //               You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
  //             </p>
  //             <p className="mt-1 text-xs text-gray-400">
  //               Your current role: {user.role}
  //             </p>
  //             <div className="mt-6">
  //               <button
  //                 onClick={() => window.history.back()}
  //                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  //               >
  //                 Go Back
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  // If everything is good, render the protected content
  return <>{children}</>;
};
