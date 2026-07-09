import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { verifyFirebaseToken } from "@/lib/auth";
import { getStreakSummary, getLocalDateString } from "@/lib/users/streak.service";

export async function GET(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid })
      .select("email role roadmap_name createdAt streak badges");


    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const progresses = await RoadmapProgress.find({ firebaseUID: decodedToken.uid }).lean();

    // Aggregate stats defensively
    let completedLevels = 0;
    let completedDays = 0;
    let passedAssignments = 0;
    let roadmapsStarted = 0;
    let roadmapsCompleted = 0;

    let currentRoadmap = user.roadmap_name || null;
    let latestActivity = null;

    for (const prog of progresses) {
      // Aggregate stats safely (can be array or number depending on legacy state)
      if (Array.isArray(prog.completedLevels)) {
        completedLevels += prog.completedLevels.length;
      } else if (typeof prog.completedLevels === 'number') {
        completedLevels += prog.completedLevels;
      }

      if (Array.isArray(prog.completedDays)) {
        completedDays += prog.completedDays.length;
      } else if (typeof prog.completedDays === 'number') {
        completedDays += prog.completedDays;
      }

      if (Array.isArray(prog.passedAssignments)) {
        passedAssignments += prog.passedAssignments.length;
      } else if (typeof prog.passedAssignments === 'number') {
        passedAssignments += prog.passedAssignments;
      }

      if (prog.status === "completed") {
        roadmapsCompleted += 1;
        roadmapsStarted += 1;
      } else if (prog.status === "in_progress" || (Array.isArray(prog.completedLevels) && prog.completedLevels.length > 0)) {
        roadmapsStarted += 1;
      }

      // Find most recently active roadmap
      const activeAt = prog.lastLearningActiveAt || prog.updatedAt || prog.createdAt;
      if (activeAt && (!latestActivity || new Date(activeAt) > new Date(latestActivity))) {
        latestActivity = activeAt;
        currentRoadmap = prog.roadmapTitle || prog.roadmapSlug || currentRoadmap;
      }
    }

    // Get streak summary with safe defaults
    const rawStreak = user.streak || {};
    const safeStreak = {
      currentCount: rawStreak.currentCount || 0,
      longestCount: rawStreak.longestCount || 0,
      lastCompletedDateLocal: rawStreak.lastCompletedDateLocal || null,
      timezone: rawStreak.timezone || "Asia/Kolkata",
      freezeBank: rawStreak.freezeBank || 0,
      freezeCredits: rawStreak.freezeCredits || [],
      onboardingGraceUsed: rawStreak.onboardingGraceUsed || false,
      onboardingStartDate: rawStreak.onboardingStartDate || null,
      earnBack: rawStreak.earnBack || {
        active: false,
        deadline: null,
        lessonsCompletedInWindow: 0,
        countAtRisk: 0,
      },
    };

    const now = new Date();
    const todayLocal = getLocalDateString(now, safeStreak.timezone);
    const streakSummary = getStreakSummary(safeStreak, todayLocal);

    // Return empty badges for now per PR feedback
    const safeBadges = [];

    return NextResponse.json({
      ok: true,
      profile: {
        email: user.email,
        role: user.role,
        currentRoadmap,
        joinedAt: user.createdAt,
        streak: streakSummary,
        stats: {
          completedLevels,
          completedDays,
          passedAssignments,
          roadmapsStarted,
          roadmapsCompleted,
        },
        badges: safeBadges,
      }
    }, { status: 200 });

  } catch (err) {
    console.error("[GET Profile] Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
