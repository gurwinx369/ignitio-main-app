"use client";
import React, { useState } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseDataBeginner, courseDataIntermediate, courseDataAdvanced} from '@/data/courseData';
import Profile from "@/layout/Profile"
import LockedProgressCard from "@/layout/LockedProgressCard";

export default function Home() {
    const [progress, setProgress] = useState({ completed: 0, total: 3 });
    
    const isMasterUnlocked = progress.completed >= progress.total;

    return (
        <>
            <Profile/>
            <ExpandableProgressCard 
                {...courseDataBeginner}
                onProgressUpdate={(completed, total) => setProgress({ completed, total })}
            />
            <LockedProgressCard
                {...courseDataIntermediate}
                completedLevels={0}
                isExpanded={false}
                isLocked={!isMasterUnlocked}
            />
        </>
    );
}
