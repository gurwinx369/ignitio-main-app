import mongoose, { Schema } from "mongoose";

// --- Enums ---

export const ROADMAP_GOAL = {
  LAND_INTERNSHIP: "land_internship",
  BUILD_PRODUCT: "build_product",
  NOT_SET: "not_set",
};

// --- Sub-schemas ---

// Mirrors the level shape in every PE/DSA data file.
// _id: false — levels are always accessed via their parent day;
// they are never queried standalone, so skip the overhead.
const DaySchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    concept: { type: String, default: "" },
    transcript: { type: String, default: "" },
    videoId: { type: String, required: true, trim: true },
    startSec: { type: Number, required: true, min: 0 },
    endSec: { type: Number, required: true, min: 0 },
    durationInMinutes: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

// Mirrors the day shape: { id, title, color, levels[] }
const WeekSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    color: { type: String, default: "#3b82f6", trim: true },
    levels: {
      type: [DaySchema],
      default: [],
      validate: {
        validator: (levels) => levels.length > 0,
        message: "A day must have at least one level.",
      },
    },
  },
  { _id: false },
);

// --- Root schema ---

const RoadmapTemplateSchema = new Schema(
  {
    // Stable, human-readable slug — e.g. "prompt-engineering-designer".
    // This is what RoadmapProgress.roadmapSlug references.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    concept: { type: String, default: "" },
    transcript: { type: String, default: "" },
    // Which goal this roadmap helps users achieve.
    goal: {
      type: String,
      enum: Object.values(ROADMAP_GOAL),
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    days: {
      type: [WeekSchema],
      default: [],
      validate: {
        validator: (days) => days.length > 0,
        message: "A roadmap must have at least one day.",
      },
    },
    // Computed at write time — avoids runtime iteration on every page load.
    totalLevels: { type: Number, default: 0, min: 0 },
    // Soft toggle without deleting the document.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// --- Pre-save: keep totalLevels in sync ---

RoadmapTemplateSchema.pre("save", function (next) {
  this.totalLevels = this.days.reduce((sum, day) => sum + day.levels.length, 0);
  next();
});

// --- Static helpers ---

/**
 * Fetch one active roadmap by its slug.
 * Returns null when not found — caller decides how to handle the miss.
 */
RoadmapTemplateSchema.statics.findBySlug = function (slug) {
  return this.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
  }).lean();
};

/**
 * Fetch all active roadmaps for a given goal.
 * Lean because templates are read-only at runtime.
 */
RoadmapTemplateSchema.statics.findByGoal = function (goal) {
  return this.find({ goal, isActive: true }).lean();
};

/**
 * Upsert a roadmap from the static JS data files.
 * Idempotent — safe to run on every deploy.
 *
 * @param {object} data      - Shape must match the PE/DSA JS exports.
 * @param {string} goal      - One of ROADMAP_GOAL values.
 */
RoadmapTemplateSchema.statics.upsertFromStaticData = function (data, goal) {
  const totalLevels = data.days.reduce(
    (sum, day) => sum + day.levels.length,
    0,
  );

  return this.findOneAndUpdate(
    { slug: data.id },
    {
      $set: {
        slug: data.id,
        title: data.title,
        description: data.description ?? "",
        concept: data.concept ?? "",
        transcript: data.transcript ?? "",
        goal,
        days: data.days,
        totalLevels,
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
};

// --- Model (singleton-safe for Next.js hot reload) ---

export const RoadmapTemplate =
  mongoose.models.RoadmapTemplate ||
  mongoose.model("RoadmapTemplate", RoadmapTemplateSchema);
