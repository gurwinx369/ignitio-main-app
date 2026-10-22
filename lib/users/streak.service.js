import { isValidObjectId } from "mongoose";

import { LessonCompletion } from "../../models/v2/lesson.completion.model.js";
import { UserProfile } from "../../models/v2/user.profile.model.js";
import {
  reconcileCompletedStreakDay,
} from "./streak.history.service.js";

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
    const formatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );

    const parts =
      formatter.formatToParts(date);

    const year =
      parts.find(
        (p) => p.type === "year",
      )?.value;

    const month =
      parts.find(
        (p) => p.type === "month",
      )?.value;

    const day =
      parts.find(
        (p) => p.type === "day",
      )?.value;

    if (
      !year ||
      !month ||
      !day
    ) {
      throw new Error(
        "Missing date parts",
      );
    }

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn(
      `[StreakService] Invalid timezone ${timezone}, falling back to Asia/Kolkata`,
      error,
    );

    const fallbackFormatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );

    const parts =
      fallbackFormatter
        .formatToParts(date);

    const year =
      parts.find(
        (p) => p.type === "year",
      )?.value;

    const month =
      parts.find(
        (p) => p.type === "month",
      )?.value;

    const day =
      parts.find(
        (p) => p.type === "day",
      )?.value;

    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD strings.
 * Positive means dateStr2 is later than dateStr1.
 */
export function getLocalDaysDifference(
  dateStr1,
  dateStr2,
) {
  const [y1, m1, d1] =
    dateStr1
      .split("-")
      .map(Number);

  const [y2, m2, d2] =
    dateStr2
      .split("-")
      .map(Number);

  const dObj1 =
    Date.UTC(
      y1,
      m1 - 1,
      d1,
    );

  const dObj2 =
    Date.UTC(
      y2,
      m2 - 1,
      d2,
    );

  const diffMs =
    dObj2 - dObj1;

  return Math.round(
    diffMs /
    (
      1000 *
      60 *
      60 *
      24
    ),
  );
}

/**
 * Adds a given number of calendar days to a YYYY-MM-DD string.
 */
