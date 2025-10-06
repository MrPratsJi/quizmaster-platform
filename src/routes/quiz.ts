import { Router } from 'express';
import { QuizManagementController } from '../controllers/QuizManagementController';

const router = Router();
const quizManagementController = new QuizManagementController();

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