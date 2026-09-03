"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
import SystemDesignCourseCard from "@/components/ui/courseCards/system-design-course-card";
import PythonCourseCard from "@/components/ui/courseCards/python-course-card";
import CCourseCard from "@/components/ui/courseCards/c-course-card";
import { useAuth } from "@/features/context/AuthContext";
import {
  getPromptEngineeringRoadmapByRole,
  promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData,
} from "@/data/promptEngineering";
import { gitGithubRoadmapData } from "@/data/gitGithubCourseData";
import { cppRoadmapData } from "@/data/cppCourseData";
import { getDsaRoadmapByRole, isDsaAllowedRole } from "@/data/dsa";
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

const redirects = {
  GitGithub: "/home/roadmaps/git-github",
  CPP: "/home/roadmaps/cpp",
  PromptEngineering: "/home/roadmaps/prompt-engineering",
  SystemDesign: "/home/roadmaps/system-design-fundamentals",
  Python: "/home/roadmaps/python-beginner",
  CLang: "/home/roadmaps/c-beginner",
};

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const requestedTab =
    searchParams.get("tab");
  const posthog = usePostHog();
  const { user } = useAuth();
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
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(
    genericPromptEngineeringRoadmapData,
  );
  const [userRole, setUserRole] = useState("other");
  const [selectedDsaRoadmap, setSelectedDsaRoadmap] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // We store the full list of parsed roadmaps so we can feed them to Carousel
  const [allRoadmaps, setAllRoadmaps] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      let role = "other";
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/v2/user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.requiresOnboarding) {
              router.replace("/home/onboarding");
              return;
            }
            role = data.user?.role || "other";
          } else {
            if (res.status === 404) {
              router.replace("/home/onboarding");
              return;
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              "Failed to fetch user role:",
              error?.message || "unknown error",
            );
          }
          role = "other";
        }
      }
      setUserRole(role);
      setSelectedPromptRoadmap(getPromptEngineeringRoadmapByRole(role));
      setSelectedDsaRoadmap(getDsaRoadmapByRole(role));
    };

    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/v2/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data.profile);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user !== undefined) {
      fetchUserRole();
      fetchProfile();
    }
  }, [user, router]);

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

    if (selectedDsaRoadmap && isDsaAllowedRole(userRole)) {
      roadmapsData.splice(1, 0, {
        id: selectedDsaRoadmap.id,
        title: selectedDsaRoadmap.title,
        route: "/home/roadmaps/dsa",
        totalLevels: selectedDsaRoadmap.days.flatMap((day) => day.levels).length,
        legacySections: [],
      });
    }

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

    const progressMap = {};

    for (const roadmap of roadmapsData) {
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

    let activeRoadmapToSet = bestRoadmap;
    if (lastActiveRoadmapId) {
      const foundLastActive = roadmapsData.find(
        (r) => r.id === lastActiveRoadmapId,
      );
      if (foundLastActive) {
        activeRoadmapToSet = foundLastActive;
      }
    }

    setRoadmapProgress(progressMap);
    setActiveRoadmap(activeRoadmapToSet);
    setAllRoadmaps(roadmapsData);
  }, [selectedPromptRoadmap, selectedDsaRoadmap, userRole]);

  const handleRedirect = (route) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(route);
    setTimeout(() => setIsNavigating(false), 3000);
  };

  const handleRedirectGitGithub = () => handleRedirect(redirects.GitGithub);
  const handleRedirectCPP = () => handleRedirect(redirects.CPP);
  const handleRedirectPromptEngineering = () => handleRedirect(redirects.PromptEngineering);
  const handleRedirectDsa = () => handleRedirect("/home/roadmaps/dsa");
  const handleRedirectSystemDesign = () =>
    handleRedirect(redirects.SystemDesign);

  const handleRedirectPython = () =>
    handleRedirect(redirects.Python);

  const handleRedirectCLang = () =>
    handleRedirect(redirects.CLang);

  const displayName = profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || "Adventurer";

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

  // DSA
  if (isDsaAllowedRole(userRole) && selectedDsaRoadmap) {
    carouselRoadmaps.push({
      id: selectedDsaRoadmap.id,
      component: (
        <DsaCourseCard
          onClick={handleRedirectDsa}
          levelsFinished={roadmapProgress[selectedDsaRoadmap.id]?.completed || 0}
          totalLevels={roadmapProgress[selectedDsaRoadmap.id]?.total || selectedDsaRoadmap.days.flatMap((day) => day.levels).length}
          roadmapData={selectedDsaRoadmap}
        />
      )
    });
  }

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
                onClick={() => setActiveTab("worlds")}
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
                    const comp = carouselRoadmaps.find(
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
          {/* RoadmapWorldsCarousel renders its own "Roadmap Worlds" heading internally */}
          <RoadmapWorldsCarousel
            roadmaps={carouselRoadmaps}
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
                  handleRedirect("/home/premium/genai/paywall")
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
