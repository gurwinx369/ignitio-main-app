"use client";
import React, { useState, useEffect } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseDataBeginner, courseDataIntermediate, courseDataAdvanced} from '@/data/courseData';
import Profile from "@/layout/Profile"

export default function Home() {
    const [beginnerProgress, setBeginnerProgress] = useState({ completed: 0, total: 3 });
    const [intermediateProgress, setIntermediateProgress] = useState({ completed: 0, total: 3 });
    const [isViewingLevel, setIsViewingLevel] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(()=>{
            setIsMounted(true);
        }, 1000)
       return () => { clearTimeout(timer); }
    }, []);

    const isIntermediateUnlocked = beginnerProgress.completed >= beginnerProgress.total;
    const isAdvancedUnlocked = intermediateProgress.completed >= intermediateProgress.total;

    if (!isMounted) return null;

    return (
        <div className="pb-20">
            {!isViewingLevel && <Profile/>}

            <ExpandableProgressCard
                id="beginner"
                {...courseDataBeginner}
                onProgressUpdate={(completed, total) => setBeginnerProgress({ completed, total })}
                onLevelViewChange={(viewing) => setIsViewingLevel(viewing)}
            />

            {!isViewingLevel && (
                <>
                    <ExpandableProgressCard
                        id="intermediate"
                        {...courseDataIntermediate}
                        isLocked={!isIntermediateUnlocked}
                        onProgressUpdate={(completed, total) => setIntermediateProgress({ completed, total })}
                        onLevelViewChange={(viewing) => setIsViewingLevel(viewing)}
                    />

                    <ExpandableProgressCard
                        id="advanced"
                        {...courseDataAdvanced}
                        isLocked={!isAdvancedUnlocked}
                        onLevelViewChange={(viewing) => setIsViewingLevel(viewing)}
                    />
                </>
            )}
        </div>
    );
}
