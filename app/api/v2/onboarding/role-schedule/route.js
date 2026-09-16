import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile, USER_ROLES } from "@/models/v2/user.profile.model";
import {
  validateTimeWithinPeriod,
} from "@/lib/onboarding/schedule-periods";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const TimeWindowSchema = z.object({
  period: z.enum(["MORNING", "NOON", "EVENING", "NIGHT"]),
  startTime: z.string().regex(TIME_REGEX, "startTime must be HH:MM (24-hour)"),
  endTime: z.string().regex(TIME_REGEX, "endTime must be HH:MM (24-hour)"),
});

const ScheduleSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  windows: z.array(TimeWindowSchema).min(1, "At least one window is required"),
});

const RoleScheduleBodySchema = z.object({
  role: z.enum(Object.values(USER_ROLES)),
  schedule: ScheduleSchema,
});

function validateScheduleTimes(schedule) {
  for (
    let i = 0;
    i < schedule.windows.length;
    i++
  ) {
    const scheduleWindow =
      schedule.windows[i];

    const [sh, sm] =
      scheduleWindow.startTime
        .split(":")
        .map(Number);

    const [eh, em] =
      scheduleWindow.endTime
        .split(":")
        .map(Number);

    const startMins =
      sh * 60 + sm;

    const endMins =
      eh * 60 + em;

    if (endMins <= startMins) {
      return (
        `schedule.windows[${i}].endTime ` +
        "must be after startTime"
      );
    }

    const periodValidation =
      validateTimeWithinPeriod({
        period:
          scheduleWindow.period,
        startTime:
          scheduleWindow.startTime,
        endTime:
          scheduleWindow.endTime,
      });

    if (!periodValidation.valid) {
      return periodValidation.error;
    }
  }

  // Check duplicate periods.
  const periods = new Set();

  for (
    const scheduleWindow
    of schedule.windows
  ) {
    if (
      periods.has(
        scheduleWindow.period,
      )
    ) {
      return (
        `Duplicate period: ` +
        scheduleWindow.period
      );
    }

    periods.add(
      scheduleWindow.period,
    );
  }

  return null;
}

export async function POST(request) {
  const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
  }

  const validation = RoleScheduleBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Validation failed", detail: validation.error.issues },
      { status: 400 }
    );
  }

  const body = validation.data;

  // Validate Timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: body.schedule.timezone });
  } catch (e) {
    return NextResponse.json(
      { message: "Validation failed", detail: "Invalid IANA timezone identifier" },
      { status: 400 }
    );
  }

  const timeError = validateScheduleTimes(body.schedule);
  if (timeError) {
    return NextResponse.json(
      { message: "Validation failed", detail: timeError },
      { status: 400 }
    );
  }

  const normalizedRole = body.role;
  const normalizedTimezone = body.schedule.timezone;
  const normalizedWindows = body.schedule.windows;

  await connectToDB();

  // Find user to check if they exist
  const existingUser = await UserProfile.findOne({ firebaseUID: decodedToken.uid }).lean();
  if (!existingUser) {
    return NextResponse.json({ message: "User profile not found" }, { status: 404 });
  }

  const filter = {
    firebaseUID: decodedToken.uid,
    // role_selection/diagnostic = first-time submit; completed = idempotent re-submit
    "onboardingState.step": { $in: ["role_selection", "diagnostic", "completed"] },
  };

  const update = {
    $set: {
      role: normalizedRole,
      "schedulePreference.timezone": normalizedTimezone,
      "schedulePreference.windows": normalizedWindows,
      "schedulePreference.isDefault": false,
      // Core onboarding ends here — GenAI activation happens separately
      "onboardingState.step": "completed",
      onboardingComplete: true,
    },
  };

  const updatedUser = await UserProfile.findOneAndUpdate(filter, update, { new: true }).lean();

  if (!updatedUser) {
    // Exists but invalid state
    return NextResponse.json({ message: "Invalid current state" }, { status: 409 });
  }

  return NextResponse.json(
    {
      success: true,
      nextStep: "completed",
    },
    { status: 200 }
  );
}
