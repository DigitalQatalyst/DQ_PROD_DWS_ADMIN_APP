/**
 * useAbility Hook
 * 
 * Custom hook that provides access to the CASL ability instance from the AuthContext.
 * This hook should be used in components that need to check user abilities.
 */

import { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppAbility } from '../auth/ability';
import { createMongoAbility } from '@casl/ability';

/**
 * Hook to access the current user's ability instance
 * 
 * @returns CASL ability instance
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const ability = useAbility();
 * 
 * if (ability.can('create', 'Service')) {
 *   // User can create services
 * }
 * ```
 */
export function useAbility(): AppAbility {
  const context = useAuth();
  
  if (!context) {
    throw new Error('useAbility must be used within an AuthProvider');
  }
  
  const { ability } = context;
  
  return ability;
}
