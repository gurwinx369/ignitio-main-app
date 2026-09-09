// GET /api/v2/onboarding/paywall/status
// Returns canonical step and entitled flag.
// May reconcile stuck-at-paywall state.
export async function getPaywallStatus(
  idToken,
) {
  try {
    const response = await fetch(
      "/api/v2/onboarding/paywall/status",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        cache: "no-store",
      },
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          data.error ||
          "Unable to load paywall status.",
      };
    }

    return data;
  } catch (error) {
    console.error(
      "Error fetching paywall status:",
      error,
    );

    return {
      success: false,
      message: "Network error.",
    };
  }
}