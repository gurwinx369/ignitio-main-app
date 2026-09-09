import {
    LessonCompletion,
} from "../../models/v2/lesson.completion.model.js";

import {
    StreakDay,
    STREAK_DAY_PROTECTION,
    STREAK_DAY_STATUS,
} from "../../models/v2/streak.day.model.js";

import {
    UserProfile,
} from "../../models/v2/user.profile.model.js";

/*
 * StreakDay is permanent historical state.
 *
 * These helpers intentionally do NOT own or calculate
 * the live streak state machine.
 *
 * streak.service.js remains authoritative for:
 *
 * - currentCount
 * - longestCount
 * - freeze consumption
 * - onboarding grace
 * - Earn-Back lifecycle
 *
 * This service owns only permanent historical projection.
 */

/*
 * Lifecycle history transitions are intentionally monotonic.
 *
 * A stale lifecycle write must never overwrite stronger evidence.
 *
 * Actual learning (`completed`) is handled separately by
 * reconcileCompletedStreakDay() and is always authoritative.
 */
const LIFECYCLE_TRANSITIONS = {
    [STREAK_DAY_STATUS.MISSED]: {
        allowedCurrentStatuses: [
            STREAK_DAY_STATUS.MISSED,
        ],

        protectedBy: null,
    },

    [STREAK_DAY_STATUS.GRACE_USED]: {
        allowedCurrentStatuses: [
            STREAK_DAY_STATUS.MISSED,
            STREAK_DAY_STATUS.GRACE_USED,
        ],

        protectedBy:
            STREAK_DAY_PROTECTION.GRACE,
    },

    [STREAK_DAY_STATUS.FREEZE_USED]: {
        allowedCurrentStatuses: [
            STREAK_DAY_STATUS.MISSED,
            STREAK_DAY_STATUS.FREEZE_USED,
        ],

        protectedBy:
            STREAK_DAY_PROTECTION.FREEZE,
    },

    [STREAK_DAY_STATUS.EARNBACK_RECOVERED]: {
        allowedCurrentStatuses: [
            STREAK_DAY_STATUS.MISSED,
            STREAK_DAY_STATUS.EARNBACK_RECOVERED,
        ],

        protectedBy:
            STREAK_DAY_PROTECTION.EARNBACK,
    },
};

/*
 * Keep each flush bounded.
 *
 * The lifecycle worker and interactive fallback may call this
 * repeatedly, so there is no reason for one request to drain an
 * unbounded historical queue.
 */
const DEFAULT_HISTORY_FLUSH_LIMIT =
    25;

const MAX_HISTORY_FLUSH_LIMIT =
    100;

function assertHistoryIdentity({
    userProfile,
    dateLocal,
    timezone,
}) {
    if (!userProfile?._id) {
        throw new TypeError(
            "userProfile._id is required",
        );
    }

    if (
        !userProfile.firebaseUID ||
        typeof userProfile.firebaseUID !==
        "string"
    ) {
        throw new TypeError(
            "userProfile.firebaseUID is required",
        );
    }

    if (
        typeof dateLocal !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateLocal,
        )
    ) {
        throw new TypeError(
            "dateLocal must use YYYY-MM-DD format",
        );
    }

    if (
        typeof timezone !== "string" ||
        timezone.trim().length === 0
    ) {
        throw new TypeError(
            "timezone is required",
        );
    }
}

/*
 * A filtered upsert can encounter E11000 when:
 *
 * 1. another request concurrently inserted the same
 *    user + date row, or
 *
 * 2. a stronger historical state already exists and
 *    therefore does not match this transition's filter.
 *
 * Retrying without upsert makes both cases safe:
 *
 * - concurrent compatible state -> update/idempotent merge
 * - stronger existing state -> matchedCount 0 / no regression
 */
async function updateHistoryIdempotently({
    filter,
    update,
}) {
    try {
        return await StreakDay.updateOne(
            filter,
            update,
            {
                upsert: true,
                runValidators: true,
            },
        );
    } catch (error) {
        if (error?.code !== 11000) {
            throw error;
        }

        return StreakDay.updateOne(
            filter,
            update,
            {
                upsert: false,
                runValidators: true,
            },
        );
    }
}

/*
 * Reconciles genuine learning activity from the durable
 * LessonCompletion collection.
 *
 * We do NOT increment completedLevelsCount ourselves.
 * Instead we count authoritative unique LessonCompletion
 * records for that local day.
 *
 * This gives retry-safe behavior:
 *
 *   2 durable completions
 *   -> history count = 2
 *
 *   retry of either completion
 *   -> durable count still 2
 *   -> history remains 2
 *
 * `$max` also prevents an older concurrent reconciliation
 * from lowering a newer count.
 */
