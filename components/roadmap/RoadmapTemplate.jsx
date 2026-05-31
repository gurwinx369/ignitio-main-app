"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import RoadmapWorldView from '@/layout/Card/RoadmapWorldView';
import LessonPopup from '@/layout/Card/LessonPopup';
import LevelCompletionToast from '@/layout/Card/LevelCompletionToast';
import LevelContent from '@/layout/LevelContent/LevelContent';
import Profile from "@/layout/Profile";
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';

export default function RoadmapTemplate({ roadmapData }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    
    // Flat array of completed level IDs
    const [completedLevels, setCompletedLevels] = useState([]);

    const [popupLevel, setPopupLevel] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const [isRoadmapReady, setIsRoadmapReady] = useState(false);
    
    const prevCompletedCount = useRef(0);

    const ROADMAP_SKELETON_MIN_MS = 450;

    useEffect(() => {
        setIsRoadmapReady(false);
        const timer = setTimeout(() => {
            setIsRoadmapReady(true);
        }, ROADMAP_SKELETON_MIN_MS);
        return () => clearTimeout(timer);
    }, [activeDayIndex, roadmapData.id]);

    const allLevels = useMemo(() => {
        return roadmapData.days.flatMap(day => day.levels);
    }, [roadmapData.days]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            
            const legacyKeys = [
                `progress_${roadmapData.id}_beginner`,
                `progress_${roadmapData.id}_intermediate`,
                `progress_${roadmapData.id}_advanced`,
                `progress_${roadmapData.id}_day1`,
                `progress_${roadmapData.id}_day2`,
                `progress_${roadmapData.id}_day3`
            ];
            
            let allCompletedIds = new Set();
            
            // 1. Read legacy keys
            legacyKeys.forEach(key => {
                const saved = localStorage.getItem(key);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(id => allCompletedIds.add(id));
                        }
                    } catch (e) {}
                }
            });
            
            // 2. Read canonical key
            const canonicalKey = `completed_levels_${roadmapData.id}`;
            const canonicalSaved = localStorage.getItem(canonicalKey);
            if (canonicalSaved) {
                try {
                    const parsed = JSON.parse(canonicalSaved);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(id => allCompletedIds.add(id));
                    }
                } catch (e) {}
            }
            
            // 3. Sort according to roadmapData
            const sortedCompleted = Array.from(allCompletedIds).sort((a, b) => {
                return allLevels.findIndex(l => l.id === a) - allLevels.findIndex(l => l.id === b);
            });
            
            setCompletedLevels(sortedCompleted);
            prevCompletedCount.current = sortedCompleted.length;
            
            // 4. Write to canonical key (legacy keys are intentionally not deleted yet)
            localStorage.setItem(canonicalKey, JSON.stringify(sortedCompleted));
            
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [roadmapData.id, allLevels]);

    useEffect(() => {
        if (!isMounted) return;
        
        const prevCount = prevCompletedCount.current;
        if (completedLevels.length > prevCount) {
            setShowCompletion(true);
            const timer = setTimeout(() => {
                setShowCompletion(false);
            }, 2500);
            prevCompletedCount.current = completedLevels.length;
            return () => clearTimeout(timer);
        }
        prevCompletedCount.current = completedLevels.length;

        // Optionally store total globally like old code
        localStorage.setItem("completedLevels", JSON.stringify(completedLevels.length));
    }, [completedLevels, isMounted]);

    const activeDay = roadmapData.days[activeDayIndex];
    
    const checkIsUnlocked = (level) => {
        if (!level) return false;
        if (completedLevels.includes(level.id)) return true;
        const globalIndex = allLevels.findIndex(l => l.id === level.id);
        if (globalIndex === 0) {
            return true;
        } else {
            const prevLevel = allLevels[globalIndex - 1];
            return completedLevels.includes(prevLevel.id);
        }
    };

    const handlePrevDay = () => setActiveDayIndex(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setActiveDayIndex(prev => Math.min(roadmapData.days.length - 1, prev + 1));

    const handleNodeClick = (level) => {
        setPopupLevel(level);
    };

    const handleStartLesson = (level) => {
        setPopupLevel(null);
        setSelectedLevel(level);
    };

    const handleVideoComplete = (levelId) => {
        if (!completedLevels.includes(levelId)) {
            const newCompleted = [...completedLevels, levelId];
            
            const sortedCompleted = newCompleted.sort((a, b) => {
                return allLevels.findIndex(l => l.id === a) - allLevels.findIndex(l => l.id === b);
            });
            
            setCompletedLevels(sortedCompleted);
            localStorage.setItem(`completed_levels_${roadmapData.id}`, JSON.stringify(sortedCompleted));
        }
    };

    if (selectedLevel) {
        return (
            <LevelContent
                level={selectedLevel}
                onBack={() => setSelectedLevel(null)}
                onComplete={handleVideoComplete}
                isCompleted={completedLevels.includes(selectedLevel.id)}
                roadmapType={roadmapData.id}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative">
            <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary)]/80 backdrop-blur-md mb-4 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto flex items-center">
                    <button 
                        onClick={() => router.push('/home')} 
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{roadmapData.title}</h1>
                        <p className="mt-2 text-lg text-gray-600">{roadmapData.description}</p>
                    </div>
                    <Profile/>
                </div>
                
                <div className="flex items-center gap-2 mb-8 relative">
                    <button 
                        onClick={handlePrevDay} 
                        disabled={activeDayIndex === 0}
                        className={`p-2 rounded-full border transition-all ${activeDayIndex === 0 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : 'hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md'}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex-1 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="flex items-center gap-3 px-1 py-1 w-full max-w-full">
                            {roadmapData.days.map((day, index) => {
                                const isActive = activeDayIndex === index;
                                return (
                                    <button
                                        key={day.id}
                                        onClick={() => setActiveDayIndex(index)}
                                        className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]' : 'bg-white/60 backdrop-blur-md text-gray-600 hover:bg-white hover:text-slate-900 border border-gray-200/50 hover:shadow-sm'}`}
                                    >
                                        {day.title}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={handleNextDay} 
                        disabled={activeDayIndex === roadmapData.days.length - 1}
                        className={`p-2 rounded-full border transition-all ${activeDayIndex === roadmapData.days.length - 1 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : 'hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md'}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {activeDay && (
                    <div className="relative transition-all duration-700 opacity-100 grayscale-0">
                        {(!isMounted || !isRoadmapReady) ? (
                            <RoadmapSkeleton color={activeDay.color} />
                        ) : (
                            <div className="w-full overflow-hidden">
                                {/* We map activeDay to difficulty prop just so background layers work if they still rely on it, but use color dynamically */}
                                <RoadmapWorldView 
                                    levels={activeDay.levels}
                                    allLevels={allLevels}
                                    completedLevels={completedLevels}
                                    color={activeDay.color}
                                    onNodeClick={handleNodeClick}
                                    difficulty={activeDay.id}
                                />
                            </div>
                        )}
                        
                        {isMounted && popupLevel && (
                            <LessonPopup 
                                level={popupLevel}
                                isCompleted={completedLevels.includes(popupLevel.id)}
                                isUnlocked={checkIsUnlocked(popupLevel)}
                                onStart={() => handleStartLesson(popupLevel)}
                                onClose={() => setPopupLevel(null)}
                                difficulty={activeDay.id}
                            />
                        )}
                        
                        {isMounted && showCompletion && (
                            <LevelCompletionToast difficulty={activeDay.id} color={activeDay.color} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
