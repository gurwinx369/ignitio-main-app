import connectToDB from "../../dbConfig/dbConnection.js";

import { UserProfile } from "../../models/v2/user.profile.model.js";

import { OnboardingResponseModel } from "../../models/v2/onboarding.model.js";

import {
  validateSharedPrerequisites,
  buildStreakSet,
} from "./activation.shared.js";

import {
  activatePremiumRoadmap,
  reconcileCompletedPremiumRoadmap,
} from "../premium/premium-roadmap-activation.service.js";


export {
  timeToMinutes,
  reconstructDiagnostics,
  mapGoalToMotivation,
  mapScheduleWindows,
  serializeDiagnosticRawAnswer,
} from "./activation.shared.js";

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

function isFoundationHealthy(
  user,
) {
  return (
    user.onboardingComplete ===
    true &&
    user.onboardingState?.step ===
    "completed" &&
    Boolean(user.role) &&
    Boolean(
      user.streak?.timezone,
    ) &&
    Boolean(
      user.streak
        ?.onboardingStartDate,
    )
  );
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

async function activateFoundation(
  user,
) {
  const schedulePref =
    user.schedulePreference;

  // Validate role and schedule (same requirements as Premium)
  const prereq =
    validateSharedPrerequisites(
      user,
    );

  if (!prereq.ok) {
    return {
      status: prereq.status,
      success: false,
      error: prereq.error,
    };
  }

  const now = new Date();

  const updatePayload = {
    $set: {
      onboardingComplete: true,
      "onboardingState.step":
        "completed",
      completedAt: now,
      ...buildStreakSet(
        user,
        schedulePref.timezone,
      ),
    },
  };

  // State-guarded write: only completes a user whose state is activation_pending.
  // This prevents backward moves and concurrent-completion races.
  const updateResult =
    await UserProfile.updateOne(
      {
        _id: user._id,
        "onboardingState.step":
          "activation_pending",
        "entitlements.roadmaps.genAi":
        {
          $ne: true,
        },
      },
      updatePayload,
      {
        timestamps: false,
      },
    );

  if (
    updateResult.modifiedCount ===
    0 &&
    updateResult.matchedCount ===
    0
  ) {
    const latestUser =
      await UserProfile.findOne({
        firebaseUID:
          user.firebaseUID,
      });

    if (
      latestUser &&
      latestUser.entitlements
        ?.roadmaps?.genAi !== true
    ) {
      const latestPrereq =
        validateSharedPrerequisites(
          latestUser,
        );

      if (
        latestPrereq.ok &&
        isFoundationHealthy(
          latestUser,
        )
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

  return {
    status: 200,
    success: true,
    nextStep: "completed",
    alreadyActivated: false,
  };
}

// ─── Foundation completed-user reconciliation ────────────────────────────────
//
// Called when a Foundation user is already at step="completed".
// Repairs only safe missing metadata (streak fields).
// Never creates GenAI artifacts. Never grants Premium.

async function reconcileCompletedFoundation(
  user,
) {
  const prereq =
    validateSharedPrerequisites(
      user,
    );

  if (!prereq.ok) {
    return {
      status: prereq.status,
      success: false,
      error: prereq.error,
    };
  }

  if (
    isFoundationHealthy(user)
  ) {
    return {
      status: 200,
      success: true,
      nextStep: "completed",
      alreadyActivated: true,
    };
  }

  const updateResult =
    await UserProfile.updateOne(
      {
        _id: user._id,
        "onboardingState.step":
          "completed",
        "entitlements.roadmaps.genAi":
        {
          $ne: true,
        },
      },
      {
        $set: {
          onboardingComplete:
            true,
          "onboardingState.step":
            "completed",
          ...buildStreakSet(
            user,
            user.schedulePreference
              .timezone,
          ),
        },
      },
      {
        timestamps: false,
      },
    );

  const latestUser =
    await UserProfile.findOne({
      firebaseUID:
        user.firebaseUID,
    });

  if (
    latestUser &&
    latestUser.entitlements
      ?.roadmaps?.genAi !== true
  ) {
    const latestPrereq =
      validateSharedPrerequisites(
        latestUser,
      );

    if (
      latestPrereq.ok &&
      isFoundationHealthy(
        latestUser,
      )
    ) {
      return {
        status: 200,
        success: true,
        nextStep: "completed",
        alreadyActivated:
          updateResult.matchedCount ===
          0,
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

// ─── activateRoadmap — public entry point ────────────────────────────────────
//
// Called by POST /api/v2/onboarding/activate with only firebaseUID.
//
// const hasGenAiEntitlement =
//   user.entitlements?.roadmaps?.genAi === true;
//
// The client cannot choose tier. The route passes no tier, mode, or roadmapSlug.

export async function activateRoadmap(
  firebaseUID,
) {
  await connectToDB();

  const user =
    await UserProfile.findOne({
      firebaseUID,
    });

  if (!user) {
    return {
      status: 404,
      success: false,
      error:
        "User profile not found",
    };
  }

  // Current compatibility behavior:
  // persisted GenAI entitlement determines whether the existing onboarding
  // path completes as Foundation or creates the GenAI roadmap artifacts.
  const hasGenAiEntitlement =
    user.entitlements?.roadmaps
      ?.genAi === true;

  const roadmapSlug =
    "gen-ai-internship";

  // Completed-user handling
  if (
    user.onboardingState?.step ===
    "completed"
  ) {
    if (
      !hasGenAiEntitlement
    ) {
      return reconcileCompletedFoundation(
        user,
      );
    }

    const premiumReconcileResult =
      await reconcileCompletedPremiumRoadmap(
        user,
        roadmapSlug,
      );

    if (
      premiumReconcileResult !==
      null
    ) {
      return premiumReconcileResult;
    }
  } else if (
    user.onboardingState?.step !==
    "activation_pending"
  ) {
    return {
      status: 409,
      success: false,
      error:
        "Invalid onboarding state",
    };
  }

  if (!hasGenAiEntitlement) {
    return activateFoundation(user);
  }

  // Diagnostic record is required for the Premium GenAI path.
  const onboardingResponse = await OnboardingResponseModel.findOne({
    firebaseUID,
    onboardingVersion: "v4",
  });

  if (!onboardingResponse) {
    return {
      status: 404,
      success: false,
      error: "V4 diagnostic response not found",
    };
  }

  return activatePremiumRoadmap(
    user,
    onboardingResponse,
    roadmapSlug,
  );
}