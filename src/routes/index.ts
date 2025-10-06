import { Router } from 'express';
import quizRoutes from './quiz';

const router = Router();

// API routes
router.use('/quizzes', quizRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Quiz API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;