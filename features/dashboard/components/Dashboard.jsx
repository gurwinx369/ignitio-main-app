"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
import { useAuth } from "@/features/context/AuthContext";
import {
  getPromptEngineeringRoadmapByRole,
  promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData,
} from "@/data/promptEngineering";
import { gitGithubRoadmapData } from "@/data/gitGithubCourseData";
import { cppRoadmapData } from "@/data/cppCourseData";
import { getDsaRoadmapByRole, isDsaAllowedRole } from "@/data/dsa";
import { Home, BookOpen, User } from "lucide-react";
import { usePremiumAccess } from "@/features/premium/access/usePremiumAccess";
import GenAiPremiumCard from "@/features/premium/components/GenAiPremiumCard";

// Layout Components
import HomeHeader from "./HomeHeader";
import FeedbackModal from "./FeedbackModal";
import MissionControlCard from "./MissionControlCard";
import StreakStatusCard from "./StreakStatusCard";
import ActiveRoadmapCard from "./ActiveRoadmapCard";
import LearningStatsCard from "./LearningStatsCard";
import RoadmapWorldsCarousel from "./RoadmapWorldsCarousel";

const redirects = {
  GitGithub: "/home/roadmaps/git-github",
  CPP: "/home/roadmaps/cpp",
  PromptEngineering: "/home/roadmaps/prompt-engineering",
};

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();
  const { user } = useAuth();
  const {
    status,
    retry,
  } = usePremiumAccess();

  const currentRoadmapRef = useRef(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
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

  // We store the full list of parsed roadmaps so we can feed them to LearningStats and Carousel
  const [allRoadmaps, setAllRoadmaps] = useState([]);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

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
        } catch (e) {}
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
            } catch (e) {}
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

  const displayName = profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || "Adventurer";

  const scrollToTask = () => {
    if (currentRoadmapRef.current) {
      currentRoadmapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const carouselRoadmaps = [];

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

  return (
    <div className="min-h-screen bg-[#fffaf3] pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Header (Desktop + Mobile) */}
        <HomeHeader
          displayName={displayName}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onScrollToTask={scrollToTask}
        />

        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

        {/* 
          Dashboard Layout 
          Mobile: Single column stacked
          Desktop: 
          Row 1: MissionControl (full/2/3) + StreakStatus (1/3)
          Row 2: ActiveRoadmap (1/2) + LearningStats (1/2)
        */}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mb-12" ref={currentRoadmapRef}>
          {/* Row 1 equivalent on desktop */}
          <div className="lg:col-span-2">
            <MissionControlCard
              activeRoadmap={activeRoadmap}
              isClient={isClient}
              isNavigating={isNavigating}
              onNavigate={() => {
                if (activeRoadmap) handleRedirect(activeRoadmap.route);
                else handleRedirect(redirects.PromptEngineering); // fallback
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <StreakStatusCard
              streak={profileData?.streak}
              isLoadingProfile={isLoadingProfile}
              user={user}
            />
          </div>

          {/* Row 2 equivalent on desktop */}
          <div className="lg:col-span-2">
            <ActiveRoadmapCard
              activeRoadmap={activeRoadmap}
              isClient={isClient}
              isNavigating={isNavigating}
              onNavigate={() => {
                if (activeRoadmap) handleRedirect(activeRoadmap.route);
                else scrollToTask();
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <LearningStatsCard
              profileData={profileData}
              roadmapsData={allRoadmaps}
            />
          </div>
        </div>

        {/* Premium Worlds */}
        <section className="mb-12 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Premium Worlds</h2>
              <p className="text-sm text-slate-500 mt-1">Master advanced skills with GenAI.</p>
            </div>
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
        </section>

        {/* Carousel */}
        <RoadmapWorldsCarousel roadmaps={carouselRoadmaps} initialActiveId={activeRoadmap?.id} />

        {/* Existing Mobile Bottom Nav */}
        <div className="mx-auto w-full max-w-[480px] mb-8 sm:hidden mt-8">
          <div className="grid grid-cols-3 gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => {
                if (activeRoadmap) {
                  router.push(activeRoadmap.route);
                } else {
                  scrollToTask();
                }
              }}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={scrollToTop}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors bg-slate-900 text-white shadow-sm"
            >
              <Home className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => router.push("/home/profile")}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <User className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
