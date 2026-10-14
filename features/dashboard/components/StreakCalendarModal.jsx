"use client";

import Image from "next/image";
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Flame,
    Shield,
    Sparkles,
    X,
    Zap,
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
    accountStartDateLocal = null,
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

        /*
         * Never mark dates prior to account start as "missed".
         * Brand new learners have no penalties before registering.
         */
        if (
            accountStartDateLocal &&
            liveDay.dateLocal < accountStartDateLocal &&
            liveDay.status === "missed"
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
     * Populate cells for all days in month.
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

        const isPreAccount = Boolean(
            accountStartDateLocal &&
            dateLocal < accountStartDateLocal,
        );

        let history =
            historyByDate.get(
                dateLocal,
            ) ||
            null;

        if (
            isPreAccount &&
            history?.status === "missed"
        ) {
            history = null;
        }

        cells.push({
            day,
            dateLocal,
            history,
            isPreAccount,
        });
    }

    return cells;
}

function DayStatusCup({
    status,
}) {
    if (
        status === "completed"
    ) {
        return (
            <Image
                src="/streak/streak_done.png"
                alt="Brewed cup"
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5 object-contain drop-shadow-[0_0_6px_rgba(0,169,255,0.6)]"
            />
        );
    }

    if (
        status === "freeze_used" ||
        status === "grace_used" ||
        status === "earnback_recovered"
    ) {
        return (
            <Image
                src="/streak/streak_freeze.png"
                alt="Freeze cup"
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5 object-contain drop-shadow-[0_0_5px_rgba(56,189,248,0.45)]"
            />
        );
    }

    if (
        status === "missed"
    ) {
        return (
            <Image
                src="/streak/cup-shadow-t.png"
                alt="Missed cup"
                width={20}
                height={20}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain opacity-55"
            />
        );
    }

    return null;
}

function formatCellTitle(cell, isToday, isPreAccount) {
    if (!cell) return "";
    if (isPreAccount) {
        return `${cell.dateLocal}: Prior to account registration`;
    }
    const status = cell.history?.status;
    if (status === "completed") {
        return `${cell.dateLocal}: Lesson Completed ⚡`;
    }
    if (status === "freeze_used") {
        return `${cell.dateLocal}: Streak Freeze Used 🛡️`;
    }
    if (status === "grace_used" || status === "earnback_recovered") {
        return `${cell.dateLocal}: Streak Protected ✨`;
    }
    if (status === "missed") {
        return `${cell.dateLocal}: Missed`;
    }
    if (isToday) {
        return `${cell.dateLocal}: Today (In progress)`;
    }
    return `${cell.dateLocal}`;
}

function getDayClasses(
    status,
    isToday = false,
    isPreAccount = false,
) {
    const classes = [];

    switch (status) {
        case "completed":
            classes.push(
                "border-[#00A9FF]/40",
                "bg-[#00A9FF]/12",
                "text-[#0088cc]",
                "shadow-[0_0_8px_rgba(0,169,255,0.14)]",
            );
            break;

        case "freeze_used":
            classes.push(
                "border-sky-200",
                "bg-sky-50/80",
                "text-sky-600",
            );
            break;

        case "grace_used":
            classes.push(
                "border-violet-200",
                "bg-violet-50/80",
                "text-violet-600",
            );
            break;

        case "earnback_recovered":
            classes.push(
                "border-violet-200",
                "bg-violet-50/80",
                "text-violet-700",
            );
            break;

        case "missed":
            classes.push(
                "border-slate-200/90",
                "bg-slate-50/80",
                "text-slate-400",
            );
            break;

        default:
            if (isPreAccount) {
                classes.push(
                    "border-slate-100/60",
                    "bg-slate-50/40",
                    "text-slate-400/70",
                );
            } else {
                classes.push(
                    "border-slate-100",
                    "bg-white",
                    "text-slate-600",
                    "hover:border-slate-200",
                );
            }
            break;
    }

    if (isToday) {
        classes.push(
            "ring-2",
            "ring-[#00A9FF]",
            "ring-offset-2",
            "ring-offset-white",
            "font-extrabold",
            "z-10",
        );
    }

    return classes.join(" ");
}

