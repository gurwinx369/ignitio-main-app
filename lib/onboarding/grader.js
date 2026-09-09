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
// Diagnostic: "Why does Prompt B behave more reliably in production?"
// MCQ: pass = "b" — explicit JSON schema constraint.

export function gradeQ2(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "b";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q2b — Context Engineering / Lost-in-Middle (gates genai-w2) ───────────
// Diagnostic: "Where should an important instruction generally be placed
// in a long prompt?"
// MCQ: pass = "a".

export function gradeQ2b(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q3 — Python Fundamentals (gates genai-w3) ─────────────────────────────
// Diagnostic: predict output of process(data) → ['A']
// MCQ: pass = "a".

export function gradeQ3(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
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
// MCQ: pass = "a" — StrOutputParser().

export function gradeQ4(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
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
// Diagnostic: avoid blocking FastAPI's event loop with a blocking operation.
// MCQ: pass = "a".

export function gradeQ7(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q7b — Pydantic / Structured Outputs (gates genai-w9) ──────────────────
// Diagnostic: why return a Pydantic model instead of a raw dict?
// MCQ: pass = "a".

export function gradeQ7b(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}

// ─── Q8 — Agents / LangGraph (gates genai-w10) ─────────────────────────────
// Diagnostic: "What's the key difference between a chain and an agent?"
// MCQ: pass = "a".

export function gradeQ8(answer) {
  const passed = normalise(answer).replace(/\s/g, "") === "a";

  return {
    passed,
    reason: passed ? "passed" : "wrong_choice",
  };
}
