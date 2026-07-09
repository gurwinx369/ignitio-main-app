"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { Loader2, User, Flame, Award, BookOpen, Clock, ShieldCheck, Mail } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return;
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/v2/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        setProfileData(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const { email, role, currentRoadmap, joinedAt, streak, stats, badges } = profileData;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const isAtRisk = streak?.status === "at_risk";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-sm">
          {user.photoURL ? (
            <Image src={user.photoURL} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8" strokeWidth={2.5} />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 font-medium">{user.displayName || "Adventurer"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Account Details */}
        <div className="bg-[#fffaf3] border border-[#f1e4d2] rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <User className="w-4 h-4" /> Account
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="text-slate-800 font-semibold truncate max-w-[200px]" title={email}>{email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Role</p>
                <p className="text-slate-800 font-semibold capitalize">{role || "Student"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Joined</p>
                <p className="text-slate-800 font-semibold">{formatDate(joinedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Details */}
        <div className={`border rounded-3xl p-6 shadow-sm md:col-span-2 ${isAtRisk ? 'bg-orange-50 border-orange-200' : 'bg-[#fffaf3] border-[#f1e4d2]'}`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Flame className={`w-4 h-4 ${streak?.todayCompleted ? 'text-orange-500' : 'text-slate-400'}`} /> 
              Learning Streak
            </h2>
            {isAtRisk && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider">
                At Risk
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
              <p className="text-3xl font-black text-orange-500 mb-1">{streak?.currentCount || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current</p>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
              <p className="text-3xl font-black text-slate-700 mb-1">{streak?.longestCount || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Longest</p>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
              <p className="text-3xl font-black text-cyan-600 mb-1">{streak?.freezeBank || 0}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Freezes</p>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm flex flex-col justify-center items-center">
              {streak?.todayCompleted ? (
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5" />
                </div>
              )}
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {streak?.todayCompleted ? "Done Today" : "Pending"}
              </p>
            </div>
          </div>
          {isAtRisk && streak?.earnBack && (
            <div className="mt-4 text-sm text-orange-700 font-medium bg-orange-100/50 p-3 rounded-xl border border-orange-200/50">
              Complete {2 - streak.earnBack.lessonsCompletedInWindow} more lesson(s) to save your streak of {streak.earnBack.countAtRisk}!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Stats */}
        <div className="bg-[#fffaf3] border border-[#f1e4d2] rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Lifetime Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#f1e4d2]/50 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{stats?.completedLevels || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Lessons Completed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#f1e4d2]/50 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{stats?.passedAssignments || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Assignments Passed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#f1e4d2]/50 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{stats?.roadmapsStarted || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Roadmaps Started</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#f1e4d2]/50 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{stats?.roadmapsCompleted || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Roadmaps Finished</p>
            </div>
          </div>
        </div>

        {/* Current Roadmap */}
        <div className="bg-[#fffaf3] border border-[#f1e4d2] rounded-3xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Award className="w-4 h-4" /> Current Roadmap
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/50 rounded-2xl border border-white border-dashed">
            {currentRoadmap ? (
              <>
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm rotate-3">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 capitalize">
                  {currentRoadmap.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">Keep up the great work!</p>
              </>
            ) : (
              <div className="text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No active roadmap</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-[#fffaf3] border border-[#f1e4d2] rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Award className="w-4 h-4" /> Your Collection
        </h2>
        
        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-[#f1e4d2]/50 shadow-sm text-center group hover:-translate-y-1 transition-transform duration-200">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full mb-3 overflow-hidden relative">
                  {badge.imageURL ? (
                    <Image src={badge.imageURL} alt={badge.name} fill className="object-cover" />
                  ) : (
                    <Award className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{badge.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                  {badge.unlockedAt ? formatDate(badge.unlockedAt) : 'Unlocked'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border border-white border-dashed rounded-2xl p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No cards unlocked yet. Complete lessons to start earning them.</p>
          </div>
        )}
      </div>

    </div>
  );
}
