"use client";
import React, { useState } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseData} from '@/data/courseData';
import Profile from "@/layout/Profile"
import LockedProgressCard from "@/layout/LockedProgressCard";

export default function Home() {
    const [progress, setProgress] = useState({ completed: 0, total: 3 });
    
    const isMasterUnlocked = progress.completed >= progress.total;

    return (
        <>
            <Profile/>
            <ExpandableProgressCard 
                {...courseData} 
                onProgressUpdate={(completed, total) => setProgress({ completed, total })}
            />
            <LockedProgressCard 
                name="Intermediate - Merge Master"
                color="#F5B700" 
                image="/mosaic-locked-progress-card.svg" 
                levels={3}
                completedLevels={0}
                isExpanded={false}
                isLocked={!isMasterUnlocked}
            />
        </>
    );
}
