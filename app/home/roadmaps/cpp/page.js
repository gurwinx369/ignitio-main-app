"use client";
import React, { useState, useEffect } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {cppCourseDataBeginner,
    cppCourseDataIntermediate,
    cppCourseDataAdvanced} from '@/data/cppCourseData';
import Profile from "@/layout/Profile"

export default function CPP() {
    const [beginnerProgress, setBeginnerProgress] = useState({ completed: 0, total: 31});
    const [intermediateProgress, setIntermediateProgress] = useState({ completed: 0, total: 0 });
    const [isViewingLevel, setIsViewingLevel] = useState(false);
    const [activeCard, setActiveCard] = useState(null); // Track which card is showing level content
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(()=>{
            setIsMounted(true);
        }, 1000)
        return () => { clearTimeout(timer); }
    }, []);

    const isIntermediateUnlocked = beginnerProgress.completed >= beginnerProgress.total;
    const isAdvancedUnlocked = intermediateProgress.completed >= intermediateProgress.total;
    const handleLevelViewChange = (cardId) => (viewing) => {
        setIsViewingLevel(viewing);
        setActiveCard(viewing ? cardId : null);
    };
    return (
        <div className="pb-20">
            {!isViewingLevel && <Profile/>}

            {/* Show beginner card always, or when it's the active card */}
            {(!isViewingLevel || activeCard === 'beginner') && (
                <ExpandableProgressCard
                    id="beginner"
                    {...cppCourseDataBeginner}
                    roadmapType="cpp"
                    onProgressUpdate={(completed, total) => setBeginnerProgress({ completed, total })}
                    onLevelViewChange={handleLevelViewChange('beginner')}
                />
            )}

            {/* Show intermediate card when unlocked and either not viewing OR it's the active card */}
            {(!isViewingLevel || activeCard === 'intermediate') && (
                <ExpandableProgressCard
                    id="intermediate"
                    {...cppCourseDataIntermediate}
                    roadmapType="cpp"
                    isLocked={!isIntermediateUnlocked}
                    onProgressUpdate={(completed, total) => setIntermediateProgress({ completed, total })}
                    onLevelViewChange={handleLevelViewChange('intermediate')}
                />
            )}

            {/* Show advanced card when unlocked and either not viewing OR it's the active card */}
            {(!isViewingLevel || activeCard === 'advanced') && (
                <ExpandableProgressCard
                    id="advanced"
                    {...cppCourseDataAdvanced}
                    roadmapType="cpp"
                    isLocked={!isAdvancedUnlocked}
                    onLevelViewChange={handleLevelViewChange('advanced')}
                />
            )}
        </div>
    )
}
