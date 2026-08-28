"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { User, Flame, Award, BookOpen, Clock, ShieldCheck, Mail, ArrowLeft, Edit2, X, Check, Loader2, CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getUnlockedCertificates } from "@/features/certificates/certificateStorage";
import CertificateCard from "@/features/certificates/CertificateCard";
import { resolveCertificateTemplate } from "@/features/certificates/CertificateCanvas";
import StreakCalendarModal from "@/features/dashboard/components/StreakCalendarModal";

const BANNER_PRESETS = {
  cyan: {
    label: "Cyan",
    gradient: "from-cyan-100 via-sky-100 to-blue-100",
    image: "/profile/banners/banner1.webp",
  },
  blue: {
    label: "Blue",
    gradient: "from-blue-100 via-sky-100 to-cyan-100",
    image: "/profile/banners/banner2.webp",
  },
  purple: {
    label: "Purple",
    gradient: "from-violet-100 via-purple-100 to-fuchsia-100",
    image: "/profile/banners/banner3.webp",
  },
  // Frontend option is hidden until it is ready.
  /*orange: {
    label: "Orange",
    gradient: "from-orange-100 via-amber-100 to-yellow-100",
    image: "/profile/banners/banner4.webp",
  },
  green: {
    label: "Green",
    gradient: "from-emerald-100 via-green-100 to-teal-100",
    image: "/profile/banners/green-game.webp",
  },
  slate: {
    label: "Slate",
    gradient: "from-slate-100 via-slate-50 to-zinc-100",
    image: "/profile/banners/slate-game.webp",
  },*/
};

const AVATAR_PRESETS = {
  default: {
    label: "Default",
    className: "bg-cyan-100 text-cyan-700",
    image: null,
  },
  spark: {
    label: "Spark",
    className: "bg-amber-100 text-amber-700",
    image: "/profile/avatars/profile1.webp",
  },
  phoenix: {
    label: "Phoenix",
    className: "bg-orange-100 text-orange-700",
    image: "/profile/avatars/profile2.webp",
  },
  learner: {
    label: "Learner",
    className: "bg-emerald-100 text-emerald-700",
    image: "/profile/avatars/profile3.webp",
  },
  builder: {
    label: "Builder",
    className: "bg-blue-100 text-blue-700",
    image: "/profile/avatars/profile4.webp",
  },
  // creator is intentionally kept in the backend allowlist for upcoming avatar assets.
  // Frontend option is hidden until profile5.webp is ready.
  /*creator: {
    label: "Creator",
    className: "bg-purple-100 text-purple-700",
    image: "/profile/avatars/profile5.webp",
  },*/
};

