export function buildDiagnosticResults(doc) {
  const {
    responses = [],
    dailyDurationCategory,
    primaryGoalSnapshot,
  } = doc;

  // Adaptive records use lowercase IDs. Older records may use uppercase IDs.
  const getResponse = (...questionIds) =>
    responses.find((response) =>
      questionIds.includes(response.questionId),
    );

  const q2 = getResponse("q2", "Q2");
  const q2b = getResponse("q2b", "Q2b");
  const q3 = getResponse("q3", "Q3");
  const q3b = getResponse("q3b", "Q3b");
  const q4 = getResponse("q4", "Q4");
  const q5 = getResponse("q5", "Q5");
  const q6 = getResponse("q6", "Q6");
  const q7 = getResponse("q7", "Q7");
  const q7b = getResponse("q7b", "Q7b");
  const q8 = getResponse("q8", "Q8");

  const parseOutcome = (
    response,
    passedExplanation,
    needsWorkExplanation,
  ) => {
    if (!response) {
      return {
        status: "needs_work",
        decision: "keep",
        explanation:
          "We couldn’t find a result for this check, so the related material will remain.",
      };
    }

    if (response.notAssessed) {
      return {
        status: "not_assessed",
        decision: "keep",
        explanation:
          "This skill was not assessed, so the full module remains included in your roadmap.",
      };
    }

    if (response.skipped) {
      return {
        status: "skipped",
        decision: "keep",
        explanation:
          "You chose to skip this check, so the module remains included.",
      };
    }

    if (response.gradingMeta?.partial) {
      return {
        status: "partial",
        decision: "refresher",
        explanation:
          "You earned partial credit. This module will serve as a light refresher.",
      };
    }

    if (response.passed) {
      return {
        status: "passed",
        decision: "compress",
        explanation:
          passedExplanation ||
          "You demonstrated this skill clearly, so this area may be compressed in a personalized roadmap.",
      };
    }

    return {
      status: "needs_work",
      decision: "keep",
      explanation:
        needsWorkExplanation ||
        "This skill will remain in your roadmap for guided practice.",
    };
  };

  const areas = [
    {
      id: "prompt_specificity",
      title: "Prompt specificity",
      moduleLabel: "Week 1",
      ...parseOutcome(
        q2,
        "You nailed the prompt engineering check. This area may be compressed.",
        "We’ll keep this area so you can strengthen foundational prompt engineering.",
      ),
    },
    {
      id: "context_placement",
      title: "Context placement",
      moduleLabel: "Week 2",
      ...parseOutcome(
        q2b,
        "You demonstrated a clear understanding of context engineering.",
        "We’ll keep this area to strengthen your context management skills.",
      ),
    },
    {
      id: "python_fundamentals",
      title: "Python fundamentals",
      moduleLabel: "Week 3",
      ...parseOutcome(
        q3,
        "You correctly demonstrated Python control flow and fundamentals.",
        "We’ll keep this module to reinforce Python basics.",
      ),
    },
    {
      id: "api_key_safety",
      title: "API-key safety",
      moduleLabel: "Week 4 check",
      ...parseOutcome(
        q3b,
        "You correctly identified secrets handling best practices.",
        "We’ll keep this module to cover critical environment and secrets handling.",
      ),
    },
    {
      id: "langchain_lcel",
      title: "LangChain / LCEL",
      moduleLabel: "Week 5",
      ...parseOutcome(
        q4,
        "You demonstrated understanding of LangChain and LCEL.",
        "We’ll keep this area to strengthen your framework knowledge.",
      ),
    },
    {
      id: "embeddings",
      title: "Embeddings",
      moduleLabel: "Week 6",
      ...parseOutcome(
        q5,
        "You showed a solid grasp of embeddings and semantic search.",
        "We’ll keep this module to reinforce semantic search concepts.",
      ),
    },
    {
      id: "rag_pipeline",
      title: "RAG pipeline",
      moduleLabel: "Week 7",
      ...parseOutcome(
        q6,
        "You correctly ordered the steps in a RAG pipeline.",
        "We’ll keep this area to ensure a solid foundation in RAG architecture.",
      ),
    },
    {
      id: "api_concurrency",
      title: "API concurrency",
      moduleLabel: "Week 8",
      ...parseOutcome(
        q7,
        "You demonstrated asynchronous programming and API concurrency skills.",
        "We’ll keep this module to cover async programming and FastAPI.",
      ),
    },
    {
      id: "structured_outputs",
      title: "Structured outputs",
      moduleLabel: "Week 9",
      ...parseOutcome(
        q7b,
        "You successfully extracted structured data.",
        "We’ll keep this area to strengthen your use of structured outputs.",
      ),
    },
    {
      id: "agents",
      title: "Agents",
      moduleLabel: "Week 10",
      ...parseOutcome(
        q8,
        "You demonstrated a clear distinction between agents and chains.",
        "We’ll keep this module to cover agentic workflows.",
      ),
    },
  ];

  const passedChecks = areas.filter(
    (area) => area.status === "passed",
  ).length;

  const partialChecks = areas.filter(
    (area) => area.status === "partial",
  ).length;

  const needsWorkChecks = areas.filter(
    (area) => area.status === "needs_work",
  ).length;

  const skippedChecks = areas.filter(
    (area) => area.status === "skipped",
  ).length;

  const notAssessedChecks = areas.filter(
    (area) => area.status === "not_assessed",
  ).length;

  const assessedChecks =
    passedChecks +
    partialChecks +
    needsWorkChecks +
    skippedChecks;

  const summary = {
    passedChecks,
    partialChecks,
    needsWorkChecks,
    skippedChecks,
    notAssessedChecks,
    assessedChecks,

    // Retained for compatibility with existing Results consumers.
    // It now means the number of checks actually assessed.
    totalChecks: assessedChecks,

    totalPossibleChecks: areas.length,

    compressionLabel:
      assessedChecks === 0
        ? "Starting from the foundations"
        : passedChecks > 0
          ? "Several areas may be compressed"
          : "No compression applied",
  };

  let pacing;

  switch (dailyDurationCategory) {
    case "20_30":
      pacing = {
        category: "20_30",
        label: "20–30 minutes per day",
        recommendation:
          "A lighter daily workload with a longer learning calendar should suit your availability.",
      };
      break;

    case "45_60":
      pacing = {
        category: "45_60",
        label: "45–60 minutes per day",
        recommendation:
          "The standard roadmap pace should suit your availability.",
      };
      break;

    case "90_plus":
      pacing = {
        category: "90_plus",
        label: "90+ minutes per day",
        recommendation:
          "A compressed pace may be available, with safeguards against overloading your schedule.",
      };
      break;

    default:
      pacing = {
        category: "45_60",
        label: "45–60 minutes per day",
        recommendation:
          "The standard roadmap pace should suit your availability.",
      };
  }

  let goal;

  switch (primaryGoalSnapshot) {
    case "internship_1_3_months":
      goal = {
        value: "internship_1_3_months",
        label: "Land an internship",
        recommendation:
          "Projects and portfolio work will be framed around internship readiness.",
      };
      break;

    case "build_product":
      goal = {
        value: "build_product",
        label: "Build a real product",
        recommendation:
          "Projects will be framed around building and shipping practical work.",
      };
      break;

    case "curiosity_general":
      goal = {
        value: "curiosity_general",
        label: "Explore applied AI",
        recommendation:
          "The learning experience will remain exploratory while preserving practical projects.",
      };
      break;

    default:
      goal = {
        value: "curiosity_general",
        label: "Explore applied AI",
        recommendation:
          "The learning experience will remain exploratory while preserving practical projects.",
      };
  }

  return {
    summary,
    areas,
    pacing,
    goal,
  };
}