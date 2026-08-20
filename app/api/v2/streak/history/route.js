import {
    NextResponse,
} from "next/server";

import connectToDB from "@/dbConfig/dbConnection";

import {
    verifyFirebaseToken,
} from "@/lib/auth";

import {
    getStreakMonthHistory,
    validateStreakHistoryMonth,
} from "@/lib/users/streak.history-query.service";

/**
 * GET /api/v2/streak/history?month=YYYY-MM
 *
 * Returns only permanent persisted StreakDay
 * evidence for the authenticated Firebase user.
 *
 * Missing dates remain absent rather than inferred.
 */
export async function GET(
    request,
) {
    /*
     * Authenticate first.
     *
     * Never accept firebaseUID from query params,
     * request body, or any client-controlled field.
     */
    const {
        decodedToken,
        error: authError,
        status: authStatus,
    } =
        await verifyFirebaseToken(
            request,
        );

    if (
        authError
    ) {
        return NextResponse.json(
            {
                message:
                    authError,
            },
            {
                status:
                    authStatus,
            },
        );
    }

    /*
     * Validate the requested month before
     * making any database query.
     */
    const month =
        new URL(
            request.url,
        ).searchParams.get(
            "month",
        );

    if (
        !validateStreakHistoryMonth(
            month,
        )
    ) {
        return NextResponse.json(
            {
                message:
                    "Invalid month. Expected YYYY-MM.",
            },
            {
                status:
                    400,
            },
        );
    }

    try {
        await connectToDB();

        const history =
            await getStreakMonthHistory({
                firebaseUID:
                    decodedToken.uid,

                month,
            });

        return NextResponse.json(
            {
                ok:
                    true,

                ...history,
            },
            {
                status:
                    200,
            },
        );
    } catch (error) {
        /*
         * Never expose Mongo details, document data,
         * Firebase UIDs, or internal error messages.
         */
        console.error(
            "[GET /api/v2/streak/history] Failed:",
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
                message:
                    "Internal server error",
            },
            {
                status:
                    500,
            },
        );
    }
}