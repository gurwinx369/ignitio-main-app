"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GenAiTierCard from "@/features/premium/genai/components/GenAiTierCard";
import { GENAI_TIERS } from "@/features/premium/genai/config/genAiTiers";

/*
 * GenAiProjectsGrid
 *
 * Renders the same Beginner / Intermediate / Advanced tier card grid as the
 * Levels view, but each unlocked card's onClick navigates to the tier's
 * /builds route instead of the roadmap route.
 *
 * Locked tiers remain locked and non-interactive — identical to the Levels view.
 */

const PROJECTS_TIERS = [
    {
        tierKey: "beginner",
        tierName: "BEGINNER",
        subtitle: "Foundation",
        duration: "Weeks 1–4",
        topics: ["Prompt Engineering", "Python", "Files & Git", "LangChain"],
        buildsRoute: "/home/premium/genai/beginner/builds",
    },
    {
        tierKey: "intermediate",
        tierName: "INTERMEDIATE",
        subtitle: "RAG Engineering",
        duration: "Weeks 5–8",
        topics: ["RAG", "Evaluation", "FastAPI", "Structured Outputs"],
        buildsRoute: "/home/premium/genai/intermediate/builds",
    },
    {
        tierKey: "advanced",
        tierName: "ADVANCED",
        subtitle: "Agentic Systems",
        duration: "Weeks 9–12",
        topics: ["LangGraph", "Observability", "Portfolio", "Interview"],
        buildsRoute: "/home/premium/genai/advanced/builds",
    },
];

function buildTierCardProps(tier, router) {
    // Projects are currently all in development (disabled)
    const isProjectReleased = false;

    return {
        tierName: tier.tierName,
        subtitle: tier.subtitle,
        duration: tier.duration,
        topics: tier.topics,
        state: isProjectReleased ? "unlocked" : "locked",
        ctaText: "Coming soon",
        onClick: undefined,
    };
}

// ─── Desktop grid ─────────────────────────────────────────────────────────────
function ProjectsDesktopGrid({ router }) {
    return (
        <div className="hidden lg:grid grid-cols-3 gap-6">
            {PROJECTS_TIERS.map((tier) => (
                <GenAiTierCard
                    key={tier.tierKey}
                    {...buildTierCardProps(tier, router)}
                />
            ))}
        </div>
    );
}

// ─── Mobile scroll-snap rail ──────────────────────────────────────────────────
function ProjectsMobileRail({ router }) {
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
                    container.scrollTo({ left: cardLeft, behavior: "smooth" });
                    return;
                }
            }
        } else {
            for (let i = cards.length - 1; i >= 0; i--) {
                const card = cards[i];
                const cardLeft = card.offsetLeft - container.offsetLeft;
                if (cardLeft < scrollLeft - 10) {
                    container.scrollTo({
                        left: Math.max(0, cardLeft),
                        behavior: "smooth",
                    });
                    return;
                }
            }
        }
    };

    return (
        <div className="lg:hidden">
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 -mx-4 px-4"
                style={{
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <style
                    dangerouslySetInnerHTML={{
                        __html: ".snap-x::-webkit-scrollbar { display: none; }",
                    }}
                />
                {PROJECTS_TIERS.map((tier) => (
                    <div
                        key={tier.tierKey}
                        className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-8px)] max-w-[400px]"
                    >
                        <GenAiTierCard {...buildTierCardProps(tier, router)} />
                    </div>
                ))}
            </div>

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

export default function GenAiProjectsGrid() {
    const router = useRouter();

    return (
        <>
            <ProjectsDesktopGrid router={router} />
            <ProjectsMobileRail router={router} />
        </>
    );
}