export async function reconcileCompletedStreakDay({
    userProfile,
    dateLocal,
    timezone,
}) {
    assertHistoryIdentity({
        userProfile,
        dateLocal,
        timezone,
    });

    const completedLevelsCount =
        await LessonCompletion.countDocuments({
            userId:
                userProfile._id,

            completedDateLocal:
                dateLocal,
        });

    /*
     * Evidence-only rule:
     *
     * Never create "completed" history unless at least one
     * durable LessonCompletion actually proves learning
     * occurred on this day.
     */
    if (
        completedLevelsCount <= 0
    ) {
        return {
            recorded: false,
            completedLevelsCount: 0,
        };
    }

    const result =
        await updateHistoryIdempotently({
            /*
             * Genuine completion is the strongest evidence.
             *
             * Do not constrain the previous status: if a stale
             * lifecycle row says missed/protected but actual
             * durable learning exists, completion must win.
             */
            filter: {
                userId:
                    userProfile._id,

                dateLocal,
            },

            update: {
                /*
                 * Historical identity/timezone is immutable after
                 * the row is first created.
                 */
                $setOnInsert: {
                    firebaseUID:
                        userProfile.firebaseUID,

                    timezone,
                },

                $set: {
                    status:
                        STREAK_DAY_STATUS.COMPLETED,

                    protectedBy:
                        null,
                },

                /*
                 * Monotonic count:
                 *
                 * a stale reconciliation can never reduce a
                 * newer completedLevelsCount.
                 */
                $max: {
                    completedLevelsCount,
                },
            },
        });

    return {
        recorded: true,
        completedLevelsCount,
        result,
    };
}

/*
 * Records a lifecycle-only historical day:
 *
 * missed
 * missed -> grace_used
 * missed -> freeze_used
 * missed -> earnback_recovered
 *
 * It deliberately cannot write `completed`.
 * Actual completion must always be proven through
 * LessonCompletion and reconcileCompletedStreakDay().
 */
