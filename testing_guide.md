# Ignitio Kyle API Testing Guide

This guide provides instructions and examples for testing the five v2 Kyle API routes. It covers prerequisites, required headers, schemas, example JSON request/response payloads, and step-by-step gate logic testing scenarios.

---

## 1. Prerequisites

### Step A: Configure Gemini API Key
Kyle utilizes the `gemini-2.0-flash` model. Ensure your `.env` file contains a valid Google AI Studio API key:
```env
GEMINI_API_KEY=your_actual_google_ai_studio_api_key
```

### Step B: Obtain a Firebase ID Token
All Kyle endpoints are protected and verify Firebase ID tokens.
To generate a valid Bearer token for testing:
1. Log into your frontend application, or
2. Use the Firebase Auth SDK in a test script to sign in and run `await firebase.auth().currentUser.getIdToken(true)` in the console to print the ID Token.
3. Include the token in the `Authorization` header of each request:
   ```http
   Authorization: Bearer <your_firebase_id_token>
   ```

---

## 2. Protected Routes Reference

| Route | Method | Purpose | LLM Call? | DB Write? |
| :--- | :---: | :--- | :---: | :---: |
| `/api/v2/kyle/doubt` | `POST` | Answers specific lesson concept doubts | Yes | No |
| `/api/v2/kyle/quiz/generate` | `POST` | Generates a 3-option multiple choice question | Yes | No |
| `/api/v2/kyle/quiz/submit` | `POST` | Persists quiz result to user history | No | Yes (KyleHistory) |
| `/api/v2/kyle/assignment/generate` | `POST` | Generates written assignment prompt for the day | Yes | No |
| `/api/v2/kyle/assignment/submit` | `POST` | Scores response, gives feedback, handles gates | Yes | Yes (KyleHistory) |

---

## 3. Testing Route 1: Doubt-Answering
Answers learner doubts scoped strictly to the current concept and transcript.

* **URL:** `http://localhost:5000/api/v2/kyle/doubt`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### Request Body Schema
```json
{
  "concept": "String (min: 1)",
  "transcript": "String (min: 1)",
  "role": "student | developer | writer | designer",
  "question": "String (1-500 chars)"
}
```

### Example Request
```json
{
  "concept": "Variables and Declarations",
  "transcript": "In JavaScript, variables are containers for storing data values. We declare variables using let, const, or var. Use const for values that won't change, and let for variables that can be reassigned.",
  "role": "developer",
  "question": "Why should I use const instead of let?"
}
```

### Example Response (`200 OK`)
```json
{
  "data": {
    "answer": "Use const by default. It signals to others that the variable's value stays locked, preventing accidental reassignments. Use let only when you know you will reassign the variable later. For example: const taxRate = 0.15; let userScore = 0;."
  }
}
```

### cURL Command
```bash
curl -X POST http://localhost:5000/api/v2/kyle/doubt \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"concept":"Variables","transcript":"Variables store data. Use let or const.","role":"developer","question":"Why use const?"}'
```

---

## 4. Testing Route 2: Quiz Generation
Generates exactly **one** multiple-choice question (options A, B, C) for the level. Correct answers are verified on the frontend.

* **URL:** `http://localhost:5000/api/v2/kyle/quiz/generate`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### Request Body Schema
```json
{
  "concept": "String",
  "transcript": "String",
  "role": "student | developer | writer | designer"
}
```

### Example Request
```json
{
  "concept": "Introduction to Prompt Engineering",
  "transcript": "Prompt engineering is the practice of structuring text inputs so that generative AI tools produce the desired outputs. A prompt is not just a question; it includes context, instructions, and input data.",
  "role": "student"
}
```

### Example Response (`200 OK`)
```json
{
  "data": {
    "question": "Which of the following is NOT part of a prompt's composition according to the lesson?",
    "options": {
      "A": "Input data",
      "B": "System instructions",
      "C": "Vector database indexes"
    },
    "correctAnswer": "C",
    "explanation": "The transcript mentions prompt components are context, instructions, and input data. Vector database indexes are not mentioned."
  }
}
```

### cURL Command
```bash
curl -X POST http://localhost:5000/api/v2/kyle/quiz/generate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"concept":"Prompting","transcript":"Prompts contain context, instructions and input data.","role":"student"}'
```

---

## 5. Testing Route 3: Quiz Submission
Saves quiz attempt stats in MongoDB. Does not contact Gemini.

* **URL:** `http://localhost:5000/api/v2/kyle/quiz/submit`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### Request Body Schema
```json
{
  "levelId": "String (Unique level ID, e.g. lvl_101)",
  "dayNumber": "Integer (1+)",
  "concept": "String",
  "question": "String",
  "selectedOption": "String (e.g. A, B, or C)",
  "wasCorrect": "Boolean"
}
```

### Example Request
```json
{
  "levelId": "lvl_js_variables",
  "dayNumber": 1,
  "concept": "Variables",
  "question": "Why use const?",
  "selectedOption": "A",
  "wasCorrect": true
}
```

### Example Response (`200 OK`)
```json
{
  "data": {
    "recorded": true
  }
}
```

### Gate Validation Test (Attempt Restriction)
To verify that users can only submit **one quiz attempt per level**:
1. Run the submission request above. You should get `{"data": {"recorded": true}}` (`200 OK`).
2. Run the exact same submission request again.
3. **Expected Result:** `429 Too Many Requests` status code with the following response:
   ```json
   {
     "error": "This quiz has already been answered"
   }
   ```

