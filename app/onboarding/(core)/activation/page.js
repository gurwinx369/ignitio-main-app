"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/context/AuthContext";
import OnboardingShell from "@/features/onboarding/core/components/OnboardingShell";

export default function ActivationPage() {
  const router = useRouter();
  const { user, mutateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const hasRequested = useRef(false);

  const performActivation = React.useCallback(async (user) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/v2/onboarding/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        // Self-healing: if activation failed because schedule windows were not yet persisted,
        // auto-derive the schedule from the browser and persist it before re-attempting activation.
        if (
          res.status === 422 &&
          typeof data.error === "string" &&
          data.error.toLowerCase().includes("schedule")
        ) {
          try {
            const { deriveScheduleFromBrowser } = await import(
              "@/lib/onboarding/schedule-periods"
            );
            const derived = deriveScheduleFromBrowser();
            const schedRes = await fetch("/api/v2/onboarding/role-schedule", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                role: "developer",
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
              }),
            });

            if (schedRes.ok) {
              const retryRes = await fetch("/api/v2/onboarding/activate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
              });
              const retryData = await retryRes.json();
              if (retryRes.ok && retryData.success && retryData.nextStep === "completed") {
                await mutateProfile();
                router.replace("/home");
                return;
              }
            }
          } catch (autoHealErr) {
            console.error("Auto-heal schedule error:", autoHealErr);
          }
        }

        setErrorMsg(data.error || "Failed to generate your personalized roadmap.");
        setLoading(false);
        hasRequested.current = false; // Allow manual retry
        return;
      }

      // Success or Idempotent Success
      if (data.success && data.nextStep === "completed") {
        await mutateProfile(); // Invalidate the cached profile so /home doesn't bounce us back
        router.replace("/home"); // Final transition to main app
      } else {
        setErrorMsg("Unexpected response from server.");
        setLoading(false);
        hasRequested.current = false;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
      hasRequested.current = false;
    }
  }, [router, mutateProfile]);

  useEffect(() => {
    // user is obtained from useAuth
    if (user === undefined) {
      return; // wait for initialization if applicable
    }
    
    if (!user) {
      setTimeout(() => {
        setErrorMsg("Authentication required.");
        setLoading(false);
      }, 0);
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;
    
    performActivation(user);
  }, [user, performActivation]);

  const handleRetry = async () => {
    if (loading) return;
    if (user) {
      hasRequested.current = true;
      await performActivation(user);
    }
  };

  return (
    <OnboardingShell 
      step={5}
      title="Preparing your roadmap"
      subtitle="Applying your schedule and getting everything ready."
    >
      <div className="max-w-md mx-auto w-full bg-white p-8 sm:p-12 rounded-3xl border-2 border-[#FFDCBC] text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#E5F6FF] rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#00A9FF] w-10 h-10" />
            </div>
            <p className="text-[#4A5568] text-sm">
              This will only take a moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium w-full">
              {errorMsg}
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 w-full py-4 bg-[#00A9FF] text-white font-bold rounded-full uppercase tracking-wide hover:bg-[#0096e6] transition-all active:translate-y-1"
              style={{ boxShadow: "0 4px 0 #004B74" }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
