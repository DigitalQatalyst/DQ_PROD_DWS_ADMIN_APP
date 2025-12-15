import React, { useState } from 'react';
import { useAzureAuth } from '../hooks/useAzureAuth';
import { Button } from './Button/Button';
import { Toast } from './ui/Toast';
import { LogOutIcon, UserIcon } from 'lucide-react';

interface AzureLogoutProps {
  showUserInfo?: boolean;
  variant?: 'button' | 'dropdown' | 'full';
}

export const AzureLogout: React.FC<AzureLogoutProps> = ({ 
  showUserInfo = true, 
  variant = 'button' 
}) => {
  const { 
    account, 
    logout, 
    isLoading,
    getUserInfo 
  } = useAzureAuth();
  
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      setToast({ type: 'info', message: 'Signing out...' });
      await logout();
      setToast({ type: 'success', message: 'Successfully signed out!' });
    } catch (error) {
      console.error('Logout error:', error);
      setToast({ type: 'error', message: 'Logout failed. Please try again.' });
    }
  };

  // Profile management is handled by Azure External Identities
  // Users can manage their profile through the Azure portal or admin interface

  const userInfo = getUserInfo();

  if (!account || !userInfo) {
    return null;
  }

  if (variant === 'full') {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {userInfo.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {userInfo.email}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="text-center text-sm text-gray-500 mb-4">
            Profile management is handled through Azure External Identities
          </div>
          
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-blue-600" />
          </div>
          {showUserInfo && (
            <div className="hidden md:block text-left">
              <p className="font-medium text-gray-700">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.email}</p>
            </div>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-medium">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.email}</p>
            </div>
            
            <div className="px-4 py-2 text-xs text-gray-500 border-b">
              Profile managed by Azure External Identities
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        )}

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className="flex items-center space-x-4">
      {showUserInfo && (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{userInfo.name}</p>
          <p className="text-xs text-gray-500">{userInfo.email}</p>
        </div>
      )}
      
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <LogOutIcon className="h-4 w-4" />
        <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
      </Button>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
