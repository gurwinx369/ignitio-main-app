// POST /api/v2/subscription/cancel
//
// Schedules the subscription to cancel at period end.
// Access remains active until currentPeriodEnd.
// Entitlements are revoked by the expiration cron when the period expires.
//
// This endpoint is idempotent — calling it twice returns success.
//
// Auth:    Firebase ID token (Bearer)
// Body:    (none required)
// Returns: { success, cancelAtPeriodEnd, currentPeriodEnd }

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { cancelSubscription } from "@/lib/subscription/subscription.service";

export async function POST(request) {
  // Step 1: Auth.
  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  // Step 2: Delegate to service.
  let result;
  try {
    result = await cancelSubscription({ firebaseUID: decodedToken.uid });
  } catch (err) {
    console.error("[POST /api/v2/subscription/cancel] Unexpected error:", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json(
      { message: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(
    {
      success: result.success,
      cancelAtPeriodEnd: result.cancelAtPeriodEnd,
      currentPeriodEnd: result.currentPeriodEnd,
    },
    { status: 200 },
  );
}
