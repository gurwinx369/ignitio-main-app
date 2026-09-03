import { z } from "zod";
import { QUESTIONS } from "../../features/onboarding/diagnostic/constants/questions.js";
import {
  gradeQ2,
  gradeQ2b,
  gradeQ3,
  gradeQ3b,
  gradeQ4,
  gradeQ5,
  gradeQ6,
  gradeQ7,
  gradeQ7b,
  gradeQ8,
} from "./grader.js";
import {
  resolveDiagnosticRoute,
  isCompleteDiagnosticRoute,
  QUESTION_IDS,
  ROUTING_ANSWERS,
} from "./diagnostic-flow.js";

const SKIP_MARKER = "__skipped__";

const TECHNICAL_QUESTION_IDS = Object.freeze([
  QUESTION_IDS.Q2,
  QUESTION_IDS.Q2b,
  QUESTION_IDS.Q3,
  QUESTION_IDS.Q3b,
  QUESTION_IDS.Q4,
  QUESTION_IDS.Q5,
  QUESTION_IDS.Q6,
  QUESTION_IDS.Q7,
  QUESTION_IDS.Q7b,
  QUESTION_IDS.Q8,
]);

const TECHNOLOGY_VALUES = Object.freeze([
  ROUTING_ANSWERS.TECH.LANGCHAIN,
  ROUTING_ANSWERS.TECH.EMBEDDINGS,
  ROUTING_ANSWERS.TECH.RAG,
  ROUTING_ANSWERS.TECH.API_FRAMEWORK,
  ROUTING_ANSWERS.TECH.STRUCTURED_OUTPUTS,
  ROUTING_ANSWERS.TECH.AGENTS,
]);

const Q3B_VALUES = Object.freeze(["a", "b", "c"]);
const Q5_VALUES = Object.freeze(["A", "B"]);
const Q6_ITEM_IDS = Object.freeze([
  "generate_answer",
  "chunk",
  "retrieve",
  "load_document",
  "embed",
]);

const ENTRY_POINT_VALUES = new Set(
  Object.values(ROUTING_ANSWERS.Q1),
);

const CASUAL_API_VALUES = new Set(
  Object.values(
    ROUTING_ANSWERS.CASUAL_API,
  ),
);

const PROJECT_TYPE_VALUES = new Set(
  Object.values(
    ROUTING_ANSWERS.PROJECT,
  ),
);

const TECHNOLOGY_VALUE_SET = new Set(
  TECHNOLOGY_VALUES,
);

const DURATION_VALUES = new Set([
  "20_30",
  "45_60",
  "90_plus",
]);

const GOAL_VALUES = new Set([
  "internship_1_3_months",
  "build_product",
  "curiosity_general",
]);

const QUESTION_BY_ID = new Map(
  QUESTIONS.map((question) => [question.id, question]),
);

const mcqAnswerOrSkipSchema = z
  .union([
    z.enum(["a", "b", "c", "d"]),
    z.literal(SKIP_MARKER),
  ])
  .optional()
  .nullable();

const q3bSchema = z
  .union([z.enum(Q3B_VALUES), z.literal(SKIP_MARKER)])
  .optional()
  .nullable();

const q5Schema = z
  .union([z.enum(Q5_VALUES), z.literal(SKIP_MARKER)])
  .optional()
  .nullable();

const q6OrderingSchema = z
  .array(z.enum(Q6_ITEM_IDS))
  .length(Q6_ITEM_IDS.length)
  .refine(
    (items) => new Set(items).size === Q6_ITEM_IDS.length,
    "Each RAG pipeline step must appear exactly once.",
  );

const q6Schema = z
  .union([q6OrderingSchema, z.literal(SKIP_MARKER)])
  .optional()
  .nullable();

const technologiesSchema = z
  .array(z.enum(TECHNOLOGY_VALUES))
  .max(TECHNOLOGY_VALUES.length)
  .refine(
    (items) => new Set(items).size === items.length,
    "Duplicate technology selections are not allowed.",
  )
  .optional()
  .nullable();

