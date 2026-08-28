"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_STEP_ROUTES } from "../diagnostic/constants/routes";
import { getDiagnosticResults } from "./services/getDiagnosticResults";
import { continueToPaywall } from "./services/continueToPaywall";

import DiagnosticResultsSkeleton from "./components/DiagnosticResultsSkeleton";
import ResultsSummary from "./components/ResultsSummary";
import SkillResultCard from "./components/SkillResultCard";
import PacingSummary from "./components/PacingSummary";
import GoalSummary from "./components/GoalSummary";
import ResultsActions from "./components/ResultsActions";
import OnboardingShell from "../components/OnboardingShell";
import LearningPlanPreparation from "../components/LearningPlanPreparation";

const MINIMUM_PREPARATION_MS = 2400;

export default function DiagnosticResults() {
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // "idle" | "preparing" | "error"
  const [
    preparationStatus,
    setPreparationStatus,
  ] = useState("idle");

  const [
    preparationError,
    setPreparationError,
  ] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      try {
        const idToken =
          await user.getIdToken();

        const res =
          await getDiagnosticResults(
            idToken,
          );

        if (!isMounted) {
          return;
        }

        if (!res.success) {
          setError(
            res.message ||
            "We couldn't load your results. Please try again.",
          );
          return;
        }

        if (!res.results) {
          setError(
            "Diagnostic results were not available. Please try again.",
          );
          return;
        }

        /*
         * This endpoint loads diagnostic result content.
         *
         * Do not navigate using res.nextStep here.
         * The persisted onboarding state remains "results"
         * until POST /api/v2/onboarding/results/continue
         * succeeds.
         *
         * Using the GET response for navigation causes:
         *
         * Results → Paywall
         * ProtectedRoute → Results
         * Results → Paywall
         */
        setData(res.results);
      } catch (err) {
        console.error(
          "Results fetch error:",
          err,
        );

        if (isMounted) {
          setError(
            "We couldn't load your results. Please try again.",
          );
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
    if (
      preparationStatus === "preparing" ||
      !user
    ) {
      return;
    }

    setPreparationStatus("preparing");
    setPreparationError(null);

    try {
      /*
       * Start the visual delay immediately so the
       * transition and server request overlap.
       */
      const minimumDelay = new Promise(
        (resolve) => {
          setTimeout(
            resolve,
            MINIMUM_PREPARATION_MS,
          );
        },
      );

      const idToken =
        await user.getIdToken();

      /*
       * This POST is the authoritative operation that
       * persists the onboarding transition from
       * "results" to "paywall".
       */
      const transitionRequest =
        continueToPaywall(idToken);

      const [res] = await Promise.all([
        transitionRequest,
        minimumDelay,
      ]);

      if (!res.success) {
        throw new Error(
          res.message ||
          "An error occurred while continuing.",
        );
      }

      const destination =
        ONBOARDING_STEP_ROUTES[
        res.nextStep
        ];

      if (!destination) {
        throw new Error(
          "Unsupported onboarding destination.",
        );
      }

      /*
       * Navigation happens only after the server has
       * persisted the new onboarding state.
       */
      router.replace(destination);
    } catch (err) {
      console.error(
        "Continue error:",
        err,
      );

      setPreparationError(err);
      setPreparationStatus("error");
    }
  };

  if (loading) {
    return (
      <DiagnosticResultsSkeleton />
    );
  }

  if (error && !data) {
    return (
      <OnboardingShell
        step={2}
        hideProgress
      >
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-800 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-red-600">
            Could not load results
          </h2>

          <p className="mb-6 text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-colors hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#07131D] text-white relative">
      {preparationStatus !== "idle" && (
        <LearningPlanPreparation
          status={preparationStatus}
          error={preparationError}
          onRetry={handleContinue}
        />
      )}

      <div className="w-full max-w-[430px] mx-auto flex flex-col pt-12 pb-12 px-4 flex-grow">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl text-white">
            Your Diagnostic Results
          </h1>

          <p className="text-lg text-slate-300">
            We've reviewed your skills. Here is how your learning recommendations are taking shape.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="w-full flex-grow mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10 px-4 leading-tight">
            {(data.summary?.passedChecks ?? 0) > 0
              ? "Your roadmap adapts around what you already know."
              : "Your personalized roadmap is ready."}
          </h2>

          {/* Roadmap spine + alternating nodes */}
          <div className="relative flex flex-col items-center">
            {/* Vertical spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#00A9FF] -translate-x-1/2" />

            {data.areas.map((area, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={area.id}
                  className="relative w-full flex items-center mb-8"
                >
                  {/* Module card */}
                  <div
                    className={`w-[44%] ${isLeft ? "mr-auto pr-3" : "ml-auto pl-3"
                      }`}
                  >
                    <div className="bg-[#102235] border border-slate-700/60 rounded-2xl p-3 shadow-sm">
                      <p className="text-white text-[13px] font-bold leading-snug mb-1">
                        {area.title}
                      </p>
                      {area.moduleLabel && (
                        <span className="text-[10px] font-semibold text-[#00A9FF] uppercase tracking-wide">
                          {area.moduleLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Spine node dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#00A9FF] border-2 border-[#07131D] z-10 shadow-[0_0_8px_rgba(0,169,255,0.6)]" />

                  {/* Connector line from node to card */}
                  {/* LEFT card: connector extends from spine (center) toward card (left), so it sits right of center */}
                  {/* RIGHT card: connector extends from spine (center) toward card (right), so it sits left of center */}
                  <div
                    className={`absolute top-1/2 h-[2px] bg-[#00A9FF]/40 w-[8%] ${isLeft
                      ? "right-[calc(50%+8px)]"
                      : "left-[calc(50%+8px)]"
                      }`}
                  />

                  {/* Status label — opposite side from card */}
                  <div
                    className={`absolute top-[calc(50%2px)] ${isLeft
                      ? "left-[calc(50%+20px)] text-left"
                      : "right-[calc(50%+20px)] text-right"
                      }`}
                  >
                    <span className="whitespace-nowrap text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                      {area.status === "passed"
                        ? "skip"
                        : area.status === "partial"
                          ? "refresh"
                          : "include"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 pb-4 pt-6 border-t border-slate-700/40">
            {data.pacing?.label && (
              <div className="flex-1 bg-[#102235] border border-slate-700/60 rounded-xl p-3 text-center">
                <p className="text-[11px] font-semibold text-[#00A9FF] uppercase tracking-wide mb-1">
                  Pacing
                </p>
                <p className="text-white text-sm font-bold">
                  {data.pacing.label}
                </p>
              </div>
            )}
            {data.goal?.label && (
              <div className="flex-1 bg-[#102235] border border-slate-700/60 rounded-xl p-3 text-center">
                <p className="text-[11px] font-semibold text-[#00A9FF] uppercase tracking-wide mb-1">
                  Goal
                </p>
                <p className="text-white text-sm font-bold">
                  {data.goal.label}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ResultsActions
            onContinue={handleContinue}
            isContinuing={preparationStatus === "preparing"}
          />
        </div>

      </div>
    </div>
  );
}