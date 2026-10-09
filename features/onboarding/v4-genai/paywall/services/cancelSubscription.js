export async function cancelSubscription({
    idToken,
}) {
    try {
        const res = await fetch(
            "/api/v2/subscription/cancel",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            },
        );

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                message:
                    data?.message ??
                    "Failed to cancel subscription.",
            };
        }

        return {
            success: true,
            data,
        };
    } catch {
        return {
            success: false,
            message: "Network error.",
        };
    }
}