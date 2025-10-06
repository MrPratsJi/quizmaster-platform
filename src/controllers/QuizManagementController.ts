import { Request, Response } from 'express';
import QuizManagementService from '../services/QuizService';
import { QuizQuestionType } from '../models';
import { validateCreateQuiz, validateCreateQuestion, validateSubmitQuiz } from '../validators/schemas';

export class QuizManagementController {
  // Establish a new quiz endpoint
  establishQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = validateCreateQuiz(req.body);
      if (validation.error) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      const { title, description } = req.body;
      
      const newQuiz = QuizManagementService.establishNewQuiz(title, description);
      
      res.status(201).json({
        success: true,
        data: newQuiz,
        message: 'Quiz established successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Retrieve all quizzes collection
  retrieveQuizCollection = async (req: Request, res: Response): Promise<void> => {
    try {
      const allQuizzes = QuizManagementService.retrieveAllQuizzes();
      
      res.status(200).json({
        success: true,
        data: allQuizzes,
        count: allQuizzes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Locate quiz by unique identifier
  locateQuizByIdentifier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        res.status(400).json({
          success: false,
          message: 'Quiz identifier is required'
        });
        return;
      }
      
      const targetQuiz = QuizManagementService.findQuizByIdentifier(quizId);
      
      if (!targetQuiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz not located'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: targetQuiz
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Attach question to specific quiz
  attachQuestionToQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        res.status(400).json({
          success: false,
          message: 'Quiz identifier is required'
        });
        return;
      }

      // First check if quiz exists
      const targetQuiz = QuizManagementService.findQuizByIdentifier(quizId);
      if (!targetQuiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz not located'
        });
        return;
      }

      const validation = validateCreateQuestion(req.body);
      if (validation.error) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      const { text, type, options } = req.body;

      const newQuestion = QuizManagementService.attachQuestionToQuiz(quizId, text, type as QuizQuestionType, options);
      
      res.status(201).json({
        success: true,
        data: newQuestion,
        message: 'Question attached successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Fetch quiz questions for participants
  fetchParticipantQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        res.status(400).json({
          success: false,
          message: 'Quiz identifier is required'
        });
        return;
      }
      
      const targetQuiz = QuizManagementService.findQuizByIdentifier(quizId);
      if (!targetQuiz) {
        res.status(404).json({
          success: false,
          message: 'Quiz not located'
        });
        return;
      }

      const participantQuestions = QuizManagementService.getParticipantQuestions(quizId);
      
      res.status(200).json({
        success: true,
        data: {
          quiz: {
            quizId: targetQuiz.quizId,
            quizTitle: targetQuiz.quizTitle,
            quizDescription: targetQuiz.quizDescription
          },
          questions: participantQuestions
        },
        count: participantQuestions.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Process quiz submission and calculate results
  processQuizSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        res.status(400).json({
          success: false,
          message: 'Quiz identifier is required'
        });
        return;
      }

      const validation = validateSubmitQuiz(req.body);
      if (validation.error) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      const userResponses = req.body; // Direct array now
      
      const evaluationResult = QuizManagementService.processQuizSubmission(quizId, userResponses);
      
      if (!evaluationResult) {
        res.status(404).json({
          success: false,
          message: 'Quiz not located or contains no questions'
        });
        return;
      }
      
      res.status(200).json({
        finalScore: evaluationResult.finalScore,
        maxPossibleScore: evaluationResult.maxPossibleScore
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}