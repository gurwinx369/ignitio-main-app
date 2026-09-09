import {
    getPremiumRoadmapConfig,
} from "@/lib/premium/premium-roadmap-registry";

import {
    checkPremiumGenAiAccess,
    getPremiumGenAiAccessHttpStatus,
} from "@/lib/premium/genai/premium-genai-access.service";

/**
 * Resolve the readiness state for a registered Premium roadmap.
 *
 * This service owns strategy dispatch only. Individual roadmap readiness
 * services remain responsible for their own entitlement, onboarding,
 * personalization, progress, and other roadmap-specific invariants.
 */
export async function checkPremiumRoadmapReadiness({
    firebaseUID,
    roadmapSlug,
}) {
    const roadmapConfig =
        getPremiumRoadmapConfig(roadmapSlug);

    if (!roadmapConfig) {
        return {
            status: "unsupported_roadmap",
        };
    }

    if (
        roadmapConfig.readinessStrategy ===
        "genai"
    ) {
        return checkPremiumGenAiAccess(
            firebaseUID,
        );
    }

    return {
        status:
            "unsupported_readiness_strategy",
    };
}

/**
 * Resolve the HTTP status for a Premium roadmap readiness result.
 *
 * Registered roadmap strategies own their roadmap-specific status mapping.
 * Unknown roadmaps return 404, while a registered roadmap with an unknown
 * readiness strategy is treated as a server configuration error.
 */
export function getPremiumRoadmapReadinessHttpStatus({
    roadmapSlug,
    accessStatus,
}) {
    const roadmapConfig =
        getPremiumRoadmapConfig(roadmapSlug);

    if (!roadmapConfig) {
        return 404;
    }

    if (
        roadmapConfig.readinessStrategy ===
        "genai"
    ) {
        return getPremiumGenAiAccessHttpStatus(
            accessStatus,
        );
    }

    return 500;
}