import connectToDB from "../../dbConfig/dbConnection.js";
import { UserProfile } from "../../models/v2/user.profile.model.js";
import { OnboardingResponseModel } from "../../models/v2/onboarding.model.js";
import { RoadmapTemplate } from "../../models/v2/roadmap.templates.model.js";
import { RoadmapPersonalization } from "../../models/v2/roadmap.personalized.model.js";
import { RoadmapProgress } from "../../models/v2/roadmap.progress.model.js";
import { buildRouting, compileRoadmap } from "./roadmapCompiler.js";
import { getLocalDateString } from "../users/streak.service.js";
import { validateSchedulePreference } from "./activation.validation.js";

/** Convert "HH:MM" → minutes since midnight */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Map diagnostic responses array to the exact object format expected by buildRouting
 * Ensures all required keys are present.
 */
export function reconstructDiagnostics(responses, entryPoint) {
  const diagnostics = {};

  // Q1 logic
  diagnostics.q1 = {
    value: entryPoint,
    passed: true,
    partial: false,
    skipped: false,
  };

  const mapByQId = new Map();
  for (const r of responses) {
    if (r.questionId) {
      mapByQId.set(String(r.questionId).trim().toLowerCase(), r);
    }
  }

  // The V4 graded question IDs required by the compiler
  const targetIds = ["q2", "q2b", "q3", "q3b", "q4", "q5", "q6", "q7", "q7b", "q8"];

  for (const qId of targetIds) {
    const res = mapByQId.get(qId);
    if (!res) {
      throw new Error(`Missing required diagnostic result for: ${qId}`);
    } else {
      diagnostics[qId] = {
        passed: res.passed ?? false,
        partial: res.gradingMeta?.partial ?? false,
        skipped: res.skipped ?? false,
        notAssessed: res.notAssessed ?? false,
        value: res.answerGiven,
      };
    }
  }

  return diagnostics;
}

export function mapGoalToMotivation(goal) {
  const map = {
    internship_1_3_months: "land_internship",
    build_product: "build_product",
    curiosity_general: "curiosity",
  };
  return map[goal]; // No fallback, must be one of these
}

/**
 * Maps the Phase 4 SchedulePreference to the Personalization TimeWindowSchema
 * Preserves the exact target schema pattern from legacy runOnboarding.
 */
export function mapScheduleWindows(windows) {
  return windows.map(w => ({
    // Legacy mapping explicitly assumes all free windows apply to all 7 days
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startMinute: timeToMinutes(w.startTime),
    endMinute: timeToMinutes(w.endTime),
  }));
}

export function serializeDiagnosticRawAnswer(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    Array.isArray(value) ||
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return String(value);
}

// ─── Shared pre-activation validation ───────────────────────────────────────
//
// Called by both Foundation and Premium paths before any branching.
// Returns { ok: false, status, error } on validation failure.
// Returns { ok: true } on success.

function validateSharedPrerequisites(user) {
  if (!user.role) {
    return { ok: false, status: 422, error: "User role is required" };
  }

  const schedulePref = user.schedulePreference;
  const scheduleValidation = validateSchedulePreference(schedulePref);
  if (!scheduleValidation.valid) {
    return { ok: false, status: 422, error: scheduleValidation.error };
  }

  return { ok: true };
}

// ─── Streak initialisation helper ────────────────────────────────────────────
//
// Builds the streak-related $set fields that both paths need.
// Only sets fields that are currently missing — never overwrites existing data.

function buildStreakSet(user, timezone) {
  const set = {};
  if (!user.streak || !user.streak.timezone) {
    set["streak.timezone"] = timezone;
  }
  if (!user.streak || !user.streak.onboardingStartDate) {
    set["streak.onboardingStartDate"] = getLocalDateString(new Date(), timezone);
  }
  return set;
}

// ─── Foundation health invariant check ──────────────────────────────────────
//
// A Foundation user is healthy when:
//   onboardingComplete === true
//   onboardingState.step === "completed"
//   entitlements.roadmaps.genAi !== true   (already confirmed by caller)
//   role is truthy
//   schedulePreference is valid
//   streak.timezone exists
//   streak.onboardingStartDate exists
//
// Absence of roadmapPersonalizationRef, GenAI personalization, GenAI progress,
// or roadmap_name is NOT a defect for a Foundation user.

