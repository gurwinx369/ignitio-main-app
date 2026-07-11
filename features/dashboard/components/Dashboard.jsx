'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import GitCourseCard from "@/components/ui/courseCards/git-course-card";
import CppCourseCard from "@/components/ui/courseCards/cpp-course-card";
import PromptEngineeringCourseCard from "@/components/ui/courseCards/prompt-engineering-course-card";
import DsaCourseCard from "@/components/ui/courseCards/dsa-course-card";
import { useAuth } from "@/features/context/AuthContext";
import { getPromptEngineeringRoadmapByRole, promptEngineeringRoadmapData as genericPromptEngineeringRoadmapData } from "@/data/promptEngineering";
import { gitGithubRoadmapData } from "@/data/gitGithubCourseData";
import { cppRoadmapData } from "@/data/cppCourseData";
import { getDsaRoadmapByRole, isDsaAllowedRole } from "@/data/dsa";
import { Home, BookOpen, User, Flame, MessageSquare, Target, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();
  const { user } = useAuth();

  const currentRoadmapRef = useRef(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");

  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [selectedPromptRoadmap, setSelectedPromptRoadmap] = useState(genericPromptEngineeringRoadmapData);
  const [userRole, setUserRole] = useState("other");
  const [selectedDsaRoadmap, setSelectedDsaRoadmap] = useState(null);

  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const redirects = {
    GitGithub: "/home/roadmaps/git-github",
    CPP: "/home/roadmaps/cpp",
    PromptEngineering: "/home/roadmaps/prompt-engineering",
  };

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
            headers: { Authorization: `Bearer ${token}` }
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
          console.error("Failed to fetch user role:", error?.message);
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
      {
        id: selectedPromptRoadmap.id,
        title: selectedPromptRoadmap.title,
        route: redirects.PromptEngineering,
        totalLevels: selectedPromptRoadmap.days.flatMap((day) => day.levels).length,
        legacySections: [],
      },
    ];

    if (selectedDsaRoadmap && isDsaAllowedRole(userRole)) {
      roadmapsData.push({
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
          if (Array.isArray(parsed)) completedLevelsCount = parsed.length;
        } catch (e) { }
      } else if (roadmap.legacySections && roadmap.legacySections.length > 0) {
        for (const section of roadmap.legacySections) {
          const key = `progress_${roadmap.id}_${section}`;
          const legacySaved = localStorage.getItem(key);
          if (legacySaved) {
            try {
              const parsed = JSON.parse(legacySaved);
              if (Array.isArray(parsed)) completedLevelsCount += parsed.length;
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
      const savedLastActive = localStorage.getItem("ignitio:last_active_roadmap");
      if (savedLastActive) {
        const parsed = JSON.parse(savedLastActive);
        if (parsed && parsed.id) lastActiveRoadmapId = parsed.id;
      }
    } catch (e) { }

    let activeRoadmapToSet = bestRoadmap;
    if (lastActiveRoadmapId) {
      const foundLastActive = roadmapsData.find(r => r.id === lastActiveRoadmapId);
      if (foundLastActive) activeRoadmapToSet = foundLastActive;
    }

    setRoadmapProgress(progressMap);
    setActiveRoadmap(activeRoadmapToSet);
  }, [selectedPromptRoadmap, selectedDsaRoadmap, userRole]);

  const handleRedirectGitGithub = () => router.push(redirects.GitGithub);
  const handleRedirectCPP = () => router.push(redirects.CPP);
  const handleRedirectPromptEngineering = () => router.push(redirects.PromptEngineering);
  const handleRedirectDsa = () => router.push("/home/roadmaps/dsa");

  const displayName = profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || "Adventurer";
  const streak = profileData?.streak;

  const scrollToRoadmap = () => {
    setActiveTab("roadmap");
    if (currentRoadmapRef.current) {
      currentRoadmapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    setActiveTab("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] pb-24 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* A. Welcome Row & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex">
              <MessageSquare className="w-4 h-4 shrink-0" /> <span className="truncate">Feedback</span>
            </button>
            <button
              onClick={scrollToRoadmap}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-[#06b6d4]/10 text-[#0891b2] rounded-xl shadow-sm text-sm font-bold hover:bg-[#06b6d4]/20 transition-colors flex"
            >
              <Target className="w-4 h-4 shrink-0" /> <span className="truncate">Daily Task</span>
            </button>
          </div>
        </div>

        {/* B. Streak Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Your Streak
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left side: Weekly calendar & Earn-Back */}
            <div className="flex-1">
              {isLoadingProfile ? (
                <div className="animate-pulse flex gap-2 h-16 bg-slate-100 rounded-2xl w-full mb-4"></div>
              ) : streak?.week ? (
                <div className="flex justify-between w-full pb-2">
                  {streak.week.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold ${day.isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                        {day.dayLabel}
                      </span>
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                        ${day.status === 'today_done' || day.status === 'completed' ? 'bg-green-100 text-green-600' :
                          day.status === 'today_pending' ? 'bg-white border-2 border-slate-200 text-slate-300' :
                            day.status === 'freeze_used' ? 'bg-blue-100 text-blue-500' :
                              day.status === 'missed' ? 'bg-slate-100 text-slate-300' :
                                'bg-slate-50 text-slate-200'}`}
                      >
                        {day.status === 'today_done' || day.status === 'completed' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> :
                          day.status === 'freeze_used' ? <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> :
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-current"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-16 flex items-center text-slate-500 text-sm italic mb-4">Start learning to build your streak.</div>
              )}

              {streak?.earnBack?.active && streak.earnBack.countAtRisk > 0 && (() => {
                const lessonsLeft = typeof streak.earnBack.lessonsRemaining === "number"
                  ? streak.earnBack.lessonsRemaining
                  : Math.max(0, 2 - (streak.earnBack.lessonsCompletedInWindow || 0));
                const msg = lessonsLeft === 1
                  ? `Complete 1 more lesson to restore your ${streak.earnBack.countAtRisk}-day streak.`
                  : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streak.earnBack.countAtRisk}-day streak.`;
                return (
                  <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-700 flex gap-3 items-start">
                    <Flame className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{msg}</p>
                  </div>
                );
              })()}
            </div>

            {/* Right side: Today Panel */}
            <div className="lg:w-72 shrink-0 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${streak?.status === 'completed' || streak?.status === 'today_done' ? 'bg-green-100 text-green-700' :
                  streak?.status === 'at_risk' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                  {streak?.status === 'completed' || streak?.status === 'today_done' ? 'Done' :
                    streak?.status === 'at_risk' ? 'At Risk' : 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white py-3 px-1 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-900 leading-none mb-1">{streak?.currentCount || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Current</p>
                </div>
                <div className="bg-white py-3 px-1 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-900 leading-none mb-1">{streak?.longestCount || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Longest</p>
                </div>
                <div className="bg-white py-3 px-1 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-900 leading-none mb-1">{streak?.freezeBank || 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Freezes</p>
                </div>
              </div>

              <Link href="/home/profile" className="text-sm font-bold text-[#06b6d4] hover:text-[#0891b2] transition-colors flex items-center justify-between mt-2 pt-4 border-t border-slate-200">
                View full history <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* C. Daily Task Progress Bar */}
        <div ref={currentRoadmapRef} className="scroll-mt-8 mb-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-shadow hover:shadow-md">
            <div className="flex-1 w-full">
              <span className="text-xs md:text-sm font-bold text-[#06b6d4] tracking-widest uppercase mb-2 block">
                {activeRoadmap ? "Today's Task" : "Choose a roadmap"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
                {activeRoadmap ? `Continue ${activeRoadmap.title}` : "Start Your Learning Journey"}
              </h2>
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 max-w-md h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#06b6d4] rounded-full shadow-sm transition-all duration-500"
                    style={{ width: `${isClient && activeRoadmap ? activeRoadmap.progressPercent : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-slate-500 shrink-0">
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
              disabled={isNavigating}
              className={`w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-md active:scale-95 shrink-0 ${isNavigating ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isNavigating ? "Loading..." : (activeRoadmap ? "Continue" : "Explore")}
            </button>
          </div>
        </div>

        {/* D. Three-button Navigation Bar */}
        <div className="mx-auto w-full max-w-[480px] mb-8">
          <div className="grid grid-cols-3 gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => {
                if (activeRoadmap) {
                  router.push(activeRoadmap.route);
                } else {
                  scrollToRoadmap();
                }
              }}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <BookOpen className="w-4 h-4 shrink-0 hidden sm:block" />
              <span className="truncate">Current Roadmap</span>
            </button>
            <button
              onClick={scrollToTop}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors bg-slate-900 text-white shadow-sm"
            >
              <Home className="w-4 h-4 shrink-0 hidden sm:block" />
              <span className="truncate">Home</span>
            </button>
            <button
              onClick={() => router.push("/home/profile")}
              className="min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <User className="w-4 h-4 shrink-0 hidden sm:block" />
              <span className="truncate">Profile</span>
            </button>
          </div>
        </div>

        {/* E. Courses List */}
        <section className="mb-12 w-full">
          <h2 className="mb-6 text-left text-2xl font-bold text-slate-900">Available Roadmaps</h2>
          <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-6">
            <div className="flex w-full justify-center">
              <div className="mx-auto flex w-full max-w-[760px] justify-center [&>*]:mx-auto">
                <PromptEngineeringCourseCard
                  onClick={handleRedirectPromptEngineering}
                  levelsFinished={roadmapProgress[selectedPromptRoadmap.id]?.completed || 0}
                  totalLevels={roadmapProgress[selectedPromptRoadmap.id]?.total || selectedPromptRoadmap.days.flatMap((day) => day.levels).length}
                  roadmapData={selectedPromptRoadmap}
                />
              </div>
            </div>
            {isDsaAllowedRole(userRole) && selectedDsaRoadmap && (
              <div className="flex w-full justify-center">
                <div className="mx-auto flex w-full max-w-[760px] justify-center [&>*]:mx-auto">
                  <DsaCourseCard
                    onClick={handleRedirectDsa}
                    levelsFinished={roadmapProgress[selectedDsaRoadmap.id]?.completed || 0}
                    totalLevels={roadmapProgress[selectedDsaRoadmap.id]?.total || selectedDsaRoadmap.days.flatMap((day) => day.levels).length}
                    roadmapData={selectedDsaRoadmap}
                  />
                </div>
              </div>
            )}
            <div className="flex w-full justify-center">
              <div className="mx-auto flex w-full max-w-[760px] justify-center [&>*]:mx-auto">
                <CppCourseCard
                  onClick={handleRedirectCPP}
                  levelsFinished={roadmapProgress["cpp"]?.completed || 0}
                  totalLevels={roadmapProgress["cpp"]?.total || cppRoadmapData.days.flatMap((day) => day.levels).length}
                />
              </div>
            </div>
            <div className="flex w-full justify-center">
              <div className="mx-auto flex w-full max-w-[760px] justify-center [&>*]:mx-auto">
                <GitCourseCard
                  onClick={handleRedirectGitGithub}
                  levelsFinished={roadmapProgress["git-github"]?.completed || 0}
                  totalLevels={roadmapProgress["git-github"]?.total || gitGithubRoadmapData.days.flatMap((day) => day.levels).length}
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
