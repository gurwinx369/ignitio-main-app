import { LessonCompletion } from "@/models/v2/lesson.completion.model";
import { UserProfile } from "@/models/v2/user.profile.model";

/**
 * Returns a YYYY-MM-DD string for a given Date and IANA timezone.
 * Uses formatToParts to avoid locale-specific formatting issues.
 */
export function getLocalDateString(date, timezone) {
  let tz = timezone;
  if (!tz || typeof tz !== "string") {
    tz = "Asia/Kolkata";
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    if (!year || !month || !day) {
      throw new Error("Missing date parts");
    }

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn(`[StreakService] Invalid timezone ${timezone}, falling back to Asia/Kolkata`, error);
    // Fallback if timezone is invalid
    const fallbackFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fallbackFormatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD strings.
 */
export function getLocalDaysDifference(dateStr1, dateStr2) {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);

  // Use UTC to avoid daylight saving time jumps affecting day count
  const dObj1 = Date.UTC(y1, m1 - 1, d1);
  const dObj2 = Date.UTC(y2, m2 - 1, d2);

  const diffMs = dObj2 - dObj1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds a given number of calendar days to a YYYY-MM-DD string and returns a new YYYY-MM-DD string.
 */
export function addLocalDays(localDateString, days) {
  const [y, m, d] = localDateString.split("-").map(Number);
  const dObj = new Date(Date.UTC(y, m - 1, d + days));
  const newY = dObj.getUTCFullYear();
  const newM = String(dObj.getUTCMonth() + 1).padStart(2, "0");
  const newD = String(dObj.getUTCDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
}

/**
 * Main function to update a user's streak upon completing a level.
 */
export async function updateStreakOnLevelCompletion({ userProfile, roadmapSlug, levelId }) {
  const nowUTC = new Date();
  
  // Ensure streak object exists
  const streak = userProfile.streak || {
    currentCount: 0,
    longestCount: 0,
    lastCompletedDateLocal: null,
    timezone: "Asia/Kolkata",
    freezeBank: 0,
    onboardingGraceUsed: false,
    onboardingStartDate: null,
    earnBack: {
      active: false,
      deadline: null,
      lessonsCompletedInWindow: 0,
      countAtRisk: 0,
    },
  };
  
  if (!streak.earnBack) {
    streak.earnBack = {
      active: false,
      deadline: null,
      lessonsCompletedInWindow: 0,
      countAtRisk: 0,
    };
  }

  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);

  // 1. Insert LessonCompletion idempotently
  try {
    await LessonCompletion.create({
      userId: userProfile._id,
      firebaseUID: userProfile.firebaseUID,
      roadmapSlug,
      levelId,
      completedAtUTC: nowUTC,
      completedDateLocal: todayLocal,
      timezone,
    });
  } catch (err) {
    // 11000 is MongoDB duplicate key error. If this exact level was already completed, do nothing.
    if (err.code === 11000) {
      return getStreakSummary(streak, todayLocal);
    }
    throw err;
  }

  // 2. Handle earn-back BEFORE same-day early return.
  // When earn-back is active, lastCompletedDateLocal is already set to todayLocal
  // and lessonsCompletedInWindow = 1. A second different level on the same day
  // must still count toward recovery.
  let shouldIncrement = false;
  let didReset = false;
  let earnBackActive = streak.earnBack.active;
  
  if (earnBackActive) {
    // Check if earnBack window expired
    if (streak.earnBack.deadline && nowUTC > new Date(streak.earnBack.deadline)) {
      // Expired: reset to 1
      streak.currentCount = 1;
      streak.earnBack.active = false;
      streak.earnBack.deadline = null;
      streak.earnBack.lessonsCompletedInWindow = 0;
      streak.earnBack.countAtRisk = 0;
      streak.lastCompletedDateLocal = todayLocal;
      didReset = true;
      earnBackActive = false;
    } else {
      // Still active window
      streak.earnBack.lessonsCompletedInWindow += 1;
      if (streak.earnBack.lessonsCompletedInWindow >= 2) {
        // Recovered!
        streak.currentCount = streak.earnBack.countAtRisk + 1;
        streak.earnBack.active = false;
        streak.earnBack.deadline = null;
        streak.earnBack.lessonsCompletedInWindow = 0;
        streak.earnBack.countAtRisk = 0;
        streak.lastCompletedDateLocal = todayLocal;
        
        // Check for freeze bank increment
        if (streak.currentCount % 6 === 0 && streak.freezeBank < 2) {
          streak.freezeBank += 1;
        }
      }
      shouldIncrement = false; // We handled the count update above

      // Update longest count
      if (streak.currentCount > streak.longestCount) {
        streak.longestCount = streak.currentCount;
      }

      // Persist and return — earn-back path is fully handled.
      await UserProfile.updateOne(
        { _id: userProfile._id },
        { $set: { streak } },
        { timestamps: false }
      );

      return getStreakSummary(streak, todayLocal);
    }
  }

  // 3. Normal same-day early return (earn-back is NOT active here).
  if (streak.lastCompletedDateLocal === todayLocal) {
    // Already incremented streak today
    return getStreakSummary(streak, todayLocal);
  }

  if (!earnBackActive && !didReset) {
    if (!streak.lastCompletedDateLocal) {
      // First ever completion
      streak.currentCount = 1;
      streak.lastCompletedDateLocal = todayLocal;
      shouldIncrement = false; // already set to 1
    } else {
      const daysDiff = getLocalDaysDifference(streak.lastCompletedDateLocal, todayLocal);

      if (daysDiff === 1) {
        shouldIncrement = true;
      } else if (daysDiff > 1) {
        // Missed days. Check if covered by onboarding grace or freeze bank.
        let missedDays = daysDiff - 1;
        
        // The first missed date is the day after lastCompletedDateLocal.
        // Grace eligibility must be checked against this date, not todayLocal,
        // because the user may return after the onboarding window even though
        // the actual miss occurred inside it.
        const missedDateLocal = addLocalDays(streak.lastCompletedDateLocal, 1);

        let isGraceEligible = false;
        if (!streak.onboardingGraceUsed && streak.onboardingStartDate) {
          const daysSinceOnboardingStart = getLocalDaysDifference(streak.onboardingStartDate, missedDateLocal);
          if (daysSinceOnboardingStart >= 0 && daysSinceOnboardingStart < 7) {
            isGraceEligible = true;
          }
        }

        // Grace covers exactly 1 missed day. Each freezeBank unit covers 1 missed day.
        // Coverage must be enough for ALL missedDays, or none are consumed.
        const graceCoverage = isGraceEligible ? 1 : 0;
        const availableCoverage = graceCoverage + streak.freezeBank;

        if (availableCoverage >= missedDays) {
          let remainingMissedDays = missedDays;

          // Consume grace first (product rule: grace before freeze).
          if (isGraceEligible) {
            streak.onboardingGraceUsed = true;
            remainingMissedDays -= 1;
          }

          // Consume freeze for any remaining missed days.
          if (remainingMissedDays > 0) {
            streak.freezeBank -= remainingMissedDays;
          }

          shouldIncrement = true;
        } else {
          // Not covered. Enter Earn-Back state
          streak.earnBack.active = true;
          const deadline = new Date(nowUTC.getTime() + 48 * 60 * 60 * 1000); // +48 hours
          streak.earnBack.deadline = deadline;
          streak.earnBack.countAtRisk = streak.currentCount;
          streak.earnBack.lessonsCompletedInWindow = 1;
          streak.lastCompletedDateLocal = todayLocal;
          shouldIncrement = false;
        }
      }
    }
  }

  if (shouldIncrement) {
    streak.currentCount += 1;
    streak.lastCompletedDateLocal = todayLocal;
    
    // Increment freeze bank if multiple of 6
    if (streak.currentCount % 6 === 0 && streak.freezeBank < 2) {
      streak.freezeBank += 1;
    }
  }

  // Update longest count
  if (streak.currentCount > streak.longestCount) {
    streak.longestCount = streak.currentCount;
  }

  // Persist to DB
  await UserProfile.updateOne(
    { _id: userProfile._id },
    { $set: { streak } },
    { timestamps: false }
  );

  return getStreakSummary(streak, todayLocal);
}

export function getStreakSummary(streak, todayLocal) {
  let status = "active";
  if (streak.earnBack?.active) {
    status = "at_risk";
  } else if (streak.lastCompletedDateLocal === todayLocal) {
    status = "completed_today";
  }

  return {
    currentCount: streak.currentCount,
    longestCount: streak.longestCount,
    lastCompletedDateLocal: streak.lastCompletedDateLocal,
    todayCompleted: streak.lastCompletedDateLocal === todayLocal,
    freezeBank: streak.freezeBank,
    status,
    earnBack: streak.earnBack,
  };
}
