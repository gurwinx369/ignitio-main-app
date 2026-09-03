'use client';

import React, { useState, useEffect } from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import { useAuth } from '@/features/context/AuthContext';
import { getPromptEngineeringRoadmapByRole, promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData } from '@/data/promptEngineering';

export default function PromptEngineeringClient({ isPreview = false }) {
    const { user } = useAuth();
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            let role = "other";
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const res = await fetch("/api/v2/user", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        role = data.user?.role || "other";
                    } else {
                        role = localStorage.getItem("profession") || "other";
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Failed to fetch user role:", error?.message || "unknown error");
                    }
                    role = localStorage.getItem("profession") || "other";
                }
            } else {
                role = localStorage.getItem("profession") || "other";
            }
            setSelectedRoadmap(getPromptEngineeringRoadmapByRole(role));
            setIsLoading(false);
        };

        if (isPreview || user !== undefined) {
            fetchUserRole();
        }
    }, [user]);

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
