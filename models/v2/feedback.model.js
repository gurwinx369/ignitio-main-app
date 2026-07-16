import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      index: true,
    },
    firebaseUID: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
    },
    role: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    page: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["new", "emailed", "email_failed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
