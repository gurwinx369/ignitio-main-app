'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import KiboAvatar from '@/features/kyle/pet/KiboAvatar';
import { useAuth } from '@/features/context/AuthContext';
import { patchRoadmapProgress } from '@/features/roadmaps/lib/progressApi';
import { readLocalRoadmapProgress, writeLocalRoadmapProgress } from '@/lib/roadmaps/progress.migration';
import { stripThinking } from '@/lib/utils/cleanAiText';

function normalizeRole(role) {
  const allowedRoles = ['student', 'developer', 'writer', 'designer', 'other'];
  const localRole = typeof window !== 'undefined' ? localStorage.getItem('profession') : null;
  let normalized = role || localRole || 'other';
  normalized = String(normalized).trim().toLowerCase();
  if (!allowedRoles.includes(normalized)) {
    normalized = 'other';
  }
  return normalized;
}

export default function RoadmapAssignmentClient({
  roadmapSlug,
  dayId,
  initialRoadmapData,
  roadmapsByRole,
}) {
  const router = useRouter();
  const { user, userProfile, isProfileLoading } = useAuth();

  // Environment-aware copy/paste flag:
  // Allowed in development for fast testing, blocked in production for academic integrity.
  const isDev = process.env.NODE_ENV === 'development';
  const isCopyPasteDisabled = !isDev && process.env.NEXT_PUBLIC_ALLOW_COPY_PASTE !== 'true';

  // Role resolution
  const role = useMemo(() => {
    if (userProfile?.role) return userProfile.role;
    if (typeof window !== 'undefined' && localStorage.getItem('profession')) {
      return localStorage.getItem('profession');
    }
    return 'other';
  }, [userProfile]);

  // Roadmap Data resolution
  const selectedRoadmap = useMemo(() => {
    if (roadmapsByRole && typeof roadmapsByRole === 'object') {
      const normalizedRole = String(role || 'other').toLowerCase().trim();
      return roadmapsByRole[normalizedRole] || initialRoadmapData;
    }
    return initialRoadmapData;
  }, [roadmapsByRole, role, initialRoadmapData]);

  const backendRoadmapId = selectedRoadmap?.id || roadmapSlug;
  const roadmapTitle = selectedRoadmap?.title || 'Course Roadmap';

  // Find the day requested
  const activeDay = useMemo(() => {
    if (!selectedRoadmap?.days || !dayId) return null;
    return selectedRoadmap.days.find((d) => d.id === dayId) || null;
  }, [selectedRoadmap, dayId]);

  const dayIndex = useMemo(() => {
    if (!selectedRoadmap?.days || !dayId) return 0;
    return selectedRoadmap.days.findIndex((d) => d.id === dayId);
  }, [selectedRoadmap, dayId]);

  const dayNumber = useMemo(() => {
    if (!activeDay) return 1;
    return Number(String(activeDay.id || '').match(/\d+/)?.[0]) || (dayIndex + 1);
  }, [activeDay, dayIndex]);

  const isFinalDay = useMemo(() => {
    if (!selectedRoadmap?.days) return false;
    return dayIndex >= selectedRoadmap.days.length - 1;
  }, [selectedRoadmap, dayIndex]);

  const dayLevels = useMemo(() => activeDay?.levels || [], [activeDay]);

  const allLevels = useMemo(() => {
    if (!selectedRoadmap?.days) return [];
    return selectedRoadmap.days.flatMap((day) => day.levels || []);
  }, [selectedRoadmap]);

  // Pass threshold rule: Day 1 -> 5, Day 2 -> 6, Day 3+ -> 7
  const requiredScore = dayNumber === 1 ? 5 : dayNumber === 2 ? 6 : 7;

  // State
  const [status, setStatus] = useState('loading'); // loading, ready, scoring, result_pass, result_fail, error, already_passed, cooldown, locked_lessons
  const [assignmentPrompt, setAssignmentPrompt] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [pasteWarning, setPasteWarning] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);

  const hasFetched = useRef(false);
  const pasteWarningTimerRef = useRef(null);
  const draftStorageKey = `assignment_draft_${backendRoadmapId}_${dayId}`;
  const passedStorageKey = `assignment_passed_${backendRoadmapId}_${dayId}`;

  // Read local progress and draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check completed levels for this roadmap
    const localProgress = readLocalRoadmapProgress({
      roadmapId: backendRoadmapId,
      allLevels,
      days: selectedRoadmap?.days || [],
    });
    setCompletedLevels(localProgress.completedLevels || []);

    // Check if assignment already passed
    const isAlreadyPassed = localStorage.getItem(passedStorageKey) === 'true';
    if (isAlreadyPassed && !isDev) {
      setStatus('already_passed');
      return;
    }

    // Check for saved draft
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (savedDraft) {
      setUserResponse(savedDraft);
      setLastSavedTime('Restored previous draft');
    }
  }, [backendRoadmapId, dayId, passedStorageKey, draftStorageKey, allLevels, selectedRoadmap]);

  // Auto-save draft as user types
  const handleResponseChange = (e) => {
    const val = e.target.value;
    setUserResponse(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(draftStorageKey, val);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(`Draft saved at ${timeStr}`);
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your current draft?')) {
      setUserResponse('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftStorageKey);
      }
      setLastSavedTime(null);
    }
  };

  // Trigger anti-paste alert banner
  const triggerCopyPasteWarning = (action = 'Pasting') => {
    setPasteWarning(`${action} is disabled in production to protect academic integrity. Please write your original answer.`);
    if (pasteWarningTimerRef.current) {
      clearTimeout(pasteWarningTimerRef.current);
    }
    pasteWarningTimerRef.current = setTimeout(() => {
      setPasteWarning(null);
    }, 4000);
  };

  // Keyboard protection (Ctrl+C, Ctrl+V, etc.)
  const handleEditorKeyDown = (e) => {
    if (!isCopyPasteDisabled) return;

    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier) {
      const key = e.key.toLowerCase();
      if (key === 'v') {
        e.preventDefault();
        triggerCopyPasteWarning('Pasting');
      } else if (key === 'c' || key === 'x') {
        e.preventDefault();
        triggerCopyPasteWarning('Copying');
      }
    }
  };

  // Format enriched levels for FastAPI context
  const formattedLevels = useMemo(() => {
    return dayLevels.map((l) => {
      const conceptName = l.concept || l.title || l.name || 'Core Concept';
      const conceptWithRoadmap = `[${roadmapTitle} - Day ${dayNumber}] ${conceptName}`;
      const transcriptText =
        l.transcript ||
        l.description ||
        l.summary ||
        `Comprehensive lesson covering ${conceptName} in ${roadmapTitle}.`;

      return {
        concept: conceptWithRoadmap,
        transcript: transcriptText,
      };
    });
  }, [dayLevels, roadmapTitle, dayNumber]);

  // Generate assignment prompt
  useEffect(() => {
    if (status === 'already_passed' || !dayLevels.length || isProfileLoading) return;
    if (hasFetched.current && assignmentPrompt) return;

    // Check if previous lessons in this day are completed
    const dayLevelIds = dayLevels.map((l) => l.id);
    const completedInDay = dayLevelIds.filter((id) => completedLevels.includes(id));
    const allDayCompleted = completedInDay.length === dayLevelIds.length;

    // Allow testing if dev or preview, otherwise warn if not completed
    if (!allDayCompleted && !isDev && completedLevels.length > 0) {
      // Don't strictly block if user navigated directly, but display warning indicator
    }

    const generateAssignment = async () => {
      hasFetched.current = true;
      setStatus('loading');
      setErrorMsg(null);

      try {
        if (!user) {
          throw new Error('Please sign in to access your assignment.');
        }

        const idToken = await user.getIdToken();
        const normalizedRole = normalizeRole(role);

        const response = await fetch('/api/v2/kyle/assignment/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role: normalizedRole,
            dayNumber,
            levels: formattedLevels,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate assignment');
        }

        setAssignmentPrompt(stripThinking(data.data?.assignmentPrompt || data.assignmentPrompt || ''));
        setStatus('ready');
      } catch (err) {
        console.error('Assignment generation error:', err);
        setErrorMsg(err.message || 'Kibo could not prepare the assignment right now. Please try again.');
        setStatus('error');
      }
    };

    if (user) {
      generateAssignment();
    }
  }, [user, dayNumber, formattedLevels, role, retryNonce, isProfileLoading]);

  // Submit Answer
  const handleSubmit = async () => {
    if (!userResponse.trim() || !assignmentPrompt || status === 'scoring') return;

    setStatus('scoring');
    setErrorMsg(null);

    try {
      if (!user) throw new Error('Please sign in to submit your assignment.');
      const idToken = await user.getIdToken();
      const normalizedRole = normalizeRole(role);

      const response = await fetch('/api/v2/kyle/assignment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          role: normalizedRole,
          dayNumber,
          levels: formattedLevels,
          assignmentPrompt,
          userResponse,
        }),
      });

      const data = await response.json();

      if (response.status === 423) {
        if (data.data?.score != null) {
          setScoreData({
            score: data.data.score,
            feedback: stripThinking(data.data.feedback || ''),
            attemptsRemaining: data.data.attemptsRemaining ?? 0,
            lockedUntil: null,
            breakdown: data.data.breakdown || null,
            weaknesses: data.data.weaknesses || [],
            uiPassed: true,
          });
          setStatus('result_pass');
          localStorage.setItem(passedStorageKey, 'true');
          return;
        }
        if (data.error && data.error.includes('already passed')) {
          setStatus('already_passed');
          localStorage.setItem(passedStorageKey, 'true');
          return;
        }
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
          setStatus('cooldown');
          return;
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assignment');
      }

      const { score, feedback, passed, attemptsRemaining, lockedUntil, breakdown, weaknesses } =
        data.data || {};
      const uiPassed = Boolean(passed);

      setScoreData({
        score: score ?? 0,
        feedback: feedback || '',
        attemptsRemaining: attemptsRemaining ?? 0,
        lockedUntil: lockedUntil || null,
        breakdown: breakdown || null,
        weaknesses: weaknesses || [],
        uiPassed,
      });

      if (uiPassed) {
        localStorage.setItem(passedStorageKey, 'true');
        localStorage.removeItem(draftStorageKey);

        // Patch server progress
        try {
          await patchRoadmapProgress({
            user,
            roadmapSlug: backendRoadmapId,
            payload: {
              action: 'pass_assignment',
              roadmapTitle: selectedRoadmap?.title || '',
              role: normalizeRole(role),
              totalLevels: allLevels.length,
              allLevelIds: allLevels.map((l) => l.id),
              dayId,
              dayNumber,
            },
          });
        } catch (patchErr) {
          console.warn('Failed to patch server assignment progress:', patchErr);
        }

        setStatus('result_pass');
      } else {
        setStatus('result_fail');
      }
    } catch (err) {
      console.error('Assignment submission error:', err);
      setErrorMsg(err.message || 'Kibo could not grade this response right now. Please try again.');
      setStatus('error');
    }
  };

  const handleRetryGenerate = () => {
    setErrorMsg(null);
    setAssignmentPrompt('');
    hasFetched.current = false;
    setRetryNonce((prev) => prev + 1);
    setStatus('loading');
  };

  const wordCount = useMemo(() => {
    return userResponse.trim() ? userResponse.trim().split(/\s+/).length : 0;
  }, [userResponse]);

  const charCount = userResponse.length;

  // Day not found state
  if (!activeDay && !isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#fcf5ee] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Assignment Not Found</h2>
          <p className="text-slate-600 mb-6">Could not locate assignment for {dayId}.</p>
          <button
            onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
            className="w-full py-3 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all"
          >
            Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf5ee] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#fcf5ee]/90 backdrop-blur-md border-b border-[#f0caa8]/60 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-semibold text-sm transition-all hover:shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Roadmap</span>
            </button>

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{roadmapTitle}</span>
              <span>&middot;</span>
              <span className="font-bold text-slate-900">Day {dayNumber} Assignment</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Required Score Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ddf2ff] text-[#007bcc] border border-[#80d4ff]/60">
              <Award className="w-3.5 h-3.5" />
              Pass: {requiredScore}/10
            </span>

            {/* Dev / Security Mode Pill */}
            {isDev ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dev Mode &middot; Copy/Paste Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                Exam Mode &middot; Paste Off
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Floating Anti-Paste Warning Banner */}
      {pasteWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-w-lg w-full px-4">
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p className="text-xs sm:text-sm font-semibold">{pasteWarning}</p>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-[#f0caa8] shadow-md mb-6 animate-bounce">
              <KiboAvatar width={56} height={56} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Kibo is drafting your Day {dayNumber} assignment...
            </h3>
            <p className="text-slate-600 max-w-md text-sm font-medium">
              Grounding the prompt strictly in your Day {dayNumber} lessons and role ({normalizeRole(role)}).
            </p>
          </div>
        )}

        {/* Scoring State */}
        {status === 'scoring' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-[#80d4ff] shadow-md mb-6 animate-pulse">
              <KiboAvatar width={56} height={56} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Kibo is grading your submission...
            </h3>
            <p className="text-slate-600 max-w-md text-sm font-medium">
              Evaluating topic relevance, conceptual depth, practical execution, and role alignment.
            </p>
          </div>
        )}

        {/* Cooldown Lock State */}
        {status === 'cooldown' && (
          <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#f0caa8] shadow-lg text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Assignment Cooldown Active</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              You have exhausted your current attempts. Take time to review the day&apos;s lessons.
              {lockedUntil && (
                <span className="block font-bold text-slate-800 mt-2">
                  Unlocks at: {new Date(lockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
            <button
              onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
              className="btn-push w-full py-4 rounded-2xl text-white font-extrabold bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-md"
            >
              Back to Roadmap
            </button>
          </div>
        )}

        {/* Already Passed State */}
        {status === 'already_passed' && (
          <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#bbf7d0] shadow-lg text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Assignment Passed!</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              You have already successfully completed the Day {dayNumber} assignment. Your progress has been verified and saved to your account.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
                className="btn-push w-full py-4 rounded-2xl text-white font-extrabold bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-md flex items-center justify-center gap-2"
              >
                <span>Continue on Roadmap</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {isDev && (
                <button
                  onClick={() => {
                    localStorage.removeItem(passedStorageKey);
                    setStatus('ready');
                  }}
                  className="btn-push-sm w-full py-3 rounded-2xl text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 font-bold text-xs"
                >
                  [Dev Mode] Re-enable Assignment Submission
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generation Error State */}
        {status === 'error' && (
          <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border-2 border-red-200 shadow-lg text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetryGenerate}
                className="btn-push w-full py-4 rounded-2xl text-white font-extrabold bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
                className="btn-push-sm w-full py-3 rounded-2xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50"
              >
                Back to Roadmap
              </button>
            </div>
          </div>
        )}

        {/* Results Screen (Pass or Fail) */}
        {(status === 'result_pass' || status === 'result_fail') && scoreData && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-4xl p-6 sm:p-10 border-2 border-[#f0caa8] shadow-xl">
              {/* Score Header */}
              <div className="text-center pb-8 border-b border-slate-100">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${
                    scoreData.uiPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {scoreData.uiPassed ? 'Assignment Cleared' : 'Needs Revision'}
                </span>

                <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                  {scoreData.score}
                  <span className="text-3xl text-slate-400 font-bold">/10</span>
                </div>

                <p className="text-slate-500 text-sm font-semibold mt-2">
                  Passing Threshold: {requiredScore}/10 &middot; Day {dayNumber}
                </p>
              </div>

              {/* Kibo's Feedback */}
              <div className="py-8 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#f0caa8] shadow-xs">
                    <KiboAvatar width={28} height={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Feedback from Kibo</h4>
                    <p className="text-xs text-slate-500 font-medium">Evaluation based on your day&apos;s lessons</p>
                  </div>
                </div>

                <div className="bg-[#fcf5ee] p-5 rounded-2xl border border-[#f0caa8]/60 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {scoreData.feedback}
                </div>
              </div>

              {/* Rubric Breakdown */}
              {scoreData.breakdown && (
                <div className="py-8 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-4 tracking-tight uppercase text-slate-500">
                    Grading Rubric Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                      <span className="text-xs font-bold text-slate-500 block mb-1">Topic Relevance</span>
                      <span className="text-xl font-black text-slate-900">
                        {(scoreData.breakdown.topicRelevance ?? scoreData.breakdown.topic_relevance ?? 0)}/3
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                      <span className="text-xs font-bold text-slate-500 block mb-1">Concept Mastery</span>
                      <span className="text-xl font-black text-slate-900">
                        {(scoreData.breakdown.conceptApplication ?? scoreData.breakdown.concept_application ?? 0)}/3
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                      <span className="text-xs font-bold text-slate-500 block mb-1">Code Quality</span>
                      <span className="text-xl font-black text-slate-900">
                        {(scoreData.breakdown.promptQuality ?? scoreData.breakdown.prompt_quality ?? 0)}/2
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                      <span className="text-xs font-bold text-slate-500 block mb-1">Role Aptitude</span>
                      <span className="text-xl font-black text-slate-900">
                        {(scoreData.breakdown.roleAptitude ?? scoreData.breakdown.role_aptitude ?? 0)}/2
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weaknesses / Improvements */}
              {scoreData.weaknesses && scoreData.weaknesses.length > 0 && (
                <div className="py-8 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Key Areas to Improve:</h4>
                  <ul className="space-y-2">
                    {scoreData.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-8">
                {scoreData.uiPassed ? (
                  <button
                    onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
                    className="btn-push w-full py-4 rounded-2xl text-white font-extrabold bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-lg flex items-center justify-center gap-2 text-base"
                  >
                    <span>{isFinalDay ? 'Complete Course & View Certificates' : `Continue to Day ${dayNumber + 1}`}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    {scoreData.attemptsRemaining > 0 ? (
                      <>
                        <button
                          onClick={() => setStatus('ready')}
                          className="btn-push w-full py-4 rounded-2xl text-white font-extrabold bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-md flex items-center justify-center gap-2 text-base"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span>Revise Answer ({scoreData.attemptsRemaining} attempt{scoreData.attemptsRemaining > 1 ? 's' : ''} left)</span>
                        </button>
                        <p className="text-center text-xs text-slate-500 font-medium">
                          Your draft has been preserved. Review Kibo&apos;s advice and refine your response.
                        </p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push(`/home/roadmaps/${roadmapSlug}`)}
                          className="btn-push-sm w-full py-4 rounded-2xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300"
                        >
                          Return to Roadmap
                        </button>
                        <p className="text-center text-xs text-red-600 font-medium">
                          No attempts remaining right now. Assignment locked for a 6-hour review period.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Assignment Workspace (Ready) */}
        {status === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Assignment Brief & Day Concepts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Kibo Guidance Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#f0caa8] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-[#f0caa8] shadow-xs">
                    <KiboAvatar width={36} height={36} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Kibo&apos;s Challenge</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Day {dayNumber} Practical Evaluation &middot; {normalizeRole(role)}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  This assignment tests the exact concepts you covered in Day {dayNumber}. Write thoughtfully — you need at least{' '}
                  <span className="font-bold text-slate-900">{requiredScore}/10</span> to unlock the next day.
                </p>
              </div>

              {/* Day's Lessons Context Checklist */}
              {dayLevels.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-[#00a9ff]" />
                    <span>Topics Tested in This Assignment</span>
                  </div>
                  <div className="space-y-2.5">
                    {dayLevels.map((lvl, idx) => {
                      const isLvlDone = completedLevels.includes(lvl.id);
                      return (
                        <div
                          key={lvl.id || idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isLvlDone ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {lvl.concept || lvl.title || lvl.name}
                            </span>
                            <span className="text-slate-500 line-clamp-1">
                              {lvl.description || 'Core lesson concept'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rubric Info */}
              <div className="bg-[#fff9f3] p-5 rounded-2xl border border-[#f0caa8]/80 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Evaluation Standards:</span>
                </div>
                <div>&bull; <strong>Topic Relevance (3 pts):</strong> Direct answers to every part of the prompt.</div>
                <div>&bull; <strong>Concept Application (3 pts):</strong> Real code, commands, or concrete examples.</div>
                <div>&bull; <strong>Prompt Quality &amp; Structure (2 pts):</strong> Clear, coherent thought process.</div>
                <div>&bull; <strong>Role Aptitude (2 pts):</strong> Professional terminology matching your profile.</div>
              </div>
            </div>

            {/* Right Column: Submission Studio */}
            <div className="lg:col-span-7 space-y-6">
              {/* Assignment Prompt Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#f0caa8] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assignment Prompt
                  </span>
                  <span className="text-xs font-bold text-[#007bcc] bg-[#ddf2ff] px-2.5 py-0.5 rounded-full border border-[#80d4ff]/60">
                    Day {dayNumber}
                  </span>
                </div>

                <div
                  className={`text-slate-900 text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-wrap ${
                    isCopyPasteDisabled ? 'select-none' : ''
                  }`}
                  onCopy={(e) => {
                    if (isCopyPasteDisabled) {
                      e.preventDefault();
                      triggerCopyPasteWarning('Copying the assignment prompt');
                    }
                  }}
                  onContextMenu={(e) => {
                    if (isCopyPasteDisabled) e.preventDefault();
                  }}
                >
                  {stripThinking(assignmentPrompt)}
                </div>
              </div>

              <div className="bg-white rounded-4xl p-6 sm:p-8 border-2 border-[#f0caa8] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      Your Response
                    </h3>
                    {isCopyPasteDisabled && (
                      <span
                        title="Pasting external code/text is disabled in production"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full"
                      >
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Original Work Only
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {lastSavedTime && (
                      <span className="hidden sm:inline font-medium text-emerald-600">
                        {lastSavedTime}
                      </span>
                    )}
                    {userResponse && (
                      <button
                        onClick={handleClearDraft}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Clear draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor Textarea with Environment Anti-Paste Enforcement */}
                <div className="relative">
                  <textarea
                    value={userResponse}
                    onChange={handleResponseChange}
                    onKeyDown={handleEditorKeyDown}
                    onPaste={(e) => {
                      if (isCopyPasteDisabled) {
                        e.preventDefault();
                        triggerCopyPasteWarning('Pasting');
                      }
                    }}
                    onCopy={(e) => {
                      if (isCopyPasteDisabled) {
                        e.preventDefault();
                        triggerCopyPasteWarning('Copying');
                      }
                    }}
                    onCut={(e) => {
                      if (isCopyPasteDisabled) {
                        e.preventDefault();
                        triggerCopyPasteWarning('Cutting');
                      }
                    }}
                    onContextMenu={(e) => {
                      if (isCopyPasteDisabled) {
                        e.preventDefault();
                      }
                    }}
                    rows={16}
                    placeholder="Type your response here. Explain your thinking step-by-step, include sample code or commands where applicable, and demonstrate your understanding of today's topics..."
                    className="w-full p-4 sm:p-5 bg-slate-50/70 border-2 border-slate-200 focus:border-[#00a9ff] focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-400 font-mono text-sm leading-relaxed focus:outline-none focus:ring-4 focus:ring-[#00a9ff]/10 transition-all resize-y min-h-[320px]"
                  />
                </div>

                {/* Counter & Status Bar */}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-semibold px-1">
                  <div className="flex items-center gap-3">
                    <span>{wordCount} words</span>
                    <span>&middot;</span>
                    <span>{charCount} characters</span>
                  </div>
                  <div>
                    <span>Minimum recommended: ~50 words</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!userResponse.trim() || wordCount < 5}
                    className="btn-push flex-1 py-4 rounded-2xl text-white font-extrabold text-base bg-[#00a9ff] border-[#007bcc] hover:bg-[#0096e6] shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Submit to Kibo for Grading</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

