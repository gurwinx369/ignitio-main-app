import React, { useState, useEffect, useRef } from 'react';
import RoadmapWorldView from './RoadmapWorldView';
import LessonPopup from './LessonPopup';
import LevelCompletionToast from './LevelCompletionToast';

const LevelsList = ({
                        levels, color, isExpanded, completedLevels, onLevelClick, difficulty
                    }) => {
    const [popupLevel, setPopupLevel] = useState(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const prevCompletedCount = useRef(null);

    useEffect(() => {
        if(prevCompletedCount.current === null) {
            prevCompletedCount.current = completedLevels.length;
            return;
        }

        if(completedLevels.length > prevCompletedCount.current) {
            setShowCompletion(true);

            const timer = setTimeout(() => {
                setShowCompletion(false);
            }, 2500);

            prevCompletedCount.current = completedLevels.length;
            
            return () => clearTimeout(timer);
        }

        prevCompletedCount.current = completedLevels.length;
    }, [completedLevels]);

    const handleNodeClick = (level) => {
        setPopupLevel(level);
    };

    const handleClosePopup = () => {
        setPopupLevel(null);
    };

    const handleStartLesson = (level) => {
        setPopupLevel(null);
        onLevelClick(level); // Call existing handler
    };

    return (
        <div
            className="transition-all duration-500 ease-in-out relative w-full overflow-visible"
            style={{
                maxHeight: isExpanded ? 'none' : '0px',
                opacity: isExpanded ? 1 : 0
            }}
        >
            {isExpanded && (
                <RoadmapWorldView 
                    levels={levels}
                    completedLevels={completedLevels}
                    color={color}
                    onNodeClick={handleNodeClick}
                    difficulty={difficulty}
                />
            )}
            
            {popupLevel && (
                <LessonPopup 
                    level={popupLevel}
                    isCompleted={completedLevels.includes(popupLevel.id)}
                    onStart={handleStartLesson}
                    onClose={handleClosePopup}
                    difficulty={difficulty}
                />
            )}
            
            {showCompletion && (
                <LevelCompletionToast difficulty={difficulty} />
            )}
        </div>);
};

export default LevelsList;
