"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_ROUTES } from "@/features/onboarding/v4-genai/paywall/constants/routes";
import { syncOnboardingFromLocalStorage } from "@/lib/onboarding/sync-localstorage";
import { deriveScheduleFromBrowser } from "@/lib/onboarding/schedule-periods";
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

export default function RoleScheduleController() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGenAiPreview = searchParams.get("from") === "genai_preview";
  const { user, userProfile, mutateProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const executedRef = useRef(false);

  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);
  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: true });

  useEffect(() => {
    if (!user || executedRef.current) return;
    executedRef.current = true;

    async function applySilentRoleAndSchedule() {
      try {
        setLoading(true);
        setErrorMsg("");

        const idToken = await user.getIdToken();

        // 1. Flush local storage onboarding data (goal + diagnostic answers)
        await syncOnboardingFromLocalStorage(idToken).catch(() => {});

        // 2. Automatically derive role and schedule (identical to free path derivation)
        const derived = deriveScheduleFromBrowser();
        const roleToAssign =
          (userProfile && userProfile !== "missing" && userProfile.role) ||
          (typeof window !== "undefined" && localStorage.getItem("profession")) ||
          "developer";

        const schedulePayload = {
          role: roleToAssign,
          schedule: {
            timezone: derived.timezone,
            windows: [
              {
                period: derived.period,
                startTime: derived.startTime,
                endTime: derived.endTime,
              },
            ],
          },
        };

        const response = await fetch("/api/v2/onboarding/role-schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(schedulePayload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || data.detail || "Failed to set up profile.");
        }

        await mutateProfile().catch(() => {});

        // 3. Seamless transition forward — no role or schedule prompts
        if (isGenAiPreview) {
          router.replace("/onboarding/paywall");
          return;
        }

        // Activate roadmap directly — eliminating the deprecated /onboarding/activation screen
        const actRes = await fetch("/api/v2/onboarding/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({}),
        }).catch(() => null);

        let startingRoute = null;
        let startingTier = null;
        if (actRes && actRes.ok) {
          const actData = await actRes.json().catch(() => ({}));
          startingRoute = actData.startingRoute;
          startingTier = actData.startingTier;
          if (!startingRoute && actData.beginnerSkipped) {
            startingRoute = "/home/premium/genai/intermediate";
            startingTier = "intermediate";
          }
        }

        try {
          localStorage.setItem("ignitio:streak_phase", "anticipated");
          const roleGoal =
            (userProfile && userProfile !== "missing" && userProfile.goal) ||
            localStorage.getItem("goal") ||
            "gen_ai";
          const fallbackHref =
            roleGoal === "dsa"
              ? "/home/roadmaps/dsa"
              : roleGoal === "gen_ai"
                ? "/home/premium/genai/beginner"
                : "/home/roadmaps/python-beginner";
          const finalHref = startingRoute || fallbackHref;
          localStorage.setItem("ignitio:streak_lesson_href", finalHref);
          if (startingTier) {
            localStorage.setItem("ignitio:genai_starting_tier", startingTier);
          }
        } catch {}

        await mutateProfile().catch(() => {});
        router.replace("/onboarding/streak");
      } catch (err) {
        executedRef.current = false;
        setErrorMsg(err.message || "Failed to automatically finalize setup.");
        setLoading(false);
      }
    }

    applySilentRoleAndSchedule();
  }, [user, userProfile, isGenAiPreview, mutateProfile, router]);

  const handleRetry = () => {
    executedRef.current = false;
    setErrorMsg("");
    setLoading(true);
  };

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{
        background: "linear-gradient(180deg, #FFF6EE 0%, #FFE3CE 100%)",
      }}
    >
      <div className="w-full max-w-[420px] flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
        {/* Kibo Mascot */}
        <div
          className="relative mb-6 cursor-pointer select-none"
          style={{ width: 88, height: 88 }}
          aria-label="Kibo"
        >
          <KiboBody
            visualState={loading ? "speaking" : "idle"}
            petSize={88}
            wrapperRef={wrapperRef}
            eyesRef={eyesRef}
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#001D32] mb-2 tracking-tight">
          {errorMsg ? "Almost there!" : "Setting up your plan…"}
        </h1>

        <p className="text-[14px] text-slate-500 max-w-[300px] mb-6 leading-relaxed">
          {errorMsg
            ? errorMsg
            : "Deriving your personalized roadmap pacing and study windows automatically."}
        </p>

        {loading && (
          <div className="flex items-center gap-2.5 text-sm font-semibold text-[#00A9FF]">
            <Loader2 className="animate-spin" size={18} />
            <span>Finalizing…</span>
          </div>
        )}

        {errorMsg && (
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-3.5 rounded-2xl bg-[#00A9FF] hover:bg-[#0096e6] text-white font-extrabold uppercase tracking-wide text-sm transition-all shadow-[0_4px_0_#007bcc] active:translate-y-0.5 active:shadow-[0_2px_0_#007bcc]"
          >
            Retry Setup
          </button>
        )}
      </div>
    </main>
  );
}