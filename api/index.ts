import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import your existing app components
import quizRoutes from '../src/routes/quiz';

console.log('Quiz routes imported:', typeof quizRoutes);

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

// Add middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
console.log('Registering quiz routes...');
app.use('/api/v1', quizRoutes);
console.log('Quiz routes registered successfully');

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

// Catch-all handler for debugging (must be last)
app.use('*', (req, res) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/v1/health',
      'GET /api/v1/quizzes',
      'POST /api/v1/quizzes',
      'GET /test'
    ]
  });
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};