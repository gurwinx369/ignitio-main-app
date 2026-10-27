/**
 * kiboDiagnosticCopy.js
 * Conversational messages spoken by Kibo tailored specifically to each question in the Gen AI diagnostic.
 */

export const KIBO_DIAGNOSTIC_MESSAGES = {
  // Calibration / Starting Point
  q1: "Where are you starting from in your AI journey? Be honest — no judgment here!",
  casual_api_usage: "Have you called an LLM API directly from code, or stuck to chat interfaces?",
  technologies_used: "Select all the AI tools, frameworks, and patterns you've worked with so far.",
  project_type: "Nice! What best describes the AI application you built or shipped?",

  // Prompt Engineering & Context
  q2: "Take a look at both prompts — why does Prompt B behave more reliably in production?",
  q2b: "In long prompts, where should critical instructions be positioned for maximum attention?",

  // Python & Environment Security
  q3: "Trace through this Python loop — what will this function output?",
  q3b: "Security hygiene check! Where should you NEVER commit or store an API key?",

  // LangChain & Output Parsing
  q4: "Look at the LCEL pipeline — what component goes in the blank to return a clean string?",

  // Embeddings & Vectors
  q5: "In vector space, which pair of phrases will have embeddings closest to each other?",

  // RAG Architecture Ordering
  q6: "Pipeline ordering! Drag these steps in order from raw document to final answer.",

  // Backend / FastAPI & Pydantic
  q7: "If this RAG call is CPU/IO blocking, how do you keep FastAPI's event loop running smoothly?",
  q7b: "Why return a typed Pydantic model instead of a plain Python dictionary?",

  // Agents vs Chains
  q8: "What's the fundamental difference between a linear chain and an autonomous agent?",

  // Pacing & Pacing Calibration
  q9: "Almost done! How much focused time can you realistically invest on a normal day?",
  q10: "Last question! What primary outcome or goal is driving you toward AI right now?",
};

export function getKiboMessageForQuestion(questionId, stepIndex = 0) {
  if (questionId && KIBO_DIAGNOSTIC_MESSAGES[questionId]) {
    return KIBO_DIAGNOSTIC_MESSAGES[questionId];
  }
  return `Question ${stepIndex + 1}: Take your time — let's find the best fit!`;
}
