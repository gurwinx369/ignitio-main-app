export async function getSubscriptionStatus({
    idToken,
}) {
    try {
        const res = await fetch(
            "/api/v2/subscription/status",
            {
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
                    "Failed to load subscription.",
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