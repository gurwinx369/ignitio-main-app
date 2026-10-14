// features/kyle/behavior-quiz/useBehaviorQuiz.js
//
// State machine for the behavior quiz pipeline.
// Owns: session state, per-question timer (normal + grace), localStorage persistence, submit.
//
// Timer design:
//   0–60s  → normal countdown (timerSec: 60→0)
//   60–70s → grace countdown (graceTimerSec: 10→0), isInGrace = true
//   >70s   → isTimedOut = true, show "Time's Up" screen
//
// Race-condition safety:
//   - advanceOrFinish / finishQuiz read through refs — never stale in setTimeout closures
//   - currentIndexRef synced from state so timer callbacks always have fresh index
//
// Navigation gating:
//   - triggerInBackground now returns the active Promise so interceptLevelStart can await it.
//   - isPreparingQuiz is true while the trigger request is in flight.
//   - interceptLevelStart is async: it awaits any active trigger before reading localStorage.

import { useState, useRef, useCallback, useEffect } from "react";
import { triggerBehaviorQuiz, submitBehaviorQuiz, BehaviorQuizApiError } from "./behaviorQuizApi";

const NORMAL_SEC = 60;  // normal countdown length
const GRACE_SEC = 10;   // grace period length after normal expires

const pendingKey = (roadmapId) => `ignitio:bq_pending:${roadmapId}`;

