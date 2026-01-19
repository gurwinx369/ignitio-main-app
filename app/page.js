import React from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseData} from '@/data/courseData';
import Profile from "@/layout/Profile"
import LockedProgressCard from "@/layout/LockedProgressCard";

export default function Home() {
    return (
        <>
            <Profile/>
            <ExpandableProgressCard {...courseData} />;
            <LockedProgressCard name="Intermediate - Merge Master"
                                color="#F5B700" image="/mosaic-locked-progress-card.svg" levels={4}
                                completedLevels={0}
                                isExpanded={false}
                                isLocked={true}/>;
        </>
    );
}
