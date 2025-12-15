/**
 * Minimal API Server for Testing
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Import routes
import authRouter from './routes/auth.js';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRouter);

// 404 handler for debugging
app.use((req, res) => {
  console.error('❌ Route not found:', req.method, req.url);
  res.status(404).json({ 
    error: 'not_found', 
    path: req.url,
    method: req.method 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Auth login: http://localhost:${PORT}/api/auth/login`);
});

export default app;
