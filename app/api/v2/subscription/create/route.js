// POST /api/v2/subscription/create
//
// Creates a new Razorpay subscription and returns the data needed
// by the frontend to open Razorpay Checkout.
//
// Thin route handler — all business logic lives in subscription.service.js.
//
// Auth:    Firebase ID token (Bearer)
// Body:    { plan: "ignitio_premium" }
// Returns: { razorpaySubscriptionId, keyId }

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { createSubscription } from "@/lib/subscription/subscription.service";
import { PLAN_SLUGS } from "@/lib/subscription/constants";

const CreateSubscriptionSchema = z.object({
  plan: z.enum(Object.values(PLAN_SLUGS)),
});

export async function POST(request) {
  // Step 1: Auth — verify before touching the body.
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
  const validation = CreateSubscriptionSchema.safeParse(rawBody);
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

  // Step 4: Delegate to service.
  let result;
  try {
    result = await createSubscription({
      firebaseUID: decodedToken.uid,
      plan: validation.data.plan,
    });
  } catch (err) {
    console.error("[POST /api/v2/subscription/create] Unexpected error:", err.name);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Step 5: Map service result to HTTP response.
  if (result.error) {
    const statusCode = result.status ?? 500;

    if (result.existingStatus) {
      return NextResponse.json(
        {
          message: result.error,
          existingStatus: result.existingStatus,
        },
        { status: statusCode },
      );
    }

    return NextResponse.json({ message: result.error }, { status: statusCode });
  }

  return NextResponse.json(
    {
      razorpaySubscriptionId: result.razorpaySubscriptionId,
      keyId: result.keyId,
    },
    { status: 201 },
  );
}
