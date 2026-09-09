// POST /api/v2/payment/webhook
//
// Razorpay webhook receiver.
//
// Security model:
//   • Signature verification uses raw body bytes + RAZORPAY_WEBHOOK_SECRET.
//   • Verified BEFORE delegating to the service.
//   • Always returns HTTP 200 — even on processing errors — to prevent
//     Razorpay from retrying indefinitely on non-network failures.
//   • The service is idempotent: duplicate deliveries cause no side effects.
//
// NOTE: This route must read the raw body as text for HMAC verification.
//       Do not call request.json() first — that consumes the readable stream.
//
// Auth:    Razorpay-Signature header
// Body:    Razorpay webhook payload (JSON)
// Returns: { status: "ok" }

import { NextResponse } from "next/server";
import crypto from "crypto";
import { handleWebhookEvent } from "@/lib/subscription/subscription.service";

export async function POST(request) {
  // Step 1: Read raw body as text (required for HMAC verification).
  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    // Cannot read body — return 200 anyway to prevent Razorpay retry loop.
    console.error("[webhook] Failed to read request body");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Step 2: Extract and verify the Razorpay webhook signature.
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const receivedSignature = request.headers.get("x-razorpay-signature") ?? "";

  if (!webhookSecret) {
    // Misconfigured — log and acknowledge to avoid retry storms.
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== receivedSignature) {
    // Reject with 400 so Razorpay retries (this may be a legitimate delivery).
    // Do NOT return 200 here — failing silently would hide real signature mismatches.
    console.warn("[webhook] Signature verification failed");
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  // Step 3: Parse the verified body.
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[webhook] Failed to parse verified webhook body as JSON");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  const event = payload?.event;
  if (!event || typeof event !== "string") {
    console.warn("[webhook] Webhook payload missing event field");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Step 4: Delegate to service — always return 200 after this point.
  try {
    await handleWebhookEvent({ event, payload });
  } catch (err) {
    // Unexpected service-level error — log internally, still acknowledge.
    console.error("[webhook] Unhandled error in handleWebhookEvent:", err.message);
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
