import mongoose from "mongoose";

const StreakReminderLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },
    email: {
      type: String,
    },
    localDateString: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    reminderType: {
      type: String,
      enum: ["daily_pending", "daily_last_chance", "earn_back"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["push", "email"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "skipped", "failed"],
      default: "pending",
    },
    reason: {
      type: String,
    },
    fcmTokenLast4: {
      type: String,
    },
    providerMessageId: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

StreakReminderLogSchema.index(
  { userId: 1, localDateString: 1 },
  { unique: true }
);

export const StreakReminderLog =
  mongoose.models.StreakReminderLog ||
  mongoose.model("StreakReminderLog", StreakReminderLogSchema);
