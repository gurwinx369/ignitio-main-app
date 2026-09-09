import {
    StreakDay,
} from "../../models/v2/streak.day.model.js";

const MONTH_PATTERN =
    /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Strict YYYY-MM validation.
 */
export function validateStreakHistoryMonth(
    month,
) {
    return (
        typeof month ===
        "string" &&
        MONTH_PATTERN.test(
            month,
        )
    );
}

/**
 * Calculate the exclusive beginning of the
 * following month without timezone conversion.
 *
 * 2026-08 -> 2026-09-01
 * 2026-12 -> 2027-01-01
 */
function getNextMonthStart(
    month,
) {
    const [
        yearText,
        monthText,
    ] =
        month.split(
            "-",
        );

    const year =
        Number(
            yearText,
        );

    const monthNumber =
        Number(
            monthText,
        );

    const nextYear =
        monthNumber ===
            12
            ? year + 1
            : year;

    const nextMonth =
        monthNumber ===
            12
            ? 1
            : monthNumber +
            1;

    return `${String(
        nextYear,
    ).padStart(
        4,
        "0",
    )}-${String(
        nextMonth,
    ).padStart(
        2,
        "0",
    )}-01`;
}

/**
 * Read one authenticated user's permanent
 * streak history for a single calendar month.
 *
 * Missing dates remain absent. We return only
 * durable StreakDay evidence and never infer
 * historical activity/protection.
 */
export async function getStreakMonthHistory({
    firebaseUID,
    month,
}) {
    if (
        typeof firebaseUID !==
        "string" ||
        firebaseUID.length ===
        0
    ) {
        throw new TypeError(
            "firebaseUID is required",
        );
    }

    if (
        !validateStreakHistoryMonth(
            month,
        )
    ) {
        throw new TypeError(
            "month must use YYYY-MM format",
        );
    }

    const monthStart =
        `${month}-01`;

    const nextMonthStart =
        getNextMonthStart(
            month,
        );

    const days =
        await StreakDay.find({
            firebaseUID,

            dateLocal: {
                $gte:
                    monthStart,

                $lt:
                    nextMonthStart,
            },
        })
            .select(
                "dateLocal timezone status completedLevelsCount protectedBy -_id",
            )
            .sort({
                dateLocal:
                    1,
            })
            .limit(
                31,
            )
            .lean();

    return {
        month,
        days,
    };
}