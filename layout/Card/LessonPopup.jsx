import React, { useRef, useState, useLayoutEffect } from "react";
import { PlayCircle, Clock, CheckCircle2, ArrowRight, BarChart } from "lucide-react";
import { roadmapThemes } from './theme';
import { usePostHog } from 'posthog-js/react';
import { getOrCreateOnboardingSessionId } from '@/lib/analytics/onboardingSession';

const LessonPopup = ({ level, isCompleted, isUnlocked = true, lockedReason, onStart, onClose, difficulty = "beginner", anchor }) => {
    const theme = roadmapThemes[difficulty] || roadmapThemes.beginner;
    const posthog = usePostHog();

    const [posStyle, setPosStyle] = useState({});
    const [isPositioned, setIsPositioned] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const panelRef = useRef(null);

    useLayoutEffect(() => {
        setIsPositioned(false);
        
        if (!anchor) return;
        if (window.innerWidth < 768) return; // Mobile handled by css classes

        const PANEL_WIDTH = 380;
        const PANEL_GAP = 24;
        const CONTAINER_PADDING = 16;

        const containerWidth = anchor.containerWidth;
        const containerHeight = anchor.containerHeight;

        const panelWidth = Math.min(PANEL_WIDTH, containerWidth - CONTAINER_PADDING * 2);
        const panelHeight = panelRef.current?.getBoundingClientRect().height || 320;

        const spaceRight = containerWidth - anchor.x - CONTAINER_PADDING;
        const spaceLeft = anchor.x - CONTAINER_PADDING;

        const clamp = (value, min, max) => {
            if (max < min) return min;
            return Math.min(Math.max(value, min), max);
        };

        let left;

        if (spaceRight >= panelWidth + PANEL_GAP) {
            left = anchor.x + PANEL_GAP;
        } else if (spaceLeft >= panelWidth + PANEL_GAP) {
            left = anchor.x - panelWidth - PANEL_GAP;
        } else {
            left = anchor.x - panelWidth / 2;
        }
        
        left = clamp(left, CONTAINER_PADDING, containerWidth - panelWidth - CONTAINER_PADDING);

        let top = anchor.y - panelHeight / 2;

        top = clamp(
            top,
            CONTAINER_PADDING,
            containerHeight - panelHeight - CONTAINER_PADDING
        );

        setPosStyle({
            left: `${left}px`,
            top: `${top}px`,
            width: `${panelWidth}px`,
            transform: "none",
        });
        setIsPositioned(true);

    }, [anchor, level, isCompleted, isUnlocked]);

    const disabledMessage = lockedReason || "Complete Previous Lesson First";

    return (
        <>
            {/* Desktop Backdrop - transparent click-away */}
            <div 
                className="hidden md:block absolute inset-0 z-40 bg-transparent" 
                onClick={onClose}
            ></div>

            {/* Mobile Backdrop - subtle dark blur */}
            <div 
                className="md:hidden fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]" 
                onClick={onClose}
            ></div>

            <div
                ref={panelRef}
                className="fixed left-0 right-0 bottom-0 z-50 flex max-h-[85dvh] min-h-0 flex-col overflow-hidden bg-white/95 backdrop-blur shadow-2xl animate-in fade-in duration-200 border-t-8 rounded-t-[2rem] md:absolute md:left-auto md:right-auto md:bottom-auto md:h-auto md:max-h-[calc(100vh-120px)] md:overflow-visible md:rounded-[2rem] md:border md:border-[#f1e4d2]"
                style={{ 
                    borderTopColor: theme.accent, 
                    ...posStyle,
                    visibility: (isPositioned || typeof window !== 'undefined' && window.innerWidth < 768) ? "visible" : "hidden" 
                }}
            >
                <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-4 md:p-6 md:pb-4">
                    {/* Mobile drag handle */}
                    <div className="md:hidden mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                                style={{ backgroundColor: theme.glow, color: theme.accent }}
                            >
                                <BarChart className="w-3 h-3" /> {difficulty}
                            </span>

                            {isCompleted ? (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            ) : (
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    Up Next
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                            &times;
                        </button>
                    </div>

                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{level.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 md:mb-6 leading-relaxed">
                        {level.description || "In this lesson, we will cover the core concepts and workflows required to master this topic."}
                    </p>

                    <div className="flex items-center gap-4 mb-0 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {level.durationInMinutes
                                ? `${level.durationInMinutes} min`
                                : "Duration unavailable"}
                        </div>
                    </div>
                </div>

                <div 
                    className="shrink-0 border-t border-gray-100 bg-white/95 p-5 pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:border-0 md:bg-transparent md:p-6 md:pt-0 md:shadow-none"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                    <button
                        onClick={() => {
                            if (!isUnlocked || isStarting) return;
                            setIsStarting(true);
                            const sessionId = getOrCreateOnboardingSessionId();
                            const hasCompletedFirstLesson =
                                typeof window !== 'undefined' &&
                                localStorage.getItem("has_completed_first_lesson") === "true";

                            // Preserve existing event for backward compatibility
                            posthog?.capture("lesson_start_clicked", {
                                level_id: level.id,
                                level_title: level.title,
                                roadmap_difficulty: difficulty
                            });

                            // Capture Step 9 (first_lesson_start) for the onboarding conversion funnel
                            if (!hasCompletedFirstLesson) {
                                posthog?.capture("first_lesson_start", {
                                    level_id: level.id,
                                    level_title: level.title,
                                    roadmap_difficulty: difficulty,
                                    onboarding_session_id: sessionId,
                                });

                                posthog?.capture("onboarding_step_viewed", {
                                    step_id: "first_lesson_start",
                                    step_index: 9,
                                    onboarding_session_id: sessionId,
                                });

                                posthog?.capture("onboarding_step_completed", {
                                    step_id: "first_lesson_start",
                                    step_index: 9,
                                    onboarding_session_id: sessionId,
                                });
                            }

                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    onStart(level);
                                    // Reset state after a short delay in case onStart doesn't unmount
                                    setTimeout(() => setIsStarting(false), 2000);
                                });
                            });
                        }}
                        disabled={!isUnlocked || isStarting}
                        className={`group w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all shadow-md font-bold text-lg 
                            ${!isUnlocked 
                                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                                : 'text-white active:scale-95 hover:shadow-lg hover:scale-[1.02]'} ${isStarting ? 'opacity-80' : ''}`}
                        style={{ backgroundColor: isUnlocked ? theme.accent : undefined }}
                    >
                        {!isUnlocked ? disabledMessage : (isStarting ? "Opening lesson..." : (isCompleted ? "Review Lesson" : "Start Lesson"))}
                        {isUnlocked && !isStarting && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                    </button>
                </div>
            </div>
        </>
    );
};

export default LessonPopup;
