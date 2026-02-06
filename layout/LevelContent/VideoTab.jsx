import React, {useState} from 'react';
import {CheckCircle, ThumbsDown, ThumbsUp} from 'lucide-react';

const VideoTab = ({ level, hasWatched, onMarkComplete, feedback, setFeedback, canMarkComplete }) => {
    const [isLoaded, setIsLoaded] = useState(false);

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
                            // Lite YouTube embed if using YouTube
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

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : '';
};

export default VideoTab;
