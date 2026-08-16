// Diagnostic grader — pure functions, no DB, no side effects.
//
// GRADING PHILOSOPHY (addresses the naive-keyword-matching problem):
//
//   1. Minimum length gates: short dumps of keywords are rejected before
//      keyword scanning even runs. A user typing "schema schema schema"
//      gets blocked by the min-word check, not rewarded.
//
//   2. Whole-word regex only: /\b(keyword)\b/ — "StrOutputParser" doesn't
//      accidentally match "output", "schema" doesn't match "schematic".
//
//   3. Multi-concept grading uses DISTINCT concept groups, not keyword
//      frequency. Repeating one keyword never grants credit for two groups.
//
//   4. Negative pattern detection: answers that look like keyword stuffing
//      (high keyword density relative to total words) are flagged and failed.
//
//   5. Answer normalisation: lowercase, collapse whitespace, strip
//      punctuation before matching. Prevents punctuation-based evasion.
//
// What cannot be done server-side without an LLM:
//   - Detecting coherent reasoning vs. an incoherent list of correct words.
//   - Catching copy-paste of the pass criteria from this file.
//   - Grading answers in languages other than English.
// These are flagged as FRONTEND responsibility in the comments below.

// ─── Shared utilities ───────────────────────────────────────────────────────

/**
 * Normalise an answer string for reliable matching.
 * Lowercase, collapse whitespace, keep letters/numbers/spaces/apostrophes.
 */
