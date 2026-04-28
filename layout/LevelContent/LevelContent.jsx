import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import VideoTab from './VideoTab';
import PracticeTab from './PracticeTab';

// Function to calculate the 50% time duration for legacy full-video levels
function fiftyPercentOfVideo(durationInMinutes, levelId, roadmapType, onTimerComplete) {
    const durationInMilliseconds = durationInMinutes * 60 * 1000;
    const fiftyPercentDuration = durationInMilliseconds * 0.5;

    const storageKey = `video_timer_${roadmapType}_${levelId}`;
    const storedElapsed = parseInt(localStorage.getItem(storageKey) || '0', 10);

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

const LevelContent = ({ level, onBack, onComplete, isCompleted, roadmapType = 'git-github' }) => {
    const [activeTab, setActiveTab] = useState('video');
    const [hasWatched, setHasWatched] = useState(isCompleted);
    const [markComplete, setCanMarkComplete] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const cleanupRef = useRef(null);
    const prevLevelIdRef = useRef(null);

    // Check if level is segment-based
    const isSegmentBased = level.startSec !== undefined && level.endSec !== undefined && level.videoId;

    // Compute canMarkComplete from localStorage - recomputes when level changes
    const storedWatchTime = isSegmentBased
        ? parseFloat(localStorage.getItem(`segment_watch_${roadmapType}_${level.id}`) || '0')
        : 0;
    const segmentDuration = isSegmentBased ? (level.endSec - level.startSec) : 0;
    const thresholdSeconds = segmentDuration * 0.5;
    const storedWatchTimeForLegacy = level.durationInMinutes
        ? parseInt(localStorage.getItem(`video_timer_${roadmapType}_${level.id}`) || '0', 10)
        : 0;
    const fiftyPercentDurationLegacy = level.durationInMinutes
        ? level.durationInMinutes * 60 * 1000 * 0.5
        : 0;

    // Derived canMarkComplete - recomputes on every render based on localStorage
    const canMarkComplete = isCompleted
        ? true
        : isSegmentBased
            ? storedWatchTime >= thresholdSeconds
            : level.durationInMinutes
                ? storedWatchTimeForLegacy >= fiftyPercentDurationLegacy
                : false;

    // Legacy levels: start timer only if not already completed
    useEffect(() => {
        if (!isSegmentBased && level.durationInMinutes && !isCompleted && !canMarkComplete) {
            cleanupRef.current = fiftyPercentOfVideo(
                level.durationInMinutes,
                level.id,
                roadmapType,
                () => setCanMarkComplete(true)
            );
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [isSegmentBased, level.durationInMinutes, level.id, isCompleted, roadmapType, canMarkComplete]);

    // Called when 50% watch threshold is met
    const handleThresholdMet = useCallback(() => {
        setCanMarkComplete(true);
    }, []);

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

                    {/* Video/Practice Switcher */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="inline-flex bg-orange-200/60 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab('video')}
                                className={`px-8 sm:px-12 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                                    activeTab === 'video'
                                        ? 'bg-blue-400 text-white shadow-md'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                Video
                            </button>
                            <button
                                onClick={() => setActiveTab('practice')}
                                className={`px-8 sm:px-12 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-medium transition-all duration-300 ${
                                    activeTab === 'practice'
                                        ? 'bg-blue-400 text-white shadow-md'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                Practice
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - VideoTab always mounted to keep player warm, PracticeTab conditionally rendered */}
            <div className={activeTab === 'video' ? 'block' : 'hidden'}>
                <VideoTab
                    level={level}
                    hasWatched={hasWatched}
                    onThresholdMet={handleThresholdMet}
                    onMarkComplete={handleMarkComplete}
                    feedback={feedback}
                    setFeedback={setFeedback}
                    canMarkComplete={canMarkComplete}
                    roadmapType={roadmapType}
                    isVisible={activeTab === 'video'}
                />
            </div>
            {activeTab === 'practice' && <PracticeTab level={level} roadmapType={roadmapType} />}
        </div>
    );
};

export default LevelContent;
