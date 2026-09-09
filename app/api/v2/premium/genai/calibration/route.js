import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-route";
import { checkCalibrationStatus } from "@/lib/onboarding/calibration.service";
import { evaluateDiagnosticPayload, classifyV4Diagnostic } from "@/lib/onboarding/diagnostic-evaluation";

async function verifyEligibility(req) {
  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(req);

  if (authError || !decodedToken) {
    return {
      error: authError || "Unauthorized",
      status: authStatus || 401,
    };
  }

  const firebaseUID = decodedToken.uid;
  await connectToDB();

  const profile = await UserProfile.findOne({ firebaseUID }).lean();

  if (!profile) {
    return { error: "User profile not found", status: 404 };
  }

  if (!isOnboardingComplete(profile)) {
    return { error: "Onboarding is incomplete", status: 409 };
  }

  if (profile.entitlements?.roadmaps?.genAi !== true) {
    return { error: "Premium GenAI entitlement required", status: 403 };
  }

  return { profile, firebaseUID };
}

function buildConcurrencyFilter(
  existingDocument,
) {
  const filter = {
    _id: existingDocument._id,
  };

  if (
    Number.isInteger(
      existingDocument.__v,
    ) &&
    existingDocument.__v >= 0
  ) {
    filter.__v =
      existingDocument.__v;
  } else {
    /*
     * Older documents may not contain a
     * Mongoose version key.
     *
     * Match only while the field remains
     * absent, then $inc will initialize it.
     */
    filter.__v = {
      $exists: false,
    };
  }

  return filter;
}

export async function GET(req) {
  try {
    const eligibility = await verifyEligibility(req);
    if (eligibility.error) {
      return NextResponse.json(
        { error: eligibility.error },
        { status: eligibility.status }
      );
    }

    const { firebaseUID } = eligibility;
    const calibrationStatus = await checkCalibrationStatus(firebaseUID);

    return NextResponse.json({
      success: true,
      status: calibrationStatus.status,
      calibrationRequired: calibrationStatus.calibrationRequired,
      reason: calibrationStatus.reason,
    });
  } catch (error) {
    console.error("Calibration GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const eligibility = await verifyEligibility(req);
    if (eligibility.error) {
      return NextResponse.json(
        { error: eligibility.error },
        { status: eligibility.status }
      );
    }

    const { firebaseUID } = eligibility;

    // Check existing reusable evidence
    const existingDocument = await OnboardingResponseModel.findOne({
      firebaseUID,
      onboardingVersion: "v4",
    }).lean();

    const classification = classifyV4Diagnostic(existingDocument);

    if (classification.reusable) {
      return NextResponse.json({
        success: true,
        status: "ready",
        calibrationRequired: false,
        alreadyCalibrated: true,
      });
    }

    const rawBody = await req.json().catch(() => ({}));
    const evaluation = evaluateDiagnosticPayload(rawBody);

    if (!evaluation.success) {
      return NextResponse.json(
        {
          error: evaluation.error,
          ...(evaluation.details ? { details: evaluation.details } : {}),
        },
        { status: evaluation.status }
      );
    }

    const now = new Date();
    const persistenceFields = {
      ...evaluation.persistenceFields,
      completedAt: now,
    };

    if (!existingDocument) {
      try {
        await OnboardingResponseModel.create({
          firebaseUID,
          onboardingVersion: "v4",
          ...persistenceFields,
        });
      } catch (error) {
        if (error?.code !== 11000) {
          throw error;
        }

        const winningDocument = await OnboardingResponseModel.findOne({
          firebaseUID,
          onboardingVersion: "v4",
        }).lean();

        const winningClassification = classifyV4Diagnostic(winningDocument);

        if (winningClassification.reusable) {
          return NextResponse.json({
            success: true,
            status: "ready",
            calibrationRequired: false,
            alreadyCalibrated: true,
          });
        }

        return NextResponse.json(
          { error: "Conflict while creating diagnostic document" },
          { status: 409 }
        );
      }
    } else {
      const concurrencyFilter =
        buildConcurrencyFilter(
          existingDocument,
        );

      const updateResult =
        await OnboardingResponseModel.updateOne(
          concurrencyFilter,
          {
            $set: persistenceFields,
            $inc: {
              __v: 1,
            },
          },
          {
            runValidators: true,
          },
        );

      if (updateResult.matchedCount === 0) {
        // Document changed since we read it
        const latestDoc = await OnboardingResponseModel.findOne({
          firebaseUID,
          onboardingVersion: "v4",
        }).lean();

        const latestClassification = classifyV4Diagnostic(latestDoc);
        if (latestClassification.reusable) {
          return NextResponse.json({
            success: true,
            status: "ready",
            calibrationRequired: false,
            alreadyCalibrated: true,
          });
        }

        return NextResponse.json(
          { error: "Conflict while updating diagnostic document" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      status: "ready",
      calibrationRequired: false,
      alreadyCalibrated: false,
    });
  } catch (error) {
    console.error("Calibration POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
