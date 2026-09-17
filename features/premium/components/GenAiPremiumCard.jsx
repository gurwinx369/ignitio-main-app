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

const PIPELINE_ITEMS = [
    {
        id: "prompt",
        label: "Prompt",
        x: 12,
    },
    {
        id: "rag",
        label: "RAG",
        x: 38,
    },
    {
        id: "api",
        label: "API",
        x: 64,
    },
    {
        id: "agent",
        label: "Agent",
        x: 88,
    },
];

function GenAiWorldVisual() {
    return (
        <div
            className="
        absolute
        inset-0
        overflow-hidden
        bg-[#FFFDF9]
      "
            aria-hidden="true"
        >
            <style>{`
        @keyframes genai-prompt-in {
          0%, 8% {
            opacity: 0;
            transform: translateX(-18px);
          }

          16%, 72% {
            opacity: 1;
            transform: translateX(0);
          }

          84%, 100% {
            opacity: 0;
            transform: translateX(8px);
          }
        }

        @keyframes genai-doc-1 {
          0%, 14% {
            opacity: 0;
            transform: translateY(10px) scale(.94);
          }

          22%, 68% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          78%, 100% {
            opacity: .25;
          }
        }

        @keyframes genai-doc-2 {
          0%, 19% {
            opacity: 0;
            transform: translateY(10px) scale(.94);
          }

          27%, 68% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          78%, 100% {
            opacity: .25;
          }
        }

        @keyframes genai-doc-3 {
          0%, 24% {
            opacity: 0;
            transform: translateY(10px) scale(.94);
          }

          32%, 68% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          78%, 100% {
            opacity: .25;
          }
        }

        @keyframes genai-vector-pulse {
          0%, 26% {
            transform: scale(.9);
            opacity: .4;
          }

          34%, 52% {
            transform: scale(1.08);
            opacity: 1;
            box-shadow:
              0 0 0 8px rgba(0,169,255,0.08),
              0 0 24px rgba(0,169,255,0.28);
          }

          65%, 100% {
            transform: scale(1);
            opacity: .7;
          }
        }

        @keyframes genai-signal-a {
          0%, 30% {
            left: 29%;
            opacity: 0;
          }

          34% {
            opacity: 1;
          }

          48% {
            left: 51%;
            opacity: 1;
          }

          52%, 100% {
            left: 51%;
            opacity: 0;
          }
        }

        @keyframes genai-signal-b {
          0%, 48% {
            left: 51%;
            opacity: 0;
          }

          52% {
            opacity: 1;
          }

          66% {
            left: 72%;
            opacity: 1;
          }

          70%, 100% {
            left: 72%;
            opacity: 0;
          }
        }

        @keyframes genai-agent-think {
          0%, 52% {
            transform: scale(.92);
          }

          60%, 68% {
            transform: scale(1.08);
            box-shadow:
              0 0 0 8px rgba(0,169,255,0.08),
              0 0 28px rgba(0,169,255,0.30);
          }

          76%, 100% {
            transform: scale(1);
          }
        }

        @keyframes genai-branch-top {
          0%, 60% {
            opacity: .18;
          }

          66%, 75% {
            opacity: 1;
          }

          82%, 100% {
            opacity: .28;
          }
        }

        @keyframes genai-branch-bottom {
          0%, 66% {
            opacity: .18;
          }

          72%, 81% {
            opacity: 1;
          }

          88%, 100% {
            opacity: .28;
          }
        }

        @keyframes genai-output-in {
          0%, 76% {
            opacity: 0;
            transform: translateX(14px) scale(.94);
          }

          84%, 94% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes genai-output-line {
          0%, 79% {
            width: 0%;
            opacity: 0;
          }

          86% {
            opacity: 1;
          }

          94% {
            width: 100%;
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes genai-breathe {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .genai-motion {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

            {/* dotted world canvas */}
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(25,24,59,0.11) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                }}
            />

            {/* ambient cyan focus */}
            <div
                className="
          absolute
          left-1/2
          top-1/2
          h-[190px]
          w-[190px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#00A9FF]/5
          blur-3xl
        "
            />

            {/* PREMIUM WORLD CHIP */}
            <div
                className="
          absolute
          left-4
          top-4
          z-20
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-[#00A9FF]/25
          bg-white/90
          px-3
          py-1.5
          shadow-sm
        "
            >
                <Sparkles
                    size={12}
                    className="text-[#00A9FF]"
                />

                <span
                    className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.18em]
            text-[#19183B]
          "
                >
                    GenAI World
                </span>
            </div>

            {/* USER PROMPT */}
            <div
                className="
          genai-motion
          absolute
          left-[5%]
          top-[38%]
          w-[76px]
          rounded-xl
          border
          border-[#19183B]/10
          bg-white
          p-2
          shadow-[0_7px_18px_rgba(25,24,59,0.08)]
        "
                style={{
                    animation:
                        "genai-prompt-in 7s ease-in-out infinite",
                }}
            >
                <div className="mb-1.5 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#00A9FF]" />

                    <span className="text-[7px] font-black text-[#19183B]">
                        PROMPT
                    </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-[#19183B]/12" />
                <div className="mt-1 h-1.5 w-[70%] rounded-full bg-[#19183B]/8" />
            </div>

            {/* DOCUMENT STACK */}
            <div
                className="
          absolute
          left-[27%]
          top-[31%]
          h-[86px]
          w-[54px]
        "
            >
                <div
                    className="
            genai-motion
            absolute
            left-0
            top-0
            h-12
            w-10
            rotate-[-7deg]
            rounded-lg
            border
            border-[#00A9FF]/20
            bg-white
            shadow-sm
          "
                    style={{
                        animation:
                            "genai-doc-1 7s ease-in-out infinite",
                    }}
                >
                    <div className="m-2 h-1 w-5 rounded-full bg-[#00A9FF]/40" />
                    <div className="mx-2 mt-1 h-1 w-6 rounded-full bg-[#19183B]/10" />
                    <div className="mx-2 mt-1 h-1 w-4 rounded-full bg-[#19183B]/10" />
                </div>

                <div
                    className="
            genai-motion
            absolute
            left-3
            top-4
            h-12
            w-10
            rotate-[5deg]
            rounded-lg
            border
            border-[#00A9FF]/20
            bg-white
            shadow-sm
          "
                    style={{
                        animation:
                            "genai-doc-2 7s ease-in-out infinite",
                    }}
                />

                <div
                    className="
            genai-motion
            absolute
            left-1
            top-8
            h-12
            w-10
            rounded-lg
            border
            border-[#00A9FF]/25
            bg-[#FFFDF9]
            shadow-sm
          "
                    style={{
                        animation:
                            "genai-doc-3 7s ease-in-out infinite",
                    }}
                >
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-[#19183B]/55">
                        DOCS
                    </span>
                </div>
            </div>

            {/* VECTOR MEMORY */}
            <div
                className="
          genai-motion
          absolute
          left-[45%]
          top-[40%]
          flex
          h-[58px]
          w-[58px]
          items-center
          justify-center
          rounded-2xl
          border
          border-[#00A9FF]/35
          bg-[#FFFDF9]
          shadow-[0_10px_22px_rgba(25,24,59,0.08)]
        "
                style={{
                    animation:
                        "genai-vector-pulse 7s ease-in-out infinite",
                }}
            >
                <div className="grid grid-cols-3 gap-[3px]">
                    {Array.from({ length: 9 }).map(
                        (_, index) => (
                            <span
                                key={index}
                                className={[
                                    "h-1.5 w-1.5 rounded-full",
                                    index === 4
                                        ? "bg-[#00A9FF]"
                                        : "bg-[#19183B]/20",
                                ].join(" ")}
                            />
                        )
                    )}
                </div>

                <span
                    className="
            absolute
            -bottom-4
            text-[7px]
            font-black
            uppercase
            tracking-wide
            text-[#19183B]/45
          "
                >
                    Memory
                </span>
            </div>

            {/* RAG SIGNAL 1 */}
            <div
                className="
          absolute
          left-[30%]
          top-[51%]
          h-[2px]
          w-[21%]
          bg-[#00A9FF]/25
        "
            />

            <div
                className="
          genai-motion
          absolute
          top-[calc(51%-3px)]
          h-2
          w-2
          rounded-full
          bg-[#00A9FF]
          shadow-[0_0_12px_rgba(0,169,255,0.85)]
        "
                style={{
                    animation:
                        "genai-signal-a 7s ease-in-out infinite",
                }}
            />

            {/* AGENT */}
            <div
                className="
          genai-motion
          absolute
          left-[68%]
          top-[37%]
          flex
          h-[72px]
          w-[72px]
          flex-col
          items-center
          justify-center
          rounded-[24px]
          border
          border-[#00A9FF]/40
          bg-[#19183B]
          text-white
          shadow-[0_10px_25px_rgba(25,24,59,0.20)]
        "
                style={{
                    animation:
                        "genai-agent-think 7s ease-in-out infinite",
                }}
            >
                <Sparkles
                    size={19}
                    className="mb-1 text-[#00A9FF]"
                />

                <span className="text-[8px] font-black uppercase tracking-wide">
                    Agent
                </span>

                <span className="mt-0.5 text-[6px] font-semibold text-white/45">
                    decide next
                </span>
            </div>

            {/* RAG -> AGENT SIGNAL */}
            <div
                className="
          absolute
          left-[52%]
          top-[51%]
          h-[2px]
          w-[20%]
          bg-[#00A9FF]/25
        "
            />

            <div
                className="
          genai-motion
          absolute
          top-[calc(51%-3px)]
          h-2
          w-2
          rounded-full
          bg-[#00A9FF]
          shadow-[0_0_12px_rgba(0,169,255,0.85)]
        "
                style={{
                    animation:
                        "genai-signal-b 7s ease-in-out infinite",
                }}
            />

            {/* AGENT DECISION BRANCHES */}
            <div
                className="
          genai-motion
          absolute
          left-[79%]
          top-[38%]
          h-[1px]
          w-[10%]
          origin-left
          rotate-[-22deg]
          bg-[#00A9FF]
        "
                style={{
                    animation:
                        "genai-branch-top 7s ease-in-out infinite",
                }}
            />

            <div
                className="
          genai-motion
          absolute
          left-[79%]
          top-[58%]
          h-[1px]
          w-[10%]
          origin-left
          rotate-[22deg]
          bg-[#00A9FF]
        "
                style={{
                    animation:
                        "genai-branch-bottom 7s ease-in-out infinite",
                }}
            />

            <div
                className="
          absolute
          right-[5%]
          top-[25%]
          rounded-full
          border
          border-[#19183B]/10
          bg-white
          px-2
          py-1
          text-[7px]
          font-black
          text-[#19183B]/55
        "
            >
                TOOL
            </div>

            <div
                className="
          absolute
          right-[4%]
          top-[65%]
          rounded-full
          border
          border-[#19183B]/10
          bg-white
          px-2
          py-1
          text-[7px]
          font-black
          text-[#19183B]/55
        "
            >
                ANSWER
            </div>

            {/* OUTPUT CARD */}
            <div
                className="
          genai-motion
          absolute
          bottom-4
          right-4
          w-[102px]
          rounded-xl
          border
          border-[#00A9FF]/20
          bg-white
          p-2
          shadow-[0_8px_20px_rgba(25,24,59,0.10)]
        "
                style={{
                    animation:
                        "genai-output-in 7s ease-in-out infinite",
                }}
            >
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[7px] font-black text-[#19183B]">
                        RESPONSE
                    </span>

                    <span className="h-2 w-2 rounded-full bg-[#00A9FF]" />
                </div>

                <div
                    className="
            genai-motion
            h-1.5
            rounded-full
            bg-[#19183B]/14
          "
                    style={{
                        animation:
                            "genai-output-line 7s ease-in-out infinite",
                    }}
                />

                <div
                    className="
            genai-motion
            mt-1
            h-1.5
            max-w-[72%]
            rounded-full
            bg-[#19183B]/9
          "
                    style={{
                        animation:
                            "genai-output-line 7s .15s ease-in-out infinite",
                    }}
                />
            </div>
        </div>
    );
}
export default function GenAiPremiumCard({
    status = "loading",
    onNavigatePremium,
    onNavigatePaywall,
    onRetry,
}) {
    const [hovered, setHovered] =
        useState(false);

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
        1400
    );

    const visualState =
        status === "loading"
            ? LOAD_STATE.LOADING
            : state;

    const isVisualLoading =
        visualState === LOAD_STATE.LOADING;

    const isVisualSuccess =
        visualState === LOAD_STATE.SUCCESS;

    const isVisualActive =
        isVisualLoading ||
        isVisualSuccess;

    const isInteractionLocked =
        status === "loading" ||
        isLocked;

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

    const transform = isPressing
        ? "translateY(2px) scale(0.985)"
        : hovered &&
            !isInteractionLocked
            ? "translateY(-3px)"
            : "translateY(0)";

    const shadow = isVisualActive
        ? "0 10px 30px rgba(25,24,59,0.12)"
        : hovered
            ? "0 18px 42px rgba(25,24,59,0.16)"
            : "0 8px 24px rgba(25,24,59,0.10)";

    const statusLabel =
        ACCESS_LABELS[status] ??
        ACCESS_LABELS.loading;

    return (
        <div
            onClick={handleCardActivation}
            onMouseEnter={() =>
                setHovered(true)
            }
            onMouseLeave={() =>
                setHovered(false)
            }
            className="
        group
        relative
        w-full
        max-w-[340px]
        overflow-hidden
        select-none
        flex
        flex-col
      "
            style={{
                minHeight: 600,
                borderRadius: 24,
                boxShadow: shadow,
                transform,
                transition:
                    "transform 160ms ease, box-shadow 160ms ease",

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
                background: "#F2E0D0",
            }}
        >
            {/* HERO */}
            <div className="px-3 pt-3">
                <div
                    className="
              relative
              h-[310px]
              shrink-0
              overflow-hidden
              rounded-[18px]
            "
                >
                <GenAiWorldVisual />

                {isVisualActive && (
                    <div
                        aria-hidden="true"
                        className="
              absolute
              inset-0
              pointer-events-none
            "
                        style={{
                            background:
                                isVisualSuccess
                                    ? "rgba(0,169,255,0.05)"
                                    : "rgba(25,24,59,0.04)",
                        }}
                    />
                )}

                <StatusBadge
                    state={visualState}
                    status={statusLabel}
                />
                </div>
            </div>

            {/* INFO */}
            <div
                className="
          relative
          flex
          flex-grow
          flex-col
          px-6
          pt-5
          pb-6
        "
            >
                <CardInfoShimmer
                    state={visualState}
                />

                {/* CATEGORY */}
                <div className="flex items-center gap-1.5 mb-3">
                    {status === "error" ? (
                        <>
                            <AlertCircle
                                size={14}
                                className="text-[#B45309]"
                            />

                            <span
                                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#B45309]
                "
                            >
                                Access Check Failed
                            </span>
                        </>
                    ) : status ===
                        "foundation" ? (
                        <>
                            <Lock
                                size={14}
                                className="text-[#19183B]/55"
                            />

                            <span
                                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#19183B]/65
                "
                            >
                                Premium World
                            </span>
                        </>
                    ) : (
                        <>
                            <Sparkles
                                size={14}
                                className="text-[#00A9FF]"
                            />

                            <span
                                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#19183B]/65
                "
                            >
                                Premium World
                            </span>
                        </>
                    )}
                </div>

                <h3
                    className="
            text-[18px]
            font-extrabold
            leading-tight
            text-[#19183B]
            mb-1.5
          "
                >
                    GenAI Internship
                </h3>

                <p
                    className="
            text-[14px]
            font-medium
            leading-[1.5]
            text-[#19183B]
            mb-3
            line-clamp-2
          "
                >
                    Build production-ready AI systems
                    through prompting, RAG, APIs, and
                    agentic workflows.
                    <span className="text-[#00A9FF] font-bold ml-1">...more</span>
                </p>

                <p
                    className="
            text-[11px]
            font-semibold
            text-[#19183B]/55
          "
                >
                    Prompting → RAG → APIs → Agents
                </p>

                {/* FIGMA CTA */}
                <div className="flex justify-center mt-auto pt-4">
                    <div
                        className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#00A9FF]
              text-[#19183B]
              shadow-[0_4px_0_#0085C7]

              transition-[transform,box-shadow]
              duration-150
              ease-out

              group-hover:-translate-y-px

              group-active:translate-y-[2px]
              group-active:scale-[0.98]
              group-active:shadow-[0_1px_0_#0085C7]
            "
                    >
                        {isVisualLoading && (
                            <SpinnerIcon
                                size={16}
                                color="#19183B"
                            />
                        )}

                        {isVisualSuccess && (
                            <SuccessIcon
                                size={16}
                                color="#19183B"
                            />
                        )}

                        {!isVisualLoading &&
                            !isVisualSuccess &&
                            (status ===
                                "foundation" ? (
                                <Lock
                                    size={16}
                                    color="#19183B"
                                />
                            ) : status ===
                                "error" ? (
                                <AlertCircle
                                    size={16}
                                    color="#19183B"
                                />
                            ) : (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#19183B"
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