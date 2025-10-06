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
app.use(helmet());
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
  const testInterfacePath = path.join(__dirname, '..', 'test-interface.html');
  if (fs.existsSync(testInterfacePath)) {
    res.sendFile(testInterfacePath);
  } else {
    res.json({
      success: true,
      message: 'QuizMaster Management Platform API',
      version: '1.0.0',
      documentation: {
        health: '/api/v1/health',
        quizzes: '/api/v1/quizzes',
        testInterface: '/test'
      }
    });
  }
});

// Serve test interface
app.get('/test', (req, res) => {
  const testInterfacePath = path.join(__dirname, '..', 'test-interface.html');
  if (fs.existsSync(testInterfacePath)) {
    res.sendFile(testInterfacePath);
  } else {
    res.status(404).json({ error: 'Test interface not found' });
  }
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};