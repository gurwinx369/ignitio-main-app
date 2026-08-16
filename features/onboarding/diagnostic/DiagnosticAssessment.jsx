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

    switch (currentQuestion.type) {
      case "SINGLE_CHOICE":
        return (
          <SingleChoiceQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
          />
        );

      case "MULTI_SELECT":
        return (
          <MultiSelectQuestion
            question={currentQuestion}
            value={currentValue}
            onChange={handleAnswerChange}
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

  const assessmentContent = (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <DiagnosticProgress
        current={displayedCurrentStep}
        total={Math.max(resolvedRoute.length, 1)}
      />

      <div className="mb-8">
        <h2 className="mb-3 text-2xl font-bold text-[#19183b]">
          {currentQuestion?.title}
        </h2>

        {currentQuestion?.description && (
          <p className="mb-6 text-gray-600">
            {currentQuestion.description}
          </p>
        )}

        <CodeBlock code={currentQuestion?.code} />

        {renderQuestion()}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <DiagnosticNav
        canGoBack={visitedQuestionIds.length > 1}
        onBack={handleBack}
        onContinue={handleContinue}
        canContinue={!isContinueDisabled()}
        skippable={currentQuestion?.skippable}
        onSkip={handleSkip}
        isSubmitting={isSubmitting}
      />
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