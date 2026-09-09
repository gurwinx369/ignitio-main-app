/**
 * lib/onboarding/onboarding-route.js
 *
 * Canonical onboarding completion and step-to-route resolver.
 *
 * Completion policy:
 * - V4 requires onboardingComplete=true and step="completed".
 * - Legacy V2/V3 profiles require onboardingComplete=true.
 * - A missing onboardingVersion is treated as legacy-compatible.
 */

/** @type {Record<string, string>} */
const STEP_ROUTES = {
  diagnostic: "/home/onboarding/diagnostic",
  results: "/home/onboarding/results",
  paywall: "/home/onboarding/paywall",
  role_selection: "/home/onboarding/role-selection",
  activation_pending: "/home/onboarding/activation",
};

/**
 * Returns true only when the persisted profile represents completed
 * onboarding according to its onboarding version.
 *
 * @param {object|null|undefined} profile
 * @returns {boolean}
 */
export function isOnboardingComplete(profile) {
  return (
    profile?.onboardingComplete === true &&
    (
      profile?.onboardingVersion !== "v4" ||
      profile?.onboardingState?.step === "completed"
    )
  );
}

/**
 * Returns the canonical route for the user's persisted onboarding state.
 *
 * @param {object|null|undefined} profile
 * @returns {string}
 */
export function getOnboardingRoute(profile) {
  if (!profile) {
    return "/home/onboarding";
  }

  if (isOnboardingComplete(profile)) {
    return "/home";
  }

  const step = profile.onboardingState?.step;

  // This is an inconsistent partial-completion state.
  // Never allow it to bypass onboarding and enter /home.
  if (step === "completed") {
    return "/home/onboarding/activation";
  }

  return (
    STEP_ROUTES[step] ||
    "/home/onboarding/diagnostic"
  );
}