/**
 * DEPRECATED — POST /api/v2/streak/recover
 *
 * This route implemented manual freeze spending, which the PDF spec supersedes.
 * Per the Ignitio Streak System Developer Implementation Spec, freeze credits are
 * now consumed automatically during lazy miss detection (evaluateAndApplyLazyStreakState).
 * Earn-Back is effort-based (2 lessons in 48h), not manually triggered.
 *
 * This endpoint is intentionally returning 410 Gone.
 * No UI code references this route. Do not re-enable without a new spec revision.
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Streak recovery is now automatic. Freeze credits are spent automatically when a missed day is detected. Earn-Back requires completing 2 lessons within 48 hours.",
    },
    { status: 410 }
  );
}
