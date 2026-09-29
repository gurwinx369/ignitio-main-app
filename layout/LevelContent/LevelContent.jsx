import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import VideoTab from "./VideoTab";
import PracticeTab from "./PracticeTab";
import DoubtSolver from "./DoubtSolver";
import KyleQuizModal from "./KyleQuizModal";
import { isKyleEnabledRoadmap } from "@/features/roadmaps/lib/roadmapCapabilities";

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
  const [activeTab, setActiveTab] = useState("video");
  const [hasWatched, setHasWatched] = useState(isCompleted);
  const [feedback, setFeedback] = useState(null);
  const cleanupRef = useRef(null);
  const prevLevelIdRef = useRef(null);
  const recoveryRanRef = useRef(false); // gates mount-time quiz recovery to run exactly once

  const isKyleRoadmap = isKyleEnabledRoadmap(roadmapType);
  const isPythonRoadmap = roadmapType === "python-beginner";
  const isCRoadmap = roadmapType.startsWith("c-language");
  const showAskKyleTab = isKyleRoadmap && !isPythonRoadmap && !isCRoadmap;
  const showPracticeTab = !isKyleRoadmap || isPythonRoadmap || isCRoadmap;

  // --- Dual quiz gate keys ---
  // Gate 1: fires at 50% watch (midpoint check-in, does NOT unlock button)
  const quiz50CompletedKey = `quiz_gate_50_completed_${roadmapType}_${level.id}`;
  const quiz50BypassedKey  = `quiz_gate_50_bypassed_${roadmapType}_${level.id}`;
  // Gate 2: fires at 80% watch (before Complete button appears)
  const quiz80CompletedKey = `quiz_gate_80_completed_${roadmapType}_${level.id}`;
  const quiz80BypassedKey  = `quiz_gate_80_bypassed_${roadmapType}_${level.id}`;

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

  const shouldPauseVideo = showQuizModal || showAssignmentModal;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__IS_IN_LESSON_VIEW = true;
      return () => {
        window.__IS_IN_LESSON_VIEW = false;
        window.dispatchEvent(new Event("returned_to_roadmap"));
      };
    }
  }, []);

  useEffect(() => {
    if (!showPracticeTab && activeTab === "practice") {
      setActiveTab("video");
    }
    if (!showAskKyleTab && activeTab === "kyle") {
      setActiveTab("video");
    }
  }, [showPracticeTab, showAskKyleTab, activeTab]);

  // Reset quiz gate state when level changes
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
    setShowQuizModal(false);
    setActiveQuizGate(null);
    setQuizQueue([]);
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
    if (!isKyleRoadmap || quiz80Satisfied || isPreview) return;
    setQuizQueue(prev => prev.includes('80') ? prev : [...prev, '80']);
    setShowQuizModal(showing => {
      if (!showing) {
        setActiveQuizGate('80');
        return true;
      }
      return showing;
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kyle-pet-state", { detail: { state: "thinking" } }),
      );
    }
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

    // 80% recovery takes priority: user watched 80%+ but hasn't done the gate quiz
    if (canMarkComplete && !quiz80Satisfied) {
      setQuizQueue(prev => prev.includes('80') ? prev : [...prev, '80']);
      setActiveQuizGate('80');
      setShowQuizModal(true);
      return;
    }

    // 50% recovery: user watched 50%+ but hasn't done the midpoint quiz
    if (!quiz50Satisfied && isSegmentBased) {
      const stored = typeof window !== 'undefined'
        ? parseFloat(localStorage.getItem(`segment_watch_${roadmapType}_${level.id}`) || '0')
        : 0;
      const duration = level.endSec - level.startSec;
      if (stored >= duration * 0.5 && duration > 0) {
        setQuizQueue(prev => prev.includes('50') ? prev : [...prev, '50']);
        setActiveQuizGate('50');
        setShowQuizModal(true);
      }
    }
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
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 via-amber-50 to-gray-100">
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

          {/* Video/Practice/Ask Kyle Switcher — hidden in preview (video only) */}
          {!isPreview && (
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex bg-orange-200/60 rounded-full p-1">
                <button
                  onClick={() => setActiveTab("video")}
                  className={`px-8 sm:px-12 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                    activeTab === "video"
                      ? "bg-blue-400 text-white shadow-md"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Video
                </button>
                {showAskKyleTab && (
                  <button
                    onClick={() => setActiveTab("kyle")}
                    className={`px-8 sm:px-12 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                      activeTab === "kyle"
                        ? "bg-blue-400 text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Ask Kyle
                  </button>
                )}
                {showPracticeTab && (
                  <button
                    onClick={() => setActiveTab("practice")}
                    className={`px-8 sm:px-12 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                      activeTab === "practice"
                        ? "bg-blue-400 text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Practice
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - VideoTab always mounted to keep player warm, others conditionally rendered */}
      <div className={activeTab === "video" ? "block" : "hidden"}>
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
          isVisible={activeTab === "video"}
          shouldPauseVideo={shouldPauseVideo}
        />
      </div>
      {/* Practice and Ask Kyle tabs suppressed in preview */}
      {activeTab === "practice" && showPracticeTab && !isPreview && (
        <PracticeTab level={level} roadmapType={roadmapType} />
      )}
      {activeTab === "kyle" && showAskKyleTab && !isPreview && (
        <div className="pb-12">
          <DoubtSolver level={level} roadmapType={roadmapType} role={role} />
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
  );
};

export default LevelContent;
