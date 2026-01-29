/**
 * Supabase Authentication Context with RBAC
 * 
 * Provides authentication state and role-based access control
 * for the entire application using Supabase Auth.
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, UserSegment } from '../types';
import { buildAbility, AppAbility, UserContext, debugUserAbilities } from '../auth/ability';
import { createMongoAbility } from '@casl/ability';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  userSegment: UserSegment | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  ability: AppAbility;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  canPerformAction: (action: string, subject: string) => boolean;
  getUserAbilities: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [userSegment, setUserSegment] = useState<UserSegment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ability, setAbility] = useState<AppAbility>(createMongoAbility([]) as any);

  /**
   * Initialize or update ability when user data changes
   */
  const refreshAbility = useCallback((roles: UserRole, segment: UserSegment, id: string, orgId?: string) => {
    const context: UserContext = {
      role: roles,
      user_segment: segment,
      id,
      organizationId: orgId
    };
    const newAbility = buildAbility(context);
    setAbility(newAbility);
    debugUserAbilities(newAbility, context);
  }, []);

  /**
   * Handle session changes
   */
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const metadata = session.user.user_metadata;

      // Default to these values if metadata is missing
      const userRole = (metadata.role as UserRole) || 'viewer';
      const segment = (metadata.user_segment as UserSegment) || 'internal';

      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: metadata.display_name || metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User',
        role: userRole,
        user_segment: segment,
        organization_id: metadata.organization_id
      };

      setUser(userData);
      setRole(userRole);
      setUserSegment(segment);
      refreshAbility(userRole, segment, userData.id, userData.organization_id);
    } else {
      setUser(null);
      setRole('viewer');
      setUserSegment(null);
      setAbility(createMongoAbility([]) as any);
    }
    setIsLoading(false);
  }, [refreshAbility]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      return { error };
    }

    return { error: null };
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    localStorage.clear(); // Clear any legacy storage
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateRole = (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      setRole(newRole);
      refreshAbility(newRole, user.user_segment, user.id, user.organization_id);
    }
  };

  /**
   * CASL Accessors
   */
  const canPerformAction = (action: string, subject: string): boolean => {
    return ability.can(action as any, subject as any);
  };

  const getUserAbilities = () => {
    return {
      canCreate: (subject: string) => ability.can('create', subject as any),
      canRead: (subject: string) => ability.can('read', subject as any),
      canUpdate: (subject: string) => ability.can('update', subject as any),
      canDelete: (subject: string) => ability.can('delete', subject as any),
      canApprove: (subject: string) => ability.can('approve', subject as any),
      canPublish: (subject: string) => ability.can('publish', subject as any),
      canManage: (subject: string) => ability.can('manage', subject as any),
      canInvite: (subject: string) => ability.can('invite', subject as any),
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

export { RolePermissions } from '../shared/permissions';
