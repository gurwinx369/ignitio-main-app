import { UserProfile } from "../../models/v2/user.profile.model.js";

import {
    addLocalDays,
    evaluateAndApplyLazyStreakState,
    getLocalDateString,
} from "./streak.service.js";

import {
    flushPendingStreakHistory,
    reconcileCompletedStreakDay,
} from "./streak.history.service.js";
import {
    LessonCompletion,
} from "../../models/v2/lesson.completion.model.js";

/**
 * Build the MongoDB candidate queries used by the background
 * streak lifecycle worker.
 *
 * This function does not mutate anything.
 *
 * We intentionally use a conservative global date cutoff for normal
 * missed-streak candidates because lastCompletedDateLocal is stored in
 * each user's own timezone.
 *
 * Using UTC-yesterday may include some users who are not actually due
 * yet in western timezones, but the canonical lifecycle evaluator will
 * safely return false for them.
 *
 * More importantly, it does not exclude users who are already due in
 * eastern timezones.
 *
 * @param {Date} nowUTC
 * @returns {{
 *   expiredEarnBackQuery: object,
 *   missedStreakQuery: object,
 *   pendingHistoryQuery: object,
 *   missedDateCutoff: string
 * }}
 */
export function buildStreakLifecycleCandidateQueries(
    nowUTC = new Date(),
) {
    if (
        !(nowUTC instanceof Date) ||
        Number.isNaN(nowUTC.getTime())
    ) {
        throw new TypeError(
            "nowUTC must be a valid Date",
        );
    }

    /*
     * YYYY-MM-DD for the UTC calendar day immediately before today.
     *
     * Example:
     * nowUTC = 2026-08-18T10:00:00Z
     * cutoff = 2026-08-17
     */
    const yesterdayUTC = new Date(
        Date.UTC(
            nowUTC.getUTCFullYear(),
            nowUTC.getUTCMonth(),
            nowUTC.getUTCDate() - 1,
        ),
    );

    const missedDateCutoff =
        yesterdayUTC
            .toISOString()
            .slice(0, 10);

    /*
     * Earn-Back expires only when:
     *
     * nowUTC > deadline
     *
     * Therefore deadline < nowUTC is the exact Mongo equivalent.
     * At the exact deadline instant the recovery window is still valid.
     */
    const expiredEarnBackQuery = {
        onboardingComplete: true,

        "streak.earnBack.active": true,

        "streak.earnBack.deadline": {
            $lt: nowUTC,
        },
    };

    /*
     * Normal active streak candidates.
     *
     * currentCount > 0:
     *   A fully reset streak has no continuity left to protect.
     *
     * earnBack.active != true:
     *   Active Earn-Back is handled independently by the expiry query.
     *
     * lastCompletedDateLocal <= UTC-yesterday:
     *   Conservative pre-filter only.
     *
     * The canonical evaluator remains responsible for determining the
     * exact timezone-aware local-calendar transition.
     */
    const missedStreakQuery = {
        onboardingComplete: true,

        "streak.currentCount": {
            $gt: 0,
        },

        "streak.earnBack.active": {
            $ne: true,
        },

        "streak.lastCompletedDateLocal": {
            $ne: null,
            $lte: missedDateCutoff,
        },
    };

    /*
     * Permanent-history repair candidates.
     *
     * These users may have no live lifecycle transition due at all.
     * The durable outbox itself is sufficient evidence that background
     * projection work remains.
     */
    const pendingHistoryQuery = {
        onboardingComplete: true,

        "streak.historyPending.0": {
            $exists: true,
        },
    };

    return {
        expiredEarnBackQuery,
        missedStreakQuery,
        pendingHistoryQuery,
        missedDateCutoff,
    };
}

const DEFAULT_LIFECYCLE_BATCH_SIZE = 100;
const MAX_LIFECYCLE_BATCH_SIZE = 250;

/**
 * Validate authorization for the background streak lifecycle worker.
 *
 * Authentication is intentionally header-only:
 *
 * Authorization: Bearer <STREAK_LIFECYCLE_CRON_SECRET>
 *
 * No query-string secret or client identity is accepted.
 *
 * @param {object} params
 * @param {string|null} params.authorizationHeader
 * @param {string|undefined} params.configuredSecret
 * @returns {{
 *   ok: true
 * } | {
 *   ok: false,
 *   status: number,
 *   error: string
 * }}
 */
