import { LessonCompletion } from "@/models/v2/lesson.completion.model";
import { UserProfile } from "@/models/v2/user.profile.model";

// ─────────────────────────────────────────────────────────────────────────────
// STREAK CONSTANTS
// Single source of truth for all streak tuning values.
// ─────────────────────────────────────────────────────────────────────────────
export const STREAK_CONFIG = {
  FREEZE_EVERY_N_DAYS: 6,
  MAX_FREEZE_BANK: 2,
  EARN_BACK_WINDOW_HOURS: 48,
  EARN_BACK_REQUIRED_LESSONS: 2,
  ONBOARDING_GRACE_DAYS: 7,
};

// ─────────────────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

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
 * Positive means dateStr2 is later than dateStr1.
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
 * Adds a given number of calendar days to a YYYY-MM-DD string.
 */
export function addLocalDays(localDateString, days) {
  const [y, m, d] = localDateString.split("-").map(Number);
  const dObj = new Date(Date.UTC(y, m - 1, d + days));
  const newY = dObj.getUTCFullYear();
  const newM = String(dObj.getUTCMonth() + 1).padStart(2, "0");
  const newD = String(dObj.getUTCDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FREEZE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function getActiveFreezeCredits(streak, nowUTC) {
  if (!streak.freezeCredits) return [];
  return streak.freezeCredits.filter(
    (c) => !c.usedAtUTC && new Date(c.expiresAtUTC) > nowUTC
  );
}

export function getActiveFreezeCount(streak, nowUTC) {
  return getActiveFreezeCredits(streak, nowUTC).length;
}

/**
 * Syncs freezeBank integer to the count of active (unexpired, unused) freeze credits.
 * Always call this before persisting streak.
 */
export function syncFreezeBank(streak, nowUTC) {
  streak.freezeBank = getActiveFreezeCount(streak, nowUTC);
}

/**
 * Earns a freeze credit if the current streak count is a multiple of FREEZE_EVERY_N_DAYS
 * and the bank has capacity.
 */
export function earnFreezeIfEligible(streak, nowUTC, todayLocal) {
  if (
    streak.currentCount > 0 &&
    streak.currentCount % STREAK_CONFIG.FREEZE_EVERY_N_DAYS === 0
  ) {
    const activeCount = getActiveFreezeCount(streak, nowUTC);
    if (activeCount < STREAK_CONFIG.MAX_FREEZE_BANK) {
      if (!streak.freezeCredits) streak.freezeCredits = [];
      const alreadyEarned = streak.freezeCredits.some(
        (c) => c.earnedForStreakCount === streak.currentCount
      );
      if (!alreadyEarned) {
        const expiresAt = new Date(
          nowUTC.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        streak.freezeCredits.push({
          earnedAtUTC: nowUTC,
          earnedDateLocal: todayLocal,
          expiresAtUTC: expiresAt,
          usedAtUTC: null,
          usedForDateLocal: null,
          earnedForStreakCount: streak.currentCount,
        });
        syncFreezeBank(streak, nowUTC);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LAZY MISS DETECTION — PRIMARY ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates the streak state lazily (on app open or lesson start).
 * Per spec: miss detection is NOT a cron job. It runs when the user opens the app
 * or completes a lesson.
 *
 * This function MAY persist to MongoDB if a state transition occurs.
 * It mutates `userProfile.streak` in-place.
 *
 * Transitions handled:
 * 1. earnBack expired → reset to 0
 * 2. Missed days → consume grace → consume freezes → enter earn-back
 *
 * @param {object} userProfile  - Mongoose document (not lean)
 * @param {Date}   nowUTC       - Current UTC time
 * @returns {boolean} true if a state change was persisted, false otherwise
 */
export async function evaluateAndApplyLazyStreakState(userProfile, nowUTC) {
  const streak = userProfile.streak;
  if (!streak) return false;

  // Ensure required sub-objects exist
  if (!streak.earnBack) {
    streak.earnBack = {
      active: false,
      deadline: null,
      lessonsCompletedInWindow: 0,
      countAtRisk: 0,
    };
  }
  if (!streak.freezeCredits) streak.freezeCredits = [];

  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);

  // No streak history yet — nothing to evaluate
  if (!streak.lastCompletedDateLocal) return false;

  // ── Case 1: earnBack is active — check if it has expired ──────────────────
  if (streak.earnBack.active) {
    const deadline = streak.earnBack.deadline
      ? new Date(streak.earnBack.deadline)
      : null;

    if (deadline && nowUTC > deadline) {
      // Earn-Back window expired without completing enough lessons → reset
      if (
        streak.earnBack.lessonsCompletedInWindow <
        STREAK_CONFIG.EARN_BACK_REQUIRED_LESSONS
      ) {
        streak.currentCount = 0;
        streak.earnBack.active = false;
        streak.earnBack.deadline = null;
        streak.earnBack.lessonsCompletedInWindow = 0;
        streak.earnBack.countAtRisk = 0;
        // longestCount intentionally preserved
        syncFreezeBank(streak, nowUTC);

        await UserProfile.updateOne(
          { _id: userProfile._id },
          { $set: { streak } },
          { timestamps: false }
        );
        return true;
      }
    }
    // Earn-Back still within window — do not re-trigger miss detection
    return false;
  }

  // ── Case 2: Same day or yesterday — no miss ────────────────────────────────
  const daysDiff = getLocalDaysDifference(streak.lastCompletedDateLocal, todayLocal);

  if (daysDiff <= 1) return false;

  // ── Case 3: Missed ≥1 local calendar day ──────────────────────────────────
  let missedDays = daysDiff - 1; // e.g. diff=2 means 1 missed day
  let didChange = false;

  // Process missed days one by one: grace → freeze → earn-back
  while (missedDays > 0) {
    const missedDate = addLocalDays(streak.lastCompletedDateLocal, 1);

    // A. Onboarding grace — covers one missed day, auto-consumed
    const graceAvailable =
      !streak.onboardingGraceUsed &&
      streak.onboardingStartDate &&
      getLocalDaysDifference(streak.onboardingStartDate, missedDate) >= 0 &&
      getLocalDaysDifference(streak.onboardingStartDate, missedDate) <
        STREAK_CONFIG.ONBOARDING_GRACE_DAYS;

    if (graceAvailable) {
      streak.onboardingGraceUsed = true;
      streak.lastCompletedDateLocal = missedDate;
      missedDays -= 1;
      didChange = true;
      continue;
    }

    // B. Freeze — consume one from the bank for one missed day
    if (streak.freezeBank > 0) {
      // Mark the oldest-expiring active freeze credit as used
      const activeFreezes = getActiveFreezeCredits(streak, nowUTC);
      if (activeFreezes.length > 0) {
        activeFreezes.sort(
          (a, b) => new Date(a.expiresAtUTC) - new Date(b.expiresAtUTC)
        );
        activeFreezes[0].usedAtUTC = nowUTC;
        activeFreezes[0].usedForDateLocal = missedDate;
      }
      streak.lastCompletedDateLocal = missedDate;
      syncFreezeBank(streak, nowUTC); // recompute freezeBank from credits
      missedDays -= 1;
      didChange = true;
      continue;
    }

    // C. No grace, no freeze — enter Earn-Back for remaining missed days
    if (!streak.earnBack.active) {
      const deadline = new Date(
        nowUTC.getTime() +
          STREAK_CONFIG.EARN_BACK_WINDOW_HOURS * 60 * 60 * 1000
      );
      streak.earnBack.active = true;
      streak.earnBack.deadline = deadline;
      streak.earnBack.lessonsCompletedInWindow = 0;
      streak.earnBack.countAtRisk = streak.currentCount;
      didChange = true;
    }
    // Stop processing further missed days once earn-back is entered
    break;
  }

  if (didChange) {
    syncFreezeBank(streak, nowUTC);
    await UserProfile.updateOne(
      { _id: userProfile._id },
      { $set: { streak } },
      { timestamps: false }
    );
  }

  return didChange;
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY COMPLETION CHECK
// ─────────────────────────────────────────────────────────────────────────────

export async function hasTodayLessonCompletion(userId, todayLocal) {
  const completion = await LessonCompletion.findOne({
    userId,
    completedDateLocal: todayLocal,
  }).lean();
  return !!completion;
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK UPDATE ON LESSON COMPLETION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called when a user completes a level.
 * Internally runs lazy miss detection before processing the completion.
 *
 * @param {object} params
 * @param {object} params.userProfile - Mongoose document (not lean)
 * @param {string} params.roadmapSlug
 * @param {string} params.levelId
 */
export async function updateStreakOnLevelCompletion({
  userProfile,
  roadmapSlug,
  levelId,
}) {
  const nowUTC = new Date();

  // Ensure streak object is initialised
  const streak = userProfile.streak || {
    currentCount: 0,
    longestCount: 0,
    lastCompletedDateLocal: null,
    timezone: "Asia/Kolkata",
    freezeBank: 0,
    freezeCredits: [],
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
  if (!streak.freezeCredits) streak.freezeCredits = [];
  userProfile.streak = streak;

  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);

  // ── Step 1: Run lazy miss detection first ──────────────────────────────────
  // This may mutate userProfile.streak and persist to DB.
  await evaluateAndApplyLazyStreakState(userProfile, nowUTC);
  // Re-read streak after potential mutation (it was mutated in-place on the document)

  // ── Step 2: Insert LessonCompletion idempotently ───────────────────────────
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
    // 11000 = duplicate key — this exact level was already completed, return current state
    if (err.code === 11000) {
      syncFreezeBank(streak, nowUTC);
      return getStreakSummary(streak, todayLocal, nowUTC);
    }
    throw err;
  }

  // ── Step 3: Apply the completion ───────────────────────────────────────────

  // Case A: Earn-Back is active — count this lesson toward the recovery window
  if (streak.earnBack.active) {
    const deadline = streak.earnBack.deadline
      ? new Date(streak.earnBack.deadline)
      : null;

    if (deadline && nowUTC > deadline) {
      // Earn-Back expired just before this completion arrived; treat as fresh start
      streak.currentCount = 1;
      streak.lastCompletedDateLocal = todayLocal;
      streak.earnBack.active = false;
      streak.earnBack.deadline = null;
      streak.earnBack.lessonsCompletedInWindow = 0;
      streak.earnBack.countAtRisk = 0;
    } else {
      // Still within window
      streak.earnBack.lessonsCompletedInWindow += 1;

      if (
        streak.earnBack.lessonsCompletedInWindow >=
        STREAK_CONFIG.EARN_BACK_REQUIRED_LESSONS
      ) {
        // Recovered! Restore streak + 1
        streak.currentCount = streak.earnBack.countAtRisk + 1;
        streak.lastCompletedDateLocal = todayLocal;
        streak.earnBack.active = false;
        streak.earnBack.deadline = null;
        streak.earnBack.lessonsCompletedInWindow = 0;
        streak.earnBack.countAtRisk = 0;
        earnFreezeIfEligible(streak, nowUTC, todayLocal);
      }
      // else: still in earn-back, waiting for second lesson
    }
  }
  // Case B: Normal daily streak increment
  else if (streak.lastCompletedDateLocal !== todayLocal) {
    if (!streak.lastCompletedDateLocal) {
      // First ever completion
      streak.currentCount = 1;
      streak.lastCompletedDateLocal = todayLocal;
    } else {
      const daysDiff = getLocalDaysDifference(
        streak.lastCompletedDateLocal,
        todayLocal
      );

      if (daysDiff === 1) {
        // Consecutive day
        streak.currentCount += 1;
        streak.lastCompletedDateLocal = todayLocal;
        earnFreezeIfEligible(streak, nowUTC, todayLocal);
      }
      // daysDiff > 1 should have been resolved by evaluateAndApplyLazyStreakState above.
      // If we still get here it means we entered earn-back; the earn-back branch above
      // already handled it.
    }
  }
  // Case C: Same day — no increment (idempotent)

  // ── Step 4: Update longestCount ────────────────────────────────────────────
  if (streak.currentCount > streak.longestCount) {
    streak.longestCount = streak.currentCount;
  }

  syncFreezeBank(streak, nowUTC);

  // ── Step 5: Persist ────────────────────────────────────────────────────────
  await UserProfile.updateOne(
    { _id: userProfile._id },
    { $set: { streak } },
    { timestamps: false }
  );

  return getStreakSummary(streak, todayLocal, nowUTC);
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK SUMMARY — SAFE READ-ONLY PROJECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a safe, serializable streak summary.
 * Does NOT mutate state. Call evaluateAndApplyLazyStreakState before this
 * when lazy detection is needed.
 *
 * Status values:
 *   "inactive"        — no streak history
 *   "completed_today" — last completed date == today
 *   "pending_today"   — last completed date == yesterday
 *   "at_risk"         — earnBack.active && countAtRisk > 0
 *   "reset"           — earnBack was active but expired and count was reset
 *   "active"          — some streak but nothing notable
 *
 * @param {object} streak
 * @param {string} todayLocal  - YYYY-MM-DD in user's timezone
 * @param {Date}   [nowUTC]
 */
export function getStreakSummary(streak, todayLocal, nowUTC = null) {
  if (!nowUTC) nowUTC = new Date();

  if (!streak || !streak.lastCompletedDateLocal) {
    return {
      currentCount: 0,
      longestCount: streak?.longestCount || 0,
      lastCompletedDateLocal: null,
      todayCompleted: false,
      freezeBank: streak?.freezeBank || 0,
      status: "inactive",
      earnBack: {
        active: false,
        deadline: null,
        lessonsCompletedInWindow: 0,
        countAtRisk: 0,
        lessonsRemaining: STREAK_CONFIG.EARN_BACK_REQUIRED_LESSONS,
      },
    };
  }

  let status = "active";
  const earnBackData = streak.earnBack || {
    active: false,
    deadline: null,
    lessonsCompletedInWindow: 0,
    countAtRisk: 0,
  };

  if (earnBackData.active && earnBackData.countAtRisk > 0) {
    // earnBack must have a positive countAtRisk to be "at_risk"
    status = "at_risk";
  } else if (streak.lastCompletedDateLocal === todayLocal) {
    status = "completed_today";
  } else {
    const daysDiff = getLocalDaysDifference(
      streak.lastCompletedDateLocal,
      todayLocal
    );
    if (daysDiff === 1) {
      status = "pending_today";
    } else if (daysDiff > 1 && streak.currentCount === 0) {
      // Was previously reset (earn-back expired and cleared)
      status = "reset";
    }
    // else: active with some older last date — rare edge case, stays "active"
  }

  const lessonsCompleted = earnBackData.lessonsCompletedInWindow || 0;
  const lessonsRemaining = Math.max(
    0,
    STREAK_CONFIG.EARN_BACK_REQUIRED_LESSONS - lessonsCompleted
  );

  return {
    currentCount: streak.currentCount || 0,
    longestCount: streak.longestCount || 0,
    lastCompletedDateLocal: streak.lastCompletedDateLocal,
    todayCompleted: streak.lastCompletedDateLocal === todayLocal,
    freezeBank: getActiveFreezeCount(streak, nowUTC),
    status,
    earnBack: {
      active: earnBackData.active && earnBackData.countAtRisk > 0,
      deadline: earnBackData.deadline || null,
      lessonsCompletedInWindow: lessonsCompleted,
      countAtRisk: earnBackData.countAtRisk || 0,
      lessonsRemaining,
    },
  };
}

/**
 * Builds a weekly streak calendar display array (Sunday to Saturday).
 * Pure function based on current local date and provided completions.
 */
export function buildWeeklyStreakCalendar({ userProfile, nowUTC, completions }) {
  const streak = userProfile.streak || {};
  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);
  
  const [y, m, d] = todayLocal.split("-").map(Number);
  const todayObj = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = todayObj.getUTCDay(); // 0 = Sunday
  
  const weekStartLocal = addLocalDays(todayLocal, -dayOfWeek);
  
  const week = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 0; i < 7; i++) {
    const dateLocal = addLocalDays(weekStartLocal, i);
    const dayLabel = dayLabels[i];
    const isToday = dateLocal === todayLocal;
    
    const completedCount = completions.filter(c => c.completedDateLocal === dateLocal).length;
    
    // Exact freeze usage matching per requirements
    const freezeUsed = streak.freezeCredits?.some(fc => fc.usedForDateLocal === dateLocal) || false;
    
    let status = "missed";
    const diff = getLocalDaysDifference(todayLocal, dateLocal); // positive if dateLocal > todayLocal
    
    if (diff > 0) {
      status = "future";
    } else if (completedCount > 0 && isToday) {
      status = "today_done";
    } else if (completedCount > 0 && diff < 0) {
      status = "completed";
    } else if (completedCount === 0 && freezeUsed) {
      status = "freeze_used";
    } else if (completedCount === 0 && isToday) {
      status = "today_pending";
    } else if (completedCount === 0 && diff < 0) {
      status = "missed";
    }
    
    week.push({
      dateLocal,
      dayLabel,
      status,
      completedCount,
      isToday,
    });
  }
  
  return week;
}
