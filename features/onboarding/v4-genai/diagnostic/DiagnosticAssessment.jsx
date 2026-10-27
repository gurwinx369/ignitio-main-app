"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_STEP_ROUTES } from "./constants/routes";
import posthog from "posthog-js";
import { getOrCreateOnboardingSessionId } from "@/lib/analytics/onboardingSession";
import { trackOnboardingFriction } from "@/lib/analytics/friction";

import { useAuth } from "@/features/context/AuthContext";
import {
  QUESTION_IDS,
  resolveDiagnosticRoute,
} from "@/lib/onboarding/diagnostic-flow";

import { QUESTIONS } from "./constants/questions";
import { submitDiagnostic } from "./services/submitDiagnostic";

import DiagnosticProgress from "./components/DiagnosticProgress";
import DiagnosticNav from "./components/DiagnosticNav";
import SingleChoiceQuestion from "./components/questions/SingleChoiceQuestion";
import MultiSelectQuestion from "./components/questions/MultiSelectQuestion";
import ShortTextQuestion from "./components/questions/ShortTextQuestion";
import OrderingQuestion from "./components/questions/OrderingQuestion";
import CodeBlock from "./components/questions/CodeBlock";
import OnboardingShell from "@/features/onboarding/core/components/OnboardingShell";
import OnboardingKiboHeader from "@/features/onboarding/core/components/OnboardingKiboHeader";
import { getKiboMessageForQuestion } from "./constants/kiboDiagnosticCopy";

// Kyle illustrations removed — all questions use the single-column layout.
const QUESTION_ASSET_MAP = {};

const DEFAULT_ANSWERS = Object.freeze({
  [QUESTION_IDS.Q1]: null,
  [QUESTION_IDS.CASUAL_API_USAGE]: null,
  [QUESTION_IDS.TECHNOLOGIES_USED]: null,
  [QUESTION_IDS.PROJECT_TYPE]: null,
  [QUESTION_IDS.Q2]: "",
  [QUESTION_IDS.Q2b]: "",
  [QUESTION_IDS.Q3]: "",
  [QUESTION_IDS.Q3b]: null,
  [QUESTION_IDS.Q4]: "",
  [QUESTION_IDS.Q5]: null,
  [QUESTION_IDS.Q6]: null,
  [QUESTION_IDS.Q7]: "",
  [QUESTION_IDS.Q7b]: "",
  [QUESTION_IDS.Q8]: "",
  [QUESTION_IDS.Q9]: null,
  [QUESTION_IDS.Q10]: null,
});

function clearUnreachableAnswers(answers, resolvedRoute) {
  const reachableQuestionIds = new Set(resolvedRoute);
  const cleanedAnswers = { ...answers };

  for (const questionId of Object.keys(cleanedAnswers)) {
    if (!reachableQuestionIds.has(questionId)) {
      cleanedAnswers[questionId] = DEFAULT_ANSWERS[questionId];
    }
  }

  return cleanedAnswers;
}

function pruneVisitedHistory(visitedQuestionIds, resolvedRoute) {
  const reachableQuestionIds = new Set(resolvedRoute);
  const prunedHistory = visitedQuestionIds.filter((questionId) =>
    reachableQuestionIds.has(questionId),
  );

  return prunedHistory.length > 0
    ? prunedHistory
    : [QUESTION_IDS.Q1];
}

function buildDiagnosticPayload(answers) {
  const diagnosticPath =
    resolveDiagnosticRoute(answers);

  const payload = {
    diagnosticPath,
  };

  for (const questionId of diagnosticPath) {
    const value = answers[questionId];

    const isEmptyString =
      typeof value === "string" &&
      value.trim() === "";

    if (
      value === undefined ||
      value === null ||
      isEmptyString
    ) {
      continue;
    }

    payload[questionId] = value;
  }

  return payload;
}

