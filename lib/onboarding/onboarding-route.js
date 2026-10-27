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
const STEP_ROUTES = {
  activation_pending: "/onboarding/activation",
  role_selection: "/onboarding/role-selection",
};

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
  // Completed onboarding step marks completion for both V5 and V4 GenAI profiles
  if (COMPLETE_STEPS.has(profile?.onboardingState?.step)) {
    return true;
  }
  // Legacy profiles without onboardingState subdocument
  if (!profile?.onboardingState?.step) {
    return true;
  }
  return false;
}

/**
 * Returns the canonical route for the user's persisted onboarding state.
 *
 * @param {object|null|undefined} profile
 * @returns {string}
 */
export function getOnboardingRoute(profile) {
  if (!profile || isOnboardingComplete(profile)) {
    return "/home";
  }

  const step = profile.onboardingState?.step;

  if (step === "completed") {
    return "/home";
  }

  // Auto-heal fallback: if somehow a user hits the router with this state, push to role-selection
  if (step === "role_selection" || step === "activation_pending") {
    return "/onboarding/role-selection";
  }

  return STEP_ROUTES[step] || "/onboarding";
}