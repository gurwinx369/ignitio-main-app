import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { verifyFirebaseToken } from "@/lib/auth";
import { 
  getLocalDateString, 
  getLocalDaysDifference, 
  addLocalDays, 
  getActiveFreezeCredits, 
  syncFreezeBank, 
  getStreakSummary,
  hasTodayLessonCompletion,
  earnFreezeIfEligible
} from "@/lib/users/streak.service";

export async function POST(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const userProfile = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const nowUTC = new Date();
    const streak = userProfile.streak || {};
    const timezone = streak.timezone || "Asia/Kolkata";
    const todayLocal = getLocalDateString(nowUTC, timezone);

    if (!streak.lastCompletedDateLocal) {
      return NextResponse.json({ message: "No streak started yet." }, { status: 409 });
    }

    const missedDays = getLocalDaysDifference(streak.lastCompletedDateLocal, todayLocal) - 1;
    
    // If not missed anything, or just missed today which isn't missed until tomorrow, just return current summary
    if (missedDays <= 0) {
      return NextResponse.json({
        ok: true,
        streak: getStreakSummary(streak, todayLocal, nowUTC)
      }, { status: 200 });
    }

    const activeFreezes = getActiveFreezeCredits(streak, nowUTC);
    if (activeFreezes.length < missedDays) {
      return NextResponse.json({ 
        message: "Not enough active freezes to recover your streak." 
      }, { status: 409 });
    }

    // Build missed dates array
    const missedDates = [];
    for (let i = 1; i <= missedDays; i++) {
      missedDates.push(addLocalDays(streak.lastCompletedDateLocal, i));
    }

    // Consume oldest-expiring freeze credits first
    activeFreezes.sort((a, b) => new Date(a.expiresAtUTC) - new Date(b.expiresAtUTC));
    
    for (let i = 0; i < missedDays; i++) {
      const freeze = activeFreezes[i];
      freeze.usedAtUTC = nowUTC;
      freeze.usedForDateLocal = missedDates[i];
    }

    // Advance lastCompletedDateLocal to the final covered missed date
    streak.lastCompletedDateLocal = missedDates[missedDates.length - 1];

    // Check if there is a LessonCompletion for today Local
    const hasCompletedToday = await hasTodayLessonCompletion(userProfile._id, todayLocal);
    
    if (hasCompletedToday) {
      streak.currentCount += 1;
      streak.lastCompletedDateLocal = todayLocal;
      earnFreezeIfEligible(streak, nowUTC, todayLocal);
      
      if (streak.currentCount > streak.longestCount) {
        streak.longestCount = streak.currentCount;
      }
    }

    // Clear any earn-back active state since we manually recovered
    if (streak.earnBack) {
      streak.earnBack.active = false;
      streak.earnBack.deadline = null;
      streak.earnBack.lessonsCompletedInWindow = 0;
      streak.earnBack.countAtRisk = 0;
    }

    syncFreezeBank(streak, nowUTC);

    await UserProfile.updateOne(
      { _id: userProfile._id },
      { $set: { streak } },
      { timestamps: false }
    );

    return NextResponse.json({
      ok: true,
      streak: getStreakSummary(streak, todayLocal, nowUTC)
    }, { status: 200 });

  } catch (err) {
    console.error("[POST /api/v2/streak/recover] Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
