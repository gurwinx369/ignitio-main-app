'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoadmapTemplate from '@/components/roadmap/RoadmapTemplate';
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import { useAuth } from '@/features/context/AuthContext';
import { getDsaRoadmapByRole, isDsaAllowedRole } from '@/data/dsa';

export default function DSAClient({ isPreview = false }) {
    const { user, userProfile, isProfileLoading } = useAuth();
    const router = useRouter();
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notAllowed, setNotAllowed] = useState(false);

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

        if (!isPreview && !isDsaAllowedRole(role)) {
            setNotAllowed(true);
            setIsLoading(false);
            return;
        }

        setSelectedRoadmap(getDsaRoadmapByRole(role));
        setIsLoading(false);
    }, [isPreview, userProfile, isProfileLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RoadmapSkeleton color="#0ea5e9" />
                </div>
            </div>
        );
    }

    if (notAllowed) {
        return (
            <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full text-center shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Available</h2>
                    <p className="text-gray-600 mb-8">
                        DSA roadmap is available for students, developers, and general learners.
                    </p>
                    <button
                        onClick={() => router.push('/home')}
                        className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // if roadmap resolution failed for some reason, just render skeleton or redirect
    if (!selectedRoadmap) {
        return null; 
    }

    return <RoadmapTemplate roadmapData={selectedRoadmap} isPreview={isPreview} />;
}