export function validateStreakLifecycleCronAuthorization({
    authorizationHeader,
    configuredSecret,
}) {
    /*
     * Fail closed when production configuration is missing.
     */
    if (
        typeof configuredSecret !== "string" ||
        configuredSecret.length === 0
    ) {
        return {
            ok: false,
            status: 500,
            error:
                "Streak lifecycle cron secret is not configured",
        };
    }

    /*
     * Require the exact Bearer credential.
     *
     * We deliberately do not trim, parse query parameters,
     * or accept alternative credential locations.
     */
    if (
        authorizationHeader !==
        `Bearer ${configuredSecret}`
    ) {
        return {
            ok: false,
            status: 401,
            error: "Unauthorized",
        };
    }

    return {
        ok: true,
    };
}

/**
 * Returns true only when a conservative missed-streak candidate is
 * actually due in its own streak timezone.
 *
 * Example:
 *   lastCompletedDateLocal = Aug 17
 *
 *   local today Aug 18 -> pending today, NOT missed
 *   local today Aug 19 -> Aug 18 was missed, lifecycle IS due
 */
/**
 * Returns true when a conservative Mongo missed-streak candidate
 * is actually due for lifecycle processing in its own timezone.
 *
 * Example:
 * last completed = Aug 17
 *
 * local Aug 18 -> streak is pending today, NOT missed
 * local Aug 19 -> Aug 18 was missed, lifecycle IS due
 */
export function isMissedStreakLifecycleDue(
    userProfile,
    nowUTC = new Date(),
) {
    if (
        !(nowUTC instanceof Date) ||
        Number.isNaN(nowUTC.getTime())
    ) {
        throw new TypeError(
            "nowUTC must be a valid Date",
        );
    }

    const streak = userProfile?.streak;

    if (
        !streak ||
        !(streak.currentCount > 0) ||
        streak.earnBack?.active === true ||
        !streak.lastCompletedDateLocal
    ) {
        return false;
    }

    const timezone =
        streak.timezone || "Asia/Kolkata";

    const todayLocal =
        getLocalDateString(
            nowUTC,
            timezone,
        );

    /*
     * A miss exists only after the complete local day following the
     * last completion has passed.
     */
    const pendingThroughDateLocal =
        addLocalDays(
            streak.lastCompletedDateLocal,
            1,
        );

    return (
        pendingThroughDateLocal <
        todayLocal
    );
}

/**
 * Walk conservative Mongo candidates until enough genuinely-due
 * missed-streak users have been collected.
 *
 * This prevents timezone-boundary false positives from consuming
 * every lifecycle batch slot and starving users who are actually due.
 */
async function collectDueMissedStreakUsers({
    query,
    nowUTC,
    limit,
}) {
    const dueUsers = [];

    const cursor =
        UserProfile.find(query)
            .select(
                "_id firebaseUID streak",
            )
            .sort({
                "streak.lastCompletedDateLocal": 1,
                _id: 1,
            })
            .cursor();

    try {
        for await (
            const userProfile of cursor
        ) {
            if (
                !isMissedStreakLifecycleDue(
                    userProfile,
                    nowUTC,
                )
            ) {
                continue;
            }

            dueUsers.push(
                userProfile,
            );

            /*
             * batchSize + 1 is requested by the caller so hasMore
             * can still be calculated without processing the extra user.
             */
            if (
                dueUsers.length >=
                limit
            ) {
                break;
            }
        }
    } finally {
        await cursor.close();
    }

    return dueUsers;
}

/**
 * Run one bounded background streak lifecycle batch.
 *
 * Responsibilities:
 * - find potentially-due streaks
 * - find durable pending history projection work
 * - fairly mix expired Earn-Back, missed streak, and history repair
 * - deduplicate users appearing in more than one work class
 * - reuse the canonical CAS-protected streak evaluator
 * - project durable historyPending events into StreakDay
 * - return aggregate operational metrics only
 *
 * This function never returns user IDs, Firebase UIDs, emails,
 * streak payloads, or other user-specific data.
 *
 * @param {object} [options]
 * @param {Date} [options.nowUTC]
 * @param {number} [options.batchSize]
 * @returns {Promise<{
 *   checked: number,
 *   transitioned: number,
 *   unchanged: number,
 *   failed: number,
 *   hasMore: boolean
 * }>}
 */


