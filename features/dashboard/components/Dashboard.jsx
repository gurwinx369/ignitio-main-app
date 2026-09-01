"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import Profile from "@/layout/Profile";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
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
import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
import CertificateDashboardSection from "@/features/certificates/CertificateDashboardSection";
import CertificateUnlockedModal from "@/features/certificates/CertificateUnlockedModal";
import { systemDesignRoadmapData } from "@/data/systemDesignData";
import { pythonBeginnerRoadmapData } from "@/data/pythonBeginnerRoadmapData";
import { clangBeginnerRoadmapData } from "@/data/clangBeginnerRoadmap";
import { migrateRoadmapProgress } from "@/features/roadmaps/lib/progressApi";

// Resolve full roadmap data from a stored roadmapId — mirrors NewOnboardingV3 + RoadmapTemplate logic.
function resolveRoadmapData(roadmapId, role) {
  if (!roadmapId) return null;
  if (roadmapId === "git-github") return gitGithubRoadmapData;
  if (roadmapId === "cpp") return cppRoadmapData;
  if (roadmapId === "system-design-fundamentals") return systemDesignRoadmapData;
  if (roadmapId === "python-beginner") return pythonBeginnerRoadmapData;
  if (roadmapId === "c-beginner") return clangBeginnerRoadmapData;
  if (roadmapId.startsWith("prompt-engineering"))
    return getPromptEngineeringRoadmapByRole(role);
  if (roadmapId.startsWith("dsa")) return getDsaRoadmapByRole(role);
  return null;
}

