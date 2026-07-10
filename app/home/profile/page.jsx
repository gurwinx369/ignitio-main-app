"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { User, Flame, Award, BookOpen, Clock, ShieldCheck, Mail, ArrowLeft, Image as ImageIcon, Edit2, X, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUnlockedCertificates } from "@/features/certificates/certificateStorage";
import CertificateCard from "@/features/certificates/CertificateCard";

const BANNER_COLORS = {
  cyan: "from-cyan-100 via-sky-100 to-blue-100",
  blue: "from-blue-100 via-sky-100 to-cyan-100",
  purple: "from-violet-100 via-purple-100 to-fuchsia-100",
  orange: "from-orange-100 via-amber-100 to-yellow-100",
  green: "from-emerald-100 via-green-100 to-teal-100",
  slate: "from-slate-100 via-slate-50 to-zinc-100"
  /*cyan: { New format
    label: "Cyan",
    gradient: "from-cyan-100 via-sky-100 to-blue-100",
    image: "/profile/banners/cyan-game.webp",
  },*/
};

const AVATAR_PRESETS = {
  /*default: {
    label: "Default",
    className: "bg-cyan-100 text-cyan-700",
    image: null,
  },*/
  default: "bg-cyan-100 text-cyan-700",
  spark: "bg-amber-100 text-amber-700",
  phoenix: "bg-orange-100 text-orange-700",
  learner: "bg-emerald-100 text-emerald-700",
  builder: "bg-blue-100 text-blue-700",
  creator: "bg-purple-100 text-purple-700"
};

