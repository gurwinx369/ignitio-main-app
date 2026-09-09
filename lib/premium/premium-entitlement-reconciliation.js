// lib/premium/premium-entitlement-reconciliation.js
//
// Pure configuration for reconciling Premium feature entitlements on
// existing users.
//
// This module performs no database writes itself. It only defines the
// narrow filter and update used by the controlled backfill.
//
// Eligibility is derived from the existing canonical GenAI Premium
// entitlement. Users without GenAI Premium access are never targeted.

const MISSING_BEHAVIOURAL_QUIZ_FILTER =
    Object.freeze({
        $ne: true,
    });

export const PREMIUM_FEATURE_BACKFILL_FILTER =
    Object.freeze({
        "entitlements.roadmaps.genAi": true,

        "entitlements.features.behaviouralQuiz":
            MISSING_BEHAVIOURAL_QUIZ_FILTER,
    });

const BEHAVIOURAL_QUIZ_FEATURE_GRANT =
    Object.freeze({
        "entitlements.features.behaviouralQuiz":
            true,
    });

export const PREMIUM_FEATURE_BACKFILL_UPDATE =
    Object.freeze({
        $set: BEHAVIOURAL_QUIZ_FEATURE_GRANT,
    });