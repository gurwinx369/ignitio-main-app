import { NextResponse } from "next/server";

import connectToDB from "@/dbConfig/dbConnection";
import {
    runStreakLifecycleBatch,
    validateStreakLifecycleCronAuthorization,
} from "@/lib/users/streak.lifecycle.service";

/**
 * GET /api/v2/streak/lifecycle
 *
 * Background-primary streak lifecycle worker.
 *
 * Called by an external scheduler approximately every 10–15 minutes.
 *
 * Responsibilities:
 * - expire failed Earn-Back windows
 * - process missed local streak days
 * - consume onboarding grace / freeze protection
 * - enter Earn-Back when protection is unavailable
 *
 * This endpoint does NOT:
 * - send notifications
 * - accept user IDs
 * - use Firebase authentication
 * - expose user-specific data
 *
 * Auth:
 * Authorization: Bearer <STREAK_LIFECYCLE_CRON_SECRET>
 */
export async function GET(request) {
    /*
     * Authenticate before touching MongoDB.
     */
    const authResult =
        validateStreakLifecycleCronAuthorization({
            authorizationHeader:
                request.headers.get(
                    "authorization",
                ),

            configuredSecret:
                process.env
                    .STREAK_LIFECYCLE_CRON_SECRET,
        });

    if (!authResult.ok) {
        return NextResponse.json(
            {
                error: authResult.error,
            },
            {
                status: authResult.status,
            },
        );
    }

    try {
        await connectToDB();

        const result =
            await runStreakLifecycleBatch();

        return NextResponse.json(
            {
                ok: true,
                ...result,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        /*
         * Do not expose internal database details or
         * user-specific information in logs/responses.
         */
        console.error(
            "[Streak Lifecycle] Job failed:",
            {
                name:
                    error?.name ||
                    "UnknownError",
                code:
                    error?.code ??
                    null,
            },
        );

        return NextResponse.json(
            {
                error:
                    "Failed to run streak lifecycle job",
            },
            {
                status: 500,
            },
        );
    }
}