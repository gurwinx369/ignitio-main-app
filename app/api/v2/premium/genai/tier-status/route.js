import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import {
  checkPremiumGenAiAccess,
  getPremiumGenAiAccessHttpStatus,
} from "@/lib/premium/genai/premium-genai-access.service";
import { RoadmapPersonalization } from "@/models/v2/roadmap.personalized.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";

// Beginner week IDs — matches genAiTiers.js minWeek:1 maxWeek:4
const BEGINNER_DAY_IDS = ["genai-w1", "genai-w2", "genai-w3", "genai-w4"];
const GENAI_SLUG = "gen-ai-internship";

export async function GET(request) {
  await connectToDB();

  // async-cheap-condition-before-await: auth is sync-ish, happens before DB
  const { decodedToken, error, status } = await verifyFirebaseToken(request);

  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  const firebaseUID = decodedToken.uid;

  try {
    // Access guard — reuse existing service
    const access = await checkPremiumGenAiAccess(firebaseUID);

    if (access.status !== "ready") {
      return NextResponse.json(
        { error: `Premium GenAI access denied: ${access.status}` },
        { status: getPremiumGenAiAccessHttpStatus(access.status) },
      );
    }

    // async-parallel: personalization + progress are independent — load together
    const [personalization, progress] = await Promise.all([
      RoadmapPersonalization.findOne(
        { firebaseUID, roadmapSlug: GENAI_SLUG, isActive: true },
        { skippedDayIds: 1, includedDayIds: 1, _id: 0 },
      ).lean(),
      RoadmapProgress.findOne(
        { firebaseUID, roadmapSlug: GENAI_SLUG },
        { completedDays: 1, _id: 0 },
      ).lean(),
    ]);

    const skippedDayIds = personalization?.skippedDayIds ?? [];
    const completedDays = progress?.completedDays ?? [];

    // A beginner week is "skipped" when it's in skippedDayIds AND not in includedDayIds
    const includedDayIds = personalization?.includedDayIds ?? [];
    const includedSet = new Set(includedDayIds);

    const beginnerSkippedCount = BEGINNER_DAY_IDS.filter(
      (id) => skippedDayIds.includes(id) && !includedSet.has(id),
    ).length;

    const beginnerSkipped = beginnerSkippedCount === BEGINNER_DAY_IDS.length;

    // Beginner weeks that the user actually has in their roadmap (not skipped)
    const beginnerIncluded = BEGINNER_DAY_IDS.filter((id) =>
      includedSet.has(id),
    );

    const completedSet = new Set(completedDays);
    const beginnerCompletedCount = beginnerIncluded.filter((id) =>
      completedSet.has(id),
    ).length;

    const beginnerCompleted =
      beginnerIncluded.length > 0 &&
      beginnerCompletedCount === beginnerIncluded.length;

    return NextResponse.json({
      beginnerSkipped,
      beginnerCompleted,
      beginnerIncludedCount: beginnerIncluded.length,
      beginnerCompletedCount,
    });
  } catch (err) {
    console.error("[tier-status] Error", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
