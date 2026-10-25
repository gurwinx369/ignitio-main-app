"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
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
import Day2StreakModal from "@/components/streak/day2-streak-modal";
import RoadmapCatalogModal from "./RoadmapCatalogModal";

// Default roadmap order when user has no custom assigned roadmaps
const DEFAULT_ROADMAP_ORDER = [
  "python-beginner",
  "git-github",
  "c-language-course",
  "cpp",
  "system-design-fundamentals",
  "prompt-engineering",
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
    DSA: "/home/roadmaps/dsa",
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
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(
    genericPromptEngineeringRoadmapData,
  );
  const [userRole, setUserRole] = useState(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem("profession") || "student")) ||
      "student",
  );
  const [selectedDsaRoadmap, setSelectedDsaRoadmap] = useState(
    () =>
      getDsaRoadmapByRole(
        typeof window !== "undefined"
          ? localStorage.getItem("profession") || "student"
          : "student",
      ),
  );
  const [isDay2ModalDismissed, setIsDay2ModalDismissed] = useState(false);
  const [isGoalModalExplicitlyOpen, setIsGoalModalExplicitlyOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [enrolledRoadmapsState, setEnrolledRoadmapsState] = useState(null);

  const handleEnrollRoadmap = async (slug, title) => {
    let currentList = enrolledRoadmapsState;
    if (!currentList) {
      try {
        const raw = localStorage.getItem("ignitio:assigned_roadmaps");
        if (raw) currentList = JSON.parse(raw);
      } catch {}
    }
    if (!Array.isArray(currentList) || currentList.length === 0) {
      if (Array.isArray(profileData?.assignedRoadmaps) && profileData.assignedRoadmaps.length > 0) {
        currentList = profileData.assignedRoadmaps;
      } else if (allRoadmaps && allRoadmaps.length > 0) {
        currentList = allRoadmaps.map((r) => r.id);
      } else {
        try {
          const rawResult = localStorage.getItem("ignitio:onboarding_result");
          if (rawResult) {
            const parsed = JSON.parse(rawResult);
            if (Array.isArray(parsed?.roadmap) && parsed.roadmap.length > 0) {
              const skillMap = {
                git: "git-github",
                python: "python-beginner",
                prompt: "prompt-engineering",
                system_design: "system-design-fundamentals",
                dsa: "dsa",
                "c-language": "c-language-course",
                "c-language-course": "c-language-course",
              };
              currentList = parsed.roadmap.map(s => skillMap[s] || s).filter(Boolean);
            }
          }
        } catch {}
      }
    }
    if (!Array.isArray(currentList) || currentList.length === 0) {
      currentList = DEFAULT_ROADMAP_ORDER;
    }

    const nextList = Array.from(new Set([...currentList, slug]));
    try {
      localStorage.setItem("ignitio:assigned_roadmaps", JSON.stringify(nextList));
    } catch {}
    setEnrolledRoadmapsState(nextList);

    try {
      if (user) {
        const token = await user.getIdToken();
        await fetch("/api/v2/roadmaps/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roadmapSlug: slug,
            roadmapTitle: title,
          }),
        });
        if (mutateProfile) {
          mutateProfile();
        }
      }
    } catch (err) {
      console.error("[handleEnrollRoadmap] Persistence error:", err);
    }

    setIsCatalogModalOpen(false);
  };

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
          selectedDsaRoadmap,
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
  }, [user, profileData, userRole, selectedPromptRoadmap, selectedDsaRoadmap, mutateProfile]);

  // We store the full list of parsed roadmaps so we can feed them to Carousel
  const [allRoadmaps, setAllRoadmaps] = useState([]);

  useEffect(() => {
    if (!userProfile) return;
    const role = userProfile.role || "other";
    setUserRole(role);
    setSelectedPromptRoadmap(getPromptEngineeringRoadmapByRole(role));
    setSelectedDsaRoadmap(getDsaRoadmapByRole(role));
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

    if (selectedDsaRoadmap && isDsaAllowedRole(userRole)) {
      roadmapsData.splice(1, 0, {
        id: selectedDsaRoadmap.id,
        title: selectedDsaRoadmap.title,
        route: redirects.DSA,
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

    // Read assigned roadmaps from local state or localStorage (persisted from onboarding/catalog)
    let assignedIds = enrolledRoadmapsState;
    if (!assignedIds || (Array.isArray(assignedIds) && assignedIds.length === 0)) {
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
            if (parsed?.goal === "dsa") {
              assignedIds = ["dsa"];
            } else if (Array.isArray(parsed?.roadmap) && parsed.roadmap.length > 0) {
              const skillMap = {
                git: "git-github",
                python: "python-beginner",
                prompt: "prompt-engineering",
                system_design: "system-design-fundamentals",
                dsa: "dsa",
                "c-language": "c-language-course",
                "c-language-course": "c-language-course",
              };
              const mapped = parsed.roadmap.map(s => skillMap[s] || s).filter(Boolean);
              if (mapped.length > 0) assignedIds = mapped;
            }
          }
        }
        // Server fallback if localStorage was cleared
        if (!assignedIds && profileData) {
          if (profileData.activeRoadmapSlug === "dsa" || profileData.currentRoadmap === "dsa" || (Array.isArray(profileData.assignedRoadmaps) && profileData.assignedRoadmaps.includes("dsa") && !profileData.assignedRoadmaps.includes("python"))) {
            assignedIds = ["dsa"];
          } else if (Array.isArray(profileData.assignedRoadmaps) && profileData.assignedRoadmaps.length > 0) {
            const skillMap = {
              git: "git-github",
              python: "python-beginner",
              prompt: "prompt-engineering",
              system_design: "system-design-fundamentals",
              dsa: "dsa",
              "c-language": "c-language-course",
              "c-language-course": "c-language-course",
            };
            assignedIds = profileData.assignedRoadmaps.map(s => skillMap[s] || s).filter(Boolean);
          }
        }
      } catch { }
    }

    const canonicalSkillMap = {
      git: "git-github",
      "git-github": "git-github",
      python: "python-beginner",
      "python-beginner": "python-beginner",
      prompt: "prompt-engineering",
      "prompt-engineering": "prompt-engineering",
      system_design: "system-design-fundamentals",
      "system-design": "system-design-fundamentals",
      "system-design-fundamentals": "system-design-fundamentals",
      dsa: "dsa",
      "c-language": "c-language-course",
      "c-language-course": "c-language-course",
      cpp: "cpp",
    };

    const normalizedAssignedIds = assignedIds
      ? assignedIds.map((s) => canonicalSkillMap[s] || s)
      : null;

    // If assignedIds exists, only include roadmaps assigned to the user in that order.
    // Otherwise fallback to UNLOCK_ORDER (for legacy users).
    const baseFiltered = normalizedAssignedIds
      ? normalizedAssignedIds
          .map((id) =>
            roadmapsData.find(
              (r) =>
                r.id === id ||
                (id === "prompt-engineering" && r.route === redirects.PromptEngineering) ||
                (id === "dsa" && (r.route === redirects.DSA || r.id.startsWith("dsa"))),
            ),
          )
          .filter(Boolean)
      : roadmapsData.filter((r) => DEFAULT_ROADMAP_ORDER.includes(r.id) || r.id.startsWith("dsa"));

    const seenIds = new Set();
    const uniqueBaseFiltered = [];
    for (const r of baseFiltered) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        uniqueBaseFiltered.push(r);
      }
    }

    const filteredRoadmapsData = [...uniqueBaseFiltered];
    if (
      selectedDsaRoadmap &&
      isDsaAllowedRole(userRole) &&
      (!assignedIds || assignedIds.length === 0) &&
      !filteredRoadmapsData.some((r) => r.id === selectedDsaRoadmap.id)
    ) {
      const dsaEntry = roadmapsData.find((r) => r.id === selectedDsaRoadmap.id);
      if (dsaEntry) filteredRoadmapsData.push(dsaEntry);
    }

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

    let activeRoadmapToSet = null;
    let maxProgress = -1;
    for (const r of filteredRoadmapsData) {
      if (r.completedLevels > maxProgress) {
        maxProgress = r.completedLevels;
        activeRoadmapToSet = r;
      }
    }

    const serverActiveSlug = profileData?.activeRoadmapSlug || profileData?.currentRoadmap;
    if (serverActiveSlug) {
      const foundServerActive = filteredRoadmapsData.find(r => r.id === serverActiveSlug || (serverActiveSlug === "dsa" && (r.route === redirects.DSA || r.id.startsWith("dsa"))));
      if (foundServerActive) activeRoadmapToSet = foundServerActive;
    } else if (lastActiveRoadmapId) {
      const foundLastActive = filteredRoadmapsData.find(r => r.id === lastActiveRoadmapId || (lastActiveRoadmapId === "dsa" && (r.route === redirects.DSA || r.id.startsWith("dsa"))));
      if (foundLastActive) activeRoadmapToSet = foundLastActive;
    }

    if (!activeRoadmapToSet && filteredRoadmapsData.length > 0) {
      activeRoadmapToSet = filteredRoadmapsData[0];
    }

    setRoadmapProgress(progressMap);
    setActiveRoadmap(activeRoadmapToSet);
    setAllRoadmaps(filteredRoadmapsData);
  }, [
    selectedPromptRoadmap,
    userRole,
    selectedDsaRoadmap,
    profileData?.activeRoadmapSlug,
    profileData?.currentRoadmap,
    profileData?.assignedRoadmaps,
    enrolledRoadmapsState,
  ]);

  const syncActiveRoadmapToServer = async (slug) => {
    if (!user || !slug) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/v2/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activeRoadmapSlug: slug }),
      });
      if (mutateProfile) mutateProfile();
    } catch (e) {
      // Non-blocking background sync
    }
  };

  const handleRedirect = (route, slug) => {
    if (isNavigating) return;
    if (slug) {
      localStorage.setItem("ignitio:last_active_roadmap", JSON.stringify({ id: slug }));
      syncActiveRoadmapToServer(slug);
    }
    setIsNavigating(true);
    router.push(route);
    setTimeout(() => setIsNavigating(false), 3000);
  };

  const handleRedirectGitGithub = () => handleRedirect(redirects.GitGithub, "git-github");
  const handleRedirectCPP = () => handleRedirect(redirects.CPP, "cpp");
  const handleRedirectPromptEngineering = () => handleRedirect(redirects.PromptEngineering, selectedPromptRoadmap?.id || "prompt-engineering");
  const handleRedirectDsa = () => handleRedirect(redirects.DSA, selectedDsaRoadmap?.id || "dsa");
  const handleRedirectSystemDesign = () =>
    handleRedirect(redirects.SystemDesign, systemDesignRoadmapData.id);

  const handleRedirectPython = () =>
    handleRedirect(redirects.Python, pythonBeginnerRoadmapData.id);

  const handleRedirectCLang = () =>
    handleRedirect(redirects.CLang, clangBeginnerRoadmapData.id);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Adventurer";

  // Memoize carousel roadmaps and locks strictly so RoadmapWorldsCarousel receives a stable array reference
  const carouselRoadmapsWithLocks = useMemo(() => {
    const rawList = [];

    // System Design
    rawList.push({
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
    rawList.push({
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
    rawList.push({
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
    rawList.push({
      id: selectedPromptRoadmap.id,
      component: (
        <PromptEngineeringCourseCard
          onClick={handleRedirectPromptEngineering}
          levelsFinished={roadmapProgress[selectedPromptRoadmap.id]?.completed || 0}
          totalLevels={roadmapProgress[selectedPromptRoadmap.id]?.total || selectedPromptRoadmap.days.flatMap((day) => day.levels).length}
          roadmapData={selectedPromptRoadmap}
        />
      ),
    });

    if (isDsaAllowedRole(userRole) && selectedDsaRoadmap) {
      rawList.push({
        id: selectedDsaRoadmap.id,
        component: (
          <DsaCourseCard
            onClick={handleRedirectDsa}
            levelsFinished={roadmapProgress[selectedDsaRoadmap.id]?.completed || 0}
            totalLevels={roadmapProgress[selectedDsaRoadmap.id]?.total || selectedDsaRoadmap.days.flatMap((day) => day.levels).length}
            roadmapData={selectedDsaRoadmap}
          />
        ),
      });
    }

    // CPP
    rawList.push({
      id: "cpp",
      component: (
        <CppCourseCard
          onClick={handleRedirectCPP}
          levelsFinished={roadmapProgress["cpp"]?.completed || 0}
          totalLevels={roadmapProgress["cpp"]?.total || cppRoadmapData.days.flatMap((day) => day.levels).length}
        />
      ),
    });

    // Git
    rawList.push({
      id: "git-github",
      component: (
        <GitCourseCard
          onClick={handleRedirectGitGithub}
          levelsFinished={roadmapProgress["git-github"]?.completed || 0}
          totalLevels={roadmapProgress["git-github"]?.total || gitGithubRoadmapData.days.flatMap((day) => day.levels).length}
        />
      ),
    });

    // Order and filter carousel items to strictly match the roadmaps in allRoadmaps (all fully unlocked)
    return allRoadmaps
      .map((ar) => rawList.find((cr) => cr.id === ar.id))
      .filter(Boolean);
  }, [
    allRoadmaps,
    roadmapProgress,
    selectedPromptRoadmap,
    userRole,
    selectedDsaRoadmap,
  ]);

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
        <div className="max-w-[620px] mx-auto px-4 sm:px-6 pt-3 sm:pt-5 pb-40">

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
            <div className="flex flex-col gap-6">
              {/* Streak module */}
              <StreakStatusCard
                streak={profileData?.streak}
                isLoadingProfile={isLoadingProfile}
                user={user}
                onOpenGoalModal={() => setIsGoalModalExplicitlyOpen(true)}
              />


              {/* Current roadmap — actual course card */}
              <div className="flex flex-col">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <p
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-[#19183B]/55
                    "
                  >
                    CONTINUE LEARNING
                  </p>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#00A9FF]">
                    <span>Next lesson powers Day {(profileData?.streak?.currentCount || 0) + 1}</span>
                    <span aria-hidden="true">⚡</span>
                  </span>
                </div>

                <div className="w-full">
                  {(() => {
                    const comp = carouselRoadmapsWithLocks.find(
                      (r) => r.id === activeRoadmap.id || (activeRoadmap.id === "dsa" && r.id?.startsWith("dsa"))
                    )?.component;

                    return comp && React.isValidElement(comp)
                      ? React.cloneElement(comp, { variant: "home" })
                      : comp || null;
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
            roadmaps={carouselRoadmapsWithLocks}
            initialActiveId={activeRoadmap?.id}
            onOpenCatalog={() => setIsCatalogModalOpen(true)}
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

      {/* ── STREAK GOAL & CONTINUITY MODAL ── */}
      {isClient &&
        (isGoalModalExplicitlyOpen ||
          (!isDay2ModalDismissed &&
            (profileData?.streak?.currentCount || 0) >= 1 &&
            !profileData?.streak?.day2PromptSeen &&
            !profileData?.streak?.targetGoal &&
            (profileData?.streak?.longestCount || 0) <= 2 &&
            (profileData?.stats?.roadmapsCompleted || 0) === 0)) && (
          <Day2StreakModal
            user={user}
            streak={profileData?.streak}
            onClose={() => {
              setIsDay2ModalDismissed(true);
              setIsGoalModalExplicitlyOpen(false);
            }}
            onSuccess={(updatedStreakData) => {
              setIsGoalModalExplicitlyOpen(false);
              if (mutateProfile) {
                mutateProfile(
                  (prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      streak: {
                        ...prev.streak,
                        ...updatedStreakData,
                        // CRITICAL: Preserve the dynamically built weekly cups array!
                        week: prev.streak?.week,
                      },
                    };
                  },
                  true, // Revalidate in background so server data stays authoritative
                );
              }
            }}
          />
        )}

      {/* ── ROADMAP CATALOG MODAL (UNLOCK NEW WORLDS) ── */}
      {isClient && (
        <RoadmapCatalogModal
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          enrolledRoadmapIds={
            enrolledRoadmapsState ||
            (allRoadmaps?.length > 0 ? allRoadmaps.map((r) => r.id) : null) ||
            profileData?.assignedRoadmaps ||
            ["dsa"]
          }
          onEnrollRoadmap={handleEnrollRoadmap}
        />
      )}
    </div>
  );
}
