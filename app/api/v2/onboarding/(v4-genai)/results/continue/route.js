import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile, ONBOARDING_VERSIONS } from "@/models/v2/user.profile.model";
import { OnboardingResponseModel } from "@/models/v2/onboarding.model";

export async function POST(req) {
  try {
    const {
      decodedToken,
      error: authError,
      status: authStatus,
    } = await verifyFirebaseToken(req);

    if (authError || !decodedToken) {
      return NextResponse.json(
        { success: false, message: authError || "Unauthorized" },
        { status: authStatus || 401 },
      );
    }
    
    const firebaseUID = decodedToken.uid;
    await connectToDB();

    // Confirm that a completed V4 diagnostic exists
    const responseDoc = await OnboardingResponseModel.findOne({ 
      firebaseUID, 
      onboardingVersion: ONBOARDING_VERSIONS.V4,
      status: "completed"
    }).lean();

    if (!responseDoc) {
      return NextResponse.json({ success: false, message: "Completed diagnostic not found." }, { status: 404 });
    }

    // Atomic state update: results -> paywall
    // Also accepts "completed" step — fully-onboarded users activating GenAI
    const profile = await UserProfile.findOneAndUpdate(
      {
        firebaseUID,
        "onboardingState.step": { $in: ["results", "completed"] },
      },
      {
        $set: {
          "onboardingState.step": "paywall",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (profile) {
      return NextResponse.json({ success: true, nextStep: "paywall" });
    }

    // If update didn't match, load the current state to return safe conflict responses
    const currentProfile = await UserProfile.findOne({ firebaseUID }).lean();
    if (!currentProfile) {
      return NextResponse.json({ success: false, message: "User profile not found." }, { status: 404 });
    }

    const currentStep = currentProfile.onboardingState?.step || "diagnostic";

    if (currentStep === "paywall") {
      // Idempotent success
      return NextResponse.json({ success: true, nextStep: "paywall" });
    }

    if (currentStep === "diagnostic" || currentStep === "role_selection") {
      return NextResponse.json({ success: false, message: "Diagnostic is not complete." }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: "Invalid state transition." }, { status: 409 });

  } catch (error) {
    console.error("Results Continue POST Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
