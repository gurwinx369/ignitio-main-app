import mongoose, { Schema } from "mongoose";

const MetadataSchema = new Schema(
  {
    completedLevelsCount: { type: Number, default: 0 },
    totalLevelsInDay: { type: Number, default: 0 },
    quizCompletedCount: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 0 },
    dayNumber: { type: Number, default: 1 },
    providedOn: { type: String, default: "" },
  },
  { _id: false }
);

const UserCertificateSchema = new Schema(
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
    certificateKey: {
      type: String,
      required: true,
    },
    certificateType: {
      type: String,
      enum: ["day_completion"],
      default: "day_completion",
    },
    roadmapFamily: {
      type: String,
      default: "",
    },
    roadmapSlug: {
      type: String,
      required: true,
    },
    roadmapTitle: {
      type: String,
      default: "",
    },
    dayId: {
      type: String,
      required: true,
    },
    dayTitle: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageKey: {
      type: String,
      default: "",
    },
    unlockedAtUTC: {
      type: Date,
      required: true,
    },
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// Unique compound index — prevents duplicate cards for same user/day/roadmap
UserCertificateSchema.index(
  { userId: 1, roadmapSlug: 1, dayId: 1, certificateType: 1 },
  { unique: true }
);

export const UserCertificate =
  mongoose.models.UserCertificate ||
  mongoose.model("UserCertificate", UserCertificateSchema);
