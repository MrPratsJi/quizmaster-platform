import { QuizQuestionType } from '../models';

// Comprehensive validation functions for quiz management system
export const validateCreateQuiz = (data: any): { error?: string; value?: any } => {
  if (!data.title || typeof data.title !== 'string') {
    return { error: 'Quiz title is required and must be a string' };
  }
  if (data.title.length < 3 || data.title.length > 200) {
    return { error: 'Quiz title must be between 3 and 200 characters' };
  }
  if (data.description && (typeof data.description !== 'string' || data.description.length > 1000)) {
    return { error: 'Quiz description must be a string with maximum 1000 characters' };
  }
  return { value: data };
};

export const validateCreateQuestion = (data: any): { error?: string; value?: any } => {
  if (!data.text || typeof data.text !== 'string') {
    return { error: 'Question text is required and must be a string' };
  }
  if (data.text.length < 5 || data.text.length > 500) {
    return { error: 'Question text must be between 5 and 500 characters' };
  }
  if (!data.type || !Object.values(QuizQuestionType).includes(data.type)) {
    return { error: 'Valid quiz question type is required' };
  }
  if (!Array.isArray(data.options) || data.options.length < 2 || data.options.length > 10) {
    return { error: 'Question choices must be an array with 2-10 items' };
  }
  
  for (const choice of data.options) {
    if (!choice.text || typeof choice.text !== 'string' || choice.text.length > 300) {
      return { error: 'Each choice text is required and must be maximum 300 characters' };
    }
    if (typeof choice.isCorrect !== 'boolean') {
      return { error: 'Each choice must have isCorrect boolean property' };
    }
  }

  // Validate based on quiz question type
  const { type, options } = data;
  
  if (type === QuizQuestionType.SINGLE_SELECT) {
    const validAnswers = options.filter((choice: any) => choice.isCorrect);
    if (validAnswers.length !== 1) {
      return { error: 'Single selection questions must have exactly one valid answer' };
    }
  } else if (type === QuizQuestionType.MULTI_SELECT) {
    const validAnswers = options.filter((choice: any) => choice.isCorrect);
    if (validAnswers.length < 1) {
      return { error: 'Multiple selection questions must have at least one valid answer' };
    }
  } else if (type === QuizQuestionType.OPEN_TEXT) {
    if (options.length > 5) {
      return { error: 'Open text questions can have maximum 5 keyword hints' };
    }
  }
  
  return { value: data };
};

export const validateSubmitQuiz = (data: any): { error?: string; value?: any } => {
  if (!Array.isArray(data) || data.length < 1) {
    return { error: 'Submission must be a non-empty array of responses' };
  }
  
  for (const response of data) {
    if (!response.questionId || typeof response.questionId !== 'string') {
      return { error: 'Each response must have a valid questionId' };
    }
    
    // At least one response type must be provided - support both old and new field names
    if (!response.selectedOptionId && !response.selectedOptionIds && !response.textAnswer && 
        !response.selectedChoiceId && !response.selectedChoiceIds && !response.openTextResponse && 
        !response.targetQuestionId) {
      return { error: 'Each response must have valid answer data' };
    }
    
    const textContent = response.textAnswer || response.openTextResponse;
    if (textContent && textContent.length > 300) {
      return { error: 'Text responses must be maximum 300 characters' };
    }
  }
  
  return { value: data };
};