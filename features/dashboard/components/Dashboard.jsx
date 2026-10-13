"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
// DSA disabled — not available yet. Re-enable when DSA paid course is ready.
// import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
import SystemDesignCourseCard from "@/components/ui/courseCards/system-design-course-card";
import PythonCourseCard from "@/components/ui/courseCards/python-course-card";
import CCourseCard from "@/components/ui/courseCards/c-course-card";
import useSWR from "swr";
import { useAuth } from "@/features/context/AuthContext";
import { patchRoadmapProgress } from "@/features/roadmaps/lib/progressApi";
import {
  getPromptEngineeringRoadmapByRole,
  promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData,
} from "@/data/promptEngineering";
import { gitGithubRoadmapData } from "@/data/gitGithubCourseData";
import { cppRoadmapData } from "@/data/cppCourseData";
// import { getDsaRoadmapByRole, isDsaAllowedRole } from "@/data/dsa";
import { systemDesignRoadmapData } from "@/data/systemDesignData";
import { pythonBeginnerRoadmapData } from "@/data/pythonBeginnerRoadmapData";
import { clangBeginnerRoadmapData } from "@/data/clangBeginnerRoadmap";
import { Globe2 } from "lucide-react";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import GenAiPremiumCard from "@/features/premium/components/GenAiPremiumCard";

// Layout Components
import HomeHeader from "./HomeHeader";
import FeedbackModal from "./FeedbackModal";
import StreakStatusCard from "./StreakStatusCard";
import RoadmapWorldsCarousel from "./RoadmapWorldsCarousel";

import DashboardBottomNav from "./DashboardBottomNav";

// Sequential unlock order — git-github is always first.
// Each roadmap unlocks only when the previous one is 100% done.
const UNLOCK_ORDER = [
  "git-github",
  "cpp",
  "python-beginner",
  "c-language-course",
  "system-design-fundamentals",
  // prompt-engineering and DSA are always unlocked (role-specific, supplemental)
];

