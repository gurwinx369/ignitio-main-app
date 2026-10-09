"use client";

/**
 * FreeOnboarding — the global onboarding controller.
 *
 * State machine:
 *   goal → year → [shortcut | knowledge_check] → [diagnostic | beginner_stitch] → [reveal] → notification → roadmap_result → auth
 *
 * Paths:
 *   A (Shortcut):   goal + year = 3rd/4th + internship/job/gen_ai → shortcut → exits to Gen AI module
 *   B (Beginner):   knowledge_check "no" → assigns all 4 skills → notification → roadmap_result → auth
 *   C (Diagnostic): knowledge_check "yes" → 12-card diagnostic → reveal → notification → roadmap_result → auth
 *
 * Tap budget:
 *   A: goal(1) + year(1) + shortcut(1) = 3 taps
 *   B: goal(1) + year(1) + knowledge_check(1) + notification(1) = 4 taps
 *   C: goal(1) + year(1) + knowledge_check(1) + [diagnostic auto-advances] + reveal(1) + notification(1) = 6 taps
 *
 * onboarding_progress localStorage key persists across refreshes so users
 * never redo goal/year/diagnostic after abandoning before signup.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import { classifyFreePathSkills, buildFreeRoadmap } from "@/lib/onboarding/free-path-classifier";
import { SKILL_ORDER } from "@/lib/onboarding/free-path-questions";

import GoalScreen from "./screens/GoalScreen";
import YearScreen from "./screens/YearScreen";
import ShortcutScreen from "./screens/ShortcutScreen";
import KnowledgeCheckScreen from "./screens/KnowledgeCheckScreen";
import FreeDiagnostic from "./FreeDiagnostic";
import RevealScreen from "./screens/RevealScreen";
import NotificationScreen from "./screens/NotificationScreen";
import MonthRoadmapResult from "./screens/MonthRoadmapResult";

// ── Screen names ────────────────────────────────────────────────────────────
const SCREENS = {
  GOAL: "goal",
  YEAR: "year",
  SHORTCUT: "shortcut",
  KNOWLEDGE_CHECK: "knowledge_check",
  DIAGNOSTIC: "diagnostic",
  REVEAL: "reveal",
  NOTIFICATION: "notification",
  ROADMAP_RESULT: "roadmap_result",
};

// ── Path A trigger conditions ────────────────────────────────────────────────
const SHORTCUT_GOALS = new Set(["internship", "job", "gen_ai"]);
const SHORTCUT_YEARS = new Set(["3", "4"]);

function isShortcutPath(goal, year) {
  return SHORTCUT_GOALS.has(goal) && SHORTCUT_YEARS.has(year);
}

// ── localStorage persistence (edge-case: never block on parse errors) ───────
const STORAGE_KEY = "ignitio:free_onboarding_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — not a fatal error
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Main controller ──────────────────────────────────────────────────────────
export default function FreeOnboarding() {
  const router = useRouter();
  const { user } = useAuth();

  const [screen, setScreen] = useState(SCREENS.YEAR);
  const [goal, setGoal] = useState(null);
  const [year, setYear] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null); // Array<{ skillId, verdict, include }>
  const [roadmap, setRoadmap] = useState(null);                     // string[] of skillIds
  const [path, setPath] = useState(null);                           // "A" | "B" | "C"
  const [notificationAllowed, setNotificationAllowed] = useState(null);

  // Restore progress on mount — users should never redo the diagnostic after abandoning
  useEffect(() => {
    // If user is already authenticated and onboarding is complete, skip entirely
    if (user) {
      router.replace("/onboarding/role-selection");
      return;
    }

    const saved = loadSaved();
    if (!saved) return;

    setTimeout(() => {
      if (saved.screen) setScreen(saved.screen);
      if (saved.goal) setGoal(saved.goal);
      if (saved.year) setYear(saved.year);
      if (saved.diagnosticResults) setDiagnosticResults(saved.diagnosticResults);
      if (saved.roadmap) setRoadmap(saved.roadmap);
      if (saved.path) setPath(saved.path);
    }, 0);
  }, [user, router]);

  // Persist whenever key state changes
  useEffect(() => {
    persist({ screen, goal, year, diagnosticResults, roadmap, path });
  }, [screen, goal, year, diagnosticResults, roadmap, path]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleYear = useCallback((selectedYear) => {
    setYear(selectedYear);
    setScreen(SCREENS.GOAL);
  }, []);

  const handleGoal = useCallback((selectedGoal) => {
    setGoal(selectedGoal);
    // Path A shortcut check
    if (isShortcutPath(selectedGoal, year)) {
      setScreen(SCREENS.SHORTCUT);
    } else {
      setScreen(SCREENS.KNOWLEDGE_CHECK);
    }
  }, [year]);

  const handleShortcutFastTrack = useCallback(() => {
    // Path A — exit to Gen AI module's own onboarding
    setPath("A");
    clearPersisted();
    // Preserve goal/year in a separate key for the Gen AI module to read
    try {
      localStorage.setItem("ignitio:genai_entry", JSON.stringify({ goal, year }));
    } catch {
      // ignore
    }
    router.push("/onboarding/diagnostic");
  }, [goal, year, router]);

  const handleShortcutSeeBasics = useCallback(() => {
    setScreen(SCREENS.KNOWLEDGE_CHECK);
  }, []);

  const handleKnowledgeCheckBeginner = useCallback(() => {
    // Path B — assign all 4 skills, no diagnostic
    setPath("B");
    const fullRoadmap = [...SKILL_ORDER];
    setRoadmap(fullRoadmap);
    setDiagnosticResults(null);
    setScreen(SCREENS.NOTIFICATION);
  }, []);

  const handleKnowledgeCheckKnows = useCallback(() => {
    // Path C — run the diagnostic
    setScreen(SCREENS.DIAGNOSTIC);
  }, []);

  const handleDiagnosticComplete = useCallback((answers) => {
    // Classify answers → build roadmap
    const results = classifyFreePathSkills(answers);
    const finalRoadmap = buildFreeRoadmap(results);

    // Edge case: if classifier excluded everything somehow, put all skills back in
    const safeRoadmap = finalRoadmap.length > 0 ? finalRoadmap : [...SKILL_ORDER];

    setPath("C");
    setDiagnosticResults(results);
    setRoadmap(safeRoadmap);
    setScreen(SCREENS.REVEAL);
  }, []);

  const handleRevealNext = useCallback(() => {
    setScreen(SCREENS.NOTIFICATION);
  }, []);

  const handleNotification = useCallback((allowed) => {
    setNotificationAllowed(allowed);
    // Request browser notification permission if allowed
    if (allowed && typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().catch(() => {});
    }
    setScreen(SCREENS.ROADMAP_RESULT);
  }, []);

  const handleRoadmapResultContinue = useCallback(() => {
    // Persist onboarding result before auth so it survives the auth flow
    try {
      localStorage.setItem("ignitio:onboarding_result", JSON.stringify({
        goal,
        year,
        path,
        roadmap,
        diagnosticResults,
        notificationAllowed,
        completedAt: new Date().toISOString(),
      }));
    } catch {
      // ignore
    }

    clearPersisted();
    // Route to existing auth flow
    router.push("/auth/login");
  }, [goal, year, path, roadmap, diagnosticResults, notificationAllowed, router]);

  // ── Screen rendering ─────────────────────────────────────────────────────────

  if (screen === SCREENS.YEAR) {
    return <YearScreen onNext={handleYear} />;
  }

  if (screen === SCREENS.GOAL) {
    return (
      <GoalScreen
        onNext={handleGoal}
        onBack={() => setScreen(SCREENS.YEAR)}
      />
    );
  }

  if (screen === SCREENS.SHORTCUT) {
    return (
      <ShortcutScreen
        onFastTrack={handleShortcutFastTrack}
        onSeeBasics={handleShortcutSeeBasics}
      />
    );
  }

  if (screen === SCREENS.KNOWLEDGE_CHECK) {
    return (
      <KnowledgeCheckScreen
        onKnowsSomething={handleKnowledgeCheckKnows}
        onBeginner={handleKnowledgeCheckBeginner}
        onBack={() => {
          // If we got here from shortcut, go back to shortcut
          if (isShortcutPath(goal, year)) {
            setScreen(SCREENS.SHORTCUT);
          } else {
            setScreen(SCREENS.YEAR);
          }
        }}
      />
    );
  }

  if (screen === SCREENS.DIAGNOSTIC) {
    return <FreeDiagnostic onComplete={handleDiagnosticComplete} />;
  }

  if (screen === SCREENS.REVEAL && diagnosticResults) {
    return <RevealScreen results={diagnosticResults} onNext={handleRevealNext} />;
  }

  if (screen === SCREENS.NOTIFICATION) {
    return (
      <NotificationScreen
        onAllow={() => handleNotification(true)}
        onSkip={() => handleNotification(false)}
      />
    );
  }

  if (screen === SCREENS.ROADMAP_RESULT && roadmap) {
    return (
      <MonthRoadmapResult
        roadmap={roadmap}
        path={path}
        onContinue={handleRoadmapResultContinue}
        onBack={() => setScreen(SCREENS.NOTIFICATION)}
      />
    );
  }

  // Fallback — should not be reached in normal flow
  return <YearScreen onNext={handleYear} />;
}
