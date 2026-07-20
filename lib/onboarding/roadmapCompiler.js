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

  // ── Week 1 (genai-w1) — Prompt Engineering ──────────────────────────────
  // Q1 = "never_touched_llm": keep all
  // Q1 = "casual_chatgpt_user": partial skip — handled via optionalFlags on
  //   Days 1–2 (not full week skip; we keep the week, mark first 2 levels optional)
  //   For simplicity in the routing table, we keep the week and let the frontend
  //   know via the onboarding exclusions which specific levels are optional.
  // Q1 = "called_api_before": goes to Q2 diagnostic
  // Q1 = "shipped_rag_or_agent": fast-track — Q2 not attempted, treat as skipped

  const q1Value = q1?.value;
  const fastTrack = q1Value === "shipped_rag_or_agent";

  if (fastTrack) {
    // Fast-track: skip Weeks 1–10, keep 11–12
    // Q7 and Q8 may still gate Weeks 8–10
    routing["genai-w1"] = skip("Q1", "You've shipped a RAG or agent project — skipping Weeks 1–2. 14 days saved.");
    routing["genai-w2"] = skip("Q1", "Skipped via fast-track — context engineering.");
    routing["genai-w3"] = skip("Q1", "Skipped via fast-track — Python fundamentals.");
    routing["genai-w4"] = skip("Q1", "Skipped via fast-track — files/env/error handling.");
    routing["genai-w5"] = skip("Q1", "Skipped via fast-track — LangChain.");
    routing["genai-w6"] = skip("Q1", "Skipped via fast-track — embeddings.");
    routing["genai-w7"] = skip("Q1", "Skipped via fast-track — RAG pipeline.");
  } else {
    // Non-fast-track: use Q2 result to gate Week 1
    if (q2?.passed) {
      routing["genai-w1"] = skip("Q2", "You nailed the prompt engineering check — 7 days back.");
    } else if (q1Value === "casual_chatgpt_user") {
      // Keep Week 1 but note the first 2 levels can be lighter
      routing["genai-w1"] = keep();
    } else {
      routing["genai-w1"] = keep();
    }

    // Week 2 — Context Engineering
    if (q2b?.passed) {
      routing["genai-w2"] = skip("Q2b", "Context engineering check passed — 7 more days back.");
    } else {
      routing["genai-w2"] = keep();
    }

    // Week 3 — Python Fundamentals
    if (q3?.passed) {
      routing["genai-w3"] = skip("Q3", "Python fundamentals check passed — Week 3 skipped.");
    } else {
      routing["genai-w3"] = keep();
    }

    // Week 4 — Files / .env / Error Handling
    if (q3b?.passed) {
      routing["genai-w4"] = skip("Q3b", "Secrets handling check passed — Week 4 skipped.");
    } else {
      routing["genai-w4"] = keep();
    }

    // Week 5 — LangChain
    if (q4?.passed) {
      routing["genai-w5"] = skip("Q4", "LangChain/LCEL check passed — Week 5 skipped.");
    } else if (q4?.partial) {
      routing["genai-w5"] = optional("Q4", "Partial LangChain credit — treat Week 5 as a light refresher (optional).");
    } else {
      routing["genai-w5"] = keep();
    }

    // Week 6 — Embeddings
    if (q5?.passed) {
      routing["genai-w6"] = skip("Q5", "Semantic search check passed — Week 6 skipped.");
    } else {
      routing["genai-w6"] = keep();
    }

    // Week 7 — RAG Pipeline
    if (q6?.passed) {
      routing["genai-w7"] = skip("Q6", "RAG pipeline order check passed — Week 7 skipped.");
      // Days 48–49 (Levels 5–6 of genai-w7) are eval-mindset — flag as optional
      // This is surfaced via optionalFlags in the OnboardingResponse document,
      // not via the compiler (compiler works at day-level granularity only).
    } else {
      routing["genai-w7"] = keep();
    }
  }

  // Week 8 — FastAPI (applies to both fast-track and regular)
  if (fastTrack || q7?.passed) {
    routing["genai-w8"] = skip(
      fastTrack ? "Q1" : "Q7",
      fastTrack
        ? "Skipped via fast-track — FastAPI."
        : "Async/concurrency check passed — Week 8 skipped. 7 days back."
    );
  } else {
    routing["genai-w8"] = keep();
  }

  // Week 9 — Structured Outputs / Pydantic
  if (fastTrack || q7b?.passed) {
    routing["genai-w9"] = skip(
      fastTrack ? "Q1" : "Q7b",
      fastTrack
        ? "Skipped via fast-track — Pydantic/structured outputs."
        : "Pydantic check passed — Week 9 skipped."
    );
  } else {
    routing["genai-w9"] = keep();
  }

  // Week 10 — LangGraph / Agents
  if (fastTrack || q8?.passed) {
    routing["genai-w10"] = skip(
      fastTrack ? "Q1" : "Q8",
      fastTrack
        ? "Skipped via fast-track — agents."
        : "Agent/chain distinction check passed — Week 10 skipped."
    );
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