---

## 6. Testing Route 4: Assignment Generation
Generates the assignment prompt dynamically. Takes the list of levels completed today and creates a role-tailored prompt.

* **URL:** `http://localhost:5000/api/v2/kyle/assignment/generate`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### Request Body Schema
```json
{
  "role": "student | developer | writer | designer",
  "dayNumber": "Integer (1+)",
  "levels": [
    {
      "concept": "String",
      "transcript": "String"
    }
  ]
}
```

### Example Request
```json
{
  "role": "writer",
  "dayNumber": 1,
  "levels": [
    {
      "concept": "Active vs Passive Voice",
      "transcript": "Active voice makes your writing stronger, more direct, and easier to read. For example, 'The dog bit the man' is active. 'The man was bitten by the dog' is passive."
    },
    {
      "concept": "Clarity and Brevity",
      "transcript": "Cut unnecessary words. Say what you need to say clearly. Avoid empty filler words like 'basically', 'actually', or 'virtually'."
    }
  ]
}
```

### Example Response (`200 OK`)
```json
{
  "data": {
    "assignmentPrompt": "Rewrite the following passive, wordy sentence to be active and concise: 'It was actually decided by the committee that the launch of the campaign will be delayed.' Provide your rewrite and write a brief sentence explaining why your version is stronger."
  }
}
```

---

## 7. Testing Route 5: Assignment Submission
Scores the written response from the user and persists details in the database. Operates under strict gate & attempt mechanics.

* **URL:** `http://localhost:5000/api/v2/kyle/assignment/submit`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### Request Body Schema
```json
{
  "role": "student | developer | writer | designer",
  "dayNumber": "Integer",
  "levels": [
    {
      "concept": "String",
      "transcript": "String"
    }
  ],
  "assignmentPrompt": "String",
  "userResponse": "String"
}
```

### Example Request
```json
{
  "role": "writer",
  "dayNumber": 1,
  "levels": [
    {
      "concept": "Active vs Passive Voice",
      "transcript": "Active voice makes your writing stronger, more direct, and easier to read. For example, 'The dog bit the man' is active. 'The man was bitten by the dog' is passive."
    }
  ],
  "assignmentPrompt": "Rewrite the passive sentence: 'The apple was eaten by John.'",
  "userResponse": "John ate the apple."
}
```

### Example Response (`200 OK`)
```json
{
  "data": {
    "score": 8,
    "feedback": "Great work! You turned the sentence into active voice by putting John, the doer of the action, at the beginning. It's direct and easy to read.",
    "passed": true,
    "attemptsRemaining": 0,
    "lockedUntil": null
  }
}
```

---

## 8. Gate and Attempts Logic Testing Scenarios

Use the following step-by-step scenarios to verify the gating logic of the assignment submission endpoint.

### Scenario A: Pass Gate (Locked after Pass)
1. Generate an assignment for a user on `dayNumber: 2`.
2. Submit a high-quality response. Kyle scores it `score >= 5`, yielding `passed: true`.
3. The response will return `attemptsRemaining: 0` and `lockedUntil: null`.
4. Try to submit the assignment for `dayNumber: 2` again.
5. **Expected Result:** `423 Locked` status code with the following response:
   ```json
   {
     "error": "You already passed this day's assignment"
   }
   ```

---

### Scenario B: Failure Deductions
1. Generate an assignment for a user on `dayNumber: 3`.
2. Submit a completely unrelated or empty response (e.g. `"I don't know"`).
3. Kyle scores it `score < 5`, yielding `passed: false`.
4. The response will return:
   * `attemptsRemaining: 2`
   * `lockedUntil: null`
5. Repeat with a second low-quality response.
6. The response will return:
   * `attemptsRemaining: 1`
   * `lockedUntil: null`

---

### Scenario C: Cooldown Lock (3rd Attempt Failure)
1. Following Scenario B, submit your third failing response for `dayNumber: 3`.
2. The response will return:
   * `passed: false`
   * `attemptsRemaining: 0`
   * `lockedUntil: "2026-06-01T05:41:09.000Z"` (exact timestamp representing `current_time + 6 hours`)
3. Try to submit a fourth time.
4. **Expected Result:** `423 Locked` status code with the response:
   ```json
   {
     "error": "Assignment locked — please wait before retrying",
     "lockedUntil": "2026-06-01T05:41:09.000Z"
   }
   ```

---

### Scenario D: Cooldown Expiry & Reset
You can verify the cooldown expiry and reset behavior without waiting 6 hours:
1. Open your MongoDB GUI (such as MongoDB Atlas or Compass) or database console.
2. Find the user's document inside the `kylehistories` collection.
3. Locate the entry in the `assignmentHistory` array where `dayNumber` is `3`.
4. Edit the `lockedUntil` date to a date in the past (e.g., yesterday) and save.
5. Submit a new response to `POST /api/v2/kyle/assignment/submit` for `dayNumber: 3`.
6. **Expected Result:**
   * The server recognizes the cooldown has expired.
   * It resets `attemptCount` back to `0` and removes the lock status in the DB.
   * The new attempt is processed, scored, and returns `attemptsRemaining: 2` (first of the fresh batch of 3 attempts).
