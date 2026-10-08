'use client';

import React, { useState, useEffect } from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import { useAuth } from '@/features/context/AuthContext';
import { getPromptEngineeringRoadmapByRole, promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData } from '@/data/promptEngineering';

export default function PromptEngineeringClient({ isPreview = false }) {
    const { user, userProfile, isProfileLoading } = useAuth();
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isPreview && isProfileLoading) {
            return;
        }

        let role = "other";
        if (isPreview) {
            role = typeof window !== 'undefined' ? (localStorage.getItem("profession") || "other") : "other";
        } else if (userProfile) {
            role = userProfile.role || "other";
        }

        setSelectedRoadmap(getPromptEngineeringRoadmapByRole(role));
        setIsLoading(false);
    }, [isPreview, userProfile, isProfileLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RoadmapSkeleton color="#f59e0b" />
                </div>
            </div>
        );
    }

    return <RoadmapTemplate roadmapData={selectedRoadmap || genericPromptEngineeringRoadmapData} isPreview={isPreview} />;
}
