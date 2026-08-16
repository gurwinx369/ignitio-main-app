export async function fetchCalibrationStatus(
  user,
  { signal } = {},
) {
  if (!user) {
    throw new Error(
      "User required to fetch calibration status",
    );
  }

  const idToken =
    await user.getIdToken();

  const response = await fetch(
    "/api/v2/premium/genai/calibration",
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${idToken}`,
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(() => ({}));

    const error = new Error(
      errorData.error ||
      "Unable to verify calibration status",
    );

    error.status = response.status;

    throw error;
  }

  const data = await response.json();

  const hasValidStatus =
    data.status === "ready" ||
    data.status === "required";

  const hasValidRequiredFlag =
    typeof data.calibrationRequired ===
    "boolean";

  const hasConsistentState =
    (
      data.status === "ready" &&
      data.calibrationRequired === false
    ) ||
    (
      data.status === "required" &&
      data.calibrationRequired === true
    );

  if (
    data.success !== true ||
    !hasValidStatus ||
    !hasValidRequiredFlag ||
    !hasConsistentState
  ) {
    throw new Error(
      "Invalid calibration status response",
    );
  }

  return data;
}

export async function submitCalibration(
  payload,
  idToken,
) {
  if (!idToken) {
    throw new Error(
      "Authentication token required",
    );
  }

  const response = await fetch(
    "/api/v2/premium/genai/calibration",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${idToken}`,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(() => ({}));

    const error = new Error(
      errorData.error ||
      "Unable to submit calibration",
    );

    error.status = response.status;
    error.details =
      errorData.details ?? null;

    throw error;
  }

  return response.json();
}