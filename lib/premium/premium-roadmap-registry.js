// lib/premium/premium-roadmap-registry.js
//
// Central registry for Premium roadmap products.
//
// This module is intentionally pure:
// - no database access
// - no authentication
// - no billing logic
// - no runtime mutations
//
// Shared infrastructure can use this registry to determine whether a
// roadmap is Premium, which entitlement protects it, and which optional
// Premium capabilities it supports.

const GENAI_ROADMAP = Object.freeze({
    slug: "gen-ai-internship",

    entitlementKey: "genAi",

    entitlementPath:
        "entitlements.roadmaps.genAi",

    readinessStrategy: "genai",
    activationStrategy: "genai",

    capabilities: Object.freeze({
        behaviouralQuiz: true,
        personalization: true,
        assignments: true,
    }),
});

export const PREMIUM_ROADMAP_REGISTRY =
    Object.freeze({
        [GENAI_ROADMAP.slug]: GENAI_ROADMAP,
    });

/**
 * Resolve a Premium roadmap configuration from a slug.
 *
 * Slugs are normalized at the lookup boundary so callers do not need
 * to duplicate trimming/lowercasing logic.
 *
 * Unknown or invalid roadmaps fail closed.
 *
 * @param {unknown} roadmapSlug
 * @returns {object|null}
 */
export function getPremiumRoadmapConfig(
    roadmapSlug,
) {
    if (typeof roadmapSlug !== "string") {
        return null;
    }

    const normalizedSlug =
        roadmapSlug.trim().toLowerCase();

    if (!normalizedSlug) {
        return null;
    }

    return (
        PREMIUM_ROADMAP_REGISTRY[
        normalizedSlug
        ] ?? null
    );
}

/**
 * Returns true only when the supplied slug represents a registered
 * Premium roadmap.
 *
 * @param {unknown} roadmapSlug
 * @returns {boolean}
 */
export function isPremiumRoadmap(roadmapSlug) {
    return (
        getPremiumRoadmapConfig(roadmapSlug) !==
        null
    );
}