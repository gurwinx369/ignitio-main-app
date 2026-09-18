"use client";

import { useEffect, useRef, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Profile from "@/layout/Profile";
import Loader from "@/layout/Loader";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import { genAiRoadmapData } from "@/data/genAi/genAiRoadmapData";
import { filterDailyBuildWeeks } from "@/features/premium/genai/lib/genAiDailyBuildHelper";

import { GENAI_TIERS } from "@/features/premium/genai/config/genAiTiers";

// ─── Pre-filter once at module level ─────────────
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

function setAnswer(levelId, value) {
    try {
        localStorage.setItem(LS_PREFIX + levelId, value);
    } catch {
        // localStorage unavailable — degrade silently
    }
}



// ─── Single build level card ──────────────────────────────────────────────────
function BuildLevelCard({ level }) {
    const [value, setValue] = useState(() => getAnswer(level.id));

    const handleChange = useCallback(
        (e) => {
            const next = e.target.value;
            setValue(next);
            setAnswer(level.id, next);
        },
        [level.id],
    );

    return (
        <article
            className="rounded-2xl border border-[#f1e4d2] bg-[#fffaf3] shadow-sm overflow-hidden"
            aria-label={`Build challenge: ${level.name}`}
        >
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#f1e4d2]">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                    {level.name}
                </h3>
            </div>

            {/* Build statement */}
            <div className="px-6 py-4 border-b border-[#f1e4d2]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Challenge
                </p>
                <p className="text-[15px] text-slate-700 leading-relaxed">
                    {level.dailyBuild}
                </p>
            </div>

            {/* Expected output */}
            <div className="px-6 py-4 border-b border-[#f1e4d2] bg-slate-50/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Expected Output
                </p>
                <p className="text-[14px] text-slate-600 leading-relaxed font-mono">
                    {level.expectedOutput}
                </p>
            </div>

            {/* Answer textarea */}
            <div className="px-6 py-5">
                <label
                    htmlFor={`answer-${level.id}`}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
                >
                    Your Answer
                </label>
                <textarea
                    id={`answer-${level.id}`}
                    value={value}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write your code or notes here…"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-transparent transition-shadow"
                    spellCheck={false}
                />
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3" /> Saved locally as you type
                </p>
            </div>
        </article>
    );
}

// ─── Access-error fallback ─────────────────
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

export default function BuildSolvingPage({ params }) {
    const { levelId } = use(params);
    const router = useRouter();

    const { status, hasGenAiAccess, retry } = usePremiumAccess();
    
    // Find the level and the week it belongs to
    const levelIndex = ALL_BUILD_LEVELS.findIndex(l => l.id === levelId);
    const level = ALL_BUILD_LEVELS[levelIndex];
    
    const weekIndex = BUILD_WEEKS.findIndex(w => w.levels.some(l => l.id === levelId));
    


    // Redirect non-premium users
    useEffect(() => {
        if (status === "foundation") {
            router.replace("/home/premium/genai/paywall");
        }
    }, [status, router]);

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

    if (!level) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FFF8EF] p-4 flex-col gap-4">
                <p className="text-slate-500 text-sm">
                    Build challenge not found.
                </p>
                <button
                    onClick={() => router.push("/home/premium/genai/beginner/builds")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8EF] pb-24 font-sans relative">
            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[#FFF8EF]/80 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.push("/home/premium/genai/beginner/builds")}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Roadmap</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <Profile compact />
                </div>
            </div>

            <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">


                {/* ── Solving Card ── */}
                <div className="mt-6">
                    <BuildLevelCard level={level} />
                </div>
                
                {/* ── Next/Prev Controls ── */}
                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={() => {
                            if (levelIndex > 0) {
                                router.push(`/home/premium/genai/beginner/builds/${ALL_BUILD_LEVELS[levelIndex - 1].id}`);
                            }
                        }}
                        disabled={levelIndex === 0}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                            levelIndex === 0 ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" : "bg-white border border-gray-200 text-gray-700 hover:shadow-md hover:bg-gray-50 active:scale-95"
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous Build
                    </button>
                    
                    <button
                        onClick={() => {
                            if (levelIndex < ALL_BUILD_LEVELS.length - 1) {
                                router.push(`/home/premium/genai/beginner/builds/${ALL_BUILD_LEVELS[levelIndex + 1].id}`);
                            } else {
                                router.push("/home/premium/genai/beginner/builds");
                            }
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md active:scale-95`}
                    >
                        {levelIndex < ALL_BUILD_LEVELS.length - 1 ? "Next Build" : "Finish"}
                        {levelIndex < ALL_BUILD_LEVELS.length - 1 && <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </main>
        </div>
    );
}
