// POST /api/v2/payment/verify
// Verifies HMAC signature server-side, grants entitlement, advances state.
// Returns { success, nextStep } on success.
export async function verifyPayment({ razorpayPaymentId, razorpaySubscriptionId, razorpaySignature }, idToken) {
  try {
    const res = await fetch("/api/v2/payment/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ razorpayPaymentId, razorpaySubscriptionId, razorpaySignature }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error." };
  }
}
