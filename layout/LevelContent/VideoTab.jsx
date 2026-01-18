import React from 'react';
import {CheckCircle, ThumbsDown, ThumbsUp} from 'lucide-react';

const VideoTab = ({level, hasWatched, onMarkComplete, feedback, setFeedback}) => {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="space-y-6 sm:space-y-8">
                {/* Video Player */}
                <div className="bg-gray-300 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                        <iframe
                            src={level.videoUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={level.title}
                        />
                    </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            {level.title || 'Video Title'}
                        </h1>
                        {!hasWatched && (
                            <button
                                onClick={onMarkComplete}
                                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:shadow-md active:scale-95 text-sm sm:text-base font-medium"
                            >
                                <CheckCircle className="w-4 h-4"/>
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
                        <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </button>
                    <button
                        onClick={() => setFeedback('negative')}
                        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                            feedback === 'negative'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoTab;