async function collectPendingCompletionRepairRows({
    limit,
}) {
    const completionRows =
        [];

    const seenUserIds =
        new Set();

    while (
        completionRows.length <
        limit
    ) {
        const remaining =
            limit -
            completionRows.length;

        const query = {
            streakHistoryProjectedAt:
                null,
        };

        if (
            seenUserIds.size >
            0
        ) {
            query.userId = {
                $nin:
                    Array.from(
                        seenUserIds,
                    ),
            };
        }

        const rows =
            await LessonCompletion.find(
                query,
            )
                .select(
                    "_id userId firebaseUID completedAtUTC completedDateLocal timezone streakHistoryProjectedAt",
                )
                .sort({
                    completedAtUTC:
                        1,

                    _id:
                        1,
                })
                .limit(
                    remaining,
                )
                .exec();

        if (
            rows.length ===
            0
        ) {
            break;
        }

        let discoveredUsers =
            0;

        for (
            const completion of
            rows
        ) {
            const userId =
                String(
                    completion.userId,
                );

            if (
                seenUserIds.has(
                    userId,
                )
            ) {
                continue;
            }

            seenUserIds.add(
                userId,
            );

            completionRows.push(
                completion,
            );

            discoveredUsers +=
                1;

            if (
                completionRows.length >=
                limit
            ) {
                break;
            }
        }

        /*
         * Defensive no-progress guard.
         *
         * Real Mongo queries exclude already-seen
         * users on subsequent passes, so this should
         * not normally happen. It prevents a malformed
         * adapter/mock from looping forever.
         */
        if (
            discoveredUsers ===
            0
        ) {
            break;
        }

        /*
         * Mongo returned fewer rows than requested
         * after excluding already-selected users.
         *
         * Therefore there cannot be enough unseen
         * completion rows to fill the remaining slots.
         */
        if (
            rows.length <
            remaining
        ) {
            break;
        }
    }

    return completionRows;
}

