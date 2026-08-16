export async function getDiagnosticResults(
  idToken,
) {
  try {
    const response = await fetch(
      "/api/v2/onboarding/diagnostic/results",
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
          "Unable to load diagnostic results.",
      };
    }

    return data;
  } catch (error) {
    console.error(
      "Error fetching results:",
      error,
    );

    return {
      success: false,
      message: "Network error occurred.",
    };
  }
}