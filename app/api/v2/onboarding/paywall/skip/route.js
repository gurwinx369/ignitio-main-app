// POST /api/v2/onboarding/paywall/skip
//
// Allows a user to skip the Premium paywall and advance to role_selection
// without purchasing. This is the Foundation (free) path.
//
// Security:
//   • Firebase token verified before any body parsing.
//   • firebaseUID derived from verified token — never from the client body.
//   • Skip never grants Premium entitlement.
//   • Skip never revokes an existing trusted Premium entitlement.
//   • Only advances paywall → role_selection. Later states are preserved.
//
// State machine:
//   paywall        → role_selection  { success: true, nextStep: "role_selection" }
//   role_selection → (idempotent)    { success: true, nextStep: "role_selection" }
//   completed      → (preserved)     { success: true, nextStep: "completed" }
//   results        → 409
//   diagnostic     → 409
//
// Auth:    Firebase ID token (Bearer)
// Body:    (none)
// Returns: { success, nextStep }

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";

// States that are ahead of paywall — preserve them and return idempotent success.
// ponytail: completed = fully-onboarded user in GenAI flow, skip is a no-op
const FORWARD_STATES = new Set(["activation_pending", "completed"]);

// States that are behind paywall — skip cannot be called from here.
const BACKWARD_STATES = new Set(["diagnostic", "results"]);

export async function POST(request) {
  // Step 1: Auth — verify before touching anything.
  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  const { uid: firebaseUID } = decodedToken;

  // Step 2: DB.
  try {
    await connectToDB();
  } catch (err) {
    console.error("[POST /api/v2/onboarding/paywall/skip] DB connection error:", err.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Step 3: Resolve profile.
  const profile = await UserProfile.findOne(
    { firebaseUID },
    { "onboardingState.step": 1, "entitlements.roadmaps.genAi": 1 },
  ).lean();

  if (!profile) {
    return NextResponse.json({ message: "User profile not found" }, { status: 404 });
  }

  const currentStep = profile?.onboardingState?.step ?? "diagnostic";

  // Step 4: Reject backward states.
  if (BACKWARD_STATES.has(currentStep)) {
    return NextResponse.json(
      {
        message: `Cannot skip paywall from state: ${currentStep}. Complete the diagnostic and review your results first.`,
        currentStep,
      },
      { status: 409 },
    );
  }

  // Step 5: Preserve forward states (idempotent).
  if (FORWARD_STATES.has(currentStep)) {
    return NextResponse.json(
      { success: true, nextStep: currentStep },
      { status: 200 },
    );
  }

  // Step 6: Advance paywall → activation_pending.
  // Never touches entitlements — existing Premium access is preserved unchanged.
  await UserProfile.updateOne(
    { firebaseUID, "onboardingState.step": "paywall" },
    { $set: { "onboardingState.step": "activation_pending" } },
  );

  return NextResponse.json(
    { success: true, nextStep: "activation_pending" },
    { status: 200 },
  );
}
