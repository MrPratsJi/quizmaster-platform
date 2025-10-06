import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import your existing app components
import { QuizManagementController } from '../src/controllers/QuizManagementController';

console.log('Starting API setup...');

const app = express();
const quizController = new QuizManagementController();

console.log('Controllers initialized');

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

// Direct API routes instead of using the router
console.log('Setting up direct routes...');

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check hit');
  res.json({
    success: true,
    message: 'QuizMaster Management API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Quiz routes
app.post('/api/v1/quizzes', (req, res) => {
  console.log('POST /api/v1/quizzes hit');
  quizController.establishQuiz(req, res);
});

app.get('/api/v1/quizzes', (req, res) => {
  console.log('GET /api/v1/quizzes hit');
  quizController.retrieveQuizCollection(req, res);
});

app.get('/api/v1/quizzes/:quizId', (req, res) => {
  console.log('GET /api/v1/quizzes/:quizId hit');
  quizController.locateQuizByIdentifier(req, res);
});

app.post('/api/v1/quizzes/:quizId/questions', (req, res) => {
  console.log('POST /api/v1/quizzes/:quizId/questions hit');
  quizController.attachQuestionToQuiz(req, res);
});

app.get('/api/v1/quizzes/:quizId/questions', (req, res) => {
  console.log('GET /api/v1/quizzes/:quizId/questions hit');
  quizController.fetchParticipantQuestions(req, res);
});

app.post('/api/v1/quizzes/:quizId/submit', (req, res) => {
  console.log('POST /api/v1/quizzes/:quizId/submit hit');
  quizController.processQuizSubmission(req, res);
});

console.log('Direct routes setup complete');

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