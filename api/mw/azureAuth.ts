/**
 * Azure Authentication Middleware
 * 
 * Verifies JWT tokens from Azure B2C and normalizes claims for RBAC enforcement.
 * This middleware should be used before RBAC middleware.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// NOTE: Old claims-based auth removed for federated identity pattern
// normalizeClaims import removed - authorization context comes from database

// Extend Express Request type to include Azure user info
declare global {
  namespace Express {
    interface Request {
      azureUser?: {
        azure_id: string;
        email: string | null;
        customerType: string | null;
        userRole: string | null;
        organisationName: string | null;
        sourceClaimKey: string;
      };
    }
  }
}

interface AzureAuthConfig {
  issuer: string;
  audience: string;
  jwksUri?: string;
}

const config: AzureAuthConfig = {
  issuer: process.env.AZURE_B2C_ISSUER || 'https://dqproj.b2clogin.com/dqproj.onmicrosoft.com/v2.0/',
  audience: process.env.AZURE_B2C_CLIENT_ID || 'f996140d-d79b-419d-a64c-f211d23a38ad',
  jwksUri: process.env.AZURE_B2C_JWKS_URI
};

/**
 * Azure Authentication Middleware
 * Verifies JWT token and normalizes claims
 */
export async function azureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'missing_or_invalid_token',
        message: 'Authorization header with Bearer token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode JWT token
    const decoded = jwt.verify(token, config.audience, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['RS256', 'HS256']
    }) as Record<string, any>;

    // DEPRECATED: Old claims-based auth
    // For federated identity, use /api/auth/login endpoint instead
    
    // Extract only authentication info (not authorization)
    const azure_id = decoded.oid || decoded.sub || decoded.azure_id;
    const email = decoded.email || decoded.preferred_username || decoded.upn || '';
    
    req.azureUser = {
      azure_id,
      email,
      customerType: null,
      userRole: null,
      organisationName: null,
      sourceClaimKey: 'deprecated'
    };

    console.log('⚠️ azureAuthMiddleware: Claims-based auth deprecated - use federated identity pattern');

    next();
  } catch (error) {
    console.error('Azure auth middleware error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'invalid_token',
        message: 'Invalid or expired token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'token_expired',
        message: 'Token has expired'
      });
    }

    return res.status(500).json({
      error: 'internal_server_error',
      reason: 'auth_processing_error',
      message: 'Error processing authentication'
    });
  }
}

/**
 * Optional middleware for routes that don't require authentication
 * but benefit from user context when available
 */
export async function optionalAzureAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      return next();
    }

    // Use the main auth middleware logic but don't fail if token is invalid
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.audience, {
        issuer: config.issuer,
        audience: config.audience,
        algorithms: ['RS256', 'HS256']
      }) as Record<string, any>;

      // DEPRECATED: Old claims-based auth
      console.log('⚠️ optionalAzureAuthMiddleware: Claims-based auth deprecated');
    } catch (tokenError) {
      // Invalid token, but continue without user context
      console.warn('Optional auth: invalid token provided');
    }

    next();
  } catch (error) {
    console.error('Optional Azure auth middleware error:', error);
    next(); // Continue even if there's an error
  }
}
