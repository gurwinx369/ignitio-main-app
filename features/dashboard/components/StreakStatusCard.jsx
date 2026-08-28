import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Shield,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StreakCalendarModal from "./StreakCalendarModal";

export default function StreakStatusCard({
  streak,
  isLoadingProfile,
  user,
}) {
  const isCompleted =
    streak?.status === "completed_today" ||
    streak?.status === "completed" ||
    streak?.status === "today_done";

  const [
    shouldPulse,
    setShouldPulse,
  ] =
    useState(false);

  const [
    calendarOpen,
    setCalendarOpen,
  ] =
    useState(false);

  /*
   * Use the current weekly streak calendar to
   * resolve the authoritative current streak month.
   *
   * This avoids relying on the browser calendar
   * whenever the profile already gives us the
   * user's streak-local date.
   */
  const currentMonth =
    useMemo(() => {
      const today =
        streak?.week?.find(
          (day) =>
            day.isToday,
        );

      if (
        typeof today?.dateLocal ===
        "string"
      ) {
        return today.dateLocal.slice(
          0,
          7,
        );
      }

      const now =
        new Date();

      return `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;
    }, [
      streak?.week,
    ]);

  /*
   * Earliest month that the user may navigate to.
   *
   * Prefer streak.onboardingStartDate because it
   * is already stored as a streak-local YYYY-MM-DD
   * date.
   *
   * Firebase account creation time is only a
   * fallback for profiles without that historical
   * streak field.
   */
  const minimumMonth =
    useMemo(() => {
      const onboardingStartDate =
        streak?.onboardingStartDate;

      if (
        typeof onboardingStartDate ===
        "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
          onboardingStartDate,
        )
      ) {
        const onboardingMonth =
          onboardingStartDate.slice(
            0,
            7,
          );

        return onboardingMonth >
          currentMonth
          ? currentMonth
          : onboardingMonth;
      }

      const creationTime =
        user?.metadata
          ?.creationTime;

      if (
        !creationTime
      ) {
        return currentMonth;
      }

      const createdAt =
        new Date(
          creationTime,
        );

      if (
        Number.isNaN(
          createdAt.getTime(),
        )
      ) {
        return currentMonth;
      }

      const creationMonth =
        `${createdAt.getUTCFullYear()}-${String(
          createdAt.getUTCMonth() + 1,
        ).padStart(2, "0")}`;

      return creationMonth >
        currentMonth
        ? currentMonth
        : creationMonth;
    }, [
      streak?.onboardingStartDate,
      user?.metadata?.creationTime,
      currentMonth,
    ]);

  useEffect(() => {
    /*
     * Schedule state changes from timer callbacks
     * rather than synchronously inside the effect.
     */
    const pulseStartTimer =
      setTimeout(
        () => {
          setShouldPulse(
            isCompleted,
          );
        },
        0,
      );

    const pulseStopTimer =
      isCompleted
        ? setTimeout(
          () => {
            setShouldPulse(
              false,
            );
          },
          2000,
        )
        : null;

    return () => {
      clearTimeout(
        pulseStartTimer,
      );

      if (
        pulseStopTimer
      ) {
        clearTimeout(
          pulseStopTimer,
        );
      }
    };
  }, [
    isCompleted,
  ]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Your Streak
        </h3>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isCompleted
            ? "bg-green-100 text-green-700"
            : streak?.status === "at_risk"
              ? "bg-orange-100 text-orange-700"
              : "bg-slate-200 text-slate-700"
            } ${shouldPulse
              ? "animate-pulse"
              : ""
            }`}
        >
          {isCompleted
            ? "Done"
            : streak?.status === "at_risk"
              ? "At Risk"
              : "Pending"}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isLoadingProfile ? (
          <div className="animate-pulse flex gap-2 h-16 bg-slate-100 rounded-2xl w-full mb-4" />
        ) : (
          <>
            {/* Streak metrics */}
            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="bg-orange-50/50 py-4 px-2 rounded-2xl border border-orange-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {
                    streak
                      ?.currentCount ||
                    0
                  }
                </p>

                <p className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wide">
                  Current
                </p>
              </div>

              <div className="bg-slate-50 py-4 px-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {
                    streak
                      ?.longestCount ||
                    0
                  }
                </p>

                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Longest
                </p>
              </div>

              <div className="bg-blue-50/50 py-4 px-2 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
                  {
                    streak
                      ?.freezeBank ||
                    0
                  }
                </p>

                <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-wide">
                  Freezes
                </p>
              </div>
            </div>

            {/* Current week */}
            {streak?.week ? (
              <div className="flex justify-between w-full pb-2">
                {streak.week.map(
                  (
                    day,
                    idx,
                  ) => (
                    <div
                      key={
                        day.dateLocal ||
                        idx
                      }
                      className="flex flex-col items-center gap-2 shrink-0"
                    >
                      <span
                        className={`text-xs font-bold ${day.isToday
                          ? "text-slate-900"
                          : "text-slate-400"
                          }`}
                      >
                        {
                          day.dayLabel
                        }
                      </span>

                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${day.status ===
                          "today_done" ||
                          day.status ===
                          "completed"
                          ? "bg-green-100 text-green-600"
                          : day.status ===
                            "today_pending"
                            ? "bg-white border-2 border-slate-200 text-slate-300"
                            : day.status ===
                              "freeze_used"
                              ? "bg-blue-100 text-blue-500"
                              : day.status ===
                                "missed"
                                ? "bg-slate-100 text-slate-300"
                                : "bg-slate-50 text-slate-200"
                          }`}
                      >
                        {day.status ===
                          "today_done" ||
                          day.status ===
                          "completed" ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : day.status ===
                          "freeze_used" ? (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-current" />
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="h-12 flex items-center justify-center text-slate-500 text-sm italic mb-4">
                Start learning to build your streak.
              </div>
            )}

            {/* Earn-Back */}
            {streak?.earnBack?.active &&
              streak.earnBack.countAtRisk >
              0 &&
              (() => {
                const lessonsLeft =
                  typeof streak
                    .earnBack
                    .lessonsRemaining ===
                    "number"
                    ? streak
                      .earnBack
                      .lessonsRemaining
                    : Math.max(
                      0,
                      2 -
                      (
                        streak
                          .earnBack
                          .lessonsCompletedInWindow ||
                        0
                      ),
                    );

                const msg =
                  lessonsLeft ===
                    1
                    ? `Complete 1 more lesson to restore your ${streak.earnBack.countAtRisk}-day streak.`
                    : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streak.earnBack.countAtRisk}-day streak.`;

                return (
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700 flex gap-3 items-start animate-in fade-in">
                    <Flame className="w-4 h-4 shrink-0 mt-0.5" />

                    <p>
                      {msg}
                    </p>
                  </div>
                );
              })()}
          </>
        )}
      </div>

      {/* Monthly history opener */}
      <button
        type="button"
        onClick={() =>
          setCalendarOpen(
            true,
          )
        }
        className="text-sm font-bold text-[#06b6d4] hover:text-[#0891b2] transition-colors flex items-center justify-between mt-6 pt-4 border-t border-slate-100"
      >
        View full history

        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Monthly streak calendar */}
      {calendarOpen && (
        <StreakCalendarModal
          open={true}
          onClose={() =>
            setCalendarOpen(false)
          }
          user={user}
          initialMonth={currentMonth}
          currentMonth={currentMonth}
          minimumMonth={minimumMonth}
          liveWeek={
            streak?.week || []
          }
          lastCompletedDateLocal={
            streak?.lastCompletedDateLocal ||
            null
          }
          currentCount={
            streak?.currentCount || 0
          }
          longestCount={
            streak?.longestCount || 0
          }
        />
      )}
    </div>
  );
}