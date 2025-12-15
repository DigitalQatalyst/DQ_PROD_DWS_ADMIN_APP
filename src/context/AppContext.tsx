import React, { useState, createContext, useContext } from 'react';
type UserRole = 'admin' | 'editor' | 'approver' | 'viewer';
interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const hasPermission = (requiredRoles: UserRole[]) => {
    return requiredRoles.includes(userRole);
  };
  return <AppContext.Provider value={{
    userRole,
    setUserRole,
    hasPermission
  }}>
      {children}
    </AppContext.Provider>;
};