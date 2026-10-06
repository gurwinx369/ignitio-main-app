import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { AskKyleContext } from '@/features/kyle/ask/AskKyleProvider';
import VideoTab from "./VideoTab";
import PracticeTab from "./PracticeTab";
import DoubtSolver from "./DoubtSolver";
import KyleQuizModal from "./KyleQuizModal";
import { isKyleEnabledRoadmap } from "@/features/roadmaps/lib/roadmapCapabilities";
import { useAuth } from "@/features/context/AuthContext";

const LevelContent = ({
  level,
  onBack,
  onComplete,
  isCompleted,
  roadmapType = "git-github",
  role,
  dayNumber,
  showAssignmentModal = false,
  isPreview = false,
}) => {
  const askKyleContext = useContext(AskKyleContext);
  const isAskKyleOpen = askKyleContext?.isOpen;
  const [currentStep, setCurrentStep] = useState(0);
  const [hasWatched, setHasWatched] = useState(isCompleted);
  const [feedback, setFeedback] = useState(null);
  const cleanupRef = useRef(null);
  const prevLevelIdRef = useRef(null);
  const recoveryRanRef = useRef(false); // gates mount-time quiz recovery to run exactly once


  const setGlobalContext = askKyleContext?.setGlobalContext;
  const setIsLessonActive = askKyleContext?.setIsLessonActive;
  const { user } = useAuth();

  const isKyleRoadmap = isKyleEnabledRoadmap(roadmapType);
  const isPythonRoadmap = roadmapType === "python-beginner";
  const isCRoadmap = roadmapType.startsWith("c-language");
  const showAskKyleTab = isKyleRoadmap && !isPythonRoadmap && !isCRoadmap;
  const showPracticeTab = !isKyleRoadmap || isPythonRoadmap || isCRoadmap;

  useEffect(() => {
    if (setIsLessonActive) {
      setIsLessonActive(true);
      return () => setIsLessonActive(false);
    }
  }, [setIsLessonActive]);

  // --- Dual quiz gate keys ---
  // Gate 1: fires at 50% watch (midpoint check-in, does NOT unlock button)
  const quiz50CompletedKey = `quiz_gate_50_completed_${roadmapType}_${level.id}`;
  const quiz50BypassedKey = `quiz_gate_50_bypassed_${roadmapType}_${level.id}`;
  // Gate 2: fires at 80% watch (before Complete button appears)
  const quiz80CompletedKey = `quiz_gate_80_completed_${roadmapType}_${level.id}`;
  const quiz80BypassedKey = `quiz_gate_80_bypassed_${roadmapType}_${level.id}`;

  // Satisfaction state per gate (read from storage on mount)
  const [quiz50Satisfied, setQuiz50Satisfied] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem(quiz50CompletedKey) === "true" ||
      sessionStorage.getItem(quiz50BypassedKey) === "true"
      : false
  );
  const [quiz80Satisfied, setQuiz80Satisfied] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem(quiz80CompletedKey) === "true" ||
      sessionStorage.getItem(quiz80BypassedKey) === "true"
      : false
  );

  // Modal queue: ['50'] | ['80'] | ['50','80'] | []
  const [quizQueue, setQuizQueue] = useState([]);
  const [activeQuizGate, setActiveQuizGate] = useState(null); // '50' | '80' | null
  const [showQuizModal, setShowQuizModal] = useState(false);

  const shouldPauseVideo = showQuizModal || showAssignmentModal || isAskKyleOpen;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__IS_IN_LESSON_VIEW = true;
      return () => {
        window.__IS_IN_LESSON_VIEW = false;
        window.dispatchEvent(new Event("returned_to_roadmap"));
      };
    }
  }, []);

  // Sync global Kyle context for floating ask button
  useEffect(() => {
    if (setGlobalContext) {
      setGlobalContext({
        concept: level.concept,
        transcript: level.transcript,
      });
      return () => setGlobalContext(null);
    }
  }, [level.concept, level.transcript, setGlobalContext]);

  // Fetch and show a fun fact about the transcript when the level loads
  useEffect(() => {
    if (!level?.transcript || !level?.concept || !isKyleRoadmap) return;

    // Ensure we only do this once per level per session
    const storageKey = `kibo_fun_fact_${level.id}`;
    if (sessionStorage.getItem(storageKey) === 'true') return;

    let isCancelled = false;

    const fetchFunFact = async () => {
      try {
        const profession = localStorage.getItem("profession") || "student";
        const token = user ? await user.getIdToken() : null;

        if (!token) return; // Wait for user auth

        const res = await fetch("/api/v2/kyle/funfact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            concept: level.concept,
            transcript: level.transcript,
            user_profession: profession
          })
        });

        if (isCancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.fun_fact && !isCancelled) {
            sessionStorage.setItem(storageKey, 'true');
            // Give the user a moment to orient themselves before Kibo pops up
            setTimeout(() => {
              if (isCancelled) return;
              window.dispatchEvent(
                new CustomEvent("kyle-pet-state", {
                  detail: { action: "say", message: data.fun_fact, duration: 12000 }
                })
              );
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Kibo fun fact:", err);
      }
    };

    if (user) {
      fetchFunFact();
    }

    return () => {
      isCancelled = true;
    };
  }, [level?.id, level?.concept, level?.transcript, isKyleRoadmap, user]);

  useEffect(() => {
    if (!showPracticeTab && currentStep === 1) {
      setCurrentStep(0);
    }
    if (!showAskKyleTab && currentStep === 2) {
      setCurrentStep(0);
    }
  }, [showPracticeTab, showAskKyleTab, currentStep]);

  // Render-phase state reset when level changes. 
  // This ensures we reset the queue BEFORE VideoTab mounts and fires its triggers,
  // preventing the parent useEffect from cancelling the child's onMidpointMet.
  const [prevLevelId, setPrevLevelId] = useState(level.id);
  if (level.id !== prevLevelId) {
    setPrevLevelId(level.id);
    setShowQuizModal(false);
    setActiveQuizGate(null);
    setQuizQueue([]);
  }

  // Only read initial storage on mount or level change
  useEffect(() => {
    setQuiz50Satisfied(
      typeof window !== "undefined"
        ? localStorage.getItem(quiz50CompletedKey) === "true" ||
        sessionStorage.getItem(quiz50BypassedKey) === "true"
        : false
    );
    setQuiz80Satisfied(
      typeof window !== "undefined"
        ? localStorage.getItem(quiz80CompletedKey) === "true" ||
        sessionStorage.getItem(quiz80BypassedKey) === "true"
        : false
    );
  }, [quiz50CompletedKey, quiz50BypassedKey, quiz80CompletedKey, quiz80BypassedKey]);

  // Check if level is segment-based
  const isSegmentBased =
    level.startSec !== undefined && level.endSec !== undefined && level.videoId;

  // Compute canMarkComplete from localStorage - recomputes when level changes
  const storedWatchTime = isSegmentBased
    ? parseFloat(
      localStorage.getItem(`segment_watch_${roadmapType}_${level.id}`) || "0",
    )
    : 0;
  const segmentDuration = isSegmentBased ? level.endSec - level.startSec : 0;
  // Threshold constant — must match VideoTab.jsx COMPLETION_THRESHOLD_RATIO
  const COMPLETION_THRESHOLD_RATIO = 0.8; // 80% watch required to unlock Complete button
  const thresholdSeconds = segmentDuration * COMPLETION_THRESHOLD_RATIO;
  const storedWatchTimeForLegacy = level.durationInMinutes
    ? parseInt(
      localStorage.getItem(`video_timer_${roadmapType}_${level.id}`) || "0",
      10,
    )
    : 0;
  // Legacy full-video levels use 80% timer (matches segment-based threshold)
  const LEGACY_THRESHOLD_RATIO = 0.8;
  const fiftyPercentDurationLegacy = level.durationInMinutes
    ? level.durationInMinutes * 60 * 1000 * LEGACY_THRESHOLD_RATIO
    : 0;

  // Initial value computed from storage
  const initialCanMarkComplete = isCompleted
    ? true
    : isSegmentBased
      ? storedWatchTime >= thresholdSeconds
      : level.durationInMinutes
        ? storedWatchTimeForLegacy >= fiftyPercentDurationLegacy
        : false;

  // Actual state
  const [canMarkComplete, setCanMarkComplete] = useState(
    initialCanMarkComplete,
  );

  // Button unlocks only when 80% watched AND both quiz gates passed (Kyle roadmaps only)
  const canMarkCompleteAfterQuiz =
    canMarkComplete &&
    (!isKyleRoadmap || quiz50Satisfied || isPreview) &&
    (!isKyleRoadmap || quiz80Satisfied || isPreview);

  // Helper: open the next quiz in queue (or close modal if queue empty)
  const dequeueAndShow = useCallback((completedGate) => {
    setQuizQueue(prev => {
      const remaining = prev.filter(g => g !== completedGate);
      if (remaining.length > 0) {
        setActiveQuizGate(remaining[0]);
        setShowQuizModal(true);
      } else {
        setShowQuizModal(false);
        setActiveQuizGate(null);
      }
      return remaining;
    });
  }, []);

  // Called when VideoTab fires onMidpointMet (50% watched)
  // Purpose: trigger midpoint quiz only — does NOT unlock the Complete button
  const handleMidpointMet = useCallback(() => {
    if (!isKyleRoadmap || quiz50Satisfied || isPreview) return;
    setQuizQueue(prev => prev.includes('50') ? prev : [...prev, '50']);
    // Only open modal if none is currently showing
    setShowQuizModal(showing => {
      if (!showing) {
        setActiveQuizGate('50');
        return true;
      }
      return showing;
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kyle-pet-state", { detail: { state: "thinking" } }),
      );
    }
  }, [isKyleRoadmap, quiz50Satisfied, isPreview]);

  // Called when VideoTab fires onCompletionMet (80% watched)
  // Purpose: unlock button AND trigger 80% quiz on Kyle roadmaps
  const handleCompletionMet = useCallback(() => {
    setCanMarkComplete(true); // 80% threshold — button eligibility unlocked

    // Dispatch celebration at 80%
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kyle-pet-state", {
          detail: { state: "celebrate", action: "say", message: "You made it to 80%! Great focus.", duration: 3000 },
        }),
      );
    }

    if (!isKyleRoadmap || quiz80Satisfied || isPreview) return;
    setQuizQueue(prev => prev.includes('80') ? prev : [...prev, '80']);
    setShowQuizModal(showing => {
      if (!showing) {
        setActiveQuizGate('80');
        return true;
      }
      return showing;
    });
  }, [isKyleRoadmap, quiz80Satisfied, isPreview]);

  const handleQuizAnswered = ({ wasCorrect, alreadyAttempted }) => {
    // Save gate completion to localStorage — but do NOT close or advance the modal yet.
    // The explanation screen (status='result') is still showing inside KyleQuizModal.
    // dequeueAndShow() runs in handleCloseQuizModal when user clicks "Continue to lesson".
    if (activeQuizGate === '50') {
      localStorage.setItem(quiz50CompletedKey, "true");
      setQuiz50Satisfied(true);
    } else if (activeQuizGate === '80') {
      localStorage.setItem(quiz80CompletedKey, "true");
      setQuiz80Satisfied(true);
    }
    // NOTE: intentionally no dequeueAndShow here — let the user read the explanation first.
  };

  const handleCloseQuizModal = () => {
    // Check bypass for the active gate
    const bypassKey = activeQuizGate === '50' ? quiz50BypassedKey : quiz80BypassedKey;
    if (sessionStorage.getItem(bypassKey) === "true") {
      if (activeQuizGate === '50') setQuiz50Satisfied(true);
      if (activeQuizGate === '80') setQuiz80Satisfied(true);
    }
    dequeueAndShow(activeQuizGate);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kyle-pet-state", { detail: { action: "clear" } }),
      );
    }
  };

  // Single mount-time recovery: restore quiz modal state after a page refresh.
  // Uses a ref so the logic runs at most once, while keeping a STABLE dep array
  // (avoids React's "dep array size changed" error from HMR / Strict Mode).
  useEffect(() => {
    if (recoveryRanRef.current) return;
    recoveryRanRef.current = true;
    if (!isKyleRoadmap || isCompleted || isPreview) return;

    // Quiz recovery logic removed because VideoTab is always mounted (even when hidden) 
    // and its useEffect will instantly fire onMidpointMet and onCompletionMet 
    // if the user has already watched past those thresholds.
  }, [isKyleRoadmap, canMarkComplete, quiz50Satisfied, quiz80Satisfied, isCompleted, isPreview, isSegmentBased, level.id, level.endSec, level.startSec, roadmapType]);

  // Called when user clicks the Complete button
  const handleMarkComplete = useCallback(() => {
    setHasWatched(true);
    onComplete(level.id);
    // Clean up watch time storage for segment levels
    if (isSegmentBased) {
      localStorage.removeItem(`segment_watch_${roadmapType}_${level.id}`);
      localStorage.removeItem(`segment_intervals_${roadmapType}_${level.id}`);
    } else {
      // Clean up timer storage for legacy levels
      localStorage.removeItem(`video_timer_${roadmapType}_${level.id}`);
    }
  }, [level.id, roadmapType, isSegmentBased, onComplete]);

  return (
    <div className="flex w-full min-h-screen bg-linear-to-br from-gray-50 via-amber-50 to-gray-100">
      {/* Squeeze placeholder that expands when Ask Kibo drawer is open */}
      <div className={`transition-[width] duration-300 ease-in-out shrink-0 hidden sm:block ${isAskKyleOpen ? 'w-[400px]' : 'w-0'}`} />

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-transparent px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-all duration-200 hover:shadow-lg active:scale-95 text-sm sm:text-base font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Progress Bar (Step Indicator) — hidden in preview (video only) */}
            {!isPreview && showPracticeTab && (
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className={`h-2.5 rounded-full flex-1 transition-all duration-300 ${currentStep >= 0 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-gray-200"}`} />
                  <div className={`h-2.5 rounded-full flex-1 transition-all duration-300 ${currentStep >= 1 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-gray-200"}`} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content - VideoTab always mounted to keep player warm, others conditionally rendered */}
        <div className={currentStep === 0 ? "block" : "hidden"}>
          <VideoTab
            level={level}
            hasWatched={hasWatched}
            onMidpointMet={handleMidpointMet}
            onCompletionMet={handleCompletionMet}
            onMarkComplete={handleMarkComplete}
            feedback={feedback}
            setFeedback={setFeedback}
            hasMetWatchThreshold={canMarkComplete}
            canMarkComplete={canMarkCompleteAfterQuiz}
            roadmapType={roadmapType}
            isVisible={currentStep === 0}
            shouldPauseVideo={shouldPauseVideo}
            hasNextStep={showPracticeTab && !isPreview}
            onNextStep={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
        {/* Practice tab suppressed in preview */}
        {currentStep === 1 && showPracticeTab && !isPreview && (
          <div className="pb-24">
            <PracticeTab level={level} roadmapType={roadmapType} />
            <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-end">
              <button
                onClick={handleMarkComplete}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-white rounded-full transition-all duration-150 border-b-[4px] border-green-700 active:border-b-0 active:translate-y-[4px] text-lg font-bold shadow-lg"
              >
                <CheckCircle className="w-6 h-6" />
                Complete Lesson
              </button>
            </div>
          </div>
        )}
        {/* Quiz suppressed in preview — no auth context available */}
        {!isPreview && (
          <KyleQuizModal
            key={activeQuizGate || 'empty'}
            open={showQuizModal}
            level={level}
            roadmapType={roadmapType}
            dayNumber={dayNumber}
            role={role}
            gateType={activeQuizGate}
            onAnswered={handleQuizAnswered}
            onCloseAfterAnswered={handleCloseQuizModal}
          />
        )}
      </div>
    </div>
  );
};

export default LevelContent;
