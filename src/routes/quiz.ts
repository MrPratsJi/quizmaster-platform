import { Router } from 'express';
import { QuizManagementController } from '../controllers/QuizManagementController';

const router = Router();
const quizManagementController = new QuizManagementController();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QuizMaster Management API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Quiz establishment and management routes
router.post('/', quizManagementController.establishQuiz);
router.get('/', quizManagementController.retrieveQuizCollection);
router.get('/:quizId', quizManagementController.locateQuizByIdentifier);

// Question attachment and retrieval routes
router.post('/:quizId/questions', quizManagementController.attachQuestionToQuiz);
router.get('/:quizId/questions', quizManagementController.fetchParticipantQuestions);

// Quiz submission processing route
router.post('/:quizId/submit', quizManagementController.processQuizSubmission);

export default router;