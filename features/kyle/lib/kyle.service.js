// Kyle service layer — the only place LLM calls happen.
// Route handlers call these functions. Nothing else touches Gemini directly.

import { getModel } from "./gemini.client.js";
import { getRoleContext } from "./role.context.js";
import {
  buildDoubtSystemPrompt,
  buildQuizSystemPrompt,
  buildAssignmentSystemPrompt,
  buildScoringSystemPrompt,
} from "./system.prompts.js";

// Strips markdown code fences Gemini sometimes wraps around JSON responses.
function parseJSON(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// Combines all level contexts into one block for day-level operations.
function buildDayContext(levels) {
  return levels
    .map((l, i) => `Level ${i + 1} — ${l.concept}:\n${l.transcript}`)
    .join("\n\n");
}

// Answers a learner's doubt about the current level. Returns answer text.
export async function answerDoubt({ concept, transcript, role, question }) {
  const model = getModel();
  const systemInstruction = buildDoubtSystemPrompt(
    concept,
    transcript,
    getRoleContext(role)
  );

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: question }] }],
    generationConfig: { temperature: 0.7 },
  });

  return result.response.text().trim();
}

// Generates a quiz for the level that just ended. Temperature 0 for determinism.
// Returns the full quiz object including correctAnswer — frontend handles comparison.
export async function generateQuiz({ concept, transcript, role }) {
  const model = getModel();
  const systemInstruction = buildQuizSystemPrompt(
    concept,
    transcript,
    getRoleContext(role)
  );

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: "Generate the quiz question." }] }],
    generationConfig: { temperature: 0 },
  });

  return parseJSON(result.response.text());
  // Shape: { question, options: { A, B, C }, correctAnswer, explanation }
}

// Generates a practical written assignment covering the full day's content.
// Returns the assignment prompt string — no DB write here.
export async function generateAssignment({ role, dayNumber, levels }) {
  const model = getModel();
  const dayContext = buildDayContext(levels);
  const systemInstruction = buildAssignmentSystemPrompt(
    dayContext,
    role,
    getRoleContext(role),
    dayNumber
  );

  const result = await model.generateContent({
    systemInstruction,
    contents: [
      { role: "user", parts: [{ text: `Generate the Day ${dayNumber} assignment.` }] },
    ],
    generationConfig: { temperature: 0.7 },
  });

  return result.response.text().trim();
}

// Scores a learner's written assignment response.
// Returns { score, feedback, passed, breakdown, weaknesses }.
export async function scoreAssignment({ assignmentPrompt, userResponse, levels, role, dayNumber }) {
  const model = getModel();
  const dayContext = buildDayContext(levels);
  const systemInstruction = buildScoringSystemPrompt(
    assignmentPrompt,
    userResponse,
    dayContext,
    role,
    getRoleContext(role),
    dayNumber
  );

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: "user", parts: [{ text: "Score this response." }] }],
    // Temperature 0 for scoring — deterministic, no creative variance in grading.
    generationConfig: { temperature: 0 },
  });

  return parseJSON(result.response.text());
  // Shape: { score, feedback, passed, breakdown, weaknesses }
}
