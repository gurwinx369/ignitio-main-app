import React, {useState} from 'react';
import {ArrowLeft} from 'lucide-react';
import VideoTab from './VideoTab';
import PracticeTab from './PracticeTab';

const LevelContent = ({level, onBack, onComplete, isCompleted}) => {
    const [activeTab, setActiveTab] = useState('video');
    const [hasWatched, setHasWatched] = useState(isCompleted);
    const [feedback, setFeedback] = useState(null);

    const handleMarkComplete = () => {
        setHasWatched(true);
        onComplete(level.id);
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
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
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
                />
            ) : (
                <PracticeTab level={level}/>
            )}
        </div>
    );
};

export default LevelContent;
