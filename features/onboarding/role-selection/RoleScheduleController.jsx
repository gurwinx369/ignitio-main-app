"use client";

import React, {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Globe,
  Loader2,
  GraduationCap,
  PenTool,
  Palette,
  Code,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_ROUTES } from "@/features/onboarding/paywall/constants/routes";
import OnboardingShell from "../components/OnboardingShell";

import {
  SCHEDULE_PERIOD_CONFIG,
  validateTimeWithinPeriod,
} from "@/lib/onboarding/schedule-periods";

const ROLE_OPTIONS = [
  {
    id: "student",
    title: "Student",
    icon: (
      <GraduationCap
        className="text-green-600"
        size={24}
      />
    ),
    bg: "bg-green-50",
  },
  {
    id: "writer",
    title: "Writer",
    icon: (
      <PenTool
        className="text-amber-600"
        size={24}
      />
    ),
    bg: "bg-amber-50",
  },
  {
    id: "designer",
    title: "Designer",
    icon: (
      <Palette
        className="text-pink-600"
        size={24}
      />
    ),
    bg: "bg-pink-50",
  },
  {
    id: "developer",
    title: "Developer",
    icon: (
      <Code
        className="text-blue-600"
        size={24}
      />
    ),
    bg: "bg-blue-50",
  },
  {
    id: "other",
    title: "Other",
    icon: (
      <Briefcase
        className="text-purple-600"
        size={24}
      />
    ),
    bg: "bg-purple-50",
  },
];

export default function RoleScheduleController() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] =
    useState("role");

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [role, setRole] =
    useState("");

  const availableTimezones =
    useMemo(() => {
      try {
        return Intl.supportedValuesOf(
          "timeZone",
        );
      } catch {
        return ["UTC"];
      }
    }, []);

  const [timezone, setTimezone] =
    useState(() => {
      try {
        const detectedTimezone =
          Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;

        if (detectedTimezone) {
          return detectedTimezone;
        }
      } catch {
        // The user can select a timezone manually.
      }

      return "";
    });

  const [period, setPeriod] =
    useState("MORNING");

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("09:00");

  const activePeriodConfig =
    SCHEDULE_PERIOD_CONFIG[period];

  const handleRoleNext = () => {
    if (!role) {
      setErrorMsg(
        "Please select a role.",
      );
      return;
    }

    setErrorMsg("");
    setStep("schedule");
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg(
        "You must be logged in to save your preferences.",
      );
      return;
    }

    if (
      !timezone ||
      !period ||
      !startTime ||
      !endTime
    ) {
      setErrorMsg(
        "Please complete your schedule preferences.",
      );
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
      const idToken =
        await user.getIdToken();

      const response = await fetch(
        "/api/v2/onboarding/role-schedule",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role,
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
        },
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        setErrorMsg(
          data.detail ||
          data.message ||
          "Failed to save preferences.",
        );

        setLoading(false);
        return;
      }

      const nextRoute =
        data.nextStep
          ? ONBOARDING_ROUTES[
          data.nextStep
          ]
          : null;

      if (!nextRoute) {
        setErrorMsg(
          "System error: Unknown next step.",
        );

        setLoading(false);
        return;
      }

      router.push(nextRoute);
    } catch {
      setErrorMsg(
        "Network error. Please try again.",
      );

      setLoading(false);
    }
  };

  if (step === "role") {
    return (
      <OnboardingShell
        step={4}
        title="Choose your profession"
        subtitle="Tell us about yourself to personalize your learning path."
      >
        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
          {ROLE_OPTIONS.map(
            (opt) => {
              const isSelected =
                role === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setRole(opt.id);
                    setErrorMsg("");
                  }}
                  className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${isSelected
                      ? "border-purple-600 shadow-[0_4px_20px_rgba(147,51,234,0.15)] ring-1 ring-purple-600"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${opt.bg} flex items-center justify-center shrink-0`}
                  >
                    {opt.icon}
                  </div>

                  <div className="ml-4 flex-1">
                    <p className="text-base font-bold text-slate-900">
                      {opt.title}
                    </p>
                  </div>

                  <div className="text-purple-600">
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 fill-purple-600 text-white" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                </div>
              );
            },
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 mt-2">
              {errorMsg}
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={
                handleRoleNext
              }
              disabled={!role}
              className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all ${role
                  ? "bg-slate-900 hover:bg-slate-800 shadow-md"
                  : "bg-slate-300 cursor-not-allowed"
                }`}
            >
              Continue
            </button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={4}
      title="Set your schedule"
      subtitle="When is the best time for you to learn?"
    >
      <div className="w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            setErrorMsg("");
            setStep("role");
          }}
          className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          &larr; Back to roles
        </button>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <Globe
                size={20}
                className="text-purple-600"
              />

              <h3 className="text-base font-bold">
                Timezone
              </h3>
            </div>

            <select
              value={timezone}
              onChange={(event) => {
                setTimezone(
                  event.target.value,
                );

                setErrorMsg("");
              }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
            >
              <option
                value=""
                disabled
              >
                Select timezone
              </option>

              {availableTimezones.map(
                (timezoneOption) => (
                  <option
                    key={
                      timezoneOption
                    }
                    value={
                      timezoneOption
                    }
                  >
                    {
                      timezoneOption
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-slate-800">
              <Clock
                size={20}
                className="text-purple-600"
              />

              <h3 className="text-base font-bold">
                Daily Learning Window
              </h3>
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
                  onChange={(
                    event,
                  ) => {
                    const nextPeriod =
                      event.target
                        .value;

                    const nextConfig =
                      SCHEDULE_PERIOD_CONFIG[
                      nextPeriod
                      ];

                    setPeriod(
                      nextPeriod,
                    );

                    setStartTime(
                      nextConfig
                        .defaultStart,
                    );

                    setEndTime(
                      nextConfig
                        .defaultEnd,
                    );

                    setErrorMsg("");
                  }}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
                >
                  <option value="MORNING">
                    Morning
                  </option>

                  <option value="NOON">
                    Noon
                  </option>

                  <option value="EVENING">
                    Evening
                  </option>

                  <option value="NIGHT">
                    Night
                  </option>
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
                    value={
                      startTime
                    }
                    min={
                      activePeriodConfig.min
                    }
                    max={
                      activePeriodConfig.max
                    }
                    onChange={(
                      event,
                    ) => {
                      setStartTime(
                        event.target
                          .value,
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
                    min={
                      activePeriodConfig.min
                    }
                    max={
                      activePeriodConfig.max
                    }
                    onChange={(
                      event,
                    ) => {
                      setEndTime(
                        event.target
                          .value,
                      );

                      setErrorMsg("");
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {period ===
                  "MORNING" &&
                  "Morning: 5:00 AM – 12:00 PM"}

                {period ===
                  "NOON" &&
                  "Noon: 12:00 PM – 5:00 PM"}

                {period ===
                  "EVENING" &&
                  "Evening: 5:00 PM – 9:00 PM"}

                {period ===
                  "NIGHT" &&
                  "Night: 9:00 PM – 11:59 PM"}
              </p>
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
            disabled={
              loading || !user
            }
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white transition-all ${loading || !user
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 shadow-md hover:bg-slate-800"
              }`}
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={20}
                />

                Saving...
              </>
            ) : (
              <>
                Complete Setup

                <ArrowRight
                  size={20}
                />
              </>
            )}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}