export const DiagnosticPayloadSchema = z.object({
  q1: z.enum([
    ROUTING_ANSWERS.Q1.NEVER_TOUCHED,
    ROUTING_ANSWERS.Q1.CASUAL_CHAT,
    ROUTING_ANSWERS.Q1.CALLED_API,
    ROUTING_ANSWERS.Q1.SHIPPED_PROJECT,
  ]),

  casual_api_usage: z
    .enum([
      ROUTING_ANSWERS.CASUAL_API.CHAT_ONLY,
      ROUTING_ANSWERS.CASUAL_API.CALLED_API,
    ])
    .optional()
    .nullable(),

  technologies_used: technologiesSchema,

  project_type: z
    .enum([
      ROUTING_ANSWERS.PROJECT.RAG,
      ROUTING_ANSWERS.PROJECT.AGENT,
      ROUTING_ANSWERS.PROJECT.BOTH,
    ])
    .optional()
    .nullable(),

  diagnosticPath: z
    .array(z.enum(Object.values(QUESTION_IDS)))
    .optional(),

  q2: mcqAnswerOrSkipSchema,
  q2b: mcqAnswerOrSkipSchema,
  q3: mcqAnswerOrSkipSchema,
  q3b: q3bSchema,
  q4: mcqAnswerOrSkipSchema,
  q5: q5Schema,
  q6: q6Schema,
  q7: mcqAnswerOrSkipSchema,
  q7b: mcqAnswerOrSkipSchema,
  q8: mcqAnswerOrSkipSchema,

  q9: z.enum(["20_30", "45_60", "90_plus"]),

  q10: z.enum([
    "internship_1_3_months",
    "build_product",
    "curiosity_general",
  ]),
});

function isExplicitSkip(answer) {
  return answer === SKIP_MARKER;
}