export function addLocalDays(
  localDateString,
  days,
) {
  const [y, m, d] =
    localDateString
      .split("-")
      .map(Number);

  const dObj =
    new Date(
      Date.UTC(
        y,
        m - 1,
        d + days,
      ),
    );

  const newY =
    dObj.getUTCFullYear();

  const newM =
    String(
      dObj.getUTCMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const newD =
    String(
      dObj.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  return `${newY}-${newM}-${newD}`;
}

/**
 * Returns true when the streak contains evidence of an established
 * streak lifecycle.
 *
 * onboardingStartDate alone is intentionally NOT history.
 */
export function hasStreakHistory(
  streak,
) {
  if (!streak) {
    return false;
  }

  return Boolean(
    streak.currentCount > 0 ||
    streak.longestCount > 0 ||
    streak.lastCompletedDateLocal ||
    (
      streak.freezeCredits
        ?.length ??
      0
    ) > 0 ||
    streak.onboardingGraceUsed ===
    true ||
    streak.earnBack?.active ===
    true ||
    streak.earnBack?.deadline ||
    streak.earnBack
      ?.lessonsCompletedInWindow >
    0 ||
    streak.earnBack
      ?.countAtRisk >
    0,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FREEZE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function getActiveFreezeCredits(
  streak,
  nowUTC,
) {
  if (
    !streak.freezeCredits
  ) {
    return [];
  }

  return streak
    .freezeCredits
    .filter(
      (c) =>
        !c.usedAtUTC &&
        new Date(
          c.expiresAtUTC,
        ) > nowUTC,
    );
}

export function getActiveFreezeCount(
  streak,
  nowUTC,
) {
  return getActiveFreezeCredits(
    streak,
    nowUTC,
  ).length;
}

/**
 * Syncs freezeBank integer to the count of active
 * (unexpired, unused) freeze credits.
 */
export function syncFreezeBank(
  streak,
  nowUTC,
) {
  if (!streak) return;

  if (!Array.isArray(streak.freezeCredits)) {
    streak.freezeCredits = [];
  }

  // Defensive backfill: If legacy or manually awarded freezeBank > 0 exists without credits,
  // create active freezeCredits rather than wiping out the user's available shield.
  if (
    typeof streak.freezeBank === "number" &&
    streak.freezeBank > 0 &&
    getActiveFreezeCount(streak, nowUTC) === 0
  ) {
    const expiresAt = new Date(nowUTC.getTime() + 7 * 24 * 60 * 60 * 1000);
    const countToBackfill = Math.min(
      STREAK_CONFIG.MAX_FREEZE_BANK,
      Math.max(1, Math.floor(streak.freezeBank)),
    );
    for (let i = 0; i < countToBackfill; i++) {
      streak.freezeCredits.push({
        earnedAtUTC: nowUTC,
        earnedDateLocal: streak.lastCompletedDateLocal || "2026-01-01",
        expiresAtUTC: expiresAt,
        earnedForStreakCount: streak.currentCount || 0,
        usedAtUTC: null,
        usedForDateLocal: null,
      });
    }
  }

  streak.freezeBank =
    getActiveFreezeCount(
      streak,
      nowUTC,
    );
}

/**
 * Earns a freeze credit if the current streak count is a multiple of
 * FREEZE_EVERY_N_DAYS and the bank has capacity.
 */
export function earnFreezeIfEligible(
  streak,
  nowUTC,
  todayLocal,
) {
  if (
    streak.currentCount > 0 &&
    streak.currentCount %
    STREAK_CONFIG
      .FREEZE_EVERY_N_DAYS ===
    0
  ) {
    const activeCount =
      getActiveFreezeCount(
        streak,
        nowUTC,
      );

    if (
      activeCount <
      STREAK_CONFIG
        .MAX_FREEZE_BANK
    ) {
      if (
        !streak.freezeCredits
      ) {
        streak.freezeCredits =
          [];
      }

      const alreadyEarned =
        streak
          .freezeCredits
          .some(
            (c) =>
              c.earnedForStreakCount ===
              streak.currentCount &&
              c.earnedDateLocal ===
              todayLocal,
          );

      if (!alreadyEarned) {
        const expiresAt =
          new Date(
            nowUTC.getTime() +
            7 *
            24 *
            60 *
            60 *
            1000,
          );

        streak
          .freezeCredits
          .push({
            earnedAtUTC:
              nowUTC,

            earnedDateLocal:
              todayLocal,

            expiresAtUTC:
              expiresAt,

            usedAtUTC:
              null,

            usedForDateLocal:
              null,

            earnedForStreakCount:
              streak.currentCount,
          });

        syncFreezeBank(
          streak,
          nowUTC,
        );
      }
    }
  }
}

export function isEarnBackWindowActive(
  earnBack,
  nowUTC = new Date(),
) {
  if (
    !earnBack?.active ||
    !(
      earnBack.countAtRisk >
      0
    ) ||
    !earnBack.deadline
  ) {
    return false;
  }

  const deadline =
    new Date(
      earnBack.deadline,
    );

  if (
    Number.isNaN(
      deadline.getTime(),
    )
  ) {
    return false;
  }

  return nowUTC <= deadline;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMANENT HISTORY OUTBOX
// ─────────────────────────────────────────────────────────────────────────────

function queuePendingStreakHistoryEvent(
  streak,
  {
    dateLocal,
    timezone,
    status,
  },
) {
  if (
    !Array.isArray(
      streak.historyPending,
    )
  ) {
    streak.historyPending = [];
  }

  /*
   * Lifecycle evaluation is retryable.
   *
   * Do not enqueue the exact same lifecycle event more than once.
   * Different statuses for the same date remain valid because a
   * "missed" date may later transition to "earnback_recovered".
   */
  const alreadyPending =
    streak.historyPending.some(
      (event) =>
        event?.dateLocal ===
        dateLocal &&
        event?.status ===
        status,
    );

  if (alreadyPending) {
    return false;
  }

  streak.historyPending.push({
    dateLocal,
    timezone,
    status,
  });

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAZY MISS DETECTION
// ─────────────────────────────────────────────────────────────────────────────

export async function evaluateAndApplyLazyStreakState(
  userProfile,
  nowUTC,
  {
    reconcileEstablishedStreak =
    false,
  } = {},
) {
  const sourceStreak =
    userProfile.streak;

  if (!sourceStreak) {
    return false;
  }

  /*
   * Build a CAS filter from the state this request actually read.
   *
   * If another request changes a state-machine anchor before this
   * request persists, Mongo rejects this stale write.
   */
  const casFilter = {
    _id:
      userProfile._id,

    "streak.currentCount":
      sourceStreak
        .currentCount,

    "streak.lastCompletedDateLocal":
      sourceStreak
        .lastCompletedDateLocal,
  };

  if (
    sourceStreak
      .freezeBank !==
    undefined
  ) {
    casFilter[
      "streak.freezeBank"
    ] =
      sourceStreak
        .freezeBank;
  }

  if (
    sourceStreak
      .onboardingGraceUsed !==
    undefined
  ) {
    casFilter[
      "streak.onboardingGraceUsed"
    ] =
      sourceStreak
        .onboardingGraceUsed;
  }

  if (
    sourceStreak
      .onboardingGraceUsedForDateLocal !==
    undefined
  ) {
    casFilter[
      "streak.onboardingGraceUsedForDateLocal"
    ] =
      sourceStreak
        .onboardingGraceUsedForDateLocal ??
      null;
  }

  /*
 * Protect the durable history outbox from stale whole-streak writes.
 *
 * evaluateAndApplyLazyStreakState() eventually persists with:
 *
 *   $set: { streak }
 *
 * so a concurrent:
 *
 *   $push historyPending
 *   $pull historyPending
 *
 * must invalidate this request's CAS. Otherwise this stale snapshot
 * could overwrite the newer outbox state.
 *
 * Empty/missing are treated as the same legacy-safe starting state:
 *
 * - old Mongo documents may not physically contain historyPending
 * - Mongoose may expose the schema default as []
 *
 * In either case, a concurrent non-empty append makes this filter fail.
 */
  const sourceHistoryPending =
    Array.isArray(
      sourceStreak.historyPending,
    )
      ? sourceStreak.historyPending
      : [];

  if (
    sourceHistoryPending.length ===
    0
  ) {
    /*
     * Accept either:
     *
     *   legacy document → field missing
     *   modern document → []
     *
     * but reject any concurrent append.
     */
    casFilter.$or = [
      {
        "streak.historyPending": {
          $exists: false,
        },
      },
      {
        "streak.historyPending": {
          $size: 0,
        },
      },
    ];
  } else {
    /*
     * For an existing non-empty outbox, require the exact array
     * snapshot that this request originally read.
     *
     * A concurrent append OR successful flusher $pull therefore
     * invalidates this stale whole-streak write.
     */
    casFilter[
      "streak.historyPending"
    ] =
      sourceHistoryPending.map(
        (event) =>
          typeof event?.toObject ===
            "function"
            ? event.toObject({
              depopulate: true,
            })
            : structuredClone(
              event,
            ),
      );
  }

  if (
    sourceStreak.earnBack
  ) {
    casFilter[
      "streak.earnBack.active"
    ] =
      sourceStreak
        .earnBack
        .active;

    casFilter[
      "streak.earnBack.deadline"
    ] =
      sourceStreak
        .earnBack
        .deadline ??
      null;

    casFilter[
      "streak.earnBack.lessonsCompletedInWindow"
    ] =
      sourceStreak
        .earnBack
        .lessonsCompletedInWindow ??
      0;

    casFilter[
      "streak.earnBack.countAtRisk"
    ] =
      sourceStreak
        .earnBack
        .countAtRisk ??
      0;

    if (
      sourceStreak
        .earnBack
        .missedDateLocal !==
      undefined
    ) {
      casFilter[
        "streak.earnBack.missedDateLocal"
      ] =
        sourceStreak
          .earnBack
          .missedDateLocal ??
        null;
    }

    if (
      sourceStreak
        .earnBack
        .lastResolution !==
      undefined
    ) {
      casFilter[
        "streak.earnBack.lastResolution"
      ] =
        sourceStreak
          .earnBack
          .lastResolution ??
        null;
    }
  }

  /*
   * Work on an isolated copy.
   */
  const streak =
    typeof sourceStreak
      .toObject ===
      "function"
      ? sourceStreak
        .toObject({
          depopulate:
            true,
        })
      : structuredClone(
        sourceStreak,
      );

  if (!streak.earnBack) {
    streak.earnBack = {
      active:
        false,

      deadline:
        null,

      lessonsCompletedInWindow:
        0,

      countAtRisk:
        0,

      missedDateLocal:
        null,

      lastResolution:
        null,
    };
  }

  if (
    streak
      .earnBack
      .missedDateLocal ===
    undefined
  ) {
    streak
      .earnBack
      .missedDateLocal =
      null;
  }

  if (
    streak
      .earnBack
      .lastResolution ===
    undefined
  ) {
    streak
      .earnBack
      .lastResolution =
      null;
  }

  if (
    streak
      .onboardingGraceUsedForDateLocal ===
    undefined
  ) {
    streak
      .onboardingGraceUsedForDateLocal =
      null;
  }

  /*
   * Legacy profiles may not have the newly-added outbox yet.
   */
  if (
    !Array.isArray(
      streak.historyPending,
    )
  ) {
    streak.historyPending = [];
  }

  if (
    !streak.freezeCredits
  ) {
    streak.freezeCredits =
      [];
  }

  /*
   * Persist streak + lifecycle history outbox together.
   */
  async function persistIfUnchanged() {
    const result =
      await UserProfile
        .updateOne(
          casFilter,
          {
            $set: {
              streak,
            },
          },
          {
            timestamps:
              false,
          },
        );

    if (
      result.matchedCount !==
      1
    ) {
      return false;
    }

    if (
      typeof sourceStreak
        .set ===
      "function"
    ) {
      sourceStreak.set(
        streak,
      );
    } else {
      for (
        const key of
        Object.keys(
          sourceStreak,
        )
      ) {
        delete sourceStreak[
          key
        ];
      }

      Object.assign(
        sourceStreak,
        structuredClone(
          streak,
        ),
      );
    }

    return true;
  }

  const timezone =
    streak.timezone ||
    "Asia/Kolkata";

  const todayLocal =
    getLocalDateString(
      nowUTC,
      timezone,
    );

  /*
  * Repair an established live streak when durable
  * LessonCompletion evidence proves a longer
  * consecutive run than UserProfile.streak.
  *
  * Monotonic only:
  * - never lowers currentCount
  * - never lowers longestCount
  * - never invents a newer completion date
  * - never interferes with active Earn-Back
  */
  let didRepairEstablishedStreak =
    false;

  if (
    reconcileEstablishedStreak &&
    isValidObjectId(userProfile._id) &&
    streak.currentCount > 0 &&
    streak.lastCompletedDateLocal &&
    streak.earnBack?.active !== true &&
    streak.earnBack?.lastResolution !==
    "expired"
  ) {
    const durableCompletionDates =
      await LessonCompletion.distinct(
        "completedDateLocal",
        {
          userId:
            userProfile._id,

          completedDateLocal: {
            $lte:
              streak
                .lastCompletedDateLocal,
          },
        },
      );

    const completionDates =
      Array.from(
        new Set(
          (
            Array.isArray(
              durableCompletionDates,
            )
              ? durableCompletionDates
              : []
          ).filter(
            (dateLocal) =>
              typeof dateLocal ===
              "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(
                dateLocal,
              ) &&
              dateLocal <=
              streak
                .lastCompletedDateLocal,
          ),
        ),
      ).sort();

    /*
     * Only use the durable run when it ends on the
     * already-established streak date.
     *
     * This means reconciliation can repair the count
     * but cannot advance lastCompletedDateLocal.
     */
    if (
      completionDates.at(-1) ===
      streak.lastCompletedDateLocal
    ) {
      let durableTrailingCount =
        1;

      for (
        let index =
          completionDates.length - 1;
        index > 0;
        index -= 1
      ) {
        const daysDifference =
          getLocalDaysDifference(
            completionDates[
            index - 1
            ],
            completionDates[index],
          );

        if (
          daysDifference !==
          1
        ) {
          break;
        }

        durableTrailingCount +=
          1;
      }

      if (
        durableTrailingCount >
        streak.currentCount
      ) {
        streak.currentCount =
          durableTrailingCount;

        streak.longestCount =
          Math.max(
            streak.longestCount ||
            0,
            durableTrailingCount,
          );

        didRepairEstablishedStreak =
          true;
      }
    }
  }

  if (
    !streak
      .lastCompletedDateLocal
  ) {
    return false;
  }

  // -------------------------------------------------------------------------
  // Case 1: Active Earn-Back expiry
  // -------------------------------------------------------------------------

  if (
    streak
      .earnBack
      .active
  ) {
    const deadline =
      streak
        .earnBack
        .deadline
        ? new Date(
          streak
            .earnBack
            .deadline,
        )
        : null;

    if (
      deadline &&
      nowUTC > deadline
    ) {
      if (
        streak
          .earnBack
          .lessonsCompletedInWindow <
        STREAK_CONFIG
          .EARN_BACK_REQUIRED_LESSONS
      ) {
        streak.currentCount =
          0;

        streak
          .earnBack
          .active =
          false;

        streak
          .earnBack
          .deadline =
          null;

        streak
          .earnBack
          .lessonsCompletedInWindow =
          0;

        streak
          .earnBack
          .countAtRisk =
          0;

        streak
          .earnBack
          .lastResolution =
          "expired";

        /*
         * missedDateLocal remains retained.
         *
         * A "missed" outbox event was already queued atomically when
         * this Earn-Back episode started, so expiry does not need a
         * second lifecycle-history event.
         */

        syncFreezeBank(
          streak,
          nowUTC,
        );

        return persistIfUnchanged();
      }
    }

    return false;
  }

  /*
   * A reset streak cannot open another Earn-Back merely because its
   * historical lastCompletedDateLocal is old.
   */
  if (
    streak.currentCount ===
    0
  ) {
    return false;
  }

  const daysDiff =
    getLocalDaysDifference(
      streak
        .lastCompletedDateLocal,
      todayLocal,
    );

  if (
    daysDiff <= 1
  ) {
    if (
      !didRepairEstablishedStreak
    ) {
      return false;
    }

    syncFreezeBank(
      streak,
      nowUTC,
    );

    return persistIfUnchanged();
  }

  // -------------------------------------------------------------------------
  // Case 2: Missed local calendar days
  // -------------------------------------------------------------------------

  let missedDays =
    daysDiff - 1;

  let didChange =
    didRepairEstablishedStreak;

  while (
    missedDays >
    0
  ) {
    const missedDate =
      addLocalDays(
        streak
          .lastCompletedDateLocal,
        1,
      );

    // -----------------------------------------------------------------------
    // A. Onboarding grace
    // -----------------------------------------------------------------------

    const graceAvailable =
      !streak
        .onboardingGraceUsed &&
      streak
        .onboardingStartDate &&
      getLocalDaysDifference(
        streak
          .onboardingStartDate,
        missedDate,
      ) >= 0 &&
      getLocalDaysDifference(
        streak
          .onboardingStartDate,
        missedDate,
      ) <
      STREAK_CONFIG
        .ONBOARDING_GRACE_DAYS;

    if (
      graceAvailable
    ) {
      streak
        .onboardingGraceUsed =
        true;

      streak
        .onboardingGraceUsedForDateLocal =
        missedDate;

      /*
       * This event becomes durable in the exact same UserProfile CAS
       * write that consumes onboarding grace.
       */
      queuePendingStreakHistoryEvent(
        streak,
        {
          dateLocal:
            missedDate,

          timezone,

          status:
            "grace_used",
        },
      );

      streak
        .lastCompletedDateLocal =
        missedDate;

      missedDays -=
        1;

      didChange =
        true;

      continue;
    }

    // -----------------------------------------------------------------------
    // B. Freeze
    // -----------------------------------------------------------------------

    syncFreezeBank(
      streak,
      nowUTC,
    );

    if (
      streak.freezeBank >
      0
    ) {
      const activeFreezes =
        getActiveFreezeCredits(
          streak,
          nowUTC,
        );

      activeFreezes.sort(
        (a, b) =>
          new Date(
            a.expiresAtUTC,
          ) -
          new Date(
            b.expiresAtUTC,
          ),
      );

      const freezeToConsume =
        activeFreezes[0];

      freezeToConsume
        .usedAtUTC =
        nowUTC;

      freezeToConsume
        .usedForDateLocal =
        missedDate;

      /*
       * This event becomes durable in the exact same UserProfile CAS
       * write that consumes the freeze.
       */
      queuePendingStreakHistoryEvent(
        streak,
        {
          dateLocal:
            missedDate,

          timezone,

          status:
            "freeze_used",
        },
      );

      streak
        .lastCompletedDateLocal =
        missedDate;

      syncFreezeBank(
        streak,
        nowUTC,
      );

      missedDays -=
        1;

      didChange =
        true;

      continue;
    }

    // -----------------------------------------------------------------------
    // C. No grace / freeze → Earn-Back
    // -----------------------------------------------------------------------

    if (
      !streak
        .earnBack
        .active
    ) {
      const deadline =
        new Date(
          nowUTC.getTime() +
          STREAK_CONFIG
            .EARN_BACK_WINDOW_HOURS *
          60 *
          60 *
          1000,
        );

      streak
        .earnBack
        .active =
        true;

      streak
        .earnBack
        .deadline =
        deadline;

      streak
        .earnBack
        .lessonsCompletedInWindow =
        0;

      streak
        .earnBack
        .countAtRisk =
        streak.currentCount;

      streak
        .earnBack
        .missedDateLocal =
        missedDate;

      streak
        .earnBack
        .lastResolution =
        null;

      /*
       * The missing day is recorded immediately.
       *
       * If Earn-Back later succeeds, the same StreakDay will be
       * upgraded from "missed" to "earnback_recovered".
       */
      queuePendingStreakHistoryEvent(
        streak,
        {
          dateLocal:
            missedDate,

          timezone,

          status:
            "missed",
        },
      );

      didChange =
        true;
    }

    break;
  }

  if (!didChange) {
    return false;
  }

  syncFreezeBank(
    streak,
    nowUTC,
  );

  return persistIfUnchanged();
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY COMPLETION CHECK
// ─────────────────────────────────────────────────────────────────────────────

export async function hasTodayLessonCompletion(
  userId,
  todayLocal,
) {
  const completion =
    await LessonCompletion
      .findOne({
        userId,
        completedDateLocal:
          todayLocal,
      })
      .lean();

  return !!completion;
}

// ─────────────────────────────────────────────────────────────────────────────
// EARN-BACK DURABLE RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────────

async function reconcileActiveEarnBackFromLessonCompletions({
  userProfile,
  streak,
  nowUTC,
  todayLocal,
}) {
  const earnBack =
    streak.earnBack;

  const deadline =
    earnBack?.deadline
      ? new Date(
        earnBack.deadline,
      )
      : null;

  if (
    !earnBack?.active ||
    !deadline ||
    Number.isNaN(
      deadline.getTime(),
    ) ||
    nowUTC > deadline
  ) {
    syncFreezeBank(
      streak,
      nowUTC,
    );

    return getStreakSummary(
      streak,
      todayLocal,
      nowUTC,
    );
  }

  const windowStart =
    new Date(
      deadline.getTime() -
      STREAK_CONFIG
        .EARN_BACK_WINDOW_HOURS *
      60 *
      60 *
      1000,
    );

  const durableCompletions =
    await LessonCompletion
      .find({
        userId:
          userProfile._id,

        completedAtUTC: {
          $gte:
            windowStart,

          $lte:
            nowUTC,
        },
      })
      .select(
        "_id completedAtUTC completedDateLocal timezone",
      )
      .sort({
        completedAtUTC:
          1,

        _id:
          1,
      })
      .limit(
        STREAK_CONFIG
          .EARN_BACK_REQUIRED_LESSONS,
      )
      .lean();

  const durableCount =
    durableCompletions.length;

  const recoveryCompletion =
    durableCount >=
      STREAK_CONFIG
        .EARN_BACK_REQUIRED_LESSONS
      ? durableCompletions[
      STREAK_CONFIG
        .EARN_BACK_REQUIRED_LESSONS -
      1
      ]
      : null;

  const recoveryDateLocal =
    recoveryCompletion
      ?.completedDateLocal ||
    null;

  const recoveryAtUTC =
    recoveryCompletion
      ?.completedAtUTC
      ? new Date(
        recoveryCompletion
          .completedAtUTC,
      )
      : null;

  const reconciledUser =
    await UserProfile
      .findOneAndUpdate(
        {
          _id:
            userProfile._id,

          "streak.earnBack.active":
            true,

          "streak.earnBack.deadline":
            deadline,

          "streak.earnBack.countAtRisk":
            earnBack
              .countAtRisk,
        },
        {
          $max: {
            "streak.earnBack.lessonsCompletedInWindow":
              durableCount,
          },
        },
        {
          new:
            true,

          timestamps:
            false,
        },
      )
      .select(
        "streak",
      );

  if (
    !reconciledUser
  ) {
    const latestUser =
      await UserProfile
        .findById(
          userProfile._id,
        )
        .select(
          "streak",
        );

    const latestStreak =
      latestUser
        ?.streak ||
      streak;

    return getStreakSummary(
      latestStreak,
      todayLocal,
      nowUTC,
    );
  }

  const reconciledStreak =
    reconciledUser
      .streak;

  const completedInWindow =
    reconciledStreak
      .earnBack
      ?.lessonsCompletedInWindow ||
    0;

  if (
    completedInWindow <
    STREAK_CONFIG
      .EARN_BACK_REQUIRED_LESSONS
  ) {
    return getStreakSummary(
      reconciledStreak,
      todayLocal,
      nowUTC,
    );
  }

  if (
    !recoveryDateLocal ||
    !recoveryAtUTC ||
    Number.isNaN(
      recoveryAtUTC.getTime(),
    )
  ) {
    return getStreakSummary(
      reconciledStreak,
      todayLocal,
      nowUTC,
    );
  }

  const countAtRisk =
    reconciledStreak
      .earnBack
      .countAtRisk;

  const earnBackDeadline =
    reconciledStreak
      .earnBack
      .deadline;

  reconciledStreak
    .currentCount =
    countAtRisk + 1;

  reconciledStreak
    .lastCompletedDateLocal =
    recoveryDateLocal;

  reconciledStreak
    .earnBack
    .lastResolution =
    "recovered";

  reconciledStreak
    .earnBack
    .active =
    false;

  reconciledStreak
    .earnBack
    .deadline =
    null;

  reconciledStreak
    .earnBack
    .lessonsCompletedInWindow =
    0;

  reconciledStreak
    .earnBack
    .countAtRisk =
    0;

  /*
   * missedDateLocal remains retained.
   *
   * IMPORTANT:
   * We deliberately do NOT queue "earnback_recovered" here yet.
   * Recovery outbox handling gets its own regression test next,
   * because this path uses targeted findOneAndUpdate rather than the
   * full-streak lazy CAS write.
   */

  earnFreezeIfEligible(
    reconciledStreak,
    recoveryAtUTC,
    recoveryDateLocal,
  );

  syncFreezeBank(
    reconciledStreak,
    nowUTC,
  );

  const recoveredHistoryEvent =
    reconciledStreak
      .earnBack
      .missedDateLocal
      ? {
        dateLocal:
          reconciledStreak
            .earnBack
            .missedDateLocal,

        timezone:
          reconciledStreak
            .timezone ||
          streak.timezone ||
          "Asia/Kolkata",

        status:
          "earnback_recovered",
      }
      : null;

  const recoveryUpdate = {
    $set: {
      "streak.currentCount":
        reconciledStreak
          .currentCount,

      "streak.lastCompletedDateLocal":
        recoveryDateLocal,

      "streak.earnBack.active":
        false,

      "streak.earnBack.deadline":
        null,

      "streak.earnBack.lessonsCompletedInWindow":
        0,

      "streak.earnBack.countAtRisk":
        0,

      /*
       * Keep missedDateLocal untouched.
       */
      "streak.earnBack.lastResolution":
        "recovered",

      "streak.freezeCredits":
        reconciledStreak
          .freezeCredits,

      "streak.freezeBank":
        reconciledStreak
          .freezeBank,
    },

    $max: {
      "streak.longestCount":
        reconciledStreak
          .currentCount,
    },
  };

  if (
    recoveredHistoryEvent
  ) {
    /*
     * Same atomic Mongo write as the recovery itself.
     *
     * If this CAS loses, neither recovery nor its
     * history event is committed by this request.
     */
    recoveryUpdate.$push = {
      "streak.historyPending":
        recoveredHistoryEvent,
    };
  }

  const recoveredUser =
    await UserProfile
      .findOneAndUpdate(
        {
          _id:
            userProfile._id,

          "streak.earnBack.active":
            true,

          "streak.earnBack.deadline":
            earnBackDeadline,

          "streak.earnBack.countAtRisk":
            countAtRisk,

          "streak.earnBack.lessonsCompletedInWindow":
          {
            $gte:
              STREAK_CONFIG
                .EARN_BACK_REQUIRED_LESSONS,
          },
        },
        recoveryUpdate,
        {
          new:
            true,

          timestamps:
            false,
        },
      )
      .select(
        "streak",
      );

  if (
    recoveredUser
  ) {
    return getStreakSummary(
      recoveredUser
        .streak,
      todayLocal,
      nowUTC,
    );
  }

  const latestUser =
    await UserProfile
      .findById(
        userProfile._id,
      )
      .select(
        "streak",
      );

  return getStreakSummary(
    latestUser
      ?.streak ||
    reconciledStreak,
    todayLocal,
    nowUTC,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK UPDATE ON LESSON COMPLETION
// ─────────────────────────────────────────────────────────────────────────────

export async function updateStreakOnLevelCompletion({
  userProfile,
  roadmapSlug,
  levelId,
}) {
  const nowUTC =
    new Date();

  const streak =
    userProfile.streak ||
    {
      currentCount:
        0,

      longestCount:
        0,

      lastCompletedDateLocal:
        null,

      timezone:
        "Asia/Kolkata",

      freezeBank:
        0,

      freezeCredits:
        [],

      onboardingGraceUsed:
        false,

      onboardingGraceUsedForDateLocal:
        null,

      onboardingStartDate:
        null,

      /*
       * Legacy/new profile safety.
       */
      historyPending:
        [],

      earnBack: {
        active:
          false,

        deadline:
          null,

        lessonsCompletedInWindow:
          0,

        countAtRisk:
          0,

        missedDateLocal:
          null,

        lastResolution:
          null,
      },
    };

  if (
    !streak.earnBack
  ) {
    streak.earnBack = {
      active:
        false,

      deadline:
        null,

      lessonsCompletedInWindow:
        0,

      countAtRisk:
        0,

      missedDateLocal:
        null,

      lastResolution:
        null,
    };
  }

  if (
    streak
      .earnBack
      .missedDateLocal ===
    undefined
  ) {
    streak
      .earnBack
      .missedDateLocal =
      null;
  }

  if (
    streak
      .earnBack
      .lastResolution ===
    undefined
  ) {
    streak
      .earnBack
      .lastResolution =
      null;
  }

  if (
    streak
      .onboardingGraceUsedForDateLocal ===
    undefined
  ) {
    streak
      .onboardingGraceUsedForDateLocal =
      null;
  }

  if (
    !Array.isArray(
      streak.historyPending,
    )
  ) {
    streak.historyPending = [];
  }

  if (
    !streak.freezeCredits
  ) {
    streak.freezeCredits =
      [];
  }

  userProfile.streak =
    streak;

  const timezone =
    streak.timezone ||
    "Asia/Kolkata";

  const todayLocal =
    getLocalDateString(
      nowUTC,
      timezone,
    );

  // ── Step 1: lifecycle evaluation ───────────────────────────────────────────

  await evaluateAndApplyLazyStreakState(
    userProfile,
    nowUTC,
    {
      reconcileEstablishedStreak:
        true,
    },
  );

  // ── Step 2: durable LessonCompletion ───────────────────────────────────────

  try {
    const createdCompletion =
      await LessonCompletion
        .create({
          userId:
            userProfile._id,

          firebaseUID:
            userProfile
              .firebaseUID,

          roadmapSlug,

          levelId,

          completedAtUTC:
            nowUTC,

          completedDateLocal:
            todayLocal,

          timezone,
        });

    try {
      await reconcileCompletedStreakDay({
        userProfile,
        dateLocal:
          todayLocal,
        timezone,
      });
      await LessonCompletion.updateOne(
        {
          _id:
            createdCompletion._id,

          streakHistoryProjectedAt:
            null,
        },
        {
          $set: {
            streakHistoryProjectedAt:
              new Date(),
          },
        },
      );
    } catch (historyError) {
      console.error(
        "[Streak History] Completion projection failed:",
        {
          name:
            historyError?.name ||
            "UnknownError",

          code:
            historyError?.code ??
            null,
        },
      );
    }
  } catch (err) {
    if (
      err.code !==
      11000
    ) {
      throw err;
    }

    /*
     * Active Earn-Back retries reconcile against durable lesson evidence.
     */
    if (
      streak
        .earnBack
        ?.active ===
      true
    ) {
      const existingEarnBackCompletion =
        await LessonCompletion
          .findOne({
            userId:
              userProfile._id,

            roadmapSlug,

            levelId,
          })
          .select(
            "_id completedDateLocal timezone",
          )
          .lean();

      if (
        existingEarnBackCompletion
          ?.completedDateLocal
      ) {
        try {
          await reconcileCompletedStreakDay({
            userProfile,

            dateLocal:
              existingEarnBackCompletion
                .completedDateLocal,

            timezone:
              existingEarnBackCompletion
                .timezone ||
              timezone,
          });

          await LessonCompletion.updateOne(
            {
              _id:
                existingEarnBackCompletion._id,

              streakHistoryProjectedAt:
                null,
            },
            {
              $set: {
                streakHistoryProjectedAt:
                  new Date(),
              },
            },
          );
        } catch (historyError) {
          console.error(
            "[Streak History] Completion projection failed:",
            {
              name:
                historyError?.name ||
                "UnknownError",

              code:
                historyError?.code ??
                null,
            },
          );
        }
      }

      return reconcileActiveEarnBackFromLessonCompletions({
        userProfile,
        streak,
        nowUTC,
        todayLocal,
      });
    }

    const existingCompletion =
      await LessonCompletion
        .findOne({
          userId:
            userProfile._id,

          roadmapSlug,

          levelId,
        })
        .select(
          "_id completedDateLocal",
        )
        .lean();

    const isTodayCompletion =
      existingCompletion
        ?.completedDateLocal ===
      todayLocal;

    if (
      isTodayCompletion
    ) {
      try {
        await reconcileCompletedStreakDay({
          userProfile,
          dateLocal:
            todayLocal,
          timezone,
        });

        await LessonCompletion.updateOne(
          {
            _id:
              existingCompletion._id,

            streakHistoryProjectedAt:
              null,
          },
          {
            $set: {
              streakHistoryProjectedAt:
                new Date(),
            },
          },
        );
      } catch (historyError) {
        /*
         * LessonCompletion is already durable.
         *
         * Permanent-history projection is retryable secondary state
         * and must not invalidate genuine learning/streak progress.
         *
         * Do not log user identifiers or error.message.
         */
        console.error(
          "[Streak History] Completion projection failed:",
          {
            name:
              historyError?.name ||
              "UnknownError",

            code:
              historyError?.code ??
              null,
          },
        );
      }
    }

    const streakAlreadyApplied =
      streak
        .lastCompletedDateLocal ===
      todayLocal;

    if (
      !isTodayCompletion ||
      streakAlreadyApplied
    ) {
      syncFreezeBank(
        streak,
        nowUTC,
      );

      return getStreakSummary(
        streak,
        todayLocal,
        nowUTC,
      );
    }

    /*
     * Durable completion exists but today's streak write is absent.
     * Continue through the normal streak transition to repair it.
     */
  }

  // ── Step 3: Apply genuine completion ───────────────────────────────────────

  if (
    streak
      .earnBack
      .active
  ) {
    const deadline =
      streak
        .earnBack
        .deadline
        ? new Date(
          streak
            .earnBack
            .deadline,
        )
        : null;

    if (
      deadline &&
      nowUTC > deadline
    ) {
      /*
       * Expired Earn-Back + genuine new completion = fresh streak.
       */
      streak.currentCount =
        1;

      streak
        .lastCompletedDateLocal =
        todayLocal;

      streak
        .earnBack
        .lastResolution =
        "expired";

      streak
        .earnBack
        .active =
        false;

      streak
        .earnBack
        .deadline =
        null;

      streak
        .earnBack
        .lessonsCompletedInWindow =
        0;

      streak
        .earnBack
        .countAtRisk =
        0;

      /*
       * missedDateLocal remains retained.
       */
    } else {
      /*
       * Atomic Earn-Back lesson increment.
       */
      const incrementedUser =
        await UserProfile
          .findOneAndUpdate(
            {
              _id:
                userProfile._id,

              "streak.earnBack.active":
                true,

              "streak.earnBack.deadline":
              {
                $gte:
                  nowUTC,
              },
            },
            {
              $inc: {
                "streak.earnBack.lessonsCompletedInWindow":
                  1,
              },
            },
            {
              new:
                true,

              timestamps:
                false,
            },
          )
          .select(
            "streak",
          );

      if (
        !incrementedUser
      ) {
        const latestUser =
          await UserProfile
            .findById(
              userProfile._id,
            )
            .select(
              "streak",
            );

        const latestStreak =
          latestUser
            ?.streak ||
          streak;

        return getStreakSummary(
          latestStreak,
          todayLocal,
          nowUTC,
        );
      }

      const atomicStreak =
        incrementedUser
          .streak;

      const completedInWindow =
        atomicStreak
          .earnBack
          ?.lessonsCompletedInWindow ||
        0;

      /*
       * This additional durable reconciliation closes the mixed race:
       *
       * old retry sees one durable completion
       * +
       * fresh request inserts second completion
       * +
       * persisted counter temporarily reaches only 1
       *
       * → durable evidence still recovers Earn-Back correctly.
       */
      if (
        completedInWindow <
        STREAK_CONFIG.EARN_BACK_REQUIRED_LESSONS
      ) {
        return reconcileActiveEarnBackFromLessonCompletions({
          userProfile,
          streak:
            atomicStreak,
          nowUTC,
          todayLocal,
        });
      }

      const countAtRisk =
        atomicStreak
          .earnBack
          .countAtRisk;

      const earnBackDeadline =
        atomicStreak
          .earnBack
          .deadline;

      atomicStreak
        .currentCount =
        countAtRisk + 1;

      atomicStreak
        .lastCompletedDateLocal =
        todayLocal;

      atomicStreak
        .earnBack
        .lastResolution =
        "recovered";

      atomicStreak
        .earnBack
        .active =
        false;

      atomicStreak
        .earnBack
        .deadline =
        null;

      atomicStreak
        .earnBack
        .lessonsCompletedInWindow =
        0;

      atomicStreak
        .earnBack
        .countAtRisk =
        0;

      /*
       * missedDateLocal remains retained.
       *
       * We intentionally do NOT queue "earnback_recovered" yet.
       * The next RED/GREEN step handles recovery outbox semantics in
       * both recovery paths atomically.
       */

      earnFreezeIfEligible(
        atomicStreak,
        nowUTC,
        todayLocal,
      );

      if (
        atomicStreak
          .currentCount >
        atomicStreak
          .longestCount
      ) {
        atomicStreak
          .longestCount =
          atomicStreak
            .currentCount;
      }

      syncFreezeBank(
        atomicStreak,
        nowUTC,
      );

      const recoveredHistoryEvent =
        atomicStreak
          .earnBack
          .missedDateLocal
          ? {
            dateLocal:
              atomicStreak
                .earnBack
                .missedDateLocal,

            timezone:
              atomicStreak
                .timezone ||
              timezone ||
              "Asia/Kolkata",

            status:
              "earnback_recovered",
          }
          : null;

      const recoveryUpdate = {
        $set: {
          "streak.currentCount":
            atomicStreak
              .currentCount,

          "streak.lastCompletedDateLocal":
            atomicStreak
              .lastCompletedDateLocal,

          "streak.earnBack.active":
            false,

          "streak.earnBack.deadline":
            null,

          "streak.earnBack.lessonsCompletedInWindow":
            0,

          "streak.earnBack.countAtRisk":
            0,

          /*
           * Keep missedDateLocal untouched.
           */
          "streak.earnBack.lastResolution":
            "recovered",

          "streak.freezeCredits":
            atomicStreak
              .freezeCredits,

          "streak.freezeBank":
            atomicStreak
              .freezeBank,
        },

        $max: {
          "streak.longestCount":
            atomicStreak
              .currentCount,
        },
      };

      if (
        recoveredHistoryEvent
      ) {
        /*
         * Queue recovery evidence in the exact same
         * atomic write that wins the Earn-Back CAS.
         */
        recoveryUpdate.$push = {
          "streak.historyPending":
            recoveredHistoryEvent,
        };
      }

      const recoveredUser =
        await UserProfile
          .findOneAndUpdate(
            {
              _id:
                userProfile._id,

              "streak.earnBack.active":
                true,

              "streak.earnBack.deadline":
                earnBackDeadline,

              "streak.earnBack.countAtRisk":
                countAtRisk,

              "streak.earnBack.lessonsCompletedInWindow":
                completedInWindow,
            },
            recoveryUpdate,
            {
              new:
                true,

              timestamps:
                false,
            },
          )
          .select(
            "streak",
          );

      if (
        recoveredUser
      ) {
        return getStreakSummary(
          recoveredUser
            .streak,
          todayLocal,
          nowUTC,
        );
      }

      const latestUser =
        await UserProfile
          .findById(
            userProfile._id,
          )
          .select(
            "streak",
          );

      return getStreakSummary(
        latestUser
          ?.streak ||
        atomicStreak,
        todayLocal,
        nowUTC,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Normal completion path
  // ─────────────────────────────────────────────────────────────────────────

  else if (
    streak
      .lastCompletedDateLocal !==
    todayLocal
  ) {
    if (
      !streak
        .lastCompletedDateLocal ||
      streak.currentCount ===
      0
    ) {
      /*
       * First completion or first completion after a real reset.
       */
      streak.currentCount =
        1;

      streak
        .lastCompletedDateLocal =
        todayLocal;
    } else {
      const daysDiff =
        getLocalDaysDifference(
          streak
            .lastCompletedDateLocal,
          todayLocal,
        );

      if (
        daysDiff ===
        1
      ) {
        streak.currentCount +=
          1;

        streak
          .lastCompletedDateLocal =
          todayLocal;

        earnFreezeIfEligible(
          streak,
          nowUTC,
          todayLocal,
        );
      }
    }
  }

  if (
    streak.currentCount >
    streak.longestCount
  ) {
    streak.longestCount =
      streak.currentCount;
  }

  syncFreezeBank(
    streak,
    nowUTC,
  );

  /*
  * Persist live streak state without replacing the entire
  * streak subdocument.
  *
  * historyPending is a concurrent durable outbox and is
  * intentionally NOT written here.
  *
  * This allows:
  *
  *   genuine LessonCompletion
  *            +
  *   concurrent historyPending $push / $pull
  *
  * to both survive.
  */
  await UserProfile
    .updateOne(
      {
        _id:
          userProfile._id,
      },
      {
        $set: {
          "streak.currentCount":
            streak.currentCount,

          "streak.longestCount":
            streak.longestCount,

          "streak.lastCompletedDateLocal":
            streak.lastCompletedDateLocal,

          "streak.timezone":
            streak.timezone,

          "streak.freezeBank":
            streak.freezeBank,

          "streak.freezeCredits":
            streak.freezeCredits,

          "streak.onboardingGraceUsed":
            streak.onboardingGraceUsed,

          "streak.onboardingGraceUsedForDateLocal":
            streak
              .onboardingGraceUsedForDateLocal ??
            null,

          "streak.onboardingStartDate":
            streak.onboardingStartDate ??
            null,

          "streak.earnBack.active":
            streak.earnBack?.active ??
            false,

          "streak.earnBack.deadline":
            streak.earnBack?.deadline ??
            null,

          "streak.earnBack.lessonsCompletedInWindow":
            streak.earnBack
              ?.lessonsCompletedInWindow ??
            0,

          "streak.earnBack.countAtRisk":
            streak.earnBack
              ?.countAtRisk ??
            0,

          "streak.earnBack.missedDateLocal":
            streak.earnBack
              ?.missedDateLocal ??
            null,

          "streak.earnBack.lastResolution":
            streak.earnBack
              ?.lastResolution ??
            null,
        },
      },
      {
        timestamps:
          false,
      },
    );
  return getStreakSummary(
    streak,
    todayLocal,
    nowUTC,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export function getStreakSummary(
  streak,
  todayLocal,
  nowUTC = null,
) {
  if (!nowUTC) {
    nowUTC =
      new Date();
  }

  if (
    !streak ||
    !streak
      .lastCompletedDateLocal
  ) {
    return {
      currentCount:
        0,

      longestCount:
        streak
          ?.longestCount ||
        0,

      lastCompletedDateLocal:
        null,

      todayCompleted:
        false,

      freezeBank:
        streak
          ?.freezeBank ||
        0,

      status:
        "inactive",

      earnBack: {
        active:
          false,

        deadline:
          null,

        lessonsCompletedInWindow:
          0,

        countAtRisk:
          0,

        lessonsRemaining:
          STREAK_CONFIG
            .EARN_BACK_REQUIRED_LESSONS,
      },

      targetGoal:
        streak?.targetGoal || null,

      targetGoalSetAt:
        streak?.targetGoalSetAt || null,

      day2PromptSeen:
        Boolean(streak?.day2PromptSeen),
    };
  }

  let status =
    "active";

  const earnBackData =
    streak.earnBack ||
    {
      active:
        false,

      deadline:
        null,

      lessonsCompletedInWindow:
        0,

      countAtRisk:
        0,
    };

  if (
    earnBackData.active &&
    earnBackData.countAtRisk >
    0
  ) {
    status =
      "at_risk";
  } else if (
    streak
      .lastCompletedDateLocal ===
    todayLocal
  ) {
    status =
      "completed_today";
  } else {
    const daysDiff =
      getLocalDaysDifference(
        streak
          .lastCompletedDateLocal,
        todayLocal,
      );

    if (
      daysDiff ===
      1
    ) {
      status =
        "pending_today";
    } else if (
      daysDiff >
      1 &&
      streak.currentCount ===
      0
    ) {
      status =
        "reset";
    }
  }

  const lessonsCompleted =
    earnBackData
      .lessonsCompletedInWindow ||
    0;

  const lessonsRemaining =
    Math.max(
      0,
      STREAK_CONFIG
        .EARN_BACK_REQUIRED_LESSONS -
      lessonsCompleted,
    );

  return {
    currentCount:
      streak.currentCount ||
      0,

    longestCount:
      streak.longestCount ||
      0,

    lastCompletedDateLocal:
      streak
        .lastCompletedDateLocal,

    todayCompleted:
      streak
        .lastCompletedDateLocal ===
      todayLocal,

    freezeBank:
      getActiveFreezeCount(
        streak,
        nowUTC,
      ),

    status,

    earnBack: {
      active:
        earnBackData.active &&
        earnBackData
          .countAtRisk >
        0,

      deadline:
        earnBackData
          .deadline ||
        null,

      lessonsCompletedInWindow:
        lessonsCompleted,

      countAtRisk:
        earnBackData
          .countAtRisk ||
        0,

      lessonsRemaining,
    },

    targetGoal:
      streak?.targetGoal || null,

    targetGoalSetAt:
      streak?.targetGoalSetAt || null,

    day2PromptSeen:
      Boolean(streak?.day2PromptSeen),
  };
}

/**
 * Builds a weekly streak calendar display array
 * (Sunday to Saturday).
 */
export function buildWeeklyStreakCalendar({
  userProfile,
  nowUTC,
  completions,
}) {
  const streak =
    userProfile.streak ||
    {};

  const timezone =
    streak.timezone ||
    "Asia/Kolkata";

  const todayLocal =
    getLocalDateString(
      nowUTC,
      timezone,
    );

  const [y, m, d] =
    todayLocal
      .split("-")
      .map(Number);

  const todayObj =
    new Date(
      Date.UTC(
        y,
        m - 1,
        d,
      ),
    );

  const dayOfWeek =
    todayObj
      .getUTCDay();

  const weekStartLocal =
    addLocalDays(
      todayLocal,
      -dayOfWeek,
    );

  const week =
    [];

  const dayLabels = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  for (
    let i = 0;
    i < 7;
    i += 1
  ) {
    const dateLocal =
      addLocalDays(
        weekStartLocal,
        i,
      );

    const dayLabel =
      dayLabels[i];

    const isToday =
      dateLocal ===
      todayLocal;

    const completedCount =
      completions.filter(
        (c) =>
          c.completedDateLocal ===
          dateLocal,
      ).length;

    const freezeUsed =
      streak
        .freezeCredits
        ?.some(
          (fc) =>
            fc.usedForDateLocal ===
            dateLocal,
        ) ||
      streak
        .historyPending
        ?.some(
          (h) =>
            h.dateLocal === dateLocal &&
            h.status === "freeze_used",
        ) ||
      false;

    let status =
      "missed";

    const diff =
      getLocalDaysDifference(
        todayLocal,
        dateLocal,
      );

    if (
      diff >
      0
    ) {
      status =
        "future";
    } else if (
      completedCount >
      0 &&
      isToday
    ) {
      status =
        "today_done";
    } else if (
      completedCount >
      0 &&
      diff <
      0
    ) {
      status =
        "completed";
    } else if (
      completedCount ===
      0 &&
      freezeUsed
    ) {
      status =
        "freeze_used";
    } else if (
      completedCount ===
      0 &&
      isToday
    ) {
      status =
        "today_pending";
    } else if (
      completedCount ===
      0 &&
      diff <
      0
    ) {
      status =
        "missed";
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

// ─────────────────────────────────────────────────────────────────────────────
// FORGE FREEZE CREDIT & RECOVER STREAK WITH FREEZE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Forges and banks a streak freeze shield credit for the user.
 */
export async function forgeFreezeCredit({
  userProfile,
  nowUTC = new Date(),
}) {
  if (!userProfile?._id) {
    throw new TypeError("userProfile._id is required");
  }

  const streak = userProfile.streak || {};
  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);

  syncFreezeBank(streak, nowUTC);

  if (streak.freezeBank >= STREAK_CONFIG.MAX_FREEZE_BANK) {
    return {
      success: false,
      message: `Freeze bank is already at maximum capacity (${STREAK_CONFIG.MAX_FREEZE_BANK} freezes).`,
      streak: getStreakSummary(streak, todayLocal, nowUTC),
    };
  }

  if (!Array.isArray(streak.freezeCredits)) {
    streak.freezeCredits = [];
  }

  const expiresAt = new Date(nowUTC.getTime() + 7 * 24 * 60 * 60 * 1000);

  streak.freezeCredits.push({
    earnedAtUTC: nowUTC,
    earnedDateLocal: todayLocal,
    expiresAtUTC: expiresAt,
    earnedForStreakCount: streak.currentCount || 0,
    usedAtUTC: null,
    usedForDateLocal: null,
  });

  syncFreezeBank(streak, nowUTC);

  const updateResult = await UserProfile.updateOne(
    {
      _id: userProfile._id,
      "streak.freezeBank": { $lt: STREAK_CONFIG.MAX_FREEZE_BANK },
    },
    {
      $set: {
        "streak.freezeCredits": streak.freezeCredits,
        "streak.freezeBank": streak.freezeBank,
      },
    },
    { timestamps: false },
  );

  if (updateResult.matchedCount !== 1) {
    return {
      success: false,
      message: `Freeze bank is already at maximum capacity (${STREAK_CONFIG.MAX_FREEZE_BANK} freezes).`,
      streak: getStreakSummary(streak, todayLocal, nowUTC),
    };
  }

  return {
    success: true,
    message: "Streak Freeze forged and banked successfully.",
    streak: getStreakSummary(streak, todayLocal, nowUTC),
  };
}

/**
 * Consumes an active freeze credit to immediately rescue an at-risk streak,
 * clearing the 48h Earn-Back window and marking the missed day as freeze_used.
 */
export async function useFreezeToRecoverStreak({
  userProfile,
  nowUTC = new Date(),
}) {
  if (!userProfile?._id) {
    throw new TypeError("userProfile._id is required");
  }

  const streak = userProfile.streak || {};
  const timezone = streak.timezone || "Asia/Kolkata";
  const todayLocal = getLocalDateString(nowUTC, timezone);

  syncFreezeBank(streak, nowUTC);

  const activeFreezes = getActiveFreezeCredits(streak, nowUTC);
  if (activeFreezes.length === 0) {
    return {
      success: false,
      message: "No active streak freeze credits available to use.",
      streak: getStreakSummary(streak, todayLocal, nowUTC),
    };
  }

  // Prevent accidental spending if streak is healthy
  const daysDiff = streak.lastCompletedDateLocal
    ? getLocalDaysDifference(streak.lastCompletedDateLocal, todayLocal)
    : 0;

  const isAtRisk = streak.earnBack?.active === true || daysDiff > 1;

  if (!isAtRisk) {
    return {
      success: false,
      message: "Your streak is currently protected and not at risk.",
      streak: getStreakSummary(streak, todayLocal, nowUTC),
    };
  }

  // Determine which missed date to protect:
  // If earnBack is active, protect the missed date that placed the streak at risk.
  // Otherwise protect yesterday.
  const missedDate =
    streak.earnBack?.missedDateLocal ||
    addLocalDays(todayLocal, -1);

  // Consume oldest expiring freeze credit
  activeFreezes.sort(
    (a, b) => new Date(a.expiresAtUTC) - new Date(b.expiresAtUTC),
  );
  const freezeToConsume = activeFreezes[0];
  freezeToConsume.usedAtUTC = nowUTC;
  freezeToConsume.usedForDateLocal = missedDate;

  // Clear Earn-Back recovery requirement since freeze protects it
  if (!streak.earnBack) {
    streak.earnBack = {};
  }
  streak.earnBack.active = false;
  streak.earnBack.deadline = null;
  streak.earnBack.countAtRisk = 0;
  streak.earnBack.lastResolution = "freeze_recovered";

  // Advance lastCompletedDateLocal to missedDate if it was earlier
  if (
    !streak.lastCompletedDateLocal ||
    streak.lastCompletedDateLocal < missedDate
  ) {
    streak.lastCompletedDateLocal = missedDate;
  }

  // Record durable history event
  queuePendingStreakHistoryEvent(streak, {
    dateLocal: missedDate,
    timezone,
    status: "freeze_used",
  });

  syncFreezeBank(streak, nowUTC);

  const updateResult = await UserProfile.updateOne(
    {
      _id: userProfile._id,
      "streak.freezeBank": { $gt: 0 },
    },
    {
      $set: {
        "streak.freezeCredits": streak.freezeCredits,
        "streak.freezeBank": streak.freezeBank,
        "streak.earnBack": streak.earnBack,
        "streak.lastCompletedDateLocal": streak.lastCompletedDateLocal,
        "streak.historyPending": streak.historyPending,
      },
    },
    { timestamps: false },
  );

  if (updateResult.matchedCount !== 1) {
    return {
      success: false,
      message: "Could not apply freeze. Please try again.",
      streak: getStreakSummary(streak, todayLocal, nowUTC),
    };
  }

  return {
    success: true,
    message: "Streak freeze successfully applied to protect your streak.",
    streak: getStreakSummary(streak, todayLocal, nowUTC),
  };
}