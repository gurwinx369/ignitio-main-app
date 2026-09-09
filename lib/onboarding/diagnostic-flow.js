export const QUESTION_IDS = Object.freeze({
  Q1: "q1",
  CASUAL_API_USAGE: "casual_api_usage",
  TECHNOLOGIES_USED: "technologies_used",
  PROJECT_TYPE: "project_type",
  Q2: "q2",
  Q2b: "q2b",
  Q3: "q3",
  Q3b: "q3b",
  Q4: "q4",
  Q5: "q5",
  Q6: "q6",
  Q7: "q7",
  Q7b: "q7b",
  Q8: "q8",
  Q9: "q9",
  Q10: "q10",
});

export const ROUTING_ANSWERS = Object.freeze({
  Q1: Object.freeze({
    NEVER_TOUCHED: "never_touched_llm",
    CASUAL_CHAT: "casual_chatgpt_user",
    CALLED_API: "called_api_before",
    SHIPPED_PROJECT: "shipped_rag_or_agent",
  }),

  CASUAL_API: Object.freeze({
    CHAT_ONLY: "chat_only",
    CALLED_API: "called_llm_api",
  }),

  PROJECT: Object.freeze({
    RAG: "rag",
    AGENT: "agent",
    BOTH: "both",
  }),

  TECH: Object.freeze({
    LANGCHAIN: "langchain",
    EMBEDDINGS: "embeddings",
    RAG: "rag",
    API_FRAMEWORK: "api_framework",
    STRUCTURED_OUTPUTS: "structured_outputs",
    AGENTS: "agents",
  }),
});

const TECHNICAL_QUESTION_ORDER = Object.freeze([
  QUESTION_IDS.Q4,
  QUESTION_IDS.Q5,
  QUESTION_IDS.Q6,
  QUESTION_IDS.Q7,
  QUESTION_IDS.Q7b,
  QUESTION_IDS.Q8,
]);

function hasAnsweredMultiSelect(value) {
  return Array.isArray(value);
}

function resolveSelectedTechnicalQuestions({
  technologiesUsed,
  projectType = null,
}) {
  const requiredQuestions = new Set();

  if (
    projectType === ROUTING_ANSWERS.PROJECT.RAG ||
    projectType === ROUTING_ANSWERS.PROJECT.BOTH
  ) {
    requiredQuestions.add(QUESTION_IDS.Q5);
    requiredQuestions.add(QUESTION_IDS.Q6);
  }

  if (
    projectType === ROUTING_ANSWERS.PROJECT.AGENT ||
    projectType === ROUTING_ANSWERS.PROJECT.BOTH
  ) {
    requiredQuestions.add(QUESTION_IDS.Q8);
  }

  for (const technology of technologiesUsed) {
    switch (technology) {
      case ROUTING_ANSWERS.TECH.LANGCHAIN:
        requiredQuestions.add(QUESTION_IDS.Q4);
        break;

      case ROUTING_ANSWERS.TECH.EMBEDDINGS:
        requiredQuestions.add(QUESTION_IDS.Q5);
        break;

      case ROUTING_ANSWERS.TECH.RAG:
        requiredQuestions.add(QUESTION_IDS.Q5);
        requiredQuestions.add(QUESTION_IDS.Q6);
        break;

      case ROUTING_ANSWERS.TECH.API_FRAMEWORK:
        requiredQuestions.add(QUESTION_IDS.Q7);
        break;

      case ROUTING_ANSWERS.TECH.STRUCTURED_OUTPUTS:
        requiredQuestions.add(QUESTION_IDS.Q7b);
        break;

      case ROUTING_ANSWERS.TECH.AGENTS:
        requiredQuestions.add(QUESTION_IDS.Q8);
        break;

      default:
        break;
    }
  }

  return TECHNICAL_QUESTION_ORDER.filter((questionId) =>
    requiredQuestions.has(questionId),
  );
}

/**
 * Resolve the longest currently reachable diagnostic route.
 *
 * Routing answers decide which competency checks are shown.
 * They never directly skip roadmap modules.
 *
 * An empty technologies_used array is a valid explicit
 * "None of these" answer.
 *
 * @param {Record<string, unknown>} answers
 * @returns {string[]}
 */
export function resolveDiagnosticRoute(answers = {}) {
  const route = [QUESTION_IDS.Q1];
  const q1 = answers[QUESTION_IDS.Q1];

  if (!q1) {
    return route;
  }

  switch (q1) {
    case ROUTING_ANSWERS.Q1.NEVER_TOUCHED: {
      route.push(QUESTION_IDS.Q9, QUESTION_IDS.Q10);
      return route;
    }

    case ROUTING_ANSWERS.Q1.CASUAL_CHAT: {
      route.push(
        QUESTION_IDS.Q2,
        QUESTION_IDS.Q2b,
        QUESTION_IDS.CASUAL_API_USAGE,
      );

      const casualApiUsage = answers[QUESTION_IDS.CASUAL_API_USAGE];

      if (!casualApiUsage) {
        return route;
      }

      if (casualApiUsage === ROUTING_ANSWERS.CASUAL_API.CHAT_ONLY) {
        route.push(QUESTION_IDS.Q9, QUESTION_IDS.Q10);
        return route;
      }

      if (casualApiUsage !== ROUTING_ANSWERS.CASUAL_API.CALLED_API) {
        return route;
      }

      route.push(
        QUESTION_IDS.Q3,
        QUESTION_IDS.Q3b,
        QUESTION_IDS.TECHNOLOGIES_USED,
      );

      const technologiesUsed =
        answers[QUESTION_IDS.TECHNOLOGIES_USED];

      if (!hasAnsweredMultiSelect(technologiesUsed)) {
        return route;
      }

      route.push(
        ...resolveSelectedTechnicalQuestions({
          technologiesUsed,
        }),
        QUESTION_IDS.Q9,
        QUESTION_IDS.Q10,
      );

      return route;
    }

    case ROUTING_ANSWERS.Q1.CALLED_API: {
      route.push(
        QUESTION_IDS.Q2,
        QUESTION_IDS.Q2b,
        QUESTION_IDS.Q3,
        QUESTION_IDS.Q3b,
        QUESTION_IDS.TECHNOLOGIES_USED,
      );

      const technologiesUsed =
        answers[QUESTION_IDS.TECHNOLOGIES_USED];

      if (!hasAnsweredMultiSelect(technologiesUsed)) {
        return route;
      }

      route.push(
        ...resolveSelectedTechnicalQuestions({
          technologiesUsed,
        }),
        QUESTION_IDS.Q9,
        QUESTION_IDS.Q10,
      );

      return route;
    }

    case ROUTING_ANSWERS.Q1.SHIPPED_PROJECT: {
      route.push(QUESTION_IDS.PROJECT_TYPE);

      const projectType = answers[QUESTION_IDS.PROJECT_TYPE];

      if (!projectType) {
        return route;
      }

      route.push(QUESTION_IDS.TECHNOLOGIES_USED);

      const technologiesUsed =
        answers[QUESTION_IDS.TECHNOLOGIES_USED];

      if (!hasAnsweredMultiSelect(technologiesUsed)) {
        return route;
      }

      route.push(
        ...resolveSelectedTechnicalQuestions({
          technologiesUsed,
          projectType,
        }),
        QUESTION_IDS.Q9,
        QUESTION_IDS.Q10,
      );

      return route;
    }

    default:
      return route;
  }
}

export function isCompleteDiagnosticRoute(route) {
  return (
    Array.isArray(route) &&
    route.length > 0 &&
    route[route.length - 1] === QUESTION_IDS.Q10
  );
}