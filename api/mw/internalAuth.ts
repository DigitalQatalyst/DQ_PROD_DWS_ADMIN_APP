/**
 * Internal JWT Authentication Middleware
 * 
 * Verifies internal JWT tokens issued by our backend that contain
 * local authorization context (organization_id, role, customer_type).
 * 
 * This replaces the Azure claim-based authorization system.
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface InternalJWTPayload {
  sub: string; // Local user ID
  organization_id: string;
  role: string;
  user_segment: string; // internal, partner, customer, advisor
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organization_id: string;
    role: string;
    user_segment: string;
  };
  headers: any;
  ip?: string;
  [key: string]: any;
}

/**
 * Verify internal JWT token from cookie or Authorization header
 */
export function verifyInternalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Try to get token from cookie first (preferred for httpOnly security)
    let token = req.cookies?.session_token;
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'missing_token',
        message: 'No session token provided'
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as InternalJWTPayload;

    // Attach user context to request
    req.user = {
      id: decoded.sub,
      organization_id: decoded.organization_id,
      role: decoded.role,
      user_segment: decoded.user_segment
    };

    // Set PostgreSQL context variables for RLS
    // These will be used by RLS policies to enforce organization isolation
    req.query = req.query || {};
    
    console.log('✅ Internal token verified:', {
      user_id: req.user.id,
      organization_id: req.user.organization_id,
      role: req.user.role,
      user_segment: req.user.user_segment
    });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'token_expired',
        message: 'Session token has expired. Please log in again.'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'unauthorized',
        reason: 'invalid_token',
        message: 'Invalid session token'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Error verifying session token'
    });
  }
}

/**
 * Issue new internal JWT token
 */
export function issueInternalToken(user: {
  id: string;
  organization_id: string;
  role: string;
  user_segment: string;
}): string {
  const payload: InternalJWTPayload = {
    sub: user.id,
    organization_id: user.organization_id,
    role: user.role,
    user_segment: user.user_segment,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
  };

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * Set the internal JWT token as an httpOnly cookie
 */
export function setTokenCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
}

export type { AuthenticatedRequest, InternalJWTPayload };
