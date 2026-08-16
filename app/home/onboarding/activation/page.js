"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/context/AuthContext";
import OnboardingShell from "@/features/onboarding/components/OnboardingShell";

export default function ActivationPage() {
  const router = useRouter();
  const { user } = useAuth();
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
        setErrorMsg(data.error || "Failed to generate your personalized roadmap.");
        setLoading(false);
        hasRequested.current = false; // Allow manual retry
        return;
      }

      // Success or Idempotent Success
      if (data.success && data.nextStep === "completed") {
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
  }, [router]);

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
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      title="Building Your Roadmap"
      subtitle="We are analyzing your diagnostic results and personalizing your curriculum..."
    >
      <div className="max-w-md mx-auto w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
            </div>
            <p className="text-slate-500 text-sm">
              This will only take a few moments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium w-full">
              {errorMsg}
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors"
            >
              Retry Activation
            </button>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
