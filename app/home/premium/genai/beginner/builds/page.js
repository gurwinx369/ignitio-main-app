"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Profile from "@/layout/Profile";
import Loader from "@/layout/Loader";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import { genAiRoadmapData } from "@/data/genAi/genAiRoadmapData";
import { filterDailyBuildWeeks } from "@/features/premium/genai/lib/genAiDailyBuildHelper";
import RoadmapWorldView from "@/layout/Card/RoadmapWorldView";
import DailyBuildPopup from "@/features/premium/genai/components/DailyBuildPopup";

import { GENAI_TIERS } from "@/features/premium/genai/config/genAiTiers";

// ─── Pre-filter once at module level (static data, never changes) ─────────────
const BUILD_WEEKS = filterDailyBuildWeeks(
    genAiRoadmapData.days,
    GENAI_TIERS.beginner.minWeek,
    GENAI_TIERS.beginner.maxWeek
);
const ALL_BUILD_LEVELS = BUILD_WEEKS.flatMap((w) => w.levels);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_PREFIX = "genai_build_answer_";

function getAnswer(levelId) {
    try {
        return localStorage.getItem(LS_PREFIX + levelId) ?? "";
    } catch {
        return "";
    }
}

// ─── Week tab jelly pill (same spring easing as GenAiViewToggle) ──────────────
function WeekTabs({ weeks, activeIndex, onChange }) {
    const scrollRef = useRef(null);
    const btnRefs = useRef([]);

    // Auto-scroll the active tab into view
    useEffect(() => {
        const btn = btnRefs.current[activeIndex];
        if (btn && scrollRef.current) {
            const container = scrollRef.current;
            const btnLeft = btn.offsetLeft - container.offsetLeft;
            const btnRight = btnLeft + btn.offsetWidth;
            const { scrollLeft, offsetWidth } = container;

            if (btnLeft < scrollLeft) {
                container.scrollTo({ left: btnLeft - 16, behavior: "smooth" });
            } else if (btnRight > scrollLeft + offsetWidth) {
                container.scrollTo({
                    left: btnRight - offsetWidth + 16,
                    behavior: "smooth",
                });
            }
        }
    }, [activeIndex]);

    return (
        <div className="flex items-center gap-2 mb-8 relative z-20">
            <button
                onClick={() => {
                    if (activeIndex > 0) {
                        onChange(activeIndex - 1, weeks[activeIndex - 1]);
                    }
                }}
                disabled={activeIndex <= 0}
                className={`p-2 rounded-full border transition-all shrink-0 ${
                    activeIndex <= 0
                        ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                        : "hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md"
                }`}
                aria-label="Previous week"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <div className="flex items-center gap-3 px-1 py-1">
                    {weeks.map((week, index) => {
                        const isActive = activeIndex === index;
                        return (
                            <button
                                key={week.id}
                                ref={(el) => { btnRefs.current[index] = el; }}
                                onClick={() => onChange(index, week)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md scale-[1.02]"
                                        : "bg-white/60 backdrop-blur-md text-gray-600 hover:bg-white hover:text-slate-900 border border-gray-200/50 hover:shadow-sm"
                                }`}
                            >
                                {week.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => {
                    if (activeIndex < weeks.length - 1) {
                        onChange(activeIndex + 1, weeks[activeIndex + 1]);
                    }
                }}
                disabled={activeIndex >= weeks.length - 1}
                className={`p-2 rounded-full border transition-all shrink-0 ${
                    activeIndex >= weeks.length - 1
                        ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                        : "hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md"
                }`}
                aria-label="Next week"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}

// ─── Access-error fallback (mirrors GenAiTierRoadmap pattern) ─────────────────
function AccessError({ message, onRetry, onHome }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8EF] p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    Unable to Verify Access
                </h2>
                <p className="mb-6 text-slate-600">{message}</p>
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                        Retry Connection
                    </button>
                    <button
                        type="button"
                        onClick={onHome}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BeginnerBuildsPage() {
    const router = useRouter();
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);

    const [completedLevels, setCompletedLevels] = useState([]);
    const [popupLevel, setPopupLevel] = useState(null);
    const [popupAnchor, setPopupAnchor] = useState(null);

    const { status, hasGenAiAccess, retry } = usePremiumAccess();

    // Redirect non-premium users
    useEffect(() => {
        if (status === "foundation") {
            router.replace("/home/premium/genai/paywall");
        }
    }, [status, router]);

    // Calculate completed levels on mount
    useEffect(() => {
        const completed = ALL_BUILD_LEVELS.filter(l => getAnswer(l.id).trim().length > 0).map(l => l.id);
        setCompletedLevels(completed);
    }, []);

    const handleAnswerSaved = useCallback((levelId, answer) => {
        if (answer.trim().length > 0) {
            setCompletedLevels(prev => Array.from(new Set([...prev, levelId])));
        } else {
            setCompletedLevels(prev => prev.filter(id => id !== levelId));
        }
    }, []);

    const handleNodeClick = useCallback((level, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPopupAnchor({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            containerWidth: window.innerWidth,
            containerHeight: window.innerHeight,
        });
        setPopupLevel(level);
    }, []);

    if (status === "error") {
        return (
            <AccessError
                message="We could not verify your Premium access at this time. Please try again."
                onRetry={retry}
                onHome={() => router.push("/home")}
            />
        );
    }

    if (status === "loading" || status === "foundation") {
        return <Loader />;
    }

    if (status !== "premium" || hasGenAiAccess !== true) {
        return <Loader />;
    }

    if (BUILD_WEEKS.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FFF8EF] p-4">
                <p className="text-slate-500 text-sm">
                    No build challenges available yet. Check back soon!
                </p>
            </div>
        );
    }

    const activeWeek = BUILD_WEEKS[activeWeekIndex];

    const getUnlockState = (level) => {
        const isCompleted = completedLevels.includes(level.id);
        const globalIndex = ALL_BUILD_LEVELS.findIndex(l => l.id === level.id);
        let isUnlocked = false;

        if (isCompleted || globalIndex === 0) {
            isUnlocked = true;
        } else if (globalIndex > 0) {
            const prevLevel = ALL_BUILD_LEVELS[globalIndex - 1];
            isUnlocked = completedLevels.includes(prevLevel.id);
        }

        return { isUnlocked };
    };

    return (
        <div className="min-h-screen bg-[#FFF8EF] pb-24 font-sans relative">
            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[#FFF8EF]/80 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-[1150px] mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.push("/home/premium/genai")}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to GenAI</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <Profile compact />
                </div>
            </div>

            <main className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
                {/* ── Page heading ── */}
                <div className="mb-10 relative z-20">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0891b2] mb-3">
                        GENAI BUILDS
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                        Daily Build Challenges
                    </h1>
                    <p className="text-[17px] text-slate-600 max-w-2xl">
                        Build something every day. One level, one real output.
                    </p>
                </div>

                {/* ── Week tabs ── */}
                <WeekTabs
                    weeks={BUILD_WEEKS}
                    activeIndex={activeWeekIndex}
                    onChange={(i) => {
                        setPopupLevel(null);
                        setActiveWeekIndex(i);
                    }}
                />

                {/* ── Roadmap World View ── */}
                <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                    <RoadmapWorldView
                        levels={activeWeek.levels}
                        allLevels={ALL_BUILD_LEVELS}
                        completedLevels={completedLevels}
                        color={activeWeek.color || "#0891b2"}
                        onNodeClick={handleNodeClick}
                        difficulty={activeWeek.id}
                        roadmapId="gen-ai-builds"
                    />
                </div>
            </main>

            {/* ── Popup ── */}
            {popupLevel && (() => {
                const isPopupLevelInActiveDay = activeWeek.levels.some(level => level.id === popupLevel.id);
                if (!isPopupLevelInActiveDay) return null;

                const { isUnlocked } = getUnlockState(popupLevel);

                return (
                    <DailyBuildPopup
                        level={popupLevel}
                        isCompleted={completedLevels.includes(popupLevel.id)}
                        isUnlocked={isUnlocked}
                        onClose={() => setPopupLevel(null)}
                        difficulty={activeWeek.id}
                        anchor={popupAnchor}
                        onAnswerSaved={handleAnswerSaved}
                    />
                );
            })()}
        </div>
    );
}
