import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import VideoTab from "./VideoTab";
import PracticeTab from "./PracticeTab";
import DoubtSolver from "./DoubtSolver";
import KyleQuizModal from "./KyleQuizModal";
import { isKyleEnabledRoadmap } from "@/features/roadmaps/lib/roadmapCapabilities";

// Function to calculate the 50% time duration for legacy full-video levels
function fiftyPercentOfVideo(
  durationInMinutes,
  levelId,
  roadmapType,
  onTimerComplete,
) {
  const durationInMilliseconds = durationInMinutes * 60 * 1000;
  const fiftyPercentDuration = durationInMilliseconds * 0.5;

  const storageKey = `video_timer_${roadmapType}_${levelId}`;
  const storedElapsed = parseInt(localStorage.getItem(storageKey) || "0", 10);

  const remainingTime = Math.max(0, fiftyPercentDuration - storedElapsed);

  if (remainingTime === 0) {
    onTimerComplete();
    return null;
  }

  const startTime = Date.now();

  const timer = setTimeout(() => {
    localStorage.removeItem(storageKey);
    onTimerComplete();
  }, remainingTime);

  return () => {
    clearTimeout(timer);
    const additionalElapsed = Date.now() - startTime;
    const totalElapsed = storedElapsed + additionalElapsed;
    localStorage.setItem(storageKey, totalElapsed.toString());
  };
}

