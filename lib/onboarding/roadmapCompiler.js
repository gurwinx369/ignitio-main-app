// Roadmap compiler — pure function, no DB, no side effects.
//
// Takes the full Gen AI roadmap template (from DB, as a lean JS object)
// and a routing decisions map, then returns:
//   { includedDayIds, optionalDayIds, skippedDayIds, totalLevels, skipReasonMap }
//
// "Day" in this context = one week of the Gen AI roadmap.
// "Level" = one roadmap-day within that week.

// ─── Routing decision shape ─────────────────────────────────────────────────
//
// routingDecisions is a Map or plain object keyed by dayId, e.g.:
// {
//   "genai-w1": { action: "skip",    triggeredBy: "Q2",  reason: "You nailed the prompt engineering check — 7 days back." },
//   "genai-w2": { action: "skip",    triggeredBy: "Q2b", reason: "Context engineering check passed — 7 more days back." },
//   "genai-w5": { action: "optional", triggeredBy: "Q4",  reason: "Partial LangChain credit — treat Week 5 as a light refresher." },
//   "genai-w11":{ action: "keep",    triggeredBy: null,  reason: null }, // never skippable
// }
//
// action values: "skip" | "keep" | "optional"

/**
 * Compile the personalized roadmap from the full template + routing decisions.
 *
 * @param {object} template  - lean RoadmapTemplate document from MongoDB
 * @param {object} routing   - plain object: { [dayId]: { action, triggeredBy, reason } }
 * @returns {{
 *   includedDayIds: string[],
 *   optionalDayIds: string[],
 *   skippedDayIds: string[],
 *   totalLevels: number,
 *   skipReasonMap: Record<string, { triggeredBy: string, reason: string, levelsSaved: number }>
 * }}
 */
export function compileRoadmap(template, routing) {
  const includedDayIds = [];
  const optionalDayIds = [];
  const skippedDayIds = [];
  const skipReasonMap = {};
  let totalLevels = 0;

  for (const day of template.days) {
    const decision = routing[day.id];
    const action = decision?.action ?? "keep";

    if (action === "skip") {
      skippedDayIds.push(day.id);
      skipReasonMap[day.id] = {
        triggeredBy: decision.triggeredBy ?? null,
        reason: decision.reason ?? "",
        levelsSaved: day.levels.length,
      };
    } else if (action === "optional") {
      optionalDayIds.push(day.id);
      // Optional days ARE included in the roadmap — user can skim them
      includedDayIds.push(day.id);
      totalLevels += day.levels.length;
    } else {
      // "keep"
      includedDayIds.push(day.id);
      totalLevels += day.levels.length;
    }
  }

  return {
    includedDayIds,
    optionalDayIds,
    skippedDayIds,
    totalLevels,
    skipReasonMap,
  };
}

// ─── Build routing decisions from diagnostic results ────────────────────────

/**
 * Map diagnostic results to routing decisions for each week.
 *
 * @param {object} diagnostics - { q1, q2, q2b, q3, q3b, q4, q5, q6, q7, q7b, q8 }
 *   Each value: { passed: boolean, partial?: boolean, skipped: boolean }
 * @returns {object} routing — plain object keyed by dayId
 */
export function buildRouting(diagnostics) {
  const {
    q1,
    q2,
    q2b,
    q3,
    q3b,
    q4,
    q5,
    q6,
    q7,
    q7b,
    q8,
  } = diagnostics;

  const routing = {};

  const q1Value = q1?.value;

  // Week 1 — Prompt Engineering
  if (q2?.notAssessed) {
    routing["genai-w1"] = keep();
  } else if (q2?.passed) {
    routing["genai-w1"] = skip("Q2", "You nailed the prompt engineering check — 7 days back.");
  } else if (q1Value === "casual_chatgpt_user") {
    // Keep Week 1 but note the first 2 levels can be lighter (handled elsewhere)
    routing["genai-w1"] = keep();
  } else {
    routing["genai-w1"] = keep();
  }

  // Week 2 — Context Engineering
  if (q2b?.notAssessed) {
    routing["genai-w2"] = keep();
  } else if (q2b?.passed) {
    routing["genai-w2"] = skip("Q2b", "Context engineering check passed — 7 more days back.");
  } else {
    routing["genai-w2"] = keep();
  }

  // Week 3 — Python Fundamentals
  if (q3?.notAssessed) {
    routing["genai-w3"] = keep();
  } else if (q3?.passed) {
    routing["genai-w3"] = skip("Q3", "Python fundamentals check passed — Week 3 skipped.");
  } else {
    routing["genai-w3"] = keep();
  }

  // Week 4 — Files / .env / Error Handling
  if (q3b?.notAssessed) {
    routing["genai-w4"] = keep();
  } else if (q3b?.passed) {
    routing["genai-w4"] = skip("Q3b", "Secrets handling check passed — Week 4 skipped.");
  } else {
    routing["genai-w4"] = keep();
  }

  // Week 5 — LangChain
  if (q4?.notAssessed) {
    routing["genai-w5"] = keep();
  } else if (q4?.passed) {
    routing["genai-w5"] = skip("Q4", "LangChain/LCEL check passed — Week 5 skipped.");
  } else if (q4?.partial) {
    routing["genai-w5"] = optional("Q4", "Partial LangChain credit — treat Week 5 as a light refresher (optional).");
  } else {
    routing["genai-w5"] = keep();
  }

  // Week 6 — Embeddings
  if (q5?.notAssessed) {
    routing["genai-w6"] = keep();
  } else if (q5?.passed) {
    routing["genai-w6"] = skip("Q5", "Semantic search check passed — Week 6 skipped.");
  } else {
    routing["genai-w6"] = keep();
  }

  // Week 7 — RAG Pipeline
  if (q6?.notAssessed) {
    routing["genai-w7"] = keep();
  } else if (q6?.passed) {
    routing["genai-w7"] = skip("Q6", "RAG pipeline order check passed — Week 7 skipped.");
  } else {
    routing["genai-w7"] = keep();
  }

  // Week 8 — FastAPI
  if (q7?.notAssessed) {
    routing["genai-w8"] = keep();
  } else if (q7?.passed) {
    routing["genai-w8"] = skip("Q7", "Async/concurrency check passed — Week 8 skipped. 7 days back.");
  } else {
    routing["genai-w8"] = keep();
  }

  // Week 9 — Structured Outputs / Pydantic
  if (q7b?.notAssessed) {
    routing["genai-w9"] = keep();
  } else if (q7b?.passed) {
    routing["genai-w9"] = skip("Q7b", "Pydantic check passed — Week 9 skipped.");
  } else {
    routing["genai-w9"] = keep();
  }

  // Week 10 — LangGraph / Agents
  if (q8?.notAssessed) {
    routing["genai-w10"] = keep();
  } else if (q8?.passed) {
    routing["genai-w10"] = skip("Q8", "Agent/chain distinction check passed — Week 10 skipped.");
  } else {
    routing["genai-w10"] = keep();
  }

  // Week 11 — LangSmith + RAGAS: NEVER skippable (by product design)
  routing["genai-w11"] = keep();

  // Week 12 — Portfolio: NEVER skippable
  routing["genai-w12"] = keep();

  return routing;
}

// ─── Factory helpers ────────────────────────────────────────────────────────

function skip(triggeredBy, reason) {
  return { action: "skip", triggeredBy, reason };
}

function optional(triggeredBy, reason) {
  return { action: "optional", triggeredBy, reason };
}

function keep() {
  return { action: "keep", triggeredBy: null, reason: null };
}
