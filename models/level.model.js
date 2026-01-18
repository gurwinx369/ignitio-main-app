import { mongoose, Schema } from "mongoose";

const LevelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phase: {
    type: Schema.Types.ObjectId,
    ref: "Phase",
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
}, timestamps: true);

export const Level =
  mongoose.models.LevelSchema || mongoose.model("Level", LevelSchema);
