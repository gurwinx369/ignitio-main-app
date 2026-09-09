import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { hasStreakHistory } from "@/lib/users/streak.service";

async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or malformed Authorization header", status: 401 };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { decodedToken };
  } catch (err) {
    return {
      error:
        process.env.NODE_ENV === "development"
          ? `Firebase error: ${err.code} — ${err.message}`
          : "Invalid or expired token",
      status: 401,
    };
  }
}

export async function PATCH(request) {
  await connectToDB();

  const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
  }

  const { timezone } = body;

  if (typeof timezone !== "string" || !timezone.trim()) {
    return NextResponse.json({ message: "Invalid timezone" }, { status: 422 });
  }

  const normalizedTimezone = timezone.trim();

  try {
    Intl.DateTimeFormat("en-US", { timeZone: normalizedTimezone });
  } catch (err) {
    return NextResponse.json({ message: "Invalid IANA timezone" }, { status: 422 });
  }

  try {
    const userProfile = await UserProfile.findOne({ firebaseUID: decodedToken.uid });

    if (!userProfile) {
      return NextResponse.json({ message: "User profile not found" }, { status: 404 });
    }

    const currentSchedulePreference =
      userProfile.schedulePreference || {};

    /*
     * Browser timezone detection owns the schedule only while the
     * schedule is still automatic/default.
     *
     * Once the user explicitly chooses a learning timezone
     * (isDefault === false), browser detection must never overwrite it.
     */
    const isExplicitSchedule =
      currentSchedulePreference.isDefault === false;

    if (isExplicitSchedule) {
      return NextResponse.json({
        ok: true,
        timezone: currentSchedulePreference.timezone,
        streakTimezoneUpdated: false,
      });
    }
    const setQuery = {
      "schedulePreference.timezone":
        normalizedTimezone,

      "schedulePreference.windows":
        currentSchedulePreference.windows || [],

      "schedulePreference.isDefault": true,
    };

    let streakTimezoneUpdated = false;
    const currentStreak = userProfile.streak || {};

    /*
     * Before streak history exists, the automatic browser timezone
     * may initialize/update the streak calendar.
     *
     * Once real history exists, the streak timezone is stable and must
     * not silently rebase historical local dates.
     */
    if (!hasStreakHistory(currentStreak)) {
      setQuery["streak.timezone"] =
        normalizedTimezone;

      streakTimezoneUpdated = true;
    }

    // Save skipping full document validation in case of legacy profiles
    await UserProfile.updateOne(
      { _id: userProfile._id },
      { $set: setQuery },
      { timestamps: false } // Avoid changing timestamps just for timezone sync
    );

    return NextResponse.json({
      ok: true,
      timezone: normalizedTimezone,
      schedulePreferenceUpdated: true,
      streakTimezoneUpdated
    }, { status: 200 });

  } catch (err) {
    console.error("[PATCH /api/v2/user/timezone] Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
