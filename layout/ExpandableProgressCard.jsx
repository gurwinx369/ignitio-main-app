"use client"
import React, {useEffect, useState} from 'react';
import CardContainer from './Card/CardContainer';
import CardHeader from './Card/CardHeader';
import LevelsList from './Card/LevelsList';
import LevelContent from './LevelContent/LevelContent';

const ExpandableProgressCard = ({
                                    name, color, image, levels = [], onProgressUpdate, onLevelViewChange
                                }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [completedLevels, setCompletedLevels] = useState([]);

    const totalLevels = levels.length;
    const completedCount = completedLevels.length;

    useEffect(() => {
        if (onProgressUpdate) {
            onProgressUpdate(completedCount, totalLevels);
        }
    }, [completedCount, totalLevels, onProgressUpdate]);

    useEffect(() => {
        if (onLevelViewChange) {
            onLevelViewChange(selectedLevel !== null);
        }
    }, [selectedLevel, onLevelViewChange]);

    const handleLevelClick = (level) => {
        setSelectedLevel(level);
    };

    const handleVideoComplete = (levelId) => {
        if (!completedLevels.includes(levelId)) {
            setCompletedLevels([...completedLevels, levelId]);
        }
    };

    const handleBack = () => {
        setSelectedLevel(null);
    };

    if (selectedLevel) {
        return (<LevelContent
                level={selectedLevel}
                onBack={handleBack}
                onComplete={handleVideoComplete}
                isCompleted={completedLevels.includes(selectedLevel.id)}
            />);
    }

    return (<CardContainer color={color}>
            <CardHeader
                name={name}
                color={color}
                image={image}
                levels={levels}
                completedLevels={completedLevels}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
            />
            <LevelsList
                levels={levels}
                color={color}
                isExpanded={isExpanded}
                completedLevels={completedLevels}
                onLevelClick={handleLevelClick}
            />
        </CardContainer>);
};

export default ExpandableProgressCard;
