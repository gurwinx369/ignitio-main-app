"use client"
import React, {useEffect, useState} from 'react';
import CardContainer from './Card/CardContainer';
import CardHeader from './Card/CardHeader';
import LevelsList from './Card/LevelsList';
import LevelContent from './LevelContent/LevelContent';
import {Lock} from "lucide-react";

const ExpandableProgressCard = ({
                                    id,
                                    name,
                                    color,
                                    image,
                                    levels = [],
                                    onProgressUpdate,
                                    onLevelViewChange,
                                    isLocked = false,
                                    roadmapType = 'git-github'
                                }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            const storageKey = `progress_${roadmapType}_${id}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setCompletedLevels(JSON.parse(saved));
            }
        }, 1000)
        return () => clearTimeout(timer)
    }, [id, roadmapType]);

    const totalLevels = levels.length;
    const completedCount = completedLevels.length;
    useEffect(() => {
        if (onProgressUpdate) {
            onProgressUpdate(completedCount, totalLevels);
        }
        localStorage.setItem("completedLevels", JSON.stringify(completedCount));
    }, [completedCount, totalLevels, onProgressUpdate]);

    useEffect(() => {
        if (onLevelViewChange) {
            onLevelViewChange(selectedLevel !== null);
        }
    }, [selectedLevel, onLevelViewChange]);

    const handleLevelClick = (level) => {
        if (isLocked) return;
        setSelectedLevel(level);
    };

    const handleVideoComplete = (levelId) => {
        if (!completedLevels.includes(levelId)) {
            const newCompleted = [...completedLevels, levelId];
            setCompletedLevels(newCompleted);
            localStorage.setItem(`progress_${roadmapType}_${id}`, JSON.stringify(newCompleted));
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
            roadmapType={roadmapType}
        />);
    }

    if (!isMounted) return null;

    return (

        <div
            className={`relative transition-all duration-700 ${isLocked ? 'opacity-90 grayscale-[0.3]' : 'opacity-100 grayscale-0'}`}>

        <CardContainer color={color}>
                <div className="relative">
                    {isLocked && (
                        <div className="absolute top-4 right-4 z-30">
                            <div
                                className="bg-black/40 backdrop-blur-sm rounded-full p-2 border border-white/10 shadow-xl">
                                <Lock className="w-5 h-5 text-white" strokeWidth={2.5}/>
                            </div>
                        </div>
                    )}
                    <CardHeader
                        name={name}
                        color={color}
                        image={image}
                        levels={levels}
                        completedLevels={completedLevels}
                        isExpanded={isExpanded}
                        onToggle={() => !isLocked && setIsExpanded(!isExpanded)}
                    />
                    {!isLocked && (
                        <LevelsList
                            levels={levels}
                            color={color}
                            isExpanded={isExpanded}
                            completedLevels={completedLevels}
                            onLevelClick={handleLevelClick}
                            difficulty={id}
                        />
                    )}
                </div>
            </CardContainer>
        </div>

    );

};

export default ExpandableProgressCard;
