import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// CORS first
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

app.use(express.json());

// Debug middleware - capture ALL requests
app.use((req, res, next) => {
  console.log(`\n📍 ${req.method} ${req.url}`);
  next();
});

// Test endpoint - NOT async, just regular handler
app.post('/api/auth/login', (req: Request, res: Response) => {
  console.log('📥 Login request received!');
  console.log('📦 Body:', req.body);
  console.log('🔑 Auth header:', req.headers.authorization?.substring(0, 50));
  
  res.status(403).json({
    error: 'user_not_provisioned',
    message: 'Your account has not been provisioned.',
    email: 'test@example.com'
  });
});

// Add error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test API Server running on port ${PORT}`);
  console.log(`📝 POST http://localhost:${PORT}/api/auth/login\n`);
  console.log('✅ Server is listening...\n');
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// CRITICAL: Keep the process alive explicitly
setInterval(() => {
  // This keeps the event loop alive
}, 1000);

console.log('Press Ctrl+C to stop the server');

