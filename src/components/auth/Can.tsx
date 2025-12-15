/**
 * CASL Can Component Wrapper
 * 
 * A reusable component that wraps CASL's Can component for conditional rendering
 * based on user abilities. Provides type-safe permission checking in the UI.
 */

import React from 'react';
import { Can as CaslCan } from '@casl/react';
import { useAbility } from '../../hooks/useAbility';
import { Actions, Subjects } from '../../auth/ability';

interface CanProps {
  /** Action to check permission for */
  I: Actions;
  /** Subject to check permission for */
  a: Subjects;
  /** Children to render if permission is granted */
  children: React.ReactNode;
  /** Fallback content to render if permission is denied */
  fallback?: React.ReactNode;
  /** Additional props to pass to the Can component */
  [key: string]: any;
}

/**
 * Can component for conditional rendering based on user abilities
 * 
 * @example
 * ```tsx
 * <Can I="update" a="Service">
 *   <Button>Edit Service</Button>
 * </Can>
 * 
 * <Can I="create" a="Content" fallback={<div>No permission</div>}>
 *   <Button>Create Content</Button>
 * </Can>
 * ```
 */
export const Can: React.FC<CanProps> = ({ 
  I, 
  a, 
  children, 
  fallback = null, 
  ...props 
}) => {
  const ability = useAbility();

  return (
    <CaslCan I={I} a={a} ability={ability} {...props}>
      {children}
    </CaslCan>
  );
};

/**
 * Cannot component for conditional rendering when permission is denied
 * 
 * @example
 * ```tsx
 * <Cannot I="delete" a="Service">
 *   <div>You cannot delete services</div>
 * </Cannot>
 * ```
 */
export const Cannot: React.FC<CanProps> = ({ 
  I, 
  a, 
  children, 
  fallback = null, 
  ...props 
}) => {
  const ability = useAbility();

  return (
    <CaslCan I={I} a={a} ability={ability} not {...props}>
      {children}
    </CaslCan>
  );
};

/**
 * Higher-order component for protecting components based on abilities
 * 
 * @param WrappedComponent - Component to wrap
 * @param requiredAction - Required action
 * @param requiredSubject - Required subject
 * @param fallback - Fallback component to render if permission denied
 */
export function withAbility<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredAction: Actions,
  requiredSubject: Subjects,
  fallback?: React.ComponentType
) {
  return function AbilityProtectedComponent(props: T) {
    return (
      <Can I={requiredAction} a={requiredSubject} fallback={fallback ? <fallback /> : null}>
        <WrappedComponent {...props} />
      </Can>
    );
  };
}

/**
 * Hook for checking abilities in functional components
 * 
 * @example
 * ```tsx
 * const { canCreate, canUpdate, canDelete } = useAbilities();
 * 
 * if (canCreate('Service')) {
 *   // Show create button
 * }
 * ```
 */
export function useAbilities() {
  const ability = useAbility();

  return {
    can: (action: Actions, subject: Subjects) => ability.can(action, subject),
    cannot: (action: Actions, subject: Subjects) => ability.cannot(action, subject),
    canCreate: (subject: Subjects) => ability.can('create', subject),
    canRead: (subject: Subjects) => ability.can('read', subject),
    canUpdate: (subject: Subjects) => ability.can('update', subject),
    canDelete: (subject: Subjects) => ability.can('delete', subject),
    canApprove: (subject: Subjects) => ability.can('approve', subject),
    canManage: (subject: Subjects) => ability.can('manage', subject),
  };
}

export default Can;
