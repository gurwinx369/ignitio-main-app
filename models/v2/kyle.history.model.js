// KyleHistory model — persists quiz and assignment attempts per user.
// One document per user, referenced from UserProfile.kyleHistory.
// Created lazily on first quiz or assignment submission.

import mongoose, { Schema } from "mongoose";

// A single quiz question attempt for one video level.
export const QuizAttemptSchema = new Schema(
  {
    concept: { type: String, required: true },
    dayNumber: { type: Number, required: true },
    levelId: { type: String, required: true },
    gateType: { type: String, default: "50" }, // "50" or "80"
    question: { type: String, required: true },
    selectedOption: { type: String, required: true },
    wasCorrect: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// One scored submission within an assignment session.
const AssignmentSubmissionSchema = new Schema(
  {
    userResponse: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    feedback: { type: String, required: true },
    passed: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// One assignment record per (user, dayNumber).
// attemptCount resets after a 6-hour cooldown — attempts[] keeps the full history.
const AssignmentAttemptSchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    role: { type: String, required: true },
    assignmentPrompt: { type: String, required: true },
    attempts: { type: [AssignmentSubmissionSchema], default: [] },
    attemptCount: { type: Number, default: 0 }, // resets after cooldown
    passed: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    lockedUntil: { type: Date, default: null }, // null unless locked after 3 failures
  },
  { _id: false },
);

const KyleHistorySchema = new Schema(
  {
    firebaseUID: { type: String, required: true, unique: true, index: true },
    quizHistory: { type: [QuizAttemptSchema], default: [] },
    totalQuizzesCorrect: { type: Number, default: 0 }, // $inc at write, never recomputed
    totalQuizzesWrong: { type: Number, default: 0 },
    assignmentHistory: { type: [AssignmentAttemptSchema], default: [] },
    assignmentsPassed: { type: Number, default: 0 }, // $inc at write, never recomputed
  },
  { timestamps: true },
);

// Efficient lookups: all quiz attempts for a user on a given day.
KyleHistorySchema.index({ firebaseUID: 1, "quizHistory.dayNumber": 1 });
// Efficient lookups: assignment record for a user on a given day.
KyleHistorySchema.index({ firebaseUID: 1, "assignmentHistory.dayNumber": 1 });

export const KyleHistory =
  mongoose.models.KyleHistory ||
  mongoose.model("KyleHistory", KyleHistorySchema);
