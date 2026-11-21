import mongoose, { Schema } from "mongoose";

// --- Sub-schemas ---

const HintSchema = new Schema(
  {
    level: { type: Number, required: true }, // 1: Concept, 2: Pseudocode, 3: Code sketch
    content: { type: String, required: true, trim: true },
    xpCost: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const MilestoneTestCaseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    input: { type: String, default: "" },
    expectedOutput: { type: String, default: "" },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const MilestoneSchema = new Schema(
  {
    milestoneId: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    brief: { type: String, required: true },
    instructions: { type: [String], default: [] },
    starterSnippet: { type: String, default: "" },
    testHarness: { type: String, default: "" }, // Hidden code wrapper or assertions
    testCases: [MilestoneTestCaseSchema],
    hints: [HintSchema],
    reflectionPrompt: { type: String, default: "" },
  },
  { _id: false }
);

const StarterFileSchema = new Schema(
  {
    path: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    isEntrypoint: { type: Boolean, default: false },
    isReadOnly: { type: Boolean, default: false },
  },
  { _id: false }
);

// --- Root Project Schema ---

export const ProjectSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    track: {
      type: String,
      enum: ["python", "cpp", "c", "web", "dsa", "git-github", "prompt-engineering"],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["python3", "cpp", "c", "javascript"],
      required: true,
      default: "python3",
    },
    tier: {
      type: Number,
      enum: [1, 2, 3, 4], // 1=Parsons, 2=Guided Milestones, 3=Faded, 4=Capstone
      required: true,
      default: 2,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    description: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 30, min: 5 },
    xpReward: { type: Number, default: 100, min: 0 },
    prerequisiteRoadmapSlug: { type: String, default: null },
    starterFiles: [StarterFileSchema],
    milestones: [MilestoneSchema],
    tags: [String],
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/**
 * Helper to obtain the Project model from a given Mongoose connection (or default)
 */
export const getProjectModel = (connection = mongoose) => {
  return connection.models?.Project || connection.model("Project", ProjectSchema);
};

export default ProjectSchema;
