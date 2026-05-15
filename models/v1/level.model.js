import mongoose, { Schema } from "mongoose";

const LevelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  roadmap: {
    type: Schema.Types.ObjectId,
    ref: "Roadmap",
    required: true,
  },
  phase: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  feedback: {
    like: {
      type: Number,
      default: 0,
    },
    dislike: {
      type: Number,
      default: 0,
    },
  },
}, {timestamps: true});

export const Level =
  mongoose.models.Level || mongoose.model("Level", LevelSchema);
