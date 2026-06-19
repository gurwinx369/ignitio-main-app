// Kyle service layer — the only place LLM calls happen.
// Route handlers call these functions. Nothing else touches Gemini directly.

import { getModel } from "./gemini.client.js";
import { getRoleContext } from "./role.context.js";
import {
  buildDoubtSystemPrompt,
  buildGeneralDoubtSystemPrompt,
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

const QUIZ_OPTION_KEYS = ["A", "B", "C"];

function normalizeAnswerKey(value) {
  return String(value || "").trim().toUpperCase().charAt(0);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuizOptions(quiz) {
  const correctKey = normalizeAnswerKey(quiz.correctAnswer);

  const items = QUIZ_OPTION_KEYS.map((key) => ({
    originalKey: key,
    text: String(quiz.options?.[key] || "").trim(),
    isCorrect: key === correctKey,
  }));

  if (!QUIZ_OPTION_KEYS.includes(correctKey)) {
    throw new Error("Invalid quiz correctAnswer");
  }

  if (items.some((item) => !item.text)) {
    throw new Error("Invalid quiz options");
  }

  const shuffled = shuffleArray(items);

  const options = {};
  let correctAnswer = null;

  shuffled.forEach((item, index) => {
    const newKey = QUIZ_OPTION_KEYS[index];
    options[newKey] = item.text;
    if (item.isCorrect) {
      correctAnswer = newKey;
    }
  });

  if (!correctAnswer) {
    throw new Error("Failed to determine shuffled correct answer");
  }

  return {
    ...quiz,
    options,
    correctAnswer,
  };
}

// Combines all level contexts into one block for day-level operations.
function buildDayContext(levels) {
  return levels
    .map((l, i) => `Level ${i + 1} — ${l.concept}:\n${l.transcript}`)
    .join("\n\n");
}

function isDisallowedGeneralKyleRequest(question) {
  const q = question.toLowerCase();
  const blockedPhrases = [
    "write code", "write a code", "give me code", "full code", "complete code",
    "solve this", "solution for", "debug this", "fix this code", "build an app",
    "create a full project", "leetcode", "hackerrank", "assignment answer", "copy paste solution"
  ];
  
  // Check for obvious misuse phrases
  if (blockedPhrases.some(phrase => q.includes(phrase))) {
    return true;
  }
  
  // Also block if the request looks like a large pasted code block (e.g. over 300 chars with many braces/semicolons)
  // But doing it simply: if length is > 400 and has multiple { or ;
  if (q.length > 400 && (q.split("{").length > 3 || q.split(";").length > 3)) {
    return true;
  }

  return false;
}

function getStaticGeneralKyleResponse(question) {
  const q = question.toLowerCase().trim().replace(/[?!.]/g, '');

  const greetings = ["hi", "hello", "hey", "hi buddy", "hello kyle"];
  if (greetings.includes(q)) {
    return "Hi, I’m Kyle. I can help you with roadmap guidance, learning focus, concepts, and study strategy. What are you learning today?";
  }

  if (q.includes("who are you") || q.includes("what is kyle") || q.includes("who made you") || q.includes("whom do you belong to") || q.includes("what can you do") || q.includes("whom you belong to")) {
    return "I’m Kyle, Ignitio’s AI mentor. I’m part of the Ignitio learning platform and I’m here to guide learners with roadmap direction, concepts, focus, and study strategy. I give hints and explanations, not full code solutions.";
  }

  if (q.includes("what is ignitio") || q.includes("tell me about ignitio")) {
    return "Ignitio is a gamified learning platform that helps learners build technical skills through structured roadmaps, progress tracking, assignments, quizzes, and AI mentor guidance. Kyle is the AI mentor layer inside Ignitio.";
  }

  const dangerous = ["how to make a gun", "weapon making", "bomb", "hacking someone", "illegal activity"];
  if (dangerous.some(phrase => q.includes(phrase))) {
    return "I can’t help with that. I’m here to support learning, roadmaps, concepts, focus, and safe technical education inside Ignitio.";
  }

  return null;
}

function getStaticContextualKyleResponse({ question, concept }) {
  const q = question.toLowerCase().trim().replace(/[?!.]/g, '');

  const greetings = ["hi", "hello", "hey", "hi buddy", "hello kyle", "good morning", "good evening"];
  if (greetings.includes(q)) {
    if (concept) {
      return `Hey! I’m here to help with “${concept}.” Ask me what part feels confusing, and I’ll explain it simply.`;
    }
    return "Hey! I’m here to help with this lesson. Ask me what part feels confusing, and I’ll explain it simply.";
  }

  if (q.includes("who are you") || q.includes("what is kyle") || q.includes("what can you do") || q.includes("who made you")) {
    if (concept) {
      return `I’m Kyle, Ignitio’s AI mentor. In this lesson, I can help explain “${concept},” clear doubts, and guide you with hints.`;
    }
    return "I’m Kyle, Ignitio’s AI mentor. In this lesson, I can help clear doubts and guide you with hints.";
  }

  return null;
}

// Answers a learner's doubt. Can use current level context or general mentor prompt.
export async function answerDoubt({ concept, transcript, role, question, mode }) {
  const isGeneralMode = mode === "general" || !concept;

  if (isGeneralMode) {
    const staticResponse = getStaticGeneralKyleResponse(question);
    if (staticResponse) return staticResponse;

    if (isDisallowedGeneralKyleRequest(question)) {
      return "I can’t write the full code, debug large blocks, or provide complete solutions in Global Ask Kyle. I can help you understand the logic, break the problem into steps, or give a small hint so you can implement it yourself.";
    }
  } else {
    const staticContextualResponse = getStaticContextualKyleResponse({ question, concept });
    if (staticContextualResponse) return staticContextualResponse;
  }

  const model = getModel();
  
  const systemInstruction = isGeneralMode
    ? buildGeneralDoubtSystemPrompt(getRoleContext(role))
    : buildDoubtSystemPrompt(concept, transcript, getRoleContext(role));

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

  const quiz = parseJSON(result.response.text());
  return shuffleQuizOptions(quiz);
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
