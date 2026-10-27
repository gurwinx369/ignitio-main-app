import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { activateRoadmap } from "@/lib/onboarding/activation.service";

export async function POST(request) {
  try {
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);

    if (authError || !decodedToken) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: authStatus || 401 }
      );
    }

    const firebaseUID = decodedToken.uid;
    const result = await activateRoadmap(firebaseUID);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Activation failed" },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      nextStep: result.nextStep,
      alreadyActivated: result.alreadyActivated || false,
      startingTier: result.startingTier || null,
      startingRoute: result.startingRoute || null,
      beginnerSkipped: Boolean(result.beginnerSkipped),
      includedDayIds: result.includedDayIds || [],
      skippedDayIds: result.skippedDayIds || [],
    });
  } catch (error) {
    console.error("Activation POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
