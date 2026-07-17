import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { adminAuth } from "@/lib/firebase/firebase-admin";

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

    const currentSchedulePreference = userProfile.schedulePreference || {};

    // Always update schedulePreference.timezone
    const setQuery = {
      "schedulePreference.timezone": normalizedTimezone,
      "schedulePreference.windows": currentSchedulePreference.windows || [],
      "schedulePreference.isDefault": typeof currentSchedulePreference.isDefault === "boolean" ? currentSchedulePreference.isDefault : true
    };

    let streakTimezoneUpdated = false;
    const currentStreak = userProfile.streak || {};

    // Update streak.timezone only when conservatively safe
    const hasCurrentCount = currentStreak.currentCount > 0;
    const hasLongestCount = currentStreak.longestCount > 0;
    const hasCompletedDate = currentStreak.lastCompletedDateLocal != null;
    const hasActiveEarnBack = currentStreak.earnBack?.active === true;

    if (!hasCurrentCount && !hasLongestCount && !hasCompletedDate && !hasActiveEarnBack) {
      setQuery["streak.timezone"] = normalizedTimezone;
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
