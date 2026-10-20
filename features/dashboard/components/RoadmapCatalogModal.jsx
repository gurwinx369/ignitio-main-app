"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";

/* =========================================================================
   OFFICIAL, ACCURATE PROGRAMMING BRAND & SKILL LOGOS
========================================================================= */

function PythonLogo({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#1E293B] border border-slate-700/60 shadow-sm`}
    >
      <svg className="h-6 w-6" viewBox="0 0 100 100" fill="none">
        <path
          d="M49.6 12C30.2 12 31.4 20.4 31.4 20.4L31.5 29.3H50.2V32H23.9C23.9 32 11.3 30.6 11.3 50.7C11.3 70.8 22.3 70.1 22.3 70.1H29V60.6C29 60.6 28.6 49.3 40.1 49.3H51.7C51.7 49.3 62.2 49.6 62.2 39.4V21.9C62.2 21.9 64 12 49.6 12ZM39.1 18.2C41.3 18.2 43.1 20 43.1 22.3C43.1 24.5 41.3 26.3 39.1 26.3C36.8 26.3 35.1 24.5 35.1 22.3C35.1 20 36.8 18.2 39.1 18.2Z"
          fill="#38BDF8"
        />
        <path
          d="M50.4 88C69.8 88 68.6 79.6 68.6 79.6L68.5 70.7H49.8V68H76.1C76.1 68 88.7 69.4 88.7 49.3C88.7 29.2 77.7 29.9 77.7 29.9H71V39.4C71 39.4 71.4 50.7 59.9 50.7H48.3C48.3 50.7 37.8 50.4 37.8 60.6V78.1C37.8 78.1 36 88 50.4 88ZM60.9 81.8C58.7 81.8 56.9 80 56.9 77.7C56.9 75.5 58.7 73.7 60.9 73.7C63.2 73.7 64.9 75.5 64.9 77.7C64.9 80 63.2 81.8 60.9 81.8Z"
          fill="#FACC15"
        />
      </svg>
    </div>
  );
}

