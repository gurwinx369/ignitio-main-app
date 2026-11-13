import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { UserCertificate } from "@/models/v2/user.certificate.model";
import { LessonCompletion } from "@/models/v2/lesson.completion.model";
import { FreePathResult } from "@/models/v2/freepathresult.model";
import { verifyFirebaseToken } from "@/lib/auth";
import { getStreakSummary, getLocalDateString, evaluateAndApplyLazyStreakState, addLocalDays, buildWeeklyStreakCalendar } from "@/lib/users/streak.service";
import { resolveCertificateTemplate } from "@/features/certificates/certificateTemplateResolver";

export async function GET(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    // Must fetch as a Mongoose document (not lean) so evaluateAndApplyLazyStreakState
    // can mutate streak in-place and persist only the streak subdocument.
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid })
      .select("email role roadmap_name activeRoadmapSlug createdAt streak badges profile");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Lazy miss detection: per spec, evaluated on app open.
    // May mutate user.streak and persist to DB if a state transition occurs.
    const nowUTC = new Date();
    await evaluateAndApplyLazyStreakState(
      user,
      nowUTC,
      {
        reconcileEstablishedStreak:
          true,
      },
    );

    const progresses = await RoadmapProgress.find({ firebaseUID: decodedToken.uid }).lean();
    const freePathDoc = await FreePathResult.findOne({ firebaseUID: decodedToken.uid }).select("roadmap").lean();

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

    // Reload freshly persisted streak so summary & calendar read exact database state
    const refreshedUser = await UserProfile.findById(user._id).select("streak").lean();
    const rawStreak = refreshedUser?.streak || user.streak || {};
    const timezone = rawStreak.timezone || "Asia/Kolkata";
    const todayLocal = getLocalDateString(nowUTC, timezone);
    const streakSummary = getStreakSummary(rawStreak, todayLocal, nowUTC);

    const [y, m, d] = todayLocal.split("-").map(Number);
    const todayObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeek = todayObj.getUTCDay();
    const weekStartLocal = addLocalDays(todayLocal, -dayOfWeek);
    const weekEndLocal = addLocalDays(weekStartLocal, 6);

    const completions = await LessonCompletion.find({
      userId: user._id,
      completedDateLocal: { $gte: weekStartLocal, $lte: weekEndLocal }
    }).select("completedDateLocal").lean();

    streakSummary.week = buildWeeklyStreakCalendar({
      userProfile: refreshedUser || user,
      nowUTC,
      completions
    });

    // Return empty badges for now per PR feedback
    const safeBadges = [];

    // Fetch MongoDB certificates for this user
    const mongoCerts = await UserCertificate
      .find({ userId: user._id }, { _id: 0, certificateKey: 1, certificateType: 1, roadmapFamily: 1, roadmapSlug: 1, roadmapTitle: 1, dayId: 1, dayTitle: 1, title: 1, description: 1, imageKey: 1, unlockedAtUTC: 1, metadata: 1 })
      .sort({ unlockedAtUTC: -1 })
      .lean();

    const safeCards = mongoCerts.map((c) => {
      const meta = c.metadata || {};
      return {
        certificateKey: c.certificateKey,
        certificateType: c.certificateType,
        roadmapFamily: c.roadmapFamily,
        roadmapSlug: c.roadmapSlug,
        roadmapTitle: c.roadmapTitle,
        dayId: c.dayId,
        dayTitle: c.dayTitle,
        title: c.title,
        description: c.description,
        imageKey: resolveCertificateTemplate(c),
        unlockedAt: c.unlockedAtUTC instanceof Date ? c.unlockedAtUTC.toISOString() : (c.unlockedAtUTC || new Date().toISOString()),
        // Top-level display fields for CertificateCanvas compatibility
        providedOn: meta.providedOn || "",
        dayNumber: meta.dayNumber ?? 1,
        quizCompletedCount: meta.quizCompletedCount ?? 0,
        durationMinutes: meta.durationMinutes ?? 0,
        metadata: {
          completedLevelsCount: meta.completedLevelsCount ?? 0,
          totalLevelsInDay: meta.totalLevelsInDay ?? 0,
          quizCompletedCount: meta.quizCompletedCount ?? 0,
          durationMinutes: meta.durationMinutes ?? 0,
          dayNumber: meta.dayNumber ?? 1,
          providedOn: meta.providedOn || "",
        },
      };
    });

    const isDsaLearner = user.activeRoadmapSlug === "dsa" ||
      (Array.isArray(freePathDoc?.roadmap) && freePathDoc.roadmap.includes("dsa") && !freePathDoc.roadmap.includes("python"));
    const resolvedActiveRoadmap = isDsaLearner
      ? "dsa"
      : (user.activeRoadmapSlug || user.roadmap_name || currentRoadmap || "python-beginner");

    return NextResponse.json({
      ok: true,
      profile: {
        email: user.email,
        role: user.role,
        currentRoadmap: resolvedActiveRoadmap,
        activeRoadmapSlug: resolvedActiveRoadmap,
        assignedRoadmaps: freePathDoc?.roadmap || (isDsaLearner ? ["dsa"] : []),
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
        displayName: user.profile?.displayName || "",
        bio: user.profile?.bio || "",
        avatarUrl: user.profile?.avatarUrl || "",
        avatarPreset: user.profile?.avatarPreset || "default",
        bannerColor: user.profile?.bannerColor || "cyan",
        avatarFrame: user.profile?.avatarFrame || "cyan",
        cards: safeCards,
      }
    }, { status: 200 });

  } catch (err) {
    console.error("[GET Profile] Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

const PatchProfileSchema = z.object({
  activeRoadmapSlug: z.string().trim().min(1).max(64).optional(),
  displayName: z.string().trim().max(40).optional(),
  bio: z.string().max(180).optional(),
  avatarUrl: z
    .string()
    .max(500)
    .refine((val) => val === "" || val.startsWith("http://") || val.startsWith("https://"), {
      message: "avatarUrl must be a valid http/https URL or empty string",
    })
    .optional(),
  avatarPreset: z.enum(["default", "spark", "phoenix", "learner", "builder", "creator"]).optional(),
  bannerColor: z.enum(["cyan", "blue", "purple", "orange", "green", "slate"]).optional(),
  avatarFrame: z.enum(["cyan", "blue", "purple", "orange", "green", "slate", "gold"]).optional(),
});

export async function PATCH(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
    }

    const validation = PatchProfileSchema.safeParse(body);
    if (!validation.success) {
      const first = validation.error.issues[0];
      return NextResponse.json(
        {
          message: first?.message || "Validation failed",
          field: first?.path?.join(".") ?? "",
        },
        { status: 400 }
      );
    }

    const { displayName, bio, avatarUrl, avatarPreset, bannerColor, avatarFrame, activeRoadmapSlug } = validation.data;

    // Build update object
    const update = {};
    if (activeRoadmapSlug !== undefined) {
      update["activeRoadmapSlug"] = activeRoadmapSlug.trim();
      update["roadmap_name"] = activeRoadmapSlug.trim();
    }
    if (displayName !== undefined) update["profile.displayName"] = displayName.trim();
    if (bio !== undefined) update["profile.bio"] = bio;
    if (avatarUrl !== undefined) update["profile.avatarUrl"] = avatarUrl;
    if (avatarPreset !== undefined) update["profile.avatarPreset"] = avatarPreset;
    if (bannerColor !== undefined) update["profile.bannerColor"] = bannerColor;
    if (avatarFrame !== undefined) update["profile.avatarFrame"] = avatarFrame;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await UserProfile.findOneAndUpdate(
      { firebaseUID: decodedToken.uid },
      { $set: update },
      { new: true }
    ).select("profile activeRoadmapSlug roadmap_name");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      profile: {
        activeRoadmapSlug: updatedUser.activeRoadmapSlug || updatedUser.roadmap_name || "python-beginner",
        currentRoadmap: updatedUser.activeRoadmapSlug || updatedUser.roadmap_name || "python-beginner",
        displayName: updatedUser.profile?.displayName || "",
        bio: updatedUser.profile?.bio || "",
        avatarUrl: updatedUser.profile?.avatarUrl || "",
        avatarPreset: updatedUser.profile?.avatarPreset || "default",
        bannerColor: updatedUser.profile?.bannerColor || "cyan",
        avatarFrame: updatedUser.profile?.avatarFrame || "cyan",
      }
    }, { status: 200 });

  } catch (err) {
    console.error("[PATCH Profile] Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

