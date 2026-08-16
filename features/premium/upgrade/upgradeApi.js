export async function ensurePremiumUpgrade(
    user,
    { signal } = {},
) {
    if (!user) {
        throw new Error(
            "User required to prepare Premium GenAI roadmap",
        );
    }

    const idToken =
        await user.getIdToken();

    const response = await fetch(
        "/api/v2/premium/genai/upgrade",
        {
            method: "POST",
            headers: {
                Authorization:
                    `Bearer ${idToken}`,
            },
            cache: "no-store",
            signal,
        },
    );

    const data =
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error ||
            "Unable to prepare Premium GenAI roadmap",
        );

        error.status =
            response.status;

        error.upgradeStatus =
            data.upgradeStatus ?? null;

        throw error;
    }

    const hasValidPersonalizationId =
        typeof data.personalizationId ===
        "string" &&
        data.personalizationId.length > 0;

    const hasValidProgressId =
        typeof data.progressId ===
        "string" &&
        data.progressId.length > 0;

    const hasValidAlreadyUpgraded =
        typeof data.alreadyUpgraded ===
        "boolean";

    if (
        data.success !== true ||
        data.upgradeStatus !== "ready" ||
        !hasValidPersonalizationId ||
        !hasValidProgressId ||
        !hasValidAlreadyUpgraded
    ) {
        throw new Error(
            "Invalid Premium upgrade response",
        );
    }

    return data;
}