function CppLogo({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#00599C] border border-[#00599C] shadow-sm`}
    >
      <svg className="h-7 w-7" viewBox="0 0 64 64" fill="none">
        {/* Bold White C */}
        <path
          d="M28 16C17 16 9 23.5 9 32C9 40.5 17 48 28 48C34 48 39.5 45.5 43 41.5L37.5 37C35.5 39.5 32 41 28 41C21.5 41 16.5 37 16.5 32C16.5 27 21.5 23 28 23C32 23 35.5 24.5 37.5 27L43 22.5C39.5 18.5 34 16 28 16Z"
          fill="#FFFFFF"
        />
        {/* Plus 1 */}
        <path
          d="M45.5 25V39M38.5 32H52.5"
          stroke="#38BDF8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Plus 2 */}
        <path
          d="M57 27V37M52 32H62"
          stroke="#38BDF8"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CLogo({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#1A4B8C] border border-[#1A4B8C] shadow-sm`}
    >
      <svg className="h-7 w-7" viewBox="0 0 64 64" fill="none">
        <path
          d="M37 15C24.5 15 15 22.5 15 32C15 41.5 24.5 49 37 49C44.5 49 50.5 46 54.5 41L47.5 35.5C45 38.5 41.5 40.5 37 40.5C29 40.5 23.5 36.5 23.5 32C23.5 27.5 29 23.5 37 23.5C41.5 23.5 45 25.5 47.5 28.5L54.5 23C50.5 18 44.5 15 37 15Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

function GitLogo({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#FFF5F2] border border-[#F05032]/25 shadow-sm p-1.5`}
    >
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#F05032">
        <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.529-.527-.667-1.29-.413-1.933L12.784 8.94l-.004 5.567c.184.103.355.234.502.381.72.72.72 1.884 0 2.604-.72.719-1.885.719-2.604 0-.721-.72-.721-1.884 0-2.604.183-.183.398-.314.633-.396v-5.69c-.235-.082-.45-.213-.633-.396-.539-.539-.672-1.32-.399-1.97L7.525 3.81.452 10.884c-.604.604-.604 1.581 0 2.188l10.48 10.478c.604.604 1.582.604 2.186 0l10.428-10.43c.604-.603.604-1.58 0-2.19" />
      </svg>
    </div>
  );
}

function DsaVisual({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#1E293B] border border-slate-700/60 shadow-sm`}
    >
      <svg className="h-6 w-6" viewBox="0 0 64 64" fill="none">
        {/* Tree Links */}
        <line x1="32" y1="16" x2="18" y2="34" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="16" x2="46" y2="34" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="34" x2="12" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="34" x2="24" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        {/* Nodes */}
        <circle cx="32" cy="16" r="6" fill="#0EA5E9" />
        <circle cx="32" cy="16" r="2.5" fill="#FFFFFF" />
        <circle cx="18" cy="34" r="5" fill="#10B981" />
        <circle cx="18" cy="34" r="2" fill="#FFFFFF" />
        <circle cx="46" cy="34" r="5" fill="#6366F1" />
        <circle cx="46" cy="34" r="2" fill="#FFFFFF" />
        <circle cx="12" cy="50" r="3.5" fill="#38BDF8" />
        <circle cx="24" cy="50" r="3.5" fill="#38BDF8" />
      </svg>
    </div>
  );
}

function PromptEngineeringVisual({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#7C3AED] border border-purple-500/50 shadow-sm`}
    >
      <svg className="h-6 w-6" viewBox="0 0 64 64" fill="none">
        <rect x="18" y="18" width="28" height="28" rx="6" fill="#FFFFFF" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="2.2" />
        <path d="M32 10V18 M32 46V54 M10 32H18 M46 32H54" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M32 23L34.5 29.5L41 32L34.5 34.5L32 41L29.5 34.5L23 32L29.5 29.5L32 23Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

function SystemDesignVisual({ className = "h-11 w-11" }) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[14px] bg-[#0F172A] border border-slate-800 shadow-sm`}
    >
      <svg className="h-7 w-7" viewBox="0 0 64 64" fill="none">
        {/* Gateway / Load Balancer */}
        <rect x="22" y="10" width="20" height="9" rx="3" fill="#38BDF8" />
        <circle cx="32" cy="14.5" r="1.8" fill="#0F172A" />

        {/* Bus Links */}
        <path
          d="M32 19V26M18 26H46M18 26V32M46 26V32"
          stroke="#94A3B8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Microservices */}
        <rect x="10" y="32" width="16" height="10" rx="3" fill="#818CF8" />
        <rect x="38" y="32" width="16" height="10" rx="3" fill="#818CF8" />

        {/* Links to Database */}
        <path
          d="M18 42V48M46 42V48M18 48H46M32 48V52"
          stroke="#94A3B8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Database Cylinder */}
        <ellipse cx="32" cy="54" rx="11" ry="3.8" fill="#34D399" />
      </svg>
    </div>
  );
}

/* =========================================================================
   CATALOG ROADMAP DATA
========================================================================= */

export const CATALOG_ROADMAPS = [
  {
    id: "dsa",
    slug: "dsa",
    aliases: ["dsa", "dsa-student", "dsa-developer", "dsa-other"],
    title: "Data Structures & Algorithms",
    shortTitle: "DSA Masterclass",
    description: "Core arrays, recursion, binary trees, dynamic programming, and interview patterns.",
    duration: "23 Days",
    levels: "69 Levels",
    visual: DsaVisual,
    tags: ["Arrays", "Trees", "Graphs", "DP"],
  },
  {
    id: "python-beginner",
    slug: "python-beginner",
    aliases: ["python-beginner", "python"],
    title: "Python for Beginners",
    shortTitle: "Python Foundation",
    description: "Syntax, loops, dictionaries, OOP classes, file operations, and practical automation.",
    duration: "14 Days",
    levels: "42 Levels",
    visual: PythonLogo,
    tags: ["Syntax", "Functions", "OOP", "Scripts"],
  },
  {
    id: "git-github",
    slug: "git-github",
    aliases: ["git-github", "git"],
    title: "Git & GitHub Mastery",
    shortTitle: "Git & Collaboration",
    description: "Commits, branches, staging, merge conflicts, pull requests, and open-source workflow.",
    duration: "7 Days",
    levels: "21 Levels",
    visual: GitLogo,
    tags: ["Commits", "Branches", "PRs", "Workflow"],
  },
  {
    id: "prompt-engineering",
    slug: "prompt-engineering",
    aliases: ["prompt-engineering", "prompt"],
    title: "Prompt Engineering",
    shortTitle: "AI & LLM Workflows",
    description: "Harness LLMs, craft few-shot prompts, chain-of-thought prompting, and agent loops.",
    duration: "7 Days",
    levels: "21 Levels",
    visual: PromptEngineeringVisual,
    tags: ["LLMs", "Few-Shot", "CoT", "AI Agents"],
  },
  {
    id: "c-language-course",
    slug: "c-language-course",
    aliases: ["c-language-course", "c-language", "clang"],
    title: "C Language Foundation",
    shortTitle: "C Programming",
    description: "Low-level memory management, pointers, structs, arrays, and computer architecture roots.",
    duration: "14 Days",
    levels: "42 Levels",
    visual: CLogo,
    tags: ["Pointers", "Memory", "Structs", "Systems"],
  },
  {
    id: "cpp",
    slug: "cpp",
    aliases: ["cpp", "cpp-course"],
    title: "C++ & STL Programming",
    shortTitle: "C++ & High Performance",
    description: "Object-oriented design, STL vectors/maps, iterators, templates, and execution speed.",
    duration: "14 Days",
    levels: "42 Levels",
    visual: CppLogo,
    tags: ["OOP", "STL", "Templates", "Speed"],
  },
  {
    id: "system-design-fundamentals",
    slug: "system-design-fundamentals",
    aliases: ["system-design-fundamentals", "system-design", "system_design"],
    title: "System Design Fundamentals",
    shortTitle: "System Architecture",
    description: "High-scale systems, load balancing, caching tiers, sharding, and fault tolerance.",
    duration: "7 Days",
    levels: "21 Levels",
    visual: SystemDesignVisual,
    tags: ["Scalability", "Caching", "Databases", "APIs"],
  },
];

/* =========================================================================
   ROADMAP CATALOG MODAL (Pure Performance 60 FPS)
========================================================================= */

export default function RoadmapCatalogModal({
  isOpen,
  onClose,
  enrolledRoadmapIds = [],
  onEnrollRoadmap,
}) {
  const [enrollingSlug, setEnrollingSlug] = useState(null);

  /* -----------------------------------------------------------------------
     FPS LOCK: Halt background canvas loops & lock body scroll while modal is open
  ----------------------------------------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      window.dispatchEvent(
        new CustomEvent("ignitio:roadmap-world-scroll", {
          detail: { scrolling: true },
        })
      );

      return () => {
        document.body.style.overflow = originalOverflow;
        window.dispatchEvent(
          new CustomEvent("ignitio:roadmap-world-scroll", {
            detail: { scrolling: false },
          })
        );
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isEnrolled = (item) => {
    return enrolledRoadmapIds.some(
      (id) => item.aliases.includes(id) || item.id === id || item.slug === id
    );
  };

  const handleEnrollClick = async (roadmap) => {
    if (enrollingSlug) return;
    try {
      setEnrollingSlug(roadmap.slug);
      await onEnrollRoadmap?.(roadmap.slug, roadmap.title);
    } finally {
      setEnrollingSlug(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-3
        sm:p-6
        bg-slate-950/75
      "
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          relative
          flex
          max-h-[92vh]
          w-full
          max-w-4xl
          flex-col
          rounded-[26px]
          border
          border-[#DFC8B5]
          bg-[#FFFDF9]
          shadow-2xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#DFC8B5]/60
            bg-[#FFFDF9]
            px-6
            py-4.5
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00A9FF]/12 text-[#00A9FF]">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2
                id="catalog-modal-title"
                className="text-lg font-black tracking-tight text-[#19183B] sm:text-xl"
              >
                Ignitio Roadmap Worlds
              </h2>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-[#19183B]/60">
              Select any skill to unlock interactive levels and add it to your Worlds.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close catalog modal"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-[#DFC8B5]
              bg-white
              text-[#19183B]/70
              shadow-[0_2px_0_#D9C4B0]
              transition-all
              hover:text-[#19183B]
              hover:bg-[#F4E9DD]
              active:translate-y-[1px]
            "
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-4
            sm:p-6
            overscroll-contain
            [scrollbar-width:thin]
          "
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATALOG_ROADMAPS.map((item) => {
              const enrolled = isEnrolled(item);
              const isCurrentEnrolling = enrollingSlug === item.slug;
              const VisualComponent = item.visual;

              return (
                <div
                  key={item.id}
                  className={`
                    relative
                    flex
                    flex-col
                    justify-between
                    rounded-[22px]
                    border
                    bg-white
                    p-4.5
                    transition-all
                    duration-150
                    ${
                      enrolled
                        ? "border-[#10B981]/40 shadow-sm bg-gradient-to-b from-[#F0FDF4]/30 to-white"
                        : "border-[#00A9FF]/20 hover:border-[#00A9FF]/55 hover:shadow-md"
                    }
                  `}
                >
                  {/* Top: Brand Logo + Details */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0">
                          <VisualComponent className="h-11 w-11" />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-black text-[#19183B] leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#19183B]/50">
                            {item.shortTitle}
                          </span>
                        </div>
                      </div>

                      {enrolled && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-full
                            bg-[#10B981]/15
                            border
                            border-[#10B981]/30
                            px-2.5
                            py-0.5
                            text-[10px]
                            font-extrabold
                            text-[#059669]
                          "
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Enrolled
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-[#19183B]/70 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata & Skill Pills */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-[#19183B]/6 px-2 py-0.5 text-[10px] font-extrabold text-[#19183B]/75">
                        {item.duration}
                      </span>
                      <span className="rounded-md bg-[#19183B]/6 px-2 py-0.5 text-[10px] font-extrabold text-[#19183B]/75">
                        {item.levels}
                      </span>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#DFC8B5]/50 bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-semibold text-[#19183B]/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    {enrolled ? (
                      <div
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          border
                          border-[#10B981]/30
                          bg-[#10B981]/10
                          py-2
                          text-xs
                          font-extrabold
                          text-[#059669]
                        "
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active in Worlds</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isCurrentEnrolling}
                        onClick={() => handleEnrollClick(item)}
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-[#00A9FF]
                          bg-[#00A9FF]
                          py-2.5
                          text-xs
                          font-extrabold
                          text-white
                          shadow-sm
                          transition-all
                          hover:bg-[#0096E6]
                          active:scale-[0.98]
                          disabled:opacity-60
                        "
                      >
                        {isCurrentEnrolling ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Unlocking World...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.8} />
                            <span>Unlock & Add World</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Note */}
        <div
          className="
            border-t
            border-[#DFC8B5]/50
            bg-[#FDF9F3]
            px-6
            py-3
            text-center
            text-[11px]
            font-semibold
            text-[#19183B]/55
          "
        >
          Unlocked worlds appear in your Worlds carousel and enable personalized AI practice.
        </div>
      </div>
    </div>
  );
}
