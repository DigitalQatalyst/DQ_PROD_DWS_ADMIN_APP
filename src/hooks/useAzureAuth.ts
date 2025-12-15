import { useMsal, useAccount } from '@azure/msal-react';
import { defaultLoginRequest, signupRequest, ciamPolicies } from '../config/msalConfig';
import { useAuth } from '../context/AuthContext';

export const useAzureAuth = () => {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});
  const { logout: contextLogout } = useAuth();

  // Login with popup
  const loginWithPopup = async () => {
    try {
      const response = await instance.loginPopup(defaultLoginRequest);
      
      if (response.account) {
        // Get additional user information
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: defaultLoginRequest.scopes || [],
          account: response.account,
        });
        
        return {
          success: true,
          account: response.account,
          accessToken: tokenResponse.accessToken,
        };
      }
      
      return { success: false, error: 'No account returned' };
    } catch (error) {
      console.error('Login popup error:', error);
      return { success: false, error: error.message || error };
    }
  };

  // Login with redirect
  const loginWithRedirect = async () => {
    try {
      await instance.loginRedirect(defaultLoginRequest);
    } catch (error) {
      console.error('Login redirect error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Logout from context first
      contextLogout();
      
      // Then logout from Azure
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Edit profile (for Azure External Identities)
  const editProfile = async () => {
    try {
      // For CIAM, we might not have separate edit profile flow
      // You can implement this based on your specific CIAM configuration
      console.warn('Edit profile not implemented for this CIAM configuration');
    } catch (error) {
      console.error('Edit profile error:', error);
      throw error;
    }
  };

  // Reset password (for Azure External Identities)
  const resetPassword = async () => {
    try {
      // For CIAM, password reset is typically handled through the main flow
      // You can implement this based on your specific CIAM configuration
      console.warn('Password reset not implemented for this CIAM configuration');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Get access token silently
  const getAccessToken = async (scopes: string[] = defaultLoginRequest.scopes || []) => {
    try {
      if (!account) {
        throw new Error('No account available');
      }
      
      const response = await instance.acquireTokenSilent({
        scopes,
        account,
      });
      
      return response.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return accounts.length > 0 && !!account;
  };

  // Get user info from Azure account
  const getUserInfo = () => {
    if (!account) return null;
    
    return {
      id: account.localAccountId || account.homeAccountId,
      email: account.username,
      name: account.name || account.username,
      tenantId: account.tenantId,
      environment: account.environment,
    };
  };

  return {
    // State
    account,
    accounts,
    isAuthenticated: isAuthenticated(),
    isLoading: inProgress === 'login' || inProgress === 'logout',
    
    // Actions
    loginWithPopup,
    loginWithRedirect,
    logout,
    editProfile,
    resetPassword,
    getAccessToken,
    getUserInfo,
  };
};
