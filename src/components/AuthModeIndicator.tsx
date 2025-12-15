import React from 'react';

interface AuthModeIndicatorProps {
  className?: string;
}

export const AuthModeIndicator: React.FC<AuthModeIndicatorProps> = ({ 
  className = '' 
}) => {
  const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'local';

  // Only show in development mode or when mock auth is enabled
  if (import.meta.env.PROD && !USE_MOCK_AUTH) {
    return null;
  }

  const getIndicatorStyle = () => {
    if (USE_MOCK_AUTH) {
      return 'bg-yellow-200 text-yellow-800 border-yellow-300';
    }
    
    switch (ENVIRONMENT) {
      case 'dev':
        return 'bg-blue-200 text-blue-800 border-blue-300';
      case 'staging':
        return 'bg-orange-200 text-orange-800 border-orange-300';
      case 'prod':
        return 'bg-green-200 text-green-800 border-green-300';
      default:
        return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getIndicatorText = () => {
    if (USE_MOCK_AUTH) {
      return '🧪 MOCK MODE';
    }
    
    return `🔧 ${ENVIRONMENT.toUpperCase()}`;
  };

  return (
    <div className={`fixed top-2 right-2 z-50 text-xs px-2 py-1 rounded border ${getIndicatorStyle()} ${className}`}>
      {getIndicatorText()}
    </div>
  );
};
