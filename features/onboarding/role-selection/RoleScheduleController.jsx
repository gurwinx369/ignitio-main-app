"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Loader2,
  GraduationCap,
  PenTool,
  Palette,
  Code,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import ClockDialPicker from "./ClockDialPicker";

import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_ROUTES } from "@/features/onboarding/paywall/constants/routes";
import OnboardingShell from "../components/OnboardingShell";
import { getDiagnosticResults } from "@/features/onboarding/results/services/getDiagnosticResults";
import { syncOnboardingFromLocalStorage } from "@/lib/onboarding/sync-localstorage";

import {
  SCHEDULE_PERIOD_CONFIG,
  validateTimeWithinPeriod,
} from "@/lib/onboarding/schedule-periods";

const ROLE_OPTIONS = [
  {
    id: "student",
    title: "Student",
    icon: <GraduationCap className="text-[#001D32]" size={24} />,
    bg: "bg-slate-100",
  },
  {
    id: "writer",
    title: "Writer",
    icon: <PenTool className="text-[#001D32]" size={24} />,
    bg: "bg-slate-100",
  },
  {
    id: "designer",
    title: "Designer",
    icon: <Palette className="text-[#001D32]" size={24} />,
    bg: "bg-slate-100",
  },
  {
    id: "developer",
    title: "Developer",
    icon: <Code className="text-[#001D32]" size={24} />,
    bg: "bg-slate-100",
  },
  {
    id: "other",
    title: "Other",
    icon: <Briefcase className="text-[#001D32]" size={24} />,
    bg: "bg-slate-100",
  },
];

export default function RoleScheduleController() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGenAiPreview = searchParams.get("from") === "genai_preview";
  const { user, userProfile, mutateProfile } = useAuth();

  const [step, setStep] =
    useState("role");

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [role, setRole] = useState("");
  const [hasPrefilledRole, setHasPrefilledRole] = useState(false);

  React.useEffect(() => {
    if (user && userProfile === "missing") {
      user.getIdToken().then((token) => {
        fetch("/api/v2/user", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: user.email })
        }).then(() => mutateProfile()).catch(() => {});
      });
    } else if (userProfile && userProfile !== "missing") {
      const existingRole = userProfile.role;
      const currentStep = userProfile.onboardingState?.step;
      if (existingRole && currentStep !== "role_selection") {
        setRole(existingRole);
        setStep("schedule");
        setHasPrefilledRole(true);
      }
    } else if (!user && typeof window !== "undefined") {
      const savedRole = localStorage.getItem("profession");
      if (savedRole) {
        setRole(savedRole);
        setStep("schedule");
        setHasPrefilledRole(true);
      }
    }
  }, [user, userProfile, mutateProfile]);

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

  const [period, setPeriod] =
    useState("MORNING");

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("09:00");

  const [durationMins, setDurationMins] = useState(60);

  // ponytail: fetch diagnostic pacing to pre-fill end time, fallback to 60m
  React.useEffect(() => {
    if (!user) return;
    user.getIdToken().then(token => {
      getDiagnosticResults(token).then(data => {
        const cat = data?.results?.pacing?.category;
        if (cat === "20_30") setDurationMins(30);
        else if (cat === "90_plus") setDurationMins(90);
        else if (cat === "45_60") setDurationMins(60);
      }).catch(() => {});
    });
  }, [user]);

  function addMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(":").map(Number);
    let totalM = m + mins;
    let newH = (h + Math.floor(totalM / 60)) % 24;
    let newM = totalM % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

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
      const idToken =
        await user.getIdToken();

      // Flush all localStorage onboarding data (goal + GenAI diagnostic) to the backend.
      // Runs for every user regardless of path — the helper is a no-op if keys are absent.
      await syncOnboardingFromLocalStorage(idToken);

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

      if (isGenAiPreview) {
        router.push("/onboarding/paywall");
        return;
      }

      const nextRoute =
        data.nextStep
          ? ONBOARDING_ROUTES[
          data.nextStep
          ]
          : null;

      if (!nextRoute) {
        setErrorMsg("System error: Unknown next step.");
        setLoading(false);
        return;
      }

      // Revalidate the global profile state since we just mutated the user
      await mutateProfile();

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
                  className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#4EC3FF] bg-[#A8E2FF]"
                      : "border-[#FFDCBC] bg-white hover:border-[#4EC3FF]"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${isSelected ? 'bg-white/50' : opt.bg} flex items-center justify-center shrink-0`}>
                    {opt.icon}
                  </div>

                  <div className="ml-4 flex-1">
                    <p className={`text-base font-bold ${isSelected ? 'text-[#001D32]' : 'text-[#001D32]'}`}>
                      {opt.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                      isSelected ? "border-[#00A9FF] bg-[#00A9FF]" : "border-[#FFDCBC] bg-white"
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 mt-2">
              {errorMsg}
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={handleRoleNext}
              disabled={!role}
              className={`w-full py-4 text-white font-bold text-lg rounded-full uppercase tracking-wide transition-all ${
                role
                  ? "bg-[#00A9FF] hover:bg-[#0096e6] active:translate-y-1"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
              style={role ? { boxShadow: "0 4px 0 #004B74" } : {}}
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
        {!hasPrefilledRole && (
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
        )}

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border-2 border-[#FFDCBC] bg-white p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-[#001D32]">
              <Clock size={20} className="text-[#00A9FF]" />
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
                  className="h-12 w-full rounded-xl border-2 border-[#FFDCBC] bg-white px-4 text-sm text-[#001D32] font-medium outline-none focus:border-[#4EC3FF] focus:ring-0 transition-colors"
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
                  <ClockDialPicker
                    label="From"
                    value={startTime}
                    onChange={(val) => {
                      setStartTime(val);
                      setEndTime(addMinutes(val, durationMins));
                      setErrorMsg("");
                    }}
                    minTime={activePeriodConfig.min}
                    maxTime={activePeriodConfig.max}
                    periodName={period}
                  />
                </div>

                <div className="flex-1">
                  <ClockDialPicker
                    label="To"
                    value={endTime}
                    onChange={(val) => {
                      setEndTime(val);
                      setErrorMsg("");
                    }}
                    minTime={activePeriodConfig.min}
                    maxTime={activePeriodConfig.max}
                    periodName={period}
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
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wide text-white transition-all ${
              loading || !user
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-[#00A9FF] hover:bg-[#0096e6] active:translate-y-1"
            }`}
            style={(!loading && user) ? { boxShadow: "0 4px 0 #004B74" } : {}}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}