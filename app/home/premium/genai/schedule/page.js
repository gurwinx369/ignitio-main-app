"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Loader2, RotateCw, Home } from "lucide-react";

import { useAuth } from "@/features/context/AuthContext";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import {
  SCHEDULE_PERIOD_CONFIG,
  validateTimeWithinPeriod,
} from "@/lib/onboarding/schedule-periods";
import Loader from "@/layout/Loader";

function VerificationError({ message, onRetry, onHome }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf3] p-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Unable to Verify Access
        </h2>
        <p className="mb-6 text-slate-600">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <RotateCw size={18} aria-hidden="true" />
            Retry Connection
          </button>
          <button
            type="button"
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Home size={18} aria-hidden="true" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PremiumSchedulePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { status, hasGenAiAccess, retry } = usePremiumAccess();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [
    profileState,
    setProfileState,
  ] = useState({
    status: "loading",
    checkedUid: null,
  });

  const [
    profileRetryKey,
    setProfileRetryKey,
  ] = useState(0);

  // Timezone is auto-detected from the browser; no UI dropdown needed.
  const [timezone] = useState(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectedTimezone) return detectedTimezone;
    } catch {
      // fall through
    }
    return "UTC";
  });

  const [period, setPeriod] = useState("MORNING");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const activePeriodConfig =
    SCHEDULE_PERIOD_CONFIG[period];

  useEffect(() => {
    if (status === "foundation") {
      router.replace("/home/premium/genai/paywall");
    }
  }, [status, router]);

  useEffect(() => {
    if (
      status !== "premium" ||
      hasGenAiAccess !== true ||
      !user
    ) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const checkProfile = async () => {
      if (isActive) {
        setProfileState({
          status: "loading",
          checkedUid: user.uid,
        });
      }

      try {
        const token = await user.getIdToken();

        const res = await fetch("/api/v2/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(
            "Failed to verify profile",
          );
        }

        const data = await res.json();

        const scheduleWindows =
          data?.user?.schedulePreference?.windows;

        const hasRealSchedule =
          Array.isArray(scheduleWindows) &&
          scheduleWindows.length > 0;

        if (!isActive) {
          return;
        }

        if (hasRealSchedule) {
          router.replace(
            "/home/premium/genai",
          );

          return;
        }

        setProfileState({
          status: "required",
          checkedUid: user.uid,
        });
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        if (isActive) {
          setProfileState({
            status: "error",
            checkedUid: user.uid,
          });
        }
      }
    };

    void checkProfile();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    status,
    hasGenAiAccess,
    user,
    router,
    profileRetryKey,
  ]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!period || !startTime || !endTime) {
      setErrorMsg("Please complete your schedule preferences.");
      return;
    }

    const periodValidation =
      validateTimeWithinPeriod({
        period,
        startTime,
        endTime,
      });

    if (!periodValidation.valid) {
      setErrorMsg(
        periodValidation.error,
      );

      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const idToken = await user.getIdToken(true);

      const response = await fetch("/api/v2/premium/genai/schedule", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          schedule: {
            timezone,
            windows: [
              {
                period,
                startTime,
                endTime,
              },
            ],
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMsg(data.detail || data.message || "Failed to save preferences.");
        setLoading(false);
        return;
      }

      router.replace("/home/premium/genai");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (status === "error") {
    return (
      <VerificationError
        message="We could not verify your Premium access at this time. Please try again."
        onRetry={retry}
        onHome={() => router.push("/home")}
      />
    );
  }

  if (
    status === "premium" &&
    hasGenAiAccess === true &&
    user &&
    profileState.status === "error" &&
    profileState.checkedUid === user.uid
  ) {
    return (
      <VerificationError
        message="We could not verify your profile at this time. Please try again."
        onRetry={() => {
          setProfileRetryKey(
            (current) => current + 1,
          );
        }}
        onHome={() =>
          router.push("/home")
        }
      />
    );
  }

  if (
    status === "loading" ||
    status === "foundation" ||
    !user ||
    profileState.status === "loading" ||
    profileState.checkedUid !== user.uid
  ) {
    return <Loader />;
  }

  if (
    profileState.status !== "required" ||
    profileState.checkedUid !== user.uid
  ) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf3] p-4 font-sans text-slate-900">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">Set your learning schedule</h1>
        <p className="text-lg text-slate-600">
          Choose when you usually want to learn so we can personalize your roadmap experience.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-slate-800">
              <Clock size={20} className="text-purple-600" />
              <h3 className="text-base font-bold">Daily Learning Window</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="learning-period"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Period
                </label>
                <select
                  id="learning-period"
                  value={period}
                  onChange={(event) => {
                    setPeriod(event.target.value);
                    setErrorMsg("");
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
                >
                  <option value="MORNING">Morning</option>
                  <option value="NOON">Noon</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="learning-start-time"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    From
                  </label>
                  <input
                    id="learning-start-time"
                    type="time"
                    value={startTime}
                    min={activePeriodConfig.min}
                    max={activePeriodConfig.max}
                    onChange={(event) => {
                      setStartTime(
                        event.target.value,
                      );
                      setErrorMsg("");
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="learning-end-time"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    To
                  </label>
                  <input
                    id="learning-end-time"
                    type="time"
                    value={endTime}
                    min={activePeriodConfig.min}
                    max={activePeriodConfig.max}
                    onChange={(event) => {
                      setEndTime(
                        event.target.value,
                      );
                      setErrorMsg("");
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 mt-6">
            {errorMsg}
          </div>
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !user}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white transition-all ${loading || !user
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-900 shadow-md hover:bg-slate-800"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                Save Schedule
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
