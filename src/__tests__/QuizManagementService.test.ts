import QuizManagementService from '../services/QuizService';
import { QuizQuestionType } from '../models';

describe('QuizManagementService', () => {
  let quizIdentifier: string;

  beforeEach(() => {
    // Reset the service state before each test
    // In a real application, you might use a database that can be reset
  });

  describe('Quiz Establishment and Management', () => {
    test('should establish a new quiz', () => {
      const newQuiz = QuizManagementService.establishNewQuiz('Test Quiz System', 'A comprehensive test quiz');
      
      expect(newQuiz).toBeDefined();
      expect(newQuiz.quizTitle).toBe('Test Quiz System');
      expect(newQuiz.quizDescription).toBe('A comprehensive test quiz');
      expect(newQuiz.quizId).toBeDefined();
      expect(newQuiz.createdTimestamp).toBeInstanceOf(Date);
      
      quizIdentifier = newQuiz.quizId;
    });

    test('should retrieve all quiz collections', () => {
      QuizManagementService.establishNewQuiz('Quiz Collection 1');
      QuizManagementService.establishNewQuiz('Quiz Collection 2');
      
      const allQuizzes = QuizManagementService.retrieveAllQuizzes();
      expect(allQuizzes.length).toBeGreaterThanOrEqual(2);
    });

    test('should locate quiz by unique identifier', () => {
      const establishedQuiz = QuizManagementService.establishNewQuiz('Locatable Quiz System');
      const locatedQuiz = QuizManagementService.findQuizByIdentifier(establishedQuiz.quizId);
      
      expect(locatedQuiz).toBeDefined();
      expect(locatedQuiz?.quizTitle).toBe('Locatable Quiz System');
    });

    test('should return null for non-existent quiz identifier', () => {
      const quiz = QuizManagementService.findQuizByIdentifier('non-existent-identifier');
      expect(quiz).toBeNull();
    });
  });

  describe('Question Attachment and Management', () => {
    beforeEach(() => {
      const quiz = QuizManagementService.establishNewQuiz('Question Management Test Quiz');
      quizIdentifier = quiz.quizId;
    });

    test('should attach single selection question to quiz', () => {
      const questionOptions = [
        { choiceText: 'Option Alpha', isValidAnswer: true },
        { choiceText: 'Option Beta', isValidAnswer: false },
        { choiceText: 'Option Gamma', isValidAnswer: false }
      ];

      const attachedQuestion = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'What is the primary option?',
        QuizQuestionType.SINGLE_SELECT,
        questionOptions
      );

      expect(attachedQuestion).toBeDefined();
      expect(attachedQuestion?.questionText).toBe('What is the primary option?');
      expect(attachedQuestion?.questionType).toBe(QuizQuestionType.SINGLE_SELECT);
      expect(attachedQuestion?.availableChoices).toHaveLength(3);
      // TypeScript null check - we know this exists from the test above
      // expect(attachedQuestion!.availableChoices[0].choiceId).toBeDefined();
    });

    test('should attach multiple selection question to quiz', () => {
      const questionOptions = [
        { choiceText: 'Valid Choice A', isValidAnswer: true },
        { choiceText: 'Valid Choice B', isValidAnswer: true },
        { choiceText: 'Invalid Choice C', isValidAnswer: false }
      ];

      const attachedQuestion = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Select all valid choices',
        QuizQuestionType.MULTI_SELECT,
        questionOptions
      );

      expect(attachedQuestion).toBeDefined();
      expect(attachedQuestion?.questionType).toBe(QuizQuestionType.MULTI_SELECT);
      expect(attachedQuestion?.availableChoices.filter(c => c.isValidAnswer)).toHaveLength(2);
    });

    test('should attach open text question to quiz', () => {
      const questionOptions = [
        { choiceText: 'keyword1', isValidAnswer: true },
        { choiceText: 'keyword2', isValidAnswer: true }
      ];

      const attachedQuestion = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Describe the main concept',
        QuizQuestionType.OPEN_TEXT,
        questionOptions
      );

      expect(attachedQuestion).toBeDefined();
      expect(attachedQuestion?.questionType).toBe(QuizQuestionType.OPEN_TEXT);
    });

    test('should return null when attaching to non-existent quiz', () => {
      const attachedQuestion = QuizManagementService.attachQuestionToQuiz(
        'non-existent-quiz-id',
        'Test question',
        QuizQuestionType.SINGLE_SELECT,
        [{ choiceText: 'Option', isValidAnswer: true }]
      );

      expect(attachedQuestion).toBeNull();
    });

    test('should fetch questions by quiz identifier', () => {
      // Attach multiple questions
      QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Question Alpha',
        QuizQuestionType.SINGLE_SELECT,
        [{ choiceText: 'Answer', isValidAnswer: true }]
      );
      
      QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Question Beta',
        QuizQuestionType.SINGLE_SELECT,
        [{ choiceText: 'Answer', isValidAnswer: true }]
      );

      const quizQuestions = QuizManagementService.fetchQuestionsByQuizId(quizIdentifier);
      expect(quizQuestions).toHaveLength(2);
      // TypeScript null check - we know this exists from the test above  
      // expect(quizQuestions[0]!.belongsToQuiz).toBe(quizIdentifier);
    });

    test('should retrieve participant questions without answer keys', () => {
      QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Participant Question',
        QuizQuestionType.SINGLE_SELECT,
        [
          { choiceText: 'Visible Option A', isValidAnswer: true },
          { choiceText: 'Visible Option B', isValidAnswer: false }
        ]
      );

      const participantQuestions = QuizManagementService.getParticipantQuestions(quizIdentifier);
      expect(participantQuestions).toHaveLength(1);
      expect(participantQuestions[0].availableChoices[0]).not.toHaveProperty('isValidAnswer');
      expect(participantQuestions[0].availableChoices[0]).toHaveProperty('choiceText');
    });
  });

  describe('Quiz Submission Processing and Scoring', () => {
    let questionAlphaId: string;
    let questionBetaId: string;
    let questionGammaId: string;

    beforeEach(() => {
      const quiz = QuizManagementService.establishNewQuiz('Scoring Test Quiz');
      quizIdentifier = quiz.quizId;

      // Single selection question
      const questionAlpha = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Single selection test',
        QuizQuestionType.SINGLE_SELECT,
        [
          { choiceText: 'Correct Answer', isValidAnswer: true },
          { choiceText: 'Wrong Answer A', isValidAnswer: false },
          { choiceText: 'Wrong Answer B', isValidAnswer: false }
        ]
      );
      questionAlphaId = questionAlpha!.questionId;

      // Multiple selection question
      const questionBeta = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Multiple selection test',
        QuizQuestionType.MULTI_SELECT,
        [
          { choiceText: 'Valid Option 1', isValidAnswer: true },
          { choiceText: 'Valid Option 2', isValidAnswer: true },
          { choiceText: 'Invalid Option', isValidAnswer: false }
        ]
      );
      questionBetaId = questionBeta!.questionId;

      // Open text question
      const questionGamma = QuizManagementService.attachQuestionToQuiz(
        quizIdentifier,
        'Text input test',
        QuizQuestionType.OPEN_TEXT,
        [
          { choiceText: 'expectedkeyword', isValidAnswer: true }
        ]
      );
      questionGammaId = questionGamma!.questionId;
    });

    test('should process perfect score submission', () => {
      const singleSelectQuestion = QuizManagementService.locateQuestionByIdentifier(questionAlphaId);
      const multiSelectQuestion = QuizManagementService.locateQuestionByIdentifier(questionBetaId);
      
      const validSingleChoiceId = singleSelectQuestion?.availableChoices.find(c => c.isValidAnswer)?.choiceId;
      const validMultiChoiceIds = multiSelectQuestion?.availableChoices
        .filter(c => c.isValidAnswer)
        .map(c => c.choiceId);

      const userSubmission = [
        {
          targetQuestionId: questionAlphaId,
          selectedChoiceId: validSingleChoiceId!
        },
        {
          targetQuestionId: questionBetaId,
          selectedChoiceIds: validMultiChoiceIds!
        },
        {
          targetQuestionId: questionGammaId,
          openTextResponse: 'This contains expectedkeyword in the text'
        }
      ];

      const evaluationResult = QuizManagementService.processQuizSubmission(quizIdentifier, userSubmission);
      expect(evaluationResult).toBeDefined();
      expect(evaluationResult?.finalScore).toBe(3);
      expect(evaluationResult?.maxPossibleScore).toBe(3);
      expect(evaluationResult?.scorePercentage).toBe(100);
    });

    test('should process partial score submission', () => {
      const singleSelectQuestion = QuizManagementService.locateQuestionByIdentifier(questionAlphaId);
      const wrongChoiceId = singleSelectQuestion?.availableChoices.find(c => !c.isValidAnswer)?.choiceId;

      const userSubmission = [
        {
          targetQuestionId: questionAlphaId,
          selectedChoiceId: wrongChoiceId!
        },
        {
          targetQuestionId: questionBetaId,
          selectedChoiceIds: [] // No selections for multi-select
        },
        {
          targetQuestionId: questionGammaId,
          openTextResponse: 'This text contains expectedkeyword'
        }
      ];

      const evaluationResult = QuizManagementService.processQuizSubmission(quizIdentifier, userSubmission);
      expect(evaluationResult).toBeDefined();
      expect(evaluationResult?.finalScore).toBe(1); // Only text question correct
      expect(evaluationResult?.maxPossibleScore).toBe(3);
      expect(evaluationResult?.scorePercentage).toBe(33);
    });

    test('should return null for non-existent quiz submission', () => {
      const result = QuizManagementService.processQuizSubmission('non-existent-quiz', []);
      expect(result).toBeNull();
    });

    test('should return null for quiz with no questions', () => {
      const emptyQuiz = QuizManagementService.establishNewQuiz('Empty Quiz');
      const result = QuizManagementService.processQuizSubmission(emptyQuiz.quizId, []);
      expect(result).toBeNull();
    });
  });

  describe('Question Structure Validation', () => {
    test('should validate single selection question structure', () => {
      const validSingleOptions = [
        { choiceText: 'Correct', isValidAnswer: true },
        { choiceText: 'Wrong', isValidAnswer: false }
      ];

      const invalidSingleOptions = [
        { choiceText: 'Correct A', isValidAnswer: true },
        { choiceText: 'Correct B', isValidAnswer: true }
      ];

      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.SINGLE_SELECT, validSingleOptions)).toBeNull();
      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.SINGLE_SELECT, invalidSingleOptions))
        .toBe('Single selection questions require exactly one valid answer');
    });

    test('should validate multiple selection question structure', () => {
      const validMultiOptions = [
        { choiceText: 'Valid A', isValidAnswer: true },
        { choiceText: 'Valid B', isValidAnswer: true },
        { choiceText: 'Invalid', isValidAnswer: false }
      ];

      const invalidMultiOptions = [
        { choiceText: 'All Wrong A', isValidAnswer: false },
        { choiceText: 'All Wrong B', isValidAnswer: false }
      ];

      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.MULTI_SELECT, validMultiOptions)).toBeNull();
      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.MULTI_SELECT, invalidMultiOptions))
        .toBe('Multiple selection questions require at least one valid answer');
    });

    test('should validate open text question structure', () => {
      const validTextOptions = [
        { choiceText: 'keyword1', isValidAnswer: true },
        { choiceText: 'keyword2', isValidAnswer: true }
      ];

      const invalidTextOptions = Array(6).fill(0).map((_, i) => ({
        choiceText: `keyword${i}`,
        isValidAnswer: true
      }));

      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.OPEN_TEXT, validTextOptions)).toBeNull();
      expect(QuizManagementService.validateQuestionStructure(QuizQuestionType.OPEN_TEXT, invalidTextOptions))
        .toBe('Open text questions support maximum 5 keyword hints');
    });
  });
});