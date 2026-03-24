"use client";
import React, { useState, useEffect } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseDataBeginner, courseDataIntermediate, courseDataAdvanced} from '@/data/gitGithubCourseData';
import Profile from "@/layout/Profile"

export default function GitGithub() {
    const [beginnerProgress, setBeginnerProgress] = useState({ completed: 0, total: 3 });
    const [intermediateProgress, setIntermediateProgress] = useState({ completed: 0, total: 3 });
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

    if (!isMounted) return null;
    return (
            <div className="pb-20">
                {!isViewingLevel && <Profile/>}

                {/* Show beginner card always, or when it's the active card */}
                {(!isViewingLevel || activeCard === 'beginner') && (
                    <ExpandableProgressCard
                        id="beginner"
                        {...courseDataBeginner}
                        onProgressUpdate={(completed, total) => setBeginnerProgress({ completed, total })}
                        onLevelViewChange={handleLevelViewChange('beginner')}
                    />
                )}

                {/* Show intermediate card when unlocked and either not viewing OR it's the active card */}
                {(!isViewingLevel || activeCard === 'intermediate') && (
                    <ExpandableProgressCard
                        id="intermediate"
                        {...courseDataIntermediate}
                        isLocked={!isIntermediateUnlocked}
                        onProgressUpdate={(completed, total) => setIntermediateProgress({ completed, total })}
                        onLevelViewChange={handleLevelViewChange('intermediate')}
                    />
                )}

                {/* Show advanced card when unlocked and either not viewing OR it's the active card */}
                {(!isViewingLevel || activeCard === 'advanced') && (
                    <ExpandableProgressCard
                        id="advanced"
                        {...courseDataAdvanced}
                        isLocked={!isAdvancedUnlocked}
                        onLevelViewChange={handleLevelViewChange('advanced')}
                    />
                )}
            </div>
    )
}
