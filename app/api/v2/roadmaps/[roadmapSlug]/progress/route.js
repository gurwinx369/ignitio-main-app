import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { RoadmapTemplate } from "@/models/v2/roadmap.templates.model";
import { verifyFirebaseToken } from "@/lib/auth";
import {
  isPremiumRoadmap,
} from "@/lib/premium/premium-roadmap-registry";

import {
  checkPremiumRoadmapReadiness,
  getPremiumRoadmapReadinessHttpStatus,
} from "@/lib/premium/premium-roadmap-readiness.service";
import {
  deriveGenAiActiveLevelIds,
  normalizeCanonicalCompletedLevels,
  calculateRequiredRoadmapStatus,
  deriveGenAiCompletedDays,
} from "@/lib/roadmaps/genai.progress.helpers";
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

  const roadmapSlug =
    resolvedParams?.roadmapSlug
      ?.toLowerCase()
      .trim();

  if (!validateSlug(roadmapSlug)) {
    return NextResponse.json(
      {
        message: "Invalid roadmap slug",
      },
      {
        status: 400,
      },
    );
  }

  const {
    decodedToken,
    error,
    status,
  } = await verifyFirebaseToken(request);

  if (error) {
    return NextResponse.json(
      {
        message: error,
      },
      {
        status,
      },
    );
  }

  const firebaseUID =
    decodedToken.uid;

  try {
    // Premium roadmaps use the generic Premium readiness dispatcher.
    if (isPremiumRoadmap(roadmapSlug)) {
      const access =
        await checkPremiumRoadmapReadiness({
          firebaseUID,
          roadmapSlug,
        });

      if (access.status !== "ready") {
        return NextResponse.json(
          {
            error:
              `Premium GenAI access denied: ${access.status}`,
          },
          {
            status:
              getPremiumRoadmapReadinessHttpStatus({
                roadmapSlug,
                accessStatus:
                  access.status,
              }),
          },
        );
      }

      return NextResponse.json(
        {
          ok: true,
          source: "mongodb",
          progress:
            access.progress,
        },
        {
          status: 200,
        },
      );
    }

    // Normal/Foundation roadmaps continue through
    // the standard RoadmapProgress path.
    const [user, progress] =
      await Promise.all([
        UserProfile.findOne({
          firebaseUID,
        })
          .select(
            "_id retentionUnsubscribed retentionUnsubscribedAt last_learning_active_on",
          )
          .lean(),

        RoadmapProgress.findOne({
          firebaseUID,
          roadmapSlug,
        }).lean(),
      ]);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

    await normalizeUserProfileRetentionFields(
      user._id,
      user,
    );

    if (!progress) {
      return NextResponse.json(
        {
          ok: true,
          source: "none",
          progress: null,
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        source: "mongodb",
        progress,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(
      "[GET Progress] Error",
      err.name,
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
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

  if (isPremiumRoadmap(roadmapSlug)) {
    const access =
      await checkPremiumRoadmapReadiness({
        firebaseUID: decodedToken.uid,
        roadmapSlug,
      });

    if (access.status === "ready") {
      return NextResponse.json(
        {
          ok: true,
          source: "mongodb",
          progress: access.progress,
        },
        { status: 200 },
      );
    }

    if (access.status === "upgrade_required") {
      return NextResponse.json(
        { message: "upgrade_required" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: access.status,
      },
      {
        status:
          getPremiumRoadmapReadinessHttpStatus({
            roadmapSlug,
            accessStatus: access.status,
          }),
      },
    );
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
  totalLevels: z.number().min(0).optional().default(0),
  allLevelIds: z.array(z.string()).optional().default([]),
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
  const now = getNow();

  try {
    let user = null;
    let access = null;
    let progress = null;
    let template = null;
    let activeLevelIds = data.allLevelIds;
    let canonicalTotalLevels = data.allLevelIds.length;

    if (isPremiumRoadmap(roadmapSlug)) {
      access =
        await checkPremiumRoadmapReadiness({
          firebaseUID: decodedToken.uid,
          roadmapSlug,
        });

      if (access.status !== "ready") {
        return NextResponse.json(
          {
            error: `Premium GenAI access denied: ${access.status}`,
          },
          {
            status:
              getPremiumRoadmapReadinessHttpStatus({
                roadmapSlug,
                accessStatus: access.status,
              }),
          },
        );
      }
    }

    if (roadmapSlug === "gen-ai-internship") {

      // The Premium access guard intentionally returns lean/read-only
      // objects. Progress/streak mutations need real Mongoose documents.
      user = await UserProfile.findOne({
        _id: access.userProfile._id,
        firebaseUID: decodedToken.uid,
      });

      if (!user) {
        return NextResponse.json(
          {
            error:
              "Premium GenAI user profile changed while processing the request",
          },
          { status: 409 },
        );
      }

      progress = await RoadmapProgress.findOne({
        _id: access.progress._id,
        firebaseUID: decodedToken.uid,
        roadmapSlug,
      });

      if (!progress) {
        return NextResponse.json(
          {
            error:
              "Premium GenAI progress changed while processing the request",
          },
          { status: 409 },
        );
      }

      template = await RoadmapTemplate.findBySlug(
        roadmapSlug,
      );

      if (!template) {
        return NextResponse.json(
          {
            error:
              "Premium GenAI canonical template is unavailable",
          },
          { status: 409 },
        );
      }

      const canonicalDayIds = new Set(
        (template.days || []).map((day) => day.id),
      );

      const includedDayIds =
        access.personalization.includedDayIds || [];

      const hasInvalidIncludedDay =
        includedDayIds.some(
          (dayId) => !canonicalDayIds.has(dayId),
        );

      if (hasInvalidIncludedDay) {
        return NextResponse.json(
          {
            error:
              "Premium GenAI personalization is inconsistent with the canonical template",
          },
          { status: 409 },
        );
      }

      activeLevelIds = deriveGenAiActiveLevelIds(
        template,
        access.personalization,
      );

      canonicalTotalLevels = activeLevelIds.length;

      if (
        Number(access.personalization.totalLevels) !==
        canonicalTotalLevels
      ) {
        return NextResponse.json(
          {
            error:
              "Premium GenAI personalization level count is inconsistent",
          },
          { status: 409 },
        );
      }
    } else {
      user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      await normalizeUserProfileRetentionFields(user._id);

      progress = await RoadmapProgress.findOne({
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
      } else if (!progress.roadmapTitle && data.roadmapTitle) {
        progress.roadmapTitle = data.roadmapTitle;
      }
    }

    let userActivityUpdates = { last_active_on: now };
    let meaningfulLearningActivity = false;
    let isNewLevelCompletion = false;
    let progressPersistedAtomically = false;

    if (
      roadmapSlug === "gen-ai-internship" &&
      (data.action === "start_lesson" ||
        data.action === "complete_level")
    ) {
      if (!data.levelId) {
        return NextResponse.json(
          { error: "levelId is required" },
          { status: 422 },
        );
      }

      if (!activeLevelIds.includes(data.levelId)) {
        return NextResponse.json(
          { error: "Level is not active in this Premium GenAI roadmap" },
          { status: 403 },
        );
      }
    }

    if (data.action === "start_lesson") {
      progress.status = "in_progress";

      if (data.levelId) {
        progress.lastActiveLevelId = data.levelId;
      }

      if (!progress.startedAt) {
        progress.startedAt = now;
      }

      if (progress.roadmapTitle) {
        userActivityUpdates.roadmap_name = progress.roadmapTitle;
      }

      meaningfulLearningActivity = true;
    } else if (data.action === "complete_level") {
      if (data.levelId) {
        /*
         * Newly-created legacy progress documents do not exist in MongoDB yet,
         * so keep the normal single-save path for those.
         *
         * Existing progress documents use compare-and-retry so two concurrent
         * level completions cannot overwrite each other's completedLevels array.
         */
        if (progress.isNew) {
          if (!progress.completedLevels.includes(data.levelId)) {
            if (roadmapSlug === "gen-ai-internship") {
              isNewLevelCompletion = true;

              const newCompleted = [
                ...progress.completedLevels,
                data.levelId,
              ];

              progress.completedLevels =
                normalizeCanonicalCompletedLevels(
                  progress.completedLevels,
                  newCompleted,
                  activeLevelIds,
                );

              progress.completedDays =
                deriveGenAiCompletedDays(
                  template,
                  access.personalization,
                  progress.completedLevels,
                );

              const newStatus =
                calculateRequiredRoadmapStatus(
                  progress.completedLevels,
                  activeLevelIds,
                );

              progress.status = newStatus;

              if (
                newStatus === "completed" &&
                !progress.completedAt
              ) {
                progress.completedAt = now;
              }

              if (!progress.startedAt) {
                progress.startedAt = now;
              }

              meaningfulLearningActivity = true;
            } else {
              isNewLevelCompletion = true;

              const newCompleted = [
                ...progress.completedLevels,
                data.levelId,
              ];

              progress.completedLevels =
                normalizeCompletedLevels(
                  newCompleted,
                  data.allLevelIds,
                );

              progress.completedDays =
                calculateCompletedDays({
                  days: data.days,
                  completedLevels:
                    progress.completedLevels,
                });

              const newStatus =
                calculateRoadmapStatus({
                  completedLevels:
                    progress.completedLevels,
                  totalLevels:
                    canonicalTotalLevels,
                });

              progress.status = newStatus;

              if (
                newStatus === "completed" &&
                !progress.completedAt
              ) {
                progress.completedAt = now;
              }

              if (!progress.startedAt) {
                progress.startedAt = now;
              }

              meaningfulLearningActivity = true;
            }
          }

          progress.lastActiveLevelId =
            data.levelId;
        } else {
          const MAX_COMPLETION_UPDATE_ATTEMPTS = 3;
          let completionHandled = false;

          for (
            let attempt = 0;
            attempt < MAX_COMPLETION_UPDATE_ATTEMPTS;
            attempt += 1
          ) {
            const currentCompleted = [
              ...(progress.completedLevels || []),
            ];

            /*
             * Retry/idempotency case:
             * another request may already have persisted this level.
             */
            if (
              currentCompleted.includes(
                data.levelId,
              )
            ) {
              progress =
                await RoadmapProgress.findOneAndUpdate(
                  {
                    _id: progress._id,
                    firebaseUID:
                      decodedToken.uid,
                    roadmapSlug,
                  },
                  {
                    $set: {
                      lastActiveLevelId:
                        data.levelId,
                    },
                  },
                  {
                    new: true,
                    runValidators: true,
                  },
                );

              if (!progress) {
                throw new Error(
                  "Roadmap progress disappeared during level completion",
                );
              }

              isNewLevelCompletion = false;
              progressPersistedAtomically = true;
              completionHandled = true;
              break;
            }

            let nextCompleted;
            let nextCompletedDays;
            let nextStatus;

            if (
              roadmapSlug ===
              "gen-ai-internship"
            ) {
              nextCompleted =
                normalizeCanonicalCompletedLevels(
                  currentCompleted,
                  [
                    ...currentCompleted,
                    data.levelId,
                  ],
                  activeLevelIds,
                );

              nextCompletedDays =
                deriveGenAiCompletedDays(
                  template,
                  access.personalization,
                  nextCompleted,
                );

              nextStatus =
                calculateRequiredRoadmapStatus(
                  nextCompleted,
                  activeLevelIds,
                );
            } else {
              nextCompleted =
                normalizeCompletedLevels(
                  [
                    ...currentCompleted,
                    data.levelId,
                  ],
                  data.allLevelIds,
                );

              nextCompletedDays =
                calculateCompletedDays({
                  days: data.days,
                  completedLevels:
                    nextCompleted,
                });

              nextStatus =
                calculateRoadmapStatus({
                  completedLevels:
                    nextCompleted,
                  totalLevels:
                    canonicalTotalLevels,
                });
            }

            const progressUpdates = {
              completedLevels: nextCompleted,
              completedDays:
                nextCompletedDays,
              status: nextStatus,
              lastActiveLevelId:
                data.levelId,
              lastLearningActiveAt: now,
            };

            if (!progress.startedAt) {
              progressUpdates.startedAt =
                now;
            }

            if (
              nextStatus === "completed" &&
              !progress.completedAt
            ) {
              progressUpdates.completedAt =
                now;
            }

            /*
             * Compare-and-swap:
             *
             * Update only if completedLevels is still exactly the snapshot
             * we calculated from. If another completion won the race,
             * this returns null and we retry from the newest DB state.
             */
            const updatedProgress =
              await RoadmapProgress.findOneAndUpdate(
                {
                  _id: progress._id,
                  firebaseUID:
                    decodedToken.uid,
                  roadmapSlug,
                  completedLevels:
                    currentCompleted,
                },
                {
                  $set: progressUpdates,
                },
                {
                  new: true,
                  runValidators: true,
                },
              );

            if (updatedProgress) {
              progress = updatedProgress;
              isNewLevelCompletion = true;
              meaningfulLearningActivity =
                true;
              progressPersistedAtomically =
                true;
              completionHandled = true;
              break;
            }

            progress =
              await RoadmapProgress.findOne({
                _id: progress._id,
                firebaseUID:
                  decodedToken.uid,
                roadmapSlug,
              });

            if (!progress) {
              throw new Error(
                "Roadmap progress disappeared during concurrent level completion",
              );
            }
          }

          if (!completionHandled) {
            throw new Error(
              "Roadmap progress changed repeatedly during level completion",
            );
          }
        }
      }
    } else if (data.action === "pass_assignment") {
      if (data.dayId && !progress.passedAssignments.includes(data.dayId)) {
        if (roadmapSlug === "gen-ai-internship") {
          if (!access.personalization.includedDayIds.includes(data.dayId)) {
            return NextResponse.json({ error: "Day is not active or required" }, { status: 403 });
          }
        }
        progress.passedAssignments.push(data.dayId);
        meaningfulLearningActivity = true;
      }
    } else if (data.action === "sync") {
      if (roadmapSlug === "gen-ai-internship") {
        const sanitizedCompleted = sanitizeStringArray(data.completedLevels);
        const beforeCompletedCount = progress.completedLevels.length;

        progress.completedLevels = normalizeCanonicalCompletedLevels(progress.completedLevels, sanitizedCompleted, activeLevelIds);
        progress.completedDays = deriveGenAiCompletedDays(template, access.personalization, progress.completedLevels);

        const beforeAssignmentCount = progress.passedAssignments.length;
        const sanitizedAssignments = sanitizeStringArray(data.passedAssignments);
        const newPassedAssignments = new Set(progress.passedAssignments);
        for (const dayId of sanitizedAssignments) {
          if (access.personalization.includedDayIds.includes(dayId)) {
            newPassedAssignments.add(dayId);
          }
        }
        progress.passedAssignments = Array.from(newPassedAssignments);

        const newStatus = calculateRequiredRoadmapStatus(progress.completedLevels, activeLevelIds);
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
      } else {
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
    }

    if (meaningfulLearningActivity) {
      progress.lastLearningActiveAt = now;
      userActivityUpdates.last_learning_active_on = now;
    }

    if (!progressPersistedAtomically) {
      try {
        await progress.save();
      } catch (saveErr) {
        // Ponytail: Race condition where another request created the progress doc first.
        // Fallback to update so we don't drop the 'start_lesson' state changes or throw a 500.
        if (saveErr.code === 11000) {
          const fallbackUpdates = {
            status: progress.status,
            lastActiveLevelId: progress.lastActiveLevelId,
          };
          if (progress.startedAt) fallbackUpdates.startedAt = progress.startedAt;
          if (meaningfulLearningActivity) fallbackUpdates.lastLearningActiveAt = progress.lastLearningActiveAt;
          
          progress = await RoadmapProgress.findOneAndUpdate(
            { firebaseUID: decodedToken.uid, roadmapSlug },
            { $set: fallbackUpdates },
            { new: true }
          );
        } else {
          throw saveErr;
        }
      }
    }

    await UserProfile.updateOne({ _id: user._id }, { $set: userActivityUpdates }, { timestamps: false });

    let streakSummary = null;

    if (
      data.action === "complete_level" &&
      data.levelId
    ) {
      streakSummary =
        await updateStreakOnLevelCompletion({
          userProfile: user,
          roadmapSlug,
          levelId: data.levelId,
        });
    } else if (data.action === "complete_level") {
      await evaluateAndApplyLazyStreakState(
        user,
        now,
      );

      const tz =
        user.streak?.timezone || "Asia/Kolkata";

      const todayLocal =
        getLocalDateString(now, tz);

      streakSummary = getStreakSummary(
        user.streak || {},
        todayLocal,
        now,
      );
    } else {
      const tz = user.streak?.timezone || "Asia/Kolkata";
      const todayLocal = getLocalDateString(now, tz);
      streakSummary = getStreakSummary(user.streak || {}, todayLocal);
    }

    return NextResponse.json({ ok: true, progress, streak: streakSummary, newCompletion: isNewLevelCompletion }, { status: 200 });
  } catch (err) {
    console.error("[PATCH Progress] Error", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
