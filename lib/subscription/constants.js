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

import {
  PREMIUM_ENTITLEMENTS,
  REVOKED_PREMIUM_ENTITLEMENTS,
} from "../premium/premium-entitlements.js";

export const PLAN_SLUGS = {
  WEEKLY: "ignitio_weekly",
  MONTHLY: "ignitio_monthly",
  THREE_MONTHLY: "ignitio_three_monthly",
};

// Plan registry for NEW purchases.
// Legacy "ignitio_premium" subscriptions remain supported by the
// Subscription model, but cannot be selected for a new checkout.
export const PLANS = {
  [PLAN_SLUGS.WEEKLY]: {
    slug: PLAN_SLUGS.WEEKLY,
    displayName: "Ignitio Premium Weekly",
    razorpayPlanId:
      process.env.RAZORPAY_PLAN_WEEKLY_ID ?? "",

    // ~10 years of weekly billing.
    totalCount: 520,

    entitlements: PREMIUM_ENTITLEMENTS,

    revokedEntitlements:
      REVOKED_PREMIUM_ENTITLEMENTS,
  },

  [PLAN_SLUGS.MONTHLY]: {
    slug: PLAN_SLUGS.MONTHLY,
    displayName: "Ignitio Premium Monthly",
    razorpayPlanId:
      process.env.RAZORPAY_PLAN_MONTHLY_ID ?? "",

    // 10 years of monthly billing.
    totalCount: 120,

    entitlements: PREMIUM_ENTITLEMENTS,

    revokedEntitlements:
      REVOKED_PREMIUM_ENTITLEMENTS,
  },

  [PLAN_SLUGS.THREE_MONTHLY]: {
    slug: PLAN_SLUGS.THREE_MONTHLY,
    displayName: "Ignitio Premium 3 Months",
    razorpayPlanId:
      process.env.RAZORPAY_PLAN_THREE_MONTHLY_ID ??
      "",

    // 10 years, billed once every 3 months.
    totalCount: 40,

    entitlements: PREMIUM_ENTITLEMENTS,

    revokedEntitlements:
      REVOKED_PREMIUM_ENTITLEMENTS,
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
