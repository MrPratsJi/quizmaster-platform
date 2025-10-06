import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { globalErrorHandler, routeNotFoundHandler } from './middleware/validation';

const applicationServer = express();
const SERVER_PORT = process.env.PORT || 3000;

// Security and utility middleware configuration
applicationServer.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
})); // Enhanced security headers with relaxed CSP for test interfaces
applicationServer.use(cors()); // Cross-origin resource sharing enablement
applicationServer.use(morgan('combined')); // HTTP request logging
applicationServer.use(express.json({ limit: '10mb' })); // JSON payload parsing
applicationServer.use(express.urlencoded({ extended: true })); // URL-encoded payload parsing

// Static file serving configuration
applicationServer.use(express.static(path.join(__dirname, '../')));

// API route mounting
applicationServer.use('/api/v1', routes);

// Primary application endpoint
applicationServer.get('/', (req, res) => {
  res.json({
    message: 'Quiz Management System API',
    version: '1.0.0',
    endpoints: {
      healthCheck: '/api/v1/health',
      quizManagement: '/api/v1/quizzes',
      testInterface: '/test',
      documentation: 'See README.md for comprehensive API documentation'
    }
  });
});

// Interactive test interface endpoint
applicationServer.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-interface.html'));
});

// Simplified test endpoint
applicationServer.get('/simple-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../simple-test.html'));
});

// Global error handling middleware
applicationServer.use(routeNotFoundHandler);
applicationServer.use(globalErrorHandler);

// Server initialization and startup
if (process.env.NODE_ENV !== 'test') {
  applicationServer.listen(SERVER_PORT, () => {
    console.log(`🚀 Quiz Management API server is operational on port ${SERVER_PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${SERVER_PORT}`);
  });
}

export default applicationServer;