export default function Dashboard() {
  const router = useRouter();
  const redirects = {
    GitGithub: "/home/roadmaps/git-github",
    CPP: "/home/roadmaps/cpp",
    PromptEngineering: "/home/roadmaps/prompt-engineering",
    SystemDesign: "/home/roadmaps/system-design-fundamentals",
    Python: "/home/roadmaps/python-beginner",
    CLang: "/home/roadmaps/c-beginner",
  };
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const requestedTab =
    searchParams.get("tab");
  const posthog = usePostHog();
  const { user, userProfile, isProfileLoading } = useAuth();
  const {
    status,
    retry,
  } = usePremiumAccess();

  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    if (
      requestedTab === "worlds" ||
      requestedTab === "premium" ||
      requestedTab === "home"
    ) {
      setActiveTab(
        requestedTab,
      );
    }
  }, [
    requestedTab,
  ]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [lockedRoadmapIds, setLockedRoadmapIds] = useState(new Set());
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(
    genericPromptEngineeringRoadmapData,
  );
  const [userRole, setUserRole] = useState("other");
  // const [selectedDsaRoadmap, setSelectedDsaRoadmap] = useState(null);

  const fetcher = async (url) => {
    if (!user) return null;
    const token = await user.getIdToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.profile;
  };

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    mutate: mutateProfile,
  } = useSWR(
    user ? "/api/v2/profile" : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Self-heal streak on dashboard load if user completed lesson locally but server is out of sync
  const streakHealingAttemptedRef = useRef(false);

  useEffect(() => {
    if (!user || !profileData || streakHealingAttemptedRef.current) return;

    const isStreakUnsynced =
      !profileData.streak ||
      profileData.streak.currentCount === 0 ||
      (profileData.streak.status !== "completed_today" &&
        !profileData.streak.week?.some(
          (d) => d.isToday && d.status === "completed_today",
        ));

    if (!isStreakUnsynced) return;

    const hasLocalCompletion =
      typeof window !== "undefined" &&
      (localStorage.getItem("has_completed_first_lesson") === "true" ||
        localStorage.getItem("ignitio:streak_phase") === "sparked" ||
        localStorage.getItem("ignitio:streak_phase") === "completed");

    if (!hasLocalCompletion) return;

    streakHealingAttemptedRef.current = true;

    const reconcileStreak = async () => {
      try {
        const candidates = [
          pythonBeginnerRoadmapData,
          gitGithubRoadmapData,
          selectedPromptRoadmap,
          cppRoadmapData,
          systemDesignRoadmapData,
          clangBeginnerRoadmapData,
        ];

        let targetRoadmap = null;
        let targetLevelId = null;

        for (const r of candidates) {
          if (!r?.id) continue;
          const key = `completed_levels_${r.id}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                targetRoadmap = r;
                targetLevelId = parsed[0];
                break;
              }
            } catch {}
          }
        }

        if (!targetRoadmap) {
          targetRoadmap = pythonBeginnerRoadmapData;
          targetLevelId =
            pythonBeginnerRoadmapData.days?.[0]?.levels?.[0]?.id ||
            "PYTHON_BEGINNER_D1_01";
        }

        const allLevels = targetRoadmap.days.flatMap((d) => d.levels);
        await patchRoadmapProgress({
          user,
          roadmapSlug: targetRoadmap.id,
          payload: {
            action: "complete_level",
            roadmapTitle: targetRoadmap.title || "",
            role: userRole || "other",
            totalLevels: allLevels.length,
            allLevelIds: allLevels.map((l) => l.id),
            days: targetRoadmap.days.map((d) => ({
              id: d.id,
              levelIds: d.levels.map((l) => l.id),
            })),
            levelId: targetLevelId,
          },
        });

        await mutateProfile();
      } catch (err) {
        console.warn("[Dashboard] Streak reconciliation failed:", err);
      }
    };

    reconcileStreak();
  }, [user, profileData, userRole, selectedPromptRoadmap, mutateProfile]);

  // We store the full list of parsed roadmaps so we can feed them to Carousel
  const [allRoadmaps, setAllRoadmaps] = useState([]);

  useEffect(() => {
    if (!userProfile) return;
    const role = userProfile.role || "other";
    setUserRole(role);
    setSelectedPromptRoadmap(getPromptEngineeringRoadmapByRole(role));
    // setSelectedDsaRoadmap(getDsaRoadmapByRole(role)); // DSA disabled
  }, [userProfile]);

  useEffect(() => {
    setIsClient(true);
    let bestRoadmap = null;
    let highestCompleted = 0;

    const roadmapsData = [
      {
        id: selectedPromptRoadmap.id,
        title: selectedPromptRoadmap.title,
        route: redirects.PromptEngineering,
        totalLevels: selectedPromptRoadmap.days.flatMap((day) => day.levels).length,
        legacySections: [],
      },
      {
        id: "git-github",
        title: gitGithubRoadmapData.title,
        route: redirects.GitGithub,
        totalLevels: gitGithubRoadmapData.days.flatMap((day) => day.levels).length,
        legacySections: ["beginner", "intermediate", "advanced"],
      },
      {
        id: "cpp",
        title: cppRoadmapData.title,
        route: redirects.CPP,
        totalLevels: cppRoadmapData.days.flatMap((day) => day.levels).length,
        legacySections: ["beginner", "intermediate", "advanced"],
      },
    ];

    // DSA disabled — not available yet.
    // if (selectedDsaRoadmap && isDsaAllowedRole(userRole)) {
    //   roadmapsData.splice(1, 0, {
    //     id: selectedDsaRoadmap.id,
    //     title: selectedDsaRoadmap.title,
    //     route: "/home/roadmaps/dsa",
    //     totalLevels: selectedDsaRoadmap.days.flatMap((day) => day.levels).length,
    //     legacySections: [],
    //   });
    // }

    roadmapsData.push({
      id: systemDesignRoadmapData.id,
      title: systemDesignRoadmapData.title,
      route: redirects.SystemDesign,
      totalLevels: systemDesignRoadmapData.days.flatMap(
        (day) => day.levels,
      ).length,
      legacySections: [],
    });

    roadmapsData.push({
      id: pythonBeginnerRoadmapData.id,
      title: pythonBeginnerRoadmapData.title,
      route: redirects.Python,
      totalLevels: pythonBeginnerRoadmapData.days.flatMap(
        (day) => day.levels,
      ).length,
      legacySections: [],
    });

    roadmapsData.push({
      id: clangBeginnerRoadmapData.id,
      title: clangBeginnerRoadmapData.title,
      route: redirects.CLang,
      totalLevels: clangBeginnerRoadmapData.days.flatMap(
        (day) => day.levels,
      ).length,
      legacySections: [],
    });

    // Read assigned roadmaps from localStorage (persisted from onboarding)
    let assignedIds = null;
    try {
      const raw = localStorage.getItem("ignitio:assigned_roadmaps");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) assignedIds = parsed;
      }
      if (!assignedIds) {
        const rawResult = localStorage.getItem("ignitio:onboarding_result");
        if (rawResult) {
          const parsed = JSON.parse(rawResult);
          if (Array.isArray(parsed?.roadmap) && parsed.roadmap.length > 0) {
            const skillMap = {
              git: "git-github",
              python: "python-beginner",
              prompt: "prompt-engineering",
              system_design: "system-design-fundamentals",
            };
            const mapped = parsed.roadmap.map(s => skillMap[s] || s).filter(Boolean);
            if (mapped.length > 0) assignedIds = mapped;
          }
        }
      }
    } catch { }

    // If assignedIds exists, only include roadmaps assigned to the user in that order.
    // Otherwise fallback to UNLOCK_ORDER (for legacy users).
    const filteredRoadmapsData = assignedIds
      ? assignedIds
          .map((id) =>
            roadmapsData.find(
              (r) =>
                r.id === id ||
                (id === "prompt-engineering" && r.route === redirects.PromptEngineering),
            ),
          )
          .filter(Boolean)
      : roadmapsData.filter((r) => UNLOCK_ORDER.includes(r.id));

    const progressMap = {};

    for (const roadmap of filteredRoadmapsData) {
      let completedLevelsCount = 0;
      const canonicalKey = `completed_levels_${roadmap.id}`;
      const saved = localStorage.getItem(canonicalKey);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            completedLevelsCount = parsed.length;
          }
        } catch (e) { }
      } else if (roadmap.legacySections && roadmap.legacySections.length > 0) {
        for (const section of roadmap.legacySections) {
          const key = `progress_${roadmap.id}_${section}`;
          const legacySaved = localStorage.getItem(key);
          if (legacySaved) {
            try {
              const parsed = JSON.parse(legacySaved);
              if (Array.isArray(parsed)) {
                completedLevelsCount += parsed.length;
              }
            } catch (e) { }
          }
        }
      }

      roadmap.completedLevels = completedLevelsCount;
      roadmap.progressPercent = Math.round((completedLevelsCount / roadmap.totalLevels) * 100);
      progressMap[roadmap.id] = { completed: completedLevelsCount, total: roadmap.totalLevels };

      if (completedLevelsCount > highestCompleted) {
        highestCompleted = completedLevelsCount;
        bestRoadmap = roadmap;
      }
    }

    let lastActiveRoadmapId = null;
    try {
      const savedLastActive = localStorage.getItem(
        "ignitio:last_active_roadmap",
      );
      if (savedLastActive) {
        const parsed = JSON.parse(savedLastActive);
        if (parsed && parsed.id) lastActiveRoadmapId = parsed.id;
      }
    } catch (e) { }

    // Sequential lock order matches the user's assigned roadmaps
    const sequentialOrder = filteredRoadmapsData.map((r) => r.id);
    const lockedIds = new Set();
    if (process.env.NODE_ENV !== "development") {
      for (let i = 1; i < sequentialOrder.length; i++) {
        const prevId = sequentialOrder[i - 1];
        const prevProgress = progressMap[prevId];
        const prevDone = prevProgress && prevProgress.completed >= prevProgress.total && prevProgress.total > 0;
        if (!prevDone) {
          // This roadmap and all subsequent ones are locked
          for (let j = i; j < sequentialOrder.length; j++) {
            lockedIds.add(sequentialOrder[j]);
          }
          break;
        }
      }
    }

    // Only allow unlocked roadmaps as the active (home tab) roadmap
    const unlockedRoadmaps = filteredRoadmapsData.filter(r => !lockedIds.has(r.id));

    let activeRoadmapToSet = null;
    let maxProgress = -1;
    for (const r of unlockedRoadmaps) {
      if (r.completedLevels > maxProgress) {
        maxProgress = r.completedLevels;
        activeRoadmapToSet = r;
      }
    }

    if (lastActiveRoadmapId) {
      const foundLastActive = unlockedRoadmaps.find(r => r.id === lastActiveRoadmapId);
      if (foundLastActive) activeRoadmapToSet = foundLastActive;
    }

    if (!activeRoadmapToSet && unlockedRoadmaps.length > 0) {
      activeRoadmapToSet = unlockedRoadmaps[0];
    }

    setRoadmapProgress(progressMap);
    setActiveRoadmap(activeRoadmapToSet);
    setAllRoadmaps(filteredRoadmapsData);
    setLockedRoadmapIds(lockedIds);
  }, [selectedPromptRoadmap, userRole]); // selectedDsaRoadmap removed (DSA disabled)

  const handleRedirect = (route) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(route);
    setTimeout(() => setIsNavigating(false), 3000);
  };

  const handleRedirectGitGithub = () => handleRedirect(redirects.GitGithub);
  const handleRedirectCPP = () => handleRedirect(redirects.CPP);
  const handleRedirectPromptEngineering = () => handleRedirect(redirects.PromptEngineering);
  // const handleRedirectDsa = () => handleRedirect("/home/roadmaps/dsa"); // DSA disabled
  const handleRedirectSystemDesign = () =>
    handleRedirect(redirects.SystemDesign);

  const handleRedirectPython = () =>
    handleRedirect(redirects.Python);

  const handleRedirectCLang = () =>
    handleRedirect(redirects.CLang);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Adventurer";

  const carouselRoadmaps = [];

  // System Design
  carouselRoadmaps.push({
    id: systemDesignRoadmapData.id,
    component: (
      <SystemDesignCourseCard
        onClick={handleRedirectSystemDesign}
        levelsFinished={
          roadmapProgress[systemDesignRoadmapData.id]?.completed || 0
        }
        totalLevels={
          roadmapProgress[systemDesignRoadmapData.id]?.total ||
          systemDesignRoadmapData.days.flatMap((day) => day.levels).length
        }
      />
    ),
  });

  // Python
  carouselRoadmaps.push({
    id: pythonBeginnerRoadmapData.id,
    component: (
      <PythonCourseCard
        onClick={handleRedirectPython}
        levelsFinished={
          roadmapProgress[pythonBeginnerRoadmapData.id]?.completed || 0
        }
        totalLevels={
          roadmapProgress[pythonBeginnerRoadmapData.id]?.total ||
          pythonBeginnerRoadmapData.days.flatMap((day) => day.levels).length
        }
      />
    ),
  });

  // C Language
  carouselRoadmaps.push({
    id: clangBeginnerRoadmapData.id,
    component: (
      <CCourseCard
        onClick={handleRedirectCLang}
        levelsFinished={
          roadmapProgress[clangBeginnerRoadmapData.id]?.completed || 0
        }
        totalLevels={
          roadmapProgress[clangBeginnerRoadmapData.id]?.total ||
          clangBeginnerRoadmapData.days.flatMap((day) => day.levels).length
        }
      />
    ),
  });

  // Prompt Engineering
  carouselRoadmaps.push({
    id: selectedPromptRoadmap.id,
    component: (
      <PromptEngineeringCourseCard
        onClick={handleRedirectPromptEngineering}
        levelsFinished={roadmapProgress[selectedPromptRoadmap.id]?.completed || 0}
        totalLevels={roadmapProgress[selectedPromptRoadmap.id]?.total || selectedPromptRoadmap.days.flatMap((day) => day.levels).length}
        roadmapData={selectedPromptRoadmap}
      />
    )
  });

  // DSA disabled — not available yet. Re-enable when DSA paid course is ready.
  // if (isDsaAllowedRole(userRole) && selectedDsaRoadmap) {
  //   carouselRoadmaps.push({
  //     id: selectedDsaRoadmap.id,
  //     component: (
  //       <DsaCourseCard
  //         onClick={handleRedirectDsa}
  //         levelsFinished={roadmapProgress[selectedDsaRoadmap.id]?.completed || 0}
  //         totalLevels={roadmapProgress[selectedDsaRoadmap.id]?.total || selectedDsaRoadmap.days.flatMap((day) => day.levels).length}
  //         roadmapData={selectedDsaRoadmap}
  //       />
  //     )
  //   });
  // }

  // CPP
  carouselRoadmaps.push({
    id: "cpp",
    component: (
      <CppCourseCard
        onClick={handleRedirectCPP}
        levelsFinished={roadmapProgress["cpp"]?.completed || 0}
        totalLevels={roadmapProgress["cpp"]?.total || cppRoadmapData.days.flatMap((day) => day.levels).length}
      />
    )
  });

  // Git
  carouselRoadmaps.push({
    id: "git-github",
    component: (
      <GitCourseCard
        onClick={handleRedirectGitGithub}
        levelsFinished={roadmapProgress["git-github"]?.completed || 0}
        totalLevels={roadmapProgress["git-github"]?.total || gitGithubRoadmapData.days.flatMap((day) => day.levels).length}
      />
    )
  });

  // Order and filter carousel items to strictly match the roadmaps in allRoadmaps
  const filteredCarouselRoadmaps = allRoadmaps
    .map((ar) => carouselRoadmaps.find((cr) => cr.id === ar.id))
    .filter(Boolean);

  /**
   * New-user guard:
   * Only show the empty state after client-side resolution completes.
   * Prevents existing learners from seeing "Choose your first roadmap" briefly.
   *
   * isClient becomes true after localStorage is read (useEffect).
   * If isClient is false, we haven't resolved yet → do not show empty state.
   */
  const clientResolved = isClient;
  const hasActiveRoadmap = Boolean(activeRoadmap);

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans text-[#19183B]">
      {/* ── HOME TAB ── */}
      {activeTab === "home" && (
        <div className="max-w-[780px] mx-auto px-4 sm:px-6 pt-3 sm:pt-5 pb-40">

          <HomeHeader
            displayName={displayName}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
          />

          <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

          {/* Loading state — show skeleton while client resolves */}
          {!clientResolved && (
            <div className="flex flex-col gap-5">
              <div className="animate-pulse bg-white/80 rounded-3xl h-52 border border-[#E6BA91] shadow-sm" />
              <div className="animate-pulse bg-white/80 rounded-3xl h-40 border border-[#E6BA91] shadow-sm" />
            </div>
          )}

          {/* New-user empty state — only after resolution, only if no roadmap */}
          {clientResolved && !hasActiveRoadmap && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#00A9FF]/12 flex items-center justify-center mb-6">
                <Globe2 className="w-8 h-8 text-[#00A9FF]" />
              </div>

              <h2 className="text-2xl font-bold text-[#19183B] mb-3">
                Choose your first roadmap
              </h2>

              <p className="text-[#19183B]/65 text-sm max-w-xs mb-8 leading-relaxed">
                Start with a structured learning path and build your first learning streak.
              </p>

              <button
                onClick={() => {
                  setActiveTab("worlds");
                  router.replace("/home?tab=worlds", { scroll: false });
                }}
                className="
                  px-8 py-3.5
                  bg-[#00A9FF]
                  text-[#19183B]
                  font-bold
                  rounded-xl
                  shadow-[0_4px_0_#0085C7]
                  hover:-translate-y-px
                  active:translate-y-[2px]
                  active:shadow-[0_1px_0_#0085C7]
                  active:scale-[0.99]
                  transition-all duration-150
                  text-sm
                "
              >
                Start Roadmap
              </button>
            </div>
          )}

          {/* Existing learner — streak + roadmap */}
          {clientResolved && hasActiveRoadmap && (
            <div className="flex flex-col gap-5">
              {/* Streak module */}
              <StreakStatusCard
                streak={profileData?.streak}
                isLoadingProfile={isLoadingProfile}
                user={user}
              />

              {/* Current roadmap — actual course card */}
              <div>
                <p
                  className="
                    text-[11px]
                    font-bold
                    text-[#19183B]/55
                    uppercase
                    tracking-widest
                    mb-2
                    px-1
                  "
                >
                  CONTINUE LEARNING
                </p>

                <div className="w-full max-w-[460px] mx-auto">
                  {(() => {
                    const comp = filteredCarouselRoadmaps.find(
                      (r) => r.id === activeRoadmap.id
                    )?.component;

                    return comp
                      ? React.cloneElement(comp, { variant: "home" })
                      : null;
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WORLDS TAB ── */}
      {activeTab === "worlds" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-36">
          <RoadmapWorldsCarousel
            roadmaps={filteredCarouselRoadmaps.map(item => {
              if (!lockedRoadmapIds.has(item.id)) return item;
              // Find which roadmap unlocks this one
              const lockIdx = allRoadmaps.findIndex(r => r.id === item.id);
              const prevTitle = lockIdx > 0 ? allRoadmaps[lockIdx - 1]?.title : "the previous roadmap";
              return {
                ...item,
                component: (
                  <div
                    key={item.id}
                    className="relative w-full h-full select-none"
                    style={{ borderRadius: 24 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Greyscale + dim the underlying card */}
                    <div
                      style={{
                        filter: "grayscale(1) brightness(0.72)",
                        pointerEvents: "none",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      {React.cloneElement(item.component, { onClick: undefined })}
                    </div>

                    {/* Lock overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
                      style={{
                        background: "rgba(25,24,59,0.45)",
                        borderRadius: 24,
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      {/* Lock icon */}
                      <div
                        className="flex items-center justify-center rounded-full bg-white/15"
                        style={{ width: 52, height: 52 }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>

                      <p className="text-white font-bold text-[15px] leading-snug">
                        Locked
                      </p>
                      <p className="text-white/80 text-[13px] leading-relaxed">
                        Complete <span className="font-semibold text-white">{prevTitle}</span> to unlock this roadmap.
                      </p>
                    </div>
                  </div>
                ),
              };
            })}
            initialActiveId={activeRoadmap?.id}
          />
        </div>
      )}

      {/* ── PREMIUM TAB ── */}
      {activeTab === "premium" && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-36">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Premium Worlds</h1>
            <p className="text-sm text-slate-500 mt-2">
              Master advanced skills with GenAI.
            </p>
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="w-full max-w-[760px]">
              <GenAiPremiumCard
                status={status}
                onRetry={retry}
                onNavigatePremium={() =>
                  handleRedirect("/home/premium/genai")
                }
                onNavigatePaywall={() =>
                  handleRedirect("/onboarding/diagnostic")
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ── FIXED BOTTOM NAVIGATION ── */}
      <DashboardBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
