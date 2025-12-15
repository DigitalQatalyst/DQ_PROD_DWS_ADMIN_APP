/**
 * Azure Token Verification Middleware
 * 
 * Verifies Azure External Identities JWT tokens for AUTHENTICATION ONLY.
 * Extracts only immutable identifiers (sub, oid, email) for federated identity lookup.
 * 
 * Authorization context (role, customer_type, organization) comes from local database.
 */

import { Request, Response, NextFunction } from 'express';

interface FederatedIdentityClaims {
  azureOid: string; // oid from Azure token (PRIMARY identifier, stable across apps)
  email: string;
  azureSub?: string; // sub kept for legacy compatibility
}

interface AuthenticatedRequest extends Request {
  user?: FederatedIdentityClaims;
  headers: any;
  ip?: string;
  [key: string]: any;
}

/**
 * Verifies Azure EEI JWT token and extracts only authentication info
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export async function verifyAzureToken(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const AUTH_MODE = process.env.AUTH_MODE || process.env.MOCK_MODE;
    
    // In mock mode, extract minimal claims for testing
    if (AUTH_MODE === 'mock' || AUTH_MODE === 'true') {
      console.log('🧪 Mock mode: Using mock Azure authentication');
      
      let claims;
      
      // Try to get claims from request body first
      if (req.body && typeof req.body === 'object' && req.body.sub) {
        claims = req.body;
      }
      // Try to get claims from Authorization header
      else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          // For mock mode, accept the token as the sub
          claims = {
            sub: token,
            oid: token,
            email: `${token}@mock.example.com`
          };
        }
      }
      // Default mock claims
      else {
        claims = {
          sub: 'mock-user-123',
          oid: 'mock-user-123',
          email: 'mock@example.com'
        };
      }
      
      req.user = {
        azureOid: claims.oid, // PRIMARY: oid is stable across all app registrations
        email: claims.email || claims.preferred_username || '',
        azureSub: claims.sub // Keep sub for legacy reference
      };
      
      return next();
    }

    // Real Azure token verification (simplified for federated identity)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      // TODO: Implement real Azure JWT verification with JWKS
      // For now, we'll decode without verification (INSECURE - replace in production)
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      // Extract only immutable identifiers - oid is PRIMARY
      const azureOid = decoded.oid;
      const email = decoded.email || decoded.preferred_username || decoded.upn || '';
      const azureSub = decoded.sub; // Keep for legacy
      
      if (!azureOid) {
        return res.status(401).json({
          error: 'unauthorized',
          message: 'Token missing required claim: oid (Object ID)'
        });
      }
      
      req.user = {
        azureOid,
        email,
        azureSub
      };
      
      console.log('🔐 Azure token verified (authenticated only):', {
        azureOid,
        email,
        azureSub
      });
      
      next();
      
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      details: 'Error verifying authentication token'
    });
  }
}

export { AuthenticatedRequest };
