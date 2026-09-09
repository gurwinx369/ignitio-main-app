import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";

import {
    getPremiumRoadmapAccessPolicy,
    hasPremiumRoadmapEntitlement,
} from "@/lib/premium/premium-roadmap-access-policy";

/**
 * Perform generic server-side access validation for a Premium roadmap.
 *
 * This service owns only:
 * - Premium roadmap registration
 * - UserProfile lookup
 * - roadmap entitlement
 *
 * Roadmap-specific readiness belongs to roadmap-specific services.
 *
 * This function performs zero writes.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @param {string} params.roadmapSlug
 * @returns {Promise<object>}
 */
export async function checkPremiumRoadmapAccess({
    firebaseUID,
    roadmapSlug,
}) {
    const roadmapConfig =
        getPremiumRoadmapAccessPolicy(
            roadmapSlug,
        );

    if (!roadmapConfig) {
        return {
            status: "unsupported_roadmap",
        };
    }

    if (!firebaseUID) {
        return {
            status: "profile_missing",
        };
    }

    await connectToDB();

    const userProfile =
        await UserProfile.findOne({
            firebaseUID,
        }).lean();

    if (!userProfile) {
        return {
            status: "profile_missing",
        };
    }

    if (
        !hasPremiumRoadmapEntitlement(
            userProfile,
            roadmapConfig.slug,
        )
    ) {
        return {
            status: "not_entitled",
            userProfile,
            roadmapConfig,
        };
    }

    return {
        status: "ready",
        userProfile,
        roadmapConfig,
    };
}