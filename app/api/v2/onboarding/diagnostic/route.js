import { NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import {
  UserProfile,
  ONBOARDING_VERSIONS,
} from "@/models/v2/user.profile.model";
import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { evaluateDiagnosticPayload } from "@/lib/onboarding/diagnostic-evaluation";

export async function POST(req) {
  try {
    const {
      decodedToken,
      error: authError,
      status: authStatus,
    } = await verifyFirebaseToken(req);

    if (authError || !decodedToken) {
      return NextResponse.json(
        {
          error: authError || "Unauthorized",
        },
        {
          status: authStatus || 401,
        },
      );
    }

    const firebaseUID = decodedToken.uid;
    const rawBody = await req.json().catch(() => ({}));

    const evaluation = evaluateDiagnosticPayload(rawBody);

    if (!evaluation.success) {
      return NextResponse.json(
        {
          error: evaluation.error,
          ...(evaluation.details ? { details: evaluation.details } : {}),
        },
        {
          status: evaluation.status,
        },
      );
    }

    await connectToDB();
<<<<<<< HEAD
<<<<<<< HEAD

    const existingProfile = await UserProfile.findOne({
      firebaseUID,
    })
      .select("_id onboardingState.step")
      .lean();
=======
    //fix
=======
>>>>>>> 5229f4a (next fix)
    let existingProfile = await UserProfile.findOne({ firebaseUID }).select("_id onboardingState.step").lean();
>>>>>>> 8f554cf (fix)

    if (!existingProfile) {
      return NextResponse.json(
        {
          error: "User profile not found",
        },
        {
          status: 404,
        },
      );
    }

    const canonicalStep = existingProfile.onboardingState?.step;

    if (!canonicalStep) {
      return NextResponse.json(
        {
          error: "User onboarding state is missing",
        },
        {
          status: 409,
        },
      );
    }

    if (!["diagnostic", "results"].includes(canonicalStep)) {
      return NextResponse.json({
        success: true,
        nextStep: canonicalStep,
        statePreserved: true,
      });
    }

    const now = new Date();

    await OnboardingResponseModel.findOneAndUpdate(
      {
        firebaseUID,
        onboardingVersion: "v4",
      },
      {
        $setOnInsert: {
          firebaseUID,
          onboardingVersion: "v4",
        },
        $set: {
          ...evaluation.persistenceFields,
          completedAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    const transitionedProfile = await UserProfile.findOneAndUpdate(
      {
        firebaseUID,
        "onboardingState.step": {
          $in: ["diagnostic", "results"],
        },
      },
      {
        $set: {
          "onboardingState.step": "results",
          onboardingVersion: ONBOARDING_VERSIONS.V4,
        },
      },
      {
        new: true,
      },
    );

    if (transitionedProfile) {
      return NextResponse.json({
        success: true,
        nextStep: "results",
      });
    }

    const latestProfile = await UserProfile.findOne({
      firebaseUID,
    })
      .select("onboardingState.step")
      .lean();

    if (!latestProfile) {
      return NextResponse.json(
        {
          error: "User profile not found",
        },
        {
          status: 404,
        },
      );
    }

    const latestCanonicalStep =
      latestProfile.onboardingState?.step;

    if (!latestCanonicalStep) {
      return NextResponse.json(
        {
          error: "User onboarding state is missing",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json({
      success: true,
      nextStep: latestCanonicalStep,
      statePreserved: true,
    });
  } catch (error) {
    console.error("Diagnostic POST Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}