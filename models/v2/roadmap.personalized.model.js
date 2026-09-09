import mongoose, { Schema } from "mongoose";

export const MOTIVATION = {
  LAND_INTERNSHIP: "land_internship",
  BUILD_PRODUCT: "build_product",
  CURIOSITY: "curiosity",
};

// for notification and scheduling purposes, not need to calculate the timing for cron job
// One reusable free-time block. Minutes-since-midnight (0-1439), not
// "morning/evening" — a notification scheduler needs to do arithmetic on
// this, not interpret a label. daysOfWeek lets weekday/weekend splits
// (very common: free 45 min on weekdays, 2 hrs on weekends) without
// needing two separate fields.
const TimeWindowSchema = new Schema(
  {
    daysOfWeek: {
      type: [Number], // 0=Sun ... 6=Sat
      required: true,
      validate: {
        validator: (arr) =>
          arr.length > 0 && arr.every((d) => d >= 0 && d <= 6),
        message: "daysOfWeek must be 1-7 values between 0 and 6.",
      },
    },
    startMinute: { type: Number, required: true, min: 0, max: 1439 },
    endMinute: { type: Number, required: true, min: 0, max: 1439 },
  },
  { _id: false },
);

TimeWindowSchema.pre("validate", function () {
  if (this.endMinute <= this.startMinute) {
    throw new Error("endMinute must be after startMinute.");
  }
});
// storing the user's quiz question data
// One row per diagnostic question answered. Kept even on fail/skip —
// Kyle's weakness detection needs this as a signal later, not just the
// routing outcome.
const DiagnosticResultSchema = new Schema(
  {
    questionId: { type: String, required: true, trim: true }, // "Q5", "Q7b" etc
    passed: { type: Boolean, default: null }, // null = skipped, not attempted
    rawAnswer: { type: String, default: "" }, // audit trail, keep it short
    routedAction: {
      type: String,
      enum: ["skip_week", "skip_day", "keep", "optional"],
      required: true,
    },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
// for the retention system i.e for notifications, and emails
const ScheduleSchema = new Schema(
  {
    // IANA name, not offset — offsets rot the moment DST hits and you'd
    // silently start notifying people at 3am. "Asia/Kolkata" doesn't drift.
    timezone: { type: String, required: true, trim: true },
    freeWindows: {
      type: [TimeWindowSchema],
      default: [],
      validate: {
        validator: (w) => w.length <= 5,
        message:
          "Max 5 free windows — this is onboarding input, not a full calendar.",
      },
    },
    // User never answered / skipped the schedule question. Notification
    // system falls back to a sane global default (e.g. 7-9pm local) instead
    // of silently sending nothing or crashing on an empty array lookup.
    isDefault: { type: Boolean, default: true },
  },
  { _id: false },
);

const RoadmapPersonalizationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },
    firebaseUID: { type: String, required: true, index: true },
    roadmapSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    includedDayIds: { type: [String], default: [] },
    optionalDayIds: { type: [String], default: [] },
    skippedDayIds: { type: [String], default: [] },
    totalLevels: { type: Number, required: true, min: 0 },

    schedule: { type: ScheduleSchema, required: true },
    motivation: {
      type: String,
      enum: Object.values(MOTIVATION),
      default: MOTIVATION.CURIOSITY,
    },

    diagnostics: { type: [DiagnosticResultSchema], default: [] },
    templateSnapshotAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

RoadmapPersonalizationSchema.index(
  { firebaseUID: 1, roadmapSlug: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export const RoadmapPersonalization =
  mongoose.models.RoadmapPersonalization ||
  mongoose.model("RoadmapPersonalization", RoadmapPersonalizationSchema);
