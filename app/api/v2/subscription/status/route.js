// GET /api/v2/subscription/status
//
// Returns the full subscription billing summary for the authenticated user.
// Reads MongoDB only — never contacts Razorpay.
// Frontend must not compute premium state locally.
//
// Auth:    Firebase ID token (Bearer)
// Returns: { status, plan, currentPeriodStart, currentPeriodEnd,
//            cancelAtPeriodEnd, daysRemaining, entitled }

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { getSubscriptionStatus } from "@/lib/subscription/subscription.service";

export async function GET(request) {
  // Step 1: Auth.
  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  // Step 2: Delegate to service.
  let result;
  try {
    result = await getSubscriptionStatus({ firebaseUID: decodedToken.uid });
  } catch (err) {
    console.error("[GET /api/v2/subscription/status] Unexpected error:", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  if (result.error) {
    return NextResponse.json(
      { message: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(result, { status: 200 });
}