const LevelContent = ({
  level,
  onBack,
  onComplete,
  isCompleted,
  roadmapType = "git-github",
  role,
  dayNumber,
  showAssignmentModal = false,
}) => {
  const [activeTab, setActiveTab] = useState("video");
  const [hasWatched, setHasWatched] = useState(isCompleted);
  const [feedback, setFeedback] = useState(null);
  const cleanupRef = useRef(null);
  const prevLevelIdRef = useRef(null);

  const isKyleRoadmap = isKyleEnabledRoadmap(roadmapType);

  const quizGateCompletedKey = `quiz_gate_completed_${roadmapType}_${level.id}`;
  const quizGateBypassedKey = `quiz_gate_bypassed_${roadmapType}_${level.id}`;

  const initialQuizSatisfied =
    typeof window !== "undefined"
      ? localStorage.getItem(quizGateCompletedKey) === "true" ||
        sessionStorage.getItem(quizGateBypassedKey) === "true"
      : false;

  const [quizSatisfied, setQuizSatisfied] = useState(initialQuizSatisfied);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const shouldPauseVideo = showQuizModal || showAssignmentModal;

  useEffect(() => {
    if (isKyleRoadmap && activeTab === "practice") {
      setActiveTab("video");
    }
    if (!isKyleRoadmap && activeTab === "kyle") {
      setActiveTab("video");
    }
  }, [isKyleRoadmap, activeTab]);

  // Update quiz logic when level changes
  useEffect(() => {
    const satisfied =
      typeof window !== "undefined"
        ? localStorage.getItem(quizGateCompletedKey) === "true" ||
          sessionStorage.getItem(quizGateBypassedKey) === "true"
        : false;
    setQuizSatisfied(satisfied);
    setShowQuizModal(false);
  }, [quizGateCompletedKey, quizGateBypassedKey]);

  // Check if level is segment-based
  const isSegmentBased =
    level.startSec !== undefined && level.endSec !== undefined && level.videoId;

  // Compute canMarkComplete from localStorage - recomputes when level changes
  const segmentDuration = isSegmentBased ? level.endSec - level.startSec : 0;
  const thresholdSeconds = segmentDuration * 0.5;

  // Security: cross-validate segment_watch against segment_intervals.
  // segment_watch is the fast-path scalar. segment_intervals is the authoritative interval array.
  // We take the MINIMUM of both — so forging only one key is insufficient.
  const rawStoredWatchTime = isSegmentBased
    ? parseFloat(localStorage.getItem(`segment_watch_${roadmapType}_${level.id}`) || "0")
    : 0;

  const storedWatchTime = (() => {
    if (!isSegmentBased) return 0;
    // Clamp the scalar to maximum possible segment duration
    const clamped = Math.min(rawStoredWatchTime, segmentDuration);
    // Cross-check against intervals (harder to forge consistently)
    try {
      const intervalsRaw = localStorage.getItem(`segment_intervals_${roadmapType}_${level.id}`);
      if (intervalsRaw) {
        const parsed = JSON.parse(intervalsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const intervalsTotal = parsed.reduce((sum, iv) => {
            if (typeof iv.start === "number" && typeof iv.end === "number" && iv.end > iv.start) {
              // Each interval cannot exceed the segment duration
              return sum + Math.min(iv.end - iv.start, segmentDuration);
            }
            return sum;
          }, 0);
          // Trust whichever is lower — defeats single-key tampering
          return Math.min(clamped, intervalsTotal);
        }
      }
    } catch {
      // Corrupted intervals — fall back to scalar only
    }
    return clamped;
  })();

  const fiftyPercentDurationLegacy = level.durationInMinutes
    ? level.durationInMinutes * 60 * 1000 * 0.5
    : 0;
  // Security: clamp legacy timer to the actual 50% cap
  const rawStoredWatchTimeForLegacy = level.durationInMinutes
    ? parseInt(localStorage.getItem(`video_timer_${roadmapType}_${level.id}`) || "0", 10)
    : 0;
  const storedWatchTimeForLegacy = level.durationInMinutes
    ? Math.min(rawStoredWatchTimeForLegacy, fiftyPercentDurationLegacy)
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

  const canMarkCompleteAfterQuiz =
    canMarkComplete && (!isKyleRoadmap || quizSatisfied);

  // Recover users who refresh after already meeting watch threshold but not finishing quiz
  useEffect(() => {
    if (isKyleRoadmap && canMarkComplete && !quizSatisfied && !isCompleted) {
      setShowQuizModal(true);
    }
  }, [isKyleRoadmap, canMarkComplete, quizSatisfied, isCompleted]);

  // Legacy levels: start timer only if not already completed
  useEffect(() => {
    if (
      !isSegmentBased &&
      level.durationInMinutes &&
      !isCompleted &&
      !canMarkComplete
    ) {
      cleanupRef.current = fiftyPercentOfVideo(
        level.durationInMinutes,
        level.id,
        roadmapType,
        () => setCanMarkComplete(true),
      );
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [
    isSegmentBased,
    level.durationInMinutes,
    level.id,
    isCompleted,
    roadmapType,
    canMarkComplete,
  ]);

  // Called when 50% watch threshold is met
  const handleThresholdMet = useCallback(() => {
    setCanMarkComplete(true);
    if (isKyleRoadmap && !quizSatisfied) {
      setShowQuizModal(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kyle-pet-state", { detail: { state: "thinking" } }),
        );
      }
    }
  }, [isKyleRoadmap, quizSatisfied]);

  const handleQuizAnswered = ({ wasCorrect, alreadyAttempted }) => {
    localStorage.setItem(quizGateCompletedKey, "true");
    setQuizSatisfied(true);
  };

  const handleCloseQuizModal = () => {
    // In case they bypassed, check if bypassed key exists
    if (sessionStorage.getItem(quizGateBypassedKey) === "true") {
      setQuizSatisfied(true);
    }
    setShowQuizModal(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kyle-pet-state", { detail: { action: "clear" } }),
      );
    }
  };
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

          {/* Video/Practice/Ask Kyle Switcher */}
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
              {isKyleRoadmap ? (
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
              ) : (
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
        </div>
      </div>

      {/* Content - VideoTab always mounted to keep player warm, others conditionally rendered */}
      <div className={activeTab === "video" ? "block" : "hidden"}>
        <VideoTab
          level={level}
          hasWatched={hasWatched}
          onThresholdMet={handleThresholdMet}
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
      {activeTab === "practice" && !isKyleRoadmap && (
        <PracticeTab level={level} roadmapType={roadmapType} />
      )}
      {activeTab === "kyle" && isKyleRoadmap && (
        <div className="pb-12">
          <DoubtSolver level={level} roadmapType={roadmapType} role={role} />
        </div>
      )}
      <KyleQuizModal
        open={showQuizModal}
        level={level}
        roadmapType={roadmapType}
        dayNumber={dayNumber}
        role={role}
        onAnswered={handleQuizAnswered}
        onCloseAfterAnswered={handleCloseQuizModal}
      />
    </div>
  );
};

export default LevelContent;
