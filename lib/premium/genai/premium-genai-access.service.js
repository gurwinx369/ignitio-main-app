import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { RoadmapPersonalization } from "@/models/v2/roadmap.personalized.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { classifyV4Diagnostic } from "@/lib/onboarding/diagnostic-evaluation";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-route";
import {
  checkPremiumRoadmapAccess,
} from "@/lib/premium/premium-roadmap-access.service";

const GENAI_SLUG = "gen-ai-internship";

export function getPremiumGenAiAccessHttpStatus(accessStatus) {
  switch (accessStatus) {
    case "ready":
      return 200;

    case "profile_missing":
      return 404;

    case "not_entitled":
      return 403;

    case "incomplete_onboarding":
    case "calibration_required":
    case "upgrade_required":
    case "artifact_conflict":
      return 409;

    default:
      return 403;
  }
}

/**
 * Validates that a user is fully entitled, configured, and ready
 * for Premium GenAI runtime and behavioral features.
 *
 * This function performs zero writes. It should be used to protect
 * read and write access to Premium GenAI features.
 *
 * @param {string} firebaseUID
 * @returns {Promise<{ status: string, userProfile?: object, personalization?: object, progress?: object }>}
 *
 * Statuses:
 * - "profile_missing"
 * - "not_entitled"
 * - "incomplete_onboarding"
 * - "calibration_required"
 * - "upgrade_required"
 * - "artifact_conflict"
 * - "ready"
 */
export async function checkPremiumGenAiAccess(firebaseUID) {
  // 1. Generic Premium roadmap authorization
  const genericAccess =
    await checkPremiumRoadmapAccess({
      firebaseUID,
      roadmapSlug: GENAI_SLUG,
    });

  if (
    genericAccess.status ===
    "profile_missing"
  ) {
    return {
      status: "profile_missing",
    };
  }

  // GENAI_SLUG is a server-owned registered roadmap.
  // If that registry invariant is ever broken,
  // fail closed without changing this service's
  // existing public status contract.
  if (
    genericAccess.status ===
    "unsupported_roadmap"
  ) {
    return {
      status: "not_entitled",
    };
  }

  const userProfile =
    genericAccess.userProfile;

  if (!userProfile) {
    return {
      status: "profile_missing",
    };
  }

  // 2. Preserve existing GenAI onboarding precedence.
  // V4 requires onboardingComplete=true + step="completed".
  // Legacy V2/V3 only require onboardingComplete=true.
  if (!isOnboardingComplete(userProfile)) {
    return {
      status: "incomplete_onboarding",
    };
  }

  // 3. Generic roadmap authorization already resolved
  // the registry-derived GenAI entitlement.
  if (
    genericAccess.status ===
    "not_entitled"
  ) {
    return {
      status: "not_entitled",
    };
  }

  // Fail closed for any unexpected generic access state.
  if (genericAccess.status !== "ready") {
    return {
      status: "not_entitled",
    };
  }

  // 4. Check V4 Calibration
  const onboardingResponse =
    await OnboardingResponseModel.findOne({
      firebaseUID,
      onboardingVersion: "v4",
    }).lean();

  if (!onboardingResponse) {
    return { status: "calibration_required" };
  }

  const classification =
    classifyV4Diagnostic(onboardingResponse);

  if (classification.reusable !== true) {
    return { status: "calibration_required" };
  }

  // 5. Check Active Roadmap Personalization
  const personalizations =
    await RoadmapPersonalization.find({
      firebaseUID,
      roadmapSlug: GENAI_SLUG,
      isActive: true,
    }).lean();

  if (personalizations.length === 0) {
    return { status: "upgrade_required" };
  }

  if (personalizations.length > 1) {
    return { status: "artifact_conflict" };
  }

  const personalization = personalizations[0];

  if (
    personalization.userId.toString() !==
    userProfile._id.toString()
  ) {
    return { status: "artifact_conflict" };
  }

  // 6. Check Roadmap Progress
  const progresses = await RoadmapProgress.find({
    firebaseUID,
    roadmapSlug: GENAI_SLUG,
  }).lean();

  if (progresses.length === 0) {
    return { status: "upgrade_required" };
  }

  if (progresses.length > 1) {
    return { status: "artifact_conflict" };
  }

  const progress = progresses[0];

  if (
    progress.userId.toString() !==
    userProfile._id.toString()
  ) {
    return { status: "artifact_conflict" };
  }

  // 7. Check Profile Reference
  if (
    !userProfile.roadmapPersonalizationRef ||
    userProfile.roadmapPersonalizationRef.toString() !==
    personalization._id.toString()
  ) {
    return { status: "upgrade_required" };
  }

  return {
    status: "ready",
    userProfile,
    personalization,
    progress,
  };
}