function hasSubmittedAnswer(answer) {
  if (isExplicitSkip(answer)) {
    return true;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  return answer !== null && answer !== undefined;
}

function validateResolvedRouteAnswers(body, resolvedRoute) {
  if (
    resolvedRoute.includes(QUESTION_IDS.CASUAL_API_USAGE) &&
    !body.casual_api_usage
  ) {
    return "Missing required answer for routing question: casual_api_usage";
  }

  if (
    resolvedRoute.includes(QUESTION_IDS.PROJECT_TYPE) &&
    !body.project_type
  ) {
    return "Missing required answer for routing question: project_type";
  }

  if (
    resolvedRoute.includes(QUESTION_IDS.TECHNOLOGIES_USED) &&
    !Array.isArray(body.technologies_used)
  ) {
    return "Missing required answer for routing question: technologies_used";
  }

  for (const questionId of TECHNICAL_QUESTION_IDS) {
    if (
      resolvedRoute.includes(questionId) &&
      !hasSubmittedAnswer(body[questionId])
    ) {
      return `Missing required diagnostic answer: ${questionId}`;
    }
  }

  return null;
}

function mapQuestionType(questionType) {
  switch (questionType) {
    case "SINGLE_CHOICE":
      return "MCQ";

    case "ORDERING":
      return "ORDERING";

    case "SHORT_TEXT":
      return "SHORT_ANSWER";

    default:
      return "SHORT_ANSWER";
  }
}

function runDiagnostics(body, resolvedRoute) {
  function makeResult({ questionId, grader, gradingMethod }) {
    const isAssessed = resolvedRoute.includes(questionId);

    if (!isAssessed) {
      return {
        questionId,
        passed: false,
        skipped: false,
        notAssessed: true,
        rawAnswer: null,
        score: null,
        gradingMethod: "not_assessed",
        gradingMeta: {
          matchedKeywords: [],
          matchedGroups: [],
          reason: null,
          partial: false,
        },
      };
    }

    const answer = body[questionId];

    if (isExplicitSkip(answer)) {
      return {
        questionId,
        passed: false,
        skipped: true,
        notAssessed: false,
        rawAnswer: SKIP_MARKER,
        score: null,
        gradingMethod,
        gradingMeta: {
          matchedKeywords: [],
          matchedGroups: [],
          reason: null,
          partial: false,
        },
      };
    }

    const gradeResult = grader(answer);

    return {
      questionId,
      passed: gradeResult.passed === true,
      skipped: false,
      notAssessed: false,
      rawAnswer: answer,
      score: typeof gradeResult.score === "number" ? gradeResult.score : null,
      gradingMethod,
      gradingMeta: {
        matchedKeywords: gradeResult.matchedKeywords ?? [],
        matchedGroups: gradeResult.matchedGroups ?? [],
        reason: gradeResult.reason ?? null,
        partial: gradeResult.partial === true,
      },
    };
  }

  return [
    makeResult({ questionId: QUESTION_IDS.Q2, grader: gradeQ2, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q2b, grader: gradeQ2b, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q3, grader: gradeQ3, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q3b, grader: gradeQ3b, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q4, grader: gradeQ4, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q5, grader: gradeQ5, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q6, grader: gradeQ6, gradingMethod: "exact_match" }),
    makeResult({ questionId: QUESTION_IDS.Q7, grader: gradeQ7, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q7b, grader: gradeQ7b, gradingMethod: "multiple_choice" }),
    makeResult({ questionId: QUESTION_IDS.Q8, grader: gradeQ8, gradingMethod: "multiple_choice" }),
  ];
}

/**
 * Evaluates an untrusted diagnostic payload.
 *
 * It is completely pure and has no database side-effects or timing dependencies.
 *
 * @param {object} rawPayload - the untrusted payload
 * @returns {object} A result object:
 * {
 *   success: true,
 *   body,
 *   resolvedRoute,
 *   responses,
 *   notAssessedQuestionIds,
 *   persistenceFields
 * }
 * or
 * {
 *   success: false,
 *   error,
 *   details, // optional
 *   status
 * }
 */
export function evaluateDiagnosticPayload(rawPayload) {
  const parseResult = DiagnosticPayloadSchema.safeParse(rawPayload);

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid payload",
      details: parseResult.error.flatten(),
      status: 400,
    };
  }

  const body = parseResult.data;
  const resolvedRoute = resolveDiagnosticRoute(body);

  if (!isCompleteDiagnosticRoute(resolvedRoute)) {
    return {
      success: false,
      error:
        "The diagnostic route is incomplete. Complete all required routing questions before submitting.",
      status: 400,
    };
  }

  if (body.diagnosticPath) {
    const clientPath = body.diagnosticPath.join(",");
    const serverPath = resolvedRoute.join(",");

    if (clientPath !== serverPath) {
      return {
        success: false,
        error:
          "Submitted diagnostic path does not match the server-resolved route",
        status: 400,
      };
    }
  }

  const answerValidationError = validateResolvedRouteAnswers(body, resolvedRoute);

  if (answerValidationError) {
    return {
      success: false,
      error: answerValidationError,
      status: 400,
    };
  }

  const diagnostics = runDiagnostics(body, resolvedRoute);

  const notAssessedQuestionIds = diagnostics
    .filter((diagnostic) => diagnostic.notAssessed)
    .map((diagnostic) => diagnostic.questionId);

  const responses = diagnostics.map((diagnostic) => {
    const question = QUESTION_BY_ID.get(diagnostic.questionId);

    return {
      questionId: diagnostic.questionId,
      questionText: question?.title ?? diagnostic.questionId,
      questionType: mapQuestionType(question?.type),
      moduleRef: null,
      answerGiven: diagnostic.rawAnswer,
      passed: diagnostic.passed,
      skipped: diagnostic.skipped,
      notAssessed: diagnostic.notAssessed,
      score: diagnostic.score,
      gradingMethod: diagnostic.gradingMethod,
      gradingMeta: diagnostic.gradingMeta,
    };
  });

  const persistenceFields = {
    flowVersion: "adaptive-v1",
    entryPoint: body.q1,
    routingAnswers: {
      casualApiUsage: body.casual_api_usage ?? null,
      technologiesUsed: body.technologies_used ?? [],
      projectType: body.project_type ?? null,
    },
    diagnosticPath: resolvedRoute,
    notAssessedQuestionIds,
    responses,
    primaryGoalSnapshot: body.q10,
    dailyDurationCategory: body.q9,
    status: "completed",
  };

  return {
    success: true,
    body,
    resolvedRoute,
    responses,
    notAssessedQuestionIds,
    persistenceFields,
  };
}

