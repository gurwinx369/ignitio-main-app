/**
 * Client-side API fetcher for Premium access status.
 */
export async function fetchPremiumAccess(
  user,
  { signal } = {},
) {
  if (!user) {
    throw new Error(
      "User required to fetch premium access",
    );
  }

  const token = await user.getIdToken();

  const response = await fetch(
    "/api/v2/subscription/access",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = new Error(
      "Unable to verify Premium access",
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  return {
    hasGenAiAccess: data.genAi === true,
  };
}