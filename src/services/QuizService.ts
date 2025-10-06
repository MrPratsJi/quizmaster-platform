import { v4 as generateUniqueId } from 'uuid';
import { QuizContainer, QuizQuestion, QuizQuestionType, QuizChoice, UserResponse, ScoringResult } from '../models';

class QuizManagementService {
  private quizDatabase: Map<string, QuizContainer> = new Map();
  private questionDatabase: Map<string, QuizQuestion> = new Map();

  // Quiz Operations
  establishNewQuiz(title: string, description?: string): QuizContainer {
    const newQuiz: QuizContainer = {
      quizId: generateUniqueId(),
      quizTitle: title,
      quizDescription: description,
      createdTimestamp: new Date(),
      lastModified: new Date()
    };
    
    this.quizDatabase.set(newQuiz.quizId, newQuiz);
    return newQuiz;
  }

  retrieveAllQuizzes(): QuizContainer[] {
    return Array.from(this.quizDatabase.values());
  }

  findQuizByIdentifier(identifier: string): QuizContainer | null {
    return this.quizDatabase.get(identifier) || null;
  }

  // Question Operations
  attachQuestionToQuiz(quizIdentifier: string, questionText: string, questionType: QuizQuestionType, choices: Omit<QuizChoice, 'choiceId'>[]): QuizQuestion | null {
    const targetQuiz = this.findQuizByIdentifier(quizIdentifier);
    if (!targetQuiz) {
      return null;
    }

    const newQuestion: QuizQuestion = {
      questionId: generateUniqueId(),
      belongsToQuiz: quizIdentifier,
      questionText,
      questionType,
      availableChoices: choices.map(choice => ({ 
        choiceId: generateUniqueId(),
        choiceText: choice.choiceText || (choice as any).text, // Handle both choiceText and text
        isValidAnswer: choice.isValidAnswer || (choice as any).isCorrect // Handle both isValidAnswer and isCorrect
      })),
      createdTimestamp: new Date(),
      lastModified: new Date()
    };

    this.questionDatabase.set(newQuestion.questionId, newQuestion);
    return newQuestion;
  }

  fetchQuestionsByQuizId(quizIdentifier: string): QuizQuestion[] {
    return Array.from(this.questionDatabase.values())
      .filter(question => question.belongsToQuiz === quizIdentifier);
  }

  locateQuestionByIdentifier(identifier: string): QuizQuestion | null {
    return this.questionDatabase.get(identifier) || null;
  }

  // Retrieve questions for quiz participants (excluding answer keys)
  getParticipantQuestions(quizIdentifier: string): any[] {
    const quizQuestions = this.fetchQuestionsByQuizId(quizIdentifier);
    return quizQuestions.map(question => ({
      questionId: question.questionId,
      questionText: question.questionText,
      questionType: question.questionType,
      availableChoices: question.availableChoices.map(choice => ({
        choiceId: choice.choiceId,
        choiceText: choice.choiceText
        // isValidAnswer deliberately excluded for quiz takers
      }))
    }));
  }

  // Process quiz responses and calculate scoring
  processQuizSubmission(quizIdentifier: string, userResponses: UserResponse[]): ScoringResult | null {
    const targetQuiz = this.findQuizByIdentifier(quizIdentifier);
    if (!targetQuiz) {
      return null;
    }

    const quizQuestions = this.fetchQuestionsByQuizId(quizIdentifier);
    if (quizQuestions.length === 0) {
      return null;
    }

    let achievedPoints = 0;
    const responseBreakdown = [];

    for (const currentQuestion of quizQuestions) {
      const userResponse = userResponses.find(response => 
        response.targetQuestionId === currentQuestion.questionId || 
        response.questionId === currentQuestion.questionId
      );
      const validAnswerIds = currentQuestion.availableChoices
        .filter(choice => choice.isValidAnswer)
        .map(choice => choice.choiceId);

      let responseIsCorrect = false;

      if (userResponse) {
        if (currentQuestion.questionType === QuizQuestionType.OPEN_TEXT) {
          // Text-based question evaluation using keyword matching
          const validKeywords = currentQuestion.availableChoices
            .filter(choice => choice.isValidAnswer)
            .map(choice => choice.choiceText.toLowerCase());
          
          const userText = userResponse.openTextResponse || userResponse.textAnswer || '';
          responseIsCorrect = userText ? 
            validKeywords.some(keyword => 
              userText.toLowerCase().includes(keyword)
            ) : false;
        } else if (currentQuestion.questionType === QuizQuestionType.SINGLE_SELECT) {
          // Single selection question validation
          const selectedId = userResponse.selectedChoiceId || userResponse.selectedOptionId;
          responseIsCorrect = selectedId ? validAnswerIds.includes(selectedId) : false;
        } else if (currentQuestion.questionType === QuizQuestionType.MULTI_SELECT) {
          // Multiple selection question validation
          const userSelections = userResponse.selectedChoiceIds || userResponse.selectedOptionIds || [];
          responseIsCorrect = validAnswerIds.length === userSelections.length &&
                             validAnswerIds.every(answerId => userSelections.includes(answerId));
        }
      }

      if (responseIsCorrect) {
        achievedPoints++;
      }

      responseBreakdown.push({
        questionId: currentQuestion.questionId,
        wasCorrect: responseIsCorrect,
        expectedAnswers: validAnswerIds,
        providedAnswers: userResponse?.selectedChoiceIds || userResponse?.selectedOptionIds ||
                        (userResponse?.selectedChoiceId ? [userResponse.selectedChoiceId] : []) ||
                        (userResponse?.selectedOptionId ? [userResponse.selectedOptionId] : []) ||
                        (userResponse?.openTextResponse ? [userResponse.openTextResponse] : []) ||
                        (userResponse?.textAnswer ? [userResponse.textAnswer] : [])
      });
    }

    return {
      finalScore: achievedPoints,
      maxPossibleScore: quizQuestions.length,
      scorePercentage: Math.round((achievedPoints / quizQuestions.length) * 100),
      responseBreakdown
    };
  }

  // Question validation utilities
  validateQuestionStructure(questionType: QuizQuestionType, choices: Omit<QuizChoice, 'choiceId'>[]): string | null {
    if (questionType === QuizQuestionType.SINGLE_SELECT) {
      const validAnswerCount = choices.filter(choice => choice.isValidAnswer).length;
      if (validAnswerCount !== 1) {
        return 'Single selection questions require exactly one valid answer';
      }
    } else if (questionType === QuizQuestionType.MULTI_SELECT) {
      const validAnswerCount = choices.filter(choice => choice.isValidAnswer).length;
      if (validAnswerCount < 1) {
        return 'Multiple selection questions require at least one valid answer';
      }
    } else if (questionType === QuizQuestionType.OPEN_TEXT) {
      if (choices.length > 5) {
        return 'Open text questions support maximum 5 keyword hints';
      }
    }
    return null;
  }
}

export default new QuizManagementService();