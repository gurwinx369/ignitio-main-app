import mongoose, { Schema } from "mongoose";

// ENUMS — single source of truth
// Export these and reuse them in your API validators
// and frontend constants. Never hardcode strings twice.

/* COMMENTED OUT OLD ONBOARDING SCHEMAS & ENUMS
export const CODING_EXPERIENCE_LEVEL = {
  BEGINNER: "beginner", // Screen 1 — no sub-question
  WRITTEN_SOME_CODE: "written_some_code", // Screen 1 — triggers tech stack sub-question
  KNOW_BASICS: "know_basics_want_more", // Screen 1 — triggers tried-with sub-question
};

export const TECH_USED = {
  PYTHON: "python",
  GIT_GITHUB: "git_github",
  REST_API: "rest_api",
  SQL_DATABASES: "sql_databases",
  LANGCHAIN: "langchain",
  LANGGRAPH: "langgraph",
};

export const TRIED_WITH = {
  COLLEGE_ASSIGNMENTS: "college_assignments",
  HTML_CSS_WEBSITE: "html_css_website",
  PROGRAMMING_LANGUAGES: "programming_languages", // Java, Python, C++ etc.
  // PERSONAL_PROJECTS:     "personal_projects",      // your 4th option
};

export const DAILY_TIME = {
  THIRTY_MIN: "30_minutes",
  ONE_TWO_HRS: "1_2_hours",
  TWO_PLUS: "2_plus_hours",
};
// SUB-SCHEMAS
// Discriminated union pattern:
// sub-question data only exists when the
// parent answer makes it valid. Enforce at
// the application layer, not just schema layer.

// Sub-question: "What tech have you used?" (multi-select)
// Only populated when level === 'written_some_code'
const TechStackSubSchema = new Schema(
  {
    selected: {
      type: [String],
      enum: Object.values(TECH_USED),
      default: [], // [] is valid — user may skip sub-question
    },
  },
  { _id: false }, // no _id on sub-docs that are never queried standalone
);

// Sub-question: "What have you tried?" (multi-select)
// Only populated when level === 'know_basics_want_more'
const TriedWithSubSchema = new Schema(
  {
    selected: {
      type: [String],
      enum: Object.values(TRIED_WITH),
      default: [],
    },
  },
  { _id: false },
);

// Screen 1 — Coding Experience
// The discriminator here is `level`.
// techStack and triedWith are mutually exclusive.
// Validate this invariant in your service layer,
// not the schema — Mongoose validators get
// complicated with conditional logic.
const CodingExperienceSchema = new Schema(
  {
    level: {
      type: String,
      enum: Object.values(CODING_EXPERIENCE_LEVEL),
      required: true,
    },

    // Populated only when level === 'written_some_code'
    techStack: {
      type: TechStackSubSchema,
      default: null,
    },

    // Populated only when level === 'know_basics_want_more'
    triedWith: {
      type: TriedWithSubSchema,
      default: null,
    },
  },
  { _id: false },
);

// Screen 2 — Time Commitment
const TimeCommitmentSchema = new Schema(
  {
    dailyTime: {
      type: String,
      enum: Object.values(DAILY_TIME),
      required: true,
    },
  },
  { _id: false },
);

// ROOT QUESTIONS SCHEMA
// Tracks completion state per screen so your
// frontend knows exactly where to resume.
// Critical for funnel drop-off analytics.

const QuestionsSchema = new Schema(
  {
    schemaVersion: {
      type: Number,
      default: 1,
    },
    codingExperience: {
      type: CodingExperienceSchema,
      default: null,
    },
    timeCommitment: {
      type: TimeCommitmentSchema,
      default: null,
    },
    completedScreens: {
      type: [String],
      enum: ["coding_experience", "time_commitment"],
      default: [],
    },
    isComplete: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);
*/

export const USER_ROLES = {
  STUDENT: "student",
  WRITER: "writer",
  DESIGNER: "designer",
  DEVELOPER: "developer",
  OTHER: "other",
};

// USER PROFILE — final assembly
const UserProfileSchema = new Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: "UserNotification",
    },
    email: {
      type: String,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please enter a valid email",
      },
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }],

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      lowercase: true,
      trim: true,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    roadmap_name: {
      type: String,
      default: null,
      trim: true,
    },
    // Ref to KyleHistory — created lazily on first quiz or assignment submission.
    kyleHistory: {
      type: Schema.Types.ObjectId,
      ref: "KyleHistory",
      default: null,
    },
    last_active_on: {
      type: Date,
      default: Date.now,
    },
    last_learning_active_on: {
      type: Date,
      default: null,
      index: true,
    },
    retentionUnsubscribed: {
      type: Boolean,
      default: false,
      index: true,
    },
    retentionUnsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// INDEXES
// Compound index for the most common ops query
UserProfileSchema.index({
  onboardingComplete: 1,
  role: 1,
});

export const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", UserProfileSchema);
