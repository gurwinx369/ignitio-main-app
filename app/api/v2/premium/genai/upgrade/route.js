import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { ensurePremiumGenAiUpgrade } from "@/lib/onboarding/upgrade.service";

export async function POST(request) {
    try {
        const {
            decodedToken,
            error: authError,
            status: authStatus,
        } = await verifyFirebaseToken(request);

        if (authError || !decodedToken) {
            return NextResponse.json(
                {
                    error: authError || "Unauthorized",
                },
                {
                    status: authStatus || 401,
                },
            );
        }

        const firebaseUID = decodedToken.uid;

        const result =
            await ensurePremiumGenAiUpgrade(
                firebaseUID,
            );

        const {
            status,
            ...responseBody
        } = result;

        return NextResponse.json(
            responseBody,
            {
                status: status || 500,
            },
        );
    } catch (error) {
        console.error(
            "Premium GenAI Upgrade POST Error:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                upgradeStatus: "internal_error",
                error: "Internal server error",
            },
            {
                status: 500,
            },
        );
    }
}