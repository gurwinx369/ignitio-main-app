'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import LevelContent from '@/layout/LevelContent/LevelContent';
import LevelCompletionToast from '@/layout/Card/LevelCompletionToast';
import LevelSkeleton from '@/layout/LevelContent/LevelSkeleton';
import KiboLockedLevel from '@/layout/LevelContent/KiboLockedLevel';
import { useAuth } from '@/features/context/AuthContext';
import {
  fetchRoadmapProgress,
  patchRoadmapProgress,
} from '@/features/roadmaps/lib/progressApi';
import {
  readLocalRoadmapProgress,
  writeLocalRoadmapProgress,
} from '@/lib/roadmaps/progress.migration';
import { useBehaviorQuiz } from '@/features/kyle/behavior-quiz/useBehaviorQuiz';
import BehaviorQuizModal from '@/features/kyle/behavior-quiz/BehaviorQuizModal';
import posthog from 'posthog-js';
import {
  getOrCreateOnboardingSessionId,
  getTimeSinceSignupMs,
} from '@/lib/analytics/onboardingSession';

export default function RoadmapLevelClient({
  roadmapSlug,
  initialRoadmapData,
  getRoadmapByRole,
  levelId,
  isPreview = false,
}) {
  const router = useRouter();
  const { user, userProfile, isProfileLoading } = useAuth();
  const [completedLevels, setCompletedLevels] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [transitioningToLevelId, setTransitioningToLevelId] = useState(null);
  const isTransitioning = Boolean(transitioningToLevelId && transitioningToLevelId !== levelId);

  const startLessonRecordedRef = useRef(false);
  const completionToastTimerRef = useRef(null);

  const role = useMemo(() => {
    if (isPreview) {
      return typeof window !== 'undefined' ? (localStorage.getItem('profession') || 'other') : 'other';
    }
    if (userProfile?.role) {
      return userProfile.role;
    }
    if (typeof window !== 'undefined' && localStorage.getItem('profession')) {
      return localStorage.getItem('profession');
    }
    return 'other';
  }, [isPreview, userProfile]);

  // 1. Resolve roadmap data (role-based or static)
  const selectedRoadmap = useMemo(() => {
    if (typeof getRoadmapByRole === 'function') {
      return getRoadmapByRole(role) || initialRoadmapData;
    }
    return initialRoadmapData;
  }, [getRoadmapByRole, role, initialRoadmapData]);

  const backendRoadmapId = selectedRoadmap?.id || roadmapSlug;

  // Behavior quiz setup
  const behaviorQuiz = useBehaviorQuiz({ user, roadmapId: backendRoadmapId });

  // All levels in sequence
  const allLevels = useMemo(() => {
    if (!selectedRoadmap?.days) return [];
    return selectedRoadmap.days.flatMap((day) => day.levels || []);
  }, [selectedRoadmap]);

  // Current level lookup
  const currentLevel = useMemo(() => {
    if (!allLevels.length || !levelId) return null;
    return allLevels.find((lvl) => lvl.id === levelId) || null;
  }, [allLevels, levelId]);

  // Day metadata for current level
  const activeDay = useMemo(() => {
    if (!selectedRoadmap?.days || !levelId) return null;
    return selectedRoadmap.days.find((day) =>
      day.levels?.some((lvl) => lvl.id === levelId)
    ) || null;
  }, [selectedRoadmap, levelId]);

  const dayNumber = useMemo(() => {
    if (!activeDay) return 1;
    return Number(String(activeDay.id || '').match(/\d+/)?.[0]) || 1;
  }, [activeDay]);

  // Helper to check if a level is completed (in-memory or persistent localStorage)
  const isLevelCompleted = useCallback((id) => {
    if (!id) return false;
    if (completedLevels.includes(id)) return true;
    if (typeof window !== 'undefined') {
      try {
        const canonicalKey = `completed_levels_${backendRoadmapId}`;
        const saved = localStorage.getItem(canonicalKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.includes(id)) return true;
        }
      } catch (e) {
        // ignore
      }
    }
    return false;
  }, [completedLevels, backendRoadmapId]);

  // 2. Fetch or load progress
  useEffect(() => {
    if (!selectedRoadmap || !allLevels.length) return;

    let isSubscribed = true;

    async function loadProgress() {
      // Local fallback
      const localProgress = readLocalRoadmapProgress({
        roadmapId: backendRoadmapId,
        allLevels,
        days: selectedRoadmap.days,
      });

      if (!user) {
        if (isSubscribed) {
          setCompletedLevels(localProgress.completedLevels || []);
          setIsDataLoaded(true);
        }
        return;
      }

      try {
        const res = await fetchRoadmapProgress({
          user,
          roadmapSlug: backendRoadmapId,
        });

        if (isSubscribed) {
          if (res?.source === 'mongodb' && Array.isArray(res.progress?.completedLevels)) {
            const localCompleted = localProgress.completedLevels || [];
            const serverCompleted = res.progress.completedLevels || [];
            // Monotonic union: never drop a locally completed level
            const mergedCompleted = Array.from(new Set([...localCompleted, ...serverCompleted])).sort((a, b) => {
              return (
                allLevels.findIndex((l) => l.id === a) -
                allLevels.findIndex((l) => l.id === b)
              );
            });
            setCompletedLevels(mergedCompleted);
            writeLocalRoadmapProgress({
              roadmapId: backendRoadmapId,
              completedLevels: mergedCompleted,
            });
          } else {
            setCompletedLevels(localProgress.completedLevels || []);
          }
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.warn('[RoadmapLevelClient] Failed to load server progress:', err);
        if (isSubscribed) {
          setCompletedLevels(localProgress.completedLevels || []);
          setIsDataLoaded(true);
        }
      }
    }

    loadProgress();

    return () => {
      isSubscribed = false;
    };
  }, [selectedRoadmap, backendRoadmapId, allLevels, user]);

  // 3. Unlock validation logic
  const unlockState = useMemo(() => {
    if (!currentLevel || !allLevels.length) {
      return { isUnlocked: false, lockedReason: 'Lesson not found' };
    }

    // First lesson is always unlocked
    if (allLevels[0]?.id === currentLevel.id) {
      return { isUnlocked: true, lockedReason: null };
    }

    // If already completed, unlocked
    if (isLevelCompleted(currentLevel.id)) {
      return { isUnlocked: true, lockedReason: null };
    }

    // Previous lesson check
    const currentIndex = allLevels.findIndex((lvl) => lvl.id === currentLevel.id);
    if (currentIndex > 0) {
      const prevLevel = allLevels[currentIndex - 1];
      if (isLevelCompleted(prevLevel.id)) {
        return { isUnlocked: true, lockedReason: null };
      }
    }

    return {
      isUnlocked: false,
      lockedReason: 'Complete the previous lesson on the roadmap to unlock this lesson.',
    };
  }, [currentLevel, allLevels, isLevelCompleted]);

  // Compute active unlocked level (for jump button in locked view)
  const activeUnlockedLevel = useMemo(() => {
    if (!allLevels.length) return null;
    return allLevels.find((lvl) => !isLevelCompleted(lvl.id)) || allLevels[0];
  }, [allLevels, isLevelCompleted]);

  // 4. Record start_lesson event when level is unlocked
  useEffect(() => {
    if (!isDataLoaded || !currentLevel || !unlockState.isUnlocked || startLessonRecordedRef.current) {
      return;
    }

    startLessonRecordedRef.current = true;

    if (user) {
      patchRoadmapProgress({
        user,
        roadmapSlug: backendRoadmapId,
        payload: {
          action: 'start_lesson',
          roadmapTitle: selectedRoadmap?.title || '',
          role: userProfile?.role || 'other',
          totalLevels: allLevels.length,
          allLevelIds: allLevels.map((l) => l.id),
          levelId: currentLevel.id,
        },
      }).catch((e) => {
        console.warn('[RoadmapLevelClient] Failed to patch start_lesson:', e);
      });
    }
  }, [isDataLoaded, currentLevel, unlockState.isUnlocked, user, selectedRoadmap, backendRoadmapId, userProfile, allLevels]);

  // Handle completion toast timer cleanup
  useEffect(() => {
    return () => {
      if (completionToastTimerRef.current) {
        clearTimeout(completionToastTimerRef.current);
      }
    };
  }, []);

  const triggerCompletionToast = useCallback(() => {
    setShowCompletion(true);
    if (completionToastTimerRef.current) {
      clearTimeout(completionToastTimerRef.current);
    }
    completionToastTimerRef.current = setTimeout(() => {
      setShowCompletion(false);
    }, 2500);
  }, []);

  // 5. Video completion handler
  const handleVideoComplete = useCallback(async (completedLevelId) => {
    if (completedLevels.includes(completedLevelId)) return;

    const updatedCompleted = [...completedLevels, completedLevelId];
    const sortedCompleted = updatedCompleted.sort((a, b) => {
      return (
        allLevels.findIndex((l) => l.id === a) -
        allLevels.findIndex((l) => l.id === b)
      );
    });

    setCompletedLevels(sortedCompleted);

    writeLocalRoadmapProgress({
      roadmapId: backendRoadmapId,
      completedLevels: sortedCompleted,
    });

    // Analytics
    if (typeof window !== 'undefined') {
      const isFirstLesson = localStorage.getItem('has_completed_first_lesson') !== 'true';
      if (isFirstLesson) {
        localStorage.setItem('has_completed_first_lesson', 'true');
      }

      const sessionId = getOrCreateOnboardingSessionId();
      const timeToFirstLesson = getTimeSinceSignupMs();

      try {
        posthog.capture('lesson_completed', {
          lesson_id: completedLevelId,
          roadmap_id: backendRoadmapId,
          is_first_lesson: isFirstLesson,
          ...(isFirstLesson && timeToFirstLesson ? { time_to_first_lesson_ms: timeToFirstLesson } : {}),
          onboarding_session_id: sessionId,
        });

        if (isFirstLesson) {
          posthog.capture('onboarding_step_completed', {
            step_id: 'first_lesson_completed',
            step_index: 10,
            onboarding_session_id: sessionId,
            time_to_first_lesson_ms: timeToFirstLesson,
          });
        }
      } catch (err) {
        console.warn('PostHog tracking error:', err);
      }
    }

    triggerCompletionToast();

    // Trigger behavior quiz milestone in background
    void behaviorQuiz.triggerInBackground(completedLevelId);

    // Patch server
    if (user) {
      try {
        await patchRoadmapProgress({
          user,
          roadmapSlug: backendRoadmapId,
          payload: {
            action: 'complete_level',
            roadmapTitle: selectedRoadmap?.title || '',
            role: userProfile?.role || 'other',
            totalLevels: allLevels.length,
            allLevelIds: allLevels.map((l) => l.id),
            days: selectedRoadmap?.days?.map((d) => ({
              id: d.id,
              levelIds: (d.levels || []).map((l) => l.id),
            })) || [],
            levelId: completedLevelId,
          },
        });
      } catch (err) {
        console.warn('Failed to patch complete_level:', err);
      }
    }

    // Calculate next level
    const globalIndex = allLevels.findIndex((l) => l.id === completedLevelId);
    let nextLevel = null;
    if (globalIndex >= 0 && globalIndex < allLevels.length - 1) {
      nextLevel = allLevels[globalIndex + 1];
    }

    // Trigger immediate skeleton and auto-redirect to next level
    if (nextLevel) {
      setTransitioningToLevelId(nextLevel.id);
      router.push(`/home/roadmaps/${roadmapSlug}/${nextLevel.id}`);
    } else {
      setTransitioningToLevelId('completed');
      router.push(`/home/roadmaps/${roadmapSlug}`);
    }
  }, [
    completedLevels,
    allLevels,
    backendRoadmapId,
    triggerCompletionToast,
    behaviorQuiz,
    user,
    router,
    roadmapSlug,
    selectedRoadmap,
    userProfile,
  ]);

  // Loading or Auto-transitioning state
  if (!isDataLoaded || isProfileLoading || isTransitioning) {
    return <LevelSkeleton color={activeDay?.color || '#3b82f6'} />;
  }

  // Not Found state
  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Lesson Not Found</h1>
          <p className="text-slate-600 mb-6 text-sm">
            We couldn&apos;t find lesson <span className="font-mono font-semibold text-slate-800">{levelId}</span> in this roadmap.
          </p>
          <button
            onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
            className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  // Locked state
  if (!unlockState.isUnlocked) {
    return (
      <KiboLockedLevel
        currentLevel={currentLevel}
        dayNumber={dayNumber}
        activeDayColor={activeDay?.color || '#3b82f6'}
        lockedReason={unlockState.lockedReason}
        roadmapTitle={selectedRoadmap?.title || ''}
        activeUnlockedLevel={activeUnlockedLevel}
        onReturnToRoadmap={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
        onGoToCurrentLesson={
          activeUnlockedLevel && activeUnlockedLevel.id !== currentLevel.id
            ? () => router.push(`/home/roadmaps/${roadmapSlug}/${activeUnlockedLevel.id}`)
            : null
        }
      />
    );
  }

  // Active Lesson View
  return (
    <div className="min-h-screen bg-[var(--color-primary)] font-sans relative">
      <LevelContent
        key={`${backendRoadmapId}-${currentLevel.id}`}
        level={currentLevel}
        onBack={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
        onComplete={handleVideoComplete}
        isCompleted={completedLevels.includes(currentLevel.id)}
        roadmapType={backendRoadmapId}
        dayNumber={dayNumber}
        isFirstLesson={allLevels[0]?.id === currentLevel.id}
        isPreview={isPreview}
      />

      {/* Completion Toast */}
      {showCompletion && activeDay && (
        <LevelCompletionToast
          difficulty={activeDay.id}
          color={activeDay.color || '#3b82f6'}
        />
      )}

      {/* Behavior Quiz Modal */}
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
    </div>
  );
}
