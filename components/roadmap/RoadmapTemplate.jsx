"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Layers } from 'lucide-react';
import RoadmapWorldView from '@/layout/Card/RoadmapWorldView';
import LessonPopup from '@/layout/Card/LessonPopup';
import LevelCompletionToast from '@/layout/Card/LevelCompletionToast';
import LevelContent from '@/layout/LevelContent/LevelContent';
import Profile from "@/layout/Profile";
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import KyleAssignmentModal from '@/layout/LevelContent/KyleAssignmentModal';
import {
  isKyleEnabledRoadmap,
  isAssignmentGatedRoadmap as isAssignmentGatedRoadmapType,
} from "@/features/roadmaps/lib/roadmapCapabilities";

export default function RoadmapTemplate({ roadmapData }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(0);

    // Flat array of completed level IDs
    const [completedLevels, setCompletedLevels] = useState([]);

    const [popupLevel, setPopupLevel] = useState(null);
    const [popupAnchor, setPopupAnchor] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const [isRoadmapReady, setIsRoadmapReady] = useState(false);

    // Assignment gate state
    const [assignmentGateVersion, setAssignmentGateVersion] = useState(0);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    const prevCompletedCount = useRef(0);
    const roadmapViewportRef = useRef(null);
    const dayTabsContainerRef = useRef(null);
    const dayButtonRefs = useRef([]);

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
                    } catch (e) { }
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
                } catch (e) { }
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

    const isKyleRoadmap = isKyleEnabledRoadmap(roadmapData.id);
    const hasAssignmentGate = isAssignmentGatedRoadmapType(roadmapData.id);

    // Force recalculation when assignment is passed
    const _forceUpdate = assignmentGateVersion;

    const arePreviousAssignmentsPassed = (dayIndex) => {
        if (!hasAssignmentGate) return true;
        if (dayIndex <= 0) return true;

        return roadmapData.days
            .slice(0, dayIndex)
            .every(day =>
                localStorage.getItem(`assignment_passed_${roadmapData.id}_${day.id}`) === "true"
            );
    };

    const getUnlockState = (level) => {
        if (!level) return { isUnlocked: false, lockedReason: "Not available" };

        let globalUnlocked = false;
        if (completedLevels.includes(level.id)) {
            globalUnlocked = true;
        } else {
            const globalIndex = allLevels.findIndex(l => l.id === level.id);
            if (globalIndex <= 0) {
                globalUnlocked = true;
            } else {
                const prevLevel = allLevels[globalIndex - 1];
                globalUnlocked = completedLevels.includes(prevLevel.id);
            }
        }

        if (!globalUnlocked) {
            return { isUnlocked: false, lockedReason: "Complete Previous Lesson First" };
        }

        if (hasAssignmentGate) {
            const dayIndex = roadmapData.days.findIndex(d => d.levels.some(l => l.id === level.id));
            if (dayIndex > 0) {
                const prevPassed = arePreviousAssignmentsPassed(dayIndex);
                if (!prevPassed) {
                    const prevDay = roadmapData.days[dayIndex - 1];
                    const prevDayNumber = Number(String(prevDay?.id || "").match(/\d+/)?.[0]) || dayIndex;
                    return { isUnlocked: false, lockedReason: `Complete Day ${prevDayNumber} assignment first` };
                }
            }
        }

        return { isUnlocked: true, lockedReason: null };
    };

    const closeLessonPopup = () => {
        setPopupLevel(null);
        setPopupAnchor(null);
    };

    const handlePrevDay = () => {
        closeLessonPopup();
        setActiveDayIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextDay = () => {
        closeLessonPopup();
        setActiveDayIndex(prev => Math.min(roadmapData.days.length - 1, prev + 1));
    };

    useEffect(() => {
        setPopupLevel(null);
        setPopupAnchor(null);
    }, [activeDayIndex, roadmapData.id]);

    useEffect(() => {
        const activeButton = dayButtonRefs.current[activeDayIndex];
        if (!activeButton) return;

        activeButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [activeDayIndex]);

    const handleNodeClick = (level, event) => {
        if (event && event.currentTarget && roadmapViewportRef.current) {
            const nodeRect = event.currentTarget.getBoundingClientRect();
            const containerRect = roadmapViewportRef.current.getBoundingClientRect();

            setPopupAnchor({
                x: nodeRect.left - containerRect.left + nodeRect.width / 2,
                y: nodeRect.top - containerRect.top + nodeRect.height / 2,
                containerWidth: containerRect.width,
                containerHeight: containerRect.height,
            });
        } else {
            setPopupAnchor(null);
        }
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

            // Do not auto-open assignment from inside LevelContent.
            // Assignment is intentionally opened only from the roadmap CTA after user returns.
        }
    };

    const dayNumber = Number(String(activeDay?.id || "").match(/\d+/)?.[0]) || activeDayIndex + 1;

    const isCurrentDayComplete = useMemo(() => {
        if (!activeDay) return false;
        return activeDay.levels.every(l => completedLevels.includes(l.id));
    }, [activeDay, completedLevels]);

    const isCurrentDayAssignmentPassed = typeof window !== 'undefined'
        ? localStorage.getItem(`assignment_passed_${roadmapData.id}_${activeDay?.id}`) === "true"
        : false;

    const renderContent = () => {
        if (selectedLevel) {
            return (
                <LevelContent
                    level={selectedLevel}
                    onBack={() => setSelectedLevel(null)}
                    onComplete={handleVideoComplete}
                    isCompleted={completedLevels.includes(selectedLevel.id)}
                    roadmapType={roadmapData.id}
                    dayNumber={dayNumber}
                    showAssignmentModal={showAssignmentModal}
                />
            );
        }

        return (
            <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative">
                <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary)]/80 backdrop-blur-md border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <button
                            onClick={() => router.push('/home')}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Home</span><span className="sm:hidden">Back</span>
                        </button>
                        <Profile compact />
                    </div>
                </div>

                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <section className="rounded-[2rem] border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm md:p-8 relative overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
                        </div>

                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
                            <div className="max-w-3xl min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
                                    Roadmap
                                </p>
                                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl text-balance">
                                    {roadmapData.title}
                                </h1>
                                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                    {roadmapData.description}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm border border-slate-100">
                                        <Calendar className="w-4 h-4 text-cyan-600" />
                                        {roadmapData.days.length} days
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm border border-slate-100">
                                        <Layers className="w-4 h-4 text-cyan-600" />
                                        {allLevels.length} levels
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="flex items-center gap-2 mb-8 relative">
                        <button
                            onClick={handlePrevDay}
                            disabled={activeDayIndex === 0}
                            className={`p-2 rounded-full border transition-all ${activeDayIndex === 0 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : 'hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={dayTabsContainerRef} className="flex-1 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="flex items-center gap-3 px-1 py-1 w-full max-w-full">
                                {roadmapData.days.map((day, index) => {
                                    const isActive = activeDayIndex === index;
                                    return (
                                        <button
                                            key={day.id}
                                            ref={(el) => {
                                                dayButtonRefs.current[index] = el;
                                            }}
                                            onClick={() => {
                                                closeLessonPopup();
                                                setActiveDayIndex(index);
                                            }}
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

                    {hasAssignmentGate && isCurrentDayComplete && !isCurrentDayAssignmentPassed && (
                        <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
                            <div>
                                <h3 className="font-bold text-orange-900 text-lg">Day {dayNumber} Assignment Pending</h3>
                                <p className="text-orange-700 text-sm">Pass the assignment to unlock the next day's lessons.</p>
                            </div>
                            <button
                                onClick={() => setShowAssignmentModal(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                            >
                                Complete Assignment
                            </button>
                        </div>
                    )}

                    {activeDay && (
                        <div ref={roadmapViewportRef} className="relative transition-all duration-700 opacity-100">
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

                            {isMounted && popupLevel && (() => {
                                const isPopupLevelInActiveDay = activeDay?.levels?.some(level => level.id === popupLevel.id);
                                if (!isPopupLevelInActiveDay) return null;

                                const unlockState = getUnlockState(popupLevel);
                                return (
                                    <LessonPopup
                                        level={popupLevel}
                                        isCompleted={completedLevels.includes(popupLevel.id)}
                                        isUnlocked={unlockState.isUnlocked}
                                        lockedReason={unlockState.lockedReason}
                                        onStart={() => handleStartLesson(popupLevel)}
                                        onClose={() => setPopupLevel(null)}
                                        difficulty={activeDay.id}
                                        anchor={popupAnchor}
                                    />
                                );
                            })()}

                            {isMounted && showCompletion && (
                                <LevelCompletionToast difficulty={activeDay.id} color={activeDay.color} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}
            <KyleAssignmentModal
                open={showAssignmentModal && !selectedLevel}
                roadmapId={roadmapData.id}
                roadmapType={roadmapData.id}
                dayId={activeDay?.id}
                dayNumber={dayNumber}
                levels={activeDay?.levels || []}
                isFinalDay={activeDayIndex === roadmapData.days.length - 1}
                onPassed={() => {
                    setAssignmentGateVersion(v => v + 1);
                    setShowAssignmentModal(false);
                }}
                onClose={() => setShowAssignmentModal(false)}
            />
        </>
    );
}
