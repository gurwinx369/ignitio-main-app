import React, { useRef, useState, useLayoutEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { roadmapThemes } from "@/layout/Card/theme";
import { useRouter } from "next/navigation";

const DailyBuildPopup = ({
    level,
    isCompleted,
    isUnlocked = true,
    onClose,
    difficulty = "beginner",
    anchor,
}) => {
    const theme = roadmapThemes[difficulty] || roadmapThemes.beginner;
    const router = useRouter();

    const [posStyle, setPosStyle] = useState({});
    const [isPositioned, setIsPositioned] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const panelRef = useRef(null);

    useLayoutEffect(() => {
        setIsPositioned(false);

        if (!anchor) return;
        if (window.innerWidth < 768) return; // Mobile handled by css classes

        const PANEL_WIDTH = 380; // Standard popup width
        const PANEL_GAP = 24;
        const CONTAINER_PADDING = 16;

        const containerWidth = anchor.containerWidth;
        const containerHeight = anchor.containerHeight;

        const panelWidth = Math.min(
            PANEL_WIDTH,
            containerWidth - CONTAINER_PADDING * 2,
        );
        const panelHeight =
            panelRef.current?.getBoundingClientRect().height || 420;

        const spaceRight = containerWidth - anchor.x - CONTAINER_PADDING;
        const spaceLeft = anchor.x - CONTAINER_PADDING;

        const clamp = (val, min, max) => {
            if (max < min) return min;
            return Math.min(Math.max(val, min), max);
        };

        let left;

        if (spaceRight >= panelWidth + PANEL_GAP) {
            left = anchor.x + PANEL_GAP;
        } else if (spaceLeft >= panelWidth + PANEL_GAP) {
            left = anchor.x - panelWidth - PANEL_GAP;
        } else {
            left = anchor.x - panelWidth / 2;
        }

        left = clamp(
            left,
            CONTAINER_PADDING,
            containerWidth - panelWidth - CONTAINER_PADDING,
        );

        let top = anchor.y - panelHeight / 2;

        top = clamp(
            top,
            CONTAINER_PADDING,
            containerHeight - panelHeight - CONTAINER_PADDING,
        );

        setPosStyle({
            left: `${left}px`,
            top: `${top}px`,
            width: `${panelWidth}px`,
            transform: "none",
        });
        setIsPositioned(true);
    }, [anchor, level]);

    const disabledMessage = "Complete Previous Build First";

    const handleStart = () => {
        if (!isUnlocked || isStarting) return;
        setIsStarting(true);
        router.push(`/home/premium/genai/beginner/builds/${level.id}`);
    };

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
                className="fixed left-0 right-0 bottom-0 z-50 flex max-h-[90dvh] min-h-0 flex-col overflow-hidden bg-white/95 backdrop-blur shadow-2xl animate-in fade-in duration-200 border-t-8 rounded-t-[2rem] md:absolute md:left-auto md:right-auto md:bottom-auto md:h-auto md:max-h-[calc(100vh-120px)] md:overflow-visible md:rounded-[2rem] md:border md:border-[#f1e4d2]"
                style={{
                    borderTopColor: theme.accent,
                    ...posStyle,
                    visibility:
                        isPositioned ||
                        (typeof window !== "undefined" &&
                            window.innerWidth < 768)
                            ? "visible"
                            : "hidden",
                }}
            >
                <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-4 md:p-6 md:pb-4 flex flex-col gap-4">
                    {/* Mobile drag handle */}
                    <div className="md:hidden mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-200 shrink-0" />

                    <div className="flex justify-between items-start mb-2 shrink-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                                style={{
                                    backgroundColor: theme.glow,
                                    color: theme.accent,
                                }}
                            >
                                Build
                            </span>

                            {isCompleted ? (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            ) : (
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    Pending
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

                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 leading-tight shrink-0">
                        {level.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 md:mb-6 leading-relaxed shrink-0">
                        {level.description || "In this challenge, you'll put your skills to the test and build something real."}
                    </p>
                </div>

                <div 
                    className="shrink-0 border-t border-gray-100 bg-white/95 p-5 pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:border-0 md:bg-transparent md:p-6 md:pt-0 md:shadow-none"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                    <button
                        onClick={handleStart}
                        disabled={!isUnlocked || isStarting}
                        className={`group w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all shadow-md font-bold text-lg 
                            ${!isUnlocked 
                                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' 
                                : 'text-white active:scale-95 hover:shadow-lg hover:scale-[1.02]'} ${isStarting ? 'opacity-80' : ''}`}
                        style={{ backgroundColor: isUnlocked ? theme.accent : undefined }}
                    >
                        {!isUnlocked ? disabledMessage : (isStarting ? "Opening build..." : (isCompleted ? "Review Build" : "Start Build"))}
                        {isUnlocked && !isStarting && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                    </button>
                </div>
            </div>
        </>
    );
};

export default DailyBuildPopup;
