import { mongoose, Schema } from "mongoose";

const RoadmapSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  phases: {
    Beginner: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
    Intermediate: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
    Advanced: {
      type: Schema.Types.ObjectId,
      ref: "Level",
    },
  },
}, {timestamps: true});

export const Roadmap =
  mongoose.models.Roadmap || mongoose.model("Roadmap", RoadmapSchema);