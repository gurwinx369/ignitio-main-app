// POST /api/v2/payment/verify
//
// Verifies a completed Razorpay payment, activates the subscription,
// and grants premium entitlements.
//
// Security:
//   • Firebase token verified before any body parsing.
//   • Razorpay HMAC-SHA256 signature verified inside the service.
//   • MongoDB transaction used for all three DB writes.
//   • Idempotent — safe to call multiple times for the same payment.
//
// Auth:    Firebase ID token (Bearer)
// Body:    { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature }
// Returns: { success, subscription }

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { verifyPayment } from "@/lib/subscription/subscription.service";
import { sensitiveRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

const VerifyPaymentSchema = z.object({
  razorpayPaymentId:      z.string().min(1).trim(),
  razorpaySubscriptionId: z.string().min(1).trim(),
  razorpaySignature:      z.string().min(1).trim(),
});

export async function POST(request) {
  // Step 0: Rate Limit
  const rateLimitError = await enforceRateLimit(sensitiveRateLimiter, getClientIp(request));
  if (rateLimitError) return rateLimitError;

  // Step 1: Auth.
  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  // Step 2: Parse body.
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  // Step 3: Validate.
  const validation = VerifyPaymentSchema.safeParse(rawBody);
  if (!validation.success) {
    const first = validation.error.issues[0];
    return NextResponse.json(
      {
        message: "Validation failed",
        field: first?.path?.join(".") ?? "",
        detail: first?.message ?? "Invalid request body",
      },
      { status: 422 },
    );
  }

  const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } =
    validation.data;

  // Step 4: Delegate to service.
  let result;
  try {
    result = await verifyPayment({
      firebaseUID: decodedToken.uid,
      razorpayPaymentId,
      razorpaySubscriptionId,
      razorpaySignature,
    });
  } catch (err) {
    console.error("[POST /api/v2/payment/verify] Unexpected error:", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Step 5: Map result.
  if (result.error) {
    return NextResponse.json(
      { message: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      alreadyProcessed: result.alreadyProcessed ?? false,
      subscription: result.subscription,
    },
    { status: 200 },
  );
}
