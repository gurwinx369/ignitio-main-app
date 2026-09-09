import {
  Flame,
  Shield,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import StreakCalendarModal from "./StreakCalendarModal";

/**
 * Derive a pure "weekly energy" score (0–7) from the streak week array.
 *
 * Rules (evaluated Sunday → Saturday, stops at and including today):
 *   completed / today_done  → +1
 *   missed / freeze_used    → -1
 *   today_pending / future / neutral → 0
 *
 * Energy is clamped to [0, 7] after every change.
 * This is presentation-only — it never persists anywhere.
 */
function getWeeklyCupEnergy(week) {
  if (!Array.isArray(week) || week.length === 0) return 0;

  let energy = 0;

  for (const day of week) {
    const s = day.status;

    if (s === "completed" || s === "today_done") {
      energy = Math.min(7, energy + 1);
    } else if (s === "missed" || s === "freeze_used") {
      energy = Math.max(0, energy - 1);
    }
    // today_pending / future / neutral → 0 change

    // Stop after today — do not evaluate future entries
    if (day.isToday) break;
  }

  return energy;
}

/** Returns the correct cup image src and alt for each streak week day status */
function getDayCupSrc(status) {
  if (status === "completed" || status === "today_done") {
    return { src: "/streak/streak_done.png", done: true };
  }
  return { src: "/streak/streak_pending_or_skipped.png", done: false };
}

function getAccountStartDateLocal(streak, user) {
  /*
   * Prefer the streak-owned onboarding date because it is already
   * expressed in the same YYYY-MM-DD format as week[].dateLocal.
   */
  if (
    typeof streak?.onboardingStartDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(streak.onboardingStartDate)
  ) {
    return streak.onboardingStartDate;
  }

  /*
   * Fallback for accounts that do not expose onboardingStartDate.
   */
  const creationTime =
    user?.metadata?.creationTime;

  if (!creationTime) {
    return null;
  }

  const createdAt =
    new Date(creationTime);

  if (
    Number.isNaN(
      createdAt.getTime(),
    )
  ) {
    return null;
  }

  return `${createdAt.getFullYear()}-${String(
    createdAt.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    createdAt.getDate(),
  ).padStart(2, "0")}`;
}

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
  ] = useState(false);

  useEffect(() => {
    const pulseStartTimer = setTimeout(
      () => {
        setShouldPulse(isCompleted);
      },
      0,
    );

    const pulseStopTimer = isCompleted
      ? setTimeout(
          () => {
            setShouldPulse(false);
          },
          2000,
        )
      : null;

    return () => {
      clearTimeout(pulseStartTimer);

      if (pulseStopTimer) {
        clearTimeout(pulseStopTimer);
      }
    };
  }, [
    isCompleted,
  ]);

  const [calendarOpen, setCalendarOpen] = useState(false);

  /*
   * Resolve the authoritative current streak month from the week array.
   * Prefer streak.week's today entry, fall back to browser date.
   */
  const currentMonth = useMemo(() => {
    const today = streak?.week?.find((day) => day.isToday);

    if (typeof today?.dateLocal === "string") {
      return today.dateLocal.slice(0, 7);
    }

    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [streak?.week]);

  /*
   * Earliest navigable month. Prefers onboardingStartDate,
   * falls back to Firebase account creation time.
   */
  const minimumMonth = useMemo(() => {
    const onboardingStartDate = streak?.onboardingStartDate;

    if (
      typeof onboardingStartDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(onboardingStartDate)
    ) {
      const onboardingMonth = onboardingStartDate.slice(0, 7);
      return onboardingMonth > currentMonth ? currentMonth : onboardingMonth;
    }

    const creationTime = user?.metadata?.creationTime;

    if (!creationTime) return currentMonth;

    const createdAt = new Date(creationTime);

    if (Number.isNaN(createdAt.getTime())) return currentMonth;

    const creationMonth = `${createdAt.getUTCFullYear()}-${String(
      createdAt.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    return creationMonth > currentMonth ? currentMonth : creationMonth;
  }, [streak?.onboardingStartDate, user?.metadata?.creationTime, currentMonth]);

  const accountStartDateLocal =
    getAccountStartDateLocal(
      streak,
      user,
    );

  const firstActiveWeekIndex =
    (() => {
      const week =
        streak?.week;

      if (
        !Array.isArray(week) ||
        week.length === 0
      ) {
        return 0;
      }

      if (!accountStartDateLocal) {
        return 0;
      }

      const index =
        week.findIndex(
          (day) =>
            typeof day.dateLocal === "string" &&
            day.dateLocal >= accountStartDateLocal,
        );

      return index === -1
        ? 0
        : index;
    })();
  const weeklyEnergy = useMemo(
    () => getWeeklyCupEnergy(streak?.week),
    [streak?.week],
  );

  const currentCount = streak?.currentCount || 0;
  const longestCount = streak?.longestCount || 0;

  // Earn-back derived values (same logic as before, no changes)
  const earnBackActive =
    streak?.earnBack?.active === true && (streak?.earnBack?.countAtRisk || 0) > 0;

  const earnBackMsg = (() => {
    if (!earnBackActive) return null;
    const lessonsLeft =
      typeof streak.earnBack.lessonsRemaining === "number"
        ? streak.earnBack.lessonsRemaining
        : Math.max(0, 2 - (streak.earnBack.lessonsCompletedInWindow || 0));

    return lessonsLeft === 1
      ? `Complete 1 more lesson to restore your ${streak.earnBack.countAtRisk}-day streak.`
      : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streak.earnBack.countAtRisk}-day streak.`;
  })();

  return (
    <div className="flex flex-col gap-2.5 w-full">

      {/* HEADER */}
      <div className="flex items-center justify-between px-1">
        <p
          className="
          text-[11px]
          font-bold
          text-[#19183B]/55
          uppercase
          tracking-[0.18em]
        "
        >
          Your Streak
        </p>

        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          aria-label="View monthly streak calendar"
          className="
          rounded-md
          text-xs
          font-bold
          text-[#00A9FF]

          transition-transform
          duration-150

          hover:-translate-y-px
          active:translate-y-[2px]

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#00A9FF]
          focus-visible:ring-offset-2
        "
        >
          Monthly Streak →
        </button>
      </div>

      {/* FIGMA WHITE STREAK STRIP */}
      <div
        className="
        rounded-[24px]
        border border-[#E7BC95]
        bg-[#FFFDF9]

        px-3.5 py-3.5
        sm:px-5 sm:py-4

        shadow-[0_8px_22px_rgba(73,42,20,0.08)]
      "
      >
        <div
          className="
          flex
          flex-col
          gap-3.5

          sm:flex-row
          sm:items-center
          sm:gap-6
        "
        >
          {/* BIG CUP + SUMMARY */}
          <div
            className="
            flex
            items-center
            gap-3

            shrink-0

            sm:min-w-[220px]
          "
          >
            <div
              className="
              relative
              flex
              w-[58px]
              h-[70px]

              sm:w-[68px]
              sm:h-[82px]

              items-end
              justify-center
              shrink-0
            "
              aria-label={`Weekly energy ${weeklyEnergy} of 7`}
            >
              {/* energy fill behind cup */}
              <div
                aria-hidden="true"
                className="
                absolute
                bottom-[7px]
                left-1/2
                -translate-x-1/2

                w-[28px]
                h-[44px]

                sm:w-[33px]
                sm:h-[52px]

                overflow-hidden
                rounded-b-lg
              "
              >
                <div
                  className="
                  absolute
                  inset-x-0
                  bottom-0

                  rounded-b-lg
                  bg-[#00A9FF]/25

                  transition-[height]
                  duration-700
                  ease-out
                "
                  style={{
                    height: `${(weeklyEnergy / 7) * 100}%`,
                  }}
                />
              </div>

              <Image
                src="/streak/big_cup_7_days.png"
                alt=""
                aria-hidden="true"
                width={68}
                height={82}
                priority
                className="
                relative
                z-10
                w-full
                h-full
                object-contain
              "
              />
            </div>

            {/* STREAK COPY */}
            <div className="min-w-0">
              {isLoadingProfile ? (
                <div
                  className="
                  mb-2
                  h-5
                  w-28
                  animate-pulse
                  rounded-full
                  bg-[#F0CAA8]/55
                "
                />
              ) : (
                <div
                  className="
                  flex
                  items-baseline
                  gap-1.5
                  whitespace-nowrap
                "
                >
                  <span
                    className={[
                      "text-2xl",
                      "sm:text-[28px]",
                      "font-black",
                      "leading-none",
                      "text-[#19183B]",
                      shouldPulse
                        ? "animate-pulse"
                        : "",
                    ].join(" ")}
                  >
                    {currentCount}
                  </span>

                  <span
                    className="
                    text-xs
                    sm:text-sm
                    font-bold
                    text-[#19183B]/70
                  "
                  >
                    day streak
                  </span>
                </div>
              )}

              <div
                className="
                mt-1.5
                flex
                flex-wrap
                items-center
                gap-x-1.5
                gap-y-0.5

                text-[11px]
                sm:text-xs
                font-semibold
              "
              >
                <span className="text-[#19183B]/65">
                  Energy{" "}
                  <strong className="text-[#00A9FF]">
                    {weeklyEnergy}/7
                  </strong>
                </span>

                {longestCount > 0 && (
                  <>
                    <span className="text-[#19183B]/25">
                      •
                    </span>

                    <span className="text-[#19183B]/45">
                      Best {longestCount}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* WEEKLY CONNECTED CUP LINE */}
          <div className="relative flex-1 min-w-0">

            {isLoadingProfile ? (
              <div className="relative grid grid-cols-7 gap-1 px-1 pt-1">

                <div
                  className="
                  absolute
                  left-[7%]
                  right-[7%]
                  top-[31px]
                  h-[2px]
                  rounded-full
                  bg-[#00A9FF]/20
                "
                />

                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="
                    relative
                    z-10
                    flex
                    flex-col
                    items-center
                    gap-1.5
                  "
                  >
                    <div
                      className="
                      w-5
                      h-2
                      rounded
                      bg-[#F0CAA8]/55
                      animate-pulse
                    "
                    />

                    <div
                      className="
                      flex
                      w-7
                      h-7

                      sm:w-8
                      sm:h-8

                      items-center
                      justify-center

                      rounded-full
                      bg-[#FFFDF9]
                      ring-4
                      ring-[#FFFDF9]
                    "
                    >
                      <div
                        className="
                        w-5
                        h-5
                        rounded
                        bg-[#F0CAA8]/55
                        animate-pulse
                      "
                      />
                    </div>
                  </div>
                ))}
              </div>

            ) : streak?.week ? (

              <div
                className="relative px-0.5 pt-0.5"
                role="list"
                aria-label="This week's streak"
              >
                {/* BLUE LINE BEHIND CUPS */}
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    left-[7%]
                    right-[7%]

                    top-[31px]
                    sm:top-[34px]

                    h-[2px]

                    rounded-full
                    bg-[#19183B]/8
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    right-[7%]

                    top-[31px]
                    sm:top-[34px]

                    h-[2px]

                    rounded-full
                    bg-[#00A9FF]/55
                  "
                  style={{
                    left: `${7 + firstActiveWeekIndex * (86 / 6)}%`,
                  }}
                />

                <div
                  className="
                  relative
                  z-10
                  grid
                  grid-cols-7
                  gap-0.5

                  sm:gap-2
                "
                >
                  {streak.week.map((day, idx) => {
                    const { src } =
                      getDayCupSrc(day.status);

                    const isToday =
                      day.isToday;

                    const isBeforeStart =
                      Boolean(
                        accountStartDateLocal &&
                        typeof day.dateLocal === "string" &&
                        day.dateLocal <
                        accountStartDateLocal,
                      );

                    const isFuture =
                      day.status === "future" ||
                      day.status === "neutral";

                    const isFreezeUsed =
                      day.status === "freeze_used";

                    const isTodayPending =
                      day.status === "today_pending";

                    return (
                      <div
                        key={day.dateLocal || idx}
                        role="listitem"
                        aria-label={
                          isBeforeStart
                            ? `${day.dayLabel}: before your streak started`
                            : `${day.dayLabel}: ${day.status}`
                        }
                        className="
                        flex
                        flex-col
                        items-center
                        min-w-0
                      "
                      >
                        {/* DAY */}
                        <span
                          className={[
                            "mb-1.5",
                            "max-w-full",
                            "truncate",
                            "text-[8px]",
                            "sm:text-[10px]",
                            "font-bold",
                            "leading-none",

                            isToday
                              ? "text-[#00A9FF]"
                              : isBeforeStart
                                ? "text-[#19183B]/18"
                                : "text-[#19183B]/45",
                          ].join(" ")}
                        >
                          {day.dayLabel}
                        </span>

                        {/* CUP */}
                        <div
                          className="
                          relative
                          flex

                          w-7
                          h-7

                          sm:w-9
                          sm:h-9

                          items-center
                          justify-center

                          rounded-full

                          bg-[#FFFDF9]

                          ring-[3px]
                          ring-[#FFFDF9]
                        "
                        >
                          <Image
                            src={src}
                            alt=""
                            aria-hidden="true"
                            width={36}
                            height={36}
                            className={[
                              "w-6 h-6 sm:w-8 sm:h-8 object-contain transition-opacity duration-200",
                              isBeforeStart
                                ? "opacity-[0.14]"
                                : isFuture
                                  ? "opacity-35"
                                  : "opacity-100",
                            ].join(" ")}
                          />

                          {isTodayPending && (
                            <span
                              aria-label="Today pending"
                              className="
                              absolute
                              -bottom-1
                              left-1/2
                              -translate-x-1/2

                              w-1.5
                              h-1.5

                              rounded-full
                              bg-[#00A9FF]
                            "
                            />
                          )}

                          {isFreezeUsed && (
                            <Shield
                              aria-label="Streak protected"
                              className="
                              absolute
                              -bottom-1
                              -right-1

                              w-3
                              h-3

                              rounded-full
                              bg-white
                              text-[#00A9FF]
                            "
                            />
                          )}
                        </div>

                        {/* TODAY */}
                        <span
                          className={[
                            "mt-1.5",
                            "h-3",
                            "text-[7px]",
                            "sm:text-[9px]",
                            "font-extrabold",
                            "uppercase",
                            "tracking-wide",

                            isToday
                              ? "text-[#00A9FF]"
                              : "text-transparent",
                          ].join(" ")}
                        >
                          {isToday ? "Today" : "·"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            ) : (

              <p
                className="
                py-4
                text-center
                sm:text-right
                text-sm
                italic
                text-[#19183B]/45
              "
              >
                Start learning to build your streak.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EARN BACK */}
      {earnBackMsg && (
        <div
          className="
          flex
          items-start
          gap-2.5

          rounded-[16px]

          border
          border-[#F2B47A]

          bg-[#FFF2E5]

          px-3.5
          py-2.5

          text-xs
          sm:text-sm

          font-semibold
          text-[#9A4D17]
        "
        >
          <Flame className="w-4 h-4 shrink-0 mt-0.5" />

          <p>{earnBackMsg}</p>
        </div>
      )}

      {/* MONTHLY CALENDAR */}
      {calendarOpen && (
        <StreakCalendarModal
          open={true}
          onClose={() => setCalendarOpen(false)}
          user={user}
          initialMonth={currentMonth}
          currentMonth={currentMonth}
          minimumMonth={minimumMonth}
          liveWeek={streak?.week || []}
          lastCompletedDateLocal={
            streak?.lastCompletedDateLocal || null
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