// POST /api/v2/onboarding/paywall/skip
// Foundation path — no Premium grant. Returns { success, nextStep }.
export async function skipPremium(idToken) {
  try {
    const res = await fetch("/api/v2/onboarding/paywall/skip", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error." };
  }
}
