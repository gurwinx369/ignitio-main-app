"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/context/AuthContext";
import {
  QUESTION_IDS,
  resolveDiagnosticRoute,
} from "@/lib/onboarding/diagnostic-flow";

import { QUESTIONS } from "./constants/questions";
import { ONBOARDING_STEP_ROUTES } from "./constants/routes";
import { submitDiagnostic } from "./services/submitDiagnostic";

import DiagnosticProgress from "./components/DiagnosticProgress";
import DiagnosticNav from "./components/DiagnosticNav";
import SingleChoiceQuestion from "./components/questions/SingleChoiceQuestion";
import MultiSelectQuestion from "./components/questions/MultiSelectQuestion";
import ShortTextQuestion from "./components/questions/ShortTextQuestion";
import OrderingQuestion from "./components/questions/OrderingQuestion";
import CodeBlock from "./components/questions/CodeBlock";
import OnboardingShell from "../components/OnboardingShell";

// Maps question IDs to their FINAL Figma SVG assets.
// WebP placeholders have been removed — questions without an approved
// Figma SVG are intentionally absent and will render centered (no visual).
const QUESTION_ASSET_MAP = {
  // ── Final Figma Kyle SVGs ────────────────────────────────────────────────────
  [QUESTION_IDS.Q2]: {
    src: "/onboarding/figma/kyle/kyle-writing-notebook.svg",
    alt: "Kyle writing in a notebook",
    isSvg: true,
  },
  [QUESTION_IDS.Q2b]: {
    src: "/onboarding/figma/kyle/kyle-ai-chip.svg",
    alt: "Kyle with an AI chip",
    isSvg: true,
  },
  [QUESTION_IDS.Q4]: {
    src: "/onboarding/figma/kyle/kyle-roadmap.svg",
    alt: "Kyle with a roadmap",
    isSvg: true,
  },
  [QUESTION_IDS.Q5]: {
    src: "/onboarding/figma/kyle/kyle-books-question.svg",
    alt: "Kyle with books",
    isSvg: true,
  },
  [QUESTION_IDS.Q6]: {
    src: "/onboarding/figma/kyle/kyle-prompt-laptop.svg",
    alt: "Kyle with a prompt laptop",
    isSvg: true,
  },
  [QUESTION_IDS.Q7]: {
    src: "/onboarding/figma/kyle/kyle-magnifier.svg",
    alt: "Kyle with a magnifier",
    isSvg: true,
  },
  // q1, q3, q7b, q9, q10 — no approved final SVG → centered layout (no entry)
};

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

  const [answers, setAnswers] = useState(() => ({
    ...DEFAULT_ANSWERS,
  }));
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

  const handleAnswerChange = (value) => {
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
    setVisitedQuestionIds((previousHistory) => {
      if (previousHistory.length <= 1) {
        return previousHistory;
      }

      return previousHistory.slice(0, -1);
    });

    setError(null);
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

    if (!user) {
      setError(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload =
        buildDiagnosticPayload(answers);

      const idToken =
        await user.getIdToken();

      const result =
        await submitAssessment(
          payload,
          idToken,
        );

      if (onSuccess) {
        await onSuccess(result);
        return;
      }

      const nextStep =
        result.nextStep || "results";

      router.push(
        `/home/onboarding/${nextStep}`,
      );
    } catch (error) {
      console.error(
        "Diagnostic submission error:",
        error,
      );

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

  const currentStepIndex =
    resolvedRoute.indexOf(activeQuestionId);

  const displayedCurrentStep =
    currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  const hasAsset = !!QUESTION_ASSET_MAP[currentQuestion?.id];

  const assessmentContent = (
    <div className="flex flex-col w-full max-w-[1100px] mx-auto lg:relative lg:left-1/2 lg:w-[calc(100vw-64px)] lg:max-w-[1100px] lg:-translate-x-1/2 lg:py-6">
      {/* One-time entrance animation for SVG illustrations */}
      <style>{`
        @keyframes diag-svg-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .diag-svg-enter {
          animation: diag-svg-enter 380ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .diag-svg-enter { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
      {/* Top Header: Back Button + Progress Bar */}
      <div className="flex items-center w-full mb-5 relative h-10 col-span-full">
        <div className="absolute left-0 z-10">
          {visitedQuestionIds.length > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-[#001D32] hover:bg-slate-200/50 w-10 h-10 flex items-center justify-center rounded-full font-bold text-xl transition-colors disabled:opacity-50"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          )}
        </div>
        <div className="flex-grow flex justify-center px-12">
          <DiagnosticProgress
            current={displayedCurrentStep}
            total={Math.max(resolvedRoute.length, 1)}
          />
        </div>
      </div>

      <div className={hasAsset ? "lg:grid lg:grid-cols-2 lg:gap-0" : "max-w-[640px] mx-auto w-full"}>
        {/* Left Column: Image */}
        {hasAsset && (
          <div className="flex justify-center lg:justify-end mb-8 lg:mb-0 lg:pt-8 px-2 lg:pr-16">
            <div className="relative w-full max-w-[280px] lg:max-w-[360px] flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG: next/image requires explicit dimensions which break SVG aspect ratios */}
              <img
                key={currentQuestion.id}
                src={QUESTION_ASSET_MAP[currentQuestion.id].src}
                alt={QUESTION_ASSET_MAP[currentQuestion.id].alt}
                className="diag-svg-enter w-auto h-auto max-w-[150px] lg:max-w-[320px] object-contain"
              />
            </div>
          </div>
        )}

        {/* Right Column: Interaction */}
        <div className="flex flex-col lg:w-full lg:max-w-[500px] lg:justify-self-start">
          <div className={`mb-5 ${!hasAsset && [QUESTION_IDS.CASUAL_API_USAGE].includes(currentQuestion?.id)
            ? "max-w-md mx-auto text-center"
            : ""
            }`}>

            <h2 className="mb-3 font-bold text-[#001D32] text-2xl px-2 lg:pl-0">
              {currentQuestion?.title}
            </h2>

            {currentQuestion?.description && (
              <p className="mb-4 text-[#4A5568] text-base px-2 lg:pl-0">
                {currentQuestion.description}
              </p>
            )}

            <CodeBlock code={currentQuestion?.code} />

            {currentQuestion?.id === QUESTION_IDS.Q5 && (
              <div className="rounded-[14px] overflow-hidden mb-4 border border-slate-200 shadow-sm mx-2">
                <div className="bg-[#F1F5F9] px-4 h-10 flex items-center justify-between border-b border-slate-200">
                  <div className="flex gap-2 w-16">
                    <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                    <div className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                    <div className="w-[11px] h-[11px] rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                  </div>
                  <div className="text-[13px] font-semibold text-slate-500">
                    Exercise
                  </div>
                  <div className="w-16"></div>
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

            <div className="mt-4 text-left px-2 lg:pl-0">
              {renderQuestion()}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 mx-2">
              {error}
            </div>
          )}

          <div className="px-2 pb-3">
            <DiagnosticNav
              canContinue={!isContinueDisabled()}
              onContinue={handleContinue}
              skippable={currentQuestion?.skippable}
              onSkip={handleSkip}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );

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

          {assessmentContent}
        </div>
      </main>
    );
  }

  return (
    <OnboardingShell step={1}>
      {assessmentContent}
    </OnboardingShell>
  );
}