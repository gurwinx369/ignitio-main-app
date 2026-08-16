import mongoose, { Schema } from "mongoose";

const SKIP_MARKER = "__skipped__";

const TECHNOLOGY_VALUES = [
  "langchain",
  "embeddings",
  "rag",
  "api_framework",
  "structured_outputs",
  "agents",
];

const DIAGNOSTIC_PATH_VALUES = [
  "q1",
  "casual_api_usage",
  "technologies_used",
  "project_type",
  "q2",
  "q2b",
  "q3",
  "q3b",
  "q4",
  "q5",
  "q6",
  "q7",
  "q7b",
  "q8",
  "q9",
  "q10",
];

const TECHNICAL_QUESTION_IDS = [
  "q2",
  "q2b",
  "q3",
  "q3b",
  "q4",
  "q5",
  "q6",
  "q7",
  "q7b",
  "q8",
];

const TimeWindowSchema = new Schema(
  {
    period: {
      type: String,
      enum: ["MORNING", "NOON", "EVENING", "NIGHT"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  {
    _id: false,
  },
);

const GradingMetaSchema = new Schema(
  {
    matchedKeywords: {
      type: [String],
      default: [],
    },
    matchedGroups: {
      type: [String],
      default: [],
    },
    reason: {
      type: String,
      default: null,
    },
    partial: {
      type: Boolean,
      default: false,
    },
    llmJudgeReasoning: {
      type: String,
      default: null,
    },
    llmJudgeModel: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const QuestionResponseSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: [
        "MCQ",
        "CODE_EXERCISE",
        "SELF_REPORT",
        "SHORT_ANSWER",
        "ORDERING",
      ],
      required: true,
    },
    moduleRef: {
      type: String,
      default: null,
    },
    answerGiven: {
      type: Schema.Types.Mixed,
      required() {
        return this.notAssessed !== true;
      },
      default: null,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    skipped: {
      type: Boolean,
      default: false,
    },
    notAssessed: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    timeTakenSeconds: {
      type: Number,
      default: null,
    },
    gradingMethod: {
      type: String,
      enum: [
        "exact_match",
        "keyword_match",
        "llm_judge",
        "multiple_choice",
        "self_report",
        "not_assessed",
      ],
      required: true,
    },
    gradingMeta: {
      type: GradingMetaSchema,
      default: () => ({}),
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: false,
  },
);

QuestionResponseSchema.pre("validate", function validateOutcome() {
  if (this.notAssessed) {
    if (this.passed || this.skipped) {
      throw new Error(
        "A not_assessed question cannot also be passed or skipped.",
      );
    }

    if (this.gradingMethod !== "not_assessed") {
      throw new Error(
        "A not_assessed question must use gradingMethod not_assessed.",
      );
    }
  }

  if (
    !this.notAssessed &&
    this.gradingMethod === "not_assessed"
  ) {
    throw new Error(
      "gradingMethod not_assessed requires notAssessed to be true.",
    );
  }

  if (this.skipped && this.passed) {
    throw new Error(
      "A skipped question cannot also be passed.",
    );
  }

  if (
    this.skipped &&
    this.answerGiven !== SKIP_MARKER
  ) {
    throw new Error(
      "An explicitly skipped question must preserve the skip marker.",
    );
  }
});

const RoutingAnswersSchema = new Schema(
  {
    casualApiUsage: {
      type: String,
      enum: ["chat_only", "called_llm_api"],
      default: null,
    },
    technologiesUsed: {
      type: [
        {
          type: String,
          enum: TECHNOLOGY_VALUES,
        },
      ],
      default: [],
      validate: {
        validator(values) {
          return new Set(values).size === values.length;
        },
        message: "Duplicate technology selections are not allowed.",
      },
    },
    projectType: {
      type: String,
      enum: ["rag", "agent", "both"],
      default: null,
    },
  },
  {
    _id: false,
  },
);

const OnboardingResponseSchema = new Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      index: true,
    },
    onboardingVersion: {
      type: String,
      enum: ["v1", "v2", "v3", "v4"],
      required: true,
      default: "v2",
    },
    flowVersion: {
      type: String,
      enum: ["adaptive-v1"],
      default: undefined,
    },
    entryPoint: {
      type: String,
      enum: [
        "never_touched_llm",
        "casual_chatgpt_user",
        "called_api_before",
        "shipped_rag_or_agent",
      ],
      required: true,
    },
    routingAnswers: {
      type: RoutingAnswersSchema,
      default: undefined,
    },
    diagnosticPath: {
      type: [
        {
          type: String,
          enum: DIAGNOSTIC_PATH_VALUES,
        },
      ],
      default: [],
    },
    notAssessedQuestionIds: {
      type: [
        {
          type: String,
          enum: TECHNICAL_QUESTION_IDS,
        },
      ],
      default: [],
    },
    responses: {
      type: [QuestionResponseSchema],
      default: [],
    },
    primaryGoalSnapshot: {
      type: String,
      enum: [
        "internship_1_3_months",
        "build_product",
        "curiosity_general",
      ],
    },
    roadmapExclusions: [
      {
        weekNumber: {
          type: Number,
          required: true,
        },
        moduleTitle: String,
        triggeredByQuestionId: String,
        skipReasonShownToUser: String,
        daysSaved: Number,
      },
    ],
    optionalFlags: [
      {
        weekNumber: Number,
        reason: String,
        userChoice: {
          type: String,
          enum: [
            "not_yet_reached",
            "skimmed",
            "did_in_full",
            "skipped_entirely",
          ],
          default: "not_yet_reached",
        },
        choiceMadeAt: Date,
      },
    ],
    timeWindowSchema: {
      type: TimeWindowSchema,
      required() {
        return this.onboardingVersion !== "v4";
      },
    },
    dailyDurationCategory: {
      type: String,
      enum: ["20_30", "45_60", "90_plus"],
      required() {
        return this.onboardingVersion === "v4";
      },
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

OnboardingResponseSchema.index({
  "responses.questionId": 1,
  "responses.passed": 1,
});

OnboardingResponseSchema.index(
  {
    firebaseUID: 1,
    onboardingVersion: 1,
  },
  {
    unique: true,
  },
);

export const OnboardingResponseModel =
  mongoose.models.OnboardingResponseModel ||
  mongoose.model(
    "OnboardingResponseModel",
    OnboardingResponseSchema,
  );