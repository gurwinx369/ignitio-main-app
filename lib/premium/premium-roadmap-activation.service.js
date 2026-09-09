import {
    getPremiumRoadmapConfig,
} from "./premium-roadmap-registry.js";

import {
    activateGenAiRoadmap,
    reconcileCompletedGenAi,
} from "./genai/premium-genai-activation.service.js";

const ACTIVATION_STRATEGIES =
    Object.freeze({
        genai: Object.freeze({
            activate:
                activateGenAiRoadmap,
            reconcile:
                reconcileCompletedGenAi,
        }),
    });

function resolveActivationStrategy(
    roadmapSlug,
) {
    const roadmapConfig =
        getPremiumRoadmapConfig(
            roadmapSlug,
        );

    if (!roadmapConfig) {
        return {
            ok: false,
            result: {
                status: 404,
                success: false,
                error:
                    "Unsupported Premium roadmap",
            },
        };
    }

    const strategy =
        ACTIVATION_STRATEGIES[
        roadmapConfig.activationStrategy
        ];

    if (!strategy) {
        return {
            ok: false,
            result: {
                status: 500,
                success: false,
                error:
                    "Premium roadmap activation strategy is not configured",
            },
        };
    }

    return {
        ok: true,
        roadmapConfig,
        strategy,
    };
}

export async function activatePremiumRoadmap(
    user,
    onboardingResponse,
    roadmapSlug,
) {
    const resolved =
        resolveActivationStrategy(
            roadmapSlug,
        );

    if (!resolved.ok) {
        return resolved.result;
    }

    return resolved.strategy.activate(
        user,
        onboardingResponse,
        resolved.roadmapConfig.slug,
    );
}

export async function reconcileCompletedPremiumRoadmap(
    user,
    roadmapSlug,
) {
    const resolved =
        resolveActivationStrategy(
            roadmapSlug,
        );

    if (!resolved.ok) {
        return resolved.result;
    }

    return resolved.strategy.reconcile(
        user,
        resolved.roadmapConfig.slug,
    );
}