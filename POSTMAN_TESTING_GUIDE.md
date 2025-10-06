# Quiz Application API - Postman Testing Guide

This guide provides step-by-step instructions for testing the Quiz Application API using Postman.

## Prerequisites
- Quiz API server running on `http://localhost:3000`
- Postman installed (download from https://www.postman.com/downloads/)

## Testing Workflow

### 1. Health Check
**Method:** GET  
**URL:** `http://localhost:3000/api/v1/health`  
**Expected Response:**
```json
{
  "success": true,
  "message": "Quiz API is running",
  "timestamp": "2025-10-06T15:30:00.000Z"
}
```

### 2. Create a Quiz
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes`  
**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JavaScript basics"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "JavaScript Fundamentals Quiz",
    "description": "Test your knowledge of JavaScript basics",
    "createdAt": "2025-10-06T15:30:00.000Z",
    "updatedAt": "2025-10-06T15:30:00.000Z"
  },
  "message": "Quiz created successfully"
}
```

**⚠️ Important:** Copy the quiz `id` from the response - you'll need it for subsequent requests!

### 3. Get All Quizzes
**Method:** GET  
**URL:** `http://localhost:3000/api/v1/quizzes`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "JavaScript Fundamentals Quiz",
      "description": "Test your knowledge of JavaScript basics",
      "createdAt": "2025-10-06T15:30:00.000Z",
      "updatedAt": "2025-10-06T15:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 4. Add Questions to Quiz

#### 4.1 Single Choice Question
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/questions`  
*(Replace {QUIZ_ID} with the actual quiz ID from step 2)*

**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "text": "What is the correct way to declare a variable in JavaScript?",
  "type": "single_choice",
  "options": [
    {
      "text": "var x = 5;",
      "isCorrect": false
    },
    {
      "text": "let x = 5;",
      "isCorrect": true
    },
    {
      "text": "x = 5;",
      "isCorrect": false
    },
    {
      "text": "variable x = 5;",
      "isCorrect": false
    }
  ]
}
```

#### 4.2 Multiple Choice Question
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/questions`

**Body (raw JSON):**
```json
{
  "text": "Which of the following are JavaScript data types?",
  "type": "multiple_choice",
  "options": [
    {
      "text": "string",
      "isCorrect": true
    },
    {
      "text": "number",
      "isCorrect": true
    },
    {
      "text": "float",
      "isCorrect": false
    },
    {
      "text": "boolean",
      "isCorrect": true
    }
  ]
}
```

#### 4.3 Text-based Question
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/questions`

**Body (raw JSON):**
```json
{
  "text": "Explain what 'hoisting' means in JavaScript (max 300 characters)",
  "type": "text_based",
  "options": [
    {
      "text": "hoisting",
      "isCorrect": true
    },
    {
      "text": "variable declaration",
      "isCorrect": true
    }
  ]
}
```

### 5. Get Quiz Questions (For Taking Quiz)
**Method:** GET  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/questions`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "JavaScript Fundamentals Quiz",
      "description": "Test your knowledge of JavaScript basics"
    },
    "questions": [
      {
        "id": "question-id-1",
        "text": "What is the correct way to declare a variable in JavaScript?",
        "type": "single_choice",
        "options": [
          {
            "id": "option-id-1",
            "text": "var x = 5;"
          },
          {
            "id": "option-id-2",
            "text": "let x = 5;"
          },
          {
            "id": "option-id-3",
            "text": "x = 5;"
          },
          {
            "id": "option-id-4",
            "text": "variable x = 5;"
          }
        ]
      }
    ]
  },
  "count": 3
}
```

**⚠️ Important:** Note that `isCorrect` is not included in the response - this is for quiz takers!

### 6. Submit Quiz Answers
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/submit`

**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "answers": [
    {
      "questionId": "question-id-1",
      "selectedOptionIds": ["option-id-2"]
    },
    {
      "questionId": "question-id-2",
      "selectedOptionIds": ["option-id-5", "option-id-6", "option-id-8"]
    },
    {
      "questionId": "question-id-3",
      "textAnswer": "Hoisting in JavaScript means that variable declarations are moved to the top of their scope"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "score": 3,
    "total": 3,
    "percentage": 100,
    "details": [
      {
        "questionId": "question-id-1",
        "correct": true,
        "correctAnswers": ["option-id-2"],
        "userAnswers": ["option-id-2"]
      },
      {
        "questionId": "question-id-2",
        "correct": true,
        "correctAnswers": ["option-id-5", "option-id-6", "option-id-8"],
        "userAnswers": ["option-id-5", "option-id-6", "option-id-8"]
      },
      {
        "questionId": "question-id-3",
        "correct": true,
        "correctAnswers": ["hoisting", "variable declaration"],
        "userAnswers": ["Hoisting in JavaScript means that variable declarations are moved to the top of their scope"]
      }
    ]
  },
  "message": "Quiz submitted successfully"
}
```

## Validation Testing

### Test Invalid Quiz Creation
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes`

**Body (raw JSON):**
```json
{
  "title": "A"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Title must be between 3 and 200 characters"
}
```

### Test Invalid Question Creation
**Method:** POST  
**URL:** `http://localhost:3000/api/v1/quizzes/{QUIZ_ID}/questions`

**Body (raw JSON):**
```json
{
  "text": "Invalid single choice question",
  "type": "single_choice",
  "options": [
    {
      "text": "Option 1",
      "isCorrect": true
    },
    {
      "text": "Option 2",
      "isCorrect": true
    }
  ]
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Single choice questions must have exactly one correct answer"
}
```

## Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:
- `base_url`: `http://localhost:3000`
- `api_base`: `{{base_url}}/api/v1`
- `quiz_id`: (set this after creating a quiz)

### Using Variables in Requests
- Use `{{api_base}}/quizzes` instead of the full URL
- Use `{{quiz_id}}` in place of the actual quiz ID

## Tips for Testing

1. **Create a Collection:** Organize all requests in a Postman collection
2. **Use Variables:** Set up environment variables for base URL and quiz IDs
3. **Test Sequence:** Follow the order: Create Quiz → Add Questions → Get Questions → Submit Answers
4. **Save Response Data:** Copy IDs from responses to use in subsequent requests
5. **Test Error Cases:** Try invalid data to ensure validation works
6. **Check Status Codes:** Verify correct HTTP status codes (200, 201, 400, 404, 500)

## Common Error Responses

| Status Code | Description | Example |
|------------|-------------|---------|
| 400 | Bad Request | Invalid data format or validation error |
| 404 | Not Found | Quiz or question doesn't exist |
| 500 | Internal Server Error | Server-side error |

## Example Test Flow

1. Health Check → Should return 200
2. Create Quiz → Save quiz ID from response
3. Add 3 questions (different types) → Save question IDs
4. Get quiz questions → Verify correct answers are hidden
5. Submit quiz with correct answers → Should get 100% score
6. Submit quiz with wrong answers → Should get lower score
7. Test validation errors → Should get 400 responses