export async function recordStreakLifecycleDay({
    userProfile,
    dateLocal,
    timezone,
    status,
}) {
    assertHistoryIdentity({
        userProfile,
        dateLocal,
        timezone,
    });

    const transition =
        LIFECYCLE_TRANSITIONS[
        status
        ];

    if (!transition) {
        throw new TypeError(
            `Unsupported lifecycle StreakDay status: ${status}`,
        );
    }

    const result =
        await updateHistoryIdempotently({
            filter: {
                userId:
                    userProfile._id,

                dateLocal,

                /*
                 * Only allow this transition from states it may
                 * legitimately preserve or upgrade.
                 *
                 * Examples:
                 *
                 * completed -> missed
                 *     blocked
                 *
                 * earnback_recovered -> missed
                 *     blocked
                 *
                 * missed -> grace_used
                 *     allowed
                 */
                status: {
                    $in:
                        transition
                            .allowedCurrentStatuses,
                },
            },

            update: {
                /*
                 * These fields are written only for a newly-created
                 * historical row.
                 *
                 * In particular, timezone must never be rewritten
                 * when a historical row is upgraded later.
                 */
                $setOnInsert: {
                    firebaseUID:
                        userProfile.firebaseUID,

                    timezone,

                    completedLevelsCount:
                        0,
                },

                $set: {
                    status,

                    protectedBy:
                        transition.protectedBy,
                },
            },
        });

    return {
        /*
         * recorded=false can legitimately mean stronger permanent
         * evidence already exists.
         *
         * Example:
         *
         * stale missed event
         *      ↓
         * StreakDay already says completed
         *
         * The stale write is correctly blocked.
         */
        recorded:
            result.matchedCount === 1 ||
            result.modifiedCount === 1 ||
            result.upsertedCount === 1,

        status,
        result,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// DURABLE HISTORY OUTBOX
// ─────────────────────────────────────────────────────────────────────────────

function normalizeHistoryFlushLimit(
    maxEvents,
) {
    if (
        maxEvents === undefined
    ) {
        return DEFAULT_HISTORY_FLUSH_LIMIT;
    }

    if (
        !Number.isInteger(
            maxEvents,
        ) ||
        maxEvents <= 0
    ) {
        throw new TypeError(
            "maxEvents must be a positive integer",
        );
    }

    return Math.min(
        maxEvents,
        MAX_HISTORY_FLUSH_LIMIT,
    );
}

/*
 * Capture only the events that existed when this flush started.
 *
 * This snapshot is important for concurrency safety:
 *
 * request A begins flushing event X
 *
 * request B concurrently appends event Y
 *
 * request A must finish X only.
 * It must not unexpectedly consume Y from a live-mutating array.
 */
function createPendingHistorySnapshot({
    userProfile,
    maxEvents,
}) {
    const pending =
        userProfile
            ?.streak
            ?.historyPending;

    if (
        !Array.isArray(
            pending,
        ) ||
        pending.length === 0
    ) {
        return [];
    }

    return pending
        .slice(
            0,
            maxEvents,
        )
        .map(
            (event) => ({
                /*
                 * Keep the actual Mongo/Mongoose _id value.
                 *
                 * It is the exact outbox identity used by $pull.
                 */
                _id:
                    event?._id,

                dateLocal:
                    event?.dateLocal,

                timezone:
                    event?.timezone,

                status:
                    event?.status,
            }),
        );
}

function assertPendingHistoryEventIdentity(
    event,
) {
    /*
     * Never project an event we cannot safely remove afterward.
     *
     * Broad cleanup such as:
     *
     *   $pull by date/status
     *
     * would be unsafe because another request may append a
     * distinct event with the same date/status.
     */
    if (!event?._id) {
        throw new TypeError(
            "historyPending event _id is required",
        );
    }
}

/*
 * Removes exactly one successfully projected outbox event.
 *
 * The filter and $pull both use the same exact subdocument _id.
 *
 * If another request already removed this event after performing
 * the same idempotent projection, matchedCount may be 0.
 * That is safe: the event is already absent.
 */
async function removeProjectedPendingEvent({
    userProfile,
    eventId,
}) {
    return UserProfile.updateOne(
        {
            _id:
                userProfile._id,

            "streak.historyPending._id":
                eventId,
        },
        {
            $pull: {
                "streak.historyPending": {
                    _id:
                        eventId,
                },
            },
        },
        {
            timestamps:
                false,
        },
    );
}

/*
 * Projects durable lifecycle outbox events into StreakDay.
 *
 * Ordering:
 *
 *   1. StreakDay projection
 *   2. exact outbox cleanup
 *
 * Never reverse this ordering.
 *
 * Failure semantics:
 *
 * StreakDay fails
 *     -> event remains pending
 *
 * StreakDay succeeds
 * cleanup fails
 *     -> event remains pending
 *     -> retry replays idempotently
 *
 * StreakDay succeeds
 * cleanup succeeds
 *     -> event removed permanently
 *
 * This intentionally gives at-least-once delivery from
 * UserProfile.streak.historyPending to StreakDay, while
 * StreakDay's idempotent/monotonic writers make replay safe.
 */
export async function flushPendingStreakHistory({
    userProfile,
    maxEvents,
}) {
    if (!userProfile?._id) {
        throw new TypeError(
            "userProfile._id is required",
        );
    }

    if (
        !userProfile.firebaseUID ||
        typeof userProfile.firebaseUID !==
        "string"
    ) {
        throw new TypeError(
            "userProfile.firebaseUID is required",
        );
    }

    const limit =
        normalizeHistoryFlushLimit(
            maxEvents,
        );

    const pendingSnapshot =
        createPendingHistorySnapshot({
            userProfile,
            maxEvents:
                limit,
        });

    if (
        pendingSnapshot.length ===
        0
    ) {
        return {
            processed: 0,
            attempted: 0,
        };
    }

    let processed =
        0;

    for (
        const event of
        pendingSnapshot
    ) {
        assertPendingHistoryEventIdentity(
            event,
        );

        /*
         * Projection first.
         *
         * If this throws, cleanup is never reached and the event
         * remains durable in UserProfile for a later retry.
         */
        await recordStreakLifecycleDay({
            userProfile,

            dateLocal:
                event.dateLocal,

            timezone:
                event.timezone,

            status:
                event.status,
        });

        /*
         * A successful call does not necessarily mean the lifecycle
         * status changed.
         *
         * Example:
         *
         * stale "missed" outbox event
         * but permanent StreakDay already says "completed".
         *
         * recordStreakLifecycleDay correctly refuses to regress the
         * stronger row. That stale event may still be safely removed:
         * its historical intent has been fully reconciled.
         */
        await removeProjectedPendingEvent({
            userProfile,

            eventId:
                event._id,
        });

        processed +=
            1;
    }

    return {
        processed,

        attempted:
            pendingSnapshot.length,
    };
}