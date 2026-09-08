"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/context/AuthContext";
import { ONBOARDING_STEP_ROUTES } from "../diagnostic/constants/routes";
import { getDiagnosticResults } from "./services/getDiagnosticResults";
import { continueToPaywall } from "./services/continueToPaywall";

import ResultsLoader from "./components/ResultsLoader";
import ResultsSummary from "./components/ResultsSummary";
import SkillResultCard from "./components/SkillResultCard";
import PacingSummary from "./components/PacingSummary";
import GoalSummary from "./components/GoalSummary";
import ResultsActions from "./components/ResultsActions";
import OnboardingShell from "../components/OnboardingShell";
import LearningPlanPreparation from "../components/LearningPlanPreparation";
import { motion, AnimatePresence } from "framer-motion";

const MINIMUM_PREPARATION_MS = 2400;

export default function DiagnosticResults() {
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnimatingLoader, setIsAnimatingLoader] = useState(true);

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

  return (
    <div className="min-h-dvh flex flex-col bg-[#07131D] text-white relative">
      <AnimatePresence mode="wait">
        {(loading || isAnimatingLoader) && !error ? (
          <ResultsLoader key="loader" onComplete={() => setIsAnimatingLoader(false)} />
        ) : data ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex-col flex-grow flex"
          >
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 px-4 leading-tight">
            {(data.summary?.passedChecks ?? 0) > 0
              ? "Your roadmap adapts around what you already know."
              : "Your personalized roadmap is ready."}
          </h2>

          {/* Scroll Prompt */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ opacity: { delay: 1, duration: 1 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
            className="flex flex-col items-center justify-center mb-10 text-[#0EA5E9]"
          >
            <span className="text-xs uppercase tracking-widest font-semibold mb-1">Scroll to view full roadmap</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </motion.div>

          {/* Roadmap spine + alternating nodes */}
          <div className="relative flex flex-col items-center w-full pb-8">
            {data.areas.map((area, index) => {
              const isLeft = index % 2 === 0;
              const isPassed = area.status === 'passed';
              const isLast = index === data.areas.length - 1;
              
              // Base colors based on status using Sky Blue
              const bgColor = isPassed ? "#1E293B" : "#0EA5E9";
              const borderColor = isPassed ? "#334155" : "#0EA5E9";
              const shadowColor = isPassed ? "#0F172A" : "#0284C7";
              const textColor = isPassed ? "#94A3B8" : "#FFFFFF";
              const labelColor = isPassed ? "#64748B" : "#E0F2FE";

              return (
                <div
                  key={area.id}
                  className="relative w-full h-[140px]"
                >
                  {/* Curvy Spine Path to Next Node */}
                  {!isLast && (
                    <motion.svg 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      viewBox="0 0 400 140" 
                      preserveAspectRatio="none" 
                      className="absolute top-1/2 left-0 w-full h-[140px] z-0 pointer-events-none"
                    >
                      <path 
                        d={isLeft 
                          ? "M 120 0 C 120 70, 280 70, 280 140" 
                          : "M 280 0 C 280 70, 120 70, 120 140"} 
                        stroke="#0EA5E9" 
                        strokeOpacity="0.4" 
                        strokeWidth="4" 
                        strokeDasharray="8 8" 
                        fill="none" 
                        vectorEffect="non-scaling-stroke" 
                      />
                    </motion.svg>
                  )}

                  {/* Module card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-[44%] sm:w-[40%] z-20 ${isLeft ? "left-[8%] sm:left-[10%]" : "right-[8%] sm:right-[10%]"}`}
                  >
                    <div 
                      className="cursor-pointer transition-all duration-200 rounded-[2rem] p-4 font-medium select-none flex flex-col items-center justify-center text-center relative w-full min-h-[80px]"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        border: `2px solid ${borderColor}`,
                        boxShadow: `0 6px 0 ${shadowColor}`,
                        transform: "translateY(0)"
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "translateY(6px)";
                        e.currentTarget.style.boxShadow = `0 0px 0 ${shadowColor}`;
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 0 ${shadowColor}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 6px 0 ${shadowColor}`;
                      }}
                    >
                      <p className="text-[13px] font-bold leading-snug mb-1">
                        {area.title}
                      </p>
                      {area.moduleLabel && (
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: labelColor }}>
                          {area.moduleLabel}
                        </span>
                      )}
                    </div>

                    {/* Status label floating next to the card */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-[calc(100%+12px)] sm:left-[calc(100%+16px)]" : "right-[calc(100%+12px)] sm:right-[calc(100%+16px)]"}`}
                    >
                      <span className="whitespace-nowrap text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                        {isPassed
                          ? "skip"
                          : area.status === "partial"
                            ? "refresh"
                            : "include"}
                      </span>
                    </div>
                  </motion.div>
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
      </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}