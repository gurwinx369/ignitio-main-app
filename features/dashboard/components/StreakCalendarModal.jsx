"use client";

import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Flame,
    Shield,
    Sparkles,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

const DAY_LABELS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

function parseMonth(month) {
    const [year, monthNumber] =
        month.split("-").map(Number);

    return {
        year,
        monthNumber,
    };
}

function shiftMonth(
    month,
    offset,
) {
    const {
        year,
        monthNumber,
    } = parseMonth(month);

    const date =
        new Date(
            Date.UTC(
                year,
                monthNumber - 1 + offset,
                1,
            ),
        );

    return `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
}

function getMonthLabel(month) {
    const {
        year,
        monthNumber,
    } = parseMonth(month);

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        },
    ).format(
        new Date(
            Date.UTC(
                year,
                monthNumber - 1,
                1,
            ),
        ),
    );
}

/*
 * Convert the current weekly card's live
 * status vocabulary into StreakDay-style
 * calendar statuses.
 *
 * We only use this for the CURRENT month
 * and only when permanent StreakDay evidence
 * for that exact date is absent.
 */
function normalizeLiveStatus(
    status,
) {
    if (
        status === "completed" ||
        status === "today_done"
    ) {
        return "completed";
    }

    if (
        status === "freeze_used"
    ) {
        return "freeze_used";
    }

    if (
        status === "missed"
    ) {
        return "missed";
    }

    return null;
}
function buildCalendarDays({
    month,
    historyDays = [],
    liveWeek = [],
    lastCompletedDateLocal = null,
}) {
    const [
        year,
        monthNumber,
    ] =
        month
            .split("-")
            .map(Number);

    const firstDay =
        new Date(
            Date.UTC(
                year,
                monthNumber - 1,
                1,
            ),
        ).getUTCDay();

    const daysInMonth =
        new Date(
            Date.UTC(
                year,
                monthNumber,
                0,
            ),
        ).getUTCDate();

    /*
     * Permanent StreakDay history is the
     * base source for the monthly calendar.
     */
    const historyByDate =
        new Map();

    for (
        const historyDay of historyDays
    ) {
        if (
            typeof historyDay?.dateLocal !==
            "string" ||
            !historyDay.dateLocal.startsWith(
                `${month}-`,
            )
        ) {
            continue;
        }

        historyByDate.set(
            historyDay.dateLocal,
            {
                ...historyDay,
                source:
                    "history",
            },
        );
    }

    /*
     * Overlay current-week evidence.
     *
     * This gives the current month immediate
     * completed / missed / freeze information
     * even before permanent projection catches up.
     */
    for (
        const liveDay of liveWeek
    ) {
        if (
            typeof liveDay?.dateLocal !==
            "string" ||
            !liveDay.dateLocal.startsWith(
                `${month}-`,
            )
        ) {
            continue;
        }

        let status =
            null;

        if (
            liveDay.status ===
            "completed" ||
            liveDay.status ===
            "today_done"
        ) {
            status =
                "completed";
        } else if (
            liveDay.status ===
            "freeze_used"
        ) {
            status =
                "freeze_used";
        } else if (
            liveDay.status ===
            "missed"
        ) {
            status =
                "missed";
        }

        /*
         * today_pending / future stay neutral.
         */
        if (!status) {
            continue;
        }

        historyByDate.set(
            liveDay.dateLocal,
            {
                ...historyByDate.get(
                    liveDay.dateLocal,
                ),

                dateLocal:
                    liveDay.dateLocal,

                status,

                completedLevelsCount:
                    liveDay.completedCount ??
                    historyByDate.get(
                        liveDay.dateLocal,
                    )
                        ?.completedLevelsCount ??
                    0,

                source:
                    "live_week",
            },
        );
    }

    /*
     * lastCompletedDateLocal is exact
     * completion evidence.
     *
     * Use it only when no stronger status
     * already exists for that exact date.
     */
    if (
        typeof lastCompletedDateLocal ===
        "string" &&
        lastCompletedDateLocal.startsWith(
            `${month}-`,
        )
    ) {
        const existing =
            historyByDate.get(
                lastCompletedDateLocal,
            );

        if (
            !existing ||
            existing.status ===
            "missed"
        ) {
            historyByDate.set(
                lastCompletedDateLocal,
                {
                    ...existing,

                    dateLocal:
                        lastCompletedDateLocal,

                    status:
                        "completed",

                    completedLevelsCount:
                        Math.max(
                            existing
                                ?.completedLevelsCount ||
                            0,
                            1,
                        ),

                    source:
                        "live_streak",
                },
            );
        }
    }

    const cells = [];

    /*
     * Empty cells before the 1st of month.
     */
    for (
        let index = 0;
        index < firstDay;
        index += 1
    ) {
        cells.push(
            null,
        );
    }

    /*
     * IMPORTANT:
     *
     * Keep these property names as:
     *
     * day
     * dateLocal
     * history
     *
     * because the existing JSX renderer
     * already consumes exactly this shape.
     */
    for (
        let day = 1;
        day <= daysInMonth;
        day += 1
    ) {
        const dateLocal =
            `${month}-${String(
                day,
            ).padStart(
                2,
                "0",
            )}`;

        cells.push({
            day,

            dateLocal,

            history:
                historyByDate.get(
                    dateLocal,
                ) ||
                null,
        });
    }

    return cells;
}

function DayStatusIcon({
    status,
}) {
    if (
        status === "completed"
    ) {
        return (
            <Check className="h-3.5 w-3.5" />
        );
    }

    if (
        status === "freeze_used"
    ) {
        return (
            <Shield className="h-3.5 w-3.5" />
        );
    }

    if (
        status === "grace_used" ||
        status ===
        "earnback_recovered"
    ) {
        return (
            <Sparkles className="h-3.5 w-3.5" />
        );
    }

    if (
        status === "missed"
    ) {
        return (
            <X className="h-3.5 w-3.5" />
        );
    }

    return null;
}

function getDayClasses(
    status,
) {
    switch (status) {
        case "completed":
            return [
                "border-emerald-200",
                "bg-emerald-50",
                "text-emerald-700",
            ].join(" ");

        case "freeze_used":
            return [
                "border-blue-200",
                "bg-blue-50",
                "text-blue-600",
            ].join(" ");

        case "grace_used":
            return [
                "border-cyan-200",
                "bg-cyan-50",
                "text-cyan-700",
            ].join(" ");

        case "earnback_recovered":
            return [
                "border-violet-200",
                "bg-violet-50",
                "text-violet-700",
            ].join(" ");

        case "missed":
            return [
                "border-slate-200",
                "bg-slate-50",
                "text-slate-400",
            ].join(" ");

        default:
            return [
                "border-slate-100",
                "bg-white",
                "text-slate-500",
            ].join(" ");
    }
}

export default function StreakCalendarModal({
    open,
    onClose,
    user,
    initialMonth,
    currentMonth,
    minimumMonth,
    liveWeek = [],
    lastCompletedDateLocal = null,
    currentCount = 0,
    longestCount = 0,
}) {
    /*
     * Clamp the first visible month so even if
     * bad input arrives we never start before
     * account creation or after current month.
     */
    const resolvedInitialMonth =
        initialMonth < minimumMonth
            ? minimumMonth
            : initialMonth > currentMonth
                ? currentMonth
                : initialMonth;

    const [month, setMonth] =
        useState(
            resolvedInitialMonth,
        );

    const [days, setDays] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        retryKey,
        setRetryKey,
    ] =
        useState(0);

    /*
     * Fetch permanent history.
     *
     * Older in-flight month requests are
     * aborted when navigation changes.
     */
    useEffect(() => {
        if (
            !open ||
            !user ||
            !month
        ) {
            return undefined;
        }

        let cancelled =
            false;

        const controller =
            new AbortController();

        user
            .getIdToken()
            .then(
                (token) =>
                    fetch(
                        `/api/v2/streak/history?month=${encodeURIComponent(
                            month,
                        )}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },

                            signal:
                                controller.signal,
                        },
                    ),
            )
            .then(
                (response) => {
                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            "Failed to load streak history",
                        );
                    }

                    return response.json();
                },
            )
            .then(
                (data) => {
                    if (
                        cancelled
                    ) {
                        return;
                    }

                    setDays(
                        Array.isArray(
                            data.days,
                        )
                            ? data.days
                            : [],
                    );

                    setError("");
                },
            )
            .catch(
                (fetchError) => {
                    if (
                        cancelled ||
                        fetchError?.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    setDays([]);

                    setError(
                        "Could not load streak history.",
                    );
                },
            )
            .finally(
                () => {
                    if (
                        !cancelled
                    ) {
                        setLoading(
                            false,
                        );
                    }
                },
            );

        return () => {
            cancelled =
                true;

            controller.abort();
        };
    }, [
        month,
        open,
        retryKey,
        user,
    ]);

    /*
     * Modal keyboard + scroll behavior.
     */
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onKeyDown =
            (event) => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    onClose();
                }
            };

        window.addEventListener(
            "keydown",
            onKeyDown,
        );

        const previousOverflow =
            document.body.style
                .overflow;

        document.body.style
            .overflow =
            "hidden";

        return () => {
            window.removeEventListener(
                "keydown",
                onKeyDown,
            );

            document.body.style
                .overflow =
                previousOverflow;
        };
    }, [
        open,
        onClose,
    ]);

    const calendarDays =
        useMemo(
            () =>
                buildCalendarDays({
                    month,

                    historyDays:
                        days,

                    liveWeek,

                    lastCompletedDateLocal,
                }),
            [
                month,
                days,
                liveWeek,
                lastCompletedDateLocal,
            ],
        );

    const isCurrentMonth =
        month ===
        currentMonth;

    const isMinimumMonth =
        month ===
        minimumMonth ||
        month <
        minimumMonth;

    if (!open) {
        return null;
    }

    return (
        <div
            className={[
                "fixed inset-0 z-[100]",
                "flex items-start justify-center",
                "overflow-y-auto",
                "bg-slate-950/40",
                "p-3 sm:items-center sm:p-5",
                "backdrop-blur-[2px]",
            ].join(" ")}
            role="presentation"
            onMouseDown={(
                event,
            ) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="streak-calendar-title"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
                className={[
                    "my-auto w-full max-w-lg",
                    "max-h-[calc(100dvh-1.5rem)]",
                    "overflow-y-auto",
                    "[&::-webkit-scrollbar]:hidden",
                    "rounded-3xl",
                    "border border-slate-200",
                    "bg-white",
                    "shadow-2xl",
                ].join(" ")}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />

                            <h2
                                id="streak-calendar-title"
                                className="text-lg font-bold text-slate-900"
                            >
                                Streak Calendar
                            </h2>
                        </div>

                        <p className="text-sm text-slate-500">
                            Your learning history.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        aria-label="Close streak calendar"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Stats */}
                    <div className="mb-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                            <p className="text-2xl font-pixelify font-black text-slate-900">
                                {
                                    currentCount
                                }
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                                Current streak
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-2xl font-pixelify font-black text-slate-900">
                                {
                                    longestCount
                                }
                            </p>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                Longest streak
                            </p>
                        </div>
                    </div>

                    {/* Month navigation */}
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={
                                isMinimumMonth
                            }
                            onClick={() => {
                                if (
                                    isMinimumMonth
                                ) {
                                    return;
                                }

                                setLoading(
                                    true,
                                );

                                setError("");

                                setMonth(
                                    (
                                        value,
                                    ) => {
                                        const previous =
                                            shiftMonth(
                                                value,
                                                -1,
                                            );

                                        return previous <
                                            minimumMonth
                                            ? minimumMonth
                                            : previous;
                                    },
                                );
                            }}
                            aria-label="Previous month"
                            className={[
                                "flex h-9 w-9",
                                "items-center justify-center",
                                "rounded-full border",
                                "border-slate-200",
                                "text-slate-500",
                                "transition",
                                "hover:bg-slate-50",
                                "hover:text-slate-900",
                                "disabled:cursor-not-allowed",
                                "disabled:opacity-25",
                            ].join(" ")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-[#06b6d4]" />

                            <p className="text-sm font-black text-slate-900 sm:text-base">
                                {
                                    getMonthLabel(
                                        month,
                                    )
                                }
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={
                                isCurrentMonth
                            }
                            onClick={() => {
                                if (
                                    isCurrentMonth
                                ) {
                                    return;
                                }

                                setLoading(
                                    true,
                                );

                                setError("");

                                setMonth(
                                    (
                                        value,
                                    ) => {
                                        const next =
                                            shiftMonth(
                                                value,
                                                1,
                                            );

                                        return next >
                                            currentMonth
                                            ? currentMonth
                                            : next;
                                    },
                                );
                            }}
                            aria-label="Next month"
                            className={[
                                "flex h-9 w-9",
                                "items-center justify-center",
                                "rounded-full border",
                                "border-slate-200",
                                "text-slate-500",
                                "transition",
                                "hover:bg-slate-50",
                                "hover:text-slate-900",
                                "disabled:cursor-not-allowed",
                                "disabled:opacity-25",
                            ].join(" ")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Week labels */}
                    <div className="mb-1 grid grid-cols-7 gap-1 text-center">
                        {DAY_LABELS.map(
                            (day) => (
                                <span
                                    key={
                                        day
                                    }
                                    className="py-1 text-[9px] font-black uppercase tracking-wide text-slate-400 sm:text-[10px]"
                                >
                                    {day}
                                </span>
                            ),
                        )}
                    </div>

                    {/* Calendar */}
                    {loading ? (
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from(
                                {
                                    length:
                                        35,
                                },
                            ).map(
                                (
                                    _,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="h-11 animate-pulse rounded-xl bg-slate-100 sm:h-12"
                                    />
                                ),
                            )}
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm font-medium text-red-600">
                            {error}

                            <button
                                type="button"
                                onClick={() => {
                                    setLoading(
                                        true,
                                    );

                                    setError(
                                        "",
                                    );

                                    setRetryKey(
                                        (
                                            value,
                                        ) =>
                                            value +
                                            1,
                                    );
                                }}
                                className="mx-auto mt-3 block font-bold underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map(
                                (
                                    cell,
                                    index,
                                ) => {
                                    if (
                                        !cell
                                    ) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="h-11 sm:h-12"
                                            />
                                        );
                                    }

                                    const status =
                                        cell.history
                                            ?.status;

                                    return (
                                        <div
                                            key={
                                                cell
                                                    .dateLocal
                                            }
                                            title={
                                                status
                                                    ? `${cell.dateLocal}: ${status}`
                                                    : `${cell.dateLocal}: no recorded history`
                                            }
                                            className={[
                                                "relative",
                                                "flex h-11",
                                                "flex-col",
                                                "items-center",
                                                "justify-center",
                                                "rounded-xl",
                                                "border",
                                                "text-[11px]",
                                                "font-bold",
                                                "sm:h-12",
                                                getDayClasses(
                                                    status,
                                                ),
                                            ].join(" ")}
                                        >
                                            <span>
                                                {
                                                    cell.day
                                                }
                                            </span>

                                            {status && (
                                                <span className="mt-0.5">
                                                    <DayStatusIcon
                                                        status={
                                                            status
                                                        }
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                        <span className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            Completed
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-blue-500" />
                            Freeze
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                            Protected
                        </span>

                        <span className="flex items-center gap-1.5">
                            <X className="h-3.5 w-3.5 text-slate-400" />
                            Missed
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}