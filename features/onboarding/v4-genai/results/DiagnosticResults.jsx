"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { getOrCreateOnboardingSessionId } from "@/lib/analytics/onboardingSession";

import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_STEP_ROUTES } from "@/features/onboarding/v4-genai/diagnostic/constants/routes";
import { getDiagnosticResults } from "./services/getDiagnosticResults";
import { continueToPaywall } from "./services/continueToPaywall";

import OnboardingShell from "@/features/onboarding/core/components/OnboardingShell";
import { RoadmapResult } from "@/components/roadmap/roadmap-result";

const MINIMUM_PREPARATION_MS = 2400;

export default function DiagnosticResults() {
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── PostHog Step 5 Tracking (roadmap_reveal) ──────────────────────────────
  const revealStartedAtRef = useRef(Date.now());
  const hasCompletedRevealRef = useRef(false);

  useEffect(() => {
    const sessionId = getOrCreateOnboardingSessionId();
    revealStartedAtRef.current = Date.now();

    try {
      posthog.capture("onboarding_step_viewed", {
        step_id: "roadmap_reveal",
        step_index: 5,
        onboarding_session_id: sessionId,
      });
    } catch {}

    const handleLeave = () => {
      if (!hasCompletedRevealRef.current) {
        try {
          posthog.capture("onboarding_step_abandoned", {
            step_id: "roadmap_reveal",
            step_index: 5,
            onboarding_session_id: sessionId,
            time_on_step_ms: Date.now() - revealStartedAtRef.current,
          });
        } catch {}
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, []);

  const [preparationStatus, setPreparationStatus] = useState("idle");

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      try {
        if (!user) {
          const stored = localStorage.getItem("genai_preview_assessment");
          if (!stored) {
            // Default to prompt + system design if no preview exists
            setData({ roadmap: ["prompt", "system_design"] });
            setLoading(false);
            return;
          }

          const payload = JSON.parse(stored);
          const { evaluateDiagnosticPayload } =
            await import("@/lib/onboarding/diagnostic-evaluation");
          const { buildDiagnosticResults } =
            await import("./server/buildDiagnosticResults");

          const evaluation = evaluateDiagnosticPayload(payload);
          if (!evaluation.success) {
            setData({ roadmap: ["prompt", "system_design"] });
            setLoading(false);
            return;
          }

          if (isMounted) {
            setData(buildDiagnosticResults(evaluation.persistenceFields));
            setLoading(false);
          }
          return;
        }

        const idToken = await user.getIdToken();
        const res = await getDiagnosticResults(idToken);

        if (!isMounted) return;

        if (!res.success || !res.results) {
          // Graceful fallback to Gen AI core stages if results unavailable
          setData({ roadmap: ["prompt", "system_design"] });
          setLoading(false);
          return;
        }

        setData(res.results);
      } catch (err) {
        if (isMounted) {
          setData({ roadmap: ["prompt", "system_design"] });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleContinue = async () => {
    if (preparationStatus === "preparing") {
      return;
    }

    if (!user) {
      router.push("/auth/signup?from=genai&redirect=/onboarding/paywall");
      return;
    }

    setPreparationStatus("preparing");

    try {
      const minimumDelay = new Promise((resolve) => {
        setTimeout(resolve, MINIMUM_PREPARATION_MS);
      });

      const idToken = await user.getIdToken();
      const transitionRequest = continueToPaywall(idToken);

      const [res] = await Promise.all([transitionRequest, minimumDelay]);

      if (!res.success) {
        throw new Error(res.message || "An error occurred while continuing.");
      }

      hasCompletedRevealRef.current = true;
      try {
        const sessionId = getOrCreateOnboardingSessionId();
        posthog.capture("onboarding_step_completed", {
          step_id: "roadmap_reveal",
          step_index: 5,
          onboarding_session_id: sessionId,
          time_on_step_ms: Date.now() - revealStartedAtRef.current,
        });
      } catch {}

      const destination = ONBOARDING_STEP_ROUTES[res.nextStep];
      router.replace(destination || "/onboarding/paywall");
    } catch (err) {
      try {
        posthog.captureException(err, {
          step_id: "roadmap_reveal",
          onboarding_session_id: getOrCreateOnboardingSessionId(),
          api_endpoint: "/api/v2/onboarding/results/continue",
        });
      } catch {}

      router.replace("/onboarding/paywall");
    }
  };

  const roadmapIds = useMemo(() => {
    if (data?.roadmap && Array.isArray(data.roadmap) && data.roadmap.length > 0) {
      return data.roadmap;
    }
    return ["prompt", "system_design"];
  }, [data]);

  if (error && !data) {
    return (
      <OnboardingShell step={2} hideProgress>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-800 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-red-600">
            Could not load results
          </h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-colors hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </OnboardingShell>
    );
  }

  // Directly render RoadmapResult with its own pixel-swap and intro — no duplicate loader
  return (
    <RoadmapResult
      key="roadmap-result"
      goal="gen_ai"
      roadmapIds={roadmapIds}
      onContinue={handleContinue}
      onBack={() => router.push("/onboarding/diagnostic")}
    />
  );
}
