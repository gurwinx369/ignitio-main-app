import {
    getPremiumRoadmapConfig,
    PREMIUM_ROADMAP_REGISTRY,
} from "./premium-roadmap-registry.js";

/**
 * Resolve a registered Premium roadmap.
 *
 * Unknown or invalid roadmap slugs fail closed.
 *
 * @param {unknown} roadmapSlug
 * @returns {object|null}
 */
export function getPremiumRoadmapAccessPolicy(
    roadmapSlug,
) {
    return getPremiumRoadmapConfig(
        roadmapSlug,
    );
}

/**
 * Check whether a user profile owns the entitlement
 * required by a registered Premium roadmap.
 *
 * The entitlement key is resolved from the roadmap registry.
 * No roadmap-specific entitlement is hardcoded here.
 *
 * @param {object|null|undefined} userProfile
 * @param {unknown} roadmapSlug
 * @returns {boolean}
 */
export function hasPremiumRoadmapEntitlement(
    userProfile,
    roadmapSlug,
) {
    const roadmapConfig =
        getPremiumRoadmapAccessPolicy(
            roadmapSlug,
        );

    if (!roadmapConfig) {
        return false;
    }

    return (
        userProfile?.entitlements?.roadmaps?.[
        roadmapConfig.entitlementKey
        ] === true
    );
}

/**
 * Check whether a user owns at least one entitlement
 * belonging to a registered Premium roadmap.
 *
 * Unknown entitlement keys do not count as Premium.
 *
 * @param {object|null|undefined} userProfile
 * @returns {boolean}
 */
export function hasAnyPremiumRoadmapEntitlement(
    userProfile,
) {
    if (!userProfile) {
        return false;
    }

    return Object.values(
        PREMIUM_ROADMAP_REGISTRY,
    ).some(
        (roadmapConfig) =>
            userProfile?.entitlements?.roadmaps?.[
            roadmapConfig.entitlementKey
            ] === true,
    );
}