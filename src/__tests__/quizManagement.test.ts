import request from 'supertest';
import app from '../index';
import { QuizQuestionType } from '../models';

describe('Quiz Management API', () => {
  let quizIdentifier: string;
  let questionIdentifier: string;

  describe('POST /api/v1/quizzes', () => {
    it('should establish a new quiz system', async () => {
      const quizData = {
        title: 'Advanced TypeScript Concepts',
        description: 'A comprehensive quiz covering TypeScript fundamentals'
      };

      const response = await request(app)
        .post('/api/v1/quizzes')
        .send(quizData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('quizId');
      expect(response.body.data.quizTitle).toBe(quizData.title);
      expect(response.body.data.quizDescription).toBe(quizData.description);
      
      quizIdentifier = response.body.data.quizId;
    });

    it('should return 400 for invalid quiz establishment data', async () => {
      const response = await request(app)
        .post('/api/v1/quizzes')
        .send({ title: 'X' }) // Too short title
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quizzes', () => {
    it('should retrieve all quiz collections', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/quizzes/:quizId', () => {
    it('should locate specific quiz by identifier', async () => {
      const response = await request(app)
        .get(`/api/v1/quizzes/${quizIdentifier}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('quizId');
      expect(response.body.data.quizId).toBe(quizIdentifier);
    });

    it('should return 404 for non-existent quiz identifier', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes/non-existent-identifier')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/quizzes/:quizId/questions', () => {
    it('should attach single selection question to quiz', async () => {
      const questionData = {
        text: 'What is the primary benefit of TypeScript over JavaScript?',
        type: QuizQuestionType.SINGLE_SELECT,
        options: [
          { text: 'Type safety and better tooling', isCorrect: true },
          { text: 'Faster execution speed', isCorrect: false },
          { text: 'Smaller file sizes', isCorrect: false },
          { text: 'Built-in testing framework', isCorrect: false }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('questionId');
      expect(response.body.data.questionText).toBe(questionData.text);
      expect(response.body.data.questionType).toBe(QuizQuestionType.SINGLE_SELECT);
      
      questionIdentifier = response.body.data.questionId;
    });

    it('should attach multiple selection question to quiz', async () => {
      const questionData = {
        text: 'Which of the following are valid TypeScript features?',
        type: QuizQuestionType.MULTI_SELECT,
        options: [
          { text: 'Interface definitions', isCorrect: true },
          { text: 'Generic types', isCorrect: true },
          { text: 'Automatic memory management', isCorrect: false },
          { text: 'Union types', isCorrect: true }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.questionType).toBe(QuizQuestionType.MULTI_SELECT);
    });

    it('should attach open text question to quiz', async () => {
      const questionData = {
        text: 'Explain the concept of type inference in TypeScript',
        type: QuizQuestionType.OPEN_TEXT,
        options: [
          { text: 'automatic', isCorrect: true },
          { text: 'inference', isCorrect: true },
          { text: 'type', isCorrect: true }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.questionType).toBe(QuizQuestionType.OPEN_TEXT);
    });

    it('should return 400 for invalid question structure', async () => {
      const invalidQuestionData = {
        text: 'Invalid question with multiple correct answers for single choice',
        type: QuizQuestionType.SINGLE_SELECT,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: true } // Invalid: multiple correct answers for single select
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/questions`)
        .send(invalidQuestionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent quiz identifier', async () => {
      const questionData = {
        text: 'Test question for non-existent quiz',
        type: QuizQuestionType.SINGLE_SELECT,
        options: [
          { text: 'Answer', isCorrect: true }
        ]
      };

      const response = await request(app)
        .post('/api/v1/quizzes/non-existent-identifier/questions')
        .send(questionData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quizzes/:quizId/questions', () => {
    it('should fetch participant questions without answer keys', async () => {
      const response = await request(app)
        .get(`/api/v1/quizzes/${quizIdentifier}/questions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('quiz');
      expect(response.body.data).toHaveProperty('questions');
      expect(Array.isArray(response.body.data.questions)).toBe(true);
      expect(response.body.data.questions.length).toBeGreaterThan(0);
      
      // Verify that correct answers are not exposed to participants
      const firstQuestion = response.body.data.questions[0];
      expect(firstQuestion.availableChoices[0]).not.toHaveProperty('isValidAnswer');
      expect(firstQuestion.availableChoices[0]).toHaveProperty('choiceText');
    });

    it('should return 404 for non-existent quiz identifier', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes/non-existent-identifier/questions')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/quizzes/:quizId/submit', () => {
    it('should process quiz submission and return scoring results', async () => {
      // First, get the questions to know the correct answer IDs
      const questionsResponse = await request(app)
        .get(`/api/v1/quizzes/${quizIdentifier}/questions`);
      
      const questions = questionsResponse.body.data.questions;
      const singleSelectQuestion = questions.find((q: any) => q.questionType === QuizQuestionType.SINGLE_SELECT);
      const multiSelectQuestion = questions.find((q: any) => q.questionType === QuizQuestionType.MULTI_SELECT);
      const openTextQuestion = questions.find((q: any) => q.questionType === QuizQuestionType.OPEN_TEXT);

      const submissionData = [
        {
          questionId: singleSelectQuestion.questionId,
          selectedOptionId: singleSelectQuestion.availableChoices[0].choiceId
        },
        {
          questionId: multiSelectQuestion.questionId,
          selectedOptionIds: [
            multiSelectQuestion.availableChoices[0].choiceId,
            multiSelectQuestion.availableChoices[1].choiceId
          ]
        },
        {
          questionId: openTextQuestion.questionId,
          textAnswer: 'TypeScript provides automatic type inference for variables'
        }
      ];

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/submit`)
        .send(submissionData)
        .expect(200);

      expect(response.body).toHaveProperty('finalScore');
      expect(response.body).toHaveProperty('maxPossibleScore');
      expect(typeof response.body.finalScore).toBe('number');
      expect(typeof response.body.maxPossibleScore).toBe('number');
    });

    it('should return 400 for invalid submission structure', async () => {
      const invalidSubmission = [
        {
          // Missing questionId
          selectedOptionId: 'some-id'
        }
      ];

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizIdentifier}/submit`)
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent quiz identifier', async () => {
      const submissionData = [
        {
          questionId: 'some-question-id',
          selectedOptionId: 'some-option-id'
        }
      ];

      const response = await request(app)
        .post('/api/v1/quizzes/non-existent-identifier/submit')
        .send(submissionData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Quiz Management Workflow Integration', () => {
    it('should complete full quiz lifecycle workflow', async () => {
      // Step 1: Establish new quiz
      const newQuizResponse = await request(app)
        .post('/api/v1/quizzes')
        .send({
          title: 'Complete Workflow Test Quiz',
          description: 'Testing the entire quiz management workflow'
        })
        .expect(201);

      const workflowQuizId = newQuizResponse.body.data.quizId;

      // Step 2: Attach question to the quiz
      await request(app)
        .post(`/api/v1/quizzes/${workflowQuizId}/questions`)
        .send({
          text: 'What is the result of 2 + 2?',
          type: QuizQuestionType.SINGLE_SELECT,
          options: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false }
          ]
        })
        .expect(201);

      // Step 3: Retrieve questions for participants
      const participantQuestionsResponse = await request(app)
        .get(`/api/v1/quizzes/${workflowQuizId}/questions`)
        .expect(200);

      const participantQuestions = participantQuestionsResponse.body.data.questions;
      expect(participantQuestions.length).toBe(1);

      // Step 4: Submit quiz responses
      const submissionResponse = await request(app)
        .post(`/api/v1/quizzes/${workflowQuizId}/submit`)
        .send([
          {
            questionId: participantQuestions[0].questionId,
            selectedOptionId: participantQuestions[0].availableChoices[0].choiceId
          }
        ])
        .expect(200);

      // Step 5: Verify scoring results
      expect(submissionResponse.body.finalScore).toBeDefined();
      expect(submissionResponse.body.maxPossibleScore).toBe(1);
    });
  });
});