function isFoundationHealthy(user) {
  return (
    user.onboardingComplete === true &&
    user.onboardingState?.step === "completed" &&
    Boolean(user.role) &&
    Boolean(user.streak?.timezone) &&
    Boolean(user.streak?.onboardingStartDate)
  );
}

// ─── Premium health invariant check ─────────────────────────────────────────
//
// A Premium completed user requires all of:
//   onboardingComplete === true
//   onboardingState.step === "completed"
//   entitlements.roadmaps.genAi === true   (already confirmed by caller)
//   active GenAI personalization exists
//   GenAI progress exists
//   roadmapPersonalizationRef exists
//   profile reference matches the active personalization
//   streak.timezone exists
//   streak.onboardingStartDate exists

function isPremiumHealthy(user, activePersonalization, activeProgress) {
  if (!user.onboardingComplete || user.onboardingState?.step !== "completed") return false;
  if (!activePersonalization || !activeProgress) return false;
  if (!user.roadmapPersonalizationRef) return false;
  const refMatch =
    user.roadmapPersonalizationRef?.toString() === activePersonalization?._id?.toString();
  if (!refMatch) return false;
  if (!user.streak?.timezone || !user.streak?.onboardingStartDate) return false;
  return true;
}

// ─── Foundation activation path ──────────────────────────────────────────────
//
// Completes onboarding for a Foundation user (entitlements.roadmaps.genAi !== true).
//
// Does NOT:
//   - load RoadmapTemplate
//   - call reconstructDiagnostics (for compilation)
//   - call buildRouting()
//   - call compileRoadmap()
//   - create RoadmapPersonalization
//   - create RoadmapProgress
//   - set roadmapPersonalizationRef
//   - set roadmap_name to a GenAI value
//   - grant or revoke Premium entitlement
//
// Preserves the stored V4 diagnostic for future Premium upgrade.

async function activateFoundation(user) {
  const schedulePref = user.schedulePreference;

  // Validate role and schedule (same requirements as Premium)
  const prereq = validateSharedPrerequisites(user);
  if (!prereq.ok) {
    return { status: prereq.status, success: false, error: prereq.error };
  }

  const now = new Date();
  const updatePayload = {
    $set: {
      onboardingComplete: true,
      "onboardingState.step": "completed",
      completedAt: now,
      ...buildStreakSet(user, schedulePref.timezone),
    },
  };

  // State-guarded write: only completes a user whose state is activation_pending.
  // This prevents backward moves and concurrent-completion races.
  const updateResult = await UserProfile.updateOne(
    {
      _id: user._id,
      "onboardingState.step": "activation_pending",
      "entitlements.roadmaps.genAi": {
        $ne: true,
      },
    },
    updatePayload,
    { timestamps: false }
  );

  if (
    updateResult.modifiedCount === 0 &&
    updateResult.matchedCount === 0
  ) {
    const latestUser = await UserProfile.findOne({
      firebaseUID: user.firebaseUID,
    });

    if (
      latestUser &&
      latestUser.entitlements?.roadmaps?.genAi !== true
    ) {
      const latestPrereq =
        validateSharedPrerequisites(latestUser);

      if (
        latestPrereq.ok &&
        isFoundationHealthy(latestUser)
      ) {
        return {
          status: 200,
          success: true,
          nextStep: "completed",
          alreadyActivated: true,
        };
      }
    }

    return {
      status: 409,
      success: false,
      error:
        "User entitlement or onboarding state changed during Foundation activation",
    };
  }

  return { status: 200, success: true, nextStep: "completed", alreadyActivated: false };
}

// ─── Foundation completed-user reconciliation ─────────────────────────────────
//
// Called when a Foundation user is already at step="completed".
// Repairs only safe missing metadata (streak fields).
// Never creates GenAI artifacts. Never grants Premium.

