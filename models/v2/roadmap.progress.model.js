import mongoose, { Schema } from "mongoose";

export const ROADMAP_PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};
const RoadmapProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },
    firebaseUID: {
      type: String,
      required: true,
      index: true,
    },
    roadmapSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    roadmapTitle: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "writer", "designer", "developer", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: Object.values(ROADMAP_PROGRESS_STATUS),
      default: ROADMAP_PROGRESS_STATUS.NOT_STARTED,
      index: true,
    },
    completedLevels: {
      type: [String],
      default: [],
    },
    totalLevels: {
      type: Number,
      required: true,
      min: 0,
    },
    completedDays: {
      type: [String],
      default: [],
    },
    passedAssignments: {
      type: [String],
      default: [],
    },
    yesterdayCompletedLevels: {
      type: [
        {
          levelId: { type: String, required: true },
          days: { type: String, required: true },
          title: { type: String, required: true },
          concept: { type: String, required: true },
          transcript: { type: String, required: true },
        },
      ],
      default: [],
    },
    lastActiveLevelsCompleted: {
      type: [String],
      default: [],
    },
    lastActiveLevelId: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastLearningActiveAt: {
      type: Date,
      default: null,
      index: true,
    },
    migratedFromLocalStorage: {
      type: Boolean,
      default: false,
    },
    migratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for uniqueness per user per roadmap
RoadmapProgressSchema.index(
  { firebaseUID: 1, roadmapSlug: 1 },
  { unique: true },
);

export const RoadmapProgress =
  mongoose.models.RoadmapProgress ||
  mongoose.model("RoadmapProgress", RoadmapProgressSchema);