const AVATAR_FRAMES = {
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
  const [
    streakCalendarOpen,
    setStreakCalendarOpen,
  ] = useState(false);

  const [localCertificates, setLocalCertificates] = useState([]);
  const [syncedToMongo, setSyncedToMongo] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    avatarPreset: "default",
    bannerColor: "cyan",
    avatarFrame: "cyan",
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

  const loadCertificates = useCallback(() => {
    const certs = getUnlockedCertificates();
    certs.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    setLocalCertificates(certs);
    return certs;
  }, []);

  const mapMongoCertificateToCard = (cert) => {
    const meta = cert.metadata || {};
    const resolved = resolveCertificateTemplate(cert);
    return {
      certificateKey: cert.certificateKey,
      roadmapFamily: cert.roadmapFamily || cert.roadmapSlug || "",
      roadmapTitle: cert.roadmapTitle || "",
      milestoneTitle: cert.title,
      unlockedAt: cert.unlockedAt,
      downloaded: false,
      dayId: cert.dayId,
      dayTitle: cert.dayTitle,
      description: cert.description,
      imageKey: cert.imageKey || resolved,
      template: resolved,
      // Top-level display fields CertificateCanvas reads directly
      providedOn: cert.providedOn || meta.providedOn || "",
      dayNumber: cert.dayNumber ?? meta.dayNumber ?? 1,
      quizCompletedCount: cert.quizCompletedCount ?? meta.quizCompletedCount ?? 0,
      durationMinutes: cert.durationMinutes ?? meta.durationMinutes ?? 0,
      metadata: meta,
    };
  };

  const syncLocalCertsToMongo = useCallback(
    async (localCerts) => {
      if (!user || !localCerts || localCerts.length === 0) {
        setSyncedToMongo(true);
        return;
      }

      try {
        const token = await user.getIdToken();

        const payload = localCerts.map((cert) => ({
          certificateKey: cert.certificateKey,
          certificateType: "day_completion",
          roadmapFamily: cert.roadmapFamily || "",
          roadmapSlug: cert.roadmapSlug || cert.roadmapFamily || cert.certificateKey || "unknown",
          roadmapTitle: cert.roadmapTitle || "",
          dayId: cert.dayId || cert.certificateKey,
          dayTitle: cert.dayTitle || "",
          title: cert.milestoneTitle || cert.title || cert.certificateKey,
          description: cert.description || "",
          imageKey: cert.imageKey || cert.template || resolveCertificateTemplate(cert),
          unlockedAt: cert.unlockedAt,
          metadata: {
            completedLevelsCount: Number(cert.completedLevelsCount || 0),
            totalLevelsInDay: Number(cert.totalLevelsInDay || 0),
            quizCompletedCount: Number(cert.quizCompletedCount || 0),
            durationMinutes: Number(cert.durationMinutes || 0),
            dayNumber: Number(cert.dayNumber || 1),
            providedOn: cert.providedOn || "",
          },
        }));

        const res = await fetch("/api/v2/certificates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();

          if (data.certificates && data.certificates.length > 0) {
            setProfileData((prev) => ({
              ...prev,
              cards: data.certificates,
            }));
          }
        }
      } catch {
        // Best-effort sync. Do not block profile UI.
      } finally {
        setSyncedToMongo(true);
      }
    },
    [user],
  );

  useEffect(() => {
    if (loading || !profileData || syncedToMongo) return;

    const local = loadCertificates();
    syncLocalCertsToMongo(local);
  }, [loading, profileData, syncedToMongo, loadCertificates, syncLocalCertsToMongo]);

  const handleEditClick = () => {
    setEditForm({
      displayName: profileData.displayName || "",
      bio: profileData.bio || "",
      avatarUrl: profileData.avatarUrl || "",
      avatarPreset: profileData.avatarPreset || "default",
      bannerColor: profileData.bannerColor || "cyan",
      avatarFrame: profileData.avatarFrame || "cyan",
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
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setProfileData((prev) => ({
        ...prev,
        ...data.profile,
      }));
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-8 px-4 py-8">
        <div className="mb-6 h-10 w-32 rounded-full bg-slate-200" />
        <div className="mb-12 h-32 w-full rounded-3xl bg-slate-200 md:h-48" />
        <div className="relative -mt-20 mb-8 ml-6 flex items-end gap-4 md:ml-10">
          <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-300 md:h-24 md:w-24" />
          <div className="space-y-2 pb-2">
            <div className="h-8 w-48 rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-48 rounded-3xl border border-slate-200 bg-slate-100 p-6" />
          <div className="h-48 rounded-3xl border border-slate-200 bg-slate-100 p-6 md:col-span-2" />
        </div>
        <div className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 p-6" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-48 rounded-3xl border border-slate-200 bg-slate-100 p-6" />
          <div className="h-48 rounded-3xl border border-slate-200 bg-slate-100 p-6" />
        </div>
        <div className="h-64 w-full rounded-3xl border border-slate-200 bg-slate-100 p-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <h2 className="mb-2 text-xl font-bold">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const {
    email,
    role,
    currentRoadmap,
    joinedAt,
    streak,
    stats,
    bio,
    displayName,
    avatarUrl,
    avatarPreset,
    bannerColor,
    avatarFrame,
  } = profileData;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isAtRisk = streak?.status === "at_risk";

  /*
 * Current streak month.
 *
 * Prefer the streak-local "today" date
 * returned by the profile API.
 */
  const currentStreakMonth = (() => {
    const today =
      streak?.week?.find(
        (day) =>
          day.isToday,
      );

    if (
      typeof today?.dateLocal ===
      "string"
    ) {
      return today.dateLocal.slice(
        0,
        7,
      );
    }

    const now =
      new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;
  })();

  /*
   * Do not let monthly history navigation
   * go before the user's account month.
   */
  const minimumStreakMonth = (() => {
    const sourceDate =
      joinedAt ||
      user?.metadata?.creationTime;

    if (!sourceDate) {
      return currentStreakMonth;
    }

    const createdAt =
      new Date(
        sourceDate,
      );

    if (
      Number.isNaN(
        createdAt.getTime(),
      )
    ) {
      return currentStreakMonth;
    }

    const createdMonth =
      `${createdAt.getUTCFullYear()}-${String(
        createdAt.getUTCMonth() + 1,
      ).padStart(2, "0")}`;

    return createdMonth >
      currentStreakMonth
      ? currentStreakMonth
      : createdMonth;
  })();

  const selectedBanner =
    BANNER_PRESETS[bannerColor || "cyan"] || BANNER_PRESETS.cyan;

  const selectedAvatarPreset =
    AVATAR_PRESETS[avatarPreset || "default"] || AVATAR_PRESETS.default;

  const displayAvatarFrameClass =
    AVATAR_FRAMES[avatarFrame || "cyan"] || AVATAR_FRAMES.cyan;

  const nameToDisplay = displayName || user?.displayName || "Adventurer";

  const renderAvatar = (url, preset, fbPhoto) => {
    if (url) {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={url}
          alt="Avatar"
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    if ((!avatarPreset || avatarPreset === "default") && fbPhoto) {
      return (
        <Image
          src={fbPhoto}
          alt="Avatar"
          width={96}
          height={96}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    if (preset?.image) {
      return (
        <Image
          src={preset.image}
          alt={preset.label || "Avatar"}
          width={96}
          height={96}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    return (
      <div
        className={`flex h-full w-full items-center justify-center ${preset?.className || AVATAR_PRESETS.default.className
          }`}
      >
        <User className="h-10 w-10 md:h-12 md:w-12" strokeWidth={2.5} />
      </div>
    );
  };

  const mongoCards = profileData.cards || [];
  const normalizedCards =
    mongoCards.length > 0
      ? mongoCards.map(mapMongoCertificateToCard)
      : localCertificates;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <button
          type="button"
          onClick={handleEditClick}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-cyan-700 hover:shadow-md"
        >
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      <div className="relative mb-14">
        <div
          className={`relative h-36 w-full overflow-hidden rounded-3xl bg-gradient-to-r shadow-sm md:h-52 ${selectedBanner.gradient}`}
          style={{
            backgroundImage: selectedBanner.image
              ? `linear-gradient(to right, rgba(255,255,255,0.10), rgba(255,255,255,0.06)), url("${selectedBanner.image}")`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/35 to-transparent" />
        </div>

        <div className="absolute -bottom-10 left-6 flex max-w-[calc(100%-3rem)] items-end gap-4 md:left-10">
          <div
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 bg-white p-1 shadow-xl md:h-24 md:w-24 ${displayAvatarFrameClass}`}
          >
            <div className="h-full w-full overflow-hidden rounded-full">
              {renderAvatar(avatarUrl, selectedAvatarPreset, user?.photoURL)}
            </div>
          </div>

          <div className="min-w-0 pb-2">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {nameToDisplay}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            <User className="h-4 w-4" /> Account
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Email</p>
                <p
                  className="max-w-[200px] truncate font-semibold text-slate-800"
                  title={email}
                >
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Role</p>
                <p className="font-semibold capitalize text-slate-800">
                  {role || "Student"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-500">Joined</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(joinedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 shadow-sm md:col-span-2 ${isAtRisk
            ? "border-orange-200 bg-orange-50"
            : "border-[#f1e4d2] bg-[#fffaf3]"
            }`}
        >
          <div className="mb-6 flex items-start justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <Flame
                className={`h-4 w-4 ${streak?.todayCompleted ? "text-orange-500" : "text-slate-400"
                  }`}
              />
              Learning Streak
            </h2>

            {isAtRisk && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
                At Risk
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <p className="mb-1 text-3xl font-black text-orange-500">
                {streak?.currentCount || 0}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current
              </p>
            </div>

            <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <p className="mb-1 text-3xl font-black text-slate-700">
                {streak?.longestCount || 0}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Longest
              </p>
            </div>

            <div className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <p className="mb-1 text-3xl font-black text-cyan-600">
                {streak?.freezeBank || 0}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Freezes
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setStreakCalendarOpen(true)
              }
              className="relative min-h-[110px] rounded-2xl border border-cyan-100 bg-white/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md"
            >
              <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-cyan-500" />

              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Monthly
                </p>

                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                  View Streak
                </p>
              </div>
            </button>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              {streak?.todayCompleted ? (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {streak?.todayCompleted ? "Done Today" : "Pending"}
              </p>
            </div>
          </div>

          {streak?.earnBack?.active && streak.earnBack.countAtRisk > 0 && (() => {
            const lessonsLeft =
              typeof streak.earnBack.lessonsRemaining === "number"
                ? streak.earnBack.lessonsRemaining
                : Math.max(0, 2 - (streak.earnBack.lessonsCompletedInWindow || 0));
            const countAtRisk = streak.earnBack.countAtRisk;
            const streakLabel = `${countAtRisk}-day streak`;
            const msg =
              lessonsLeft === 1
                ? `Complete 1 more lesson to restore your ${streakLabel}.`
                : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streakLabel}.`;
            return (
              <div className="mt-4 rounded-xl border border-orange-200/50 bg-orange-100/50 p-3 text-sm font-medium text-orange-700">
                {msg}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          <BookOpen className="h-4 w-4" /> Bio
        </h2>

        {bio ? (
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
            {bio}
          </p>
        ) : (
          <p className="italic text-slate-400">
            Add a short bio to personalize your profile.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            <BookOpen className="h-4 w-4" /> Lifetime Stats
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#f1e4d2]/50 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-800">
                {stats?.completedLevels || 0}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Lessons Completed
              </p>
            </div>

            <div className="rounded-2xl border border-[#f1e4d2]/50 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-800">
                {stats?.passedAssignments || 0}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Assignments Passed
              </p>
            </div>

            <div className="rounded-2xl border border-[#f1e4d2]/50 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-800">
                {stats?.roadmapsStarted || 0}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Roadmaps Started
              </p>
            </div>

            <div className="rounded-2xl border border-[#f1e4d2]/50 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-800">
                {stats?.roadmapsCompleted || 0}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Roadmaps Finished
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
            <Award className="h-4 w-4" /> Current Roadmap
          </h2>

          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white bg-white/50 p-6 text-center">
            {currentRoadmap ? (
              <>
                <div className="mb-4 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 shadow-sm">
                  <BookOpen className="h-8 w-8" />
                </div>

                <h3 className="mb-2 text-xl font-bold capitalize text-slate-800">
                  {currentRoadmap.replace(/-/g, " ")}
                </h3>

                <p className="text-sm font-medium text-slate-500">
                  Keep up the great work!
                </p>
              </>
            ) : (
              <div className="text-slate-400">
                <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="font-medium">No active roadmap</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          <Award className="h-4 w-4" /> Your Collection
        </h2>

        {normalizedCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {normalizedCards.map((cert) => (
              <CertificateCard
                key={`${cert.roadmapFamily}-${cert.certificateKey}`}
                certificate={cert}
                onUpdate={loadCertificates}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white bg-white/50 p-8 text-center">
            <Award className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-medium text-slate-500">
              No cards unlocked yet. Complete lessons to start earning them.
            </p>
          </div>
        )}
      </div>

      {streakCalendarOpen && (
        <StreakCalendarModal
          open={true}
          onClose={() =>
            setStreakCalendarOpen(
              false,
            )
          }
          user={user}
          initialMonth={
            currentStreakMonth
          }
          currentMonth={
            currentStreakMonth
          }
          minimumMonth={
            minimumStreakMonth
          }
          liveWeek={
            streak?.week ||
            []
          }
          lastCompletedDateLocal={
            streak
              ?.lastCompletedDateLocal ||
            null
          }
          currentCount={
            streak?.currentCount ||
            0
          }
          longestCount={
            streak?.longestCount ||
            0
          }
        />
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Profile
              </h3>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {editError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {editError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, displayName: e.target.value })
                  }
                  maxLength={40}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  maxLength={180}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-1 text-right text-xs text-slate-500">
                  {editForm.bio.length}/180
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Banner
                </label>

                <div className="flex flex-wrap gap-3">
                  {Object.entries(BANNER_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, bannerColor: key })
                      }
                      title={preset.label}
                      className={`relative flex h-12 w-20 items-center justify-center overflow-hidden rounded-xl border-2 bg-gradient-to-r shadow-sm transition-transform hover:scale-105 ${preset.gradient
                        } ${editForm.bannerColor === key
                          ? "scale-105 border-cyan-600"
                          : "border-transparent"
                        }`}
                      style={{
                        backgroundImage: preset.image
                          ? `linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url("${preset.image}")`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {editForm.bannerColor === key && (
                        <Check className="h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Avatar URL (Optional)
                </label>

                <input
                  type="text"
                  value={editForm.avatarUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, avatarUrl: e.target.value })
                  }
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />

                <p className="mt-1 text-xs text-slate-400">
                  Clear this field to use avatar presets.
                </p>
              </div>

              {!editForm.avatarUrl && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Avatar Theme
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {Object.entries(AVATAR_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setEditForm({ ...editForm, avatarPreset: key })
                        }
                        title={preset.label}
                        className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition-transform hover:scale-105 ${editForm.avatarPreset === key
                          ? "scale-105 border-cyan-600"
                          : "border-transparent"
                          } ${preset.className}`}
                      >
                        {key === "default" && user?.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="Default avatar"
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : preset.image ? (
                          <Image
                            src={preset.image}
                            alt={preset.label}
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" strokeWidth={2.5} />
                        )}

                        {editForm.avatarPreset === key && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Avatar Frame
                </label>

                <div className="flex flex-wrap gap-3">
                  {Object.entries(AVATAR_FRAMES).map(([key, frameClass]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, avatarFrame: key })
                      }
                      title={key}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white shadow-sm transition-transform hover:scale-105 ${frameClass} ${editForm.avatarFrame === key
                        ? "scale-110 ring-2 ring-cyan-500 ring-offset-2"
                        : ""
                        }`}
                    >
                      {editForm.avatarFrame === key && (
                        <Check className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}