function normalise(str) {
  if (typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/\r?\n/g, " ")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Word count of a normalised string.
 */
function wordCount(str) {
  if (!str) return 0;
  return str.split(" ").filter(Boolean).length;
}

/**
 * Whole-word match test.
 * @param {string} text - normalised input
 * @param {string} keyword - single keyword/phrase
 */
function hasWord(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(text);
}

/**
 * Returns true if at least one word from a keyword group matches.
 * @param {string} text
 * @param {string[]} group - synonyms for one concept
 */
function matchesGroup(text, group) {
  return group.some((kw) => hasWord(text, kw));
}

/**
 * Keyword density guard: if more than 40% of unique words are matched
 * keywords across ALL groups, it looks like stuffing — fail it.
 * Threshold is generous enough not to flag legitimately keyword-rich answers.
 */
function isKeywordStuffed(text, allKeywords) {
  const words = new Set(text.split(" ").filter(Boolean));
  if (words.size === 0) return false;
  const matchedCount = [...words].filter((w) =>
    allKeywords.some((kw) => new RegExp(`^${kw}$`).test(w))
  ).length;
  return matchedCount / words.size > 0.4;
}

// ─── Q2 — Prompt Engineering (gates genai-w1) ──────────────────────────────
// Diagnostic: "Why does prompt B behave more reliably in production?"
// B specifies an exact JSON schema and removes format ambiguity.
//
// FRONTEND RESPONSIBILITY:
//   - Enforce a textarea with a minimum of ~30 characters before submission.
//   - Display: "Write at least one full sentence explaining your reasoning."

const Q2_STRONG_KEYWORDS = [
  "schema",
  "constrain",
  "constrained",
  "constraints",
  "ambiguous",
  "ambiguity",
  "explicit",
  "specificity",
  "specific",
  "unambiguous",
  "format",
  "structure",
];

const Q2_ALL_FLAT = Q2_STRONG_KEYWORDS;

export function gradeQ2(answer) {
  const text = normalise(answer);
  const wc = wordCount(text);

  // Gate 1: minimum meaningful response (prevents single-word dumps)
  if (wc < 5) {
    return { passed: false, reason: "too_short", matchedKeywords: [] };
  }

  // Gate 2: keyword stuffing guard
  if (isKeywordStuffed(text, Q2_ALL_FLAT)) {
    return { passed: false, reason: "keyword_stuffed", matchedKeywords: [] };
  }

  // Must contain at least one STRONG keyword (the key insight, not just filler)
  const matched = Q2_STRONG_KEYWORDS.filter((kw) => hasWord(text, kw));

  // "format" alone is too weak — require at least one structural/precision keyword
  const PRECISION_KEYWORDS = [
    "schema",
    "constrain",
    "constrained",
    "constraints",
    "ambiguous",
    "ambiguity",
    "explicit",
    "unambiguous",
    "specificity",
    "specific",
  ];
  const hasPrecisionKeyword = PRECISION_KEYWORDS.some((kw) =>
    hasWord(text, kw)
  );

  if (!hasPrecisionKeyword) {
    return { passed: false, reason: "missing_precision_keyword", matchedKeywords: matched };
  }

  return { passed: true, reason: "passed", matchedKeywords: matched };
}

// ─── Q2b — Context Engineering / Lost-in-Middle (gates genai-w2) ───────────
// Diagnostic: "You put your most important instruction in paragraph 5 of 10.
//              What's the fix, in 5 words or less?"
// Pass: answer contains start/end/beginning/top/bottom positioning intent.
//
// FRONTEND RESPONSIBILITY:
//   - Hard character limit ~60 chars (it's literally "5 words or less").
//   - Display hint: "Answer in 5 words or less."

const Q2B_POSITION_WORDS = [
  "start",
  "beginning",
  "end",
  "first",
  "last",
  "top",
  "bottom",
  "front",
  "head",
  "tail",
  "move it",
  "put it",
];

export function gradeQ2b(answer) {
  const text = normalise(answer);
  const wc = wordCount(text);

  // This should be short — if it's very long, flag as not answering the question
  if (wc > 5) {
    return { passed: false, reason: "too_long_for_question" };
  }

  const hasPositionWord = Q2B_POSITION_WORDS.some((kw) => hasWord(text, kw));

  return {
    passed: hasPositionWord,
    reason: hasPositionWord ? "passed" : "missing_position_keyword",
  };
}

// ─── Q3 — Python Fundamentals (gates genai-w3) ─────────────────────────────
// Diagnostic: predict output of process(data) → ["A"]
// Exact match only — no ambiguity possible.
//
// FRONTEND RESPONSIBILITY:
//   - Single-line input, show the code snippet clearly.

const Q3_VALID_ANSWERS = new Set(["['a']"]);

export function gradeQ3(answer) {
  const text = normalise(answer).replace(/\s/g, "");

  // Accept with or without quotes around A, case-insensitive for the letter
  const passed = Q3_VALID_ANSWERS.has(text);

  return {
    passed,
    reason: passed ? "passed" : "wrong_output",
  };
}

// ─── Q3b — Files/.env/Error Handling (gates genai-w4) ──────────────────────
// Diagnostic: "Where should you NEVER put an API key?"
// MCQ: (a) .env file (b) hardcoded in a committed .py file (c) env variable
// Pass = picks "b" (hardcoded in committed source).
//
// FRONTEND RESPONSIBILITY:
//   - Render as a radio group — only send the selected option letter.

export function gradeQ3b(answer) {
  const text = normalise(answer).replace(/\s/g, "");
  const passed = text === "b";
  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q4 — LangChain / LCEL (gates genai-w5) ────────────────────────────────
// Diagnostic: fill in the blank — chain = prompt | model | ______
// Pass: StrOutputParser (or close variants)
// Partial: generic "parser" keyword → route to 10-min refresher, keep week as optional
//
// FRONTEND RESPONSIBILITY:
//   - Single-line code input field.
//   - Placeholder: "e.g. StrOutputParser()"

const Q4_FULL_PASS_KEYWORDS = [
  "stroutputparser",
  "str output parser",
  "stroutput parser",
  "outputparser",
  "output parser",
];
const Q4_PARTIAL_KEYWORDS = ["parser"];

export function gradeQ4(answer) {
  const text = normalise(answer).replace(/[()]/g, "");

  const isFullPass = Q4_FULL_PASS_KEYWORDS.some((kw) => text.includes(kw));
  if (isFullPass) {
    return { passed: true, partial: false, reason: "passed" };
  }

  const isPartial = Q4_PARTIAL_KEYWORDS.some((kw) => hasWord(text, kw));
  if (isPartial) {
    return { passed: false, partial: true, reason: "partial_credit" };
  }

  return { passed: false, partial: false, reason: "wrong_answer" };
}

// ─── Q5 — Embeddings / Semantic Search (gates genai-w6) ────────────────────
// Diagnostic: MCQ — which pair has closer embeddings?
// A: "return this product" / "get a refund" (intent match, no word overlap)
// B: "return this product" / "love this product" (word overlap, opposite intent)
// Pass = "A" (semantic similarity > lexical similarity).
//
// FRONTEND RESPONSIBILITY:
//   - Render as a clear two-option radio group with both phrases shown.

export function gradeQ5(answer) {
  const text = normalise(answer).replace(/\s/g, "");
  const passed = text === "a";
  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q6 — RAG Pipeline Order (gates genai-w7) ──────────────────────────────
// Diagnostic: order 5 steps: load document, chunk, embed, retrieve, generate answer
// Canonical order: load → chunk → embed → retrieve → generate
//
// Accept flexible label matching (normalised, not exact string match).
// FRONTEND RESPONSIBILITY:
//   - Drag-and-drop order interface — send as an ordered array of strings.

// Canonical step labels with all acceptable aliases
const Q6_CANONICAL = [
  ["load document", "load", "load documents", "loader", "document loader"],
  ["chunk", "chunking", "split", "splitting", "text split", "text splitting"],
  ["embed", "embedding", "embeddings", "embed chunks", "vectorise", "vectorize"],
  ["retrieve", "retrieval", "retriever", "search", "similarity search"],
  ["generate answer", "generate", "generation", "answer", "llm", "produce answer"],
];

function normaliseStep(step) {
  return normalise(typeof step === "string" ? step : "");
}

function matchesCanonicalStep(stepText, canonicalAliases) {
  return canonicalAliases.some((alias) => stepText.includes(alias));
}

export function gradeQ6(answerArray) {
  if (!Array.isArray(answerArray) || answerArray.length !== 5) {
    return { passed: false, reason: "wrong_length" };
  }

  const normalisedSteps = answerArray.map(normaliseStep);

  for (let i = 0; i < 5; i++) {
    if (!matchesCanonicalStep(normalisedSteps[i], Q6_CANONICAL[i])) {
      return {
        passed: false,
        reason: `wrong_step_at_position_${i + 1}`,
        submittedOrder: answerArray,
      };
    }
  }

  return { passed: true, reason: "passed" };
}

// ─── Q7 — FastAPI + Async (gates genai-w8) ─────────────────────────────────
// Diagnostic: "What's missing that would make this fail as soon as a second
//              person calls it while the first request is still processing?"
// Pass: mentions async/concurrency/non-blocking concepts.
//
// FRONTEND RESPONSIBILITY:
//   - Textarea, show the code snippet clearly.
//   - Hint: "Think about what happens to the second user's request."

const Q7_CONCEPT_GROUPS = {
  async: ["async", "asynchronous", "await", "async def"],
  concurrency: ["concurrent", "concurrency", "simultaneous", "parallel", "at the same time"],
  blocking: ["blocking", "non blocking", "nonblocking", "blocks", "blocked", "block"],
};

const Q7_ALL_KEYWORDS = Object.values(Q7_CONCEPT_GROUPS).flat();

export function gradeQ7(answer) {
  const text = normalise(answer);
  const wc = wordCount(text);

  // Gate: must be a real sentence, not a keyword dump
  if (wc < 5) {
    return { passed: false, reason: "too_short", matchedKeywords: [] };
  }

  if (isKeywordStuffed(text, Q7_ALL_KEYWORDS)) {
    return { passed: false, reason: "keyword_stuffed", matchedKeywords: [] };
  }

  // Need at least ONE concept group to match
  const matchedGroups = Object.entries(Q7_CONCEPT_GROUPS)
    .filter(([, group]) => matchesGroup(text, group))
    .map(([name]) => name);

  const matched = Q7_ALL_KEYWORDS.filter((kw) => hasWord(text, kw));

  if (matchedGroups.length === 0) {
    return { passed: false, reason: "no_relevant_concept", matchedKeywords: matched };
  }

  return { passed: true, reason: "passed", matchedKeywords: matched };
}

// ─── Q7b — Pydantic / Structured Outputs (gates genai-w9) ──────────────────
// Diagnostic: "What's the one-line reason to return a Pydantic model instead
//              of a raw dict from your endpoint?"
// Pass: mentions validation / schema / type safety / enforcement.
//
// FRONTEND RESPONSIBILITY:
//   - Single-line or short textarea input.

const Q7B_CONCEPT_GROUPS = {
  validation: ["validation", "validate", "validated", "validates"],
  schema: ["schema", "structure", "structured", "shape"],
  typesafety: ["type safe", "type safety", "typed", "types", "type checking"],
  enforcement: ["enforce", "enforces", "enforced", "guaranteed", "guarantees"],
};

const Q7B_ALL_KEYWORDS = Object.values(Q7B_CONCEPT_GROUPS).flat();

export function gradeQ7b(answer) {
  const text = normalise(answer);
  const wc = wordCount(text);

  if (wc < 3) {
    return { passed: false, reason: "too_short" };
  }

  if (isKeywordStuffed(text, Q7B_ALL_KEYWORDS)) {
    return { passed: false, reason: "keyword_stuffed" };
  }

  const matchedGroups = Object.entries(Q7B_CONCEPT_GROUPS)
    .filter(([, group]) => matchesGroup(text, group))
    .map(([name]) => name);

  return {
    passed: matchedGroups.length > 0,
    reason: matchedGroups.length > 0 ? "passed" : "no_relevant_concept",
  };
}

// ─── Q8 — Agents / LangGraph (gates genai-w10) ─────────────────────────────
// Diagnostic: "What's the actual difference between a chain and an agent?"
// Pass: 2 of 3 concept groups present. "More advanced" alone fails.
//
// Concept groups:
//   LOOP    — agent loops / iterates / is not linear
//   RUNTIME — decisions happen at runtime / dynamically
//   TOOL    — agent picks/selects tools based on state
//
// FRONTEND RESPONSIBILITY:
//   - Textarea — encourage one clear sentence.
//   - Hint: "Focus on the structural difference in how they execute."
//   - CRITICAL: Show character minimum (e.g. 30 chars) to prevent
//     "loop runtime tool" three-word dumps passing the server grader.
//     The server requires ≥10 words as an additional gate.

const Q8_CONCEPT_GROUPS = {
  loop: [
    "loop", "loops", "looping", "looped",
    "iterates", "iteration", "iterative",
    "cycles", "cyclic", "repeated", "repeats",
    "not linear", "nonlinear", "not fixed",
  ],
  runtime: [
    "runtime", "run time",
    "dynamically", "dynamic",
    "decides", "decide", "decision",
    "chooses", "choose",
    "picks", "pick",
    "based on state", "based on current",
    "at each step", "each step",
    "next action",
  ],
  tool: [
    "tool", "tools",
    "tool selection", "tool use",
    "selects a tool", "pick a tool",
    "which tool",
  ],
};

const Q8_ALL_KEYWORDS = Object.values(Q8_CONCEPT_GROUPS).flat();

export function gradeQ8(answer) {
  const text = normalise(answer);
  const wc = wordCount(text);

  // Gate 1: must be a full sentence, not a keyword list
  if (wc < 10) {
    return {
      passed: false,
      reason: "too_short",
      matchedGroups: [],
      matchedKeywords: [],
    };
  }

  // Gate 2: keyword stuffing guard
  if (isKeywordStuffed(text, Q8_ALL_KEYWORDS)) {
    return {
      passed: false,
      reason: "keyword_stuffed",
      matchedGroups: [],
      matchedKeywords: [],
    };
  }

  // Count which concept groups are present
  const matchedGroups = Object.entries(Q8_CONCEPT_GROUPS)
    .filter(([, group]) => matchesGroup(text, group))
    .map(([name]) => name);

  const matched = Q8_ALL_KEYWORDS.filter((kw) => hasWord(text, kw));

  // Need 2 of 3 groups
  if (matchedGroups.length >= 2) {
    return {
      passed: true,
      reason: "passed",
      matchedGroups,
      matchedKeywords: matched,
    };
  }

  return {
    passed: false,
    reason: `only_${matchedGroups.length}_of_3_concepts_found`,
    matchedGroups,
    matchedKeywords: matched,
  };
}
