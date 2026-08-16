export async function continueToPaywall(idToken) {
  try {
    const response = await fetch("/api/v2/onboarding/results/continue", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error continuing to paywall:", error);
    return { success: false, message: "Network error occurred." };
  }
}
