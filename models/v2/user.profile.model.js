import mongoose, { Schema } from "mongoose";

export const USER_ROLES = {
  STUDENT: "student",
  WRITER: "writer",
  DESIGNER: "designer",
  DEVELOPER: "developer",
  OTHER: "other",
};

export const USER_GOALS = {
  NOT_SET: "not_set",
  INTERNSHIP_1_3_MONTHS: "internship_1_3_months",
  BUILD_PRODUCT: "build_product",
  CURIOSITY_GENERAL: "curiosity_general",
};

export const ONBOARDING_VERSIONS = {
  V2: "v2",
  V3: "v3",
  V4: "v4",
};



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

const SchedulePreferenceSchema = new Schema(
  {
    windows: {
      type: [TimeWindowSchema],
      default: [],
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

const ProfileCustomizationSchema = new Schema(
  {
    displayName: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },

    avatarPreset: {
      type: String,
      default: "default",
    },

    bannerColor: {
      type: String,
      default: "cyan",
    },

    avatarFrame: {
      type: String,
      default: "cyan",
    },
  },
  {
    _id: false,
  },
);

const FreezeCreditSchema = new Schema(
  {
    earnedAtUTC: {
      type: Date,
      required: true,
    },

    earnedDateLocal: {
      type: String,
      required: true,
    },

    expiresAtUTC: {
      type: Date,
      required: true,
    },

    usedAtUTC: {
      type: Date,
      default: null,
    },

    usedForDateLocal: {
      type: String,
      default: null,
    },

    earnedForStreakCount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const EarnBackSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: false,
    },

    deadline: {
      type: Date,
      default: null,
    },

    lessonsCompletedInWindow: {
      type: Number,
      default: 0,
      min: 0,
    },

    countAtRisk: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const StreakSchema = new Schema(
  {
    currentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastCompletedDateLocal: {
      type: String,
      default: null,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    freezeBank: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },

    freezeCredits: {
      type: [FreezeCreditSchema],
      default: [],
    },

    onboardingGraceUsed: {
      type: Boolean,
      default: false,
    },

    onboardingStartDate: {
      type: String,
      default: null,
    },

    earnBack: {
      type: EarnBackSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  },
);

// ─── New sub-schemas for premium onboarding ────────────────────────────────
// These are additive only. Existing documents receive default values on
// the next read. No migration script is required — MongoDB treats absent
// embedded documents as if they were set to their schema defaults.

const OnboardingStateSchema = new Schema(
  {
    step: {
      type: String,
      enum: [
        "diagnostic",
        "results",
        "paywall",
        "role_selection",
        "activation_pending",
        "completed",
      ],
      default: "diagnostic",
    },

    paywallSeen: {
      type: Boolean,
      default: false,
    },

    roleSelected: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

// Roadmap-level entitlements. One boolean per premium roadmap product.
// Only products that currently exist are listed here. Do not add
// placeholders — new fields are added when features ship.
const RoadmapEntitlementsSchema = new Schema(
  {
    genAi: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

// Feature-level entitlements. One boolean per premium platform feature.
const FeatureEntitlementsSchema = new Schema(
  {
    // Behavioural / learning-style quiz (Kyle integration).
    behaviouralQuiz: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

// Top-level entitlements container. Namespaced by product category so
// new categories can be added without flattening the root document.
const EntitlementsSchema = new Schema(
  {
     // Premium roadmap access
    roadmaps: {
      type: RoadmapEntitlementsSchema,
      default: () => ({}),
    },

    // Premium platform features
    features: {
      type: FeatureEntitlementsSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  },
);

const UserProfileSchema = new Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    notification: {
      type: Schema.Types.ObjectId,
      ref: "UserNotification",
      default: null,
    },

    email: {
      type: String,
      validate: {
        validator: (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Please enter a valid email",
      },
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },

    badges: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Badge",
        },
      ],
      default: [],
    },

    profile: {
      type: ProfileCustomizationSchema,
      default: () => ({}),
    },

    onboardingVersion: {
      type: String,
      enum: Object.values(ONBOARDING_VERSIONS),
      default: ONBOARDING_VERSIONS.V2,
      trim: true,
    },

    goal: {
      type: String,
      enum: Object.values(USER_GOALS),
      default: USER_GOALS.NOT_SET,
      index: true,
    },

    schedulePreference: {
      type: SchedulePreferenceSchema,
      default: () => ({
        timezone: "Asia/Kolkata",
        windows: [],
        isDefault: true,
      }),
    },

    dailyTimeBudgetMinutes: {
      type: Number,
      default: null,
      min: 0,
      max: 1440,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.OTHER,
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
      trim: true,
    },

    roadmapPersonalizationRef: {
      type: Schema.Types.ObjectId,
      ref: "RoadmapPersonalization",
      default: null,
    },

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
      type: StreakSchema,
      default: () => ({}),
    },

    // ── Premium onboarding fields ───────────────────────────────────────────
    // All three fields are optional and carry safe defaults, so existing
    // documents remain valid without any migration.

    onboardingState: {
      type: OnboardingStateSchema,
      default: () => ({}),
    },

    entitlements: {
      type: EntitlementsSchema,
      default: () => ({}),
    },

  },
  {
    timestamps: true,
  },
);

UserProfileSchema.index({
  onboardingComplete: 1,
  role: 1,
});

UserProfileSchema.index({
  "entitlements.roadmaps.genAi": 1,
});

export const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", UserProfileSchema);