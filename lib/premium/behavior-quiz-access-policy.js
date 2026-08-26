import {
    getPremiumRoadmapConfig,
} from "./premium-roadmap-registry.js";

/**
 * Resolve the Premium roadmap policy for Behaviour Quiz.
 *
 * A roadmap is eligible only when:
 * - it exists in the Premium roadmap registry
 * - it explicitly enables the behaviouralQuiz capability
 *
 * Unknown or unsupported roadmaps fail closed.
 *
 * @param {unknown} roadmapSlug
 * @returns {object|null}
 */
export function getBehaviorQuizRoadmapPolicy(
    roadmapSlug,
) {
    const roadmapConfig =
        getPremiumRoadmapConfig(roadmapSlug);

    if (!roadmapConfig) {
        return null;
    }

    if (
        roadmapConfig.capabilities
            ?.behaviouralQuiz !== true
    ) {
        return null;
    }

    return roadmapConfig;
}

/**
 * Check whether a user profile is entitled to use Behaviour Quiz
 * for a specific Premium roadmap.
 *
 * Both conditions are required:
 * - entitlement for the requested roadmap
 * - Behaviour Quiz feature entitlement
 *
 * This function performs no database access and no writes.
 *
 * @param {object|null|undefined} userProfile
 * @param {unknown} roadmapSlug
 * @returns {boolean}
 */
export function hasBehaviorQuizEntitlement(
    userProfile,
    roadmapSlug,
) {
    const roadmapConfig =
        getBehaviorQuizRoadmapPolicy(
            roadmapSlug,
        );

    if (!roadmapConfig) {
        return false;
    }

    const roadmapEntitled =
        userProfile?.entitlements?.roadmaps?.[
        roadmapConfig.entitlementKey
        ] === true;

    const featureEntitled =
        userProfile?.entitlements?.features
            ?.behaviouralQuiz === true;

    return (
        roadmapEntitled &&
        featureEntitled
    );
}