/**
 * CASL Enforcement Middleware
 * 
 * Provides middleware for Express routes that enforces CASL permissions.
 * Uses the canonical action vocabulary from src/shared/permissions.ts.
 * 
 * This replaces the legacy checkPermission middleware with CASL's standard
 * ForbiddenError pattern for consistent error handling.
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@casl/ability';
import { buildServerAbility } from '../ability';
// Backend imports from frontend shared permissions
// @ts-ignore - Importing from outside api/ directory
import { Action, Subject } from '../../src/shared/permissions';

// Extend Express Request to include ability
declare global {
  namespace Express {
    interface Request {
      ability?: ReturnType<typeof buildServerAbility>;
    }
  }
}

/**
 * Middleware to require specific ability
 * 
 * @param action - Required action from canonical Actions
 * @param subject - Required subject from canonical Subjects
 * @returns Express middleware function
 * 
 * @example
 * router.post('/content', requireAbility('create', 'Content'), handler);
 * router.put('/content/:id', requireAbility('update', 'Content'), handler);
 * router.put('/content/:id/publish', requireAbility('publish', 'Content'), handler);
 */
export function requireAbility(action: Action, subject: Subject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure RBAC context exists
      if (!req.rbacContext) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'RBAC context not available'
        });
      }

      // Build ability for this user
      const ability = buildServerAbility({
        role: req.rbacContext.userRole,
        customerType: req.rbacContext.customerType,
        organizationId: req.rbacContext.orgId,
        id: req.rbacContext.userId
      });

      // Attach ability to request for potential use in handlers
      req.ability = ability;

      // Check permission using CASL's standard pattern
      ForbiddenError.from(ability).throwUnlessCan(action, subject);

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          error: 'forbidden',
          reason: 'insufficient_permissions',
          message: `You don't have permission to ${action} ${subject.toLowerCase()}s`,
          required: { action, subject }
        });
      }

      // Re-throw unexpected errors
      throw error;
    }
  };
}

/**
 * Middleware to require ANY of the specified abilities
 * 
 * @param permissions - Array of action-subject pairs
 * @returns Express middleware function
 * 
 * @example
 * router.get('/dashboard', requireAnyAbility([
 *   ['read', 'Content'],
 *   ['read', 'Service']
 * ]), handler);
 */
export function requireAnyAbility(permissions: Array<[Action, Subject]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.rbacContext) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'RBAC context not available'
        });
      }

      const ability = buildServerAbility({
        role: req.rbacContext.userRole,
        customerType: req.rbacContext.customerType,
        organizationId: req.rbacContext.orgId,
        id: req.rbacContext.userId
      });

      req.ability = ability;

      // Check if user has ANY of the required permissions
      const hasAnyPermission = permissions.some(([action, subject]) =>
        ability.can(action, subject)
      );

      if (!hasAnyPermission) {
        throw new ForbiddenError('manage', 'all');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          error: 'forbidden',
          reason: 'insufficient_permissions',
          message: 'Insufficient permissions for this operation',
          required: permissions
        });
      }

      throw error;
    }
  };
}

/**
 * Middleware to require ALL of the specified abilities
 * 
 * @param permissions - Array of action-subject pairs
 * @returns Express middleware function
 * 
 * @example
 * router.get('/admin', requireAllAbilities([
 *   ['manage', 'Content'],
 *   ['manage', 'Service']
 * ]), handler);
 */
export function requireAllAbilities(permissions: Array<[Action, Subject]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.rbacContext) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'RBAC context not available'
        });
      }

      const ability = buildServerAbility({
        role: req.rbacContext.userRole,
        customerType: req.rbacContext.customerType,
        organizationId: req.rbacContext.orgId,
        id: req.rbacContext.userId
      });

      req.ability = ability;

      // Check if user has ALL of the required permissions
      const hasAllPermissions = permissions.every(([action, subject]) =>
        ability.can(action, subject)
      );

      if (!hasAllPermissions) {
        throw new ForbiddenError('manage', 'all');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          error: 'forbidden',
          reason: 'insufficient_permissions',
          message: 'Insufficient permissions for this operation',
          required: permissions
        });
      }

      throw error;
    }
  };
}
