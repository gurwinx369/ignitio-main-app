"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Layers } from 'lucide-react';
import RoadmapWorldView from '@/layout/Card/RoadmapWorldView';
import LessonPopup from '@/layout/Card/LessonPopup';
import LevelCompletionToast from '@/layout/Card/LevelCompletionToast';
import LevelContent from '@/layout/LevelContent/LevelContent';
import Profile from "@/layout/Profile";
import RoadmapSkeleton from '@/components/roadmap/RoadmapSkeleton';
import KyleAssignmentModal from '@/layout/LevelContent/KyleAssignmentModal';
import {
    isKyleEnabledRoadmap,
    isAssignmentGatedRoadmap as isAssignmentGatedRoadmapType,
} from "@/features/roadmaps/lib/roadmapCapabilities";
import { useAuth } from "@/features/context/AuthContext";
import { fetchRoadmapProgress, migrateRoadmapProgress, patchRoadmapProgress } from "@/features/roadmaps/lib/progressApi";
import { readLocalRoadmapProgress, writeLocalRoadmapProgress } from "@/lib/roadmaps/progress.migration";
import CertificateUnlockedModal from '@/features/certificates/CertificateUnlockedModal';
import { checkCertificateUnlock, getEligibleCertificates } from '@/features/certificates/certificateMilestones';
import { saveUnlockedCertificate, hasUnlockedCertificate } from '@/features/certificates/certificateStorage';
import { useBehaviorQuiz } from '@/features/kyle/behavior-quiz/useBehaviorQuiz';
import BehaviorQuizModal from '@/features/kyle/behavior-quiz/BehaviorQuizModal';
import PreviewCardLockedModal from "@/features/onboarding/PreviewCardLockedModal";
import { scheduleIdleTask } from "@/lib/utils/idleTask";

// Hoisted to module level — prevents re-allocation on every render cycle.
// Vercel best practice: rendering-hoist-jsx
const ROADMAP_SKELETON_MIN_MS = 450;

