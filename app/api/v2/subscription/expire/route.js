// GET /api/v2/subscription/expire
//
// Cron endpoint — finds ACTIVE subscriptions past their period end,
// verifies their status with Razorpay, and expires them locally.
//
// Never expires a subscription based on local date alone.
// Always confirms with Razorpay before removing entitlements.
//
// Auth:    SUBSCRIPTION_EXPIRE_CRON_SECRET Bearer token
//          (same pattern as /api/v2/retention/cron)
// Returns: { checked, expired, skipped, errors }

import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { expireStaleSubscriptions } from "@/lib/subscription/subscription.service";

export async function GET(request) {
  // Step 1: Verify cron secret.
  const cronSecret = process.env.SUBSCRIPTION_EXPIRE_CRON_SECRET;

  if (!cronSecret) {
    console.error("[expire cron] SUBSCRIPTION_EXPIRE_CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Connect to DB and run job.
  try {
    await connectToDB();
    const summary = await expireStaleSubscriptions();
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("[expire cron] Failed:", {
      name: err?.name,
      message: err?.message,
    });
    return NextResponse.json(
      { error: "Failed to run subscription expiration job" },
      { status: 500 },
    );
  }
}
