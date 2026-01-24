"use client";
import React, { useState } from 'react';
import ExpandableProgressCard from '@/layout/ExpandableProgressCard';
import {courseDataBeginner, courseDataIntermediate, courseDataAdvanced} from '@/data/courseData';
import Profile from "@/layout/Profile"

export default function Home() {
    const [progress, setProgress] = useState({ completed: 0, total: 3 });

    return (
        <>
            <Profile/>
            <ExpandableProgressCard 
                {...courseDataBeginner}
                onProgressUpdate={(completed, total) => setProgress({ completed, total })}
            />
        </>
    );
}
