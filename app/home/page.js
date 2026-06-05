"use client";
import { useState, useEffect } from "react";
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import { useRouter } from "next/navigation";
import Profile from "@/layout/Profile";
import CppCourseCard from "../../components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
import { useAuth } from "@/features/context/AuthContext";
import { getPromptEngineeringRoadmapByRole, promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData } from "@/data/promptEngineering";
import { gitGithubRoadmapData } from "@/data/gitGithubCourseData";
import { cppRoadmapData } from "@/data/cppCourseData";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const redirects = {
    GitGithub: "/home/roadmaps/git-github",
    CPP: "/home/roadmaps/cpp",
    PromptEngineering: "/home/roadmaps/prompt-engineering",
  };

  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(genericPromptEngineeringRoadmapData);

  useEffect(() => {
    const fetchUserRole = async () => {
      let role = "other";
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/v2/user", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            role = data.user?.role || "other";
          } else {
            role = localStorage.getItem("profession") || "other";
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          role = localStorage.getItem("profession") || "other";
        }
      } else {
        role = localStorage.getItem("profession") || "other";
      }
      setSelectedPromptRoadmap(getPromptEngineeringRoadmapByRole(role));
    };
    
    if (user !== undefined) {
      fetchUserRole();
    }
  }, [user]);

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
        totalLevels: selectedPromptRoadmap.days.flatMap(
          (day) => day.levels,
        ).length,
        legacySections: [],
      },
    ];

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

    setRoadmapProgress(progressMap);
    setActiveRoadmap(bestRoadmap);
  }, [selectedPromptRoadmap]);

  const handleRedirectGitGithub = () => {
    router.push(redirects.GitGithub);
  };
  const handleRedirectCPP = () => {
    router.push(redirects.CPP);
  };
  const handleRedirectPromptEngineering = () => {
    router.push(redirects.PromptEngineering);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header Section */}
        <div className="mb-12">
          <Profile />
        </div>

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
              if (activeRoadmap) {
                router.push(activeRoadmap.route);
              } else {
                router.push("/home");
              }
            }}
            className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            {activeRoadmap ? "Continue Learning" : "Explore Roadmaps"}
          </button>
        </div>

        {/* Explore Topics */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Explore Roadmaps
            </h2>
          </div>

          <div className="flex flex-col items-center gap-10 w-full">
            <div className="w-full flex justify-center transition-transform hover:-translate-y-2 duration-300">
              <PromptEngineeringCourseCard
                onClick={handleRedirectPromptEngineering}
                levelsFinished={
                  roadmapProgress[selectedPromptRoadmap.id]?.completed || 0
                }
                totalLevels={
                  roadmapProgress[selectedPromptRoadmap.id]?.total ||
                  selectedPromptRoadmap.days.flatMap((day) => day.levels)
                    .length
                }
                roadmapData={selectedPromptRoadmap}
              />
            </div>
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
    </div>
  );
}
