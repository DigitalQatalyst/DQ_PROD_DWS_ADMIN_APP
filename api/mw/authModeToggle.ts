/**
 * Auth Mode Toggle Middleware
 * 
 * DEPRECATED: Use internalAuth.ts for federated identity pattern
 * This middleware is kept for backward compatibility only
 */

import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
  azureUser?: any;
  rbacContext?: any;
  [key: string]: any;
}

/**
 * Middleware to verify requests with auth mode toggle
 * DEPRECATED: All auth should go through /api/auth/login endpoint
 */
export async function verifyRequest(_req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  console.log('⚠️ authModeToggle middleware called - deprecated, use federated identity pattern');
  
  // For federated identity, authentication is handled by:
  // 1. AzureAuthWrapper calls /api/auth/login
  // 2. Backend issues internal JWT
  // 3. API routes use verifyInternalToken middleware
  
  return next();
}

/**
 * Middleware to log auth mode information
 */
export function logAuthMode(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = process.env.NODE_ENV || 'development';

  console.log('🔍 Request auth info:', {
    authMode: USE_MOCK_AUTH ? 'mock' : 'azure',
    environment: ENVIRONMENT,
    userAgent: req?.headers?.['user-agent'],
    ip: req?.ip
  });

  next();
}

/**
 * Middleware to add auth mode headers to response
 */
export function addAuthModeHeaders(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = process.env.NODE_ENV || 'development';

  res.setHeader('X-Auth-Mode', USE_MOCK_AUTH ? 'mock' : 'azure');
  res.setHeader('X-Environment', ENVIRONMENT);

  next();
}

/**
 * DEPRECATED: Mock user generation removed for federated identity pattern
 */

export default {
  verifyRequest,
  logAuthMode,
  addAuthModeHeaders
};
