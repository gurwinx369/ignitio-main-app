// POST /api/v2/coupon/validate
// Validates a coupon against the authenticated user and selected plan.
export async function validateCoupon({
    idToken,
    couponCode,
    plan,
}) {
    try {
        const res =
            await fetch(
                "/api/v2/coupon/validate",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${idToken}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        couponCode,
                        plan,
                    }),
                },
            );

        return await res.json();
    } catch {
        return {
            valid: false,
            message: "Network error.",
        };
    }
}