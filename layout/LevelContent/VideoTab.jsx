import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import YouTubeSegmentPlayer from './YouTubeSegmentPlayer';

const VideoTab = ({ level, hasWatched, onThresholdMet, onMarkComplete, feedback, setFeedback, canMarkComplete, roadmapType = 'git-github', isVisible = true }) => {
    const thresholdCalledRef = useRef(false);

    // Check if level is segment-based
    const isSegmentBased = level.startSec !== undefined && level.endSec !== undefined && level.videoId;

    // Calculate segment duration
    const segmentDuration = isSegmentBased ? (level.endSec - level.startSec) : 0;
    const watchThreshold = segmentDuration * 0.5; // 50% of segment

    // Storage key for segment watch time
    const watchTimeKey = `segment_watch_${roadmapType}_${level.id}`;

    // Lazy initialization from localStorage
    const [watchedSeconds, setWatchedSeconds] = useState(() => {
        if (isSegmentBased) {
            return parseFloat(localStorage.getItem(watchTimeKey) || '0');
        }
        return 0;
    });

    // Lazy initialization for isLoaded
    const [isLoaded, setIsLoaded] = useState(() => isSegmentBased);

    // Derived: threshold reached based on watched seconds
    const thresholdReached = watchedSeconds >= watchThreshold;

    // Save watch time and call onThresholdMet once when threshold is crossed
    useEffect(() => {
        if (isSegmentBased && watchedSeconds > 0) {
            localStorage.setItem(watchTimeKey, watchedSeconds.toString());

            // Call onThresholdMet only once when threshold is first crossed
            if (watchedSeconds >= watchThreshold && !thresholdCalledRef.current && !hasWatched) {
                thresholdCalledRef.current = true;
                onThresholdMet?.();
            }
        }
    }, [watchedSeconds, watchThreshold, isSegmentBased, watchTimeKey, hasWatched, onThresholdMet]);

    const handleWatchTimeUpdate = useCallback((seconds) => {
        // Only accumulate watch time - never decrease due to scrubbing
        setWatchedSeconds(prev => Math.max(prev, seconds));
    }, []);

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
                        />
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
                                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:shadow-md active:scale-95 text-sm sm:text-base font-medium"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Complete
                                </button>
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
                                    <span>{Math.min(100, Math.round((watchedSeconds / segmentDuration) * 100))}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${Math.min(100, (watchedSeconds / segmentDuration) * 100)}%` }}
                                    />
                                </div>
                                {!canMarkComplete && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Watch {Math.round((watchThreshold - watchedSeconds))} more seconds to unlock completion
                                    </p>
                                )}
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
                            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                                feedback === 'positive'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                            onClick={() => setFeedback('negative')}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                                feedback === 'negative'
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
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                                isLoaded ? 'opacity-100' : 'opacity-0'
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
                                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:shadow-md active:scale-95 text-sm sm:text-base font-medium"
                            >
                                <CheckCircle className="w-4 h-4" />
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
                        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                            feedback === 'positive'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={() => setFeedback('negative')}
                        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                            feedback === 'negative'
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