export default function Dashboard({ isPreview = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();
  const { user } = useAuth();

  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingCertificate, setPendingCertificate] = useState(null);

  // ponytail: handle pending certificate animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const pending = localStorage.getItem("ignitio:pending_certificate_animation");
        if (pending) {
          setPendingCertificate(JSON.parse(pending));
          localStorage.removeItem("ignitio:pending_certificate_animation");
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const redirects = {
    GitGithub: isPreview
      ? "/preview/roadmaps/git-github"
      : "/home/roadmaps/git-github",
    CPP: isPreview ? "/preview/roadmaps/cpp" : "/home/roadmaps/cpp",
    PromptEngineering: isPreview
      ? "/preview/roadmaps/prompt-engineering"
      : "/home/roadmaps/prompt-engineering",
    SystemDesign: isPreview
      ? "/preview/roadmaps/system-design-fundamentals"
      : "/home/roadmaps/system-design-fundamentals",
    Python: isPreview
      ? "/preview/roadmaps/python-beginner"
      : "/home/roadmaps/python-beginner",
    CLang: isPreview
      ? "/preview/roadmaps/c-beginner"
      : "/home/roadmaps/c-beginner",
  };

  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(
    genericPromptEngineeringRoadmapData,
  );
  const [userRole, setUserRole] = useState("other");
  const [selectedDsaRoadmap, setSelectedDsaRoadmap] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      let role = "other";
      if (isPreview) {
        role = localStorage.getItem("profession") || "other";
      } else if (user) {
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
            role = "other";
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
      } else {
        role = "other";
      }
      setUserRole(role);
      setSelectedPromptRoadmap(getPromptEngineeringRoadmapByRole(role));
      setSelectedDsaRoadmap(getDsaRoadmapByRole(role));

      // Migrate preview progress to MongoDB now that user + role are confirmed.
      // This is the right moment: auth is settled, profile exists, role is known.
      // Only runs for authenticated users coming from the preview funnel.
      if (!isPreview && user) {
        try {
          const raw =
            typeof window !== "undefined" &&
            localStorage.getItem("ignitio:preview_payload");
          if (raw) {
            const { roadmapId, completedLevels: previewCompleted } =
              JSON.parse(raw);
            const roadmapData = resolveRoadmapData(roadmapId, role);
            if (
              roadmapData &&
              Array.isArray(previewCompleted) &&
              previewCompleted.length > 0
            ) {
              const allLevels = roadmapData.days.flatMap((d) => d.levels);
              const validIds = new Set(allLevels.map((l) => l.id));
              const validCompleted = previewCompleted.filter((id) =>
                validIds.has(id),
              );
              if (validCompleted.length > 0) {
                await migrateRoadmapProgress({
                  user,
                  roadmapSlug: roadmapData.id,
                  payload: {
                    roadmapTitle: roadmapData.title || "",
                    role,
                    totalLevels: allLevels.length,
                    allLevelIds: allLevels.map((l) => l.id),
                    days: roadmapData.days.map((d) => ({
                      id: d.id,
                      levelIds: d.levels.map((l) => l.id),
                    })),
                    completedLevels: validCompleted,
                    passedAssignments: [],
                  },
                });
              }
            }
            localStorage.removeItem("ignitio:preview_payload");
          }
        } catch (migrationErr) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[preview migration] Failed:", migrationErr?.message);
          }
          // Non-fatal — RoadmapTemplate's lazy migration is the safety net
        }
      }
    };

    if (isPreview || user !== undefined) {
      fetchUserRole();
    }
  }, [user, isPreview, router]);

  useEffect(() => {
    setIsClient(true);
    let bestRoadmap = null;
    let highestCompleted = 0;

    const roadmapsData = [
      {
        id: "git-github",
        title: gitGithubRoadmapData.title,
        route: redirects.GitGithub,
        totalLevels: gitGithubRoadmapData.days.flatMap((day) => day.levels)
          .length,
        legacySections: ["beginner", "intermediate", "advanced"],
      },
      {
        id: "cpp",
        title: cppRoadmapData.title,
        route: redirects.CPP,
        totalLevels: cppRoadmapData.days.flatMap((day) => day.levels).length,
        legacySections: ["beginner", "intermediate", "advanced"],
      },
      {
        id: selectedPromptRoadmap.id,
        title: selectedPromptRoadmap.title,
        route: redirects.PromptEngineering,
        totalLevels: selectedPromptRoadmap.days.flatMap((day) => day.levels)
          .length,
        legacySections: [],
      },
    ];

    if (selectedDsaRoadmap && isDsaAllowedRole(userRole)) {
      roadmapsData.push({
        id: selectedDsaRoadmap.id,
        title: selectedDsaRoadmap.title,
        route: isPreview ? "/preview/roadmaps/dsa" : "/home/roadmaps/dsa",
        totalLevels: selectedDsaRoadmap.days.flatMap((day) => day.levels)
          .length,
        legacySections: [],
      });
    }

    roadmapsData.push({
      id: systemDesignRoadmapData.id,
      title: systemDesignRoadmapData.title,
      route: redirects.SystemDesign,
      totalLevels: systemDesignRoadmapData.days.flatMap((day) => day.levels)
        .length,
      legacySections: [],
    });

    roadmapsData.push({
      id: pythonBeginnerRoadmapData.id,
      title: pythonBeginnerRoadmapData.title,
      route: redirects.Python,
      totalLevels: pythonBeginnerRoadmapData.days.flatMap((day) => day.levels)
        .length,
      legacySections: [],
    });

    roadmapsData.push({
      id: clangBeginnerRoadmapData.id,
      title: clangBeginnerRoadmapData.title,
      route: redirects.CLang,
      totalLevels: clangBeginnerRoadmapData.days.flatMap((day) => day.levels)
        .length,
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
      roadmap.progressPercent = Math.round(
        (completedLevelsCount / roadmap.totalLevels) * 100,
      );
      progressMap[roadmap.id] = {
        completed: completedLevelsCount,
        total: roadmap.totalLevels,
      };

      // Track roadmap with the highest completion count (must be > 0)
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
        if (parsed && parsed.id) {
          lastActiveRoadmapId = parsed.id;
        }
      }
    } catch (e) {}

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
  }, [selectedPromptRoadmap, selectedDsaRoadmap, userRole]);

  const handleRedirectGitGithub = () => {
    router.push(redirects.GitGithub);
  };
  const handleRedirectCPP = () => {
    router.push(redirects.CPP);
  };
  const handleRedirectPromptEngineering = () => {
    router.push(redirects.PromptEngineering);
  };
  const handleRedirectDsa = () => {
    router.push(isPreview ? "/preview/roadmaps/dsa" : "/home/roadmaps/dsa");
  };
  const handleRedirectSystemDesign = () => {
    router.push(redirects.SystemDesign);
  };
  const handleRedirectPython = () => {
    router.push(redirects.Python);
  };
  const handleRedirectCLang = () => {
    router.push(redirects.CLang);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header Section */}
        {!isPreview && (
          <div className="mb-12">
            <Profile />
          </div>
        )}

        {/* Continue Learning Banner */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-shadow hover:shadow-md">
          <div>
            <span className="text-xs md:text-sm font-bold text-[#06b6d4] tracking-widest uppercase mb-3 block">
              {activeRoadmap
                ? "Resume Course"
                : "Choose a roadmap and begin learning."}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {activeRoadmap
                ? activeRoadmap.title
                : "Start Your Learning Journey"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-48 md:w-64 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#06b6d4] rounded-full shadow-sm transition-all duration-500"
                  style={{
                    width: `${isClient && activeRoadmap ? activeRoadmap.progressPercent : 0}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-500">
                {isClient && activeRoadmap ? activeRoadmap.progressPercent : 0}%
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (isNavigating) return;
              const targetRoute = activeRoadmap ? activeRoadmap.route : "/home";
              if (pathname === targetRoute) return;

              setIsNavigating(true);
              posthog?.capture("dashboard_navigation_clicked", {
                target_route: targetRoute,
                roadmap_id: activeRoadmap ? activeRoadmap.id : null,
              });
              router.push(targetRoute);

              setTimeout(() => setIsNavigating(false), 3000);
            }}
            disabled={isNavigating || !activeRoadmap}
            className={`px-8 py-4 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-95 shrink-0 ${
              isNavigating || !activeRoadmap
                ? "bg-[var(--color-secondary-100)] text-[var(--color-secondary-500)] cursor-not-allowed"
                : "bg-[var(--color-secondary-900)] hover:bg-[var(--color-secondary-800)] hover:shadow-lg"
            }`}
          >
            {isNavigating
              ? "Loading..."
              : activeRoadmap
                ? "Continue Learning"
                : "Explore Roadmaps"}
          </button>
        </div>

        {/* Certificates Section */}
        <CertificateDashboardSection />

        {/* Explore Topics */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Explore Roadmaps
            </h2>
          </div>

          <div className="flex flex-col items-center gap-10 w-full">
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <SystemDesignCourseCard
                onClick={handleRedirectSystemDesign}
                levelsFinished={
                  roadmapProgress[systemDesignRoadmapData.id]?.completed || 0
                }
                totalLevels={
                  roadmapProgress[systemDesignRoadmapData.id]?.total ||
                  systemDesignRoadmapData.days.flatMap((day) => day.levels)
                    .length
                }
              />
            </div>
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <PythonCourseCard
                onClick={handleRedirectPython}
                levelsFinished={
                  roadmapProgress[pythonBeginnerRoadmapData.id]?.completed || 0
                }
                totalLevels={
                  roadmapProgress[pythonBeginnerRoadmapData.id]?.total ||
                  pythonBeginnerRoadmapData.days.flatMap((day) => day.levels)
                    .length
                }
              />
            </div>
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <CCourseCard
                onClick={handleRedirectCLang}
                levelsFinished={
                  roadmapProgress[clangBeginnerRoadmapData.id]?.completed || 0
                }
                totalLevels={
                  roadmapProgress[clangBeginnerRoadmapData.id]?.total ||
                  clangBeginnerRoadmapData.days.flatMap((day) => day.levels)
                    .length
                }
              />
            </div>
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <PromptEngineeringCourseCard
                onClick={handleRedirectPromptEngineering}
                levelsFinished={
                  roadmapProgress[selectedPromptRoadmap.id]?.completed || 0
                }
                totalLevels={
                  roadmapProgress[selectedPromptRoadmap.id]?.total ||
                  selectedPromptRoadmap.days.flatMap((day) => day.levels).length
                }
                roadmapData={selectedPromptRoadmap}
              />
            </div>
            {isDsaAllowedRole(userRole) && selectedDsaRoadmap && (
              <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
                <DsaCourseCard
                  onClick={handleRedirectDsa}
                  levelsFinished={
                    roadmapProgress[selectedDsaRoadmap.id]?.completed || 0
                  }
                  totalLevels={
                    roadmapProgress[selectedDsaRoadmap.id]?.total ||
                    selectedDsaRoadmap.days.flatMap((day) => day.levels).length
                  }
                  roadmapData={selectedDsaRoadmap}
                />
              </div>
            )}
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <CppCourseCard
                onClick={handleRedirectCPP}
                levelsFinished={roadmapProgress["cpp"]?.completed || 0}
                totalLevels={
                  roadmapProgress["cpp"]?.total ||
                  cppRoadmapData.days.flatMap((day) => day.levels).length
                }
              />
            </div>
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <GitCourseCard
                onClick={handleRedirectGitGithub}
                levelsFinished={roadmapProgress["git-github"]?.completed || 0}
                totalLevels={
                  roadmapProgress["git-github"]?.total ||
                  gitGithubRoadmapData.days.flatMap((day) => day.levels).length
                }
              />
            </div>
          </div>
        </div>
      </div>
      {pendingCertificate && (
        <CertificateUnlockedModal
          certificate={pendingCertificate}
          onClose={() => setPendingCertificate(null)}
        />
      )}
    </div>
  );
}