const AVATAR_FRAMES = {
  //cyan: "/profile/rings/cyan-ring.png",
  cyan: "border-cyan-200 shadow-cyan-100",
  blue: "border-blue-200 shadow-blue-100",
  purple: "border-purple-200 shadow-purple-100",
  orange: "border-orange-200 shadow-orange-100",
  green: "border-emerald-200 shadow-emerald-100",
  slate: "border-slate-200 shadow-slate-100",
  gold: "border-amber-300 shadow-amber-100",
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localCertificates, setLocalCertificates] = useState([]);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    avatarPreset: "default",
    bannerColor: "cyan",
    avatarFrame: "cyan"
  });

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

  const loadCertificates = () => {
    const certs = getUnlockedCertificates();
    certs.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    setLocalCertificates(certs);
  };

  useEffect(() => {
    if (!loading) {
      loadCertificates();
    }
  }, [loading]);

  const handleEditClick = () => {
    setEditForm({
      displayName: profileData.displayName || "",
      bio: profileData.bio || "",
      avatarUrl: profileData.avatarUrl || "",
      avatarPreset: profileData.avatarPreset || "default",
      bannerColor: profileData.bannerColor || "cyan",
      avatarFrame: profileData.avatarFrame || "cyan"
    });
    setEditError("");
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setEditError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/v2/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setProfileData({ ...profileData, ...data.profile });
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <div className="w-32 h-10 bg-slate-200 rounded-full mb-6"></div>
        <div className="w-full h-32 md:h-48 bg-slate-200 rounded-3xl mb-12"></div>
        <div className="relative -mt-20 ml-6 md:ml-10 flex items-end gap-4 mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-300 border-4 border-white"></div>
          <div className="pb-2 space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-100 rounded-3xl p-6 h-48 border border-slate-200"></div>
          <div className="bg-slate-100 rounded-3xl p-6 md:col-span-2 h-48 border border-slate-200"></div>
        </div>
        <div className="bg-slate-100 rounded-3xl p-6 h-24 w-full border border-slate-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-100 rounded-3xl p-6 h-48 border border-slate-200"></div>
          <div className="bg-slate-100 rounded-3xl p-6 h-48 border border-slate-200"></div>
        </div>
        <div className="bg-slate-100 rounded-3xl p-6 h-64 w-full border border-slate-200"></div>
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

  const { email, role, currentRoadmap, joinedAt, streak, stats, bio, displayName, avatarUrl, avatarPreset, bannerColor, avatarFrame } = profileData;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const isAtRisk = streak?.status === "at_risk";
  const displayBannerClass = BANNER_COLORS[bannerColor || "cyan"] || BANNER_COLORS.cyan;
  const displayAvatarPresetClass = AVATAR_PRESETS[avatarPreset || "default"] || AVATAR_PRESETS.default;
  const displayAvatarFrameClass = AVATAR_FRAMES[avatarFrame || "cyan"] || AVATAR_FRAMES.cyan;
  const nameToDisplay = displayName || user.displayName || "Adventurer";

  const renderAvatar = (url, presetClass, fbPhoto) => {
    if (url) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt="Avatar" className="rounded-full object-cover w-full h-full" />;
    }
    if ((!avatarPreset || avatarPreset === "default") && fbPhoto) {
      return <Image src={fbPhoto} alt="Avatar" width={96} height={96} className="rounded-full object-cover w-full h-full" />;
    }
    return (
      <div className={`w-full h-full flex items-center justify-center ${presetClass}`}>
        <User className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.5} />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/home" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <button onClick={handleEditClick} className="inline-flex items-center gap-2 rounded-full bg-cyan-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-cyan-700 hover:shadow-md">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Banner / Header */}
      <div className="relative mb-12">
        <div className={`w-full h-32 md:h-48 bg-gradient-to-r ${displayBannerClass} rounded-3xl overflow-hidden shadow-sm flex items-center justify-center`}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <ImageIcon className="w-12 h-12 text-white/40 mix-blend-overlay" />
        </div>

        <div className="absolute -bottom-8 left-6 md:left-10 flex items-end gap-4">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full shadow-md border-4 bg-white overflow-hidden ${displayAvatarFrameClass}`}>
            {renderAvatar(avatarUrl, displayAvatarPresetClass, user.photoURL)}
          </div>
          <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{nameToDisplay}</h1>
          </div>
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

      {/* Bio Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Bio
        </h2>
        {bio ? (
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{bio}</p>
        ) : (
          <p className="text-slate-400 italic">Add a short bio to personalize your profile.</p>
        )}
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

      {/* Cards/Certificates Section */}
      <div className="bg-[#fffaf3] border border-[#f1e4d2] rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Award className="w-4 h-4" /> Your Collection
        </h2>

        {localCertificates && localCertificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {localCertificates.map((cert) => (
              <CertificateCard
                key={`${cert.roadmapFamily}-${cert.certificateKey}`}
                certificate={cert}
                onUpdate={loadCertificates}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border border-white border-dashed rounded-2xl p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No cards unlocked yet. Complete lessons to start earning them.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {editError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                  {editError}
                </div>
              )}

              {/* Display Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  maxLength={40}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-shadow"
                  placeholder="Your name"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  maxLength={180}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-slate-500 text-right mt-1">{editForm.bio.length}/180</p>
              </div>

              {/* Banner Preset */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Banner Color</label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(BANNER_COLORS).map(([key, bgClass]) => (
                    <button
                      key={key}
                      onClick={() => setEditForm({ ...editForm, bannerColor: key })}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${bgClass} shadow-sm border-2 transition-transform hover:scale-105 flex items-center justify-center
                        ${editForm.bannerColor === key ? 'border-cyan-600 scale-105' : 'border-transparent'}`}
                    >
                      {editForm.bannerColor === key && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Avatar URL (Optional)</label>
                <input
                  type="text"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-shadow text-sm"
                  placeholder="https://..."
                />
              </div>

              {/* Avatar Preset */}
              {!editForm.avatarUrl && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Avatar Theme</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(AVATAR_PRESETS).map(([key, presetClass]) => (
                      <button
                        key={key}
                        onClick={() => setEditForm({ ...editForm, avatarPreset: key })}
                        className={`w-12 h-12 rounded-full shadow-sm border-2 transition-transform hover:scale-105 flex items-center justify-center overflow-hidden
                          ${editForm.avatarPreset === key ? 'border-cyan-600 scale-105' : 'border-transparent'}
                          ${presetClass}`}
                      >
                        {key === 'default' && user.photoURL ? (
                          <Image src={user.photoURL} alt="Avatar" width={48} height={48} className="rounded-full object-cover w-full h-full" />
                        ) : (
                          <User className="w-5 h-5" strokeWidth={2.5} />
                        )}
                        {editForm.avatarPreset === key && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Avatar Frame */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Avatar Frame</label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(AVATAR_FRAMES).map(([key, frameClass]) => (
                    <button
                      key={key}
                      onClick={() => setEditForm({ ...editForm, avatarFrame: key })}
                      className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform hover:scale-105 flex items-center justify-center bg-white
                        ${frameClass}
                        ${editForm.avatarFrame === key ? 'scale-110 ring-2 ring-cyan-500 ring-offset-2' : ''}`}
                    >
                      {editForm.avatarFrame === key && <Check className="w-5 h-5 text-slate-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
