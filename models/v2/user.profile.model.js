import mongoose, { Schema } from "mongoose";

export const USER_ROLES = {
  STUDENT: "student",
  WRITER: "writer",
  DESIGNER: "designer",
  DEVELOPER: "developer",
  OTHER: "other",
};

// Defined here because the old onboarding sub-schemas that included this
// were commented out, leaving the reference in schedulePreference dangling.
// This is the canonical shape used by the onboarding flow.
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
    goal: {
      type: String,
      enum: ["internship_1_3_months", "build_product", "curiosity_general"],
      required: true,
    },
    schedulePreference: {
      windows: [TimeWindowSchema], // usually 1, but allow multiple (e.g. commuter who studies noon + night)
      timezone: { type: String, required: true }, // IANA
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
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
    // Set at end of onboarding — links this profile to the personalized roadmap doc.
    roadmapPersonalizationRef: {
      type: Schema.Types.ObjectId,
      ref: "RoadmapPersonalization",
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