async function reconcileCompletedFoundation(user) {
  const prereq = validateSharedPrerequisites(user);

  if (!prereq.ok) {
    return {
      status: prereq.status,
      success: false,
      error: prereq.error,
    };
  }

  if (isFoundationHealthy(user)) {
    return {
      status: 200,
      success: true,
      nextStep: "completed",
      alreadyActivated: true,
    };
  }

  const updateResult = await UserProfile.updateOne(
    {
      _id: user._id,
      "onboardingState.step": "completed",
      "entitlements.roadmaps.genAi": { $ne: true },
    },
    {
      $set: {
        onboardingComplete: true,
        "onboardingState.step": "completed",
        ...buildStreakSet(
          user,
          user.schedulePreference.timezone,
        ),
      },
    },
    { timestamps: false },
  );

  const latestUser = await UserProfile.findOne({
    firebaseUID: user.firebaseUID,
  });

  if (
    latestUser &&
    latestUser.entitlements?.roadmaps?.genAi !== true
  ) {
    const latestPrereq =
      validateSharedPrerequisites(latestUser);

    if (
      latestPrereq.ok &&
      isFoundationHealthy(latestUser)
    ) {
      return {
        status: 200,
        success: true,
        nextStep: "completed",
        alreadyActivated:
          updateResult.matchedCount === 0,
      };
    }
  }

  return {
    status: 409,
    success: false,
    error:
      "User entitlement or onboarding state changed during Foundation reconciliation",
  };
}

// ─── Premium activation path ─────────────────────────────────────────────────
//
// Preserves every existing behavior:
//   - template load
//   - diagnostic reconstruction
//   - buildRouting + compileRoadmap
//   - RoadmapPersonalization create-or-reuse
//   - RoadmapProgress create-or-reuse
//   - duplicate-key recovery (code 11000)
//   - rollback of only artifacts created in this call
//   - state-guarded completion write
//   - idempotency