/**
 * Classifies an existing V4 diagnostic document to determine if it is complete and reusable.
 *
 * The compiler requires 10 entries for all the technical questions:
 * q2, q2b, q3, q3b, q4, q5, q6, q7, q7b, q8 (normalized to lowercase).
 *
 * @param {object|null} document
 * @returns {object} { reusable: boolean, reason: string|null }
 */
function invalidV4Diagnostic(
  reason = "invalid_v4_diagnostic",
) {
  return {
    reusable: false,
    reason,
  };
}

/**
 * Classifies an existing V4 diagnostic document.
 *
 * Adaptive records must match the route reconstructed
 * from their persisted routing answers.
 *
 * Legacy linear V4 records without flowVersion remain
 * compatible when they contain one valid outcome for
 * every compiler-required technical question.
 *
 * @param {object|null} document
 * @returns {{
 *   reusable: boolean,
 *   reason:
 *     | "missing_v4_diagnostic"
 *     | "incomplete_v4_diagnostic"
 *     | "invalid_v4_diagnostic"
 *     | null
 * }}
 */
export function classifyV4Diagnostic(
  document,
) {
  if (!document) {
    return invalidV4Diagnostic(
      "missing_v4_diagnostic",
    );
  }

  if (
    document.onboardingVersion !== "v4"
  ) {
    return invalidV4Diagnostic();
  }

  if (document.status !== "completed") {
    return invalidV4Diagnostic(
      "incomplete_v4_diagnostic",
    );
  }

  if (
    !ENTRY_POINT_VALUES.has(
      document.entryPoint,
    )
  ) {
    return invalidV4Diagnostic();
  }

  if (
    !DURATION_VALUES.has(
      document.dailyDurationCategory,
    )
  ) {
    return invalidV4Diagnostic();
  }

  if (
    !GOAL_VALUES.has(
      document.primaryGoalSnapshot,
    )
  ) {
    return invalidV4Diagnostic();
  }

  if (
    document.flowVersion !== undefined &&
    document.flowVersion !==
    "adaptive-v1"
  ) {
    return invalidV4Diagnostic();
  }

  if (
    !Array.isArray(document.responses)
  ) {
    return invalidV4Diagnostic(
      "missing_v4_diagnostic",
    );
  }

  const technicalQuestionSet =
    new Set(TECHNICAL_QUESTION_IDS);

  const responsesById = new Map();

  for (
    const response of document.responses
  ) {
    if (
      !response ||
      typeof response !== "object" ||
      !response.questionId
    ) {
      continue;
    }

    const normalizedId = String(
      response.questionId,
    )
      .trim()
      .toLowerCase();

    if (
      !technicalQuestionSet.has(
        normalizedId,
      )
    ) {
      continue;
    }

    if (
      responsesById.has(normalizedId)
    ) {
      return invalidV4Diagnostic();
    }

    if (
      typeof response.passed !==
      "boolean"
    ) {
      return invalidV4Diagnostic();
    }

    if (
      response.skipped !== undefined &&
      typeof response.skipped !==
      "boolean"
    ) {
      return invalidV4Diagnostic();
    }

    if (
      response.notAssessed !==
      undefined &&
      typeof response.notAssessed !==
      "boolean"
    ) {
      return invalidV4Diagnostic();
    }

    if (
      response.gradingMeta?.partial !==
      undefined &&
      typeof response.gradingMeta
        .partial !== "boolean"
    ) {
      return invalidV4Diagnostic();
    }

    const outcome = {
      passed: response.passed,
      skipped:
        response.skipped === true,
      notAssessed:
        response.notAssessed === true,
      partial:
        response.gradingMeta
          ?.partial === true,
    };

    if (
      outcome.passed &&
      outcome.skipped
    ) {
      return invalidV4Diagnostic();
    }

    if (
      outcome.passed &&
      outcome.notAssessed
    ) {
      return invalidV4Diagnostic();
    }

    if (
      outcome.skipped &&
      outcome.notAssessed
    ) {
      return invalidV4Diagnostic();
    }

    if (
      outcome.partial &&
      (
        outcome.passed ||
        outcome.skipped ||
        outcome.notAssessed
      )
    ) {
      return invalidV4Diagnostic();
    }

    responsesById.set(
      normalizedId,
      outcome,
    );
  }

  if (
    responsesById.size !==
    TECHNICAL_QUESTION_IDS.length
  ) {
    return invalidV4Diagnostic(
      "incomplete_v4_diagnostic",
    );
  }

  /*
   * Legacy linear V4 records may not have
   * flowVersion, diagnosticPath, or routingAnswers.
   *
   * Their ten persisted outcomes remain readable.
   */
  if (
    document.flowVersion !==
    "adaptive-v1"
  ) {
    return {
      reusable: true,
      reason: null,
    };
  }

  const persistedRoutingAnswers =
    document.routingAnswers ?? {};

  const routeInput = {
    [QUESTION_IDS.Q1]:
      document.entryPoint,
  };

  if (
    persistedRoutingAnswers
      .casualApiUsage !== undefined &&
    persistedRoutingAnswers
      .casualApiUsage !== null
  ) {
    if (
      !CASUAL_API_VALUES.has(
        persistedRoutingAnswers
          .casualApiUsage,
      )
    ) {
      return invalidV4Diagnostic();
    }

    routeInput[
      QUESTION_IDS.CASUAL_API_USAGE
    ] =
      persistedRoutingAnswers
        .casualApiUsage;
  }

  if (
    persistedRoutingAnswers
      .projectType !== undefined &&
    persistedRoutingAnswers
      .projectType !== null
  ) {
    if (
      !PROJECT_TYPE_VALUES.has(
        persistedRoutingAnswers
          .projectType,
      )
    ) {
      return invalidV4Diagnostic();
    }

    routeInput[
      QUESTION_IDS.PROJECT_TYPE
    ] =
      persistedRoutingAnswers
        .projectType;
  }

  if (
    persistedRoutingAnswers
      .technologiesUsed !== undefined
  ) {
    const technologies =
      persistedRoutingAnswers
        .technologiesUsed;

    if (
      !Array.isArray(technologies) ||
      new Set(technologies).size !==
      technologies.length ||
      technologies.some(
        (technology) =>
          !TECHNOLOGY_VALUE_SET.has(
            technology,
          ),
      )
    ) {
      return invalidV4Diagnostic();
    }

    routeInput[
      QUESTION_IDS.TECHNOLOGIES_USED
    ] = technologies;
  }

  const expectedRoute =
    resolveDiagnosticRoute(routeInput);

  if (
    !isCompleteDiagnosticRoute(
      expectedRoute,
    )
  ) {
    return invalidV4Diagnostic(
      "incomplete_v4_diagnostic",
    );
  }

  if (
    !Array.isArray(
      document.diagnosticPath,
    ) ||
    document.diagnosticPath.join(
      ",",
    ) !== expectedRoute.join(",")
  ) {
    return invalidV4Diagnostic();
  }

  const assessedTechnicalIds =
    new Set(
      expectedRoute.filter(
        (questionId) =>
          technicalQuestionSet.has(
            questionId,
          ),
      ),
    );

  for (
    const [
      questionId,
      outcome,
    ] of responsesById
  ) {
    const shouldBeAssessed =
      assessedTechnicalIds.has(
        questionId,
      );

    if (
      shouldBeAssessed &&
      outcome.notAssessed
    ) {
      return invalidV4Diagnostic();
    }

    if (
      !shouldBeAssessed &&
      !outcome.notAssessed
    ) {
      return invalidV4Diagnostic();
    }
  }

  return {
    reusable: true,
    reason: null,
  };
}