// GET /api/v2/subscription/access
//
// Fast server-side entitlement check.
// Returns only premium access flags — no billing data.
// Intended for frequent calls that need to gate premium features.
//
// Auth:    Firebase ID token (Bearer)
// Returns: { premium: boolean, genAi: boolean }

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { getAccessStatus } from "@/lib/subscription/subscription.service";

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
    result = await getAccessStatus({ firebaseUID: decodedToken.uid });
  } catch (err) {
    console.error("[GET /api/v2/subscription/access] Unexpected error:", err.name);
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
      premium: result.premium,
      genAi: result.genAi,
    },
    { status: 200 },
  );
}