export async function runStreakLifecycleBatch({
    nowUTC = new Date(),
    batchSize = DEFAULT_LIFECYCLE_BATCH_SIZE,
} = {}) {
    if (
        !(nowUTC instanceof Date) ||
        Number.isNaN(nowUTC.getTime())
    ) {
        throw new TypeError(
            "nowUTC must be a valid Date",
        );
    }

    if (
        !Number.isInteger(batchSize) ||
        batchSize < 1 ||
        batchSize >
        MAX_LIFECYCLE_BATCH_SIZE
    ) {
        throw new RangeError(
            `batchSize must be an integer between 1 and ${MAX_LIFECYCLE_BATCH_SIZE}`,
        );
    }

    const {
        expiredEarnBackQuery,
        missedStreakQuery,
        pendingHistoryQuery,
    } =
        buildStreakLifecycleCandidateQueries(
            nowUTC,
        );

    /*
     * Fetch one candidate beyond the processing limit.
     *
     * That gives us a bounded indication that additional work exists
     * without performing countDocuments() on every lifecycle run.
     *
     * All three work classes are queried independently:
     *
     * - expired Earn-Back
     * - genuinely-due missed streak
     * - pending permanent-history projection
     *
     * This prevents one backlog class from completely hiding another.
     */
    const fetchLimit =
        batchSize + 1;

    const [
        expiredEarnBackUsers,
        missedStreakUsers,
        pendingHistoryUsers,
        pendingCompletionRows,
    ] =
        await Promise.all([
            UserProfile.find(
                expiredEarnBackQuery,
            )
                .select(
                    "_id firebaseUID streak",
                )
                .sort({
                    "streak.earnBack.deadline":
                        1,

                    _id:
                        1,
                })
                .limit(
                    fetchLimit,
                )
                .exec(),

            collectDueMissedStreakUsers({
                query:
                    missedStreakQuery,

                nowUTC,

                limit:
                    fetchLimit,
            }),

            UserProfile.find(
                pendingHistoryQuery,
            )
                .select(
                    "_id firebaseUID streak",
                )
                .sort({
                    _id:
                        1,
                })
                .limit(
                    fetchLimit,
                )
                .exec(),

            collectPendingCompletionRepairRows({
                limit:
                    fetchLimit,
            }),
        ]);

    /*
     * One completion-history repair candidate per user per run.
     *
     * If multiple unprojected lessons exist on the same/day or
     * across days, successful updateMany() below clears one local
     * date at a time. Remaining evidence stays durable for another run.
     */
    const completionRepairByUserId =
        new Map();

    for (
        const completion of
        pendingCompletionRows
    ) {
        const userId =
            String(
                completion.userId,
            );

        if (
            !completionRepairByUserId.has(
                userId,
            )
        ) {
            completionRepairByUserId.set(
                userId,
                completion,
            );
        }
    }

    const completionRepairUsers =
        Array.from(
            completionRepairByUserId.values(),
        ).map(
            (completion) => ({
                _id:
                    completion.userId,

                firebaseUID:
                    completion.firebaseUID,

                streak:
                    null,
            }),
        );

    /*
     * Distinguish real UserProfile lifecycle candidates from
     * synthetic completion-history candidates.
     */
    const profileWorkIds =
        new Set(
            [
                ...expiredEarnBackUsers,
                ...missedStreakUsers,
                ...pendingHistoryUsers,
            ].map(
                (userProfile) =>
                    String(
                        userProfile._id,
                    ),
            ),
        );

    /*
     * Fairly mix all three independent work classes.
     *
     * A profile can simultaneously:
     *
     * - require a lifecycle transition
     * - already contain pending permanent-history work
     *
     * Therefore candidates MUST be deduplicated by UserProfile _id
     * so one user never consumes multiple batch slots.
     */
    const candidates = [];

    const candidateIds =
        new Set();

    let expiredIndex =
        0;

    let missedIndex =
        0;

    let historyIndex =
        0;

    let completionIndex =
        0;

    function addCandidate(
        userProfile,
    ) {
        const candidateId =
            String(
                userProfile._id,
            );

        if (
            candidateIds.has(
                candidateId,
            )
        ) {
            return false;
        }

        candidateIds.add(
            candidateId,
        );

        candidates.push(
            userProfile,
        );

        return true;
    }

    while (
        candidates.length <
        batchSize &&
        (
            expiredIndex <
            expiredEarnBackUsers.length ||
            missedIndex <
            missedStreakUsers.length ||
            historyIndex <
            pendingHistoryUsers.length ||
            completionIndex <
            completionRepairUsers.length
        )
    ) {
        if (
            expiredIndex <
            expiredEarnBackUsers.length &&
            candidates.length <
            batchSize
        ) {
            addCandidate(
                expiredEarnBackUsers[
                expiredIndex
                ],
            );

            expiredIndex +=
                1;
        }

        if (
            missedIndex <
            missedStreakUsers.length &&
            candidates.length <
            batchSize
        ) {
            addCandidate(
                missedStreakUsers[
                missedIndex
                ],
            );

            missedIndex +=
                1;
        }

        if (
            historyIndex <
            pendingHistoryUsers.length &&
            candidates.length <
            batchSize
        ) {
            addCandidate(
                pendingHistoryUsers[
                historyIndex
                ],
            );

            historyIndex +=
                1;
        }

        if (
            completionIndex <
            completionRepairUsers.length &&
            candidates.length <
            batchSize
        ) {
            addCandidate(
                completionRepairUsers[
                completionIndex
                ],
            );

            completionIndex +=
                1;
        }
    }

    /*
     * Conservatively report whether another invocation may still
     * have work to process.
     *
     * There are two reasons this can be true:
     *
     * 1. We fetched candidates that did not fit into this batch.
     *
     * 2. A query returned the full fetchLimit, so there may be more
     *    documents beyond the bounded query result.
     *
     * The second condition matters now that candidate streams may
     * overlap and be deduplicated.
     */
    let hasMore =
        expiredIndex <
        expiredEarnBackUsers.length ||
        missedIndex <
        missedStreakUsers.length ||
        historyIndex <
        pendingHistoryUsers.length ||
        completionIndex <
        completionRepairUsers.length ||
        expiredEarnBackUsers.length ===
        fetchLimit ||
        missedStreakUsers.length ===
        fetchLimit ||
        pendingHistoryUsers.length ===
        fetchLimit ||
        pendingCompletionRows.length ===
        fetchLimit ||
        pendingCompletionRows.length >
        completionRepairUsers.length;


    const result = {
        checked: 0,
        transitioned: 0,
        unchanged: 0,
        failed: 0,
        hasMore,
    };

    /*
     * Process candidates sequentially.
     *
     * The worker remains intentionally conservative with database
     * pressure. The external scheduler can invoke another bounded
     * batch when additional work remains.
     *
     * IMPORTANT ORDER:
     *
     * 1. canonical lifecycle evaluation
     * 2. durable history projection
     *
     * evaluateAndApplyLazyStreakState() uses a CAS-protected streak
     * snapshot that includes historyPending protection.
     *
     * Therefore flushing history BEFORE lifecycle evaluation could
     * intentionally alter historyPending and invalidate that CAS.
     *
     * Evaluating first also lets a newly-created lifecycle event be
     * projected during this same worker pass.
     */
    for (
        const userProfile of
        candidates
    ) {
        result.checked +=
            1;

        const candidateId =
            String(
                userProfile._id,
            );

        const hasProfileWork =
            profileWorkIds.has(
                candidateId,
            );

        const completionRepair =
            completionRepairByUserId.get(
                candidateId,
            );

        let transitioned =
            false;

        let candidateFailed =
            false;

        if (
            hasProfileWork
        ) {
            try {
                transitioned =
                    await evaluateAndApplyLazyStreakState(
                        userProfile,
                        nowUTC,
                    );
            } catch (error) {
                console.error(
                    "[Streak Lifecycle] Candidate evaluation failed:",
                    {
                        name:
                            error?.name ||
                            "UnknownError",

                        code:
                            error?.code ??
                            null,
                    },
                );

                candidateFailed =
                    true;
            }
        }

        /*
         * Permanent-history projection is independent retryable work.
         *
         * Even if lifecycle evaluation failed, an older durable
         * historyPending event may still be valid and should still be
         * given a chance to project.
         *
         * Likewise, if lifecycle evaluation successfully created a new
         * outbox event, the local streak object now contains it and it
         * can be projected immediately.
         */
        try {
            const pendingCountBefore =
                Array.isArray(
                    userProfile
                        ?.streak
                        ?.historyPending,
                )
                    ? userProfile
                        .streak
                        .historyPending
                        .length
                    : 0;

            if (
                pendingCountBefore >
                0
            ) {
                const flushResult =
                    await flushPendingStreakHistory({
                        userProfile,
                    });

                /*
                 * flushPendingStreakHistory() itself is bounded.
                 *
                 * If more events existed than were processed, another
                 * scheduler invocation is still required.
                 */
                if (
                    pendingCountBefore >
                    flushResult.processed
                ) {
                    hasMore =
                        true;
                }
            }
        } catch (error) {
            /*
             * Projection failure is safe:
             *
             * - the durable event remains in historyPending
             * - StreakDay projection is idempotent
             * - a later worker run can retry it
             *
             * Do not expose user-specific values in logs.
             */
            console.error(
                "[Streak Lifecycle] History projection failed:",
                {
                    name:
                        error?.name ||
                        "UnknownError",

                    code:
                        error?.code ??
                        null,
                },
            );

            candidateFailed =
                true;

            /*
             * Failed durable work definitely remains.
             */
            hasMore =
                true;
        }

        /*
 * Repair permanent history from durable LessonCompletion evidence.
 */
        if (
            completionRepair
        ) {
            try {
                const repairResult =
                    await reconcileCompletedStreakDay({
                        userProfile: {
                            _id:
                                completionRepair.userId,

                            firebaseUID:
                                completionRepair.firebaseUID,
                        },

                        dateLocal:
                            completionRepair
                                .completedDateLocal,

                        timezone:
                            completionRepair
                                .timezone,
                    });

                if (
                    repairResult.recorded
                ) {
                    await LessonCompletion.updateOne(
                        {
                            _id:
                                completionRepair._id,

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
                } else {
                    hasMore =
                        true;
                }
            } catch (error) {
                console.error(
                    "[Streak Lifecycle] Completion history repair failed:",
                    {
                        name:
                            error?.name ||
                            "UnknownError",

                        code:
                            error?.code ??
                            null,
                    },
                );

                candidateFailed =
                    true;

                hasMore =
                    true;
            }
        }

        /*
         * Keep one aggregate outcome per checked candidate.
         *
         * If either lifecycle evaluation or history projection failed,
         * classify the candidate as failed for this worker pass.
         *
         * Otherwise preserve the existing transitioned/unchanged
         * distinction from the canonical evaluator.
         */
        if (
            candidateFailed
        ) {
            result.failed +=
                1;
        } else if (
            transitioned
        ) {
            result.transitioned +=
                1;
        } else {
            result.unchanged +=
                1;
        }
    }

    result.hasMore =
        hasMore;

    return result;
}