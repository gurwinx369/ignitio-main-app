import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import YouTubeSegmentPlayer from './YouTubeSegmentPlayer';
import { scheduleIdleTask } from '@/lib/utils/idleTask';

const VideoTab = ({ level, hasWatched, onMidpointMet, onCompletionMet, onMarkComplete, feedback, setFeedback, hasMetWatchThreshold, canMarkComplete, roadmapType = 'git-github', isVisible = true, shouldPauseVideo = false }) => {
    // Two separate one-shot guards — midpoint (50%) and completion (80%)
    const midpointCalledRef = useRef(false);
    const completionCalledRef = useRef(false);

    // Check if level is segment-based
    const isSegmentBased = level.startSec !== undefined && level.endSec !== undefined && level.videoId;

    // Threshold constants — single source of truth
    const MIDPOINT_THRESHOLD_RATIO = 0.5;    // 50% — triggers midpoint quiz (does NOT unlock button)
    const COMPLETION_THRESHOLD_RATIO = 0.8;  // 80% — triggers completion quiz + unlocks button

    // Calculate segment duration and both thresholds
    const segmentDuration = isSegmentBased ? (level.endSec - level.startSec) : 0;
    const midpointThreshold = segmentDuration * MIDPOINT_THRESHOLD_RATIO;
    const watchThreshold = segmentDuration * COMPLETION_THRESHOLD_RATIO;

    // Storage keys
    const watchTimeKey = `segment_watch_${roadmapType}_${level.id}`;
    const watchIntervalsKey = `segment_intervals_${roadmapType}_${level.id}`;

    // Helper: merge overlapping/adjacent intervals
    const mergeIntervals = useCallback((intervals) => {
        if (intervals.length === 0) return [];
        const sorted = [...intervals].sort((a, b) => a.start - b.start);
        const merged = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const last = merged[merged.length - 1];
            const curr = sorted[i];
            // Merge if overlapping or adjacent (within 0.5s)
            if (curr.start <= last.end + 0.5) {
                last.end = Math.max(last.end, curr.end);
            } else {
                merged.push(curr);
            }
        }
        return merged;
    }, []);

    // Helper: calculate total seconds from merged intervals
    const calculateWatchedSeconds = useCallback((intervals) => {
        return intervals.reduce((total, interval) => total + (interval.end - interval.start), 0);
    }, []);

    // Lazy initialization from localStorage - load intervals and compute seconds
    const [watchedIntervals, setWatchedIntervals] = useState(() => {
        if (isSegmentBased) {
            try {
                const stored = localStorage.getItem(watchIntervalsKey);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return mergeIntervals(parsed);
                }
            } catch (e) {
                console.warn('Failed to parse watch intervals:', e);
            }
        }
        return [];
    });

    // Derived: total watched seconds from intervals
    const watchedSeconds = calculateWatchedSeconds(watchedIntervals);

    const intervalsRef = useRef(watchedIntervals);
    useEffect(() => {
        intervalsRef.current = watchedIntervals;
    }, [watchedIntervals]);

    const workerRef = useRef(null);
    useEffect(() => {
        try {
            workerRef.current = new Worker('/workers/intervalWorker.js');
            workerRef.current.onmessage = (e) => {
                const { type, merged } = e.data;
                if (type === 'RESULT') {
                    setWatchedIntervals(merged);
                    intervalsRef.current = merged;
                }
            };
            workerRef.current.onerror = (err) => {
                console.warn("Worker error (likely 404 if server wasn't restarted). Falling back to main thread.", err);
                workerRef.current = null;
                setWatchedIntervals(() => mergeIntervals(intervalsRef.current));
            };
        } catch (err) {
            console.warn("Failed to initialize intervalWorker", err);
            setWatchedIntervals(() => mergeIntervals(intervalsRef.current));
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [mergeIntervals]);

    // Lazy initialization for isLoaded
    const [isLoaded, setIsLoaded] = useState(() => isSegmentBased);

    const safeSegmentDuration = Math.max(0, Number(segmentDuration) || 0);
    const safeWatchThreshold = Math.max(0, Number(watchThreshold) || 0);
    const safeWatchedSeconds = Math.max(0, Number(watchedSeconds) || 0);

    const watchProgressPercent = safeSegmentDuration > 0
        ? Math.min(100, Math.max(0, (safeWatchedSeconds / safeSegmentDuration) * 100))
        : 0;

    const remainingSeconds = Math.max(0, Math.ceil(safeWatchThreshold - safeWatchedSeconds));

    const hasMetWatchRequirement = hasMetWatchThreshold || safeWatchedSeconds >= safeWatchThreshold;

    // Derived: threshold reached based on watched seconds
    const thresholdReached = watchedSeconds >= watchThreshold;

    // Save watch intervals to localStorage whenever they change
    useEffect(() => {
        if (isSegmentBased && watchedIntervals.length > 0) {
            scheduleIdleTask(() => {
                localStorage.setItem(watchIntervalsKey, JSON.stringify(watchedIntervals));
                localStorage.setItem(watchTimeKey, watchedSeconds.toString());
            });

            // Fire midpoint (50%) callback exactly once — triggers first quiz, does NOT unlock button
            if (watchedSeconds >= midpointThreshold && !midpointCalledRef.current && !hasWatched) {
                midpointCalledRef.current = true;
                onMidpointMet?.();
            }

            // Fire completion (80%) callback exactly once — triggers second quiz + unlocks button
            if (watchedSeconds >= watchThreshold && !completionCalledRef.current && !hasWatched) {
                completionCalledRef.current = true;
                onCompletionMet?.();
            }
        }
    }, [watchedIntervals, watchedSeconds, midpointThreshold, watchThreshold, isSegmentBased, watchIntervalsKey, watchTimeKey, hasWatched, onMidpointMet, onCompletionMet]);

    // Handle watch time update from player - receives { currentTime, delta }
    // currentTime: absolute position in video
    // delta: seconds watched since last report (only positive, small values = real playback)
    const handleWatchTimeUpdate = useCallback((data) => {
        if (!isSegmentBased) return;

        const { currentTime, delta } = typeof data === 'object' ? data : { currentTime: null, delta: data };

        // If we don't have currentTime, fall back to delta-only mode (less accurate)
        if (currentTime === null || currentTime === undefined) {
            if (delta <= 0) return;
            const currentEnd = intervalsRef.current.length > 0 ? intervalsRef.current[intervalsRef.current.length - 1].end : level.startSec;
            const newInterval = { start: currentEnd, end: currentEnd + delta };
            intervalsRef.current = [...intervalsRef.current, newInterval];

            if (workerRef.current) {
                workerRef.current.postMessage({ type: 'MERGE_AND_ADD', intervals: intervalsRef.current });
            } else {
                setWatchedIntervals(prev => mergeIntervals([...prev, newInterval]));
            }
            return;
        }

        // Clamp currentTime to segment bounds
        const clampedTime = Math.max(level.startSec, Math.min(level.endSec, currentTime));

        // Create a small interval around current position
        // The interval represents "time just watched" - from (currentTime - delta) to currentTime
        const intervalStart = Math.max(level.startSec, clampedTime - delta);
        const intervalEnd = Math.min(level.endSec, clampedTime);

        if (intervalEnd > intervalStart) {
            const newInterval = { start: intervalStart, end: intervalEnd };
            intervalsRef.current = [...intervalsRef.current, newInterval];

            if (workerRef.current) {
                workerRef.current.postMessage({ type: 'MERGE_AND_ADD', intervals: intervalsRef.current });
            } else {
                setWatchedIntervals(prev => mergeIntervals([...prev, newInterval]));
            }
        }
    }, [isSegmentBased, level.startSec, level.endSec, mergeIntervals]);

    // Helper function to extract YouTube video ID
    const extractYouTubeId = (url) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : '';
    };

    // Render segment-based view
    if (isSegmentBased) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="space-y-6 sm:space-y-8">
                    {/* Video Player */}
                    <div className="bg-gray-300 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl">
                        <YouTubeSegmentPlayer
                            videoId={level.videoId}
                            startSec={level.startSec}
                            endSec={level.endSec}
                            onWatchTimeUpdate={handleWatchTimeUpdate}
                            onReady={() => setIsLoaded(true)}
                            autoplay={true}
                            isVisible={isVisible}
                            shouldPauseVideo={shouldPauseVideo}
                        />
                    </div>

                    {/* Video Info */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                {level.title || 'Video Title'}
                            </h1>
                            {!hasWatched && canMarkComplete && (
                                <div className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={onMarkComplete}
                                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-full transition-all duration-150 border-b-[4px] border-green-700 active:border-b-0 active:translate-y-[4px] text-sm sm:text-base font-bold"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Complete
                                    </button>

                                    <span className="text-[10px] sm:text-xs text-gray-500 text-center leading-tight">
                                        Click to complete this lesson
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            {level.description || 'Video description'}
                        </p>

                        {/* Watch progress indicator */}
                        {isSegmentBased && !hasWatched && (
                            <div className="bg-white/60 rounded-lg p-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Watch progress</span>
                                    <span>{Math.round(watchProgressPercent)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${watchProgressPercent}%` }}
                                    />
                                </div>
                                {!hasMetWatchRequirement ? (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Watch {remainingSeconds} more seconds to unlock completion
                                    </p>
                                ) : !canMarkComplete ? (
                                    <p className="text-xs text-orange-600 mt-2">
                                        Watch requirement complete. Finish the Kyle checkpoint to unlock completion.
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Feedback Section */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <span className="text-base sm:text-lg text-gray-700 font-medium">
                            Was this helpful?
                        </span>
                        <button
                            onClick={() => setFeedback('positive')}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${feedback === 'positive'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                            onClick={() => setFeedback('negative')}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${feedback === 'negative'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Legacy view for non-segment levels (original VideoTab behavior)
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="space-y-6 sm:space-y-8">
                {/* Video Player */}
                <div className="bg-gray-300 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        {/* Loading skeleton */}
                        {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                                <div className="text-gray-400 text-lg">Loading video...</div>
                            </div>
                        )}

                        <iframe
                            src={level.videoUrl}
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={level.title}
                            loading="eager"
                            onLoad={() => setIsLoaded(true)}
                            {...(level.videoUrl.includes('youtube.com') && {
                                srcDoc: `
                                    <style>
                                        * { padding: 0; margin: 0; overflow: hidden; }
                                        body, html { height: 100%; }
                                        img, svg { position: absolute; width: 100%; top: 0; bottom: 0; margin: auto; }
                                        svg { filter: drop-shadow(1px 1px 10px hsl(206.5, 70.7%, 8%)); transition: all 250ms ease-in-out; }
                                        body:hover svg { filter: drop-shadow(1px 1px 10px hsl(206.5, 0%, 10%)); transform: scale(1.2); }
                                    </style>
                                    <a href='${level.videoUrl}?autoplay=1'>
                                        <img src='https://img.youtube.com/vi/${extractYouTubeId(level.videoUrl)}/maxresdefault.jpg' alt='Video'>
                                        <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='5 3 19 12 5 21 5 3'></polygon></svg>
                                    </a>
                                `
                            })}
                        />
                    </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            {level.title || 'Video Title'}
                        </h1>
                        {!hasWatched && canMarkComplete && (
                            <button
                                onClick={onMarkComplete}
                                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-full transition-all duration-150 border-b-[4px] border-green-700 active:border-b-0 active:translate-y-[4px] text-sm sm:text-base font-bold"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Complete
                            </button>
                        )}
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {level.description || 'Video description'}
                    </p>
                </div>

                {/* Feedback Section */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <span className="text-base sm:text-lg text-gray-700 font-medium">
                        Was this helpful?
                    </span>
                    <button
                        onClick={() => setFeedback('positive')}
                        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${feedback === 'positive'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={() => setFeedback('negative')}
                        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${feedback === 'negative'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoTab;
