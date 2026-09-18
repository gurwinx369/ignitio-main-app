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
    let existingProfile = await UserProfile.findOne({ firebaseUID }).select("_id onboardingComplete onboardingState.step entitlements.roadmaps.genAi").lean();

    if (!existingProfile) {
      const tokenEmail = typeof decodedToken.email === "string" ? decodedToken.email.toLowerCase().trim() : "";
      if (tokenEmail) {
        existingProfile = await UserProfile.findOne({ email: tokenEmail }).select("_id onboardingComplete onboardingState.step firebaseUID").lean();
        if (existingProfile && existingProfile.firebaseUID !== firebaseUID) {
          await UserProfile.updateOne({ _id: existingProfile._id }, { $set: { firebaseUID } }, { timestamps: false });
        }
      }
      if (!existingProfile) {
        existingProfile = await UserProfile.create({
          firebaseUID,
          email: tokenEmail,
          onboardingComplete: false,
          onboardingVersion: ONBOARDING_VERSIONS.V4,
          // New users start at role_selection (core onboarding gate).
          // The diagnostic is a feature-level activation, not a gating step.
          onboardingState: { step: "role_selection" },
        });
      }
    }

    let canonicalStep = existingProfile.onboardingState?.step;

    if (!canonicalStep) {
      // Heal old user records that are missing the new onboardingState subdocument
      canonicalStep = existingProfile.onboardingComplete ? "completed" : "diagnostic";
      await UserProfile.updateOne(
        { _id: existingProfile._id },
        { $set: { "onboardingState.step": canonicalStep } },
        { timestamps: false }
      );
      if (!existingProfile.onboardingState) existingProfile.onboardingState = {};
      existingProfile.onboardingState.step = canonicalStep;
    }

    // Allow the diagnostic from these states:
    // - "diagnostic" / "results": normal in-progress flow
    // - "role_selection" / "completed": fully-onboarded user activating GenAI
    const ELIGIBLE_STEPS = ["diagnostic", "results", "role_selection", "completed"];
    if (!ELIGIBLE_STEPS.includes(canonicalStep)) {
      return NextResponse.json({
        success: true,
        nextStep: canonicalStep,
        statePreserved: true,
      });
    }

    // If already entitled, no need to re-run the diagnostic flow.
    if (canonicalStep === "completed" && existingProfile.entitlements?.roadmaps?.genAi === true) {
      return NextResponse.json({
        success: true,
        nextStep: "completed",
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
          // diagnostic/results = original flow
          // role_selection/completed = fully-onboarded user activating GenAI
          $in: ["diagnostic", "results", "role_selection", "completed"],
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
      .select("onboardingComplete onboardingState.step")
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

    let latestCanonicalStep =
      latestProfile.onboardingState?.step;

    if (!latestCanonicalStep) {
      latestCanonicalStep = latestProfile.onboardingComplete ? "completed" : "diagnostic";
      await UserProfile.updateOne(
        { _id: latestProfile._id },
        { $set: { "onboardingState.step": latestCanonicalStep } },
        { timestamps: false }
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