async function activatePremium(user, onboardingResponse, roadmapSlug) {
  // Validate role and schedule
  const prereq = validateSharedPrerequisites(user);
  if (!prereq.ok) {
    return { status: prereq.status, success: false, error: prereq.error };
  }

  const schedulePref = user.schedulePreference;

  const goal = onboardingResponse.primaryGoalSnapshot;
  if (!goal) {
    return { status: 422, success: false, error: "Primary goal is required" };
  }

  // Pacing behavior audit confirmed (Outcome A): Q9 (pacing) does NOT affect the compiler,
  // schedule duration mapping, or any downstream activation artifact.
  // It is intentionally unmapped here to preserve compiler purity.

  const motivation = mapGoalToMotivation(goal);
  if (!motivation) {
    return { status: 422, success: false, error: "Invalid goal mapping" };
  }

  const template = await RoadmapTemplate.findBySlug(roadmapSlug);
  if (!template) {
    return { status: 500, success: false, error: `Roadmap template '${roadmapSlug}' not found` };
  }

  let diagnostics;
  try {
    diagnostics = reconstructDiagnostics(onboardingResponse.responses, onboardingResponse.entryPoint);
  } catch (err) {
    return { status: 422, success: false, error: err.message };
  }

  const routing = buildRouting(diagnostics);
  const compiled = compileRoadmap(template, routing);

  const { includedDayIds, optionalDayIds, skippedDayIds, totalLevels } = compiled;

  const now = new Date();
  const diagnosticsArray = Object.entries(diagnostics).map(([qId, d]) => ({
    questionId: qId.toUpperCase(),
    passed: d.passed,
    rawAnswer: serializeDiagnosticRawAnswer(d.value),
    routedAction:
      qId === "q1" || d.notAssessed || d.skipped
        ? "keep"
        : d.passed
          ? "skip_week"
          : d.partial
            ? "optional"
            : "keep",
    answeredAt: now,
  }));

  const mappedWindows = mapScheduleWindows(schedulePref.windows);

  let createdPersonalizationId = null;
  let createdProgressId = null;
  let finalPersonalizationId = null;
  let finalProgressId = null;

  try {
    // Unique-index-aware upsert handling
    // 1. Personalization
    let existingPersonalizations = await RoadmapPersonalization.find({ firebaseUID: user.firebaseUID, roadmapSlug, isActive: true });
    if (existingPersonalizations.length > 1) {
      const err = new Error("Multiple active personalizations found. Conflict.");
      err.status = 422;
      throw err;
    }
    let personalizationDoc = existingPersonalizations[0];
    if (!personalizationDoc) {
      try {
        personalizationDoc = await RoadmapPersonalization.create({
          userId: user._id,
          firebaseUID: user.firebaseUID,
          roadmapSlug,
          includedDayIds,
          optionalDayIds,
          skippedDayIds,
          totalLevels,
          schedule: {
            timezone: schedulePref.timezone,
            freeWindows: mappedWindows,
            isDefault: false,
          },
          motivation,
          diagnostics: diagnosticsArray,
          templateSnapshotAt: template.updatedAt || new Date(),
          isActive: true,
          version: 1,
        });
        createdPersonalizationId = personalizationDoc._id;
      } catch (err) {
        if (err.code === 11000) {
          personalizationDoc = await RoadmapPersonalization.findOne({ firebaseUID: user.firebaseUID, roadmapSlug, isActive: true });
        } else {
          throw err;
        }
      }
    }
    finalPersonalizationId = personalizationDoc._id;

    // 2. Progress
    let existingProgressDocs = await RoadmapProgress.find({ firebaseUID: user.firebaseUID, roadmapSlug });
    if (existingProgressDocs.length > 1) {
      const err = new Error("Multiple roadmap progress documents found. Conflict.");
      err.status = 422;
      throw err;
    }
    let progressDoc = existingProgressDocs[0];
    if (!progressDoc) {
      try {
        progressDoc = await RoadmapProgress.create({
          userId: user._id,
          firebaseUID: user.firebaseUID,
          roadmapSlug,
          roadmapTitle: template.title,
          role: user.role,
          status: "not_started",
          completedLevels: [],
          totalLevels,
          completedDays: [],
          passedAssignments: [],
          startedAt: null,
          completedAt: null,
          lastLearningActiveAt: null,
        });
        createdProgressId = progressDoc._id;
      } catch (err) {
        if (err.code === 11000) {
          progressDoc = await RoadmapProgress.findOne({ firebaseUID: user.firebaseUID, roadmapSlug });
        } else {
          throw err;
        }
      }
    }
    finalProgressId = progressDoc._id;

    if (!finalPersonalizationId || !finalProgressId) {
      throw new Error("Failed to secure active personalization and progress documents.");
    }

    // State-Guarded Update
    const updatePayload = {
      $set: {
        roadmapPersonalizationRef: finalPersonalizationId,
        roadmap_name: template.title,
        onboardingComplete: true,
        "onboardingState.step": "completed",
        completedAt: new Date(),
        ...buildStreakSet(user, schedulePref.timezone),
      },
    };

    const updateResult = await UserProfile.updateOne(
      {
        _id: user._id,
        "onboardingState.step": {
          $in: ["activation_pending", "completed"],
        },
        "entitlements.roadmaps.genAi": true,
      },
      updatePayload,
      { timestamps: false },
    );

    if (
      updateResult.modifiedCount === 0 &&
      updateResult.matchedCount === 0
    ) {
      const error = new Error(
        "User entitlement or onboarding state changed during Premium activation",
      );

      error.status = 409;
      throw error;
    }

    return { status: 200, success: true, nextStep: "completed", alreadyActivated: false };

  } catch (err) {
    console.error("[activatePremium] Activation failed. Rolling back created artifacts...", err.message);
    if (createdPersonalizationId) {
      await RoadmapPersonalization.deleteOne({ _id: createdPersonalizationId }).catch(e =>
        console.error("Rollback failed for Personalization:", e.message)
      );
    }
    if (createdProgressId) {
      await RoadmapProgress.deleteOne({ _id: createdProgressId }).catch(e =>
        console.error("Rollback failed for Progress:", e.message)
      );
    }
    const isSafeClientError =
      err.status === 409 ||
      err.status === 422;

    return {
      status: err.status || 500,
      success: false,
      error: isSafeClientError
        ? err.message
        : "Activation failed safely",
    };
  }
}

