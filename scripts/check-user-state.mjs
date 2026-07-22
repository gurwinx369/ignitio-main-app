/**
 * check-user-state.mjs
 *
 * Diagnoses the current DB state for a user: UserProfile, RoadmapPersonalization, RoadmapProgress.
 *
 * Usage:
 *   node scripts/check-user-state.mjs
 */

import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI   = process.env.MONGO_URI;
const FIREBASE_UID = "i0k4EWsW2ggq8abHNoYyK9mpio13";

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  const db = mongoose.connection.db;

  // Raw collection queries to avoid model import issues
  const userProfile = await db.collection("userprofiles").findOne({ firebaseUID: FIREBASE_UID });
  console.log("── UserProfile ─────────────────────────────────────────");
  if (!userProfile) {
    console.log("  NOT FOUND");
  } else {
    console.log(`  _id                    : ${userProfile._id}`);
    console.log(`  email                  : ${userProfile.email}`);
    console.log(`  onboardingComplete     : ${userProfile.onboardingComplete}`);
    console.log(`  goal                   : ${userProfile.goal}`);
    console.log(`  roadmapPersonalizationRef : ${userProfile.roadmapPersonalizationRef}`);
    console.log(`  roadmap_name           : ${userProfile.roadmap_name}`);
  }

  console.log("\n── RoadmapPersonalization ──────────────────────────────");
  const personalization = await db.collection("roadmappersonalizations").findOne({ firebaseUID: FIREBASE_UID });
  if (!personalization) {
    console.log("  NOT FOUND");
  } else {
    console.log(`  _id            : ${personalization._id}`);
    console.log(`  roadmapSlug    : ${personalization.roadmapSlug}`);
    console.log(`  isActive       : ${personalization.isActive}`);
    console.log(`  totalLevels    : ${personalization.totalLevels}`);
    console.log(`  includedDayIds : ${personalization.includedDayIds?.length ?? 0} days`);
  }

  console.log("\n── RoadmapProgress ─────────────────────────────────────");
  const progress = await db.collection("roadmapprogresses").findOne({ firebaseUID: FIREBASE_UID });
  if (!progress) {
    console.log("  NOT FOUND");
  } else {
    console.log(`  _id         : ${progress._id}`);
    console.log(`  roadmapSlug : ${progress.roadmapSlug}`);
    console.log(`  status      : ${progress.status}`);
    console.log(`  totalLevels : ${progress.totalLevels}`);
  }

  console.log("\n── OnboardingResponse ──────────────────────────────────");
  const onboarding = await db.collection("onboardingresponses").findOne({ firebaseUID: FIREBASE_UID });
  if (!onboarding) {
    console.log("  NOT FOUND");
  } else {
    console.log(`  _id       : ${onboarding._id}`);
    console.log(`  status    : ${onboarding.status}`);
    console.log(`  entryPoint: ${onboarding.entryPoint}`);
    console.log(`  completed : ${onboarding.completedAt}`);
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