export default function DiagnosticAssessment({
  mode = "onboarding",
  submitAssessment = submitDiagnostic,
  onSuccess = null,
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [answers, setAnswers] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("ignitio:genai_diagnostic_answers");
        if (saved) {
          return { ...DEFAULT_ANSWERS, ...JSON.parse(saved) };
        }
      }
    } catch {}
    return { ...DEFAULT_ANSWERS };
  });
  const [visitedQuestionIds, setVisitedQuestionIds] = useState([
    QUESTION_IDS.Q1,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const activeQuestionId =
    visitedQuestionIds[visitedQuestionIds.length - 1];

  const resolvedRoute = resolveDiagnosticRoute(answers);

  const currentQuestion = QUESTIONS.find(
    (question) => question.id === activeQuestionId,
  );

  const currentValue = answers[activeQuestionId];

  // ── PostHog Step & Friction Tracking ─────────────────────────────────────
  const stepEnteredAtRef = useRef(Date.now());
  const pauseTimerRef = useRef(null);
  const hasCompletedStepRef = useRef(false);
  const lastTrackedQRef = useRef(null);

  const currentQIndex = resolvedRoute.indexOf(activeQuestionId) >= 0
    ? resolvedRoute.indexOf(activeQuestionId)
    : 0;
  const currentStepId = `diagnostic_skill_check_${currentQIndex}`;

  // Track each question step view, abandonment, and 15s pause friction
  useEffect(() => {
    if (!activeQuestionId) return;
    stepEnteredAtRef.current = Date.now();
    hasCompletedStepRef.current = false;
    const sessionId = getOrCreateOnboardingSessionId();

    if (lastTrackedQRef.current !== activeQuestionId) {
      lastTrackedQRef.current = activeQuestionId;
      try {
        posthog.capture("onboarding_step_viewed", {
          step_id: currentStepId,
          step_index: currentQIndex,
          onboarding_session_id: sessionId,
          question_id: activeQuestionId,
        });
      } catch {}
    }

    // Flag long pause if user has no interaction for >15s on a question
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      trackOnboardingFriction(currentStepId, "long_pause", {
        pause_ms: 15000,
        question_id: activeQuestionId,
      });
    }, 15000);

    const handleLeave = () => {
      if (!hasCompletedStepRef.current) {
        try {
          posthog.capture("onboarding_step_abandoned", {
            step_id: currentStepId,
            step_index: currentQIndex,
            onboarding_session_id: sessionId,
            time_on_step_ms: Date.now() - stepEnteredAtRef.current,
            question_id: activeQuestionId,
          });
        } catch {}
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      window.removeEventListener("pagehide", handleLeave);
    };
  }, [currentStepId, currentQIndex, activeQuestionId]);

  const handleAnswerChange = (value) => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    if (currentValue !== null && currentValue !== undefined && currentValue !== value) {
      trackOnboardingFriction(currentStepId, "retry", {
        question_id: activeQuestionId,
      });
    }

    const nextAnswers = {
      ...answers,
      [activeQuestionId]: value,
    };

    const nextResolvedRoute = resolveDiagnosticRoute(nextAnswers);
    const cleanedAnswers = clearUnreachableAnswers(
      nextAnswers,
      nextResolvedRoute,
    );

    setAnswers(cleanedAnswers);

    setVisitedQuestionIds((previousHistory) =>
      pruneVisitedHistory(previousHistory, nextResolvedRoute),
    );

    setError(null);
  };

  const handleBack = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    if (visitedQuestionIds.length > 1) {
      const prevQuestionId = visitedQuestionIds[visitedQuestionIds.length - 2];
      trackOnboardingFriction(currentStepId, "back_navigation", {
        from_step: activeQuestionId,
        to_step: prevQuestionId,
      });

      setVisitedQuestionIds((previousHistory) => {
        if (previousHistory.length <= 1) return previousHistory;
        return previousHistory.slice(0, -1);
      });
      setError(null);
      return;
    }

    // Boundary case: on diagnostic screen 1, back takes the user back to the free path questions
    // preserving answers in both flows so the user never loses progress.
    try {
      localStorage.setItem("ignitio:genai_diagnostic_answers", JSON.stringify(answers));
    } catch {}

    trackOnboardingFriction(currentStepId, "back_navigation", {
      from_step: activeQuestionId,
      to_step: "free_path_boundary",
    });

    router.push("/onboarding?step=shortcut");
  };

  const moveToNextQuestion = () => {
    const latestResolvedRoute = resolveDiagnosticRoute(answers);
    const currentIndex =
      latestResolvedRoute.indexOf(activeQuestionId);

    if (currentIndex === -1) {
      setVisitedQuestionIds([QUESTION_IDS.Q1]);
      setError(
        "The diagnostic route changed unexpectedly. Please continue from the first question.",
      );
      return false;
    }

    if (currentIndex >= latestResolvedRoute.length - 1) {
      return false;
    }

    // Step completed tracking
    hasCompletedStepRef.current = true;
    try {
      posthog.capture("onboarding_step_completed", {
        step_id: currentStepId,
        step_index: currentQIndex,
        onboarding_session_id: getOrCreateOnboardingSessionId(),
        time_on_step_ms: Date.now() - stepEnteredAtRef.current,
        question_id: activeQuestionId,
      });
    } catch {}

    const nextQuestionId =
      latestResolvedRoute[currentIndex + 1];

    setVisitedQuestionIds((previousHistory) => {
      const currentHistoryIndex =
        previousHistory.lastIndexOf(activeQuestionId);

      const validHistory =
        currentHistoryIndex >= 0
          ? previousHistory.slice(0, currentHistoryIndex + 1)
          : pruneVisitedHistory(
            previousHistory,
            latestResolvedRoute,
          );

      return [...validHistory, nextQuestionId];
    });

    setError(null);

    return true;
  };

  const handleContinue = async () => {
    if (moveToNextQuestion()) {
      return;
    }

    await handleSubmit();
  };

  const handleSkip = (skipMarker) => {
    const nextAnswers = {
      ...answers,
      [activeQuestionId]: skipMarker,
    };

    setAnswers(nextAnswers);
    setError(null);

    const latestResolvedRoute =
      resolveDiagnosticRoute(nextAnswers);

    const currentIndex =
      latestResolvedRoute.indexOf(activeQuestionId);

    if (
      currentIndex >= 0 &&
      currentIndex < latestResolvedRoute.length - 1
    ) {
      const nextQuestionId =
        latestResolvedRoute[currentIndex + 1];

      setVisitedQuestionIds((previousHistory) => {
        const currentHistoryIndex =
          previousHistory.lastIndexOf(activeQuestionId);

        const validHistory =
          currentHistoryIndex >= 0
            ? previousHistory.slice(
              0,
              currentHistoryIndex + 1,
            )
            : pruneVisitedHistory(
              previousHistory,
              latestResolvedRoute,
            );

        return [...validHistory, nextQuestionId];
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      hasCompletedStepRef.current = true;
      try {
        posthog.capture("onboarding_step_completed", {
          step_id: currentStepId,
          step_index: currentQIndex,
          onboarding_session_id: getOrCreateOnboardingSessionId(),
          time_on_step_ms: Date.now() - stepEnteredAtRef.current,
          question_id: activeQuestionId,
        });
      } catch {}

      const payload = buildDiagnosticPayload(answers);

      if (!user) {
        localStorage.setItem("genai_preview_assessment", JSON.stringify(payload));
        if (onSuccess) {
          await onSuccess({ nextStep: "results" });
          return;
        }
        router.push(ONBOARDING_STEP_ROUTES.results);
        return;
      }

      const idToken =
        user ? await user.getIdToken() : null;

      const result =
        await submitAssessment(
          payload,
          idToken,
        );

      if (onSuccess) {
        await onSuccess(result);
        return;
      }

      // ponytail: use the canonical route map — never interpolate nextStep into URL directly
      const nextRoute =
        ONBOARDING_STEP_ROUTES[result.nextStep] ??
        ONBOARDING_STEP_ROUTES["results"];

      router.push(nextRoute);
    } catch (error) {
      console.error(
        "Diagnostic submission error:",
        error,
      );

      try {
        posthog.captureException(error, {
          step_id: currentStepId,
          onboarding_session_id: getOrCreateOnboardingSessionId(),
          api_endpoint: "/api/v2/onboarding/diagnostic",
        });
      } catch {}

      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your assessment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContinueDisabled = () => {
    if (!currentQuestion) {
      return true;
    }

    if (currentQuestion.type === "ORDERING") {
      return (
        !Array.isArray(currentValue) ||
        currentValue.length === 0
      );
    }

    if (currentQuestion.type === "MULTI_SELECT") {
      return !Array.isArray(currentValue);
    }

    if (typeof currentValue === "string") {
      return currentValue.trim().length === 0;
    }

    return currentValue === null || currentValue === undefined;
  };

  const renderQuestion = () => {
    if (!currentQuestion) {
      return null;
    }

    const isGrid = [QUESTION_IDS.CASUAL_API_USAGE, QUESTION_IDS.Q9, QUESTION_IDS.Q10].includes(currentQuestion.id);

    switch (currentQuestion.type) {
      case "SINGLE_CHOICE":
        return (
          <SingleChoiceQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
            isGrid={isGrid}
          />
        );

      case "MULTI_SELECT":
        return (
          <MultiSelectQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
            isGrid={isGrid}
          />
        );

      case "SHORT_TEXT":
        return (
          <ShortTextQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
          />
        );

      case "ORDERING":
        return (
          <OrderingQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
          />
        );

      default:
        return null;
    }
  };

  const hasAsset = !!QUESTION_ASSET_MAP[currentQuestion?.id];

  // ── Duolingo-style 3-zone layout ─────────────────────────────────────────
  // Zone 1: fixed top bar  (back + progress — same column width as content)
  // Zone 2: scrollable middle (title + image + options)
  // Zone 3: sticky footer  (separator line + full-width CTA)
  // Everything shares one centered max-w-[500px] column on mobile/tablet.
  // Desktop widens to a two-column grid only when a Kyle SVG is present.

  if (mode === "calibration") {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
              Premium GenAI
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Quick GenAI calibration
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              We need a short skills check to personalize your Premium roadmap.
              Only demonstrated skills may reduce repetition.
            </p>
          </header>

          {/* Reuse the same inner content without the shell */}
          <div className="flex flex-col gap-6">
            <DiagnosticProgress
              current={visitedQuestionIds.length}
              total={Math.max(resolvedRoute.length, visitedQuestionIds.length, 1)}
            />
            <h2 className="font-bold text-[#001D32] text-2xl">
              {currentQuestion?.title}
            </h2>
            {currentQuestion?.description && (
              <p className="text-[#4A5568] text-base">{currentQuestion.description}</p>
            )}
            <CodeBlock code={currentQuestion?.code} />
            {renderQuestion()}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}
            <DiagnosticNav
              canContinue={!isContinueDisabled()}
              onContinue={handleContinue}
              skippable={currentQuestion?.skippable}
              onSkip={handleSkip}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      {/* ── Zone 1: Conversational Kibo Header (persistent back + progress + avatar + speech bubble) ── */}
      <OnboardingKiboHeader
        currentStep={visitedQuestionIds.length}
        totalSteps={Math.max(resolvedRoute.length, visitedQuestionIds.length, 1)}
        onBack={handleBack}
        backDisabled={isSubmitting}
        kiboMessage={getKiboMessageForQuestion(activeQuestionId, currentQIndex)}
      />

      {/* ── Zone 2: Scrollable content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <style>{`
          @keyframes diag-q-enter {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .diag-q-enter { animation: diag-q-enter 300ms cubic-bezier(0.22,1,0.36,1) both; }
          @keyframes diag-svg-enter {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .diag-svg-enter { animation: diag-svg-enter 380ms ease-out both; }
          @media (prefers-reduced-motion: reduce) {
            .diag-q-enter, .diag-svg-enter { animation: none; opacity: 1; transform: none; }
          }
        `}</style>

        {hasAsset ? (
          /* ── Desktop two-column layout when Kyle SVG exists ── */
          <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            {/* Left: illustration */}
            <div className="flex justify-center lg:justify-end mb-6 lg:mb-0 lg:pt-4">
              <div className="w-full max-w-[260px] lg:max-w-[340px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={currentQuestion.id}
                  src={QUESTION_ASSET_MAP[currentQuestion.id].src}
                  alt={QUESTION_ASSET_MAP[currentQuestion.id].alt}
                  className="diag-svg-enter w-auto h-auto max-w-full object-contain"
                />
              </div>
            </div>
            {/* Right: question */}
            <div className="diag-q-enter flex flex-col gap-5 max-w-[500px]">
              <h2 className="font-bold text-[#001D32] text-[22px] leading-snug">
                {currentQuestion?.title}
              </h2>
              {currentQuestion?.description && (
                <p className="text-[#4A5568] text-[15px] leading-relaxed">
                  {currentQuestion.description}
                </p>
              )}
              <CodeBlock code={currentQuestion?.code} />
              {renderQuestion()}
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
              )}
            </div>
          </div>
        ) : (
          /* ── Single-column layout (no asset) — the Duolingo column ── */
          <div
            key={currentQuestion?.id}
            className="diag-q-enter w-full max-w-[500px] mx-auto px-5 sm:px-6 py-6 flex flex-col gap-5"
          >
            <h2 className="font-bold text-[#001D32] text-[22px] leading-snug">
              {currentQuestion?.title}
            </h2>

            {currentQuestion?.description && (
              <p className="text-[#4A5568] text-[15px] leading-relaxed">
                {currentQuestion.description}
              </p>
            )}

            <CodeBlock code={currentQuestion?.code} />

            {/* Q5 pair visualiser */}
            {currentQuestion?.id === QUESTION_IDS.Q5 && (
              <div className="rounded-[14px] overflow-hidden border border-slate-200 shadow-sm">
                <div className="bg-[#F1F5F9] px-4 h-10 flex items-center justify-between border-b border-slate-200">
                  <div className="flex gap-2 w-16">
                    <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                    <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  </div>
                  <div className="text-[13px] font-semibold text-slate-500">Exercise</div>
                  <div className="w-16" />
                </div>
                <div className="bg-white p-4 flex flex-col gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#FCFCFC] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Pair A</span>
                    <span className="font-medium text-[#334155] text-center">&quot;I want to return this product&quot; <br /><span className="text-slate-400 text-sm">vs</span><br /> &quot;How do I get a refund?&quot;</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-[#FCFCFC] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Pair B</span>
                    <span className="font-medium text-[#334155] text-center">&quot;I want to return this product&quot; <br /><span className="text-slate-400 text-sm">vs</span><br /> &quot;I love this product&quot;</span>
                  </div>
                </div>
              </div>
            )}

            {renderQuestion()}

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}
          </div>
        )}
      </div>

      {/* ── Zone 3: Sticky footer ───────────────────────────────────── */}
      <div className="flex-shrink-0 w-full border-t border-[#e8ddd4]" style={{ backgroundColor: "#FCF5EE" }}>
        <div className="w-full max-w-[500px] mx-auto px-5 sm:px-6 py-4 flex flex-col gap-2">
          <DiagnosticNav
            canContinue={!isContinueDisabled()}
            onContinue={handleContinue}
            skippable={currentQuestion?.skippable}
            onSkip={handleSkip}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  );
}
