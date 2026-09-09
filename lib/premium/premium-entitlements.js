// lib/premium/premium-entitlements.js
//
// Canonical entitlement bundle granted by an active Ignitio Premium
// subscription.
//
// This module describes PRODUCT ACCESS only.
// It does not know about Razorpay plans, billing cadence, users,
// databases, authentication, or HTTP.
//
// Weekly, Monthly, and 3-Month subscriptions will later consume this
// same bundle so their access cannot drift apart.

export const PREMIUM_ENTITLEMENTS =
    Object.freeze({
        "entitlements.roadmaps.genAi": true,
        "entitlements.features.behaviouralQuiz":
            true,
    });

export const REVOKED_PREMIUM_ENTITLEMENTS =
    Object.freeze(
        Object.fromEntries(
            Object.keys(PREMIUM_ENTITLEMENTS).map(
                (entitlementPath) => [
                    entitlementPath,
                    false,
                ],
            ),
        ),
    );