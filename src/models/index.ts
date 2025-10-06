export enum QuizQuestionType {
  MULTI_SELECT = 'multi_select',
  SINGLE_SELECT = 'single_select', 
  OPEN_TEXT = 'open_text'
}

export interface QuizChoice {
  choiceId: string;
  choiceText: string;
  isValidAnswer: boolean;
}

export interface QuizQuestion {
  questionId: string;
  belongsToQuiz: string;
  questionText: string;
  questionType: QuizQuestionType;
  availableChoices: QuizChoice[];
  createdTimestamp: Date;
  lastModified: Date;
}

export interface QuizContainer {
  quizId: string;
  quizTitle: string;
  quizDescription?: string;
  createdTimestamp: Date;
  lastModified: Date;
}

export interface UserQuizSubmission {
  submissionId: string;
  targetQuizId: string;
  userResponses: UserResponse[];
  achievedScore: number;
  totalPossibleScore: number;
  submissionTimestamp: Date;
}

export interface UserResponse {
  targetQuestionId: string;
  selectedChoiceId?: string;        // For single select
  selectedChoiceIds?: string[];     // For multi select  
  openTextResponse?: string;        // For open text questions
  // Legacy support for backward compatibility
  questionId?: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
}

export interface ScoringResult {
  finalScore: number;
  maxPossibleScore: number;
  scorePercentage: number;
  responseBreakdown: {
    questionId: string;
    wasCorrect: boolean;
    expectedAnswers: string[];
    providedAnswers: string[];
  }[];
}