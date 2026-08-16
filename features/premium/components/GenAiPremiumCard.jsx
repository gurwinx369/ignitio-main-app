"use client";

import { useState } from "react";
import {
    AlertCircle,
    Lock,
    Sparkles,
} from "lucide-react";

import {
    LOAD_STATE,
    CardInfoShimmer,
    SpinnerIcon,
    StatusBadge,
    SuccessIcon,
    useCardLoader,
} from "@/components/ui/courseCards/CardLoader";

const ACCESS_LABELS = {
    loading: "Checking Access",
    premium: "Premium Unlocked",
    foundation: "Upgrade Required",
    error: "Retry Access Check",
};

export default function GenAiPremiumCard({
    status = "loading",
    onNavigatePremium,
    onNavigatePaywall,
    onRetry,
}) {
    const [hovered, setHovered] = useState(false);

    const {
        state,
        handleClick,
        isLocked,
        isLoading,
        isSuccess,
        isPressing,
    } = useCardLoader(
        () => {
            if (status === "premium") {
                onNavigatePremium?.();
                return;
            }

            if (status === "foundation") {
                onNavigatePaywall?.();
            }
        },
        1400,
    );

    /*
     * Reuse the shared card-loading visuals while the entitlement
     * request is resolving.
     *
     * Once access has resolved, the loader state is controlled by
     * useCardLoader exactly like the Foundation roadmap cards.
     */
    const visualState =
        status === "loading"
            ? LOAD_STATE.LOADING
            : state;

    const isVisualLoading =
        visualState === LOAD_STATE.LOADING;

    const isVisualSuccess =
        visualState === LOAD_STATE.SUCCESS;

    const isVisualActive =
        isVisualLoading || isVisualSuccess;

    const isInteractionLocked =
        status === "loading" || isLocked;

    const handleCardActivation = () => {
        if (isInteractionLocked) {
            return;
        }

        if (status === "error") {
            onRetry?.();
            return;
        }

        if (
            status !== "premium" &&
            status !== "foundation"
        ) {
            return;
        }

        handleClick();
    };

    const scale = isPressing
        ? "scale(0.972)"
        : hovered && !isInteractionLocked
            ? "translateY(-4px)"
            : "translateY(0)";

    const shadow = isVisualActive
        ? "0 12px 40px rgba(0,0,0,0.10)"
        : hovered
            ? "0 20px 56px rgba(0,0,0,0.14)"
            : "0 6px 24px rgba(0,0,0,0.08)";

    const arrowBg = isVisualActive
        ? isVisualSuccess
            ? "rgba(46,204,138,0.18)"
            : "rgba(30,26,24,0.11)"
        : hovered
            ? "rgba(30,26,24,0.14)"
            : "rgba(30,26,24,0.07)";

    const arrowShift =
        hovered && !isInteractionLocked
            ? "translateX(3px)"
            : "translateX(0)";

    const statusLabel =
        ACCESS_LABELS[status] ??
        ACCESS_LABELS.loading;

    return (
        <div
            onClick={handleCardActivation}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full sm:w-120 overflow-hidden select-none"
            style={{
                borderRadius: 24,
                boxShadow: shadow,
                transform: scale,
                transition:
                    "transform 0.28s ease, box-shadow 0.28s ease",
                cursor:
                    status === "loading"
                        ? "wait"
                        : isLocked
                            ? "not-allowed"
                            : "pointer",
                pointerEvents:
                    isInteractionLocked
                        ? "none"
                        : "auto",
            }}
        >
            {/* Premium graphic area */}
            <div
                className="relative overflow-hidden flex items-center justify-center flex-col"
                style={{
                    height: 260,
                    background:
                        "linear-gradient(135deg, #2D1A3F 0%, #1A0F2E 100%)",
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Sparkles className="w-64 h-64 text-purple-400" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="p-4 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <Sparkles className="w-12 h-12 text-purple-300" />
                    </div>

                    <div className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm">
                        <span className="text-sm font-bold text-purple-200 tracking-widest uppercase">
                            Premium World
                        </span>
                    </div>
                </div>

                {/* Same active-state veil used by roadmap cards */}
                {isVisualActive && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: isVisualSuccess
                                ? "rgba(46,204,138,0.10)"
                                : "rgba(0,0,0,0.18)",
                            transition:
                                "background 0.28s ease",
                            pointerEvents: "none",
                        }}
                    />
                )}

                {/* Shared loading/opening status badge */}
                <StatusBadge
                    state={visualState}
                    status={statusLabel}
                />
            </div>

            {/* Information area */}
            <div
                className="px-5 pt-4.5 pb-5"
                style={{
                    background: "#fdfbfa",
                    position: "relative",
                }}
            >
                {/* Same shimmer/success overlay as roadmap cards */}
                <CardInfoShimmer
                    state={visualState}
                />

                {/* Premium category row */}
                <div className="flex items-center gap-1.5 mb-3.5">
                    {status === "error" ? (
                        <>
                            <AlertCircle
                                size={14}
                                color="#d97706"
                            />

                            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-600">
                                Access Check Failed
                            </span>
                        </>
                    ) : status === "foundation" ? (
                        <>
                            <Lock
                                size={14}
                                className="text-purple-600 opacity-80"
                            />

                            <span className="text-[11px] font-bold tracking-widest uppercase text-purple-600">
                                Premium Access
                            </span>
                        </>
                    ) : (
                        <>
                            <Sparkles
                                size={14}
                                className="text-purple-600"
                            />

                            <span className="text-[11px] font-bold tracking-widest uppercase text-purple-600">
                                Premium World
                            </span>
                        </>
                    )}
                </div>

                <h3 className="text-[18px] font-bold text-gray-900 mb-1">
                    GenAI Internship
                </h3>

                <p
                    className="text-[15.5px] font-medium leading-[1.55] mb-4"
                    style={{ color: "#1e1a18" }}
                >
                    Explore the upcoming structured
                    GenAI Internship learning
                    experience.
                </p>

                {/* No fake level squares until real roadmap data exists */}

                <div className="flex justify-end">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                            background: arrowBg,
                            transform: isVisualLoading
                                ? "none"
                                : arrowShift,
                            transition:
                                "all 0.22s ease",
                        }}
                    >
                        {isVisualLoading && (
                            <SpinnerIcon
                                size={14}
                                color="#1e1a18"
                            />
                        )}

                        {isVisualSuccess && (
                            <SuccessIcon
                                size={14}
                                color="#2ecc8a"
                            />
                        )}

                        {!isVisualLoading &&
                            !isVisualSuccess &&
                            (status ===
                            "foundation" ? (
                                <Lock
                                    size={14}
                                    color="#1e1a18"
                                />
                            ) : status === "error" ? (
                                <AlertCircle
                                    size={14}
                                    color="#d97706"
                                />
                            ) : (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#1e1a18"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line
                                        x1="5"
                                        y1="12"
                                        x2="19"
                                        y2="12"
                                    />

                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}