// ─── Premium completed-user reconciliation ────────────────────────────────────
//
// Called when a Premium user is already at step="completed".
// Preserves the existing conflict detection and reconciliation behavior.

async function reconcileCompletedPremium(
  user,
  roadmapSlug,
) {
  const prereq =
    validateSharedPrerequisites(user);

  if (!prereq.ok) {
    return {
      status: prereq.status,
      success: false,
      error: prereq.error,
    };
  }

  const personalizations =
    await RoadmapPersonalization.find({ firebaseUID: user.firebaseUID, roadmapSlug, isActive: true });
  const progressDocs = await RoadmapProgress.find({ firebaseUID: user.firebaseUID, roadmapSlug });

  // Conflict detection (existing behavior preserved)
  if (personalizations.length > 1) {
    return { status: 422, success: false, error: "Multiple active personalizations found. Conflict." };
  }
  if (progressDocs.length > 1) {
    return { status: 422, success: false, error: "Multiple roadmap progress documents found. Conflict." };
  }

  const activePersonalization = personalizations[0];
  const activeProgress = progressDocs[0];

  const refMatch =
    user.roadmapPersonalizationRef?.toString() === activePersonalization?._id?.toString();
  if (activePersonalization && user.roadmapPersonalizationRef && !refMatch) {
    return {
      status: 422,
      success: false,
      error: "Profile personalization ref conflicts with active personalization",
    };
  }

  if (isPremiumHealthy(user, activePersonalization, activeProgress)) {
    return { status: 200, success: true, nextStep: "completed", alreadyActivated: true };
  }

  // Not fully healthy — fall through to Premium activation to reconcile.
  // This restores missing profile fields and any missing roadmapPersonalizationRef.
  return null; // Signal: caller should fall through to activatePremium
}

// ─── activateRoadmap — public entry point ────────────────────────────────────
//
// Called by POST /api/v2/onboarding/activate with only firebaseUID.
// The tier decision is derived exclusively from the persisted server-owned profile:
//
//   const isPremium = user.entitlements?.roadmaps?.genAi === true;
//
// The client cannot choose tier. The route passes no tier, mode, or roadmapSlug.

export async function activateRoadmap(firebaseUID) {
  await connectToDB();

  const user = await UserProfile.findOne({ firebaseUID });
  if (!user) {
    return { status: 404, success: false, error: "User profile not found" };
  }

  // ── Tier resolution — server-owned, payment-owned ────────────────────────
  // entitlements.roadmaps.genAi is only set by verifyPayment() or the
  // Razorpay webhook. The client has no write path to this field.
  const isPremium = user.entitlements?.roadmaps?.genAi === true;

  const roadmapSlug = "gen-ai-internship"; // Canonical Premium GenAI slug

  // ── Completed-user handling ──────────────────────────────────────────────
  if (user.onboardingState?.step === "completed") {
    if (!isPremium) {
      // Foundation completed user — check Foundation invariants
      return reconcileCompletedFoundation(user);
    }

    // Premium completed user — check Premium invariants
    const premiumReconcileResult = await reconcileCompletedPremium(user, roadmapSlug);
    if (premiumReconcileResult !== null) {
      // Either healthy (alreadyActivated: true) or a hard conflict (422)
      return premiumReconcileResult;
    }
    // null → fall through to activatePremium for reconciliation of missing artifacts

  } else if (user.onboardingState?.step !== "activation_pending") {
    return { status: 409, success: false, error: "Invalid onboarding state" };
  }

  // ── Diagnostic record is required by both paths ──────────────────────────
  // Foundation preserves it for a future Premium upgrade.
  // Premium requires it for compilation.
  const onboardingResponse = await OnboardingResponseModel.findOne({
    firebaseUID,
    onboardingVersion: "v4",
  });
  if (!onboardingResponse) {
    return { status: 404, success: false, error: "V4 diagnostic response not found" };
  }

  // ── Branch by tier ───────────────────────────────────────────────────────
  if (!isPremium) {
    return activateFoundation(user);
  }

  return activatePremium(user, onboardingResponse, roadmapSlug);
}
