"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import { useCalibrationStatus } from "@/features/premium/calibration/useCalibrationStatus";
import Loader from "@/layout/Loader";
import GenAiTierCard from "@/features/premium/genai/components/GenAiTierCard";
import Profile from "@/layout/Profile";
import { ArrowLeft, RotateCw, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { GENAI_TIERS } from "@/features/premium/genai/config/genAiTiers";

function VerificationError({
    message,
    onRetry,
    onHome,
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8EF] p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                    Unable to Verify Access
                </h2>

                <p className="mb-6 text-slate-600">
                    {message}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                        <RotateCw
                            size={18}
                            aria-hidden="true"
                        />
                        Retry Connection
                    </button>

                    <button
                        type="button"
                        onClick={onHome}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <Home
                            size={18}
                            aria-hidden="true"
                        />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GenAiTierHub() {
    const router = useRouter();

    const {
        status,
        hasGenAiAccess,
        retry,
    } = usePremiumAccess();

    const calibrationEnabled =
        status === "premium" &&
        hasGenAiAccess === true;

    const calibration =
        useCalibrationStatus({
            enabled: calibrationEnabled,
        });

    useEffect(() => {
        if (status === "foundation") {
            router.replace("/home/premium/genai/paywall");
        }
    }, [status, router]);

    useEffect(() => {
        if (
            status === "premium" &&
            hasGenAiAccess === true &&
            calibration.status === "required"
        ) {
            router.replace("/home/premium/genai/calibration");
        }
    }, [status, hasGenAiAccess, calibration.status, router]);

    if (status === "error") {
        return (
            <VerificationError
                message="We could not verify your Premium access at this time. Please try again."
                onRetry={retry}
                onHome={() => router.push("/home")}
            />
        );
    }

    if (
        status === "loading" ||
        status === "foundation"
    ) {
        return <Loader />;
    }

    if (status === "premium" && hasGenAiAccess === true) {
        if (calibration.status === "error") {
            return (
                <VerificationError
                    message="We could not verify your GenAI calibration status at this time. Please try again."
                    onRetry={calibration.retry}
                    onHome={() => router.push("/home")}
                />
            );
        }

        if (
            calibration.status === "idle" ||
            calibration.status === "loading" ||
            calibration.status === "required"
        ) {
            return <Loader />;
        }

        if (calibration.status === "ready") {
            return (
                <div className="min-h-screen bg-[var(--color-primary)] bg-[#FFF8EF] pb-24 font-sans relative">
                    <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[#FFF8EF]/80 backdrop-blur-md border-b border-gray-200/50">
                        <div className="max-w-[1150px] mx-auto flex items-center justify-between gap-4">
                            <button
                                onClick={() => router.push('/home')}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                            >
                                <ArrowLeft className="w-4 h-4" /> 
                                <span className="hidden sm:inline">Back to Dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </button>
                            <Profile compact />
                        </div>
                    </div>
                    
                    <main className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
                        <div className="mb-8 text-center md:text-left">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0891b2] mb-3">
                                GENAI LEARNING PATH
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                                Choose your next level
                            </h1>
                            <p className="text-[17px] text-slate-600 max-w-2xl mx-auto md:mx-0">
                                Build from AI foundations to production-ready agentic systems.
                            </p>
                        </div>
                        
                        {/* Desktop: three balanced columns */}
                        <div className="hidden lg:grid grid-cols-3 gap-6">
                            <GenAiTierCard
                                tierName="BEGINNER"
                                subtitle="Foundation"
                                duration="Weeks 1–4"
                                topics={["Prompt Engineering", "Python", "Files & Git", "LangChain"]}
                                project="Roastify"
                                state={GENAI_TIERS.beginner.released ? "unlocked" : "locked"}
                                ctaText={GENAI_TIERS.beginner.released ? "Start Beginner" : "Coming next"}
                                onClick={() => GENAI_TIERS.beginner.released && router.push(GENAI_TIERS.beginner.route)}
                            />
                            <GenAiTierCard
                                tierName="INTERMEDIATE"
                                subtitle="RAG Engineering"
                                duration="Weeks 5–8"
                                topics={["RAG", "Evaluation", "FastAPI", "Structured Outputs"]}
                                state={GENAI_TIERS.intermediate.released ? "unlocked" : "locked"}
                                ctaText={GENAI_TIERS.intermediate.released ? "Start Intermediate" : "Coming next"}
                                onClick={() => GENAI_TIERS.intermediate.released && router.push(GENAI_TIERS.intermediate.route)}
                            />
                            <GenAiTierCard
                                tierName="ADVANCED"
                                subtitle="Agentic Systems"
                                duration="Weeks 9–12"
                                topics={["LangGraph", "Observability", "Portfolio", "Interview"]}
                                state={GENAI_TIERS.advanced.released ? "unlocked" : "locked"}
                                ctaText={GENAI_TIERS.advanced.released ? "Start Advanced" : "Coming next"}
                                onClick={() => GENAI_TIERS.advanced.released && router.push(GENAI_TIERS.advanced.route)}
                            />
                        </div>

                        {/* Mobile/Tablet: horizontal scroll-snap rail */}
                        <GenAiTierRail router={router} />
                    </main>
                </div>
            );
        }
    }

    return <Loader />;
}

// ─── Mobile scroll-snap rail ──────────────────────────────────────────────────
function GenAiTierRail({ router }) {
  const scrollRef = useRef(null);

  const scrollByCard = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = Array.from(container.children);
    const scrollLeft = container.scrollLeft;

    if (direction === 1) {
      for (const card of cards) {
        const cardLeft = card.offsetLeft - container.offsetLeft;
        if (cardLeft > scrollLeft + 10) {
          container.scrollTo({ left: cardLeft, behavior: 'smooth' });
          return;
        }
      }
    } else {
      for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const cardLeft = card.offsetLeft - container.offsetLeft;
        if (cardLeft < scrollLeft - 10) {
          container.scrollTo({ left: Math.max(0, cardLeft), behavior: 'smooth' });
          return;
        }
      }
    }
  };

  const tiers = [
    {
      tierName: "BEGINNER",
      subtitle: "Foundation",
      duration: "Weeks 1–4",
      topics: ["Prompt Engineering", "Python", "Files & Git", "LangChain"],
      project: "Roastify",
      state: GENAI_TIERS.beginner.released ? "unlocked" : "locked",
      ctaText: GENAI_TIERS.beginner.released ? "Start Beginner" : "Coming next",
      onClick: () => GENAI_TIERS.beginner.released && router.push(GENAI_TIERS.beginner.route),
    },
    {
      tierName: "INTERMEDIATE",
      subtitle: "RAG Engineering",
      duration: "Weeks 5–8",
      topics: ["RAG", "Evaluation", "FastAPI", "Structured Outputs"],
      state: GENAI_TIERS.intermediate.released ? "unlocked" : "locked",
      ctaText: GENAI_TIERS.intermediate.released ? "Start Intermediate" : "Coming next",
      onClick: () => GENAI_TIERS.intermediate.released && router.push(GENAI_TIERS.intermediate.route),
    },
    {
      tierName: "ADVANCED",
      subtitle: "Agentic Systems",
      duration: "Weeks 9–12",
      topics: ["LangGraph", "Observability", "Portfolio", "Interview"],
      state: GENAI_TIERS.advanced.released ? "unlocked" : "locked",
      ctaText: GENAI_TIERS.advanced.released ? "Start Advanced" : "Coming next",
      onClick: () => GENAI_TIERS.advanced.released && router.push(GENAI_TIERS.advanced.route),
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 -mx-4 px-4"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{ __html: '.snap-x::-webkit-scrollbar { display: none; }' }} />
        {tiers.map((tier, i) => (
          <div key={i} className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-8px)] max-w-[400px]">
            <GenAiTierCard {...tier} />
          </div>
        ))}
      </div>

      {/* Arrow controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => scrollByCard(-1)}
          className="w-12 h-12 flex items-center justify-center text-slate-600 bg-white rounded-full shadow-sm border border-slate-100 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none"
          aria-label="Previous tier"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollByCard(1)}
          className="w-12 h-12 flex items-center justify-center text-slate-600 bg-white rounded-full shadow-sm border border-slate-100 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none"
          aria-label="Next tier"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
