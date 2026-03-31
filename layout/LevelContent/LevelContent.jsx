import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import VideoTab from './VideoTab';
import PracticeTab from './PracticeTab';

// Function to calculate the 80% time duration of any video
function eightyPercentOfVideo(durationInMinutes, levelId, roadmapType, onTimerComplete) {
    const durationInMilliseconds = durationInMinutes * 60 * 1000;
    const eightyPercentDuration = durationInMilliseconds * 0.8;

    const storageKey = `video_timer_${roadmapType}_${levelId}`;
    const storedElapsed = parseInt(localStorage.getItem(storageKey) || '0', 10);

    const remainingTime = Math.max(0, eightyPercentDuration - storedElapsed);

   // console.log(`Total duration: ${durationInMilliseconds}ms, 80%: ${eightyPercentDuration}ms, Elapsed: ${storedElapsed}ms, Remaining: ${remainingTime}ms`);

    if (remainingTime === 0) {
        onTimerComplete();
        return null;
    }

    const startTime = Date.now();

    const timer = setTimeout(() => {
       // console.log("80% of video completed!");
        localStorage.removeItem(storageKey);
        onTimerComplete();
    }, remainingTime);

    return () => {
        clearTimeout(timer);
        const additionalElapsed = Date.now() - startTime;
        const totalElapsed = storedElapsed + additionalElapsed;
        localStorage.setItem(storageKey, totalElapsed.toString());
       // console.log(`Saved progress: ${totalElapsed}ms`);
    };
}

const LevelContent = ({ level, onBack, onComplete, isCompleted, roadmapType = 'git-github' }) => {
    const [activeTab, setActiveTab] = useState('video');
    const [hasWatched, setHasWatched] = useState(isCompleted);
    const [feedback, setFeedback] = useState(null);
    const [canMarkComplete, setCanMarkComplete] = useState(isCompleted); // Initialize with isCompleted
    const cleanupRef = useRef(null);

    useEffect(() => {
        if (level.durationInMinutes && !isCompleted) {
            cleanupRef.current = eightyPercentOfVideo(
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
    }, [level.id, level.durationInMinutes, isCompleted, roadmapType]);

    const handleMarkComplete = () => {
        setHasWatched(true);
        onComplete(level.id);
        localStorage.removeItem(`video_timer_${roadmapType}_${level.id}`);
    };

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

            {/* Content */}
            {activeTab === 'video' ? (
                <VideoTab
                    level={level}
                    hasWatched={hasWatched}
                    onMarkComplete={handleMarkComplete}
                    feedback={feedback}
                    setFeedback={setFeedback}
                    canMarkComplete={canMarkComplete}
                />
            ) : (
                <PracticeTab level={level} roadmapType={roadmapType} />
            )}
        </div>
    );
};

export default LevelContent;
