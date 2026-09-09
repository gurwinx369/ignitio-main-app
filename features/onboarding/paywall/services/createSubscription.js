// POST /api/v2/subscription/create
// Returns { razorpaySubscriptionId, keyId } on success.
// May return 409 with existingStatus if an active subscription already exists.
export async function createSubscription({
  idToken,
  plan,
  couponCode,
}) {
  try {
    const res =
      await fetch(
        "/api/v2/subscription/create",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${idToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            plan,
            ...(couponCode
              ? { couponCode }
              : {}),
          }),
        },
      );

    return await res.json();
  } catch {
    return {
      success: false,
      message: "Network error.",
    };
  }
}