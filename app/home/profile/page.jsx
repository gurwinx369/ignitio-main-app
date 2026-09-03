"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/features/context/AuthContext";

import {
  User,
  Flame,
  Award,
  BookOpen,
  Clock,
  ShieldCheck,
  Mail,
  ArrowLeft,
  Edit2,
  X,
  Check,
  Loader2,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { getUnlockedCertificates } from "@/features/certificates/certificateStorage";
import CertificateCard from "@/features/certificates/CertificateCard";
import { resolveCertificateTemplate } from "@/features/certificates/certificateTemplateResolver";

import StreakCalendarModal from "@/features/dashboard/components/StreakCalendarModal";
import DashboardBottomNav from "@/features/dashboard/components/DashboardBottomNav";

/* =========================================================
   PROFILE CUSTOMIZATION
========================================================= */

const BANNER_PRESETS = {
  cyan: {
    label: "Cyan",
    gradient:
      "from-cyan-100 via-sky-100 to-blue-100",
    image:
      "/profile/banners/banner1.webp",
  },

  blue: {
    label: "Blue",
    gradient:
      "from-blue-100 via-sky-100 to-cyan-100",
    image:
      "/profile/banners/banner2.webp",
  },

  purple: {
    label: "Purple",
    gradient:
      "from-violet-100 via-purple-100 to-fuchsia-100",
    image:
      "/profile/banners/banner3.webp",
  },

  /*
  orange: {
    label: "Orange",
    gradient:
      "from-orange-100 via-amber-100 to-yellow-100",
    image:
      "/profile/banners/banner4.webp",
  },

  green: {
    label: "Green",
    gradient:
      "from-emerald-100 via-green-100 to-teal-100",
    image:
      "/profile/banners/green-game.webp",
  },

  slate: {
    label: "Slate",
    gradient:
      "from-slate-100 via-slate-50 to-zinc-100",
    image:
      "/profile/banners/slate-game.webp",
  },
  */
};

const AVATAR_PRESETS = {
  default: {
    label: "Default",
    className:
      "bg-cyan-100 text-cyan-700",
    image: null,
  },

  spark: {
    label: "Spark",
    className:
      "bg-amber-100 text-amber-700",
    image:
      "/profile/avatars/profile1.webp",
  },

  phoenix: {
    label: "Phoenix",
    className:
      "bg-orange-100 text-orange-700",
    image:
      "/profile/avatars/profile2.webp",
  },

  learner: {
    label: "Learner",
    className:
      "bg-emerald-100 text-emerald-700",
    image:
      "/profile/avatars/profile3.webp",
  },

  builder: {
    label: "Builder",
    className:
      "bg-blue-100 text-blue-700",
    image:
      "/profile/avatars/profile4.webp",
  },

  /*
  creator: {
    label: "Creator",
    className:
      "bg-purple-100 text-purple-700",
    image:
      "/profile/avatars/profile5.webp",
  },
  */
};

const AVATAR_FRAMES = {
  cyan:
    "border-cyan-200 shadow-cyan-100",

  blue:
    "border-blue-200 shadow-blue-100",

  purple:
    "border-purple-200 shadow-purple-100",

  orange:
    "border-orange-200 shadow-orange-100",

  green:
    "border-emerald-200 shadow-emerald-100",

  slate:
    "border-slate-200 shadow-slate-100",

  gold:
    "border-amber-300 shadow-amber-100",
};

/* =========================================================
   PROFILE
========================================================= */

export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    profileData,
    setProfileData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    streakCalendarOpen,
    setStreakCalendarOpen,
  ] = useState(false);

  const [
    localCertificates,
    setLocalCertificates,
  ] = useState([]);

  const [
    syncedToMongo,
    setSyncedToMongo,
  ] = useState(false);

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editError,
    setEditError,
  ] = useState("");

  const [
    editForm,
    setEditForm,
  ] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    avatarPreset: "default",
    bannerColor: "cyan",
    avatarFrame: "cyan",
  });

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setError(
          "User not authenticated",
        );

        setLoading(false);

        return;
      }

      try {
        const token =
          await user.getIdToken();

        const res = await fetch(
          "/api/v2/profile",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load profile",
          );
        }

        const data =
          await res.json();

        setProfileData(
          data.profile,
        );
      } catch (err) {
        setError(
          err.message,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [
    user,
    authLoading,
  ]);

  /* =======================================================
     CERTIFICATES
  ======================================================= */

  const loadCertificates =
    useCallback(() => {
      const certs =
        getUnlockedCertificates();

      certs.sort(
        (a, b) =>
          new Date(b.unlockedAt) -
          new Date(a.unlockedAt),
      );

      setLocalCertificates(
        certs,
      );

      return certs;
    }, []);

  const mapMongoCertificateToCard =
    (cert) => {
      const meta =
        cert.metadata || {};

      const resolved =
        resolveCertificateTemplate(
          cert,
        );

      return {
        certificateKey:
          cert.certificateKey,

        roadmapFamily:
          cert.roadmapFamily ||
          cert.roadmapSlug ||
          "",

        roadmapTitle:
          cert.roadmapTitle || "",

        milestoneTitle:
          cert.title,

        unlockedAt:
          cert.unlockedAt,

        downloaded:
          false,

        dayId:
          cert.dayId,

        dayTitle:
          cert.dayTitle,

        description:
          cert.description,

        imageKey:
          resolved,

        template:
          resolved,

        providedOn:
          cert.providedOn ||
          meta.providedOn ||
          "",

        dayNumber:
          cert.dayNumber ??
          meta.dayNumber ??
          1,

        quizCompletedCount:
          cert.quizCompletedCount ??
          meta.quizCompletedCount ??
          0,

        durationMinutes:
          cert.durationMinutes ??
          meta.durationMinutes ??
          0,

        metadata:
          meta,
      };
    };

  const syncLocalCertsToMongo =
    useCallback(
      async (
        localCerts,
      ) => {
        if (
          !user ||
          !localCerts ||
          localCerts.length === 0
        ) {
          setSyncedToMongo(true);

          return;
        }

        try {
          const token =
            await user.getIdToken();

          const payload =
            localCerts.map(
              (cert) => ({
                certificateKey:
                  cert.certificateKey,

                certificateType:
                  "day_completion",

                roadmapFamily:
                  cert.roadmapFamily ||
                  "",

                roadmapSlug:
                  cert.roadmapSlug ||
                  cert.roadmapFamily ||
                  cert.certificateKey ||
                  "unknown",

                roadmapTitle:
                  cert.roadmapTitle ||
                  "",

                dayId:
                  cert.dayId ||
                  cert.certificateKey,

                dayTitle:
                  cert.dayTitle ||
                  "",

                title:
                  cert.milestoneTitle ||
                  cert.title ||
                  cert.certificateKey,

                description:
                  cert.description ||
                  "",

                imageKey:
                  resolveCertificateTemplate(
                    cert,
                  ),

                unlockedAt:
                  cert.unlockedAt,

                metadata: {
                  completedLevelsCount:
                    Number(
                      cert.completedLevelsCount ||
                      0,
                    ),

                  totalLevelsInDay:
                    Number(
                      cert.totalLevelsInDay ||
                      0,
                    ),

                  quizCompletedCount:
                    Number(
                      cert.quizCompletedCount ||
                      0,
                    ),

                  durationMinutes:
                    Number(
                      cert.durationMinutes ||
                      0,
                    ),

                  dayNumber:
                    Number(
                      cert.dayNumber ||
                      1,
                    ),

                  providedOn:
                    cert.providedOn ||
                    "",
                },
              }),
            );

          const res =
            await fetch(
              "/api/v2/certificates",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify(
                    payload,
                  ),
              },
            );

          if (res.ok) {
            const data =
              await res.json();

            if (
              data.certificates &&
              data.certificates
                .length > 0
            ) {
              setProfileData(
                (prev) => ({
                  ...prev,

                  cards:
                    data.certificates,
                }),
              );
            }
          }
        } catch {
          /*
           * Best-effort sync.
           * Never block profile UI.
           */
        } finally {
          setSyncedToMongo(true);
        }
      },

      [user],
    );

  useEffect(() => {
    if (
      loading ||
      !profileData ||
      syncedToMongo
    ) {
      return;
    }

    const local =
      loadCertificates();

    syncLocalCertsToMongo(
      local,
    );
  }, [
    loading,
    profileData,
    syncedToMongo,
    loadCertificates,
    syncLocalCertsToMongo,
  ]);

  /* =======================================================
     EDIT PROFILE
  ======================================================= */

  const handleEditClick =
    () => {
      setEditForm({
        displayName:
          profileData.displayName ||
          "",

        bio:
          profileData.bio ||
          "",

        avatarUrl:
          profileData.avatarUrl ||
          "",

        avatarPreset:
          profileData.avatarPreset ||
          "default",

        bannerColor:
          profileData.bannerColor ||
          "cyan",

        avatarFrame:
          profileData.avatarFrame ||
          "cyan",
      });

      setEditError("");

      setIsEditing(true);
    };

  const handleSaveProfile =
    async () => {
      setSaving(true);

      setEditError("");

      try {
        const token =
          await user.getIdToken();

        const res =
          await fetch(
            "/api/v2/profile",
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  editForm,
                ),
            },
          );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Failed to save profile",
          );
        }

        setProfileData(
          (prev) => ({
            ...prev,
            ...data.profile,
          }),
        );

        setIsEditing(false);
      } catch (err) {
        setEditError(
          err.message,
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FCF5EE]">
        <div
          className="
            mx-auto
            max-w-[1180px]
            animate-pulse
            px-4
            py-6

            sm:px-6
            sm:py-8
          "
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="h-10 w-32 rounded-full bg-[#FFFDF9]/70" />

            <div className="h-10 w-32 rounded-full bg-[#00A9FF]/30" />
          </div>

          <div
            className="
              overflow-hidden
              rounded-[32px]
              border
              border-[#E3B58C]
              bg-[#FFFDF9]
            "
          >
            <div
              className="
                h-[190px]
                bg-[#19183B]/10

                md:h-[280px]
              "
            />

            <div className="relative h-[150px] px-6">
              <div
                className="
                  absolute
                  -top-[54px]
                  h-[108px]
                  w-[108px]
                  rounded-full
                  bg-[#19183B]/15

                  md:-top-[68px]
                  md:h-[136px]
                  md:w-[136px]
                "
              />

              <div className="ml-[128px] space-y-3 pt-6 md:ml-[160px]">
                <div className="h-8 w-56 rounded bg-[#19183B]/12" />

                <div className="h-5 w-24 rounded-full bg-[#00A9FF]/18" />

                <div className="h-4 w-72 max-w-full rounded bg-[#19183B]/8" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="h-[260px] rounded-[28px] bg-[#FFFDF9]/70" />

            <div className="h-[260px] rounded-[28px] bg-[#FFFDF9]/70" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-[220px] rounded-[28px] bg-[#FFFDF9]/70" />

            <div className="h-[220px] rounded-[28px] bg-[#FFFDF9]/70" />
          </div>

          <div className="mt-6 h-[280px] rounded-[28px] bg-[#FFFDF9]/70" />
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#FCF5EE]
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-[28px]
            border
            border-red-100
            bg-[#FFFDF9]
            p-7
            text-center
            shadow-[0_16px_40px_rgba(25,24,59,0.10)]
          "
        >
          <h2 className="mb-2 text-xl font-black text-[#19183B]">
            Unable to load profile
          </h2>

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return null;
  }

  /* =======================================================
     DATA
  ======================================================= */

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

  const formatDate =
    (dateString) => {
      if (!dateString) {
        return "Unknown";
      }

      const date =
        new Date(
          dateString,
        );

      return date.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    };

  const isAtRisk =
    streak?.status ===
    "at_risk";

  /*
   * Current streak month.
   *
   * Prefer the streak-local "today" date
   * returned by the profile API.
   */
  const currentStreakMonth =
    (() => {
      const today =
        streak?.week?.find(
          (day) =>
            day.isToday,
        );

      if (
        typeof today
          ?.dateLocal ===
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
  const minimumStreakMonth =
    (() => {
      const sourceDate =
        joinedAt ||
        user?.metadata
          ?.creationTime;

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
          createdAt.getUTCMonth() +
          1,
        ).padStart(2, "0")}`;

      return createdMonth >
        currentStreakMonth
        ? currentStreakMonth
        : createdMonth;
    })();

  const selectedBanner =
    BANNER_PRESETS[
    bannerColor ||
    "cyan"
    ] ||
    BANNER_PRESETS.cyan;

  const selectedAvatarPreset =
    AVATAR_PRESETS[
    avatarPreset ||
    "default"
    ] ||
    AVATAR_PRESETS.default;

  const displayAvatarFrameClass =
    AVATAR_FRAMES[
    avatarFrame ||
    "cyan"
    ] ||
    AVATAR_FRAMES.cyan;

  const nameToDisplay =
    displayName ||
    user?.displayName ||
    "Adventurer";

  const renderAvatar = (
    url,
    preset,
    fbPhoto,
    presetKey = avatarPreset,
  ) => {
    if (url) {
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Avatar"
            className="h-full w-full rounded-full object-cover"
          />
        </>
      );
    }

    if (
      (!presetKey ||
        presetKey ===
        "default") &&
      fbPhoto
    ) {
      return (
        <Image
          src={fbPhoto}
          alt="Avatar"
          width={160}
          height={160}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    if (preset?.image) {
      return (
        <Image
          src={preset.image}
          alt={
            preset.label ||
            "Avatar"
          }
          width={160}
          height={160}
          className="h-full w-full rounded-full object-cover"
        />
      );
    }

    return (
      <div
        className={[
          "flex h-full w-full items-center justify-center",
          preset?.className ||
          AVATAR_PRESETS
            .default
            .className,
        ].join(" ")}
      >
        <User
          className="
            h-12
            w-12

            md:h-14
            md:w-14
          "
          strokeWidth={
            2.5
          }
        />
      </div>
    );
  };

  const mongoCards =
    profileData.cards || [];

  const normalizedCards =
    mongoCards.length > 0
      ? mongoCards.map(
        mapMongoCertificateToCard,
      )
      : localCertificates;

  const editBanner =
    BANNER_PRESETS[
    editForm.bannerColor
    ] ||
    BANNER_PRESETS.cyan;

  const editAvatarPreset =
    AVATAR_PRESETS[
    editForm.avatarPreset
    ] ||
    AVATAR_PRESETS.default;

  const editAvatarFrame =
    AVATAR_FRAMES[
    editForm.avatarFrame
    ] ||
    AVATAR_FRAMES.cyan;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FCF5EE] text-[#19183B]">
      <div
        className="
          mx-auto
          max-w-[1180px]
          px-4
          pb-16
          pt-5

          sm:px-6
          sm:pt-7

          lg:px-8
        "
      >
        {/* =================================================
            TOP ACTIONS
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <Link
            href="/home"
            className="
              inline-flex
              min-h-[42px]
              items-center
              gap-2
              rounded-full

              border
              border-[#E3B58C]

              bg-[#FFFDF9]

              px-4

              text-sm
              font-bold
              text-[#19183B]

              shadow-[0_3px_0_#D9A87D]

              transition-[transform,box-shadow]
              duration-150

              hover:-translate-y-px

              active:translate-y-[2px]
              active:scale-[0.98]
              active:shadow-[0_1px_0_#D9A87D]
            "
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Back to Home
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>

          <button
            type="button"
            onClick={
              handleEditClick
            }
            className="
              inline-flex
              min-h-[42px]
              items-center
              gap-2
              rounded-full

              bg-[#00A9FF]

              px-4

              text-sm
              font-black
              text-[#19183B]

              shadow-[0_4px_0_#0085C7]

              transition-[transform,box-shadow]
              duration-150

              hover:-translate-y-px

              active:translate-y-[2px]
              active:scale-[0.98]
              active:shadow-[0_1px_0_#0085C7]
            "
          >
            <Edit2 className="h-4 w-4" />

            Edit Profile
          </button>
        </div>

        {/* =================================================
            IDENTITY HERO
        ================================================= */}

        <section
          className="
            overflow-hidden
            rounded-[32px]

            border
            border-[#E3B58C]

            bg-[#FFFDF9]

            shadow-[0_16px_38px_rgba(25,24,59,0.09)]
          "
        >
          {/* Banner */}
          <div
            className={`
              relative
              w-full
              aspect-[4/1]
              overflow-hidden

              bg-gradient-to-r

              ${selectedBanner.gradient}
            `}
            style={{
              backgroundImage:
                selectedBanner.image
                  ? `linear-gradient(
                      to right,
                    rgba(25,24,59,0.015),
                    rgba(25,24,59,0.015)
                  ),
                  url("${selectedBanner.image}")`
                  : undefined,

              backgroundSize:
                "cover",

              backgroundPosition:
                "center",

              backgroundRepeat:
                "no-repeat",
            }}
          >
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#19183B]/5
                via-transparent
                to-transparent
                pointer-events-none
              "
            />
          </div>

          {/* Identity */}
          <div
            className="
              relative
              min-h-[180px]
              px-5
              pb-6

              sm:px-7

              md:min-h-[170px]
              md:px-9
            "
          >
            <div
              className="
                absolute
                -top-[54px]
                left-5

                sm:left-7

                md:-top-[68px]
                md:left-9
              "
            >
              <div
                className={`
                  h-[108px]
                  w-[108px]

                  overflow-hidden
                  rounded-full

                  border-[5px]
                  bg-[#FFFDF9]

                  p-1

                  shadow-[0_12px_28px_rgba(25,24,59,0.16)]

                  md:h-[136px]
                  md:w-[136px]

                  ${displayAvatarFrameClass}
                `}
              >
                <div className="h-full w-full overflow-hidden rounded-full">
                  {renderAvatar(
                    avatarUrl,
                    selectedAvatarPreset,
                    user?.photoURL,
                    avatarPreset,
                  )}
                </div>
              </div>
            </div>

            <div
              className="
                pt-[72px]

                md:ml-[158px]
                md:pt-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-2

                  sm:flex-row
                  sm:items-center
                  sm:gap-3
                "
              >
                <h1
                  className="
                    break-words
                    text-[28px]
                    font-black
                    leading-tight
                    tracking-[-0.035em]
                    text-[#19183B]

                    md:text-[34px]
                  "
                >
                  {nameToDisplay}
                </h1>

                <span
                  className="
                    w-fit
                    rounded-full

                    bg-[#00A9FF]/12

                    px-3
                    py-1

                    text-xs
                    font-black
                    capitalize
                    text-[#007EBF]
                  "
                >
                  {role ||
                    "Student"}
                </span>
              </div>

              <div
                className="
                  mt-3
                  max-w-[680px]
                "
              >
                {bio ? (
                  <p
                    className="
                      whitespace-pre-wrap
                      text-sm
                      font-medium
                      leading-relaxed
                      text-[#19183B]/62

                      sm:text-[15px]
                    "
                  >
                    {bio}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleEditClick
                    }
                    className="
                      text-left
                      text-sm
                      font-semibold
                      italic
                      text-[#19183B]/40

                      transition-colors

                      hover:text-[#00A9FF]
                    "
                  >
                    Add a short bio to personalize your profile.
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            LEARNING SNAPSHOT + ACCOUNT
        ================================================= */}

        <div
          className="
            mt-6
            grid
            gap-6

            lg:grid-cols-[1.45fr_0.55fr]
          "
        >
          {/* LEARNING SNAPSHOT */}

          <section
            className={`
              rounded-[28px]

              border

              p-5

              shadow-[0_8px_24px_rgba(25,24,59,0.06)]

              sm:p-6

              ${isAtRisk
                ? "border-orange-200 bg-orange-50"
                : "border-[#E3B58C] bg-[#FFFDF9]"
              }
            `}
          >
            <div
              className="
                mb-5
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <h2
                  className="
                    flex
                    items-center
                    gap-2

                    text-xs
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-[#19183B]/55
                  "
                >
                  <Flame
                    className={`
                      h-4
                      w-4

                      ${streak?.todayCompleted
                        ? "text-orange-500"
                        : "text-[#19183B]/30"
                      }
                    `}
                  />

                  Learning Snapshot
                </h2>

                <div
                  className="
                    mt-4
                    flex
                    items-end
                    gap-2
                  "
                >
                  <span className="text-[42px] font-black leading-none text-orange-500">
                    {streak?.currentCount ||
                      0}
                  </span>

                  <span className="pb-1 text-sm font-black text-[#19183B]">
                    day streak
                  </span>
                </div>
              </div>

              {isAtRisk && (
                <span
                  className="
                    rounded-full
                    bg-orange-100
                    px-3
                    py-1

                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-orange-700
                  "
                >
                  At Risk
                </span>
              )}
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3

                sm:grid-cols-3
              "
            >
              <div
                className="
                  rounded-[20px]
                  border
                  border-[#19183B]/6
                  bg-[#F2E0D0]/35
                  p-4
                "
              >
                <p className="text-2xl font-black text-[#19183B]">
                  {streak?.currentCount ||
                    0}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#19183B]/45">
                  Current
                </p>
              </div>

              <div
                className="
                  rounded-[20px]
                  border
                  border-[#19183B]/6
                  bg-[#F2E0D0]/35
                  p-4
                "
              >
                <p className="text-2xl font-black text-[#19183B]">
                  {streak?.longestCount ||
                    0}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#19183B]/45">
                  Longest
                </p>
              </div>

              <div
                className="
                  col-span-2
                  rounded-[20px]
                  border
                  border-[#19183B]/6
                  bg-[#F2E0D0]/35
                  p-4

                  sm:col-span-1
                "
              >
                <p className="text-2xl font-black text-[#00A9FF]">
                  {streak?.freezeBank ||
                    0}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#19183B]/45">
                  Freezes
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                flex
                flex-col
                gap-3

                rounded-[20px]

                bg-[#F2E0D0]/35

                p-4

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full

                    ${streak?.todayCompleted
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-[#19183B]/8 text-[#19183B]/35"
                    }
                  `}
                >
                  {streak?.todayCompleted ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={
                        3
                      }
                    />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-[#19183B]">
                    {streak?.todayCompleted
                      ? "Learning complete today"
                      : "Today is still open"}
                  </p>

                  <p className="text-xs font-medium text-[#19183B]/45">
                    {streak?.todayCompleted
                      ? "Nice work. Your streak is safe."
                      : "Complete a lesson to protect your streak."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setStreakCalendarOpen(
                    true,
                  )
                }
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2

                  rounded-full

                  bg-[#FFFDF9]

                  px-3
                  py-2

                  text-xs
                  font-black
                  text-[#007EBF]

                  transition-transform
                  duration-150

                  hover:-translate-y-px

                  active:translate-y-[2px]
                "
              >
                <CalendarDays className="h-4 w-4" />

                View history

                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {streak?.earnBack
              ?.active &&
              streak.earnBack
                .countAtRisk >
              0 &&
              (() => {
                const lessonsLeft =
                  typeof streak
                    .earnBack
                    .lessonsRemaining ===
                    "number"
                    ? streak
                      .earnBack
                      .lessonsRemaining
                    : Math.max(
                      0,
                      2 -
                      (streak
                        .earnBack
                        .lessonsCompletedInWindow ||
                        0),
                    );

                const countAtRisk =
                  streak.earnBack
                    .countAtRisk;

                const streakLabel =
                  `${countAtRisk}-day streak`;

                const msg =
                  lessonsLeft ===
                    1
                    ? `Complete 1 more lesson to restore your ${streakLabel}.`
                    : `Complete ${lessonsLeft} lessons in the next 48 hours to restore your ${streakLabel}.`;

                return (
                  <div
                    className="
                      mt-4
                      rounded-[18px]
                      border
                      border-orange-200
                      bg-orange-100/60
                      p-3

                      text-sm
                      font-semibold
                      text-orange-700
                    "
                  >
                    {msg}
                  </div>
                );
              })()}
          </section>

          {/* ACCOUNT */}

          <section
            className="
              rounded-[28px]

              border
              border-[#E3B58C]

              bg-[#FFFDF9]

              p-5

              shadow-[0_8px_24px_rgba(25,24,59,0.06)]

              sm:p-6
            "
          >
            <h2
              className="
                mb-5
                flex
                items-center
                gap-2

                text-xs
                font-black
                uppercase
                tracking-[0.14em]
                text-[#19183B]/55
              "
            >
              <User className="h-4 w-4" />

              Account
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl

                    bg-[#F2E0D0]/45

                    text-[#19183B]/55
                  "
                >
                  <Mail className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#19183B]/40">
                    Email
                  </p>

                  <p
                    className="
                      mt-0.5
                      break-all
                      text-sm
                      font-bold
                      text-[#19183B]
                    "
                    title={
                      email
                    }
                  >
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl

                    bg-[#F2E0D0]/45

                    text-[#19183B]/55
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#19183B]/40">
                    Role
                  </p>

                  <p className="mt-0.5 text-sm font-bold capitalize text-[#19183B]">
                    {role ||
                      "Student"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl

                    bg-[#F2E0D0]/45

                    text-[#19183B]/55
                  "
                >
                  <Clock className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#19183B]/40">
                    Joined
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-[#19183B]">
                    {formatDate(
                      joinedAt,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            CURRENT ROADMAP + LIFETIME STATS
        ================================================= */}

        <div
          className="
            mt-6
            grid
            gap-6

            lg:grid-cols-2
          "
        >
          {/* CURRENT ROADMAP */}

          <section
            className="
              rounded-[28px]

              border
              border-[#E3B58C]

              bg-[#FFFDF9]

              p-5

              shadow-[0_8px_24px_rgba(25,24,59,0.06)]

              sm:p-6
            "
          >
            <h2
              className="
                mb-5
                flex
                items-center
                gap-2

                text-xs
                font-black
                uppercase
                tracking-[0.14em]
                text-[#19183B]/55
              "
            >
              <BookOpen className="h-4 w-4" />

              Current Roadmap
            </h2>

            {currentRoadmap ? (
              <div
                className="
                  flex
                  min-h-[150px]
                  items-center
                  gap-4

                  rounded-[22px]

                  border
                  border-[#00A9FF]/20

                  bg-[#00A9FF]/6

                  p-5
                "
              >
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center

                    rounded-[18px]

                    bg-[#00A9FF]/15

                    text-[#00A9FF]
                  "
                >
                  <BookOpen className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#19183B]/40">
                    Learning now
                  </p>

                  <h3
                    className="
                      text-lg
                      font-black
                      capitalize
                      leading-tight
                      text-[#19183B]

                      sm:text-xl
                    "
                  >
                    {currentRoadmap.replace(
                      /-/g,
                      " ",
                    )}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-[#19183B]/50">
                    Continue where you left off and keep building momentum.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="
                  flex
                  min-h-[150px]
                  flex-col
                  items-center
                  justify-center

                  rounded-[22px]

                  border
                  border-dashed
                  border-[#19183B]/10

                  bg-[#F2E0D0]/25

                  text-center
                "
              >
                <BookOpen className="mb-3 h-10 w-10 text-[#19183B]/20" />

                <p className="font-bold text-[#19183B]/45">
                  No active roadmap
                </p>
              </div>
            )}
          </section>

          {/* LIFETIME STATS */}

          <section
            className="
              rounded-[28px]

              border
              border-[#E3B58C]

              bg-[#FFFDF9]

              p-5

              shadow-[0_8px_24px_rgba(25,24,59,0.06)]

              sm:p-6
            "
          >
            <h2
              className="
                mb-5
                flex
                items-center
                gap-2

                text-xs
                font-black
                uppercase
                tracking-[0.14em]
                text-[#19183B]/55
              "
            >
              <Award className="h-4 w-4" />

              Lifetime Stats
            </h2>

            <div
              className="
                grid
                grid-cols-2
                gap-3

                sm:grid-cols-4
                lg:grid-cols-2
                xl:grid-cols-4
              "
            >
              {[
                {
                  value:
                    stats
                      ?.completedLevels ||
                    0,

                  label:
                    "Lessons Completed",

                  color:
                    "text-orange-500",
                },

                {
                  value:
                    stats
                      ?.passedAssignments ||
                    0,

                  label:
                    "Assignments Passed",

                  color:
                    "text-violet-500",
                },

                {
                  value:
                    stats
                      ?.roadmapsStarted ||
                    0,

                  label:
                    "Roadmaps Started",

                  color:
                    "text-[#00A9FF]",
                },

                {
                  value:
                    stats
                      ?.roadmapsCompleted ||
                    0,

                  label:
                    "Roadmaps Finished",

                  color:
                    "text-emerald-600",
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                    className="
                      rounded-[20px]

                      border
                      border-[#19183B]/6

                      bg-[#F2E0D0]/28

                      p-4
                    "
                  >
                    <p
                      className={`
                        text-2xl
                        font-black

                        ${item.color}
                      `}
                    >
                      {item.value}
                    </p>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        font-bold
                        leading-snug
                        text-[#19183B]/50
                      "
                    >
                      {item.label}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            COLLECTION
        ================================================= */}

        <section
          className="
            mt-6
            rounded-[28px]

            border
            border-[#E3B58C]

            bg-[#FFFDF9]

            p-5

            shadow-[0_8px_24px_rgba(25,24,59,0.06)]

            sm:p-6
          "
        >
          <div
            className="
              mb-5
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  flex
                  items-center
                  gap-2

                  text-xs
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-[#19183B]/55
                "
              >
                <Award className="h-4 w-4" />

                Your Collection
              </h2>

              <p className="mt-1.5 text-xs font-medium text-[#19183B]/40">
                Your learning milestones, certificates and achievement cards.
              </p>
            </div>

            {normalizedCards.length >
              0 && (
                <span
                  className="
                  rounded-full

                  bg-[#F2E0D0]/45

                  px-3
                  py-1.5

                  text-xs
                  font-black
                  text-[#19183B]/55
                "
                >
                  {
                    normalizedCards.length
                  }{" "}
                  unlocked
                </span>
              )}
          </div>

          {normalizedCards.length >
            0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-5

                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {normalizedCards.map(
                (cert) => (
                  <CertificateCard
                    key={`${cert.roadmapFamily}-${cert.certificateKey}`}
                    certificate={
                      cert
                    }
                    onUpdate={
                      loadCertificates
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <div
              className="
                flex
                min-h-[190px]
                flex-col
                items-center
                justify-center

                rounded-[22px]

                border
                border-dashed
                border-[#19183B]/10

                bg-[#F2E0D0]/22

                p-8

                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center

                  rounded-[18px]

                  bg-[#FFFDF9]

                  text-[#19183B]/20
                "
              >
                <Award className="h-7 w-7" />
              </div>

              <p className="font-black text-[#19183B]/55">
                Your collection starts here
              </p>

              <p className="mt-1 max-w-sm text-sm font-medium text-[#19183B]/35">
                Complete lessons and milestones to begin unlocking achievement cards.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          STREAK CALENDAR
      =================================================== */}

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
            streak?.week || []
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

      {/* ===================================================
          EDIT PROFILE
      =================================================== */}

      {isEditing && (
        <div
          className="
            fixed
            inset-0
            z-[60]

            flex
            items-end
            justify-center

            bg-[#19183B]/45

            backdrop-blur-sm

            sm:items-center
            sm:p-4
          "
        >
          <div
            className="
              flex

              h-[calc(100dvh-1rem)]
              w-full

              max-w-4xl

              flex-col

              overflow-hidden

              rounded-t-[30px]

              border
              border-[#19183B]/8

              bg-[#FFFDF9]

              shadow-[0_24px_70px_rgba(25,24,59,0.25)]

              sm:h-auto
              sm:max-h-[calc(100dvh-2rem)]
              sm:rounded-[30px]
            "
          >
            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between

                border-b
                border-[#19183B]/8

                bg-[#FFFDF9]

                px-5
                py-4

                sm:px-6
              "
            >
              <div>
                <h3 className="text-lg font-black text-[#19183B]">
                  Edit Profile
                </h3>

                <p className="mt-0.5 text-xs font-medium text-[#19183B]/40">
                  Customize your learning identity.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsEditing(
                    false,
                  )
                }
                disabled={
                  saving
                }
                aria-label="Close edit profile"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center

                  rounded-full

                  bg-[#F2E0D0]/45

                  text-[#19183B]/55

                  transition-[transform,background-color]
                  duration-150

                  hover:bg-[#F2E0D0]

                  active:scale-[0.95]

                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* =============================================
                SCROLLABLE MODAL BODY
            ============================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain

                px-5
                py-5

                sm:px-6
                sm:py-6
              "
            >
              {editError && (
                <div
                  className="
                    mb-5

                    rounded-[18px]

                    border
                    border-red-100

                    bg-red-50

                    p-3

                    text-sm
                    font-semibold
                    text-red-600
                  "
                >
                  {editError}
                </div>
              )}

              {/* ===========================================
                  LIVE PREVIEW
              =========================================== */}

              <div
                className="
                  mb-6

                  overflow-hidden

                  rounded-[24px]

                  border
                  border-[#E3B58C]

                  bg-[#FCF5EE]
                "
              >
                <div
                  className={`
                    relative
                    h-[105px]
                    w-full

                    bg-gradient-to-r

                    sm:h-[130px]

                    ${editBanner.gradient}
                  `}
                  style={{
                    backgroundImage:
                      editBanner.image
                        ? `linear-gradient(to right, rgba(25,24,59,0.02), rgba(25,24,59,0.02)), url("${editBanner.image}")`
                        : undefined,

                    backgroundSize:
                      "cover",

                    backgroundPosition:
                      "center",

                    backgroundRepeat:
                      "no-repeat",
                  }}
                />

                <div
                  className="
                    relative
                    min-h-[110px]

                    bg-[#FFFDF9]

                    px-4
                    pb-4
                  "
                >
                  <div
                    className={`
                      absolute
                      -top-9
                      left-4

                      h-[78px]
                      w-[78px]

                      overflow-hidden
                      rounded-full

                      border-4

                      bg-[#FFFDF9]

                      p-1

                      shadow-lg

                      ${editAvatarFrame}
                    `}
                  >
                    <div className="h-full w-full overflow-hidden rounded-full">
                      {renderAvatar(
                        editForm.avatarUrl,
                        editAvatarPreset,
                        user?.photoURL,
                        editForm.avatarPreset,
                      )}
                    </div>
                  </div>

                  <div className="pl-[92px] pt-3">
                    <p className="truncate text-lg font-black text-[#19183B]">
                      {editForm.displayName ||
                        nameToDisplay}
                    </p>

                    <span
                      className="
                        mt-1
                        inline-flex

                        rounded-full

                        bg-[#00A9FF]/10

                        px-2.5
                        py-1

                        text-[10px]
                        font-black
                        capitalize
                        text-[#007EBF]
                      "
                    >
                      {role ||
                        "Student"}
                    </span>
                  </div>

                  {editForm.bio && (
                    <p
                      className="
                        mt-4
                        text-xs
                        font-medium
                        leading-relaxed
                        text-[#19183B]/50
                      "
                    >
                      {editForm.bio}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="
                  grid
                  gap-7

                  lg:grid-cols-[1.05fr_0.95fr]
                "
              >
                {/* =========================================
                    LEFT FORM
                ========================================= */}

                <div className="space-y-6">
                  {/* Display name */}

                  <div>
                    <label
                      className="
                        mb-2
                        block
                        text-sm
                        font-black
                        text-[#19183B]
                      "
                    >
                      Display Name
                    </label>

                    <input
                      type="text"
                      value={
                        editForm.displayName
                      }
                      onChange={(
                        e,
                      ) =>
                        setEditForm({
                          ...editForm,

                          displayName:
                            e
                              .target
                              .value,
                        })
                      }
                      maxLength={
                        40
                      }
                      className="
                        w-full

                        rounded-[16px]

                        border
                        border-[#19183B]/10

                        bg-white

                        px-4
                        py-3

                        text-sm
                        font-semibold
                        text-[#19183B]

                        outline-none

                        transition-[border-color,box-shadow]

                        placeholder:text-[#19183B]/30

                        focus:border-[#00A9FF]
                        focus:shadow-[0_0_0_3px_rgba(0,169,255,0.10)]
                      "
                      placeholder="Your name"
                    />
                  </div>

                  {/* Bio */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-black text-[#19183B]">
                        Bio
                      </label>

                      <span className="text-xs font-semibold text-[#19183B]/35">
                        {
                          editForm
                            .bio
                            .length
                        }
                        /180
                      </span>
                    </div>

                    <textarea
                      value={
                        editForm.bio
                      }
                      onChange={(
                        e,
                      ) =>
                        setEditForm({
                          ...editForm,

                          bio:
                            e
                              .target
                              .value,
                        })
                      }
                      maxLength={
                        180
                      }
                      rows={4}
                      className="
                        w-full

                        resize-none

                        rounded-[16px]

                        border
                        border-[#19183B]/10

                        bg-white

                        px-4
                        py-3

                        text-sm
                        font-medium
                        leading-relaxed
                        text-[#19183B]

                        outline-none

                        transition-[border-color,box-shadow]

                        placeholder:text-[#19183B]/30

                        focus:border-[#00A9FF]
                        focus:shadow-[0_0_0_3px_rgba(0,169,255,0.10)]
                      "
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Avatar URL */}

                  <div>
                    <label
                      className="
                        mb-2
                        block

                        text-sm
                        font-black
                        text-[#19183B]
                      "
                    >
                      Avatar URL
                      <span className="ml-1 font-semibold text-[#19183B]/35">
                        Optional
                      </span>
                    </label>

                    <input
                      type="text"
                      value={
                        editForm.avatarUrl
                      }
                      onChange={(
                        e,
                      ) =>
                        setEditForm({
                          ...editForm,

                          avatarUrl:
                            e
                              .target
                              .value,
                        })
                      }
                      maxLength={
                        500
                      }
                      className="
                        w-full

                        rounded-[16px]

                        border
                        border-[#19183B]/10

                        bg-white

                        px-4
                        py-3

                        text-sm
                        font-medium
                        text-[#19183B]

                        outline-none

                        transition-[border-color,box-shadow]

                        placeholder:text-[#19183B]/30

                        focus:border-[#00A9FF]
                        focus:shadow-[0_0_0_3px_rgba(0,169,255,0.10)]
                      "
                      placeholder="https://..."
                    />

                    <p className="mt-1.5 text-xs font-medium text-[#19183B]/35">
                      Leave empty to use one of the avatar presets.
                    </p>
                  </div>
                </div>

                {/* =========================================
                    RIGHT CUSTOMIZATION
                ========================================= */}

                <div
                  className="
                    space-y-7

                    lg:border-l
                    lg:border-[#19183B]/8
                    lg:pl-7
                  "
                >
                  {/* Banner */}

                  <div>
                    <label
                      className="
                        mb-3
                        block

                        text-sm
                        font-black
                        text-[#19183B]
                      "
                    >
                      Banner
                    </label>

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-3

                        sm:grid-cols-3

                        lg:grid-cols-2

                        xl:grid-cols-3
                      "
                    >
                      {Object.entries(
                        BANNER_PRESETS,
                      ).map(
                        ([
                          key,
                          preset,
                        ]) => (
                          <button
                            key={
                              key
                            }
                            type="button"
                            onClick={() =>
                              setEditForm(
                                {
                                  ...editForm,

                                  bannerColor:
                                    key,
                                },
                              )
                            }
                            title={
                              preset.label
                            }
                            className={`
                              relative

                              aspect-[1.75/1]
                              w-full

                              overflow-hidden

                              rounded-[16px]

                              border-[3px]

                              bg-gradient-to-r

                              shadow-sm

                              transition-[transform,border-color]
                              duration-150

                              hover:-translate-y-px

                              ${preset.gradient
                              }

                              ${editForm.bannerColor ===
                                key
                                ? "border-[#00A9FF]"
                                : "border-transparent"
                              }
                            `}
                            style={{
                              backgroundImage:
                                preset.image
                                  ? `linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.05)), url("${preset.image}")`
                                  : undefined,

                              backgroundSize:
                                "cover",

                              backgroundPosition:
                                "center",
                            }}
                          >
                            {editForm.bannerColor ===
                              key && (
                                <div
                                  className="
                                  absolute
                                  right-2
                                  top-2

                                  flex
                                  h-6
                                  w-6
                                  items-center
                                  justify-center

                                  rounded-full

                                  bg-[#00A9FF]

                                  text-[#19183B]

                                  shadow-sm
                                "
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Avatar Theme */}

                  {!editForm.avatarUrl && (
                    <div>
                      <label
                        className="
                          mb-3
                          block

                          text-sm
                          font-black
                          text-[#19183B]
                        "
                      >
                        Avatar Theme
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {Object.entries(
                          AVATAR_PRESETS,
                        ).map(
                          ([
                            key,
                            preset,
                          ]) => (
                            <button
                              key={
                                key
                              }
                              type="button"
                              onClick={() =>
                                setEditForm(
                                  {
                                    ...editForm,

                                    avatarPreset:
                                      key,
                                  },
                                )
                              }
                              title={
                                preset.label
                              }
                              className={`
                                relative

                                flex
                                h-16
                                w-16
                                items-center
                                justify-center

                                overflow-hidden
                                rounded-full

                                border-[3px]

                                shadow-sm

                                transition-[transform,border-color]
                                duration-150

                                hover:-translate-y-px

                                ${preset.className
                                }

                                ${editForm.avatarPreset ===
                                  key
                                  ? "border-[#00A9FF]"
                                  : "border-transparent"
                                }
                              `}
                            >
                              {key ===
                                "default" &&
                                user?.photoURL ? (
                                <Image
                                  src={
                                    user.photoURL
                                  }
                                  alt="Default avatar"
                                  width={
                                    64
                                  }
                                  height={
                                    64
                                  }
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : preset.image ? (
                                <Image
                                  src={
                                    preset.image
                                  }
                                  alt={
                                    preset.label
                                  }
                                  width={
                                    64
                                  }
                                  height={
                                    64
                                  }
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <User
                                  className="h-6 w-6"
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              )}

                              {editForm.avatarPreset ===
                                key && (
                                  <div
                                    className="
                                    absolute
                                    inset-0

                                    flex
                                    items-center
                                    justify-center

                                    bg-[#19183B]/22
                                  "
                                  >
                                    <div
                                      className="
                                      flex
                                      h-7
                                      w-7
                                      items-center
                                      justify-center

                                      rounded-full

                                      bg-[#00A9FF]

                                      text-[#19183B]
                                    "
                                    >
                                      <Check
                                        className="h-4 w-4"
                                        strokeWidth={
                                          3
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Avatar Frame */}

                  <div>
                    <label
                      className="
                        mb-3
                        block

                        text-sm
                        font-black
                        text-[#19183B]
                      "
                    >
                      Avatar Frame
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {Object.entries(
                        AVATAR_FRAMES,
                      ).map(
                        ([
                          key,
                          frameClass,
                        ]) => (
                          <button
                            key={
                              key
                            }
                            type="button"
                            onClick={() =>
                              setEditForm(
                                {
                                  ...editForm,

                                  avatarFrame:
                                    key,
                                },
                              )
                            }
                            title={
                              key
                            }
                            className={`
                              flex
                              h-14
                              w-14
                              items-center
                              justify-center

                              rounded-full

                              border-[5px]

                              bg-white

                              shadow-sm

                              transition-[transform,box-shadow]
                              duration-150

                              hover:-translate-y-px

                              ${frameClass}

                              ${editForm.avatarFrame ===
                                key
                                ? "scale-[1.05] ring-2 ring-[#00A9FF] ring-offset-2"
                                : ""
                              }
                            `}
                          >
                            {editForm.avatarFrame ===
                              key && (
                                <Check
                                  className="h-4 w-4 text-[#19183B]/45"
                                  strokeWidth={
                                    3
                                  }
                                />
                              )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================
                MODAL FOOTER
            ============================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-end
                gap-3

                border-t
                border-[#19183B]/8

                bg-[#FFFDF9]

                px-5
                py-4

                sm:px-6
              "
            >
              <button
                type="button"
                onClick={() =>
                  setIsEditing(
                    false,
                  )
                }
                disabled={
                  saving
                }
                className="
                  min-h-[44px]

                  rounded-[16px]

                  border
                  border-[#19183B]/10

                  bg-white

                  px-5

                  text-sm
                  font-black
                  text-[#19183B]/55

                  transition-[transform,background-color]
                  duration-150

                  hover:bg-[#F2E0D0]/30

                  active:translate-y-[2px]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveProfile
                }
                disabled={
                  saving
                }
                className="
                  flex
                  min-h-[44px]
                  items-center
                  gap-2

                  rounded-[16px]

                  bg-[#00A9FF]

                  px-5

                  text-sm
                  font-black
                  text-[#19183B]

                  shadow-[0_4px_0_#0085C7]

                  transition-[transform,box-shadow]
                  duration-150

                  hover:-translate-y-px

                  active:translate-y-[2px]
                  active:scale-[0.99]
                  active:shadow-[0_1px_0_#0085C7]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:shadow-none
                "
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {saving
                  ? "Saving…"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardBottomNav
        activeTab="profile"
      />

    </main>
  );
}