/**
 * lib/onboarding/onboarding-route.js
 *
 * Canonical onboarding completion and step-to-route resolver.
 *
 * Completion policy:
 * - V4: onboardingComplete=true and step is "role_selection" or "completed".
 * - Legacy V2/V3 profiles require onboardingComplete=true.
 * - A missing onboardingVersion is treated as legacy-compatible.
 *
 * The GenAI diagnostic/payment flow is a feature-level activation,
 * NOT part of core onboarding. Core onboarding ends at role selection.
 */

/** @type {Record<string, string>} */
const STEP_ROUTES = {};

// ponytail: steps that count as "done" for the core onboarding gate
const COMPLETE_STEPS = new Set(["completed"]);

/**
 * Returns true only when the persisted profile represents completed
 * onboarding according to its onboarding version.
 *
 * @param {object|null|undefined} profile
 * @returns {boolean}
 */
export function isOnboardingComplete(profile) {
  if (profile?.onboardingComplete !== true) return false;
  if (profile?.onboardingVersion !== "v4") return true;
  return COMPLETE_STEPS.has(profile?.onboardingState?.step);
}

/**
 * Returns the canonical route for the user's persisted onboarding state.
 *
 * @param {object|null|undefined} profile
 * @returns {string}
 */
export function getOnboardingRoute(profile) {
  if (!profile) {
    return "/home";
  }

  if (isOnboardingComplete(profile)) {
    return "/home";
  }

  const step = profile.onboardingState?.step;

  // Legacy: existing users who are mid role-selection step
  if (step === "role_selection") {
    return "/onboarding/role-selection";
  }

  return STEP_ROUTES[step] || "/onboarding/role-selection";
}