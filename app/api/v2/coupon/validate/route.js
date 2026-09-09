import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupon/coupon.service";
import { PLAN_SLUGS } from "@/lib/subscription/constants";

const ValidateCouponSchema = z.object({
    couponCode: z
        .string()
        .trim()
        .min(1)
        .max(50),
    plan: z.enum(Object.values(PLAN_SLUGS)),
});

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
                    message: authError || "Unauthorized",
                },
                {
                    status: authStatus || 401,
                },
            );
        }

        let rawBody;

        try {
            rawBody = await request.json();
        } catch {
            return NextResponse.json(
                {
                    message: "Invalid JSON in request body",
                },
                {
                    status: 400,
                },
            );
        }

        const validation =
            ValidateCouponSchema.safeParse(rawBody);

        if (!validation.success) {
            const first =
                validation.error.issues[0];

            return NextResponse.json(
                {
                    message: "Validation failed",
                    field:
                        first?.path?.join(".") ?? "",
                    detail:
                        first?.message ??
                        "Invalid request body",
                },
                {
                    status: 422,
                },
            );
        }

        const result =
            await validateCoupon({
                firebaseUID:
                    decodedToken.uid,
                couponCode:
                    validation.data.couponCode,
                plan:
                    validation.data.plan,
            });

        if (!result.valid) {
            return NextResponse.json(
                {
                    message: result.error,
                },
                {
                    status: result.status || 400,
                },
            );
        }

        return NextResponse.json(
            {
                valid: true,
                coupon: result.coupon,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error(
            "[POST /api/v2/coupon/validate] Unexpected error:",
            error.name,
        );

        return NextResponse.json(
            {
                message: "Internal server error",
            },
            {
                status: 500,
            },
        );
    }
}
