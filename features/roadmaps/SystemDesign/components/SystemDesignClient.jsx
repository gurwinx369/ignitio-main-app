'use client';

import React, { useState, useEffect } from 'react';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import { useAuth } from '@/features/context/AuthContext';
import { systemDesignRoadmapData } from '@/data/systemDesignData';

export default function SystemDesignClient() {
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RoadmapSkeleton color="#3b82f6" />
                </div>
            </div>
        );
    }

    return <RoadmapTemplate roadmapData={systemDesignRoadmapData} />;
}
