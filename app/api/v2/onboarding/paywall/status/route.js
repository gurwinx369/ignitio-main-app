// GET /api/v2/onboarding/paywall/status
//
// Returns the canonical paywall state for the authenticated user.
// Reconciles the special case: step="paywall" but entitled=true.
//
// This handles users stuck at paywall after:
//   • Webhook-only activation (webhook fired before client verification)
//   • Browser closure after payment
//   • Client verification timeout
//   • Page refresh after successful payment
//
// If the user is at "paywall" AND already entitled (genAi=true), the backend
// atomically advances to "role_selection" and returns the updated state.
//
// Response contract:
//   { success: true, step: string, entitled: boolean, nextStep: string }
//
// nextStep is always the canonical step the frontend should route to.
//
// Auth:    Firebase ID token (Bearer)
// Returns: { success, step, entitled, nextStep }

import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";

// Map of step → nextStep the client should route to.
// Keeps routing decisions server-owned and consistent.
const STEP_ROUTING = {
  diagnostic:          "diagnostic",
  results:             "results",
  paywall:             "paywall",
  // activation_pending: run activation to build GenAI roadmap
  activation_pending:  "activation_pending",
  completed:           "activation_pending",
};

export async function GET(request) {
  // Step 1: Auth.
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
    console.error("[GET /api/v2/onboarding/paywall/status] DB connection error:", err.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Step 3: Load profile — only the fields we need.
  let profile = await UserProfile.findOne(
    { firebaseUID },
    { "onboardingState.step": 1, "entitlements.roadmaps.genAi": 1 },
  ).lean();

  if (!profile) {
    return NextResponse.json({ message: "User profile not found" }, { status: 404 });
  }

  let currentStep = profile?.onboardingState?.step ?? "diagnostic";
  const entitled  = profile?.entitlements?.roadmaps?.genAi ?? false;

  // Step 4: Reconcile stuck-at-paywall-but-entitled case.
  // Advance to activation_pending so the client can trigger roadmap creation.
  if (currentStep === "paywall" && entitled) {
    await UserProfile.updateOne(
      { firebaseUID, "onboardingState.step": "paywall" },
      { $set: { "onboardingState.step": "activation_pending" } },
    );
    currentStep = "activation_pending";
  }

  const nextStep = STEP_ROUTING[currentStep] ?? currentStep;

  return NextResponse.json(
    {
      success:  true,
      step:     currentStep,
      entitled,
      nextStep,
    },
    { status: 200 },
  );
}
