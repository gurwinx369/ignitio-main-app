import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { classifyV4Diagnostic } from "./diagnostic-evaluation";

/**
 * Checks the calibration status of a user based on their canonical V4 diagnostic document.
 * 
 * @param {string} firebaseUID
 * @returns {Promise<{status: string, calibrationRequired: boolean, reason: string|null}>}
 */
export async function checkCalibrationStatus(firebaseUID) {
  const document = await OnboardingResponseModel.findOne({
    firebaseUID,
    onboardingVersion: "v4",
  }).lean();

  const classification = classifyV4Diagnostic(document);

  if (classification.reusable) {
    return {
      status: "ready",
      calibrationRequired: false,
      reason: null,
    };
  }

  return {
    status: "required",
    calibrationRequired: true,
    reason: classification.reason,
  };
}
