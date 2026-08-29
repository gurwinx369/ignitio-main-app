import {
  Flame,
  Shield,
} from "lucide-react";

import {
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

export default function StreakStatusCard({
  streak,
  isLoadingProfile,
  user,
}) {
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
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col gap-3">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Your Streak
        </p>
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="text-xs font-bold text-[#06b6d4] hover:text-[#0891b2] transition-colors flex items-center gap-1"
          aria-label="View monthly streak calendar"
        >
          Monthly Streak →
        </button>
      </div>

      {/* ── Secondary counts ── */}
      {!isLoadingProfile && (
        <p className="text-sm font-semibold text-slate-500 -mt-2">
          {currentCount > 0 ? (
            <>
              <span className="text-slate-900 font-bold">{currentCount}</span>{" "}
              day streak
              {longestCount > 0 && (
                <>
                  {" "}
                  •{" "}
                  <span className="text-slate-400">
                    Best {longestCount} days
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-slate-400">Start learning to build your streak.</span>
          )}
        </p>
      )}

      {isLoadingProfile && (
        <div className="animate-pulse h-4 bg-slate-100 rounded-full w-40 -mt-2" />
      )}

      {/* ── Big cup + energy fill ── */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative w-24 h-32 sm:w-28 sm:h-36 flex items-end justify-center"
          aria-label={`Weekly energy ${weeklyEnergy} of 7`}
        >
          {/* Cyan energy fill bar — sits behind the cup image */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 sm:w-14 rounded-b-lg overflow-hidden"
            style={{ height: "75%" }}
            aria-hidden="true"
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-[#06b6d4]/30 rounded-b-lg transition-all duration-700 ease-out"
              style={{
                height: `${(weeklyEnergy / 7) * 100}%`,
              }}
            />
          </div>

          {/* Cup PNG rendered above the fill */}
          <Image
            src="/streak/big_cup_7_days.png"
            alt=""
            aria-hidden="true"
            width={112}
            height={144}
            className="relative z-10 w-full h-full object-contain drop-shadow-sm"
            priority
          />
        </div>

        {/* Energy label */}
        <p className="text-sm font-bold text-slate-700">
          Weekly energy{" "}
          <span className="text-[#0891b2]">
            {weeklyEnergy}
          </span>
          /7
        </p>
      </div>

      {/* ── Seven daily cups ── */}
      {isLoadingProfile ? (
        <div className="flex justify-between w-full px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col items-center gap-1"
            >
              <div className="w-7 h-7 bg-slate-100 rounded-full" />
              <div className="w-4 h-2 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : streak?.week ? (
        <div className="flex justify-between items-end w-full" role="list" aria-label="This week's streak">
          {streak.week.map((day, idx) => {
            const { src } = getDayCupSrc(day.status);
            const isToday = day.isToday;
            const isFuture = day.status === "future" || day.status === "neutral";
            const isFreezeUsed = day.status === "freeze_used";
            const isTodayPending = day.status === "today_pending";

            return (
              <div
                key={day.dateLocal || idx}
                className="flex flex-col items-center gap-0.5"
                style={{ minHeight: "4rem" }}
                role="listitem"
                aria-label={`${day.dayLabel}: ${day.status}`}
              >
                {/* Day label */}
                <span
                  className={`text-[10px] font-bold ${
                    isToday ? "text-[#0891b2]" : "text-slate-400"
                  }`}
                >
                  {day.dayLabel}
                </span>

                {/* Cup image */}
                <div className="relative mt-0.5">
                  <Image
                    src={src}
                    alt=""
                    aria-hidden="true"
                    width={40}
                    height={40}
                    className={[
                      "w-7 h-7 sm:w-10 sm:h-10 object-contain transition-opacity duration-200",
                      isFuture ? "opacity-25" : "opacity-100",
                    ].join(" ")}
                  />

                  {/* Today pending indicator — small cyan dot below cup */}
                  {isTodayPending && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#06b6d4]"
                      aria-label="Today"
                    />
                  )}

                  {/* Freeze indicator */}
                  {isFreezeUsed && (
                    <Shield
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-blue-400 bg-white rounded-full"
                      aria-label="Streak protected"
                    />
                  )}
                </div>

                {/* Today text — always reserved so column height is uniform */}
                <span
                  className={[
                    "text-[9px] font-bold uppercase tracking-wide leading-none mt-0.5",
                    isToday ? "text-[#06b6d4]" : "invisible",
                  ].join(" ")}
                  aria-hidden={!isToday}
                >
                  Today
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 italic py-2">
          Start learning to build your streak.
        </p>
      )}

      {/* ── Earn-Back ── */}
      {earnBackMsg && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700 flex gap-3 items-start animate-in fade-in">
          <Flame className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{earnBackMsg}</p>
        </div>
      )}

      {/* ── Monthly Streak Calendar ── */}
      {calendarOpen && (
        <StreakCalendarModal
          open={true}
          onClose={() => setCalendarOpen(false)}
          user={user}
          initialMonth={currentMonth}
          currentMonth={currentMonth}
          minimumMonth={minimumMonth}
          liveWeek={streak?.week || []}
          lastCompletedDateLocal={streak?.lastCompletedDateLocal || null}
          currentCount={streak?.currentCount || 0}
          longestCount={streak?.longestCount || 0}
        />
      )}
    </div>
  );
}