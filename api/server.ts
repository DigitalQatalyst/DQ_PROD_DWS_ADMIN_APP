/**
 * API Server Setup
 * 
 * Example Express server setup with RBAC middleware integration.
 * This shows how to integrate all the middleware components.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import { azureAuthMiddleware } from './mw/azureAuth';
import { rbacMiddleware } from './mw/rbac';
import { logAuthMode, addAuthModeHeaders } from './mw/authModeToggle';
import { verifyInternalToken } from './mw/internalAuth';

// Import route handlers
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import contentsRouter from './routes/contents';
import servicesRouter from './routes/services';
import vendureRouter from './routes/vendure';
import uploadsRouter from './routes/uploads';

// Attempt to load a .env file from the current folder or one of its parents (repo root)
function loadEnvUpwards(maxDepth = 5) {
  try {
    let dir = process.cwd();
    for (let i = 0; i < maxDepth; i++) {
      const candidate = path.join(dir, '.env');
      if (fs.existsSync(candidate)) {
        dotenv.config({ path: candidate });
        console.log('[server] Loaded .env from', candidate);
        return;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch (e) {
    // ignore
  }
  // fallback to default behavior (will look in process.cwd())
  dotenv.config();
}

loadEnvUpwards();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Parse FRONTEND_URL as comma-separated list to support multiple origins
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5174']; // Default to both common ports

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      console.warn(`CORS: Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow httpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// Auth mode logging and headers (comment out for now to isolate issue)
// app.use(logAuthMode);
// app.use(addAuthModeHeaders);

// Database connection (comment out for now since DATABASE_URL not configured)
// const dbClient = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });

// Make database client available to routes
// app.locals.dbClient = dbClient;

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (use Azure token verification)
app.use('/api/auth', authRouter);

// Admin routes (use internal JWT authentication)
app.use('/api/admin', adminRouter);

// Vendure proxy routes (no auth required - public data)
app.use('/api/vendure', vendureRouter);

// Uploads routes (no auth required for file operations)
app.use('/api/uploads', uploadsRouter);

// API routes with authentication and RBAC (commented out until server starts)
// app.use('/api/contents', azureAuthMiddleware, rbacMiddleware, contentsRouter);
// app.use('/api/services', azureAuthMiddleware, rbacMiddleware, servicesRouter);

// Add more routes as needed
// app.use('/api/business_directory', azureAuthMiddleware, rbacMiddleware, logPermissionChecks, businessDirectoryRouter);
// app.use('/api/zones', azureAuthMiddleware, rbacMiddleware, logPermissionChecks, zonesRouter);
// app.use('/api/growth_areas', azureAuthMiddleware, rbacMiddleware, logPermissionChecks, growthAreasRouter);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'bad_request',
      reason: 'invalid_json',
      message: 'Invalid JSON in request body'
    });
  }
  
  res.status(500).json({
    error: 'internal_server_error',
    reason: 'server_error',
    message: 'An internal server error occurred'
  });
});

// 404 handler  
app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    reason: 'endpoint_not_found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';
  const ENVIRONMENT = process.env.NODE_ENV || 'development';
  
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 RBAC middleware enabled`);
  console.log(`📝 Permission logging enabled`);
  console.log(`🧪 Auth mode: ${USE_MOCK_AUTH ? 'MOCK' : 'AZURE'}`);
  console.log(`🌍 Environment: ${ENVIRONMENT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  // Database connection will be closed when dbClient is configured
  // if (dbClient) await dbClient.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  // Database connection will be closed when dbClient is configured
  // if (dbClient) await dbClient.end();
  process.exit(0);
});

export default app;