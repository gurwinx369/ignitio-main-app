import mongoose from "mongoose";

const DiagnosticResultSchema = new mongoose.Schema({
  skillId: { type: String, required: true },
  verdict: { type: String, enum: ["mastery", "developing", "gap", "insufficient"], required: true },
  include: { type: Boolean, required: true }
}, { _id: false });

const FreePathResultSchema = new mongoose.Schema({
  firebaseUID: { 
    type: String, 
    required: true, 
    index: true, 
    unique: true // One onboarding result per user
  },
  year: { 
    type: String, 
    // Allowing flexible values for now, but commonly 1, 2, 3, 4, graduated, other
    required: true 
  },
  pathTaken: { 
    type: String, 
    enum: ["A", "B", "C"], // A = Shortcut, B = Beginner, C = Diagnostic
    required: true 
  },
  roadmap: { 
    type: [String], // e.g., ["git", "html", "css", "react"] in exact order
    required: true 
  },
  diagnosticResults: {
    type: [DiagnosticResultSchema],
    default: []
  },
  notificationAllowed: { 
    type: Boolean, 
    default: false 
  },
  completedAt: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

export const FreePathResult = mongoose.models.FreePathResult || mongoose.model("FreePathResult", FreePathResultSchema);
