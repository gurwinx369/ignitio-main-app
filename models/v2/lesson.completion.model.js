import mongoose, { Schema } from "mongoose";

const LessonCompletionSchema = new Schema(
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
    },
    levelId: {
      type: String,
      required: true,
    },
    completedAtUTC: {
      type: Date,
      required: true,
    },
    completedDateLocal: {
      type: String, // format YYYY-MM-DD
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
LessonCompletionSchema.index({ userId: 1, completedDateLocal: 1 });
LessonCompletionSchema.index({ firebaseUID: 1, completedDateLocal: 1 });

// Unique idempotency index: a user can only complete a level once
LessonCompletionSchema.index(
  { userId: 1, roadmapSlug: 1, levelId: 1 },
  { unique: true }
);

export const LessonCompletion =
  mongoose.models.LessonCompletion ||
  mongoose.model("LessonCompletion", LessonCompletionSchema);
