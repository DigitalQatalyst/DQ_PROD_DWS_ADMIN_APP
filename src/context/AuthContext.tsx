/**
 * Enhanced Authentication Context with RBAC and Azure Integration
 * 
 * Provides authentication state and role-based access control
 * for the entire application. Integrates with Azure External Identities.
 * 
 * Uses user_segment and role claims for granular permissions.
 * Now includes CASL ability-based authorization for type-safe permissions.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserSegment, RolePermissions } from '../types';
import { buildAbility, AppAbility, UserContext, debugUserAbilities } from '../auth/ability';
import { createMongoAbility } from '@casl/ability';
import { getInternalJWT, parseInternalJWT, isInternalJWTExpired } from '../lib/federatedAuth';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  userSegment: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  ability: AppAbility;
  login: (userData: User, userSegment?: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  canPerformAction: (action: string, subject: string) => boolean;
  getUserAbilities: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [userSegment, setUserSegment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize ability immediately with a minimal empty ability
  const [ability, setAbility] = useState<AppAbility>(createMongoAbility([]) as any);

  useEffect(() => {
    // Load user from localStorage (simulating session persistence)
    const loadUser = () => {
      try {
        // Check for internal JWT first (federated identity pattern)
        const internalJWT = getInternalJWT();

        if (internalJWT && !isInternalJWTExpired(internalJWT)) {
          const internalClaims = parseInternalJWT(internalJWT);

          if (internalClaims) {
            console.log('🔄 Loading from internal JWT (federated identity):', {
              user_id: internalClaims.user_id,
              organization_id: internalClaims.organization_id,
              role: internalClaims.role,
              user_segment: internalClaims.user_segment as UserSegment
            });

            // Load user data from localStorage
            const savedUser = localStorage.getItem('platform_admin_user');

            if (savedUser) {
              const userData = JSON.parse(savedUser);
              const userRole = internalClaims.role as UserRole;
              const userSegmentValue = internalClaims.user_segment as UserSegment;

              setUser(userData);
              setRole(userRole);
              setUserSegment(userSegmentValue);

              // Build CASL ability based on internal JWT context
              const userContext: UserContext = {
                role: userRole,
                user_segment: userSegmentValue,
                organizationId: internalClaims.organization_id,
                id: internalClaims.user_id,
              };

              const userAbility = buildAbility(userContext);
              setAbility(userAbility);

              console.log('✅ Loaded federated identity context from internal JWT');
              return;
            }
          }
        }

        // Load from user_segment in localStorage (new approach)
        const userSegmentValue = localStorage.getItem('user_segment') as UserSegment;
        const savedUser = localStorage.getItem('platform_admin_user');
        const savedRole = localStorage.getItem('user_role');

        if (savedUser && userSegmentValue) {
          const userData = JSON.parse(savedUser);
          console.log('🔄 Loading from localStorage - User Segment:', userSegmentValue);
          console.log('🔄 Loading from localStorage - User Role:', savedRole);

          const userRole = (savedRole as UserRole) || userData.role || 'viewer';

          setUser(userData);
          setRole(userRole);
          setUserSegment(userSegmentValue);

          // Build CASL ability based on loaded user context
          const userContext: UserContext = {
            role: userRole,
            user_segment: userSegmentValue,
            organizationId: userData.organization_id || userData.id || 'guest',
            id: userData.id,
          };

          const userAbility = buildAbility(userContext);
          setAbility(userAbility);

          // Debug user abilities
          debugUserAbilities(userAbility, userContext);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate async auth check
    const timer = setTimeout(loadUser, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (userData: User, userSegmentValue?: string, roleValue?: string) => {
    console.log('🔐 AuthContext.login called with:', {
      userData,
      userSegmentValue,
      roleValue
    });

    // Special handling for dummy users
    let finalUserData = { ...userData };
    let finalRole = roleValue as UserRole || userData.role || 'viewer';
    let finalSegment = userSegmentValue || userData.user_segment || 'internal';

    if (userData.email === 'admin@test.com') {
      finalRole = 'admin';
      finalSegment = 'internal';
      finalUserData.name = 'Super Admin';
    } else if (userData.email === 'hr@test.com') {
      finalRole = 'hr';
      finalSegment = 'internal';
      finalUserData.name = 'HR Manager';
    } else if (userData.email === 'content@test.com') {
      finalRole = 'content';
      finalSegment = 'internal';
      finalUserData.name = 'Content Manager';
    }

    finalUserData.role = finalRole;
    finalUserData.user_segment = finalSegment as UserSegment;

    setUser(finalUserData);
    setRole(finalRole);
    setUserSegment(finalSegment);

    // Build CASL ability based on user context
    const userContext: UserContext = {
      role: finalRole,
      user_segment: finalSegment as UserSegment,
      organizationId: finalUserData.organization_id || finalUserData.id,
      id: finalUserData.id,
    };

    const userAbility = buildAbility(userContext);
    setAbility(userAbility);

    // Debug user abilities
    debugUserAbilities(userAbility, userContext);

    // Store in localStorage
    localStorage.setItem('platform_admin_user', JSON.stringify(finalUserData));
    localStorage.setItem('user_role', finalRole);
    localStorage.setItem('user_segment', finalSegment);
    if (finalUserData.organization_id) {
      localStorage.setItem('user_organization_id', finalUserData.organization_id);
    }
    localStorage.setItem('user_id', finalUserData.id);
    localStorage.setItem('user_role', finalRole);
    localStorage.setItem('user_segment', finalSegment);

    setIsLoading(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('platform_admin_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setRole('viewer');
    setUserSegment(null);
    setAbility(createMongoAbility([]) as any);
    localStorage.removeItem('platform_admin_user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_segment');
    localStorage.removeItem('azure_user_info');
    localStorage.removeItem('user_organization_id');
    localStorage.removeItem('azure_organisation_name');
  };

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('user_role', newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('platform_admin_user', JSON.stringify(updatedUser));
    }
  };

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !role) return false;
    const permissions = RolePermissions[role as UserRole];
    return permissions?.includes(permission) || false;
  };

  /**
   * Check if the current user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !role) return false;
    const rolePermissions = RolePermissions[role as UserRole];
    return permissions.some(permission => rolePermissions?.includes(permission));
  };

  /**
   * Check if the current user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !role) return false;
    const rolePermissions = RolePermissions[role as UserRole];
    return permissions.every(permission => rolePermissions?.includes(permission));
  };

  /**
   * Check if the current user's role is in the list of required roles
   */
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user || !role) return false;
    return requiredRoles.includes(role);
  };

  /**
   * Check if user can perform a specific action on a subject using CASL
   */
  const canPerformAction = (action: string, subject: string): boolean => {
    if (!ability) return false;
    return ability.can(action as any, subject as any);
  };

  /**
   * Get user abilities using CASL
   */
  const getUserAbilities = () => {
    if (!ability) return {};
    return {
      canCreate: (subject: string) => ability.can('create', subject as any),
      canRead: (subject: string) => ability.can('read', subject as any),
      canUpdate: (subject: string) => ability.can('update', subject as any),
      canDelete: (subject: string) => ability.can('delete', subject as any),
      canApprove: (subject: string) => ability.can('approve', subject as any),
      canManage: (subject: string) => ability.can('manage', subject as any),
    };
  };

  const value: AuthContextType = {
    user,
    role,
    userSegment,
    isLoading,
    isAuthenticated: !!user,
    ability,
    login,
    logout,
    updateUser,
    setRole: updateRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    canPerformAction,
    getUserAbilities,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export role permissions for use in components
export { RolePermissions } from '../types';

