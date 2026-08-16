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
    <OnboardingShell step={2}>
      {preparationStatus !==
        "idle" && (
        <LearningPlanPreparation
          status={preparationStatus}
          error={preparationError}
          onRetry={handleContinue}
        />
      )}

      <header className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          Your Diagnostic Results
        </h1>

        <p className="text-lg text-muted-foreground">
          We&apos;ve reviewed your
          skills. Here is how your
          learning recommendations are
          taking shape.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-error-200 bg-error-50 p-4 text-error-800">
          {error}
        </div>
      )}

      <ResultsSummary
        summary={data.summary}
      />

      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold">
          Skill Analysis
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {data.areas.map((area) => (
            <SkillResultCard
              key={area.id}
              area={area}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <PacingSummary
          pacing={data.pacing}
        />

        <GoalSummary
          goal={data.goal}
        />
      </div>

      <ResultsActions
        onContinue={handleContinue}
        isContinuing={
          preparationStatus ===
          "preparing"
        }
      />
    </OnboardingShell>
  );
}