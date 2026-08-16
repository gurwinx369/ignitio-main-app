import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile, ONBOARDING_VERSIONS } from "@/models/v2/user.profile.model";
import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { buildDiagnosticResults } from "@/features/onboarding/results/server/buildDiagnosticResults";

export async function GET(req) {
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

    const profile = await UserProfile.findOne({ firebaseUID }).lean();
    if (!profile) {
      return NextResponse.json({ success: false, message: "User profile not found." }, { status: 404 });
    }

    const currentStep = profile.onboardingState?.step || "diagnostic";

    if (currentStep === "diagnostic") {
      return NextResponse.json({ success: false, message: "Diagnostic is not complete." }, { status: 409 });
    }

    if (currentStep === "role_selection") {
      return NextResponse.json({ success: true, nextStep: "role_selection" });
    }

    if (currentStep === "completed") {
      return NextResponse.json({ success: true, nextStep: "completed" });
    }

    // Now currentStep is "results" or "paywall"
    const responseDoc = await OnboardingResponseModel.findOne(
      { firebaseUID, onboardingVersion: ONBOARDING_VERSIONS.V4 },
      {
        responses: 1,
        dailyDurationCategory: 1,
        primaryGoalSnapshot: 1,
        status: 1,
        onboardingVersion: 1,
      }
    ).lean();

    if (!responseDoc) {
      return NextResponse.json({ success: false, message: "Diagnostic response not found." }, { status: 404 });
    }

    if (responseDoc.status !== "completed") {
      return NextResponse.json({ success: false, message: "Diagnostic is not complete." }, { status: 409 });
    }

    const results = buildDiagnosticResults(responseDoc);

    return NextResponse.json({
      success: true,
      results,
      nextStep: "paywall" // the canonical next step from results
    });

  } catch (error) {
    console.error("Results GET Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
