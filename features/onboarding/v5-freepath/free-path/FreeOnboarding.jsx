"use client";

/**
 * FreeOnboarding — the global onboarding controller.
 *
 * State machine:
 *   goal → year → [shortcut | knowledge_check] → [diagnostic | beginner_stitch] → [reveal] → roadmap_result → auth
 *
 * Paths:
 *   A (Shortcut):   goal + year = 3rd/4th + internship/job/gen_ai → shortcut → exits to Gen AI module
 *   B (Beginner):   knowledge_check "no" → assigns all 4 skills → roadmap_result → auth
 *   C (Diagnostic): knowledge_check "yes" → 12-card diagnostic → reveal → roadmap_result → auth
 *
 * Tap budget:
 *   A: goal(1) + year(1) + shortcut(1) = 3 taps
 *   B: goal(1) + year(1) + knowledge_check(1) = 3 taps
 *   C: goal(1) + year(1) + knowledge_check(1) + [diagnostic auto-advances] + reveal(1) = 5 taps
 *
 * Notification ask moved to post-first-lesson (streak celebration screen).
 *
 * onboarding_progress localStorage key persists across refreshes so users
 * never redo goal/year/diagnostic after abandoning before signup.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import {
  classifyFreePathSkills,
  buildFreeRoadmap,
} from "@/lib/onboarding/free-path-classifier";
import { SKILL_ORDER } from "@/lib/onboarding/free-path-questions";

import GoalScreen from "./screens/GoalScreen";
import YearScreen from "./screens/YearScreen";
import ShortcutScreen from "./screens/ShortcutScreen";
import KnowledgeCheckScreen from "./screens/KnowledgeCheckScreen";
import FreeDiagnostic from "./FreeDiagnostic";
import RevealScreen from "./screens/RevealScreen";
import MonthRoadmapResult from "./screens/MonthRoadmapResult";

// ── Additional stage rules ───────────────────────────────────────────────────
// Returns stage IDs to append after the base free-path skills.
// The IDs must exist in STAGES in roadmap-data.js.
//
// Rules:
//   1st/2nd year + project goal   → Prompt Engineering (after foundation)
//   3rd/4th year + internship/job → Prompt Engineering + System Design
//   everyone else                 → no additional stages
function getAdditionalStages(goal, year) {
  const isEarlyYear = year === "1" || year === "2";
  const isLateYear  = year === "3" || year === "4";

  if (goal === "dsa") return ["dsa"];
  if (isEarlyYear && goal === "project") return ["prompt"];
  if (isLateYear && (goal === "internship" || goal === "job")) return ["prompt", "system_design"];
  return [];
}

// ── Screen names ────────────────────────────────────────────────────────────
const SCREENS = {
  GOAL: "goal",
  YEAR: "year",
  SHORTCUT: "shortcut",
  KNOWLEDGE_CHECK: "knowledge_check",
  DIAGNOSTIC: "diagnostic",
  REVEAL: "reveal",
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
  const [roadmap, setRoadmap] = useState(null); // string[] of skillIds
  const [path, setPath] = useState(null); // "A" | "B" | "C"

  // Restore progress on mount — users should never redo the diagnostic after abandoning
  useEffect(() => {
    // ProtectedRoute already handles authenticated user routing.
    // If an authenticated user lands here, they are meant to take the diagnostic.

    const saved = loadSaved();
    if (!saved) return;

    setTimeout(() => {
      if (saved.screen) setScreen(saved.screen);
      if (saved.goal) setGoal(saved.goal);
      if (saved.year) setYear(saved.year);
      if (saved.diagnosticResults)
        setDiagnosticResults(saved.diagnosticResults);
      if (saved.roadmap) {
        const isDsaGoal = saved.goal === "dsa";
        const hasDsa = saved.roadmap.includes("dsa");
        let roadmapAdjusted = saved.roadmap;
        if (isDsaGoal && !hasDsa) {
          roadmapAdjusted = [...saved.roadmap, "dsa"];
        } else if (!isDsaGoal && hasDsa) {
          roadmapAdjusted = saved.roadmap.filter((s) => s !== "dsa");
        }
        setRoadmap(roadmapAdjusted);
      }
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

  const handleGoal = useCallback(
    (selectedGoal) => {
      setGoal(selectedGoal);
      // Path A shortcut check
      if (isShortcutPath(selectedGoal, year)) {
        setScreen(SCREENS.SHORTCUT);
      } else {
        setScreen(SCREENS.KNOWLEDGE_CHECK);
      }
    },
    [year],
  );

  const handleShortcutFastTrack = useCallback(() => {
    // Path A — exit to Gen AI module's own onboarding
    setPath("A");
    clearPersisted();
    // Preserve goal/year in a separate key for the Gen AI module to read
    try {
      localStorage.setItem(
        "ignitio:genai_entry",
        JSON.stringify({ goal, year }),
      );
    } catch {
      // ignore
    }
    router.push("/onboarding/diagnostic");
  }, [goal, year, router]);

  const handleShortcutSeeBasics = useCallback(() => {
    setScreen(SCREENS.KNOWLEDGE_CHECK);
  }, []);

  const handleKnowledgeCheckBeginner = useCallback(() => {
    // Path B — assign skills, no diagnostic
    setPath("B");
    const additional = getAdditionalStages(goal, year).filter((s) => s !== "dsa");
    const fullRoadmap =
      goal === "dsa"
        ? [...SKILL_ORDER, "dsa", ...additional]
        : [...SKILL_ORDER, ...additional];
    setRoadmap(fullRoadmap);
    setDiagnosticResults(null);
    setScreen(SCREENS.ROADMAP_RESULT);
  }, [goal, year]);

  const handleKnowledgeCheckKnows = useCallback(() => {
    // Path C — run the diagnostic
    setScreen(SCREENS.DIAGNOSTIC);
  }, []);

  const handleDiagnosticComplete = useCallback((answers) => {
    // Classify answers → build roadmap
    const results = classifyFreePathSkills(answers);
    const finalRoadmap = buildFreeRoadmap(results);

    // Edge case: if classifier excluded everything somehow, put all skills back in
    const baseRoadmap =
      finalRoadmap.length > 0 ? finalRoadmap : [...SKILL_ORDER];

    setPath("C");
    setDiagnosticResults(results);
    const additional = getAdditionalStages(goal, year).filter((s) => s !== "dsa");
    const combined =
      goal === "dsa"
        ? (baseRoadmap.includes("dsa")
            ? [...baseRoadmap, ...additional]
            : [...baseRoadmap, "dsa", ...additional])
        : [...baseRoadmap.filter((s) => s !== "dsa"), ...additional];
    setRoadmap(combined);
    setScreen(SCREENS.REVEAL);
  }, [goal, year]);

  const handleRevealNext = useCallback(() => {
    setScreen(SCREENS.ROADMAP_RESULT);
  }, []);



  // ponytail: same map as streak/page.js — skills routing
  const LESSON_ROUTES = {
    git: '/home/roadmaps/git-github/interactive-overviews/first-overview',
    python: '/home/roadmaps/python-beginner',
    dsa: '/home/roadmaps/dsa',
  }

  // ponytail: skill → roadmap route ID mapping
  const SKILL_TO_ROADMAP_ID = {
    git: "git-github",
    python: "python-beginner",
    prompt: "prompt-engineering",
    system_design: "system-design-fundamentals",
    dsa: "dsa",
  };

  const handleRoadmapResultContinue = useCallback(async () => {
    // Persist onboarding result before auth so it survives the auth flow
    try {
      localStorage.setItem(
        "ignitio:onboarding_result",
        JSON.stringify({
          goal,
          year,
          path,
          roadmap,
          diagnosticResults,
          completedAt: new Date().toISOString(),
        }),
      );
      // Durable filter key — never cleared by syncOnboardingFromLocalStorage.
      // Dashboard reads this to show only the user's assigned roadmaps.
      if (roadmap?.length) {
        const roadmapIds = roadmap.map(s => SKILL_TO_ROADMAP_ID[s]).filter(Boolean);
        localStorage.setItem("ignitio:assigned_roadmaps", JSON.stringify(roadmapIds));
      }
      // Set streak phase so /onboarding/streak shows StreakAnticipation
      localStorage.setItem("ignitio:streak_phase", "anticipated");
      // Write lesson href separately — survives syncOnboardingFromLocalStorage clearing onboarding_result
      const firstSkill = roadmap?.[0] || 'python'
      localStorage.setItem("ignitio:streak_lesson_href", LESSON_ROUTES[firstSkill] ?? '/home/roadmaps/python-beginner')
    } catch {
      // ignore
    }

    clearPersisted();
    // Route to existing auth flow, or directly activate if already authenticated
    if (user) {
      try {
        const idToken = await user.getIdToken();
        const { deriveScheduleFromBrowser } =
          await import("@/lib/onboarding/schedule-periods");
        const { syncOnboardingFromLocalStorage } =
          await import("@/lib/onboarding/sync-localstorage");

        const derived = deriveScheduleFromBrowser();
        await syncOnboardingFromLocalStorage(idToken);

        await fetch("/api/v2/onboarding/role-schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role: "student",
            schedule: {
              timezone: derived.timezone,
              windows: [
                {
                  period: derived.period,
                  startTime: derived.startTime,
                  endTime: derived.endTime,
                },
              ],
            },
          }),
        });

        await fetch("/api/v2/onboarding/activate", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        });

        // → Streak anticipation screen before entering the roadmap
        window.location.href = "/onboarding/streak";
      } catch (err) {
        // Fallback if anything fails
        window.location.href = "/onboarding/streak";
      }
    } else {
      window.location.href = "/auth/signup";
    }
  }, [
    goal,
    year,
    path,
    roadmap,
    diagnosticResults,
    router,
    user,
  ]);

  // ── Screen rendering ─────────────────────────────────────────────────────────

  if (screen === SCREENS.YEAR) {
    return <YearScreen onNext={handleYear} />;
  }

  if (screen === SCREENS.GOAL) {
    return (
      <GoalScreen onNext={handleGoal} onBack={() => setScreen(SCREENS.YEAR)} />
    );
  }

  if (screen === SCREENS.SHORTCUT) {
    return (
      <ShortcutScreen
        onFastTrack={handleShortcutFastTrack}
        onSeeBasics={handleShortcutSeeBasics}
        onBack={() => setScreen(SCREENS.GOAL)}
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
    return (
      <RevealScreen results={diagnosticResults} onNext={handleRevealNext} />
    );
  }

  if (screen === SCREENS.ROADMAP_RESULT && roadmap) {
    return (
      <MonthRoadmapResult
        roadmap={roadmap}
        path={path}
        goal={goal}
        onContinue={handleRoadmapResultContinue}
        onBack={() => setScreen(path === "C" ? SCREENS.REVEAL : SCREENS.KNOWLEDGE_CHECK)}
      />
    );
  }

  // Fallback — should not be reached in normal flow
  return <YearScreen onNext={handleYear} />;
}
