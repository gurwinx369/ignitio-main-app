import mongoose, { Schema } from "mongoose";

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
  { _id: false },
);

const QuestionResponseSchema = new Schema(
  {
    questionId: { type: String, required: true }, // stable slug, e.g. "context-eng-lost-in-middle-01"
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["MCQ", "CODE_EXERCISE", "SELF_REPORT", "SHORT_ANSWER"],
      required: true,
    },
    moduleRef: { type: String, default: null }, // e.g. "29-35" — day-range convention, matches your PDF
    answerGiven: { type: Schema.Types.Mixed, required: true },
    passed: { type: Boolean, required: true },
    score: { type: Number, min: 0, max: 1, default: null },
    timeTakenSeconds: { type: Number, default: null },

    // Kept from the earlier draft — worth retaining alongside your fields, not replacing them:
    gradingMethod: {
      type: String,
      enum: [
        "exact_match",
        "keyword_match",
        "llm_judge",
        "multiple_choice",
        "self_report",
      ],
      required: true,
    },
    gradingMeta: {
      matchedKeywords: [String],
      llmJudgeReasoning: String,
      llmJudgeModel: String,
    },
    attemptNumber: { type: Number, default: 1 }, // retests append, never overwrite
  },
  { _id: false },
);

const OnboardingResponseSchema = new Schema(
  {
    firebaseUID: { type: String, required: true, unique: true, index: true },
    onboardingVersion: { type: String, enum: ["v1", "v2", "v3"], required: true, default: "v2" },

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

    responses: [QuestionResponseSchema],

    primaryGoalSnapshot: {
      type: String,
      enum: ["internship_1_3_months", "build_product", "curiosity_general"],
    },

    roadmapExclusions: [
      {
        weekNumber: { type: Number, required: true },
        moduleTitle: String,
        triggeredByQuestionId: String, // ties back to responses[].questionId
        skipReasonShownToUser: String,
        daysSaved: Number,
      },
      { _id: false },
    ],
    //weeks which user has option to skim in a few minutes or to watch the full content
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
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    completedAt: Date,
  },
  { timestamps: true },
);

OnboardingResponseSchema.index({
  "responses.questionId": 1,
  "responses.passed": 1,
});

export const OnboardingResponseModel =
  mongoose.models.OnboardingResponseModel ||
  mongoose.model("OnboardingResponseModel", OnboardingResponseSchema);
