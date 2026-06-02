// Kyle API client helpers.
// One thin function per route. Each returns `data` on success or throws
// a plain Error with a human-readable message — callers decide how to
// surface it (toast, state, etc.).

import axios from "axios";

// ---------------------------------------------------------------------------
// Shared axios instance
// ---------------------------------------------------------------------------

const kyleClient = axios.create({
  baseURL: "/api/v2/kyle",
  headers: { "Content-Type": "application/json" },
});

// Inject the Firebase ID token on every outgoing request.
// The caller stores the token in the instance defaults before any call.
kyleClient.interceptors.request.use((config) => {
  const token = kyleClient.defaults.headers.common["X-Kyle-Token"];
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Normalise every non-2xx response into a plain Error with a readable message.
kyleClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ??
      err.message ??
      "An unexpected Kyle error occurred";
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

/**
 * POST to a Kyle sub-route and unwrap `data` from the response body.
 *
 * @param {string} path    - e.g. "/quiz/generate"
 * @param {object} body    - JSON-serialisable request body
 * @param {string} idToken - Firebase ID token from getIdToken()
 * @returns {Promise<object>}
 */
async function post(path, body, idToken) {
  // Set the token for this request cycle via instance defaults so the
  // interceptor can pick it up without passing it through every layer.
  kyleClient.defaults.headers.common["X-Kyle-Token"] = idToken;

  const { data: json } = await kyleClient.post(path, body);
  return json.data;
}

// ---------------------------------------------------------------------------
// Public helpers — one per route
// ---------------------------------------------------------------------------

/**
 * Generate a quiz question for the level that just ended.
 *
 * @param {{ concept: string, transcript: string, role: "student"|"developer"|"writer"|"designer" }} params
 * @param {string} idToken
 * @returns {Promise<{ question: string, options: { A: string, B: string, C: string }, correctAnswer: string, explanation: string }>}
 */
export async function generateQuiz({ concept, transcript, role }, idToken) {
  return post("/quiz/generate", { concept, transcript, role }, idToken);
}

/**
 * Record the result of a completed quiz attempt.
 *
 * @param {{ levelId: string, dayNumber: number, concept: string, question: string, selectedOption: string, wasCorrect: boolean }} params
 * @param {string} idToken
 * @returns {Promise<{ recorded: boolean }>}
 */
export async function submitQuiz(
  { levelId, dayNumber, concept, question, selectedOption, wasCorrect },
  idToken
) {
  return post(
    "/quiz/submit",
    { levelId, dayNumber, concept, question, selectedOption, wasCorrect },
    idToken
  );
}

/**
 * Generate a practical written assignment covering the full day's levels.
 *
 * @param {{ role: "student"|"developer"|"writer"|"designer", dayNumber: number, levels: Array<{ concept: string, transcript: string }> }} params
 * @param {string} idToken
 * @returns {Promise<{ assignmentPrompt: string }>}
 */
export async function generateAssignment({ role, dayNumber, levels }, idToken) {
  return post("/assignment/generate", { role, dayNumber, levels }, idToken);
}

/**
 * Submit and score a written assignment response.
 *
 * @param {{ role: "student"|"developer"|"writer"|"designer", dayNumber: number, levels: Array<{ concept: string, transcript: string }>, assignmentPrompt: string, userResponse: string }} params
 * @param {string} idToken
 * @returns {Promise<{ score: number, feedback: string, passed: boolean, attemptsRemaining: number, lockedUntil: string|null, breakdown: object, weaknesses: string[] }>}
 */
export async function submitAssignment(
  { role, dayNumber, levels, assignmentPrompt, userResponse },
  idToken
) {
  return post(
    "/assignment/submit",
    { role, dayNumber, levels, assignmentPrompt, userResponse },
    idToken
  );
}

/**
 * Ask Kyle to answer a doubt scoped to the current level's content.
 *
 * @param {{ concept: string, transcript: string, role: "student"|"developer"|"writer"|"designer", question: string }} params
 * @param {string} idToken
 * @returns {Promise<{ answer: string }>}
 */
export async function askDoubt({ concept, transcript, role, question }, idToken) {
  return post("/doubt", { concept, transcript, role, question }, idToken);
}