export default function RoadmapTemplate({ roadmapData, backHref = "/home", isPreview = false }) {
    const router = useRouter();
    const { user } = useAuth();
    // Reactive profession — reads localStorage once at mount, then stays in sync
    // via the native 'storage' event if the user changes it in another tab or
    // from a profile settings page mid-session.
    const [userProfession, setUserProfession] = useState(
        () => (typeof window !== "undefined" && localStorage.getItem("profession")) || "other"
    );

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "profession") {
                setUserProfession(e.newValue || "other");
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const [isMounted, setIsMounted] = useState(false);

    // Behavior quiz ΓÇö fires after every 3rd concept completion across all roadmaps
    const behaviorQuiz = useBehaviorQuiz({ user, roadmapId: roadmapData.id });
    const { isPreparingQuiz, interceptLevelStart } = behaviorQuiz;

    // Locks the first requested lesson until Behavior Quiz gating is fully resolved.
    // Subsequent rapid clicks are ignored until the loading state resolves.
    const pendingLessonRef = useRef(null);

    const [isWaitingForBehaviorQuiz, setIsWaitingForBehaviorQuiz] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsWaitingForBehaviorQuiz(false);
        return () => {
            pendingLessonRef.current = null;
        };
    }, [roadmapData.id]);

    const [activeDayIndex, setActiveDayIndex] = useState(0);

    // Flat array of completed level IDs
    const [completedLevels, setCompletedLevels] = useState([]);

    const [progressLoadError, setProgressLoadError] =
        useState(false);

    const [progressRetryKey, setProgressRetryKey] =
        useState(0);

    const [popupLevel, setPopupLevel] = useState(null);
    const [popupAnchor, setPopupAnchor] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [showCompletion, setShowCompletion] = useState(false);
    const [isRoadmapReady, setIsRoadmapReady] = useState(false);
    const [completionPopup, setCompletionPopup] = useState(null);
    const [unlockedCertificate, setUnlockedCertificate] = useState(null);
    // Preview-only: holds the certificate + level data for the locked card modal
    const [previewCardData, setPreviewCardData] = useState(null);

    // Assignment gate state
    const [assignmentPassedDays, setAssignmentPassedDays] = useState({});
    const [assignmentStateLoaded, setAssignmentStateLoaded] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    const certificateBackfillRan = useRef(false);

    const prevCompletedCount = useRef(0);
    const roadmapViewportRef = useRef(null);
    const dayTabsContainerRef = useRef(null);
    const dayButtonRefs = useRef([]);

    const completionToastTimerRef = useRef(null);

    const triggerCompletionToast = () => {
        setShowCompletion(true);
        if (completionToastTimerRef.current) {
            clearTimeout(completionToastTimerRef.current);
        }
        completionToastTimerRef.current = setTimeout(() => {
            setShowCompletion(false);
        }, 2500);
    };

    useEffect(() => {
        return () => {
            if (completionToastTimerRef.current) {
                clearTimeout(completionToastTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRoadmapReady(true);
        }, ROADMAP_SKELETON_MIN_MS);
        return () => clearTimeout(timer);
    }, [activeDayIndex, roadmapData.id]);

    const allLevels = useMemo(() => {
        return roadmapData.days.flatMap(day => day.levels);
    }, [roadmapData.days]);

    useEffect(() => {
        setIsMounted(true);
        
        const loadProgress = async () => {
            if (!user) {
                // Premium GenAI progress is server-owned in the authenticated app.
                // Preview mode intentionally uses local progress for the demo flow.
                if (
                    roadmapData.id === "gen-ai-internship" &&
                    !isPreview
                ) {
                    return;
                }

                const localProgress =
                    readLocalRoadmapProgress({
                        roadmapId: roadmapData.id,
                        allLevels,
                        days: roadmapData.days,
                    });

                setCompletedLevels(
                    localProgress.completedLevels,
                );

                prevCompletedCount.current =
                    localProgress.completedLevels.length;

                writeLocalRoadmapProgress({
                    roadmapId: roadmapData.id,
                    completedLevels:
                        localProgress.completedLevels,
                });

                return;
            }
            try {
                // 1. Attempt to fetch MongoDB progress
                const res = await fetchRoadmapProgress({ user, roadmapSlug: roadmapData.id });

                if (res && res.source === "mongodb") {
                    const serverCompletedLevels =
                        res.progress.completedLevels || [];

                    const serverPassedAssignments =
                        res.progress.passedAssignments || [];

                    setCompletedLevels(serverCompletedLevels);

                    prevCompletedCount.current =
                        serverCompletedLevels.length;

                    const passedMap = {};

                    for (const dayId of serverPassedAssignments) {
                        passedMap[dayId] = true;
                    }

                    setAssignmentPassedDays(passedMap);
                    setAssignmentStateLoaded(true);
                    setProgressLoadError(false);

                    writeLocalRoadmapProgress({
                        roadmapId: roadmapData.id,
                        completedLevels: serverCompletedLevels,
                        passedAssignments: serverPassedAssignments,
                    });
                } else {
                    // 2. Not found in MongoDB, run migration
                    const localProgress = readLocalRoadmapProgress({ roadmapId: roadmapData.id, allLevels, days: roadmapData.days });

                    // Optimistic update
                    setCompletedLevels(localProgress.completedLevels);
                    prevCompletedCount.current = localProgress.completedLevels.length;

                    const migrationPayload = {
                        roadmapTitle: roadmapData.title || "",
                        role: userProfession,
                        totalLevels: allLevels.length,
                        allLevelIds: allLevels.map(l => l.id),
                        days: roadmapData.days.map(d => ({ id: d.id, levelIds: d.levels.map(l => l.id) })),
                        completedLevels: localProgress.completedLevels,
                        passedAssignments: localProgress.passedAssignments,
                    };

                    const migrated = await migrateRoadmapProgress({ user, roadmapSlug: roadmapData.id, payload: migrationPayload });
                    if (migrated && migrated.progress) {
                        setCompletedLevels(migrated.progress.completedLevels || []);
                        prevCompletedCount.current = (migrated.progress.completedLevels || []).length;
                    }
                }
            } catch (err) {
                if (
                    roadmapData.id ===
                    "gen-ai-internship"
                ) {
                    console.warn(
                        "[Premium GenAI] Failed to load trusted progress",
                        err,
                    );

                    setProgressLoadError(true);
                    setAssignmentStateLoaded(false);

                    return;
                }

                console.warn(
                    "Failed to sync progress, using localStorage fallback",
                    err,
                );

                const localProgress =
                    readLocalRoadmapProgress({
                        roadmapId: roadmapData.id,
                        allLevels,
                        days: roadmapData.days,
                    });

                setCompletedLevels(
                    localProgress.completedLevels,
                );

                prevCompletedCount.current =
                    localProgress.completedLevels.length;

                writeLocalRoadmapProgress({
                    roadmapId: roadmapData.id,
                    completedLevels:
                        localProgress.completedLevels,
                });
            }

        };
        loadProgress();
    }, [roadmapData.id, allLevels, user, roadmapData.days, roadmapData.title, progressRetryKey, isPreview]);

    useEffect(() => {
        if (!isMounted) return;

        prevCompletedCount.current = completedLevels.length;

        // Optionally store total globally like old code
        scheduleIdleTask(() => {
            localStorage.setItem("completedLevels", JSON.stringify(completedLevels.length));
        });
    }, [completedLevels, isMounted]);

    const activeDay = roadmapData.days[activeDayIndex];

    const isKyleRoadmap = isKyleEnabledRoadmap(roadmapData.id);
    const hasAssignmentGate = isAssignmentGatedRoadmapType(roadmapData.id);

    useEffect(() => {
        if (typeof window === "undefined" || !roadmapData?.id) return;
        if (roadmapData.id === "gen-ai-internship") return;

        const timer = setTimeout(() => {
            const passedMap = {};
            roadmapData.days.forEach(day => {
                if (localStorage.getItem(`assignment_passed_${roadmapData.id}_${day.id}`) === "true") {
                    passedMap[day.id] = true;
                }
            });
            setAssignmentPassedDays(passedMap);
            setAssignmentStateLoaded(true);
        }, 0);

        return () => clearTimeout(timer);
    }, [roadmapData.id, roadmapData.days]);

    useEffect(() => {
        certificateBackfillRan.current = false;
    }, [roadmapData.id]);

    useEffect(() => {
        if (!isMounted) return;
        if (!roadmapData?.id) return;
        if (!assignmentStateLoaded) return;
        if (certificateBackfillRan.current) return;

        certificateBackfillRan.current = true;

        scheduleIdleTask(() => {
            const eligibleCertificates = getEligibleCertificates({
                roadmapData,
                completedLevels,
                assignmentPassedDays,
            });

            eligibleCertificates.forEach((certificate) => {
                if (hasUnlockedCertificate(certificate.certificateKey, certificate.roadmapFamily)) {
                    return;
                }

                const milestoneLevels = certificate.milestoneLevels || [];
                const durationMinutes = milestoneLevels.reduce(
                    (acc, lvl) => acc + Number(lvl.durationInMinutes || 0),
                    0
                );
                const quizCompletedCount = milestoneLevels.length;

                const dateObj = new Date(certificate.unlockedAt);
                const providedOn = `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "long" })} ${dateObj.getFullYear()}`;

                saveUnlockedCertificate({
                    ...certificate,
                    quizCompletedCount,
                    durationMinutes,
                    providedOn,
                });
            });
        }, { timeout: 3000 });
    }, [isMounted, roadmapData, completedLevels, assignmentPassedDays, assignmentStateLoaded]);

    useEffect(() => {
        if (typeof window === "undefined" || !roadmapData?.id) return;

        scheduleIdleTask(() => {
            localStorage.setItem("ignitio:last_active_roadmap", JSON.stringify({
                id: roadmapData.id,
                title: roadmapData.title,
                route: window.location.pathname,
                updatedAt: Date.now(),
            }));
        });
    }, [roadmapData.id, roadmapData.title]);

    const arePreviousAssignmentsPassed = (dayIndex) => {
        if (!hasAssignmentGate) return true;
        if (dayIndex <= 0) return true;

        return roadmapData.days
            .slice(0, dayIndex)
            .every(day => assignmentPassedDays[day.id]);
    };

    const getUnlockStateWithCompleted = (level, currentCompletedLevels) => {
        if (!level) return { isUnlocked: false, lockedReason: "Not available" };

        let globalUnlocked = false;
        if (currentCompletedLevels.includes(level.id)) {
            globalUnlocked = true;
        } else {
            const globalIndex = allLevels.findIndex(l => l.id === level.id);
            if (globalIndex <= 0) {
                globalUnlocked = true;
            } else {
                const prevLevel = allLevels[globalIndex - 1];
                globalUnlocked = currentCompletedLevels.includes(prevLevel.id);
            }
        }

        if (!globalUnlocked) {
            return { isUnlocked: false, lockedReason: "Complete Previous Lesson First" };
        }

        if (hasAssignmentGate) {
            const dayIndex = roadmapData.days.findIndex(d => d.levels.some(l => l.id === level.id));
            if (dayIndex > 0) {
                const prevPassed = arePreviousAssignmentsPassed(dayIndex);
                if (!prevPassed) {
                    const prevDay = roadmapData.days[dayIndex - 1];
                    const prevDayNumber = Number(String(prevDay?.id || "").match(/\d+/)?.[0]) || dayIndex;
                    return { isUnlocked: false, lockedReason: `Complete Day ${prevDayNumber} assignment first` };
                }
            }
        }

        return { isUnlocked: true, lockedReason: null };
    };

    const closeLessonPopup = () => {
        setPopupLevel(null);
        setPopupAnchor(null);
    };

    const handlePrevDay = () => {
        closeLessonPopup();
        setIsRoadmapReady(false);
        setActiveDayIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextDay = () => {
        closeLessonPopup();
        setIsRoadmapReady(false);
        setActiveDayIndex(prev => Math.min(roadmapData.days.length - 1, prev + 1));
    };



    useEffect(() => {
        const activeButton = dayButtonRefs.current[activeDayIndex];
        if (!activeButton) return;

        activeButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [activeDayIndex]);

    const handleNodeClick = (level, event) => {
        if (event && event.currentTarget && roadmapViewportRef.current) {
            const nodeRect = event.currentTarget.getBoundingClientRect();
            const containerRect = roadmapViewportRef.current.getBoundingClientRect();

            setPopupAnchor({
                x: nodeRect.left - containerRect.left + nodeRect.width / 2,
                y: nodeRect.top - containerRect.top + nodeRect.height / 2,
                containerWidth: containerRect.width,
                containerHeight: containerRect.height,
            });
        } else {
            setPopupAnchor(null);
        }
        setPopupLevel(level);
    };

    /**
     * Actually starts a lesson: patches progress and sets selectedLevel.
     * This is the single authoritative "open lesson" call.
     */
    const actuallyStartLesson = useCallback(async (level) => {
        setSelectedLevel(level);
        if (user) {
            try {
                await patchRoadmapProgress({
                    user,
                    roadmapSlug: roadmapData.id,
                    payload: {
                        action: "start_lesson",
                        roadmapTitle: roadmapData.title || "",
                        role: userProfession,
                        totalLevels: allLevels.length,
                        allLevelIds: allLevels.map(l => l.id),
                        levelId: level.id
                    }
                });
            } catch (e) {
                console.warn("Failed to patch start_lesson", e);
            }
        }
    }, [user, roadmapData.id, roadmapData.title, allLevels]);

    const openQueuedLesson = useCallback(async () => {
        const queuedLevel = pendingLessonRef.current;
        if (!queuedLevel) return;

        // Clear before starting so duplicate callbacks cannot start it twice.
        pendingLessonRef.current = null;
        setIsWaitingForBehaviorQuiz(false);

        await actuallyStartLesson(queuedLevel);
    }, [actuallyStartLesson]);

    /**
     * Shared entry point for all lesson-start paths.
     * Awaits any in-flight behavior quiz trigger before proceeding.
     * Only the FIRST accepted call during a preparation window is honoured;
     * rapid follow-up clicks are silently dropped.
     */
    const startLessonAfterBehaviorQuiz = useCallback(async (level) => {
        if (!level) return;
        if (pendingLessonRef.current) return;

        pendingLessonRef.current = level;
        setIsWaitingForBehaviorQuiz(true);

        try {
            const wasIntercepted = await interceptLevelStart(() => {
                void openQueuedLesson();
            });

            if (!wasIntercepted) {
                await openQueuedLesson();
            }
        } catch (error) {
            console.error(
                "[BehaviorQuiz] Failed to gate lesson navigation",
                error
            );
            await openQueuedLesson();
        }
    }, [interceptLevelStart, openQueuedLesson]);

    const handleStartLesson = async (level) => {
        setPopupLevel(null);
        await startLessonAfterBehaviorQuiz(level);
    };

    const handleVideoComplete = async (levelId) => {
        // Duplicate protection: do not show a duplicate completion popup if already completed
        if (completedLevels.includes(levelId)) return;

        // Preview flow: show locked card modal instead of regular completion popup.
        if (isPreview) {
            const updatedCompleted = [...completedLevels, levelId];

            setCompletedLevels(updatedCompleted);
            writeLocalRoadmapProgress({
                roadmapId: roadmapData.id,
                completedLevels: updatedCompleted,
            });

            if (typeof window !== "undefined") {
                localStorage.setItem("has_completed_first_lesson", "true");
            }

            triggerCompletionToast();

            let previewCert = checkCertificateUnlock({
                roadmapData,
                completedLevels: updatedCompleted,
                levelId,
                triggerType: "level",
            });

            if (previewCert) {
                const milestoneLevels = previewCert.milestoneLevels || [];
                previewCert = {
                    ...previewCert,
                    quizCompletedCount: milestoneLevels.length,
                    durationMinutes: milestoneLevels.reduce(
                        (acc, lvl) => acc + Number(lvl.durationInMinutes || 0),
                        0
                    ),
                    providedOn: new Date(previewCert.unlockedAt).toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "long", year: "numeric" }
                    ),
                };
            } else {
                previewCert = {
                    certificateKey: `preview-${roadmapData.id}`,
                    roadmapFamily: roadmapData.id,
                    milestoneTitle: roadmapData.title || "Lesson Complete",
                    learnerName: "You",
                    providedOn: new Date().toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }),
                    quizCompletedCount: 1,
                    durationMinutes: 0,
                };
            }

            setPreviewCardData({
                certificate: previewCert,
                completedLevelId: levelId,
                completedLevels: updatedCompleted,
            });
            return;
        }

        const isGenAiRoadmap = roadmapData.id === "gen-ai-internship";

        const updatedCompleted = [...completedLevels, levelId];
        const sortedCompleted = updatedCompleted.sort((a, b) => {
            return allLevels.findIndex(l => l.id === a) - allLevels.findIndex(l => l.id === b);
        });

        // Generic roadmaps keep their existing optimistic behavior.
        // Premium GenAI must wait for trusted server acceptance.
        if (!isGenAiRoadmap) {
            setCompletedLevels(sortedCompleted);

            writeLocalRoadmapProgress({
                roadmapId: roadmapData.id,
                completedLevels: sortedCompleted
            });

            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "has_completed_first_lesson",
                    "true"
                );

                window.dispatchEvent(
                    new CustomEvent("lesson_completed", {
                        detail: {
                            levelId,
                            roadmapId: roadmapData.id
                        }
                    })
                );
            }

            triggerCompletionToast();
        }

        let completionLevels = sortedCompleted;

        // GenAI progress is server-owned. Without an authenticated user,
        // do not mutate completion/unlock state.
        if (isGenAiRoadmap && !user) {
            console.warn(
                "Cannot complete GenAI level without an authenticated user"
            );
            return;
        }


        if (user) {
            try {
                const res = await patchRoadmapProgress({
                    user,
                    roadmapSlug: roadmapData.id,
                    payload: {
                        action: "complete_level",
                        roadmapTitle: roadmapData.title || "",
                        role: userProfession,
                        totalLevels: allLevels.length,
                        allLevelIds: allLevels.map(l => l.id),
                        days: roadmapData.days.map(d => ({
                            id: d.id,
                            levelIds: d.levels.map(l => l.id)
                        })),
                        levelId
                    }
                });

                if (isGenAiRoadmap) {
                    const trustedCompletedLevels =
                        Array.isArray(res?.progress?.completedLevels)
                            ? res.progress.completedLevels
                            : null;

                    // A successful response without server-confirmed completion
                    // must not unlock anything locally.
                    if (
                        !trustedCompletedLevels ||
                        !trustedCompletedLevels.includes(levelId)
                    ) {
                        console.warn(
                            "GenAI complete_level response did not confirm the completed level"
                        );
                        return;
                    }

                    completionLevels = trustedCompletedLevels;

                    setCompletedLevels(trustedCompletedLevels);

                    // Local storage is only a cache here.
                    // The value comes from trusted server progress.
                    writeLocalRoadmapProgress({
                        roadmapId: roadmapData.id,
                        completedLevels: trustedCompletedLevels
                    });

                    // If the server says this level was already completed,
                    // reconcile state but do not replay completion side effects.
                    if (res?.newCompletion !== true) {
                        return;
                    }

                    triggerCompletionToast();

                    // Behavioral quiz counting only follows a newly accepted
                    // canonical GenAI completion.
                    void behaviorQuiz.triggerInBackground(levelId);
                } else if (res?.progress) {
                    // Preserve existing reconciliation for generic roadmaps.
                    setCompletedLevels(res.progress.completedLevels || []);
                }
            } catch (e) {
                console.warn("Failed to patch complete_level", e);

                // Existing progress ambiguity recovery:
                // explicit 4xx means the server rejected the mutation.
                const isClientError =
                    e.message && e.message.match(/progress: 4\d\d/);

                if (isGenAiRoadmap) {
                    // Explicit rejection must never become a local completion.
                    if (isClientError) {
                        return;
                    }

                    // For an ambiguous network/server failure, read the canonical
                    // progress back. Continue only if the server confirms it.
                    try {
                        const progressRes = await fetchRoadmapProgress({
                            user,
                            roadmapSlug: roadmapData.id
                        });

                        const recoveredCompletedLevels =
                            Array.isArray(progressRes?.progress?.completedLevels)
                                ? progressRes.progress.completedLevels
                                : null;

                        if (
                            !recoveredCompletedLevels ||
                            !recoveredCompletedLevels.includes(levelId)
                        ) {
                            return;
                        }

                        completionLevels = recoveredCompletedLevels;

                        setCompletedLevels(recoveredCompletedLevels);

                        writeLocalRoadmapProgress({
                            roadmapId: roadmapData.id,
                            completedLevels: recoveredCompletedLevels
                        });

                        triggerCompletionToast();

                        // Trigger is idempotent on the backend, so ambiguity
                        // recovery can safely retry the behavioral milestone.
                        void behaviorQuiz.triggerInBackground(levelId);
                    } catch (recoveryErr) {
                        console.warn(
                            "Failed to recover progress state",
                            recoveryErr
                        );
                        return;
                    }
                } else if (!isClientError) {
                    // Preserve the existing generic-roadmap recovery request.
                    try {
                        await fetchRoadmapProgress({
                            user,
                            roadmapSlug: roadmapData.id
                        });
                    } catch (recoveryErr) {
                        console.warn(
                            "Failed to recover progress state",
                            recoveryErr
                        );
                    }
                }
            }
        }

        // Generic roadmaps use the same optimistic array as before.
        // GenAI reaches here only with server-confirmed completedLevels.
        let certificate = checkCertificateUnlock({
            roadmapData,
            completedLevels: completionLevels,
            levelId,
            triggerType: 'level'
        });

        if (certificate) {
            const milestoneLevels = certificate.milestoneLevels || [];
            const durationMinutes = milestoneLevels.reduce(
                (acc, lvl) => acc + Number(lvl.durationInMinutes || 0),
                0
            );
            const quizCompletedCount = milestoneLevels.length;

            const dateObj = new Date(certificate.unlockedAt);
            const providedOn =
                `${dateObj.getDate()} ${dateObj.toLocaleString('default', {
                    month: 'long'
                })} ${dateObj.getFullYear()}`;

            certificate = {
                ...certificate,
                quizCompletedCount,
                durationMinutes,
                providedOn
            };

            if (process.env.NODE_ENV === "development") {
                console.log("[Certificate unlock payload]", {
                    certificateKey: certificate.certificateKey,
                    milestoneLevelsCount: milestoneLevels.length,
                    durationMinutes,
                    quizCompletedCount,
                    levelIds: milestoneLevels.map(l => l.id),
                });
            }

            const alreadyUnlocked = hasUnlockedCertificate(certificate.certificateKey, certificate.roadmapFamily);
            const saved = saveUnlockedCertificate(certificate);
            if (saved && !alreadyUnlocked) {
                setUnlockedCertificate(certificate);
            }
        }

        // Calculate next level using the trusted completion array for GenAI.
        const globalIndex = allLevels.findIndex(l => l.id === levelId);
        let nextLevel = null;

        if (
            globalIndex >= 0 &&
            globalIndex < allLevels.length - 1
        ) {
            nextLevel = allLevels[globalIndex + 1];
        }

        let isNextLevelUnlocked = false;

        if (nextLevel) {
            const unlockState = getUnlockStateWithCompleted(
                nextLevel,
                completionLevels
            );
            isNextLevelUnlocked = unlockState.isUnlocked;
        }

        setCompletionPopup({
            completedLevelId: levelId,
            nextLevel: isNextLevelUnlocked ? nextLevel : null
        });

        // Do not auto-open assignment from inside LevelContent.
        // Assignment is intentionally opened only from the roadmap CTA after user returns.
    };

    const dayNumber = Number(String(activeDay?.id || "").match(/\d+/)?.[0]) || activeDayIndex + 1;

    const isCurrentDayComplete = useMemo(() => {
        if (!activeDay) return false;
        return activeDay.levels.every(l => completedLevels.includes(l.id));
    }, [activeDay, completedLevels]);

    const isCurrentDayAssignmentPassed = activeDay ? !!assignmentPassedDays[activeDay.id] : false;

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!selectedLevel) {
                window.__IS_ON_ROADMAP_SCREEN = true;
                window.dispatchEvent(new Event("entered_roadmap_screen"));
            } else {
                window.__IS_ON_ROADMAP_SCREEN = false;
            }
            return () => {
                window.__IS_ON_ROADMAP_SCREEN = false;
            };
        }
    }, [selectedLevel]);


    const renderContent = () => {
        if (
            roadmapData.id ===
            "gen-ai-internship" &&
            progressLoadError
        ) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary)] p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <h2 className="mb-2 text-xl font-bold text-slate-900">
                            Unable to Load Progress
                        </h2>

                        <p className="mb-6 text-slate-600">
                            We could not verify your Premium GenAI progress. Your saved progress has not been changed.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setProgressLoadError(false);
                                setProgressRetryKey(
                                    value => value + 1,
                                );
                            }}
                            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }
        if (selectedLevel) {
            return (
                <LevelContent
                    key={`${roadmapData.id}-${selectedLevel.id}`}
                    level={selectedLevel}
                    onBack={() => setSelectedLevel(null)}
                    onComplete={handleVideoComplete}
                    isCompleted={completedLevels.includes(selectedLevel.id)}
                    roadmapType={roadmapData.id}
                    dayNumber={dayNumber}
                    showAssignmentModal={showAssignmentModal}
                    isPreview={isPreview}
                />
            );
        }

        return (
            <div className="min-h-screen bg-[var(--color-primary)] pb-24 font-sans relative">
                <div className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-[var(--color-primary)]/80 backdrop-blur-md border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <button
                            onClick={() => router.push(isPreview ? "/preview/home" : backHref)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/90 hover:bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {isPreview ? 'Choose Roadmap' : (backHref !== '/home' ? 'Back to Hub' : 'Back to Home')}
                            </span>
                            <span className="sm:hidden">Back</span>
                        </button>
                        {!isPreview && <Profile compact />}
                    </div>
                </div>

                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <section className="rounded-[2rem] border border-[#f1e4d2] bg-[#fffaf3] p-6 shadow-sm md:p-8 relative overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
                        </div>

                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
                            <div className="max-w-3xl min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
                                    Roadmap
                                </p>
                                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl text-balance">
                                    {roadmapData.title}
                                </h1>
                                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                    {roadmapData.description}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm border border-slate-100">
                                        <Calendar className="w-4 h-4 text-cyan-600" />
                                        {roadmapData.days.length} days
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm border border-slate-100">
                                        <Layers className="w-4 h-4 text-cyan-600" />
                                        {allLevels.length} levels
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="flex items-center gap-2 mb-8 relative">
                        <button
                            onClick={handlePrevDay}
                            disabled={activeDayIndex === 0}
                            className={`p-2 rounded-full border transition-all ${activeDayIndex === 0 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : 'hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={dayTabsContainerRef} className="flex-1 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="flex items-center gap-3 px-1 py-1 w-full max-w-full">
                                {roadmapData.days.map((day, index) => {
                                    const isActive = activeDayIndex === index;
                                    return (
                                        <button
                                            key={day.id}
                                            ref={(el) => {
                                                dayButtonRefs.current[index] = el;
                                            }}
                                            onClick={() => {
                                                closeLessonPopup();
                                                setIsRoadmapReady(false);
                                                setActiveDayIndex(index);
                                            }}
                                            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]' : 'bg-white/60 backdrop-blur-md text-gray-600 hover:bg-white hover:text-slate-900 border border-gray-200/50 hover:shadow-sm'}`}
                                        >
                                            {day.title}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleNextDay}
                            disabled={activeDayIndex === roadmapData.days.length - 1}
                            className={`p-2 rounded-full border transition-all ${activeDayIndex === roadmapData.days.length - 1 ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : 'hover:bg-white bg-white/60 backdrop-blur-md border-gray-300 text-gray-700 shadow-sm hover:shadow-md'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {hasAssignmentGate && isCurrentDayComplete && !isCurrentDayAssignmentPassed && (
                        <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
                            <div>
                                <h3 className="font-bold text-orange-900 text-lg">Day {dayNumber} Assignment Pending</h3>
                                <p className="text-orange-700 text-sm">Pass the assignment to unlock the next day&apos;s lessons.</p>
                            </div>
                            <button
                                onClick={() => setShowAssignmentModal(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                            >
                                Complete Assignment
                            </button>
                        </div>
                    )}

                    {activeDay && (
                        <div ref={roadmapViewportRef} className="relative transition-all duration-700 opacity-100">
                            {(!isMounted || !isRoadmapReady) ? (
                                <RoadmapSkeleton color={activeDay.color} nodeCount={activeDay.levels?.length ?? 7} />
                            ) : (
                                <div className="w-full overflow-hidden">
                                    {/* We map activeDay to difficulty prop just so background layers work if they still rely on it, but use color dynamically */}
                                    <RoadmapWorldView
                                        levels={activeDay.levels}
                                        allLevels={allLevels}
                                        completedLevels={completedLevels}
                                        color={activeDay.color}
                                        onNodeClick={handleNodeClick}
                                        difficulty={activeDay.id}
                                        roadmapId={roadmapData.id}
                                    />
                                </div>
                            )}

                            {isMounted && popupLevel && (() => {
                                const isPopupLevelInActiveDay = activeDay?.levels?.some(level => level.id === popupLevel.id);
                                if (!isPopupLevelInActiveDay) return null;

                                const unlockState = getUnlockStateWithCompleted(popupLevel, completedLevels);
                                return (
                                    <LessonPopup
                                        level={popupLevel}
                                        isCompleted={completedLevels.includes(popupLevel.id)}
                                        isUnlocked={unlockState.isUnlocked}
                                        lockedReason={unlockState.lockedReason}
                                        onStart={() => handleStartLesson(popupLevel)}
                                        onClose={() => setPopupLevel(null)}
                                        difficulty={activeDay.id}
                                        anchor={popupAnchor}
                                    />
                                );
                            })()}

                            {isMounted && showCompletion && (
                                <LevelCompletionToast difficulty={activeDay.id} color={activeDay.color} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}

            {/* ΓöÇΓöÇ Behavior Quiz preparation loading overlay ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
            {isWaitingForBehaviorQuiz &&
                isPreparingQuiz &&
                !behaviorQuiz.isOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#FAF9F6] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="bg-white px-6 py-5 border-b border-orange-50 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-orange-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                    <Image
                                        src="/kyle/kyle.svg"
                                        alt="Kyle"
                                        width={48}
                                        height={48}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Knowledge Check Incoming</h3>
                                    <p className="text-sm text-gray-500">Kyle is preparing your questionsΓÇª</p>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col items-center gap-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                                </div>
                                <p className="text-sm text-gray-600 text-center">Reviewing your recent completed concepts.</p>
                            </div>
                        </div>
                    </div>
                )}

            {/* Behavior quiz modal ΓÇö intercepts the next level start after every 3rd completion */}
            <BehaviorQuizModal
                isOpen={behaviorQuiz.isOpen}
                currentItem={behaviorQuiz.currentItem}
                currentIndex={behaviorQuiz.currentIndex}
                totalItems={behaviorQuiz.totalItems}
                selectedOption={behaviorQuiz.selectedOption}
                isCorrect={behaviorQuiz.isCorrect}
                timerSec={behaviorQuiz.timerSec}
                graceTimerSec={behaviorQuiz.graceTimerSec}
                isInGrace={behaviorQuiz.isInGrace}
                isTimedOut={behaviorQuiz.isTimedOut}
                recordAnswer={behaviorQuiz.recordAnswer}
                recordUnattempted={behaviorQuiz.recordUnattempted}
            />

            {completionPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Level Complete!</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {completionPopup.nextLevel
                                ? "Great work. Continue to the next level or return to the roadmap."
                                : "Great work. You completed the final available level."}
                        </p>
                        <div className="flex flex-col gap-3">
                            {completionPopup.nextLevel && (
                                <button
                                    disabled={isWaitingForBehaviorQuiz}
                                    onClick={async () => {
                                        setCompletionPopup(null);
                                        const target = completionPopup.nextLevel;
                                        const dayIndex = roadmapData.days.findIndex(d =>
                                            d.levels.some(l => l.id === target.id)
                                        );
                                        if (dayIndex >= 0) setActiveDayIndex(dayIndex);
                                        await startLessonAfterBehaviorQuiz(target);
                                    }}
                                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-sm transition-all active:scale-95"
                                >
                                    {isWaitingForBehaviorQuiz ? "PreparingΓÇª" : "Start Next Level"}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setCompletionPopup(null);
                                    setSelectedLevel(null);
                                }}
                                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all active:scale-95"
                            >
                                Back to Roadmap
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <KyleAssignmentModal
                open={showAssignmentModal && !selectedLevel}
                roadmapId={roadmapData.id}
                roadmapType={roadmapData.id}
                dayId={activeDay?.id}
                dayNumber={dayNumber}
                levels={activeDay?.levels || []}
                isFinalDay={activeDayIndex === roadmapData.days.length - 1}
                onPassed={async () => {
                    const passedDayId = activeDay?.id;

                    if (!passedDayId) {
                        setShowAssignmentModal(false);
                        return;
                    }

                    const isGenAiRoadmap =
                        roadmapData.id === "gen-ai-internship";

                    let assignmentPassAccepted = !isGenAiRoadmap;

                    if (!isGenAiRoadmap) {
                        // Preserve existing optimistic behavior for generic roadmaps.
                        localStorage.setItem(
                            `assignment_passed_${roadmapData.id}_${passedDayId}`,
                            "true"
                        );

                        setAssignmentPassedDays(prev => ({
                            ...prev,
                            [passedDayId]: true,
                        }));

                        if (user) {
                            try {
                                await patchRoadmapProgress({
                                    user,
                                    roadmapSlug: roadmapData.id,
                                    payload: {
                                        action: "pass_assignment",
                                        roadmapTitle:
                                            roadmapData.title || "",
                                        role:
                                            (typeof window !== "undefined" &&
                                                localStorage.getItem(
                                                    "profession"
                                                )) ||
                                            "other",
                                        totalLevels: allLevels.length,
                                        allLevelIds: allLevels.map(
                                            l => l.id
                                        ),
                                        dayId: passedDayId
                                    }
                                });
                            } catch (e) {
                                console.warn(
                                    "Failed to patch pass_assignment",
                                    e
                                );
                            }
                        }
                    } else {
                        // Premium GenAI assignment progress is server-owned.
                        if (!user) {
                            console.warn(
                                "Cannot persist GenAI assignment without an authenticated user"
                            );
                            return;
                        }

                        try {
                            const res = await patchRoadmapProgress({
                                user,
                                roadmapSlug: roadmapData.id,
                                payload: {
                                    action: "pass_assignment",
                                    roadmapTitle:
                                        roadmapData.title || "",
                                    role:
                                        (typeof window !== "undefined" &&
                                            localStorage.getItem(
                                                "profession"
                                            )) ||
                                        "other",
                                    totalLevels: allLevels.length,
                                    allLevelIds: allLevels.map(
                                        l => l.id
                                    ),
                                    dayId: passedDayId
                                }
                            });

                            const trustedPassedAssignments =
                                Array.isArray(
                                    res?.progress?.passedAssignments
                                )
                                    ? res.progress.passedAssignments
                                    : null;

                            // A successful response must still explicitly
                            // confirm the canonical passed day.
                            if (
                                !trustedPassedAssignments ||
                                !trustedPassedAssignments.includes(
                                    passedDayId
                                )
                            ) {
                                console.warn(
                                    "GenAI pass_assignment response did not confirm the passed day"
                                );
                                return;
                            }

                            assignmentPassAccepted = true;

                            setAssignmentPassedDays(prev => ({
                                ...prev,
                                [passedDayId]: true,
                            }));

                            // Local storage is cache only for GenAI.
                            // This value is written only after server confirmation.
                            localStorage.setItem(
                                `assignment_passed_${roadmapData.id}_${passedDayId}`,
                                "true"
                            );
                        } catch (e) {
                            console.warn(
                                "Failed to patch pass_assignment",
                                e
                            );

                            const isClientError =
                                e.message &&
                                e.message.match(/progress: 4\d\d/);

                            // Explicit server rejection must never unlock
                            // the GenAI roadmap locally.
                            if (isClientError) {
                                return;
                            }

                            // Network/5xx ambiguity:
                            // read canonical progress before trusting completion.
                            try {
                                const progressRes =
                                    await fetchRoadmapProgress({
                                        user,
                                        roadmapSlug: roadmapData.id
                                    });

                                const recoveredPassedAssignments =
                                    Array.isArray(
                                        progressRes?.progress
                                            ?.passedAssignments
                                    )
                                        ? progressRes.progress
                                            .passedAssignments
                                        : null;

                                if (
                                    !recoveredPassedAssignments ||
                                    !recoveredPassedAssignments.includes(
                                        passedDayId
                                    )
                                ) {
                                    return;
                                }

                                assignmentPassAccepted = true;

                                setAssignmentPassedDays(prev => ({
                                    ...prev,
                                    [passedDayId]: true,
                                }));

                                localStorage.setItem(
                                    `assignment_passed_${roadmapData.id}_${passedDayId}`,
                                    "true"
                                );
                            } catch (recoveryErr) {
                                console.warn(
                                    "Failed to recover assignment progress state",
                                    recoveryErr
                                );
                                return;
                            }
                        }
                    }

                    // GenAI can reach certificate/unlock handling only
                    // after trusted server confirmation.
                    if (!assignmentPassAccepted) {
                        return;
                    }

                    let certificate = checkCertificateUnlock({
                        roadmapData,
                        completedLevels,
                        dayId: passedDayId,
                        triggerType: 'day'
                    });

                    if (certificate) {
                        const milestoneLevels =
                            certificate.milestoneLevels || [];

                        const durationMinutes =
                            milestoneLevels.reduce(
                                (acc, lvl) =>
                                    acc +
                                    Number(
                                        lvl.durationInMinutes || 0
                                    ),
                                0
                            );

                        const quizCompletedCount =
                            milestoneLevels.length;

                        const dateObj =
                            new Date(certificate.unlockedAt);

                        const providedOn =
                            `${dateObj.getDate()} ${dateObj.toLocaleString(
                                'default',
                                { month: 'long' }
                            )} ${dateObj.getFullYear()}`;

                        certificate = {
                            ...certificate,
                            quizCompletedCount,
                            durationMinutes,
                            providedOn
                        };

                        if (
                            process.env.NODE_ENV ===
                            "development"
                        ) {
                            console.log(
                                "[Certificate unlock payload]",
                                {
                                    certificateKey:
                                        certificate.certificateKey,
                                    milestoneLevelsCount:
                                        milestoneLevels.length,
                                    durationMinutes,
                                    quizCompletedCount,
                                    levelIds:
                                        milestoneLevels.map(
                                            l => l.id
                                        ),
                                }
                            );
                        }

                        const alreadyUnlocked =
                            hasUnlockedCertificate(
                                certificate.certificateKey,
                                certificate.roadmapFamily
                            );

                        const saved =
                            saveUnlockedCertificate(certificate);

                        if (saved && !alreadyUnlocked) {
                            setUnlockedCertificate(
                                certificate
                            );
                        }
                    }

                    setShowAssignmentModal(false);
                }}
                onClose={() => setShowAssignmentModal(false)}
            />

            {unlockedCertificate && (
                <CertificateUnlockedModal
                    certificate={unlockedCertificate}
                    onClose={() => setUnlockedCertificate(null)}
                />
            )}
            {previewCardData && (
                <PreviewCardLockedModal
                    certificate={previewCardData.certificate}
                    roadmapId={roadmapData.id}
                    roadmapTitle={roadmapData.title || ""}
                    totalLevels={allLevels.length}
                    allLevelIds={allLevels.map((l) => l.id)}
                    days={roadmapData.days.map((d) => ({
                        id: d.id,
                        levelIds: d.levels.map((l) => l.id),
                    }))}
                    completedLevelId={previewCardData.completedLevelId}
                    completedLevels={previewCardData.completedLevels}
                    onClose={() => setPreviewCardData(null)}
                />
            )}

        </>
    );
}
