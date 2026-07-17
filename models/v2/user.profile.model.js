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

export const USER_GOALS = {
  INTERNSHIP: "internship_1_3_months",
  BUILD_PRODUCT: "build_product",
  CURIOSITY: "curiosity_general",
  NOT_SET: "not_set",
};

// Reusable learning availability window.
// Minutes are easier for future cron/notification arithmetic than labels like "evening".
const ScheduleWindowSchema = new Schema(
  {
    daysOfWeek: {
      type: [Number], // 0 = Sunday, 6 = Saturday
      default: [],
      validate: {
        validator: (days) =>
          Array.isArray(days) && days.every((day) => day >= 0 && day <= 6),
        message: "daysOfWeek values must be between 0 and 6.",
      },
    },
    startMinute: {
      type: Number,
      min: 0,
      max: 1439,
      default: null,
    },
    endMinute: {
      type: Number,
      min: 0,
      max: 1439,
      default: null,
    },
  },
  { _id: false },
);

ScheduleWindowSchema.pre("validate", function (next) {
  const hasStart = typeof this.startMinute === "number";
  const hasEnd = typeof this.endMinute === "number";

  if (hasStart && hasEnd && this.endMinute <= this.startMinute) {
    return next(new Error("endMinute must be after startMinute."));
  }

  next();
});

// Future onboarding v3 / notification scheduling data.
// Kept optional/default-safe so current onboarding and existing users do not break.
const SchedulePreferenceSchema = new Schema(
  {
    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },
    windows: {
      type: [ScheduleWindowSchema],
      default: [],
      validate: {
        validator: (windows) => Array.isArray(windows) && windows.length <= 5,
        message: "Maximum 5 schedule windows are allowed.",
      },
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

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

    profile: {
      displayName: { type: String, default: "" },
      bio: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      avatarPreset: { type: String, default: "default" },
      bannerColor: { type: String, default: "cyan" },
      avatarFrame: { type: String, default: "cyan" },
    },

    // Forward-compatible onboarding marker.
    // Current users/default flow remain v2; future diagnostic onboarding can write v3.
    onboardingVersion: {
      type: String,
      default: "v2",
      trim: true,
    },

    // Future onboarding v3 learning goal.
    // Optional by default so current onboarding/user creation does not need to send it.
    goal: {
      type: String,
      enum: Object.values(USER_GOALS),
      default: USER_GOALS.NOT_SET,
      index: true,
    },

    // Future notification/pacing schedule.
    // Used later for timezone-aware reminders and personalized learning windows.
    schedulePreference: {
      type: SchedulePreferenceSchema,
      default: () => ({
        timezone: "Asia/Kolkata",
        windows: [],
        isDefault: true,
      }),
    },

    // Future onboarding v3 daily study capacity.
    // Null means not collected yet.
    dailyTimeBudgetMinutes: {
      type: Number,
      default: null,
      min: 0,
    },

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
      default: "Prompt engineering",
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
    streak: {
      currentCount: { type: Number, default: 0 },
      longestCount: { type: Number, default: 0 },
      lastCompletedDateLocal: { type: String, default: null },
      timezone: { type: String, default: "Asia/Kolkata" },
      freezeBank: { type: Number, default: 0, min: 0, max: 2 },
      freezeCredits: [
        {
          earnedAtUTC: { type: Date, required: true },
          earnedDateLocal: { type: String, required: true },
          expiresAtUTC: { type: Date, required: true },
          usedAtUTC: { type: Date, default: null },
          usedForDateLocal: { type: String, default: null },
          earnedForStreakCount: { type: Number, required: true },
        },
      ],
      onboardingGraceUsed: { type: Boolean, default: false },
      onboardingStartDate: { type: String, default: null },
      earnBack: {
        active: { type: Boolean, default: false },
        deadline: { type: Date, default: null },
        lessonsCompletedInWindow: { type: Number, default: 0 },
        countAtRisk: { type: Number, default: 0 },
      },
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