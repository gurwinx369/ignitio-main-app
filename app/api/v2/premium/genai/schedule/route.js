import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-route";
import { validateSchedulePreference } from "@/lib/onboarding/activation.validation";
import {
  validateTimeWithinPeriod,
} from "@/lib/onboarding/schedule-periods";

export async function PATCH(request) {
  const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  const firebaseUID = decodedToken.uid;

  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
  }

  if (!rawBody || !rawBody.schedule) {
    return NextResponse.json({ message: "Missing schedule in request body" }, { status: 400 });
  }

  const { schedule } = rawBody;

  const validation = validateSchedulePreference(schedule);
  if (!validation.valid) {
    return NextResponse.json(
      { message: "Validation failed", detail: validation.error },
      { status: 400 }
    );
  }

  for (const window of schedule.windows) {
    const periodValidation =
      validateTimeWithinPeriod({
        period: window.period,
        startTime:
          window.startTime,
        endTime:
          window.endTime,
      });

    if (!periodValidation.valid) {
      return NextResponse.json(
        {
          message:
            "Validation failed",
          detail:
            periodValidation.error,
        },
        {
          status: 400,
        },
      );
    }
  }

  // Duplicate period check
  const periods = new Set();
  for (const w of schedule.windows) {
    if (periods.has(w.period)) {
      return NextResponse.json(
        { message: "Validation failed", detail: `Duplicate period: ${w.period}` },
        { status: 400 }
      );
    }
    periods.add(w.period);
  }

  await connectToDB();

  // Find user to check if they exist and are eligible
  const existingUser = await UserProfile.findOne({ firebaseUID }).lean();
  if (!existingUser) {
    return NextResponse.json({ message: "User profile not found" }, { status: 404 });
  }

  if (!isOnboardingComplete(existingUser)) {
    return NextResponse.json({ message: "Onboarding incomplete" }, { status: 409 });
  }

  if (existingUser.entitlements?.roadmaps?.genAi !== true) {
    return NextResponse.json({ message: "GenAI entitlement missing" }, { status: 403 });
  }

  const hasRealSchedule = Array.isArray(existingUser.schedulePreference?.windows) && existingUser.schedulePreference.windows.length > 0;
  if (hasRealSchedule) {
    return NextResponse.json({ success: true, scheduleConfigured: true, alreadyConfigured: true }, { status: 200 });
  }

  // Guarded update: ensure no schedule window exists at index 0
  const filter = {
    _id: existingUser._id,
    onboardingComplete: true,
    "entitlements.roadmaps.genAi": true,
    "schedulePreference.windows.0": {
      $exists: false,
    },
    $or: [
      {
        onboardingVersion: {
          $ne: "v4",
        },
      },
      {
        onboardingVersion: "v4",
        "onboardingState.step": "completed",
      },
    ],
  };

  const update = {
    $set: {
      "schedulePreference.timezone": schedule.timezone,
      "schedulePreference.windows": schedule.windows,
      "schedulePreference.isDefault": false,
    },
  };

  const updatedUser = await UserProfile.findOneAndUpdate(filter, update, { new: true }).lean();

  if (!updatedUser) {
    // The guarded update failed. Check if someone else updated it.
    const recheckedUser = await UserProfile.findOne({ firebaseUID }).lean();
    if (recheckedUser) {
      if (!isOnboardingComplete(recheckedUser)) {
        return NextResponse.json({ message: "Onboarding incomplete" }, { status: 409 });
      }
      if (recheckedUser.entitlements?.roadmaps?.genAi !== true) {
        return NextResponse.json({ message: "GenAI entitlement missing" }, { status: 403 });
      }
      const recheckedHasRealSchedule = Array.isArray(recheckedUser.schedulePreference?.windows) && recheckedUser.schedulePreference.windows.length > 0;
      if (recheckedHasRealSchedule) {
        return NextResponse.json({ success: true, scheduleConfigured: true, alreadyConfigured: true }, { status: 200 });
      }
    }
    return NextResponse.json({ message: "Failed to configure schedule. State may have changed." }, { status: 409 });
  }

  return NextResponse.json(
    {
      success: true,
      scheduleConfigured: true,
      alreadyConfigured: false
    },
    { status: 200 }
  );
}
