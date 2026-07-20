// Seed helper for the Gen AI roadmap template.
// Idempotent — safe to call on every deploy.
// Call this from the admin seed endpoint or a startup script.

import connectToDB from "@/dbConfig/dbConnection";
import { RoadmapTemplate, ROADMAP_GOAL } from "@/models/v2/roadmap.templates.model";
import { genAiRoadmapData } from "@/data/genAi/genAiRoadmapData";

/**
 * Upsert the Gen AI roadmap template into MongoDB.
 * Returns the upserted document.
 */
export async function seedGenAiTemplate() {
  await connectToDB();
  const doc = await RoadmapTemplate.upsertFromStaticData(
    genAiRoadmapData,
    ROADMAP_GOAL.LAND_INTERNSHIP
  );
  return doc;
}