export default function StreakCalendarModal({
    open,
    onClose,
    user,
    accountStartDateLocal = null,
    todayDateLocal = null,
    initialMonth,
    currentMonth,
    minimumMonth,
    liveWeek = [],
    lastCompletedDateLocal = null,
    currentCount = 0,
    longestCount = 0,
}) {
    /*
     * Resolve account start date to shield new users
     * from unfair pre-registration "missed" penalties.
     */
    const resolvedAccountStartDate = useMemo(() => {
        if (typeof accountStartDateLocal === "string" && accountStartDateLocal) {
            return accountStartDateLocal;
        }
        const creationTime = user?.metadata?.creationTime;
        if (!creationTime) return null;
        const createdAt = new Date(creationTime);
        if (Number.isNaN(createdAt.getTime())) return null;
        return `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
    }, [accountStartDateLocal, user?.metadata?.creationTime]);

    /*
     * Authoritative local date for today indicator.
     */
    const resolvedTodayDate = useMemo(() => {
        if (typeof todayDateLocal === "string" && todayDateLocal) {
            return todayDateLocal;
        }
        const todayInWeek = Array.isArray(liveWeek)
            ? liveWeek.find((day) => day.isToday)
            : null;
        if (typeof todayInWeek?.dateLocal === "string") {
            return todayInWeek.dateLocal;
        }
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }, [todayDateLocal, liveWeek]);

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

                    accountStartDateLocal:
                        resolvedAccountStartDate,
                }),
            [
                month,
                days,
                liveWeek,
                lastCompletedDateLocal,
                resolvedAccountStartDate,
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
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md p-5 sm:p-6">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00A9FF]/10 text-[#00A9FF]">
                                <Zap className="h-4 w-4 fill-[#00A9FF]" />
                            </div>

                            <h2
                                id="streak-calendar-title"
                                className="text-lg font-bold text-slate-900"
                            >
                                Streak Calendar
                            </h2>
                        </div>

                        <p className="text-sm text-slate-500">
                            Track your daily momentum &amp; learning history.
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
                        <div className="relative overflow-hidden rounded-2xl border border-[#00A9FF]/25 bg-gradient-to-br from-[#00A9FF]/10 via-[#00A9FF]/5 to-transparent p-4 shadow-[0_2px_12px_rgba(0,169,255,0.06)]">
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-pixelify font-black text-[#04121F]">
                                    {
                                        currentCount
                                    }
                                </p>

                                <Zap className="h-4 w-4 text-[#00A9FF] fill-[#00A9FF]" />
                            </div>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#0088cc]">
                                Current streak
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-pixelify font-black text-slate-900">
                                    {
                                        longestCount
                                    }
                                </p>

                                <Sparkles className="h-4 w-4 text-slate-400" />
                            </div>

                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                                    const isToday =
                                        cell.dateLocal ===
                                        resolvedTodayDate;

                                    return (
                                        <div
                                            key={
                                                cell
                                                    .dateLocal
                                            }
                                            title={formatCellTitle(
                                                cell,
                                                isToday,
                                                cell.isPreAccount,
                                            )}
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
                                                "transition-colors",
                                                getDayClasses(
                                                    status,
                                                    isToday,
                                                    cell.isPreAccount,
                                                ),
                                            ].join(" ")}
                                        >
                                            <span>
                                                {
                                                    cell.day
                                                }
                                            </span>

                                            {status ? (
                                                <span className="mt-0.5">
                                                    <DayStatusCup
                                                        status={
                                                            status
                                                        }
                                                    />
                                                </span>
                                            ) : isToday ? (
                                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#00A9FF] shadow-[0_0_6px_rgba(0,169,255,0.7)]" />
                                            ) : null}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                        <span className="flex items-center gap-1.5">
                            <Image
                                src="/streak/streak_done.png"
                                alt=""
                                aria-hidden="true"
                                width={16}
                                height={16}
                                className="h-4 w-4 object-contain drop-shadow-[0_0_4px_rgba(0,169,255,0.5)]"
                            />
                            Completed
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Image
                                src="/streak/streak_freeze.png"
                                alt=""
                                aria-hidden="true"
                                width={16}
                                height={16}
                                className="h-4 w-4 object-contain drop-shadow-[0_0_3px_rgba(56,189,248,0.4)]"
                            />
                            Freeze
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Image
                                src="/streak/cup-shadow-t.png"
                                alt=""
                                aria-hidden="true"
                                width={16}
                                height={16}
                                className="h-3.5 w-3.5 object-contain opacity-60"
                            />
                            Missed
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}