function loadPendingSession(roadmapId) {
  try {
    const raw = localStorage.getItem(pendingKey(roadmapId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePendingSession(roadmapId, data) {
  try {
    localStorage.setItem(pendingKey(roadmapId), JSON.stringify(data));
  } catch {}
}

function clearPendingSession(roadmapId) {
  try {
    localStorage.removeItem(pendingKey(roadmapId));
  } catch {}
}

export function useBehaviorQuiz({ user, roadmapId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreparingQuiz, setIsPreparingQuiz] = useState(false);

  // Session data — set once per session, accessed via refs inside callbacks
  const sessionIdRef = useRef(null);
  const quizItemsRef = useRef([]);
  const responsesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const afterDismissRef = useRef(null);
  const questionStartTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Active trigger promise ref — allows interceptLevelStart to await it
  const triggerPromiseRef = useRef(null);
  const submitPromiseRef = useRef(null);

  // Rendered state (drives UI)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timerSec, setTimerSec] = useState(NORMAL_SEC);       // 60→0, normal phase
  const [graceTimerSec, setGraceTimerSec] = useState(GRACE_SEC); // 10→0, grace phase
  const [isInGrace, setIsInGrace] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Keep currentIndexRef in sync so setTimeout callbacks never read stale index
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // --- Timer ---

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    questionStartTimeRef.current = Date.now();
    setTimerSec(NORMAL_SEC);
    setGraceTimerSec(GRACE_SEC);
    setIsInGrace(false);
    setIsTimedOut(false);

    timerIntervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - questionStartTimeRef.current) / 1000;

      if (elapsedSec >= NORMAL_SEC + GRACE_SEC) {
        // Fully timed out
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setTimerSec(0);
        setGraceTimerSec(0);
        setIsInGrace(false);
        setIsTimedOut(true);
      } else if (elapsedSec >= NORMAL_SEC) {
        // Grace period: normal timer stays at 0, grace counts down
        const graceRemaining = Math.max(0, Math.ceil(NORMAL_SEC + GRACE_SEC - elapsedSec));
        setTimerSec(0);
        setGraceTimerSec(graceRemaining);
        setIsInGrace(true);
        setIsTimedOut(false);
      } else {
        // Normal period
        const normalRemaining = Math.max(0, Math.ceil(NORMAL_SEC - elapsedSec));
        setTimerSec(normalRemaining);
        setIsInGrace(false);
        setIsTimedOut(false);
      }
    }, 200);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // --- Stable refs for finishQuiz + advanceOrFinish (safe inside setTimeout) ---

  const finishQuizRef = useRef(null);
  // eslint-disable-next-line react-hooks/refs
  finishQuizRef.current = (finalResponses) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    savePendingSession(roadmapId, {
      sessionId: sessionIdRef.current,
      quizItems: quizItemsRef.current,
      responses: finalResponses,
      currentIndex: quizItemsRef.current.length,
      submissionPending: true,
    });

    const submissionPromise = submitBehaviorQuiz({
      user,
      sessionId: sessionIdRef.current,
      submittedAttempts: finalResponses,
    })
      .then(() => {
      clearPendingSession(roadmapId);
    })
      .catch((err) => {
        if (
          err instanceof BehaviorQuizApiError &&
          (err.status === 403 || err.status === 409)
        ) {
          clearPendingSession(roadmapId);
          return;
        }

        console.error(
          "[BehaviorQuiz] Retryable submission failure:",
          err instanceof Error
          ? err.message
          : "Unknown error",
        );
      })
      .finally(() => {
        if (
          submitPromiseRef.current ===
          submissionPromise
        ) {
          submitPromiseRef.current = null;
        }

        isSubmittingRef.current = false;
      });

    submitPromiseRef.current =
      submissionPromise;

    stopTimer();
    setIsOpen(false);

    // Reset for next quiz
    sessionIdRef.current = null;
    quizItemsRef.current = [];
    responsesRef.current = [];
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setIsInGrace(false);
    setIsTimedOut(false);

    const cb = afterDismissRef.current;
    afterDismissRef.current = null;
    if (cb) cb();
  };

  const advanceOrFinishRef = useRef(null);
  // eslint-disable-next-line react-hooks/refs
  advanceOrFinishRef.current = (finalResponses, nextIndex) => {
    if (nextIndex < quizItemsRef.current.length) {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      startTimer();
    } else {
      finishQuizRef.current(finalResponses);
    }
  };

  // --- Open a session (new or resumed from localStorage) ---

  const openForSession = useCallback((session, onAfterDismiss) => {
    const { sessionId, quizItems, responses, currentIndex: savedIndex } = session;

    sessionIdRef.current = sessionId;
    quizItemsRef.current = quizItems;
    responsesRef.current = responses || [];
    currentIndexRef.current = savedIndex || 0;
    afterDismissRef.current = onAfterDismiss || null;
    isSubmittingRef.current = false;

    setCurrentIndex(savedIndex || 0);
    setSelectedOption(null);
    setIsCorrect(null);
    setIsInGrace(false);
    setIsTimedOut(false);
    setIsOpen(true);

    setTimeout(() => startTimer(), 0);
  }, [startTimer]);

  // --- Public API ---

  /**
   * Fire-and-forget trigger after level completion.
   * NOW returns the active Promise so interceptLevelStart can await it.
   * Saves session to localStorage only when result.fired && sessionId && quizItems.length > 0.
   * Deduplicates: if a request is already in-flight, returns the same promise.
   */
  const triggerInBackground = useCallback((levelId) => {
    if (!user || !levelId || !roadmapId) return Promise.resolve(null);

    // Return the existing promise if one is already in-flight — no duplicate requests
    if (triggerPromiseRef.current) return triggerPromiseRef.current;

    setIsPreparingQuiz(true);

    const promise = triggerBehaviorQuiz({ user, levelId, roadmapId })
      .then((result) => {
        if (
          result?.fired &&
          result.sessionId &&
          Array.isArray(result.quizItems) &&
          result.quizItems.length > 0
        ) {
          savePendingSession(roadmapId, {
            sessionId: result.sessionId,
            quizItems: result.quizItems,
            responses: [],
            currentIndex: 0,
          });
        }
        return result;
      })
      .catch((err) => {
        if (err instanceof BehaviorQuizApiError) {
          if (err.status === 403) {
            // Do not save or open a quiz.
          } else {
            console.warn(`[BehaviorQuiz] Diagnostic failure (${err.status}):`, err.message);
          }
        } else {
          console.warn("[BehaviorQuiz] Network or unknown failure on trigger.");
        }
        return null;
      })
      .finally(() => {
        triggerPromiseRef.current = null;
        setIsPreparingQuiz(false);
      });

    triggerPromiseRef.current = promise;
    return promise;
  }, [user, roadmapId]);

  /**
   * Called before starting a level.
   * Awaits any active trigger request before checking localStorage.
   * Returns true when a quiz was opened (level start deferred), false otherwise.
   */
  const interceptLevelStart = useCallback(async (onAfterDismiss) => {
    // Wait for any in-flight trigger request to complete before reading localStorage
    if (triggerPromiseRef.current) {
      await triggerPromiseRef.current;
    }

    const session = loadPendingSession(roadmapId);

    if (session && session.submissionPending && session.sessionId && session.responses) {
      if (submitPromiseRef.current) {
        await submitPromiseRef.current;
      } else {
        const p = submitBehaviorQuiz({
          user,
          sessionId: session.sessionId,
          submittedAttempts: session.responses,
        })
          .then(() => {
            clearPendingSession(roadmapId);
          })
          .catch((err) => {
            if (err instanceof BehaviorQuizApiError && (err.status === 403 || err.status === 409)) {
              clearPendingSession(roadmapId);
            }
          })
          .finally(() => {
            submitPromiseRef.current = null;
          });
        submitPromiseRef.current = p;
        await p;
      }
      return false;
    }

    if (
      !session ||
      !Array.isArray(session.quizItems) ||
      session.currentIndex >= session.quizItems.length
    ) {
      clearPendingSession(roadmapId);
      return false;
    }
    openForSession(session, onAfterDismiss);
    return true;
  }, [roadmapId, openForSession, user]);

  /** Record a user's answer (before timeout). */
  const recordAnswer = useCallback((selectedOptionValue) => {
    if (selectedOption !== null || isTimedOut) return;
    stopTimer();

    const responseTimeMs = Date.now() - (questionStartTimeRef.current || Date.now());
    const idx = currentIndexRef.current;
    const currentItem = quizItemsRef.current[idx];
    if (!currentItem) return;

    const correct = selectedOptionValue === currentItem.correctOption;
    setSelectedOption(selectedOptionValue);
    setIsCorrect(correct);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kyle-pet-state', { 
        detail: { state: correct ? 'celebrate' : 'sad', duration: 3000 } 
      }));
    }

    const newResponses = [
      ...responsesRef.current,
      { concept: currentItem.concept, selectedOption: selectedOptionValue, responseTimeMs },
    ];
    responsesRef.current = newResponses;

    savePendingSession(roadmapId, {
      sessionId: sessionIdRef.current,
      quizItems: quizItemsRef.current,
      responses: newResponses,
      currentIndex: idx + 1,
    });

    setTimeout(() => advanceOrFinishRef.current(newResponses, idx + 1), 1500);
  }, [selectedOption, isTimedOut, stopTimer, roadmapId]);

  /** Record UNATTEMPTED after timeout. User clicks "Continue" button. */
  const recordUnattempted = useCallback(() => {
    if (selectedOption !== null) return;
    stopTimer();

    const responseTimeMs = Date.now() - (questionStartTimeRef.current || Date.now());
    const idx = currentIndexRef.current;
    const currentItem = quizItemsRef.current[idx];
    if (!currentItem) return;

    const placeholderOption = currentItem.options?.[0] ?? "";
    setSelectedOption(placeholderOption);
    setIsCorrect(false);

    const newResponses = [
      ...responsesRef.current,
      { concept: currentItem.concept, selectedOption: placeholderOption, responseTimeMs },
    ];
    responsesRef.current = newResponses;

    savePendingSession(roadmapId, {
      sessionId: sessionIdRef.current,
      quizItems: quizItemsRef.current,
      responses: newResponses,
      currentIndex: idx + 1,
    });

    advanceOrFinishRef.current(newResponses, idx + 1);
  }, [selectedOption, stopTimer, roadmapId]);

  /* eslint-disable react-hooks/refs */
  return {
    isOpen,
    isPreparingQuiz,
    currentItem: quizItemsRef.current[currentIndex] ?? null,
    currentIndex,
    totalItems: quizItemsRef.current.length,
    selectedOption,
    isCorrect,
    timerSec,
    graceTimerSec,
    isInGrace,
    isTimedOut,
    triggerInBackground,
    interceptLevelStart,
    recordAnswer,
    recordUnattempted,
  };
  /* eslint-enable react-hooks/refs */
}
