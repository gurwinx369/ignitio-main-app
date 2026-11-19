import mongoose, { Schema } from "mongoose";

const WorkingFileSchema = new Schema(
  {
    path: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
  },
  { _id: false }
);

const UnlockedHintSchema = new Schema(
  {
    milestoneId: { type: Number, required: true },
    hintLevel: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReflectionAnswerSchema = new Schema(
  {
    milestoneId: { type: Number, required: true },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const ProjectProgressSchema = new Schema(
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
    projectSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    currentMilestoneId: {
      type: Number,
      required: true,
      default: 1,
    },
    completedMilestones: {
      type: [Number],
      default: [],
    },
    workingFiles: {
      type: [WorkingFileSchema],
      default: [],
    },
    unlockedHints: {
      type: [UnlockedHintSchema],
      default: [],
    },
    reflectionAnswers: {
      type: [ReflectionAnswerSchema],
      default: [],
    },
    syncStatus: {
      type: String,
      enum: ["SYNCED", "PENDING_XP_SYNC", "FAILED"],
      default: "SYNCED",
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup and strict uniqueness per user per project
ProjectProgressSchema.index({ firebaseUID: 1, projectSlug: 1 }, { unique: true });

/**
 * Helper to obtain the ProjectProgress model from a given Mongoose connection
 */
export const getProjectProgressModel = (connection = mongoose) => {
  return (
    connection.models?.ProjectProgress ||
    connection.model("ProjectProgress", ProjectProgressSchema)
  );
};

export default ProjectProgressSchema;
