import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { verifyFirebaseToken } from "@/lib/auth";
import {
  normalizeCompletedLevels,
  calculateRoadmapStatus,
  calculateCompletedDays,
  sanitizeStringArray,
  getNow,
} from "@/lib/roadmaps/progress.helpers";
import { normalizeUserProfileRetentionFields } from "@/lib/users/profileMigration.helpers";
import { updateStreakOnLevelCompletion, getStreakSummary, getLocalDateString, evaluateAndApplyLazyStreakState } from "@/lib/users/streak.service";

const SLUG_REGEX = /^[a-z0-9-]+$/;

function validateSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  return SLUG_REGEX.test(slug.toLowerCase().trim());
}

export async function GET(request, { params }) {
  await connectToDB();

  const resolvedParams = await params;
  const roadmapSlug = resolvedParams?.roadmapSlug?.toLowerCase().trim();
  if (!validateSlug(roadmapSlug)) {
    return NextResponse.json({ message: "Invalid roadmap slug" }, { status: 400 });
  }

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await normalizeUserProfileRetentionFields(user._id);

    const progress = await RoadmapProgress.findOne({
      firebaseUID: decodedToken.uid,
      roadmapSlug,
    }).lean();

    if (!progress) {
      return NextResponse.json({ ok: true, source: "none", progress: null }, { status: 200 });
    }

    return NextResponse.json({ ok: true, source: "mongodb", progress }, { status: 200 });
  } catch (err) {
    console.error("[GET Progress] Error", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

const MigrationSchema = z.object({
  roadmapTitle: z.string().optional().default(""),
  role: z.enum(["student", "writer", "designer", "developer", "other"]).optional().default("other"),
  totalLevels: z.number().min(0),
  allLevelIds: z.array(z.string()),
  days: z.array(
    z.object({
      id: z.string(),
      levelIds: z.array(z.string()),
    })
  ).optional().default([]),
  completedLevels: z.array(z.string()).optional().default([]),
  passedAssignments: z.array(z.string()).optional().default([]),
  lastActiveLevelId: z.string().nullable().optional().default(null),
});

export async function POST(request, { params }) {
  await connectToDB();

  const resolvedParams = await params;
  const roadmapSlug = resolvedParams?.roadmapSlug?.toLowerCase().trim();
  if (!validateSlug(roadmapSlug)) {
    return NextResponse.json({ message: "Invalid roadmap slug" }, { status: 400 });
  }

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const validation = MigrationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ message: "Validation failed" }, { status: 422 });
  }

  const data = validation.data;
  const canonicalTotalLevels = data.allLevelIds.length;

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await normalizeUserProfileRetentionFields(user._id);

    const existingProgress = await RoadmapProgress.findOne({
      firebaseUID: decodedToken.uid,
      roadmapSlug,
    }).lean();

    if (existingProgress) {
      return NextResponse.json({ ok: true, source: "mongodb", progress: existingProgress }, { status: 200 });
    }

    const now = getNow();
    const sanitizedCompleted = sanitizeStringArray(data.completedLevels);
    const normalizedCompleted = normalizeCompletedLevels(sanitizedCompleted, data.allLevelIds);
    const sanitizedAssignments = sanitizeStringArray(data.passedAssignments);
    const completedDays = calculateCompletedDays({ days: data.days, completedLevels: normalizedCompleted });
    const progressStatus = calculateRoadmapStatus({
      completedLevels: normalizedCompleted,
      totalLevels: canonicalTotalLevels,
    });

    const hasProgress = normalizedCompleted.length > 0;

    const newProgress = await RoadmapProgress.create({
      userId: user._id,
      firebaseUID: decodedToken.uid,
      roadmapSlug,
      roadmapTitle: data.roadmapTitle,
      role: data.role,
      status: progressStatus,
      completedLevels: normalizedCompleted,
      totalLevels: canonicalTotalLevels,
      completedDays,
      passedAssignments: Array.from(new Set(sanitizedAssignments)),
      lastActiveLevelId: data.lastActiveLevelId,
      startedAt: hasProgress ? now : null,
      completedAt: progressStatus === "completed" ? now : null,
      lastLearningActiveAt: hasProgress ? now : null,
      migratedFromLocalStorage: true,
      migratedAt: now,
    });

    // Update user profile activity
    const updateQuery = { $set: { last_active_on: now } };
    if (hasProgress) {
      updateQuery.$set.last_learning_active_on = now;
    }
    await UserProfile.updateOne({ _id: user._id }, updateQuery, { timestamps: false });

    return NextResponse.json({ ok: true, source: "migration", progress: newProgress }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      try {
        const existingProgress = await RoadmapProgress.findOne({
          firebaseUID: decodedToken.uid,
          roadmapSlug,
        }).lean();
        if (existingProgress) {
          return NextResponse.json({ ok: true, source: "mongodb", progress: existingProgress }, { status: 200 });
        }
      } catch (raceErr) {
        console.error("[POST Progress Race] Error", raceErr);
      }
    }
    console.error("[POST Progress] Error", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

const PatchSchema = z.object({
  action: z.enum(["start_lesson", "complete_level", "pass_assignment", "sync"]),
  roadmapTitle: z.string().optional().default(""),
  role: z.enum(["student", "writer", "designer", "developer", "other"]).optional().default("other"),
  totalLevels: z.number().min(0),
  allLevelIds: z.array(z.string()),
  days: z.array(
    z.object({
      id: z.string(),
      levelIds: z.array(z.string()),
    })
  ).optional().default([]),
  levelId: z.string().optional(),
  dayId: z.string().optional(),
  completedLevels: z.array(z.string()).optional().default([]),
  passedAssignments: z.array(z.string()).optional().default([]),
});

export async function PATCH(request, { params }) {
  await connectToDB();

  const resolvedParams = await params;
  const roadmapSlug = resolvedParams?.roadmapSlug?.toLowerCase().trim();
  if (!validateSlug(roadmapSlug)) {
    return NextResponse.json({ message: "Invalid roadmap slug" }, { status: 400 });
  }

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const validation = PatchSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ message: "Validation failed" }, { status: 422 });
  }

  const data = validation.data;
  const canonicalTotalLevels = data.allLevelIds.length;
  const now = getNow();

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await normalizeUserProfileRetentionFields(user._id);

    let progress = await RoadmapProgress.findOne({
      firebaseUID: decodedToken.uid,
      roadmapSlug,
    });

    if (!progress) {
      progress = new RoadmapProgress({
        userId: user._id,
        firebaseUID: decodedToken.uid,
        roadmapSlug,
        roadmapTitle: data.roadmapTitle,
        role: data.role,
        totalLevels: canonicalTotalLevels,
        startedAt: null,
      });
    }

    let userActivityUpdates = { last_active_on: now };
    let meaningfulLearningActivity = false;
    let isNewLevelCompletion = false;

    if (data.action === "start_lesson") {
      progress.status = "in_progress";
      if (data.levelId) progress.lastActiveLevelId = data.levelId;
      if (!progress.startedAt) progress.startedAt = now;
      meaningfulLearningActivity = true;
    } else if (data.action === "complete_level") {
      if (data.levelId && !progress.completedLevels.includes(data.levelId)) {
        isNewLevelCompletion = true;
        const newCompleted = [...progress.completedLevels, data.levelId];
        progress.completedLevels = normalizeCompletedLevels(newCompleted, data.allLevelIds);
        progress.completedDays = calculateCompletedDays({ days: data.days, completedLevels: progress.completedLevels });
        const newStatus = calculateRoadmapStatus({
          completedLevels: progress.completedLevels,
          totalLevels: canonicalTotalLevels,
        });
        progress.status = newStatus;
        if (newStatus === "completed" && !progress.completedAt) {
          progress.completedAt = now;
        }
        if (!progress.startedAt) progress.startedAt = now;
        meaningfulLearningActivity = true;
      }
      if (data.levelId) progress.lastActiveLevelId = data.levelId;
    } else if (data.action === "pass_assignment") {
      if (data.dayId && !progress.passedAssignments.includes(data.dayId)) {
        progress.passedAssignments.push(data.dayId);
        meaningfulLearningActivity = true;
      }
    } else if (data.action === "sync") {
      const sanitizedCompleted = sanitizeStringArray(data.completedLevels);
      const normalizedCompleted = normalizeCompletedLevels(sanitizedCompleted, data.allLevelIds);

      const beforeCompletedCount = progress.completedLevels.length;
      progress.completedLevels = normalizedCompleted;
      progress.completedDays = calculateCompletedDays({ days: data.days, completedLevels: progress.completedLevels });

      const beforeAssignmentCount = progress.passedAssignments.length;
      progress.passedAssignments = Array.from(new Set(sanitizeStringArray(data.passedAssignments)));

      const newStatus = calculateRoadmapStatus({
        completedLevels: progress.completedLevels,
        totalLevels: canonicalTotalLevels,
      });
      progress.status = newStatus;
      if (newStatus === "completed" && !progress.completedAt) {
        progress.completedAt = now;
      }
      if (progress.completedLevels.length > 0 && !progress.startedAt) {
        progress.startedAt = now;
      }
      if (progress.completedLevels.length > beforeCompletedCount || progress.passedAssignments.length > beforeAssignmentCount) {
        meaningfulLearningActivity = true;
      }
    }

    if (meaningfulLearningActivity) {
      progress.lastLearningActiveAt = now;
      userActivityUpdates.last_learning_active_on = now;
    }

    await progress.save();

    await UserProfile.updateOne({ _id: user._id }, { $set: userActivityUpdates }, { timestamps: false });

    let streakSummary = null;
    if (data.action === "complete_level" && isNewLevelCompletion) {
      // New level: updateStreakOnLevelCompletion runs lazy miss detection internally.
      streakSummary = await updateStreakOnLevelCompletion({
        userProfile: user,
        roadmapSlug,
        levelId: data.levelId,
      });
    } else if (data.action === "complete_level") {
      // Duplicate complete_level (level already in completedLevels on RoadmapProgress).
      // Do NOT call updateStreakOnLevelCompletion — that would insert a LessonCompletion
      // for a legacy-completed level and incorrectly credit a streak lesson.
      // Still run lazy miss detection so app-open detection fires on this request too.
      await evaluateAndApplyLazyStreakState(user, now);
      const tz = user.streak?.timezone || "Asia/Kolkata";
      const todayLocal = getLocalDateString(now, tz);
      streakSummary = getStreakSummary(user.streak || {}, todayLocal, now);
    } else {
      const tz = user.streak?.timezone || "Asia/Kolkata";
      const todayLocal = getLocalDateString(now, tz);
      streakSummary = getStreakSummary(user.streak || {}, todayLocal);
    }

    return NextResponse.json({ ok: true, progress, streak: streakSummary }, { status: 200 });
  } catch (err) {
    console.error("[PATCH Progress] Error", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
