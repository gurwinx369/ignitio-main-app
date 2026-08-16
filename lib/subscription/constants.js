// lib/subscription/constants.js
//
// Centralized subscription plan configuration.
//
// Every service function accepts a `plan` argument and resolves the
// Razorpay plan ID from this registry. Route handlers decide which plan
// the user is purchasing; the service layer stays plan-agnostic.
//
// To add a new plan in the future:
//   1. Add a new key to PLANS.
//   2. Set its RAZORPAY_PLAN_ID_<SLUG> env var.
//   3. The service and route handlers require no other changes.

export const PLAN_SLUGS = {
  IGNITIO_PREMIUM: "ignitio_premium",
};

// Plan registry — all plans Ignitio offers.
// Each entry maps a plan slug to its runtime configuration.
// Reading env vars here keeps the rest of the codebase clean.
export const PLANS = {
  [PLAN_SLUGS.IGNITIO_PREMIUM]: {
    slug: PLAN_SLUGS.IGNITIO_PREMIUM,
    displayName: "Ignitio Premium",
    razorpayPlanId: process.env.RAZORPAY_PLAN_ID ?? "",

    // Razorpay requires a finite total_count.
    // 120 = 10 years of monthly billing — effectively unlimited for a
    // cancel-anytime subscription. Users cancel before this is reached.
    totalCount: 120,

    // Entitlements granted when this plan is active.
    // Used by the verification step to know which flags to set.
    entitlements: {
      "entitlements.roadmaps.genAi": true,
    },

    // Entitlements revoked when this plan expires.
    revokedEntitlements: {
      "entitlements.roadmaps.genAi": false,
    },
  },
};

/**
 * Look up a plan by slug. Throws if the slug is not registered.
 *
 * @param {string} slug
 * @returns {object} plan config
 */
export function getPlan(slug) {
  const plan = PLANS[slug];
  if (!plan) {
    throw new Error(`Unknown subscription plan: "${slug}"`);
  }
  return plan;
}

/**
 * Look up a plan by Razorpay plan ID.
 * Used in webhook handlers where only the Razorpay plan ID is known.
 *
 * @param {string} razorpayPlanId
 * @returns {object|null} plan config or null if not found
 */
export function getPlanByRazorpayId(razorpayPlanId) {
  return (
    Object.values(PLANS).find((p) => p.razorpayPlanId === razorpayPlanId) ??
    null
  );
}
