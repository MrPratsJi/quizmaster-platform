import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import your existing app components
import quizRoutes from '../src/routes/quiz';

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "*"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/v1', quizRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'QuizMaster Management API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve test interface for root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QuizMaster Management Platform API',
    version: '1.0.0',
    documentation: {
      health: '/api/v1/health',
      quizzes: '/api/v1/quizzes',
      testInterface: '/test'
    },
    endpoints: [
      'GET /api/v1/health - Health check',
      'GET /api/v1/quizzes - List all quizzes',
      'POST /api/v1/quizzes - Create new quiz',
      'POST /api/v1/quizzes/:id/questions - Add question',
      'POST /api/v1/quizzes/:id/submit - Submit answers'
    ]
  });
});

// Serve test interface
app.get('/test', (req, res) => {
  const testInterfacePath = path.join(__dirname, '..', 'test-interface.html');
  if (fs.existsSync(testInterfacePath)) {
    // Set CSP headers to allow inline scripts
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' *");
    res.sendFile(testInterfacePath);
  } else {
    // If file doesn't exist, serve a basic test interface
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' *");
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>QuizMaster Test Interface</title></head>
      <body>
        <h1>QuizMaster API Test Interface</h1>
        <p>API is running at: <a href="/api/v1/health">/api/v1/health</a></p>
        <p>Quizzes endpoint: <a href="/api/v1/quizzes">/api/v1/quizzes</a></p>
      </body>
      </html>
    `);
  }
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};